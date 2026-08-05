ChromasightGame.prototype.draw = function () {
  if (this.scene === "start") {
    this.drawStartScreen();
    return;
  }

  if (this.scene === "controls") {
    this.drawControlsScreen();
    return;
  }

  if (this.scene === "story") {
    this.drawStoryScreen();
    return;
  }

  if (this.scene === "win") {
    this.drawWinScreen();
    return;
  }

  this.drawWorld();
  this.drawUi();
};

ChromasightGame.prototype.drawStartScreen = function () {
  push();
  if (this.assets.startImage) {
    image(this.assets.startImage, 0, 0, width, height);
  } else {
    translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));
    this.drawImageLayers(this.startImageLayers || []);
    this.drawTileLayer(this.startTiles || []);
  }
  for (const textBox of this.startTexts || []) {
    this.drawTextBox(textBox);
  }
  for (const button of this.startButtons || []) {
    this.drawMenuButton(button, button.name);
  }
  pop();
};

ChromasightGame.prototype.drawControlsScreen = function () {
  push();
  image(this.assets.controlsImage, 0, 0, width, height);
  this.drawMenuButton(this.optionsBackButton, "Back");
  pop();
};

ChromasightGame.prototype.drawWinScreen = function () {
  push();
  image(this.assets.winImage, 0, 0, width, height);
  pop();
};

ChromasightGame.prototype.drawStoryScreen = function () {
  push();
  noStroke();
  fill(0);
  rect(0, 0, width, height);

  if (this.assets.storyVideo) {
    drawMediaCover(this.assets.storyVideo, 0, 0, width, height);
  }

  const isPlaying = Boolean(this.assets.storyVideo?.elt && !this.assets.storyVideo.elt.paused && !this.assets.storyVideo.elt.ended);
  this.drawMenuButton(this.storyPlayButton, isPlaying ? "Pause" : "Play");
  this.drawMenuButton(this.storySkipButton, "Skip");
  pop();
};

function drawMediaCover(media, dx, dy, dw, dh) {
  const sourceWidth = media?.elt?.videoWidth || media?.width || dw;
  const sourceHeight = media?.elt?.videoHeight || media?.height || dh;
  const sourceAspect = sourceWidth / sourceHeight;
  const destAspect = dw / dh;

  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceAspect > destAspect) {
    sw = sourceHeight * destAspect;
    sx = (sourceWidth - sw) / 2;
  } else if (sourceAspect < destAspect) {
    sh = sourceWidth / destAspect;
    sy = (sourceHeight - sh) / 2;
  }

  image(media, dx, dy, dw, dh, sx, sy, sw, sh);
}

ChromasightGame.prototype.drawWorld = function () {
  push();
  translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));
  this.drawTileLayer(this.decor);
  this.drawModeBlocks();
  this.drawTileLayer(this.terrain);
  this.drawWorldObjects(this.worldObjects);
  this.drawBoxes();
  this.drawItems();
  this.drawWorldObjects(this.spikeObjects);
  this.drawPlayer();
  if (this.showCollisionDebug) this.drawCollisionDebug();
  pop();
};

ChromasightGame.prototype.drawBoxes = function () {
  for (const box of this.boxes) {
    this.drawBoxObject(box);
  }
};

ChromasightGame.prototype.drawWorldObjects = function (objects = this.objects) {
  for (const object of objects) {
    if (object.type === ObjectTypes.box) {
      this.drawBoxObject(object);
      continue;
    }

    if (object.type === ObjectTypes.hazardBlock) {
      this.drawHazardObject(object);
      continue;
    }

    if (object.type === ObjectTypes.portal) continue;
  }
};

ChromasightGame.prototype.drawBoxObject = function (box) {
  drawTileGid(GAME_CONFIG.boxGrid.tileGid, box.x, box.y, box.w, box.h, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
};

ChromasightGame.prototype.drawHazardObject = function (hazard) {
  const faceUp = hazard.props.FaceUp === true;

  for (let y = hazard.y; y < hazard.y + hazard.h; y += this.tileHeight) {
    for (let x = hazard.x; x < hazard.x + hazard.w; x += this.tileWidth) {
      const tileW = Math.min(this.tileWidth, hazard.x + hazard.w - x);
      const tileH = Math.min(this.tileHeight, hazard.y + hazard.h - y);
      if (faceUp) {
        drawTileGid(GAME_CONFIG.hazardGrid.tileGid, x, y, tileW, tileH, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      } else {
        drawVerticallyFlippedTileGid(GAME_CONFIG.hazardGrid.tileGid, x, y, tileW, tileH, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      }
    }
  }
};

ChromasightGame.prototype.drawTileLayer = function (tiles) {
  for (const tile of tiles) {
    drawTileGid(tile.gid, tile.x, tile.y, this.tileWidth, this.tileHeight, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
  }
};

ChromasightGame.prototype.drawImageLayers = function (layers) {
  for (const layer of layers) {
    if (layer.image === GAME_CONFIG.tiledStartImageLayerPath) {
      image(this.assets.startImage, layer.x, layer.y, layer.imagewidth, layer.imageheight);
    }
  }
};

ChromasightGame.prototype.drawMenuButton = function (button, label) {
  if (!button) return;

  const hovered = typeof mouseX === "number" && typeof mouseY === "number" && pointInRect(mouseX, mouseY, button);
  const primary = label === "Start";

  push();
  noStroke();
  fill(12, 16, 24, 120);
  rect(button.x + 5, button.y + 6, button.w, button.h, 12);
  stroke(25, 28, 36);
  strokeWeight(3);
  if (primary) {
    fill(hovered ? 255 : 246, hovered ? 220 : 213, hovered ? 108 : 74, hovered ? 255 : 235);
  } else {
    fill(hovered ? 241 : 222, hovered ? 241 : 225, hovered ? 241 : 230, hovered ? 255 : 235);
  }
  rect(button.x, button.y, button.w, button.h, 12);
  noStroke();
  fill(25, 28, 36);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(hovered ? 27 : 25);
  text(label, button.x + button.w / 2, button.y + button.h / 2 + 1);
  pop();
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
  for (const item of this.collectible) {
    if (item.collected) continue;

    if (item.type === ObjectTypes.key) {
      drawTileGid(keyTileGidFor(item), item.x, item.y, item.w, item.h, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      continue;
    }

    if (item.type === ObjectTypes.book) {
      drawTileGid(GAME_CONFIG.bookTileGid, item.x, item.y, item.w, item.h, this.assets.tilesetImage, this.assets.tilesetMeta, this.firstGid);
      continue;
    }

    fill(235, 224, 168);
    stroke(33, 38, 46);
    strokeWeight(2);
    rect(item.x, item.y, item.w, item.h, 2);
  }
};

function keyTileGidFor(item) {
  if (item.props.blueAbilityunlock) return GAME_CONFIG.keyTileGids.blue;
  return GAME_CONFIG.keyTileGids.red;
}

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

  const isHintText = typeof HINT_TEXTS !== "undefined" && Object.prototype.hasOwnProperty.call(HINT_TEXTS, textBox.name);
  if (!isHintText) {
    push();
    textAlign(textAlignFromTiled(textData.halign), TOP);
    textSize(Number(textData.pixelsize || 12));
    stroke(40, 45, 56);
    strokeWeight(3);
    fill(255);
    text(message, textBox.x, textBox.y, textBox.w, textBox.h);
    pop();
    return;
  }

  push();
  const boxW = Math.min(680, width - 48);
  const boxH = Math.max(58, Math.min(116, textHeightForMessage(message, boxW - 32, Number(textData.pixelsize || 16)) + 28));
  const boxX = (width - boxW) / 2;
  const boxY = 70;

  noStroke();
  fill(8, 12, 18, 220);
  rect(boxX, boxY, boxW, boxH, 8);
  stroke(255, 255, 255, 55);
  strokeWeight(1);
  noFill();
  rect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1, 8);

  textAlign(textAlignFromTiled(textData.halign), TOP);
  textSize(Number(textData.pixelsize || 12));
  noStroke();
  fill(255);
  text(message, boxX + 16, boxY + 14, boxW - 32, boxH - 24);
  pop();
};

function textHeightForMessage(message, maxWidth, size) {
  push();
  textSize(size);
  const words = String(message).split(/\s+/);
  let line = "";
  let lines = 1;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (line && textWidth(testLine) > maxWidth) {
      lines += 1;
      line = word;
    } else {
      line = testLine;
    }
  }

  pop();
  return lines * size * 1.3;
}

ChromasightGame.prototype.drawPlayer = function () {
  const p = this.player;
  const frame = playerFrameFor(p, this.assets.playerMeta);
  const spriteBox = GAME_CONFIG.playerSpriteBox;
  const drawScale = p.h / spriteBox.h;
  const drawWidth = frame.sw * drawScale;
  const drawHeight = frame.sh * drawScale;
  const spriteCenterX = (spriteBox.x + spriteBox.w / 2) * drawScale;
  const spriteBottomY = (spriteBox.y + spriteBox.h) * drawScale;
  const playerCenterX = p.x + p.w / 2;
  const drawX = p.facing < 0
    ? playerCenterX - drawWidth + spriteCenterX
    : playerCenterX - spriteCenterX;
  const drawY = p.y + p.h - spriteBottomY;

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
    frame.sh
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
  for (const item of this.collectible) {
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
    text("Press F to enter portal", width - 204, height - 44);
  }

  if (this.showCollisionDebug) this.drawDebugShortcutMenu();
  this.drawTextBoxes();
};

ChromasightGame.prototype.drawDebugShortcutMenu = function () {
  const lines = [
    "1 - level_1",
    "2 - level_2",
    "3 - level_3",
    "4 - story",
    "5 - ending"
  ];
  const boxW = 132;
  const boxH = 104;
  const boxX = width - boxW - 16;
  const boxY = 14;

  push();
  noStroke();
  fill(8, 12, 18, 210);
  rect(boxX, boxY, boxW, boxH, 6);
  fill(240, 245, 250);
  textAlign(LEFT, TOP);
  textSize(13);
  text(lines.join("\n"), boxX + 12, boxY + 10);
  pop();
};

/**
 * Draws a single gid from a Tiled tileset image.
 *
 * @param {number} gid Global tile id from the TMJ file.
 * @param {number} dx Destination x.
 * @param {number} dy Destination y.
 * @param {number} dw Destination width.
 * @param {number} dh Destination height.
 * @param {p5.Image} sheet Tileset image.
 * @param {{tilewidth: number, tileheight: number, columns: number}} meta Parsed TSX grid data.
 * @param {number} firstGid First gid declared by the TMJ tileset reference.
 */
function drawTileGid(gid, dx, dy, dw, dh, sheet, meta, firstGid) {
  if (!sheet || !meta || !gid) return;

  const localId = gid - firstGid;
  const sx = (localId % meta.columns) * meta.tilewidth;
  const sy = Math.floor(localId / meta.columns) * meta.tileheight;
  image(sheet, dx, dy, dw, dh, sx, sy, meta.tilewidth, meta.tileheight);
}

function drawVerticallyFlippedTileGid(gid, dx, dy, dw, dh, sheet, meta, firstGid) {
  push();
  translate(dx + dw / 2, dy + dh / 2);
  scale(1, -1);
  drawTileGid(gid, -dw / 2, -dh / 2, dw, dh, sheet, meta, firstGid);
  pop();
}

/**
 * Selects the current robot frame according to movement state.
 *
 * @param {object} player Player physics state.
 * @param {object} meta Parsed robot TSX metadata.
 * @returns {{sx: number, sy: number, sw: number, sh: number}}
 */
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
