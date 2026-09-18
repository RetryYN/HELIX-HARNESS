---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-RSH-01
group: 部品：リサーチ
product: HARNESS
atoms_primary: 133
atoms_secondary: 41
issue_projection: none
---

# RUL-RSH-01（部品：リサーチ／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

外部の技術・OSS・SaaS・事例を調べて採否する手順を定める。成熟度、依存risk、代替案、反対意見を示し、そのまま導入せずHELIXの境界へ変換する。

## 主として対応づいた規則（133件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-117` | tech-docsは詳細精読が必要ならtech-forkへescalateし、代替比較が揃うまで断定的な技術選定を保留する。 | escalation_authority | prose | .claude/agents/pmo-tech-docs.md:83-87 |
| `RA-250` | 外部調査者は一次source・確認日・採否・workflow影響を記録し、日付だけの更新を証拠にしない。 | evidence_claim | prose | AGENTS.md:273-273 |
| `RA-262` | tech-docs・tech-newsは検索前に現在日付を確認し、新しい公式一次情報を優先して古い情報を無検証で使わない。 | evidence_claim | prose | .claude/agents/pmo-tech-docs.md:16-16; .claude/agents/pmo-tech-news.md:16-16; .claude/agents/pmo-tech-news.md:56-56 |
| `RA-263` | tech-docsは外部知見のHELIX適合を確認してから採用案にし、source URLを付ける。 | evidence_claim | prose | .claude/agents/pmo-tech-docs.md:17-17; .claude/agents/pmo-tech-docs.md:81-81 |
| `RA-264` | tech-docsは引用URL・公開日・版番号を記録し、推奨を採用・比較候補・保留に分け、不確実情報を要追加調査へ分離する。 | evidence_claim | prose | .claude/agents/pmo-tech-docs.md:95-99 |
| `RA-265` | tech-forkは自前実装・別OSS・見送り等の対案とtradeoffを付け、license・依存riskをリンクと数値で裏付ける。 | evidence_claim | prose | .claude/agents/pmo-tech-fork.md:16-17 |
| `RA-266` | tech-forkは公式情報を一次sourceにし、各評価軸に1行以上の根拠、結論に最終更新日・評価日を付け、推定を結論にしない。 | evidence_claim | prose | .claude/agents/pmo-tech-fork.md:92-97 |
| `RA-268` | PDM技術scoutは各optionに対案・rollback条件・検証burdenを付ける。 | evidence_claim | prose | .claude/agents/pdm-tech-innovation.md:16-16; .claude/agents/pdm-tech-innovation.md:23-24 |
| `RA-278` | tech-docsは概念summary・適用先と成功条件・反対意見・代替案・既存規則との衝突・参照リンクを返す。 | evidence_claim | prose | .claude/agents/pmo-tech-docs.md:58-81 |
| `RA-279` | tech-forkは上位3〜5候補のrepository・license・stars・issue・保守signal、比較表、採用・PoC・見送り判定を返す。 | evidence_claim | prose | .claude/agents/pmo-tech-fork.md:57-79 |
| `RA-280` | tech-newsはcategoryごとに変更・影響・反映案・URL・次actionを3〜5行で返し、重要度、即調査項目1件以上、日付付き公式リンク、不明情報の別欄を含める。 | evidence_claim | prose | .claude/agents/pmo-tech-news.md:33-41; .claude/agents/pmo-tech-news.md:68-73 |
| `RA-305` | tech-docsは公式doc・技術blog・conference資料・書籍要約の順を優先し、知見を採用条件・反例・実装難易度・適用範囲・tradeoffへ再構成する。 | behavior_discipline | prose | .claude/agents/pmo-tech-docs.md:19-50 |
| `RA-306` | tech-docsは要点5〜8観点の網羅、HELIX向け再構成、反対意見と採用条件を添えた最終報告の3passで進める。 | behavior_discipline | prose | .claude/agents/pmo-tech-docs.md:101-105 |
| `RA-307` | tech-forkは候補抽出、成熟度・保守履歴確認、依存risk評価、採用・PoC・見送り判断の順で調べる。 | behavior_discipline | prose | .claude/agents/pmo-tech-fork.md:25-30; .claude/agents/pmo-tech-fork.md:99-103 |
| `RA-308` | tech-forkは商用移植性・再配布条件を最優先で示し、stars・最終commit・issue対応・PR・maintainer・依存を評価する。 | behavior_discipline | prose | .claude/agents/pmo-tech-fork.md:32-42 |
| `RA-309` | tech-newsは毎週1回、直近1〜2週間の動向をreviewし、重要themeを48時間以内に再調査する。 | behavior_discipline | prose | .claude/agents/pmo-tech-news.md:52-55 |
| `RA-310` | PDM技術scoutはoptionを3±1に絞り、local制約を確認せず公開exampleを直接再利用可能と扱わない。 | behavior_discipline | prose | .claude/agents/pdm-tech-innovation.md:15-15; .claude/agents/pdm-tech-innovation.md:30-30 |
| `RB0-007` | 実装者はtransactional control planeをTypeScript/Nodeで再構築し、semantic coreをPythonに置き、旧コードを一括移植しない。 | tooling_runtime | prose | docs/governance/README.md:34-38 |
| `RB04-261` | tool選定者は立上げの最小setを約10種類に抑え、一category一toolを原則とし、AI実装だけ二tool併用を例外とする。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:326-328; docs/governance/ai-dev-team-concept_v1.1.md:401-401 |
| `RB04-262` | tool選定者は拡張toolを最初から導入せず、必要が見えてから追加し、既存toolで代替できないか必ず確認する。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:328-328; docs/governance/ai-dev-team-concept_v1.1.md:351-353; docs/governance/ai-dev-team-concept_v1.1.md:405-405 |
| `RB04-264` | 顧客向けtoolの追加は課金開始・問合せ増加・通知必要・lead管理限界をそれぞれ決済・support・mail・CRM導入の判断時点とする。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:355-362 |
| `RB04-267` | 拡張担当者は定型自律化需要・infra複雑化・PR負荷増・Projects不足に応じ、自律実行・IaC・review補助・task管理toolを追加する。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:380-387 |
| `RB04-268` | tool選定者は国内保管・業界・商習慣・日本語supportの要件と、global展開・最新機能等の条件を比較して国産/海外を選ぶ。 | tooling_runtime | prose | docs/governance/ai-dev-team-concept_v1.1.md:407-415 |
| `RB05-325` | 外部source採用者はOSS/SaaSをそのまま導入せず、HELIXのVモデル・gate・state DB・adapter・security境界に従う仕組みへ変換する。 | behavior_discipline | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:3-5 |
| `RB05-326` | 外部source監査はclone・refs列挙・blob hashのread-only取得に限定し、外部code実行・依存install・credential使用・secret/PII保存・外部API writeを行わない。 | safety_security | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:6-7 |
| `RB05-329` | keyword classifierは漏れ検知の補助に留め、採用判断はHELIX family写像とPLAN起票に従う。 | evidence_claim | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:92-97 |
| `RB05-330` | OpenSpec由来のpatternはbulk importせず、HELIXのVモデル層・PLAN・additive change・trace freeze・archive契約へ変換する。 | tooling_runtime | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:223-226 |
| `RB05-331` | StatewrightはRust engineやFSL gatewayを取り込まず、workflow state policyとadapter enforcementのpattern参照に限定する。 | safety_security | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:228-230; docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:292-293 |
| `RB05-332` | 旧監査方針ではSpec Kit/OpenSpecのPython・shell runtimeや.specifyを取り込まず、HELIX L0–L14とTypeScript/Bunへ再実装する。 | tooling_runtime | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:232-235; docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:291-291 |
| `RB05-333` | AgentWrapper由来の機能はElectron UIやGo backendを取り込まず、state DB read model・review feedback intake・session supervisor契約へ変換する。 | tooling_runtime | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:237-240 |
| `RB05-334` | oh-my-agentの.agentsを正本にせずHELIX adapter templateとskill registryへ変換し、oh-my-openagentの外部package publishing flowは採らず評価fixtureへ変換する。 | tooling_runtime | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:242-248 |
| `RB05-335` | 外部catalog itemとrefsは少なくとも一つのcapability familyへ対応させ、既存実装がある能力はgapではなくhardeningまたはwatch対象にする。 | process_gate | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:256-257 |
| `RB05-336` | 個別CLI agent本体をproduct runtimeへbulk importせず、必要ならadapter capabilityとして扱い、closed-source/SaaS-only製品からはpatternだけを採る。 | tooling_runtime | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:287-289 |
| `RB05-337` | leak由来rewriteやguardrail strippingを売りにするrepositoryをsourceとして採用しない。 | safety_security | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:290-290 |
| `RB05-339` | 外部sourceの採用根拠にstar数や人気を使わず、HELIXの不足を埋めるcapabilityと検証可能性で判断する。 | behavior_discipline | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:250-252; docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:295-295 |
| `RB05-362` | Researchは問い・source・比較・判断・routingの順に進め、currentな判断証拠とADRまたはroute記録を終了条件とする。 | process_gate | config | config/drive-route-catalog.json:195-207 |
| `RB06-136` | docgen ingestionはmetadata・trace・impact・assignment・scheduleをprovenance付きHELIX契約へ変換する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:83-83 |
| `RB06-137` | asset inventoryはreceipt由来の全atomic capabilityに一件の採否と根拠を付け、pendingをゼロにする。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:84-84 |
| `RB06-219` | 採用担当者は外部repoをruntime正本としてbulk importせず、hollow coverage、projection-only telemetry、blanket governance allow、未検証matcher claimを拒否する。 | process_gate | prose／lint | docs/governance/helix-objective-evidence-audit.md:45-45 |
| `RB06-232` | 外部source採取者はread-only clone・refs列挙・hash確認に限定し、外部code実行、dependency install、credential使用、secret・PII保存、外部writeを行わない。 | safety_security | prose | docs/governance/helix-objective-evidence-audit.md:158-159 |
| `RB06-285` | tool導入者は既存tool代替、package.json同居、単独configの順に検討し、license・SBOM未分類なら導入しない。 | safety_security | prose | docs/governance/repository-structure.md:165-173 |
| `RB06-289` | 上流採用者は既存在庫を先に確認してcapability単位で検証し、無検証採用とbulk importを行わない。 | behavior_discipline | prose | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:3-8 |
| `RB06-292` | 暫定採用候補はLOCAL等価物の検索や直接diffでrefactor・gapを確認してから採用する。 | behavior_discipline | prose | docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:72-73; docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md:144-150 |
| `RB07-057` | 旧監査方針では採取した上流機能をTypeScript/Bunで再実装し、Pythonと旧runtimeを持ち込まない。 | tooling_runtime | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:74-75; docs/governance/handover-retirement-memory-audit-2026-07-11.md:137-137 |
| `RB07-063` | 担当者は上流機能をVモデル工程・gate・state DBの仕組みに従属させる。 | process_gate | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:136-136 |
| `RB07-200` | 実装者は既存module・framework・標準libraryを調査し、3つ目の類似実装前に共通化を検討し、OSSと比較して自作するならADRへ理由を残す。 | behavior_discipline | prose | docs/skills/code-minimalism.md:45-55 |
| `RB07-204` | 担当者は標準libraryと数十行で済む処理へ依存を追加せず、採用時は更新時期・複数maintainer・読解可能性・撤退経路を答えてADRへ残す。 | behavior_discipline | prose | docs/skills/code-minimalism.md:78-81 |
| `RB07-205` | 担当者は依存の試用をbranch内で完結させ、本流へ入れる時点でADRを書く。 | process_gate | prose | docs/skills/code-minimalism.md:82-82 |
| `RB07-324` | 採用担当者は方法論候補をL7へ一括起票せず、設計層でPO・設計判断を経て適合分だけFR・PLAN化する。 | process_gate | prose | docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md:35-47 |
| `RB08-057` | 調査担当者は一次source URLなしに主張せず、引用URLは本文を取得して日付・version・主張・互換性上の注意を確認する。 | evidence_claim | prose | docs/skills/research.md:28-29; docs/skills/research.md:40-47; docs/skills/research.md:89-90 |
| `RB08-058` | 調査担当者は判断根拠をprimary sourceに限定し、first-handは補助、secondaryは背景用途に留める。 | evidence_claim | prose | docs/skills/research.md:49-58; docs/skills/research.md:91-91 |
| `RB08-059` | 調査担当者は調査結果に取得日を記録する。 | evidence_claim | prose | docs/skills/research.md:60-69; docs/skills/research.md:92-92 |
| `RB08-060` | S1担当者はlint前に調査結果をPLAN evidenceへ反映し、S2で選ぶ技術には一次sourceを最低1件引用する。 | evidence_claim | prose | docs/skills/research.md:73-74 |
| `RB08-061` | S3担当者は先行調査と矛盾するPoC結果をS4判断前に監査証跡へ記録する。 | evidence_claim | prose | docs/skills/research.md:75-76 |
| `RB08-063` | 調査委譲者は返却sourceの少なくとも1件を自分で検証するまで、委譲結果をauthoritative evidenceとして記録しない。 | evidence_claim | prose | docs/skills/research.md:83-85 |
| `RB08-093` | 技術選定担当者はresearch-memoとADRの2成果物を作り、両方をPLAN generatesへ登録する。欠落時はlintを失敗させる。 | process_gate | prose／lint | docs/skills/tech-selection.md:30-46 |
| `RB08-094` | 技術選定担当者は候補を2〜5件に絞り、反証可能な評価基準・各比較cellの証拠・棄却理由・上位基準に結び付く推薦理由をmemoへ記す。 | evidence_claim | prose | docs/skills/tech-selection.md:34-41 |
| `RB08-095` | 技術選定担当者は各基準を要求またはproject方針へ結び付け、人気を単独基準にせず、少なくとも1つの運用制約を含める。 | behavior_discipline | prose | docs/skills/tech-selection.md:48-55 |
| `RB08-096` | 技術選定PLANはPO確認をreview_evidenceへ記録してADRをAcceptedにするまでpair-freezeしない。 | escalation_authority | prose／gate | docs/skills/tech-selection.md:59-67; docs/skills/tech-selection.md:77-86 |
| `RB08-097` | 技術調査担当者はS1で既存ADRとの重複を確認し、S2で候補別証拠を集め、S3で推薦と要求・運用制約の対応を確認する。 | process_gate | prose | docs/skills/tech-selection.md:69-76 |
| `RB08-266` | 旧資産移管担当者はruntime判定をTS/Bunで再実装し、prompt・skill・templateは文書として整備し、registry等の挙動はTSへ実装する。 | tooling_runtime | prose | docs/governance/runtime-parity-l0-l3-design-audit-2026-06-02.md:44-50 |
| `RB08-306` | 当時のv0.5.0取込担当者はADR-010由来部分を自動採用せずRedesignまで延期し、ADR-009と両立する差分だけを採用する。 | process_gate | prose | docs/governance/hybrid-rebaseline-v0.5.0-intake-audit-2026-07-18.md:38-44 |
| `RB08-332` | 外部運用資産の参照者はUTを要求定義の参考に限定し、実行authorityやdomain SSoTへ採用しない。 | tooling_runtime | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:3-5; docs/governance/github-operations-reference-audit-2026-07-18.md:43-43 |
| `RB08-341` | 外部運用移管者はsolo direct-main・Bun固有command・手動prose handover・固定200〜400行上限を採用しない。 | tooling_runtime | prose | docs/governance/github-operations-reference-audit-2026-07-18.md:43-43 |
| `RB09-053` | AWS referenceの設計者は、ECS blue／greenをreference fixtureとして扱い、ECS固有語を正本schemaへ入れてはならない。 | escalation_authority | prose | docs/governance/devops-external-source-research-2026-07-23.md:25-25 |
| `RC00-034` | taxonomy審査は、source_verifiedがtrueでなければ不合格とする。 | evidence_claim | gate | src/runtime/harness-taxonomy-curation-policy.ts:63-69 |
| `RC00-036` | taxonomy審査は、sourceの活動経過日数が指定され180日を超える場合に警告する。 | process_gate | gate | src/runtime/harness-taxonomy-curation-policy.ts:77-83 |
| `RC00-037` | taxonomy審査は、scope_fitがout_of_scopeなら警告する。 | process_gate | gate | src/runtime/harness-taxonomy-curation-policy.ts:84-89 |
| `RC00-254` | agent catalog分類器は、名称またはsourceがclosed-source・SaaS-onlyを示す正規表現に一致した場合にsourceを拒否分類する。 | process_gate | gate | src/runtime/agent-catalog-watch.ts:56-75 |
| `RC00-258` | agent catalog分類器は、familyに分類できずGitHub URLでもないHTTP(S) sourceを拒否分類する。 | process_gate | gate | src/runtime/agent-catalog-watch.ts:78-95 |
| `RC02-085` | doctorのzip-adoption-binding checkは、採用5件・補完3件・不採用3件の宣言、matrix本文・章・inventory情報・必須source、実装受け皿、DB decision行、resolved参照が契約を満たさない、または投影不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:3976-4197 |
| `RC02-086` | doctorのzip-source-binding checkは、binding定義違反、必須binding・証拠表不足、missing状態、source_presentなのにactual_path欠落、空のHELIX surface・証拠表、または投影不能で失敗する。advisory件数だけでは失敗させない。 | process_gate | doctor | src/doctor/index.ts:4199-4270 |
| `RC02-087` | doctorのzip-reference-runtime-boundary checkは、許可4ファイル以外の走査対象で、指定Python tool名または.xlsxと外部実行patternが同じファイルに現れる場合に失敗する。走査不能も失敗とする。 | safety_security | doctor | src/doctor/index.ts:4272-4361 |
| `RC04-177` | Research判断検証器は、memoが空、またはsourcesが0件ならdecision_readyを拒否する。 | evidence_claim | gate | src/workflow/contracts.ts:766-780 |
| `RC04-178` | Research判断検証器は、ADR候補が無ければ警告する。 | evidence_claim | gate | src/workflow/contracts.ts:776-779 |
| `RD04-046` | benchmark評価器は、評価対象が2件未満の場合に拒否する。 | process_gate | gate | src/runtime/worker-blind-benchmark.ts:327-333 |
| `RD04-049` | benchmark評価器は、descriptor digest・effort・identity・model・providerで定まる候補出所が重複した場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:317-324; src/runtime/worker-blind-benchmark.ts:346-348 |
| `RD05-153` | cutover-readinessは、Cutover source ledgerに所定の必須source行が欠ける場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:205-208; src/lint/cutover-readiness.ts:275-280; src/lint/cutover-source-ledger.ts:1-13 |
| `RD05-154` | cutover-readinessは、Cutover source ledgerの確認日検査が違反を返した場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:209-221 |
| `RD05-155` | cutover-readinessは、source ledgerにsource・公式URL・採用version/date・最新公式status・採用判断・cutover用途・必須fieldへの影響の列が欠ける場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:111-131; src/lint/cutover-readiness.ts:222-227 |
| `RD05-156` | cutover-readinessは、source ledgerの必須列の値が空またはTBD・TODO・「-」の場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:228-241 |
| `RD05-157` | cutover-readinessは、source ledgerの公式URL値にhttps://が含まれない場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:242-251 |
| `RD05-158` | cutover-readinessは、必須source行の公式URL欄にsource別の期待URLが欠ける場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:252-264; src/lint/cutover-source-ledger.ts:17-102 |
| `RD05-159` | cutover-readinessは、必須source行のrequired field impact欄にsource別の期待影響fieldが欠ける場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:265-272; src/lint/cutover-source-ledger.ts:17-102 |
| `RD05-163` | cutover-readinessは、cutover記録のsource ledger意味review field検査が違反を返した場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:322-324 |
| `RD07-172` | identifier-renameのsource ledger検査は、必須出典行のofficial URL欄に期待するURLが含まれなければ違反とし、切替資料を準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2781-2792; src/lint/identifier-rename.ts:2422-2426 |
| `RD07-173` | identifier-renameのsource ledger検査は、必須出典行のrequired field impact欄に期待する項目が含まれなければ違反とし、切替資料を準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2793-2798; src/lint/identifier-rename.ts:2422-2426 |
| `RD08-188` | objective evidence auditは、外部source ledgerのchecked日付検査が違反を返した場合、G-01違反として失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:629-636 |
| `RD08-192` | objective evidence auditは、期待source行の必須8列のいずれかが空の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:292-302; src/lint/objective-evidence-audit.ts:658-662 |
| `RD10-043` | lintはVerification source ledgerに認識可能なchecked日付付き見出しがなければ失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:268-270 |
| `RD10-045` | lintはVerification source ledgerに規定の10公式sourceの行が欠ける場合に失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:168-179; src/lint/right-arm-verification-strategy.ts:274-277 |
| `RD10-046` | lintはVerification source ledgerの確認日が不正・未来・期限超過と判定された場合に失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:278-285 |
| `RD10-047` | lintはVerification source ledgerにsource、official URL、adopted version/date、latest official status、adoption decision、verification use、gate impactの必須列が欠ける場合に失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:128-136; src/lint/right-arm-verification-strategy.ts:288-290 |
| `RD10-048` | lintはVerification source ledgerの必須セルが空白、TBD、TODOまたは「-」の場合に失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:291-308 |
| `RD10-050` | lintはVerification source ledgerのgate impactから許可されたtokenを一つも抽出できないか、抽出tokenに許可外gateがある場合に失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:120-126; src/lint/right-arm-verification-strategy.ts:310-317; src/lint/right-arm-verification-strategy.ts:419-424 |
| `RD10-051` | lintは各必須sourceのofficial URLセルに、そのsourceへ固定登録された期待URLが欠ける場合に失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:181-234; src/lint/right-arm-verification-strategy.ts:318-329 |
| `RD10-052` | lintは各必須sourceのgate impactに、そのsourceへ登録された期待gateが欠ける場合に失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:181-234; src/lint/right-arm-verification-strategy.ts:323-332 |
| `RD10-053` | lintはVerification source ledger全体のgate impactがG8〜G12のいずれかを被覆していなければ失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:336-354 |
| `RD10-054` | lintは台帳のchecked日付がある場合、source_ledger_freshness、source_status_delta、adoption_decision_delta、workflow_route_impactの各記述行に同じ日付がなければ失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:150-155; src/lint/right-arm-verification-strategy.ts:370-378 |
| `RD10-055` | lintはSource ledger意味レビュー証跡の節が空または欠落する場合に失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:381-385; src/lint/right-arm-verification-strategy.ts:407-416 |
| `RD10-056` | lintはSource ledger意味レビュー節に必須10 sourceのいずれかの名前がなければ失敗させる。 | evidence_claim | lint | src/lint/right-arm-verification-strategy.ts:386-390 |
| `RD10-057` | lintは意味レビュー節にバッククォート付きworkflow_route_impactの行がなければ失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:393-399 |
| `RD10-058` | lintはworkflow_route_impact行にG8-G12、S4、version-up、action-binding、cutover、completionの各scopeがなければ失敗させる。 | process_gate | lint | src/lint/right-arm-verification-strategy.ts:157-164; src/lint/right-arm-verification-strategy.ts:400-404 |
| `RD10-075` | S4 lintはdecision recordのsource ledger意味レビュー項目にhelperが返す違反がある場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:294-296 |
| `RD10-076` | S4 lintは記録されたsource_ledger_freshnessに現在のS4 source ledgerの各checked日付が含まれない場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:297-305 |
| `RD10-101` | S4 lintはDiscovery／Scrum文書のS4 source ledgerにchecked日付がなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:788-793 |
| `RD10-102` | S4 lintはsource ledgerにScrum Guide 2020、ISO/IEC/IEEE 29148、ISTQB Glossary、NIST SSDF SP 800-218の行が欠ける場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:205-210; src/lint/s4-decision-readiness.ts:795-803 |
| `RD10-111` | S4 command検証は各検証行のsource metadataに鮮度・必須値・URLの違反があれば違反として返す。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:1224-1230 |
| `RD10-112` | S4 lintはsource ledgerのchecked日付が不正・未来・期限超過と判定された場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:1257-1267 |
| `RD10-113` | S4 lintはsource ledgerにsource、official URL、adopted version/date、latest official status、adoption decision、S4 decision use、required field impactの必須列が欠ける場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:195-203; src/lint/s4-decision-readiness.ts:1268-1273 |
| `RD10-187` | source ledger検証はchecked日付から比較基準日まで90日を超える場合にstale違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:3-3; src/lint/source-ledger-freshness.ts:63-66 |
| `RD10-190` | verification source metadata検証はsourceCheckedAtから90日を超えている場合にstale違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:88-95 |
| `RD10-191` | verification source metadata検証はsourceUrl、latestOfficialStatus、sourceStatusDelta、adoptionDecision、adoptionDecisionDelta、workflowRouteImpactの各値が欠落またはplaceholderなら違反を返す。 | evidence_claim | lint | src/lint/source-ledger-freshness.ts:98-112; src/lint/source-ledger-freshness.ts:150-155 |
| `RD11-062` | profile lintは、recommendedGatesを持つprofileにsource ledger bindingがない場合に違反にする。 | evidence_claim | lint | src/lint/verification-profile.ts:453-468 |
| `RD11-075` | version-up lintは、Version-up source ledgerの確認日に関する検査が違反を返した場合に失敗させ、activationのblock理由にもする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:985-992; src/lint/version-up-readiness.ts:2692-2696 |
| `RD11-076` | version-up lintは、source ledgerにsource・official URL・adopted version/date・latest official status・adoption decision・version-up use・required field impactの列が欠ける場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:548-568; src/lint/version-up-readiness.ts:993-998 |
| `RD11-079` | version-up lintは、必須sourceのofficial URL欄に、そのsourceに固定された期待URLが含まれない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:594-711; src/lint/version-up-readiness.ts:1033-1045 |
| `RD11-080` | version-up lintは、必須sourceのrequired field impact欄に期待された各影響fieldが含まれない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:594-711; src/lint/version-up-readiness.ts:1046-1051 |
| `RD11-081` | version-up lintは、source ledgerに固定された必須21sourceのいずれかの行がない場合に違反にし、activationもblockする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:570-592; src/lint/version-up-readiness.ts:1056-1062; src/lint/version-up-readiness.ts:2697-2699 |
| `RD11-090` | version-up lintは、activation_decision_recordのsource ledger意味review field検査が返す違反を失敗に反映する。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1144-1149 |
| `RD11-091` | version-up lintは、現在のledger確認日が得られるのにsource_ledger_freshnessにchecked日付が記録されていない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1150-1167 |
| `RD11-108` | activation command検査は、externalRehearsalPlanの各行のsource metadata違反を報告する。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1839-1845 |
| `RD11-109` | activation command検査は、costGuardrailsの各行のsource metadata違反を報告する。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1846-1852 |
| `RD11-111` | activation command検査は、command matrixの各行のsource metadata違反を報告する。 | evidence_claim | lint | src/lint/version-up-readiness.ts:1860-1869; src/lint/version-up-readiness.ts:1882-1889 |
| `RD11-137` | activation readiness検査は、外部境界がある場合、official_source_basisが未完了表現または具体的locatorのない値ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:534-536; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2470 |
| `RD11-144` | activation readiness検査は、外部境界がある場合、provenanceのsource_ledgerの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:542-542; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RE01-241` | 外部実装の採用者はbehavior atomを抽出して採否を判断し、Grok等の実装を直接importしない。provider比較は共通契約・固定rubric・blind benchmarkで行い、重大な失敗を平均値で相殺しない。 | evidence_claim | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:434-439 |
| `RG18-021` | 調査担当者は検索queryに調査対象、version等の制約、公式domainの識別子、年の限定を含める。 | behavior_discipline | prose | docs/skills/research.md:40-42 |
| `RG18-022` | 調査担当者は404またはredirectするURLを再取得せずに引用してはならない。 | evidence_claim | prose | docs/skills/research.md:89-90 |
| `RG19-007` | 技術選定担当者はresearch-memoのproblem statementに、何をいつまでに決める必要があるかを記載する。 | behavior_discipline | prose | docs/skills/tech-selection.md:34-36 |
| `RG19-008` | 技術選定担当者はADRからresearch-memoをpathで参照する。 | evidence_claim | prose | docs/skills/tech-selection.md:43-44 |
| `RG19-009` | 技術調査担当者はDiscoveryのS1でPLAN文書内にresearch-memoの骨組みを起草し、候補と評価基準を列挙する。 | process_gate | prose | docs/skills/tech-selection.md:69-72 |
| `RG19-010` | 技術調査担当者はS2でweb researchが必要な場合、外部文書取得用に `helix claude --role pmo-tech-docs --dry-run` を使う。 | tooling_runtime | prose | docs/skills/tech-selection.md:73-74 |

## 副として対応づいた規則（41件）

`RA-118`、`RA-119`、`RA-120`、`RB05-323`、`RB05-340`、`RB05-341`、`RB06-042`、`RB06-291`、`RB06-299`、`RB07-056`、`RB08-056`、`RB08-062`、`RC00-029`、`RC00-033`、`RC00-035`、`RC00-255`、`RC00-260`、`RD05-164`、`RD07-170`、`RD07-171`、`RD08-189`、`RD10-049`、`RD10-079`、`RD10-114`、`RD10-115`、`RD10-185`、`RD10-186`、`RD10-188`、`RD10-189`、`RD10-192`、`RD11-036`、`RD11-063`、`RD11-064`、`RD11-065`、`RD11-077`、`RD11-078`、`RD11-092`、`RD11-103`、`RG05-010`、`RG10-018`、`RG16-004`
