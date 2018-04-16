package rest

import (

	// rate "github.com/WorkTimeAssistant/gin-limit" TODO: rate limit creation

	"github.com/gin-contrib/gzip"
	gin "github.com/gin-gonic/gin"
	m "gitlab.com/twfarland/drawsy/models"
	"gitlab.com/twfarland/drawsy/socket"
)

// DrawingGetByCode :drawingCode -> Drawing - note it uses code, not id
func DrawingGetByCode(c *gin.Context) {

	d, err := m.DrawingGetByCode(c.Param("drawingCode"))

	if err != nil {
		c.JSON(400, "failed to get drawing")
	} else {
		c.JSON(200, d)
	}
}

// DrawingCreate -> Drawing
func DrawingCreate(c *gin.Context) {

	d := m.Drawing{}
	if err := c.BindJSON(&d); err != nil {
		c.JSON(400, err)
		return
	}

	if err := d.Create(); err != nil {
		c.JSON(400, err)
	} else {
		c.JSON(200, d)
	}
}

// LineCreate -> Line
func LineCreate(c *gin.Context) {

	l := m.Line{}
	if err := c.BindJSON(&l); err != nil {
		c.JSON(400, err)
		return
	}

	if err := l.Create(); err != nil {
		c.JSON(400, err)
	} else {
		c.JSON(200, l)
	}
}

// Route applies the handlers
func Route(r *gin.Engine, publicDir string) {

	// files
	r.StaticFile("/", publicDir+"index.html")
	r.StaticFile("/bundle.js", publicDir+"bundle.js")

	// socket
	r.GET("/ws/:drawingCode", socket.Connect)

	// crud
	r.GET("/drawing/:drawingCode", DrawingGetByCode)
	r.POST("/drawing", DrawingCreate)
	r.POST("/line", LineCreate)
}

// Init the routes
func Init(publicDir string) *gin.Engine {

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	Route(r, publicDir)

	return r
}
