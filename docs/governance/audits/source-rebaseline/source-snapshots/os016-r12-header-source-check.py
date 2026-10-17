#!/usr/bin/env python3
"""OS016 R12 project header / empty-nodes の4例を対象にした純粋宣言計算の有限監査。製品runtime/CIではない。"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path


L4_PATH = "docs/helix-os/L4-basic-design/portfolio-state-trace.json"
L5_PATH = "docs/helix-os/L5-detail-design/portfolio-state-trace.json"
L8_PATH = "docs/helix-os/L8-unit-verification/portfolio-state-trace.json"
L9_PATH = "docs/helix-os/L9-integration-verification/portfolio-state-trace.json"
HELPER_PATH = (
    "docs/governance/audits/source-rebaseline/source-snapshots/"
    "os016-origin-unbound-source-check.py"
)
SECTION_POINTER = "/selected_domain_profile/project_header_empty_nodes_regression"
SECTION_KEY = "project_header_empty_nodes_regression"
ENTRYPOINT = "evaluate_portfolio"
SOURCE_REVISION = "e8b88db4f47b5e2fe544be0727bf209fa7a5f27e"

# L5候補はL8の現在bindingと照合する。helperはPROGRAM_SHA256だけを更新した
# 固定bytesを使い、AST制限と許可builtinsの実装を共有する。
L5_FILE_SHA256 = "1676ca23bd803393bc07418ade957a5946b7594e48569b5bd70bb0335ad950ab"
L5_PROGRAM_SHA256 = "5c01b94ab12b1e4053c1d24f33f687916c11b9df7457f2e79875b07de45c9a60"
HELPER_FILE_SHA256 = "f5f0988873c3883270a181fb11cd51f81aeb70b9d18ad7faef23364c7c62110f"
EXPECTED_BASE_SHA256 = "c4cc7f5fda38b08b9188f94ef3b6f12ea70bc5ccd664da47f46ddabf0649e86e"

CASE_SPECS = (
    {
        "id": "OS016-R12-HEADER-REQUIREMENT-ID-ABSENT-EMPTY-NODES",
        "field_pointer": "/targets/projects/lab/requirement_id",
        "input_sha256": "d814dcb76a0980c0d96e39fb1e2aee15d00fb4cf9537b0c91f51babb69f2c10b",
        "whole_sha256": "c4cc7f5fda38b08b9188f94ef3b6f12ea70bc5ccd664da47f46ddabf0649e86e",
    },
    {
        "id": "OS016-R12-HEADER-REQUIREMENT-REVISION-NULL-EMPTY-NODES",
        "field_pointer": "/targets/projects/lab/requirement_revision",
        "input_sha256": "e20bb032a9cb9e4b316d378083001ba454f8a10bc6c7f2c767a11b3597f7436a",
        "whole_sha256": "9948fb07cdc9a797821c50f15d9f427983ade2be646a435bd9bed8b3ec7805e0",
    },
    {
        "id": "OS016-R12-HEADER-SCOPE-EMPTY-EMPTY-NODES",
        "field_pointer": "/targets/projects/lab/scope",
        "input_sha256": "3595e32b77d46dfcc35003e0c52548930779b0c96fcfddf741f3f789c2ef888f",
        "whole_sha256": "119c186e4a61a7b1b46a32766e32511fefbb3655889b4383b18959050335af4f",
    },
    {
        "id": "OS016-R12-HEADER-HARNESS-CONTRACT-REVISION-WRONG-TYPE-EMPTY-NODES",
        "field_pointer": "/targets/projects/lab/harness_contract_revision",
        "input_sha256": "28b67bafa25e1fe9e1a4829648d0ffbb4bc48afd0d5ffc37c734f884acdb4ebe",
        "whole_sha256": "92902ea876af7bed2147039ef43b08a9357d7857df34c28c301637b65b206b09",
    },
)
INPUT_POINTERS = {
    "portfolio": "/domain_extension_cases/0/input/portfolio",
    "targets": "/domain_extension_cases/0/input/targets",
    "diagnostic_contract": "/diagnostic_contract",
}
EXPECTED_ROOTS = (
    "condition",
    "node_correspondence",
    "retained_source_records",
    "retained_state_trace",
    "observed_gap_axes",
    "findings",
    "actual_state_updated",
    "actual_acceptance_created",
    "actual_release_authorized",
    "whole_portfolio_complete",
    "operation_effect",
)
EXPECTED_NORMATIVE_BASIS_POINTERS = (
    "/diagnostic_contract/selected_target_rules/0",
    "/diagnostic_contract/selected_target_rules/2",
    "/diagnostic_contract/rules/9",
    "/diagnostic_contract/rules/10",
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def find_root(start: Path) -> Path:
    required = ("AGENTS.md", "CLAUDE.md", "docs/governance/new-generation-start-here.md")
    for candidate in (start, *start.parents):
        if all((candidate / item).is_file() for item in required):
            return candidate
    raise RuntimeError("HELIX-HARNESS rootを特定できません")


def load_fixed_support(root: Path):
    helper_path = root / HELPER_PATH
    if sha256(helper_path.read_bytes()) != HELPER_FILE_SHA256:
        raise RuntimeError("固定AST guard helperのbytesが一致しません")
    spec = importlib.util.spec_from_file_location("os016_fixed_origin_audit_support", helper_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("固定AST guard helperを読み込めません")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    required = (
        "canonical_bytes", "canonical_sha256", "resolve_pointer",
        "apply_rfc6902", "inspect_pure_program", "load_calculator",
        "ALLOWED_BUILTINS",
    )
    if any(not hasattr(module, name) for name in required):
        raise RuntimeError("固定AST guard helperの必要な公開部品がありません")
    return module


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, help="検査対象のHELIX-HARNESS worktree root")
    args = parser.parse_args()
    root = args.root.resolve() if args.root else find_root(Path(__file__).resolve().parent)
    if not all((root / item).is_file() for item in ("AGENTS.md", "CLAUDE.md")):
        raise RuntimeError("--rootはHELIX-HARNESS worktree rootで指定してください")

    support = load_fixed_support(root)
    l4_path, l5_path, l8_path, l9_path = (root / p for p in (L4_PATH, L5_PATH, L8_PATH, L9_PATH))
    l4, l5, l8, l9 = (read_json(p) for p in (l4_path, l5_path, l8_path, l9_path))
    section = support.resolve_pointer(l8, SECTION_POINTER)

    if section.get("case_count") != 4 or len(section.get("cases", [])) != 4:
        raise AssertionError("R12対象caseは固定4件でなければなりません")
    if tuple(row.get("case_id") for row in section["cases"]) != tuple(spec["id"] for spec in CASE_SPECS):
        raise AssertionError("R12 case IDまたは順序が固定対象と異なります")

    source_rule = section["source_rule"]
    input_sources = section["input_sources"]
    if source_rule["path"] != L4_PATH or source_rule["pointer"] != (
            "/diagnostic_contract/selected_target_rules/0/rule"):
        raise AssertionError("L4規範source pointerが固定対象と異なります")
    if source_rule.get("revision") != SOURCE_REVISION:
        raise AssertionError("L4 source revision declaration differs")
    if input_sources["L9_path"] != L9_PATH or input_sources["portfolio_pointer"] != INPUT_POINTERS["portfolio"]:
        raise AssertionError("L9 portfolio source pointerが固定対象と異なります")
    if input_sources.get("L9_revision") != SOURCE_REVISION:
        raise AssertionError("L9 source revision declaration differs")
    if input_sources["targets_pointer"] != INPUT_POINTERS["targets"]:
        raise AssertionError("L9 targets source pointerが固定対象と異なります")
    if input_sources["L4_diagnostic_contract_pointer"] != INPUT_POINTERS["diagnostic_contract"]:
        raise AssertionError("L4 diagnostic contract source pointerが固定対象と異なります")
    if sha256(l4_path.read_bytes()) != source_rule["file_sha256"]:
        raise RuntimeError("L4 source file pin mismatch")
    if sha256(l9_path.read_bytes()) != input_sources["L9_file_sha256"]:
        raise RuntimeError("L9 input source file pin mismatch")
    support.resolve_pointer(l4, source_rule["pointer"])
    normative_basis = section["expected_source"]["normative_basis"]
    if tuple(item["pointer"] for item in normative_basis) != EXPECTED_NORMATIVE_BASIS_POINTERS:
        raise AssertionError("independent L4 normative basis pointers differ")
    for item in normative_basis:
        if item["path"] != L4_PATH or item["file_sha256"] != source_rule["file_sha256"]:
            raise AssertionError("independent L4 normative basis pin differs")
        support.resolve_pointer(l4, item["pointer"])
    if section["expected_source"].get("authoring_history", {}).get("reconstruction_dependency") is not False:
        raise AssertionError("local authoring freeze must not be a reconstruction dependency")

    if sha256(l5_path.read_bytes()) != L5_FILE_SHA256:
        raise RuntimeError("固定対象のL5 file hash mismatch")
    program = l5["normative_program"]["source_code"]
    if sha256(program.encode("utf-8")) != L5_PROGRAM_SHA256:
        raise RuntimeError("固定対象のL5 program hash mismatch")
    binding_checks = (
        ("/normative_calculation_binding/L5_sha256", L5_FILE_SHA256),
        ("/normative_calculation_binding/program_sha256", L5_PROGRAM_SHA256),
        ("/normative_calculation_binding/selected_profile/program_sha256", L5_PROGRAM_SHA256),
        ("/os015_origin_caller_verification/candidate_l5_binding/sha256", L5_FILE_SHA256),
    )
    for pointer, expected in binding_checks:
        if support.resolve_pointer(l8, pointer) != expected:
            raise RuntimeError(f"L8 current L5 binding mismatch: {pointer}")

    expected_base = section["shared_expected_base"]
    base_hash = support.canonical_sha256(expected_base)
    if base_hash != EXPECTED_BASE_SHA256:
        raise AssertionError("L8内の共有expected base hash mismatch")
    if set(expected_base) != set(EXPECTED_ROOTS):
        raise AssertionError("共有expected baseの11 root集合が固定契約と異なります")
    if section["expected_source"].get("expected_base_canonical_sha256") != EXPECTED_BASE_SHA256:
        raise AssertionError("expected base宣言hashが固定値と異なります")

    # 既存の固定AST guardとallowed-builtinsをそのまま再利用する。
    # helperのentrypoint/hash設定のみ、この対象専用の固定値へ束縛する。
    support.PROGRAM_SHA256 = L5_PROGRAM_SHA256
    support.ENTRYPOINT = ENTRYPOINT
    tree = support.inspect_pure_program(program)
    if l5["normative_program"]["entrypoints"].get(ENTRYPOINT, "").split("(", 1)[0] != ENTRYPOINT:
        raise RuntimeError("固定entrypoint declaration mismatch")
    calculate = support.load_calculator(program, tree)

    l9_portfolio = support.resolve_pointer(l9, INPUT_POINTERS["portfolio"])
    l9_targets = support.resolve_pointer(l9, INPUT_POINTERS["targets"])
    diagnostic_contract = support.resolve_pointer(l4, INPUT_POINTERS["diagnostic_contract"])
    results = []
    for row, spec in zip(section["cases"], CASE_SPECS):
        src = row["input_source"]
        if src["input"] != {"source": "L9", "pointer": INPUT_POINTERS["portfolio"]}:
            raise AssertionError(f"input source differs: {spec['id']}")
        if src["targets"] != {"source": "L9", "pointer": INPUT_POINTERS["targets"]}:
            raise AssertionError(f"target source differs: {spec['id']}")
        if src["diagnostic_contract"] != {"source": "L4", "pointer": INPUT_POINTERS["diagnostic_contract"]}:
            raise AssertionError(f"diagnostic source differs: {spec['id']}")
        if row["invalid_field_pointer"] != spec["field_pointer"]:
            raise AssertionError(f"invalid-field pointer differs: {spec['id']}")

        targets = support.apply_rfc6902(l9_targets, row["targets_patch"])
        call_args = [l9_portfolio, diagnostic_contract, targets]
        input_hash = support.canonical_sha256(call_args)
        if input_hash != spec["input_sha256"] or input_hash != row["call_arguments_canonical_sha256"]:
            raise AssertionError(f"input canonical hash mismatch: {spec['id']}")
        if row["expected_base_pointer"] != (
                SECTION_POINTER + "/shared_expected_base"):
            raise AssertionError(f"expected base pointer differs: {spec['id']}")

        expected = support.apply_rfc6902(expected_base, row["expected_patch"])
        expected_hash = support.canonical_sha256(expected)
        if expected_hash != spec["whole_sha256"] or expected_hash != row["expected_whole_canonical_sha256"]:
            raise AssertionError(f"expected whole hash mismatch: {spec['id']}")
        if set(expected) != set(EXPECTED_ROOTS) or set(row["all_11_roots"]) != set(EXPECTED_ROOTS):
            raise AssertionError(f"expected whole root set mismatch: {spec['id']}")

        before = support.canonical_bytes(call_args)
        actual = calculate(*call_args)
        if support.canonical_bytes(call_args) != before:
            raise AssertionError(f"L5 calculation mutated input: {spec['id']}")
        if not support.type_sensitive_equal(actual, expected):
            raise AssertionError(f"declared L5 result differs from fixed expected whole: {spec['id']}")
        results.append({
            "case_id": spec["id"],
            "input_sha256": input_hash,
            "expected_whole_sha256": expected_hash,
            "calculation_matches": True,
            "input_unchanged": True,
        })

    print(json.dumps({
        "status": "PASS",
        "scope": "OS016 R12 project header / empty-nodes four-case audit only",
        "root": str(root),
        "program_sha256": L5_PROGRAM_SHA256,
        "entrypoint": ENTRYPOINT,
        "case_count": len(results),
        "cases": results,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
