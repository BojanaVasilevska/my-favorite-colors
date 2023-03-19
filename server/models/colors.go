package models

import "gorm.io/gorm"

type Colors struct {
	ID    uint    `gorm:"primary key;autoIncrement" json:"id"`
	Title *string `json:"title"`
}

func MigrateColors(db *gorm.DB) error {
	err := db.AutoMigrate(&Colors{})
	return err
}