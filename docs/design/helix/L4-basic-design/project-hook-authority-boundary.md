---
title: "project hook authority system境界 基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
plan: docs/plans/PLAN-L4-76-project-hook-authority-boundary.md
parent_design: docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md
pair_artifact: docs/test-design/helix/L9-project-hook-authority-boundary-system-test-design.md
---

# project hook authority system境界 基本設計

## 1. authorityと非対象

本境界の意味authorityは`CNW-R-06..08`／`CNW-AC-009..013`であり、primary treeのcwd、環境変数、文字列path、
既存hook process、provider名を正本にしない。`.codex/hooks.json`はCodex native dispatch identityの入力、
`.claude/settings.json`はcross-runtime lifecycle conformance入力であり、同じidentity enumへ混在させない。

本sliceはruntimeを実装せず、Full HELIXの#895配下だけを扱う。Notification Fabric、resident lane、provider CLI、
8-slot scheduler、配布pack、foreign treeの更新／reset／checkoutは非対象である。

## 2. component境界

| component | 責務 | 禁止事項 |
|---|---|---|
| `PhysicalRepositoryIdentityCapture` | execution rootとloader rootをrealpath、repository common identity、filesystem identityへ解決 | lexical path一致だけでsame判定しない |
| `ProjectHookAuthorityResolver` | root、HEAD、hooks／guard／policy digestのversioned identityを構成・比較 | cwdやprimary rootを暗黙defaultにしない |
| `AssignmentRootAuthoritySelector` | active assignment rootを択一しcandidate base/current authorityへ束縛 | primary shared treeへfallbackしない。別lane／別HEADも候補にしない |
| `ProjectHookSurfaceProjector` | SessionStart、doctor、status、dispatchへ同一receiptを投影 | surface別の再計算・推測・旧identity再出力をしない |
| `BoundedHookLifecycleSupervisor` | deadline、子／親process terminal、terminal result保全を管理 | 60秒超過、期限なし、親process残留を許さない |
| `NotificationWakeWorkerPort` | 長期通知待機を同期hook外のlease付きworkerへ渡す | 同期Stop／SessionStartを通知待機で保持しない |

## 3. 正規入力と出力port

authority resolver入力は`execution_root`、`loader_root`、`assignment_root`、`candidate_base_head`、
`current_authority_head`、`.codex/hooks.json` bytes、agent-guard source bytes、worker policy bytes、physical stat evidenceである。
assignmentが存在する場合`assignment_root`は必須であり、存在しない場合は明示されたsession project rootだけを評価する。

成功出力は後続L5で定義する単一`project_hook_authority_receipt`で、schema version、physical repository identity、
authority root、repository HEAD、hooks digest、guard digest、policy digest、assignment binding、captured-at sourceを持つ。
SessionStart／doctor／status／dispatchはこのreceiptまたは同じfailureを受け取り、独自field追加や欠落相殺をしない。

## 4. physical identityとassignment state

physical同一性はcanonical realpathだけでなくrepository common identityとfilesystem identityを比較する。symlink、junction、
mount、別worktreeが同じ表示pathへ見える場合でも、common identity／device／inode相当の証拠が一致しなければ
`project_hook_source_stale_or_foreign`とする。platformがfieldを供給できない場合はunknownをsameへ推測せずunsupportedで閉じる。

stateは`unresolved → captured → matched | stale_or_foreign`の一方向である。active assignmentがある場合、
`AssignmentRootAuthoritySelector`が選んだrootだけをcaptureする。primary rootを比較候補へ自動追加せず、foreign dirty treeへ
write、reset、checkout、dependency installを行わない。HEADまたは三digestの一件でもcandidate/current authorityと違えばmatchedにしない。

## 5. lifecycleと結果保全

同期hookはpolicyからdeadlineを受け、既定15秒、hard ceiling 60秒を超える設定をadmission前に拒否する。
timeout時は子processを停止し、親processのterminal化を確認してから`project_hook_lifecycle_timeout`を返す。failureはexecution root、
loader root、hook kind、deadline、source identityを欠落なく保持する。親processが残る、期限が無い、停止確認が無い場合を
成功やwarningへ降格しない。

review／receipt本体が先にterminal resultを生成済みなら、後続hook failureはresult、session ID、candidate HEAD、verdict、
comment URL等の既存terminal payloadを変更しない。通知待機は`NotificationWakeWorkerPort`へhandoffし、worker ID、lease、TTL、
payload digestを受け取った時だけ非同期化する。worker不在をraw bypassや同期無期限hangで相殺しない。

## 6. failureとside effect境界

failure順はphysical identity、assignment authority、HEAD、hooks digest、guard digest、policy digest、deadline、process terminal、
result preservationとする。複数違反でもstable順を維持する。stale／foreign failureではhook実行、worker dispatch、Git／DB／GitHub writeを0、
lifecycle timeoutでは新規dispatchを0とする。status／doctorはread-only surfaceであり、自動修復commandを実行しない。

## 7. acceptance配置

| acceptance | system owner | L9観測 |
|---|---|---|
| `CNW-AC-009` | resolver＋surface projector | 4 surfaceのreceipt exact equality |
| `CNW-AC-010` | physical capture | symlink／別worktree loaderの拒否 |
| `CNW-AC-011` | assignment selector | stale primaryが存在してもassignment択一 |
| `CNW-AC-012` | resolver＋doctor | root／HEAD／digest mutationのtyped fail-close、write 0 |
| `CNW-AC-013` | lifecycle supervisor＋wake worker port | 15／60秒、親terminal、payload保持、通知分離 |

## 8. 後続境界

L5↔L8はidentity／receipt／failure／deadline／terminal payload schemaをexact化する。L6↔L7はpure resolver、physical adapter、
process supervisor、surface wiringをRed→Greenで実装する。Assignment kernelがrootを供給するまでassignment付きnative dispatchを
primary treeへfallbackして有効化しない。最後にclean current-main rootでLuna／xhigh spawnをread-afterする。

## 9. 設計実在性束縛

runtime assetは後続L6/L7で追加する。未実装componentやfailure codeを実在扱いしない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
