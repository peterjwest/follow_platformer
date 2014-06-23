var Platform = function($elem, arena) {
    this.$elem = $elem;
    this.arena = arena;
    this.p = new Vector();
    this.size = new Vector();
    this.mu = 0.95;
    this.type = this.$elem.data('platform');
    this.update();
};

Platform.prototype.left = function() {
    return this.p.x();
};

Platform.prototype.right = function() {
    return this.p.x() + this.size.x();
};

Platform.prototype.update = function() {
    this.size = Vector.size(this.$elem);
    this.p = Vector.offset(this.$elem).round();

    if (this.type === 'bottom') {
        this.p.y(this.p.y() + this.size.y());
    }

    return this;
};
