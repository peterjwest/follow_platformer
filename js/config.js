require.config({});
require(['Vector', 'Player', 'Platform', 'vendor/raf'], function(Vector, Player, Platform) {

    var $window = $(window);
    var $body = $('body');
    var $player = $('[data-player]');

    var method = function(name) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function(item) { return item[name].apply(item, args); };
    };

    $body.css('min-height', window.innerHeight);

    var player = new Player($player);

    var i = 0;
    var platforms = $('[data-platform=top], [data-platform=both]').map(function() {
        var platform = new Platform($(this), 'top');
        platform.id = i++;
        return platform;
    }).toArray();

    platforms = platforms.concat($('[data-platform=bottom], [data-platform=both]').map(function() {
        var platform = new Platform($(this), 'bottom');
        platform.id = i++;
        return platform;
    }).toArray());

    var triggers = $('[data-trigger').map(function() {
        return new Platform($(this));
    }).toArray();

    $window.resize(function() {
        $body.css('min-height', window.innerHeight);
        platforms.map(method('update'));
        triggers.map(method('update'));
    });

    player.findPaths(platforms);
    player.moveTo(platforms[0]);
    player.target = platforms[0];

    var nearestPlatform = function(vector, platforms) {
        var nearest = platforms[0];
        var distance = nearest.jumpDistanceFrom(vector);
        platforms.slice(1).map(function(platform) {
            var newDistance = platform.jumpDistanceFrom(vector);
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

        var dist, $elem;
        for (var i = 0; i < triggers.length; i++) {
            $elem = triggers[i].$elem;
            dist = triggers[i].distanceFromPlayer(player);
            if (dist <= ($elem.data('proximity') || 0)) {
                if ($elem.data('trigger') === 'add-class' || $elem.data('trigger') === 'toggle-class') {
                    $elem.addClass($elem.data('class'));
                }
                if ($elem.data('trigger') === 'remove-class' || $elem.data('trigger') === 'reverse-toggle-class') {
                    $elem.removeClass($elem.data('class'));
                }
            }
            else {
                if ($elem.data('trigger') === 'toggle-class') $elem.removeClass($elem.data('class'));
                if ($elem.data('trigger') === 'reverse-toggle-class') $elem.addClass($elem.data('class'));
            }
        }

        window.requestAnimationFrame(loop);
    };

    loop();

});
