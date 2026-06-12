export function haptic(pattern?: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern ?? 10);
  }
}
