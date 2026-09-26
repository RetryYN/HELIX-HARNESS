---
title: "HELIX-CONNECT L1企画案"
canonical_vmodel: L1-L12
canonical_layer: L1
canonical_pair: L12
layer: L1
kind: planning
status: draft
authority_status: draft_candidate
parent_concept: docs/concept/helix-concept.md
source: docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md
decision_record: docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md
created: 2026-09-27
updated: 2026-09-27
---

# HELIX-CONNECT L1企画案

本書は[HELIX Concept](../../concept/helix-concept.md)を親とし、POが2026-09-27に示した[企画原文](../sources/connect-l1-po-original-2026-09-27.md)を起点にしたL1候補である。PO原文は「接続部分を疎結合に保ち、各機構への変更耐性を強化する」ことをHELIX-CONNECTの目的とする。原文から目的範囲を拡げない。

本書は`draft_candidate`であり、この対象revisionの企画意味をPOが確認する。文書の存在、ID登録、L2/L11候補、review、mergeから要求合意、L3要件承認、実装または運用許可を生成しない。

## 提供価値

HELIX-CONNECTは、HELIX内の機構どうし、および内部と外部の構造をつなぐ共通部品である。接続部分を各接続先の機構から疎結合に保ち、それぞれの機構が変わったときに他の接続先へ広がる変更を抑え、接続単位で影響を確かめられるようにする。

HELIX-CONNECTの対象範囲はConcept記載の接続登録、契約版照合、通信、再送、追跡である。要求では、各接続の単体成立と複数機構をつなぐ構成体の成立を分けて具体化する。単体接続の成立を構成体全体の成立へ読み替えない。

業務上の意味、処理内容の判断、要求採否、業務承認は接続先の権限主体に残る。HELIX-CONNECTは判断または承認を行わない。利用者へ接続を提供するHELIX-WEB-CONNECTORはHELIX-Webの接続製品であり、本機構の所属・要求に含めない。

## 企画要求

| ID | L1企画要求 | 原文 | 種類 |
|---|---|---|---|
| HELIXCONNECT-L1-001 | 接続ごとの構造を接続先の機構から疎結合に保ち、接続先の機構への変更が他の接続先へ不必要に波及しないようにして、各接続の変更影響を確かめられる | PO原文「CONNECT各機能の接続部分を疎結合に保ち、各機構への変更耐性を強化する機構。」 | 単体・構成体に適用 |

## 版の扱い

PO原文のとおり、段階リリースの境界をHELIX-CONNECT固有の機能として新設しない。各段階で機能として成立する範囲は、要求の単体・接続・構成体ごとに定める機能から導出する。ここではリリース段階、リリース順序、版ごとの機能一覧を決めない。

## Conceptおよび旧HELIXとの対応

| 本書 | 起点 | 保持する点 | 変更・導出する点 |
|---|---|---|---|
| HELIXCONNECT-L1-001 | 現行ConceptのHELIX-CONNECT行（接続登録、契約版照合、通信、再送、追跡。業務判断・承認をしない） | HELIX内外の構造を接続し、接続機構として振る舞う。WEB-CONNECTORと分離する | POの目的を、接続部分の疎結合と接続先機構への変更耐性に明示する。要素間契約、stale検出、片側交換時の確認方法はL2/L11候補で具体化する。Conceptの責務を越えて業務判断・承認を追加しない |
| 契約照合・通信・再送・追跡の候補 | 旧product data connector設計（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md:33-57, 86-109`、asset `LEGACY-ASSET-C3DE79BA9451172F3E43`、SHA-256 `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04`）およびL6関数設計（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/product-data-connector.md:27-57`、asset `LEGACY-ASSET-DD66C1B6B7BE234B37E6`、SHA-256 `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42`） | versioned contract、互換確認、接続境界とauthority分離、idempotent retry、状態遷移とlineageを分離して扱う設計上の知見 | 旧資産は特定のproduct data ingestionであり、HELIX-CONNECTの内部・外部接続一般と同じ役割ではないため完全一致再利用しない。接続登録・契約照合・再送追跡という意味に限って再導出する。旧runtime、実装、試験、CIは実行・移植しない |
| adapter境界とfailure history | 旧ADR-003（`archive/legacy-generation-2026-09-14/root/docs/adr/ADR-003-runtime-adapter-boundary-subscription-cli.md:8-24, 26-45`、asset `LEGACY-ASSET-BD13CC67526B48D461F9`、SHA-256 `ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37`）。旧consumer `docs/design/harness/L4-basic-design/external-if.md`、`docs/design/harness/L5-detailed-design/if-detail.md`の説明を含む | 外部固有境界をadapterに隔離し、接続元の契約に束縛する。failure A-71は、設計の境界が未固定だとAPI-key認証前提が下位設計へ漏れるconsumer failureを記録する | CLI起動方式、providerの認証方式、API key禁止の旧前提はCONNECT一般の新規契約へ転用しない。CONNECT要求は接続先が所有する意味契約と交換可能性に焦点を当てる。consumer全件照合は別の接続棚卸しに残す |

旧product data connectorとADR-003のasset ID・source path・行・digestを照合し、旧L5/L6の契約・再送・接続境界、ADR-003のfailure historyとconsumer boundaryを読んだ。これは意味の再導出であり、旧機構の採用やHELIX-CONNECT全体の網羅調査を意味しない。

## L2/L11への受渡し

要求候補では少なくとも、接続登録、接続ごとの契約版照合とstale再検証、契約に束縛した通信、重複効果を避ける再送と試行追跡、片側交換後の互換確認を扱う。受入候補では、これらを単体接続でそれぞれ確認し、複数機構を連ねた構成体で再確認する。段階リリースはこれら機能要求から成立部分を導き、CONNECT独自の段階管理要求にしない。
