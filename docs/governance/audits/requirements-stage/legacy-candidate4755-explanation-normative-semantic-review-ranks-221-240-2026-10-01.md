# Candidate 4755 規範語マーカー ranks221–240 意味監査

対象は独立再構成したmarker screenの順位221–240である。#2353の4,755 row recordsへ#2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381の順でclassification overlayを適用し、説明行2,965件を得た。禁止・必須・条件markerのraw hitは258件、見出し・表区切り行とscreenが指定する3つのMarkdown表header行を除外した候補poolは255件である。

raw queue rank222 `001500`、223 `001514`、230 `001910`はMarkdown表headerとして除外した。表data row `001672`、`001678`、`001685`は除外せず、screen上の順位253–255に残る。今回の対象はこの255件候補poolでの順位であり、header除外前の順位は表のraw順位列に示す。

選定行ごとにarchive原文・周辺文脈・source-line carry-forward ledger・asset disposition ledgerを対象revisionとSHAで照合した。現行inventory/crosswalkにはsource family単位の関係または状態記録があるが、選定行固有の採択binding、pair binding、完全coverageは確認しない。assetは全件`historical/unresolved`、source rowsは`historical_candidate/draft_candidate/preserved_pending_atomization`であり、authority effectは`none`。

## 順位と意味分類

表のscreen順位は3つのMarkdown表headerを除外した255件候補poolに基づく。raw順位はheader除外前の258件poolでの位置を示す。

|screen順位|raw順位|旧source ID|意味分類|単独の要求条件|marker|現行比較・残差|
|---:|---:|---|---|---|---|---|
|221|221|`LEGACY-CAND-LINE-001322`|複合工程・authority境界（複合工程・authority境界）|はい|mandatory:必要条件|OS L2のExecution Ticket family参照はあるが、この工程行に固有のselected-pair bindingは確認できない。 残差: 工程artifact、現行owner、意味承認と技術reviewの適用条件を個別に対応づける。|
|222|224|`LEGACY-CAND-LINE-001570`|要求条件（要求条件）|はい|mandatory:Required|Execution Ticket familyはOS L2へ接続されるが、このretry条件行の個別採択bindingやacceptance実施は示されない。 残差: retryの計数単位、回復route、実験／本線budgetのrow-level照合を行う。|
|223|225|`LEGACY-CAND-LINE-001582`|要求条件（要求条件）|はい|mandatory:必須|OS L2はWorkerの実行契約・測定・証拠を扱う。固定pair/PO判断はこのlegacy row全体や全20 acceptance接続の個別採択を示さない。 残差: 測定binding、live/formal権限境界、legacy bridge、HXB acceptanceのconsumerと採用revisionを分けて対応づける。|
|224|226|`LEGACY-CAND-LINE-001592`|移行・retirement条件（移行・retirement条件）|はい|mandatory:required|OS family relationはあるが、現行L2は旧CLI不要とも記し、この行のcutoverやretirement実施・個別bindingを立証しない。 残差: candidate source、実consumer、停止条件、旧direct authorityの権限境界と証拠をrow単位で照合する。|
|225|227|`LEGACY-CAND-LINE-001646`|指標定義（指標定義）|いいえ|mandatory:required|Trace familyのsource-level relationは確認できるが、固定pairへのこのmetric row個別採択・測定結果は確認できない。 残差: 対象obligation集合と妥当性oracleを別に特定する。|
|226|228|`LEGACY-CAND-LINE-001688`|failure-mode受入条件（failure-mode受入条件）|はい|mandatory:必須|OS authorityの候補scopeと比較可能だが、固定pairでこのfailure rowの個別crosswalkや実行済み受入は示されない。 残差: 影響scope、継続可能な無関係作業、新規起動停止、incident/recovery oracleを個別に結ぶ。|
|227|229|`LEGACY-CAND-LINE-001717`|費用上限条件（費用上限条件）|はい|mandatory:必須|OS Execution Ticket family relationはあるが、費用NFRのこの行と現行owner/measurement/authorityの個別bindingはない。 残差: 予約単位、累積charge、unknown/overrun処理、別実験budgetの適用範囲を確認する。|
|228|231|`LEGACY-CAND-LINE-001927`|trace/coverage assertion（trace/coverage assertion）|いいえ|mandatory:必須|Execution Ticket OS L2 family relationはあるが、このNFR-to-AC mappingのselected row bindingまたはacceptance executionは未確認。 残差: 現行NFR・L11 oracleのrevisionとtrace completenessを個別照合する。|
|229|232|`LEGACY-CAND-LINE-001949`|歴史的観測（歴史的観測）|いいえ|mandatory:必須|固定F6 pairとの個別要求対応なし。CI実行事実として現行へ転用しない。 残差: source event/CI contextは履歴として保持し、現行consumerや検証要件へ自動変換しない。|
|230|233|`LEGACY-CAND-LINE-002054`|受入oracle（受入oracle）|いいえ|mandatory:必須|FRS familyはHARNESS/OSの提供構成・導入・復旧へ分離して照合されている。固定PO候補集合はこのAC row個別の採択・受入実施を示さない。 残差: channelごとのprofile owner、独立review context、mutation oracleと現行pairを個別対応づける。|
|231|234|`LEGACY-CAND-LINE-002215`|要求条件（要求条件）|はい|mandatory:required|FRS source familyの運用管理とHARNESS提供条件は移管先に接続するが、row specific bundle conditionの個別bindingは示されない。 残差: 行継続を含むexact-set条件、Bundle owner、受入mutationを別々に照合する。|
|232|235|`LEGACY-CAND-LINE-002241`|要求条件（要求条件）|はい|mandatory:required|現行FRS family relationはあるが、この影響閉包／digest bindingへのselected row bindingや実受入は未確認。 残差: 直前行のFRS-R-12 headingと後続行を含む完全な条件、owner、digest oracleを照合する。|
|233|236|`LEGACY-CAND-LINE-002523`|license表示・適用条件（商用限定版の表示・許諾候補条件）|はい|mandatory:必須|family inventoryは権利・価格・準拠法を法務判断待ちとして現行LICENSE不変とする。個別license decisionや現行契約への行採用はない。 残差: この旧candidate文を法的結論・現行契約条件として扱わず、対象版・権利・表示の個別判断を保留する。|
|234|237|`LEGACY-CAND-LINE-002536`|要求条件（要求条件）|はい|mandatory:必須|family inventoryはHARNESS提供許諾、OS配布統制、製品契約へ分離し再採否待ちとする。現行pairの個別license-version bindingは確認できない。 残差: 版identity、owner、release/capability consumer、契約適用範囲を法務判断と混ぜずに照合する。|
|235|238|`LEGACY-CAND-LINE-002572`|引用・reference-only（引用・reference-only）|いいえ|mandatory:必須|現行比較に行レベルのadoptionまたはlicense interpretation bindingはない。外部ページを開かず、リンク先の現行法的内容も主張しない。 残差: lexical false positiveとしてsource contextと参照関係だけを保持する。商用ライセンス候補行の意味記述は旧sourceの候補制約であり、現行法的判断・契約条件の採択を意味しない。|
|236|239|`LEGACY-CAND-LINE-002968`|受入oracle（受入oracle）|いいえ|mandatory:必須|Infrastructure operations-quality familyは工程条件・OS統制・製品SLOへ分ける候補関係のみ。固定L2/L11 pairでこのL10 oracleの個別採択や実行はない。 残差: 適用先、edge定義、L10 ownerと実consumer検証をrow-specificに定める。|
|237|240|`LEGACY-CAND-LINE-003001`|受入条件（受入条件）|はい|mandatory:mandatory|instruction-path-change-resilienceはAIDOCへcandidate relationあり。旧owner/consumer/adapterを継承しない方針で、selected pairへの当該row bindingはない。 残差: Guardのcurrent owner、source provenance、Skill非依存consumer/oracleを個別に対応づける。|
|238|241|`LEGACY-CAND-LINE-003028`|受入条件の境界補足（受入条件の境界補足）|はい|mandatory:mandatory|family inventoryはprovenance、版固定、stale/provider差の候補関係を記録するが、release/cutover boundaryのこのrow個別bindingはない。 残差: 直前の証拠binding対象、現行のrelease/cutover admission、適用ownerを照合する。|
|239|242|`LEGACY-CAND-LINE-003190`|scope条件・説明（scope条件・説明）|はい|mandatory:必須|mechanism-adequacy familyはOS候補へ接続される一方、inventoryは旧UIL等を持込まず再採否待ちとする。現行pairに当該行の個別adoptionはない。 残差: scope境界の適用対象・期間と現行Concept/製品責務の対応を確かめ、Web対象範囲を拡張しない。|
|240|243|`LEGACY-CAND-LINE-003257`|request scope・判断境界（request scope・判断境界）|はい|mandatory:必須|source familyはOSにcandidate relationがあるが、対象別fixed pairは本requestの個別scopeやWeb着手判断を採択していない。 残差: 要求対象、明示された非対象、判断主体、別要求との接続を維持し、現行authorityを生成しない。|

## source・ledger・比較のpin

- #2353全4,755 source row baseline: commit `97672630b7de70fd4433827730c390cbabd90a99`、JSON SHA-256 `2c025c878ce1b63d93531ee980b08c785ba9273d6db6f751cf3237ce31d6696c`。
- ordered classification overlay: #2356、#2360、#2363、#2366、#2367、#2368、#2369、#2381。commit/path/content SHA-256はpaired JSONの`pinned_inputs`に保持。
- source-line ledger `docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl`: commit `50686b6762788574cb471967e8c24846d3dd56ae`、SHA-256 `a5f6cebe42b019a4f0511a54f7409493bc007d6395ec449cb0af8e2fa792d781`。
- asset ledger `docs/governance/legacy-asset-disposition.jsonl`: 同commit、SHA-256 `cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c`。行番号・entry SHA、archive SHA、source line SHA、physical line bytes SHAはpaired JSONに保持。
- 現行比較のsource-family inventory、crosswalk、固定F6のOS/HARNESS/INFRASTRUCTURE L2/L11と2026-09-28 PO判断recordはpaired JSONでpath・commit・本文hashをpinした。これらはselected source-row adoptionやclosureを意味しない。

## 解釈上の境界

- marker hitは語句の同定だけであり、義務・禁止・条件の現行採択を決めない。受入oracle、metric、trace assertion、歴史観測、引用、scope候補を区別した。
- current family relation/statusと固定pairの内容比較は、選定行のadoption、successor、acceptance execution、full source coverage、retirement、closureを確定しない。
- archive runtime、CLI、hook、adapter、test、CI、workflowは実行していない。外部リンク先も参照せず、静的な順位再構成、exact bytes/hash join、JSON/Markdown整合だけを確認した。

Authority effect: `none`。
