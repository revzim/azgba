## AZGBA

[![Go Report Card](https://goreportcard.com/badge/github.com/revzim/azgba)](https://goreportcard.com/report/github.com/revzim/azgba)

## Project
* Simple Golang GBA webserver application implementing cloud saves for `play from where you left off` functionality.

* Play GBA games from anywhere.  With cloud saves, you can move from your phone, to your pc, to your tablet, and start exactly where you left off.

* Works in any browser (Firefox/Google Chrome/Safari/Opera/etc.) on any platform (iOS/Android/Windows/Linux/Mac/etc.). 

## Images (PC)
![Login](https://i.imgur.com/Gno5h9T.png) 
![Loaded Cloud Save](https://i.imgur.com/WPKbXMD.png)
![Playing](https://i.imgur.com/ZxB65kV.png)

## Requirements & Dependencies 
* [Golang](https://golang.org)
* [AZGBA CORE](https://github.com/revzim/azgba)
* [AZGBA Cloud Save API](https://github.com/revzim/gbapi)
* Mongodb (db)

## Install (*MAKE SURE YOUR MONGO ENVIRONMENT IS SET UP*) :
* After you set up your mongo dbs & users
* Spin up both the cloudsave api & the webapp server
* `go mod init` in both project directories
  * Golang 1.11> for GOMOMODULES
* $GOPATH/azgba => ```go run main.go :8080 ```
* $GOPATH/gbapi => ```go run main.go``` 

## How To
* GBA CONTROLS
  * Mobile
    * Tap corresponding buttons
  * Keyboard | KEYBOARD KEY - GBA BUTTON
    * X - A
    * Z - B
    * ARROW KEYS - DPAD 
    * ENTER - START
    * SELECT - SHIFT
    * A - L
    * S - R
    * 7/8 - VOL UP/DOWN
    * 3/4 - SLOW DOWN/SPEED UP EMU
    * 5 - RESET EMU SPEED
    * 6 - TOGGLE FULLSCREEN
    * P - PLAY/PAUSE
    * R - RESTART EMU


##### *Disclaimer*
* Have not touched this project in a bit, but wanted to upload it for others to use.
* I specifically have not provided the gba bios and roms because I am not sure of the legalities pertaining to roms/system bios and would rather not have to deal with bs.
* *However, If you use some google-fu and attempt to search `gba roms/bios`, you might find what you are looking for.*
* If anyone is decent at frontend/css and would like to contribute to a better touch GUI design (buttons/screen/etc.), feel free because I am a terrible designer. 

##### There is no GUI for easy account creation; however, I have provided a reference with examples within `core/api/examples.txt` with simple PUT/GET requests.

## Author
  * andy zimmelman

## Languages/Libraries/Frameworks:
* [MongoDB](https://www.mongodb.com/) `database`
* [Echo](https://echo.labstack.com/) `server framework`
* [IodineGBA](https://github.com/taisel/IodineGBA) `overhauled js gba emulator`
* [VueJS](https://vuejs.org/) `frontend`