// View position to screen position scalars for far and near zoom levels
var viewToScreenScalars = [ 550, 2800, 2800*10 ];
var viewZoomMin = 1;
var viewZoomMax = viewToScreenScalars[1] / viewToScreenScalars[0];
var viewZoomDetail = viewToScreenScalars[2] / viewToScreenScalars[0];
var viewZoomRange = viewZoomMax - viewZoomMin;

var ghostCanvasSize = 200;

function _easeIn(p) {
  return 1 - Math.cos(Math.PI * 0.5 * p);
}
function _easeInOut(p) {
  return 1 - (0.5 + 0.5 * Math.cos(Math.PI * p));
}
function _easeOut(p) {
  return Math.sin(Math.PI * 0.5 * p);
}
function _easeNone(p) {
  return p;
}

var _easeFunction;
var easeParam = getParam("ease").toLowerCase();
if (easeParam == "in") {
  _easeFunction = _easeIn;
} else if (easeParam == "out") {
  _easeFunction = _easeOut;
} else if (easeParam == "none") {
  _easeFunction = _easeNone;
} else {
  _easeFunction = _easeInOut;
}

var stockGroupLayoutsByCount = [{}];

function radialPos(radius, rotation) {
  rotation = rotation * Math.PI * 2
  return Geom.point(radius * Math.cos(rotation), radius * Math.sin(rotation));
}

function addStockPositions(groupRadius) {
  var sp = { groupRadius: groupRadius, positions: [] };
  for (var i = 1; i < arguments.length; ++i) {
    sp.positions.push(radialPos(arguments[i][0] * groupRadius, arguments[i][1]));
  }
  sp.positions.sort(function(a, b) {
    return a.y - b.y;
  });
  
  stockGroupLayoutsByCount.push(sp);
}

addStockPositions(0.2, [0,0]);
addStockPositions(0.33, [0.5,0.1], [0.5,0.6]);
addStockPositions(0.4, [0.5,0.1], [0.5,0.43], [0.5, 0.77]);
addStockPositions(0.45, [0.55,0.0], [0.45,0.25], [0.55, 0.5], [0.45, 0.75]);
addStockPositions(0.5, [0.6,0.0], [0.6,0.25], [0.6, 0.5], [0.6, 0.75], [0, 0]);
addStockPositions(0.55, [0.6,0.0], [0.6,0.20], [0.6, 0.4], [0.6, 0.6], [0, 0], [0.6, 0.8]);
addStockPositions(0.6, [0.65,0.1], [0.65,0.267], [0.65, 0.433], [0.65, 0.6], [0, 0], [0.65, 0.767], [0.65, 0.933]);
addStockPositions(0.65, [0.65,1/7], [0.65,2/7], [0.65, 3/7], [0.65, 4/7], [0, 0], [0.65, 5/7], [0.65, 6/7], [0.65, 0]);
addStockPositions(0.7, [0.65,1/8], [0.65,2/8], [0.65, 3/8], [0.65, 4/8], [0, 0], [0.65, 5/8], [0.65, 6/8], [0.65, 7/8], [0.65, 0]);
addStockPositions(0.7, [0.65,1/9], [0.65,2/9], [0.65, 3/9], [0.65, 4/9], [0, 0], [0.65, 5/9], [0.65, 6/9], [0.65, 7/9], [0.65, 8/9], [0.65, 0]);


// Adds view data to a StockGroup
function SummaryViewGroup(_i) {

  _i.view = {};
  
  // Position is in a virtual coordinate system and gets mapped to pixel coordinates by the SummaryView
  _i.setPosition = function(p) {
    _i.view.position = { x: p.x, y: p.y };
  }
  
  _i.getPosition = function() {
    return _i.view.position;
  }

  _i.getTargetPosition = function() {
    return _i.view.targetPosition || _i.view.position;
  }
  
  _i.setTargetPosition = function(p) {
    _i.view.targetPosition = p;
  }
  
  _i.applyTargetPosition = function() {
    _i.view.position = _i.view.targetPosition;
    _i.view.targetPosition = null;
  }
  
  _i.startAnimation = function() {
    if (_i.view.targetPosition) {
      _i.view.animating = true;
      _i.view.animationStartPosition = { x: _i.view.position.x, y: _i.view.position.y };
      _i.view.animationDeltaPosition = Geom.sub(_i.view.targetPosition, _i.view.position);
    }
  }
  
  _i.updateAnimation = function(t) {
    if (_i.view.animating) {
      _i.view.position = Geom.add(_i.view.animationStartPosition, Geom.scale(_i.view.animationDeltaPosition, t));
    }
  }
  
  _i.endAnimation = function() {
    if (_i.view.animating) {
      _i.view.position = _i.view.targetPosition;
      _i.view.animating = false;
    }
    _i.view.targetPosition = null;
  }
  
  _i.setExpanded = function(expanded) {
    if (_i.view.expanded != expanded) {
      _i.view.expanded = expanded;
    }
  }
  
  _i.getExpanded = function() {
    return _i.view.expanded;
  }
  
  _i.getRadius = function() {
    var r = stockGroupLayoutsByCount[_i.stocks.length].groupRadius;
    if (_i.view.expanded) {
      var zoomScale = (1 / gSummaryView.zoom - 1 / viewZoomMin) / (1 / viewZoomMax - 1 / viewZoomMin);
/*       var zoomScale = (gSummaryView.zoom - viewZoomMin) / viewZoomRange; */
      return 0.55 + (0.14 - 0.55) * zoomScale;
    }
    return r;
  }
  
  _i.setRenderedBounds = function(bounds) {
    _i.view.bounds = bounds;
  }
  
  _i.getRenderedBounds = function() {
    return _i.view.bounds;
  }
  
  _i.remove = function() {
  }
  
  _i.arrangeStocks = function() {
    _i.view.stockPositions = [];
    
    var stocksSorted = [];
    for (var i = 0; i <  _i.stocks.length; ++i) {
      stocksSorted.push({stock: gData.getStockPredictions()[_i.stocks[i]](), index: i});
    }
    
    stocksSorted.sort(function(a, b) {
      var scoreA = a.stock.prediction + a.stock.confidence * Awe.sign(a.stock.prediction);
      var scoreB = b.stock.prediction + b.stock.confidence * Awe.sign(b.stock.prediction);
      return scoreB - scoreA;
    });
    
    for (var i = 0; i < stocksSorted.length; ++i) {
      _i.view.stockPositions[stocksSorted[i].index] = stockGroupLayoutsByCount[stocksSorted.length].positions[i];
    }
/*    
    if (_i.stocks.length == 1) {
      _i.view.stockPositions.push({ x: 0, y: 0 });
    } else {
      var innerCircleRadius = _i.getRadius() * 0.24;
      var outerCircleRadius;
      var innerCircleCount = 0;
      
      if (_i.stocks.length < 5) {
        outerCircleRadius = _i.getRadius() * 0.5;
      } else {
        outerCircleRadius = _i.getRadius() * 0.68;
        if (_i.stocks.length > 7) {
          innerCircleCount = 2;
        } else {
          innerCircleCount = 1;
          innerCircleRadius = 0;
        }
      }
      var outerCircleCount = _i.stocks.length - innerCircleCount;
      var a = 0;
      var d = Math.PI * 2 / outerCircleCount;
      for (var i = 0; i < outerCircleCount; ++i) {
        _i.view.stockPositions.push({ x: Math.cos(a) * outerCircleRadius, y: Math.sin(a) * outerCircleRadius });
        a += d;
      }
      a = Math.random() * Math.PI;
      d = Math.PI * 2 / innerCircleCount;
      for (var i = 0; i < innerCircleCount; ++i) {
        _i.view.stockPositions.push({ x: Math.cos(a) * innerCircleRadius, y: Math.sin(a) * innerCircleRadius });
        a += d;
      }
    }
*/
  }
  
  _i.arrangeStocks();
}

function SummaryViewZoomControl(parent, x, y, zoomAccessor) {
  
  var thumbWidth = 40;
  var thumbHeight = 30;
  var sliderWidth = 10;
  var sliderHeight = 150;
  
  var sliderOffsetX = (thumbWidth - sliderWidth) * 0.5;
  var sliderOffsetY = thumbHeight * 0.5;
  
  window.test = zoomAccessor;

  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      left: x + sliderOffsetX + "px",
      top: y + sliderOffsetY + "px",
      width: sliderWidth + "px",
      height: sliderHeight + "px",
      backgroundColor: "#aaaaaa",
      borderRadius: "3px"
    }
  })

  var thumb = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      left: x + "px",
      top: y + (viewZoomMax - zoomAccessor()) * sliderHeight / viewZoomRange + "px",
      width: thumbWidth + "px",
      height: thumbHeight + "px",
      backgroundColor: "#dddddd",
      borderRadius: "5px"
    }
  })

  Awe.enableDrag(thumb, {
    anchor: new Awe.DragAnchorTopLeft(),
    filters: new Awe.DragFilterLimitAxes(x, x, y, y + sliderHeight),
    updater: new Awe.DragUpdaterTopLeft(),
    onDragMove: function(event) {
      var zoom = viewZoomMax - viewZoomRange * (event.pos.y - y) / sliderHeight;
      zoomAccessor(zoom);
    }
  })
  
  _i.onZoomChanged = function(zoom) {
    thumb.style.top = y + (viewZoomMax - zoom) * sliderHeight / viewZoomRange + "px";
  }
  
  return _i;
}

var editNamePopupWidth = 350;
var editNamePopupHeight = 185;

function createEditNamePopup(_i) {
  var popup = Popup(_i, editNamePopupWidth, editNamePopupHeight, "Group name", "Set the group name:");
  
  var input = createElement("INPUT", popup.content(), {
    attrs: {
      placeholder: "Enter group name"
    }, styles: {
      width: "300px",
      height: "31px",
      lineHeight: "30px",
      fontSize: "20px",
      color: "#000000",
      paddingLeft: "7px",
      marginTop: "10px"
    }
  });
  
  xAddEventListener(input, "keydown", function(evt) {
    if (evt.keyCode == 13) {
      Awe.hidePopup(popup);
      //TODO: Change group name
      //itemSelected(selectedSuggestion);
      if (input.value) {
        popup.group.name(input.value);
        gSummaryView.dirty = true;
      }
    }
  });
  
  popup.superShow = popup.show;
  
  popup.show = function(x, y, group) {
    popup.superShow(x, y);
    input.focus();
    popup.group = group;
    input.value = group.name();
  }

  return popup;
}

function SummaryView(parent, context, width, height) {

  var canvasWidth = width;
  
  var contentLeft = 0;

  var _i = createElement("DIV", parent, {
    styles: {
      width: canvasWidth + "px",
      height: (height || 0) + "px",
      backgroundColor: "#f8f8f8"
    }
  })
  
  _i.cameraPosition = { x: 0, y: 0 };
  
  // zoom == viewZoomMin: zoomed out, zoom == viewZoomMax: zoomed in
  _i.zoom = viewZoomMin;

  _i.globalAlpha = 1;
  
  _i.stockCanvasBlend = 0;
  _i.stockCanvasTarget = 0;

  function zoom(value, snap) {
    if (arguments.length > 0) {
      if (_i.zoom < value) {
        // TODO: Change to a state that blends the expanded value for the current expanded prediction from 1 down to zero?
        //_i.setExpandedPrediction(null);
      }
      _i.zoom = value;
      if (_i.zoom < (viewZoomMin + viewZoomRange * 0.2)) {
        _i.stockCanvasTarget = 0;
      } else if (_i.zoom < (viewZoomMin + viewZoomRange * 0.7)) {
        _i.stockCanvasTarget = 1;
      } else {
        _i.stockCanvasTarget = 2;
      }
      if (snap) {
        _i.stockCanvasBlend = _i.stockCanvasTarget;
      }
      _i.dirty = true;
      _i.zoomControl.onZoomChanged(_i.zoom);
    } else {
      return _i.zoom;
    }
  }
  
  _i.resize = function(appWidth, appHeight, w, h) {
    _i.appWidth = appWidth;
    _i.appHeight = appHeight;
    canvas.height = h;
    canvasWidth = w;
    _i.style.height = h + "px";
    _i.style.width = canvasWidth + "px";
    canvas.width = canvasWidth;
    _i.dirty = true;
  }
  
  _i.update = function() {
    if (_i.stateMachine.getCurrentStateId() != "zoomedAndNotVisible") {
      if (_i.stockCanvasBlend != _i.stockCanvasTarget) {
        var diff = _i.stockCanvasTarget - _i.stockCanvasBlend;
        if (Math.abs(diff) < 0.05) {
          _i.stockCanvasBlend = _i.stockCanvasTarget;
        } else {
          _i.stockCanvasBlend += diff * 0.1;
        }
        _i.dirty = true;
      }
      
      if (_i.dirty) {
      
        drawCanvas();
        _i.dirty = false;
      }
    }
  }

  _i.hitTestGroup = function(pos) {
    pos = { x: pos.x, y: pos.y - xPageY(_i) };
    var groups = gData.groups();
    for (var i = 0; i < groups.length; ++i) {
      var g = groups[i];
      
      var p = g.getPosition();
      var r = g.getRadius();
      p = viewToScreenPos(p);
      r = viewToScreenOffset(r);
      
      if (Geom.distSquared(p, pos) < r * r) {
        return { group: g };
      }
    }
  }

  _i.hitTestGroupName = function(pos) {
    pos = { x: pos.x, y: pos.y - xPageY(_i) };
    var groups = gData.groups();
    for (var i = 0; i < groups.length; ++i) {
      var g = groups[i];
      var bounds = g.getRenderedBounds();
      if (bounds)
      if (bounds &&
          pos.x >= bounds.x && pos.x < (bounds.x + bounds.width) &&
          pos.y >= bounds.y && pos.y < (bounds.y + bounds.height)) {
        return { group: g };
      }
    }
    return null;
  }
  
  _i.hitTestStock = function(pos) {
    pos = { x: pos.x, y: pos.y - xPageY(_i) };
    var views = gData.getStockPredictionViews();
    var viewPos = screenToViewPos(pos);
    var groups = gData.groups();
    for (var i = 0; i < groups.length; ++i) {
      var g = groups[i];
      var groupPos = g.getPosition();
      
      var stockRadius = getStockSize(g.getExpanded()) * 0.5;

      for (var j = 0; j < g.stocks.length; ++j) {
        var view = views[g.stocks[j]];
        var stockPos = g.view.stockPositions[j];
        stockPos = { x: stockPos.x + groupPos.x, y: stockPos.y + groupPos.y };
        var distSquared = (stockPos.x - viewPos.x) * (stockPos.x - viewPos.x) + (stockPos.y - viewPos.y) * (stockPos.y - viewPos.y);
        if (distSquared < stockRadius*view.getCircleRadius()*stockRadius*view.getCircleRadius()) {
          return { group: g, stockIndex: j, stockPosition: stockPos, stock: g.stocks[j] };
        }
      }
    }
    return null;
  }
  
  _i.clickHandler = function(pos) {
    var hit = _i.hitTestStock(pos);
    if (hit) {
      if (_i.centeredPrediction && _i.centeredPrediction.group == hit.group && _i.centeredPrediction.index == hit.stockIndex) {
        var prediction = gData.getStockPredictions()[hit.stock];
        if (prediction) {
          _i.stateMachine.requestTransitionState("zoomDetails", true, function() {
            _i.stateMachine.requestState("zoomedAndNotVisible");
            context.selectedStock(prediction().getStock());
            context.page("Detail");
          });
        }
      } else {
        _i.stateMachine.requestTransitionState("zoomToStock", hit.stockPosition, "default");
      }
    } else {
      hit = _i.hitTestGroupName(pos);
      if (hit) {
//        console.log("Hit group "+hit.group.name());
        var px = pos.x - (editNamePopupWidth >> 2);
        var py = pos.y - editNamePopupHeight - 50;
        if (py < 0) {
          py = pos.y + 50;
        }
        if (px + editNamePopupWidth > gSummaryView.appWidth) {
          px = gSummaryView.appWidth - editNamePopupWidth;
        }
        popup.show(pos.x, pos.y, hit.group);
      }
    }
  }

  var popup = createEditNamePopup(_i);
  
  var canvas = createElement("CANVAS", _i, {
    attrs: {
      width: canvasWidth,
      height: height,
    },
    styles: {
      cursor: "pointer"
    }
  })
  
  Awe.enableDrag(canvas, {
    filters: new Awe.DragFilterMomentum(),
    updater: {
      move: function(el, event) {
      // Apply delta to camera position
        switch (_i.stateMachine.getCurrentStateId()) {
        case "default":
          _i.cameraPosition.x -= screenToViewOffset(event.delta.x);
          _i.cameraPosition.y -= screenToViewOffset(event.delta.y);
          _i.dirty = true;
          break;
        case "moveStock":
          break;
        }
      }
    },
    onDragMove: function(event) {
    },
    onDragUpdate: function(event) {
      switch (_i.stateMachine.getCurrentStateId()) {
      
      case "default":
        var hit = null;
        if (event.maxDistanceSquared < 3 * 3 && event.dragTime > 0.2) {
          hit = _i.hitTestStock(event.clientPos);
        }
        if (hit) {
          // Change state
          _i.stateMachine.requestState("moveStock", hit.stock, hit.group, hit.stockIndex, event.clientPos);
        }
        break;

      case "moveStock":
        var scrollMargin = 100;
        var x = event.clientPos.x;
        var y = event.clientPos.y;
        var marginX = 0;
        var marginY = 0;
        if (x > _i.appWidth - scrollMargin) {
          marginX = x - (_i.appWidth - scrollMargin);
        } else if (x < scrollMargin) {
          marginX = x - scrollMargin;
        }
        if (y > _i.appHeight - scrollMargin) {
          marginY = y - (_i.appHeight - scrollMargin);
        } else if (y < scrollMargin) {
          marginY = y - scrollMargin;
        }
        if (marginX || marginY) {
          marginX = Awe.clamp(marginX, -25, 25);
          marginY = Awe.clamp(marginY, -25, 25);
          _i.cameraPosition.x += screenToViewOffset(marginX);
          _i.cameraPosition.y += screenToViewOffset(marginY);
          _i.dirty = true;
        } else {
          _i.ghost.style.left = x - ghostCanvasSize * 0.5 + "px";
          _i.ghost.style.top = y - ghostCanvasSize * 0.5 + "px";
        }
        break;
      }
    },
    onDragEnd: function(event) {
      if (_i.stateMachine.getCurrentStateId() == "moveStock") {
        // Hit detection
        var hit = _i.hitTestGroup(event.clientPos);

        if (hit) {
          if (hit.group == _i.ghost.fromGroup) {
            //console.log("Dropped on same group, no change");
            _i.stateMachine.requestState("default");
          } else {
            //console.log("Moving to different group");
            var stock = _i.ghost.fromGroup.stocks[_i.ghost.fromStockIndex];
            var fromGroupName = _i.ghost.fromGroup.name();
            if (hit.group.stocks.length >= gConstants.maxStocksInGroup) {
              alert("That group is full. The stock was returned to the " + fromGroupName + " group");
              _i.stateMachine.requestState("default");
            } else if (hit.group.stocks.indexOf(stock) >= 0) {
              alert("Stock " + stock + " already exists in that group. The stock was returned to the " + fromGroupName + " group");
              _i.stateMachine.requestState("default");
            } else {
              if (_i.ghost.fromGroup.stocks.length == 1) {
                gService.deleteGroup(_i.ghost.fromGroup);
              } else {
                _i.ghost.fromGroup.removeStockByIndex(_i.ghost.fromStockIndex);
                _i.ghost.fromGroup.arrangeStocks();
                gService.saveGroup(_i.ghost.fromGroup);
              }
              _i.setExpandedPrediction(null);
              hit.group.addStock(stock);
              hit.group.arrangeStocks();
              gService.saveGroup(hit.group);

              _i.realignGroups(hit.group);
              _i.stateMachine.requestTransitionState("realigningGroups", false, "default");
            }
          }
        } else {
          //console.log("Creating new group");
          var stock = _i.ghost.fromGroup.stocks[_i.ghost.fromStockIndex];
          if (_i.ghost.fromGroup.stocks.length == 1) {
            gService.deleteGroup(_i.ghost.fromGroup);
          } else {
            _i.ghost.fromGroup.removeStockByIndex(_i.ghost.fromStockIndex);
            _i.ghost.fromGroup.arrangeStocks();
            gService.saveGroup(_i.ghost.fromGroup);
          }
          _i.addStockNewGroup(stock, event.clientPos);
        }

      } else if (event.maxDistanceSquared < 4 * 4) {
        _i.clickHandler(event.pos);
      }
    }
  })

  var rc = canvas.getContext('2d');

  _i.zoomControl = SummaryViewZoomControl(_i, contentLeft + 10, 100, zoom);
  
  function viewToScreenPos(p) {
    var scale = viewToScreenScalars[0] * _i.zoom;
    return {
      x: canvas.width * 0.5 + (p.x - _i.cameraPosition.x) * scale,
      y: canvas.height * 0.5 + (p.y - _i.cameraPosition.y) * scale
    }
  }

  function viewToScreenOffset(o) {
    var scale = viewToScreenScalars[0] * _i.zoom;
    return o * scale;
  }

  function screenToViewPos(p) {
    var scale = 1 / (viewToScreenScalars[0] * _i.zoom);
    return {
      x: _i.cameraPosition.x + (p.x - canvas.width * 0.5) * scale,
      y: _i.cameraPosition.y + (p.y - canvas.height * 0.5) * scale
    }
  }

  function screenToViewOffset(o) {
    var scale = viewToScreenScalars[0] * _i.zoom;
    return o / scale;
  }

  // Returns the width/height of a stock render in view coordinates
  function getStockSize(expanded) {
    var s = 0.25;
    if (expanded) {
      var zoomScale = (1 / gSummaryView.zoom - 1 / viewZoomMin) / (1 / viewZoomMax - 1 / viewZoomMin);
      s = 1 + (s - 1) * zoomScale;
    }
    return s;
  }

  function drawGroup(g) {
    var p = g.getPosition();
    var r = g.getRadius();
    p = viewToScreenPos(p);
    r = viewToScreenOffset(r);

    // Render the circle if it's on-screen
    if (p.x + r > 0 && p.x - r < canvas.width &&
        p.y + r > 0 && p.y - r < canvas.height) {
      rc.fillStyle = "#f0f0f0";
      rc.beginPath();
      rc.moveTo(p.x, p.y);
      rc.arc(p.x, p.y, r, 0, Math.PI * 2, false);
      rc.fill();
      
/*
      var nameW = r * 1.3;
      var nameH = r * 0.4;
      var nameY = r * 0.1;
      canvasRoundRect(rc, p.x - nameW * 0.5, p.y + r + nameY - nameH, nameW, nameH, r * 0.05);
      rc.fill();
*/

      rc.fillStyle = "#999999";
      rc.textAlign = "center";
      rc.textBaseline = "middle";
      var textHeight = Math.round(r * 0.2);
      rc.font = textHeight + "px sans-serif";
      var textY = p.y + r * 1.15;
      rc.fillText(g.name(), p.x, textY);
      var textMetrics = rc.measureText(g.name());
      
      g.setRenderedBounds({
        x: p.x - textMetrics.width * 0.5,
        y: textY - textHeight * 0.5,
        width: textMetrics.width,
        height: textHeight
      })

      var views = gData.getStockPredictionViews();
      
      var adjustedBlend = _i.stockCanvasBlend;
      if (g.getExpanded()) {
        adjustedBlend = adjustedBlend + (2 - adjustedBlend) * g.getExpanded();
      }
      
      var firstCanvas = Math.floor(adjustedBlend);
      var secondCanvas = firstCanvas + 1;
      var blend = adjustedBlend - firstCanvas;

      var size = viewToScreenOffset(getStockSize(g.getExpanded()));
      var halfSize = size * 0.5;
      
      for (var i = 0; i < g.stocks.length; ++i) {
        var alpha = 1;
        if (_i.ghost && _i.ghost.fromGroup == g && _i.ghost.fromStockIndex == i) {
          alpha = 0.4;
          rc.globalAlpha = alpha;
        }
        var view = views[g.stocks[i]];
        var canvases = [view.getCanvasFar(), view.getCanvasMid(), view.getCanvasNear()]
        var glowCanvas = view.getCanvasGlow();
        var pos = g.view.stockPositions[i];
        pos = { x: viewToScreenOffset(pos.x) + p.x, y: viewToScreenOffset(pos.y) + p.y };
        if (pos.x + halfSize > 0 && pos.x - halfSize < canvas.width &&
            pos.y + halfSize > 0 && pos.y - halfSize < canvas.height) {
          if (view) {
            if (glowCanvas) {
              rc.drawImage(glowCanvas, pos.x - size * 0.5, pos.y - size * 0.5, Math.round(size), Math.round(size));
            }
            rc.drawImage(canvases[firstCanvas], pos.x - size * 0.5, pos.y - size * 0.5, Math.round(size), Math.round(size));
            if (blend && _i.globalAlpha == 1) {
              rc.globalAlpha = blend * alpha;
              rc.drawImage(canvases[secondCanvas], pos.x - size * 0.5, pos.y - size * 0.5, Math.round(size), Math.round(size));
              rc.globalAlpha = alpha;
            }
  
            // Is this stock centered at full zoom?
            if (_i.zoom >= viewZoomMax) {
              var distanceFromCenterOfScreen = (pos.x - canvas.width * 0.5) * (pos.x - canvas.width * 0.5) + (pos.y - canvas.height * 0.5) * (pos.y - canvas.height * 0.5);
              if (distanceFromCenterOfScreen < 50 * 50) {
                _i.centeredPrediction = {
                  group: g,
                  index: i,
                  pos: { x: pos.x, y: pos.y }
                }
              }
            }
          } else {
            // TODO: Find missing stocks!
          }
        }
        if (alpha != 1) {
          // Restore the temporary alpha change
          rc.globalAlpha = 1;
        }
      }

      if (_i.centeredPrediction) {
        var x = _i.centeredPrediction.pos.x;
        var y = _i.centeredPrediction.pos.y;
        var w = 120;
        var h = 25;
        rc.fillStyle = "rgba(255,255,255,0.6)";
        canvasRoundRect(rc, x - w * 0.5, y - h * 0.5, w, h, 10);
        rc.fill();
//        rc.fillRect(x - w * 0.5, y - h * 0.5, w, h);
        rc.fillStyle = "rgba(0,0,0,0.4)";
        rc.textAlign = "center";
        rc.textBaseline = "middle";
        rc.font = "14px sans-serif";
        var text = (Awe.env.inputTouch ? "Tap" : "Click") + " for details"
        rc.fillText(text, _i.centeredPrediction.pos.x, _i.centeredPrediction.pos.y);
      }
    }
  }
  
  function drawCanvas() {

    _i.centeredPrediction = null;
    
    rc.globalAlpha = 1;
    rc.clearRect(0, 0, canvas.width, canvas.height);

    if (_i.globalAlpha != 1) {
      rc.globalAlpha = _i.globalAlpha;
    }
    var groups = gData.groups();
    
    if (groups.length) {
      for (var i = 0; i < groups.length; ++i) {
        var g = groups[i];
        drawGroup(g);
      }
    } else {
      var p1 = { x: canvas.width * 0.5, y: canvas.height * 0.5 - 30 };
      var p2 = { x: canvas.width - 145, y: 20 };
    
      rc.fillStyle = "rgba(0,0,0,0.4)";
      rc.textAlign = "center";
      rc.textBaseline = "middle";
      rc.font = "32px sans-serif";
      var text = "Use the search box to find stocks and add them to this view";
      rc.fillText(text, p1.x, p1.y);
      rc.font = "20px sans-serif";
      var text = "Once you've added stocks, you can see our predictions and organize them into groups";
      rc.fillText(text, p1.x, p1.y + 40);
      
      rc.beginPath();
      rc.strokeStyle = "#90cdf5";
      rc.lineWidth = 10;
      rc.moveTo(p2.x, p2.y);
      rc.lineTo(p2.x, p2.y + 50);
      rc.moveTo(p2.x - 20, p2.y + 20);
      rc.lineTo(p2.x, p2.y);
      rc.lineTo(p2.x + 20, p2.y + 20);
      rc.stroke();
    }
  }

  // Seperate overlapping groups and potentially move groups closer if they're spaced too far apart.
  // If a fixed group parameter is supplied then that group stays in the same position and other groups handle the seperation.
  _i.realignGroups = function(fixedGroup, fixedPoint, immediate) {

    var seperation = 0.2;
    
    var groups = gData.groups();

    if (!groups.length) {
      return;
    }
    
    fixedGroup = fixedGroup || null;
    
    if (!fixedGroup) {
      // Create a fake fixed group using a fixed point with zero radius
      fixedGroup = {
        getTargetPosition: function() {
          return fixedPoint;
        },
        getRadius: function() {
          return 0;
        },
      }
    }
    
    // Build a list of fixed and moveable groups
    var groupsComplete = [fixedGroup];
    var groupsLeft = [];
    
    for (var i = 0; i < groups.length; ++i) {
      var g = groups[i];
      if (g != fixedGroup) {
        groupsLeft.push(g);
      }
      // Clear the target position
      g.setTargetPosition(null);
    }

    // A quick overlap test
    function groupsOverlap(g1, g2) {
      var distSquared = Geom.distSquared(g1.getTargetPosition(), g2.getTargetPosition());
      var minDistance = (g1.getRadius() + g2.getRadius() + seperation);
      return distSquared < minDistance * minDistance;
    }
    
    // A more expensive test that calculates the overlap distance (-ve distance means overlap by that amount, +ve distance means separation at that distance)
    function groupDistance(g1, g2) {
      var dist = Geom.dist(g1.getTargetPosition(), g2.getTargetPosition());
      return dist - (g1.getRadius() + g2.getRadius() + seperation);
    }
    
    groupsLeft.sort(function(a, b) {
      return groupDistance(a, fixedGroup) - groupDistance(b, fixedGroup);
    });    

    while (groupsLeft.length) {
      // Plenty of optimization opportunities here
      var g = groupsLeft.shift();
      var overlapsResolved = 0;
      var overlaps;
      
      do {
        overlaps = 0;
        
        for (var i = 0; i < groupsComplete.length; ++i) {
          if (groupsOverlap(g, groupsComplete[i])) {
            ++overlaps;
            // TODO: Resolve overlap
            
            // Overlap is resolved by moving group g away from pos fixedGroup.getPosition() until overlap with groupsComplete[i] no longer occurs
            // This is resolved using
            
            // Calc distance of overlapping stock from movement vector
            
            // TODO: Optimize for case where groupsComplete[i] == fixedGroup because if it is, toCollider is identity and calculations are easy
            
            var toG = Geom.sub(g.getTargetPosition(), fixedGroup.getTargetPosition());
            var d = Geom.length(toG);
            var toGNorm;
            if (d == 0) {
              // Seperate coincident points along a random vector
              var angle = Math.random() * Math.PI * 2;
              toGNorm = { x: Math.cos(angle), y: Math.sin(angle) };
            } else {
              toGNorm = { x: toG.x / d, y: toG.y / d };
            }
            var toCollider = Geom.sub(groupsComplete[i].getTargetPosition(), fixedGroup.getTargetPosition());
            var h = Geom.length(toCollider);
            var dp = Geom.dot(toCollider, toGNorm);
            var angle;
            if (h == 0) {
              angle = 0;
            } else {
              angle = Awe.acosSafe(dp / h);
            }
            var distToLine = Math.sin(angle) * h;
            var projCollider = dp;
            var seperationDistance = g.getRadius() + groupsComplete[i].getRadius() + seperation * 1.1;
            var distance = projCollider + Math.sqrt(seperationDistance * seperationDistance - distToLine * distToLine);
            g.setTargetPosition(Geom.add(fixedGroup.getTargetPosition(), Geom.scale(toGNorm, distance)));
            
            ++overlapsResolved;
          }
        }
        
      } while (overlaps);
      
      if (!overlapsResolved) {
        // There were no overlaps, so instead, look for space to be filled

        // Precalculate some vectors
        var toG = Geom.sub(fixedGroup.getTargetPosition(), g.getTargetPosition());
        var d = Geom.length(toG);
        var toGNorm = { x: toG.x / d, y: toG.y / d };
        
        // Start off with maximum move distance
        var moveDistance = d;
        //console.log("Compressing ",g.name(),"...");
        
        for (var i = 0; i < groupsComplete.length; ++i) {
          var collider = groupsComplete[i];
          var toCollider = Geom.sub(collider.getTargetPosition(), g.getTargetPosition());
          var h = Geom.length(toCollider);
          var seperationDistance = g.getRadius() + collider.getRadius() + seperation;// * 1.1;
          
          var dp = Geom.dot(toGNorm, toCollider);
          var angle;
          if (h == 0) {
            angle = 0;
          } else {
            angle = Awe.acosSafe(dp / h);
          }
          var distToLine = Math.sin(angle) * h;
          if (distToLine >= seperationDistance) {
            // No collision
            //console.log("Compressing ",g.name(), ", ignoring collider ", collider.name(), " due to vars",distToLine, seperationDistance);
            continue;
          }
          
          var currentDistanceProjectionOntoToG = Math.sqrt(h * h - distToLine * distToLine);
          var collisionDistanceProjectionOntoToG = Math.sqrt(seperationDistance * seperationDistance - distToLine * distToLine);
          var moveAllowed = currentDistanceProjectionOntoToG - collisionDistanceProjectionOntoToG;
          if (isNaN(moveAllowed)) {
            console.log(currentDistanceProjectionOntoToG, collisionDistanceProjectionOntoToG, h, dp, angle, seperationDistance)
          }
          if (moveAllowed >= 0 && moveAllowed < moveDistance) {
            // This collision clips the move distance
            //console.log("moveAllowed = ",moveAllowed);
            moveDistance = moveAllowed;
          }
        }
        
        if (moveDistance > 0) {
          // Move toward the fixed point by the move distance
          g.setTargetPosition(Geom.add(g.getTargetPosition(), Geom.scale(toGNorm, moveDistance)));
        }
      }
      
      groupsComplete.push(g);
    }
    
    if (immediate) {
      for (var i = 0; i < groups.length; ++i) {
        var g = groups[i];
        if (g != fixedGroup) {
          // Clear the target position
          g.applyTargetPosition();
        }
      }
    }
  }
  
  _i.addGroup = function(group, position) {
    group.setPosition(position);
    
    _i.realignGroups(group);
  }
  
  // TODO: Get rid of this?
  _i.layoutGroups = function() {
    var groups = gData.groups();

    var columns = Math.min(3, groups.length);
    var rows = Math.min(1, Math.ceil(rows / columns));

    var x = 0;
    var y = 0;
    
    for (var i = 0; i < groups.length; ++i) {
      var g = groups[i];
      g.setPosition({ x: x * 1.1, y: y * 1.1 });
      if (++x >= columns) {
        x = 0;
        ++y;
      }
    }
  }

  _i.addStockNewGroup = function(stock, pos, expanded) {
    var g = StockGroup();
    g.addStock(stock);
    gService.createGroup(g);
    SummaryViewGroup(g);

    if (expanded) {
      _i.setExpandedPrediction({
        group: g,
        index: 0,
        pos: { x: pos.x, y: pos.y }
      });
    }

    _i.addGroup(g, screenToViewPos(pos));

    _i.stateMachine.requestTransitionState("realigningGroups", true, "default");
    return g;
  }
  
  _i.setExpandedPrediction = function(p) {
    if (p != _i.expandedPrediction) {
      if (_i.expandedPrediction) {
        _i.expandedPrediction.group.setExpanded(false);
      }
      if (p) {
        p.group.setExpanded(1);
      } else {
        _i.realignGroups(_i.expandedPrediction.group);
      }
      _i.expandedPrediction = p;
      _i.dirty = true;
    }
  }
  
  _i.searchFor = function(stock) {
    var pos = {
      x: canvas.width * 0.70,
      y: canvas.height * 0.5
    }

    function addStock(stock, pos) {
      _i.addStockNewGroup(stock, pos, true);
    }
    
    if (!gData.getStocks()[stock]) {
      gService.getStock(stock, function() {
        gService.getStockPrediction(stock, function() {
          addStock(stock, pos);
        });
      });
    } else {
      addStock(stock, pos);
    }
  }
  
  var summaryViewStates = {
    "default": { },
    "zoomedAndNotVisible": {
      start: function() {
        _i.style.display = "none";
      },
      end: function() {
        _i.style.display = "block";
      }
    },
    "zoomToStock": {
      start: function(last, stockPos) {
        this.startCameraPosition = { x: _i.cameraPosition.x, y: _i.cameraPosition.y };
        this.startZoomInverse = 1 / zoom();
        this.deltaCameraPosition = { x: stockPos.x - this.startCameraPosition.x, y: stockPos.y - this.startCameraPosition.y };
        this.deltaZoomInverse = 1 / viewZoomMax - this.startZoomInverse;
        this.transitionTime = 0.3;
      },
      update: function() {
        var t = Math.min(1, this.runTime / this.transitionTime);
        if (t < 1) {
          t = _easeFunction(t);
        }
        _i.cameraPosition.x = this.startCameraPosition.x + this.deltaCameraPosition.x * t;
        _i.cameraPosition.y = this.startCameraPosition.y + this.deltaCameraPosition.y * t;
        zoom(1 / (this.startZoomInverse + this.deltaZoomInverse * t));
        _i.dirty = true;
        if (t >= 1) {
          // Done
          zoom(viewZoomMax);
          return true;
        }
      }
    },
    "realigningGroups": {
      start: function(last, zoomOut) {
        var groups = gData.groups();
        for (var i = 0; i < groups.length; ++i) {
          var g = groups[i];
          g.startAnimation();
        }
        this.transitionTime = 0.2;
        this.zoomOut = zoomOut;
        if (zoomOut) {
          this.startZoomInverse = 1 / zoom();
          this.deltaZoomInverse = 1 / viewZoomMin - this.startZoomInverse;
        }
      },
      update: function() {
        var t = Math.min(1, this.runTime / this.transitionTime);
        if (t < 1) {
          t = _easeFunction(t);
        }
        var groups = gData.groups();
        for (var i = 0; i < groups.length; ++i) {
          var g = groups[i];
          g.updateAnimation(t);
        }
        if (this.zoomOut) {
          zoom(1 / (this.startZoomInverse + this.deltaZoomInverse * t));
        }
        _i.dirty = true;
        if (t >= 1) {
          return true;
        }
      },
      end: function() {
        var groups = gData.groups();
        for (var i = 0; i < groups.length; ++i) {
          var g = groups[i];
          g.endAnimation();
        }
        _i.dirty = true;
      }
    },
    "zoomDetails": {
      start: function(last, zoomIn) {
        this.startCameraPosition = { x: _i.cameraPosition.x, y: _i.cameraPosition.y };
        this.fadeOut = zoomIn;
        if (zoomIn) {
          this.returnTo = { x: _i.cameraPosition.x, y: _i.cameraPosition.y };
          this.startZoomInverse = 1 / zoom();
          this.deltaCameraPosition = { x: 0.2, y: -0.09 };
          this.deltaZoomInverse = 1 / viewZoomDetail - this.startZoomInverse;
          _i.globalAlpha = 1;
        } else {
          if (this.returnTo) {
            this.startZoomInverse = 1 / viewZoomDetail;
            this.deltaZoomInverse = 1 / viewZoomMax - this.startZoomInverse;
            this.deltaCameraPosition = { x: this.returnTo.x - this.startCameraPosition.x, y: this.returnTo.y - this.startCameraPosition.y };
          } else {
            // Didn't zoom in, so can't zoom out
            throw "Bad state!"
          }
          _i.globalAlpha = 0;
        }
        this.transitionTime = 0.4;
      },
      update: function() {
        var t = Math.min(1, this.runTime / this.transitionTime);
        if (t < 1) {
          t = _easeFunction(t);
        }
        _i.cameraPosition.x = this.startCameraPosition.x + this.deltaCameraPosition.x * t;
        _i.cameraPosition.y = this.startCameraPosition.y + this.deltaCameraPosition.y * t;
        _i.zoom = 1 / (this.startZoomInverse + this.deltaZoomInverse * t);
        if (this.fadeOut) {
          _i.globalAlpha = 1 - t;
        } else {
          _i.globalAlpha = t;
        }
        _i.dirty = true;
        if (t >= 1) {
          // Done
          return true;
        }
      }
    },
    "moveStock": {
      start: function(last, stock, group, stockIndex, pos) {
        // Create the draggable stock
        var view = gData.getStockPredictionViews()[stock];
        if (view) {
          var canvas = view.getCanvasFar();
          var glowCanvas = view.getCanvasGlow();
          _i.ghost = createElement("CANVAS", _i, {
            attrs: {
              width: ghostCanvasSize,
              height: ghostCanvasSize
            },
            styles: {
              position: "absolute",
              left: pos.x - ghostCanvasSize * 0.5 + "px",
              top: pos.y - ghostCanvasSize * 0.5 + "px"
            }
          });
          _i.ghost.fromGroup = group;
          _i.ghost.fromStockIndex = stockIndex;
          ghostContext = _i.ghost.getContext('2d');
          if (glowCanvas) {
            ghostContext.drawImage(glowCanvas, 0, 0, _i.ghost.width, _i.ghost.height);
          }
          ghostContext.drawImage(canvas, 0, 0, _i.ghost.width, _i.ghost.height);
          _i.dirty = true;
        }
        
        // Set up zoom
        this.startZoomInverse = 1 / zoom();
        this.deltaZoomInverse = 1 / viewZoomMin - this.startZoomInverse;
        this.transitionTime = 0.1 + 0.1 * (zoom() - viewZoomMin) / viewZoomRange;
      },
      update: function() {
        if (this.transitionTime) {
          var t = Math.min(1, this.runTime / this.transitionTime);
          if (t < 1) {
            t = _easeFunction(t);
          }
          var z = 1 / (this.startZoomInverse + this.deltaZoomInverse * t);
          if (zoom() != z) {
            zoom(z);
          }
        }
      },
      end: function() {
        _i.removeChild(_i.ghost);
        _i.ghost = null;
        _i.dirty = true;
      }
    }
  }

  function onMouseWheel(delta) {
    var newZoom = Awe.clamp(zoom() + delta * 0.15, viewZoomMin, viewZoomMax);
    zoom(newZoom);
  }
    
  _i.init = function() {
    var groups = gData.groups();

    for (var i = 0; i < groups.length; ++i) {
      var g = groups[i];
      SummaryViewGroup(g);
    }
    
    _i.layoutGroups();
    
    drawCanvas();
    
    _i.stateMachine = new Awe.StateMachine("Summary View", summaryViewStates, "default");
    
    new mouseWheelHandler( canvas, onMouseWheel );
  }
  
  _i.init();
  
  return _i;
}

