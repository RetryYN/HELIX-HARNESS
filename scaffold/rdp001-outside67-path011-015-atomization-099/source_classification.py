#!/usr/bin/env python3
"""Shared, fail-closed source classification and diff derivation helpers."""
from __future__ import annotations

import difflib
import re

FRONTMATTER_KEY = re.compile(r"^[A-Za-z_][A-Za-z0-9_-]*\s*:")
GENERIC_METADATA = {
    "---", "|---|", "| --- |", "|---|---|", "| --- | --- |",
    "|---|---|---|", "| --- | --- | --- |",
}


def frontmatter_line_numbers(lines: list[str]) -> set[int]:
    """Return frontmatter lines only for a valid opening/key/closing shape.

    The marker must be the first source line.  Top-level entries must start
    with a YAML-like key; indented continuation/list lines are accepted as the
    value of the preceding key.  An unclosed or malformed block is not
    metadata, so normative text cannot disappear behind a loose heuristic.
    """
    if not lines or lines[0].strip() != "---":
        return set()
    closing = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if closing is None:
        return set()
    seen_key = False
    active_key = False
    for raw in lines[1:closing]:
        stripped = raw.strip()
        if not stripped:
            continue
        if FRONTMATTER_KEY.match(stripped):
            seen_key = True
            active_key = True
            continue
        if raw[:1].isspace() and active_key:
            continue
        return set()
    if not seen_key:
        return set()
    return set(range(1, closing + 2))


def generic_metadata_line(text: str) -> bool:
    stripped = text.strip()
    if not stripped or stripped.startswith("#"):
        return True
    if stripped in GENERIC_METADATA:
        return True
    return stripped.startswith("|") and "---" in stripped


def metadata_line_numbers(lines: list[str]) -> set[int]:
    numbers = frontmatter_line_numbers(lines)
    numbers.update(i for i, text in enumerate(lines, 1) if generic_metadata_line(text))
    return numbers


def derive_source_diff(pre: list[str], archive: list[str]) -> dict:
    unified = list(difflib.unified_diff(pre, archive, fromfile="pre-isolation", tofile="archive-revision", lineterm=""))
    hunks = [line for line in unified if line.startswith("@@")]
    return {
        "status": "same" if pre == archive else "different",
        "hunks": hunks,
        "hunk_count": len(hunks),
        "unified_diff": unified,
        "meaning_equivalence": "unresolved",
        "source_ref": "exact Git objects only",
    }
