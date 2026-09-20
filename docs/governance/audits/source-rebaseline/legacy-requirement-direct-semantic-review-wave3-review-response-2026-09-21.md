---
title: "旧要求・旧asset直接semantic review wave 3 review応答"
status: addressed_pending_rereview
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 3 review応答

## 対象

- PR: #1915
- request: `RH-1915-GUI-01`
- base: `5da0a59b253c6772e0e5a1af03deca9562e00167`
- reviewed content: `bfc3083e4b275f8036595b91cac8ac259ca95510`
- request payload SHA-256: `f8c21c8b8a81d44eda1eb7e5878df87c311da1cb914917dda4e34f63058459e4`
- response file SHA-256: `d8b58bb66508b5734bbad9f592e8f99814a505164827ff61f4d1eac3d056ae8b`
- reviewer: Claude GUI `review_merge` lane

## 指摘と処分

| finding | severity | 処分 |
|---|---|---|
| `MAJOR-1915-01-01` | Major | 対応。`unresolved`のFR-33 implementation edgeを`partial_static_implementation_candidate_unresolved_no_implementation_claim`へ変更した。relationごとのcontributionをexact setで固定し、設計や未確定edgeから静的実装証拠を生成できないようにした。 |
| `MAJOR-1915-01-02` | Major | 対応。未review候補55件とconsumer closureが残る3 unitの縮退評価を`unresolved_legacy_implementation_unknown`へ戻した。unknownの間は具体的な`degraded_*`を許さない検査と方法規則を追加した。隣接sourceの観測はedgeに保持する。 |
| `MAJOR-1915-01-03` | Major | 対応。statusのcode spanに`implemented`、`tested`、`operational`が単独状態値として現れた場合を拒否する検査をwave 1・2から継承した。 |
| `MINOR-1915-01-01` | Minor | 対応。connectiveを1〜2文字のallowlistへ制限し、重複とatom意味fragmentとの重複を拒否する。 |
| `MINOR-1915-01-02` | Minor | 対応。status件数をmetadata、crosswalk総数、今回record数から導出して照合する。`product_boundary_resolution_complete`をwave 2と同じshared atom不在の意味へ戻し、implementation unresolved集合からconfirmed集合を差し引く。 |
| `INFO-1915-01-01` | Info | 確認。bounded search、製品別atom、引用、wave非重複、静的検証の成立を保持する。 |

## 境界

本処分はreview済みHEADの指摘対応であり、要求・phase・asset採否、製品owner決定、successor、正式L2／L11、
実装、consumer closureを生成しない。修正後HEADは新しいrequest identityで再reviewする。

## round 2

- request: `RH-1915-GUI-02`
- reviewed content: `5a5af467091716624cadfc5695bbc0071d0e04c4`
- request payload SHA-256: `865bbb947b8592af24596ec75a1bebd359fd819790f73d568e39ba1438388caa`
- response file SHA-256: `32dd79a88467ed21ad42b143ac8e23c2c598c3479dcd410877bc2464fa8efe0a`

| finding | severity | 処分 |
|---|---|---|
| `MAJOR-1915-02-01` | Major | 対応。schema 4と同名fieldの意味を変えず、schema 5では`no_shared_source_span`と`product_boundary_decision_complete`へ分離する。pending atomが一件でもあればdecision完了をtrueにできず、shared集合と前者の一致も検査する。 |
| `INFO-1915-02-01` | Info | 確認。round 1の5件が解消したことと、bounded search／引用bytesが不変であることを保持する。 |
