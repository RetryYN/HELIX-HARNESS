"""Local-first provisional CI supervisor. Results are diagnostics, not K1 records."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
import sys
import signal
import threading

from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256, strict_json
from manifest import verify_design_manifest
from plan import compile_plan
from receipt import validate_receipt, write_receipt
from runner import run_step, validate_runtime_config
from snapshot import CHECKER_PATHS, LEDGER_PATH, MANIFEST_PATH, read_fixed_snapshot
from target import GitReader, check_clean_checkout, resolve_target


def now():
    return datetime.now(timezone.utc).isoformat()


def subject_ref(path, target, data):
    return {"kind": "source", "identity": path, "revision": target["head_commit"],
            "digest": "sha256:" + sha256(data)}


def unstarted(spec, state, runtime, profile_digest, reason=None):
    result = {"check_id": spec["check_id"], "portable_executable_identity": runtime,
              "state": state, "exit_code": None, "argv": spec["argv"], "cwd_rel": ".",
              "started_at": None, "finished_at": None, "timeout_seconds": 300,
              "sandbox_profile_digest": profile_digest, "stdout_sha256": None,
              "stderr_sha256": None}
    if reason:
        result["reason"] = reason
    return result


def execute_plan(plan, portable, step, recheck, cancel=None):
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
    if (len(executions) != 5 or any(not isinstance(row, dict) for row in executions)
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

        executions, aggregate = execute_plan(
            plan, portable,
            lambda spec: run_step(snapshot.root, spec, host_config, portable, cancel),
            recheck, cancel)
        receipt = {"schema_version": 1, "target": target, "contract_ref": contract_ref,
                   "config_digest": plan["config_digest"], "design_manifest_digest": manifest_digest,
                   "checker_refs": checker_refs, "runtime_identity": {key: portable["executables"][key] for key in ("python", "git", "bwrap")},
                   "plan": plan, "executions": executions, "aggregate_state": aggregate,
                   "created_at": now()}
        validate_receipt(receipt, target, config_digest=plan["config_digest"],
                         design_manifest_digest=manifest_digest, checker_refs=checker_refs,
                         contract_ref=contract_ref, structure_complete=report["structure_complete"],
                         plan_expected=plan)
        write_receipt(receipt, receipt_path, repo)
        return receipt
    finally:
        snapshot.close()


def main():
    parser = argparse.ArgumentParser(description="固定5検査のlocal CI（非K1診断）")
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
