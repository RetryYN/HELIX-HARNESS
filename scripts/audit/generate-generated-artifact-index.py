#!/usr/bin/env python3
"""Generate/check the deterministic custody index for generated JSON artifacts."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
README = GENERATED / "README.md"
SCHEMA = "helix.generated-artifact-index.v1"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compact(value: object, limit: int = 180) -> str:
    text = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return text if len(text) <= limit else text[: limit - 1] + "…"


def select_mapping(value: object, pattern: re.Pattern[str], depth: int = 0) -> dict[str, object]:
    if depth > 2 or not isinstance(value, dict):
        return {}
    selected: dict[str, object] = {}
    for key, child in sorted(value.items()):
        if key.startswith(("source", "input")):
            continue
        if pattern.search(key) and isinstance(child, list):
            selected[key] = len(child)
        elif pattern.search(key) and isinstance(child, (str, int, float, bool, type(None), dict)):
            selected[key] = child
        elif key in {"summary", "counts", "count", "denominator", "fixed_denominator", "execution"}:
            selected.update({f"{key}.{k}": v for k, v in select_mapping(child, pattern, depth + 1).items()})
    return selected


def producer_map() -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for script in sorted((ROOT / "scripts").rglob("*")):
        if not script.is_file() or script.suffix not in {".py", ".js", ".mjs", ".ts", ".sh"}:
            continue
        text = script.read_text(encoding="utf-8", errors="ignore")
        for artifact in GENERATED.glob("*.json"):
            registration = re.compile(rf"(?:OUTPUT|outputPath|output_path)[^\n]{{0,240}}{re.escape(artifact.name)}|{re.escape(artifact.name)}[^\n]{{0,240}}(?:OUTPUT|outputPath|output_path)")
            if registration.search(text):
                result.setdefault(artifact.name, []).append(script.relative_to(ROOT).as_posix())
    return result


def render() -> str:
    artifacts = sorted(GENERATED.glob("*.json"), key=lambda p: p.name)
    producers = producer_map()
    denominator_re = re.compile(r"(?:rows?|records?|atoms?|routes?|cases?|questions?|decisions?|repositories|tables?|edges?|findings?|denominator|total|count|files?|callables?|artifacts?)$", re.I)
    boundary_re = re.compile(r"(?:coverage|verified|executed|implemented|activated|approved|runtime_mutations|authority.*(?:true|count)|freeze.*credit)", re.I)
    lines = [
        "# Generated artifact index", "",
        f"- index schema: `{SCHEMA}`", "- index status: `custody-index-only`", "- updated: `2026-07-16`",
        f"- scope: `docs/governance/generated` 直下の `*.json` 全{len(artifacts)}件（shard subdirは親manifestのみを索引）", "",
        "## Authority 境界", "",
        "この索引は保存bytesのSHA、schema、状態、主要分母、producerを発見可能にするcustody台帳である。掲載・parse・digest一致はcandidateをauthority、verified、freeze、coverageへ昇格させない。各artifact自身のreceipt境界を優先する。", "",
        "## Artifact 台帳", "",
        "| artifact | bytes SHA-256 | schema | status / authority | 主要 denominator | coverage / verified 境界 | producer |",
        "|---|---|---|---|---|---|---|",
    ]
    for path in artifacts:
        payload = json.loads(path.read_text(encoding="utf-8"))
        schema = payload.get("schema_version") or payload.get("receipt_profile")
        if not schema and isinstance(payload.get("schema"), dict):
            schema = payload["schema"].get("$id") or payload["schema"].get("properties", {}).get("schema_version", {}).get("const") or "embedded JSON Schema"
        elif not schema:
            schema = payload.get("schema") or "未宣言"
        authority = {k: payload[k] for k in sorted(payload) if k == "status" or "authority" in k or k in {"design_freeze_decision"}}
        denominator = select_mapping(payload, denominator_re)
        boundary = select_mapping(payload, boundary_re)
        producer = "<br>".join(f"`{p}`" for p in producers.get(path.name, [])) or "未登録"
        cells = [f"`{path.name}`", f"`{digest(path)}`", f"`{schema}`", compact(authority), compact(denominator), compact(boundary), producer]
        cells = [cell.replace("|", "\\|").replace("\n", " ") for cell in cells]
        lines.append("| " + " | ".join(cells) + " |")
    lines += ["", "## Shard custody", ""]
    for directory in sorted(p for p in GENERATED.iterdir() if p.is_dir()):
        parents = [p.name for p in artifacts if directory.name in p.read_text(encoding="utf-8", errors="ignore")]
        lines.append(f"- `{directory.name}/`: 親manifest {', '.join(f'`{p}`' for p in parents) if parents else '未検出（要是正）'}。子shardは本索引の直下exact-setへ重複計上しない。")
    lines += ["", "## 更新規則", "", "1. `python3 scripts/audit/generate-generated-artifact-index.py`で再生成する。", "2. `--check`はJSON parse、bytes SHA、直下JSON exact-set、README bytes一致を一括検査する。", "3. producer未登録は未登録のまま表示し、producerの存在を実行・検証creditへ読み替えない。", "4. artifact追加・削除・bytes変更時は同じchange setで索引を更新する。", ""]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = render()
    if args.check:
        if not README.exists() or README.read_text(encoding="utf-8") != expected:
            print(f"STALE: {README.relative_to(ROOT)}")
            return 1
        print(f"OK: {README.relative_to(ROOT)}")
        return 0
    README.write_text(expected, encoding="utf-8")
    print(f"WROTE: {README.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
