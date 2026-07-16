#!/usr/bin/env python3
"""Pending V-model authority packetのsource snapshotだけを決定的にrefreshする。"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/governance/generated/vmodel-authority-decision-packet-v1.json"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render() -> bytes:
    packet = json.loads(OUTPUT.read_text(encoding="utf-8"))
    if packet.get("status") != "pending_po_activation":
        raise SystemExit("refuse refresh: packet is not pending_po_activation")
    approval = packet.get("approval", {})
    if any(approval.get(key) is not None for key in ("event_id", "actor", "approved_at", "approved_digest")):
        raise SystemExit("refuse refresh: approval fields are already populated")
    for snapshot in packet["source_snapshots"].values():
        path = ROOT / snapshot["path"]
        if not path.is_file():
            raise SystemExit(f"missing source snapshot: {snapshot['path']}")
        snapshot["sha256"] = digest(path)
    return (json.dumps(packet, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = render()
    if args.check:
        if OUTPUT.read_bytes() != expected:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.write_bytes(expected)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
