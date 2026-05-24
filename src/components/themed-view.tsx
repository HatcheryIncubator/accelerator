import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/styles/tokens';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
  className?: string;
};

const bgClasses: Record<ThemeColor, string> = {
  text: 'bg-text',
  background: 'bg-background',
  backgroundElement: 'bg-backgroundElement',
  backgroundSelected: 'bg-backgroundSelected',
  textSecondary: 'bg-textSecondary',
};

export function ThemedView({ className, type = 'background', ...otherProps }: ThemedViewProps) {
  return <View className={`${bgClasses[type]} ${className ?? ''}`} {...otherProps} />;
}
