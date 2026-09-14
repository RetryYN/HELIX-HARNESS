# 旧HARNESS要求の新世代対象別対応

確認日: 2026-09-14

本書は `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/` の旧5文書を、HARNESS、HELIX-OS、個別製品へ
再分類する監査記録である。旧文書の `confirmed`、実装済み宣言、旧pairのPASSを新世代の承認、実装、
受入へ引き継がない。旧IDは出典の網羅確認にだけ使い、現行IDとして再利用しない。

## 業務要求・UX要求

10 BRと3 UXを一度ずつ分類した。

| 出典ID | 保持する意味 | 新世代の対象と接続先 | 再配置条件 |
| --- | --- | --- | --- |
| BR-01、BR-03、BR-04、BR-05、BR-07、BR-08 | 工程、trace、PoC分離、規約検査、退行防止、独立review | HARNESS-L2-001..005 | 旧L0-L14、旧gate名、旧reviewer実装を除いて工程契約として再記述する |
| BR-02、BR-06、BR-21、BR-22 | Worker統制、観測、成果評価、内部asset管理 | HELIXOS-L2-002／004／005／007／009 | 旧roster、DB、dashboard、CI、実装済み宣言を継承せずOS要求として採否する |
| UX-01 | 速度・安全・自動化を利用者が両立できること | HARNESS-L2-002／003／005 | KPIと操作体験を新しい工程契約に対して定義し直す |
| UX-02 | 管理状態を俯瞰できること | HELIXOS-L2-002／007 | 画面実装ではなく利用者が確認すべき情報を先に確定する |
| UX-03 | 失敗理由と次の行動を理解できること | HARNESS-L2-003／005、HELIXOS-L2-007／009 | 工程上の説明条件と、OSが記録・提示する責務を分ける |

D-01..09は旧目標値として保持するが、新世代KPIとしては未採択である。測定対象、分母、取得元、
欠測、改ざん防止、責任主体を対象別に定義できるまで目標値を移管しない。

## 機能要求

FR-L1-01..51を重複なく分類した。各行のID集合の和は51件である。

| 出典ID | 保持する意味 | 新世代の対象と接続先 | 旧実現手段の扱い |
| --- | --- | --- | --- |
| FR-L1-01..05、FR-L1-11、FR-L1-13..16、FR-L1-21、FR-L1-23..30、FR-L1-44、FR-L1-50 | V-model、変更種別、Discovery／PoC、設計・検証、導入時の工程条件 | HARNESS-L2-001..005 | 旧PLAN kind、gate、workflow、L2画面／L10 UX配置、既存testを新契約にしない |
| FR-L1-06..10、FR-L1-12、FR-L1-17..20、FR-L1-31、FR-L1-36..43、FR-L1-45..49、FR-L1-51 | state、Worker guard、回復、文脈注入、CI運転、検出、学習、観測、継続、評価、内部asset | HELIXOS-L2-002／004／005／007／008／009 | 旧DB schema、hook、9-mode、drive、provider、CLI、CI、path、実装済み宣言を継承しない |
| FR-L1-22 | UI変更に対する検証義務 | HARNESS-L2-004／005。具体oracleは適用先の個別製品 | 旧5 detectorと既存CIを固定せず、個別製品の承認済みUI要求から再導出する |
| FR-L1-32..35 | 文書配置、asset棚卸し、投資優先度、readinessの管理 | HELIXOS-L2-001／002／005／007 | 旧directory、旧不足一覧、旧実装状態を新世代baselineにしない |

FR-L1-12／17／22／45等が定める具体command、reviewer、CI、detectorは旧実装候補である。
要求整理中に起動・移植せず、上流承認後にL3要件とL10検証から組み直す。

## 非機能要求

旧15 NFRを一度ずつ分類した。欠番は旧体系のまま保持し、新しい連番へ補完しない。

| 出典ID | 保持する意味 | 新世代の対象と接続先 | 再配置条件 |
| --- | --- | --- | --- |
| NFR-01、NFR-02、NFR-04、NFR-07、NFR-08、NFR-16 | 移植性、更新性、統制対象言語からの独立、提供品質、実装状態の真実性、途中導入 | HARNESS-L2-005／006、必要に応じHELIXOS-L2-006 | 対応platform、品質水準、導入対象を外部提供契約として再定義する |
| NFR-03、NFR-06、NFR-11..15 | runtime差、fail-close、役割分離、機械とAI、実行場所、人間判断、local-first | HARNESS-L2-003／005とHELIXOS-L2-004／007..009へ責務分離 | 特定provider、GHA、hook、課金形態、旧path、既存CIを固定しない |
| NFR-05 | CI・PR・権限証跡をremoteへ保存する意味 | HELIXOS-L2-007／008 | GitHubを要求意味正本にせず、交換可能な作業・証拠projectionとして再配置する |
| NFR-17 | securityとhuman oversightを要求・検証へ接続する意味 | HARNESS-L2-003..005、HELIXOS-L2-003／004／007／009、個別製品要求 | 法令適合や網羅を宣言せず、対象製品の保護対象と適用法から確定する |

## 画面要求と技術要求

旧15画面はHARNESSの外部提供画面として採択しない。PM-01..06、HM-01..08はプロジェクト、工程、gate、
trace、continuation、文書、機能、coverage、配線、DB、log、recovery、doctor、learningの管理view候補であり、
HELIXOS-L2-001／002／005／007／009のUI候補へ送る。GD-01はHARNESSの利用ガイドとHELIX-OSの運用ガイドへ
内容を分ける。15 identity、6遷移、旧trace表、個別mockは、新世代画面要求や受入として未採択である。

技術要求7節は次のように扱う。

- 技術・runtime制約は、HARNESS配布物、HELIX-OS実装、統制対象productを分けてL3以降で決める。
- 外部連携、state、skill注入、共通基盤、drift解消はHELIX-OS要件候補へ送る。
- 旧9-mode、drive別state、旧DB schema、旧CLI例、全OS第一級、既存CI接続は新世代へ継承しない。
- GitHubは作業・証拠projectionであり、要求本文、採否、合意revisionのauthorityにしない。

## 適用待ち

本文読取りと出典IDの対象別分類は完了した。対象別L2案への接続は整理先の仮接続であり、要求の削減や意味変更ではない。
次に必要なのは、各原要求を最新Concept revisionと対象別L1に照らして欠落なく再配置し、
L3要件とL11受入へ同じrevisionで接続することである。要求整理が完了するまで、旧CI、新世代CI、runtime、
hook、adapter、DB、Issue、PRをこの対応表から変更しない。
