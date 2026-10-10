---
title: "旧ルール群由来の要求候補57本と既存要求の重複候補cluster（RDP-002）"
status: draft
program_id: RDP-002
authority_effect: none
created: 2026-09-18
---

# 旧ルール群由来の要求候補57本と既存要求の重複候補cluster（RDP-002）

## これは何か

[旧ルール群から導いた要求候補](../../candidates/legacy-rule-derived-requirements.md)の57本（`RUL-*`）について、既存の対象別L2（HARNESS-L2-*、HELIXOS-L2-*）、既存の要求候補、旧要求（IR 153件・confirmed identity 175件）との関係を、[要求間の責務・機能重複review program](../../requirement-overlap-review-program.md)のrelation語彙で付けた。1要求1 clusterで、機械記録は[cluster台帳](legacy-rule-requirement-overlap-clusters.jsonl)にある。
関係付けはClaude Opusが行い、比較したrevisionはcluster台帳の`compared_revisions`にある。本書は重複候補の発見であり、要求の削除・統合・採否ではない。全clusterの`human_decision_ref`はnullである。

## 集計

| 主relation | 件数 |
|---|---:|
| partial_overlap | 40 |
| responsibility_split | 17 |

- 既存のどこにも関係が無い（`new_requirement_candidate`）: 3本 — `RUL-FRM-07`、`RUL-DEV-01`、`RUL-DEV-02`
- HARNESSの規範とOSの運転が混在（`responsibility_split`）: 17本 — `RUL-REL-01`、`RUL-COR-01`、`RUL-COR-02`、`RUL-COR-04`、`RUL-TKT-01`、`RUL-TKT-03`、`RUL-OSM-01`、`RUL-OSM-07`、`RUL-OSA-01`、`RUL-OSA-02`、`RUL-OSA-03`、`RUL-OSA-04`、`RUL-OSA-05`、`RUL-OSA-06`、`RUL-COR-07`、`RUL-OSA-08`、`RUL-OPS-01`。採否時にHARNESS側とOS側へ分ける候補。
- 既存要求と同一の意味（`exact_semantic_duplicate`）: 主relation・内部relationとも0本。RUL-OSA-03の旧2relationは下の原文比較によりpartial_overlapへ訂正した。旧identityと固有条件を保持する。

## 使い方

- システム群ごとのL2採否（#1852〜#1861）で、対応するclusterの`relations.existing_l2`を接続先候補、`legacy_requirements`を同一・包含の確認対象として使う。
- `responsibility_split`の要求は、HARNESS規範とOS運転へ分割する候補として人間判断へ送る。分割の実施は判断後の要求PRで行う。
- `new_requirement_candidate`の3本は、既存L2への追加候補として個別の要求PRで扱う。

## 確かめていないこと

- relationの正しさは1 model系統の判定であり、独立reviewは本PRのreviewに限る。人間判断はまだ無い。
- 旧要求との関係は分類台帳（system・層・product）に基づく候補であり、旧要求本文との逐語比較はしていない。参照IDは分類台帳のsource-qualified identityへ統一した（台帳に無い1件は`unresolved`）。
- `common_atoms`、`distinct_atoms_by_source`、`acceptance_differences`、`consumer_differences`、`unaccounted_atom_refs`は本書では未評価であり、台帳の`assessment_status`に`unassessed`と記す。空配列は「差分なし」を意味しない。programの完了条件はまだ満たしていない。

## 停止条件

- 本書とcluster台帳から、要求の削除・統合・採否・承認を生成しない。
- 主relationが`exact_semantic_duplicate`でも、原identityを消さない。

## 現在の本文比較：RUL-FRM-01（#1814、2026-10-10）

基準main `2a4882aea5e531fcd5d585b40dc4472537dafd57`。cluster台帳の`OVC-RUL-RUL-FRM-01.bounded_requirement_comparison`へ、原文span/hash、10比較軸、共通/固有条件、受入/consumer差、未比較集合を追加した。元のrelationと過去の比較revision、未評価fieldは歴史として保存する。

RUL-FRM-01の候補本文（工程順序とV-pairを閉じる）と、現行HARNESS001/003/004、NCI001/004、旧FR48/49・HBRP3・FRL103を要求粒度で照合した。双方向trace/片側欠落拒否と、未合意・未検証で進行させない方向は共通する。一方、001は現行層とL2.5区別、003は工程状態と段階証明/Backflow、004は変更影響、旧FR48/49は個別edge/oracle失敗、HBRP3はheld-out・機械/AI境界、FRL103は旧4artifact/PLAN/reportの条件を持つ。目的・入力・出力・回復・範囲が一致しないため完全重複としない。

元cluster noteの「上流未確定での下流進行禁止はL2表に明文なし」は現在の状態ではない。L11-003は未合意・未検証の進行拒否を明示する。この一般禁止を重ねる新候補は作らず、未比較の固有条件は残す。

| 比較範囲 | 結果 | 残るもの |
|---|---|---|
| 候補本文と上記要求の10軸 | 共通/固有条件を記録、partial_overlap維持 | formal successor/統合/retireは未判定 |
| 旧例3件 | 原文を読み、unique FR/placeholder/scenario、注釈regex、self-pairの差を記録 | 個別意味・consumerへの採否/同値証明 |
| underlying rule母集団 | 主294・副224のIDとinventory hashを全件保存 | 全518の個別比較、primary92sourceのconsumer閉包 |
| 全57cluster | 1clusterの候補本文比較を追加 | 他56と、このclusterのraw atom全比較 |

元の`assessment_status=unassessed`は全raw atom・consumer比較が未了であることを引き続き表す。追加した限定比較はその完了を代替しない。空配列を差分なしへ変換せず、未比較を#1814/親#1813で追跡する。rule所属は旧機械対応づけの候補であり確定ownerではない。要求意味/採否/承認、全条件被覆、holding解除、L3再開、#1814 closeを生成しない。旧実行系は全て非実行。

## 現在の本文比較：RUL-OSA-03（#1814、2026-10-10）

基準main `fb646ef29a4bdf01d46e7583210a442af4451ab7`。台帳の`bounded_requirement_comparison`へ13原文span/hashと10比較軸、変更前のrelation/noteを記録した。

旧HIL-BR-17/FR-30とRUL本文は、同責務の局所修正と独立責務の後続化では共通する。しかし旧要求の因果join、複数出力の原子的promotion、finding破棄/再流入/途中欠落の拒否と、RUL本文の一巡再審査・新独立blocker例外・対象変更staleは同一条件ではない。2本の`exact_semantic_duplicate`を`partial_overlap`へ訂正する。主relationの責務分割は保持する。

「一巡の再判定は旧要求に無く新規性がある」という旧noteも不正確で、旧AGENTS.md:327–328に同じ一巡/新独立blocker例外がある。現行HXT-FLOW-07には返却/次ticketの因果とfinding破棄/再流入/返却先欠落の負例があるが、現在の引用から旧全条件の採用や全同値を生成しない。DTK-OS-003は9/24の既決退役sourceで、歴史比較としてだけ保持し現行候補分母・successorへ復活させない。

主35・副40の全75rule IDとinventory hashを保全した。旧例3件の原文は確認したが、75ruleの個別全条件・consumer閉包・正式successorは未完である。既存の空配列と`assessment_status=unassessed`を完了へ変換しない。2clusterの本文比較があるが、他55とFRM01の518rule比較も残る。#1814/親#1813はOPENを保持し、要求統合・採否・retire・L3再開を生成しない。

## RUL-OSA-03：全75ruleのsource span比較（#1814）

`rule_source_comparison`に主35・副40の全75recordを原inventoryのまま保持し、列挙された全source spanの本文/行/hashと候補本文を一件ずつ照合した。各recordに共通する候補の句（D1〜D4）、固有又は未解決条件、原文support、consumer/正式successorの未完を記録した。以前の限定本文比較はその時点の記録として保持する。

処分先と一巡/staleの候補本文には、appeal・非終端receipt、promotion原子性、相談/継続/修正指示、lifecycle整合、時刻順序、QA doc-first、4種Backflowなどが入っていない。これらを候補本文へ縮退して被覆済みにしない。既存bug一律別PR、nonblocker一律後続、同reviewer sessionだけのblock解消、難易度別修正cycleも、現在の二分類/一巡と同じ操作又は条件ではなく、判断史・consumer・正式successorの照合へ残す。

| 原文対応の残件 | 確認した差 | 扱い |
|---|---|---|
| RE01-257 | v1.3:516にblocker一括返却はあるが、一巡/新独立blocker例外の句はない | RA-161に意味があることと、この行の直接根拠不足を区別し、inventory対応修正へ残す |
| RE01-258 | v1.3:516には局所correctness/securityがあるが、抽出文のdata loss/oracle/虚偽の列挙は当行にない | RA-162の別sourceを当行へ混ぜず、原文supportの範囲を確かめ直す |
| RG44-006 | 原文stateForにはmerge_conflict→blocked分岐があり、抽出文から落ちている | 全分岐・優先順を保持し、stateをfinding処分の二分類へ同一化しない |

原inventoryと旧sourceは変更していない。全75件についてsource spanと差分は記録したが、source隣接条件のatom境界、3件のsource対応修正、call/test/外部consumer閉包、正式successorは未完である。元assessment_statusと以前のpendingを完了へ書き換えず、未計上0を主張しない。#1814/親#1813はOPENを保持する。

## 抽出不備3件の比較用記述の訂正

3recordの`source_normalization`に、引用原文だけで成立する検索・比較用の文を記録した。RE01-257は「AI-Bはblockerを一括返却」、RE01-258は当行のlocal correctness/security修正と独立責務等の後続化、RG44-006はresolved/orphan/requested_changes/merge_conflict/その他の5分岐と優先順である。元inventory_recordと原文pinは不変で、unsupported句は削除せず保持する。一巡/新独立blocker例外はRA-161、blocker列挙と責務/scope条件はRA-162の別sourceにも残っているが、それをv1.3:516の根拠へ混ぜない。

registerのsupersedes鎖を再計算すると、現行の生存中holdingは`MPR-SH-LEGACY-RULE-005`（-004の配置訂正）である。以前の候補文書と研究記録の-004は当時のlocatorを示す。比較用記述の訂正は台帳/holdingの正式訂正を代替しない。台帳訂正には新digestを持つappend-only revisionと、直接pin 4 Binding・register consumer・生成rulebookの再照合が必要である。原inventory、register、Binding、rulebookはこの追補では変更していない。

3件の原文に忠実な比較用文は記録したが、source_holdingの訂正、consumer閉包、正式successor、atom境界は未完として#1814/親#1813へ残す。要求採否・意味のretire・holding解除・L3再開・Issue closeを生成しない。

## OSA03正式台帳の抽出訂正Draft

[訂正receipt](osa03-rule-source-extraction-correction-2026-10-10.json)に旧3recordの全field、原文pin、訂正後3record、before/after台帳digest、旧holding005とこのDraftで追記する006を固定した。RE01-257/258の過包含を引用行の直接条件へ訂正し、RG44-006のmerge_conflict分岐を回復する。7622 IDと候補routingは保持し、7619行はbytes不変。旧文を消さず、別sourceに残る一巡・blocker条件をretireしない。

registerは旧全prefixを保持してMPR-SH-LEGACY-RULE-006を一行追記する。source_preserved_unassigned/authority noneであり、要求採用やsuccessor成立ではない。仮ルール集59fileを再生成しgovcheckで7622件の保持を確認した。SCF-B-0002の入力pinを更新し、0011は47選択record全field不変＋validator、0021はfailure projection全field不変＋validatorで再照合した。0035は過去13 holding研究なので、訂正前の同一bytesを歴史snapshotへ保全し、generatorの読取先を固定して15path/13holdingのvalidatorを再照合した。

registerを直接pinする19 Bindingの固定BASE/current入力境界は再照合中である。このDraftではstaleを機械的pin更新で消さず、Ready/merge admissionを未成立とする。前の3件正規化と全75比較は訂正前の固定revisionに対する記録として保持する。正式台帳訂正の統合、残るconsumer、successor、他clusterのclosure、#1814 closeはまだ成立していない。

## register consumerの固定capture再照合（0095・0099）

[2件の再照合receipt](osa03-register-consumer-reconciliation-0095-0099-2026-10-10.json)に、現在のregister pinと実際の固定入力の違いを記録した。SCF-B-0095と0099は72b9f368の33行capture・MPR-SH-OUTSIDE67-001を使う研究である。現在のregisterでは001は002にsupersedeされており、旧001を現在の生存holdingと扱わない。同commitの全bytesを固定source snapshotへ保全し、2 Bindingの入力path/digestを当該captureへ訂正した。研究成果物・固定BASE・role・obligations・authorityは変更せず、各validator成功を確認した。

147 Bindingの構造検証はfail=0、残るregister staleは17件である。これは3件台帳訂正のmerge admission成立、要求採否・consumer closure・Issue closeを表さず、PRはDraftのまま維持する。残る研究では固定BASEとその後に更新された期待register digestの相違があるため、当時の入力revisionを別途特定してから再照合する。

## register consumerの後続input capture再照合（0057・0066）

[再照合receipt](osa03-register-consumer-reconciliation-0057-0066-2026-10-10.json)に期待digestと一致するGit revision `1c276ab2`（637行・45 live source holding）を記録した。これは研究の当初baseとは別の、その後に更新された入力digestの実revisionである。0057/0066の候補JSON/JSONLは不変のまま、register読取先とBindingを同一bytesのsnapshotへ束縛した。0066 selfcheckの成果物pathは現行research配置へ訂正した。両validatorと0057の42・0066の12 negative casesは成功した。

本文/metadataの以前の14/43 holdingと後続captureの45 holdingは現在の生存holding数を表さず、その時間的照合・研究全体のclosureは未完として各READMEに明記した。Bindingの役割・義務・authorityは変更しない。構造検証147件fail=0、残るstale Bindingは15件（0040はregisterに加えてfirst15 generator変更にも依存）であり、Draft維持・Ready/merge未成立とする。旧source/consumerの全closure、正式successor、要求採否、Issue closeは生成しない。

## register consumer 11件の固定入力再照合

[11件の再照合receipt](osa03-register-consumer-reconciliation-eleven-2026-10-10.json)に0062・0069・0071・0073・0074・0076・0079・0085・0087・0090・0092の固定入力を記録した。各期待digestに一致する1c276ab2の637行captureへ読取先とBindingを束縛し、selfcheckの成果物pathを現行research配置へ訂正した。0069の旧配置4参照は論理pathを保ったまま現行配置へ解決する。削除済みcounterpart052/056と改訂済み060は、元digestに一致するGit本文を歴史snapshotへ保全した。現在の要求・承認として復活させない。

11 validatorと既存224 negative casesは成功し、全候補JSON/JSONL・Bindingの責務/義務/接続/操作/置換は不変である。生成スクリプト3件はregister読取先のみ整合させ、syntaxと置換範囲を静的確認した。全再生成は実行していない。過去のholding数metadataと後続input更新の時間的整合、全研究の意味/consumer closureは未完として保持する。

構造検証147件fail=0、残るstaleは0040・0083・0096・0121の4件。0040はfirst15 generatorの変更にも依存する。PRはDraftを維持し、Ready/merge admission、正式successor、要求採否、holding解除、L3再開、#1814/親#1813 close、全要求ステージ完了は未成立である。

## register consumer 0096と0083の再照合

[再照合receipt](osa03-register-consumer-reconciliation-0096-2026-10-10.json)に0096の固定register読取を記録した。候補JSON/JSONLとBinding契約は不変。183/183行validator、既存27負例、remote進行模擬、独立183行coverageと4破損負例は成功した。generatorは固定入力への読取先のみ静的照合し、全再生成は実行していない。時間的整合、全意味atom化とsource/consumer closureは未完。

0083はscratchで移動済み4入力と後続register capture、counterpart062の同一Git本文を解決したが、PATH038のrelation条件で失敗した。実際のarchive hashと現行hashは異なり、選択記録/scanはcontent driftを記録する一方、validatorとBindingはsame hashを前提とする。旧scanのdrift一覧にも038が入っていない。不整合を検出したため0083の候補・Binding・検査は変更せず、過去更新史と条件の訂正を残した。

残るstaleは0040・0083・0121。Draftを維持し、Ready/merge admission、正式successor、holding解除、要求採否、L3再開、Issue close、全要求完了は未成立。

## 0083の静的観測条件の訂正

[0083再照合receipt](osa03-register-consumer-reconciliation-0083-2026-10-10.json)に当初/後続captureの更新史を固定した。当初の038 same-hashは26124da8eの観測として保持する。後続digestへの更新後、選択記録はcontent driftへ訂正されたが、canonical oracle・scanの旧drift一覧・062 captureが取り残されていた。5 counterpartの実本文hash関係を再導出し、scanのdrift一覧と062 digest/bytesの3項目、validatorの観測条件、Bindingの当該観測条件だけを訂正した。

選択source/anchor・25 unit本文・研究会計・unknown残差は不変。移動前4入力は現行配置へ解決し、期待registerは637行の固定capture、062は同一Git本文snapshotを読む。validatorと既存20＋062 stale scan負例1件が成功した。先行0096 receiptのfindingは当時の証拠として保持し、この静的エラーの解消から全研究closureを生成しない。

構造検証147件fail=0、残るstaleは0040・0121。PRはDraftを維持し、独立review・Ready/merge admission、全source/consumer closure、正式successor、要求採否・holding解除・L3再開・Issue close・全要求完了は未成立。

## 0121の実入力と旧承認revisionの分離

[0121再照合receipt](osa03-register-consumer-reconciliation-0121-2026-10-10.json)に実際のinventory/candidate digestを固定した。11候補は9月17日decisionで承認された旧Web/Web-OS SHAを保持している一方、validatorだけが変更後の現行参照SHAを期待していた。候補を変更せず、旧承認SHAの本文、当初BASEのboundary/作業入口、後続637行register captureを固定snapshotへ束縛した。Bindingの現行文書pinはcontextとして別に保持し、旧承認を現行bytesへ継承しない。

validator、既存16負例、隔離生成による13機械記録/source snapshot一致を確認した。生成された説明文は採用せず、研究scope・意味/source/consumer closure・正式successor・authorityの未完を保持する。候補JSON/JSONL・Binding契約は不変。残るstaleは0040だけで、Draftを維持し、独立review・Ready/merge admission・要求採否・holding解除・L3再開・Issue close・全要求完了は未成立。

## 0040のpost-append capture再照合

[0040再照合receipt](osa03-register-consumer-reconciliation-0040-2026-10-10.json)に期待digestの33行/14 holding register captureと、当時のphase inventory/program/登録契約を固定した。旧13 holding sourceは移動先又は訂正前snapshot、Scaffold参照は現行research配置へ解決する。logical path、32行prefix、33行append記録、13/14会計は保持し、旧001を現在の生存holdingへ戻さない。候補JSONとBinding契約は不変。

validatorと既存25＋祖先性2負例が成功し、read-only buildでmigration/read-after/first15 inventoryの全field一致を確認した。全147 Bindingの構造検証fail=0、stale=0。ただし新HEADの独立reviewは未完で、PRはDraft。全source/consumer closure・正式successor・他clusterの被覆・要求採否・holding解除・L3再開・Issue close・全要求完了は静的整合から生成しない。

## 独立reviewで判明した0083観測入力とregister来歴の訂正

b61a11d04への独立reviewでF1 blocker/F2 minorを受けた。[新しい照合receipt](osa03-independent-review-input-reconciliation-2026-10-10.json)に、誤った後日観測と正しい研究時観測を両方保存した。先行0083 receiptの7aa2c120中間captureと038 driftを研究時入力へ混ぜた処理は誤りである。全5 counterpartを研究base3184d613の固定Git bytesへ戻し、038 hash一致、062 aca38dce/9565 bytesを保つ。selected/inventory/scanのcounterpartと観測oracleだけを訂正し、25 unit本文・source-diffs/meta/ledgerとunknown残差は不変。main8955f45cの後日観測は別receipt fieldに保持し、研究時観測を上書きしない。旧receiptや7aa2c120 snapshotは当時の誤った処理の証拠として変更しない。

637行captureを使う16研究は、全研究baseの元registerがb68f3aca/33行（72b9f368 captureと同一）であることをGit bytesで確認した。1c276ab2の79c1e5a6/637行は9/29 refreshで更新された記録値であり、研究時入力ではない。後続refresh記録との静的照合にだけ使うことを各Binding note/READMEへ明記した。候補のregister記録値は保全し、当初base証拠や現在のholding数へ継承しない。0062研究は059/063/064/065/066の別集合で062 counterpartに依存しないが、そのbase294bfd90の062本文も同じaca38dce/9565であることを照合した。

0083 validator・baseline＋22負例、全5 counterpartの原記録一致、16 Binding契約と候補non-counterpart fieldの保全を確認した。Binding147 fail=0・stale=0。ただし修正後HEADの独立reviewは未完でDraftを維持する。全source/consumer closure、正式successor、他cluster被覆、要求採否、holding解除、L3再開、Issue close、全要求完了を生成しない。

## 現在の本文比較：RUL-FRM-02（#1814、2026-10-10）

基準main `f779b877411aa1e48ea0975fec50099956e2a93b`。台帳の`OVC-RUL-RUL-FRM-02.bounded_requirement_comparison`に、原文span/hash、10比較軸、共通/固有条件、受入/consumer差と主233・副264の全497 IDを保存した。候補本文・関連要求と旧例3件の比較を進めたもので、497rule全個別比較の完了ではない。

現行HARNESS002は方式によらずL1–L3と要件承認を保持し、003:195–196とL11:119–122は相談/依頼/採択/要件承認/操作認可、委任済み技術具体化と未委任意味変更を分離する。旧noteの「人間が承認する層とAIが進める層の分担は未被覆」は訂正し、一般分担の重複候補は増やさない。L3/L10承認の委任方式は10/8判断の範囲で読み、現在のL3停止は保持する。

旧HIL-BR-06:58とFR-07:97は要求本文なので、実装成立を根拠にした2 relationを`partial_overlap`へ訂正した。六gateの遷移禁止と、Closureの七検査対象/二出力は現行一般工程条件と同一ではない。FR07のうち057/054の限定8atomは9/30にpairとして採択され、10/10に版1.0となった。一方、memory 1atomはholdingに残り、採択済みpairの結果から旧IR全体のclose可否・正式移管を生成しない。9/29 receiptと本文の未採択metadataは当時の記録として読み分ける。AVS-BR-001の原文も確認したが、分類台帳のsource-qualified identity照合は未完としてunresolvedを保持する。

旧例では、confirmed owning PLAN後のbody起票とslot≠完成、freeze発火のdraft0/pair孤児0/confirmed>=1とpark例外、gate-confirmのmissing skipを別条件として保存した。AIDOCの取得/正本逆参照/unknown分離は工程条件の実行成功や承認とは別である。旧sourceは読むだけで実行していない。

全497ruleの個別source条件、consumer閉包、正式successorと保留意味、他54clusterの本文比較、FRM01/OSA03の残件は#1814/親#1813へ残す。既存の空配列と`assessment_status=unassessed`は維持し、未計上0・要求完了・Issue close・L3再開を主張しない。

## RUL-FRM-02：個別source条件の比較を開始

基準main `75871177f8fc13e3aed6287c3a563cede0cc0edc`。`rule_source_comparison`に主233の先頭60recordを原inventoryの全fieldのまま保存し、引用した全原文span/hash、候補本文の6句との共通性、固有/未解決条件を一件ずつ記録した。残る主173・副264の全437 IDは`pending_rule_refs`へ明示した。前の候補本文比較と未評価fieldは変更しない。

一般の工程条件だけでは、旧CLIの検査順序/時刻・review mode、coding rule影響、no-code/complexity budget、PLANと要求の別lifecycle、特定packetのDB2回/exact table条件、各routeの独立した終了条件は表現できない。引用原文へ戻してこれらを残し、現行の新しいgateや実装方式へ無判断に移さない。旧screen applicabilityのdecision/receipt/deferredとprototype/walkthroughの負例、closureのmemory欠落負例、source coverageの各edge欠落も一般freeze/完了の一語へ集約しない。旧assertionのdesign-defined/not-implementedは期待oracleであり実施済みではない。

引用spanの条件比較は60/497まで進んだが、読了分でも隣接条件のatom境界・判断史・call/test/外部consumer閉包・正式successorは未完。空の旧fieldを差分なしとせず、未計上0・要求全条件被覆・要求採否・holding解除・Issue close・L3再開を生成しない。#1814/親#1813で全残件を保持する。

## RUL-FRM-02：個別比較を120件まで追補

基準main `9f26f9cfd673c612d6720b5deb77678069acccbc`。既存の60recordとsource pinを保持したまま、主233の次の60recordの引用原文と候補句を比較した。`rule_source_comparison`は120/497まで進み、残る主113・副264の全377 IDをpendingとして保持する。初回60件という上の記録は当時の範囲として残す。

旧gate表のG2は表が★POなのに凡例/脚注の定義済集合にはなく、原FR13と判断史を確認するまで確定しない。旧UIなしL2skipの記述は、現行003のL2要求省略禁止・Prototype/PoC別適用・L2.5位置と区別する。trace-freeze checklistのfailingcommit SHA句はRB08-109文にないが、別RB08-106へ保存済みであるため全台帳の欠落や退役とは扱わず、freeze時の義務接続を残す。

特定cutoverの再承認、Incident時の全active PLAN凍結、旧Criticalだけでconditional pass、旧handover、package/wholegoal監査の分母や旧Issue終端順序も固有scopeと判断史を持つ。旧記録にある「成立した」は過去観測であり、現行の実績や新しい承認/CI/close条件へ継承しない。120件の引用条件を読み分けたことから、完全atom化・consumer閉包・正式successor・未計上0を生成しない。#1814/親#1813と残り377件、他clusterの残件を保持する。

## RUL-OPS-02：運用体制の限定した本文・全12引用条件比較

基準main `a4d6cf4af046e55c57de89ed017adab07fbe16c3`。主11・副1＝12件の原inventory全field、15引用spanと8関連/補助spanを保存した。引用未比較0は完全atom化・判断史・全consumer・正式successor・未計上0・全要求被覆・Stage完了ではない。元relationはoriginal_relationsへ保全し、OS004のno-material-overlapとAIDOC001のcredential失効説明を限定して訂正した。他56clusterのbytes、過去revision、note、未評価fieldを維持する。

旧チーム構想/運用書はReference-onlyで、本人PO1名＋AIrosterへの読替えを持つ。人間の招待/採用順/1on1/当番、成熟度の固定toolや80%例、初期30日、旧Phase0B全14項目のPRmatrix/prepushを現行全案件の必須手順へ移さない。旧v1.3soloはteam儀式・velocity・複数人roleを必須にしない。現行独立reviewやoracleを成熟度の例により省略する根拠にもならない。

現行OS004はWorker交代時の責務/未完義務/累積制約の保持、自己承認/二重割当防止を明示し、OS009の復旧と一部共通する。human入退場の全条件と同一にはしない。AIDOC001は許可等のcontext解決であり、実credential付与/短期保持/失効そのものを定めない。SECURITY005の生値非露出・scope/expiry・revoke伝播は別契約として照合し、実account/credential/認可/本番設定の変更を行わない。

サービスのAPM/稼働監視/oncallとOS008のCI実行監視は対象が異なる。候補句の保険/規制はこの12件にはないが、RB04-274（主FRM09/副OSA07）に保存済みである。別record原文を補助に保持し、母集団の所属を勝手に変更せず、欠落/退役やOPS02全条件被覆を主張しない。

要求本文・schema・Python/CLI/runtime/CI・仮登録・holding・Bindingを変更しない。OSA04/PLN01とFRM02の別Draft未レビュー候補を本main基準に混ぜず、#1814/#1813と全残件を保持する。要求採用・retire・Issueclose・L3再開を生成しない。
