"""Receipt validation and external receipt-file output for the provisional driver."""
from __future__ import annotations

import os
import re
import tempfile
from pathlib import Path
from typing import Any

try:  # support both direct script-path imports and namespace-package imports
    from .common import CHECK_IDS, Diagnostic, canonical_bytes, sha256, strict_json
except ImportError:  # pragma: no cover - exercised by the provisional CLI entrypoint
    from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256, strict_json


_RAW_SHA256 = re.compile(r"^[0-9a-f]{64}$")
_TYPED_DIGEST = re.compile(r"^sha256:[0-9a-f]{64}$")
_GIT_OID = re.compile(r"^[0-9a-f]{40}$")
_CI_STATES = ("success", "fail", "denied", "skipped", "interrupted", "stale")
_FOLD_PRECEDENCE = ("stale", "interrupted", "denied", "fail", "skipped", "success")

_RECEIPT_FIELDS = {
    "schema_version", "target", "contract_ref", "config_digest",
    "design_manifest_digest", "checker_refs", "runtime_identity", "plan",
    "executions", "aggregate_state", "created_at",
}
_TARGET_FIELDS = {
    "repository_id", "base_commit", "merge_base", "head_commit", "head_tree",
    "worktree_clean",
}
_SUBJECT_REF_FIELDS = {"kind", "identity", "revision", "digest"}
_PLAN_FIELDS = {
    "target", "contract_id", "contract_version", "selected_check_ids",
    "selection_basis", "config_digest", "design_manifest_digest", "commands", "state",
}
_COMMAND_FIELDS = {"check_id", "argv", "cwd_rel", "selection", "timeout_seconds"}
_EXECUTION_FIELDS = {
    "check_id", "portable_executable_identity", "state", "exit_code", "argv",
    "cwd_rel", "started_at", "finished_at", "timeout_seconds",
    "sandbox_profile_digest", "stdout_sha256", "stderr_sha256",
}
_EXECUTION_OPTIONAL_FIELDS = {"reason"}


def _reject(reason: str, detail: str) -> None:
    raise Diagnostic("Rejected", reason, detail)


def _unknown(classification: str, reason: str, detail: str) -> None:
    raise Diagnostic(classification, reason, detail)


def _object(value: Any, fields: set[str], label: str, *, optional: set[str] | None = None) -> dict:
    if not isinstance(value, dict):
        _reject("invalid_input", f"{label} must be an object")
    optional = optional or set()
    missing = fields - value.keys()
    if missing:
        _reject("invalid_input", f"{label} is missing required schema fields")
    if value.keys() - (fields | optional):
        _reject("invalid_input", f"{label} contains unknown schema fields")
    return value


def _digest(value: Any, label: str, *, nullable: bool = False, typed: bool = False) -> None:
    if nullable and value is None:
        return
    pattern = _TYPED_DIGEST if typed else _RAW_SHA256
    if not isinstance(value, str) or not pattern.fullmatch(value):
        _reject("invalid_input", f"{label} is not a canonical SHA-256 digest")


def _subject_ref(value: Any, label: str, *, current: bool = False) -> dict:
    if value is None and current:
        _reject("missing_key", f"current {label} is required")
    if current and isinstance(value, dict) and _SUBJECT_REF_FIELDS - value.keys():
        _reject("missing_key", f"current {label} lacks required key fields")
    ref = _object(value, _SUBJECT_REF_FIELDS, label)
    for key in ("kind", "identity", "revision"):
        if not isinstance(ref[key], str) or not ref[key]:
            _reject("invalid_input", f"{label}.{key} must be a non-empty string")
    _digest(ref["digest"], f"{label}.digest", typed=True)
    return ref


def _target(value: Any, label: str, *, current: bool = False) -> dict:
    if not isinstance(value, dict):
        if current:
            _reject("missing_key", f"{label} is required to bind the receipt")
        _reject("invalid_input", f"{label} must be an object")
    missing = _TARGET_FIELDS - value.keys()
    if missing and current:
        _reject("missing_key", f"{label} lacks required target key fields")
    target = _object(value, _TARGET_FIELDS, label)
    if not isinstance(target["repository_id"], str) or not target["repository_id"]:
        _reject("invalid_input", f"{label}.repository_id must be non-empty")
    for key in ("base_commit", "merge_base", "head_commit", "head_tree"):
        oid = target[key]
        if not isinstance(oid, str) or not _GIT_OID.fullmatch(oid):
            _reject("invalid_input", f"{label}.{key} is not a canonical Git object ID")
    if target["worktree_clean"] is not True:
        if current:
            _unknown("Stale", "stale", "current target worktree is not clean")
        _reject("invalid_input", f"{label}.worktree_clean must be true")
    return target


def _current_ref_set(value: Any, label: str, *, required: bool) -> list[dict]:
    if value is None and required:
        _reject("missing_key", f"current {label} are required")
    if not isinstance(value, list):
        _reject("invalid_input", f"current {label} must be an array")
    if required and not value:
        _reject("missing_key", f"current {label} are empty")
    refs = [_subject_ref(item, f"{label}[{i}]", current=True) for i, item in enumerate(value)]
    return refs


def _validate_plan(plan_value: Any, target: dict, config_digest: str,
                   design_manifest_digest: str, plan_expected: dict | None) -> dict:
    plan = _object(plan_value, _PLAN_FIELDS, "plan")
    plan_target = _target(plan["target"], "plan.target")
    if plan_target != target:
        _reject("invalid_input", "plan target differs from receipt target")
    if plan["contract_id"] != "OS-LOCAL-CI-001" or plan["contract_version"] != "1":
        _reject("invalid_input", "plan contract identity is unsupported")
    if plan["selected_check_ids"] != list(CHECK_IDS):
        _reject("invalid_input", "plan selected checks are not the fixed required sequence")
    if plan["selection_basis"] != "fixed_local_ci_contract" or plan["state"] != "success":
        _reject("invalid_input", "plan selection basis or state is invalid")
    _digest(plan["config_digest"], "plan.config_digest")
    _digest(plan["design_manifest_digest"], "plan.design_manifest_digest")
    if plan["config_digest"] != config_digest:
        _unknown("Unknown", "conflict", "plan config digest differs from current fixed config")
    if plan["design_manifest_digest"] != design_manifest_digest:
        _unknown("Unknown", "conflict", "plan design manifest digest differs from current fixed manifest")

    commands = plan["commands"]
    if not isinstance(commands, list) or len(commands) != len(CHECK_IDS):
        _reject("invalid_input", "plan commands do not contain the fixed required set")
    for index, command_value in enumerate(commands):
        command = _object(command_value, _COMMAND_FIELDS, f"plan.commands[{index}]")
        if command["check_id"] != CHECK_IDS[index]:
            _reject("invalid_input", "plan commands are not in fixed check order")
        if not isinstance(command["argv"], list) or not command["argv"] or not all(isinstance(x, str) for x in command["argv"]):
            _reject("invalid_input", "plan command argv is malformed")
        if command["cwd_rel"] != "." or command["timeout_seconds"] != 300:
            _reject("invalid_input", "plan command cwd or timeout differs from the fixed contract")
        selection = _object(command["selection"], {"required", "local", "merge_unit"}, f"plan.commands[{index}].selection")
        if selection != {"required": True, "local": True, "merge_unit": index == 3}:
            _reject("invalid_input", "plan command selection differs from the fixed contract")
    if plan_expected is not None:
        if not isinstance(plan_expected, dict):
            _reject("invalid_input", "plan_expected must be an object")
        if canonical_bytes(plan) != canonical_bytes(plan_expected):
            _reject("invalid_input", "receipt plan differs from the current expected plan")
    return plan


def _validate_execution(value: Any, index: int, command: dict) -> dict:
    execution = _object(value, _EXECUTION_FIELDS, f"executions[{index}]", optional=_EXECUTION_OPTIONAL_FIELDS)
    if execution["check_id"] != CHECK_IDS[index]:
        _reject("invalid_input", "execution rows are not in fixed check order")
    identity = _object(execution["portable_executable_identity"], {"name", "version", "sha256"}, f"executions[{index}].portable_executable_identity")
    for key in ("name", "version"):
        if not isinstance(identity[key], str) or not identity[key]:
            _reject("invalid_input", f"execution {key} must be non-empty")
    _digest(identity["sha256"], f"executions[{index}].portable_executable_identity.sha256")
    state = execution["state"]
    if state not in _CI_STATES:
        _reject("invalid_input", "execution state is outside the fixed CiState vocabulary")
    if state == "skipped":
        _reject("invalid_input", "selected required executions cannot be skipped")
    reason = execution.get("reason")
    if state == "interrupted":
        if reason not in ("timeout", "cancelled"):
            _reject("invalid_input", "interrupted execution requires timeout or cancelled reason")
    elif "reason" in execution:
        _reject("invalid_input", "execution reason is only valid for interrupted state")
    exit_code = execution["exit_code"]
    if exit_code is not None and (not isinstance(exit_code, int) or isinstance(exit_code, bool)):
        _reject("invalid_input", "execution exit_code must be an integer or null")
    if state == "success" and exit_code != 0:
        _reject("invalid_input", "successful execution requires exit_code zero")
    if state == "fail" and (exit_code is None or exit_code == 0):
        _reject("invalid_input", "failed execution requires a nonzero exit_code")
    if not isinstance(execution["argv"], list) or not all(isinstance(x, str) for x in execution["argv"]):
        _reject("invalid_input", "execution argv is malformed")
    if execution["argv"] != command["argv"]:
        _reject("invalid_input", "execution argv differs from its fixed plan command")
    if execution["cwd_rel"] != "." or execution["timeout_seconds"] != 300:
        _reject("invalid_input", "execution cwd or timeout differs from the fixed contract")
    for key in ("started_at", "finished_at"):
        if execution[key] is not None and not isinstance(execution[key], str):
            _reject("invalid_input", f"execution {key} must be a string or null")
    for key in ("sandbox_profile_digest", "stdout_sha256", "stderr_sha256"):
        _digest(execution[key], f"executions[{index}].{key}", nullable=True)
    if state in ("success", "fail"):
        if not execution["started_at"] or not execution["finished_at"]:
            _reject("invalid_input", f"{state} execution requires start and finish timestamps")
        if any(execution[key] is None for key in ("sandbox_profile_digest", "stdout_sha256", "stderr_sha256")):
            _reject("invalid_input", f"{state} execution requires sandbox and output digests")
    if state == "stale" or (state in ("denied", "interrupted") and execution["started_at"] is None):
        if any(execution[key] is not None for key in ("started_at", "finished_at", "exit_code")):
            _reject("invalid_input", f"unstarted {state} execution must have null time and exit fields")
    return execution


def _fold(executions: list[dict]) -> str:
    states = {execution["state"] for execution in executions}
    return next(state for state in _FOLD_PRECEDENCE if state in states)


def validate_receipt(receipt: Any, current_target: Any, *, config_digest: str,
                     design_manifest_digest: str, checker_refs: Any, contract_ref: Any,
                     structure_complete: bool, plan_expected: dict | None = None) -> dict:
    """Validate receipt structure, current bindings, plan/execution separation, and fold."""
    if not isinstance(structure_complete, bool):
        _reject("invalid_input", "structure_complete must be a boolean")
    body = _object(receipt, _RECEIPT_FIELDS, "receipt")
    if body["schema_version"] != 1 or isinstance(body["schema_version"], bool):
        _reject("invalid_input", "receipt schema_version is unsupported")
    target = _target(body["target"], "receipt.target")
    current = _target(current_target, "current_target", current=True)
    if target != current:
        _unknown("Stale", "stale", "receipt target differs from the current target descriptor")

    _digest(config_digest, "current config_digest")
    _digest(design_manifest_digest, "current design_manifest_digest")
    _digest(body["config_digest"], "receipt.config_digest")
    _digest(body["design_manifest_digest"], "receipt.design_manifest_digest")
    current_contract = _subject_ref(contract_ref, "current contract_ref", current=True)
    receipt_contract = _subject_ref(body["contract_ref"], "receipt.contract_ref")
    expected_checkers = _current_ref_set(checker_refs, "checker refs", required=True)
    actual_checkers = _current_ref_set(body["checker_refs"], "receipt checker refs", required=False)

    if body["config_digest"] != config_digest or body["design_manifest_digest"] != design_manifest_digest:
        _unknown("Unknown", "conflict", "receipt config or manifest digest differs from current fixed bytes")
    if receipt_contract != current_contract or actual_checkers != expected_checkers:
        _unknown("Unknown", "conflict", "receipt contract or checker refs differ from current fixed refs")

    plan = _validate_plan(body["plan"], target, config_digest, design_manifest_digest, plan_expected)
    if not isinstance(body["runtime_identity"], dict):
        _reject("invalid_input", "runtime_identity must be an object")
    if not isinstance(body["created_at"], str) or not body["created_at"]:
        _reject("invalid_input", "created_at must be a non-empty string")

    executions = body["executions"]
    if not isinstance(executions, list) or len(executions) != len(CHECK_IDS):
        _reject("invalid_input", "receipt must contain all five required execution rows")
    checked = [_validate_execution(item, index, plan["commands"][index]) for index, item in enumerate(executions)]
    aggregate = body["aggregate_state"]
    if aggregate not in _CI_STATES:
        _reject("invalid_input", "aggregate_state is outside the fixed CiState vocabulary")
    if aggregate != _fold(checked):
        _reject("invalid_input", "aggregate_state differs from fixed execution fold")
    design_execution = next(item for item in checked if item["check_id"] == "LC-DESIGN-001")
    if design_execution["state"] == "success" and structure_complete is not True:
        _reject("invalid_input", "design success conflicts with independently incomplete manifest structure")
    return {
        "status": "verified",
        "receipt_digest": sha256(canonical_bytes(body)),
        "aggregate_state": aggregate,
        "target": target,
    }


def verify_receipt(data: bytes | str, current_target: Any, *, config_digest: str,
                   design_manifest_digest: str, checker_refs: Any, contract_ref: Any,
                   structure_complete: bool, plan_expected: dict | None = None) -> dict:
    """Parse canonical compact JSON and validate it against owner-recomputed refs."""
    if not isinstance(data, (bytes, str)):
        _reject("invalid_input", "receipt input must be UTF-8 JSON bytes or text")
    try:
        text = data if isinstance(data, str) else data.decode("utf-8", "strict")
        if len(text) > 65535:
            _reject("invalid_input", "receipt input exceeds the 65535-character bound")
        raw = text.encode("utf-8", "strict")
        receipt = strict_json(text)
    except Diagnostic:
        raise
    except (UnicodeError, TypeError) as exc:
        raise Diagnostic("Rejected", "invalid_input", "receipt is not valid UTF-8 JSON") from exc
    if not isinstance(receipt, dict):
        _reject("invalid_input", "receipt JSON root must be an object")
    encoded = canonical_bytes(receipt)
    if raw not in (encoded, encoded + b"\n"):
        _reject("invalid_input", "receipt JSON is not in canonical compact form")
    return validate_receipt(
        receipt, current_target, config_digest=config_digest,
        design_manifest_digest=design_manifest_digest, checker_refs=checker_refs,
        contract_ref=contract_ref, structure_complete=structure_complete,
        plan_expected=plan_expected,
    )


def write_receipt(receipt: dict, path: str | os.PathLike[str],
                  repo_root: str | os.PathLike[str]) -> Path:
    """Atomically write canonical receipt JSON outside repo_root with mode 0600."""
    if not isinstance(receipt, dict):
        _reject("invalid_input", "receipt must be an object")
    try:
        root = Path(repo_root).resolve(strict=True)
        requested = Path(path).expanduser()
        if not requested.is_absolute():
            requested = Path.cwd() / requested
        destination = requested.resolve(strict=False)
        if not root.is_dir():
            _reject("invalid_input", "repo_root must be an existing directory")
        if destination == root or root in destination.parents:
            _reject("invalid_input", "receipt path must be outside repository root")
        if os.path.lexists(requested):
            _reject("invalid_input", "receipt destination already exists")
        parent = destination.parent
        parent.mkdir(parents=True, exist_ok=True)
        payload = canonical_bytes(receipt) + b"\n"
        fd, temp_name = tempfile.mkstemp(prefix=".local-ci-receipt-", dir=parent)
        temp_path = Path(temp_name)
        try:
            os.fchmod(fd, 0o600)
            with os.fdopen(fd, "wb") as stream:
                stream.write(payload)
                stream.flush()
                os.fsync(stream.fileno())
            try:
                os.link(temp_path, destination, follow_symlinks=False)
            except FileExistsError as exc:
                raise Diagnostic("Rejected", "invalid_input", "receipt destination already exists") from exc
            temp_path.unlink()
            try:
                dir_fd = os.open(parent, os.O_RDONLY)
            except OSError:
                dir_fd = None
            if dir_fd is not None:
                try:
                    os.fsync(dir_fd)
                finally:
                    os.close(dir_fd)
        except BaseException:
            try:
                temp_path.unlink(missing_ok=True)
            finally:
                raise
        return destination
    except Diagnostic:
        raise
    except (OSError, ValueError, TypeError) as exc:
        raise Diagnostic("Unknown", "unreadable", "receipt could not be written atomically") from exc
