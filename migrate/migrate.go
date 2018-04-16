package migrate

import (
	"io/ioutil"
	"log"

	"github.com/go-pg/pg"
)

// SQL reads the sql and applies it in order. Forward-only. TODO - track current state
func SQL(db *pg.DB, sqlDir string) {

	files, err := ioutil.ReadDir(sqlDir)
	if err != nil {
		log.Println("couldn't read sql directory")
		panic(err)
	}

	log.Println("Running migrations...")

	for _, f := range files {
		name := f.Name()
		file, err := ioutil.ReadFile(sqlDir + name)
		if err != nil {
			log.Println(err)
		}
		_, err = db.Exec(string(file))
		if err != nil {
			log.Println(err)
		}
		log.Println("Migrated: " + name)
	}

	log.Println("Migrations completed...")
}
