// Small helpers shared by providers.

/** Read the first defined value among several dotted paths, e.g. pick(o, "a.b", "A.B"). */
export function pick(obj, ...paths) {
  for (const p of paths) {
    let cur = obj;
    for (const key of p.split(".")) {
      if (cur == null) break;
      cur = /^\d+$/.test(key) ? cur[Number(key)] : cur[key];
    }
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
}

export function toNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function fetchJson(url, options = {}, timeoutMs = 12000) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} from ${new URL(url).host}: ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Simple in-memory cache with expiry. */
export class TtlCache {
  constructor(ttlMs, max = 500) { this.ttl = ttlMs; this.max = max; this.map = new Map(); }
  get(k) {
    const hit = this.map.get(k);
    if (!hit) return undefined;
    if (Date.now() > hit.exp) { this.map.delete(k); return undefined; }
    return hit.v;
  }
  set(k, v) {
    if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);
    this.map.set(k, { v, exp: Date.now() + this.ttl });
  }
}
