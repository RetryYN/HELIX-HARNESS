#!/usr/bin/env python3
"""BRAIN032有限current-source oracle replay。静的audit資料。"""
from __future__ import annotations
import copy, hashlib, json
from pathlib import Path
ROOT = next(parent for parent in Path(__file__).resolve().parents if (parent / "docs/helix-brain/L4-basic-design/template-semantic-supply.json").is_file())
L8_PATH = ROOT / "docs/helix-brain/L8-unit-verification/template-semantic-supply.json"
L4_PATH = ROOT / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
L5_PATH = ROOT / "docs/helix-brain/L5-detail-design/template-semantic-supply.json"
PIN_L4 = "4ef60d6c0d15fa0339f525ad92c5754994dc83b56bb70b3397635e74c9bd88c2"
PIN_L5 = "449bc77b9775566dd516e006c5f2ee274e1493547f0e7e153f01c38d4de3c577"
HISTORICAL_L8_FILE_SHA = "d3d1644966ecc4fa96325feb6fffbd9ca796677147dd9b1b0146c18a436bf055"
RAW_BASE_CANONICAL_SHA = "6cd0dc78d931154f9931f950a4fceca68806dde03f5da6a0a22deb7cbca3d084"
ORDERED_RAW_PATCH_LIST_SHA = [
    "09632d1feac6a9f4b48c627256f5e76f810d613b11a7755c1f69a94f5d1bb88f",
    "0282ada3723275f56c7003d62dad52659fbe6eb88ceaa8213b3b5e41fcab46d9",
    "788632244dd63ccc20e31f37b5e3e539a3d7a8f047c9829cd50c34e9f57ef5eb",
    "fdd9a25d4595031260adcc360d643cd12f2631acf5d63f464ccc5794c3514fc2",
    "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    "16c0191993b764ef8a5c9c46646ca40e4b10a0875e66b49aa05b9c97e2cf6834",
    "48248a924450a215595dad70edbeab78935a75182f38e72a68bd9ce203a368a1",
    "dfbedf8c717e72845b8a62bb1459b1969c9b4d422a70721b824c78bd7c00b254",
    "5c2e33b0d8656c53e32231ee28eecf3332d889ccea33e323af8afb79fe4787ff",
    "f7a43b487d0b4f1cc14daf52005d207253b9324488d240adc12f95078896a3f0",
    "84a7e09c158a43e10d95c98cef71a1a6193c2d4b3dc2d8d7881411ce0e278a28",
    "ccbc470e4be4f5c85842e8e69d19b12d3d8a27680af3c85cf44f0f2309c0e456",
    "0234fc7403dff18d38371422de6c91072ba1b21833d4910dddfb3575e5cd5329",
    "20462d788b5fd0fddeee790789b96180fa5a3a5b6259aca0ce34a5f3153aea83",
    "b6767f77080ac9619638b96c41860f97ec6e00c0964d42a25025600c651431f7",
    "82fb29d6570ee0da373c78418d2f61cfd47c87564a6a42798548281dd60ffcaa",
    "ef597c1ccca9ba7320f7eabb435974b222c8c7424843693b1440e0608e1dafe6",
    "4dbca3a7dec215fdad3e3df8e2e8c28e5ff1a50855237bf960fd32823e223278",
    "3864977523f47d9dcc499a2dcd2338fd755fcac939c0acd7358b53f81a579b6e",
    "7f52c740f71365b6ce10dccb0f7d3691a5fbc1033129df0246ea72c7580b4697",
    "400b780fc9f7daab4535b4da88101e96cdcaa3d88db4127ae0cf7565be6c4bb8",
]
KINDS = ["template identity", "version", "layer/pair", "applicability", "required input", "required section", "required field", "relation", "意味owner", "trace", "negative oracle", "measurement", "completion", "downstream kind", "supersession"]
TARGET = 5
ATTR_REASON = "同じowner source内のidentity・kind・fact Ref/bodyが各caller slotへ一致する。"
POS_REASON = "当該原factへのowner意味解釈が、固定規範descriptorとの対応を支持している。"
def canonical(value): return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
def cb(value): return canonical(value)
def sha(data): return hashlib.sha256(data).hexdigest()
def file_sha(path): return sha(path.read_bytes())
def eq(a,b): return canonical(a)==canonical(b)
def equal(a,b): return eq(a,b)
def load_json(path): return json.loads(path.read_bytes())
def pp(value): return {"presence":"supplied","value":value}
def p_raw(value): return {"presence":"supplied","value":value}
def p_bind(value): return {"presence":"absent"} if value is None else {"presence":"supplied","value":value}
def sorted_values(values): return sorted(values,key=lambda x:canonical(x).decode("utf-8"))
def same_ref(a, b):
    if not isinstance(a, dict) or not isinstance(b, dict): return False
    for k in ("identity", "revision", "scope", "owner"):
        if k not in a or k not in b or a[k] is None or b[k] is None or not equal(a[k], b[k]): return False
    return not (a.get("sha256") is not None and b.get("sha256") is not None and not equal(a["sha256"], b["sha256"]))
def same_binding(a, b):
    if not isinstance(a, dict) or not isinstance(b, dict): return False
    for k in ("template_ref", "knowledge_ref", "requirement_ref", "oracle_ref", "pack_ref"):
        if not same_ref(a.get(k), b.get(k)): return False
    for k in ("pack_contract_version", "pack_artifact_version", "version_target"):
        if k not in a or k not in b or not equal(a[k], b[k]): return False
    aa, bb = a.get("pack_dependency_versions"), b.get("pack_dependency_versions")
    return isinstance(aa, list) and isinstance(bb, list) and all(any(same_ref(x,y) for y in bb) for x in aa) and all(any(same_ref(y,x) for x in aa) for y in bb)
def frame_for(l4, kind):
    snap = l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]
    matches = [(i,e) for i,e in enumerate(snap["entries"]) if e["value"]["descriptor"] == kind]
    if len(matches) != 1: raise ValueError(f"normative entry count for {kind}: {len(matches)}")
    ix, entry = matches[0]
    return {"revision":snap["revision"],"path":snap["path"],"file_sha256":snap["file_sha256"],
            "catalog_pointer":snap["pointer"],"catalog_canonical_sha256":snap["canonical_sha256"],"scope":snap["scope"],
            "entry_pointer":entry["pointer"],"entry_canonical_sha256":entry["canonical_sha256"],"entry_value":entry["value"]}
def verify_input(inp, l4):
    assert inp["required_descriptor_kinds"] == KINDS
    snapshot=l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]
    assert [entry["value"]["descriptor"] for entry in snapshot["entries"]] == KINDS
    assert len(inp["descriptors"]) == len(inp["sources"]) == len(inp["qualifications"]) == 15
    assert len(inp["qualification_roots"]) == 1 and len(inp["meaning_comparisons"]) == 0
    assert len(inp["relations"]) == len(inp["claims"]) == 0
    assert len(inp["section_fields"]) == len(inp["values"]) == 0
    assert len(inp["applicability_records"]) == 0
    root=inp["qualification_roots"][0]
    checks=[]
    for i,(slot,source,q) in enumerate(zip(inp["descriptors"],inp["sources"],inp["qualifications"])):
        kind=KINDS[i]; fact=slot["facts"][0]; raw=source["content_bytes"].encode("utf-8"); decoded=json.loads(raw)
        assert slot["descriptor_kind"] == kind and len(slot["facts"]) == 1
        assert source["role"] == "semantic_json" and source["ref"]["sha256"] == sha(raw)
        assert equal(decoded,source["content"])
        assert same_ref(source["qualification_ref"],q["ref"])
        assert same_ref(q["subject_ref"],source["ref"]) and q["subject_sha256"] == source["ref"]["sha256"]
        assert equal(q["applicable_scope"],source["ref"]["scope"])
        assert same_ref(q["root_ref"],root)
        assert q.get("qualification_body",{}).get("owner")==source["ref"]["owner"]
        assert root.get("owner")==source["ref"]["owner"]
        assert same_binding(source["content"]["binding"],slot["binding"]) and same_binding(fact["binding"],slot["binding"])
        assert same_ref(fact["source_ref"],source["ref"])
        groups=source["content"]["descriptor_facts"]
        assert len(groups)==1 and groups[0]["slot_identity"]==slot["slot_identity"] and groups[0]["descriptor_kind"]==kind
        original=groups[0]["facts"][0]
        assert len(groups[0]["facts"])==1 and same_ref(original["ref"],fact["ref"])
        assert equal({k:v for k,v in original.items() if k!="source_ref"},{k:v for k,v in fact.items() if k!="source_ref"})
        assert same_ref(original["source_ref"],source["ref"])
        ops=source["content"]["definition_meaning_operations"]
        assert len(ops)==1
        op=ops[0]; args=op["arguments"]; decision=op["decision"]; frame=frame_for(l4,kind)
        assert same_binding(args["binding"],slot["binding"]) and args["slot_identity"]==slot["slot_identity"] and args["descriptor_kind"]==kind
        assert same_ref(args["fact_ref"],fact["ref"]) and equal(args["fact_body"],fact["meaning"]) and equal(args["normative_argument"],frame)
        assert decision["relation"]=="defines_descriptor" and decision["reason"]["presence"]=="supplied"
        assert decision["raw_semantic_basis"]["presence"]=="supplied" and decision["raw_semantic_basis"]["value"] is not None
        assert isinstance(decision["basis_refs"],list)
        checks.append({"slot_index":i,"descriptor_kind":kind,"raw_source_bytes_sha256":sha(raw),"source_ref_sha256":source["ref"]["sha256"],
            "source_body_matches_bytes":True,"qualification_ref_subject_scope_root_match":True,"owner_fact_mirror_match":True,
            "operation_arguments_match_slot_fact_normative_frame":True,"decision_relation":decision["relation"],"positive_basis_refs_count":len(decision["basis_refs"])})
    return checks
def axis_key(axis):
    b=axis["binding"]
    components=[b.get("template_ref",{}).get("identity"),b.get("template_ref",{}).get("revision"),
                b.get("knowledge_ref",{}).get("identity"),b.get("knowledge_ref",{}).get("revision"),
                axis["_slot_identity"],axis["_sort_source_refs"],axis["axis"]]
    def p(x): return (0,"") if x is None else (1,canonical(x).decode("utf-8"))
    return tuple(p(x) for x in components)
def frame_positive_read(inp,l4,slot_index,meaning_read_index):
    slot=inp["descriptors"][slot_index]; fact=slot["facts"][0]; source=inp["sources"][slot_index]
    frame=frame_for(l4,slot["descriptor_kind"]); op=source["content"]["definition_meaning_operations"][0]
    op_loc=f"/sources/{slot_index}/content/definition_meaning_operations/0"; slot_loc=f"/descriptors/{slot_index}"; fact_loc=f"{slot_loc}/facts/0"
    occurrence={"source_ref":source["ref"],"source_index":slot_index,"record_index":0,"locator":op_loc,
                "original_record":op,"decoded_record":{"presence":"supplied","value":op}}
    support={"source_ref":source["ref"],"source_index":slot_index,"record_index":0,"locator":op_loc,"operation":op,"normative_frame":frame}
    read={"slot_locator":slot_loc,"fact_locator":fact_loc,"binding":pp(slot["binding"]),"normative_frame":frame,
          "acquisition_state":"resolved","occurrences":[occurrence],"supports":[support],"problems":[]}
    sidecar={"meaning_read_index":meaning_read_index,"problem_scopes":[],"support_origins":[{"support_index":0,"problem_indices":[]}]}
    return read,sidecar
def q_source(inp,i):
    s=inp["sources"][i]; raw=s["content_bytes"].encode()
    try: body=json.loads(raw)
    except Exception: return False,{"decode":False}
    qs=[q for q in inp["qualifications"] if same_ref(q.get("ref"),s.get("qualification_ref"))]
    if len(qs)!=1:return False,{"q_count":len(qs)}
    q=qs[0]; roots=[r for r in inp["qualification_roots"] if same_ref(r,q.get("root_ref"))]
    c={"role":s.get("role")=="semantic_json","digest":s["ref"].get("sha256")==sha(raw),
       "body":eq(body,s.get("content")),"q_subject":same_ref(q.get("subject_ref"),s["ref"]),
       "q_digest":q.get("subject_sha256")==s["ref"].get("sha256"),
       "scope":eq(q.get("applicable_scope"),s["ref"].get("scope")),
       "root_count":len(roots)==1,
       "q_body_owner":isinstance(q.get("qualification_body"),dict) and q["qualification_body"].get("owner")==s["ref"].get("owner")}
    return all(c.values()),c
def source_unresolved(s,i):
    return {"cause":"source_unresolved","source_ref":p_raw(s["ref"]),"source_index":i,"locator":f"/sources/{i}","original_value":p_raw(s),"reason":"当該原source又はその既存owner資格を解決できない。"}
def unresolved_root(records):
    return {"cause":"applicability_unresolved","source_ref":{"presence":"absent"},"source_index":None,"locator":"/applicability_records","original_value":p_raw(records),"reason":"当該原NA判断又は現在の対象への対応を解決できない。"}
def construct_read(inp,si):
    slot=inp["descriptors"][si]; loc=f"/descriptors/{si}"; has="definition_applicability_ref" in slot
    request={"presence":"absent"} if not has else p_raw(slot["definition_applicability_ref"])
    read={"slot_locator":loc,"request":request,"acquisition_state":"not_requested","source_occurrences":[],"supports":[],"problems":[]}
    if not has:return read
    req=slot["definition_applicability_ref"]
    if req is None:
        read["acquisition_state"]="unknown"
        read["problems"].append({"cause":"applicability_request_null","source_ref":{"presence":"absent"},"source_index":None,"locator":loc+"/definition_applicability_ref","original_value":p_raw(None),"reason":"定義非適用の原参照が明示nullであり、当該原判断を解決できない。"})
        return read
    roots=[(i,r) for i,r in enumerate(inp["applicability_records"]) if same_ref(r.get("ref"),req)]
    if not roots:
        read["acquisition_state"]="unknown"; read["problems"].append(unresolved_root(inp["applicability_records"])); return read
    rows=[]; invalid=[]
    for i,s in enumerate(inp["sources"]):
        if not any(same_ref(r.get("source_ref"),s.get("ref")) for _,r in roots): continue
        ok,qproof=q_source(inp,i)
        if not ok: invalid.append((i,s,qproof)); continue
        carrier=s.get("content",{}).get("definition_applicability_records")
        if not isinstance(carrier,list): continue
        for j,e in enumerate(carrier):
            rec=e.get("record") if isinstance(e,dict) else None
            if isinstance(rec,dict) and same_ref(rec.get("ref"),req): rows.append((i,j,s,e,rec))
    if invalid:
        read["acquisition_state"]="unknown"
        for i,s,_ in invalid: read["problems"].append(source_unresolved(s,i))
        return read
    factrefs=[f.get("ref") for f in slot.get("facts",[]) if isinstance(f,dict) and isinstance(f.get("ref"),dict)]
    for i,j,s,e,rec in rows:
        ep=f"/sources/{i}/content/definition_applicability_records/{j}"
        read["source_occurrences"].append({"source_ref":s["ref"],"source_index":i,"record_index":j,"locator":ep,"original_value":e})
        mirrored=[r for _,r in roots if eq(r,rec)]
        if not mirrored or e.get("slot_identity")!=slot.get("slot_identity") or e.get("descriptor_kind")!=slot.get("descriptor_kind") or not same_binding(s.get("content",{}).get("binding"),slot.get("binding")) or not same_binding(rec.get("binding"),slot.get("binding")) or not same_ref(rec.get("source_ref"),s.get("ref")):
            read["problems"].append({"cause":"applicability_unresolved","source_ref":p_raw(s["ref"]),"source_index":i,"locator":ep,"original_value":p_raw(rec),"reason":"当該原NA判断又は現在の対象への対応を解決できない。"})
            continue
        if not any(same_ref(rec.get("subject_ref"),x) for x in factrefs):
            read["problems"].append({"cause":"applicability_subject_differs","source_ref":p_raw(s["ref"]),"source_index":i,"locator":ep+"/record/subject_ref","original_value":p_raw(rec.get("subject_ref")),"reason":"原NA判断のsubjectが現在の原fact又は明示owner targetに対応しない。"})
            continue
        read["supports"].append({"source_ref":s["ref"],"source_index":i,"record_index":j,"locator":ep,"original_entry":{"slot_identity":e["slot_identity"],"descriptor_kind":e["descriptor_kind"],"record":rec},"subject_refs":[rec["subject_ref"]]})
    read["acquisition_state"]="resolved" if read["supports"] and not read["problems"] else "unknown"
    return read
def project(read,slot,slot_index,bi):
    if read["request"]["presence"]=="absent":return []
    if read["supports"]:
        out=[]
        for support in read["supports"]:
            rec=support["original_entry"]["record"]; d=rec.get("decision")
            if d=="unknown": state,cause,branch,reason="unknown","original_applicability_unknown","existing_definition_result","原ownerの定義適用判断がunknownである。"
            elif d=="applicable": state,cause,branch,reason="known","original_applicability_applicable","existing_definition_result","原ownerは当該定義内容を適用対象としている。元定義状態は別に保持する。"
            elif d=="not_applicable":
                goodreason=isinstance(rec.get("reason"),str) and rec.get("reason")!=""
                goodreentry="reentry_condition" in rec and rec["reentry_condition"] is not None
                if goodreason and goodreentry:state,cause,branch,reason="not_applicable","original_definition_not_applicable","existing_definition_result","原ownerの理由と再評価条件を伴う定義内容の非適用を保持する。"
                else:state,cause,branch,reason="unknown","applicability_basis_unresolved","existing_definition_result","原非適用判断の理由又は再評価条件が不足している。"
            elif "decision" not in rec:state,cause,branch,reason="unknown","applicability_unresolved","existing_definition_result","定義非適用の原判断又は当該対象への対応を解決できない。"
            else:raise ValueError("unhandled source decision")
            refs=[read["request"]["value"],support["source_ref"],rec["ref"]]
            if isinstance(rec.get("subject_ref"),dict):refs.append(rec["subject_ref"])
            if isinstance(rec.get("source_ref"),dict):refs.append(rec["source_ref"])
            out.append({"state":state,"origin_branch":branch,"cause":cause,"axis":slot["descriptor_kind"]+".definition_applicability","reason":reason,"source_refs":refs,"subject_ref":p_raw(rec["subject_ref"]) if isinstance(rec.get("subject_ref"),dict) else p_raw(slot["binding"]["knowledge_ref"]),"binding":p_bind(slot.get("binding")),"backflow_owner":rec.get("owner") if isinstance(rec.get("owner"),str) else None,"slot_locator":read["slot_locator"],"record_locator":support["locator"]+"/record"})
        return out
    request=read["request"]
    if request.get("presence")=="supplied" and request.get("value") is None:
        cause="applicability_request_null"
        reason="定義非適用の原参照が明示nullであり、当該原判断を解決できない。"
    else:
        # Read-level problem causes stay in DefinitionApplicabilityRead.problems.
        # The projected no-support Judgment uses the fixed L5 branch literal.
        cause="applicability_unresolved"
        reason="定義非適用の原判断又は当該対象への対応を解決できない。"
    subj=None
    binding=slot.get("binding") if isinstance(slot.get("binding"),dict) else {}
    for fallback_name in ("knowledge_ref", "template_ref"):
        fallback=binding.get(fallback_name)
        if isinstance(fallback,dict):
            subj=fallback
            break
    owner=slot.get("binding",{}).get("knowledge_ref",{}).get("owner")
    return [{"state":"unknown","origin_branch":"source_unresolved","cause":cause,"axis":slot["descriptor_kind"]+".definition_applicability","reason":reason,"source_refs":[request["value"]] if isinstance(request.get("value"),dict) else [],"subject_ref":p_raw(subj) if isinstance(subj,dict) else {"presence":"absent"},"binding":p_bind(slot.get("binding")),"backflow_owner":owner,"slot_locator":read["slot_locator"],"record_locator":None}]
def expected_normative_frame(l4, descriptor_kind):
    snap=l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]
    ix=next(i for i,e in enumerate(snap["entries"]) if e["value"]["descriptor"]==descriptor_kind)
    entry=snap["entries"][ix]
    return {"revision":snap["revision"],"path":snap["path"],"file_sha256":snap["file_sha256"],"catalog_pointer":snap["pointer"],"catalog_canonical_sha256":snap["canonical_sha256"],"scope":snap["scope"],"entry_pointer":entry["pointer"],"entry_canonical_sha256":entry["canonical_sha256"],"entry_value":entry["value"]}
def count_prefix(inp,l4):
    rows=[]; total=0
    # event order: per slot attribution axes, meaning support/problem/fallback,
    # pair axes, then NA. These inputs have one object fact and no comparison pair.
    for i,slot in enumerate(inp["descriptors"][:TARGET+1]):
        n=sum(isinstance(f,dict) and isinstance(f.get("ref"),dict) and isinstance(slot.get("binding"),dict) for f in slot.get("facts",[]))
        attr=int(n)
        meaning=0; proofs=[]
        for fi,fact in enumerate(slot.get("facts",[])):
            if not isinstance(fact,dict):continue
            for si,s in enumerate(inp["sources"]):
                if not same_ref(s.get("ref"),fact.get("source_ref")):continue
                ok,qproof=q_source(inp,si)
                if not ok:continue
                for oi,op in enumerate(s.get("content",{}).get("definition_meaning_operations",[])):
                    a=op.get("arguments",{})
                    decision=op.get("decision",{}); expected_frame=expected_normative_frame(l4,slot.get("descriptor_kind"))
                    complete=(same_ref(a.get("fact_ref"),fact.get("ref")) and a.get("slot_identity")==slot.get("slot_identity") and a.get("descriptor_kind")==slot.get("descriptor_kind") and same_binding(a.get("binding"),slot.get("binding")) and eq(a.get("fact_body"),fact.get("meaning")) and eq(a.get("normative_argument"),expected_frame) and decision.get("relation") in ("defines_descriptor","does_not_define_descriptor","undetermined") and isinstance(decision.get("reason"),dict) and decision["reason"].get("presence")=="supplied" and isinstance(decision["reason"].get("value"),str) and decision["reason"]["value"]!="" and isinstance(decision.get("raw_semantic_basis"),dict) and decision["raw_semantic_basis"].get("presence")=="supplied" and decision["raw_semantic_basis"].get("value") is not None and isinstance(decision.get("basis_refs"),list))
                    if complete:
                        meaning+=1; proofs.append({"source_index":si,"operation_index":oi,"fact_index":fi,"operation_ref":op.get("operation_ref"),"relation":decision.get("relation"),"normative_frame_match":True,"qualification_checks":qproof})
        pairs=0 # Every visited prefix slot has exactly one raw fact.
        total+=attr+meaning+pairs
        rows.append({"slot_index":i,"raw_fact_occurrences":n,"attribution_events":attr,"qualified_matching_meaning_operation_occurrences":meaning,"pair_events":pairs,"support_occurrences":proofs,"cumulative_pre_NA_origin_count":total})
    return total,rows
def make(inp,ix,l4):
    reads=[];batches=[]
    for i,slot in enumerate(inp["descriptors"]):
        r=construct_read(inp,i); ji=len(reads); reads.append(r)
        js=project(r,slot,i,len(batches))
        batches.append({"applicability_read_index":ji,"slot_locator":r["slot_locator"],"judgments":js})
    ordinal,proof=count_prefix(inp,l4)
    read=reads[TARGET]; batch=batches[TARGET]; origins=[]
    for j,g in enumerate(batch["judgments"]):
        support=read["supports"][j] if j<len(read["supports"]) else None
        facts=[]
        if support:
            subject=support["original_entry"]["record"].get("subject_ref")
            facts=[f"/descriptors/{TARGET}/facts/{k}" for k,f in enumerate(inp["descriptors"][TARGET].get("facts",[])) if same_ref(subject,f.get("ref"))]
        sr=[x["source_ref"] for x in read["source_occurrences"]]
        if support and isinstance(support["original_entry"]["record"].get("source_ref"),dict):sr.append(support["original_entry"]["record"]["source_ref"])
        sr=sorted(sr,key=lambda x:cb(x).decode())
        origins.append({"ordinal":ordinal+j,"assessment_key":{"binding":p_bind(inp["descriptors"][TARGET].get("binding")),"slot_identity":p_raw(inp["descriptors"][TARGET].get("slot_identity")),"descriptor_kind":inp["descriptors"][TARGET].get("descriptor_kind")},"branch":g["origin_branch"],"state":g["state"],"cause":g["cause"],"slot_locators":[g["slot_locator"]],"fact_locators":facts,"meaning_read_indices":[],"applicability_read_indices":[TARGET],"subject_ref":g["subject_ref"],"binding":g["binding"],"axis_name":g["axis"],"original_refs":g["source_refs"],"reason":g["reason"],"backflow_owner":g["backflow_owner"],"finding_rule_indices":[],"sort_source_refs":p_raw(sr),"special_read_indices":[],"pair_origin_links":[],"applicability_judgment_links":[{"batch_index":TARGET,"judgment_index":j}],"meaning_support_links":[],"meaning_problem_links":[],"special_support_links":[]})
    return {"input_index":ix,"scope":"NA native reads全値、15 slotのjudgement batch全11-field、NA origin event全23-field/global ordinal/source linkのみ。全Comparison walkの残値は対象外。","native_material_fragment":{"applicability_reads":reads,"applicability_judgment_batches":batches,"na_origin_events":origins},"ordinal_derivation":{"target_slot":TARGET,"prefix_slot_event_counts":proof,"na_origin_start_ordinal":ordinal,"full_prior_origin_values_not_materialized":True}}

def construct_case00(inp, l4, l5):
    input_checks=verify_input(inp,l4); na=make(inp,0,l4)
    facts=[]; meaning_reads=[]; read_origins=[]; pair_reads=[]
    raw_events=[]
    for i,slot in enumerate(inp["descriptors"]):
        fact=slot["facts"][0]; source=inp["sources"][i]; op=source["content"]["definition_meaning_operations"][0]
        read,sidecar=frame_positive_read(inp,l4,i,len(meaning_reads)); read_index=len(meaning_reads)
        meaning_reads.append(read); read_origins.append(sidecar)
        pair_reads.append({"slot_locator":f"/descriptors/{i}","result":{"axes":[],"origins":[]}})
        slotloc=f"/descriptors/{i}"; factloc=f"{slotloc}/facts/0"; binding=slot["binding"]
        attr_refs=sorted_values([fact["source_ref"],fact["ref"]])
        attr={"subject_ref":fact["ref"],"binding":binding,"axis":"descriptor.attribution","state":"known","original_refs":attr_refs,
              "reason":ATTR_REASON,"backflow_owner":None}
        dec=op["decision"]
        pos_refs=[fact["ref"],fact["source_ref"]]
        for occurrence in read["occurrences"]:
            pos_refs.append(occurrence["source_ref"])
            rec=occurrence["original_record"]
            pos_refs.append(rec["operation_ref"])
            pos_refs.extend(rec["decision"]["basis_refs"])
        pos={"subject_ref":fact["ref"],"binding":binding,"axis":slot["descriptor_kind"]+".definition","state":"known",
             "original_refs":pos_refs,"reason":POS_REASON,"backflow_owner":binding["knowledge_ref"].get("owner")}
        # L5 has distinct exact source columns: attribution reads only fact.source_ref;
        # the positive meaning event reads fact.source_ref followed by occurrences.
        attr_sort_refs=pp(sorted_values([fact["source_ref"]]))
        pos_sort_refs=pp(sorted_values([fact["source_ref"]]+[o["source_ref"] for o in read["occurrences"]]))
        for local,axis,branch,readlinks,supportlinks,sort_refs in [
            (0,attr,"existing_definition_result",[],[],attr_sort_refs),
            (1,pos,"existing_definition_result",[read_index],[{"meaning_read_index":read_index,"support_index":0}],pos_sort_refs),
        ]:
            raw_events.append({"ordinal":len(raw_events),"axis":axis,"slot_index":i,"fact_locators":[factloc],"slot_locator":slotloc,
                "branch":branch,"meaning_read_indices":readlinks,"meaning_support_links":supportlinks,"sort_source_refs":sort_refs,
                "pair_origin_links":[],"applicability_judgment_links":[],"meaning_problem_links":[],"finding_rule_indices":[],
                "original_refs":axis["original_refs"]})
    # Combine already source-derived NA read/batch/origin fragment from r4.
    na_fragment=na["native_material_fragment"]
    na_origins=na_fragment["na_origin_events"]
    # Per-slot order is attribution, positive interpretation, pair, then NA judgment events.
    # The input has only one NA judgment event in slot 5.
    for origin in na_origins:
        slotix=5
        judgement_index=origin["applicability_judgment_links"][0]["judgment_index"]
        judgement=na_fragment["applicability_judgment_batches"][slotix]["judgments"][judgement_index]
        na_axis={"subject_ref":judgement["subject_ref"]["value"],"binding":judgement["binding"]["value"],"axis":judgement["axis"],
                 "state":judgement["state"],"original_refs":judgement["source_refs"],"reason":judgement["reason"],"backflow_owner":judgement["backflow_owner"]}
        raw_events.append({"ordinal":len(raw_events),"axis":na_axis,"slot_index":slotix,"fact_locators":origin["fact_locators"],
            "slot_locator":origin["slot_locators"][0],"branch":origin["branch"],"meaning_read_indices":[],"meaning_support_links":[],
            "sort_source_refs":origin["sort_source_refs"],"pair_origin_links":[],"applicability_judgment_links":origin["applicability_judgment_links"],
            "meaning_problem_links":[],"finding_rule_indices":[],"na_origin":origin})
    # Slot-local order is attribution, positive support, pair events, then NA events.
    # For this input the sole NA event belongs after slot 5's first 12 events.
    na_event=raw_events.pop()
    raw_events=raw_events[:12]+[na_event]+raw_events[12:]
    for ordinal,event in enumerate(raw_events): event["ordinal"]=ordinal
    indexed=[]
    for e in raw_events:
        a=dict(e["axis"]); a["_slot_identity"]=inp["descriptors"][e["slot_index"]]["slot_identity"]; a["_sort_source_refs"]=e["sort_source_refs"]["value"]
        indexed.append((e,a))
    indexed.sort(key=lambda pair:axis_key(pair[1]))
    axes=[e["axis"] for e,_ in indexed]; axis_index={e["ordinal"]:j for j,(e,_) in enumerate(indexed)}
    assessments=[]; origins=[]
    for event in raw_events:
        i=event["slot_index"];slot=inp["descriptors"][i];fact=slot["facts"][0];axis=event["axis"]
        axis_ix=axis_index[event["ordinal"]]
        assessment={"key":{"binding":pp(slot["binding"]),"slot_identity":pp(slot["slot_identity"]),"descriptor_kind":slot["descriptor_kind"]},
            "state":axis["state"],"origin_branch":event["branch"],"slot_locators":[event["slot_locator"]],"fact_locators":event["fact_locators"],
            "comparison_axis_indices":[axis_ix],"comparison_finding_indices":[],"original_axes":[axes[axis_ix]],"axis_name":axis["axis"]}
        assessments.append(assessment)
        if "na_origin" in event:
            # Preserve the r4 source-derived NA constructor exactly, with its ordinal and full 23-field shape.
            origin=event["na_origin"]
            origin["ordinal"]=event["ordinal"]
        else:
            origin={"ordinal":event["ordinal"],"assessment_key":assessment["key"],"branch":event["branch"],"state":axis["state"],
                "cause":"owner_descriptor_attribution" if axis["axis"]=="descriptor.attribution" else "owner_interpretation_positive_supported",
                "slot_locators":[event["slot_locator"]],"fact_locators":event["fact_locators"],
                "meaning_read_indices":event["meaning_read_indices"],"applicability_read_indices":[],
                "subject_ref":pp(axis["subject_ref"]),"binding":pp(axis["binding"]),"axis_name":axis["axis"],
                "original_refs":event["original_refs"],"reason":axis["reason"],"backflow_owner":axis["backflow_owner"],
                "finding_rule_indices":[],"sort_source_refs":event["sort_source_refs"],"special_read_indices":[],
                "pair_origin_links":event["pair_origin_links"],"applicability_judgment_links":event["applicability_judgment_links"],
                "meaning_support_links":event["meaning_support_links"],"meaning_problem_links":event["meaning_problem_links"],"special_support_links":[]}
        origins.append(origin)
    evaluation={"comparison":{"axes":axes,"findings":[],"producer_symbol":"compare_descriptor_definitions","input_binding":inp["binding"]},"assessments":assessments}
    native={"meaning_reads":meaning_reads,"applicability_reads":na_fragment["applicability_reads"],"judgment_origins":origins,
            "special_reads":[],"pair_reads":pair_reads,"applicability_judgment_batches":na_fragment["applicability_judgment_batches"],
            "meaning_read_origins":read_origins}
    result={"evaluation":evaluation,"native_material":native,"target_reads":[],"intent_reads":[]}
    # Structural controls from current declarations, not from a prior expected output.
    origin_fields=set(l5["source_return_contract"]["descriptor_target_dataflow"]["definition_meaning_core"]["event_and_field_contract"]["private_types_candidate"]["DefinitionJudgmentOrigin"]["closed_fields"])
    native_fields=set(l5["source_return_contract"]["descriptor_target_dataflow"]["definition_meaning_core"]["event_and_field_contract"]["private_types_candidate"]["DefinitionNativeMaterial"]["closed_fields"])
    assert all(set(o)==origin_fields for o in origins), (len(origin_fields),[set(o)^origin_fields for o in origins if set(o)!=origin_fields][:1])
    axis_fields=set(l5["type_contract"]["types"]["AxisResult"]["fields"])
    assert all(set(a)==axis_fields for a in axes)
    assert len(axes)==len(assessments)==len(origins)==31
    assert set(native)==native_fields
    schema=l5["source_return_contract"]["descriptor_target_dataflow"]["definition_meaning_core"]["schema"]["new_defs"]
    for item,typ in [(native["meaning_reads"][0],schema["DefinitionMeaningRead"]),
                     (native["meaning_reads"][0]["occurrences"][0],schema["DefinitionMeaningOccurrence"]),
                     (native["meaning_reads"][0]["supports"][0],schema["DefinitionMeaningSupport"]),
                     (native["applicability_reads"][5],schema["DefinitionApplicabilityRead"]),
                     (native["applicability_judgment_batches"][5]["judgments"][0],schema["DefinitionApplicabilityJudgment"])]:
        assert set(item)==set(typ["required"]), (set(item),set(typ["required"]))
    operation=native["meaning_reads"][0]["supports"][0]["operation"]
    assert set(operation)==set(schema["DefinitionMeaningOperation"]["required"])
    assert set(operation["arguments"])==set(schema["DefinitionMeaningArguments"]["required"])
    assert set(operation["decision"])==set(schema["DefinitionMeaningDecision"]["required"])
    assert set(native["meaning_reads"][0]["normative_frame"])==set(schema["DefinitionNormativeFrame"]["required"])
    assert all(set(p)=={"slot_locator","result"} and set(p["result"])=={"axes","origins"} for p in pair_reads)
    assert set(evaluation["comparison"])==set(l5["type_contract"]["types"]["Comparison"]["fields"])
    assert set(evaluation)==set(l5["type_contract"]["types"]["DescriptorDefinitionEvaluation"]["fields"])
    assert all(set(a)==set(l5["type_contract"]["types"]["DescriptorDefinitionAssessment"]["fields"]) for a in assessments)
    assert len(meaning_reads)==len(pair_reads)==len(read_origins)==15 and len(na_fragment["applicability_reads"])==len(na_fragment["applicability_judgment_batches"])==15
    assert len(origins)==31 and [o["ordinal"] for o in origins]==list(range(31))
    assert sum(len(b["judgments"]) for b in na_fragment["applicability_judgment_batches"])==1
    assert all(len(p["result"]["axes"])==0 and len(p["result"]["origins"])==0 for p in pair_reads)
    for a in assessments:
        assert a["original_axes"]==[axes[j] for j in a["comparison_axis_indices"]]
    assert all(a["comparison_finding_indices"]==[] for a in assessments)
    for i in range(15):
        ai=2*i if i<6 else 2*i+1
        pi=ai+1
        assert origins[ai]["cause"]=="owner_descriptor_attribution" and origins[ai]["meaning_read_indices"]==[]
        assert origins[pi]["cause"]=="owner_interpretation_positive_supported" and origins[pi]["meaning_read_indices"]==[i]
        assert origins[pi]["meaning_support_links"]==[{"meaning_read_index":i,"support_index":0}]
    assert origins[12]["cause"]=="applicability_request_null" and origins[12]["applicability_judgment_links"]==[{"batch_index":5,"judgment_index":0}]
    return result


def resolve_pointer(document, pointer):
    value = document
    if pointer == "":
        return value
    assert pointer.startswith("/"), pointer
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value

def slot_projection(slot):
    result = copy.deepcopy(slot)
    result.pop("definition_applicability_ref", None)
    return result

def escape_pointer_token(token):
    return str(token).replace("~", "~0").replace("/", "~1")

def differing_leaf_pointers(a, b, pointer=""):
    if type(a) is not type(b):
        return [pointer or ""]
    if isinstance(a, dict):
        result = []
        for key in sorted(set(a) | set(b)):
            child = pointer + "/" + escape_pointer_token(key)
            if key not in a or key not in b:
                result.append(child)
            else:
                result.extend(differing_leaf_pointers(a[key], b[key], child))
        return result
    if isinstance(a, list):
        result = []
        for index in range(min(len(a), len(b))):
            result.extend(differing_leaf_pointers(a[index], b[index], pointer + "/" + str(index)))
        result.extend(pointer + "/" + str(index) for index in range(min(len(a), len(b)), max(len(a), len(b))))
        return result
    return [] if eq(a, b) else [pointer or ""]

def is_na_input_difference(pointer):
    return (pointer.startswith("/sources/15") or pointer.startswith("/qualifications/15") or
            pointer.startswith("/applicability_records") or
            pointer == "/descriptors/5/definition_applicability_ref" or
            pointer.startswith("/knowledge_records/0/provenance_refs/15"))

POSITIVE_INPUT_KEYS = [
    "binding", "required_descriptor_kinds", "qualification_roots",
    "meaning_comparisons", "section_fields", "values", "relations",
    "oracle_bindings", "compatibility_records", "handoff_records", "claims",
    "candidates", "dependencies",
]

def prove_positive_input_invariance(inputs):
    base = inputs[0]
    base_knowledge = copy.deepcopy(base["knowledge_records"])
    for row in base_knowledge:
        row.pop("provenance_refs", None)
    report = []
    for i, current in enumerate(inputs):
        assert all(eq(current[k], base[k]) for k in POSITIVE_INPUT_KEYS), f"positive top-level input changed for case {i}"
        assert eq([slot_projection(x) for x in current["descriptors"]], [slot_projection(x) for x in base["descriptors"]]), f"descriptor positive projection changed for case {i}"
        assert eq(current["sources"][:15], base["sources"][:15]), f"first 15 source rows changed for case {i}"
        assert eq(current["qualifications"][:15], base["qualifications"][:15]), f"first 15 qualifications changed for case {i}"
        knowledge = copy.deepcopy(current["knowledge_records"])
        for row in knowledge:
            row.pop("provenance_refs", None)
        assert eq(knowledge, base_knowledge), f"knowledge record other than provenance_refs changed for case {i}"
        assert len(current["descriptors"]) == 15
        assert len(current["sources"]) in (15, 16) and len(current["qualifications"]) == len(current["sources"])
        assert len(current["applicability_records"]) in (0, 1, 2)
        assert len(current["knowledge_records"]) == 1
        changed_pointers = differing_leaf_pointers(base, current)
        assert all(is_na_input_difference(pointer) for pointer in changed_pointers), f"unexpected non-NA input variation case {i}: {changed_pointers}"
        extra_refs = current["knowledge_records"][0].get("provenance_refs", [])[15:]
        added_sources = current["sources"][15:]
        assert len(extra_refs) == len(added_sources), f"provenance/source append cardinality differs case {i}"
        for ref, source in zip(extra_refs, added_sources):
            source_ref = source["ref"]
            assert all(eq(ref.get(k), source_ref.get(k)) for k in ("identity", "revision", "scope", "owner")), f"new provenance ref does not identify appended source case {i}"
            assert ref.get("sha256") is None or eq(ref.get("sha256"), source_ref.get("sha256")), f"provenance/source digest conflicts case {i}"
            positive_fact_refs = [fact.get("source_ref") for slot in current["descriptors"] for fact in slot.get("facts", []) if isinstance(fact, dict)]
            assert not any(same_ref(source_ref, fact_ref) for fact_ref in positive_fact_refs), f"additional source could participate in a positive fact source match case {i}"
        report.append({
            "input_index": i,
            "binding_and_required_kinds_same": True,
            "all_15_descriptor_positive_fields_same_except_applicability_selector": True,
            "first_15_sources_exact_same": True,
            "first_15_qualifications_exact_same": True,
            "qualification_roots_exact_same": True,
            "non_na_input_collections_exact_same": True,
            "knowledge_record_non_provenance_fields_same": True,
            "na_only_input_differences": {
                "changed_input_pointers": changed_pointers,
                "selector_present": "definition_applicability_ref" in current["descriptors"][5],
                "additional_source_count": len(added_sources),
                "additional_qualification_count": len(current["qualifications"]) - 15,
                "applicability_record_count": len(current["applicability_records"]),
                "additional_provenance_ref_count": len(extra_refs),
                "additional_sources_match_no_positive_fact_source": True,
            },
        })
    return report

def axis_sort_key(axis, slot_identity, sort_refs):
    binding = axis["binding"]
    parts = [binding.get("template_ref", {}).get("identity"),
             binding.get("template_ref", {}).get("revision"),
             binding.get("knowledge_ref", {}).get("identity"),
             binding.get("knowledge_ref", {}).get("revision"),
             slot_identity, sort_refs, axis["axis"]]
    def p(value):
        return (0, "") if value is None else (1, canonical(value).decode("utf-8"))
    return tuple(p(value) for value in parts)

def expected_origin_fields(l5):
    return set(l5["source_return_contract"]["descriptor_target_dataflow"]["definition_meaning_core"]["event_and_field_contract"]["private_types_candidate"]["DefinitionJudgmentOrigin"]["closed_fields"])

def make_na_axis(origin, fragment):
    link = origin["applicability_judgment_links"][0]
    batch = fragment["applicability_judgment_batches"][link["batch_index"]]
    judgment = batch["judgments"][link["judgment_index"]]
    return {"subject_ref": judgment["subject_ref"]["value"],
            "binding": judgment["binding"]["value"],
            "axis": judgment["axis"], "state": judgment["state"],
            "original_refs": judgment["source_refs"], "reason": judgment["reason"],
            "backflow_owner": judgment["backflow_owner"]}

def slot_index_from_locator(origin):
    locators = origin["slot_locators"]
    assert len(locators) == 1 and locators[0].startswith("/descriptors/")
    return int(locators[0].split("/")[2])

def make_na_assessment(origin, axis, axis_index, axes, input_value):
    slot_index = slot_index_from_locator(origin)
    slot = input_value["descriptors"][slot_index]
    return {
        "key": {"binding": {"presence": "supplied", "value": slot["binding"]},
                "slot_identity": {"presence": "supplied", "value": slot["slot_identity"]},
                "descriptor_kind": slot["descriptor_kind"]},
        "state": axis["state"], "origin_branch": origin["branch"],
        "slot_locators": origin["slot_locators"], "fact_locators": origin["fact_locators"],
        "comparison_axis_indices": [axis_index], "comparison_finding_indices": [],
        "original_axes": [axes[axis_index]], "axis_name": axis["axis"],
    }

def construct_case(i, input_value, baseline_result, na_module, l4, l5):
    na = make(input_value, i, l4)
    fragment = na["native_material_fragment"]
    baseline_native = baseline_result["native_material"]
    base_assessments = baseline_result["evaluation"]["assessments"]
    base_origins = baseline_native["judgment_origins"]
    assert len(base_assessments) == len(base_origins) == 31

    positive_events = []
    for assessment, origin in zip(base_assessments, base_origins):
        if origin["cause"] == "applicability_request_null" or origin["cause"].startswith("original_applicability") or origin["cause"].startswith("original_definition_not_applicable") or origin["cause"].startswith("applicability_"):
            continue
        assert len(assessment["original_axes"]) == 1
        positive_events.append({"origin": copy.deepcopy(origin), "assessment": copy.deepcopy(assessment),
                                "axis": copy.deepcopy(assessment["original_axes"][0]), "slot": slot_index_from_locator(origin), "kind": "positive"})
    assert len(positive_events) == 30
    assert [e["slot"] for e in positive_events] == [s for s in range(15) for _ in range(2)]

    events = []
    na_origins = copy.deepcopy(fragment["na_origin_events"])
    r4_ordinals = [origin["ordinal"] for origin in na_origins]
    na_by_slot = {}
    for origin in na_origins:
        na_by_slot.setdefault(slot_index_from_locator(origin), []).append(origin)
    for slot_index in range(15):
        events.extend(e for e in positive_events if e["slot"] == slot_index)
        for origin in na_by_slot.get(slot_index, []):
            events.append({"origin": origin, "assessment": None,
                           "axis": make_na_axis(origin, fragment), "slot": slot_index, "kind": "na"})
    assert len(events) == 30 + len(na_origins)

    # Origin ordinal is event order; sort only the AxisResult list using the current exact sort tuple.
    for ordinal, event in enumerate(events):
        if event["kind"] == "na":
            assert event["origin"]["ordinal"] == ordinal, f"r4 NA ordinal does not match integrated slot order case {i}"
        event["origin"]["ordinal"] = ordinal
    indexed = []
    for event in events:
        indexed.append((event, axis_sort_key(event["axis"], input_value["descriptors"][event["slot"]]["slot_identity"], event["origin"]["sort_source_refs"]["value"])))
    indexed.sort(key=lambda pair: pair[1])
    axes = [event["axis"] for event, _ in indexed]
    axis_index_by_ordinal = {event["origin"]["ordinal"]: j for j, (event, _) in enumerate(indexed)}

    assessments = []
    origins = []
    for event in events:
        origin = event["origin"]
        axis_index = axis_index_by_ordinal[origin["ordinal"]]
        if event["kind"] == "positive":
            assessment = event["assessment"]
            assessment["comparison_axis_indices"] = [axis_index]
            assessment["original_axes"] = [axes[axis_index]]
        else:
            assessment = make_na_assessment(origin, event["axis"], axis_index, axes, input_value)
        assessments.append(assessment)
        origins.append(origin)

    result = {
        "evaluation": {
            "comparison": {"axes": axes, "findings": [], "producer_symbol": "compare_descriptor_definitions", "input_binding": input_value["binding"]},
            "assessments": assessments,
        },
        "native_material": {
            "meaning_reads": copy.deepcopy(baseline_native["meaning_reads"]),
            "applicability_reads": fragment["applicability_reads"],
            "judgment_origins": origins,
            "special_reads": copy.deepcopy(baseline_native["special_reads"]),
            "pair_reads": copy.deepcopy(baseline_native["pair_reads"]),
            "applicability_judgment_batches": fragment["applicability_judgment_batches"],
            "meaning_read_origins": copy.deepcopy(baseline_native["meaning_read_origins"]),
        },
        "target_reads": copy.deepcopy(baseline_result["target_reads"]),
        "intent_reads": copy.deepcopy(baseline_result["intent_reads"]),
    }
    # Closed shape, ordering, links, and case00 reconstitution controls.
    assert all(set(o) == expected_origin_fields(l5) for o in origins)
    assert all(o["ordinal"] == n for n, o in enumerate(origins))
    assert len(axes) == len(assessments) == len(origins)
    types = l5["type_contract"]["types"]
    assert set(result) == {"evaluation", "native_material", "target_reads", "intent_reads"}
    assert set(result["evaluation"]) == set(types["DescriptorDefinitionEvaluation"]["fields"])
    assert set(result["evaluation"]["comparison"]) == set(types["Comparison"]["fields"])
    assert set(result["native_material"]) == set(l5["source_return_contract"]["descriptor_target_dataflow"]["definition_meaning_core"]["event_and_field_contract"]["private_types_candidate"]["DefinitionNativeMaterial"]["closed_fields"])
    assert all(set(a) == set(types["AxisResult"]["fields"]) for a in axes)
    assert all(set(a) == set(types["DescriptorDefinitionAssessment"]["fields"]) for a in assessments)
    for assessment in assessments:
        assert assessment["original_axes"] == [axes[j] for j in assessment["comparison_axis_indices"]]
        assert assessment["comparison_finding_indices"] == []
    assert all(len(p["result"]["axes"]) == 0 and len(p["result"]["origins"]) == 0 for p in result["native_material"]["pair_reads"])
    return result, {"r4_fragment": fragment, "na_count": len(na_origins),
                    "na_ordinals": [e["origin"]["ordinal"] for e in events if e["kind"] == "na"],
                    "r4_ordinals_preserved_by_slot_integration": eq(r4_ordinals, [e["origin"]["ordinal"] for e in events if e["kind"] == "na"]),
                    "event_count": len(events), "axis_count": len(axes)}

def verify_positive_output_reuse(results, baseline_result, l5):
    positive_causes = {"owner_descriptor_attribution", "owner_interpretation_positive_supported"}
    def positive_rows(result):
        origins = result["native_material"]["judgment_origins"]
        assessments = result["evaluation"]["assessments"]
        assert len(origins) == len(assessments)
        rows = []
        axes = []
        for origin, assessment in zip(origins, assessments):
            if origin["cause"] not in positive_causes:
                continue
            origin = copy.deepcopy(origin)
            origin.pop("ordinal")
            assessment = copy.deepcopy(assessment)
            assessment.pop("comparison_axis_indices")
            axes.extend(copy.deepcopy(assessment["original_axes"]))
            rows.append({"origin": origin, "assessment": assessment})
        return rows, axes

    base_rows, base_axes = positive_rows(baseline_result)
    assert len(base_rows) == len(base_axes) == 30
    all_checks = []
    for i, result in enumerate(results):
        rows, axes = positive_rows(result)
        assert eq(rows, base_rows), f"positive event and assessment values changed case {i}"
        assert eq(axes, base_axes), f"positive axis order or values changed case {i}"
        assert eq(result["native_material"]["meaning_reads"], baseline_result["native_material"]["meaning_reads"])
        assert eq(result["native_material"]["meaning_read_origins"], baseline_result["native_material"]["meaning_read_origins"])
        assert eq(result["native_material"]["pair_reads"], baseline_result["native_material"]["pair_reads"])
        assert eq(result["native_material"]["special_reads"], baseline_result["native_material"]["special_reads"])
        assert eq(result["evaluation"]["comparison"]["findings"], [])
        assert eq(result["target_reads"], baseline_result["target_reads"]) and eq(baseline_result["target_reads"], [])
        assert eq(result["intent_reads"], baseline_result["intent_reads"]) and eq(baseline_result["intent_reads"], [])
        all_checks.append({"input_index": i, "positive_origin_and_assessment_values_same": True,
                           "positive_axis_order_and_values_same_after_na_filter": True,
                           "meaning_reads_and_origins_exact_same": True, "pair_reads_exact_same": True,
                           "special_reads_exact_same": True, "non_na_roots_remain_empty_or_same": True})
    return all_checks



def apply_pointer_patch(document, operation):
    pointer = operation["path"]
    if not pointer.startswith("/raw_input/") and pointer != "/raw_input":
        raise ValueError(f"non-raw input patch rejected: {pointer}")
    tokens = [t.replace("~1", "/").replace("~0", "~") for t in pointer[1:].split("/")]
    parent = document
    for token in tokens[:-1]:
        parent = parent[int(token)] if isinstance(parent, list) else parent[token]
    key = tokens[-1]
    if operation["op"] == "remove":
        if isinstance(parent, list): parent.pop(int(key))
        else: del parent[key]
    elif operation["op"] in ("add", "replace"):
        value = copy.deepcopy(operation["value"])
        if isinstance(parent, list):
            if key == "-": parent.append(value)
            elif operation["op"] == "add": parent.insert(int(key), value)
            else: parent[int(key)] = value
        else:
            if operation["op"] == "replace" and key not in parent: raise KeyError(pointer)
            if operation["op"] == "add" and key in parent: raise KeyError(pointer)
            parent[key] = value
    else:
        raise ValueError(f"unsupported raw patch operation: {operation['op']}")

def load_raw_inputs(l8):
    section = l8["definition_meaning_walk_verification"]
    base_material = {"raw_input": copy.deepcopy(section["materials"][1]["raw_input"])}
    material = copy.deepcopy(base_material)
    if sha(canonical(material["raw_input"])) != RAW_BASE_CANONICAL_SHA:
        raise ValueError("raw base canonical pin mismatch")
    fixture_cases = section["cases"][8:29]
    recipes = section["current_source_basis_reconstruction"]["cases"]
    if len(fixture_cases) != len(recipes) or len(recipes) != len(ORDERED_RAW_PATCH_LIST_SHA):
        raise ValueError("raw input case count mismatch")
    results = []
    for input_index, (case, recipe) in enumerate(zip(fixture_cases, recipes)):
        if recipe["case_index"] != input_index + 8 or case["id"] != recipe["case_id"]:
            raise ValueError(f"raw recipe case binding mismatch: {input_index}")
        if case["fixture_base_pointer"] != "/definition_meaning_walk_verification/materials/1":
            raise ValueError(f"unexpected fixture base: {case['id']}")
        patch_indexes = recipe["ordered_raw_patch_operation_indices"]
        patch_list = [case["fixture_patch"][ix] for ix in patch_indexes]
        if sha(canonical(patch_list)) != ORDERED_RAW_PATCH_LIST_SHA[input_index]:
            raise ValueError(f"ordered raw patch pin mismatch: {case['id']}")
        for operation in patch_list:
            apply_pointer_patch(material, operation)
        raw = copy.deepcopy(material["raw_input"])
        results.append((case["id"], raw, patch_indexes, ORDERED_RAW_PATCH_LIST_SHA[input_index]))
        material = copy.deepcopy(base_material)
    return results

def main():
    l8 = load_json(L8_PATH)
    l4 = load_json(L4_PATH)
    l5 = load_json(L5_PATH)
    for path, expected in ((L4_PATH, PIN_L4), (L5_PATH, PIN_L5)):
        if file_sha(path) != expected:
            raise RuntimeError(f"current source pin mismatch: {path}")
    raw_cases = load_raw_inputs(l8)
    inputs = [raw for _, raw, _, _ in raw_cases]
    # Validate all source-positive inputs before deriving any expected output.
    input_invariance = prove_positive_input_invariance(inputs)
    # Build from the input and current rules; no frozen whole/expected enters this stage.
    baseline_result = construct_case00(inputs[0], l4, l5)
    result_rows = []
    results = []
    for i, inp in enumerate(inputs):
        result, details = construct_case(i, inp, baseline_result, None, l4, l5)
        results.append(result)
        result_rows.append({"case_id": raw_cases[i][0], "input_index": i,
                            "ordered_raw_patch_operation_indices": raw_cases[i][2],
                            "ordered_raw_patch_list_canonical_sha256": raw_cases[i][3],
                            "input_sha256": sha(canonical(inp)),
                            "whole_canonical_sha256": sha(canonical(result)),
                            "na_count": details["na_count"],
                            "axis_count": details["axis_count"],
                            "event_count": details["event_count"]})
    # Confirm reuse only after all 21 full outputs have been constructed.
    output_reuse = verify_positive_output_reuse(results, baseline_result, l5)
    # Comparison-only phase starts after all 21 outputs have been constructed.
    section = l8["definition_meaning_walk_verification"]
    frozen = section["current_source_basis_reconstruction"]["cases"]
    comparisons = []
    for row, case in zip(result_rows, frozen):
        comparisons.append({"input_index": row["input_index"],
                            "raw_input_hash_matches": eq(row["input_sha256"], case["raw_input_canonical_sha256"]),
                            "whole_hash_matches": eq(row["whole_canonical_sha256"], case["expected_whole_canonical_sha256"])})
    audit_pass = (len(input_invariance) == 21 and len(output_reuse) == 21 and
                  len(comparisons) == 21 and
                  all(row["raw_input_hash_matches"] and row["whole_hash_matches"] for row in comparisons))
    report = {"status": "FINITE_AUDIT_PASS" if audit_pass else "FINITE_AUDIT_FAIL",
              "audit_pass": audit_pass,
              "source_pins": {"L4": PIN_L4, "L5": PIN_L5},
              "input_invariance": input_invariance,
              "constructed": result_rows,
              "positive_output_reuse": output_reuse,
              "comparison_only": comparisons}
    print(json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2))
    if not audit_pass:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
