'use strict';

//TODO:
//NODES SHOULD STORE AMOUNT OF MASS OF EACH COLOR AND ITS COLOR SHOULD BE THE MAJOR COLOR, AND SPLIT SHOULD MAKE BOTH

(function () {
  'use strict';

  var btnRadius = 40;
  var maxRelationDistanceValueTextSize;

  var fontSizeDivider = 30;

  var nameplateText = "Chad  R.  Befus";
  var nameplateFontSize = 100;
  var nameplateFontName = "NameplateFont";
  
  var currentMassRatioTextPrefix = "Mass Ratio: ";
  var currentMassRatioFontSize = 100;
  var currentMassRatioFontName = "GUIFont";

  var gravitationalConstant = 10;
  var nodeCountAreaDivider = 20;
  var massLimitForSplit = 50;
  var maxGravitationalForce = 0.05;
  var relationLineThicknessMultiplier = 80;
  var relationForceModifier = 0.75;
  var nodeRadiusMassModifier = 1.0;
  var maxDistanceForRelation = 500;
  var maxNormalNodeVel = 20;

  var pixelRatio = window.devicePixelRatio;
  var wWidth;
  var wHeight;

  var maxNodes;

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var $container = document.getElementById('container');

  if (pixelRatio !== 1) {
    // if retina screen, scale canvas
    canvas.style.transform = 'scale(' + 1 / pixelRatio + ')';
    canvas.style.transformOrigin = '0 0';
  }
  canvas.id = 'nodegarden';

  $container.appendChild(canvas);

  wWidth = window.innerWidth * pixelRatio;
  wHeight = window.innerHeight * pixelRatio;
  var wArea = wWidth * wHeight;
  var numNodes = Math.sqrt(wArea) / nodeCountAreaDivider | 0;
  var maxNodes = numNodes * 2;
  var nodeManager = 
    new NodeManager(
      nodeRadiusMassModifier, 
      gravitationalConstant, 
      maxGravitationalForce, 
      relationLineThicknessMultiplier, 
      relationForceModifier, 
      maxNodes, 
      massLimitForSplit, 
      maxNormalNodeVel
    );

  init();
  render();

  window.addEventListener('resize', init);
  window.addEventListener('click', buttonCheck);

  function init() {
    wWidth = window.innerWidth * pixelRatio;
    wHeight = window.innerHeight * pixelRatio;
    var wArea = wWidth * wHeight;

    currentMassRatioFontSize = wWidth / 50;
    nameplateFontSize = wWidth / fontSizeDivider;

    // set canvas size
    canvas.width = wWidth;
    canvas.height = wHeight;

    // calculate number of nodes that should exist
    numNodes = Math.sqrt(wArea) / nodeCountAreaDivider | 0;
    maxNodes = numNodes * 2;

    // create nodes
    nodeManager.addNewNodes(numNodes - nodeManager.nodes.length, wWidth, wHeight);
  }

  function render() {
    // request new animationFrame
    requestAnimationFrame(render);

    // clear canvas
    ctx.clearRect(0, 0, wWidth, wHeight);

    nodeManager.updateAndDraw(ctx, wWidth, wHeight, maxDistanceForRelation);

    // write nameplate
    ctx.fillStyle = "black";
    ctx.font = nameplateFontSize + "px " + nameplateFontName;
    var nameplateSize = ctx.measureText(nameplateText);
    ctx.fillText(nameplateText,  wWidth - nameplateFontSize - nameplateSize.width , wHeight - nameplateFontSize);

    //write mass
    ctx.fillStyle = "black";
    ctx.font = currentMassRatioFontSize + "px " + currentMassRatioFontName;
    var totalMass = nodeManager.totalRedNodeMass + nodeManager.totalBlueNodeMass;
    var currentMassRatioText = currentMassRatioTextPrefix + " Red: " + parseFloat((nodeManager.totalRedNodeMass/totalMass) * 100).toFixed(2) + " Blue: " + parseFloat((nodeManager.totalBlueNodeMass/totalMass) * 100).toFixed(2);
    var currentMassRatioTextSize = ctx.measureText(currentMassRatioText);
    ctx.fillText(currentMassRatioText, (wWidth / 2) - (currentMassRatioTextSize.width / 2), currentMassRatioFontSize);

    //write + / - buttons with text

    ctx.font = currentMassRatioFontSize + "px " + currentMassRatioFontName;
    var maxRelationDistanceValueText = maxDistanceForRelation;
    maxRelationDistanceValueTextSize = ctx.measureText(maxRelationDistanceValueText);

    //left button
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc( (wWidth / 2) - btnRadius - 10 - (maxRelationDistanceValueTextSize.width / 2), wHeight - btnRadius - nameplateFontSize , btnRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    //left button text
    ctx.fillStyle = "white";
    var plusTextSize = ctx.measureText("+");
    ctx.fillText("+",  (wWidth / 2) - btnRadius - 10 - (maxRelationDistanceValueTextSize.width / 2) - (plusTextSize.width/2), wHeight - (btnRadius/2) - nameplateFontSize);
    // mid text
    ctx.fillStyle = "black";
    ctx.fillText(maxRelationDistanceValueText,  (wWidth/2) - (maxRelationDistanceValueTextSize.width / 2), wHeight - (btnRadius/2) - nameplateFontSize);
    //right button
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc( (wWidth / 2) + btnRadius + 10 + (maxRelationDistanceValueTextSize.width / 2),  wHeight - btnRadius - nameplateFontSize , btnRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    //right button text
    ctx.fillStyle = "white";
    var minusTextSize = ctx.measureText("-");
    ctx.fillText("-",  (wWidth / 2) + btnRadius + 10 + (maxRelationDistanceValueTextSize.width / 2) - (minusTextSize.width/2), wHeight - (btnRadius/2) - nameplateFontSize);



  }

  function buttonCheck(e) {
    var click_x_pos = e.clientX * pixelRatio;
    var click_y_pos = e.clientY * pixelRatio;

    var plusButtonXStart = (wWidth / 2) - (2*btnRadius) - 10 - (maxRelationDistanceValueTextSize.width / 2);
    var plusButtonXEnd = (wWidth / 2) - 10 - (maxRelationDistanceValueTextSize.width / 2);
    var plusButtonYStart = wHeight - (2*btnRadius) - nameplateFontSize;
    var plusButtonYEnd = wHeight - nameplateFontSize;

    if (click_x_pos >= plusButtonXStart && click_x_pos <= plusButtonXEnd) {
      if (click_y_pos >= plusButtonYStart && click_y_pos <= plusButtonYEnd) {
        // console.log("BANG");
        if (maxDistanceForRelation < 1900) {
          maxDistanceForRelation += 100;
        }
      } else {
        // console.log("NOPE");
      }
    } else {
      // console.log("NOPE");
    }


    var minusButtonXStart = (wWidth / 2) + 10 + (maxRelationDistanceValueTextSize.width / 2);
    var minusButtonXEnd = (wWidth / 2) + (2*btnRadius) + 10 + (maxRelationDistanceValueTextSize.width / 2);
    var minusButtonYStart = wHeight - (2*btnRadius) - nameplateFontSize;
    var minusButtonYEnd = wHeight - nameplateFontSize;

    if (click_x_pos >= minusButtonXStart && click_x_pos <= minusButtonXEnd) {
      if (click_y_pos >= minusButtonYStart && click_y_pos <= minusButtonYEnd) {
        // console.log("BANG2");
        if (maxDistanceForRelation >= 100) {
          maxDistanceForRelation -= 100;
        }
      } else {
        // console.log("NOPE2");
      }
    } else {
      // console.log("NOPE2");
    }


  }

})();
