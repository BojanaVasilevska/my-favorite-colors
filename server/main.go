package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/bojanavasilevska/my-favorite-colors/models"
	"github.com/bojanavasilevska/my-favorite-colors/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

type Color struct {
	Title string `json:"title"`
}

type Repository struct {
	DB *gorm.DB
}

func (r *Repository) PeekColor(context *fiber.Ctx) error {
	color := Color{}
	err := context.BodyParser(&color)
	if err != nil {
		context.Status(http.StatusUnprocessableEntity).JSON(
			&fiber.Map{"message": "request failed"})
			return err
	}

	err = r.DB.Create(&color).Error
	if err !=  nil {
		context.Status(http.StatusBadRequest).JSON(
			&fiber.Map{"message": "could not peek color"})
			return err
	}

	context.Status(http.StatusOK).JSON(
		&fiber.Map{"message": "color has been peeked"})
	return nil
}

func (r *Repository) DeleteColor(context *fiber.Ctx) error {
	colorModel := models.Colors{}
	id := context.Params("id")
	if id == "" {
		context.Status(http.StatusInternalServerError).JSON(&fiber.Map{
			"message": "id cannot be empty",
		})
		return nil
	}

	err :=  r.DB.Delete(colorModel, id)
	if err.Error != nil {
		context.Status(http.StatusBadRequest).JSON(&fiber.Map{
			"message": "could not delete color",
		})
		return err.Error
	}

	context.Status(http.StatusOK).JSON(&fiber.Map{
		"message": "colors delete successfully",
	})
	return nil
} 

func (r *Repository) GetColors(context *fiber.Ctx) error {
	colorModels := &[]models.Colors{}

	err := r.DB.Find(colorModels).Error
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(
			&fiber.Map{"message": "could not peek colors"})
			return err
	}

	context.Status(http.StatusOK).JSON(&fiber.Map{
		"message": "colors fetched successfully",
		"data":colorModels,
	})
	return nil
	
}

func (r *Repository) GetColoByID(context *fiber.Ctx) error {
	id := context.Params("id")
	colorModel := &models.Colors{}
	if id == ""{
		context.Status(http.StatusInternalServerError).JSON(&fiber.Map{
			"message": "id can not be empty",
		})
		return nil
	}

	fmt.Println("the ID is", id)

	err := r.DB.Where("id = ?", id).First(colorModel).Error
	if err != nil {
		context.Status(http.StatusBadRequest).JSON(&fiber.Map{
			"message": "could not get the color",
		})
		return err
	}

	context.Status(http.StatusOK).JSON(&fiber.Map{
		"message": "color id fetched successfully",
		"data": colorModel,
	})
	return nil
}

func(r *Repository) SetupRoutes(app *fiber.App){
	api := app.Group("/api")
	api.Post("/peek_color", r.PeekColor)
	api.Delete("delete_color/:id", r.DeleteColor)
	api.Get("/get_color/:id", r.GetColoByID)
	api.Get("/colors", r.GetColors)
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(err)
	}

	config := &storage.Config{
		Host: os.Getenv("DB_HOST"),
		Port: os.Getenv("DB_PORT"),
		Password: os.Getenv("DB_PASS"),
		User: os.Getenv("DB_USER"),
		DBName: os.Getenv("DB_NAME"),
		SSLMode: os.Getenv("DB_SSLMODE"),
	}

	db, err := storage.NewConnection(config)
	if err != nil {
		log.Fatal("Could not load the database")
	}

	err = models.MigrateColors(db)
	if err != nil{
		log.Fatal("Could not migrate")
	}

	r := Repository {
		DB: db,
	}

	app := fiber.New()
	r.SetupRoutes(app)
	app.Listen(":8080")

}