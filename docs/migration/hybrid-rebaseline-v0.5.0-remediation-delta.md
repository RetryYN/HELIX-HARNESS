# REBASELINE v0.5.0 要件是正デルタ（フルチェック所見 59 件の是正仕様）

- 起点: [フルチェック監査](../../../governance/hybrid-rebaseline-v0.4.0-fullcheck-audit-2026-07-17.md)（2026-07-17、critical 9 / major 37 / minor 13 のうち反証棄却を除く 59 件）
- 是正方針: リポジトリ正本 precedence（CLAUDE.md「仕組み > 個別機能」）に従い、**ADR-009（accepted）準拠へ是正**する。ADR-009 を覆す是正は一切含まない。
- 本書の位置付け: v0.4.0 パッケージへ適用する **change-delta 仕様（draft, status=proposed）**。各是正は「そのまま採録可能な修正後テキスト + 機械検証手段」で構成する。decision の confirmed 化・パッケージ実ファイルへの適用・PLAN 起票は PO 承認境界（charter §3: L3 要件は承認のみ人）。
- 検証プロセス: 軸ごとに起草エージェント → 敵対的検証エージェント（ADR-009 適合・所見解消・機械検証実行可能性の 3 判定）→ 不合格分の改訂 1 巡。改訂反映済みの項は status=改訂済 と明記（再検証は適用時の lint/doctor gate で行う）。

## サマリ

| 軸 | 是正数 | 検証初回合格 | 改訂反映 |
|---|---|---|---|
| 脱Bun・TS/Node+Python境界 | 8 | 5 | 3 |
| サブエージェントHARNESS保持標準 | 6 | 2 | 4 |
| 自己改善+自己監査ヘリックスループ | 9 | 3 | 6 |
| チャット内全要件の網羅 | 1 | 0 | 1 |
| ハイブリッド設計コアエンジン+検出DB | 5 | 1 | 4 |
| UT-TDD_AGENT-HARNESS全検査抽出 | 4 | 2 | 2 |
| 既存資産の全棚卸し | 5 | 5 | 0 |
| UWRS判断コアエンジン活用 | 4 | 3 | 1 |
| パッケージ内部整合 | 4 | 2 | 2 |
| リポジトリ正本との権威整合 | 5 | 5 | 0 |
| Linux中心マルチOS | 5 | 4 | 1 |
| GitHub 上流鮮度・網羅（本監査で機械確定） | 3 | 2 | 1 |


## 軸: 脱Bun・TS/Node+Python境界 (`runtime-boundary`)

### RB-01 [critical] パッケージの権威順序がADR-009のNode優位/Python従属関係を逆転させている
- 是正種別: 権威順序修正 / status: 検証合格
- 対象: `01-authority-and-source-order.md#規範precedence`

`01-authority-and-source-order.md` の「規範precedence」を次の順序へ修正する。
1. 人が承認したHELIXのL0/L1/L2/L3要求・判断記録、および確定ADR（ADR-009-node-python-linux-runtime.md、ADR-001-helix-harness-redesign-and-language.md）
2. TypeScript / Node runtime contract（本パッケージのHELIX-native Design HARNESS契約・schema・gateを含む。ADR-009により、schema／lineage／digest／lease-fence／policyを再検証し唯一のtransaction writerとしてcommitするcontrol planeである）
3. HELIX Hybrid Python Coreのpinned sourceと承認済み部分修正台帳（ADR-009のclosed capability class（source_atomization／document_engine／detector／product_data／analysis）配下のproposal-only workerとしてのみ従属採用する。DB path・credential・repository・`.helix/`を付与しない）
4. Workflow Requirements Skill v1.1 adapter contract
5. Detection DBのevent / evidence / projection
6. generated docs / views / reports

あわせて「禁止」節に以下を追記する。「Python pinned sourceまたは部分修正台帳を、ADR-009が定めるNode control plane（唯一のtransaction writer）より上位の規範として扱うこと」「ADR-009 の権威をこの資料内のprecedenceで暗黙に反転させること」。

**機械検証**: grep -n '規範precedence' -A 8 01-authority-and-source-order.md の順序で「TypeScript / Node runtime contract」が「HELIX Hybrid Python Coreのpinned source」より上位（番号が小さい）に出現することをテキスト順序検査で機械確認する。

### RB-02 [critical] Pythonをコアエンジンの『基準実装』と規定し、ADR-009のbulk port禁止と正面衝突している
- 是正種別: 要件修正 / status: 改訂済（検証指摘反映）
- 対象: `02-core-engine-definition.md`, `requirements/requirements-catalog.yaml#HBR-CORE-001`, `requirements/acceptance-criteria.yaml#AC-CORE-01`

対象を `02-core-engine-definition.md` 単体から、機械追跡される正本要件・受入基準を含む3ファイル同時修正へ拡張する。

(1) `02-core-engine-definition.md` 冒頭の「HELIXコアエンジンの基準実装は、ハイブリッド設計ドキュメントv1に同梱された`hybrid-docgen/tools/*.py`である。全面再実装せず、元pathを維持した部分修正・wrap・内部splitで利用する。」を次へ置換する。「HELIXコアエンジンの基準実装（control plane・唯一のtransaction writer）はTypeScript/Node runtime contractである。`hybrid-docgen/tools/*.py`は、ADR-009のclosed capability class（source_atomization／document_engine／detector／product_data／analysis）に分類できたbehavior atom単位でのみ、versioned contract配下のproposal-only Python workerとして従属採用する。capability classに分類できないファイル・機能はreject対象とし、当該ロジックはTS/Nodeで再実装する。全面のpath維持・bulk wrap・bulk portは禁止する（ADR-009 bulk port禁止、CLAUDE.md「旧HELIXの機能ロジックはTS/Nodeで再実装し…Python proposal workerへ隔離する」）。」続く「Design HARNESSの位置」の階層図のうち`Hybrid Python Core`をルートに置く構造を、`TypeScript / Node control plane`をルートとし配下に`Python proposal workers（closed capability class別）`を子として持つ構造へ修正し、`activation.py`等の個別module責務列挙は capability_class と versioned contract IDを併記する形へ修正する。

(2) `requirements/requirements-catalog.yaml` の `HBR-CORE-001`（area=core, priority=must）の `statement` を次へ置換する（idは変更しない。requirement修正のためID再採番は不要）。「HELIXコアエンジンの基準実装（control plane・唯一のtransaction writer）はTypeScript/Node runtime contractである。ハイブリッド設計ドキュメントv1同梱の既存Python実装は、ADR-009のclosed capability class（source_atomization／document_engine／detector／product_data／analysis）に分類できたbehavior atom単位でのみ、versioned contract配下のproposal-only Python workerとして従属採用する。capability classに分類できない機能はreject・TS/Node再実装対象とし、全面再実装の回避を理由にbulk port・bulk wrapを行わない。」`sources` へ `ADR-009` を追加する。

(3) `requirements/acceptance-criteria.yaml` の `AC-CORE-01`（title: Python core identity）の `criterion` を次へ置換する。「Given the hybrid archive, inventory classifies each existing Python source file into an ADR-009 closed capability class (source_atomization/document_engine/detector/product_data/analysis) or marks it reject-for-TS-reimplementation; inventory does not treat the full existing Python tree as the baseline core, and does not perform bulk wrap/bulk port of unclassified files.」

**機械検証**: (a) `schemas/python-partial-modification.schema.json` の各file要素に `capability_class`（source_atomization|document_engine|detector|product_data|analysis のenumで必須）フィールドを追加し、`02-core-engine-definition.md` 列挙済みmoduleが全て該当ledger（`inventory/python-partial-modification-ledger.yaml`）で `capability_class` を持つことをスキーマバリデーションで機械確認する。(b) `requirements-catalog.yaml` の `HBR-CORE-001.statement` に旧表現「全面再実装せず…保持」のみを残す文字列が存在しないこと、および `sources` に `ADR-009` を含むことをgrep/parseで検査し、`acceptance-criteria.yaml` の `AC-CORE-01.criterion` が "does not substitute a greenfield implementation" 単文ではなく capability_class 分類・reject条件を含む文へ更新されていることを検査する回帰テストをharness-check gateへ追加する。

### RB-03 [critical] パッケージ全体（対象5ファイル含む）にADR-009への参照が一件も無い
- 是正種別: 要件修正 / status: 検証合格
- 対象: `requirements/requirements-catalog.yaml`, `requirements/acceptance-criteria.yaml`, `requirements/traceability.yaml`, `02-core-engine-definition.md`, `integration/python-node-boundary.md`, `design-harness/python-node-mapping.md`, `inventory/python-partial-modification-ledger.yaml`, `schemas/python-partial-modification.schema.json`

area=architecture の全requirement（HBR-ARCH-002, 003, 005〜012 を含む）の`sources`配列に `ADR-009` を必須追加する（既存の`CHAT-011`/`UT-PACKAGE`/`UT-STATE-DB`等は残してよいが、architecture要件は必ずADR-009を直接引用する）。`requirements/traceability.yaml` に ADR-009 → HBR-ARCH-* の逆引きjoin（`adr_id: ADR-009` に対する `derived_requirement_ids` 一覧）を追加する。`schemas/python-partial-modification.schema.json` の top-level `policy` オブジェクトへ `authority_source` フィールド（`const: "ADR-009-node-python-linux-runtime"`）を必須追加し、`inventory/python-partial-modification-ledger.yaml` のpolicyブロックにも同値を明記する。`02-core-engine-definition.md`・`integration/python-node-boundary.md`・`design-harness/python-node-mapping.md` の冒頭にADR-009への参照行（例:「本章の境界定義はADR-009-node-python-linux-runtime.md（accepted）に従属する。ADR-009が改定された場合、本章とHBR-ARCH-*群は同一PLANで追補されなければならない。」）を追加する。

**機械検証**: `grep -rl 'ADR-009' requirements/requirements-catalog.yaml integration/python-node-boundary.md design-harness/python-node-mapping.md 02-core-engine-definition.md inventory/python-partial-modification-ledger.yaml` が対象全ファイルをヒットすることをCIのdoctor相当gateで機械検査し、area=architectureの各requirementの`sources`にADR-009が含まれることをYAMLパーサでの必須フィールド検査として実装する。

### RB-04 [major] PythonにDB同一DDLへの直接sqlite3アクセスを許す要件があり、検証ACがその主張を実証していない
- 是正種別: 要件修正 / status: 検証合格
- 対象: `HBR-ARCH-009`, `AC-DB-01`

`requirements/requirements-catalog.yaml` の HBR-ARCH-009 の statement を次へ修正する。「Python proposal workerはharness.dbファイルへ直接アクセスしない。DB path・credential・repository・`.helix/`はPython workerへ渡さず、Python側はcapability class別のversioned proposal schema（JSON/NDJSON）でNodeへ提案データを送出するのみとする。Node側がschema・lineage・digest・lease/fence・policyを再検証し、唯一のtransaction writerとしてharness.dbへcommitする（ADR-009）。」タイトルを「Python sqlite3」から「Python proposal-onlyデータ受け渡し」へ変更する。priorityはmustのまま維持し、sourcesに`ADR-009`を追加する。
`requirements/acceptance-criteria.yaml` の AC-DB-01 の criterion に、Python直接write禁止の機械検証観点を追記する。「Authored and observed records are distinct; DB rebuild never writes authored documents; かつ Python workerプロセスへDB pathまたは認証情報が引数・環境変数・設定ファイルのいずれの経路でも渡されていないことを、Python worker起動コマンドラインおよび環境変数のスナップショット検査で確認する。」

**機械検証**: Python worker起動を担うNode adapterの単体テストで、生成されるsubprocess引数・env varにDBファイルパス・接続文字列・credentialトークンが含まれないことをアサートするテスト（例: tests/python-worker-invocation.test.ts の該当ケース）を新設し、harness.dbへの実writeがNode側コード経路のみに限定されることをprojection-writer.test.tsの既存カバレッジで裏付ける。

### RB-05 [major] capability class閉リストの概念がschema/ledger/要件のどこにも存在せず、既存tools/*.py全27本をpatch/wrap/splitで丸ごと温存している
- 是正種別: schema修正 / status: 検証合格
- 対象: `schemas/python-partial-modification.schema.json`, `inventory/python-partial-modification-ledger.yaml`

`schemas/python-partial-modification.schema.json` の `files[]` items の `required` 配列へ `capability_class` を追加し、`properties.files.items.properties` に次を追加する。
```json
"capability_class": {
  "type": "string",
  "enum": ["source_atomization", "document_engine", "detector", "product_data", "analysis"]
}
```
さらに `policy` オブジェクトへ `capability_class_closed_list: {"const": true}` を必須追加し、closed listがADR-009と同一であることを固定する。`decision` が `reuse_as_is`/`patch`/`wrap`/`split` のいずれかであるファイルは `capability_class` のenumいずれかに分類できなければならず、分類不能な既存ファイルは `decision: reject` へ変更し、置換先（TS/Node再実装先pathまたは棄却理由）を `rationale` に明記する制約をschema記述（`if/then`）で追加する。
`inventory/python-partial-modification-ledger.yaml` の既存27ファイルすべてに `capability_class` を追記する棚卸しを行い、分類不能なファイル（CLI直結スクリプト・汎用ユーティリティ等でclosed listに当てはまらないもの）は `decision: reject` へ変更する。

**機械検証**: 更新後の python-partial-modification.schema.json に対して inventory/python-partial-modification-ledger.yaml をJSON Schemaバリデータ（ajv等）で検証し、全27ファイルエントリが capability_class 必須項目を満たすこと、かつ enum外の値でvalidationがfailすることをテストで確認する。

### RB-06 [major] ADR-009のPython workerセキュリティ制約(network default deny / DB path・credential・.helix非付与)が要件化されていない
- 是正種別: AC追加修正 / status: 改訂済（検証指摘反映）
- 対象: `requirements/requirements-catalog.yaml`, `requirements/acceptance-criteria.yaml`, `requirements/traceability.yaml`

既存 `HBR-ARCH-013`（title: Generated staging promotion, sources: CHAT-018, verification: AC-PATCH-08）と衝突しないよう、新規requirement IDを `HBR-ARCH-013` から `HBR-ARCH-014` へ変更した上で `requirements/requirements-catalog.yaml` の area=architecture へ追加する。
```yaml
- id: HBR-ARCH-014
  area: architecture
  title: Python worker sandbox境界
  statement: Python proposal workerはnetwork default denyで起動し、DB path・credential・repository実体・`.helix/`ディレクトリを引数・環境変数・設定ファイルいずれの経路でも付与しない。Python出力のcommand文字列・SQL文・絶対パス・生成codeをNodeは実行せず、proposal bytesをNode側でschema／digest／authority policyにより再検証してから採否を決定する。
  priority: must
  sources:
  - ADR-009
  verification:
  - AC-SEC-PY-01
  status: proposed_rebaseline
```
`requirements/acceptance-criteria.yaml` へ対応ACを追加する（`AC-SEC-PY-01` は既存 `AC-SEC-01`〜`AC-SEC-04` と非衝突の新規ID）。
```yaml
- id: AC-SEC-PY-01
  title: Python worker sandbox
  criterion: Python worker起動時のnetwork namespace/firewall設定がoutbound denyであること、起動引数・環境変数にDB接続文字列・credential・`.helix/`絶対パスが含まれないこと、Nodeが受理したproposal出力がexec/eval/subprocessへ渡らずschema検証経由でのみ消費されることを自動テストで確認する。
  status: proposed
```
`requirements/traceability.yaml` へ `from: ADR-009 / to: HBR-ARCH-014 / type: refined_into` と `from: HBR-ARCH-014 / to: AC-SEC-PY-01 / type: verified_by` を追加し、既存 `HBR-ARCH-013`→`AC-PATCH-08`（Generated staging promotion）のエッジには一切触れない。

**機械検証**: AC-SEC-PY-01 に対応するNodeテスト（例: tests/python-worker-sandbox.test.ts）で、(1) worker起動コマンド生成関数の出力引数・envにDB path/credentialが含まれないことのアサーション、(2) network default denyの起動設定（例: seccomp/network namespace設定やsandboxフラグ）が付与されていることのアサーション、(3) Python proposal出力を直接execする経路が存在しないことの静的検査（grepまたはASTベースのlint rule）を実装し、harness-check gateへ組み込む。加えて `requirements-catalog.yaml` に `HBR-ARCH-013` と `HBR-ARCH-014` が両方存在し重複しないこと、`acceptance-criteria.yaml` に `AC-SEC-PY-01` が既存`AC-SEC-01..04`と重複しないことをyaml一意性チェック（id重複検出スクリプト）で機械確認する。

### RB-07 [major] 脱Bun完了条件がADR-009 §5のcutover activation機構(receipt/epoch/action-binding approval)を欠いたまま『クリーンチェックアウトのスモーク』に矮小化されている
- 是正種別: AC追加修正 / status: 検証合格
- 対象: `HBR-ARCH-002`, `HBR-ARCH-008`, `HBR-ARCH-011`, `AC-ARCH-02`

`requirements/requirements-catalog.yaml` の HBR-ARCH-002（脱Bun）・HBR-ARCH-008（SQLite Node primary）・HBR-ARCH-011（Node test execution）の各statementへ次の従属条件文を追記する。「本要件の充足（Bun除去のactive切替）は、ADR-009 §5が定めるforward activation契約（`plan/execute/commit/reconcileNodeCutover`、exclusive writer epoch、expected DB revision、authority pointer／hook／package／lock／CI／DB driverのfixed write set、action-binding approval、`CutoverActivationReceipt`）がHDS-HIL-13としてRedesignされ、当該receiptが発行されるまでimplementation preflightをblockする。receipt発行前はBun経路をactive execution authorityかつknown-good rollback pointとして維持する。」
`requirements/acceptance-criteria.yaml` の AC-ARCH-02 の criterion を次へ拡張する。「A clean Linux checkout completes install, build, typecheck, test, check and CLI smoke without Bun installed or referenced in required scripts, **かつ** 有効な `CutoverActivationReceipt`（exclusive writer epoch・expected DB revision・fixed write setを含む）が発行され、action-binding approvalの記録と紐づいていることを、cutover活性化コマンドの実行結果（受入済みreceipt構造体）で確認する。receipt未発行の状態でクリーンチェックアウトのスモークが通過しても、本ACは未充足（proposed のまま）とする。」

**機械検証**: PLAN-M-01-cutover-backfill.md 系のcutover実行コマンド（`plan/execute/commit/reconcileNodeCutover`相当）が発行するCutoverActivationReceiptの構造（epoch・expected DB revision・fixed write set・approval記録を含むJSON）をschemaバリデーションし、receipt欠如時にAC-ARCH-02判定コマンドがfailすることをtests/projection-writer.test.ts等の既存cutover回帰テスト群に統合して機械確認する。

### RB-08 [minor] レガシーPython CLI(`python3 tools/<tool>.py`)の互換維持に明確な終了条件・terminal receiptとの紐付けが無い
- 是正種別: 要件修正 / status: 改訂済（検証指摘反映）
- 対象: `HBR-ARCH-006`, `requirements/acceptance-criteria.yaml`, `requirements/traceability.yaml`, `integration/python-node-boundary.md`

`requirements/requirements-catalog.yaml` の `HBR-ARCH-006` のstatementへ終了条件を追記する。「既存CLIを一括廃止しない。ただしレガシー`python3 tools/<tool>.py ...`互換維持は、ADR-009 §5のterminal cutover receipt（Bun known-goodがactive execution graph外の固定commit／content-addressed artifact／DB backupとして保存された時点）発行までの時限措置とし、terminal receipt発行後はレガシーCLIをhistorical参照allowlistへ降格し、通常運用のcapability経路から除外する。」同requirementの `verification` 配列へ既存 `AC-ARCH-04` を残したまま `AC-ARCH-07` を追加する。
`integration/python-node-boundary.md` の「Compatibility strategy」節へ同旨を追記し、「互換期間の終了条件 = ADR-009 terminal cutover receipt発行」であることを明記する。
既存 `AC-ARCH-05`（title: Ports and adapters）および直近の最終ID `AC-ARCH-06`（title: Package layout）と衝突しないよう、新規ACのIDを `AC-ARCH-05` から `AC-ARCH-07` へ変更した上で `requirements/acceptance-criteria.yaml` へ追加する。
```yaml
- id: AC-ARCH-07
  title: Legacy CLI sunset
  criterion: terminal cutover receipt発行後、レガシーpython3 tools/<tool>.py呼び出しがCIの必須経路（install/build/typecheck/test/check/CLI smoke）から除去され、historical参照allowlistにのみ残存することを確認する。
  status: proposed
```
`requirements/traceability.yaml` へ `from: HBR-ARCH-006 / to: AC-ARCH-07 / type: verified_by` を追加し、既存 `HBR-ARCH-005`→`HBR-ARCH-006`、`HBR-ARCH-006`→`AC-ARCH-04` のエッジおよび既存 `AC-ARCH-05`（Ports and adapters）に紐づく既存エッジには一切触れない。

**機械検証**: terminal cutover receipt発行前後でCI必須ジョブ定義（package.json scripts / CI workflow yaml）を差分比較し、receipt発行後のコミットでレガシーCLI呼び出しが必須経路のスクリプトから消えていることをgrep/diffベースの回帰チェック（AC-ARCH-07）として自動化する。加えて `acceptance-criteria.yaml` に `AC-ARCH-05`（Ports and adapters）と `AC-ARCH-07`（Legacy CLI sunset）が別IDとして共存し重複しないこと、`requirements-catalog.yaml` の `HBR-ARCH-006.verification` に `AC-ARCH-04` と `AC-ARCH-07` が両方列挙されることをyaml一意性・参照整合チェックスクリプトで機械確認する。


## 軸: サブエージェントHARNESS保持標準 (`capsule`)

### CAPSULE-01 [major] 既存 agent-guard 機構（allowlist / 委譲ブリーフ4marker / fable apex制限 / model family一致）との整合・包含関係が皆無
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `HBR-AGENT-002`, `HBR-AGENT-016`, `AC-AGENT-01`, `AC-AGENT-10`, `schemas/harness-capsule.schema.json#scope`, `07-subagent-harness-capsule.md`, `integration/subagent-harness-standard.md`, `requirements/acceptance-criteria.yaml`

schemas/harness-capsule.schema.json の scope に既存 agent-guard 機構（正本 src/runtime/agent-guard-policy.ts）へ紐付ける必須フィールドを追加する: `subagent_type`（string, minLength:1）、`runtime`（enum: claude/codex）、`is_fable_apex_subagent`（boolean, 派生フラグ）。scope.required に subagent_type / runtime / is_fable_apex_subagent の3つを追加する（additionalProperties:false のまま properties に列挙）。整合条件は prose ではなく scope オブジェクト直下に `allOf` の JSON Schema if/then/else 3本として機械強制する: (a) `if scope.runtime.const=='claude'` `then subagent_type.enum` = SUBAGENT_ALLOWLIST 17件（advisor-fable, fe-lead, fe-ui, pmo-sonnet, pmo-haiku, pmo-project-explorer, pmo-project-scout, pmo-tech-docs, pmo-tech-fork, pmo-tech-news, refactor-scout, pdm-tech-innovation, pdm-marketing-innovation, pdm-innovation-manager, code-reviewer, security-audit, qa-test）。(b) `if scope.runtime.const=='codex'` `then subagent_type.enum` = CODEX_AGENT_TYPE_ALLOWLIST 3件（default, explorer, worker）。(c) `if scope.subagent_type.const=='advisor-fable'` `then is_fable_apex_subagent.const=true` `else is_fable_apex_subagent.const=false`。これにより is_fable_apex_subagent=true を許可されるのは runtime=claude かつ subagent_type='advisor-fable'（FABLE_APEX_SUBAGENTS）の場合に限られ、かつ subagent_type='advisor-fable' のときに false を書くことも拒否される（真偽両方向を機械強制）。07-subagent-harness-capsule.md と integration/subagent-harness-standard.md の『必須保持項目』に『subagent_type/runtime（既存 agent-guard allowlist との対応）と is_fable_apex_subagent（advisor-fable のみ true）』を明記する。HBR-AGENT-002.statement は CAPSULE-02 の是正と合意した下記の単一の最終文字列に統一する（CAPSULE-01・CAPSULE-02 の双方がこの同一文字列を書き込み、適用順序に依存させない）: 『capsuleはrepo/ref/commit/PLAN/workflow/state、allowed paths/actions/tools、denied paths/tools、および既存 agent-guard allowlist（src/runtime/agent-guard-policy.ts の SUBAGENT_ALLOWLIST / CODEX_AGENT_TYPE_ALLOWLIST）と整合する subagent_type/runtime を保持する。』さらに『capsule 発行時に Claude Agent prompt へ委譲ブリーフ4marker（【objective】/【output format】/【tool guidance】/【task boundary】、正本 DELEGATION_BRIEF_MARKERS）を含めることを capsule.task と scope の対応関係として要件化する』旨を integration/subagent-harness-standard.md の『必須保持項目』末尾へ追記する新要件 HBR-AGENT-016（Agent-guard alignment、must、sources: CHAT-013 と src/runtime/agent-guard-policy.ts、verification: AC-AGENT-01, AC-AGENT-10 新設）を requirements-catalog.yaml に追加する。AC-AGENT-10 の ID は本 finding（HBR-AGENT-016）専用として確保し、CAPSULE-06 が新設する HBR-AGENT-018 の verification は AC-AGENT-11 を用いる（CAPSULE-06 側の是正で採番変更済み、既存最大 AC-AGENT-09 からの次番衝突を解消）。requirements/acceptance-criteria.yaml に AC-AGENT-10（title: Agent-guard alignment, criterion: capsule.scope.subagent_type/runtime のスキーマ if/then 検証と src/runtime/agent-guard-policy.ts の SUBAGENT_ALLOWLIST/CODEX_AGENT_TYPE_ALLOWLIST/FABLE_APEX_SUBAGENTS が齟齬なく一致し、is_fable_apex_subagent の true/false 双方向の誤り fixture が ValidationError になる, status: proposed）を追加する。

**機械検証**: python3 -c "import json,jsonschema; jsonschema.Draft202012Validator(json.load(open('schemas/harness-capsule.schema.json'))).validate(json.load(open('examples/subagent-harness-capsule.example.json')))" が pass すること。加えて4本の固定 fixture テストを新設する: (1) subagent_type='advisor-fable', runtime='claude', is_fable_apex_subagent=true → pass。(2) subagent_type='advisor-fable', runtime='claude', is_fable_apex_subagent=false → ValidationError（fable subagent で false を書けない方向）。(3) subagent_type='fe-lead'（非fable）, runtime='claude', is_fable_apex_subagent=true → ValidationError（allowlist外subagentがfable専用フラグを僭称できない方向、従来欠落していた検証）。(4) subagent_type='worker', runtime='claude'（Codex専用値をClaude runtimeで使用） → ValidationError。この4件を tests 配下に固定し、AC-AGENT-10 の conformance に組み込む。

### CAPSULE-02 [major] schema.scope に 'tools' 境界フィールドが無く、prose/requirementsの明記と矛盾
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `HBR-AGENT-002`, `schemas/harness-capsule.schema.json#scope`, `examples/subagent-harness-capsule.example.json`, `templates/subagent-harness-capsule.template.yaml`

schemas/harness-capsule.schema.json の scope に `allowed_tools`（array of string、minItems:0）と `denied_tools`（array of string、既定で少なくとも空配列許容）を追加し、required に `allowed_tools` を追加する（denied_tools は任意可、既定 [] を examples/templates で明示）。additionalProperties:false のままフィールドを列挙に加える。examples/subagent-harness-capsule.example.json と templates/subagent-harness-capsule.template.yaml の両方に allowed_tools（例: ["Read","Bash","Grep"]）と denied_tools（例: []）を追記し、両ファイルが新スキーマに対して valid であることを保証する。HBR-AGENT-002.statement は CAPSULE-01 の是正と合意した下記の単一の最終文字列に統一する（CAPSULE-01・CAPSULE-02 の双方がこの同一文字列を書き込み、適用順序に依存させない。片方だけを適用した場合は残るフィールド反映漏れとして doctor で検出可能な状態にする）: 『capsuleはrepo/ref/commit/PLAN/workflow/state、allowed paths/actions/tools、denied paths/tools、および既存 agent-guard allowlist（src/runtime/agent-guard-policy.ts の SUBAGENT_ALLOWLIST / CODEX_AGENT_TYPE_ALLOWLIST）と整合する subagent_type/runtime を保持する。』

**機械検証**: python3 -c "import json,jsonschema; s=json.load(open('schemas/harness-capsule.schema.json')); jsonschema.Draft202012Validator(s).validate(json.load(open('examples/subagent-harness-capsule.example.json')))" が scope.allowed_tools/denied_tools 追加後も pass し、allowed_tools 欠落 fixture が ValidationError になることを固定テスト化する。加えて HBR-AGENT-002.statement の最終文字列が CAPSULE-01 是正の文字列と byte-identical であることを requirements-catalog.yaml の当該 statement 値に対する文字列等価アサーションで固定する（diff 0 を機械検証、prose 一致claim禁止）。

### CAPSULE-03 [major] schema.budget に 'concurrency' が無く、requirements-catalog の記述と矛盾
- 是正種別: schema修正 / status: 検証合格
- 対象: `HBR-AGENT-005`, `schemas/harness-capsule.schema.json#budget`, `examples/subagent-harness-capsule.example.json`, `templates/subagent-harness-capsule.template.yaml`

schemas/harness-capsule.schema.json の budget に `max_concurrency`（integer, minimum:1, 既定 1）を追加し、required に含める（token/time/cost/retry と並ぶ resource budget の一項目として、requirements-catalog.yaml HBR-AGENT-005 の『model、effort、token/time/cost/concurrency/retry budget』と一致させる）。examples/subagent-harness-capsule.example.json と templates/subagent-harness-capsule.template.yaml の budget オブジェクトへ max_concurrency（例: 1）を追記する。HBR-AGENT-005 の statement はそのまま維持し、schema 側をこれに追随させる是正とする。

**機械検証**: python3 -c "import json,jsonschema; jsonschema.Draft202012Validator(json.load(open('schemas/harness-capsule.schema.json'))).validate(json.load(open('examples/subagent-harness-capsule.example.json')))" が budget.max_concurrency 追加後も pass し、budget.max_concurrency 欠落 fixture が required 違反で fail することを固定テスト化する。

### CAPSULE-04 [major] capsule_digest / context[].digest の canonicalization（正規化）規約が未定義
- 是正種別: 新規要件 / status: 改訂済（検証指摘反映）
- 対象: `HBR-AGENT-017`, `integration/subagent-harness-standard.md`, `07-subagent-harness-capsule.md`, `AC-AGENT-09`, `config/digest-canonicalization-inventory.json`

独立の RFC 8785 JCS 新設ではなく、本リポジトリに既に confirmed 済みの正本 docs/design/harness/L6-function-design/digest-canonicalization-authority.md（PLAN-L6-76、実装 src/runtime/digest.ts の canonicalJson/sha256Digest）へ bind する。新要件 HBR-AGENT-017（area: agent, title: Digest canonicalization, priority: must, sources: CHAT-013・digest-canonicalization-authority.md, verification: [AC-AGENT-01, AC-AGENT-09], status: proposed_rebaseline）を requirements-catalog.yaml に追加する。statement: 『capsule_digest および context[].digest は、正本 docs/design/harness/L6-function-design/digest-canonicalization-authority.md（実装 src/runtime/digest.ts）が定義する canonicalJson（object key 辞書順整列・配列順序維持・非finite number/undefined/function/symbol拒否）で正規化した capsule JSON の UTF-8 バイト列に対する sha256Digest（sha256:<64 lowercase hex>）とする。capsule_digest 計算時は capsule_digest フィールド自身の値を空文字列プレースホルダに置換してから canonicalJson・sha256Digest を適用し、算出後に実値を格納する。この digest 正規化は独立の新規実装を作らず、既存 canonicalJson/sha256Digest の唯一の実装（Node control plane、ADR-009 の唯一の transaction writer 原則に従う）を Claude adapter と Codex adapter の両 capsule 発行経路が共通 import として呼び出し、同一 capsule 入力（capsule_digest を空文字列にした状態）から byte-identical な正規化結果と同一 digest を再現することを conformance suite で機械検証する。』integration/subagent-harness-standard.md の『標準不変条件』2番目『Capsule digest不一致を拒否する』の直後に『正規化は digest-canonicalization-authority.md の canonicalJson/sha256Digest 契約に従い、capsule_digest 自己参照はプレースホルダ除外する』を追記する。07-subagent-harness-capsule.md の『source/context digests』項目にも同参照を追記する。capsule_digest/context digest の新規呼び出し箇所は config/digest-canonicalization-inventory.json（variant: prefixed_sha256, canonicalization: sorted-object-keys-array-order-preserved, citation: U-DIGEST-005）へ登録し、digest-canonicalization-authority.md の『移行inventory』手続きに従う。

**機械検証**: capsule 発行を行う Claude adapter 経路と Codex adapter 経路それぞれから canonicalJson/sha256Digest を呼び出す固定テストを新設し、両経路が src/runtime/digest.ts の同一 export を re-export/import しているだけであること（独自再実装が無いこと）を静的検査（例: import 経路を assert する grep ベースの lint テスト）で確認し、かつ同一 capsule fixture（capsule_digest を空文字列にした状態）から両経路が byte-identical な sha256:<hex> を出力することを比較する単体テストを AC-AGENT-09 の conformance suite に追加する。二重実装によるドリフトを避けるため、Node/Python 独立再実装比較ではなく単一実装の共有呼び出しであることの検証とする（ADR-009 の Node唯一 writer 原則に整合）。

### CAPSULE-06 [major] capsule 標準の適用範囲（全 subagent 種別）・移行手順・受入基準が具体化されていない
- 是正種別: AC追加修正 / status: 改訂済（検証指摘反映）
- 対象: `12-migration-roadmap.md#Slice 9`, `HBR-AGENT-001`, `HBR-AGENT-018`, `AC-AGENT-11`, `requirements/acceptance-criteria.yaml`

12-migration-roadmap.md の『Slice 9 — HARNESS Capsule / PR64 adoption』を以下へ拡充する。(1) 適用順序: まず Claude 側 fable apex 単独（advisor-fable）で capsule 発行を先行導入し conformance suite を安定させた後、Claude 側の残り16種（fe-lead, fe-ui, pmo-*, refactor-scout, pdm-*, code-reviewer, security-audit, qa-test）へ順次展開し、最後に Codex 側3種（default/explorer/worker）へ展開する段階適用順序を明記する。(2) 共存規定: Slice 0-8 の間（capsule 未実装）は既存 .claude/hooks/agent-guard.ts（SUBAGENT_ALLOWLIST / DELEGATION_BRIEF_MARKERS / FABLE_APEX_SUBAGENTS チェック）を唯一の正本 gate とし、capsule 導入後は capsule.scope.subagent_type/runtime のスキーマ整合チェック（HBR-AGENT-016）を agent-guard hook の追加検証として二重化せず統合する（capsule 発行前チェックは agent-guard が担い、capsule 内容の正当性は capsule schema/digest 検証が担う、責務分離を明記）。(3) ロールバック手順: capsule 発行が conformance suite を満たさない場合、当該 subagent_type の capsule 必須化フラグを individually disable し、既存 prompt-only 経路へ fallback できることをフラグ管理で明記する。新要件 HBR-AGENT-018（area: agent, title: Capsule rollout roster and rollback, priority: must, sources: CHAT-013, verification: [AC-AGENT-11 新設], status: proposed_rebaseline）を requirements-catalog.yaml に追加し、statement を『capsule 標準は Claude 17種 allowlist と Codex 3種 allowlist の全 subagent_type に対し、fable apex先行→Claude残り→Codexの段階順序で適用し、Slice 0-8 の共存下では既存 agent-guard hook を正本 gate とし、conformance suite 未達時は subagent_type 単位で capsule 必須化を無効化しprompt-only経路へfallbackできる。』とする。CAPSULE-01 是正が新設する HBR-AGENT-016 の verification は AC-AGENT-10（既に CAPSULE-01 側で予約済み）を用いるため、本 finding の HBR-AGENT-018 は次番の AC-AGENT-11 を採番する（既存最大 AC-AGENT-09 から HBR-AGENT-016=AC-AGENT-10、HBR-AGENT-018=AC-AGENT-11 の順で衝突なく採番する）。requirements/acceptance-criteria.yaml に AC-AGENT-11（title: Rollout roster coverage, criterion: SUBAGENT_ALLOWLIST(17件)+CODEX_AGENT_TYPE_ALLOWLIST(3件)計20件のrosterに対し、Slice 9のロールアウト順序表（fable apex→Claude残り16→Codex3）が全件を1件ずつカバーし欠落がないことを検証する, status: proposed）を追加する。

**機械検証**: 既存 SUBAGENT_ALLOWLIST（17件）+ CODEX_AGENT_TYPE_ALLOWLIST（3件）計20件の roster を列挙した fixture に対し、Slice 9 ロールアウト順序表（fable apex→Claude残り16→Codex3）が全件を1件ずつカバーし欠落なしであることを assert する新設テストを AC-AGENT-11 として固定する（AC-AGENT-10 は CAPSULE-01 の agent-guard alignment 検証専用として排他的に予約する）。

### CAPSULE-05 [minor] templates/subagent-harness-capsule.template.yaml がそのまま schema に対して invalid
- 是正種別: schema修正 / status: 検証合格
- 対象: `templates/subagent-harness-capsule.template.yaml`

templates/subagent-harness-capsule.template.yaml の task.objective を空文字列から未記入プレースホルダ文字列 "TODO: fill objective before use" へ変更し、schema の minLength:1 を満たすようにする。あわせてテンプレート先頭にコメント（# NOTE: This is a fill-in template. Replace all TODO/XXX/000... placeholder values before use; as-is it will fail schema validation intentionally on capsule_digest/commit/objective to prevent accidental direct use.）を追加し、テンプレートがそのまま使われることを防止する意図を明示する。

**機械検証**: python3 -c "import json,yaml,jsonschema; jsonschema.Draft202012Validator(json.load(open('schemas/harness-capsule.schema.json'))).validate(yaml.safe_load(open('templates/subagent-harness-capsule.template.yaml')))" が objective 修正後は pass すること（capsule_digest/commit の形式的ゼロ値は pattern 上有効なプレースホルダのため許容し、objective の minLength:1 違反のみを是正対象とする）を固定テスト化する。


## 軸: 自己改善+自己監査ヘリックスループ (`infinity-loop`)

### INF-01 [critical] リポジトリ既存のinfinity-loop正本群と一切接続されていない
- 是正種別: 権威順序修正 / status: 改訂済（検証指摘反映）
- 対象: `09-helix-infinity-loop.md`, `requirements/requirements-catalog.yaml#HBR-INF-001..016`, `requirements/acceptance-criteria.yaml#AC-INF-01..10`, `integration/helix-infinity-loop.md`, `schemas/infinity-loop-cycle.schema.json`, `schemas/self-audit-report.schema.json`, `schemas/learning-recipe.schema.json`, `templates/infinity-loop-cycle.template.yaml`

事実誤認を修正する: repo内に「HBR-INF-*からHIL-BR/HIL-FR IDへの既存対応表」は存在しない（`grep -rl HBR-INF .`は0件）。よってv0.5.0では『既存対応表を突き合わせて機械的に埋める』という表現を削除し、次の手順に置き換える。(1) `docs/governance/infinity-loop-requirement-coverage-ledger.md`(§1/§2, HIL-BR-01..25/HIL-FR-01..90、計115件)から現在有効なHIL ID全集合を抽出したallowlistをビルド時抽出物として用意する(新規複製ファイルではなく、正本は引き続きcoverage ledger)。(2) HBR-INF-001..016each rowについて、担当者(人間または委任judgment)が`infinity-loop-platform-requirements.md`本文とHBR-INF statementを読み比べてsemanticに対応するHIL-BR-xx/HIL-FR-xx IDを選び`sources`配列へ追記する**新規マッピング作成作業**であることを明記する(『機械的に埋める』ではなく『新規に対応付けを行い、(1)の集合に対して機械検証する』)。(3) `acceptance-criteria.yaml`のAC-INF-01..10へ`traces_to`を新設し同様にHIL IDおよび`infinity-loop-assertion-coverage-ledger.md`のcanonical assertion IDを記載する。(4) `09-helix-infinity-loop.md`冒頭の権威順序節に加え、`schemas/infinity-loop-cycle.schema.json`・`schemas/self-audit-report.schema.json`・`schemas/learning-recipe.schema.json`・`templates/infinity-loop-cycle.template.yaml`の各ファイル先頭コメント(またはschemaの`description`)にも同一の一文「本schema/templateはrepo正本`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md`のL4 component(InfinityCoordinator/agent_verification_receipts/LearningPromotionLedger等)に従属し、対立時はL4正本が優先する」を追記し、prose文書だけでなくschema/template層にも権威順序を明記する。

**機械検証**: (a) 集合検証: (1)で生成したHIL ID allowlist(115件)に対し、HBR-INF-*およびAC-INF-*の`sources`/`traces_to`値がすべて要素として存在することをyaml parseで検査するテスト`test_hbr_inf_sources_are_known_hil_ids`(単なるprefix存在ではなく、実在するHIL ID集合とのmembership検証)。(b) 対応付けの意味的正しさは自動検証できないため、`review_evidence`に『HBR-INF-*→HIL ID対応付けを人間(またはTL advisor経由の委任judgment)がrepo正本と突き合わせて確認した』旨の具体的record(担当者・日時・確認したHIL ID一覧)を必須とし、これを欠く場合は`helix plan lint`でreview_evidence欠落としてfail-closeする(prose claimではなくlintのfail-close条件として機械化)。

### INF-02 [major] schemaのstate enumに'rollback'が存在せず、文書と矛盾する
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/infinity-loop-cycle.schema.json#properties.state`, `diagrams/infinity-loop.mmd`, `09-helix-infinity-loop.md`

実測確認: `diagrams/infinity-loop.mmd`は`L[Learn] --> X{Disposition}`のあとに`X -->|Promote|O`/`X -->|Reject|O`/`X -->|Rollback|O`/`X -->|Escalate|H`と分岐する構造であり、Rollback/Promote/Reject/EscalateはいずれもLearnの**後**に決定されるdisposition状態でObserveへ戻る（EscalateだけHuman Decision経由）。一方`09-helix-infinity-loop.md`のASCII図は`Learn ← Promote / Reject / Rollback / Escalate`と矢印がLearnへ**向かって入る**向きに書かれており、mmdと矛盾する。是正は「RollbackはLearnへ戻る前の中間state」という誤った新規文言を追加せず、代わりに(1) `diagrams/infinity-loop.mmd`をrepo canonicalとして扱うことを明記し、(2) `09-helix-infinity-loop.md`のASCII図の矢印方向を`Learn → Disposition{Promote / Reject / Rollback / Escalate} → Observe（Escalateのみ→Human Decision→Observe）`に書き換えて.mmdと整合させる。schema拡張は`properties.state.enum`へ`"rollback"`を追加した上で`["observe", "detect", "classify", "route", "plan", "implement", "verify", "audit", "learn", "promote", "reject", "rollback", "escalate", "terminal"]`とし、`history[].state`を`$defs.cycleState`として`state`と共有`$ref`する(現行`history[].state`はtype:stringの自由文字列)。`09-helix-infinity-loop.md`本文には「rollbackはLearn実行後にDispositionとして決定され、AC-INF-06のrollback証跡(snapshot_id/rollback_command/verification_oracle/monitor_window、INF-05是正で追加)を伴いObserveへ戻る」とmmdの実際の遷移順に忠実な説明を記す。

**機械検証**: `schemas/infinity-loop-cycle.schema.json`に対しstate="rollback"を持つfixtureインスタンスをAjvでvalidateしPASSすることを確認するテスト(`test_schema_accepts_rollback_state`)。加えて`09-helix-infinity-loop.md`のASCII図テキストと`diagrams/infinity-loop.mmd`のノード遷移順(Learn→Disposition→{Promote,Reject,Rollback,Escalate})が両ファイルで一致することをテキスト比較する整合テスト(`test_ascii_diagram_matches_mmd_transition_order`、mmdをパースしてASCII図中のstate出現順と比較)。

### INF-03 [major] worker≠verifierがschemaで強制されておらず、AC-INF-02(自己監査の独立性)を機械的に満たせない
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/infinity-loop-cycle.schema.json#properties.worker,verifier`, `templates/infinity-loop-cycle.template.yaml`, `templates/self-audit-report.template.yaml`, `requirements/requirements-catalog.yaml#HBR-INF-003`, `docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md#agent_verification_receipts`

`schemas/infinity-loop-cycle.schema.json`の`worker`・`verifier`をともに現行の単純string型からobject型`{runtime: string, model: string, session_id: string}`(3フィールドすべてrequired、非空)へ拡張する。実測確認: `templates/infinity-loop-cycle.template.yaml`は現行`worker: worker-id`/`verifier: verifier-id`という単純文字列であり、この是正だけでは新schemaにvalidation失敗するため、本是正の一部として`templates/infinity-loop-cycle.template.yaml`の`worker`/`verifier`もobject構造の具体例(例: `worker: {runtime: claude, model: claude-sonnet-5, session_id: SESSION-EXAMPLE-001}`)へ更新することを`affected_ids`と本文の両方に明記する。Node側validatorの独立性検査は新規発明ではなく、repo L4基本設計§7.1に既存する`agent_verification_receipts`テーブルの「worker/verifierのprovider一致は"HIL_AGENT_VERIFIER_NOT_INDEPENDENT"としてfail-closeする」という既存機構に**接続**する: 本schemaのworker/verifier object化は`agent_verification_receipts`の`worker/verifier provider`フィールドと同一の識別子形状(runtime/model/session_id)を持つ入力を提供するためのものであり、独立性判定自体は`HIL_AGENT_VERIFIER_NOT_INDEPENDENT`のエラーコードをそのまま再利用してfail-closeする(package独自の新エラーコードを新設しない)。`templates/self-audit-report.template.yaml`の`auditor`/`worker`も同じobject構造へ揃える。HBR-INF-003の要件文へ「self-audit独立性はschemaのworker/verifier object化と、`docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md`§7.1の`agent_verification_receipts`/`HIL_AGENT_VERIFIER_NOT_INDEPENDENT`機構への接続で機械強制する」という一文を追記する。

**機械検証**: `worker`と`verifier`が同一session_id/runtimeのfixtureをNode側validator(既存`HIL_AGENT_VERIFIER_NOT_INDEPENDENT`ロジックを呼ぶ経路)に通しFAILすることを確認するテスト(`test_self_audit_independence_rejects_same_identity`)、異なるidentityのfixtureがPASSすることを確認するテスト、および更新後の`templates/infinity-loop-cycle.template.yaml`を新schemaでAjv validateしPASSすることを確認するテスト(`test_infinity_loop_template_matches_object_worker_schema`)。

### INF-05 [major] rollback関連の証跡フィールド(snapshot/rollback command/verification oracle/monitor window)がschema・templateに一切無い
- 是正種別: schema修正 / status: 検証合格
- 対象: `schemas/infinity-loop-cycle.schema.json#history.items`, `templates/infinity-loop-cycle.template.yaml`, `requirements/requirements-catalog.yaml#HBR-INF-008`

`schemas/infinity-loop-cycle.schema.json`の`history[].items.properties`へ`snapshot_id`(string)、`rollback_command`(string)、`verification_oracle`(string、rollback後の再検証コマンド/testを指す)、`monitor_window`(object、`{start_at: string, end_at: string}`)を追加し、`if: {properties: {state: {const: "rollback"}}}, then: {required: ["snapshot_id", "rollback_command", "verification_oracle", "monitor_window"]}`のif/then条件で`state`が`rollback`の要素にのみ必須化する。`templates/infinity-loop-cycle.template.yaml`の`history`サンプルにrollback要素の例を1件追加し、上記4フィールドを埋めた形で示す。HBR-INF-008の`verification`にAC-INF-06と共に「schemaのif/then必須制約で機械強制」という一文を追記する。

**機械検証**: `state: rollback`を含みsnapshot_id等4フィールドを欠くhistory要素を持つfixtureをAjvでvalidateしFAILすることを確認するテスト(`test_rollback_history_requires_evidence_fields`)。

### INF-06 [major] self-audit-report.template.yamlにcycle_idの結線が無く、machine-verifiableなschemaも未定義
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/self-audit-report.schema.json`, `templates/self-audit-report.template.yaml`, `docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md#agent_verification_receipts`

`schemas/`配下に新規`self-audit-report.schema.json`を追加する(`$id: https://helix.local/schemas/self-audit-report.v1.json`)。実測確認: repo L4基本設計§7.1の`agent_verification_receipts`(worker/verifier run参照、oracle/input/result/evidence digest、`verdict=pass|fail|inconclusive`)と機能的に重複するため、本schemaは独立した並行正本ではなく`agent_verification_receipts`テーブルへ投入するためのproposal入力shapeとして位置づける。具体的には: (1) `verdict`のenum値を独自の`PASS/FAIL/UNCERTAIN`ではなく、既存`agent_verification_receipts.verdict`と同一の`enum: [pass, fail, inconclusive]`(小文字・同一語彙)に揃える。(2) 必須フィールドとして`agent_verification_receipt_id`(string、採番前はnull許容、採番後は対応する`agent_verification_receipts`行のIDを記載)を新設し、本artifactが最終的にどの`agent_verification_receipts`行として確定するかを結線する。その他requiredフィールド: `schema_version`(const: "helix.self-audit-report/v1")、`audit_run_id`、`cycle_id`(string、`infinity-loop-cycle.schema.json`の`cycle_id`と結線)、`scope`(array of string)、`auditor`(object`{runtime, model, session_id}`、INF-03のworker/verifier object化と同型)、`worker`(同型object)、`evidence`(array of object、各要素`{command: string, exit_code: integer, output_digest: string}`をrequired)、`findings`(array of object、各要素`{summary: string, severity: enum[critical,major,minor], verified: boolean}`)、`verdict`(enum: pass/fail/inconclusive)、`residual_risk`(string)、`next_route`(enum: promote/reject/rollback/escalate、INF-02のstate拡張と整合)。本文に「本schemaはNode(唯一のtransaction writer)が`agent_verification_receipts`へ書き込む際の検証済み入力shapeであり、それ自体が独立したaudit正本を新設するものではない」と明記する。`templates/self-audit-report.template.yaml`を新schemaに合わせて更新し、`cycle_id: INF-XXX`・`verdict: pass`(小文字)・`evidence`のサンプル1件(command/exit_code/output_digest付き)を追加する。

**機械検証**: `self-audit-report.template.yaml`を新設`self-audit-report.schema.json`でvalidateしPASSすることを確認するテスト、`evidence`が空配列のfixtureがFAILすることを確認するテスト(`test_self_audit_schema_requires_evidence`)、および`verdict`フィールドの値集合が`agent_verification_receipts.verdict`の`{pass,fail,inconclusive}`と完全一致することをJSON Schema enum抽出で比較するテスト(`test_self_audit_verdict_vocabulary_matches_agent_verification_receipts`)。

### INF-07 [major] 「no-progress」等の停止条件が自由文字列のままで、history digestに基づく計算可能な判定条件が定義されていない
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/infinity-loop-cycle.schema.json#terminal_policy.stop_conditions`, `templates/infinity-loop-cycle.template.yaml`, `src/orchestration/loop-stop-rules.ts`, `docs/design/helix/L6-function-design/orchestration-memory.md#StopReason`

`schemas/infinity-loop-cycle.schema.json`の`terminal_policy.stop_conditions`の`items`を自由文字列から`enum: ["verified", "rejected", "no_progress", "repeat", "budget_exhausted", "cycle_limit_exhausted"]`へ変更する。実測確認: repo`src/orchestration/loop-stop-rules.ts`(design記述は`docs/design/helix/L6-function-design/orchestration-memory.md`)には既に`StopReason = "verdict" | "count" | "file_exists" | "cost_budget" | "no_progress" | "custom"`と汎用`evaluateStop`(`StopRule{reason, threshold?, path?, onFailure}`、`no_progress`は`probe.noProgress(threshold)`で判定)が存在するため、本是正は独自の`no_progress_rule{window, criterion}`/`repeat_rule{finding_id_repeat_threshold}`という並行語彙を新設せず、既存`StopRule`型へ接続する形に変更する。具体的には: package側schemaは`terminal_policy.no_progress_threshold`という1フィールドのみ追加し(既存`StopRule{reason:"no_progress", threshold}`の`threshold`へそのままマップする)、`window`/`criterion`という別語彙は導入しない(判定criterion自体は`probe.noProgress`実装側=既存Node実装の責務としこの層では固定しない)。`repeat`はrepo既存`StopReason`union型に含まれていないため、本是正は(a) `StopReason`型へ`"repeat"`を追加するadd-designをL6設計(`orchestration-memory.md`)側の変更として`docs/plans/`配下に別途PLAN起票する前提を明記し、(b) package schema側は`terminal_policy.repeat_finding_threshold`(integer、minimum:1)のみを追加してこの型追加後のNode実装へ渡すデータとして定義する。schemaのみを先行させず、実装側`StopReason`拡張のPLANが無い間はpackage schemaの`repeat`値はNode側で`custom`扱いにfall backすることを明記する。`09-helix-infinity-loop.md`の停止条件節には「no_progressの算出はNode既存`evaluateStop`/`probe.noProgress(threshold)`に従属し、本packageは`threshold`相当のconfig値のみを提供する」と記す。

**機械検証**: `stop_conditions`にenum外の値(例: "foo")を含むfixtureをAjvでvalidateしFAILすることを確認するテスト。`terminal_policy.no_progress_threshold`がNode既存`evaluateStop`の`StopRule.threshold`として解釈可能である(整数として渡してもtype errorにならない)ことを確認する結線テスト(`test_no_progress_threshold_maps_to_stop_rule_threshold`)。

### INF-08 [major] recipe候補→rule昇格、finding再発→AC/test/detector昇格の記録アーティファクトが皆無
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/learning-recipe.schema.json`, `schemas/infinity-loop-cycle.schema.json`, `requirements/requirements-catalog.yaml#HBR-INF-009,HBR-INF-010,HBR-INF-011`, `docs/design/helix/L6-function-design/memory-learning-promotion.md#enforceKnowledgePromoterSeparation`

`schemas/`配下に新規`learning-recipe.schema.json`を追加する(`$id: https://helix.local/schemas/learning-recipe.v1.json`)。実測確認: repo L6設計`memory-learning-promotion.md`は既に`enforceKnowledgePromoterSeparation((actors: PromotionActorSetV1, policy) => RoleSeparationDecisionV1)`でworker/promoter/reviewer/final_verifierの4主体・全6 pair分離を強制し、`RecipeDecisionV1`(`recipe_id, pattern_id, recipe_version, ...`)という既存recipe型を持つため、本是正は単一reviewerの`false_positive_review`ではなく既存4主体分離モデルへ接続する。requiredフィールド: `recipe_id`(string、`RecipeDecisionV1.recipe_id`と同一命名規約)、`source_cycle_id`(string、発生元cycleへの結線)、`condition`(string)、`change`(string)、`verification`(string、対応するtest/command)、`limit`(string)、`counterexample`(array of string、空配列可)、`status`(enum: `candidate`, `promoted_rule`)、`promotion`(object、`status=promoted_rule`のときrequired: `{evidence_count: integer(minimum: 2), actor_set: {worker: {runtime,model,session_id}, promoter: {runtime,model,session_id}, reviewer: {runtime,model,session_id}, final_verifier: {runtime,model,session_id}}(既存`PromotionActorSetV1`と同型、4主体全て必須), independent_audit_ref: string(self-audit-report.audit_run_idへの参照), version_bump: string(semver)}`)。単一の`false_positive_review.reviewer`フィールドは廃止し`actor_set`へ統合する。同schema内に`promoted_to`(object、`{kind: enum[acceptance_criterion, test, detector], ref: string}`、任意)も定義する。`infinity-loop-cycle.schema.json`側の`history[].items.properties`へ`recipe_id`(optional string)を追加する。HBR-INF-009/010/011の`verification`欄へ「learning-recipe.schema.jsonのpromotion.actor_set(4主体・全6 pair)は`docs/design/helix/L6-function-design/memory-learning-promotion.md`の`enforceKnowledgePromoterSeparation`/`PromotionActorSetV1`と同一構造であり、Node側は当該既存ロジックをそのまま呼び出して分離検証する(独自の並行分離ロジックを新設しない)」という一文を追記する。

**機械検証**: `status: promoted_rule`かつ`promotion.evidence_count < 2`のfixtureをAjvでvalidateしFAILすることを確認するテスト(`test_recipe_promotion_requires_multiple_evidence`)。`promotion.actor_set`内でidentity/role/provider familyが衝突する(例: worker.session_idとreviewer.session_idが同一)fixtureを既存`enforceKnowledgePromoterSeparation`関数に通しFAILすることを確認する結線テスト(`test_learning_recipe_actor_set_uses_existing_role_separation`)、および6 pair全てが分離されたfixtureがPASSすることを確認するテスト。

### INF-09 [minor] 停止条件の語彙が本文とtemplate既定値で一致していない
- 是正種別: 要件修正 / status: 検証合格
- 対象: `templates/infinity-loop-cycle.template.yaml#terminal_policy.stop_conditions`, `09-helix-infinity-loop.md`

`templates/infinity-loop-cycle.template.yaml`の既定`stop_conditions`を`[verified, rejected, no_progress, repeat, budget_exhausted]`へ修正し(INF-07是正後のenumと完全一致させ、本文にない`verified`/`rejected`は終了系のterminal結果として残置しつつ`repeat`を追加して欠落を解消する)、`09-helix-infinity-loop.md`本文の「no-progress、budget、repeat、cycle limitでcircuit break」の記載はterminal_policyのstop_conditions(進行中止トリガー: no_progress/repeat/budget_exhausted)とterminal結果(verified/rejected、cycle_limit_exhausted)を区別する形に書き分け、両者の対応関係を明記する。INF-07是正のenum化により、この一致は継続的にスキーマ検証で保証される。

**機械検証**: `infinity-loop-cycle.template.yaml`の`stop_conditions`全要素がINF-07是正後のschema enumのサブセットであることをAjv validateで確認するテスト(`test_template_stop_conditions_match_schema_enum`)。

### INF-10 [minor] human_approval_requiredがbooleanのみで、承認者・承認証跡フィールドが無い
- 是正種別: schema修正 / status: 検証合格
- 対象: `schemas/infinity-loop-cycle.schema.json#terminal_policy.human_approval_required`, `requirements/requirements-catalog.yaml#HBR-INF-006`

`schemas/infinity-loop-cycle.schema.json`の`terminal_policy.human_approval_required`を`boolean`のまま維持しつつ、`terminal_policy`へ`approval_evidence`(object、`human_approval_required=true`のときrequired: `{approver_id: string, approved_at: string(ISO 8601), evidence_digest: string}`)を追加し、`if: {properties: {human_approval_required: {const: true}}}, then: {required: ["approval_evidence"]}`のif/then条件を課す。HBR-INF-006の要件文へ「irreversible_high_impact/semantic_contractクラスのcycleはterminal_policy.approval_evidenceで承認者・承認時刻・証跡digestを事後検証可能な形で記録する」という一文を追記する。

**機械検証**: `human_approval_required: true`かつ`approval_evidence`欠落のfixtureをAjvでvalidateしFAILすることを確認するテスト(`test_human_approval_requires_evidence`)。`risk_class`が`irreversible_high_impact`または`semantic_contract`のcycleで`human_approval_required=false`のfixtureを検出するNode側ポリシーチェックのユニットテスト。


## 軸: チャット内全要件の網羅 (`chat-reqs`)

### F1 [major] detection_findingsテーブルにresidual_risk/resolved_by列が存在せず、JSON findingスキーマと不整合
- 是正種別: 新規要件 / status: 改訂済（検証指摘反映）
- 対象: `CHAT-017`, `CHAT-021(新設)`, `inventory/chat-requirements.yaml`, `inventory/chat-requirements-provenance.yaml(新設)`, `requirements/acceptance-criteria.yaml`, `AC-TRACE-02(新設)`, `validation/package-validation-report.json`, `13-acceptance-criteria.md(非normative補記のみ)`, `scripts/verify-chat-provenance.py(新設)`

inventory/chat-requirements.yaml の CHAT-001〜CHAT-020 は要約文のみで、要約元の生チャットログや『どの発言をどのCHAT-IDに割り当てたか』の対応表がパッケージ内に存在せず、蒸留段階（生チャット→20件）が独立監査できない。v0.5.0では次を追補する。
(1) CHAT-017 の記述を拡張し、『トレースは川下（CHAT-ID→catalog/AC）だけでなく川上（生チャット発言→CHAT-ID割当）についても、割当根拠を記録した provenance 台帳を伴わなければ完了と主張してはならない』を明記する。
(2) 新規要件 CHAT-021『チャット要求蒸留の provenance（誰が・いつ・どの発言をどのCHAT-IDへ割り当てたか）を、生ログそのものではなく mapping 台帳（inventory/chat-requirements-provenance.yaml）として残す。ログ本文が入手不能な過去分（本v0.4.0起票分）は、代替として『再構成不能』フラグと、代わりに実施した検証手段（例: ゴール文8項目との突合結果）を decision-ledger へ記録することで充足したとみなす』を追加する。
(3) inventory/chat-requirements-provenance.yaml のスキーマを新設し、各 CHAT-ID につき { chat_id, source: {type: raw_log_excerpt|reconstructed_unavailable, ref または unavailable_reason}, assigned_by, assigned_at, verification_method } を必須フィールドとする（raw_log_excerpt の場合は ref に session識別子+発言範囲、reconstructed_unavailable の場合は unavailable_reason 必須）。
(4) 【AC登録先の是正】機械検証されるAC正本は requirements/acceptance-criteria.yaml（ヘッダ `count:` と `acceptance_criteria` 配列の要素数一致が catalog_counts 相当検証で照合される）であり、13-acceptance-criteria.md は『重点条件』のprose要約に過ぎず個々のAC-IDの機械登録場所ではない。よって新設ACは requirements/acceptance-criteria.yaml へ AC-TRACE-02 として追加し、ヘッダ `count:` を111→112へ更新する。同時に validation/package-validation-report.json の `checks[].catalog_counts.detail`（acceptance=111→112）と `summary.acceptance_criteria`（111→112）を同一commitで更新し、数値不一致を残さない。13-acceptance-criteria.md には可読性のため『15. chat要求蒸留のprovenance（上流割当根拠）に欠落がない』という参考行を追加してよいが、これは非normativeであり、機械検証対象は requirements/acceptance-criteria.yaml と package-validation-report.json の数値一致のみである旨を明記する。
(5) 【既存AC-TRACE-01との重複回避】requirements/acceptance-criteria.yaml には既に AC-TRACE-01『Trace closure: Chat→requirement→workflow→design→task→test→evidence has no orphan required edge』が存在し、CHAT-ID確定後の下流trace閉包を担う。新設 AC-TRACE-02 は CHAT-ID確定前の上流（生チャット発言→CHAT-ID割当根拠）distillation provenanceを担う別軸とし、criterion本文へ両者のscope差異を明記して重複・競合させない: 『AC-TRACE-01は CHAT-ID確定後の下流(CHAT-ID→requirement→...→evidence)closureを検証し、AC-TRACE-02は CHAT-ID確定前の上流(生チャット発言→CHAT-ID割当)provenanceを検証する。一方の充足は他方の充足を意味しない』。AC-TRACE-02 criterion本文: 『inventory/chat-requirements-provenance.yaml が存在し、chat-requirements.yaml の全CHAT-ID（現行20件+将来追加分）について1:1のprovenanceレコード(chat_id, source{type,ref|unavailable_reason}, assigned_by, assigned_at, verification_method)を持つこと』。
(6) 【ADR-009準拠への是正】新設 scripts/verify-chat-provenance.py はADR-009 closed capability class（source_atomization/document_engine/detector/product_data/analysis）のうち `detector`（欠落・不整合検出）に分類する。ADR-009の『Node=唯一のtransaction writer・control planeとしてschema/lineage/digest/policyを再検証し、Pythonはnetwork default deny・DB path/credential/`.helix/`非付与のproposal-onlyワーカーとする』原則に従い、本スクリプトは以下を満たす: (a) 引数は chat-requirements.yaml と chat-requirements-provenance.yaml の2パスのみとし、DB path・credential・`.helix/`を一切受け取らない。標準ライブラリのみimportし、ネットワークアクセスしない(network default deny)。(b) 判定結果は stdout へ構造化JSON（例: {schema_version, checked_at, chat_ids_total, provenance_records_total, orphan_chat_ids:[...], missing_fields:[...], ok:bool}）の**proposal**として出すのみであり、そのexit codeやokフィールド単体をCI/`helix doctor`相当gateの合否根拠として直接信用しない。(c) Node側の再検証ステップ（将来のcontrol-plane gateモジュール。ADR-009のNode再検証原則に従う）が、両入力YAMLを自ら読み直してdigest/件数を再計算しPython proposalの要約値と突合したうえで、出力JSONのschema検証を行い、そこで初めてgate合否を確定する。schema不一致・digest不一致・スクリプト異常終了はすべてfail-closeとする。(d) AC-TRACE-02のverificationは『Pythonのdetector proposal単独のexit 0』ではなく『Python proposal + Node再検証(schema/digest突合)』の二段構成として明記する。
(7) 今後の新規チャット要求蒸留は elicitation-session スキーマの `inputs` に生ログ参照（または digest）を必ず記録し、事後追補ではなくセッション実施時点でprovenanceを同時生成する運用へ切り替える。

**機械検証**: (a) `requirements/acceptance-criteria.yaml` のヘッダ `count:` が `acceptance_criteria` 配列の要素数と一致すること（例: `python3 -c "import yaml,sys; d=yaml.safe_load(open('requirements/acceptance-criteria.yaml')); sys.exit(0 if d['count']==len(d['acceptance_criteria']) else 1)"` が exit 0。AC-TRACE-02追加後は count=112 で一致）。(b) `validation/package-validation-report.json` の `checks[].catalog_counts.detail`（acceptance=112）と `summary.acceptance_criteria`（112）が(a)の実測値と一致すること（jq等の等価チェックでexit 0）。(c) 新設 `python3 scripts/verify-chat-provenance.py --chat-requirements inventory/chat-requirements.yaml --provenance inventory/chat-requirements-provenance.yaml --json` がstdoutへ構造化JSON proposal（schema_version/orphan_chat_ids/missing_fields/ok を含む）を出しexit 0であること（Pythonのdetector提案としてのみ、単独ではgate合否を確定しない）。(d) (c)の出力JSONに対しNode側再検証ステップ（両入力ファイルをNode自身が読み直してdigest/件数を再計算し、(c)の要約値と突合、かつ出力JSONのschema検証を実施）が実行され、その再検証結果がpass（対応するNode側gate/testがexit 0 / green）であること。CI/`helix doctor`相当gateは(c)単独ではなく(c)+(d)の両方をもって合否を確定する。(a)〜(d)いずれか未達はfail-close。


## 軸: ハイブリッド設計コアエンジン+検出DB (`hybrid-core`)

### F1 [major] detection_findingsテーブルにresidual_risk/resolved_by列が存在せず、JSON findingスキーマと不整合
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/detection-finding.schema.json`, `database/detection-system-schema.sql#detection_findings`, `08-detection-system-database.md`, `validation/detection-findings-resolved-fields.sh`

database/detection-system-schema.sql の detection_findings テーブルへ resolved_by TEXT NULL と residual_risk TEXT NULL の2列を追加する（両方NULLABLE、status<>'resolved' の間はNULL固定）。08-detection-system-database.md に次の一文を追記する: 「schemas/detection-finding.schema.json のresolved_by/residual_riskはJSON側optionalだがJSON→DB projectionでは必須の永続化対象であり、detection_findings.resolved_by / detection_findings.residual_risk へNode transaction coordinatorが書き込む（ADR-009: Nodeが唯一のtransaction writer、Pythonはproposal-onlyでこの列に直接書き込まない）。finding_events.event_type='resolved'遷移時、payload_digestにresolved_by/residual_riskの値を含めてイベント化する」。前回是正はHELIX-HARNESS本体の tests/projection-writer.test.ts（harness.db 投影用の8行stubで、実体は tests/slow/projection-writer.test.ts への citation-binding のみを検証する無関係テスト）を検証先に挙げていたが、本パッケージの detection_findings スキーマとは無関係であり false citation だった。本パッケージには対応するNode control plane実装が現時点で存在しないため、検証は本パッケージ内で自己完結する新設スクリプト validation/detection-findings-resolved-fields.sh とする（sqlite3 CLIでdatabase/detection-system-schema.sql を直接ロードして実行し、Node実装非依存で成立させる）。将来この schema を実装するNode control plane（別PLANで新設）を追加する際は、同等のラウンドトリップテストをそちらの実装リポジトリにも追加することを08-detection-system-database.md へ申し送り事項として明記する。

**機械検証**: validation/detection-findings-resolved-fields.sh（本是正で新設、sqlite3 CLI使用）を追加し、(1) `sqlite3 test.db < database/detection-system-schema.sql` でスキーマを構築、(2) status<>'resolved' の行を resolved_by/residual_risk NULLのままINSERTできることをexit code 0で確認、(3) status='resolved' の行に resolved_by/residual_risk 非NULL値をINSERTしSELECTで一致確認、をアサートする。CIにこのスクリプトを追加して実行する。HELIX-HARNESS本体の tests/projection-writer.test.ts は本パッケージの detection_findings と無関係のため検証根拠として引用しない。

**基本設計要点**: Node projection-writer（将来実装）がJSON finding（schemas/detection-finding.schema.json）をdetection_findingsへ書き込む際、resolved_by/residual_riskはstatus='resolved'遷移時にのみ設定可とし、それ以外のstatusではNULL固定とするバリデーションをNode control planeに置く（Pythonはproposal-onlyでこの列に直接書き込まない）。

### F2 [major] findingのevidence(配列)とevidence_digest(単一スカラー)の対応関係が未文書化
- 是正種別: schema修正 / status: 改訂済（検証指摘反映）
- 対象: `schemas/detection-finding.schema.json`, `database/detection-system-schema.sql#detection_findings`, `database/detection-system-schema.sql#evidence_records`, `08-detection-system-database.md`, `database/README.md`, `validation/evidence-records-finding-roundtrip.sh`

evidence配列（schemas/detection-finding.schema.json の evidence: string[], minItems:1）の正本は evidence_records テーブルとし、detection_findings.evidence_digest は「evidence_recordsから算出したevidence集合全体の合成digest」と定義する要約列と位置づける。前回是正は evidence_records に新規 finding_id 列＋FK制約を追加する設計だったが、既存の subject_kind/subject_id という汎用外部キーと重複する列であり、かつ両者の一致をNode application層バリデーションのみで担保するため乖離し得る冗長設計だった。これを是正し、新規列は追加せず既存の subject_kind/subject_id を唯一の結合キーとする: (1) evidence_records は変更しない（新規列なし）。(2) database/detection-system-schema.sql に、evidence_records への INSERT/UPDATE 時に `subject_kind='detection_finding'` かつ `subject_id` が detection_findings.finding_id のいずれとも一致しない場合に RAISE(ABORT, ...) する `CREATE TRIGGER trg_evidence_records_detection_finding_fk` を新設し、DB層（Node application層だけでなくSQLiteエンジン自体）で参照整合性を強制する。(3) 08-detection-system-database.md と database/README.md に「finding.evidence[]の各要素は、evidence_records のうち subject_kind='detection_finding' AND subject_id=finding_id に該当する行へ1:1対応するN行として永続化され、detection_findings.evidence_digestは当該evidence_records集合を正規化結合した合成digestである。Nodeがfinding受理時にevidence_records各行を書き込み、evidence_digestを再計算して一致検証した上でdetection_findingsへ書き込む。JSON evidence[]配列とDB上の複数行の対応は subject_kind/subject_id 経由の evidence_records JOINが唯一の正本であり、evidence_digest単独ではevidence[]を復元できない。参照整合性は trg_evidence_records_detection_finding_fk トリガーでDB層強制する」と明記する。前回是正が検証先に挙げていたHELIX-HARNESS本体の tests/projection-writer.test.ts は本パッケージの evidence_records/detection_findings と無関係の別スキーマ用stubであり false citation だったため、検証は本パッケージ内で自己完結する新設スクリプトとする。

**機械検証**: validation/evidence-records-finding-roundtrip.sh（本是正で新設、sqlite3 CLI使用）を追加し、(1) `sqlite3 test.db < database/detection-system-schema.sql` でトリガーを含むスキーマを構築、(2) detection_findings に1行、evidence_records に subject_kind='detection_finding', subject_id=同finding_id のN行（N>=2）をINSERTし、正規化合成SHA-256をdetection_findings.evidence_digestへ書き込んだ上でJOINしてN件が復元できることを確認、(3) subject_kind='detection_finding' かつ subject_id が存在しないfinding_idのevidence_records行をINSERTしようとするとトリガーがエラーで拒否する（exit code非0）ことを確認する。CIにこのスクリプトを追加して実行する。HELIX-HARNESS本体の tests/projection-writer.test.ts は無関係のため検証根拠として引用しない。

**基本設計要点**: Node control planeがfinding受理時にevidence[]各要素をevidence_records（subject_kind='detection_finding', subject_id=finding_id）へ書き込み、正規化順序でjoinしたSHA-256をdetection_findings.evidence_digestへ書き込む単一トランザクションとする。参照整合性はNode application層バリデーションに加え trg_evidence_records_detection_finding_fk トリガーでDB層でも強制し、両者の乖離を構造的に防ぐ。Pythonはevidence文字列の生成提案のみでDB書き込み権限を持たない（ADR-009: Python=proposal-only）。

### F3 [major] hybrid-core-capability-map.yamlのpython_tools一覧のうち5ツールがcapability_familiesの分類に漏れている
- 是正種別: 棚卸し追補 / status: 改訂済（検証指摘反映）
- 対象: `inventory/hybrid-core-capability-map.yaml#capability_families`, `inventory/capability-map-bijection.test`

inventory/hybrid-core-capability-map.yaml の capability_families に以下5件を追補し、02-core-engine-definition.md の記述と整合させる。integration: [hook_gate, agent_meta, selftest, fix_names, style, util] とし、schema_and_trace: [schema_check, spec_check, spec_trace, spec_types, derive_traces, validate, id_utils] とする（selftestは02-core-engine-definition.mdの『validate.py / hook_gate.py / selftest.py: gate・doctor・回帰』の記述に合わせintegrationへ、id_utilsはID採番・trace整合の下支えとしてschema_and_traceへ、fix_names・style・utilは共通ユーティリティとしてintegrationへ分類する）。前回是正は『追加後、python_tools一覧29件全件がcapability_familiesのいずれか一つに過不足なく属することを機械検証する』とAC化していたが、これはF3単独では成立しない。capability_families には python_tools に存在しないストレイ要素 init（authoring_and_generation配下）と signals（planning_and_execution配下）が残っており、これらの除去はF4の変更範囲であって本是正（F3）は関与しない。F3のみを適用した状態で双方向差集合を検査すると init/signals が超過要素として残り必ず失敗する。よって本是正はF3のPLAN/AC本文へ『本ACはF4適用後にのみ成立する（F4依存）。F3単独の受入は、追加した5要素(fix_names, id_utils, selftest, style, util)がpython_toolsに含まれ、かつcapability_families配下のちょうど1箇所に正しく属することの部分検証に限る』という依存関係の明記を追加する。F4のcorrection内容自体は変更しない。

**機械検証**: (F3単独) `python_tools` 一覧のうち fix_names, id_utils, selftest, style, util の5要素それぞれについて、capability_families配下のいずれか1ファミリーにのみ出現することをYAML突合テストで確認する（例: 各要素で `sum(1 for family in capability_families.values() if elem in family) == 1` をassert）。(F3+F4結合後にのみ成立する全体ゲート) inventory/hybrid-core-capability-map.yaml の python_tools集合とcapability_families配下の全要素集合の差集合が双方向で空集合であることを検証するテスト（`python_tools - union(capability_families.values()) == {}` かつ逆方向も空）はF4適用後の状態でCI実行し、F3単独の受入条件としては主張しない。

**基本設計要点**: capability_familiesはpython_tools 29件の分類であり、tool→familyは1:1（重複なし・漏れなし）の全射写像であることをinventoryのスキーマ制約として明記する。ただし全射性の完全成立はF3（分類漏れ5件の追補）とF4（ストレイ要素init/signalsの除去）の両方が適用された状態でのみ検証可能であるとPLAN依存関係に明記する。

### F4 [minor] capability_familiesにtool名ではなくサブコマンド名('init','signals')がtoolと並列で混入
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `inventory/hybrid-core-capability-map.yaml#capability_families`

capability_families配下のリストは『tools/配下の独立モジュール（python_tools一覧と同一29件の名前空間）』のみを列挙する規則とし、CLIサブコマンド名は別リストへ分離する。変更点: (1) authoring_and_generationから'init'を除去し、'init'はbuildモジュールのサブコマンドである旨を `authoring_and_generation_subcommands: {build: [init]}` として補助mapへ移す。(2) planning_and_executionから'signals'を除去し、'signals'はassignモジュールのサブコマンド（cmd_signals）である旨を `planning_and_execution_subcommands: {assign: [signals]}` として補助mapへ移す。(3) capability_families直下の各family配列の要素は必ずpython_tools29件のいずれかの名前と一致する（モジュール名のみ）という制約をinventoryドキュメントに明記する。

**機械検証**: F3と同一のYAML突合テストで『capability_families配下の全要素 ⊆ python_tools』を機械検証する（不一致要素があればテスト失敗とする）。

**基本設計要点**: モジュール名一覧（python_tools）とCLIサブコマンド名一覧は別軸のデータであり、capability_familiesはモジュール分類にのみ用いる。サブコマンド粒度の対応が必要な場面は別途subcommandsマップとして表現し、29件という棚卸し数値と混同させない。

### F6 [minor] inventory/hybrid-core-files.csvの715件中12件がhybrid-docgen実体に現存しない(__pycache__ .pyc 11件 + build/scope.active.json)
- 是正種別: 棚卸し追補 / status: 改訂済（検証指摘反映）
- 対象: `inventory/hybrid-core-files.csv`, `inventory/hybrid-core-summary.json`

inventory/hybrid-core-files.csv および inventory/hybrid-core-summary.json のtotal_files集計から __pycache__ 配下の *.cpython-313.pyc（11件、category=python_core、いずれもgenerated=True）と build/scope.active.json（実体不在、category=generated_output、generated=True）の計12行を除外する。変更点: (1) hybrid-core-files.csv から該当12行（tools/__pycache__/{agent_meta,build,diagram_dsl,id_utils,render,schedule,scope,spec_check,style,util,validate}.cpython-313.pyc の11件、build/scope.active.jsonの1件）を削除する。(2) hybrid-core-summary.json を次の4フィールドで改定する: total_files 715→703、generated_files（トップレベル、除外12行は全てgenerated=Trueのため）439→427、category_counts.generated_output（除外12行中category=generated_outputはbuild/scope.active.jsonの1件のみ）428→427、category_counts.python_core（除外12行中category=python_coreは11件のpycファイルのみ）40→29。前回是正は『category_counts.generated_output を439から427へ』と記載していたが、439はトップレベルgenerated_filesの現在値でありcategory_counts.generated_outputの現在値（428）と取り違えた誤記であり、かつトップレベルgenerated_filesフィールド自体の改定（439→427）が漏れていた。本是正はこの誤記と漏れを訂正し、authored_files(276、不変)+generated_files(427)=total_files(703)、およびcategory_counts全項目の合計=total_files(703)の内部整合性を保つ4フィールド同時改定として明記する。(3) 除外理由として『__pycache__の.pycは実行環境（Pythonバージョン・実行有無）に依存する非決定的キャッシュであり、真正の棚卸し対象であるauthored/generatedアセットに含めない。build/scope.active.jsonは実体照合ソースに現存せずCSVとの不整合であるため除去する』を追記する。

**機械検証**: (1) `jq '(.authored_files + .generated_files) == .total_files and ((.category_counts | to_entries | map(.value) | add) == .total_files)' inventory/hybrid-core-summary.json` が true を返すこと（改定前の715ベースでも改定後の703ベースでも成立する内部整合性チェック）。(2) `jq '.total_files, .generated_files, .category_counts.generated_output, .category_counts.python_core' inventory/hybrid-core-summary.json` の出力が改定後値 703, 427, 427, 29 と一致すること。(3) `find /tmp/hybrid-audit-v1-fixed/hybrid-docgen -type f -not -path '*/__pycache__/*' | wc -l`（または再取得した実ファイルツリーに対する同等コマンド）の結果件数が改定後のtotal_files（703）と一致すること、をCIで確認する。

**基本設計要点**: 棚卸しCSVの生成手順に『__pycache__ディレクトリおよび同等の非決定的生成キャッシュは事前にfindの除外条件（-not -path "*/__pycache__/*"）で除外してから棚卸しを行う』という前処理規則を明記し、以後のスナップショット再取得時にも同じ除外規則を適用する。加えて、summary.json生成スクリプトに『authored_files+generated_files==total_files』と『category_countsの値の合計==total_files』の2つの内部整合性チェックを組み込み、フィールド取り違えを機械的に検出できるようにする。


## 軸: UT-TDD_AGENT-HARNESS全検査抽出 (`ut-tdd`)

### UT-01 [major] UT-TDD ref audit のcommit SHAとブランチ集合がリポジトリ正本と一致しない
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `inventory/ut-tdd-ref-audit.yaml`, `HBR-INV-002`, `AC-INV-02`, `docs/governance/infinity-loop-source-capability-ledger.md#§1.2.1`

inventory/ut-tdd-ref-audit.yaml の main ref (sha 86b581c12121936180047b6f908bba832e5bbbda, observed_at 2026-07-15) を『確定 canonical_observed』として単独提示することを禁止する。同ファイルの各 ref エントリへ新規フィールド `reconciled_against: docs/governance/infinity-loop-source-capability-ledger.md#§1.2.1` を必須追加し、そこに記録された historical UT heads seed（`origin/main` sha e506a67e9c243cc9781ff4a6d8d1870b072fd37b、2026-07-14観測、`authority_reuse_allowed=false`/`coverage_reuse_allowed=false`）との SHA 差分を、リポジトリ側時系列に沿った『旧 seed → 新 snapshot への正当な更新』か『真の不一致』かのいずれかとして明示的に reconciliation note で説明しなければならない。差分が未説明の場合、当該 ref の `status` を `sha_mismatch_unreconciled` に強制し、`disposition`（adopt_with_hardening 等）を確定扱いにしてはならない。同様に `work/l7-421-test-hygiene-live-tree-fence` (sha c163e6e5d4ec41c8b5192355e10cc5cc88102e50) は infinity-loop-source-capability-ledger.md §1.2.1 に同一 sha で記載済みのため、ut-tdd-ref-audit.yaml 側にも `reconciled_against` を張り、両文書間の branch/PR 集合が完全一致することを機械照合できるようにする。

**機械検証**: ut-tdd-ref-audit.yaml の全 ref エントリに `reconciled_against` フィールドが存在すること（grep -c 'reconciled_against' inventory/ut-tdd-ref-audit.yaml が ref 件数と一致）、かつ SHA 不一致かつ未説明の ref が存在する場合に `status: sha_mismatch_unreconciled` を検出して非ゼロ終了する検証スクリプト（例: scripts/verify-ut-tdd-ref-reconciliation.*）を新設し、CI/doctor gate として実行結果 exit code を根拠に closure 可否を判定する。

### UT-02 [critical] リポジトリ正本が明記するBLOCKED/pending git-authority-receipt状態を無視して確定表記している
- 是正種別: 権威順序修正 / status: 改訂済（検証指摘反映）
- 対象: `inventory/ut-tdd-ref-audit.yaml`, `HBR-DH-003`, `AC-DH-03`, `schemas/source-ref-audit.schema.json`, `MANIFEST.json`

検証で判明した通り、schemas/source-inventory.schema.json（required: schema_version/source_id/source_kind/locator/snapshot_digest/observed_at/assets/coverage、additionalProperties:false）は単一ソース・単一snapshotレコード用のv2スキーマであり、inventory/ut-tdd-ref-audit.yamlの実トップレベルキー（repository/observed_at/refs/coverage_boundary、複数refをまとめたaudit report shape）とは別artifact typeである。両者はpackage内どこにも$schema参照やMANIFEST.json上のvalidates_against宣言で結線されておらず、authority_status追加以前から常に不一致でrejectされる。したがって是正はschemas/source-inventory.schema.jsonを触らず、代わりに (1) inventory/ut-tdd-ref-audit.yamlのトップレベルに`authority_status`フィールドを必須追加し、値はdocs/governance/infinity-loop-source-capability-ledger.md §1.2 `predecessor-ut`行のstatus（現時点で`BLOCKED`）をそのまま転記する。authority_statusが`BLOCKED`である間、各refの`disposition`値には`_provisional_pending_receipt`サフィックスまたは`provisional: true`を付し、00-executive-rebaseline.md等の上位文書がこれを『確定採用』として引用することを禁止する。(2) inventory/ut-tdd-ref-audit.yamlの実shape（repository, observed_at, authority_status, refs, coverage_boundary）に一致する新規スキーマ schemas/source-ref-audit.schema.json を新設し、required: [repository, observed_at, authority_status, refs, coverage_boundary]、additionalProperties:false、authority_statusはledger status語彙（BLOCKED, cleared等）のenumとする。(3) inventory/ut-tdd-ref-audit.yaml先頭に`$schema: ../schemas/source-ref-audit.schema.json`相当の参照行を追加し、MANIFEST.jsonにも両ファイルのvalidates_against紐付けを明記して、現状『無関係』な2ファイルを機械的に結線する。schemas/source-inventory.schema.json（v2、単一ソースレコード用）は別artifact type用のまま変更しない。

**機械検証**: `helix doctor source-authority-consistency`（新設 doctor gate）が、inventory/ut-tdd-ref-audit.yamlの`authority_status`とdocs/governance/infinity-loop-source-capability-ledger.md §1.2の`predecessor-ut`行statusの不一致を検出した場合にfail-closeすること。加えて、schemas/source-ref-audit.schema.jsonへ新規結線したajv検証について、他の必須項目（repository/observed_at/refs/coverage_boundary）は満たすがauthority_statusのみ欠落させたfixtureを作成し、ajvのエラーパスが`authority_status`を名指しすることを確認する（既存の無関係な構造不一致で常にrejectされる状態ではなく、authority_status欠落を原因とするrejectであることをテストで切り分ける）。

### UT-03 [major] 指示された照合正本(3 TSV)は当該repoを一切含まず機械照合が実行不能
- 是正種別: 権威順序修正 / status: 改訂済（検証指摘反映）
- 対象: `01-authority-and-source-order.md`, `requirements/source-disposition.yaml`

検証の結果、01-authority-and-source-order.mdおよびpackage内の関連文書（design-harness/ut-reference-boundary.md、source-reconciliation.md、inventory/source-references.yaml、00-executive-rebaseline.md、10-full-ref-adoption.md、integration/full-ref-inventory-and-adoption.md）のいずれにも、`helix-agent-harness-explicit-repo-all-ref-content-ledger-2026-07-08.tsv`等の3 TSVを`unison-ai-product/UT-TDD_AGENT-HARNESS`の照合正本として位置付ける記述は現存しない（package全体grepで該当0件）。したがって『削除』を要する既存の誤記述は存在せず、原案の『削除』という行為記述は実体と一致しない。是正は『削除』ではなく『予防的な明記の新規追加』へ差し替える: 01-authority-and-source-order.mdの『## 変換元と参考元』section内、UT-TDD_AGENT-HARNESSの既存段落の直後に新規小節を追加し、(1) 上記3 TSVは外部OSS agent harness競合サーベイ（bradAGI/awesome-cli-coding-agents、agentscope-ai/QwenPaw等）であり当該repoのref/行を1件も含まない（grep該当0件・機械照合不能）ため、`unison-ai-product/UT-TDD_AGENT-HARNESS`の権威sourceとしてout-of-scopeであること、(2) `unison-ai-product/UT-TDD_AGENT-HARNESS`に対する唯一の権威sourceはdocs/governance/infinity-loop-source-capability-ledger.md §1.2（前身Git authority receipts、現状BLOCKED）および§1.2.1（historical seed、current authorityではない、authority_reuse_allowed=false）と、HBR-INV-002が要求するlive Git enumeration（refs/heads、refs/tags、PR heads、merge bases）の実行結果に限定されること、を明記する。requirements/source-disposition.yamlについても、当該3 TSVをUT-TDD_AGENT-HARNESSのdisposition根拠として引用する行があれば同様にout-of-scope注記を追加する（無ければ本ファイルへの変更は不要）。

**機械検証**: grep -l 'UT-TDD_AGENT-HARNESS\|unison-ai-product' <3 TSVファイル> が0件ヒットであることを再確認するコマンド出力、および01-authority-and-source-order.mdの新設小節に『UT-TDD_AGENT-HARNESS: infinity-loop-source-capability-ledger.md §1.2/§1.2.1 + live git enumeration (HBR-INV-002) が sole authority、上記3 TSVはout-of-scope（grep該当0件）』の一致する行が存在することをgrepで機械確認する。

### UT-04 [minor] 『全検査』網羅性claimが自己申告どまりで機械的裏付けが無いことを文書自身が認めている
- 是正種別: プロセス要件追加 / status: 検証合格
- 対象: `HBR-INV-002`, `AC-INV-02`, `10-full-ref-adoption.md`, `00-executive-rebaseline.md`, `inventory/ut-tdd-ref-audit.yaml`

inventory/ut-tdd-ref-audit.yaml の coverage_boundary は `product_requirement: production inventory command must enumerate refs/heads/*, refs/tags/*, open/closed PR heads and merge bases directly from Git before disposition closure` を明記しながら、この機械 enumeration を経ずに disposition closure（adopt_with_hardening 等）を確定表記しており、自己矛盾している。是正として、HBR-INV-002（All Git refs）に対する AC-INV-02 を拡張し、『refs/heads/*、refs/tags/*、open/closed PR heads、merge bases を Git から直接列挙するコマンド（例: `git for-each-ref` + GitHub PR API 列挙）の実行結果ログ（例: inventory/ut-tdd-ref-enumeration.log）が存在し、かつそのログに記載された ref 集合が ut-tdd-ref-audit.yaml の refs 一覧と完全一致すること』を disposition closure の前提条件として必須化する。この enumeration ログが存在しない間、10-full-ref-adoption.md・00-executive-rebaseline.md の見出しは『全検査からの抽出採用強化』のような確定済み事実の表現を用いてはならず、既存の HELIX 記法（例: HC-CHAT-031/041 の `in-progress` status 表記）に倣い『in-progress: ref enumeration gate未実行』等の非確定表現へ是正する。

**機械検証**: inventory/ut-tdd-ref-enumeration.log（または同等の生成物）が存在し、そこに列挙された ref 集合と ut-tdd-ref-audit.yaml の refs フィールドが完全一致することを比較するスクリプト（diff/set比較）の exit code、および 10-full-ref-adoption.md・00-executive-rebaseline.md の該当見出しが enumeration ログ生成前は `in-progress` 等の非確定語を含み、`全検査`/`確定`のような完了断定語を含まないことをlintするテキスト検査（grepベースのdoctor gate）で機械確認する。


## 軸: 既存資産の全棚卸し (`asset-inventory`)

### AST-01 [critical] 旧HELIX(ai-dev-kit-vscode)ソースへの言及が皆無
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `README.md#Source roles`, `01-authority-and-source-order.md#変換元と参考元`, `03-existing-asset-inventory.md`, `docs/migration/helix-source-inventory.md`, `docs/migration/helix-porting-map.md`

README.mdの『Source roles』に旧HELIXを正式なsource roleとして追加する: `- 旧HELIX（ai-dev-kit-vscode、git@github.com:RetryYN/ai-dev-kit-vscode.git）: 個別機能（command/skill/subagent/detector/advisor role）ソースの正本。read-only参照専用、bulk import禁止、behavior atom採取のうえTS/Node再実装またはPython proposal worker化する。`。あわせて01-authority-and-source-order.mdの『変換元と参考元』節に『### 旧HELIX（ai-dev-kit-vscode）』を新設し、『旧HELIXは個別機能ソースの正本であり、仕組み（Vモデル・gate・state DB・harness ルール）には従属する。粒度に応じてL1=機能エリア/L3=機能ユニット/L4-L6=command/algorithmで取捨選択し、CLI識別子・state pathをそのままHELIX正本へ昇格しない。棚卸し台帳はdocs/migration/helix-source-inventory.md（snapshot destination=vendor/helix-source/、copied files=1451、約12.2MiB）とdocs/migration/helix-porting-map.mdを正本として引用する』という規範precedence項目を追記する。03-existing-asset-inventory.mdの棚卸し本文にも同ソースを明示リンクする一文を追加する。

**機械検証**: grep -c 'ai-dev-kit-vscode' README.md 01-authority-and-source-order.md 03-existing-asset-inventory.md がいずれも1以上であることを確認するコマンド、およびdocs/migration/helix-source-inventory.mdへの相対パス参照がgrep -n 'helix-source-inventory.md' README.md 01-authority-and-source-order.mdで検出できること。

### AST-02 [critical] リポジトリ実体側の既存HELIX-HARNESS資産(agents/skills/hooks/CLI/DB projections/teams)が棚卸し対象に含まれていない
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `03-existing-asset-inventory.md`, `docs/migration/internal-asset-inventory.md`

03-existing-asset-inventory.mdに新節『## HELIX-HARNESS 現行リポジトリ既存資産（追補）』を追加し、以下を実カウントとともに記載する: `- .claude/agents/: 21ファイル（allowlist済みsubagent定義。正本=src/runtime/agent-guard-policy.tsのSUBAGENT_ALLOWLIST）` / `- .claude/hooks/: 4ファイル（agent-guard.ts, git-command-guard.ts, session-log.ts, work-guard.ts）` / `- .helix/teams/: example-review-team.yaml（helix team run定義）` / `- CLI: src/cli.ts, src/cli/ 配下（helix runtime CLIエントリ）` / `- DB projections: harness.db（src/state-db/projection-writer.ts経由、PLAN-L7-44-harness-db-master）と asset-drift/rule-drift 検査機構`。出典・突合せ台帳としてdocs/migration/internal-asset-inventory.mdを明示引用し、Hybrid core/Workflow Engine/UT-TDD棚卸しと並列カテゴリとして扱うことで、棚卸し対象がzipアーカイブとUT-TDDドナー参照のみに閉じないことを明記する。

**機械検証**: find .claude/agents -maxdepth 1 -type f | wc -l が21であること、ls .claude/hooks が4ファイル(agent-guard.ts, git-command-guard.ts, session-log.ts, work-guard.ts)と一致すること、grep -n '.claude/agents\|.helix/teams\|harness.db\|src/cli' 03-existing-asset-inventory.md がヒットすることを確認するコマンド。

### AST-03 [major] Hybrid core archiveの宣言ファイル名・SHA256・件数が実在候補と不一致で「全棚卸し」claimを独立検証できない
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `inventory/source-references.yaml`, `inventory/hybrid-core-summary.json`, `inventory/hybrid-core-files.csv`, `03-existing-asset-inventory.md`, `inventory/source-checksums.md`

inventory/source-references.yamlのlocal_archives（HELIX core engine baseline: filename『ハイブリッド設計ドキュメント_v1(1).zip』、sha256=fd8854603fe908e9b3a4cab00952f1efdecafaf655a6d25a2c6cc64be9632f6f）、inventory/hybrid-core-summary.jsonのsource_archive/archive_sha256/total_files(715)、03-existing-asset-inventory.mdの『files: 715』『coverage: 100%』は、実作業環境で実際に到達可能なアーカイブ実体（現状の唯一候補『ハイブリッド設計ドキュメントv1-fixed.zip』、sha256=9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3、file entries=703）と再照合する。是正手順: (a) 正本archiveを一意に確定し、宣言filename・sha256をinventory/source-references.yaml・inventory/hybrid-core-summary.json・inventory/source-checksums.mdへ実体と一致させて更新する（架空のfilenameや到達不能なsha256を正本として残さない）、(b) 確定archiveのfile entries実測値（`unzip -l <archive>`相当のカウント）とhybrid-core-summary.jsonのtotal_files値・hybrid-core-files.csvの行数（現状716行=header1+data715）を一致させる、(c) (a)(b)未完了の間は03-existing-asset-inventory.mdの『coverage: 100%』『files: 715』をdraft/unverifiedと明記し、確定claimとして扱わない。

**機械検証**: sha256sum <確定archive> の出力がinventory/source-references.yaml・inventory/hybrid-core-summary.jsonのarchive_sha256と一致すること、unzip -l <確定archive> のfile entries数とinventory/hybrid-core-files.csvのデータ行数(`tail -n +2 inventory/hybrid-core-files.csv | wc -l`)が一致することを確認するコマンド2本。

### AST-04 [major] requirements/source-disposition.yamlがPython 29ファイルのうち17ファイルの採用決定行を欠く
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `requirements/source-disposition.yaml`, `inventory/python-partial-modification-ledger.yaml`

requirements/source-disposition.yaml（schema_version: helix-source-disposition-ledger/v2）に、inventory/python-partial-modification-ledger.yamlのfiles(29件)のうち未収載の17ファイル分をsource-idとして追加する: tools/agent_meta.py, tools/build.py, tools/consistency.py, tools/derive_traces.py, tools/diagram_dsl.py, tools/export_sheets.py, tools/fix_names.py, tools/hook_gate.py, tools/id_utils.py, tools/md_export.py, tools/package.py, tools/render.py, tools/scope.py, tools/selftest.py, tools/style.py, tools/validate.py, tools/verify_files.py。各行はtemplates/source-disposition-row.template.yamlの型で、python-partial-modification-ledger.yamlの対応entryからasset_id/decision/original_digest/change_scope/compatibility_oracles/rollbackを転記し、schemas/source-disposition-ledger.schema.json必須フィールド（元path・元digest・変更範囲・compatibility oracle・rollback source）を欠落させない。追加後、requirements/source-disposition.yamlのPython関連asset_id件数を29件（現行12件+追加17件）に一致させる。

**機械検証**: python3等でrequirements/source-disposition.yamlをパースし、asset_idがhybrid-docgen/tools/*.pyであるrowの件数が29であること、かつinventory/python-partial-modification-ledger.yamlのfiles[*].pathの集合(29件)と1:1対応することを突合するコマンド。

### AST-05 [minor] inventory/hybrid-core-files.csvがCRLF改行で提供されており機械検証時にハッシュ列末尾へ\rが混入しうる
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `inventory/hybrid-core-files.csv`

inventory/hybrid-core-files.csvの改行コードをCRLF(\r\n)からLF(\n)へ統一する。あわせて03-existing-asset-inventory.md（または本CSVのheader直下）に『改行コード: LF固定。sha256列は64桁固定長であり末尾に\rを含まない』という機械検証前提を明記し、単純なawk/csvパーサでの誤検知（65文字扱い）を防止する。

**機械検証**: file inventory/hybrid-core-files.csv の出力に『CRLF』が含まれないこと、および awk -F, '{print length($5)}' inventory/hybrid-core-files.csv | sort -u の結果が全行64であることを確認するコマンド。


## 軸: UWRS判断コアエンジン活用 (`uwrs`)

### UWRS-01 [major] 判断コアエンジンの実行形態(skill注入 vs CLI化)の決定が記録されていない
- 是正種別: 要件修正 / status: 改訂済（検証指摘反映）
- 対象: `D-009`, `decisions/decision-ledger.md`, `integration/workflow-engine-integration.md`, `06-workflow-requirements-judgment-core.md`

『実行形態の未決着』はdecision-ledger.mdの1行だけを書き換えても解消しない（14-risks-and-open-decisions.mdのOpen decisions一覧には元々この論点は存在せず、そこへの操作は不要かつ不能。またintegration/workflow-engine-integration.mdとその関連記述にPython実行の可能性を残す文言が現存する）ため、次の3ファイルを同時に是正する。status確定はPO権限（CLAUDE.md charter §3: L3要件は承認のみ＝人）であり、AIはdecision-ledgerのstatusをconfirmedへ自己昇格させない。

(1) decisions/decision-ledger.md: D-009行のDecision文言のみを次へ改訂し、Statusは`proposed`のまま据え置く（POのconfirmed承認を別途要求する）: 「D-009 | Workflow Engine v1.1 judgment coreはbyte-pin vendor資産とし、adapter実行はNode CLIサブコマンド（`helix requirements interview --read-only` / `helix requirements compile --l3-draft` / `helix workflow validate|derive|graph`）としてのみ実装し、Python側には実行権限を与えない（ADR-009: Node=唯一transaction writer、Pythonは`source_atomization`/`document_engine`/`detector`/`product_data`/`analysis`のclosed capability classに限るproposal-only worker）。PO承認待ち（confirmed化は本ledgerの次回改訂で別途行う）。 | proposed」。

(2) integration/workflow-engine-integration.mdの項目3見出し「Hybrid Python adapter」を「Node adapter（ADR-009準拠）」へ改称し、本文を「engine outputを既存YAML、typed ID、schema/trace/build inputへNode CLI側で変換する。」へ改訂する。さらに末尾の「Engineのschema、question catalog、prompts、contractsはvendor directoryでbyte pinし、HELIX固有adapterは`hybrid-docgen/helix_adapter/`またはNode runtime側に置きます。」の一文から「Python側に置く」余地（`hybrid-docgen/helix_adapter/`という選択肢と「または」の両論併記）を削除し、「Engineのschema、question catalog、prompts、contractsはvendor directoryでbyte pinし、HELIX固有adapterはNode runtime側（D-009のNode CLIサブコマンド）にのみ置き、Python側へは実行権限を与えない。」へ一本化する。

(3) 06-workflow-requirements-judgment-core.mdの「既存Pythonとの接続」節に、adapter実行主体を明記する追記を行う: 「adapterの実行はNode CLI側（D-009参照）が担い、既存Python資産（`schema_check`/`spec_check`/`spec_trace`/`build`/`schedule`/`assign`/`review`）へは検証・入力受け渡しの委譲のみで、Python側にcommand実行権限は与えない（ADR-009準拠）。」

14-risks-and-open-decisions.mdは対象論点が元から不在のため変更しない（affected_idsから除外）。

**機械検証**: grep -c 'Hybrid Python adapter' integration/workflow-engine-integration.md が是正前1件→是正後0件へ変化すること、かつ grep -c 'Node runtime側（D-009のNode CLIサブコマンド）にのみ置き' integration/workflow-engine-integration.md が是正前0件→是正後1件へ変化することを確認するgateを追加する。あわせて grep -E '^\| D-009 \|.*Node CLIサブコマンド.*\| proposed \|$' decisions/decision-ledger.md が是正後に1件マッチすることを確認し、grep -c 'confirmed' decisions/decision-ledger.md の総数が是正前後で変化しない（D-009行がconfirmedへ書き換わっていない）ことを断言するテストを追加する。さらに grep -c '実行形態' 06-workflow-requirements-judgment-core.md が是正前0件→是正後1件（新規追記の存在）へ変化することを確認する。

### UWRS-02 [major] 「derived views同一ID共有」claim(AC-ELICIT-07)を検証する仕組みが存在しない
- 是正種別: schema修正 / status: 検証合格
- 対象: `schemas/derived-requirements.schema.json`, `requirements/AC-ELICIT-07`, `HBR-ELICIT-010`, `validation/package-validation-report.json`

schemas/derived-requirements.schema.json（vendor直下 vendor/workflow-requirements-engine-v1.1.0/schemas/derived-requirements.schema.json は byte-pin のまま改変しない。改変対象はリポジトリ側adapter schema コピーであるルート直下 schemas/derived-requirements.schema.json のみ）を次のように改訂する: business_flow / screen_flow / api_requirements / data_requirements / permission_matrix / notification_requirements / audit_requirements / test_scenarios の各配列要素の items を type: object のみから、required: [workflow_id, transition_id] と properties: {workflow_id: {type: string, pattern: ^WF-}, transition_id: {type: string, pattern: ^TR-}} を持つ object 定義へ拡張する（additionalProperties: true は維持し既存キーを壊さない）。これにより AC-ELICIT-07『Business, screen, API, data, permission, notification, audit and tests share the same workflow/transition IDs』がschemaレベルで機械強制される。あわせて validation/package-validation-report.json の checks 配列に derived_requirements_id_consistency（business_flow〜test_scenariosの全配列要素が同一 workflow_id/transition_id 集合を共有していることを検証し、missing/mismatchを件数付きで報告する）チェックを新設し、summaryにも反映する。

**機械検証**: adapter schema（schemas/derived-requirements.schema.json）に対し、workflow_id/transition_idを欠いたderived-requirementsサンプルを投入するとschema validationがfailすることを示すcontract test、および validation/package-validation-report.json のchecks配列に derived_requirements_id_consistency が ok=true で出力されるgate run。

### UWRS-03 [major] 『L4-L6設計判断への降下』を受け取るテンプレート/module bindingが定義されていない
- 是正種別: 基本設計 / status: 検証合格
- 対象: `templates/L4-L6-workflow-judgment-design.template.yaml`, `integration/workflow-engine-integration.md`, `06-workflow-requirements-judgment-core.md`

新規テンプレート templates/L4-L6-workflow-judgment-design.template.yaml を追加する。フィールド構成: workflow_id（参照元L3契約）、switching_bindings: [{switching_id, l4_module, handler_signature, trace_target}]、routing_bindings: [{routing_id, l5_binding, route_table_ref, trace_target}]、resource_pool_bindings: [{resource_pool_id, l6_binding, pool_definition_ref, quota_policy_ref}]、allocation_policy_bindings: [{allocation_policy_id, l6_binding, policy_function_ref}]、unresolved_items: []。integration/workflow-engine-integration.md の項目4『L4-L6 design judgment』の記述末尾に「実体成果物 = templates/L4-L6-workflow-judgment-design.template.yaml（design-harness/配下のUI専用テンプレートとは別系統）」と明記し、06-workflow-requirements-judgment-core.mdの『既存Pythonとの接続』節にも当テンプレートへのL3→L4-L6降下経路を1文で追記する。

**機械検証**: templates/L4-L6-workflow-judgment-design.template.yaml がYAMLとしてparse可能であること、L3-workflow-contract.template.yamlのswitching/routing/resource_pools/allocation_policiesの各IDが本テンプレートの対応bindings配列でtrace可能であることを検証するcontract test（trace_target_integrityチェックの拡張として実装し、validation/package-validation-report.json のchecksへ追加する）。

**基本設計要点**: テンプレートはL3-workflow-contract.template.yamlのswitching/routing/resource_pools/allocation_policies配列を入力として受け、各要素をL4-L6設計契約の具体的なmodule/binding単位（switching→ハンドラ関数シグネチャ、routing→ルーティングテーブル行、resource_pool→pool定義とquota、allocation_policy→policy関数）へ1件ずつ降下・追跡できる構造にする。design-harness/配下のUI専用テンプレート（L4-ui-profile等）とは別ネームスペース（templates/直下、design-harness/ではない）に置き、UI設計とworkflow judgment core設計を混同しない。

### UWRS-04 [minor] 06番文書がUWRSの個別カタログ・契約ファイルへ明示的に言及していない
- 是正種別: 要件修正 / status: 検証合格
- 対象: `06-workflow-requirements-judgment-core.md`

06-workflow-requirements-judgment-core.md に『成果物マッピング』節を新設し、design-harness/hybrid-document-binding.yamlと同型のマッピング表として以下を追記する（表形式、質問カタログ・契約ファイル→本文の概念の対応を1行1件で明示）。対応表: vendor/workflow-requirements-engine-v1.1.0/catalogs/base-question-catalog.md → 『共通質問』（対象・actor・開始・状態・分岐・処理・戻り・終了・例外）。vendor/workflow-requirements-engine-v1.1.0/catalogs/conditional-question-catalog.yaml → 『signal質問』（承認・金額・期限・外部API・個人情報・AI判断・resource制約）。vendor/workflow-requirements-engine-v1.1.0/catalogs/runtime-orchestration-question-catalog.md → 『要求ヒアリング』のRuntime observation関連質問。vendor/workflow-requirements-engine-v1.1.0/contracts/derived-mapping.md → 『workflow transitionからFR、GWT AC、screen、API、data、permission、notification、audit、testを同じIDで生成』の変換規則。vendor/workflow-requirements-engine-v1.1.0/contracts/workflow-to-requirement-contract.md → 『L3: AI draft、PO approve』のL3契約コンパイル入出力仕様。vendor/workflow-requirements-engine-v1.1.0/contracts/runtime-orchestration-contract.md → 『Runtime observation』（実績投影・confirmed requirement不変更）。vendor/workflow-requirements-engine-v1.1.0/prompts/workflow-extraction-prompt.md → 『既存Pythonとの接続』節のengine質問・workflow model変換の抽出プロンプト。これによりCHECKSUMS.mdのみに存在していたファイル参照を要件文書側でも可読なマッピングとして追跡可能にする。

**機械検証**: 06-workflow-requirements-judgment-core.md内の『成果物マッピング』表に列挙された全ファイルパスが実在し（vendor/workflow-requirements-engine-v1.1.0配下）、CHECKSUMS.mdのエントリと1:1で一致することを確認するテスト（design_harness_transformation_sourceチェックと同様の存在確認gateをworkflow judgment core向けに追加）。


## 軸: パッケージ内部整合 (`internal-consistency`)

### IC-01 [major] 受入基準の総数に関する本文記述がSSoTと矛盾
- 是正種別: 要件修正 / status: 検証合格
- 対象: `13-acceptance-criteria.md`, `requirements/acceptance-criteria.yaml`

v0.5.0 `13-acceptance-criteria.md` 冒頭の記述を『機械化可能な受入条件を`requirements/acceptance-criteria.yaml`へ84件定義しました』から『機械化可能な受入条件を`requirements/acceptance-criteria.yaml`へ111件定義しました（`count: 111`、`acceptance_criteria`リスト実要素数111と一致）』へ是正する。本文中の他箇所に84件由来の集計・内訳記述が残る場合はすべて111件基準へ揃えて書き直す。以後、本文の件数claimは`validation/package-validation-report.json`の`catalog_counts`チェック（`detail: "requirements=163, acceptance=111"`）の実測値と完全一致することを起票時に機械照合する運用とする。

**機械検証**: `python3 -c "import yaml,json;a=yaml.safe_load(open('requirements/acceptance-criteria.yaml'));r=json.load(open('validation/package-validation-report.json'));assert a['count']==len(a['acceptance_criteria'])==111;assert '111' in [c['detail'] for c in r['checks'] if c['name']=='catalog_counts'][0]"` が例外なく完走すること、かつ `13-acceptance-criteria.md` 本文中に文字列 `84件` が0件であること（`grep -c 84件 13-acceptance-criteria.md` が0を返す）。

### IC-02 [major] README『Start here』動線がリンク切れ、かつ errata ファイルのバージョン識別が三系統に分裂
- 是正種別: AC追加修正 / status: 改訂済（検証指摘反映）
- 対象: `19-v0.3.2-errata.md`, `19-v0.4.0-errata.md`, `requirements/change-delta-v0.3.2.yaml`, `requirements/requirements-catalog.yaml`

是正方向を反転する（検証者指摘どおり、本文ではなくファイル名を是正する）。(1) `19-v0.3.2-errata.md`を`git mv`で`19-v0.4.0-errata.md`へ改名する。H1見出し（既に『# v0.4.0 Errata — HELIX / UT / Core関係の訂正』）および本文（v0.4.0時点の3件の誤りとその訂正を記述）はそのまま変更しない。これにより既存の命名慣行（15=v0.2の誤り、16=v0.3.0の誤り、18=v0.3.1の誤り）と、README.md『Start here』5番目リンク`19-v0.4.0-errata.md`（is already correct — 変更不要）の三者が揃う。README.mdは変更しない。(2) `requirements/change-delta-v0.3.2.yaml`には『v0.3.2からv0.4.0への遷移』という、このファイルに存在しないv0.3.2状態を主張する記述を追加しない。代わりに、ファイル自身の実フィールド（`current_state: proposed_rebaseline_v0.3.1` / `next_state: proposed_rebaseline_v0.4.0`）をそのまま転記するコメントのみを冒頭に追記し、『このdeltaはv0.3.1からv0.4.0への遷移である（current_state/next_stateフィールド参照）』と正確に記す。また、このファイル自体の名称（`v0.3.2`）が自身の`next_state`（`v0.4.0`）および既存の`change-delta-v0.4.0.yaml`（`current_state`=`next_state`=`v0.4.0`の別deltaが既に存在）と整合していないファイル命名上の不整合は、本is正では改名・統合せず、別途フォローアップPLANでの解消対象として明示注記するに留める（衝突回避のため）。(3) `requirements-catalog.yaml`のトップレベル`status`を、delta chainの終端値と一致する`proposed_rebaseline_v0.4.0`（`change-delta-v0.3.1.yaml`→`v0.3.2.yaml`(next=v0.4.0)→`v0.4.0.yaml`(current=next=v0.4.0)の終端）へ統一し、対応するdelta chainを持たない自由記述`proposed_rebaseline_helix_native_design_harness`を廃止する。

**機械検証**: `test -f 19-v0.4.0-errata.md && ! test -e 19-v0.3.2-errata.md`（改名が適用され旧名が残存しないこと）。かつ `grep -n "](19-" README.md | sed -E 's/.*\((19-[^)]+)\).*/\1/' | xargs -I{} test -f {}`（README内の19-*リンクが全て実ファイルに解決すること、リンク切れ0件）。かつ `python3 -c "h1=open('19-v0.4.0-errata.md').readline(); assert 'v0.4.0' in h1"`（H1とファイル名の一致）。かつ `! grep -q 'v0.3.2から' requirements/change-delta-v0.3.2.yaml`（存在しないv0.3.2起点状態を主張する記述が再導入されていないこと）。かつ `python3 -c "import yaml; d=yaml.safe_load(open('requirements/change-delta-v0.3.2.yaml')); assert d['current_state']=='proposed_rebaseline_v0.3.1' and d['next_state']=='proposed_rebaseline_v0.4.0'"`（フィールド自体は改変されていないこと）。かつ `python3 -c "import yaml; cat=yaml.safe_load(open('requirements/requirements-catalog.yaml')); assert cat['status']=='proposed_rebaseline_v0.4.0'"`（catalog statusがdelta chain終端next_stateと一致すること）。

### IC-03 [major] traceability.yamlのCHAT由来refined_intoエッジが要件sourcesと24件不一致、自己検証もこの粒度を見ていない
- 是正種別: schema修正 / status: 検証合格
- 対象: `requirements/traceability.yaml`, `requirements/requirements-catalog.yaml`, `validation/package-validation-report.json`

`requirements/traceability.yaml`へ、`requirements-catalog.yaml`中の各要件の`sources`欄に列挙されたCHAT-IDごとに`from: <CHAT-ID> / to: <当該要件ID> / type: refined_into`のedgeを漏れなく追加する。特にHBR-DH-003, 004〜020, 021〜024, 028, 029等、`sources`に`CHAT-019`（および`CHAT-010/011/018/020`）を持つ全要件についてCHAT-019→当該IDのedgeを新設する（現状は該当edgeが1本も存在しない）。あわせて`validation/package-validation-report.json`の`chat_trace_closure`チェックの検証粒度を『CHAT-IDが最低1回使われているか』から『各要件の`sources`記載CHAT-IDそれぞれについて対応する`refined_into`edgeが存在するか』の要件単位突合へ引き上げ、不一致があれば`ok:false`かつ不一致要件IDリストを`detail`へ列挙する形式に変更する。この突合ロジックはprose記述ではなく実行可能なvalidationスクリプトとして`validation/`配下に実装し、パッケージ生成時に自動実行する。

**機械検証**: 新設した突合スクリプト（例: `validation/check-chat-trace-closure.py`）を実行し、`requirements-catalog.yaml`の全要件について`sources`中の各CHAT-IDに対応する`traceability.yaml`の`refined_into`edgeが1件以上存在することを終了コード0で確認する。実行後の`validation/package-validation-report.json`の`chat_trace_closure`チェックが`ok:true`かつ`detail`に『要件単位で不一致0件』相当の実測値を含むこと。

### IC-04 [major] decision-ledger.md（D-001〜D-014）がパッケージ内のどこからも参照されない孤立ファイル
- 是正種別: AC追加修正 / status: 改訂済（検証指摘反映）
- 対象: `decisions/decision-ledger.md`, `14-risks-and-open-decisions.md`, `README.md`, `requirements/requirements-catalog.yaml`, `MANIFEST.json`

意思決定台帳の相互参照付与自体は維持し、MANIFEST.json部分の検証バグのみ是正する（正の是正が検証を裏付けるようにする）。(a)〜(d)は元是正案のまま維持: 14-risks-and-open-decisions.md『Open decisions』6項目各行末へ対応D-ID参照（またはD-ID無し注記）を追記し、decisions/decision-ledger.mdへ逆参照『関連Open decision: 14-risks-and-open-decisions.md #Open decisions』を明記、README.mdの目次・requirements-catalog.yamlのschemaへ`decision_refs: [D-00x]`欄を追加。(e) MANIFEST.jsonの`roles`は既存キーが全て`hybrid_python`等アンダースコア命名の説明文字列マップ（キー→説明prose、パスではない）であるため、この命名規約に合わせて新規キー`decision_ledger`（アンダースコア）を追加し、値には実ファイルパスを含む説明文字列『decisions/decision-ledger.md — architecture/requirement decision authority』を設定する（ハイフン付き部分文字列`decision-ledger`はキーではなく値の中の実パス参照として出現させる）。

**機械検証**: `grep -c "D-0" 14-risks-and-open-decisions.md` が1以上。かつ `grep -c "Open decision" decisions/decision-ledger.md` が1以上。かつ `python3 -c "import json; m=json.load(open('MANIFEST.json')); assert 'decision_ledger' in m['roles']; assert 'decision-ledger' in m['roles']['decision_ledger']"` が例外なく完走すること（辞書のキー存在とキー配下の値文字列の両方を検査し、dictのfor-inがkeyのみを走査する問題およびハイフン/アンダースコア命名不一致を回避する）。


## 軸: リポジトリ正本との権威整合 (`authority`)

### AUTH-001 [critical] Python Core優先の権威順序がCLAUDE.md precedenceおよびADR-009のNode単独writer原則と衝突
- 是正種別: 権威順序修正 / status: 検証合格
- 対象: `01-authority-and-source-order.md#規範precedence`

01-authority-and-source-order.md の『規範precedence』を次のとおり是正する（v0.5.0）。
1. 人が承認したHELIXのL0/L1/L2/L3要求・判断記録
2. HELIX-HARNESS正本の『仕組み』＝Vモデル工程・gate・state DB・harnessルール（CLAUDE.md precedence、ADR-009）
3. TypeScript / Node runtime contract（ADR-009: Node = schema・lineage・digest・lease/fence・policyを再検証する唯一のtransaction writer）
4. 本パッケージのHELIX-native Design HARNESS契約・schema・gate
5. Workflow Requirements Skill v1.1 adapter contract
6. HELIX Hybrid Python Coreのpinned sourceと承認済み部分修正台帳（proposal-only worker。ADR-009の許可capability class `source_atomization`/`document_engine`/`detector`/`product_data`/`analysis`のclosed listに限定し、harness.db・state・gate・Issue・memory・release pointerへauthoritative writeを持たない）
7. Detection DBのevent / evidence / projection
8. generated docs / views / reports

旧2番『HELIX Hybrid Python Coreのpinned source…』は個別機能ソースであり、CLAUDE.mdのprecedence『仕組み＝HELIXハーネスが上、個別機能は仕組みを超えない』およびADR-009『Node側が唯一のtransaction writerとしてcommitする』に劣後させ、Node runtime contract（旧5番）より下位へ繰り下げる。あわせて『変換元と参考元』直後に次を追記する: 『Python coreはNodeにより再検証されるproposalの供給源であり、本節のいかなる順位もPythonへのauthoritative write権限を含意しない（ADR-009 §Decision）』。

### AUTH-002 [critical] ADR-000がADR-009と衝突する内容を持ちながらsupersedes宣言せず、Python許容capability classもclosed listを超えて拡張している
- 是正種別: 新規要件 / status: 検証合格
- 対象: `decisions/ADR-000-hybrid-core-runtime-rebaseline-proposed.md`

decisions/ADR-000-hybrid-core-runtime-rebaseline-proposed.md を次のとおり是正する（v0.5.0）。
(1) 冒頭メタデータに `Supersedes-Check: ADR-009-node-python-linux-runtime (accepted) — 本ADRはADR-009を上書き・逸脱しない。抵触する場合はADR-009が優先する` を追加する。
(2) `Supersedes` リストに `ADR-009-node-python-linux-runtime` は含めない（ADR-009はacceptedであり覆さない）。代わりに新設項目として『本ADRの適用範囲はADR-009の許容範囲内に限定される』を明記する。
(3) Decision本文の『`hybrid-docgen/tools/*.py`を基準実装として採用する』『Python coreをgreenfieldで全面再実装しない』は、ADR-009の『旧HELIXの機能ロジックはTS/Nodeで再実装し、計算・解析に適するものだけをversioned contract配下のPython proposal workerへ隔離する』『許可capability classは`source_atomization`/`document_engine`/`detector`/`product_data`/`analysis`のclosed list』と衝突するため、次に置き換える: 『`hybrid-docgen/tools/*.py`のうち、ADR-009の許可capability class（`source_atomization`/`document_engine`/`detector`/`product_data`/`analysis`）に属するbehavior atomのみを、versioned contract配下のPython proposal workerとして個別に採用する。それ以外（制御面・writer・orchestration相当）の機能はTS/Nodeで再実装する。bulk portは禁止し、採用単位は個別behavior atomとする』。
(4) 『Pythonはgenerated/staging outputを生成し、Nodeがcanonical promotionと外部副作用を所有する』は維持しつつ、ADR-009文言に合わせ『Nodeがschema・lineage・digest・lease/fence・policyを再検証し、唯一のtransaction writerとしてcommitする。Pythonはnetwork default denyとし、DB path・credential・repository・`.helix/`を受け取らない』を追記する。
(5) statusはproposedのまま維持し、承認前に断定調で確定事実として扱わないことを明記する一文『本ADRはPO承認までproposedであり、承認前に02章以降で確定事実として記述してはならない』を追加する。

### AUTH-003 [major] L0 charterの10本柱（P0–P9）との対応関係が一切示されておらず、同名ラベルの別文脈流用で混同リスクがある
- 是正種別: AC追加修正 / status: 検証合格
- 対象: `17-design-harness-integration.md`, `source-material/design-harness-base-v0.1/plans/PLAN-M-design-harness-internalization-draft.md`

v0.5.0で次の是正を行う。
(1) 17-design-harness-integration.md（または新設の対応節）に『charter対応表』を追加し、本パッケージの各章・design-harness/配下の要素が `/home/tenni/HELIX-HARNESS/docs/design/helix/L0-charter/helix-charter_v0.1.md` §4の10本柱（P0逸脱受け止め／P1自律走行エンジン／P2オーケストレーション／P3強い検証基盤／P4自動保守／P5コンテキスト効率／P6 GitHub運用自動化／P7ハーネスメモリ／P8外部連携／P9 DB収束）のどれに対応するかを明示する。対応が無い柱は『非対象』と明記し、無関係に同名ラベルを流用しない。
(2) source-material/design-harness-base-v0.1/plans/PLAN-M-design-harness-internalization-draft.md の36-45行目にある移行フェーズラベル『P0 normalization』〜『P9 pack』は、charterのP0–P9と無関係な移行フェーズ番号であるため、charterとの混同を避けるためリネームする（例: `Phase-0 normalization`〜`Phase-9 pack`、またはPLAN-M固有のprefixを付す）。この節を参照する全ての本パッケージ文書（00-executive-rebaseline.md、17-design-harness-integration.md含む）で旧ラベル表記を新ラベルへ置換する。
(3) 受入条件として追加: 『charter P0–P9のラベルと、本パッケージ内の他フェーズ番号ラベルが文字列として衝突しないことをgrep等で機械確認できる（例: `grep -rn 'P[0-9] ' <package>` の出力を目視分類し、charter対応表に列挙されたP0–P9以外の出現がPLAN-M固有prefix付きであることを確認する）』。

### AUTH-004 [major] 全体がproposed/draft状態のまま断定調で『固定する』と記述され、PLAN化・承認境界が示されていない
- 是正種別: 方針決定 / status: 検証合格
- 対象: `00-executive-rebaseline.md`, `02-core-engine-definition.md`, `decisions/decision-ledger.md`, `decisions/ADR-000-hybrid-core-runtime-rebaseline-proposed.md`, `12-migration-roadmap.md`

v0.5.0で次の是正を行う。
(1) decision-ledger.mdの全決定（D-001〜D-013、ADR-000含む）がstatus=proposedである間は、00-executive-rebaseline.mdおよび02-core-engine-definition.mdの断定表現『次で固定する』『基準実装は…である』を、いずれも『（proposed、PO承認待ち）本ドキュメント内の暫定方針として次を提案する』『提案上の基準実装候補は…である』という提案調へ書き換える。断定調は対応する決定がstatus=confirmed/acceptedへ遷移した後にのみ許可する。
(2) 12-migration-roadmap.mdのSlice 0前提条件に、`.claude/CLAUDE.md`が要求するPLAN登録要件を追記する: 『本requirements/ADRセット全体を確定させる前に、`docs/plans/`配下へ`plan_id`・`kind`・`layer`・`status`・`dependencies`・`review_evidence`を備えたPLANを起票し、既存の確定PLAN/ADR（ADR-009等）と抵触する決定には`supersedes:`を宣言する。宣言が欠落した場合はconfirmedへ遷移させない』。
(3) 是正のfalsifiable claim（『proposedのまま確定扱いにしない』）には、機械検証として『decision-ledger.md中のstatus=proposedな決定IDが、00-executive-rebaseline.md/02-core-engine-definition.md本文中で断定的事実表現（『である』『固定する』等）として参照されていないことをlintルール（例: statusフィールドとキーワード近接をgrep/schema検査するCIチェック）で検出する』を追加する。

### AUTH-005 [minor] README.mdのStart hereが存在しないファイル名を指しており、権威文書へのナビゲーションが壊れている
- 是正種別: schema修正 / status: 検証合格
- 対象: `README.md#Start here`

README.mdの『Start here』5番目の参照『19-v0.4.0-errata.md』を、実在するファイル名『19-v0.3.2-errata.md』に修正する。あわせて19-v0.3.2-errata.md冒頭の見出し『# v0.4.0 Errata — HELIX / UT / Core関係の訂正』はファイル名（v0.3.2）とタイトル（v0.4.0）が不一致であるため、v0.5.0では次のいずれかで統一する: (a) ファイルをリネームして`19-v0.4.0-errata.md`とし、README参照はそのまま維持する、または(b) 見出しを『# v0.3.2 Errata — HELIX / UT / Core関係の訂正』へ修正しファイル名と一致させる。パッケージ全体でversioned errataファイルの命名規則（ファイル名のバージョン番号＝見出しのバージョン番号）を統一し、他のerrataファイル（15/16/18番）についても同様の一致を確認する。


## 軸: Linux中心マルチOS (`linux-multios`)

### LNX-01 [major] Node 22混在がADR-009のNode minimum決定と矛盾
- 是正種別: 要件修正 / status: 改訂済（検証指摘反映）
- 対象: `05-linux-first-multios.md`, `integration/linux-first-multios-contract.md`, `HNFR-PLAT-*(Node関連記述箇所)`

v0.5.0では ADR-009（accepted）を単一のNode version決定として扱い、旧マイナー系列を「互換tier」として併存させる記述を全廃する。原文 `05-linux-first-multios.md:13` の一文『Nodeのproduction runtimeはLTS系列を使い、Node 24をprimary、Node 22を互換tierにします。`node:sqlite`へ移行してBun分岐を除去します。』を次へ置換する: 『Nodeのproductionランタイムは Node.js 24 LTS単一系列とし、`>=24.15.0 <25` を minimum とする（ADR-009準拠）。24系より前のLTS系列は canonical/compatibility いずれの gate にも含めない。`node:sqlite` へ移行しBun分岐を除去する。』（前回是正案から『Node 22』という文字列そのものを除去し、数字『22』を一切含まない言い回しに変更 — 検証コマンドの部分一致誤検出を回避するため）。同様に `integration/linux-first-multios-contract.md` の CI matrix ブロック（原文行20-30、`linux-full.node: [22, 24]` を含む）を次へ置換する: `linux-full:
  python: [3.12, 3.13, 3.14]
  node: ["24.15.x"]` とし、`macos-smoke` / `windows-compat-smoke` の `node: [24]` も `node: ["24.15.x"]` に統一する（Node 22 のエントリを削除）。これによりTier定義・CI matrixのいずれの箇所にも『Node 22』『node: 22』相当の文字列が残らず、ADR-009の単一minimum決定（`>=24.15.0 <25`、Node 24 LTS単独）と矛盾しなくなり、かつ指定検証コマンドが誤検出なく0件を返す。

**機械検証**: grep -RniE 'node:\s*\[?\s*22\b|Node ?22' HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/05-linux-first-multios.md HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/integration/linux-first-multios-contract.md が0件を返すこと（是正後の否定文は『22』という数字自体を含まないため誤検出しない）。かつ grep -RniE '24\.15' 同2ファイル が1件以上を返すこと（ADR-009 minimum `>=24.15.0 <25` への準拠記述が残っていること）。

### LNX-02 [major] WSL2 optional compatibility tier の欠落
- 是正種別: AC追加修正 / status: 検証合格
- 対象: `integration/linux-first-multios-contract.md#Tier`, `HNFR-PLAT-001`, `HNFR-PLAT-002`, `HNFR-PLAT-003`, `AC-PLAT-01`, `AC-PLAT-02`

正本（.claude/CLAUDE.md Guard規則）の3段tierをパッケージへ機械的に反映する。`integration/linux-first-multios-contract.md` の `## Tier` セクションへ次を追加する: 『Tier 4: WSL2（Linux distro on Windows）— optional compatibility gate。required conditionではなく、Tier 1 Linux full gateの合否には影響しない。CI matrixの `wsl2-compat-smoke` job（node: ["24.15.x"], python: [3.14]）として任意実行し、failしてもmerge blockしない。』。CI matrix コードブロックへ `wsl2-compat-smoke:
  node: ["24.15.x"]
  python: [3.14]` を追加する。HNFR-PLAT-001の statement 末尾に『WSL2はTier 1 Linuxのoptional compatibility経路として扱い、Tier 1の代替にはしない』を追記し、`sources` に既存 CHAT-012 を維持したまま `verification` に AC-PLAT-01 を維持する。AC-PLAT-01/AC-PLAT-02 の criterion 文へ『WSL2 compatibility job の結果は本ACの合否判定に算入しない（optionalのため）』を追記する。

**機械検証**: grep -RniE 'WSL2' HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/integration/linux-first-multios-contract.md HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/requirements/requirements-catalog.yaml HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/requirements/acceptance-criteria.yaml がそれぞれ1件以上ヒットすること。

### LNX-03 [major] HNFR-PLAT-006 の出典 HYBRID-UTIL が未定義・traceability edge 欠落
- 是正種別: schema修正 / status: 検証合格
- 対象: `HNFR-PLAT-006`, `requirements/traceability.yaml`, `requirements/requirements-catalog.yaml`

`HYBRID-UTIL` は棚卸し・chat-requirements・source-references のいずれにも実体が無い孤立IDであるため廃止し、HNFR-PLAT-006 の `sources` を実在する `CHAT-012`（statement: 『Windows的前提を除き、Linux中心のマルチOS対応とする』）へ張り替える。`requirements/requirements-catalog.yaml` の HNFR-PLAT-006 エントリの `sources:` を `- CHAT-012` に置換する。`requirements/traceability.yaml` の CHAT-012 `refined_into` 系列（現状 PLAT-001,002,003,004,005,007,008,009,010 で PLAT-006 が欠番）へ次の1エントリを挿入する: `- from: CHAT-012
  to: HNFR-PLAT-006
  type: refined_into`（PLAT-005とPLAT-007の間、番号順を維持）。孤立ID再発防止のため、`schemas/requirement-contract.schema.json` または別途 lint script に『`requirements-catalog.yaml` の全 `sources[]` IDは `inventory/chat-requirements.yaml`・`inventory/*-audit.yaml`・`inventory/source-references.yaml` のいずれかに実体を持たねばならない』制約を追加する要件を新設する。

**機械検証**: grep -n 'HYBRID-UTIL' HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/requirements/requirements-catalog.yaml が0件、かつ `grep -A2 "HNFR-PLAT-006" HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/requirements/traceability.yaml` でCHAT-012からのrefined_into edgeが1件検出されること。

**基本設計要点**: 既存 `helix plan lint` 相当の traceability lint を拡張し、requirements-catalog.yaml の sources[] を chat-requirements.yaml / source-references.yaml / ut-tdd-ref-audit.yaml の union に対して突合するID存在検査ステップを追加する設計とする（新規IDが孤立した瞬間にfail-closeする）。

### LNX-04 [minor] AC-PLAT-03 が HNFR-PLAT-006 の LF 正規化を検証しない
- 是正種別: AC追加修正 / status: 検証合格
- 対象: `AC-PLAT-03`, `HNFR-PLAT-006`

`requirements/acceptance-criteria.yaml` の AC-PLAT-03 criterion を次へ置換する: 『Case, separators, Unicode and symlink fixtures produce consistent repository-relative identities; かつ全対象source/YAML/JSON/logs/stdio envelopeファイルはUTF-8エンコーディングかつ改行コードLF（CRLF/CR混在なし）で正規化されていることをfixture検査で確認する（HNFR-PLAT-006準拠）。』。これによりAC-PLAT-03がHNFR-PLAT-006のUTF-8/LF要求を機械検証範囲に含める。

**機械検証**: sed -n '/id: AC-PLAT-03/,/status:/p' HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/requirements/acceptance-criteria.yaml | grep -c LF が1以上を返すこと。

### LNX-05 [minor] CI matrix の macOS/Windows OSバージョン粒度が未指定
- 是正種別: schema修正 / status: 検証合格
- 対象: `integration/linux-first-multios-contract.md#CI-matrix`

`integration/linux-first-multios-contract.md` の CI matrix コードブロックへ runner OSバージョンの明示軸を追加する。次へ置換する: `linux-full:
  os: ["ubuntu-24.04"]
  python: [3.12, 3.13, 3.14]
  node: ["24.15.x"]
macos-smoke:
  os: ["macos-14"]
  node: ["24.15.x"]
  python: [3.14]
windows-compat-smoke:
  os: ["windows-2022"]
  node: ["24.15.x"]
  python: [3.14]
wsl2-compat-smoke:
  os: ["ubuntu-24.04-on-wsl2"]
  node: ["24.15.x"]
  python: [3.14]`。これによりmacOS/Windows/WSL2 smokeのrunner OSバージョンが実装時に解釈揺れしないよう固定する。

**機械検証**: grep -nE 'os:\s*\["(ubuntu-24.04|macos-14|windows-2022|ubuntu-24.04-on-wsl2)' HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.0/integration/linux-first-multios-contract.md が4件ヒットすること。


## 軸: GitHub 上流鮮度・網羅（本監査で機械確定） (`github-freshness`)

### GH-01 [critical] UT-TDD ref 監査が stale（pin 86b581c1 → 現 main 1839fa71、81コミット/12PR 先行）
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `inventory/ut-tdd-ref-audit.yaml`, `HBR-INV-012`, `AC-INV-01`, `HBR-INV-010`, `AC-INV-07`

inventory/ut-tdd-ref-audit.yaml の main ref エントリを再スナップショットする。observed_at を '2026-07-15' から本是正実行日へ更新し、sha を 86b581c12121936180047b6f908bba832e5bbbda から現行 main（1839fa71、旧pinから81コミット/12PR先行）へ差し替える。notable_assets に少なくとも次を追記する: delegation routing (PLAN-L7-255)、drive-aware admission、doctor singleton lock、engine-swap G8 evidence contract、NFR verification foundation (PLAN-L3-08/L4-31/L6-87)、mechanization PLAN L7-445..447。旧 pin 時点の main 記載はそのまま削除せず、`superseded_snapshot` として履歴保持する（is-a-delta-not-overwrite）。あわせて HBR-INV-012 (Closure criteria) の statement を『全 asset に disposition と evidence が付き、かつ最新 observed_at 時点の Git 実体との commit delta が 0（stale pin なし）でない限り棚卸し完了を claim しない』へ修正する。AC-INV-01 (Inventory closure) の criterion 末尾に『snapshot pin が最新 fetch 結果と commit-for-commit 一致すること（delta=0）を機械検証する』を追加する。HBR-INV-010 (Diff impact) の statement 末尾に『delta評価はobserved_atからの経過コミット数を明記した定量値（例: N commits / M PR 先行）で行い、日付のみの更新をdelta評価とみなさない』を追加し、AC-INV-07 の criterion を『Source refresh records status, adoption and route impact with a quantified commit/PR delta from the prior observed_at; date-only refresh fails this check』へ更新する。

**機械検証**: 対象上流リポジトリで `git fetch origin && git rev-parse origin/main` を実行し、その sha が inventory/ut-tdd-ref-audit.yaml の refs[main].sha と一致することを検査する `helix doctor` gate `source-ref-freshness` を新設し、不一致（delta>0 かつ observed_at 更新なし）なら fail-close する回帰テストを追加する。

### GH-02 [major] 監査時点で存在した work/l6-81-agent-registry-design が未監査
- 是正種別: 棚卸し追補 / status: 検証合格
- 対象: `inventory/ut-tdd-ref-audit.yaml`, `HBR-INV-002`, `AC-INV-02`

inventory/ut-tdd-ref-audit.yaml の refs 配列へ work/l6-81-agent-registry-design エントリを追加する。最終 commit 日 2026-07-14（本監査 observed_at 2026-07-15 より前に存在）であり main に無い commit を保有するため、PR番号が確認できない場合は status: branch_only（確認できればopen_pr_candidate）とし、ahead_by/behind_by は実測 `git merge-base` 計算値で埋め、disposition は review_pending とし v0.5.0 closure 前に実 diff を確認して reuse_as_is/patch/wrap/split/replace/reject のいずれかへ確定する（確定するまで HBR-INV-012 の棚卸し完了 claim を成立させない）。coverage_boundary.covered の記述を『main, all open PR heads, and all local/remote branch refs (refs/heads/*, refs/remotes/*/*) enumerated via `git for-each-ref` at observed_at』へ修正し、『connector 経由で可視な PR head のみ』という不完全網羅の表現を削除する。あわせて HBR-INV-002 (All Git refs) の statement を『refs/heads、refs/tags、PR heads、merge bases、closed-unmerged headsに加えて、PR番号を持たないlocal/remote branch headも含めて全列挙しsnapshot digestを保存する』へ修正する。

**機械検証**: `git for-each-ref refs/heads refs/remotes` の出力に含まれる全 ref が inventory/ut-tdd-ref-audit.yaml の refs 配列に1:1で存在することを比較するテスト（`helix doctor` gate `ref-coverage-completeness`、未列挙 ref 件数が0であることを assert）で機械検証する。

### GH-03 [major] 再スナップショット/鮮度追随ポリシーが要件化されていない
- 是正種別: プロセス要件追加 / status: 改訂済（検証指摘反映）
- 対象: `HBR-INV-014`, `AC-INV-08`, `schemas/source-inventory.schema.json`, `HBR-INV-012`

requirements-catalog.yaml へ新規要件 HBR-INV-014 を追加する。id: HBR-INV-014, area: inventory, title: 上流再スナップショット/鮮度追随義務, priority: must, sources: [CHAT-015, HYBRID-DIFF]（いずれも requirements-catalog.yaml 内で既に複数回使用されている登録済み source id。CHAT-015 = inventory/chat-requirements.yaml 定義の『ハイブリッドコア、検出システムDB、UT-TDD全ref/branch、既存資産を全棚卸しして採否を記録する』、HYBRID-DIFF = HBR-INV-010(Diff impact)で既使用のsource差分監査文脈。存在しない自己言及IDである GH-AUDIT-2026-07 は使用しない）, verification: [AC-INV-08], status: proposed_rebaseline。statement: 『採用元リポジトリ（UT-TDD_AGENT-HARNESS 等の外部ソースおよび旧HELIX RetryYN/ai-dev-kit-vscode read-only参照）は、observed_at からの経過に対し (a) 前回 observed_at から30日経過、(b) 前回 snapshot から上流 main が10 commit以上先行、(c) 要件確定・PLAN起票・v0.x.0リリース確定の直前、のいずれか最も早いタイミングを再監査トリガーとして再スナップショット（git fetch + ref 再列挙）と delta audit（前回 observed_at 以降の新規/変更/削除 asset の disposition 再評価）を実行する。鮮度SLA（30日 または 10 commit 先行のいずれか早い方）を超過した状態での棚卸し完了 claim（HBR-INV-012）は fail-close とする』。

schemas/source-inventory.schema.json はトップレベルで additionalProperties:false かつ properties が固定列挙のスキーマである。required 配列へキーを足すだけでは properties 側に型定義が無いため全インスタンスが reject される unsatisfiable schema になる。是正では required 配列と properties オブジェクトの両方を同時に編集する。properties へ以下を追加: `"next_reaudit_due": { "type": "string", "format": "date" }` と `"commits_behind_upstream": { "type": "integer", "minimum": 0 }`。required 配列（現行 `["schema_version","source_id","source_kind","locator","snapshot_digest","observed_at","assets","coverage"]`）へ `"next_reaudit_due"` と `"commits_behind_upstream"` を追記する。現時点でこのスキーマに準拠する既存インスタンスファイルはリポジトリ内に存在しない（validation/package-validation-report.json 等の検証対象は本スキーマの実データを持たない）ため、required 追加による既存インスタンスの破壊的影響は無い。

AC-INV-08 を新設: id: AC-INV-08, title: Freshness SLA gate, criterion: 'Inventory closure is rejected when observed_at is older than the freshness SLA (30 days or 10 commits behind, whichever earlier) without a recorded re-audit', status: proposed。

HBR-INV-012 (Closure criteria) の statement 末尾に『HBR-INV-014の鮮度SLAを満たさない場合も棚卸し完了をclaimしない』を追記する。

**機械検証**: `helix doctor` gate `source-ref-freshness-sla` を新設し、schemas/source-inventory.schema.json（next_reaudit_due・commits_behind_upstream を含む改訂版）に対する2種のfixtureで検証する: (1) 全required項目を満たすvalid fixture（例: tests/fixtures/source-inventory-fresh.json）がajvで正しくvalidateされること（スキーマがunsatisfiableでないことの直接証明）、(2) observed_atが30日超過またはcommits_behind_upstreamが10超過かつre-audit未記録のfixture（tests/fixtures/source-inventory-stale.json）に対しては `source-ref-freshness-sla` gateがfail-closeすること。両ケースをtests/source-freshness-sla.test.tsとして実装し、CIのhelix doctor経由で実行する。


## 証跡

- 是正 Workflow run: `wf_1f081d7d-d8e`（34 エージェント、2.25M tokens、563 tool calls）。逐次結果: セッション transcript `subagents/workflows/wf_1f081d7d-d8e/journal.jsonl`
- review evidence 区分: `intra_runtime_subagent`（起草者と検証者を別エージェントに分離）
