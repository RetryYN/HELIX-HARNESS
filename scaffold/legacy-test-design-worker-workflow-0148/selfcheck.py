#!/usr/bin/env python3
"""Small mutation set proving the static validator rejects scope-changing drift."""
import json
import tempfile
from pathlib import Path
import validate

records = [json.loads(line) for line in validate.LEDGER.read_text(encoding="utf-8").splitlines()]
checks = [
    ("omitted ID", "ledger", lambda x: x.pop(0), "ledger-cardinality"),
    ("extra record field", "ledger", lambda x: x[0]["classification"].update(formal_owner_decided="HELIX-OS"), "record-object-digest"),
    ("wrong product candidate", "ledger", lambda x: x[0]["classification"].update(candidate_products=[]), "candidate-products"),
    ("changed semantic anchor", "ledger", lambda x: x[0]["source_span"]["lines"][0].update(text="not source text"), "semantic-span"),
    ("phase admission", "ledger", lambda x: x[0]["phase"]["candidate_phase_evidence"].update(phase_admission="admitted"), "phase-admission"),
    ("authority escalation", "ledger", lambda x: x[0]["authority_boundary"].update(new_build_allowed=True), "authority-boundary"),
]
for label, kind, mutate, expected_error in checks:
    changed = json.loads(json.dumps(records))
    mutate(changed)
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "ledger.jsonl"
        path.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in changed), encoding="utf-8")
        errors = validate.validate(ledger_path=path)
        if not any(expected_error in error for error in errors):
            raise SystemExit(f"negative case missed ({label}): expected {expected_error}, got {errors[:6]}")

for label, file_path, kind, mutate, expected_error in [
    ("inventory formal-effect", validate.INVENTORY, "inventory", lambda x: x.update(formal_effect="promote"), "inventory-keyset"),
    ("Binding deploy permission", validate.BINDING, "binding", lambda x: x["operations"]["allowed"].append("deploy"), "binding-allowed"),
]:
    changed = json.loads(file_path.read_text(encoding="utf-8"))
    mutate(changed)
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / (kind + ".json")
        path.write_text(json.dumps(changed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        kwargs = {kind + "_path": path}
        errors = validate.validate(**kwargs)
        if not any(expected_error in error for error in errors):
            raise SystemExit(f"negative case missed ({label}): expected {expected_error}, got {errors[:6]}")
print("SCF-B-0148 negative self-check passed: 8 consequential mutations rejected")
