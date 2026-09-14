# 新世代の運用品質と旧Infrastructure Operations Quality候補の対応

確認日: 2026-09-14

## 目的

`infrastructure-operations-quality-{intake,l1-request-candidates,l3-requirement-candidates,l10-acceptance-candidates}.md`を、
HARNESSの工程契約、HELIX-OSの運用統制、個別製品の品質要求へ再分類する。旧候補は要求群9件、L1要求5件、
L3要件9件、L10受入9件であり、全てunapproved candidateである。

本表は要求源の照合である。旧Issue、旧owner、既存engine、既存CIを新世代へ継承せず、L2合意、L3凍結、
L10／L11受入、Requirement IR更新、runtime・運用・自動修復を実行しない。

## 上位要求の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| NIO-L1-01 | 要求形成時に品質領域の適用性とunknownを明示する | HARNESS-L2-003／004／005、各製品L2 | 一律の品質項目や数値をHARNESSが全製品へ固定しない | split_reapproval_required |
| NIO-L1-02 | 同じ要求revisionから設計・検証・運用観測・再要求化へ辿る | HARNESS-L2-004、HELIXOS-L2-002／005／007 | 旧Requirement Re-entry engine、Issue、DBを意味authorityにしない | split_reapproval_required |
| NIO-L1-03 | designed／implemented／verified／observed／operatedを別状態として扱う | HARNESS-L2-003／005、HELIXOS-L2-002／007 | 旧状態enumや既存projectionを固定しない | semantic_atom_candidate |
| NIO-L1-04 | 第二正本・重複責務を作らない | HELIXOS-L2-002／003、新世代asset policy | 既存計測・event・logging・incident・lifecycle engineの再利用を要求しない。legacyは意味採取後にarchive化する | legacy_reuse_rejected |
| NIO-L1-05 | 承認scope内の自律実行と、高影響操作の別authority | HELIXOS-L2-001／004／009 | 旧runtime admission、旧policy、旧ownerを許可根拠にしない | authority_rederivation_required |

## 詳細要件の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| NIO-L3-01／02 | 対象・環境・workload・failure・data・復旧・運用の適用性を漏れなく要求化する | HARNESS-L2-003／004／005、各製品L2 | `Design Obligation Graph`、固定項目enum、旧生成機構を新世代componentとして継承しない | contract_rederivation_required |
| NIO-L3-03／04 | 計測とlogの意味、出典、freshness、欠測、機密保護を明示する | 各製品L2／L3、HELIXOS-L2-007 | collector、schema、保持期間、severity、具体SLOは対象製品が承認する | product_specific_reapproval |
| NIO-L3-05 | finding、通知、incident、ack、expiryを追跡する | HELIXOS-L2-004／007／009 | 旧alert router、Issue owner、providerを固定しない | operational_rederivation_required |
| NIO-L3-06 | backup／restore／rollback等を文書の存在でなく実結果で判定する | HARNESS-L2-005、HELIXOS-L2-006／007、各製品L2 | 具体procedure、RTO／RPO、対象環境は製品・release別に承認する | split_reapproval_required |
| NIO-L3-07 | 運用証拠を要求へ戻し、変更候補と採否を追跡する | HARNESS-L2-004、HELIXOS-L2-002／005／007 | 旧re-entry engineから要求を直接変更しない | semantic_atom_candidate |
| NIO-L3-08 | 自動修復を対象・権限・予算・影響・復旧・独立検証で制限する | HELIXOS-L2-004／007／009、bugbot要求源 | この候補を自動修復権限として使わず、旧tool・actor・admissionを継承しない | moved_to_bounded_repair_reapproval |
| NIO-L3-09 | 状態遷移に証拠を要求し、欠測・staleをhealthyへ変換しない | HARNESS-L2-003／005、HELIXOS-L2-007 | 旧状態機械、collector、health判定を再利用しない | split_reapproval_required |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 書換え条件 | 状態 |
|---|---|---|---|---|
| NIO-L10-01 | 根拠のない品質値を生成しない | 各製品L11／L10、HARNESS-L2-003の工程反例 | unknownの存在だけを合格にせず、決定owner・期限・差戻し先を要求する | oracle_rewrite_required |
| NIO-L10-02／03 | 欠測・stale・別環境の成功を運用成立へ読み替えない | 各製品L11／L10、HELIXOS L11 | 旧collector、production環境、canary方式を固定しない | oracle_atom_candidate |
| NIO-L10-04／05 | restore、rollback、恒久修復、再発防止を別結果として確認する | HARNESS L11、HELIXOS L11、各製品L11／L10 | 旧backup・incident機構の実行を合格条件にしない | split_oracle_reapproval |
| NIO-L10-06 | secret／PIIを人間向け成果や証拠へ露出しない | 各製品L11／L10、HELIXOS L11 | 具体redaction／scan方式は設計層で再導出する | oracle_atom_candidate |
| NIO-L10-07 | scope外の修復・公開・課金・production writeを拒否する | HELIXOS L11 | この候補を操作認可にせず、操作別authorityを別に要求する | authority_oracle_rewrite |
| NIO-L10-08 | 要求から運用・再要求化までの必須trace欠落を検出する | HARNESS L11、HELIXOS L11 | 旧graph edgeや既存CIをoracleにしない | split_oracle_reapproval |
| NIO-L10-09 | Issue closeや文書存在を統合能力の完成証拠にしない | 対象別L11 | GitHubは同期・作業projectionとしてだけ扱う | oracle_atom_candidate |

旧文書はこれらをL10と呼ぶが、利用者が確認する結果とsystem verificationを分離できていない。対象別L2の
利用者結果はL11へ、L3で決める機械契約と故障注入はL10へ、実運用効果はL12へそれぞれ降ろし直す。

## 新世代で固定する責務境界

1. HARNESSは、対象製品の運用品質をL2で検討し、設計・検証・運用観測・再要求化へ接続する工程条件を所有する。
2. HELIX-OSは、管理対象の配備、監視、log・証拠保全、incident、復旧、保守、改善候補の運用を統制する。
3. 個別製品は、適用環境、workload、可用性、性能、容量、費用、security、privacy、RTO／RPO、保持期間等の要求値を所有する。
4. 具体値、環境、予算、blast radius、操作authorityは対象製品・release・操作ごとに承認する。
5. 既存機構に同種能力があってもcurrent pathへ再接続せず、legacy sourceとして意味と判断史を保全して新世代を上流から再構築する。

## 次工程

Concept v4.1と対象別L1の承認後、本表の候補をHARNESS、HELIX-OS、各個別製品のL2／L11へ個別採否する。
その後にL3／L10で機械契約を導出する。要求整理が閉じるまで既存CI、旧owner、旧運用・自動修復機構を実行しない。
