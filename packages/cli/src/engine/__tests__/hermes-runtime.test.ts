import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { detectContext, scanWorkspace } from "../parser";
import { lint } from "../scorer";

const fixture = path.resolve(__dirname, "fixtures/hermes-v0.20.0");
const temporaryPaths: string[] = [];

function temporaryWorkspace(): string {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "agentlinter-hermes-"));
  temporaryPaths.push(workspace);
  return workspace;
}

function write(workspace: string, name: string, content: string) {
  const target = path.join(workspace, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

afterEach(() => {
  for (const target of temporaryPaths.splice(0)) fs.rmSync(target, { recursive: true, force: true });
});

describe("Hermes Agent v0.20.0 stable workspace compatibility", () => {
  it("distinguishes validated Hermes markers from AGENTS.md-only OpenClaw", () => {
    assert.equal(detectContext(["AGENTS.md"]), "openclaw-runtime");
    assert.equal(detectContext(["AGENTS.md", "config.yaml"]), "openclaw-runtime");
    assert.equal(detectContext(["AGENTS.md", "plugins/security/plugin.yaml"]), "hermes-runtime");
    assert.equal(detectContext(["profiles/research/config.yaml"]), "hermes-runtime");
  });

  it("scans only the supported root config, profile config, plugin manifest, and skill", () => {
    const files = scanWorkspace(fixture);
    assert.ok(files.every((file) => file.context === "hermes-runtime"));
    assert.deepEqual(new Set(files.map((file) => file.name)), new Set([
      "AGENTS.md", "config.yaml", "profiles/research/config.yaml",
      "skills/review/SKILL.md", "plugins/security/plugin.yaml",
    ]));
  });

  it("does not classify or collect a generic root config.yaml", () => {
    const workspace = temporaryWorkspace();
    write(workspace, "AGENTS.md", "# Generic runtime\n");
    write(workspace, "config.yaml", "database:\n  host: localhost\n");
    write(workspace, "auth.json", '{"token":"do-not-read"}');
    const files = scanWorkspace(workspace);
    assert.equal(files[0]?.context, "openclaw-runtime");
    assert.ok(!files.some((file) => file.name === "config.yaml"));
    assert.ok(!files.some((file) => file.name === "auth.json"));
  });

  it("does not treat one ambiguous key as validated Hermes structure", () => {
    const workspace = temporaryWorkspace();
    write(workspace, "config.yaml", "model: generic-model\n");
    assert.deepEqual(scanWorkspace(workspace), []);
  });

  it("does not treat combinations of generic application keys as Hermes structure", () => {
    for (const content of [
      "model: generic-model\nsecurity:\n  enabled: true\n",
      "providers:\n  database: postgres\ndisplay:\n  theme: dark\n",
      "agent:\n  retries: 3\ncontext:\n  environment: production\n",
      "terminal:\n  shell: bash\ncompression:\n  enabled: true\n",
    ]) {
      const workspace = temporaryWorkspace();
      write(workspace, "config.yaml", content);
      assert.deepEqual(scanWorkspace(workspace), []);
    }
  });

  it("collects a root config only with Hermes-specific structure", () => {
    const workspace = temporaryWorkspace();
    write(workspace, "config.yaml", "mcp_servers:\n  filesystem:\n    command: npx\n");
    const files = scanWorkspace(workspace);
    assert.equal(files[0]?.context, "hermes-runtime");
    assert.deepEqual(files.map((file) => file.name), ["config.yaml"]);
  });

  it("excludes auth, logs, memories, state, and arbitrary profile/plugin files", () => {
    const workspace = temporaryWorkspace();
    write(workspace, "profiles/default/config.yaml", "model:\n  provider: openrouter\n");
    write(workspace, "profiles/default/auth.json", '{"token":"do-not-read"}');
    write(workspace, "profiles/default/logs/run.json", '{"secret":"do-not-read"}');
    write(workspace, "profiles/default/memories/private.md", "do-not-read");
    write(workspace, "profiles/default/state.json", '{"state":"do-not-read"}');
    write(workspace, "profiles/default/notes.yaml", "private: do-not-read\n");
    write(workspace, "profiles/default/nested/config.yaml", "model: not-allowed\n");
    write(workspace, "plugins/example/plugin.yaml", "name: example\n");
    write(workspace, "plugins/example/auth.json", '{"token":"do-not-read"}');
    write(workspace, "plugins/example/README.md", "do-not-read");
    write(workspace, "plugins/example/plugin.yml", "name: wrong-extension\n");
    assert.deepEqual(new Set(scanWorkspace(workspace).map((file) => file.name)), new Set([
      "profiles/default/config.yaml", "plugins/example/plugin.yaml",
    ]));
  });

  it("only collects SKILL.md from skills", () => {
    const workspace = temporaryWorkspace();
    write(workspace, "skills/review/SKILL.md", "# Review\n");
    write(workspace, "skills/review/notes.md", "private\n");
    write(workspace, "skills/review/auth.json", '{"token":"private"}');
    assert.deepEqual(scanWorkspace(workspace).map((file) => file.name), ["skills/review/SKILL.md"]);
  });

  it("never follows file or directory symlinks, including workspace escapes", () => {
    const workspace = temporaryWorkspace();
    const outside = temporaryWorkspace();
    write(outside, "config.yaml", "model:\n  provider: escaped\n");
    write(outside, "plugin.yaml", "name: escaped\n");
    write(outside, "SKILL.md", "# Escaped\n");
    fs.mkdirSync(path.join(workspace, "profiles", "linked"), { recursive: true });
    fs.symlinkSync(path.join(outside, "config.yaml"), path.join(workspace, "profiles", "linked", "config.yaml"));
    fs.mkdirSync(path.join(workspace, "plugins"), { recursive: true });
    fs.symlinkSync(outside, path.join(workspace, "plugins", "escaped"), "dir");
    fs.mkdirSync(path.join(workspace, "skills"), { recursive: true });
    fs.symlinkSync(outside, path.join(workspace, "skills", "escaped"), "dir");
    write(workspace, "real-plugin/plugin.yaml", "name: internal-link\n");
    fs.symlinkSync(path.join(workspace, "real-plugin"), path.join(workspace, "plugins", "internal"), "dir");
    assert.deepEqual(scanWorkspace(workspace), []);
  });

  it("applies secret security checks to plugin manifests", () => {
    const workspace = temporaryWorkspace();
    write(workspace, "plugins/example/plugin.yaml", "name: example\napi_key: \"sk-123456789012345678901234\"\n");
    const files = scanWorkspace(workspace);
    const result = lint(workspace, files);
    assert.ok(result.diagnostics.some((diagnostic) =>
      diagnostic.file === "plugins/example/plugin.yaml" && diagnostic.rule === "security/no-secrets"
    ));
  });
});
