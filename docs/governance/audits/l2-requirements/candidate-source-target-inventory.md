# 候補要求源の対象別台帳

確認日: 2026-09-14

本書は `docs/governance/candidates/` に置かれた候補系列を、要求対象と文書整理の状態で分類する監査台帳である。
候補本文、Issue、PR、実装状態のいずれも、この台帳への記載だけで要求正本へ昇格しない。
要求の意味は対象別L2文書と指定JSONに置き、候補は出典として参照する。

状態の意味は次のとおり。

- `L2接続済み`: 出典IDまたは具体条件を対象別L2案へ記載した。採択・freeze・実装・受入は別状態。
- `台帳接続`: 対象だけを確定し、個別条件の採否とL2への編入は未実施。
- `分解待ち`: 複数対象の責務が混在し、対象別の要求atomへ分ける必要がある。
- `照合済み・再採否待ち`: 新世代とのcrosswalkを作成し、保持候補・不採用前提・未判断を分けた。新世代での承認は未取得。
- `保留`: 現時点で対象製品・採否・承認revisionを確定できない。

| 候補系列 | 主対象 | 整理状態 | 文書整理上の扱い |
|---|---|---|---|
| `agentic-audit-future-state-delta` | HELIX-OS | L2接続済み | 監査提案、future差分、model比較をOSの改善・証拠要求へ接続 |
| `ai-readable-authority-requirements` | HARNESS / HELIX-OS | 台帳接続 | AI向け工程契約はHARNESS、authority解決・assignment・生成・stale管理はOSへ分ける。対象別L1／L2確定まで現行AI文書を変更しない |
| `authority-vocabulary` | HELIX-OS | L2接続済み | 人間authority、作業指示、通知、技術判断の分離をOS統制へ接続 |
| `bugbot-bounded-repair` / `bugbot-intake-source.md` | HELIX-OS | 台帳接続 | 自動修復の対象・権限・停止条件。HARNESSの検証規則を参照し、OSが実行を統制する候補 |
| `ci-event-concurrency-generation` | HELIX-OS | 照合済み・再採否待ち | generation・非干渉・replayの意味だけをNCIへ候補接続。GitHub event enum、旧receipt、既存provider再利用は持ち込まない |
| `conversation-lifetime-reconstruction` | HELIX-OS | L2接続済み | 継続、外部状態からの再構成、累積制約をOSの継続・復旧要求へ接続 |
| `design-grounding-human-convergence` | HELIX-OS | L2接続済み | 根拠、人間反応、収束を要求形成・判断履歴の統制へ接続 |
| `execution-ticket` | HELIX-OS | L2接続済み | Workerへの実行契約、測定、証拠、replayをOSの割当・観測要求へ接続 |
| `functional-release-slice` | HARNESS / HELIX-OS | 照合済み・再採否待ち | 提供構成・検証閉包はHARNESS、投影・導入・配布・復旧の実行統制はOSへ分離。旧CI先行利用は棄却し、Cursor固有条件はWorker要求源へ移送 |
| `harness-memory-coordination-boundary` | HELIX-OS | L2接続済み | memoryを有期限通知とpointerへ限定し、意味正本を複製しない条件をOSへ接続 |
| `helix-commercial-license` | HARNESS | 台帳接続 | 外部提供物HARNESSの利用許諾候補。法的条件と正式採否は未確定 |
| `helix-concept-v4` | HELIX全体 | 分解待ち | 上位Conceptとして保持し、HARNESSの開発機構とOSの統制機構を対象別L2へ投影する |
| `infrastructure-operations-quality` | HARNESS / HELIX-OS / 個別製品 | 照合済み・再採否待ち | 運用品質を要求・検証へ接続する工程条件はHARNESS、配備・監視・incident・復旧統制はOS、具体SLO・環境・保持値は適用先製品へ分離。旧owner／engine再利用は棄却 |
| `instruction-path-change-resilience` | HELIX-OS | 照合済み・再採否待ち | provenance・版固定・stale・provider差をAIDOCへ候補接続。旧owner・consumer・adapterは持ち込まない |
| `management-scrum-product-forward` | HARNESS / HELIX-OS | 照合済み・再採否待ち | 管理観測・採否・実行統制はOS、製品Forwardへの差戻し・再検証条件はHARNESSへ分離。Issue-first、PLANを含むGit一括authority、旧adapter／CI強制は棄却 |
| `mechanism-adequacy` | HELIX-OS | 照合済み・再採否待ち | unknown・反証・証拠・効果観測を候補接続。既存方式再利用分類、旧UIL／Learning／DB／CI／workflow接続は新世代へ持ち込まない |
| `next-generation-ci-requirements` | HARNESS / HELIX-OS | L2接続済み | layer・pair・risk別の検証契約はHARNESS、profile生成・実行・隔離・証拠回収・legacy archiveはOSへ分ける。上流確定までCI実装へ進めない |
| `producer-provenance-separation` | HELIX-OS | L2接続済み | 作成者、commit実行者、公開者、reviewerの出所をOSの証拠要求へ接続 |
| `refactoring-trigger-admission` | HELIX-OS | 台帳接続 | refactoring候補の検出・admission・shadow評価はOSの改善統制候補 |
| `requirement-formation-scoped-admission` | HELIX-OS | L2接続済み | 根拠付き要求形成と影響範囲限定の再確定をOS統制へ接続 |
| `requirements-authority-materialization` | HELIX-OS | 照合済み・再採否待ち | GitHub非authority・一方向投影・状態分離を候補接続。JSON-only意味正本、旧IR／main／Issue admissionは新世代へ持ち込まない |
| `responsibility-centric-learning` | HELIX-OS | L2接続済み | 責務単位の学習、失効、段階昇格、authority非奪取をOS学習要求へ接続 |
| `rule-derivation` | HELIX-OS / HARNESS | 照合済み・再採否待ち | 旧revisionのapprovalを流用せず、工程上の境界はHARNESS、生成・適用・診断はOSへ再採否する |
| `scrum-operation-typed-projection` | HARNESS / HELIX-OS | 照合済み・再採否待ち | 着手・完了の工程条件はHARNESS、管理状態・指標・projectionはOSへ分離。固定7 operation、旧layer、DB／roadmap／CI oracleは継承しない |
| `security-engagement-authority` | HELIX-OS | 台帳接続 | engagementの認可scope、取消、finding保護はOSの権限・証拠統制候補。実行権限は未付与 |
| `three-lane-capacity-profile` | HELIX-OS | 台帳接続 | Worker pool、WIP、review lease、段階拡張はOSのWorker統制候補 |
| `world-governance` | HELIX-OS | 照合済み・再採否待ち | 全件棚卸し・状態分離・影響限定を候補接続。旧owner、旧graph／DB、旧CI／policy、JSON-only authorityは持ち込まない |
| `concept-vision-package-intake` / `concept-vision-release-crosswalk.md` | HELIX全体 | 照合済み・再採否待ち | 上位Concept、HARNESS提供契約、OSのWorker／CI／配布運用、個別製品の将来構想へ分離。PKG-D01..13、旧Module／Bundle数、旧CI先行利用は固定要求にしない |
| `development-investment-stage-directives-intake_v1.0.md` | 未確定 | 保留 | INV-001..072は投資候補。個別に対象、既存owner、採否、受入を確定するまで要求へ編入しない |

## 現時点の適用待ち

`台帳接続`、`分解待ち`、`保留`の行は、候補が未確認という意味ではない。候補の存在・状態・主題を確認したうえで、
対象別L2への個別採否が未確定であることを示す。Issueのopen／close、PRのmerge、実装の有無から採否を補完しない。

今回、L2本文へ具体条件を移したのは `L2接続済み` の系列である。残る系列は、本台帳を適用待ち差分の入口とし、
次の改訂で要求atom、対象、承認revision、L3要件、L11受入を一組ずつ確定する。
