// Display-only short names for ventures with long titles (the DB keeps the full
// name). Centralized here so the shortening logic lives in exactly one place and
// both the data layer (which builds `displayName`) and any UI agree.
const VENTURE_SHORT_NAMES: Record<string, string> = {
  'Bilharzia Storytelling Initiative': 'Bilharzia',
  'Fandema International': 'Fandema',
  'IDEAS Global Tech': 'IDEAS',
};

export function ventureDisplayName(name: string): string {
  return VENTURE_SHORT_NAMES[name] ?? name;
}
