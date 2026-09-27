# HELIX-HARNESS 機構内監査の消化（2026-09-27）

[監査](helix-harness-internal-audit-2026-09-27.md)とR2183-01に従い、027〜033の機能所属候補を各L2本文へ追加し、L11へ対の所属/利用境界を記した。入力・出力・版・例外・依存4区分・失敗の既存条件は削除していない。所属は要求の提供範囲として今示し、形式等のみL3へ渡す。

## 原文と旧資産の根拠

下表の変更前本文はbase `d107e60ca9b8cdf2f57ae7c60fe40c94dda31bba` に固定する。追補後の候補digestとL11全文SHAは同PRの被覆receiptへ記録する。

| 根拠 | 対象と意味 |
|---|---|
| `docs/concept/helix-concept.md:227, 251-275`、SHA-256 `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` | ①prototype/PoC、②requirements、③design、④development、⑤refactoring、⑥release、⑦operationsは独立して利用・リリースできる。入口Full Reverse、部品、COREはサービスを支える。COREは複数release unitを横断する意味・設計・trace・test・CIを持つ。CONNECTは内部/外部構造の登録、版照合、伝送、retry/traceをつなぐ共有機構。OSはticket/Worker実行/検収を担当し、HARNESSには含まない。 |
| `docs/helix-harness/L2-requirements/product-requirements.md:340-350` (L2-010)、SHA-256 `7ee1004f8d2c0eea7816b1e321a3ad4abd284156c50704b41476940491d5d44d` | 各packに①〜⑦、共有component、COREのうち一つのownerを割り当てる。複数サービスにまたがる能力はcomponent/COREへ置く。 |
| 同 `:530-554` (L2-026) | ③設計サービス内の具体設計構成unitをL2で分離し、利用者向けサービス014と内部交換可能pack026のowner/境界を具体化した前例。 |
| 同 `:559-600` (L2-027〜029)、`:601-674` (L2-030〜033) | G16/G18の能力・入力・出力・既存HARNESS契約との境界。ここでは要求本文の要約や採択をせず、各機能をどの製品/共通packとして提供するかを対応付ける。 |
| `docs/helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md:24-30,36-42`、SHA-256 `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8` | PO第2項は既存物の読取り・保存設計との差分・外部編集保持・限定改修案、第4項はcase/data/double/reproduction/regressionの作成を要求する。管理規則、CI実行、設計authorityの再定義を要求していない。 |
| G16旧source: `LEGACY-ASSET-B5B5E71B2AF1459D59A1`, `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406-426`, SHA `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a`; `LEGACY-ASSET-D11F51092619506417E4`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56-69,71-78,121-145`, SHA `baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2`; `LEGACY-ASSET-EB3700B0088F311C2295`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:50-78`, SHA `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a` | FR-14の一般Reverse、外部extractorのprovenance/unknown、deltaのexact affected setを保持する。視覚設計専用source型や内部監査delta schema、旧workflow/CLI/runtimeは持ち込まない。詳細根拠: `docs/governance/decisions/reverse-delta-derivation-2026-09-27.md:13-16`。 |
| G18旧source: `LEGACY-ASSET-EE5DBACC7F28F7D1F605`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:147,152-156,174,178-184`, SHA `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`; paired `LEGACY-ASSET-44DD86E3DEC09E65EF51`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-pillar-acceptance-test-design.md:109-113,127-139`, SHA `df81469f13deb45e7da4c74d90c7f3d3b1be5f26ccf63b706e6e230bc5b4c3b6` | 独立oracle、反例、期待失敗を保つ。生成器自身のtestやcoverageだけで合格を作らない。 |
| G18旧source: `LEGACY-ASSET-20C14BB23C519C65E7BD`, `archive/legacy-generation-2026-09-14/root/docs/governance/ai-dev-team-operations_v1.1.md:716-750`, SHA `4c03ceed6fd11985158cb9dd7d3e5f455274cf74e839523b756da7f35441867d`; `LEGACY-ASSET-DA012A9B04D5BE9419CE`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md:37-90`, SHA `65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb`; paired `LEGACY-ASSET-8DE0535125B1E39C6FEA`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ci-system-synthesis-acceptance.md:24-40`, SHA `f5dcd1910a4eef57c66e1c2c03fffe20e5c681ed9e9d043b9e8f15a211e65d9b` | 回帰test候補、test identityと対象revision/runの結合、生成と実行の分離を保持する。旧CIを実行・移植せず、固定coverageや閾値を追加しない。詳細根拠: `docs/governance/decisions/test-reproduction-derivation-2026-09-27.md:36-39`。 |


## 処置

027/028/031は共通部品、029/030/032/033はCOREの主owner候補を一つずつ示した。032の業務意味はHARNESS、通信共通契約はCONNECT、実行はOS-020または利用者CIへ分離する。共通利用するサービスを狭めず、所属を候補として提示する。既存原文は①〜⑦の単独成立と共有部品/COREを示すが、個別追加packの所属採択は行っていない。

## 機構別確認PRへ残す具体的な所属判断

| 対象 | 原文・根拠 | 選択肢と推奨 | 影響 |
|---|---|---|---|
| 029 | PO第2項の設計差分・code修正案・data移行案とConceptのCORE横断意味/trace | 推奨CORE：複数成果の意味/影響traceを束ねる責務に一致。代替は共通部品が束ね処理、COREが意味/trace契約を所有。各成果のauthorityはどちらも元サービスに残す。 | 029の主ownerと027/028→029の接続。提供能力や利用先を減らさない。 |
| 031 | PO第4項のlog/input→最小再現→回帰候補、Conceptの共通部品とCORE test機構 | 推奨共通部品：複数入力経路から使う再現処理。代替CORE：横断test処理へ集約。どちらも開発failureと運用incidentを保持し、運用専用への縮小は提示しない。 | 031と032/033のowner境界。oracleの意味と隔離executorは変更しない。 |
| 032 | PO第4項の生成caseをCIで使用、ConceptのCORE test/CIとCONNECT通信 | 推奨CORE：artifact/oracle/revisionとexecutor packetの対応責務。代替共通部品：変換・接続packを部品へ、意味/trace契約をCOREへ。CONNECTへの業務意味移管は両案とも行わない。 | 032と030/031→032→OS-020/利用者CI。実行責務・後続receiptの時系列は保持。 |

027/028/030/033は導出した候補分類として提示する。対象revisionは機構別確認PRで要求一式として人が確認し、これらの所属について個別の追加照会や選択肢は設けない。上の判断は要求ステージ手順4の確認PRへ残し、本消化PRのmergeを採択にしない。要求候補の入力・出力・依存・版を変更する判断が出た場合は対応するL2/L11を同じ確認PRで揃える。

GPT6 Luna highの調査案をCodex executionが検収し、031の運用専用への縮小案と032のCONNECT所有案を排除した。旧sourceは静的参照のみ。独立reviewはClaude。
