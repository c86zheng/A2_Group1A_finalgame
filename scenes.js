ChromasightGame.prototype.draw = function () {
  if (this.scene === "start") {
    this.drawStartScreen();
    return;
  }

  this.drawWorld();
  this.drawUi();
};

ChromasightGame.prototype.drawStartScreen = function () {
  push();
  translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));
  this.drawImageLayers(this.startImageLayers || []);
  this.drawTileLayer(this.startTiles || []);
  for (const textBox of this.startTexts || []) {
    this.drawTextBox(textBox);
  }
  pop();
};

ChromasightGame.prototype.drawWorld = function () {
  push();
  translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));
  this.drawTileLayer(this.terrain);
  this.drawModeBlocks();
  this.drawTileLayer(this.decor);
  this.drawItems();
  this.drawTextBoxes();
  this.drawPlayer();
  if (this.showCollisionDebug) this.drawCollisionDebug();
  pop();
};

ChromasightGame.prototype.drawTileLayer = function (tiles) {
  for (const tile of tiles) {
    drawTileGid(tile.gid, tile.x, tile.y, this.tileWidth, this.tileHeight, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
  }
};

ChromasightGame.prototype.drawImageLayers = function (layers) {
  for (const layer of layers) {
    if (layer.image === "../img/Start.png") {
      image(this.assets.startImage, layer.x, layer.y, layer.imagewidth, layer.imageheight);
    }
  }
};

ChromasightGame.prototype.drawModeBlocks = function () {
  for (const block of this.modeBlocks) {
    const key = this.modeRenderKey(block);
    const gid = GAME_CONFIG.renderTileMap[key];
    if (!gid) continue;

    for (let y = block.y; y < block.y + block.h; y += this.tileHeight) {
      for (let x = block.x; x < block.x + block.w; x += this.tileWidth) {
        drawTileGid(gid, x, y, this.tileWidth, this.tileHeight, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      }
    }
  }
};

ChromasightGame.prototype.drawItems = function () {
  for (const item of this.items) {
    if (item.collected) continue;

    if (item.type === "key") {
      drawTileGid(GAME_CONFIG.keyTileGid, item.x, item.y, item.w, item.h, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      continue;
    }

    if (item.type === "book") {
      drawTileGid(GAME_CONFIG.bookTileGid, item.x, item.y, item.w, item.h, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      continue;
    }

    fill(235, 224, 168);
    stroke(33, 38, 46);
    strokeWeight(2);
    rect(item.x, item.y, item.w, item.h, 2);
  }
};

ChromasightGame.prototype.drawTextBoxes = function () {
  const activeTextDisplays = this.getActiveTextDisplays();
  for (const textBox of activeTextDisplays) {
    this.drawTextBox(textBox);
  }
};

ChromasightGame.prototype.drawTextBox = function (textBox) {
  const textData = textBox.text || {};
  const message = textData.text || "";
  if (!message) return;

  push();
  textAlign(textAlignFromTiled(textData.halign), TOP);
  textSize(Number(textData.pixelsize || 12));
  stroke(40, 45, 56);
  strokeWeight(3);
  fill(255);

  text(message, textBox.x, textBox.y, textBox.w, textBox.h);
  pop();
};

ChromasightGame.prototype.drawPlayer = function () {
  const p = this.player;
  const frame = playerFrameFor(p, this.assets.playerMeta);
  const cropBottom = GAME_CONFIG.playerSourceCropBottom;
  const collisionBox = GAME_CONFIG.playerCollisionBox;
  const sourceHeight = frame.sh - cropBottom;
  const drawWidth = frame.sw * GAME_CONFIG.playerScale;
  const drawHeight = sourceHeight * GAME_CONFIG.playerScale;
  const collisionOffsetX = p.facing < 0
    ? frame.sw - collisionBox.x - collisionBox.w
    : collisionBox.x;
  const drawX = p.x - collisionOffsetX * GAME_CONFIG.playerScale;
  const drawY = p.y - collisionBox.y * GAME_CONFIG.playerScale;

  push();
  translate(drawX + drawWidth / 2, drawY);
  scale(p.facing, 1);
  imageMode(CORNER);
  image(
    this.assets.playerImage,
    -drawWidth / 2,
    0,
    drawWidth,
    drawHeight,
    frame.sx,
    frame.sy,
    frame.sw,
    sourceHeight
  );
  pop();
};

ChromasightGame.prototype.drawCollisionDebug = function () {
  push();
  noFill();
  strokeWeight(2);

  stroke(86, 170, 255, 180);
  for (const rect of this.terrain) {
    this.drawDebugRect(rect.x, rect.y, this.tileWidth, this.tileHeight);
  }

  stroke(255, 170, 40, 220);
  for (const block of this.modeBlocks) {
    if (this.modeCollision(block)) this.drawDebugRect(block.x, block.y, block.w, block.h);
  }

  stroke(178, 110, 255, 220);
  for (const ladder of this.ladders) {
    this.drawDebugRect(ladder.x, ladder.y, ladder.w, ladder.h);
  }

  stroke(80, 255, 225, 220);
  for (const portal of this.portals) {
    this.drawDebugRect(portal.x, portal.y, portal.w, portal.h);
  }

  stroke(255, 230, 80, 220);
  for (const item of this.items) {
    if (!item.collected) this.drawDebugRect(item.x, item.y, item.w, item.h);
  }

  stroke(255, 110, 210, 220);
  for (const textBox of this.textBoxes) {
    this.drawDebugRect(textBox.x, textBox.y, textBox.w, textBox.h);
  }

  stroke(255, 60, 90, 255);
  this.drawDebugRect(this.player.x, this.player.y, this.player.w, this.player.h);
  pop();
};

ChromasightGame.prototype.drawDebugRect = function (x, y, w, h) {
  rect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w), Math.floor(h));
};

ChromasightGame.prototype.drawUi = function () {
  noStroke();
  fill(8, 12, 18, 190);
  rect(16, 14, 250, 36, 6);

  fill(240, 245, 250);
  textAlign(LEFT, TOP);
  textSize(15);
  text(`Mode: ${MODE_LABELS[this.mode]}`, 30, 26);

  if (this.messageTimer > 0) {
    fill(8, 12, 18, 205);
    rect(16, height - 54, Math.min(620, textWidth(this.message) + 32), 38, 6);
    fill(255);
    text(this.message, 30, height - 44);
  }

  if (this.getActivePortal()) {
    fill(8, 12, 18, 205);
    rect(width - 220, height - 54, 204, 38, 6);
    fill(255);
    textAlign(LEFT, TOP);
    text("Press W to enter portal", width - 204, height - 44);
  }
};

function drawTileGid(gid, dx, dy, dw, dh, sheet, meta, firstGid) {
  if (!sheet || !meta || !gid) return;

  const localId = gid - firstGid;
  const sx = (localId % meta.columns) * meta.tilewidth;
  const sy = Math.floor(localId / meta.columns) * meta.tileheight;
  image(sheet, dx, dy, dw, dh, sx, sy, meta.tilewidth, meta.tileheight);
}

function playerFrameFor(player, meta) {
  let tileId = 0;

  if (player.climbing) {
    tileId = 0;
  } else if (!player.grounded) {
    tileId = player.vy < 0 ? 12 : 13;
  } else if (Math.abs(player.vx) > 0.1) {
    const walkIds = GAME_CONFIG.playerWalkingTileIds;
    tileId = walkIds[Math.floor(frameCount / 8) % walkIds.length];
  } else {
    const idleIds = GAME_CONFIG.playerIdleTileIds;
    tileId = idleIds[Math.floor(frameCount / 10) % idleIds.length];
  }

  return frameFromTileId(tileId, meta);
}

function frameFromTileId(tileId, meta) {
  const safeTileId = clamp(Math.floor(tileId), 0, Math.max(0, meta.tilecount - 1));
  return {
    sx: (safeTileId % meta.columns) * meta.tilewidth,
    sy: Math.floor(safeTileId / meta.columns) * meta.tileheight,
    sw: meta.tilewidth,
    sh: meta.tileheight
  };
}

function textAlignFromTiled(value) {
  if (value === "center") return CENTER;
  if (value === "right") return RIGHT;
  return LEFT;
}
