#!/usr/bin/env python3
"""Static fixed-BASE checks for SCF-B-0150 research evidence."""
from __future__ import annotations
import hashlib, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "b1578f4fda5d5ecd01c9565ee81f4ddf0cebfe1a"
BUNDLE = ROOT / "scaffold/legacy-worker-execution-checkpoint-quota-0150"
IDS = {
    "LEGACY-ASSET-2775B41748BECEC8ABC0", "LEGACY-ASSET-DB5E523E2E6BB1E1149B",
    "LEGACY-ASSET-DE20B8D1BDFA39227A54", "LEGACY-ASSET-01003E42593729E3E6D8",
    "LEGACY-ASSET-9459010325E74BAD09B9", "LEGACY-ASSET-375B92E7A4237AF0131E",
    "LEGACY-ASSET-389DDC5EE6D65B05E79D", "LEGACY-ASSET-5D9269CEBC9A5DC4EA62",
    "LEGACY-ASSET-91565A0959C724742995", "LEGACY-ASSET-C7C6CA2B0355D032265F",
    "LEGACY-ASSET-068F64AE240FD3F5ACA9", "LEGACY-ASSET-C7E8D003CE5DA97ABA51",
    "LEGACY-ASSET-3EC6A1FBC5A147CFF72B",
}

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=ROOT)

def rows(path: Path):
    out=[]
    for n,line in enumerate(path.read_text(encoding="utf-8").splitlines(),1):
        if not line.strip(): raise ValueError(f"blank JSONL row {path}:{n}")
        value=json.loads(line)
        if type(value) is not dict: raise ValueError(f"object required {path}:{n}")
        out.append(value)
    return out

def check(condition: bool, message: str):
    if not condition: raise ValueError(message)

def main():
    check(subprocess.run(["git","merge-base","--is-ancestor",BASE,"HEAD"],cwd=ROOT).returncode==0,
          "fixed BASE is not an ancestor; rederive before using this snapshot")
    selected=json.loads((BUNDLE/"selection-manifest.json").read_text(encoding="utf-8"))
    bootstrap=rows_from_bytes(git_bytes("docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"))
    cohort=[r for r in bootstrap if r.get("source_path","").startswith("docs/test-design/helix/") and "PHCAP-07" in (r.get("candidate_phase_targets") or [])]
    check(len(cohort)==208 and len({r["asset_id"] for r in cohort})==208 and len({r["source_path"] for r in cohort})==208 and len({r["source_sha256"] for r in cohort})==208,
          "208 cohort cardinality or uniqueness changed")
    prior=json.loads(git_bytes("scaffold/legacy-test-design-worker-workflow-0148/selection-manifest.json"))
    prior_rows=prior["rows"]
    check(len(prior_rows)==52,"SCF-B-0148 selection is not 52 rows")
    cohort_sets={k:{r[k] for r in cohort} for k in ("asset_id","source_path","source_sha256")}
    prior_sets={"asset_id":{r["asset_id"] for r in prior_rows},"source_path":{r["source_path"] for r in prior_rows},"source_sha256":{r["source_sha256"] for r in prior_rows}}
    for key in cohort_sets:
        check(prior_sets[key] <= cohort_sets[key],f"0148 {key} outside cohort")
    residual={k:cohort_sets[k]-prior_sets[k] for k in cohort_sets}
    check(all(len(residual[k])==156 for k in residual),"cohort minus 0148 is not 156 per identity axis")
    manifest_rows=selected["rows"]
    ledger=rows(BUNDLE/"classification-research.jsonl")
    check(selected["base_revision"]==BASE and selected["cohort_count"]==208 and selected["remaining_count"]==156,"selection manifest BASE/count mismatch")
    check(len(manifest_rows)==13 and len(ledger)==13,"expected 13 manifest and ledger rows")
    check({r["asset_id"] for r in manifest_rows}==IDS and {r["asset_id"] for r in ledger}==IDS,"selected ID set changed")
    check(len({r["source_path"] for r in manifest_rows})==13 and len({r["source_sha256"] for r in manifest_rows})==13,"selected path/SHA duplicate")
    for key in ("asset_id","source_path","source_sha256"):
        check({r[key] for r in manifest_rows} <= residual[key],f"selected {key} overlaps SCF-B-0148 or leaves cohort")
    by_boot={r["asset_id"]:r for r in bootstrap}
    assets={r["asset_id"]:r for r in rows_from_bytes(git_bytes("docs/governance/legacy-asset-disposition.jsonl"))}
    decisions=rows_from_bytes(git_bytes("docs/governance/legacy-asset-decisions.jsonl"))
    readafters=rows_from_bytes(git_bytes("docs/governance/legacy-asset-copy-read-after.jsonl"))
    manifest={}
    for line in git_bytes("archive/legacy-generation-2026-09-14/MANIFEST.sha256").decode().splitlines():
        m=re.fullmatch(r"([0-9a-fA-F]{64})\s+[* ]?(.+?)\s*",line)
        check(m is not None,"archive manifest line malformed")
        manifest[m.group(2)]=m.group(1).lower()
    for entry,row in zip(manifest_rows,ledger,strict=True):
        aid=entry["asset_id"]; b=by_boot[aid]
        check(aid==row["asset_id"] and entry["source_path"]==row["source_path"]==b["source_path"],f"source identity mismatch {aid}")
        check(entry["source_sha256"]==row["source_exact"]["sha256"]==b["source_sha256"],f"source digest mismatch {aid}")
        source_rel="archive/legacy-generation-2026-09-14/root/"+entry["source_path"]
        source=git_bytes(source_rel)
        check(sha(source)==entry["source_sha256"]==manifest.get(entry["source_path"]),f"archive source/MANIFEST mismatch {aid}")
        check(row["source_exact"]["byte_count"]==len(source) and row["source_exact"]["manifest_match"] is True,f"source byte evidence mismatch {aid}")
        check(row.get("review_scope", {}).get("extent") == "full_source_text_read_static", f"source review extent missing {aid}")
        check(row.get("review_scope", {}).get("archive_runtime_or_tests_executed") is False, f"archive execution claim present {aid}")
        source_lines=source.decode("utf-8").splitlines()
        for anchor in row.get("review_anchors", []):
            line_no=anchor.get("line")
            check(type(line_no) is int and 1 <= line_no <= len(source_lines), f"review anchor line invalid {aid}")
            check(source_lines[line_no-1] == anchor.get("text"), f"review anchor text mismatch {aid}:{line_no}")
        check(row["phase"]["candidate_phase_targets"]==b["candidate_phase_targets"],f"phase candidates changed {aid}")
        check(row["phase"]["phase_admission"]=="not_admitted",f"phase admission promoted {aid}")
        check(row["implementation_and_degradation"]["legacy_asset_implementation_status"]=="unknown" and row["implementation_and_degradation"]["test_oracle_execution"].startswith("not_run"),f"implementation/execution claim promoted {aid}")
        check(row["failure_and_consumer"]["consumer_closure_status"]=="pending" and row["failure_and_consumer"]["formal_consumer_refs"]==[],f"consumer closure promoted {aid}")
        check(assets[aid]["disposition"]=="unresolved" and assets[aid]["implementation_status"]=="unknown",f"formal asset ledger changed status {aid}")
        check(not any(x.get("asset_id")==aid for x in decisions) and not any(x.get("asset_id")==aid for x in readafters),f"unexpected decision/read-after row {aid}")
        check(row["authority_boundary"]=={"authority_effect":"none","legacy_execution_performed":False,"formal_asset_classification_updated":False,"phase_updated":False,"successor_assigned":False,"new_build_allowed":False},f"authority boundary changed {aid}")
        for pair in row["parent_pair"]:
            pairraw=git_bytes("archive/legacy-generation-2026-09-14/root/"+pair["path"])
            check(sha(pairraw)==pair["sha256"],f"pair digest mismatch {aid}: {pair['path']}")
            check(pair["path"] in source.decode("utf-8"),f"pair path not declared by source {aid}: {pair['path']}")
    binding=json.loads((ROOT/"scaffold/bindings/SCF-B-0150.json").read_text(encoding="utf-8"))
    artifact_paths={x.removeprefix("scaffold/") for x in binding["artifacts"] if x.startswith("scaffold/")}
    actual={str(p.relative_to(ROOT/"scaffold")) for p in BUNDLE.iterdir() if p.is_file()}
    actual.add("bindings/SCF-B-0150.json")
    check(actual==artifact_paths,"Binding artifact closure mismatch")
    for upstream in binding["upstream"]:
        path=ROOT/upstream["path"]
        check(path.is_file() and sha(path.read_bytes())==upstream["sha256"],f"Binding upstream digest stale: {upstream['path']}")
    print("SCF-B-0150 static validation passed: 208 cohort, 52 exclusion, 156 residual, 13 disjoint source/pair records; no execution/authority promotion.")

def rows_from_bytes(data: bytes):
    out=[]
    for n,line in enumerate(data.decode("utf-8").splitlines(),1):
        if not line.strip(): continue
        v=json.loads(line)
        if type(v) is not dict: raise ValueError(f"object required at JSONL line {n}")
        out.append(v)
    return out

if __name__=="__main__":
    try: main()
    except (ValueError,KeyError,TypeError,subprocess.CalledProcessError,OSError) as e:
        print(f"SCF-B-0150 static validation failed: {e}",file=sys.stderr)
        raise SystemExit(1)
