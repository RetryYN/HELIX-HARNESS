import { describe, expect, it } from "vitest";
import { parseGreenCommandEvidence } from "../src/state-db/test-report-parser";

describe("green command reporter parser", () => {
  it("normalizes Vitest/Jest-compatible JSON reporter output", () => {
    const parsed = parseGreenCommandEvidence(
      ".ut-tdd/evidence/green-command/vitest.json",
      JSON.stringify({
        testResults: [
          {
            name: "tests/workflow-contracts.test.ts",
            assertionResults: [
              {
                ancestorTitles: ["workflow contracts"],
                title: "U-VITEST-A passes",
                fullName: "workflow contracts U-VITEST-A passes",
                status: "passed",
                duration: 12,
              },
              {
                ancestorTitles: ["workflow contracts"],
                title: "U-VITEST-B fails",
                status: "failed",
                duration: 34,
                failureMessages: ["expected true to be false"],
              },
            ],
          },
        ],
      }),
    );

    expect(parsed?.cases).toEqual([
      {
        oracle_id: "U-VITEST-A",
        name: "workflow contracts U-VITEST-A passes",
        status: "passed",
        duration_ms: 12,
        artifact_path: "tests/workflow-contracts.test.ts",
      },
      {
        oracle_id: "U-VITEST-B",
        name: "workflow contracts > U-VITEST-B fails",
        status: "failed",
        duration_ms: 34,
        message: "expected true to be false",
        artifact_path: "tests/workflow-contracts.test.ts",
      },
    ]);
  });

  it("normalizes Playwright JSON reporter retries without dropping failed attempts", () => {
    const parsed = parseGreenCommandEvidence(
      ".ut-tdd/evidence/green-command/playwright.json",
      JSON.stringify({
        suites: [
          {
            title: "dashboard",
            file: "tests/e2e/dashboard.spec.ts",
            specs: [
              {
                title: "U-PW-FLAKE renders progress",
                tests: [
                  {
                    projectName: "chromium",
                    results: [
                      { status: "failed", duration: 40, error: { message: "timeout" } },
                      { status: "passed", duration: 21 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    );

    expect(parsed?.cases.map((item) => item.status)).toEqual(["failed", "passed"]);
    expect(parsed?.cases[0]).toMatchObject({
      oracle_id: "U-PW-FLAKE",
      name: "dashboard > U-PW-FLAKE renders progress > chromium",
      duration_ms: 40,
      message: "timeout",
      artifact_path: "tests/e2e/dashboard.spec.ts",
    });
  });

  it("normalizes JUnit XML testcase status and rejects entity declarations", () => {
    const parsed = parseGreenCommandEvidence(
      ".ut-tdd/evidence/green-command/junit.xml",
      [
        '<testsuite name="suite">',
        '  <testcase classname="tests/unit/parser.test.ts" name="U-JUNIT-A passes" time="0.123" />',
        '  <testcase classname="tests/unit/parser.test.ts" name="U-JUNIT-B fails" time="0.5">',
        '    <failure message="boom">details</failure>',
        "  </testcase>",
        '  <testcase classname="tests/unit/parser.test.ts" name="U-JUNIT-C skipped"><skipped /></testcase>',
        "</testsuite>",
      ].join("\n"),
    );

    expect(parsed?.cases.map((item) => item.status)).toEqual(["passed", "failed", "skipped"]);
    expect(parsed?.cases[0]).toMatchObject({
      oracle_id: "U-JUNIT-A",
      duration_ms: 123,
      artifact_path: "tests/unit/parser.test.ts",
    });
    expect(parsed?.cases[1]?.message).toBe("boom");
    expect(
      parseGreenCommandEvidence("junit.xml", "<!DOCTYPE testsuite><testsuite />")?.cases,
    ).toEqual([]);
  });
});
