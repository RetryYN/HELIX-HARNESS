---
title: "成果生成主体 provenance分離 要件候補"
status: draft_candidate
canonical_layer: L3
canonical_pair: L10
plan: PLAN-L3-1622-producer-provenance-separation
source_requests: docs/governance/candidates/producer-provenance-separation-requests.md
pair_artifact: docs/governance/candidates/producer-provenance-separation-acceptance.md
---

# 成果生成主体 provenance分離 要件候補

## PPS-R-01 役割identityの分離

上流: `PPS-BR-01`。下流: `PPS-AC-001`, `PPS-AC-002`。

各変更episodeは`content_producer`、`commit_executor`、`pr_publisher`、`independent_reviewer`を別fieldで保持する。
各identityはruntime、model、provider session、assignmentを、その役割で実測できる範囲に限って束縛する。

## PPS-R-02 成果とassignmentの因果束縛

上流: `PPS-BR-01`, `PPS-BR-03`。下流: `PPS-AC-003`, `PPS-AC-004`。

content producerはassignment ID、scope authority、許可path、成果digest、candidate HEADへ束縛する。commit executorや
publisherが変わってもproducer identityを上書きせず、成果digestまたはHEADが変われば新しいgenerationとして扱う。

## PPS-R-03 独立review判定

上流: `PPS-BR-02`。下流: `PPS-AC-005`, `PPS-AC-006`。

独立性はcontent producerのruntime／provider／model family／sessionとの関係で判定する。commit executorまたは
PR publisherがproducerと異なるだけでは独立性を成立させず、同一producer系統のreviewをterminal evidenceにしない。

## PPS-R-04 GitHub actor・commit metadata境界

上流: `PPS-BR-02`。下流: `PPS-AC-002`, `PPS-AC-007`。

GitHub actor、author/committer metadata、署名、receipt identityは相互参照してよいが代用しない。raw actor spoofing、
commit executorからproducerへの推測、publisherからreviewerへの推測をfail-closeする。

## PPS-R-05 単一provenance graph

上流: `PPS-BR-03`。下流: `PPS-AC-008`, `PPS-AC-009`。

receipt、PLAN、DB projection/replay、GitHub comment、review admission、merge admissionは同一schema versionとgraph digestへ
収束する。一面のidentity欠落・改変・wrong HEAD／assignmentを他面の値で補完しない。

## PPS-R-06 欠落・不明の扱い

上流: `PPS-BR-03`, `PPS-BR-04`。下流: `PPS-AC-004`, `PPS-AC-009`。

producer provenanceを実測できない場合は`unknown`または`unattested`として保持し、terminal independent reviewへの昇格を
拒否する。診断は欠落役割とsourceを示し、暗黙fallbackしない。

## PPS-R-07 互換移行

上流: `PPS-BR-04`。下流: `PPS-AC-010`。

direct author=committerで実測済みの既存経路はversioned compatibility projectionで受理可能とする。旧receiptを履歴として
保持し、producerを推測でbackfillせず、新schemaとdual-readした後にcurrent outputを新graphへ一方向移行する。

## 既存責務の再利用

- #1605のreviewer session/model真正性と既存review receipt admissionを拡張し、別review基盤を作らない。
- GitHub actor分離、worker lifecycle receipt、assignment／scope／HEAD identityを再利用する。
- commit署名方式、provider routing、resident lane、Notification Fabricは本候補で変更しない。

本候補は人間承認、canonical promotion、Requirement IR admission前にruntime／schema／DBを変更しない。
