import { describe, expect, it } from "vitest";
import {
  analyzeRepositoryNamePaths,
  loadRepositoryNamePathsInput,
  repositoryNamePathsMessages,
} from "../src/lint/repository-name-paths";

describe("repository path naming", () => {
  it("keeps legacy HELIX-HARNESS repository names out of file and folder paths", () => {
    const result = analyzeRepositoryNamePaths(loadRepositoryNamePathsInput());

    expect(result.ok).toBe(true);
    expect(result.trackedResidue).toEqual([]);
    expect(result.filesystemResidue).toEqual([]);
    expect(repositoryNamePathsMessages(result)[0]).toContain("repository-name-paths - OK");
  });

  it("fails when legacy repository names return to tracked or filesystem paths", () => {
    const legacyDashedRepo = [["UT", "TDD"].join("-"), "AGENT", "HARNESS"].join("-");
    const legacyCompactRepo = [["UT", "TDD"].join(""), "AGENT", "HARNESS"].join("");
    const legacySpacedRepo = [["UT", "TDD"].join("-"), "AGENT", "HARNESS"].join(" ");
    const legacyUnderscorePack = [
      ["UT", "TDD"].join("_"),
      "AGENT",
      ["HARNESS", "Pack"].join("-"),
    ].join("_");
    const legacyDottedPack = ["ut", "tdd", "agent", "harness", "pack"].join(".");
    const legacyLowerCompactRepo = ["ut", "tdd", "agent", "harness"].join("");
    const legacyStateDir = `.${["ut", "tdd"].join("-")}`;
    const legacyWrapper = ["ut", "tdd"].join("-");
    const result = analyzeRepositoryNamePaths({
      trackedPaths: [
        `docs/${legacyDashedRepo}-plan.md`,
        `docs/${legacyLowerCompactRepo}-plan.md`,
        `docs/${legacySpacedRepo} plan.md`,
        `${legacyStateDir}/handover/CURRENT.json`,
      ],
      filesystemPaths: [
        `tmp/${legacyUnderscorePack}`,
        `tmp/${legacyCompactRepo}-Pack`,
        `tmp/${legacyDottedPack}`,
        `scripts/${legacyWrapper}`,
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.trackedResidue).toEqual([
      `docs/${legacyDashedRepo}-plan.md`,
      `docs/${legacyLowerCompactRepo}-plan.md`,
      `docs/${legacySpacedRepo} plan.md`,
      `${legacyStateDir}/handover/CURRENT.json`,
    ]);
    expect(result.filesystemResidue).toEqual([
      `tmp/${legacyUnderscorePack}`,
      `tmp/${legacyCompactRepo}-Pack`,
      `tmp/${legacyDottedPack}`,
      `scripts/${legacyWrapper}`,
    ]);
    expect(repositoryNamePathsMessages(result)[0]).toContain("repository-name-paths - violation");
  });
});
