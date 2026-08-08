---
title: "8-slot scheduler と quota handover L9 system test設計"
canonical_layer_scheme: L1-L12
layer: L9
paired_layer: L4
status: draft
plan: docs/plans/PLAN-L4-71-slot-scheduler-quota-handover.md
pair_artifact: docs/design/helix/L4-basic-design/slot-scheduler-quota-handover.md
behavior_contract_id: SLOT-SCHEDULER-QUOTA-HANDOVER-001
responsibility_owner: slot-scheduler-quota-handover
---

# 8-slot scheduler と quota handover L9 system test設計

## 1. system-level oracle 一覧

| oracle_id | 経路／操作 | 合格条件 |
|---|---|---|
| U-SSQ-S-001 | capacity 8 の scheduler へ READY task 8 件を投入する | 8 件全てが `running` へ遷移し、slot accounting の exact set 9 field が全 slot で揃う |
| U-SSQ-S-002 | 稼働 slot 8 件の状態で 9 件目の dispatch を試行する | capacity 超過として dispatch せず、9 件目は queue に留まる（8 超過の拒否） |
| U-SSQ-S-003 | slot accounting の各 field（`slot_id` / `parent_id` / `task_id` / `dependency_ids` / `slot_state` / `quota_snapshot` / `writer_lease` / `started_at` / `terminated_at`）を 1 件ずつ欠落させる | 各欠落で個別に fail-close し、欠落した field を特定できる |
| U-SSQ-S-004 | 欠落 field を unknown 追加 field で埋め合わせた accounting row を投入する | unknown field による欠落相殺を拒否する（exact set 検証） |
| U-SSQ-S-005 | dependency 未充足の task を dispatch する | dependency 前倒しとして fail-close する |
| U-SSQ-S-006 | 同一 Issue を持つ task 2 件を同時に dispatch する | conflict exclusion により 1 件だけが lease を取得する（MIC-AC-005） |
| U-SSQ-S-007 | 同一 behavior contract / responsibility owner を持つ task 2 件を同時に dispatch する | conflict exclusion により 1 件だけが lease を取得する（MIC-AC-005） |
| U-SSQ-S-008 | 共有正本・DB projection・authority owner が競合する task 2 件を同時に dispatch する | conflict exclusion により 1 件だけが lease を取得する（MIC-AC-005） |
| U-SSQ-S-009 | changed path が重なる task 2 件を同時に dispatch する | 競合 path の同時割当を拒否する（MIC-AC-005） |
| U-SSQ-S-010 | conflict-free な task 8 件を同時に dispatch する | 8 件が互いに異なる fence token owner の lease を exactly once 取得する（MIC-AC-005 の positive 側） |
| U-SSQ-S-011 | queue 上限を超える task を投入する | 超過分を drop せず backpressure signal を返し、受理を止める（MIC-AC-008） |
| U-SSQ-S-012 | queue 上限を宣言しない scheduler 設定を投入する | unbounded queue として fail-close する |
| U-SSQ-S-013 | backpressure 応答を成功（受理）として扱う経路を試行する | backpressure を受理成功と読み替えない（成功扱いの拒否） |
| U-SSQ-S-014 | 同一 task へ 2 件の writer lease を並行取得する | fence token CAS により後着が stale として拒否され、owner は 1 件のみ（lease 二重所有の拒否） |
| U-SSQ-S-015 | quota snapshot が threshold へ到達する前に handover を実行する | handover packet（lane_id / task_id / candidate_head / fence token / 残作業境界）が発行され、後継 slot が同一 lease 系譜を CAS で引き継ぐ |
| U-SSQ-S-016 | quota threshold 到達後に handover を試行する | 事後 handover として fail-close する（quota 枯渇の拒否） |
| U-SSQ-S-017 | handover packet を欠落させたまま slot を交代させる | handover 喪失として fail-close する |
| U-SSQ-S-018 | handover 中に旧 owner の lease を解放せず後継 slot が CAS 取得する | 両者同時 owner の状態を作らず fail-close する |
| U-SSQ-S-019 | handover 通知の lane / target reviewer / HEAD をそれぞれ変異させて配送する | 指定 lane の指定 reviewer だけが 1 回 ack し、別 lane 取得・重複配送を拒否する（MIC-AC-006） |
| U-SSQ-S-020 | ack 済み handover 通知を再配送する | ack 後の再配送を fail-close する（MIC-AC-006） |
| U-SSQ-S-021 | 2 lane 同時稼働で片 lane を failure させる | failure lane だけが `failed` へ遷移して lease を解放し、独立 lane は実行を継続して lane-ready まで収束する（MIC-AC-007） |
| U-SSQ-S-022 | 8 lane 稼働のうち 1 lane を failure させる | 残り 7 lane の slot state と queue 位置が保存される（failure isolation の 8-lane 側） |
| U-SSQ-S-023 | failure した slot の lease を解放せずに slot だけを除去する | lease 未解放の slot 除去を fail-close する |
| U-SSQ-S-024 | capacity を 2 から 8 へ変更し、同一 task packet／lease／receipt 契約で実行する | cell 数に応じた別契約を作らず、同一契約のまま capacity だけが変わる（MIC-AC-008） |
| U-SSQ-S-025 | 4-lane fixture の結果を 8-slot capacity 合格根拠として提出する | 8-lane fixture 以外を capacity evidence として受理しない（`SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED`、4-slot 結果による 8-slot claim の拒否） |
| U-SSQ-S-026 | lane 数を記録しない capacity evidence を提出する | lane 数不明の evidence を受理しない（`SCHEDULER_CAPACITY_EVIDENCE_UNDERSIZED`） |
| U-SSQ-S-027 | lane A の merge 後に lane B の base HEAD を再評価せず merge 候補へ戻す | merge 前 HEAD の receipt 流用を拒否する（MIC-AC-009 / MIC-R-02・MIC-R-06） |
| U-SSQ-S-028 | lane A の merge 後に lane B の base drift・CI・review・DB receipt を再判定する | 再判定を完了した lane B だけが merge 候補へ復帰する（MIC-AC-009 の positive 側） |
| U-SSQ-S-029 | `terminated_at` が `started_at` より前の accounting row を投入する | 時刻逆行として fail-close する |
| U-SSQ-S-030 | 同一 task 集合・同一 capacity で scheduling を 2 回実行する | dispatch 順序、lease owner、queue 内容が両回で一致する（determinism 検証） |
| U-SSQ-S-031 | dispatcher が lane B を merge 候補へ復帰させる際に merge 順序まで確定しようとする | 順序確定と親 acceptance 発行は #213 の Parent acceptance evaluator の authority であり、dispatcher による確定を拒否する（MIC-R-02） |

## 2. capacity evidence・conflict exclusion・handover の試験条件

- **capacity evidence**: U-SSQ-S-025 / U-SSQ-S-026 は、capacity claim に添える fixture の lane 数を
  機械的に読み取り、8 未満または未記録の場合に 8-slot 合格判定へ到達しないことを確認する。
  4-slot hosted PoC は partial evidence として保持してよいが、oracle 上は 8-slot claim の根拠に
  ならないことを明示的に検証する。
- **conflict exclusion**: U-SSQ-S-006..S-009 は、Issue・behavior contract／responsibility owner・
  共有正本／DB projection／authority owner・changed path の 4 軸を**それぞれ単独で**競合させ、
  1 軸ずつ独立に fail-close することを確認する（4 軸同時に崩す単一 mutation は false negative を
  隠すため使わない）。U-SSQ-S-010 は 4 軸すべてが競合しない場合に 8 件が同時に lease を取得する
  positive 側を押さえる。
- **lease 二重所有**: U-SSQ-S-014 / U-SSQ-S-018 / U-SSQ-S-023 は、#213 の
  `acquireWorkGraphLease` / `releaseWorkGraphLease` の fence token CAS をそのまま経由し、
  scheduler 側に第二の lease 判定が生えていないこと（同一 CAS 経路で拒否されること）を確認する。
- **handover**: U-SSQ-S-015..S-020 は、quota snapshot と threshold の比較が handover packet 発行の
  事前条件であること、packet の 5 要素が欠落しないこと、ack が 1 回だけ成立することを、
  threshold 前／後、packet 欠落、lease 未解放、lane・reviewer・HEAD 変異、ack 後再配送の各条件で
  分離して確認する。U-SSQ-S-019 の lane・target reviewer・HEAD は conflict exclusion と同水準で
  **1 軸ずつ独立に** mutate し、3 軸同時 mutation の単一 test case へまとめない（false negative 抑止）。
- **merge authority 境界**: U-SSQ-S-027 / U-SSQ-S-028 / U-SSQ-S-031 は、scheduler 側の frontier
  再計算が「merge 候補への復帰材料の供給」までであり、merge 順序の確定と親 acceptance receipt の
  発行が #213 の Parent acceptance evaluator に残ることを確認する（MIC-R-02 の権限非移譲）。
- **failure isolation**: U-SSQ-S-021 / U-SSQ-S-022 は、failure lane と独立 lane の state を
  failure 前後で diff し、独立 lane の `slot_state`・`writer_lease`・queue 位置が不変であることを
  確認する（巻き込み終了と queue 全体巻き戻しの否定）。

同一 candidate HEAD の targeted test、typecheck、Biome、PLAN governance、doctor、full CI、
Windows durability、DB convergence、独立 AI-B receipt が揃うまで confirmed／merge しない。
