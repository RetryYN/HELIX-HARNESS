#!/usr/bin/env python3
"""WR259 static verification for the compact HARNESS-048 L9 oracle allowlist."""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
L9 = "docs/helix-harness/L9-integration-verification/naming-identity-correspondence.json"
L8 = "docs/helix-harness/L8-unit-verification/naming-identity-correspondence.json"
L5 = "docs/helix-harness/L5-detail-design/naming-identity-correspondence.json"
BASE = "fe79e0004d8164bffc4be7c8c31dd9e14da2ead3"
L5_PIN_REVISION = "b52ad0e1e954790ebe57b2d87da46ea6712a07d9"
FORBIDDEN_KEYS = {"independent_source_packet", "raw_utf8", "source_packet", "expected_material", "full_return", "full_return_material", "mutation", "before", "after", "fixture_preparation", "normal_fixture", "normal_variants"}

def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def historic(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)

def walk(node):
    if isinstance(node, dict):
        yield node
        for value in node.values(): yield from walk(value)
    elif isinstance(node, list):
        for value in node: yield from walk(value)

def pointer(doc, fragment):
    node=doc
    if not fragment: return node
    for token in fragment.lstrip("/").split("/"):
        token=token.replace("~1","/").replace("~0","~")
        node=node[int(token)] if isinstance(node,list) else node[token]
    return node

def canonical_sha(value):
    raw=json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

def expected_state(group, material):
    if group == "F01": return ";".join(f"{key}={value}" for key,value in material["target_results"].items())
    if group == "F02":
        changes=[f"{key}={value}" for key,value in material["edge_results"].items() if value not in ("held","bound","same_object")]
        if material.get("symbol_change") not in (None,"candidate_only"): changes.append("symbol_change="+material["symbol_change"])
        return ";".join(changes) if changes else "all_edges_held;symbol_change=candidate_only"
    if group == "F03":
        bad=[f"{key}={value}" for key,value in material["condition_results"].items() if value!="supported_synthetic_condition"]
        return ("candidate_presentable" if material["candidate_presentable"] else "not_presentable") + ((";"+";".join(bad)) if bad else "")
    if group == "F04": return material["exception_result"]+";local_continuation="+str(material["local_continuation"]).lower()
    changes=[f"{key}={value}" for key,value in material["boundary_results"].items() if value not in ("held","candidate_only")]
    return ";".join(changes) if changes else "all_boundaries_held_or_candidate_only"

def axis_for(group, suffix):
    tail=suffix.removeprefix(group+"-")
    if group=="F01": return "role_and_name"
    if group=="F02": return "object_oracle_identity_and_edges"
    if group=="F03":
        if "SIGNATURE-" in tail: return "signature:"+tail.split("SIGNATURE-",1)[1].rsplit("-",1)[0].lower().replace("-","_")
        return {"NORMAL":"candidate_admissibility","CANONICAL-MISSING":"canonical","PUBLIC-SURFACE":"internal","CONSUMER-PARTIAL":"consumers","CONSUMER-SAME-COUNT-FOREIGN":"consumers","INVARIANT-MISSING":"behavior_invariant","MINIMUM-MISSING":"minimum_transform","ROLLBACK-MISSING":"rollback","LEXICAL-ONLY":"semantic_basis","REAL-RENAME-REQUEST":"operation_boundary"}.get(tail,"candidate_admissibility")
    if group=="F04":
        if tail in {"VALID-EXCEPTION","OWNER-MISSING","EXPIRY-MISSING","EXPIRED","REASON-MISSING","FOREIGN-SCOPE"}: return "exception"
        if tail=="WARNING-GLOBAL-STOP-REJECTED": return "global_scope"
        if tail in {"PUBLIC_API","PUBLIC_CLI","PERSISTED_FIELD","PERSISTED_EVENT","DIRECT_CONFIG_KEY"}: return "compatibility_boundary"
        return "finding_return"
    return "authority_and_owner_boundary"

def owner_for(group, material, failure):
    owners=material.get("owner_return_candidates")
    if isinstance(owners,list) and owners: return owners
    if isinstance(material.get("return_candidate"),str): return material["return_candidate"]
    if "対象作成側" in failure: return "対象作成側"
    return None

def main():
    current=load(L9); l8=load(L8); l5=load(L5)
    old_raw=historic(BASE,L9); old=json.loads(old_raw)
    old_size=len(old_raw); current_size=(ROOT/L9).stat().st_size
    l8_by_id={row["id"]:row for row in l8["cases"]}
    checks={}
    record=current.get("removed_materials",{})
    checks["removed_materials_exact_six_fields_and_fixed_base"]=(set(record)=={"decision_ref","git_commit","path","meaning","removed_key_rule","use_boundary"} and record.get("git_commit")==BASE and record.get("path")==L9 and "DT-VT-105" in record.get("use_boundary",""))
    checks["fixed_authority_pins_and_legacy_comparison_preserved"]=(current.get("source_pins")==old.get("source_pins") and len(current.get("source_pins",[]))==10 and current.get("legacy_comparison")==old.get("legacy_comparison") and current.get("full_goal_scope_preserved")==old.get("full_goal_scope_preserved"))
    checks["forbidden_fixture_full_return_and_mutation_material_absent"]=not any(FORBIDDEN_KEYS.intersection(node) for node in walk(current))
    checks["case_id_order_ref_property_state_and_l8_summary_match"]=True
    next_oracle_number=1
    checks["case_count_and_obligation_order_preserved"]=len(current["verification_obligations"])==len(old["verification_obligations"])
    for oi,(new_ob,old_ob) in enumerate(zip(current["verification_obligations"],old["verification_obligations"])):
        rows=new_ob.get("system_oracle_allowlist",[]); originals=old_ob.get("concrete_cases",[]); group=old_ob["id"].split("-")[-1]
        checks["case_count_and_obligation_order_preserved"] &= new_ob["id"]==old_ob["id"] and len(rows)==len(originals)
        checks["case_id_order_ref_property_state_and_l8_summary_match"] &= new_ob["l4_ref"]==old_ob["l4_ref"] and new_ob["requirement_ref"]==old_ob["requirement_ref"] and new_ob["system_oracle_ref"]==old_ob["system_oracle_ref"] and new_ob["approved_l10"]==old_ob["approved_l10"]
        for ri,(row,original) in enumerate(zip(rows,originals)):
            c=l8_by_id.get(original["id"]); m=original["expected_material"]
            expected_owner=owner_for(group,m,old_ob["approved_l10"]["failure_observation"])
            checks["case_id_order_ref_property_state_and_l8_summary_match"] &= bool(c) and row.get("oracle_number")==f"L9-SYSTEM-ORACLE-{next_oracle_number:02d}" and row.get("id")==original["id"] and row.get("requirement_ref")==original["requirement_ref"] and row.get("system_oracle_ref")==original["system_oracle_ref"] and row.get("l4_ref")==original["l4_ref"] and row.get("code")==original["id"].removeprefix("H048-") and row.get("condition")==c["counterexample"] and row.get("expected_observation")==c["expected_result"] and row.get("oracle_property")==original["basis"] and row.get("axis")==axis_for(group,row["code"]) and row.get("state")==expected_state(group,m) and row.get("backflow_owner")==expected_owner and row.get("execution_state")==original["execution_state"]=="not_executed"
            next_oracle_number+=1
    checks["all_five_L4_and_L10_oracles_retained"]=(len(current.get("verification_obligations",[]))==5 and all("approved_l10" in ob for ob in current["verification_obligations"]))
    # L5's 37 source literals already pin the pre-removal L9 bytes. Resolve each at that exact historical revision.
    historical_l9=json.loads(historic(L5_PIN_REVISION,L9)); pointers=[]; resolved=True
    for row in l5.get("literal_and_output_basis",[]):
        source=row.get("source","")
        if source.startswith(L9+"#"):
            pointers.append(row)
            try:
                value=pointer(historical_l9,source.split("#",1)[1])
                resolved &= row.get("source_revision")==L5_PIN_REVISION and row.get("value_canonical_sha256")==canonical_sha(value)
            except Exception: resolved=False
    checks["all_37_L5_consumer_pointers_resolve_at_pinned_source_revision"]=(len(pointers)==37 and resolved)
    checks["case_allowlist_is_lightened"]=(current_size<old_size and (old_size-current_size)/old_size>0.5)
    checks["no_l8_direct_L9_json_pointers"] = not any(isinstance(x,str) and x.startswith(L9+"#") for x in (v for node in walk(l8) for v in node.values()))
    out={"schema":"wr259-l9-allowlist-validation.v1","evidence_kind":"scaffold","authority_effect":"none","passed":all(checks.values()),"checks":checks,"measurements":{"fixed_base":BASE,"pre_edit_bytes":old_size,"current_bytes":current_size,"reduction_bytes":old_size-current_size,"reduction_percent":round((old_size-current_size)*100/old_size,2),"case_count":sum(len(o.get("system_oracle_allowlist",[])) for o in current["verification_obligations"]),"L5_direct_pointer_count":len(pointers),"L5_source_revision":L5_PIN_REVISION,"authority_source_pins":len(current.get("source_pins",[]))},"not_run":["legacy runtime","legacy tests","legacy CI","design or product algorithms"]}
    print(json.dumps(out,ensure_ascii=False,indent=2))
    return 0 if out["passed"] else 1
if __name__=="__main__": raise SystemExit(main())
