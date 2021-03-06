/* eslint-disable import/prefer-default-export */

// Credit David Walsh (https://davidwalsh.name/javascript-debounce-function)
// Slightly editted for linter to accept.
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) return func.apply(context, args);
      return null;
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) return func.apply(context, args);

    return timeout;
  };
}
