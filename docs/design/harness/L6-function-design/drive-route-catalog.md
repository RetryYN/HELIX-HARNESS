---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
plan: docs/plans/PLAN-L6-81-drive-route-catalog.md
---

# 駆動モデル経路catalog機能設計

## 1. 公開契約

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| catalog解析 | `analyzeDriveRouteCatalog(raw, documentExists) => DriveRouteCatalogResult` | JSON入力と文書存在portを受ける | exact route集合、kind、遷移、Forward到達可能性、横断construct分類、surface投影、専門工程、文書を純関数で検査する | 入力、PLAN、Issue、DBを書き換えない | `U-DRCAT-001`〜`U-DRCAT-015` |
| catalog読込 | `loadDriveRouteCatalog(repoRoot) => DriveRouteCatalogResult` | repository rootを受ける | `config/drive-route-catalog.json`を読み、同じ純関数へ渡す | 不在・JSON不正を成功扱いしない | `U-DRCAT-001`、`U-DRCAT-002` |
| doctor表示 | `driveRouteCatalogMessages(result) => string[]` | 検査結果を受ける | doctor向けの決定的summaryを返す | findingを隠さない | `U-DRCAT-001` |

## 2. 不変条件

1. Forward spine、delivery route、drive model、kind、drive、execution modeを同一enumにしない。
2. route exact setは15件、工程専門workflowは2件とし、欠落を許可しない。
3. `next_routes`は実在routeだけを参照し、全非Forward routeは循環せず有限遷移で`forward_full_v`へ到達する。
4. routeの`allowed_kinds`は`MODE_ALLOWED_KINDS`から逸脱しない。
5. 各routeは実在するprocess文書へ接続する。
6. 承認対象actionと、承認なしで継続するactionをroute単位で分離する。
7. design-bottomupとscreen/frontend工程専門の入口、artifact、pair、exitを保持し、工程専門IDはexact setとする。
8. catalog検査はread-onlyで、PLAN・Issue・DBを書き換えない。
9. Forward spineは終端であり、後続routeを持たない。
10. start layer、phase、exit condition、next routeの重複を許可しない。
11. Scrum Reverse、Redesign、Design/Performance Refactor、Security、NFR/Measurement findingを
    独立routeへ昇格させず、subroute／decision／gate／subtype／escalation triggerのexact setで拘束する。
12. 全routeはIssue、PLAN、branch、PR、DB、right-armへ同じidentityで投影し、surface欠落を許可しない。
13. branch prefix、終端disposition、stale条件、再入場条件はcatalogに固定し、旧mode散文から推測しない。
14. construct IDが存在していても分類・親route・signal・stable routing code・exitが変われば拒否し、route別branch prefixもexact照合する。

## 3. 統合点

doctorへ`drive-route-catalog` hard gateを追加する。既存`drive-model-passage`は
PLAN内の通過証明を検査する補助契約として維持し、route集合の正本には使わない。
