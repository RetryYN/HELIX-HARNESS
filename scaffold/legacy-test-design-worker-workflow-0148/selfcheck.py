#!/usr/bin/env python3
"""A few mutation checks that prove the validator catches consequential drift."""
import json
import tempfile
from pathlib import Path
import validate

records = [json.loads(line) for line in validate.LEDGER.read_text(encoding="utf-8").splitlines()]
checks = [
    ("omitted ID", lambda rs: rs.pop(0), "ledger-cardinality"),
    ("wrong product candidate", lambda rs: rs[0]["classification"].update(candidate_products=[]), "candidate-products"),
    ("changed semantic anchor", lambda rs: rs[0]["source_span"]["lines"][0].update(text="not source text"), "semantic-span"),
    ("phase admission", lambda rs: rs[0]["phase"]["candidate_phase_evidence"].update(phase_admission="admitted"), "phase-admission"),
    ("authority escalation", lambda rs: rs[0]["authority_boundary"].update(new_build_allowed=True), "authority-boundary"),
]
for label, mutate, expected_error in checks:
    changed = json.loads(json.dumps(records))
    mutate(changed)
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "ledger.jsonl"
        path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in changed), encoding="utf-8")
        errors = validate.validate(path, validate.MANIFEST)
        if not any(expected_error in error for error in errors):
            raise SystemExit(f"negative case missed ({label}): expected {expected_error}, got {errors[:5]}")
print(f"SCF-B-0148 negative self-check passed: {len(checks)} consequential mutations rejected")
