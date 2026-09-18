---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-04
group: 枠
product: HARNESS
atoms_primary: 587
atoms_secondary: 547
issue_projection: #1858
---

# RUL-FRM-04（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

完了・進捗・安全の主張は、固定した分母と、裏付けるtest・command・証拠の参照で示す。検査のgreenや文書の存在を内容の正しさの代わりにしない。

## 主として対応づいた規則（587件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-079` | hosted tool環境のCodexはrepo hookをnon-enforcingとして扱い、編集前にgit/status preflightを行い、機械的hook coverageを主張しない。 | tooling_runtime | prose | AGENTS.md:267-270 |
| `RA-213` | PLANのACはFRまたはlayer gateに接続し、反証可能なcheckと検証commandを明記する。 | process_gate | prose | .claude/commands/sdd-plan.md:22-23 |
| `RA-227` | refactor実行者は動作不変をjudgementではなくregressionで検証する。 | process_gate | prose | .claude/commands/code-simplify.md:12-13 |
| `RA-234` | Bash変更者は変更scriptをbash -nで検証する。 | process_gate | prose | AGENTS.md:341-341 |
| `RA-235` | PowerShell変更者はNoProfile・ExecutionPolicy Bypass付きで変更scriptを実行検証する。 | process_gate | prose | AGENTS.md:342-342 |
| `RA-236` | TypeScript core変更者はtsc --noEmitとtargeted Vitestを実行する。 | process_gate | prose | AGENTS.md:343-343 |
| `RA-246` | エージェントはtestまたは明示的検証なしに完了を宣言せず、成功commandのexit codeとoutput digestを残してclaimの根拠を引用する。 | evidence_claim | prose | AGENTS.md:218-220; CLAUDE.md:109-109; CLAUDE.md:174-174; .claude/agents/be-api.md:16-16; .claude/agents/be-logic.md:16-16; .claude/agents/fe-ui.md:24-24; .claude/agents/fe-ui.md:30-30; .claude/agents/fe-lead.md:31-31 |
| `RA-247` | PLANの安全性・完全性に関する反証可能claimは文章の断言で済ませず、裏付けtest・command・実repository gate実行を引用する。 | evidence_claim | prose | .claude/CLAUDE.md:64-70 |
| `RA-254` | advisor呼出し側は相談の結論・観点・推奨・残riskをreview_evidenceまたはIMPへ記録する。 | evidence_claim | prose | .claude/CLAUDE.md:197-197; .claude/agents/advisor-fable.md:57-57; .claude/agents/fe-lead.md:37-37 |
| `RA-271` | Codexは変更規模に応じて最終報告にgate outcomeを明示する。 | evidence_claim | prose | AGENTS.md:150-150 |
| `RB0-014` | 判定者は受入・freeze・証跡・完了を対応する正本と検証ログで判断し、README単体をgate根拠にしない。 | evidence_claim | prose | docs/governance/README.md:65-67 |
| `RB0-081` | 報告者はmerge queueへ入った事実だけを完了証拠にせず、CI・独立review・receipt・closureのcurrent-head一致を確認する。 | evidence_claim | prose | docs/governance/github-operation-rules.md:76-76 |
| `RB0-097` | 完了判定者はGitHub側の親子表示だけを完了証拠として使ってはならない。 | evidence_claim | prose | docs/governance/github-issue-hierarchy-rules.md:51-52 |
| `RB0-126` | agentはdoctor exit 0・blocking review所見なし・tests greenを確認してから完了を宣言する。 | evidence_claim | prose | docs/skills/SKILL_MAP.md:82-83; docs/skills/judgment-core.md:83-84 |
| `RB0-129` | agentは判断と反証可能な完了主張を、実測・正本引用・file:line・green commandとdigestで裏付ける。 | evidence_claim | prose | docs/skills/judgment-core.md:48-50; docs/skills/judgment-core.md:83-84; docs/skills/acceptance-criteria-thinking.md:56-58; docs/skills/acceptance-criteria-thinking.md:72-73 |
| `RB0-139` | 検証者は検証を打ち切る際、未検証範囲と壊れた場合の影響を残余リスクとして言語化する。 | evidence_claim | prose | docs/skills/judgment-core.md:85-87 |
| `RB0-142` | 判定者は基準ごとに証拠を引用してから判定し、根拠不足を推測でPASSにせずUNCERTAINと明記する。 | evidence_claim | prose | docs/skills/judgment-core.md:116-119; docs/skills/adversarial-review.md:138-140; docs/skills/acceptance-criteria-thinking.md:75-76; docs/skills/acceptance-criteria-thinking.md:99-100 |
| `RB0-151` | 判定者は全攻撃が反駁された場合にPASSとし、その意味を当該攻撃者の攻撃に耐えた範囲を超えて拡張しない。 | review_merge | prose | docs/skills/adversarial-review.md:67-67 |
| `RB0-157` | reviewerはreview_evidenceの各FRがID文字列だけでなく実在する設計本文またはtest assertionに対応することを確認する。 | evidence_claim | prose | docs/skills/adversarial-review.md:82-87 |
| `RB0-160` | review担当者は敵対review証拠をPLAN review_evidenceへ記録し、証拠未記録のgateをdoctor statusにかかわらずclear扱いにしない。 | evidence_claim | prose | docs/skills/adversarial-review.md:117-130 |
| `RB0-172` | 委譲者はsubagent出力を正本扱いまたはPO転送する前に、少なくとも一つの引用sourceと推論chainを自分で確認する。 | evidence_claim | prose | docs/skills/agent-cost-design.md:62-63; docs/skills/agent-cost-design.md:79-79 |
| `RB0-174` | 委譲者はagentが報告した件数を説明文から信用せず、自分で再計算する。 | evidence_claim | prose | docs/skills/agent-cost-design.md:65-65 |
| `RB04-126` | gateに影響する判断は定量検査と定性レビューの両方を揃え、片方だけでfreeze-readyにしない。 | evidence_claim | prose／gate | docs/governance/helix-harness-concept_v3.1.md:1131-1133 |
| `RB04-155` | design/impl/add系PLANはconfirmed前のreview evidenceをfrontmatterへ記録し、freeze後の増分レビューもappendし、記録欠落は失敗させる。 | evidence_claim | lint／doctor | docs/governance/helix-harness-concept_v3.1.md:1255-1255 |
| `RB04-199` | test作成者はcoverageを指標として扱い、関数存在確認等の意味のないtestで数値を上げない。 | evidence_claim | prose | docs/governance/ai-dev-team-operations_v1.1.md:633-637 |
| `RB05-026` | 例示されたテスト規則では、実装者はテストを通すためだけの実装を行わない。 | behavior_discipline | prose | docs/governance/audit-framework.md:313-313 |
| `RB05-057` | freeze対象33件のmanifestはPLAN-L3-20の集合と完全一致させ、packet owner自身を含めず、欠番PLAN-L3-41を補完しない。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:44-90 |
| `RB05-064` | freeze担当は設計在庫、freeze、実装、実行証拠を分けて数え、統制実装のgreenをcanonical product実装の完了件数へ算入しない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:193-211 |
| `RB05-067` | queue採番や予約済み状態を、pair成果物・設計・実装・TDD・検証の完了として扱わない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:258-260; docs/governance/l3-rebaseline-g3-freeze-packet.md:370-371 |
| `RB05-073` | GitHub追加要件の残12件とtest ownership・AI Vision・Universal Workflow・document・canonical・runtime authorityの責務を同じ分母へ算入しない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:352-354 |
| `RB05-083` | test ownershipはdigest-bound manifestで全件を覆い、完了済みPLANへ推測で帰属させず、後から追加されたcaseを初期分母へ逆算しない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:417-432 |
| `RB05-087` | 予約queueの件数を全工程の最終分母として固定せず、右腕実行・CI self-heal・review修正・追加責務のdeltaを別途扱う。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:463-468; docs/governance/l3-rebaseline-g3-freeze-packet.md:481-486 |
| `RB05-091` | DB receiptにはpolicy・source HEAD/tree・event・verifier・workspace・除外入力・replay・表別件数・検査母集団・finding・receipt digestを記録し、検証commandのexit 0とconverged=trueを要求する。 | evidence_claim | gate | docs/governance/l3-rebaseline-g3-freeze-packet.md:509-514 |
| `RB05-092` | freeze判断ではcheckpointと健全性検査を主証拠とし、契約外runtimeとのprojection/receipt digest一致を承認条件にせず、bootstrap成功をcanonical runtime実装完了と扱わない。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:515-518 |
| `RB05-095` | 台帳作成者は複数機能を代表行で合格させず、engine/detectorを実行単位に分け、生成fixtureをsource集合に残してruntime capabilityと別分類で追跡する。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:19-21 |
| `RB05-097` | mappedは要件IDへの対応だけを意味し、設計・テスト・Gateの実装完了として扱わない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:25-26 |
| `RB05-112` | source調査担当は指定ZIP、旧UTの全branch、現行資産、chat要求を全件棚卸しし、代表サンプルや推測で完了としない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:58-66 |
| `RB05-121` | 進捗報告者は固定分母を使い、成果物作成・独立監査・pair freeze・実装検証の完了率を別々に報告する。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:75-75 |
| `RB05-122` | PO確認またはnative transcript manifestがない限り、捕捉済みchat行からraw transcript全体の完全性を主張しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:77-82 |
| `RB05-123` | source自己診断がgreenでもprototype/skip receipt欠落を検知しない場合、完全性Gateの合格証拠に使用しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:285-285 |
| `RB05-126` | Git調査者はdefault clone・heads-only fetch・手書きref allowlistをcurrent authorityにせず、ref・unique content・ref-entry edgeの件数をreceiptから導出する。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:313-316 |
| `RB05-127` | historical UT heads seedをauthorityやcoverageに再利用せず、symbolic HEADやtag peelをref分母へ二重計上しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:314-322 |
| `RB05-129` | file単位・aggregate単位の採否はpreliminaryとして扱い、atom化と個別decisionが閉じるまでpending・covered weight 0を維持し、親のdecisionを子へ継承しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:340-342; docs/governance/infinity-loop-source-capability-ledger.md:378-401 |
| `RB05-130` | Low-Fi wireframeを操作可能なprototypeの代替として扱わない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:388-388 |
| `RB05-131` | path一致率をcapability搭載率と扱わず、部分テストのgreenで未搭載機構の欠落を被覆したと主張しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-capability-ledger.md:425-437 |
| `RB05-134` | design-definedを実行合格と扱わず、fixture・実command・exit code・output digest・DB queryまたはartifact evidenceが結線されるまでnot-implementedを維持する。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:19-21 |
| `RB05-167` | engine実行はcapability別にrun・artifact・version・入出力digest・exit status・provenanceを保存する。 | evidence_claim | prose | docs/governance/infinity-loop-system-assertion-cases.md:78-82; docs/governance/infinity-loop-system-assertion-cases.md:373-373; docs/governance/infinity-loop-system-assertion-cases.md:382-382 |
| `RB05-186` | OS検証はLinuxでfull core、macOSでportable、Windowsでcompatibilityを実施して差分を記録し、Windows wrapperのgreenだけでcore完了としない。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:121-123; docs/governance/infinity-loop-system-assertion-cases.md:405-405; docs/governance/infinity-loop-system-assertion-cases.md:430-430 |
| `RB05-200` | atomizerはsource spanと入出力を持つatomic childを生成し、directory/file親だけのcoverageを拒否して子だけを分母にする。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:160-162; docs/governance/infinity-loop-system-assertion-cases.md:391-391; docs/governance/infinity-loop-system-assertion-cases.md:433-433 |
| `RB05-225` | 設計coverageはservice親だけの消込みを認めず、全atomic obligationのsemantic dischargeを要求する。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:248-248; docs/governance/infinity-loop-system-assertion-cases.md:356-356; docs/governance/infinity-loop-system-assertion-cases.md:395-395 |
| `RB05-248` | closure readinessはIssueからmemoryまでのcausality joinが一件でも切れていれば未完了とする。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:344-344 |
| `RB05-258` | completion evidenceはprose PASSだけを認めず、failure codeとprovenanceがない結果を拒否する。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:419-419 |
| `RB05-259` | source coverageは代表fixture・検索ゼロ・包括要件だけの主張を拒否し、atomic source span・digest・抽出時点を要求する。 | evidence_claim | gate | docs/governance/infinity-loop-system-assertion-cases.md:423-423 |
| `RB05-260` | snapshot管理者は再生成可能なentry集合を正本とし、前身Gitのref・content・edge分母とdigestはcurrent receiptから得てremote件数を本文へ固定しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:22-25 |
| `RB05-261` | entry集合閉包と構造分類をbehavior閉包と同一視せず、Git authority greenでもbehavior_atom_closedをtrueにしない。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:27-30; docs/governance/infinity-loop-source-snapshot-manifest.md:202-204 |
| `RB05-266` | ZIP captureはbuild生成物を除外せずfixtureへ分離し、archive外の展開directory・OS metadata・調査用一時pathをsource rootへ含めない。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:178-179 |
| `RB05-267` | Git authority取得は指定2 repositoryのheads・tags・pull head/mergeを対象とし、symbolic HEADとtag peelは分母外の証拠として保存し、default cloneやheads-only取得を使わない。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:185-194 |
| `RB05-270` | 複数refに同一path/blobがあってもentry分類から落とさず、behavior atom段階でsource spanを束ねて共通behaviorを重複計上しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:226-226; docs/governance/infinity-loop-source-snapshot-manifest.md:278-279 |
| `RB05-275` | CURRENT familyはcoreとoutside tracked entryを非交差partitionとして全て含め、outsideを別分類へ送ってもsource分母から除外しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-snapshot-manifest.md:314-315; docs/governance/infinity-loop-source-snapshot-manifest.md:364-376 |
| `RB05-280` | 原子化担当はref・content・edge・file分類・代表capability件数を採用済みbehavior件数へ合算せず、generated manifestとcoverage receiptがgreenになるまで代表表を完全性証拠にしない。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:23-35; docs/governance/infinity-loop-source-atomization-contract.md:396-398 |
| `RB05-281` | behavior atomは独立に採否できる最小意味単位に分割し、directory・branch・file・module群・bundle等のaggregate parentのcovered weightを常に0とする。 | evidence_claim | prose／gate | docs/governance/infinity-loop-source-atomization-contract.md:28-30; docs/governance/infinity-loop-source-atomization-contract.md:76-76 |
| `RB05-282` | generated・sample・goldenはfixture atomへ結び、behaviorと別分母にし、source集合から削除したりruntime capabilityへ数えたりしない。 | evidence_claim | prose／gate | docs/governance/infinity-loop-source-atomization-contract.md:54-55; docs/governance/infinity-loop-source-atomization-contract.md:64-65; docs/governance/infinity-loop-source-atomization-contract.md:229-240 |
| `RB05-283` | Git branch overlayが0 entryの場合はancestryとempty digestでゼロを証明する。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:59-61 |
| `RB05-287` | rejectにもscope/non-goalを与えるHILまたはPO directive、反証assertion、再出現検出gateを要求し、理由だけのrejectを禁止する。 | process_gate | gate | docs/governance/infinity-loop-source-atomization-contract.md:71-72 |
| `RB05-288` | absorbedには全joinを満たす一意のtarget atomを要求し、source側を独立covered件数へ二重算入しない。 | evidence_claim | gate | docs/governance/infinity-loop-source-atomization-contract.md:73-74 |
| `RB05-292` | Git差分manifestにはGit version・fetch時刻・remote URL・merge-base・ahead/behind・command契約版を保持し、fetch時刻欠落を鮮度証明に使わない。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:136-139 |
| `RB05-293` | 固有変更があるbranchを名前だけでabsorbedにせず、atomごとの吸収先を証明し、branch全体の吸収判定で子atom判定を代替しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:141-145; docs/governance/infinity-loop-source-atomization-contract.md:213-215 |
| `RB05-298` | Git sourceはunique contentと全ref-entry edgeを分け、branch overlayにmerge-base・ahead/behind・A/M/D/Rとblob/span/tombstone/rename証拠を保存し、共通atomをbranchごとに複製しない。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:206-215 |
| `RB05-299` | absorbedはancestryと空差分、patch identityと全blob transition、または意味・assertion一致と一意targetで証明し、path名・類似文・PLAN番号・LLM推測だけでは認めない。 | evidence_claim | gate | docs/governance/infinity-loop-source-atomization-contract.md:217-224 |
| `RB05-311` | 進捗はentry分類率・atom抽出率・decision確定率・join率を別々に報告し、分母を明示せず総合平均を出さない。 | evidence_claim | prose | docs/governance/infinity-loop-source-atomization-contract.md:334-335 |
| `RB05-328` | 大量all-ref差分の詳細行はrepositoryへ格納せず、line count・unique path count・detail digestを正本証跡とする。 | evidence_claim | prose | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:52-57 |
| `RB05-340` | 当該監査の完了はPLAN起票までに限定し、採用候補PLANを実装readyや実装完了と扱わず、実装前にL3〜L6の機能固有設計へ降下してparent bindingを満たす。 | process_gate | prose／gate | docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md:360-362 |
| `RB05-344` | 旧orchestration surfaceの集計はdocs/archive配下と明示された管理用実装・設計・test・config pathを除外対象にする。 | tooling_runtime | config | config/legacy-orchestration-surface-inventory.json:6-20 |
| `RB06-018` | 判断者はMarkdown単独、DB単独、receipt単独を正本化の根拠にしない。 | evidence_claim | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:193-202 |
| `RB06-029` | 完了判定者はdownstream設計・testが未更新なら完了claimを拒否する。 | evidence_claim | prose | docs/governance/autonomous-authoring-admission-transaction-directive_v0.1.md:318-318 |
| `RB06-033` | 監査者はfrontmatter statusやpathだけで意味dispositionを決めず、本文とcurrent authorityへの接続を確認する。 | evidence_claim | prose | docs/governance/l12-hybrid-current-authority-disposition-2026-07-19.md:194-217 |
| `RB06-037` | 監査者はinventory掲載を誤り確定とせず、現行判断に使う候補へdispositionを付ける。 | evidence_claim | prose | docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md:17-22 |
| `RB06-046` | 判断者はpointer存在やdefinition freezeを、意味coverage、下流設計完了、実装証拠へ読み替えない。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-coverage-ledger.md:20-20; docs/governance/infinity-loop-requirement-coverage-ledger.md:205-205 |
| `RB06-049` | 昇格判断者はsource authority、上下pair、左右pair、実行証拠がcurrentになるまでverifiedへ昇格しない。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-coverage-ledger.md:265-265 |
| `RB06-077` | 判断者はowner bindingや定義freezeを、下流義務消込、L4以降の設計・実装・oracle実行・release承認に読み替えない。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-definition-ledger.md:24-24; docs/governance/infinity-loop-requirement-definition-ledger.md:220-221 |
| `RB06-093` | 台帳管理者は未実装状態をgreenへ読み替えず、直接対応HSTのないassertionをHOTだけで記録してdraft-L9-gapと表示する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:22-25 |
| `RB06-103` | closure評価はIssueからmemoryまでのcausality join切れが一件でもあれば未完了とする。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:40-40 |
| `RB06-107` | source coverageは全ref・content・edge・atomic behaviorの未分類や孤児、pending、根拠なしrejectを検出した場合、covered判定とpair-freezeを拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:44-44; docs/governance/infinity-loop-assertion-coverage-ledger.md:90-90; docs/governance/infinity-loop-assertion-coverage-ledger.md:170-170 |
| `RB06-115` | design coverageは全原子的義務とsemantic dischargeが結ばれない限りfreezeを拒否し、空見出し・TBD・空表・aggregate消込・自由文N/Aを未完了とする。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:52-52; docs/governance/infinity-loop-assertion-coverage-ledger.md:110-110; docs/governance/infinity-loop-assertion-coverage-ledger.md:184-184 |
| `RB06-121` | Contract Portfolio Plannerは要求義務の未被覆・重複をゼロにし、契約や見本の数量だけで合格させない。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:57-57; docs/governance/infinity-loop-assertion-coverage-ledger.md:122-122; docs/governance/infinity-loop-assertion-coverage-ledger.md:191-191 |
| `RB06-131` | Closure Gateは全必須evidenceがcurrentの場合だけclosure receiptを発行する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:75-75 |
| `RB06-143` | engine実行はcapability別run・artifact・version・入出力digest・exit statusを保存し、detectorは別runで構造化findingとprovenanceを保存する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:93-94 |
| `RB06-147` | source atomizerはatomic childにsource spanと入出力を付けて未分類・重複を検出し、coverage分母をchildだけで数える。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:105-105; docs/governance/infinity-loop-assertion-coverage-ledger.md:180-180 |
| `RB06-164` | 委譲完了検査はaudit行欠損とdigest欠落を拒否する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:137-137 |
| `RB06-166` | OS検証はLinux full・macOS portable・Windows compatibilityを区別して記録し、Linux full未実施のcore completionを拒否する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:146-146; docs/governance/infinity-loop-assertion-coverage-ledger.md:177-177 |
| `RB06-177` | completion evidenceへの昇格はfailure codeとprovenanceのないprose PASSだけの結果を拒否する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:166-166 |
| `RB06-185` | 充足claim検査はvendor設定・宣言だけに依拠した充足主張を拒否する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:197-197 |
| `RB06-187` | 台帳のverified昇格は全IDの一意・現行集合一致、実fixtureと実行証拠、atomic testへの逆引き、空・省略IDゼロ、worker/verifier分離、failure別negative実行が揃うまで拒否する。 | evidence_claim | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:210-216 |
| `RB06-196` | 判断者はslot登録を本文完成とみなさず、schema・文書定義・実ファイルの整合を検証する。 | evidence_claim | gate／doctor | docs/governance/document-system-map.md:125-125; docs/governance/document-system-map.md:140-142 |
| `RB06-199` | 判断者はcatalog分類の存在や設計済み状態をruntime実装証拠にせず、静的分類だけで完了にしない。 | evidence_claim | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:49-57; docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:86-91 |
| `RB06-206` | 成熟度報告者は要件確定・設計pair・runtime実装・実行検証・運用観測を独立に表示し、上流状態から下流状態を導出しない。 | evidence_claim | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:168-179 |
| `RB06-207` | 成熟度報告者は文書・truthy artifact名・screenshot・binding test・provider起動だけをruntime実装または実行検証の証拠にしない。 | evidence_claim | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:178-179 |
| `RB06-216` | externalObserved検証はdevelopment repo・distribution repo・latest tagの全三実測値を要求し、部分入力をfail-closeする。 | evidence_claim | gate | docs/governance/helix-objective-evidence-audit.md:23-25 |
| `RB06-218` | 進捗報告者は検証証拠を後から検査可能にし、要求と検証根拠で進捗を数え、未解決decisionを完了incrementの裏へ隠さない。 | evidence_claim | prose | docs/governance/helix-objective-evidence-audit.md:34-39 |
| `RB06-221` | runtime挙動claimはsession・source・surface・timestamp・evidenceと追記専用記録を要求し、projection-only証拠と分離して不完全claimを拒否する。 | evidence_claim | gate | docs/governance/helix-objective-evidence-audit.md:47-47 |
| `RB06-223` | UI/read-model担当者はrendererをauthoring sourceにせず、DB/read-model作業だけでUI完成を主張しない。 | evidence_claim | prose／doctor | docs/governance/helix-objective-evidence-audit.md:48-49; docs/governance/helix-objective-evidence-audit.md:198-199 |
| `RB06-225` | 検証報告者はtest presenceの件数だけでruntime parity・visualization・acceptance closureを証明せず、実runtime evidenceまたは明示substitute oracleを要求する。 | evidence_claim | prose／lint | docs/governance/helix-objective-evidence-audit.md:50-50 |
| `RB06-228` | 目標証跡監査はsource commit・設計降下・decision/oracle・doctor・non-goalを要求し、ファイル数・green数・span数やprose機能一覧だけを証拠にしない。 | evidence_claim | lint／doctor | docs/governance/helix-objective-evidence-audit.md:53-53 |
| `RB06-230` | 全体完了claimはcompletionReadiness正常、decisionCountゼロ、blockers空、semantic frontier空が同時成立した場合だけ許可し、invalid監査のpercentを証拠として信頼しない。 | evidence_claim | lint／doctor | docs/governance/helix-objective-evidence-audit.md:174-194; docs/governance/helix-objective-evidence-audit.md:204-204 |
| `RB06-272` | 設計者は機械検査・DB参照・mode log・skill発火率・自動化readiness・guardrail等をdata-backedにする。 | evidence_claim | prose | docs/governance/gate-design.md:189-189 |
| `RB06-303` | 監査者は意味整合をproved・frontier・warningで区別し、file数やgreen数だけで完了を判定せずlive完了結果に従う。 | evidence_claim | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:13-23 |
| `RB06-305` | 完了報告者は選択profileや一部system testのgreenを全製品完了へ拡大せず、設計・read-model・path存在を実装完了の代替にしない。 | evidence_claim | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:45-56; docs/governance/helix-l0-l8-design-consistency-audit.md:71-78 |
| `RB06-312` | 報告者はDB projection行だけでruntime claimをcloseせず、setup成功をstate・adapterの不可逆cutover完了と読み替えない。 | evidence_claim | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:114-115 |
| `RB06-313` | 全体完了報告者はdoctor・testがgreenでもdecision・cutover・version-upが残る場合、completion claimを行わない。 | evidence_claim | prose／gate | docs/governance/helix-l0-l8-design-consistency-audit.md:117-117 |
| `RB06-314` | 機能一覧管理者はdeferred・live draftをconfirmed currentと混同せず、再開時に要求文書とsourcePathsを更新し、live blockerゼロと未完了の非算入を整合条件にする。 | evidence_claim | gate | docs/governance/helix-l0-l8-design-consistency-audit.md:121-130 |
| `RB07-010` | 担当者は失敗コマンド、最初のエラー行、HEAD SHAをreview_evidenceへ記録し、不具合を許した条件と再発防止策も残す。 | evidence_claim | prose | docs/skills/debugging-and-error-recovery.md:90-100 |
| `RB07-015` | 担当者は降下義務の検査を通すためのstub文書を作らず、実際の設計を書く。 | evidence_claim | prose | docs/skills/debugging-and-error-recovery.md:139-140 |
| `RB07-016` | 担当者はdoctor greenを無問題の証明にせず、agentの説明ではなくGit状態・実ファイル・harness状態で診断する。 | evidence_claim | prose | docs/skills/debugging-and-error-recovery.md:142-152 |
| `RB07-024` | 担当者はG-10がcompletionClaimAllowed=falseの間、この監査だけでHELIX全体の完了を主張しない。 | evidence_claim | prose／gate | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:139-142 |
| `RB07-030` | 担当者は変更前に影響画面のスクリーンショット、console出力、主要network callの契約を記録する。 | evidence_claim | prose | docs/skills/browser-testing-and-screen-verification.md:86-87 |
| `RB07-038` | 検証者は問題なしと報告するとき、9状態のうち確認済みと未確認を必ず明示する。 | evidence_claim | prose | docs/skills/browser-testing-and-screen-verification.md:122-123 |
| `RB07-043` | 担当者は全画面の前後画像と検証記録をauditへ保存し、doctorの未解決画面信号がないことを確認してPLANを進める。 | evidence_claim | prose／doctor | docs/skills/browser-testing-and-screen-verification.md:137-150 |
| `RB07-065` | 担当者は完了主張をtestsまたはgate runで裏付ける。 | evidence_claim | prose | docs/governance/handover-retirement-memory-audit-2026-07-11.md:141-141 |
| `RB07-068` | 担当者はテスト成功を正しさそのものと報告せず、宣言したテスト集合で壊れ方が観測されなかったと表現する。 | evidence_claim | prose | docs/skills/test-thinking.md:39-40 |
| `RB07-078` | 探索的テスト担当者は操作の羅列ではなく、障害が再現する条件で記録する。 | evidence_claim | prose | docs/skills/test-thinking.md:91-92 |
| `RB07-082` | 検証者は停止判断時に未検証範囲、故障時の影響、検出方法を言語化し、review_evidenceまたはauditへ残す。 | evidence_claim | prose | docs/skills/test-thinking.md:114-116 |
| `RB07-093` | PoC担当者は結果をchatやcommit messageだけに残さずreview_evidenceまたはauditへ保存し、実験だけでなくS4判断にも期限を設ける。 | evidence_claim | prose | docs/skills/poc.md:123-126 |
| `RB07-107` | skillの効果を主張する担当者はwith/without比較evalまたは想定失敗のregression testを証跡とし、説明文だけで改善を主張しない。 | evidence_claim | prose | docs/skills/skill-authoring.md:105-107 |
| `RB07-111` | 監査者は正規wrapperでのgreenを、通常test入口の非対称・過大fixture・timeout・doctor集中の問題の相殺に使わない。 | evidence_claim | prose | docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:57-58 |
| `RB07-116` | bootstrap verifierはG1/G3 freeze用のread-only検証に限定し、L6 canonical runtimeとして扱わない。 | tooling_runtime | config | docs/governance/l3-g3-logical-db-bootstrap-policy.json:2-3 |
| `RB07-140` | 担当者はdoctor警告を消すためだけにTTLを遠い将来へ延ばさず、確定条件を記す。 | behavior_discipline | prose | docs/skills/debt-register.md:118-119 |
| `RB07-152` | 進捗管理者は登録、意味trace、component解決、定義active、freeze、gate完了、実装検証を別々に算出する。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:19-31 |
| `RB07-153` | 進捗管理者は文書・見出し・pointerの存在を意味trace・gate完了・実装検証へ算入せず、未抽出のatom分母をfile数で代用しない。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:33-34 |
| `RB07-154` | 進捗管理者はmanual reviewをauthoritative runtime receiptの代わりに数えず、成果物・strict closure・pair freeze・実装・oracle実行を混同しない。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:70-75 |
| `RB07-155` | 進捗管理者はcanonical数値IDのoracleだけを実行分母に加算し、supporting存在inventoryを別記する。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:108-112 |
| `RB07-157` | generated receipt runtimeが未実装の間、担当者はsnapshotを手更新正本として扱い、自動計測済みと主張しない。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:117-117 |
| `RB07-159` | 進捗管理者は実行証拠なしにimplementation_verifiedを増やさず、aggregate・deferred・stale・根拠のないN/A・未実行oracleを分子へ数えない。 | evidence_claim | prose | docs/governance/infinity-loop-design-progress-ledger.md:119-120 |
| `RB07-160` | 検証者はdesign本文を読んで主張の実質を確認し、doctor greenやorphan 0だけで層の完了を宣言しない。 | evidence_claim | prose | docs/skills/verification.md:42-47; docs/skills/verification.md:113-114 |
| `RB07-166` | 検証者は層群の検証終了時に機械結果・降下所見・実質確認・判定・reviewer・時刻をauditへ記録し、assertion数を品質の代理にしない。 | evidence_claim | prose | docs/skills/verification.md:93-108; docs/skills/verification.md:115-116 |
| `RB07-179` | 採用監査者は要求に対応する設計意味、降下先、検証oracle、残scope分類が揃う行だけを受理し、file存在・green tests・文章量だけで完了としない。 | evidence_claim | prose／gate | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:15-18 |
| `RB07-180` | 採用監査者は採用根拠を主張する前にcurrent upstream・legacy HEADを確認し、読めなかったglobal資料を含めた完全準拠を主張しない。 | evidence_claim | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:35-42 |
| `RB07-182` | 担当者はruntime挙動をprojectionだけから受理せず、unit oracle充足と実runtime実行を別に検証する。 | evidence_claim | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:50-52 |
| `RB07-185` | 採用担当者はsource件数をimport目標にせず、意味採用をfull product・command・skill・runtime parityとして主張しない。 | evidence_claim | prose | docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:70-72; docs/governance/helix-adoption-design-completion-audit-2026-06-30.md:90-95 |
| `RB07-225` | 担当者は実装後にspecを後付け正当化せず、pair-freezeのTBDをblockerとし、doctor greenを仕様完成の証明にしない。 | evidence_claim | prose | docs/skills/spec-driven-development.md:105-112 |
| `RB07-234` | 設計者は取捨選択の理由をPLANへ残し、関心事が構造的に存在しない場合だけskipする。未決定・手間・gate green目的のskipは禁止する。 | process_gate | prose | docs/skills/design-tailoring.md:40-50 |
| `RB07-279` | 品質reviewerは機械検査・test実質・層責務・退行所見を記録し、formatを確認しないbiome lintだけを正規lintの代替にしない。 | evidence_claim | prose | docs/skills/code-review-and-quality.md:88-101; docs/skills/code-review-and-quality.md:107-107 |
| `RB07-323` | 監査者は未読・未確認範囲を明示追跡し、capability調査を逐語全件確認として報告しない。 | evidence_claim | prose | docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md:9-13; docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md:49-58; docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md:98-102 |
| `RB07-330` | 修正担当者はfix commit前にtypecheck・lint・test・doctorを全てgreenにし、PLANまたはauditを参照するcommitとtest/fix双方のSHAを証跡へ残す。 | process_gate | prose | docs/skills/error-fix.md:63-74 |
| `RB08-020` | Refactor担当者はPLANのreview_evidenceにtrace-freeze SHAを記録し、blocking findingがないことを確認する。 | evidence_claim | prose | docs/skills/refactoring.md:86-87 |
| `RB08-021` | Refactor担当者はdoctorの成功を観測可能な挙動不変の証明として扱わない。 | evidence_claim | prose | docs/skills/refactoring.md:95-96 |
| `RB08-043` | 作業者はREADMEを導線・補助説明に限定し、accept・freeze・evidence・completionをREADMEだけで判定しない。 | evidence_claim | prose | docs/skills/documentation.md:26-26; docs/skills/documentation.md:44-45 |
| `RB08-085` | gate担当者は意図ではなく結果をauditまたはreview_evidenceへ記録し、記録のないgateを通過済みとしない。 | evidence_claim | prose | docs/skills/gate-planning.md:57-58 |
| `RB08-092` | 作業者はdoctorのgreenを設計内容の正しさと扱わず文書を読み、PLAN付き理由なしにignore・skipで違反を隠さない。 | evidence_claim | prose | docs/skills/gate-planning.md:86-88 |
| `RB08-112` | TDD担当者はnative Vitest直実行でnpm run testを代替せず、doctor成功をoracle品質やTDD順序の証拠と扱わない。 | evidence_claim | prose | docs/skills/test-driven-development.md:83-86 |
| `RB08-239` | 設計slice管理者は責務と変更理由が独立するcanonical sliceを分母とし、文書分割でも親IDとclosure分母を維持する。 | evidence_claim | prose | docs/governance/infinity-loop-design-slice-registry.md:15-20; docs/governance/infinity-loop-design-slice-registry.md:83-83 |
| `RB08-240` | slice草案判定者は4成果物、双方向pair、FR/AC、caseの前後state・failure・全oracle exact pointerが閉じた場合だけquartet_draftへ算入する。 | evidence_claim | prose | docs/governance/infinity-loop-design-slice-registry.md:22-34; docs/governance/infinity-loop-design-slice-registry.md:82-82 |
| `RB08-241` | slice判定者は別runtime reviewとfreeze receiptがある場合だけpair_frozen、全oracleのcommand・exit code・digest・artifact/DB証拠がある場合だけimplemented_verifiedへ算入する。 | evidence_claim | prose | docs/governance/infinity-loop-design-slice-registry.md:33-34 |
| `RB08-242` | 台帳管理者はL3 owner変更と同じ変更で台帳を更新し、作成中・未作成・stale・根拠のないN/Aを分子へ入れない。 | evidence_claim | prose | docs/governance/infinity-loop-design-slice-registry.md:79-84 |
| `RB08-243` | 台帳担当者はgenerated receipt runtime実装前は手更新snapshotを正本とし、自動計測済みと主張しない。 | evidence_claim | prose | docs/governance/infinity-loop-design-slice-registry.md:85-85 |
| `RB08-254` | 完了判定者は未実装のDesign HARNESS・Authoring Admission・NFR registryを実装済み表示せず、closure自走権限をgeneric greenによる未完了PLAN閉鎖へ拡張しない。 | evidence_claim | prose | docs/governance/harness-memory-reconciliation-audit-2026-07-19.md:70-71 |
| `RB08-263` | G3後続計画担当者は不完全な51枠queueを後続作業の分母として使用しない。 | evidence_claim | config | docs/governance/l3-residual-responsibility-audit.json:67-77 |
| `RB08-278` | CI集約判定者は取消済みrunをgreenとして扱わない。 | evidence_claim | ci | docs/governance/operations-rule-audit-2026-07-26.md:43-43 |
| `RB08-279` | refactor完了判定者は自己申告の行数削減だけをclosure根拠にしない。 | evidence_claim | prose | docs/governance/operations-rule-audit-2026-07-26.md:44-44 |
| `RB08-283` | package再監査者はfinding・AC・trace件数を実体へ統一し、full-ref列挙snapshot不在をvalidatorで拒否してbranch/tag/PR情報と監査対象を全照合する。 | evidence_claim | prose／gate | docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md:25-30 |
| `RB08-287` | 完了判定者は要件binding PASSをruntime実装・activation完了と扱わず、下流PLAN・schema・負例・証拠・gate receiptが揃うまで未完了とする。 | evidence_claim | prose | docs/governance/hybrid-rebaseline-v0.5.1-verification-audit-2026-07-18.md:66-68 |
| `RB08-294` | 検証記録者は実施していないRed-first実行をred_at/green_atへ宣言せず、このsliceの反証をtracked mutation runnerへ束縛する。 | evidence_claim | prose | docs/governance/issue-214-slot-scheduler-closure.md:40-42 |
| `RB08-295` | #214担当者はDB・CLI・GitHub Projects追加を完了scopeへ含めず、後続PLANへ帰属させる。 | evidence_claim | prose | docs/governance/issue-214-slot-scheduler-closure.md:53-58 |
| `RB08-299` | 原稿整理担当者は正規化本文の一致を原稿bytes一致へ一般化せず、保全test成功を要求正本化・runtime完成の判定へ使わない。 | evidence_claim | prose | docs/governance/request-source-cleanup-2026-09-06.md:28-33; docs/governance/request-source-cleanup-2026-09-06.md:53-53 |
| `RB08-303` | 判定者はauthority setのcurrentを出典特定だけと解釈し、PO承認・pair・template review・設計義務解消・freezeを別々に閉じる。 | evidence_claim | prose | docs/governance/infinity-loop-requirement-authority-binding.md:22-23; docs/governance/infinity-loop-requirement-authority-binding.md:59-59 |
| `RB08-304` | binding台帳の閉鎖担当者は153要求を重複・未割当ゼロで覆い、24 setと各L3 FRの一対一対応、およびdefinition全行の同一set導出を確認する。 | process_gate | prose | docs/governance/infinity-loop-requirement-authority-binding.md:54-58 |
| `RB08-305` | v0.5.0監査者は列挙log不在でもPASSするfull-ref validatorを全ref採用完了の証拠へ使わず、自己矛盾をchecksum成功で相殺しない。 | evidence_claim | prose | docs/governance/hybrid-rebaseline-v0.5.0-intake-audit-2026-07-18.md:28-28; docs/governance/hybrid-rebaseline-v0.5.0-intake-audit-2026-07-18.md:46-55 |
| `RB08-309` | #514完了担当者はcaller provenanceやinput exact setを完了へ算入せず、local post-merge receiptをIssue completionへ機械join済みと主張しない。 | evidence_claim | prose | docs/governance/issue-514-cross-review-admission-symmetry-closure.md:19-20; docs/governance/issue-514-cross-review-admission-symmetry-closure.md:41-43 |
| `RB08-314` | 完了判定者は要件定義完了を理由に未実装runtimeやsystem completionをgreen表示せず、必須の品質・遅延・費用等の計測をtest greenで代替しない。 | evidence_claim | prose | docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:42-44; docs/governance/l12-scrum-requirements-completion-audit-2026-07-18.md:53-56 |
| `RB08-324` | NFR起草者は独立再現できていないhangを確定原因として使わず、契約不在を根拠に起草し、baselineは時系列実測後に確定する。 | evidence_claim | prose | docs/governance/nfr-consolidation-improvement-audit-2026-07-19.md:41-43 |
| `RB08-327` | 投資候補の管理者はINVを未登録候補ID、P0〜P4を導入優先帯と扱い、72件を完成率分母・v1必須集合・72 Issueへ自動変換しない。 | evidence_claim | prose | docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md:30-34 |
| `RB08-331` | merged PLAN閉鎖担当者はmain取込済みだけでstatusを変更せず、V-pair・oracle・型検査・lint・独立review・実data性能を再検証し、green後にreview判断を記録する。 | evidence_claim | prose | docs/governance/merged-plan-closure-audit-2026-07-19.md:3-6; docs/governance/merged-plan-closure-audit-2026-07-19.md:43-47 |
| `RB09-008` | Reverse終端の判定者は、本evidenceを当該Reverse PRのcurrent-HEAD review、canonical merge、post-main read-afterの代替として扱ってはならない。 | evidence_claim | prose | docs/governance/ci-critical-path-scheduler-terminal-fullback-evidence.md:35-37 |
| `RB09-009` | CI速度効果の判定者は、#1207の実GitHub Actions baseline比較を#1208のworkflow E2Eで実測するまでは、本Reverseで速度効果の完了を主張してはならない。 | evidence_claim | prose | docs/governance/ci-critical-path-scheduler-terminal-fullback-evidence.md:38-38 |
| `RB09-040` | companionの作成者は、companion自身のexact-HEAD CI、独立review、canonical merge、post-main read-afterの成立を候補文書で先取りしてはならない。 | evidence_claim | prose | docs/governance/ci-deferred-obligation-recovery-terminal-fullback-evidence.md:32-32 |
| `RB09-054` | RDS blue／greenの計画者は、providerが保証しないzero-downtimeを主張せず、停止見積りとswitchover条件を承認receiptへ記載する。 | evidence_claim | prose | docs/governance/devops-external-source-research-2026-07-23.md:26-26 |
| `RB09-056` | GH-FR-021の担当者は、自動rollback判断、SLO、alert、Incident／Recovery統合をUpdate Issue #91へ接続し、このL3 sliceで実装済みとして扱ってはならない。 | evidence_claim | prose | docs/governance/devops-external-source-research-2026-07-23.md:29-32 |
| `RB09-062` | hosted preflightの終端判定者は、supersededによりcancelledとなったReady run 33640355004をterminal判定の根拠として使用してはならない。 | evidence_claim | prose | docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md:16-17 |
| `RB09-068` | インフラ・運用品質要求の取込み担当者は、closed Issue、設計文書、collector、backup、synthetic testの存在を統合完了へ読み替えてはならない。 | evidence_claim | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:16-17 |
| `RB09-073` | U-NIO-003の検証は、欠測をhealthyとして扱うことをREDにする。 | evidence_claim | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:27-27 |
| `RB09-074` | U-NIO-003の検証は、候補から運用完了への昇格をREDにする。 | evidence_claim | prose | docs/governance/infrastructure-operations-quality-source-cleanup-2026-09-11.md:27-27 |
| `RB09-081` | 終端判定者は、R4 fullbackが生成する本governance evidenceをmerge後read-afterの代替として扱ってはならない。 | evidence_claim | prose | docs/governance/cli-workflow-identity-terminal-fullback-evidence.md:21-21 |
| `RB09-082` | 終端判定者は、PR #1227のcurrent HEADに対するfresh required CIと独立reviewが不成立なら、終端claimを拒否する。 | evidence_claim | prose | docs/governance/cli-workflow-identity-terminal-fullback-evidence.md:21-22 |
| `RC0-130` | Loop effort budget判定は、budget違反がある場合、verifier後のpass提案を認めずallowWorkerPass=falseを返す。 | evidence_claim | gate | src/orchestration/loop-effort-budget.ts:182-201 |
| `RC00-011` | 候補検証評議は、再現コマンドが欠落または空白なら候補を拒否し警告する。 | evidence_claim | gate | src/runtime/parallel-candidate-verifier-council.ts:37-38; src/runtime/parallel-candidate-verifier-council.ts:48-54 |
| `RC00-013` | 候補検証評議は、証拠pathが空白なら候補を拒否し警告する。 | evidence_claim | gate | src/runtime/parallel-candidate-verifier-council.ts:43-44; src/runtime/parallel-candidate-verifier-council.ts:48-54 |
| `RC00-038` | skill効果検証は、skill有無双方の証拠がartifact path、有効形式のcommand digest、再現可能フラグを満たさなければ不合格とする。 | evidence_claim | gate | src/runtime/skill-efficacy-evaluation.ts:39-47; src/runtime/skill-efficacy-evaluation.ts:55-71 |
| `RC00-112` | source mirror完全性検査は、all-ref content状態がcompleteでなければ再試行台帳へ記録し、完了主張を拒否する。 | evidence_claim | gate | src/runtime/source-content-mirror-completeness.ts:85-95; src/runtime/source-content-mirror-completeness.ts:120-124 |
| `RC00-115` | 変更package検査は、受入証拠pathが0件なら警告する。 | evidence_claim | gate | src/runtime/change-package-delta-archive.ts:73-78 |
| `RC00-140` | artifact収束検査は、PLANまたはcodeがあるのにtestが1件もなければ完了主張を拒否する。 | evidence_claim | gate | src/runtime/artifact-convergence-analyzer.ts:82-97; src/runtime/artifact-convergence-analyzer.ts:118-122 |
| `RC00-164` | hosted preflight判定は、hosted面でpreflight commandが空白なら拒否する。 | evidence_claim | gate | src/runtime/hosted-preflight.ts:166-168; src/runtime/hosted-preflight.ts:173-180 |
| `RC00-165` | hosted preflight判定は、hosted面でaudit recordが空白なら拒否する。 | evidence_claim | gate | src/runtime/hosted-preflight.ts:169-180 |
| `RC00-172` | blind benchmark定義凍結器は、admission levelがsmokeなら拒否する。 | evidence_claim | gate | src/runtime/worker-blind-definition.ts:134-135 |
| `RC00-261` | agent catalog監査は、指定audit文書が存在しなければ警告する。 | evidence_claim | gate | src/runtime/agent-catalog-watch.ts:183-188 |
| `RC01-059` | l7-completionは、statusが空・confirmed・completedの対象設計にremaining/residual/openとL7 carryを組み合わせた記述がある場合、不合格にする。 | evidence_claim | lint | src/lint/l7-completion.ts:25-30; src/lint/l7-completion.ts:45-48; src/lint/l7-completion.ts:82-102 |
| `RC01-060` | l7-completionは、対象設計にmoduleがnot implementedまたはunimplemented moduleであるとする記述がある場合、不合格にする。workflow orchestration moduleの同趣旨記述も検出する。 | evidence_claim | lint | src/lint/l7-completion.ts:49-57; src/lint/l7-completion.ts:86-102 |
| `RC01-061` | l7-completionは、対象設計でCI wiringがL7 carryとして記述されている場合、不合格にする。 | evidence_claim | lint | src/lint/l7-completion.ts:52-54; src/lint/l7-completion.ts:86-102 |
| `RC01-062` | l7-completionは、対象設計のL7番号付きWBS表行がpendingまたはnot implementedの場合、不合格にする。 | evidence_claim | lint | src/lint/l7-completion.ts:58-60; src/lint/l7-completion.ts:86-102 |
| `RC01-063` | l7-completionは、対象設計の指定module一覧行にnot implementedがある場合、不合格にする。 | evidence_claim | lint | src/lint/l7-completion.ts:61-67; src/lint/l7-completion.ts:86-102 |
| `RC01-064` | l7-completionは、対象設計の指定CLI表行がpendingまたはnot implementedの場合、不合格にする。 | evidence_claim | lint | src/lint/l7-completion.ts:68-75; src/lint/l7-completion.ts:86-102 |
| `RC01-065` | l7-completionは、対象設計にfuture workflow/roster/skill moduleの記述がある場合、不合格にする。 | evidence_claim | lint | src/lint/l7-completion.ts:76-78; src/lint/l7-completion.ts:86-102 |
| `RC01-070` | plan-dodは、confirmedまたはcompletedのL7 PLANのDoD節に未チェック項目がある場合、不合格にする。DoD節自体がない場合はこの判定を行わない。 | evidence_claim | lint | src/lint/plan-dod.ts:27-33; src/lint/plan-dod.ts:57-79 |
| `RC01-134` | green-command-digestは、digestの64桁が同じhex文字の繰返しの場合、placeholderとして不合格にする。 | evidence_claim | lint／doctor | src/lint/green-command-digest.ts:57-60; src/lint/green-command-digest.ts:78-87 |
| `RC01-135` | green-command-digestは、証拠ファイルが存在せず承認済み退役pathでもない場合、不合格にする。この実装は既存証拠の内容hashと申告digestの一致を検査しない。 | evidence_claim | lint／doctor | src/lint/green-command-digest.ts:88-105 |
| `RC01-150` | plan-artifact-existenceは、終端statusのPLANがgeneratesで宣言したartifactを欠く場合、不合格にする。archived、正当なsupersession対象PLAN、承認済み退役pathは所定の条件で除外する。 | evidence_claim | lint／doctor | src/lint/plan-artifact-existence.ts:78-92; src/lint/plan-artifact-existence.ts:140-165 |
| `RC01-151` | plan-artifact-existenceは、終端statusのPLANの宣言artifactが存在しても内容が空白だけの場合、不合格にする。.gitkeepと指定の初期状態ledgerは空でも許容する。 | evidence_claim | lint／doctor | src/lint/plan-artifact-existence.ts:44-49; src/lint/plan-artifact-existence.ts:78-103; src/lint/plan-artifact-existence.ts:166-169 |
| `RC01-153` | 共有source-ledger意味検査は、指定4項目の値が存在する場合、その値が項目名自身・TBD・TODO・ハイフン・山括弧placeholderなら違反を返す。 | evidence_claim | lint | src/lint/shared.ts:107-125; src/lint/shared.ts:142-150 |
| `RC01-159` | 共有record検査は、指定recordがない、または必要項目の値が空・TBD・TODO・ハイフンの場合、欠落項目として返す。 | evidence_claim | lint | src/lint/shared.ts:212-225 |
| `RC02-025` | 論理DB receipt生成器は、stale規則のminimum_rowsまたはorphan規則のminimum_child_rowsが1未満の場合、例外で拒否する。 | evidence_claim | gate | src/doctor/l3-g3-logical-db-receipt.ts:403-408 |
| `RC02-038` | doctorのplan-artifact-existence checkは、完了を宣言したPLANのgenerates成果物が存在しない、または読込不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:1011-1036 |
| `RC02-069` | doctorのdb-projection-ingestion checkは、row count検査が不合格、pair-agent-run-evidenceのblocked・error・failed gateが存在する、open/errorのpair-agent evidence findingが存在する、または投影・読込失敗の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:1784-1843 |
| `RC02-084` | doctorのoperation-scope-binding checkは、必須6scope・観測gap node・coverage ID・証拠表・設計ID・運用traceが不足する、observedなのにsourceがない、または投影不能の場合に失敗する。missing・reverifyや設計済み観測0件だけはadvisory/watchとして表示する。 | evidence_claim | doctor | src/doctor/index.ts:3789-3974 |
| `RC02-097` | doctorのdesign-reality-binding checkは、exact HEADの設計実在性検査が不合格、または検査不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:4750-4763 |
| `RC02-102` | doctorのplan-dod checkは、DoD検査が不合格、検査対象0件、または読込不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:4851-4870 |
| `RC02-107` | doctorのdrive-model-passage checkは、工程通過証明の検査が不合格、対象0件、または証明表を読めない場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:4937-4959 |
| `RC02-112` | doctorのtelemetry-closure checkは、telemetry closure検査が不合格、対象0件、またはmatrix読込不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:5044-5063 |
| `RC02-125` | doctorのl7-completion checkは、完了検査が不合格、対象0件、またはactive L4〜L6設計文書を読めない場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:5410-5429 |
| `RC02-142` | consumer doctorのconsumer-project-setup-state checkは、setup状態が完了主張禁止・ready・固定初回検証matrixを満たさない場合に失敗する。matrixには指定順のphase/command、no-write、非空expected/evidence、materialized path配列、review bundleの両digestとsemantic digest判断を要求する。 | evidence_claim | doctor | src/doctor/index.ts:6027-6136 |
| `RC02-162` | doctorのl14-close-audit checkは、close監査が不合格、または監査matrix読込不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:6666-6679 |
| `RC02-174` | doctorのcompletion-decision-packet checkは、packetの時点・source実在性等の検査不合格、参照する専用packetの欠落・関連scoped command不一致・検証command等の違反、または検査不能で失敗する。 | evidence_claim | doctor | src/doctor/index.ts:6940-6976; src/doctor/index.ts:7029-7179 |
| `RC02-176` | doctorのobjective-evidence-audit checkは、objective証拠監査が不合格、または監査文書読込不能の場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:7181-7194 |
| `RC03-019` | closure authority分類処理は、bindingsまたはgatesが空の場合、authorityをinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-registry.ts:263-269 |
| `RC03-028` | closure authority backfill処理は、指定test_pathにあり、対象PLANとoracleの完全一致markerをちょうど1個含む収集済みテストがない場合、needs_test_citationとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:303-307; src/policy/closure-authority-backfill.ts:384-394 |
| `RC03-029` | closure authority backfill処理は、完全一致する収集済みテストが複数ある場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:395-408 |
| `RC03-030` | closure authority backfill処理は、対応テストのstatusがpassedでない場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:395-408 |
| `RC03-033` | closure authority backfill処理は、テストreceiptのargvが「--no-install vitest run 対象test_path --reporter=json」と完全一致しない場合、候補をinvalidとする。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:395-408 |
| `RC03-049` | closure authority backfill bundle生成処理は、実候補PLAN列が期待列と件数または順序を含めて一致しない場合、失敗する。 | evidence_claim | gate | src/policy/closure-authority-backfill.ts:507-511 |
| `RC03-063` | historical V-pair移行分類処理は、証明済みbacklogの分類に使用されなかったauthority行が残る場合、bundle生成を失敗させる。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:144-151 |
| `RC03-064` | historical V-pair移行分類処理は、3種類のprimary分類件数の合計がadmitted件数に一致しない場合、失敗する。 | evidence_claim | gate | src/policy/historical-vpair-migration-authority.ts:152-168 |
| `RC03-070` | historical migration review検証処理は、verdictのPLAN IDが重複する、件数がbundle decisionsと違う、または順序を含むPLAN ID対応が一致しない場合、受理を拒否する。 | review_merge | gate | src/policy/historical-vpair-migration-authority.ts:231-236 |
| `RC03-110` | チーム実行処理は、tl、qa、uiuxの出力が切り詰められている場合、VERDICTを曖昧として成功としない。 | evidence_claim | gate | src/team/run.ts:186-201; src/team/run.ts:523-541 |
| `RC03-112` | チーム実行処理は、runtimeのterminalAcceptedが真でない場合、memberを成功としない。 | evidence_claim | gate | src/team/run.ts:535-541 |
| `RC03-113` | チーム実行処理は、memberがtimeoutした場合、終了コードやレビュー判定にかかわらず成功としない。 | tooling_runtime | gate | src/team/run.ts:538-541 |
| `RC03-114` | チーム実行処理は、memberのプロセス回収が確認できない場合、成功としない。 | tooling_runtime | gate | src/team/run.ts:538-541 |
| `RC03-115` | チーム実行処理は、memberの終了コードが0でない場合、成功としない。 | evidence_claim | gate | src/team/run.ts:540-542 |
| `RC03-120` | チーム計画実行処理は、全memberのstatusがcompletedでなければ、チーム全体を成功としない。 | evidence_claim | gate | src/team/run.ts:654-661 |
| `RC04-041` | ループreceipt生成器は、最新iteration証拠の反復番号・provider・verdict・blockedReasonがstateと整合しなければ失敗する。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:138-175 |
| `RC04-042` | ループreceipt生成器は、runningなのにiteration証拠が0件なら失敗する。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:153-183 |
| `RC04-118` | pair-agentは、smart_reviewのpassにGreen証拠またはreview証拠マーカーが無ければerrorにする。 | evidence_claim | gate | src/orchestration/pair-agent.ts:400-405; src/orchestration/pair-agent.ts:595-600 |
| `RC04-122` | 自動化readiness判定器は、PLAN IDが無い、またはpassed gate証拠が0件ならblockedにする。 | evidence_claim | gate | src/workflow/readiness.ts:23-27; src/workflow/readiness.ts:43-54 |
| `RC04-144` | foundation readiness生成器は、実装済みでも設計済みでもないcategoryを警告する。 | process_gate | gate | src/workflow/contracts-extras.ts:91-106 |
| `RC04-157` | テスト証拠記録器は、command・runner・scope・evidence_pathの空値、または整数でないexit_codeをエラーにしDB記録しない。 | evidence_claim | gate | src/workflow/contracts.ts:63-87 |
| `RC04-159` | テスト証拠記録器は、plan_idが無い場合に警告する。 | evidence_claim | gate | src/workflow/contracts.ts:165-171 |
| `RC04-161` | Green判定器は、要求されたcommand種別の証拠が欠ければ失敗する。 | evidence_claim | gate | src/workflow/contracts.ts:189-201 |
| `RC04-162` | Green判定器は、提出されたcommand証拠に非ゼロ終了があれば失敗する。 | evidence_claim | gate | src/workflow/contracts.ts:195-201 |
| `RC04-166` | UT履歴投影器は、oracle coverage・plan green rate・Green定義準拠のscoreが1未満なら警告statusにする。 | evidence_claim | gate | src/workflow/contracts.ts:252-253; src/workflow/contracts.ts:274-303; src/workflow/contracts.ts:338-342 |
| `RC04-171` | Discovery S4判定器は、PoC証拠のstatusが空なら失敗する。 | evidence_claim | gate | src/workflow/contracts.ts:678-686 |
| `RC04-175` | Refactor検証器は、対応する回帰test IDが無ければ失敗する。 | evidence_claim | gate | src/workflow/contracts.ts:733-743 |
| `RC04-184` | FE要求抽出器は、画面があるのに候補が1件も生成できなければ追加警告する。 | evidence_claim | gate | src/workflow/design-elicitation.ts:202-207 |
| `RC04-204` | workflow envelope検証器は、coverage reportで要求されたatom種別が実体に無ければactivationを拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:258-265; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-205` | workflow envelope検証器は、covered_atom_kindsと実在atom種別集合が完全一致しなければactivationを拒否する。 | evidence_claim | gate | src/workflow/universal-workflow-envelope.ts:267-275; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-206` | workflow envelope検証器は、missing_atom_kindsが空でなければactivationを拒否する。 | process_gate | gate | src/workflow/universal-workflow-envelope.ts:276-281; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RC04-256` | CIは、preflight集約結果artifactが見つからなければuploadをエラーにする。 | evidence_claim | ci | .github/workflows/harness-check.yml:560-566 |
| `RC04-260` | CIは、full結果再利用が指定されているのにprior green run IDが無ければ失敗する。 | evidence_claim | ci | .github/workflows/harness-check.yml:692-696 |
| `RC04-262` | CIの各full regression shardは、試験終了コードと出力digestをreceiptに記録し、非ゼロ終了をjob失敗へ反映する。 | evidence_claim | ci | .github/workflows/harness-check.yml:765-783; .github/workflows/harness-check.yml:822-838; .github/workflows/harness-check.yml:890-908; .github/workflows/harness-check.yml:949-972 |
| `RD00-091` | 延期義務の照合は、成功以外のterminal runに有効な初回検出oracleがない場合、失敗判定にする。 | evidence_claim | ci | src/runtime/ci-deferred-obligation-recovery.ts:307-322 |
| `RD00-167` | CI telemetry検証は、failedまたはtimed_outに有効な初回検出oracle IDがない場合、拒否する。 | evidence_claim | ci | src/runtime/ci-execution-telemetry.ts:639-645 |
| `RD00-291` | review commentのread-after検証は、取得URLがない場合、失敗する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:995-997 |
| `RD00-336` | CLI-R00 observation decoderは、測定不能と定義された指標をmeasuredと申告した場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:651-654 |
| `RD00-337` | CLI-R00 observation decoderは、proxyと定義された指標をmeasuredと申告した場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:655-657 |
| `RD00-338` | CLI-R00 observation decoderは、上記の専用違反以外でもcatalogとobservabilityが異なる場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:658-666 |
| `RD00-341` | CLI-R00 observation decoderは、measuredまたはproxy指標のvalueがnullの場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:680-682 |
| `RD00-342` | CLI-R00 observation decoderは、unmeasurable指標にnull以外のvalueがある場合、拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:683-687 |
| `RD00-364` | CLI-R00 artifact検証は、観測metric集合がcatalogの13指標と件数・順序とも完全一致しない場合、失敗する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:9-23; src/runtime/cli-r00-throughput-baseline.ts:906-915 |
| `RD00-366` | CLI-R00比較器は、baselineとcandidateのobservabilityが異なる場合、比較を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:980-985 |
| `RD00-367` | CLI-R00比較器は、baselineとcandidateの実行環境が異なる場合、比較を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:986-991 |
| `RD00-368` | CLI-R00比較器は、schema・metric・観測区分・環境・recipe・HEAD・workflow・run・argv・test path・Node・OSの条件が完全一致しない場合、比較を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:952-966; src/runtime/cli-r00-throughput-baseline.ts:992-997 |
| `RD00-369` | CLI-R00比較器は、どちらかの観測がunmeasurableの場合、数値差を計算せず比較を拒否する。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:998-1004 |
| `RD00-372` | CLI-R00構造proxy再測定は、CHANGED_FILE_FAN_OUTの凍結値が欠落またはsnapshot値と異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1027-1043 |
| `RD00-373` | CLI-R00構造proxy再測定は、CHANGED_SYMBOL_FAN_OUTの凍結値が欠落またはsnapshot値と異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1027-1043 |
| `RD00-374` | CLI-R00構造proxy再測定は、DIFF_BYTESの凍結値が欠落またはsnapshotのCLI byte数と異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1027-1043 |
| `RD00-375` | CLI-R00構造proxy再測定は、REVIEW_CONTEXT_BYTES_OR_TOKENSの凍結値が欠落またはsnapshotのCLI byte数と異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1027-1043 |
| `RD00-376` | CLI-R00構造proxy再測定は、MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNTの凍結値が欠落またはsnapshotのcollision proxyと異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1027-1043 |
| `RD00-377` | CLI-R00構造proxy再測定は、supporting contextのCLI byte数がsnapshotと異なる場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1044-1049 |
| `RD00-378` | CLI-R00構造proxy再測定は、top-level command familyの列がsnapshotと一致しない場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1050-1058 |
| `RD00-379` | CLI-R00構造proxy再測定は、full regression shard job IDの列がsnapshotと一致しない場合、失敗を返す。 | evidence_claim | gate | src/runtime/cli-r00-throughput-baseline.ts:1059-1067 |
| `RD01-082` | Cursor取消後の再読判定は、取消対象runがterminalでなければ解消済みと認めない。 | evidence_claim | gate | src/runtime/cursor-cloud-run-authority.ts:241-243 |
| `RD01-083` | Cursor取消後の再読判定は、取消対象runが一覧に存在しなければ解消済みと認めない。 | evidence_claim | gate | src/runtime/cursor-cloud-run-authority.ts:244-244 |
| `RD01-184` | 回帰shard処理は、入力または期待inventoryにpath重複があれば失敗する。 | process_gate | gate | src/runtime/full-regression-shards.ts:98-99; src/runtime/full-regression-shards.ts:161-161 |
| `RD01-191` | 回帰shard検証は、partition全体でtest pathが重複していれば失敗する。 | process_gate | gate | src/runtime/full-regression-shards.ts:171-171 |
| `RD01-192` | 回帰shard検証は、partitionのtest集合が期待inventoryと一致しなければ失敗する。 | process_gate | gate | src/runtime/full-regression-shards.ts:172-173 |
| `RD01-202` | 回帰receipt検証は、receiptのshard集合がplanのshard集合と一致しなければ失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:228-233 |
| `RD01-204` | 回帰receipt検証は、planに存在しないshardのreceiptを拒否する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:240-243 |
| `RD01-210` | 回帰receipt検証は、終了コードが0以外なら失敗する。 | evidence_claim | gate | src/runtime/full-regression-shards.ts:258-258 |
| `RD01-254` | logical DB receipt検証は、本体またはreplayのcheckpoint母集団がvalid=trueでなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:228-229 |
| `RD01-256` | logical DB receipt検証は、本体またはreplayのstale母集団がvalid=trueでなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:231-232 |
| `RD01-257` | logical DB receipt検証は、本体またはreplayのorphan母集団がvalid=trueでなければ不正とする。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:233-234 |
| `RD01-281` | review候補検証は、receiptのcomment URLが取得commentのURLと異なれば拒否する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:532-534 |
| `RD01-293` | merge後再読判定は、PRのMERGED状態を観測できなければverifiedにしない。 | review_merge | gate | src/runtime/github-cross-review-admission.ts:708-708; src/runtime/github-cross-review-admission.ts:742-746 |
| `RD01-339` | impact判定とreceipt検証は、selectedとdeferredが重複する場合に失敗し、判定生成時には両集合の和が全inventoryと異なる場合も失敗する。 | process_gate | gate | src/runtime/impact-ci.ts:453-457; src/runtime/impact-ci.ts:508-508 |
| `RD01-344` | CI profile receipt検証は、terminal receiptのresult集合がselected集合と完全一致しなければ失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:510-511 |
| `RD01-345` | CI profile receipt検証は、terminal receiptに終了コード0以外のresultがあれば失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:512-513 |
| `RD01-350` | 実行時間percentile計算は、profile・実行surface・environment digest・cache classが異なるsampleを混ぜた場合に失敗する。 | evidence_claim | gate | src/runtime/impact-ci.ts:565-569 |
| `RD02-038` | ACP transcript検証器は、promptのstopReasonがend_turnでない場合に拒否する。 | evidence_claim | gate | src/runtime/independent-review-fallback.ts:977-978 |
| `RD02-141` | run/debug解析器は、runtime surface・correlation ID・evidence pathが欠ける場合にblockedとする。 | evidence_claim | gate | src/runtime/legacy-adoption.ts:346-363 |
| `RD02-142` | run/debug解析器は、期待actionの文字列が観測証拠に見つからない場合にincompleteとする。 | evidence_claim | gate | src/runtime/legacy-adoption.ts:352-359 |
| `RD02-152` | workflow対応付け器は、pillarの重複計数がある場合にharden_requiredとする。 | process_gate | gate | src/runtime/legacy-adoption.ts:477-479 |
| `RD02-158` | 学習feedback判定器は、学習結果で受入をcloseする要求を拒否する。 | evidence_claim | gate | src/runtime/legacy-adoption.ts:516-521 |
| `RD02-179` | probe実行器は、probeがtimeoutした場合にblocked receiptを返す。 | process_gate | gate | src/runtime/lint-effect-executor.ts:374-379 |
| `RD02-180` | probe実行器は、終了コードが0でない場合にblocked receiptを返す。 | process_gate | gate | src/runtime/lint-effect-executor.ts:374-379 |
| `RD02-181` | probe実行器は、実行portが例外を投げる場合にuncertain receiptを返す。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:400-418 |
| `RD02-184` | artifact生成器は、部分書込み、非durable、変更path不一致、前後digest不一致のいずれかがある場合にuncertainとする。 | evidence_claim | gate | src/runtime/lint-effect-executor.ts:471-484 |
| `RD02-248` | provider終了判定器は、timeoutした実行を終了コード0でも失敗とする。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:67-79 |
| `RD02-249` | provider終了判定器は、直接の子の終了後にprocess treeが残留した実行を失敗とする。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:74-74 |
| `RD02-251` | provider終了判定器は、子processとprocess groupの回収が確認されていない場合に失敗とする。 | tooling_runtime | gate | src/runtime/provider-process-lifecycle.ts:76-76; src/runtime/provider-process-lifecycle.ts:127-133 |
| `RD02-321` | 保存manifest生成器は、申告schema検証結果が内容を再検証した結果と一致しない場合に拒否する。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:601-615 |
| `RD02-323` | 保存整合性判定器は、schema検証・query・exportのいずれかが失敗している資産をinvalid evidenceとする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:710-714; src/runtime/retirement-preserve.ts:744-759 |
| `RD02-325` | 保存整合性判定器は、schema検証件数が1でない場合にinvalid evidenceとする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:717-717 |
| `RD02-326` | 保存整合性判定器は、queryまたはexport件数がmanifestの該当kind件数と異なる場合にinvalid evidenceとする。 | evidence_claim | gate | src/runtime/retirement-preserve.ts:718-719 |
| `RD03-007` | 引用receipt接合評価は、terminal昇格PLANの技術承認にreceipt_urlがない場合、拒否する。 | evidence_claim | gate | src/runtime/review-receipt-plan-binding.ts:184-188 |
| `RD03-008` | 引用receipt接合評価は、PLANが指定したURLに一致するsealed receiptが見つからない場合、拒否する。 | evidence_claim | gate | src/runtime/review-receipt-plan-binding.ts:189-195 |
| `RD03-010` | 引用receipt接合評価は、PLANとreceiptのverdictを正規化した結果が一致しない場合、拒否する。 | review_merge | gate | src/runtime/review-receipt-plan-binding.ts:208-211; src/runtime/review-receipt-plan-binding.ts:235-239 |
| `RD03-074` | capacity証拠のadmissionは、正の整数のclaimed capacityまたは空でないfixture pathを欠く場合、拒否する。 | evidence_claim | gate | src/runtime/slot-scheduler-quota-handover.ts:620-630 |
| `RD03-075` | capacity証拠のadmissionは、lane countが整数でないかclaimed capacity未満の場合、拒否する。 | evidence_claim | gate | src/runtime/slot-scheduler-quota-handover.ts:631-637 |
| `RD03-213` | guard governance評価は、未実装surfaceをcoveredと主張した場合、不合格にする。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:181-185 |
| `RD03-216` | green evidence評価は、hashだけを更新したrestampの場合、closedを認めない。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:214-217 |
| `RD03-217` | green evidence評価は、commandが空またはexit statusが0でない場合、closedを認めない。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:218-220 |
| `RD03-218` | green evidence評価は、output digestまたはevidence pathが空の場合、closedを認めない。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:221-223 |
| `RD03-227` | runtime matcher証拠評価は、期待値だけの入力をcoveredと認めずunverifiedにする。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:279-282 |
| `RD03-228` | runtime matcher証拠評価は、runtime surface・実際のtool event・matcherのいずれかが空の場合、unverifiedにする。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:283-289 |
| `RD03-231` | runtime matcher証拠評価は、guard resultがない場合、unverifiedにする。 | evidence_claim | gate | src/runtime/upstream-adoption.ts:294-295 |
| `RD04-014` | 親受入判定器は、委譲receiptが無い、または検証できない場合に受入を拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:363-369 |
| `RD04-015` | 親受入判定器は、terminal receiptが無い場合に受入を拒否する。 | process_gate | gate | src/runtime/work-graph-receipt-acceptance.ts:370-372 |
| `RD04-016` | 親受入判定器は、terminal receiptのライフサイクル検証に失敗した場合に拒否する。 | evidence_claim | gate | src/runtime/work-graph-receipt-acceptance.ts:373-375 |
| `RD04-040` | blind packet作成器は、出力と現在のadmissionから封印済み実行originを解決できない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:170-171 |
| `RD04-041` | blind packet作成器は、候補出力が指定benchmark executionに結び付いていない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:172-174 |
| `RD04-043` | blind packet作成器は、観測capabilityを候補出力へ結び付けられない場合に拒否する。 | evidence_claim | gate | src/runtime/worker-blind-benchmark.ts:183-184 |
| `RD04-217` | 承認検証command lintは、matrixの各行についてsource metadata検証を呼び、その違反を失敗へ含める。 | evidence_claim | lint | src/lint/action-binding-approval-readiness.ts:871-884 |
| `RD04-232` | backfill lintは、監査ID集合が提供された場合、旧条件付きbackfill債務allowlistと監査表のどちらか片方にしか存在しないPLANを違反とする。 | evidence_claim | lint | src/lint/backfill-pairing.ts:288-298; src/lint/backfill-pairing.ts:307-312 |
| `RD05-052` | completion-decision-packetは、decisionCountがdecisions配列の件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:367-372 |
| `RD05-058` | completion-decision-packetは、humanReviewBundleのdecisionCountが元packetのdecisions件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:405-410 |
| `RD05-060` | completion-decision-packetは、humanReviewBundleのcompletionClaimAllowedが元packetのokと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:417-422 |
| `RD05-063` | completion-decision-packetは、semanticMeaningSummaryが欠落している場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:436-443 |
| `RD05-064` | completion-decision-packetは、意味summaryのfrontierRecordCountがsemanticFeatureFrontierRecords件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:445-450 |
| `RD05-065` | completion-decision-packetは、意味summaryのconfirmedCurrentMeaningRecordCountがconfirmedCurrentMeaningRecords件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:451-456 |
| `RD05-066` | completion-decision-packetは、意味summaryのcompletionClaimAllowedがpacket.okと一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:457-462 |
| `RD05-108` | completion-decision-packetは、required recordのsourcePathsが非配列または空の場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:909-914 |
| `RD05-113` | completion-decision-packetは、source ledger検査のpathが当該recordのsourcePathsに含まれない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:945-950 |
| `RD05-115` | completion-decision-packetは、読取り対象台帳に指定labelの確認日がない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:960-966 |
| `RD05-136` | completion-review-bundleは、completionClaimAllowed・humanDecisionRequired・nextAuthority・status・decisionCountの各値がdecision packetの対応値と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/completion-decision-packet.ts:1972-1986 |
| `RD05-138` | completion-review-bundleは、reviewCoveredBlockersが各decisionのblockerで被覆される全体blockerの列と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:1994-2014 |
| `RD05-139` | completion-review-bundleは、nonPacketBlockersが各decisionで被覆されない全体blockerの列と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:1994-2014 |
| `RD05-143` | completion-review-bundleは、reviewPacketCountがdecision packetから導出したreview packet件数と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:2043-2049 |
| `RD05-144` | completion-review-bundleは、reviewPackets配列の件数がdecision packetから導出した件数と一致しない場合、失敗させる。 | review_merge | lint | src/lint/completion-decision-packet.ts:2050-2055 |
| `RD05-172` | cutover-readinessは、audit_recordにcommand、hash/git、approver、result/結果、rollbackの各語群が揃わない場合、失敗させる。 | evidence_claim | lint | src/lint/cutover-readiness.ts:428-440 |
| `RD05-174` | cycle-p4-verificationは、対象文書に指定のCycle P4 closure matrix節がない、または節本文が空の場合、違反にする。 | process_gate | lint | src/lint/cycle-p4-verification.ts:43-44; src/lint/cycle-p4-verification.ts:158-163 |
| `RD05-175` | cycle-p4-verificationは、closure matrixにheaderと少なくとも一行の表がない場合、違反にする。 | process_gate | lint | src/lint/cycle-p4-verification.ts:164-168 |
| `RD05-176` | cycle-p4-verificationは、表headerにrequirement・scope・required evidence・current evidence・automation owner・statusのいずれかがない場合、違反にする。 | evidence_claim | lint | src/lint/cycle-p4-verification.ts:170-182 |
| `RD05-177` | cycle-p4-verificationは、表行の要件・scope・必須証拠・現在証拠・automation ownerのいずれかが空の場合、違反にする。 | evidence_claim | lint | src/lint/cycle-p4-verification.ts:184-198 |
| `RD05-180` | cycle-p4-verificationは、current evidenceに認識可能なbacktick付き証拠pathがない、または抽出したpathが一つでも不存在の場合、違反にする。 | evidence_claim | lint | src/lint/cycle-p4-verification.ts:122-148; src/lint/cycle-p4-verification.ts:206-209 |
| `RD05-181` | cycle-p4-verificationは、文書ごとに11件の所定要件行のいずれかが認識済み行に含まれない場合、違反にする。 | process_gate | lint | src/lint/cycle-p4-verification.ts:51-63; src/lint/cycle-p4-verification.ts:222-227 |
| `RD05-183` | cycle-p4-verificationのメッセージ生成は、checkedが0の場合、closure audit不在のviolationを返す。 | evidence_claim | lint | src/lint/cycle-p4-verification.ts:242-257 |
| `RD05-189` | db-projection-coverageは、検査するtable要件が0件の場合、失敗させる。 | evidence_claim | lint | src/lint/db-projection-coverage.ts:159-174 |
| `RD05-192` | db-projection-ingestionは、検査する必須table要件集合が空の場合、失敗させる。 | evidence_claim | lint | src/lint/db-projection-ingestion.ts:138-153 |
| `RD05-253` | descent-obligationは、L8義務が充足していても、対応するactiveテスト設計の引用がすべて一括FR範囲展開由来の場合、thin-coverage advisoryを返す。FR unit coverage正本にoracleがある項目は後段で除外し、残るadvisoryもokを変更しない。 | evidence_claim | lint | src/lint/descent-obligation.ts:456-486; src/lint/descent-obligation.ts:495-511; src/lint/descent-obligation.ts:514-525 |
| `RD06-011` | lintは、現行実装資産の参照先が存在しない、または通常ファイルでない場合、失敗させる。 | evidence_claim | lint | src/lint/design-artifact-source-digest.ts:325-330 |
| `RD06-019` | design-coverage lintは、期待source集合が指定されているとき、itemのsourceがその集合に含まれなければ失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:287-292 |
| `RD06-021` | design-coverage lintは、status=naのitemに空白以外のna_reasonがない場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:303-310 |
| `RD06-022` | design-coverage lintは、na_reasonが10文字未満、またはN/A・対象外・不要等の禁止句に一致する場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:53-55; src/lint/design-coverage.ts:311-317 |
| `RD06-023` | design-coverage lintは、status=doneのitemに有効なartifact指定が一つもない場合、失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:198-204; src/lint/design-coverage.ts:320-327 |
| `RD06-025` | design-coverage lintは、許可範囲内にあるdoneのartifactが存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:342-348 |
| `RD06-028` | design-coverage lintは、baselineに登録された文書が実在設計文書集合にない場合、失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:381-389 |
| `RD06-030` | design-coverage lintは、期待source集合が指定されているとき、対応itemがないsourceがあれば失敗させる。 | evidence_claim | lint | src/lint/design-coverage.ts:404-415 |
| `RD06-031` | design-coverage lintは、itemsが空でないのにdoneとtodoの合計が0の場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:417-425 |
| `RD06-038` | design-reality-binding lintは、failure witnessの実装参照先が存在しない、または実パスがリポジトリ外の場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:705-708 |
| `RD06-039` | design-reality-binding lintは、failure witnessのsource_symbolに対応する本体付きトップレベル関数宣言が実装にない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:415-427; src/lint/design-reality-binding.ts:709-711 |
| `RD06-042` | design-reality-binding lintは、failure witnessのテスト参照先が存在しない、または実パスがリポジトリ外の場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:727-730 |
| `RD06-059` | design-reality-binding lintは、existing_runtime資産が存在しない、または実パスがリポジトリ外の場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:881-883 |
| `RD06-062` | design-reality-binding lintは、TypeScript資産のresource_nameがexportされていない、または型・値の区分が宣言と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:318-347; src/lint/design-reality-binding.ts:889-894 |
| `RD06-063` | design-reality-binding lintは、json_schema資産のJSON内にresource_nameと完全一致するキーまたは値がない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:406-413; src/lint/design-reality-binding.ts:895-898 |
| `RD06-065` | design-reality-binding lintは、cli_command資産のresource_nameをソース内のコマンド登録から確認できない場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:349-403; src/lint/design-reality-binding.ts:903-907 |
| `RD06-081` | doc-consistency lintは、NFR文書に件数宣言があり、一意なNFR定義行数と異なる場合、件数不一致として返す。 | evidence_claim | lint | src/lint/doc-consistency.ts:130-145 |
| `RD06-082` | doc-consistency lintは、L3柱別機能要求にhelix completion review-bundle --jsonの記載がない場合、不足として返す。 | process_gate | lint | src/lint/doc-consistency.ts:151-156; src/lint/doc-consistency.ts:202-204 |
| `RD06-084` | doc-consistency lintは、L6セットアップ設計のverificationCommands以降にhelix completion review-bundle --jsonがない場合、不足として返す。 | process_gate | lint | src/lint/doc-consistency.ts:162-167; src/lint/doc-consistency.ts:202-204 |
| `RD06-115` | drive-db-registration lintは、期待PLAN件数が指定され、実登録件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/drive-db-registration.ts:86-91 |
| `RD06-137` | drive-model-passageのメッセージ生成器は、検査文書数が0の場合、通過証明表不在のviolationメッセージを返す。ただしanalyzerのokは空入力だけではfalseにならない。 | process_gate | lint | src/lint/drive-model-passage.ts:128-146 |
| `RD06-184` | FR registry監査lintは、総件数宣言が存在し、実際の要求行数と異なる場合、件数不一致として返す。 | evidence_claim | lint | src/lint/fr-registry-audit.ts:201-209 |
| `RD06-185` | FR registry監査lintは、P0件数宣言が存在し、実際のP0要求行数と異なる場合、件数不一致として返す。 | evidence_claim | lint | src/lint/fr-registry-audit.ts:202-212 |
| `RD06-186` | FR registry監査lintは、P1件数宣言が存在し、実際のP1要求行数と異なる場合、件数不一致として返す。 | evidence_claim | lint | src/lint/fr-registry-audit.ts:203-215 |
| `RD06-187` | FR registry監査lintは、P2件数宣言が存在し、実際のP2要求行数と異なる場合、件数不一致として返す。 | evidence_claim | lint | src/lint/fr-registry-audit.ts:204-218 |
| `RD06-188` | fr-roadmap-coverage lintは、closedの残存機能行がある文書にclosure証跡sectionがない、またはその本文が空の場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:144-152; src/lint/fr-roadmap-coverage.ts:279-281 |
| `RD06-189` | fr-roadmap-coverage lintは、必要なclosure証跡sectionにheaderとデータ行を持つ表がない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:153-157 |
| `RD06-190` | fr-roadmap-coverage lintは、closure証跡表にbucket・PLAN/WBS・L7 source・test/oracle・coverage gate・statusの所定headerが揃わない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:158-170 |
| `RD06-191` | fr-roadmap-coverage lintは、closure証跡行のbucket・PLAN・source・test・gateが空、またはstatusを許可状態に解釈できない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:172-187 |
| `RD06-198` | fr-roadmap-coverage lintは、各文書にR1からR9までの期待bucketが揃わない場合、失敗させる。 | process_gate | lint | src/lint/fr-roadmap-coverage.ts:70-70; src/lint/fr-roadmap-coverage.ts:283-288 |
| `RD06-199` | fr-roadmap-coverage lintは、closedの行に同一文書・同一bucketのclosure証跡行がない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:291-298 |
| `RD06-200` | fr-roadmap-coverage lintは、closedの残存機能行に対応するclosure証跡行がclosedでない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:299-301 |
| `RD06-201` | fr-roadmap-coverage lintは、closed項目のclosure証跡からPLAN/WBS参照パスを抽出できない場合、失敗させる。空またはN/Aも拒否する。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:131-136; src/lint/fr-roadmap-coverage.ts:302-303 |
| `RD06-202` | fr-roadmap-coverage lintは、closed項目のclosure証跡からsource参照パスを抽出できない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:131-136; src/lint/fr-roadmap-coverage.ts:307-308 |
| `RD06-203` | fr-roadmap-coverage lintは、closed項目のclosure証跡からtest参照パスを抽出できない場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:131-136; src/lint/fr-roadmap-coverage.ts:312-313 |
| `RD06-204` | fr-roadmap-coverage lintは、closed項目のPLAN・source・test参照から抽出したパスが存在しない場合、失敗させる。複数target記載時は各欄の最初のtargetだけを確認する。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:131-142; src/lint/fr-roadmap-coverage.ts:304-315 |
| `RD06-205` | fr-roadmap-coverage lintは、closed項目のcoverage gate欄がMarkdown除去後に空の場合、失敗させる。 | evidence_claim | lint | src/lint/fr-roadmap-coverage.ts:124-129; src/lint/fr-roadmap-coverage.ts:317-319 |
| `RD06-207` | fr-roadmap-coverageのメッセージ生成器は、検査文書数が0の場合、残存bucket表不在のviolationメッセージを返す。ただしanalyzerのokは空入力だけではfalseにならない。 | process_gate | lint | src/lint/fr-roadmap-coverage.ts:322-348 |
| `RD07-003` | frontend-design-coverageは、body=presentの設計文書について、パスが未定義または実ファイルが存在しなければ失敗する。 | evidence_claim | lint | src/lint/frontend-design-coverage.ts:133-141 |
| `RD07-013` | g10-ux-workflowは、G10 UX証拠manifestが一件もなければ失敗する。 | evidence_claim | lint | src/lint/g10-ux-workflow.ts:120-122 |
| `RD07-016` | g10-ux-workflowは、必須UXV coverageのadvisor_evidenceが、そのfamilyに対応するreceipt接頭辞を持たなければ失敗する。 | evidence_claim | lint | src/lint/g10-ux-workflow.ts:58-62; src/lint/g10-ux-workflow.ts:133-146 |
| `RD07-026` | g8-integration-workflowは、manifestにコマンド記録が一件もなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:218-220 |
| `RD07-027` | g8-integration-workflowは、manifestの必須IT一覧が空なら失敗する。 | process_gate | lint | src/lint/g8-integration-workflow.ts:221-223 |
| `RD07-029` | g8-integration-workflowは、コマンド記録のcommand_id・command・runner・scopeのいずれかが空なら失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:229-232 |
| `RD07-030` | g8-integration-workflowは、証拠コマンドのexit_codeが0でなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:233-237 |
| `RD07-033` | g8-integration-workflowは、必須ITに対応するcoverage記録がなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:254-259 |
| `RD07-035` | g8-integration-workflowは、必須IT coverageの証拠パス一覧またはコマンドID一覧が空なら失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:265-269 |
| `RD07-036` | g8-integration-workflowは、必須IT coverageの各証拠パスについて観測結果がokでなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:270-275 |
| `RD07-038` | g8-integration-workflowは、必須IT coverageがmanifest内に存在しないcommand_idを参照すれば失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:282-286 |
| `RD07-039` | g8-integration-workflowは、必須IT coverageが参照したコマンドのit_idsに当該ITが含まれなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:287-295 |
| `RD07-040` | g8-integration-workflowは、all_mandatory_passedの申告がcoverageから算出した全件成功状態と一致しなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:299-309 |
| `RD07-041` | g8-integration-workflowは、failed_mandatory_countの申告がcoverageから算出した必須IT失敗数と一致しなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:299-314 |
| `RD07-049` | g8-integration-workflowは、読み込んだ結合検証証拠manifestが一件もなければ失敗する。 | evidence_claim | lint | src/lint/g8-integration-workflow.ts:83-89; src/lint/g8-integration-workflow.ts:180-192; src/lint/g8-integration-workflow.ts:362-364 |
| `RD07-055` | g9-system-workflowは、システム検証証拠manifestが一件もなければ失敗する。 | evidence_claim | lint | src/lint/g9-system-workflow.ts:126-128 |
| `RD07-060` | 証拠コマンド検査は、commandにvitest runの実行形式がなければ違反とする。 | tooling_runtime | lint | src/lint/gn-evidence-manifest.ts:164-166 |
| `RD07-061` | 証拠コマンド検査は、commandに--reporter=jsonがなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:167-169 |
| `RD07-062` | 証拠コマンド検査は、commandから対象テストパスを一件も抽出できなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:144-147; src/lint/gn-evidence-manifest.ts:170-173 |
| `RD07-063` | 証拠コマンド検査は、commandが--outputFileで申告されたevidence_pathを指定していなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:174-176 |
| `RD07-064` | 証拠コマンド検査は、evidence_pathの観測結果が未提供またはokでなければ違反として拒否する。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:177-183 |
| `RD07-066` | 証拠コマンド検査は、証拠がVitest JSON reportでない、成功していない、失敗テストが0件でない、または成功テストが1件未満なら拒否する。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:187-197 |
| `RD07-067` | 証拠コマンド検査は、commandが宣言した各テストパスに末尾一致するファイルがreportになければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:198-202 |
| `RD07-071` | 共通gate証拠検査は、manifestのcommandsが空なら違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:221-223 |
| `RD07-072` | 共通gate証拠検査は、manifestのmandatory_item_idsが空なら違反とする。 | process_gate | lint | src/lint/gn-evidence-manifest.ts:224-226 |
| `RD07-074` | 共通gate証拠検査は、コマンドのcommand_id・command・runner・scopeのいずれかが空なら違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:232-235 |
| `RD07-075` | 共通gate証拠検査は、コマンドのexit_codeが0でなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:236-240 |
| `RD07-079` | 共通gate証拠検査は、必須itemに対応するcoverageがなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:264-269 |
| `RD07-081` | 共通gate証拠検査は、必須coverageのevidence_pathsまたはcommand_idsが空なら違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:275-279 |
| `RD07-082` | 共通gate証拠検査は、必須coverageが未知のcommand_idを参照すれば違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:280-284 |
| `RD07-083` | 共通gate証拠検査は、必須coverageが参照するコマンドのitem_idsに当該itemが含まれなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:285-294 |
| `RD07-084` | 共通gate証拠検査は、必須coverageの証拠パスについて観測結果がokでなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:296-301 |
| `RD07-086` | 共通gate証拠検査は、requireAdvisorEvidenceが有効な場合、必須coverageにadvisor_evidenceがなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:308-312 |
| `RD07-087` | 共通gate証拠検査は、all_mandatory_passedの申告が必須coverageから算出した全件成功状態と一致しなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:315-325 |
| `RD07-088` | 共通gate証拠検査は、failed_mandatory_countの申告が必須coverageから算出した失敗数と一致しなければ違反とする。 | evidence_claim | lint | src/lint/gn-evidence-manifest.ts:315-330 |
| `RD07-136` | handover退役棚卸しは、走査ファイル数が0以下ならretirementReadyをtrueにしない。 | process_gate | lint | src/lint/handover-retirement.ts:351-356 |
| `RD07-137` | handover退役棚卸しは、参照件数が0ならretirementReadyをtrueにしない。 | process_gate | lint | src/lint/handover-retirement.ts:351-356 |
| `RD07-170` | identifier-renameの切替計画は、source ledgerに確認日がない、または委譲した確認日検査が違反を返す場合に準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2757-2761; src/lint/identifier-rename.ts:2412-2416 |
| `RD07-171` | identifier-renameの切替計画は、source ledgerに要求された出典行が一つでも欠ければ準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2762-2766; src/lint/identifier-rename.ts:2417-2421 |
| `RD07-177` | identifier-renameの切替計画は、runbook証拠またはrestore証拠が存在しないか通常ファイルでなければ準備完了にしない。 | evidence_claim | lint | src/lint/identifier-rename.ts:2323-2361; src/lint/identifier-rename.ts:2437-2444 |
| `RD07-182` | identifier-renameのevidence-packは、静的・状態gateと全回帰テストの成功出力を代替生成せず、実コマンド証拠が必要なpending artifactとして残す。 | evidence_claim | lint | src/lint/identifier-rename.ts:1744-1751; src/lint/identifier-rename.ts:1792-1804 |
| `RD07-199` | Issue closure graph監査は、canonical契約に対応するcompletion receiptが一件もなければ失敗する。 | evidence_claim | lint | src/lint/issue-closure-graph.ts:241-250 |
| `RD07-200` | Issue closure graph監査は、一つのcanonical契約にcompletion receiptが複数あれば失敗する。 | evidence_claim | lint | src/lint/issue-closure-graph.ts:251-258 |
| `RD07-206` | Issue closure graph監査は、snapshotのreceiptがcanonical契約集合に宣言されていないcontract_idを持つ場合に失敗する。 | evidence_claim | lint | src/lint/issue-closure-graph.ts:331-340 |
| `RD08-003` | inventory lifecycle lintは、inventory第6節または第7節の宣言件数が箇条書きpath数と一致しない場合、宣言欠落も含め失敗させる。 | evidence_claim | lint | src/lint/l12-hybrid-inventory-lifecycle.ts:75-90 |
| `RD08-006` | L14 close audit lintは、解析した監査表が見出しとデータ行を合わせて2行未満の場合、監査matrix欠落として失敗させる。 | process_gate | lint | src/lint/l14-close-audit.ts:144-155 |
| `RD08-010` | L14 close audit lintは、指定監査項目のevidenceセルに、その項目へ割り当てた必須pathのバッククォート付き引用がない場合、失敗させる。 | evidence_claim | lint | src/lint/l14-close-audit.ts:46-81; src/lint/l14-close-audit.ts:199-202 |
| `RD08-011` | L14 close audit lintは、引用済みの必須証跡pathがrepo内で存在確認できない場合、失敗させる。repoRoot欠落、絶対path、repo外へ出るpathも確認失敗とする。 | evidence_claim | lint | src/lint/l14-close-audit.ts:130-135; src/lint/l14-close-audit.ts:199-204 |
| `RD08-013` | L14 close audit lintは、closed以外の指定監査行でgapが「なし」またはnoneの場合、失敗させる。 | evidence_claim | lint | src/lint/l14-close-audit.ts:211-213 |
| `RD08-015` | L14 close audit lintは、各監査行のevidenceセルからpathとして抽出した引用がrepo内に存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/l14-close-audit.ts:130-141; src/lint/l14-close-audit.ts:222-231 |
| `RD08-024` | L6 completion判定器は、confirmedのL6 design PLANにhasReviewEvidenceで認められる証跡がない場合、readyをfalseにする。 | review_merge | lint | src/lint/l6-completion.ts:136-139; src/lint/l6-completion.ts:151-162 |
| `RD08-042` | left-arm carry lintは、review_bindingのreviewerとreviewed_atに一致し、approve・approve_after_fixes・passのいずれかを持つレビューがない場合、失敗させる。 | review_merge | lint | src/lint/left-arm-carry-log.ts:182-190; src/lint/left-arm-carry-log.ts:244-251 |
| `RD08-049` | left-arm carry lintは、指摘証跡pathが正規相対pathでない、またはfileDigestsに存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:167-173; src/lint/left-arm-carry-log.ts:295-303 |
| `RD08-051` | left-arm carry lintは、複数carry entryが同じfinding_evidence.pathを再利用する場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:316-324 |
| `RD08-061` | left-arm carry lintは、gate再通過のcommand・完了日時・証跡path・digest・exit codeが一致するgreen_commandsを解消PLANの承認レビューに見つけられない場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:391-410 |
| `RD08-064` | left-arm carry lintは、gate再通過のcommandまたはcompleted_atが空の場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:434-435 |
| `RD08-066` | left-arm carry lintは、gate再通過のexit_codeが0でない場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:444-451 |
| `RD08-067` | left-arm carry lintは、gate証跡pathが正規相対pathでない、またはfileDigestsに存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/left-arm-carry-log.ts:452-460 |
| `RD08-102` | semantic consumer lintは、entry.pathに一致するsourceファイルが入力集合にない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:429-432 |
| `RD08-103` | semantic consumer lintは、対象source本文でline_anchorを解決できない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:433-435 |
| `RD08-104` | semantic consumer lintは、対象source本文にsymbol_or_commandが含まれない場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:436-437 |
| `RD08-111` | semantic consumer lintは、必須capabilityのline_anchorが固定期待anchorと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/legacy-orchestration-semantic-consumers.ts:478-479 |
| `RD08-157` | objective evidence auditは、G-01〜G-09のいずれかの監査行がない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:372-377 |
| `RD08-158` | objective evidence auditは、G-01〜G-09の状態がprovedでない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:378-382 |
| `RD08-159` | objective evidence auditは、G-01〜G-09のobjectiveセルが空の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:383-383 |
| `RD08-160` | objective evidence auditは、G-01〜G-09のevidenceセルが空の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:384-384 |
| `RD08-161` | objective evidence auditは、G-01〜G-09のobservationセルが空の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:385-385 |
| `RD08-162` | objective evidence auditは、G-10のcompletion readiness行がない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:390-395 |
| `RD08-163` | objective evidence auditは、必須completion artifactのpathが監査本文に引用されていない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:124-132; src/lint/objective-evidence-audit.ts:397-399 |
| `RD08-164` | objective evidence auditは、引用済みの必須completion artifactがrepo内に存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:397-402 |
| `RD08-165` | objective evidence auditは、目的別必須artifact groupの各pathが監査本文に引用されていない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:134-235; src/lint/objective-evidence-audit.ts:405-408 |
| `RD08-166` | objective evidence auditは、引用済みの目的別必須artifactがrepo内に存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:405-410 |
| `RD08-167` | objective evidence auditは、requireTracked指定groupの成果物について、trackedFilesが得られているのにGit追跡集合に含まれない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:164-193; src/lint/objective-evidence-audit.ts:411-417 |
| `RD08-169` | objective evidence auditは、completionReadinessがblockedなのにproved行が10件以上ある場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:432-437 |
| `RD08-170` | objective evidence auditは、証跡binding manifest本文が欠落または空の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:460-469 |
| `RD08-179` | objective evidence auditは、G-01〜G-09のいずれかに有効なsubstance bindingがない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:545-547 |
| `RD08-181` | objective evidence auditは、evidenceセルにbinding先pathのバッククォート付き引用がない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:587-591 |
| `RD08-182` | objective evidence auditは、observationセルにbindingのobservation markerがない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:592-594 |
| `RD08-183` | objective evidence auditは、binding先pathの固定観測がevidenceObservationsにない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:596-600 |
| `RD08-184` | objective evidence auditは、binding先証跡の固定観測がok=falseの場合、bytes unavailableとして失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:601-606 |
| `RD08-186` | objective evidence auditは、証跡digestが一致していても、観測bytes数がbindingのminimumSizeBytes未満の場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:609-613 |
| `RD08-190` | objective evidence auditは、externalObservedが渡された場合、期待する3 sourceのいずれかの観測値が未定義なら失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:642-651 |
| `RD08-191` | objective evidence auditは、外部source ledgerに期待する3 sourceのいずれかの行がない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:652-657 |
| `RD08-194` | objective evidence auditは、externalObservedに観測値があるsourceでledgerのobservedと完全一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:670-675 |
| `RD08-197` | objective progress判定器は、auditOkがtrueかつauditViolationCountが0でなければ、進捗証跡をtrustedと認めず診断値として扱う。引数省略時も未信頼とする。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:746-776 |
| `RD08-198` | objective progress判定器は、completionReadinessがblockedの場合、proved要件数を最大9件、進捗を最大90%に制限する。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:751-759 |
| `RD08-199` | objective progress判定器は、進捗証跡がtrusted、completionReadiness.ok=true、進捗100%の全条件が揃う場合だけcompletionClaimAllowedをtrueにする。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:763-776 |
| `RD08-200` | objective evidence auditは、G-10行の状態がcompletionReadiness.ok=trueならproved、falseならblockedという期待値と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:797-808 |
| `RD08-201` | objective evidence auditは、G-10行に実際の真偽値を伴うoutstanding.completionReadiness.ok markerがない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:802-810 |
| `RD08-202` | objective evidence auditは、G-10行にoutstanding snapshot pathの引用がない場合、失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:812-816 |
| `RD08-203` | objective evidence auditは、G-10行が存在する場合、outstanding snapshot検査の違反を監査違反へ取り込み、snapshot不整合でも失敗させる。 | evidence_claim | lint | src/lint/objective-evidence-audit.ts:817-821 |
| `RD08-206` | outstanding snapshot検査は、snapshot本文がnullの場合、committed snapshot欠落として失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:110-117 |
| `RD08-210` | outstanding snapshot検査は、live outstandingのdecision件数と重複除去済みPLAN ID数が一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:28-35; src/lint/outstanding-snapshot.ts:131-136 |
| `RD08-211` | outstanding snapshot検査は、snapshotのdecision_countがlive outstanding件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:137-141 |
| `RD08-215` | outstanding snapshot検査は、decision_countが文字列要素だけを取り出したplan_idsの件数と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:157-162 |
| `RD08-217` | outstanding snapshot検査は、live未完了PLANがsnapshotのplan_idsに含まれない場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:167-172 |
| `RD08-218` | outstanding snapshot検査は、snapshotのplan_idsにliveでは未完了でないPLANが含まれる場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:173-178 |
| `RD08-222` | outstanding snapshot検査は、文字列blockerをソートした集合がlive blocker集合と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:186-198 |
| `RD08-226` | outstanding snapshot検査は、文字列required_actionsをソートした集合がlive必要対応集合と一致しない場合、失敗させる。 | evidence_claim | lint | src/lint/outstanding-snapshot.ts:207-218 |
| `RD09-001` | outstanding集計は、非終端PLANにconsumer setup限定の境界がある場合、consumer_setup_boundaryを完了阻害理由として返す。 | evidence_claim | lint | src/lint/outstanding.ts:802-813; src/lint/outstanding.ts:1183-1211 |
| `RD09-002` | outstanding集計は、非終端PLANにversion_targetがある場合、version_up_parkedを完了阻害理由として返す。 | process_gate | lint | src/lint/outstanding.ts:814-818; src/lint/outstanding.ts:897-913 |
| `RD09-008` | outstanding集計は、他の阻害理由に該当しない非終端PLANにもactive_draftを付け、未了として保持する。archivedと終端statusは集計対象外とする。 | evidence_claim | lint | src/lint/outstanding.ts:487-500; src/lint/outstanding.ts:833-835 |
| `RD09-009` | completionReadinessは、非終端PLANが1件以上ある場合、non_terminal_plansを追加して全体完了判定をblockedにする。 | evidence_claim | lint | src/lint/outstanding.ts:1323-1327; src/lint/outstanding.ts:1370-1381 |
| `RD09-010` | completionReadinessは、openなplaceholder/spec-backfill deferが残る場合、全体完了判定をblockedにし、deferの解消を要求する。 | evidence_claim | lint | src/lint/outstanding.ts:1323-1327; src/lint/outstanding.ts:1340-1346; src/lint/outstanding.ts:1370-1381 |
| `RD09-011` | completionReadinessは、completionClaimAllowed=falseのsemantic frontier recordがある場合、semantic_frontier_blockedと各recordの阻害理由を追加して全体完了判定をblockedにする。 | evidence_claim | lint | src/lint/outstanding.ts:1328-1335; src/lint/outstanding.ts:1348-1354; src/lint/outstanding.ts:1370-1381 |
| `RD09-072` | V-pair authority検証は、recoveryのreasonBaselineが初期entryの実集計と異なる場合、または指定されたexpected baselineと異なる場合、失敗させる。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:757-780 |
| `RD09-073` | tombstone検証は、解消PLANがcompletedでないか、IDがtombstoneのresolution_plan_idと一致しない場合、解消証拠を拒否する。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:275-283; src/lint/plan-specific-vpair-binding.ts:649-662 |
| `RD09-074` | tombstone検証は、解消PLANのresolves_authorityが厳密な4項目を持たず、authority path・fingerprint・target PLAN・reasonが解消対象と一致しない場合、解消証拠を拒否する。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:284-294 |
| `RD09-075` | tombstone検証は、対象PLANまたは解消PLANがschema不適合、対象path不一致、対象が非impl/add-implまたはarchived、binding欠落、解消PLANが検査集合にない、または両PLANにraw findingが残る場合、解消証拠を拒否する。 | evidence_claim | lint | src/lint/plan-specific-vpair-binding.ts:295-312 |
| `RD09-143` | relation graph投影は、design catalog itemがmissingArtifactsを持つ場合、各欠落artifactについてerrorを返し、impact分析を失敗させる。 | evidence_claim | lint | src/lint/relation-graph.ts:203-210; src/lint/relation-graph.ts:712-715; src/lint/relation-graph.ts:761-767 |
| `RD09-151` | relation impact分析は、design catalog nodeがあるのにreviewed-by edgeが1件未満の場合、missing-projection errorで失敗させる。 | review_merge | lint | src/lint/relation-graph.ts:624-645 |
| `RD09-152` | relation impact分析は、design catalog nodeがあるのにvalidated-by edgeが2件未満の場合、missing-projection errorで失敗させる。 | evidence_claim | lint | src/lint/relation-graph.ts:624-645 |
| `RD09-155` | relation impact分析は、design catalog nodeがある場合、labelが(done)で終わるcatalog-itemに解決可能なcatalog-artifact edgeがないと失敗させる。 | evidence_claim | lint | src/lint/relation-graph.ts:624-626; src/lint/relation-graph.ts:657-665 |
| `RD10-020` | lintはconfirmed／completed PLANのreview entryにtests_green_atがなければ失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:966-973 |
| `RD10-022` | lintはterminal L3 PLANのGit provenanceに未追跡・履歴取得不能・日付欠落が記録されているか、初出日・最終変更日が欠ける場合に失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:772-788; src/lint/review-evidence.ts:922-924 |
| `RD10-028` | lintはgreen_commands強制対象entryにコマンド証跡がなければ失敗させる。fail判定のentryと、別entryに有効な承認・green証跡があるhuman判断は免除する。 | evidence_claim | lint | src/lint/review-evidence.ts:808-812; src/lint/review-evidence.ts:1023-1031 |
| `RD10-030` | lintは検査対象green commandのcommandが空白だけなら失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:815-815 |
| `RD10-033` | lintは歴史的Bun証跡を除き、green commandの内容が宣言kindと一致しなければ失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:824-826 |
| `RD10-035` | lintは検査対象green commandのexit_codeが0でなければ失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:828-828 |
| `RD10-036` | lintは検査対象green commandのevidence_pathが空白だけなら失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:829-829 |
| `RD10-038` | lintはcompleted_atとtests_green_atが存在し、コマンド完了がgreen宣言より後なら失敗させる。 | evidence_claim | lint | src/lint/review-evidence.ts:831-837 |
| `RD10-077` | S4 lintは証跡、review、gap、risk、外部根拠、route impactの値が「OK」「green」「問題なし」等の単独承認文言だけの場合に失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:327-341; src/lint/s4-decision-readiness.ts:552-557 |
| `RD10-078` | S4 lintはverified_evidenceが具体的なテスト・レビュー証跡locatorまたはコマンドの規定patternに合わなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:343-348; src/lint/s4-decision-readiness.ts:578-593 |
| `RD10-079` | S4 lintはexternal_source_basisが具体的なsource、PLAN、path、URL等のlocator patternに合わなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:349-354; src/lint/s4-decision-readiness.ts:560-576 |
| `RD10-080` | S4 lintはverified_evidenceまたはexternal_source_basisから抽出したpathが観測済みの通常repository fileでなければ失敗させる。 | evidence_claim | lint | src/lint/s4-decision-readiness.ts:355-361; src/lint/s4-decision-readiness.ts:669-681 |
| `RD10-128` | frontier binding検証は対象planIdのsemantic_feature_frontier_recordが一つもなければ違反を返す。 | process_gate | lint | src/lint/semantic-frontier-binding.ts:45-55 |
| `RD10-131` | frontier binding検証は一致recordのcompletionClaimAllowedがfalseでなければ違反を返す。 | evidence_claim | lint | src/lint/semantic-frontier-binding.ts:75-80 |
| `RD10-137` | frontier整合lintはL3要求表の一意ID数が51件でなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:290-296 |
| `RD10-138` | frontier整合lintはL12受入表の一意ID数が51件でなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:290-301 |
| `RD10-147` | frontier整合lintはlive confirmed record数が確定意味catalogの要素数と一致しなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:361-365 |
| `RD10-150` | frontier整合lintは確定機能recordのcompletionBoundaryがdownstream_evidence_requiredでなければ失敗させる。 | evidence_claim | lint | src/lint/semantic-frontier-consistency.ts:379-383 |
| `RD10-155` | frontier整合lintは確定機能recordのsourcePathsにL12受入文書がなければ失敗させる。 | evidence_claim | lint | src/lint/semantic-frontier-consistency.ts:406-412 |
| `RD10-158` | frontier整合lintはL3／L12文書に「PATH 解決が無い consumer でも」と「ready にでき」の両方が含まれる場合に失敗させる。 | tooling_runtime | lint | src/lint/semantic-frontier-consistency.ts:113-116; src/lint/semantic-frontier-consistency.ts:441-445 |
| `RD10-160` | frontier整合lintはlive frontier record数が実在する期待featureの数と一致しなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:448-465 |
| `RD10-165` | frontier整合lintはlive frontierのcompletionClaimAllowedがfalseでなければ失敗させる。 | evidence_claim | lint | src/lint/semantic-frontier-consistency.ts:490-492 |
| `RD10-195` | telemetry closure lintはrequirement、required evidence、current evidence、automation owner、statusの必須列が欠ける場合に失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:111-130 |
| `RD10-197` | telemetry closure lintはrequired evidenceが空または空白だけなら失敗させる。 | evidence_claim | lint | src/lint/telemetry-closure.ts:138-148 |
| `RD10-198` | telemetry closure lintはcurrent evidenceが空または空白だけなら失敗させる。 | evidence_claim | lint | src/lint/telemetry-closure.ts:138-151 |
| `RD10-204` | telemetry closureのメッセージ生成はclosed以外の行がある場合、状態別件数と対象要求を表示する。 | process_gate | lint | src/lint/telemetry-closure.ts:213-223 |
| `RD11-004` | 実行証拠の正規化処理は、statusがpassed以外、またはerrorのfindingが存在する場合にok=falseにする。 | evidence_claim | lint | src/lint/tool-adapter.ts:330-332 |
| `RD11-012` | triage lintは、固定done項目のartifactが実在しない場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:136-143 |
| `RD11-021` | triage lintは、未列挙status主張のexpected_countが10でない場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:168-170 |
| `RD11-022` | triage lintは、未列挙status主張にIDが記載されている場合、その集合が一意な10件でなければ違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:171-176 |
| `RD11-023` | triage lintは、一意な10件を列挙していない場合、stateがblocked_missing_enumerationでなければ違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:173-178 |
| `RD11-026` | triage lintは、未列挙分に既決verified集合、IMP-118、IMP-148のIDを再利用した場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:184-189 |
| `RD11-027` | triage lintは、stateがresolvedの場合、列挙IDが固定authorityの10件と一致しなければ違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:33-44; src/lint/triage-decision-integrity.ts:192-198 |
| `RD11-030` | triage lintは、固定列挙IDごとの証拠pathが3件未満、またはいずれかが実在しない場合に違反にする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:204-209 |
| `RD11-031` | triage lintは、PLANが終端扱いの場合、固定10件の列挙・resolved・implemented対象が揃わなければ違反にする。PLAN読込み失敗時も終端扱いにする。 | evidence_claim | lint | src/lint/triage-decision-integrity.ts:191-214; src/lint/triage-decision-integrity.ts:251-259 |
| `RD11-056` | profile実行処理は、runnerの終了statusが0以外またはnullの場合にfailedとする。 | evidence_claim | lint | src/lint/verification-profile.ts:291-298 |
| `RD11-097` | version-up lintは、外部境界を持つPLANのactivation_provenance_requirementsにsource ledger・dry-run・approval・auditの必須fieldが欠ける場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:526-532; src/lint/version-up-readiness.ts:1214-1220 |
| `RD11-129` | version-up lintは、activate_future_version選択時、audit_recordが未完了または具体的locatorを持たない場合に違反にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:2575-2580 |
| `RD11-138` | activation readiness検査は、外部境界がある場合、free_tier_budget_checkの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:534-536; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-145` | activation readiness検査は、外部境界がある場合、dry_run_evidenceの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:543-543; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-147` | activation readiness検査は、外部境界がある場合、provenanceのaudit_recordの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:545-545; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-148` | activation readiness検査は、外部境界がある場合、pages_limitの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:517-520; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-149` | activation readiness検査は、外部境界がある場合、workers_limitの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:520-520; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-150` | activation readiness検査は、外部境界がある場合、d1_limitの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:521-521; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-151` | activation readiness検査は、外部境界がある場合、kv_limitの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | evidence_claim | lint | src/lint/version-up-readiness.ts:522-522; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-152` | activation readiness検査は、外部境界がある場合、exceed_actionの具体的証拠が未充足ならpending_evidenceとしてblock理由にする。 | process_gate | lint | src/lint/version-up-readiness.ts:523-523; src/lint/version-up-readiness.ts:2347-2373; src/lint/version-up-readiness.ts:2436-2490 |
| `RD11-177` | terminal fullback監査は、Forward slice receiptが0件の場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:189-201 |
| `RD11-178` | terminal fullback監査は、Forward slice集合がauthorityの指定集合と一致しない、または実績・期待集合のいずれかに重複がある場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:202-216 |
| `RD11-181` | terminal fullback監査は、Forward sliceのCI run IDが正の安全な整数でない場合に失敗させる。 | evidence_claim | lint | src/lint/workflow-classification-terminal-fullback.ts:178-179; src/lint/workflow-classification-terminal-fullback.ts:234-240 |
| `RD11-189` | terminal fullback監査は、consumer名集合がauthority指定集合と一致しない、または実績・期待集合のいずれかに重複がある場合に失敗させる。 | process_gate | lint | src/lint/workflow-classification-terminal-fullback.ts:327-340 |
| `RE01-004` | 移行の検証者はcanonical側と互換側の両方の成功を要求し、互換側の成功でcanonical側の失敗を相殺してはならない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.2.md:26-31 |
| `RE01-035` | 文書作成者は正本の所在と宣言件数を明記し、L3では対象sub-document全体に適用する。宣言の不足は検証時に警告する。 | evidence_claim | lint | docs/governance/helix-harness-requirements_v1.2.md:573-577 |
| `RE01-049` | G7の検証者は四成果物、八つの必須trace edge、80%以上のcoverageをすべて満たした場合だけ通過させる。 | process_gate | gate／ci | docs/governance/helix-harness-requirements_v1.2.md:751-766; docs/governance/helix-harness-requirements_v1.2.md:1462-1474 |
| `RE01-083` | 進捗表示はテスト結果と依存関係から導出し、手動で色を変更してはならない。未充足を上流へ伝播し、未検証をgreenにしない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:1260-1262 |
| `RE01-085` | 完了を主張する者は、green commandのrunner・exit code・出力digestを記録する。 | evidence_claim | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:1281-1281; docs/governance/helix-harness-requirements_v1.2.md:2110-2120 |
| `RE01-090` | doctorはlandedした未収束実装を失敗にする。parkedによる扱いは未実装draftに限り、既存実装の免責に使ってはならない。 | process_gate | doctor | docs/governance/helix-harness-requirements_v1.2.md:1311-1316 |
| `RE01-093` | 報告者はscaffoldの成功を機能全体の実装完了として主張してはならない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:1320-1356 |
| `RE01-100` | 報告者はreadinessの実装を、tool invocation・execution・DB collector全体の実装完了として扱ってはならない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:1404-1404 |
| `RE01-111` | 担当者はPO待ち・parked・cutover待ちを隠さず、将来のfieldが記載されているだけで設計前に実装したり、未実装要求を黙って削除したりしてはならない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:1542-1551 |
| `RE01-124` | 見積の報告者は見積値を計画支援として提示し、完了時刻の約束として扱ってはならない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:1742-1742 |
| `RE01-138` | 検証者は定量的な確認を定性的判断より先に行い、RedからGreen、Greenからreviewの時系列を確認する。 | evidence_claim | gate／lint | docs/governance/helix-harness-requirements_v1.2.md:1937-1946; docs/governance/helix-harness-requirements_v1.2.md:2110-2120 |
| `RE01-155` | 失敗集計者は規定期間のGitHub artifactをN/Mの根拠とし、local failure stateやlabelだけを集計正本にしない。 | evidence_claim | prose | docs/governance/helix-harness-requirements_v1.2.md:2256-2306 |
| `RE01-180` | 性能改善担当者はbaseline・budget・workload・profile・統計方法・oracleを先にfreezeし、未計測の高速化を成果として主張しない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:112-119 |
| `RE01-194` | 測定担当者は要求・NFRごとの測定契約を用意し、必須metricが未計測・stale・非代表的・閾値未達ならcodeがgreenでも完了にしない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:247-251 |
| `RE01-195` | 測定担当者はL5で測定を設計し、L7でprobeを実装し、L8–L12で段階的に検証する。測定の再現条件とoverheadを残し、secrets・PIIを含めない。 | evidence_claim | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:247-251 |
| `RE01-202` | 報告者はimplementedとux-verifiedを区別し、画面数・route・placeholder・汎用表・screenshotだけでUX検証済みと主張しない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:275-275; docs/governance/helix-harness-requirements_v1.3.md:381-392 |
| `RE01-203` | 既存実装の評価者は要求ID・設計・oracle・evidenceへの接続を確認し、コードが存在するだけで適合済みとしない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:281-281 |
| `RE01-228` | 性能・DB分析者は実測を行い、再現していない単一原因の説明を事実として断定しない。baseline不明はunknownとしgreenにしない。 | evidence_claim | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:372-377 |
| `RE01-248` | 安全判定者はcanonical判定の失敗をlegacy側やscanner単体の成功で相殺せず、全理由をredaction済みreceiptへ残す。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:470-470 |
| `RE01-253` | 報告者は一部guardの実装成功で未完了sliceを相殺せず、promotionを敏感なcutoverの自動許可とみなさない。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:492-503 |
| `RE01-275` | 進捗計算者はorphan・dangling・duplicate・unverifiedを分母から隠さず、全要求・AC・edge・pair・findingが閉じた場合だけ100%とする。tagだけで進捗を上げない。 | evidence_claim | gate | docs/governance/helix-harness-requirements_v1.3.md:559-561 |
| `RE01-285` | レビューmodel履歴の記録者はreceiptの自己申告時刻で実観測の切替境界を上書きせず、後続receiptは整合証拠として扱う。receipt公開時刻まで観測済みの境界を遅らせない。 | evidence_claim | prose | docs/governance/reviewer-session-model-history.json:48-54 |
| `RF00-020` | stale claim復旧器は、不正またはstaleな既存復旧mutexを退避する前に、承認packet・mutex観測・digestを含むcleanup記録を書き込み、ファイルとdirectoryを同期する。 | evidence_claim | gate | src/orchestration/durable-loop-epoch-node.ts:490-519 |
| `RF00-021` | stale claim復旧器は、対象claimを削除する前に、復旧packet・claim本文・双方のdigest・復旧日時を含む監査記録をtombstoneとして公開し、ファイルとdirectoryを同期する。 | evidence_claim | gate | src/orchestration/durable-loop-epoch-node.ts:553-576 |
| `RF00-024` | receiptの停止種別判定器は、stateがrunningならrunningを優先し、それ以外でlastVerdictがpassならsuccess_stopとする。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:28-30 |
| `RF00-025` | receiptの停止種別判定器は、runningでもpassでもない場合、blockedReasonにbudgetを含むかcostUsdが0より大きければbudget_stop、それ以外はblocker_stopとする。 | evidence_claim | gate | src/orchestration/autonomous-loop-run-receipts.ts:28-32 |
| `RF01-028` | チームmodel選択器は、effortの明示指定がない場合、適応結果が標準値から実際に変化したときだけeffort_sourceをadaptiveとし、変化していなければstandardとする。 | evidence_claim | gate | src/team/model-policy.ts:214-220 |
| `RG05-014` | Operation Verificationの終了判定では、必要な証拠がcurrentであることを要求する。 | evidence_claim | config | config/drive-route-catalog.json:229-240 |
| `RG08-005` | 要求を確認する作業者は、確認範囲・訂正・未解決事項を要求文書監査記録に記録する。 | evidence_claim | prose | docs/governance/README.md:41-44 |
| `RG13-009` | packet担当者はIssue同期後のGitHub再観測をpacket PRのDB convergence receiptへ含める。 | evidence_claim | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:488-489 |
| `RG16-017` | team実行担当者は、実行後にagentの説明を信用するだけで済ませず、成果物fileの読取りとgit statusで成果物を検証する。 | evidence_claim | prose | docs/skills/agent-teams.md:89-89 |
| `RG17-007` | 作業担当者は、PLANのreview_evidenceに完了根拠を記録する際、green_commandsとdigestを残し、文章による完了宣言で代用してはならない。 | evidence_claim | prose | docs/skills/design-tailoring.md:73-81 |

## 副として対応づいた規則（547件）

`RA-167`、`RA-183`、`RA-187`、`RA-208`、`RA-223`、`RA-226`、`RA-230`、`RA-248`、`RA-249`、`RA-250`、`RA-256`、`RA-258`、`RA-259`、`RA-267`、`RA-352`、`RA-360`、`RB0-019`、`RB0-046`、`RB0-050`、`RB0-051`、`RB0-052`、`RB0-053`、`RB0-054`、`RB0-058`、`RB0-063`、`RB0-068`、`RB0-075`、`RB0-079`、`RB0-099`、`RB0-128`、`RB0-136`、`RB0-147`、`RB0-148`、`RB0-149`、`RB0-163`、`RB0-168`、`RB04-021`、`RB04-022`、`RB04-026`、`RB04-040`、`RB04-067`、`RB04-086`、`RB04-097`、`RB04-123`、`RB04-124`、`RB04-128`、`RB04-152`、`RB04-187`、`RB04-198`、`RB04-207`、`RB04-209`、`RB04-232`、`RB04-235`、`RB05-006`、`RB05-009`、`RB05-033`、`RB05-042`、`RB05-059`、`RB05-060`、`RB05-070`、`RB05-082`、`RB05-085`、`RB05-089`、`RB05-093`、`RB05-115`、`RB05-125`、`RB05-132`、`RB05-149`、`RB05-185`、`RB05-195`、`RB05-196`、`RB05-198`、`RB05-201`、`RB05-206`、`RB05-208`、`RB05-221`、`RB05-234`、`RB05-238`、`RB05-240`、`RB05-244`、`RB05-245`、`RB05-263`、`RB05-268`、`RB05-273`、`RB05-276`、`RB05-279`、`RB05-284`、`RB05-286`、`RB05-291`、`RB05-294`、`RB05-300`、`RB05-301`、`RB05-302`、`RB05-303`、`RB05-305`、`RB05-306`、`RB05-309`、`RB05-329`、`RB06-002`、`RB06-004`、`RB06-016`、`RB06-035`、`RB06-036`、`RB06-039`、`RB06-044`、`RB06-045`、`RB06-047`、`RB06-057`、`RB06-061`、`RB06-076`、`RB06-092`、`RB06-097`、`RB06-116`、`RB06-119`、`RB06-125`、`RB06-132`、`RB06-137`、`RB06-139`、`RB06-146`、`RB06-148`、`RB06-173`、`RB06-182`、`RB06-205`、`RB06-208`、`RB06-219`、`RB06-220`、`RB06-226`、`RB06-234`、`RB06-235`、`RB06-239`、`RB06-242`、`RB06-244`、`RB06-256`、`RB06-266`、`RB06-290`、`RB06-300`、`RB06-306`、`RB06-307`、`RB06-308`、`RB07-025`、`RB07-029`、`RB07-034`、`RB07-037`、`RB07-067`、`RB07-074`、`RB07-079`、`RB07-083`、`RB07-089`、`RB07-098`、`RB07-123`、`RB07-138`、`RB07-156`、`RB07-158`、`RB07-162`、`RB07-171`、`RB07-181`、`RB07-184`、`RB07-186`、`RB07-187`、`RB07-189`、`RB07-197`、`RB07-210`、`RB07-217`、`RB07-218`、`RB07-233`、`RB07-238`、`RB07-249`、`RB07-251`、`RB07-252`、`RB07-262`、`RB07-271`、`RB07-273`、`RB07-275`、`RB07-281`、`RB07-292`、`RB07-302`、`RB07-311`、`RB07-314`、`RB07-321`、`RB07-338`、`RB07-340`、`RB07-345`、`RB08-009`、`RB08-014`、`RB08-017`、`RB08-039`、`RB08-054`、`RB08-057`、`RB08-060`、`RB08-061`、`RB08-063`、`RB08-079`、`RB08-083`、`RB08-088`、`RB08-094`、`RB08-106`、`RB08-118`、`RB08-123`、`RB08-124`、`RB08-131`、`RB08-132`、`RB08-139`、`RB08-148`、`RB08-151`、`RB08-152`、`RB08-169`、`RB08-179`、`RB08-193`、`RB08-209`、`RB08-214`、`RB08-219`、`RB08-227`、`RB08-228`、`RB08-255`、`RB08-284`、`RB08-311`、`RB08-312`、`RB08-330`、`RB08-336`、`RB08-344`、`RB09-003`、`RB09-011`、`RB09-015`、`RB09-018`、`RB09-020`、`RB09-026`、`RB09-030`、`RB09-037`、`RB09-041`、`RB09-048`、`RB09-067`、`RB09-069`、`RB09-070`、`RB09-077`、`RC0-142`、`RC00-005`、`RC00-016`、`RC00-026`、`RC00-039`、`RC00-040`、`RC00-042`、`RC00-082`、`RC00-100`、`RC00-102`、`RC00-104`、`RC00-105`、`RC00-106`、`RC00-109`、`RC00-110`、`RC00-111`、`RC00-114`、`RC00-116`、`RC00-117`、`RC00-118`、`RC00-119`、`RC00-121`、`RC00-128`、`RC00-130`、`RC00-138`、`RC00-139`、`RC00-141`、`RC00-205`、`RC00-207`、`RC00-211`、`RC00-245`、`RC01-028`、`RC01-030`、`RC01-071`、`RC01-082`、`RC01-136`、`RC02-026`、`RC02-045`、`RC02-086`、`RC02-111`、`RC02-113`、`RC02-134`、`RC02-135`、`RC02-155`、`RC02-175`、`RC02-178`、`RC02-188`、`RC02-189`、`RC03-032`、`RC03-034`、`RC03-055`、`RC03-062`、`RC03-109`、`RC03-111`、`RC03-124`、`RC03-125`、`RC03-126`、`RC03-127`、`RC03-128`、`RC03-129`、`RC03-130`、`RC03-145`、`RC03-148`、`RC03-149`、`RC04-036`、`RC04-047`、`RC04-056`、`RC04-059`、`RC04-081`、`RC04-106`、`RC04-112`、`RC04-114`、`RC04-160`、`RC04-167`、`RC04-172`、`RC04-174`、`RC04-176`、`RC04-177`、`RC04-183`、`RC04-264`、`RC04-269`、`RD00-058`、`RD00-125`、`RD00-126`、`RD00-164`、`RD00-289`、`RD00-290`、`RD00-292`、`RD00-293`、`RD00-331`、`RD00-344`、`RD00-345`、`RD00-365`、`RD00-370`、`RD01-005`、`RD01-006`、`RD01-025`、`RD01-068`、`RD01-080`、`RD01-081`、`RD01-171`、`RD01-180`、`RD01-185`、`RD01-193`、`RD01-201`、`RD01-248`、`RD01-252`、`RD01-253`、`RD01-265`、`RD01-271`、`RD01-285`、`RD01-294`、`RD01-295`、`RD01-297`、`RD01-300`、`RD01-328`、`RD01-334`、`RD01-343`、`RD01-346`、`RD01-348`、`RD02-015`、`RD02-040`、`RD02-075`、`RD02-138`、`RD02-147`、`RD02-157`、`RD02-175`、`RD02-185`、`RD02-213`、`RD02-215`、`RD02-217`、`RD02-218`、`RD02-250`、`RD02-253`、`RD02-260`、`RD02-283`、`RD02-318`、`RD02-329`、`RD02-330`、`RD02-344`、`RD03-005`、`RD03-006`、`RD03-011`、`RD03-073`、`RD03-126`、`RD03-127`、`RD03-219`、`RD03-223`、`RD03-249`、`RD04-006`、`RD04-020`、`RD04-037`、`RD04-038`、`RD04-042`、`RD04-044`、`RD04-045`、`RD04-047`、`RD04-179`、`RD04-182`、`RD04-203`、`RD04-211`、`RD05-031`、`RD05-062`、`RD05-067`、`RD05-109`、`RD05-111`、`RD05-114`、`RD05-116`、`RD05-204`、`RD05-212`、`RD05-224`、`RD05-228`、`RD05-230`、`RD05-235`、`RD06-020`、`RD06-027`、`RD06-040`、`RD06-043`、`RD06-044`、`RD06-047`、`RD06-050`、`RD06-054`、`RD06-056`、`RD06-069`、`RD06-107`、`RD06-130`、`RD06-131`、`RD06-132`、`RD06-135`、`RD06-169`、`RD06-171`、`RD06-192`、`RD06-193`、`RD06-206`、`RD07-017`、`RD07-024`、`RD07-025`、`RD07-028`、`RD07-032`、`RD07-034`、`RD07-051`、`RD07-057`、`RD07-065`、`RD07-069`、`RD07-070`、`RD07-073`、`RD07-078`、`RD07-080`、`RD07-097`、`RD07-163`、`RD07-165`、`RD07-169`、`RD07-172`、`RD07-173`、`RD07-202`、`RD07-203`、`RD07-204`、`RD07-205`、`RD08-009`、`RD08-058`、`RD08-062`、`RD08-068`、`RD08-069`、`RD08-105`、`RD08-107`、`RD08-108`、`RD08-133`、`RD08-149`、`RD08-151`、`RD08-154`、`RD08-174`、`RD08-175`、`RD08-185`、`RD08-192`、`RD08-205`、`RD08-216`、`RD09-007`、`RD09-021`、`RD09-062`、`RD09-076`、`RD09-077`、`RD09-078`、`RD09-096`、`RD09-110`、`RD09-116`、`RD09-135`、`RD09-139`、`RD10-012`、`RD10-014`、`RD10-017`、`RD10-019`、`RD10-021`、`RD10-023`、`RD10-027`、`RD10-029`、`RD10-034`、`RD10-041`、`RD10-042`、`RD10-043`、`RD10-051`、`RD10-054`、`RD10-055`、`RD10-056`、`RD10-072`、`RD10-076`、`RD10-081`、`RD10-084`、`RD10-085`、`RD10-100`、`RD10-119`、`RD10-133`、`RD10-154`、`RD10-167`、`RD10-193`、`RD10-203`、`RD11-007`、`RD11-025`、`RD11-112`、`RD11-125`、`RD11-137`、`RD11-139`、`RD11-140`、`RD11-141`、`RD11-142`、`RD11-143`、`RD11-144`、`RD11-146`、`RD11-182`、`RD11-192`、`RE01-025`、`RE01-040`、`RE01-050`、`RE01-059`、`RE01-096`、`RE01-099`、`RE01-104`、`RE01-110`、`RE01-191`、`RE01-232`、`RE01-236`、`RE01-241`、`RE01-269`、`RE01-282`、`RF00-013`、`RG03-012`、`RG13-007`、`RG14-019`、`RG16-006`、`RG16-013`、`RG18-011`、`RG18-020`、`RG18-022`、`RG18-025`
