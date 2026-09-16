# 5大目標・七大原則 対象別L1被覆監査

確認日: 2026-09-17
status: coverage_audit_only
authority_effect: none

## 目的

Concept v4.1候補へ接続した5大目標と七大原則について、現在の対象別L1候補32件で価値と適用境界をどこまで
表現できているかを確認する。既存L1要求を広く解釈して欠落を隠さず、同時に本監査から新要求、要求ID、採否、
successor、Issue、実装を生成しない。

## 対象revision

| 対象 | SHA-256 | 件数・役割 |
|---|---|---|
| [Concept v4.1候補](../../../concept/helix-concept-v4.1.md) | `181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad` | 5大目標と七大原則の接続、製品責務、authority、上流順序 |
| [5大目標候補](../../../concept/helix-five-goals.md) | `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca` | 5目標 |
| [七大原則候補](../../../concept/helix-principles.md) | `41d8fbe759bf24a7245df0597ddaa9c8eb6c4c0184b124ecd5d349e6c19a2dbb` | 7原則 |
| [HARNESS L1](../../../helix-harness/L1-planning/product-intent.md) | `a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04` | 9件 |
| [HELIX-OS L1](../../../helix-os/L1-planning/system-intent.md) | `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8` | 12件 |
| [HELIX-Web L1](../../../helix-web/L1-planning/product-intent.md) | `26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756` | 6件 |
| [HELIX-Web-OS L1](../../../helix-web-os/L1-planning/system-intent.md) | `600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c` | 5件 |

## 判定語彙

| 状態 | 意味 |
|---|---|
| `covered` | 目標の価値と主要責務が既存L1候補に明示され、L2で具体化できる |
| `partial` | 関連する既存L1はあるが、目標固有の利用者価値または責務分離を読み込まないと成立しない |
| `not_applicable_as_l1_value` | 行動規律であり、原則の存在だけを理由に製品L1要求を追加しない |

`partial`は既存L1へ暗黙包含しない。後続の要求候補として原source、対象、既存被覆、未被覆意味を管理層へ仮登録し、
別PRで採否するまで未解決のまま保持する。

## 5大目標のL1被覆

| 5大目標 | 既存L1接続 | 状態 | 未被覆または後続判断 |
|---|---|---|---|
| システム駆動エージェント自走システム | HARNESS-L1-001／002／004／006／008、HELIXOS-L1-001／002／003／004／008／009／010／012、HELIXWEB-L1-002／003、HELIXWEBOS-L1-002／004 | `covered` | L2でsystem state、停止・再開、要求非生成、証拠joinを具体化する。会話や個体memory依存へ戻さない |
| 開発するほど賢くなる自己知能型改善システム | HARNESS-L1-003／004／006／009、HELIXOS-L1-006／011／012、HELIXWEB-L1-005、HELIXWEBOS-L1-005 | `covered` | L2で観測、候補化、採否、再検証、効果確認を分け、学習結果からauthorityを直接変更しない |
| 設計から全体をシミュレーションする予測型システム | HARNESS-L1-003／004／009、HELIXOS-L1-002／008／010／012 | `partial` | 変更影響の伝達・診断はあるが、要求・domain・責務・依存・interface・state・failure・V-pair・検証・運用条件を用いた全体simulation、前提・不確実性・反証・実測差の利用者価値は明示されていない |
| CIとbotで品質とスピードを両立した非エンジニアでも作れるシステム | HARNESS-L1-001／002／004／005／006／008／009、HELIXOS-L1-004／009、HELIXWEB-L1-002／003／004、HELIXWEBOS-L1-004 | `partial` | 自動検査・証拠・判断UIの構成要素はあるが、非エンジニアが実装詳細を操作せず目的・進行・品質・未決・riskを理解して作れるHARNESS利用価値は明示されていない。HELIX-WebはVersion 1後の個別製品であり、HARNESS側の欠落を代替しない |
| 低コストワーカでも最高のパフォーマンスを発揮して最適配置するシステム | HARNESS-L1-002／004、HELIXOS-L1-003／010／011／012、HELIXWEB-L1-004 | `partial` | budget付き委譲・検証・再計画はあるが、作業特性とWorkerの品質・費用・時間・再作業・失敗実測を用いる配置価値、低コストWorkerの適用範囲、必要能力へのescalationは明示されていない |

## `partial`三領域の責務分離候補

この表は要求案を採用せず、次の個別判断で比較する責務境界を保持する。

| work unit | HARNESS側で比較する意味 | HELIX-OS側で比較する意味 | 個別製品側で比較する意味 |
|---|---|---|---|
| `L1-COV-G3-SIMULATION` | simulation入力・relation・不確実性・反証・検証義務の開発契約 | simulationの実行、revision付き記録、実測差、再計画、改善候補化 | 製品固有の価値、制約、運用条件を入力として提供する責務 |
| `L1-COV-G4-NONENGINEER` | 非エンジニアが目的、判断事項、進行条件、品質、未決、riskを理解できる開発契約 | CI・bot・Workerによる自動実行、差戻し、証拠化、停止・再開の統制 | HELIX-WebはVersion 1後にdashboard操作体験を提供する。HARNESS Version 1の成立を代替しない |
| `L1-COV-G5-WORKER-OPTIMIZATION` | 作業分類、能力契約、検証義務、escalation条件 | Worker実測、費用、capacity、assignment、再配置、独立検証 | 製品固有のrisk、data、作用、品質、期限、費用制約を提供する責務 |

work unit名は監査上の作業単位であり、要求ID、Feature Ticket ID、採択済みscopeではない。

## 七大原則のL1適用境界

七大原則はエージェントの共通行動規律であり、原則名をそのまま製品L1要求へ追加しない。

| 七大原則 | 現在接続できるL1 | 判定 |
|---|---|---|
| リサーチ＆検証ファースト | HARNESS-L1-002／004、HELIXOS-L1-011／012 | `not_applicable_as_l1_value`。Research routeと反証条件をL2以降で具体化する |
| 原子PR原則/非依存並列化 | HELIXOS-L1-009／010 | `not_applicable_as_l1_value`。変更・統合単位と依存順序へ適用する |
| DDD設計/TDD開発 | HARNESS-L1-002／004／009 | `not_applicable_as_l1_value`。domain、設計義務、test／oracleへ適用する |
| 下流トラブルは上流還流※トラブルの原因は要件定義や設計を疑え | HARNESS-L1-003／006／009、HELIXOS-L1-012 | `not_applicable_as_l1_value`。候補化・採否後のrevisionから再導出する |
| ミニマム実装/適時リファクタリング | HARNESS-L1-002／004、HELIXOS-L1-006／012 | `not_applicable_as_l1_value`。承認scope内のrefactorと別採否の構造改善を分ける |
| 責務/依存分離で変更耐性を最適化 | HARNESS-L1-003／005、HELIXOS-L1-002／007／009／010、4対象の対象外節 | `not_applicable_as_l1_value`。primary ownerと依存方向を維持する |
| 確かな証拠と計測改善で品質を守れ | HARNESS-L1-004／007、HELIXOS-L1-004／006／008／012、HELIXWEBOS-L1-004／005 | `not_applicable_as_l1_value`。完了証拠と改善観測を混同しない |

## 後続の要求候補化条件

`partial`三領域を要求へ進める場合は、領域ごと、かつ最終的な要求identityごとに別PRとする。

1. Concept、5大目標、既存L1、旧要求source atomを入力集合として固定する。
2. 既存L1で保持する意味、追加候補、接続候補、重複候補を分ける。
3. 管理層へ、原sourceと因果relation付きの`registered_proposal`として仮登録する。
4. HARNESS側で入力atom未計上0を示す無損失被覆receiptを作る。
5. 同じ候補semantic digestを仮登録と被覆receiptへ束縛する。
6. 個別要求PRで採否し、Issueはローカル候補の一方向projectionに限定する。

この順序を満たすまで、既存L1文言を広げて`partial`を`covered`へ変更せず、L2／L11、L3／L10、実装、CIへ降ろさない。

## 本監査で変更しないもの

- 対象別L1 32件と各SHA-256。
- L2／L11要求37件、旧要求source、Requirement IR、semantic line、Feature Ticket、Issue。
- Concept、5大目標、七大原則のauthority状態。
- CI、runtime、DB、要求エンジン、simulation、Worker routerの設計・実装。
