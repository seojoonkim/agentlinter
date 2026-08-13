import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as path from "node:path";
import { detectContext, scanWorkspace } from "../parser";

const fixture = path.resolve(__dirname, "fixtures/hermes-v0.20.1");

describe("Hermes Agent v0.20.1 workspace compatibility", () => {
  it("detects Hermes separately from AGENTS.md-only OpenClaw", () => {
    assert.equal(detectContext(["AGENTS.md"]), "openclaw-runtime");
    assert.equal(detectContext(["AGENTS.md", "config.yaml"]), "hermes-runtime");
    assert.equal(detectContext(["AGENTS.md", "plugins/security/plugin.yaml"]), "hermes-runtime");
  });

  it("scans AGENTS.md, profile config, SKILL.md, plugin.yaml, and MCP config", () => {
    const files = scanWorkspace(fixture);
    assert.ok(files.every((file) => file.context === "hermes-runtime"));
    const names = new Set(files.map((file) => file.name));
    for (const name of [
      "AGENTS.md",
      "config.yaml",
      "profiles/research/config.yaml",
      "skills/review/SKILL.md",
      "plugins/security/plugin.yaml",
    ]) assert.ok(names.has(name), `missing ${name}`);
    assert.match(files.find((file) => file.name === "config.yaml")?.content ?? "", /^mcp_servers:/m);
  });

  it("recognizes profile layouts independent of AGENTS.md", () => {
    assert.equal(detectContext(["profiles/research/config.yaml"]), "hermes-runtime");
  });
});