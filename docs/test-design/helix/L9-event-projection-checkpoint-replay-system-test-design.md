---
title: "orchestration event projection と checkpoint replay L9 system test設計"
canonical_layer_scheme: L1-L12
layer: L9
paired_layer: L4
status: draft
plan: docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md
pair_artifact: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md
behavior_contract_id: EVENT-PROJECTION-CHECKPOINT-REPLAY-001
responsibility_owner: event-projection-checkpoint-replay
---

# orchestration event projection と checkpoint replay L9 system test設計

## 1. system-level oracle 一覧

| oracle_id | 経路／操作 | 合格条件 |
|---|---|---|
| U-EPR-S-001 | 11 field を揃えた orchestration event を append-only 列へ投入する | `admitted` → `ordered` → `deduped` → `appended` を経て列長が 1 増える |
| U-EPR-S-002 | envelope の各 field（`event_id` / `event_type` / `occurred_at` / `plan_id` / `parent_lane_id` / `lane_id` / `causation_id` / `correlation_id` / `head_sha` / `payload_digest` / `schema_version`）を 1 件ずつ欠落させる | 各欠落で個別に fail-close し、欠落した field を特定できる |
| U-EPR-S-003 | 欠落 field を unknown 追加 field で埋め合わせた event を投入する | unknown field による欠落相殺を拒否する（exact set 検証） |
| U-EPR-S-004 | payload だけを持ち envelope を欠く event を投入する | event 片肺として fail-close する |
| U-EPR-S-005 | envelope だけを持ち `payload_digest` が空の event を投入する | 片肺の逆向き（payload 欠落）も fail-close する |
| U-EPR-S-006 | 既に `appended` 済みの event の payload を書き換えて再投入する | append-only 違反として fail-close し、既存 event を書き換えない |
| U-EPR-S-007 | 同一 `event_id` かつ同一 `payload_digest` の event を 2 回投入する | 2 回目は `duplicate_absorbed` となり、列長も side effect も増えない（exactly-once 相当） |
| U-EPR-S-008 | 同一 `event_id` かつ異なる `payload_digest` の event を投入する | 暗黙上書きを拒否して fail-close する |
| U-EPR-S-009 | 同一 event を 3 回投入したのち projection を再構築する | projection が 1 回投入時と完全一致する（duplicate side effect の否定） |
| U-EPR-S-010 | 結果 event の `occurred_at` が原因 event より前になる列を投入する | causal inversion として fail-close する |
| U-EPR-S-011 | `causation_id` が存在しない event を指す event を投入する | 未解決 causation として fail-close する |
| U-EPR-S-012 | 別 `correlation_id` に属する event を `causation_id` で参照する | correlation を跨ぐ causation 解決を拒否する |
| U-EPR-S-013 | `occurred_at` が現在時刻より未来の event を投入する | 未来 event の先書きを拒否する |
| U-EPR-S-014 | 前段 event の無い terminal event を投入する | illegal transition として fail-close する |
| U-EPR-S-015 | state を 1 段飛ばす event 列（`admitted` → `checkpointed`）を投入する | 飛ばし遷移を拒否する |
| U-EPR-S-016 | terminal event の後に追加の遷移 event を投入する | terminal 後遷移を拒否する |
| U-EPR-S-017 | 正しい event 列から projection を再構築し read-back snapshot と照合する | identity と state が一致し `projected` へ遷移する（MIC-AC-010 の positive 側） |
| U-EPR-S-018 | read-back snapshot の identity（lane_id / plan_id）だけを変異させる | projection drift として fail-close する |
| U-EPR-S-019 | read-back snapshot の state だけを変異させる | identity 一致でも state 不一致を drift として fail-close する |
| U-EPR-S-020 | Project 側の列移動・field 編集だけを行い event を追記しない | 手動編集を完了根拠にせず、projection drift として扱う（MIC-AC-010） |
| U-EPR-S-021 | Issue close と green 表示だけを根拠に完了を主張する | GitHub 表示からの逆流を拒否し、完了へ進めない（MIC-R-07） |
| U-EPR-S-022 | どの lane にも属さない `lane_id` を持つ event を投入する | orphan lane として完了経路へ通さず Recovery へ送る |
| U-EPR-S-023 | projection の一部だけが書き込まれた partial write 状態を read-back する | partial write を成功扱いせず drift として fail-close する |
| U-EPR-S-024 | `head_sha` / `parent_lane_id` / event 境界の各 1 件を欠いた checkpoint で replay する | 各欠落で個別に fail-close する（MIC-AC-011） |
| U-EPR-S-025 | 同一 event 列を 2 回 replay して projection digest を比較する | 両回の digest が一致する（idempotent replay の positive 側） |
| U-EPR-S-026 | replay 結果の digest が checkpoint 記録と異なる状態を投入する | non-idempotent replay として fail-close する |
| U-EPR-S-027 | replay 結果の digest を照合せずに `checkpointed` へ進める経路を試行する | 未照合 replay の受理を拒否する |
| U-EPR-S-028 | checkpoint の `head_sha` が現行 HEAD と異なる（stale HEAD）状態で replay する | stale HEAD として完了へ進めず bounded retry または Recovery へ送る（MIC-AC-011） |
| U-EPR-S-029 | unknown field option を含む desired-state packet を投影する | unknown option を成功扱いせず Recovery へ送る（MIC-AC-011） |
| U-EPR-S-030 | rate limit で投影が中断した状態を read-back する | 中断を成功扱いせず bounded retry へ遷移する（MIC-AC-011） |
| U-EPR-S-031 | bounded retry の上限を超えて retry を継続しようとする | 無制限 retry を拒否し Recovery へ遷移する |
| U-EPR-S-032 | `drifted` 状態から直接 `checkpointed` へ遷移させる | drift 未解消のまま checkpoint へ進む経路を拒否する |
| U-EPR-S-033 | 同一 event 集合を異なる投入順序で 2 回 ingest し projection を比較する | causal order に基づく正規化により両回の projection digest が一致する（determinism 検証） |
| U-EPR-S-034 | event 列から checkpoint を生成し、#213 の terminal receipt / #214 の slot accounting row と突合する | 本層が receipt 検証・lease CAS・capacity 会計を再実装せず、既存 authority の出力をそのまま source として参照する |
| U-EPR-S-035 | checkpoint digest の算出経路を検査する | 正規化規則と sha256 算出が `createL3G3LogicalDbReceipt` の canonicalization 契約を経由し、第二の canonicalization 規則・第二の digest 算出系が存在しない |
| U-EPR-S-036 | lane A に無関係な event を追記したうえで lane B の checkpoint を replay する | lane B の checkpoint digest が変化せず drift 判定にならない（scope selector が lane 境界で絞っていることの検証。全体スコープ digest 流用の否定） |
| U-EPR-S-037 | scope selector に `head_sha` / `parent_lane_id` / event 境界を与えずに checkpoint を生成する | scope 未指定の全体スコープ digest を lane checkpoint として受理しない |

## 2. exactly-once・因果順序・replay の試験条件

- **exactly-once 相当**: U-EPR-S-007 / U-EPR-S-009 は、同一 `event_id` の再投入が列長と side effect を
  増やさないことを、投入回数を変えた 2 系統（2 回 / 3 回）で確認する。U-EPR-S-008 は digest 差異が
  ある場合に「吸収」ではなく「拒否」であることを分離して押さえ、dedupe を暗黙上書きの隠れ蓑に
  しないことを保証する。
- **因果順序**: U-EPR-S-010..S-013 は、時刻逆行・未解決 causation・correlation 跨ぎ・未来先書きの
  4 条件を**それぞれ単独で**成立させ、1 条件ずつ独立に fail-close することを確認する
  （4 条件同時に崩す単一 mutation は false negative を隠すため使わない）。
- **illegal transition**: U-EPR-S-014..S-016 は state machine の 3 種類の違反（前段欠落・段飛ばし・
  terminal 後遷移）を分離する。`appended` を経由しない `projected`、`projected` を経由しない
  `checkpointed` も同じ枠で拒否されることを U-EPR-S-015 が代表して押さえる。
- **projection drift**: U-EPR-S-017..S-023 は、identity だけの変異と state だけの変異を分離し、
  片方一致でもう片方不一致の場合に drift となることを確認する。U-EPR-S-020 / U-EPR-S-021 は
  GitHub 側の手動操作・表示を完了根拠にしない MIC-R-07 の境界を、event 追記の有無で判定する。
- **checkpoint replay**: U-EPR-S-024..S-028 は、束縛欠落（3 種を 1 件ずつ）と digest 不一致と
  未照合通過と stale HEAD を分離する。
- **digest の責務分割**: 正規化規則と sha256 算出は `createL3G3LogicalDbReceipt` の既存
  canonicalization 契約を再利用し、lane / event 境界の scope 選択だけが本層の新規責務である。
  この分割は 3 本の oracle で機械的に押さえる。U-EPR-S-035 は算出経路が既存契約を経由し
  第二の算出系が無いことを確認する。U-EPR-S-036 は無関係 lane の追記で他 lane の checkpoint
  digest が動かないこと（scope が lane 境界で効いていること）を確認する。U-EPR-S-037 は
  scope 未指定の全体スコープ digest を lane checkpoint として受理しないことを確認する。
  U-EPR-S-036 は、既存 export の絞り込みが `includeTable` によるテーブル単位に留まり
  リポジトリ全体スコープであるという実装事実に対する回帰であり、全体スコープ digest を
  そのまま lane checkpoint へ流用した場合に必ず Red になる。
  U-EPR-S-037 と U-EPR-S-024 は失敗経路が異なるので混同しない。U-EPR-S-024 は
  **checkpoint record 内の個別 binding**（`head_sha` / `parent_lane_id` / event 境界）の欠落を
  1 件ずつ拒否する。U-EPR-S-037 は **scope 入力が与えられていない**ときに全体スコープ digest へ
  暗黙フォールバックすることを拒否する。前者は record の不備、後者は入力欠如時の既定挙動を押さえる。
- **Recovery 経路**: U-EPR-S-028..S-032 は、stale HEAD・unknown option・rate limit・retry 上限超過・
  drift 未解消の各条件が「完了へ進む」ことなく bounded retry または Recovery へ遷移することを
  確認する。retry 上限は U-EPR-S-031 が bounded であることを機械的に押さえる。
- **責務境界**: U-EPR-S-034 は、本層が #213 の terminal receipt 検証、`acquireWorkGraphLease` の
  lease CAS、#214 の slot accounting 会計を再実装していないことを確認する。既存 authority の
  出力を event source として参照する経路だけが存在し、判定の二重化が無いことを検証する。

同一 candidate HEAD の targeted test、typecheck、Biome、PLAN governance、doctor、full CI、
Windows durability、DB convergence、独立 AI-B receipt が揃うまで confirmed／merge しない。
