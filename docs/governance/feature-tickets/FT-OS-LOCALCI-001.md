---
feature_ticket_id: FT-OS-LOCALCI-001
title: "開発repository向けlocal CI driver"
product_target: HELIX-OS
state: ready
authority_effect: work_projection_only
created: 2026-10-09
scope_class: development_repository_ci
parent_requirements: []
depends_on: []
scaffold_binding: SCF-B-0158
github_projection:
  issue: 2730
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-local-ci-projection-2026-10-09.md
---

# FT-OS-LOCALCI-001

## 目的と根拠

開発repositoryの固定targetに対し、全量local static CIを運転し、選択済みmerge-unit照合の材料を作る。
作業許可は[Stage 1実装・CI解禁判断](../decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md)の判断2による。
設計入力はmain `cb920c9dae9a4c2a7a023a361e654bddef4d4dd8`のOS local CI L4/L9・L5/L8・L6/L7の6本文で、
exact bytesのSHA-256は[SCF-B-0158](../../../scaffold/bindings/SCF-B-0158.json)へ固定する。
本ticketは要求を採択するものではない。OS-020（Stage 2a）とHARNESS-036（Stage 3）は設計の契約参照であり、Stage 1の親へ加えない。

## 作業範囲と検収

1. 固定Git identity・argv・environmentでbase/merge-base/head/treeとclean checkoutを確認する。
2. Git objectから必要入力とprivate object setを読み、元checkout・config・credentialを渡さないread-only snapshotを作る。
3. 固定順のLC-SCF-001、LC-SCF-002、LC-GOV-001、LC-DIFF-001、LC-DESIGN-001をlocalで試行する。
4. 明示manifestの10文書、ID、参照、coverage edge、期待値locator、旧source pinを構造照合する。意味完全性やoracleの正しさを推定しない。
5. stdout/stderr本文を保存せずdigestを記録し、信頼側だけがcheckout外へ0600のreceiptをatomic writeする。
6. workflow_dispatchでexact targetのreceiptを照合し、Actionsで選択したLC-DIFF-001だけを同じ契約で実行・比較する。他4検査はlocal-onlyである。
7. L7のUT-LCI-01〜75を合成Git object・synthetic receipt・stub processで実装し、各変異の型付き診断を確認する。

required checkの欠落・skipを許さず、通常のchecker失敗後も残りを続行する。target/checker drift、cancel、隔離不能、
process停止・reap不能はL5/L6の境界に従う。最終driftではreceiptを発行せず、実行evidenceを別診断へ保持する。
required ID/edge欠落、重複、未解決参照はpreflightで止め、checker実行後のfailと混同しない。

## owner・依存・置換

HELIX-OSが運転とrun記録を所有し、HARNESSのnormative CI契約を書き換えない。
driverとtests/fixturesはSCF-B-0158の下で`scaffold/local-ci/`へ置く。workflowだけはGitHub所定の`.github/workflows/`へ置く。
現行scfctl/govcheck/gen_rulebookへのadapter依存を保持する。正式OS unitへの移管候補は
`helix/helix-os/units/os-ci-runner/`であり、依存閉包・transfer対応確認後にcheck-replacement→retireする。
移管・正式unit成立を初期driverから生成しない。

## 旧HELIXとの対応

意味を再導出する。旧local-first gateとmerge単位CI、exact targetへ証拠を束縛する順序、fallback拒否を保持する。
旧source・保持点・変更点・理由は[local CI L4](../../helix-os/L4-basic-design/local-ci.md)の旧source対応と
[L5 §7](../../helix-os/L5-detail-design/local-ci-detail-design.md)を起点とし、Bindingの7旧資産pinへ戻る。
旧workflow/toolchain/commandをcopyせず、CPython standard libraryと固定read-only sandboxへ再導出する。
旧archiveはpin照合の読み取りデータであり、旧workflow/runtime/test/CLI/hook/adapterは実行しない。Bunは使わない。

## 停止・authority境界

対象入力のmissing/unknown/conflict/staleは設計どおりnon-positiveに保持し、placeholderやhost fallbackで埋めない。
CIから要求・承認・受入・完了・merge許可を生成しない。release、v0.1宣言、deployment、tag、cutover、配布repo切替、
visibility・LICENSE・branch protection変更、Issue close、L8〜L10の実行・合格は対象外である。

## GitHub projection

本文を含むsource commitとfile SHA-256を先に固定し、そのexact本文をIssueへ投影する。
Issue番号・source commit・digest・remote read-afterはappend-only projection receiptへ記録する。
本文へ自身のcommit SHAを埋め込まず、Issue状態から作業許可・要求意味を逆生成しない。
