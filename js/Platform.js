var Platform = function($elem, type) {
    this.$elem = $elem;
    this.p = new Vector();
    this.size = new Vector();
    this.mu = 0.96;
    this.type = type || 'top';
    this.update();
};

Platform.prototype.left = function() {
    return this.p.x();
};

Platform.prototype.right = function() {
    return this.p.x() + this.size.x();
};

Platform.prototype.top = function() {
    return this.p.y();
};

Platform.prototype.bottom = function() {
    return this.p.y() + this.size.y();
};

Platform.prototype.ground = function() {
    return this.p.y() + (this.type === 'bottom' ? this.size.y() : 0);
};

Platform.prototype.lateralRatio = function(vector) {
    if (vector.x() < this.left()) return 0;
    if (vector.x() > this.right()) return 1;
    return (vector.x() - this.p.x()) / this.size.x();
};

Platform.prototype.positionFromRatio = function(ratio) {
    return ratio * this.size.x() + this.p.x();
};

Platform.prototype.lateralDistanceFromPlayer = function(player) {
    if (player.right() >= this.left() && player.left() <= this.right()) return 0;
    if (player.right() < this.left()) return this.left() - player.right();
    if (player.left() > this.right()) return player.left() - this.right();
};

Platform.prototype.verticalDistanceFromPlayer = function(player) {
    if (player.bottom() >= this.top() && player.top() <= this.bottom()) return 0;
    if (player.bottom() < this.top()) return this.top() - player.bottom();
    if (player.top() > this.bottom()) return player.top() - this.bottom();
};

Platform.prototype.distanceFromPlayer = function(player) {
    return Math.sqrt(
        Math.pow(this.lateralDistanceFromPlayer(player), 2) +
        Math.pow(this.verticalDistanceFromPlayer(player), 2)
    );
};

Platform.prototype.lateralDistanceFrom = function(vector) {
    if (vector.x() < this.left()) return this.left() - vector.x();
    if (vector.x() > this.right()) return vector.x() - this.right();
    return 0;
};

Platform.prototype.jumpDistanceFrom = function(vector) {
    return Math.sqrt(Math.pow(this.ground() - vector.y(), 2) + Math.pow(this.lateralDistanceFrom(vector), 2));
};

Platform.prototype.update = function() {
    this.size = Vector.size(this.$elem);
    this.p = Vector.offset(this.$elem).round();

    return this;
};
