import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import { representations, MockPlaylistLoader, MockMediaPlayer } from './test-helpers';

import plugin from '../src/plugin';

videojs.Html5DashJS = videojs.Html5DashJS || {};

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-contrib-quality-levels', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.strictEqual(
    Player.prototype.qualityLevels,
    plugin,
    'videojs-contrib-quality-levels plugin was registered'
  );
});

QUnit.test('hls lifecyle', function(assert) {
  let playlistLoader = new MockPlaylistLoader();

  this.player.tech_.hls = {
    representations() {
      return representations;
    },
    playlists: playlistLoader
  };

  let qualityLevels = this.player.qualityLevels();
  let addCount = 0;
  let changeCount = 0;

  qualityLevels.on('addqualitylevel', () => {
    addCount++;
  });

  qualityLevels.on('change', () => {
    changeCount++;
  });

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);
  this.player.trigger('loadstart');

  assert.equal(qualityLevels.length, 0, 'no quality levels available before loadedmetadata');
  assert.equal(qualityLevels.selectedIndex, -1, 'no quality level selected yet');

  // Set mock playlist loader to select initial media to be index 0
  playlistLoader.mediaIndex_ = 0;
  playlistLoader.trigger('loadedmetadata');

  assert.equal(qualityLevels.length, 4, 'added 4 quality levels');
  assert.equal(addCount, 4, 'trigger 4 addqualitylevel events');
  assert.equal(qualityLevels.selectedIndex, 0, 'set selectedIndex correctly');
  assert.equal(changeCount, 1, 'triggered change event');

  // mock abr media change
  playlistLoader.mediaIndex_ = 2;
  playlistLoader.trigger('mediachange');

  assert.equal(qualityLevels.selectedIndex, 2, 'set selectedIndex correctly');
  assert.equal(changeCount, 2, 'triggered change event');
});

QUnit.test('dash lifecyle', function(assert) {
  let beforeInitCount = 0;
  let mediaPlayer = new MockMediaPlayer();
  const origBeforeInitialize = videojs.Html5DashJS.beforeInitialize;
  const expectBeforeIntitialize = function() {
    beforeInitCount++;
  };

  videojs.Html5DashJS.beforeInitialize = expectBeforeIntitialize;

  this.player.dash = this.player.dash || {};
  this.player.dash.representations = () => representations;

  let qualityLevels = this.player.qualityLevels();
  let addCount = 0;
  let changeCount = 0;

  qualityLevels.on('addqualitylevel', () => {
    addCount++;
  });

  qualityLevels.on('change', () => {
    changeCount++;
  });

  // Mock before initialize being called by dash source handler
  videojs.Html5DashJS.beforeInitialize(this.player, mediaPlayer);
  assert.equal(beforeInitCount, 1, 'the original beforeInitialize function only called once');

  assert.equal(qualityLevels.length, 0, 'no quality levels available before playbackMetaDataLoaded');
  assert.equal(qualityLevels.selectedIndex, -1, 'no quality level selected yet');

  mediaPlayer.trigger('playbackMetaDataLoaded');

  assert.equal(qualityLevels.length, 4, 'added 4 quality levels');
  assert.equal(addCount, 4, 'trigger 4 addqualitylevel events');
  assert.equal(qualityLevels.selectedIndex, -1, 'no quality level selected yet');
  assert.equal(changeCount, 0, 'did not trigger change event');

  // Set mock media player to select initial media to be index 0
  mediaPlayer.trigger({
    type: 'qualityChangeRequested',
    newQuality: 0
  });

  assert.equal(qualityLevels.selectedIndex, 0, 'set selectedIndex correctly');
  assert.equal(changeCount, 1, 'triggered change event');

  // mock abr media change
  mediaPlayer.trigger({
    type: 'qualityChangeRequested',
    newQuality: 2
  });

  assert.equal(qualityLevels.selectedIndex, 2, 'set selectedIndex correctly');
  assert.equal(changeCount, 2, 'triggered change event');

  this.player.trigger('dispose');

  assert.strictEqual(expectBeforeIntitialize, videojs.Html5DashJS.beforeInitialize,
    'beforeInitialize properly restored on player disposal');

  videojs.Html5DashJS.beforeInitialize = origBeforeInitialize;
});
