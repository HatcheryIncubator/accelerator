// These are not React Native core components, so NativeWind does not wire up
// `className` -> `style` for them automatically. Registering the interop once
// here lets us style them with Tailwind classes everywhere they're used.
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(Image, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });
