#!/usr/bin/env python3
"""Static fixed-BASE checks for SCF-B-0150 research evidence."""
from __future__ import annotations
import argparse, hashlib, json, re, shutil, subprocess, sys, tempfile
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

def git_bytes(path: str, root: Path = ROOT) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=root)

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

TOP_KEYS = {
    "asset_id", "source_path", "source_revision", "source_exact", "artifact_evidence_kind",
    "source_declared_status", "source_span", "parent_pair", "classification", "phase",
    "implementation_and_degradation", "failure_and_consumer", "judgment_history",
    "authority_boundary", "review_scope",
}
SECTION_KEYS = {
    "classification": {"category", "status", "authority_effect", "candidate_products", "product_rationale", "four_product_assessment", "approval_basis"},
    "phase": {"candidate_phase_targets", "phase_assessments", "phase_classification_status", "phase_admission", "basis"},
    "implementation_and_degradation": {"legacy_asset_implementation_status", "legacy_test_design_evidence", "source_status_is_not_execution", "test_oracle_execution", "observed_failure", "phase_level_legacy_and_transition", "formal_current_implementation_status"},
    "failure_and_consumer": {"designed_failure_cases", "execution_failure_history", "source_test_citations", "citation_semantics", "formal_consumer_refs", "consumer_closure_status", "crosswalk_status", "designed_negative_case_summaries"},
    "judgment_history": {"asset_disposition", "asset_ledger_revision", "decision_record_ref", "matching_legacy_decision_rows", "matching_copy_read_after_rows", "historical_frontmatter_status", "interpretation"},
    "source_span": {"line", "text", "meaning"},
    "review_scope": {"extent", "coverage", "archive_runtime_or_tests_executed"},
    "authority_boundary": {"authority_effect", "legacy_execution_performed", "formal_asset_classification_updated", "phase_updated", "successor_assigned", "new_build_allowed"},
}
LONG_REVIEW_IDS = {
    "LEGACY-ASSET-375B92E7A4237AF0131E", "LEGACY-ASSET-389DDC5EE6D65B05E79D",
    "LEGACY-ASSET-5D9269CEBC9A5DC4EA62", "LEGACY-ASSET-91565A0959C724742995",
}

def main(bundle: Path = BUNDLE, binding_path: Path | None = None, repository: Path = ROOT):
    if binding_path is None:
        binding_path = repository / "scaffold/bindings/SCF-B-0150.json"
    check(subprocess.run(["git","merge-base","--is-ancestor",BASE,"HEAD"],cwd=repository).returncode==0,
          "fixed BASE is not an ancestor; rederive before using this snapshot")
    selected=json.loads((bundle/"selection-manifest.json").read_text(encoding="utf-8"))
    bootstrap=rows_from_bytes(git_bytes("docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", repository))
    cohort=[r for r in bootstrap if r.get("source_path","").startswith("docs/test-design/helix/") and "PHCAP-07" in (r.get("candidate_phase_targets") or [])]
    check(len(cohort)==208 and len({r["asset_id"] for r in cohort})==208 and len({r["source_path"] for r in cohort})==208 and len({r["source_sha256"] for r in cohort})==208,
          "208 cohort cardinality or uniqueness changed")
    prior=json.loads(git_bytes("scaffold/legacy-test-design-worker-workflow-0148/selection-manifest.json", repository))
    prior_rows=prior["rows"]
    check(len(prior_rows)==52,"SCF-B-0148 selection is not 52 rows")
    cohort_sets={k:{r[k] for r in cohort} for k in ("asset_id","source_path","source_sha256")}
    prior_sets={"asset_id":{r["asset_id"] for r in prior_rows},"source_path":{r["source_path"] for r in prior_rows},"source_sha256":{r["source_sha256"] for r in prior_rows}}
    for key in cohort_sets:
        check(prior_sets[key] <= cohort_sets[key],f"0148 {key} outside cohort")
    residual={k:cohort_sets[k]-prior_sets[k] for k in cohort_sets}
    check(all(len(residual[k])==156 for k in residual),"cohort minus 0148 is not 156 per identity axis")
    manifest_rows=selected["rows"]
    ledger=rows(bundle/"classification-research.jsonl")
    identity_keys=("asset_id", "source_path", "source_sha256")
    for label,items in (("selection",manifest_rows),("classification",ledger)):
        for index,item in enumerate(items,1):
            for key in identity_keys:
                value=item.get(key) if key != "source_sha256" or label == "selection" else item.get("source_exact", {}).get("sha256")
                check(type(value) is str and bool(value), f"{label} row {index} {key} must be a non-empty string")
    check(selected["base_revision"]==BASE and selected["cohort_count"]==208 and selected["remaining_count"]==156,"selection manifest BASE/count mismatch")
    check(len(manifest_rows)==13 and len(ledger)==13,"expected 13 manifest and ledger rows")
    check({r["asset_id"] for r in manifest_rows}==IDS and {r["asset_id"] for r in ledger}==IDS,"selected ID set changed")
    check(len({r["source_path"] for r in manifest_rows})==13 and len({r["source_sha256"] for r in manifest_rows})==13,"selected path/SHA duplicate")
    for key in ("asset_id","source_path","source_sha256"):
        check({r[key] for r in manifest_rows} <= residual[key],f"selected {key} overlaps SCF-B-0148 or leaves cohort")
    by_boot={r["asset_id"]:r for r in bootstrap}
    assets={r["asset_id"]:r for r in rows_from_bytes(git_bytes("docs/governance/legacy-asset-disposition.jsonl", repository))}
    decisions=rows_from_bytes(git_bytes("docs/governance/legacy-asset-decisions.jsonl", repository))
    readafters=rows_from_bytes(git_bytes("docs/governance/legacy-asset-copy-read-after.jsonl", repository))
    manifest={}
    for line in git_bytes("archive/legacy-generation-2026-09-14/MANIFEST.sha256", repository).decode().splitlines():
        m=re.fullmatch(r"([0-9a-fA-F]{64})\s+[* ]?(.+?)\s*",line)
        check(m is not None,"archive manifest line malformed")
        manifest[m.group(2)]=m.group(1).lower()
    for entry,row in zip(manifest_rows,ledger,strict=True):
        aid=entry["asset_id"]
        expected_keys=TOP_KEYS | ({"review_anchors"} if aid in LONG_REVIEW_IDS else set())
        check(set(row) == expected_keys, f"classification top-level key set changed {row.get('asset_id', '<unknown>')}")
        for section,keys in SECTION_KEYS.items():
            check(type(row.get(section)) is dict and set(row[section]) == keys, f"{section} key set changed {aid}")
        check(set(row["source_exact"]) == {"archive_path", "git_blob", "mode", "byte_count", "sha256", "archive_manifest_sha256", "manifest_match", "selection_bootstrap_classification_id"}, f"source digest key set changed {aid}")
        b=by_boot[aid]
        check(aid==row["asset_id"] and entry["source_path"]==row["source_path"]==b["source_path"],f"source identity mismatch {aid}")
        check(entry["source_sha256"]==row["source_exact"]["sha256"]==b["source_sha256"],f"source digest mismatch {aid}")
        source_rel="archive/legacy-generation-2026-09-14/root/"+entry["source_path"]
        source=git_bytes(source_rel, repository)
        check(sha(source)==entry["source_sha256"]==manifest.get(entry["source_path"]),f"archive source/MANIFEST mismatch {aid}")
        check(row["source_exact"]["archive_path"] == source_rel and row["source_exact"]["archive_manifest_sha256"] == manifest[entry["source_path"]] and row["source_exact"]["selection_bootstrap_classification_id"] == b["classification_id"], f"source provenance fields changed {aid}")
        check(row["source_exact"]["byte_count"]==len(source) and row["source_exact"]["manifest_match"] is True,f"source byte evidence mismatch {aid}")
        check(row.get("review_scope", {}).get("extent") == "full_source_text_read_static", f"source review extent missing {aid}")
        check(row.get("review_scope", {}).get("archive_runtime_or_tests_executed") is False, f"archive execution claim present {aid}")
        source_lines=source.decode("utf-8").splitlines()
        check(set(row["source_span"]) == {"line", "text", "meaning"}, f"source_span key set changed {aid}")
        check(type(row["source_span"]["line"]) is int and 1 <= row["source_span"]["line"] <= len(source_lines), f"source_span line invalid {aid}")
        check(type(row["source_span"]["text"]) is str and bool(row["source_span"]["text"]), f"source_span text missing {aid}")
        check(source_lines[row["source_span"]["line"]-1] == row["source_span"]["text"], f"source_span original text mismatch {aid}")
        check(row["source_declared_status"] in {"draft", "confirmed", "unknown"}, f"source status vocabulary changed {aid}")
        status_match=re.search(r"^status:\s*([^\s#]+)", source.decode("utf-8"), re.MULTILINE)
        check(status_match is not None and status_match.group(1).strip('"\'') == row["source_declared_status"], f"source frontmatter status mismatch {aid}")
        anchors=row.get("review_anchors", [])
        check(type(anchors) is list and (aid not in LONG_REVIEW_IDS or len(anchors) > 0), f"required review anchors missing {aid}")
        for anchor in anchors:
            check(set(anchor) == {"line", "text", "relevance"}, f"review anchor key set changed {aid}")
            line_no=anchor.get("line")
            check(type(line_no) is int and 1 <= line_no <= len(source_lines), f"review anchor line invalid {aid}")
            check(type(anchor.get("text")) is str and bool(anchor["text"]) and type(anchor.get("relevance")) is str and bool(anchor["relevance"]), f"review anchor empty {aid}")
            check(source_lines[line_no-1] == anchor.get("text"), f"review anchor text mismatch {aid}:{line_no}")
        check(row["classification"]["category"] in {"direct_candidate_unresolved", "cross_product_split_candidate_unresolved"}, f"classification category promoted/unknown {aid}")
        check(row["classification"]["status"] == "candidate_boundary_pending_human_decision", f"classification candidate status changed {aid}")
        check(row["classification"]["authority_effect"] == "none", f"classification authority effect changed {aid}")
        products=row["classification"]["candidate_products"]
        check(type(products) is list and len(products)>0 and len(set(products))==len(products) and set(products) <= {"HELIX-OS", "HELIX-HARNESS"}, f"candidate products promoted/unknown {aid}")
        expected_products=["HELIX-OS"] if row["classification"]["category"] == "direct_candidate_unresolved" else ["HELIX-OS", "HELIX-HARNESS"]
        check(products == expected_products, f"candidate product/category boundary changed {aid}")
        check(row["judgment_history"]["asset_disposition"] == "unresolved", f"asset disposition promoted {aid}")
        check(row["judgment_history"]["asset_ledger_revision"] == 1 and row["judgment_history"]["historical_frontmatter_status"] == row["source_declared_status"], f"judgment history source binding changed {aid}")
        check(row["judgment_history"]["decision_record_ref"] is None and row["judgment_history"]["matching_legacy_decision_rows"] == 0 and row["judgment_history"]["matching_copy_read_after_rows"] == 0, f"judgment history promoted {aid}")
        check(row["phase"]["candidate_phase_targets"]==b["candidate_phase_targets"],f"phase candidates changed {aid}")
        check(set(row["phase"]) == {"candidate_phase_targets", "phase_assessments", "phase_classification_status", "phase_admission", "basis"}, f"phase key set changed {aid}")
        phase_inventory=json.loads(git_bytes("docs/governance/phase-capability-inventory.json", repository))
        phase_by_id={p["task_id"]:p for p in phase_inventory["records"]}
        expected_assessments=[]
        for phase_id in b["candidate_phase_targets"]:
            original=phase_by_id[phase_id]
            expected_assessments.append({
                "phase_id": phase_id,
                "phase_title": original["title"],
                "current_phase_level_status": original["current"]["status"],
                "phase_level_transition": original["transition_assessment"],
                "source": f"docs/governance/phase-capability-inventory.json#{phase_id}",
                "relation": "candidate context only; not per-asset implementation evidence or phase admission",
            })
        check(row["phase"]["phase_assessments"] == expected_assessments, f"phase assessment changed from BASE inventory {aid}")
        expected_phase_state="multi_phase_candidate" if len(b["candidate_phase_targets"]) > 1 else "unresolved_with_candidate"
        check(row["phase"]["phase_classification_status"] == expected_phase_state, f"phase candidate status changed {aid}")
        check(row["phase"]["phase_admission"]=="not_admitted",f"phase admission promoted {aid}")
        check(set(row["implementation_and_degradation"]) == {"legacy_asset_implementation_status", "legacy_test_design_evidence", "source_status_is_not_execution", "test_oracle_execution", "observed_failure", "phase_level_legacy_and_transition", "formal_current_implementation_status"}, f"implementation key set changed {aid}")
        check(row["implementation_and_degradation"]["legacy_asset_implementation_status"]=="unknown" and row["implementation_and_degradation"]["formal_current_implementation_status"]=="unknown" and row["implementation_and_degradation"]["test_oracle_execution"].startswith("not_run") and row["implementation_and_degradation"]["observed_failure"].startswith("unknown"),f"implementation/execution/failure claim promoted {aid}")
        check(row["failure_and_consumer"]["execution_failure_history"].startswith("unknown") and row["failure_and_consumer"]["consumer_closure_status"]=="pending" and row["failure_and_consumer"]["formal_consumer_refs"]==[],f"failure/consumer closure promoted {aid}")
        check(assets[aid]["disposition"]=="unresolved" and assets[aid]["implementation_status"]=="unknown",f"formal asset ledger changed status {aid}")
        check(not any(x.get("asset_id")==aid for x in decisions) and not any(x.get("asset_id")==aid for x in readafters),f"unexpected decision/read-after row {aid}")
        check(row["authority_boundary"]=={"authority_effect":"none","legacy_execution_performed":False,"formal_asset_classification_updated":False,"phase_updated":False,"successor_assigned":False,"new_build_allowed":False},f"authority boundary changed {aid}")
        check(type(row["parent_pair"]) is list and len(row["parent_pair"]) > 0, f"parent pair missing {aid}")
        for pair in row["parent_pair"]:
            check(set(pair) == {"path", "archive_path", "git_blob", "mode", "sha256", "title", "historical_owner", "declared_status", "relationship"}, f"parent pair key set changed {aid}")
            check(pair["archive_path"] == "archive/legacy-generation-2026-09-14/root/"+pair["path"], f"parent archive path mismatch {aid}")
            pairraw=git_bytes("archive/legacy-generation-2026-09-14/root/"+pair["path"], repository)
            check(sha(pairraw)==pair["sha256"]==manifest.get(pair["path"]),f"pair digest/MANIFEST mismatch {aid}: {pair['path']}")
            check(pair["path"] in source.decode("utf-8"),f"pair path not declared by source {aid}: {pair['path']}")
    binding=json.loads(binding_path.read_text(encoding="utf-8"))
    check(any(BASE in value for value in binding["connections"]["dependencies"]), "Binding base revision changed")
    inventory=json.loads((bundle/"inventory.json").read_text(encoding="utf-8"))
    counts={
        "product_candidate_mentions": {product:sum(row["classification"]["candidate_products"].count(product) for row in ledger) for product in ("HELIX-OS", "HELIX-HARNESS")},
        "phase_candidate_mentions": {phase:sum(row["phase"]["candidate_phase_targets"].count(phase) for row in ledger) for phase in ("PHCAP-02", "PHCAP-07", "PHCAP-10", "PHCAP-17", "PHCAP-20") if any(phase in row["phase"]["candidate_phase_targets"] for row in ledger)},
        "classification_categories": {category:sum(row["classification"]["category"] == category for row in ledger) for category in ("direct_candidate_unresolved", "cross_product_split_candidate_unresolved") if any(row["classification"]["category"] == category for row in ledger)},
    }
    check(inventory["counts"] == counts, "inventory counts do not match classification records")
    inventory_selection={
        "cohort_count": len(cohort),
        "excluded_scf_b_0148_count": len(prior_rows),
        "residual_count": len(residual["asset_id"]),
        "selected_count": len(manifest_rows),
        "id_path_sha_disjoint_from_0148": all(
            not (set(row[key] for row in manifest_rows) & prior_sets[key])
            and set(row[key] for row in manifest_rows) <= residual[key]
            for key in identity_keys
        ),
    }
    check(inventory.get("base_revision") == BASE, "inventory base revision mismatch")
    check(inventory.get("selection") == inventory_selection, "inventory selection counts/disjointness differ from measured values")
    check(len(binding["verification"]["negative_cases"]) == 4, "Binding negative case count changed")
    artifact_paths={x.removeprefix("scaffold/") for x in binding["artifacts"] if x.startswith("scaffold/")}
    actual={f"{BUNDLE.relative_to(repository / 'scaffold')}/{p.name}" for p in bundle.iterdir() if p.is_file()}
    actual.add("bindings/SCF-B-0150.json")
    check(actual==artifact_paths,"Binding artifact closure mismatch")
    for upstream in binding["upstream"]:
        rel=Path(upstream["path"])
        path=(bundle / rel.name) if rel.parts[:2] == ("scaffold", BUNDLE.name) else (repository / rel)
        check(path.is_file() and sha(path.read_bytes())==upstream["sha256"],f"Binding upstream digest stale: {upstream['path']}")
    print("SCF-B-0150 static validation passed: 208 cohort, 52 exclusion, 156 residual, 13 disjoint source/pair records; no execution/authority promotion.")

def selfcheck():
    def expect_rejection(name: str, expected_message: str, mutate, update_bundle_digest: bool = True):
        with tempfile.TemporaryDirectory(prefix="scf-b-0150-selfcheck-") as temp:
            temp_root=Path(temp)
            bundle=temp_root/BUNDLE.name
            shutil.copytree(BUNDLE,bundle)
            binding_path=temp_root/"SCF-B-0150.json"
            shutil.copy2(ROOT/"scaffold/bindings/SCF-B-0150.json",binding_path)
            mutate(bundle,binding_path)
            if update_bundle_digest:
                binding=json.loads(binding_path.read_text(encoding="utf-8"))
                for upstream in binding["upstream"]:
                    rel=Path(upstream["path"])
                    if rel.parts[:2] == ("scaffold",BUNDLE.name):
                        upstream["sha256"]=sha((bundle/rel.name).read_bytes())
                binding_path.write_text(json.dumps(binding,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
            try:
                main(bundle=bundle,binding_path=binding_path,repository=ROOT)
            except ValueError as exc:
                check(expected_message in str(exc), f"selfcheck {name} rejected for unexpected reason: {exc}")
                return
            raise ValueError(f"selfcheck mutation was accepted: {name}")

    def overlap(bundle: Path, _binding: Path):
        path=bundle/"selection-manifest.json"
        data=json.loads(path.read_text(encoding="utf-8"))
        data["rows"][0]["source_sha256"]="0"*64
        path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

    def wrong_identity_type(bundle: Path, _binding: Path):
        path=bundle/"selection-manifest.json"
        data=json.loads(path.read_text(encoding="utf-8"))
        data["rows"][0]["source_sha256"]=[]
        path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

    def source_digest_drift(bundle: Path, _binding: Path):
        path=bundle/"classification-research.jsonl"
        data=rows(path)
        data[0]["source_exact"]["sha256"]="0"*64
        path.write_text("".join(json.dumps(row,ensure_ascii=False,separators=(",",":"))+"\n" for row in data),encoding="utf-8")

    def implementation_promotion(bundle: Path, _binding: Path):
        path=bundle/"classification-research.jsonl"
        data=rows(path)
        data[0]["implementation_and_degradation"]["formal_current_implementation_status"]="implemented"
        path.write_text("".join(json.dumps(row,ensure_ascii=False,separators=(",",":"))+"\n" for row in data),encoding="utf-8")

    def stale_binding_upstream(_bundle: Path, binding_path: Path):
        data=json.loads(binding_path.read_text(encoding="utf-8"))
        target=next(item for item in data["upstream"] if item["path"].endswith("/README.md"))
        target["sha256"]="0"*64
        binding_path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

    expect_rejection("selected item outside residual", "selected source_sha256 overlaps SCF-B-0148 or leaves cohort", overlap)
    expect_rejection("identity field type", "selection row 1 source_sha256 must be a non-empty string", wrong_identity_type)
    expect_rejection("source digest drift", "source digest mismatch", source_digest_drift)
    expect_rejection("implementation status promotion", "implementation/execution/failure claim promoted", implementation_promotion)
    expect_rejection("stale Binding upstream", "Binding upstream digest stale", stale_binding_upstream, update_bundle_digest=False)
    print("SCF-B-0150 selfcheck passed: four Binding negative cases and the identity-type guard were rejected for expected reasons.")

def rows_from_bytes(data: bytes):
    out=[]
    for n,line in enumerate(data.decode("utf-8").splitlines(),1):
        if not line.strip(): continue
        v=json.loads(line)
        if type(v) is not dict: raise ValueError(f"object required at JSONL line {n}")
        out.append(v)
    return out

if __name__=="__main__":
    try:
        parser=argparse.ArgumentParser()
        parser.add_argument("--selfcheck",action="store_true",help="run temporary validator negative checks")
        args=parser.parse_args()
        main()
        if args.selfcheck:
            selfcheck()
    except (ValueError,KeyError,TypeError,subprocess.CalledProcessError,OSError) as e:
        print(f"SCF-B-0150 static validation failed: {e}",file=sys.stderr)
        raise SystemExit(1)
