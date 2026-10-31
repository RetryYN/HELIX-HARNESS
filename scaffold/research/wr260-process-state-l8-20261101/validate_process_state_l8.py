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

# Compact, human-readable input conditions. These describe the fixed-base
# scenario; they are not copied from L9 expected values or executable edits.
GROUP_NORMAL_CONDITION = {
 "B01":"目的・前提・旧資産・外部事例・比較の根拠、技術品質の観測、人間原反応を同一対象について照合する入力。",
 "F01":"合意済み要件revisionについて、現在の工程判断に必要な証拠を照合する入力。",
 "F02":"要求と画面・PoCの適用性を確かめ、技術結果から要件承認を作らない入力。",
 "F03":"変更・findingの影響をV谷と対応するV-pairの証拠から評価する入力。",
 "F04":"各artifact stateの根拠を状態順に独立して照合する入力。",
 "F05":"Port・authority・scope・Incident段階の根拠を分離して照合する入力。",
 "N01":"対象の適用性、品質stage、運用証拠、ownerを個別に照合する入力。",
}
SPECIAL_CONDITIONS = {
 "B01": {
  "QUALITY-DOUBLE-WRITER":"同じ技術品質結果を複数ownerが提示する入力。",
  "QUALITY-NOT-EXECUTED":"技術品質の実行記録が無い入力。",
  "QUALITY-FOREIGN-REVISION":"技術品質記録が対象と異なるrevisionに結び付く入力。",
  "HUMAN-MISSING":"人間の原反応が無い入力。",
  "HUMAN-UNACCEPTED-AXIS":"人間反応の一部条件ownerだけが未受容の入力。",
  "AI-AS-ORIGINAL":"AI解釈を人間の原反応として提示する入力。",
  "HUMAN-FOREIGN-SCOPE":"人間反応のscopeが対象scopeと異なる入力。",
  "UNRESOLVED-FINDING":"owner不一致のfindingが未解決のまま残る入力。",
  "MANAGEMENT-DIRECT-WRITE":"要求管理へ直接書き込んだ候補を含む入力。",
  "REQUEST-AS-APPROVAL":"要求依頼を承認として提示する入力。",
  "AI-AS-HUMAN":"AI解釈を人間反応として提示する入力。",
  "ERASE-ACCEPTED-AXES":"既受容の条件軸を候補側で消した入力。",
  "DESIGN-AXES-AS-L11":"設計軸を利用者要求の受容として提示する入力。",
  "REQUEST-AS-COMPLETION":"要求依頼を工程完了として提示する入力。",
  "REACTION-AS-REQUIREMENT-APPROVAL":"人間反応を要件承認として提示する入力。",
  "MANAGEMENT-URGENCY-MISSING-PAIR":"管理上の緊急進行条件でV-pairが欠落する入力。",
  "MANAGEMENT-URGENCY-MISSING-ACCEPTANCE":"管理上の緊急進行条件で利用者受容が欠落する入力。",
 },
 "F01": {
  "NORMAL":"対象revisionの開始条件を照合する入力。",
  "NORMAL-freeze":"未解決条件のない対象revisionをfreeze判定する入力。",
  "NORMAL-backflow":"要件への戻し先を持つ対象revisionを判定する入力。",
  "NORMAL-reopen":"差戻し後に再開する対象revisionを判定する入力。",
  "NORMAL-complete":"V-pairの証拠がそろったrevisionを完了判定する入力。",
  "MISSING-agreement":"必要な合意記録が欠ける入力。",
  "MISSING-requirements_approval":"要件承認記録が欠ける入力。",
  "MISSING-pair":"対応するV-pairの証拠が欠ける入力。",
  "FOREIGN-APPROVAL":"別revisionへの承認を対象revisionに添付した入力。",
  "CONSULTATION-AS-APPROVAL":"相談記録を承認として提示する入力。",
  "WORK_REQUEST-AS-APPROVAL":"作業依頼を承認として提示する入力。",
  "SELECTION-AS-APPROVAL":"選択記録を承認として提示する入力。",
  "OPERATION_AUTHORIZATION-AS-APPROVAL":"操作許可を要件承認として提示する入力。",
  "UNDELEGATED-MEANING":"委任対象外の要求意味変更を含む入力。",
  "UNDELEGATED-AUTHORITY":"委任されていない権限変更を含む入力。",
  "FREEZE-VERIFICATION":"freeze対象revisionに未解決の照合差がある入力。",
  "REOPEN-UNRESOLVED":"差戻し後も未解決findingが残る入力。",
  "COMPLETE-PAIR":"両側pairの証拠がそろった完了候補入力。",
  "APPROVAL-UNKNOWN":"承認状態を確定できない入力。",
 },
 "F02": {
  "NORMAL":"画面・PoCの適用性と要求合意を照合する入力。",
  "NORMAL-BOTH-NA":"画面prototypeとPoCの双方が理由付きで非適用の入力。",
  "NORMAL-SCREEN-AND-POC":"画面prototypeとPoCの双方を適用し、合意記録がある入力。",
  "L2-MISSING":"対象要求のL2記録が欠ける入力。",
  "POC-SKIPPED-BY-NO-SCREEN":"画面対象外を理由にPoCも未実施とする入力。",
  "POC-RESULT-MISSING":"適用したPoCの結果記録が欠ける入力。",
  "POC-RESULT-FAIL":"適用したPoCの技術結果が不成立の入力。",
  "RETURN-MISSING-backflow":"PoC結果から要求へのBackflow記録が欠ける入力。",
  "RETURN-MISSING-secondary_008":"2次形成の008記録が欠ける入力。",
  "RETURN-MISSING-decide":"PoC結果に対するDecide裁定が欠ける入力。",
  "RETURN-MISSING-agreement":"戻し後の要求合意記録が欠ける入力。",
  "RETURN-MISSING-pair_refreeze":"変更後のpair再freeze記録が欠ける入力。",
  "OLD-AGREEMENT":"対象外の古いrevisionの合意を添付した入力。",
  "AI-AS-DECIDE":"AI結果をDecide裁定として提示する入力。",
  "NA-WITHOUT-REASON":"非適用理由が無い入力。",
  "DECIDER-NA-MISSING":"非適用の判断者記録が欠ける入力。",
  "TARGET_HEAD-NA-MISSING":"非適用判定の対象HEAD記録が欠ける入力。",
  "REQUIREMENT_IMPACT-NA-MISSING":"非適用判定の要求影響記録が欠ける入力。",
  "REEVALUATION-NA-MISSING":"非適用の再評価条件が欠ける入力。",
  "NOT_APPLICABLE-NA-MISSING":"非適用状態の記録が欠ける入力。",
 },
 "F03": {
  "NORMAL":"変更影響を評価する通常のV谷入力。",
  "NORMAL-Refactor":"振る舞い不変を前提とするRefactor入力。",
  "NORMAL-Design-refactor":"設計上の責務・依存を改める入力。",
  "NORMAL-Performance-refactor":"設計を保った性能改善の入力。",
  "ORIGIN-MISSING":"起点となる原記録が欠ける入力。",
  "LEGACY-ASSET":"旧資産の由来と現行変更点を照合する入力。",
  "TRACE-MISSING":"対象revisionへのtraceが欠ける入力。",
  "DESIGN-DISPUTED":"設計根拠に未解決の異論がある入力。",
  "LARGE-DEVIATION":"実装と承認済み設計に大きな差がある入力。",
  "DESIGN-IMPLEMENTATION-DRIFT":"設計revisionと実装revisionがずれた入力。",
  "FINDING-RECURRENCE":"同種findingが再発した入力。",
  "PERFORMANCE-REGRESSION":"固定baselineに対する性能退行を含む入力。",
  "INCIDENT-PERMANENT-REMEDY":"Incidentに恒久修正候補が加わった入力。",
  "SCRUM-CHECKPOINT":"sprint review前のcheckpoint入力。",
  "WRONG-L9-PAIR":"対応対象でないL9 pairを参照する入力。",
  "FOREIGN-PAIR-REVISION":"別revisionのpair証拠を添付した入力。",
  "STATE-OWNER-CONFLICT":"同じstate/dataに複数ownerがいる入力。",
  "PRE-BODY-RED-ABSENT":"実装前Red証拠が欠ける入力。",
  "PUBLIC-MEANING-CHANGE":"public contractの意味変更を含む入力。",
  "ARCHITECTURE-MEANING-CHANGE":"architecture責務の意味変更を含む入力。",
  "NORMAL-AS-FULL-REVERSE":"Scoped Reverse候補をFull Reverseとして提示する入力。",
  "NORMAL-AS-REVERSE-TICKET":"Reverse評価結果からticket発行済みとする入力。",
  "HARNESS-AS-ISSUER":"HARNESSをticket発行者として提示する入力。",
  "VALLEY-AS-QUALITY":"V谷の証拠を品質受容として扱う入力。",
  "VALLEY-AS-USER-ACCEPTANCE":"V谷の証拠を利用者受容として扱う入力。",
  "VALLEY-AS-RELEASE":"V谷の証拠をreleaseとして扱う入力。",
  "REVERSE-AS-EXECUTED":"Reverse候補を実行済みとして扱う入力。",
  "REQUIREMENT-MEANING-CHANGE":"要求意味変更が必要な入力。",
  "STATE-MEANING-CHANGE":"artifact stateの意味変更が必要な入力。",
  "L8-WRONG-PAIR":"対象外のL8 pairを参照する入力。",
  "L8-FOREIGN-REVISION":"別revisionのL8証拠を添付した入力。",
  "L10-WRONG-PAIR":"対象外のL10 pairを参照する入力。",
  "L10-FOREIGN-REVISION":"別revisionのL10証拠を添付した入力。",
  "NORMAL-WHOLE":"同一の通常callerで全関係条件を照合する入力。",
  "005-BINDING-QUALIFICATION-MISSING-WHOLE":"005 carrier qualificationの一memberが欠ける入力。",
 },
 "F04": {
  "FOREIGN-REVISION":"証拠の要求revisionが対象と異なる入力。",
  "FOREIGN-SCOPE":"system証拠の対象scopeが要求scopeと異なる入力。",
  "FOREIGN-ENVIRONMENT":"配備先environmentが対象environmentと異なる入力。",
  "DOC-AS-ATOMIC-CI":"文書の存在だけでatomic CI実証済みとする入力。",
  "PRE-BODY-RED-ABSENT":"実装後のmutationしかなく実装前Redが無い入力。",
  "BOUNDARY-DOUBLE-OWNER":"state/data境界に複数ownerがある入力。",
  "SYSTEM-DIFFERENCE-MISSING":"system固有global-balance証明が欠ける入力。",
  "SYSTEM-OBSERVATION-FAIL":"system oracleの観測値が期待値と異なる入力。",
  "L10-AS-HUMAN-ACCEPTANCE":"L10成功を人間の原受容として提示する入力。",
  "AI-AS-HUMAN-ACCEPTANCE":"AI解釈を人間の原受容として提示する入力。",
  "PORT-ROLLBACK-MISSING":"Portのrollback根拠が欠ける入力。",
  "DEPLOY-AS-OBSERVED":"配備成功を運用時点のObserved証拠として提示する入力。",
  "FOREIGN-ARTIFACT":"別artifactの配備を対象artifactの証拠として提示する入力。",
  "UNTRUSTED-CLAIM-ONLY":"自己申告だけでpair・下位証拠・system観測が無い入力。",
  "PROVISIONAL-WHOLE":"WorkingからProvisionalまでのstate根拠を一括照合する入力。",
  "VERIFIED-EXPLICIT-UNIQUE-DIFFERENCE":"Verified根拠だけが独立して成立する入力。",
  "VERIFIED-022-CARRIER-QUALIFICATION-MISSING":"Verified対象の022 carrier qualificationが欠ける入力。",
  "OBSERVED-READABLE-PROOF-RETENTION":"Observed根拠を含む全stateの読取証拠がある入力。",
 },
 "F05": {
  "NORMAL":"PortとIncident条件を個別に照合する通常入力。",
  "HOTFIX":"緊急修正を要するIncident入力。",
  "START-WITH-PORT":"作業開始時点でPort契約を照合する入力。",
  "PORT-AFTER-START":"作業開始後にPort条件が追加された入力。",
  "FOREIGN-ARTIFACT":"Port証拠が別artifactを指す入力。",
  "FOREIGN-ENVIRONMENT":"Port証拠が別environmentを指す入力。",
  "AUTHORITY-MISSING":"操作に必要なauthority証拠が無い入力。",
  "AUTHORITY-FOREIGN-OP":"authorityが別操作を対象とする入力。",
  "AUTHORITY-EXPIRED":"操作authorityの有効期限が過ぎた入力。",
  "AUTHORITY-REVOKED":"操作authorityが取り消された入力。",
  "CONVERGENCE-FAILED":"Incident収束条件が成立しない入力。",
  "MISSING-proofs":"必須Port根拠が欠ける入力。",
  "MISSING-artifact_identity":"Portのartifact識別根拠が欠ける入力。",
  "MISSING-environment":"Portのenvironment根拠が欠ける入力。",
  "MISSING-dependencies":"Portのdependency根拠が欠ける入力。",
  "MISSING-security":"Portのsecurity根拠が欠ける入力。",
  "MISSING-rollback":"Portのrollback根拠が欠ける入力。",
  "MISSING-deployment_conditions":"Portのdeployment条件が欠ける入力。",
  "MISSING-acceptance":"Portのacceptance根拠が欠ける入力。",
  "CLOSED-ISSUE":"Issue closeだけでbackfill完了とする入力。",
  "SYSTEM-BALANCE-FAIL":"system balance証拠が不成立の入力。",
  "ROLLBACK-OBSERVATION-FAIL":"rollback観測が不成立の入力。",
  "AI-AS-ACCEPTANCE":"AI出力を人間acceptanceとして扱う入力。",
  "URGENT-RELEASE":"Incidentの緊急性をrelease許可として扱う入力。",
  "DEPLOY-AS-PERMANENT":"deploymentを恒久修正完了として扱う入力。",
  "ISSUE-CLOSE-AS-BACKFILL":"Issue closeを必要層backfillとして扱う入力。",
  "UNKNOWN-RETURN-FILLED":"不明なreturn先を確定値で補う入力。",
  "FULLBACK-AS-EXECUTED":"Fullback候補を実行済みとして扱う入力。",
  "PORT-AS-NEW-APPROVAL":"Port記録から新しい承認を作る入力。",
 },
 "N01": {
  "NORMAL":"複数対象の適用性と品質stage証拠を照合する入力。",
  "OBSERVED-CURRENT-SYNTHETIC":"現在environmentのObserved証拠を合成fixtureとして照合する入力。",
  "OPERATED-CURRENT-SYNTHETIC":"現在environmentのOperated証拠を合成fixtureとして照合する入力。",
  "DESIGN-FOREIGN-ENVIRONMENT":"設計根拠が別environmentに属する入力。",
  "DESIGN-DOUBLE-OWNER":"設計stageの同一根拠に複数ownerがいる入力。",
  "DESIGN-MISSING":"設計stageの根拠が欠ける入力。",
  "APPLICABILITY-UNKNOWN":"対象の適用性が不明な入力。",
  "NA-WITHOUT-REASON":"非適用判定に理由が無い入力。",
  "SECURITY-FOREIGN-ENVIRONMENT":"security scope根拠が別environmentに属する入力。",
  "SECURITY-AS-OS-POLICY":"HARNESS対象のsecurity判断をOS policyとして提示する入力。",
  "HARNESS-AS-TICKET-OWNER":"HARNESSを個別ticket運転ownerとして提示する入力。",
  "INFERENCE-FOREIGN-SCOPE":"finding推論根拠のscopeが対象と異なる入力。",
  "UNOBSERVED-AS-HEALTHY":"未観測状態をhealthyと断定する入力。",
  "DESIGN-AS-OPERATION":"設計証拠を実際のsecurity operationとして提示する入力。",
  "REFERENCE-AS-PERMISSION":"参照情報を実操作許可として提示する入力。",
  "DESIGN-AS-COMPLETION":"設計stage到達を完了として提示する入力。",
  "DESIGN-AS-IMPLEMENTED":"設計証拠を実装済みstageとして提示する入力。",
  "DESIGN-AS-VERIFIED":"設計証拠を検証済みstageとして提示する入力。",
  "DESIGN-AS-OBSERVED":"設計証拠をObserved stageとして提示する入力。",
  "DESIGN-AS-OPERATED":"設計証拠をOperated stageとして提示する入力。",
  "INFERENCE-AS-REPRODUCED":"finding推論を再現済み証拠として提示する入力。",
  "INFERENCE-AS-VERIFIED":"finding推論を検証済み証拠として提示する入力。",
  "INFERENCE-AS-REPAIRED":"finding推論を修復済み証拠として提示する入力。",
  "INFERENCE-AS-REVERIFIED":"finding推論を再検証済み証拠として提示する入力。",
  "INFERENCE-AS-OPERATED":"finding推論を運用済み証拠として提示する入力。",
  "INVENT-SLO":"根拠のないSLO数値を設定候補へ含む入力。",
  "INVENT-RTO":"根拠のないRTO数値を設定候補へ含む入力。",
  "INVENT-RPO":"根拠のないRPO数値を設定候補へ含む入力。",
  "INVENT-RETENTION":"根拠のないretention値を設定候補へ含む入力。",
  "OBSERVED-FOREIGN-ENVIRONMENT":"Observed証拠が別environmentに属する入力。",
  "OBSERVED-NOT-EXECUTED":"Observed確認が未実行の入力。",
  "OBSERVED-OWNER-CONTENT-CONFLICT":"Observed根拠のownerと内容が矛盾する入力。",
  "OPERATED-FOREIGN-ENVIRONMENT":"Operated証拠が別environmentに属する入力。",
  "OPERATED-NOT-EXECUTED":"Operated確認が未実行の入力。",
  "OPERATED-OWNER-CONTENT-CONFLICT":"Operated根拠のownerと内容が矛盾する入力。",
  "OPERATED-LEGACY_BROKER":"Operated根拠が旧broker経路に属する入力。",
  "OPERATED-LEGACY_PROVIDER":"Operated根拠が旧provider経路に属する入力。",
  "OPERATED-LEGACY_CI":"Operated根拠が旧CI経路に属する入力。",
 },
}

def unit_condition(source: dict[str, Any], function_suffix: str) -> str:
    case_id=source["id"]
    suffix=case_id.removeprefix(f"H003-L8-{function_suffix}-")
    if function_suffix=="B01" and suffix.startswith("GROUNDING-MISSING-"):
        field=suffix.removeprefix("GROUNDING-MISSING-").replace("_"," ")
        names={"purpose":"目的","premises":"前提","legacy assets":"旧資産","external examples":"外部事例","comparison":"比較"}
        if field in names:return f"根拠資料の{names[field]}が欠落した候補を入力する。"
    if function_suffix=="F03" and suffix.startswith("L9-MISSING-"):
        field=suffix.removeprefix("L9-MISSING-").replace("_"," ")
        names={"interface":"interface","dependency direction":"依存方向","state data ownership":"state/data所有","transaction":"transaction","failure propagation":"failure伝播","retry":"retry","timeout":"timeout","idempotency":"idempotency","coupling":"結合度","responsibility duplication":"責務重複"}
        if field in names:return f"L9の{names[field]}条件根拠が欠ける入力。"
    if function_suffix=="F04":
        states={"Working":"作業中","Provisional":"暫定","Integrated":"統合","Verified":"検証済み","Accepted":"受容済み","Release-eligible":"release適格","Deployed":"配備済み","Observed":"運用観測済み"}
        for prefix,phrase in (("NORMAL-","状態の原証拠がそろう通常入力。"),("MISSING-","状態固有の原証拠が欠ける入力。")):
            if suffix.startswith(prefix) and suffix[len(prefix):] in states:
                return f"「{states[suffix[len(prefix):]]}」状態で{phrase}"
    known=SPECIAL_CONDITIONS.get(function_suffix,{})
    if suffix in known:return known[suffix]
    constraint=source.get("candidate_constraint")
    if not isinstance(constraint,dict):constraint=source.get("failure_return_constraint")
    if isinstance(constraint,dict):
        field=constraint.get("candidate_conflicting_field") or constraint.get("field")
        if isinstance(field,str):
            descriptions={
             "request_as_approval":"要求依頼を承認として提示", "ai_interpretation_is_human":"AI解釈を人間反応として提示",
             "retained_accepted_axes":"受容済み条件軸を消去", "actual_L11_accepted":"設計軸をL11受容として提示",
             "actual_completion":"未完了候補を完了として提示", "reaction_as_requirement_approval":"反応を要件承認として提示",
             "additional_approval_needed":"詳細変更に追加承認を要求", "actual_approval_created":"相談結果から承認を生成",
             "actual_l3_frozen":"PoC結果だけでL3をfreeze", "actual_requirement_adopted":"技術結果を要求採択として提示",
             "actual_requirements_approved":"技術結果を要件承認として提示", "reverse_scope_candidate":"Scoped Reverseを全範囲Reverseへ拡大",
             "reverse_ticket_candidate":"Reverse候補をticket発行済みとして提示", "ticket_issuer":"HARNESSをticket発行者として提示",
             "actual_quality_accepted":"V谷の結果を品質受容として提示", "actual_user_accepted":"V谷の結果を利用者受容として提示",
             "actual_release":"評価結果をreleaseとして提示", "actual_reverse_executed":"Reverse候補を実行済みとして提示",
             "can_execute":"緊急性から実行可とする", "permanent_remedy_result":"deploymentを恒久修正として提示",
             "backfill_missing":"Issue closeでbackfill欠落を隠す", "return_layer_result":"不明な戻し先を確定する",
             "reverse_fullback_result":"Fullback候補を実行済みとして提示", "healthy":"未観測をhealthyと断定",
             "actual_security_operation":"設計証拠を実security operationとする", "actual_operation_approved":"参照を操作許可とする",
             "target_results":"stage根拠の無い昇格を候補へ含める",
            }
            phrase=descriptions.get(field)
            if phrase:return phrase+"入力。"
    assignment=source.get("negative_class_assignment")
    if isinstance(assignment,dict) and isinstance(assignment.get("reason"),str):
        return "入力条件: "+assignment["reason"]
    if suffix=="NORMAL":return GROUP_NORMAL_CONDITION[function_suffix]
    return "固定baseの当該入力条件を意味比較中（未検証）。"

SOURCE_CONTROL_CONDITIONS = {
 "H003-L8-CONTROL-ASSOCIATION-MISSING":"005_valleyのrequest associationが欠落し、015_flow associationは残る入力。",
 "H003-L8-CONTROL-ASSOCIATION-DUPLICATE":"005_valleyのrequest associationが重複し、015_flow associationは一意の入力。",
 "H003-L8-CONTROL-SOURCE-CELL-REF-MISMATCH":"005_valley associationのsource-cell参照がcarrier参照と食い違い、015_flowは一致する入力。",
 "H003-L8-CONTROL-OPERATION-REF-MISMATCH":"005_valley associationのoperation参照がcarrierとtarget operationの双方に食い違い、015_flowは一致する入力。",
 "H003-L8-CONTROL-BUSINESS-ENDPOINT-MISMATCH":"005_valleyのbusiness endpointが別SourceCellのraw targetを指し、015_flowは一致する入力。",
 "H003-L8-CONTROL-015-QUALIFICATION-MEMBER-MISSING":"015_flow carrierのqualification sidecar memberが欠落し、他のbinding軸は保持される入力。",
 "H003-L8-CONTROL-005-COMPOSITION-QUALIFICATION-MEMBER-MISSING":"005_composition carrierのqualification sidecar memberが欠落し、同callerの他roleは保持される入力。",
}

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
    specific_condition_ok=True
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
            wanted_condition=unit_condition(source,function_suffix)
            unit_ok &= row.get("condition")==wanted_condition and row.get("expected")==want
            specific_condition_ok &= isinstance(row.get("condition"),str) and len(row["condition"])>=8 and bool(re.search(r"[ぁ-んァ-ヶ一-龠]",row["condition"])) and not row["condition"].startswith("固定baseの当該入力条件を意味比較中")
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

        # Conditions explain source-binding meaning; operation/path recipes stay in fixed-base history only.
        old_controls=before.get("source_binding_controls",[]); now=group.get("source_binding_controls",[])
        if old_controls:
            control_count+=len(now); current_controls={r.get("id"):r for r in now}
            good=len(now)==len(old_controls) and {r.get("id") for r in now}=={r["id"] for r in old_controls}
            for i,src in enumerate(old_controls):
                row=current_controls.get(src["id"],{})
                specific_condition_ok &= row.get("condition")==SOURCE_CONTROL_CONDITIONS.get(src["id"])
                control_function=group.get("function_ref")
                good &= row.get("function_ref")==control_function
                records=src.get("expected_source_binding",{}).get("records",[])
                selected=next((r for r in records if r.get("role")==src.get("selected_role")),{})
                expected=(f"{src.get('selected_role')}: target={selected.get('target_state')}, scope={selected.get('scope_state')}, "
                          f"qualification={selected.get('source_qualification_state')}, binding={selected.get('binding_state')}; "
                          f"独立peer roles={max(0,len(records)-1)}件を保持")
                good &= row.get("condition")==SOURCE_CONTROL_CONDITIONS.get(src["id"])
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
    checks["source_binding_controls_semantics_and_states"] = control_ok
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
            if key=="condition":
                if x.startswith(("add ","remove ","replace ")) or re.search(r"(?:^|\s)/(?:[^\s]+)",x):pointer_problems.append(path)
            if "///" in x:pointer_problems.append(path)
    inspect(cur)
    checks["source_binding_condition_contains_no_operation_path"]=not pointer_problems
    checks["conditions_are_specific_human_scenarios"]=specific_condition_ok
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
