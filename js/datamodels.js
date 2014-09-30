

function Alert(_i) {
  _i.id = _i.id || -Awe.getGuidNumeric();
  
  
  _i.checkAlert = function(data1, data2) {
    switch (_i.type) {
    case "price":
      return data1.price < _i.price && data2.price >= _i.price;
      break;
    case "keyword-impact":
      // TODO:
      return false;
      break;
    case "sentiment-ratio":
      if (data1.negativeSentiment && data2.negativeSentiment) {
        var sr1 = data1.positiveSentiment / data1.negativeSentiment;
        var sr2 = data2.positiveSentiment / data2.negativeSentiment;
        // Detect transition in sentiment ratio
        if ((sr1 > _i.ratio && sr2 <= _i.ratio) ||
            (sr2 < _i.ratio && sr2 >= _i.ratio)) {
          return true;
        }
      }
      return false;
      break;
    case "prediction":
      // Not applicable to data points on the graph
      return false;
      break;
    }
  }
  
  return _i;
}


function StockData()
{
  var _i = this;
  
  _i.currentDataMetric = null;
  _i.dataResolution = 1; // per hour
  _i.stocks = {};
 
  
  _i.addStock = function( ticker ) {
    var ival = _i.dataMetrics[_i.currentDataMetric].interval;
    _i.stocks[ticker] = getTestStockData( ival, 24 * 5 * 30, testAlerts[0]);
    //_i.stocks[ticker] = getTestStockData( 1000 * 60 * 60 / 2.666 / 4.5, 24 * 5 * 30, testAlerts[0]);
    //_i.stocks[ticker] = getTestStockData( 1000 * 60 * 60 / 2.666, 24 * 5 * 30, testAlerts[0]);
    //_i.stocks[ticker] = getTestStockData( 1000 * 60 * 60 / 2.666 * 12, 24 * 5 * 30, testAlerts[0]);
    //_i.stocks[ticker] = getTestStockData( 1000 * 60 * 60 / 2.666 * 120, 24 * 5 * 30, testAlerts[0]);
    //_i.stocks[ticker] = getTestStockData( 1000 * 60 * 60 / 2.666 * 180, 24 * 5 * 30, testAlerts[0]);
  }
  
 
  _i.getDataWindow = function( ticker, windowSize )
  {
    var dppg = _i.dataMetrics[_i.currentDataMetric].dataPointsPerGraph;
    var numPoints = dppg * windowSize;
    var ind = _i.stocks[ticker].length - numPoints;
    return _i.stocks[ticker].slice(ind);
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


  _i.getLabelFromDate = function( dt, ind )
  {
    var fn = _i.dataMetrics[_i.currentDataMetric].labelFunction;
    return fn(dt,ind);
  }

  
  _i.hourStr = function( dt )
  {
    var hr = dt.getHours();

    if ( hr < 12 )
    {
      return hr + "am";
    }

    if ( hr == 12 )
    {
      return hr + "pm";
    }

    if ( hr > 12 )
    {
      return hr - 12 + "pm";
    }
  }


  _i.minuteStr = function( dt )
  {
    var str = "0" + dt.getMinutes();
    return str.substr( str.length - 2, 2 );
  }


  _i.label1d = function( dt )
  {  
    var dyStr = _i.dayMap[dt.getDay()];
    var mo = dt.getMonth() + 1;
    var dy = dt.getDate();
    var yr = dt.getFullYear().toString().substr(2,2);
    var hr = _i.hourStr( dt );
    var mn = _i.minuteStr( dt );
    var txt =  dyStr + " " + mo + "/" + dy + " " + hr;
    return txt;
  }
  
  
  _i.label5d = function( dt )
  {  
    var dyStr = _i.dayMap[dt.getDay()];
    var mo = dt.getMonth() + 1;
    var dy = dt.getDate();
    var yr = dt.getFullYear().toString().substr(2,2);
    var hr = _i.hourStr( dt );
    var mn = _i.minuteStr( dt );
    var txt =  dyStr + " " + mo + "/" + dy + "/" + yr;
    return txt;
  }
  

  _i.label3m = function( dt )
  {
    var dyStr = _i.dayMap[dt.getDay()];
    var mo = dt.getMonth() + 1;
    var dy = dt.getDate();
    var yr = dt.getFullYear().toString().substr(2,2);
    var hr = _i.hourStr( dt );
    var mn = _i.minuteStr( dt );
    var txt =  mo + "/" + dy + "/" + yr;
    return txt;
  }

  
  _i.label6m = function( dt )
  {
    var dyStr = _i.dayMap[dt.getDay()];
    var mo = dt.getMonth() + 1;
    var dy = dt.getDate();
    var yr = dt.getFullYear().toString().substr(2,2);
    var hr = _i.hourStr( dt );
    var mn = _i.minuteStr( dt );
    var txt =  mo + "/" + dy + "/" + yr;
    return txt;
  }


  _i.label1y = function( dt )
  {
    var dyStr = _i.dayMap[dt.getDay()];
    var mo = dt.getMonth() + 1;
    var dy = dt.getDate();
    var yr = dt.getFullYear().toString().substr(2,2);
    var hr = _i.hourStr( dt );
    var mn = _i.minuteStr( dt );
    var txt =  mo + "/" + dy + "/" + yr;
    return txt;
  }


  _i.getDataPointsPerGraph = function()
  {
    return _i.dataMetrics[_i.currentDataMetric].dataPointsPerGraph;
  }
  
    
  _i.dataMetrics = {
    "1d" : {
      dataPointsPerGraph : 24 * _i.dataResolution,
      dataPointsPerLabel : 2,
      labelFunction : _i.label1d,
      interval : 1000 * 60 * 60 / 2.666 / 4.5
    },
    "5d" : {
      dataPointsPerGraph : 120 * _i.dataResolution,
      dataPointsPerLabel : 24 * _i.dataResolution,
      labelFunction : _i.label5d,
      interval : 1000 * 60 * 60 / 2.666
    },
    "3m" : {
      dataPointsPerGraph : Math.round(3 * 30.416 * 24 * _i.dataResolution),
      dataPointsPerLabel : Math.round(30.416 * 24 * _i.dataResolution),
      labelFunction : _i.label3m,
      interval : 1000 * 60 * 60 / 2.666 * 12
    },
    "6m" : {
      dataPointsPerGraph : Math.round(6 * 30.416 * 24 * _i.dataResolution),
      dataPointsPerLabel : Math.round(30.416 * 24 * _i.dataResolution),
      labelFunction : _i.label6m,
      interval : 1000 * 60 * 60 / 2.666 * 120
    },
    "1y" : {
      dataPointsPerGraph : Math.round(12 * 30.416 * 24 * _i.dataResolution),
      dataPointsPerLabel : Math.round(2 * 30.416 * 24 * _i.dataResolution),
      labelFunction : _i.label1y,
      interval : 1000 * 60 * 60 / 2.666 * 180
    }
  }
   
  _i.getDataMetric = function() {
    return _i.dataMetrics[_i.currentDataMetric];
  }
   
  _i.setDataMetric = function( dataMetricStr ) {
    _i.currentDataMetric = dataMetricStr
  }   
  
};


function StockGroup(_i) {
  _i = _i || {
    id: -Awe.getGuidNumeric(),
    name: "No stocks",
    defaultName: true,
    stocks: []
  };

  if (!ko.isObservable(_i.name)) {
    _i.name = ko.observable(_i.name);
  }

  _i.updateDefaultName = function() {
    if (_i.defaultName) {
      var name;
      switch (_i.stocks.length) {
      case 0:
        name = "Empty";
        break;
      case 1:
        name = gData.getStocks()[_i.stocks[0]]().getName();
        break;
      default:
        name = _i.stocks.length + " stocks";
      }
      _i.name(name);
    }
  }
  
  _i.removeStockByIndex = function(index) {
    if (index < _i.stocks.length) {
      _i.stocks.splice(index, 1);
      _i.updateDefaultName();
    }
  }
  
  _i.addStock = function(stock) {
    if (_i.stocks.indexOf(stock) >= 0) {
      return false;
    }
    _i.stocks.push(stock);
    _i.updateDefaultName();
  }
  
  return _i;
}

function Stock(_i) {
  _i = _i || {};
  
  _i.getName = function() {
    return _i.name;
  }
}

function StockPrediction(_i) {
  _i = _i || {};

  _i.getTicker = function() {
    return _i.stock;
  }
  
  _i.getStock = function() {
    return gData.getStocks()[_i.stock]();
  }
  
  _i.getPredictionText = function() {
    switch (_i.prediction) {
    case 2:
      return "Strong gains";
    case 1:
      return "Mild gains";
    case 0:
      return "No change";
    case -1:
      return "Mild loss";
    case -2:
      return "Strong loss";
    }
  }
  
  _i.getConfidenceText = function() {
    return Math.round(_i.confidence * 100) + "%";
  }
  
  _i.normalizeSources = function(sources) {
    if (sources) {
      var k;
      var source;
      var scale;
      
      // Normalize contributions, both of sources and of the words for each source
      var totalContribution = 0;
      
      for (var k in sources) {
        source = sources[k];
        totalContribution += source.contribution;
        totalWordContribution = 0;
        Awe.forEach(source.words, function(word) {
          totalWordContribution += word.contribution;
        });
        
        scale = 1 / totalWordContribution;
        
        Awe.forEach(source.words, function(word) {
          word.normalizedContribution = word.contribution * scale;
        });
      }
      
      scale = 1 / totalContribution;

      for (var k in sources) {
        source = sources[k];
        source.normalizedContribution = source.contribution * scale;
      }
    }
  }

  // TODO: Remove if keyword data comes from server. In the meantime, this
  // function approximates a prioritized keyword list based on the sample data.
  _i.getNewsSources = function() {

    var numToCollect = Math.round(Math.random() * 3) + 4;

    for ( var z = 0; z < testNewsItems.length; z++ )
    {
      testNewsItems[z].randomPosition = Math.random();
    }
   
    testNewsItems.sort( function(a,b) { return a.randomPosition - b.randomPosition } );
     
    _i.newsSources = [];

    for ( var z = 0; z < numToCollect; z++ )
    {
      _i.newsSources[z] = testNewsItems[z];
      _i.newsSources[z].weight = 0;
      _i.newsSources[z].combinedSentimentIndex = Math.round(Math.random() * 6) - 3;
    }
    
    var randomBigIndex = Math.round(Math.random() * (_i.newsSources.length - 1));
    var randomTallIndex = randomBigIndex;
    
    while ( randomBigIndex == randomTallIndex )
    {
      randomTallIndex = Math.round(Math.random() * (_i.newsSources.length - 1));
    }
    
    // make one of them big
    _i.newsSources[randomBigIndex].weight = 2;
    
    // maybe make one of them medium
    if ( Math.random() > .5 ) { _i.newsSources[randomTallIndex].weight = 1; }
  }

  // TODO: Remove if keyword data comes from server. In the meantime, this
  // function approximates a prioritized keyword list based on the data we have.
  _i.getKeywords = function() {

//    if (_i.keywords) {
//      return;
//    }

    _i.keywords = [];
    
    var sources = _i.contributing_sources;
    
    if (sources) {
      var keywordMap = {};
      for (var k in sources) {
        source = sources[k];
        Awe.forEach(source.words, function(word) {
          var combinedSentimentIndex = Math.round(Math.random() * 6) - 3;
          var relevancy = word.normalizedContribution * source.normalizedContribution;
          if (keywordMap[word.word]) {
            keywordMap[word.word].relevancy = Math.max(keywordMap[word.word].relevancy, relevancy);
            keywordMap[word.word].combinedSentimentIndex = combinedSentimentIndex;
          } else {
            keywordMap[word.word] = { word: word.word, relevancy: relevancy, combinedSentimentIndex: combinedSentimentIndex };
            _i.keywords.push(keywordMap[word.word]);
          }
        });
      }
      
      // Sort by relevancy
      _i.keywords.sort(function(a, b) {
        return b.relevancy - a.relevancy;
      });
      
      // Clip length
      _i.keywords.length = Math.min(_i.keywords.length, 5);
    }
  }
  
  _i.init = function() {
    _i.normalizeSources(_i.contributing_sources);
    _i.normalizeSources(_i.other_sources);
    _i.getKeywords();
    _i.getNewsSources();
  }
  
  _i.init();
}


