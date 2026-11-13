import { describe, expect, it } from "vitest";
import { assertPublicHttpUrl, SsrfError } from "../src/ssrf.js";

describe("SSRF guard", () => {
  it("blocks loopback and private literals without fetching", async () => {
    const blocked = [
      "http://127.0.0.1/",
      "http://localhost/secrets",
      "http://192.168.1.10/admin",
      "http://10.0.0.2/",
      "http://169.254.169.254/latest/meta-data/",
      "http://[::1]/",
      "ftp://example.com/"
    ];
    for (const url of blocked) {
      await expect(assertPublicHttpUrl(url)).rejects.toBeInstanceOf(SsrfError);
    }
  });

  it("allows a public https URL shape (DNS must resolve to a public address)", async () => {
    const url = await assertPublicHttpUrl("https://example.com/hummus");
    expect(url.hostname).toBe("example.com");
  });
});
