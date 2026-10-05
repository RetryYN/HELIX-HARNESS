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
| `CASE-HARNESS-L10-NFR-011-01` | `NFR-C-HARNESS-011-01` | 同じlogical operationを同一冪等keyと記録済stateでresume／再送する。効果のない中断と、効果を記録した後の重複送達を分ける。呼出し元が別keyで開始する別operationも対照に置く。 | operation/correlation identityが保たれ、同じkeyによる追加effect 0件、処理効果が高々1回である証拠を照合する。 | HARNESSが同一operationのresume時にkeyを変える変異、同一keyで追加effectがあれば不合格。呼出し元が別keyで開始する別operationは許容する。実際の副作用が入力にないfixtureは未評価ではなく、追加effectなしを設計上観測できるsynthetic oracleを使う。 |
| `CASE-HARNESS-L10-NFR-011-02` | `NFR-C-HARNESS-011-02` | expiry直前・ちょうど・直後のpreflight、dispatch直前／直後、およびresume開始、期限前開始・期限後結果の各fixtureを比較する。dispatch後の期限切れはeffect実行後に結果成立を確認できない場合を含む。等号扱いは既存contractの規則に従い、規則未定義時はNFR文書の候補A (`now >= expiry`) と候補B (`now > expiry`) を同一clock fixtureで比較する。 | dispatch前の期限切れはsuccess receiptを返さずblocked/heldとし、effect 0を観測する。dispatch後に期限切れ・snapshot drift等で結果成立を確認できない場合はsuccessでないuncertain/unknown receiptとする。期限前に開始し期限後に結果が到着したfixtureもsuccessにしない。すべてのcheckpoint/result stateを相関IDとexpiryに結び付ける。 | clock、expiry authority、checkpointまたはresult timeがfixtureで固定されない場合は未評価。TTL／clock skew許容値を本測定で作らない。 |
| `CASE-HARNESS-L10-NFR-023-01` | `NFR-C-HARNESS-023-01` | NFR候補文書のD1–D15全fixture（必須missing/stale、operation true/false/unknown、source selected/unselected/選択unknown、暗黙fallback、明示再選択、reference-only偽装、未解決cycle、矛盾条件）を同一pack revisionで評価する。人代行は権限・隔離・版・検証・記録・受領receiptを含め、未実装依存を分類する入力も与える。 | 各fixtureのclosure/state/reasonとowner returnを観測し、同じinput・revisionの2回評価で意味digest差分0。D9は存在・不在等を未観測、D10は暗黙fallback保留、D11は新入力として再評価、D12の安全条件偽装は拒否、D13–D15はunknown/保留。選択依存の版・scope・理由は相関ID付きHARNESS-L2-011結果/evidenceに結ぶ。classification-onlyはmissing/unknownを返し依存実装を要求しない。 | 未選択source・条件不成立依存・無関係な能力全体をclosure/holdへ過剰追加、unknownをfalse/未選択/参照のみへ丸める、D10 fallback、D11明示再選択拒否、参照資料偽装の保留のみ、人代行receipt欠落、安全依存のoptional化、closureから機能/owner/版や許可を生成すれば不合格。scope外は未評価。 |

## 限界

比較digestは試験内のoracleであり、正本schemaや実装方式を新設しない。fixture、固定revision、contract、適用authorityのいずれかが不足する場合は未評価として記録する。expiry比較は既存contractを優先し、未定義の場合のみL3 NFRの案A/Bを同じclock fixtureで比較する。preflight/dispatch前期限切れのblockedとdispatch後結果不確実のuncertainは旧sourceから部分再導出した候補判定であり、現行実装方式を指定しない。TTL、clock-skew、retry count等の値をこの測定で作らない。

## Stage 2a suffix — HARNESS-L2-022 NFR候補検証

| L10 case ID | L3 NFR候補 | 入力・比較 | oracleと失敗境界 |
|---|---|---|---|
| `CASE-HARNESS-L10-NFR-022-01` | `NFR-C-HARNESS-022-01` | 選択scope内の各FR/ACを一つ以上の適切なL10 oracleへ対応させる正常traceを作る（FR/ACとCASEは多対多でよく、一対一制約を置かない）。対応漏れ、重複ID、artifact revision違い、scope違い、必須result/evidence欠落を一fieldずつ独立に変異する。 | 正常は全必須FR/ACに必要なCASE対応がありtupleが一致する。候補境界は必要trace coverage 100%・未解消必須不一致0。ID重複は識別子不備として別に拒否し、正当な複数CASE/AC対応は保持する。各変異をpassにせず理由を記録する。対象集合や必要oracleが欠ける場合は未評価。 |

この候補値は技術案であり、L3要件の承認や実測達成を示さない。比較条件が不足する場合は未評価と記録する。固定親に根拠のない性能SLAの数値は設定しない。
