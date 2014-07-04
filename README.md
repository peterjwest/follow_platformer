Mouse following platformer
==========================

This is a small demo to show how a platformer character could be controlled by a mouse, in a way that would be intuitive and fun for non gamers. The character would also naturally follow as the user browsed the page.

### [Demo](http://peterjwest.github.io/follow_platformer/)

### [Download minified](https://raw.githubusercontent.com/peterjwest/follow_platformer/master/dist/follower.min.js)

## How to use

1. Include the minified script on your page (recommended at the bottom of the body tag)

2. Include jQuery on the page before the script

3. Tag the player character using the `data-player` attribtute

4. Tag platforms for the player to run on using `data-platform="top"`, `data-platform="bottom"` or `data-platform="both"`, these will allow the player to jump on the top, bottom or both ledges of that element respectively

5. Tag trigger elements to toggle create effects when the player is near

    - Use the `data-trigger` attribute with the value `add-class`, `remove-class`, `toggle-class` or `reverse-toggle-class`
    - Use the `data-proximity` attribute to specify a distance at which to trigger the event
    - Use the `data-class` attribute to choose a class to add/remove

6. That's it! If your platforms are too far apart, the player may not be able to jump between them though.

I'm planning to add more configuration options in the future.


## TODO

- Add player configuration options (run speed, jump height, gravity)
- Add player animation hooks to allow run, jump, idle animations
- Improve short jump handling
- Handle falling off a platform nicely
- Update algorithm to take platform distance into account (fastest route)
- Add maximum fall distance
- Add ability to jump to correct position on platform
