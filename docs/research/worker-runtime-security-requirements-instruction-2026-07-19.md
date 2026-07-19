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
| E9 | ベンダー CLI は silent 全量送信を行い得るし、その修正・設定 UI は信用できない（外部実証、2026-07 Grok Build 事故） | Grok Build は未読ファイル・commit 履歴・committed secrets 込みの **git repo 全体を Git bundle で xAI の GCS へ送信**（12GB repo でモデル読取 192KB に対し 5.1GiB 送出）。privacy トグルは無効（`trace_upload_enabled: true` のまま）。修正は client 更新なしの **server 側リモートフラグ**（`disable_codebase_upload: true`）のみで、送信コードは配布バイナリに残置、opt-out 既定、削除宣言は第三者検証なし。出典: Cereblab 解析（2026-07-12 公表）、The Hacker News / The Register / Cybernews / digitalapplied 報道 |
| E10 | 定額プランの入力は既定でモデル訓練に使われ得る（契約面） | Kimi Code は利用規約分析上、入力データを訓練利用（opt-out はメール申請）。技術的漏洩がなくても送信コードは訓練データになり得る |

## 各公式 CLI のネイティブセキュリティ機構（2026-07-19 調査済み、要件化時の再発明防止用）

要件化の際は「公式機構で充足できるもの」と「HELIX 側で補う必要があるもの」を分けること。
下表は本セッションで調査した各公式 CLI / OSS の実装状況である。

| runtime | ネイティブ機構（公式 repo/docs で確認） | HELIX 側で補う必要があるもの |
|---|---|---|
| Codex CLI | sandbox 3 モード（`read-only` / `workspace-write` / `danger-full-access`）。OS レベル実装 = macOS Seatbelt / Linux Landlock、network 制御はモード別既定。approval policy 併設 | 最も揃っている。worktree 払い出しと FS 差分検査、audit 記録のみ |
| Claude Code CLI | permission mode、`--allowedTools`（`""` で全ツール遮断可）、hook（PreToolUse guard）、`-p` headless | sandbox は許可制御ベース。OS レベル隔離は外付け（bwrap）が必要 |
| Kimi Code CLI | config `default_yolo`（CLI フラグでは headless 併用不可）、ACP 対応。**repo/docs に sandbox・permission 制御の記載なし**（SECURITY.md は脆弱性報告窓口のみ）。kimi-agent-sdk (Go/Node/Python) 経由なら承認要求へのプログラム応答 + KAOS sandbox backend（BoxLite / E2B / Sprites）+ custom tool 登録 | **素の CLI には sandbox・network 制御・tool 遮断がない**ことを repo 上でも確認。E1〜E5 の通り最も外付けが必要。中期的には kimi-agent-sdk (Node) 経由で承認をコード化するのが本命 |
| grok-build (Grok) | permission 4 モード（`default` / `dontAsk`（allowlist 外は全 deny、headless/CI 向け）/ `bypassPermissions` / `acceptEdits`）。`requirements.toml` の `[ui] disable_bypass_permissions_mode = true` で bypass 恒久禁止（system 級 `/etc/grok/requirements.toml` はユーザー上書き不可）。`--sandbox strict` + custom profile（FS/network を許可とは独立に制限）。managed config の org 配布。並列 worktree subagent、ACP | 未実機検証。設計面は採取元だが、**運用実績として E9 事故（2026-07 全 repo 送信）があるため worker 採用は当面見送り**。`dontAsk`（deny 既定 + 明示 allowlist）の設計は FR5/L1-3 の precedent として採取のみ行う（改善指示 1・3・6） |
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

## grok-build ソース監査結果（2026-07-19、pmo-tech-fork 2 ラウンド実施）

Grok worker の条件付き導入判断（PO 方針: ①ソース監査 → ②FR5/FR11 実装 → ③購読・実機）の
①として、xai-org/grok-build（Rust、main）の egress 経路を監査した。要点:

- **repo 全体 bundle 送信コードは現行ソースに不存在**: `git_bundle` / `codebase_upload` /
  `disable_codebase_upload` / bucket 名 `grok-code-session-traces` は code search 0 件
  （事故後削除 or closed 部分の可能性あり。不存在の証明ではない）。
- **privacy トグルの無効性はソースと整合**: `extensions/privacy.rs` はサーバへの opt-out 通知のみで、
  upload 実行コード側がこのフラグを参照する箇所なし。
- **現役 egress は 4 系統**（ターントレース / `memory.tar.gz` / 権限ログ / 検索インデックス GCS 同期）。
  各系統にローカル無効化ゲートあり（`--local`、`trace_upload=false`、`session_registry_enabled=false` 等）。
- **致命的留保 1 — trace_upload の権威未確定**: `session_registry_enabled` は local-wins をコメントで
  確認できた一方、`trace_upload_enabled` の解決関数本体は未発見で、同コードベースに
  「env > remote > local」という remote-wins パターンの実例もある。**リモートフラグがローカル明示
  false を上書きする可能性を排除できない**（"無効化したつもりが有効" リスク）。
- **致命的留保 2 — ホスト分離が不完全**: GCS 送信は `storage.googleapis.com`（別ホスト、allowlist で
  機械的遮断可）だが、リモート設定取得（`GET /v1/settings`）は **推論 API と同一ホスト
  （cli-chat-proxy / proxy.grok.com 系）を共用**するため、「推論のみ許可」のホスト allowlist では
  設定 push 系が素通りする。遮断にはパス単位フィルタ（forward proxy）が必要。
- **feature flag による upload 除去ビルドは不可**（workspace に該当 features なし）。除去するなら
  fork + ソースパッチで、アップストリーム追従コストが発生する。
- `max_upload_untracked_bytes`（非 git ファイル捕捉の疑い）は **RemoteSettings 上の宣言のみで
  消費コード未発見**（未配線の可能性が高いが断定不可）。

**③（購読・実機トライアル）へ進む追加条件**: FR5/FR11 に加えて、(i) egress 遮断は
ホスト allowlist + **パス単位フィルタ**で構成し `storage.googleapis.com` を deny すること、
(ii) trace_upload local-wins が新バージョンのソースまたは実測（egress 計測）で確認できるまで
「送信は有効」前提の分類（公開可能コードのみ委譲）で扱うこと。

## 要求（L1）への差し込み指示

1. **[L1/BR] worker runtime 隔離実行エリア（改善指示 1 の確定版）**:
   「第三者 worker runtime は、隔離された作業領域（git worktree または sandbox）内でのみ実行でき、
   repository 本体・`.helix/` state・harness DB・credential へ到達できない」を要求として登録する。
   ADR-009 の Python worker 境界（network default deny、DB path/credential/repository を渡さない、
   proposal bytes の Node 再検証）を **closed capability class として第三者 CLI worker へ一般化**する。
2. **[L1/NFR] 委譲データ分類ゲート（E8/E10）**:
   外部推論サーバへ送信してよいデータの分類（公開可能コード / 機密 / secret・PII）を定義し、
   機密以上を含む作業の第三者 runtime 委譲を禁止する NFR を追加する。判定は委譲前の機械ゲート
   （path allowlist + secret scan）で行い、prose ルールだけにしない。
   さらに E10 を受け、**訓練利用 opt-out の完了を当該 runtime の採用前提条件**とする
   （opt-out 未完了の間は「送信データは訓練される」分類で扱い、公開可能コード以外を委譲しない）。
2b. **[L1/NFR] ベンダー設定不信の原則（E9）**:
   ベンダー側のプライバシー設定 UI・修正宣言・リモートフラグを**要件充足の根拠として認めない**。
   セキュリティ要件の充足とみなせるのは、HELIX がローカルで検証・強制できる機構
   （OS sandbox、network allowlist、egress 実測、FS 差分検査）のみとする。根拠 = Grok Build 事故
   （トグル無効・server 側フラグのみの修正・送信コード残置）。この原則は全第三者 runtime に適用する。
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
   （当該 runtime の**推論 API endpoint のみ**。E9 対策として telemetry / storage / 任意 bucket への
   送信先は物理的に到達不能にする）、(c) `.helix/` / harness.db / `~/.ssh` / 他 CLI の
   credential ディレクトリは bind しない、(d) テンプレート逸脱は fail-close、
   (e) **egress 実測**: 委譲 1 回の送信バイト量を計測し、プロンプト + 払い出しファイルサイズと
   同オーダーであることを受入ゲートで検証する（Grok 事故を検出した Cereblab の wire 解析手法の定常化。
   乖離検出時は当該 runtime を自動 quarantine）。
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
11. **[L3/FR] 払い出しデータの最小化（E9 の構造的対策）**:
    worker へ払い出す作業領域を「当該タスクに必要なファイルのみ」に最小化する FR を起こす。
    (a) sparse / filtered worktree（タスクに関係ない path を含めない）、(b) **git 履歴を含めない**
    （shallow / 履歴なし export。Grok 事故は commit 履歴・過去 secret まで流出した — 履歴が
    存在しなければ bundle 化されても流出しない）、(c) 払い出し前 secret scan の pass を必須とする、
    (d) 払い出し内容の manifest（path + digest）を audit evidence（FR10）に記録する。
    これにより、仮に runtime が E9 級の silent 全量送信を行っても、**流出上限 = 払い出した
    最小セット**に構造的に制限される（network allowlist と二重の防壁）。

## 受入条件（要件反映の完了判定）

- E9 級（silent 全量送信・ベンダー設定無効）の悪質挙動に対し、「防げるもの」と「防げないもの」が
  要件上区別されている: 推論に不要な送信は network allowlist（FR5b/e）と払い出し最小化（FR11）で
  **技術的に不可能化**し、正当に送信した payload のベンダー側利用（訓練等）はローカルで防げないため
  分類ゲート + opt-out 前提条件（L1-2）+ 契約面で押さえる、という二層で記述されていること。
- 上記 1〜11 が既存 L1/L3 正本・リベースライン（HYBRID-CORE-REQUIREMENTS）と突き合わされ、
  新規登録 or 既存要件の延長として trace されている（重複起票しない）。
- 各 FR の受入条件が「prose ルール + 機械ゲート（lint / doctor / guard / 差分検査）」の対で
  定義されている（document-first plus machine enforcement）。
- 実装 PLAN 化は要件確定後に L1/L3 から降下させる（本書から直接 L7 起票しない）。

## Codex への引き継ぎ

Codexにみるにゃ！本書はエビデンス E1〜E8（Kimi 実機評価の実測）に基づく。対立・疑義があれば
silent 変更せず IMP 記録の上で相談すること。
