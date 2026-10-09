# 要求整理のPO判断案

現在の対象baseは`7b9c110ace54b05a8b0c7bfa01d1dc9ef3d00822`。提案の正本は[差分JSON](requirements-resolution-packet.json)、SHA-256 `92f120b2abd5936df8e6f1a304bf35cdf0711e96b2a4e9f9a63f72862986bbdf`。canonical L2/L11とMPRは未変更であり、本packetから要求採択・仮登録・無損失保証・実装許可を生成しない。

## 現在の判断単位

| 判断単位 | 提案 | 保持する点 |
|---|---|---|
| TEMPLATECONTRACT（#2846、HELIXBRAIN-L2-032単体案） | 汎用Design Templateの意味契約項目をBRAINが提供し、項目の欠落・値未決・非適用、JSON意味正本と生成viewを区別する。`version_target: 1.0`を提案 | 製品要求への適用/義務/BackflowはCORE、使用set/版/記録はOS。知識採否は既存BRAIN007/025。既存BRAIN003/008/028/030とHARNESS009/041の採択範囲を変えない |

提案は、identity、version、layer/pair、applicability、required input/section/field、relation、意味owner、trace、negative oracle、measurement、completion、downstream kind、supersessionの15項目を識別・比較できる契約候補と不足一覧を提供するもの。completionはtemplate適用義務の条件を表し、BRAIN知識採否や実projectの義務消込の裁定とは分ける。field定義がある値未決はBRAIN030の受領可能なreceiptと未完設計義務へ結び、定義自体の欠落をそれで補わない。

対L11は正常例、15項目の個別欠落、値未決/非適用/unknown、別revision・生成viewだけの更新、製品固有値の混入と未見domainを照合する案である。具体schema/key/型/演算子/wire format、閾値・実装方式は固定しない。JSON内の2置換は現在のEOFの一意な行へ追記する案であり、本文・節digestを固定した。

起点は[条件照合](../audits/template-condition-review-2026-10-10.json)の旧6surface/6componentとDST-HARNESS-002、[9/25の汎用BRAIN・JSON正本の判断](../decisions/brain-helix-core-po-intent-2026-09-25.md)、[9/28の固定L1](../decisions/helix-brain-requirements-po-decision-2026-09-28.md)。旧`design-template-json-authority.md:19–46`の意味項目・view分離・identityを保持し、HARNESS一括所有から既決の責務分離へ意味を再導出する。旧pair freezeによるauthorityを現行知識採否へ継承せず、旧runtime/test/CIを実行しない。

## この案で閉じない範囲

最小seed setと26seedの採否、CORE適用判定・Backflow・semantic impact、OSのproject exact set/event/評価母集団、shadow parity・renderer・pair/portfolioの固有binding、その他の要求Issueと旧identityの移管は#2846ほかに残る。032を採用してもこれらを完了扱いにしない。

採用後は一要求identityの反映PRで対L11、仮登録・source被覆receipt・独立reviewを結ぶ。L3再開、schema/registry/runtime/新gate、実装・CI・内部デプロイ・release、全seed採用、formal successor/retireは今回の判断対象外。

## 既決の判断単位

JSONAUTH、TDDORDER、VERSIONJOINは10/10の各判断記録に従って反映済み。対象は当時の固定packet commit `d4b439e5c48591749709a8707d0ee319c673f000`であり、JSONの`resolved_packet`に以前の提案objectをそのまま保つ。再承認・再適用は求めない。[JSONAUTH](../decisions/json-canonical-requirement-resolution-po-decision-2026-10-10.md)、[TDDORDER](../decisions/tdd-order-requirement-resolution-po-decision-2026-10-10.md)、[VERSIONJOIN](../decisions/version-join-requirement-resolution-po-decision-2026-10-10.md)を正本として読む。
