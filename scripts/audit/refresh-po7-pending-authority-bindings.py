#!/usr/bin/env python3
"""意味不変のsource修正後にpending PO7 custody bindingを決定的にrefreshする。"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
VMODEL = GEN / "vmodel-authority-decision-packet-v1.json"
AUTHORITY = GEN / "po-go-authority-event-v1.json"
RECEIPT = ROOT / "docs/governance/vmodel-authority-receipt-v1.md"


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def stable(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def write_json(path: Path, value: object) -> None:
    path.write_text(stable(value) + "\n", encoding="utf-8")


def refresh_vmodel_packet() -> None:
    packet = json.loads(VMODEL.read_text(encoding="utf-8"))
    if packet.get("status") != "pending_po_activation" or any(
        packet.get("approval", {}).get(key) is not None
        for key in ("event_id", "actor", "approved_at", "approved_digest")
    ):
        raise SystemExit("refuse refresh: V-model packet is no longer pending")
    for snapshot in packet["source_snapshots"].values():
        snapshot["sha256"] = sha_file(ROOT / snapshot["path"])
    write_json(VMODEL, packet)


def replace_exact(text: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise SystemExit(f"missing or duplicate receipt binding: {label}")
    return updated


def refresh_receipt() -> None:
    text = RECEIPT.read_text(encoding="utf-8")
    bindings = {
        "vmodel-canonical-authority-cutover.md": "docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md",
        "ADR-009-node-python-linux-runtime.md": "docs/adr/ADR-009-node-python-linux-runtime.md",
        "infinity-loop-platform-requirements.md": "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
        "infinity-loop-functional-requirements.md": "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
        "helix-harness-concept_v3.1.md": "docs/governance/helix-harness-concept_v3.1.md",
        "helix-harness-requirements_v1.2.md": "docs/governance/helix-harness-requirements_v1.2.md",
        "helix-charter_v0.1.md": "docs/design/helix/L0-charter/helix-charter_v0.1.md",
    }
    for label, path in bindings.items():
        text = replace_exact(
            text,
            rf"^(\| `{re.escape(label)}` \| `)[0-9a-f]{{64}}(` \|)$",
            rf"\g<1>{sha_file(ROOT / path)}\g<2>",
            label,
        )
    text = replace_exact(
        text,
        r"(`docs/governance/generated/vmodel-authority-decision-packet-v1\.json`（SHA-256\s*`)[0-9a-f]{64}(`）)",
        rf"\g<1>{sha_file(VMODEL)}\g<2>",
        "vmodel packet",
    )
    start = text.index("## §1 authority decision")
    end = text.index("### §1.1 machine decision packet", start)
    decision_digest = sha_bytes(text[start:end].encode("utf-8"))
    text = replace_exact(
        text,
        r"^decision_table_sha256: [0-9a-f]{64}$",
        f"decision_table_sha256: {decision_digest}",
        "decision frontmatter",
    )
    text = replace_exact(
        text,
        r"^(\| §1 decision table[^|]*\| `)[0-9a-f]{64}(` \|)$",
        rf"\g<1>{decision_digest}\g<2>",
        "decision table row",
    )
    RECEIPT.write_text(text, encoding="utf-8")


def refresh_authority_event() -> None:
    authority = json.loads(AUTHORITY.read_text(encoding="utf-8"))
    if authority.get("status") != "observed_pending_activation":
        raise SystemExit("refuse refresh: PO GO event is no longer pending activation")
    authority["vmodel_packet_sha256"] = sha_file(VMODEL)
    body = dict(authority)
    body.pop("payload_digest", None)
    authority["payload_digest"] = sha_bytes(stable(body).encode("utf-8"))
    write_json(AUTHORITY, authority)


def main() -> None:
    refresh_vmodel_packet()
    refresh_receipt()
    refresh_authority_event()
    print("OK: refreshed pending PO7 source, receipt, and GO custody bindings")


if __name__ == "__main__":
    main()
