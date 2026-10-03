# HELIX-HARNESS L10 非機能検証設計（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, 011, 022, 023 and Stage 2b HARNESS-L2-012..020, Stage 2c HARNESS-L2-030..032
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

### Stage 2b 候補ごとの総合測定

候補の適用範囲にある固定親、functional AC、入力revisionを明示して合成測定する。数値候補は要件採否前の比較・測定計画であり、固定SLOやPO parameter gateではない。

| L10 case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-012-01` | `NFR-C-HARNESS-012-01` | AC-012-01..03のUI/PoC両適用、片方N/A、両方N/A、結果backflow済／未済を組合せる。 | Prototype/PoC field別の入力・出力・N/A receiptおよび要件化/昇格状態を比較し、片方の代用0件・Decide前昇格0件を計数する。 | fieldを分けられない場合不合格。対象の画面有無または技術不確実性が不明ならその枝は未評価。 |
| `CASE-HARNESS-L10-NFR-013-01` | `NFR-C-HARNESS-013-01` | 正常な未見requirementと、traceなし追加、未承認出力のfixtureを対比する。 | 出力要件ごとの入力trace/backflow先とapproval stateを照合し、traceなし／自動昇格を0件とする。 | 上流入力・scopeが欠けて妥当性を判断できない場合unknown。 |
| `CASE-HARNESS-L10-NFR-014-01` | `NFR-C-HARNESS-014-01` | template適用による単体design obligation集合と対応L9/L8/L7検証設計を対応付け、template必須入力欠落/source不明を個別に変異。 | 各義務の根拠・検証対・template provenance欠落を数え、欠落0を候補oracleとする。 | 適用対象kind/risk/domainが決まらない場合はtemplate適合を未評価。 |
| `CASE-HARNESS-L10-NFR-015-01` | `NFR-C-HARNESS-015-01` | AC-015開発証拠を同一revisionで揃え、各stepとticket関係上省略した検査を1つずつ変える。 | trace欠落数とProvisional超過数を数える。CI greenのみ、または他ownerのCI evidenceなしで昇格しない。 | ticket/evidence scope未入力は未評価。 |
| `CASE-HARNESS-L10-NFR-016-01` | `NFR-C-HARNESS-016-01` | baseline固定後に同一workload/profileを反復し、候補Aの中央値比較と候補Bの分布・上側quantile比較を実測する。計測runごとの環境・標本数・ばらつきを記録する。 | 回帰oracle違反数、中央値差、分布差、confidence intervalを並記し、要求者が根拠を評価できる候補資料を得る。threshold確定はしない。 | baseline/workload/profile/統計条件/oracleが欠ければ未評価。測定ばらつきの大きい結果を改善達成にしない。 |
| `CASE-HARNESS-L10-NFR-017-01` | `NFR-C-HARNESS-017-01` | eligible positiveとRelease Port必須条件欠落・未回収検査・revisionずれを対比し、同じinputでartifact再構成を行う。 | 不適格eligible件数とartifact identity/digest差を計数し、候補値0を照合する。 | 配備結果をこのcaseのoracleにしない。 |
| `CASE-HARNESS-L10-NFR-018-01` | `NFR-C-HARNESS-018-01` | 5状態の根拠を個々に与え、document-only/CI-only昇格を負例として、対象revision・時点・ownerを一つずつ欠く。 | 誤state遷移およびrecord field欠落数を測る。製品固有の品質閾値は入力されたowner基準とだけ比較する。 | owner基準、適用性、観測期間が不明ならその品質判定は未評価。 |
| `CASE-HARNESS-L10-NFR-019-01` | `NFR-C-HARNESS-019-01` | 任意stage由来の完全・部分・矛盾inputを与え、source/owner/revisionの各欠落を独立して評価する。 | 変換可能、unknown、inconsistentの各結果が原入力へtraceされるか測り、自動承認/release数0を照合する。 | 十分な入力を持つ正常な未見stageを拒否しない。 |
| `CASE-HARNESS-L10-NFR-020-01` | `NFR-C-HARNESS-020-01` | 隣接producer/consumer契約のvalid、版不一致、field欠落、許容未知fieldを比較する。 | field coverage欠落・不整合暗黙受理・upstream state変更を計数する。個々の欠落名と所在をoracle出力へ含める。 | 契約自体または双方ownerが提示されない場合未評価。 |

Expiry境界のfixtureでは、既存contractが定める比較規則を用いる。未定義なら候補A/Bの各々で直前・等号・直後のdispatch/resumeを比較し、期限切れsuccessが0件であることを測る。

## 判定の限界

この測定は候補L3 revision、固定L2/L11、限定fixtureと明示scopeに限る。外部システム全体の性能、可用性、負荷耐性、全consumerでの互換性を証明しない。L10の合格材料だけでL3承認、HARNESS全体のVerified／Accepted、利用者受入、releaseを生成しない。実測を行う場合は下流の承認済み設計と既存authorityが必要だが、本草稿から実行許可を与えない。


## H022 NFR測定case

| L10 case ID | NFR候補ID | 入力／比較 | oracle／測定 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-022-01` | `NFR-C-HARNESS-022-01` | 同一revision/scopeでProvisional→Integrated→Verified→Acceptedの段階別証拠を与え、各必要evidenceを一つずつ欠落させる。 | 各遷移で必要条件を満たす場合だけ進み、誤昇格0件。L10 pass単独、L11記録なしはAcceptedにしない。 | scope/revisionやoracleが固定できないfixtureは未評価。実測をしておらず値は候補。 |

## Stage 2c — HARNESS-L2-030／031／032 NFR測定case

| L10 case ID | NFR候補 | 入力／観測 | 合格材料 | 失敗・未評価 |
|---|---|---|---|---|
| `CASE-HARNESS-L10-NFR-030-01` | `NFR-C-HARNESS-030-01` | 同一要件/design/oracle/source版/scopeから独立生成したcaseを比較。contractが明示する非意味metadataは別集計する。 | 意味差分0。metadata除外は宣言contractに明記された分だけ。 | 未宣言正規化、期待値創作、根拠不明入力は不合格または未評価。 |
| `CASE-HARNESS-L10-NFR-031-01` | `NFR-C-HARNESS-031-01` | 合成元failure identity、複数reduction stage、oracle同一/不同/未返却receipt、secret markerを投入する。 | identityを全段階に追跡、different oracleを同一扱い0、raw marker露出0。 | receipt前確認済みclaim、元failure消去、markerの値記録は不合格。 |
| `CASE-HARNESS-L10-NFR-032-01` | `NFR-C-HARNESS-032-01` | 選択consumerの適合packetとfieldごとの不一致packetを比較し、handoff前のreceipt/resultなしでpacketを作る。handoff後のdelivery receiptとexecutor実行後のrun resultを順に与える。 | packet対応不一致0、handoff前のreceipt/result要求0、handoff receiptからrun result/passを作る件数0。 | consumer/schema不明は未評価、別consumerへのfallbackは不合格。 |

候補値の測定は合成fixtureで行う設計であり、実測・実行・承認ではない。
