# 新世代のSecurity engagementと旧SEA候補の対応

確認日: 2026-09-14

## 目的

`security-engagement-authority-{requests,requirements,acceptance}.md`の価値5項目、旧機能要件12件、旧非機能要件6件、
旧受入12件を、対象製品のsecurity要求、HARNESSの検証契約、HELIX-OSの操作・Worker・証拠統制へ再分類する。

旧候補は既存Security Capability Broker、provider admission、Requirement IR、DB、main read-afterを前提とする。
過去のplan固有human gateは新世代の製品境界・authority・実装を承認していないため継承しない。本表は要求源の照合であり、
credential、network、scan、exploit、production、disclosure、publishその他の実行権限を付与しない。

## 上位価値の再分類

| 旧価値 | 新世代接続先 | 再採否条件 | 状態 |
|---|---|---|---|
| target、期限、操作、環境、network／data scopeを実行前に確定する | 対象製品L2、HELIXOS-L2-001／004 | asset ownerと操作別authorityを対象ごとに承認する | authority_rederivation_required |
| 通常作業と特権security作業を分離する | HELIXOS-L2-003／004／007／009 | credential、queue、Worker、evidenceの新世代境界から導出する | operational_rederivation_required |
| findingの推定・再現・独立検証・修復を分ける | HARNESS-L2-005、HELIXOS-L2-005／007 | 対象製品のseverity・受入・disclosure要求と対にする | split_reapproval_required |
| revoke／scope driftで新規・実行中操作を停止する | HELIXOS-L2-004／009 | 新世代のlease・credential・network boundary確定後に設計する | semantic_atom_candidate |
| sensitive security dataを通常surfaceと配布物から除外する | 対象製品L2、HELIXOS-L2-007 | data classification、保管、保持、開示ownerを別途承認する | product_specific_reapproval |

## 要件の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| SEA-FR-001／002 | authorizationの対象・操作・環境・data・期限をexactに束縛し、不一致時は実行しない | 対象製品L2／L3、HELIXOS-L2-001／004 | `SecurityAuthorization`旧schema、provider class、既存brokerを固定しない | authority_rederivation_required |
| SEA-FR-003／004 | 通常・特権resourceとsecurity operation profileを分離する | HELIXOS-L2-003／004／007 | 旧class／profile enum、queue、lease、fallback、command registryを継承しない | schema_rederivation_required |
| SEA-FR-005 | 高影響操作にtarget・operation・revision・policy・期限を束縛した個別authorityを要求する | HELIXOS-L2-001／004／009 | 旧HEAD、policy digest、human authority schemaを包括的許可として使わない | authority_rederivation_required |
| SEA-FR-006 | raw valueを露出せず、authorizationから修復までの出典と結果を追跡する | HELIXOS-L2-007 | provider／runtime／model／sessionの旧receipt schemaを固定しない | evidence_rederivation_required |
| SEA-FR-007／008 | finding lifecycleを分け、作成側と独立検証側を分離する | HARNESS-L2-005、HELIXOS-L2-004／005／007 | 旧状態enum、同一authority判定、旧review方式を継承しない | split_reapproval_required |
| SEA-FR-009 | sensitive dataを分類し、通常surfaceへの保存・配布を拒否する | 対象製品L2／L3、HELIXOS-L2-007 | restricted store、暗号化、retention方式を未承認のまま固定しない | product_specific_reapproval |
| SEA-FR-010 | revokeを新規割当、実行中resource、network、artifact accessへ伝播する | HELIXOS-L2-004／007／009 | 旧lease、credential、network fence、terminal receiptを継承しない | operational_rederivation_required |
| SEA-FR-011 | AI可読security文書を承認上流から生成し、手編集から要求へ逆流させない | AIDOC-HARNESS／AIDOC-OS、HELIXOS-L2-001／007 | 旧Security IR、既存generated docs、現行AI文書を再利用しない | ai_doc_rederivation_required |
| SEA-FR-012 | security decisionをlicense・visibility・channelから分離し、内部情報を配布しない | HARNESS-L2-006、HELIXOS-L2-006／007 | 旧distribution mechanismやlicense enumを固定しない | split_reapproval_required |
| SEA-NFR-001..006 | fail-close、最小権限、機密性、独立性、取消可能性、provider非依存 | 対象製品L2、HARNESS-L2-005、HELIXOS-L2-004／007／009 | sloganだけで充足とせず、対象別oracleと実結果へ降ろす | nfr_reapproval_required |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| SEA-AC-001..005 | authority欠落、scope drift、特権fallback、自由式操作、高影響操作、sensitive receiptを拒否する | 対象製品L11／L10、HELIXOS L11／L10 | 旧provider、broker、command、HEAD、policy fixtureを継承しない | oracle_rederivation_required |
| SEA-AC-006..010 | 自己検証、情報流出、revoke不伝播、生成文書逆流、配布混入を拒否する | HARNESS L11、対象製品L11／L10、HELIXOS L11／L10 | 旧state、store、DB、GitHub、generated docs、channelをoracleにしない | split_oracle_reapproval |
| SEA-AC-011／012 | sandbox外network、production操作、依存機構failureの相殺を拒否する | 対象製品L10、HELIXOS L10 | 旧broker／attestation／legacy guard greenを新世代の検証入力にしない | execution_oracle_rederivation |

## 新世代の責務境界

1. 対象製品は、保護対象、data分類、許容・禁止操作、環境、network、保持、severity、開示、受入を所有する。
2. HARNESSは、security要求から設計・threat・verification・independent review・利用者受入へ接続する工程条件を所有する。
3. HELIX-OSは、操作別authority、特権Worker隔離、resource付与、停止・取消、証拠保全、修復・再検証の実行を統制する。
4. 候補、文書、Issue、過去承認、旧broker green、provider accessは実行権限ではない。
5. AI可読security文書は、対象別の承認上流とdata classificationから再生成し、restricted dataを通常AI contextへ含めない。

## 次工程

Concept v4.1と対象別L1／L2でsecurity engagementの利用者・対象・非対象を承認した後、操作別authorityと
data boundaryをL3／L10へ降ろす。実機操作と外部接続は別のaction-specific authorityを必要とする。
要求整理が閉じるまで旧broker、provider、credential、network、scan、exploit、production、既存CIを実行しない。
