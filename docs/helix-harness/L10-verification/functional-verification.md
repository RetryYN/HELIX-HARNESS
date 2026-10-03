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

| L10 case ID | L3 FR ID | AC ID（L3正本） | fixture・観測点 | 合格材料 | 反例／未評価の扱い |
|---|---|---|---|
| `CASE-HARNESS-L10-010-01` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-01` | pack宣言にidentity、version/maturity、input/output contract、依存identity/版、verification scope/oracle、単一owner class（release unit／component／core）、収載／非収載、release unit版、統合製品版を用意。欠落依存、複数owner、未検証packの反例も与える。 | pack・release unit・製品の版が別々に追跡され、ownerと収載が一意。未完の上位構成が適格packを隠さず、宣言外依存や暗黙収載もない。 | 宣言欠落・複数owner・版の混同は不合格。比較不能はunknownとして未評価。 |
| `CASE-HARNESS-L10-010-02` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-02` | 基準pack集合のうち一つだけを別revisionへ差替え、前後の全pack identity/version/evidenceを比較。 | 対象packだけが予定どおり変化し、対象外packの版・証拠差分0件。 | 対象外差分が一件以上なら不合格。意図した複数pack更新は単一pack比較に混ぜない。 |
| `CASE-HARNESS-L10-010-03` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-03` | 同一input・pack版から成果物を再生成し、失敗fixtureでは直前の適格版／明示replacementを与える。上位構成未完のまま適格packが見える状態と、交換不能な巨大packも観測。 | 成果物が一致し、復帰先を特定できる。適格packは上位未完でも示され、pack成功から上位昇格は起きない。巨大packはDesign-refactorへ戻される。 | 差分、復帰先不明、packからの上位昇格、または巨大packを交換可能と誤判定すれば不合格。 |
| `CASE-HARNESS-L10-011-01` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-01` | GUI、特定画面、local path、特定provider、CI製品を入力環境から除いたcontract call fixture。能力名とcontract/dependency版を明示し、未対応版も与える。 | 宣言contractのみで呼出しが記述でき、対応版で出力形が一致。未対応版を黙って読み替えない。 | 特定UI／provider／CIが必須なら不合格。未対応版の自動代替も不合格。環境条件が未提示なら未評価。 |
| `CASE-HARNESS-L10-011-02` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-02` | 有効な既存SECURITY authorityとproject／tenant／environment scopeをfixtureとして与え、同じ入力でscope外targetと未渡し権限の反例も与える。実credentialや実targetは使わない。 | 結果が入力されたscope内に制限され、authorityの発行・拡張をHARNESSが行わない。 | scope外アクセス、未渡し権限、内部DB／鍵／内部統制の共有を許すなら不合格。authority条件自体が不明なら該当operationを未評価／保留。 |
| `CASE-HARNESS-L10-011-03` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-03` | 複数progress update、終端／未完state、result/evidenceを与え、相関と呼出し元への返却、resumeに必要な内部state記録を観測。 | 全結果・証拠が同一operationへ相関し呼出し元へ返る。途中state記録はresume用に許されるが、呼出し元の結果保存・表示責務をHARNESSが引き取らない。 | 相関欠落／交差、結果未返却、呼出し元の結果保存・表示責務の移管は不合格。resume用内部state記録だけは不合格にしない。 |
| `CASE-HARNESS-L10-011-04` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-04` | operationを途中stateで停止し、同じ冪等keyで再開。expiryの前・境界・経過後の同一operation fixtureを別々に照合する。 | resumeが記録済みstateと同じlogical operationへ結び付き、再送で重複効果がなく、expiry後／中断をsuccessにしない。 | key変更による別operation扱い、途中stateの欠落を完了扱い、expired successはいずれも不合格。固定TTL・retry回数が未指定でも測定は停止しない。 |
| `CASE-HARNESS-L10-023-01` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-01` | 4 dependency class、owner、version/range、pack revision、operation/source conditionの宣言fixtureを評価。未実装依存を含むclassification-only fixture、分類欠落・曖昧の反例も与える。 | 4区分とrevision結束が保たれ、dependency implementationが未存在でもmissing/unknown分類を出力できる。 | 別区分への暗黙変換、未宣言条件の推測、missing依存をsuccess扱いすれば不合格。 |
| `CASE-HARNESS-L10-023-02` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-02` | operation条件true/false、selected/unselected source、reference-only、unknown/staleを別fixtureにする。さらにsource選択を明示的に変更した新入力を別fixtureにし、closure/state/reasonを観測。 | 必須closureと4種状態を区別。未選択sourceは未観測。選択sourceが失敗しても同じ要求のまま別sourceへ移らず、明示再選択された新入力では新しいsourceの条件を再評価する。 | unknownをfalse／optional／reference-onlyへ丸める、暗黙fallback、未選択sourceの成功推測は不合格。明示再選択を理由に拒否しない。 |
| `CASE-HARNESS-L10-023-03` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-03` | 権限・隔離・版・検証・記録が必要なsourceを人が代行するfixture、口頭のみの受領反例、後続版依存、1.0安全依存、依存unknown fixtureを評価し同じinput/revisionを反復する。 | 人代行でもsource/actor/revision/scope/受領/検証receiptが返り、口頭のみは閉包根拠にならない。分類自体はmissing/unknownを出せる。後続版を1.0へ強制せず、1.0安全依存は必須。同一評価のclosure/reason差分0。 | 必要な義務・receipt欠落、安全依存削除、unknown実行可能扱い、再評価差分は不合格。authority定義は新設しない。 |

## 技術候補の計測への接続

測定候補値と比較案は[NFR候補](../L3-requirements/nfr-grade.md)を参照する。ここでは既存L3 ACのoracleに沿って、同一宣言成果物の差分、単一差し替えによる対象外差分数、同一keyの重複効果、expiry後success、同一dependency input/revisionでのclosure／理由差分を観測する。候補の値は後続のL3承認対象であり、現時点で実測値・達成・承認を主張しない。

旧test-designのAT-FR-03/04/05はnegative fixtureの出所確認だけに使った。旧test/runtime、旧CLI、旧CIを実行せず、そのgreen状態を現行の合格根拠にしない。
