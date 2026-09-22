#!/usr/bin/env python3
"""REQATOM A1 first five の再現可能な source-linked proposal 生成器。"""

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
COPY_READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
PROP = HERE / "proposals.jsonl"
INVENTORY = HERE / "inventory.json"

UNIT_IDS = [f"REQATOM-QUEUE-{n:04d}" for n in range(1, 6)]


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    return digest(path.read_bytes())


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source_defs() -> dict[str, dict]:
    return {row["content_line_id"]: row for row in jsonl(LEDGER)}


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


def unit_definitions() -> dict[str, dict]:
    return {
        "REQATOM-QUEUE-0001": {
            "atoms": [
                atom(
                    "A1-0001-01",
                    ["REQSRC-LINE-00001"],
                    "constraint",
                    "HELIX-HARNESS",
                    "unit",
                    "business sourceはL0のSSoT用語・業界標準・Bounded Contextを参照し、独自の用語定義を行わない。",
                    [{"identity": "current-l1:HARNESS-L1-001", "relation": "unresolved"}],
                    ["L0をparent_doc referenceとする。", "anti-corruption layerとして独自定義をしない。", "Bounded ContextはL0 §2.5 9-modeを参照する。"],
                    ["business source author", "L0 terminology owner"],
                    ["L0 is named as SSoT; this candidate does not create current authority."],
                    ["local terminology definition would violate the stated anti-corruption boundary."],
                    ["SSoT reference links named in the source line."],
                    ["自前の用語定義は例外として許されない。"],
                    ["Current HARNESS L1 is approved as a parent candidate, but this line has no successor identity."],
                    ["Which L0 revision and which product owns each referenced term remains a later human decision."],
                ),
                atom(
                    "A1-0001-02",
                    ["REQSRC-LINE-00002"],
                    "metadata",
                    "unresolved",
                    "composite",
                    "旧business sourceはBR 10件（BR-01〜08、BR-21、BR-22）とUX 3件を確定件数として宣言する。",
                    [{"identity": "legacy-source:business-requirement-count-declaration", "relation": "exact"}],
                    ["BR-01〜08、BR-21、BR-22の件数宣言を保持する。", "UX-01〜03の件数宣言を保持する。", "件数宣言は旧sourceの記述であり、現行分母や承認を生成しない。"],
                    ["legacy source author", "PO references named in source"],
                    ["source declares confirmed counts; current target authority remains none."],
                    ["count drift or source/reference mismatch would require an explicit human review."],
                    ["2026-05-28 v2 source snapshot、v2-import-ledger、2026-06-02 BR-22 auditへの参照。"],
                    ["BR/UX count declaration is not a current denominator or successor assignment."],
                    ["The count spans business identities and later sources, so a single product owner is unresolved."],
                    ["Are BR-21/BR-22 and the UX items independently routed to products?"],
                ),
                atom(
                    "A1-0001-03",
                    ["REQSRC-LINE-00002"],
                    "metadata",
                    "unresolved",
                    "composite",
                    "旧sourceはNFR 15件をnfr.mdの正本として宣言し、NFR-09/10欠番とNFR-17統合セキュリティ追加を明記する。",
                    [{"identity": "legacy-source:nfr-count-declaration", "relation": "exact"}],
                    ["NFRはnfr.mdで15件確定とされる。", "本business文書§6はIPA大項目の参照に留まり、NFR-ID件数の正本ではない。", "NFR-09/10の欠番とNFR-17の統合を保持する。"],
                    ["legacy source author", "nfr.md authority named by source"],
                    ["nfr.md is named as the old count source; no current target authority is assigned."],
                    ["missing or merged NFR IDs are source exceptions that require explicit review before routing."],
                    ["nfr.md and source §6 references preserved verbatim as meaning anchors."],
                    ["business §6 must not be treated as the NFR-ID denominator."],
                    ["NFR spans a separate source and potentially multiple products; target remains unresolved."],
                    ["Which current product and layer, if any, should receive each NFR atom?"],
                ),
                atom(
                    "A1-0001-04",
                    ["REQSRC-LINE-00003"],
                    "constraint",
                    "HELIX-HARNESS",
                    "connection",
                    "旧L3 PLANはbusiness sub-docの全件をdependencies.requiresへ列挙する接続規約を持つ。",
                    [{"identity": "current-l1:HARNESS-L1-003", "relation": "partial"}],
                    ["next_pair_freezeはL3と宣言される。", "L3 PLANが本sub-doc全件をdependencies.requiresへ列挙する。"],
                    ["L3 PLAN author", "HARNESS workflow consumer"],
                    ["The source names L3 as the connection point; adoption is not granted."],
                    ["omitting a source item from dependencies.requires is the stated connection failure."],
                    ["dependencies.requires and next_pair_freeze:L3 source fields."],
                    ["partial or missing dependency listing must remain observable; no lint implementation is assumed."],
                    ["Current L1/L2/L3 boundaries differ from the old physical layer declaration."],
                    ["What exact current artifact should consume this connection rule?"],
                ),
            ],
            "unresolved": [],
        },
        "REQATOM-QUEUE-0002": {
            "atoms": [
                atom(
                    "A1-0002-01",
                    ["REQSRC-LINE-00004"],
                    "constraint",
                    "HELIX-HARNESS",
                    "connection",
                    "旧sourceは社内開発チーム前提を、1人の開発者がAIへ委譲するsolo＋AI agent rosterへ写像し、機械機構は不変とする。",
                    [
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"},
                        {"identity": "current-l1:HELIXOS-L1-003", "relation": "unresolved"},
                    ],
                    ["soloは1人の開発者がAIへ開発を委譲する前提である。", "担い手だけをsolo＋AI agent rosterへ写像し、機械機構は不変とする。", "PLAN-L1-06とconcept §1.3 solo conventionへの参照を保持する。"],
                    ["one human developer", "AI agent roster", "PO/solo actor boundary"],
                    ["Source asserts a role mapping, but current authority and execution permission are not assigned."],
                    ["Any change to the machine mechanism or any unauthorized actor expansion is outside this source assertion."],
                    ["PLAN-L1-06 and concept §1.3 references in the source line."],
                    ["solo mapping does not by itself authorize unattended merge, deployment, or external effects."],
                    ["Current product boundary splits HARNESS process meaning from OS Worker operation; old line does not make that split."],
                    ["Which parts of solo actor mapping are HARNESS constraints and which are OS execution controls?"],
                ),
            ],
            "unresolved": [],
        },
        "REQATOM-QUEUE-0003": {
            "atoms": [
                atom(
                    "A1-0003-01",
                    ["REQSRC-LINE-00005"],
                    "rationale",
                    "HELIX-HARNESS",
                    "unit",
                    "AI実装エージェントへ安全に開発を委譲するための検証・開発基盤が旧source時点で存在しない。",
                    [{"identity": "current-l1:HARNESS-L1-001", "relation": "partial"}],
                    ["安全なAI委譲のための検証・開発基盤が必要という問題認識を保持する。", "旧時点の不存在主張は現行実装状態の判定ではない。"],
                    ["AI implementation agents", "developer/PO"],
                    ["This is a source rationale, not current approval or implementation evidence."],
                    ["absence of a suitable foundation is the stated problem; current gap status remains unknown."],
                    ["source statement that a verification/development foundation was missing."],
                    ["Do not convert the historical absence claim into a current implementation claim."],
                    ["Current HARNESS L1 is approved, but L2/L3 implementation and acceptance remain outside this proposal."],
                    ["What evidence would establish current availability without using old runtime or CI?"],
                ),
                atom(
                    "A1-0003-02",
                    ["REQSRC-LINE-00005"],
                    "requirement",
                    "HELIX-HARNESS",
                    "unit",
                    "AI委譲後も回帰を壊さず、設計・実装・テストの整合を機械強制する仕組みが必要である。",
                    [
                        {"identity": "current-l1:HARNESS-L1-003", "relation": "partial"},
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"},
                    ],
                    ["regression must not break after AI delegation. ", "design⇔implementation⇔test consistency must be mechanically enforced."],
                    ["AI implementation agent", "HARNESS consumer"],
                    ["Machine enforcement is a candidate requirement; no current authority or implementation is claimed."],
                    ["regression breakage or trace inconsistency is the retained failure condition."],
                    ["design⇔implementation⇔test relation and regression wording in the source line."],
                    ["A passing old check cannot be used as current acceptance evidence."],
                    ["The source combines value, failure, and mechanism language; exact acceptance granularity is unresolved."],
                    ["Which current V-pair and L11 evidence should cover this requirement?"],
                ),
                atom(
                    "A1-0003-03",
                    ["REQSRC-LINE-00005"],
                    "constraint",
                    "HELIX-HARNESS",
                    "connection",
                    "POはL0企画・L1業務要求・L2デザインモック・L3承認のみを担うという旧actor boundaryを保持する。",
                    [
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"},
                        {"identity": "current-l1:HELIXOS-L1-003", "relation": "unresolved"},
                    ],
                    ["1人の開発者（PO）の担当範囲はL0/L1/L2-mock/L3 approvalのみと旧sourceは述べる。", "actor boundaryは機械強制が必要という文脈で保持する。"],
                    ["one human developer", "PO", "AI agent roster"],
                    ["PO approval boundary is source meaning only; current permission path is unresolved."],
                    ["AI or worker acting beyond the stated PO boundary requires an authority decision."],
                    ["L0/L1/L2-mock/L3 approval list in the source line."],
                    ["The old boundary does not grant merge, release, or deployment authority."],
                    ["Current AGENTS and Concept separate HARNESS contract from OS execution; source does not resolve the split."],
                    ["Which current approval record and authority vocabulary should represent this boundary?"],
                ),
                atom(
                    "A1-0003-04",
                    ["REQSRC-LINE-00005"],
                    "requirement",
                    "HELIX-HARNESS",
                    "connection",
                    "旧sourceはL3起草からL7実装までをAI agent rosterが無人完走する工程接続として記述する。",
                    [
                        {"identity": "current-l1:HARNESS-L1-001", "relation": "partial"},
                        {"identity": "current-l1:HELIXOS-L1-003", "relation": "unresolved"},
                    ],
                    ["L3 drafting〜L7 implementation is included in the old unattended AI coverage claim.", "This is a HARNESS process-to-OS execution connection candidate, not a successor."],
                    ["AI agent roster", "HARNESS process owner", "HELIX-OS Worker candidate"],
                    ["The source has no current execution authority; target remains candidate only."],
                    ["interruption or unauthorized action during L3-L7 execution is not resolved by the source."],
                    ["L3〜L7 layer range and unattended-completion wording."],
                    ["Do not infer a current Worker or CI implementation from this old claim."],
                    ["Current boundary assigns process meaning to HARNESS and Worker operation to OS; exact split is unresolved."],
                    ["Should the normative range be HARNESS-owned with an OS connection, or remain unresolved?"],
                ),
                atom(
                    "A1-0003-05",
                    ["REQSRC-LINE-00005"],
                    "requirement",
                    "HELIX-OS",
                    "connection",
                    "旧sourceはL8〜L14検証をAI agent rosterが無人完走する実行接続として記述する。",
                    [
                        {"identity": "current-l1:HELIXOS-L1-003", "relation": "partial"},
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "unresolved"},
                    ],
                    ["L8–L14 verification is included in the old unattended AI coverage claim.", "The candidate records the possible HARNESS contract→OS execution connection."],
                    ["AI verification agents", "HELIX-OS Worker/CI candidate", "independent verifier candidate"],
                    ["Current CI, Worker, and verifier authority are not established by this source line."],
                    ["verification failure or missing independent evidence must remain a stop/failure condition candidate."],
                    ["L8–L14 range and verification wording in the source line."],
                    ["Old unattended execution must not be promoted to current completion or acceptance."],
                    ["Current authority model may require explicit permission and independent review, conflicting with an unqualified unattended claim."],
                    ["What failure, recovery, and verifier separation must a later product-specific review add?"],
                ),
                atom(
                    "A1-0003-06",
                    ["REQSRC-LINE-00005"],
                    "requirement",
                    "HELIX-OS",
                    "connection",
                    "旧sourceはPR/CI/merge/tagまでAI agent rosterが無人完走する範囲として列挙する。",
                    [{"identity": "current-l1:HELIXOS-L1-004", "relation": "conflicts"}],
                    ["PR, CI, merge, and tag are explicitly included in the old unattended AI coverage claim.", "The claim is retained as historical source meaning only."],
                    ["AI agent roster", "PR/CI/merge/tag consumers", "human authority boundary"],
                    ["No current merge, release, or external-operation authority is assigned; explicit route permission remains required."],
                    ["review, merge, or tag without the required authority/evidence is a retained conflict/failure candidate."],
                    ["PR/CI/merge/tag list in the source line."],
                    ["Do not treat the old claim as permission, implementation, completion, or acceptance."],
                    ["Current AGENTS/Concept review and merge boundaries conflict with an unqualified unattended-completion interpretation."],
                    ["Which actions, if any, can be routed to OS and which require human authorization?"],
                ),
            ],
            "unresolved": [],
        },
        "REQATOM-QUEUE-0004": {
            "atoms": [
                atom(
                    "A1-0004-01",
                    ["REQSRC-LINE-00006"],
                    "requirement",
                    "HELIX-HARNESS",
                    "unit",
                    "HELIXはAI実装エージェントへ安全に開発を委譲する検証・開発基盤を提供する。",
                    [{"identity": "current-l1:HARNESS-L1-001", "relation": "partial"}],
                    ["safe delegation is the product value stated by the old source.", "The wording is a candidate requirement, not an implementation assertion."],
                    ["AI implementation agent", "HARNESS external user"],
                    ["HARNESS product target is a candidate based on the current boundary; target authority is none in this proposal."],
                    ["unsafe delegation or missing verification remains a failure candidate."],
                    ["verification/development foundation wording and HELIX-HARNESS naming context."],
                    ["No old implementation or runtime is used as evidence."],
                    ["Current L1 is approved, while downstream requirement and acceptance remain unassigned."],
                    ["Which external-user and L11 conditions make this value testable?"],
                ),
                atom(
                    "A1-0004-02",
                    ["REQSRC-LINE-00006"],
                    "requirement",
                    "HELIX-HARNESS",
                    "unit",
                    "V-model L0-L14の全工程についてPLAN管理・gate判定・trace整合を機械強制し、工程規律を保つ。",
                    [
                        {"identity": "current-l1:HARNESS-L1-001", "relation": "partial"},
                        {"identity": "current-l1:HARNESS-L1-003", "relation": "partial"},
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"},
                    ],
                    ["V-model range is L0-L14 in the old source.", "PLAN management, gate decisions, and trace consistency are machine-enforced candidates.", "AI delegation must not collapse process discipline."],
                    ["HARNESS workflow consumer", "AI agent roster"],
                    ["The line proposes a machine-enforced contract; it grants no runtime or CI authority."],
                    ["broken process discipline, gate failure, and trace inconsistency are retained failure candidates."],
                    ["L0-L14, PLAN, gate, and trace terms in the source line."],
                    ["L0-L14 old nomenclature must not auto-generate current L2/L3 scope."],
                    ["Current Concept uses L1-L12 while old source says L0-L14; the phase/layer relation is unresolved."],
                    ["Which current V-model revision and pair vocabulary covers this old range?"],
                ),
                atom(
                    "A1-0004-03",
                    ["REQSRC-LINE-00006"],
                    "constraint",
                    "HELIX-HARNESS",
                    "connection",
                    "旧sourceはsolo前提で人間1名（PO）とAI agent roster（tl/qa/aim/uiux）が全工程を回す接続を記述する。",
                    [
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"},
                        {"identity": "current-l1:HELIXOS-L1-003", "relation": "unresolved"},
                    ],
                    ["one human PO and tl/qa/aim/uiux AI roles are listed.", "The source says the roster runs the whole process, but current execution ownership is unresolved."],
                    ["one human PO", "tl AI role", "qa AI role", "aim AI role", "uiux AI role"],
                    ["Role labels do not grant current capability, authority, or external action permission."],
                    ["role collision or unauthorized role crossing is a retained boundary failure candidate."],
                    ["solo, PO, and four role labels in the source line."],
                    ["Do not equate role names with existing runtime identities or implementation."],
                    ["HARNESS owns process meaning while OS owns Worker/CI operation; old line combines them."],
                    ["Which role boundary and verifier separation should be carried to later product-specific review?"],
                ),
                atom(
                    "A1-0004-04",
                    ["REQSRC-LINE-00006"],
                    "metadata",
                    "HELIX-HARNESS",
                    "unit",
                    "この文脈でHELIX-HARNESSは仕組みを実装・配布するrepository／harness package名として扱う。",
                    [{"identity": "current-boundary:HARNESS-external-product", "relation": "partial"}],
                    ["HELIX-HARNESS naming context is retained.", "The old line describes repository/package identity, not implementation completion."],
                    ["repository/package maintainer", "external package consumer"],
                    ["Name and package identity do not create an authority or release decision."],
                    ["package identity must not be confused with a released or accepted artifact."],
                    ["backticked HELIX-HARNESS repository/package phrase."],
                    ["No release, deployment, or package consumer closure is claimed."],
                    ["Current boundary distinguishes HARNESS product from OS distribution operation."],
                    ["What exact package/version and consumer contract will a later decision bind?"],
                ),
            ],
            "unresolved": [],
        },
        "REQATOM-QUEUE-0005": {
            "atoms": [
                atom(
                    "A1-0005-01",
                    ["REQSRC-LINE-00007"],
                    "requirement",
                    "HELIX-HARNESS",
                    "composite",
                    "本プロダクトの価値はprocess・safety・automationを偏らせず統合することであり、単一要素への最適化を禁ずる。",
                    [
                        {"identity": "current-l1:HARNESS-L1-001", "relation": "partial"},
                        {"identity": "current-l1:HARNESS-L1-003", "relation": "partial"},
                        {"identity": "current-l1:HARNESS-L1-004", "relation": "partial"},
                    ],
                    ["process means progress/V-model discipline.", "safety means not breaking and enforcing verification.", "automation means AI delegation and speed.", "The integration of all three, without optimizing only one, is itself the core value.", "UX-01 is cited as the duplicate value requirement."],
                    ["HARNESS external user", "PO", "AI agent roster"],
                    ["Value balance is a source requirement candidate; no current acceptance or authority is assigned."],
                    ["over-optimizing one of process, safety, or automation is the explicit negative condition."],
                    ["process/safety/automation labels and UX-01 reference in the source line."],
                    ["Do not split the balance constraint into independent successor requirements without preserving the integration condition."],
                    ["Current L1 provides related candidates but does not establish successor identity or implementation."],
                    ["What evidence can evaluate balance without turning this value statement into a technology choice?"],
                ),
            ],
            "unresolved": [],
        },
    }


def build() -> None:
    queue_rows = {row["review_unit_id"]: row for row in jsonl(QUEUE)}
    lines = source_defs()
    definitions = unit_definitions()
    proposals: list[dict] = []
    for unit_id in UNIT_IDS:
        queue = queue_rows[unit_id]
        definition = definitions[unit_id]
        input_ids = queue["content_line_ids"]
        for candidate in definition["atoms"]:
            candidate["exact_source_text"] = lines[candidate["source_line_ids"][0]]["source_line_text"]
        proposals.append(
            {
                "review_unit_id": unit_id,
                "review_sequence": queue["review_sequence"],
                "input_source_path": queue["source_path"],
                "input_source_revision": queue["source_file_sha256"],
                "input_heading_path": queue["heading_path"],
                "input_source_line_range": [queue["source_line_start"], queue["source_line_end"]],
                "input_content_line_ids": input_ids,
                "input_content_line_digests": {line_id: lines[line_id]["source_line_sha256"] for line_id in input_ids},
                "line_coverage": {
                    "consumed_once": input_ids,
                    "shared_context": [],
                    "unresolved": definition["unresolved"],
                },
                "candidate_atoms": definition["atoms"],
                "four_product_denominator": {
                    "HELIX-HARNESS": {"candidate_atom_count": sum(a["candidate_target"] == "HELIX-HARNESS" for a in definition["atoms"]), "status": "candidate_only"},
                    "HELIX-OS": {"candidate_atom_count": sum(a["candidate_target"] == "HELIX-OS" for a in definition["atoms"]), "status": "candidate_only"},
                    "HELIX-Web": {"candidate_atom_count": 0, "status": "no_direct_source_evidence"},
                    "HELIX-Web-OS": {"candidate_atom_count": 0, "status": "no_direct_source_evidence"},
                },
                "authority_claim": "none",
                "proposal_status": "needs_independent_review",
                "meaning_change_applied": False,
                "successor_requirement_ids": [],
                "decision_record": None,
            }
        )

    PROP.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in proposals), encoding="utf-8")
    assets = {row["source_path"]: row for row in jsonl(ASSETS)}
    asset = assets["docs/design/harness/L1-requirements/business-requirements.md"]
    read_after = next(row for row in jsonl(COPY_READ_AFTER) if row["asset_id"] == asset["asset_id"])
    target_counts = {product: 0 for product in ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")}
    unresolved_target_count = 0
    for proposal in proposals:
        for candidate in proposal["candidate_atoms"]:
            target = candidate["candidate_target"]
            if target in target_counts:
                target_counts[target] += 1
            else:
                unresolved_target_count += 1
    inventory = {
        "schema_revision": 1,
        "generated_at": "2026-09-22",
        "authority_effect": "none",
        "proposal_status": "needs_independent_review",
        "source_commit": "4a195555fed7f5e67e7839be232570972dc6e2ae",
        "inputs": {
            "queue_path": "docs/governance/legacy-requirement-atomization-review-queue.jsonl",
            "queue_sha256": file_digest(QUEUE),
            "semantic_line_ledger_path": "docs/governance/legacy-requirement-semantic-line-carry-forward.jsonl",
            "semantic_line_ledger_sha256": file_digest(LEDGER),
            "source_path": "docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md",
            "source_sha256": file_digest(SOURCE),
            "archive_source_path": "archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md",
            "archive_source_sha256": file_digest(ARCHIVE_SOURCE),
            "legacy_asset_id": asset["asset_id"],
            "legacy_asset_revision": asset["revision"],
            "legacy_asset_disposition": asset["disposition"],
            "legacy_asset_implementation_status": asset["implementation_status"],
            "legacy_asset_product_target": asset["product_target"],
            "legacy_asset_decision_status": asset["decision_status"],
            "legacy_asset_consumer_refs": asset["consumer_refs"],
            "legacy_asset_decision_ref": asset["decision_record_ref"],
            "legacy_asset_read_after_id": read_after["read_after_id"],
            "legacy_asset_read_after_result": read_after["result"],
            "legacy_asset_read_after_digest_match": read_after["digest_match"],
            "legacy_asset_read_after_consumer_match": read_after["consumer_match"],
            "legacy_asset_read_after_failure": read_after["failure"],
            "legacy_asset_read_after_consumer_refs": read_after["consumer_refs_observed"],
        },
        "review_unit_ids": UNIT_IDS,
        "review_unit_count": len(proposals),
        "input_line_count": sum(len(row["input_content_line_ids"]) for row in proposals),
        "candidate_atom_count": sum(len(row["candidate_atoms"]) for row in proposals),
        "four_product_denominator": {
            product: {
                "candidate_atom_count": target_counts[product],
                "status": "candidate_only" if target_counts[product] else "no_direct_source_evidence",
            }
            for product in target_counts
        },
        "unresolved_target_candidate_atom_count": unresolved_target_count,
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
        "proposal_sha256": file_digest(PROP),
    }
    write_json(INVENTORY, inventory)
    print(f"generated {PROP} ({len(proposals)} units, {inventory['candidate_atom_count']} atoms)")


if __name__ == "__main__":
    build()
