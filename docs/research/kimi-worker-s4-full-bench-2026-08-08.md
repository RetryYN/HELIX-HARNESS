# Kimi Code CLI の S4 full bench と採否決定記録（admission decision receipt、2026-08-08）

PLAN-DISCOVERY-13（issue #51）の S4。S2 rerun（`docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md`、
3/4 pass、contract surface = stream-json 確定）を入力に、実 task scorecard・skill A/B・mutation kill・
blind judge を実施し、採否決定（admission decision）を本書に receipt として記録する。
実施指示 = PO「完遂までもっていって」（2026-08-08、S4 実施指示として解釈。Kimi 起動は
案 1 承認済みの controlled bench 形態を踏襲）。

## 1. 環境（version 束縛）

- Kimi CLI: v0.29.2（S2 rerun と同一 version）
- binary sha256: `f9977d259ed36019793cadf04b1f0343f12aaebfa76f90fa26cd3b02be671231`（S2 rerun と同一 digest = 判定間で binary が変わっていないことの機械確認）
- 委譲面: `kimi -p <prompt> --output-format stream-json`（S2 rerun の帰結どおり stream-json を正とする）
- 実行境界: 払い出し scratch dir（repository 外）を cwd とし、実行前後の FS snapshot diff で scope 判定。`--yolo` / `--auto` 不使用、proposal-only（提案 text を Node 側で実体化・検証）。

## 2. 再現可能性（preimage）

- bench script: `docs/research/assets/kimi-s4-bench-2026-08-08/bench/run-s4-bench.ts`（tracked）
- prompt: `docs/research/assets/kimi-s4-bench-2026-08-08/bench/prompts/`（4 件、summary.json に sha256 記録）
- 生出力: `docs/research/assets/kimi-s4-bench-2026-08-08/*.stdout.txt` ほか（tracked）
- 集計: `docs/research/assets/kimi-s4-bench-2026-08-08/summary.json`（sha256 `3c411e72b1cddc870a749c2c812a803789ff34792360264d16d15e6477492e3e`）
- 再実行: `npx --no-install tsx docs/research/assets/kimi-s4-bench-2026-08-08/bench/run-s4-bench.ts <out-dir>`

## 3. 実 task scorecard（機械判定、4/4 pass）

| task | 内容 | 判定 | 結果 |
|------|------|------|------|
| task1a-codegen-plain | 仕様からの関数実装（plain prompt） | Node 実体化 + assertion 6 本 | pass |
| task1b-codegen-skill | 同一仕様 + coding-rules skill 注入 | 同上 + skill 遵守 marker | pass |
| task2-bugfix | planted bug 2 件の module 修正 | assertion 5 本（regression + validation 保持） | pass |
| task3-tests-mutation | 参照実装への test 作成 | 参照で green + mutant 4 種の kill | pass（kill 4/4） |

- scope 逸脱（許可外書込・install・network 痕跡）: 全 task で FS diff 0。
- stdout sha256: task1a `1be2c621…`、task1b `a3025097…`、task2 `ebb2a384…`、task3 `58f3ae97…`（完全値は summary.json）。

### 3.1 skill A/B（注入効果の機械確認）

同一仕様に対し、skill 注入の有無で遵守 marker が差分どおりに変化した（= 指示注入が効いている）。

| marker | plain (1a) | skill (1b) |
|--------|-----------|-----------|
| named export | ○ | ○ |
| no any | ○ | ○ |
| JSDoc（skill 要求） | × | ○ |
| RangeError message 規約（skill 要求） | × | ○ |

### 3.2 mutation kill（test 品質）

Kimi 作成の test suite は参照実装で green、既知 mutant 4 種（sort 除去 / midpoint 誤り /
empty guard 除去 / 平均化除去）をすべて kill した（4/4）。

## 4. blind judge による盲検評価（worker ≠ judge）

- 方法: task1 / task2 について、Kimi 提案（candidate-1）と比較対象（candidate-2 = `fe-ui` subagent、
  claude-sonnet-5 が同一仕様から独立生成し、同じ機械検証を green で通過）を匿名化し、
  `code-reviewer` subagent（claude-sonnet-5、effort=high）が出所非開示で 4 軸採点した。
  対応関係は judge へ渡さず、判定後に本書へ記録した。
- 証跡: `docs/research/assets/kimi-s4-bench-2026-08-08/blind-judge/`（candidate 4 本 + verdict.json、
  sha256 `d36f4e11f96d32c7431df24d997a365f2973cbe7ee5ab024be4611b279c76dd3`）。
- cross-runtime 委譲の試行: `helix codex --role qa --execute` は FR-09 worker context 未 seal
  （`WORKER_CONTEXT_UNSEALED`）で fail-close したため、単一 runtime 代替証跡ルールに従い
  `intra_runtime_subagent` で実施した（fail-close の挙動自体は境界が機能している証跡）。
- 結果: task1 = tie（両者 4 軸 5/5）。task2 = candidate-2 優位（Kimi 解も correctness/spec/robustness 5 だが
  quality 3 — 複合 guard 条件の可読性劣位）。**correctness の欠陥は両 task とも検出 0**。

## 5. HIL-NFR-35 照合（重大 failure の相殺禁止）

- 重大 failure（scope 逸脱・誤動作・validation 破壊）: 検出 0。
- 非重大所見: task2 の可読性劣位（blind judge quality 3）。平均点に埋めず単独記録する。
- S2 rerun からの持ち越し: text renderer 装飾（fixture 1）は stream-json 面で解消済み。
  version pin 無し自動更新のリスク（F-3）は未解消であり、採否条件へ織り込む（§6）。

## 6. admission decision receipt（採否決定）

**決定 = 用途限定 admit（conditional admission）**。4 択（admit / 用途限定 / quarantine / 見送り）の
うち「用途限定」。

- 根拠（admit 方向）: S2 rerun + S4 full bench で、機械判定 scorecard 4/4、mutation kill 4/4、
  skill 注入の効果確認、scope 逸脱 0、blind judge で correctness 欠陥 0 を、すべて再計算可能な
  preimage 付きで確認した。
- 根拠（full admit しない）: PLAN S1 の拘束「HELIX 所有 wrapper が process 外側で
  filesystem / network / credential 境界を強制できない限り admit しない」が未充足
  （native sandbox option 無し、v0.29.2 で再確認済み）。加えて version pin 無し自動更新（F-3）が
  委譲面の出力契約を黙って変え得る。
- 許可する用途（本 receipt の範囲）:
  1. proposal-only の controlled bench / smoke（本 bench と同形態: scratch cwd 隔離 + FS diff 検査 +
     Node 側実体化・検証）。
  2. 上記形態での評価・回帰再取得（S2/S4 bench の再実行）。
- 通常 lane（`helix kimi` 委譲面）投入の解禁条件（Forward 実装、L4 以降）:
  1. HELIX 所有 wrapper による process 外側の filesystem / network / credential 境界強制。
  2. Proposal Revalidation Gate（HIL-FR-66）による提案 bytes の schema / digest / authority 再検証。
  3. 起動時の binary sha256 記録と評価済み digest との照合（不一致時は fail-close + 再評価要求）。
  4. contract surface は stream-json のみ（text 面を exact-match contract に使わない）。
- routing: 上記 Forward 実装は PLAN S4 routing 台帳どおり SE / TL の L4 Forward 設計へ接続する。
  issue #390（independent-review-fallback）は本 receipt の用途限定範囲では解禁せず、
  通常 lane 解禁条件の充足後に有効化する。
- 本 PLAN はこの receipt をもって terminal 化する（status=completed）。

## 7. 判定の独立性

- worker（Kimi 起動・生出力）と機械判定（Node assertion / FS diff / mutation run）は同一 script だが、
  判定入力・script・生出力がすべて tracked であり、第三者が Kimi を起動せずに stdout sha256 と
  判定を再計算できる（S3 と同型の独立再計算可能性）。
- blind judge は worker と別 agent（code-reviewer subagent）で、出所非開示（§4）。
- 比較対象生成（fe-ui）と judge（code-reviewer)は別 agent。orchestrator（本 session）は
  匿名化のみ行い採点に関与していない。
