// PLAN-RECOVERY-74-immutable-github-action-ref-registry
import { describe, expect, it } from "vitest";
import {
  analyzeToolchainPin,
  loadToolchainPinInput,
  type ToolchainPinInput,
  toolchainPinMessages,
} from "../src/lint/toolchain-pin";

const SETUP_NODE_SHA = "820762786026740c76f36085b0efc47a31fe5020";
const SETUP_NODE_REF = `actions/setup-node@${SETUP_NODE_SHA}`;
const actionRegistry = {
  path: "config/github-action-immutable-ref-registry.json",
  text: JSON.stringify({
    schema_version: "helix-github-action-immutable-ref-registry.v1",
    registry_version: "1.0.0",
    verified_at: "2026-09-01T10:18:00Z",
    entries: [
      {
        action: "actions/setup-node",
        release: "v7",
        commit_sha: SETUP_NODE_SHA,
        source_url: `https://api.github.com/repos/actions/setup-node/git/commits/${SETUP_NODE_SHA}`,
      },
    ],
  }),
};

const validInput: ToolchainPinInput = {
  packageJson: {
    path: "package.json",
    text: JSON.stringify({ engines: { node: ">=24.15.0 <25" } }),
  },
  actionRegistry,
  lockfiles: ["package-lock.json"],
  workflowFiles: [
    {
      path: ".github/workflows/harness-check.yml",
      text: [
        "name: harness-check",
        "jobs:",
        "  harness-check:",
        "    steps:",
        `      - uses: ${SETUP_NODE_REF}`,
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
        `      - uses: ${SETUP_NODE_REF}`,
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
      actionRegistry,
      lockfiles: [],
      workflowFiles: [
        {
          path: ".github/workflows/harness-check.yml",
          text: [
            "name: harness-check",
            "jobs:",
            "  harness-check:",
            "    steps:",
            `      - uses: ${SETUP_NODE_REF}`,
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
            `      - uses: ${SETUP_NODE_REF}`,
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

  it("U-IAR-001: accepts only the registry-bound full setup-node SHA", () => {
    expect(analyzeToolchainPin(validInput).violations).toEqual([]);
    const missingVersionResult = analyzeToolchainPin({
      ...validInput,
      workflowFiles: [
        {
          path: ".github/workflows/harness-check.yml",
          text: [
            "name: harness-check",
            "jobs:",
            "  harness-check:",
            "    steps:",
            `      - uses: ${SETUP_NODE_REF}`,
            "      - run: npm ci",
          ].join("\n"),
        },
      ],
    });
    expect(missingVersionResult.violations.map((violation) => violation.rule)).toContain(
      "source-harness-check-node-version-missing",
    );
  });

  it("U-IAR-002: rejects mutable, short, unknown, and wrong setup-node refs", () => {
    for (const setupNodeRef of [
      "actions/setup-node@v7",
      "actions/setup-node@main",
      "actions/setup-node",
      "actions/setup-node@8207627",
      "actions/setup-node@0000000000000000000000000000000000000000",
      "other/setup-node@820762786026740c76f36085b0efc47a31fe5020",
    ]) {
      const result = analyzeToolchainPin({
        ...validInput,
        workflowFiles: [
          {
            path: ".github/workflows/harness-check.yml",
            text: validInput.workflowFiles[0].text.replace(SETUP_NODE_REF, setupNodeRef),
          },
        ],
      });

      expect(
        result.violations.map((violation) => violation.rule),
        setupNodeRef,
      ).toEqual(
        expect.arrayContaining([
          expect.stringMatching(
            /github-action-ref-mutable|github-action-ref-registry-mismatch|github-action-identity-unknown|source-harness-check-setup-node-ref-unsupported/u,
          ),
        ]),
      );
    }

    const duplicateRegistry = JSON.parse(actionRegistry.text) as {
      entries: Array<Record<string, unknown>>;
    };
    duplicateRegistry.entries.push({ ...duplicateRegistry.entries[0] });
    const duplicateResult = analyzeToolchainPin({
      ...validInput,
      actionRegistry: { ...actionRegistry, text: JSON.stringify(duplicateRegistry) },
    });
    expect(duplicateResult.violations.map((violation) => violation.rule)).toContain(
      "github-action-registry-entry-duplicate",
    );

    const laterMismatchResult = analyzeToolchainPin({
      ...validInput,
      workflowFiles: [
        {
          path: ".github/workflows/harness-check.yml",
          text: `${validInput.workflowFiles[0].text}\n      - uses: ${SETUP_NODE_REF}\n        with:\n          node-version: "23.0"`,
        },
      ],
    });
    expect(laterMismatchResult.violations.map((violation) => violation.rule)).toContain(
      "source-harness-check-node-version-mismatch",
    );
  });

  it("U-TOOLCHAIN-PIN-004: current repo keeps source toolchain pinning green", () => {
    const result = analyzeToolchainPin(loadToolchainPinInput(process.cwd()));

    expect(result.violations).toEqual([]);
  });
});
