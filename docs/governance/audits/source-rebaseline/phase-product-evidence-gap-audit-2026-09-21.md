# フェーズ別・製品別の現行証拠gap監査（2026-09-21）

status: research_premise_candidate
authority_effect: none
source: `docs/governance/phase-capability-inventory.json`
source_sha256: `9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c`
source_revision: `a1debecb35264115d4435668a30878da349085cc`

## 監査の単位

20件のPHCAP recordについて、`product_targets`（調査候補scope）と
`current.evidence_products`（現行refが直接裏付ける製品）を製品別に比較した。
候補scopeから要求採用、現行実装、旧実装の適合、製品ownerを推定しない。
旧assetは静的referenceに限り、旧runtime・test・CIは実行していない。

`product_targets`に含まれる製品・フェーズの組合せは54件で、このうち12件には
同一製品の直接current refがない。これは「未実装12件」の計数ではない。
残り42件もrefの存在を示すだけで、製品別の要求・設計・実装・受入の成立を示さない。

| PHCAP / 対応Issue | 現行refが直接裏付けない調査対象製品 | 保持する未決 |
|---|---|---|
| `PHCAP-06` / `#1894` Design／L3 | HELIX-Web、HELIX-Web-OS | 両製品の正式L3導出と旧template再利用評価 |
| `PHCAP-07` / `#1895` Verification／L10 | HELIX-Web、HELIX-Web-OS | 両製品のL10、oracle、正式CIとの関係 |
| `PHCAP-14` / `#1902` Release | HELIX-Web、HELIX-Web-OS | 製品別artifact、promotion、rollback |
| `PHCAP-17` / `#1905` Incident | HELIX-HARNESS | HARNESS固有のincident要求と直接ref |
| `PHCAP-18` / `#1906` Refactor | HELIX-Web、HELIX-Web-OS | 対象製品ごとの変更routeとbackflow |
| `PHCAP-19` / `#1907` Learning／改善 | HELIX-HARNESS、HELIX-Web、HELIX-Web-OS | OS draftから各製品へのbackflowとmemory境界 |

製品別ではHELIX-HARNESSが2件、HELIX-Webが5件、HELIX-Web-OSが5件、
HELIX-OSが0件である。HELIX-OSの0件も実装完了を意味しない。

## 旧能力と現行能力の境界

PHCAPの`legacy.capability_status`はフェーズ全体の代表assetの種別と存在を示す。
その値を四製品ごとの旧実装状態へ複製しない。`current.status`と
`transition_assessment`もフェーズ単位であり、製品別の未実装・縮退の確定値ではない。
製品別に結論を出すときは、対応する旧asset ID、source・判断史・failure・consumer、
原要求atom、製品unit／connection、現行ref、旧到達層、実装・test・運用証拠を
同じrevisionで照合し、欠落は`unknown`として残す。

## 次の処理

上表の対応PHCAP Issueで、まず現行refの有無と製品unit／connection境界を確認し、
その後に旧assetとconsumerの閉包、旧実装状態、縮退・未実装の差分を記録する。
個別要求の採否とsuccessorはRDP-001へ返す。Issue本文やこの監査から
L2／L11適用、L3／L10、実装、新世代CIを開始しない。
