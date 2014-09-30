

// Enhance existing classes

Date.prototype.toStartOfHour = Date.prototype.toStartOfHour || function() {
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
  return this;
}

Date.prototype.toStartOfDay = Date.prototype.toStartOfDay || function() {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
  return this;
}

Date.prototype.toStartOfWeek = Date.prototype.toStartOfWeek || function(day) {
  this.toStartOfDay();
  day = day || 0;
  while (this.getDay() != day)
  {
    this.setDate(this.getDate()-1);
  }
}

Date.prototype.toEndOfWeek = Date.prototype.toEndOfWeek || function(day) {
  this.toStartOfDay();
  day = day || 6;
  while (this.getDay() != day)
  {
    this.setDate(this.getDate()+1);
  }
}

Date.prototype.toStartOfMonth = Date.prototype.toStartOfMonth || function(day) {
  this.toStartOfDay();
  this.setDate(1);
}

Date.prototype.toEndOfMonth = Date.prototype.toEndOfMonth || function(day) {
  this.toStartOfDay();
  this.setDate(1);
  this.setMonth(this.getMonth() + 1);
  this.setDate(0);
}

Date.prototype.toStartOfYear = Date.prototype.toStartOfYear || function(day) {
  this.toStartOfDay();
  this.setDate(1);
  this.setMonth(0);
}

Date.prototype.toEndOfYear = Date.prototype.toEndOfYear || function(day) {
  this.toStartOfDay();
  this.setDate(1);
  this.setMonth(11);
  this.setDate(31);
}

Date.sameDay = function(a, b) {
  return a.getDate() == b.getDate() && a.getMonth() == b.getMonth() && a.getFullYear() == b.getFullYear();
}

Date.min = function(a, b) {
  return a.getTime() <= b.getTime() ? a : b;
}

Date.max = function(a, b) {
  return a.getTime() >= b.getTime() ? a : b;
}

Array.prototype.removeById = function(id) {
  if (id) {
    for (var i = 0; i < this.length; ++i) {
      if (this[i].id == id) {
        return this.splice(i, 1);
      }
    }
  }
  return false;
}

// Utility methods
function createElement(type, parent, config) {
  var k;
  var el = document.createElement(type);
  config = config || {};
  if (config.backgroundSprite) {
    setBackgroundSprite(el, config.backgroundSprite);
  }
  for (k in (config.styles || {})) {
    if (config.styles[k])
    {el.style[k] = config.styles[k];}
  }
  for (k in (config.attrs || {})) {
    if (config.attrs[k])
    {el[k] = config.attrs[k];}
  }
  for (k in (config.setAttrs || {})) {
    if (config.setAttrs[k])
    {el.setAttribute(k, config.setAttrs[k]);}
  }

  if (parent)
    parent.appendChild(el);

  if (config.className)
    el.className = config.className;
    
  return el;
}

function trim(str)
{
  return str.replace(/^\s+|\s+$/, '');
}

function injectJS(jsUrl, jsOnload, addRandomParam)
{
  var _i = this;

  _i.scriptTag = null;
  
  _i.jsUrl = null;
  _i.jsOnload = null;
  _i.addRandomParam = null;

  _i.callbackName = "jsonp" + Awe.getGuidNumeric();
  
  window[_i.callbackName] = function(data) {
/*
    if (data.error) {
      if (data.error == "No auth") {
        // User's session is invalid, force login
        signOut();
        requireAuthToken();
      } else {
        new popupMessage( _i, document.body, "Oops", data.error, 6000 )
        throw "Unauthorized"
      }
    }
*/
    if (_i.jsOnload)
    {
      _i.jsOnload(data);
    }
    _headTag.removeChild(_i.scriptTag);
    window[_i.callbackName] = null;
  }

  _i.constructor = function() {

    _i.jsUrl = jsUrl;
    if (_i.jsUrl.indexOf('?') < 0) {
      _i.jsUrl += '?';
    } else {
      _i.jsUrl += '&';
    }
    _i.jsUrl += "callback="+_i.callbackName;
/*
    if (!noauth) {
      _i.jsUrl += "&auth="+auth_token;
    }
*/
    _i.jsOnload = jsOnload;
    _i.addRandomParam = addRandomParam;
    
    _headTag = window._headTag || document.getElementsByTagName("HEAD")[0];
    _i.scriptTag = document.createElement("SCRIPT");
    _i.scriptTag.type = 'text/javascript';

    if ( _i.addRandomParam == true )
    {
      _i.jsUrl += "&randomParam=" + Math.round(Math.random() * 100000);
    }
    
    _i.scriptTag.src = _i.jsUrl;
    _headTag.appendChild(_i.scriptTag);
  }


  _i.constructor();

}


function getElementsByClassName( dcmnt, tag, clsName )
{
  if ( dcmnt == null )
  {
    dcmnt = document;
  }
  
  var arr = dcmnt.getElementsByTagName(tag);
  var outArr = [];
  
  for ( var z = 0; z < arr.length; z++ )
  {
    if ( arr[z].className == clsName )
    {
      outArr[outArr.length] = arr[z];
    }
  }
  
  return outArr;
}


function justFilename(urlStr)
{
  var retVal = urlStr;

  var ind = urlStr.lastIndexOf("/");

  if ((ind > -1) && (ind < urlStr.length - 1))
  {
    retVal = retVal.substr(ind+1);
  }

  return retVal;
}


function synchronousPost(data,target) 
{
    syncxmlhttp = null;
    
    if (window.XMLHttpRequest) 
    {
        syncxmlhttp=new XMLHttpRequest();
	  }
    else
    {
        syncxmlhttp=new ActiveXObject("Microsoft.XMLHTTP");        
    }

	  syncxmlhttp.open("POST",target,false);
	  syncxmlhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	  syncxmlhttp.send(data);

    return syncxmlhttp.responseText;
} 		 

function redirect( url, params, replace )
{
  setTimeout(function() {
    redirectImmediate( url, params, replace );
  });
}

function redirectImmediate( url, params, replace )
{
  var seperator = "?";
  
  params = params || {}
  
  for (v in params)
  {
    url += seperator + v + "=" + params[v];
    seperator = "&";
  }

  if (replace)
  {
    window.location.replace(url);
  }
  else
  {
    window.location.href = url;
  }
}

var _dayNamesLong = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

var _dayNamesShort = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

function getDayName(day)
{
  return _dayNamesLong[day];
}

function getDayNameShort(day)
{
  return _dayNamesShort[day];
}

// From http://www.netlobo.com/url_query_string_javascript.html
function getParam(name)
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}


// Create an object by copying an existing object or if a template. If from is null,
// this method returns a copy of the template, otherwise it returns a copy of from.
function copyOrCreate(from, template)
{
  from = from || template;
  
  return JSON.parse(JSON.stringify(from));
/*
  var object = {};

  for (var key in from)
  {
    //object[key] = from[key];
  }

  return object;
*/
}


// Quick method to compare objects. Assumes they have the same keys, intended for testing
// whether an object has changed after editing or matches the object it was cloned from.
// Do not use for comparing arbitrary objects for equality.
function objectsEqual(a, b)
{
  if (a == null || b == null)
  {
    return a == b;
  }
  
  for (var key in a)
  {
    if (a[key] && b[key] && typeof a[key] == "object")
    {
      if (a[key].toString() != b[key].toString())
      {
        return false;
      }
    }
    else if (a[key] !== b[key])
    {
      return false;
    }
  }
  
  return true;
}



_rubyDateRegex = new RegExp(/(\d*)-(\d*)-(\d*)T(\d*):(\d*):(\d*)/);
function parseRubyDateTime(s, includeTime)
{
  var matches = _rubyDateRegex.exec(s);
  var d;
  if (matches && matches.length == 7)
  {
    d = new Date(matches[2] + "/" + matches[3] + "/" + matches[1] + " " + matches[4] + ":" + matches[5] + ":" + matches[6] + " GMT");
  }
  else
  {
    d = new Date(s);
  }
  
  if (!includeTime)
  {
    d.toStartOfDay();
  }
  return d;
}

function parseRubyDate(s)
{
  var nums = s.split("-");
  nums[1]--;
  d = new Date(nums[0],nums[1],nums[2]);
  if (isNaN(d.getTime()))
  {
    d = parseRubyDateTime(s);
  }
//  d.setHours(d.getHours() + d.getTimezoneOffset() / 60);
  return d;
}


function dateRangesOverlap(d1Start, d1End, d2Start, d2End)
{
  d1Start = d1Start.getTime();
  d1End = d1End.getTime();
  d2Start = d2Start.getTime();
  d2End = d2End.getTime();
  return d1Start < d2End && d1End > d2Start;
}


function mouseWheelHandler(obj, userHandler)
{
	var _i = this;

	function wheelEvent(event)
	{
		var delta = 0;
		
		event = window.event || event;
		
	  if (event.wheelDelta) 
	  {
	  	delta = event.wheelDelta/120;
	  	if (window.opera) delta = -delta;
		} 
		
		if (event.detail) { delta = -event.detail/3; }
		
	 	if (delta) { userHandler(delta,event); }
	 	
	 	if (event.preventDefault) { event.preventDefault(); }
		event.returnValue = false;
			
	}

	if (typeof(obj)=="string") obj = document.getElementById(obj);
	
	if (window.addEventListener) { obj.addEventListener('DOMMouseScroll', wheelEvent, false); }
	obj.onmousewheel = wheelEvent;
	
}


function dist( x1, y1 )
{
  return Math.sqrt(Math.pow(x1,2) + Math.pow(y1,2));
}


function ang( x1, y1, x2, y2 )
{
  var rad = Math.atan2(y1-y2,x1-x2);
  var tmp = -1 * rad * 180 / Math.PI;
  if ( tmp < 0 ) { tmp += 360 };
  return tmp;
}


function direction( angl )
{
  if (angl<=45) { return "E"; }
  if (angl>=315) { return "E"; }
  if ((angl>=45)&&(angl<=135)) { return "N"; }
  if ((angl>=135)&&(angl<=215)) { return "W"; }
  if ((angl>=215)&&(angl<=315)) { return "S"; }
}


function isToday( dt )
{
  var today = new Date().toStartOfDay();
  if (dt.getTime() < today.getTime())
  {
    return false;
  }
  today.setDate(today.getDate() + 1);
  return dt.getTime() < today.getTime();
}


function isGreaterThanToday( dt )
{
  var td = new Date().toStartOfDay();
  td.setDate(td.getDate()+1);
  return ( dt.getTime() >= td.getTime() );
}


function preloadImage(url, callback) {
  var image = new Image();
  image.onload = function() {
    callback(image);
  }
  image.src = url;
}

// Appends to the current path
function canvasDashedLine(rc, start, end, perp, w1, w2, vertical) {
  if (vertical) {
    throw "Not implemented"
  } else {
    rc.moveTo(start, perp);
    while (start+w1 < end) {
      rc.lineTo(start+w1, perp);
      start += w1 + w2;
      rc.moveTo(start, perp);
    }
    if (start < end) {
      rc.lineTo(end, perp);
    }
  }
}

function canvasRoundRect(rc, sx,sy,w,h,r) {
    var ex = sx + w;
    var ey = sy + h;
    var r2d = Math.PI/180;
    if( ( ex - sx ) - ( 2 * r ) < 0 ) { r = ( ( ex - sx ) / 2 ); } //ensure that the radius isn't too large for x
    if( ( ey - sy ) - ( 2 * r ) < 0 ) { r = ( ( ey - sy ) / 2 ); } //ensure that the radius isn't too large for y
    rc.beginPath();
    rc.moveTo(sx+r,sy);
    rc.lineTo(ex-r,sy);
    rc.arc(ex-r,sy+r,r,r2d*270,r2d*360,false);
    rc.lineTo(ex,ey-r);
    rc.arc(ex-r,ey-r,r,r2d*0,r2d*90,false);
    rc.lineTo(sx+r,ey);
    rc.arc(sx+r,ey-r,r,r2d*90,r2d*180,false);
    rc.lineTo(sx,sy+r);
    rc.arc(sx+r,sy+r,r,r2d*180,r2d*270,false);
    rc.closePath();
}
