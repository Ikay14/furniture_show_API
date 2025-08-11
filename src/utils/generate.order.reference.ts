import * as ShortUUID from 'short-uuid';

export function generateOrderRef() {
  return `ORD-${ShortUUID()}-${Date.now()}`;
}  