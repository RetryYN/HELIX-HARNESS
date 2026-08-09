---
title: "orchestration event projection と checkpoint replay 機能設計"
canonical_layer_scheme: L1-L12
layer: L6
paired_layer: L6
status: draft
plan: docs/plans/PLAN-L7-528-event-projection-checkpoint-replay.md
pair_artifact: docs/test-design/helix/L6-event-projection-checkpoint-replay-unit-test-design.md
related_l5: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay 機能設計

## 1. 実装単位

`src/runtime/event-projection-checkpoint-replay.ts` の 1 module に、L5 §2 の判定関数 8 種を
pure function として実装する。DB write、network、ファイル I/O、時刻取得を持たない。判定に必要な
時刻（`observedAt`）と現行 HEAD（`currentHeadSha`）は呼び出し側が入力として渡す。

| export | L5 対応 | 返り値 |
|---|---|---|
| `admitEventEnvelope` | §2.1 | `{ ok: true; envelope }` / `EventFailure` |
| `evaluateCausalOrder` | §2.2 | `{ ok: true }` / `EventFailure` |
| `evaluateIdempotentIngest` | §2.3 | `{ ok: true; outcome }` / `EventFailure` |
| `evaluateLifecycleTransition` | §2.4 | `{ ok: true }` / `EventFailure` |
| `evaluateProjectionDrift` | §2.5 | `{ ok: true }` / `EventFailure` |
| `selectCheckpointScope` | §2.6 | `{ ok: true; eventIds }` / `EventFailure` |
| `evaluateCheckpointReplay` | §2.7 | `{ ok: true }` / `EventFailure` |
| `routeRecovery` | §2.8 | `{ ok: true; route }` / `EventFailure` |

`EventFailureCode` union は 18 種である。L5 §5 の表は 19 行だが、`EVENT_RECOVERY_REQUIRED` は
`routeRecovery` の `route: "recovery"` として表現する識別子であり union member にしない。
これにより呼び出し側は「retry も recovery も不要」と読み替えて完了へ進めない。

## 2. digest の責務分割

正規化と sha256 算出は `src/runtime/digest.ts` の `canonicalJson` / `sha256Digest` をそのまま使い、
第二の canonicalization 規則・第二の算出系を定義しない。`createL3G3LogicalDbReceipt` は同じ
プリミティブを使う既存 authority だが、doctor 専用の重量関数であり本 module からは呼び出さない。

lane / event 境界の scope 選択は `selectCheckpointScope` が担う。scope 未指定時に全体スコープへ
暗黙フォールバックする経路を持たず、`EVENT_CHECKPOINT_SCOPE_MISSING` で fail-close する。

## 3. 到達不能分岐の削除

初回 mutation で `deep-freeze-shallowed`（再帰凍結を浅い凍結へ弱化する mutant）が生存した。
調査の結果、本 module が返す値は envelope（全 field が scalar の平坦な object）と `eventIds`
（string の配列）だけであり、**ネストした object を返す経路が存在しない**ため、`deepFreeze` の
再帰は到達不能な分岐だった。

mutant を削除して数字を合わせるのではなく、到達不能な再帰そのものを削除し、`frozenClone` を
`Object.freeze(structuredClone(value))` に置き換えた。`structuredClone` を外す mutant
（`frozen-clone-shares-input`）は U-EPR-084 が killed にするため、入力非破壊の保証は維持される。

## 4. 不変性

`frozenClone` は複製してから凍結する。複製せずに凍結すると、spread が浅いためネスト参照が
入力と共有され、呼び出し側が保持する入力オブジェクトまで凍結してしまい pure judgement の前提を
破る。U-EPR-084 が「入力が凍結されていないこと」と「返り値が入力と同一参照でないこと」の両方を
押さえる。

## 4.1 判定順序の是正（独立レビュー指摘）

独立レビューが、実装した判定順序と L5 の記述が食い違う 2 箇所を実行で実証した。両方とも
`routeRecovery` では同じ `route: "recovery"` に丸められるため復旧経路は変わらないが、記録に残る
failure code が入れ替わり、原因を取り違える。

1. `evaluateProjectionDrift` は lane 不一致を先に判定していた。L5 §2.5 は見出し自体が
   「判定順序」であり identity → state → lane と番号を振っている。identity drift と lane 不一致が
   同時成立すると `EVENT_ORPHAN_LANE` が返り、実在する identity drift が記録から消えていた。
   **実装を L5 の番号順へ是正した**（identity → state → lane）。U-EPR-101 と mutant
   `drift-order-lane-first` が固定する。
2. `evaluateLifecycleTransition` は seal 判定を machine 判定より先に置いている。L5 §2.4 は
   見出しが「state machine」であり、続く 1..3 は拒否規則の列挙で判定順序を凍結していない
   （§2.5 と対照的）。ここで machine を先に置くと、`accepted` の `ALLOWED_TRANSITIONS` が
   空配列であるため seal 済み correlation への追加遷移が必ず `EVENT_TRANSITION_ILLEGAL` に
   吸収され、`EVENT_TRANSITION_AFTER_SEAL` が自身の前提条件（accepted 済み）の下で
   **到達不能になる**。したがって **seal 先着を維持した**。
   U-EPR-102 と mutant `transition-order-machine-first` が固定する。
   ただし §2.4 本文の 1..3 は他節と同じ番号付き箇条書きであり、見出しの違いだけを根拠に
   「順序ではない」と L6 側で解釈確定させるのは弱い。再レビューの指摘に従い、**L5 §2.4 へ
   errata として evaluation order（seal → 起点 → machine）と到達不能の根拠を追記**し、
   PLAN-L7-528 を carrier として明示した。PLAN の `contract_preconditions` も、§2.4 が
   番号順凍結の対象外であることを含めて書き直した（L6 の解釈だけが先行する状態を解消する）。

## 5. mutation 実測

`tests/tools/event-projection-mutation/run-mutation.ts` が source mutant 60 体を実生成し、
`tests/event-projection-checkpoint-replay.test.ts` が全件を killed にすることを検証する。

現行実測値は `total=60 killed=60 survived=0 pattern_missing=0`（exit 0）。

ラウンド履歴:

1. 初回（55 mutant）: `total=55 killed=49 survived=4 pattern_missing=2`。
2. 生存 4 件のうち `deep-freeze-shallowed` は §3 のとおり到達不能分岐として削除。
   残る 3 件（`transition-correlation-filter-removed` / `scope-exact-set-check-removed` /
   `replay-boundary-last-endpoint-ignored`）は oracle 不足であり U-EPR-098..100 を追加して解消。
3. `pattern_missing` 2 件は `from` パターンが実ソースと乖離していたための検出漏れであり、
   現行ソースに合わせて修正した（mutant を削らずパターンを実在させる）。
4. 58 体へ拡張した時点で生存 0・パターン欠落 0 に到達した。
5. biome format でソースの改行位置が変わり `from` 2 件が pattern_missing へ再発。runner に
   `MISSING <name>` 出力を追加して特定し、整形後ソースへ再同期した。
6. 独立レビュー指摘（§4.1）を受けて順序 mutant 2 体を追加。最終（60 mutant）:
   `total=60 killed=60 survived=0 pattern_missing=0`。

## 6. 責務境界

- lease は #213 の `acquireWorkGraphLease` / `releaseWorkGraphLease` が唯一の authority。本 module は
  lease を取得も解放もしない。
- terminal 判定は #213 の `verifyWorkerLifecycleReceipt` が唯一の authority。`event_type: terminated` は
  検証済みの事実を記録する event であり、本 module で terminal 条件を再判定しない。
- slot 会計は #214 の `admitSlotAccountingRow` が唯一の検証者。本 module は accounting row を
  event source として受け取るだけで 9 field を再検証しない。
- 上記 3 資産は**型として関数引数に受け取らない**。`lane_id` / `head_sha` / `plan_id` の field 値
  一致でのみ参照する。

## 7. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "event-envelope-admission",
      "classification": "new_runtime",
      "artifact_path": "src/runtime/event-projection-checkpoint-replay.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitEventEnvelope",
      "source_digest": "sha256:f0651ba7848cb7183529eade85b241f6b04ef0ae55943645bec54f399396b40f",
      "current_authority": true
    },
    {
      "asset_id": "checkpoint-scope-selector",
      "classification": "new_runtime",
      "artifact_path": "src/runtime/event-projection-checkpoint-replay.ts",
      "resource_kind": "typescript_export",
      "resource_name": "selectCheckpointScope",
      "source_digest": "sha256:f0651ba7848cb7183529eade85b241f6b04ef0ae55943645bec54f399396b40f",
      "current_authority": true
    },
    {
      "asset_id": "checkpoint-replay-verifier",
      "classification": "new_runtime",
      "artifact_path": "src/runtime/event-projection-checkpoint-replay.ts",
      "resource_kind": "typescript_export",
      "resource_name": "evaluateCheckpointReplay",
      "source_digest": "sha256:f0651ba7848cb7183529eade85b241f6b04ef0ae55943645bec54f399396b40f",
      "current_authority": true
    },
    {
      "asset_id": "recovery-router",
      "classification": "new_runtime",
      "artifact_path": "src/runtime/event-projection-checkpoint-replay.ts",
      "resource_kind": "typescript_export",
      "resource_name": "routeRecovery",
      "source_digest": "sha256:f0651ba7848cb7183529eade85b241f6b04ef0ae55943645bec54f399396b40f",
      "current_authority": true
    },
    {
      "asset_id": "canonical-json",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/digest.ts",
      "resource_kind": "typescript_export",
      "resource_name": "canonicalJson",
      "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000",
      "current_authority": true
    },
    {
      "asset_id": "sha256-digest",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/digest.ts",
      "resource_kind": "typescript_export",
      "resource_name": "sha256Digest",
      "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

新規実装 4 export と再利用する digest プリミティブ 2 export の実在を宣言する。残る 4 export
（`evaluateCausalOrder` / `evaluateIdempotentIngest` / `evaluateLifecycleTransition` /
`evaluateProjectionDrift`）も同一 module 内に実在し、同じ `source_digest` を共有する。
