# HELIX-HARNESS L10 機能総合検証設計（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023 / version_class 1.0
paired_l3: ../L3-requirements/functional-requirements.md
execution_status: designed_only_not_executed

本書は[対のL3機能要件](../L3-requirements/functional-requirements.md)が定義した10個のACを、固定revision・宣言scopeでシステムとして照合する設計である。これは実施結果ではなく、L3承認、実装、実行、releaseまたは利用者acceptanceを生成しない。L3にないACや新しい要求を本書から追加しない。

## 照合対象revision

- L2/L11固定親：`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- L2全文SHA-256：`aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`。
- L11全文SHA-256：`09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。
- L3をPO承認対象とする場合は、L3文書と本L10の同じexact revisionを指定してから判定する。承認recordや実装証拠はまだない。

## L10共通の試験設計

各caseは合成fixtureを用い、固定L2/L11、L3 AC ID、pack identity/version、dependency/contract版、入力scope、期待oracleを事前に結ぶ。正常系、誤りを含む系、unknown/staleまたは未観測系を分ける。出力fieldやtraceの存在だけでは合格にしない。実測不能、親revision不一致、入力不足、oracle不一致は成功へ丸めず「未評価／保留」または不合格の理由を記録する。

外部通信、実credential、実データ、DB変更、deploy/release、実Worker dispatchを実施する設計ではない。将来実行時も各fixtureに適用する既存SECURITY authorityとscopeを入力として照合する。HARNESSは権限を発行せず、OS ticket/assignmentや利用者受入を代行しない。

## AC別の総合検証

case IDは `CASE-HARNESS-L10-<親番号>-<連番>`。AC IDはL3正本の `AC-HARNESS-L3-<親番号>-<連番>` をそのまま参照する。両IDの機構prefix・親番号を一致させ、ACの再定義はしない。

| L10 case ID | AC ID（L3正本） | fixture・観測点 | 合格材料 | 反例／未評価の扱い |
|---|---|---|---|
| `CASE-HARNESS-L10-010-01` | `AC-HARNESS-L3-010-01` | pack宣言にidentity、input/output contract、依存identity/版、verification scope/oracle、owner/version、release-unit inclusion/exclusionを用意。対応するmissing／undeclared dependency、二重owner、未検証pack fixtureも与える。結果manifestとclosureを観測。 | 全必須宣言が同じpack revisionへ結び付き、収載／非収載が区別される。宣言外依存が使用されず、二重owner／暗黙収載がない。 | 宣言欠落・依存漏れ・曖昧なownerは不合格。比較不能はunknownのまま未評価にし、推定補完しない。 |
| `CASE-HARNESS-L10-010-02` | `AC-HARNESS-L3-010-02` | 基準pack集合のうち一つだけを別revisionへ差替える。差替え前後の全pack identity/version/evidenceを比較する。 | 対象packだけが予定どおり変化し、対象外packの版・証拠差分が0件。 | 対象外packに差分が1件以上なら不合格。複数packを更新するoperationはこのfixtureへ混ぜず、合格根拠にも代用しない。 |
| `CASE-HARNESS-L10-010-03` | `AC-HARNESS-L3-010-03` | 同一入力・同一pack版で独立に成果物を再生成する。失敗fixtureでは直前の適格版／明示replacementを与え、選択結果を観測。 | 同一artifact contract上の成果物が一致し、失敗時に戻し先が一意に特定される。上位release/product stateはpack結果だけで変化しない。 | 同じ宣言成果物の差分、fallback先不明、または上位昇格があれば不合格。contractが除外を明記しないmetadata差は正規化で隠さない。 |
| `CASE-HARNESS-L10-011-01` | `AC-HARNESS-L3-011-01` | GUI、特定画面、local path、特定provider、CI製品を入力環境から除いたcontract call fixture。能力名とcontract/dependency版を明示し、未対応版も与える。 | 宣言contractのみで呼出しが記述でき、対応版で出力形が一致。未対応版を黙って読み替えない。 | 特定UI／provider／CIが必須なら不合格。未対応版の自動代替も不合格。環境条件が未提示なら未評価。 |
| `CASE-HARNESS-L10-011-02` | `AC-HARNESS-L3-011-02` | 有効な既存SECURITY authorityとproject／tenant／environment scopeをfixtureとして与え、同じ入力でscope外targetと未渡し権限の反例も与える。実credentialや実targetは使わない。 | 結果が入力されたscope内に制限され、authorityの発行・拡張をHARNESSが行わない。 | scope外アクセス、未渡し権限、内部DB／鍵／内部統制の共有を許すなら不合格。authority条件自体が不明なら該当operationを未評価／保留。 |
| `CASE-HARNESS-L10-011-03` | `AC-HARNESS-L3-011-03` | 一つのlogical operationへ複数のprogress update、終端／未完state、resultとevidence参照を与える。相関IDの一致と呼出し元への返却を観測する。 | 全結果・証拠が同じoperationへ相関し、呼出し元が受領できる。保存・表示または業務完了の判定をHARNESSが作らない。 | 相関欠落／交差、結果未返却は不合格。HARNESS側に保存・業務判断がある場合も不合格。 |
| `CASE-HARNESS-L10-011-04` | `AC-HARNESS-L3-011-04` | operationを途中stateで停止し、同じ冪等keyで再開。expiryの前・境界・経過後の同一operation fixtureを別々に照合する。 | resumeが記録済みstateと同じlogical operationへ結び付き、再送で重複効果がなく、expiry後／中断をsuccessにしない。 | key変更による別operation扱い、途中stateの欠落を完了扱い、expired successはいずれも不合格。固定TTL・retry回数が未指定でも測定は停止しない。 |
| `CASE-HARNESS-L10-023-01` | `AC-HARNESS-L3-023-01` | 各4 dependency class、owner、version/range、pack revision、operation/source conditionを含む宣言fixtureを評価する。区分欠落・条件曖昧の反例を与える。 | 宣言された4区分が保持され、conditionと対象revisionが追える。 | 別区分への暗黙変換、未宣言source/operationの推測、owner／range欠落のsuccessは不合格。 |
| `CASE-HARNESS-L10-023-02` | `AC-HARNESS-L3-023-02` | always-required、operation条件true/false、selected/unselected source、reference-only、unknown/staleを別fixtureにする。closure、分類state、根拠、HARNESS-L2-011相関参照を観測する。 | 必須closureが成立し、対象外、未観測、参照のみ、unknown/staleが個別stateとして説明される。unselected sourceは未観測のままである。 | unknownをfalse／optional／reference-onlyへ丸める、選択source失敗からfallback、未選択sourceを成功表示したら不合格。親入力がない領域は未評価。 |
| `CASE-HARNESS-L10-023-03` | `AC-HARNESS-L3-023-03` | 条件下で必要なauthority、isolation、credential/data-use、安全証拠の依存を有効にしたfixtureと、該当conditionをunknownにしたfixtureを照合する。同じinput/revisionを2回評価する。 | 安全依存がclosureから落ちず、unknown条件は保留。同一入力のclosureと理由が一致する。 | 安全依存のoptional化、unknown時の実行可能扱い、再評価間のclosure／理由差分は不合格。適用authority自体をここで新規定義しない。 |

## 技術候補の計測への接続

測定候補値と比較案は[NFR候補](../L3-requirements/nfr-grade.md)を参照する。ここでは既存L3 ACのoracleに沿って、同一宣言成果物の差分、単一差し替えによる対象外差分数、同一keyの重複効果、expiry後success、同一dependency input/revisionでのclosure／理由差分を観測する。候補の値は後続のL3承認対象であり、現時点で実測値・達成・承認を主張しない。

旧test-designのAT-FR-03/04/05はnegative fixtureの出所確認だけに使った。旧test/runtime、旧CLI、旧CIを実行せず、そのgreen状態を現行の合格根拠にしない。
