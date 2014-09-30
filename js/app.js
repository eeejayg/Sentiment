
gAppContext = {
  signedIn: window.location.href.indexOf("artefactgroup.com") < 0,
  currentGroup: ko.observable(null),
  allGroups: gData.groups,
  currentPrediction: ko.observable(null),
  fps: ko.observable(0),
  averageFps: ko.observable(0),
  page: ko.observable(null),
  selectedStock: ko.observable(null),
  _private: {
    appStartTime: Date.now(),
    timerStartTime: Date.now(),
    timerFrameCount: 10,
    timerTotalFrameCount: 0,
    currentTimerFrameCount: 0,
  }
}

gConstants = {
  headerHeight: 50,
  footerHeight: 68,
  maxStocksInGroup: 10
}

// For now, use the default group
gAppContext.currentGroup(gAppContext.defaultGroup);

gAngle = 0;

function frameUpdate() {
  if (++gAppContext._private.currentTimerFrameCount == gAppContext._private.timerFrameCount) {
    gAppContext._private.timerTotalFrameCount += gAppContext._private.timerFrameCount;
    gAppContext._private.currentTimerFrameCount = 0;
    var delta = gAppContext._private.timerStartTime;
    gAppContext._private.timerStartTime = Date.now();
    delta = gAppContext._private.timerStartTime - delta;
    totalDelta = gAppContext._private.timerStartTime - gAppContext._private.appStartTime;
    
    gAppContext.fps(gAppContext._private.timerFrameCount / (delta * 0.001));
    gAppContext.averageFps(gAppContext._private.timerTotalFrameCount / (totalDelta * 0.001));
  }
  
  gSummaryView.update();
  
  Awe.StateMachine.update();
}

function getSummaryViewDimensions(appWidth, appHeight) {
  return {
    width: appWidth || xWidth(gContainer),
    height: (appHeight || xHeight(gContainer)) - gConstants.footerHeight - gConstants.headerHeight
  }
}

function getDetailViewDimensions(appWidth, appHeight) {
  return {
    y: gConstants.headerHeight,
    width: appWidth || xWidth(gContainer),
    height: (appHeight || xHeight(gContainer)) - gConstants.headerHeight
  }
}

function getSigninViewDimensions(appWidth, appHeight) {
  return {
    width: appWidth || xWidth(gContainer),
    height: appHeight || xHeight(gContainer)
  }
}

function onResize() {
  // Resize the elements
  var appHeight = xHeight(gContainer);
  var appWidth = xWidth(gContainer);
  var summaryDimensions = getSummaryViewDimensions(appWidth, appHeight);
  gSummaryView.resize(appWidth, appHeight, summaryDimensions.width, summaryDimensions.height);
  var detailViewDimensions = getDetailViewDimensions(appWidth, appHeight);
  var signinViewDimensions = getSigninViewDimensions(appWidth, appHeight);
  gSigninView.resize(appWidth, appHeight, signinViewDimensions.width, signinViewDimensions.height);

  xWidth(gHeader, appWidth);
  xWidth(gFooter, appWidth);
}

function parseHash(url) {
  var page = "Summary";
  var selectedStock = "";
  var hashIndex = url.indexOf("#");
  if (hashIndex > 0 && (hashIndex + 1 < url.length)) {
    var end = url.indexOf('?');
    if (end < 0) {
      end = url.length;
    }
    var hash = url.substring(hashIndex+1, end);
    var hashes = hash.split('/');
    while (hashes.length && !hashes[0]) {
      hashes.shift();
    }
    if (hashes.length) {
      switch (hashes[hashes.length - 1].toLowerCase()) {
      case "detail":
        if (hashes.length == 2) {
          selectedStock = hashes[0];
          page = "Detail";
        }
        break;
      }
    }
  }
  if (!gAppContext.signedIn) {
    gAppContext.page("Signin");
  } else {
    if (selectedStock) {
      if (gData.getStocks()[selectedStock]) {
        if (gAppContext.selectedStock() != gData.getStocks()[selectedStock]()) {
          gAppContext.selectedStock(gData.getStocks()[selectedStock]());
        }
        gAppContext.page(page);
      } else {
        gService.getStock(selectedStock, function() {
          gService.getStockPrediction(selectedStock, function() {
            if (gAppContext.selectedStock() != gData.getStocks()[selectedStock]()) {
              gAppContext.selectedStock(gData.getStocks()[selectedStock]());
            }
            gAppContext.page(page);
          });
        });
      }
    } else {
      gAppContext.page(page);
    }
  }
}

function onHashChange(evt) {
  parseHash(evt.newURL);
}

function createUI() {
  if (gData.groups().length) {
    // Select the first group
    gAppContext.currentGroup(gData.groups()[0]);
  } else {
    gAppContext.currentGroup(null);
  }

  gContainer = xGetElementById("mainCon");
  gContainer.style.position = "absolute";
  gContainer.style.width = "100%";
  gContainer.style.height = "100%";

  gHeader = Header(gContainer, gAppContext);
  
  gFooter = Footer(gContainer, gAppContext);

  var summaryDimensions = getSummaryViewDimensions();
  gSummaryView = SummaryView(gContainer, gAppContext, summaryDimensions.width, summaryDimensions.height);

  var detailViewDimensions = getDetailViewDimensions();
  gDetailView = DetailView(gContainer, gAppContext, detailViewDimensions.y, detailViewDimensions.width, detailViewDimensions.height);

  var signinViewDimensions = getSigninViewDimensions();
  gSigninView = SigninView(gContainer, gAppContext, signinViewDimensions.width, signinViewDimensions.height);

  xAddEventListener( window, "hashchange", onHashChange, false );
  
  parseHash(window.location.href);
  onResize();
  
  Awe.addAnimationCallback(frameUpdate);

  xAddEventListener( window, "resize", onResize, false );
}

function onChangePage(page) {
  if (page == "Signin") {
    gCurrentPage = gSigninView;
    gSummaryView.style.display = "none";
    gFooter.style.display = "none";
    gHeader.style.display = "none";
    gDetailView.style.display = "none";
    gSigninView.style.display = "block";
    gSigninView.show();
  } else if (page == "Summary") {
    gCurrentPage = gSummaryView;
    gSummaryView.style.display = "block";
    gHeader.style.display = "block";
    gFooter.style.display = "block";
    gDetailView.style.display = "none";
    gSigninView.style.display = "none";
    window.location.hash = "";
  } else if (page == "Detail") {
    gCurrentPage = gDetailView;
    gSummaryView.style.display = "none";
    gHeader.style.display = "block";
    gFooter.style.display = "none";
    gDetailView.style.display = "block";
    gSigninView.style.display = "none";
    window.location.hash = "/" + gAppContext.selectedStock().ticker + "/detail";
    gDetailView.graph.updateSliderWindow();
    gDetailView.getNewItems();
  }
  
  if (page == "Detail") {
    gHeader.backButtonVisible(true);
  } else {
    gHeader.backButtonVisible(false);
  }
}

gAppContext.page.subscribe(onChangePage);

function startup()
{
  // Awe config
  Awe.clickDoesNotHidePopup = true;
  
  document.body.ontouchmove = Awe.cancelEvent;

  preloadImage("assets/sprites_01.png", function(image) {
    spritesImage = image;
    gService.getGroups(function() {
      gService.getAlerts(function() {
        createUI();
      });
    });
  });
}

gService = new service();

window.onload = startup;
