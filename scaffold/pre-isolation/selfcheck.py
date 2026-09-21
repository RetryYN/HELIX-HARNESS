#!/usr/bin/env python3
"""RDP-001 PREISOLATION candidate validatorのread-only否定例。

manifestの一時コピーだけを変更し、provenance field driftとsnapshot path driftを
validatorがfail-closeすることを確認する。repositoryやarchive bytesは変更しない。
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "scaffold/pre-isolation/rdp001-revision-coherence-6path.json"
VALIDATOR = ROOT / "scaffold/pre-isolation/validate.py"


def run_case(name: str, mutate, expected_text: str) -> None:
    document = json.loads(MANIFEST.read_text(encoding="utf-8"))
    mutate(document)
    with tempfile.TemporaryDirectory(prefix="rdp001-preiso-selfcheck-") as temporary:
        candidate = Path(temporary) / "manifest.json"
        candidate.write_text(json.dumps(document, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run(
            [sys.executable, str(VALIDATOR), "--manifest", str(candidate)],
            cwd=ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            check=False,
        )
    if result.returncode == 0 or expected_text not in result.stdout:
        raise SystemExit(f"FAIL: {name}\n{result.stdout}")
    print(f"PASS: {name}")


def main() -> int:
    run_case(
        "consumer digest declaration drift",
        lambda document: document["registry_provenance"][0].update(
            {"source_digest_value": "sha256:" + "0" * 64}
        ),
        "registry provenance source digest value不一致",
    )
    run_case(
        "archive snapshot path drift",
        lambda document: document["paths"][0].update(
            {"archive_path": "archive/legacy-generation-2026-09-14/root/config/workflow-execution-policy.v1.json"}
        ),
        "archive_pathがsource_pathのsnapshotではない",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
