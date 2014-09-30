function data() {

  var _i = this;
  
  _i.stockPredictionsByTicker = {};

  _i.stocksByTicker = {};

  _i.stockPredictionViewsByTicker = {};
  
  _i.groupsById = {};
  _i.groups = ko.observableArray();
  
  _i.alerts = [];

  // TODO: Link view/models and ensure that replacing models updates views
  
  _i.addStockPredictions = function(predictions) {
    Awe.forEach(predictions, function(prediction, i) {
      // Wrap in an observable
      if (!_i.stockPredictionsByTicker[prediction.stock]) {
        _i.stockPredictionsByTicker[prediction.stock] = ko.observable();
      }

      // Apply data model
      StockPrediction(prediction);
      
      // Assign data
      _i.stockPredictionsByTicker[prediction.stock](prediction);

      if (!_i.stockPredictionViewsByTicker[prediction.stock]) {
        _i.stockPredictionViewsByTicker[prediction.stock] = new StockPredictionView(_i.stockPredictionsByTicker[prediction.stock]);
      }
    });
  }
  
  _i.addStock = function(stock) {
    if (!_i.stocksByTicker[stock.ticker]) {
      _i.stocksByTicker[stock.ticker] = ko.observable();
    }

    Stock(stock);

    _i.stocksByTicker[stock.ticker](stock);
  }

  _i.updateGroupId = function(group, internalId) {
    _i.groupsById[group.id] = ko.observable(group);
    delete _i.groupsById[internalId];
    // Replace the existing array entry
    for (var i = 0; i < _i.groups().length; ++i) {
      if (_i.groups()[i].id == internalId) {
        _i.groups()[i] = group;
        _i.groups.valueHasMutated();
      }
    }
  }
  
  _i.updateAlertId = function(alert, internalId) {
    Awe.forEach(_i.alerts, function(a, i) {
      if (a.id == internalId) {
        _i.alerts[i] = alert;
      }
    }); 
  }

  _i.addGroup = function(group) {
    if (!_i.groupsById[group.id]) {
      _i.groupsById[group.id] = new ko.observable();
      _i.groups.push(group);
    } else {
      // Replace the existing array entry
      for (var i = 0; i < _i.groups().length; ++i) {
        if (_i.groups()[i].id == group.id) {
          _i.groups()[i] = group;
          _i.groups.valueHasMutated();
          break;
        }
      }
    }
    
    StockGroup(group);
    
    _i.groupsById[group.id](group);
  }
  
  _i.addAlert = function(alert) {
    _i.alerts.push(alert);
    Alert(alert);
  }
  
  _i.addAlerts = function(alerts) {
    Awe.forEach(alerts, _i.addAlert);
  }
  
  _i.deleteGroup = function(group) {
    _i.groupsById[group.id](null);
    _i.groups.remove(function(g) {
      return g.id == group.id;
    });
  }

  _i.deleteAlert = function(alert) {
    _i.alerts.removeById(alert.id);
  }
  
  _i.addGroups = function(groups) {
    Awe.forEach(groups, _i.addGroup);
  }
  
  _i.getStocks = function() {
    return _i.stocksByTicker;
  }
  
  _i.getStockPredictions = function() {
    return _i.stockPredictionsByTicker;
  }

  _i.getStockPredictionViews = function() {
    return _i.stockPredictionViewsByTicker;
  }
}

StockMatcher = function() {
  var _i = {};

  // Returns a list of matches which contain HTML for the match an id for the match
  _i.matchString = function(s) {
    var stocks = testStockDataArray;
    var matches = [];
    var result = {
      input: s,
      matches: matches
    }
    if (s.length > 0) {
      // Score each matching stock. Scoring prioritizes matches closer to the start of the string initially and
      // then for matches with the same start position, they are scored higher for shorter words. i.e. typing the letter
      // B, will match the stock B better than the stock BBUY
      var re = new RegExp(s.length == 1 ? ("^" + s) : s, "i");
      for (var i = 0; i < stocks.length; ++i) {
        var stock = stocks[i];
        // Try matching the ticker first
        var matchTicker = re.exec(stock.ticker);
        if (matchTicker) {
          matches.push({
            html: "<strong>" + stock.ticker + "</strong> " + stock.name,
            id: stock.ticker,
            score: -matchTicker.index * 100 - stock.ticker.length
          });
        } else {
          // Try matching the name next
          var matchName = re.exec(stock.name);
          if (matchName) {
            matches.push({
              html: "<strong>" + stock.ticker + " </strong> " + stock.name,
              id: stock.ticker,
              score: -matchName.index * 100 - Math.min(stock.name.length, 99)
            });
          }
        }
      }
    }
    matches.sort(function(a, b) {
      return b.score - a.score;
    });
    return result;
  }
  
  return _i;
}
