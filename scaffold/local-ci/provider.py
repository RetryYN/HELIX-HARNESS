"""Trusted default-branch merge-unit verifier; target scripts are never imported."""
from pathlib import Path
import json
import os
import re
import sys

from common import Diagnostic, canonical_bytes, sha256, strict_json
from manifest import verify_design_manifest
from plan import compile_plan
from receipt import verify_receipt
from snapshot import CHECKER_PATHS, LEDGER_PATH, MANIFEST_PATH
from source_l7_runner import (CURRENT_DESIGN_PATHS, SUPPLEMENTAL_DESIGN_PATHS, HELPER_DESIGN_PATHS,
                              SOURCE_SHA256, SUPPLEMENTAL_SOURCE_SHA256, HELPER_SOURCE_SHA256)
from target import GitReader, observe_git_identity, resolve_target


_MAX_DISPATCH_CHARS = 65_535
# Trusted adapter setting; never supplied by dispatch or receipt. No PATH search.
_PROVIDER_GIT_PATH = "/usr/bin/git"


def _preflight_dispatch_json(data):
    if isinstance(data, bytes):
        try:
            text = data.decode("utf-8", "strict")
        except UnicodeDecodeError as exc:
            raise Diagnostic("Unknown", "unreadable", "dispatch envelope is not valid UTF-8") from exc
    elif isinstance(data, str):
        text = data
        try:
            text.encode("utf-8", "strict")
        except UnicodeEncodeError as exc:
            raise Diagnostic("Unknown", "unreadable", "dispatch envelope is not valid UTF-8") from exc
    else:
        raise Diagnostic("Rejected", "invalid_input", "dispatch envelope must be UTF-8 JSON text")
    if len(text) > _MAX_DISPATCH_CHARS:
        raise Diagnostic("Unobserved", "not_run", "dispatch envelope exceeds the provider input limit")

    def reject_constant(_value):
        raise ValueError("non-JSON constant")

    try:
        json.loads(text, parse_constant=reject_constant)
    except (ValueError, UnicodeError, RecursionError) as exc:
        raise Diagnostic("Unknown", "unreadable", "dispatch envelope JSON syntax is unreadable") from exc
    # strict_json adds the established duplicate-key and canonical-input rejection
    # after syntax has been distinguished from an unreadable envelope.
    strict_json(text)


def _manifest_source_paths(manifest):
    if not isinstance(manifest, dict):
        raise Diagnostic("Rejected", "invalid_input", "design manifest must be an object")
    files = manifest.get("files")
    pins = manifest.get("legacy_pins")
    if not isinstance(files, list) or not isinstance(pins, list):
        raise Diagnostic("Rejected", "invalid_input", "manifest files and legacy pins must be arrays")
    paths = set()
    for row in files:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str) or not row["path"]:
            raise Diagnostic("Rejected", "invalid_input", "manifest DesignFile path is malformed")
        paths.add(row["path"])
    for row in pins:
        if (not isinstance(row, dict) or not isinstance(row.get("archive_path"), str)
                or not row["archive_path"] or not isinstance(row.get("full_file_sha256"), str)):
            raise Diagnostic("Rejected", "invalid_input", "manifest LegacyPin source row is malformed")
        paths.add(row["archive_path"])
    return paths


def _load_portable_config():
    try:
        portable = strict_json(Path(__file__).with_name("config.json").read_bytes())
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "trusted provider runtime config unavailable") from exc
    if (not isinstance(portable, dict) or not isinstance(portable.get("executables"), dict)
            or set(portable["executables"]) != {"python", "git", "bwrap", "provider_git"}):
        raise Diagnostic("Rejected", "invalid_input", "trusted provider runtime config malformed")
    identity = portable["executables"]["provider_git"]
    if identity is not None and (not isinstance(identity, dict) or set(identity) != {"name", "version", "sha256"}
            or identity["name"] != "git" or not isinstance(identity["version"], str) or not identity["version"]
            or not isinstance(identity["sha256"], str) or not re.fullmatch(r"[0-9a-f]{64}", identity["sha256"])):
        raise Diagnostic("Rejected", "invalid_input", "trusted provider Git pin malformed")
    return portable


def run_merge_unit_verifier(repo, base, head, data, *, event="workflow_dispatch",
                            permission="read"):
    if event != "workflow_dispatch" or data is None or data == "" or data == b"":
        raise Diagnostic("Unobserved", "not_run", "dispatch or receipt input absent")
    if permission != "read":
        raise Diagnostic("Rejected", "invalid_input", "provider permission must be read-only")
    if not all(isinstance(value, str) and re.fullmatch(r"[0-9a-f]{40}", value)
               for value in (base, head)):
        raise Diagnostic("Rejected", "invalid_input", "dispatch must supply exact full commit IDs")
    _preflight_dispatch_json(data)
    # Trusted config and code come from the default-branch checkout, never target.
    portable = _load_portable_config()
    provider_identity = portable["executables"]["provider_git"]
    if provider_identity is None:
        observed = observe_git_identity(_PROVIDER_GIT_PATH)
        diagnostic = Diagnostic("Unobserved", "not_run", "provider Git pin is not yet observed in source config")
        diagnostic.provider_git_identity = observed
        raise diagnostic
    reader = GitReader(Path(repo), _PROVIDER_GIT_PATH, provider_identity)
    target = resolve_target(reader, base, head, "RetryYN/HELIX-HARNESS")
    entries = reader.entries(target["head_tree"])
    raw_config = reader.blob(entries, "scaffold/local-ci/config.json")
    if strict_json(raw_config) != portable:
        raise Diagnostic("Unknown", "conflict", "target runtime config differs from trusted verifier")
    raw_manifest = reader.blob(entries, MANIFEST_PATH)
    manifest = strict_json(raw_manifest)
    paths = _manifest_source_paths(manifest)
    paths.update(CHECKER_PATHS)
    paths.update(CURRENT_DESIGN_PATHS)
    paths.update(SUPPLEMENTAL_DESIGN_PATHS)
    paths.update(HELPER_DESIGN_PATHS)
    fixed_code_refs = {**SOURCE_SHA256, **SUPPLEMENTAL_SOURCE_SHA256, **HELPER_SOURCE_SHA256}
    paths.update(fixed_code_refs)
    contract_path = "docs/helix-os/L4-basic-design/local-ci.md"
    paths.add(contract_path)
    sources = {path: reader.blob(entries, path, fixed_code_refs[path] if path in fixed_code_refs else None)
               for path in paths}
    ledger = reader.blob(entries, LEDGER_PATH)
    # Structural receipt binding only; this is not an LC-DESIGN execution row.
    report = verify_design_manifest(raw_manifest, sources, ledger)
    plan = compile_plan(target, portable, sha256(raw_manifest), manifest["version"])
    def ref(path):
        return {"kind": "source", "identity": path, "revision": head,
                "digest": "sha256:" + sha256(sources[path])}
    checked = verify_receipt(data, target, config_digest=plan["config_digest"],
                             design_manifest_digest=sha256(raw_manifest),
                             checker_refs=[ref(p) for p in sorted(CHECKER_PATHS)],
                             contract_ref=ref(contract_path),
                             structure_complete=report["structure_complete"], plan_expected=plan,
                             source_l7_refs=[ref(p) for p in sorted(set((
                                 *CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS,
                                 *HELPER_DESIGN_PATHS)))])
    receipt = strict_json(data)
    diff_row = receipt["executions"][3]
    # Only the selected DIFF check runs on this provider.
    diff = reader.invoke("diff", "--check", "--no-ext-diff", "--no-textconv",
                         target["merge_base"], head, "--")
    if diff.returncode not in (0, 2):
        raise Diagnostic("Unknown", "unreadable", "provider Git diff could not evaluate target")
    state = "success" if diff.returncode == 0 else "fail"
    parity = state == diff_row["state"]
    return {"check_id": "LC-DIFF-001", "provider_state": state,
            "local_state": diff_row["state"], "selected_check_parity": parity,
            "provider_git_identity": dict(reader.identity),
            "local_only_check_ids": [row["check_id"] for row in plan["commands"] if not row["selection"]["merge_unit"]],
            "receipt_digest": checked["receipt_digest"], "target": target,
            "positive": parity and state == "success" and checked["aggregate_state"] == "success"}


def main():
    try:
        result = run_merge_unit_verifier(
            Path("target"), os.environ.get("LC_TARGET_BASE", ""), os.environ.get("LC_TARGET_HEAD", ""),
            os.environ.get("LC_RECEIPT_JSON", ""), event=os.environ.get("LC_EVENT", ""),
            permission=os.environ.get("LC_PERMISSION", ""))
        sys.stdout.buffer.write(canonical_bytes(result) + b"\n")
        return 0 if result["positive"] else 1
    except Diagnostic as exc:
        diagnostic = exc.as_dict()
        if hasattr(exc, "provider_git_identity"):
            diagnostic["provider_git_identity"] = exc.provider_git_identity
        sys.stdout.buffer.write(canonical_bytes(diagnostic) + b"\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
