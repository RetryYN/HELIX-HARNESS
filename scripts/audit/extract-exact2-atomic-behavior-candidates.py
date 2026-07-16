#!/usr/bin/env python3
"""Extract proposal-only atomic behavior candidates from the exact-two bundles."""

from __future__ import annotations

import hashlib
import gzip
import ast
import json
import re
import subprocess
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "docs/governance/generated"
CANDIDATE = GENERATED / "git-ref-authority-candidates-exact2-v1.json"
SHARD_DIR = GENERATED / "exact2-atomic-behavior-shards-v1"
OLD_MONOLITH = GENERATED / "exact2-atomic-behavior-candidates-v1.json"
EXTRACTOR_VERSION = "helix-exact2-semantic-behavior-candidate.v2"
SHARD_ROWS = 4000
GZIP_CODEC = "gzip-rfc1952-python-mtime0-level9"

REPOSITORIES = {
    "predecessor-ut": Path("/tmp/helix-authority-ut.bundle"),
    "legacy-helix": Path("/tmp/helix-authority-legacy.bundle"),
}
CODE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sh", ".bash", ".ps1", ".go", ".rs", ".java", ".cs"}
DOC_EXT = {".md", ".mdx", ".rst", ".txt"}
CONFIG_NAMES = {"package.json", "pyproject.toml", "Cargo.toml", "Dockerfile", "Makefile"}
CONFIG_EXT = {".json", ".jsonc", ".yaml", ".yml", ".toml", ".ini", ".cfg"}
VENDOR_PARTS = {"node_modules", "vendor", ".venv", "venv", "third_party"}
GENERATED_PARTS = {"dist", "build", "coverage", ".next", "generated"}
HISTORICAL_PARTS = {"archive", "historical", "legacy local state"}

PATTERNS = [
    ("test_oracle", re.compile(r"(?i)\b(?:it|test|describe)\s*\(|expect\s*\(|assert(?:Equal|True|False|Raises)?\s*\(")),
    ("hook", re.compile(r"(?i)\b(?:PreToolUse|PostToolUse|SessionStart|SubagentStop|pre-commit|post-checkout|hook)\b")),
    ("gate", re.compile(r"(?i)\b(?:gate|guard|deny|reject|fail.close|blocker)\b")),
    ("state_transition", re.compile(r"(?i)(?:\bstate\b.*(?:=>|->|to)|\btransition\b|\bstatus\s*[=:])")),
    ("schema", re.compile(r"(?i)\b(?:schema|CREATE\s+TABLE|ALTER\s+TABLE|z\.object|interface\s+\w+|type\s+\w+\s*=)")),
    ("query", re.compile(r"(?i)\b(?:SELECT|INSERT|UPDATE|DELETE)\b|\.prepare\s*\(|\.query\s*\(")),
    ("command", re.compile(r"(?i)\b(?:command|subcommand|argv|commander|argparse|click\.|process\.argv)\b")),
    ("symbol", re.compile(r"(?i)^\s*(?:export\s+)?(?:async\s+)?(?:function|class|def)\s+[A-Za-z_$][\w$]*|^\s*export\s+(?:const|let|var)\s+[A-Za-z_$][\w$]*")),
]
NORMATIVE_RE = re.compile(r"(?i)\b(?:must|shall|required|forbid|reject|deny|gate|invariant|acceptance|failure|禁止|必須|拒否|要件|受入|工程|規則)\b")
CONFIG_RE = re.compile(r"(?i)\b(?:scripts|dependencies|devDependencies|workflow|jobs|steps|hooks|command|run|test|build|install|permissions)\b")
SENSITIVE_PATTERNS = [
    ("email", re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b")),
    ("bearer_token", re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/-]{8,}={0,2}")),
    ("github_token", re.compile(r"\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{12,}\b")),
    ("aws_access_key", re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b")),
    ("private_key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("credential_assignment", re.compile(r"(?i)\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\b\s*[:=]\s*[\"']?([^\s\"',;}]{4,})")),
]


def run(args: list[str], cwd: Path | None = None) -> bytes:
    return subprocess.run(args, cwd=cwd, check=True, stdout=subprocess.PIPE).stdout


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def valid_refs(repo: Path) -> list[tuple[str, str]]:
    raw = run(["git", "for-each-ref", "--format=%(refname)%00%(objectname)", "refs/heads", "refs/tags", "refs/pull"], repo)
    result = []
    for record in raw.splitlines():
        ref, oid = record.decode().split("\x00")
        if ref.endswith("^{}"):
            continue
        if ref.startswith("refs/pull/") and not (ref.endswith("/head") or ref.endswith("/merge")):
            continue
        commit = run(["git", "rev-parse", f"{oid}^{{commit}}"], repo).decode().strip()
        result.append((ref, commit))
    return sorted(set(result))


def batch_blobs(repo: Path, oids: list[str]) -> dict[str, bytes]:
    raw = subprocess.run(
        ["git", "cat-file", "--batch"], cwd=repo, check=True,
        input=("\n".join(oids) + "\n").encode(), stdout=subprocess.PIPE,
    ).stdout
    blobs = {}
    offset = 0
    for expected in oids:
        header_end = raw.index(b"\n", offset)
        header = raw[offset:header_end].decode().strip().split()
        offset = header_end + 1
        if len(header) != 3 or header[1] != "blob":
            raise RuntimeError(f"unexpected cat-file header for {expected}: {header}")
        oid, _, size_text = header
        size = int(size_text)
        blobs[oid] = raw[offset:offset + size]
        offset += size
        if raw[offset:offset + 1] != b"\n":
            raise RuntimeError("cat-file framing error")
        offset += 1
    return blobs


def entry_disposition(path: str, data: bytes) -> tuple[str, str]:
    parts = set(Path(path).parts)
    if b"\x00" in data:
        return "binary_explicit", "binary content is not parsed as behavior text"
    if parts.intersection(VENDOR_PARTS):
        return "vendor_explicit", "vendored dependency is retained as an explicit non-atomized boundary"
    if parts.intersection(GENERATED_PARTS) or Path(path).name.endswith((".min.js", ".map")):
        return "generated_explicit", "generated output is not treated as normative source behavior"
    if parts.intersection(HISTORICAL_PARTS):
        return "historical_explicit", "historical source is classified but cannot become current authority"
    suffix = Path(path).suffix.lower()
    if suffix in CODE_EXT:
        return "atomize_code", "code surface"
    if suffix in DOC_EXT:
        return "atomize_normative_doc", "documentation surface"
    if Path(path).name in CONFIG_NAMES or suffix in CONFIG_EXT or ".github/workflows" in path:
        return "atomize_config", "configuration surface"
    return "unclassified_explicit", "unsupported textual surface requires a future extractor or justified terminal disposition"


def split_clauses(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"(?<=[。;；])\s*|\s+(?:and|or|then)\s+", text) if part.strip()]


def unit(start: int, end: int, kind: str, owner: str, text: str) -> dict:
    return {"start_line": start, "end_line": end, "kind": kind, "symbol_owner": owner, "text": text}


def python_units(text: str) -> list[dict]:
    lines = text.splitlines()
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return structural_code_units(text, "python-parse-fallback")
    parents = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            parents[child] = node
    result = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            owner = node.name
            parent = parents.get(node)
            while parent is not None:
                if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    owner = f"{parent.name}.{owner}"
                parent = parents.get(parent)
            start, end = node.lineno, getattr(node, "end_lineno", node.lineno)
            kind = "symbol"
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and re.search(r"(?i)test|check|verify|assert", node.name):
                kind = "test_oracle"
            result.append(unit(start, end, kind, owner, "\n".join(lines[start - 1:end])))
        elif isinstance(node, ast.Call):
            name = ""
            if isinstance(node.func, ast.Name): name = node.func.id
            elif isinstance(node.func, ast.Attribute): name = node.func.attr
            if re.search(r"(?i)execute|query|commit|rollback|subprocess|spawn|assert|fail", name):
                start, end = node.lineno, getattr(node, "end_lineno", node.lineno)
                result.append(unit(start, end, "query" if re.search(r"(?i)query|execute", name) else "test_oracle", name, "\n".join(lines[start - 1:end])))
    return result


def structural_code_units(text: str, fallback_owner: str = "module") -> list[dict]:
    lines = text.splitlines()
    result = []
    symbol = re.compile(r"^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function|class|def)\s+([A-Za-z_$][\w$]*)|^\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)")
    index = 0
    while index < len(lines):
        match = symbol.search(lines[index])
        if not match:
            index += 1
            continue
        owner = next(group for group in match.groups() if group)
        start = index
        balance = lines[index].count("{") - lines[index].count("}")
        index += 1
        while index < len(lines) and balance > 0:
            balance += lines[index].count("{") - lines[index].count("}")
            index += 1
        end = max(start + 1, index)
        block = "\n".join(lines[start:end])
        kind = "test_oracle" if re.search(r"(?i)test|spec|assert|expect|verify", owner + block) else "symbol"
        result.append(unit(start + 1, end, kind, owner or fallback_owner, block))
    return result


def markdown_units(text: str) -> list[dict]:
    lines = text.splitlines()
    result = []
    owner = "document-root"
    index = 0
    while index < len(lines):
        stripped = lines[index].strip()
        if stripped.startswith("#"):
            owner = stripped.lstrip("#").strip() or owner
            index += 1
            continue
        if stripped.startswith("```"):
            start = index; index += 1
            while index < len(lines) and not lines[index].strip().startswith("```"): index += 1
            index = min(len(lines), index + 1)
            result.append(unit(start + 1, index, "normative_code_block", owner, "\n".join(lines[start:index])))
            continue
        if stripped.startswith("|"):
            start = index
            while index < len(lines) and lines[index].strip().startswith("|"): index += 1
            for row_index in range(start, index):
                row = lines[row_index].strip()
                if not re.fullmatch(r"\|?[\s:|-]+\|?", row):
                    for clause in split_clauses(row): result.append(unit(row_index + 1, row_index + 1, "normative_table_row", owner, clause))
            continue
        if re.match(r"^\s*(?:[-*+] |\d+[.)] )", lines[index]):
            for clause in split_clauses(stripped): result.append(unit(index + 1, index + 1, "normative_list_item", owner, clause))
            index += 1; continue
        if stripped:
            start = index; block = []
            while index < len(lines) and lines[index].strip() and not lines[index].lstrip().startswith(("#", "|", "- ", "* ", "+ ", "```")):
                block.append(lines[index].strip()); index += 1
            paragraph = " ".join(block)
            if NORMATIVE_RE.search(paragraph):
                for clause in split_clauses(paragraph): result.append(unit(start + 1, index, "normative_paragraph_clause", owner, clause))
            continue
        index += 1
    return result


def config_units(path: str, text: str) -> list[dict]:
    lines = text.splitlines()
    result = []
    if Path(path).suffix.lower() in {".json", ".jsonc"} or Path(path).name == "package.json":
        cleaned = re.sub(r"//.*$", "", text, flags=re.MULTILINE)
        try:
            value = json.loads(cleaned)
        except json.JSONDecodeError:
            value = None
        def walk(node: object, key_path: str) -> None:
            if isinstance(node, dict):
                for key, child in node.items(): walk(child, f"{key_path}.{key}" if key_path else key)
            elif isinstance(node, list):
                for position, child in enumerate(node): walk(child, f"{key_path}[{position}]")
            elif CONFIG_RE.search(key_path):
                needle = key_path.split(".")[-1].split("[")[0]
                line = next((i for i, row in enumerate(lines, 1) if f'"{needle}"' in row), 1)
                result.append(unit(line, line, "script_dependency_semantics", key_path, json.dumps(node, ensure_ascii=False)))
        if value is not None: walk(value, "")
    if not result:
        section = "config-root"
        for number, line in enumerate(lines, 1):
            stripped = line.strip()
            if re.match(r"^\[[^]]+\]$", stripped): section = stripped
            if CONFIG_RE.search(stripped):
                kind = "ci_hook_semantics" if ".github/workflows" in path or re.search(r"(?i)jobs|steps|workflow|hook", stripped) else "script_dependency_semantics"
                result.append(unit(number, number, kind, section, stripped))
    return result


def semantic_contract(kind: str, text: str, owner: str) -> dict:
    def observed(pattern: str) -> dict:
        values = sorted(set(match.group(0) for match in re.finditer(pattern, text, re.IGNORECASE)))
        return {"status": "observed" if values else "not_observed", "values": values}
    inputs = observed(r"\b(?:input|arg(?:ument)?|param(?:eter)?|Given|request|event|payload|trigger|condition)\b")
    outputs = observed(r"\b(?:return|output|result|response|artifact|Then|emit|projection)\b")
    effects = observed(r"\b(?:write|save|insert|update|delete|spawn|exec|push|create|commit|publish|send)\b")
    failures = observed(r"\b(?:fail(?:ure)?|error|throw|reject|deny|except|rollback|timeout|cancel)\b|拒否|失敗")
    oracle = observed(r"\b(?:expect|assert|verify|acceptance|must|shall|required|invariant)\b|必須|受入")
    return {"kind": kind, "symbol_owner": owner, "input": inputs, "output": outputs, "side_effect": effects, "failure": failures, "oracle": oracle}


def semantic_units(path: str, text: str, disposition: str) -> list[dict]:
    suffix = Path(path).suffix.lower()
    if disposition == "atomize_code":
        return python_units(text) if suffix == ".py" else structural_code_units(text)
    if disposition == "atomize_normative_doc": return markdown_units(text)
    if disposition == "atomize_config": return config_units(path, text)
    return []


def redact_sensitive(text: str) -> tuple[str, list[dict[str, str]]]:
    redactions = []
    redacted = text
    for kind, pattern in SENSITIVE_PATTERNS:
        def replace(match: re.Match[str]) -> str:
            raw = match.group(0)
            digest = sha256_bytes(raw.encode())
            redactions.append({"kind": kind, "sha256": digest})
            return f"[REDACTED:{kind}:{digest[:16]}]"
        redacted = pattern.sub(replace, redacted)
    return redacted, redactions


def extract_repository(repository_id: str, bundle: Path, candidate_row: dict, temp_root: Path) -> dict:
    expected = candidate_row["ephemeral_custody"]["sha256"]
    actual = sha256_bytes(bundle.read_bytes())
    if actual != expected:
        raise RuntimeError(f"bundle digest drift for {repository_id}")
    repo = temp_root / f"{repository_id}.git"
    run(["git", "clone", "--mirror", str(bundle), str(repo)])
    refs = valid_refs(repo)
    entry_links: dict[tuple[str, str], set[tuple[str, str]]] = defaultdict(set)
    tree_cache = {}
    for ref, commit in refs:
        tree = run(["git", "rev-parse", f"{commit}^{{tree}}"], repo).decode().strip()
        if tree not in tree_cache:
            raw = run(["git", "ls-tree", "-r", "-z", tree], repo)
            rows = []
            for item in raw.split(b"\x00"):
                if not item:
                    continue
                meta, raw_path = item.split(b"\t", 1)
                mode, kind, oid = meta.decode().split()
                if kind == "blob":
                    rows.append((raw_path.decode("utf-8", errors="surrogateescape"), oid, mode))
            tree_cache[tree] = rows
        for path, oid, _mode in tree_cache[tree]:
            entry_links[(path, oid)].add((ref, tree))

    expected_entries = candidate_row["observation"]["counts"]["unique_path_content"]
    if len(entry_links) != expected_entries:
        raise RuntimeError(f"unique path/content drift for {repository_id}: {len(entry_links)} != {expected_entries}")
    blobs = batch_blobs(repo, sorted({oid for _, oid in entry_links}))
    entries = []
    atoms = []
    non_atoms = []
    semantic_digest_owners: dict[str, list[str]] = defaultdict(list)
    for ordinal, ((path, oid), links) in enumerate(sorted(entry_links.items()), 1):
        data = blobs[oid]
        disposition, reason = entry_disposition(path, data)
        entry_id = f"{repository_id}:ENTRY:{ordinal:05d}"
        text = data.decode("utf-8", errors="replace") if b"\x00" not in data else ""
        extracted = semantic_units(path, text, disposition)
        sorted_links = sorted(links)
        link_digest = sha256_bytes("\n".join(f"{ref}\t{tree}" for ref, tree in sorted_links).encode())
        atom_ids = []
        non_atom_ids = []
        for atom_ordinal, extracted_unit in enumerate(extracted, 1):
            line = extracted_unit["start_line"]
            end_line = extracted_unit["end_line"]
            kind = extracted_unit["kind"]
            owner = extracted_unit["symbol_owner"]
            atom_text = extracted_unit["text"]
            atom_id = f"{repository_id}:ATOM:{ordinal:05d}:{atom_ordinal:04d}"
            if len(re.sub(r"\W", "", atom_text, flags=re.UNICODE)) < 8:
                non_atom_id = atom_id.replace(":ATOM:", ":NONATOM:")
                non_atom_ids.append(non_atom_id)
                redacted_text, redactions = redact_sensitive(atom_text)
                non_atoms.append({
                    "non_atom_id": non_atom_id,
                    "repository_id": repository_id,
                    "parent_aggregate_entry_id": entry_id,
                    "source_path": path,
                    "source_blob": oid,
                    "source_span": {"start_line": line, "end_line": end_line},
                    "symbol_owner": owner,
                    "source_excerpt": redacted_text,
                    "source_excerpt_redactions": redactions,
                    "source_excerpt_contains_raw_sensitive_value": False,
                    "disposition": "explicit_non_atom_too_short",
                    "reason_code": "SEMANTIC_UNIT_TOO_SHORT",
                    "extractor_version": EXTRACTOR_VERSION,
                    "coverage_credit": False,
                    "verified": False,
                })
                continue
            semantic_digest = sha256_bytes(f"{kind}\n{atom_text}".encode())
            semantic_digest_owners[semantic_digest].append(atom_id)
            atom_ids.append(atom_id)
            redacted_excerpt, redactions = redact_sensitive(atom_text)
            contract = semantic_contract(kind, atom_text, owner)
            observed_dimensions = sum(contract[name]["status"] == "observed" for name in ("input", "output", "side_effect", "failure", "oracle"))
            # A structural container name alone is not behavioral evidence.  In
            # particular, empty functions, query-call syntax without a visible
            # contract, and test-shaped names must remain review candidates.
            semantic_disposition = "accepted_atom" if observed_dimensions else "needs_review"
            atoms.append({
                "atom_id": atom_id,
                "repository_id": repository_id,
                "parent_aggregate_entry_id": entry_id,
                "source_ref": sorted_links[0][0],
                "source_tree": sorted_links[0][1],
                "source_ref_tree_count": len(sorted_links),
                "source_ref_tree_digest": link_digest,
                "source_path": path,
                "source_blob": oid,
                "source_span": {"start_line": line, "end_line": end_line},
                "source_excerpt": redacted_excerpt,
                "source_excerpt_redactions": redactions,
                "source_excerpt_contains_raw_sensitive_value": False,
                "extractor_version": EXTRACTOR_VERSION,
                "semantic_digest": semantic_digest,
                "text_digest": sha256_bytes(atom_text.encode()),
                "behavior": contract,
                "semantic_disposition": semantic_disposition,
                "observed_semantic_dimension_count": observed_dimensions,
                "candidate_only": True,
                "trusted": False,
                "current": False,
                "coverage_credit": False,
                "verified": False,
            })
        entries.append({
            "entry_id": entry_id,
            "repository_id": repository_id,
            "source_path": path,
            "source_blob": oid,
            "blob_sha256": sha256_bytes(data),
            "byte_count": len(data),
            "source_ref": sorted_links[0][0],
            "source_tree": sorted_links[0][1],
            "source_ref_tree_count": len(sorted_links),
            "source_ref_tree_digest": link_digest,
            "extractor_version": EXTRACTOR_VERSION,
            "disposition": disposition,
            "disposition_reason": reason,
            "behavior_atom_ids": atom_ids,
            "behavior_atom_count": len(atom_ids),
            "explicit_non_atom_ids": non_atom_ids,
            "explicit_non_atom_count": len(non_atom_ids),
            "orphan_candidate": disposition.startswith("atomize_") and not atom_ids,
            "candidate_only": True,
            "trusted": False,
            "current": False,
            "coverage_credit": False,
        })
    overlap_groups = [
        {"semantic_digest": digest, "atom_ids": owners, "count": len(owners)}
        for digest, owners in sorted(semantic_digest_owners.items()) if len(owners) > 1
    ]
    dispositions = Counter(row["disposition"] for row in entries)
    kinds = Counter(row["behavior"]["kind"] for row in atoms)
    return {
        "repository_id": repository_id,
        "candidate_receipt_id": candidate_row["receipt_id"],
        "bundle": {"path_class": "ephemeral-tmp", "sha256": actual, "read_only": True},
        "denominators": {
            "refs": len(refs),
            "root_trees": len(tree_cache),
            "unique_path_content": len(entries),
            "classified_entries": len(entries),
            "behavior_atoms": len(atoms),
            "accepted_atoms": sum(row["semantic_disposition"] == "accepted_atom" for row in atoms),
            "needs_review_atoms": sum(row["semantic_disposition"] == "needs_review" for row in atoms),
            "explicit_non_atoms": len(non_atoms),
            "orphan_candidates": sum(row["orphan_candidate"] for row in entries),
            "unclassified_entries": dispositions["unclassified_explicit"],
            "overlap_groups": len(overlap_groups),
            "overlap_atom_members": sum(row["count"] for row in overlap_groups),
        },
        "by_disposition": dict(sorted(dispositions.items())),
        "by_atom_kind": dict(sorted(kinds.items())),
        "entries": entries,
        "behavior_atoms": atoms,
        "explicit_non_atoms": non_atoms,
        "overlap_groups": overlap_groups,
    }


def canonical_record(record: dict) -> bytes:
    return json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def write_shards(results: list[dict]) -> tuple[list[dict], str]:
    SHARD_DIR.mkdir(parents=True, exist_ok=True)
    for old in list(SHARD_DIR.glob("*.json")) + list(SHARD_DIR.glob("*.json.gz")):
        old.unlink()
    descriptors = []
    global_digest = hashlib.sha256()
    ordinal = 0
    for result in results:
        for record_kind, key in (("entry", "entries"), ("atom", "behavior_atoms"), ("non_atom", "explicit_non_atoms"), ("overlap", "overlap_groups")):
            records = result[key]
            for start in range(0, len(records), SHARD_ROWS):
                ordinal += 1
                chunk = records[start:start + SHARD_ROWS]
                for record in chunk:
                    global_digest.update(canonical_record(record))
                payload = {
                    "schema_version": "helix.exact2-atomic-behavior-shard.v1",
                    "extractor_version": EXTRACTOR_VERSION,
                    "repository_id": result["repository_id"],
                    "record_kind": record_kind,
                    "global_order_ordinal": ordinal,
                    "records": chunk,
                    "trusted": False,
                    "current": False,
                    "coverage_credit": False,
                    "verified": False,
                }
                data = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"
                uncompressed_sha = sha256_bytes(data)
                compressed = gzip.compress(data, compresslevel=9, mtime=0)
                compressed_sha = sha256_bytes(compressed)
                name = f"{ordinal:04d}-{result['repository_id']}-{record_kind}-{compressed_sha[:16]}.json.gz"
                path = SHARD_DIR / name
                path.write_bytes(compressed)
                descriptors.append({
                    "global_order_ordinal": ordinal,
                    "repository_id": result["repository_id"],
                    "record_kind": record_kind,
                    "path": path.relative_to(ROOT).as_posix(),
                    "rows": len(chunk),
                    "codec": GZIP_CODEC,
                    "compressed_bytes": len(compressed),
                    "compressed_sha256": compressed_sha,
                    "uncompressed_bytes": len(data),
                    "uncompressed_sha256": uncompressed_sha,
                    "first_record_id": chunk[0].get("entry_id") or chunk[0].get("atom_id") or chunk[0].get("non_atom_id") or chunk[0]["semantic_digest"],
                    "last_record_id": chunk[-1].get("entry_id") or chunk[-1].get("atom_id") or chunk[-1].get("non_atom_id") or chunk[-1]["semantic_digest"],
                })
    return descriptors, global_digest.hexdigest()


def check_manifest(manifest_path: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    stream = hashlib.sha256()
    entry_ids = set()
    atom_ids = set()
    non_atom_ids = set()
    counts = Counter()
    sensitive_match_counts = Counter()
    expected_ordinal = 0
    for descriptor in manifest["shards"]:
        expected_ordinal += 1
        if descriptor["global_order_ordinal"] != expected_ordinal:
            raise SystemExit("shard order is not contiguous")
        path = ROOT / descriptor["path"]
        compressed = path.read_bytes()
        if len(compressed) != descriptor["compressed_bytes"] or sha256_bytes(compressed) != descriptor["compressed_sha256"]:
            raise SystemExit(f"shard byte/hash mismatch: {descriptor['path']}")
        if descriptor["codec"] != GZIP_CODEC:
            raise SystemExit(f"unsupported shard codec: {descriptor['path']}")
        data = gzip.decompress(compressed)
        if len(data) != descriptor["uncompressed_bytes"] or sha256_bytes(data) != descriptor["uncompressed_sha256"]:
            raise SystemExit(f"uncompressed shard byte/hash mismatch: {descriptor['path']}")
        shard = json.loads(data)
        records = shard["records"]
        if len(records) != descriptor["rows"]:
            raise SystemExit(f"shard row mismatch: {descriptor['path']}")
        if shard["global_order_ordinal"] != expected_ordinal or shard["record_kind"] != descriptor["record_kind"]:
            raise SystemExit(f"shard metadata mismatch: {descriptor['path']}")
        for record in records:
            stream.update(canonical_record(record))
            counts[descriptor["record_kind"]] += 1
            if descriptor["record_kind"] == "entry":
                if record["entry_id"] in entry_ids:
                    raise SystemExit(f"duplicate entry: {record['entry_id']}")
                entry_ids.add(record["entry_id"])
            elif descriptor["record_kind"] == "atom":
                if record["atom_id"] in atom_ids:
                    raise SystemExit(f"duplicate atom: {record['atom_id']}")
                atom_ids.add(record["atom_id"])
                if record.get("source_excerpt_contains_raw_sensitive_value") is not False:
                    raise SystemExit(f"atom lacks fail-closed sensitive marker: {record['atom_id']}")
                for kind, pattern in SENSITIVE_PATTERNS:
                    if pattern.search(record["source_excerpt"]):
                        sensitive_match_counts[kind] += 1
            elif descriptor["record_kind"] == "non_atom":
                if record["non_atom_id"] in non_atom_ids:
                    raise SystemExit(f"duplicate non-atom: {record['non_atom_id']}")
                non_atom_ids.add(record["non_atom_id"])
                if record.get("source_excerpt_contains_raw_sensitive_value") is not False:
                    raise SystemExit(f"non-atom lacks fail-closed sensitive marker: {record['non_atom_id']}")
                for kind, pattern in SENSITIVE_PATTERNS:
                    if pattern.search(record["source_excerpt"]):
                        sensitive_match_counts[kind] += 1
    summary = manifest["summary"]
    if counts["entry"] != summary["unique_path_content"] or counts["atom"] != summary["behavior_atoms"] or counts["non_atom"] != summary["explicit_non_atoms"] or counts["overlap"] != summary["overlap_groups"]:
        raise SystemExit("global denominator mismatch")
    if len(entry_ids) != summary["unique_path_content"] or len(atom_ids) != summary["behavior_atoms"]:
        raise SystemExit("global missing/duplicate record mismatch")
    if stream.hexdigest() != manifest["global_record_stream"]["sha256"]:
        raise SystemExit("global record stream digest mismatch")
    if sensitive_match_counts:
        raise SystemExit(f"raw sensitive pattern remains in atom excerpts: {dict(sensitive_match_counts)}")
    actual = {path.relative_to(ROOT).as_posix() for path in SHARD_DIR.iterdir() if path.is_file()}
    expected = {row["path"] for row in manifest["shards"]}
    if actual != expected:
        raise SystemExit("unlisted or missing content-addressed shard")


def main() -> None:
    if len(sys.argv) == 3 and sys.argv[1] == "--check":
        check_manifest(Path(sys.argv[2]))
        return
    if len(sys.argv) != 2:
        raise SystemExit("usage: extract-exact2-atomic-behavior-candidates.py OUTPUT-MANIFEST.json | --check MANIFEST.json")
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    by_repo = {row["repository"]["id"]: row for row in candidate["records"]}
    with tempfile.TemporaryDirectory(prefix="helix-exact2-readonly-") as temp:
        results = [
            extract_repository(repo_id, bundle, by_repo[repo_id], Path(temp))
            for repo_id, bundle in REPOSITORIES.items()
        ]
    totals = Counter()
    for result in results:
        totals.update(result["denominators"])
    shards, global_stream_sha256 = write_shards(results)
    artifact = {
        "schema_version": "helix.exact2-atomic-behavior-manifest.v1",
        "extractor_version": EXTRACTOR_VERSION,
        "status": "candidate_atomic_behavior_denominator_extracted_not_trusted_not_verified",
        "source_candidate_manifest": {
            "path": CANDIDATE.relative_to(ROOT).as_posix(),
            "sha256": sha256_bytes(CANDIDATE.read_bytes()),
        },
        "safety": {
            "temporary_mirror_only": True,
            "external_network": False,
            "external_write": False,
            "project_cas_write": False,
            "trusted": False,
            "current": False,
            "coverage_credit": False,
            "verified": False,
        },
        "summary": dict(sorted(totals.items())),
        "shard_summary": {
            "shards": len(shards),
            "codec": GZIP_CODEC,
            "max_compressed_shard_bytes": max(row["compressed_bytes"] for row in shards),
            "total_compressed_shard_bytes": sum(row["compressed_bytes"] for row in shards),
            "max_uncompressed_shard_bytes": max(row["uncompressed_bytes"] for row in shards),
            "total_uncompressed_shard_bytes": sum(row["uncompressed_bytes"] for row in shards),
            "max_rows_per_shard": SHARD_ROWS,
        },
        "global_record_stream": {
            "encoding": "canonical JSON record plus LF in shards/global_order_ordinal and record order",
            "rejoin_order": "verify compressed SHA/bytes, deterministic-gzip decompress, verify uncompressed SHA/bytes, then ascending global_order_ordinal and records array order",
            "sha256": global_stream_sha256,
        },
        "invariants": [
            "all 6,667 unique path/content entries receive one explicit disposition",
            "aggregate entry count is never behavior atom count",
            "binary, vendor, generated, historical, and unsupported text remain explicit",
            "overlap is reported and never silently deduplicated",
            "orphan and unclassified denominators remain visible",
            "candidate bundle extraction grants no trusted/current/coverage/verified state",
            "Python AST and structural code blocks retain exact start/end spans and symbol owners",
            "Markdown tables, lists, fenced code, and normative paragraph clauses are block-aware",
            "config semantics are emitted from parsed keys or indentation/section blocks",
            "semantic input/output/side-effect/failure/oracle use observed/not_observed structured values and no generic placeholder text",
            "source excerpts are not truncated and are redacted before shard serialization",
            "too-short semantic units are explicit non-atoms and never inflate behavior atom acceptance",
        ],
        "repositories": [
            {
                "repository_id": result["repository_id"],
                "candidate_receipt_id": result["candidate_receipt_id"],
                "bundle": result["bundle"],
                "denominators": result["denominators"],
                "by_disposition": result["by_disposition"],
                "by_atom_kind": result["by_atom_kind"],
            }
            for result in results
        ],
        "shards": shards,
    }
    output = Path(sys.argv[1])
    output.write_text(
        json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    check_manifest(output)
    if OLD_MONOLITH.exists() and OLD_MONOLITH.resolve() != output.resolve():
        OLD_MONOLITH.unlink()


if __name__ == "__main__":
    main()
