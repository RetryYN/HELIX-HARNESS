#!/usr/bin/env python3
"""Read-only exact-byte prefix and JSONL suffix check for MPR register additions."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


REGISTER = "docs/governance/management-provisional-requirement-register.jsonl"
ROOT = Path(__file__).resolve().parents[3]


def fail(message: str) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(1)


def git(*args: str) -> bytes:
    result = subprocess.run(
        ["git", *args], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    if result.returncode:
        fail(result.stderr.decode("utf-8", "replace").strip() or "git command failed")
    return result.stdout


def records(data: bytes, label: str) -> list[dict[str, object]]:
    if data and not data.endswith(b"\n"):
        fail(f"{label} does not end with LF")
    result: list[dict[str, object]] = []
    for number, line in enumerate(data.splitlines(), start=1):
        if not line.strip():
            fail(f"{label} contains a blank line at {number}")
        try:
            value = json.loads(line)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            fail(f"{label} has invalid JSON at line {number}: {exc}")
        if not isinstance(value, dict):
            fail(f"{label} line {number} is not a JSON object")
        registration_id = value.get("registration_id")
        if not isinstance(registration_id, str) or not registration_id:
            fail(f"{label} line {number} has no registration_id")
        result.append(value)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_commit", help="exact base commit whose register bytes must be preserved")
    args = parser.parse_args()

    base_commit = git("rev-parse", "--verify", f"{args.base_commit}^{{commit}}").decode().strip()
    base = git("show", f"{base_commit}:{REGISTER}")
    current = (ROOT / REGISTER).read_bytes()
    if not base.endswith(b"\n"):
        fail("base register does not end with LF; inspect before appending")
    if not current.startswith(base):
        offset = next((i for i, (a, b) in enumerate(zip(base, current)) if a != b), min(len(base), len(current)))
        fail(f"base register bytes are not an exact prefix (first mismatch byte={offset})")

    base_rows = records(base, "base register")
    suffix = current[len(base) :]
    if not suffix:
        fail("register has no appended rows")
    suffix_rows = records(suffix, "appended suffix")
    known = {row["registration_id"] for row in base_rows}
    appended_ids = [row["registration_id"] for row in suffix_rows]
    if len(appended_ids) != len(set(appended_ids)):
        fail("appended suffix contains duplicate registration_id")
    collision = known.intersection(appended_ids)
    if collision:
        fail("appended registration_id already exists in base: " + ", ".join(sorted(collision)))

    print(f"PASS base_commit={base_commit}")
    print(f"base_bytes={len(base)} base_sha256={hashlib.sha256(base).hexdigest()}")
    print(f"current_bytes={len(current)} current_sha256={hashlib.sha256(current).hexdigest()}")
    print(f"exact_prefix=true appended_rows={len(suffix_rows)} ids={','.join(appended_ids)}")


if __name__ == "__main__":
    main()
