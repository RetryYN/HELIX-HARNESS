#!/usr/bin/env python3
"""WR259 static validator: derive the compact oracle directly from fixed L9 source bytes."""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
L9 = "docs/helix-harness/L9-integration-verification/naming-identity-correspondence.json"
L8 = "docs/helix-harness/L8-unit-verification/naming-identity-correspondence.json"
L5 = "docs/helix-harness/L5-detail-design/naming-identity-correspondence.json"
L4 = "docs/helix-harness/L4-basic-design/naming-identity-correspondence.json"
BASE = "fe79e0004d8164bffc4be7c8c31dd9e14da2ead3"
L5_PIN_REVISION = "b52ad0e1e954790ebe57b2d87da46ea6712a07d9"
L10_TARGETS = {
    "F01": ("docs/helix-harness/L10-verification/functional-verification.json", 47),
    "F02": ("docs/helix-harness/L10-verification/functional-verification.json", 48),
    "F03": ("docs/helix-harness/L10-verification/functional-verification.json", 49),
    "F04": ("docs/helix-harness/L10-verification/functional-verification.json", 50),
    "B01": ("docs/helix-harness/L10-verification/business-verification.json", 9),
}
ABSENT_ORIGINAL_FIELDS = ["code", "condition", "axis", "state", "backflow_owner"]
ABSENT_ORIGINAL_FIELD_SET = set(ABSENT_ORIGINAL_FIELDS)
FORBIDDEN_KEYS = {"independent_source_packet", "raw_utf8", "source_packet", "expected_material", "full_return", "full_return_material", "mutation", "before", "after", "fixture_preparation", "normal_fixture", "normal_variants", "approved_l10"}

class _Missing: pass
MISSING = _Missing()

def load(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def historical(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)

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

def compact(value):
    if value is None: return "null"
    if value is MISSING: return "absent"
    if isinstance(value,(dict,list)): return json.dumps(value,ensure_ascii=False,separators=(",",":"))
    return str(value)

def leaf_differences(before, after, path=""):
    if isinstance(before,dict) and isinstance(after,dict):
        out=[]
        for key in sorted(set(before)|set(after)):
            if key not in before: out.append((path+"/"+key,MISSING,after[key]))
            elif key not in after: out.append((path+"/"+key,before[key],MISSING))
            else: out.extend(leaf_differences(before[key],after[key],path+"/"+key))
        return out
    if isinstance(before,list) and isinstance(after,list) and len(before)==len(after):
        out=[]
        for index,(left,right) in enumerate(zip(before,after)):out.extend(leaf_differences(left,right,path+"/"+str(index)))
        return out
    return [] if before==after else [(path,before,after)]

def derive_condition(group, original, normal):
    current=json.loads(original["independent_source_packet"]["raw_utf8"])
    baseline=json.loads(normal["independent_source_packet"]["raw_utf8"])
    if original["id"]==normal["id"]:
        return "baseline"
    paths=[path for path,_,_ in leaf_differences(baseline,current)]
    if group=="F01":
        target=current["targets"][0]
        if target.get("declared_role") is None:return "OBJ-P declared role is missing; proposed name alone cannot establish role."
        if target.get("role_basis") is None:return "OBJ-P role basis is missing."
        if not target.get("consumers"):return "OBJ-P has no observed consumer."
        if target.get("exception"):return "OBJ-P has a scoped exception for the alternative role candidate."
        return "OBJ-P has an alternative name candidate without a scoped exception."
    if group=="F02":
        if "/oracle_edge/private_symbol" in paths:return "oracle edge is private-only; public edge is absent."
        labels={"/after/object":"object identity conflict","/after/oracle":"oracle identity conflict","/symbol_edge":"symbol edge missing","/oracle_edge":"oracle edge missing","/oracle_edge/object":"private-only oracle edge","/pair/verification_object":"verification pair object conflict"}
        return "; ".join(labels[path] for path in paths)
    if group=="F03":
        path=paths[0]
        labels={"/canonical_decision":"canonical decision missing","/visibility":"candidate crosses the internal visibility boundary","/observed_consumers":"observed consumer coverage is incomplete","/observed_consumers/1":"consumer identity conflicts","/behavior_invariant":"behavior invariant missing","/minimum_transform":"minimum-transform declaration missing","/rollback":"rollback declaration missing","/evidence_basis":"evidence is lexical-only","/requested_effect":"request crosses the candidate-only operation boundary"}
        if path in labels:return labels[path]
        if path.startswith("/signature_after/"):
            axis=path.rsplit("/",1)[1]
            state="missing" if pointer(current,path[1:]) is None else "conflicting"
            return f"signature {axis} is {state}."
        raise ValueError(f"unclassified F03 source delta {path}")
    if group=="F04":
        if "/exception/owner" in paths:return "exception owner is missing."
        if "/exception/expiry" in paths:
            expiry=current["exception"].get("expiry")
            return "exception is expired." if expiry and expiry<current["evaluation_date"] else "exception expiry is missing."
        if "/exception/reason" in paths:return "exception reason is missing."
        if "/exception/scope" in paths:return "exception scope is foreign."
        if "/boundary" in paths:
            category={"public_API":"public API","public_CLI":"public CLI","persisted_field":"persisted field","persisted_event":"persisted event","direct_config_key":"direct configuration key"}[current["boundary"]]
            return f"affected surface is a {category}; naming-only continuation is insufficient."
        if "/finding/reason" in paths:
            reason=current["finding"]["reason"]
            return "finding indicates incomplete consumer information." if reason=="consumer_incomplete" else "finding indicates signature mismatch."
        return "warning requests a global stop."
    if group=="B01":
        path=paths[0]
        labels={"/proposal/norm_content":"proposal attempts to replace norm-owner content","/proposal/product_name":"proposal derives a product name from knowledge","/proposal/CI_effect":"proposal requests CI adoption or self-merge","/protected_after/requirement_id":"requirement identity is changed outside this scope","/protected_after/mechanism_role":"mechanism role is changed outside this scope","/protected_after/adopted_body":"adopted requirement body is changed outside this scope"}
        if path=="/proposal/CI_effect":
            effect=current["proposal"]["CI_effect"]
            return "proposal requests CI self-merge." if effect=="self_merge" else "proposal requests CI adoption."
        return labels[path]
    raise ValueError(f"unclassified obligation group {group}")

def derive_expected(group, material):
    if group=="F01":
        return "OBJ-P="+material["target_results"]["OBJ-P"]+"."
    if group=="F02":
        failures=[f"{key}={value}" for key,value in material["edge_results"].items() if value not in {"held","bound","same_object"}]
        if failures:return "; ".join(failures)+"."
        return "identity, edges, and pair are aligned; symbol change remains candidate-only."
    if group=="F03":
        failures=[f"{key}={value}" for key,value in material["condition_results"].items() if value!="supported_synthetic_condition"]
        if not failures:return "candidate_presentable=true; no unsupported condition."
        return "candidate_presentable=false; "+"; ".join(failures)+"."
    if group=="F04":
        result="valid" if material["exception_result"]=="valid_for_fixture_scope" else material["exception_result"]
        return f"exception={result}; local_continuation={str(material['local_continuation']).lower()}."
    boundary_results=material["boundary_results"]
    changed={key:value for key,value in boundary_results.items() if value not in {"held","candidate_only"}}
    if changed:return "; ".join(f"{key}={value}" for key,value in changed.items())+"."
    return "separate inputs held; CI remains candidate-only."

SHARED_BOUNDARIES={
 "F01":"OBJ-R retains its Repository role; no canonical decision, rename, authority, or acceptance is produced; unaffected Q remains original_Q.",
 "F02":"A symbol candidate cannot alter object/oracle identity or the pair; mismatched identities or missing edges fail conformity; no actual rename occurs; unaffected Q remains original_Q.",
 "F03":"A single failed condition rejects candidate presentation; no rename/PR/receipt is produced; unaffected Q remains original_Q.",
 "F04":"Automatic rename is rejected and the finding retained; warning cannot stop unrelated scope; unaffected Q remains original_Q.",
 "B01":"Knowledge, norm, product decision, and CI remain separate; no authority/acceptance/merge/rename is produced; unaffected Q remains original_Q."
}
SHARED_RETURNS={"F02":"切れたedgeと影響対象を示し、命名適合を不成立にする。","F03":"対象作成側"}

def derive_shared_boundary(group, originals):
    materials=[item["expected_material"] for item in originals]
    if group=="F01":
        valid=all(item["canonical_decided_here"] is False and item["unaffected_Q"]=="original_Q" and item["target_results"]["OBJ-R"]=="candidate_only:Repository" for item in materials)
    elif group=="F02":
        valid=all(item["symbol_change"]=="candidate_only" and item["unaffected_Q"]=="original_Q" for item in materials)
    elif group=="F03":
        valid=all(item["unaffected_Q"]=="original_Q" and item["candidate_presentable"]==(all(v=="supported_synthetic_condition" for v in item["condition_results"].values())) for item in materials)
    elif group=="F04":
        valid=all(item["auto_rename"]=="rejected" and item["finding_retained"] and item["global_stop"] is False and item["unaffected_Q"]=="original_Q" for item in materials)
    else:
        valid=all(item["unaffected_Q"]=="original_Q" and not any(item["effects"].values()) for item in materials)
    return SHARED_BOUNDARIES[group] if valid else None

def expected_row_returns(group, material):
    return [] if group in SHARED_RETURNS else derive_return_targets(group, material, {})

def derive_return_targets(group, material, l10):
    if group=="F01":
        return ["対象作成側"] if any(value in {"unknown_role","missing_basis","missing_consumer","missing_scoped_exception"} for value in material["target_results"].values()) else []
    if group=="F02": return [l10["failure_observation"]]
    if group=="F03": return ["対象作成側"] if not material["candidate_presentable"] else []
    if group=="F04": return [material["return_candidate"]]
    return list(material["owner_return_candidates"])

def canonical_sha(value):
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def main():
    current=load(L9); l8=load(L8); l5=load(L5)
    old_raw=historical(BASE,L9); old=json.loads(old_raw)
    new_size=(ROOT/L9).stat().st_size
    checks={}
    record=current.get("removed_materials",{})
    checks["removed_materials_exact_six_fields_fixed_base_and_DT_VT_105"]=(set(record)=={"decision_ref","git_commit","path","meaning","removed_key_rule","use_boundary"} and record.get("git_commit")==BASE and record.get("path")==L9 and "DT-VT-105" in record.get("use_boundary",""))
    checks["ten_authority_pins_and_legacy_comparison_unchanged"]=(current.get("source_pins")==old.get("source_pins") and len(current.get("source_pins",[]))==10 and current.get("legacy_comparison")==old.get("legacy_comparison") and current.get("full_goal_scope_preserved")==old.get("full_goal_scope_preserved"))
    source_fields=current.get("source_field_presence",{})
    checks["absent_source_fields_are_declared_and_not_misrepresented_as_source_diffs"]=(source_fields.get("fixed_revision")==BASE and source_fields.get("source_fields_absent")==ABSENT_ORIGINAL_FIELDS and not any({"code","axis","state","backflow_owner"}.intersection(node) for node in walk(current)))
    checks["fixture_full_return_mutation_and_approved_l10_copies_absent"]=not any(FORBIDDEN_KEYS.intersection(node) for node in walk(current))
    checks["L4_contract_source_pin_resolves"] = False
    l4pin=current.get("l4_contract_source",{})
    try:
        l4bytes=historical(l4pin["revision"],l4pin["path"])
        l4doc=json.loads(l4bytes)
        checks["L4_contract_source_pin_resolves"]=l4pin["revision"]==BASE and hashlib.sha256(l4bytes).hexdigest()==l4pin["sha256"]
    except Exception: l4doc={}
    l3docs={p:json.loads(historical(BASE,p)) for p in ("docs/helix-harness/L3-requirements/functional-requirements.json","docs/helix-harness/L3-requirements/business-requirements.json")}
    l10docs={p:json.loads(historical(BASE,p)) for p,_ in L10_TARGETS.values()}
    checks["59_oracles_derive_from_fixed_original_basis_packet_expected_material_and_L3_L4_L10"]=True
    checks["obligation_order_and_numeric_L10_pointer_resolve"]=len(current["verification_obligations"])==len(old["verification_obligations"])
    checks["L8_is_ID_and_reference_crosscheck_only"]=True
    audit_rows=[]; oracle_no=1
    for oi,(new_ob,old_ob) in enumerate(zip(current["verification_obligations"],old["verification_obligations"])):
        group=old_ob["id"].split("-")[-1]; rows=new_ob.get("system_oracle_allowlist",[]); originals=old_ob.get("concrete_cases",[])
        l10path,l10index=L10_TARGETS[group]; l10doc=l10docs[l10path]; l10obj=pointer(l10doc,f"/cases/{l10index}")
        l3path="docs/helix-harness/L3-requirements/business-requirements.json" if group=="B01" else "docs/helix-harness/L3-requirements/functional-requirements.json"
        l3rows=l3docs[l3path]["requirements"]
        l4_contracts=l4doc.get("contracts",[])
        checks["obligation_order_and_numeric_L10_pointer_resolve"] &= new_ob["id"]==old_ob["id"] and len(rows)==len(originals) and new_ob.get("system_oracle_ref")==old_ob["system_oracle_ref"] and new_ob.get("system_oracle_pointer")==f"{l10path}#/cases/{l10index}" and l10obj.get("id")==new_ob["system_oracle_ref"] and l10obj.get("requirement_ref")==old_ob["requirement_ref"] and l10obj.get("execution_state")=="not_executed"
        checks["row_summaries_are_compact_and_shared_boundaries_are_factored"] = checks.get("row_summaries_are_compact_and_shared_boundaries_are_factored",True) and new_ob.get("shared_oracle_boundary")==derive_shared_boundary(group,originals) and new_ob.get("shared_return_target")==SHARED_RETURNS.get(group)
        checks["59_oracles_derive_from_fixed_original_basis_packet_expected_material_and_L3_L4_L10"] &= new_ob.get("l4_ref")==old_ob["l4_ref"] and new_ob.get("requirement_ref")==old_ob["requirement_ref"]
        # Ensure the five IDs/references resolve in the selected fixed L3, L4, and L10 sources.
        try:
            l4obj=next(item for item in l4doc.get("contracts",[]) if item.get("id")==old_ob["l4_ref"])
            l3idx=next(i for i,x in enumerate(l3rows) if x.get("id")==old_ob["requirement_ref"])
            l3obj=l3rows[l3idx]
            checks["59_oracles_derive_from_fixed_original_basis_packet_expected_material_and_L3_L4_L10"] &= l4obj.get("id")==old_ob["l4_ref"] and l4obj.get("requirement_ref")==old_ob["requirement_ref"] and l4obj.get("system_oracle_ref")==old_ob["system_oracle_ref"] and l3obj.get("id")==old_ob["requirement_ref"] and l3obj.get("oracle_ref")==old_ob["system_oracle_ref"]
        except Exception: l3idx=None; checks["59_oracles_derive_from_fixed_original_basis_packet_expected_material_and_L3_L4_L10"]=False
        normal=originals[0]
        l8rows={x["id"]:x for x in l8["cases"]}
        for ri,(row,original) in enumerate(zip(rows,originals)):
            material=original["expected_material"]; raw_hash=hashlib.sha256(original["independent_source_packet"]["raw_utf8"].encode()).hexdigest()
            compact_l8=l8rows.get(original["id"])
            l8_ok=bool(compact_l8) and compact_l8.get("oracle_id")==original["system_oracle_ref"] and compact_l8.get("subject",{}).get("requirement_id")==original["requirement_ref"]
            checks["L8_is_ID_and_reference_crosscheck_only"] &= l8_ok
            expected_returns=expected_row_returns(group,material)
            checks["59_oracles_derive_from_fixed_original_basis_packet_expected_material_and_L3_L4_L10"] &= row.get("oracle_number")==f"L9-SYSTEM-ORACLE-{oracle_no:02d}" and row.get("id")==original["id"] and row.get("requirement_ref")==original["requirement_ref"] and row.get("system_oracle_ref")==original["system_oracle_ref"] and row.get("l4_ref")==original["l4_ref"] and row.get("oracle_property")==original["basis"] and row.get("condition")==derive_condition(group,original,normal) and row.get("expected_observation")==derive_expected(group,material) and row.get("return_targets")==expected_returns and row.get("execution_state")==original["execution_state"]=="not_executed"
            summary_text=row.get("condition","")+" "+row.get("expected_observation","")
            forbidden_summary_markers=["→","{\"","unaffected_Q=","canonical_decided_here=","owner_return_candidates=","remaining ","all 15 named conditions","raw_utf8","expected_material"]
            checks["row_summaries_are_compact_and_shared_boundaries_are_factored"] &= not any(marker in summary_text for marker in forbidden_summary_markers) and len(summary_text)<240
            if group in SHARED_RETURNS:
                if group=="F02": shared_return_ok=SHARED_RETURNS[group]==l10obj.get("failure_observation")
                else: shared_return_ok=all(derive_return_targets(group,item["expected_material"],l10obj)==[SHARED_RETURNS[group]] for item in originals[1:]) and derive_return_targets(group,originals[0]["expected_material"],l10obj)==[]
                checks["row_summaries_are_compact_and_shared_boundaries_are_factored"] &= shared_return_ok
            expected_presence={key:key in original for key in ABSENT_ORIGINAL_FIELDS}
            checks["absent_source_fields_are_declared_and_not_misrepresented_as_source_diffs"] &= not any(expected_presence.values())
            audit_rows.append({"oracle_number":row["oracle_number"],"case_id":row["id"],"original_source_pointer":f"{L9}#/verification_obligations/{oi}/concrete_cases/{ri}","source_fields_absent":ABSENT_ORIGINAL_FIELDS,"condition_input_delta_paths":[path for path,_,_ in leaf_differences(json.loads(normal["independent_source_packet"]["raw_utf8"]),json.loads(original["independent_source_packet"]["raw_utf8"]))],"expectation_source_keys":list(material),"L8_crosscheck":"id+requirement_ref+system_oracle_ref only"})
            oracle_no+=1
    checks["case_order_59"]=(oracle_no==60)
    # L5 consumers intentionally remain pinned to their existing immutable pre-removal source revision.
    old_l9_for_l5=json.loads(historical(L5_PIN_REVISION,L9)); consumer_rows=[]; l5ok=True
    for item in l5.get("literal_and_output_basis",[]):
        source=item.get("source","")
        if source.startswith(L9+"#"):
            consumer_rows.append(item)
            try:l5ok &= item.get("source_revision")==L5_PIN_REVISION and item.get("value_canonical_sha256")==canonical_sha(pointer(old_l9_for_l5,source.split("#",1)[1]))
            except Exception:l5ok=False
    checks["all_37_L5_pointers_resolve_at_fixed_revision"]=(len(consumer_rows)==37 and l5ok)
    checks["size_reduction_over_half"]=(new_size<len(old_raw) and (len(old_raw)-new_size)/len(old_raw)>0.5)
    checks["L8_contains_no_direct_L9_pointers"]=not any(isinstance(v,str) and v.startswith(L9+"#") for node in walk(l8) if isinstance(node,dict) for v in node.values())
    out={"schema":"wr259-l9-allowlist-validation-r4.v1","evidence_kind":"scaffold","authority_effect":"none","passed":all(checks.values()),"checks":checks,"measurements":{"fixed_base":BASE,"pre_edit_bytes":len(old_raw),"current_bytes":new_size,"reduction_percent":round((len(old_raw)-new_size)*100/len(old_raw),2),"case_count":oracle_no-1,"fixed_source_file_sha256":hashlib.sha256(old_raw).hexdigest(),"L5_direct_pointer_count":len(consumer_rows),"L5_source_revision":L5_PIN_REVISION,"authority_source_pins":len(current.get("source_pins",[])),"l4_contract_source_sha256":l4pin.get("sha256")},"row_audit":audit_rows,"not_run":["legacy runtime","legacy tests","legacy CI","design or product algorithms"]}
    print(json.dumps(out,ensure_ascii=False,indent=2))
    return 0 if out["passed"] else 1
if __name__=="__main__": raise SystemExit(main())
