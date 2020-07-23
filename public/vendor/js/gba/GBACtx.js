var GBA = new GBACtx()
function GBACtx() {
    this.GUI = new GUI()
    this.azgbaCS = new AZGBACloudSave()
    this.settings = new GBASettings()
    this.emulator = null
    // this.emulatorHandlersInit = false
}

GBACtx.prototype.initEmulatorHandlers = function() {
    //Populate settings:
    this.GUI.registerDefaultSoundSettings();
    //Initialize GBA:
    this.GUI.registerGBAHandler();
    //Initialize the timer:
    this.GUI.calculateTiming(+GBA.GUI.gui.defaults.timerRate);
    //Initialize the graphics:
    this.GUI.registerBlitterHandler();
    //Initialize the audio:
    this.GUI.registerAudioHandler();
    //Register the save handler callbacks:
    this.GUI.registerSaveHandlers();
    //Register the GUI controls.
    // registerGUIEvents();
    this.GUI.registerEvents()
    //Register GUI settings.
    this.GUI.registerSettings()

    // this.emulatorHandlersInit = true
}

GBACtx.prototype.getEmu = function() {
    if (GBA.GUI.gui.Iodine.Iodine) {
        //this.emulator = GBA.GUI.gui.Iodine.Iodine
        return GBA.GUI.gui.Iodine.Iodine
    }else {
        //this.emulator = GBA.GUI.gui.Iodine.Iodine
        return GBA.GUI.gui.Iodine
    }
}



GBACtx.prototype.saveGame = function() {
    let gbaemu = this.getEmu()
    var key = gbaemu.IOCore.cartridge.name
    if (!key){
        updateMainHeaderString("NO CART LOADED!", "alert-danger")
        return
    }
    key = key.substring(0, key.length)
    // console.log(GBA.GUI.gui.Iodine)
    var save = gbaemu.IOCore.saves.exportSave()
    
    var saveType = gbaemu.IOCore.saves.exportSaveType() | 0
    var col = "alert-danger"

    if (!save || !saveType) {
        updateMainHeaderString("NO SAVE FOUND!", col)
        return
    }
   
    
    if (!key) {
        updateMainHeaderString("NO SAVE AVAILABLE YET!", col)
    } else {
        // SAVE GAME LOCALLY
        ExportSaveCallback(key, save);
        ExportSaveCallback("TYPE_"+key, [saveType | 0]);
        
        // TRY TO CLOUD SAVE
        GBA.azgbaCS.cloudSaveGame(key, save)
        
    }
    

}

GBACtx.prototype.hasSave = function() {
    let gbaemu = this.getEmu()
    let key = "SAVE_"+gbaemu.IOCore.cartridge.name
    key = key.substring(0, key.length)
    var keys = getSavesKeys()
    // console.log("hasSave:", key)
    let hasKey = false
    keys.forEach(k=>{
        // console.log(k)
        if (k === key) {
            hasKey = true
        }
    })
    return hasKey
}

GBACtx.prototype.findKey = function() {
    let gbaemu = this.getEmu()
    let key = "SAVE_"+gbaemu.IOCore.cartridge.name
    key = key.substring(0, key.length)
    var keys = getSavesKeys()
    keys.forEach(k=>{
        if (k === key) {
            var dlBtn = document.getElementById("saveDLBtn")
            dlBtn.href = "data:application/octet-stream;base64," + base64(generateBlob(k, findValue(k)))
            // console.log(findValue(k))
            // console.log(base64(generateBlob(k, findValue(k))))
            var saveType = gbaemu.IOCore.saves.exportSaveType() | 0
            dlBtn.download = key + "_" + ((new Date()).getTime()) + ".export"
            // dlBtn.download = key + "_" + arrayToBase64([saveType | 0]) + ".export"
            return
        }
        
    })
}

GBACtx.prototype.importUserSave = function(file) {
    // console.log(file)
    let parent = this
    let gbaemu = this.getEmu()
    console.log(gbaemu)
    var saveType = gbaemu.IOCore.saves.exportSaveType() | 0
    try {
        //Gecko 1.9.2+ (Standard Method)
        var binaryHandle = new FileReader();
        binaryHandle.onload = function () {
            if (this.readyState == 2) {
                try {
                    import_save(this.result);
                    
                    const key = "TYPE_"+gbaemu.IOCore.cartridge.name
                    ExportSaveCallback(key, arrayToBase64([saveType | 0]))
                    if (GBA.GUI.gui.Iodine.Iodine) {
                        console.log("CHROME WEB WORKER!")
                        // console.log("CHROME WEB WORKER!:" , GBA.GUI.gui.Iodine.Iodine)
                        // updateMainHeaderString("CHROME FAILS!", "alert-danger")
                        
                        GBA.GUI.gui.Iodine.Iodine.stop()
                        GBA.GUI.gui.Iodine.Iodine.importSave()
                        GBA.GUI.gui.Iodine.Iodine.play()
                    }else {
                        GBA.GUI.gui.Iodine.stop()
                        GBA.GUI.gui.Iodine.importSave()
                        GBA.GUI.gui.Iodine.play()
                        updateMainHeaderString("cloud save imported.");
                    }
                }
                catch (error) {
                    console.log(error.message + " file: " + error.fileName + " line: " + error.lineNumber)
                    updateMainHeaderString(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
                }
            }
            else {
                updateMainHeaderString("importing file, please wait...");
                
            }
        }
        binaryHandle.readAsBinaryString(file);
    }
    catch (error) {
        //Gecko 1.9.0, 1.9.1 (Non-Standard Method)
        
        try {
            var romImageString = file.getAsBinary();
            import_save(romImageString);
            
        }
        catch (error) {
            
            updateMainHeaderString(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
            // try {
            //     // import_save(base64_decode(file))
            //     // FILE LOADED FROM CLOUD SAVE!
            //     this.attemptCloudLoad(file)
            // }catch(error) {
            //     updateMainHeaderString(error.message + " file: " + error.fileName + " line: " + error.lineNumber);
            // }
        }
    }

}

GBACtx.prototype.attemptCloudLoad = function() {
    let file = GBA.azgbaCS.getCurrentCloudSave()
    // console.log("attemptCloudLoad: ", file)
    if (!file) {
        updateMainHeaderString("ERROR FETCHING CLOUD SAVE! TRY AGAIN LATER!", "alert-danger")
        return
    }
    import_save(base64_decode(file))
    let gbaemu = this.getEmu()
    
    const key = "TYPE_"+gbaemu.IOCore.cartridge.name
    var saveType = gbaemu.IOCore.saves.exportSaveType() | 0
    ExportSaveCallback(key, arrayToBase64([saveType | 0]))
    let str = "SAVE IMPORTED & LOADED FROM CLOUD!"
    let col = "alert-success"
    if (GBA.GUI.gui.Iodine.Iodine) {
        // console.log("CHROME!")
        // console.log("CHROME WEB WORKER!:" , GBA.GUI.gui.Iodine.Iodine)
        // updateMainHeaderString("CHROME FAILS!", "alert-danger")
        
        GBA.GUI.gui.Iodine.Iodine.stop()
        GBA.GUI.gui.Iodine.Iodine.importSave()
        GBA.GUI.gui.Iodine.Iodine.play()
        updateMainHeaderString(str, col);
    }else {
        GBA.GUI.gui.Iodine.stop()
        GBA.GUI.gui.Iodine.importSave()
        GBA.GUI.gui.Iodine.play()
        updateMainHeaderString(str, col);
    }
}

function GBASettings() {
    this.gbaFullyLoaded = false
    
}

//Some wrappers and extensions for non-DOM3 browsers:
function removeChildNodes(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function didNotEnter(oElement, event) {
    var target = (typeof event.target != "undefined") ? event.target : event.srcElement;
    while (target) {
        if (isSameNode(target, oElement)) {
            return false;
        }
        target = target.parentElement;
    }
	return true;
}

function isSameNode(oCheck1, oCheck2) {
	return (typeof oCheck1.isSameNode == "function") ? oCheck1.isSameNode(oCheck2) : (oCheck1 === oCheck2);
}

function addEvent(sEvent, oElement, fListener) {
    try {
        oElement.addEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.attachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}
function removeEvent(sEvent, oElement, fListener) {
    try {
        oElement.removeEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.detachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}