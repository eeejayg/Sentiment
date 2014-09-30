

function TimeUnitBarItem( parentNode, ind, txt, callback )
{
  var _i = this;

  // params
  _i.parentNode = parentNode;
  _i.ind = ind;
  _i.txt = txt;
  _i.callback = callback;

  // locals
  _i.container = null;
  _i.background = null;
  _i.label = null;

  // const
  _i.btnBground = eSprites.blueTimeButton;
  _i.unselectedColor = "#666666";
  _i.selectedColor = "#FFFFFF";

  _i.containerClick = function( evt )
  {
    Awe.cancelEvent( window.event || evt );
    _i.callback && _i.callback( _i.ind );
  }

  _i.select = function()
  {
    _i.label.style.color = _i.selectedColor;
    _i.background.show();
  }

  _i.unselect = function()
  {
    _i.label.style.color = _i.unselectedColor;
    _i.background.hide();
  }

  _i.constructor = function()
  {
    _i.container = document.createElement("DIV");
    _i.container.className = "blockFloat";
    _i.container.style.width = "auto";
    _i.container.style.height = "auto";
    _i.container.style.cursor = "pointer";

    _i.background = new backgroundBar( _i.btnBground );
    _i.background.hide();

    _i.label = document.createElement("DIV");
    _i.label.style.position = "relative";
    _i.label.style.display = "block";
    _i.label.style.width = "auto";
    _i.label.style.height = _i.btnBground.height + "px";
    _i.label.style.lineHeight = _i.btnBground.height + "px";
    _i.label.style.marginLeft = "7px";
    _i.label.style.marginRight = "7px";
    _i.label.style.fontSize = "16px";
    _i.label.style.color = _i.unselectedColor;
    _i.label.innerHTML = _i.txt;

    _i.parentNode.appendChild(_i.container);
    _i.container.appendChild( _i.background.container );
    _i.container.appendChild( _i.label );
    xAddEventListener( _i.container, Awe.env.eventDragStart, _i.containerClick, true );
  }

  _i.constructor();
}


function TimeUnitBar( parentNode, x, y, unitArray, startUnitIndex, callback )
{
  var _i = this;

  // params
  _i.parentNode = xGetElementById(parentNode);
  _i.x = x;
  _i.y = y;
  _i.unitArray = unitArray;
  _i.startUnitIndex = startUnitIndex;
  _i.callback = callback;

  // locals
  _i.container = null;
  _i.items = [];


  _i.itemClick = function( ind )
  {
    _i.curUnitIndex = ind;
    
    for ( var z = 0; z < _i.items.length; z++ )
    {
      _i.items[z].unselect();
    }

    _i.items[ind].select();
    
    _i.callback( _i.unitArray[_i.curUnitIndex] );
  }
  

  _i.getDataMetricStr = function()
  {
    return _i.unitArray[_i.curUnitIndex];
  }
  
  _i.constructor = function()
  {
    _i.container = document.createElement("DIV");
    _i.container.className = "blockFloatNot"
    _i.container.style.marginLeft = _i.x + "px";
    _i.container.style.marginTop = _i.y + "px";
    _i.container.style.width = "auto";
    _i.container.style.height = "auto";

    _i.parentNode.appendChild(_i.container);

    for ( var z = 0; z < _i.unitArray.length; z++ )
    {
      //_i.items[_i.items.length] = new TimeUnitBarItem( _i.container, z, _i.unitArray[z], _i.itemClick );
      _i.items[_i.items.length] = new TimeUnitBarItem( _i.container, z, _i.unitArray[z] );
    }

    _i.itemClick( _i.startUnitIndex );
    _i.curUnitIndex = _i.startUnitIndex;
  }

  _i.constructor();
  
}



//function SummaryViewZoomControl(parent, x, y, zoomAccessor) {
//  
//  var thumbWidth = 40;
//  var thumbHeight = 30;
//  var sliderWidth = 10;
//  var sliderHeight = 150;
//  
//  var sliderOffsetX = (thumbWidth - sliderWidth) * 0.5;
//  var sliderOffsetY = thumbHeight * 0.5;
//  
//  window.test = zoomAccessor;

//  var _i = createElement("DIV", parent, {
//    styles: {
//      position: "absolute",
//      left: x + sliderOffsetX + "px",
//      top: y + sliderOffsetY + "px",
//      width: sliderWidth + "px",
//      height: sliderHeight + "px",
//      backgroundColor: "#aaaaaa",
//      borderRadius: "3px"
//    }
//  })

//  var thumb = createElement("DIV", parent, {
//    styles: {
//      position: "absolute",
