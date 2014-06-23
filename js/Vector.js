var Vector = function(x, y) {
  this.elems = arguments.length === 1 ? x : [x || 0, y || 0];
};

Vector.size = function(elem) {
  return elem ? new Vector(elem.outerWidth(), elem.outerHeight()) : new Vector();
};

Vector.offset = function(elem) {
  return elem ? new Vector(elem.offset().left, elem.offset().top) : new Vector();
};

Vector.prototype.mouse = function(event) {
  this.elems = [event.pageX, event.pageY];
  return this;
};

Vector.prototype.offset = function(offset) {
  if (arguments.length === 0) return {left: this.elems[0], top: this.elems[1]};
  this.elems = [offset.left, offset.top];
  return this;
};

Vector.prototype.x = function(x) {
  if (arguments.length === 0) return this.elems[0];
  this.elems[0] = x;
  return this;
};

Vector.prototype.y = function(y) {
  if (arguments.length === 0) return this.elems[1];
  this.elems[1] = y;
  return this;
};

Vector.prototype.round = function() {
  return new Vector(this.elems.map(Math.round));
};

Vector.prototype.add = function(vector) {
  return new Vector(this.elems[0] + vector.elems[0], this.elems[1] + vector.elems[1]);
};

Vector.prototype.subtract = function(vector) {
  return new Vector(this.elems[0] - vector.elems[0], this.elems[1] - vector.elems[1]);
};

Vector.prototype.copy = function() {
  return new Vector(this.elems[0], this.elems[1]);
};
