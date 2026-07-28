---
title: "HELIX 駆動モデル索引"
status: confirmed
authority: config/drive-route-catalog.json
---

# HELIX 駆動モデル索引

## 1. 正本境界

機械経路正本は`config/drive-route-catalog.json`、人間向け体系正本は
`docs/process/drive-route-system.md`である。本書は個別mode文書への索引であり、旧9-mode、
旧L0-L14、L7固定運用をcurrent authorityとして再利用しない。

駆動モデルは入口signalと再合流を決める。PLAN kind、専門職drive、execution mode、
工程専門workflow、専門capabilityとは別軸である。

## 2. 15 route exact set

| 区分 | route | 文書 |
|---|---|---|
| spine | Forward Full V | [`../forward/overview.md`](../forward/overview.md) |
| delivery | Production Scrum／V設計＋Scrum実装Hybrid | [`scrum.md`](scrum.md) |
| exploration | Discovery | [`discovery.md`](discovery.md) |
| normalization | Reverse | [`reverse.md`](reverse.md) |
| change | Add-feature top-down／bottom-up | [`add-feature.md`](add-feature.md) |
| change | Refactor | [`refactor.md`](refactor.md) |
| migration | Retrofit | [`retrofit.md`](retrofit.md) |
| restoration | Recovery | [`recovery.md`](recovery.md) |
| emergency | Incident | [`incident.md`](incident.md) |
| decision | Research | [`research.md`](research.md) |
| preservation | version-up | [`version-up.md`](version-up.md) |
| verification | OperationVerification | [`../forward/L08-L14-verification-phase.md`](../forward/L08-L14-verification-phase.md) |
| change | design-bottomup | [`design-bottomup.md`](design-bottomup.md) |

物理pathに残る`L08-L14`はcompatibility pathであり、本文の現行authorityはL7〜L12である。

## 3. routeへ昇格させない線

- Scrum ReverseはProduction Scrum／HybridのSR0〜SR4 subroute。
- RedesignはRefactorではなくForward／Add-feature／Reverseへ再分類するdecision。
- Design Refactorは各設計freeze前の意味・性能不変の最小化gate。
- Performance Refactorは外部意味とSLOを維持するRefactor subtype。
- Security、NFR failure、Measurement findingは影響別routeへ分岐するescalation trigger。
- screen-design／frontend-designはForward内の工程専門workflow。
- Design HARNESS、NFR、Authoring Admission、Universal Workflow、worker admissionは専門capability。

exact ID、親route、入口、stable routing code、routing rule、exitはcatalogの`classified_constructs`と
`specialist_workflows`を参照する。

## 4. 共通実行線

全routeは`Issue → PLAN → branch → PR+CI → merge/decision → DB current-location →
right-arm evidence → Forward再合流`へ投影する。route ID、behavior contract、
responsibility owner、HEADがsurface間で一致しなければstaleである。

route入口の選択とaction承認を混同しない。診断、inventory、read-only evidence生成は自律継続し、
production resource、外部write、不可逆cutover等の実actionだけをaction-binding approvalへ束縛する。

## 5. 終端と再入場

終端dispositionは`resolved`、`rejected`、`quarantined`、`superseded`、`cancelled`のいずれか一つ。
HEAD、contract、owner、dependency frontier、evidence freshnessが変わればstaleとなる。
current HEAD／contract／owner／frontierとright-arm evidenceが揃うまで再入場・完了主張を認めない。

全非Forward routeは循環せず有限遷移でForward spineへ到達する。非blocker改善は後続Issueへ送り、
現在routeを無限review loopへ戻さない。
