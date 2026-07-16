#!/usr/bin/env python3
"""Normalize every exact2 atom into canonical behavior and occurrence edges."""

from __future__ import annotations

import collections
import gzip
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/governance/generated/exact2-atomic-behavior-manifest-v1.json"
SOURCE_REVIEW = ROOT / "docs/governance/generated/exact2-semantic-extractor-v2-independent-review-v1.json"
SHARD_DIR = ROOT / "docs/governance/generated/exact2-semantic-normalized-shards-v1"
ROWS = 5000
FIELDS = ("input", "output", "side_effect", "failure", "oracle")
SENSITIVE = {
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "github_token": re.compile(r"\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{12,}\b"),
    "aws_key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "private_key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
}
IDENT = r"[A-Za-z_$][A-Za-z0-9_$.-]{1,80}"
GENERIC = re.compile(r"^(?:input|arg(?:ument)?|param(?:eter)?|Given|request|event|payload|trigger|condition|return|output|result|response|artifact|Then|emit|projection|write|save|insert|update|delete|spawn|exec|push|create|commit|publish|send|fail(?:ure)?|error|throw|reject|deny|except|rollback|timeout|cancel|expect|assert|verify|acceptance|must|shall|required|invariant|拒否|失敗|必須|受入)$", re.I)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(row: dict) -> bytes:
    return json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def safe_identifiers(pattern: str, text: str, prefix: str) -> list[str]:
    values = []
    for match in re.finditer(pattern, text, re.I):
        value = next((group for group in match.groups() if group), match.group(0))
        if re.fullmatch(IDENT, value) and not any(p.search(value) for p in SENSITIVE.values()):
            values.append(f"{prefix}:{value[:80]}")
    return sorted(set(values))[:32]


def concrete_contract(atom: dict, excerpt: str) -> dict:
    owner = atom["behavior"].get("symbol_owner", "")
    inputs = safe_identifiers(r"(?:function|def)\s+" + IDENT + r"\s*\(([^)]*)\)", excerpt, "parameter-list")
    inputs += safe_identifiers(r"\b(?:argv|process\.env|request|event|payload)\b(?:\.([A-Za-z_$][\w$.-]*))?", excerpt, "source")
    inputs += sorted({f"flag:{flag}" for flag in re.findall(r"--[A-Za-z][A-Za-z0-9-]{1,60}", excerpt)})[:32]
    outputs = safe_identifiers(r"\breturn\s+([A-Za-z_$][\w$.-]*)", excerpt, "return")
    outputs += safe_identifiers(r"\b(?:emit|respond|response|projection)\s*\(?\s*([A-Za-z_$][\w$.-]*)", excerpt, "output")
    effects = safe_identifiers(r"\b((?:write|save|insert|update|delete|spawn|exec|push|create|commit|publish|send)[A-Za-z0-9_$.-]*)\s*\(", excerpt, "call")
    effects += sorted({f"sql:{verb.upper()}" for verb in re.findall(r"\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b", excerpt, re.I)})
    failures = safe_identifiers(r"\b(?:throw\s+new\s+|raise\s+|reject\s*\(|deny\s*\()([A-Za-z_$][\w$.-]*)", excerpt, "failure")
    failures += sorted({f"operator:{word.lower()}" for word in re.findall(r"\b(?:rollback|timeout|fail.close|except)\b|拒否|失敗", excerpt, re.I)})
    oracles = safe_identifiers(r"\b((?:expect|assert|verify|check)[A-Za-z0-9_$.-]*)\s*\(", excerpt, "oracle")
    if atom["behavior"]["kind"] == "test_oracle" and owner:
        oracles.append(f"test-owner:{owner[:80]}")
    if atom["behavior"]["kind"] in {"script_dependency_semantics", "ci_hook_semantics"} and owner:
        inputs.append(f"config-key:{owner[:80]}")
    values = {
        "input": sorted(set(inputs)),
        "output": sorted(set(outputs)),
        "side_effect": sorted(set(effects)),
        "failure": sorted(set(failures)),
        "oracle": sorted(set(oracles)),
    }
    return {
        field: {"status": "concrete" if values[field] else "not_observed", "values": values[field]}
        for field in FIELDS
    }


def split_clauses(text: str) -> list[str]:
    parts = re.split(r"(?<=[。；;])\s*|\s+(?:and|or|then)\s+|(?<=\.)\s+(?=[A-Z])", text, flags=re.I)
    return [part.strip() for part in parts if len(re.sub(r"\W", "", part, flags=re.UNICODE)) >= 8]


def read_source_records():
    manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
    for descriptor in sorted(manifest["shards"], key=lambda row: row["global_order_ordinal"]):
        payload = json.loads(gzip.decompress((ROOT / descriptor["path"]).read_bytes()))
        for record in payload["records"]:
            yield payload["record_kind"], record


def write_shards(kinds: list[tuple[str, list[dict]]]) -> tuple[list[dict], str]:
    SHARD_DIR.mkdir(parents=True, exist_ok=True)
    for old in SHARD_DIR.glob("*.json.gz"):
        old.unlink()
    descriptors = []
    stream = hashlib.sha256()
    ordinal = 0
    for kind, records in kinds:
        for start in range(0, len(records), ROWS):
            ordinal += 1
            chunk = records[start:start + ROWS]
            for record in chunk:
                stream.update(canonical(record))
            payload = {
                "schema_version": "helix.exact2-semantic-normalized-shard.v1",
                "record_kind": kind,
                "global_order_ordinal": ordinal,
                "records": chunk,
                "trusted": False,
                "current": False,
                "verified": False,
                "coverage_credit": False,
            }
            raw = canonical(payload)
            compressed = gzip.compress(raw, compresslevel=9, mtime=0)
            name = f"{ordinal:04d}-{kind}-{sha(compressed)[:16]}.json.gz"
            path = SHARD_DIR / name
            path.write_bytes(compressed)
            descriptors.append({
                "global_order_ordinal": ordinal,
                "record_kind": kind,
                "path": path.relative_to(ROOT).as_posix(),
                "rows": len(chunk),
                "compressed_bytes": len(compressed),
                "compressed_sha256": sha(compressed),
                "uncompressed_bytes": len(raw),
                "uncompressed_sha256": sha(raw),
                "codec": "gzip-rfc1952-python-mtime0-level9",
            })
    return descriptors, stream.hexdigest()


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: normalize-exact2-semantic-design-dispositions.py OUTPUT-MANIFEST.json")
    output = Path(sys.argv[1])
    if not output.is_absolute():
        output = ROOT / output
    source_manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
    review = json.loads(SOURCE_REVIEW.read_text(encoding="utf-8"))
    under_split_ids = {
        row["atom_id"] for row in review["layered_semantics"]["individual_non_generic_findings"]
        if row["code"] == "under_split_candidate"
    }
    entries = []
    atoms = []
    for kind, record in read_source_records():
        if kind == "entry":
            disposition = (
                "terminal_non_adopt_orphan_no_behavior" if record["orphan_candidate"] else
                "terminal_non_adopt_unsupported_textual_surface" if record["disposition"] == "unclassified_explicit" else
                "source_entry_classified"
            )
            entries.append({
                "entry_id": record["entry_id"],
                "repository_id": record["repository_id"],
                "source_path": record["source_path"],
                "source_blob": record["source_blob"],
                "design_disposition": disposition,
                "terminal": disposition.startswith("terminal_"),
                "candidate_only": True,
                "verified": False,
                "coverage_credit": False,
            })
        elif kind == "atom":
            atoms.append(record)

    same_span = collections.defaultdict(list)
    for atom in atoms:
        span = atom["source_span"]
        same_span[(atom["parent_aggregate_entry_id"], span["start_line"], span["end_line"])].append(atom)
    same_span_class = {}
    same_span_counts = collections.Counter()
    for members in same_span.values():
        if len(members) == 1:
            same_span_class[members[0]["atom_id"]] = "single_span_occurrence_edge"
            continue
        semantic_counts = collections.Counter(row["semantic_digest"] for row in members)
        contract_digest_by_atom = {
            row["atom_id"]: sha(canonical(concrete_contract(row, row["source_excerpt"])))
            for row in members
        }
        contract_counts = collections.Counter(contract_digest_by_atom.values())
        for member in members:
            if semantic_counts[member["semantic_digest"]] > 1:
                classification = "duplicate_same_behavior_occurrence_edge"
            elif contract_counts[contract_digest_by_atom[member["atom_id"]]] > 1:
                classification = "true_over_split_fragment_edge"
            else:
                classification = "distinct_behavior_co_located_edge"
            same_span_class[member["atom_id"]] = classification
            same_span_counts[classification] += 1

    canonical_behaviors = {}
    occurrences = []
    parser_children = []
    dispositions = collections.Counter()
    generic_dispositions = collections.Counter()
    baseline_dispositions = collections.defaultdict(collections.Counter)
    canonical_occurrence_dispositions = collections.defaultdict(set)
    for atom in atoms:
        excerpt = atom["source_excerpt"]
        contract = concrete_contract(atom, excerpt)
        concrete_dimensions = sum(contract[field]["status"] == "concrete" for field in FIELDS)
        old_values = [value for field in FIELDS for value in atom["behavior"][field]["values"]]
        generic_lexeme_only = bool(old_values) and all(GENERIC.fullmatch(value) for value in old_values)
        clauses = split_clauses(excerpt) if atom["atom_id"] in under_split_ids else []
        same_class = same_span_class[atom["atom_id"]]
        if len(clauses) >= 2:
            disposition = "superseded_by_parser_split_children"
            for ordinal, clause in enumerate(clauses, 1):
                child_contract = concrete_contract(atom, clause)
                child_dims = sum(child_contract[field]["status"] == "concrete" for field in FIELDS)
                parser_children.append({
                    "child_id": f"{atom['atom_id']}:SPLIT:{ordinal:03d}",
                    "parent_atom_id": atom["atom_id"],
                    "clause_digest": sha(clause.encode()),
                    "contract": child_contract,
                    "design_disposition": "candidate_adopt_concrete_contract" if child_dims else "terminal_non_adopt_insufficient_contract",
                    "candidate_only": True,
                    "verified": False,
                    "coverage_credit": False,
                })
        elif atom["atom_id"] in under_split_ids:
            disposition = "terminal_non_adopt_under_split_parser_unresolved"
        elif same_class == "true_over_split_fragment_edge" and concrete_dimensions == 0:
            disposition = "terminal_non_adopt_true_over_split_fragment"
        elif concrete_dimensions:
            disposition = "candidate_adopt_concrete_contract"
        elif generic_lexeme_only:
            disposition = "terminal_non_adopt_generic_lexeme_only"
        else:
            disposition = "terminal_non_adopt_insufficient_contract"
        dispositions[disposition] += 1
        baseline_dispositions[atom["semantic_disposition"]][disposition] += 1
        if generic_lexeme_only:
            generic_dispositions[disposition] += 1
        behavior_key = f"{atom['repository_id']}:{atom['semantic_digest']}"
        canonical_occurrence_dispositions[behavior_key].add(disposition)
        canonical_behaviors.setdefault(behavior_key, {
            "canonical_behavior_id": behavior_key,
            "repository_id": atom["repository_id"],
            "semantic_digest": atom["semantic_digest"],
            "behavior_kind": atom["behavior"]["kind"],
            "symbol_owner": atom["behavior"].get("symbol_owner"),
            "contract": contract,
            "candidate_only": True,
            "trusted": False,
            "current": False,
            "verified": False,
            "coverage_credit": False,
        })
        occurrences.append({
            "occurrence_id": atom["atom_id"],
            "canonical_behavior_id": behavior_key,
            "repository_id": atom["repository_id"],
            "parent_entry_id": atom["parent_aggregate_entry_id"],
            "source_path": atom["source_path"],
            "source_blob": atom["source_blob"],
            "source_span": atom["source_span"],
            "source_ref_tree_count": atom["source_ref_tree_count"],
            "same_span_classification": same_class,
            "design_disposition": disposition,
            "candidate_only": True,
            "verified": False,
            "coverage_credit": False,
        })

    canonical_conflicts = 0
    for behavior_key, row in canonical_behaviors.items():
        occurrence_dispositions = sorted(canonical_occurrence_dispositions[behavior_key])
        row["occurrence_disposition_set"] = occurrence_dispositions
        if len(occurrence_dispositions) == 1:
            row["design_disposition"] = occurrence_dispositions[0]
            row["aggregate_fail_closed"] = False
        else:
            row["design_disposition"] = "fail_closed_occurrence_disposition_conflict"
            row["aggregate_fail_closed"] = True
            canonical_conflicts += 1
    canonical_rows = sorted(canonical_behaviors.values(), key=lambda row: row["canonical_behavior_id"])
    occurrences.sort(key=lambda row: row["occurrence_id"])
    parser_children.sort(key=lambda row: row["child_id"])
    entries.sort(key=lambda row: row["entry_id"])
    descriptors, stream_sha = write_shards([
        ("entry_disposition", entries),
        ("canonical_behavior", canonical_rows),
        ("source_occurrence", occurrences),
        ("parser_split_child", parser_children),
    ])
    terminal_atoms = sum(count for name, count in dispositions.items() if name.startswith("terminal_"))
    artifact = {
        "schema_version": "helix.exact2-semantic-normalization-manifest.v1",
        "status": "all_candidates_design_dispositioned_independent_review_required",
        "generated_at": "2026-07-16",
        "sources": {
            "manifest": {"path": SOURCE.relative_to(ROOT).as_posix(), "sha256": sha(SOURCE.read_bytes())},
            "review": {"path": SOURCE_REVIEW.relative_to(ROOT).as_posix(), "sha256": sha(SOURCE_REVIEW.read_bytes())},
        },
        "summary": {
            "source_candidates": len(atoms),
            "source_entries": len(entries),
            "canonical_behaviors": len(canonical_rows),
            "source_occurrence_edges": len(occurrences),
            "parser_split_children": len(parser_children),
            "design_dispositions": dict(sorted(dispositions.items())),
            "baseline_semantic_disposition_routes": {
                name: dict(sorted(routes.items())) for name, routes in sorted(baseline_dispositions.items())
            },
            "terminal_non_adopt_atoms": terminal_atoms,
            "pending_design_disposition": 0,
            "orphan_terminal_non_adopt": sum(row["design_disposition"] == "terminal_non_adopt_orphan_no_behavior" for row in entries),
            "unclassified_terminal_non_adopt": sum(row["design_disposition"] == "terminal_non_adopt_unsupported_textual_surface" for row in entries),
            "same_span_classification_atom_members": dict(sorted(same_span_counts.items())),
            "canonical_fail_closed_disposition_conflicts": canonical_conflicts,
            "baseline_generic_lexeme_only": sum(generic_dispositions.values()),
            "generic_lexeme_design_dispositions": dict(sorted(generic_dispositions.items())),
            "baseline_under_split": len(under_split_ids),
            "under_split_parser_resolved_parents": dispositions["superseded_by_parser_split_children"],
            "under_split_terminal_unresolved": dispositions["terminal_non_adopt_under_split_parser_unresolved"],
            "runtime_mutations": 0,
            "verified_true": 0,
            "coverage_credit_true": 0,
        },
        "normalization_contract": {
            "same_span": "each edge is independently classified as duplicate same-behavior occurrence, true over-split fragment, or distinct co-located behavior",
            "canonical_disposition": "one occurrence disposition is inherited; conflicting occurrence dispositions produce a non-adopting fail-closed aggregate without changing occurrence terminal counts",
            "under_split": "parser children carry clause digests and typed contracts; the aggregate parent is superseded only inside this candidate design projection",
            "generic_contract": "generic lexeme presence is insufficient; concrete AST/dataflow/command/config/test-oracle signals are required",
            "insufficient_evidence": "typed terminal non-adopt; reopening requires a new extractor/evidence digest",
            "authority": "candidate design only; independent review required before adoption and coverage",
        },
        "safety": {
            "raw_source_excerpt_emitted": False,
            "raw_sensitive_values_emitted": False,
            "trusted": False,
            "current": False,
            "verified": False,
            "coverage_credit": False,
        },
        "global_record_stream": {"sha256": stream_sha},
        "shards": descriptors,
    }
    if len(atoms) != source_manifest["summary"]["behavior_atoms"] or len(occurrences) != len(atoms):
        raise SystemExit("candidate denominator drift")
    if len(entries) != source_manifest["summary"]["unique_path_content"]:
        raise SystemExit("entry denominator drift")
    if artifact["summary"]["orphan_terminal_non_adopt"] != 426 or artifact["summary"]["unclassified_terminal_non_adopt"] != 416:
        raise SystemExit("orphan/unclassified terminal disposition drift")
    if sum(dispositions.values()) != len(atoms) or artifact["summary"]["pending_design_disposition"]:
        raise SystemExit("not every candidate has a design disposition")
    if sum(generic_dispositions.values()) != 77107:
        raise SystemExit("generic lexeme denominator drift")
    if dispositions["superseded_by_parser_split_children"] + dispositions["terminal_non_adopt_under_split_parser_unresolved"] != 5647:
        raise SystemExit("under-split denominator drift")
    encoded = json.dumps(artifact, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"
    if any(pattern.search(encoded.decode("utf-8")) for pattern in SENSITIVE.values()):
        raise SystemExit("PII/secret pattern in normalized manifest")
    output.write_bytes(encoded)


if __name__ == "__main__":
    main()
