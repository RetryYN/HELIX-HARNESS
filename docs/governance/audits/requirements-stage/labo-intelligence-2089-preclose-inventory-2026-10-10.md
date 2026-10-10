# LABO／INTELLIGENCE責務分離Issue #2089の完了前照合

基準main `7c7c4a4680c51bec6f754a1ff862b07ddaeb45d2`、authority_effect: none。[JSON証拠](labo-intelligence-2089-preclose-inventory-2026-10-10.json)、SHA-256 `3d4a381c519f85cecb986fdc1eb6e07047b440ece9ec4987fc72cb431ae375eb`。

完了条件は調査inventory・比較表・未判断・人間判断材料の成立であり、旧要求全移管やruntime構築ではない。その調査範囲で9項目を照合しても、現時点ではcloseの証拠が足りない。

## 9項目の現在の証拠と残作業

| ID | 状態 | 本文の要求 | 確認できた範囲／不足 | 次の処理 |
|---|---|---|---|---|
| C01 | partial | 関連する現行要求・旧要求・旧資産・consumerの無損失inventory | 既存直接source監査は40機構対応/31pathに限定。今回1861の名指し33入力を原carry recordと全文行/heading bodyで保全したが、全関連consumer/補足sourceのinventory閉包を証明していない。 | 関連source/consumerの追加辺と未計上を確認する。 |
| C02 | missing | requirement atomごとの `OS保持 / LABO候補 / connection / split / unresolved` 比較表 | OS005/007/012/013と原33要求の全atom別OS保持/LABO候補/connection/split/unresolved表は未確認。原inputを保全したことを比較完了にしない。 | 33原要求のliteral条件/例外/数値/consumerを個別に比較する。 |
| C03 | partial | 原ログ、運転memory、研究dataset、知識資産、model artifactのdata ownership表 | 原証拠/運転memoryはOS、評価材料はLABO、汎用設計知識はBRAIN、3.0学習dataset/model candidateはINTの記載を確認した。単一表で全data objectのwriter/adoption/利用区分/retentionを対応づけた証拠は不足。 | data objectごとにsource writerと評価/学習用途を分ける。 |
| C04 | partial | OS停止非依存、LABO停止非依存、再送・重複排除・欠測・取消の受入候補 | 受渡しのstale/再送/重複/欠測は個別契約にあるが、双方停止とOS監査保全/継続を同じscopeで照合する全条件の証拠は未確認。 | 停止中source/receiver、再送、失効と元義務保全を対L11へ対応づける。 |
| C05 | partial | HARNESS／OS／LABO／Web／Web-OS間のauthority・write・adoption境界 | Concept/product boundaryと機構別採択はsource authorityを評価/candidateから分ける。WEB/WEB-OSのVision条件を採択済み要求として扱わない。全関連atomへの結合は未完。 | 各送受信のwriter/authority/adoption境界を全atomへ結ぶ。 |
| C06 | partial | 機密・PII・tenant data・同意範囲外logを学習へ流さない条件 | 既存の許可scope、data class、holdout/prohibited隔離、同意外log禁止を確認。全tenant/export/cancel/retention条件を同じ対象scopeで照合した全量表は未確認。 | 原sourceとdata利用ごとのscope/consent/revoke/retentionを対応づける。 |
| C07 | missing | 単一repository/moduleで始める場合と、別repository/serverへ分離する場合の判断条件 | 既存の要求上の結合/交換境界はmodule/network topologyを確定しない。単一repo/module対別repo/serverの判断条件を固定した資料は確認できない。 | 既存旧sourceの判断根拠と未決の物理判断を特定する。新しい規則として補完しない。 |
| C08 | missing | 移管しても旧要求identity、failure、consumer、未解決を失わないcoverage | 今回の33原recordと既存40source対応は失わず保持したが、全failure/consumer/未解決のatomcoverage receiptを生成していない。原record存在や採択対象の列挙を全被覆にしない。 | 全source/consumer条件から比較表へのcoverageと未計上を照合する。 |
| C09 | partial | 対象revision付きの人間判断packet | LABO/INT/OSの9/28採択対象は固定decisionにある。これにより機構追加の判断はあるが、本Issueが要求する全inventoryと比較結果に結び付いた判断packetの完了を代替しない。 | 上記未判断を含む全比較表を既存decision対象と分けて判断材料へ固定する。 |

## 原入力の保全

関連#1861が列挙する全33 ID（IR10、confirmed23）をsource-qualified identity、原文行、原carry recordとともに保全した。BR21とS-BR-001は見出し行だけでなく節本文も保持した。旧数値、cold-start/opt-in、削除の人間確認、failure、別consumerを削っていない。これはatom別比較や移管の証拠ではない。

| identity | 母集団 | 主／副 | source行／pointer |
|---|---|---|---|
| `harness/L1-requirements/business-requirements.md::BR-21` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 368 |
| `harness/L1-requirements/business-requirements.md::D-01` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 196 |
| `harness/L1-requirements/business-requirements.md::D-02` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 197 |
| `harness/L1-requirements/business-requirements.md::D-03` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 198 |
| `harness/L1-requirements/business-requirements.md::D-04` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 199 |
| `harness/L1-requirements/business-requirements.md::D-05` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 200 |
| `harness/L1-requirements/business-requirements.md::D-06` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 201 |
| `harness/L1-requirements/business-requirements.md::D-07` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 202 |
| `harness/L1-requirements/business-requirements.md::D-08` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 203 |
| `harness/L1-requirements/business-requirements.md::D-09` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 204 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-19` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 50 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-20` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 51 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-34` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 65 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-36` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 67 |
| `helix/L1-requirements/pillar-requirements.md::HBR-P4` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` 54 |
| `helix/L1-requirements/skill-mechanism-migration-requests.md::S-BR-001` | confirmed175 | primary | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/skill-mechanism-migration-requests.md` 18 |
| `harness/L1-requirements/business-requirements.md::BR-22` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` 49 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-38` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 69 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-43` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 74 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-47` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` 78 |
| `harness/L1-requirements/screen-requirements.md::HM-08` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md` 140 |
| `helix/L1-requirements/pillar-requirements.md::HBR-P7` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` 56 |
| `helix/L1-requirements/pillar-requirements.md::HBR-P8` | confirmed175 | secondary | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` 57 |
| `HIL-BR-03` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-03 |
| `HIL-BR-11` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-11 |
| `HIL-BR-29` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-29 |
| `HIL-FR-10` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-10 |
| `HIL-FR-14` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-14 |
| `HIL-FR-57` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-57 |
| `HIL-FR-58` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-58 |
| `HIL-NFR-34` | legacy_ir153 | primary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-34 |
| `HIL-BR-23` | legacy_ir153 | secondary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-23 |
| `HIL-FR-44` | legacy_ir153 | secondary | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json` archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-44 |

既存の3機構source比較は40機構対応／31unique path。入力源・asset ID・SHA・元監査revision・比較範囲をJSONへ保持し、現在のarchive bytesのSHAを照合した。この限定母集団を全関連sourceや4,020資産の閉包へ拡張しない。

## 責務と版の読み方

RCLS候補保全とINT3.0モデル学習は別。旧OS294の「学習」という単語だけから責務衝突・自動移管・既存採択の取消を導かない。

OSは原証拠・運転memoryと未完義務、LABOは独立評価材料、BRAINは汎用設計知識、INTは判断候補と3.0のdataset/model lineageを、それぞれ対象契約の範囲で持つ。WEB/WEB-OS本文はVision材料であり、そこに書かれたexport条件を現行採択済み要求として扱わない。

## 直接参照

| ID | path | 行 | 確認対象 |
|---|---|---|---|
| E01 | `docs/helix-os/L2-requirements/governance-requirements.md` | 58–60 | 改善登録/原証拠はOS、評価と提案はLABO |
| E02 | `docs/helix-os/L2-requirements/governance-requirements.md` | 65–66 | 012/013の技術調査・横断診断移管案内と原記録保持 |
| E03 | `docs/helix-os/L2-requirements/governance-requirements.md` | 294–294 | 旧学習(RCLS)表現は他のcandidate境界と照合する |
| E04 | `docs/helix-os/L1-planning/system-intent.md` | 44–44 | 旧OS学習記述をOS単独責務と判定しない |
| E05 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 343–352 | RCLSは既存候補保全、WEB14条件も別candidate |
| E06 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 425–425 | INT1.0判断と3.0学習/4.0workflowの版境界 |
| E07 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 443–443 | RCLSをINTモデル学習pipelineへ重複実装しない |
| E08 | `docs/helix-brain/L2-requirements/brain-requirements.md` | 150–160 | 汎用知識promotionはBRAIN、LABO/OS/採否と別段階 |
| E09 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 168–195 | 3.0 dataset class/model lineage/比較/範囲/評価packet |
| E10 | `docs/concept/product-boundary.md` | 65–73 | WEB原dataと同意外logの吸収禁止 |
| E11 | `docs/helix-web/L2-requirements/product-requirements.md` | 16–16 | WEBはVision材料であり採択要求ではない |
| E12 | `docs/helix-web-os/L2-requirements/service-governance-requirements.md` | 15–15 | WEB-OSはVision材料であり採択要求ではない |

## closeの判定

9項目のうち全量inventory/atom比較/停止条件/物理分離判断/coverageが未証明。調査完了自体が未証明であり、full migrationが未完という理由だけで保留するのではない。

canonical・MPR・source holding・Binding・Issue本文は無変更。新しい要求、権限、承認手順や物理構成を提案／採択せず、旧CLI/runtime/test/CIも実行していない。
