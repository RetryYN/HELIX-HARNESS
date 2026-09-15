# Kimi Code CLI smoke 判定の独立検証（2026-08-07、PLAN-DISCOVERY-13 S3）

PLAN-DISCOVERY-13 の完了条件「S3: smoke 判定の独立検証（worker≠verifier）」を実施した記録である。
検証対象は `docs/research/kimi-worker-cli-smoke-2026-07-20.md` に記録された S2 の
機械判定 smoke 結果（4/4 pass）。

## 検証条件

- **worker ≠ verifier**: S2 の実行・判定は Kimi lane が行った。本検証は Claude（primary runtime）が
  read-only で実施し、`intra_runtime_subagent` 相当の代替証跡として記録する。
- **Kimi プロセスを起動しない**: security-foundation readiness 前の通常 lane 投入は禁止（issue #51）。
  本検証は repository に tracked された成果物だけを対象とする**証跡再計算・整合監査**であり、
  `kimi` バイナリを一切実行していない。
- 検証日: 2026-08-07。対象 HEAD: `41fdec07`。

## 結論

**S3 は pass にできない。** S2 の 4 件の判定は、repository に tracked された成果物からは
**独立に再計算できない**（再現不能）。これは Kimi の smoke 結果が「悪かった」ことを意味せず、
**証跡の保全形式が admission 判断に耐えない**ことを意味する。

`smoke 合格のみで full admission しない`（HIL-NFR-35）は元々の方針どおりであり、本検証は
その手前の「S2 判定そのものを第三者が確かめられるか」に否と答えるものである。

## 検出事項

### F-1（blocker）: digest の preimage が定義されていない

`docs/research/kimi-worker-cli-smoke-2026-07-20.md` の結果表は fixture ごとに
`evidence digest (sha256)` を 1 つずつ載せるが、**何のバイト列を hash したのかを定義していない**。

- prompt か、応答本文か、両者の連結か、判定 script の出力か、が特定できない。
- そのため raw artifact が仮に残っていても、検証者は同じ digest を再計算できない。

同じ doc 内の「2026-07-30 CLI surface 再確認 receipt」は対照的に
`command` / `exit_code` / `output_bytes` / `output_digest` / `checked_at` を明示しており、
preimage が一意に定まる。**S2 の 4 件だけがこの形式を満たしていない。**

### F-2（blocker）: 判定入力・出力が repository に存在しない

4 件の digest 値を repository 全体（`node_modules` 除く）で検索した結果、
**出現箇所は `docs/research/kimi-worker-cli-smoke-2026-07-20.md` 自身のみ**であった。

```
541aa71bb7c075ec51c972a8485577a9d7dec1d3f488a045ec07b42b8a819a95  → 1 file (research doc 自身)
790b00f46c504970dd97f72a815f0853b36f4be9bfc7cefebb77bbb36903bcab  → 同上
92162a4181b1b6a4...（fixture 3）                                   → 同上
7a89fd63e09f28dc...（fixture 4）                                   → 同上
```

以下の judgement 入力がいずれも tracked されていない。

| fixture | 判定に必要だが存在しない成果物 |
|---|---|
| 1 指示追従 | prompt 本文、応答本文 |
| 2 コード生成 | 抽出された提案 code、アサーション 4 件の検証 script、その実行出力 |
| 3 scope 遵守 | FS snapshot（before/after）、diff 出力、snapshot 取得 script |
| 4 ACP 疎通 | 送信した JSON-RPC `initialize` request、受信した response |

`.helix/evidence/` 配下にも Kimi smoke の evidence entry は存在しない
（`g8-integration` / `g9-system` / `g10-ux` / `green-command` / `helix-l5` / `rename` /
`run-debug` / `verification-profiles` のみ）。

### F-3（important）: 判定が version に束縛されており、その version が再構成できない

| 記録日 | 記録された CLI version | 出典 |
|---|---|---|
| 2026-07-20 | v0.27.0 | S2 smoke evidence |
| 2026-07-30 | 0.29.2 | 同 doc の CLI surface 再確認 receipt |
| 2026-08-06 | 0.28.1（拡張 `moonshot-ai.kimi-code` 0.6.7 同梱） | `docs/governance/kimi-code-extension-security-audit-2026-08-06.md` |

S2 の判定は v0.27.0 に束縛されている。CLI 本体は同 audit が記録するとおり
**CDN から段階ロールアウトで自動更新**され、version pin も digest pin も無い。
実際 07-30 → 08-06 の記録は 0.29.2 → 0.28.1 と単調でなく、少なくとも 2 系統の install 経路
（`~/.kimi-code/bin/kimi` と拡張同梱 CLI）が併存していることを示す。

したがって、仮に F-1 / F-2 が解消されても **v0.27.0 の判定結果を現行バイナリの admission 根拠へ
そのまま繰り上げることはできない**。

### F-4（minor）: 「機械判定」の主張と保全実態のずれ

PLAN-DISCOVERY-13 S1 は「判定 script と出力 digest を evidence として research doc に固定する」と
書いているが、実際に固定されたのは digest だけで**判定 script は固定されていない**。
`CLAUDE.md` の PLAN claim discipline（falsifiable claim は裏付ける test / command を cite する）に
照らすと、`機械判定 4/4 pass` は現状 prose assertion に留まる。

## 独立検証で確認できたこと（pass 側）

再現不能とは別に、以下は tracked 成果物だけで確認でき、**矛盾は無かった**。

- **scope 逸脱の非相殺**: HIL-NFR-35 の「重大 failure を平均点で相殺しない」に対し、
  S2 は fixture 3 を単独 pass/fail として扱い、検出 0 を「相殺の余地なし」と明記している。
  平均点化した形跡は無い。
- **proposal-only 境界の記述整合**: fixture 2 で worker に FS write を与えず、提案 code の実体化と
  検証を Node 側で行ったという記述は、HIL-BR-32 / FR-66 および ADR-010 の
  「transaction commit authority は Node 境界だけが持つ」と矛盾しない。
- **admission を先走っていない**: research doc・PLAN とも「smoke 合格のみで full admission しない」
  を明記し、S4 未了として `helix kimi` 委譲面・sandbox・admission receipt を範囲外に置いている。
- **sandbox 非依拠**: 07-30 receipt は「公開 option に sandbox option が無い」ことを確認し、
  permission prompt や禁止文を隔離証拠にしない旨を明記している。これは
  `docs/governance/kimi-code-extension-security-audit-2026-08-06.md` の 3 層ガード整備方針と整合する。

## S3 の判定

| 完了条件 | 判定 |
|---|---|
| S3: smoke 判定の独立検証（worker≠verifier） | **実施済み / 結果 = 再現不能（not verifiable）** |

worker ≠ verifier の分離条件そのものは満たしている（S2 = Kimi lane、S3 = Claude primary runtime、
read-only）。しかし**検証対象の判定を再計算できない**ため、S2 の 4/4 pass を
「独立検証済み」として S4 admission の入力に使うことはできない。

## 次工程への要求（S4 admission profile への申し送り）

S2 を再実行する場合は、以下を満たす evidence retention profile 下で行う。
これらは issue #51 の必須 context packet / strict receipt 方針と同じ強度である。

1. **preimage の明示**: fixture ごとに `command` / `stdin` / `exit_code` / `output_bytes` /
   `output_digest` / `checked_at` を 07-30 receipt と同じ形式で記録する。
2. **判定 script の tracked 化**: fixture 2 のアサーション script、fixture 3 の FS snapshot/diff
   script を repository に置き、oracle として再実行可能にする。
3. **worker 出力の保全**: prompt と応答を（secrets / PII を含まない fixture である前提で）
   evidence として保存し、digest の preimage にする。
4. **version pin**: 実行時の CLI version と**バイナリ digest**を記録し、auto-update で digest が
   変わった場合は S2 判定を失効させる。
5. **worker ≠ verifier の事前宣言**: 実行 runtime と検証 runtime を receipt に記録する。

## 本検証で実行したコマンド

Kimi バイナリは実行していない。repository 内の read-only 検索のみ。

```bash
# F-2: 4 件の digest 値が research doc 以外に存在しないことの確認
grep -rl "541aa71bb7c075ec51c972a8485577a9d7dec1d3f488a045ec07b42b8a819a95" . \
  --exclude-dir=node_modules --exclude-dir=.git

# F-2: evidence ディレクトリに Kimi smoke entry が無いことの確認
ls .helix/evidence

# F-3: version 記述の突合
grep -rn "0\.2[0-9]\.[0-9]" \
  docs/governance/kimi-code-extension-security-audit-2026-08-06.md \
  docs/research/kimi-worker-cli-smoke-2026-07-20.md \
  docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md
```
