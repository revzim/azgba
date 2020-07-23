package gba

import (
	"fmt"
	"html/template"

	"gopkg.in/mgo.v2/bson"

	"github.com/dgrijalva/jwt-go"
	misc "github.com/revzim/azgba/core/gba/misc"
)

var (
	MainContext GBAContext
)

// JWTCustomClaims are custom claims; extended default claims.
type JWTCustomClaims struct {
	Name  string        `json:"name"`
	Admin bool          `json:"admin"`
	ID    bson.ObjectId `json:"id"`
	Exp   int64         `json:"exp"`
	jwt.StandardClaims
}

func init() {
	funcMap := template.FuncMap{
		"html": func(value interface{}) template.HTML {
			return template.HTML(fmt.Sprint(value))
		},
		"html2": func(value interface{}, tag string, class string, hide bool) template.HTML {
			hideStr := "display:none;"
			if !hide {
				hideStr = ""
			}
			return template.HTML(fmt.Sprintf(`<%s class="%s" style="%s">%s</%s>`, tag, class, hideStr, value, tag))
		},
		"js": func(varName string, varVal interface{}) template.JS {
			return template.JS(fmt.Sprintf(`%s = "%s"`, varName, varVal))
		},
	}
	MainContext = New(misc.Core, misc.CoreFileNames, misc.PreFrontEndFiles, misc.FrontEndFileNames, misc.GamesListStr, misc.GameTemplateStr, funcMap)
}

type GBAContext struct {
	Core              string
	CoreFileNames     []string
	PreFrontEndFiles  string
	FrontEndFileNames []string
	GamesListStr      string
	GameTemplateStr   string
	FuncMap           template.FuncMap
}

func New(corePrepend string, coreFileLocations []string, frontFilePrepend string,
	frontFileLocations []string, gamesListStr string, gameTemplateStr string,
	funcsMap template.FuncMap) GBAContext {

	return GBAContext{
		corePrepend,
		coreFileLocations,
		frontFilePrepend,
		frontFileLocations,
		gamesListStr,
		gameTemplateStr,
		funcsMap,
	}
}
