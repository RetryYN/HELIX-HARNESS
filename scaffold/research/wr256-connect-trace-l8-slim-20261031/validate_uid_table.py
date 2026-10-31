#!/usr/bin/env python3
"""Static WR256 U-ID/source/count/cap audit; never evaluates L4/L5 algorithms."""
from __future__ import annotations

import argparse
import json
import re
import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "c14adddf2678c7a69d76420c451df3f05b1251ab"
L3 = "docs/helix-connect/L3-requirements/functional-requirements.json"
L4 = "docs/helix-connect/L4-basic-design/technical-trace-handoff-custody.json"
L5 = "docs/helix-connect/L5-detail-design/technical-trace-handoff-custody.json"
L8 = "docs/helix-connect/L8-unit-verification/technical-trace-handoff-custody.json"
L9 = "docs/helix-connect/L9-integration-verification/technical-trace-handoff-custody.json"
L10 = "docs/helix-connect/L10-verification/functional-verification.json"


def source_json(path: str) -> dict:
    return json.loads(subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT))


def pointer(doc, ptr):
    value = doc
    if ptr in ("", "/"):
        return value
    for raw in ptr.lstrip("/").split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def patch_value(doc, operations):
    """Apply only the fixed overlay operations needed to summarize a probe expectation."""
    import copy

    result = copy.deepcopy(doc)
    for operation in operations:
        parts = operation["path"].strip("/").split("/")
        target = result
        for raw in parts[:-1]:
            token = raw.replace("~1", "/").replace("~0", "~")
            target = target[int(token)] if isinstance(target, list) else target[token]
        raw = parts[-1]
        key = int(raw) if isinstance(target, list) else raw.replace("~1", "/").replace("~0", "~")
        if operation["op"] in ("replace", "add"):
            target[key] = operation["value"]
        elif operation["op"] == "remove":
            del target[key]
        else:
            raise ValueError(f"unsupported fixed expectation patch operation: {operation['op']}")
    return result


def scalar_text(value):
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, (str, int, float)):
        return str(value)
    return None


def project_structure(value):
    """Keep result field names and order while excluding raw fixture values."""
    if isinstance(value, dict):
        return {key: project_structure(item) for key, item in value.items()}
    if isinstance(value, list):
        return {"$array": {str(index): project_structure(item) for index, item in enumerate(value)}}
    return value


def result_map_text(label, value):
    """Return named result fields as structure, never a field-count placeholder."""
    return project_structure(value)


def failure_reasons_text(items):
    if not items:
        return "failure_reasons=[]"
    values = []
    for item in items:
        if not isinstance(item, dict):
            continue
        fields = [str(item[key]) for key in ("area", "field", "result") if item.get(key) is not None]
        if item.get("return_owner") is not None:
            fields.append("owner=" + str(item["return_owner"]))
        values.append("/".join(fields))
    return "failure_reasons=[" + "; ".join(values) + "]"


def expected_summary(expected, function_ref):
    """Project source outcome distinctions into a compact structured expectation."""
    result = {}
    if function_ref.endswith("F01"):
        for key in ("history_prefix_result", "submitted_sequence_result", "missing_original_event_ids", "original_order_known_in_fixture", "original_predecessor_chain_corresponds", "retained_original_result_state", "result_content_result", "candidate_trace_state", "business_completion", "claim_results"):
            if key in expected:
                result[key] = project_structure(expected[key])
    elif function_ref.endswith("F02"):
        for key in ("content_results", "handoff_target_results", "unfinished_target_results"):
            if key in expected:
                result[key] = result_map_text(key, expected[key])
        for key in ("unfinished_link_result", "stop_link_result", "receipt_link_result", "resolution_link_result", "handoff_receipt_generates_resolution", "business_completion", "candidate_handoff_state", "claim_results"):
            if key in expected:
                result[key] = project_structure(expected[key])
        for key in ("retained_prior_successes", "retained_unfinished", "retained_handoff", "retained_handoff_receipt", "retained_resolution"):
            if key not in expected:
                continue
            value = expected[key]
            if value is None or isinstance(value, (bool, int, str)):
                result[key] = value
            elif isinstance(value, list):
                result[key] = "all original items retained" if value else "no original items"
            elif isinstance(value, dict):
                result[key] = "original record retained" if value else "no original record"
    else:
        for key in ("trace_target_results", "trace_reference_results", "custody_reference_results"):
            if key in expected:
                result[key] = result_map_text(key, expected[key])
        for key in ("trace_custody_data_use_result", "payload_persistence_required_for_trace", "classification_retention_deletion_authority", "candidate_reference_state", "claim_results"):
            if key in expected:
                result[key] = project_structure(expected[key])
        for key in ("outside_reference_fields", "forbidden_value_field_names"):
            if key in expected:
                result[key] = project_structure(expected[key])
    if "failure_reasons" in expected:
        result["failure_reasons"] = failure_reasons_text(expected["failure_reasons"])
    effects = expected.get("effects")
    if isinstance(effects, dict):
        result["effects"] = {key: value for key, value in effects.items() if key.startswith("actual_")}
    return result


def flatten_projection(value, prefix=""):
    """Flatten only object structure; values remain semantic result leaves."""
    if isinstance(value, dict) and value:
        result = {}
        for key, item in value.items():
            escaped = str(key).replace("~", "~0").replace("/", "~1")
            result.update(flatten_projection(item, prefix + "/" + escaped))
        return result
    return {prefix: value}


def display_path(path):
    return path.lstrip("/").replace("/$array/", "[").replace("/$array", "[]").replace("/", ".").replace("~1", "/").replace("~0", "~")


def concise_expected_label(group, sets, removes):
    """Render one primary row-specific semantic outcome; detailed source audit stays in scaffold."""
    if group == "independent_cross_field_probe":
        raise ValueError("typed cross-field expectations are generated from the typed input literal")
    failure = sets.get("/failure_reasons")
    if isinstance(failure, str) and failure != "failure_reasons=[]":
        body = failure.removeprefix("failure_reasons=[").removesuffix("]")
        primary = body.split("; ", 1)[0]
        return "期待: source failure " + primary + "."
    candidates = []
    for path, value in sets.items():
        leaf = path.rsplit("/", 1)[-1]
        if path == "/claim_results" and value is None:
            candidates.append((1, "claim結果はnull（未解釈）"))
            continue
        if leaf in ("actual_authority", "actual_operation", "actual_implementation_ready", "actual_acceptance", "actual_business_completion", "actual_transmission", "actual_storage", "actual_append") or leaf == "business_completion":
            continue
        priority = 0 if leaf in ("candidate_trace_state", "candidate_handoff_state", "candidate_reference_state") else 1
        shown = json.dumps(value, ensure_ascii=False, separators=(",", ":")) if isinstance(value, (dict, list)) else str(value)
        candidates.append((priority, f"{display_path(path)}={shown}"))
    for path in removes:
        leaf = path.rsplit("/", 1)[-1]
        if leaf not in ("actual_authority", "actual_operation", "actual_implementation_ready", "actual_acceptance", "actual_business_completion", "actual_transmission", "actual_storage", "actual_append", "business_completion"):
            candidates.append((2, f"{display_path(path)} absent"))
    candidates.sort(key=lambda item: (item[0], item[1]))
    if not candidates:
        raise ValueError("row has no concise unique semantic deviation")
    labels = [item[1] for item in candidates[:2]]
    return "期待: " + "; ".join(labels) + "."


def failure_rule_condition_witness(function_name, rule_index, projection):
    field_groups = {
        "F01": {
            0: ("failure_reasons",), 1: ("failure_reasons",), 2: ("missing_original_event_ids",),
            3: ("original_order_known_in_fixture",), 4: ("original_predecessor_chain_corresponds",),
            5: ("failure_reasons",), 6: ("submitted_sequence_result",), 7: ("failure_reasons",),
            8: ("failure_reasons",), 9: ("history_prefix_result",),
        },
        "F02": {
            0: ("content_results", "failure_reasons"), 1: ("handoff_target_results",),
            2: ("unfinished_target_results",), 3: ("stop_link_result",), 4: ("unfinished_link_result",),
            5: ("receipt_link_result", "resolution_link_result"), 6: ("failure_reasons",),
            7: ("candidate_handoff_state", "failure_reasons"), 8: ("candidate_handoff_state", "failure_reasons"),
            9: ("unfinished_target_results", "failure_reasons"),
        },
        "N01": {
            0: ("trace_target_results",), 1: ("custody_reference_results",), 2: ("trace_custody_data_use_result",),
            3: ("trace_reference_results",), 4: ("outside_reference_fields",),
            5: ("payload_persistence_required_for_trace",), 6: ("forbidden_value_field_names",),
        },
    }
    names = field_groups[function_name][rule_index]
    return {name: projection[name] for name in names if name in projection}


def cross_field_expected_label(value):
    literal = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"期待: original_prior_successes={literal}を空配列へ強制変換しない。"


def parse_failure_reason_projection(projection):
    """Decode the compact source audit failure list without inferring execution."""
    encoded = projection.get("failure_reasons", "failure_reasons=[]")
    if encoded == "failure_reasons=[]":
        return []
    body = encoded.removeprefix("failure_reasons=[").removesuffix("]")
    results = []
    for item in body.split("; "):
        parts = item.split("/")
        if len(parts) < 3:
            raise ValueError(f"malformed source failure reason: {item}")
        results.append({
            "area": parts[0], "field": parts[1], "result": parts[2],
            "owner": "/".join(parts[3:]).removeprefix("owner=") if len(parts) > 3 else None,
        })
    return results


def failure_rule_emissions(function_name, rule_index, projection):
    """Return source-expected emissions that demonstrate a fixed L5 rule branch.

    This is a static semantic correspondence check: the source expected material
    supplies the observed finding; L5 when and emit text remain the authority. It
    does not evaluate the L4/L5 implementation or claim the case was executed.
    """
    emissions = parse_failure_reason_projection(projection)
    matches = {
        "F01": {
            0: lambda x: x["area"].startswith("event_target_") and x["result"] in {"missing", "unknown_original_information", "content_conflict"},
            1: lambda x: x["area"].startswith("event_content_") and x["result"] in {"missing", "unknown_original_information", "content_conflict"},
            2: lambda x: x["area"] == "needed_events" and x["field"] == "identities" and x["result"] == "missing_original_events",
            3: lambda x: x["area"] == "event_order" and x["result"] == "unknown_or_conflicting_order" and projection.get("original_order_known_in_fixture") is False,
            4: lambda x: x["area"] == "event_order" and x["result"] == "unknown_or_conflicting_order" and projection.get("original_predecessor_chain_corresponds") is False,
            5: lambda x: x["area"] == "submitted_event_identity" and x["result"] == "duplicate_event_identity",
            6: lambda x: x["area"] == "submitted_sequence" and x["result"] == "content_conflict" and projection.get("submitted_sequence_result") not in {None, "content_corresponding_in_fixture"},
            7: lambda x: x["area"].startswith("event_observation_") and x["field"] == "endpoint" and x["result"] == "unknown_observation_location",
            8: lambda x: x["area"] == "input_domain" and x["result"] == "unknown_original_information" and x["field"] in {"original_events", "original_needed_event_ids"},
            9: lambda x: x["area"] == "history_prefix" and x["field"] == "events" and x["result"] in {"content_conflict", "unknown_original_information"} and projection.get("history_prefix_result") not in {None, "content_corresponding_in_fixture"},
        },
        "F02": {
            0: lambda x: x["area"] in {"stop_content", "prior_successes_content", "unfinished_content", "handoff_content", "receipt_content", "resolution_content"} and x["field"] == "record" and x["result"] in {"missing", "unknown_original_information", "content_conflict"},
            1: lambda x: x["area"] == "handoff_target" and x["result"] != "content_corresponding_in_fixture",
            2: lambda x: x["area"].startswith("unfinished_target_") and x["result"] != "content_corresponding_in_fixture",
            3: lambda x: x["area"] == "stop_link" and x["result"] != "content_corresponding_in_fixture",
            4: lambda x: x["area"] == "unfinished_link" and x["result"] != "content_corresponding_in_fixture",
            5: lambda x: x["area"] in {"receipt_link", "resolution_link"} and x["result"] != "content_corresponding_in_fixture",
            6: lambda x: x["area"] == "input_domain" and x["result"] in {"missing", "unknown_original_information"},
            7: lambda x: x["area"] == "stop_state" and x["field"] == "current_state" and x["result"] == "unsupported_completion_for_stop",
            8: lambda x: x["area"] == "stop_state" and x["field"] == "cause" and x["result"] == "unknown_original_information",
            9: lambda x: x["area"] == "unfinished_required_by_stop" and x["field"] == "unfinished" and x["result"] == "missing",
        },
        "N01": {
            0: lambda x: x["area"] == "trace_target" and x["owner"] == "connection-operation-owner",
            1: lambda x: x["area"] == "custody_reference_content" and x["owner"] == "source-consumer-owner/HELIX-SECURITY",
            2: lambda x: x["area"] == "trace_custody_binding" and x["field"] == "data_use_ref" and x["owner"] == "source-consumer-owner/HELIX-SECURITY",
            3: lambda x: x["area"] == "trace_reference_content" and x["owner"] == "connection-operation-owner",
            4: lambda x: x["area"] == "trace_fields" and x["result"] == "outside_value_free_reference_contract" and x["owner"] == "source-consumer-owner/HELIX-SECURITY",
            5: lambda x: x["area"] == "payload_persistence" and x["field"] == "required" and x["result"] == "not_a_trace_requirement" and x["owner"] == "source-consumer-owner/HELIX-SECURITY",
            6: lambda x: x["area"] == "trace_values" and x["result"] == "nonpublic_value_field_forbidden" and x["owner"] == "source-consumer-owner/HELIX-SECURITY",
        },
    }
    return [item for item in emissions if matches[function_name][rule_index](item)]


EVIDENCE_DIR = "scaffold/research/wr256-connect-trace-l8-slim-20261031/evidence/records"
def verify_evidence_lineage(failures, verify_current=True):
    """Check first-path restoration and immutable historical/current evidence pins."""
    research = ROOT / "scaffold/research/wr256-connect-trace-l8-slim-20261031"
    evidence = research / "evidence"
    history = json.loads((evidence / "evidence-history.json").read_text(encoding="utf-8"))
    addendum = json.loads((evidence / "evidence-history-addendum-20261101-r6.json").read_text(encoding="utf-8"))
    summary_path = "scaffold/research/wr256-connect-trace-l8-slim-20261031/verification-summary.json"
    audit_path = "scaffold/research/wr256-connect-trace-l8-slim-20261031/source-semantic-audit.json"
    expected = {
        summary_path: ["4e2995c454b84f73b5e12d46e807a4b26831630b", "ace8a529d005f3854086c40e7c5967ba73e43da8", "684fa076bdbc7c586d60d04b8208fa4bb6a463fd", "2cbadcd2d175560860fce632d12810f5d0101ef1", "80e69e6f2ab1fe147ad132d0f76e5567b4b5d284", "32794e1ca8ce4f4f7508533992b69fcff4e669b0"],
        audit_path: ["684fa076bdbc7c586d60d04b8208fa4bb6a463fd", "2cbadcd2d175560860fce632d12810f5d0101ef1", "80e69e6f2ab1fe147ad132d0f76e5567b4b5d284", "32794e1ca8ce4f4f7508533992b69fcff4e669b0"],
    }
    expected_checkpoints = list(dict.fromkeys(expected[summary_path][1:] + expected[audit_path][1:]))
    actual_checkpoints = [item.get("revision") for item in history.get("checkpoints", [])]
    if actual_checkpoints != expected_checkpoints:
        failures.append({"check": "append_only_evidence_checkpoint_sequence", "expected": expected_checkpoints, "actual": actual_checkpoints})

    def verify_pinned_blob(commit, path, pin, label):
        try:
            data = subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)
            blob = subprocess.check_output(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, text=True).strip()
            actual_sha = hashlib.sha256(data).hexdigest()
            if pin.get("git_blob") != blob or pin.get("sha256") != actual_sha or pin.get("bytes") != len(data):
                failures.append({"check": "historical_evidence_blob_pin", "label": label, "expected_blob": blob, "actual_blob": pin.get("git_blob"), "expected_sha256": actual_sha, "actual_sha256": pin.get("sha256")})
            return data
        except Exception as exc:
            failures.append({"check": "historical_evidence_blob_resolution", "label": label, "error": str(exc)})
            return None

    for path, commits in expected.items():
        kind = "verification-summary" if path == summary_path else "source-semantic-audit"
        first_commit = commits[0]
        first_pin = history.get("initial_path_snapshots", {}).get(Path(path).name, {})
        data = verify_pinned_blob(first_commit, path, first_pin, f"initial:{kind}")
        actual_path_bytes = (ROOT / path).read_bytes()
        if data is not None and (hashlib.sha256(actual_path_bytes).digest() != hashlib.sha256(data).digest()):
            failures.append({"check": "initial_evidence_path_restored", "path": path, "expected_sha256": hashlib.sha256(data).hexdigest(), "actual_sha256": hashlib.sha256(actual_path_bytes).hexdigest()})
        for commit in commits[1:]:
            entry_path = evidence / "checkpoints" / f"{commit}.json"
            checkpoint = json.loads(entry_path.read_text(encoding="utf-8"))
            if checkpoint.get("revision") != commit:
                failures.append({"check": "evidence_checkpoint_revision", "path": str(entry_path.relative_to(ROOT)), "expected": commit, "actual": checkpoint.get("revision")})
            pin = checkpoint.get("artifacts", {}).get(kind, {})
            verify_pinned_blob(commit, path, pin, f"checkpoint:{commit}:{kind}")

    record_info = addendum.get("current_immutable_record", {})
    if verify_current:
        record_id = record_info.get("record_id")
        record_dir = evidence / "records" / record_id
        manifest_path = record_dir / "record.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for field in ("record_id", "validator_sha256", "artifacts"):
            if manifest.get(field) != record_info.get(field):
                failures.append({"check": "current_record_manifest_matches_addendum", "field": field})
        for artifact in manifest.get("artifacts", {}).values():
            path = ROOT / artifact["path"]
            data = path.read_bytes()
            if hashlib.sha256(data).hexdigest() != artifact.get("sha256") or len(data) != artifact.get("bytes"):
                failures.append({"check": "current_record_artifact_pin", "path": artifact["path"]})

    dispositions = {entry["path"]: entry for entry in addendum.get("full_projection_copy_disposition", [])}
    prior_record = addendum.get("prior_r1_record_manifest", {})
    prior_manifest_path = research / prior_record.get("path", "")
    prior_manifest_bytes = prior_manifest_path.read_bytes()
    if hashlib.sha256(prior_manifest_bytes).hexdigest() != prior_record.get("sha256"):
        failures.append({"check": "previous_record_manifest_pin", "path": str(prior_manifest_path.relative_to(ROOT))})
    prior_manifest = json.loads(prior_manifest_bytes)

    def verify_record_artifact(artifact, label):
        artifact_path = ROOT / artifact["path"]
        if artifact_path.exists():
            artifact_bytes = artifact_path.read_bytes()
            actual_sha = hashlib.sha256(artifact_bytes).hexdigest()
            if actual_sha != artifact.get("sha256") or len(artifact_bytes) != artifact.get("bytes"):
                failures.append({"check": "record_artifact_pin", "label": label, "path": artifact["path"]})
            return
        disposition = dispositions.get(artifact["path"])
        if not disposition or disposition.get("status") != "removed_redundant_full_projection_copy":
            failures.append({"check": "missing_record_artifact_without_disposition", "label": label, "path": artifact["path"]})
            return
        try:
            restored_bytes = subprocess.check_output(["git", "show", f"{disposition['recovery_source_revision']}:{disposition['recovery_source_path']}"], cwd=ROOT)
            restored_sha = hashlib.sha256(restored_bytes).hexdigest()
            if restored_sha != artifact.get("sha256") or restored_sha != disposition.get("sha256") or len(restored_bytes) != disposition.get("former_bytes"):
                failures.append({"check": "disposed_record_artifact_recovery_pin", "label": label, "path": artifact["path"], "sha256": restored_sha})
            blob = subprocess.check_output(["git", "rev-parse", f"b35c131639ba2f93fa764642497d0fa49d695275:{disposition['path']}"], cwd=ROOT, text=True).strip()
            if blob != disposition.get("b35c_git_blob"):
                failures.append({"check": "disposed_copy_git_blob_object_present", "label": label, "blob": disposition.get("b35c_git_blob")})
        except Exception as exc:
            failures.append({"check": "disposed_record_artifact_recovery", "label": label, "error": str(exc)})

    for artifact in prior_manifest.get("artifacts", {}).values():
        verify_record_artifact(artifact, "previous_r1")

    prior_current = addendum.get("prior_r2_record_manifest", {})
    prior_current_path = research / prior_current.get("path", "")
    prior_current_bytes = prior_current_path.read_bytes()
    if hashlib.sha256(prior_current_bytes).hexdigest() != prior_current.get("sha256"):
        failures.append({"check": "previous_r2_record_manifest_pin", "path": str(prior_current_path.relative_to(ROOT))})
    prior_current_manifest = json.loads(prior_current_bytes)
    for artifact in prior_current_manifest.get("artifacts", {}).values():
        verify_record_artifact(artifact, "previous_r2")

    previous_currents = addendum.get("previous_current_record_manifests", [addendum.get("previous_current_record_manifest", {})])
    for index, previous_current in enumerate(previous_currents):
        previous_current_path = research / previous_current.get("path", "")
        previous_current_bytes = previous_current_path.read_bytes()
        if hashlib.sha256(previous_current_bytes).hexdigest() != previous_current.get("sha256"):
            failures.append({"check": "previous_current_record_manifest_pin", "index": index, "path": str(previous_current_path.relative_to(ROOT))})
        previous_current_manifest = json.loads(previous_current_bytes)
        for artifact in previous_current_manifest.get("artifacts", {}).values():
            verify_record_artifact(artifact, f"previous_current_{index}")

    for disposition in dispositions.values():
        removed_path = ROOT / disposition["path"]
        if removed_path.exists():
            failures.append({"check": "redundant_full_projection_copy_absent", "path": disposition["path"]})
        try:
            copy_bytes = subprocess.check_output(["git", "show", f"b35c131639ba2f93fa764642497d0fa49d695275:{disposition['path']}"], cwd=ROOT)
            blob = subprocess.check_output(["git", "rev-parse", f"b35c131639ba2f93fa764642497d0fa49d695275:{disposition['path']}"], cwd=ROOT, text=True).strip()
            if hashlib.sha256(copy_bytes).hexdigest() != disposition.get("sha256") or blob != disposition.get("b35c_git_blob"):
                failures.append({"check": "removed_copy_disposition_git_pin", "path": disposition["path"]})
        except Exception as exc:
            failures.append({"check": "removed_copy_disposition_blob_resolution", "path": disposition.get("path"), "error": str(exc)})


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Static WR256 U-ID and immutable evidence comparison")
    parser.add_argument("--record", action="store_true", help="write a new immutable evidence record; requires a never-used --record-id")
    parser.add_argument("--record-id", help="unique immutable record directory name (exclusive creation)")
    args = parser.parse_args(argv)
    if args.record and not args.record_id:
        parser.error("--record requires --record-id")
    if not args.record and args.record_id:
        parser.error("--record-id is only valid with --record")
    if args.record and not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,127}", args.record_id):
        parser.error("--record-id must be a simple unique filename token")
    lineage_path = ROOT / "scaffold/research/wr256-connect-trace-l8-slim-20261031/evidence/evidence-history-addendum-20261101-r6.json"
    lineage_record_id = json.loads(lineage_path.read_text(encoding="utf-8"))["current_immutable_record"]["record_id"]
    record_id = args.record_id if args.record else lineage_record_id
    record_dir = ROOT / EVIDENCE_DIR / record_id
    if args.record and record_dir.exists():
        parser.error(f"immutable evidence record already exists: {record_dir}")
    current = json.loads((ROOT / L8).read_text(encoding="utf-8"))
    old8, l5, l9 = source_json(L8), source_json(L5), source_json(L9)
    l10_functional = source_json(L10)
    l10_nfr = source_json("docs/helix-connect/L10-verification/nfr-verification.json")
    l3_nfr = source_json("docs/helix-connect/L3-requirements/nfr-grade.json")
    l4 = source_json(L4)
    rows = current.get("unit_cases", [])
    counts = {"L9_basic_branch": 90, "local_domain_probe": 61, "independent_semantic_probe": 68, "independent_cross_field_probe": 5}
    observed = {kind: sum(row.get("source_kind") == kind for row in rows) for kind in counts}
    failures = []
    verify_evidence_lineage(failures, verify_current=not args.record)

    preserved_top_level = (
        "parent", "source_main", "scope", "full_goal_scope_preserved", "implementation_readiness",
        "authority_effect", "operation_effect", "source_pin_limit", "status", "approval_basis",
        "upstream_pins", "document_id", "layer", "layer_id", "pair", "pair_id", "design_ref",
        "integration_ref", "source_pair_pins", "fixture_coverage_limits",
        "unresolved", "approved_document_pins", "source_revision_roles",
    )
    changed_boundary_fields = [key for key in preserved_top_level if current.get(key) != old8.get(key)]
    if changed_boundary_fields:
        failures.append({"check": "existing_boundary_and_unverified_state_preserved", "fields": changed_boundary_fields})
    expected_oracle_pin = {key: old8.get("preserved_l9_oracle", {}).get(key) for key in ("path", "revision", "sha256")}
    if current.get("preserved_l9_oracle") != expected_oracle_pin:
        failures.append({"check": "l9_oracle_contains_only_path_revision_file_pin", "expected": expected_oracle_pin, "actual_keys": sorted(current.get("preserved_l9_oracle", {}))})
    expected_method = "候補U-ID表は、固定されたL3/L4/L5/L10の契約と参照されたL9/probeの反例・期待差分を対応づける。全行はnot_executed。L5 AST評価、test実行、L8 pass/fail判定は行わず、行別意味監査はscaffold/research/wr256-connect-trace-l8-slim-20261031/evidence/records/wr256-pr4006-r1-r4-20261101/source-semantic-audit.jsonに記録する。"
    if current.get("method") != expected_method:
        failures.append({"check": "method_matches_static_candidate_role_and_unexecuted_boundary"})

    l4_contracts = {item["id"]: item for item in l4["contracts"]}
    l3_requirements = {item["id"]: item for item in source_json(L3)["requirements"]}
    l3_requirements.update({item["id"]: item for item in l3_nfr["requirements"]})
    l10_cases = {item["id"]: item for item in l10_functional["cases"]}
    l10_cases.update({item["id"]: item for item in l10_nfr["cases"]})
    output_literals = l5["output_literals"]
    claim_presence_semantics = l5.get("result_domain_contract", {}).get("input_presence_domains", "")
    if "claim_results（未解釈）" not in claim_presence_semantics or "null/Absent" not in claim_presence_semantics:
        failures.append({"check": "explicit_null_claim_result_label_grounded_in_fixed_l5_domain_contract"})
    expected_contract_outcomes = {
        "qualification_boundary": {
            "authority_effect": l4["authority_effect"],
            "operation_effect": l4["operation_effect"],
            "actual_effects_false": {field: False for field in output_literals["effects_false_fields"]},
            "qualification_rule": l4_contracts["HELIXCONNECT-L4-005-F01"]["qualification_rule"],
        },
        "functions": {}
    }
    for suffix in ("F01", "F02", "N01"):
        requirement_id = f"HELIXCONNECT-L3-005-{suffix}"
        design = l4_contracts[f"HELIXCONNECT-L4-005-{suffix}"]
        oracle = l10_cases[f"HELIXCONNECT-L10-005-{suffix}"]
        expected_contract_outcomes["functions"][suffix] = {
            "requirement_ref": requirement_id,
            "requirement_obligation": l3_requirements[requirement_id]["obligation"],
            "l4_output_meanings": design["output_meanings"],
            "l5_fixed_outputs": l5["branch_tables"][suffix]["fixed_outputs"],
            "l10_expected_observation": oracle["expected_observation"],
            "l10_failure_observation": oracle["failure_observation"],
        }
    if current.get("contract_outcome_boundaries") != expected_contract_outcomes:
        failures.append({"check": "short_contract_outcome_boundaries_match_L3_L4_L5_L10"})

    if len(rows) != 224 or observed != counts:
        failures.append({"check": "source_row_counts", "expected": {"total": 224, **counts}, "actual": {"total": len(rows), **observed}})
    if len({row.get("u_id") for row in rows}) != len(rows):
        failures.append({"check": "candidate_uid_uniqueness"})
    expected_uids = [f"U-CONNECT005-{i:03d}" for i in range(1, 225)]
    if [row.get("u_id") for row in rows] != expected_uids:
        failures.append({"check": "candidate_uid_sequence"})

    old_ids = []
    for oi, obligation in enumerate(l9["verification_obligations"]):
        old_ids.extend((case["id"], f"/verification_obligations/{oi}/concrete_cases/{ci}") for ci, case in enumerate(obligation["concrete_cases"]))
    probe_ids = [(x.get("probe_id") or x.get("id"), f"/local_domain_probes/cases/{i}") for i, x in enumerate(old8["local_domain_probes"]["cases"])]
    probe_ids.extend((x.get("probe_id") or x.get("id"), f"/independent_semantic_probes/{i}") for i, x in enumerate(old8["independent_semantic_probes"]))
    cross_probes = old8["cross_field_type_constraints"]["probes"]
    cross_ids = [(x["id"], f"/cross_field_type_constraints/probes/{i}") for i, x in enumerate(cross_probes)]
    expected_sources = [("L9_basic_branch", ident, L9, BASE, ptr) for ident, ptr in old_ids]
    expected_sources += [("local_domain_probe", ident, L8, BASE, ptr) for ident, ptr in probe_ids[:61]]
    expected_sources += [("independent_semantic_probe", ident, L8, BASE, ptr) for ident, ptr in probe_ids[61:]]
    expected_sources += [("independent_cross_field_probe", ident, L8, BASE, ptr) for ident, ptr in cross_ids]
    actual_sources = [(r.get("source_kind"), r.get("source_id"), r.get("source_ref", {}).get("path"), r.get("source_ref", {}).get("revision"), r.get("source_ref", {}).get("pointer")) for r in rows]
    if actual_sources != expected_sources:
        failures.append({"check": "source_id_and_order_preservation"})

    expected_whole_hashes = old8.get("preserved_l9_oracle", {}).get("whole_sha256_by_case", {})
    actual_whole_hashes = {}
    for obligation in l9["verification_obligations"]:
        for case in obligation["concrete_cases"]:
            canonical = json.dumps(case["expected_material"], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
            actual_whole_hashes[case["id"]] = hashlib.sha256(canonical).hexdigest()
    whole_hash_mismatches = [case_id for case_id, digest in actual_whole_hashes.items() if expected_whole_hashes.get(case_id) != digest]
    if len(expected_whole_hashes) != 90 or len(actual_whole_hashes) != 90 or whole_hash_mismatches:
        failures.append({"check": "l9_whole_oracle_hashes_verified_from_fixed_historical_l8", "source_revision": BASE, "expected_count": 90, "historical_hash_count": len(expected_whole_hashes), "computed_count": len(actual_whole_hashes), "mismatch_count": len(whole_hash_mismatches), "sample": whole_hash_mismatches[:5]})

    def source_projection(row):
        kind = row["source_kind"]
        if kind == "L9_basic_branch":
            expected = pointer(l9, row["expected_ref"]["pointer"])
            group = row["target"]["function_ref"].rsplit("-", 1)[-1]
            return group, expected_summary(expected, row["target"]["function_ref"])
        if kind == "local_domain_probe":
            index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
            probe = old8["local_domain_probes"]["cases"][index]
            expected = patch_value(pointer(l9, probe["expected_base_ref"]["pointer"]), probe["expected_whole_overlay"])
            group = row["target"]["function_ref"].rsplit("-", 1)[-1]
            return group, expected_summary(expected, row["target"]["function_ref"])
        if kind == "independent_semantic_probe":
            index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
            probe = old8["independent_semantic_probes"][index]
            group = row["target"]["function_ref"].rsplit("-", 1)[-1]
            return group, expected_summary(probe["expected_whole"], row["target"]["function_ref"])
        index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
        probe = cross_probes[index]
        return "independent_cross_field_probe", probe["expected_constraints"]

    source_projections = {}
    grouped = {}
    for row in rows:
        try:
            group, projection = source_projection(row)
            source_projections[row["u_id"]] = (group, projection)
            grouped.setdefault(group, []).append(projection)
        except Exception as exc:
            failures.append({"check": "row_expected_semantics_resolution", "u_id": row.get("u_id"), "error": str(exc)})
    expected_baselines = {}
    for group, projections in grouped.items():
        flattened = [flatten_projection(item) for item in projections]
        paths = set().union(*(item.keys() for item in flattened))
        baseline_fields = {}
        for path in sorted(paths):
            encoded = [json.dumps({"value": item[path]}, ensure_ascii=False, sort_keys=True, separators=(",", ":")) if path in item else "<MISSING>" for item in flattened]
            frequencies = {}
            for value in encoded:
                frequencies[value] = frequencies.get(value, 0) + 1
            mode = sorted(frequencies.items(), key=lambda pair: (-pair[1], pair[0]))[0][0]
            if mode != "<MISSING>":
                baseline_fields[path] = json.loads(mode)["value"]
        expected_baselines[group] = baseline_fields

    source_audit_rows = []
    source_deltas = {}
    for row in rows:
        group, projection = source_projections[row["u_id"]]
        flat = flatten_projection(projection)
        baseline = expected_baselines[group]
        sets = {path: value for path, value in flat.items() if path not in baseline or baseline[path] != value}
        removes = sorted(path for path in baseline if path not in flat)
        if group == "independent_cross_field_probe":
            index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
            probe = cross_probes[index]
            literal_value = probe["input_patch"][0]["value"]
            label = cross_field_expected_label(literal_value)
        else:
            try:
                label = concise_expected_label(group, sets, removes)
            except Exception as exc:
                failures.append({"check": "concise_unique_expected_result_generation", "u_id": row["u_id"], "error": str(exc)})
                label = ""
        source_deltas[row["u_id"]] = {"baseline_ref": group, "set": sets, "remove": removes, "expected_result": label}
        source_audit_rows.append({
            "u_id": row["u_id"], "source_kind": row["source_kind"], "source_id": row["source_id"],
            "source_ref": row["source_ref"], "expected_ref": row["expected_ref"],
            "contract_oracle_id": row["contract_oracle_id"],
            "projection_sha256": hashlib.sha256(json.dumps(flat, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest(),
            "formal_expected_result": label,
            "source_failure_expectation": projection.get("failure_reasons", "failure_reasons=[]"),
            "l5_failure_rule_refs": row.get("l5_failure_rule_refs", []),
        })
    expectation_text = json.dumps({"audit": source_audit_rows, "formal": [row.get("expected_result") for row in rows]}, ensure_ascii=False)
    ellipsis_count = expectation_text.count("...") + expectation_text.count("…")
    array_placeholder_count = len(re.findall(r"array\(\d+ items\)", expectation_text))
    if ellipsis_count or array_placeholder_count:
        failures.append({"check": "no_truncated_or_array_count_only_expectation", "ellipsis_count": ellipsis_count, "array_placeholder_count": array_placeholder_count})
    null_claim_rows = [uid for uid, (_, projection) in source_projections.items() if "claim_results" in projection and projection["claim_results"] is None]
    null_claim_labels = [row["u_id"] for row in rows if row.get("expected_result", "").endswith("claim結果はnull（未解釈）.")]
    if len(null_claim_rows) != 19 or set(null_claim_rows) != set(null_claim_labels):
        failures.append({"check": "explicit_null_claim_result_rows_and_meaning_label", "source_null_count": len(null_claim_rows), "label_count": len(null_claim_labels), "source_only": sorted(set(null_claim_rows) - set(null_claim_labels)), "label_only": sorted(set(null_claim_labels) - set(null_claim_rows))})

    for row in rows:
        function_suffix = row.get("target", {}).get("function_ref", "").rsplit("-", 1)[-1]
        if row.get("target", {}).get("requirement_ref") != f"HELIXCONNECT-L3-005-{function_suffix}" or row.get("target", {}).get("l4_ref") != f"HELIXCONNECT-L4-005-{function_suffix}":
            failures.append({"check": "row_target_layer_identity_alignment", "u_id": row.get("u_id")})
        if row.get("execution_state") != "not_executed":
            failures.append({"check": "row_execution_state_remains_unexecuted", "u_id": row.get("u_id"), "actual": row.get("execution_state")})
        for field in ("counterexample", "expected_result", "contract_oracle_id", "test_citation", "source_ref", "expected_ref", "target"):
            if field not in row:
                failures.append({"check": "required_u_id_row_field", "u_id": row.get("u_id"), "field": field})
        if row.get("row_oracle_id") is not None or row.get("row_oracle_status") != "not_present":
            failures.append({"check": "row_oracle_not_invented", "u_id": row.get("u_id")})
        if row.get("test_citation") is not None or row.get("test_citation_status") != "not_found_not_created":
            failures.append({"check": "test_citation_not_invented", "u_id": row.get("u_id")})
        try:
            src = row["source_ref"]
            exp = row["expected_ref"]
            doc = l9 if src["path"] == L9 else old8
            pointer(doc, src["pointer"])
            pointer((l9 if exp["path"] == L9 else old8), exp["pointer"])
        except Exception as exc:
            failures.append({"check": "fixed_source_pointer_resolution", "u_id": row.get("u_id"), "error": str(exc)})
        for ref in row.get("l5_failure_rule_refs", []):
            try:
                path, ptr = ref.split("#", 1)
                if path != L5:
                    raise ValueError(f"unexpected_l5_reference_path:{path}")
                pointer(l5, ptr)
            except Exception as exc:
                failures.append({"check": "l5_failure_rule_pointer_resolution", "u_id": row.get("u_id"), "reference": ref, "error": str(exc)})

        try:
            expected_label = source_deltas[row["u_id"]]["expected_result"]
            if row["expected_result"] != expected_label:
                failures.append({"check": "row_expected_result_matches_concise_source_semantics", "u_id": row["u_id"]})
        except Exception as exc:
            failures.append({"check": "row_expected_delta_resolution", "u_id": row.get("u_id"), "error": str(exc)})

        if row["source_kind"] == "independent_cross_field_probe":
            try:
                index = int(row["source_ref"]["pointer"].rsplit("/", 1)[1])
                probe = cross_probes[index]
                values = [None, False, 0, "", {}]
                value = probe["input_patch"][0]["value"]
                literal = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
                want_counterexample = f"{probe['id']}: original_prior_successes={literal} (non-array), original_stop.stop_event_ref=null."
                valid_shape = (
                    probe["id"] == row["source_id"]
                    and probe["input_patch"] == [
                        {"op": "replace", "path": "/original_prior_successes", "value": value},
                        {"op": "replace", "path": "/original_stop/stop_event_ref", "value": None},
                    ]
                    and probe["expected_constraints"] == {"no_exception": True, "stop_link_result": "unknown_original_information"}
                    and probe["execution_state"] == "not_executed"
                    and row["expected_ref"]["pointer"] == f"/cross_field_type_constraints/probes/{index}/expected_constraints"
                    and row["contract_oracle_id"] == "HELIXCONNECT-L10-005-F02"
                    and row["counterexample"] == want_counterexample
                    and row["expected_result"] == cross_field_expected_label(value)
                    and row["execution_state"] == "not_executed"
                )
                if type(value) is not type(values[index]) or value != values[index] or not valid_shape:
                    failures.append({"check": "independent_cross_field_probe_semantics", "u_id": row["u_id"], "probe_id": probe.get("id")})
            except Exception as exc:
                failures.append({"check": "independent_cross_field_probe_resolution", "u_id": row.get("u_id"), "error": str(exc)})

    expected_cross_common = {
        "applies_to_source_ids": [probe["id"] for probe in cross_probes],
        "shared_expected_result": {"no_exception": True, "stop_link_result": "unknown_original_information"},
        "shared_boundary": "original_prior_successesの非配列値を空配列へ変換しない。original_stop.stop_event_ref=nullからstop eventを解決しない。",
    }
    if current.get("cross_field_type_expectation") != expected_cross_common:
        failures.append({"check": "cross_field_shared_expectation_matches_fixed_source"})

    expected_cross_uids = [f"U-CONNECT005-{i:03d}" for i in range(220, 225)]
    actual_cross_uids = [row["u_id"] for row in rows if row.get("source_kind") == "independent_cross_field_probe"]
    if actual_cross_uids != expected_cross_uids:
        failures.append({"check": "all_five_cross_field_probe_rows_present", "expected": expected_cross_uids, "actual": actual_cross_uids})

    expected_functions = [x["function_ref"] for x in l5["obligation_trace"]]
    covered_functions = current.get("l5_coverage", {}).get("public_functions", [])
    if covered_functions != expected_functions:
        failures.append({"check": "l5_public_function_coverage", "expected": expected_functions, "actual": covered_functions})
    all_rules = 0
    failure_rule_semantic_audit = []
    rule_candidate_refs = {row["u_id"]: [] for row in rows}
    for fn in expected_functions:
        name = fn[-3:]
        rules = l5["branch_tables"][name]["failure_rules"]
        all_rules += len(rules)
        for i, rule in enumerate(rules):
            ref = f"{L5}#/branch_tables/{name}/failure_rules/{i}"
            coverage = current.get("l5_coverage", {}).get("failure_rule_coverage", {}).get(ref, {})
            actual_ids = [row["u_id"] for row in rows if source_projections.get(row["u_id"]) and failure_rule_emissions(name, i, source_projections[row["u_id"]][1])]
            declared_ids = coverage.get("candidate_u_ids", [])
            if declared_ids != actual_ids:
                failures.append({"check": "l5_failure_rule_semantic_candidate_mapping", "pointer": ref, "expected_u_ids": actual_ids, "actual_u_ids": declared_ids})
            expected_state = "semantically_supported_by_fixed_source" if actual_ids else "no_fixed_source_case_demonstrates_rule"
            if coverage.get("coverage_state") != expected_state:
                failures.append({"check": "l5_failure_rule_semantic_coverage_state", "pointer": ref, "expected": expected_state, "actual": coverage.get("coverage_state")})
            for uid in actual_ids:
                rule_candidate_refs[uid].append(ref)
            failure_rule_semantic_audit.append({
                "pointer": ref,
                "when": rule["when"],
                "emit": rule["emit"],
                "fixed_source_candidate_u_ids": actual_ids,
                "observed_expected_emissions": [
                    {
                        "u_id": row["u_id"],
                        "condition_witness": failure_rule_condition_witness(name, i, source_projections[row["u_id"]][1]),
                        "emitted_findings": failure_rule_emissions(name, i, source_projections[row["u_id"]][1]),
                    }
                    for row in rows if row["u_id"] in actual_ids
                ],
                "coverage_state": expected_state,
                "execution_state": "not_executed",
            })
    for row in rows:
        if row.get("l5_failure_rule_refs", []) != rule_candidate_refs[row["u_id"]]:
            failures.append({"check": "row_l5_failure_rule_refs_match_semantic_emissions", "u_id": row["u_id"], "expected": rule_candidate_refs[row["u_id"]], "actual": row.get("l5_failure_rule_refs", [])})
    if all_rules != 27:
        failures.append({"check": "declared_l5_failure_rule_count", "expected": 27, "actual": all_rules})

    contract_oracle_ids = {case.get("id") for case in l10_functional.get("cases", [])}
    contract_oracle_ids.update(case.get("id") for case in l10_nfr.get("cases", []))
    used_contract_oracle_ids = {row.get("contract_oracle_id") for row in rows}
    missing_contract_oracles = sorted(used_contract_oracle_ids - contract_oracle_ids)
    if missing_contract_oracles:
        failures.append({"check": "l10_contract_oracle_resolution", "missing_ids": missing_contract_oracles})
    wrong_contract_oracles = []
    for row in rows:
        suffix = row.get("target", {}).get("requirement_ref", "").rsplit("-", 1)[-1]
        expected = f"HELIXCONNECT-L10-005-{suffix}"
        if row.get("contract_oracle_id") != expected:
            wrong_contract_oracles.append({"u_id": row.get("u_id"), "expected": expected, "actual": row.get("contract_oracle_id")})
    if wrong_contract_oracles:
        failures.append({"check": "contract_oracle_matches_target_requirement", "count": len(wrong_contract_oracles), "sample": wrong_contract_oracles[:5]})

    removed = current.get("removed_materials", {})
    required_removed_keys = {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"}
    if set(removed) != required_removed_keys or "DT-VT-105" not in removed.get("use_boundary", ""):
        failures.append({"check": "removed_materials_shape_or_boundary", "keys": sorted(removed)})
    if current.get("l5_coverage", {}).get("l9_declared_case_count_before") != 90 or current.get("l5_coverage", {}).get("l9_declared_case_count_after") != 90:
        failures.append({"check": "l9_declared_count_preserved"})
    if current.get("l5_coverage", {}).get("total_source_rows_before") != 224 or current.get("l5_coverage", {}).get("total_u_id_rows_after") != 224:
        failures.append({"check": "total_source_row_count_includes_cross_field_probes"})

    from importlib.util import spec_from_file_location, module_from_spec
    checker_path = ROOT / "scaffold/tools/design_verification_checker.py"
    spec = spec_from_file_location("design_verification_checker_wr256", checker_path)
    checker = module_from_spec(spec)
    spec.loader.exec_module(checker)
    cap = checker.check_ownership_cap(ROOT, L8, current, layer="L8")
    if cap.get("failures"):
        failures.append({"check": "CHK-OWNERSHIP-CAP-L8L9", "count": len(cap["failures"]), "sample": cap["failures"][:5]})

    child_proc = subprocess.run(
        [sys.executable, str(checker_path), "check-child", "--l4", L4, "--l9", L9, "--l5", L5, "--l8", L8, "--root", str(ROOT)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    child_report = json.loads(child_proc.stdout)
    child_pair = child_report.get("L5_L8_pair", {})
    child_four_way = child_report.get("negative_4way", {})
    child_status = "not_evaluated" if child_pair.get("status") == "not_evaluated" and child_four_way.get("status") == "not_evaluated" else "evaluated"

    source_audit = {
        "schema": "wr256-connect-l8-source-semantic-audit.v2",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base_revision": BASE,
        "contract_outcome_boundaries": expected_contract_outcomes,
        "failure_rule_semantic_audit": failure_rule_semantic_audit,
        "groups": {group: {"row_count": len(items)} for group, items in sorted(grouped.items())},
        "rows": source_audit_rows,
        "limits": ["Compact fixed-source audit: row pointers, expected-result text, source projection hashes, failure findings, and L5 rule witnesses are retained. Full projections and modal baselines are intentionally omitted; fixed source revisions and historical Git blobs preserve reproducibility. This is not an executed oracle."],
    }
    audit_path = record_dir / "source-semantic-audit.json"
    source_bytes = (json.dumps(source_audit, ensure_ascii=False, indent=2) + "\n").encode("utf-8")

    result = {
        "schema": "wr256-connect-l8-u-id-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "base_revision": BASE,
        "rows": {"before": {"l9_cases": 90, "local_domain_probes": 61, "independent_semantic_probes": 68, "independent_cross_field_probes": 5, "u_id_total": 224}, "after": {"l9_basic_branches": observed["L9_basic_branch"], "local_domain_probes": observed["local_domain_probe"], "independent_semantic_probes": observed["independent_semantic_probe"], "independent_cross_field_probes": observed["independent_cross_field_probe"], "u_id_total": len(rows)}},
        "l5": {"public_functions": len(expected_functions), "failure_rules": all_rules, "rules_with_fixed_source_emissions": sum(bool(item["fixed_source_candidate_u_ids"]) for item in failure_rule_semantic_audit), "rules_without_fixed_source_emission": [item["pointer"] for item in failure_rule_semantic_audit if not item["fixed_source_candidate_u_ids"]]},
        "failure_rule_semantic_audit": {"rule_count": len(failure_rule_semantic_audit), "candidate_row_links": sum(len(item["fixed_source_candidate_u_ids"]) for item in failure_rule_semantic_audit), "unsupported_links": sum(item.get("check") == "l5_failure_rule_semantic_candidate_mapping" for item in failures), "unexecuted": True},
        "source_pointers_resolved": sum(1 for r in rows if r.get("source_ref")),
        "preserved_l9_whole_oracle": {"expected_count": 90, "hashes_read_from_fixed_historical_l8": len(expected_whole_hashes), "computed_from_fixed_l9_expected_material": len(actual_whole_hashes), "mismatch_count": len(whole_hash_mismatches), "historical_l8_revision": BASE, "historical_l8_path": L8},
        "claim_results_null_semantics": {"source_count": len(null_claim_rows), "l5_domain_contract_path": L5 + "#/result_domain_contract/input_presence_domains", "l5_defines_null_and_absent_as_uninterpreted": "claim_results（未解釈）" in claim_presence_semantics and "null/Absent" in claim_presence_semantics, "formal_label_count": len(null_claim_labels)},
        "l10_contract_oracles": {
            "used_ids": sorted(used_contract_oracle_ids),
            "resolved_ids": sorted(used_contract_oracle_ids & contract_oracle_ids),
            "missing_ids": missing_contract_oracles,
            "wrong_target_mapping_count": len(wrong_contract_oracles),
        },
        "preserved_boundary_fields": {"checked": len(preserved_top_level), "changed": changed_boundary_fields},
        "method_boundary": {"passed": not any(item.get("check") == "method_matches_static_candidate_role_and_unexecuted_boundary" for item in failures), "L5_AST_test_execution_or_L8_pass_fail": "not_performed"},
        "contract_outcome_boundaries": {"checked_functions": sorted(expected_contract_outcomes["functions"]), "mismatch_count": sum(item.get("check") == "short_contract_outcome_boundaries_match_L3_L4_L5_L10" for item in failures)},
        "source_semantic_audit": {"path": str(audit_path.relative_to(ROOT)), "row_count": len(source_audit_rows), "sha256": hashlib.sha256(source_bytes).hexdigest()},
        "contract_outcome_boundary_count": sum(len(items["l5_fixed_outputs"]) for items in expected_contract_outcomes["functions"].values()),
        "expected_result_audit": {"row_count": len(rows), "baseline_groups": {group: {"rows": len(grouped[group]), "audit_baseline_fields": len(expected_baselines[group])} for group in sorted(grouped)}, "audit_baseline_field_total": sum(len(fields) for fields in expected_baselines.values()), "audit_row_delta_fields": sum(len(item["set"]) + len(item["remove"]) for item in source_deltas.values()), "max_audit_row_delta_fields": max((len(item["set"]) + len(item["remove"]) for item in source_deltas.values()), default=0), "formal_expected_result_kind": "concise row-specific semantic statement", "formal_expected_result_length_max": max((len(row.get("expected_result", "")) for row in rows), default=0), "ellipsis_count": ellipsis_count, "array_count_placeholder_count": array_placeholder_count, "source_semantic_mismatch_count": sum(any(f.get("u_id") == row.get("u_id") and f.get("check", "").startswith(("row_expected_delta", "row_expected_semantics_resolution", "row_expected_result", "independent_cross_field_probe")) for f in failures) for row in rows)},
        "row_oracle_and_test_citation": "null; not found at fixed source; not invented",
        "ownership_cap": {"passed": not cap.get("failures"), "failure_count": len(cap.get("failures", []))},
        "check_child": {
            "status": child_status,
            "reported_passed": child_report.get("passed"),
            "l5_l8_pair_reason": child_pair.get("not_evaluated_reason"),
            "negative_4way_reason": child_four_way.get("not_evaluated_reason"),
            "limitation": "The generic checker did not evaluate this CONNECT L5/L8 document shape; its false result is not a pass or a semantic finding.",
        },
        "passed": not failures,
        "failures": failures,
        "limits": ["This static check does not evaluate L4/L5 algorithms, tests, runtime, CI, independent semantic equivalence, or approval."]
    }
    result_bytes = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    summary_path = record_dir / "verification-summary.json"
    if args.record:
        if not result["passed"]:
            print(json.dumps({"passed": False, "evidence_written": False, "failures": failures}, ensure_ascii=False, indent=2))
            return 1
        record_dir.mkdir(parents=True, exist_ok=False)
        for path, data in ((audit_path, source_bytes), (summary_path, result_bytes)):
            with path.open("xb") as handle:
                handle.write(data)
        manifest = {
            "schema": "wr256-immutable-evidence-record.v1",
            "evidence_kind": "scaffold",
            "authority_effect": "none",
            "record_id": record_id,
            "head_revision_at_recording": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
            "validator_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            "worktree_dirty_at_recording": bool(subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT, text=True).strip()),
            "artifacts": {
                "source_semantic_audit": {"path": str(audit_path.relative_to(ROOT)), "sha256": hashlib.sha256(source_bytes).hexdigest(), "bytes": len(source_bytes)},
                "verification_summary": {"path": str(summary_path.relative_to(ROOT)), "sha256": hashlib.sha256(result_bytes).hexdigest(), "bytes": len(result_bytes)},
            },
            "note": "Created with exclusive file creation. Existing evidence is never overwritten; add this record to an append-only lineage artifact in the accompanying change.",
        }
        manifest_path = record_dir / "record.json"
        with manifest_path.open("xb") as handle:
            handle.write((json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
        comparison = {"mode": "record", "record_id": record_id, "written": True}
    else:
        expected = {audit_path: source_bytes, summary_path: result_bytes}
        comparison = {"mode": "compare", "record_id": record_id, "matches": True, "artifacts": []}
        for path, data in expected.items():
            actual = path.read_bytes() if path.exists() else None
            match = actual == data
            comparison["artifacts"].append({"path": str(path.relative_to(ROOT)), "matches": match, "expected_sha256": hashlib.sha256(data).hexdigest(), "actual_sha256": hashlib.sha256(actual).hexdigest() if actual is not None else None})
            comparison["matches"] = comparison["matches"] and match
    print(json.dumps({"verification": result, "artifact_comparison": comparison}, ensure_ascii=False, indent=2))
    return 0 if result["passed"] and comparison.get("matches", True) else 1


if __name__ == "__main__":
    sys.exit(main())
