#!/usr/bin/env python3
"""Independent full review of exact2 semantic normalization shards."""

from __future__ import annotations

import collections
import gzip
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "docs/governance/generated/exact2-semantic-normalization-manifest-v1.json"
SOURCE = ROOT / "docs/governance/generated/exact2-atomic-behavior-manifest-v1.json"
SOURCE_REVIEW = ROOT / "docs/governance/generated/exact2-semantic-extractor-v2-independent-review-v1.json"
OUTPUT = ROOT / "docs/governance/generated/exact2-semantic-normalization-independent-review-v1.json"
FIELDS = ("input", "output", "side_effect", "failure", "oracle")
GENERIC = re.compile(r"^(?:input|arg(?:ument)?|param(?:eter)?|Given|request|event|payload|trigger|condition|return|output|result|response|artifact|Then|emit|projection|write|save|insert|update|delete|spawn|exec|push|create|commit|publish|send|fail(?:ure)?|error|throw|reject|deny|except|rollback|timeout|cancel|expect|assert|verify|acceptance|must|shall|required|invariant|拒否|失敗|必須|受入)$", re.I)
SENSITIVE = {
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "github_token": re.compile(r"\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{12,}\b"),
    "aws_key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "private_key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
}


def sha(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical(row: dict) -> bytes:
    return json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def split_clauses(text: str) -> list[str]:
    parts = re.split(r"(?<=[。；;])\s*|\s+(?:and|or|then)\s+|(?<=\.)\s+(?=[A-Z])", text, flags=re.I)
    return [part.strip() for part in parts if len(re.sub(r"\W", "", part, flags=re.UNICODE)) >= 8]


def source_records(manifest: dict):
    for descriptor in sorted(manifest["shards"], key=lambda row: row["global_order_ordinal"]):
        payload = json.loads(gzip.decompress((ROOT / descriptor["path"]).read_bytes()))
        for record in payload["records"]:
            yield payload["record_kind"], record


def add_issue(issues: collections.Counter, samples: dict[str, list[str]], code: str, identity: str) -> None:
    issues[code] += 1
    if len(samples[code]) < 25:
        samples[code].append(identity)


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    source_manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
    source_review = json.loads(SOURCE_REVIEW.read_text(encoding="utf-8"))
    issues = collections.Counter()
    samples: dict[str, list[str]] = collections.defaultdict(list)
    counts = collections.Counter()
    stream = hashlib.sha256()
    canonical_rows = {}
    occurrences = {}
    children = collections.defaultdict(list)
    entries = {}
    last_id_by_kind = {}

    for ordinal, descriptor in enumerate(manifest["shards"], 1):
        path = ROOT / descriptor["path"]
        compressed = path.read_bytes()
        if descriptor["global_order_ordinal"] != ordinal:
            add_issue(issues, samples, "non_contiguous_shard_ordinal", descriptor["path"])
        if len(compressed) != descriptor["compressed_bytes"] or sha(compressed) != descriptor["compressed_sha256"]:
            add_issue(issues, samples, "compressed_content_address_mismatch", descriptor["path"])
        if descriptor["compressed_sha256"][:16] not in path.name or compressed[4:8] != b"\x00\x00\x00\x00":
            add_issue(issues, samples, "nondeterministic_shard_name_or_gzip_mtime", descriptor["path"])
        raw = gzip.decompress(compressed)
        if len(raw) != descriptor["uncompressed_bytes"] or sha(raw) != descriptor["uncompressed_sha256"]:
            add_issue(issues, samples, "uncompressed_content_mismatch", descriptor["path"])
        for label, pattern in SENSITIVE.items():
            if pattern.search(raw.decode("utf-8")):
                add_issue(issues, samples, f"raw_sensitive_{label}", descriptor["path"])
        payload = json.loads(raw)
        if raw != canonical(payload) or payload["global_order_ordinal"] != ordinal or payload["record_kind"] != descriptor["record_kind"] or len(payload["records"]) != descriptor["rows"]:
            add_issue(issues, samples, "noncanonical_or_descriptor_shape", descriptor["path"])
        kind = descriptor["record_kind"]
        for row in payload["records"]:
            stream.update(canonical(row))
            counts[kind] += 1
            identity = {
                "entry_disposition": row.get("entry_id"),
                "canonical_behavior": row.get("canonical_behavior_id"),
                "source_occurrence": row.get("occurrence_id"),
                "parser_split_child": row.get("child_id"),
            }[kind]
            if kind in last_id_by_kind and identity <= last_id_by_kind[kind]:
                add_issue(issues, samples, "record_order_or_duplicate", identity)
            last_id_by_kind[kind] = identity
            if row.get("verified") or row.get("coverage_credit") or row.get("trusted") or row.get("current"):
                add_issue(issues, samples, "premature_authority_or_coverage", identity)
            if kind == "entry_disposition":
                entries[identity] = row
            elif kind == "canonical_behavior":
                canonical_rows[identity] = row
            elif kind == "source_occurrence":
                occurrences[identity] = row
            elif kind == "parser_split_child":
                children[row["parent_atom_id"]].append(row)

    if stream.hexdigest() != manifest["global_record_stream"]["sha256"]:
        add_issue(issues, samples, "global_record_stream_mismatch", "manifest")
    expected_counts = {"entry_disposition": 6667, "canonical_behavior": 156508, "source_occurrence": 340984, "parser_split_child": 42388}
    for kind, expected in expected_counts.items():
        if counts[kind] != expected:
            add_issue(issues, samples, "normalized_denominator_mismatch", f"{kind}:{counts[kind]}!={expected}")

    source_atoms = {}
    source_entries = {}
    generic_ids = set()
    needs_review_ids = set()
    source_same_span = collections.defaultdict(list)
    semantic_shapes = collections.defaultdict(set)
    for kind, row in source_records(source_manifest):
        if kind == "entry":
            source_entries[row["entry_id"]] = row
        elif kind == "atom":
            source_atoms[row["atom_id"]] = row
            values = [value for field in FIELDS for value in row["behavior"][field]["values"]]
            if values and all(GENERIC.fullmatch(value) for value in values):
                generic_ids.add(row["atom_id"])
            if row["semantic_disposition"] == "needs_review":
                needs_review_ids.add(row["atom_id"])
            span = row["source_span"]
            source_same_span[(row["parent_aggregate_entry_id"], span["start_line"], span["end_line"])].append(row)
            semantic_shapes[(row["repository_id"], row["semantic_digest"])].add((row["behavior"]["kind"], row["text_digest"]))
    if len(source_atoms) != 340984 or len(source_entries) != 6667 or len(generic_ids) != 77107 or len(needs_review_ids) != 263877:
        add_issue(issues, samples, "source_denominator_reconstruction_mismatch", "source")
    if set(occurrences) != set(source_atoms):
        add_issue(issues, samples, "source_occurrence_bijection_failed", "occurrence-set")
    if any(len(shapes) != 1 for shapes in semantic_shapes.values()):
        add_issue(issues, samples, "canonical_semantic_digest_collision", "source-semantic-key")

    canonical_dispositions = collections.defaultdict(set)
    same_span_declared = collections.Counter()
    candidate_dimensions = collections.Counter()
    generic_routes = collections.Counter()
    needs_review_routes = collections.Counter()
    terminal_count = 0
    for atom_id, source_atom in source_atoms.items():
        occurrence = occurrences.get(atom_id)
        if not occurrence:
            continue
        canonical_id = f"{source_atom['repository_id']}:{source_atom['semantic_digest']}"
        if occurrence["canonical_behavior_id"] != canonical_id or canonical_id not in canonical_rows:
            add_issue(issues, samples, "canonical_occurrence_edge_mismatch", atom_id)
            continue
        canonical_dispositions[canonical_id].add(occurrence["design_disposition"])
        same_span_declared[occurrence["same_span_classification"]] += 1
        disposition = occurrence["design_disposition"]
        if disposition.startswith("terminal_non_adopt"):
            terminal_count += 1
        if atom_id in generic_ids:
            generic_routes[disposition] += 1
        if atom_id in needs_review_ids:
            needs_review_routes[disposition] += 1
        contract = canonical_rows[canonical_id]["contract"]
        dimensions = sum(contract[field]["status"] == "concrete" for field in FIELDS)
        if disposition == "candidate_adopt_concrete_contract":
            candidate_dimensions[dimensions] += 1
            if dimensions == 0:
                add_issue(issues, samples, "candidate_adopt_without_concrete_contract", atom_id)
        if not disposition:
            add_issue(issues, samples, "missing_design_disposition", atom_id)

    disposition_collisions = {key: sorted(values) for key, values in canonical_dispositions.items() if len(values) > 1}
    aggregate_conflicts = 0
    for canonical_id, values in disposition_collisions.items():
        row = canonical_rows[canonical_id]
        if (row.get("aggregate_fail_closed") is True
                and row.get("design_disposition") == "fail_closed_occurrence_disposition_conflict"
                and row.get("occurrence_disposition_set") == values):
            aggregate_conflicts += 1
        else:
            add_issue(issues, samples, "canonical_aggregate_conflict_not_fail_closed", canonical_id)

    independent_same_span = collections.Counter()
    edge_errors = 0
    for members in source_same_span.values():
        if len(members) == 1:
            independent_same_span["single_span_occurrence_edge"] += 1
            atom_id = members[0]["atom_id"]
            if occurrences[atom_id]["same_span_classification"] != "single_span_occurrence_edge":
                edge_errors += 1
            continue
        canonical_ids = {f"{row['repository_id']}:{row['semantic_digest']}" for row in members}
        canonical_frequency = collections.Counter(f"{row['repository_id']}:{row['semantic_digest']}" for row in members)
        for member in members:
            atom_id = member["atom_id"]
            classification = occurrences[atom_id]["same_span_classification"]
            independent_same_span[classification] += 1
            disposition = occurrences[atom_id]["design_disposition"]
            if classification == "duplicate_same_behavior_occurrence_edge" and canonical_frequency[occurrences[atom_id]["canonical_behavior_id"]] < 2:
                edge_errors += 1
            elif classification == "distinct_behavior_co_located_edge" and len(canonical_ids) < 2:
                edge_errors += 1
            elif classification not in {"duplicate_same_behavior_occurrence_edge", "distinct_behavior_co_located_edge", "true_over_split_fragment_edge"}:
                edge_errors += 1
    expected_same_span = {"duplicate_same_behavior_occurrence_edge": 36, "distinct_behavior_co_located_edge": 12323, "true_over_split_fragment_edge": 90656}
    if any(independent_same_span[key] != value for key, value in expected_same_span.items()) or edge_errors:
        add_issue(issues, samples, "same_span_edge_classification_mismatch", str({**independent_same_span, "edge_errors": edge_errors}))
    if sum(independent_same_span[key] for key in expected_same_span) != 103015:
        add_issue(issues, samples, "same_span_denominator_mismatch", "same-span")

    under_split_ids = {
        row["atom_id"] for row in source_review["layered_semantics"]["individual_non_generic_findings"]
        if row["code"] == "under_split_candidate"
    }
    resolved = unresolved = child_errors = 0
    for atom_id in under_split_ids:
        occurrence = occurrences[atom_id]
        expected_clauses = split_clauses(source_atoms[atom_id]["source_excerpt"])
        actual_children = sorted(children.get(atom_id, []), key=lambda row: row["child_id"])
        if len(expected_clauses) >= 2:
            resolved += 1
            if occurrence["design_disposition"] != "superseded_by_parser_split_children" or len(actual_children) != len(expected_clauses):
                child_errors += 1
            elif any(child["clause_digest"] != sha(clause.encode()) for child, clause in zip(actual_children, expected_clauses)):
                child_errors += 1
        else:
            unresolved += 1
            if occurrence["design_disposition"] != "terminal_non_adopt_under_split_parser_unresolved" or actual_children:
                child_errors += 1
    if (len(under_split_ids), resolved, unresolved) != (5647, 4693, 954) or child_errors:
        add_issue(issues, samples, "under_split_parser_projection_mismatch", f"{len(under_split_ids)}/{resolved}/{unresolved}/{child_errors}")

    orphan_terminal = sum(row["design_disposition"] == "terminal_non_adopt_orphan_no_behavior" for row in entries.values())
    unclassified_terminal = sum(row["design_disposition"] == "terminal_non_adopt_unsupported_textual_surface" for row in entries.values())
    if orphan_terminal != 426 or unclassified_terminal != 416:
        add_issue(issues, samples, "entry_terminal_non_adopt_mismatch", f"{orphan_terminal}/{unclassified_terminal}")
    if terminal_count != 292497 or manifest["summary"]["terminal_non_adopt_atoms"] != 292497:
        add_issue(issues, samples, "terminal_non_adopt_count_increased_or_drifted", str(terminal_count))
    if len(disposition_collisions) != 62 or aggregate_conflicts != 62:
        add_issue(issues, samples, "canonical_conflict_denominator_or_fail_close_mismatch", f"{len(disposition_collisions)}/{aggregate_conflicts}")

    blocking_codes = {
        code for code in issues
        if code not in set()
    }
    closure_accepted = not blocking_codes
    result = {
        "schema_version": "helix.exact2-semantic-normalization-independent-review.v1",
        "status": "design_closure_accepted_candidate_not_verified" if closure_accepted else "design_closure_rejected_semantic_normalization_correction_required",
        "generated_at": "2026-07-16",
        "sources": {
            "normalization_manifest": {"path": MANIFEST.relative_to(ROOT).as_posix(), "sha256": sha(MANIFEST.read_bytes())},
            "source_manifest": {"path": SOURCE.relative_to(ROOT).as_posix(), "sha256": sha(SOURCE.read_bytes())},
            "source_review": {"path": SOURCE_REVIEW.relative_to(ROOT).as_posix(), "sha256": sha(SOURCE_REVIEW.read_bytes())},
        },
        "physical": {
            "record_counts": dict(sorted(counts.items())),
            "global_stream_sha256": stream.hexdigest(),
            "content_addressed_determinism": not any(code.startswith(("noncanonical", "nondeterministic", "record_order", "compressed", "uncompressed", "global")) for code in issues),
            "raw_secret_or_pii_findings": sum(value for code, value in issues.items() if code.startswith("raw_sensitive_")),
        },
        "semantic": {
            "source_atoms": len(source_atoms),
            "source_occurrence_bijection": len(set(occurrences).intersection(source_atoms)),
            "canonical_behaviors": len(canonical_rows),
            "canonical_disposition_conflicts_fail_closed": aggregate_conflicts,
            "same_span_independent_atom_members": dict(sorted(independent_same_span.items())),
            "same_span_edge_errors": edge_errors,
            "under_split": {"denominator": len(under_split_ids), "parser_resolved": resolved, "terminal_unresolved": unresolved, "projection_errors": child_errors},
            "generic_lexeme_only": {"denominator": len(generic_ids), "routes": dict(sorted(generic_routes.items()))},
            "baseline_needs_review": {"denominator": len(needs_review_ids), "routes": dict(sorted(needs_review_routes.items()))},
            "candidate_concrete_dimension_counts": dict(sorted(candidate_dimensions.items())),
            "terminal_non_adopt_atoms": terminal_count,
            "orphan_terminal_non_adopt": orphan_terminal,
            "unclassified_terminal_non_adopt": unclassified_terminal,
        },
        "findings": {"issue_counts": dict(sorted(issues.items())), "samples": dict(sorted(samples.items()))},
        "decision": {
            "pending_zero_claimed": manifest["summary"]["pending_design_disposition"] == 0,
            "pending_zero_recognized_as_design_closure": closure_accepted,
            "reason": "canonical behavior must have one disposition and mixed same-span groups must be normalized per duplicate/distinct occurrence edge" if not closure_accepted else "all candidates have a mechanically supported Design disposition",
            "required_correction": "aggregate canonical disposition fail-closed and split mixed same-span groups into duplicate occurrence edges plus distinct canonical behaviors" if not closure_accepted else None,
        },
        "safety": {"trusted": False, "current": False, "verified": False, "coverage_credit": False},
    }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
