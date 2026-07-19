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
    text: JSON.stringify({ engines: { node: ">=22.12" } }),
  },
  lockfiles: ["package-lock.json"],
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
        '          node-version: "22.12"',
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
  it("U-TOOLCHAIN-PIN-001: accepts pinned Node engine, committed lockfile, and frozen CI installs", () => {
    const result = analyzeToolchainPin(validInput);

    expect(result.ok).toBe(true);
    expect(toolchainPinMessages(result)[0]).toContain("OK");
  });

  it("U-TOOLCHAIN-PIN-002: rejects missing Node pin, missing lockfile, and non-frozen install", () => {
    const result = analyzeToolchainPin({
      packageJson: {
        path: "package.json",
        text: JSON.stringify({ engines: { node: "latest" } }),
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
        "node-lockfile-missing",
        "npm-install-not-clean",
        "source-harness-check-node-version-missing",
      ]),
    );
  });

  it("U-TOOLCHAIN-PIN-003: rejects source harness-check node-version drift from package engine floor", () => {
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
            '          node-version: "23.0"',
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
