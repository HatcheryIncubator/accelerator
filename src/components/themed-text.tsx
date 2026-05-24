import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/styles/tokens';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
  className?: string;
};

const typeClasses: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-[16px] leading-[24px] font-medium',
  title: 'text-[48px] leading-[52px] font-semibold',
  small: 'text-[14px] leading-[20px] font-medium',
  smallBold: 'text-[14px] leading-[20px] font-bold',
  subtitle: 'text-[32px] leading-[44px] font-semibold',
  link: 'text-[14px] leading-[30px]',
  linkPrimary: 'text-[14px] leading-[30px] text-accent',
  code: 'font-mono text-[12px] font-medium android:font-bold',
};

const colorClasses: Record<ThemeColor, string> = {
  text: 'text-text',
  background: 'text-background',
  backgroundElement: 'text-backgroundElement',
  backgroundSelected: 'text-backgroundSelected',
  textSecondary: 'text-textSecondary',
};

export function ThemedText({ className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  return (
    <Text
      className={`${colorClasses[themeColor ?? 'text']} ${typeClasses[type]} ${className ?? ''}`}
      {...rest}
    />
  );
}
