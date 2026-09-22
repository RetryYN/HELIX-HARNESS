#!/usr/bin/env python3
"""Independent validator for SCF-B-0124; generator is never imported."""
from pathlib import Path
import argparse, hashlib, json, subprocess, sys

BASE="1cfe3895d861e0cd1533fde08688a9f81f557645"
VISION_PATH="archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md"
VISION_SHA="1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74"
L1_COMMIT="4b42faa2a0e3833b86818e0dec231da3e766c728"
L1_PATH="scaffold/rdp001-outside67-web-webos-l1-anchor-0121/candidate-units.jsonl"
L1_SHA="238c78b02a67629051f3e5680fea72ecd52cf3ad8e02c8c6b5382b52325604a7"
TARGET_BUNDLE_IDS=["0081","0084","0088"]
PARENT_DIGESTS={
 "0080/inventory.json":"b1a0851a9ccca47ec73f558f4a1136b669daefd46563421c83a792e54d2c65b5",
 "0080/vision-spans.jsonl":"b4dbaaf0ba43ba6ab307212ef59559bd06a73089d2d17553cf79928f75e6dc4c",
 "0080/legacy-evidence.jsonl":"cfcb9172ee0d528daea0385f6262b6a7b18e5c6bfb03beee8c9db531e06c82ae",
 "0081/inventory.json":"0b55229cb18f2495798cf80ba2f8d49d240ab8dfe8de190aaa85a3bb5c97a835",
 "0081/semantic-atoms.jsonl":"6a6fdbec06e4c7ad41a9ecbf83cfe1c6420f9c5cbefb1f370c10c2bdc3be2078",
 "0081/legacy-links.jsonl":"ab493ded99eeefd70b1de5a8b3ec0587d0b92b25ed836c349485d3d897d19947",
 "0084/inventory.json":"759d6b0377c9bd9194b897db0fed8a86c91c451af7d37f7a0b66b7b828373d18",
 "0084/semantic-atoms.jsonl":"3abafb9a1408d78e2114f14d5935569b2a28c8dad59536a0ffa1142f2c12451a",
 "0084/legacy-links.jsonl":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 "0088/inventory.json":"e5fca396f834c8357bd8b2f427214d0bfa32bff16d1703d5d57ec2ce4378e2f2",
 "0088/semantic-atoms.jsonl":"eea5d17398c85f8fc42eeb7bf8f9984a026e519df972d31eda0477b4ae194c62",
 "0088/legacy-links.jsonl":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
}
OTHER_DIGESTS={
 "docs/concept/product-boundary.md":"097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038",
 "docs/helix-web/L1-planning/product-intent.md":"26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756",
 "docs/helix-web-os/L1-planning/system-intent.md":"600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c",
 "docs/governance/new-generation-start-here.md":"6bccf1003ad3200a56740322db2589340f675a73a5b64d4444de793aed35f995",
}
PARENT_BINDING_DIGESTS={
 "SCF-B-0080":"3d0f61775d0095774a6057c381f581576fca420e43c7e511c94cad761681a6e2",
 "SCF-B-0081":"5ac1b306f661909e633ab3a4c97de74808acd776652b24c077ba7ce9ec5b758c",
 "SCF-B-0084":"2156e887025045d5c03303d0bc9006f8f7e678dff5c7ff7b49b2d81f9360571c",
 "SCF-B-0088":"4b7d490c20c009bc1cc902c79417751e72e5cf8005ba89a008481bec7c79a3f3",
}
NEGATIVE_CODES=["E_INPUT_DIGEST","E_BASE_COMMIT","E_CANDIDATE_SET","E_SPAN_ANCHOR","E_ASSET_SET","E_ASSET_SOURCE","E_ASSET_HISTORY","E_ASSET_LINK","E_L1_ANCHOR","E_PHASE_BOUNDARY","E_FORMAL_BOUNDARY","E_PRODUCT_BOUNDARY","E_MATRIX_CARDINALITY","E_INVENTORY_DECLARATION"]
class VError(Exception):
 def __init__(self,code,msg): self.code=code; self.msg=msg
def fail(code,msg): raise VError(code,msg)
def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def sha_file(p):
 try:return sha_bytes(p.read_bytes())
 except FileNotFoundError: fail("E_INPUT_DIGEST",f"missing {p}")
def load_json(p,code):
 try:return json.loads(p.read_text())
 except Exception as e:fail(code,f"invalid JSON {p}: {e}")
def load_jsonl(p,code):
 try:return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
 except Exception as e:fail(code,f"invalid JSONL {p}: {e}")
def exact(g,e,c,l):
 if g!=e: fail(c,f"{l} mismatch")
def git_show(repo,commit,path):
 try:return subprocess.check_output(["git","show",f"{commit}:{path}"],cwd=repo)
 except subprocess.CalledProcessError:fail("E_INPUT_DIGEST",f"git input missing {commit}:{path}")
def source_records(bundle):
 out=[]
 for b in TARGET_BUNDLE_IDS: out += [(b,x) for x in load_jsonl(bundle/f"inputs/parents/{b}/semantic-atoms.jsonl","E_INPUT_DIGEST")]
 return out

def expected_assessments_and_matrix(bundle):
 parents=source_records(bundle); assets=load_jsonl(bundle/"inputs/parents/0080/legacy-evidence.jsonl","E_INPUT_DIGEST"); links=load_jsonl(bundle/"inputs/parents/0081/legacy-links.jsonl","E_INPUT_DIGEST")
 linked={x["asset_id"] for x in links}; l1=load_jsonl(bundle/"inputs/l1-anchor-0121/candidate-units.jsonl","E_INPUT_DIGEST")
 l1map={"HELIX-Web":[x["candidate_id"] for x in l1 if x["candidate_product"]=="HELIX-Web"],"HELIX-Web-OS":[x["candidate_id"] for x in l1 if x["candidate_product"]=="HELIX-Web-OS"]}
 ass=[]; mat=[]; conn=[]
 for b,src in parents:
  product=src.get("candidate_product"); alts=src.get("candidate_product_candidates") or []; fixed=product in l1map
  anchors=l1map[product] if fixed else []
  shared=0; counter=0
  for asset in assets:
   same=asset["source_sha256"]==VISION_SHA
   if same: sob="shared_source_digest_path_diff"; ck="source_path_mismatch; shared digest is document provenance only"; shared+=1
   else: sob="no_exact_source_digest"; ck="candidate span has no asset source digest match"; counter+=1
   mat.append({"pair_id":f"{src['atom_id']}::{asset['asset_id']}","atom_id":src["atom_id"],"parent_span_id":src["parent_span_id"],"input_bundle_id":b,"candidate_source_path":src["source_path"],"candidate_source_line_start":src["source_line_start"],"candidate_source_line_end":src["source_line_end"],"candidate_source_span_sha256":src["source_span_sha256"],"asset_id":asset["asset_id"],"asset_source_path":asset["source_path"],"asset_source_sha256":asset["source_sha256"],"source_observation":sob,"asset_relation_observation":"parent_candidate_only_no_atom_id" if asset["asset_id"] in linked else "no_candidate_asset_relation","history_observation":"no_matching_read_after_record","failure_observation":asset["failure_evidence"]["status"],"consumer_observation":asset["consumer_evidence"]["closure_status"],"decision_observation":asset["decision_evidence"]["status"],"semantic_link_status":"unresolved_insufficient_candidate_atom_link","match_kind":"source_provenance_only" if same else "none_observed","counterevidence":ck,"formal_phase_status":"unknown","formal_asset_status":"unknown","authority_status":"none"})
  ass.append({"assessment_id":f"VISION-ASSET-{src['atom_id']}","input_bundle_id":b,"atom_id":src["atom_id"],"parent_span_id":src["parent_span_id"],"source_path":src["source_path"],"source_line_start":src["source_line_start"],"source_line_end":src["source_line_end"],"source_span_sha256":src["source_span_sha256"],"exact_source_text":src["exact_source_text"],"candidate_product":product,"candidate_product_candidates":alts,"candidate_kind":src["candidate_kind"],"atomization_status":src["atomization_status"],"semantic_equivalence":src["semantic_equivalence"],"l1_anchor_candidate_ids":anchors,"l1_connection_status":"product_scope_candidate_only" if fixed else "product_boundary_unresolved","phase_candidate_ids":[],"phase_status":"unknown","asset_status":"unknown","asset_semantic_link_status":"unresolved_no_atom_link","legacy_asset_ids":[],"formal_requirement_unit_status":"not_generated","authority_status":"none","legacy_implementation_status":"unknown","current_implementation_status":"unknown","legacy_degradation_status":"unknown","current_degradation_status":"unknown","failure_status":"unknown","consumer_status":"unknown","decision_status":"unknown","meaning_change_applied":False,"evidence_partition":{"source":"exact_span_only","asset":"no_candidate_atom_link","phase":"no_phase_candidate_or_PHCAP_ref","implementation":"unknown","degradation":"unknown","failure":"unknown","consumer":"unknown"},"required_evidence":["人間承認済みL1／要求revisionとのsemantic relation","PHCAP直接根拠・phase owner・authority・acceptance","candidate atomとasset source／history／failure／consumerの明示リンク","implementation／degradationのcurrent source・受入・read-after evidence"],"unresolved_product_boundary":not fixed,"product_boundary_alternatives":alts,"asset_pair_summary":{"pair_count":len(assets),"source_digest_match_count":shared,"source_digest_mismatch_count":counter,"candidate_asset_semantic_link_count":0,"insufficient_history_failure_consumer_count":len(assets),"counterevidence_count":counter}})
  if fixed: conn.append({"connection_id":f"VISION-L1-{src['atom_id']}","atom_id":src["atom_id"],"candidate_product":product,"l1_anchor_candidate_ids":anchors,"connection_status":"candidate_only","source_span_sha256":src["source_span_sha256"],"semantic_equivalence":"unknown","phase_status":"unknown","asset_status":"unknown","authority_status":"none","formal_requirement_unit_status":"not_generated"})
 return ass,mat,conn

def validate(bundle,repo):
 inv=load_json(bundle/"inventory.json","E_INVENTORY_DECLARATION")
 if inv.get("scope",{}).get("base_origin_main")!=BASE or inv.get("scope",{}).get("required_ancestor")!=BASE: fail("E_BASE_COMMIT","BASE declaration mismatch")
 if subprocess.run(["git","merge-base","--is-ancestor",BASE,"HEAD"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode: fail("E_BASE_COMMIT","HEAD is not descendant of BASE")
 # Immutable parent and current input bytes.
 for rel,d in PARENT_DIGESTS.items():
  p=bundle/"inputs/parents"/rel
  if sha_file(p)!=d: fail("E_INPUT_DIGEST",f"parent input changed {rel}")
 for rel,d in OTHER_DIGESTS.items():
  if sha_file(repo/rel)!=d: fail("E_INPUT_DIGEST",f"current input changed {rel}")
 for bid,d in PARENT_BINDING_DIGESTS.items():
  if sha_file(repo/f"scaffold/bindings/{bid}.json")!=d: fail("E_INPUT_DIGEST",f"binding input changed {bid}")
 l1path=bundle/"inputs/l1-anchor-0121/candidate-units.jsonl"
 if sha_file(l1path)!=L1_SHA: fail("E_INPUT_DIGEST","#2073 L1 anchor input digest changed")
 if git_show(repo,L1_COMMIT,L1_PATH)!=l1path.read_bytes(): fail("E_INPUT_DIGEST","#2073 L1 anchor snapshot does not match immutable commit")
 l1inv=load_json(bundle/"inputs/l1-anchor-0121/inventory.json","E_INPUT_DIGEST")
 if sha_file(bundle/"inputs/l1-anchor-0121/inventory.json")!="ac8230c9e2c824a6fc1fdd8b705c7dcced10fe1f5c5ed7d520bf51b67d5bef97": fail("E_INPUT_DIGEST","#2073 inventory digest changed")
 if sha_file(bundle/"inputs/l1-anchor-0121/SCF-B-0121.json")!="d35d32b642bc6aebd58ffbd32853fbf4b272fb81b51dc1f7edd17dcc4b7bdf4c": fail("E_INPUT_DIGEST","#2073 binding digest changed")
 if sha_file(bundle/"inputs/vision-source.md")!=VISION_SHA or len((bundle/"inputs/vision-source.md").read_bytes())!=50481: fail("E_INPUT_DIGEST","Vision source snapshot changed")
 # Parent records and exact spans.
 parents=source_records(bundle); atoms=[x for _,x in parents]
 ids=[x["atom_id"] for x in atoms]
 if len(atoms)!=35 or len(set(ids))!=35 or len({x["parent_span_id"] for x in atoms})!=29: fail("E_CANDIDATE_SET","candidate input set/cardinality mismatch")
 for x in atoms:
  if x["source_path"]!=VISION_PATH or sha_bytes(x["exact_source_text"].encode())!=x["source_span_sha256"]: fail("E_SPAN_ANCHOR",f"input span mismatch {x['atom_id']}")
  lines=(bundle/"inputs/vision-source.md").read_text().splitlines(True)
  actual=''.join(lines[x["source_line_start"]-1:x["source_line_end"]])
  if actual!=x["exact_source_text"]: fail("E_SPAN_ANCHOR",f"Vision line anchor mismatch {x['atom_id']}")
 # Asset evidence and static snapshots.
 assets=load_jsonl(bundle/"inputs/parents/0080/legacy-evidence.jsonl","E_ASSET_SET"); aids=[x["asset_id"] for x in assets]
 if len(assets)!=12 or len(set(aids))!=12: fail("E_ASSET_SET","asset set/cardinality mismatch")
 for a in assets:
  snap=bundle/"inputs/asset-sources"/a["source_path"].replace('/','_')
  if not snap.is_file() or sha_file(snap)!=a["source_sha256"]: fail("E_ASSET_SOURCE",f"asset source mismatch {a['asset_id']}")
  if a["failure_evidence"]["status"]!="no_dedicated_asset_failure_record_found" or a["consumer_evidence"]["closure_status"]!="pending" or a["decision_evidence"]["status"]!="no_matching_decision_record": fail("E_ASSET_HISTORY",f"asset history/failure/consumer boundary changed {a['asset_id']}")
 links=load_jsonl(bundle/"inputs/parents/0081/legacy-links.jsonl","E_ASSET_LINK")
 if len(links)!=6 or any(x.get("relation_status")!="candidate_only" for x in links) or any("atom_id" in x for x in links): fail("E_ASSET_LINK","parent asset relation boundary changed")
 # Current L1 input rows remain exact against current docs.
 for x in load_jsonl(l1path,"E_L1_ANCHOR"):
  p=repo/x["current_l1_source_path"]
  if sha_file(p)!=x["current_l1_source_sha256"]: fail("E_L1_ANCHOR",f"L1 source digest mismatch {x['candidate_id']}")
  lines=p.read_text().splitlines()
  if len(lines)<x["current_l1_line"] or lines[x["current_l1_line"]-1]!=x["current_l1_text"]: fail("E_L1_ANCHOR",f"L1 line mismatch {x['candidate_id']}")
 expected_ass,expected_mat,expected_conn=expected_assessments_and_matrix(bundle)
 got_ass=load_jsonl(bundle/"candidate-assessments.jsonl","E_CANDIDATE_SET")
 if len(got_ass)!=35 or len({x.get("atom_id") for x in got_ass})!=35: fail("E_CANDIDATE_SET","candidate output set/cardinality mismatch")
 # Boundary-specific failures get dedicated codes before whole-record comparison.
 for g,e in zip(sorted(got_ass,key=lambda x:x.get("atom_id","")),sorted(expected_ass,key=lambda x:x["atom_id"])):
  if g.get("atom_id")!=e["atom_id"]: fail("E_CANDIDATE_SET","candidate output ID set mismatch")
  if g.get("source_span_sha256")!=e["source_span_sha256"] or g.get("exact_source_text")!=e["exact_source_text"]: fail("E_SPAN_ANCHOR",f"output span changed {e['atom_id']}")
  if g.get("phase_status")!="unknown" or g.get("phase_candidate_ids")!=[]: fail("E_PHASE_BOUNDARY",f"phase promoted {e['atom_id']}")
  if g.get("formal_requirement_unit_status")!="not_generated" or g.get("authority_status")!="none": fail("E_FORMAL_BOUNDARY",f"formal boundary changed {e['atom_id']}")
  if g.get("candidate_product")!=e["candidate_product"] or g.get("unresolved_product_boundary")!=e["unresolved_product_boundary"]: fail("E_PRODUCT_BOUNDARY",f"product boundary changed {e['atom_id']}")
  if g.get("asset_semantic_link_status")!="unresolved_no_atom_link": fail("E_ASSET_LINK",f"asset link promoted {e['atom_id']}")
 exact(got_ass,expected_ass,"E_CANDIDATE_SET","candidate assessments")
 got_mat=load_jsonl(bundle/"asset-matrix.jsonl","E_ASSET_SET")
 if len(got_mat)!=420 or len({x.get("pair_id") for x in got_mat})!=420: fail("E_ASSET_SET","asset matrix pair set/cardinality mismatch")
 for g,e in zip(got_mat,expected_mat):
  if g.get("asset_source_sha256")!=e["asset_source_sha256"]: fail("E_ASSET_SOURCE",f"matrix asset source changed {e['pair_id']}")
  if g.get("history_observation")!=e["history_observation"] or g.get("failure_observation")!=e["failure_observation"] or g.get("consumer_observation")!=e["consumer_observation"]: fail("E_ASSET_HISTORY",f"matrix evidence changed {e['pair_id']}")
  if g.get("semantic_link_status")!=e["semantic_link_status"]: fail("E_ASSET_LINK",f"matrix semantic link changed {e['pair_id']}")
 exact(got_mat,expected_mat,"E_ASSET_SET","asset matrix")
 got_conn=load_jsonl(bundle/"l1-connection-candidates.jsonl","E_L1_ANCHOR")
 exact(got_conn,expected_conn,"E_L1_ANCHOR","L1 candidate connections")
 if inv.get("candidate_counts",{}).get("phase_connection_count")!=0 or inv.get("candidate_counts",{}).get("asset_connection_count")!=0: fail("E_PHASE_BOUNDARY","inventory connection count promoted")
 if inv.get("asset_comparison",{}).get("matrix_pair_count")!=420: fail("E_MATRIX_CARDINALITY","inventory matrix cardinality changed")
 if inv.get("candidate_counts",{}).get("product_unresolved")!=8: fail("E_PRODUCT_BOUNDARY","unresolved product count changed")
 if inv.get("formal_requirement_unit_count")!="not_generated" or inv.get("authority_effect")!="none": fail("E_FORMAL_BOUNDARY","inventory formal boundary changed")
 if inv.get("negative_case_codes")!=NEGATIVE_CODES: fail("E_INVENTORY_DECLARATION","negative case declaration changed")
 exact(load_json(bundle/"source-diff.json","E_INVENTORY_DECLARATION"),EXPECTED_SOURCE_DIFF,"E_INVENTORY_DECLARATION","source-diff")
 exact(inv,EXPECTED_INVENTORY,"E_INVENTORY_DECLARATION","inventory")
 print("SCF-B-0124 validate: PASS (35 candidates, 420 asset pairs, 0 phase links, 0 semantic asset links; static-only)")

# Fixed inventory/source-diff snapshots are intentionally literal oracle data, independent of generate.py.
EXPECTED_SOURCE_DIFF = {'vision_source': {'path': 'archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md', 'sha256': '1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74', 'line_count': 583, 'relation': 'all candidate spans are exact source spans; no formal adoption'}, 'candidate_source_paths': {'unique_count': 1, 'path': 'archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md', 'candidate_count': 35, 'span_count': 35, 'duplicate_span_count': 0}, 'asset_source': {'representative_count': 12, 'source_digest_match_count': 35, 'semantic_asset_link_count': 0}, 'l1_anchor_input': {'candidate_count': 11, 'sha256': '238c78b02a67629051f3e5680fea72ecd52cf3ad8e02c8c6b5382b52325604a7', 'status': 'candidate_only'}}
EXPECTED_INVENTORY = {'schema': 'rdp001-web-webos-vision-asset-semantic/v1', 'candidate_id': 'RDP-001-WEB-WEBOS-VISION-ASSET-SEMANTIC-0124', 'status': 'findings_only', 'authority_effect': 'none', 'meaning_change_applied': False, 'formal_requirement_unit_count': 'not_generated', 'successor_requirement_ids': [], 'human_decision_ref': None, 'formal_register_append': False, 'old_runtime_test_ci_execution': False, 'new_build': False, 'scope': {'worktree': 'vision-asset-semantic-0124', 'base_origin_main': '1cfe3895d861e0cd1533fde08688a9f81f557645', 'required_ancestor': '1cfe3895d861e0cd1533fde08688a9f81f557645', 'read_only': True, 'static_only': True, 'old_archive_execution': False, 'vision_source_path': 'archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md', 'vision_source_sha256': '1725bee697999140ac0f7d0926b4a4cf5636a2f7e3d5a554822c722c3effcd74', 'vision_candidate_count': 35, 'vision_parent_span_count': 29, 'representative_asset_count': 12, 'l1_anchor_input_commit': '4b42faa2a0e3833b86818e0dec231da3e766c728', 'l1_anchor_input_path': 'scaffold/rdp001-outside67-web-webos-l1-anchor-0121/candidate-units.jsonl', 'l1_anchor_input_sha256': '238c78b02a67629051f3e5680fea72ecd52cf3ad8e02c8c6b5382b52325604a7', 'read_after_path': 'docs/governance/legacy-asset-copy-read-after.jsonl'}, 'candidate_counts': {'total': 35, 'atomized_candidate': 19, 'composite_unresolved': 16, 'product_fixed_web': 13, 'product_fixed_webos': 14, 'product_unresolved': 8, 'phase_connection_count': 0, 'asset_connection_count': 0, 'phase_unknown_count': 35, 'asset_unknown_count': 35}, 'product_candidate_membership': {'HELIX-HARNESS': 3, 'HELIX-OS': 6, 'HELIX-Web': 18, 'HELIX-Web-OS': 22, 'overlapping_membership': True, 'unresolved_atom_ids': ['WEB-FINAL-ATOM-002', 'WEBOS-FINAL-ATOM-003', 'WEB-FINAL-COMPOSITE-004', 'HARNESS-OS-FINAL-COMPOSITE-005', 'OS-WEBOS-FINAL-COMPOSITE-006', 'OS-WEBOS-FINAL-COMPOSITE-007', 'OS-WEB-FINAL-COMPOSITE-008', 'HARNESS-WEBOS-FINAL-COMPOSITE-009']}, 'l1_anchor_input': {'total': 11, 'web': 6, 'webos': 5, 'fixed_product_connection_record_count': 27, 'l1_product_edge_count': 148, 'unresolved_product_boundary_count': 8, 'formal_l1_relation_count': 0}, 'asset_comparison': {'matrix_pair_count': 420, 'source_digest_match_pair_count': 35, 'source_digest_mismatch_pair_count': 385, 'parent_asset_candidate_only_pair_count': 210, 'no_candidate_asset_relation_pair_count': 210, 'history_failure_consumer_insufficient_pair_count': 420, 'candidate_atom_asset_link_count': 0, 'formal_asset_relation_count': 0}, 'decision_partition': {'match_observation': 'source digest provenance only; not semantic link', 'counterevidence_observation': 'path／digest mismatch or shared-source identity insufficiency', 'insufficient_observation': 'no atom-level asset link; history read-after absent; failure unknown; consumer pending; decision absent'}, 'input_pins': {'parent_0080_inventory': 'b1a0851a9ccca47ec73f558f4a1136b669daefd46563421c83a792e54d2c65b5', 'parent_0080_spans': 'b4dbaaf0ba43ba6ab307212ef59559bd06a73089d2d17553cf79928f75e6dc4c', 'parent_0080_assets': 'cfcb9172ee0d528daea0385f6262b6a7b18e5c6bfb03beee8c9db531e06c82ae', 'parent_0081_atoms': '6a6fdbec06e4c7ad41a9ecbf83cfe1c6420f9c5cbefb1f370c10c2bdc3be2078', 'parent_0081_links': 'ab493ded99eeefd70b1de5a8b3ec0587d0b92b25ed836c349485d3d897d19947', 'parent_0084_atoms': '3abafb9a1408d78e2114f14d5935569b2a28c8dad59536a0ffa1142f2c12451a', 'parent_0088_atoms': 'eea5d17398c85f8fc42eeb7bf8f9984a026e519df972d31eda0477b4ae194c62', 'l1_anchor_units': '238c78b02a67629051f3e5680fea72ecd52cf3ad8e02c8c6b5382b52325604a7', 'product_boundary': '097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038'}, 'negative_case_codes': ['E_INPUT_DIGEST', 'E_BASE_COMMIT', 'E_CANDIDATE_SET', 'E_SPAN_ANCHOR', 'E_ASSET_SET', 'E_ASSET_SOURCE', 'E_ASSET_HISTORY', 'E_ASSET_LINK', 'E_L1_ANCHOR', 'E_PHASE_BOUNDARY', 'E_FORMAL_BOUNDARY', 'E_PRODUCT_BOUNDARY', 'E_MATRIX_CARDINALITY', 'E_INVENTORY_DECLARATION']}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root');ap.add_argument('--repo-root');a=ap.parse_args();bundle=Path(a.root).resolve() if a.root else Path(__file__).resolve().parent;repo=Path(a.repo_root).resolve() if a.repo_root else bundle.parents[1]
 try:validate(bundle,repo)
 except VError as e: print(f"{e.code}: {e.msg}");return 1
 return 0
if __name__=='__main__':sys.exit(main())
