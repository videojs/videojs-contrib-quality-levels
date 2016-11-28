import videojs from 'video.js';
import QualityLevel from './quality-level.js';
import QualityLevelList from './quality-level-list.js';

const noop = () => {};

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
 * Sets up the event handlers for populating and updating the selectedIndex of the
 * QualityLevelList for an HLS source.
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to attach events to.
 * @param {Object} hls Hls object to listen to for media events.
 * @returns {Function} Event handler cleanup function.
 * @function setupHlsHandlers
 */
const setupHlsHandlers = function(qualityLevels, hls) {
  const onHlsLoadedMetadata = () => {
    handleHlsLoadedMetadata(qualityLevels, hls);
  };

  const onHlsMediaChange = () => {
    handleHlsMediaChange(qualityLevels, hls.playlists);
  };

  hls.playlists.on('loadedmetadata', onHlsLoadedMetadata);
  hls.playlists.on('mediachange', onHlsMediaChange);

  return function() {
    hls.playlists.off('loadedmetadata', onHlsLoadedMetadata);
    hls.playlists.off('mediachange', onHlsMediaChange);
  };
};

/**
 * Sets up the event handlers for populating and updating the selectedIndex of the
 * QualityLevelList for Dash source.
 *
 * @return {Function} cleanup function to restore beforeInitialize on Html5DashJS
 * @function setupDashHandlers
 */
const setupDashHandlers = function() {
  let oldBeforeInitialize = videojs.Html5DashJS.beforeInitialize;

  videojs.Html5DashJS.beforeInitialize = function(player, newMediaPlayer) {
    oldBeforeInitialize(player, newMediaPlayer);

    if (!(player.dash && player.dash.representations)) {
      return;
    }

    let qualityLevels = player.qualityLevels();

    const onPlaybackMetaDataLoaded = () => {
      let representations = player.dash.representations();

      representations.forEach((rep) => {
        qualityLevels.addQualityLevel(new QualityLevel(rep));
      });
    };

    const onQualityChangeRequested = (event) => {
      let selectedIndex = event.newQuality;

      qualityLevels.selectedIndex_ = selectedIndex;
      qualityLevels.trigger({
        selectedIndex,
        type: 'change'
      });
    };

    const cleanup = () => {
      newMediaPlayer.off('playbackMetaDataLoaded', onPlaybackMetaDataLoaded);
      newMediaPlayer.off('qualityChangeRequested', onQualityChangeRequested);
      player.off('dispose', cleanup);
    };

    newMediaPlayer.on('playbackMetaDataLoaded', onPlaybackMetaDataLoaded);
    newMediaPlayer.on('qualityChangeRequested', onQualityChangeRequested);
    player.on('dispose', cleanup);
  };

  return function() {
    videojs.Html5DashJS.beforeInitialize = oldBeforeInitialize;
  };
};

/**
 * Initialization function for the qualityLevels plugin. Sets up the QualityLevelList and
 * event handlers.
 *
 * @param {Player} player Player object.
 * @param {Object} options Plugin options object.
 * @function initPlugin
 */
const initPlugin = function(player, options) {
  let originalPluginFn = player.qualityLevels;
  let tech = player.tech({ IWillNotUseThisInPlugins: true });
  let hls = tech.hls;
  let cleanupHls = noop;
  let cleanupDash = noop;

  const qualityLevelList = new QualityLevelList();

  if (hls) {
    cleanupHls = setupHlsHandlers(qualityLevelList, hls);
  }

  // Since Dash handlers are setup in videojs.Html5DashJS.beforeInitialize
  // we only need to override beforeInitialize on the global videojs.Html5DashJS once
  // instead of on every new source load.
  if (videojs.Html5DashJS) {
    cleanupDash = setupDashHandlers();
  }

  const loadstartHandler = function() {
    qualityLevelList.dispose();
    cleanupHls();

    tech = player.tech({ IWillNotUseThisInPlugins: true });
    hls = tech.hls;

    if (hls) {
      cleanupHls = setupHlsHandlers(qualityLevelList, hls);
    }
  };

  const disposeHandler = function() {
    qualityLevelList.dispose();
    cleanupHls();
    cleanupDash();
    player.qualityLevels = originalPluginFn;
    player.off('loadstart', loadstartHandler);
    player.off('dispose', disposeHandler);
  };

  player.on('loadstart', loadstartHandler);
  player.on('dispose', disposeHandler);

  originalPluginFn = player.qualityLevels;
  player.qualityLevels = () => qualityLevelList;
  player.qualityLevels.VERSION = '__VERSION__';

  return qualityLevelList;
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @param {Object} options Plugin options object
 * @function qualityLevels
 */
const qualityLevels = function(options) {
  return initPlugin(this, videojs.mergeOptions({}, options));
};

// Register the plugin with video.js.
videojs.plugin('qualityLevels', qualityLevels);

// Include the version number.
qualityLevels.VERSION = '__VERSION__';

export default qualityLevels;
