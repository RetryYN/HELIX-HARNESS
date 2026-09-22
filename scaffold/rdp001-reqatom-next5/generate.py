#!/usr/bin/env python3
"""REQATOM A1 0006--0010 の source-linked proposal generator。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
QUEUE = ROOT / "docs/governance/legacy-requirement-atomization-review-queue.jsonl"
LEDGER = ROOT / "docs/governance/legacy-requirement-semantic-line-carry-forward.jsonl"
SOURCE = ROOT / "docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md"
ARCHIVE_SOURCE = ROOT / "archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md"
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
COPY_READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
PROP = HERE / "proposals.jsonl"
INVENTORY = HERE / "inventory.json"

UNIT_IDS = [f"REQATOM-QUEUE-{n:04d}" for n in range(6, 11)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SOURCE_SHA = "09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61"
ASSET_ID = "LEGACY-ASSET-9F48ADEEB477DCA54039"
ASSET_DECISION = "REQ-SNAPSHOT-CORRECTION-9F48ADEEB477DCA54039"
READ_AFTER_ID = "READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039"
SOURCE_COMMIT = "2654cf936719dee21dfbf1ceb8140163400f081a"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha256(path.read_bytes())


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def atom(
    atom_id: str,
    line_ids: list[str],
    kind: str,
    target: str,
    granularity: str,
    normalized: str,
    identities: list[dict],
    retained: list[str],
    actors: list[str],
    authority: list[str],
    failure: list[str],
    evidence: list[str],
    negative: list[str],
    conflicts: list[str],
    questions: list[str],
    candidate_inference: list[str] | None = None,
) -> dict:
    return {
        "candidate_atom_id": atom_id,
        "source_line_ids": line_ids,
        "exact_source_text": "",
        "normalized_statement": normalized,
        "candidate_kind": kind,
        "candidate_target": target,
        "candidate_granularity": granularity,
        "existing_identity_relations": identities,
        "retained_meaning": retained,
        "actor_candidate": actors,
        "authority_boundary": authority,
        "failure_or_stop_conditions": failure,
        "evidence_or_acceptance_conditions": evidence,
        "negative_or_exception_conditions": negative,
        "legacy_failure_candidate": {
            "status": "source_meaning_preserved; current_failure_contract_unresolved",
            "conditions": failure,
        },
        "consumer_candidate": {
            "legacy_refs": ["requirement-carry-forward-ledgers", "requirement-atomization-review"],
            "current_status": "unresolved",
        },
        "possible_conflicts": conflicts,
        "questions": questions,
        "candidate_inference": candidate_inference or [],
        "status_preservation": {
            "source_authority": "confirmed (legacy source declaration)",
            "target_authority": "none",
            "carry_forward": "preserved_pending_atomization",
            "implementation_status": "unknown",
            "degradation_status": "unknown",
            "phase_status": "legacy declaration preserved; current phase placement unresolved",
            "successor_status": "unassigned",
        },
    }


COMMON_FAILURE = ["旧sourceの意味は保持するが、現行のfailure contract・実装・受入条件は未確定である。"]
COMMON_NEGATIVE = ["候補target、旧sourceの完了主張、表記上のlayerを現行authority・実装・受入へ昇格しない。"]
COMMON_AUTHORITY = ["旧sourceの宣言を保持するだけであり、現行target authority・権限・承認を生成しない。"]
COMMON_QUESTIONS = ["人間decisionでどの対象product／layer／successorへ配置するかは未解決である。"]


def unit_definitions() -> dict[str, list[dict]]:
    """各行を落とさず、意味を独立 review できる候補へ分ける。"""
    return {
        "REQATOM-QUEUE-0006": [
            atom(
                "A1-0006-01", ["REQSRC-LINE-00008"], "navigation", "HELIX-HARNESS", "composite",
                "旧business文書がBR-01〜08を収める業務要求節へ進むことを示す。",
                [{"identity": "legacy-source:business-requirements-section", "relation": "exact"}],
                ["『業務要求 (BR-01〜08)』という旧sourceの節見出しを保持する。", "見出しは要求identityの採否や件数の現行分母ではない。"],
                ["旧business source author", "BR section reader"], COMMON_AUTHORITY,
                ["見出しに対応する本文またはBR identityが欠落した場合、旧source closureを停止して確認する。"],
                ["REQSRC-LINE-00008の原文とsource line digest。"], COMMON_NEGATIVE,
                ["現行HARNESS L1の要求入口候補とは関係するが、旧BRのtarget authorityやsuccessorはない。"],
                ["BR-01〜08の本文行と別sourceのidentityをどの単位で接続するか。"],
            ),
        ],
        "REQATOM-QUEUE-0007": [
            atom(
                "A1-0007-01", ["REQSRC-LINE-00009"], "metadata", "unresolved", "unit",
                "旧business要求表の列見出しがID・業務要求・出所(trace)の三欄を宣言する。",
                [{"identity": "legacy-source:business-requirements-table-header", "relation": "exact"}],
                ["ID欄、業務要求欄、出所(trace)欄を持つ表構造を保持する。", "列見出し自体は要求本文、現行schema、受入を確定しない。"],
                ["旧source author", "trace reviewer"], COMMON_AUTHORITY,
                ["IDまたはtrace欄を失う改変はsource trace closureの確認停止条件になる。"],
                ["旧表ヘッダの三項目とREQSRC-LINE-00009 digest。"], COMMON_NEGATIVE,
                ["HARNESSのtrace契約候補とOSの登録・管理責務のどちらへ接続するかは未解決である。"],
                ["現行要求engineのschemaへ再導出する際、旧列をどのpairへ保つか。"],
            ),
        ],
        "REQATOM-QUEUE-0008": [
            atom(
                "A1-0008-01", ["REQSRC-LINE-00019"], "navigation", "HELIX-HARNESS", "composite",
                "旧business文書がUX-01〜03を収めるUX要求節へ進むことを示す。",
                [{"identity": "legacy-source:ux-requirements-section", "relation": "exact"}],
                ["『UX要求 (UX-01〜03)』という旧sourceの節見出しを保持する。", "UX見出しは現行Web製品の直接要求または承認済み分母を生成しない。"],
                ["旧business source author", "UX requirement reader"], COMMON_AUTHORITY,
                ["UXの本文や出所traceが欠落した場合、見出しだけで完了せず確認を止める。"],
                ["REQSRC-LINE-00019の原文とsource line digest。"],
                ["このsliceにWeb／Web-OSの直接source evidenceがないことを、不要・不採用の根拠にしない。"],
                ["HARNESSの利用者向け工程体験とHELIX-Webの利用者体験の責務境界が旧見出しだけでは確定しない。"],
                ["UX-01〜03の本文を後続unitでどの製品候補へ分けるか。"],
            ),
        ],
        "REQATOM-QUEUE-0009": [
            atom(
                "A1-0009-01", ["REQSRC-LINE-00020"], "metadata", "unresolved", "unit",
                "旧UX要求表の列見出しがID・UX/価値要求・出所(trace)の三欄を宣言する。",
                [{"identity": "legacy-source:ux-requirements-table-header", "relation": "exact"}],
                ["ID欄、UX/価値要求欄、出所欄を持つ表構造を保持する。", "旧表構造は現行Web／HARNESSの要求schemaやauthorityを確定しない。"],
                ["旧source author", "value/trace reviewer"], COMMON_AUTHORITY,
                ["UX/価値要求のIDまたはtraceを失う改変は後続atom化の停止条件になる。"],
                ["旧UX表ヘッダとREQSRC-LINE-00020 digest。"], COMMON_NEGATIVE,
                ["価値要求はHARNESSの提供工程価値・Webの利用者価値・OSの管理価値へまたがる可能性がある。"],
                ["現行四製品境界で、価値要求のownerとconnectionをどう記録するか。"],
            ),
        ],
        "REQATOM-QUEUE-0010": [
            atom(
                "A1-0010-01", ["REQSRC-LINE-00024"], "constraint", "HELIX-HARNESS", "unit",
                "旧sourceはPOをscope・受入・最終承認と業務要求定義の主体として記述する。",
                [{"identity": "legacy-source:actor-po", "relation": "exact"}, {"identity": "current-l1:HARNESS-L1-006", "relation": "partial"}],
                ["POのscope、acceptance、final approvalの役割を保持する。", "業務要求定義の主体という旧actor statementを保持する。"],
                ["PO", "業務要求定義者"],
                ["旧PO boundaryは候補となる工程・受入契約の意味であり、現行の人間承認recordや権限を付与しない。"],
                ["scope／acceptance／final approvalの担い手と承認境界が不明なままなら下流routingを停止する。"],
                ["REQSRC-LINE-00024のactor定義とsource line digest。"],
                ["POの旧最終承認をmerge、release、deployment authorityへ拡張しない。"],
                ["HARNESSの受入契約とHELIX-OSのauthority／record管理の分割が旧行だけでは未確定である。"],
                ["現行authority vocabularyでPOのscope／acceptance／final approvalをどう表現するか。"],
            ),
            atom(
                "A1-0010-02", ["REQSRC-LINE-00024"], "connection", "HELIX-OS", "connection",
                "旧sourceはPOのscope・受入・最終承認というactor役割を記述する。HELIX-OS接続は別途確認する候補であり、旧sourceの機能記述ではない。",
                [{"identity": "legacy-source:actor-po", "relation": "partial"}, {"identity": "current-l1:HELIXOS-L1-001", "relation": "unresolved"}],
                ["POのscope、受入、最終承認という旧actor roleを保持する。"],
                ["PO"],
                ["旧行はHELIX-OSの管理機構を明示せず、現行authorityを付与しない。"],
                ["旧PO actor定義のscope／受入／最終承認を欠落させた場合はsource meaning closureを停止する。"],
                ["REQSRC-LINE-00024のPO actor定義とsource line digest。"],
                ["旧PO役割を現行の承認record、権限、実装、完了へ昇格しない。"],
                ["HARNESSの受入契約とHELIX-OS候補の責務境界は旧行だけでは未確定である。"],
                ["旧PO役割が現行OSの管理対象か、HARNESS contract consumerかは人間判断待ちである。"],
                ["current product-boundary comparison suggests a possible HELIX-OS management／authority connection; this is not source meaning."],
            ),
            atom(
                "A1-0010-03", ["REQSRC-LINE-00025"], "constraint", "HELIX-HARNESS", "unit",
                "旧sourceはAI agent rosterを実装・レビュー・検証agentとして記述し、workerとverifierの分離およびL0-L3人間承認境界をharnessが機械強制する対象とする。",
                [{"identity": "legacy-source:actor-ai-agent-roster", "relation": "exact"}, {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"}],
                ["Claude Code／Codex等のAI実装・レビュー・検証agentをrosterとして保持する。", "worker≠verifierを保持する。", "L0-L3の人間承認境界をharnessが機械強制するという旧主張を保持する。"],
                ["AI implementation agent", "AI review agent", "AI verification agent", "human approver"],
                ["旧actor定義は候補の役割境界であり、現行AI identity、権限、worker／verifier実装を承認しない。"],
                ["workerとverifierが同一系統になった場合、旧sourceが示す独立性境界の確認を停止する。"],
                ["AI agent roster、worker≠verifier、L0-L3 human approval boundaryの原文。"],
                ["旧『人間を常設reviewerとしない』表現を現行review／mergeの無人許可へ昇格しない。"],
                ["HARNESSのverification contractとOSのWorker／CI／permission運転の分担が旧行だけでは未解決である。"],
                ["current independent verification、human approval、Worker permissionをどのrevisionへ束縛するか。"],
            ),
            atom(
                "A1-0010-04", ["REQSRC-LINE-00025"], "connection", "HELIX-OS", "connection",
                "旧sourceはAI agent roster、worker≠verifier、L0-L3人間承認境界を記述する。HELIX-OS接続は別途確認する候補であり、旧sourceの機能記述ではない。",
                [{"identity": "legacy-source:actor-ai-agent-roster", "relation": "partial"}, {"identity": "current-l1:HELIXOS-L1-003", "relation": "partial"}, {"identity": "current-l1:HELIXOS-L1-004", "relation": "unresolved"}],
                ["AI agent rosterを実装・レビュー・検証agentとして記述する。", "worker≠verifierとL0-L3人間承認境界の旧記述を保持する。"],
                ["AI implementation agent", "AI review agent", "AI verification agent", "human approver"],
                ["旧actor定義は現行のHELIX-OS Worker、CI、permission、verifier実装を承認しない。"],
                ["AI roster、worker≠verifier、L0-L3人間承認境界のいずれかが欠落した場合はsource meaning closureを停止する。"],
                ["REQSRC-LINE-00025のAI agent roster／worker≠verifier／L0-L3 human approval boundary原文。"],
                ["旧rosterの記述を現行のCI、review、merge、release、deploymentの完了・権限へ昇格しない。"],
                ["HARNESS contractとOS execution controlのjoinおよびWeb/Web-OSへの波及が未解決である。"],
                ["OS側のpermission／Worker／verifier recordとHARNESS側contractをどう結ぶか。"],
                ["current product-boundary comparison suggests a possible HELIX-OS execution／authority connection; source does not state OS Worker／CI／permission."],
            ),
            atom(
                "A1-0010-05", ["REQSRC-LINE-00026"], "constraint", "HELIX-HARNESS", "unit",
                "旧sourceはHELIX運用者を、HELIXを超個人開発基盤として使う本人であり、社内・チーム利用の展開先はHELIX-HARNESS packageと記述する。",
                [{"identity": "legacy-source:actor-helix-operator", "relation": "exact"}, {"identity": "current-l1:HARNESS-L1-005", "relation": "partial"}],
                ["HELIX運用者本人を超個人開発基盤の利用者として保持する。", "社内・チーム利用をHARNESS packageの展開先として扱う旧表現を保持する。"],
                ["HELIX operator", "HARNESS package consumer", "internal/team user"],
                ["旧package展開先の記述は外部提供条件の候補であり、現行配布・利用権限・運用を確定しない。"],
                ["package consumer、対象version、適用条件が不明な場合、外部提供成立を主張しない。"],
                ["operator／package deployment destination wording and HARNESS external provision boundary."],
                ["社内・チーム利用の展開先をHELIX-WebやWeb-OSの利用者／tenantへ自動同一視しない。"],
                ["HARNESSの外部consumer条件とOSのpackage distribution／promotion／rollback運転の分割が未解決である。"],
                ["package consumerの責務をHARNESSへ、配布・更新統制をOSへどう接続するか。"],
            ),
            atom(
                "A1-0010-06", ["REQSRC-LINE-00026"], "connection", "HELIX-OS", "connection",
                "旧sourceはHELIX運用者とHARNESS packageの展開先を記述する。HELIX-OS接続は別途確認する候補であり、旧sourceの配布機能記述ではない。",
                [{"identity": "legacy-source:actor-helix-operator", "relation": "partial"}, {"identity": "current-l1:HELIXOS-L1-005", "relation": "unresolved"}],
                ["HELIX運用者をHELIXを超個人開発基盤として使う本人とする。", "社内・チーム利用はHELIX-HARNESS packageの展開先という旧記述を保持する。"],
                ["HELIX operator", "internal/team user"],
                ["旧package展開先の記述は現行のHELIX-OS配布authority、runtime、外部作用を確定しない。"],
                ["HELIX operatorまたは社内・チーム利用のpackage展開先記述が欠落した場合はsource meaning closureを停止する。"],
                ["REQSRC-LINE-00026のHELIX operator／HARNESS package展開先原文。"],
                ["旧package展開先を現行の導入、更新、復旧、結果追跡、deployment、release完了へ昇格しない。"],
                ["Web／Web-OSのservice runtimeは旧actor行の直接consumerではなく、別target判断が必要である。"],
                ["OSの管理対象recordとHARNESS package consumerの正式なjoinは何か。"],
                ["current product-boundary comparison suggests a possible HELIX-OS distribution-management connection; source does not state install／update／recovery／result tracking."],
            ),
        ],
    }


def main() -> int:
    queue_rows = {row["review_unit_id"]: row for row in load_jsonl(QUEUE)}
    lines = {row["content_line_id"]: row for row in load_jsonl(LEDGER)}
    assets = {row["asset_id"]: row for row in load_jsonl(ASSETS)}
    decisions = {row["decision_id"]: row for row in load_jsonl(DECISIONS)}
    read_after = {row["read_after_id"]: row for row in load_jsonl(COPY_READ_AFTER)}
    definitions = unit_definitions()

    proposals: list[dict] = []
    for unit_id in UNIT_IDS:
        queue = queue_rows[unit_id]
        atoms = definitions[unit_id]
        input_ids = queue["content_line_ids"]
        for candidate in atoms:
            candidate["exact_source_text"] = lines[candidate["source_line_ids"][0]]["source_line_text"]
        target_counts = {product: 0 for product in PRODUCTS}
        for candidate in atoms:
            if candidate["candidate_target"] in target_counts:
                target_counts[candidate["candidate_target"]] += 1
        proposals.append({
            "review_unit_id": unit_id,
            "review_sequence": queue["review_sequence"],
            "input_source_path": queue["source_path"],
            "input_source_revision": queue["source_file_sha256"],
            "input_heading_path": queue["heading_path"],
            "input_source_line_range": [queue["source_line_start"], queue["source_line_end"]],
            "input_content_line_ids": input_ids,
            "input_content_line_digests": {line_id: lines[line_id]["source_line_sha256"] for line_id in input_ids},
            "line_coverage": {"consumed_once": input_ids, "shared_context": [], "unresolved": []},
            "candidate_atoms": atoms,
            "four_product_denominator": {
                product: {
                    "candidate_atom_count": target_counts[product],
                    "status": "candidate_only" if target_counts[product] else "no_direct_source_evidence",
                }
                for product in PRODUCTS
            },
            "authority_claim": "none",
            "proposal_status": "needs_independent_review",
            "meaning_change_applied": False,
            "successor_requirement_ids": [],
            "decision_record": None,
        })

    PROP.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in proposals), encoding="utf-8")
    asset = assets[ASSET_ID]
    decision = decisions[ASSET_DECISION]
    read = read_after[READ_AFTER_ID]
    counts = {product: 0 for product in PRODUCTS}
    unresolved = 0
    for row in proposals:
        for candidate in row["candidate_atoms"]:
            target = candidate["candidate_target"]
            if target in counts:
                counts[target] += 1
            else:
                unresolved += 1
    inventory = {
        "schema_revision": 1,
        "generated_at": "2026-09-22",
        "authority_effect": "none",
        "proposal_status": "needs_independent_review",
        "source_commit": SOURCE_COMMIT,
        "inputs": {
            "queue_path": str(QUEUE.relative_to(ROOT)),
            "queue_sha256": file_sha(QUEUE),
            "semantic_line_ledger_path": str(LEDGER.relative_to(ROOT)),
            "semantic_line_ledger_sha256": file_sha(LEDGER),
            "source_path": str(SOURCE.relative_to(ROOT)),
            "source_sha256": file_sha(SOURCE),
            "archive_source_path": str(ARCHIVE_SOURCE.relative_to(ROOT)),
            "archive_source_sha256": file_sha(ARCHIVE_SOURCE),
            "legacy_asset_id": ASSET_ID,
            "legacy_asset_revision": asset["revision"],
            "legacy_asset_disposition": asset["disposition"],
            "legacy_asset_implementation_status": asset["implementation_status"],
            "legacy_asset_product_target": asset["product_target"],
            "legacy_asset_decision_status": asset["decision_status"],
            "legacy_asset_decision_ref": asset["decision_record_ref"],
            "legacy_asset_correction_decision": decision["decision_id"],
            "legacy_asset_correction_supersedes": decision["supersedes_decision_id"],
            "legacy_asset_read_after_id": read["read_after_id"],
            "legacy_asset_read_after_result": read["result"],
            "legacy_asset_read_after_digest_match": read["digest_match"],
            "legacy_asset_read_after_consumer_match": read["consumer_match"],
            "legacy_asset_read_after_failure": read["failure"],
            "legacy_asset_consumer_refs": asset["consumer_refs"],
            "legacy_asset_read_after_consumer_refs": read["consumer_refs_observed"],
        },
        "review_unit_ids": UNIT_IDS,
        "review_unit_count": len(proposals),
        "input_line_count": sum(len(row["input_content_line_ids"]) for row in proposals),
        "candidate_atom_count": sum(len(row["candidate_atoms"]) for row in proposals),
        "four_product_denominator": {
            product: {
                "candidate_atom_count": counts[product],
                "status": "candidate_only" if counts[product] else "no_direct_source_evidence",
            }
            for product in PRODUCTS
        },
        "unresolved_target_candidate_atom_count": unresolved,
        "status_preservation": {
            "source_authority": "confirmed (legacy queue declaration)",
            "target_authority": "none",
            "carry_forward": "preserved_pending_atomization",
            "implementation_status": "unknown",
            "degradation_status": "unknown",
            "phase_status": "legacy physical L1 / canonical declaration retained; current phase placement unresolved",
            "successor_requirement_ids": [],
            "decision_record": None,
        },
        "proposal_sha256": file_sha(PROP),
    }
    INVENTORY.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"generated REQATOM A1 next five: units={len(proposals)} lines={inventory['input_line_count']} atoms={inventory['candidate_atom_count']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
