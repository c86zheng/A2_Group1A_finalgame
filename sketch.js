const input = {
  left: false,
  right: false,
  up: false,
  down: false
};

let rawMap;
let startMap;
let tilesetTsx;
let playerTsx;
let tilesetImage;
let playerImage;
let startImage;
let bgm;
let buttonSound;
let game;

function preload() {
  startMap = loadJSON(GAME_CONFIG.startMapPath);
  rawMap = loadJSON(GAME_CONFIG.mapPath);
  tilesetTsx = loadStrings(GAME_CONFIG.tilesetTsxPath);
  playerTsx = loadStrings(GAME_CONFIG.playerTsxPath);
  tilesetImage = loadImage(GAME_CONFIG.tilesetImagePath);
  playerImage = loadImage(GAME_CONFIG.playerImagePath);
  startImage = loadImage(GAME_CONFIG.startImagePath);
  bgm = loadSound(GAME_CONFIG.bgmPath);
  buttonSound = loadSound(GAME_CONFIG.buttonSoundPath);
}

function setup() {
  const canvas = createCanvas(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  canvas.parent("canvas-holder");
  noSmooth();

  game = new ChromasightGame({
    startMap,
    map: rawMap,
    tilesetMeta: parseTileset(tilesetTsx.join("\n")),
    playerMeta: parseTileset(playerTsx.join("\n")),
    tilesetImage,
    startImage,
    playerImage
  });
  window.game = game;
  window.chromasightConfig = GAME_CONFIG;

  if (bgm) bgm.setVolume(GAME_CONFIG.bgmVolume);
  if (buttonSound) buttonSound.setVolume(GAME_CONFIG.buttonSoundVolume);
}

function draw() {
  background(GAME_CONFIG.modeBackgroundMap[game?.mode] || "#969696");
  game.update(input);
  game.draw();
}

function mousePressed() {
  if (game.handleMousePressed(mouseX, mouseY)) return false;
}

function keyPressed() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) input.left = true;
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) input.right = true;
  if (key === "s" || key === "S" || keyCode === DOWN_ARROW) input.down = true;

  if (key === "w" || key === "W" || keyCode === UP_ARROW) {
    input.up = true;
    if (game.getActivePortal()) {
      game.usePortal();
    } else {
      game.tryJump();
    }
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

  if (key === "r" || key === "R") {
    game.respawn("Respawned.");
    game.mode = GAME_CONFIG.initialMode;
    return false;
  }
}

function playButtonSound() {
  if (!buttonSound) return;
  if (buttonSound.isPlaying()) buttonSound.stop();
  buttonSound.play();
}

function playBgm() {
  if (!bgm || bgm.isPlaying()) return;
  bgm.play();
  bgm.setLoop(true);
}

function keyReleased() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) input.left = false;
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) input.right = false;
  if (key === "w" || key === "W" || keyCode === UP_ARROW) input.up = false;
  if (key === "s" || key === "S" || keyCode === DOWN_ARROW) input.down = false;
}
