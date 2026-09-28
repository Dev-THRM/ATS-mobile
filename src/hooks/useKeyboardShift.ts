import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Keyboard,
  Platform,
  KeyboardEvent,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (_) {}
}

const DEFAULT_ANDROID_KB_HEIGHT = 290;
const DEFAULT_IOS_KB_HEIGHT = 260;

export function useKeyboardShift() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(Dimensions.get('window').height);
  const lastKnownHeight = useRef(
    Platform.OS === 'android' ? DEFAULT_ANDROID_KB_HEIGHT : DEFAULT_IOS_KB_HEIGHT
  );

  const animate = useCallback(() => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const dimSub = Dimensions.addEventListener('change', ({ window }) => {
      setWindowHeight(window.height);
    });

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      const height =
        e?.endCoordinates?.height && e.endCoordinates.height > 100
          ? e.endCoordinates.height
          : lastKnownHeight.current;
      lastKnownHeight.current = height;
      animate();
      setKeyboardHeight(height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      animate();
      setKeyboardHeight(0);
    });

    return () => {
      dimSub.remove();
      showSub.remove();
      hideSub.remove();
    };
  }, [animate]);

  // Immediate jump on user tap before keyboardDidShow finishes animation
  const onInputFocus = useCallback(() => {
    setKeyboardHeight((current) => {
      if (current === 0) {
        animate();
        return lastKnownHeight.current;
      }
      return current;
    });
  }, [animate]);

  const resetKeyboard = useCallback(() => {
    animate();
    setKeyboardHeight(0);
  }, [animate]);

  const isKeyboardOpen = keyboardHeight > 0;
  // Available height above the keyboard with a safe 50px top margin
  const maxModalHeight = isKeyboardOpen
    ? Math.max(260, windowHeight - keyboardHeight - 50)
    : Math.round(windowHeight * 0.88);

  return {
    keyboardHeight,
    isKeyboardOpen,
    maxModalHeight,
    onInputFocus,
    resetKeyboard,
  };
}
