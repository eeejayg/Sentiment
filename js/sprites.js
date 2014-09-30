sprites = {
	arrowStrongGains: { x: 5, y: 5, w: 100, h: 100 },
	arrowMildGains: { x: 110, y: 5, w: 100, h: 100 },
	arrowNoChange: { x: 215, y: 5, w: 100, h: 100 },
	arrowMildLoss: { x: 320, y: 5, w: 100, h: 100 },
	arrowStrongLoss: { x: 425, y: 5, w: 100, h: 100 },

	
	backButton: { x: 528, y: 24, w: 30, h: 30 },
	searchIcon: { x: 530, y: 88, w: 17, h:17 },
	closeButton: {x: 530, y: 55, w: 27, h:27},
	
	alertSentiment: {x: 5, y: 110, w: 55, h:55},
	alertPrice: {x: 65, y: 110, w: 55, h:55},
	alertPrediction: {x: 125, y: 110, w: 55, h:55},
	alertPattern: {x: 185, y: 110, w: 55, h:55},
	alertKeyword: {x: 245, y: 110, w: 55, h:55},
	
	alertArrow0: {x: 160+289, y: 597-489, w: 17, h: 26},
	alertArrow1: {x: 73+289, y: 603-489, w: 21, h: 20},
	alertArrow2: {x: 38+289, y: 605-489, w: 27, h: 17},
	alertArrow3: {x: 105+289, y: 603-489, w: 21, h: 20},
	alertArrow4: {x: 133+289, y: 600-489, w: 18, h: 26},
	
	alertDialogArrow4: {x: 327, y: 147, w: 30, h: 30},
	alertDialogArrow3: {x: 363, y: 147, w: 30, h: 30},
	alertDialogArrow2: {x: 397, y: 147, w: 30, h: 30},
	alertDialogArrow1: {x: 433, y: 147, w: 30, h: 30},
	alertDialogArrow0: {x: 468, y: 147, w: 30, h: 30},

	alertDialogArrowSelected4: {x: 327, y: 184, w: 30, h: 30},
	alertDialogArrowSelected3: {x: 363, y: 184, w: 30, h: 30},
	alertDialogArrowSelected2: {x: 397, y: 184, w: 30, h: 30},
	alertDialogArrowSelected1: {x: 433, y: 184, w: 30, h: 30},
	alertDialogArrowSelected0: {x: 468, y: 184, w: 30, h: 30},

	sourceNYT: {x: 5, y: 175, w: 96, h:14},
	sourceAmazon: {x: 5, y: 200, w: 90, h:18},
	sourceWallstreet: {x: 5, y: 225, w: 130, h:15},
	sourceTwitter: {x: 115, y: 175, w: 25, h:17},
	sourceTimes: {x: 115, y: 200, w: 42, h:14}
}

spritesImage = null;

function drawSpriteToContext(name, rc, dx, dy, dw, dh) {

  var spriteDef = sprites[name];
  
  if (spriteDef && spritesImage) {
    rc.drawImage(spritesImage, spriteDef.x, spriteDef.y, spriteDef.w, spriteDef.h, dx, dy, dw || spriteDef.w, dh || spriteDef.h);
    
    return spriteDef;
  }
}

function getSpriteDef(name) {
  return sprites[name];
}

function setBackgroundSprite(el, name, box) {
  var spriteDef = sprites[name];
  el.style.backgroundImage = "url(assets/sprites_01.png)";
  el.style.backgroundRepeat = "no-repeat";
  if (box) {
    el.style.left = (box.x || 0) + (box.w - spriteDef.w) * 0.5 + "px";
    el.style.top = (box.y || 0) + (box.h - spriteDef.h) * 0.5 + "px";
  }
  el.style.width = spriteDef.w + "px";
  el.style.height = spriteDef.h + "px";
  el.style.backgroundPosition = -spriteDef.x + "px " + -spriteDef.y + "px";
}
