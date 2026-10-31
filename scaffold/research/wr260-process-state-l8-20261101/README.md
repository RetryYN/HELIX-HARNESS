# WR260 HARNESS-015 L8 process-state 軽量化

status: scaffold。静的な文書整理・照合であり、`authority_effect=none`。

## 整理内容

固定base `569bde0bc5792349f0833461f0bb1bb6db33c592` のL8を由来として、canonicalな7件の`cases` listを維持した。本文は9,811,684 bytesから614,380 bytesへ縮小した。215 U-IDごとにID、機能参照、日本語で具体化した固有入力条件、基準行との差分期待、ownerの根拠、元行参照を保ち、7機能の共通契約は各groupに一度だけ置いた。expected欄は固定base差分を省かず、state/valueの重複表現を統合した。期待差が基準行と同じ48行は、差がない事実を残して行単位で未検証とした。172 qualification行のうち差がない17行も未検証と記録し、固有の期待を推測で埋めていない。

他の節も別々に固定baseと照合した。qualification matrix 141行では各条件・型付き状態・明示されたowner状態を保ち、共通effectとexecution stateを一度だけ保持した。mixed red/missing + green/stale等の12行は両条件と集約結果を残した。content counterexample 14行、valley content counterexample 10行、source-binding control 7行はID・短い意味条件・固定baseとの差分期待・provenanceを残した。source-binding conditionは「005_valleyのrequest association欠落」等の意味条件であり、operation/path文字列ではない。patch列、入力値配列、全返却は残さない。source groupは305行で、各keyと存在するrole/state/member/affected field/source identity/scope/owner情報を保った。legacy comparisonは10行、source pinは16行を維持した。

L5の公開関数7件、L9 branch 7件と既存canonical listを維持した。34負例行はL4 classificationとL5 failure ruleから個別条件を記述した。L9の行値を転記せず、厳密な現行case IDを結べる32行だけを対応済みとした。`H003-L8-B01-QUAL-GROUNDING_PURPOSE-UNKNOWN`と`H003-L8-F02-POC-RESULT-MISSING`の2件は正確なL9 counterpartが見つからず、未解決として残した。

旧実行payload、fixture/raw source、full return、patch/recipe、巨大なmaterializationや比較複写、重複source reference index、非pin digestを撤去し、種類別件数を記録した。`removed_materials`は6 key、境界は`DT-VT-105`。固定revisionは由来・期待差分の静的照合にだけ使い、fixture復元・実行には使っていない。

旧L8にあるL9 TDD向けsymbolic pseudo-ID参照78件は、PR #4005以前からRFC6901として無効だった。内訳は`cases/3` 26件、`cases/4` 52件、key別は`packet_source_pointer` 24件、`payload_source_pointer` 30件、`source_packet_pointer` 24件。実行材料とともに撤去し、現行L9で裏付けられない代替pointerは作っていない。

## 根拠と差分

起点はIssue #3510、PR #4006のdigest/repr指摘、PR #4002の重複、PR #3998の行別意味・期待確認である。旧HELIXの対応箇所`archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md:21-33,112-121`を読み、公開契約とfailure semanticsを先に固定し、複雑さを減らせるか記録する点を参照した。旧sourceのtest、fixture、oracleは現行へ持ち込んでいない。

L4↔L9 pairとL5↔L8 pairはそれぞれ7対7でpassし、4way成立を意味しない。`check-child`のnegative 4wayは223 failuresで、依頼記録上の従前223件から変化なしだった。属性別は`presence` 216件、`negative_case_count` 7件。層別行数はL4=34、L8=34、L5=34、L9=182。件数差や未対応caseが残るため、34行追加による失敗減少は主張しない。最新main overlay上の現在測定は[`verification-summary-r6.json`](verification-summary-r6.json)に記録した。失敗行IDはr5とr6で一致することを確認し、巨大な residual 一覧は複写していない。

source groupの実数は305 map entry。従前の332はrule stringの27文字を行として数えた誤りだったため、L8のinventoryに訂正根拠を残した。L8入力に対応する現行L9 pointerは209件で、6件は根拠がなく未対応のまま保持した。

## 検証

`validate_process_state_l8.py`は固定baseとの行別意味差分、識別子、条件文、owner、参照、空期待・patch/full-return形、壊れたpointer、負例根拠を調べる静的validatorである。unit条件はID suffixをそのまま表示せず、基準行の入力事情を日本語で表す。source-binding conditionにoperation/pathレシピが残らないことも検査する。既定では記録ファイルを書かず、`--record PATH`指定時も新規pathをexclusive-createする。origin/main `151713275e2c2aa65bb23a8fe38eb63c46d570c8` overlayでvalidatorは全検査pass。`design_verification_checker.py check-child`では両pair、4層pin、ownership capがpassし、negative 4wayは上記223 failures。`scfctl validate`は207 bindings / fail 0、`scfctl stale`はstale 0。旧CLI、hook、runtime、CIは起動していない。

`verification-summary.json`、`verification-summary-r2.json`〜`verification-summary-r5.json`は前段候補・前回overlayの測定として不変の履歴に保持する。現候補の再検収は`verification-summary-r6.json`を参照する。L8を参照するSCF-B-0186/0188/0202/0223は最終L8 SHAをstale検出用pinとして持ち、直前のpin hashを注記に履歴として残した。
