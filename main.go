package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"os"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"

	gba "github.com/revzim/azgba/core/gba"
)

var (
	// kTokenExpTime      time.Duration
	kJWTSecret         []byte
	kGBACtx            gba.GBAContext
	kAcceptedClientIDs []string
)

func init() {
	// kTokenExpTime = 3
	kJWTSecret = []byte("SECRETKEY1")
	kGBACtx = gba.MainContext
	kAcceptedClientIDs = []string{
		"jon",
		"dz1",
		"mz1",
		"az1",
		"cz1",
		"rz1",
	}
}

func jwtTokenParseClaims(tokenString string) (*jwt.Token, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return kJWTSecret, nil
	})
	// handle err
	if err != nil {
		fmt.Println("\nToken parsewithclaims failed", token, err)
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		fmt.Println("\nID FROM PARSED CLAIMS: ", claims["id"])

	} else {
		fmt.Println("\nError in token: ", claims, token.Valid)
		return nil, fmt.Errorf("error: %+v: %b", claims, token.Valid)
	}
	return token, nil
}

func signin(c echo.Context) error {
	m := make(map[string]interface{})

	m["Form"] = map[string]interface{}{
		"HashBlock":       "TESTHASH",
		"LoginVals":       []string{"email", "password"},
		"BtnSubmitString": "SUBMIT",
	}
	// m["TokenExpTime"] = fmt.Sprintf("%d", kTokenExpTime)

	formatScriptJS := func(base string, fName string) string {
		return fmt.Sprintf(`<script src="/%s/%s"></script>`, base, fName)
	}

	gbaMap := make(map[string]interface{})

	files := formatScriptJS("GBA/IodineGBA/includes", "TypedArrayShim.js")
	for _, fileName := range kGBACtx.CoreFileNames {
		files += formatScriptJS(kGBACtx.Core, fileName)
		// filesArr = append(filesArr, fmt.Sprintf("/%s/%s", core, fileName))
	}
	for _, fileName := range kGBACtx.FrontEndFileNames {
		files += formatScriptJS(kGBACtx.PreFrontEndFiles, fileName)
	}

	gbaMap["FileNames"] = files

	gbaMap["SelectedGameText"] = "Select a game!"

	gbaMap["BIOSURL"] = "/auth/files/bios/gba_bios.bin"

	m["GBA"] = gbaMap

	fms := template.FuncMap{
		"html": func(value interface{}) template.HTML {
			return template.HTML(fmt.Sprint(value))
		},
		"html2": func(value interface{}, str string) template.HTML {
			return template.HTML(fmt.Sprintf("%s/%s", str, value))
		},
	}

	template, err := template.New(fmt.Sprintf("%s.html", "login")).Funcs(fms).ParseFiles("public/templates/login.html")

	if err != nil {
		fmt.Println("ERROR=>", err)
	}

	return template.Execute(c.Response().Writer, m)
}

func login(c echo.Context) error {
	// username := c.FormValue("username")
	// Throws unauthorized error
	// isAccepted := false
	// for _, id := range kAcceptedClientIDs {
	// if id == username {
	// isAccepted = true
	// break
	// }
	// }
	// if !isAccepted {
	// return echo.ErrUnauthorized
	// }
	// Set custom claims
	// claims := &gba.JWTCustomClaims{
	// 	username,
	// 	true,
	// 	"",
	// 	jwt.StandardClaims{
	// 		ExpiresAt: time.Now().Add(time.Second * kTokenExpTime).Unix(),
	// 	},
	// }

	// // Create token with claims
	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// // Generate encoded token and send it as response.
	// t, err := token.SignedString(kJWTSecret)
	// if err != nil {
	// 	return err
	// }
	// c.Response().Header().Set("Authorization", "Bearer "+t)
	// c.Set("token", t)
	// return c.HTML(http.StatusOK, "<p class='text-dark'>"+t+"</p>")

	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(*gba.JWTCustomClaims)
	id := claims.ID
	exp := claims.Exp
	gamesListMap := make(map[string]string)

	gamesListRaw := json.RawMessage(kGBACtx.GamesListStr)

	gamesListBytes, err := gamesListRaw.MarshalJSON()

	if err != nil {
		fmt.Println("Err", err)
	}

	err = json.Unmarshal(gamesListBytes, &gamesListMap)

	c.Response().Header().Set("Authorization", "Bearer "+user.Raw)

	return c.JSON(http.StatusOK, echo.Map{
		// "token": t,
		"games": gamesListMap,
		"id":    id,
		"exp":   exp,
	})
}

func handleRestricted(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	_, err := jwtTokenParseClaims(user.Raw)
	if err != nil {
		return echo.ErrUnauthorized
	}

	claims := user.Claims.(*gba.JWTCustomClaims) //(jwt.MapClaims)
	id := claims.ID                              //["name"]

	fmt.Println("handleRestriced: name | token | qparams ==>", id)
	c.Response().Header().Set("Authorization", "Bearer "+user.Raw)
	return handleGBA(c)
}

func handleGBA(c echo.Context) error {
	game := c.Param("name")

	m := make(map[string]interface{})
	m["OK"] = true

	m["JSList"] = ``

	m["GameName"] = game

	m["Game"] = kGBACtx.GameTemplateStr

	template := template.New("gba.html").Funcs(kGBACtx.FuncMap)

	_, err := template.ParseFiles("public/templates/gba.html")

	if err != nil {
		fmt.Println("ERROR=>", err)
	}

	return template.Execute(c.Response().Writer, m)
}

func handleFiles(c echo.Context) error {
	// token := c.Get("user")
	user := c.Get("user").(*jwt.Token)

	_, err := jwtTokenParseClaims(user.Raw)
	if err != nil {
		return echo.ErrUnauthorized
	}
	claims := user.Claims.(*gba.JWTCustomClaims) //(jwt.MapClaims)
	id := claims.ID                              //["name"]

	fmt.Println("handleFiles: name ==>", id)
	path := c.Param("id")
	fileName := c.Param("name")
	filePath := fmt.Sprintf("private/%s/%s", path, fileName)
	// fmt.Println("DOWNLOAD FILE LINK:", filePath)
	return c.File(filePath)
}

func main() {
	e := echo.New()

	// Static js/css/fonts/etc files
	e.Static("/", "public/vendor")

	// Logger Middleware

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "method=${method}, uri=${uri}, status=${status}\n",
	}))

	// Recover Middleware
	e.Use(middleware.Recover())

	// Unauthenticated route
	e.GET("/", signin)

	// Restricted group
	r := e.Group("/auth")

	// Configure middleware with the custom claims type
	config := middleware.JWTConfig{
		Claims:     &gba.JWTCustomClaims{},
		SigningKey: kJWTSecret,
		Skipper: func(c echo.Context) bool {
			// fmt.Printf("jwtconfig path: %+v", c.Path())
			// parent := c.Param("next")
			// if c.Path() == "/auth/login" {
			// 	return true
			// }
			fmt.Println(c.Request().Header.Get("Authorization"))
			// path := c.Param("id")
			// game := c.Param("name")

			// fmt.Println("jwtconfig: path | game ==>", path, " | ", game)
			// if c.Path() == "/auth" || c.Path() == "/auth/:next/:id/:name" || c.Path() == "/auth/files/:id/:name" {
			// 	return true
			// }

			return false
		},
	}

	r.Use(middleware.JWTWithConfig(config))

	// Login route
	r.POST("/login", login)

	r.GET("", handleRestricted)

	r.GET("/files/:id/:name", handleFiles)

	e.Logger.Fatal(e.Start(os.Args[1]))
}
