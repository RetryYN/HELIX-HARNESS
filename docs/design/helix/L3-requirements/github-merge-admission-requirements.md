---
title: "GitHub merge admission 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-22
updated: 2026-08-25
owner: PO / TL
pair_artifact: docs/test-design/helix/github-merge-admission-system-test-design.md
---

# GitHub merge admission 要件定義

## 1. 目的と適用境界

本書は`github-autonomous-operations-requirements.md`のGH-FR-001..017を変更せず、PRの同一HEAD文脈レビューと
`harness.db`追従をmerge必須条件として追加する。CI green単独、自分自身の判断、別HEADのreceiptをmerge根拠にしない。

## 2. 機能要件

### GH-FR-018 同一HEAD文脈レビューとDB追従

作成者と別identity・別session・独立contextのAI-Bが、L0 authority、L2要求、L3要件とAC、L4基本設計、Issue/PLAN、
変更diff、trace、既存consumer、security・blast radiusを読み、要件適合と設計整合を判断する。入力path/digest集合、
reviewer identity/runtime/model/provider/session、finding/disposition、verdictをcurrent PR HEAD SHAへ束縛したtyped receiptに記録する。

同じHEADから隔離再構築した`harness.db`について、source HEAD、event head、projection digest、checkpoint digest、schema revision、
stale/orphan件数、rebuild一致結果をDB追従receiptへ記録する。DB未更新、event/projection片肺、checkpoint stale、rebuild不一致、
source HEAD不一致のいずれかがあれば文脈レビューPASSとmerge readinessを拒否する。

push、CI self-heal、base更新、入力正本digest変更のいずれかでHEADまたは入力集合が変わった場合、両receiptをstale化し、
AI-Bレビューから再実行する。runtime/provider familyの違いだけを独立性とみなさず、AI-A自身のverdict、単一AI fallback、
`degraded_mode`を禁止する。

### GH-FR-019 作成・監査・修正・クロスレビュー責務

AI-AはPR作成前の内部CI、blocker修正、局所検証、pushを担う。AI-Bはcurrent HEADをread-onlyでレビューし、
finding disposition、後続Issue記録、merge判断を担い、編集・push・Ready化を行わない。
AI-Bはreview receiptをPR commentへ記録し、AI-Aはreceiptのidentity、reviewed HEAD、verdict、時刻、digestを
PLANの`review_evidence`と`left_arm_carry.review_binding`へ意味変更せず機械転記してReady化する。
AI-Bは最終HEADで転記一致を再照合し、値の欠落・改変・別HEAD束縛があればmergeを拒否する。

現在のbehavior contract違反、correctness/security/data loss、必須oracle red、mainをredにする問題、
虚偽または過大な完了証拠はblockerとする。同じ責務・既存scope内で安全かつ局所的に閉じるfindingは
severityにかかわらずcurrent PRでAI-Aが修正する。独立責務、別設計、lifecycle、性能改善、将来の堅牢化だけを
後続Issueへ送り、current PRへ再流入させない。

AI-Bはblockerを同一HEADにつき一括返却する。修正pushで旧receiptをstale化し、新HEADのAI-B review、
内部CI、GitHub Actions、DB追従が全て合格した場合だけAI-Bが明示mergeする。新しい独立blockerの実証が
ない限り再レビューは一巡で収束し、改善提案によるscope expansionを行わない。

### GH-FR-020 typed workflow identity admission追加契約

changed pathにcurrent `workflow_identity`を持つPLANが含まれるPRは、そのPLANの`github_issue_id`を
唯一のIssue authorityとして使用する。PR本文と当該Issue本文は、同じversioned marker付きstrict JSONで
`registry_version`、`registry_source_digest`、`target_axis`、`target_id`を宣言し、PLANおよび
requirements-owned workflow分類registryとexact一致しなければならない。`Refs`、label、title、prose、
旧15-route、`mode`／`model`／`route_mode`／`catalog_route_id`／`route_class`からidentityを推測しない。

同一PRにcurrent `workflow_identity`を持つchanged PLANが複数ある場合は、通常PRでは原子的slice違反として拒否する。
ただしrequirements-owned workflow分類registryのversion-upでは、PR本文のstrict migration bundle contractが
exactly oneの`VERSION_UP` owner PLAN、sorted uniqueなchanged PLAN path全件、同一の新registry version／digest、
新catalogに存在する各typed identityを宣言し、canonical registryとgenerated catalogを同時変更する場合だけ受理する。
manifest外PLAN、owner欠落／複数、旧新version／digest混在、未知identity、authority path欠落はfail-closeする。
また、Forward PLANとReverse fullback PLANを同一Issueの終端closureへ束ねる場合は、migrationとは別の
terminal fullback bundle contractを使用する。terminal bundleはrequirements version-upを主張せず、sorted uniqueな
changed PLAN manifest、exactly oneのowner PLAN、全PLANのcurrent registry version／digest／catalog identity、
全PLANの同一`github_issue_id`、Issue／PR／PLANの同一tuple、current HEADを要求する。ForwardとReverseの
`target_id`はそれぞれ保持し、ownerのidentityへ潰してはならない。registry authority pathの同時変更を要求せず、
migration markerとの併記、manifest／owner／identity／Issue／HEADの欠落・不一致、legacy推測は専用reasonで
fail-closeする。terminal bundleはIssueとPLANの終端を許可する契約ではなく、終端fullbackを検査可能にする
admission契約であり、completion claimは別のcurrent-head review、CI、main read-afterを満たすまで禁止する。
marker欠落・重複、JSON／schema不正、legacy field、authority drift、未知identity、signalのunknown／
decision待ち／ambiguity／identity矛盾、Issue／PR／PLAN不一致を別reasonでfail-closeする。changed PLANが
legacy compatibility-onlyでcurrent `workflow_identity`を持たない場合に限り本追加gateを非適用とし、
legacy identityの成功でcurrent gateの失敗を相殺しない。

### GH-FR-021 execution episode identityと同一責務束縛

GitHub signalを受理した時点で、再生成や別work itemへの流用ができないopaqueな`episode_id`を一件だけ発行する。
`episode_id`はworkflow identityと別fieldで保持し、requirements-owned registryのversion／digest／axis／ID、
source event ID／digest、Issue、PLAN、branch、PR、base、current HEAD、owner、behavior contractを同じepisodeへ
exact束縛する。Issue、PLAN、branch、PR、source event、behavior contractの所有resourceは高々一つのactive episodeへ所属し、
同じbehavior contractを別episodeへ暗黙複製しない。baseとcurrent HEADはepisodeへexact束縛する照合属性であり、
異なるepisodeが同じbase／commitを参照すること自体はglobal resource競合にしない。

PLAN、PR、review、CI、DB、right-arm evidenceは`episode_id`とcurrent HEADを明示し、別episode、旧HEAD、旧owner、
未束縛resourceのevidenceを拒否する。`project_current_location`はcurrent episode identityとworkflow identityを別columnで
投影し、legacy `mode`／`model`／旧route ID、prose、label、branch名から補完しない。未分類、複数候補、decision待ち、
resource競合はunknownをForwardへ丸めずfail-closeする。

複数のactive episodeは正常な並行workとして許可するため、単一行のglobal `project_current_location`へ任意の一件を
current episodeとして選択しない。global snapshotはactive／terminal episode件数とepisode set digestだけを保持し、
episodeごとのcurrent locationは`episode_id`を主キーとする独立projectionへ、workflow identity、state、current HEAD、owner、
behavior contract、last event digestをexact投影する。0件は空集合、1件は一意、複数件は全件を保持し、配列順、updated time、
branch名から代表episodeを推測しない。episode event／outbox／projectionとepisode locationは同じDB transactionで更新する。
global snapshot未生成時は、他fieldを推測せず`current_status=uninitialized`のcanonical bootstrap rowをepisode transaction内で
一度だけ生成し、episode event、outbox、episode projection、location、aggregateと同時rollback可能にする。件数またはepisode set digestの更新時はglobal `snapshot_hash`も同一transactionで
再導出し、aggregate、global fields、hashのいずれかが不一致ならconvergenceをfail-closeする。

### GH-FR-022 execution episode state machineとexactly-once closure

episodeはappend-only eventとtransactional outboxを正本とし、projectionを
`admitted → planned → branch_bound → pr_open → review_pending → merge_ready → merged → closure_pending → closed`
の順に遷移させる。retry、crash、duplicate delivery、partial merge後処理は、`episode_id + transition + preimage revision`
のidempotency keyとCASでreconcileし、同じtransitionを二重commitしない。前段を飛び越す遷移、terminal後の再利用、
別HEAD receiptによる昇格、outbox未送達をgreenへ変換することを拒否する。

`resolved`、`rejected`、`quarantined`、`superseded`、`cancelled`は相互排他的なterminal dispositionとして保持する。
`superseded`／`cancelled`はPO decisionを要求し、全terminal dispositionはcurrent closure receipt、未完outbox 0、
resource lease解放、main read-after、DB replay convergenceを満たす。terminal後に追加signalが来た場合は既存episodeを
再開せず、新episodeとしてadmissionから処理する。

### GH-FR-023 right-arm evidenceのepisode exact束縛

G8〜G12のright-arm evidenceはterminal closure receiptと混載せず、append-onlyの独立台帳へ記録する。
各recordは`evidence_id`、`episode_id`、current HEAD、owner、behavior contract、workflow registry
version／digest／axis／ID、gate、evidence kind、repository-relativeの正規POSIX artifact path、evidence digest、
verifier command digest、observed timeを必須とする。受理時点のepisode projectionとexact照合し、別episode、
旧HEAD、旧owner、別contract、別workflow identity、absolute／parent traversal pathを拒否する。

同じ`evidence_id`と同じrecord digestのretryだけをidempotent replayとして許可し、同一IDの内容変更は
immutable conflictとしてfail-closeする。legacy mode／model、prose route、branch名からidentityを補完しない。

## 3. 受入条件

| AC        | 合格条件                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GH-AC-014 | CI greenでも、必須文脈を読んだAI-Bのcurrent HEAD束縛receiptがなければmergeをblockする                                                                                                                                                                                                                                                                                                                                                                       |
| GH-AC-015 | 隔離DB再構築でsource HEAD、event、projection、checkpoint、schemaが一致し、stale/orphan 0の場合だけDB追従receiptを受理する                                                                                                                                                                                                                                                                                                                                   |
| GH-AC-016 | AI-Aの内部CIと、修正後HEADのread-only AI-B review、内部CI、GitHub Actions、DB追従が全て同じHEADへ収束するまでmergeをblockする。AI-Bの編集・push・Ready化とnative auto-mergeを拒否し、AI-Aによるreview receiptの機械転記とAI-Bによる最終HEAD再照合を要求する                                                                                                                                                                                                 |
| GH-AC-017 | current contract内の局所correctness/security findingはcurrent PRで修正し、独立責務・別設計・lifecycle・性能改善だけを後続Issueへ分離する。後続Issueをcurrent PRへ再流入させない                                                                                                                                                                                                                                                                             |
| GH-AC-018 | current workflow identityを持つchanged PLANが1件の場合、PLANの`github_issue_id`で束縛したIssue本文・PR本文・PLAN tuple・requirements registryがexact一致するときだけadmissionをgreenにする。複数PLANは通常拒否し、registry version-up時だけexact owner／path manifest／新version・digest／catalog identity／authority pathsを満たすstrict migration bundle、または同一IssueのForward／Reverse終端fullback時だけterminal fullback bundleとして受理する。terminal bundleは異なるtyped identityを保持し、全PLANのcurrent version／digest／catalog identity／Issue、manifest、owner、HEADをexact照合する。欠落、混在、未知identity、legacy field、drift、曖昧・不一致を専用reasonで拒否する |
| GH-AC-019 | workflow identityと別の`episode_id`へsource event、Issue、PLAN、branch、PR、base／HEAD、owner、behavior contractをexact束縛し、別episode／旧HEAD／旧ownerのevidence、resource重複、legacy補完を拒否する。複数active episodeはepisode別locationへ全件投影し、global current-locationで代表一件を推測しない                                                                                                                                                   |
| GH-AC-020 | append-only event＋transactional outboxのreplayが同じepisode stateを返し、retry／crash／duplicate delivery／partial closureをexactly onceでreconcileする。順序飛越し、terminal再利用、未送達outbox、closure receipt／main read-after欠落を拒否する                                                                                                                                                                                                          |
| GH-AC-021 | G8〜G12 evidenceをcurrent episode／HEAD／owner／contract／workflow identityへexact束縛したappend-only recordとして受理する。別episode、旧HEAD、別owner／contract／identity、非repository-relative artifact、同一ID改変を拒否する                                                                                                                                                                                                                            |

## 4. freeze境界

本書はL3要件であり、L4/L9設計、L5/L8詳細設計、L6/L7実装契約とTDD、実行証拠を先取りしない。
