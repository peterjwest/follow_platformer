var Platform = function($elem, arena) {
    this.$elem = $elem;
    this.arena = arena;
    this.p = new Vector();
    this.size = new Vector();
    this.mu = 0.96;
    this.type = this.$elem.data('platform');
    this.update();
};

Platform.prototype.left = function() {
    return this.p.x();
};

Platform.prototype.right = function() {
    return this.p.x() + this.size.x();
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

Platform.prototype.lateralDistanceFrom = function(vector) {
    if (vector.x() < this.left()) return this.left() - vector.x();
    if (vector.x() > this.right()) return vector.x() - this.right();
    return 0;
};

Platform.prototype.distanceFrom = function(vector) {
    return Math.sqrt(Math.pow(this.ground() - vector.y(), 2) + Math.pow(this.lateralDistanceFrom(vector), 2));
};

Platform.prototype.update = function() {
    this.size = Vector.size(this.$elem);
    this.p = Vector.offset(this.$elem).round();

    return this;
};
