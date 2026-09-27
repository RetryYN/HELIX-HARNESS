# HELIX-SECURITY 機構内監査の消化（2026-09-27）

[監査](helix-security-internal-audit-2026-09-27.md)のS-1/S-2/S-4/S-5をL11へ追補した。L2意味・親・版・既存受入の列挙は保持する。

## 旧sourceと変更理由

| Asset / source（path、行、SHA-256） | 保持する意味 | 現行での変更・限定 |
|---|---|---|
| LEGACY-ASSET-322CD23B625A08E2BFB3, archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requests.md:14-24,28-38,40-44, SHA c6d76cd77529eea34518c554a555ed255cff390a34faf679806e50450c4df447 | 認可された対象、操作、環境、network/data scope、期限、scope drift/revoke時停止、sensitive evidence保護 | PO L1-008/009の明示的拡張によりauthority境界をsecurity engagementからHELIX全操作へ広げる。旧special engagementのplan/human gateを新しい通常作業の承認へ持ち込まない。L1-008/009のscope拡張はPO判断記録に人の確認事項として残っている（L1 lines 84-86、decision「人の判断が残る点」）。 |
| LEGACY-ASSET-B62E49D2E156232B8C63, archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/security-capability-broker-authority.md:30-80, SHA 161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7 | operation, target, provenance, data/sink, impact, approval, postcondition, rollback, expiryを分離し、欠落/unknownをfail closed | 意味とfailure境界を再導出。旧schema、実装、runtime、CLI、物理target実装詳細を現行要求や合格証拠へ継承しない。 |
| LEGACY-ASSET-170112AB2FA2FFDBFEE9, archive/legacy-generation-2026-09-14/root/docs/test-design/helix/security-capability-broker-acceptance.md:20-30, SHA b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4 | unknown/欠落、identity drift、credential/PII egress、rollback欠落、sandbox未対応、部分成功をnegative oracleにする | test designを実行しない。oracleの意味だけを現L11の入力・失敗例に対応させる。 |
| LEGACY-ASSET-99C939E249CAF40935CB, archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md:61-64, SHA f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2 | secret-like tokenの判定をsingle sourceへ置く | 旧module/code/APIはcopyせず、PO L1-005のcontext/artifact/egress/revokeまで意味を広げる。 |
| LEGACY-ASSET-EE5DBACC7F28F7D1F605, archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:186,297-300, SHA 7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544。関連 LEGACY-ASSET-B8BBC1D5A8C91E746405, archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/pillar-basic-design.md:145-146, SHA d010289ee78b054642bb170164808144bf842be8e01454fb19d7a67fb309cc56 | external text分離、prompt/tool injection・exfil誘導の分類、監査、deny/review/redaction | 完全検出を主防御とせず、未信頼dataからauthorityへ直接届く経路を作らない（L1-001/002）。旧filter技術を移植しない。 |
| PO原文 §15、§19（対応旧要求を探索した範囲はL1 lines 90-92、L2 lines 392-394） | 旧の対応要求なし | 永続化promotionのpolicy/判定と内部構造probing観測はPO原文起点の新候補と明示。旧実装がないことを新規制約の理由にしない。 |

旧sourceとの対応・保持/変更の判断はL1 lines 80-97とL2 lines 381-403も照合した。過去の旧runtimeやtest/CIを実行せず、旧greenや既存コードの存在を合格証拠にしない。

## 処置と受入への対応

| 監査候補 | 消化した本文 | 保持・反例 |
|---|---|---|
| S-1 | L11-007と9制御fixture | read-onlyでもwrite禁止・対象scopeの変更なしを確認する。変更なしを確認した場合のみrollback適用対象外、unknownは合格でない。fixture値は普遍閾値にしない。 |
| S-2 | L11-009 | security triggerと該当identity/recipientへの停止を保持。無関係な意味unknownを全操作停止へ広げず、影響不明の外部副作用は止める。 |
| S-3 | 本文変更なし | 15更新対象は維持。元本文に毎run人承認の要求はなく、新たな承認手続きを設けない。 |
| S-4 | L11-003 | 原文のproject/tenant/environment/worktree、state/Agent/Hook/credential/memory/artifactの列挙を保持。合成tenantはscope keyであり、顧客runtimeを1.0へ要求しない。適用tenantの照合は省かない。 |
| S-5 | L11-020 | Guard/Botの全例を保持。Core Asset Guardの名称から019/025の1.x公開sinkを前倒しせず、credential/一般egress/operationの1.0保護は延期しない。 |

consumer点検で追加したCONNECT-002はCONNECTの消化PR、INFRA-010はINFRAの消化PRへ渡す。本PRでその本文を修正済みとは主張しない。

GPT6 Luna highの下書きをCodex executionが原文に照合し、既存列挙を削らない追補へ統合した。旧資産は静的参照のみで旧runtime/CI/testは実行しない。独立reviewはClaude。要求採択・実装許可・実測合格を生成しない。
