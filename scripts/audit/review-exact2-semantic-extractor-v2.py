#!/usr/bin/env python3
"""Full physical and layered-semantic review of exact2 extractor v2 shards."""

import argparse
import collections
import gzip
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "docs/governance/generated/exact2-atomic-behavior-manifest-v1.json"
OUTPUT = ROOT / "docs/governance/generated/exact2-semantic-extractor-v2-independent-review-v1.json"
BASELINE_SHA = "8bbb14bff70208be09634f01d0fa34e64cce11978e7b258ee92737e14bb9a7bc"
FIELDS = ("input", "output", "side_effect", "failure", "oracle")
GENERIC = re.compile(r"^(?:input|arg(?:ument)?|param(?:eter)?|Given|request|event|payload|trigger|condition|return|output|result|response|artifact|Then|emit|projection|write|save|insert|update|delete|spawn|exec|push|create|commit|publish|send|fail(?:ure)?|error|throw|reject|deny|except|rollback|timeout|cancel|expect|assert|verify|acceptance|must|shall|required|invariant|拒否|失敗|必須|受入)$", re.I)
SENSITIVE = {
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "github_token": re.compile(r"\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{12,}\b"),
    "aws_key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "private_key": re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    "credential": re.compile(r"(?i)\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\b\s*[:=]\s*[\"']?[^\s\"',;}]{4,}"),
}


def sha(data): return hashlib.sha256(data).hexdigest()
def canonical(row): return json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--check", action="store_true"); args = ap.parse_args()
    manifest = json.loads(MANIFEST.read_text())
    counts = collections.Counter(); kinds = collections.Counter(); issue_counts = collections.Counter()
    entries = {}; atom_ids = set(); semantic_owners = collections.defaultdict(list); overlap_seen = {}
    parent_span = collections.defaultdict(list); corrected = []; findings = []; global_sha = hashlib.sha256()
    physical_errors = []
    for ordinal, desc in enumerate(sorted(manifest["shards"], key=lambda x:x["global_order_ordinal"]), 1):
        path = ROOT / desc["path"]; comp = path.read_bytes()
        if desc["global_order_ordinal"] != ordinal: physical_errors.append([desc["path"], "ordinal"])
        if len(comp) != desc["compressed_bytes"] or sha(comp) != desc["compressed_sha256"]: physical_errors.append([desc["path"], "compressed_integrity"])
        raw = gzip.decompress(comp)
        if len(raw) != desc["uncompressed_bytes"] or sha(raw) != desc["uncompressed_sha256"]: physical_errors.append([desc["path"], "uncompressed_integrity"])
        payload = json.loads(raw)
        if payload["record_kind"] != desc["record_kind"] or len(payload["records"]) != desc["rows"]: physical_errors.append([desc["path"], "descriptor_shape"])
        for row in payload["records"]:
            global_sha.update(canonical(row)); kind = desc["record_kind"]; counts[kind] += 1
            if kind == "entry":
                entries[row["entry_id"]] = row
                counts["orphan"] += bool(row["orphan_candidate"]); counts["unclassified"] += row["disposition"] == "unclassified_explicit"
            elif kind == "atom":
                aid=row["atom_id"]; atom_ids.add(aid); b=row["behavior"]; ak=b["kind"]; kinds[ak]+=1; local=[]
                if row["parent_aggregate_entry_id"] not in entries: local.append("parent_missing")
                span=row["source_span"]; excerpt=row["source_excerpt"]
                if span["start_line"] < 1 or span["end_line"] < span["start_line"]: local.append("invalid_span")
                if not b.get("symbol_owner", "").strip(): local.append("owner_missing")
                if row["source_excerpt_contains_raw_sensitive_value"]: local.append("raw_sensitive_flag_true")
                for label, pattern in SENSITIVE.items():
                    if pattern.search(excerpt): local.append("raw_sensitive_"+label)
                if not row["source_excerpt_redactions"] and sha(excerpt.encode()) != row["text_digest"]: local.append("full_excerpt_digest_mismatch")
                observed=0; values=[]
                for field in FIELDS:
                    item=b.get(field)
                    if not isinstance(item,dict) or item.get("status") not in {"observed","not_observed"} or not isinstance(item.get("values"),list): local.append("structured_contract_shape_invalid"); continue
                    if (item["status"] == "observed") != bool(item["values"]): local.append("structured_contract_status_invalid")
                    observed += item["status"] == "observed"; values.extend(item["values"])
                if observed != row["observed_semantic_dimension_count"]: local.append("dimension_count_mismatch")
                expected="accepted_atom" if observed else "needs_review"
                if row["semantic_disposition"] != expected: local.append("accepted_rule_mismatch")
                if row["semantic_disposition"] == "accepted_atom" and values and all(GENERIC.fullmatch(v) for v in values): local.append("generic_contract_lexeme_only")
                suffix=Path(row["source_path"]).suffix.lower()
                if suffix==".py" and ak not in {"symbol","test_oracle","query"}: local.append("python_ast_layer_mismatch")
                if suffix in {".ts",".tsx",".js",".jsx",".mjs",".cjs"} and ak not in {"symbol","test_oracle"}: local.append("ts_brace_layer_mismatch")
                if suffix in {".md",".mdx",".rst",".txt"} and not ak.startswith("normative_"): local.append("markdown_layer_mismatch")
                if suffix in {".json",".jsonc",".yaml",".yml",".toml",".ini",".cfg"} and ak not in {"script_dependency_semantics","ci_hook_semantics"}: local.append("config_layer_mismatch")
                clauses=len(re.findall(r"[。；;]|\b(?:and|or|then)\b",excerpt,re.I))+1
                if clauses >= 5 or len(excerpt) > 1000: local.append("under_split_candidate")
                if not re.search(r"[\w\u3040-\u30ff\u3400-\u9fff]",excerpt): local.append("false_atom_nonsemantic")
                if ak in {"symbol","test_oracle","query"} and observed==0:
                    corrected.append(aid)
                parent_span[(row["parent_aggregate_entry_id"],span["start_line"],span["end_line"])].append(aid)
                semantic_owners[(row["repository_id"],row["semantic_digest"])].append(aid)
                for code in sorted(set(local)):
                    issue_counts[code]+=1
                    if code != "generic_contract_lexeme_only": findings.append({"atom_id":aid,"code":code})
            elif kind == "non_atom":
                if row["verified"] or row["coverage_credit"]: physical_errors.append([row["non_atom_id"],"nonatom_credit"])
            else:
                overlap_seen[(row.get("repository_id",desc["repository_id"]),row["semantic_digest"])]=row["atom_ids"]
                if row["count"] != len(row["atom_ids"]) or row["count"] < 2: physical_errors.append([row["semantic_digest"],"overlap_shape"])
    expected_overlap={k:v for k,v in semantic_owners.items() if len(v)>1}
    if overlap_seen != expected_overlap: physical_errors.append(["overlap","ownership_mismatch"])
    if global_sha.hexdigest()!=manifest["global_record_stream"]["sha256"]: physical_errors.append(["manifest","global_stream"])
    over_split=[]
    for ids in parent_span.values():
        if len(ids)>1: over_split.extend(ids)
    issue_counts["over_split_same_span_candidate"] = len(over_split)
    summary=manifest["summary"]
    denomination_ok = (counts["entry"],counts["atom"],counts["non_atom"],counts["overlap"],counts["orphan"],counts["unclassified"]) == (6667,340984,26111,70271,426,416)
    if not denomination_ok: physical_errors.append(["manifest","denominator_mismatch"])
    result={
      "schema_version":"helix.exact2-semantic-extractor-v2-independent-review.v1",
      "status":"physical_pass_semantic_candidate_review_open_not_verified" if not physical_errors else "physical_integrity_failed",
      "sources":{"reviewed_baseline_manifest_sha256":BASELINE_SHA,"corrected_manifest":{"path":str(MANIFEST.relative_to(ROOT)),"sha256":sha(MANIFEST.read_bytes())}},
      "physical":{"shards":116,"entries":counts["entry"],"atoms":counts["atom"],"non_atoms":counts["non_atom"],"overlap_groups":counts["overlap"],"orphan":counts["orphan"],"unclassified":counts["unclassified"],"global_stream_sha256":global_sha.hexdigest(),"errors":physical_errors},
      "correction":{"reason":"structural symbol/test/query kind alone was incorrectly accepted with zero observed behavioral dimensions","reclassified_accepted_to_needs_review":len(corrected),"atom_ids":corrected,"before":{"accepted_candidate":81304,"needs_review":259680},"after":{"accepted_candidate":summary["accepted_atoms"],"needs_review":summary["needs_review_atoms"]}},
      "layered_semantics":{"by_kind":dict(sorted(kinds.items())),"issue_counts":dict(sorted(issue_counts.items())),"individual_non_generic_findings":findings,"over_split_atom_ids":over_split},
      "decision":{"accepted_candidates_verified":0,"accepted_candidates_promoted":0,"accepted_candidate_count":summary["accepted_atoms"],"needs_review_count":summary["needs_review_atoms"],"generic_contract_rows_require_enrichment":issue_counts["generic_contract_lexeme_only"],"note":"accepted is extractor-candidate classification only; generic keyword lexemes do not prove exact I/O, side-effect, failure, or oracle contracts"},
      "safety":{"trusted":False,"current":False,"verified":False,"coverage_credit":False,"raw_secret_or_pii_findings":sum(v for k,v in issue_counts.items() if k.startswith("raw_sensitive")),"raw_sensitive_values_emitted":False},
    }
    encoded=(json.dumps(result,ensure_ascii=False,sort_keys=True,separators=(",",":"))+"\n").encode()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes()!=encoded: raise SystemExit("review artifact stale")
    else: OUTPUT.write_bytes(encoded)
    if physical_errors: raise SystemExit("physical integrity failed")

if __name__ == "__main__": main()
