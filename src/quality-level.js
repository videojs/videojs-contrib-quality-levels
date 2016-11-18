/**
 * A single QualityLevel.
 *
 * interface QualityLevel {
 *   readonly attribute DOMString id;
 *            attribute DOMString label;
 *   readonly attribute long width;
 *   readonly attribute long height;
 *   readonly attribute long bitrate;
 *            attribute boolean enabled;
 * };
 *
 * @class QualityLevel
 */
export default class QualityLevel {

  /**
   * Creates a QualityLevel
   *
   * @param {Representation|Object} representation The representation of the quality level
   * @param {string}   representation.id        Unique id of the QualityLevel
   * @param {number=}  representation.width     Resolution width of the QualityLevel
   * @param {number=}  representation.height    Resolution height of the QualityLevel
   * @param {number}   representation.bandwidth Bitrate of the QaulityLevel
   * @param {Function} representation.enabled   Callback to enable/disable QualityLevel
   */
  constructor(representation) {
    this.id = representation.id;
    this.label = this.id;
    this.width = representation.width;
    this.height = representation.height;
    this.bitrate = representation.bandwidth;

    this.enabled_ = representation.enabled;
  }

  /**
   * Get whether the QualityLevel is enabled.
   *
   * @returns {boolean} True if the QualityLevel is enabled.
   */
  get enabled() {
    return this.enabled_();
  }

  /**
   * Enable or disable the QualityLevel.
   *
   * @param {boolean} enable true to enable QualityLevel, false to disable.
   */
  set enabled(enable) {
    this.enabled_(enable);
  }
}
