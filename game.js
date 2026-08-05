/** @constant {number} Fixed width of the p5 canvas. */
const CANVAS_WIDTH = 960;

/** @constant {number} Fixed height of the p5 canvas. */
const CANVAS_HEIGHT = 540;

/** @constant {string} Default respawn object name used when entering a level. */
const DEFAULT_SPAWN_NAME = "Respawn_Point_01";

/** @constant {string} Gameplay mode used before the player unlocks other modes. */
const INITIAL_MODE = "colorBlindness";

/**
 * Centralized asset paths. Keep file paths here so preload and render logic do
 * not hardcode asset names inside functions.
 */
const AssetPaths = Object.freeze({
  startMap: "assets/map/Start.tmj",
  levels: Object.freeze({
    level_1: "assets/map/level_1.tmj",
    level_2: "assets/map/level_2.tmj",
    level_3: "assets/map/level_3.tmj"
  }),
  tilesetTsx: "assets/map/tiles_packed.tsx",
  playerTsx: "assets/map/robotFighter.tsx",
  tilesetImage: "assets/img/tiles_packed.png",
  playerImage: "assets/img/robotFighter.png",
  startImage: "assets/img/Start.png",
  controlsImage: "assets/img/Options.png",
  winImage: "assets/img/AllBooks.png",
  storyVideo: "assets/video/story.mp4",
  storyAudio: "assets/sound/story.mp4",
  tiledStartImageLayer: "../img/Start.png",
  bgm: "assets/sound/bgm.wav",
  buttonSound: "assets/sound/buttonon.mp3",
  jumpSound: "assets/sound/Jump.mp3",
  optionsSound: "assets/sound/Options.mp3",
  startScreenSound: "assets/sound/Startscreen.mp3",
  bookSound: "assets/sound/book.mp3",
  winSound: "assets/sound/Win.mp3"
});

/** Tile layer names exported from Tiled. */
const MapLayers = Object.freeze({
  terrain: "terrain_solid",
  decor: "decor",
  objectLayers: Object.freeze(["object", "objects"])
});

/** Object type names exported from Tiled. */
const ObjectTypes = Object.freeze({
  yellowBlock: "yellowBlock",
  cyanBlock: "cyanBlock",
  box: "box",
  hazardBlock: "HazardBlock",
  spawn: "spawn",
  portal: "portal",
  ladder: "ladder",
  key: "key",
  book: "book",
  textBox: "textBox",
  textbox: "textbox"
});

const HINT_TEXTS = Object.freeze({
  Hint_01: "Pressing Q or E seems to switch modes.",
  Hint_02: "Maybe I can hold Shift to pull that box out.",
  Hint_03: "I don’t think I can reach this book right now. I should come back later. These books seem important.",
  Hint_04: "I think I can go back and get that book now."
});

/** Base tile grid used by the map tileset. */
const TileGrid = Object.freeze({
  tileWidth: 32,
  tileHeight: 32
});

/** Sprite-grid data for the robot sheet. */
const PlayerGrid = Object.freeze({
  tileWidth: 64,
  tileHeight: 64,
  columns: 6,
  scale: 1,
  spriteBox: Object.freeze({ x: 14, y: 14, w: 30, h: 36 }),
  collisionBox: Object.freeze({ x: 0, y: 0, w: 54, h: 64 }),
  idleTileIds: Object.freeze([0, 1, 2, 3, 4, 5]),
  walkingTileIds: Object.freeze([54, 55, 56, 57])
});

/** Tile gids used for objects that are drawn from object layers. */
const TileGids = Object.freeze({
  redKey: 296,
  blueKey: 297,
  book: 317,
  box: 221,
  hazard: 248,
  modeBlocks: Object.freeze({
    yellow: 307,
    yellowMuted: 306,
    yellowBlueBlind: 308,
    cyan: 329,
    cyanMuted: 328,
    cyanRedBlind: 330
  })
});

/** Grid metadata for drawing pushable boxes from the shared tileset. */
const BoxGrid = Object.freeze({
  tileGid: TileGids.box,
  sourceTileWidth: TileGrid.tileWidth,
  sourceTileHeight: TileGrid.tileHeight,
  defaultScale: 2
});

/** Grid metadata for drawing hazard blocks from the shared tileset. */
const HazardGrid = Object.freeze({
  tileGid: TileGids.hazard,
  sourceTileWidth: TileGrid.tileWidth,
  sourceTileHeight: TileGrid.tileHeight
});

/** Physics values tuned against the 32px tile grid. */
const PhysicsConfig = Object.freeze({
  gravity: 0.55,
  maxFallSpeed: 13,
  maxJumpHeight: 96,
  maxJumpDistance: 96,
  modeSwitchOverlapLimit: 5,
  boxPushPullSpeed: 2.4
});

/** Volume controls are separated so bgm and effects can be tuned independently. */
const AudioConfig = Object.freeze({
  bgmVolume: 0.5,
  soundEffectVolume: 0.3,
  buttonSoundVolume: 1
});

/** Default behavior for mode blocks when the Tiled object does not override it. */
const ModeBlockDefaults = Object.freeze({
  [ObjectTypes.yellowBlock]: Object.freeze({
    collision_blueBlindness: true,
    collision_colorBlindness: true,
    collision_redBlindness: false,
    render_blueBlindness: "yellow_blueBlind",
    render_colorBlindness: "yellowMuted",
    render_redBlindness: "yellow"
  }),
  [ObjectTypes.cyanBlock]: Object.freeze({
    collision_blueBlindness: false,
    collision_colorBlindness: true,
    collision_redBlindness: true,
    render_blueBlindness: "cyan",
    render_colorBlindness: "cyanMuted",
    render_redBlindness: "cyan_redBlind"
  })
});

/** Runtime configuration consumed by sketch.js and scene rendering. */
const GAME_CONFIG = {
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  initialMode: INITIAL_MODE,
  defaultSpawnName: DEFAULT_SPAWN_NAME,
  startMapPath: AssetPaths.startMap,
  mapPath: AssetPaths.levels.level_1,
  tilesetTsxPath: AssetPaths.tilesetTsx,
  playerTsxPath: AssetPaths.playerTsx,
  tilesetImagePath: AssetPaths.tilesetImage,
  playerImagePath: AssetPaths.playerImage,
  startImagePath: AssetPaths.startImage,
  controlsImagePath: AssetPaths.controlsImage,
  winImagePath: AssetPaths.winImage,
  storyVideoPath: AssetPaths.storyVideo,
  storyAudioPath: AssetPaths.storyAudio,
  tiledStartImageLayerPath: AssetPaths.tiledStartImageLayer,
  bgmPath: AssetPaths.bgm,
  bgmVolume: AudioConfig.bgmVolume,
  buttonSoundPath: AssetPaths.buttonSound,
  buttonSoundVolume: AudioConfig.buttonSoundVolume,
  jumpSoundPath: AssetPaths.jumpSound,
  optionsSoundPath: AssetPaths.optionsSound,
  startScreenSoundPath: AssetPaths.startScreenSound,
  bookSoundPath: AssetPaths.bookSound,
  winSoundPath: AssetPaths.winSound,
  soundEffectVolume: AudioConfig.soundEffectVolume,
  playerIdleTileIds: [...PlayerGrid.idleTileIds],
  playerWalkingTileIds: [...PlayerGrid.walkingTileIds],
  playerScale: PlayerGrid.scale,
  playerSpriteBox: { ...PlayerGrid.spriteBox },
  playerCollisionBox: { ...PlayerGrid.collisionBox },
  gravity: PhysicsConfig.gravity,
  maxFallSpeed: PhysicsConfig.maxFallSpeed,
  maxJumpHeight: PhysicsConfig.maxJumpHeight,
  maxJumpDistance: PhysicsConfig.maxJumpDistance,
  modeSwitchOverlapLimit: PhysicsConfig.modeSwitchOverlapLimit,
  boxPushPullSpeed: PhysicsConfig.boxPushPullSpeed,
  keyTileGids: {
    red: TileGids.redKey,
    blue: TileGids.blueKey
  },
  bookTileGid: TileGids.book,
  boxTileGid: TileGids.box,
  hazardTileGid: TileGids.hazard,
  boxGrid: BoxGrid,
  hazardGrid: HazardGrid,
  tileGrid: TileGrid,
  playerGrid: PlayerGrid,
  objectTypes: ObjectTypes,
  mapLayers: MapLayers,
  levelRegistry: AssetPaths.levels,
  renderTileMap: {
    yellow: TileGids.modeBlocks.yellow,
    yellowMuted: TileGids.modeBlocks.yellowMuted,
    yellow_blueBlind: TileGids.modeBlocks.yellowBlueBlind,
    cyan: TileGids.modeBlocks.cyan,
    cyanMuted: TileGids.modeBlocks.cyanMuted,
    cyan_redBlind: TileGids.modeBlocks.cyanRedBlind
  },
  modeBackgroundMap: {
    colorBlindness: "#969696",
    redBlindness: "#EEFF0D",
    blueBlindness: "#00FFEE"
  }
};

const MODES = ["colorBlindness", "redBlindness", "blueBlindness"];
const MODE_LABELS = {
  colorBlindness: "Color Blindness",
  redBlindness: "Red Blindness",
  blueBlindness: "Blue Blindness"
};

class ChromasightGame {
  constructor(assets) {
    this.assets = assets;
    this.scene = "start";
    this.saveManager = assets.saveManager || null;
    this.saveData = this.saveManager?.load() || createMemorySave();
    this.currentLevelName = this.saveData.currentLevelName || "level_1";
    this.mode = MODES.includes(this.saveData.currentMode)
      ? this.saveData.currentMode
      : GAME_CONFIG.initialMode;
    this.unlockedModes = new Set(this.saveData.unlockedModes.filter((mode) => MODES.includes(mode)));
    if (this.unlockedModes.size === 0) this.unlockedModes.add(GAME_CONFIG.initialMode);
    if (!this.unlockedModes.has(this.mode)) this.mode = [...this.unlockedModes][0];
    this.cameraX = 0;
    this.cameraY = 0;
    this.showCollisionDebug = false;
    this.message = "";
    this.messageTimer = 0;
    this.lastPortal = null;
    this.currentRespawnName = "";
    this.pendingStoryLevelName = null;
    this.pendingStorySpawnName = null;
    this.totalBooks = countBooksInMaps(this.assets.maps || {});
    this.collectedBookKeys = collectedBookKeysFromSave(this.assets.maps || {}, this.saveData);
    this.collectedBooks = this.collectedBookKeys.size;
    this.hasWon = this.totalBooks > 0 && this.collectedBooks >= this.totalBooks;
    this.optionsBackButton = {
      x: (GAME_CONFIG.canvasWidth - 160) / 2,
      y: GAME_CONFIG.canvasHeight - 80,
      w: 160,
      h: 42,
      name: "Back"
    };
    this.storyPlayButton = {
      x: GAME_CONFIG.canvasWidth - 278,
      y: GAME_CONFIG.canvasHeight - 62,
      w: 118,
      h: 42,
      name: "Play"
    };
    this.storySkipButton = {
      x: GAME_CONFIG.canvasWidth - 148,
      y: GAME_CONFIG.canvasHeight - 62,
      w: 118,
      h: 42,
      name: "Skip"
    };
    this.player = {
      x: 0,
      y: 0,
      w: GAME_CONFIG.playerCollisionBox.w * GAME_CONFIG.playerScale,
      h: GAME_CONFIG.playerCollisionBox.h * GAME_CONFIG.playerScale,
      vx: 0,
      vy: 0,
      speed: horizontalSpeedForJump(GAME_CONFIG.maxJumpDistance, GAME_CONFIG.maxJumpHeight)+1,
      grounded: false,
      climbing: false,
      facing: 1
    };
    this.loadStartMap(assets.startMap);
  }

  loadStartMap(map) {
    this.scene = "start";
    this.pendingStoryLevelName = null;
    this.pendingStorySpawnName = null;
    this.map = map;
    this.tileWidth = Number(map.tilewidth || TileGrid.tileWidth);
    this.tileHeight = Number(map.tileheight || TileGrid.tileHeight);
    this.mapWidth = Number(map.width || 0) * this.tileWidth;
    this.mapHeight = Number(map.height || 0) * this.tileHeight;
    this.firstGid = map.tilesets && map.tilesets[0] ? Number(map.tilesets[0].firstgid || 1) : 1;
    this.cameraX = 0;
    this.cameraY = 0;
    this.startTiles = tilesFromVisibleTileLayers(map.layers || [], this.tileWidth, this.tileHeight);
    this.startImageLayers = imageLayersFromMap(map.layers || []);
    this.startObjects = objectRectsFromLayers(map.layers || []);
    this.startButtons = this.startObjects.filter((object) => object.name === "Start" || object.name === "Controls");
    if (!this.startButtons.some((button) => button.name === "Controls")) {
      const startButton = this.startButtons.find((button) => button.name === "Start");
      this.startButtons.push({
        name: "Controls",
        x: startButton ? startButton.x : (GAME_CONFIG.canvasWidth - 160) / 2,
        y: startButton ? startButton.y + startButton.h + 18 : GAME_CONFIG.canvasHeight - 150,
        w: startButton ? startButton.w : 160,
        h: startButton ? startButton.h : 42
      });
    }
    this.startTexts = this.startObjects.filter((object) => object.text);
    if (typeof stopMenuSounds === "function") stopMenuSounds();
    if (typeof playStartscreenSound === "function") playStartscreenSound();
  }

  loadControlsScreen() {
    this.scene = "controls";
    this.cameraX = 0;
    this.cameraY = 0;
    if (typeof stopMenuSounds === "function") stopMenuSounds();
    if (typeof playOptionsSound === "function") playOptionsSound();
  }

  returnToStartScreen() {
    this.hasWon = this.totalBooks > 0 && this.collectedBooks >= this.totalBooks;
    if (typeof stopStoryMedia === "function") stopStoryMedia();
    if (typeof bgm !== "undefined" && bgm && bgm.isPlaying()) bgm.stop();
    this.loadStartMap(this.assets.startMap);
  }

  beginStory(levelName, spawnName = null) {
    this.scene = "story";
    this.pendingStoryLevelName = levelName;
    this.pendingStorySpawnName = spawnName;
    this.cameraX = 0;
    this.cameraY = 0;
    if (typeof bgm !== "undefined" && bgm && bgm.isPlaying()) bgm.stop();
    if (typeof playStoryMedia === "function") playStoryMedia();
  }

  skipStory() {
    if (typeof stopStoryMedia === "function") stopStoryMedia();

    const levelName = this.pendingStoryLevelName || "level_1";
    const spawnName = this.pendingStorySpawnName || null;
    this.pendingStoryLevelName = null;
    this.pendingStorySpawnName = null;
    this.saveData = {
      ...this.saveData,
      hasSeenStory: true
    };
    if (typeof playBgm === "function") playBgm();
    this.loadLevel(levelName, spawnName);
  }

  loadMap(map, spawnName = null) {
    this.scene = "level";
    this.map = map;
    this.tileWidth = Number(map.tilewidth || TileGrid.tileWidth);
    this.tileHeight = Number(map.tileheight || TileGrid.tileHeight);
    this.mapWidth = Number(map.width || 0) * this.tileWidth;
    this.mapHeight = Number(map.height || 0) * this.tileHeight;
    this.firstGid = map.tilesets && map.tilesets[0] ? Number(map.tilesets[0].firstgid || 1) : 1;
    this.layers = layerMap(map.layers || []);
    this.terrain = tilesFromNamedTileLayers(map.layers || [], MapLayers.terrain, this.tileWidth, this.tileHeight);
    this.decor = tilesFromNamedTileLayers(map.layers || [], MapLayers.decor, this.tileWidth, this.tileHeight);
    this.modeBlocks = objectRectsFromLayers(map.layers || [])
      .filter((object) => object.type === ObjectTypes.yellowBlock || object.type === ObjectTypes.cyanBlock)
      .map((object) => ({
        ...object,
        modeBlock: object.props.modeBlock || defaultModeBlockFor(object.type)
      }));
    this.objects = objectRectsFromLayers(map.layers || [])
      .filter((object) => object.type !== ObjectTypes.yellowBlock && object.type !== ObjectTypes.cyanBlock);
    this.worldObjects = objectRectsFromNamedLayers(map.layers || [], MapLayers.objectLayers)
      .filter((object) => (
        object.type !== ObjectTypes.yellowBlock &&
        object.type !== ObjectTypes.cyanBlock &&
        object.type !== ObjectTypes.box &&
        object.type !== ObjectTypes.hazardBlock
      ));
    this.spikeObjects = this.objects.filter((object) => object.type === ObjectTypes.hazardBlock);
    this.boxes = this.objects
      .filter((object) => object.type === ObjectTypes.box)
      .map((box) => ({
        ...box,
        startX: box.x,
        startY: box.y,
        vy: 0,
        grounded: false
      }));
    this.spawns = this.objects.filter((object) => object.type === ObjectTypes.spawn);
    this.portals = this.objects.filter((object) => object.type === ObjectTypes.portal);
    this.ladders = this.objects.filter((object) => object.type === ObjectTypes.ladder);
    this.hazards = this.objects.filter((object) => object.type === ObjectTypes.hazardBlock);
    this.collectible = this.objects
      .filter((object) => (
        object.type === ObjectTypes.key ||
        object.type === ObjectTypes.book
      ))
      .map((object) => ({
        ...object,
        collected: this.isItemCollected(object) || Boolean(object.props.collectible?.Picked)
      }));
    this.collectible = this.collectible.map((item) => {
      if (item.type !== ObjectTypes.book) return item;

      const key = bookCollectionKey(this.currentLevelName, item);
      if (item.collected) this.collectedBookKeys.add(key);
      return {
        ...item,
        collected: this.collectedBookKeys.has(key)
      };
    });
    this.collectedBooks = this.collectedBookKeys.size;
    this.textBoxes = this.objects
      .filter((object) => Object.prototype.hasOwnProperty.call(HINT_TEXTS, object.name))
      .map((object) => ({
        ...object,
        text: {
          text: HINT_TEXTS[object.name],
          halign: "center",
          pixelsize: 16
        }
      }));

    const spawn = this.findSpawn(spawnName);
    this.setRespawn(spawn);
    this.respawn();
  }

  loadLevel(levelName, spawnName = null) {
    const map = this.assets.maps?.[levelName];
    if (!map) {
      this.setMessage(`Missing map: ${levelName}`);
      return false;
    }

    this.currentLevelName = levelName;
    this.loadMap(map, spawnName);
    return true;
  }

  findSpawn(name) {
    if (name) {
      const namedSpawn = this.spawns.find((spawn) => spawn.name === name);
      if (namedSpawn) return namedSpawn;
    }

    return this.spawns.find((spawn) => spawn.props.active === true) || this.spawns[0] || { x: 64, y: 64 };
  }

  setRespawn(spawn) {
    this.currentRespawnName = spawn.name || "";
    this.respawnPoint = {
      x: spawn.x,
      y: spawn.y + (spawn.h || this.player.h) - this.player.h
    };
    this.saveProgress();
  }

  respawn(message = "") {
    this.player.x = this.respawnPoint.x;
    this.player.y = this.respawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.grounded = false;
    this.player.climbing = false;
    this.cameraX = clamp(this.player.x - width * 0.35, 0, Math.max(0, this.mapWidth - width));
    this.cameraY = clamp(this.player.y - height * 0.5, 0, Math.max(0, this.mapHeight - height));
    if (message) this.setMessage(message);
  }

  update(keys) {
    if (this.scene !== "level") return;

    if (this.messageTimer > 0) this.messageTimer -= 1;
    this.updateBoxes();
    this.updatePlayer(keys);
    this.updateRespawnTriggers();
    this.updateHazards();
    this.collectItems();
    this.updateCamera();
    if (this.player.y > this.mapHeight + 160) this.respawn("Returned to respawn point.");
  }

  updateRespawnTriggers() {
    for (const spawn of this.spawns) {
      if (spawn.name === this.currentRespawnName) continue;
      if (!rectsOverlap(this.player, spawn)) continue;

      this.setRespawn(spawn);
      break;
    }
  }

  updateHazards() {
    for (const hazard of this.hazards) {
      if (!rectsOverlap(this.player, hazard)) continue;

      this.respawn("Respawned.");
      break;
    }
  }

  updateBoxes() {
    for (const box of this.boxes) {
      box.vy = Math.min((box.vy || 0) + GAME_CONFIG.gravity, GAME_CONFIG.maxFallSpeed);
      box.y += box.vy;
      box.grounded = false;

      for (const rect of this.getBoxSolidRects(box)) {
        if (!rectsOverlap(box, rect)) continue;

        if (box.vy > 0) {
          box.y = rect.y - box.h;
          box.grounded = true;
        } else if (box.vy < 0) {
          box.y = rect.y + rect.h;
        }
        box.vy = 0;
      }

      if (box.y > this.mapHeight + 160) {
        box.x = box.startX;
        box.y = box.startY;
        box.vy = 0;
        box.grounded = false;
      }
    }
  }

  updatePlayer(keys) {
    const p = this.player;
    const ladder = this.getActiveLadder(keys);
    const move = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);

    p.vx = move * p.speed;
    if (move !== 0) p.facing = move;

    if (ladder && (keys.up || keys.down || p.climbing)) {
      p.climbing = true;
      p.vy = 0;
      if (keys.up) p.vy = -3.1;
      if (keys.down) p.vy = 3.1;
      if (!keys.up && !keys.down) p.vy = 0;
    } else {
      p.climbing = false;
      p.vy = Math.min(p.vy + GAME_CONFIG.gravity, GAME_CONFIG.maxFallSpeed);
    }

    const previousX = p.x;
    p.x += p.vx;
    p.x = clamp(p.x, 0, Math.max(0, this.mapWidth - p.w));
    this.resolveBoxInteraction(keys, previousX);
    this.resolveCollisions("x", previousX);

    p.y += p.vy;
    p.grounded = false;
    this.resolveCollisions("y");
    this.resolveLadderTop(ladder);
  }

  tryJump() {
    const p = this.player;
    if (this.getActiveLadder()) return false;
    if (p.grounded) {
      p.vy = -jumpSpeedForHeight(GAME_CONFIG.maxJumpHeight);
      p.grounded = false;
      return true;
    }
    return false;
  }

  resolveCollisions(axis, previousX = null) {
    const p = this.player;
    for (const rect of this.getSolidRects()) {
      if (!rectsOverlap(p, rect)) continue;

      if (axis === "x") {
        if (p.vx === 0) {
          if (Number.isFinite(previousX) && this.canPlacePlayerAtX(previousX)) p.x = previousX;
          continue;
        }

        const targetX = p.vx > 0 ? rect.x - p.w : rect.x + rect.w;
        if (Number.isFinite(targetX) && this.canPlacePlayerAtX(targetX)) {
          p.x = targetX;
        } else if (Number.isFinite(previousX)) {
          p.x = previousX;
        }
        p.x = clamp(p.x, 0, Math.max(0, this.mapWidth - p.w));
        p.vx = 0;
      } else {
        if (p.vy > 0) {
          p.y = rect.y - p.h;
          p.grounded = true;
        }
        if (p.vy < 0) p.y = rect.y + rect.h;
        p.vy = 0;
      }
    }
  }

  resolveBoxInteraction(keys, previousX = null) {
    if (!keys.interact || Math.abs(this.player.vx) <= 0) return;

    const direction = Math.sign(this.player.vx);
    for (const box of this.boxes) {
      if (!verticalOverlapEnough(this.player, box)) continue;

      const overlapsBox = rectsOverlap(this.player, box);
      const boxOnPlayerRight = box.x >= this.player.x + this.player.w;
      const boxOnPlayerLeft = box.x + box.w <= this.player.x;
      const rightGap = box.x - (this.player.x + this.player.w);
      const leftGap = this.player.x - (box.x + box.w);
      const pushing = overlapsBox && ((direction > 0 && this.player.x < box.x) || (direction < 0 && this.player.x > box.x));
      const pulling = !overlapsBox && ((direction < 0 && boxOnPlayerRight && rightGap <= 10) || (direction > 0 && boxOnPlayerLeft && leftGap <= 10));

      if (!pushing && !pulling) continue;
      const originalBoxX = box.x;
      if (!this.moveBox(box, direction * GAME_CONFIG.boxPushPullSpeed)) continue;

      const targetX = box.x >= this.player.x + this.player.w || direction > 0 && pushing
        ? box.x - this.player.w
        : box.x + box.w;
      if (this.canPlacePlayerAtX(targetX, { ignoreBox: box })) {
        this.player.x = targetX;
      } else if (Number.isFinite(previousX)) {
        box.x = originalBoxX;
        this.player.x = previousX;
        this.player.vx = 0;
      } else {
        box.x = originalBoxX;
        this.player.vx = 0;
      }
      return;
    }
  }

  moveBox(box, dx) {
    const originalBoxX = box.x;
    box.x += dx;
    if (this.boxBlocked(box)) {
      box.x = originalBoxX;
      return false;
    }
    return true;
  }

  boxBlocked(box) {
    if (box.x < 0 || box.x + box.w > this.mapWidth) return true;
    return this.getBoxSolidRects(box).some((rect) => rectsOverlap(box, rect));
  }

  getBoxSolidRects(currentBox) {
    const terrainRects = this.terrain.map((tile) => ({
      x: tile.x,
      y: tile.y,
      w: this.tileWidth,
      h: this.tileHeight
    }));

    const activeModeRects = this.modeBlocks
      .filter((block) => this.modeCollision(block))
      .map((block) => ({ x: block.x, y: block.y, w: block.w, h: block.h }));

    const otherBoxRects = this.boxes
      .filter((box) => box !== currentBox)
      .map((box) => ({ x: box.x, y: box.y, w: box.w, h: box.h }));

    return terrainRects.concat(activeModeRects, otherBoxRects);
  }

  resolveLadderTop(ladder) {
    if (!ladder) return;

    const height = Number(ladder.props.topPlatformHeight);
    if (!isLadderClimbable(ladder)) return;
    if (!Number.isFinite(height) || height <= 0) return;

    const platform = { x: ladder.x, y: ladder.y, w: ladder.w, h: height };
    const p = this.player;
    const fallingOntoTop = p.vy >= 0 && p.y + p.h >= platform.y && p.y + p.h <= platform.y + height + 4;
    if (fallingOntoTop && rectsOverlap(p, platform) && !p.climbing) {
      p.y = platform.y - p.h;
      p.vy = 0;
      p.grounded = true;
    }
  }

  getSolidRects(options = {}) {
    const includeBoxes = options.includeBoxes !== false;
    const terrainRects = this.terrain.map((tile) => ({
      x: tile.x,
      y: tile.y,
      w: this.tileWidth,
      h: this.tileHeight
    }));

    const activeModeRects = this.modeBlocks
      .filter((block) => this.modeCollision(block))
      .map((block) => ({ x: block.x, y: block.y, w: block.w, h: block.h }));

    const ladderTopRects = this.player.climbing
      ? []
      : this.ladders
          .filter((ladder) => isLadderClimbable(ladder))
          .map((ladder) => ({
            x: ladder.x,
            y: ladder.y,
            w: ladder.w,
            h: Number(ladder.props.topPlatformHeight)
          }))
          .filter((rect) => Number.isFinite(rect.h) && rect.h > 0);

    const boxRects = includeBoxes
      ? this.boxes
          .filter((box) => box !== options.ignoreBox)
          .map((box) => ({ x: box.x, y: box.y, w: box.w, h: box.h }))
      : [];

    return terrainRects.concat(activeModeRects, ladderTopRects, boxRects);
  }

  canPlacePlayerAtX(x, options = {}) {
    const p = this.player;
    if (!Number.isFinite(x)) return false;
    if (x < 0 || x + p.w > this.mapWidth) return false;

    const probe = { ...p, x };
    return !this.getSolidRects(options).some((rect) => rectsOverlap(probe, rect));
  }

  modeCollision(block) {
    return Boolean(block.modeBlock[`collision_${this.mode}`]);
  }

  modeRenderKey(block) {
    return block.modeBlock[`render_${this.mode}`] || "";
  }

  toggleCollisionDebug() {
    this.showCollisionDebug = !this.showCollisionDebug;
    this.setMessage(`Debug mode: ${this.showCollisionDebug ? "on" : "off"}`);
  }

  getActiveLadder(keys = {}) {
    const overlappingLadder = this.ladders.find((ladder) => isLadderClimbable(ladder) && rectsOverlap(this.player, ladder));
    if (overlappingLadder) return overlappingLadder;

    if (!keys.down) return null;

    const entryProbe = {
      x: this.player.x,
      y: this.player.y + this.player.h,
      w: this.player.w,
      h: 18
    };

    return this.ladders.find((ladder) => {
      const playerCenterX = this.player.x + this.player.w / 2;
      const centerIsOnLadder = playerCenterX >= ladder.x && playerCenterX <= ladder.x + ladder.w;
      return isLadderClimbable(ladder) && centerIsOnLadder && rectsOverlap(entryProbe, ladder);
    }) || null;
  }

  getActivePortal() {
    return this.portals.find((portal) => rectsOverlap(this.player, portal)) || null;
  }

  usePortal() {
    const portal = this.getActivePortal();
    if (!portal || portal === this.lastPortal) return;

    const target = portal.props.target || this.currentLevelName;
    const spawnSet = portal.props.spawnSet || GAME_CONFIG.defaultSpawnName;
    this.lastPortal = portal;

    if (this.assets.maps?.[target]) {
      this.loadLevel(target, spawnSet);
      this.setMessage(`Portal target: ${target}`);
      return;
    }

    const spawn = this.findSpawn(spawnSet);
    this.setRespawn(spawn);
    this.respawn(`Portal target: ${target}`);
  }

  collectItems() {
    for (const item of this.collectible) {
      if (item.collected || !rectsOverlap(this.player, item)) continue;
      item.collected = true;
      item.props.collectible = {
        ...(item.props.collectible || {}),
        Picked: true
      };

      if (item.type === ObjectTypes.key) {
        if (typeof playButtonSound === "function") playButtonSound();
        if (item.props.redAbilityunlock) this.unlockedModes.add("redBlindness");
        if (item.props.blueAbilityunlock) this.unlockedModes.add("blueBlindness");
        this.setMessage("Visual mode unlocked.");
      } else if (item.type === ObjectTypes.book) {
        this.collectedBookKeys.add(bookCollectionKey(this.currentLevelName, item));
        this.collectedBooks = this.collectedBookKeys.size;
        if (typeof playBookSound === "function") playBookSound();
        if (this.collectedBooks >= this.totalBooks && this.totalBooks > 0) {
          this.markItemCollected(item);
          this.saveProgress();
          this.triggerWin();
          return;
        }
        this.setMessage(`Books collected: ${this.collectedBooks}/${this.totalBooks}`);
      }
      this.markItemCollected(item);
      this.saveProgress();
    }
  }

  triggerWin() {
    const shouldPlaySound = !this.hasWon;
    this.hasWon = true;
    this.scene = "win";
    this.cameraX = 0;
    this.cameraY = 0;
    if (typeof stopMenuSounds === "function") stopMenuSounds();
    if (shouldPlaySound && typeof playWinSound === "function") playWinSound();
  }

  getActiveTextDisplays() {
    return this.textBoxes.filter((textBox) => {
      if (textBox.name === "Hint_03" && this.hasCollectedBlueKey()) return false;
      return rectsOverlap(this.player, textBox);
    });
  }

  hasCollectedBlueKey() {
    return this.unlockedModes.has("blueBlindness");
  }

  switchMode(direction) {
    const available = MODES.filter((mode) => this.unlockedModes.has(mode));
    if (available.length <= 1) {
      this.setMessage("Collect a key to unlock another mode.");
      return;
    }

    if (this.isModeSwitchBlocked()) {
      this.setMessage("Move clear of color blocks to switch modes.");
      return;
    }

    const index = available.indexOf(this.mode);
    this.mode = available[(index + direction + available.length) % available.length];
    this.setMessage(`Mode: ${MODE_LABELS[this.mode]}`);
    this.saveProgress();
  }

  isModeSwitchBlocked() {
    return this.modeBlocks.some((block) => rectOverlapDepth(this.player, block) > GAME_CONFIG.modeSwitchOverlapLimit);
  }

  updateCamera() {
    const p = this.player;
    const leftEdge = width * 0.34;
    const rightEdge = width * 0.62;
    const topEdge = height * 0.28;
    const bottomEdge = height * 0.68;
    const screenX = p.x - this.cameraX;
    const screenY = p.y - this.cameraY;
    let target = this.cameraX;
    let targetY = this.cameraY;

    if (screenX < leftEdge) target = p.x - leftEdge;
    if (screenX + p.w > rightEdge) target = p.x + p.w - rightEdge;
    if (screenY < topEdge) targetY = p.y - topEdge;
    if (screenY + p.h > bottomEdge) targetY = p.y + p.h - bottomEdge;

    this.cameraX = lerp(this.cameraX, clamp(target, 0, Math.max(0, this.mapWidth - width)), 0.16);
    this.cameraY = lerp(this.cameraY, clamp(targetY, 0, Math.max(0, this.mapHeight - height)), 0.16);
  }

  setMessage(message) {
    this.message = message;
    this.messageTimer = 150;
  }

  handleMousePressed(x, y) {
    if (this.scene === "start") {
      const worldX = x + this.cameraX;
      const worldY = y + this.cameraY;
      const clickedButton = this.startButtons.find((button) => pointInRect(worldX, worldY, button));
      if (!clickedButton) return false;

      if (clickedButton.name === "Controls") {
        this.loadControlsScreen();
        return true;
      }

      if (this.hasWon) {
        this.triggerWin();
        return true;
      }
      if (typeof playBgm === "function") playBgm();
      const savedLevelName = this.assets.maps?.[this.saveData.currentLevelName]
        ? this.saveData.currentLevelName
        : "level_1";
      if (!this.saveData.hasSeenStory) {
        this.beginStory(savedLevelName, this.saveData.currentRespawnName || null);
        return true;
      }
      if (typeof playBgm === "function") playBgm();
      this.loadLevel(savedLevelName, this.saveData.currentRespawnName || null);
      return true;
    }

    if (this.scene === "story") {
      if (pointInRect(x, y, this.storyPlayButton)) {
        if (typeof toggleStoryPlayback === "function") toggleStoryPlayback();
        return true;
      }

      if (pointInRect(x, y, this.storySkipButton)) {
        this.skipStory();
        return true;
      }

      return false;
    }

    if (this.scene === "controls" && pointInRect(x, y, this.optionsBackButton)) {
      this.returnToStartScreen();
      return true;
    }

    if (this.scene === "win") {
      this.returnToStartScreen();
      return true;
    }

    return false;
  }

  /** Saves current progression data to the local JSON save store. */
  saveProgress() {
    if (!this.saveManager) return;

    this.saveData = this.saveManager.save({
      ...this.saveData,
      currentLevelName: this.currentLevelName,
      currentRespawnName: this.currentRespawnName,
      currentMode: this.mode,
      unlockedModes: [...this.unlockedModes],
      hasSeenStory: Boolean(this.saveData.hasSeenStory)
    });
  }

  /**
   * Checks whether an item has already been collected in the current level.
   *
   * @param {object} item Tiled item object.
   * @returns {boolean}
   */
  isItemCollected(item) {
    const collectedItems = this.saveData.collectedItems?.[this.currentLevelName] || [];
    return collectedItems.some((savedItem) => (
      Number(savedItem.id) === Number(item.id) &&
      savedItem.collectible?.Picked === true
    ));
  }

  /**
   * Marks an item as collected inside the JSON save data.
   *
   * @param {object} item Runtime item object.
   */
  markItemCollected(item) {
    const collectedItems = this.saveData.collectedItems || {};
    const levelItems = collectedItems[this.currentLevelName] || [];
    const nextItem = {
      id: Number(item.id),
      collectible: {
        Picked: Boolean(item.props.collectible?.Picked)
      }
    };
    const nextLevelItems = levelItems
      .filter((savedItem) => Number(savedItem.id) !== Number(item.id))
      .concat(nextItem);
    this.saveData = {
      ...this.saveData,
      collectedItems: {
        ...collectedItems,
        [this.currentLevelName]: nextLevelItems
      }
    };
  }

  /** Clears saved progress and returns the game to the first level. */
  resetSaveProgress() {
    this.saveData = this.saveManager?.reset() || createMemorySave();
    this.currentLevelName = "level_1";
    this.pendingStoryLevelName = null;
    this.pendingStorySpawnName = null;
    this.mode = GAME_CONFIG.initialMode;
    this.unlockedModes = new Set([GAME_CONFIG.initialMode]);
    this.lastPortal = null;
    this.collectedBookKeys.clear();
    this.collectedBooks = 0;
    this.hasWon = false;
    this.loadLevel("level_1", GAME_CONFIG.defaultSpawnName);
    this.setMessage("Progress reset.");
  }
}

/**
 * Parses a Tiled TSX file into the minimal grid metadata needed for rendering.
 *
 * @param {string} xmlText Raw TSX XML content loaded by p5.
 * @returns {{tilewidth: number, tileheight: number, tilecount: number, columns: number}}
 */
function parseTileset(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  const tileset = doc.querySelector("tileset");
  return {
    tilewidth: Number(tileset.getAttribute("tilewidth")),
    tileheight: Number(tileset.getAttribute("tileheight")),
    tilecount: Number(tileset.getAttribute("tilecount")),
    columns: Number(tileset.getAttribute("columns"))
  };
}

/**
 * Builds a quick lookup table for map layers by name.
 *
 * @param {Array<object>} layers Tiled layer data.
 * @returns {Record<string, object>}
 */
function layerMap(layers) {
  return layers.reduce((result, layer) => {
    result[layer.name] = layer;
    return result;
  }, {});
}

/**
 * Converts a Tiled tile layer into positioned render tiles.
 *
 * @param {object} layer Tiled tile layer.
 * @param {number} tileWidth Width of one map tile in pixels.
 * @param {number} tileHeight Height of one map tile in pixels.
 * @returns {Array<{gid: number, x: number, y: number}>}
 */
function tilesFromLayer(layer, tileWidth, tileHeight) {
  if (!layer || !Array.isArray(layer.data)) return [];

  const tiles = [];
  for (let row = 0; row < layer.height; row += 1) {
    for (let column = 0; column < layer.width; column += 1) {
      const gid = layer.data[row * layer.width + column];
      if (!gid) continue;
      tiles.push({
        gid,
        x: column * tileWidth,
        y: row * tileHeight
      });
    }
  }
  return tiles;
}

function tilesFromVisibleTileLayers(layers, tileWidth, tileHeight) {
  return layers
    .filter((layer) => layer.type === "tilelayer" && layer.visible !== false)
    .flatMap((layer) => tilesFromLayer(layer, tileWidth, tileHeight));
}

function tilesFromNamedTileLayers(layers, name, tileWidth, tileHeight) {
  return layers
    .filter((layer) => layer.type === "tilelayer" && layer.name === name && layer.visible !== false)
    .flatMap((layer) => tilesFromLayer(layer, tileWidth, tileHeight));
}

function imageLayersFromMap(layers) {
  return layers
    .filter((layer) => layer.type === "imagelayer" && layer.visible !== false && layer.image)
    .map((layer) => ({
      image: layer.image,
      x: Number(layer.x || 0),
      y: Number(layer.y || 0),
      imagewidth: Number(layer.imagewidth || 0),
      imageheight: Number(layer.imageheight || 0)
    }));
}

function objectRectsFromLayers(layers) {
  return layers
    .filter((layer) => layer.type === "objectgroup" && layer.visible !== false)
    .flatMap((layer) => objectRects(layer));
}

function objectRectsFromNamedLayers(layers, names) {
  const nameSet = new Set(names);
  return layers
    .filter((layer) => layer.type === "objectgroup" && nameSet.has(layer.name) && layer.visible !== false)
    .flatMap((layer) => objectRects(layer));
}

/**
 * Normalizes Tiled objects into rectangle records used by physics and rendering.
 *
 * @param {object} layer Tiled object layer.
 * @returns {Array<object>}
 */
function objectRects(layer) {
  if (!layer || !Array.isArray(layer.objects)) return [];
  return layer.objects.map((object) => ({
    id: object.id,
    name: object.name || "",
    type: object.type || "",
    x: Number(object.x || 0),
    y: Number(object.y || 0),
    w: Number(object.width || 0),
    h: Number(object.height || 0),
    text: object.text || null,
    props: parseProperties(object.properties || [])
  }));
}

/**
 * Provides fallback mode-block behavior when the map object has no custom data.
 *
 * @param {string} type Tiled object type.
 * @returns {object}
 */
function defaultModeBlockFor(type) {
  return ModeBlockDefaults[type] || {};
}

function parseProperties(properties) {
  const result = {};
  for (const prop of properties) {
    result[prop.name] = prop.value;
  }
  return result;
}

/** @returns {object} In-memory save fallback used when localStorage is unavailable. */
function createMemorySave() {
  return {
    currentLevelName: "level_1",
    currentRespawnName: "",
    currentMode: GAME_CONFIG.initialMode,
    unlockedModes: [GAME_CONFIG.initialMode],
    collectedItems: {},
    hasSeenStory: false
  };
}

function countBooksInMaps(maps) {
  return Object.values(maps).reduce((count, map) => count + countBooksInMap(map), 0);
}

function countBooksInMap(map) {
  if (!map || !Array.isArray(map.layers)) return 0;

  return map.layers.reduce((count, layer) => {
    if (layer.type !== "objectgroup" || !Array.isArray(layer.objects)) return count;
    return count + layer.objects.filter((object) => object.type === ObjectTypes.book).length;
  }, 0);
}

function collectedBookKeysFromSave(maps, saveData) {
  const collectedItems = saveData?.collectedItems || {};
  const result = new Set();

  for (const [levelName, map] of Object.entries(maps)) {
    const savedItems = collectedItems[levelName] || [];
    if (!Array.isArray(savedItems) || savedItems.length === 0) continue;
    const pickedIds = new Set(
      savedItems
        .filter((item) => item.collectible?.Picked === true)
        .map((item) => Number(item.id))
    );

    for (const layer of map.layers || []) {
      if (layer.type !== "objectgroup" || !Array.isArray(layer.objects)) continue;
      for (const object of layer.objects) {
        if (object.type !== ObjectTypes.book) continue;
        const item = {
          id: object.id,
          name: object.name || "",
          type: object.type || "",
          x: Number(object.x || 0),
          y: Number(object.y || 0)
        };
        if (pickedIds.has(Number(item.id))) result.add(bookCollectionKey(levelName, item));
      }
    }
  }

  return result;
}

function bookCollectionKey(levelName, item) {
  return `${levelName}:${item.id}`;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function verticalOverlapEnough(a, b) {
  const overlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return overlap > Math.min(a.h, b.h) * 0.35;
}

function isLadderClimbable(ladder) {
  return true;
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function rectOverlapDepth(a, b) {
  if (!rectsOverlap(a, b)) return 0;

  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return Math.min(overlapX, overlapY);
}

function jumpSpeedForHeight(height) {
  return Math.sqrt(2 * GAME_CONFIG.gravity * height);
}

function horizontalSpeedForJump(distance, height) {
  const jumpSpeed = jumpSpeedForHeight(height);
  const airTime = (2 * jumpSpeed) / GAME_CONFIG.gravity;
  return distance / airTime;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
