#!/usr/bin/env python3
"""Bind legacy layer prose/metadata to the canonical L1-L12 authority without renaming IDs."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANONICAL = "L8=unit/detail; L9=integration; L10=system+Real UX; L11=acceptance/human visual; L12=operational/value"


def marker_for(path: str) -> str:
    if path.startswith("docs/plans/"):
        body = f"{MARKER}; historical PLAN evidence preserves its then-current wording and is not current layer authority; {CANONICAL}; paths/IDs are legacy_source compatibility aliases pending atomic migration"
    elif path.startswith(("src/", "tests/")):
        body = f"{MARKER}; identifiers/assertion fixtures are compatibility aliases, not authoring authority; {CANONICAL}; atomic path/ID rename is deferred"
    else:
        body = f"{MARKER}; legacy prose/path tokens are compatibility aliases, not current layer authority; {CANONICAL}; atomic path/ID rename is deferred"
    if path.endswith((".ts", ".js", ".mjs")):
        return f"// {body}"
    if path.endswith((".yaml", ".yml")):
        return f"# {body}"
    if path.endswith(".json"):
        raise ValueError("JSON requires a structured metadata field; do not prepend a comment")
    return f"<!-- {body} -->"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: apply-layer-semantics-compat-markers.py INVENTORY.json")
    inventory = json.loads((ROOT / sys.argv[1]).read_text(encoding="utf-8"))
    paths = sorted({row["path"] for row in inventory["findings"] if row["disposition"] == "rename_or_semantic_correction_obligation"})
    changed = 0
    for rel in paths:
        path = ROOT / rel
        text = path.read_text(encoding="utf-8")
        if MARKER in text:
            continue
        marker = marker_for(rel)
        lines = text.splitlines()
        insert_at = 0
        if lines and lines[0].startswith("#!"):
            insert_at = 1
        if lines and lines[0].strip() == "---":
            for index in range(1, len(lines)):
                if lines[index].strip() == "---":
                    insert_at = index + 1
                    break
        lines.insert(insert_at, marker)
        path.write_text("\n".join(lines) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
        changed += 1
    print(json.dumps({"candidate_files": len(paths), "changed_files": changed}, ensure_ascii=False))


if __name__ == "__main__":
    main()
