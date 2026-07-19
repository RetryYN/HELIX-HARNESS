# 指示書: 第三者 worker runtime（Kimi 等）追加時のセキュリティ要求・要件定義への差し込み（2026-07-19）

status: 要件定義改善指示（PO 指示 2026-07-19）/ Codex 参照用
author runtime: claude
trace key: worker-runtime-security-2026-07-19
関連: docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md（改善指示 1 の詳細化・具体化）

## 位置づけ

本書は、Kimi Code CLI の実機評価（2026-07-19、インストール〜headless 実行〜8 モデルベンチ）で
**実際に発生・確認したセキュリティ課題群**を、進行中の要件リベースライン（L1 要求 / L3 要件）へ
差し込むための指示書である。改善指示 1（worker runtime 多重化エリア）の受入条件を、実測に基づく
具体的な BR/NFR/FR 群へ展開する。inventory-first・粒度合わせ（L1=エリア、L3=FR）・bulk import
禁止の原則に従い、既存正本と重複するものは既存要件の延長として反映する。

## 実測で確認した課題（エビデンス）

| # | 課題 | 実測エビデンス |
|---|---|---|
| E1 | headless 実行は YOLO 前提になる | `kimi -p` は `--yolo`/`--auto` と併用不可、config の `default_yolo = true` が必要だった |
| E2 | worker が scope 外の自発行動をとる | Kimi は指示なしに npm install・テスト実行を開始、成果物を stdout でなくファイルへ書いた |
| E3 | 入れ子 CLI の環境変数干渉 | 親セッションの `CLAUDECODE` / `CODEX_COMPANION_SESSION_ID` 等が残ると headless 実行が無限ハング（1 時間検知不能） |
| E4 | 大きい argv / stdin 閉じ忘れの silent hang | 約 53KB の argv で無応答、background の `codex exec` は stdin を読んで停止（`< /dev/null` 必須） |
| E5 | 第三者 CLI の設定ファイルは上書きすると破壊される | `~/.kimi-code/config.toml` を上書きし OAuth provider 設定を破壊（relogin で復旧） |
| E6 | 第三者 CLI は認証トークンをローカル保存する | `~/.kimi-code/` 配下に OAuth credential が生成される |
| E7 | クォータ枯渇で lane が停止する | Kimi の 5 時間クォータに実際に到達し、ベンチが中断した |
| E8 | 委譲データは外部サーバへ送信される | Kimi/Grok/Cursor はいずれも推論が外部 SaaS で実行される（定額サブスク経由） |

## 各公式 CLI のネイティブセキュリティ機構（2026-07-19 調査済み、要件化時の再発明防止用）

要件化の際は「公式機構で充足できるもの」と「HELIX 側で補う必要があるもの」を分けること。
下表は本セッションで調査した各公式 CLI / OSS の実装状況である。

| runtime | ネイティブ機構（公式 repo/docs で確認） | HELIX 側で補う必要があるもの |
|---|---|---|
| Codex CLI | sandbox 3 モード（`read-only` / `workspace-write` / `danger-full-access`）。OS レベル実装 = macOS Seatbelt / Linux Landlock、network 制御はモード別既定。approval policy 併設 | 最も揃っている。worktree 払い出しと FS 差分検査、audit 記録のみ |
| Claude Code CLI | permission mode、`--allowedTools`（`""` で全ツール遮断可）、hook（PreToolUse guard）、`-p` headless | sandbox は許可制御ベース。OS レベル隔離は外付け（bwrap）が必要 |
| Kimi Code CLI | config `default_yolo`（CLI フラグでは headless 併用不可）、ACP 対応。**repo/docs に sandbox・permission 制御の記載なし**（SECURITY.md は脆弱性報告窓口のみ）。kimi-agent-sdk (Go/Node/Python) 経由なら承認要求へのプログラム応答 + KAOS sandbox backend（BoxLite / E2B / Sprites）+ custom tool 登録 | **素の CLI には sandbox・network 制御・tool 遮断がない**ことを repo 上でも確認。E1〜E5 の通り最も外付けが必要。中期的には kimi-agent-sdk (Node) 経由で承認をコード化するのが本命 |
| grok-build (Grok) | permission 4 モード（`default` / `dontAsk`（allowlist 外は全 deny、headless/CI 向け）/ `bypassPermissions` / `acceptEdits`）。`requirements.toml` の `[ui] disable_bypass_permissions_mode = true` で bypass 恒久禁止（system 級 `/etc/grok/requirements.toml` はユーザー上書き不可）。`--sandbox strict` + custom profile（FS/network を許可とは独立に制限）。managed config の org 配布。並列 worktree subagent、ACP | 未実機検証。設計面はむしろ採取元 — 特に **headless は `dontAsk`（deny 既定 + 明示 allowlist）が HELIX の fail-close 思想と一致**し、FR5/L1-3 の precedent（改善指示 1・3・6） |
| Cursor CLI | cursor-agent（headless あり）。sandbox/権限制御の公開仕様が 3 社中最も薄い | 未実機検証。採用優先度も 3 番手（チャット報告済み評価と整合） |

出典（2026-07-19 確認）: openai/codex → learn.chatgpt.com/docs/security、xai-org/grok-build
`crates/codegen/xai-grok-pager/docs/user-guide/22-permissions-and-safety.md`、MoonshotAI/kimi-cli
README + docs site、MoonshotAI/kimi-agent-sdk README。

含意: headless 委譲の権限モデルの理想形は「全承認 (YOLO)」ではなく grok-build `dontAsk` 型の
**「deny 既定 + 明示 allowlist」**である。L1-3（権限昇格の常態化禁止）の要件化では、YOLO を
許すのは deny+allowlist 型を持たない runtime（現状 Kimi）への経過措置と位置づけ、当該 runtime が
allowlist 型を獲得したら移行する旨を受入条件に書くこと。
また **FR5（sandbox 契約）は「runtime ごとに充足手段が違う」前提で書くこと**。Codex は
ネイティブ sandbox を契約の実装として認め、Claude Code は hook + allowedTools、Kimi は
bwrap テンプレート必須 + 将来 agent-sdk 移行、と adapter ごとの充足マッピングを要件の
受入条件に含める（単一実装の強制はしない）。共通下層としての ACP 採用可否は改善指示 2 の
wire protocol 化と同一論点で扱う。

## 要求（L1）への差し込み指示

1. **[L1/BR] worker runtime 隔離実行エリア（改善指示 1 の確定版）**:
   「第三者 worker runtime は、隔離された作業領域（git worktree または sandbox）内でのみ実行でき、
   repository 本体・`.helix/` state・harness DB・credential へ到達できない」を要求として登録する。
   ADR-009 の Python worker 境界（network default deny、DB path/credential/repository を渡さない、
   proposal bytes の Node 再検証）を **closed capability class として第三者 CLI worker へ一般化**する。
2. **[L1/NFR] 委譲データ分類ゲート（E8）**:
   外部推論サーバへ送信してよいデータの分類（公開可能コード / 機密 / secret・PII）を定義し、
   機密以上を含む作業の第三者 runtime 委譲を禁止する NFR を追加する。判定は委譲前の機械ゲート
   （path allowlist + secret scan）で行い、prose ルールだけにしない。
3. **[L1/NFR] 権限昇格の常態化禁止（E1）**:
   YOLO / bypass / auto-approve 系設定は「実行時のみ有効化・終了時に必ず除去」を要求とする。
   併せて grok-build の `disable_bypass_permissions_mode` 相当の恒久 deny スイッチ
   （改善指示 3）を本エリアの受入条件に含める。
4. **[L1/NFR] 可用性・クォータ耐性（E7）**:
   worker runtime のクォータ枯渇・レート制限を「障害」でなく「予定された状態」として扱い、
   lane が fail-close で退避（キュー保留 / 代替 runtime へのルーティング提案）できることを要求する。

## 要件（L3/FR）への差し込み指示

5. **[L3/FR] worker 実行サンドボックス契約**:
   第三者 CLI worker の実行環境を versioned テンプレート（bwrap 等）で定義する FR を起こす。
   最低条件: (a) 書込可能領域は払い出した worktree/scratch のみ、(b) network は許可先 allowlist
   （当該 runtime の API endpoint のみ）、(c) `.helix/` / harness.db / `~/.ssh` / 他 CLI の
   credential ディレクトリは bind しない、(d) テンプレート逸脱は fail-close。
6. **[L3/FR] 実行環境浄化（E3/E4）**:
   委譲 adapter は入れ子 CLI 起動時に (a) 親 runtime の環境変数（`CLAUDECODE`、
   `CLAUDE_PROJECT_DIR`、`CODEX_COMPANION_SESSION_ID`、API key 系等）を deny-list でなく
   **allow-list 方式で削ぎ落とし**、(b) プロンプトは argv でなく stdin 渡し、(c) stdin を消費する
   CLI には `< /dev/null` を明示、(d) wall-clock timeout を必須とする FR を起こす。
   timeout なしの委譲を lint/doctor で検出する。
7. **[L3/FR] scope 遵守の機械検証（E2）**:
   委譲完了時に worker の FS 差分を検査し、(a) 許可 path 外への書込、(b) 指示外の
   package install・network 取得・テスト実行痕跡を検出して proposal を reject する FR を起こす。
   negative instruction（〜するな）の遵守は prose でなく差分検査で判定する。
8. **[L3/FR] 第三者 CLI 設定・credential の管理境界（E5/E6）**:
   (a) 第三者 CLI の設定変更は merge/append のみ（全体上書き禁止）、変更前 backup 必須、
   (b) credential ディレクトリは HELIX の管理対象外として読取・複製・repo 混入を禁止、
   (c) 設定テンプレートは versioned 管理し秘密値を含めない、を FR として登録する。
9. **[L3/FR] proposal 出力の再検証（既存 ADR-009 の拡張）**:
   worker 出力（ファイル成果物含む）は Node が schema / digest / authority policy で再検証し、
   出力中の command・SQL・absolute path・code を実行しない既存原則を、Python worker 限定から
   **全第三者 worker runtime へ拡張**する FR を起こす（改善指示 4 の検証レベルと接続）。
10. **[L3/FR] 委譲 audit evidence**:
    第三者 runtime への委譲 1 件ごとに runtime/model/effort、送信データ分類、sandbox テンプレート
    version、YOLO 有効化区間、FS 差分検査結果、クォータ状態を harness.db へ digest 付きで記録する
    FR を起こす（改善指示 6 のスコアカード第 1 段と同一 evidence 面に載せる）。

## 受入条件（要件反映の完了判定）

- 上記 1〜10 が既存 L1/L3 正本・リベースライン（HYBRID-CORE-REQUIREMENTS）と突き合わされ、
  新規登録 or 既存要件の延長として trace されている（重複起票しない）。
- 各 FR の受入条件が「prose ルール + 機械ゲート（lint / doctor / guard / 差分検査）」の対で
  定義されている（document-first plus machine enforcement）。
- 実装 PLAN 化は要件確定後に L1/L3 から降下させる（本書から直接 L7 起票しない）。

## Codex への引き継ぎ

Codexにみるにゃ！本書はエビデンス E1〜E8（Kimi 実機評価の実測）に基づく。対立・疑義があれば
silent 変更せず IMP 記録の上で相談すること。
