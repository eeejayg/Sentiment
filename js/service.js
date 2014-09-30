/*************************************************************************************
 This file implements a service class intended for use as a singleton that makes calls
 to webservices and preforms callbacks on completion. This service also caches the
 data using a data-caching object of the data class and assigned to the gData variable
 for external access.
 
 Additionally this file includes both static and generated test data that can be used
 in place of non-implemented or unavailable external web services.
*************************************************************************************/

gData = new data();

/*************************************************************************************
  Sample stock data generation
*************************************************************************************/


function getTestStockData( interval, sampleCount, testAlert )
{
  var retVal = [];
  
  var d = new Date().toStartOfHour();
  d.setHours(17);  

  while ( Awe.clamp( d.getDay(), 1, 5 ) != d.getDay() )
  {
    d.setDay(-1); 
  }

  console.log(d);
  
    
  var lastCost = 40 + Math.random() * 150;
  var lastPositiveSentiment = 0.5;
  var lastNegativeSentiment = 0.5;
  
  var minCost = Number.MAX_VALUE;
  var maxCost = Number.MIN_VALUE;
  
  for (var j = 0; j < sampleCount; ++j) {
  
    lastCost += (-1 + Math.random() * 2) * 3;
    lastCost = Math.max(lastCost, 19.23);
    lastPositiveSentiment += (-1 + Math.random() * 2) * 0.1;
    lastNegativeSentiment += (-1 + Math.random() * 2) * 0.1;
    lastPositiveSentiment = Awe.clamp(lastPositiveSentiment, 0, 1);
    lastNegativeSentiment = Awe.clamp(lastNegativeSentiment, 0, 1);
    
    if (lastCost < minCost) {
      minCost = lastCost;
    }
    if (lastCost > maxCost) {
      maxCost = lastCost;
    }
    retVal.push({
      dateTime: new Date(d.getTime()),
      price: lastCost,
      positiveSentiment: lastPositiveSentiment,
      negativeSentiment: lastNegativeSentiment
    });
    
    d.setTime(d.getTime() - interval);

    if ( d.getHours() < 9 )
    {
      d.setTime( d.getTime() - 1000 * 60 * 60 * 24 );
      d.setHours(17);
    }

    while ( Awe.clamp( d.getDay(), 1, 5 ) != d.getDay() )
    {
      d.setTime( d.getTime() - 1000 * 60 * 60 * 24 ); 
    }
  
  }
  
  // Set the test alert to have the midpoint of the price data
  testAlert.price = Math.round((minCost + maxCost) / 2);
  
  retVal.reverse();
  
  return retVal;
}


/*************************************************************************************
  Sample news items
*************************************************************************************/
testNewsItems = [

  {
    source_id: 4942,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Obama Proposes Tax Revamp",
    url: "http://online.wsj.com/article/SB10001424052970204131004577237771704513042.html?mod=ITP_pageone_0"
  },

  {
    source_id: 4942,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "FDA Advisers Bless New Diet Drug",
    url: "http://online.wsj.com/article/SB10001424052970203960804577239642544675320.html?mod=WSJ_business_whatsNews"
  },

  {
    source_id: 4942,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Comcast Takes Aim at Netflix",
    url: "http://online.wsj.com/article/SB10001424052970204909104577237321153043092.html"
  },

  {
    source_id: 4942,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Gannet Outlines Revitalization Plan",
    url: "http://online.wsj.com/article/SB10001424052970203960804577239091927368310.html"
  },

  {
    source_id: 4942,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "J&J CEO Weldon Is Out",
    url: "http://online.wsj.com/article/SB10001424052970204909104577237642041667180.html?mod=business_newsreel"
  },

  {
    source_id: 3017,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Kabbage makes online business grow.",
    url: "http://www.getelastic.com/3d-printing-digital-rights-management-for-physical-goods/"
  },

  {
    source_id: 3017,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Amazon pulls thousands of e-books in dispute",
    url: "http://bits.blogs.nytimes.com/2012/02/22/amazon-pulls-thousands-of-e-books-in-dispute/"
  },

  {
    source_id: 3017,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Amazon kills Kindle titles from Chicago publisher",
    url: "http://www.chicagobusiness.com/article/20120222/NEWS07/120229936/amazon-kills-kindle-titles-from-chicago-publisher-ipg"
  },

  {
    source_id: 3017,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Amazon automates business processes with new cloud service.",
    url: "http://www.tchnws.com/tech-news/amazon-automates-business-processes-with-new-cloud-service/"
  },

  {
    source_id: 5130,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Windows on the iPad, and Speedy",
    url: "http://www.nytimes.com/2012/02/23/technology/personaltech/onlive-desktop-plus-puts-windows-7-on-the-ipad-in-blazing-speed-state-of-the-art.html?ref=technology"
  },

  {
    source_id: 5130,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Behind the Google Goggles, Virtual Reality",
    url: "http://www.nytimes.com/2012/02/23/technology/google-glasses-will-be-powered-by-android.html?ref=technology"
  },

  {
    source_id: 5130,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Apple plans new data center in Oregon",
    url: "http://bits.blogs.nytimes.com/2012/02/22/apple-data-center-prineville/"
  },

  {
    source_id: 5130,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Dell earnings and forecast fall short of Wall St. Views",
    url: "http://www.nytimes.com/2012/02/22/business/dell-earnings-and-forecast-fall-short-of-wall-st-views.html?ref=technology"
  },

  {
    source_id: 7533,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Oil prices spike",
    url: "http://money.cnn.com/2012/02/20/markets/oil_gas_iran/index.htm?section=money_markets&utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+rss%2Fmoney_markets+%28Markets%29"
  },

  {
    source_id: 7533,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "AT&T CEO pay docked $2 million",
    url: "http://money.cnn.com/2012/02/22/technology/att_ceo_pay/index.htm?iid=Popular"
  },

  {
    source_id: 7533,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "Nvidia throws down",
    url: "http://tech.fortune.cnn.com/2012/02/22/nvidia-throws-down/?iid=T_Blogs"
  },

  {
    source_id: 7533,
    weight: 0.5,
    combinedSentimentIndex: 0,
    text: "What the PlayStation Vita really costs",
    url: "http://money.cnn.com/video/technology/2012/02/21/t-ts-psvita-teardown.cnnmoney/?iid=SF_BN_River"
  }

];


/*************************************************************************************
  Sample prediction sources
*************************************************************************************/

testSourcesContributing = {
  "yahoo": {
    contribution: 0.5,
    words: [{
      word: "revolutionary",
      contribution: 0.8,
    }, {
      word: "sales cycle",
      contribution: 0.4,
    }, {
      word: "inventory",
      contribution: 0.1,
    }, {
      word: "worthless",
      contribution: 0.8,
    }
  ]},
  "twitter": {
    contribution: 0.3,
    words: [{
      word: "awesome",
      contribution: 0.8,
    }, {
      word: "value",
      contribution: 0.4,
    }, {
      word: "flat",
      contribution: 0.1,
    }, {
      word: "awesome",
      contribution: 0.8,
    }
  ]},
  "facebook": {
    contribution: 0.2,
    words: [{
      word: "awesome",
      contribution: 0.8,
    }, {
      word: "value",
      contribution: 0.4,
    }, {
      word: "flat",
      contribution: 0.1,
    }, {
      word: "awesome",
      contribution: 0.8,
    }
  ]}
}

testSourcesOther = {
  "yahoo": {
    contribution: 0.1,
    words: [{
      word: "fingerpainting",
      contribution: 0.8,
    }, {
      word: "brad pitt",
      contribution: 0.8,
    }
  ]},
  "twitter": {
    contribution: 0.8,
    words: [{
      word: "LOL",
      contribution: 0.8,
    }, {
      word: "html5",
      contribution: 0.4,
    }, {
      word: "vacation",
      contribution: 0.1,
    }, {
      word: "apples",
      contribution: 0.8,
    }
  ]},
  "facebook": {
    contribution: 0.2,
    words: [{
      word: "cats",
      contribution: 0.8,
    }, {
      word: "play",
      contribution: 0.4,
    }, {
      word: "drunken",
      contribution: 0.1,
    }
  ]}
}

/*************************************************************************************
  Sample prediction data generation
*************************************************************************************/

testPredictions = {};


function randomPredictionItem(ticker)
{
  return {
    stock : ticker,
    prediction: Math.round(Math.random() * 4) - 2,
    confidence: 0.1 + 0.8 * Math.random(),
    contributing_sources: testSourcesContributing,
    other_sources: testSourcesOther 
  }
}

function getPrediction(ticker) {
  if (!testPredictions[ticker]) {
    testPredictions[ticker] = randomPredictionItem(ticker)
  }
  return testPredictions[ticker];
}

function getRandomPredictions(count) {
  var predictions = [];
  var predictionMap = {};
  var ticker;
  for (var i = 0; i < count; ++i) {
  
    do {
      ticker = testStockDataArray[Math.round(Math.random() * (testStockDataArray.length - 1))].ticker;
    } while (predictionMap[ticker])
    
    var p = getPrediction(ticker);
    predictionMap[ticker] = p;
    predictions.push(p);
  }
  return predictions;
}

/*************************************************************************************
  Simulate varying realtime stock data
*************************************************************************************/

if (false) {
  // Test UI bindings
  testBindingsDelta = 0.002;
  testBindingsInterval = 16;
  /*
  testBindingsDelta = 0.2;
  testBindingsInterval = 3000;
  */
  setInterval(function() {
  //  testSourcesContributing["facebook"].contribution += 0.1;
    for (var k in gData.stockPredictionsByTicker) {
      var p = gData.stockPredictionsByTicker[k]();
      p.confidence -= testBindingsDelta;
      if (p.confidence < 0) {
        p.confidence += 1;
        p.prediction -= 1;
        if (p.prediction < -2) {
          p.prediction = 2;
        }
      }
      if (window.gService) {
        gService.getStockPrediction(p.stock);
      }
    }
    gSummaryView.dirty = true;
  }, testBindingsInterval);
}

/*************************************************************************************
  Sample group data generation
*************************************************************************************/

function getRandomGroup(name, size) {
  size = size || Math.round(2 + Math.random() * 8);
  
  var group = {
    id: Awe.getGuidNumeric(),
    name: name,
    stocks: []
  }
  
  var stockMap = {};
  var ticker;
  
  for (var i = 0; i < size; ++i) {
    do {
      ticker = testStockDataArray[Math.round(Math.random() * (testStockDataArray.length - 1))].ticker;
    } while (stockMap[ticker]);
    
    group.stocks.push(ticker);
  }
  
  return group;
}

testGroups = [
  getRandomGroup("Trending", 5)
]

testAlerts = [
  // The first alert should be a price alert - this is updated dynamically by the random stock generation code
  { id: Awe.getGuidNumeric(), stock: null, type: "price", price: 200 },
  { id: Awe.getGuidNumeric(), stock: null, type: "sentiment-ratio", ratio: 2 },
  { id: Awe.getGuidNumeric(), stock: null, type: "keyword-impact", keyword: "value" },
  { id: Awe.getGuidNumeric(), stock: null, type: "keyword-impact", keyword: "experiment" },
  { id: Awe.getGuidNumeric(), stock: null, type: "prediction", prediction: 2, confidence: 0.75 },
  { id: Awe.getGuidNumeric(), stock: null, type: "prediction", prediction: 1, confidence: 0.80 }
]
/*************************************************************************************
  Service object
*************************************************************************************/

function service()
{
  var _i = this;

  _i.SERVER_ADDRESS = null;

  _i.getStock = function(stock, callback) {
    var data = testStockDataMap[stock];
    
    gData.addStock(data);
    callback && callback(data);
  }

  _i.getAlerts = function(callback) {
    var data = testAlerts;
    
    gData.addAlerts(data);
    callback && callback(data);
  }

  _i.getWindowPrediction = function(stockTicker, startTime, endTime, callback) {
    //var data = getPrediction(stockTicker); 
    var data = randomPredictionItem(stockTicker);   
    StockPrediction(data);
    callback && callback(data);
  }
  
  _i.getStockPrediction = function(stock, callback) {
    var data = getPrediction(stock);
    data = [data];
    
    gData.addStockPredictions(data);
    callback && callback(data);
  }
  
  _i.getStockPredictions = function(callback) {
    var data = getRandomPredictions(15);
    
    gData.addStockPredictions(data);
    callback && callback(data);
  }

  _i.getGroups = function(callback) {
    // Test data
    var data = testGroups;
    // Preload the stocks and predictions
    for (var i = 0; i < data.length; ++i) {
      for (var j = 0; j < data[i].stocks.length; ++j) {
        _i.getStock(data[i].stocks[j]);
        _i.getStockPrediction(data[i].stocks[j]);
      }
    }
    
    gData.addGroups(data);
    callback && callback(data);
  }
  
  _i.deleteGroup = function(group, callback) {
    gData.deleteGroup(group);
    
    callback && callback();
  }
  
  _i.createGroup = function(group, callback) {
    if (group.id >= 0) {
      throw "Attempting to create a group that is already saved";
    }

    gData.addGroup(group);
    
    // Simulate waiting for response from server
    setTimeout(function() {
      var internalId = group.id;
      group.id = Awe.getGuidNumeric();
      gData.updateGroupId(group, internalId);
      callback && callback(data);
    }, 100);
  }

  _i.saveGroup = function(group, callback) {
  }

  _i.deleteAlert = function(alert, callback) {
    gData.deleteAlert(alert);
    
    callback && callback();
  }
  
  _i.createAlert = function(alert, callback) {
    if (alert.id >= 0) {
      throw "Attempting to create an alert that is already saved";
    }

    //gData.addAlert(alert);
    
    // Simulate waiting for response from server
    setTimeout(function() {
      var internalId = alert.id;
      alert.id = Awe.getGuidNumeric();
      gData.updateAlertId(alert, internalId);
      callback && callback(data);
    }, 100);
  }
  
  _i.saveAlert = function(alert, callback) {
  }
}
