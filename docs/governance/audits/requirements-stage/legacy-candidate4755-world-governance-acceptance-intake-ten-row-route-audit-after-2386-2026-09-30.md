# World Governance 受入・intake系10行route監査（#2386後のbase）

- Base: `0f5050e2b25cd622640c99c5de170cca087f7d8a`。base時点の監査案、authority effectなし。#2387／#2388はOPEN/DRAFTで、review／merge前snapshotとして記録。
- このファイルの対象は#2388の未レビュー20 ID中の10行。対のdraftが残る10行を扱う。
- #2370 proposal-effective poolと#2385後の471 product/unknown poolはbase時点のhistorical count。pending PRのreview／merge後にrebaseして再計算する。
- 固定採択L2は直接predicateの比較対象、L11は別のacceptance lens。話題やlocatorが近いだけではdirect routeにしない。unknownには比較ID／locatorと不一致理由を記載。

| Source ID | 旧archive path:line | Asset ID | route判定 | 直接一致L2／unknown比較 | 残差・相違 |
|---|---|---|---|---|---|
| `LEGACY-CAND-LINE-004532` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-acceptance.md:34` | `LEGACY-ASSET-6E496F15A88DE2181CF8` | **partial** | HELIXOS-L2-001, HELIXOS-L2-007, HARNESS-L2-003 | 要求の出所・合意revision・作業証拠のtrace部分だけが直接重なる。#1500改版、必要承認、IR収載、HWG core完成の出口条件はこの採択述語にない。 |
| `LEGACY-CAND-LINE-004535` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-acceptance.md:37` | `LEGACY-ASSET-6E496F15A88DE2181CF8` | **partial** | HELIXOS-L2-002, HELIXOS-L2-007 | 全Worldの許可母集合・入口を漏れなく定義する保証、AC07を含む全ACの再実行義務、外部配布検収のowner振分けは採択predicateにない。採択OSのtraceは対象projectの追跡条件であり、HWGのworld-wide inventoryと同一ではない。 |
| `LEGACY-CAND-LINE-004628` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:127` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **unknown** | directなし。比較のみ: HARNESS-L2-008; L2 HELIX-HARNESS L2 product-requirements.md:59; L11 direct predicate locatorなし | 類似名だけで統合しないというsemantic reuse判定規則は採択L2/L11にない。HARNESS-L2-008が要求候補からauthority/操作許可を生成しないこととは別predicate。 |
| `LEGACY-CAND-LINE-004652` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:160` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **unknown** | directなし。比較のみ: HELIXOS-L2-002, HELIXOS-L2-005, HELIXOS-L2-007; L2 HELIX-OS L2 governance-requirements.md:55,58,60; L11 HELIX-OS L11 governance-acceptance.md:22,25,27 | 本行はIssueリンク付き表の責務説明であり、監査入力保存、特定Portfolio runtimeの非対象、入力保存/機能実装/運用の切分けは採択L2/L11の直接predicateでない。candidate line分類自体もrequirement atomか説明/ownership boundaryか再点検余地があるため、その分類を採択扱いしない。 |
| `LEGACY-CAND-LINE-004662` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:175` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-001, HELIXOS-L2-007, HARNESS-L2-008 | 要求判断の出所・合意revisionを確認し、記録の存在だけで承認/完了としない証拠条件に限り直接重なる。World Registry、Issue、graph、runtimeをauthority sourceにしない設計は採択されていない。 |
| `LEGACY-CAND-LINE-004665` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:181` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXSECURITY-L2-008 | 旧関係表示処理が安全性欠陥を持つとの断定、全admissionの安全評価、探索用関係からpermissionを生成する機能は採択されていない。 |
| `LEGACY-CAND-LINE-004666` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:183` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-007 | 採択OSはHWG graph-loaderの正常emptyと取得/parse errorを表す具体state schemaを定義しない。HELIXSECURITY-L2-009はsecurity incident等のunknownを対象operationへ伝播する条件であり、任意のloader errorをsecurity stopへ広げない。 |
| `LEGACY-CAND-LINE-004667` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:184` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-007, HARNESS-L2-003 | 検証ログ・証拠を要求revisionから参照し、証拠の欠落/重複/staleを判定する条件に限り直接重なる。宣言edge・推定候補edge・実行検証edgeのWorld graph分類体系は採択されていない。 |
| `LEGACY-CAND-LINE-004668` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:185` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **partial** | HELIXOS-L2-007, HARNESS-L2-003 | 証拠の存在だけで承認/完了を成立させず、対象revisionの受入状態を追う条件に限って重なる。テストファイル存在とAC成否のHWG-specific判定規則は採択されていない。 |
| `LEGACY-CAND-LINE-004684` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-intake.md:211` | `LEGACY-ASSET-D78FDF31EAE827955BA1` | **unknown** | directなし。比較のみ: HARNESS-L2-003, HELIXOS-L2-004; L2 HELIX-HARNESS L2 product-requirements.md:193, HELIX-OS L2 governance-requirements.md:441-442; L11 HELIX-OS L11 governance-acceptance.md:213,215 | 既存#1500の順序変更、他の保留解除やpolicy緩和へ要求を拡張しない境界は候補固有の意思・手続きであり、採択L2/L11からは導けない。 |

## 集合と意味上の境界

- このbatch: 004532, 004535, 004628, 004652, 004662, 004665, 004666, 004667, 004668, 004684。partial 7 / unknown 3。
- 同じ#2388未レビュー20の別batch: 004702, 004715, 004744, 004745, 004747, 004748, 004751, 004753, 004754, 004755。ここでは未評価。
- 現在の60行World familyは prior first30 + #2388のnext-ten + 今回のremaining20（本ファイルと対の10行）でID重複なく分割。#2387/#2388は未mergeなので、これは提案集合の検算でありcurrent merged route unionではない。
- 四つの旧assetはledger上すべて `product_target=unresolved`、`authority_status=historical`、`disposition=unresolved`。候補本文を採択・承認・実装根拠へ昇格しない。
- #1500 epoch-exit制約、全域inventory/graph、独自Release/Slice/Bundle/Wave、shadow/enforce/rollback gate、性能閾値、permission/admission規則は候補固有残差として保持。

## 参照した旧sourceとinventory

- 参照した旧archive source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-acceptance.md`, `.../world-governance-intake.md`, `.../world-governance-requests.md`, `.../world-governance-requirements.md`; 行番号とasset IDは各rowに記載。
- 資産台帳: `docs/governance/legacy-asset-disposition.jsonl` assets 874–877（IDs in row table）。Candidate source inventory・source-line carry-forward ledger・archive manifestはJSONのpinned_inputsにSHA付きで記録。
- archive内workflow／runtime／test／CI／toolは実行していない。コードとtestは変更していない。
