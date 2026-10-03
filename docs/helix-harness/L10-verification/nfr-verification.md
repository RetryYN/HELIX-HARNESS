# HELIX-HARNESS L10 非機能検証設計（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l3: ../L3-requirements/nfr-grade.md
execution_status: designed_only_not_executed

本書は[NFR候補](../L3-requirements/nfr-grade.md)の値を、[L3機能AC](functional-verification.md)が定める正常・失敗・未評価fixtureで測る方法を示す。実行結果、達成、承認、release可否を示すものではない。functional ACが要求意味の正本で、本書は候補値を別の要求として重複定義しない。

## 測定表

case IDは `CASE-HARNESS-L10-NFR-<親番号>-<連番>` とし、親番号のtraceを維持する。

| L10 case ID | NFR候補 | 入力／比較 | 観測と合格材料 | 失敗・未評価 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-010-01` | `NFR-C-HARNESS-010-01` | 同じ入力、pack version、宣言artifact contractで独立に生成した結果を固定する。 | 宣言成果物のbytes digestを比較し、予期しない差分0件を照合する。metadata除外はartifact contractに明示された項目だけを適用し、除外前後の差分を記録する。 | 未宣言の正規化で差分を隠したら不合格。fixtureに必要なcontract／versionがないとき未評価。 |
| `CASE-HARNESS-L10-NFR-010-02` | `NFR-C-HARNESS-010-02` | 一つの対象packのみ更新し、更新前後の全pack identity/version/evidenceを比較する。 | 対象外packの変更件数0を確認する。変更1件以上は単一pack差し替え不合格。 | 複数pack更新を混ぜたfixtureは候補値の判定に使わず、別scopeと記録する。 |
| `CASE-HARNESS-L10-NFR-011-01` | `NFR-C-HARNESS-011-01` | 同じlogical operationを同一冪等keyと記録済stateでresume／再送する。効果のない中断と、効果を記録した後の重複送達を分ける。 | operation/correlation identityが保たれ、同じkeyによる追加effect 0件、処理効果が高々1回である証拠を照合する。 | 新keyによる別operation、同一keyで追加effectがあれば不合格。実際の副作用が入力にないfixtureは未評価ではなく、追加effectなしを設計上観測できるsynthetic oracleを使う。 |
| `CASE-HARNESS-L10-NFR-011-02` | `NFR-C-HARNESS-011-02` | expiry前、境界、経過後、expired stateからのresumeを別々に比較する。 | expiry後にsuccessとなった件数0。各attempt/resume開始時点に適用されたexpiryとresult stateを相関IDで記録する。 | 時計・expiry authorityがfixtureで固定されない場合は未評価。TTL／clock skew許容値を本測定で作らない。 |
| `CASE-HARNESS-L10-NFR-023-01` | `NFR-C-HARNESS-023-01` | 同一pack revisionと同一要求条件を同じ環境で繰返し評価し、4 dependency class、条件のtrue/false、selected/unselected、unknown/staleを網羅する。 | closureと判定理由の構造差分0を照合し、未選択sourceが未観測、reference-onlyと実行依存が別状態であることを確認する。 | condition・version・owner等の必須入力が欠けたケースをfalseやsuccessへ丸めた場合は不合格。scope外は未評価とする。 |

## 判定の限界

この測定は候補L3 revision、固定L2/L11、限定fixtureと明示scopeに限る。外部システム全体の性能、可用性、負荷耐性、全consumerでの互換性を証明しない。L10の合格材料だけでL3承認、HARNESS全体のVerified／Accepted、利用者受入、releaseを生成しない。実測を行う場合は下流の承認済み設計と既存authorityが必要だが、本草稿から実行許可を与えない。
