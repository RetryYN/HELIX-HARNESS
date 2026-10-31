#!/usr/bin/env python3
"""Read-only static audit for compact WR260 L8 semantic projections."""
from __future__ import annotations
import argparse
from collections import Counter
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
BASE = "569bde0bc5792349f0833461f0bb1bb6db33c592"
L8 = "docs/helix-harness/L8-unit-verification/process-state-port.json"
L4 = "docs/helix-harness/L4-basic-design/process-state-port.json"
L5 = "docs/helix-harness/L5-detail-design/process-state-port.json"
L9 = "docs/helix-harness/L9-integration-verification/process-state-port.json"

COMMON_EXPECTATION = {
 "B01":"根拠・技術品質・人間受容を独立に照合し、未解決findingと各ownerを保持する。相談・AI解釈・技術結果で人間承認や完了を作らない。",
 "F01":"対象revisionの開始・freeze・差戻し・再開・完了を必要条件ごとに判定する。指示や別revisionを承認にせず、未委任の意味・権限変更はownerへ返す。",
 "F02":"Prototype/PoCの独立適用・N/A記録・結果のBackflow/008/Decide/合意を分ける。技術成功だけでL3をfreezeしない。",
 "F03":"V谷のRed/Green/Provisional証拠と右側のV-pairを照合する。条件に応じたReverse範囲候補を返すがticket発行・実作用は行わない。",
 "F04":"artifact stateごとの固有根拠を連続frontierまで照合する。欠落・矛盾は局所化し、未来stateで補わず実state更新を行わない。",
 "F05":"Port・authority・scope・Incident段階を別結果に保つ。release/deployを行わず、未解決条件とbackfill先を返す。",
 "N01":"対象ごとに適用性・品質stage・運用証拠・ownerを分ける。未観測をhealthyや実権限・完了へ変換しない。",
}
ABS="__ABSENT__"

def read(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def at_pointer(document: Any, pointer: str) -> Any:
    if not pointer.startswith("/"):raise ValueError("pointer must be absolute")
    value=document
    for token in pointer[1:].split("/"):
        token=token.replace("~1","/").replace("~0","~")
        value=value[int(token)] if isinstance(value,list) else value[token]
    return value

def git_json(revision: str, path: str) -> Any:
    raw = subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    return json.loads(raw)

def norm(value: Any) -> Any:
    if isinstance(value, dict):
        return {k:norm(v) for k,v in value.items() if k not in {"source_packet_ref","source_ref","reason","reference_preparation","independent_source_packet"}}
    if isinstance(value,list): return [norm(x) for x in value]
    return value

def diff(a: Any, b: Any, path: str="") -> list[tuple[str,Any]]:
    if a == b: return []
    if isinstance(a,dict) and isinstance(b,dict):
        out=[]
        for key in sorted(set(a)|set(b)):
            out += diff(a.get(key,ABS),b.get(key,ABS),f"{path}.{key}" if path else key)
        return out
    if isinstance(a,list) and isinstance(b,list):
        out=[]
        for i in range(max(len(a),len(b))): out += diff(a[i] if i<len(a) else ABS,b[i] if i<len(b) else ABS,f"{path}[{i}]")
        return out
    return [(path,b)]

def atom(value: Any) -> str:
    if value == ABS:return "absent"
    if value is None:return "null"
    if isinstance(value,bool):return "true" if value else "false"
    if isinstance(value,(str,int,float)):return value if not isinstance(value,str) or len(value)<=56 else "文字列値（詳細省略）"
    if isinstance(value,list):
        if all(isinstance(x,(str,int,float,bool)) or x is None for x in value) and len(value)<=5:
            return "["+", ".join("null" if x is None else str(x) for x in value)+"]"
        return f"配列({len(value)}件)"
    if isinstance(value,dict):
        if set(value).issubset({"state","value"}) and ("state" in value or "value" in value):
            return f"state={value.get('state','?')}, value={atom(value.get('value',ABS))}"
        return "fields("+", ".join(list(value)[:3])+("…" if len(value)>3 else "")+")"
    return type(value).__name__

def semantic_summary(before: Any, after: Any, skip_roots: set[str]|None=None) -> str:
    """Compress all typed differences, grouping PartialValue state/value pairs."""
    out:list[tuple[str,str]]=[]
    skip_roots=skip_roots or set()
    replacements=(
        ("not_required_in_no_L2_5_result_case","not_required"),
        ("not_required_for_applicable_prototype","not_required"),
        ("not_required_for_applicable_poc","not_required"),
        ("supported_synthetic_observation","observed"),
        ("supported_synthetic_reaction","reaction"),
        ("supported_synthetic_material","supported"),
        ("supported_synthetic_condition","supported"),
        ("supported_synthetic_operated","operated"),
        ("requirements_approval","approval"),
        ("required_conditions","requires"),
        ("return_chain_results","returns"),
        ("condition_results","conditions"),
        ("port_condition_results","port"),
        ("own_basis_support","basis"),
        ("contiguous_frontier","frontier"),
        ("missing_basis","missing"),
        ("conflicting_basis","conflict"),
        ("state_ceiling_from_valley","ceiling"),
        ("reverse_scope_candidate","reverse_scope"),
        ("reverse_trigger_materials","trigger"),
        ("reverse_ticket_candidate","ticket"),
        ("improvement_route","route"),
        ("prototype_applicability","prototype_app"),
        ("poc_applicability","poc_app"),
        ("prototype_na_result","prototype_na"),
        ("meaning_authority_return_owner","meaning_owner"),
        ("additional_approval_needed","approval_needed"),
        ("actual_requirements_approved","requirements_approved"),
        ("actual_requirement_adopted","requirement_adopted"),
        ("actual_l3_frozen","l3_frozen"),
        ("actual_completion","completion"),
    )
    def shrink(value: str) -> str:
        for old,new in replacements:value=value.replace(old,new)
        for status in ("supported","observed","operated","reaction","false","true","null"):
            value=value.replace(f"state=known, value={status}",f"known({status})")
        return value
    def short_path(path: str) -> str:
        for old,new in (("own_basis_support","basis"),("condition_results","conditions"),
                        ("port_condition_results","port"),("target_results.value[0].quality_stage_support","target.quality"),
                        ("target_results.value[0]","target"),(".value.","."),(".value[", "[")):
            path=path.replace(old,new)
        return shrink(path)
    def walk(a: Any,b: Any,path: str) -> None:
        if a==b:return
        if isinstance(a,dict) and isinstance(b,dict) and "state" in a and "state" in b:
            if a.get("state")!=b.get("state"):
                out.append((short_path(path),str(b.get('state','?'))));return
            if b.get("state")!="known":return
            walk(a.get("value",ABS),b.get("value",ABS),path);return
        if isinstance(a,dict) and isinstance(b,dict):
            for k in sorted(set(a)|set(b)):
                if not path and k in skip_roots:continue
                if k in {"source_packet_ref","source_ref","reason","reference_preparation","independent_source_packet"}:continue
                walk(a.get(k,ABS),b.get(k,ABS),f"{path}.{k}" if path else k)
            return
        if isinstance(a,list) and isinstance(b,list):
            if all(isinstance(x,(str,int,float,bool)) or x is None for x in a+b):
                out.append((short_path(path),str(atom(b))));return
            for i in range(max(len(a),len(b))):walk(a[i] if i<len(a) else ABS,b[i] if i<len(b) else ABS,f"{path}[{i}]")
            return
        out.append((short_path(path),str(atom(b))))
    walk(before,after,"")
    grouped:dict[str,list[str]]={}
    singles=[]
    for path,value in out:
        path=shrink(path);value=shrink(value)
        if len(value)<=40 and sum(shrink(v)==value for _,v in out)>=3:
            grouped.setdefault(value,[]).append(path)
        else:singles.append(f"{path}={value}")
    compact=[]
    for value,paths in grouped.items():
        parents={p.rsplit(".",1)[0] for p in paths if "." in p}
        if len(parents)==1 and all("." in p for p in paths):
            parent=next(iter(parents));leaves=[p.rsplit(".",1)[1] for p in paths]
            compact.append(f"{value}{{{parent}:{', '.join(leaves)}}}")
        else:compact.append(f"{value}{{{', '.join(paths)}}}")
    return "；".join(compact+singles)

def partial_brief(value: Any, max_fields: int=3) -> str:
    if not isinstance(value,dict):return atom(value)
    parts=[]
    for key,item in value.items():
        if isinstance(item,dict) and ("state" in item or "value" in item):
            state=item.get("state","?"); val=item.get("value",ABS)
            parts.append(f"{key}={state}({atom(val)})")
        else:parts.append(f"{key}={atom(item)}")
    if len(parts)>max_fields:parts=parts[:max_fields]+[f"ほか{len(value)-max_fields}項目（base row ref参照）"]
    return "; ".join(parts)

def matrix_expected(source: dict[str,Any]) -> str:
    updates=source.get("expected_partial_updates",[])
    states=Counter(u.get("state","?") for u in updates)
    state_text="/".join(f"{state}×{count}" for state,count in sorted(states.items())) or "個別updateなし"
    owner=source.get("expected_owner_return")
    if isinstance(owner,dict):
        owner_text=f"owner target={owner.get('owner_target_state','unknown')}"
    else: owner_text="owner未確定"
    changes=source.get("qualification_changes")
    if changes:
        transition=" + ".join(f"{x.get('source_group','?')}:{x.get('after','?')}" for x in changes)
        aggregate=next((u.get("state") for u in updates if u.get("path")==["valley_result"]),"unknown")
        return f"{transition} → aggregate={aggregate}; 独立診断{len(changes)}件保持; {owner_text}"
    change=source.get("qualification_change",{})
    return f"影響output={state_text}（{len(updates)}項目）; {owner_text}; 入力資格={change.get('after','?')}"

def owner_summary(value: Any) -> str:
    found=[]
    def walk(x: Any) -> None:
        if isinstance(x,dict):
            for key,item in x.items():
                if key in {"owner_target","owner_target_state","meaning_authority_return_owner","backflow_owner"} and (item is None or isinstance(item,(str,bool,int))):
                    found.append(f"{key}={atom(item)}")
                elif key in {"owner_ref","source_owner"} and isinstance(item,dict) and isinstance(item.get("owner"),str):
                    found.append("owner label="+item["owner"]+" (synthetic/provenance label)")
                elif key not in {"source_packet_ref","source_ref"}:walk(item)
        elif isinstance(x,list):
            for item in x:walk(item)
    walk(value)
    return "; ".join(dict.fromkeys(found)) or "行固有ownerは固定baseに明記なし（未確定）"

def source_group_projection(container: Any) -> dict[str,Any]:
    if not isinstance(container,dict):return {}
    groups=container.get("source_groups",container)
    if not isinstance(groups,dict):return {}
    out={}; limits=[]
    for role,entry in groups.items():
        if not isinstance(entry,dict):continue
        source=entry.get("source_ref",entry.get("source_provenance_label"))
        if isinstance(source,dict): source={k:source[k] for k in ("identity","scope","owner") if k in source}
        row={}
        for k in ("qualification_role","affected_state","member"):
            if k in entry:row[k]=entry[k]
        if source:row["source_provenance_label"]=source
        paths=entry.get("affected_partial_paths")
        if paths is None and isinstance(entry.get("affected_output_fields"),str):
            row["affected_output_fields"]=entry["affected_output_fields"]
        elif paths:
            names=[".".join(map(str,path)) for path in paths if isinstance(path,list) and path]
            if names:row["affected_output_fields"]="; ".join(names)
        limit=entry.get("qualification_limit")
        if limit and limit not in limits:limits.append(limit)
        if row:out[role]=row
        else:out[role]={}
    shared=container.get("qualification_limit_shared",groups.get("qualification_limit_shared"))
    if isinstance(shared,str):out["qualification_limit_shared"]=shared
    elif limits:out["qualification_limit_shared"]="; ".join(limits)
    return out

def valid_pointer(pointer: str) -> bool:
    if not pointer.startswith("/") or "///" in pointer:return False
    if re.search(r"~(?![01])",pointer):return False
    if re.search(r"/(?:[^/]/){3,}",pointer):return False
    return True

def scan_keys(value: Any, prohibited: set[str], found: list[str], path: str="$", key_counts: dict[str,int]|None=None) -> None:
    if isinstance(value,dict):
        for key,item in value.items():
            if key_counts is not None:key_counts[key]=key_counts.get(key,0)+1
            if key in prohibited:found.append(path+"."+key)
            scan_keys(item,prohibited,found,path+"."+key,key_counts)
    elif isinstance(value,list):
        for i,item in enumerate(value):scan_keys(item,prohibited,found,f"{path}[{i}]",key_counts)

def run() -> dict[str,Any]:
    cur=read(L8); old=git_json(BASE,L8); l4,l5,l9=read(L4),read(L5),read(L9)
    checks:dict[str,bool]={}; counts:dict[str,int]={}; unresolved=[]
    old_groups=old["cases"]; groups=cur.get("cases",[])
    checks["canonical_case_groups_match"]=[g.get("id") for g in groups]==[g.get("id") for g in old_groups]
    checks["L5_functions_retained"]=[g.get("function_ref") for g in groups]==[f.get("id") for f in l5.get("functions",[])]
    checks["L9_branches_retained"]=[g.get("l9_ref") for g in groups]==[g.get("id") for g in l9.get("cases",[])]
    unit_ok=qual_ok=matrix_ok=content_ok=valley_ok=control_ok=source_group_ok=negative_ok=True
    unit_count=qual_count=matrix_count=content_count=valley_count=control_count=mixed_count=source_group_count=negative_count=resolved_inputs=0
    l9_index={}
    for li,branch in enumerate(l9.get("cases",[])):
        for kind in ("normal_cases","negative_cases"):
            for ri,item in enumerate(branch.get(kind,[])):
                l9_index[item.get("id")]=f"{L9}#/cases/{li}/{kind}/{ri}"
    for gi,(group,before) in enumerate(zip(groups,old_groups)):
        function_suffix=before["function_ref"].rsplit("-",1)[-1]
        units={r["id"]:r for r in before.get("cases",[])}
        current_units=group.get("cases",[]); unit_count+=len(current_units)
        unit_ok &= len(current_units)==len(units) and {x.get("id") for x in current_units}==set(units)
        base_expected=norm(before["cases"][0].get("expected_partial_values",{}))
        current_by_id={x.get("id"):x for x in current_units}
        for index,source in enumerate(before.get("cases",[])):
            row=current_by_id.get(source["id"],{}); suffix=source["id"].removeprefix(f"H003-L8-{function_suffix}-")
            expected=norm(source.get("expected_partial_values",{})); changes=diff(base_expected,expected)
            if changes:
                skips={"required_conditions"} if function_suffix=="F01" else ({"port_condition_results","port_missing"} if function_suffix=="F05" else set())
                want=semantic_summary(base_expected,expected,skips)
                if function_suffix=="F05" and suffix=="START-WITH-PORT":want+="; Port obligation 8件欠落（関数共通契約）"
            elif suffix in {"NORMAL","NORMAL-Working"}:want="群共通期待: "+COMMON_EXPECTATION[function_suffix]
            else:
                want="未検証: 固定baseの部分期待はgroup baselineと同値で、当該条件固有の期待差を直接証明できない。"
                unresolved.append(source["id"])
            unit_ok &= row.get("function_ref")==before["function_ref"]
            unit_ok &= row.get("condition")==suffix.replace("_"," ") and row.get("expected")==want
            unit_ok &= row.get("input_case_id")==source.get("basic_case_ref")
            expected_input=l9_index.get(source.get("basic_case_ref"))
            unit_ok &= row.get("source_case_ref")==expected_input
            if expected_input:resolved_inputs+=1
            unit_ok &= row.get("base_row_ref")==f"{BASE}:{L8}#/cases/{gi}/cases/{index}"
            unit_ok &= isinstance(row.get("owner"),str) and bool(row["owner"])
            unit_ok &= not any(isinstance(row.get(k), (dict,list)) for k in ("expected_delta","candidate_constraint","input_patch"))
        # One common expectation per function; a full baseline return is not retained.
        common=group.get("common_unit_contract",{})
        unit_ok &= common.get("expected")==COMMON_EXPECTATION[function_suffix]
        if function_suffix=="F01":
            action_requirements={}
            action_source_rows=[]
            for source_index,source_case in enumerate(before.get("cases",[])):
                partial=source_case.get("expected_partial_values",{})
                action=partial.get("action",{}).get("value") if isinstance(partial.get("action"),dict) else None
                required=partial.get("required_conditions",{}).get("value") if isinstance(partial.get("required_conditions"),dict) else None
                if action and isinstance(required,list) and action not in action_requirements:
                    action_requirements[action]=required
                    action_source_rows.append(f"{BASE}:{L8}#/cases/{gi}/cases/{source_index}")
            shared=common.get("shared_expected_rules",{})
            unit_ok &= shared.get("action_required_conditions")==action_requirements and shared.get("source_rows")==action_source_rows
        if function_suffix=="F05":
            port_case=next((x for x in before.get("cases",[]) if x["id"].endswith("START-WITH-PORT")),{})
            miss=port_case.get("expected_partial_values",{}).get("port_missing",{}).get("value",[])
            port_index=next((i for i,x in enumerate(before.get("cases",[])) if x.get("id")==port_case.get("id")),None)
            expected_ref=f"{BASE}:{L8}#/cases/{gi}/cases/{port_index}" if port_index is not None else None
            shared=common.get("shared_expected_rules",{})
            unit_ok &= shared.get("port_obligations")==miss and shared.get("source_rows")==[expected_ref]
        unit_ok &= "qualification_baseline_expected" not in group

        old_quals={r["id"]:r for r in before.get("qualification_cases",[])}
        current_quals=group.get("qualification_cases",[]); qual_count+=len(current_quals)
        qual_ok &= len(current_quals)==len(old_quals) and {x.get("id") for x in current_quals}==set(old_quals)
        if old_quals:
            qbaseline=norm(old_quals[next(iter(old_quals))].get("expected_typed_assessment",{}).get("partial_values",{}))
            now={r.get("id"):r for r in current_quals}
            if function_suffix=="B01":
                carrier=[]
                for source in old_quals.values():
                    if "QUAL-CARRIER-" in source["id"]:
                        partial=norm(source.get("expected_typed_assessment",{}).get("partial_values",{}))
                        carrier.append({p.split(".",1)[0] for p,_ in diff(qbaseline,partial)})
                shared=sorted(set.intersection(*carrier)) if carrier else []
                carrier_ids=[source["id"] for source in old_quals.values() if "QUAL-CARRIER-" in source["id"]]
                carrier_refs=[f"{BASE}:{L8}#/cases/{gi}/qualification_cases/{list(old_quals).index(uid)}" for uid in carrier_ids]
                carrier_contract=group.get("qualification_contract",{}).get("shared_output_fields",{}).get("carrier",{})
                qual_ok &= carrier_contract.get("fields")==shared and carrier_contract.get("source_rows")==carrier_refs
            for i,(uid,source) in enumerate(old_quals.items()):
                row=now.get(uid,{})
                part=norm(source.get("expected_typed_assessment",{}).get("partial_values",{})); changes=diff(qbaseline,part)
                if changes:
                    skips=set()
                    if function_suffix=="F01":
                        action=part.get("action",{})
                        action_value=action.get("value") if isinstance(action,dict) and action.get("state")=="known" else None
                        required=part.get("required_conditions",{})
                        required_value=required.get("value") if isinstance(required,dict) and required.get("state")=="known" else None
                        rules=common.get("shared_expected_rules",{}).get("action_required_conditions",{})
                        if action_value in rules and required_value==rules[action_value]:skips={"action","required_conditions"}
                    want=semantic_summary(qbaseline,part,skips).replace("；", "; ")
                    if function_suffix=="B01" and "QUAL-CARRIER-" in uid:
                        state=uid.rsplit("-",1)[-1].lower()
                        want=f"carrier qualification={state}; shared affected outputs={state} × {len(shared)} (field list in group contract)"
                elif i==0:want="群共通期待を適用。baseline資格行。"
                else:
                    want="未検証: 固定baseの期待は資格baselineと同値。行固有期待差を証明できない。";unresolved.append(uid)
                qual_ok &= row.get("condition")==uid.split("-QUAL-",1)[-1] and row.get("expected")==want
                qual_ok &= row.get("base_row_ref")==f"{BASE}:{L8}#/cases/{gi}/qualification_cases/{i}"
                qual_ok &= isinstance(row.get("owner"),str) and bool(row["owner"])

        # Content and valley counterexamples retain short typed projection, never input patch or full return.
        for section,source_section,current_section in (("content_counterexamples","content_counterexamples","content_counterexamples"),("valley_content_counterexamples","valley_content_counterexamples","valley_content_counterexamples")):
            old_rows=before.get(source_section,[]); now=group.get(current_section,[])
            if not old_rows:continue
            current_rows={r.get("id"):r for r in now}; expected_ids={r["id"] for r in old_rows}
            if section=="content_counterexamples":content_count+=len(now)
            else:valley_count+=len(now)
            good=len(now)==len(old_rows) and {r.get("id") for r in now}==expected_ids
            for i,src in enumerate(old_rows):
                row=current_rows.get(src["id"],{})
                typed=src.get("expected_typed_assessment") or src.get("expected_partial_values") or {}
                partial=typed.get("partial_values",typed) if isinstance(typed,dict) else {}
                if section=="content_counterexamples":
                    condition=src["id"].split("-CONTENT-",1)[-1].replace("-"," ")
                    base_case=src.get("base_basic_case_ref")
                    owner=owner_summary(typed)
                else:
                    condition=src["id"].split("-CONTENT-",1)[-1].replace("-"," ")
                    base_case=src.get("baseline_source_case_ref")
                    owner=owner_summary(src.get("expected_owner_return",typed))
                base_unit=next((u for u in before.get("cases",[]) if u.get("basic_case_ref")==base_case or u.get("id")==base_case),{})
                base_partial=norm(base_unit.get("expected_partial_values",{}))
                expected_delta=semantic_summary(base_partial,norm(partial))
                if not expected_delta:expected_delta="基準unitと同じtyped出力を維持。"
                good &= row.get("condition")==condition and row.get("base_case_id")==base_case
                good &= row.get("expected")==expected_delta and row.get("owner")==owner
                good &= row.get("base_row_ref")==f"{BASE}:{L8}#/cases/{gi}/{source_section}/{i}"
                good &= not any(k in row for k in ("path","mutation","mutations","reference_preparation","input_patch"))
            if section=="content_counterexamples":content_ok &= good
            else:valley_ok &= good

        # Source binding control conditions are explanatory text derived from the fixed-base operation/path.
        old_controls=before.get("source_binding_controls",[]); now=group.get("source_binding_controls",[])
        if old_controls:
            control_count+=len(now); current_controls={r.get("id"):r for r in now}
            good=len(now)==len(old_controls) and {r.get("id") for r in now}=={r["id"] for r in old_controls}
            for i,src in enumerate(old_controls):
                row=current_controls.get(src["id"],{}); ops=src.get("input_patch",[]); op=ops[0] if len(ops)==1 else {}
                condition=(str(op.get("op","operation unspecified"))+" "+str(op.get("path","path unspecified"))).strip()
                records=src.get("expected_source_binding",{}).get("records",[])
                selected=next((r for r in records if r.get("role")==src.get("selected_role")),{})
                expected=(f"{src.get('selected_role')}: target={selected.get('target_state')}, scope={selected.get('scope_state')}, "
                          f"qualification={selected.get('source_qualification_state')}, binding={selected.get('binding_state')}; "
                          f"独立peer roles={max(0,len(records)-1)}件を保持")
                good &= row.get("condition")==condition and valid_pointer(str(op.get("path","")))
                good &= row.get("expected")==expected and row.get("expected_rule")==src.get("expected_rule") and row.get("scope_limit")==src.get("scope_limit") and row.get("base_caller_case_id")==src.get("base_caller_case_id")
                good &= row.get("selected_role")==src.get("selected_role") and row.get("base_row_ref")==f"{BASE}:{L8}#/cases/{gi}/source_binding_controls/{i}"
                good &= not any(k in row for k in ("input_patch","expected_source_binding","path_array"))
            control_ok &= good

        # Qualification matrix rows and source-group entries preserve row identities/meanings.
        oq=before.get("qualification_matrix",{}); cq=group.get("qualification_matrix",{})
        if isinstance(oq,dict) and oq.get("cases"):
            srcs={r["id"]:r for r in oq["cases"]}; rows=cq.get("cases",[]); now={r.get("id"):r for r in rows};matrix_count+=len(rows)
            good=len(rows)==len(srcs) and set(now)==set(srcs)
            for i,(uid,src) in enumerate(srcs.items()):
                row=now.get(uid,{});change=src.get("qualification_change",{})
                condition=f"{change.get('source_group','qualification')}: {change.get('before','?')} → {change.get('after','?')}"
                updates=src.get("expected_partial_updates",[])
                expected=matrix_expected(src)
                good &= row.get("condition")==condition and row.get("expected")==expected
                good &= row.get("base_row_ref")==f"{BASE}:{L8}#/cases/{gi}/qualification_matrix/cases/{i}"
                good &= row.get("owner")==owner_summary(src.get("expected_owner_return",{}))
            matrix_ok &= good
        if isinstance(oq,dict):
            mixed=oq.get("mixed_cases",[]); current_mixed=cq.get("mixed_cases",[])
            if mixed:
                mixed_count+=len(current_mixed)
                matrix_ok &= len(mixed)==len(current_mixed) and [r.get("id") for r in mixed]==[r.get("id") for r in current_mixed]
                for mi,src in enumerate(mixed):
                    row=current_mixed[mi]; changes=src.get("changes",{})
                    condition="; ".join(f"{k}={v}" for k,v in changes.items()) or "混合資格の条件は固定baseに記録なし"
                    parts=[]
                    if isinstance(src.get("expected_frontier"),dict):
                        parts.append("frontier="+str(src["expected_frontier"].get("state","unknown")))
                    if isinstance(src.get("expected_port_result"),dict):
                        parts.append("aggregate Port="+str(src["expected_port_result"].get("state","unknown")))
                    if src.get("expected_cells"):
                        states=Counter(cell.get("state","unknown") for cell in src["expected_cells"])
                        parts.append("対象別state="+"/".join(f"{k}×{v}" for k,v in sorted(states.items())))
                    if changes:parts.append("独立条件"+str(len(changes))+"件を個別保持")
                    matrix_ok &= row.get("condition")==condition and row.get("expected")=="; ".join(parts)
                    matrix_ok &= row.get("base_row_ref")==f"{BASE}:{L8}#/cases/{gi}/qualification_matrix/mixed_cases/{mi}"
                    matrix_ok &= isinstance(row.get("owner"),str) and bool(row.get("owner"))
        if isinstance(oq,dict) and isinstance(oq.get("source_groups"),dict):
            projected=source_group_projection(oq);current_projection=source_group_projection(cq)
            source_group_count+=len(oq["source_groups"])
            # Compared by role and every explicit semantic value; only fixed-base revision/fixture locators are removed.
            source_group_ok &= projected==current_projection
    l9_ids=set(l9_index)
    l5_rules_by_code={r.get("code"):r for r in l5.get("failure_rules",[])}
    l5_rules_by_id={r.get("id"):r for r in l5.get("failure_rules",[])}
    for group in groups:
        for row in group.get("negative_cases",[]):
            negative_count+=1; classification=row.get("expected_classification")
            rule=l5_rules_by_id.get(row.get("rule_ref")) or l5_rules_by_code.get(classification)
            if not rule or (row.get("rule_ref") not in l5_rules_by_id and row.get("rule_ref")!="RULE-"+str(classification)):negative_ok=False
            if rule and (rule.get("function_ref")!=row.get("function_ref") or rule.get("state")!=row.get("expected_state") or rule.get("axis")!=row.get("expected_axis")):negative_ok=False
            found_l4=found_l5=False
            for ref in row.get("source_pointers",[]):
                path=ref.get("path");pointer=ref.get("pointer","")
                try:target=at_pointer(l4 if path==L4 else l5 if path==L5 else {},pointer)
                except (KeyError,IndexError,ValueError,TypeError):negative_ok=False;continue
                if path==L4:
                    found_l4=True
                    if target.get("code")!=classification or target.get("state")!=row.get("expected_state") or target.get("axis")!=row.get("expected_axis"):negative_ok=False
                elif path==L5:
                    found_l5=True
                    if target.get("code")!=classification or target.get("function_ref")!=row.get("function_ref"):negative_ok=False
            negative_ok &= found_l4 and found_l5
            try:
                inp=at_pointer(cur,row.get("input_case_pointer","").split("#",1)[1])
                if not isinstance(inp,dict) or not isinstance(inp.get("id"),str):negative_ok=False
            except (KeyError,IndexError,ValueError,TypeError):negative_ok=False
            counterpart=row.get("integration_case_ref")
            if counterpart in l9_ids:
                if row.get("l9_counterpart_status"):negative_ok=False
            elif row.get("l9_counterpart_status")!="unresolved: no exact current L9 case ID recorded":negative_ok=False

    counts={"unit_rows":unit_count,"qualification_rows":qual_count,"qualification_matrix_rows":matrix_count,"mixed_qualification_rows":mixed_count,"content_counterexample_rows":content_count,"valley_content_counterexample_rows":valley_count,"source_binding_control_rows":control_count,"source_group_rows":source_group_count,"negative_rule_rows":negative_count,"resolved_current_l9_input_pointers":resolved_inputs,"unit_unverified_rows":sum(1 for x in unresolved if '-L8-' in x and '-QUAL-' not in x),"qualification_unverified_rows":sum(1 for x in unresolved if '-QUAL-' in x)}
    checks["U_ID_condition_expected_owner_provenance"] = unit_ok
    checks["qualification_expected_diff_provenance"] = qual_ok
    checks["qualification_matrix_semantics"] = matrix_ok
    checks["content_counterexample_compact_semantics"] = content_ok
    checks["valley_counterexample_compact_semantics"] = valley_ok
    checks["source_binding_controls_valid_paths_and_states"] = control_ok
    checks["source_group_semantics"] = source_group_ok
    # No payload/patch reconstruction remains in the compact layer.
    prohibited={"expected_delta","expected_partial_values","partial_values","input_patch","candidate_constraint","expected_partial_updates","mutation","mutations","reference_preparation","independent_source_packet","source_case_refs","expected_private_call_records"}
    present=[];key_counts={};scan_keys(cur,prohibited,present,key_counts=key_counts)
    checks["no_payload_patch_or_full_return_keys"]=not present
    pointer_problems=[]
    def inspect(x,path="$",key=""):
        if isinstance(x,dict):
            for k,v in x.items():inspect(v,path+"."+k,k)
        elif isinstance(x,list):
            for i,v in enumerate(x):inspect(v,f"{path}[{i}]",key)
        elif isinstance(x,str):
            if key=="condition" and x.startswith(("add ","remove ","replace ")):
                pointer=x.split(" ",1)[1]
                if not valid_pointer(pointer):pointer_problems.append(path)
            if "///" in x:pointer_problems.append(path)
    inspect(cur)
    checks["source_binding_condition_pointers_well_formed"]=not pointer_problems
    checks["removed_materials_six_keys_DT_VT_105"]=set(cur.get("removed_materials",{}))=={"decision_ref","git_commit","path","meaning","removed_key_rule","use_boundary"} and "DT-VT-105" in cur.get("removed_materials",{}).get("use_boundary","")
    checks["negative_rows_have_L4_L5_support"] = negative_count==34 and negative_ok
    checks["two_negative_l9_counterparts_explicitly_unresolved"] = sum(1 for g in groups for r in g.get("negative_cases",[]) if r.get("l9_counterpart_status"))==2
    checks["current_L9_input_refs_209_unmapped_6"] = resolved_inputs==209 and sum(1 for g in groups for r in g["cases"] if not r.get("source_case_ref"))==6
    checks["source_pin_rows_16"]=len(cur.get("source_pins",[]))==16
    checks["no_python_repr_or_overlong_row_text"]=all(len(row.get("expected",""))<3000 for g in groups for kind in ("cases","qualification_cases","content_counterexamples","valley_content_counterexamples","source_binding_controls") for row in g.get(kind,[]) if isinstance(row,dict))
    checks["fixed_base_not_mutated"]=subprocess.check_output(["git","rev-parse",BASE+"^{}"],cwd=ROOT).decode().strip()==BASE
    result={"schema":"wr260-process-state-l8-static-audit.v2","evidence_kind":"scaffold","authority_effect":"none","base_revision":BASE,"current_l8_sha256":hashlib.sha256((ROOT/L8).read_bytes()).hexdigest(),"counts":counts,"unverified_row_ids":unresolved,"checks":checks,"problems":present+pointer_problems,"passed":all(checks.values())}
    return result

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument("--record",type=Path,help="exclusive-create a report at a new path; an existing file is never overwritten")
    args=parser.parse_args();result=run();encoded=json.dumps(result,ensure_ascii=False,indent=2)+"\n"
    print(encoded,end="")
    if args.record:
        path=args.record if args.record.is_absolute() else ROOT/args.record
        path.parent.mkdir(parents=True,exist_ok=True)
        fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o644)
        with os.fdopen(fd,"w",encoding="utf-8") as stream:stream.write(encoded)
    return 0 if result["passed"] else 1
if __name__=="__main__":sys.exit(main())
