#!/usr/bin/env python3
"""Generate the SCF-B-0145 research bundle from pinned Git objects."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-ai-instruction-product-classification-0145"
BINDING = ROOT / "scaffold/bindings/SCF-B-0145.json"
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
MAIN = "7afee33ae892fe1a3cf1085fac4e02d923ece01d"
PR2090 = "1da9a32b9149805f87878dd688047a0a1c9ebed3"
BINDING_ID = "SCF-B-0145"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PROFILE_PATH = "scaffold/legacy-ai-instruction-product-classification-0145/semantic-profile.json"
AUDIT_REPORT_PATH = "scaffold/legacy-ai-instruction-product-classification-0145/independent-source-audit.json"
PROFILE_SHA256 = "sha256:4f72ea9f16fbbf544a579182750511b8e0b01a17b6f6aa521ad388d7e7cb1aea"

PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ai-consumer-relation-inventory.md"
ENTRY_DISPOSITION = "docs/governance/audits/source-rebaseline/legacy-ai-read-entry-disposition.md"
CI_CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
DECISION_RECORD = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
DECISION_PACKET = "docs/governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md"
PHASE_METHOD = "docs/governance/audits/source-rebaseline/legacy-phase-product-classification-method-2026-09-20.md"
REUSE = "docs/governance/legacy-asset-reuse-control.md"
START = "docs/governance/new-generation-start-here.md"
WAVES = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36
        else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
MAIN_CLASSIFICATION_INPUTS = [
    "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
    "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl",
    "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl",
    "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl",
    "scaffold/legacy-source-product-classification-0123/classification-research.jsonl",
    "scaffold/legacy-state-db-product-classification-0127/classification-research.jsonl",
    "scaffold/legacy-lint-candidate-product-classification-0128/classification-research.jsonl",
    "scaffold/legacy-runtime-residual-product-classification-0133/classification-research.jsonl",
    "scaffold/legacy-implementation-residual-0126/classification-research.jsonl",
]
MAIN_INVENTORY_INPUTS = [p.removesuffix("classification-research.jsonl") + "inventory.json" for p in MAIN_CLASSIFICATION_INPUTS]
SNAPSHOTS = {
    "scaffold/legacy-ai-instruction-product-classification-0145/upstream/pr-2090-classification-research.jsonl": "sha256:a92c3731a91f0417ccbdf28fa80913d3ec694d185ddb1ac391e58b907a9f056b",
    "scaffold/legacy-ai-instruction-product-classification-0145/upstream/pr-2090-inventory.json": "sha256:546f173d5ca60e9ba54c3c262d9517cde9a63e4798fef45dfee8a91f883d9a2d",
}
BASE_INPUTS = [
    PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(),
    FAILURE, CONSUMER, ENTRY_DISPOSITION, CI_CONSUMER,
    DECISION_RECORD, DECISION_PACKET, PHASE_METHOD, REUSE, START, MANIFEST,
    *WAVES.values(),
]
PRODUCTS = tuple(L1)
EXPECTED_EXCLUSIONS = {
    "LEGACY-ASSET-3AC78FD8A01E0F9811C5": (".claude/hooks/git-command-guard.ts", "94519967c5565bd024b3da03384f7a12d9622c16af0b0836e534d4ff0434853d"),
    "LEGACY-ASSET-A8DD18BCB237675730CD": (".claude/hooks/session-log.ts", "42434283c9fcb273d9064aea08eb35b56bb0f18ee2d89ce75c85005143e3bc8f"),
    "LEGACY-ASSET-DB4925588127A51391D7": (".claude/hooks/work-guard.ts", "c9aa80b399925bb258de728314dc43f531e0f219c771585d9f661cd0772a7009"),
}
EXPECTED_NEGATIVE_CASES = (
    "target_omission", "target_duplicate", "target_extra", "overlap_injection",
    "source_identity_tamper", "source_blob_tamper", "source_anchor_tamper",
    "source_coverage_tamper", "manual_category_tamper", "manual_product_tamper",
    "manual_product_basis_tamper", "manual_counterevidence_tamper",
    "phase_candidate_tamper", "implementation_status_tamper",
    "history_failure_tamper", "consumer_closure_tamper", "wave44_edge_tamper",
    "authority_promotion", "new_build_promotion", "inventory_target_tamper",
    "inventory_category_count", "inventory_overlap_tamper", "inventory_input_tamper",
    "profile_pin_tamper", "snapshot_2090_inventory_tamper", "snapshot_2090_tamper",
    "binding_omission", "binding_extra", "binding_stale", "malformed_json",
    "duplicate_json_key", "archive_symlink_mode", "archive_nonregular_type",
    "archive_path_mismatch", "manifest_mismatch",
)
RULES = {
    "direct_product_basis": "manual semantic span supports exactly one current four-product L1 candidate; research only",
    "multi_product_conflict": "manual semantic span supports two or more product-boundary candidates; retain the split without selecting an owner",
    "insufficient_basis": "manual semantic span does not support a product candidate; retain the gap",
}


def fail(code: str, detail: str) -> None:
    raise SystemExit(f"{code}: {detail}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def strict_pairs(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate JSON key {key!r}")
        out[key] = value
    return out


def strict_json(data: bytes, label: str):
    try:
        return json.loads(data.decode("utf-8"), object_pairs_hook=strict_pairs)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        fail("E_JSON", f"{label}: {exc}")


@lru_cache(maxsize=None)
def git_bytes(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"])
    except subprocess.CalledProcessError:
        fail("E_BASE_SOURCE", f"{revision}:{path}")


@lru_cache(maxsize=None)
def git_tree(revision: str, path: str) -> tuple[str, str, str]:
    try:
        rows = subprocess.check_output(["git", "ls-tree", revision, "--", path], text=True).splitlines()
    except subprocess.CalledProcessError:
        fail("E_ARCHIVE_STATIC", path)
    if len(rows) != 1:
        fail("E_ARCHIVE_STATIC", f"missing/ambiguous {revision}:{path}")
    try:
        left, actual_path = rows[0].split("\t", 1)
        mode, kind, oid = left.split()
    except ValueError:
        fail("E_ARCHIVE_STATIC", rows[0])
    if actual_path != path or mode not in {"100644", "100755"} or kind != "blob":
        fail("E_ARCHIVE_STATIC", rows[0])
    return mode, kind, oid


def parse_jsonl(data: bytes, label: str) -> list[dict]:
    output = []
    for number, line in enumerate(data.decode("utf-8").splitlines(), 1):
        if not line.strip():
            continue
        row = strict_json(line.encode("utf-8"), f"{label}:{number}")
        if not isinstance(row, dict):
            fail("E_JSON", f"{label}:{number}: object required")
        output.append(row)
    return output


def source_identity(row: dict) -> tuple[str, str, str]:
    source = row.get("source_exact", {})
    path = row.get("source_path") or source.get("source_path")
    digest = source.get("sha256", row.get("source_sha256", ""))
    if isinstance(digest, str):
        digest = digest.removeprefix("sha256:")
    if not isinstance(path, str) or not isinstance(row.get("asset_id"), str) or not isinstance(digest, str):
        fail("E_RESEARCH_INPUT", "research row has no source identity")
    return row["asset_id"], path, digest


def profile_data() -> dict:
    data = (BUNDLE / "semantic-profile.json").read_bytes()
    if tagged(data) != PROFILE_SHA256:
        fail("E_PROFILE_PIN", "manual semantic profile digest changed")
    value = strict_json(data, str(BUNDLE / "semantic-profile.json"))
    if type(value) is not dict or type(value.get("records")) is not list:
        fail("E_PROFILE", "profile object/records required")
    if len(value["records"]) != 72:
        fail("E_PROFILE", f"manual profile record count {len(value['records'])}; expected 72")
    profile_ids = [row.get("asset_id") for row in value["records"] if type(row) is dict]
    profile_paths = [row.get("source_path") for row in value["records"] if type(row) is dict]
    if len(profile_ids) != 72 or len(set(profile_ids)) != 72 or len(profile_paths) != 72 or len(set(profile_paths)) != 72:
        fail("E_PROFILE", "manual profile asset IDs and source paths must be exact and unique")
    category_counts = Counter()
    for row in value["records"]:
        if type(row) is not dict:
            fail("E_PROFILE", "manual record must be an object")
        category = row.get("category")
        products = row.get("candidate_products")
        basis = row.get("product_basis")
        counters = row.get("counterevidence")
        if category not in RULES or type(products) is not list or type(basis) is not list or type(counters) is not list:
            fail("E_CATEGORY", f"invalid category/product evidence for {row.get('source_path')}")
        if len(set(products)) != len(products) or any(product not in PRODUCTS for product in products):
            fail("E_CATEGORY", f"candidate product names/uniqueness for {row.get('source_path')}")
        basis_products = [item.get("product") for item in basis if type(item) is dict]
        if len(basis_products) != len(basis) or len(set(basis_products)) != len(basis_products) or set(basis_products) != set(products):
            fail("E_CATEGORY", f"product basis must exactly support candidates for {row.get('source_path')}")
        counter_products = [item.get("product") for item in counters if type(item) is dict]
        if len(counter_products) != len(counters) or any(product not in PRODUCTS or product in products for product in counter_products):
            fail("E_CATEGORY", f"counterevidence must name a non-candidate product for {row.get('source_path')}")
        valid = {
            "direct_product_basis": len(products) == 1,
            "multi_product_conflict": len(products) >= 2,
            "insufficient_basis": len(products) == 0 and len(basis) == 0,
        }
        if not valid[category]:
            fail("E_CATEGORY", f"category/product-count invariant for {row.get('source_path')}")
        if not isinstance(row.get("semantic_interpretation"), str) or not row["semantic_interpretation"].strip():
            fail("E_PROFILE", f"semantic interpretation missing for {row.get('source_path')}")
        category_counts[category] += 1
    if {key: category_counts.get(key, 0) for key in RULES} != {"direct_product_basis": 28, "multi_product_conflict": 41, "insufficient_basis": 3}:
        fail("E_CATEGORY", f"manual profile category denominator {dict(category_counts)}")
    return value


def upstream_path_bytes(path: str) -> bytes:
    if path.startswith("scaffold/legacy-ai-instruction-product-classification-0145/upstream/"):
        local = BUNDLE / "upstream" / Path(path).name
        try:
            return local.read_bytes()
        except OSError:
            fail("E_RESEARCH_INPUT", path)
    return git_bytes("HEAD", path)


def manifest_sha(path: str) -> str:
    raw = git_bytes(BASE, MANIFEST).decode("utf-8", errors="strict")
    manifest_path = path.removeprefix(ARCHIVE_PREFIX)
    matches = [line for line in raw.splitlines() if line.endswith("  " + manifest_path) or line.endswith(" " + manifest_path)]
    if len(matches) != 1:
        fail("E_ARCHIVE_STATIC", f"manifest entry {path}")
    return "sha256:" + matches[0].split(maxsplit=1)[0]


def strict_base_rows(path: str) -> list[dict]:
    return parse_jsonl(git_bytes(BASE, path), f"{BASE}:{path}")


def pinned_pr_rows(label: str) -> list[dict]:
    path = f"scaffold/legacy-ai-instruction-product-classification-0145/upstream/pr-{label}-classification-research.jsonl"
    data = (BUNDLE / f"upstream/pr-{label}-classification-research.jsonl").read_bytes()
    if tagged(data) != SNAPSHOTS[path]:
        fail("E_RESEARCH_INPUT", f"stale pinned PR #{label} snapshot")
    return parse_jsonl(data, path)


def prior_unions() -> tuple[list[dict], list[dict]]:
    main = [row for path in MAIN_CLASSIFICATION_INPUTS for row in parse_jsonl(git_bytes(MAIN, path), path)]
    pr2090 = pinned_pr_rows("2090")
    return main, pr2090


def target_rows(profile: dict, prior: tuple[list[dict], list[dict], list[dict]]) -> tuple[list[dict], dict, dict]:
    disposition = strict_base_rows(DISPOSITION)
    prefixes = tuple(profile["scope"]["included_unresolved_prefixes"])
    root_paths = set(profile["scope"]["included_unresolved_root_paths"])
    candidates = [row for row in disposition if row.get("disposition") == "unresolved" and
                  (row.get("source_path", "").startswith(prefixes) or row.get("source_path") in root_paths)]
    if len(candidates) != 75:
        fail("E_TARGET_SET", f"pre-overlap candidate count {len(candidates)}")
    prior_rows = [row for group in prior for row in group]
    prior_ids = {source_identity(row)[0] for row in prior_rows}
    prior_pairs = {(source_identity(row)[1], source_identity(row)[2]) for row in prior_rows}
    candidate_ids = {row["asset_id"] for row in candidates}
    candidate_pairs = {(row["source_path"], row["source_sha256"]) for row in candidates}
    duplicate_ids = candidate_ids & prior_ids
    duplicate_pairs = candidate_pairs & prior_pairs
    excluded_rows = profile.get("overlap_exclusions", [])
    expected_exclusions = {row["asset_id"]: (row["source_path"], row["source_sha256"]) for row in excluded_rows}
    if duplicate_ids != set(expected_exclusions):
        fail("E_OVERLAP", f"expected excluded IDs {sorted(expected_exclusions)}, found {sorted(duplicate_ids)}")
    if duplicate_pairs != set(expected_exclusions.values()):
        fail("E_OVERLAP", "source path/SHA overlap does not match explicit exclusion list")
    if expected_exclusions != EXPECTED_EXCLUSIONS:
        fail("E_OVERLAP", "overlap exclusions differ from #2078 records integrated into current main")
    target = [row for row in candidates if row["asset_id"] not in duplicate_ids]
    if len(target) != 72:
        fail("E_TARGET_SET", f"target count {len(target)}")
    profile_by_path = {row.get("source_path"): row for row in profile["records"]}
    expected_paths = {row["source_path"] for row in target}
    if set(profile_by_path) != expected_paths:
        fail("E_TARGET_SET", "manual profile path set differs from exact target set")
    for row in target:
        manual = profile_by_path[row["source_path"]]
        if manual.get("asset_id") != row["asset_id"] or manual.get("source_sha256") != row["source_sha256"]:
            fail("E_SOURCE", f"profile identity mismatch for {row['source_path']}")
    summary = {
        "candidate_count_before_overlap_exclusion": len(candidates),
        "excluded_overlap_count": len(duplicate_ids),
        "excluded_asset_ids": sorted(duplicate_ids),
        "target_count": len(target),
    }
    prior_sets = {}
    for label, group in zip(("main", "pr_2090"), prior, strict=True):
        prior_sets[label] = {
            "count": len({source_identity(row)[0] for row in group}),
            "ids": {source_identity(row)[0] for row in group},
            "path_sha": {(source_identity(row)[1], source_identity(row)[2]) for row in group},
        }
    expected_prior_counts = {"main": 496, "pr_2090": 41}
    for label, expected_count in expected_prior_counts.items():
        if len(prior_sets[label]["ids"]) != expected_count:
            fail("E_RESEARCH_INPUT", f"{label} target count {len(prior_sets[label]['ids'])}; expected {expected_count}")
    labels = tuple(expected_prior_counts)
    for index, left in enumerate(labels):
        for right in labels[index + 1:]:
            if prior_sets[left]["ids"] & prior_sets[right]["ids"]:
                fail("E_OVERLAP", f"prior target ID overlap: {left}/{right}")
            if prior_sets[left]["path_sha"] & prior_sets[right]["path_sha"]:
                fail("E_OVERLAP", f"prior source path/SHA overlap: {left}/{right}")
    return sorted(target, key=lambda row: row["source_path"]), summary, prior_sets


def ranges_expected(path: str, content: bytes, line_start: int, line_end: int) -> dict:
    lines = content.decode("utf-8", errors="replace").splitlines()
    if not (1 <= line_start <= line_end <= len(lines)):
        fail("E_SOURCE_ANCHOR", f"{path}:{line_start}-{line_end}")
    selected = lines[line_start - 1:line_end]
    unread = []
    if line_start > 1:
        unread.append([1, line_start - 1])
    if line_end < len(lines):
        unread.append([line_end + 1, len(lines)])
    return {
        "source_line_count": len(lines),
        "anchor_line_count": len(selected),
        "coverage_ratio": round(len(selected) / max(1, len(lines)), 6),
        "unread_line_ranges": unread,
        "semantic_anchor": {
            "line_start": line_start,
            "line_end": line_end,
            "line_text": selected,
            "line_text_sha256": tagged("\n".join(selected).encode("utf-8")),
        },
    }


def expected_source(asset: dict, manual: dict) -> dict:
    source_path = asset["source_path"]
    archive_path = ARCHIVE_PREFIX + source_path
    mode, kind, oid = git_tree(BASE, archive_path)
    data = git_bytes(BASE, archive_path)
    digest = tagged(data)
    ledger_digest = "sha256:" + asset["source_sha256"]
    manifest_digest = manifest_sha(archive_path)
    if digest != ledger_digest or digest != manifest_digest:
        fail("E_ARCHIVE_MANIFEST", f"digest mismatch for {archive_path}")
    if hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() != oid:
        fail("E_ARCHIVE_STATIC", f"blob oid mismatch for {archive_path}")
    coverage = ranges_expected(source_path, data, manual["line_start"], manual["line_end"])
    return {
        "source_path": source_path,
        "archive_path": archive_path,
        "archive_type": kind,
        "archive_mode": mode,
        "blob": oid,
        "bytes": len(data),
        "sha256": digest,
        "ledger_source_sha256": ledger_digest,
        "ledger_digest_match": digest == ledger_digest,
        "archive_manifest_sha256": manifest_digest,
        "archive_manifest_match": digest == manifest_digest,
        "line_count": coverage["source_line_count"],
        "anchor_line_coverage": {key: value for key, value in coverage.items() if key != "semantic_anchor"},
        "semantic_anchor": coverage["semantic_anchor"] | {"interpretation": manual["semantic_interpretation"]},
        "read_mode": "git_object_static_read_only",
    }


def source_range(path: str, line_start: int, line_end: int) -> dict:
    content = git_bytes(BASE, path)
    mode, kind, oid = git_tree(BASE, path)
    if kind != "blob":
        fail("E_BASE_SOURCE", path)
    details = ranges_expected(path, content, line_start, line_end)["semantic_anchor"]
    return {"path": path, "blob": oid, "sha256": tagged(content), "mode": mode, **details}


def boundary_evidence() -> dict:
    ranges = [(36, 39), (54, 65), (86, 89)]
    return {"path": BOUNDARY, "blob": git_tree(BASE, BOUNDARY)[2], "sha256": tagged(git_bytes(BASE, BOUNDARY),),
            "ranges": [source_range(BOUNDARY, *r) for r in ranges]}


def l1_evidence() -> dict:
    ranges = {
        "HELIX-HARNESS": [(22, 35), (54, 58)],
        "HELIX-OS": [(22, 40), (59, 63)],
        "HELIX-Web": [(24, 35), (45, 49)],
        "HELIX-Web-OS": [(14, 23), (37, 44)],
    }
    output = {}
    for product, path in L1.items():
        output[product] = {"path": path, "blob": git_tree(BASE, path)[2], "sha256": tagged(git_bytes(BASE, path)),
                           "ranges": [source_range(path, *item) for item in ranges[product]]}
    return output


def phase_map() -> dict[str, dict]:
    return {row["asset_id"]: (number, row) for number, row in enumerate(strict_base_rows(PHASE), 1)}


def decision_map(path: str) -> dict[str, tuple[int, dict]]:
    output = {}
    for number, row in enumerate(strict_base_rows(path), 1):
        asset_id = row.get("asset_id")
        if isinstance(asset_id, str):
            output[asset_id] = (number, row)
    return output


def wave_links(target_ids: set[str], source_paths: set[str]) -> tuple[list[dict], int, dict[str, list[dict]]]:
    links = []
    per_asset: dict[str, list[dict]] = {asset_id: [] for asset_id in target_ids}
    path_to_id = {row["source_path"]: row["asset_id"] for row in strict_base_rows(DISPOSITION) if row.get("asset_id") in target_ids}
    for number, path in WAVES.items():
        blob = git_bytes(BASE, path)
        for line_no, row in enumerate(parse_jsonl(blob, path), 1):
            asset_id = row.get("asset_id")
            exact_path_values = {value for key, value in row.items() if key in {"source_path", "archive_path"} and isinstance(value, str)}
            matching_ids = {asset_id} if asset_id in target_ids else set()
            if not matching_ids:
                matching_ids = {path_to_id[path] for path in exact_path_values & source_paths}
            for found_id in matching_ids:
                entry = {
                    "wave": number,
                    "path": path,
                    "line": line_no,
                    "row_sha256": tagged(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")),
                    "review_id": row.get("review_id"),
                    "source_requirement_id": row.get("source_requirement_id"),
                    "semantic_relation": row.get("semantic_relation"),
                    "semantic_link_status": row.get("semantic_link_status"),
                    "candidate_phase_targets": row.get("candidate_phase_targets", row.get("phase_candidates", [])),
                    "candidate_product_targets": row.get("candidate_product_targets", row.get("product_scope", [])),
                    "current_requirement_implementation_status": row.get("current_requirement_implementation_status"),
                    "consumer_closure_status": row.get("consumer_closure_status"),
                    "legacy_execution_status": row.get("legacy_execution_status"),
                }
                links.append({"asset_id": found_id, **entry})
                per_asset[found_id].append(entry)
    return links, len(links), per_asset


def relation_ids(path: str, family: str) -> list[str]:
    if family in {"root_project_instructions", "native_runtime_policy", "consumer_instructions"}:
        return ["AICR-01", "AICR-06"] if path.startswith("docs/templates/") else ["AICR-01"]
    if family in {"native_agent", "adapter_agent"}:
        return ["AICR-03"] + (["AICR-06"] if family == "adapter_agent" else [])
    if family in {"native_command", "adapter_command"}:
        return ["AICR-03"] + (["AICR-06"] if family == "adapter_command" else [])
    if family == "runtime_adapter":
        return ["AICR-05"] + (["AICR-06"] if path.startswith("docs/templates/") else [])
    return []


def evidence_refs(path: str) -> dict:
    docs = [
        ENTRY_DISPOSITION, CONSUMER, FAILURE, CI_CONSUMER,
        DECISION_RECORD, DECISION_PACKET, REUSE, START,
    ]
    refs = []
    for ref in docs:
        mode, kind, oid = git_tree(BASE, ref)
        refs.append({"path": ref, "blob": oid, "sha256": tagged(git_bytes(BASE, ref)), "read_mode": "git_object_static_read_only"})
    return {
        "asset_decision": None,
        "read_after": None,
        "historical_context": refs,
        "failure_consumer_static": {
            "failure": {"path": FAILURE, "blob": git_tree(BASE, FAILURE)[2], "sha256": tagged(git_bytes(BASE, FAILURE))},
            "consumer": {"path": CONSUMER, "blob": git_tree(BASE, CONSUMER)[2], "sha256": tagged(git_bytes(BASE, CONSUMER))},
            "relation_inventory": {"path": ENTRY_DISPOSITION, "blob": git_tree(BASE, ENTRY_DISPOSITION)[2], "sha256": tagged(git_bytes(BASE, ENTRY_DISPOSITION))},
            "failure_observation": "asset_specific_failure_or_degradation_not_established; static source behavior is not runtime evidence",
            "consumer_relation_ids": relation_ids(path, family_for_path(path)),
            "consumer_closure_status": "pending",
            "consumer_refs_in_legacy_ledger": [],
        },
    }


def family_for_path(path: str) -> str:
    if path.startswith(".cursor/"): return "external_cursor"
    if path.startswith(".claude/agents/"): return "native_agent"
    if path.startswith(".claude/commands/"): return "native_command"
    if path.startswith("docs/templates/adapter/.claude/agents/"): return "adapter_agent"
    if path.startswith("docs/templates/adapter/.claude/commands/"): return "adapter_command"
    if path in {".claude/hooks/agent-guard.ts", ".claude/settings.json", ".codex/config.toml", ".codex/hooks.json",
                "docs/templates/adapter/.claude/settings.json", "docs/templates/adapter/.codex/config.toml",
                "docs/templates/adapter/.codex/hooks.json"}: return "runtime_adapter"
    if path.startswith("docs/templates/adapter/"): return "consumer_instructions"
    if path == ".claude/CLAUDE.md": return "native_runtime_policy"
    if path in {"AGENTS.md", "CLAUDE.md"}: return "root_project_instructions"
    fail("E_PROFILE", f"unknown source family {path}")


def expected_record(asset: dict, manual: dict, phases: dict, decisions: dict, read_after: dict,
                    l1: dict, boundary: dict, links_by_asset: dict[str, list[dict]]) -> dict:
    aid = asset["asset_id"]
    phase_number, phase = phases[aid]
    decision = decisions.get(aid)
    read_after_row = read_after.get(aid)
    source = expected_source(asset, manual)
    family = manual["family"]
    category = manual["category"]
    products = manual["candidate_products"]
    basis = []
    for item in manual["product_basis"]:
        basis.append({**item, "l1_blob": l1[item["product"]]["blob"], "l1_sha256": l1[item["product"]]["sha256"]})
    counters = []
    for item in manual["counterevidence"]:
        counters.append({**item, "l1_blob": l1[item["product"]]["blob"], "l1_sha256": l1[item["product"]]["sha256"]})
    legacy_evidence = {
        key: asset.get(key) for key in (
            "asset_class", "reuse_exclusion_class", "disposition", "source_revision", "source_path",
            "source_sha256", "source_surface", "product_target", "authority_status", "implementation_status",
            "decision_record_ref", "consumer_refs", "migration_preconditions", "rights_status",
            "executability_status", "secret_status", "external_effect_status",
        )
    }
    phase_evidence = {
        "path": PHASE,
        "line": phase_number,
        "row_sha256": tagged(json.dumps(phase, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")),
        "source_path": phase["source_path"],
        "source_sha256": "sha256:" + phase["source_sha256"],
        "artifact_evidence_kind": phase["artifact_evidence_kind"],
        "candidate_phase_targets": phase["candidate_phase_targets"],
        "bootstrap_candidate_product_targets": phase["candidate_product_targets"],
        "phase_classification_status": phase["phase_classification_status"],
        "product_classification_status": phase["product_classification_status"],
        "legacy_implementation_status": phase["legacy_implementation_status"],
        "implementation_evidence_state": phase["implementation_evidence_state"],
        "consumer_closure_status": phase["consumer_closure_status"],
        "legacy_execution_performed": phase["legacy_execution_performed"],
        "unresolved": phase["unresolved"],
        "candidate_only": True,
        "phase_admission_performed": False,
    }
    return {
        "asset_id": aid,
        "source_path": asset["source_path"],
        "source_sha256": asset["source_sha256"],
        "research_scope": {"batch_id": BINDING_ID, "family": family, "new_asset_research": True},
        "source_exact": source,
        "legacy_asset_evidence": legacy_evidence,
        "classification": {
            "category": category,
            "candidate_products": products,
            "product_basis": basis,
            "counterevidence": counters,
            "manual_interpretation": manual["semantic_interpretation"],
            "rule": RULES[category],
            "bootstrap_product_candidates_used_as_authority": False,
        },
        "boundary_evidence": {"product_boundary": boundary, "l1": l1},
        "phase_evidence": phase_evidence,
        "implementation_evidence": {
            "legacy_artifact_evidence_kind": phase["artifact_evidence_kind"],
            "legacy_implementation_status": phase["legacy_implementation_status"],
            "legacy_evidence_state": phase["implementation_evidence_state"],
            "legacy_execution_performed": False,
            "current_successor_evidence_status": "not_established",
            "current_product_implementation_status": "not_established",
            "degradation_or_shrinkage_status": "not_established_from_static_evidence",
            "known_evidence_gaps": ["successor mapping absent", "consumer closure pending", "runtime behavior unverified"],
        },
        "legacy_history_failure_consumer": {
            **evidence_refs(asset["source_path"]),
            "asset_decision": None if decision is None else {"path": DECISIONS, "line": decision[0], "row": decision[1]},
            "read_after": None if read_after_row is None else {"path": READ_AFTER, "line": read_after_row[0], "row": read_after_row[1]},
        },
        "wave_semantic_links": links_by_asset[aid],
        "wave_edge_count": len(links_by_asset[aid]),
        "authority_effect": "none",
        "formal_asset_classification_updated": False,
        "new_build_allowed": False,
        "human_judgment_remaining": [
            "product owner and L1 boundary decision", "semantic span acceptance and unit/connection/composite split",
            "phase admission and successor assignment", "implementation or degradation evidence",
            "consumer closure", "formal asset classification",
        ],
    }


def input_digest(path: str, revision: str) -> dict:
    if path in SNAPSHOTS:
        data = upstream_path_bytes(path)
        expected = SNAPSHOTS[path]
        if tagged(data) != expected:
            fail("E_RESEARCH_INPUT", f"snapshot digest {path}")
        return {"path": path, "revision": "pinned-open-pr-snapshot", "sha256": tagged(data), "bytes": len(data)}
    if path in {PROFILE_PATH, AUDIT_REPORT_PATH}:
        local = BUNDLE / Path(path).name
        try:
            data = local.read_bytes()
        except OSError:
            fail("E_RESEARCH_INPUT", f"missing manual input {path}")
        return {"path": path, "revision": "manual-static-audit-input", "sha256": tagged(data), "bytes": len(data)}
    data = git_bytes(revision, path)
    if revision == BASE:
        current = git_bytes("HEAD", path)
        if current != data:
            fail("E_INPUT_DRIFT", f"current HEAD differs from fixed BASE input {path}")
    return {"path": path, "revision": revision, "sha256": tagged(data), "bytes": len(data), "blob": git_tree(revision, path)[2]}


def build() -> None:
    profile = profile_data()
    prior = prior_unions()
    assets, selection, prior_sets = target_rows(profile, prior)
    profile_by_path = {row["source_path"]: row for row in profile["records"]}
    phases = phase_map()
    decisions = decision_map(DECISIONS)
    read_after = decision_map(READ_AFTER)
    l1 = l1_evidence()
    boundary = boundary_evidence()
    links, wave_edge_count, links_by_asset = wave_links({row["asset_id"] for row in assets}, {row["source_path"] for row in assets})
    ledger_rows = [expected_record(row, profile_by_path[row["source_path"]], phases, decisions, read_after, l1, boundary, links_by_asset) for row in assets]
    output_bytes = b"".join((json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8") for row in ledger_rows)
    (BUNDLE / "classification-research.jsonl").write_bytes(output_bytes)
    category_counts = Counter(row["classification"]["category"] for row in ledger_rows)
    status_counts = Counter(row["phase_evidence"]["phase_classification_status"] for row in ledger_rows)
    implementation_counts = Counter(row["implementation_evidence"]["legacy_implementation_status"] for row in ledger_rows)
    all_prior_ids = set().union(*(prior_sets[label]["ids"] for label in ("main", "pr_2090")))
    all_prior_paths = set().union(*(prior_sets[label]["path_sha"] for label in ("main", "pr_2090")))
    target_ids = {row["asset_id"] for row in assets}
    target_paths = {(row["source_path"], row["source_sha256"]) for row in assets}
    research_inputs = [
        *(input_digest(path, BASE) for path in BASE_INPUTS),
        *(input_digest(path, MAIN) for path in MAIN_CLASSIFICATION_INPUTS + MAIN_INVENTORY_INPUTS),
        *(input_digest(path, MAIN) for path in SNAPSHOTS),
        input_digest(PROFILE_PATH, "manual-static-audit-input"),
        input_digest(AUDIT_REPORT_PATH, "manual-static-audit-input"),
    ]
    archive_inputs = []
    for row in assets:
        archive_path = ARCHIVE_PREFIX + row["source_path"]
        archive_inputs.append({"path": archive_path, "sha256": tagged(git_bytes(BASE, archive_path)), "bytes": len(git_bytes(BASE, archive_path))})
    binding_inputs = {item["path"]: item["sha256"].removeprefix("sha256:") for item in research_inputs}
    for item in archive_inputs:
        binding_inputs[item["path"]] = item["sha256"].removeprefix("sha256:")
    binding = {
        "schema_revision": 1,
        "id": BINDING_ID,
        "kind": "scaffold",
        "title": "固定BASE AI指示・adapter/consumer template 72件の四製品責務候補研究",
        "product": "HELIX-OS",
        "owner_candidate": "四製品 product-boundary 研究（正式owner未解決）",
        "state": "registered",
        "role": "legacy-ai-instruction-product-boundary-research-0145-static",
        "reason": "旧AI指示、provider adapter、consumer templateの意味を固定BASEから静的に調べるresearch-only Scaffold Binding。product欄は登録先であり、単一ownerやauthorityを意味しない。",
        "upstream": [
            ({"path": path, "sha256": digest, "note": "静的read-only参照のみ。旧archiveは実行しない。"}
             if path.startswith("archive/legacy-generation-") else {"path": path, "sha256": digest})
            for path, digest in sorted(binding_inputs.items())
        ],
        "obligations": [
            "固定BASEのunresolved AI instruction/adapter/consumer-template候補75件を導出し、PR重複3件を除いた72件をID/path/SHAで固定する",
            "各旧sourceのGit blob/type/mode/SHA/MANIFESTと手動spanの原文を保ち、source/path identityと意味解釈を混同しない",
            "4製品L1・product-boundary候補、反証、判断史、failure、consumer、phase/implementation evidenceを別々に記録する",
            "current main (496)、PR #2090 (41)、新targetのasset ID/source path-SHA重複をゼロに保つ。#2078はcurrent mainに統合済み",
            "candidate classification、phase candidate、implementation evidenceからformal owner/phase/successor/実装成立を生成しない",
            "旧archive source/runtime/test/hook/adapter/CIを実行せず、独立source audit・validator・negative selfcheckを維持する",
        ],
        "connections": {
            "consumers": ["parent product-classification research ledger", "人間のproduct-boundary判断packet（未接続・採否待ち）"],
            "dependencies": ["fixed BASE disposition/phase/decision/read-after", "four current product L1 and product-boundary", "main 496 + Draft PR #2090 41 pinned research inputs; #2078's 67 are integrated into main", "AICR-01..10 and failure/consumer relation inventories"],
            "boundary": "candidate research evidence only; no formal product, phase, successor, implementation or new-build authority",
        },
        "operations": {
            "allowed": ["read fixed BASE and archive Git objects statically", "write this research-only scaffold bundle and Binding", "run the new generator, validator, independent static source audit and selfcheck"],
            "forbidden": ["execute old-generation archive source/runtime/test/hook/adapter/CI", "promote candidate to formal owner/phase/successor/implementation", "modify formal classification ledgers or phase bootstrap", "merge/close/deploy"],
        },
        "artifacts": [
            "scaffold/bindings/SCF-B-0145.json",
            "scaffold/legacy-ai-instruction-product-classification-0145/README.md",
            "scaffold/legacy-ai-instruction-product-classification-0145/PR-DRAFT.md",
            "scaffold/legacy-ai-instruction-product-classification-0145/generate.py",
            "scaffold/legacy-ai-instruction-product-classification-0145/independent-source-audit.py",
            "scaffold/legacy-ai-instruction-product-classification-0145/independent-source-audit.json",
            "scaffold/legacy-ai-instruction-product-classification-0145/validate.py",
            "scaffold/legacy-ai-instruction-product-classification-0145/selfcheck.py",
            "scaffold/legacy-ai-instruction-product-classification-0145/inventory.json",
            "scaffold/legacy-ai-instruction-product-classification-0145/classification-research.jsonl",
        ],
        "verification": {
            "evidence_kind": "scaffold",
            "scope": ["schema_interface", "deterministic_behavior", "source_revision_stale", "negative_case", "forbidden_write_scope"],
            "oracles": [
                "fixed BASE disposition yields 75 in-scope rows, exact 3 prior duplicates are excluded, and the resulting target set is 72",
                "independent source audit rechecks all 72 original Git objects, archive manifest entries, and line-span strings without importing generator or validator",
                "main496/#2090config41 and new target ID/path-SHA overlaps are recomputed as zero; #2078 is included in main496",
                "validator checks every bound digest, exact record/inventory/Binding contract and research-only authority boundary",
                "semantic interpretation remains a human candidate judgment and is not a validation oracle",
            ],
            "negative_cases": list(EXPECTED_NEGATIVE_CASES),
        },
        "replacement": {"role_target": None, "formal_artifacts": [], "issue": 0, "status": "pending"},
        "created": "2026-09-23",
        "updated": "2026-09-23",
    }
    (BINDING.parent / "SCF-B-0145.json").write_text(json.dumps(binding, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    inventory = {
        "schema_revision": 1,
        "binding_id": BINDING_ID,
        "research_scope": {
            "fixed_base_revision": BASE,
            "current_main_revision": MAIN,
            "included_unresolved_prefixes": profile["scope"]["included_unresolved_prefixes"],
            "included_unresolved_root_paths": profile["scope"]["included_unresolved_root_paths"],
            "target_count": len(assets),
            "target_ids": sorted(target_ids),
            "target_ids_sha256": tagged("\n".join(sorted(target_ids)).encode()),
            "target_source_path_sha256": [{"source_path": path, "source_sha256": sha} for path, sha in sorted(target_paths)],
            "selection": selection,
        },
        "comparison_heads": {
            "main": {"revision": MAIN, "research_union_count": len(prior_sets["main"]["ids"])},
            "pr_2090": {"revision": PR2090, "target_count": len(prior_sets["pr_2090"]["ids"]), "snapshot_prefix": "upstream/pr-2090-"},
        },
        "overlap_status": {
            "main_target_id_overlap": len(target_ids & prior_sets["main"]["ids"]),
            "main_path_sha_overlap": len(target_paths & prior_sets["main"]["path_sha"]),
            "pr_2090_target_id_overlap": len(target_ids & prior_sets["pr_2090"]["ids"]),
            "pr_2090_path_sha_overlap": len(target_paths & prior_sets["pr_2090"]["path_sha"]),
            "combined_prior_id_overlap": len(target_ids & all_prior_ids),
            "combined_prior_path_sha_overlap": len(target_paths & all_prior_paths),
            "excluded_integrated_2078_ids": selection["excluded_asset_ids"],
            "all_zero_required": True,
        },
        "research_union_projection": {
            "current_main_authoritative_research_union": 496,
            "draft_pr_2090_target": 41,
            "new_target": len(assets),
            "deduplicated_candidate_projection": 496 + 41 + len(assets),
            "archive_population": len(strict_base_rows(DISPOSITION)),
            "authority_status": "conditional_unmerged_draft_union_only",
        },
        "classification_counts": {key: category_counts.get(key, 0) for key in RULES},
        "phase_status_counts": dict(sorted(status_counts.items())),
        "legacy_implementation_status_counts": dict(sorted(implementation_counts.items())),
        "wave_edge_count": wave_edge_count,
        "wave_semantic_links": links,
        "source_archive_receipts": archive_inputs,
        "input_digests": research_inputs,
        "profile_sha256": tagged((BUNDLE / "semantic-profile.json").read_bytes()),
        "output_sha256": tagged(output_bytes),
        "authority_boundary": {
            "authority_effect": "none",
            "new_build_allowed": False,
            "formal_asset_classification_updated": False,
            "product_owner_decision": "pending",
            "phase_admission": "pending",
            "successor_assignment": "pending",
            "implementation_and_degradation_evidence": "unknown_or_not_established",
            "consumer_closure": "pending",
            "archive_read_mode": "git_object_static_read_only",
        },
        "human_judgment_remaining": [
            "product owner and L1 boundary decision", "semantic span acceptance and unit/connection/composite split",
            "phase admission and successor assignment", "implementation or degradation evidence",
            "consumer closure", "formal asset classification",
        ],
        "negative_cases_expected_order": list(EXPECTED_NEGATIVE_CASES),
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(f"SCF-B-0145 generate PASS records={len(assets)} categories={dict(category_counts)} wave_edges={wave_edge_count} overlaps=0")


if __name__ == "__main__":
    build()
