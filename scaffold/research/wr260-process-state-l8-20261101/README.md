# WR260 HARNESS-015 L8 process-state 軽量化

status: scaffold。静的な候補整理であり、`authority_effect=none`。

## 変更

`docs/helix-harness/L8-unit-verification/process-state-port.json`を、既存7 canonical case groupのままU-ID中心へ整理した。215 U-IDの識別子・固有条件・入力との対応・期待差分を残し、共通期待は各groupに一度だけ置いた。172 qualification rowもIDと変異条件・期待差分を維持した。qualification matrix 141行、mixed qualification 12行、content counterexample 14行、valley counterexample 10行、source-binding control 7行、source group 305行、source pin 16行、legacy comparison 10行を数えて保持した。

qualification matrix 141行はID・資格変化・変更path/state/value・期待owner refを元rowと照合した。共通のnot_executed/effectと、2種の共通理由をmatrix親に集約した。mixed red-missing + green-stale行は2条件を保ち、集約値unknownと両診断保持を明記した。14 content counterexampleは短い入力path/changeとtyped state/value、owner return/affected scopeを保持し、10 valley counterexampleは短いpath/change、partial state/value、owner targetを保持した。7 source-binding controlはbase caller U-ID参照、selected role、短いpath/operation、期待state/rule、source-binding限定境界を保ち、JSON Patch列とfixture値は残していない。これらの根拠は各`base_row_ref`から固定baseの行へ追跡できる。

L5の公開関数7件とL9 branch 7件をcanonical case groupへ維持した。L5 failure ruleとL4 negative classificationの対応を調査し、34負例行をL8へ追加した。各行の条件は既存U-ID入力から書き、期待分類・axis/state・expected/preserved・owner/side effectはL4とL5双方の値が一致するものを採用した。L9のnegative値やrow IDを転記せず、L9へ対応根拠がない2分類には対応付けを作っていない。F02の2個の既存L5 ruleは、L8既存ID `H003-L8-F02-POC-RESULT-MISSING` の独立した入力条件を使う。

実行payload、fixture/raw source、全件materialization・比較snapshot、private-call record実体、重複reference index、L9分類写し、非pin digestを撤去した。`removed_materials`は要求どおり6 keyで、`use_boundary`にDT-VT-105を指定した。before/after byte・row種別・削除宣言を主文書の`pre_removal_inventory`に記録した。固定revisionは由来・期待差分の照合に限り、fixture復元・実行・L7 oracleとして使わない。

旧材料内のL9 TDD symbolic pseudo-ID pointer 78件（`cases/3` 26件、`cases/4` 52件。key別では`packet_source_pointer` 24、`payload_source_pointer` 30、`source_packet_pointer` 24）は、PR #4005より前からRFC6901として無効だった。削除する実行材料中の参照として件数と経緯を記録し、対応する現行L9行が確認できない参照を残さず、代替pointerも作らない。

## 起点・保持境界

Issue #3510の軽量化依頼と、PR #4006のdigest/repr指摘、PR #4002の共通値重複、PR #3998の行別意味・期待確認を起点にした。cap 0を軽量化完了の証拠とせず、固有条件・期待の行単位保持、削除material inventory、残件測定を行った。旧HELIXでは旧設計のtraceと期待を保ちつつ実行機構・test fixtureは隔離する区別を参照し、旧sourceを現行の実行・oracleへ転用しない。

旧HELIXでは`archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md:21-33,112-121`が、公開契約とfailure semanticsの先行固定、Red/Green/Refactorの意味、net complexity、削減可能性の記録を定める。本件はこの「契約と意味は保ち、重複・実行材料を減らす」点を保持する。旧sourceのtest実行・fixture・oracleを現行へ持ち込まない。今回の文書差分は旧HELIXと異なり、L8候補の静的整理だけである。

本変更はL8文書と対応するscaffold検証資料だけを対象にする。L4/L9の意味・件数・case IDは変更しない。L4↔L9、L5↔L8のpair check passはnegative 4wayの成立を意味しない。

## 実測と残件

詳細なbefore/after件数、hash、check-childのattribute別実測と4way残件ID一覧は[`verification-summary.json`](verification-summary.json)に記録する。L8の6 U-IDには現行L9 numeric input pointerを置く根拠がなく、既存L8の条件だけを保持した。L4/L9 negative 4wayはL9 182行と他層34行のID不一致および7親branchの件数差が残る。checker実測では変更前として依頼に記録された223 failuresから今回223 failuresへ変化なし。L8の34行追加を失敗数の減少とは扱わない。source groupの実体は305 map rowsであり、旧初期集計332はtemplate rule stringの文字数27を行数に数えていたため、主文書の`count_correction`へ訂正根拠を記録した。

`validate_process_state_l8.py`は読取専用の静的validatorで、既定では記録ファイルを書かない。`--record PATH`を明示した場合も新規pathをexclusive-createし、既存ファイルを上書きしない。固定revisionの文書との構造・期待差分比較、現行参照の解決、L4/L5負例対応を検査する。実行結果、承認、formal oracle、受入、4way成立を生成しない。`scfctl validate`は200 bindings / fail 0、`scfctl stale`はstale 0。L8を参照する既存SCF-B-0186/0188/0202のcurrent pinはcandidate SHAへ更新し、旧SHAを各noteに履歴として残した。
