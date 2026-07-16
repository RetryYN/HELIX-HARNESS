#!/usr/bin/env python3
"""Remove file-wide markers and correct the six highest-density normative docs."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HIGH_DENSITY = [
    "docs/governance/helix-harness-concept_v3.1.md",
    "docs/design/harness/L3-functional/roadmap.md",
    "docs/governance/document-system-map.md",
    "docs/governance/helix-harness-requirements_v1.2.md",
    "docs/process/forward/L08-L14-verification-phase.md",
    "docs/process/forward/overview.md",
]
REPLACEMENTS = [
    ("**L8** 結合テスト", "**L8** 単体・詳細検証"),
    ("**L9** 総合テスト", "**L9** 結合検証"),
    ("**L10** UX 磨き", "**L10** システム検証＋Real UX evidence"),
    ("**L11** 総合レビュー+UAT", "**L11** 受入＋human visual acceptance"),
    ("**L12** デプロイ+受入", "**L12** 運用・価値検証"),
    ("L8 結合テスト", "L8 単体・詳細検証"),
    ("L8 結合", "L8 単体・詳細"),
    ("L9 総合テスト", "L9 結合検証"),
    ("L9 総合", "L9 結合"),
    ("L10 UX 磨き", "L10 システム検証＋Real UX evidence"),
    ("L10 UX磨き", "L10 システム検証＋Real UX evidence"),
    ("L10 (UX 磨き)", "L10 (システム検証＋Real UX evidence)"),
    ("L10 UX refinement", "L10 system/Real UX evidence"),
    ("L11 総合レビュー + UAT", "L11 受入＋human visual acceptance"),
    ("L11 総合レビュー+UAT", "L11 受入＋human visual acceptance"),
    ("L11 UAT", "L11 受入＋human visual acceptance"),
    ("L12 デプロイ + 受入", "L12 運用・価値検証"),
    ("L12 デプロイ+受入", "L12 運用・価値検証"),
    ("L12 受入", "L12 運用・価値検証"),
    ("L12 デプロイ", "L12 運用・価値検証"),
]

def main():
    removed = 0
    for path in ROOT.rglob("*"):
        if not path.is_file() or any(part == ".git" for part in path.parts):
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
        except (UnicodeDecodeError, OSError):
            continue
        kept = [line for line in lines if MARKER not in line]
        if len(kept) != len(lines):
            path.write_text("".join(kept), encoding="utf-8")
            removed += 1
    changed = 0
    for rel in HIGH_DENSITY:
        path = ROOT / rel
        text = path.read_text(encoding="utf-8")
        corrected = text
        for old, new in REPLACEMENTS:
            corrected = corrected.replace(old, new)
        if corrected != text:
            path.write_text(corrected, encoding="utf-8")
            changed += 1
    print({"marker_files_cleaned": removed, "high_density_docs_corrected": changed})

if __name__ == "__main__":
    main()
