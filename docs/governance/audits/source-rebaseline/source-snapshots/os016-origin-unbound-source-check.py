#!/usr/bin/env python3
"""有限OS016 Unbound資料の再構成・宣言計算監査。製品runnerではない。"""
from __future__ import annotations

import argparse
import ast
import builtins
import copy
import hashlib
import json
from pathlib import Path

L4_PATH = "docs/helix-os/L4-basic-design/portfolio-state-trace.json"
L5_PATH = "docs/helix-os/L5-detail-design/portfolio-state-trace.json"
L8_PATH = "docs/helix-os/L8-unit-verification/portfolio-state-trace.json"
EXT_POINTER = "/os015_origin_caller_verification/unbound_source_derived_extension"
PROGRAM_SHA256 = "b1d1d386842f7cf54d57aebc04f107c502c1b52398d142d6ebf6a51b3952e6b8"
ENTRYPOINT = "evaluate_os015_origin_call"
ALLOWED_TOPLEVEL = {
    "deep_copy", "expand_case", "route_failure", "compare_node_material",
    "evaluate_portfolio", "evaluate_portfolio_selected",
    "_evaluate_portfolio_selected_core", "capture_source_member",
    "locate_failure_source", "compare_failure_source_materials",
    "bind_portfolio_failure_source_candidates",
    "evaluate_portfolio_with_source_candidates", "typed_json_equal",
    "material_type_formed", "normalise_origin_capture_view",
    "compare_os015_origin_project_axes", ENTRYPOINT,
    "OS015_INPUT_TYPES",
}
ALLOWED_BUILTINS = {
    "ValueError", "all", "any", "bool", "dict", "float", "int", "isinstance",
    "len", "list", "set", "sorted", "str", "type", "zip",
}
ALLOWED_METHODS = {
    "add", "append", "extend", "get", "issubset", "items", "join", "keys",
    "pop", "replace", "setdefault", "split", "startswith", "values",
}
FORBIDDEN_CALL_NAMES = {
    "__import__", "compile", "eval", "exec", "input", "open", "breakpoint",
    "globals", "locals", "vars",
}


def canonical_bytes(value) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical_sha256(value) -> str:
    return sha256_bytes(canonical_bytes(value))


def file_sha256(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def type_sensitive_equal(left, right) -> bool:
    return canonical_bytes(left) == canonical_bytes(right)


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def find_repository_root(start: Path) -> Path:
    required = ("AGENTS.md", "CLAUDE.md", "docs/governance/new-generation-start-here.md")
    for candidate in (start, *start.parents):
        if all((candidate / item).is_file() for item in required):
            return candidate
    raise RuntimeError("AGENTS.md・CLAUDE.md・現行入口を含むrepository rootを特定できません")


def decode_pointer_token(token: str) -> str:
    return token.replace("~1", "/").replace("~0", "~")


def resolve_pointer(root, pointer: str):
    if pointer == "":
        return root
    if not pointer.startswith("/"):
        raise ValueError(f"RFC 6901 pointerではありません: {pointer}")
    value = root
    for token in pointer[1:].split("/"):
        key = decode_pointer_token(token)
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def apply_rfc6902(document, operations):
    """今回の候補で使う標準add/remove/replaceをRFC 6902どおり適用する。"""
    result = copy.deepcopy(document)
    for operation in operations:
        op = operation.get("op")
        path = operation.get("path")
        if op not in {"add", "remove", "replace"} or not isinstance(path, str):
            raise ValueError("候補外のRFC 6902操作")
        if path == "":
            if op == "remove":
                raise ValueError("root removeは監査対象外")
            result = copy.deepcopy(operation["value"])
            continue
        if not path.startswith("/"):
            raise ValueError(f"RFC 6901 pointerではありません: {path}")
        tokens = [decode_pointer_token(token) for token in path[1:].split("/")]
        parent = result
        for token in tokens[:-1]:
            parent = parent[int(token)] if isinstance(parent, list) else parent[token]
        leaf = tokens[-1]
        if isinstance(parent, list):
            if leaf == "-":
                if op != "add":
                    raise ValueError("array '-'はaddのみ許可")
                parent.append(copy.deepcopy(operation["value"]))
            else:
                index = int(leaf)
                if op == "add":
                    parent.insert(index, copy.deepcopy(operation["value"]))
                elif op == "remove":
                    parent.pop(index)
                else:
                    parent[index] = copy.deepcopy(operation["value"])
        elif isinstance(parent, dict):
            if op == "add":
                parent[leaf] = copy.deepcopy(operation["value"])
            elif op == "remove":
                del parent[leaf]
            else:
                if leaf not in parent:
                    raise KeyError(leaf)
                parent[leaf] = copy.deepcopy(operation["value"])
        else:
            raise TypeError("patch parent is not object or array")
    return result


def inspect_pure_program(source: str):
    raw = source.encode("utf-8")
    digest = sha256_bytes(raw)
    if digest != PROGRAM_SHA256:
        raise RuntimeError(f"normative_program.source_code hash mismatch: {digest}")
    tree = ast.parse(source, filename="fixed OS016 normative_program.source_code")
    top_level = set()
    for node in tree.body:
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            raise RuntimeError("normative program contains import")
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            top_level.add(node.name)
        elif isinstance(node, ast.Assign):
            if not all(isinstance(target, ast.Name) and target.id == "OS015_INPUT_TYPES"
                       for target in node.targets):
                raise RuntimeError("unexpected top-level assignment")
            top_level.add("OS015_INPUT_TYPES")
        else:
            raise RuntimeError(f"unexpected top-level AST node: {type(node).__name__}")
    if top_level != ALLOWED_TOPLEVEL or ENTRYPOINT not in top_level:
        raise RuntimeError("normative program top-level declarations differ from fixed contract")
    # 固定hashの本文にはpointer等の局所helperがある。明示された関数定義だけを
    # 名前呼出しとして認め、top-level定義だけとの照合で誤拒否しない。
    declared_functions = {node.name for node in ast.walk(tree)
                          if isinstance(node, ast.FunctionDef)}
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom, ast.Global, ast.Nonlocal,
                             ast.With, ast.AsyncWith, ast.Try, ast.Raise)):
            # Raise is used by the declarative program to report invalid fixed input.
            if not isinstance(node, ast.Raise):
                raise RuntimeError(f"external/control construct is not permitted: {type(node).__name__}")
        if isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Name):
                if func.id in FORBIDDEN_CALL_NAMES:
                    raise RuntimeError(f"forbidden call: {func.id}")
                if func.id not in declared_functions and func.id not in ALLOWED_BUILTINS:
                    raise RuntimeError(f"unrecognized call: {func.id}")
            elif isinstance(func, ast.Attribute):
                if func.attr not in ALLOWED_METHODS:
                    raise RuntimeError(f"unrecognized method call: {func.attr}")
            else:
                raise RuntimeError("dynamic call target is not permitted")
    return tree


def load_calculator(source: str, tree):
    # Use an explicit builtin table; no import/open/eval/exec is exposed to source code.
    safe_builtins = {name: getattr(builtins, name) for name in ALLOWED_BUILTINS}
    namespace = {"__builtins__": safe_builtins}
    exec(compile(tree, "fixed OS016 normative_program.source_code", "exec"), namespace, namespace)
    return namespace[ENTRYPOINT]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, help="検査するrepository/worktree root")
    args = parser.parse_args()
    root = args.root.resolve() if args.root else find_repository_root(Path(__file__).resolve().parent)
    if not all((root / item).is_file() for item in ("AGENTS.md", "CLAUDE.md")):
        raise RuntimeError("--rootはHELIX-HARNESS repository rootで指定してください")
    l4 = read_json(root / L4_PATH)
    l5_path = root / L5_PATH
    l8_path = root / L8_PATH
    l5 = read_json(l5_path)
    l8 = read_json(l8_path)
    program = l5["normative_program"]["source_code"]
    tree = inspect_pure_program(program)
    if l5["normative_program"]["entrypoints"].get(ENTRYPOINT, "").split("(", 1)[0] != ENTRYPOINT:
        raise RuntimeError("fixed entrypoint declaration mismatch")
    calculate = load_calculator(program, tree)

    extension = resolve_pointer(l8, EXT_POINTER)
    if extension["reproducible_source_audit"]["script_path"] != (
            "docs/governance/audits/source-rebaseline/source-snapshots/"
            "os016-origin-unbound-source-check.py"):
        raise RuntimeError("audit script path differs from fixed contract")
    l4_mapping = resolve_pointer(
        l4, "/os015_origin_call_contract/input_port/actual_targets_lookup/unbound_capture_mapping")
    if file_sha256(root / L4_PATH) != extension["source_mapping"]["l4_file_sha256"]:
        raise RuntimeError("candidate L4 file binding mismatch")
    if canonical_sha256(l4_mapping) != extension["source_mapping"]["l4_capture_mapping_canonical_sha256"]:
        raise RuntimeError("candidate L4 mapping binding mismatch")
    if file_sha256(l5_path) != extension["source_mapping"]["l5_file_sha256"]:
        raise RuntimeError("candidate L5 file binding mismatch")
    if file_sha256(l5_path) != l8["os015_origin_caller_verification"]["candidate_l5_binding"]["sha256"]:
        raise RuntimeError("L8 candidate L5 pin mismatch")
    base = extension["base_case"]
    if canonical_sha256(base["input"]) != base["input_canonical_sha256"]:
        raise AssertionError("base input canonical hash mismatch")
    if canonical_sha256(base["expected_whole"]) != base["expected_whole_canonical_sha256"]:
        raise AssertionError("base whole canonical hash mismatch")
    if len(extension["case_patch_set"]) != 21:
        raise AssertionError("fixed OS016 scope requires 21 cases")

    results = []
    for index, row in enumerate(extension["case_patch_set"]):
        input_value = apply_rfc6902(base["input"], row["input_patch"])
        expected = apply_rfc6902(base["expected_whole"], row["expected_whole_patch"])
        input_hash = canonical_sha256(input_value)
        expected_hash = canonical_sha256(expected)
        if input_hash != row["input_canonical_sha256"]:
            raise AssertionError(f"input hash mismatch: {row['case_id']}")
        if expected_hash != row["expected_whole_canonical_sha256"]:
            raise AssertionError(f"expected hash mismatch: {row['case_id']}")
        before = canonical_bytes(input_value)
        actual = calculate(input_value)
        after = canonical_bytes(input_value)
        if before != after:
            raise AssertionError(f"input mutated: {row['case_id']}")
        if canonical_bytes(actual) != canonical_bytes(expected):
            raise AssertionError(f"declared calculation mismatch: {row['case_id']}")
        results.append({"index": index, "case_id": row["case_id"],
                        "input_sha256": input_hash,
                        "expected_whole_sha256": expected_hash,
                        "calculation_matches": True, "input_unchanged": True})

    print(json.dumps({"status": "PASS", "root": str(root),
                      "program_sha256": PROGRAM_SHA256,
                      "entrypoint": ENTRYPOINT, "case_count": len(results),
                      "cases": results}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
