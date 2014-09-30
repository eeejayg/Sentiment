

function Header(parent, context) {

  var w = xWidth(parent);
  var h = gConstants.headerHeight;
  var stockMatcher = StockMatcher();

  var _i = createElement("DIV", parent, {
    styles: {
      width: w + "px",
      height: h + "px",
      backgroundColor: "rgb(78,78,78)"
    }
  });
  
  var backButton = createElement("DIV", _i, {
    backgroundSprite: "backButton",
    className: "blockFloat",
    styles: {
      margin: "10px",
      cursor: "pointer"
    }
  });

  xAddEventListener(backButton, Awe.env.eventClick, function(evt) {
    Awe.cancelEvent(evt);
    gCurrentPage.onBackButton();
  });
  
  var logo = createElement("DIV", _i, {
    attrs: {
      innerHTML: "SIGMUND"
    },
    styles: {
      lineHeight: h-3 + "px",
      paddingLeft: "23px",
      fontWeight: "bold",
      fontSize: "45px",
      color: "rgb(83,89,90)"
    }
  })

  var searchDiv = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      right: "24px",
      top: "11px",
      width: "240px",
      height: "24px",
      border: "1px solid #808080",
      backgroundColor: "#666666"
    }
  })

  _i.backButtonVisible = function(visible) {
    if (visible) {
      backButton.style.display = "block";
    } else {
      backButton.style.display = "none";
    }
  }

  createElement("DIV", searchDiv, {
    backgroundSprite: "searchIcon",
    styles: {
      position: "relative",
      left: "4px",
      top: "3px"
    }
  })
  
  var input = createElement("INPUT", searchDiv, {
    attrs: {
      placeholder: "Search"
    },
    styles: {
      position: "absolute",
      left: "24px",
      top: "0px",
      width: "209px",
      height: "22px",
      fontSize: "14px",
      backgroundColor: "rgba(0,0,0,0)",
      color: "#cccccc"
    }
  })
  
  input.tabIndex = "1";
  logo.tabIndex = "0";
  
  var suggestions = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      right: "24px",
      top: "50px",
      width: "240px",
      fontSize: "18px",
      lineHeight: "22px",
      border: "1px solid #808080",
      backgroundColor: "rgb(78,78,78)",
      color: "#cccccc",
      display: "none"
    }
  })

  var maxSuggestions = 15;
  
  var selectedSuggestion = -1;
  
  var suggestionItems = [];

  function itemSelected(i) {
    // Enter
    if (i >= 0) {
      gCurrentPage.searchFor(_i.matchResult.matches[i].id);
    }
    input.blur();
  }
  
  function createItem(i, matches) {
    var item = createElement("DIV", suggestions, {
      attrs: {
        innerHTML: matches[i].html
      },
      styles: {
        padding: "4px 14px",
      },
      className: selectedSuggestion == i ? "selectedSuggestion" : ""
    });

    // TODO: Add hover state selection etc    
    xAddEventListener(item, Awe.env.eventDragStart, function(evt) {
      itemSelected(i);
      Awe.cancelEvent(evt);
    });

    suggestionItems.push(item);
  }

  _i.updateSuggestions = function() {
    if (!_i.matchResult || _i.matchResult.input != input.value) {
      // Preserve current selection between result sets
      var previouslySelectedStock = null;
      if (_i.matchResult && selectedSuggestion >= 0) {
        previouslySelectedStock = _i.matchResult.matches[selectedSuggestion].id;
      }
      selectedSuggestion = -1;

      // Either no results calculated yet or new results are needed because the input string has changed
      _i.matchResult = stockMatcher.matchString(input.value);
      var matches = _i.matchResult.matches;
      if (matches.length > maxSuggestions) {
        matches.length = maxSuggestions;
      }
      suggestions.innerHTML = "";
      suggestionItems = [];

      for (var i = 0; i < matches.length; ++i) {
        if (matches[i].id == previouslySelectedStock) {
          selectedSuggestion = i;
        }
      }

      if (selectedSuggestion < 0 && matches.length) {
        // Always pick the first selection by default
        selectedSuggestion = 0;
      }
      
      for (var i = 0; i < matches.length; ++i) {
        if (matches[i].id == previouslySelectedStock) {
          selectedSuggestion = i;
        }
        
        createItem(i, matches);
      }
    }
    if (_i.matchResult.matches.length > 0) {
      suggestions.style.display = "block";
    } else {
      suggestions.style.display = "none";
    }
    for (var i = 0; i < suggestionItems.length; ++i) {
      if (i == selectedSuggestion) {
        suggestionItems[i].className = "selectedSuggestion";
      } else {
        suggestionItems[i].className = "";
      }
    }
  }

  _i.showSuggestions = function() {
    _i.updateSuggestions();
  }

  _i.hideSuggestions = function() {
    suggestions.style.display = "none";
  }
    
  xAddEventListener(input, "blur", function() {
    input.value = "";
    _i.hideSuggestions();
  });

  xAddEventListener(input, "focus", function() {
    _i.showSuggestions();
  });
  
  xAddEventListener(input, "keydown", function(evt) {
    if (evt.keyCode == 38) {
      // Prev
      if (selectedSuggestion > 0) {
        --selectedSuggestion;
      }
      evt.returnValue = false;
      Awe.cancelEvent(evt);
    } else if (evt.keyCode == 40) {
      // Next
      if (selectedSuggestion < suggestionItems.length - 1) {
        ++selectedSuggestion;
      }
      evt.returnValue = false;
      Awe.cancelEvent(evt);
    } else if (evt.keyCode == 13) {
      itemSelected(selectedSuggestion);
      return;
    } else if (evt.keyCode == 27) {
      // Escape
      input.blur();
      return;
    }
    _i.updateSuggestions();
  });

  xAddEventListener(input, "keyup", function() {
    _i.updateSuggestions();
  });
  
  ko.applyBindings(context, _i)

  return _i;
}

function Footer(parent, context) {

  var w = xWidth(parent);
  var h = gConstants.footerHeight;

  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      width: w + "px",
      height: h + "px",
      bottom: "0px",
      borderTop: "1px dashed #bbbbbb"
    }
  });

  createElement("DIV", _i, {
    setAttrs: {
      // Link to current group's name field
      "data-bind": "text: allGroups().length + ' stock groups', visible: allGroups().length"
    },
    styles: {
      lineHeight: h + "px",
      paddingLeft: "23px",
      fontWeight: "bold",
      fontSize: "41px",
      textTransform: "uppercase",
      color: "#666666"
    }
  })
  
  ko.applyBindings(context, _i)

  return _i;
}

function StockDataGraph(parent, stock, x, y, w, h) {

  stock = stock || null;

  var _i = createElement("DIV", parent, {
    styles: {
      width: "100%",
      height: h + "px"
    },
    className: "blockFloatNot"
  });
  
  var footerHeight = 20;
  var headerHeight = 10;
  var graphLeft = 60;
  var graphRight = 20;
  var graphHeight = h - footerHeight - headerHeight;
  var graphWidth = w - graphLeft - graphRight;
  var graphX = graphLeft;
  var graphY = headerHeight;
  var xPixelsPerDataPoint = graphWidth / 120;
  var graphTileBigUnits = 7;
  var dataPointsPerLabel = 24;

  var graphTile = document.createElement("CANVAS");
  graphTile.style.position = "absolute";
  graphTile.style.left = 40 + "px";
  graphTile.style.top = headerHeight + "px";
  graphTile.width = graphWidth * graphTileBigUnits;
  graphTile.height = graphHeight + footerHeight;
  var gtc = graphTile.getContext('2d');    
  gtc.textBaseline = "top";
  gtc.textAlign = "center";
  gtc.font = "11px sans-serif";

  var canvas = createElement("CANVAS", _i, {
    styles: {
      marginLeft: (x || 0) + "px",
    },
    attrs: {
      width: w,
      height: h
    }
  });

  var shadBar = document.createElement("DIV");
  shadBar.className = "littleGraphShadow";
  shadBar.style.position = "absolute";
  shadBar.style.left = "59px";
  shadBar.style.top = "8px";
  shadBar.style.width = "40px";
  shadBar.style.height = h - 7 + "px";
  _i.appendChild(shadBar);

  var rc = canvas.getContext('2d');
  var maxSentimentHeight = 80;

  _i.getCurrentPriceY = function() {
    return _i.cachedPoints[_i.cachedPoints.length - 1].priceY + 25;
  }
  
  _i.renderGrid = function(minPrice, maxPrice) {
    // Figure out the price range over the height of the graph (including the sentiment region)
    var dollarsPerPixel = (maxPrice - minPrice) / (graphHeight - maxSentimentHeight * 2);
    var pixelsPerDollar = 1 / dollarsPerPixel;
    var priceRange = graphHeight * dollarsPerPixel;
    // Calculate the grid unit (either 1 or a multiple of 5)
    var gridUnit = 1;
    while ((priceRange / gridUnit) > 6) {
      if (gridUnit == 1) {
        gridUnit += 4;
      } else {
        gridUnit += 5;
      }
    }
    // Calc the first gridline
    var price = minPrice - dollarsPerPixel * maxSentimentHeight;
    price = Math.ceil(price / gridUnit) * gridUnit;
    var y = graphY * 2 + graphHeight - maxSentimentHeight - (price - minPrice) * pixelsPerDollar;
    rc.strokeStyle = "#bbbbbb";
    rc.lineWidth = 1;
    rc.textBaseline = "middle";
    rc.textAlign = "right";
    rc.font = "11px sans-serif";
    while (y > graphY) {
      // Draw a line
      var py = Math.round(y);
      rc.beginPath();
      canvasDashedLine(rc, graphX, graphX + graphWidth, py, 3, 3);
      rc.stroke();

      // Draw text
      if (price >= 0 ) 
      {
        rc.fillText(price+".0", graphX - 12, py);
      }

      price += gridUnit;

      y -= pixelsPerDollar * gridUnit;
    }
  }
  
  _i.dayMap = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
  ];

  _i.renderPriceSentiment = function(minY, maxY, ctxt) {
  
    priceScale = (graphHeight - maxSentimentHeight * 2) / (maxY - minY);

    var points = [];
    _i.cachedPoints = points;
    var cnt = 0;

    for (var i = 0; i < stock.data.length; ++i) {
    
      if ( stock.data[i].price ) { 
        var o = {};
        o.priceY = graphHeight - maxSentimentHeight - priceScale * (stock.data[i].price - minY);
        o.negY = o.priceY + stock.data[i].negativeSentiment * maxSentimentHeight;
        o.posY = o.priceY - stock.data[i].positiveSentiment * maxSentimentHeight;     
        points.push(o);
      }
      
      if ( i % dataPointsPerLabel == Math.round(dataPointsPerLabel / 2) )
      {
        o.txt = gStockData.getLabelFromDate( stock.data[i].dateTime, i );
      }

    }
    

    // Draw negative sentiment
    ctxt.lineWidth = 4;
    ctxt.beginPath();
    //var dx = graphWidth / (points.length - 1);
    var dx = xPixelsPerDataPoint;
    var x = 0;
    var y = graphY + points[0].priceY;
    ctxt.moveTo(x, y)
    for (var i = 1; i < points.length; ++i) {
      x += dx;
      var p = points[i];
      ctxt.lineTo(x, graphY + p.priceY);
    }

    var y = graphY + points[0].priceY;
    
    for (var i = points.length - 1; i >= 0; --i) {
      var p = points[i];
      ctxt.lineTo(x, graphY + p.negY);
      x -= dx;
    }
    ctxt.fillStyle = "#e6704f";
    ctxt.fill();

    // Draw positive sentiment
    ctxt.beginPath();
    var x = 0;
    var y = graphY + points[0].priceY;
    ctxt.moveTo(x, y)
    for (var i = 1; i < points.length; ++i) {
      x += dx;
      var p = points[i];
      ctxt.lineTo(x, graphY + p.priceY);
    }
    ctxt.fillStyle = "#70cdf5";

    var y = graphY + points[0].priceY;
    
    for (var i = points.length - 1; i >= 0; --i) {
      var p = points[i];
      ctxt.lineTo(x, graphY + p.posY);
      x -= dx;
    }
    ctxt.fill();

    // Draw line
    ctxt.fillStyle = "#000000";
    ctxt.lineJoin = "round";
    ctxt.beginPath();
    var lineWidth = 1;
    var x = 0;
    var y = graphY + points[0].priceY - lineWidth;
    ctxt.moveTo(x, y);
    for (var i = 1; i < points.length; ++i) {
      x += dx;
      var p = points[i];
      ctxt.lineTo(x, graphY + p.priceY - lineWidth);
    }
    for (var i = points.length - 1; i >= 0; --i) {
      var p = points[i];
      ctxt.lineTo(x, graphY + p.priceY + lineWidth);
      x -= dx;
    }
    ctxt.fill();

    // Draw labels
    var x = 0;

    for ( var j = 0; j < points.length; j++ )
    {
      if ( points[j].txt )
      {
        ctxt.fillText( points[j].txt, x, graphHeight + 5 );
      }
      x += dx;
    }
  }

  _i.alertIcons = [];

  _i.drawEvents = function( dx ) {
    var minDistanceBetweenAlerts = 55;
    
    dataStart = 0;
    var dataFirstVisible = Math.floor(_i.graphTileXOffset / xPixelsPerDataPoint);
    dataFirstVisible += minDistanceBetweenAlerts * 0.5 / xPixelsPerDataPoint;
    var dataEnd = Math.floor((_i.graphTileXOffset + graphWidth) / xPixelsPerDataPoint);
    dataFirstVisible = Math.max(0, dataFirstVisible);
    dataEnd = Math.min(stock.data.length, dataEnd);
    
    // TODO: Filter alerts by stock
    var alerts = gData.alerts;

    Awe.forEach(_i.alertIcons, function(icon) {
      _i.removeChild(icon);
    });
    _i.alertIcons = [];
    
    var lastData = stock.data[dataStart];
    for (var i = dataStart + 1; i < dataEnd; ++i) {
      var data = stock.data[i];
      
      // Process data
      for (var j = 0; j < alerts.length; ++j) {
        if (alerts[j].checkAlert(lastData, data)) {
          // Render alert
          if (i >= dataFirstVisible) {
            var drawX = -_i.graphTileXOffset + i * xPixelsPerDataPoint + graphLeft;
            rc.beginPath();
            rc.moveTo(drawX, 0);
            rc.lineTo(drawX, canvas.height);
            rc.stroke();
  
            var type = alertIconTypes[alerts[j].type];
            var icon = type.createIcon(_i, alerts[j]);
            _i.alertIcons.push(icon);
            icon.style.left = drawX + "px";
            icon.style.position = "absolute";
          }
          
          // Skip ahead to the next x position where we can reasonably add another alert
          i += Math.ceil(minDistanceBetweenAlerts / xPixelsPerDataPoint);
          break;
        }
      }
      
      lastData = data;
    }

  }
  
  _i.getFutureWidth = function() {
    return graphWidth / 5;
  }
  
  _i.updateFromGraphTile = function( dx )
  {
    if ( dx ) { 
      _i.graphTileXOffset += dx;
      _i.graphTileXOffset = Math.max( _i.graphTileXOffset, 0 );
      _i.graphTileXOffset = Math.min( graphTile.width - graphWidth + _i.getFutureWidth(), _i.graphTileXOffset );
    }

    gtc.clearRect(0, 0, graphTile.width, graphTile.height);
    rc.clearRect(0, 0, canvas.width, canvas.height);
    _i.renderPriceSentiment(_i.minY, _i.maxY, gtc);
    
    var widthToGrab = Math.min( graphTile.width - _i.graphTileXOffset, graphWidth );
    
    _i.futureVisible = graphWidth - widthToGrab;
    
    rc.drawImage( graphTile, _i.graphTileXOffset, 0, widthToGrab, graphHeight + footerHeight, graphLeft, headerHeight, widthToGrab, graphHeight + footerHeight );
    _i.renderGrid(_i.minY, _i.maxY);    
    _i.drawEvents();
  }
  
    
  _i.render = function() {
     
    _i.pixelsPerDataPoint = graphWidth / gStockData.getDataPointsPerGraph();
    
    _i.minY = Number.MAX_VALUE;
    _i.maxY = Number.MIN_VALUE;

    for (var i = 0; i < stock.data.length; ++i) {
      if ( stock.data[i].price ) {
        var price = stock.data[i].price;
        if (price < _i.minY) {
          _i.minY = price;
        }
        if (price > _i.maxY) {
          _i.maxY = price;
        }
      }
    }

    _i.graphTileXOffset = graphTile.width - graphWidth + _i.getFutureWidth();

    _i.updateFromGraphTile();
    _i.updateSliderWindow();
  }
  
  
  _i.updateSliderWindow = function() {
    var sliderRight = xLeft(gDetailView.window) + xWidth(gDetailView.window);
    if (sliderRight > visibleGraphWidth()) {
      xLeft(gDetailView.window, xLeft(gDetailView.window) + (visibleGraphWidth() - sliderRight));
      gDetailView.detailZoomGraphic.render(xLeft(gDetailView.window), xWidth(gDetailView.window));
    }
  }
  
  _i.setStock = function(s) {
    stock = s;
    gStockData.addStock( stock.ticker );
    stock.data = gStockData.getDataWindow( stock.ticker, graphTileBigUnits );
    gDetailView.updateAlerts();
    _i.render();
  }
  
  
  Awe.enableDrag( canvas, {
  filters: new Awe.DragFilterMomentum(),
  anchor: new Awe.DragAnchorTopLeft(),
  updater: {
    start : function() {
      if (gDetailView.stateMachine.getCurrentStateId() == "simulateFuture") {
        gDetailView.cancelSimulation();
      }
    },
    move : function(el, evt) {
      if (gDetailView.stateMachine.getCurrentStateId() == "showStocks") {
        _i.updateFromGraphTile( -1 * evt.delta.x );
        _i.updateSliderWindow();
      }
    },
    end : function() {
      if ( _i.detailUpdateCallback ){
        clearTimeout( _i.updateCallbackTimeout );
        _i.updateCallbackTimeout = setTimeout( _i.detailUpdateCallback, 1250 );
      }
    }
  }
  })

  return _i;
}


function Icon(parent, type, w, h) {
  var styles = {};
  if (w !== undefined) {
    styles.width = w + "px";
  }
  if (h !== undefined) {
    styles.height = h + "px";
  }
  
  var _i = createElement("DIV", parent, {
    styles: styles,
    className: "icon blockFloat bottomRightShadow alert " + type
  });
  
  _i.isIcon = true;
  
  return _i;
}

function Popup(parent, w, h, title, textContent) {

  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      width: w+"px",
      height: h+"px",
      visibility: "hidden"
    },
    className: "popup bottomRightShadow"
  });

  if (title) {
    createElement("DIV", _i, {
      attrs: {
        innerHTML: title
      },
      className: "header"
    });
  }
  
  if (textContent) {
    createElement("DIV", _i, {
      attrs: {
        innerHTML: textContent
      },
      className: "description"
    });
  }
  
  var content = createElement("DIV", _i, {
    className: "content"
  });
  
  _i.show = function(x, y, dismissCallback) {
    _i.style.left = x + "px";
    _i.style.top = y + "px";
    Awe.showPopup(_i, function(evt) {
      evt && Awe.cancelEvent(evt);
      dismissCallback && dismissCallback(_i);
    });
  }
  
  _i.hide = function() {
    Awe.hidePopup(_i);
  }
  
  _i.content = function() {
    return content;
  }
  
  return _i;
}
