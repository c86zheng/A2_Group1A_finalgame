const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  interact: false
};

let levelMaps = {};
let startMap;
let tilesetTsx;
let playerTsx;
let tilesetImage;
let playerImage;
let startImage;
let controlsImage;
let winImage;
let storyVideo;
let storyAudio;
let bgm;
let buttonSound;
let jumpSound;
let optionsSound;
let startscreenSound;
let bookSound;
let winSound;
let game;
let saveManager;

function preload() {
  startMap = loadJSON(GAME_CONFIG.startMapPath);
  for (const [levelName, mapPath] of Object.entries(GAME_CONFIG.levelRegistry)) {
    levelMaps[levelName] = loadJSON(mapPath);
  }
  tilesetTsx = loadStrings(GAME_CONFIG.tilesetTsxPath);
  playerTsx = loadStrings(GAME_CONFIG.playerTsxPath);
  tilesetImage = loadImage(GAME_CONFIG.tilesetImagePath);
  playerImage = loadImage(GAME_CONFIG.playerImagePath);
  startImage = loadImage(GAME_CONFIG.startImagePath);
  controlsImage = loadImage(GAME_CONFIG.controlsImagePath);
  winImage = loadImage(GAME_CONFIG.winImagePath);
  bgm = loadSound(GAME_CONFIG.bgmPath);
  buttonSound = loadSound(GAME_CONFIG.buttonSoundPath);
  jumpSound = loadSound(GAME_CONFIG.jumpSoundPath);
  optionsSound = loadSound(GAME_CONFIG.optionsSoundPath);
  startscreenSound = loadSound(GAME_CONFIG.startScreenSoundPath);
  bookSound = loadSound(GAME_CONFIG.bookSoundPath);
  winSound = loadSound(GAME_CONFIG.winSoundPath);
}

/** Initializes p5, parses tileset metadata, and creates the game instance. */
function setup() {
  const canvas = createCanvas(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  canvas.parent("canvas-holder");
  noSmooth();
  saveManager = new ChromasightSaveData();
  storyVideo = createVideo([GAME_CONFIG.storyVideoPath]);
  storyVideo.hide();
  storyVideo.volume(0);
  storyVideo.elt.muted = true;
  storyVideo.elt.preload = "auto";
  storyVideo.elt.addEventListener("ended", handleStoryEnded);
  storyAudio = new Audio(GAME_CONFIG.storyAudioPath);
  storyAudio.preload = "auto";

  if (bgm) bgm.setVolume(GAME_CONFIG.bgmVolume);
  if (buttonSound) buttonSound.setVolume(GAME_CONFIG.buttonSoundVolume);
  for (const sound of [jumpSound, optionsSound, startscreenSound, bookSound, winSound]) {
    if (sound) sound.setVolume(GAME_CONFIG.soundEffectVolume);
  }
  if (storyAudio) storyAudio.volume = GAME_CONFIG.soundEffectVolume;

  game = new ChromasightGame({
    startMap,
    map: levelMaps.level_1,
    maps: levelMaps,
    tilesetMeta: parseTileset(tilesetTsx.join("\n")),
    playerMeta: parseTileset(playerTsx.join("\n")),
    tilesetImage,
    startImage,
    controlsImage,
    winImage,
    storyVideo,
    playerImage,
    saveManager
  });
  window.game = game;
  window.chromasightConfig = GAME_CONFIG;
  window.chromasightSave = saveManager;
}

/** Main p5 render loop. */
function draw() {
  background(GAME_CONFIG.modeBackgroundMap[game?.mode] || "#969696");
  game.update(input);
  game.draw();
}

function mousePressed() {
  if (game.handleMousePressed(mouseX, mouseY)) return false;
}

function keyPressed() {
  if (game.scene === "story") {
    if (key === " ") {
      toggleStoryPlayback();
      return false;
    }

    if (key === "Escape") {
      game.returnToStartScreen();
      return false;
    }

    if (keyCode === BACKSPACE || keyCode === ENTER) {
      game.skipStory();
      return false;
    }

    return false;
  }

  if (key === "Escape" && game.scene !== "start") {
    game.returnToStartScreen();
    return false;
  }

  if (game.scene === "controls") {
    if (key === " " || keyCode === BACKSPACE || keyCode === ENTER) {
      game.returnToStartScreen();
      return false;
    }
    return false;
  }

  if (game.scene === "win") {
    if (key === " " || keyCode === BACKSPACE || keyCode === ENTER) {
      game.returnToStartScreen();
      return false;
    }
    return false;
  }

  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) input.left = true;
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) input.right = true;
  if (key === "s" || key === "S" || keyCode === DOWN_ARROW) input.down = true;
  if (keyCode === SHIFT) input.interact = true;

  if (key === "w" || key === "W" || keyCode === UP_ARROW || key === " ") {
    input.up = true;
    if (game.tryJump()) playJumpSound();
    return false;
  }

  if (key === "f" || key === "F") {
    if (game.getActivePortal()) game.usePortal();
    return false;
  }

  if (key === "q" || key === "Q") {
    game.switchMode(-1);
    return false;
  }

  if (key === "e" || key === "E") {
    game.switchMode(1);
    return false;
  }

  if (key === "c" || key === "C") {
    game.toggleCollisionDebug();
    return false;
  }

  if (key === "p" || key === "P") {
    game.resetSaveProgress();
    return false;
  }

  if (game.showCollisionDebug && ["1", "2", "3", "4", "5"].includes(key)) {
    if (["1", "2", "3"].includes(key)) {
      game.loadLevel(`level_${key}`, GAME_CONFIG.defaultSpawnName);
      game.setMessage(`Debug jump: level ${key}`);
    } else if (key === "4") {
      game.beginStory(game.currentLevelName, game.currentRespawnName || null);
    } else if (key === "5") {
      game.triggerWin();
    }
    return false;
  }
}

/** Plays the UI click sound after key-style collectibles are picked up. */
function playButtonSound() {
  if (!buttonSound) return;
  if (buttonSound.isPlaying()) buttonSound.stop();
  buttonSound.play();
}

/** Plays the jump sound when the player starts a jump. */
function playJumpSound() {
  if (!jumpSound) return;
  if (jumpSound.isPlaying()) jumpSound.stop();
  jumpSound.play();
}

/** Plays the controls screen sound while the controls screen is shown. */
function playOptionsSound() {
  if (!optionsSound) return;
  if (optionsSound.isPlaying()) optionsSound.stop();
  optionsSound.play();
}

/** Plays the start screen sound while the start screen is shown. */
function playStartscreenSound() {
  if (!startscreenSound) return;
  if (startscreenSound.isPlaying()) startscreenSound.stop();
  startscreenSound.play();
}

/** Starts the story video and audio from the beginning. */
function playStoryMedia() {
  stopMenuSounds();
  if (bgm && bgm.isPlaying()) bgm.stop();

  if (storyVideo?.elt) {
    storyVideo.elt.currentTime = 0;
    storyVideo.elt.play().catch(() => {});
  }

  if (storyAudio) {
    storyAudio.currentTime = 0;
    storyAudio.play().catch(() => {});
  }
}

/** Pauses the story media without rewinding. */
function pauseStoryMedia() {
  if (storyVideo?.elt) storyVideo.elt.pause();
  if (storyAudio) storyAudio.pause();
}

/** Stops the story media and rewinds to the beginning. */
function stopStoryMedia() {
  if (storyVideo?.elt) {
    storyVideo.elt.pause();
    storyVideo.elt.currentTime = 0;
    storyVideo.hide();
  }

  if (storyAudio) {
    storyAudio.pause();
    storyAudio.currentTime = 0;
  }
}

/** Toggles the story media between play and pause. */
function toggleStoryPlayback() {
  if (!storyVideo?.elt) return;

  if (storyVideo.elt.paused) {
    playStoryMedia();
  } else {
    pauseStoryMedia();
  }
}

function handleStoryEnded() {
  if (game?.scene !== "story") return;
  game.skipStory();
}

/** Plays the book pickup sound when a book is collected. */
function playBookSound() {
  if (!bookSound) return;
  if (bookSound.isPlaying()) bookSound.stop();
  bookSound.play();
}

/** Plays the win sound once when all books are collected. */
function playWinSound() {
  if (!winSound) return;
  if (winSound.isPlaying()) winSound.stop();
  winSound.play();
}

function stopMenuSounds() {
  for (const sound of [startscreenSound, optionsSound]) {
    if (sound && sound.isPlaying()) sound.stop();
  }
}

/** Starts the background music after the game leaves the start screen. */
function playBgm() {
  if (!bgm || bgm.isPlaying()) return;
  stopMenuSounds();
  bgm.play();
  bgm.setLoop(true);
}

function keyReleased() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) input.left = false;
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) input.right = false;
  if (key === "w" || key === "W" || keyCode === UP_ARROW || key === " ") input.up = false;
  if (key === "s" || key === "S" || keyCode === DOWN_ARROW) input.down = false;
  if (keyCode === SHIFT) input.interact = false;
}
