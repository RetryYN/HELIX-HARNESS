# World Governance requests・requirements系10行route監査（#2386後のbase）

- Base: `0f5050e2b25cd622640c99c5de170cca087f7d8a`。base時点の監査案、authority effectなし。#2387／#2388はOPEN/DRAFTで、review／merge前snapshotとして記録。
- このファイルの対象は#2388の未レビュー20 ID中の10行。対のdraftが残る10行を扱う。
- #2370 proposal-effective poolと#2385後の471 product/unknown poolはbase時点のhistorical count。pending PRのreview／merge後にrebaseして再計算する。
- 固定採択L2は直接predicateの比較対象、L11は別のacceptance lens。話題やlocatorが近いだけではdirect routeにしない。unknownには比較ID／locatorと不一致理由を記載。

| Source ID | 旧archive path:line | Asset ID | route判定 | 直接一致L2／unknown比較 | 残差・相違 |
|---|---|---|---|---|---|
| `LEGACY-CAND-LINE-004702` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requests.md:18` | `LEGACY-ASSET-916722580D7518F96EB3` | **partial** | HELIXOS-L2-005, HARNESS-L2-008 | HELIXOS-L2-005の対象はHARNESS自身への適用を含む観測・改善候補であり、World Governanceが全世界母集合に自分を加えて棚卸しする規則ではない。「全部統制する」を一括実装・一括停止・既存policy解除の許可に変換しない。 |
| `LEGACY-CAND-LINE-004715` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:18` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **unknown** | directなし。比較のみ: HARNESS-L2-003, HELIXOS-L2-004; L2 HELIX-HARNESS L2 product-requirements.md:193, HELIX-OS L2 governance-requirements.md:441-442; L11 HELIX-OS L11 governance-acceptance.md:213,215 | 現行#1500の着手制約の改版、read-only/shadow先行、全域enforce後段化は既存採択述語から導けない。旧Issueの制約をこの監査で変えない。 |
| `LEGACY-CAND-LINE-004744` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:61` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **unknown** | directなし。比較のみ: HELIXOS-L2-001, HELIXOS-L2-002; L2 HELIX-OS L2 governance-requirements.md:54-55; L11 HELIX-OS L11 governance-acceptance.md:213,215 | L1/L3/L10改版、必要決定、正本改版、IR収載を行う旧工程stepを要求する直接採択predicateは確認できない。先行#2375の同文行004619のunknown判定に今回の行も揃え、前回のremaining draft partial評価を撤回する。 |
| `LEGACY-CAND-LINE-004745` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:62` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **partial** | HELIXOS-L2-007 | 全Worldを対象にしたread-only inventory、snapshotの母集合/走査範囲、receiptの形式・受領条件、文書完成とcore完成の区別は採択predicateにない。 |
| `LEGACY-CAND-LINE-004747` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:64` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **partial** | HELIXOS-L2-002 | 全Worldの入口への全量展開、Worldの内部責務/Release catalog、外部配布検収の分担は採択されていない。HELIXOS-L2-006とHARNESS-L2-006はサービス①〜⑦の顧客向け提供predicateであり、product_target未解決のWorld sourceへ直接割り当てない。 |
| `LEGACY-CAND-LINE-004748` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:66` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **partial** | HELIXOS-L2-002, HARNESS-L2-003, HARNESS-L2-004, HARNESS-L2-005, HELIXSECURITY-L2-008, HELIXSECURITY-L2-009 | 段階ごとのPLAN/PR/AC/rollbackを全件必須にする規則、独自の例外形式、HWG自身のpolicyを旧policyから独立審査する規則は固定採択されていない。 |
| `LEGACY-CAND-LINE-004751` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:72` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **unknown** | directなし。比較のみ: HARNESS-L2-003, HELIXOS-L2-004; L2 HELIX-HARNESS L2 product-requirements.md:193, HELIX-OS L2 governance-requirements.md:441-442; L11 HELIX-OS L11 governance-acceptance.md:213,215 | 候補mergeだけで#1500の着手制約変更を成立扱いしないという候補手続き。現行L2/L11にreceipt付きPhase 1 exitはない。 |
| `LEGACY-CAND-LINE-004753` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:74` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **unknown** | directなし。比較のみ: HARNESS-L2-005; L2 HELIX-HARNESS L2 product-requirements.md:194-196; L11 direct predicate locatorなし | 性能・誤停止・見逃しbaseline、比較窓、母集団、許容値、shadow復帰閾値は採択述語にない。架空の数値閾値を導入しない。 |
| `LEGACY-CAND-LINE-004754` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:75` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **partial** | HELIXOS-L2-001, HELIXOS-L2-007, HARNESS-L2-008 | 判断の出所/合意revisionを辿り、memoryやログだけで承認を成立させない部分に限り直接重なる。ADR/memoryの保存方法と寿命はこのL2/L11が定義しない。 |
| `LEGACY-CAND-LINE-004755` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-requirements.md:76` | `LEGACY-ASSET-24BF2999B13E304B77D2` | **unknown** | directなし。比較のみ: HARNESS-L2-006; L2 HELIX-HARNESS L2 product-requirements.md:56; L11 HELIX-HARNESS L11 product-acceptance.md:108-112 | Web、World Intelligence、新学習／推論engine、全体書換え、自動削除、無承認publish、既存機構複製の除外対象は、固定採択L2/L11の直接predicateに対応付かない。HARNESS Version 1範囲からWeb完成を除外する別の固定境界に類似して見えても、この比較pinに含まれる採択L2/L11 locatorとはしない。 |

## 集合と意味上の境界

- このbatch: 004702, 004715, 004744, 004745, 004747, 004748, 004751, 004753, 004754, 004755。partial 5 / unknown 5。
- 同じ#2388未レビュー20の別batch: 004532, 004535, 004628, 004652, 004662, 004665, 004666, 004667, 004668, 004684。ここでは未評価。
- 現在の60行World familyは prior first30 + #2388のnext-ten + 今回のremaining20（本ファイルと対の10行）でID重複なく分割。#2387/#2388は未mergeなので、これは提案集合の検算でありcurrent merged route unionではない。
- 四つの旧assetはledger上すべて `product_target=unresolved`、`authority_status=historical`、`disposition=unresolved`。候補本文を採択・承認・実装根拠へ昇格しない。
- #1500 epoch-exit制約、全域inventory/graph、独自Release/Slice/Bundle/Wave、shadow/enforce/rollback gate、性能閾値、permission/admission規則は候補固有残差として保持。

## 参照した旧sourceとinventory

- 参照した旧archive source: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/world-governance-acceptance.md`, `.../world-governance-intake.md`, `.../world-governance-requests.md`, `.../world-governance-requirements.md`; 行番号とasset IDは各rowに記載。
- 資産台帳: `docs/governance/legacy-asset-disposition.jsonl` assets 874–877（IDs in row table）。Candidate source inventory・source-line carry-forward ledger・archive manifestはJSONのpinned_inputsにSHA付きで記録。
- archive内workflow／runtime／test／CI／toolは実行していない。コードとtestは変更していない。
