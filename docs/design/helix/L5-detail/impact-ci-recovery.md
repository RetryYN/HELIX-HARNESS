---
title: "Impact CI Recovery詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-01
updated: 2026-08-01
owner: SE
plan: docs/plans/PLAN-L5-84-impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L5-impact-ci-recovery-integration-test-design.md
related_l4: docs/design/helix/L4-basic-design/impact-ci-recovery.md
queue_id: L3Q-PC-039
---

# Impact CI Recovery詳細設計

## 1. 責務と実装境界

`impact-ci-recovery`は、current PR snapshotとrepository-owned verification inventoryから、実行対象と
後続回収対象を決定的に分割する。既存のrelation graph、PLAN lint、authority gate、Vitest project、DB rebuild、
doctorを再実装しない。新しいrunner、cache、DB table、workflow jobもこのpairでは追加しない。

L6/L7実装は既存ownerを呼ぶ薄いdomain module `src/runtime/impact-ci.ts`、CLI配線`src/cli.ts`、既存
`.github/workflows/harness-check.yml`のprofile dispatch、対応testだけを候補inventoryとする。componentごとの
file分割は行わず、実測で単一moduleの変更理由が分離できないと判明した場合だけsuccessor Issueへ送る。

## 2. 値オブジェクト

```ts
type CiProfile = "draft_preflight" | "candidate_admission" | "post_merge_full" | "nightly_full";
type RiskClass = "known_low" | "known_high" | "unknown";
type VerificationKind = "guard" | "typecheck" | "unit" | "integration" | "db" | "lint" | "doctor" | "platform";
type ExecutionSurface = "local_internal" | "github_actions";

interface PrSnapshot {
  repository: string;
  prNumber: number;
  baseHead: string;
  candidateHead: string;
  bodyDigest: `sha256:${string}`;
  changedPaths: readonly string[];
  planIds: readonly string[];
}

interface VerificationItem {
  id: string;
  kind: VerificationKind;
  owner: string;
  command: readonly string[];
  pathSelectors: readonly string[];
  relationNodeIds: readonly string[];
  mandatoryProfiles: readonly CiProfile[];
  riskTags: readonly string[];
}

interface ImpactDecision {
  profile: CiProfile;
  baseHead: string;
  candidateHead: string;
  bodyDigest: `sha256:${string}`;
  inventoryDigest: `sha256:${string}`;
  riskClass: RiskClass;
  selectedItemIds: readonly string[];
  deferredItemIds: readonly string[];
  reasonCodes: readonly string[];
  fullAdmissionRequired: boolean;
}
```

全配列はtrim、重複除去、bytewise lexicographic sort後をcanonical値とする。`command`はshell文字列でなく
argv exact配列とし、selectorは実行しない。inventory digestはcanonical JSONのSHA-256とする。

## 3. inventory契約

inventoryは既存実行surfaceをIDへ束縛するread-only catalogである。各itemは一意な`id`、一つの`owner`、
空でない`command`を持つ。globだけで暗黙test discoveryを正本化せず、Vitest file IDとgovernance command IDを
同じ集合で扱う。重複ID、owner欠落、空command、未知profile／kind、同一commandの別ID登録を拒否する。

常時critical集合は次のownerを最低限含む。

- PR scope／branch kind／commit contractの必須検査
- PLAN lintとL1-L12 canonical authority
- typecheckとsource lint（対応source変更時）
- selector自身とinventory整合oracle
- security／permission／secret／supply-chainの必須検査
- DB schema／migration／checkpointの必須検査

inventoryを削減する変更は、同一HEADの旧・新inventory exact setとconsumer移行receiptなしではadmitしない。

typecheckのversion選択はselectorが所有しない。technology stack authorityがadmitしたitemをinventoryへ取り込む。
TypeScript 7 cutover前はcurrent TypeScript 5.9 itemをcorrectness必須、TypeScript 7 native itemを測定trialとして
別IDにし、dual-green receipt前にtrial成功でcurrent itemを置換しない。cutover後はTypeScript 7 itemだけをcurrent
mandatoryにし、TypeScript 5.9／6 compatibility itemを期限・owner・removal trigger付きの回収対象へ送る。

## 4. impact解決アルゴリズム

入力はGitHub APIから同一episodeでread-after-GitHubした`PrSnapshot`とする。event payloadのbody／base SHAを
正本にしない。取得後にHEADまたはbody digestが変わった場合は`stale_snapshot`で停止する。

selectorは次の順で一度だけ評価する。

1. inventoryを検証し、profileのmandatory itemをselectedへ入れる。
2. changed pathをrelation graphへ照合し、直接test、trace consumer、V-pair oracle、owner gateをselectedへ入れる。
3. PLANの`generates`／`requires`／`pair_artifact`からcompanion ownerを追加する。
4. risk tagを評価する。selector、inventory、workflow、security、permission、secret、schema、migration、rollback、
   DB checkpoint、authority root、lockfile、unknown path／relationは`fullAdmissionRequired=true`とする。
5. full admissionならinventory全件をselectedへ移す。それ以外は残り全件をdeferredへ入れる。
6. selected／deferredをcanonical sortし、交差0かつ和集合がinventory exact setであることを再検証する。

known-lowでもchanged test fileは必ずselectedに入れる。docs-onlyという理由だけでPLAN、authority、trace、
design-language oracleを外さない。relation graphが空を返した場合、明示的な`known_no_consumer` receiptが無ければ
unknownとしてfullへ倒す。

L4 `ImpactSet`の`affectedLayers`、`vPairOracleIds`、`traceConsumerIds`はL5で独立配列として複製せず、
relation graphの解決結果から対応する`VerificationItem.id`へ正規化し、`selectedItemIds`と`reasonCodes`へ統合する。

## 5. profile別契約

| profile | selector入力 | terminal条件 | deferred disposition |
|---|---|---|---|
| `draft_preflight` | working diffまたはcurrent draft snapshot | mandatory＋impact-selectedが全件terminal | candidateへ引継ぐ。merge可能証拠にしない |
| `candidate_admission` | exact PR HEAD／body／base | selected全件terminal。high/unknownはfull exact set | merge commitへ束縛してpost-mergeへ渡す |
| `post_merge_full` | merge commit＋candidate receipt | candidate deferred exact setが全件terminal | 空集合でもterminal receiptを発行 |
| `nightly_full` | main HEAD＋full inventory | full exact setが全件terminal | post-merge欠落を補完するが履歴を上書きしない |

cancelled／supersededはterminal success/failureへ数えず、attemptと理由を保持する。rerunは新attemptであり、
最初のterminal linkを置換しない。同じ`itemId + candidateHead + profile`へterminalを二重登録した場合はredにする。

## 6. receipt契約

```ts
interface CiItemResult {
  itemId: string;
  attempt: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  exitCode: number;
  outputDigest: `sha256:${string}`;
}

interface CiProfileReceipt extends ImpactDecision {
  schemaVersion: "helix-impact-ci-receipt.v1";
  eventId: string;
  runId: string;
  executionSurface: ExecutionSurface;
  environmentDigest: `sha256:${string}`;
  cacheClass: "cold" | "warm";
  results: readonly CiItemResult[];
  terminal: boolean;
}
```

`terminal=true`はselected exact setとresult item ID exact setが一致し、各exit codeが0の場合だけ許す。
別HEAD、別inventory digest、別profile、未完resultを混ぜない。post-merge receiptはcandidate receipt digestと
merge commitを参照し、deferred itemをexactly once回収する。

internal CIとGitHub Actionsは同じexecutionを共有せず、`executionSurface`別のreceipt IDとterminal resultを持つ。
一方のgreenで他方の欠落／redを相殺しない。profile、HEAD、inventoryが同じでもsurfaceが異なれば別receiptである。

## 7. 性能計測とRecovery

p50/p95は`profile + executionSurface + environmentDigest + cacheClass`が同じterminal receiptだけで計算する。母集団数、除外数、
期間を記録し、cold/warmを混ぜない。budget超過かつcorrectness greenならmerge判定をredにせず、Issue #93へ
before/after、区間別duration、CPU/RSS、inventory非縮退digest、原因分類、removal triggerを持つRecovery evidenceを追記する。

test除外、timeout延長、threshold緩和、`continue-on-error`、GitHub Actionsへの検査先送り、full回収の先送りを
性能改善に数えない。

## 8. failureとL6 carry

| failure code | 条件 | disposition |
|---|---|---|
| `invalid_inventory` | ID重複、owner／command欠落、unknown enum | block |
| `snapshot_unavailable` | base HEAD、current PR body、current HEADのいずれかを取得・解決不能 | block。event payloadで補完しない |
| `stale_snapshot` | HEAD／body／baseがread後に変化 | 再取得して旧decisionを失効 |
| `unknown_impact` | path／relation／PLAN ownerを解決不能 | full candidate admission |
| `partition_mismatch` | selected/deferredの交差、欠落、余剰 | block |
| `receipt_binding_mismatch` | HEAD／inventory／profile不一致 | block |
| `recovery_missing` | merge後deferredのterminal link欠落 | main redとしてsurface |
| `performance_budget_exceeded` | correctness green、予算超過 | merge green＋Recovery追記 |

このpairは型、純粋selector、receipt validator、unit mutationを確定する。実コード、workflow dispatch、GitHub API取得、
永続化形式、parallel worker数、cache方式は`L3Q-IT-024`でRed→Green→Refactorにより決める。
