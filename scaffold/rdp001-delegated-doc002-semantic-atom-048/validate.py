#!/usr/bin/env python3
"""DELEGATED-DOC-002 semantic atom candidate のread-only静的検証。"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
CANDIDATE = HERE / "inventory.json"
BINDING = ROOT / "scaffold/bindings/SCF-B-0048.json"
SOURCE_PATH = "docs/design/helix/L3-requirements/github-atomic-development-requirements.md"
ARCHIVE_PATH = "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md"
SOURCE_COMMIT = "5fcdc80f23c0fb3e959293b9fbd751fa31eeb792"
SOURCE_BLOB_OID = "e3970610d41353862c3d98bc143dc4bffa2e1a02"
EXPECTED_DOC = "DELEGATED-DOC-002"
EXPECTED_EDGES = {"DELEGATED-REF-0301", "DELEGATED-REF-0302"}
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
ASSET_ID = "LEGACY-ASSET-58CBC57F44DFDD288961"
ATOM_PREFIX = "RDP002048-SEM-"
EXPECTED_PROHIBITED = [
    "owner adoption", "phase authority", "legacy implementation", "degraded implementation",
    "failure closure", "consumer closure", "acceptance completion", "L3/L10 freeze",
    "runtime or CI readiness", "successor assignment",
]


# These canonical ledgers are independent source constants. Inventory values are
# compared against them; they are never read to construct the expected values.
SEMANTIC_ATOM_FIELDS = (
    "semantic_atom_id", "candidate_kind", "original_id", "owner_candidates",
    "consumer_candidates", "normalized_statement", "actors",
    "authority_conditions", "negative_conditions",
)
EXPECTED_SEMANTIC_ATOMS_JSON = r'''[{"actors":["source author","verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"metadata","consumer_candidates":["HELIX-OS"],"negative_conditions":["source status=draftをconfirmed/current authorityへ昇格しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"frontmatter、source status、owner、pair relationを保持する","original_id":"DOC-002-METADATA","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-METADATA"},{"actors":["source author","developer"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"premise","consumer_candidates":["HELIX-OS"],"negative_conditions":["目的文から実装、CI実行、削除完了を推測しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"新規実装と既存改修をatomic sliceへ束ね、巨大PR・全PR full CI・根拠のないlegacy一括削除を拒否する","original_id":"DOC-002-PURPOSE-ATOMIC-SLICE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-PURPOSE-ATOMIC-SLICE"},{"actors":["source author","workflow owner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["適用先の列挙を現行ownerやauthorityの確定とみなさない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"Atomic slice基準をForward、Add-feature、Refactor、Retrofit、Recovery、Reverse、Production Scrumへ共通適用する","original_id":"DOC-002-PURPOSE-APPLICABILITY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-PURPOSE-APPLICABILITY"},{"actors":["PR author","responsibility owner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["複数behaviorやownerの混載を原子PRとして受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"Atomic PRはexactly-one behavior contractとexactly-one responsibility ownerを持つ","original_id":"DOC-002-CRITERION-ATOMIC-PR","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-CRITERION-ATOMIC-PR"},{"actors":["developer","verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["oracle・failure・invariant・rollbackの欠落をcontract firstとして扱わない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"acceptance oracle、failure、invariant、rollbackを実装より先に固定する","original_id":"DOC-002-CRITERION-CONTRACT-FIRST","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-CRITERION-CONTRACT-FIRST"},{"actors":["refactor owner","consumer owner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["複数legacy owner／consumerの同時移行をmicro-refactorとみなさない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"一回に一legacy ownerまたはconsumerだけを移行しdual-greenとrollback可能性を維持する","original_id":"DOC-002-CRITERION-MICRO-REFACTOR","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-CRITERION-MICRO-REFACTOR"},{"actors":["migration owner","consumer verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["consumer=0前の削除、契約と削除の同時実施を拒否する","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"consumer=0の実証後だけlegacyを削除し、契約導入と削除を同じsliceへ混載しない","original_id":"DOC-002-CRITERION-PROGRESSIVE-RETIREMENT","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-CRITERION-PROGRESSIVE-RETIREMENT"},{"actors":["CI planner","recovery owner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["targeted／critical／full／nightlyの役割を混同しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PRはtargeted+critical、合流後はfull、nightlyは未回収・driftだけを補完する","original_id":"DOC-002-CRITERION-ATOMIC-CI","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-CRITERION-ATOMIC-CI"},{"actors":["workflow owner","DB projection"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["異なるHEAD・contract・ownerのfrontierを同一sliceとして扱わない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PR、PLAN、CI、工程表、DB next actionを同じHEAD・contract・ownerへ束縛する","original_id":"DOC-002-CRITERION-SINGLE-FRONTIER","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-CRITERION-SINGLE-FRONTIER"},{"actors":["developer","test oracle","PR"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["複数behaviorまたは根拠のないlegacy ownerを一つのsliceへ混載しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"一つの開発sliceにacceptance behavior、失敗testまたはoracle、最小実装、refactor、receipt、PRを束ねる","original_id":"GH-FR-024-BEHAVIOR-CONTRACT","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-BEHAVIOR-CONTRACT"},{"actors":["responsibility owner","PR verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["複数aggregate、独立merge可能behavior、無関係legacy ownerの混載を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"exactly-one責務ownerをbounded contextへ束ね、複数aggregate・独立behavior・無関係legacy ownerを拒否する","original_id":"GH-FR-024-OWNER-EXCLUSION","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-OWNER-EXCLUSION"},{"actors":["developer","characterization oracle"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["characterizationなしの既存改修やRed→Green→Refactor順序の省略を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"新規はacceptance exampleからRed→Green→Refactor、既存改修はcharacterization oracleから同じloopへ合流する","original_id":"GH-FR-024-RED-GREEN-REFACTOR","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-RED-GREEN-REFACTOR"},{"actors":["reviewer","PR verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["file countまたはdiff line countだけでatomicityを確定しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"ファイル数や差分行数だけを原子性の根拠にしない","original_id":"GH-FR-024-SIZE-NONPROOF","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-SIZE-NONPROOF"},{"actors":["PR author","CI verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["宣言欠落またはbase..head実差分との不一致を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PRがbehavior contract ID、owner、許可path、予定path全集合、PLAN/test companion、scope expansion receiptを宣言し実差分と一致させる","original_id":"GH-FR-024-DECLARATION","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-DECLARATION"},{"actors":["CI","reviewer"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["scope expansionやunsafe pathを証拠なしに通過させない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"予定pathと実差分の不一致、複数behavior/owner、unsafe path、companion欠落、根拠のないscope拡張をfail-closeする","original_id":"GH-FR-024-SCOPE-FAIL-CLOSE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-SCOPE-FAIL-CLOSE"},{"actors":["parser","PR/PLAN admission"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["小文字、空白、underscore、連続hyphen、7 segment以上を正規形として受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"behavior contract IDを単一hyphen・2〜6個のuppercase alphanumeric segmentへ正規化する","original_id":"GH-FR-024-ID-GRAMMAR","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-ID-GRAMMAR"},{"actors":["shared parser","admission gate"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["独自regexや互換拡張で不正文法を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"先頭uppercase条件と空segmentを含む不正文法を拒否する","original_id":"GH-FR-024-ID-REJECTION","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-ID-REJECTION"},{"actors":["parser owner","projection consumer"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["surfaceごとの独自parserで受理範囲を拡大しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PR、PLAN、runtime、Issue closure、DB／doctor projectionは同じparserを使い受理範囲を広げない","original_id":"GH-FR-024-SHARED-PARSER","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-024-SHARED-PARSER"},{"actors":["PR CI","impact selector"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["security等critical gateの欠落や全PR fullの代用を黙って受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PR CIはsource/base HEADからimpact DAGを評価しtypecheck・targeted oracle・critical gateを選択する","original_id":"GH-FR-025-IMPACT-SELECTION","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-025-IMPACT-SELECTION"},{"actors":["PR CI","post-merge recovery","nightly"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["省略itemの重複回収やnightlyを一次回収として扱わない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"省略test/gateをdigest付きで記録し、post-merge fullを一次回収、nightlyは欠落・失敗・driftだけを補完する","original_id":"GH-FR-025-POST-MERGE-RECOVERY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-025-POST-MERGE-RECOVERY"},{"actors":["CI gate","risk classifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["targeted greenだけでfull verificationを完了扱いしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"targeted greenをfull greenの代替にせずunknown/high-risk/selector変更/cycleをfullへfail-closeする","original_id":"GH-FR-025-FULL-FAIL-CLOSE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-025-FULL-FAIL-CLOSE"},{"actors":["post-merge recovery","merge gate"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["red fullを通常mergeや別HEADのRecoveryで隠さない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"post-merge fullがredなら通常mergeを停止し同一HEADのRecoveryをactive frontier先頭へ移す","original_id":"GH-FR-025-RED-RECOVERY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-025-RED-RECOVERY"},{"actors":["CI runner","performance recovery"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["timeout延長や検査削減で予算超過を隠さない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"targeted/criticalとfullのp95予算、source/base HEAD、runner、selected/skipped digest、durationを保存し性能超過をcorrectnessと分離する","original_id":"GH-FR-025-PERFORMANCE-RECEIPT","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-025-PERFORMANCE-RECEIPT"},{"actors":["PR CI","performance verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["p95 60秒超過をcorrectness greenへ読み替えない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PR targeted/critical verificationのp95 60秒予算を保持する","original_id":"GH-NFR-009","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-NFR-009"},{"actors":["full verifier","performance recovery"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["p95 3分超過を検査削減で隠さない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"Full verificationのp95 3分予算を保持する","original_id":"GH-NFR-010","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-NFR-010"},{"actors":["refactor owner","characterization oracle"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["複数legacy owner/pathを一度に縮退しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"legacy責務縮退をowner/path単位でcharacterization contract freezeとnew/old dual-greenから開始する","original_id":"GH-FR-026-CONTRACT-FREEZE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-026-CONTRACT-FREEZE"},{"actors":["consumer owner","migration verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["consumer=0やrollback receipt前のlegacy削除を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"consumer移行、consumer=0、rollback receipt、legacy削除を順序付ける","original_id":"GH-FR-026-CONSUMER-RETIRE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-026-CONSUMER-RETIRE"},{"actors":["refactor owner","oracle"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["public behavior不変の未確認、契約と削除の同一sliceを許可しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"public behavior・persistence semantics・dependent oracleを再検証し契約追加と削除を混載せず可逆にする","original_id":"GH-FR-026-REVERSIBLE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-026-REVERSIBLE"},{"actors":["change classifier","workflow router"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["behavior changeをRefactor完了へ偽装しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"新behaviorまたはpublic contract変更を検出したらRefactorを停止しAdd-feature等へrouteする","original_id":"GH-FR-026-ROUTE-CHANGE","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-026-ROUTE-CHANGE"},{"actors":["workflow planner","DB projection"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["prose順・人手選択をready actionのauthorityにしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"Issue、PLAN、branch、PR、CI、post-merge schedule、工程表、DB next_actionを同一frontierから決定する","original_id":"GH-FR-027-SAME-FRONTIER","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-027-SAME-FRONTIER"},{"actors":["recovery owner","legacy retirement gate"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["projection不一致を自動上書きやready化で隠さない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"GitHub表示・工程表・schedule・DBが不一致なら上書きせずRecoveryへ移し、legacy削除は先行evidenceまでreadyにしない","original_id":"GH-FR-027-MISMATCH-RECOVERY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-027-MISMATCH-RECOVERY"},{"actors":["writer","read-only reviewer","lease verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["read-only reviewerのpush、旧HEAD token、lease再検証なしwriteを受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"作業PRはrepo／PR／base HEAD／head HEADをkeyにwriter leaseを持ち、reviewerのpushとremote更新を拒否する","original_id":"GH-FR-028-LEASE-IDENTITY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-028-LEASE-IDENTITY"},{"actors":["lease poller","runtime"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["観測だけの開始、poll欠落、heartbeat欠落を作業開始根拠にしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"active leaseのpoll/heartbeat/TTLと同一PR・HEADのlease acquireを要求し、観測だけでは作業を開始しない","original_id":"GH-FR-028-POLL-HEARTBEAT","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-028-POLL-HEARTBEAT"},{"actors":["AI-A","AI-B","lease manager"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"requirement","consumer_candidates":["HELIX-OS"],"negative_conditions":["通知だけの所有権移転、複数active takeover、相反ownerを受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"release/acquire eventを同一HEADへ連続記録し、handoff時に旧writer・旧HEAD・相反takeoverをconsume/supersedeする","original_id":"GH-FR-028-HANDOFF","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-028-HANDOFF"},{"actors":["recovery verifier","worktree owner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["staleを即時横取り、receiptなしtakeover、競合継続を許可しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"TTL切れやstale worktreeはreceiptを確認してからRecoveryし、競合・HEAD drift・別worktree writeをfail-closeする","original_id":"GH-FR-028-STALE-RECOVERY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-FR-028-STALE-RECOVERY"},{"actors":["PR verifier","owner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["独立merge可能変更の混載をatomicityとして受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"Atomicityとして1 behavior contract・1 ownerを持ち独立merge可能変更を混載しない","original_id":"GH-NFR-015","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-NFR-015"},{"actors":["CI verifier","recovery"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["silent skipやcoverage相殺を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"targeted選択は省略集合digestとfull回収receiptを持ちcoverage相殺とsilent skipを許可しない","original_id":"GH-NFR-016","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-NFR-016"},{"actors":["refactor verifier","consumer verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["rollback可能性やconsumer=0なしの削除を受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"mini-refactor各stepはrollback可能でlegacy削除前にconsumer=0と復旧receiptを要求する","original_id":"GH-NFR-017","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-NFR-017"},{"actors":["writer lease","concurrency verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["active takeoverを推測時刻で選び、stale-recoveryなしに横取りしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"PR writerをexactly-oneとしlease・HEAD・worktree・sessionを再検証できないwriteを拒否する","original_id":"GH-NFR-018","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-NFR-018"},{"actors":["acceptance verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["複数aggregate・独立behavior・無関係legacy ownerの混載を合格にしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"fixtureをexactly-one behavior contractとDDD ownerへ束縛し複数aggregate等を拒否する","original_id":"GH-AC-035","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-035"},{"actors":["acceptance verifier","CI"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["targetedだけのgreen、二重回収、unknownの未回収を合格にしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"impact profile、post-merge/nightly回収、terminal receipt link、unknown/high-risk fail-closeを受入れる","original_id":"GH-AC-036","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-036"},{"actors":["acceptance verifier","retirement gate"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["順序欠落のlegacy削除を受入しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"legacy削除taskのcharacterization、dual-green、consumer移行、consumer=0、rollback順序欠落をblockする","original_id":"GH-AC-037","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-037"},{"actors":["acceptance verifier","projection"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["不一致を自動上書きして収束扱いしない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"GitHub、PLAN、schedule、DB next actionを同一frontierへ収束させ不一致をRecoveryにする","original_id":"GH-AC-038","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-038"},{"actors":["acceptance verifier","lease manager"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["観測だけの開始やreceiptなしtakeoverを受入しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"同時write、read-only push、stale lease横取り、相反takeoverを拒否しhandoffを同一HEADへ束縛する","original_id":"GH-AC-039","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-039"},{"actors":["acceptance verifier","CI"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["無証拠scope expansionや予定外pathを受入しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"1 behavior／1 owner、path family、予定path全集合を実差分へ照合し予定外・unsafe・companion欠落を拒否する","original_id":"GH-AC-040","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-040"},{"actors":["acceptance verifier","shared parser"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["surfaceごとに異なるparser結果を受入しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"behavior contract IDを共有parserで2〜6 segmentへ正規化し7以上・不正文法をfail-closeする","original_id":"GH-AC-043","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-GH-AC-043"},{"actors":["L3 owner","downstream planner"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"boundary","consumer_candidates":["HELIX-OS"],"negative_conditions":["L3本文の存在から実装、refactor完了、full verificationを主張しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"本書はL3契約を定義しimpact selector等のL4以降降下と未完了境界を明示する","original_id":"DOC-002-FREEZE-BOUNDARY","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-FREEZE-BOUNDARY"},{"actors":["PLAN author","governance verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"constraint","consumer_candidates":["HELIX-OS"],"negative_conditions":["PLAN field欠落や複数ownerを原子性として受理しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"L3〜L7 PLANへbehavior_contract_id等のfieldを記録する","original_id":"DOC-002-PLAN-FIELDS","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-PLAN-FIELDS"},{"actors":["PLAN verifier"],"authority_conditions":["source status=draft","fixed source digest and source line span","human decision required before adoption or current authority"],"candidate_kind":"acceptance","consumer_candidates":["HELIX-OS"],"negative_conditions":["field省略、複数owner列挙、独立behavior束ね書きを受入しない","authority_effect=none、successorなし、実装・縮退・failure・consumer closure・acceptanceを生成しない"],"normalized_statement":"not_applicableは理由付きで許容し、field省略や独立behaviorの束ね書きによる原子性偽装を拒否する","original_id":"DOC-002-PLAN-NO-FALSIFICATION","owner_candidates":["HELIX-HARNESS","HELIX-OS"],"semantic_atom_id":"RDP002048-SEM-DOC-002-PLAN-NO-FALSIFICATION"}]'''
EXPECTED_SEMANTIC_ATOMS = json.loads(EXPECTED_SEMANTIC_ATOMS_JSON)
EXPECTED_SEMANTIC_ATOMS_DIGEST = "661b6dab43585cc6d8b3b434483de3d0741ca6089f5477bb084613f819b3e888"
EXPECTED_NORMALIZED_STATEMENTS_JSON = r'''["frontmatter、source status、owner、pair relationを保持する","新規実装と既存改修をatomic sliceへ束ね、巨大PR・全PR full CI・根拠のないlegacy一括削除を拒否する","Atomic slice基準をForward、Add-feature、Refactor、Retrofit、Recovery、Reverse、Production Scrumへ共通適用する","Atomic PRはexactly-one behavior contractとexactly-one responsibility ownerを持つ","acceptance oracle、failure、invariant、rollbackを実装より先に固定する","一回に一legacy ownerまたはconsumerだけを移行しdual-greenとrollback可能性を維持する","consumer=0の実証後だけlegacyを削除し、契約導入と削除を同じsliceへ混載しない","PRはtargeted+critical、合流後はfull、nightlyは未回収・driftだけを補完する","PR、PLAN、CI、工程表、DB next actionを同じHEAD・contract・ownerへ束縛する","一つの開発sliceにacceptance behavior、失敗testまたはoracle、最小実装、refactor、receipt、PRを束ねる","exactly-one責務ownerをbounded contextへ束ね、複数aggregate・独立behavior・無関係legacy ownerを拒否する","新規はacceptance exampleからRed→Green→Refactor、既存改修はcharacterization oracleから同じloopへ合流する","ファイル数や差分行数だけを原子性の根拠にしない","PRがbehavior contract ID、owner、許可path、予定path全集合、PLAN/test companion、scope expansion receiptを宣言し実差分と一致させる","予定pathと実差分の不一致、複数behavior/owner、unsafe path、companion欠落、根拠のないscope拡張をfail-closeする","behavior contract IDを単一hyphen・2〜6個のuppercase alphanumeric segmentへ正規化する","先頭uppercase条件と空segmentを含む不正文法を拒否する","PR、PLAN、runtime、Issue closure、DB／doctor projectionは同じparserを使い受理範囲を広げない","PR CIはsource/base HEADからimpact DAGを評価しtypecheck・targeted oracle・critical gateを選択する","省略test/gateをdigest付きで記録し、post-merge fullを一次回収、nightlyは欠落・失敗・driftだけを補完する","targeted greenをfull greenの代替にせずunknown/high-risk/selector変更/cycleをfullへfail-closeする","post-merge fullがredなら通常mergeを停止し同一HEADのRecoveryをactive frontier先頭へ移す","targeted/criticalとfullのp95予算、source/base HEAD、runner、selected/skipped digest、durationを保存し性能超過をcorrectnessと分離する","PR targeted/critical verificationのp95 60秒予算を保持する","Full verificationのp95 3分予算を保持する","legacy責務縮退をowner/path単位でcharacterization contract freezeとnew/old dual-greenから開始する","consumer移行、consumer=0、rollback receipt、legacy削除を順序付ける","public behavior・persistence semantics・dependent oracleを再検証し契約追加と削除を混載せず可逆にする","新behaviorまたはpublic contract変更を検出したらRefactorを停止しAdd-feature等へrouteする","Issue、PLAN、branch、PR、CI、post-merge schedule、工程表、DB next_actionを同一frontierから決定する","GitHub表示・工程表・schedule・DBが不一致なら上書きせずRecoveryへ移し、legacy削除は先行evidenceまでreadyにしない","作業PRはrepo／PR／base HEAD／head HEADをkeyにwriter leaseを持ち、reviewerのpushとremote更新を拒否する","active leaseのpoll/heartbeat/TTLと同一PR・HEADのlease acquireを要求し、観測だけでは作業を開始しない","release/acquire eventを同一HEADへ連続記録し、handoff時に旧writer・旧HEAD・相反takeoverをconsume/supersedeする","TTL切れやstale worktreeはreceiptを確認してからRecoveryし、競合・HEAD drift・別worktree writeをfail-closeする","Atomicityとして1 behavior contract・1 ownerを持ち独立merge可能変更を混載しない","targeted選択は省略集合digestとfull回収receiptを持ちcoverage相殺とsilent skipを許可しない","mini-refactor各stepはrollback可能でlegacy削除前にconsumer=0と復旧receiptを要求する","PR writerをexactly-oneとしlease・HEAD・worktree・sessionを再検証できないwriteを拒否する","fixtureをexactly-one behavior contractとDDD ownerへ束縛し複数aggregate等を拒否する","impact profile、post-merge/nightly回収、terminal receipt link、unknown/high-risk fail-closeを受入れる","legacy削除taskのcharacterization、dual-green、consumer移行、consumer=0、rollback順序欠落をblockする","GitHub、PLAN、schedule、DB next actionを同一frontierへ収束させ不一致をRecoveryにする","同時write、read-only push、stale lease横取り、相反takeoverを拒否しhandoffを同一HEADへ束縛する","1 behavior／1 owner、path family、予定path全集合を実差分へ照合し予定外・unsafe・companion欠落を拒否する","behavior contract IDを共有parserで2〜6 segmentへ正規化し7以上・不正文法をfail-closeする","本書はL3契約を定義しimpact selector等のL4以降降下と未完了境界を明示する","L3〜L7 PLANへbehavior_contract_id等のfieldを記録する","not_applicableは理由付きで許容し、field省略や独立behaviorの束ね書きによる原子性偽装を拒否する"]'''
EXPECTED_NORMALIZED_STATEMENTS = json.loads(EXPECTED_NORMALIZED_STATEMENTS_JSON)
EXPECTED_NORMALIZED_STATEMENTS_DIGEST = "b68c84ada69f6743622bf8d882f6f2be85d698b28bff3deba6a01f7e3ad3f258"
EXPECTED_SHARED_RELATIONS_JSON = r'''[{"atom_ids":["RDP002048-SEM-GH-FR-024-BEHAVIOR-CONTRACT","RDP002048-SEM-GH-FR-024-OWNER-EXCLUSION"],"reason":"line 37 continues the slice contract list and the exactly-one owner clause","relation_id":"DOC002-SHARED-001"},{"atom_ids":["RDP002048-SEM-GH-FR-024-ID-GRAMMAR","RDP002048-SEM-GH-FR-024-ID-REJECTION"],"reason":"line 48 carries both grammar constraints and explicit rejection conditions","relation_id":"DOC002-SHARED-002"},{"atom_ids":["RDP002048-SEM-GH-FR-025-PERFORMANCE-RECEIPT","RDP002048-SEM-GH-NFR-009","RDP002048-SEM-GH-NFR-010"],"reason":"FR025 performance receipt embeds the NFR-009/NFR-010 budget identifiers and conditions","relation_id":"DOC002-SHARED-003"}]'''
EXPECTED_SHARED_RELATIONS = json.loads(EXPECTED_SHARED_RELATIONS_JSON)
EXPECTED_SHARED_RELATIONS_DIGEST = "ab9f79718cb522eafe7e270b3f906dbd590442941dfed51fafd1c694ffc19bb3"
EXPECTED_PRODUCT_BOUNDARY = json.loads(r'''{"allocation_rule":"V-model／要求・設計・検証contractはHARNESS候補、GitHub／CI／state／DB／projection運転はOS consumer候補。Web／Web-OSも分母から除外せず、DOC-002直接target根拠が未確認なら未割当を維持する。","approved_product_vocabulary":["HELIX-HARNESS","HELIX-OS","HELIX-Web","HELIX-Web-OS"],"boundary_status":"candidate_only","consumer_candidates":["HELIX-OS"],"current_authority_claim":false,"owner_candidates":["HELIX-HARNESS","HELIX-OS"],"owner_decision":"unresolved","product_candidates":["HELIX-HARNESS","HELIX-OS","HELIX-Web","HELIX-Web-OS"],"sources":[{"path":"docs/concept/product-boundary.md","sha256":"097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"},{"path":"docs/helix-harness/L1-planning/product-intent.md","sha256":"a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04"},{"path":"docs/helix-os/L1-planning/system-intent.md","sha256":"0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8"},{"path":"docs/helix-web/L1-planning/product-intent.md","sha256":"26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756"},{"path":"docs/helix-web-os/L1-planning/system-intent.md","sha256":"600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c"}]}''')
EXPECTED_CANDIDATE_RESOLUTION = json.loads(r'''{"authority_scope":"none","consumer_scope":"pending","degraded_scope":"unknown","failure_scope":"unknown","implementation_scope":"unknown","phase_scope":"PHCAP-11_or_PHCAP-18_candidate","product_scope":"four_product_candidate_denominator","semantic_atomization_scope":"independent_contract_refusal_acceptance_units_with_explicit_shared_relations","source_scope":"file_blob","state":"unresolved"}''')
EXPECTED_REVIEW_LIMITS = json.loads(r'''["候補target、owner、phase、product、consumerは独立review前の仮分類でありauthorityではない","shared_source_relationsは同一原文fragmentが複数意味単位へ関係する事実を示すだけで、atomの重複採用・意味同値・統合を生成しない","failure/degradation語はsource条件・metric・拒否条件として保持し、観測failureや縮退実装の証拠へ変換しない","旧archive source、旧test、旧runtime、旧CI、旧hook、旧adapterは実行していない","候補検証の合格は要求採否、実装、L3/L10/L11完了、release、consumer closureを意味しない"]''')
EXPECTED_COVERAGE_POLICY = json.loads(r'''{"atom_overlap_requires_shared_relation":true,"atom_union_and_residuals_cover_all_source_lines":true,"fail_close_on_source_digest_or_line_text_drift":true,"overlap_allowed_between_semantic_atoms":true,"reference_edges_must_match_source_holding_exactly":true,"residuals_are_not_dropped":true,"semantic_unit_is_not_derived_from_line_count_alone":true,"shared_relation_is_not_line_split":true}''')
EXPECTED_CLOSURE_GUARD = json.loads(r'''{"adoption_state":"none","authority_effect":"none","holding_closure":"not_performed","human_decision_ref":null,"meaning_change_applied":false,"prohibited_inference":["owner adoption","phase authority","legacy implementation","degraded implementation","failure closure","consumer closure","acceptance completion","L3/L10 freeze","runtime or CI readiness","successor assignment"],"reference_carry_status":"preserved_pending_atomization","source_carry_status":"preserved_pending_atomization","successor_requirement_ids":[]}''')
EXPECTED_KEYSETS = json.loads(r'''{"$":["atom_denominator","atoms","authority_effect","candidate_id","candidate_resolution","closure_guard","comparison","coverage_policy","equivalence_claim","human_decision_ref","ledger_provenance","legacy_asset_review","meaning_change_applied","normalized_statements","normalized_statements_digest","old_runtime_test_ci_execution","product_boundary","reference_edges","review_limits","schema","semantic_atoms_digest","shared_source_relations","shared_source_relations_digest","source_document","status","successor_requirement_ids","unresolved_source_lines"],"$.atom_denominator":["atom_covered_lines","atom_unresolved_lines","phase_candidates","product_candidates","reference_edges","semantic_atoms","shared_source_relations","source_bytes","source_documents","source_lines"],"$.atoms[]":["actors","authority_conditions","candidate_granularity","candidate_kind","candidate_target","consumer_candidates","legacy_state","negative_conditions","normalized_statement","original_id","owner_candidates","possible_conflicts","product_candidates","questions","reference_edge_ids","related_original_ids","retained_meaning","semantic_atom_id","source_document_id","source_line_ids","source_path","source_revision","source_span"],"$.atoms[].legacy_state":["asset_class","asset_id","authority_status","consumer_refs","consumer_status","decision_history_evidence","decision_status","degraded_evidence_state","degraded_status","disposition","failure_evidence_state","failure_status","implementation_evidence_state","implementation_status","legacy_execution_performed","legacy_implementation_status","phase_authority_status","phase_candidates","phase_status","product_candidates","unresolved"],"$.atoms[].source_span":["end_line","exact_source_text","sha256","start_line"],"$.candidate_resolution":["authority_scope","consumer_scope","degraded_scope","failure_scope","implementation_scope","phase_scope","product_scope","semantic_atomization_scope","source_scope","state"],"$.closure_guard":["adoption_state","authority_effect","holding_closure","human_decision_ref","meaning_change_applied","prohibited_inference","reference_carry_status","source_carry_status","successor_requirement_ids"],"$.comparison":["archive_path","current_head","current_ref","existing_candidate_connection","existing_candidate_note","method","selected_reference_edge_ids","semantic_granularity","source_blob_oid","source_byte_count","source_commit","source_document","source_line_count","source_path","source_sha256"],"$.comparison.existing_candidate_connection":["binding_id","binding_path","binding_sha256","candidate_inventory_sha256","candidate_path","overlap","relationship","shared_reference_edges","shared_source_documents","unresolved_relation","unshared_scope"],"$.comparison.existing_candidate_note":["binding_id","candidate_path","handling","scope"],"$.coverage_policy":["atom_overlap_requires_shared_relation","atom_union_and_residuals_cover_all_source_lines","fail_close_on_source_digest_or_line_text_drift","overlap_allowed_between_semantic_atoms","reference_edges_must_match_source_holding_exactly","residuals_are_not_dropped","semantic_unit_is_not_derived_from_line_count_alone","shared_relation_is_not_line_split"],"$.ledger_provenance":["asset_disposition_path","asset_disposition_sha256","atomization_contract_path","atomization_contract_sha256","copy_read_after_path","copy_read_after_sha256","decision_log_path","decision_log_sha256","phase_product_path","phase_product_sha256","reference_holding_path","reference_holding_sha256","reference_holding_total","reuse_control_path","reuse_control_sha256","source_holding_path","source_holding_sha256","source_holding_total"],"$.legacy_asset_review":["asset_class","asset_id","authority_status","consumer_closure_status","consumer_history","consumer_refs","copy_read_after","decision_history","disposition","executability_status","external_effect_status","failure_history","implementation_status","legacy_execution_performed","phase_candidates","phase_classification_id","product_candidates","rights_status"],"$.legacy_asset_review.consumer_history":["consumer_refs","meaning","status"],"$.legacy_asset_review.copy_read_after":["matching_record_count","meaning","status"],"$.legacy_asset_review.decision_history":["matching_record_count","meaning","status"],"$.legacy_asset_review.failure_history":["meaning","status"],"$.product_boundary":["allocation_rule","approved_product_vocabulary","boundary_status","consumer_candidates","current_authority_claim","owner_candidates","owner_decision","product_candidates","sources"],"$.product_boundary.sources[]":["path","sha256"],"$.reference_edges[]":["carry_status","human_decision_ref","meaning_change_applied","reference_id","reference_origin","relation_key","source_file_sha256","source_line","source_path","target_archive_path","target_class","target_holding","target_path","target_sha256"],"$.shared_source_relations[]":["atom_ids","reason","relation_id","relation_kind","shared_source_fragments"],"$.shared_source_relations[].shared_source_fragments[]":["end_line","exact_source_text","sha256","start_line"],"$.source_document":["archive_path","atom_coverage","carry_status","holding_granularity","human_decision_ref","meaning_change_applied","sha256","source_declared_status","source_document_id","source_path","source_relation","successor_refs"],"$.source_document.atom_coverage":["covered_line_count","fail_close_rule","source_grounding","uncovered_line_count","uncovered_line_sha256","uncovered_lines"],"$.unresolved_source_lines[]":["atomization_status","classification_candidate","exact_source_text","line","meaning_change_applied","sha256"]}''')


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_digest(value: object, *, sort_keys: bool = True) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=sort_keys,
        separators=(",", ":"),
    ).encode("utf-8")
    return digest(payload)


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def check(candidate: dict | None = None, binding: dict | None = None) -> list[str]:
    errors: list[str] = []
    try:
        candidate = candidate or json.loads(CANDIDATE.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"E_CANDIDATE_READ:{exc}"]
    try:
        binding = binding or json.loads(BINDING.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"E_BINDING_READ:{exc}"]

    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)

    def check_keysets(value: object, path: str = "$") -> None:
        if isinstance(value, dict):
            expected = EXPECTED_KEYSETS.get(path)
            if expected is None:
                errors.append("E_KEYSET:" + path)
            elif set(value) != set(expected):
                errors.append("E_KEYSET:" + path)
            for key, child in value.items():
                check_keysets(child, path + "." + key)
        elif isinstance(value, list):
            for child in value:
                if isinstance(child, dict):
                    check_keysets(child, path + "[]")

    check_keysets(candidate)

    req(candidate.get("schema") == "helix-scaffold-delegated-doc-semantic-atom.v3", "E_SCHEMA")
    req(candidate.get("candidate_id") == "RDP-001-DELEGATED-DOC-002-ATOM-048", "E_ID")
    req(candidate.get("status") == "candidate_pending_independent_review", "E_STATE")
    req(candidate.get("authority_effect") == "none", "E_AUTHORITY")
    req(candidate.get("meaning_change_applied") is False, "E_MEANING")
    req(candidate.get("successor_requirement_ids") == [] and candidate.get("human_decision_ref") is None, "E_DECISION")
    req(candidate.get("equivalence_claim") is None, "E_EQUIVALENCE")
    req(candidate.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    req(candidate.get("normalized_statements") == EXPECTED_NORMALIZED_STATEMENTS, "E_NORMALIZED_STATEMENTS")
    req(
        candidate.get("normalized_statements_digest") == EXPECTED_NORMALIZED_STATEMENTS_DIGEST
        and canonical_digest(candidate.get("normalized_statements"), sort_keys=False)
        == EXPECTED_NORMALIZED_STATEMENTS_DIGEST,
        "E_NORMALIZED_DIGEST",
    )
    req(
        candidate.get("semantic_atoms_digest") == EXPECTED_SEMANTIC_ATOMS_DIGEST,
        "E_SEMANTIC_DIGEST",
    )
    req(
        candidate.get("shared_source_relations_digest") == EXPECTED_SHARED_RELATIONS_DIGEST,
        "E_SHARED_RELATION_DIGEST",
    )

    req(binding.get("id") == "SCF-B-0048" and binding.get("kind") == "scaffold", "E_BINDING_ID")
    req(binding.get("state") == "registered", "E_BINDING_STATE")
    req(binding.get("authority_effect", "none") == "none", "E_BINDING_AUTHORITY")
    req(binding.get("replacement", {}).get("formal_artifacts") == [], "E_FORMAL_ARTIFACT")
    req(all(isinstance(x, str) and x.startswith("scaffold/") for x in binding.get("artifacts", [])), "E_BINDING_ARTIFACT_SCOPE")

    guard = candidate.get("closure_guard", {})
    req(guard == EXPECTED_CLOSURE_GUARD, "E_CLOSURE_GUARD_PIN")
    req(guard.get("authority_effect") == "none", "E_GUARD_AUTHORITY")
    req(guard.get("meaning_change_applied") is False, "E_GUARD_MEANING")
    req(guard.get("successor_requirement_ids") == [], "E_GUARD_SUCCESSOR")
    req(guard.get("human_decision_ref") is None, "E_GUARD_DECISION")
    req(guard.get("source_carry_status") == "preserved_pending_atomization", "E_GUARD_SOURCE")
    req(guard.get("reference_carry_status") == "preserved_pending_atomization", "E_GUARD_REFERENCE")
    req(guard.get("adoption_state") == "none", "E_GUARD_ADOPTION")
    req(guard.get("holding_closure") == "not_performed", "E_GUARD_CLOSURE")
    req(guard.get("prohibited_inference") == EXPECTED_PROHIBITED, "E_GUARD_PROHIBITED")

    raw_path = ROOT / ARCHIVE_PATH
    if not raw_path.is_file():
        return errors + ["E_ARCHIVE_MISSING"]
    raw = raw_path.read_bytes()
    source_lines = raw.decode("utf-8").splitlines(keepends=True)
    comparison = candidate.get("comparison", {})
    req(comparison.get("source_commit") == SOURCE_COMMIT, "E_SOURCE_COMMIT")
    req(comparison.get("current_head") == "1d7f9a18dd89745b0ed0b9d6d3ed0f9437e47dff", "E_CURRENT_HEAD")
    req(comparison.get("source_path") == SOURCE_PATH and comparison.get("archive_path") == ARCHIVE_PATH, "E_SOURCE_PATH")
    req(comparison.get("source_blob_oid") == SOURCE_BLOB_OID, "E_SOURCE_BLOB_OID")
    req(comparison.get("source_sha256") == digest(raw), "E_SOURCE_SHA")
    req(comparison.get("source_line_count") == len(source_lines) == 133 and comparison.get("source_byte_count") == len(raw), "E_SOURCE_DENOM")
    req(comparison.get("selected_reference_edge_ids") == sorted(EXPECTED_EDGES), "E_SELECTED_EDGES")
    blob = subprocess.run(["git", "cat-file", "blob", f"{SOURCE_COMMIT}:{ARCHIVE_PATH}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    req(blob.returncode == 0 and blob.stdout == raw, "E_FIXED_BLOB")

    connection = comparison.get("existing_candidate_connection", {})
    req(connection.get("binding_id") == "SCF-B-0010", "E_B0010_ID")
    req(connection.get("relationship") == "complementary_candidate_scopes", "E_B0010_RELATION")
    req(connection.get("shared_source_documents") == [EXPECTED_DOC], "E_B0010_SHARED_DOC")
    req(connection.get("shared_reference_edges") == sorted(EXPECTED_EDGES), "E_B0010_SHARED_EDGES")
    req("DOC-013" in connection.get("unshared_scope", "") and "DOC-004" in connection.get("unshared_scope", "") and "DOC-029" in connection.get("unshared_scope", ""), "E_B0010_UNSHARED")
    unresolved_relation = connection.get("unresolved_relation", "")
    req("二者択一" in unresolved_relation and "adoption" in unresolved_relation and "authority" in unresolved_relation, "E_B0010_NO_PREEMPTION")
    for path_key in ("binding_path", "candidate_path"):
        req(Path(ROOT / connection.get(path_key, "")).exists(), "E_B0010_PATH_" + path_key)
    if connection.get("binding_path"):
        req(connection.get("binding_sha256") == digest((ROOT / connection["binding_path"]).read_bytes()), "E_B0010_BINDING_SHA")
    if connection.get("candidate_path"):
        inv_path = ROOT / connection["candidate_path"] / "inventory.json"
        req(connection.get("candidate_inventory_sha256") == digest(inv_path.read_bytes()), "E_B0010_CANDIDATE_SHA")

    rows = load_jsonl(ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl")
    refs = load_jsonl(ROOT / "docs/governance/delegated-requirement-document-reference-holding.jsonl")
    assets = load_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")
    phases = load_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")
    decisions = load_jsonl(ROOT / "docs/governance/legacy-asset-decisions.jsonl")
    read_afters = load_jsonl(ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl")
    req(len(rows) == 114 and len(refs) == 788, "E_HOLDING_DENOM")
    source_row = next((r for r in rows if r.get("source_document_id") == EXPECTED_DOC), None)
    req(source_row is not None, "E_SOURCE_HOLDING_ROW")
    doc = candidate.get("source_document", {})
    req(doc.get("source_document_id") == EXPECTED_DOC, "E_DOC_ID")
    if source_row:
        for key in ("source_path", "archive_path", "sha256", "source_declared_status", "source_relation", "holding_granularity", "carry_status", "meaning_change_applied", "successor_refs", "human_decision_ref"):
            req(doc.get(key) == source_row.get(key), "E_SOURCE_ROW_" + key)
        req(source_row.get("sha256") == digest(raw), "E_LEDGER_SOURCE_SHA")

    ref_by_id = {r.get("reference_id"): r for r in refs}
    cand_refs = {r.get("reference_id"): r for r in candidate.get("reference_edges", [])}
    req(set(cand_refs) == EXPECTED_EDGES, "E_REFERENCE_SCOPE")
    for rid in EXPECTED_EDGES:
        row = ref_by_id.get(rid); got = cand_refs.get(rid)
        req(row is not None and got is not None, "E_REFERENCE_MISSING_" + rid)
        if row and got:
            for key in ("source_path", "source_file_sha256", "reference_origin", "relation_key", "source_line", "target_path", "target_archive_path", "target_sha256", "target_class", "target_holding", "carry_status", "meaning_change_applied", "human_decision_ref"):
                req(got.get(key) == row.get(key), "E_REFERENCE_" + rid + "_" + key)
            req(row.get("source_path") == SOURCE_PATH and row.get("source_file_sha256") == digest(raw), "E_REFERENCE_SOURCE_" + rid)

    asset = next((a for a in assets if a.get("source_path") == SOURCE_PATH), None)
    phase = next((p for p in phases if p.get("source_path") == SOURCE_PATH), None)
    req(asset is not None and asset.get("asset_id") == ASSET_ID, "E_ASSET_ROW")
    req(phase is not None and phase.get("asset_id") == ASSET_ID, "E_PHASE_ROW")
    review = candidate.get("legacy_asset_review", {})
    if asset:
        for key in ("asset_id", "asset_class", "authority_status", "disposition", "implementation_status", "consumer_refs", "rights_status", "executability_status", "external_effect_status"):
            req(review.get(key) == asset.get(key), "E_ASSET_" + key)
    if phase:
        req(review.get("phase_classification_id") == phase.get("classification_id"), "E_PHASE_ID")
        req(review.get("phase_candidates") == phase.get("candidate_phase_targets"), "E_PHASE_CANDIDATES")
        req(review.get("product_candidates") == phase.get("candidate_product_targets"), "E_PHASE_PRODUCTS")
        req(review.get("consumer_closure_status") == "pending", "E_PHASE_CONSUMER")
        req(review.get("legacy_execution_performed") is False, "E_PHASE_EXECUTION")
    req(not [r for r in decisions if r.get("asset_id") == ASSET_ID], "E_DECISION_HISTORY_PRESENT")
    req(not [r for r in read_afters if r.get("asset_id") == ASSET_ID], "E_READ_AFTER_PRESENT")
    req(review.get("decision_history", {}).get("status") == "missing", "E_DECISION_HISTORY_STATUS")
    req(review.get("copy_read_after", {}).get("status") == "missing", "E_READ_AFTER_STATUS")
    req(review.get("failure_history", {}).get("status") == "not_present_as_observed_ledger", "E_FAILURE_HISTORY_STATUS")
    req(review.get("consumer_history", {}).get("status") == "pending" and review.get("consumer_history", {}).get("consumer_refs") == [], "E_CONSUMER_HISTORY")

    products = candidate.get("product_boundary", {})
    req(products == EXPECTED_PRODUCT_BOUNDARY, "E_PRODUCT_BOUNDARY_PIN")
    req(set(products.get("approved_product_vocabulary", [])) == PRODUCTS, "E_PRODUCT_VOCABULARY")
    req(set(products.get("product_candidates", [])) == PRODUCTS, "E_PRODUCT_DENOM")
    req(products.get("current_authority_claim") is False and products.get("owner_decision") == "unresolved", "E_PRODUCT_AUTHORITY")
    resolution = candidate.get("candidate_resolution", {})
    req(resolution == EXPECTED_CANDIDATE_RESOLUTION, "E_CANDIDATE_RESOLUTION_PIN")
    req(resolution.get("phase_scope") == "PHCAP-11_or_PHCAP-18_candidate", "E_PHASE_SCOPE")
    req(resolution.get("implementation_scope") == "unknown", "E_IMPL_SCOPE")
    req(resolution.get("degraded_scope") == "unknown", "E_DEGRADED_SCOPE")
    req(resolution.get("failure_scope") == "unknown", "E_FAILURE_SCOPE")
    req(candidate.get("review_limits") == EXPECTED_REVIEW_LIMITS, "E_REVIEW_LIMITS_PIN")
    req(candidate.get("coverage_policy") == EXPECTED_COVERAGE_POLICY, "E_COVERAGE_POLICY_PIN")

    atoms = candidate.get("atoms", [])
    atom_ids: set[str] = set()
    original_ids: set[str] = set()
    atom_lines_by_id: dict[str, set[int]] = {}
    atom_lines: set[int] = set()
    ref_seen: set[str] = set()
    for atom in atoms:
        aid = atom.get("semantic_atom_id")
        req(isinstance(aid, str) and aid.startswith(ATOM_PREFIX) and aid not in atom_ids, "E_ATOM_ID")
        atom_ids.add(aid)
        req(atom.get("source_document_id") == EXPECTED_DOC, "E_ATOM_DOC_" + str(aid))
        oid = atom.get("original_id")
        req(isinstance(oid, str) and oid not in original_ids, "E_ORIGINAL_ID_DUP")
        original_ids.add(oid)
        req(atom.get("source_revision") == SOURCE_COMMIT, "E_ATOM_REV_" + str(aid))
        span = atom.get("source_span", {})
        start, end = span.get("start_line"), span.get("end_line")
        req(isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(source_lines), "E_ATOM_BOUNDS_" + str(aid))
        if isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(source_lines):
            exact = "".join(source_lines[start - 1:end])
            req(span.get("exact_source_text") == exact, "E_ATOM_TEXT_" + str(aid))
            req(span.get("sha256") == "sha256:" + digest(exact.encode()), "E_ATOM_SHA_" + str(aid))
            expected_line_ids = list(range(start, end + 1))
            req(atom.get("source_line_ids") == expected_line_ids, "E_ATOM_LINE_IDS_" + str(aid))
            atom_lines_by_id[aid] = set(expected_line_ids)
            atom_lines.update(expected_line_ids)
        req(atom.get("candidate_target") == "unresolved", "E_ATOM_TARGET_" + str(aid))
        req(set(atom.get("product_candidates", [])) == PRODUCTS, "E_ATOM_PRODUCTS_" + str(aid))
        state = atom.get("legacy_state", {})
        req(set(state.get("product_candidates", [])) == PRODUCTS, "E_ATOM_LEGACY_PRODUCTS_" + str(aid))
        req(state.get("phase_candidates") == ["PHCAP-11", "PHCAP-18"], "E_ATOM_PHASE_" + str(aid))
        req(state.get("phase_authority_status") == "unconfirmed", "E_ATOM_PHASE_AUTHORITY_" + str(aid))
        req(state.get("legacy_implementation_status") == "unknown", "E_ATOM_IMPL_" + str(aid))
        req(state.get("degraded_status") == "unknown", "E_ATOM_DEGRADED_" + str(aid))
        req(state.get("failure_status") == "unknown", "E_ATOM_FAILURE_" + str(aid))
        req(state.get("consumer_status") == "pending" and state.get("consumer_refs") == [], "E_ATOM_CONSUMER_" + str(aid))
        req(state.get("decision_status") == "missing", "E_ATOM_DECISION_" + str(aid))
        req(set(atom.get("owner_candidates", [])) >= {"HELIX-HARNESS", "HELIX-OS"}, "E_ATOM_OWNER_" + str(aid))
        req("HELIX-OS" in atom.get("consumer_candidates", []), "E_ATOM_CONSUMER_PRODUCT_" + str(aid))
        req(atom.get("actors") and atom.get("authority_conditions") and atom.get("negative_conditions"), "E_ATOM_CONTEXT_" + str(aid))
        edge_ids = set(atom.get("reference_edge_ids", [])); ref_seen.update(edge_ids)
        req(edge_ids <= EXPECTED_EDGES, "E_ATOM_EDGE_SCOPE_" + str(aid))
        if start <= 9 <= end:
            req("DELEGATED-REF-0301" in edge_ids, "E_ATOM_EDGE_0301_" + str(aid))
        if start <= 130 <= end:
            req("DELEGATED-REF-0302" in edge_ids, "E_ATOM_EDGE_0302_" + str(aid))
    req(ref_seen == EXPECTED_EDGES, "E_ATOM_EDGE_COVERAGE")
    req(len(atoms) == candidate.get("atom_denominator", {}).get("semantic_atoms") == 49, "E_ATOM_COUNT")

    actual_semantic_atoms = [
        {field: atom.get(field) for field in SEMANTIC_ATOM_FIELDS}
        for atom in atoms
    ]
    req(actual_semantic_atoms == EXPECTED_SEMANTIC_ATOMS, "E_SEMANTIC_ATOM_PIN")
    req(
        canonical_digest(actual_semantic_atoms) == EXPECTED_SEMANTIC_ATOMS_DIGEST,
        "E_SEMANTIC_ATOM_DIGEST",
    )

    # Any source-line overlap must be declared as a shared semantic fragment.
    shared_relations = candidate.get("shared_source_relations", [])
    actual_shared_relations = [
        {field: relation.get(field) for field in ("relation_id", "atom_ids", "reason")}
        for relation in shared_relations
    ]
    req(actual_shared_relations == EXPECTED_SHARED_RELATIONS, "E_SHARED_RELATION_PIN")
    req(
        canonical_digest(actual_shared_relations) == EXPECTED_SHARED_RELATIONS_DIGEST,
        "E_SHARED_RELATION_LEDGER_DIGEST",
    )
    relation_ids: set[str] = set()
    allowed_pairs: set[frozenset[str]] = set()
    for relation in shared_relations:
        rid = relation.get("relation_id")
        req(isinstance(rid, str) and rid not in relation_ids, "E_SHARED_RELATION_ID")
        relation_ids.add(rid)
        ids = relation.get("atom_ids", [])
        req(len(ids) >= 2 and len(set(ids)) == len(ids) and set(ids) <= atom_ids, "E_SHARED_RELATION_ATOMS_" + str(rid))
        for left, right in combinations(ids, 2):
            pair = frozenset((left, right)); allowed_pairs.add(pair)
            req(atom_lines_by_id.get(left, set()) & atom_lines_by_id.get(right, set()), "E_SHARED_RELATION_NO_OVERLAP_" + str(rid))
        fragments = relation.get("shared_source_fragments", [])
        req(fragments, "E_SHARED_RELATION_FRAGMENT_" + str(rid))
        for fragment in fragments:
            start, end = fragment.get("start_line"), fragment.get("end_line")
            req(isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(source_lines), "E_SHARED_FRAGMENT_BOUNDS_" + str(rid))
            if isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(source_lines):
                exact = "".join(source_lines[start - 1:end])
                req(fragment.get("exact_source_text") == exact, "E_SHARED_FRAGMENT_TEXT_" + str(rid))
                req(fragment.get("sha256") == "sha256:" + digest(exact.encode()), "E_SHARED_FRAGMENT_SHA_" + str(rid))
                for aid in ids:
                    req(set(range(start, end + 1)) <= atom_lines_by_id.get(aid, set()), "E_SHARED_FRAGMENT_MEMBER_" + str(rid))
    actual_pairs: set[frozenset[str]] = set()
    for left, right in combinations(sorted(atom_ids), 2):
        overlap = atom_lines_by_id.get(left, set()) & atom_lines_by_id.get(right, set())
        if overlap:
            actual_pairs.add(frozenset((left, right)))
    req(actual_pairs == allowed_pairs, "E_UNDECLARED_ATOM_OVERLAP")
    req(len(shared_relations) == candidate.get("atom_denominator", {}).get("shared_source_relations") == 3, "E_SHARED_RELATION_COUNT")

    residual = candidate.get("unresolved_source_lines", [])
    residual_nums = {x.get("line") for x in residual}
    req(len(residual_nums) == len(residual), "E_RESIDUAL_DUP")
    for rec in residual:
        n = rec.get("line")
        req(isinstance(n, int) and 1 <= n <= len(source_lines) and n not in atom_lines, "E_RESIDUAL_OVERLAP")
        if isinstance(n, int) and 1 <= n <= len(source_lines):
            exact = source_lines[n - 1]
            req(rec.get("exact_source_text") == exact, "E_RESIDUAL_TEXT")
            req(rec.get("sha256") == "sha256:" + digest(exact.encode()), "E_RESIDUAL_SHA")
            req(rec.get("atomization_status") == "unresolved_not_dropped", "E_RESIDUAL_STATUS")
    req(atom_lines | residual_nums == set(range(1, len(source_lines) + 1)), "E_FULL_LINE_COVERAGE")
    req(atom_lines.isdisjoint(residual_nums), "E_LINE_PARTITION")
    doc_coverage = candidate.get("source_document", {}).get("atom_coverage", {})
    req(doc_coverage.get("covered_line_count") == len(atom_lines), "E_DOC_COVERED_LINES")
    req(doc_coverage.get("uncovered_line_count") == len(residual_nums), "E_DOC_UNCOVERED_LINES")
    req(doc_coverage.get("uncovered_lines") == sorted(residual_nums), "E_DOC_UNCOVERED_LIST")
    expected_residual_text = "".join(source_lines[n - 1] for n in sorted(residual_nums))
    req(doc_coverage.get("uncovered_line_sha256") == "sha256:" + digest(expected_residual_text.encode()), "E_DOC_UNCOVERED_SHA")
    req(doc_coverage.get("source_grounding") and doc_coverage.get("fail_close_rule"), "E_DOC_COVERAGE_POLICY")

    den = candidate.get("atom_denominator", {})
    req(den.get("source_documents") == 1 and den.get("source_lines") == 133 and den.get("source_bytes") == len(raw), "E_ATOM_DENOM_SOURCE")
    req(den.get("atom_covered_lines") == len(atom_lines) and den.get("atom_unresolved_lines") == len(residual_nums), "E_ATOM_DENOM_COVERAGE")
    req(den.get("reference_edges") == 2 and den.get("product_candidates") == 4 and den.get("phase_candidates") == 2, "E_ATOM_DENOM_OTHER")
    return errors


if __name__ == "__main__":
    errors = check()
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        raise SystemExit(1)
    inv = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    print("PASS RDP-001 DOC-002 semantic atom candidate: lines=133 atoms=%d residual=%d shared_relations=%d edges=2 products=4" % (len(inv["atoms"]), len(inv["unresolved_source_lines"]), len(inv["shared_source_relations"])))
