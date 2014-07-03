var $window = $(window);
var $body = $('body');
var $player = $('[data-player]');

var method = function(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(item) { return item[name].apply(item, args); };
};

$body.css('min-height', window.innerHeight);

var arena = new Platform($body);
var player = new Player($player);

var i = 0;
var platforms = $('[data-platform-top]').map(function() {
  var platform = new Platform($(this), 'top');
  platform.id = i++;

  return platform;
}).toArray();

platforms = platforms.concat($('[data-platform-bottom]').map(function() {
  var platform = new Platform($(this), 'bottom');
  platform.id = i++;

  return platform;
}).toArray());

$window.resize(function() {
  $body.css('min-height', window.innerHeight);
  arena.update();
  platforms.map(method('update'));
});

player.findPaths(platforms);
player.platform = platforms[0];
player.target = platforms[0];

var nearestPlatform = function(vector, platforms) {
  var nearest = platforms[0];
  var distance = nearest.distanceFrom(vector);
  platforms.slice(1).map(function(platform) {
    var newDistance = platform.distanceFrom(vector);
    if (newDistance < distance) {
      distance = newDistance;
      nearest = platform;
    }
  });
  return nearest;
};

var now = Date.now || function() { return new Date().getTime(); };

var debounce = function(func, wait) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = now() - timestamp;
    if (last < wait) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    return result;
  };
};


var cursor = new Vector();
$body.mousemove(debounce(function(e) {
  cursor.mouse(e);
  var platform = nearestPlatform(cursor.add(new Vector(0, player.size.y() / 2)), platforms);
  player.jumpTo(platform, platforms);
  player.runTo(platform.lateralRatio(cursor));
}, 10));

var loop = function() {
  player.update();
  player.draw();

  window.requestAnimationFrame(loop);
  // setTimeout(loop, 100);
};

loop();
