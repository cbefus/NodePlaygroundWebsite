'use strict';

function NodeRelation(nodeA, nodeB, gravitationalConstant, maxGravitationalForce, relationLineThicknessMultiplier, relationForceModifier) {
  this.gravitationalConstant = gravitationalConstant;
  this.relationLineThicknessMultiplier = relationLineThicknessMultiplier;
  this.relationForceModifier = relationForceModifier;
  this.nodeA = nodeA;
  this.nodeB = nodeB;
  this.xDistance = nodeA.x_pos - nodeB.x_pos;
  this.yDistance = nodeA.y_pos - nodeB.y_pos;
  this.distance = Math.sqrt(Math.pow(this.xDistance, 2) + Math.pow(this.yDistance, 2));
  // calculate gravity force
  this.force = this.gravitationalConstant * this.nodeA.mass * this.nodeB.mass / Math.pow(this.distance, 2);
  if (this.force > maxGravitationalForce) {
    // cap force to a maximum value of 0.025
    this.force = maxGravitationalForce;
  }

  this.collision = function() {
    if (this.nodeA.deleted || this.nodeB.deleted) {
      return false;
    }
    if (this.distance < this.nodeA.mass * this.nodeA.nodeRadiusMassModifier + this.nodeB.mass * this.nodeB.nodeRadiusMassModifier) {
      // collision
      return true;
    }
    return false;
  }

  this.applyForces = function() {
    if (this.nodeA.deleted || this.nodeB.deleted) {
      return;
    }
    // calculate gravity direction
    var direction = {
      x: this.xDistance / this.distance,
      y: this.yDistance / this.distance
    };

    var xForce = this.force * direction.x * this.relationForceModifier;
    var yForce = this.force * direction.y * this.relationForceModifier;

    // calculate new velocity after gravity -- DO THIS THE OTHER WAY FOR DETRACTORS
    if (this.nodeA.charge != this.nodeB.charge) {
      this.nodeA.addVelocity(-xForce, -yForce);
      this.nodeB.addVelocity(xForce, yForce);
    } else {
      this.nodeA.addVelocity(xForce, yForce);
      this.nodeB.addVelocity(-xForce, -yForce);
    } 
  }

  this.draw = function(ctx) {
    if (this.nodeA.deleted || this.nodeB.deleted) {
      return;
    }
    ctx.beginPath();
    // ctx.strokeStyle = 'rgba(63,63,63,' + this.force * this.relationLineThicknessMultiplier + ')';
    if (this.nodeA.charge != this.nodeB.charge) {
      ctx.strokeStyle = 'red';
    } else {
      ctx.strokeStyle = 'blue';
    }
    ctx.lineWidth = this.force * this.relationLineThicknessMultiplier;
    ctx.moveTo(this.nodeA.x_pos, this.nodeA.y_pos);
    ctx.lineTo(this.nodeB.x_pos, this.nodeB.y_pos);
    ctx.stroke();
    ctx.closePath();
  }
}