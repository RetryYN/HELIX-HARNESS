# HELIX-HARNESS L10 機能総合検証設計（Stage 1: HARNESS-L2-010/011/023）

status: draft_for_l3_review
approval: not_approved
scope: Stage 1 only; HARNESS-L2-010, HARNESS-L2-011, HARNESS-L2-023
paired_l3: ../L3-requirements/functional-requirements.md
execution_status: designed_only_not_executed

この文書は固定L2/L11にtraceしたL3 ACを合成fixtureで総合検証する設計である。旧test/runtime/CIを実行せず、実装・外部通信・実credential・releaseを行わない。caseの判定から要求承認や業務完了を生成しない。

## 共通条件

各caseで固定親revision、AC ID、pack identity/version、dependency/contract版、input scopeとoracleを結ぶ。正常・反例・unknown/未観測を区別する。各親の宣言範囲内だが既存fixtureに使っていない有効なpack/input、呼出し、利用条件の正常fixtureも照合する。fieldやtraceの存在だけで合格としない。revision/入力/oracle不足は未評価または保留で記録する。SECURITYの既存authorityをfixture上で参照し、新しいauthorityやownerを定義しない。

## AC別の総合検証

| L10 case ID | L3 requirement | AC ID | fixture / input | 観測oracle | 反例・未評価 |
|---|---|---|---|---|---|
| `CASE-HARNESS-L10-010-01` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-01` | pack宣言にidentity、version/maturity、input/output contract、依存identity/版、verification scope/oracle、単一owner class（release unit／component／core）、収載／非収載、release unit版、統合製品版を用意する。input contractとoutput contract、identity/version、依存identity/版、verification scope/oracle、owner、収載の欠落を個別に変異し、複数ownerと未検証packの反例も与える。 | pack・release unit・製品の版が別々に追跡され、ownerと収載が一意。未完の上位構成が適格packを隠さず、宣言外依存や暗黙収載もない。 | 宣言欠落・複数owner・版の混同は不合格。比較不能はunknownとして未評価。 |
| `CASE-HARNESS-L10-010-02` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-02` | 基準pack集合のうち一つだけを別revisionへ差替え、前後の全pack identity/version/evidenceを比較。 | 対象packだけが予定どおり変化し、対象外packの版・証拠差分0件。 | 対象外差分が一件以上なら不合格。意図した複数pack更新は単一pack比較に混ぜない。 |
| `CASE-HARNESS-L10-010-03` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-03` | 同一input・pack版から成果物を再生成し、失敗fixtureでは直前の適格版／明示replacementを与える。上位構成未完のまま適格packが見える状態と、交換不能な巨大packも観測。 | 成果物が一致し、復帰先を特定できる。適格packは上位未完でも示され、pack成功から上位昇格は起きない。巨大packはDesign-refactorへ戻される。 | 差分、復帰先不明、packからの上位昇格、または巨大packを交換可能と誤判定すれば不合格。 |
| `CASE-HARNESS-L10-011-01` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-01` | GUI、特定画面、local path、特定provider、CI製品を入力環境から除いたcontract call fixture。能力名とcontract/dependency版を明示し、未対応版とdependency版欠落も与える。 | 宣言contractのみで呼出しが記述でき、対応版で出力形が一致。未対応版を黙って読み替えない。 | 特定UI／provider／CIが必須なら不合格。未対応版の自動代替も不合格。環境条件が未提示なら未評価。 |
| `CASE-HARNESS-L10-011-02` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-02` | 有効な既存SECURITY authorityとproject／tenant／environment scopeをfixtureとして与え、同じ入力でscope外targetと未渡し権限の反例も与える。実credentialや実targetは使わない。 | 結果が入力されたscope内に制限され、authorityの発行・拡張をHARNESSが行わない。 | scope外アクセス、未渡し権限、内部DB／鍵／内部統制の共有を許すなら不合格。authority条件自体が不明なら該当operationを未評価／保留。 |
| `CASE-HARNESS-L10-011-03` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-03` | 複数progress update、終端／未完state、result/evidenceを与え、相関と呼出し元への返却、resumeに必要な内部state記録を観測。 | 全結果・証拠が同一operationへ相関し呼出し元へ返る。途中state記録はresume用に許されるが、呼出し元の結果保存・表示責務をHARNESSが引き取らない。 | 相関欠落／交差、結果未返却、呼出し元の結果保存・表示責務の移管は不合格。resume用内部state記録だけは不合格にしない。 |
| `CASE-HARNESS-L10-011-04` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-04` | operationを途中stateで停止し、同じ冪等keyで再開。expiryの前・境界・経過後の同一operation fixtureを別々に照合する。 | resumeが記録済みstateと同じlogical operationへ結び付き、再送で重複効果がなく、expiry後／中断をsuccessにしない。 | key変更による別operation扱い、途中stateの欠落を完了扱い、expired successはいずれも不合格。固定TTL・retry回数が未指定でも測定は停止しない。 |
| `CASE-HARNESS-L10-023-01` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-01` | 4 dependency class、owner、version/range、pack revision、operation/source conditionの宣言fixtureを評価。未実装依存を含むclassification-only fixture、分類欠落・曖昧の反例も与える。 | 4区分とrevision結束が保たれ、dependency implementationが未存在でもmissing/unknown分類を出力できる。 | 別区分への暗黙変換、未宣言条件の推測、missing依存をsuccess扱いすれば不合格。 |
| `CASE-HARNESS-L10-023-02` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-02` | operation条件true/false、selected/unselected source、reference-only、unknown/staleを別fixtureにする。出力は必要、条件不成立で対象外、未選択・未観測、参照のみ、unknown/stale・保留を区別する。単体pack greenのみと、必要service connection/composite evidenceを伴うfixtureも比較する。さらにsource選択を明示的に変更した新入力を別fixtureにし、closure/state/reasonを観測。pack契約の依存identity/区分/条件/版欠落は契約ownerへ、呼出し固有のoperation/source/scope/receipt不足は呼出しownerへ戻す。authorityまたは安全条件自体の不足・unknownは既存の該当authority ownerへ戻す。HARNESS-L1-005の利用境界の意味そのものが不明・矛盾する場合は、その境界の意味を持つPOへ戻す。いずれも根拠が揃うまで該当operationを保留する。 | 必須closure、条件不成立による対象外、未選択/未観測、参照のみ、unknown/stale・保留を区別する。未選択sourceは未観測。選択sourceが失敗しても同じ要求のまま別sourceへ移らず、明示再選択された新入力では新しいsourceの条件を再評価する。単体pack greenだけではconnection/compositeを成立扱いしない。欠落種別ごとの既存契約ownerへの戻し先を保持し、authorityまたは安全条件自体の不足・unknownは既存の該当authority ownerへ戻す。HARNESS-L1-005の利用境界の意味そのものが不明・矛盾する場合は、その境界の意味を持つPOへ戻す。 | unknownをfalse／optional／reference-onlyへ丸める、暗黙fallback、未選択sourceの成功推測、unit greenからconnection acceptanceを導くのは不合格。明示再選択を理由に拒否しない。 |
| `CASE-HARNESS-L10-023-03` | `FR-HARNESS-L3-023` | `AC-HARNESS-L3-023-03` | 権限・隔離・版・検証・記録が必要なsourceを人が代行するfixture、口頭のみの受領反例、後続版依存、1.0安全依存、依存unknown fixtureを評価し同じinput/revisionを反復する。現行利用で選択されていないが1.0全体の完成義務に属する能力も別scopeのfixtureとして与える。 | 人代行でもsource/actor/revision/scope/受領/検証receiptが返り、口頭のみは閉包根拠にならない。分類自体はmissing/unknownを出せる。後続版を1.0へ強制せず、1.0安全依存は必須。同一評価のclosure/reason差分0。今回未選択の能力も別途明示された1.0全体の完成義務から削除・延期されていない。 | 必要な義務・receipt欠落、安全依存削除、unknown実行可能扱い、再評価差分は不合格。authority定義は新設しない。 |
| `CASE-HARNESS-L10-010-04` | `FR-HARNESS-L3-010` | `AC-HARNESS-L3-010-04` | L11:205: function/folder一覧だけのfixtureとpack identity・owner・contract・release-unit収載のfixtureを比較する。 | pack identity・契約版・単一owner・release-unit収載が揃うfixtureだけ受理し、function/folder catalogはpack identityやownerの代替としない。 | function/folder一覧だけの入力は拒否し、不足箇所を示す。 |
| `CASE-HARNESS-L10-011-05` | `FR-HARNESS-L3-011` | `AC-HARNESS-L3-011-02` | L11:206: HARNESS要求だけの正常fixtureと、そこからWEB要求・設計を導出する変異を比較する。 | HARNESS要求は対象内とし、WEB要求・設計は導出しない。 | WEB導出は不合格。HARNESS正常scopeは拒否しない。 |
