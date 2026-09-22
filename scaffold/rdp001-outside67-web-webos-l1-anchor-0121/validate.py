#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0121.
The expected records below are fixed review constants; generate.py is never imported.
"""
from pathlib import Path
import argparse, hashlib, json, re, subprocess, sys

BASE = "e80cb07ce7c6d5d59da39ddacaf3694bdc951e6b"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
HOLDING = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER = "docs/governance/management-provisional-requirement-register.jsonl"
HOLDING_SHA = "d703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54"
REGISTER_SHA = "b68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd"
TARGET_IDS = ["OUTSIDE67-PATH-007", "OUTSIDE67-PATH-009", "OUTSIDE67-PATH-010", "OUTSIDE67-PATH-012"]
TARGET_PATHS = {
    "OUTSIDE67-PATH-007": "docs/design/helix-web-os/L1-planning/system-intent.md",
    "OUTSIDE67-PATH-009": "docs/design/helix-web-os/README.md",
    "OUTSIDE67-PATH-010": "docs/design/helix-web/L1-planning/product-intent.md",
    "OUTSIDE67-PATH-012": "docs/design/helix-web/README.md",
}
PRIOR_RESEARCH_BINDINGS = {
    "OUTSIDE67-PATH-007": ["SCF-B-0096"],
    "OUTSIDE67-PATH-009": ["SCF-B-0096"],
    "OUTSIDE67-PATH-010": ["SCF-B-0096"],
    "OUTSIDE67-PATH-012": ["SCF-B-0099"],
}
PRODUCT_BOUNDARY_SHA = "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"
ENTRY_SHA = "6bccf1003ad3200a56740322db2589340f675a73a5b64d4444de793aed35f995"
L1 = {
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", "26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756"),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", "600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c"),
}
L1_APPROVAL_DECISION_PATH = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1_APPROVAL_DECISION_SHA = "b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2"
L1_APPROVAL_DECISION_IDS = {"HELIX-Web": "HDEC-HELIXWEB-L1-01", "HELIX-Web-OS": "HDEC-HELIXWEBOS-L1-01"}
EXISTING_BINDING_TARGET_PATHS = {
    "SCF-B-0096": ["OUTSIDE67-PATH-006", "OUTSIDE67-PATH-007", "OUTSIDE67-PATH-008", "OUTSIDE67-PATH-009", "OUTSIDE67-PATH-010"],
    "SCF-B-0099": ["OUTSIDE67-PATH-011", "OUTSIDE67-PATH-012", "OUTSIDE67-PATH-013", "OUTSIDE67-PATH-014", "OUTSIDE67-PATH-015"],
}
EXISTING_BINDING_IDS = ["SCF-B-0057", "SCF-B-0062", "SCF-B-0080", "SCF-B-0081", "SCF-B-0084", "SCF-B-0088", "SCF-B-0091", "SCF-B-0096", "SCF-B-0099"]
EXISTING_TARGET_PATH_IDS = [
    "OUTSIDE67-PATH-006", "OUTSIDE67-PATH-007", "OUTSIDE67-PATH-008", "OUTSIDE67-PATH-009", "OUTSIDE67-PATH-010",
    "OUTSIDE67-PATH-011", "OUTSIDE67-PATH-012", "OUTSIDE67-PATH-013", "OUTSIDE67-PATH-014", "OUTSIDE67-PATH-015",
    "OUTSIDE67-PATH-059", "OUTSIDE67-PATH-063", "OUTSIDE67-PATH-064", "OUTSIDE67-PATH-065", "OUTSIDE67-PATH-066",
]
OVERLAP_RESULT = "all 4 target paths overlap prior research selected by SCF-B-0096／0099; retained as prior research"
NEGATIVE_CODES = ["E_SOURCE_DIGEST","E_SOURCE_SNAPSHOT","E_SOURCE_SCHEMA","E_UNIT_SET","E_CANDIDATE_RECORD","E_CONTEXT_BOUNDARY","E_PHASE_BOUNDARY","E_IMPLEMENTATION_BOUNDARY","E_FORMAL_UNIT","E_AUTHORITY_BOUNDARY","E_OVERLAP","E_INVENTORY_DECLARATION","E_INPUT_DIGEST","E_BASE_COMMIT"]
EXPECTED_INVENTORY = {'schema': 'rdp001-outside67-web-webos-l1-anchor/v1', 'candidate_id': 'RDP-001-OUTSIDE67-WEB-WEBOS-L1-0121', 'status': 'findings_only', 'authority_effect': 'none', 'meaning_change_applied': False, 'successor_requirement_ids': [], 'human_decision_ref': None, 'formal_register_append': False, 'old_runtime_test_ci_execution': False, 'new_build': False, 'scope': {'worktree': 'outside67-web-l1-0121', 'base_origin_main': 'e80cb07ce7c6d5d59da39ddacaf3694bdc951e6b', 'base_origin_main_observed_at': 'e80cb07ce7c6d5d59da39ddacaf3694bdc951e6b', 'required_ancestor': 'e80cb07ce7c6d5d59da39ddacaf3694bdc951e6b', 'read_only': True, 'static_only': True, 'holding_registration_id': 'MPR-SH-OUTSIDE67-001', 'holding_path': 'docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl', 'holding_sha256': 'd703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54', 'holding_path_revision_pair_denominator': 67, 'holding_record_count': 67, 'current_live_source_holding_count': 14, 'management_register_path': 'docs/governance/management-provisional-requirement-register.jsonl', 'management_register_sha256': 'b68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd', 'selected_source_document_count': 4, 'selected_path_revision_pair_count': 4, 'unselected_path_revision_pair_count': 63, 'pre_isolation_commit': '2d4991042be55268bac30a8bbcdac45b3865030a', 'archive_commit': '064280b5c1c5c98f949e6e3be5ef87cbe4a4b658', 'historical_capture_commit': '3df81ad27157c471e004083783f37a5860eaa2ee', 'old_runtime_test_ci_execution': False}, 'source_holding': {'registration_id': 'MPR-SH-OUTSIDE67-001', 'source_collection_scope': 'outside67 reportの67 path_revision_pair。要求unitではなくsource保存単位。', 'selected_item_ids': ['OUTSIDE67-PATH-007', 'OUTSIDE67-PATH-009', 'OUTSIDE67-PATH-010', 'OUTSIDE67-PATH-012'], 'selected_ordinals': [7, 9, 10, 12], 'unselected_count': 63, 'current_live_source_holding_count': 14}, 'candidate_summary': {'candidate_unit_count': 11, 'web_l1_candidate_unit_count': 6, 'webos_l1_candidate_unit_count': 5, 'readme_context_record_count': 2, 'source_item_count': 4, 'formal_requirement_unit_count': 0, 'formal_requirement_unit_status': 'not_generated', 'row_sized_anchor_candidate_status': 'research_only', 'context_records_are_units': False}, 'unknown_partition': {'phase_status': 'unknown', 'implementation_status': 'unknown', 'degradation_status': 'unknown', 'failure_status': 'unknown', 'consumer_status': 'unknown', 'authority_status': 'none', 'formal_unit_status': 'not_generated', 'all_candidate_units_unknown_count': 11, 'all_context_records_unknown_count': 2}, 'four_product_boundary': {'products': ['HELIX-HARNESS', 'HELIX-OS', 'HELIX-Web', 'HELIX-Web-OS'], 'candidate_products': ['HELIX-Web', 'HELIX-Web-OS'], 'source_product_status': 'candidate_only', 'authority_effect': 'none'}, 'overlap_control': {'existing_binding_ids': ['SCF-B-0057', 'SCF-B-0062', 'SCF-B-0080', 'SCF-B-0081', 'SCF-B-0084', 'SCF-B-0088', 'SCF-B-0091', 'SCF-B-0096', 'SCF-B-0099'], 'target_path_ids': ['OUTSIDE67-PATH-007', 'OUTSIDE67-PATH-009', 'OUTSIDE67-PATH-010', 'OUTSIDE67-PATH-012'], 'existing_target_path_ids': ['OUTSIDE67-PATH-006', 'OUTSIDE67-PATH-007', 'OUTSIDE67-PATH-008', 'OUTSIDE67-PATH-009', 'OUTSIDE67-PATH-010', 'OUTSIDE67-PATH-011', 'OUTSIDE67-PATH-012', 'OUTSIDE67-PATH-013', 'OUTSIDE67-PATH-014', 'OUTSIDE67-PATH-015', 'OUTSIDE67-PATH-059', 'OUTSIDE67-PATH-063', 'OUTSIDE67-PATH-064', 'OUTSIDE67-PATH-065', 'OUTSIDE67-PATH-066'], 'overlap_path_ids': ['OUTSIDE67-PATH-007', 'OUTSIDE67-PATH-009', 'OUTSIDE67-PATH-010', 'OUTSIDE67-PATH-012'], 'overlap_result': 'all 4 target paths overlap prior research selected by SCF-B-0096／0099; retained as prior research', 'duplicate_candidate_ids': [], 'formal_unit_ids': []}, 'input_digest_pins': {'product_boundary': '097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038', 'web_l1': '26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756', 'webos_l1': '600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c', 'l1_approval_decision': 'b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2', 'new_generation_entry': '6bccf1003ad3200a56740322db2589340f675a73a5b64d4444de793aed35f995'}, 'negative_case_count': 16, 'negative_case_codes': ['E_SOURCE_DIGEST', 'E_SOURCE_SNAPSHOT', 'E_SOURCE_SCHEMA', 'E_UNIT_SET', 'E_CANDIDATE_RECORD', 'E_CONTEXT_BOUNDARY', 'E_PHASE_BOUNDARY', 'E_IMPLEMENTATION_BOUNDARY', 'E_FORMAL_UNIT', 'E_AUTHORITY_BOUNDARY', 'E_OVERLAP', 'E_INVENTORY_DECLARATION', 'E_INPUT_DIGEST', 'E_BASE_COMMIT']}
EXPECTED_DIFF = {'OUTSIDE67-PATH-007': {'source_path': 'docs/design/helix-web-os/L1-planning/system-intent.md', 'diff_status': 'A', 'pre_sha256': '9f19c758791a2b8298c5fc848ffdbf434069f3501e0382b5c2677e8843e8643f', 'archive_sha256': '9f19c758791a2b8298c5fc848ffdbf434069f3501e0382b5c2677e8843e8643f', 'pre_bytes': 3032, 'archive_bytes': 3032, 'meaning_change_applied': False}, 'OUTSIDE67-PATH-009': {'source_path': 'docs/design/helix-web-os/README.md', 'diff_status': 'A', 'pre_sha256': '1c12792b9626ba0355cb6542d047d2daeb900a837e7eea8f748ebd647b2bb8ed', 'archive_sha256': '1c12792b9626ba0355cb6542d047d2daeb900a837e7eea8f748ebd647b2bb8ed', 'pre_bytes': 995, 'archive_bytes': 995, 'meaning_change_applied': False}, 'OUTSIDE67-PATH-010': {'source_path': 'docs/design/helix-web/L1-planning/product-intent.md', 'diff_status': 'A', 'pre_sha256': '5bbf0bbd1919a0668030d29662f45a510d8129e80cbdcc014511826b1ffd004e', 'archive_sha256': '5bbf0bbd1919a0668030d29662f45a510d8129e80cbdcc014511826b1ffd004e', 'pre_bytes': 3531, 'archive_bytes': 3531, 'meaning_change_applied': False}, 'OUTSIDE67-PATH-012': {'source_path': 'docs/design/helix-web/README.md', 'diff_status': 'A', 'pre_sha256': 'd6726dabd373d0d5794f42dcb73c296d546d92f0c30955ebc657b3c2634e3c96', 'archive_sha256': 'ed7cc9bec604ad2a63324759b19b4ed5ab4be321b79c83ea9bb2cd69003ceb8a', 'pre_bytes': 2410, 'archive_bytes': 2460, 'meaning_change_applied': False}}


class VError(Exception):
    def __init__(self, code, message): self.code, self.message = code, message

def fail(code, message): raise VError(code, message)
def digest_bytes(b): return hashlib.sha256(b).hexdigest()
def digest_file(path):
    try: return digest_bytes(path.read_bytes())
    except FileNotFoundError: fail("E_INPUT_DIGEST", f"missing input: {path}")
def git_bytes(repo, commit, path):
    try: return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=repo)
    except subprocess.CalledProcessError: fail("E_SOURCE_SNAPSHOT", f"git object missing: {commit}:{path}")
def json_load(path, code):
    try: return json.loads(path.read_text())
    except Exception as e: fail(code, f"invalid JSON {path}: {e}")
def jsonl_load(path, code):
    try: return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]
    except Exception as e: fail(code, f"invalid JSONL {path}: {e}")
def exact(got, expected, code, label):
    if got != expected: fail(code, f"{label} mismatch")
def check_keyset(got, expected, code, label):
    if set(got) != set(expected): fail(code, f"{label} keys mismatch: {set(got)^set(expected)}")

def source_expected():
    common = {
      "source_unit":"path_revision_pair", "artifact_kind":"markdown", "archive_root_present":False,
      "diff_status":"A", "legacy_catalog_record_count":0, "existing_holding_inclusion_relation":"not_in_any_of_13_live_holdings",
      "semantic_disposition":"not_started", "source_holding_status":"proposed_preserved_unassigned", "authority_effect":"none",
      "meaning_change_applied":False, "successor_requirement_ids":[], "old_runtime_test_ci_execution":False, "human_decision_ref":None,
    }
    rows={
      "OUTSIDE67-PATH-007":("docs/design/helix-web-os/L1-planning/system-intent.md","HELIX-Web-OS","L1-planning","9b261bb1adbdd655c4149e80c9c420def6fc3f40",3032,"9f19c758791a2b8298c5fc848ffdbf434069f3501e0382b5c2677e8843e8643f","same"),
      "OUTSIDE67-PATH-009":("docs/design/helix-web-os/README.md","HELIX-Web-OS","shared-design","bea226ad2412562c418635b7509af253daefd639",995,"1c12792b9626ba0355cb6542d047d2daeb900a837e7eea8f748ebd647b2bb8ed","same"),
      "OUTSIDE67-PATH-010":("docs/design/helix-web/L1-planning/product-intent.md","HELIX-Web","L1-planning","8266c20ee4eaac9e66762ec550076214e4f35f02",3531,"5bbf0bbd1919a0668030d29662f45a510d8129e80cbdcc014511826b1ffd004e","same"),
      "OUTSIDE67-PATH-012":("docs/design/helix-web/README.md","HELIX-Web","shared-design","55f3fd62f6929235ef8b5a0284b9230edd2f7e32",2410,"d6726dabd373d0d5794f42dcb73c296d546d92f0c30955ebc657b3c2634e3c96","different"),
    }
    out={}
    for sid,(path,product,phase,blob,prebytes,presha,relation) in rows.items():
      if sid=="OUTSIDE67-PATH-012": ablob,abytes,asha="af9502ee041fcd25d887951b17942a125fad3f77",2460,"ed7cc9bec604ad2a63324759b19b4ed5ab4be321b79c83ea9bb2cd69003ceb8a"
      else: ablob,abytes,asha=blob,prebytes,presha
      scope={"classification_state":"path_based_candidate_only","implementation_status":"unknown_not_evidenced_by_path_or_blob_catalog","phase_scope":phase,"phase_status":"unknown_path_based_candidate_only","product_scope":product,"product_status":"unknown_path_based_candidate_only"}
      pre={"blob_oid":blob,"bytes":prebytes,"commit":PRE,"reported_blob_oid":blob,"reported_blob_oid_matches_git":True,"sha256":presha,"snapshot_path":f"source-snapshots/{sid}/pre-isolation.md"}
      arc={"blob_oid":ablob,"bytes":abytes,"commit":ARCHIVE,"relation_to_pre_isolation":relation,"reported_blob_oid":ablob,"reported_blob_oid_matches_git":True,"sha256":asha,"snapshot_path":f"source-snapshots/{sid}/archive.md"}
      out[sid]={**common,"source_item_id":sid,"source_path":path,"pre_isolation":pre,"archive":arc,"current_capture":{"blob_oid":None,"commit":CAPTURE,"state":"absent"},"reported_path_scope":scope,"holding_evidence":{"path":HOLDING,"record_id":sid,"sha256":HOLDING_SHA},"prior_research_binding_ids":PRIOR_RESEARCH_BINDINGS[sid],"snapshot_checks":{"pre_sha256_recomputed":presha,"archive_sha256_recomputed":asha,"pre_bytes_recomputed":prebytes,"archive_bytes_recomputed":abytes}}
    return out

def expected_units():
    rows=[
      ("OUTSIDE67-PATH-010","HELIX-Web","docs/helix-web/L1-planning/product-intent.md","26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIXWEB-L1-001",30,"| HELIXWEB-L1-001 | 利用者は、許可した環境・project・能力へ接続し、対象と作用範囲を確認できる | HELIXWEB-L2-001／002／004 |","HELIXWEB-L2-001／002／004"),
      ("OUTSIDE67-PATH-010","HELIX-Web","docs/helix-web/L1-planning/product-intent.md","26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIXWEB-L1-002",31,"| HELIXWEB-L1-002 | 利用者は、ダッシュボードで長時間作業の進行、結果、切断、取消、再開、結果不明を区別できる | HELIXWEB-L2-003 |","HELIXWEB-L2-003"),
      ("OUTSIDE67-PATH-010","HELIX-Web","docs/helix-web/L1-planning/product-intent.md","26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIXWEB-L1-003",32,"| HELIXWEB-L1-003 | 利用者は、自分が許可する変更と受け入れる成果を判断し、残る専門判断を確認できる | HELIXWEB-L2-005 |","HELIXWEB-L2-005"),
      ("OUTSIDE67-PATH-010","HELIX-Web","docs/helix-web/L1-planning/product-intent.md","26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIXWEB-L1-004",33,"| HELIXWEB-L1-004 | 利用者は、採用するHARNESS・Connector・model等の構成版と依存を確認できる | HELIXWEB-L2-006／007 |","HELIXWEB-L2-006／007"),
      ("OUTSIDE67-PATH-010","HELIX-Web","docs/helix-web/L1-planning/product-intent.md","26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIXWEB-L1-005",34,"| HELIXWEB-L1-005 | 利用者は、利用結果をHELIX改善へ渡す目的・範囲・同意を管理できる | HELIXWEB-L2-008 |","HELIXWEB-L2-008"),
      ("OUTSIDE67-PATH-010","HELIX-Web","docs/helix-web/L1-planning/product-intent.md","26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","HELIXWEB-L1-006",35,"| HELIXWEB-L1-006 | 展開判断者は、HELIX-HARNESS製品群Version 1の完成を確認してからHELIX-Webを展開できる | HELIXWEB-L2-009 |","HELIXWEB-L2-009"),
      ("OUTSIDE67-PATH-007","HELIX-Web-OS","docs/helix-web-os/L1-planning/system-intent.md","600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c","HELIXWEBOS-L1-001",19,"| HELIXWEBOS-L1-001 | サービス運用者は、tenant・利用者・projectごとのauthorityと隔離を保ってHELIX-Webを提供できる | HELIXWEBOS-L2-001 |","HELIXWEBOS-L2-001"),
      ("OUTSIDE67-PATH-007","HELIX-Web-OS","docs/helix-web-os/L1-planning/system-intent.md","600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c","HELIXWEBOS-L1-002",20,"| HELIXWEBOS-L1-002 | サービス運用者は、Connectorと長時間jobを安全に配信・追跡・停止・再開・回復できる | HELIXWEBOS-L2-002／003 |","HELIXWEBOS-L2-002／003"),
      ("OUTSIDE67-PATH-007","HELIX-Web-OS","docs/helix-web-os/L1-planning/system-intent.md","600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c","HELIXWEBOS-L1-003",21,"| HELIXWEBOS-L1-003 | 利用者は、認証・provider接続・data返送の対象と許可範囲を管理できる | HELIXWEBOS-L2-004 |","HELIXWEBOS-L2-004"),
      ("OUTSIDE67-PATH-007","HELIX-Web-OS","docs/helix-web-os/L1-planning/system-intent.md","600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c","HELIXWEBOS-L1-004",22,"| HELIXWEBOS-L1-004 | HELIX-Webは、利用者へ進行・状態・成果・証拠を正しいrevisionで表示できる | HELIXWEBOS-L2-005 |","HELIXWEBOS-L2-005"),
      ("OUTSIDE67-PATH-007","HELIX-Web-OS","docs/helix-web-os/L1-planning/system-intent.md","600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c","HELIXWEBOS-L1-005",23,"| HELIXWEBOS-L1-005 | サービス運用者は、Webサービスを配備・監視・更新・復旧し、許可された運用ログをHELIX-OSの改善候補へ接続できる | HELIXWEBOS-L2-006 |","HELIXWEBOS-L2-006"),
    ]
    out=[]
    for sid,product,path,digest,rid,line,text,l2 in rows:
      out.append({"candidate_id":f"{sid}-{rid}","candidate_kind":"row_sized_anchor_candidate","source_item_id":sid,"candidate_product":product,"product_scope_status":"candidate_only","current_l1_source_path":path,"current_l1_source_sha256":digest,"current_l1_line":line,"current_l1_anchor":f"L{line}","current_l1_id":rid,"current_l1_text":text,"l2_connection_text":l2,"current_l1_raw_status":"draft","current_l1_raw_authority_status":"awaiting_parent_approval","current_l1_effective_authority_status":"approved","current_l1_effective_decision_id":L1_APPROVAL_DECISION_IDS[product],"old_source_role":"path_level_context_only; no old row is promoted","phase_candidate":None,"phase_status":"unknown","implementation_status":"unknown","degradation_status":"unknown","failure_status":"unknown","consumer_status":"unknown","formal_unit_status":"not_generated","authority_status":"none","successor_requirement_ids":[],"meaning_change_applied":False,"evidence_basis":[f"{sid}:pre_isolation_sha256",f"{sid}:archive_sha256",f"{product}:current_l1:{rid}:{path}:{line}",f"{product}:effective_decision:{L1_APPROVAL_DECISION_IDS[product]}:{L1_APPROVAL_DECISION_PATH}:{L1_APPROVAL_DECISION_SHA}"],"judgment_waiting":["旧pathからformal requirementへ接続するrow／phase／implementation evidenceの追加"]})
    return out

def expected_context():
    out=[]
    for sid,product in [("OUTSIDE67-PATH-009","HELIX-Web-OS"),("OUTSIDE67-PATH-012","HELIX-Web")]:
      out.append({"candidate_id":f"{sid}-README-CONTEXT","candidate_kind":"readme_context_only","source_item_id":sid,"candidate_product":product,"product_scope_status":"candidate_only","context_role":"document_context_only","old_source_role":"README context; no requirement row extracted","phase_candidate":None,"phase_status":"unknown","implementation_status":"unknown","degradation_status":"unknown","failure_status":"unknown","consumer_status":"unknown","formal_unit_status":"not_generated","authority_status":"none","successor_requirement_ids":[],"meaning_change_applied":False,"evidence_basis":[f"{sid}:pre_isolation_sha256",f"{sid}:archive_sha256"],"judgment_waiting":["READMEの位置づけから要求row／formal unitへ進む人間判断","phase／実装・failure・consumer evidenceの追加"]})
    return out

def validate(bundle, repo):
    inv=json_load(bundle/"inventory.json","E_INVENTORY_DECLARATION")
    if inv.get("scope",{}).get("base_origin_main") != BASE or inv.get("scope",{}).get("required_ancestor") != BASE: fail("E_BASE_COMMIT","inventory BASE declaration changed")
    if not subprocess.run(["git","merge-base","--is-ancestor",BASE,"HEAD"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0: fail("E_BASE_COMMIT","HEAD is not descendant of fixed BASE")
    for path,expected in [(HOLDING,HOLDING_SHA),(REGISTER,REGISTER_SHA),("docs/concept/product-boundary.md",PRODUCT_BOUNDARY_SHA),("docs/governance/new-generation-start-here.md",ENTRY_SHA),(L1_APPROVAL_DECISION_PATH,L1_APPROVAL_DECISION_SHA)]+[(p,d) for p,d in L1.values()]:
      if digest_file(repo/path) != expected: fail("E_INPUT_DIGEST",f"input digest changed: {path}")
    for bid in EXISTING_BINDING_IDS:
      p=repo/f"scaffold/bindings/{bid}.json"
      b=json_load(p,"E_INPUT_DIGEST")
      if b.get("id") != bid: fail("E_OVERLAP",f"binding identity mismatch: {bid}")
      if bid in EXISTING_BINDING_TARGET_PATHS:
        selected = sorted({match for artifact in b.get("artifacts",[]) for match in re.findall(r"OUTSIDE67-PATH-\d+", artifact)})
        if selected != EXISTING_BINDING_TARGET_PATHS[bid]: fail("E_OVERLAP",f"selected path set mismatch: {bid}")
    if digest_file(repo/HOLDING) != HOLDING_SHA: fail("E_INPUT_DIGEST","holding digest changed")
    holding_ids=[]
    for line in (repo/HOLDING).read_text().splitlines():
      try: r=json.loads(line)
      except Exception: fail("E_SOURCE_SCHEMA","holding JSON invalid")
      if r.get("source_item_id") in TARGET_IDS: holding_ids.append(r["source_item_id"])
    if holding_ids != TARGET_IDS: fail("E_SOURCE_SCHEMA","target holding set/order mismatch")
    source_rows=jsonl_load(bundle/"source-items.jsonl","E_SOURCE_SCHEMA")
    if [r.get("source_item_id") for r in source_rows] != TARGET_IDS: fail("E_SOURCE_SCHEMA","source item set/order mismatch")
    expected_sources=source_expected()
    for got in source_rows:
      sid=got.get("source_item_id")
      if sid not in expected_sources: fail("E_SOURCE_SCHEMA",f"unknown source id {sid}")
      if "prior_research_binding_ids" not in got: fail("E_OVERLAP",f"missing prior research binding IDs: {sid}")
      for rev,label in [(got["pre_isolation"],"pre-isolation"),(got["archive"],"archive")]:
        actual_obj=git_bytes(repo,rev["commit"],got["source_path"])
        actual_sha=digest_bytes(actual_obj)
        actual_oid=subprocess.check_output(["git","rev-parse",f"{rev['commit']}:{got['source_path']}"],cwd=repo,text=True).strip()
        if actual_sha != rev.get("sha256") or actual_oid != rev.get("blob_oid"): fail("E_SOURCE_DIGEST",f"{sid} {label} declared digest/blob differs from Git")
      exact(got,expected_sources[sid],"E_SOURCE_SCHEMA",f"source record {sid}")
      for rev,label in [(got["pre_isolation"],"pre-isolation"),(got["archive"],"archive")]:
        snap=bundle/rev["snapshot_path"]
        data=snap.read_bytes() if snap.is_file() else fail("E_SOURCE_SNAPSHOT",f"missing snapshot {snap}")
        if digest_bytes(data) != rev["sha256"] or len(data)!=rev["bytes"]: fail("E_SOURCE_SNAPSHOT",f"{sid} {label} snapshot mismatch")
        if digest_bytes(data) != got["snapshot_checks"][("pre" if label == "pre-isolation" else "archive")+"_sha256_recomputed"]: fail("E_SOURCE_SNAPSHOT",f"{sid} snapshot check mismatch")
        obj=git_bytes(repo,rev["commit"],got["source_path"])
        actual_sha=digest_bytes(obj)
        actual_oid=subprocess.check_output(["git","rev-parse",f"{rev['commit']}:{got['source_path']}"],cwd=repo,text=True).strip()
        if actual_sha != rev["sha256"] or actual_oid != rev["blob_oid"]: fail("E_SOURCE_DIGEST",f"{sid} {label} Git object digest/blob mismatch")
    diff=json_load(bundle/"source-diffs.json","E_SOURCE_SCHEMA")
    exact(diff,EXPECTED_DIFF,"E_SOURCE_SCHEMA","source-diffs")
    candidates=jsonl_load(bundle/"candidate-units.jsonl","E_CANDIDATE_RECORD")
    expected_units_v=expected_units(); expected_ids=[x["candidate_id"] for x in expected_units_v]
    ids=[x.get("candidate_id") for x in candidates]
    if len(ids)!=len(set(ids)) or set(ids)!=set(expected_ids): fail("E_UNIT_SET","candidate ID set mismatch")
    for got,want in zip(sorted(candidates,key=lambda x:x.get("candidate_id","")),sorted(expected_units_v,key=lambda x:x["candidate_id"])):
      for field,code in [("phase_status","E_PHASE_BOUNDARY"),("implementation_status","E_IMPLEMENTATION_BOUNDARY"),("formal_unit_status","E_FORMAL_UNIT"),("authority_status","E_AUTHORITY_BOUNDARY")]:
        if got.get(field)!=want[field]: fail(code,f"candidate {got.get('candidate_id')} {field} promoted")
      l1_path=repo/want["current_l1_source_path"]
      l1_lines=l1_path.read_text().splitlines()
      if len(l1_lines) < want["current_l1_line"] or l1_lines[want["current_l1_line"]-1] != want["current_l1_text"]: fail("E_CANDIDATE_RECORD",f"current L1 line mismatch: {want['candidate_id']}")
      if want["current_l1_id"] not in want["current_l1_text"]: fail("E_CANDIDATE_RECORD",f"current L1 ID anchor mismatch: {want['candidate_id']}")
      exact(got,want,"E_CANDIDATE_RECORD",f"candidate {want['candidate_id']}")
    contexts=jsonl_load(bundle/"context-records.jsonl","E_CONTEXT_BOUNDARY")
    want_context=expected_context()
    if [x.get("candidate_id") for x in contexts] != [x["candidate_id"] for x in want_context]: fail("E_CONTEXT_BOUNDARY","README context set changed")
    for got,want in zip(contexts,want_context):
      for field in ("formal_unit_status","authority_status"):
        if got.get(field)!=want[field]: fail("E_CONTEXT_BOUNDARY",f"context {field} changed")
      exact(got,want,"E_CONTEXT_BOUNDARY",f"context {want['candidate_id']}")
    overlap=inv.get("overlap_control",{})
    if overlap.get("existing_binding_ids") != EXISTING_BINDING_IDS or overlap.get("target_path_ids") != TARGET_IDS or overlap.get("existing_target_path_ids") != EXISTING_TARGET_PATH_IDS or overlap.get("overlap_path_ids") != TARGET_IDS or overlap.get("overlap_result") != OVERLAP_RESULT: fail("E_OVERLAP","overlap declaration changed")
    pins=inv.get("input_digest_pins",{})
    if pins != {"product_boundary":PRODUCT_BOUNDARY_SHA,"web_l1":L1["HELIX-Web"][1],"webos_l1":L1["HELIX-Web-OS"][1],"l1_approval_decision":L1_APPROVAL_DECISION_SHA,"new_generation_entry":ENTRY_SHA}: fail("E_INPUT_DIGEST","inventory input digest pins changed")
    if inv.get("candidate_summary",{}).get("formal_requirement_unit_count") != 0: fail("E_FORMAL_UNIT","formal unit count promoted")
    if inv.get("authority_effect") != "none" or inv.get("unknown_partition",{}).get("authority_status") != "none": fail("E_AUTHORITY_BOUNDARY","authority boundary changed")
    if inv.get("negative_case_codes") != NEGATIVE_CODES: fail("E_INVENTORY_DECLARATION","negative_case_codes mismatch")
    if inv.get("negative_case_count") != 16: fail("E_INVENTORY_DECLARATION","negative_case_count mismatch")
    if inv.get("candidate_summary",{}).get("candidate_unit_count") != 11 or inv.get("candidate_summary",{}).get("web_l1_candidate_unit_count") != 6 or inv.get("candidate_summary",{}).get("webos_l1_candidate_unit_count") != 5 or inv.get("candidate_summary",{}).get("readme_context_record_count") != 2: fail("E_INVENTORY_DECLARATION","candidate counts mismatch")
    exact(inv,EXPECTED_INVENTORY,"E_INVENTORY_DECLARATION","inventory")
    print("SCF-B-0121 validate: PASS (4 source snapshots, 11 L1 anchor candidates, 2 README contexts; static-only)")

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--root",default=None); ap.add_argument("--repo-root",default=None); a=ap.parse_args()
    bundle=Path(a.root).resolve() if a.root else Path(__file__).resolve().parent
    repo=Path(a.repo_root).resolve() if a.repo_root else bundle.parents[1]
    try: validate(bundle,repo)
    except VError as e: print(f"{e.code}: {e.message}"); return 1
    return 0
if __name__ == "__main__": sys.exit(main())
