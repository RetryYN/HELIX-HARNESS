# confirmed175 BR-07・UX-01・UX-03 条件別照合

- 監査時点: `2026-09-30`
- 比較対象: 現行main `0f5050e2b25cd622640c99c5de170cca087f7d8a` と、PO判断記録が指す固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。独立作業ブランチの基点はlocal integration `d84a7388fc56fbdb4df97d2eb0f5f0ddea611053`。
- 範囲: 旧confirmed identity `BR-07`（47行）、`UX-01`（55行）、`UX-03`（57行）。旧資産 `LEGACY-ASSET-9F48ADEEB477DCA54039`。
- 状態: 読取専用の意味照合記録。`authority_effect: none`。formal successor、要求採択、完全被覆、Step5完了を主張しない。

## 旧sourceと既存状態

旧archive source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md`、source holding、およびasset ledgerのfile SHA-256は `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` で一致する。旧sourceの条件行SHA-256はBR-07 `011a8c71…e358dce2`、UX-01 `2637888f…145567b6`、UX-03 `fa2b7362…79a9215`。asset ledgerはsource snapshot保存、product target unresolved、source authority confirmed、carry-forward `preserved_pending_rehome`、successor未割当を記録する。

既存confirmed175個票はBR-07を`PPR`、UX-01/UX-03を`OPEN`としている。本記録はその個票や集計を変更しない。対象revisionのHARNESS L2/L11 SHA-256は `aed75cb4…83100a` / `09b29631…39bcd4`、OS L2/L11は `c92d3c05…1747cf` / `925e06cd…dedd680`。いずれも固定revisionで取得した。

## BR-07 — 下流trace・回帰検知・balance ratio

**旧条件**: 上流変更に下流test/traceを伴わせ、回帰劣化を機械的に検知・blockする。3軸は上流→下流ID追随、`balance_ratio regression`、trace切れで、具体機構は旧L3 FR/L4送り（旧source 47行）。旧v2 import ledger F-3（40行）は、測定候補を`test_count / design_count ≥ 1.0`かつ孤児test 0とし、L3/L12送りに分類していた。これは旧下流メモであり、現行固定L2/L11の採択閾値ではない。

**固定pairで確認できる条件**: HARNESS-L2-004は要求変更から影響する設計・testと再検証範囲を導出し、trace/V-pair欠落と変更条件の検証漏れを識別する（L2 55行、L11 24行）。L11では影響を示せないrelationを`Unknown`に保ち、`Unaffected`や検証不要へ変えない例を置く（L11 62–63行）。HARNESS-L2-005は変更・layer・pair・kind・riskからoracle、expected failure、evidence等の必要検証を導き、省略した検査を記録・回収する（L2 56行、L11 25・47–52行）。

**残差**: 固定pairにbalance ratioの測定対象、分子/分母、適用scope、regression判定値はない。旧F-3の1.0/孤児test 0を採択値へ移さない。3軸を一つのratchet出力にまとめる判定・report schemaも確認できない。よって、BR-07のtrace/必要検証条件は部分的に再導出されているが、3軸全体の後継・被覆は確定しない。

## UX-01 — process/safety/automationの均衡

**旧条件**: §0とUX-01はprocess（進め方・V-model規律）、safety（壊さない・検証強制）、automation（AI委譲・速さ）を偏らせず統合し、単一軸に最適化しないとする（旧source 35・55行）。旧functional requirementsの後続AC-UX-01-01（778–787行）はD-03=0、D-04回帰検出率≥80%、D-06 bypass 0を努力目標、D-07 AI委譲時間率≥70%とし、一軸突出時はwarnとしていた。これは後続の旧仕様記述として記録するが、固定L2/L11への採択とは扱わない。

**固定pairで確認できる条件**: process側は方式選択/合成と工程条件を落とさない（HARNESS-L2-002/003、L2 53–54・100–111行、L11 22–23・34–43行）。safety側はrisk別の検証義務、oracle、expected failure、証拠と戻し先を扱う（L2-005、L2 56行、L11 25・47–52行）。automation/完成範囲はVersion 1の複数対象、サービス単体・接続・構成体を含む成立確認に現れる（L2-007、L2 58行、L11 27・67行）。

**残差**: 固定pairは三価値を一つの比較単位にせず、均衡や優先順位を判定するoracleを持たない。trade-off、測定窓、比較対象、許容差、warn/fail境界もない。旧ACの数値を現行へ読み替えず、UX-01は引き続きOPEN相当の未閉条件を持つ。

## UX-03 — next action、CLI、onboarding

**旧条件**: gate/lint失敗時の明確な`next_action`、分かりやすいCLI出力、滑らかなonboarding（旧source 57行）。旧L1はOT-11をnext_action明確性確認とする（221行）。旧FR-L1-44は途中導入について既存コード/docs/PLAN資産を入力に、初期baseline、資産import report、onboarding完了gate証跡を出力する（旧functional requirements 75行）が、「滑らかさ」を判定する閾値は同所にない。

**固定pairで確認できる条件**: HARNESS-L2-005は検証条件、oracle、expected failure、evidence、有効期限、差戻し先を説明できることを定める（L2 56行、L11 25・47–51行）。OS-L2-017はticketの対象/scope/受入義務/戻し先を持ち、入力不足・unknown・scope逸脱を実行可能にしない（L2 662–670行、L11 338–344行）。OS-L2-019は欠落・stale・拒否・未実行と成功を区別し、証拠不足時に成功checkpointを公開しない（L2 682–690行、L11 352–357行）。これらは理由・owner・戻し先や未完義務を扱うが、CLI利用者向け表現そのもののoracleではない。

**残差**: CLIの文面・構造・提示位置・利用者理解について、成功/失敗例、評価手順または判定oracleが固定pairにない。next_actionの優先順位や必要contextも未定義。onboardingについては旧FR-44のbaseline/import/gate artifactは特定できるが、所要時間・成功率・滑らかさの利用者判定基準は現行固定pairにも同旧FR行にもない。従って、ticket/evidenceへのfailure route保持をUX-03全体の充足とはみなさず、これらをOPEN残差として残す。

## 重複確認・検証範囲

- 現行mainとlocal integration `d84a7388`の既存全量個票、およびlocal integration上のBR-02〜05条件別監査を確認した。これら3 identityの独立した完了済み個別条件監査はなかった。
- 公開PR #2387–2392のheadとchanged pathsを確認した。各PRはFRS/World Governance/FRS metadata/Concept metadataの別監査pathであり、6件のdiff本文を3 identityで検索して一致がないことも確認した。
- 旧source、holding copy、asset ledger、全量監査個票、旧v2 ledger、旧UX-01 AC、旧FR-44、および固定L2/L11を静的に照合した。source line SHA・固定target file SHA・target ID・参照path・JSON構文を確認した。
- 旧CLI/runtime/hook/adapter/test/CIを実行していない。静的照合は採択・実装・実行・受入の証拠ではない。
