#!/usr/bin/env python3
"""DOC-009 source-span and semantic-atom scaffold generator.

This generator only reads the fixed archive blob and current ledgers.  It does
not execute any legacy runtime, test, hook, workflow, CI, or adapter.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ARCHIVE_COMMIT = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
SOURCE_PATH = "docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md"
ARCHIVE_PATH = "archive/legacy-generation-2026-09-14/root/" + SOURCE_PATH
SOURCE_ID = "DELEGATED-DOC-009"


# A span is deliberately kept contiguous.  Blank separator lines are included
# in the surrounding navigation/composite span, so no source line is silently
# dropped.  PR #1964's corrected report uses the 87 physical lines in the
# archive blob (the blob ends in a newline; no synthetic line is added).
SPAN_RANGES = [
    (1, 11), (12, 15), (16, 25), (26, 28),
    *[(line, line) for line in range(29, 40)],
    (40, 44), *[(line, line) for line in range(45, 63)],
    (63, 67), *[(line, line) for line in range(68, 80)],
    (80, 81), (82, 83), (84, 85), (86, 87),
]


def span_id(index: int) -> str:
    return f"DOC009-SPAN-{index:03d}"


def atom_id(index: int) -> str:
    return f"UWJ-SEM-{index:03d}"


def source_blob() -> bytes:
    return subprocess.run(
        ["git", "show", f"{ARCHIVE_COMMIT}:{ARCHIVE_PATH}"],
        cwd=ROOT, check=True, stdout=subprocess.PIPE,
    ).stdout


def atom_meta(index: int) -> dict:
    """Return review metadata for one contiguous source span."""
    navigation = {2, 4, 16, 35, 48}
    if index in navigation:
        return {
            "candidate_kind": "navigation" if index != 4 else "metadata",
            "candidate_target": "unresolved",
            "owner_candidates": ["HELIX-HARNESS", "HELIX-OS"],
            "candidate_granularity": "composite",
            "normalized_statement": "文書構造・見出し・表境界を保持する",
            "original_ids": [],
            "downstream_layers": [],
            "retained_meaning": ["表・節境界と原文順序を保持する", "採否・authorityを生成しない"],
            "questions": ["この構造行をどの対象別要求identityへ接続するか", "表の境界をどの受入pairへ固定するか"],
        }
    if index == 1:
        return {
            "candidate_kind": "metadata",
            "candidate_target": "unresolved",
            "owner_candidates": ["HELIX-HARNESS", "HELIX-OS"],
            "candidate_granularity": "composite",
            "normalized_statement": "DOC-009のL3・confirmed・PO/TL・source authority・pair参照メタデータを保持する",
            "original_ids": [], "downstream_layers": ["L3"],
            "retained_meaning": ["source status=confirmedを旧sourceの宣言として保持する", "pair_artifact参照を未解決edgeとして保持する"],
            "questions": ["source statusを現行authorityへ移す人間decisionは未登録", "pair acceptanceのconsumer closureは未確認"],
        }
    if index == 3:
        return {
            "candidate_kind": "premise",
            "candidate_target": "HELIX-HARNESS",
            "owner_candidates": ["HELIX-HARNESS", "HELIX-OS"],
            "candidate_granularity": "connection",
            "normalized_statement": "versioned source packageの14ファイル、digest、authority、schema、gate、Node transaction境界を入力正本候補として束ねる",
            "original_ids": [], "downstream_layers": ["L3", "L5", "L9"],
            "retained_meaning": ["source family・manifest・SHA-256・14 file inventoryを保持する", "意味sourceと実行authorityの記述を分離せず保持する", "Node transaction boundaryを保持する"],
            "questions": ["14 source pathの現行successorとconsumerは未確定", "source packageを現行authorityへ昇格してよいか未決"],
        }
    if 5 <= index <= 15:
        rows = {
            5: ("workflowのstate×trigger×condition→action→next_stateを意味コア候補として採用する", "HELIX-HARNESS", ["L3", "L5"]),
            6: ("target/actor/state/loop/terminal/exception/permission/timeout/notification/audit/dataをatomic workflow obligation候補へ分解する", "HELIX-HARNESS", ["L3", "L4", "L5"]),
            7: ("Phase A core interviewとPhase B conditional drill-downへquestion provenance・回答authority・unresolvedを追加する", "HELIX-HARNESS", ["L3", "L5"]),
            8: ("workflowからFR/AC/testへ変換しstable source transition IDとL1-L12 edgeを追加する", "HELIX-HARNESS", ["L3", "L10"]),
            9: ("screen/API/data/permission/notification/audit/testは派生候補に限定しlayer gateで確定する", "HELIX-HARNESS", ["L4", "L9", "L10"]),
            10: ("switching/routing/resource allocation/reallocationでAI proposalとcommit authorityを分離しmeasurement contractを加える", "unresolved", ["L3", "L5", "L10", "L12"]),
            11: ("workflow-model schemaへHELIX envelope、authority、decision、evidence、versionを追加する", "HELIX-HARNESS", ["L3", "L5"]),
            12: ("derived-requirements schemaへsource edge、layer、status、oracle、N/A receiptを追加する", "HELIX-HARNESS", ["L3", "L10"]),
            13: ("requirement-contract schemaへBR/FR/NFR、modality、priority、risk、revision、pairを追加する", "HELIX-HARNESS", ["L3"]),
            14: ("runtime orchestration Markdown contractへL5専用JSON Schema型を新設する", "HELIX-HARNESS", ["L5"]),
            15: ("examplesはreference-onlyとしworkflow schema不適合を正例にしない", "HELIX-HARNESS", ["L3", "L5"]),
        }
        normalized, target, layers = rows[index]
        return {
            "candidate_kind": "premise" if index != 15 else "example",
            "candidate_target": target,
            "owner_candidates": ["HELIX-HARNESS", "HELIX-OS"] if target == "unresolved" else [target],
            "candidate_granularity": "unit" if target != "unresolved" else "connection",
            "normalized_statement": normalized, "original_ids": [], "downstream_layers": layers,
            "retained_meaning": ["disposition語（adopt／adopt-with-hardening／redesign／reference-only）を保持する", "未確定の採否・実装・consumerを生成しない"],
            "questions": ["各source atomの現行owner・consumer・failure oracleは未確定", "hardening差分を人間decisionなしに現行要求へ移してよいか未決"],
        }
    if 17 <= index <= 34:
        n = index - 16
        target = "HELIX-HARNESS"
        mixed = {9, 10, 11, 12, 13, 14, 15, 17, 18}
        layers = ["L3"]
        if n in {5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18}:
            layers += ["L5"]
        if n in {5, 8, 14, 15, 16, 17, 18}:
            layers += ["L10"]
        if n in {14, 15, 18}:
            layers += ["L11", "L12"]
        if n == 14:
            layers += ["L12"]
        if n in mixed:
            target = "unresolved"
        descriptions = {
            1: "source packageのfilename/version/SHA-256/14-file inventory/atom dispositionをimmutable intake receiptへbindする",
            2: "自然言語入力をworkflow要素へ原子的に正規化する",
            3: "core questionを常時、15種のconditional questionをsignal時だけ発火する",
            4: "不明・矛盾・回答authority不足・分岐欠落を推測確定せずunresolved_itemsへ保存する",
            5: "各transitionからFR/AC/test scenarioを最低1件生成しstable source_transition_idで双方向traceする",
            6: "loop/terminalの終了、失敗、期限、更新、通知、audit、再開を契約化する",
            7: "condition dataへtype/required/validation/nullable/SSoT/mutable/sensitive/retentionを付ける",
            8: "workflowから8系統の派生候補を生成し個別先行設計を禁止する",
            9: "AI判断をfactsからproposed next stateまでの証拠列として記録する",
            10: "AIをproposal-onlyとしfreeze/permission/high-impact/gate/DB/Git/GitHub commitを自己承認させない",
            11: "switchingへdecision point/candidate/enable-disable/rule/fallback/reassessmentを必須化する",
            12: "routingへsource/destinations/capability-capacity/rule/fallback/dead-letterを必須化する",
            13: "allocationへpriority/deadline/capability/capacity/concurrency/cost/objective/fairness/preemption/reallocation/degradation/fallbackを必須化する",
            14: "判断・配分をmeasurement contractへbindしquality/latency/cost/queue/failure/fallback率/誤判断/override/driftをL10-L12で評価する",
            15: "Full Vのsystem workflowをfreezeしProduction Scrumのslice deltaをSR0-SR4でbackfillする",
            16: "workflow obligationをL1-L12へ配置し正規6 V-pairと同一revision/snapshot/oracleを保持する",
            17: "HELIX envelopeへworkflow model/unresolved/derived requirements/coverage/contract candidatesをversioned fieldで束ねる",
            18: "runtime orchestration schemaを分離またはcompositionしZIP runtime example不適合解消までactivationを拒否する",
        }
        return {
            "candidate_kind": "requirement", "candidate_target": target,
            "owner_candidates": ["HELIX-HARNESS", "HELIX-OS"] if target == "unresolved" else [target],
            "candidate_granularity": "connection" if target == "unresolved" else "unit",
            "normalized_statement": f"UWJ-FR-{n:03d}: {descriptions[n]}",
            "original_ids": [f"UWJ-FR-{n:03d}", f"UWJ-AC-{n:03d}"], "downstream_layers": sorted(set(layers)),
            "retained_meaning": ["受入IDを原文どおり保持する", "数量・列挙・禁止・停止・fallback・authority条件を省略しない", "要求採用・実装・受入完了を生成しない"],
            "questions": ["candidate targetがHARNESS contract、OS execution/projection、connectionのどれかは未決" if target == "unresolved" else "current ownerの人間decisionは未登録", "対応するconsumer／failure oracle／decision recordは未解決"],
        }
    if index == 36:
        return {"candidate_kind":"connection", "candidate_target":"HELIX-HARNESS", "owner_candidates":["HELIX-HARNESS"], "candidate_granularity":"unit", "normalized_statement":"L1のtarget/actor/value/scope/non-goal/terminal/routeを定義しL12価値/SLO/改善へ接続する", "original_ids":[], "downstream_layers":["L1","L12"], "retained_meaning":["L1 obligationとL12 evidenceの組を保持する"], "questions":["L1/L12 pairの現行authorityとconsumerは未確定"]}
    if 37 <= index <= 47:
        n = index - 35
        target = "HELIX-HARNESS"
        if n in {9, 10, 12}:
            target = "unresolved"
        layers = [f"L{n}"]
        descriptions = {
            2:"L2業務要求/workflow/prototypeまたはN/AをL11利用者workflow受入へ接続する",
            3:"L3 FR/NFR/AC/unresolved disposition/decision policyをL10 transition/system oracleへ接続する",
            4:"L4 screen/API/data/permission/notification/audit/外部境界をL9接続/権限/transactionへ接続する",
            5:"L5 state/loop/exception/switch/route/allocation/fallback/dead-letter/test/measurementをL8 oracleへ接続する",
            6:"L6 engine/adapter/probe実装をL7 TDD closureへ接続する",
            7:"L7 schema/decision/policy/probe test実装をL6 implementation traceへ接続する",
            8:"L8 normalization/scoring/loop/fallbackをL5 detail contractへ局所検証する",
            9:"L9 API/DB/queue/resource/authority境界をL4 basic designへ結合検証する",
            10:"L10 end-to-end workflow/FR/NFR/misroute/degradationをL3 requirementsで検証する",
            11:"L11 actor権限/操作/説明可能性/human overrideをL2 requirements/prototypeで受け入れる",
            12:"L12 時間軸SLO/cost/queue/drift/誤判断/改善効果をL1 valueで評価する",
        }
        return {"candidate_kind":"connection", "candidate_target":target, "owner_candidates":["HELIX-HARNESS","HELIX-OS"] if target=="unresolved" else [target], "candidate_granularity":"connection" if target=="unresolved" else "unit", "normalized_statement":descriptions[n], "original_ids":[], "downstream_layers":layers+[f"L{n+1}" if n<12 else "L1"], "retained_meaning":["判断エンジン義務と対となる証拠層の対応を保持する", "implementation/test語は旧source記述であり現行実装証拠ではない"], "questions":["各L層の対象別ownerと正規pairは未確定", "OS運転境界とのconnectionをどこで採択するか未決"]}
    if index == 49:
        return {"candidate_kind":"acceptance", "candidate_target":"HELIX-HARNESS", "owner_candidates":["HELIX-HARNESS","HELIX-OS"], "candidate_granularity":"connection", "normalized_statement":"workflow freezeを全transition完了・blocking unresolvedゼロ・derived edge閉鎖・schema composition valid・V-pair currentで定義する", "original_ids":[], "downstream_layers":["L3","L10","L11","L12"], "retained_meaning":["論理積の全条件を保持する", "完了式を現行completionへ昇格しない"], "questions":["各predicateのevidence owner、consumer、failure dispositionは未解決"]}
    if index == 50:
        return {"candidate_kind":"acceptance", "candidate_target":"unresolved", "owner_candidates":["HELIX-HARNESS","HELIX-OS"], "candidate_granularity":"connection", "normalized_statement":"AI decision executableをproposal valid・authority separated・policy pass・fallback・current measurement contract・commit verifier passの論理積で定義する", "original_ids":[], "downstream_layers":["L3","L5","L9","L10","L12"], "retained_meaning":["authority separationとcommit verifierを含む全predicateを保持する", "AI自己承認禁止と矛盾させない", "現行実行可能性を宣言しない"], "questions":["HARNESS semantic contractとOS commit/verification ownerの境界は未決", "各predicateの観測・failure・consumerは未確定"]}
    if index == 51:
        return {"candidate_kind":"acceptance", "candidate_target":"unresolved", "owner_candidates":["HELIX-HARNESS","HELIX-OS"], "candidate_granularity":"connection", "normalized_statement":"Scrum slice readyをslice workflow・SR0-SR4・system workflow backfill・L1-L12 pairsのcurrentで定義する", "original_ids":[], "downstream_layers":["L1","L3","L10","L11","L12"], "retained_meaning":["SR0..SR4とsystem backfillの全条件を保持する", "release readinessを現行受入済みと扱わない"], "questions":["SR0-SR4のconsumer／evidence／decision recordは未解決", "Scrum運転のHARNESS/OS境界は未決"]}
    raise AssertionError(index)


def main() -> None:
    blob = source_blob()
    text = blob.decode("utf-8")
    lines = text.splitlines(keepends=True)
    source_sha = hashlib.sha256(blob).hexdigest()
    spans = []
    atoms = []
    consumed = []
    for index, (start, end) in enumerate(SPAN_RANGES, 1):
        exact = "".join(lines[start - 1:end])
        digest = "sha256:" + hashlib.sha256(exact.encode("utf-8")).hexdigest()
        spans.append({"span_id": span_id(index), "start_line": start, "end_line": end, "sha256": digest, "exact_source_text": exact})
        meta = atom_meta(index)
        atom = {"semantic_atom_id": atom_id(index), "source_document_id": SOURCE_ID, "source_path": SOURCE_PATH, "source_revision": ARCHIVE_COMMIT, "source_span_ref": span_id(index), **meta,
                "existing_identity_relations": ["source_holding:file_blob", "preserved_pending_atomization"],
                "legacy_state": {"asset_id":"LEGACY-ASSET-5EE032D657C221184B00", "phase_status":"unresolved", "phase_candidates":[], "implementation_status":"unknown", "implementation_evidence":"document_present_only; no current implementation evidence", "degraded_status":"unknown", "degraded_evidence":[], "failure_status":"unknown", "failure_evidence":[], "consumer_status":"pending", "consumer_refs":[], "decision_status":"missing", "decision_record_ref":None, "legacy_execution_performed":False, "unconfirmed":True}}
        if index in {29, 45}:
            atom["legacy_state"]["degraded_evidence"] = [f"source line {SPAN_RANGES[index-1][0]} uses degradation as a required field/verification condition; observed degraded runtime status is unknown"]
        if index in {22, 30}:
            atom["legacy_state"]["failure_evidence"] = [f"source line {SPAN_RANGES[index-1][0]} uses failure/失敗 as a terminal or measurement condition; observed failure status is unknown"]
        if index in {41, 42}:
            atom["legacy_state"]["implementation_evidence"] = "source line uses 実装／implementation as a design/test obligation; current implementation status remains unknown"
        atoms.append(atom)
        consumed.extend(range(start, end + 1))

    refs = [
        {"reference_id":"DELEGATED-REF-0352","source_line":9,"relation":"authority","target_path":"docs/governance/helix-harness-requirements_v1.3.md","status":"unresolved_semantic_relation"},
        {"reference_id":"DELEGATED-REF-0353","source_line":10,"relation":"pair_artifact","target_path":"docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md","target_document_id":"DELEGATED-DOC-024","status":"pair_not_atomized_in_this_scope"},
        {"reference_id":"DELEGATED-REF-0354","source_line":18,"relation":"migration_provenance_reference","target_path":"docs/migration/source-manifests/universal-workflow-requirements-skill.v1.1.0.json","status":"provenance_not_current_authority"},
        {"reference_id":"DELEGATED-REF-0408","source_line":255,"relation":"semantic_relation_closure","target_path":"docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md","status":"upstream_reference_unresolved"},
        {"reference_id":"DELEGATED-REF-0778","source_line":10,"relation":"pair_artifact","target_path":"docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md","status":"reverse_pair_reference_unresolved"},
    ]
    inventory = {
        "schema":"helix-scaffold-delegated-doc-semantic-atom-candidate.v1",
        "candidate_id":"RDP-001-DELEGATED-DOC-009-ATOM-0033",
        "status":"candidate_pending_independent_review",
        "authority_effect":"none", "meaning_change_applied":False, "successor_requirement_ids":[], "human_decision_ref":None, "equivalence_claim":None,
        "old_runtime_test_ci_execution":False,
        "comparison":{"archive_commit":ARCHIVE_COMMIT,"candidate_base_commit":subprocess.run(["git","rev-parse","HEAD"],cwd=ROOT,text=True,stdout=subprocess.PIPE,check=True).stdout.strip(),"method":"read-only Git archive blob; contiguous exact line spans and UTF-8 SHA-256","source_document_id":SOURCE_ID,"input_report":{"path":"scaffold/rdp001-delegated-doc003-unprocessed8/report.json","commit":"fa8f5426882ee56a56e28975746e2db590cd515f","sha256":"870f88c0cd5e427ef4032d8921699f78ea1da2906747cc7852a00bf5c3e8b39f","selection":"PR #1964 corrected report; DOC-009 source lines=87"}},
        "source_document":{"source_document_id":SOURCE_ID,"source_path":SOURCE_PATH,"archive_path":ARCHIVE_PATH,"source_sha256":source_sha,"archive_blob_oid":"bd7d8209586ab5b7e4f49b35b08192c681da60c2","bytes":len(blob),"physical_line_count":len(lines),"logical_line_count":len(lines),"source_declared_status":"confirmed","source_relation":"requirements_v1.3_reference_line_255","holding_granularity":"file_blob","carry_status":"preserved_pending_atomization","meaning_change_applied":False,"successor_refs":[],"human_decision_ref":None},
        "ledger_provenance":{"source_holding_path":"docs/governance/delegated-requirement-document-source-holding.jsonl","source_holding_sha256":"23d1df9c24b579c78c5836390d4c62c345e483eca42a9452742fad28d1e787fd","reference_holding_path":"docs/governance/delegated-requirement-document-reference-holding.jsonl","reference_holding_sha256":"627a764420d54dd13df0b340605c25b9f977d36a31954ead35a94cccba0e54f7","asset_ledger_sha256":"cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c","phase_ledger_sha256":"2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f","asset_decisions_path":"docs/governance/legacy-asset-decisions.jsonl","asset_decisions_sha256":"cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f","asset_id":"LEGACY-ASSET-5EE032D657C221184B00","phase_classification_id":"LASPH-0491","decision_record_count":0},
        "product_phase_classification":{"approved_products":["HELIX-HARNESS","HELIX-OS","HELIX-Web","HELIX-Web-OS"],"source_bootstrap_candidate_products":["HELIX-HARNESS"],"candidate_products":["HELIX-HARNESS","HELIX-OS"],"candidate_product_status":"candidate_needs_semantic_review","candidate_product_rationale":"HARNESS owns workflow/V-model meaning and contract candidates; OS is a possible execution/projection/commit authority connection. Web and Web-OS have no direct target evidence in this source; absence is retained as unresolved rather than exclusion decision.","source_declared_layer":"L3","candidate_layer_phase":"L3","capability_phase_candidates":[],"phase_status":"unresolved","phase_rationale":"旧phase bootstrapはcandidate_phase_targets=[]／capability_phase_evidence_insufficient。bodyのL1-L12行はdownstream layer signalsでありPHCAP authorityではない。"},
        "legacy_status":{"asset_class":"Historical","authority_status":"historical","disposition":"unresolved","implementation_status":"unknown","implementation_evidence_state":"document_present","legacy_execution_performed":False,"degraded_status":"unknown","degraded_evidence":[{"line":57,"text_role":"required allocation field degradation","observed_status":"unknown"},{"line":77,"text_role":"L10 degradation verification condition","observed_status":"unknown"}],"failure_status":"unknown","failure_evidence":[{"line":50,"text_role":"terminal failed condition","observed_status":"unknown"},{"line":58,"text_role":"failure metric","observed_status":"unknown"}],"consumer_closure_status":"pending","consumer_refs":[],"decision_record_ref":None,"decision_status":"missing","decision_evidence":[{"lines":[2,13,25,27,29,35,47,53,54,55,58,66,70,72,74,79,85],"text_role":"source requirement/provenance decision vocabulary only","observed_record":"none"}],"unresolved":["capability_phase_evidence_insufficient","product_candidate_requires_semantic_review","consumer_closure_pending","legacy_implementation_status_unknown","degraded_runtime_status_unknown","failure_observation_unknown","decision_record_missing"],"lexical_signal_counts":{"failure":2,"degraded":2,"implementation":3,"consumer":1,"decision":19}},
        "references":refs,
        "source_line_coverage":{"physical_lines_consumed_once":sorted(set(consumed)),"unresolved_lines":[],"coverage_rule":"all 87 physical source lines are consumed exactly once; no synthetic terminal line is added"},
        "source_spans":spans,
        "atoms":atoms,
        "unresolved_consumer_failure_decision":["consumer_refs are empty in the asset ledger; pair artifact DOC-024 and L1-L12 evidence edges remain pending closure","failure/degradation terms are source conditions and metrics, not observed failure or degraded implementation evidence","implementation terms in L6/L7 lines are design obligations; legacy implementation_status remains unknown","no matching append-only legacy decision record exists; decision status remains missing"],
        "limits":["candidate targets and layer signals are semantic placement candidates only; they do not establish current owner, authority, acceptance, implementation, or successor","HELIX-Web／HELIX-Web-OS are retained in approved product denominator with no direct source target evidence; no exclusion decision is generated","source spans preserve exact bytes from archive commit; archive runtime/test/CI/hook/adapter was not executed","scaffold validation is not L3/L10/L11/L12 completion evidence"],
    }
    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
