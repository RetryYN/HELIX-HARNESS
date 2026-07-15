import { describe, expect, it } from "vitest";
import { buildDocumentChangeReport } from "../src/runtime/document-change-report";

describe("document change report (U-DOCDIFF-005)", () => {
  it("history categoryを日本語noteへ投影し、記録なき変更を隠さない", () => {
    const report = buildDocumentChangeReport({
      baseSnapshotDigest: "sha256:base",
      currentSnapshotDigest: "sha256:current",
      delta: {
        added_documents: ["docs/new.md"],
        removed_documents: [],
        added_ids: ["R-001"],
        removed_ids: [],
        changed_sections: [],
        history_added: [{ path: "docs/a.md", line: "改版 1.1" }],
        findings: [
          {
            code: "unrecorded_change",
            path: "docs/b.md",
            severity: "warning",
            detail: "missing history",
          },
        ],
        ok: true,
      },
    });
    expect(report.release_notes).toEqual(
      expect.arrayContaining([
        "追加: docs/new.md",
        "定義追加: R-001",
        expect.stringContaining("要確認: docs/b.md"),
      ]),
    );
    expect(report.markdown).toContain("改版履歴なしで変更");
  });
});
