# World Governance 次の10行 route audit（after #2386）

- 状態: route監査案。base `0f5050e2b25cd622640c99c5de170cca087f7d8a`。authority effect: none。
- この文書の対象は段階・Release/証拠・shadow/enforce提案を含む10行のみ。残り20 IDは未レビューとして下記に分離し、30行監査完了を主張しない。
- #2353 baseline と #2356/#2360/#2363/#2366/#2367/#2368/#2369 overlays、#2370 proposal-effective定義とのexact-ID照合を継承し、全10行が#2370 pool内、#2385後471 pool内。
- 固定採択revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 direct predicatesを使用し、L11 acceptanceは別軸。unknownはunknownのまま。
- #2387はopen/draft（base一致）であるため、FRS2行はroute overlayとして適用せず、ID非重複比較のみ。

| Source ID | 旧source path:line | Asset ID | 判定 | 直接述語候補 | 残差 |
|---|---|---|---|---|---|
| `LEGACY-CAND-LINE-004530` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-acceptance.md:30` | `LEGACY-ASSET-6E496F15A88DE2181CF8` | **unknown** | directなし。比較のみ HARNESS-L2-005（L2 product-requirements.md:56）／HELIXOS-L2-002（L2 governance-requirements.md:55）; L11: Harness product-acceptance.md:25／OS governance-acceptance.md:22 | 誤停止・待ち時間・p95・再実行費用・許容値の比較は固定採択L2/L11にない。HARNESSの顧客向けprocess conditionやOSの証拠記録と語彙が近いだけで、HWGの性能合否へ接続しない。 |
| `LEGACY-CAND-LINE-004590` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:72` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **unknown** | directなし。比較のみ HARNESS-L2-003（L2 product-requirements.md:193）／HELIXOS-L2-004（L2 governance-requirements.md:441–442）; L11: OS governance-acceptance.md:213,215 | 現行#1500の着手制約の改版、read-only/shadow先行、全域enforce後段化は既存採択述語から導けない。旧Issueの制約をこの監査で変えない。 |
| `LEGACY-CAND-LINE-004611` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:103` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-002, HARNESS-L2-004 | Module/Slice/Bundle/Waveの分割・責務・昇格・構成モデル、各requirementの提供先/保留分類、独立更新/rollback単位、内部利用のowner/再評価条件は採択されていない。全体完了待ちの禁止からSlice概念やWorld全体の出荷方式を採択したと推定しない。 |
| `LEGACY-CAND-LINE-004620` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:116` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-007 | 全Worldを対象にしたread-only inventory、snapshotの母集合/走査範囲、receiptの形式・受領条件、文書完成とcore完成の区別は採択predicateにない。 |
| `LEGACY-CAND-LINE-004622` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:118` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-002 | 全Worldの入口への全量展開、Worldの内部責務/Release catalog、外部配布検収の分担は採択されていない。HELIXOS-L2-006とHARNESS-L2-006はサービス①〜⑦の顧客向け提供predicateであり、product_target未解決のWorld sourceへ直接割り当てない。 |
| `LEGACY-CAND-LINE-004632` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:131` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-002 | 内部利用を公開完了とみなさない規則、未検証Sliceをstableへ混入させないentry gate、HWG独自のSlice公開判定は採択されていない。 |
| `LEGACY-CAND-LINE-004634` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:133` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXSECURITY-L2-008 | shadowからenforceへの昇格条件、rollback検証手順、旧保護の保持確認は採択されていない。L2-009は異常時のrevoke/quarantine伝播predicateであり、この行のrollback/保護維持要件との直接一致とは数えない。 |
| `LEGACY-CAND-LINE-004700` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requests.md:15` | `LEGACY-ASSET-916722580D7518F96EB3` | **partial** | HELIXOS-L2-002 | HWG機能を独立した提供単位へ分解する粒度、段階導入、統制コスト指標は採択predicateにない。HELIXOS/HARNESS-L2-006は外部顧客向けサービス①〜⑦の提供単位であり、product_target未解決のHWG internal sliceへ転用しない。 |
| `LEGACY-CAND-LINE-004736` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:49` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **partial** | HELIXOS-L2-002, HARNESS-L2-004 | Module/Slice/Bundle/Waveの分割・責務・昇格・構成モデル、各requirementの提供先/保留分類、独立更新/rollback単位、内部利用のowner/再評価条件は採択されていない。全体完了待ちの禁止からSlice概念やWorld全体の出荷方式を採択したと推定しない。 |
| `LEGACY-CAND-LINE-004746` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:63` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **unknown** | directなし。比較のみ HELIXOS-L2-002（L2 governance-requirements.md:55）／HELIXSECURITY-L2-008（L2 security-requirements.md:140–148）; L11: OS governance-acceptance.md:213,215／SECURITY security-acceptance.md:32–33 | 検証済みscopeのshadow検査、entry-control有効化、HWG自身でのdogfoodを段階遷移条件とする採択L2/L11はない。SECURITY-L2-008は実操作の個別認可を規定するが、旧候補のshadow-to-enforce gateとは別。先行#2375行004621のunknown判定に今回の行を揃える。 |

## 集合・件数検算（対象10行）

- 選択10: 004530, 004590, 004611, 004620, 004622, 004632, 004634, 004700, 004736, 004746。partial 7 / unknown 3。
- 未レビュー残20 ID: 004532, 004535, 004628, 004652, 004662, 004665, 004666, 004667, 004668, 004684, 004702, 004715, 004744, 004745, 004747, 004748, 004751, 004753, 004754, 004755。
- 選択10は prior 181、World first30、#2384 MA8、#2386 DGH7、#2385 classification7、#2387 draft FRS2 の各集合と交差0。
- prior181とWorld first30を合わせた211 ID、および今回10行が60-row family auditの既存和集合。World 60行はfirst30 + remaining30の分割、重複0。
- Asset ledger上の4 assetすべて `product_target=unresolved`、disposition `unresolved`。
- HARNESS-L2-017/022等のFRS語彙近似をWorld候補へ移植せず、L2/L11 authority・採択は生成しない。

## 旧source起点と意味上の注意

- 参照した旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-acceptance.md:30`; `.../world-governance-intake.md:72,103,116,118,131,133`; `.../world-governance-requests.md:15`; `.../world-governance-requirements.md:49,63`。資産IDは各行に記載。
- 原文はWorld Modelを既存authorityから再構築可能なprojectionとし、独立の正本・DB・graph/policy/admission engineを作らない。#1500のepoch-exit着手制限、shadow/enforce phase、独自Slice/Module/Bundle/Wave、性能閾値や公開許可をこのroute監査で採択・変更しない。
- 004530（性能許容値）、004590（#1500制限変更）、004611/004736（Module/Slice/Bundle/Wave）、004634/004746（shadow→enforce/rollback）は部分的に近い語彙があっても提案固有残差を保持。
- Read-only static inspection only。archive source/old runtime/test/CI/tool was not executed. JSON records exact hashes, row source digests, pinned requirement digests, and limitations.
