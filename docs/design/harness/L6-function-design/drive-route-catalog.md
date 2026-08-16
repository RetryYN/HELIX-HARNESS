---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
plan: docs/plans/PLAN-L6-81-drive-route-catalog.md
---

# legacy drive-route compatibility inventory機能設計

## 1. 公開契約

| 関数 | シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |
|---|---|---|---|---|---|
| compatibility解析 | `analyzeDriveRouteCatalog(raw, documentExists) => DriveRouteCatalogResult` | legacy JSON入力と文書存在portを受ける | schema、重複、参照、graph、文書だけを検査する | typed identity、kind、signalの意味を旧modeから判断しない | `U-DRCAT-001`〜`U-DRCAT-016` |
| frozen inventory読込 | `loadDriveRouteCatalog(repoRoot) => DriveRouteCatalogResult` | repository rootを受ける | compatibility roleとfrozen bytes digestを検証する | 不在・JSON不正・bytes driftを成功扱いしない | `U-DRCAT-001`、`U-DRCAT-014` |
| current catalog doctor | `loadWorkflowClassificationCatalogLint(repoRoot)` | requirements registryとgenerated catalogが存在する | version／digest／typed axis／relation／signal targetを検証する | 旧15-route件数をcurrent意味authorityにしない | `U-WFCATL-001`〜`U-WFCATL-003` |
| doctor admission | `admitWorkflowCatalogDoctorSurfaces(currentOk, compatibilityOk)` | currentとcompatibilityの独立結果を受ける | 両方greenの場合だけtrue | compatibility greenでcurrent failureを相殺しない | `U-WFCATL-004` |

## 2. 不変条件

1. current意味authorityはrequirements registryと`workflow-classification-catalog.v1.json`だけである。
2. 旧catalogは`authority_role=compatibility_inventory`を必須とし、bytesを凍結する。
3. 旧lintは`MODE_ALLOWED_KINDS`、`ROUTE_SIGNAL_MAP`、旧15-route exact setからcurrent意味を導出しない。
4. compatibility inventory内部のschema、重複、参照、graph、document existenceはfail-closeする。
5. current catalogはtyped axisを分離し、identity重複、missing parent、signal target driftをfail-closeする。
6. `unresolved_until_decision=true`のdecision targetは未解決placeholderとしてentity推測を行わない。
7. 両検査はread-onlyで、PLAN・Issue・DBを書き換えない。

## 3. 統合点

doctorは`workflow-classification-catalog`をcurrent hard gate、`legacy-drive-route-inventory`を
compatibility-only gateとして別messageで表示する。legacy側greenでcurrent側failureを相殺しない。
