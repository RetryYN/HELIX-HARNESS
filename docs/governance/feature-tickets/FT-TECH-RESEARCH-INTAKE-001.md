# FT-TECH-RESEARCH-INTAKE-001 — チャット共有の技術候補を無損失で整理する

作業種別: research / 入力整理

今回共有された技術候補を一覧へ登録し、比較・未完・再評価条件を追える形にする。意味と状態の正本は[技術候補入力一覧](../technology-strengthening-intake.json)と[技術強化research](../technology-strengthening-research.json)に置く。このticketは作業内容だけを持ち、要求や技術採用・操作許可の正本にはしない。

## 対象入力

- T01 既存言語・JSON契約・PBT・再現環境：Node.js、TypeScript、Python、Ajv、python-jsonschema、JSON Schema 2020-12、pytest、Hypothesis、node:test、fast-check、uv、Ruff、Pyright、npm lockfile、TypeScript型検査。
- T02 CI・コード品質・文書監査：GitHub Actions、Vitest、pytest、Biome、Ruff、actionlint、zizmor、CodeQL、Playwright。
- T03 Agent Skillsと5つの手順：Agent Skills、SKILL.md、要求トレーサビリティ、V字モデル設計、独立レビュー、TDD・反例設計、障害分析・Backflow。
- T04 依存方向・秘密/依存・Mutation・外部接続・部品表：dependency-cruiser、Import Linter、Gitleaks、Dependabot、StrykerJS、MCP SDK、Syft。
- T05 レッドチーム・API攻撃検証：Promptfoo Red Team、Microsoft PyRIT、OWASP ZAP、Nuclei、Schemathesis。
- T06 ログ・メトリクス・トレース・故障注入：Pino、structlog、OpenTelemetry、Prometheus、@prometheus-io/client、prom-client、prometheus_client、Grafana、Loki、Tempo、Sentry、Toxiproxy、Testcontainers。
- T07 記憶媒体・検索・閲覧・OSS情報入力：JSON正本、Git、SQLite、FTS5、Qdrant、PostgreSQL、pgvector、Obsidian、Bases、deps.dev、OSV.dev、SPDX License List、OpenSSF Scorecard。
- T08 既存SECURITY010〜013・023へ結ぶ安全性評価案：HELIX Trusted Technology Admission（仮称）、試験実行と実利用の操作scope分離、リスク別検証選択の比較、Capability Drift再評価、検証版/digest/用途/権限/環境/残留リスクの履歴。
- T09 インフラの用途別選定：OpenTofu、Terraform、Ansible、Podman、Docker、Trivy、Checkov、SOPS、Restic、Infracost、Kubernetes、Argo CD、Terraform Provider、Toxiproxy、Testcontainers。
- T10 直ちに共通標準へ固定しない比較候補：Rust、Go、PostgreSQL、Kafka、Kubernetes、LangChain、LangGraph、n8n、Jenkins、CircleCI。

## 実施する作業

- T01〜T10の全項目を一覧へ保持し、既出技術の重複する用途も参照で残す。
- 旧資産・現行要求/設計・公式仕様へ戻り、適用条件、反例、限界、未確認事項、再評価条件を記録する。
- 調査済み、未調査、設計への対応、採否未決を区別し、留保/後回し/代替比較も理由と生存先を残す。
- 各候補の処置・対象revision/scope・検証根拠を確認し、独立reviewで抜けを照合する。

この作業から新機構、新しい一律承認gate、全技術の導入、実装Ready、攻撃/故障注入、認証/設定変更、外部送信、release/deployを生成しない。試験実行・製品適用・利用認可・知識採用は既存owner契約と対象revisionの成立条件に従う。

## 作業の確認

入力一覧のT01〜T10と本ticketの対象一覧を双方向照合する。research済みでも具体版/profile/formal binding/実評価/採否が未決なら未決を残す。全92親430対の設計・実装準備と最終独立監査の目標は継続する。
