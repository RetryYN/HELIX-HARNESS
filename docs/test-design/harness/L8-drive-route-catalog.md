---
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/drive-route-catalog.md
plan: docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md
---

# legacy drive-route compatibility inventory単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRCAT-001 | compatibility inventory | role、frozen 15件／専門2件の読取がgreen | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-002 | route graph | route欠落、孤児next、文書欠落を各findingとして返す | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-003 | legacy内部構造 | signal／kind重複をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-005 | authority分離 | legacy signalをcurrent runtime mapへ照合しない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-004 | historical route snapshot | 旧route variantをcompatibility bytesの説明用fixtureとして保持し、current意味判断には使わない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-006 | historical approval snapshot | 旧approval fieldをcompatibility bytesの説明用fixtureとして保持し、current policyには使わない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-007 | historical specialist snapshot | 旧specialist fieldをcompatibility bytesの説明用fixtureとして保持し、current axisには使わない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-008 | Forward収束 | 全非Forward routeが循環せず有限遷移でForward spineへ到達し、Forward出口を併設した循環も拒否する | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-009 | route内部一意性 | Forward後続、start layer／phase／exit／next重複をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-010 | specialist compatibility | workflow ID重複をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-011 | historical construct snapshot | 旧construct IDをcompatibility bytesの説明用fixtureとして保持し、current分類には使わない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-012 | construct反例 | classified construct欠落、重複、孤児parent routeをfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-013 | surface投影 | Issue、PLAN、branch、PR、DB、right-armの欠落、catalog／episode identityの混同・重複、branch prefix重複をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-014 | bytes drift | compatibility inventoryの交換・意味変更をfrozen digestで拒否する | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-015 | historical branch snapshot | 旧branch fieldをcompatibility bytesの説明用fixtureとして保持し、current route導出には使わない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-016 | kind非正本化 | legacy kindをcurrent typed axisへ再解釈しない | `tests/drive-route-catalog.test.ts` |
| U-WFCATL-001 | current generated catalog | version／digest／axis／identityをrequirements projectionとして受理する | `tests/workflow-classification-catalog-lint.test.ts` |
| U-WFCATL-002 | identity relation | duplicate identityとmissing parentを拒否する | `tests/workflow-classification-catalog-lint.test.ts` |
| U-WFCATL-003 | signal relation | target missing、axis mismatch、別identity重複を拒否する | `tests/workflow-classification-catalog-lint.test.ts` |
| U-WFCATL-004 | doctor非相殺 | compatibility greenでもcurrent typed catalog failureならdoctor admissionを拒否する | `tests/workflow-classification-catalog-lint.test.ts` |
| U-DRCAT-017 | branch admission接続 | catalog宣言prefixをbranch-kindが全件認識し、対応kindを受理する | `tests/branch-kind.test.ts` |
| U-DRCAT-018 | route-kind到達性 | routeの全allowed kindが宣言branch prefixの少なくとも1件でbranch admissionを通過する | `tests/branch-kind.test.ts` |

実装testは`tests/drive-route-catalog.test.ts`とする。
