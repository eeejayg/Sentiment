/*
 * Views are passed a model wrapped in a ko.observable object, which can be subscribed to for responding to datamodel changes.
 */

function StockPredictionView(model) {
  var _i = this;
  
  _i.model = model;
  _i.dirtyFlag = ko.observable(0);

  _i.sourceGap = 1.5 * Math.PI / 180;
  _i.wordGap = 0.75 * Math.PI / 180;

  _i.bgColorsByPrediction = {
    "2": new Awe.Color("#71c9df"),
    "1": new Awe.Color("#a2e6f8"),
    "0": new Awe.Color("#f2f2f2"),
    "-1": new Awe.Color("#f7ccbf"),
    "-2": new Awe.Color("#fa9b8c")
  }

  _i.textColorsByPrediction = {
    "2": new Awe.Color("#0a3f52"),
    "1": new Awe.Color("#106685"),
    "0": new Awe.Color("#666666"),
    "-1": new Awe.Color("#E4562A"),
    "-2": new Awe.Color("#cb3d24")
  }
  
  _i.textColorsByPredictionLight = {
    "2": new Awe.Color("#3b8497"),
    "1": new Awe.Color("#55a6bc"),
    "0": new Awe.Color("#999999"),
    "-1": new Awe.Color("#f8967b"),
    "-2": new Awe.Color("#e36b56")
  }

  _i.sourceRingColorsByPrediction = {
    "2": [new Awe.Color("#23c2ec"), new Awe.Color("#009cc7")],
    "1": [new Awe.Color("#23c2ec"), new Awe.Color("#009cc7")],
    "0": [new Awe.Color("#999999"), new Awe.Color("#999999")],
    "-1": [new Awe.Color("#e4562a"), new Awe.Color("#f1706f")],
    "-2": [new Awe.Color("#f6381d"), new Awe.Color("#cb3d24")]
  }
  
  _i.wordRingColorsByPrediction = {
    "2": new Awe.Color("#8fdff4"),
    "1": new Awe.Color("#b5f3fb"),
    "0": new Awe.Color("#d8dee0"),
    "-1": new Awe.Color("#f7ccbf"),
    "-2": new Awe.Color("#f8c0b5")
  }

  _i.predictionArrowSprites = {
    "2": "arrowStrongGains",
    "1": "arrowMildGains",
    "0": "arrowNoChange",
    "-1": "arrowMildLoss",
    "-2": "arrowStrongLoss"
  }
  
  _i.renderGlow = function(rc, model, x, y, r1, r2, density) {
    var c = rc.canvas;

    var grad = rc.createRadialGradient(x, y, 0, x, y, r2);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(r1 / r2, "rgba(255,255,255,0)");
    grad.addColorStop(r1 / r2, _i.bgColorsByPrediction[model.prediction].toRGBA(density));
    grad.addColorStop(1, _i.bgColorsByPrediction[model.prediction].toRGBA(0));
    rc.fillStyle = grad;
    rc.fillRect(0, 0, c.width, c.height);
  }

  _i.renderSources = function(rc, model, fontScale, x, y, r1, r2, r3, r4, a1, a2, contributing, withWords) {
    var k;
    var r;
    var a;
    var ia1;
    var ia2;

    // If no sources, use a dummy source with no text that fills up the whole region
    var sources = contributing ? model.contributing_sources : model.other_sources;
    sources = sources || {
      "" : {
        contribution: 1,
        normalizedContribution: 1,
        words: [{
          contribution: 1,
          normalizedContribution: 1,
          word: ""
        }]
      }
    }
    
    var sourcesArray = [];
    for (k in sources) {
      sourcesArray.push(sources[k]);
    }

    var angleTotal = a2 - a1 - _i.sourceGap * sourcesArray.length;

    a1 += _i.sourceGap * 0.5;

    if (angleTotal > 0) {
      // Draw sources circle
      rc.lineWidth = r2 - r1;
      r = r2 - rc.lineWidth * 0.5;
      if (!contributing) {
        rc.strokeStyle = "#999999";
      }
      var cols = _i.sourceRingColorsByPrediction[model.prediction];
      a = a1;
      for (var i = 0; i < sourcesArray.length; ++i) {
        var source = sourcesArray[i];
        a2 = a + angleTotal * source.normalizedContribution;
        rc.beginPath();
        if (contributing) {
          rc.strokeStyle = cols[i % cols.length].toHex();
        }
        rc.arc(x, y, r, a, a2, false);

        rc.stroke();
        
        a = a2 + _i.sourceGap;
      }
  
      // Draw the words circle
      rc.lineWidth = r4 - r2;
      r = r4 - rc.lineWidth * 0.5;
  
      a = a1;
      if (contributing) {
        rc.strokeStyle = _i.wordRingColorsByPrediction[model.prediction].toHex();
        rc.fillStyle = _i.textColorsByPredictionLight[model.prediction].toHex();
      } else {
        rc.strokeStyle = "#d8dee0";
        rc.fillStyle = "#999999";
      }
  
      for (var i = 0; i < sourcesArray.length; ++i) {
        var source = sourcesArray[i];
        a2 = a + angleTotal * source.normalizedContribution;
        totalInnerAngle = a2 - a - _i.wordGap * (source.words.length - 1);
  
        if (totalInnerAngle > 0) {
          ia1 = a;
          for (var j = 0; j < source.words.length; ++j) {
            var word = source.words[j];
            ia2 = ia1 + totalInnerAngle * word.normalizedContribution;
            rc.beginPath();
            rc.arc(x, y, r, ia1, ia2, false);
            rc.stroke();
            
            if (withWords) {
              var wa = (ia1 + ia2) * 0.5;
              if (wa < 0) {
                wa += Math.PI * 2;
              }
              var war = wa;
              if (wa > Math.PI * 0.5 && wa < Math.PI * 1.5) {
                war = wa - Math.PI;
                rc.textAlign = "right";
              } else {
                rc.textAlign = "left";
              }
              var fontInterp = ((word.normalizedContribution + source.normalizedContribution) * 0.5 - 0.2) / 0.6;
              fontInterp = Awe.clamp(fontInterp, 0, 1);
              var fontSize = fontScale * Math.round(4 + fontInterp * 5);
              rc.font = "bold " + fontSize + "px sans-serif";
              rc.textBaseline = "middle";
              var tx = x + Math.cos(wa) * r4 * 1.05;
              var ty = y + Math.sin(wa) * r4 * 1.05;
              rc.save();
              rc.translate(tx, ty);
              rc.rotate(war);
              rc.fillText(word.word.toUpperCase(), 0, 0);
              rc.restore();
            }
            ia1 = ia2 + _i.wordGap;
          }
        }
        a = a2 + _i.sourceGap;
      }
    }
  }

  _i.renderCircle = function(rc, model, x, y, r) {
    rc.fillStyle = _i.bgColorsByPrediction[model.prediction].toHex();
    rc.beginPath();
    rc.moveTo(x, y);
    rc.arc(x, y, r, 0, Math.PI * 2, false);
    rc.fill();
  }
  
  _i.renderPie = function(rc, model, x, y, r, a1, a2, a3) {
    // Draw the contributing sources pie piece
    rc.fillStyle = _i.bgColorsByPrediction[model.prediction].toHex();
    rc.beginPath();
    rc.moveTo(x, y);
    rc.arc(x, y, r, a1, a2, false);
    rc.fill();

    // Draw the other sources pie piece
    rc.fillStyle = model.prediction > 0 ? "#c8d0d2" : "#d8dee0";
    rc.beginPath();
    rc.moveTo(x, y);
    rc.arc(x, y, r, a2, a3, false);
    rc.fill();

    // Draw the lines
    rc.lineWidth = 3;
    rc.strokeStyle = "rgba(255,255,255,1)";
    rc.beginPath();
    rc.moveTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
    rc.lineTo(x, y);
    rc.lineTo(x + Math.cos(a2) * r, y + Math.sin(a2) * r);
    rc.stroke();
  }

  _i.renderInnerCircle = function(rc, x, y, r1, r2) {
    rc.lineWidth = r2 - r1;
    var r = r2 - rc.lineWidth * 0.5;
    rc.strokeStyle = "rgba(153,153,153,0.15)";
    rc.beginPath();
    rc.arc(x, y, r, 0, Math.PI * 2, false);
    rc.stroke();
  }

  _i.renderTextSmall = function(rc, model, fontScale, x, y) {
    var c = rc.canvas;
    var textX = c.width * 0.34;
    var textY = y;

    rc.textAlign = "left";
    rc.textBaseline = "middle";

    // Bottom
    rc.font = "normal " + 7 * fontScale + "px sans-serif";
    rc.fillStyle = _i.textColorsByPredictionLight[model.prediction].toHex();
    rc.fillText(model.getStock().getName().toUpperCase(), textX, textY + c.height * 0.04);

    // Sprite
    var spriteSize = 18 * fontScale;
    var def = drawSpriteToContext(_i.predictionArrowSprites[model.prediction], rc, textX, textY - (spriteSize >> 1) - c.height * 0.01 - 1, spriteSize, spriteSize);
    textX += spriteSize + 4;

    // Center
    rc.font = "bold " + 24 * fontScale + "px sans-serif";
    rc.fillStyle = _i.textColorsByPrediction[model.prediction].toHex();
    rc.fillText(model.getTicker(), textX, textY - c.height * 0.01);
  }
  
  _i.renderTextBig = function(rc, model, fontScale, x, y) {
    var c = rc.canvas;
    var textX = c.height * 0.38;
    var textY;
    if (model.prediction < 0 && model.confidence >= 0.5 ||
        model.prediction >= 0 && model.confidence < 0.5) {
      textY = c.height * 0.615;
    } else {
      textY = c.height * 0.4;
    }

    rc.textAlign = "left";
    rc.textBaseline = "middle";

    // Bottom
    rc.font = "normal " + 7 * fontScale + "px sans-serif";
    rc.fillStyle = _i.textColorsByPredictionLight[model.prediction].toHex();
    rc.fillText("CONFIDENCE", textX, textY + c.height * 0.05);

    // Top
    rc.font = "bold " + 12 * fontScale + "px sans-serif";
    rc.fillText(model.getTicker(), textX, textY - c.height * 0.06);

    // Sprite
    var spriteSize = 18 * fontScale;
    var def = drawSpriteToContext(_i.predictionArrowSprites[model.prediction], rc, textX, textY - (spriteSize >> 1) - 2, spriteSize, spriteSize);
    textX += spriteSize + 4;

    // Center
    rc.font = "bold " + 24 * fontScale + "px sans-serif";
    rc.fillStyle = _i.textColorsByPrediction[model.prediction].toHex();
    rc.fillText(model.getConfidenceText(), textX, textY);
  }

  _i.getCircleRadius = function() {
    return _i.circleRadius;
  }
  
  _i.render = function(rc, model, fontScale, withPie, withWords, glow) {
    var c = rc.canvas;
    
    var x = c.width * 0.5;
    var y = c.height * 0.5;
    
    var glowRadius = c.width * 0.47;
    var outerRadius = c.width * 0.35;
    _i.circleRadius = outerRadius / (c.width * 0.5);
    var innerRadius1 = c.width * 0.31;
    var innerRadius2 = c.width * 0.28;
    var innerRadius3 = c.width * 0.25;
    var innerRadius4 = c.width * 0.243;

    var a1;
    if (model.prediction < 0) {
      a1 = Math.PI * 0.5;
    } else {
      a1 = -Math.PI * 0.5;
    }
    var pieAngle = Math.PI * 2 * model.confidence;
    a1 -= pieAngle * 0.5;
    var a3 = a1 + Math.PI * 2;
    var a2 = a1 + pieAngle;

    if (glow) {
      _i.renderGlow(rc, model, x, y, outerRadius, glowRadius, 0.25);
    
      // Just a glow on this pass
      return;
    }

    _i.renderSources(rc, model, fontScale, x, y, innerRadius3, innerRadius2, innerRadius1, outerRadius, a1, a2, true, withWords);
    _i.renderSources(rc, model, fontScale, x, y, innerRadius3, innerRadius2, innerRadius1, outerRadius, a2, a3, false, withWords);

    // Draw the inner words circle overlay
    _i.renderInnerCircle(rc, x, y, innerRadius2, innerRadius1)

    if (withPie) {
      _i.renderPie(rc, model, x, y, innerRadius4, a1, a2, a3);
      _i.renderTextBig(rc, model, fontScale, x, y);
    } else {
      _i.renderCircle(rc, model, x, y, innerRadius4);
      _i.renderTextSmall(rc, model, fontScale, x, y);
    }
  }

  _i.onChange = function() {
    // TODO: If frequent realtime updates are required, canvas updates should be
    // split across multiple frames or lazily updated so that only the current zoom
    // level is affected by new data
    if (!_i.canvases) {
      _i.canvases = {};
      
      _i.canvases.glow = createElement("CANVAS", null, {
        attrs: {
          width: "1024",
          height: "1024",
          fontScale: 4
        }
      });
      _i.canvases.near = createElement("CANVAS", null, {
        attrs: {
          width: "1024",
          height: "1024",
          fontScale: 4
        }
      });
      _i.canvases.mid = createElement("CANVAS", null, {
        attrs: {
          width: "512",
          height: "512",
          fontScale: 2
        }
      });
      _i.canvases.far = createElement("CANVAS", null, {
        attrs: {
          width: "256",
          height: "256",
          fontScale: 1
        }
      });
    } else {
      _i.canvases.glow.getContext('2d').clearRect(0, 0, _i.canvases.glow.width, _i.canvases.glow.height);
      _i.canvases.near.getContext('2d').clearRect(0, 0, _i.canvases.near.width, _i.canvases.near.height);
      _i.canvases.mid.getContext('2d').clearRect(0, 0, _i.canvases.mid.width, _i.canvases.mid.height);
      _i.canvases.far.getContext('2d').clearRect(0, 0, _i.canvases.far.width, _i.canvases.far.height);
    }
    
    var model = _i.model();
    _i.hasGlow = model.prediction == 2 || model.prediction == -2;
    if (_i.hasGlow) {
      _i.render(_i.canvases.glow.getContext('2d'), model, 1, false, false, 1);
    }
    _i.render(_i.canvases.near.getContext('2d'), model, _i.canvases.near.fontScale, true, true);
    _i.render(_i.canvases.mid.getContext('2d'), model, _i.canvases.mid.fontScale, true, false);
    _i.render(_i.canvases.far.getContext('2d'), model, _i.canvases.far.fontScale, false, false);
    
    // Notify subscribers
    _i.dirtyFlag(_i.dirtyFlag()+1);
  }
  
  _i.getCanvasNear = function() {
    return _i.canvases.near;
  }
  
  _i.getCanvasMid = function() {
    return _i.canvases.mid;
  }
  
  _i.getCanvasFar = function() {
    return _i.canvases.far;
  }
  
  _i.getCanvasGlow = function() {
    if (_i.hasGlow) {
      return _i.canvases.glow;
    }
    return null;
  }
  
  model.subscribe(function(model) {
    _i.onChange();
  });
  
  _i.subscribe = function(f) {
    _i.dirtyFlag.subscribe(f);
  }

  _i.onChange();
}
