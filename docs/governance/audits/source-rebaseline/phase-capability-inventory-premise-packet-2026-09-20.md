---
title: "HELIX全フェーズ能力棚卸し premise packet"
status: initial_inventory
authority_effect: none
captured_at: 2026-09-20
---

# HELIX全フェーズ能力棚卸し premise packet

## 判断論点

旧HELIXを直接実行・復活・copyせずに、新世代で次の要求判断へ進む前に、どのphase能力をどの製品候補scopeで調べ、どの旧到達層・現行状態・縮退・欠落を閉じる必要があるか。

この論点は20 phaseを一括採用する問いではない。20件を調査座標へ分け、後続で一要求identityずつ判断するための入口である。

## 親revisionと調査scope

- 親Concept／四製品L1: `docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md`が束縛する5文書。
- current evidence revision: `e784fa68702af4b7c57911b866b48fe7df094f88`。各refのbytes digestは`phase-capability-inventory.json`の`current_evidence_snapshot`に記録する。
- legacy source revision: `legacy-generation-2026-09-14`。`legacy-asset-disposition.jsonl`とarchive manifestでidentityとbytesを確認し、旧workflow、runtime、CI、testは実行しない。
- scope: Concept／L1からMemory／継続再構成までの20 phaseについて、候補製品、現行証拠製品、現行状態、旧代表asset、旧到達層、移行状態、gapを初期分類する。

## premise状態

| 種別 | 内容 | source／時点 |
|---|---|---|
| `known` | 現行の製品identityはHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSに分かれ、HARNESSは工程意味、OSは管理・統制・Worker・CI・log・学習、Webは利用者向け製品、Web-OSはservice runtimeを担う | `docs/concept/product-boundary.md`、2026-09-20取得 |
| `known` | 旧Requirement IR 153件の第1層routingは87 single、65 split、1 connectionで、successor割当は未完 | `product-routing-completion-and-l2-entry-2026-09-17.md`、2026-09-20取得 |
| `known` | 旧asset台帳は4,020件を保持するが、今回のinventoryは代表assetだけをphaseへ接続する | `legacy-asset-disposition.jsonl`、2026-09-20取得 |
| `known` | 新世代CIは未構築で、Review convergenceだけが`SCF-B-0003`で運転中 | `new-generation-start-here.md`、`scaffold/governance/index.md`、2026-09-20取得 |
| `assumption` | 20 phaseは全旧能力を調査へ割り当てる最初の座標として十分である | consumer closureで未割当能力が見つかればphase追加・分割する |
| `assumption` | `product_targets`は将来の採用先ではなく調査候補scopeとして使用できる | 個別要求のproduct decisionで再評価する |
| `unknown` | 代表asset以外を含む各phaseの全consumer、要求atom、実装依存、運用依存 | #1889〜#1908でclosureする |
| `unknown` | unit／connection／compositeの分割、successor ID、正式L2／L11、L3／L10 | 一要求identityごとの後続PRへ返す |
| `conflict` | 旧文書の単一HELIX／Harness表現と現行四製品境界が一致しない箇所がある | 旧ownerをcurrent ownerへ自動写像しない |
| `stale` | 旧実装・test・workflowの存在は確認できても、2026-09-20時点の利用可能性、pass、適合性は証明しない | 旧runtime／CI／testをoracleにしない |

## 適用条件と限界

本packetはinventory research、consumer closure、要求分類、要求判断準備、inventory更新にだけ適用する。要求採否、旧asset再利用、設計freeze、Scaffold新設、実装、release、deploymentを許可しない。GitHub IssueとPRは作業・review evidenceのprojectionであり、意味authorityではない。

本inventoryの`product_targets`は候補scope、`current.evidence_products`は現行refで直接裏付けた範囲である。前者から後者を推定しない。旧`capability_status`はasset種別と存在だけを表し、実行結果や品質を表さない。

## 反例

- Webを候補scopeに含めても、WebのL3／L10 refがなければ「Web設計・検証が存在する」とは判定できない。
- `tests/*.test.ts`やtest designがarchiveにあっても、旧testを実行済み・pass・現行適合とは判定できない。
- 高いlayer番号のrunbook適用先があっても、そのphase能力がそのlayerまで実装されたとは判定できない。
- Issue close、PR merge、CI greenだけでは要求採否やconsumer closure完了にならない。

## 再調査条件と返却先

次のいずれかでinventoryを再調査する。

1. 未割当の旧asset／consumer／要求atomが見つかる。
2. current refまたは親Concept／L1 revisionが変わる。
3. 候補scopeと現行証拠製品の差が個別要求判断に影響する。
4. `capability_status`より弱い証拠、または追加layerの証拠が見つかる。
5. Scaffoldが正式能力へ置換・retireされる。

結果は対象の`PHCAP-*` inventoryとlocal taskへ戻し、GitHub Issueを再投影する。要求採否が必要なら、一要求identityのpremise／decision packetへ分離する。
