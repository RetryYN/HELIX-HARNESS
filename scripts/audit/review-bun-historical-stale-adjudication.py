#!/usr/bin/env python3
"""Bun historical/stale 367行のclosed-world adjudicationを独立監査する。"""

from __future__ import annotations

import argparse, hashlib, json, re, subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "docs/governance/generated/helix-bun-historical-stale-adjudication-v1.json"
OUTPUT = ROOT / "docs/governance/generated/helix-bun-historical-stale-adjudication-independent-review-v1.json"
L1 = ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
L3 = ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md"
HAT = ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md"
HST = ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md"
GENERIC = re.compile(r"^(?:PLAN-[A-Z0-9-]+|cli\.ts|test\.ts|run\.ts|index\.ts|writer\.ts|bun\s|npm\s|node\s)", re.I)

def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()
def digest(value: object) -> str: return sha(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode())

def main() -> int:
    ap=argparse.ArgumentParser(); ap.add_argument("--check",action="store_true"); args=ap.parse_args()
    x=json.loads(CANDIDATE.read_text())
    authorities="\n".join(p.read_text() for p in (L1,L3,HAT,HST))
    findings=[]; issues=Counter(); dispositions=Counter()
    for row in x["records"]:
        local=[]; dispositions[row["adjudication"]]+=1
        path=ROOT/row["source"]["path"]
        lines=path.read_text(errors="replace").splitlines() if path.exists() else []
        line=lines[row["source"]["line"]-1] if 0 < row["source"]["line"] <= len(lines) else ""
        if not path.exists() or sha(path.read_bytes())!=row["source"]["file_sha256"] or sha(line.encode())!=row["source"]["line_sha256"]:
            local.append("source_line_binding_stale")
        meaningful=[token for token in row["search"]["tokens"] if not GENERIC.match(token) and ("/" in token or re.search(r"(?:Gate|Registry|Engine|Runner|Adapter|Command)$",token))]
        if not meaningful:
            local.append("line_specific_alias_symbol_path_absent")
        for hit in row["search"]["consumer_hits"]:
            hp=ROOT/hit["path"]
            if not hp.exists() or sha(hp.read_bytes())!=hit["sha256"]:
                local.append("consumer_hit_digest_stale"); break
        if row["adjudication"]=="active_reclassify":
            if row["search"]["executable_symbol_hits"]+row["search"]["normative_symbol_hits"]==0 or not meaningful:
                local.append("active_reclassify_without_strong_consumer")
        elif row["adjudication"]=="superseded_by_current":
            local.append("superseded_route_requires_non_plan_semantic_consumer")
        elif row["adjudication"]=="immutable_historical_retain":
            if not meaningful:
                local.append("closed_world_alias_symbol_generated_consumer_unproven")
        elif row["adjudication"]=="stale_orphan_retire_candidate":
            challenge=row.get("retire_challenge") or {}
            required=set(challenge.get("required",[]))
            if challenge.get("status")!="open_not_authorized_for_delete" or len(required)<6 or not {"generated consumer zero","tombstone digest","rollback pointer"}.issubset(required):
                local.append("retire_safeguard_incomplete")
            local.append("retire_closed_world_replay_pending")
        trace=row["target_trace"]
        if any(identifier not in authorities for key in ("hil_ids","hr_ids","hat_ids","hst_ids") for identifier in trace[key]):
            local.append("target_trace_reference_missing")
        if trace.get("trace_specificity")!="common_source_coverage_edge_only" or not trace.get("semantic_target_trace_required"):
            local.append("generic_target_trace_misrepresented_as_semantic")
        if row.get("verified") or row.get("coverage_credit"):
            local.append("forbidden_runtime_or_coverage_credit")
        for issue in set(local): issues[issue]+=1
        findings.append({"atom_id":row["atom_id"],"adjudication":row["adjudication"],"source":{"path":row["source"]["path"],"line":row["source"]["line"]},"meaningful_search_tokens":meaningful,"issues":sorted(set(local)),"independent_disposition":"active_candidate_not_verified" if row["adjudication"]=="active_reclassify" and not local else "closed_world_challenge_required","verified":False,"coverage_credit":False})
    payload={"schema_version":"helix.bun-historical-stale-adjudication-independent-review.v1","status":"independent_review_fail_closed_closed_world_challenges_remain","source":{"path":str(CANDIDATE.relative_to(ROOT)),"sha256":sha(CANDIDATE.read_bytes())},"summary":{"records":len(findings),"adjudications":dict(sorted(dispositions.items())),"records_with_findings":sum(bool(r["issues"]) for r in findings),"issue_counts":dict(sorted(issues.items())),"active_candidates_without_findings":sum(r["independent_disposition"]=="active_candidate_not_verified" for r in findings),"runtime_mutations":0,"verified_true":0,"coverage_credit_true":0},"decision":"PLAN stemとgeneric basename一致はsupersession/closed-world証拠にしない。retain/retireはalias・ID・symbol・path・generated consumerの独立replayが閉じるまでchallengeであり、共通source coverage traceはatom固有semantic traceではない。","findings":findings}
    assert len(findings)==367
    encoded=(json.dumps(payload,ensure_ascii=False,indent=2,sort_keys=True)+"\n").encode()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes()!=encoded: print(f"STALE: {OUTPUT.relative_to(ROOT)}"); return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}"); return 0
    OUTPUT.write_bytes(encoded); print(f"WROTE: {OUTPUT.relative_to(ROOT)}"); return 0
if __name__=="__main__": raise SystemExit(main())
