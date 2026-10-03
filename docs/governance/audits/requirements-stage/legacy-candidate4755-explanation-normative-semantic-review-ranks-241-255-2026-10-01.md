# Candidate 4755 規範語マーカー ranks241–255 意味監査

対象は、#2353の4,755 `row_records`へ#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381を順に適用して再構成したscreen queueのranks241–255である。effective explanationは2,965行。headingとMarkdown table separatorを除くmarker hitは258件、screenが追加で除外するMarkdown table header `001500`、`001514`、`001910`を除いて255件となる。末尾の条件marker行`001672`、`001678`、`001685`は表データ行で、screen ranks253–255に残る。

旧source本文と前後文脈、#2353 baseline physical bytes、source-line carry-forward ledger、asset disposition ledgerを行単位で照合した。全15行でsource-family levelのinventory relationを確認した。rank249はreceiptのexact source-line/selected-span bindingとD57 :72の条件付き採択を確認した（選択spanに限る）。選択行specific crosswalk/adopted pair bindingは1件、full source atom coverageとsource condition closureは0件。audit authority effectは`none`、旧資産はhistorical/unresolved、source rowはhistorical_candidate/draft_candidate/preserved_pending_atomizationとして扱う。

## 順位と意味分類

|順位|旧source ID|意味分類|単独の要求条件|marker|現行比較・残差|
|---:|---|---|---|---|---|
|241|`LEGACY-CAND-LINE-003321`|語彙taxonomyのmetadata|いいえ|mandatory:required|候補文書の分類語彙を示すが、単独の現行要求ではない。 残差: 旧分類語彙と後続の意味分類を接続するsource atomが未特定。|
|242|`LEGACY-CAND-LINE-003322`|語彙taxonomyのmetadata|いいえ|mandatory:required|候補文書の分類語彙を示すが、単独の現行要求ではない。 残差: 語彙と現行の機構十分性評価範囲との関係が未特定。|
|243|`LEGACY-CAND-LINE-003331`|反証条件・要求条件|はい|mandatory:必須|MA-R-03の新機構判定対象を絞る候補条件。現行採択や実施を意味しない。 残差: 条件のsource atom、適用scope、現行ownerとoracleを個別照合する。|
|244|`LEGACY-CAND-LINE-003356`|対象scopeと依存境界|いいえ|mandatory:必須|MA要求群の対象範囲を制限する候補文脈であり、独立した製品能力述語ではない。 残差: HELIX-Webを含む現行Concept境界と、既存Learningのowner・利用制限との対応が未確定。|
|245|`LEGACY-CAND-LINE-003383`|Visionの対象外条件|いいえ|mandatory:必須|候補Visionの範囲条件であって、単独の受入述語ではない。 残差: Vision条件の現行Concept／対象別L1への位置付けを照合する。|
|246|`LEGACY-CAND-LINE-003698`|人間判断・運用提示の工程条件|はい|mandatory:required|RFA intakeの候補条件として読めるが、承認済みpolicyや現行GitHub規則への自動昇格はない。 残差: RFAの構成atomごとのOS owner、authority boundary、fixed L2/L11対応を特定する。|
|247|`LEGACY-CAND-LINE-003770`|入口・出口authorityの受入oracle|はい|mandatory:必須|候補GH-02の受入oracle。現行HELIXのPR運用と似る語句も、旧rowの採択・実行証拠にはならない。 残差: authority条件の現行責務と当該候補行のpair binding・L11 oracleを確認する。|
|248|`LEGACY-CAND-LINE-003956`|Requirement IRへのadmission/read-after条件|はい|mandatory:必須|RAMG-BR-006の候補本文。現在の意味正本やJSON-only authorityを確定しない。 残差: RAMG候補の再採否と現行canonical source境界を個別に照合する。|
|249|`LEGACY-CAND-LINE-004497`|active WIP算出とbackpressure条件|はい|mandatory:required|receipt `helixos-o3-o5-capacity-source-lines-2026-09-29-r2.jsonl`はline SHAで`OSCAP-049-002-S2`のselected spanを束ね、D57 :72はexact `HELIXOS-L2-049/-L11-049`を条件付き採択（後段の検証義務・担当・capacityを割当前に確保）する。旧CI／Merge Train、数量・provider構成は採択しない。残差: HARNESS/OS責務と現行oracleを照合し、selected span外のline remainderはpreserved_pending。successor/closure 0。|
|250|`LEGACY-CAND-LINE-004525`|HWG-AC-09の受入oracle|いいえ|mandatory:必須|受入判定のoracle行。enforce導入や既存gate実行を許可する規則ではない。 残差: HWG-R-05/R-08/R-09とのoracle対応および現行security/release境界を特定する。|
|251|`LEGACY-CAND-LINE-004615`|HWG入力出力・stale扱いの候補要件|はい|mandatory:必要条件|world-governance intakeの規範的なsource atom。family-level relationのみで個別採択はない。 残差: HWGのatom境界、source authority、現行owner、失敗oracleを個別に接続する。|
|252|`LEGACY-CAND-LINE-004740`|HWG-R-08の候補要求条件|はい|mandatory:必要条件|候補R-08の規範的source row。intakeの004615と意味的に重なるが、同一要求への統合は判断しない。 残差: intake/requirements重複、atom identity、現行ownerと個別pair bindingを照合する。|
|253|`LEGACY-CAND-LINE-001672`|sampling/drift policy適用時の実験条件|いいえ|conditional:場合のみ|trigger matrixの列文脈に依存する表データであり、一般的な独立要求条件ではない。 残差: 現行OS観測policyと実験生成scopeに対する個別対応を確認する。|
|254|`LEGACY-CAND-LINE-001678`|budget/権限成立時の手動測定条件|いいえ|conditional:場合のみ|trigger matrixの列文脈に依存し、budget・権限を定義する正本ではない。 残差: 現行budget/authority sourceと測定起動条件を別々に対応づける。|
|255|`LEGACY-CAND-LINE-001685`|budget/必要記録成立時のdegraded復旧条件|いいえ|conditional:場合のみ|状態・列文脈に依存する運用例。現行の実行許可や障害policyを定めない。 残差: 必要record、budget、durable-journal条件、現行ownerを個別照合する。|

## source・asset・current/decision pins

- #2353 full row-record baseline: commit `97672630b7de70fd4433827730c390cbabd90a99`、JSON SHA-256 `2c025c878ce1b63d93531ee980b08c785ba9273d6db6f751cf3237ce31d6696c`。
- 順序付きoverlay: #2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381。各commit/path/SHAはpaired JSONに固定し、#2369 `scope.source_rows[].proposed_classification`を含めてeffective classificationを再構成した。
- source-line ledger: `docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl`、commit `50686b6762788574cb471967e8c24846d3dd56ae`、SHA-256 `a5f6cebe42b019a4f0511a54f7409493bc007d6395ec449cb0af8e2fa792d781`。Asset disposition ledgerは同commit、SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c`。各rowのentry line/SHA、archive file SHA、line SHA、terminator込みphysical bytes SHAはJSONに記録した。
- fixed F6 pair comparisonはHELIX-OS/HARNESS/INFRASTRUCTURE L2/L11を用い、current owner/statusは`candidate-source-target-inventory.md`のfamily rowsを参照した。2026-09-28 PO decision pinsはpaired JSONに列挙したが、明示候補集合外のselected legacy rowの採択根拠には使っていない。

## 解釈境界

- marker hitは文字列照合であり、義務・禁止・条件の現行有効性や採択を生成しない。分類表metadata、Vision scope、受入oracle、候補要求、条件付き運用表を区別した。
- source-family relation全15行は行単位crosswalkを意味しない。rank249だけreceiptに記録されたselected spanを条件付き採択し、full source atom coverage、successor、retired、source condition closureは0。
- 旧archive runtime、CLI、hook、adapter、test、CI、workflowは実行していない。確認はclassification/rank再構成、文書とID対応、exact byte/hash join、MD/JSON整合の静的確認に限る。
