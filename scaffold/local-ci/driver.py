"""Local-first provisional CI supervisor. Results are diagnostics, not K1 records."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import os
from pathlib import Path
import sys
import signal
import threading

from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256, strict_json
from manifest import verify_design_manifest
from plan import compile_plan
from receipt import validate_receipt, write_private_artifact, write_receipt
from runner import run_step, validate_runtime_config
from source_l7_runner import (EXPECTED_DISCOVERY_COUNT, EXPECTED_DISCOVERY_IDS,
                              EXPECTED_DISCOVERY_IDS_SHA256, FORMAL_MAPPING,
                              FORMAL_MAPPING_SHA256, SOURCE_SHA256, CURRENT_DESIGN_PATHS, SUITE_ID,
                              l7_formal_ids_present,
                              inventory_digest as source_inventory_digest)
from snapshot import CHECKER_PATHS, LEDGER_PATH, MANIFEST_PATH, read_fixed_snapshot
from target import GitReader, check_clean_checkout, resolve_target


def now():
    return datetime.now(timezone.utc).isoformat()


def subject_ref(path, target, data):
    return {"kind": "source", "identity": path, "revision": target["head_commit"],
            "digest": "sha256:" + sha256(data)}


def _identity_digest(ids):
    return sha256(("\n".join(sorted(ids)) + "\n").encode("utf-8"))


def _partial_suite_artifact(target, source_refs, row, stdout_digest, reason, extra=None):
    value = {"schema_version": 1, "artifact_kind": "partial_l7_suite_diagnostic",
             "suite_id": SUITE_ID, "target": target, "source_refs": source_refs,
             "check_id": row["check_id"], "execution_state": row["state"],
             "exit_code": row["exit_code"], "stdout_sha256": stdout_digest,
             "classification": "Unknown", "reason": reason}
    if extra:
        value["reported"] = extra
    return value


def _validate_suite_result(payload, target, source_refs, execution):
    if not isinstance(payload, dict) or payload.get("schema_version") != 1 or payload.get("suite_id") != SUITE_ID:
        raise Diagnostic("Unknown", "conflict", "suite runner result schema is not recognized")
    required = {"schema_version", "suite_id", "complete", "discovered_test_ids", "executed_test_ids",
                "test_count", "failure_count", "failed_ids", "error_count", "error_ids",
                "skip_count", "skipped_ids", "expected_failure_count", "expected_failure_ids",
                "unexpected_success_count", "unexpected_success_ids", "exit_code", "state"}
    if set(payload) != required or payload.get("complete") is not True:
        raise Diagnostic("Unknown", "conflict", "suite runner did not return a complete identity result")
    discovered, executed = payload["discovered_test_ids"], payload["executed_test_ids"]
    if (not isinstance(discovered, list) or any(not isinstance(item, str) for item in discovered)
            or not isinstance(executed, list) or any(not isinstance(item, str) for item in executed)):
        raise Diagnostic("Unknown", "conflict", "suite identity arrays are malformed")
    if (len(discovered) != EXPECTED_DISCOVERY_COUNT or len(set(discovered)) != len(discovered)
            or tuple(discovered) != EXPECTED_DISCOVERY_IDS):
        raise Diagnostic("Unknown", "conflict", "discovered suite identities differ from the fixed inventory")
    if (len(executed) != EXPECTED_DISCOVERY_COUNT or len(set(executed)) != len(executed)
            or set(executed) != set(EXPECTED_DISCOVERY_IDS)):
        raise Diagnostic("Unknown", "conflict", "executed suite identities differ from the fixed inventory")
    outcome_ids = []
    for count_key, ids_key in (("failure_count", "failed_ids"), ("error_count", "error_ids"),
                               ("skip_count", "skipped_ids"),
                               ("expected_failure_count", "expected_failure_ids"),
                               ("unexpected_success_count", "unexpected_success_ids")):
        ids = payload[ids_key]
        if (type(payload[count_key]) is not int or payload[count_key] < 0
                or not isinstance(ids, list) or any(not isinstance(item, str) for item in ids)
                or len(ids) != len(set(ids)) or payload[count_key] != len(ids)
                or not set(ids) <= set(executed)):
            raise Diagnostic("Unknown", "conflict", "suite result counts and identity lists disagree")
        outcome_ids.extend(ids)
    if len(outcome_ids) != len(set(outcome_ids)):
        raise Diagnostic("Unknown", "conflict",
                         "suite failure/error/skip/expected-failure/unexpected-success identity sets overlap")
    if type(payload["exit_code"]) is not int:
        raise Diagnostic("Unknown", "conflict", "suite exit code is not an integer")
    if payload["exit_code"] != 0 and not outcome_ids:
        raise Diagnostic("Unknown", "conflict", "suite exited nonzero without an outcome identity")
    if payload["exit_code"] == 0 and outcome_ids:
        raise Diagnostic("Unknown", "conflict", "suite reported non-success identities with a zero exit code")
    expected_state = "success" if payload["exit_code"] == 0 and not outcome_ids else "fail"
    if (type(payload["test_count"]) is not int or payload["test_count"] != EXPECTED_DISCOVERY_COUNT
            or type(payload["exit_code"]) is not int or payload["exit_code"] != execution["exit_code"]
            or payload["state"] not in ("success", "fail")
            or payload["state"] != expected_state or payload["state"] != execution["state"]):
        raise Diagnostic("Unknown", "conflict", "suite runner result differs from supervised execution")
    artifact = {"schema_version": 1, "artifact_kind": "complete_l7_suite_identity",
                "suite_id": SUITE_ID, "target": target, "source_refs": source_refs,
                "mapping_sha256": FORMAL_MAPPING_SHA256,
                "formal_mapping": list(FORMAL_MAPPING),
                "discovered_test_ids": discovered, "executed_test_ids": executed,
                "discovered_ids_sha256": _identity_digest(discovered),
                "executed_ids_sha256": _identity_digest(executed),
                "test_count": payload["test_count"],
                "failure_count": payload["failure_count"], "failed_ids": payload["failed_ids"],
                "error_count": payload["error_count"], "error_ids": payload["error_ids"],
                "skip_count": payload["skip_count"], "skipped_ids": payload["skipped_ids"],
                "expected_failure_count": payload["expected_failure_count"],
                "expected_failure_ids": payload["expected_failure_ids"],
                "unexpected_success_count": payload["unexpected_success_count"],
                "unexpected_success_ids": payload["unexpected_success_ids"],
                "exit_code": payload["exit_code"], "state": payload["state"]}
    return artifact


def unstarted(spec, state, runtime, profile_digest, reason=None):
    result = {"check_id": spec["check_id"], "portable_executable_identity": runtime,
              "state": state, "exit_code": None, "argv": spec["argv"], "cwd_rel": ".",
              "started_at": None, "finished_at": None, "timeout_seconds": 300,
              "sandbox_profile_digest": profile_digest, "stdout_sha256": None,
              "stderr_sha256": None}
    if spec["check_id"] == "LC-STAGE1-L7-001":
        result["result_complete"] = False
    if reason:
        result["reason"] = reason
    return result


def execute_plan(plan, portable, step, recheck, cancel=None, prepare_step=None):
    """Test seam for run boundaries; step returns execution plus internal stop evidence."""
    recheck()  # Before any checker: outer Stale, no rows or receipt.
    executions = []
    terminal = None
    for index, spec in enumerate(plan["commands"]):
        executable = "git" if spec["check_id"] == "LC-DIFF-001" else "python"
        identity = portable["executables"][executable]
        if terminal:
            state, reason = terminal
            executions.append(unstarted(spec, state, identity,
                                        portable["sandbox"]["profile_digest"], reason))
            continue
        if cancel is not None and cancel.is_set():
            terminal = ("interrupted", "cancelled")
            executions.append(unstarted(spec, terminal[0], identity,
                                        portable["sandbox"]["profile_digest"], terminal[1]))
            continue
        if prepare_step is not None:
            try:
                prepare_step(index, spec, executions)
            except Diagnostic as exc:
                # Lazy suite source resolution is deliberately after the first
                # five checks; preserve only those completed rows as diagnostics.
                exc.evidence = executions
                raise
        outcome = step(spec)
        row = outcome.get("execution") if isinstance(outcome, dict) else None
        if (not isinstance(row, dict) or row.get("check_id") != spec["check_id"]
                or row.get("state") not in ("stale", "interrupted", "denied", "fail", "success")
                or not isinstance(outcome.get("safe_to_continue"), bool)):
            raise Diagnostic("Rejected", "invalid_input", "invalid required execution result")
        executions.append(row)
        if not outcome["safe_to_continue"]:
            terminal = ("denied", None)
        elif outcome["execution"].get("reason") == "cancelled":
            terminal = ("interrupted", "cancelled")
        if index < len(plan["commands"]) - 1:
            try:
                recheck()
            except Diagnostic as exc:
                if exc.classification != "Stale":
                    exc.evidence = executions
                    raise
                terminal = ("stale", None)
    # An observed mid-run drift already has unstarted stale rows; keep their receipt.
    if not any(row["state"] == "stale" for row in executions):
        try:
            recheck()
        except Diagnostic as exc:
            exc.evidence = executions
            raise  # Final drift: diagnostic only; no fold or receipt.
    precedence = ("stale", "interrupted", "denied", "fail", "skipped", "success")
    if (len(executions) != len(CHECK_IDS) or any(not isinstance(row, dict) for row in executions)
            or [row.get("check_id") for row in executions] != list(CHECK_IDS)
            or any(row.get("state") not in precedence or row.get("state") == "skipped" for row in executions)):
        raise Diagnostic("Rejected", "invalid_input", "invalid required execution rows before aggregation")
    aggregate = next(state for state in precedence if any(row["state"] == state for row in executions))
    return executions, aggregate


def run_local_ci(repo, base, head, host_config, receipt_path, cancel=None):
    portable_path = Path(__file__).with_name("config.json")
    try:
        portable = strict_json(portable_path.read_bytes())
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "portable runtime configuration unavailable") from exc
    validate_runtime_config(host_config, portable)
    reader = GitReader(Path(repo), host_config["git"], portable["executables"]["git"])
    target = resolve_target(reader, base, head, "RetryYN/HELIX-HARNESS")
    snapshot = read_fixed_snapshot(reader, target)
    try:
        if portable_path.read_bytes() != snapshot.sources["scaffold/local-ci/config.json"]:
            raise Diagnostic("Stale", "target_changed", "driver config differs from target")
        raw_manifest = snapshot.sources[MANIFEST_PATH]
        report = verify_design_manifest(raw_manifest, snapshot.sources, snapshot.sources[LEDGER_PATH])
        manifest_digest = sha256(raw_manifest)
        plan = compile_plan(target, portable, manifest_digest, strict_json(raw_manifest)["version"])
        contract_path = "docs/helix-os/L4-basic-design/local-ci.md"
        contract_ref = subject_ref(contract_path, target, snapshot.sources[contract_path])
        checker_refs = [subject_ref(p, target, snapshot.sources[p]) for p in sorted(CHECKER_PATHS)]

        def recheck():
            check_clean_checkout(reader, target)
            entries = reader.entries(target["head_tree"])
            for source in snapshot.source_refs:
                reader.blob(entries, source["path"], source["sha256"])

        suite_refs = []
        def prepare_step(index, spec, executions):
            if spec["check_id"] != "LC-STAGE1-L7-001":
                return
            entries = reader.entries(target["head_tree"])
            additions = {}
            for source_path, expected_digest in sorted(SOURCE_SHA256.items()):
                data = reader.blob(entries, source_path, expected_digest)
                additions[source_path] = data
            for source_path in CURRENT_DESIGN_PATHS:
                additions[source_path] = reader.blob(entries, source_path)
            l7_path = CURRENT_DESIGN_PATHS[1]
            if not l7_formal_ids_present(additions[l7_path]):
                raise Diagnostic("Unknown", "conflict", "target L7 source does not represent every fixed formal ID")
            suite_refs.extend(subject_ref(path, target, data)
                              for path, data in sorted(additions.items()))
            for parent, _dirs, _files in os.walk(snapshot.root):
                Path(parent).chmod(0o700)
            for source_path, data in additions.items():
                destination = snapshot.root / source_path
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(data)
                snapshot.sources[source_path] = data
            # The source closure is added only after the first five checks completed.
            for parent, dirs, files in os.walk(snapshot.root):
                for filename in files:
                    (Path(parent) / filename).chmod(0o444)
                Path(parent).chmod(0o555)
            snapshot.source_refs.extend({"path": path, "sha256": sha256(data)}
                                        for path, data in sorted(additions.items()))

        def run_spec(spec):
            outcome = run_step(snapshot.root, spec, host_config, portable, cancel)
            if spec["check_id"] != "LC-STAGE1-L7-001":
                return outcome
            row = outcome["execution"]
            if row["started_at"] is None:
                row["result_complete"] = False
                return outcome
            stdout = outcome.get("suite_runner_stdout", b"")
            over_limit = outcome.get("suite_runner_stdout_overflow", False)
            try:
                if over_limit:
                    raise Diagnostic("Unknown", "conflict", "suite result exceeded bounded supervisor frame")
                suite_payload = strict_json(stdout)
                artifact = _validate_suite_result(suite_payload, target, suite_refs, row)
                full_path, full_sha, full_bytes = write_private_artifact(artifact, repo)
                del full_path
                identities = suite_payload["discovered_test_ids"]
                row["result_complete"] = True
                row["suite_evidence"] = {
                    "suite_id": SUITE_ID, "artifact_sha256": full_sha,
                    "artifact_bytes": full_bytes, "mapping_sha256": FORMAL_MAPPING_SHA256,
                    "discovered_count": len(identities), "discovered_ids_sha256": _identity_digest(identities),
                    "executed_count": len(suite_payload["executed_test_ids"]),
                    "executed_ids_sha256": _identity_digest(suite_payload["executed_test_ids"]),
                    "failure_count": suite_payload["failure_count"],
                    "error_count": suite_payload["error_count"], "skip_count": suite_payload["skip_count"],
                    "expected_failure_count": suite_payload["expected_failure_count"],
                    "unexpected_success_count": suite_payload["unexpected_success_count"],
                    "source_refs": suite_refs, "target": target,
                }
            except Diagnostic as exc:
                if row["state"] == "success":
                    row["state"] = "fail"
                    row["exit_code"] = 2
                row["result_complete"] = False
                diagnostic_artifact = _partial_suite_artifact(
                    target, suite_refs, row, row.get("stdout_sha256"), exc.reason,
                    {"classification": exc.classification, "overflow": over_limit})
                try:
                    _path, partial_sha, _size = write_private_artifact(diagnostic_artifact, repo)
                except Diagnostic as store_exc:
                    store_exc.evidence = executions + [row]
                    raise
                row["partial_diagnostic_sha256"] = partial_sha
            return outcome

        try:
            executions, aggregate = execute_plan(
                plan, portable, run_spec, recheck, cancel, prepare_step)
        except Diagnostic as exc:
            prior = getattr(exc, "evidence", [])
            if (exc.classification == "Unknown" and exc.reason in ("missing_input", "conflict")
                    and prior):
                partial = {"schema_version": 1, "artifact_kind": "partial_local_ci_diagnostic",
                           "diagnostic": exc.as_dict(), "target": target,
                           "config_digest": plan["config_digest"],
                           "design_manifest_digest": manifest_digest,
                           "source_l7_inventory_digest": source_inventory_digest(),
                           "completed_executions": prior}
                try:
                    _path, partial_sha, _size = write_private_artifact(partial, repo)
                    exc.partial_diagnostic_sha256 = partial_sha
                except Diagnostic as store_exc:
                    store_exc.evidence = prior
                    raise
            raise
        receipt = {"schema_version": 1, "target": target, "contract_ref": contract_ref,
                   "config_digest": plan["config_digest"], "design_manifest_digest": manifest_digest,
                   "source_l7_inventory_digest": source_inventory_digest(),
                   "checker_refs": checker_refs, "runtime_identity": {key: portable["executables"][key] for key in ("python", "git", "bwrap")},
                   "plan": plan, "executions": executions, "aggregate_state": aggregate,
                   "created_at": now()}
        validate_receipt(receipt, target, config_digest=plan["config_digest"],
                         design_manifest_digest=manifest_digest, checker_refs=checker_refs,
                         contract_ref=contract_ref, structure_complete=report["structure_complete"],
                         plan_expected=plan,
                         source_l7_refs=[ref for ref in suite_refs
                                         if ref["identity"] in CURRENT_DESIGN_PATHS])
        write_receipt(receipt, receipt_path, repo)
        return receipt
    finally:
        snapshot.close()


def main():
    parser = argparse.ArgumentParser(description="固定6検査のlocal CI（非K1診断）")
    parser.add_argument("--repo", required=True)
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--host-config", required=True)
    parser.add_argument("--receipt", required=True)
    args = parser.parse_args()
    cancel = threading.Event()
    def request_cancel(_signum, _frame):
        cancel.set()
    previous = {sig: signal.signal(sig, request_cancel) for sig in (signal.SIGINT, signal.SIGTERM)}
    try:
        host_path = Path(args.host_config).resolve()
        root = Path(args.repo).resolve()
        if root == host_path or root in host_path.parents:
            raise Diagnostic("Rejected", "invalid_input", "host config must be outside checkout")
        try:
            host = strict_json(host_path.read_bytes())
        except OSError as exc:
            raise Diagnostic("Unknown", "unreadable", "host runtime configuration unavailable") from exc
        receipt = run_local_ci(root, args.base, args.head, host, args.receipt, cancel)
        sys.stdout.buffer.write(canonical_bytes({"aggregate_state": receipt["aggregate_state"],
                                                "receipt_digest": sha256(canonical_bytes(receipt))}) + b"\n")
        return 0 if receipt["aggregate_state"] == "success" else 1
    except Diagnostic as exc:
        diagnostic = {"diagnostic": exc.as_dict(), "executions": getattr(exc, "evidence", [])}
        if hasattr(exc, "partial_diagnostic_sha256"):
            diagnostic["partial_diagnostic_sha256"] = exc.partial_diagnostic_sha256
        try:
            write_receipt(diagnostic, str(args.receipt) + ".diagnostic.json", args.repo)
        except Diagnostic:
            pass  # Preserve the original diagnostic when its sidecar cannot be written.
        sys.stdout.buffer.write(canonical_bytes(exc.as_dict()) + b"\n")
        return 1
    finally:
        for sig, handler in previous.items():
            signal.signal(sig, handler)


if __name__ == "__main__":
    sys.exit(main())
