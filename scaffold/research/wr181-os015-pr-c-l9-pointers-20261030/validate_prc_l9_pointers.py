#!/usr/bin/env python3
"""WR181 PR-CのL9 source pointer差分とPR-A/B被覆を静的に照合する。"""
from __future__ import annotations
import hashlib, json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
BASE="2d7cabb70861f4cc40d4d2e850d35c6b09083034"
PR_A_MERGE="36947baf69999c99d5370d804d69ee2f3acaed72"
L3="docs/helix-os/L3-requirements/functional-requirements.json"
L4="docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5="docs/helix-os/L5-detail-design/management-authority-source-record.json"
L7="docs/helix-os/L7-function-verification/management-authority-source-record.json"
L8="docs/helix-os/L8-unit-verification/management-authority-source-record.json"
L9="docs/helix-os/L9-integration-verification/management-authority-source-record.json"
CASE_EVIDENCE="scaffold/research/wr181-os015-pr-a-l4-l9-20261030/case-evidence.json"
RULE_BINDINGS={
    "OS015-NEG-COMPOSITE-07c9fd844a293140f5dc77476ab8ed90116889361788956739abfdcf65b874c4":31,
    "OS015-NEG-COMPOSITE-4e0c28b06920d3a9665cbe4beeaf48cea44d7b0d350dddfaec9c8471de1e86b5":32,
}
PR_A_L9_SHA="392417ce60ff10beed23d1aee27aadc7afaaf4062fb1dc04473325e30ad2c7e5"
PR_C_L9_SHA="a4a186902d29330d5d88bdb8366e70b8678a31d3e2e750b8e2e7e46e83b5776c"
L4_SHA="9146ffd557bc5da60f79cdcd462578b38edf6ec524143a705ab07eeb34c7997b"
L5_SHA="c7d979d397f7ebc9b82b1cb5fa3e32f82737956c6a54adc2080342b729607c7f"
L8_SHA="63fc2084a2a41cce1c84ac0db7a437ce25a0525f9f24d060f47bcf61357aa621"

def sha(raw:bytes)->str: return hashlib.sha256(raw).hexdigest()
def raw(rev:str,path:str)->bytes: return subprocess.check_output(["git","show",f"{rev}:{path}"],cwd=ROOT)
def load(path:str): return json.loads((ROOT/path).read_text(encoding="utf-8"))
def resolve(doc,pointer:str):
    assert pointer=="" or pointer.startswith("/"),pointer
    value=doc
    for part in pointer[1:].split("/") if pointer else []:
        token=part.replace("~1","/").replace("~0","~")
        value=value[int(token)] if isinstance(value,list) else value[token]
    return value

def main():
    assert PR_A_MERGE in subprocess.check_output(["git","rev-list","HEAD"],cwd=ROOT,text=True).splitlines()
    assert BASE in subprocess.check_output(["git","rev-list","HEAD"],cwd=ROOT,text=True).splitlines()
    assert sha(raw(PR_A_MERGE,L9))==PR_A_L9_SHA
    assert sha(raw(BASE,L9))==PR_A_L9_SHA
    assert sha(raw(BASE,L4))==L4_SHA and sha(raw(BASE,L5))==L5_SHA and sha(raw(BASE,L8))==L8_SHA
    assert sha((ROOT/L4).read_bytes())==L4_SHA
    assert sha((ROOT/L5).read_bytes())==L5_SHA
    assert sha((ROOT/L8).read_bytes())==L8_SHA
    candidate_raw=(ROOT/L9).read_bytes()
    assert sha(candidate_raw)==PR_C_L9_SHA

    before=json.loads(raw(BASE,L9)); after=json.loads(candidate_raw)
    l5=load(L5); l7=load(L7); l8=load(L8); l4=load(L4); l3=load(L3)
    assert len(before["integration_cases"])==len(after["integration_cases"])==583
    assert before["integration_cases"]==after["integration_cases"]
    assert len(before["negative_equivalence_classes"])==len(after["negative_equivalence_classes"])==27
    old={x["class_id"]:x for x in before["negative_equivalence_classes"]}
    new={x["class_id"]:x for x in after["negative_equivalence_classes"]}
    assert set(old)==set(new)
    rules=l5["failure_rules"]
    for cid,index in RULE_BINDINGS.items():
        prior=old[cid]; current=new[cid]; expected_pointer=f"/failure_rules/{index}"
        assert rules[index]["id"]==cid
        assert current["class_id"]==cid
        assert current["expected"]==prior["expected"]
        assert current["expected_classification"]==prior["expected_classification"]
        assert current["expected_axis"]==prior["expected_axis"]
        assert current["expected_state"]==prior["expected_state"]
        assert current["backflow_owner"]==prior["backflow_owner"]
        assert current["side_effect_count"]==prior["side_effect_count"]
        assert current["source_pointers"][:-1]==prior["source_pointers"]
        added=current["source_pointers"][-1]
        assert added=={"path":L5,"pointers":[expected_pointer]}
        assert added not in current["source_pointers"][:-1]
        for pointer in added["pointers"]: resolve(l5,pointer)
        assert rules[index]["expected"]["finding_codes"]==current["expected"]["finding_codes"]

    assignments=load(CASE_EVIDENCE)["case_assignments"]
    assert len(assignments)==29
    assigned={a["case_id"]:a["class_id"] for a in assignments}
    assert set(assigned)=={f"HELIXOS-L9-015-C{i:04d}" for i in (*range(45,62),*range(102,114))}
    l9_by_case={x["id"]:x for x in after["integration_cases"]}
    l8_by_case={x["case_id"]:x for x in l8["unit_cases"]}
    assert len(l8_by_case)==583
    for case_id,cid in assigned.items():
        row9=l9_by_case[case_id]; row8=l8_by_case[case_id]
        assert row9["negative_class_ref"]==row8["negative_class_ref"]==cid
        assert row9["material_ref"]["path"]==L7 and row9["material_ref"]["pointer"]==row8["l7_material_ref"]["pointer"]
        assert row8["rule_ref"]==cid

    # 以前のbindingは過去hashを記録に残し、current L9 path hashへ追随している。
    current_hash=sha(candidate_raw)
    for bid in ("SCF-B-0173","SCF-B-0175"):
        binding=load(f"scaffold/bindings/{bid}.json")
        pin=next(x for x in binding["upstream"] if x["path"]==L9)
        assert pin["sha256"]==current_hash
        assert PR_A_L9_SHA in pin["note"]

    return {
        "status":"PASS",
        "base_revision":BASE,
        "pr_a_merge_revision":PR_A_MERGE,
        "prior_l9_sha256":PR_A_L9_SHA,
        "candidate_l9_sha256":current_hash,
        "l9_changes":"既存2 class rowsへL5 pointerを各1件append",
        "source_pointer_map":{cid:f"{L5}#/failure_rules/{idx}" for cid,idx in RULE_BINDINGS.items()},
        "l9_case_rows":583,
        "l9_expectations_and_case_links_unchanged":True,
        "pr_a_pr_b_pr_c_case_coverage":29,
        "pr_a_pr_b_bindings_follow_current_l9":True,
        "other_layers_changed":False,
    }

if __name__=="__main__":
    print(json.dumps(main(),ensure_ascii=False,indent=2))
