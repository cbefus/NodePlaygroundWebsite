'use strict';

function NodeManager(nodeRadiusMassModifier, gravitationalConstant, maxGravitationalForce, relationLineThicknessMultiplier, relationForceModifier, maxNodes, massLimitForSplit, maxNormalNodeVel) {
  this.nodeRadiusMassModifier = nodeRadiusMassModifier;
  this.gravitationalConstant = gravitationalConstant;
  this.maxGravitationalForce = maxGravitationalForce;
  this.relationLineThicknessMultiplier = relationLineThicknessMultiplier;
  this.relationForceModifier = relationForceModifier;
  this.maxNodes = maxNodes;
  this.massLimitForSplit = massLimitForSplit;
  this.maxNormalNodeVel = maxNormalNodeVel;

  this.redNodeCount = 0;
  this.blueNodeCount = 0;
  this.totalRedNodeMass = 0.0;
  this.totalBlueNodeMass = 0.0;
  this.nodes = [];

  this.addNewNodes = function(numNodes, wWidth, wHeight) {
    for (var i = 0; i < numNodes; i++) {
      var newNode = new Node(wWidth, wHeight, this.nodeRadiusMassModifier, this.maxNormalNodeVel);
      newNode.randomize(wWidth, wHeight);  
      this.addNewNode(newNode);
    };
  }

  this.addNewNode = function(newNode) {
    if (newNode.charge == "pos") {
      this.redNodeCount += 1;
      this.totalRedNodeMass += newNode.mass;
    } else {
      this.blueNodeCount += 1;
      this.totalBlueNodeMass += newNode.mass;
    }
    this.nodes.push(newNode);
  }

  this.updateAndDraw = function(ctx, wWidth, wHeight, maxDistanceForRelation) {
    // update/draw nodes and relations
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].mass > this.massLimitForSplit) {
        var radius = this.nodes[i].radius()
        var diameter = radius * 2;
        while (this.nodes[i].mass > 20) {
          var newXposMod = Math.random() * diameter - radius;
          var newYposMod = Math.random() * diameter - radius;
          var newXvelMod = Math.random() * 2;
          if (newXposMod <= 0.0) {
            newXvelMod = -newXvelMod;
          }
          var newYvelMod = Math.random() * 2;
          if (newYposMod <= 0.0) {
            newYvelMod = -newYvelMod;
          }
          var newMass = Math.random() * 20;
          var newNode = new Node(wWidth, wHeight, this.nodeRadiusMassModifier);
          newNode.build(
            this.nodes[i].x_pos + newXposMod,
            this.nodes[i].y_pos + newYposMod,
            this.nodes[i].x_vel + newXvelMod,
            this.nodes[i].y_vel + newYvelMod,
            newMass,
            this.nodes[i].charge
          );
          this.nodes[i].mass -= newMass;
          this.addNewNode(newNode);
        }
      }

      this.nodes[i].move(wWidth, wHeight);
      this.nodes[i].draw(ctx);

      if (i == this.nodes.length - 1) {
        continue;
      }

      // update/draw relations
      for (var j = i + 1; j < this.nodes.length; j++) {
        var nodeRelation = new NodeRelation(this.nodes[i], this.nodes[j], this.gravitationalConstant, this.maxGravitationalForce, this.relationLineThicknessMultiplier, this.relationForceModifier);

        if (nodeRelation.distance > maxDistanceForRelation) {
          // distance over max pixels - ignore relation
          continue;
        }

        if (nodeRelation.collision()) {
          //figure out who lost
          var losingNode = this.nodes[i];
          var winningNode = this.nodes[j];
          if (winningNode.mass < losingNode.mass) {
            winningNode = this.nodes[i];
            losingNode = this.nodes[j];
          }
          //remove loser from totals
          if (losingNode.charge == "pos") {
            this.totalRedNodeMass -= losingNode.mass;
            this.redNodeCount -= 1;
          } else {
            this.totalBlueNodeMass -= losingNode.mass;
            this.blueNodeCount -= 1;
          }
          //give winner losers mass
          winningNode.mass += losingNode.mass;
          //record mass transfer to winner
          if (winningNode.charge == "pos") {
            this.totalRedNodeMass += losingNode.mass;
          } else {
            this.totalBlueNodeMass += losingNode.mass;
          }

          losingNode.deleted = true;
          continue;
        }

        // draw gravity lines
        nodeRelation.draw(ctx);
        // apply relation forces to the nodes
        nodeRelation.applyForces();
      }      
    }

    //delete destroyed nodes
    var newNodeList = [];
    for (var i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].deleted) {
        newNodeList.push(this.nodes[i]);
      }
    };
    this.nodes = newNodeList;

  }

}