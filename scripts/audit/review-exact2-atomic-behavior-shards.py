#!/usr/bin/env python3
"""exact2 atomic candidate shardsを全件streaming独立監査する。"""

from __future__ import annotations

import argparse
import collections
import gzip
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "docs/governance/generated/exact2-atomic-behavior-manifest-v1.json"
OUTPUT = ROOT / "docs/governance/generated/exact2-atomic-behavior-independent-review-v1.json"
SECRET_PATTERNS = {
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "aws_key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "github_token": re.compile(r"\bgh[ps]_[A-Za-z0-9]{30,}\b"),
    "email_pii": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
}
LEGACY_EXTRACTOR = "helix-exact2-atomic-behavior-candidate.v1"
CURRENT_EXTRACTOR = "helix-exact2-semantic-behavior-candidate.v2"
CURRENT_DIMENSIONS = ("input", "output", "side_effect", "failure", "oracle")


def behavior_schema(record: dict) -> str:
    behavior = record.get("behavior")
    extractor = record.get("extractor_version")
    if extractor == LEGACY_EXTRACTOR and isinstance(behavior, dict) and "input_candidate" in behavior:
        return "legacy_atom_v1"
    if extractor == CURRENT_EXTRACTOR and isinstance(behavior, dict) and all(key in behavior for key in CURRENT_DIMENSIONS):
        return "semantic_behavior_v2"
    raise ValueError(f"unknown exact2 atom schema: extractor={extractor!r}, behavior_keys={sorted(behavior) if isinstance(behavior, dict) else None}")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(record: dict) -> bytes:
    return json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    ids = set()
    entries = {}
    semantic_owners = collections.defaultdict(list)
    counts = collections.Counter()
    kinds = collections.Counter()
    dispositions = collections.Counter()
    repository_atoms = collections.Counter()
    samples = collections.defaultdict(list)
    global_digest = hashlib.sha256()
    expected_ordinal = 0

    for descriptor in sorted(manifest["shards"], key=lambda row: row["global_order_ordinal"]):
        expected_ordinal += 1
        path = ROOT / descriptor["path"]
        compressed = path.read_bytes()
        if descriptor["global_order_ordinal"] != expected_ordinal:
            counts["ordinal_mismatch"] += 1
        if len(compressed) != descriptor["compressed_bytes"] or sha(compressed) != descriptor["compressed_sha256"]:
            counts["compressed_integrity_failure"] += 1
        raw = gzip.decompress(compressed)
        if len(raw) != descriptor["uncompressed_bytes"] or sha(raw) != descriptor["uncompressed_sha256"]:
            counts["uncompressed_integrity_failure"] += 1
        payload = json.loads(raw)
        if len(payload["records"]) != descriptor["rows"] or payload["record_kind"] != descriptor["record_kind"]:
            counts["shard_descriptor_mismatch"] += 1
        for record in payload["records"]:
            global_digest.update(canonical(record))
            kind = payload["record_kind"]
            record_id = record.get("entry_id") or record.get("atom_id") or record.get("non_atom_id") or record.get("semantic_digest")
            if record_id in ids and kind != "overlap":
                counts["duplicate_record_id"] += 1
            ids.add(record_id)
            if kind == "entry":
                entries[record["entry_id"]] = record
                dispositions[record["disposition"]] += 1
                counts["entry"] += 1
                if record["orphan_candidate"]:
                    counts["orphan_candidate"] += 1
            elif kind == "atom":
                counts["atom"] += 1
                repository_atoms[record["repository_id"]] += 1
                schema = behavior_schema(record)
                counts[f"schema_{schema}"] += 1
                atom_kind = record["behavior"]["kind"]
                kinds[atom_kind] += 1
                semantic_owners[(record["repository_id"], record["semantic_digest"])].append(record["atom_id"])
                excerpt = record["source_excerpt"]
                span = record["source_span"]
                issues = []
                if record["parent_aggregate_entry_id"] not in entries:
                    issues.append("parent_entry_missing")
                if span["start_line"] != span["end_line"] or span["start_line"] < 1:
                    issues.append("invalid_single_line_span")
                if not excerpt.strip() or re.fullmatch(r"[\W_]+", excerpt):
                    issues.append("false_atom_punctuation_only")
                if len(excerpt.strip()) < 8:
                    issues.append("false_atom_too_short")
                if len(excerpt) == 400:
                    issues.append("excerpt_truncated_semantic_unverifiable")
                clause_count = len(re.findall(r"[。；;]|\b(?:and|or)\b|、", excerpt)) + 1
                if clause_count >= 4 or len(excerpt) >= 300:
                    issues.append("under_split_multi_clause_line")
                if atom_kind == "normative_requirement_process_gate" and excerpt.startswith(("#", "|")):
                    issues.append("doc_structure_or_table_row_requires_atomization_review")
                behavior = record["behavior"]
                if schema == "legacy_atom_v1":
                    if behavior["input_candidate"].startswith("source-declared") and behavior["output_candidate"].startswith("source-declared"):
                        issues.append("generic_io_placeholder_not_extracted")
                    if behavior["failure_candidate"] == "unresolved_failure_contract":
                        issues.append("failure_contract_unresolved")
                elif schema == "semantic_behavior_v2":
                    for dimension in CURRENT_DIMENSIONS:
                        value = behavior[dimension]
                        if not isinstance(value, dict) or value.get("status") not in {"observed", "not_observed", "not_applicable"} or not isinstance(value.get("values"), list):
                            issues.append("semantic_behavior_dimension_shape_invalid")
                    if not isinstance(behavior.get("symbol_owner"), str) or not behavior["symbol_owner"].strip():
                        issues.append("semantic_behavior_symbol_owner_missing")
                    if record.get("semantic_disposition") not in {"accepted_atom", "needs_review"}:
                        issues.append("semantic_disposition_unknown")
                for label, pattern in SECRET_PATTERNS.items():
                    if pattern.search(excerpt):
                        issues.append(f"sensitive_excerpt_{label}")
                for issue in set(issues):
                    counts[issue] += 1
                    if len(samples[issue]) < 20:
                        samples[issue].append(record["atom_id"])
            elif kind == "non_atom":
                counts["non_atom"] += 1
                if record.get("extractor_version") != CURRENT_EXTRACTOR:
                    raise ValueError(f"unknown exact2 non-atom schema: extractor={record.get('extractor_version')!r}")
                if record.get("parent_aggregate_entry_id") not in entries:
                    counts["parent_entry_missing"] += 1
                if not record.get("reason_code") or not str(record.get("disposition", "")).startswith("explicit_non_atom_"):
                    counts["non_atom_shape_invalid"] += 1
            elif kind == "overlap":
                counts["overlap_record"] += 1
                if record["count"] != len(record["atom_ids"]) or record["count"] < 2:
                    counts["overlap_group_shape_invalid"] += 1
            else:
                raise ValueError(f"unknown exact2 shard record_kind: {kind!r}")

    expected_overlap = {digest: owners for digest, owners in semantic_owners.items() if len(owners) > 1}
    if counts["overlap_record"] != len(expected_overlap):
        counts["overlap_denominator_mismatch"] += 1
    if global_digest.hexdigest() != manifest["global_record_stream"]["sha256"]:
        counts["global_stream_digest_mismatch"] += 1
    physical_error_keys = ("ordinal_mismatch", "compressed_integrity_failure", "uncompressed_integrity_failure", "shard_descriptor_mismatch", "duplicate_record_id", "parent_entry_missing", "non_atom_shape_invalid", "overlap_group_shape_invalid", "overlap_denominator_mismatch", "global_stream_digest_mismatch")
    physical_errors = sum(counts[key] for key in physical_error_keys)
    semantic_findings = {key: value for key, value in counts.items() if key.startswith(("false_atom", "excerpt_", "under_split", "doc_structure", "generic_io", "failure_contract", "sensitive_excerpt"))}
    payload = {
        "schema_version": "helix.exact2-atomic-behavior-independent-review.v1",
        "status": "physical_shards_pass_semantic_atomization_fail_closed_not_trusted" if physical_errors == 0 else "physical_shard_integrity_failed",
        "source": {"path": str(MANIFEST.relative_to(ROOT)), "sha256": sha(MANIFEST.read_bytes())},
        "physical": {"shards": expected_ordinal, "entries": counts["entry"], "atoms": counts["atom"], "non_atoms": counts["non_atom"], "overlap_groups": counts["overlap_record"], "atom_schema_dispatch": {"legacy_atom_v1": counts["schema_legacy_atom_v1"], "semantic_behavior_v2": counts["schema_semantic_behavior_v2"]}, "global_stream_sha256": global_digest.hexdigest(), "errors": physical_errors, "error_counts": {key: counts[key] for key in physical_error_keys}},
        "layered_semantics": {"by_kind": dict(sorted(kinds.items())), "by_disposition": dict(sorted(dispositions.items())), "by_repository_atoms": dict(sorted(repository_atoms.items())), "orphan_candidates": counts["orphan_candidate"], "unclassified_entries": dispositions["unclassified_explicit"], "historical_entries": dispositions["historical_explicit"], "binary_entries": dispositions["binary_explicit"], "semantic_findings": dict(sorted(semantic_findings.items()))},
        "decision": {"candidate_lines_reviewed": counts["atom"], "accepted_atomic_behavior_atoms": 0, "reason": "single-line regex hit、generic I/O placeholder、未解決failure、multi-clause/doc table候補をsemantic atom確定へ昇格できない", "required_next": "language-aware AST/Markdown block/config parserでspan、symbol owner、input/output/side effect/failure/oracleを抽出し、over/under split challengeを個票解消する"},
        "samples_by_finding_atom_id_only": dict(sorted(samples.items())),
        "safety": {"trusted": False, "current": False, "verified": False, "coverage_credit": False, "secret_or_pii_values_emitted": False},
    }
    expected_atoms = manifest["summary"]["behavior_atoms"]
    assert counts["atom"] == expected_atoms and expected_ordinal == len(manifest["shards"])
    encoded = (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != encoded:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.write_bytes(encoded)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
