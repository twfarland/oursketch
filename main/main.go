package main

import (
	"flag"
	"os"

	"gitlab.com/twfarland/drawsy/database"
	"gitlab.com/twfarland/drawsy/migrate"
	"gitlab.com/twfarland/drawsy/rest"
	"gitlab.com/twfarland/drawsy/socket"
)

func main() {

	// flags
	migrateFlag := flag.Bool("migrate", false, "also run migrations")
	flag.Parse()

	// Db client init
	db := database.Init(
		os.Getenv("DB_HOST"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PWD"),
	)
	if *migrateFlag {
		migrate.SQL(db, os.Getenv("SQL_DIR"))
	}
	defer db.Close()

	// Web socket init
	socket.Init()

	// Rest router init
	router := rest.Init(os.Getenv("PUBLIC_DIR"))
	router.Run(":" + os.Getenv("PORT"))
}
