import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.",
  "metadata.google.internal",
  "metadata.goog",
  "internal"
]);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const value = Number(part);
    if (value < 0 || value > 255) return null;
    n = (n << 8) + value;
  }
  return n >>> 0;
}

function inCidr(ip: string, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const ipN = ipv4ToInt(ip);
  const baseN = ipv4ToInt(base ?? "");
  if (ipN === null || baseN === null || Number.isNaN(bits)) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipN & mask) === (baseN & mask);
}

export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    return (
      inCidr(ip, "0.0.0.0/8") ||
      inCidr(ip, "10.0.0.0/8") ||
      inCidr(ip, "127.0.0.0/8") ||
      inCidr(ip, "169.254.0.0/16") ||
      inCidr(ip, "172.16.0.0/12") ||
      inCidr(ip, "192.168.0.0/16") ||
      inCidr(ip, "100.64.0.0/10") ||
      inCidr(ip, "192.0.2.0/24") ||
      inCidr(ip, "198.51.100.0/24") ||
      inCidr(ip, "203.0.113.0/24") ||
      inCidr(ip, "224.0.0.0/4") ||
      inCidr(ip, "240.0.0.0/4")
    );
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7
    if (lower.startsWith("fe80")) return true;
    if (lower.startsWith("ff")) return true;
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
    if (mapped?.[1]) return isPrivateIp(mapped[1]);
    return false;
  }
  return true;
}

function hostLooksLocal(hostname: string): boolean {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  return false;
}

export async function assertPublicHttpUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new SsrfError(`Invalid URL: ${input}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfError(`Only http/https URLs are allowed (got ${url.protocol})`);
  }
  if (url.username || url.password) {
    throw new SsrfError("URLs with credentials are not allowed");
  }
  const hostname = url.hostname.replace(/^\[/, "").replace(/\]$/, "");
  if (hostLooksLocal(hostname) || hostLooksLocal(url.hostname)) {
    throw new SsrfError(`Blocked host: ${url.hostname}`);
  }
  if (isIP(hostname) && isPrivateIp(hostname)) {
    throw new SsrfError(`Blocked private IP: ${hostname}`);
  }
  let records: { address: string }[];
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new SsrfError(`Could not resolve host: ${hostname}`);
  }
  if (records.length === 0) {
    throw new SsrfError(`Could not resolve host: ${hostname}`);
  }
  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new SsrfError(`Host ${hostname} resolved to private address ${record.address}`);
    }
  }
  return url;
}

const MAX_REDIRECTS = 3;
const MAX_BYTES = 1_000_000;

export type SafeFetchResult = {
  url: string;
  finalUrl: string;
  status: number;
  contentType: string;
  body: string;
  title?: string;
};

export async function safeFetchUrl(
  input: string,
  fetcher: typeof fetch = fetch
): Promise<SafeFetchResult> {
  let current = input;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicHttpUrl(current);
    const response = await fetcher(url, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": "content-engine-mcp/0.1 (+https://github.com/content-engine/content-engine-mcp)" }
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new SsrfError("Redirect without Location header");
      current = new URL(location, url).toString();
      continue;
    }
    const contentType = response.headers.get("content-type") ?? "";
    const buf = new Uint8Array(await response.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      throw new SsrfError(`Response exceeded ${MAX_BYTES} bytes`);
    }
    const body = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.replace(/\s+/g, " ").trim();
    return {
      url: input,
      finalUrl: url.toString(),
      status: response.status,
      contentType,
      body,
      title
    };
  }
  throw new SsrfError("Too many redirects");
}
