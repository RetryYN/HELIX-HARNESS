---
status: draft_candidate
authority_status: approved_pending_canonical_promotion
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
approval_record_id: L3-PO-1496-001
approval_scope: candidate_exact_set_only
approval_plan: docs/plans/PLAN-L3-84-helix-concept-v4-upgrade.md
approved_body_sha256: 5ef79685facb3c0641ddd5b9ff716ba5e1043ba931217f9ce73904ecd948136e
authority_note: "本文は候補承認対象の18要件を保持する。未承認表記は承認前の記録であり、現在は候補承認済み・canonical昇格待ち。L2合意・IR admission・runtime適用済みとは扱わない。"
---
# HELIX Concept v4.0 L3要件候補

## Authority境界

本書はIssue #1496の未承認候補であり、current requirements、Requirement IR、runtime、DBへ投影しない。

| ID | 要件 |
|---|---|
| HCV4-FR-001 | systemはrequest、selection、approval、decision、dispositionを別identityとしてsource／actor／target／scope／revisionへ束縛する。 |
| HCV4-FR-002 | systemはIntentからRequirement IR、Design、Responsibility、Workflow、Verification、Release Sliceをauthority順にコンパイルする。 |
| HCV4-FR-003 | actionable behavior、finding、learning asset、release pathへexactly-one primary responsibility ownerを要求する。 |
| HCV4-FR-004 | workerをassignment、branch、base／HEAD、lease／fence、budget、capability、allowed／forbidden pathへ束縛する。 |
| HCV4-FR-005 | independent reviewerをauthoring contextから分離し、candidate HEADとCI generationへexact束縛する。 |
| HCV4-FR-006 | completionをsubject実体、oracle、counterexample、execution receipt、independent review、CI、DB／GitHub read-afterのANDで判定する。 |
| HCV4-FR-007 | semantic authority、Git／GitHub／event fact、receipt、rebuildable DB projection、memory、provider sessionを別authority classとして扱う。 |
| HCV4-FR-008 | runtime起動前にEffective Agent Startup Packetを決定的に生成し、未解決fieldがあればfail-closeする。 |
| HCV4-FR-009 | provider／modelをlogical laneの実装adapterとして扱い、provider名をworkflow、responsibility、authorityのprimary identityにしない。 |
| HCV4-FR-010 | Behavior Contract、Functional Release Slice、Release Module、Bundle、DevOS Artifactを別composition levelとしてexact setで接続する。 |
| HCV4-FR-011 | Release、Deployment、Operation、Incident、Diagnosis、Rollback、Redeploymentを別stateとして追跡する。 |
| HCV4-FR-012 | UIL、TER、Learning、Agentic Audit、System／Future Synthesisの出力をproposal／evidence／deltaに限定し、direct authority writeを拒否する。 |
| HCV4-FR-013 | internal／external findingをRequirement Re-entryへ接続し、影響layerの再整理、再freeze、Forward再合流を要求する。 |
| HCV4-FR-014 | current identityとcompatibility identityを分離し、legacy greenでcurrent failureを相殺しない。 |
| HCV4-FR-015 | evidence correctionをappend-only generationとして保持し、malformed evidenceの削除、上書き、current再解釈を拒否する。 |
| HCV4-FR-016 | Agentic Auditをrisk、trigger、scope、budget、cooldownでadmitし、高価なfull auditを無条件定期実行しない。 |
| HCV4-FR-017 | HELIX Harness、Control Plane、DevOSの責務とrelease boundaryを分離する。 |
| HCV4-FR-018 | Concept projectionをmachine authority向けとhuman README向けに分離し、READMEを意味正本にしない。 |

## Compatibility

v3.1のL1-L12、V-pair、Forward／Reverse／Recovery、fail-close、independent review、Node／Python境界は継承する。
current compatibility registryが列挙するlegacy workflow／layer／runtime identity、provider固定topology、
memory-created authorityはinput-onlyまたはhistoricalへ隔離し、current outputへ再出力しない。
