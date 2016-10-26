import videojs from 'video.js';
import QualityLevel from './quality-level.js';
import QualityLevelList from './quality-level-list.js';

const noop = () => {};

const getHlsPlaylistIndex = function(media, playlists) {
  for (let i = 0; i < playlists.length; i++) {
    let playlist = playlists[i];

    if (playlist.resolvedUri === media.resolvedUri) {
      return i;
    }
  }
  return -1;
};

const setupHlsHandlers = function(qualityLevels, hls) {
  hls.playlists.on('loadedmetadata', () => {
    let selectedPlaylist = hls.playlists.media();
    let selectedIndex = getHlsPlaylistIndex(selectedPlaylist,
      hls.playlists.master.playlists);

    hls.representations().forEach((rep) => {
      qualityLevels.addQualityLevel(new QualityLevel(rep));
    });

    qualityLevels.selectedIndex_ = selectedIndex;
    qualityLevels.trigger({
      selectedIndex,
      type: 'change'
    });
  });

  hls.playlists.on('mediachange', () => {
    let newPlaylist = hls.playlists.media();
    let selectedIndex = getHlsPlaylistIndex(newPlaylist,
      hls.playlists.master.playlists);

    qualityLevels.selectedIndex_ = selectedIndex;
    qualityLevels.trigger({
      selectedIndex,
      type: 'change'
    });
  });
};

const setupdDashHandlers = function() {
  let beforeDashInit = videojs.Html5DashJS.beforeInitialize || noop;

  videojs.Html5DashJS.beforeInitialize = function(player, newMediaPlayer) {
    beforeDashInit(player, newMediaPlayer);

    if (!(player.dash && player.dash.representations)) {
      return;
    }

    let qualityLevels = player.qualityLevels();

    newMediaPlayer.on('playbackMetaDataLoaded', () => {
      let representations = player.dash.representations();

      representations.forEach((rep) => {
        qualityLevels.addQualityLevel(new QualityLevel(rep));
      });
    });

    newMediaPlayer.on('qualityChangeRequested', (event) => {
      let selectedIndex = event.newQuality;

      qualityLevels.selectedIndex_ = selectedIndex;
      qualityLevels.trigger({
        selectedIndex,
        type: 'change'
      });
    });
  };
};

let qualityLevelList = null;

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function qualityLevels
 */
const qualityLevels = function() {
  let player = this; // eslint-disable-line

  if (!qualityLevelList) {
    qualityLevelList = new QualityLevelList();

    player.on('dispose', () => {
      qualityLevelList.dispose();
    });
  }

  if (player.tech_.hls) {
    setupHlsHandlers(qualityLevelList, player.tech_.hls);
  } else if (videojs.Html5DashJS) {
    setupdDashHandlers();
  }

  return qualityLevelList;
};

// Register the plugin with video.js.
videojs.plugin('qualityLevels', qualityLevels);

// Include the version number.
qualityLevels.VERSION = '__VERSION__';

export default qualityLevels;
