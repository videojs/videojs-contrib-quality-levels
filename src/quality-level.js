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
  constructor(representation) {
    this.id = representation.id;
    this.label = this.id;
    this.width = representation.width;
    this.height = representation.height;
    this.bitrate = representation.bandwidth;

    this.enabled_ = representation.enabled;
  }

  get enabled() {
    return this.enabled_();
  }

  set enabled(enable) {
    this.enabled_(enable);
  }
}
