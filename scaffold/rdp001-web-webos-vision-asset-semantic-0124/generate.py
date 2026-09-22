#!/usr/bin/env python3
"""Generate the 35-candidate × 12-asset static comparison scaffold.
All inputs are already captured under inputs/; no archive code or runtime is run.
"""
from pathlib import Path
import hashlib, json

HERE = Path(__file__).resolve().parent
VISION_SHA = "1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74"
VISION_PATH = "archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md"
L1 = {
    "HELIX-Web": ["OUTSIDE67-PATH-010-HELIXWEB-L1-001","OUTSIDE67-PATH-010-HELIXWEB-L1-002","OUTSIDE67-PATH-010-HELIXWEB-L1-003","OUTSIDE67-PATH-010-HELIXWEB-L1-004","OUTSIDE67-PATH-010-HELIXWEB-L1-005","OUTSIDE67-PATH-010-HELIXWEB-L1-006"],
    "HELIX-Web-OS": ["OUTSIDE67-PATH-007-HELIXWEBOS-L1-001","OUTSIDE67-PATH-007-HELIXWEBOS-L1-002","OUTSIDE67-PATH-007-HELIXWEBOS-L1-003","OUTSIDE67-PATH-007-HELIXWEBOS-L1-004","OUTSIDE67-PATH-007-HELIXWEBOS-L1-005"],
}
L1_SOURCE = {"HELIX-Web":"docs/helix-web/L1-planning/product-intent.md","HELIX-Web-OS":"docs/helix-web-os/L1-planning/system-intent.md"}
L1_SHA = {"HELIX-Web":"26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIX-Web-OS":"600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c"}
L1_COMMIT = "882cbd0c56320f06dd06311499497b216b289542"
L1_APPROVAL_DECISION_PATH = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1_APPROVAL_DECISION_SHA = "b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2"
L1_APPROVAL_DECISION_IDS = {"HELIX-Web": "HDEC-HELIXWEB-L1-01", "HELIX-Web-OS": "HDEC-HELIXWEBOS-L1-01"}

def load_json(p): return json.loads(p.read_text())
def load_jsonl(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def write_json(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n")
def write_jsonl(p,xs): p.write_text("".join(json.dumps(x,ensure_ascii=False,sort_keys=True)+"\n" for x in xs))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    parents=[]
    for b in ["0081","0084","0088"]:
        parents.extend((b,x) for x in load_jsonl(HERE/f"inputs/parents/{b}/semantic-atoms.jsonl"))
    if len(parents)!=35: raise SystemExit(f"candidate count {len(parents)}")
    assets=load_jsonl(HERE/"inputs/parents/0080/legacy-evidence.jsonl")
    links=load_jsonl(HERE/"inputs/parents/0081/legacy-links.jsonl")
    asset_ids=[x["asset_id"] for x in assets]
    linked_ids={x["asset_id"] for x in links}
    l1_rows=load_jsonl(HERE/"inputs/l1-anchor-0121/candidate-units.jsonl")
    if len(l1_rows)!=11: raise SystemExit("L1 anchor input count mismatch")
    l1_by_product={p:[x for x in l1_rows if x["candidate_product"]==p] for p in L1}
    assessments=[]; matrix=[]; l1_connections=[]
    fixed_counts={"HELIX-Web":0,"HELIX-Web-OS":0}; unresolved=[]
    for b,src in parents:
        atom=src["atom_id"]
        products=src.get("candidate_product_candidates")
        product=src.get("candidate_product")
        fixed=product in L1
        if fixed: fixed_counts[product]+=1
        else: unresolved.append(atom)
        anchor_ids=L1[product] if fixed else []
        l1_status="product_scope_candidate_only" if fixed else "product_boundary_unresolved"
        assessment={
          "assessment_id":f"VISION-ASSET-{atom}","input_bundle_id":b,"atom_id":atom,"parent_span_id":src["parent_span_id"],
          "source_path":src["source_path"],"source_line_start":src["source_line_start"],"source_line_end":src["source_line_end"],
          "source_span_sha256":src["source_span_sha256"],"exact_source_text":src["exact_source_text"],
          "candidate_product":product,"candidate_product_candidates":products or [],"candidate_kind":src["candidate_kind"],"atomization_status":src["atomization_status"],
          "semantic_equivalence":src["semantic_equivalence"],"l1_anchor_candidate_ids":anchor_ids,"l1_connection_status":l1_status,
          "phase_candidate_ids":[],"phase_status":"unknown","asset_status":"unknown","asset_semantic_link_status":"unresolved_no_atom_link",
          "legacy_asset_ids":[],"formal_requirement_unit_status":"not_generated","authority_status":"none",
          "legacy_implementation_status":"unknown","current_implementation_status":"unknown","legacy_degradation_status":"unknown","current_degradation_status":"unknown",
          "failure_status":"unknown","consumer_status":"unknown","decision_status":"unknown","meaning_change_applied":False,
          "evidence_partition":{"source":"exact_span_only","asset":"no_candidate_atom_link","phase":"no_phase_candidate_or_PHCAP_ref","implementation":"unknown","degradation":"unknown","failure":"unknown","consumer":"unknown"},
          "required_evidence":["人間承認済みL1／要求revisionとのsemantic relation","PHCAP直接根拠・phase owner・authority・acceptance","candidate atomとasset source／history／failure／consumerの明示リンク","implementation／degradationのcurrent source・受入・read-after evidence"],
          "unresolved_product_boundary": not fixed,
          "product_boundary_alternatives": products or [],
        }
        assessments.append(assessment)
        shared=0; counter=0
        for asset in assets:
            aid=asset["asset_id"]
            source_digest_match=asset["source_sha256"]==VISION_SHA
            relation="parent_candidate_only_no_atom_id" if aid in linked_ids else "no_candidate_asset_relation"
            if source_digest_match:
                source_observation="shared_source_digest_path_diff"
                counter_kind="source_path_mismatch; shared digest is document provenance only"
                shared+=1
            else:
                source_observation="no_exact_source_digest"
                counter_kind="candidate span has no asset source digest match"
                counter+=1
            matrix.append({
              "pair_id":f"{atom}::{aid}","atom_id":atom,"parent_span_id":src["parent_span_id"],"input_bundle_id":b,
              "candidate_source_path":src["source_path"],"candidate_source_line_start":src["source_line_start"],"candidate_source_line_end":src["source_line_end"],"candidate_source_span_sha256":src["source_span_sha256"],
              "asset_id":aid,"asset_source_path":asset["source_path"],"asset_source_sha256":asset["source_sha256"],
              "source_observation":source_observation,"asset_relation_observation":relation,
              "history_observation":"no_matching_read_after_record","failure_observation":asset["failure_evidence"]["status"],"consumer_observation":asset["consumer_evidence"]["closure_status"],"decision_observation":asset["decision_evidence"]["status"],
              "semantic_link_status":"unresolved_insufficient_candidate_atom_link","match_kind":"source_provenance_only" if source_digest_match else "none_observed","counterevidence":counter_kind,
              "formal_phase_status":"unknown","formal_asset_status":"unknown","authority_status":"none",
            })
        assessment["asset_pair_summary"]={"pair_count":len(assets),"source_digest_match_count":shared,"source_digest_mismatch_count":counter,"candidate_asset_semantic_link_count":0,"insufficient_history_failure_consumer_count":len(assets),"counterevidence_count":counter}
        if fixed:
            l1_connections.append({"connection_id":f"VISION-L1-{atom}","atom_id":atom,"candidate_product":product,"l1_anchor_candidate_ids":anchor_ids,"connection_status":"candidate_only","source_span_sha256":src["source_span_sha256"],"semantic_equivalence":"unknown","phase_status":"unknown","asset_status":"unknown","authority_status":"none","formal_requirement_unit_status":"not_generated"})
    write_jsonl(HERE/"candidate-assessments.jsonl",assessments)
    write_jsonl(HERE/"asset-matrix.jsonl",matrix)
    write_jsonl(HERE/"l1-connection-candidates.jsonl",l1_connections)
    write_json(HERE/"source-diff.json",{
      "vision_source":{"path":VISION_PATH,"sha256":VISION_SHA,"line_count":583,"relation":"all candidate spans are exact source spans; no formal adoption"},
      "candidate_source_paths":{"unique_count":1,"path":VISION_PATH,"candidate_count":35,"span_count":35,"duplicate_span_count":0},
      "asset_source":{"representative_count":12,"source_digest_match_count":35,"semantic_asset_link_count":0},
      "l1_anchor_input":{"candidate_count":11,"sha256":sha(HERE/"inputs/l1-anchor-0121/candidate-units.jsonl"),"status":"candidate_only"},
    })
    inventory={
      "schema":"rdp001-web-webos-vision-asset-semantic/v1","candidate_id":"RDP-001-WEB-WEBOS-VISION-ASSET-SEMANTIC-0124","status":"findings_only","authority_effect":"none","meaning_change_applied":False,"formal_requirement_unit_count":"not_generated","successor_requirement_ids":[],"human_decision_ref":None,"formal_register_append":False,"old_runtime_test_ci_execution":False,"new_build":False,
      "scope":{"worktree":"vision-asset-semantic-0124","base_origin_main":"1cfe3895d861e0cd1533fde08688a9f81f557645","required_ancestor":"1cfe3895d861e0cd1533fde08688a9f81f557645","read_only":True,"static_only":True,"old_archive_execution":False,"vision_source_path":VISION_PATH,"vision_source_sha256":VISION_SHA,"vision_candidate_count":35,"vision_parent_span_count":29,"representative_asset_count":12,"l1_anchor_input_commit":L1_COMMIT,"l1_anchor_input_path":"scaffold/rdp001-outside67-web-webos-l1-anchor-0121/candidate-units.jsonl","l1_anchor_input_sha256":sha(HERE/"inputs/l1-anchor-0121/candidate-units.jsonl"),"read_after_path":"docs/governance/legacy-asset-copy-read-after.jsonl"},
      "candidate_counts":{"total":35,"atomized_candidate":19,"composite_unresolved":16,"product_fixed_web":13,"product_fixed_webos":14,"product_unresolved":8,"phase_connection_count":0,"asset_connection_count":0,"phase_unknown_count":35,"asset_unknown_count":35},
      "product_candidate_membership":{"HELIX-HARNESS":3,"HELIX-OS":6,"HELIX-Web":18,"HELIX-Web-OS":22,"overlapping_membership":True,"unresolved_atom_ids":unresolved},
      "l1_anchor_input":{"total":11,"web":6,"webos":5,"fixed_product_connection_record_count":27,"l1_product_edge_count":148,"unresolved_product_boundary_count":8,"formal_l1_relation_count":0},
      "asset_comparison":{"matrix_pair_count":420,"source_digest_match_pair_count":35,"source_digest_mismatch_pair_count":385,"parent_asset_candidate_only_pair_count":210,"no_candidate_asset_relation_pair_count":210,"history_failure_consumer_insufficient_pair_count":420,"candidate_atom_asset_link_count":0,"formal_asset_relation_count":0},
      "decision_partition":{"match_observation":"source digest provenance only; not semantic link","counterevidence_observation":"path／digest mismatch or shared-source identity insufficiency","insufficient_observation":"no atom-level asset link; history read-after absent; failure unknown; consumer pending; decision absent"},
      "input_pins":{"parent_0080_inventory":"b1a0851a9ccca47ec73f558f4a1136b669daefd46563421c83a792e54d2c65b5","parent_0080_spans":"b4dbaaf0ba43ba6ab307212ef59559bd06a73089d2d17553cf79928f75e6dc4c","parent_0080_assets":"cfcb9172ee0d528daea0385f6262b6a7b18e5c6bfb03beee8c9db531e06c82ae","parent_0081_atoms":"6a6fdbec06e4c7ad41a9ecbf83cfe1c6420f9c5cbefb1f370c10c2bdc3be2078","parent_0081_links":"ab493ded99eeefd70b1de5a8b3ec0587d0b92b25ed836c349485d3d897d19947","parent_0084_atoms":"3abafb9a1408d78e2114f14d5935569b2a28c8dad59536a0ffa1142f2c12451a","parent_0088_atoms":"eea5d17398c85f8fc42eeb7bf8f9984a026e519df972d31eda0477b4ae194c62","l1_anchor_units":sha(HERE/"inputs/l1-anchor-0121/candidate-units.jsonl"),"l1_approval_decision":L1_APPROVAL_DECISION_SHA,"product_boundary":"097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"},
      "negative_case_count":16,"negative_case_codes":["E_INPUT_DIGEST","E_BASE_COMMIT","E_CANDIDATE_SET","E_SPAN_ANCHOR","E_ASSET_SET","E_ASSET_SOURCE","E_ASSET_HISTORY","E_ASSET_LINK","E_L1_ANCHOR","E_PHASE_BOUNDARY","E_FORMAL_BOUNDARY","E_PRODUCT_BOUNDARY","E_MATRIX_CARDINALITY","E_INVENTORY_DECLARATION"],
    }
    write_json(HERE/"inventory.json",inventory)
    (HERE/"README.md").write_text(f'''# SCF-B-0124 Vision 35 × legacy asset 12 semantic research\n\n固定BASE `1cfe3895d861e0cd1533fde08688a9f81f557645` で、SCF-B-0080／0081／0084／0088のVision 35候補と代表旧asset 12件をcandidate atom単位で静的照合する研究用Scaffoldである。#2073の固定commit `882cbd0c56320f06dd06311499497b216b289542` にあるWeb L1 6＋Web-OS L1 5のanchor候補も入力として、製品境界candidate-onlyの接続可能性を保持する。\n\n候補35件はexact source span／ID／digestを保持し、phase connection 0/35、asset semantic link 0/35、formal requirement／phase／product authority／implementation／degradationは生成しない。製品固定候補はWeb 13、Web-OS 14、製品未解決8。未解決8はU18／U19／O05〜O10であり、L1接続を確定しない。\n\n`asset-matrix.jsonl` は35×12=420 pairを、source digest provenance、source path／digest反証、asset-level candidate-only relation、history／failure／consumer／decision不足へ分ける。shared source digestは意味linkではない。12 asset全件について、candidate atom IDへの明示link、read-after、dedicated failure、decision、consumer closureは不足している。総当たりpairを成立扱いしない。\n\n## 検証\n\n```text\npython3 scaffold/rdp001-web-webos-vision-asset-semantic-0124/generate.py\npython3 scaffold/rdp001-web-webos-vision-asset-semantic-0124/validate.py\npython3 scaffold/rdp001-web-webos-vision-asset-semantic-0124/selfcheck.py\npython3 scaffold/tools/scfctl.py validate\npython3 scaffold/tools/scfctl.py stale\npython3 scaffold/tools/scfctl.py residuals\ngit diff --check\n```\n\nvalidatorは固定BASE、親4束／Vision source／12 asset source、#2073 anchor digest、承認decision digest、35 candidate set、420 matrix cardinality、phase／asset／authority boundaryを独立照合する。#2073の11行はraw metadata（draft／awaiting_parent_approval）とdecision effective approved（HDEC-HELIXWEB／HELIXWEBOS-L1-01）を分離し、研究candidate authority noneを確認する。selfcheckは16負例を期待error codeまで確認する。旧archiveは静的bytesの参照のみで、実行しない。\n''')
    (HERE/"method.md").write_text('''# Method\n\n0080の12 asset evidence、0081／0084／0088の35 semantic atomを固定digestで入力し、candidate atomごとにsource span、product boundary、phase unknown、asset relationを保持した。asset pairはsource digest一致（同一Vision bytes由来）とpath／digest不一致を観測値として分離し、history／failure／consumer／decisionは台帳の観測状態をそのまま保持した。#2073の11 L1 anchorはraw metadata（draft／awaiting_parent_approval）と承認decisionによるeffective approvedを分離したproduct scope candidate-onlyの接続候補として扱い、研究candidate authorityはnone、正式L1／phase／asset relationへ昇格しない。\n''')
    (HERE/"premise.md").write_text('''# Premise and unresolved boundary\n\nsource spanの一致や旧assetのcatalog relationはsemantic equivalence、実装成立、縮退、failure、consumer closureを証明しない。製品固定27候補はL1 product scopeへのcandidate-only edgeを持つが、承認decisionによるeffective approvedは研究candidate authorityを付与せず、製品未解決8候補は人間のproduct boundary判断待ちである。正式phaseにはPHCAP直接根拠、authority、acceptance、revisionが必要で、正式asset linkにはcandidate atom単位のsource／history／failure／consumer evidenceが必要である。\n''')
    (HERE/"status.md").write_text('''# Status\n\n- Binding: SCF-B-0124\n- Candidate atoms: 35（atomized 19、composite_unresolved 16）\n- Product fixed: Web 13、Web-OS 14、unresolved 8\n- Phase connection: 0/35\n- Asset semantic link: 0/35\n- Pair matrix: 420（35×12）\n- L1 anchor input: 11（Web 6、Web-OS 5）\n- Formal phase／product／implementation／degradation／authority: not generated\n''')
    (HERE/"PR-DRAFT.md").write_text('''## Summary\n\nVision 35候補と代表legacy asset 12件をcandidate atom単位で静的照合し、420 pairを一致・反証・不足へpartitionするresearch-only Scaffoldを追加する。#2073の11 L1 anchorは承認decision effective approvedとraw metadata draftを分離したproduct scope candidate-onlyの入力（研究candidate authority none）とし、phase 0/35、asset semantic link 0/35を維持する。formal phase／product／implementation／degradation／authorityへの昇格は行わない。\n\n- Vision candidate: 35（Web 13、Web-OS 14、product unresolved 8）\n- asset matrix: 420（35×12）\n- source digest provenance: match 35、mismatch 385（digest共有はsemantic linkではない）\n- parent candidate-only asset relation: 210、candidate asset relationなし: 210\n- history／failure／consumer／decision不足: 420/420\n- L1 anchor input: 11（Web 6、Web-OS 5）\n- product scope candidate-only: 27 records／148 product edges、formal L1 relation 0\n- phase connection: 0/35、asset semantic link: 0/35\n- negative cases: 16（期待error code照合。L1 authority境界を含む）\n\n## Boundary\n\n全35件はformal unresolvedのまま保持する。source span／shared digest／catalog relationはsemantic equivalence、実装成立、縮退、failure、consumer closureの証拠にしない。製品未解決8件はL1接続を作らず、asset matrixの総当たりpairは成立扱いしない。\n\n## Verification\n\n固定BASE `1cfe3895d861e0cd1533fde08688a9f81f557645`、#2073固定commit `882cbd0c56320f06dd06311499497b216b289542`、Vision source／parent bundles／12 asset source／L1承認decisionをdigest固定した。validator、selfcheck 16負例、`scfctl validate`、`scfctl stale`、`scfctl residuals`、`git diff --check`を実行する。\n\nRefs #1813（進捗参照のみ）\n''')
    print('SCF-B-0124 bundle generated')
if __name__ == '__main__': main()
