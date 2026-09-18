---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSM-05
group: OS管理
product: OS
atoms_primary: 77
atoms_secondary: 24
issue_projection: none
---

# RUL-OSM-05（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

破壊的な操作（履歴の書換え、強制push、一括削除、上書き）を既定で拒否する。例外は理由付き・一回限りとし、監査に残す。

## 主として対応づいた規則（77件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-035` | runtime方針ではenv・markerによるforeign-edit例外をDBにdigest-onlyで監査し、env例外もsession・subject単位のone-shotとして同一nonce再利用を拒否する。 | safety_security | prose | .claude/CLAUDE.md:228-232 |
| `RA-038` | Git guardは理由付きone-shot overrideのないreset・破壊的checkout・restore・revert・force-pushを拒否する。 | safety_security | prose／hook | AGENTS.md:252-253; AGENTS.md:298-301; CLAUDE.md:225-228; .claude/hooks/git-command-guard.ts:3-7 |
| `RA-085` | Claude・Codex設定はBash直前にgit-command-guardをtimeout 30秒、blockOnFailure=trueで呼ぶ。 | tooling_runtime | config／hook | .claude/settings.json:29-39; .codex/hooks.json:29-39 |
| `RB04-214` | 漏洩対応でgit historyを書き換える前は全員へ通知し、公開repositoryの漏洩は外部閲覧済みと仮定して対応する。 | safety_security | prose | docs/governance/ai-dev-team-operations_v1.1.md:807-818 |
| `RB06-078` | Kimi guardは破壊的git、force push、git clean、広域rm -rfを拒否する。 | safety_security | hook | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:123-129 |
| `RB08-007` | guardを迂回する作業者はすべての迂回を監査証跡へ記録し、記録なしに迂回しない。 | safety_security | prose | docs/skills/threat-model.md:71-72 |
| `RB08-162` | DB移行担当者はnullable追加や新table追加を先行させ、破壊的migrationには意図したdata lossの承認証拠をPLANへ記録する。 | escalation_authority | prose | docs/skills/db.md:67-70 |
| `RC0-022` | Override処理は、監査予約が同じnonceの再使用を返した場合、操作を拒否する。 | escalation_authority | hook | src/runtime/guard-override-transaction.ts:51-57 |
| `RC0-023` | Override処理は、監査記録のcommitに失敗した場合、例外操作を拒否する。 | escalation_authority | hook | src/runtime/guard-override-transaction.ts:51-60; src/runtime/git-command-guard-hook.ts:137-184 |
| `RC0-024` | Override処理は、markerの消費に失敗した場合、操作を拒否する。監査の補償処理にも失敗しても拒否を維持する。 | escalation_authority | hook | src/runtime/guard-override-transaction.ts:61-71 |
| `RC0-025` | Git guardは、理由付きoverrideがない場合、git -cによるalias定義を伴う操作を拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:264-277; src/runtime/git-command-guard.ts:531-551 |
| `RC0-026` | Git guardは、理由付きoverrideがない場合、path指定によるindex操作と判定できる例外以外のgit resetを拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:249-256; src/runtime/git-command-guard.ts:282-287 |
| `RC0-027` | Git guardは、理由付きoverrideがないgit revertを拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:288-288; src/runtime/git-command-guard.ts:543-551 |
| `RC0-028` | Git guardは、理由付きoverrideがない場合、force・force-with-lease・mirror・強制refspecを使用するpushを拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:289-301 |
| `RC0-030` | Git guardは、理由付きoverrideがない場合、破棄系checkoutや対象がrefs-onlyと確認できないcheckoutを拒否する。-b・-B・--orphan・--detachはこの分類から除外する。 | safety_security | hook | src/runtime/git-command-guard.ts:302-312; src/runtime/git-command-guard-hook.ts:221-251 |
| `RC0-031` | Git guardは、理由付きoverrideがない場合、staged-only以外のgit restoreを拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:258-262; src/runtime/git-command-guard.ts:313-316 |
| `RC0-032` | Git guardは、理由付きoverrideがない場合、dry-runではないforce付きgit cleanを拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:317-325 |
| `RC0-033` | Git guardは、理由付きoverrideがない場合、branchの強制削除を拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:326-335 |
| `RC0-034` | Git guardは、理由付きoverrideがない場合、git stash drop／clearを拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:336-339 |
| `RC0-051` | Machine-safety guardは、再帰指定付きのrmを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:249-259 |
| `RC0-052` | Machine-safety guardは、rmの対象が一つに限定されない場合、拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:260-261 |
| `RC0-053` | Machine-safety guardは、rm対象にglob・変数展開・command substitution等の動的構文がある場合、拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:37-39; src/runtime/machine-safety-guard.ts:262-263 |
| `RC0-054` | Machine-safety guardは、rm対象がrepository内部のpathと判定できない場合、拒否する。repository root自体も内部対象とは扱わない。 | safety_security | hook | src/runtime/machine-safety-guard.ts:41-45; src/runtime/machine-safety-guard.ts:264-265 |
| `RC0-055` | Machine-safety guardは、commandまたは検査対象interpreter scriptに登録済みのfilesystem削除APIを検出した場合、拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:268-281; src/runtime/machine-safety-guard-hook.ts:44-52 |
| `RC0-058` | Machine-safety guardは、findの-delete、または-exec／-execdirからのrmを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:289-290 |
| `RC0-059` | Machine-safety guardは、xargs経由のrmを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:291-292 |
| `RC0-060` | Machine-safety guardは、mkfs・wipefs・fdisk・partedを検出したcommandを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:293-294 |
| `RC0-061` | Machine-safety guardは、ddの出力先がraw deviceであるcommandを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:295-296 |
| `RC0-062` | Machine-safety guardは、再帰指定付きのchmod／chownを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:297-298 |
| `RC0-063` | Machine-safety guardは、登録された強制終了指定を伴うkillall／pkillを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:299-300 |
| `RC0-064` | Machine-safety guardは、kill -9／-KILLの対象に-1を指定するcommandを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:301-302 |
| `RC0-066` | Machine-safety guardは、findの-exec／-execdirからのshredを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:309-310 |
| `RC0-067` | Machine-safety guardは、実行commandがtruncateまたはshredである場合、拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:312-319 |
| `RC0-068` | Machine-safety guardは、rsync --deleteを拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:315-319 |
| `RC0-069` | Machine-safety guardは、reboot・poweroff・shutdown・halt、および対象systemctl停止操作を拒否する。 | safety_security | hook | src/runtime/machine-safety-guard.ts:321-327 |
| `RC00-080` | 文書report書込器は、対象pathに既存entryがある場合に上書きを拒否する。 | safety_security | gate | src/runtime/document-report-write-port.ts:48-49; src/runtime/document-report-write-port.ts:145-151 |
| `RC04-275` | review観測収集器は、出力ファイルが既存の場合、排他的作成により上書きを拒否する。 | evidence_claim | ci | .github/scripts/collect-claude-review-observation.mjs:73-81 |
| `RD00-302` | review receipt訂正は、対象receiptが正常にcurrent receiptとして読める場合、訂正を拒否する。 | evidence_claim | gate | src/runtime/claude-pr-convergence.ts:1189-1196 |
| `RD01-223` | override監査transactionは、非busy障害を即時失敗とし、busy／locked障害は最大5試行後に同nonceのcommitを確認できなければ失敗する。 | escalation_authority | hook | src/runtime/git-command-guard-hook.ts:137-184 |
| `RD01-227` | Git guard hookは、override markerの読取またはnonce用stat取得に失敗した場合、元の拒否を維持する。 | escalation_authority | hook | src/runtime/git-command-guard-hook.ts:281-300 |
| `RD01-228` | Git guard hookは、envまたはmarker overrideの監査結果がallowedでない、監査処理が失敗、または有効なoverrideがない場合に拒否を維持する。 | escalation_authority | hook | src/runtime/git-command-guard-hook.ts:313-344; src/runtime/git-command-guard-hook.ts:379-386 |
| `RD01-229` | Git guard hookは、marker消費時のnonceが期待値と異なる、または削除後もmarkerが存在する場合に消費成功を認めない。 | escalation_authority | hook | src/runtime/git-command-guard-hook.ts:369-381 |
| `RD01-232` | Git command guardは、コマンド内でのgit alias上書きをbypassなしでは拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:264-277; src/runtime/git-command-guard.ts:531-551 |
| `RD01-233` | Git command guardは、path指定のindex resetと判定したもの以外のgit resetをbypassなしでは拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:249-255; src/runtime/git-command-guard.ts:282-287; src/runtime/git-command-guard.ts:531-551 |
| `RD01-235` | Git command guardは、force・force-with-lease・mirror・プラス付きrefspec等の強制pushをbypassなしでは拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:289-301; src/runtime/git-command-guard.ts:531-551 |
| `RD01-238` | Git command guardは、dry-runでない強制git cleanをbypassなしでは拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:317-324; src/runtime/git-command-guard.ts:531-551 |
| `RD01-239` | Git command guardは、強制branch削除をbypassなしでは拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:326-335; src/runtime/git-command-guard.ts:531-551 |
| `RD01-240` | Git command guardは、stash dropまたはclearをbypassなしでは拒否する。 | safety_security | hook | src/runtime/git-command-guard.ts:336-339; src/runtime/git-command-guard.ts:531-551 |
| `RD01-244` | Git override解決処理は、環境値が文字列1でも空でないmarker理由でもない場合、bypassを許可しない。 | escalation_authority | hook | src/runtime/git-command-guard.ts:601-610 |
| `RD02-189` | machine safety hookは、参照scriptにINTERPRETER_DELETE_API patternがある場合に実行をblockする。 | safety_security | hook | src/runtime/machine-safety-guard-hook.ts:44-52 |
| `RD02-190` | machine safety guardは、再帰flag付きrmをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:249-259 |
| `RD02-191` | machine safety guardは、rmの対象が1件でない場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:260-261 |
| `RD02-192` | machine safety guardは、rm対象にglob・変数・command substitution等の動的構文がある場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:37-39; src/runtime/machine-safety-guard.ts:262-263 |
| `RD02-193` | machine safety guardは、rm対象がrepo配下と判定できない場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:41-45; src/runtime/machine-safety-guard.ts:264-264 |
| `RD02-195` | machine safety guardは、command文字列にinterpreterのfilesystem削除API patternを検出するとblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:268-269; src/runtime/machine-safety-guard.ts:280-281 |
| `RD02-198` | machine safety guardは、findの-deleteまたは-exec/-execdir経由のrmをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:289-290 |
| `RD02-199` | machine safety guardは、xargs経由のrmをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:291-292 |
| `RD02-200` | machine safety guardは、mkfs・wipefs・fdisk・partedを検出するとblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:293-294 |
| `RD02-201` | machine safety guardは、ddの出力先が/dev/またはWindows PhysicalDriveの場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:295-296 |
| `RD02-202` | machine safety guardは、再帰的なchmodまたはchownをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:297-298 |
| `RD02-203` | machine safety guardは、killallまたはpkillへの指定patternの9/KILL flagをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:299-300 |
| `RD02-204` | machine safety guardは、kill -9/-KILLの対象が-1の場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:301-302 |
| `RD02-206` | machine safety guardは、findの-exec/-execdir経由のshredをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:309-310 |
| `RD02-207` | machine safety guardは、unwrap後の実行commandがtruncate・shred、または--delete付きrsyncの場合にblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:312-320 |
| `RD02-208` | machine safety guardは、reboot・poweroff・shutdown・halt、またはsystemctlのpoweroff・reboot・haltをblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:321-327 |
| `RD02-209` | machine safety guardは、echo・printf以外の未知wrapperの引数中に危険なrmを見つけた場合もblockする。 | safety_security | hook | src/runtime/machine-safety-guard.ts:341-350 |
| `RD02-337` | archive元削除判定器は、実際のarchive対象pathに重複がある場合に削除を許可しない。 | safety_security | gate | src/runtime/retirement-preserve.ts:924-928; src/runtime/retirement-preserve.ts:963-968 |
| `RD02-338` | archive元削除判定器は、archive実体のpath・digest・byte数・mode・tracked属性が不正、またはsymlinkの場合に削除を許可しない。 | safety_security | gate | src/runtime/retirement-preserve.ts:929-943; src/runtime/retirement-preserve.ts:963-968 |
| `RD02-339` | archive元削除判定器は、manifestが要求するarchive実体が欠落している場合に削除を許可しない。 | safety_security | gate | src/runtime/retirement-preserve.ts:944-946; src/runtime/retirement-preserve.ts:963-968 |
| `RD02-340` | archive元削除判定器は、manifestにないarchive実体がある場合に削除を許可しない。 | safety_security | gate | src/runtime/retirement-preserve.ts:947-947; src/runtime/retirement-preserve.ts:963-968 |
| `RD02-341` | archive元削除判定器は、archive実体のdigest・byte数・mode・tracked状態がmanifestと異なる、またはsymlinkの場合に削除を許可しない。 | safety_security | gate | src/runtime/retirement-preserve.ts:948-968 |
| `RD04-031` | work-guard hookは、override markerの再計算nonceが期待値と異なる、または削除後もmarkerが残る場合に消費成功を返さない。 | safety_security | hook | src/runtime/work-guard-hook.ts:149-158 |
| `RD05-169` | cutover-readinessは、dry_run_planにdry-runまたはrehearsalと、非破壊性を示す所定語の両方がない場合、失敗させる。 | safety_security | lint | src/lint/cutover-readiness.ts:399-407 |
| `RE01-246` | 外部の破壊的操作はexact target・dry-run・postcondition・rollback・期限付き承認が揃う場合だけ実行する。 | escalation_authority | gate | docs/governance/helix-harness-requirements_v1.3.md:468-468 |
| `RG03-012` | git-command-guardは、破壊的Git操作のoverride markerをone-shotで消費した際、その記録をaudit logに残す。 | evidence_claim | hook | CLAUDE.md:225-228 |
| `RG16-012` | guard迂回を行う担当者は、診断済みの緊急事態の場合だけHELIX_ALLOW_RAW_AGENT=1を使用する。 | escalation_authority | prose | docs/skills/agent-design.md:68-70 |
| `RG16-013` | guardを迂回した担当者は、flag設定者、実行したagent call、通常経路が不適切だった理由を.helix/audit/へ記録する。 | evidence_claim | prose | docs/skills/agent-design.md:71-72; docs/skills/agent-design.md:83-83 |

## 副として対応づいた規則（24件）

`RA-034`、`RA-039`、`RA-040`、`RA-041`、`RA-042`、`RA-045`、`RA-165`、`RB0-012`、`RB05-024`、`RB06-009`、`RB06-084`、`RB08-300`、`RC0-029`、`RC00-031`、`RD00-306`、`RD01-231`、`RD01-234`、`RD01-236`、`RD01-237`、`RD01-301`、`RD04-029`、`RD04-030`、`RE01-206`、`RE01-243`
