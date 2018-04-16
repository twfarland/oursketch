package models

import (
	"time"

	uuid "github.com/satori/go.uuid"

	"gitlab.com/twfarland/drawsy/database"
)

// Drawing basic data
type Drawing struct {
	ID       uint64
	Code     string
	Username string
	Email    string
	Title    string
	Width    int
	Height   int
	Lines    []Line
	Created  time.Time
}

// Line in a Drawing
type Line struct {
	ID        uint64
	DrawingID uint64
	Username  string
	Colour    string
	Size      int
	Points    []XY
	Started   uint64
	Created   time.Time
}

// XY point
type XY struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// DrawingGetByCode :drawingCode - get a drawing and its lines from its unique code, not id
func DrawingGetByCode(drawingCode string) (*Drawing, error) {

	db := database.Conn

	// get drawing basics
	var drawing Drawing
	err := db.
		Model(&drawing).
		Where("code = ?", drawingCode).
		Select()

	if err != nil {
		return nil, err
	}

	// if it's more than 24 hours old, delete it, and return an error
	// lines are deleted by a postgres cascade
	/*
		expiry := drawing.Created.AddDate(0, 0, 1)
		if time.Now().After(expiry) {
			drawing.Delete()
			return nil, errors.New("drawing expired")
		}
	*/

	// get drawing lines
	var lines []Line
	db.
		Model(&lines).
		Where("drawing_id = ?", drawing.ID).
		Select()

	drawing.Lines = lines

	return &drawing, nil
}

// Create Drawing
func (d *Drawing) Create() error {
	d.Code = uuid.NewV4().String()
	db := database.Conn
	return db.Insert(d)
	// TODO: save creator email
}

// Delete Drawing
func (d *Drawing) Delete() error {
	db := database.Conn
	return db.Delete(&Drawing{ID: d.ID})
}

// Create Line
func (l *Line) Create() error {
	db := database.Conn
	return db.Insert(l)
}

// Delete Line by Username/Started
func (l *Line) Delete() error {
	db := database.Conn
	_, err := db.Model(&Line{}).
		Where("username = ?", l.Username).
		Where("started = ?", l.Started).
		Delete()
	return err
}
