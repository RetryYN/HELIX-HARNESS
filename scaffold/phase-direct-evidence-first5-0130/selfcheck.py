#!/usr/bin/env python3
"""SCF-B-0130 deterministic negative checks."""
from __future__ import annotations

import contextlib
import copy
import hashlib
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0119_validate", HERE / "validate.py")
assert spec and spec.loader
validate = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = validate
spec.loader.exec_module(validate)


def load_bundle() -> tuple[dict, list[dict]]:
    inv = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    rows = [json.loads(line) for line in (HERE / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    return inv, rows


def write_bundle(path: Path, inv: dict, rows: list[dict]) -> None:
    (path / "inventory.json").write_text(json.dumps(inv, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (path / "evidence.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


def run_case(name: str, expected: str, mutate) -> None:
    inv, rows = load_bundle()
    mutate(inv, rows)
    with tempfile.TemporaryDirectory(prefix="scf-b-0119-selfcheck-") as temp:
        bundle = Path(temp)
        write_bundle(bundle, inv, rows)
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith(expected + ":") for error in checker.errors):
            raise AssertionError(f"{name}: expected {expected}, result={result}, errors={checker.errors}")
    print(f"PASS {name} -> {expected}")


def run_raw_bundle_case() -> None:
    with tempfile.TemporaryDirectory(prefix="scf-b-0119-raw-") as temp:
        bundle = Path(temp)
        (bundle / "inventory.json").write_text("{\n", encoding="utf-8")
        (bundle / "evidence.jsonl").write_text("", encoding="utf-8")
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith("E_BUNDLE:") for error in checker.errors):
            raise AssertionError(f"malformed bundle: result={result}, errors={checker.errors}")
    print("PASS malformed bundle -> E_BUNDLE")


def run_generator_tamper_case() -> None:
    path = HERE / "generate.py"
    original = path.read_bytes()
    needle = b'"candidate_basis": "asset_search_candidates_only; source semantics are cross-cutting research evidence", "formal_phase_candidate": None'
    replacement = b'"candidate_basis": "asset_search_candidates_only; source semantics are cross-cutting research evidence", "formal_phase_candidate": "PHCAP-20"'
    if needle not in original:
        raise AssertionError("generator tamper needle missing")
    try:
        path.write_bytes(original.replace(needle, replacement, 1))
        result = subprocess.run([sys.executable, str(path)], cwd=validate.ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
        if result.returncode != 0:
            raise AssertionError(f"tampered generator failed: {result.stderr}")
        checker = validate.Validator(validate.ROOT, HERE)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            code = checker.validate()
        if code == 0 or not any(error.startswith("E_PHASE_REVIEW:") for error in checker.errors):
            raise AssertionError(f"generator tamper passed: code={code}, errors={checker.errors}")
    finally:
        path.write_bytes(original)
        restored = subprocess.run([sys.executable, str(path)], cwd=validate.ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
        if restored.returncode != 0:
            raise AssertionError(f"generator restore failed: {restored.stderr}")
    print("PASS generator regeneration phase tamper -> E_PHASE_REVIEW")


def _git(*args: str, input_bytes: bytes | None = None, text: bool = True) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=validate.ROOT,
        input=input_bytes if not text else (input_bytes.decode("utf-8") if input_bytes is not None else None),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=text,
        check=False,
    )
    if result.returncode != 0:
        detail = result.stderr.decode("utf-8", errors="replace") if isinstance(result.stderr, bytes) else result.stderr
        raise AssertionError(f"git {' '.join(args)} failed: {detail}")
    output = result.stdout
    return output.decode("utf-8").strip() if isinstance(output, bytes) else output.strip()


def _replace_tree_path(tree_oid: str, path_parts: list[str], replacement_oid: str) -> str:
    entries = _git("ls-tree", tree_oid).splitlines()
    target = path_parts[0]
    rewritten: list[str] = []
    found = False
    for entry in entries:
        mode, kind, oid, name = entry.split(None, 3)
        if name != target:
            rewritten.append(entry)
            continue
        found = True
        if len(path_parts) == 1:
            rewritten.append(f"{mode} blob {replacement_oid}\t{name}")
        else:
            if kind != "tree":
                raise AssertionError(f"taxonomy path component is not a tree: {name}")
            child = _replace_tree_path(oid, path_parts[1:], replacement_oid)
            rewritten.append(f"{mode} tree {child}\t{name}")
    if not found:
        raise AssertionError(f"taxonomy path component missing: {target}")
    return _git("mktree", input_bytes=("\n".join(rewritten) + "\n").encode("utf-8"))


def run_taxonomy_body_regeneration_case() -> None:
    """Regenerate from a forged orphan taxonomy and require the ancestry guard."""
    original_path = HERE / "generate.py"
    original = original_path.read_bytes()
    source = subprocess.run(
        ["git", "show", f"{validate.TAXONOMY_COMMIT}:{validate.TAXONOMY_PATH}"],
        cwd=validate.ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if source.returncode != 0:
        raise AssertionError("unable to read fixed taxonomy source")
    rows = []
    for index, line in enumerate(source.stdout.splitlines()):
        row = json.loads(line)
        if index == 0:
            row["taxonomy"]["candidate_statement"] = row["taxonomy"]["candidate_statement"] + " [selfcheck taxonomy body tamper]"
        rows.append(json.dumps(row, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))
    forged_bytes = b"\n".join(rows) + b"\n"
    forged_blob = _git("hash-object", "-w", "--stdin", input_bytes=forged_bytes)
    fixed_tree = _git("rev-parse", f"{validate.TAXONOMY_COMMIT}^{{tree}}")
    forged_tree = _replace_tree_path(fixed_tree, validate.TAXONOMY_PATH.split("/"), forged_blob)
    env = os.environ.copy()
    env.update({
        "GIT_AUTHOR_NAME": "SCF-B-0130 selfcheck",
        "GIT_AUTHOR_EMAIL": "scf-b-0119-selfcheck@example.invalid",
        "GIT_COMMITTER_NAME": "SCF-B-0130 selfcheck",
        "GIT_COMMITTER_EMAIL": "scf-b-0119-selfcheck@example.invalid",
    })
    forged_commit_result = subprocess.run(
        ["git", "commit-tree", forged_tree],
        cwd=validate.ROOT,
        input=b"selfcheck forged taxonomy body\n",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        check=False,
    )
    if forged_commit_result.returncode != 0:
        raise AssertionError(f"unable to create orphan taxonomy commit: {forged_commit_result.stderr.decode()}")
    forged_commit = forged_commit_result.stdout.decode().strip()
    if subprocess.run(["git", "merge-base", "--is-ancestor", forged_commit, "HEAD"], cwd=validate.ROOT, check=False).returncode == 0:
        raise AssertionError("forged taxonomy commit unexpectedly became an ancestor")
    forged_sha = hashlib.sha256(forged_bytes).hexdigest()
    replacements = {
        f'TAXONOMY_COMMIT = "{validate.TAXONOMY_COMMIT}"': f'TAXONOMY_COMMIT = "{forged_commit}"',
        f'TAXONOMY_SHA256 = "{validate.TAXONOMY_SHA256}"': f'TAXONOMY_SHA256 = "{forged_sha}"',
        f'TAXONOMY_BLOB_OID = "{validate.TAXONOMY_BLOB_OID}"': f'TAXONOMY_BLOB_OID = "{forged_blob}"',
    }
    patched = original.decode("utf-8")
    for needle, replacement in replacements.items():
        if needle not in patched:
            raise AssertionError(f"taxonomy generator tamper needle missing: {needle}")
        patched = patched.replace(needle, replacement, 1)
    try:
        original_path.write_text(patched, encoding="utf-8")
        generated = subprocess.run([sys.executable, str(original_path)], cwd=validate.ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
        if generated.returncode != 0:
            raise AssertionError(f"forged taxonomy generator failed: {generated.stderr}")
        checker = validate.Validator(validate.ROOT, HERE)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            code = checker.validate()
        if code == 0 or not any(error.startswith("E_TAXONOMY_NOT_ANCESTOR:") for error in checker.errors):
            raise AssertionError(f"forged taxonomy regeneration passed: code={code}, errors={checker.errors}")
    finally:
        original_path.write_bytes(original)
        restored = subprocess.run([sys.executable, str(original_path)], cwd=validate.ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
        if restored.returncode != 0:
            raise AssertionError(f"taxonomy generator restore failed: {restored.stderr}")
    print("PASS taxonomy body tamper regeneration -> E_TAXONOMY_NOT_ANCESTOR")


if __name__ == "__main__":
    expected_inventory, expected_rows = validate.build_bundle()
    validate.build_bundle = lambda: (expected_inventory, expected_rows)
    cases = [
        ("schema", "E_SCHEMA", lambda inv, rows: inv.__setitem__("schema", "phase-direct-evidence-first5-0130/v0")),
        ("binding", "E_BINDING", lambda inv, rows: inv.__setitem__("binding_id", "SCF-B-9999")),
        ("base commit", "E_BASE_COMMIT", lambda inv, rows: inv["base"].__setitem__("commit", "0" * 40)),
        ("base ancestor", "E_BASE_NOT_ANCESTOR", lambda inv, rows: inv["base"].__setitem__("required_ancestor", "not-a-commit")),
        ("taxonomy non-ancestor", "E_TAXONOMY_NOT_ANCESTOR", lambda inv, rows: inv["taxonomy_snapshot"].__setitem__("commit", "not-a-commit")),
        ("taxonomy blob oid", "E_TAXONOMY_BLOB", lambda inv, rows: inv["taxonomy_snapshot"].__setitem__("blob_oid", "0" * 40)),
        ("input digest", "E_INPUT_DIGEST", lambda inv, rows: inv["input_snapshot"][0].__setitem__("sha256", "0" * 64)),
        ("unit set", "E_UNIT_SET", lambda inv, rows: rows.__setitem__(0, copy.deepcopy(rows[1]))),
        ("source anchor", "E_SOURCE_ANCHOR", lambda inv, rows: rows[0]["source_anchor"].__setitem__("statement_text_sha256", "sha256:" + "0" * 64)),
        ("edge omission", "E_WAVE_EDGE_SET", lambda inv, rows: rows[0]["semantic_review_edges"].pop()),
        ("edge duplicate", "E_WAVE_EDGE_DUP", lambda inv, rows: rows[0]["semantic_review_edges"].append(copy.deepcopy(rows[0]["semantic_review_edges"][0]))),
        ("asset set", "E_ASSET_SET", lambda inv, rows: rows[0]["asset_set"]["asset_ids"].pop()),
        ("asset source", "E_ASSET_SOURCE", lambda inv, rows: rows[0]["old_asset_evidence"]["assets"][0]["source"].__setitem__("archive_sha256_at_base", "0" * 64)),
        ("asset history", "E_ASSET_HISTORY", lambda inv, rows: rows[0]["old_asset_evidence"]["assets"][0]["history"]["disposition_record"].__setitem__("disposition", "tampered")),
        ("decision evidence", "E_DECISION_EVIDENCE", lambda inv, rows: rows[0]["old_asset_evidence"]["assets"][0]["decision_evidence"].__setitem__("status", "present_at_base")),
        ("failure evidence", "E_FAILURE_EVIDENCE", lambda inv, rows: rows[0]["failure_evidence"].__setitem__("observed_failure_status", "observed")),
        ("consumer evidence", "E_CONSUMER_EVIDENCE", lambda inv, rows: rows[0]["consumer_evidence"].__setitem__("closure_status", "closed")),
        ("phase review", "E_PHASE_REVIEW", lambda inv, rows: rows[0]["phase_review"].__setitem__("formal_phase_candidate", "PHCAP-20")),
        ("phase candidate evidence", "E_PHASE_REVIEW", lambda inv, rows: rows[0]["phase_candidate_evidence"].__setitem__("direct_phase_evidence_count", 1)),
        ("product authority", "E_PRODUCT_AUTHORITY", lambda inv, rows: rows[0]["product_review"].__setitem__("authority_product", "HELIX-OS")),
        ("current context", "E_CURRENT_CONTEXT", lambda inv, rows: rows[0]["current_context"][0].__setitem__("implementation_claim", True)),
        ("current implementation", "E_CURRENT_CONTEXT", lambda inv, rows: rows[0]["current_implementation"].__setitem__("status", "implemented")),
        ("unimplemented claim", "E_AUTHORITY_BOUNDARY", lambda inv, rows: rows[0]["unimplemented_assessment"].__setitem__("explicit_non_implementation_claim", True)),
        ("degradation claim", "E_AUTHORITY_BOUNDARY", lambda inv, rows: rows[0]["degradation_evidence"].__setitem__("unit_degradation_status", "degraded")),
        ("authority boundary", "E_AUTHORITY_BOUNDARY", lambda inv, rows: rows[0]["authority_boundary"].__setitem__("formal_phase_authority", True)),
        ("taxonomy unit set missing", "E_TAXONOMY", lambda inv, rows: inv["taxonomy_snapshot"]["unit_ids"].pop()),
        ("taxonomy unit set extra", "E_TAXONOMY", lambda inv, rows: inv["taxonomy_snapshot"]["unit_ids"].append("IRUNIT-HIL-TAXONOMY-EXTRA")),
        ("taxonomy status", "E_TAXONOMY", lambda inv, rows: rows[0]["taxonomy_alignment"].__setitem__("status", "CROSS_CUTTING_PHASE_REVIEW_PENDING")),
        ("taxonomy authority boundary", "E_TAXONOMY", lambda inv, rows: rows[0]["taxonomy_alignment"]["authority_boundary"].__setitem__("formal_phase_authority_modified", True)),
        ("taxonomy evidence join", "E_TAXONOMY_JOIN", lambda inv, rows: rows[0]["taxonomy_alignment"]["required_evidence_join"].__setitem__("exact source anchor", ["tampered"])),
    ]
    for name, expected, mutate in cases:
        run_case(name, expected, mutate)
    run_raw_bundle_case()
    run_generator_tamper_case()
    run_taxonomy_body_regeneration_case()
    print(f"SCF-B-0130 selfcheck PASS ({len(cases) + 3} negative cases)")
