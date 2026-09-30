# confirmed175 BBG-BR01／BR02 条件照合監査

基準HEADは `a3340369530d06a636db6feb4a99a685a7c2c070`。旧sourceの根拠assetは `LEGACY-ASSET-28388EEBDFDC4F913755`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/bugbot-generation-requests.md` の全体SHA-256は `043c17eaf4cc134b76169f8852cb2f3bfb14ede24bdc8efcf45f4c263d1aa063`。asset台帳の該当行は [asset disposition](../../legacy-asset-disposition.jsonl) 420行、行SHA-256はJSONに記録した。archive sourceと同一byteのholding sourceも確認した。

照合したidentityは次のsource-qualified ID二つであり、ID文字列の近似や共通意味から統合しない。

| source-qualified ID | 旧source行 | carry-forward状態 | successor |
|---|---:|---|---|
| `helix/L1-requirements/bugbot-generation-requests.md::BBG-BR01` | 30–32 | `preserved_pending_rehome` | なし |
| `helix/L1-requirements/bugbot-generation-requests.md::BBG-BR02` | 34–35 | `preserved_pending_rehome` | なし |

## 照合対象と方法

旧sourceのBR文、対応するL3 `BBG-R01..04`、L10 `BBG-AC01..06`、consumer側のL12認識設計、PLANの来歴・残義務を読み、各source conditionを指定された固定L2/L11へ比較した。source、L3/L10/L12/PLANのファイルSHA、参照行・行SHAと、fixed pairのファイルSHAおよびsection/line SHAは[構造化監査記録](legacy-confirmed175-bbg-br01-br02-condition-audit-2026-10-01.json)に固定した。

section SHAは固定revisionのUTF-8行をLFで連結し、末尾改行なしでSHA-256を計算した。file SHAはraw bytesのSHA-256。HARNESSのL2/L11表形式要件は表行そのものをsection pinとして示し、追加のV字・verification条件は指定line SHAでピン留めした。INTELLIGENCE、OS、SECURITYは対象IDの詳細sectionをL2/L11 pairとしてピン留めした。固定targetは2026-09-28 PO判断が対象とする `f6dad2a33e24f000b87d7f09b8d40288257e74cc` から読んだ。

指定されたfixed pairは次のとおり。

- BR01: `HARNESS-L2-003/005`, `HELIXINTELLIGENCE-L2-015/016/017` と各L11。
- BR02: `HARNESS-L2-003/004/005`, `HELIXOS-L2-018/019`, `HELIXSECURITY-L2-008` と各L11。

## BR01 — 意味入力と既存consumerでの効果

旧sourceは、利用者が意味入力に集中できること、同じPLAN/PR定型欄や派生物を反復手修正せず既存検証へ渡すこと、対象consumerを既存AuthoringとCI/Cursor先行経路に限ること、新しい業務設計・思考順序を固定しないことを要求する。L1のtrace（lines 37–39）はBR01をR01/R02/R04、AC01/02/05/06へ接続する。R01は意味入力・導出・実測引用の欄とownerを区別し、未定義の業務設計をtemplateに固定しない。R02は同じsource・入力・生成器版で意味出力を一致させ、時刻等を観測記録へ分離し、欠落・矛盾・未対応を安定コードで拒否し、自由文・外部文書を実行コードにしない（旧L3 lines 48–52、AC02 line 34）。R04はsource/generator/output/consumerの版とdigestを束縛し、影響箇所だけを再生成し、混在文書の意味入力を保全し、意味digestの無審査更新および後継consumer検証・rollback前の手書き入口退役を拒否する（旧L3 lines 60–64、AC05 line 37）。

固定pairでは、HARNESS-L2-003/005が工程遷移・影響範囲・検証義務を扱い、INTELLIGENCE-L2-015/016/017が反復failure検出・限定修復・owner別結果を扱う。これらは隣接する工程・修復条件であり、同一source/input/generator-versionの意味出力oracle、安定生成error code、外部文字列の非実行、影響箇所だけの再生成、混在文書の保存、sourceからconsumerまでの版/digest結線、意味digest review、consumer移行とrollback前の退役を定めない。条件ごとの比較と固定pair pinはJSONのBR01 R02/R04行に記録した。

指定HARNESS pairは工程の合意・検証・差戻しとverification obligationを保持する。INTELLIGENCE pairは反復failure patternからのBugbot候補、bounded repair、permission/Worker/HARNESS/OS結果の分離を扱う。これらは工程・failure検出・限定repairに近接するが、PLAN/PR定型欄や派生物の出力契約、Authoring/CI/Cursor consumer契約、反復手修正の低減を測るBR01固有oracleを定めない。INTELLIGENCEの限定repairを一般的なform generationへ拡張解釈しない。

旧L3 `bugbot-generation-requirements.md` lines 36–39は、コア①の責務としてGH-FR-007のCLI生成とledger照合、GH-FR-014のtemplate/schema/fixture先行、#1608のsource→generator→output→consumer伝播を再利用し、意味入力・正本導出欄・信頼済み実行receipt引用欄を分ける経路を明記する。R02 line 50はtyped入力を既存CLIへ渡し、AI JSONを未信頼入力として検査するconsumer/implementation境界を明記する。これらの旧条件行SHAはJSONのBR01 condition comparisonに固定した。指定されたHARNESS-L2-003/005は工程gateと検証義務、INTELLIGENCE-L2-015/016/017はfailure検出・限定修復・結果handoffを扱うが、いずれもGH-FR-007/014や#1608の既存consumer経路、ledger照合、既存CLIへのtyped入力境界を定めない。したがってこの接続は固定pairとの近接・不足比較として分けて記録し、旧CLIの実行・推奨、同等性、successor割当、authority変更を含めない。

BR01 source自体に数値thresholdはない。AC06の「まず一系統」は、作成から再検証までを実consumerの一系統で通すという、この認識runのconsumer-scope cardinalityが1であることを示す。全Authoring/CI/Cursor consumerへの一般化やconsumer母集団の代表性は含まない。AC06は手修正数、LLM呼出し/tokens、時間、CI再走、手戻り、誤修復、未解消数を同条件で比較するが、threshold・標本数・対象consumerは既存NFRへ実測前に接続する。L12 BR01 line 29はinput/source/generator/consumerの各版、HEAD、作業scopeを固定した変更前後比較とし、未設定・未採取・条件不一致を未認定として扱う。PLAN lines 297–298はこのNFR接続と同条件の実測に加え、未提供の別紙02/03/05および別紙03の18シナリオ全件照合を残義務としている。監査では閾値や標本数を補っていない。

同条件の誤修復数・未解消数について、別sourceの採択済み`HELIXLABO-L2-066`（[57候補PO判断](../decisions/po-decision-2026-09-29-57candidates.md) line 81）も近接する測定条件としてscreenした。066は旧Bugbot bounded-repair候補の独立source atom `LEGACY-CAND-LINE-000425`（asset `LEGACY-ASSET-D881AF6AFD277B1DE934`、source line 75）を起点にし、Aとの同一eligible-case分母・事前固定oracleでこの二指標を見える化する。費用・時間・手戻り等は採択済みLABO-L2-059の条件を再利用する。066はBR01 source identityではなく、BR01の既存consumer比較や生成oracleを与えない。閾値・標本数の設定や完了、BBG successor割当、source closureは本監査から導かない。decision row、MPR登録行、L2/L11 sectionの各pinはJSONに記録した。

## BR02 — scope・authority・evidence・独立review

旧sourceは、手作業削減でscope、承認、証跡、独立レビューの真正性を下げないこと、生成成功を実行・検収成功に昇格させないことを要求する。L3 R03はapproval、confirmed、review verdict、model、CI、cost、signatureの自由入力による確定を拒否し、有効な実記録から導出する。観測pathは実diff、許可pathは事前scopeから取り、自動拡張しない。L10 AC03/04は捏造claim、scope外・diff外、scope拡張、receipt欠落、digest不一致、手書き成功claimを拒否し、信頼済み実行器が観測したexit 0/空stdoutをreceipt真正性と分離する。AC05は意味digestの無審査更新とconsumer移行・rollback前の旧入口退役を拒否する。AC06/L12は実consumer、実際の独立review、完了証拠を要求し、正常系だけの安全性claimや自己申告成功を認定しない。

指定HARNESS pairは工程状態・影響範囲・verification evidenceを分け、unknownをskipへ変換しない。OS-018はWorker assignment/executionのscope・authorityを、OS-019はsource revision、actor、event、evidence、checkpoint、failure/unfinished continuityを扱う。SECURITY-008はactor/target/operation/revision/environment/scope/expiryが一致する個別operation authorityを扱う。近接するauthority/evidence境界は確認できるが、これらだけでBBG生成欄の真正性、個々のreceiptの独立oracle、独立reviewerの別identity/context、実consumer上の非昇格結果は証明されない。SECURITY permissionをreview・acceptance evidenceに読み替えない。

BR02 sourceはscope幅やfailure-rate等の数値thresholdを定めない。保持するnegative casesは、偽approval/verdict/model/CI/cost/signature、scope/diff不一致・拡張、receipt欠落・digest不一致、手書き成功、意味digestの無審査更新、consumer検証・rollback前の退役、生成だけでの合格主張である。fixed L2/L11のunknown、期限切れ、drift、失敗・未完、authority不足時の境界も記録したが、これらを旧BR02の追加要件として新設してはいない。

## 後発decision rowsと移管状態

57候補・11候補・live26の採択decision rowsを近接scopeとしてscreenした。57候補decision line 81の`HELIXLABO-L2-066`もAC06の誤修復・未解消数に関する別sourceの測定近接例として加えた。decision recordのfile/row SHA、MPR登録行、L2/L11 section digest、およびlive26のMPR行はJSONに記録した。HARNESS-L2-041等のtemplate/stage条件、HARNESS-L2-060＋HELIXOS-L2-103の工程適用性に応じたevidence結線、HELIXOS-L2-106/108/110/111の限定的なauthority/evidence条件はいずれも個別の候補scopeにとどまる。HARNESS-L2-049も近接例としてrevision別に固定した。11候補decision line 46の`-002`は不採択であり、後発live26 lines 39, 72の`-003`は訂正済L11での計測専用採択（試作品生成等を含まない）で、`-002`の判断を遡及変更しない。どのrowにも二つのsource-qualified BBG identityはなく、BBG source atom、BR固有の生成・consumer oracle、successor assignmentを閉じない。

現行full-auditの行147/148とstructure classification、carry-forward、product-routing ledgerをsource rowと照合した。routing候補やL2/L11の存在をsuccessorへ数えず、両identityは引き続き `preserved_pending_rehome`、successor 0、meaning change 0、retire 0である。意味変更、retire、L3承認、実装・実行・検収状態を本監査から生成しない。

## 静的確認と限界

旧source、関連consumer、fixed L2/L11 pair、decision rowsをread-onlyで確認し、本文・行・section digestを静的に照合した。archive内CLI/runtime/test/CIは実行していない。これは条件比較と証拠pinであり、formal successor、source closure、L3 approval、実装許可、acceptance、Step 5完了を示さない。
