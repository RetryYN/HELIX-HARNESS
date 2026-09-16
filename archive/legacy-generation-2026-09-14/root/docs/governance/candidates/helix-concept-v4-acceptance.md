# HELIX Concept v4.0 L10受入候補

## Authority境界

本書はIssue #1496の未承認候補であり、受入正本ではない。

| ID | 対象 | Oracle |
|---|---|---|
| HCV4-AC-001 | Authority | provenanceのないhuman approval／decisionを投入すると拒否される。 |
| HCV4-AC-002 | Authority | Issue本文またはmemoryだけからcurrent Requirement IRを生成すると拒否される。 |
| HCV4-AC-003 | Compiler | candidate、unknown、compatibility inputをcurrent outputへ変換すると拒否される。 |
| HCV4-AC-004 | Responsibility | primary owner欠落または複数primary ownerを個別に拒否する。 |
| HCV4-AC-005 | Startup | authority root、assignment、HEAD、lease、capabilityの各欠落を個別に拒否する。 |
| HCV4-AC-006 | Worker | wrong branch、expired lease、wrong fence、scope外path、budget超過を個別に拒否する。 |
| HCV4-AC-007 | Review | self-review、wrong HEAD、wrong generation、wrong reviewer sessionを個別に拒否する。 |
| HCV4-AC-008 | Evidence | marker、path存在、digest形式、自己申告coverageだけのclaimを拒否する。 |
| HCV4-AC-009 | Evidence | oracle未実行、counterexample未kill、subject digest不一致を個別に拒否する。 |
| HCV4-AC-010 | State | clean rebuild、event replay、retry後のprojection digestが一致する。 |
| HCV4-AC-011 | State | malformed evidenceを上書きまたは削除すると拒否し、correction generationは履歴を保持する。 |
| HCV4-AC-012 | Release | unqualified／preview／unknown Sliceのstable Bundle混入を拒否する。 |
| HCV4-AC-013 | Lifecycle | Release成功だけでDeployment、Incident、Fixをterminal化しない。 |
| HCV4-AC-014 | Adaptation | UIL／TER／Learning／Audit／Synthesisからcanonical authorityへのdirect writeを拒否する。 |
| HCV4-AC-015 | Re-entry | findingから影響layer、stale target、human gate、再freeze、Forward re-entryを追跡できる。 |
| HCV4-AC-016 | Audit | trigger、risk、budget、cooldownのいずれかが不適合なfull auditを拒否する。 |
| HCV4-AC-017 | Compatibility | legacy greenとcurrent redを同時入力しても全体をgreenにしない。 |
| HCV4-AC-018 | Provider | logical laneとprovider adapterを交換してもauthority／receipt schemaが変わらない。 |
| HCV4-AC-019 | README | human projectionが利用者価値、提供済み範囲、未提供範囲、authority pointerを平易な日本語で示す。 |
| HCV4-AC-020 | Promotion | approval前はv3.1がcurrentのまま、approval後はv4 source、IR、index、README、adapterが同一revisionへ収束する。 |
| HCV4-AC-021 | Consumer | clean Linux consumerとWindows smokeが同一DevOS artifact digestを検証する。 |
| HCV4-AC-022 | Retirement | v3.1降格後も必要なhistorical traceを保持し、current runtimeから旧identityを再出力しない。 |

## 完了条件

Concept文書だけのmergeをv4完成と数えない。L1／L3／L10、Requirement IR、generated projection、runtime、
doctor、CI、DB replay、independent exact-HEAD review、main read-after、consumer smokeの該当scopeが揃うまで
Concept upgradeは非terminalである。
