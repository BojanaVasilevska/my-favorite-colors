package main

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/bojanavasilevska/my-favorite-colors/models"
	"github.com/bojanavasilevska/my-favorite-colors/storage"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

// Create/Add a new color
func (r *Repository) PeekColor(c *fiber.Ctx) error {
	// Use your GORM model struct to bind request body
	color := new(models.Colors)

	if err := c.BodyParser(color); err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	// Save to DB
	if err := r.DB.Create(color).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Could not add color",
			"error":   err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Color added successfully",
		"data":    color,
	})
}

// Delete a color by ID
func (r *Repository) DeleteColor(c *fiber.Ctx) error {
	idStr := c.Params("id")
	if idStr == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "ID cannot be empty",
		})
	}

	// Convert id to uint
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid ID format",
			"error":   err.Error(),
		})
	}

	// Delete color
	if err := r.DB.Delete(&models.Colors{}, uint(id)).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Could not delete color",
			"error":   err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Color deleted successfully",
	})
}

// Get all colors
func (r *Repository) GetColors(c *fiber.Ctx) error {
	var colors []models.Colors

	if err := r.DB.Find(&colors).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Could not fetch colors",
			"error":   err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Colors fetched successfully",
		"data":    colors,
	})
}

// Get color by ID
func (r *Repository) GetColorByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	if idStr == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "ID cannot be empty",
		})
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid ID format",
			"error":   err.Error(),
		})
	}

	var color models.Colors
	if err := r.DB.First(&color, uint(id)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"message": "Color not found",
			"error":   err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Color fetched successfully",
		"data":    color,
	})
}

func (r *Repository) SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	api.Post("/peek_color", r.PeekColor)
	api.Delete("/delete_color/:id", r.DeleteColor)
	api.Get("/get_color/:id", r.GetColorByID)
	api.Get("/colors", r.GetColors)
}

func main() {
	// Load env vars from .env
	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	config := &storage.Config{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		Password: os.Getenv("DB_PASS"),
		User:     os.Getenv("DB_USER"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSLMODE"),
	}

	db, err := storage.NewConnection(config)
	if err != nil {
		log.Fatal("Could not connect to the database:", err)
	}

	if err := models.MigrateColors(db); err != nil {
		log.Fatal("Could not migrate database:", err)
	}

	repo := Repository{DB: db}

	app := fiber.New()

	// Enable CORS 
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173", 
	}))

	repo.SetupRoutes(app)

	log.Fatal(app.Listen(":8080"))
}
