#!/usr/bin/env python3
"""Generate the research-only phase-status taxonomy for the 30 SCF-B-0101 gaps."""
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE_COMMIT = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
PARENT = "scaffold/legacy-phase-gap-review-0101"
PHCAP_PHASE_IDS = [f"PHCAP-{index:02d}" for index in range(1, 21)]

WAVE_REL = [
    *(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)),
    *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51)),
]

TAXONOMY_STATUS = {
    "CROSS_CUTTING_PHASE_REVIEW_PENDING": {
        "label": "横断制約らしさはあるが全PHCAP境界の除外未検証／phase非適用保留",
        "authority_effect": "none",
        "formal_phase_effect": "unchanged_unresolved",
    },
    "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW": {
        "label": "別sourceまたはhuman判断が必要な未解決",
        "authority_effect": "none",
        "formal_phase_effect": "unchanged_unresolved",
    },
}

# This table is intentionally hand-authored from the exact source statement.  It is
# a bounded research decision matrix, not a phase authority registry.
CLASSIFICATION = {
    "IRUNIT-HIL-BR-14-HELIX-OS": ("M-WAIT-SOURCE-AUTHORITY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "ref authority、atomic decomposition、採否からGateまでのtraceを一つに束ねる要求。source custodyとproduct／authority境界を追加sourceとhuman判断で確認するまで、横断制約ともPHCAP直接機構とも確定しない。", ["旧IR source spanとref authority receiptの独立確認", "product unit／connectionのhuman decision", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-BR-24-HELIX-OS": ("M-WAIT-SOURCE-AUTHORITY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "原子要求、authority、分類、acceptance、capability、template、revisionの履歴を結ぶ要求定義契約。要件登録・分類・受入のphase境界は追加sourceとhuman判断が必要。", ["現行要求定義契約とPHCAP-02〜07の対応source", "product／authorityのhuman decision", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-FR-17-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "screen applicability、skip receipt、再entry triggerを定める工程gate。再entryはPHCAP-20のcontinuationと語が近いが、原文は画面工程の判定契約であり直接責務を確定できない。", ["skip／reentryの現行契約とcontinuation責務の境界source", "phase authority reviewerのhuman decision", "product ownerとconsumer closure"]),
    "IRUNIT-HIL-FR-18-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "原文はscreen ID、操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化するPrototype Builderを要求する。Waveのasset検索候補にはPHCAP-01／06およびPHCAP-16〜20が現れ、UI工程の横断制約だけとは確定できない。artifact／state replayとPHCAP境界の直接責務を追加sourceで分解するまで未解決に保持する。", ["Prototype Builderのartifact／state replayとPHCAP-01／06の責務境界を示すcurrent contract", "UI artifactの観測・再生とPHCAP-16〜20の直接責務を分解する追加source", "phase／product authority reviewerのhuman decisionとconsumer closure"]),
    "IRUNIT-HIL-FR-19-HELIX-HARNESS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "原文はprototype版、ユーザー観測、requirements delta、L1反映先、再作成判断をboundedに反復して記録するWalkthrough Loopを要求する。Waveのasset検索候補にはPHCAP-15〜20が現れ、learning／improvementや継続再構成との接続をphase非適用と断定できない。walkthrough／iterationとPHCAP境界の追加source待ちに置く。", ["walkthrough／iteration checkpointとPHCAP-15／16／19／20の責務境界を示すcurrent contract", "requirements deltaからL1反映先へのauthority／consumer契約", "phase／product authority reviewerのhuman decisionとconsumer closure"]),
    "IRUNIT-HIL-FR-20-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "原文はartifact、walkthrough、要求反映、prototype agreementまたはskip receiptを検査し、不足時にL1 freezeとL3開始をfail-closeするScreen Gateを要求する。Waveのasset検索候補にはPHCAP-04／05／07／11およびPHCAP-16〜20が現れ、単なる横断gateともPHCAP直接機構とも確定できない。Gate authorityとPHCAP境界を追加source・human判断で分解するまで未解決に保持する。", ["Screen GateのL1 freeze／L3 fail-close authorityとPHCAP-04／05／07／11の境界契約", "artifact／walkthrough／skip receiptとPHCAP-16〜20の直接責務を分解する追加source", "phase／product authority reviewerのhuman decisionとconsumer closure"]),
    "IRUNIT-HIL-FR-21-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "source snapshot、ref、tree、entry、sealed mirror、stale条件を固定するsource custody契約。snapshot保持は要求収集／保持へ接続し得るため、全PHCAP-01〜20の直接性を除外する根拠がなくphase非適用は保留する。", ["source custodyとmemory／retention境界のhuman確認", "current source／consumer closureの追加evidence"]),
    "IRUNIT-HIL-FR-23-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "connector/schema、credential reference、read/write policy、sync、owner、enabled stateを束ねる統合境界契約。PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["connector boundaryと全PHCAP境界のhuman確認", "product／authority／consumer closure"]),
    "IRUNIT-HIL-FR-24-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "snapshot、watermark、provenance、freshness、tombstone、schema driftをread projectionへ投影する要求。retention／continuationとの境界を原文だけで除外できず、追加sourceとhuman判断が必要。", ["retention／purge／continuationを明示する現行data contract", "PHCAP-20境界のhuman decision", "consumer closureとproduct owner"]),
    "IRUNIT-HIL-FR-31-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "affected layerのstale化、再承認、re-freeze、Forward合流拒否を定めるre-entry契約。継続再構成に近い語を含むが、工程再承認のphase責務は追加sourceで確認する必要がある。", ["re-entryとPHCAP-20 continuationの現行契約境界", "phase／product authorityのhuman decision", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-FR-33-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "active surfaceからBun依存を抽出しclassified ledgerを作るcoverage／toolchain gate。CI／releaseの横断条件でありPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["HARNESS 全PHCAP境界レビューのhuman確認", "active surface／consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-FR-33-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "active Bun countを監査するdependency coverage条件。OSのCI／release境界を補助する横断制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["OS／HARNESS owner境界のhuman確認", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-FR-46-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "L1–L12 layer ledgerのnode／edge／authority／gate／revisionを登録するcatalog契約。phaseを実行する機構に見えるが、PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["layer ledgerとPHCAP capabilityの境界確認", "authority／consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-FR-52-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "Markdown、asset、event ledger、trace、projection、receiptのall-or-nothing更新とCASを定めるcanonicalization transaction。汎用atomicity／authority制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["canonicalizationとmemory／continuationの境界をhuman確認", "write authority／consumer closure"]),
    "IRUNIT-HIL-FR-53-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "immutable asset IDとrevision、rename／split／merge／supersedeの履歴を保つidentity契約。履歴はPHCAP-20 retentionへ接続し得るため、全PHCAP-01〜20の直接性を除外する根拠がなくphase非適用は保留する。", ["asset historyとPHCAP-20 retentionの境界確認", "authority／oracle／consumer closure"]),
    "IRUNIT-HIL-NFR-02-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "worker、verifier、knowledge promoterの自己承認を分離するrole／authority制約。memory昇格という語はあるが、PHCAP-01〜20の直接性を全て除外する根拠がなく、昇格権限の境界を定める。", ["knowledge promotionとPHCAP-20 ownershipのhuman確認", "role／consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-NFR-03-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "Reverse処理量、phase skip、未完obligation免除を禁止する工程契約。phase運用条件に見えるが、PHCAP-01〜20の直接性を全て除外する根拠がなくphase非適用は保留する。", ["工程契約と全PHCAP境界のhuman確認", "HARNESS owner／consumer closure"]),
    "IRUNIT-HIL-NFR-05-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "untrusted input、実行命令、metadata、evidenceの分離を定めるsecurity／intake境界。raw input intakeの安全制約でありPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["security boundaryのhuman確認", "product／consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-NFR-06-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "認証、認可、決済、PII、secret、license、migration、破壊的操作、外部infraのaction-binding approval条件。横断安全制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["安全境界と全PHCAP境界レビューのhuman確認", "authority／consumer closure"]),
    "IRUNIT-HIL-NFR-07-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "complexity、public surface、運用負債とminimum-necessary proofを用いるscope gate。拡張抑制の横断制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["scope gateとphase capabilityの境界確認", "authority／consumer closure"]),
    "IRUNIT-HIL-NFR-11-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "画面対象／非対象のprototype／skip条件を定めるUI工程制約。画面工程の適用条件でありPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["FR-17／FR-20との重複atomをhuman確認", "product／consumer closure"]),
    "IRUNIT-HIL-NFR-12-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "source coverage、path／entry、digest、抽出時点への再現可能なcustodyを要求する完全性条件。保持機構へ接続し得るため、PHCAP-01〜20の直接性を全て除外する根拠がなくphase非適用は保留する。", ["source custodyとretentionの境界確認", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-NFR-23-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "scope derivation graphのacyclic root到達とcycle拒否を要求する構造制約。graph integrityの横断条件でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["graph constraintとphase capabilityの境界確認", "authority／consumer closure"]),
    "IRUNIT-HIL-NFR-30-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "可逆なAuthoring変更を自動Canonical化し真のauthority境界だけをescalateする要求。人間判断抑制とcanonicalizationの現行authority契約が不足し、PHCAP直接性を確定しない。", ["current authoring／canonicalization contract", "authority boundaryのhuman decision", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-NFR-31-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "Authoring正本、ledger、trace、projection、receiptのall-or-nothingとfault後partial state 0件を要求するatomicity制約。PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["atomicityとmemory／continuation境界のhuman確認", "authority／consumer closure"]),
    "IRUNIT-HIL-NFR-32-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "意味変更時のauthority、impact、pair、oracle、rollback、stale propagationの同時成立を要求するrevision制約。汎用変更管理でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["revision／rollbackとretentionの境界確認", "authority／consumer closure"]),
    "IRUNIT-HIL-TR-04-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "Linux、macOS、Windowsのportable／compatibility profileを定めるruntime portability条件。環境制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["HARNESS portabilityとしてのhuman確認", "product／consumer closure"]),
    "IRUNIT-HIL-TR-04-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "Linux、macOS、Windowsのportable／compatibility profileを定めるOS運転環境条件。環境制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["OS portability／authority境界のhuman確認", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-TR-07-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW", "SQLite event／projection backboneとPython read model／Node write authorityの分離を定める実装境界。generic state／eventだけではPHCAP-20直接性を除外できず、L4決定と現行sourceが必要。", ["L4 write authority decision recordとstate／continuation contract", "PHCAP境界のhuman decision", "consumer closureとsuccessor assignment"]),
    "IRUNIT-HIL-TR-08-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING", "Node↔Pythonのversioned JSON Lines IPC envelope、stdout／stderr、sequence、deadline、payload digestを定めるtransport contract。PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。", ["HARNESS transport contractとしてのhuman確認", "product／consumer closureとsuccessor assignment"]),
}

MATRIX = {
    "M-CROSS-CONSTRAINT-REVIEW": {
        "status": "CROSS_CUTTING_PHASE_REVIEW_PENDING",
        "exclusive_group": "phase-status-primary",
        "rule": "原文の主体がprotocol、security、custody、gate、portability、atomicity、identity、工程制約のいずれかに見える場合でも、PHCAP-20の不在だけからphase非適用を導かない。PHCAP-01〜20の全境界をunit原文・Wave候補・現行境界sourceで照合するまで横断制約らしさのレビュー保留として記録する。",
        "required_evidence": ["exact source anchor", "Wave edge is candidate-only or contract-only", "all PHCAP-01〜20 boundary review", "phase／authority human decision"],
        "next_decision": "全PHCAP境界の追加source、phase／product authority reviewerのhuman decision、consumer closure",
    },
    "M-WAIT-SOURCE-AUTHORITY": {
        "status": "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW",
        "exclusive_group": "phase-status-primary",
        "rule": "原文のsource custody、要求定義、authority、product boundaryが未閉包で、静的原文だけではphaseの非適用も直接性も確定できない場合は追加sourceとhuman判断待ちに置く。",
        "required_evidence": ["exact source anchor", "current contract or independent source", "product／authority human decision"],
        "next_decision": "追加source、product／authority判断、consumer closure",
    },
    "M-WAIT-PHCAP-BOUNDARY": {
        "status": "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW",
        "exclusive_group": "phase-status-primary",
        "rule": "re-entry、snapshot、retention、state、prototype、walkthrough、screen gate、canonicalization等がPHCAP語彙または複数PHCAP候補と接続し、原文・unit evidenceだけでは直接責務を除外できない場合は、phase非適用へ倒さずPHCAP境界の追加sourceとhuman判断待ちに置く。assetのcandidate_phase_targetsはauthorityではないが、unit自身のsource semanticsと併せて境界未解決を示す。",
        "required_evidence": ["exact source anchor", "PHCAP boundary contract", "unit-level candidate phase evidence", "phase／authority human decision"],
        "next_decision": "PHCAP境界source、human phase authority review、consumer closure",
    },
}


def digest(raw: bytes) -> str:
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def base_bytes(relative: str) -> bytes:
    result = subprocess.run(
        ["git", "show", f"{BASE_COMMIT}:{relative}"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        raise ValueError(f"missing BASE input: {relative}")
    return result.stdout


def base_json(relative: str):
    return json.loads(base_bytes(relative).decode("utf-8"))


def base_jsonl(relative: str) -> list[dict]:
    return [json.loads(line) for line in base_bytes(relative).decode("utf-8").splitlines() if line.strip()]


def input_paths() -> list[tuple[str, str]]:
    primary = [
        ("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", "crosswalk"),
        ("archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json", "legacy_ir"),
        ("docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl", "decomposition"),
        ("docs/governance/legacy-asset-disposition.jsonl", "asset_disposition"),
        ("docs/governance/legacy-asset-decisions.jsonl", "asset_decisions"),
        ("docs/governance/legacy-asset-copy-read-after.jsonl", "asset_copy_read_after"),
        ("docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "phase_product_classification"),
        ("docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json", "phase_product_classification_meta"),
        (f"{PARENT}/inventory.json", "parent_phase_gap_inventory"),
        (f"{PARENT}/units.jsonl", "parent_phase_gap_units"),
        (f"{PARENT}/edges.jsonl", "parent_phase_gap_edges"),
    ]
    context = [
        ("docs/governance/new-generation-start-here.md", "generation_entry"),
        ("docs/governance/legacy-asset-reuse-control.md", "legacy_read_only_control"),
        ("docs/governance/audits/source-rebaseline/legacy-phase-product-classification-method-2026-09-20.md", "phase_classification_contract"),
        ("docs/governance/phase-capability-inventory.json", "phase_capability_inventory"),
        ("docs/governance/phase-capability-inventory.md", "phase_capability_contract"),
        ("scaffold/phcap20-memory-research/README.md", "phcap20_definition"),
        ("scaffold/phcap20-memory-research/inventory.json", "phcap20_inventory"),
        ("docs/concept/product-boundary.md", "product_boundary"),
        ("docs/helix-harness/L1-planning/product-intent.md", "harness_l1"),
        ("docs/helix-os/L1-planning/system-intent.md", "os_l1"),
        ("docs/helix-web/L1-planning/product-intent.md", "web_l1"),
        ("docs/helix-web-os/L1-planning/system-intent.md", "web_os_l1"),
    ]
    waves = [(path, "semantic_review_wave") for path in WAVE_REL]
    return primary + context + waves


def make_bundle() -> None:
    parent_units = {row["unit_candidate_id"]: row for row in base_jsonl(f"{PARENT}/units.jsonl")}
    parent_edges = base_jsonl(f"{PARENT}/edges.jsonl")
    edge_by_review = {edge["review_id"]: edge for edge in parent_edges}
    edges_by_unit = {
        unit_id: [edge_by_review[review_id] for review_id in parent["wave_review"]["edge_refs"]]
        for unit_id, parent in parent_units.items()
    }
    crosswalk = base_jsonl("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl")
    targets = [row for row in crosswalk if row.get("phase_classification_status") == "unresolved"]
    target_ids = [row["unit_candidate_id"] for row in targets]
    if len(target_ids) != 30 or len(set(target_ids)) != 30 or set(target_ids) != set(parent_units):
        raise ValueError("SCF-B-0101 unresolved target set is not exactly 30")
    if set(target_ids) != set(CLASSIFICATION):
        missing = sorted(set(target_ids) - set(CLASSIFICATION))
        extra = sorted(set(CLASSIFICATION) - set(target_ids))
        raise ValueError(f"classification mapping coverage mismatch missing={missing} extra={extra}")

    units = []
    for row in targets:
        unit_id = row["unit_candidate_id"]
        parent = parent_units[unit_id]
        matrix_id, taxonomy_status, candidate, waiting = CLASSIFICATION[unit_id]
        source = parent["source"]
        edge_rows = sorted(edges_by_unit.get(unit_id, []), key=lambda item: item["review_id"])
        units.append({
            "unit_candidate_id": unit_id,
            "requirement_id": parent["requirement_id"],
            "crosswalk_id": parent["crosswalk_id"],
            "product_scope_candidate": parent["product_scope_candidate"],
            "taxonomy": {
                "matrix_rule_id": matrix_id,
                "status": taxonomy_status,
                "authority_phase_status": "unchanged_unresolved",
                "formal_phase_candidate": None,
                "candidate_statement": candidate,
                "candidate_is_research_only": True,
                "direct_phase_candidate_count": 0,
                "judgment_waiting": {
                    "status": "pending_human_or_additional_source",
                    "items": waiting,
                    "authority_effect": "none",
                    "new_build_allowed": False,
                },
            },
            "source_anchor": {
                "archive_path": source["archive_path"],
                "json_pointer": source["json_pointer"],
                "line_start": source["archive_line_start"],
                "line_end": source["archive_line_end"],
                "statement_semantic_digest": source["statement_semantic_digest"],
                "statement_text": source["statement_text"],
                "source_text_spans": source["source_text_spans"],
            },
            "wave_review": {
                "edge_refs": parent["wave_review"]["edge_refs"],
                "edge_count": parent["wave_review"]["edge_count"],
                "status_counts": {
                    "confirmed": parent["wave_review"]["confirmed_edge_count"],
                    "unresolved": parent["wave_review"]["unresolved_edge_count"],
                    "rejected": parent["wave_review"]["rejected_edge_count"],
                },
                "asset_candidate_phase_targets": parent["wave_review"]["asset_candidate_phase_targets"],
                "direct_phase_candidates_from_edges": parent["wave_review"]["direct_phase_candidates_from_edges"],
                "edges": edge_rows,
                "candidate_semantics": "asset_search_candidate_only; no phase authority",
            },
            "legacy_asset_evidence": copy.deepcopy(parent["legacy_assets"]),
            "phase_context": {
                "phcap20_direct_rule": "memory／continuation／handover／retention responsibility must be directly evidenced; generic state／ledger／event／process terms remain unresolved",
                "phcap_boundary_review": {
                    "phase_ids": PHCAP_PHASE_IDS,
                    "status": "pending_all_20",
                    "non_applicability_proven": False,
                    "excluded_phase_ids": [],
                    "observed_candidate_phase_ids": parent["wave_review"]["asset_candidate_phase_targets"],
                    "basis": "full PHCAP-01〜20 boundary review is required before any phase-non-applicability judgment",
                },
                "parent_direct_phase_candidates": parent["phase_classification"]["eligible_phase_candidates"],
                "observed_asset_candidate_phases": parent["wave_review"]["asset_candidate_phase_targets"],
                "phase_authority_status": "unchanged_unresolved",
            },
            "product_context": {
                "candidate_products": parent["product_classification"]["candidate_products"],
                "authority_product": None,
                "l1_context_only": True,
            },
            "authority_boundary": {
                "formal_crosswalk_modified": False,
                "formal_phase_authority_modified": False,
                "formal_product_authority_modified": False,
                "new_build_allowed": False,
                "successor_assigned": False,
                "consumer_closure_generated": False,
            },
        })

    input_digests = [
        {"path": path, "kind": kind, "sha256": digest(base_bytes(path))}
        for path, kind in input_paths()
    ]
    parent_inventory = base_json(f"{PARENT}/inventory.json")
    phcap_refs = [
        {"path": item["path"], "role": item["role"], "sha256": item["sha256"]}
        for item in parent_inventory["phcap20_definition"]["definition_refs"]
    ]
    inventory = {
        "schema": "phase-status-taxonomy-0105/v1",
        "binding_id": "SCF-B-0105",
        "status": "research_candidate",
        "authority_effect": "none",
        "base": {"repository": "HELIX-HARNESS", "commit": BASE_COMMIT, "branch": "main", "ancestor_required": True},
        "new_build_allowed": False,
        "scope": {
            "parent_binding_id": "SCF-B-0101",
            "target_crosswalk_status": "unresolved",
            "unit_count": len(units),
            "target_product_counts": {"HELIX-OS": 24, "HELIX-HARNESS": 6},
            "target_unit_ids": target_ids,
            "wave_edge_count": sum(unit["wave_review"]["edge_count"] for unit in units),
            "legacy_asset_count": len({asset["asset_id"] for unit in units for asset in unit["legacy_asset_evidence"]}),
        },
        "taxonomy": {
            "version": "phase-status-taxonomy-0105/v1",
            "primary_statuses": sorted(TAXONOMY_STATUS),
            "status_counts": {status: sum(unit["taxonomy"]["status"] == status for unit in units) for status in sorted(TAXONOMY_STATUS)},
            "matrix_rule_ids": sorted(MATRIX),
            "all_statuses_remain_unresolved": True,
            "full_phcap_boundary_review": {
                "phase_ids": PHCAP_PHASE_IDS,
                "status": "pending_all_20",
                "non_applicability_proven": False,
            },
        },
        "decision_matrix": MATRIX,
        "phcap20_definition_refs": phcap_refs,
        "input_snapshot": {"mode": "git_object", "commit": BASE_COMMIT, "live_input_gate": False},
        "input_digests": input_digests,
        "authority_boundary": {
            "formal_crosswalk_modified": False,
            "formal_phase_inventory_modified": False,
            "formal_product_authority_modified": False,
            "phase_promoted": False,
            "product_promoted": False,
            "successor_assigned": False,
            "consumer_closure_generated": False,
            "old_archive_executed": False,
        },
        "negative_case_codes": [
            "E_TARGET_SET", "E_BASE_COMMIT", "E_BASE_NOT_ANCESTOR", "E_SOURCE_INPUT_DIGEST",
            "E_SOURCE_ANCHOR", "E_WAVE_EDGE_COVERAGE", "E_ASSET_EVIDENCE", "E_TAXONOMY_COVERAGE",
            "E_TAXONOMY_STATUS", "E_PHCAP_BOUNDARY_CLASSIFICATION", "E_PHCAP_BOUNDARY_COVERAGE", "E_MATRIX_RULE", "E_PHASE_AUTHORITY_SEPARATION", "E_PRODUCT_AUTHORITY_SEPARATION",
            "E_AUTHORITY_BOUNDARY",
        ],
    }
    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (HERE / "decision-matrix.json").write_text(json.dumps(MATRIX, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (HERE / "units.jsonl").open("w", encoding="utf-8") as stream:
        for unit in units:
            stream.write(json.dumps(unit, ensure_ascii=False, sort_keys=True) + "\n")
    print(f"generated SCF-B-0105 bundle: units={len(units)} cross_cutting_review_pending={inventory['taxonomy']['status_counts']['CROSS_CUTTING_PHASE_REVIEW_PENDING']} unresolved={inventory['taxonomy']['status_counts']['UNRESOLVED_SOURCE_OR_HUMAN_REVIEW']}")


if __name__ == "__main__":
    make_bundle()
