#!/usr/bin/env python3
"""Static consistency check for the pinned SCF-B-0148 research snapshot."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

BASE = "8a9fdc973f3553bea78d022e8d73f109aca526da"
ROOT = Path(__file__).resolve().parent
LEDGER = ROOT / "classification-research.jsonl"
MANIFEST = ROOT / "selection-manifest.json"
BOOTSTRAP = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
EXPECTED_AUTHORITY = {
    "authority_effect": "none",
    "legacy_execution_performed": False,
    "formal_asset_classification_updated": False,
    "phase_updated": False,
    "successor_assigned": False,
    "new_build_allowed": False,
}


def git_bytes(revision, path):
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], stderr=subprocess.DEVNULL)


def jsonl_bytes(data):
    return [json.loads(line) for line in data.decode("utf-8").splitlines() if line.strip()]


def validate(ledger_path=LEDGER, manifest_path=MANIFEST):
    errors = []
    try:
        manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
        records = jsonl_bytes(Path(ledger_path).read_bytes())
        bootstrap = jsonl_bytes(git_bytes(BASE, BOOTSTRAP))
    except Exception as exc:
        return [f"input-read: {exc}"]
    if manifest.get("base_revision") != BASE or manifest.get("expected_selected_count") != 52:
        errors.append("manifest-pinning: unexpected base/count")
    selected = [r for r in bootstrap if r.get("source_path", "").startswith("docs/test-design/helix/")
                and "PHCAP-07" in r.get("candidate_phase_targets", [])
                and any(s in Path(r["source_path"]).name.lower() for s in ("worker", "workflow"))]
    by_id = {r["asset_id"]: r for r in selected}
    expected = {r["asset_id"]: r for r in manifest.get("rows", [])}
    actual = {r.get("asset_id"): r for r in records}
    if len(selected) != 52 or len(by_id) != 52:
        errors.append("selection: fixed bootstrap does not independently yield 52 unique IDs")
    if len(records) != 52 or len(actual) != 52:
        errors.append("ledger-cardinality: expected 52 unique records")
    if set(actual) != set(by_id) or set(expected) != set(by_id):
        errors.append("selection-membership: target IDs differ from fixed bootstrap/manifest")

    seen_paths = set()
    for aid in sorted(set(by_id) & set(expected) & set(actual)):
        src, pin, out = by_id[aid], expected[aid], actual[aid]
        path = src.get("source_path")
        if path in seen_paths:
            errors.append(f"duplicate-path: {aid}")
        seen_paths.add(path)
        if path != pin.get("source_path") or path != out.get("source_path"):
            errors.append(f"source-path: {aid}")
        if src.get("source_sha256") != pin.get("source_sha256"):
            errors.append(f"bootstrap-sha: {aid}")
        source_exact = out.get("source_exact", {})
        if source_exact.get("sha256") != pin.get("source_sha256"):
            errors.append(f"ledger-source-sha: {aid}")
        try:
            blob = git_bytes(BASE, source_exact["archive_path"])
            digest = hashlib.sha256(blob).hexdigest()
            if digest != pin.get("source_sha256") or len(blob) != source_exact.get("bytes"):
                errors.append(f"archive-source-digest: {aid}")
            lines = blob.decode("utf-8").splitlines()
        except Exception:
            errors.append(f"archive-source-unavailable: {aid}")
            lines = []
        span = out.get("source_span", {})
        span_lines = span.get("lines", [])
        if span_lines != pin.get("span_lines"):
            errors.append(f"semantic-span: {aid}")
        try:
            for item in span_lines:
                if item["line"] < 1 or lines[item["line"] - 1] != item["text"]:
                    errors.append(f"span-text-vs-base: {aid}")
                    break
        except (IndexError, KeyError, TypeError):
            errors.append(f"span-line-ref: {aid}")
        span_hash = hashlib.sha256("\n".join(x.get("text", "") for x in span_lines).encode()).hexdigest()
        if span_hash != pin.get("span_sha256") or span_hash != span.get("line_text_sha256"):
            errors.append(f"span-hash: {aid}")

        classification = out.get("classification", {})
        category = classification.get("category")
        products = classification.get("candidate_products")
        phases = out.get("phase", {}).get("candidate_phase_targets")
        if category != pin.get("category"):
            errors.append(f"classification-category: {aid}")
        if products != pin.get("candidate_products"):
            errors.append(f"candidate-products: {aid}")
        if phases != pin.get("candidate_phase_targets") or "PHCAP-07" not in (phases or []):
            errors.append(f"candidate-phases: {aid}")
        if not set(src.get("candidate_phase_targets", [])) <= set(phases or []):
            errors.append(f"bootstrap-phase-candidates-dropped: {aid}")
        if out.get("authority_boundary") != EXPECTED_AUTHORITY or pin.get("authority_boundary") != EXPECTED_AUTHORITY:
            errors.append(f"authority-boundary: {aid}")
        if out.get("phase", {}).get("candidate_phase_evidence", {}).get("phase_admission") != "not_admitted":
            errors.append(f"phase-admission: {aid}")
        if classification.get("direct_counterevidence") != []:
            errors.append(f"unsupported-counterevidence-claim: {aid}")
        if out.get("implementation_and_degradation", {}).get("test_execution_status") != "not_run":
            errors.append(f"test-execution-boundary: {aid}")
        if out.get("failure_and_consumer", {}).get("consumer_closure_status") != "pending":
            errors.append(f"consumer-closure-boundary: {aid}")
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ledger", type=Path, default=LEDGER)
    parser.add_argument("--manifest", type=Path, default=MANIFEST)
    args = parser.parse_args()
    errors = validate(args.ledger, args.manifest)
    if errors:
        print("SCF-B-0148 static validation failed:")
        print("\n".join(f"- {e}" for e in errors))
        raise SystemExit(1)
    print("SCF-B-0148 static validation passed: 52 IDs, paths, source digests, semantic spans, categories, products, phases, authority and evidence boundaries")


if __name__ == "__main__":
    main()
