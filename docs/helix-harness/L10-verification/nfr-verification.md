# HELIX-HARNESS L10 非機能検証設計（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-022, HARNESS-L2-023
paired_l3: ../L3-requirements/nfr-grade.md
execution_status: designed_only_not_executed

本書は[NFR候補](../L3-requirements/nfr-grade.md)の値を、[L3機能AC](../L3-requirements/functional-requirements.md)が定める正常・失敗・未評価fixtureで測る方法を示す。実行結果、達成、承認、release可否を示すものではない。functional ACが要求意味の正本で、本書は候補値を別の要求として重複定義しない。

## 測定表

case IDは `CASE-HARNESS-L10-NFR-<親番号>-<連番>` とし、親番号のtraceを維持する。

| L10 case ID | NFR候補 | 入力／比較 | 観測と合格材料 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-010-01` | `NFR-C-HARNESS-010-01` | 同じ入力、pack version、宣言artifact contractで独立に生成した結果を固定する。 | 宣言成果物のbytes digestを比較し、予期しない差分0件を照合する。metadata除外はartifact contractに明示された項目だけを適用し、除外前後の差分を記録する。 | 未宣言の正規化で差分を隠したら不合格。fixtureに必要なcontract／versionがないとき未評価。 |
| `CASE-HARNESS-L10-NFR-010-02` | `NFR-C-HARNESS-010-02` | 一つの対象packのみ更新し、更新前後の全pack identity/version/evidenceを比較する。 | 対象外packの変更件数0を確認する。変更1件以上は単一pack差し替え不合格。 | 複数pack更新を混ぜたfixtureは候補値の判定に使わず、別scopeと記録する。 |
| `CASE-HARNESS-L10-NFR-011-01` | `NFR-C-HARNESS-011-01` | 同じlogical operationを同一冪等keyと記録済stateでresume／再送する。効果のない中断と、効果を記録した後の重複送達を分ける。 | operation/correlation identityが保たれ、同じkeyによる追加effect 0件、処理効果が高々1回である証拠を照合する。 | 新keyによる別operation、同一keyで追加effectがあれば不合格。実際の副作用が入力にないfixtureは未評価ではなく、追加effectなしを設計上観測できるsynthetic oracleを使う。 |
| `CASE-HARNESS-L10-NFR-011-02` | `NFR-C-HARNESS-011-02` | expiry直前・ちょうど・直後のdispatchおよびresumeを比較する。等号扱いは既存contractの規則に従い、規則未定義時はNFR文書の候補A (`now >= expiry`) と候補B (`now > expiry`) を同一clock fixtureで比較する。 | expiry後にsuccessとなった件数0。各attempt/resume開始時点に適用されたexpiryとresult stateを相関IDで記録する。 | 時計・expiry authorityがfixtureで固定されない場合は未評価。TTL／clock skew許容値を本測定で作らない。 |
| `CASE-HARNESS-L10-NFR-023-01` | `NFR-C-HARNESS-023-01` | NFR候補文書のD1–D12全fixture（常時必須valid/missing/stale、operation true/false/unknown、selected valid/missing/unselected、暗黙fallback拒否、明示再選択、reference-only）を同一pack revisionで評価する。人代行は権限・隔離・版・検証・記録・受領receiptを含め、未実装依存を分類する入力も与える。 | 各fixtureで表に記載したclosure/state/reasonを観測し、同じinput・revisionの2回評価で意味digest差分0。D9は未観測、D10は保留、D11は新入力として再評価。classification-onlyはmissing/unknownを返し依存実装を要求しない。 | 条件や依存の不足をfalse／successに丸める、D10で暗黙fallback、D11の明示再選択を拒否、人代行receipt欠落、安全依存のoptional化は不合格。scope外は未評価。 |

Expiry境界のfixtureでは、既存contractが定める比較規則を用いる。未定義なら候補A/Bの各々で直前・等号・直後のdispatch/resumeを比較し、期限切れsuccessが0件であることを測る。

## 判定の限界

この測定は候補L3 revision、固定L2/L11、限定fixtureと明示scopeに限る。外部システム全体の性能、可用性、負荷耐性、全consumerでの互換性を証明しない。L10の合格材料だけでL3承認、HARNESS全体のVerified／Accepted、利用者受入、releaseを生成しない。実測を行う場合は下流の承認済み設計と既存authorityが必要だが、本草稿から実行許可を与えない。


## H022 NFR測定case

| L10 case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-022-01` | `NFR-C-HARNESS-022-01` | 同一revision/scopeでProvisional→Integrated→Verified→Acceptedの段階別証拠を与え、各必要evidenceを一つずつ欠落させる。 | 各遷移で必要条件を満たす場合だけ進み、誤昇格0件。L10 pass単独、L11記録なしはAcceptedにしない。 | scope/revisionやoracleが固定できないfixtureは未評価。実測をしておらず値は候補。 |
