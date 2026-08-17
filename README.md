<div align="center">

# 🧬 HELIX-HARNESS

### 要求と証拠を正本にして、AIの作業を安全に収束させるVモデル・ハーネス

`requirements` → typed registry → generated catalog → runtime policy → execution evidence

![Node.js](https://img.shields.io/badge/Node.js-24.15%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-testing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-lint%20%2B%20format-60A5FA?style=for-the-badge&logo=biome&logoColor=white)

![Platform](https://img.shields.io/badge/platform-Windows%20·%20macOS%20·%20Linux-555?style=flat-square)
![Status](https://img.shields.io/badge/status-development%20%2F%20private-orange?style=flat-square)

</div>

---

## これは何か

HELIX-HARNESSは、AIが要件に沿って設計・実装・検証・PR対応を進めるための開発ハーネスです。完了の宣言ではなく、テスト、レビュー、CI、DB投影、HEAD、owner、contractを束ねた証拠で作業を閉じます。

このリポジトリは開発用のsource checkoutです。現在は公開npm packageや配布Releaseを前提にせず、Node.js 24.15.0以上25未満のsource checkoutから実行します。

## 正本と分類

意味の正本は requirements です。現在の正本は次の構成です。

| 項目 | 現在の扱い |
|---|---|
| 要件 | `docs/governance/helix-harness-requirements_v1.3.md`（v1.3.11系） |
| typed registry | `docs/design/helix/L3-requirements/workflow-classification-registry.v1.json` |
| catalog | `config/workflow-classification-catalog.v1.json`（registryからのgenerated projection） |
| 旧catalog | `config/drive-route-catalog.json`（compatibility inventoryのみ） |
| Vモデル | L1–L12がcurrent canonical、L0は層外のauthority anchor |

分類の軸は一つのenumへ畳み込みません。

| 軸 | 例 | 役割 |
|---|---|---|
| `development_style` | `FULL_L1_L12_V`, `PRODUCTION_SCRUM`, `V_DESIGN_SCRUM_IMPLEMENTATION` | productionの進め方 |
| `case_driven_model` | `DISCOVERY_POC` | 不確実性をS0–S4で検証する案件モデル |
| `workflow_model` | `REVERSE`, `RECOVERY`, `INCIDENT`, `REFACTOR`, `RETROFIT` | 現在のsignalを処理するworkflow |
| `subroute` / `state_machine` | `SCRUM_REVERSE`, `SCRUM_REVERSE_SR0_SR4` | 親workflow内の手順・状態機械 |
| `specialist_drive` | `BE`, `FE`, `FULLSTACK`, `DB`, `AGENT` | 専門職の担当軸 |
| `specialist_workflow` / `specialist_capability` | `SCREEN_DESIGN`, `UNIVERSAL_WORKFLOW`, `NFR_MEASUREMENT` | 専門workflow・能力 |
| `execution_mode` | `STANDALONE`, `CLAUDE_ONLY`, `CODEX_ONLY`, `HYBRID` | runtimeの実行形態 |

signalは `signal → target_axis / target_id → execution policy` の一方向に導出します。旧入力を受けるcompatibility adapterは input-only で、変換元とwarningをreceiptへ残します。曖昧な入力は推測せず fail-closeし、current output・DB・生成文書へ旧identityを再出力しません。

## Vモデルと自律境界

current canonicalのpairは `L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7`です。

| 範囲 | 責務 |
|---|---|
| L0 | charterとauthority anchor |
| L1–L2 | 人が企画・要求・モックを確定 |
| L3 | AIが要件を起草し、人が承認 |
| L4–L12 | AIが設計・実装・検証・PR・CIを証拠付きで進行 |

不可逆操作、credential、production影響、外部副作用は、機械gateで安全境界を確認できるまで自動適用しません。providerの認証情報は公式CLI側に置き、リポジトリへ秘密情報を保存しません。

## Workflow

通常のForwardは `plan → pair-freeze → implement → trace-freeze → review → accept` です。既存実装の正規化は `REVERSE`、前提崩れや強制停止からの復旧は `RECOVERY`、production影響の検証は `INCIDENT`、構造改善は `REFACTOR`、state・schema・runtime・dependency移行は `RETROFIT` として別々に扱います。

Production Scrumは `development_style` であり、ReverseやRecoveryと同じworkflow enumではありません。Discovery／PoCは `case_driven_model`、Scrum Reverseは `subroute` です。S4判断後に選択済みのdevelopment styleへ接続します。

## クイックスタート

### 開発checkout

```sh
node --version                  # >=24.15.0 <25
npm install
npm run build
npm run typecheck
npm run test:fast
```

### 対象リポジトリへのsource checkout導入

HELIX-HARNESSのcheckoutをビルドした後、導入先リポジトリのディレクトリで実行します。

```sh
node /path/to/HELIX-HARNESS/dist/helix.js setup project --dry-run
node /path/to/HELIX-HARNESS/dist/helix.js setup project
node /path/to/HELIX-HARNESS/dist/helix.js doctor
```

`--dry-run`で生成対象とconsumer readinessを確認してから適用します。GitHub branch protectionや配布cutoverなど外部状態を変更する操作は、別途action-binding approvalとrollback evidenceが必要です。

## CLIの入口

開発checkoutでは `node dist/helix.js` を `helix` と読み替えられます。

| 入口 | 用途 |
|---|---|
| `helix status` | runtimeのexecution modeとcontinuation状態を確認 |
| `helix doctor` | authority、trace、drift、DB、gateを統合検証 |
| `helix db rebuild --json` | sourceからDB projectionを再構築 |
| `helix plan lint <path>` | PLANのschema・依存・authorityを検証 |
| `helix route eval` | typed classificationとexecution policyをreceipt化 |
| `helix review --uncommitted` | deterministic review packetを作成 |
| `helix team run --definition <yaml> --mode hybrid` | 複数runtimeをexecution modeとして分離実行 |
| `helix setup project` | consumer projectのbootstrapを提案・生成 |

`--mode`はruntimeのexecution modeに限定されます。workflowの分類には `target_axis` と `target_id` を使い、workflowを実行modeへ変換しません。

## 証拠で閉じる

PRを完了扱いにするには、少なくとも次を同じHEADへ束縛します。

- 対応IssueとPLANのscope・依存・状態
- targeted test、typecheck、lint、doctor、必要な全回帰
- CI run、attempt、conclusion、review generation
- workerと独立reviewerのruntime分離
- harness.dbのprojectionとreplayの一致
- main read-afterと、必要なClaude exact-HEAD review receipt

CIやdoctorがcurrent authorityの不一致を検出した場合、compatibility側がgreenでも相殺しません。

## 開発時の検証

```sh
npm run typecheck
npm run lint
npm run test:fast
npm run test:node-fallback
node dist/helix.js doctor
```

ドキュメント、PLAN、registry、catalogを変更した場合は、対象ファイルのdigest、design-language、authority drift、PLAN lint、DB rebuildを追加で実行します。編集前に対象ファイルを読み、他レーンの未コミット変更をrevertしません。

## 現在の制約

- packageは開発用で、現在 `private` です。第三者向けtag／Release／配布repoのcutoverは未完了です。
- `config/workflow-classification-catalog.v1.json`は手書きの意味正本ではなく、requirements registryの生成projectionです。
- 旧入力やhistorical文書は互換・監査用途に限り保持し、current guidance・生成物・completion判定へ戻しません。
- 完全無人運用の安全境界、Universal Workflowの判断・配車、配布canaryは別の原子PRで実装・検証します。

最新の要求、進捗、gate結果はこのREADMEではなく、requirements、registry、`helix status`、`helix doctor`、harness.dbを確認してください。

<div align="center">
<br>
<sub><b>HELIX-HARNESS</b> — requirementsと証拠を正本にする開発ハーネス</sub>
</div>
