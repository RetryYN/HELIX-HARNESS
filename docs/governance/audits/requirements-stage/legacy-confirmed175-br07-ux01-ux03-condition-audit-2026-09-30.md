# confirmed175 BR-07・UX-01・UX-03 条件別照合

- 監査時点: `2026-09-30`
- 比較対象: PR base `c6418a5602a056d3503e578a0a8c92df15a6daeb` と、PO判断記録が指す固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 範囲: 旧confirmed identity `BR-07`（47行）、`UX-01`（55行）、`UX-03`（57行）。旧資産 `LEGACY-ASSET-9F48ADEEB477DCA54039`。
- 状態: 読取専用の意味照合記録。`authority_effect: none`。formal successor、要求採択、完全被覆、Step5完了を主張しない。

## 旧sourceと既存状態

旧archive source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md`、source holding、およびasset ledgerのfile SHA-256は `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` で一致する。旧sourceの条件行SHA-256はBR-07 `011a8c71…e358dce2`、UX-01 `2637888f…145567b6`、UX-03 `fa2b7362…791a9215`。asset disposition ledgerの対応fieldは`disposition: source_snapshot_preservation`、`product_target: unresolved`、`source_authority_state: confirmed`、`target_authority_state: draft_candidate`、`carry_forward_state: preserved_pending_rehome`。このledgerにsuccessor ID欄はない。BR-07/UX-01/UX-03のsuccessor未割当は[confirmed175全量監査](legacy-confirmed175-full-audit-2026-09-28.md)のidentity行で確認する。

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

## 2026-09-29 PO採択pairによる別revision照合

固定 `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の比較を残し、後続revisionは[2026-09-29 57-candidate PO decision](../../decisions/po-decision-2026-09-29-57candidates.md)（decision basis `c18969c73306f6ed4cc4b93249583cd7e5d9ff68`、PR baseでのdecision file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`）で確認した。同decisionはHARNESS-L2-042/対L11とHELIXOS-L2-036/対L11を採択している。L2/L11本文には採択前の候補表示が固定bytesとして残るが、この対象revisionの状態はPO decision recordから読む。両pairのMPR、full-file SHA、section SHAは併設JSONに記録した。

| 旧identity | 後続pair照合と残る境界 |
|---|---|
| BR-07 | HARNESS-042はDesign Refactor内の振る舞い保持、consumer/oracle/dependency根拠、意味変更時Backflowを定めるので、refactor境界の条件に部分的に関連する。しかし上流/下流ID完全性、`balance_ratio`分母・回帰閾値、3軸ratchet oracleは定めない。OS-036のRetrofit preflightは下流trace/回帰率を定めない。 |
| UX-01 | 042はDesign Refactorのsafety/behavior-preservation条件、036はRetrofit-upgradeのpreflight順序をそれぞれ扱う。process/safety/automationを比較する単位・trade-off・測定・warn/fail境界はどちらにもなく、均衡oracle残差は維持する。 |
| UX-03 | 042はDesign Refactorのreasoned route evidenceを定めるが、CLI表示やonboardingではない。036はRetrofit upgrade内でfail/unknown/stale/mismatchと戻し先を具体化し、failure stateの意味を部分的に補う。利用者向け文言/表示位置/理解oracle、next_action基準、onboarding評価基準は依然未定義。 |

後続採択pairの限定条件を加味した部分照合であり、successor割当、UX残差全体のclosure、authority変更は主張しない。

## 重複確認・検証範囲

- PR base `c6418a5602a056d3503e578a0a8c92df15a6daeb`の既存全量個票を確認した。BR-02〜05監査は同じPRに含む別artifact `[legacy-confirmed175-br02-br05-condition-audit-2026-09-30.json](legacy-confirmed175-br02-br05-condition-audit-2026-09-30.json)`で、identity scopeは重ならない。これら3 identityについてbase上に別の完了済み個別条件監査はなかった。
- 公開PR #2387–2392のheadとchanged pathsを確認した。各PRはFRS/World Governance/FRS metadata/Concept metadataの別監査pathであり、6件のdiff本文を3 identityで検索して一致がないことも確認した。
- 旧source、holding copy、asset ledger、全量監査個票、旧v2 ledger、旧UX-01 AC、旧FR-44、および固定L2/L11を静的に照合した。source line SHA・固定target file SHA・target ID・参照path・JSON構文を確認した。successor未割当はfull-audit identity行由来であり、asset disposition ledgerのfieldとは区別した。
- 旧CLI/runtime/hook/adapter/test/CIを実行していない。静的照合は採択・実装・実行・受入の証拠ではない。

## 57件・11件の後続decision全identity screen

R2393-07に対応し、2026-09-29の57候補decision全57 identity（42採択・11条件付き採択・4保留）と11候補decision全11 identity（10件の採択pairに加え現revision未採択HARNESS-L2-049）を、L2/L11 pair単位でscreenした。basis revisionは`c18969c73306f6ed4cc4b93249583cd7e5d9ff68`と`909c8015326f35f8d42ce12e3c388923de411d1f`。根拠decision SHA、全screen ID、近接pairのexact revision/file SHA/section digestは併設JSON `full_decision_set_screen` にある。固定`f6dad2a33e24f000b87d7f09b8d40288257e74cc`との比較は維持する。

追加の近接pairでは、HARNESS-034とLABO-061/065/067の計測・評価指標、OS-031のCI性能改善はBR07の計測に関係するが、旧3軸全体やbalance_ratio oracleを定めない。HARNESS-039はUX/UI scopeを結ぶがUX01のprocess/safety/automation均衡を決めない。HARNESS-052のcommand identityとOS-036の限定retrofit failure/return statesはUX03の一部に関係するが、一般CLIのnext_action文面、理解度、onboarding oracleを定めない。部分関連する具体pairと残差をJSONへidentity別に記録し、3監査の部分/残差判定を維持する。
