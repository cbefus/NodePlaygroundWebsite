'use strict';

function Node(wWidth, wHeight, nodeRadiusMassModifier, maxNormalNodeVel) {
  this.nodeRadiusMassModifier = nodeRadiusMassModifier;
  this.deleted = false;
  this.maxNormalNodeVel = maxNormalNodeVel;

  this.randomize = function(wWidth, wHeight) {
    this.x_pos = Math.random() * wWidth;
    this.y_pos = Math.random() * wHeight;
    this.x_vel = Math.random() * 1 - 0.5;
    this.y_vel = Math.random() * 1 - 0.5; 
    this.mass = Math.random() * 1.5 + 1;
    this.charge = ((Math.random() >= 0.5)? 'pos' : 'neg');
  }

  this.build = function(x_pos, y_pos, x_vel, y_vel, mass, charge) {
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.x_vel = x_vel;
    this.y_vel = y_vel;
    this.mass = mass;
    this.charge = charge;
  }

  this.updateVelocity = function(x_vel, y_vel) {
    this.x_vel = x_vel;
    this.y_vel = y_vel;
    var currentSpeed = Math.abs(this.x_vel) + Math.abs(this.y_vel);
    if (currentSpeed > this.maxNormalNodeVel) {
      var dragForce = 0.5 * 1.29 * currentSpeed * this.mass * nodeRadiusMassModifier * 1.0;
      this.x_vel *= dragForce;
      this.y_vel *= dragForce;
    }
  }

  this.addVelocity = function(additional_x_vel, additional_y_vel) {
    this.updateVelocity(this.x_vel + additional_x_vel, this.y_vel + additional_y_vel);
  }

  this.radius = function() {
    return this.mass * this.nodeRadiusMassModifier;
  }

  this.move = function(wWidth, wHeight) {
    this.x_pos += this.x_vel;
    this.y_pos += this.y_vel;

    var radius = this.radius();

    //if we hit the edge of screen, bounce!
    if (this.x_pos + radius > wWidth ) {
      this.x_pos = wWidth - radius;
      this.updateVelocity(-this.x_vel, this.y_vel);
    } else if (this.x_pos - radius < 0) {
      this.x_pos = 0 + radius;
      this.updateVelocity(-this.x_vel, this.y_vel);
    }

    if (this.y_pos + radius > wHeight) {
      this.y_pos = wHeight - radius;
      this.updateVelocity(this.x_vel, -this.y_vel);
    } else if (this.y_pos - radius < 0) {
      this.y_pos = 0 + radius;
      this.updateVelocity(this.x_vel, -this.y_vel);
    }
  }

  this.draw = function(ctx) {
    if (!this.deleted) {
      ctx.beginPath();
      if (this.charge == 'pos') {
        ctx.fillStyle = "red";
      } else {
        ctx.fillStyle = "blue";
      }
      
      ctx.arc(this.x_pos, this.y_pos, this.radius(), 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
}