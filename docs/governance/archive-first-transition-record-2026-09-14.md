# 旧世代archive-first隔離記録

status: isolated_not_migrated
executed_at: 2026-09-14

## 目的

旧authority、旧AI instruction、旧CI、旧runtimeを現行pathに残したまま新世代を降ろす循環を断つ。
旧資産を削除せず非実行archiveへ先に隔離し、GitHub PRを旧CIの実行入口ではなく、新世代上流候補の共有・review surfaceとして使えるrepository形状にする。

## 隔離結果

| 区分 | archive件数 | 現行pathの状態 |
|---|---:|---|
| 旧root文書・package設定 | 11 | 新世代`README.md`、`AGENTS.md`、`CLAUDE.md`へ置換。package commandなし |
| `.claude` | 34 | 現行pathなし。旧role、command、hook、settingsは非実行 |
| `.codex` | 2 | 現行pathなし。旧adapterは非実行 |
| `.cursor` | 3 | 現行pathなし |
| `.github` | 12 | workflow YAML、Issue／PR template、scriptを隔離。現行workflow directoryは説明文だけ |
| `.helix` | 158 | 追跡済み旧state／evidenceを隔離。Git非追跡local stateはrepo archiveへ含めない |
| `config` | 41 | 旧registry／policy／catalogを隔離 |
| `requirements-ir` | 6 | 旧JSON authorityを隔離し、active crosswalkからarchive sourceとして参照 |
| `scripts` | 3 | 旧scriptを隔離 |
| `src` | 550 | 旧runtime sourceを隔離 |
| `tests` | 597 | 旧test／fixtureを隔離し、新世代oracleとして実行しない |
| `docs` | 2603 | 旧要求・設計・PLAN・test design・archiveを構造保持で隔離 |
| **合計** | **4020** | [manifest](../../archive/legacy-generation-2026-09-14/MANIFEST.sha256)で固定 |

active `docs/`には、隔離直後、本再整理で追加したConcept v4.1、対象別L1／L2／L11、上流方針、inventory、crosswalk、
判断packetの68文書だけを残した。本記録、現行文書構成README、Concept入口、GitHub PR packetを追加したため現在は72文書である。旧文書をbranch上で
変更していた場合も、追加文書でなければarchive sourceへ移した。

active文書は`concept/`、`helix-harness/`、`helix-os/`、`helix-web/`、`helix-web-os/`、`governance/`へ
物理分離した。L1／L2／L11は対象directory内に置き、要求ownerをpathから判別できる。archive側は旧相対構造の
snapshotであり、この対象別構成へ並べ替えない。

## 現在のGitHub利用

- `.github/workflows/`に実行可能なYAMLはないため、このrevisionから旧repository workflowを起動しない。
- PRは新世代上流候補の差分共有と、明示許可されたGitHub review通路に使用できる。
- repository設定に残るrequired check、branch protection、App、外部scheduleはGit内workflowとは別の外部projectionであり、本隔離だけで変更済みと扱わない。
- required checkが旧`harness-check`を要求する間はmerge条件が成立しない。checkを迂回せず、新世代CI設計または外部設定の再構築までDraft／review surfaceとして使う。

commit `064280b5c`のremote sync後にGitHubをread-afterした結果、対象branchの新runは0、open PRは0だった。
PO許可後、旧`harness-check`のrequired status checkを解除し、旧repository workflow 4件をGitHub Actions側でも
`disabled_manually`へ変更した。再確認ではrequired status checksはなく、`enforce_admins=true`、force-push禁止、
branch削除禁止を維持している。

GitHub管理の動的workflowとしてCodeQL default setupとDependabot Updatesはactiveのままである。これらは旧HARNESSの
要求・設計・完了gateではないが、PR時に自動実行され得る外部security／dependency projectionである。本記録では
disableしておらず、新世代上流の意味review、承認、merge条件として使わない。

## 未成立事項

- archive資産4020件のsemantic atom採否、対象別L2への意味移管、replacement完成。
- Concept v4.1、対象別L1、L2／L11の人間承認。
- L3以降、新世代AI manifest／生成器、新世代CI、runtimeの設計・実装。
- CodeQL、Dependabot、GitHub App、その他外部scheduleの切替。
- archive内資産の物理削除。

本隔離は旧世代を実行不能なrepository位置へ移した証拠であり、新世代の完成、旧意味の棄却、consumer切替完了を示さない。
