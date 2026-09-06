---
title: "Gate証跡の実体照合 L8単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-09-06
updated: 2026-09-06
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-1430-evidence-substance.md
parent_design: docs/design/helix/L6-function-design/gate-evidence-substance.md
pair_artifact: docs/design/helix/L6-function-design/gate-evidence-substance.md
---

# Gate証跡の実体照合：反例設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GES-011 | 必須集合の空偽装 | 他manifestが必須familyを満たしても当該manifestの空必須集合は拒否する。共通validatorの空集合もU-GES-005で拒否を確認 | `tests/g8-integration-workflow.test.ts` |
| U-GES-012 | S4証跡locator実体 | 存在しないlocal pathと、そのpathのbytesに束縛されないdigestをverified evidenceへ記載してもpendingのままにする | `tests/s4-decision-readiness.test.ts` |
| U-GES-009 | G9観測・判定分離 | 固定観測は不変、再観測は改変を拒否、観測欠落を再読取りで補わない | `tests/g9-system-workflow.test.ts` |
| U-GES-010 | G10観測・判定分離 | 固定観測は不変、再観測は改変を拒否、観測欠落を再読取りで補わない | `tests/g10-ux-workflow.test.ts` |
| U-GES-008 | G8観測・判定分離 | 実ファイル変更後も固定入力の判定は同一。再採取ではdigest不一致を拒否。観測欠落を実ファイル存在で補わない | `tests/g8-integration-workflow.test.ts` |
| U-GES-007 | loader観測 | 採取値を固定し、ファイル変更後も変わらず、再採取時に新bytesへ更新される。不在も失敗値として保持する | `tests/evidence-file-substance.test.ts` |
| U-GES-006 | G8 command対応 | 対象ITを含まないcommandで必須coverageを通そうとすると拒否する。同じcommand IDを別の対象ITで重複定義しても拒否する | `tests/g8-integration-workflow.test.ts` |
| U-GES-001 | 通常ファイル | bytesから得たhashとsizeを返し、内容変更後はhashが変わる | `tests/evidence-file-substance.test.ts` |
| U-GES-002 | 空出力 | 実際の空bytesのhashを返す。形式だけの偽装と混同しない | `tests/evidence-file-substance.test.ts` |
| U-GES-003 | 不在・directory | 通常ファイルでなければ失敗する | `tests/evidence-file-substance.test.ts` |
| U-GES-004 | repo境界 | 絶対path・親参照・repo外symlinkを拒否する | `tests/evidence-file-substance.test.ts` |
| U-GES-005 | 共通gateへの接続 | 合成fixtureの実bytes一致は受理し、形式が正しい偽digestと保存後の改変、対象項目を持たないcommandへのcoverage参照を拒否する。実コマンド実行や実案件coverageの成立は主張しない | `tests/evidence-file-substance.test.ts` |
| U-GES-013 | objective行境界 | G2のhollow rowとG9 markerの別行移動を拒否し、進捗証拠をuntrustedにする | `tests/goal-evidence-audit.test.ts` |
| U-GES-014 | objective bytes | 別artifact digestと固定観測欠落を拒否し、単一違反でもtrustを落とす | `tests/goal-evidence-audit.test.ts` |
| U-GES-015 | G10 browser | 実Chromiumでrender・keyboard focus・minimum target・ARIA・未完了状態表示を検査し、JSON reportとscreenshotを採取する | `tests/g10-browser-evidence.test.ts` |

このreader単体greenでは#1430を閉じない。G8/G9/G10の実manifest反例、正本mandatory集合、S4、objective-evidenceの接合を別途完走させる。

U-GES-005とU-GES-006は、同一coverage IDの失敗行を成功行の前に追加する反例も含む。
Mapへの変換で失敗が消える旧挙動を再現し、共通validatorとG8の両方で重複拒否を検証する。

U-GES-005/006は、必須coverageをfailedへ変えて終了要約を成功・失敗0件のままにする反例も含む。
従来の必須失敗拒否に加え、要約とcoverageの不一致を明示的に検出する。自己申告の整合検査であり、
実コマンド成功の認証とは別である。
