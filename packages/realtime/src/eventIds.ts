// Redis stream IDs are "<milliseconds>-<sequence>" and sort numerically.
export function compareEventIds(a: string, b: string): number {
  const [aMs = 0, aSeq = 0] = a.split("-").map(Number);
  const [bMs = 0, bSeq = 0] = b.split("-").map(Number);
  return aMs === bMs ? aSeq - bSeq : aMs - bMs;
}
