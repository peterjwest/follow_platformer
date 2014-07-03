Mouse following platformer
==========================

This is a small demo to show how a platformer character could be controlled by a mouse, in a way that would be intuitive and fun for non gamers. The character would also naturally follow as the user browsed the page.

## How to use

1. Include the minified script on your page (recommended at the bottom of the body tag)
2. Include jQuery on the page before the script
3. Tag the player character using the `data-player` attribtute e.g:

    <div class="player" data-player></div>

4. Tag platforms for the player to run on using `data-platform-top` and `data-platform-bottom`, these will allow the player to jump on the top or bottom of that element respectively:

    <section class="platform" data-platform-top style="left: 830px; top: 320px; width: 100px; height: 20px;">
    </section>

5. That's it! If your platforms are too far apart, the player may not be able to jump between them though.

I'm planning to add more configuration options in the future.


## TODO

- Add interactive elements based on proximity
- Add player configuration options (run speed, jump height, gravity)
- Add player animation hooks to allow run, jump, idle animations
- Improve short jump handling
- Handle falling off a platform nicely
- Update algorithm to take platform distance into account (fastest route)
- Add maximum fall distance
- Add ability to jump to correct position on platform
- GH pages demo
