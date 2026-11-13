import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { VERSION } from "../src/version.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("MCPB manifest", () => {
  const manifest = JSON.parse(readFileSync(join(root, "mcpb/manifest.json"), "utf8")) as {
    version: string;
    repository: { type: string; url: string };
    user_config: {
      project_folder: { type: string; default: string };
    };
    server: { mcp_config: { env: Record<string, string> } };
  };

  it("matches the package version and has a git repository", () => {
    expect(manifest.version).toBe(VERSION);
    expect(manifest.repository).toEqual({
      type: "git",
      url: "https://github.com/DevMandalia/content-engine-mcp.git"
    });
  });

  it("maps a project-folder directory setting to CONTENT_ENGINE_ROOT", () => {
    expect(manifest.user_config.project_folder.type).toBe("directory");
    expect(manifest.user_config.project_folder.default).toBe("${HOME}/content-engine");
    expect(manifest.server.mcp_config.env.CONTENT_ENGINE_ROOT).toBe("${user_config.project_folder}");
  });
});
