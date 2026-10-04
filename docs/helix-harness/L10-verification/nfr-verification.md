# HELIX-HARNESS L10 非機能検証設計（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l3: ../L3-requirements/nfr-grade.md
execution_status: designed_only_not_executed

この文書はL3 NFR候補を対応する固定L3 ACと合成fixtureで測る設計であり、NFR候補を要求として重複定義しない。実行結果、達成、承認、release可否を示さない。

## 測定表

| L10 case ID | NFR候補ID | 入力・比較 | 観測oracle | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-010-01` | `NFR-C-HARNESS-010-01` | 同じ入力、pack version、宣言artifact contractで独立に生成した結果を固定する。 | 宣言成果物のbytes digestを比較し、予期しない差分0件を照合する。metadata除外はartifact contractに明示された項目だけを適用し、除外前後の差分を記録する。 | 未宣言の正規化で差分を隠したら不合格。fixtureに必要なcontract／versionがないとき未評価。 |
| `CASE-HARNESS-L10-NFR-010-02` | `NFR-C-HARNESS-010-02` | 一つの対象packのみ更新し、更新前後の全pack identity/version/evidenceを比較する。 | 対象外packの変更件数0を確認する。変更1件以上は単一pack差し替え不合格。 | 複数pack更新を混ぜたfixtureは候補値の判定に使わず、別scopeと記録する。 |
| `CASE-HARNESS-L10-NFR-011-01` | `NFR-C-HARNESS-011-01` | 同じlogical operationを同一冪等keyと記録済stateでresume／再送する。効果のない中断と、効果を記録した後の重複送達を分ける。 | operation/correlation identityが保たれ、同じkeyによる追加effect 0件、処理効果が高々1回である証拠を照合する。 | 新keyによる別operation、同一keyで追加effectがあれば不合格。実際の副作用が入力にないfixtureは未評価ではなく、追加effectなしを設計上観測できるsynthetic oracleを使う。 |
| `CASE-HARNESS-L10-NFR-011-02` | `NFR-C-HARNESS-011-02` | expiry直前・ちょうど・直後のdispatchおよびresume開始、期限前開始・期限後結果の各fixtureを比較する。等号扱いは既存contractの規則に従い、規則未定義時はNFR文書の候補A (`now >= expiry`) と候補B (`now > expiry`) を同一clock fixtureで比較する。 | expiry後にsuccessとなった件数0。各dispatch/attempt/resume開始時点とresult timeに適用されたexpiry、result stateを相関IDで記録する。expiry後successは既存contractの開始境界規則と照合し、成功扱いしない。 | 時計・expiry authorityがfixtureで固定されない場合は未評価。TTL／clock skew許容値を本測定で作らない。 |
| `CASE-HARNESS-L10-NFR-023-01` | `NFR-C-HARNESS-023-01` | NFR候補文書のD1–D12全fixture（常時必須valid/missing/stale、operation true/false/unknown、selected valid/missing/unselected、暗黙fallback拒否、明示再選択、reference-only）を同一pack revisionで評価する。人代行は権限・隔離・版・検証・記録・受領receiptを含め、未実装依存を分類する入力も与える。 | 各fixtureで表に記載したclosure/state/reasonを観測し、同じinput・revisionの2回評価で意味digest差分0。D9は未観測、D10は保留、D11は新入力として再評価。classification-onlyはmissing/unknownを返し依存実装を要求しない。 | 条件や依存の不足をfalse／successに丸める、D10で暗黙fallback、D11の明示再選択を拒否、人代行receipt欠落、安全依存のoptional化は不合格。scope外は未評価。 |

## 限界

比較digestは試験内のoracleであり、正本schemaや実装方式を新設しない。fixture、固定revision、contract、適用authorityのいずれかが不足する場合は未評価として記録する。expiry比較は既存contractを優先し、未定義の場合のみL3 NFRの案A/Bを同じclock fixtureで比較する。TTL、clock-skew、retry count等の値をこの測定で作らない。
