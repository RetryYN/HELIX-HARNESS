# 運用ルール全体監査（2026-07-26）

## 目的

HELIXの運用正本、runtime adapter、機械gate、GitHub実体を横断し、矛盾、未強制、過剰統制、
無限収束要因を分離する。新しい統制を増やすことではなく、既存正本へ運用面を収束させる。

## 監査範囲

- 正本: `AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md`、governance README
- 工程: L1-L12、Forward、mode、gate、DDD/TDD、coding rules、design refactor
- GitHub実体: Issue、PLAN、branch、PR、review、CI、merge、closure、memory/DB
- 強制面: `rule-drift`、work-guard、git-command-guard、PR scope、merge admission、Actions
- 稼働証拠: PR #138、Issue #139/#140/#141、`harness-check` workflow

## 結論

工程、TDD、選択的DDD、no-code-first、原子的PR、scope manifest、foreign edit防止、同一HEAD review、
DB追従の骨格は存在する。一方、レビュー役割とfinding dispositionが正本・adapter・実運用で不一致だった。
これが重複実装、軽微な局所修正のIssue逃がし、reviewの反復増加を生んでいた。

## GitHub実体の照合

- main protectionはstrict required check `harness-check`、admin enforcement有効、人間review必須なし、
  force-push・branch削除禁止で、adapterのPR-only契約と一致する。
- PR #115はdraft・behindのpark状態を維持し、現行収束PRへ割り込んでいない。
- Issue #125はPR branch間のreview event配送、exact-HEAD lifecycle、read-only reviewer leaseの残契約を保持する。
- Issue #93/#139はCI性能・flake、Issue #141はwake spool pruneとしてcurrent correctness契約から分離されている。

## findingと処置

| ID | 重要度 | finding | 処置 |
|---|---|---|---|
| ORA-001 | Critical | L3 GH-FR-012がnative auto-mergeを許可し、要件正本§6とadapterの明示merge契約に反する | GH-FR-012をcurrent HEADのAI-B明示mergeへ是正 |
| ORA-002 | High | GH-FR-019がAI-Bにも修正を要求し、AI-Aと同じ修正を重複実装させる。PR #138でも[AI-B push](https://github.com/RetryYN/HELIX-HARNESS/pull/138#issuecomment-5080832201)により17分経過した旧CIがcancelされ再発した | AI-A=作成・blocker修正、AI-B=read-only収束reviewへ是正 |
| ORA-003 | High | severityだけで非blockerをIssueへ送ると、current contract内の局所correctness/securityも後続化する | contract impactと責務境界を先に判定し、局所findingはcurrent PR内で修正 |
| ORA-004 | High | reviewごとに改善をcurrent PRへ戻す有限停止条件が不明瞭 | blocker一括返却、新HEAD一巡、独立blockerなしのscope expansion禁止を明記 |
| ORA-005 | High | adapter drift gateがcommand名だけを比較し、merge/review/disposition規律の乖離を検出しない | 4つの共有markerを既存`rule-drift`へ統合 |
| ORA-006 | Medium | `audit-framework.md`の旧feature gate／auto-merge案がgovernance直下に残り正本と誤認できる | Reference onlyへ明示降格 |
| ORA-007 | Medium | Full CIが約20分でGH-NFR目標を大幅超過する | Issue #93/#139で独立改善。correctness scopeを縮退させずcurrent収束PRへ混載しない |
| ORA-008 | Medium | work-guardはforeign uncommitted fileを防ぐが、GitHub PR branchのdurable ownership leaseは未閉鎖 | Issue #125の残契約で扱う。新detectorを本PRへ追加しない |
| ORA-009 | High | finding promotion設計はactionable findingをIssue/Reverse/queueへ一律展開し、current PR局所修正を表現できない | L1/L3/L4/L5を`current_pr_fix`/`successor_issue`へ同期し、実装まではadapter markerでfail-close |
| ORA-010 | Low | CI concurrencyはPR ref単位で旧runをcancelし、main runを別groupに保つ | 現状維持。取消済runをgreen扱いしないaggregate契約も維持 |
| ORA-011 | Medium | design refactor、coding rules、DDD/TDDの正本とPLAN gateはあるが、behavior/性能を保った最小コード・state・dependency・CI分岐のbefore/after計測は設計済み・未実装 | HIL-BR-21、HIL-FR-39/40と対向oracleで追跡し、自己申告の行数削減だけをclosure根拠にしない |
| ORA-012 | Low | Issue #141 pruneと#139 flakyはcurrent behavior contractと独立 | Issue維持。#140はPR #138内修正後にmerge receiptでclose |
| ORA-013 | Medium | current coding/structure正本が降格済みrequirements v1.2を要件正本として参照していた | v1.3 §6へ更新し、v1.2をcompatibility referenceと明記 |
| ORA-014 | Low | Actionsの`setup-node@v4`がNode.js 20 action runtime deprecated警告を出し、runnerがNode 24へ強制実行している | Issue #93へ[証拠追記](https://github.com/RetryYN/HELIX-HARNESS/issues/93#issuecomment-5080800139)。対象workflowを次に触る直前に独立更新 |

## finite convergence契約

1. AI-Aがcandidate HEADを作り、内部の局所検証を通す。
2. AI-Bはread-onlyでcurrent HEADを一度レビューし、blockerを一括返却する。
3. current contract違反と同一責務内の局所correctness/securityはAI-Aがcurrent PRで修正する。
4. 独立責務、別設計、lifecycle、性能、将来改善だけをIssue化し、current PRへ戻さない。
5. 修正push後はreceiptをstale化し、AI-B review、CI、DB追従を新HEADで一巡する。
6. 新しい独立blockerがなければAI-Bが明示mergeし、改善提案でcandidate HEADを動かさない。

## 未完了の実装降下

本監査はL3正本とruntime adapterの矛盾を閉じる。次の項目は別責務であり、このPRに実装を混載しない。

- finding dispositionの`current_pr_fix` / `successor_issue`型とpromotion transactionへの実装
  （PLAN-L1-07のHIL-BR-17/HIL-FR-09/HIL-FR-30として追跡し、新Issueを重複起票しない）
- PR branch ownership leaseとreviewer read-only capabilityのGitHub実体への束縛
- atomic CIとpost-merge Full verificationの性能契約実装
- design refactor gateのコード量・複雑度・oracle保存計測

これらはG3で意味を凍結した後、L4/L5で既存ownerへ統合し、L6/L7でTDDする。新規detectorは
異なる2件以上の再発、既存gateで検出不能、complexity justification、removal triggerが揃う場合だけ追加する。
