import { describe, expect, it } from "vitest";
import {
  analyzeToolchainPin,
  loadToolchainPinInput,
  type ToolchainPinInput,
  toolchainPinMessages,
} from "../src/lint/toolchain-pin";

const validInput: ToolchainPinInput = {
  packageJson: {
    path: "package.json",
    text: JSON.stringify({
      packageManager: "npm@11.12.1",
      engines: { node: ">=24.15.0 <25", bun: ">=1.3" },
    }),
  },
  lockfiles: ["package-lock.json", "bun.lock"],
  workflowFiles: [
    {
      path: ".github/workflows/harness-check.yml",
      text: [
        "name: harness-check",
        "jobs:",
        "  harness-check:",
        "    steps:",
        "      - uses: actions/setup-node@v4",
        "        with:",
        '          node-version: "24.15"',
        "      - run: npm ci",
      ].join("\n"),
    },
    {
      path: "docs/templates/github/common/harness-check.yml",
      text: [
        "name: harness-check",
        "jobs:",
        "  harness-check:",
        "    steps:",
        "      - uses: actions/setup-node@v4",
        "      - run: npm ci",
      ].join("\n"),
    },
  ],
};

describe("toolchain-pin lint", () => {
  it("U-TOOLCHAIN-PIN-001: accepts pinned Node/npm, package lock, and npm ci", () => {
    const result = analyzeToolchainPin(validInput);

    expect(result.ok).toBe(true);
    expect(toolchainPinMessages(result)[0]).toContain("OK");
  });

  it("U-TOOLCHAIN-PIN-002: rejects invalid Node/npm pins, missing lock, and npm install", () => {
    const result = analyzeToolchainPin({
      packageJson: {
        path: "package.json",
        text: JSON.stringify({ packageManager: "npm@latest", engines: { node: "latest" } }),
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
            "      - uses: actions/setup-node@v4",
            "      - run: npm install",
          ].join("\n"),
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.rule)).toEqual(
      expect.arrayContaining([
        "node-engine-unpinned",
        "npm-version-unpinned",
        "node-lockfile-missing",
        "npm-install-not-frozen",
        "source-harness-check-node-version-missing",
      ]),
    );
  });

  it("U-TOOLCHAIN-PIN-003: rejects source harness-check Node version drift", () => {
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
            "      - uses: actions/setup-node@v4",
            "        with:",
            '          node-version: "22.23"',
            "      - run: npm ci",
          ].join("\n"),
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.rule)).toContain(
      "source-harness-check-node-version-mismatch",
    );
  });

  it("U-TOOLCHAIN-PIN-004: current repo keeps source toolchain pinning green", () => {
    const result = analyzeToolchainPin(loadToolchainPinInput(process.cwd()));

    expect(result.violations).toEqual([]);
  });
});
