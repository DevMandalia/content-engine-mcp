import { lookup } from "node:dns/promises";
import { EngineError } from "./types.js";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 5;

export class SsrfError extends EngineError {
  constructor(message: string) {
    super(message, "SSRF");
    this.name = "SsrfError";
  }
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return ((nums[0]! << 24) | (nums[1]! << 16) | (nums[2]! << 8) | nums[3]!) >>> 0;
}

function ipv4IsPrivate(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n == null) return false;
  const inRange = (base: string, bits: number) => {
    const b = ipv4ToInt(base)!;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (b & mask);
  };
  return (
    inRange("0.0.0.0", 8) ||
    inRange("10.0.0.0", 8) ||
    inRange("127.0.0.0", 8) ||
    inRange("169.254.0.0", 16) ||
    inRange("172.16.0.0", 12) ||
    inRange("192.168.0.0", 16) ||
    inRange("100.64.0.0", 10) ||
    inRange("192.0.0.0", 24) ||
    inRange("192.0.2.0", 24) ||
    inRange("198.51.100.0", 24) ||
    inRange("203.0.113.0", 24) ||
    inRange("198.18.0.0", 15) ||
    inRange("224.0.0.0", 4) ||
    inRange("240.0.0.0", 4)
  );
}

function expandIpv6(ip: string): number[] | null {
  const raw = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (raw.includes(".")) {
    const lastColon = raw.lastIndexOf(":");
    const v4 = raw.slice(lastColon + 1);
    const n = ipv4ToInt(v4);
    if (n == null) return null;
    const head = raw.slice(0, lastColon);
    const hi = (n >>> 16) & 0xffff;
    const lo = n & 0xffff;
    return expandIpv6(`${head}:${hi.toString(16)}:${lo.toString(16)}`);
  }
  if ((raw.match(/::/g) ?? []).length > 1) return null;
  const [left, right] = raw.split("::");
  const leftParts = left ? left.split(":") : [];
  const rightParts = right ? right.split(":") : [];
  if (raw.includes("::")) {
    const missing = 8 - leftParts.length - rightParts.length;
    if (missing < 0) return null;
    const filled = [...leftParts, ...Array(missing).fill("0"), ...rightParts];
    if (filled.length !== 8) return null;
    return filled.map((p) => parseInt(p || "0", 16));
  }
  const parts = raw.split(":");
  if (parts.length !== 8) return null;
  return parts.map((p) => parseInt(p || "0", 16));
}

function ipv6IsPrivate(ip: string): boolean {
  const parts = expandIpv6(ip);
  if (!parts || parts.some((n) => Number.isNaN(n))) return false;
  if (parts.every((n) => n === 0)) return true;
  if (parts.slice(0, 7).every((n) => n === 0) && parts[7] === 1) return true;
  if (parts[0] === 0xfe80) return true;
  if ((parts[0]! & 0xffc0) === 0xfe80) return true;
  if ((parts[0]! & 0xfe00) === 0xfc00) return true;
  if (parts[0] === 0xff00 || (parts[0]! & 0xff00) === 0xff00) return true;
  if (
    parts[0] === 0 &&
    parts[1] === 0 &&
    parts[2] === 0 &&
    parts[3] === 0 &&
    parts[4] === 0 &&
    parts[5] === 0xffff
  ) {
    const a = (parts[6]! >> 8) & 0xff;
    const b = parts[6]! & 0xff;
    const c = (parts[7]! >> 8) & 0xff;
    const d = parts[7]! & 0xff;
    return ipv4IsPrivate(`${a}.${b}.${c}.${d}`);
  }
  return false;
}

function hostLooksPrivate(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h === "metadata.google.internal") return true;
  if (h === "169.254.169.254" || h === "metadata" || h === "metadata.google.internal") return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return ipv4IsPrivate(h);
  if (h.includes(":")) return ipv6IsPrivate(h);
  return false;
}

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SsrfError(`Invalid URL: ${raw}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfError(`Only http(s) URLs are allowed (got ${url.protocol}).`);
  }
  if (url.username || url.password) {
    throw new SsrfError("URLs with credentials are not allowed.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (hostLooksPrivate(host)) {
    throw new SsrfError(`Blocked private/loopback host: ${host}`);
  }
  try {
    const records = await lookup(host, { all: true, verbatim: true });
    for (const rec of records) {
      if (rec.family === 4 && ipv4IsPrivate(rec.address)) {
        throw new SsrfError(`DNS resolved ${host} to private IPv4 ${rec.address}`);
      }
      if (rec.family === 6 && ipv6IsPrivate(rec.address)) {
        throw new SsrfError(`DNS resolved ${host} to private IPv6 ${rec.address}`);
      }
    }
  } catch (err) {
    if (err instanceof SsrfError) throw err;
    throw new SsrfError(`Could not resolve host ${host}`);
  }
  return url;
}

export type FetchedPage = { url: string; finalUrl: string; title: string; text: string; body: string };
export type SafeFetchResult = FetchedPage;

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8_000);
}

function titleOf(html: string, fallback: string): string {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? stripTags(m[1] ?? fallback).slice(0, 200) : fallback;
}

export async function safeFetchUrl(raw: string, fetchImpl: typeof fetch = fetch): Promise<FetchedPage> {
  let current = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicHttpUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetchImpl(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "content-engine-mcp/0.1 (+https://github.com/content-engine/content-engine-mcp)" }
      });
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const loc = res.headers.get("location");
        if (!loc) throw new SsrfError(`Redirect with no Location from ${url.href}`);
        current = new URL(loc, url).href;
        await assertPublicHttpUrl(current);
        continue;
      }
      if (!res.ok) throw new SsrfError(`Fetch failed ${res.status} for ${url.href}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > MAX_BYTES) throw new SsrfError("Fetched body exceeds 512KB cap.");
      const html = buf.toString("utf8");
      const text = stripTags(html);
      return {
        url: raw,
        finalUrl: url.href,
        title: titleOf(html, url.hostname),
        text,
        body: text
      };
    } catch (err) {
      if (err instanceof SsrfError) throw err;
      if ((err as Error).name === "AbortError") throw new SsrfError(`Timed out fetching ${url.href}`);
      throw new SsrfError(`Fetch error for ${url.href}: ${(err as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new SsrfError("Too many redirects.");
}
