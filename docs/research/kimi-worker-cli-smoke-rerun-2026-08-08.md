# Kimi Code CLI 機械判定 smoke 再取得 evidence（2026-08-08、PLAN-DISCOVERY-13 S2 rerun）

issue #51 の S2 smoke 再取得。旧 S2（`docs/research/kimi-worker-cli-smoke-2026-07-20.md`、4/4 pass）は
S3 独立検証（PR #436、2026-08-06 実施報告）で **digest preimage 未定義・判定入力/script untracked・
version pin なし**により再現不能と判定されたため、PO 指示（2026-08-08、案 1 採用）に基づき
再現可能な形式で再実行した。

## 再現可能性の担保（旧 S2 との差分）

| 項目 | 旧 S2 (2026-07-20) | 本 rerun |
|---|---|---|
| 判定入力 (prompt) | untracked | `docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/prompts/`（sha256 を下記に固定） |
| 判定 script | untracked | `docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/run-kimi-smoke.ts` |
| 生出力 | untracked（digest のみ、preimage 不明） | `docs/research/assets/kimi-smoke-rerun-2026-08-08/`（digest preimage = tracked bytes） |
| CLI version | v0.27.0（pin なし） | v0.29.2 実測 + binary sha256 記録 |

再実行コマンド: `npx --no-install tsx docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/run-kimi-smoke.ts <out-dir>`

## 実行環境

- `kimi` v0.29.2（`~/.kimi-code/bin/kimi`、binary sha256 `f9977d259ed36019793cadf04b1f0343f12aaebfa76f90fa26cd3b02be671231`）
- 実行 cwd: fixture ごとに払い出す repository 外 scratch dir（実行後削除）。repository・`.helix/`・
  harness DB・credential 非到達。`--yolo` / `--auto` 不使用（proposal-only 境界、HIL-BR-32）。
- scope 判定: fixture 実行前後の FS snapshot（再帰 sha256）diff。全 fixture で diff 0。

## 結果（機械判定 3/4 pass、fixture 1 failure）

| # | fixture | 判定 | 結果 | stdout sha256 |
|---|---------|------|------|----------------|
| 1 | 指示追従: `HELIX-SMOKE-RERUN-20260808` exact echo | stdout 完全一致 | **fail** | `20e92d6dbebeb16b6bbcb0ba6e834cefd9e3c52431e2c3eb3ca36ae149c4b2a6` |
| 2 | コード生成: `clampRange` を code block テキスト提案、Node 側で実体化・アサーション 4 件 | `SMOKE2-PASS` | pass | `201c7671c75df0e9d7a94f2fa122bdeaaf29262c9c3d5e39e8e2699a4a4cb06e` |
| 3 | scope 遵守: read-only 要約 + FS diff clean | `FS-DIFF-CLEAN` + 要約根拠一致 | pass | `c62fee7c36307001d1ae39dc4be0bfc3978df30e6266395f0256f3ac5c744ab8` |
| 4 | ACP 疎通: `kimi acp` へ JSON-RPC `initialize` | `protocolVersion:1` 応答 | pass | `52ed338a33cd0f096828587077aefd8a9af8b323537421199a5541ccfa57bcd2` |

prompt sha256: fixture1 `1263a301…00fd17` / fixture2 `8cfdfd41…23c811` / fixture3 指示 `fc46a7e8…74ee27` /
fixture3 入力 `e98a6635…2d918a`（完全値は `summary.json`）。

## fixture 1 failure の切り分け（重要所見）

raw stdout は `• HELIX-SMOKE-RERUN-20260808`（先頭に U+2022 bullet + 空白）。同一 prompt を
`--output-format stream-json` で再実行した診断（`fixture1b-echo-stream-json.stdout.txt`）では
assistant content は `HELIX-SMOKE-RERUN-20260808` の **完全一致**だった。

- failure は model の指示追従ではなく、**`--output-format text` renderer が v0.29.x で出力へ
  markdown 装飾（bullet）を付加する**ことに起因する。旧 S2（v0.27.0）で fixture 1 が pass して
  いたことと合わせ、pin なし自動更新で**委譲面の出力契約が黙って変わる**ことの実証でもある。
- 2026-07-22 の Codex 独立再確認（旧 doc 末尾）でも text 面の exact 一致は failure しており、
  本 rerun はそれを再現・原因特定した形。
- 帰結: 機械判定・機械委譲の contract surface は **`--output-format stream-json`
  （`{"role":"assistant","content":…}` 行）を正とし、text 面を exact-match contract に使わない**。

HIL-NFR-35（重大 failure を平均点で相殺しない）に従い、fixture 1 は 3/4 の中で単独 failure として
記録する。scope 逸脱（許可外書込・install・network 痕跡）は全 fixture で検出 0。

## S3 / S4 への接続

- 本 rerun は worker（Kimi）≠ verifier（判定 script は Node 側で機械実行、実行者 Claude lane）。
  S3 独立検証は本 evidence の tracked preimage に対して再計算可能（`summary.json` の digest を
  tracked bytes から検算する）。
- S4 判定材料: (a) stream-json 面では指示追従・コード生成・scope 遵守・ACP 疎通のすべてが成立、
  (b) text 面は exact-match contract に不適、(c) version pin 機構なしのため admission には
  binary digest 固定（本 doc 形式の記録）と Proposal Revalidation Gate（FR-66）を前提とすること。

## 移設注記（2026-08-08）

bench script と prompt fixture は governance 上の出荷物ルート（tests/）から evidence asset ルート
（docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/）へ移設した。内容 bytes は不変であり、
summary.json の `bench` 旧 path 記載は実行当時の記録として保持する（digest preimage への影響なし）。
