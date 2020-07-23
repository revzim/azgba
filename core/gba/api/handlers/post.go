package handlers

import (
	"net/http"
	"strconv"

	"gopkg.in/mgo.v2"

	"github.com/labstack/echo"
	"github.com/revzim/gbapi/models"

	"gopkg.in/mgo.v2/bson"
)

func (h *Handler) CreatePost(c echo.Context) (err error) {

	// INIT USER
	ctxUser := &models.User{
		ID: bson.ObjectIdHex(userIDFromToken(c)),
	}

	// INIT POST
	post := &models.Post{
		ID:   bson.NewObjectId(),
		From: ctxUser.ID.Hex(),
	}

	// ATTEMPT BIND POST
	if err = c.Bind(post); err != nil {
		return
	}

	// VALIDATE
	if post.To == "" || post.Message == "" {
		return &echo.HTTPError{Code: http.StatusBadRequest, Message: "invalid recipient or message fields"}
	}

	// ATTEMPT FIND USER IN DB
	db := h.DB.Clone()
	defer db.Close()
	if err = db.DB(models.GBADB).C("users").FindId(ctxUser.ID).One(ctxUser); err != nil {
		if err == mgo.ErrNotFound {
			return echo.ErrNotFound
		}
		return
	}

	// SAVE POST IN DB
	if err = db.DB(models.GBADB).C("posts").Insert(post); err != nil {
		return
	}

	return c.JSON(http.StatusCreated, post)

}

func (h *Handler) FetchPost(c echo.Context) (err error) {

	// GET ID FROM TOKEN
	userID := userIDFromToken(c)

	// SIMPLE STRING CONV
	page, _ := strconv.Atoi(c.QueryParam("page"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	// DEFAULT VALS FOR VARS
	if page == 0 {
		page = 1
	}

	if limit == 0 {
		limit = 100
	}

	// ATTEMPT TO GET POSTS FROM DB
	posts := []*models.Post{}
	db := h.DB.Clone()
	if err = db.DB(models.GBADB).C("posts").
		Find(bson.M{"to": userID}).
		Skip((page - 1) * limit).
		Limit(limit).
		All(&posts); err != nil {
		return
	}

	defer db.Close()

	return c.JSON(http.StatusOK, posts)

}
