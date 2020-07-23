package gba

var (
	Core, PreFrontEndFiles, GamesListStr, GameTemplateStr string
	CoreFileNames, FrontEndFileNames                      []string
)

func init() {
	Core = "GBA/IodineGBA/core"
	CoreFileNames = []string{
		"Cartridge.js",
		"DMA.js",
		"Emulator.js",
		"Graphics.js",
		"RunLoop.js",
		"Memory.js",
		"IRQ.js",
		"JoyPad.js",
		"Serial.js",
		"Sound.js",
		"Timer.js",
		"Wait.js",
		"CPU.js",
		"Saves.js",
		"sound/FIFO.js",
		"sound/Channel1.js",
		"sound/Channel2.js",
		"sound/Channel3.js",
		"sound/Channel4.js",
		"CPU/ARM.js",
		"CPU/THUMB.js",
		"CPU/CPSR.js",
		"graphics/Renderer.js",
		"graphics/RendererShim.js",
		"graphics/RendererProxy.js",
		"graphics/BGTEXT.js",
		"graphics/BG2FrameBuffer.js",
		"graphics/BGMatrix.js",
		"graphics/AffineBG.js",
		"graphics/ColorEffects.js",
		"graphics/Mosaic.js",
		"graphics/OBJ.js",
		"graphics/OBJWindow.js",
		"graphics/Window.js",
		"graphics/Compositor.js",
		"memory/DMA0.js",
		"memory/DMA1.js",
		"memory/DMA2.js",
		"memory/DMA3.js",
		"cartridge/SaveDeterminer.js",
		"cartridge/SRAM.js",
		"cartridge/FLASH.js",
		"cartridge/EEPROM.js",
		"cartridge/GPIO.js",
	}
	PreFrontEndFiles = "js/gba"
	FrontEndFileNames = []string{
		"GBACloudSave.js",
		"GBAGUI.js",
		"GBACtx.js",
		"AudioGlueCode.js",
		"base64.js",
		"GfxGlueCode.js",
		"JoyPadGlueCode.js",
		"SavesGlueCode.js",
		"WorkerGfxGlueCode.js",
		"WorkerGlueCode.js",
		"XAudioJS/swfobject.js",
		"XAudioJS/resampler.js",
		"XAudioJS/XAudioServer.js",
	}

	GamesListStr = `{
		"advancewars":"Advance Wars",
		"advancewars2":"Advance Wars 2",
		"aladdin":"Aladdin",
		"alienhominid":"Alien Hominid",
		"bomberman_max2blue":"Bomberman Max 2 - Blue Advance",
		"bomberman_tournament":"Bomberman Tournament",
		"bubblebobble":"Bubble Bobble",
		"cg":"Card Games",
		"croket1":"Croket! - Yume no Banker Survival!",
		"croket2":"Croket! 2 - Yami no Bank to Banqueen",
		"croket3":"Croket! 3 - Granu Oukoku no Nazo",
		"croket4":"Croket! 4 - Bank no Mori no Mamorigami",
		"digimon_racing":"Digimon Racing",
		"dbz_supersonic":"Dragon Ball Z - Supersonic Warriors",
		"drilldozer":"Drill Dozer",
		"earthwormjim":"Earthworm Jim",
		"earthwormjim2":"Earthworm Jim 2",
		"ff1and2":"Final Fantasy 1 & 2 Advance",
		"ff4S":"Final Fantasy IV Advance (Sound Restoration Mod)",
		"ff6":"Final Fantasy VI Advance",
		"final_fantasy_tactics":"Final Fantasy Tactics Advance",
		"fire_emblem":"Fire Emblem",
		"frogger1":"Frogger Advance - The Great Quest",
		"frogger2":"Frogger's Adventures - Temple of the Frog",
		"frogger3":"Frogger's Adventures 2 - The Lost Wand",
		"fzero_gp":"F-Zero - GP Legend",
		"fzero_max":"F-Zero - Maximum Velocity",
		"gamewatch4":"Game & Watch Gallery 4",
		"goldensun":"Golden Sun",
		"gunstar_super_heroes":"Gunstar Super Heroes",
		"hamtaro_heartbreak":"Hamtaro - Ham-Ham Heartbreak",
		"kirbymirror":"Kirby & The Amazing Mirror",
		"kirbynightmare":"Kirby: Nightmare in Dreamland",
		"mariokart":"Mario Kart: Super Circuit",
		"marioparty":"Mario Party Advance",
		"mariopinball":"Mario Pinball Land",
		"megamanbass":"Megaman & Bass",
		"megaman_battle1":"Megaman Battle Network 1",
		"megaman_battle2":"Megaman Battle Network 2",
		"megaman_battle3_blue":"Megaman Battle Network 3 Blue",
		"megaman_battle4_blue":"Megaman Battle Network 4 Blue Moon",
		"megaman_battle4_red":"Megaman Battle Network 4 Red Sun",
		"megaman_battle5":"Megaman Battle Network 5 Team Protoman",
		"megaman_battle6":"Megaman Battle Network 6 Cybeast Falzar",
		"megaman_zero1":"Megaman Zero",
		"megaman_zero2":"Megaman Zero 2",
		"megaman_zero3":"Megaman Zero 3",
		"megaman_zero4":"Megaman Zero 4",
		"metalslug":"Metal Slug Advance",
		"metroid_fusion":"Metroid Fusion",
		"momotarou_dentetsu":"Momotarou Dentetsu G Gold Deck wo Tsukure!",
		"monopoly":"Monopoly",
		"monster_force":"Monster Force",
		"mortal_kombat":"Mortal Kombat Advance",
		"pacman_world":"Pacman World",
		"pacman_world2":"Pacman World 2",
		"pokemonflorasky":"Pokemon Flora Sky Rom Hack",
		"pokemonemerald":"Pokemon Emerald",
		"pokemongreen":"Pokemon Leaf Green",
		"mysteryred":"Pokemon Mystery Dungeon Red",
		"pg":"Puzzle Games",
		"pokemonruby":"Pokemon Ruby",
		"pokemonsapphire":"Pokemon Sapphire",
		"pokemonred":"Pokemon Fire Red",
		"sonic_advance":"Sonic Advance",
		"sonic_advance2":"Sonic Advance 2",
		"sonic_advance3":"Sonic Advance 3",
		"sonicbattle":"Sonic Battle",
		"supermonkeyballjr":"Super Monkey Ball Jr",
		"superstar":"Mario & Luigi: Superstar Saga",
		"supermarioadvance":"Super Mario Advance",
		"supermarioadvance2":"Super Mario Advance 2",
		"supermarioadvance3":"Super Mario Advance 3",
		"supermarioadvance4":"Super Mario Advance 4",
		"simpsons":"The Simpsons: Road Rage",
		"sonicpinball":"Sonic Pinball",
		"super_street_fighter_2_turbo_revival":"Super Street Fighter II: Turbo Revival",
		"super_street_fighter_3_alpha":"Super Street Fighter III: Alpha",
		"tales_of_phantasia":"Tales of Phantasia",
		"tak2_staff_of_dreams":"Tak 2: The Staff of Dreams",
		"tetris_worlds":"Tetris Worlds",
		"tmnt":"Teenage Mutant Ninja Turtles",
		"sims_bustin_out":"The Sims: Bustin' Out",
		"sims2":"The Sims 2",
		"spyro_adventure":"Spyro Adventure",
		"spyro_ice":"Spyro: Season of Ice",
		"spyro_flame":"Spyro 2: Season of Flame",
		"turok_evolution":"Turok Evolution",
		"warioland4":"Wario Land 4",
		"wario_ware":"Wario Ware Inc",
		"zelda_past":"The Legend of Zelda: A Link to the Past",
		"zelda_minish":"The Legend of Zelda: The Minish Cap"
	}`

	GameTemplateStr = `
	<game id="" class="container">
	
		<canvas class="container-fluid" id="emulator_target" width="400" height="400">
		</canvas>
		<div id="touchControls" class="touch-controls" style="display:none;">
			<div class="l-trigger">
			<button class="btn btn-sm text-center triggers" id="touch-l">L</button>
			<div class="touch-dpad">
				<button id="touch-up" >▲</button><br>
				<button id="touch-left">◄</button>
				<button id="touch-right">►</button><br>
				<button id="touch-down">▼</button>
			</div>
			</div>
			<div class="touch-buttons">
				<button class="sm-touch" id="touch-select">SEL</button>
				<button class="sm-touch" id="touch-start">START</button>
			</div>
			<div class="r-trigger">
			<button class="btn btn-sm text-center triggers" id="touch-r">R</button>
			<div class="touch-buttons-ab">
				<button id="touch-a">A</button><br>
				<button id="touch-b">B</button>
			</div>
			</div>
		</div>
	</game>
	`

}
