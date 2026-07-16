---
title: "HELIX L6 機能設計 — raw Git-tracked source CAS promotion"
layer: L6
kind: add-design
status: draft
created: 2026-07-17
updated: 2026-07-17
owner: Codex / TL
plan: docs/plans/PLAN-L7-460-git-tracked-source-cas-promotion.md
pair_artifact: docs/test-design/helix/L8-git-tracked-source-cas-promotion.md
---

# raw Git-tracked source CAS promotion

## 1. custody authority

canonical rootは `source-cas/git-authority/sha256/<digest[0:2]>/<digest>.bundle` とする。bundle bytesを通常のGit blobとして
mainの保護履歴へ取り込み、SHA-256 content addressとGit blob OIDをmanifestへ二重束縛する。既存pathはwrite-onceであり、
変更、削除、移動、同path別digestをCI gateで拒否する。同digest replayだけをno-opとして許す。

`.helix/cas` contractはlocal runtime stateで、clean clone、host loss、独立review、365日restoreを満たさないためsupersedeする。
差分は次のとおりである。

| 項目 | 旧 `.helix/cas` | raw Git-tracked CAS |
|---|---|---|
| persistence | local-only / ignored | protected main Git object |
| restore | 同一host依存 | clean cloneからoffline restore |
| raw access | Node限定という設計上の主張 | repository readerはbytesを読める |
| authority write | Node custodian | Node custodian proposal + PR gate |
| immutability | local write-once | SHA path + history + modify/delete/move gate |

exact2 source自体はpublicかつPO-ownedである。storage bytesのread accessと、authority receiptをcurrentへ昇格する権限を分離し、
後者だけをNode custodianと独立verifierへ限定する。Git LFS、Actions artifact、Release assetはcanonical custodyにしない。

## 2. promotion DbC

`evaluateGitTrackedSourceCasPromotion(manifest, observation)` はclosed manifestだけを受け入れる。exact repository 2件、canonical path、
bundle size/digest/Git blob OID、fresh advertisement A/B、ref set、root-tree set、ref-entry edgeをexact一致させる。

promotionには次を全て要求する。

1. A/Bのraw advertisement digest一致と24時間以内の`fresh_until`。
2. secret、credential、PII、history scanが全てpassし、finding 0。
3. `git bundle verify`、isolated bare cloneのstrict fsck、ref set、root-tree set、ref-entry edge replayがpass。
4. authorと異なるactor/runtimeによる同一PR HEAD Git blobの独立再検証。
5. isolated project-owned rootへのoffline restoreと、bundle digestからedgeまでの再演算receipt。
6. base→candidate diffで既存CAS objectのmodify/delete/moveが0。

manifest、observation、receiptの未知fieldは拒否する。bundle未配置、receipt欠落、freshness expired、scan finding、self-review、
replay不一致のどれか一つでも `trusted=false/current=false/coverage_credit=false` とする。

## 3. 非主張

本設計artifactとgateのgreenはcustody設計だけを閉じる。bundle bytes、fresh capture、restore、独立verificationが実在するまで
RA-EXACT2-001、offline atomization、historical CI retention、coverage creditを閉じない。
