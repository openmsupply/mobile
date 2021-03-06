import { useRef, useEffect } from 'react';
import { MILLISECONDS } from '../utilities';

/**
 * Hook used to return a ref which should be applied to an animatable view created by
 * animatable that will trigger an animation to start/stop based on the condition passed.
 *
 * @param {boolean} condition a condition that when true will cause the animation to begin.
 * @param {string} animation the animation type see: react-native-animatable.
 * @param {number} duration the number of milliseconds per animation.
 */
export const useConditionalAnimationRef = (
  condition,
  animation = 'flash',
  duration = MILLISECONDS.ONE_SECOND
) => {
  const ref = useRef();

  const start = () => {
    ref?.current[animation](duration);
  };

  const stop = () => {
    ref?.current?.stopAnimation();
  };

  useEffect(() => {
    if (condition) start();
    else stop();
    return stop;
  }, [condition]);

  return ref;
};
