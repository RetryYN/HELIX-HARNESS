---
title: 旧orchestration surface退役ratchet
layer: L6
artifact_type: design
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Codex / TL
plan: docs/plans/PLAN-L7-729-legacy-orchestration-new-use-freeze.md
pair_artifact: docs/test-design/helix/L8-legacy-orchestration-retirement-ratchet.md
related_l3: docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md
---

# 旧orchestration surface退役ratchet

## 責務

`team run`、`pair-agent`、旧loop bridge、team-owned slot、static capability routingを
current execution authorityとして新規拡張できないようにする。既存利用は
`compatibility_only_retirement_ratchet`としてpath単位の上限付きinventoryへ固定し、
後継へ移した利用の減少だけを許可する。

## 境界

- inventoryは旧surfaceの正当性を保証せず、退役までの既知債務だけを表す。
- historical archive、gate実装、gate test、当該PLAN／設計はcurrent consumerへ数えない。
- 別pathへの追加、同一path内の増加、重複・退化したentry、authority roleの変更を拒否する。
- 除外先は既知のarchiveと検査自身のファイルだけを許可し、空prefix、src全体、任意consumerの除外追加を拒否する。
- source HEADはinventory採取点であり、現在HEADと一致することを要求しない。
- Phase 1では既存engineを削除せず、実行挙動も変更しない。

## Phase 1：semantic consumer台帳

文字列markerのinventoryだけでは、同じ文字列を含む説明・fixture・履歴と、実際に
旧orchestrationを呼び出すproduction consumerを区別できない。#865 Phase 1では、既存の
文字列ratchetを変更せず、実sourceのsymbol／callsiteに基づくsemantic consumer ledgerを
別のcompatibility-only観測契約として追加する。

ledgerのsource authorityは採取時の`source_head`と実在するproduction sourceである。固定行番号を
正本にせず、`line_anchor`をsource内で再解決し、symbol／commandと同時に照合する。各entryは
次のフィールドを必須とする。

`capability_id`、`symbol_or_command`、`path`、`line_anchor`、`consumer_role`、
`current_authority`、`target_authority`、`successor_symbol`、`migration_state`、
`removal_preconditions`、`negative_oracle_ids`

許可する`consumer_role`は、`direct_execution`、`write_control`、
`generated_current_guidance`、`compatibility_adapter`、`read_only_replay`、
`test_fixture`、`historical_evidence`に限定する。特にhistorical／read-onlyをwrite/controlへ
分類すること、direct callをcompatibility adapterとして登録することを拒否する。

Phase 1の必須観測対象は、team／pair／loopのCLI direct consumer、teamの`fireSlot`／
`releaseSlot`、`max_parallel`によるscheduling、LoopStateのwrite-back、legacy importである。
識別可能なdirect call、直代入alias、静的`import()`、`require()`のmember／destructuring alias、CLI argv形の分割commandによるconsumer隠蔽を
negative oracleとして検査する。`tick(`、`store.write(`、`plan.max_parallel`のような汎用tokenは
repo-wide検出へ使わず、ledgerに登録したsource pathとexact anchorで検査する。
ledgerのentry集合、採取元`source_head`、entryごとのnegative oracle集合はclosed setとして照合し、
未知entry、未承認HEAD、oracleの追加・欠落をfail-closeする。既知symbolのdirect call数が採取時baselineを
超えた場合も、ledger未登録consumerとして拒否する。
ledger bytesは既存のpublished-base inventoryへSHA-256でpinし、main到達後はledgerとvalidatorを
同時変更してpinを自己更新することも拒否する。初回pinの真正性はexact-HEAD独立reviewで封緘する。

`migration_state: migrated|retired`への遷移は、predecessor Issueのcloseだけでは成立しない。
production successor callsite、consumer zero、parity E2E、rollback、read-afterの全条件と、
実source上の`successor_symbol`を要求する。Phase 1では現行entryを`frozen`として記録し、
新schedulerの導入、旧engineの削除、旧authorityの解除は行わない。

## 後続

本検査が計測するのは既知markerの文字列出現数であり、実行consumer数ではない。
同一path内の同数置換、別名経由の呼出し、動的なcommand組立ては本検査だけでは判定できない。
したがって出現数0をconsumer 0の証拠として使ってはならない。後続phaseではCLI登録、
import／callsite、生成template、外部consumerを追跡し、successorへの移管証拠と合わせて退役を検収する。
inventory上限はcandidate自身から正当化しない。published baseから取得したinventoryと比較し、
上限増加、新規path登録、除外拡張、source HEAD差替えを拒否する。削減がpublishedされた後は
削減後の値を次の上限とし、元の上限への再増加も拒否する。
初回導入はpublished inventoryがないため、検証済み基準revisionからの採取と通常更新を区別する。
基準取得不能をcandidateへのfallbackで補わない。基準変更は別のauthority移行として扱う。
比較関数の単体greenだけでは完了しない。loader／doctorへのtrusted base接続と初回導入の
検証が成立するまでF07は未解消とする。

inventoryは#865のphaseごとに単調減少させる。consumer 0、successor parity、canary、rollback、
major-version gate成立後にのみdirect engineを削除する。read-only replayとhistorical evidenceは
write/control authorityと別に扱う。

semantic ledgerはinventoryの代替ではない。文字列ratchetは既存の新規利用freezeを継続し、
semantic ledgerはconsumerの意味分類と移管前提を追加で検査する。両者の結果を相殺せず、
どちらか一方でも不明・欠落・退化した場合はPhase 1の検証を失敗とする。
