package socket

import (
	"encoding/json"
	"log"

	"github.com/gin-gonic/gin"
	m "gitlab.com/twfarland/drawsy/models"
	melody "gopkg.in/olahol/melody.v1"
)

// Msg over socket - has fields from all message types
type Msg struct {
	Type     string `json:"type"`
	Username string `json:"username"`
	To       string `json:"to"`
	X        int    `json:"x"`
	Y        int    `json:"y"`
	Colour   string `json:"colour"`
	Size     int    `json:"size"`
	ID       uint64 `json:"ID"`
}

// Sock is the web socket
var Sock *melody.Melody

// Init web socket and handle messages
func Init() {

	Sock = melody.New()

	Sock.HandleConnect(func(s *melody.Session) {
		log.Println("connected")
	})

	Sock.HandleDisconnect(func(s *melody.Session) {

		// tell others user has left
		username, exists := s.Get("username")
		if exists {
			leave, _ := json.Marshal(&Msg{
				Type:     "leave",
				Username: username.(string),
			})
			Sock.BroadcastFilter(leave, OthersInRoom(s))
		}

		log.Println("disconnected")
	})

	Sock.HandleMessage(func(s *melody.Session, data []byte) {

		var msg Msg
		err := json.Unmarshal(data, &msg)
		if err != nil {
			log.Println("failed to parse message")
		}

		if msg.Type == "welcome" {
			// send to welcomed user only
			Sock.BroadcastFilter(data, OneInRoom(s, msg.To))

		} else {
			if msg.Type == "join" {
				// save name for when disconnecting
				s.Set("username", msg.Username)
			}
			if msg.Type == "delete" {
				// delete by username / id as started
				l := m.Line{Username: msg.Username, Started: msg.ID}
				l.Delete()
			}
			// send to others in room
			Sock.BroadcastFilter(data, OthersInRoom(s))
		}
	})

	log.Println("websocket initialized")
}

// OneInRoom is a filter to send to another by username in the same room
func OneInRoom(s *melody.Session, to string) func(*melody.Session) bool {
	return func(q *melody.Session) bool {
		if q.Request.URL.Path != s.Request.URL.Path { // not in room
			return false
		}
		username, exists := q.Get("username")
		if !exists {
			return false
		}
		return username.(string) == to
	}
}

// OthersInRoom is a filter to send to others in the same session url, but not the sender
func OthersInRoom(s *melody.Session) func(*melody.Session) bool {
	return func(q *melody.Session) bool {
		return q.Request.URL.Path == s.Request.URL.Path && q != s
	}
}

// Connect upgrades a gin http request to a melody websocket
func Connect(c *gin.Context) {
	Sock.HandleRequest(c.Writer, c.Request)
}
