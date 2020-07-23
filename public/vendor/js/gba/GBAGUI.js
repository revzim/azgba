function GUI() {
    this.gui = {
        Iodine: null,
        Blitter: null,
        coreTimerID: null,
        GUITimerID: null,
        toMap: null,
        toMapIndice: 0,
        suspended: false,
        isPlaying: false,
        startTime: (+(new Date()).getTime()),
        mixerInput: null,
        currentSpeed: [false, 0],
        defaults: {
            timerRate: 8,
            sound: true,
            volume: 1,
            skipBoot: false,
            toggleSmoothScaling: true,
            toggleDynamicSpeed: false,
            toggleOffthreadGraphics: true,
            toggleOffthreadCPU: (navigator.userAgent.indexOf('AppleWebKit') == -1 || (navigator.userAgent.indexOf('Windows NT 10.0') != -1 && navigator.userAgent.indexOf('Trident') == -1)),
            keyZonesGBA: [
                //Use this to control the GBA key mapping:
                //A:
                88,
                //B:
                90,
                //Select:
                16,
                //Start:
                13,
                //Right:
                39,
                //Left:
                37,
                //Up:
                38,
                //Down:
                40,
                //R | s:
                83,
                //L | a:
                65
            ],
            keyZonesControl: [
                //Use this to control the emulator function key mapping:
                //Volume Down:
                55,
                //Volume Up:
                56,
                //Speed Up:
                52,
                //Slow Down:
                51,
                //Reset Speed:
                53,
                //Toggle Fullscreen:
                54,
                //Play/Pause:
                80,
                //Restart:
                82
            ]
        }
    }
    this.gamepad = new Gamepad()
}

GUI.prototype.registerGBAHandler = function () {
    try {
        /*
        We utilize SharedArrayBuffer and Atomics API,
        which browsers prior to 2016 do not support:
        */
        if (typeof SharedArrayBuffer != "function" || typeof Atomics != "object") {
            throw null;
        }
        else if (!GBA.GUI.gui.defaults.toggleOffthreadCPU && GBA.GUI.gui.defaults.toggleOffthreadGraphics) {
            //Try starting Iodine normally, but initialize offthread gfx:
            GBA.GUI.gui.Iodine = new IodineGBAWorkerGfxShim();
        }
        else if (GBA.GUI.gui.defaults.toggleOffthreadGraphics) {
            //Try starting Iodine in a webworker:
            GBA.GUI.gui.Iodine = new IodineGBAWorkerShim();
            //In order for save on page unload, this needs to be done:
            // addEvent("beforeunload", window, ExportSave);
            // addEvent("pagehide", window, ExportSave);
        }
        else {
            throw null;
        }
    }
    catch (e) {
        //Otherwise just run on-thread:
        GBA.GUI.gui.Iodine = new GameBoyAdvanceEmulator();
    }
}

GUI.prototype.registerEvents = function () {
    if (!GBA.GUI.gui.Iodine) {
        console.log("registerGUIEvents: GBA.GUI.gui.Iodine is null. " + JSON.stringify(GBA.GUI.gui))
        return
    }
    GBA.GUI.gui.Iodine.attachPlayStatusHandler(this.updatePlayStatus);
    // events
    addEvent("keydown", document, keyDown);
    addEvent("keyup", document, keyUpPreprocess);
    // save on leave page
    addEvent("pagehide", window, ExportSave);
    addEvent("unload", window, ExportSave);
    addEvent("resize", window, this.resizeCanvas);
    this.resizeCanvas();
}

GUI.prototype.registerBlitterHandler = function () {
    // BLITTER VALS SPECIFIC TO ALLOW GFX SYNC
    GBA.GUI.gui.Blitter = new GfxGlueCode(240, 160);
    GBA.GUI.gui.Blitter.attachCanvas(document.getElementById("emulator_target"));
    GBA.GUI.gui.Iodine.attachGraphicsFrameHandler(GBA.GUI.gui.Blitter);
    GBA.GUI.gui.Blitter.attachGfxPostCallback(function () {
        if (GBA.GUI.gui.currentSpeed[0]) {
            console.log("Speed: " + GBA.GUI.gui.currentSpeed[1] + "%")
            // var speedDOM = document.getElementById("speed");
            // speedDOM.textContent = "Speed: " + GBA.GUI.gui.currentSpeed[1] + "%";
        }
    });
}


GUI.prototype.registerSettings = function () {
    /*
    if (GBA.GUI.gui.defaults.sound) {
        // GBA.GUI.gui.Iodine.enableAudio();
        // GBA.GUI.gui.Iodine.disableAudio()
    }
    */
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        updateMainHeaderString("Audio not currently available on mobile!", "alert-danger", 1000)
        GBA.GUI.gui.Iodine.disableAudio()
    } else {
        GBA.GUI.gui.Iodine.enableAudio();
    }

    GBA.GUI.gui.mixerInput.setVolume(GBA.GUI.gui.defaults.volume);

    GBA.GUI.gui.Iodine.toggleSkipBootROM(GBA.GUI.gui.defaults.skipBoot);

    GBA.GUI.gui.Blitter.setSmoothScaling(GBA.GUI.gui.defaults.toggleSmoothScaling);

    GBA.GUI.gui.Iodine.toggleDynamicSpeed(GBA.GUI.gui.defaults.toggleDynamicSpeed);

    GBA.GUI.gui.Iodine.toggleOffthreadGraphics(GBA.GUI.gui.defaults.toggleOffthreadGraphics);

}

GUI.prototype.calculateTiming = function (intervalRate) {
    GBA.GUI.gui.Iodine.setIntervalRate(intervalRate);
}

GUI.prototype.registerSaveHandlers = function () {
    GBA.GUI.gui.Iodine.attachSaveExportHandler(ExportSaveCallback);
    GBA.GUI.gui.Iodine.attachSaveImportHandler(ImportSaveCallback);
}

GUI.prototype.registerAudioHandler = function () {
    var Mixer = new GlueCodeMixer();
    GBA.GUI.gui.mixerInput = new GlueCodeMixerInput(Mixer);
    GBA.GUI.gui.Iodine.attachAudioHandler(GBA.GUI.gui.mixerInput);
}

GUI.prototype.registerDefaultSoundSettings = function () {
    // AUDIO DOESNT WORK ON MOBILE YET
    if (findValue("sound") === null) {
        setValue("sound", !!GBA.GUI.gui.defaults.sound);
    }
    else {
        GBA.GUI.gui.defaults.sound = !!findValue("sound");
    }
    if (findValue("volume") === null) {
        setValue("volume", +GBA.GUI.gui.defaults.volume);
    }
    else {
        GBA.GUI.gui.defaults.volume = +findValue("volume");
    }
}


GUI.prototype.isLandscape = function () {
    if (window.matchMedia("(orientation: portrait)").matches) {
        // PORTRAIT
        return false
    }
    if (window.matchMedia("(orientation: landscape)").matches) {
        // LANDSCAPE
        return true
    }
    else {
        return false
    }
}

GUI.prototype.resizeCanvas = function () {
    var container = document.getElementById("app");
    var containerHeight = container.clientHeight || container.offsetHeight || 0;
    var containerWidth = container.clientWidth || container.offsetWidth || 0;
    if (containerHeight > 0 && containerWidth > 0) {
        var canvas = document.getElementById("emulator_target");
        var maxWidth = Math.floor(containerHeight * 2);
        var maxHeight = Math.floor(containerWidth / (GBA.GUI.isLandscape() ? 1.785 : 1.15));
        var height = Math.min(maxHeight, containerHeight);
        var width = Math.min(maxWidth, containerWidth);
        // canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }
    app.toggleTouchControls(GBA.GUI.gamepad.testResize(window.innerWidth, window.innerHeight))
}

GUI.prototype.adjustCSS = function (elem) {
    if (this.isLandscape()) {
        // elem.style.top = this.gamepad.css.top.max+"%"
        // elem.style.left = this.gamepad.css.left.max+"%"
        elem.style.position = ""
    } else {
        // elem.style.top = this.gamepad.css.top.min+"%"
        // elem.style.left = this.gamepad.css.left.min+"%"
    }
}

GUI.prototype.attachBIOS = function (BIOS) {
    try {
        GBA.GUI.gui.Iodine.attachBIOS(new Uint8Array(BIOS));
    }
    catch (error) {
        GBA.GUI.gui.Iodine.attachBIOS(BIOS);
    }
}

GUI.prototype.attachROM = function (ROM) {
    try {
        GBA.GUI.gui.Iodine.attachROM(new Uint8Array(ROM));
    }
    catch (error) {
        GBA.GUI.gui.Iodine.attachROM(ROM);
    }
}

GUI.prototype.fileLoadShimCode = function (files, ROMHandler) {
    if (typeof files != "undefined") {
        if (files.length >= 1) {
            //Gecko 1.9.2+ (Standard Method)
            try {
                var binaryHandle = new FileReader();
                binaryHandle.onloadend = function () {
                    ROMHandler(this.result);
                }
                binaryHandle.readAsArrayBuffer(files[files.length - 1]);
            }
            catch (error) {
                try {
                    var result = files[files.length - 1].getAsBinary();
                    var resultConverted = [];
                    for (var index = 0; index < result.length; ++index) {
                        resultConverted[index] = result.charCodeAt(index) & 0xFF;
                    }
                    ROMHandler(resultConverted);
                }
                catch (error) {
                    alert("Could not load the processed ROM file!");
                }
            }
        }
    }
}


function Gamepad() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.css = {
        top: this.resizer(70, 80),
        left: this.resizer(10, 5),
        maxSize: { width: 1024, height: 1366 },
    }
    this.btnNameMap = {
        "a": 0,
        "b": 1,
        "select": 2,
        "start": 3,
        "right": 4,
        "left": 5,
        "up": 6,
        "down": 7,
        "r": 8,
        "l": 9
    }
}

Gamepad.prototype.initKeybinds = function (children) {
    this.elems = children
    for (let i = 0; i < this.elems.length; i++) {
        let keyVal = this.btnNameMap[this.elems[i].id.split("-")[1]]
        // console.log("touch-"+app.btnNames[i])
        this.elems[i].addEventListener("touchstart", function () {
            GBA.GUI.gui.Iodine.keyDown(keyVal);
        }, false)
        this.elems[i].addEventListener("touchend", function () {
            GBA.GUI.gui.Iodine.keyUp(keyVal);
        }, false)
    }
}


Gamepad.prototype.testResize = function (width, height) {
    this.width = width
    this.height = height
    if (this.width <= this.css.maxSize.width && this.height <= this.css.maxSize.height) {
        return true
    }
    return false
}

Gamepad.prototype.resizer = function (min, max) {
    // helper for screen resizing
    return {
        min: min,
        max: max
    }

}

GUI.prototype.initTimer = function () {
    GBA.GUI.gui.Iodine.setIntervalRate(+GBA.GUI.gui.defaults.timerRate);
    GBA.GUI.gui.coreTimerID = setInterval(function () {
        GBA.GUI.gui.Iodine.timerCallback(((+(new Date()).getTime()) - (+GBA.GUI.gui.startTime)) >>> 0);
    }, GBA.GUI.gui.defaults.timerRate | 0);
}

GUI.prototype.startTimer = function () {
    GBA.GUI.gui.coreTimerID = setInterval(function () {
        GBA.GUI.gui.Iodine.timerCallback(((+(new Date()).getTime()) - (+GBA.GUI.gui.startTime)) >>> 0);
    }, GBA.GUI.gui.defaults.timerRate | 0);
}

GUI.prototype.updatePlayStatus = function (isPlaying) {
    isPlaying = isPlaying | 0;
    if ((isPlaying | 0) == 1) {
        if (!GBA.GUI.gui.coreTimerID) {
            GBA.GUI.startTimer();
        }
        GBA.GUI.gui.isPlaying = true;
    }
    else {
        if (GBA.GUI.gui.coreTimerID) {
            clearInterval(GBA.GUI.gui.coreTimerID);
            GBA.GUI.gui.coreTimerID = null;
        }
        GBA.GUI.gui.isPlaying = false;
    }
}

// function updateTimer(newRate) {
// 	newRate = newRate | 0;
// 	if ((newRate | 0) != (GBA.GUI.gui.defaults.timerRate | 0)) {
// 		GBA.GUI.gui.defaults.timerRate = newRate | 0;
// 		GBA.GUI.gui.Iodine.setIntervalRate(+GBA.GUI.gui.defaults.timerRate);
// 		if (GBA.GUI.gui.isPlaying) {
// 			if (GBA.GUI.gui.coreTimerID) {
// 				clearInterval(GBA.GUI.gui.coreTimerID);
// 			}
// 			GUI.initTimer();
// 		}
// 	}
// }

