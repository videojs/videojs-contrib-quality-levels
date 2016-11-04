import videojs from 'video.js';
import QualityLevel from './quality-level.js';
import QualityLevelList from './quality-level-list.js';

const noop = () => {};

let qualityLevelList = null;
let onHlsMediaChange = null;
let onHlsLoadedMetadata = null;

/**
 * Finds the index of the HLS playlist in a give list of playlists.
 *
 * @param {Object} media Playlist object to search for.
 * @param {Object[]} playlists List of playlist objects to search through.
 * @returns {number} The index of the playlist or -1 if not found.
 * @function getHlsPlaylistIndex
 */
const getHlsPlaylistIndex = function(media, playlists) {
  for (let i = 0; i < playlists.length; i++) {
    let playlist = playlists[i];

    if (playlist.resolvedUri === media.resolvedUri) {
      return i;
    }
  }
  return -1;
};

/**
 * Adds quality levels to list once playlist metadata is available
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to attach events to.
 * @param {Object} hls Hls object to listen to for media events.
 * @function handleHlsLoadedMetadata
 */
const handleHlsLoadedMetadata = function(qualityLevels, hls) {
  hls.representations().forEach((rep) => {
    qualityLevels.addQualityLevel(new QualityLevel(rep));
  });
  handleHlsMediaChange(qualityLevels, hls.playlists);
};

/**
 * Updates the selcetedIndex of the QualityLevelList when a mediachange happens in hls.
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to update.
 * @param {PlaylistLoader} playlistLoader PlaylistLoader containing the new media info.
 * @function handleHlsMediaChange
 */
const handleHlsMediaChange = function(qualityLevels, playlistLoader) {
  let newPlaylist = playlistLoader.media();
  let selectedIndex = getHlsPlaylistIndex(newPlaylist, playlistLoader.master.playlists);

  qualityLevels.selectedIndex_ = selectedIndex;
  qualityLevels.trigger({
    selectedIndex,
    type: 'change'
  });
};

/**
 * Sets up the event handlers for populating and updating the selectedIndex of the
 * QualityLevelList for an HLS source.
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to attach events to.
 * @param {Object} hls Hls object to listen to for media events.
 * @function setupHlsHandlers
 */
const setupHlsHandlers = function(qualityLevels, hls) {
  if (!onHlsLoadedMetadata) {
    onHlsLoadedMetadata = () => {
      handleHlsLoadedMetadata(qualityLevels, hls);
    };

    hls.playlists.on('loadedmetadata', onHlsLoadedMetadata);
  }

  if (!onHlsMediaChange) {
    onHlsMediaChange = () => {
      handleHlsMediaChange(qualityLevels, hls.playlists);
    };

    hls.playlists.on('mediachange', onHlsMediaChange);
  }
};

/**
 * Sets up the event handlers for populating and updating the selectedIndex of the
 * QualityLevelList for Dash source.
 *
 * @function setupDashHandlers
 */
const setupDashHandlers = function() {
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

      if (onHlsLoadedMetadata) {
        player.tech_.hls.playlists.off(onHlsLoadedMetadata);
        onHlsLoadedMetadata = null;
      }

      if (onHlsMediaChange) {
        player.tech_.hls.playlists.off(onHlsMediaChange);
        onHlsMediaChange = null;
      }
    });

    // Hls sourceHandler recreated on source change, so we want to re-setup hls
    // handlers on new source loads.
    player.on('loadstart', () => {
      qualityLevelList.dispose();
      if (player.tech_.hls) {
        setupHlsHandlers(qualityLevelList, player.tech_.hls);
      }
    });

    // Sometimes loadstart will fire before we get here, so we want to set up the handlers
    // initially as well.
    if (player.tech_.hls) {
      setupHlsHandlers(qualityLevelList, player.tech_.hls);
    }

    // Since Dash handlers are setup in videojs.Html5DashJS.beforeInitialize
    // we only need to override beforeInitialize on the global videojs.Html5DashJS once
    // instead of on every new source load.
    if (videojs.Html5DashJS) {
      setupDashHandlers();
    }
  }

  return qualityLevelList;
};

// Register the plugin with video.js.
videojs.plugin('qualityLevels', qualityLevels);

// Include the version number.
qualityLevels.VERSION = '__VERSION__';

export default qualityLevels;
