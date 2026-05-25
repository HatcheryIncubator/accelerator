import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** Responsive breakpoint derived from window width (updates on resize/rotate). */
export function useBreakpoint(): { breakpoint: Breakpoint; width: number } {
  const { width } = useWindowDimensions();
  const breakpoint: Breakpoint = width >= 1024 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile';
  return { breakpoint, width };
}
