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
INVENTORY = ROOT / "inventory.json"
BINDING = ROOT.parent / "bindings/SCF-B-0148.json"
BOOTSTRAP = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
SELECTION_RULE = "bootstrap source_path under docs/test-design/helix/, candidate_phase_targets contains PHCAP-07, basename contains worker or workflow"
EXPECTED_AUTHORITY = {
    "authority_effect": "none",
    "legacy_execution_performed": False,
    "formal_asset_classification_updated": False,
    "phase_updated": False,
    "successor_assigned": False,
    "new_build_allowed": False,
}
MANIFEST_KEYS = {"schema_revision", "binding_id", "base_revision", "selection_rule", "expected_selected_count", "ledger_sha256", "rows"}
MANIFEST_ROW_KEYS = {"asset_id", "source_path", "source_sha256", "span_lines", "span_sha256", "category", "candidate_products", "candidate_phase_targets", "authority_boundary", "record_sha256"}
INVENTORY_KEYS = {
    "schema_revision", "binding_id", "base_revision", "base_source_mode", "scope", "fixed_inputs", "parent_pairs",
    "classification_method", "candidate_product_counts", "classification_counts", "cohort_denominator", "evidence_limits",
    "web_product_assessment", "authority_boundary", "selection_source_revision", "existing_research_union",
    "main_union_components", "base_evolution", "current_comparison_main_revision", "open_pr_comparison",
    "current_main_comparison_inputs", "overlap_detail", "static_validator", "artifacts",
}
INVENTORY_AUTHORITY = {
    "authority_effect": "none", "formal_asset_classification_updated": False, "formal_implementation_status": "unknown",
    "formal_product_authority": None, "phase_updated": False, "successor_assignment": None,
    "new_build_allowed": False, "legacy_execution_performed": False,
}
BINDING_KEYS = {
    "schema_revision", "id", "kind", "title", "product", "owner_candidate", "state", "reason", "upstream", "role",
    "obligations", "connections", "operations", "artifacts", "verification", "replacement", "created", "updated",
}
EXPECTED_ALLOWED = [
    "read pinned Git/archive blobs statically",
    "write classification ledger, inventory, README, and draft summary in scaffold namespace",
    "run scfctl and diff check",
    "run the pinned static validator and its negative self-check",
]
EXPECTED_FORBIDDEN = [
    "execute archive source/runtime/test/CI/workflow/hook/adapter",
    "update formal disposition or phase ledger",
    "infer test PASS/implementation from test design or citation",
    "promote product/phase/successor/implementation/consumer status",
    "merge/close/push/deploy",
    "旧archiveは実行しない",
]


def git_bytes(revision, path):
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], stderr=subprocess.DEVNULL)


def jsonl_bytes(data):
    return [json.loads(line) for line in data.decode("utf-8").splitlines() if line.strip()]


def canonical_sha(value):
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def upstream_hash(binding, path):
    matches = [row.get("sha256") for row in binding.get("upstream", []) if row.get("path") == path]
    return matches[0] if len(matches) == 1 else None


def validate(ledger_path=LEDGER, manifest_path=MANIFEST, inventory_path=INVENTORY, binding_path=BINDING):
    errors = []
    try:
        ledger_bytes = Path(ledger_path).read_bytes()
        manifest_bytes = Path(manifest_path).read_bytes()
        inventory_bytes = Path(inventory_path).read_bytes()
        binding_bytes = Path(binding_path).read_bytes()
        manifest = json.loads(manifest_bytes)
        records = jsonl_bytes(ledger_bytes)
        inventory = json.loads(inventory_bytes)
        binding = json.loads(binding_bytes)
        bootstrap = jsonl_bytes(git_bytes(BASE, BOOTSTRAP))
    except Exception as exc:
        return [f"input-read: {exc}"]

    if set(manifest) != MANIFEST_KEYS:
        errors.append("manifest-keyset: expected exact fixed manifest fields")
    if manifest.get("schema_revision") != 1 or manifest.get("base_revision") != BASE or manifest.get("binding_id") != "SCF-B-0148" or manifest.get("expected_selected_count") != 52 or manifest.get("selection_rule") != SELECTION_RULE:
        errors.append("manifest-pinning: unexpected schema/base/binding/count/selection rule")
    if hashlib.sha256(ledger_bytes).hexdigest() != manifest.get("ledger_sha256"):
        errors.append("ledger-byte-digest: ledger bytes differ from pinned manifest")
    if set(inventory) != INVENTORY_KEYS:
        errors.append("inventory-keyset: unexpected/missing top-level field")
    if canonical_sha(inventory.get("authority_boundary")) != canonical_sha(INVENTORY_AUTHORITY):
        errors.append("inventory-authority: authority boundary differs from fixed no-effect contract")
    if inventory.get("binding_id") != "SCF-B-0148" or inventory.get("base_revision") != BASE:
        errors.append("inventory-pinning: unexpected binding/base")
    if set(binding) != BINDING_KEYS:
        errors.append("binding-keyset: unexpected/missing top-level field")
    if binding.get("id") != "SCF-B-0148" or binding.get("kind") != "scaffold" or binding.get("state") != "registered" or binding.get("owner_candidate") != "四製品境界候補研究（正式owner未決）":
        errors.append("binding-state: binding identity/state/owner-candidate boundary changed")
    operations = binding.get("operations", {})
    if set(operations) != {"allowed", "forbidden"} or operations.get("allowed") != EXPECTED_ALLOWED:
        errors.append("binding-allowed: unexpected allowed operation or operation key")
    if operations.get("forbidden") != EXPECTED_FORBIDDEN:
        errors.append("binding-forbidden: forbidden operation boundary changed")
    if binding.get("replacement") != {"role_target": None, "formal_artifacts": [], "issue": 0, "status": "pending"}:
        errors.append("binding-replacement: formal replacement/status changed")
    if binding.get("verification", {}).get("scope") != ["schema_interface", "source_revision_stale", "negative_case", "forbidden_write_scope"]:
        errors.append("binding-verification-scope: unsupported authority/verification scope")

    # Cross-check the three mutable artifacts against the immutable digest pins in the binding.
    for label, path, payload in (
        ("ledger", "scaffold/legacy-test-design-worker-workflow-0148/classification-research.jsonl", ledger_bytes),
        ("manifest", "scaffold/legacy-test-design-worker-workflow-0148/selection-manifest.json", manifest_bytes),
        ("inventory", "scaffold/legacy-test-design-worker-workflow-0148/inventory.json", inventory_bytes),
    ):
        pinned = upstream_hash(binding, path)
        actual = hashlib.sha256(payload).hexdigest()
        if pinned is None or pinned != actual:
            errors.append(f"binding-upstream-digest: {label} is not uniquely pinned to these bytes")

    selected = [r for r in bootstrap if r.get("source_path", "").startswith("docs/test-design/helix/")
                and "PHCAP-07" in r.get("candidate_phase_targets", [])
                and any(s in Path(r["source_path"]).name.lower() for s in ("worker", "workflow"))]
    by_id = {r["asset_id"]: r for r in selected}
    expected_rows = manifest.get("rows", [])
    if any(not isinstance(row, dict) or set(row) != MANIFEST_ROW_KEYS for row in expected_rows):
        errors.append("manifest-row-keyset: expected exact row fields")
    expected = {r["asset_id"]: r for r in expected_rows if isinstance(r, dict) and "asset_id" in r}
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
        if canonical_sha(out) != pin.get("record_sha256"):
            errors.append(f"record-object-digest: {aid} differs from pinned canonical full record")
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
        products = classification.get("candidate_products")
        phases = out.get("phase", {}).get("candidate_phase_targets")
        if classification.get("category") != pin.get("category"):
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
    parser.add_argument("--inventory", type=Path, default=INVENTORY)
    parser.add_argument("--binding", type=Path, default=BINDING)
    args = parser.parse_args()
    errors = validate(args.ledger, args.manifest, args.inventory, args.binding)
    if errors:
        print("SCF-B-0148 static validation failed:")
        print("\n".join(f"- {e}" for e in errors))
        raise SystemExit(1)
    print("SCF-B-0148 static validation passed: 52 canonical records, pinned ledger bytes, source spans, classifications, phases and authority boundaries")


if __name__ == "__main__":
    main()
