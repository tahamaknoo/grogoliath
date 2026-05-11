// SSRF guard for server routes that fetch user-supplied URLs.
//
// Rejects:
//   - non-http(s) schemes (file:, gopher:, ftp:, data:, etc.)
//   - localhost / loopback (127.0.0.0/8, ::1)
//   - cloud metadata IPs (169.254.169.254 et al.)
//   - RFC1918 private ranges (10.x, 172.16-31.x, 192.168.x)
//   - link-local / multicast / unspecified
//   - hostnames that resolve only by hosts file (e.g. "internal-svc")
//
// Returns { ok: true, url } or { ok: false, reason }.

import dns from "node:dns/promises";
import net from "node:net";

const BAD_HOST_RE = /^(localhost|.+\.localhost|.+\.internal|.+\.local)$/i;

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) return true;
  const [a, b] = parts;
  if (a === 10) return true;                              // 10.0.0.0/8
  if (a === 127) return true;                             // 127.0.0.0/8
  if (a === 169 && b === 254) return true;                // 169.254.0.0/16 (link-local + AWS metadata)
  if (a === 172 && b >= 16 && b <= 31) return true;       // 172.16.0.0/12
  if (a === 192 && b === 168) return true;                // 192.168.0.0/16
  if (a === 0) return true;                               // 0.0.0.0/8
  if (a >= 224) return true;                              // multicast / reserved
  return false;
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fe80::")) return true;   // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;          // unique local
  if (lower.startsWith("ff")) return true;                                    // multicast
  return false;
}

export async function safeFetchUrl(raw) {
  if (!raw || typeof raw !== "string") {
    return { ok: false, reason: "URL is required." };
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "Not a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Only http(s) URLs are allowed." };
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname) return { ok: false, reason: "Missing hostname." };
  if (BAD_HOST_RE.test(hostname)) {
    return { ok: false, reason: "Internal hostnames are not allowed." };
  }

  // If it's a literal IP, check it directly.
  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4 && isPrivateIPv4(hostname)) {
    return { ok: false, reason: "Private/internal IPs are not allowed." };
  }
  if (ipVersion === 6 && isPrivateIPv6(hostname)) {
    return { ok: false, reason: "Private/internal IPs are not allowed." };
  }

  // Otherwise resolve and reject if ANY resolved address is private.
  if (ipVersion === 0) {
    try {
      const addrs = await dns.lookup(hostname, { all: true });
      for (const a of addrs) {
        if (a.family === 4 && isPrivateIPv4(a.address)) {
          return { ok: false, reason: "Hostname resolves to a private IP." };
        }
        if (a.family === 6 && isPrivateIPv6(a.address)) {
          return { ok: false, reason: "Hostname resolves to a private IP." };
        }
      }
    } catch {
      return { ok: false, reason: "Hostname could not be resolved." };
    }
  }

  return { ok: true, url };
}
