var $window = $(window);
var $document = $(document);
var $body = $('body');
var $player = $('[data-player]');
var $platforms = $('[data-platform]');

var method = function(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(item) { return item[name].apply(item, args); };
};

var mouse = new Vector();
$body.mousemove(function(e) {
  mouse.mouse(e);
});

$body.data('platform', 'bottom');
$body.css('min-height', window.innerHeight);
var arena = new Platform($body);

var keys = {up: false, down: false, left: false, right: false, space: false};
var keyCodes = {32: 'space', 37: 'left', 38: 'up', 39: 'right', 40: 'down'};

$document.keydown(function(e){
  if (keyCodes[e.keyCode]) keys[keyCodes[e.keyCode]] = true;
});
$document.keyup(function(e) {
  if (keyCodes[e.keyCode]) keys[keyCodes[e.keyCode]] = false;
});

var player = new Player($player, keys);

var i = 0;
var platforms = $platforms.map(function() {
  var platform = new Platform($(this));
  platform.id = i++;

  $(this).hover(function() {
    player.jumpTo(platform, platforms);
  });

  return platform;
}).toArray();

$window.resize(function() {
  $body.css('min-height', window.innerHeight);
  arena.update();
  platforms.map(method('update'));
});

player.findPaths(platforms);

player.platform = platforms[0];

var loop = function() {
  player.update();
  player.draw();

  window.requestAnimationFrame(loop);
  // setTimeout(loop, 100);
};

loop();
