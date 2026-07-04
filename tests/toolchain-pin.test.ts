import { describe, expect, it } from "vitest";
import {
  analyzeToolchainPin,
  loadToolchainPinInput,
  toolchainPinMessages,
  type ToolchainPinInput,
} from "../src/lint/toolchain-pin";

const validInput: ToolchainPinInput = {
  packageJson: {
    path: "package.json",
    text: JSON.stringify({ engines: { bun: ">=1.3" } }),
  },
  lockfiles: ["bun.lock"],
  workflowFiles: [
    {
      path: ".github/workflows/harness-check.yml",
      text: [
        "name: harness-check",
        "jobs:",
        "  harness-check:",
        "    steps:",
        "      - uses: oven-sh/setup-bun@v2",
        "        with:",
        '          bun-version: "1.3"',
        "      - run: bun install --frozen-lockfile",
      ].join("\n"),
    },
    {
      path: "docs/templates/github/common/harness-check.yml",
      text: [
        "name: harness-check",
        "jobs:",
        "  harness-check:",
        "    steps:",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
      ].join("\n"),
    },
  ],
};

describe("toolchain-pin lint", () => {
  it("U-TOOLCHAIN-PIN-001: accepts pinned Bun engine, committed lockfile, and frozen CI installs", () => {
    const result = analyzeToolchainPin(validInput);

    expect(result.ok).toBe(true);
    expect(toolchainPinMessages(result)[0]).toContain("OK");
  });

  it("U-TOOLCHAIN-PIN-002: rejects missing Bun pin, missing lockfile, and non-frozen install", () => {
    const result = analyzeToolchainPin({
      packageJson: {
        path: "package.json",
        text: JSON.stringify({ engines: { bun: "latest" } }),
      },
      lockfiles: [],
      workflowFiles: [
        {
          path: ".github/workflows/harness-check.yml",
          text: [
            "name: harness-check",
            "jobs:",
            "  harness-check:",
            "    steps:",
            "      - uses: oven-sh/setup-bun@v2",
            "      - run: bun install",
          ].join("\n"),
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.rule)).toEqual(
      expect.arrayContaining([
        "bun-engine-unpinned",
        "bun-lockfile-missing",
        "bun-install-not-frozen",
        "source-harness-check-bun-version-missing",
      ]),
    );
  });

  it("U-TOOLCHAIN-PIN-003: rejects source harness-check bun-version drift from package engine floor", () => {
    const result = analyzeToolchainPin({
      ...validInput,
      workflowFiles: [
        {
          path: ".github/workflows/harness-check.yml",
          text: [
            "name: harness-check",
            "jobs:",
            "  harness-check:",
            "    steps:",
            "      - uses: oven-sh/setup-bun@v2",
            "        with:",
            '          bun-version: "1.4"',
            "      - run: bun install --frozen-lockfile",
          ].join("\n"),
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.rule)).toContain(
      "source-harness-check-bun-version-mismatch",
    );
  });

  it("U-TOOLCHAIN-PIN-004: current repo keeps source toolchain pinning green", () => {
    const result = analyzeToolchainPin(loadToolchainPinInput(process.cwd()));

    expect(result.violations).toEqual([]);
  });
});
