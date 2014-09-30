function SigninView(parent, context, width, height) {

  var contWidth = 400;
  var contHeight = 310;

  var usernameWrong = false;
  var passwordWrong = false;
  
  var _i = createElement("DIV", parent, {
    styles: {
      width: width + "px",
      height: height + "px",
      backgroundColor: "#ffffff"
    }
  });
  
  var background = createElement("DIV", _i, {
    styles: {
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff"
    }
  });
  
  var cont = createElement("DIV", _i, {
    attrs: {
//      innerHTML: "SIGNIN"
    },
    styles: {
      position: "absolute",
      backgroundColor: "#333333",
      width: contWidth + "px",
      height: contHeight + "px"
    },
    className: "popup bottomRightShadow"
  })

  createElement("DIV", cont, {
    attrs: {
      innerHTML: "Sigmund"
    },
    className: "header"
  });

  var usernameLabel = createElement("DIV", cont, {
    attrs: {
      innerHTML: "Username"
    },
    className: "description"
  });

  var username = createElement("INPUT", cont, {
    attrs: {
      placeholder: "Enter username"
    }, styles: {
      width: "355px",
      height: "31px",
      lineHeight: "30px",
      fontSize: "20px",
      color: "#000000",
      paddingLeft: "7px",
      marginTop: "10px",
      marginLeft: "18px"
    }
  });
  
  var passwordLabel = createElement("DIV", cont, {
    attrs: {
      innerHTML: "Password"
    },
    className: "description"
  });
  
  var password = createElement("INPUT", cont, {
    attrs: {
      placeholder: "Enter password",
      type: "password"
    }, styles: {
      width: "355px",
      height: "31px",
      lineHeight: "30px",
      fontSize: "20px",
      color: "#000000",
      paddingLeft: "7px",
      marginTop: "10px",
      marginLeft: "18px"
    }
  });
  
  // TEMP: Auto-fill the fields
  username.value = "user";
  password.value = "password";
  
  var button = createElement("DIV", cont, {
    attrs: {
      innerHTML: "SIGN IN"
    },
    styles: {
      position: "absolute",
      right: "0px",
      margin: "20px 20px 0px 20px",
      padding: "10px",
      fontSize: "20px",
      fontWeight: "bold",
      textTransform: "uppercase",
      backgroundColor: "#555555",
      cursor: "pointer"
    }
  });
  
  xAddEventListener(button, Awe.env.eventClick, attemptSignin);

  function updateErrors() {
    if (usernameWrong) {
      usernameLabel.style.color = "#ff6666";
      usernameLabel.innerHTML = "Username not recognized";
    } else {
      usernameLabel.style.color = null;
      usernameLabel.innerHTML = "Username";
    }

    if (passwordWrong) {
      passwordLabel.style.color = "#ff6666";
      passwordLabel.innerHTML = "Password not recognized";
    } else {
      passwordLabel.style.color = null;
      passwordLabel.innerHTML = "Password";
    }
  }
  
  function attemptSignin() {
    usernameWrong = username.value != "user";
    passwordWrong = password.value != "password"
    if (usernameWrong || passwordWrong) {
      updateErrors();
    } else {
      gAppContext.signedIn = true;
      parseHash(window.location.href);
    }
  }
  
  function onKeydown(evt) {
    if (evt.keyCode == 13) {
      attemptSignin();
    }
  }
  
  xAddEventListener(document, "keydown", onKeydown);

  _i.show = function() {
    /////////////////////////////////////////////////////////////////////////////////////
    // Fake stock data as background image
    /////////////////////////////////////////////////////////////////////////////////////
    gData.addStock({
      name: " ",
      ticker: " "
    });
    gData.addStock({
      name: "  ",
      ticker: "  "
    });
    gData.addStockPredictions([randomPredictionItem(" ")]);
    var view = gData.getStockPredictionViews()[" "].getCanvasMid();
    gData.addStockPredictions([randomPredictionItem("  ")]);
    var view2 = gData.getStockPredictionViews()["  "].getCanvasNear();

    view.style.opacity = 0.5;
    view.style.position = "absolute";
    view.style.left = "50px";
    view.style.top = "50px";
    view2.style.opacity = 0.5;
    view2.style.position = "absolute";
    view2.style.left = "500px";
    view2.style.top = "200px";
    background.appendChild(view);
    background.appendChild(view2);
    /////////////////////////////////////////////////////////////////////////////////////
  }
  
  _i.resize = function(appWidth, appHeight, w, h) {
    // TODO:
    width = w;
    height = h;
    _i.style.width = w + "px";
    _i.style.height = h + "px";
    _i.reposition();
  }
  
  _i.reposition = function() {
    cont.style.left = ((width - contWidth) >> 1) + "px";
    cont.style.top = ((height - contHeight) >> 1) - 10 + "px";
  }
  
  _i.reposition();
  
  return _i;
}
