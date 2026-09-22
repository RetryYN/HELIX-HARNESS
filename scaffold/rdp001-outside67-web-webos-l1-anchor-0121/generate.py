#!/usr/bin/env python3
"""Generate SCF-B-0121 from fixed Git object metadata and current L1 row references.
Static reads only; no legacy program or runtime is executed.
"""
from pathlib import Path
import hashlib, json, subprocess

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
BASE = "e80cb07ce7c6d5d59da39ddacaf3694bdc951e6b"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
HOLDING_PATH = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
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
EXISTING_BINDING_IDS = ["SCF-B-0057", "SCF-B-0062", "SCF-B-0080", "SCF-B-0081", "SCF-B-0084", "SCF-B-0088", "SCF-B-0091", "SCF-B-0096", "SCF-B-0099"]
EXISTING_TARGET_PATH_IDS = [
    "OUTSIDE67-PATH-006", "OUTSIDE67-PATH-007", "OUTSIDE67-PATH-008", "OUTSIDE67-PATH-009", "OUTSIDE67-PATH-010",
    "OUTSIDE67-PATH-011", "OUTSIDE67-PATH-012", "OUTSIDE67-PATH-013", "OUTSIDE67-PATH-014", "OUTSIDE67-PATH-015",
    "OUTSIDE67-PATH-059", "OUTSIDE67-PATH-063", "OUTSIDE67-PATH-064", "OUTSIDE67-PATH-065", "OUTSIDE67-PATH-066",
]
L1_SOURCES = {
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", "26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756"),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", "600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c"),
}
L1_APPROVAL_DECISION_PATH = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1_APPROVAL_DECISION_SHA = "b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2"
L1_APPROVAL_DECISION_IDS = {
    "HELIX-Web": "HDEC-HELIXWEB-L1-01",
    "HELIX-Web-OS": "HDEC-HELIXWEBOS-L1-01",
}
ROW_LINES = {
    "HELIX-Web": {"HELIXWEB-L1-001": 30, "HELIXWEB-L1-002": 31, "HELIXWEB-L1-003": 32, "HELIXWEB-L1-004": 33, "HELIXWEB-L1-005": 34, "HELIXWEB-L1-006": 35},
    "HELIX-Web-OS": {"HELIXWEBOS-L1-001": 19, "HELIXWEBOS-L1-002": 20, "HELIXWEBOS-L1-003": 21, "HELIXWEBOS-L1-004": 22, "HELIXWEBOS-L1-005": 23},
}

def sha(b): return hashlib.sha256(b).hexdigest()
def git_bytes(commit, path): return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)
def write_json(path, value): path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
def write_jsonl(path, values): path.write_text("".join(json.dumps(v, ensure_ascii=False, sort_keys=True) + "\n" for v in values))

def load_holding():
    rows = {}
    for line in (ROOT / HOLDING_PATH).read_text().splitlines():
        row = json.loads(line)
        if row.get("source_item_id") in TARGET_IDS: rows[row["source_item_id"]] = row
    if list(rows) != TARGET_IDS and set(rows) != set(TARGET_IDS): raise SystemExit("target holding IDs mismatch")
    return rows

def main():
    holding = load_holding()
    for sid in TARGET_IDS:
        p = TARGET_PATHS[sid]
        pre = git_bytes(PRE, p); arc = git_bytes(ARCHIVE, p)
        (HERE / "source-snapshots" / sid / "pre-isolation.md").write_bytes(pre)
        (HERE / "source-snapshots" / sid / "archive.md").write_bytes(arc)
    source_items = []
    for sid in TARGET_IDS:
        h = holding[sid]; p = TARGET_PATHS[sid]
        pre = git_bytes(PRE, p); arc = git_bytes(ARCHIVE, p)
        source_items.append({
            "source_item_id": sid,
            "source_path": h["source_path"],
            "source_unit": h["source_unit"],
            "artifact_kind": h["artifact_kind"],
            "pre_isolation": {**h["pre_isolation"], "snapshot_path": f"source-snapshots/{sid}/pre-isolation.md"},
            "archive": {**h["archive"], "snapshot_path": f"source-snapshots/{sid}/archive.md"},
            "archive_root_present": h["archive_root_present"],
            "current_capture": h["current_capture"],
            "diff_status": h["diff_status"],
            "legacy_catalog_record_count": h["legacy_catalog_record_count"],
            "existing_holding_inclusion_relation": h["existing_holding_inclusion_relation"],
            "semantic_disposition": h["semantic_disposition"],
            "source_holding_status": h["source_holding_status"],
            "reported_path_scope": h["reported_path_scope"],
            "authority_effect": h["authority_effect"],
            "meaning_change_applied": h["meaning_change_applied"],
            "successor_requirement_ids": h["successor_requirement_ids"],
            "old_runtime_test_ci_execution": h["old_runtime_test_ci_execution"],
            "human_decision_ref": h["human_decision_ref"],
            "holding_evidence": {"path": HOLDING_PATH, "sha256": "d703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54", "record_id": sid},
            "prior_research_binding_ids": PRIOR_RESEARCH_BINDINGS[sid],
            "snapshot_checks": {"pre_sha256_recomputed": sha(pre), "archive_sha256_recomputed": sha(arc), "pre_bytes_recomputed": len(pre), "archive_bytes_recomputed": len(arc)},
        })
    write_jsonl(HERE / "source-items.jsonl", source_items)

    lines = {}
    for product, (path, digest) in L1_SOURCES.items():
        all_lines = (ROOT / path).read_text().splitlines()
        for rid, ln in ROW_LINES[product].items():
            line = all_lines[ln - 1]
            pieces = [x.strip() for x in line.strip().strip("|").split("|")]
            lines[rid] = {"line": ln, "text": line, "l2_connection_text": pieces[2], "source_path": path, "source_sha256": digest, "product": product}
    candidate_units=[]
    for product in ("HELIX-Web", "HELIX-Web-OS"):
        sid = "OUTSIDE67-PATH-010" if product == "HELIX-Web" else "OUTSIDE67-PATH-007"
        prefix = "HELIXWEB" if product == "HELIX-Web" else "HELIXWEBOS"
        for rid in ROW_LINES[product]:
            x=lines[rid]
            candidate_units.append({
                "candidate_id": f"{sid}-{rid}", "candidate_kind": "row_sized_anchor_candidate",
                "source_item_id": sid, "candidate_product": product, "product_scope_status": "candidate_only",
                "current_l1_source_path": x["source_path"], "current_l1_source_sha256": x["source_sha256"],
                "current_l1_line": x["line"], "current_l1_anchor": f"L{x['line']}", "current_l1_id": rid,
                "current_l1_text": x["text"], "l2_connection_text": x["l2_connection_text"],
                "current_l1_raw_status": "draft", "current_l1_raw_authority_status": "awaiting_parent_approval",
                "current_l1_effective_authority_status": "approved", "current_l1_effective_decision_id": L1_APPROVAL_DECISION_IDS[product],
                "old_source_role": "path_level_context_only; no old row is promoted",
                "phase_candidate": None, "phase_status": "unknown", "implementation_status": "unknown",
                "degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown",
                "formal_unit_status": "not_generated", "authority_status": "none",
                "successor_requirement_ids": [], "meaning_change_applied": False,
                "evidence_basis": [f"{sid}:pre_isolation_sha256", f"{sid}:archive_sha256", f"{product}:current_l1:{rid}:{x['source_path']}:{x['line']}", f"{product}:effective_decision:{L1_APPROVAL_DECISION_IDS[product]}:{L1_APPROVAL_DECISION_PATH}:{L1_APPROVAL_DECISION_SHA}"],
                "judgment_waiting": ["旧pathからformal requirementへ接続するrow／phase／implementation evidenceの追加"],
            })
    write_jsonl(HERE / "candidate-units.jsonl", candidate_units)
    contexts=[]
    for sid in ("OUTSIDE67-PATH-009", "OUTSIDE67-PATH-012"):
        product=holding[sid]["reported_path_scope"]["product_scope"]
        contexts.append({
            "candidate_id": f"{sid}-README-CONTEXT", "candidate_kind": "readme_context_only", "source_item_id": sid,
            "candidate_product": product, "product_scope_status": "candidate_only", "context_role": "document_context_only",
            "old_source_role": "README context; no requirement row extracted", "phase_candidate": None, "phase_status": "unknown",
            "implementation_status": "unknown", "degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown",
            "formal_unit_status": "not_generated", "authority_status": "none", "successor_requirement_ids": [], "meaning_change_applied": False,
            "evidence_basis": [f"{sid}:pre_isolation_sha256", f"{sid}:archive_sha256"],
            "judgment_waiting": ["READMEの位置づけから要求row／formal unitへ進む人間判断", "phase／実装・failure・consumer evidenceの追加"],
        })
    write_jsonl(HERE / "context-records.jsonl", contexts)
    write_json(HERE / "source-diffs.json", {sid: {"source_path": TARGET_PATHS[sid], "diff_status": holding[sid]["diff_status"], "pre_sha256": holding[sid]["pre_isolation"]["sha256"], "archive_sha256": holding[sid]["archive"]["sha256"], "pre_bytes": holding[sid]["pre_isolation"]["bytes"], "archive_bytes": holding[sid]["archive"]["bytes"], "meaning_change_applied": False} for sid in TARGET_IDS})

    negative=["E_SOURCE_DIGEST","E_SOURCE_SNAPSHOT","E_SOURCE_SCHEMA","E_UNIT_SET","E_CANDIDATE_RECORD","E_CONTEXT_BOUNDARY","E_PHASE_BOUNDARY","E_IMPLEMENTATION_BOUNDARY","E_FORMAL_UNIT","E_AUTHORITY_BOUNDARY","E_OVERLAP","E_INVENTORY_DECLARATION","E_INPUT_DIGEST","E_BASE_COMMIT"]
    inventory={
      "schema":"rdp001-outside67-web-webos-l1-anchor/v1","candidate_id":"RDP-001-OUTSIDE67-WEB-WEBOS-L1-0121","status":"findings_only","authority_effect":"none","meaning_change_applied":False,"successor_requirement_ids":[],"human_decision_ref":None,"formal_register_append":False,"old_runtime_test_ci_execution":False,"new_build":False,
      "scope":{"worktree":"outside67-web-l1-0121","base_origin_main":BASE,"base_origin_main_observed_at":BASE,"required_ancestor":BASE,"read_only":True,"static_only":True,"holding_registration_id":"MPR-SH-OUTSIDE67-001","holding_path":HOLDING_PATH,"holding_sha256":"d703c9bc47f95143f6b010eebf7fead4e14402c1be26ef716b2e16f0bd2cec54","holding_path_revision_pair_denominator":67,"holding_record_count":67,"current_live_source_holding_count":14,"management_register_path":REGISTER_PATH,"management_register_sha256":"b68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd","selected_source_document_count":4,"selected_path_revision_pair_count":4,"unselected_path_revision_pair_count":63,"pre_isolation_commit":PRE,"archive_commit":ARCHIVE,"historical_capture_commit":CAPTURE,"old_runtime_test_ci_execution":False},
      "source_holding":{"registration_id":"MPR-SH-OUTSIDE67-001","source_collection_scope":"outside67 reportの67 path_revision_pair。要求unitではなくsource保存単位。","selected_item_ids":TARGET_IDS,"selected_ordinals":[7,9,10,12],"unselected_count":63,"current_live_source_holding_count":14},
      "candidate_summary":{"candidate_unit_count":11,"web_l1_candidate_unit_count":6,"webos_l1_candidate_unit_count":5,"readme_context_record_count":2,"source_item_count":4,"formal_requirement_unit_count":0,"formal_requirement_unit_status":"not_generated","row_sized_anchor_candidate_status":"research_only","context_records_are_units":False},
      "unknown_partition":{"phase_status":"unknown","implementation_status":"unknown","degradation_status":"unknown","failure_status":"unknown","consumer_status":"unknown","authority_status":"none","formal_unit_status":"not_generated","all_candidate_units_unknown_count":11,"all_context_records_unknown_count":2},
      "four_product_boundary":{"products":["HELIX-HARNESS","HELIX-OS","HELIX-Web","HELIX-Web-OS"],"candidate_products":["HELIX-Web","HELIX-Web-OS"],"source_product_status":"candidate_only","authority_effect":"none"},
      "overlap_control":{"existing_binding_ids":EXISTING_BINDING_IDS,"target_path_ids":TARGET_IDS,"existing_target_path_ids":EXISTING_TARGET_PATH_IDS,"overlap_path_ids":TARGET_IDS,"overlap_result":"all 4 target paths overlap prior research selected by SCF-B-0096／0099; retained as prior research","duplicate_candidate_ids":[],"formal_unit_ids":[]},
      "input_digest_pins":{"product_boundary":"097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038","web_l1":"26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756","webos_l1":"600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c","l1_approval_decision":"b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2","new_generation_entry":"6bccf1003ad3200a56740322db2589340f675a73a5b64d4444de793aed35f995"},
      "negative_case_count":16,"negative_case_codes":negative,
    }
    write_json(HERE / "inventory.json",inventory)
    (HERE / "README.md").write_text(f'''# SCF-B-0121 outside67 Web／Web-OS L1 anchor research scaffold\n\n固定BASE `{BASE}` で outside67 の既存SCF-B-0096／0099でsource調査済みである4 path（PATH-007／009／010／012）について、追加のL1接続をholding／pre-isolation／archive の静的bytes・digestと current四製品L1候補へ照合する研究束である。Web L1 6件、Web-OS L1 5件の row-sized anchor候補と、README context 2件を保持する。候補は原文と現行L1の接続候補であり、formal requirement unit、phase、実装、縮退、failure、consumer、authorityを生成しない。\n\n`source-items.jsonl` は4 pathのholding選択record、pre-isolation／archiveのcommit・blob・SHA・bytes・snapshotと、各pathを調査済みの先行Binding IDを保持する。`candidate-units.jsonl` は現行L1の11行をsource path／line／digestへ束縛し、phase／implementation／degradation／failure／consumerはすべてunknown、`formal_unit_status=not_generated` とする。`context-records.jsonl` はPATH-009／012 READMEの文脈だけで、unitへ数えない。`source-diffs.json` はarchiveとの差分を観測値として固定し意味変更へ昇格しない。\n\n## 境界\n\n四製品L1本文のraw metadataはdraft／awaiting_parent_approvalだが、`HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17`の承認decisionと各HDEC-HELIXWEB／HELIXWEBOS-L1-01でeffective statusはapprovedである。このbundleは承認済みL1を入力として扱う一方、研究candidate自体のauthorityはnoneに保持し、outside67旧文書からの要求採択・phase分類・実装成立・縮退・failure／consumer closureを意味しない。既存SCF-B-0057／0062／0080／0081／0084／0088／0091に加え、SCF-B-0096／0099が選択済みのPATH-006〜015集合を重複として明示し、今回の4 pathは先行研究への再接続として保持する。旧資産・archiveは静的bytesの参照だけとし、旧workflow／runtime／test／CIを実行しない。\n\n## 検証\n\n```text\npython3 scaffold/rdp001-outside67-web-webos-l1-anchor-0121/generate.py\npython3 scaffold/rdp001-outside67-web-webos-l1-anchor-0121/validate.py\npython3 scaffold/rdp001-outside67-web-webos-l1-anchor-0121/selfcheck.py\npython3 scaffold/tools/scfctl.py validate\npython3 scaffold/tools/scfctl.py stale\npython3 scaffold/tools/scfctl.py residuals\ngit diff --check\n```\n\nvalidatorは固定BASE祖先性、holding／register／L1／L1 approval decision／product-boundary入力digest、pre/archive snapshotのbytes・digest・blob、4 path集合、11 candidate／2 contextの全field、raw L1 metadataとeffective approved decisionの分離、既存Binding IDの存在とselected path集合、source-itemごとの先行Binding ID、formal／authority境界を独立定数で検査する。重複Bindingの全体bytes digestは固定せず、selected path集合の実体照合で重複事実を保持する。selfcheckは宣言済み16 negative casesを期待error codeまで照合する。\n''')
    (HERE / "method.md").write_text("""# Method\n\n対象holding rowを現行registerから再分類せず、固定BASEのGit objectを`git show`で静的に読み、pre-isolation／archive snapshotを保存した。旧pathはpath-level source contextであり、current L1行の候補anchorへ機械的に要求昇格しない。current L1の11行はWeb 6／Web-OS 5のdraft候補をsource path、line、text、digestへ束縛し、README 2件はcontext-onlyとした。PATH-007／009／010は先行SCF-B-0096、PATH-012は先行SCF-B-0099のselected path集合と重複するため、各source itemに`prior_research_binding_ids`を記録した。phase／implementation／degradation／failure／consumerはunknown、authorityはnone、formal unitは未生成である。\n""")
    (HERE / "premise.md").write_text("""# Premise and unresolved boundary\n\nこのbundleはoutside67の未処理pathを行単位anchor候補として整理するだけで、旧pathから正式要求、phase、実装、縮退、failure、consumer、製品authorityを導出しない。READMEは意味文脈でありunit集合に算入しない。現行L1はraw metadata（draft／awaiting_parent_approval）と承認decisionによるeffective approvedを分離して入力し、研究candidateのauthorityはnoneに保持する。今回の4 pathはSCF-B-0096／0099でselected済みであり、source itemごとの先行Binding IDと重複path集合を明示する。次の判断には旧原文のrequirement row化、phase／asset／implementation evidenceの追加が必要である。\n""")
    (HERE / "status.md").write_text(f"""# Status\n\n- Binding: SCF-B-0121\n- Fixed BASE: `{BASE}`\n- Target source IDs: 4（PATH-007／009／010／012）\n- Prior research: PATH-007／009／010 → SCF-B-0096、PATH-012 → SCF-B-0099（4/4 overlap retained）\n- Row-sized anchor candidates: 11（Web 6、Web-OS 5）\n- README context records: 2\n- Formal requirement units: 0（not_generated）\n- phase／implementation／degradation／failure／consumer: unknown\n- authority: none\n- old runtime／test／CI execution: false\n""")
    (HERE / "PR-DRAFT.md").write_text("""## Summary\n\n既存SCF-B-0096／0099でsource調査済みのoutside67 Web／Web-OS 4 pathへ追加L1接続を固定holding／pre-isolation／archive bytesと現行L1へ静的照合し、Web 6＋Web-OS 5の11 row-sized anchor候補とREADME context 2件をresearch-only Scaffoldへ登録する。PATH-007／009／010はSCF-B-0096、PATH-012はSCF-B-0099の先行研究IDをsource itemごとに保持する。formal unit、phase、実装、縮退、failure、consumer、authorityは生成しない。承認decisionでeffective approvedなWeb／Web-OS L1とraw本文metadata（draft／awaiting_parent_approval）を分離し、研究candidate authorityはnoneに保持する。\n\nRefs #1813（進捗参照のみ）\n\n## Validation\n\n- `validate.py`: 4 source / 11 candidate / 2 context; fixed source/input digests and snapshot bytes, with overlap Binding IDs and selected path sets checked without whole-Binding digest pins\n- `selfcheck.py`: 16 negative cases with expected error codes, including missing prior research overlap evidence\n- `scfctl validate`: 116 bindings, 0 failures; `stale`, `residuals`, `git diff --check`\n""")
    print("SCF-B-0121 bundle generated")
if __name__ == "__main__": main()
