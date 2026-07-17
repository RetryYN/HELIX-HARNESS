# HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE v0.4.0 要件定義フルチェック監査（2026-07-17）

- 監査対象: `HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.4.0.zip`（要件定義パッケージ、182 ファイル）
- 補助素材: `UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip`、`ハイブリッド設計ドキュメントv1-fixed.zip`、GitHub 3 リポジトリ（`unison-ai-product/UT-TDD_AGENT-HARNESS` / `RetryYN/ai-dev-kit-vscode` / `RetryYN/HELIX-HARNESS-OS`）
- 照合正本: `CLAUDE.md` precedence、`docs/adr/ADR-001`、`docs/adr/ADR-009`、`.claude/CLAUDE.md` Guard/Subagent 規則、`docs/design/helix/L0-charter/helix-charter_v0.1.md`、`docs/governance/infinity-loop-*` 台帳群、`docs/governance/helix-agent-harness-*` ref 採取台帳
- 手法: 12 検査軸 × 並列サブエージェント監査（計 54 エージェント、finder → 敵対的検証の 2 段）。critical/major 所見は全件、独立検証エージェントまたは原典 grep 再現で裏取り済み。反証成立 2 件は棄却済み。
- 機械照合: パッケージ CHECKSUMS.md 182 件全一致。vendored UWRS = 単体 v1.1.0 ZIP と内容同一（vendor 側 MANIFEST.json 追加のみ）。

## 総合判定

**現状のままでは要件定義として承認不能（critical 9 件・major 37 件）。**

内容の大半（チャット要件の取り込み 96%、UWRS 判断コア構想、検出 DB スキーマ骨格、Linux-first tier 骨格）は再利用可能な品質だが、パッケージの**権威構造そのものがリポジトリの承認済み正本（ADR-009 / CLAUDE.md precedence）と正面衝突**しており、これは個別修正ではなく PO 判断（どちらを正とするか）を要する。

## 軸別カバレッジと確定所見

| # | 検査軸 | カバレッジ | critical | major | 備考 |
|---|---|---|---|---|---|
| 1 | 脱Bun・TS/Node+Python境界 | 45% | 3 | 4 | ADR-009 と構造的矛盾 |
| 2 | Linux中心マルチOS | 72% | 0 | 3 | tier 骨格は概ね整合 |
| 3 | サブエージェント HARNESS 保持標準（capsule） | 48% | 0 | 5 | 既存 agent-guard と未接続 |
| 4 | 自己改善+自己監査インフィニティループ | 28% | 1 | 6 | 既存台帳と完全断絶 |
| 5 | チャット内全要件の網羅 | 96% | 0 | 0 | 最良の軸 |
| 6 | ハイブリッド設計コアエンジン+検出DB | 62% | 0 | 3 | schema/SQL 不整合 |
| 7 | UT-TDD 全検査抽出 | 25% | 1 | 2+3 | GitHub 照合で stale 確定 |
| 8 | 既存資産の全棚卸し | 35% | 2 | 2 | 旧HELIX・自リポジトリ資産が対象外 |
| 9 | UWRS 判断コアエンジン活用 | 62% | 0 | 3 | 実行形態が未決 |
| 10 | パッケージ内部整合 | 76% | 0 | 4 | trace エッジ 24 件不一致ほか |
| 11 | リポジトリ正本との権威整合 | 40% | 2 | 2 | precedence 衝突 |
| 12 | パッケージ完全性（機械照合） | 100% | 0 | 0 | checksum/vendor 同一性 OK |

## Critical 所見（9 件 — 全件検証済み）

### A. 権威構造の衝突（最重要・PO 判断事項）

1. **RB-01 / AUTH-001: 権威順序が ADR-009 の Node 優位/Python 従属を逆転**。`01-authority-and-source-order.md` は「Hybrid Python Core の pinned source」（2位）を「TypeScript/Node runtime contract」（5位）より上位に置く。ADR-009（accepted）は Node を唯一の transaction writer、Python を proposal-only worker と定める。CLAUDE.md の「仕組み=ハーネスが上、個別機能は仕組みを超えない」とも矛盾。
2. **RB-02: Python を『コアエンジン基準実装』と規定**。`02-core-engine-definition.md` は `hybrid-docgen/tools/*.py` を基準実装とし「全面再実装せず、元 path 維持の部分修正・wrap・split で利用」と明言。ADR-009 の bulk port 禁止（採用単位=behavior atom + versioned contract）と正面衝突。v0.3.0 errata で TS/Node 中心を「誤り」として意図的に反転させた経緯があり、誤記ではなく設計判断の対立。
3. **AUTH-002: ADR-000（package 内）が ADR-009 と衝突する内容を持ちながら supersedes 宣言なし**。Python 許容 capability も ADR-009 の closed list（source_atomization / document_engine / detector / product_data / analysis）を超過。`.claude/CLAUDE.md` の PLAN claim discipline（supersession は双方向必須）に不適合。
4. **RB-03: パッケージ全体に ADR-009 への参照が 0 件**。要件 sources は CHAT-* / UT-* / HYBRID-* のみで、リポジトリ承認済み ADR と join されておらず、ADR 変更時の追従先が機械特定不能。

### B. 既存正本との断絶

5. **INF-01: インフィニティループが既存正本群と未接続**。`docs/governance/infinity-loop-*`（requirement-definition-ledger / coverage-ledger / assertion 台帳ほか）の HIL-BR / HIL-FR / HDS-HIL ID への言及が 0 件。既存要件台帳との二重定義状態。
6. **AST-01: 旧HELIX（ai-dev-kit-vscode）への言及が皆無**。CLAUDE.md が「常時参照・inventory-first の絶対対象」と定める機能ソース正本が棚卸しの source roles に存在しない。
7. **AST-02: 自リポジトリの現行資産（agents / skills / hooks / CLI / DB projections / teams）が棚卸し対象外**。「既存資産の全棚卸し」claim が成立しない。

### C. 上流ソースの確定性

8. **UT-02: リポジトリ正本が BLOCKED/pending 扱いの事項を確定表記**（git-authority-receipt 未受領状態の無視）。
9. **（GitHub 照合・本監査で機械確定）ref 監査の stale**: `inventory/ut-tdd-ref-audit.yaml` は 2026-07-15 の main SHA `86b581c1` に固定だが、現 main は **81 コミット / 12 PR 先行**（delegation routing PLAN-L7-255、drive-aware admission、doctor singleton lock、engine-swap G8 evidence contract、NFR verification foundation、mechanization PLAN L7-445..447 を含む）。さらに監査日時点で存在した `work/l6-81-agent-registry-design`（main に無い 2 コミット保有）が監査対象に含まれず、「全 ref 検査」claim の反例。パッケージに再スナップショット/鮮度追随ポリシー自体が存在しない。

## Major 所見（37 件・要旨）

- **ランタイム境界**: Python への同一 DDL 直接 sqlite3 アクセス要件（HBR-ARCH-009）の AC が主張を実証しない（RB-04）。capability class closed list が schema/台帳に不在、tools 27 本を無条件温存（RB-05）。ADR-009 の Python worker セキュリティ制約（network default deny / DB path・credential・`.helix/` 非付与）が要件化されていない（RB-06）。脱Bun 完了条件が ADR-009 §5 の cutover activation（receipt / epoch / action-binding approval）を欠く（RB-07）。
- **Linux/マルチOS**: Node 22 互換 tier が ADR-009 の `>=24.15.0 <25` と矛盾（LNX-01）。WSL2 optional tier の欠落（LNX-02）。HNFR-PLAT-006 の source `HYBRID-UTIL` が未定義かつ traceability edge 欠落（LNX-03）。
- **capsule**: 既存 agent-guard（allowlist / 委譲ブリーフ 4 marker / fable apex 制限 / model family 一致）との整合関係が皆無（CAPSULE-01）。schema に scope.tools・budget.concurrency が無く prose と矛盾（02/03）。digest 正規化規約未定義（04）。適用範囲・移行手順・受入基準の不在（06）。
- **インフィニティループ**: state enum に rollback が無い（INF-02）。worker≠verifier 独立性が schema 未強制で AC-INF-02 を機械充足不能（INF-03）。rollback 証跡フィールド不在（INF-05）。self-audit-report に cycle_id 結線なし・schema なし（INF-06）。停止条件が自由文字列で計算可能でない（INF-07）。recipe→rule 昇格・finding→AC/test/detector 昇格の記録アーティファクト不在（INF-08）。
- **検出DB**: `detection_findings` に resolved_by / residual_risk 列が無く JSON schema と不整合（F1）。evidence 配列 vs evidence_digest 単一スカラーの対応未文書化（F2）。python_tools 29 本中 5 本が capability_families 分類から漏れ（F3）。
- **UT-TDD**: 監査 SHA・ブランチ集合の不一致（UT-01）。指定照合正本 TSV が当該 repo を含まず機械照合不能（UT-03）。
- **資産棚卸し**: hybrid archive の宣言ファイル名・SHA256（`fd885460…` / 715 files）が今回実物 `ハイブリッド設計ドキュメントv1-fixed.zip` と一致せず独立検証不能（AST-03）。source-disposition.yaml が Python 29 本中 17 本の採用決定行を欠く（AST-04）。
- **UWRS**: 実行形態（skill 注入 vs `helix` CLI 化）が未決・未記録（UWRS-01）。AC-ELICIT-07「derived views 同一 ID 共有」の検証機構なし — derived-requirements.schema.json の各ビューは `items:{type:object}` のみで ID 参照制約なし（UWRS-02）。「L4-L6 設計判断への降下」を受ける template/binding 不在（UWRS-03）。
- **内部整合**: 受入基準総数の本文記述が SSoT（111 件）と矛盾（IC-01）。README「Start here」リンク切れ + errata ファイル `19-…` の版識別が三系統に分裂（IC-02）。traceability の CHAT 由来 refined_into エッジが要件 sources と 24 件不一致 — HBR-DH-004〜020 等はエッジ完全欠落（IC-03）。decision-ledger（D-001〜D-014、全件 proposed）がどこからも参照されない孤立ファイル（IC-04）。
- **権威整合**: L0 charter 10 本柱（P0–P9）との対応表なし（AUTH-003）。全体 proposed のまま断定調「固定する」でPLAN 化・承認境界が不明（AUTH-004）。

## 反証により棄却した所見（2 件）

- INF-04（Python が promotion 判断を握るという指摘）— 04-target-architecture.md の記述は Node 側 validate を含み誤読。
- F5（disposition 台帳の正本二重化）— 03-existing-asset-inventory.md 自身が使い分けを宣言済み。

## 良好と確認された点

- チャット要件の取り込みは 96%（今回ゴール文の 8 項目すべて chat-requirements.yaml に存在し、ほぼ全数が catalog へ trace）。
- CHECKSUMS 182 件全一致、UWRS vendored copy はバイト同一で byte-pin 方針どおり。
- Linux-first の tier 骨格・禁止事項 AC、検出 DB の event-sourcing 構造、UWRS の question catalog / contract 群は設計素材として有効。

## 推奨アクション（優先順）

1. **PO 判断（escalation）**: 「Python Core を基準実装とする」v0.4.0 の路線 vs ADR-009（Node control plane / Python proposal-only）の対立解消。ADR-009 を維持するなら 01/02/04 章と ADR-000 の書き直し、覆すなら ADR-009 への正式 supersedes ADR + action-binding approval が必要（silent overwrite 禁止）。
2. 上流 UT-TDD の再スナップショット（現 main `1839fa71`）+ 鮮度追随ポリシー（observed_at からの delta audit 義務）の要件化。
3. 棚卸し範囲の拡張: 旧HELIX（ai-dev-kit-vscode）と自リポジトリ現行資産を source roles / disposition に追加。
4. インフィニティループを既存 `docs/governance/infinity-loop-*` 台帳の HIL-BR/HIL-FR ID 系へ接続（二重定義解消）し、schema の機械強制ギャップ（INF-02/03/05/06/07/08）を修正。
5. capsule 標準を `src/runtime/agent-guard-policy.ts` の既存機構と統合（包含関係の明文化 + schema 修正）。
6. 内部整合の機械修正（IC-01〜04、LNX-03、F1〜F3、AST-04）と traceability lint の再実行。
7. 取り込みは CLAUDE.md の PLAN 規則に従い successor PLAN として起票（本パッケージを docs/ 配下へ正式 import する場合）。

## 是正状況（2026-07-17 追記）

本監査の確定所見 59 件（critical 9 / major 37 / minor 13）すべてに対する是正仕様を
[hybrid-rebaseline-v0.5.0-remediation-delta.md](../migration/hybrid-rebaseline-v0.5.0-remediation-delta.md)
として起草済み（軸別に起草→敵対的検証→改訂 1 巡、ADR-009 準拠・機械検証付き）。
権威衝突（RB-01/02、AUTH-001/002）は ADR-009 側を正として是正した（ADR-009 を覆す選択は PO 専権のため不採用）。
delta は draft/proposed であり、decision confirmed 化・PLAN 起票は PO 承認境界。

**適用完了（同日追記）**: 是正 59 件を v0.4.0 コピーへ実適用し、軸別再検査で **59/59 全件解消**を確認
（適用 Workflow `wf_f4013e42-0fc`: 直列 12 軸適用 → 並列再検査 → 修補 0 件）。成果物は
`HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0.zip`（リポジトリ root、200 ファイル、
CHECKSUMS 全一致、全 YAML/JSON parse 合格、同梱バリデータ chat-trace-closure / chat-provenance 合格）。
decision-ledger は全件 proposed のまま維持（confirmed 化は PO 権限）。v0.5.0 は ADR-009 準拠の
承認候補 draft であり、正式採用（docs への取り込み・PLAN 化）は PO 承認を要する。

**権威衝突の最終裁定（同日追記・PO 委任）**: PO 指示「技術的にどちらが優位かで決めろ」（2026-07-17
チャット）を受け、監査比較により **ADR-010**（`docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md`）
を裁定・起草した。Python = 意味コアの恒久正本（TS 再実装義務・proposal-only 呼称を廃止）、
Node = `harness.db`/Git への単一 commit 境界のみ維持（multi-runtime 並行運用の直列化点）。
v0.5.0 の該当文言（01/02 章、HBR-CORE-001、HBR-ARCH-009、AC-CORE-01、08 章、decision-ledger D-016=confirmed）
を ADR-010 準拠へ更新し、zip を再生成済み（200 ファイル、CHECKSUMS 全一致、同梱バリデータ合格）。

## 再監査（2026-07-18、PO 指示「要件定義を再監査すること」）

ADR-010 反映後の v0.5.0 を 10 軸・フレッシュアイで再監査（Workflow `wf_452d88b3-fd2`:
finder 10 + 敵対的検証 26、計 36 エージェント。全 critical/major 所見を独立検証、反証棄却 1 件）。

**判定: 現状の v0.5.0 は未だ承認不能 — 確定所見 critical 2 / major 23 / minor 11。**
主因は (a) ADR-010 の追従が中核 4 ファイルで止まり周辺へ波及していない「片面適用」、
(b) 前回是正の適用エージェントが持ち込んだ二次的不整合。

- **critical**: SRC-FRESH-01（hybrid archive 正本 sha256/filename の二重宣言が未収束）、
  AUTH-REPO-01（01 章の同一節内に ADR-010『同格』原則と矛盾する旧従属フレーミングが残存）。
- **major の代表**: HBR-ARCH-014/AC-SEC-PY-01 の旧称残存（F1）、02 章構造図の Node 上位残存（F2）、
  integration/python-node-boundary.md と design-harness/python-node-mapping.md が自己規定の
  「ADR 改定時は同一 PLAN で追補必須」を果たしていない（F3）、ADR-000 の reject→TS 再実装文言残存（RC-1）、
  bulk TS 再実装 PO 承認の検証手段未定義（RC-2）、traceability に ADR-010 エッジ皆無（RC-3）、
  AC-TRACE-02 孤児化・edges 件数 286 vs 333 不一致・report 内部矛盾（IC-1..4）、README v0.4.0 表記（IC-5）、
  infinity-loop example の schema 違反（INF-AUDIT-01）、capsule テンプレートの意図的 fail 安全策が
  実際には valid で機能せず（CAPSULE-TMPL-01）、D-009 と D-016 の呼称矛盾（F4/UWRS-01）、
  08 章 Python read-only query 記述と DB path 非付与の衝突（DETDB-01）、resolved_by/status 整合の
  DB 層未強制（DETDB-02）、台帳間 UT-TDD pin 不同期 86b581c1 vs 1839fa71（SRC-FRESH-02）、
  HBR-ARCH-003 の Node 22 残存（LNX-AUDIT-01）、L0–L14 表の要件 ID 逆引き不能・Scrum S0–S4
  バインド未定義（layers-scrum F1/F2）、ADR-009 本体への双方向 back-reference 欠如（AUTH-REPO-03）、
  D-016 委任根拠の恒久記録不足（AUTH-REPO-04）。

是正は v0.5.1 デルタとして別途実施する（本再監査は判定まで）。

## v0.5.1 是正完了（2026-07-18 追記）

Codex 起票の `docs/governance/generated/v051-remediation-finding-ledger.yaml`（30 finding）を入力に、
是正 Workflow `wf_b6547a36-96d`（9 軸直列適用 → 29 件並列再検証）＋手動追修正で **全 30 件を解消**。
再検証で 10 件が未解消と判明（authority 軸の classifier 一時ブロック 4 件、MANIFEST 版数系 3 件、
検証ロジック不足 3 件）したため個別修正し、機械オラクルで最終確認した:

- `scripts/verify-no-bulk-ts.py` PASS — AC-CORE-04 を実 schema（decision enum）と baseline 採用 24 ファイル
  保護方式で再定義。適用中にオラクルが台帳の reject 5 件（fix_names/package/selftest/style/util）の
  ADR-009 時代 rationale を検出し、ADR-010 準拠（実行境界責務・意味コア非該当）へ再定義。
- `scripts/verify-adr-trace.py` PASS — ADR sources↔trace edge 双方向 18/18（欠落していた
  ADR-009→HBR-CORE-001 edge を補完）。
- `regenerate-validation-report.py --check` up-to-date（version=0.5.1、requirements=169 / AC=119 自己整合）。
- `check-chat-trace-closure.py` PASS（154 組不一致 0）。
- detection_findings の CHECK 制約を sqlite3 実 INSERT で検証（resolved に residual_risk 必須等、
  不正組合せ REJECT を確認）。
- リポジトリ側: ADR-009 に `superseded_by`（ADR-010）back-reference、D-016 委任裁定を harness memory
  `harness:adr-010-runtime-authority-ruling` へ恒久記録、ledger 全行 resolved 化。

成果物: **`HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.1.zip`**（206 ファイル、CHECKSUMS 全一致、
YAML/JSON parse エラー 0）。**監査判定: v0.5.1 は既知の確定所見ゼロの承認候補**（正式採用の
confirmed 化は従来どおり PO 承認境界）。

## 証跡

- Workflow run: `wf_11095bcf-712`（54 エージェント、3.27M tokens、1,002 tool calls）。逐次結果: セッション transcript `subagents/workflows/wf_11095bcf-712/journal.jsonl`
- GitHub 照合: `gh api` による pin SHA `86b581c1` vs main `1839fa71` compare（ahead 81 / behind 0）、branch 一覧、merged PR 一覧（2026-07-15T12:00Z 以降 12 件）
- review evidence 区分: `intra_runtime_subagent`（Claude 内 finder/verifier 分離。cross-runtime 判定は未実施）
