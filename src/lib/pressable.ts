/**
 * react-native-web passes `hovered` / `focused` to Pressable's style callback at
 * runtime, but React Native's core types only declare `pressed`. This type lets
 * us read those web-only flags without a cast at every call site.
 */
export type PressableState = {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
};
