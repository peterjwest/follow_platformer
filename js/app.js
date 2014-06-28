var $window = $(window);
var $document = $(document);
var $body = $('body');
var $player = $('[data-player]');
var $platforms = $('[data-platform]');

var method = function(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(item) { return item[name].apply(item, args); };
};

$body.data('platform', 'bottom');
$body.css('min-height', window.innerHeight);

var arena = new Platform($body);
var player = new Player($player);

var i = 0;
var platforms = $platforms.map(function() {
  var platform = new Platform($(this));
  platform.id = i++;

  // $(this).hover(function() {
  //   player.jumpTo(platform, platforms);
  // });

  return platform;
}).toArray();

$window.resize(function() {
  $body.css('min-height', window.innerHeight);
  arena.update();
  platforms.map(method('update'));
});

player.findPaths(platforms);
player.platform = platforms[0];

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

var mouse = new Vector();
$body.mousemove(function(e) {
  mouse.mouse(e);
  player.jumpTo(nearestPlatform(mouse, platforms), platforms);
});

var loop = function() {
  player.update();
  player.draw();

  window.requestAnimationFrame(loop);
  // setTimeout(loop, 100);
};

loop();
