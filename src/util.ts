import moment, { Moment } from "moment";
export function getDuration(startTime: Moment): string {
  return moment.duration(moment().diff(startTime)).asSeconds() + "s";
}

export function hasQueryString(url: string): boolean {
  return /[?]/.test(url);
}

export const timestamp = ()=> moment().toISOString();