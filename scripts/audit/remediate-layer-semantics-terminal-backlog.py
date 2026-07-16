#!/usr/bin/env python3
"""Rewrite open normative layer prose while preserving legacy path/ID tokens."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "docs/governance/generated/l1-l12-layer-semantics-drift-inventory-v1.json"
LEDGER = ROOT / "docs/governance/generated/l1-l12-layer-semantics-compatibility-ledger-v1.json"
CANONICAL = {
    "LSC-L8-LEGACY-INTEGRATION": "canonical L8=unit/detail",
    "LSC-L9-LEGACY-SYSTEM": "canonical L9=integration",
    "LSC-L10-LEGACY-UX": "canonical L10=system/Real UX evidence",
    "LSC-L11-LEGACY-UAT": "canonical L11=acceptance/human visual",
    "LSC-L12-LEGACY-DEPLOY": "canonical L12=operational/value",
}

REWRITES = {
    "legacy_l8_integration": [
        (re.compile(r"L8\s*結合テスト"), "L9 結合テスト"),
        (re.compile(r"L8\s*結合検証"), "L9 結合検証"),
        (re.compile(r"L8\s*=\s*module 間 / 内外境界の\s*\*\*結合\*\*"), "L9 = module 間 / 内外境界の **結合**"),
    ],
    "legacy_l9_system": [
        (re.compile(r"L9\s*総合テスト"), "L10 システム/Real UX evidence 検証"),
        (re.compile(r"L9\s*総合検証"), "L10 システム/Real UX evidence 検証"),
    ],
    "legacy_l10_ux_only": [
        (re.compile(r"L10\s*UX\s*磨き(?:上げ)?(?:/WCAG)?"), "L10 システム/Real UX evidence"),
        (re.compile(r"L10\s*UX refinement", re.I), "L10 system/Real UX evidence"),
        (re.compile(r"L10\s*UX/WCAG", re.I), "L10 system/Real UX evidence"),
        (re.compile(r"L10\s*UX\b", re.I), "L10 system/Real UX evidence"),
    ],
    "legacy_l11_review_uat": [
        (re.compile(r"L11\s*総合レビュー\s*[+・]?\s*UAT"), "L11 受入/human visual"),
        (re.compile(r"L11\s*UAT"), "L11 受入/human visual"),
    ],
    "legacy_l12_deploy_acceptance": [
        (re.compile(r"L12\s*受入テスト"), "L12 運用/価値検証"),
        (re.compile(r"L12\s*受入検証"), "L12 運用/価値検証"),
        (re.compile(r"L12\s*受入証跡"), "L12 運用/価値証跡"),
        (re.compile(r"L12\s*受入観測"), "L12 運用/価値観測"),
        (re.compile(r"L12\s*受入 evidence", re.I), "L12 operational/value evidence"),
        (re.compile(r"L12\s*受入\b"), "L12 運用/価値"),
        (re.compile(r"L12\s*デプロイ\s*[+・]?\s*受入"), "L12 運用/価値"),
    ],
}

LEGACY_PATH = re.compile(r"(?:docs|tests|src)/[^\s`|]+(?:L8-integration|L9-system|L10-ux|L11-uat|L12-acceptance)[^\s`|]*")


def rewrite_unprotected(line: str, rules: list[tuple[re.Pattern[str], str]]) -> str:
    protected: list[str] = []

    def hold(match: re.Match[str]) -> str:
        protected.append(match.group(0))
        return f"@@LAYER_PATH_{len(protected) - 1}@@"

    value = re.sub(r"`[^`]*(?:L8-integration|L9-system|L10-ux|L11-uat|L12-acceptance)[^`]*`", hold, line)
    value = LEGACY_PATH.sub(hold, value)
    for pattern, replacement in rules:
        value = pattern.sub(replacement, value)
    for index, token in enumerate(protected):
        value = value.replace(f"@@LAYER_PATH_{index}@@", token)
    return value


def main() -> None:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    findings = [row for row in inventory["findings"] if row["semantic_correction_obligation_open"]]
    by_path: dict[str, list[dict]] = {}
    for finding in findings:
        by_path.setdefault(finding["path"], []).append(finding)
    changed_lines = 0
    for relative, rows in sorted(by_path.items()):
        path = ROOT / relative
        lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
        by_line: dict[int, list[str]] = {}
        for row in rows:
            by_line.setdefault(row["line"], []).append(row["kind"])
        for number, kinds in sorted(by_line.items()):
            original = lines[number - 1]
            rewritten = original
            for kind in kinds:
                rewritten = rewrite_unprotected(rewritten, REWRITES[kind])
            if rewritten != original:
                lines[number - 1] = rewritten
                changed_lines += 1
        path.write_text("".join(lines), encoding="utf-8")

    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    canonical_by_line: dict[tuple[str, int], set[str]] = {}
    for alias in ledger["aliases"]:
        for edge in alias["consumer_edges"]:
            if edge["reason"] == "pre_cutover_prose_consumer":
                canonical_by_line.setdefault((edge["path"], edge["line"]), set()).add(CANONICAL[alias["alias_key"]])
    canonical_lines_changed = 0
    for (relative, number), meanings in sorted(canonical_by_line.items()):
        path = ROOT / relative
        lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
        original = lines[number - 1]
        ending = "\n" if original.endswith("\n") else ""
        body = original.removesuffix("\n")
        missing = [meaning for meaning in sorted(meanings) if meaning not in body]
        if missing:
            lines[number - 1] = f"{body} （層意味論: {'; '.join(missing)}）{ending}"
            path.write_text("".join(lines), encoding="utf-8")
            canonical_lines_changed += 1
    print(json.dumps({"source_backlog": len(findings), "files": len(by_path), "changed_lines": changed_lines, "canonical_lines_changed": canonical_lines_changed, "canonical_line_union": len(canonical_by_line)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
