function visibleGraphWidth() {
  return 964 - (gDetailView.graph.futureVisible ? gDetailView.graph.futureVisible + 1 : 0);
}

var sentimentColormap = [
    "#cb3d24",
    "#e4552b",
    "#fa9b8c",
    "#ffffff",
    "#a0def3",
    "#33c2f3",
    "#0e9ccc"
  ];

// TODO: Remove this related functionality
var randomWords = [
  { word : "scandal" },
  { word : "cash surplus" },
  { word : "Bloomberg" },
  { word : "Facebook" },
  { word : "profit forecast" },
  { word : "fiscal policy" },
  { word : "stock purchase" },
  { word : "profits short" },
  { word : "growth target" },
  { word : "earnings" },
  { word : "improved growth" },
  { word : "efficiency" },
  { word : "Singapore center" },
  { word : "innovation" },
  { word : "Android" },
  { word : "operating margin" },
  { word : "Deutsche Telekom" },
  { word : "surplus forcast" },
  { word : "loyal workers" },
  { word : "breakthrough" },
  { word : "world-beating" }
];

function randomizeWords()
{
  for ( var z = 0; z < randomWords.length; z++ )
  {
    randomWords[z].randomPosition = Math.random();
  }
  
  randomWords.sort( function(a,b) { return a.randomPosition - b.randomPosition } );
}


function GraphSlider(parent, context, x, y, w, h, callback) {

  // params
  var _p = {};
  _p.parent = parent;
  _p.context = context;
  _p.x = x;
  _p.y = y;
  _p.w = w;
  _p.h = h;
  _p.callback = callback;

  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      left: _p.x + "px",
      top: _p.y + "px",
      width: _p.w + "px",
      height: _p.h + "px",
      backgroundColor: "rgba(12,127,166,0.15)"
    }
  });
  
  _i.topBar = new backgroundBar( eSprites.graphSliderTop );
  _i.topBar.container.style.top = "-3px";
  _i.appendChild( _i.topBar.container );
  
  _i.updateStuff = function()
  {
    gDetailView.getNewItems();
  }
  
  
  _i.leftBar = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: "6px",
      height: "100%",
      backgroundColor: "#257ca8"
    }
  });

  _i.rightBar = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      right: "0px",
      top: "0px",
      width: "6px",
      height: "100%",
      backgroundColor: "#257ca8"
    }
  });

  _i.leftDragHandle = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      left: "17px",
      top: "240px",
      width: eSprites.graphSliderLeftArrow.width + "px",
      height: eSprites.graphSliderLeftArrow.height + "px",
      cursor: "pointer"
    }
  });
  
  _i.leftDragHandle.appendChild( getSprite( eSprites.graphSliderLeftArrow ));

  _i.rightDragHandle = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      right: "17px",
      top: "240px",
      width: eSprites.graphSliderRightArrow.width + "px",
      height: eSprites.graphSliderRightArrow.height + "px",
      cursor: "pointer"
    }
  });

  _i.rightDragHandle.appendChild( getSprite( eSprites.graphSliderRightArrow ));

  Awe.enableDrag(_i, {
    anchor: new Awe.DragAnchorTopLeft(),
    updater: {
      start : function() {
        if (gDetailView.stateMachine.getCurrentStateId() == "simulateFuture") {
          gDetailView.cancelSimulation();
        }
      },
      move : function(el, evt) {
        var left = evt.pos.x;
        left = Math.max( left, 100 );
        left = Math.min( left, visibleGraphWidth() - xWidth(_i));
        el.style.left = left + "px";
        callback( xLeft(_i), xWidth(_i) );
      },
      end : function() {
      }
    },
    onDragEnd: _i.updateStuff
  })

  Awe.enableDrag( _i.leftDragHandle, {
    anchor: new Awe.DragAnchorTopLeft(_i),
    updater: {
      start : function() {
        if (gDetailView.stateMachine.getCurrentStateId() == "simulateFuture") {
          gDetailView.cancelSimulation();
        }
      },
      move: function(el, event) {
        var newLeft = event.pos.x;
        newLeft = Math.max( newLeft, 100);
        var dW = xLeft(_i) - newLeft;
        xWidth( _i, xWidth(_i) + dW );
        xLeft( _i, newLeft );
        callback( xLeft(_i), xWidth(_i) );
      }
    },
    onDragEnd: _i.updateStuff
  })

  Awe.enableDrag( _i.rightDragHandle, {
    anchor: new Awe.DragAnchorTopLeft(_i),
    updater: {
      start : function() {
        if (gDetailView.stateMachine.getCurrentStateId() == "simulateFuture") {
          gDetailView.cancelSimulation();
        }
      },
      move: function(el, event) {
        var newWidth = xWidth(_i) + event.delta.x;
        newWidth = Math.min( newWidth, visibleGraphWidth() - xLeft(_i) );
        xWidth( _i, newWidth );
        callback( xLeft(_i), xWidth(_i) );
      }
    },
    onDragEnd: _i.updateStuff
  })

  // init
  callback( xLeft(_i), xWidth(_i) );

  return _i;
}


function renderSentimentRatio(rc, scale, ratio, bg, opacity) {
  var r = 120 * scale * 0.5;

  opacity = opacity || 0.1;
  bg = bg || "#ffffff";
  
  rc.clearRect(0, 0, rc.canvas.width, rc.canvas.height);
  
  rc.fillStyle = bg;
  rc.globalAlpha = opacity;
  rc.beginPath();
  rc.moveTo(r, r);
  rc.arc(r, r, r, 0, Math.PI * 2, false);
  rc.fill();
  rc.globalAlpha = 1;

  // Positive
  rc.fillStyle = "#00a1c9";
  rc.beginPath();
  rc.moveTo(r, r);
  rc.arc(r, r, r - 20 * scale, 0, Math.PI * 2, false);
  rc.fill();

  rc.fillStyle = "#abdee9";
  rc.beginPath();
  rc.moveTo(r, r);
  rc.arc(r, r, r - 22 * scale, 0, Math.PI * 2, false);
  rc.fill();

  // Negative
  var angleNegative = Math.PI * 2 * (1 / (1 + ratio));
  rc.fillStyle = "#ff3b2f";
  rc.beginPath();
  rc.moveTo(r, r);
  rc.arc(r, r, r - 20 * scale, -angleNegative * 0.5, angleNegative * 0.5, false);
  rc.fill();

  rc.fillStyle = "#fac5be";
  rc.beginPath();
  rc.moveTo(r, r);
  rc.arc(r, r, r - 22 * scale, -angleNegative * 0.5, angleNegative * 0.5, false);
  rc.fill();
  
  // Handle
  rc.fillStyle = "#888888";
  rc.beginPath();
  var x = r * 2 - 11 * scale;
  var y = r;
  rc.moveTo(x, y);
  rc.arc(x, y, 3 * scale, 0, Math.PI * 2, false);
  rc.moveTo(x - 1 * scale, y + 10 * scale);
  rc.arc(x - 1 * scale, y - 10 * scale, 3 * scale, 0, Math.PI * 2, false);
  rc.moveTo(x - 1 * scale, y + 10 * scale);
  rc.arc(x - 1 * scale, y + 10 * scale, 3 * scale, 0, Math.PI * 2, false);
  rc.fill();
}

function IconAlertAdd(container, onClick) {
  _i = Icon(container, "add");
  
  xAddEventListener(_i, Awe.env.eventClick, onClick);
  
  createElement("DIV", _i, {
    attrs: {
      innerHTML: "+"
    },
    styles: {
      position: "absolute",
      left: "14px",
      top: "-12px",
      fontWeight: "bold",
      fontSize: "60px"
    }
  });
  
  return _i;
}


function IconAlertKeyword(container, alert, onClick) {
  _i = Icon(container, "keyword");
  
  if (onClick) {
    xAddEventListener(_i, Awe.env.eventClick, onClick);
  }

  createElement("DIV", _i, {
    attrs: {
      innerHTML: alert.keyword
    },
    styles: {
      position: "absolute",
      bottom: "15px",
      left: "4px",
      width: "58px",
      fontWeight: "normal",
      textAlign: "left",
      fontSize: "18px",
      wordWrap: "break-word"
    }
  });

  createElement("DIV", _i, {
    attrs: {
      innerHTML: "keyword"
    },
    styles: {
      position: "absolute",
      top: "48px",
      left: "4px",
      width: "100%",
      fontWeight: "bold",
      textAlign: "left",
      fontSize: "11px"
    }
  });

  return _i;
}


function IconAlertSentiment(container, alert, onClick) {
  _i = Icon(container, "sentiment");
  
  if (onClick) {
    xAddEventListener(_i, Awe.env.eventClick, onClick);
  }

  createElement("DIV", _i, {
    attrs: {
      innerHTML: "sentiment"
    },
    styles: {
      position: "absolute",
      top: "48px",
      left: "4px",
      width: "100%",
      fontWeight: "bold",
      textAlign: "left",
      fontSize: "11px"
    }
  });

  var csize = 42;
  
  var canvas = createElement("CANVAS", _i, {
    attrs: {
      width: csize,
      height: csize
    },
    styles: {
      position: "absolute",
      top: "5px",
      left: "11px"
    }
  });
  
  var rc = canvas.getContext('2d');
  
  rc.fillStyle = "#d6dbdd";
  rc.beginPath();
  rc.moveTo(csize * 0.5, csize * 0.5);
  rc.arc(csize * 0.5, csize * 0.5, csize * 0.5, 0, Math.PI * 2, false);
  rc.fill();

  // Positive
  rc.fillStyle = "#00a1c9";
  rc.beginPath();
  rc.moveTo(csize * 0.5, csize * 0.5);
  rc.arc(csize * 0.5, csize * 0.5, csize * 0.5 - 2, 0, Math.PI * 2, false);
  rc.fill();

  rc.fillStyle = "#abdee9";
  rc.beginPath();
  rc.moveTo(csize * 0.5, csize * 0.5);
  rc.arc(csize * 0.5, csize * 0.5, csize * 0.5 - 4, 0, Math.PI * 2, false);
  rc.fill();

  // Negative
  var angleNegative = Math.PI * 2 * (1 / (1 + alert.ratio));
  rc.fillStyle = "#ff3b2f";
  rc.beginPath();
  rc.moveTo(csize * 0.5, csize * 0.5);
  rc.arc(csize * 0.5, csize * 0.5, csize * 0.5 - 2, -angleNegative * 0.5, angleNegative * 0.5, false);
  rc.fill();

  rc.fillStyle = "#fac5be";
  rc.beginPath();
  rc.moveTo(csize * 0.5, csize * 0.5);
  rc.arc(csize * 0.5, csize * 0.5, csize * 0.5 - 4, -angleNegative * 0.5, angleNegative * 0.5, false);
  rc.fill();

  return _i;
}


function IconAlertPrediction(container, alert, onClick) {
  _i = Icon(container, "prediction");
  
  if (onClick) {
    xAddEventListener(_i, Awe.env.eventClick, onClick);
  }
  
  var iconLeft = 35;
  var iconTop = 5;
  switch (alert.prediction) {
  case -2:
    _i.style.backgroundColor = "#e50814";
    iconLeft = 38;
    break;
  case -1:
    _i.style.backgroundColor = "#ff3c2f";
    iconLeft = 34;
    iconTop = 7;
    break;
  case 0:
    _i.style.backgroundColor = "#808080";
    iconLeft = 30;
    iconTop = 8;
    break;
  case 1:
    _i.style.backgroundColor = "#00c8f0";
    iconLeft = 34;
    iconTop = 7;
    break;
  case 2:
    _i.style.backgroundColor = "#00a1c9";
    iconLeft = 38;
    break;
  }

  createElement("DIV", _i, {
    backgroundSprite: "alertArrow" + (alert.prediction + 2),
    styles: {
      position: "absolute",
      top: iconTop + "px",
      left: iconLeft + "px"
    }
  });
  
  createElement("DIV", _i, {
    attrs: {
      innerHTML: Math.round(100 * alert.confidence) + "%"
    },
    styles: {
      position: "absolute",
      top: "30px",
      left: "3px",
      width: "100%",
      fontWeight: "bold",
      textAlign: "left",
      fontSize: "18px"
    }
  });

  createElement("DIV", _i, {
    attrs: {
      innerHTML: "confidence"
    },
    styles: {
      position: "absolute",
      top: "48px",
      left: "3px",
      width: "100%",
      fontWeight: "bold",
      textAlign: "left",
      fontSize: "11px"
    }
  });

  return _i;
}


function IconAlertPrice(container, alert, onClick) {
  _i = Icon(container, "price");
  
  if (onClick) {
    xAddEventListener(_i, Awe.env.eventClick, onClick);
  }
  
  createElement("DIV", _i, {
    attrs: {
      innerHTML: "$"
    },
    styles: {
      position: "absolute",
      left: "18px",
      top: "-3px",
      fontWeight: "bold",
      fontSize: "56px",
      color: "#5f5f5f"
    }
  });
  
  createElement("DIV", _i, {
    attrs: {
      innerHTML: "$" + alert.price
    },
    styles: {
      position: "absolute",
      left: "9px",
      top: "20px",
      fontWeight: "bold",
      fontSize: "22px",
      color: "#ffffff"
    }
  });
  
  return _i;
}

function FutureKeywordPopup(parent, keyword, saveCallback, deleteCallback) {
  var popup = Popup(parent, 340, 235, "Add keyword", "Add the following keyword to the simulation");
  
  var input = createElement("INPUT", popup.content(), {
    attrs: {
      placeholder: "Keyword",
      value: keyword || null
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

  if (keyword !== undefined) {
    var deleteButton = createElement("DIV", popup.content(), {
      className: "alertPopupButton left",
      attrs: {
        innerHTML: "Remove" 
      }
    });
    xAddEventListener(deleteButton, Awe.env.eventClick, function() {
      popup.hide();
      deleteCallback();
    });
  }
  
  var createButton = createElement("DIV", popup.content(), {
    className: "alertPopupButton right",
    attrs: {
      innerHTML: keyword == undefined ? "Add" : "Save" 
    },
  });

  function save() {
    popup.saving = true;
    saveCallback(input.value);
    popup.hide();
  }
  
  xAddEventListener(createButton, Awe.env.eventClick, save);

  function onKeydown(evt) {
    if (evt.keyCode == 13) {
      save();
    }
  }
  
  xAddEventListener(input, "keydown", onKeydown);

  var superShow = popup.show;
  popup.show = function() {
    superShow.apply(popup, arguments);
    input.focus();
  }
  
  return popup;
}


var alertIconTypes = {
  "prediction": { createIcon: IconAlertPrediction, createPopup: AlertPredictionPopup, offset: 258 },
  "price": { createIcon: IconAlertPrice, createPopup: AlertPricePopup, offset: 228 },
  "sentiment-ratio": { createIcon: IconAlertSentiment, createPopup: AlertSentimentPopup, offset: 228 },
  "keyword-impact": { createIcon: IconAlertKeyword, createPopup: AlertKeywordPopup, offset: 228 }
};

function AlertPricePopup(parent, alert) {
  var popup = Popup(parent, 340, 235, "Stock Price", "Alert me when the stock price reaches:");
  
  var price = alert.price;
  
  var input = createElement("INPUT", popup.content(), {
    attrs: {
      placeholder: "Price",
      value: alert.price
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

  if (alert.id >= 0) {
    var deleteButton = createElement("DIV", popup.content(), {
      className: "alertPopupButton left",
      attrs: {
        innerHTML: "Delete alert" 
      }
    });
    xAddEventListener(deleteButton, Awe.env.eventClick, function() {
      popup.hide();
      gService.deleteAlert(alert);
      updateAlerts(parent);
    });
  }
  
  var createButton = createElement("DIV", popup.content(), {
    className: "alertPopupButton right",
    attrs: {
      innerHTML: alert.id >= 0 ? "Save alert" : "Create alert" 
    },
  });

  function save() {
    alert.price = input.value;
    alert.saving = true;
    if (alert.id >= 0) {
      gService.saveAlert(alert);
    } else {
      gService.createAlert(alert);
    }
    popup.hide();
    updateAlerts(parent);
  }
  
  xAddEventListener(createButton, Awe.env.eventClick, save);

  function onKeydown(evt) {
    if (evt.keyCode == 13) {
      save();
    }
  }
  
  xAddEventListener(input, "keydown", onKeydown);

  var superShow = popup.show;
  popup.show = function() {
    superShow.apply(popup, arguments);
    input.focus();
  }
  
  return popup;
}

function AlertPredictionPopup(parent, alert) {
  var popup = Popup(parent, 340, 265, "Prediction", "Alert me when confidence of a prediction is more than:");

  var prediction = alert.prediction;
  var selectedButton = prediction + 2;
  var confidence = alert.confidence;
  
  var input = createElement("INPUT", popup.content(), {
    attrs: {
      placeholder: "Price",
      value: Math.round(confidence * 100)
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

  var createButton = createElement("DIV", popup.content(), {
    className: "alertPopupButton right",
    attrs: {
      innerHTML: alert.id >= 0 ? "Save alert" : "Create alert" 
    },
  });

  var buttons = [];
  
  for (var i = 4; i >= 0; --i) {
    var button = createElement("DIV", popup.content(), {
      className: "blockFloat",
      backgroundSprite: "alertDialogArrow" + i,
      styles: {
        margin: "10px 10px 10px 0px"
      }
    });
    buttons.push(button);
    button.index = i;
    xAddEventListener(button, Awe.env.eventClick, function(event) {
      selectedButton = event.target.index;
      setBackgrounds();
    });
  }

  function setBackgrounds() {
    Awe.forEach(buttons, function(button, i) {
      
      if (button.index == selectedButton) {
        setBackgroundSprite(button, "alertDialogArrowSelected" + button.index);
      } else {
        setBackgroundSprite(button, "alertDialogArrow" + button.index);
      }
    });
  }
  
  setBackgrounds();
  
  if (alert.id >= 0) {
    var deleteButton = createElement("DIV", popup.content(), {
      className: "alertPopupButton left",
      attrs: {
        innerHTML: "Delete alert" 
      }
    });
    xAddEventListener(deleteButton, Awe.env.eventClick, function() {
      popup.hide();
      gService.deleteAlert(alert);
      updateAlerts(parent);
    });
  }
  
  xAddEventListener(createButton, Awe.env.eventClick, function() {
    alert.confidence = input.value * 0.01;
    alert.prediction = selectedButton - 2;
    alert.saving = true;
    if (alert.id >= 0) {
      gService.saveAlert(alert);
    } else {
      gService.createAlert(alert);
    }
    popup.hide();
    updateAlerts(parent);
  });

  var superShow = popup.show;
  popup.show = function() {
    superShow.apply(popup, arguments);
    input.focus();
  }

  return popup;
}

function AlertSentimentPopup(parent, alert) {
  var alertCopy = {};
  
  var ratio = alert.ratio;
  
  var popup = Popup(parent, 340, 235, "Sentiment");

  createElement("DIV", popup.content(), {
    attrs: {
      innerHTML: "Alert me when the sentiment ratio is the following"
    },
    styles: {
      width: "150px",
      padding: "0px 0px 0px 0px",
      fontSize: "17px"
    }
  });

  var csize = 120;
  
  var canvas = createElement("CANVAS", popup.content(), {
    attrs: {
      width: csize,
      height: csize
    },
    styles: {
      position: "absolute",
      top: "50px",
      left: "190px",
      cursor: "pointer"
    }
  });
  
  var rc = canvas.getContext('2d');

  if (alert.id >= 0) {
    var deleteButton = createElement("DIV", popup.content(), {
      className: "alertPopupButton left",
      attrs: {
        innerHTML: "Delete alert" 
      }
    });
    xAddEventListener(deleteButton, Awe.env.eventClick, function() {
      popup.hide();
      gService.deleteAlert(alert);
      updateAlerts(parent);
    });
  }
  
  var createButton = createElement("DIV", popup.content(), {
    className: "alertPopupButton right",
    attrs: {
      innerHTML: alert.id >= 0 ? "Save alert" : "Create alert" 
    },
  });

  xAddEventListener(createButton, Awe.env.eventClick, function() {
    alert.ratio = ratio;
    alert.saving = true;
    if (alert.id >= 0) {
      gService.saveAlert(alert);
    } else {
      gService.createAlert(alert);
    }
    popup.hide();
    updateAlerts(parent);
  });
  
  function renderCanvas() {
    renderSentimentRatio(rc, 1, ratio);
  }
  
  renderCanvas();
  
  Awe.enableDrag(canvas, {
    updater: {
      move: function(el, event) {
        var dx = Awe.clamp(event.delta.x, -30, 50);
        ratio = Awe.clamp(ratio * (1 + dx * 0.01), 0.01, 100);
        renderCanvas();
      }
    }
  });
  
  return popup;
}

function AlertKeywordPopup(parent, alert) {
  var popup = Popup(parent, 340, 235, "Keyword", "Alert me when the following keyword has an impact on my stocks:");

  var keyword = alert.keyword;

  var createButton = createElement("DIV", popup.content(), {
    className: "alertPopupButton right",
    attrs: {
      innerHTML: alert.id >= 0 ? "Save alert" : "Create alert" 
    },
  });

  var input = createElement("INPUT", popup.content(), {
    attrs: {
      placeholder: "Keyword",
      value: alert.keyword
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

  function save() {
    alert.keyword = input.value;
    alert.saving = true;
    if (alert.id >= 0) {
      gService.saveAlert(alert);
    } else {
      gService.createAlert(alert);
    }
    popup.hide();
    updateAlerts(parent);
  }
  
  if (alert.id >= 0) {
    var deleteButton = createElement("DIV", popup.content(), {
      className: "alertPopupButton left",
      attrs: {
        innerHTML: "Delete alert" 
      }
    });
    xAddEventListener(deleteButton, Awe.env.eventClick, function() {
      popup.hide();
      gService.deleteAlert(alert);
      updateAlerts(parent);
    });
  }
  
  xAddEventListener(createButton, Awe.env.eventClick, save);

  function onKeydown(evt) {
    if (evt.keyCode == 13) {
      save();
    }
  }

  xAddEventListener(input, "keydown", onKeydown);
  
  var superShow = popup.show;
  popup.show = function() {
    superShow.apply(popup, arguments);
    input.focus();
  }

  return popup;
}

function AlertTypePopup(parent) {
  var popup = Popup(parent, 340, 177, "Create Alert");
  
  var createPrice = createElement("DIV", popup.content(), {
    attrs: { innerHTML: "Price" },
    backgroundSprite: "alertPrice",
    className: "blockFloat alertType",
    styles: { height: "0px" }
  });
  var createSentiment = createElement("DIV", popup.content(), {
    attrs: { innerHTML: "Sentiment" },
    backgroundSprite: "alertSentiment",
    className: "blockFloat alertType",
    styles: { height: "0px" }
  });
  var createPrediction = createElement("DIV", popup.content(), {
    attrs: { innerHTML: "Prediction" },
    backgroundSprite: "alertPrediction",
    className: "blockFloat alertType",
    styles: { height: "0px" }
  });
  var createKeyword = createElement("DIV", popup.content(), {
    attrs: { innerHTML: "Keyword" },
    backgroundSprite: "alertKeyword",
    className: "blockFloat alertType",
    styles: { height: "0px" }
  });

  function hide() {
    popup.hide();
  }
  
  xAddEventListener(createPrice, Awe.env.eventClick, function() {
    var stock = gAppContext.selectedStock();
    var alert = Alert({ stock: stock.ticker, type: "price", price: Math.round(stock.data[stock.data.length - 1].price * (1 + 0.05)) });
    gData.addAlert(alert);
    hide();
    updateAlerts(parent, alert);
    // TODO: Trigger edit dialog for new alert
  });

  xAddEventListener(createSentiment, Awe.env.eventClick, function() {
    var stock = gAppContext.selectedStock();
    var alert = Alert({ stock: stock.ticker, type: "sentiment-ratio", ratio: 2 });
    gData.addAlert(alert);
    hide();
    updateAlerts(parent, alert);
    // TODO: Trigger edit dialog for new alert
  });

  xAddEventListener(createPrediction, Awe.env.eventClick, function() {
    var stock = gAppContext.selectedStock();
    var alert = Alert({ stock: stock.ticker, type: "prediction", prediction: 2, confidence: 0.75 });
    gData.addAlert(alert);
    hide();
    updateAlerts(parent, alert);
    // TODO: Trigger edit dialog for new alert
  });

  xAddEventListener(createKeyword, Awe.env.eventClick, function() {
    var stock = gAppContext.selectedStock();
    var alert = Alert({ stock: stock.ticker, type: "keyword-impact", keyword: "" });
    gData.addAlert(alert);
    hide();
    updateAlerts(parent, alert);
    // TODO: Trigger edit dialog for new alert
  });
  
  return popup;
}

function updateAlerts(container, editNewAlert) {
  container.innerHTML = "";
  
  function onAddAlert(event) {
    var icon = event.target;
    while (!icon.isIcon) {
      icon = icon.parentNode;
    }
    var popup = AlertTypePopup(container);
    popup.show(xOffset(icon).x - xOffset(container).x, xTop(icon) - 170, function() {
      popup.parentNode && popup.parentNode.removeChild(popup);
    })
  }
    
  function onEditAlert(event) {
    var icon = event.target;
    while (!icon.isIcon) {
      icon = icon.parentNode;
    }
    //console.log("Edit alert ",icon.alert);
    var type = alertIconTypes[icon.alert.type];
    var popup = type.createPopup(container, icon.alert);
    popup.show(xOffset(icon).x - xOffset(container).x, xTop(icon) - type.offset, function() {
      popup.parentNode && popup.parentNode.removeChild(popup);
      if (editNewAlert && !editNewAlert.saving) {
        // Cancelling creation of a new alert
        gData.deleteAlert(editNewAlert);
        updateAlerts(container);
      }
    })
  }

  // TODO: Filter alerts by stock
  var alerts = gData.alerts;
  
  Awe.forEach(alerts, function(alert, i) {
    // Create alert icon
    var type = alertIconTypes[alert.type];
    if (type) {
      var icon = type.createIcon(container, alert, onEditAlert);
      icon.alert = alert;
      if (alert == editNewAlert) {
        // A newly created alert needs its edit dialog opened immediately
        onEditAlert({ target: icon });
      }
    }
  });

  if (alerts.length < 10) {
    IconAlertAdd(container, onAddAlert);
  }

  window.gDetailView && gDetailView.graph.updateFromGraphTile();
}

function StockFuture(parent, y, width, height) {
  var _i = createElement("DIV", parent, {
    styles: {
      width: width + "px",
      height: height + "px",
      top: y + "px",
      position: "absolute",
      backgroundColor: "#ffffff"
    }
  });
  
  var cw = width;
  var ch = height;

  var canvas = createElement("CANVAS", _i, {
    attrs: {
      width: cw,
      height: ch
    }
  });
  
  var rc = canvas.getContext('2d');

  _i.renderCanvas = function() {
    rc.clearRect(0, 0, cw, ch);
    
    var y = gDetailView.graph.getCurrentPriceY();
    
    // TODO: Get the price change from the server
    var priceChange = (-1 + Math.random() * 2) * 100;
    
    // The outer lines
    rc.strokeStyle = "#B8C5CC";
    rc.fillStyle = "#d6dbdd";
    rc.lineWidth = 1;
    rc.beginPath();
    rc.moveTo(cw, y + priceChange + 30);
    rc.lineTo(0, y + 3);
    rc.lineTo(0, y - 3);
    rc.lineTo(cw, y + priceChange - 30);
    rc.fill();
    rc.stroke();

    // The center line
    rc.strokeStyle = "#000000";
    rc.lineWidth = 4;
    rc.beginPath();
    rc.moveTo(0, y);
    rc.lineTo(cw, y + priceChange);
    rc.stroke();
  }
  
  var labelX = width * 0.25;
  var labelY = height * 0.4;

  var button = createElement("DIV", _i, {
    styles: {
      width: 100 + "px",
      left: labelX + "px",
      top: labelY + "px",
      height: 40 + "px",
      position: "absolute",
      cursor: "pointer"
    }
  });

  createElement("DIV", button, {
    styles: {
      width: 40 + "px",
      left: "0px",
      top: "0px",
      height: 40 + "px",
      position: "absolute",
      backgroundColor: "#B8C5CC"
    }
  });

  createElement("DIV", button, {
    attrs: {
      innerHTML: "+"
    },
    styles: {
      left: "4px",
      top: "-20px",
      position: "relative",
      fontSize: "54px",
      fontWeight: "bold",
      color: "#ffffff"
    }
  });
  
  createElement("DIV", button, {
    attrs: {
      innerHTML: "SIMULATE"
    },
    styles: {
      left: "43px",
      top: "-4px",
      position: "absolute",
      fontSize: "14px",
      color: "#B8C5CC"
    }
  });
  
  createElement("DIV", button, {
    attrs: {
      innerHTML: "EVENT"
    },
    styles: {
      left: "42px",
      top: "8px",
      position: "absolute",
      fontSize: "32px",
      color: "#B8C5CC"
    }
  });
  
  _i.setX = function(x) {
    _i.style.left = x + "px";
    _i.style.opacity = Math.min(gDetailView.graph.futureVisible / width, 1);
  }
  
  _i.showButton = function() {
    button.style.display = "block";
    canvas.style.display = "none";
  }

  _i.showCanvas = function() {
    button.style.display = "none";
    canvas.style.display = "block";
    _i.renderCanvas();
  }
  
  xAddEventListener(_i, Awe.env.eventClick, function() {
    gDetailView.stateMachine.requestState("simulateFuture");
  });
  
  return _i;
}


function DetailView(parent, context, y, width, height) {
 
  var detailWidth = 1024;
  var detailMinHeight = 309;
  var contentMargin = 53;
  var graphMargin = 40;
  var predictionColumnWidth = 142;
  var predictionColumnTop = 379;
  var keywordsColumnWidth = 240;
  var newsColumnWidth = 640;
  var editSentimentColumnWidth = 280;
  var editNewsColumnWidth = 360;
  
  var pageCenter = createElement("DIV", xGetElementById("mainCon"), {
    styles: {
      position: "absolute",
      left: "50%",
      top: "0px",
      width: "1px",
      height: "1px"
    }
  });

  var _i = createElement("DIV", pageCenter, {
    styles: {
      position: "absolute",
      top: y + "px",
      left: -detailWidth / 2 + "px",
      width: detailWidth + "px",
      height: "auto",
      backgroundColor: "#ffffff",
    }
  })
     
  _i.onBackButton = function() {
    if (gSummaryView.stateMachine.getCurrentStateId() == "zoomedAndNotVisible") {
      gSummaryView.stateMachine.requestTransitionState("zoomDetails", false, "default");
    } else {
      gSummaryView.stateMachine.requestState("default");
    }
    context.page("Summary");
  }

  _i.processNewData = function(data) {
  
    _i.predictionColumn.update(data);
    _i.keywordsColumn.update(data);
    _i.keywordsColumn.setHeight( 309 );
    _i.newsColumn.update(data);
    _i.keywordsColumn.setHeight( xHeight(_i.detailBox) ); // reset height after news items
  }
  
  _i.getNewItems = function() {
    if (!gAppContext.selectedStock()) { return; }
    gService.getWindowPrediction( context.selectedStock().ticker, Date.now(), Date.now(), _i.processNewData );
  }

  _i.stockChanged = function() {
    var stock = context.selectedStock();
    graph.setStock(stock);

    _i.stockSymbol.innerHTML = stock.ticker;
    _i.stockName.innerHTML = stock.name;
    
  }

  _i.searchFor = function(stock) {
    window.location.hash = "/" + stock + "/detail";
  }
  

  _i.timeUnitBarCallback = function( metricStr )
  {
    gStockData.setDataMetric(metricStr);
    if ( graph )
    {
      graph.setStock( context.selectedStock() ); // force render
    }
  }

  gStockData = new StockData();
  _i.timeUnitBar = new TimeUnitBar( _i, 48, 6, ["1d","5d","3m","6m","1y"], 1, _i.timeUnitBarCallback );
  
  _i.stockSymbol = createElement("DIV", _i, {
    styles: {
      marginLeft: contentMargin + "px",
      marginTop: "5px",
      fontSize: "50px",
      fontWeight: "bold",
      color: "rgb(59,59,59)",
    },
    className: "blockFloatNot"
  })

  _i.stockName = createElement("DIV", _i, {
    styles: {
      left: contentMargin + 2 + "px",
      fontSize: "16px",
      color: "rgb(59,59,59)",
      marginBottom: "5px"
    },
    className: "blockFloatNot"
  })
  
  var graph = StockDataGraph(_i, null, graphMargin, 115, detailWidth - graphMargin * 2, 280);
  _i.graph = graph;
  _i.detailZoomGraphic = new detailZoomGraphic( _i, detailWidth, 0 )

  _i.detailBox = createElement("DIV", _i, {
    styles: {
      left: "0px",
      minHeight: detailMinHeight + "px",
      width: "100%"
    },
    className: "detailBox blockFloatNot"
  })
  
  var future = StockFuture(_i, 115, graph.getFutureWidth(), 280);
  
  _i.updateFuture = function() {
    future.renderCanvas();
  }
  _i.predictionColumn = new predictionColumn( _i.detailBox, predictionColumnWidth );
  _i.keywordsColumn = new keywordsColumn( _i.detailBox, keywordsColumnWidth );
  _i.newsColumn = new newsColumn( _i.detailBox, newsColumnWidth );

  _i.editKeywordsColumn = EditKeywordsColumn(_i.detailBox, predictionColumnWidth, keywordsColumnWidth);
  _i.editSentimentColumn = EditSentimentColumn(_i.detailBox, predictionColumnWidth + keywordsColumnWidth, editSentimentColumnWidth);
  _i.editNewsColumn = EditNewsColumn(_i.detailBox, predictionColumnWidth + keywordsColumnWidth + editSentimentColumnWidth, editNewsColumnWidth);
  
  _i.creaseGraphic = new creaseGraphic( _i, detailWidth );
  _i.creaseGraphic.render();

  
  var alertBox = createElement("DIV", _i, {
    styles: {
      left: "0px",
      width: "964px",
      height: "68px",
      padding: "12px 30px"
      //padding: "0px"
    },
    className: "alertBox blockFloatNot"
  });
  
  updateAlerts(alertBox);
  
  _i.updateAlerts = function() {
    updateAlerts(alertBox);
  }
  
  _i.window = GraphSlider(_i, context, detailWidth-240, predictionColumnTop - 245, 156, 269, _i.detailZoomGraphic.render );
  
  ko.applyBindings(context, _i);

  context.selectedStock.subscribe(_i.stockChanged);

  graph.detailUpdateCallback = _i.getNewItems;

  detailViewStates = {
    "showStocks": {
      update: function() {
        future.setX(visibleGraphWidth());
      }
    },
    "simulateFuture": {
      start: function() {
        future.showCanvas();
        _i.newsColumn.hide();
        _i.keywordsColumn.hide();
        _i.editKeywordsColumn.show();
        _i.editSentimentColumn.show();
        _i.editNewsColumn.show();
      },
      end: function() {
        future.showButton();
        _i.newsColumn.show();
        _i.keywordsColumn.show();
        _i.editKeywordsColumn.hide();
        _i.editSentimentColumn.hide();
        _i.editNewsColumn.hide();
      }
    }
  }
  
  _i.cancelSimulation = function() {
    _i.stateMachine.requestState("showStocks");
  }
  
  _i.stateMachine = new Awe.StateMachine("Detail View", detailViewStates, "showStocks");
  
  return _i;
}


function keywordItem( parentNode, data, doNotAnimate )
{
  var _i = this;
  
  // params
  var p = {};
  p.parentNode = parentNode;
  p.data = data;
  
  // locals
  var l = {};
  l.container = null;
  l.inner = null;
  l.randomTimeout = null;
  l.initDelay = null;
  
  // constants
  var c = {};
  c.fadeInTime = .35;
  c.fadeOutTime = .75;
  
   
  l.createUpdate = function( rt )
  {
    if ( rt >= l.initDelay ) { return true; }
  }


  l.fadeInStart = function()
  {
    l.container.style.opacity = 0;
    l.container.style.visibility = "visible";
  }


  l.fadeInUpdate = function( rt )
  {
    l.container.style.opacity = Math.min( 1, rt / c.fadeInTime );
    return rt >= c.fadeInTime;
  }
    
  
  l.dismissUpdate = function( rt )
  {
    if ( rt >= l.randomTimeout ) { return true; }
  }
  
  
  l.fadeOutUpdate = function( rt )
  {
    l.container.style.opacity = Math.max( 0 , 1 - rt / c.fadeOutTime );
    return rt >= c.fadeOutTime;
  }
  
  
  l.states = {
  
    "create" : {
      update : function() { return l.createUpdate(this.runTime) }
    },
    
    "fadeIn" : {
      start : l.fadeInStart,
      update : function() { return l.fadeInUpdate(this.runTime) }
    },
    
    "dismiss" : {
      start : function() { l.randomTimeout = Math.random(); },
      update : function() { return l.dismissUpdate(this.runTime); }
    },
        
    "fadeOut" : {
      update : function() { return l.fadeOutUpdate(this.runTime); }
    },
    
    "showing" : {},
    
    "hidden" : {}
    
  }
  
  _i.isHidden = function()
  {
    return l.stateMachine.getCurrentStateId() == "hidden";
  }
  
  
  _i.dismiss = function()
  {
    l.stateMachine.requestTransitionState("dismiss",["fadeOut","hidden"]);
  }
   

  _i.destroy = function()
  {
    p.parentNode.removeChild(l.container);
  }
  

  l.init = function()
  {
    l.container = document.createElement("DIV");
    l.container.className = "blockFloatNot bottomRightShadow";
    l.container.style.width = "auto";
    l.container.style.height = "32px";
    l.container.style.marginBottom = "6px";
    l.container.style.backgroundColor = sentimentColormap[data.combinedSentimentIndex + 3];
    if (!doNotAnimate) {
      l.container.style.opacity = 0;
    }
    _i.container = l.container;

    l.inner = document.createElement("DIV");
    l.inner.className = "blockFloat";
    l.inner.style.width = "auto";
    l.inner.style.marginLeft = "12px";
    l.inner.style.marginRight = "12px";
    l.inner.style.color = (data.combinedSentimentIndex!=0) ? "#ffffff" : "#333333";
    l.inner.style.fontSize = "21px";
    l.inner.style.lineHeight = "32px";
    l.inner.innerHTML = data.word;
    
    p.parentNode.appendChild(l.container);
    l.container.appendChild(l.inner);

    l.initDelay = Math.random() / 2;
    l.stateMachine = new Awe.StateMachine("Keyword Item", l.states, null);
    if (doNotAnimate) {
      l.stateMachine.requestState("showing");
    } else {
      l.stateMachine.requestTransitionState("create",["fadeIn","showing"]);
    }

  }();
  
}


function newsColumnItem( parentNode, data )
{
  var _i = this;

  // params
  var p = {};
  p.parentNode = parentNode;
  p.data = data;


  // locals
  var l = {};
  l.container = null;


  // constants
  var c = {};
  c.unitSize = 112;
  c.containerMargin = 4;
  c.fadeInTime = .35;
  c.fadeOutTime = .75;
  
   
  l.createUpdate = function( rt )
  {
    if ( rt >= l.initDelay ) { return true; }
  }


  l.fadeInStart = function()
  {
    l.container.style.opacity = 0;
    l.container.style.visibility = "visible";
  }


  l.fadeInUpdate = function( rt )
  {
    l.container.style.opacity = Math.min( 1, rt / c.fadeInTime );
    return rt >= c.fadeInTime;
  }
    
  
  l.dismissUpdate = function( rt )
  {
    if ( rt >= l.randomTimeout ) { return true; }
  }
  
  
  l.fadeOutUpdate = function( rt )
  {
    l.container.style.opacity = Math.max( 0 , 1 - rt / c.fadeOutTime );
    return rt >= c.fadeOutTime;
  }
  
  
  l.states = {
  
    "create" : {
      update : function() { return l.createUpdate(this.runTime) }
    },
    
    "fadeIn" : {
      start : l.fadeInStart,
      update : function() { return l.fadeInUpdate(this.runTime) }
    },
    
    "dismiss" : {
      start : function() { l.randomTimeout = Math.random(); },
      update : function() { return l.dismissUpdate(this.runTime); }
    },
        
    "fadeOut" : {
      update : function() { return l.fadeOutUpdate(this.runTime); }
    },
    
    "showing" : {},
    
    "hidden" : {}
    
  }
  
  
  l.containerClick = function()
  {
    window.open( p.data.url, "_blank" );
  }
  

  _i.isHidden = function()
  {
    return l.stateMachine.getCurrentStateId() == "hidden";
  }
  
  
  _i.dismiss = function()
  {
    l.stateMachine.requestTransitionState("dismiss",["fadeOut","hidden"]);
  }
   

  _i.destroy = function()
  {
    p.parentNode.removeChild(l.container);
  }
  
  
  l.init = function()
  {
    l.container = document.createElement("DIV");
    l.container.className = "blockFloat bottomRightShadow";
    l.container.style.opacity = 0;
    
    if ( p.data.combinedSentimentIndex != 0 ) { l.container.className += " newsSourceItem"; }
    
    if ( p.data.weight == 2 ) {
      l.container.style.width = (c.unitSize * 2 + c.containerMargin * 2) + "px";
    } else {
      l.container.style.width = c.unitSize + "px";
    }
    
    if ( p.data.weight != 0 ) {
      l.container.style.height = (c.unitSize * 2 + c.containerMargin * 2) + "px";
    } else {
      l.container.style.height = c.unitSize + "px";
    }
          
    l.container.style.backgroundColor = sentimentColormap[p.data.combinedSentimentIndex + 3];
    l.container.style.margin = c.containerMargin + "px";
    l.container.style.cursor = "pointer";
    
    l.logo = document.createElement("IMG");
    l.logo.style.maxWidth = "90%";
    l.logo.style.maxHeight = "15%";
    
    var srcUrl = "sourceLogos/" + p.data.source_id;
    srcUrl += (p.data.combinedSentimentIndex==0) ? "b" : "w";
    srcUrl += ".png";

    l.logo.src = srcUrl;
    l.logo.style.position = "absolute";
    l.logo.style.right = "4px";
    l.logo.style.bottom = "4px";
    l.logo.style.opacity = .75;
   
    l.quote = document.createElement("DIV");
    l.quote.className = "ellipsis";
    l.quote.style.position = "absolute";
    l.quote.style.whiteSpace = "normal";
    l.quote.style.left = "10%";
    l.quote.style.top = "5%";
    l.quote.style.width = "80%";
    l.quote.style.height = "auto";
    l.quote.innerHTML = p.data.text;
  
    l.quote.style.color = (p.data.combinedSentimentIndex == 0) ? "#666666" : "#FFFFFF";
    l.quote.style.fontSize = (p.data.weight == 2) ? "16px" : "12px";
    
    xAddEventListener( l.container, Awe.env.eventDragStart, l.containerClick, true );
       
    p.parentNode.appendChild(l.container);
    l.container.appendChild(l.logo);
    l.container.appendChild(l.quote);
    
    l.initDelay = Math.random() / 2;
    l.stateMachine = new Awe.StateMachine("News Column Item", l.states, null);    
    l.stateMachine.requestTransitionState("create",["fadeIn","showing"]);
    
  }();
}


function newsColumn( parentNode, columnWidth )
{
  var _i = this;

  // params
  var p = {};
  p.parentNode = parentNode;
  p.columnWidth = columnWidth;


  // locals
  var l = {};
  l.container = null;
  l.innerContainer = null;
  l.items = [];
  l.data = null;


  _i.getWidth = function()
  {
    return xWidth(l.container);
  }


  _i.setWidth = function( cw )
  {
    p.columnWidth = cw;
    l.container.style.width = p.columnWidth + "px";
  }


  l.itemsHidden = function()
  {
    for ( var z = 0; z < l.items.length; z++ )
    {
      if ( l.items[z].isHidden() == false )
      {
        return false;
      }
    }
    
    return true;
  }
  
   
  _i.destroyItems = function()
  {
    if ( l.itemsHidden() != true )
    {
      setTimeout( _i.destroyItems, 20 );
      return;
    }
    
    for ( var z = 0; z < l.items.length; z++ )
    {
      l.items[z].destroy();
    }
    
    l.items = [];

    for ( var z = 0; z < l.data.newsSources.length; z++ )
    {
      l.items[z] = new newsColumnItem( l.innerContainer, l.data.newsSources[z] );
    }
  }
  
  
  l.dismissItems = function()
  {
    for ( var z = 0; z < l.items.length; z++ )
    {
      l.items[z].dismiss();
    }
  
    _i.destroyItems();  
  }
  
  
  _i.update = function( data )
  {
    if ( data ) { l.data = data; }
    l.dismissItems(); 
  }


  _i.show = function() {
    l.container.style.display = "block";
  }
  

  _i.hide = function() {
    l.container.style.display = "none";
  }
  

  l.init = function()
  {
    l.container = document.createElement("DIV");
    l.container.className = "blockFloat";
    l.container.style.width = p.columnWidth + "px";
    l.container.style.minHeight = "309px";
    
    l.innerContainer = document.createElement("DIV");
    l.innerContainer.className = "blockFloatNot";
    l.innerContainer.style.marginLeft = "40px";
    l.innerContainer.style.marginTop = "23px";
    l.innerContainer.style.width = "auto";
    l.innerContainer.style.height = "auto";
    
    l.label = document.createElement("DIV");
    l.label.className = "blockFloatNot";
    l.label.style.color = "#98A3A8";
    l.label.style.fontSize = "11px";
    l.label.style.marginLeft = "2px";
    l.label.style.marginBottom = "10px";
    l.label.innerHTML = "NEWS";
    
    l.itemContainer = document.createElement("DIV");
    l.itemContainer.className = "blockFloatNot";
        
    p.parentNode.appendChild(l.container);
    l.container.appendChild(l.innerContainer);
    l.innerContainer.appendChild(l.label);
    l.innerContainer.appendChild(l.itemContainer);  
  }();

}


function EditKeywordsColumn( parent, x, width ) {
  
  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      left: x + "px",
      top: "0px",
      height: "100%",
      width: width + "px"
    }
  });

  _i.keywords = [];

  createElement("DIV", _i, {
    styles: {
      position: "absolute",
      height: "100%",
      width: "100%",
      backgroundColor: "#ffffff",
      opacity: 0.2
    }
  });
  
  var content = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      height: "100%",
      width: "100%",
      paddingLeft: "40px",
      paddingTop: "23px"
    }
  });
  
  createElement("DIV", content, {
    attrs: {
      innerHTML: "KEYWORDS"
    },
    styles: {
      color: "#98A3A8",
      fontSize: "11px",
      marginLeft: "2px",
      marginBottom: "10px",
      opacity: 1
    }
  });

  function addKeyword(existing, existingIndex) {
    var popup = FutureKeywordPopup(content, existing, function(word) {
      if (existingIndex !== undefined) {
        if (_i.keywords[existingIndex].word != word && word) {
          _i.keywords[existingIndex].word = word;
          _i.keywords[existingIndex].combinedSentimentIndex = -2 + Math.floor(Math.random() * 4.9);
          gDetailView.updateFuture();
        }
      } else {
        if (word) {
          _i.keywords.push({ word: word, relevancy: 1, combinedSentimentIndex: -2 + Math.floor(Math.random() * 4.9)});
          gDetailView.updateFuture();
        }
      }
      _i.renderWords();
    },
    function() {
      if (existingIndex !== undefined) {
        _i.keywords.splice(existingIndex, 1);
        gDetailView.updateFuture();
      }
      _i.renderWords();
    });
    popup.show(40, -210, function() {
      popup.parentNode && popup.parentNode.removeChild(popup);
    });
  }
  
  _i.show = function() {
    _i.style.display = "block";
  }
  

  _i.hide = function() {
    _i.style.display = "none";
  }

  _i.wordElements = [];
  
  _i.renderWords = function() {
    Awe.forEach(_i.wordElements, function(w) {
      content.removeChild(w.container);
    });
    
    _i.wordElements = [];
    
    var item;
    Awe.forEach(_i.keywords, function(w, i) {
      item = new keywordItem( content, w, true );
      item.container.style.cursor = "pointer";
      _i.wordElements.push(item);
      xAddEventListener(item.container, Awe.env.eventClick, function() {
        console.log(w,i);
        addKeyword(w.word, i);
      });
    });
    if (_i.keywords.length < 5) {
      item = new keywordItem( content, { word: "+", relevancy: 1, combinedSentimentIndex: 0 }, true );
      item.container.style.cursor = "pointer";
      _i.wordElements.push(item);
    }
    
    xAddEventListener(item.container, Awe.env.eventClick, function() { addKeyword(); });
  }
  
  _i.renderWords();
  _i.hide();
  
  return _i;
}


function EditNewsColumn( parent, x, width ) {
  
  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      left: x + "px",
      top: "0px",
      height: "100%",
      width: width + "px"
    }
  });

  createElement("DIV", _i, {
    styles: {
      position: "absolute",
      height: "100%",
      width: "100%",
      backgroundColor: "#ffffff",
      opacity: 0.2
    }
  });
  
  var content = createElement("DIV", _i, {
    styles: {
      position: "absolute",
      height: "100%",
      width: "100%",
      paddingLeft: "40px",
      paddingTop: "23px"
    }
  });
  
  createElement("DIV", content, {
    attrs: {
      innerHTML: "NEWS"
    },
    styles: {
      color: "#98A3A8",
      fontSize: "11px",
      marginLeft: "2px",
      marginBottom: "10px",
      opacity: 1
    }
  });

  _i.show = function() {
    _i.style.display = "block";
  }
  

  _i.hide = function() {
    _i.style.display = "none";
  }

  _i.hide();
  
  return _i;
}


function EditSentimentColumn( parent, x, width ) {
  
  var _i = createElement("DIV", parent, {
    styles: {
      position: "absolute",
      left: x + "px",
      top: "0px",
      height: "100%",
      width: width + "px"
    }
  });

  createElement("DIV", _i, {
    attrs: {
      innerHTML: "SENTIMENT"
    },
    styles: {
      color: "#98A3A8",
      fontSize: "11px",
      marginLeft: "2px",
      marginBottom: "10px",
      paddingLeft: "40px",
      paddingTop: "23px"
    }
  });

  var cw = Math.round(width * 0.6);
  var ch = cw;
  var padX = Math.round((width - cw) * 0.5);
  var padY = 25;

  var canvas = createElement("CANVAS", _i, {
    attrs: {
      width: cw,
      height: ch
    },
    styles: {
      paddingLeft: padX + "px",
      paddingTop: padY + "px",
      cursor: "pointer"
    }
  });


  var rc = canvas.getContext('2d');


  _i.ratio = 2;
  

  function renderCanvas() {
    renderSentimentRatio(rc, cw / 120, _i.ratio, "#000000", 0.1);
  }
  
  
  _i.show = function() {
    _i.style.display = "block";
    renderCanvas();
  }
  

  _i.hide = function() {
    _i.style.display = "none";
  }

  _i.hide();
  

  Awe.enableDrag(canvas, {
    updater: {
      move: function(el, event) {
        var dx = Awe.clamp(event.delta.x, -30, 50);
        var ratio = Awe.clamp(_i.ratio * (1 + dx * 0.01), 0.01, 100);
        if (ratio != _i.ratio) {
          _i.ratio = ratio;
        }
        renderCanvas();
      },
      end: function() {
        gDetailView.updateFuture();
      }
    }
  });

  
  return _i;
}


function keywordsColumn( parentNode, columnWidth )
{
  var _i = this;
  
  
  // params
  var p = {};
  p.parentNode = parentNode;
  p.columnWidth = columnWidth;
  
  
  // locals
  var l = {};
  l.container = null;
  l.innerContainer = null;
  l.items = [];
  l.data = null;
  
 
  _i.setHeight = function( h )
  {
    l.container.style.height = h + "px";
  }
  
  
  l.itemsHidden = function()
  {
    for ( var z = 0; z < l.items.length; z++ )
    {
      if ( l.items[z].isHidden() == false )
      {
        return false;
      }
    }
    
    return true;
  }
  
   
  _i.destroy = function()
  {
    if ( l.itemsHidden() != true )
    {
      setTimeout( _i.destroy, 20 );
      return;
    }
    
    for ( var z = 0; z < l.items.length; z++ )
    {
      l.items[z].destroy();
    }
    
    l.items = [];
    
    if ( l.data && l.data.keywords && l.data.keywords.length )
    {
      for ( var z = 0; z < l.data.keywords.length; z++ )
      {
        l.items[z] = new keywordItem( l.innerContainer, l.data.keywords[z] );
      }
    }
  }
  
  
  l.dismissItems = function()
  {
    for ( var z = 0; z < l.items.length; z++ )
    {
      l.items[z].dismiss();
    }
  
    _i.destroy();  
  }
  
  
  _i.update = function( data )
  {
    l.data = data;
    
    // TODO: Remove this demo functionality
    randomizeWords();
    
    for ( var z = 0; z < l.data.keywords.length; z++ )
    {
      l.data.keywords[z].word = randomWords[z].word;      
    }
    
    l.dismissItems();
    
  }
  
  
  _i.show = function() {
    l.container.style.display = "block";
  }
  

  _i.hide = function() {
    l.container.style.display = "none";
  }
  

  l.init = function()
  {
    l.container = document.createElement("DIV");
    l.container.className = "blockFloat";
    l.container.style.width = p.columnWidth + "px";
    l.container.style.height = "309px";

    l.bground = document.createElement("DIV");
    l.bground.style.position = "absolute";
    l.bground.style.display = "block";
    l.bground.style.left = "0px";
    l.bground.style.top = "0px";
    l.bground.style.width = "100%";
    l.bground.style.height = "100%";
    l.bground.style.backgroundColor = "#FFFFFF";
    l.bground.style.opacity = 0.2;
    
    l.innerContainer = document.createElement("DIV");
    l.innerContainer.className = "blockFloatNot";
    l.innerContainer.style.marginLeft = "40px";
    l.innerContainer.style.marginTop = "23px";
    l.innerContainer.style.width = "auto";
    l.innerContainer.style.height = "100%";
    
    l.label = document.createElement("DIV");
    l.label.className = "blockFloatNot";
    l.label.style.color = "#98A3A8";
    l.label.style.fontSize = "11px";
    l.label.style.marginLeft = "2px";
    l.label.style.marginBottom = "10px";
    l.label.innerHTML = "KEYWORDS";
        
    p.parentNode.appendChild(l.container);
    l.container.appendChild(l.bground);
    l.container.appendChild(l.innerContainer);
    l.innerContainer.appendChild(l.label);
      
  }();
  
  
}


function predictionColumn( parentNode, columnWidth )
{
  var _i = this;

  
  // params
  var p = {};
  p.parentNode = parentNode;
  p.columnWidth = columnWidth;
  
  
  // locals
  var l = {};
  l.container = null;
  l.innerContainer = null;
  l.data = null;
  
  
  // const
  var c = {};
  c.arrowMap = {
    "2" : "arrowStrongGains",
    "1" : "arrowMildGains",
    "0" : "arrowNoChange",
    "-1" : "arrowMildLoss",
    "-2" : "arrowStrongLoss"
  }
  c.fadeOutTime = .5;
  c.fadeInTime = .5;
 
 
  l.fadeOutUpdate = function( rt )
  {
    l.updateGroup.style.opacity = Math.max( 0 , 1 - rt / c.fadeOutTime );
    return ( rt >= c.fadeOutTime )
  } 


  l.fadeInUpdate = function( rt )
  {
    l.updateGroup.style.opacity = Math.min( 1, rt / c.fadeInTime );    
    return ( rt >= c.fadeInTime )
  }
  
  
  l.states = {
    "hidden" : {},
    "fadeOut" : {
      update : function() { return l.fadeOutUpdate(this.runTime); }
      },
    "fadeIn" : {
      start : function() { l.loadData(); },
      update : function() { return l.fadeInUpdate(this.runTime); }
      },
    "visible" : {}
  }  
  
  
  l.loadData = function()
  {
    getSprite( eSprites[c.arrowMap[l.data.prediction]], l.arrowBox );
    l.arrowBox.style.display = "block";
    l.confidenceText.innerHTML = l.data.getConfidenceText();
  }
  
  
  _i.update = function( data )
  {
    if ( data ) { l.data = data; }
    
    if ( l.stateMachine.getCurrentStateId() != "hidden" )
    {
      l.stateMachine.requestTransitionState( "fadeOut", ["fadeIn","visible"] );
    }
    else
    {
      l.stateMachine.requestTransitionState( "fadeIn", "visible" );
    }
  }
  
   
  l.init = function()
  {
    l.container = document.createElement("DIV");
    l.container.className = "blockFloat";
    l.container.style.width = columnWidth + "px";
    l.container.style.minHeight = "309px";
    
    l.innerContainer = document.createElement("DIV");
    l.innerContainer.className = "blockFloatNot";
    l.innerContainer.style.marginLeft = "40px";
    l.innerContainer.style.marginTop = "23px";
    l.innerContainer.style.width = "auto";
    l.innerContainer.style.height = "auto";
    
    l.label = document.createElement("DIV");
    l.label.className = "blockFloatNot";
    l.label.style.color = "#98A3A8";
    l.label.style.fontSize = "11px";
    l.label.style.marginLeft = "2px";
    l.label.innerHTML = "PREDICTION";
    
    l.updateGroup = document.createElement("DIV");
    l.updateGroup.style.opacity = 0;
    
    l.arrowBox = document.createElement("DIV");
    l.arrowBox.className = "blockFloatNot bottomRightShadow";
    l.arrowBox.style.width = "64px";
    l.arrowBox.style.height = "64px";
    l.arrowBox.style.marginTop = "10px";
    l.arrowBox.style.display = "none";
    
    l.confidenceText = document.createElement("DIV");
    l.confidenceText.className = "blockFloatNot";
    l.confidenceText.style.marginTop = "9px";
    l.confidenceText.style.color = "#333333";
    l.confidenceText.style.fontSize = "33px";
    l.confidenceText.style.lineHeight = "30px";
    l.confidenceText.style.fontWeight = "bold";
    
    l.confidenceLabel = document.createElement("DIV");
    l.confidenceLabel.className = "blockFloatNot";
    l.confidenceLabel.style.marginTop = "0px";
    l.confidenceLabel.style.color = "#333333";
    l.confidenceLabel.style.fontSize = "12px";
    l.confidenceLabel.style.fontWeight = "normal";
    l.confidenceLabel.innerHTML = "confidence";
    
    p.parentNode.appendChild(l.container);
    l.container.appendChild(l.innerContainer);
    l.innerContainer.appendChild(l.label);
    l.innerContainer.appendChild(l.updateGroup);
    
    l.updateGroup.appendChild(l.arrowBox);
    l.updateGroup.appendChild(l.confidenceText);
    l.updateGroup.appendChild(l.confidenceLabel);
    
    l.stateMachine = new Awe.StateMachine("Prediction Column", l.states, null );
    l.stateMachine.requestState( "hidden" );

  }();
}


function detailZoomGraphic( parentNode, baseWidth, baseOffsetX )
{
  var _i = this;
  
  
  // params
  var p = {}; 
  p.parentNode = parentNode;
  p.baseWidth = baseWidth;
  p.baseOffsetX = baseOffsetX;
  
  
  // locals
  var l = {};
  l.canvas = null;
  
  
  // constants
  var c = {};
  c.graphicHeight = 30;
  
  
  _i.render = function( topX1, width )
  {
    var ctxt = l.canvas.getContext('2d');
    ctxt.clearRect(0, 0, p.baseWidth, c.graphicHeight);

    var grad = ctxt.createLinearGradient(0, 0, 0, c.graphicHeight);
    grad.addColorStop(0, "rgba(184,197,204,0.7)");
    grad.addColorStop(1, "rgba(184,197,204,0.35)");
    
    ctxt.fillStyle = grad;
    ctxt.beginPath();
    ctxt.moveTo( topX1, 0 );
    ctxt.lineTo( topX1+width, 0 );
    ctxt.lineTo( p.baseWidth, c.graphicHeight);
    ctxt.lineTo( p.baseOffsetX, c.graphicHeight);
    ctxt.closePath();
    ctxt.fill();    
  }
  
  
  l.init = function()
  {
    l.canvas = document.createElement("CANVAS");
    l.canvas.className = "blockFloatNot";
    l.canvas.width = p.baseWidth;
    l.canvas.height =  c.graphicHeight;
    l.canvas.style.left = "0px";
    p.parentNode.appendChild(l.canvas);
  }();
  
}


function creaseGraphic( parentNode, graphicWidth )
{
  var _i = this;
  
  
  // params
  var p = {};
  p.parentNode = parentNode;
  p.graphicWidth = graphicWidth;
  
  
  // locals
  var l = {};
  l.canvas = null;
  
  
  // constants
  var c = {};
  c.graphicHeight = 20;
  
  
  _i.render = function()
  {
    var ctxt = l.canvas.getContext('2d');
    
    var grad = ctxt.createLinearGradient(0, 0, 0, l.canvas.height * 0.5);
    grad.addColorStop(0, "rgba(255,255,255,0.35)");
    grad.addColorStop(0.68, "rgba(228,228,228,0.45)");
    grad.addColorStop(1, "rgba(205,205,205,0.15)");
    ctxt.fillStyle = grad;

    ctxt.beginPath();
    ctxt.moveTo(0, 0);
    ctxt.lineTo(l.canvas.width, 0);
    ctxt.lineTo(l.canvas.width - 30, l.canvas.height * 0.5);
    ctxt.lineTo(30, l.canvas.height * 0.5);
    ctxt.closePath();
    ctxt.fill();

    grad = ctxt.createLinearGradient(0, l.canvas.height * 0.5, 0, l.canvas.height);
    grad.addColorStop(0, "rgba(184,197,204,1)");
    grad.addColorStop(0.8, "rgba(184,197,204,0.8)");
    grad.addColorStop(1, "rgba(184,197,204,0.5)");
    ctxt.fillStyle = grad;
    
    ctxt.beginPath();
    ctxt.moveTo(30, l.canvas.height * 0.5);
    ctxt.lineTo(l.canvas.width - 30, l.canvas.height * 0.5);
    ctxt.lineTo(l.canvas.width, l.canvas.height);
    ctxt.lineTo(0, l.canvas.height);
    ctxt.closePath();
    ctxt.fill();  
  }
  
  
  l.init = function()
  {
    l.canvas = document.createElement("CANVAS");
    l.canvas.className = "blockFloatNot";
    l.canvas.width = p.graphicWidth;
    l.canvas.height = c.graphicHeight;
    l.canvas.style.left = "0px";
    p.parentNode.appendChild(l.canvas);
  }();  
  
}

