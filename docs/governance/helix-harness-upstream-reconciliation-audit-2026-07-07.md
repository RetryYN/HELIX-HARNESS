# HELIX-HARNESS 上流追突 audit (2026-07-07)

本書は PO 指示 `/goal` に基づき、外部参照元 repo `unison-ai-product/UT-TDD_AGENT-HARNESS`
を Git refs から read-only に取得し、HELIX-HARNESS へ取り込むべき仕組みと
HELIX 自身の穴を capability 単位で突合した監査記録である。

既存の `upstream-helix-reconciliation-audit-2026-07-04.md` と
`upstream-helix-reconciliation-completeness-2026-07-04.md` は、同系統の上流追突として
すでに PLAN-L7-312〜352 を起票済みである。本 pass は、指定 repo の現 refs を再取得し、
前回 audit 後も HELIX に残る未反映面を差分として確定する。

## 1. 取得 refs

取得方法:

- `git ls-remote --heads --tags https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git`
- `git clone --mirror https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git`
- mirror path: `/tmp` 配下の read-only 一時 mirror（検査後に破棄可能な source snapshot）

取得 refs:

| ref | commit | 日時 | 判定 |
|---|---:|---|---|
| `refs/heads/main` | `7f83ca811353ed90b3e981178a1b0c9977dd5863` | 2026-06-29 21:37:25 +0900 | 対象。2026-07-04 audit の主対象とほぼ重複 |
| `refs/heads/work/l10-l14-local-close` | `cbc66ea0f9121fe157a946e637cd4c52e84123a9` | 2026-07-03 23:08:24 +0900 | 対象。`main` から 680 files changed / 38,777 insertions / 7,159 deletions |
| `refs/pull/1/head` | `60637235ec3560c28323bd3ec62e3371c82312a0` | 2026-06-24 13:40:11 +0900 | `main` の祖先。差分は退行方向のため採用候補外 |
| `refs/pull/2/head` | `cbc66ea0f9121fe157a946e637cd4c52e84123a9` | 2026-07-03 23:08:24 +0900 | `work/l10-l14-local-close` と同一 |
| `refs/pull/2/merge` | `0a175fa38f198c889a972057bb6749606b5f6996` | 2026-07-03 14:13:16 +0000 | GitHub merge ref。head と main の統合確認用 |

タグは検出されなかった。

## 2. 前回 audit との重複除外

前回の 2026-07-04 pass で、以下はすでに HELIX 側に起票または実装済みとして扱う。
今回の起票に重複させない。

- D-CONTRACT DSL、G9/G10 gate、L14 close audit、context doc-router、runtime telemetry provenance などの既存領域、
  skill scaffold、model override hardening、adapter runtime hardening、route mode projection などの既存領域、
  relation-graph node scope、toolchain pin、workflow/document parity は既存起票済み。
- `PLAN-L7-319-upstream-adoption-small-items` で、team prompt provider routing、Agent/Task matcher、
  provisional lint の一部はすでに closure 済み。
- `PLAN-L7-328-github-preflight-and-audit-hardening` は、HELIX 独自の GitHub merge-readiness /
  PR body / CI status / PR create packet を持つため、対象 repo の `github/ops-guard.ts` を
  そのまま取り込む必要はない。ただし `poc/* main merge 禁止`、`hotfix/* postmortem 必須`、
  commit subject guard、release publication plan は未統合の運用 guard として残る。
- `PLAN-L7-349-cli-split-slice` は CLI 分割の開始済み slice。対象 repo の `src/cli/*` 分割は
  方向性として一致するが、未分割グループが残るため「既起票 carry」として扱う。

## 3. 新たに残る取り込み候補

### 3.1 clean distribution 同期 / package command

対象 repo は `src/setup/distribution.ts` と `src/cli/distribution.ts` に、
`distribution sync-plan`、`sync-stage`、`sync-pack`、`release-plan`、`package` を持つ。

HELIX 側は `buildCleanDistributionPlan` と `distribution plan` はあるが、次が不足している。

- clean artifact の source path と artifact path の分離。
- `docs/skills/*` を Pack 側 root `skills/*` へ写像する規則。
- Pack checkout への非破壊同期 plan と `git add -- <explicit paths>` command evidence。
- staging directory への materialize。
- tarball / sha256 / manifest 生成 surface。
- release publication を dry-run plan に分離し、公開操作を human approval 境界へ残す surface。

起票: `PLAN-L7-357-distribution-sync-pack-commands`

### 3.2 Pack update-check 助言

対象 repo は `src/setup/update-check.ts` に、release tag の 24h cache 付き advisory を持つ。
重要な不変条件は、更新確認を gate にせず fail-open とし、consumer cwd の `origin` を誤って読まない点である。

HELIX 側は version-up / release automation の decision packet は厚いが、導入済み consumer へ
「配布 checkout が古い」ことを軽く知らせる status advisory surface は未実装である。

起票: `PLAN-L7-358-distribution-update-check-advisory`

### 3.3 doctor check registry / timing / setup-smoke 範囲

対象 repo は `src/doctor/check-registry.ts` へ doctor check 定義を抽出し、
`--setup-smoke`、`--scope full|toolchain`、`--timing` を持つ。

HELIX 側は `doctor --profile consumer` を持つが、`src/doctor/index.ts` は大きな monolith のままであり、
次が不足している。

- check id / profile / dependency を registry 化する surface。
- full doctor と toolchain scope の共有 entrypoint。
- fresh consumer setup smoke を full doctor から切り離す lightweight path。
- per-check timing を JSON / text へ出す診断 surface。

起票: `PLAN-L7-359-doctor-check-registry-extraction`

### 3.4 GitHub ops guard parity 整備

対象 repo の `src/github/ops-guard.ts` は小さいが、運用事故を防ぐ guard として以下を持つ。

- `poc/*` から `main` への直接 merge 禁止。
- `hotfix/*` から `main` への PR は postmortem marker 必須。
- merge commit を除く commit subject の Conventional Commits 検査。
- tag / release publication command を dry-run plan として出し、外部公開は approval 境界へ残す。

HELIX 側の `github` command 群は PR 作成・CI・merge readiness に寄っており、この branch-type /
release-publish guard の小さな運用契約は未統合である。

起票: `PLAN-L7-360-github-ops-guard-parity`

## 4. 採用しないもの

- `refs/pull/1/head`: `main` の祖先で、現 main に対する退行差分しか出ないため採用しない。
- README の粗い運用表現や旧 upstream branding: HELIX の product 語彙と docs language 方針に合わない。
- 旧 upstream state path、旧 command 名、旧 Pack repo:
  HELIX では `.helix` / `helix` / `RetryYN/HELIX-HARNESS-OS` を正本とし、名称だけの port はしない。
- `src/doctor/*` / `src/cli/*` の単純なファイル分割: capability ではなく refactor。HELIX は
  `PLAN-L7-349` と `PLAN-L7-355` の境界で段階実施する。

## 5. HELIX 自身の穴

今回の repo 追突で、HELIX の自走 AI エージェント機構に残る穴は次の 4 つである。

1. **配布を plan で止められるが、Pack checkout へ安全に写像する操作 surface が薄い。**
   自走 agent は「どの clean artifact をどこへコピーし、何を stage すべきか」を機械証跡にできない。
2. **配布鮮度を軽く知らせる advisory が無い。**
   version-up は重い decision packet だが、日常の `status` で「更新あり」を知らせる導線が無い。
3. **doctor が大きく、scope/timing/profile の分解が遅い。**
   自走 agent が失敗箇所を狭める時、full doctor の monolith が feedback loop を重くする。
4. **GitHub 運用 guard が PR 作成寄りで、branch-type / release publication の小契約が薄い。**
   自走 agent が GitHub まで進むなら、PR 種別と公開境界を小さな fail-close 契約で持つべきである。

## 6. 起票結果

本 pass で、既存 PLAN と重複しない新規 draft PLAN を 4 件起票した。

| PLAN | 種別 | 目的 |
|---|---|---|
| `PLAN-L7-357-distribution-sync-pack-commands` | impl | clean distribution の sync / stage / package / release-plan surface を HELIX 化する |
| `PLAN-L7-358-distribution-update-check-advisory` | impl | status に fail-open な distribution update advisory を追加する |
| `PLAN-L7-359-doctor-check-registry-extraction` | refactor | doctor check registry / timing / setup-smoke / toolchain scope を段階抽出する |
| `PLAN-L7-360-github-ops-guard-parity` | impl | branch-type と release publication の GitHub ops guard を HELIX の github packet 群へ接続する |

この監査時点で、指定 repo の heads / pull refs から確認できる新規 capability は上記 4 件へ収束した。
2026-07-07 の継続実装で、4 件すべてに対して最小実装 slice と targeted green commands を記録した。
ただし whole-program completion は別問題であり、`docs/governance/helix-objective-evidence-audit.md`
の G-10 が `completionClaimAllowed=false` を維持する限り、本監査だけで HELIX 全体完了は claim しない。

## 7. 実装 follow-up status

| PLAN | 追補 status | green evidence |
|---|---|---|
| `PLAN-L7-357-distribution-sync-pack-commands` | clean artifact source/artifact mapping、sync-plan、sync-stage、sync-pack、package、release-plan を追加 | `bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/cli-surface.test.ts --timeout 300000` |
| `PLAN-L7-358-distribution-update-check-advisory` | `helix status` に fail-open update advisory を追加 | `bun test tests/update-check.test.ts tests/cli-surface.test.ts --timeout 180000` |
| `PLAN-L7-359-doctor-check-registry-extraction` | registry scaffold、toolchain scope、setup-smoke、timing JSON/text surface を追加 | `bun test tests/doctor.test.ts tests/cli-surface.test.ts --timeout 300000` |
| `PLAN-L7-360-github-ops-guard-parity` | branch-type guard、hotfix postmortem guard、release publication dry-run plan を追加 | `bun test tests/github-ops-guard.test.ts tests/cli-surface.test.ts --timeout 180000` |
