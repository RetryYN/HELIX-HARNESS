import { describe, expect, it } from "vitest";
import {
  analyzeRepositoryNamePaths,
  loadRepositoryNamePathsInput,
  repositoryNamePathsMessages,
} from "../src/lint/repository-name-paths";

describe("repository path naming", () => {
  it("keeps legacy UT-TDD_AGENT-HARNESS repository names out of file and folder paths", () => {
    const result = analyzeRepositoryNamePaths(loadRepositoryNamePathsInput());

    expect(result.ok).toBe(true);
    expect(result.trackedResidue).toEqual([]);
    expect(result.filesystemResidue).toEqual([]);
    expect(repositoryNamePathsMessages(result)[0]).toContain("repository-name-paths - OK");
  });

  it("fails when legacy repository names return to tracked or filesystem paths", () => {
    const result = analyzeRepositoryNamePaths({
      trackedPaths: ["docs/UT-TDD_AGENT-HARNESS-plan.md"],
      filesystemPaths: ["tmp/UT_TDD_AGENT_HARNESS-Pack"],
    });

    expect(result.ok).toBe(false);
    expect(result.trackedResidue).toEqual(["docs/UT-TDD_AGENT-HARNESS-plan.md"]);
    expect(result.filesystemResidue).toEqual(["tmp/UT_TDD_AGENT_HARNESS-Pack"]);
    expect(repositoryNamePathsMessages(result)[0]).toContain("repository-name-paths - violation");
  });
});
