---
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
pair_artifact: docs/design/harness/L6-function-design/drive-route-catalog.md
plan: docs/plans/PLAN-L6-81-drive-route-catalog.md
---

# 駆動モデル経路catalog単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DRCAT-001 | current catalog | route 15件、工程専門2件でgreen | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-002 | route graph | route欠落、孤児next、文書欠落を各findingとして返す | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-003 | model kind | model不許可kind、signal／kind重複をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-005 | signal routing | catalog signalのruntime route欠落・別model接続をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-004 | route variant | Add-feature BはReverseを含み、Forwardはdesign／implだけを保持する | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-006 | approval boundary | routeごとの承認actionと自律継続範囲を混同しない | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-007 | specialist route | design-bottomupとscreen/frontend工程専門のpair・成果物・exitを保持する | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-008 | Forward収束 | 全非Forward routeが循環せず有限遷移でForward spineへ到達し、Forward出口を併設した循環も拒否する | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-009 | route内部一意性 | Forward後続、start layer／phase／exit／next重複をfail-closeする | `tests/drive-route-catalog.test.ts` |
| U-DRCAT-010 | specialist exact set | screen/frontend以外への置換、欠落、追加をfail-closeする | `tests/drive-route-catalog.test.ts` |

実装testは`tests/drive-route-catalog.test.ts`とする。
