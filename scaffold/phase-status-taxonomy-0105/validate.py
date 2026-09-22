#!/usr/bin/env python3
"""Fail-closed validator for the SCF-B-0105 research taxonomy."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parents[1]
BASE_COMMIT = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
PARENT = "scaffold/legacy-phase-gap-review-0101"
WAVE_REL = [
    *(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)),
    *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51)),
]
EXPECTED_STATUSES = {"CROSS_CUTTING_PHASE_REVIEW_PENDING", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"}
EXPECTED_MATRIX = {"M-CROSS-CONSTRAINT-REVIEW", "M-WAIT-SOURCE-AUTHORITY", "M-WAIT-PHCAP-BOUNDARY"}
EXPECTED_PRODUCTS = {"HELIX-OS": 24, "HELIX-HARNESS": 6}
EXPECTED_CODES = [
    "E_TARGET_SET", "E_BASE_COMMIT", "E_BASE_NOT_ANCESTOR", "E_SOURCE_INPUT_DIGEST",
    "E_SOURCE_ANCHOR", "E_WAVE_EDGE_COVERAGE", "E_ASSET_EVIDENCE", "E_TAXONOMY_COVERAGE",
    "E_TAXONOMY_STATUS", "E_PHCAP_BOUNDARY_CLASSIFICATION", "E_PHCAP_BOUNDARY_COVERAGE", "E_MATRIX_RULE", "E_TAXONOMY_EXPECTATION", "E_TAXONOMY_EVIDENCE_JOIN", "E_INVENTORY_DECLARATION", "E_UNIT_DECLARATION", "E_PHASE_AUTHORITY_SEPARATION", "E_PRODUCT_AUTHORITY_SEPARATION",
    "E_AUTHORITY_BOUNDARY",
]

PHCAP_BOUNDARY_UNITS = {
    "IRUNIT-HIL-FR-18-HELIX-OS",
    "IRUNIT-HIL-FR-19-HELIX-HARNESS",
    "IRUNIT-HIL-FR-20-HELIX-OS",
}
PHCAP_PHASE_IDS = [f"PHCAP-{index:02d}" for index in range(1, 21)]
PHCAP20_DIRECT_RULE = "memory／continuation／handover／retention responsibility must be directly evidenced; generic state／ledger／event／process terms remain unresolved"

# This is the fixed research expectation for the 30 BASE target units.  It is
# deliberately separate from the bundle so a status-count mutation cannot make
# an arbitrary reassignment appear valid.
EXPECTED_RULE_MAP = {
    "IRUNIT-HIL-BR-14-HELIX-OS": ("M-WAIT-SOURCE-AUTHORITY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-BR-24-HELIX-OS": ("M-WAIT-SOURCE-AUTHORITY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-17-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-18-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-19-HELIX-HARNESS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-20-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-21-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-FR-23-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-FR-24-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-31-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-FR-33-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-FR-33-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-FR-46-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-FR-52-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-FR-53-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-02-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-03-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-05-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-06-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-07-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-11-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-12-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-23-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-30-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-NFR-31-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-NFR-32-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-TR-04-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-TR-04-HELIX-OS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
    "IRUNIT-HIL-TR-07-HELIX-OS": ("M-WAIT-PHCAP-BOUNDARY", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"),
    "IRUNIT-HIL-TR-08-HELIX-HARNESS": ("M-CROSS-CONSTRAINT-REVIEW", "CROSS_CUTTING_PHASE_REVIEW_PENDING"),
}
# Independent expected values for the fixed BASE research bundle.  These constants
# deliberately do not import the generator, so changing generation logic and the
# bundle together cannot make the validator accept a phase or authority claim.
EXPECTED_CANDIDATE_STATEMENTS = {'IRUNIT-HIL-BR-14-HELIX-OS': 'ref authority、atomic decomposition、採否からGateまでのtraceを一つに束ねる要求。source '
                              'custodyとproduct／authority境界を追加sourceとhuman判断で確認するまで、横断制約ともPHCAP直接機構とも確定しない。',
 'IRUNIT-HIL-BR-24-HELIX-OS': '原子要求、authority、分類、acceptance、capability、template、revisionの履歴を結ぶ要求定義契約。要件登録・分類・受入のphase境界は追加sourceとhuman判断が必要。',
 'IRUNIT-HIL-FR-17-HELIX-OS': 'screen applicability、skip receipt、再entry '
                              'triggerを定める工程gate。再entryはPHCAP-20のcontinuationと語が近いが、原文は画面工程の判定契約であり直接責務を確定できない。',
 'IRUNIT-HIL-FR-18-HELIX-OS': '原文はscreen ID、操作、遷移、9状態fixture、仮データ境界を実行可能artifactへ材料化するPrototype '
                              'Builderを要求する。Waveのasset検索候補にはPHCAP-01／06およびPHCAP-16〜20が現れ、UI工程の横断制約だけとは確定できない。artifact／state '
                              'replayとPHCAP境界の直接責務を追加sourceで分解するまで未解決に保持する。',
 'IRUNIT-HIL-FR-19-HELIX-HARNESS': '原文はprototype版、ユーザー観測、requirements delta、L1反映先、再作成判断をboundedに反復して記録するWalkthrough '
                                   'Loopを要求する。Waveのasset検索候補にはPHCAP-15〜20が現れ、learning／improvementや継続再構成との接続をphase非適用と断定できない。walkthrough／iterationとPHCAP境界の追加source待ちに置く。',
 'IRUNIT-HIL-FR-20-HELIX-OS': '原文はartifact、walkthrough、要求反映、prototype agreementまたはskip receiptを検査し、不足時にL1 '
                              'freezeとL3開始をfail-closeするScreen '
                              'Gateを要求する。Waveのasset検索候補にはPHCAP-04／05／07／11およびPHCAP-16〜20が現れ、単なる横断gateともPHCAP直接機構とも確定できない。Gate '
                              'authorityとPHCAP境界を追加source・human判断で分解するまで未解決に保持する。',
 'IRUNIT-HIL-FR-21-HELIX-OS': 'source snapshot、ref、tree、entry、sealed mirror、stale条件を固定するsource '
                              'custody契約。snapshot保持は要求収集／保持へ接続し得るため、全PHCAP-01〜20の直接性を除外する根拠がなくphase非適用は保留する。',
 'IRUNIT-HIL-FR-23-HELIX-OS': 'connector/schema、credential reference、read/write policy、sync、owner、enabled '
                              'stateを束ねる統合境界契約。PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-FR-24-HELIX-OS': 'snapshot、watermark、provenance、freshness、tombstone、schema driftをread '
                              'projectionへ投影する要求。retention／continuationとの境界を原文だけで除外できず、追加sourceとhuman判断が必要。',
 'IRUNIT-HIL-FR-31-HELIX-OS': 'affected '
                              'layerのstale化、再承認、re-freeze、Forward合流拒否を定めるre-entry契約。継続再構成に近い語を含むが、工程再承認のphase責務は追加sourceで確認する必要がある。',
 'IRUNIT-HIL-FR-33-HELIX-HARNESS': 'active surfaceからBun依存を抽出しclassified ledgerを作るcoverage／toolchain '
                                   'gate。CI／releaseの横断条件でありPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-FR-33-HELIX-OS': 'active Bun countを監査するdependency '
                              'coverage条件。OSのCI／release境界を補助する横断制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-FR-46-HELIX-OS': 'L1–L12 layer '
                              'ledgerのnode／edge／authority／gate／revisionを登録するcatalog契約。phaseを実行する機構に見えるが、PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-FR-52-HELIX-OS': 'Markdown、asset、event '
                              'ledger、trace、projection、receiptのall-or-nothing更新とCASを定めるcanonicalization '
                              'transaction。汎用atomicity／authority制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-FR-53-HELIX-OS': 'immutable asset IDとrevision、rename／split／merge／supersedeの履歴を保つidentity契約。履歴はPHCAP-20 '
                              'retentionへ接続し得るため、全PHCAP-01〜20の直接性を除外する根拠がなくphase非適用は保留する。',
 'IRUNIT-HIL-NFR-02-HELIX-HARNESS': 'worker、verifier、knowledge '
                                    'promoterの自己承認を分離するrole／authority制約。memory昇格という語はあるが、PHCAP-01〜20の直接性を全て除外する根拠がなく、昇格権限の境界を定める。',
 'IRUNIT-HIL-NFR-03-HELIX-HARNESS': 'Reverse処理量、phase '
                                    'skip、未完obligation免除を禁止する工程契約。phase運用条件に見えるが、PHCAP-01〜20の直接性を全て除外する根拠がなくphase非適用は保留する。',
 'IRUNIT-HIL-NFR-05-HELIX-OS': 'untrusted input、実行命令、metadata、evidenceの分離を定めるsecurity／intake境界。raw input '
                               'intakeの安全制約でありPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-NFR-06-HELIX-OS': '認証、認可、決済、PII、secret、license、migration、破壊的操作、外部infraのaction-binding '
                               'approval条件。横断安全制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-NFR-07-HELIX-OS': 'complexity、public surface、運用負債とminimum-necessary proofを用いるscope '
                               'gate。拡張抑制の横断制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-NFR-11-HELIX-OS': '画面対象／非対象のprototype／skip条件を定めるUI工程制約。画面工程の適用条件でありPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-NFR-12-HELIX-OS': 'source '
                               'coverage、path／entry、digest、抽出時点への再現可能なcustodyを要求する完全性条件。保持機構へ接続し得るため、PHCAP-01〜20の直接性を全て除外する根拠がなくphase非適用は保留する。',
 'IRUNIT-HIL-NFR-23-HELIX-OS': 'scope derivation graphのacyclic root到達とcycle拒否を要求する構造制約。graph '
                               'integrityの横断条件でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-NFR-30-HELIX-OS': '可逆なAuthoring変更を自動Canonical化し真のauthority境界だけをescalateする要求。人間判断抑制とcanonicalizationの現行authority契約が不足し、PHCAP直接性を確定しない。',
 'IRUNIT-HIL-NFR-31-HELIX-OS': 'Authoring正本、ledger、trace、projection、receiptのall-or-nothingとfault後partial state '
                               '0件を要求するatomicity制約。PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-NFR-32-HELIX-OS': '意味変更時のauthority、impact、pair、oracle、rollback、stale '
                               'propagationの同時成立を要求するrevision制約。汎用変更管理でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-TR-04-HELIX-HARNESS': 'Linux、macOS、Windowsのportable／compatibility profileを定めるruntime '
                                   'portability条件。環境制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-TR-04-HELIX-OS': 'Linux、macOS、Windowsのportable／compatibility '
                              'profileを定めるOS運転環境条件。環境制約でPHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。',
 'IRUNIT-HIL-TR-07-HELIX-OS': 'SQLite event／projection backboneとPython read model／Node write '
                              'authorityの分離を定める実装境界。generic state／eventだけではPHCAP-20直接性を除外できず、L4決定と現行sourceが必要。',
 'IRUNIT-HIL-TR-08-HELIX-HARNESS': 'Node↔Pythonのversioned JSON Lines IPC '
                                   'envelope、stdout／stderr、sequence、deadline、payload digestを定めるtransport '
                                   'contract。PHCAP-01〜20の直接性を全て除外する根拠がなく、phase非適用は保留する。'}
EXPECTED_JUDGMENT_WAITING_ITEMS = {'IRUNIT-HIL-BR-14-HELIX-OS': ['旧IR source spanとref authority receiptの独立確認',
                               'product unit／connectionのhuman decision',
                               'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-BR-24-HELIX-OS': ['現行要求定義契約とPHCAP-02〜07の対応source',
                               'product／authorityのhuman decision',
                               'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-FR-17-HELIX-OS': ['skip／reentryの現行契約とcontinuation責務の境界source',
                               'phase authority reviewerのhuman decision',
                               'product ownerとconsumer closure'],
 'IRUNIT-HIL-FR-18-HELIX-OS': ['Prototype Builderのartifact／state replayとPHCAP-01／06の責務境界を示すcurrent contract',
                               'UI artifactの観測・再生とPHCAP-16〜20の直接責務を分解する追加source',
                               'phase／product authority reviewerのhuman decisionとconsumer closure'],
 'IRUNIT-HIL-FR-19-HELIX-HARNESS': ['walkthrough／iteration checkpointとPHCAP-15／16／19／20の責務境界を示すcurrent contract',
                                    'requirements deltaからL1反映先へのauthority／consumer契約',
                                    'phase／product authority reviewerのhuman decisionとconsumer closure'],
 'IRUNIT-HIL-FR-20-HELIX-OS': ['Screen GateのL1 freeze／L3 fail-close authorityとPHCAP-04／05／07／11の境界契約',
                               'artifact／walkthrough／skip receiptとPHCAP-16〜20の直接責務を分解する追加source',
                               'phase／product authority reviewerのhuman decisionとconsumer closure'],
 'IRUNIT-HIL-FR-21-HELIX-OS': ['source custodyとmemory／retention境界のhuman確認',
                               'current source／consumer closureの追加evidence'],
 'IRUNIT-HIL-FR-23-HELIX-OS': ['connector boundaryと全PHCAP境界のhuman確認', 'product／authority／consumer closure'],
 'IRUNIT-HIL-FR-24-HELIX-OS': ['retention／purge／continuationを明示する現行data contract',
                               'PHCAP-20境界のhuman decision',
                               'consumer closureとproduct owner'],
 'IRUNIT-HIL-FR-31-HELIX-OS': ['re-entryとPHCAP-20 continuationの現行契約境界',
                               'phase／product authorityのhuman decision',
                               'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-FR-33-HELIX-HARNESS': ['HARNESS 全PHCAP境界レビューのhuman確認',
                                    'active surface／consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-FR-33-HELIX-OS': ['OS／HARNESS owner境界のhuman確認', 'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-FR-46-HELIX-OS': ['layer ledgerとPHCAP capabilityの境界確認', 'authority／consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-FR-52-HELIX-OS': ['canonicalizationとmemory／continuationの境界をhuman確認', 'write authority／consumer closure'],
 'IRUNIT-HIL-FR-53-HELIX-OS': ['asset historyとPHCAP-20 retentionの境界確認', 'authority／oracle／consumer closure'],
 'IRUNIT-HIL-NFR-02-HELIX-HARNESS': ['knowledge promotionとPHCAP-20 ownershipのhuman確認',
                                     'role／consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-NFR-03-HELIX-HARNESS': ['工程契約と全PHCAP境界のhuman確認', 'HARNESS owner／consumer closure'],
 'IRUNIT-HIL-NFR-05-HELIX-OS': ['security boundaryのhuman確認', 'product／consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-NFR-06-HELIX-OS': ['安全境界と全PHCAP境界レビューのhuman確認', 'authority／consumer closure'],
 'IRUNIT-HIL-NFR-07-HELIX-OS': ['scope gateとphase capabilityの境界確認', 'authority／consumer closure'],
 'IRUNIT-HIL-NFR-11-HELIX-OS': ['FR-17／FR-20との重複atomをhuman確認', 'product／consumer closure'],
 'IRUNIT-HIL-NFR-12-HELIX-OS': ['source custodyとretentionの境界確認', 'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-NFR-23-HELIX-OS': ['graph constraintとphase capabilityの境界確認', 'authority／consumer closure'],
 'IRUNIT-HIL-NFR-30-HELIX-OS': ['current authoring／canonicalization contract',
                                'authority boundaryのhuman decision',
                                'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-NFR-31-HELIX-OS': ['atomicityとmemory／continuation境界のhuman確認', 'authority／consumer closure'],
 'IRUNIT-HIL-NFR-32-HELIX-OS': ['revision／rollbackとretentionの境界確認', 'authority／consumer closure'],
 'IRUNIT-HIL-TR-04-HELIX-HARNESS': ['HARNESS portabilityとしてのhuman確認', 'product／consumer closure'],
 'IRUNIT-HIL-TR-04-HELIX-OS': ['OS portability／authority境界のhuman確認', 'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-TR-07-HELIX-OS': ['L4 write authority decision recordとstate／continuation contract',
                               'PHCAP境界のhuman decision',
                               'consumer closureとsuccessor assignment'],
 'IRUNIT-HIL-TR-08-HELIX-HARNESS': ['HARNESS transport contractとしてのhuman確認',
                                    'product／consumer closureとsuccessor assignment']}
EXPECTED_EVIDENCE_JOINS = {'M-CROSS-CONSTRAINT-REVIEW': {'exact source anchor': ['source_anchor'],
                               'Wave edge is candidate-only or contract-only': ['wave_review.edges',
                                                                                'wave_review.candidate_semantics'],
                               'all PHCAP-01〜20 boundary review': ['phase_context.phcap_boundary_review'],
                               'phase／authority human decision': ['taxonomy.judgment_waiting.items']},
 'M-WAIT-SOURCE-AUTHORITY': {'exact source anchor': ['source_anchor'],
                             'current contract or independent source': ['source_anchor',
                                                                        'taxonomy.judgment_waiting.items'],
                             'product／authority human decision': ['product_context',
                                                                  'taxonomy.judgment_waiting.items']},
 'M-WAIT-PHCAP-BOUNDARY': {'exact source anchor': ['source_anchor'],
                           'PHCAP boundary contract': ['phase_context.phcap_boundary_review'],
                           'unit-level candidate phase evidence': ['phase_context.observed_asset_candidate_phases',
                                                                   'wave_review.asset_candidate_phase_targets'],
                           'phase／authority human decision': ['taxonomy.judgment_waiting.items']}}



def error(errors: list[str], code: str, detail: str = "") -> None:
    errors.append(code + (":" + detail if detail else ""))


def digest(raw: bytes) -> str:
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def base_bytes(path: Path, root: Path) -> bytes | None:
    try:
        relative = path.relative_to(root).as_posix()
    except ValueError:
        return None
    result = subprocess.run(
        ["git", "show", f"{BASE_COMMIT}:{relative}"],
        cwd=root,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.stdout if result.returncode == 0 else None


def base_json(path: Path, root: Path):
    raw = base_bytes(path, root)
    if raw is None:
        raise ValueError(f"missing BASE source: {path}")
    return json.loads(raw.decode("utf-8"))


def base_jsonl(path: Path, root: Path) -> list[dict]:
    raw = base_bytes(path, root)
    if raw is None:
        return []
    return [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def expected_input_kinds() -> dict[str, str]:
    primary = {
        "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl": "crosswalk",
        "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json": "legacy_ir",
        "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl": "decomposition",
        "docs/governance/legacy-asset-disposition.jsonl": "asset_disposition",
        "docs/governance/legacy-asset-decisions.jsonl": "asset_decisions",
        "docs/governance/legacy-asset-copy-read-after.jsonl": "asset_copy_read_after",
        "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl": "phase_product_classification",
        "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json": "phase_product_classification_meta",
        f"{PARENT}/inventory.json": "parent_phase_gap_inventory",
        f"{PARENT}/units.jsonl": "parent_phase_gap_units",
        f"{PARENT}/edges.jsonl": "parent_phase_gap_edges",
    }
    context = {
        "docs/governance/new-generation-start-here.md": "generation_entry",
        "docs/governance/legacy-asset-reuse-control.md": "legacy_read_only_control",
        "docs/governance/audits/source-rebaseline/legacy-phase-product-classification-method-2026-09-20.md": "phase_classification_contract",
        "docs/governance/phase-capability-inventory.json": "phase_capability_inventory",
        "docs/governance/phase-capability-inventory.md": "phase_capability_contract",
        "scaffold/phcap20-memory-research/README.md": "phcap20_definition",
        "scaffold/phcap20-memory-research/inventory.json": "phcap20_inventory",
        "docs/concept/product-boundary.md": "product_boundary",
        "docs/helix-harness/L1-planning/product-intent.md": "harness_l1",
        "docs/helix-os/L1-planning/system-intent.md": "os_l1",
        "docs/helix-web/L1-planning/product-intent.md": "web_l1",
        "docs/helix-web-os/L1-planning/system-intent.md": "web_os_l1",
    }
    return {**primary, **context, **{path: "semantic_review_wave" for path in WAVE_REL}}


def validate(bundle: Path = HERE, root: Path = DEFAULT_ROOT, head_ref: str = "HEAD") -> list[str]:
    errors: list[str] = []
    try:
        inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
        matrix = json.loads((bundle / "decision-matrix.json").read_text(encoding="utf-8"))
        units = jsonl(bundle / "units.jsonl")
    except Exception as exc:
        return ["E_BUNDLE_READ:" + str(exc)]

    if inventory.get("schema") != "phase-status-taxonomy-0105/v1": error(errors, "E_SCHEMA")
    if inventory.get("binding_id") != "SCF-B-0105": error(errors, "E_BINDING_ID")
    if inventory.get("status") != "research_candidate": error(errors, "E_INVENTORY_DECLARATION", "status")
    if inventory.get("authority_effect") != "none": error(errors, "E_AUTHORITY_BOUNDARY", "authority_effect")
    if inventory.get("new_build_allowed") is not False: error(errors, "E_AUTHORITY_BOUNDARY", "new_build_allowed")

    base = inventory.get("base", {})
    if base.get("repository") != "HELIX-HARNESS" or base.get("commit") != BASE_COMMIT or base.get("branch") != "main" or base.get("ancestor_required") is not True:
        error(errors, "E_BASE_COMMIT")
    else:
        ancestor = subprocess.run(
            ["git", "merge-base", "--is-ancestor", BASE_COMMIT, head_ref],
            cwd=root,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        if ancestor.returncode != 0:
            error(errors, "E_BASE_NOT_ANCESTOR")

    if inventory.get("input_snapshot") != {"mode": "git_object", "commit": BASE_COMMIT, "live_input_gate": False}:
        error(errors, "E_SOURCE_INPUT_DIGEST", "snapshot")
    expected_inputs = expected_input_kinds()
    recorded_inputs = inventory.get("input_digests", [])
    recorded_map = {item.get("path"): item for item in recorded_inputs}
    if len(recorded_inputs) != len(expected_inputs) or set(recorded_map) != set(expected_inputs):
        error(errors, "E_SOURCE_INPUT_DIGEST", "path_set")
    for relative, kind in expected_inputs.items():
        item = recorded_map.get(relative)
        raw = base_bytes(root / relative, root)
        if item is None or item.get("kind") != kind or raw is None or item.get("sha256") != digest(raw):
            error(errors, "E_SOURCE_INPUT_DIGEST", relative)

    parent_units = {row["unit_candidate_id"]: row for row in base_jsonl(root / f"{PARENT}/units.jsonl", root)}
    parent_edges = base_jsonl(root / f"{PARENT}/edges.jsonl", root)
    edge_by_review = {edge["review_id"]: edge for edge in parent_edges}
    edges_by_unit = {
        unit_id: [edge_by_review[review_id] for review_id in parent["wave_review"]["edge_refs"]]
        for unit_id, parent in parent_units.items()
    }
    disposition = {row["asset_id"]: row for row in base_jsonl(root / "docs/governance/legacy-asset-disposition.jsonl", root)}
    classification = {row["asset_id"]: row for row in base_jsonl(root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", root)}
    crosswalk = base_jsonl(root / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", root)
    targets = [row for row in crosswalk if row.get("phase_classification_status") == "unresolved"]
    expected_ids = [row.get("unit_candidate_id") for row in targets]
    unit_ids = [row.get("unit_candidate_id") for row in units]
    if len(targets) != 30 or len(set(expected_ids)) != 30:
        error(errors, "E_TARGET_SET", "base_target_input")
    if len(units) != 30 or len(set(unit_ids)) != 30 or set(unit_ids) != set(expected_ids):
        error(errors, "E_TARGET_SET")
    if set(EXPECTED_RULE_MAP) != set(expected_ids):
        error(errors, "E_TAXONOMY_EXPECTATION", "fixed_map_coverage")
    if inventory.get("scope", {}).get("unit_count") != 30 or inventory.get("scope", {}).get("target_unit_ids") != expected_ids:
        error(errors, "E_TARGET_SET", "inventory")
    expected_product_counts = {product: sum(row.get("product_scope", []) == [product] for row in targets) for product in EXPECTED_PRODUCTS}
    if expected_product_counts != EXPECTED_PRODUCTS or inventory.get("scope", {}).get("target_product_counts") != EXPECTED_PRODUCTS:
        error(errors, "E_TARGET_SET", "product_counts")
    scope = inventory.get("scope", {})
    if scope.get("parent_binding_id") != "SCF-B-0101":
        error(errors, "E_INVENTORY_DECLARATION", "parent_binding_id")
    if scope.get("target_crosswalk_status") != "unresolved":
        error(errors, "E_INVENTORY_DECLARATION", "target_crosswalk_status")

    if set(matrix) != EXPECTED_MATRIX or inventory.get("decision_matrix") != matrix:
        error(errors, "E_MATRIX_RULE", "matrix_set")
    for rule_id, rule in matrix.items():
        if rule.get("exclusive_group") != "phase-status-primary" or rule.get("status") not in EXPECTED_STATUSES:
            error(errors, "E_MATRIX_RULE", rule_id)
        if not isinstance(rule.get("required_evidence"), list) or not rule.get("required_evidence"):
            error(errors, "E_MATRIX_RULE", rule_id)

    taxonomy_counts = {status: 0 for status in EXPECTED_STATUSES}
    matrix_members: dict[str, list[str]] = {rule: [] for rule in EXPECTED_MATRIX}
    for unit in units:
        unit_id = unit.get("unit_candidate_id")
        parent = parent_units.get(unit_id)
        if parent is None:
            continue
        taxonomy = unit.get("taxonomy", {})
        status = taxonomy.get("status")
        rule_id = taxonomy.get("matrix_rule_id")
        if status not in EXPECTED_STATUSES:
            error(errors, "E_TAXONOMY_STATUS", unit_id)
        else:
            taxonomy_counts[status] += 1
        expected_rule_status = EXPECTED_RULE_MAP.get(unit_id)
        if expected_rule_status != (rule_id, status):
            error(errors, "E_TAXONOMY_EXPECTATION", unit_id)
        if rule_id not in EXPECTED_MATRIX or (rule_id in matrix and matrix[rule_id].get("status") != status):
            error(errors, "E_MATRIX_RULE", unit_id)
        else:
            matrix_members[rule_id].append(unit_id)
        if unit_id in PHCAP_BOUNDARY_UNITS and rule_id != "M-WAIT-PHCAP-BOUNDARY":
            error(errors, "E_PHCAP_BOUNDARY_CLASSIFICATION", unit_id)
        expected_candidate = EXPECTED_CANDIDATE_STATEMENTS.get(unit_id)
        expected_waiting = EXPECTED_JUDGMENT_WAITING_ITEMS.get(unit_id)
        if expected_candidate is None or expected_waiting is None:
            error(errors, "E_TAXONOMY_EXPECTATION", unit_id)
        else:
            if taxonomy.get("candidate_statement") != expected_candidate:
                error(errors, "E_TAXONOMY_EXPECTATION", unit_id + ":candidate_statement")
            waiting = taxonomy.get("judgment_waiting", {})
            if waiting.get("items") != expected_waiting:
                error(errors, "E_TAXONOMY_EXPECTATION", unit_id + ":judgment_waiting")
        if not taxonomy.get("candidate_is_research_only") or taxonomy.get("formal_phase_candidate") is not None or taxonomy.get("direct_phase_candidate_count") != 0 or taxonomy.get("authority_phase_status") != "unchanged_unresolved":
            error(errors, "E_PHASE_AUTHORITY_SEPARATION", unit_id)
        waiting = taxonomy.get("judgment_waiting", {})
        if waiting.get("status") != "pending_human_or_additional_source" or waiting.get("authority_effect") != "none" or waiting.get("new_build_allowed") is not False or not waiting.get("items"):
            error(errors, "E_TAXONOMY_STATUS", unit_id)
        if taxonomy.get("required_evidence") != matrix.get(rule_id, {}).get("required_evidence"):
            error(errors, "E_TAXONOMY_EVIDENCE_JOIN", unit_id + ":required_evidence")
        if taxonomy.get("required_evidence_join") != EXPECTED_EVIDENCE_JOINS.get(rule_id):
            error(errors, "E_TAXONOMY_EVIDENCE_JOIN", unit_id + ":join")
        source = parent["source"]
        anchor = unit.get("source_anchor", {})
        expected_anchor = {
            "archive_path": source["archive_path"], "json_pointer": source["json_pointer"],
            "line_start": source["archive_line_start"], "line_end": source["archive_line_end"],
            "statement_semantic_digest": source["statement_semantic_digest"],
            "statement_text": source["statement_text"], "source_text_spans": source["source_text_spans"],
        }
        if anchor != expected_anchor:
            error(errors, "E_SOURCE_ANCHOR", unit_id)
        expected_edges = sorted(edges_by_unit.get(unit_id, []), key=lambda item: item["review_id"])
        wave = unit.get("wave_review", {})
        if wave.get("edge_refs") != [edge["review_id"] for edge in expected_edges] or wave.get("edges") != expected_edges:
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        expected_counts = {status_name: sum(edge.get("semantic_link_status") == status_name for edge in expected_edges) for status_name in ("confirmed", "unresolved", "rejected")}
        if wave.get("status_counts") != expected_counts or wave.get("edge_count") != len(expected_edges):
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        if wave.get("asset_candidate_phase_targets") != parent["wave_review"]["asset_candidate_phase_targets"] or wave.get("direct_phase_candidates_from_edges") != parent["wave_review"]["direct_phase_candidates_from_edges"] or wave.get("candidate_semantics") != "asset_search_candidate_only; no phase authority":
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        assets = unit.get("legacy_asset_evidence", [])
        if assets != parent.get("legacy_assets"):
            error(errors, "E_ASSET_EVIDENCE", unit_id)
        expected_asset_ids = sorted({edge["asset_id"] for edge in expected_edges})
        if sorted(asset.get("asset_id") for asset in assets) != expected_asset_ids:
            error(errors, "E_ASSET_EVIDENCE", unit_id)
        for asset in assets:
            asset_id = asset.get("asset_id")
            old = disposition.get(asset_id)
            phase = classification.get(asset_id)
            if old is None or phase is None:
                error(errors, "E_ASSET_EVIDENCE", asset_id or unit_id)
                continue
            source_evidence = asset.get("source", {})
            history = asset.get("history", {})
            consumer = asset.get("consumer", {})
            failure = asset.get("failure", {})
            if (
                source_evidence.get("source_path") != old.get("source_path")
                or source_evidence.get("source_sha256") != old.get("source_sha256")
                or source_evidence.get("source_revision") != old.get("source_revision")
                or history.get("disposition") != old.get("disposition")
                or history.get("implementation_status") != old.get("implementation_status")
                or history.get("classification_id") != phase.get("classification_id")
                or consumer.get("closure_status") != phase.get("consumer_closure_status")
                or consumer.get("ledger_consumer_refs") != phase.get("consumer_refs")
            ):
                error(errors, "E_ASSET_EVIDENCE", asset_id)
            if not all(isinstance(failure.get(key), list) for key in ("counterevidence", "coverage_failures", "unresolved")):
                error(errors, "E_ASSET_EVIDENCE", asset_id)
            expected_asset_edges = [edge["review_id"] for edge in expected_edges if edge["asset_id"] == asset_id]
            if sorted(asset.get("edge_refs", [])) != sorted(expected_asset_edges):
                error(errors, "E_ASSET_EVIDENCE", asset_id)
        phase_context = unit.get("phase_context", {})
        if (
            phase_context.get("parent_direct_phase_candidates") != parent["phase_classification"]["eligible_phase_candidates"]
            or phase_context.get("observed_asset_candidate_phases") != parent["wave_review"]["asset_candidate_phase_targets"]
            or phase_context.get("phcap20_direct_rule") != PHCAP20_DIRECT_RULE
            or phase_context.get("phase_authority_status") != "unchanged_unresolved"
        ):
            error(errors, "E_PHASE_AUTHORITY_SEPARATION", unit_id)
        if phase_context.get("phcap20_direct_rule") != PHCAP20_DIRECT_RULE:
            error(errors, "E_PHCAP_BOUNDARY_COVERAGE", unit_id + ":direct_rule")
        expected_boundary_review = {
            "phase_ids": PHCAP_PHASE_IDS,
            "status": "pending_all_20",
            "non_applicability_proven": False,
            "excluded_phase_ids": [],
            "observed_candidate_phase_ids": parent["wave_review"]["asset_candidate_phase_targets"],
            "basis": "full PHCAP-01〜20 boundary review is required before any phase-non-applicability judgment",
        }
        if phase_context.get("phcap_boundary_review") != expected_boundary_review:
            error(errors, "E_PHCAP_BOUNDARY_COVERAGE", unit_id)
        product_context = unit.get("product_context", {})
        if (
            product_context.get("candidate_products") != parent["product_classification"]["candidate_products"]
            or product_context.get("authority_product") is not None
            or product_context.get("l1_context_only") is not True
        ):
            error(errors, "E_UNIT_DECLARATION", unit_id + ":product_context")
            error(errors, "E_PRODUCT_AUTHORITY_SEPARATION", unit_id)
        if (
            unit.get("requirement_id") != parent.get("requirement_id")
            or unit.get("crosswalk_id") != parent.get("crosswalk_id")
            or unit.get("product_scope_candidate") != parent.get("product_scope_candidate")
        ):
            error(errors, "E_UNIT_DECLARATION", unit_id + ":identity_scope")
        boundary = unit.get("authority_boundary", {})
        if boundary != {
            "formal_crosswalk_modified": False,
            "formal_phase_authority_modified": False,
            "formal_product_authority_modified": False,
            "new_build_allowed": False,
            "successor_assigned": False,
            "consumer_closure_generated": False,
        }:
            error(errors, "E_AUTHORITY_BOUNDARY", unit_id)

    if any(len(members) == 0 for members in matrix_members.values()) or sum(len(members) for members in matrix_members.values()) != 30 or len({item for members in matrix_members.values() for item in members}) != 30:
        error(errors, "E_TAXONOMY_COVERAGE", "matrix_membership")
    if inventory.get("taxonomy", {}).get("status_counts") != taxonomy_counts or inventory.get("taxonomy", {}).get("status_counts", {}).get("CROSS_CUTTING_PHASE_REVIEW_PENDING") != len(matrix_members["M-CROSS-CONSTRAINT-REVIEW"]):
        error(errors, "E_TAXONOMY_COVERAGE", "status_counts")
    if inventory.get("taxonomy", {}).get("all_statuses_remain_unresolved") is not True:
        error(errors, "E_PHASE_AUTHORITY_SEPARATION", "unresolved_marker")
    expected_full_review = {
        "phase_ids": PHCAP_PHASE_IDS,
        "status": "pending_all_20",
        "non_applicability_proven": False,
    }
    if inventory.get("taxonomy", {}).get("full_phcap_boundary_review") != expected_full_review:
        error(errors, "E_PHCAP_BOUNDARY_COVERAGE", "inventory")

    expected_wave_edge_count = sum(len(edges_by_unit.get(unit_id, [])) for unit_id in expected_ids)
    expected_asset_count = len({edge["asset_id"] for unit_id in expected_ids for edge in edges_by_unit.get(unit_id, [])})
    if scope.get("wave_edge_count") != expected_wave_edge_count:
        error(errors, "E_INVENTORY_DECLARATION", "wave_edge_count")
    if scope.get("legacy_asset_count") != expected_asset_count:
        error(errors, "E_INVENTORY_DECLARATION", "legacy_asset_count")
    taxonomy_declaration = inventory.get("taxonomy", {})
    if taxonomy_declaration.get("version") != "phase-status-taxonomy-0105/v1":
        error(errors, "E_INVENTORY_DECLARATION", "taxonomy.version")
    if taxonomy_declaration.get("primary_statuses") != sorted(EXPECTED_STATUSES):
        error(errors, "E_INVENTORY_DECLARATION", "taxonomy.primary_statuses")
    if taxonomy_declaration.get("matrix_rule_ids") != sorted(EXPECTED_MATRIX):
        error(errors, "E_INVENTORY_DECLARATION", "taxonomy.matrix_rule_ids")
    if inventory.get("negative_case_codes") != EXPECTED_CODES:
        error(errors, "E_INVENTORY_DECLARATION", "negative_case_codes")

    phase_refs = inventory.get("phcap20_definition_refs", [])
    expected_phase_paths = {
        "docs/governance/phase-capability-inventory.json",
        "scaffold/phcap20-memory-research/README.md",
        "scaffold/phcap20-memory-research/inventory.json",
    }
    if {item.get("path") for item in phase_refs} != expected_phase_paths:
        error(errors, "E_SOURCE_INPUT_DIGEST", "phcap20_refs")
    expected_phase_roles = {
        "docs/governance/phase-capability-inventory.json": "PHCAP_inventory",
        "scaffold/phcap20-memory-research/README.md": "PHCAP-20_definition",
        "scaffold/phcap20-memory-research/inventory.json": "PHCAP-20_static_inventory",
    }
    for item in phase_refs:
        raw = base_bytes(root / item.get("path", ""), root)
        if raw is None or item.get("sha256") != digest(raw) or item.get("role") != expected_phase_roles.get(item.get("path")):
            if item.get("role") != expected_phase_roles.get(item.get("path")):
                error(errors, "E_INVENTORY_DECLARATION", "phcap20_definition_refs.role")
            error(errors, "E_SOURCE_INPUT_DIGEST", str(item.get("path")))

    authority_boundary = inventory.get("authority_boundary", {})
    for key in ("formal_crosswalk_modified", "formal_phase_inventory_modified", "formal_product_authority_modified", "phase_promoted", "product_promoted", "successor_assigned", "consumer_closure_generated", "old_archive_executed"):
        if authority_boundary.get(key) is not False:
            error(errors, "E_AUTHORITY_BOUNDARY", key)
    return errors


if __name__ == "__main__":
    failures = validate()
    if failures:
        print("FAIL SCF-B-0105 validator")
        print("\n".join(failures))
        sys.exit(1)
    print("PASS SCF-B-0105 validator: 30 units, taxonomy matrix, anchors, Wave edges, assets, authority boundary")
