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

旧sourceは、利用者が意味入力に集中できること、同じPLAN/PR定型欄や派生物を反復手修正せず既存検証へ渡すこと、対象consumerを既存AuthoringとCI/Cursor先行経路に限ること、新しい業務設計・思考順序を固定しないことを要求する。L3 R01は意味入力・導出・実測引用の欄とownerを区別し、未定義の業務設計をtemplateに固定しない。L10 AC01/06およびL12 BR01認識は、実consumerでの利用、意味保持、再検証、対象版・入力・HEAD・scopeの固定、変更前後の効果測定を求める。出力だけ、未利用、手作業の工程移転、比較条件不一致、閾値・標本未設定の効果主張を認定しない。

指定HARNESS pairは工程の合意・検証・差戻しとverification obligationを保持する。INTELLIGENCE pairは反復failure patternからのBugbot候補、bounded repair、permission/Worker/HARNESS/OS結果の分離を扱う。これらは工程・failure検出・限定repairに近接するが、PLAN/PR定型欄や派生物の出力契約、Authoring/CI/Cursor consumer契約、反復手修正の低減を測るBR01固有oracleを定めない。INTELLIGENCEの限定repairを一般的なform generationへ拡張解釈しない。

BR01 source自体に数値thresholdはない。AC06は手修正数、LLM呼出し/tokens、時間、CI再走、手戻り、誤修復、未解消数を同条件で比較するが、threshold・標本数・対象consumerは既存NFRへ実測前に接続する。L12は未設定・未採取・条件不一致を未認定として扱う。監査では数値を補っていない。

## BR02 — scope・authority・evidence・独立review

旧sourceは、手作業削減でscope、承認、証跡、独立レビューの真正性を下げないこと、生成成功を実行・検収成功に昇格させないことを要求する。L3 R03はapproval、confirmed、review verdict、model、CI、cost、signatureの自由入力による確定を拒否し、有効な実記録から導出する。観測pathは実diff、許可pathは事前scopeから取り、自動拡張しない。L10 AC03/04は捏造claim、scope外・diff外、scope拡張、receipt欠落、digest不一致、手書き成功claimを拒否し、信頼済み実行器が観測したexit 0/空stdoutをreceipt真正性と分離する。AC05は意味digestの無審査更新とconsumer移行・rollback前の旧入口退役を拒否する。AC06/L12は実consumer、実際の独立review、完了証拠を要求し、正常系だけの安全性claimや自己申告成功を認定しない。

指定HARNESS pairは工程状態・影響範囲・verification evidenceを分け、unknownをskipへ変換しない。OS-018はWorker assignment/executionのscope・authorityを、OS-019はsource revision、actor、event、evidence、checkpoint、failure/unfinished continuityを扱う。SECURITY-008はactor/target/operation/revision/environment/scope/expiryが一致する個別operation authorityを扱う。近接するauthority/evidence境界は確認できるが、これらだけでBBG生成欄の真正性、個々のreceiptの独立oracle、独立reviewerの別identity/context、実consumer上の非昇格結果は証明されない。SECURITY permissionをreview・acceptance evidenceに読み替えない。

BR02 sourceはscope幅やfailure-rate等の数値thresholdを定めない。保持するnegative casesは、偽approval/verdict/model/CI/cost/signature、scope/diff不一致・拡張、receipt欠落・digest不一致、手書き成功、意味digestの無審査更新、consumer検証・rollback前の退役、生成だけでの合格主張である。fixed L2/L11のunknown、期限切れ、drift、失敗・未完、authority不足時の境界も記録したが、これらを旧BR02の追加要件として新設してはいない。

## 後発decision rowsと移管状態

57候補・11候補・live26の採択decision rowsを近接scopeとしてscreenした。decision recordのfile/row SHA、live26のMPR行、該当pair section digestはJSONに記録した。HARNESS-L2-041等のtemplate/stage条件、HARNESS-L2-060＋HELIXOS-L2-103の工程適用性に応じたevidence結線、HELIXOS-L2-106/108/110/111の限定的なauthority/evidence条件はいずれも個別の候補scopeにとどまる。どのrowにも二つのsource-qualified BBG identityはなく、BBG source atom、BR固有の生成・consumer oracle、successor assignmentを閉じない。

現行full-auditの行147/148とstructure classification、carry-forward、product-routing ledgerをsource rowと照合した。routing候補やL2/L11の存在をsuccessorへ数えず、両identityは引き続き `preserved_pending_rehome`、successor 0、meaning change 0、retire 0である。意味変更、retire、L3承認、実装・実行・検収状態を本監査から生成しない。

## 静的確認と限界

旧source、関連consumer、fixed L2/L11 pair、decision rowsをread-onlyで確認し、本文・行・section digestを静的に照合した。archive内CLI/runtime/test/CIは実行していない。これは条件比較と証拠pinであり、formal successor、source closure、L3 approval、実装許可、acceptance、Step 5完了を示さない。
