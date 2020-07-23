function AZGBACloudSave() {
    this.token = ""
    this.email = ""
    this.username = ""
    this.saveName = ""
    this.save = ""
    this.apiURL = "http://"+window.location.hostname+":8081/"
    this.cloudSaves = {}
}


AZGBACloudSave.prototype.login = function(email, pw, cb) {
    // FORM DATA
    // SET EMAIL/PW
    this.email = email
    this.pw = pw
    var formData = new FormData()
    formData.set("email", this.email)
    formData.set("password", pw)
    // formData.set("username", this.username)
    var cT = 'application/json'//'multipart/form-data'
    var header = {'Content-Type': cT}
    Request("gba_login", "post", this.apiURL+"login", formData, header, function(resp) {
        //console.log("GBA_LOGIN: ", resp)
        let error = resp.error
        if (error === 'true') {
            // updateMainHeaderString("Authentication Failed!\n"+resp.data.message,"alert-danger")
            cb(null)
            return
        }
        let code = resp.code
        let data = resp.data
        this.token = data.token
        updateMainHeaderString("Authentication Success! TOKEN: "+this.token,"alert-success")
        cb(this.token)
    })
}

AZGBACloudSave.prototype.getGames = function(token) {
    this.btnSubmitStr = "ATTEMPTING FIRST AUTH LAYER.."
    this.token = token
    Request("auth_token", "post", "/auth/login", null, {'Authorization' : 'Bearer '+this.token }, function(resp) {
        //console.log("AUTH_TOKEN RESP: ", resp)
        if (resp.error === "true") {
            updateMainHeaderString(resp.code+ " : "+resp.data.message, "alert-danger")
            // app.toggleAlertVals(resp.code, resp.error)
        }else {
            updateMainHeaderString("LOGIN SUCCESS! ENJOY!", "alert-success")
            // app.toggleAlertVals(resp.code, "true")
        }
        if (resp.token) {
            if (resp.token.length > 1) {
                //console.log(resp.games)
                app.strings.games = resp.games
                app.strings.username = resp.id
                app.gamesPicker.show = true
                document.getElementById("gameChoice").required = true
                app.strings.token = resp.token
                // app.showSubmitBtn = false
                window.setTimeout(function () { 
                    app.strings.header = "Choose a GBA Game!"
                    window.document.getElementById("gameChoice").focus()
                }, 0); 
            } else {
                app.gamesPicker.show = false
            }
        }
    })
}

AZGBACloudSave.prototype.getSaves = function(token) {
    this.token = token
    var header = {'Authorization' : 'Bearer '+this.token }
    Request("gba_saves", "get", this.apiURL+"saves", {}, header, function(resp) {
        if (resp.data) {
            let code = resp.code
            // LOOP OVER SAVES
            resp.data.forEach(function(data){
                GBA.azgbaCS.cloudSaves[data.name] = new CloudSaveData(data.id, data.owner, data.name, data.save)
            })
        } else {
            console.log("gba_saves failed: ", resp)
        }
    })
    
}

function createSave(key, save) {
    var el = document.createElement('a');
    el.href = "data:application/octet-stream;base64," + base64(generateBlob(key, save))
    el.download = key + "_" + ((new Date()).getTime()) + ".export"
    document.getElementById("app").appendChild(el)
    el.click()
    el.href = ""
    document.getElementById("app").removeChild(el)
    // console.log(findValue(k))
    // console.log(base64(generateBlob(k, findValue(k))))
    var saveType = gbaemu.IOCore.saves.exportSaveType() | 0
    
}

AZGBACloudSave.prototype.hasCloudSave = function() {
    let saveName = "SAVE_"+GBA.getEmu().IOCore.cartridge.name
    if (GBA.azgbaCS.cloudSaves[saveName]){
        return true
    } else {
        return false
    }
}

AZGBACloudSave.prototype.getCurrentCloudSave = function () {
    let saveName = "SAVE_"+GBA.getEmu().IOCore.cartridge.name
    if (GBA.azgbaCS.cloudSaves[saveName]){
        return GBA.azgbaCS.cloudSaves[saveName].save
    } else {
        return null
    }
}

AZGBACloudSave.prototype.cloudSaveGame = function(key, save) {
    // console.log(key)
    key = "SAVE_"+key
    
    var blob = generateBlob(key, arrayToBase64(save))

    var b64blob = base64(blob)

    var filename = key + "_" + ((new Date()).getTime()) + ".export"

    // CREATE LOCAL FILE FROM EMU SAVE DATA
    var file = dataURLtoFile("data:application/octet-stream;base64," +b64blob, filename)
    
    var formData = new FormData()
    formData.set("save_file", file)

    var header = {"Authorization": "Bearer "+app.strings.token}
    // POST TO AUTH DOMAIN & ATTEMPT TO SAVE/UPDATE
    Request("gba_cloud_save", "post", this.apiURL+"saves/upd2/"+key, formData, header, function(resp) {
        console.log("GBA_CLOUD_SAVE: ", resp)
        if (resp.error === "false"){
            let code = resp.code
            let data = resp.data
            updateMainHeaderString("SAVE SUCCESSFULLY SYNCED W/ CLOUD!", "alert-success")
        } else {
            let code = resp.code
            if (code == 401) {
                updateMainHeaderString("GAME NOT SAVED! AUTH TOKEN EXPIRED! PLEASE RELOGIN!", "alert-danger")
                //console.log("SHOW RE-LOGIN")
                app.strings.loginAlertStr = "AUTH TOKEN EXPIRED! PLEASE RELOGIN!"
                app.strings.token = ""
                app.showSubmitBtn = true
                app.reAuthNeeded = true
                app.toggleModal(true)
                return
            }
            
        }
    })
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}


AZGBACloudSave.prototype.getCloudSaves = function() {
    return this.cloudSaves
}

function CloudSaveData(id, owner, name, save) {
    this.id = id
    this.owner = owner
    this.name = name
    this.save = save
}

CloudSaveData.prototype.getParsedName = function(){
    return this.name.substring(this.name.lastIndexOf("_")+1, this.name.length)
}
