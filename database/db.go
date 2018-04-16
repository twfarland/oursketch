package database

import (
	pg "github.com/go-pg/pg"
)

var (
	// Conn is the connection handle for the database
	Conn *pg.DB
)

// Init connects to the db
func Init(host, name, user, pwd string) *pg.DB {

	db := pg.Connect(&pg.Options{
		Database: name,
		User:     user,
		Password: pwd,
	})

	Conn = db
	return db
}
