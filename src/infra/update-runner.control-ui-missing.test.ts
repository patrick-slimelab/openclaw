import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runGatewayUpdate } from "./update-runner.js";

type RunnerResult = { stdout?: string; stderr?: string; code?: number };

function createRunner(map: Record<string, RunnerResult>) {
  const calls: string[] = [];
  const runner = async (argv: string[]) => {
    const key = argv.join(" ");
    calls.push(key);
    const res = map[key];
    if (!res) {
      return { stdout: "", stderr: `unmocked: ${key}`, code: 1 };
    }
    return {
      stdout: res.stdout ?? "",
      stderr: res.stderr ?? "",
      code: res.code ?? 0,
    };
  };
  return { runner, calls };
}

async function makeTempDir() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "moltbot-update-"));
  return {
    tempDir,
    cleanup: async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    },
  };
}

describe("update-runner (control-ui restore)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not fail update when dist/control-ui is not tracked", async () => {
    const { tempDir, cleanup } = await makeTempDir();
    await fs.mkdir(path.join(tempDir, ".git"));
    await fs.writeFile(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "moltbot", version: "1.0.0", packageManager: "pnpm@8.0.0" }),
      "utf-8",
    );

    const { runner, calls } = createRunner({
      [`git -C ${tempDir} rev-parse --show-toplevel`]: { stdout: tempDir },
      [`git -C ${tempDir} rev-parse HEAD`]: { stdout: "abc123" },
      [`git -C ${tempDir} status --porcelain -- :!dist/control-ui/`]: { stdout: "" },
      [`git -C ${tempDir} fetch --all --prune --tags`]: { stdout: "" },
      [`git -C ${tempDir} tag --list v* --sort=-v:refname`]: { stdout: "v1.0.1\n" },
      [`git -C ${tempDir} checkout --detach v1.0.1`]: { stdout: "" },
      "pnpm install": { stdout: "" },
      "pnpm build": { stdout: "" },
      "pnpm ui:build": { stdout: "" },
      // Simulate missing tracked file
      [`git -C ${tempDir} cat-file -e HEAD:dist/control-ui/index.html`]: { code: 1 },
      // doctor + rev-parse
      "pnpm moltbot doctor --non-interactive": { stdout: "" },
      [`git -C ${tempDir} rev-parse HEAD`]: { stdout: "def456" },
    });

    const result = await runGatewayUpdate({
      cwd: tempDir,
      runCommand: async (argv, _options) => runner(argv),
      timeoutMs: 5000,
      channel: "stable",
    });

    expect(result.status).toBe("ok");
    expect(calls.some((c) => c.includes("checkout -- dist/control-ui/"))).toBe(false);

    await cleanup();
  });
});
