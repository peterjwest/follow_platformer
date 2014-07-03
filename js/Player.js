var Player = function($elem) {
    this.$elem = $elem;

    this.$elem.css('position', 'absolute');
    this.size = Vector.size(this.$elem);
    this.p = Vector.offset(this.$elem);
    this.v = new Vector();
    this.a = new Vector(0, 1);

    this.runAccel = 0.7;
    this.jumpSpeed = -17;

    this.platformPosition = 0.5;
    this.running = 0;
    this.jumping = 0;
    this.runUp = false;
    this.backOff = false;
    this.grounded = true;

    this.platform = null;
    this.nextPlatform = null;
    this.target = null;
    this.states = [];
    this.route = [];
};

var PADDING = 5;

Player.prototype.update = function() {

    // Backing off for a run up
    if (this.backOff !== false) {
        this.running = -this.direction(this.nextPlatform);

        // If finished backing off, start run up towards target
        if (this.backOff <= 0) {
            this.runUp = true;
        }
        // When backing off, countdown the back off each frame
        else {
            this.backOff--;
        }
    }

    // Running up for a jump
    if (this.runUp) {
        this.backOff = false;
        this.running = this.direction(this.nextPlatform);

        // Settings for a shorter jump, when jumping down or nearby
        var shortJump = 0.4;

        // Test whether the shorter jump is high enough to succeed
        var shortJumpHeight = this.checkJumpHeight(this.nextPlatform, shortJump);

        // Work out the required velocity for a shorter jump
        var v = this.requiredVelocity(this.nextPlatform, this.jumpFrames(this.nextPlatform, shortJump));

        // Test if we are ready to jump
        if (shortJumpHeight && (v === 0 || (v > 0 ? this.v.x() >= v : this.v.x() <= v)) && this.stoppingDistance() <= this.nextPlatform.size.x() - PADDING * 2 - this.size.x()) {

            // Decelerate if the velocity is too inaccurate
            if (Math.abs(this.v.x() - v) > 1) {
                this.running = this.v.x() > 0 ? -1 : 1;
            }
            // Otherwise initiate the jump using the correct velocity (hacks!)
            else {
                this.v.x(v);
                this.a.x(0);
                this.jumping = shortJump;
            }
        }
        else {
            // Work out the required velocity for a full jump
            v = this.requiredVelocity(this.nextPlatform, this.jumpFrames(this.nextPlatform));

            // Check if the player is travelling too fast to land the jump
            var slowingDistance = this.slowingDistance(this.requiredSpeed(this.nextPlatform));
            var distanceRemaining = this.v.x() > 0 ? this.platform.right() - this.right() : this.left() - this.platform.left();
            if (distanceRemaining <= slowingDistance) {
                this.running = this.v.x() > 0 ? -1 : 1;
            }

            // If we've hit the edge of the platform, jump!
            if (this.running > 0 ? this.right() > this.platform.right() : this.left() < this.platform.left()) {
                this.v.x(v);
                this.a.x(0);
                this.jumping = 1;
            }

            // Otherwise test if we are ready to jump and can land the jump
            else if ((v === 0 || (v > 0 ? this.v.x() >= v : this.v.x() <= v)) && this.stoppingDistance() <= this.nextPlatform.size.x() - PADDING * 2 - this.size.x()) {

                // Decelerate if the velocity is too inaccurate
                if (Math.abs(this.v.x() - v) > 1) {
                    this.running = this.v.x() > 0 ? -1 : 1;
                }
                // Otherwise initiate the jump using the correct velocity (hacks!)
                else {
                    this.v.x(v);
                    this.a.x(0);
                    this.jumping = 1;
                }
            }
        }
    }

    // Impulse for a jump
    if (this.jumping) {
        this.runUp = false;
        this.running = 0;
        this.v.y(this.jumpSpeed * this.jumping);
        this.jumping = 0;
    }

    // When there is a target
    if (this.nextPlatform) {
        // Run
        this.a.x(this.grounded && this.runAccel * this.running);

        // Switch to target at peak of jump
        if (!this.grounded && this.v.y() > 0) {
            this.platform = this.nextPlatform;
            this.nextPlatform = null;
        }
    }

    // Compute acceleration and velocity
    this.v = this.v.add(this.a);
    this.p = this.p.add(this.v);

    // Recompute whether the player is on the ground
    this.grounded = this.p.y() >= this.platform.ground();

    // When grounded
    if (this.grounded) {

        // Apply friction and normal resistance
        this.v.x(this.v.x() * this.platform.mu);
        this.p.y(this.platform.ground());
        this.v.y(0);

        // Move the next target from the queue
        if (!this.nextPlatform && this.route.length) {
            this.jump(this.route.shift());
        }

        // If there's no target, move to platform position
        if (!this.nextPlatform) {

            var position = this.platform.positionFromRatio(this.platformPosition) - this.size.x() / 2;

            position = Math.max(this.platform.left() + PADDING, position);
            position = Math.min(this.platform.right() - PADDING - this.size.x(), position);

            if (this.v.x() > 0 && this.stoppingDistance() >= this.platform.right() - this.right()) {
                this.a.x(-this.runAccel);
            }

            else if (this.v.x() < 0 && this.stoppingDistance() >= this.left() - this.platform.left()) {
                this.a.x(this.runAccel);
            }

            else if (position - this.p.x() > 5) {
                this.a.x(this.runAccel);
            }

            else if (this.p.x() - position > 5) {
                this.a.x(-this.runAccel);
            }

            else if (Math.abs(this.v.x()) > 2) {
                this.a.x(0);
            }

            // Stop
            else {
                this.v.x(0);
                this.a.x(0);
            }
        }
    }

    return this;
};

// Works out which platforms the player can jump to from which other platforms
Player.prototype.findPaths = function(platforms) {
    this.pushState();

    this.tree = [];

    for (var i = 0; i < platforms.length; i++) {
      this.moveTo(platforms[i]);
      this.tree[i] = [];

      for (var j = 0; j < platforms.length; j++) {
        if (j !== i && this.couldJump(platforms[j])) {
            this.tree[i].push(j);
        }
      }
    }

    this.popState();
};

// Teleports the player to a platform
Player.prototype.moveTo = function(platform) {
    this.platform = platform;
    this.p.y(this.platform.ground());
    this.p.x(this.platform.p.x());
};

// Saves the state of the player
Player.prototype.pushState = function() {
    this.states.push({
        p: this.p.copy(),
        v: this.v.copy(),
        a: this.a.copy(),
        size: this.size.copy(),
        platform: this.platform,
        target: this.nextPlatform,
        running: this.running,
        jumping: this.jumping,
        runUp: this.runUp,
        backOff: this.backOff,
        grounded: this.grounded,
        route: this.route.slice(0)
    });
};

// Restores the state of the player
Player.prototype.popState = function() {
    var state = this.states.pop();
    this.size = state.size;
    this.p = state.p;
    this.v = state.v;
    this.a = state.a;
    this.platform = state.platform;
    this.nextPlatform = state.target;
    this.running = state.running;
    this.jumping = state.jumping;
    this.runUp = state.runUp;
    this.backOff = state.backOff;
    this.grounded = state.grounded;
    this.route = state.route;
};

// The direction needed to travel towards a platform
Player.prototype.direction = function(platform) {
    if (this.left() < platform.left()) return 1;
    if (this.right() > platform.right()) return -1;
    return 0;
};

// Computes the height the player can jump
Player.prototype.jumpHeight = function(scale) {
    this.pushState();

    this.route = [];
    this.runUp = false;
    this.backOff = false;
    this.jumping = scale || 1;
    this.p.y(0);

    this.update();
    while (this.v.y() < 0) {
        this.update();
    }
    var height = this.p.y();

    this.popState();
    return Math.abs(height);
};

// Computes the number of frames in a jump to another platform
Player.prototype.jumpFrames = function(target, scale) {
    this.pushState();

    this.p.y(this.platform.ground());

    this.nextPlatform = target;
    this.route = [];
    this.runUp = false;
    this.backOff = false;
    this.jumping = scale || 1;

    var frames = 1;
    this.update();
    while (this.v.y() < 0 || this.p.y() < this.platform.ground()) {
        this.update();
        frames++;
    }

    this.popState();
    return frames;
};

// Computes the velocity needed to jump to another platform
Player.prototype.requiredVelocity = function(target, jumpFrames) {
    var direction = this.direction(target);

    if (direction === 0) return 0;
    if (direction === 1) {
        return (target.left() - this.left() + PADDING) / jumpFrames;
    }
    if (direction === -1) {
        return -(this.right() - target.right() + PADDING) / jumpFrames;
    }
};

// Computes the distance for the player to slow to the specified speed
Player.prototype.slowingDistance = function(speed) {
    this.pushState();
    var direction = this.v.x() > 0 ? 1 : -1;

    this.running = -direction;
    this.route = [];
    this.nextPlatform = true;
    this.runUp = false;
    this.backOff = false;

    var start = this.p.x();
    while (this.v.x() * direction > speed) this.update();
    var end = this.p.x();

    this.popState();
    return Math.abs(end - start);
};

// Computes the stopping distance for the player at their current velocity
Player.prototype.stoppingDistance = function() {
    return this.slowingDistance(0);
};

// Finds the (minimum) required speed to jump to another platform
Player.prototype.requiredSpeed = function(target) {
    this.pushState();

    this.p.x(this.direction(target) > 0 ? this.platform.right() - this.size.x() : this.platform.left());
    var requiredSpeed = Math.abs(this.requiredVelocity(target, this.jumpFrames(target)));

    this.popState();
    return requiredSpeed;
};

// Checks if the player is fully over a platform
Player.prototype.over = function(platform) {
    return this.left() >= platform.left() && this.right() <= platform.right();
};

// Checks if the player could potentially jump to another platform
Player.prototype.couldJump = function(target) {
    if (!this.checkJumpHeight(target)) return false;
    return this.maxSpeed() >= this.requiredSpeed(target) && this.couldStop(target);
};

// Checks if the player could potentially stop in time after jumping to another platform
Player.prototype.couldStop = function(target) {
    this.pushState();
    var v = this.requiredSpeed(target);
    this.v.x(v);

    var couldStop = this.stoppingDistance() <= target.size.x() - PADDING * 2 - this.size.x();
    this.popState();
    return couldStop;
};

// Computes the number of steps needed for a back off jump
Player.prototype.computeBackOffJump = function(target) {
    var i, steps = 0;
    var direction = -this.direction(target);

    while (true) {
        this.pushState();
        this.nextPlatform = target;
        this.route = [];
        this.runUp = false;
        this.backOff = false;

        this.running = direction;
        for (i = 0; i < steps; i++) this.update();

        this.running = -direction;
        while (this.v.x() * -this.running > 0) this.update();

        if (direction > 0 ? this.right() > this.platform.right() : this.left() < this.platform.left()) {
            if (steps > 0) steps--;
            break;
        }

        if (this.canJump(target)) {
            break;
        }

        this.popState();
        steps++;
    }

    this.popState();
    return steps;
};

Player.prototype.checkJumpHeight = function(target, scale) {
 return this.jumpHeight(scale) >= this.platform.ground() - target.ground();
};

// Finds the max speed the player can travel on a platform
Player.prototype.maxSpeed = function() {
    this.pushState();

    this.p.x(this.platform.p.x());
    this.v.x(0);
    this.nextPlatform = true;
    this.route = [];
    this.runUp = false;
    this.backOff = false;
    this.running = 1;

    while (this.over(this.platform)) this.update();

    var speed = Math.abs(this.v.x());

    this.popState();
    return speed;
};

// Checks if the player can jump from their current position to another platform
Player.prototype.canJump = function(target) {
    if (!this.checkJumpHeight(target)) return false;

    this.pushState();

    var jumpFrames = this.jumpFrames(target);

    this.nextPlatform = target;
    this.route = [];
    this.runUp = false;
    this.backOff = false;
    this.running = this.direction(target);

    while (this.over(this.platform)) {
        if (Math.abs(this.v.x()) >= Math.abs(this.requiredVelocity(target, jumpFrames))) {
            this.popState();
            return true;
        }
        this.update();
    }

    this.popState();
    return false;
};

// Performs a jump to a platform, if possible
Player.prototype.jump = function(target) {
    if (this.platform === target) return;
    if (!this.couldJump(target)) return;

    this.nextPlatform = target;
    this.backOff = this.computeBackOffJump(target);
};

// Finds a route to a platform and navigates to it
Player.prototype.jumpTo = function(target, platforms) {
    if (target === this.target) return;
    this.target = target;
    this.route = this.findRoute(target, platforms);
};

// Navigates the player to part of the target platform given by ratio from left to right
Player.prototype.runTo = function(ratio) {
    this.platformPosition = ratio;
};

// Djikstra search for a shortest path
Player.prototype.findRoute = function(target, platforms) {
    var jumpManoeveur = this.backOff !== false || this.runUp || this.jumping || !this.grounded;
    var currentPlatform = jumpManoeveur ? (this.nextPlatform || this.platform) : this.platform;
    var frontier = [{position: currentPlatform.id, route: [currentPlatform]}];
    var next = [];
    var visited = {};
    var i, j, current, jumps, route;

    while(frontier.length > 0) {
        for (i = 0; i < frontier.length; i++) {
            current = frontier[i];

            if (current.position === target.id) return current.route.slice(1);

            jumps = this.tree[current.position];
            for (j = 0; j < jumps.length; j++) {
                if (visited[jumps[j]]) continue;

                route = current.route.slice(0);
                route.push(platforms[jumps[j]]);
                next.push({position: jumps[j], route: route});
                visited[jumps[j]] = true;
            }
        }

        frontier = next;
        next = [];
    }

    return [];
};

Player.prototype.left = function() {
    return this.p.x();
};

Player.prototype.right = function() {
    return this.p.x() + this.size.x();
};

Player.prototype.feet = function() {
    return this.p.y() + this.size.y();
};

Player.prototype.draw = function() {
    this.$elem.offset(new Vector(parseInt(this.p.x(), 10), parseInt(this.p.y() - this.size.y(), 10)).offset());
    return this;
};
