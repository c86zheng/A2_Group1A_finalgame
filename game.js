const GAME_CONFIG = {
  canvasWidth: 960,
  canvasHeight: 540,
  initialMode: "colorBlindness",
  startMapPath: "assets/map/Start.tmj",
  mapPath: "assets/map/level_1.tmj",
  tilesetTsxPath: "assets/map/tiles_packed.tsx",
  playerTsxPath: "assets/map/robotFighter.tsx",
  tilesetImagePath: "assets/img/tiles_packed.png",
  playerImagePath: "assets/img/robotFighter.png",
  startImagePath: "assets/img/Start.png",
  bgmPath: "assets/sound/bgm.wav",
  bgmVolume: 0.5,
  buttonSoundPath: "assets/sound/buttonon.mp3",
  buttonSoundVolume: 1,
  playerIdleTileIds: [0, 1, 2, 3, 4, 5],
  playerWalkingTileIds: [54, 55, 56, 57],
  playerScale: 2,
  playerSourceCropBottom: 14,
  playerCollisionBox: { x: 14, y: 11, w: 30, h: 39 },
  gravity: 0.55,
  maxFallSpeed: 13,
  maxJumpHeight: 80,
  maxJumpDistance: 96,
  modeSwitchOverlapLimit: 5,
  keyTileGid: 296,
  bookTileGid: 317,
  levelRegistry: {
    level_1: "assets/map/level_1.tmj",
    level_2: "assets/map/level_1.tmj"
  },
  renderTileMap: {
    yellow: 307,
    yellowMuted: 306,
    yellow_blueBlind: 309,
    cyan: 329,
    cyanMuted: 328,
    cyan_redBlind: 330
  },
  modeBackgroundMap: {
    colorBlindness: "#969696",
    redBlindness: "#EEFF0D",
    blueBlindness: "#00FFC0"
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
    this.currentLevelName = "level_1";
    this.mode = GAME_CONFIG.initialMode || "colorBlindness";
    this.unlockedModes = new Set([this.mode]);
    this.cameraX = 0;
    this.cameraY = 0;
    this.showCollisionDebug = false;
    this.message = "";
    this.messageTimer = 0;
    this.lastPortal = null;
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
    this.map = map;
    this.tileWidth = Number(map.tilewidth || 32);
    this.tileHeight = Number(map.tileheight || 32);
    this.mapWidth = Number(map.width || 0) * this.tileWidth;
    this.mapHeight = Number(map.height || 0) * this.tileHeight;
    this.firstGid = map.tilesets && map.tilesets[0] ? Number(map.tilesets[0].firstgid || 1) : 1;
    this.cameraX = 0;
    this.cameraY = 0;
    this.startTiles = tilesFromVisibleTileLayers(map.layers || [], this.tileWidth, this.tileHeight);
    this.startImageLayers = imageLayersFromMap(map.layers || []);
    this.startObjects = objectRectsFromLayers(map.layers || []);
    this.startButtons = this.startObjects.filter((object) => object.name === "Start");
    this.startTexts = this.startObjects.filter((object) => object.text);
  }

  loadMap(map, spawnName = null) {
    this.scene = "level";
    this.map = map;
    this.tileWidth = Number(map.tilewidth || 32);
    this.tileHeight = Number(map.tileheight || 32);
    this.mapWidth = Number(map.width || 0) * this.tileWidth;
    this.mapHeight = Number(map.height || 0) * this.tileHeight;
    this.firstGid = map.tilesets && map.tilesets[0] ? Number(map.tilesets[0].firstgid || 1) : 1;
    this.layers = layerMap(map.layers || []);
    this.terrain = tilesFromLayer(this.layers.terrain_solid, this.tileWidth, this.tileHeight);
    this.decor = tilesFromLayer(this.layers.decor, this.tileWidth, this.tileHeight);
    this.modeBlocks = objectRects(this.layers.mode_blocks).map((object) => ({
      ...object,
      modeBlock: object.props.modeBlock || object.props
    }));
    this.objects = objectRects(this.layers.objects);
    this.spawns = this.objects.filter((object) => object.type === "spawn");
    this.portals = this.objects.filter((object) => object.type === "portal");
    this.ladders = this.objects.filter((object) => object.type === "ladder");
    this.items = this.objects
      .filter((object) => object.type === "key" || object.type === "book" || object.type === "item")
      .map((object) => ({
        ...object,
        collected: Boolean(object.props.collected || object.props.Picked || object.props.item?.Picked)
      }));
    this.textBoxes = this.objects.filter((object) => object.type === "textBox");
    this.textTriggers = this.textBoxes.filter((object) => !object.text);
    this.textDisplays = this.textBoxes.filter((object) => object.text);

    const spawn = this.findSpawn(spawnName);
    this.setRespawn(spawn);
    this.respawn();
  }

  findSpawn(name) {
    if (name) {
      const namedSpawn = this.spawns.find((spawn) => spawn.name === name);
      if (namedSpawn) return namedSpawn;
    }

    return this.spawns.find((spawn) => spawn.props.active === true) || this.spawns[0] || { x: 64, y: 64 };
  }

  setRespawn(spawn) {
    this.respawnPoint = {
      x: spawn.x,
      y: spawn.y + (spawn.h || this.player.h) - this.player.h
    };
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
    this.updatePlayer(keys);
    this.collectItems();
    this.updateCamera();
    if (this.player.y > this.mapHeight + 160) this.respawn("Returned to respawn point.");
  }

  updatePlayer(keys) {
    const p = this.player;
    const ladder = this.getActiveLadder();
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

    p.x += p.vx;
    p.x = clamp(p.x, 0, Math.max(0, this.mapWidth - p.w));
    this.resolveCollisions("x");

    p.y += p.vy;
    p.grounded = false;
    this.resolveCollisions("y");
    this.resolveLadderTop(ladder);
  }

  tryJump() {
    const p = this.player;
    if (this.getActiveLadder()) return;
    if (p.grounded) {
      p.vy = -jumpSpeedForHeight(GAME_CONFIG.maxJumpHeight);
      p.grounded = false;
    }
  }

  resolveCollisions(axis) {
    const p = this.player;
    for (const rect of this.getSolidRects()) {
      if (!rectsOverlap(p, rect)) continue;

      if (axis === "x") {
        if (p.vx > 0) p.x = rect.x - p.w;
        if (p.vx < 0) p.x = rect.x + rect.w;
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

  resolveLadderTop(ladder) {
    if (!ladder) return;

    const height = Number(ladder.props.topPlatformHeight);
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

  getSolidRects() {
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
          .map((ladder) => ({
            x: ladder.x,
            y: ladder.y,
            w: ladder.w,
            h: Number(ladder.props.topPlatformHeight)
          }))
          .filter((rect) => Number.isFinite(rect.h) && rect.h > 0);

    return terrainRects.concat(activeModeRects, ladderTopRects);
  }

  modeCollision(block) {
    return Boolean(block.modeBlock[`collision_${this.mode}`]);
  }

  modeRenderKey(block) {
    return block.modeBlock[`render_${this.mode}`] || "";
  }

  toggleCollisionDebug() {
    this.showCollisionDebug = !this.showCollisionDebug;
    this.setMessage(`Collision boxes: ${this.showCollisionDebug ? "on" : "off"}`);
  }

  getActiveLadder() {
    return this.ladders.find((ladder) => rectsOverlap(this.player, ladder)) || null;
  }

  getActivePortal() {
    return this.portals.find((portal) => rectsOverlap(this.player, portal)) || null;
  }

  usePortal() {
    const portal = this.getActivePortal();
    if (!portal || portal === this.lastPortal) return;

    const target = portal.props.target || this.currentLevelName;
    const spawnSet = portal.props.spawnSet || null;
    const targetPath = GAME_CONFIG.levelRegistry[target];
    this.lastPortal = portal;

    if (targetPath && targetPath === GAME_CONFIG.mapPath) {
      this.currentLevelName = target;
      this.loadMap(this.assets.map, spawnSet);
      this.setMessage(`Portal target: ${target}`);
      return;
    }

    const spawn = this.findSpawn(spawnSet);
    this.setRespawn(spawn);
    this.respawn(`Portal target: ${target}`);
  }

  collectItems() {
    for (const item of this.items) {
      if (item.collected || !rectsOverlap(this.player, item)) continue;
      item.collected = true;

      if (item.type === "key") {
        if (typeof playButtonSound === "function") playButtonSound();
        if (item.props.redAbilityunlock) this.unlockedModes.add("redBlindness");
        if (item.props.blueAbilityunlock) this.unlockedModes.add("blueBlindness");
        this.setMessage("Visual mode unlocked.");
      } else {
        this.setMessage("Book collected.");
      }
    }
  }

  getActiveTextDisplays() {
    const hasActiveTrigger = this.textTriggers.some((trigger) => rectsOverlap(this.player, trigger));
    if (!hasActiveTrigger) return [];

    return this.textDisplays.filter((textBox) => textBox.props.show !== false);
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
    if (this.scene !== "start") return false;

    const worldX = x + this.cameraX;
    const worldY = y + this.cameraY;
    const clickedStart = this.startButtons.some((button) => pointInRect(worldX, worldY, button));
    if (!clickedStart) return false;

    if (typeof playBgm === "function") playBgm();
    this.loadMap(this.assets.map);
    return true;
  }
}

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

function layerMap(layers) {
  return layers.reduce((result, layer) => {
    result[layer.name] = layer;
    return result;
  }, {});
}

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

function parseProperties(properties) {
  const result = {};
  for (const prop of properties) {
    result[prop.name] = prop.value;
  }
  return result;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
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
