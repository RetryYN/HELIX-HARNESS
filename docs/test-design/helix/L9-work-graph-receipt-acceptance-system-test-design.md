---
title: "work graph と三段 receipt 検収 L9 system test設計"
canonical_layer_scheme: L1-L12
layer: L9
paired_layer: L4
status: draft
plan: docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md
pair_artifact: docs/design/helix/L4-basic-design/work-graph-receipt-acceptance.md
behavior_contract_id: WORK-GRAPH-RECEIPT-ACCEPTANCE-001
responsibility_owner: work-graph-receipt-acceptance
---

# work graph と三段 receipt 検収 L9 system test設計

## 1. system-level oracle 一覧

| oracle_id | 経路／操作 | 合格条件 |
|---|---|---|
| U-WGR-S-001 | dependency frontier へ独立 task 2 件・競合 task 1 件を投入し work graph validator を実行 | 独立 2 件だけが READY として抽出され、各々 exactly once 別 lane（別 fence token owner）へ割当。competing task は同時 dispatch されず 0 件（MIC-AC-001） |
| U-WGR-S-002 | dependency edge が未完了のまま delegation-request receipt 発行を試行 | fail-close（dependency 未完了の前倒し admit を拒否） |
| U-WGR-S-003 | work graph（READY 判定）を確定させずに worker terminal receipt を発行 | fail-close（work graph なし着手の拒否） |
| U-WGR-S-004 | delegation-request receipt を確定前の未来時刻／未確定 lease で先書き | fail-close（receipt 先書きの拒否） |
| U-WGR-S-005 | worker terminal receipt を independent review receipt 確定前に先書き | fail-close（`worker-lifecycle-receipt.ts` の `revalidated` event が review receipt digest を要求する順序を満たさない） |
| U-WGR-S-006 | parent acceptance receipt を independent review receipt 確定前に先書き | fail-close（review 欠落での acceptance 拒否） |
| U-WGR-S-007 | worker actor と reviewer actor を同一 identity で independent review receipt を発行 | `HIL_ORCHESTRATION_IDENTITY_NOT_SEPARATED` 相当で fail-close（自己検収の拒否） |
| U-WGR-S-008 | worker actor と reviewer actor を同一 session で independent review receipt を発行 | `HIL_ORCHESTRATION_SESSION_NOT_SEPARATED` 相当で fail-close |
| U-WGR-S-009 | worker actor と reviewer actor を同一 context_digest で independent review receipt を発行 | `HIL_ORCHESTRATION_CONTEXT_NOT_INDEPENDENT` 相当で fail-close |
| U-WGR-S-010 | delegation-request receipt / worker terminal receipt / independent review receipt の `repository_head` を 1 件だけ異なる HEAD に差し替える | HEAD drift を検出して parent acceptance receipt を発行しない（同一 HEAD 検証） |
| U-WGR-S-011 | independent review receipt の verdict を `reject` にした状態で parent acceptance receipt 発行を試行 | fail-close（review 未 approve での acceptance 拒否） |
| U-WGR-S-012 | worker terminal receipt を欠落させたまま parent acceptance receipt 発行を試行 | fail-close（worker terminal receipt 欠落の拒否） |
| U-WGR-S-013 | delegation-request receipt → worker terminal receipt → independent review receipt → parent acceptance receipt を正順で発行 | 4 段全てが同一 `repository_head` を共有し、`receipt_digest` chain が単調に前段を参照した状態で parent acceptance receipt 1 件が sealed になる |
| U-WGR-S-014 | 同一 fence token（lease）へ 2 件の delegation-request receipt を並行発行（CAS 競合） | 後着 CAS が stale として拒否され、lease owner は 1 件のみ確定（capacity route の CAS/stale 検証） |
| U-WGR-S-015 | fence token を worker terminal receipt 確定前に解放して再割当 | fail-close（reject/quarantine 以外の理由での lease 早期解放を拒否） |
| U-WGR-S-016 | reject/quarantine で終端した worker terminal receipt の dependency edge を READY へ自動復帰させず、新しい delegation-request receipt（新 lease）として再割当 | 旧 lease は再利用されず、新 receipt が新しい fence token を持つ（stale lease 拒否） |
| U-WGR-S-017 | required cell binding（`lane_id` / `issue_id` / `behavior_contract_id` / `responsibility_owner` / `base_head` / `candidate_head` / `writer_lease` / `target_reviewer` / `effective_rule_packet_digest` / `allowed_paths` / `forbidden_paths` / `lane_ready_receipt`）の各 field を 1 件ずつ欠落・改変 | exact set が揃った packet だけが admit され、field 欠落・stale HEAD・lease 競合・scope 外 path・target reviewer 不一致のいずれも admit しない（MIC-AC-004） |
| U-WGR-S-018 | 2 lane の lane-ready 候補を異なる merge 順で parent acceptance evaluator へ投入 | 評価者（TL 相当の単一 authority）だけが順序を決定し、main への直列確定を再現。writer／reviewer による直接確定要求は拒否（MIC-AC-002） |
| U-WGR-S-019 | writer terminal 後、別 identity/session/context の reviewer が exact HEAD を検証する経路を実行 | blocker 0 かつ同一 HEAD の場合だけ lane-ready 相当の independent review receipt を発行。自己 review・write 可能 review・stale HEAD・blocker 残存は拒否（MIC-AC-003） |
| U-WGR-S-020 | delegation-request receipt / worker terminal receipt / independent review receipt / parent acceptance receipt を 2 回連続で再構築 | 4 段の receipt digest と event chain が再現し、順序・HEAD・lease owner が両回で一致（determinism 検証） |

## 2. 同一 HEAD・順序検証・CAS/stale 検証の試験条件

- **同一 HEAD 検証**: U-WGR-S-010 / U-WGR-S-013 は、四段receipt の `repository_head` を diff し、
  1 bit でも異なる HEAD が混入した場合に parent acceptance receipt の digest 計算へ到達しないことを
  確認する（`worker-lifecycle-receipt.ts` の `head_sha` 束縛パターンの拡張）。
- **順序検証**: U-WGR-S-002 / U-WGR-S-005 / U-WGR-S-006 / U-WGR-S-011 / U-WGR-S-012 は、後段 receipt の
  入力に前段 `receipt_digest` を必須フィールドとして要求し、前段が未確定（digest 不在）の場合は
  後段 receipt の生成関数自体が呼び出せない、または typed failure code を返すことを確認する
  （`WORKER_LIFECYCLE_REVIEW_UNSEALED` / `WORKER_LIFECYCLE_PROPOSAL_MISMATCH` と同型の fail-close）。
- **CAS/stale 検証**: U-WGR-S-014 / U-WGR-S-015 / U-WGR-S-016 は、fence token（`continuation_fences` の
  `fence_token` / `owner` / `acquired_at` 3 列 CAS 構造を模した delegation-request receipt 側 lease）に
  対し、旧 token を保持したままの再書込みを stale として拒否し、owner 不一致の並行 acquire を
  0 件へ収束させることを確認する。
- **自己検収拒否検証**: U-WGR-S-007 / U-WGR-S-008 / U-WGR-S-009 は、`worker-review-receipt.ts` の
  `evaluateWorkerIndependentReview` が identity・session・context_digest のいずれか 1 軸でも一致した
  場合に必ず対応する `HIL_ORCHESTRATION_*` failure code を返すことを、3 軸それぞれ単独で崩す
  mutation で確認する（3 軸同時に崩さない単一 mutation 試験、false negative 抑止）。

同一 candidate HEAD の targeted test、typecheck、Biome、PLAN governance、doctor、full CI、
Windows durability、DB convergence、独立 AI-B receipt が揃うまで confirmed／merge しない。
