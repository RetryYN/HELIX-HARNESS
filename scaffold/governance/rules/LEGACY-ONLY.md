---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: LEGACY-ONLY
atoms_primary: 34
---

# LEGACY-ONLY（旧実装に固有とした規則）

要求にはしないが、落とさずここに保持する。各行の除外理由は台帳の`legacy_only_reason`の写しである。

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 除外理由 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RB03-002` | 本inventoryのエントリ数は、設定された最大件数951件を超えてはならない。 | process_gate | config | n/a | maximum_entry_count=951という旧inventory固有の上限値。 | 特定inventoryの件数を旧上限951件と比較するだけで、上限の根拠や一般的な予算管理の義務を定めていない。 | config/plan-legacy-workflow-identity-inventory.json:4-4 | B03／gpt-6-astra |
| `RB06-295` | CODEOWNERS検査はteam数がゼロより多く三未満の場合にerrorとする。 | process_gate | prose | fail_close | 旧CLI teamCount判定 | 所有team数の特定範囲だけを拒否する旧数値条件であり、ownerの単一性や権限の妥当性を検証する意味は示されていない。 | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:116-117 | B06／gpt-6-astra |
| `RC01-073` | right-arm-gate-planningは、改善backlogにIMP-052がない場合、不合格にする。 | process_gate | lint | fail_close | IMP-052の固定ID | 特定の旧改善IDがbacklogに存在することだけを要求し、改善の受付や処分に関する一般条件を示していない。 | src/lint/right-arm-gate-planning.ts:52-65 | C01／gpt-6-astra |
| `RC01-086` | placeholder-depsは、対象文書がdedicated placeholder_deps doctor rule is implemented系の正規表現に一致する場合、不合格にする。実装の正規表現はnotまたは未の有無を問わない。 | evidence_claim | lint | fail_close | is (?:not \|未)?implementedという英文pattern | 旧文書の特定英文patternを肯定・否定の区別なく拒否する検査であり、実装状態の意味を判定していない。 | src/lint/placeholder-deps.ts:102-108 | C01／gpt-6-astra |
| `RC03-058` | historical V-pair移行分類処理は、候補reasonが「PLAN verification binding absent」と完全一致しない場合、admissionを拒否する。 | process_gate | gate | fail_close | 旧reason文字列の完全一致 | 移行候補のreasonを旧固定文字列と完全一致で照合するだけで、受入れに必要な実質的条件を検証していない。 | src/policy/historical-vpair-migration-authority.ts:107-120 | C03／gpt-6-astra |
| `RD00-041` | slot管理は、SubagentStop用の処理でagent_guard由来の実行中かつ未releaseのslotから有効時刻が最古の1件だけをcompletedにする。 | lane_delegation | hook | fail_open | slot_idを持たない旧SubagentStopとの近似対応 | 識別子のない旧停止eventを最古のslotへ近似対応させる救済仕様であり、対象を正確に特定して解放する一般条件は保持していない。 | src/runtime/agent-slots.ts:155-179 | D00／gpt-6-astra |
| `RD00-348` | CLI-R00 supporting context検証は、CLI pathがsrc/cli.tsでない場合、拒否する。 | evidence_claim | gate | fail_close | 旧monolith src/cli.ts固定 | CLIのpathを旧単一fileへ固定するだけで、改名や分割後も残すべき契約を示していない。 | src/runtime/cli-r00-throughput-baseline.ts:758-764 | D00／gpt-6-astra |
| `RD00-356` | CLI-R00 artifact検証は、behavior contract IDがCLI-R00-THROUGHPUT-BASELINE-001でない場合、失敗する。 | process_gate | gate | fail_close | CLI_R00_BEHAVIOR_CONTRACT_ID | behavior contract IDを特定の旧IDと照合するだけで、契約の内容や一般的な束縛条件を検査していない。 | src/runtime/cli-r00-throughput-baseline.ts:872-874 | D00／gpt-6-astra |
| `RD00-357` | CLI-R00 artifact検証は、Issue IDが1687でない場合、失敗する。 | process_gate | gate | fail_close | Issue #1687 | Issue番号1687との一致だけを検査する旧成果物専用条件である。 | src/runtime/cli-r00-throughput-baseline.ts:875-877 | D00／gpt-6-astra |
| `RD00-359` | CLI-R00 artifact検証は、slice IDがCLI-R00でない場合、失敗する。 | process_gate | gate | fail_close | CLI-R00 | slice IDを旧CLI-R00へ固定するだけで、一般的な作業境界の条件を示していない。 | src/runtime/cli-r00-throughput-baseline.ts:881-883 | D00／gpt-6-astra |
| `RD01-181` | 回帰shard生成処理は、bulk shard数が3以外なら失敗する。 | tooling_runtime | gate | fail_close | bulkShardCount=3固定 | 回帰shard数を3に固定するだけで、並列上限の根拠や分割の妥当性を検証していない。 | src/runtime/full-regression-shards.ts:91-94 | D01／gpt-6-astra |
| `RD01-190` | 回帰shard検証は、shard ID集合がbulk-1・bulk-2・bulk-3・statefulと一致しなければ失敗する。 | process_gate | gate | fail_close | 固定4shard | 旧4shardの名前集合との一致だけを検査し、状態隔離や網羅性の条件を示していない。 | src/runtime/full-regression-shards.ts:61-61; src/runtime/full-regression-shards.ts:168-170 | D01／gpt-6-astra |
| `RD06-086` | doc-consistency lintは、L6セットアップ設計でconsumer doctor以降に「11 行」の記載がない場合、不足として返す。 | process_gate | lint | n/a | consumer doctorの固定11行契約 | 旧診断出力の行数を示す固定文言の存在だけを検査し、診断内容や網羅性を確認していない。 | src/lint/doc-consistency.ts:173-177; src/lint/doc-consistency.ts:202-204 | D06／gpt-6-astra |
| `RD06-095` | doc-consistency lintは、setup実装にtargetTag: "v0.1.4"の記載がない場合、不足として返す。 | tooling_runtime | lint | n/a | 固定targetTag v0.1.4 | setup実装に旧targetTagの固定値が書かれていることだけを検査し、現行targetの導出や妥当性を確認していない。 | src/lint/doc-consistency.ts:237-241 | D06／gpt-6-astra |
| `RD07-004` | frontend-design-coverageは、document-system-mapに§1cマーカーがなければ失敗する。 | process_gate | lint | fail_close | SECTION_MARKER=§1c | 旧文書の節markerの存在だけを検査し、画面設計の成果物やcoverageの内容を確認していない。 | src/lint/frontend-design-coverage.ts:147-152 | D07／gpt-6-astra |
| `RD07-059` | 証拠コマンド検査は、evidence_pathが.vitest.logで終わらなければ違反とする。 | evidence_claim | lint | fail_close | .vitest.log receipt | 証拠pathの旧拡張子との一致だけを検査し、証拠の実在・内容・対象との対応を確認していない。 | src/lint/gn-evidence-manifest.ts:161-163 | D07／gpt-6-astra |
| `RD08-089` | semantic consumer lintは、ledgerのissue_idが865でない場合、失敗させる。 | process_gate | lint | fail_close | Issue #865固定 | ledgerのIssue番号を旧865へ固定するだけの検査である。 | src/lint/legacy-orchestration-semantic-consumers.ts:374-374 | D08／gpt-6-astra |
| `RD08-090` | semantic consumer lintは、ledgerのparent_planがPLAN-L7-729-legacy-orchestration-new-use-freezeでない場合、失敗させる。 | process_gate | lint | fail_close | PLAN-L7-729固定 | ledgerの親作業単位を特定の旧PLANへ固定するだけの検査である。 | src/lint/legacy-orchestration-semantic-consumers.ts:375-376 | D08／gpt-6-astra |
| `RD08-114` | semantic consumer revision検査は、issue_idが865でない場合、失敗させる。 | process_gate | lint | fail_close | Issue #865固定 | revision検査でIssue番号を旧865と照合するだけで、対象revisionとの実質的な対応を検査していない。 | src/lint/legacy-orchestration-semantic-consumers.ts:508-508 | D08／gpt-6-astra |
| `RD08-115` | semantic consumer revision検査は、parent_planがPLAN-L7-865-legacy-orchestration-semantic-consumer-ledgerでない場合、失敗させる。 | process_gate | lint | fail_close | PLAN-L7-865固定 | revision検査で親作業単位を特定の旧PLANへ固定するだけの条件である。 | src/lint/legacy-orchestration-semantic-consumers.ts:509-510 | D08／gpt-6-astra |
| `RD08-168` | objective evidence auditは、必須marker groupのいずれかの文字列が監査本文にない場合、失敗させる。 | evidence_claim | lint | fail_close | 2026-07-13、固定HEAD、approval count=343等の旧snapshot marker | 過去の日付・HEAD・承認件数の固定markerを要求する旧snapshot専用検査であり、現在の証拠の正しさを判定しない。 | src/lint/objective-evidence-audit.ts:237-290; src/lint/objective-evidence-audit.ts:422-427 | D08／gpt-6-astra |
| `RD08-193` | objective evidence auditは、外部source ledger各列に固定期待値が含まれない場合、失敗させる。 | evidence_claim | lint | fail_close | 固定HEAD、unpublished、v0.1.0等の過去観測・採否文 | 外部source ledgerに過去の観測値・版・採否文の固定値を要求するだけで、再調査後の判断にも適用できる条件がない。 | src/lint/objective-evidence-audit.ts:303-335; src/lint/objective-evidence-audit.ts:663-668 | D08／gpt-6-astra |
| `RD10-136` | frontier整合lintはL3文書にconfirmed 51件をconfirmed_currentへ写像する固定記述がなければ失敗させる。 | process_gate | lint | fail_close | confirmed 51 件: `classification=confirmed_current` | 過去のconfirmed件数と旧分類名を結ぶ固定記述だけを要求し、現行の分類条件や分母を検証していない。 | src/lint/semantic-frontier-consistency.ts:286-288 | D10／gpt-6-astra |
| `RD11-009` | triage lintは、catalog.doneのID集合が固定された3件と一致しない場合に違反にする。 | process_gate | lint | fail_close | unit-test-design、integration-test-design、acceptance-test-design | 完了済みID集合を旧3件へ固定するだけで、完了条件や新しい成果の検証を定めていない。 | src/lint/triage-decision-integrity.ts:7-11; src/lint/triage-decision-integrity.ts:133-135 | D11／gpt-6-astra |
| `RD11-011` | triage lintは、固定done項目のcatalog statusがdoneでない場合に違反にする。 | process_gate | lint | fail_close | PIN_CATALOG_DONEの3件 | 旧固定3項目の状態をdoneへ固定するだけで、完了を裏付ける条件を確認していない。 | src/lint/triage-decision-integrity.ts:136-140 | D11／gpt-6-astra |
| `RD11-013` | triage lintは、system-test-designのstatusがtodoでない場合に違反にする。 | process_gate | lint | fail_close | PIN_SYSTEM_TODO=system-test-design | 特定の旧設計項目をtodoのままに固定する過去状態の検査であり、状態遷移の条件を定めていない。 | src/lint/triage-decision-integrity.ts:145-147 | D11／gpt-6-astra |
| `RD11-016` | triage lintは、verified_idsが固定14件と重複なく一致しない場合に違反にする。 | process_gate | lint | fail_close | PIN_BACKLOG_VERIFIEDのIMP-004〜IMP-088内の固定14件 | 検証済みID集合を過去の14件へ固定する検査であり、重複検査もその固定snapshotの一致確認に閉じている。 | src/lint/triage-decision-integrity.ts:14-29; src/lint/triage-decision-integrity.ts:101-103; src/lint/triage-decision-integrity.ts:153-155 | D11／gpt-6-astra |
| `RD11-017` | triage lintは、固定verified集合の各backlog statusがverifiedでない場合に違反にする。 | process_gate | lint | fail_close | PIN_BACKLOG_VERIFIED | 旧固定集合の状態をverifiedへ固定するだけで、検証済みと判断する証拠条件がない。 | src/lint/triage-decision-integrity.ts:156-158 | D11／gpt-6-astra |
| `RD11-019` | triage lintは、IMP-118のbacklog statusがtriagedでない場合に違反にする。 | process_gate | lint | fail_close | PIN_RETAINED.id=IMP-118 | 特定の旧改善IDの状態をtriagedへ固定するだけで、分類・確認・解決の一般条件を示していない。 | src/lint/triage-decision-integrity.ts:162-163 | D11／gpt-6-astra |
| `RD11-029` | triage lintは、固定列挙10件の各backlog statusがimplementedでない場合に違反にする。 | process_gate | lint | fail_close | PIN_ENUMERATED_IDS | 過去に列挙した固定10項目の状態をimplementedへ固定するだけで、実装を確認する条件がない。 | src/lint/triage-decision-integrity.ts:204-206 | D11／gpt-6-astra |
| `RD11-083` | version-up lintは、discovery PLANにactivation note (2026-06-30)がない場合に違反にする。 | process_gate | lint | fail_close | PLAN-DISCOVERY-09の固定日付marker | 特定の旧探索PLANに過去日付付きmarkerを要求するだけで、有効化の判断内容や承認条件を確認していない。 | src/lint/version-up-readiness.ts:1070-1075 | D11／gpt-6-astra |
| `RD11-199` | terminal fullback監査は、証拠のissueNumberが694でない場合に失敗させる。 | process_gate | lint | fail_close | Issue #694専用 | 証拠のIssue番号を旧694へ固定するだけの専用検査であり、一般的な証拠の対象束縛条件を示していない。 | src/lint/workflow-classification-terminal-fullback.ts:467-477 | D11／gpt-6-astra |
| `RG10-016` | Issue #592の文書化PR担当者は、変更対象をdocs/governance/github-operation-rules.mdとCLAUDE.mdだけに限定する。 | review_merge | prose | n/a | Issue #592の文書化PRに限定された2ファイルのscope | 旧Issue #592の文書化PRに限った変更対象の限定。一般化すると「PRの変更範囲を限定する」だが、それはRUL-DEV-01（無関係な整理を混ぜない）で既に被覆され、この行自体は旧Issue固有の指定だけである | docs/governance/github-operation-rules.md:58-58 | G10／claude_review |
| `RG13-005` | 完全性チェックはKimiのPreToolUse hook登録を再追記する場合、timeoutを10に設定する。 | tooling_runtime | config | n/a | ~/.kimi-code/config.tomlの[[hooks]]とtimeout=10 | 旧Kimi拡張のhook登録に固有のtimeout値（10）の指定。一般化しても特定値の再追記手順だけで、要求の意味に寄与しない | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:173-183 | G13／claude_review |
