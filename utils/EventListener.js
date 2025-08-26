// eslint-disable-next-line import/extensions
const EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
  listen(target, eventType, callback) {
    if (target && target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove() {
          target.removeEventListener(eventType, callback, false);
        },
      };
    } if (target && target.attachEvent) {
      target.attachEvent(`on${eventType}`, callback);
      return {
        remove() {
          target.detachEvent(`on${eventType}`, callback);
        },
      };
    }
    return false;
  },
};

export default EventListener;
