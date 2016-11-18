import videojs from 'video.js';

export const representations = [
  {
    id: '0',
    width: 100,
    height: 100,
    bandwidth: 100,
    enabled() {
      return true;
    }
  },
  {
    id: '1',
    width: 200,
    height: 200,
    bandwidth: 200,
    enabled() {
      return true;
    }
  },
  {
    id: '2',
    width: 300,
    height: 300,
    bandwidth: 300,
    enabled() {
      return true;
    }
  },
  {
    id: '3',
    width: 400,
    height: 400,
    bandwidth: 400,
    enabled() {
      return true;
    }
  }
];

export class MockPlaylistLoader extends videojs.EventTarget {
  constructor() {
    super();
    this.master = {
      playlists: [
        {
          resolvedUri: '0.m3u8'
        },
        {
          resolvedUri: '1.m3u8'
        },
        {
          resolvedUri: '2.m3u8'
        },
        {
          resolvedUri: '3.m3u8'
        }
      ]
    };

    this.mediaIndex_ = -1;
  }

  media() {
    return this.master.playlists[this.mediaIndex_];
  }
}

export class MockMediaPlayer extends videojs.EventTarget {
  constructor() {
    super();
  }
}
