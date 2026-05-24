import { dateTimeToIso, isoToDateInput, isoToTimeInput } from '@/lib/format';

/** Raw form state for a session's date/time, shared by Add Session and the editor. */
export type ScheduleState = {
  multiDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export const emptySchedule: ScheduleState = {
  multiDay: false,
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
};

/**
 * Build check-in / check-out ISO timestamps from the form state.
 * Single-day: both times use `startDate` (the session date).
 * Multi-day: start uses `startDate`, end uses `endDate`.
 * `checkOut` is null when no end time is entered (an open/in-progress session).
 */
export function buildSchedule(s: ScheduleState): { checkIn: string | null; checkOut: string | null } {
  const checkIn = dateTimeToIso(s.startDate, s.startTime);
  const endDate = s.multiDay ? s.endDate : s.startDate;
  const checkOut = s.endTime && endDate ? dateTimeToIso(endDate, s.endTime) : null;
  return { checkIn, checkOut };
}

/** Seed the form state from an existing session's timestamps. */
export function scheduleFromSession(checkIn: string, checkOut: string | null): ScheduleState {
  return {
    startDate: isoToDateInput(checkIn),
    startTime: isoToTimeInput(checkIn),
    endDate: checkOut ? isoToDateInput(checkOut) : '',
    endTime: checkOut ? isoToTimeInput(checkOut) : '',
    // Pre-check multi-day when the session already spans two calendar days.
    multiDay: Boolean(checkOut && isoToDateInput(checkIn) !== isoToDateInput(checkOut)),
  };
}
