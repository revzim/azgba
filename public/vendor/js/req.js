function Request(key, method, url, data, headers, cb) {
	axios({
    method: method,
    url: url,
    data: data,
    headers: headers
  })
  .then(response => {
	//handle success
	// console.log(response.data.errors)
    switch(key) {
    	case "auth_token":
			// console.log("RESP: "+JSON.stringify(response));
			//console.log("auth_token response: "+JSON.stringify(response))
		    var json = JSON.parse(JSON.stringify(response))
			var pre = json["headers"]["authorization"]
			var token = pre ? pre.substring(7,pre.length) : ""
		    cb({error: "false", code: response.status, token:token, games: response.data.games, headers: response.headers})
    		break
    	case "auth":
			console.log("auth response: "+response)
    		// console.log("auth RESP: "+JSON.stringify(response));
    		var json = JSON.parse(JSON.stringify(response))
    		// console.log("DATA: "+json)
		    var data = {data: "FAILED"}
		    if (json["data"]) {
		    	data = json["data"]
		    }
			cb({error: "false", code: response.status, data:data, headers: response.headers})
			break
		case "gba_login":
			var json = JSON.parse(JSON.stringify(response))
			cb({error: "false", code: json.status, data: json.data})
			break
		case "gba_saves":
			var json = JSON.parse(JSON.stringify(response))
			cb({error: "false", code: json.status, data: json.data})
			break
		case "gba_cloud_save":
			var json = JSON.parse(JSON.stringify(response))
			cb({error: "false", code: json.status, data: json.data})
			break
    	default:
			console.log("Unhandled response key: `"+key+"`  ==>"+response)
			cb(null)
			break
    }
  })
  .catch(error => {
	//console.log("ERROR: "+error);
	const resp = error.response
	if (resp) {
		if (resp.status !== 'undefined') {
			switch(resp.status){
				case 401:
					cb({error: "true", code: resp.status, token:"", headers: resp.headers})
					break
				case 400:
					cb({error:"true", code: resp.status, token: "", data: resp.data, headers: resp.headers})
					break
				default:
					cb({error: "true", code: resp.status, token:"", headers: resp.headers})
					break
			}
		}
		
	}else {
		console.log(error)
		cb({error:"true", code: -1, token: "", headers: {}})
	}
	
  })
}

function Get(url, token, cb) {
	// var respType = ""
	// if (url.includes("files")) {
	// 	respType = "arraybuffer"
	// }
	axios.get(url, {headers: {"Authorization": "Bearer "+token}}).then(response=>{
		// this.setState({todos: response});
		// console.log(JSON.stringify(response))
		cb(response)
	}).catch(function(error){
		console.log("Get error==>"+error);
		cb({error:"false", code: 404, token: "", headers: {}})
	})
}

function SGet(url, token, cb) {
	axios.get(url, {responseType: 'arraybuffer', headers: {"Authorization": "Bearer "+token }}).then(response=>{
		//console.log("downloadFile response==>"+response.data)
		cb(response.data)
	}).catch(function(error){
		console.log("downloadFile error==>"+error)
		cb(0)
	})
}

/*
	Get(app.biosURL, app.strings.token, function(r) {
		console.log(r.data)
		fileLoadShimCode(r.data, attachBIOS(r.data))
		Get("/auth/files/roms/"+app.selectedGame.key+".gba", app.strings.token, function(gameDL){
			fileLoadShimCode(gameDL.data, attachROM(gameDL.data))
			this.mainAlert.show = false
			GBA.settings.gbaFullyLoaded = true
			app.strings.header = app.selectedGame.val
			app.strings.gbaPlayBtn = "PLAY "+app.selectedGame.val+"!"
			
			let children = document.getElementById("touchControls").getElementsByTagName("button")
			GBA.GUI.gamepad.initKeybinds(children)
		})
	})

	app.downloadFile(app.biosURL, function(r){
		// console.log(r)
		fileLoadShimCode(r, attachBIOS(r))
		app.downloadFile("/auth/files/roms/"+app.selectedGame.key+".gba", function(gameDL){
			fileLoadShimCode(gameDL, attachROM(gameDL))
			this.mainAlert.show = false
			GBA.settings.gbaFullyLoaded = true
			app.strings.header = app.selectedGame.val
			app.strings.gbaPlayBtn = "PLAY "+app.selectedGame.val+"!"
			
			let children = document.getElementById("touchControls").getElementsByTagName("button")
			GBA.GUI.gamepad.initKeybinds(children)
		})
	})
	downloadFile: function(url, cb) {
		axios.get(url, {responseType: 'arraybuffer', headers: {"Authorization": "Bearer "+app.strings.token }}).then(response=>{
			//console.log("downloadFile response==>"+response.data)
			cb(response.data)
		}).catch(function(error){
			console.log("downloadFile error==>"+error)
			cb(0)
		})
	},
*/