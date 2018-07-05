# videojs-contrib-quality-levels
[![Build Status](https://travis-ci.org/videojs/videojs-contrib-quality-levels.svg?branch=master)](https://travis-ci.org/videojs/videojs-contrib-quality-levels)
[![Greenkeeper badge](https://badges.greenkeeper.io/videojs/videojs-contrib-quality-levels.svg)](https://greenkeeper.io/)
[![Slack Status](http://slack.videojs.com/badge.svg)](http://slack.videojs.com)

[![NPM](https://nodei.co/npm/videojs-contrib-quality-levels.png?downloads=true&downloadRank=true)](https://nodei.co/npm/videojs-contrib-quality-levels/)

A plugin that displays user-friendly messages when Video.js encounters an error.

Maintenance Status: Stable

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Using](#using)
  - [Populating the list](#populating-the-list)
    - [HLS](#hls)
- [Including the Plugin](#including-the-plugin)
  - [`<script>` Tag](#script-tag)
  - [Browserify](#browserify)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

- [Installation](#installation)
- [Using](#using)
  - [Populating the list](#populating-the-list)
    - [HLS](#hls)
- [Including the Plugin](#including-the-plugin)
  - [`<script>` Tag](#script-tag)
  - [Browserify](#browserify)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-contrib-quality-levels
```

The npm installation is preferred, but Bower works, too.

```sh
bower install  --save videojs-contrib-quality-levels
```

## Using

The list of `QualiyLevel`s can be accessed using `qualityLevels()` on the Player object.
With this list, you can:
 * see which quality levels are available for the current source
 * enable or disable specific quality levels to change which levels are selected by ABR
 * see which quality level is currently selected by ABR

Example
```js
let player = videojs('my-video');

let qualityLevels = player.qualityLevels();

// disable quality levels with less than 720 horizontal lines of resolution when added
// to the list.
qualityLevels.on('addqualitylevel', function(event) {
  let qualityLevel = event.qualityLevel;

  if (qualityLevel.height >= 720) {
    qualityLevel.enabled = true;
  } else {
    qualityLevel.enabled = false;
  }
});

// example function that will toggle quality levels between SD and HD, defining and HD
// quality as having 720 horizontal lines of resolution or more
let toggleQuality = (function() {
  let enable720 = true;

  return function() {
    for (var i = 0; i < qualityLevels.length; i++) {
      let qualityLevel = qualityLevels[i];
      if (qualityLevel.width >= 720) {
        qualityLevel.enabled = enable720;
      } else {
        qualityLevel.enabled = !enable720;
      }
    }
    enable720 = !enable720;
  };
})();

let currentSelectedQualityLevelIndex = qualityLevels.selectedIndex; // -1 if no level selected
```

### Populating the list
Initially the list of quality levels will be empty. You can add quality levels to the list by using `QualityLevelList.addQualityLevel` for each quality level specific to your source. `QualityLevelList.addQualityLevel` takes in a `Representation` object (or generic object with the required properties). All properties are required except `width` and `height`.

Example Representation
```js
Representation {
  id: string,
  width: number,
  height: number,
  bitrate: number,
  enabled: function
}
```

The `enabled` function should take an optional boolean to enable or disable the representation and return whether it is currently enabled.

#### HLS

Quality levels for an HLS source will be automatically populated when using [videojs-contrib-hls](https://github.com/videojs/videojs-contrib-hls) version 4.1 or greater.


## Including the Plugin

To include videojs-contrib-quality-levels on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-contrib-quality-levels.min.js"></script>
<script>
  var player = videojs('my-video');

  player.qualityLevels();
</script>
```

### Browserify

When using with Browserify, install videojs-contrib-quality-levels via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-contrib-quality-levels');

var player = videojs('my-video');

player.qualityLevels();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-contrib-quality-levels'], function(videojs) {
  var player = videojs('my-video');

  player.qualityLevels();
});
```

## License

Apache-2.0. Copyright (c) Brightcove, Inc.


[videojs]: http://videojs.com/
