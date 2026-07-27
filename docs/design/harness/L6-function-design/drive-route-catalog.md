---
layer: L6
sub_doc: function-spec
status: draft
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
plan: docs/plans/PLAN-L6-81-drive-route-catalog.md
---

# 駆動モデル経路catalog機能設計

## 1. 公開契約

| API | 事前条件 | 事後条件 | 失敗 |
|---|---|---|---|
| `analyzeDriveRouteCatalog(raw, documentExists)` | JSON入力と文書存在portを受ける | exact route集合、kind、遷移、文書を純関数で検査する | schema不正、route欠落・重複、孤児遷移、model不許可kind、文書欠落をfinding化 |
| `loadDriveRouteCatalog(repoRoot)` | repository rootを受ける | `config/drive-route-catalog.json`を読み、同じ純関数へ渡す | 不在・JSON不正をfail-close |
| `driveRouteCatalogMessages(result)` | 検査結果を受ける | doctor向けの決定的summaryを返す | findingを隠さない |

## 2. 不変条件

1. Forward spine、delivery route、drive model、kind、drive、execution modeを同一enumにしない。
2. route exact setは15件、工程専門workflowは2件とし、欠落を許可しない。
3. `next_routes`は実在routeだけを参照する。
4. routeの`allowed_kinds`は`MODE_ALLOWED_KINDS`から逸脱しない。
5. 各routeは実在するprocess文書へ接続する。
6. 承認対象actionと、承認なしで継続するactionをroute単位で分離する。
7. design-bottomupとscreen/frontend工程専門の入口、artifact、pair、exitを保持する。
8. catalog検査はread-onlyで、PLAN・Issue・DBを書き換えない。

## 3. 統合点

doctorへ`drive-route-catalog` hard gateを追加する。既存`drive-model-passage`は
PLAN内の通過証明を検査する補助契約として維持し、route集合の正本には使わない。
