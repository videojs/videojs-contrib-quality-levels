import videojs from 'video.js';
import document from 'global/document';

/**
 * A list of QualityLevels.
 *
 * interface QualityLevelList : EventTarget {
 *   getter QualityLevel (unsigned long index);
 *   readonly attribute unsigned long length;
 *   readonly attribute long selectedIndex;
 *
 *   void addQualityLevel(QualityLevel qualityLevel)
 *   void removeQualityLevel(QualityLevel remove)
 *   QualityLevel? getQualityLevelById(DOMString id);
 *
 *   attribute EventHandler onchange;
 *   attribute EventHandler onaddqualitylevel;
 *   attribute EventHandler onremovequalitylevel;
 * };
 *
 * @extends videojs.EventTarget
 * @class QualityLevelList
 */
class QualityLevelList extends videojs.EventTarget {
  constructor() {
    super();

    this.selectedIndex_ = -1;

    let list = this; // eslint-disable-line

    if (videojs.browser.IS_IE8) {
      list = document.createElement('custom');
      for (const prop in QualityLevelList.prototype) {
        if (prop !== 'constructor') {
          list[prop] = QualityLevelList.prototype[prop];
        }
      }
    }

    list.levels_ = [];
  }

  get selectedIndex() {
    return this.selectedIndex_;
  }

  get length() {
    return this.levels_.length;
  }

  addQualityLevel(qualityLevel) {
    const index = this.levels_.length;

    // Do not add duplicate quality levels
    if (this.getQualityLevelById(qualityLevel.id)) {
      return;
    }

    if (!('' + index in this)) {
      Object.defineProperty(this, index, {
        get() {
          return this.levels_[index];
        }
      });
    }

    this.levels_.push(qualityLevel);

    this.trigger({
      qualityLevel,
      type: 'addqualitylevel'
    });
  }

  removeQualityLevel(remove) {
    let qualityLevel;

    for (let i = 0, l = this.length; i < l; i++) {
      if (this[i] === remove) {
        qualityLevel = this[i];
        this.levels_.splice(i, 1);

        if (this.selectedIndex_ === i) {
          this.selectedIndex_ = -1;
        } else if (this.selectedIndex_ > i) {
          this.selectedIndex_--;
        }
      }
    }

    if (!qualityLevel) {
      return;
    }

    this.trigger({
      qualityLevel,
      type: 'removequalitylevel'
    });
  }

  getQualityLevelById(id) {
    for (let i = 0, l = this.length; i < l; i++) {
      let level = this[i];

      if (level.id === id) {
        return level;
      }
    }
    return null;
  }

  dispose() {
    this.selectedIndex_ = -1;
    this.levels_.length = 0;
  }
}

/**
 * change - The selected QualityLevel has changed.
 * addqualitylevel - A QualityLevel has been added to the QualityLevelList.
 * removequalitylevel - A QualityLevel has been removed from the QualityLevelList.
 */
QualityLevelList.prototype.allowedEvents_ = {
  change: 'change',
  addqualitylevel: 'addqualitylevel',
  removequalitylevel: 'removequalitylevel'
};

// emulate attribute EventHandler support to allow for feature detection
for (const event in QualityLevelList.prototype.allowedEvents_) {
  QualityLevelList.prototype['on' + event] = null;
}

export default QualityLevelList;
