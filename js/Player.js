var Player = function($elem, keys) {
    this.$elem = $elem;
    this.keys = keys;

    this.size = Vector.size(this.$elem);
    this.p = Vector.offset(this.$elem);
    this.v = new Vector();
    this.a = new Vector(0, 1.2);

    this.runAccel = 1;
    this.jumpSpeed = -18;

    this.running = 0;
    this.jumping = 0;
    this.runUp = false;
    this.backOff = false;
    this.grounded = true;

    this.platform = this;
    this.target = null;
    this.states = [];
    this.route = [];
};

Player.prototype.update = function() {
    // // Running
    // if (this.grounded) {
    //     if (this.keys.right) this.running = 1;
    //     if (this.keys.left) this.running = -1;
    // }

    // // Jumping
    // if (this.keys.space && this.grounded) {
    //     this.jumping = 1;
    // }

    // Backing off for a run up
    if (this.backOff !== false) {
        this.running = -this.direction(this.target);

        // If finished backing off, start run up towards target
        if (this.backOff === 0) {
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
        this.running = this.direction(this.target);

        var f = this.jumpFrames(this.target);
        var v = this.requiredVelocity(this.target, f);
        // Test if we are ready to jump
        if (
            !this.over(this.platform) ||
            v > 0 ? this.v.x() >= v : this.v.x() <= v
        ) {
            // Initiate the jump using the correct velocity (hacks!)
            this.v.x(v);
            this.a.x(0);
            this.jumping = 1;
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
    if (this.target) {
        // Run
        this.a.x(this.grounded && this.runAccel * this.running);

        // Switch to target at peak of jump
        if (!this.grounded && this.v.y() > 0) {
            this.platform = this.target;
            this.target = null;
        }
    }

    // Compute acceleration and velocity
    this.v = this.v.add(this.a);
    this.p = this.p.add(this.v);

    // Recompute whether the player is on the ground
    this.grounded = this.p.y() >= this.platform.p.y();

    // When grounded
    if (this.grounded) {

        // Apply friction and normal resistance
        this.v.x(this.v.x() * this.platform.mu);
        this.p.y(this.platform.p.y());
        this.v.y(0);

        // Move the next target from the queue
        if (!this.target && this.route.length) {
            this.jump(this.route.shift());
        }

        // If there's no target, stop
        if (!this.target) {
            // Decelerate
            if (Math.abs(this.v.x()) > 1) {
                this.a.x(this.runAccel * (this.v.x() > 0 ? -1 : 1));
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

Player.prototype.moveTo = function(platform) {
    this.platform = platform;
    this.p.y(this.platform.p.y());
    this.p.x(this.platform.p.x());
};

Player.prototype.pushState = function() {
    this.states.push({
        p: this.p.copy(),
        v: this.v.copy(),
        a: this.a.copy(),
        size: this.size.copy(),
        platform: this.platform,
        target: this.target,
        running: this.running,
        jumping: this.jumping,
        runUp: this.runUp,
        backOff: this.backOff,
        grounded: this.grounded,
        route: this.route.slice(0)
    });
};

Player.prototype.popState = function() {
    var state = this.states.pop();
    this.size = state.size;
    this.p = state.p;
    this.v = state.v;
    this.a = state.a;
    this.platform = state.platform;
    this.target = state.target;
    this.running = state.running;
    this.jumping = state.jumping;
    this.runUp = state.runUp;
    this.backOff = state.backOff;
    this.grounded = state.grounded;
    this.route = state.route;
};

Player.prototype.direction = function(platform) {
    if (this.left() < platform.left()) return 1;
    if (this.right() > platform.right()) return -1;
    return 0;
};

Player.prototype.jumpHeight = function() {
    this.pushState();

    this.route = [];
    this.runUp = false;
    this.backOff = false;
    this.jumping = 1;
    this.p.y(0);

    this.update();
    while (this.v.y() < 0) {
        this.update();
    }
    var height = this.p.y();

    this.popState();
    return Math.abs(height);
};

Player.prototype.jumpFrames = function(target) {
    this.pushState();

    this.p.y(this.platform.p.y());

    this.target = target;
    this.route = [];
    this.runUp = false;
    this.backOff = false;
    this.jumping = 1;

    var frames = 1;
    this.update();
    while (this.v.y() < 0 || this.p.y() < this.platform.p.y()) {
        this.update();
        frames++;
    }

    this.popState();
    return frames;
};

Player.prototype.requiredVelocity = function(target, jumpFrames) {
    var direction = this.direction(target);
    var padding = 10;

    if (direction === 0) return 0;
    if (direction === 1) {
        return (target.left() - this.left() + padding) / jumpFrames;
    }
    if (direction === -1) {
        return -(this.right() - target.right() + padding) / jumpFrames;
    }
};

Player.prototype.over = function(platform) {
    return this.left() >= platform.left() && this.right() <= platform.right();
};

Player.prototype.couldJump = function(target) {
    this.pushState();

    this.p.x(this.direction(target) > 0 ? this.platform.left() : this.platform.right() - this.size.x());
    this.v.x(0);
    var canJump = this.canJump(target);

    this.popState();
    return canJump;
};

Player.prototype.computeBackOffJump = function(target) {
    var i, steps = 0;

    while (true) {
        this.pushState();
        this.target = target;
        this.route = [];
        this.runUp = false;
        this.backOff = false;

        this.running = -this.direction(target);
        for (i = 0; i < steps; i++) this.update();

        this.running *= -1;
        while (this.v.x() * -this.running > 0) this.update();

        if (this.right() > this.platform.right() || this.left() < this.platform.left()) {
            steps--;
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

Player.prototype.canJump = function(target) {
    if (this.jumpHeight() < this.platform.p.y() - target.p.y()) return false;

    this.pushState();

    var jumpFrames = this.jumpFrames(target);

    this.target = target;
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

Player.prototype.jump = function(target) {
    if (this.platform === target) return;
    if (!this.couldJump(target)) return;

    this.target = target;
    this.backOff = this.computeBackOffJump(target);
};

Player.prototype.jumpTo = function(target, platforms) {
    this.route = this.findRoute(target, platforms);
};

Player.prototype.findRoute = function(target, platforms) {
    var frontier = [{position: this.platform.id, route: [this.platform]}];
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