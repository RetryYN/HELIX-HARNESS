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

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-035` | runtime方針ではenv・markerによるforeign-edit例外をDBにdigest-onlyで監査し、env例外もsession・subject単位のone-shotとして同一nonce再利用を拒否する。 | safety_security | prose | n/a | harness.db.guard_override_transactions | `RUL-OSM-06`、`RUL-COR-03` | .claude/CLAUDE.md:228-232 | A／gpt-6-astra |
| `RA-038` | Git guardは理由付きone-shot overrideのないreset・破壊的checkout・restore・revert・force-pushを拒否する。 | safety_security | prose／hook | n/a | git-command-guard、HELIX_ALLOW_DESTRUCTIVE_GIT、destructive-git-override | — | AGENTS.md:252-253; AGENTS.md:298-301; CLAUDE.md:225-228; .claude/hooks/git-command-guard.ts:3-7 | A／gpt-6-astra |
| `RA-085` | Claude・Codex設定はBash直前にgit-command-guardをtimeout 30秒、blockOnFailure=trueで呼ぶ。 | tooling_runtime | config／hook | n/a | PreToolUse matcher=Bash | `RUL-OSM-02`、`RUL-COR-04` | .claude/settings.json:29-39; .codex/hooks.json:29-39 | A／gpt-6-astra |
| `RB04-214` | 漏洩対応でgit historyを書き換える前は全員へ通知し、公開repositoryの漏洩は外部閲覧済みと仮定して対応する。 | safety_security | prose | n/a | 旧チーム全員通知 | `RUL-OSM-06` | docs/governance/ai-dev-team-operations_v1.1.md:807-818 | B04／gpt-6-astra |
| `RB06-078` | Kimi guardは破壊的git、force push、git clean、広域rm -rfを拒否する。 | safety_security | hook | fail_open | KimiローカルPreToolUse、異常時allow | — | docs/governance/kimi-code-extension-security-audit-2026-08-06.md:123-129 | B06／gpt-6-astra |
| `RB08-007` | guardを迂回する作業者はすべての迂回を監査証跡へ記録し、記録なしに迂回しない。 | safety_security | prose | n/a | HELIX_ALLOW_RAW_AGENT=1、.helix/audit/ | — | docs/skills/threat-model.md:71-72 | B08／claude_review |
| `RB08-162` | DB移行担当者はnullable追加や新table追加を先行させ、破壊的migrationには意図したdata lossの承認証拠をPLANへ記録する。 | escalation_authority | prose | fail_close | review_evidence | `RUL-DEV-02`、`RUL-OSM-01` | docs/skills/db.md:67-70 | B08／gpt-6-astra |
| `RC0-022` | Override処理は、監査予約が同じnonceの再使用を返した場合、操作を拒否する。 | escalation_authority | hook | fail_close | blocked_reuse／guard_override_transactions | `RUL-OSM-01` | src/runtime/guard-override-transaction.ts:51-57 | C／gpt-6-astra |
| `RC0-023` | Override処理は、監査記録のcommitに失敗した場合、例外操作を拒否する。 | escalation_authority | hook | fail_close | blocked_audit_failure／harness.db | `RUL-COR-04` | src/runtime/guard-override-transaction.ts:51-60; src/runtime/git-command-guard-hook.ts:137-184 | C／gpt-6-astra |
| `RC0-024` | Override処理は、markerの消費に失敗した場合、操作を拒否する。監査の補償処理にも失敗しても拒否を維持する。 | escalation_authority | hook | fail_close | blocked_consume_failure | `RUL-COR-04` | src/runtime/guard-override-transaction.ts:61-71 | C／gpt-6-astra |
| `RC0-025` | Git guardは、理由付きoverrideがない場合、git -cによるalias定義を伴う操作を拒否する。 | safety_security | hook | fail_close | git alias override | — | src/runtime/git-command-guard.ts:264-277; src/runtime/git-command-guard.ts:531-551 | C／gpt-6-astra |
| `RC0-026` | Git guardは、理由付きoverrideがない場合、path指定によるindex操作と判定できる例外以外のgit resetを拒否する。 | safety_security | hook | fail_close | HELIX_ALLOW_DESTRUCTIVE_GIT／destructive-git-override | — | src/runtime/git-command-guard.ts:249-256; src/runtime/git-command-guard.ts:282-287 | C／gpt-6-astra |
| `RC0-027` | Git guardは、理由付きoverrideがないgit revertを拒否する。 | safety_security | hook | fail_close | destructive-git-override | `RUL-OSM-06` | src/runtime/git-command-guard.ts:288-288; src/runtime/git-command-guard.ts:543-551 | C／gpt-6-astra |
| `RC0-028` | Git guardは、理由付きoverrideがない場合、force・force-with-lease・mirror・強制refspecを使用するpushを拒否する。 | safety_security | hook | fail_close | git push --force分類 | — | src/runtime/git-command-guard.ts:289-301 | C／gpt-6-astra |
| `RC0-030` | Git guardは、理由付きoverrideがない場合、破棄系checkoutや対象がrefs-onlyと確認できないcheckoutを拒否する。-b・-B・--orphan・--detachはこの分類から除外する。 | safety_security | hook | fail_close | checkoutTargetContext | `RUL-COR-04` | src/runtime/git-command-guard.ts:302-312; src/runtime/git-command-guard-hook.ts:221-251 | C／gpt-6-astra |
| `RC0-031` | Git guardは、理由付きoverrideがない場合、staged-only以外のgit restoreを拒否する。 | safety_security | hook | fail_close | git restore分類 | `RUL-OSM-06` | src/runtime/git-command-guard.ts:258-262; src/runtime/git-command-guard.ts:313-316 | C／gpt-6-astra |
| `RC0-032` | Git guardは、理由付きoverrideがない場合、dry-runではないforce付きgit cleanを拒否する。 | safety_security | hook | fail_close | git clean --force | — | src/runtime/git-command-guard.ts:317-325 | C／gpt-6-astra |
| `RC0-033` | Git guardは、理由付きoverrideがない場合、branchの強制削除を拒否する。 | safety_security | hook | fail_close | git branch -D／--delete --force | — | src/runtime/git-command-guard.ts:326-335 | C／gpt-6-astra |
| `RC0-034` | Git guardは、理由付きoverrideがない場合、git stash drop／clearを拒否する。 | safety_security | hook | fail_close | git stash drop／clear | — | src/runtime/git-command-guard.ts:336-339 | C／gpt-6-astra |
| `RC0-051` | Machine-safety guardは、再帰指定付きのrmを拒否する。 | safety_security | hook | fail_close | broad-delete／recursive rm | — | src/runtime/machine-safety-guard.ts:249-259 | C／gpt-6-astra |
| `RC0-052` | Machine-safety guardは、rmの対象が一つに限定されない場合、拒否する。 | safety_security | hook | fail_close | multi-target or targetless rm | — | src/runtime/machine-safety-guard.ts:260-261 | C／gpt-6-astra |
| `RC0-053` | Machine-safety guardは、rm対象にglob・変数展開・command substitution等の動的構文がある場合、拒否する。 | safety_security | hook | fail_close | dynamic-delete | `RUL-COR-04` | src/runtime/machine-safety-guard.ts:37-39; src/runtime/machine-safety-guard.ts:262-263 | C／gpt-6-astra |
| `RC0-054` | Machine-safety guardは、rm対象がrepository内部のpathと判定できない場合、拒否する。repository root自体も内部対象とは扱わない。 | safety_security | hook | fail_close | repo-external rm target | `RUL-COR-04` | src/runtime/machine-safety-guard.ts:41-45; src/runtime/machine-safety-guard.ts:264-265 | C／gpt-6-astra |
| `RC0-055` | Machine-safety guardは、commandまたは検査対象interpreter scriptに登録済みのfilesystem削除APIを検出した場合、拒否する。 | safety_security | hook | fail_close | INTERPRETER_DELETE_API | — | src/runtime/machine-safety-guard.ts:268-281; src/runtime/machine-safety-guard-hook.ts:44-52 | C／gpt-6-astra |
| `RC0-058` | Machine-safety guardは、findの-delete、または-exec／-execdirからのrmを拒否する。 | safety_security | hook | fail_close | find-driven deletion | — | src/runtime/machine-safety-guard.ts:289-290 | C／gpt-6-astra |
| `RC0-059` | Machine-safety guardは、xargs経由のrmを拒否する。 | safety_security | hook | fail_close | xargs-driven deletion | — | src/runtime/machine-safety-guard.ts:291-292 | C／gpt-6-astra |
| `RC0-060` | Machine-safety guardは、mkfs・wipefs・fdisk・partedを検出したcommandを拒否する。 | safety_security | hook | fail_close | block-device mutation | — | src/runtime/machine-safety-guard.ts:293-294 | C／gpt-6-astra |
| `RC0-061` | Machine-safety guardは、ddの出力先がraw deviceであるcommandを拒否する。 | safety_security | hook | fail_close | raw-device overwrite | — | src/runtime/machine-safety-guard.ts:295-296 | C／gpt-6-astra |
| `RC0-062` | Machine-safety guardは、再帰指定付きのchmod／chownを拒否する。 | safety_security | hook | fail_close | recursive permission/ownership mutation | — | src/runtime/machine-safety-guard.ts:297-298 | C／gpt-6-astra |
| `RC0-063` | Machine-safety guardは、登録された強制終了指定を伴うkillall／pkillを拒否する。 | safety_security | hook | fail_close | broad forced process termination | — | src/runtime/machine-safety-guard.ts:299-300 | C／gpt-6-astra |
| `RC0-064` | Machine-safety guardは、kill -9／-KILLの対象に-1を指定するcommandを拒否する。 | safety_security | hook | fail_close | all-process forced termination | — | src/runtime/machine-safety-guard.ts:301-302 | C／gpt-6-astra |
| `RC0-066` | Machine-safety guardは、findの-exec／-execdirからのshredを拒否する。 | safety_security | hook | fail_close | find-driven shredding | — | src/runtime/machine-safety-guard.ts:309-310 | C／gpt-6-astra |
| `RC0-067` | Machine-safety guardは、実行commandがtruncateまたはshredである場合、拒否する。 | safety_security | hook | fail_close | bulk overwrite or destructive synchronization | — | src/runtime/machine-safety-guard.ts:312-319 | C／gpt-6-astra |
| `RC0-068` | Machine-safety guardは、rsync --deleteを拒否する。 | safety_security | hook | fail_close | rsync --delete | — | src/runtime/machine-safety-guard.ts:315-319 | C／gpt-6-astra |
| `RC0-069` | Machine-safety guardは、reboot・poweroff・shutdown・halt、および対象systemctl停止操作を拒否する。 | safety_security | hook | fail_close | host availability mutation | — | src/runtime/machine-safety-guard.ts:321-327 | C／gpt-6-astra |
| `RC00-080` | 文書report書込器は、対象pathに既存entryがある場合に上書きを拒否する。 | safety_security | gate | fail_close | hard-link公開時にもEEXISTを拒否 | `RUL-COR-03` | src/runtime/document-report-write-port.ts:48-49; src/runtime/document-report-write-port.ts:145-151 | C00／gpt-6-astra |
| `RC04-275` | review観測収集器は、出力ファイルが既存の場合、排他的作成により上書きを拒否する。 | evidence_claim | ci | fail_close | flag:wx | — | .github/scripts/collect-claude-review-observation.mjs:73-81 | C04／gpt-6-astra |
| `RD00-302` | review receipt訂正は、対象receiptが正常にcurrent receiptとして読める場合、訂正を拒否する。 | evidence_claim | gate | fail_close | valid_review_receipt_correction_forbidden | `RUL-COR-04` | src/runtime/claude-pr-convergence.ts:1189-1196 | D00／gpt-6-astra |
| `RD01-223` | override監査transactionは、非busy障害を即時失敗とし、busy／locked障害は最大5試行後に同nonceのcommitを確認できなければ失敗する。 | escalation_authority | hook | fail_close | guard_override_transactions、5回retry | `RUL-COR-03` | src/runtime/git-command-guard-hook.ts:137-184 | D01／gpt-6-astra |
| `RD01-227` | Git guard hookは、override markerの読取またはnonce用stat取得に失敗した場合、元の拒否を維持する。 | escalation_authority | hook | fail_close | .helix/state/destructive-git-override | `RUL-COR-04` | src/runtime/git-command-guard-hook.ts:281-300 | D01／gpt-6-astra |
| `RD01-228` | Git guard hookは、envまたはmarker overrideの監査結果がallowedでない、監査処理が失敗、または有効なoverrideがない場合に拒否を維持する。 | escalation_authority | hook | fail_close | commitOverrideUse、blocked_audit_failure | `RUL-COR-04` | src/runtime/git-command-guard-hook.ts:313-344; src/runtime/git-command-guard-hook.ts:379-386 | D01／gpt-6-astra |
| `RD01-229` | Git guard hookは、marker消費時のnonceが期待値と異なる、または削除後もmarkerが存在する場合に消費成功を認めない。 | escalation_authority | hook | fail_close | device・inode・mtime・本文のdigest | `RUL-COR-03` | src/runtime/git-command-guard-hook.ts:369-381 | D01／gpt-6-astra |
| `RD01-232` | Git command guardは、コマンド内でのgit alias上書きをbypassなしでは拒否する。 | safety_security | hook | fail_close | -c alias.*、-calias.* | `RUL-COR-04` | src/runtime/git-command-guard.ts:264-277; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-233` | Git command guardは、path指定のindex resetと判定したもの以外のgit resetをbypassなしでは拒否する。 | safety_security | hook | fail_close | isPathReset | `RUL-OSM-06` | src/runtime/git-command-guard.ts:249-255; src/runtime/git-command-guard.ts:282-287; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-235` | Git command guardは、force・force-with-lease・mirror・プラス付きrefspec等の強制pushをbypassなしでは拒否する。 | safety_security | hook | fail_close | 短縮option内fも検出 | `RUL-OSM-06` | src/runtime/git-command-guard.ts:289-301; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-238` | Git command guardは、dry-runでない強制git cleanをbypassなしでは拒否する。 | safety_security | hook | fail_close | forceとdry-runのtoken判定 | `RUL-OSM-06` | src/runtime/git-command-guard.ts:317-324; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-239` | Git command guardは、強制branch削除をbypassなしでは拒否する。 | safety_security | hook | fail_close | branch -D、deleteとforceの組合せ | — | src/runtime/git-command-guard.ts:326-335; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-240` | Git command guardは、stash dropまたはclearをbypassなしでは拒否する。 | safety_security | hook | fail_close | git stash drop／clear | `RUL-OSM-06` | src/runtime/git-command-guard.ts:336-339; src/runtime/git-command-guard.ts:531-551 | D01／gpt-6-astra |
| `RD01-244` | Git override解決処理は、環境値が文字列1でも空でないmarker理由でもない場合、bypassを許可しない。 | escalation_authority | hook | fail_close | HELIX_ALLOW_DESTRUCTIVE_GIT=1 | `RUL-COR-04` | src/runtime/git-command-guard.ts:601-610 | D01／gpt-6-astra |
| `RD02-189` | machine safety hookは、参照scriptにINTERPRETER_DELETE_API patternがある場合に実行をblockする。 | safety_security | hook | fail_close | 削除APIの静的正規表現 | `RUL-OSA-06` | src/runtime/machine-safety-guard-hook.ts:44-52 | D02／gpt-6-astra |
| `RD02-190` | machine safety guardは、再帰flag付きrmをblockする。 | safety_security | hook | fail_close | --recursive、短縮flagのr/R | — | src/runtime/machine-safety-guard.ts:249-259 | D02／gpt-6-astra |
| `RD02-191` | machine safety guardは、rmの対象が1件でない場合にblockする。 | safety_security | hook | fail_close | flag以外の引数を対象として計数 | — | src/runtime/machine-safety-guard.ts:260-261 | D02／gpt-6-astra |
| `RD02-192` | machine safety guardは、rm対象にglob・変数・command substitution等の動的構文がある場合にblockする。 | safety_security | hook | fail_close | containsDynamicSyntax | `RUL-COR-04` | src/runtime/machine-safety-guard.ts:37-39; src/runtime/machine-safety-guard.ts:262-263 | D02／gpt-6-astra |
| `RD02-193` | machine safety guardは、rm対象がrepo配下と判定できない場合にblockする。 | safety_security | hook | fail_close | resolve・relativeによるlexical判定 | `RUL-COR-04` | src/runtime/machine-safety-guard.ts:41-45; src/runtime/machine-safety-guard.ts:264-264 | D02／gpt-6-astra |
| `RD02-195` | machine safety guardは、command文字列にinterpreterのfilesystem削除API patternを検出するとblockする。 | safety_security | hook | fail_close | Python・Node・PowerShell・Ruby等の正規表現 | `RUL-OSA-06` | src/runtime/machine-safety-guard.ts:268-269; src/runtime/machine-safety-guard.ts:280-281 | D02／gpt-6-astra |
| `RD02-198` | machine safety guardは、findの-deleteまたは-exec/-execdir経由のrmをblockする。 | safety_security | hook | fail_close | find正規表現 | — | src/runtime/machine-safety-guard.ts:289-290 | D02／gpt-6-astra |
| `RD02-199` | machine safety guardは、xargs経由のrmをblockする。 | safety_security | hook | fail_close | xargs正規表現 | — | src/runtime/machine-safety-guard.ts:291-292 | D02／gpt-6-astra |
| `RD02-200` | machine safety guardは、mkfs・wipefs・fdisk・partedを検出するとblockする。 | safety_security | hook | fail_close | block-device command語彙 | — | src/runtime/machine-safety-guard.ts:293-294 | D02／gpt-6-astra |
| `RD02-201` | machine safety guardは、ddの出力先が/dev/またはWindows PhysicalDriveの場合にblockする。 | safety_security | hook | fail_close | dd of=の正規表現 | — | src/runtime/machine-safety-guard.ts:295-296 | D02／gpt-6-astra |
| `RD02-202` | machine safety guardは、再帰的なchmodまたはchownをblockする。 | safety_security | hook | fail_close | --recursiveまたは短縮flag検出 | — | src/runtime/machine-safety-guard.ts:297-298 | D02／gpt-6-astra |
| `RD02-203` | machine safety guardは、killallまたはpkillへの指定patternの9/KILL flagをblockする。 | safety_security | hook | fail_close | 広域強制終了の正規表現 | — | src/runtime/machine-safety-guard.ts:299-300 | D02／gpt-6-astra |
| `RD02-204` | machine safety guardは、kill -9/-KILLの対象が-1の場合にblockする。 | safety_security | hook | fail_close | all-process kill pattern | — | src/runtime/machine-safety-guard.ts:301-302 | D02／gpt-6-astra |
| `RD02-206` | machine safety guardは、findの-exec/-execdir経由のshredをblockする。 | safety_security | hook | fail_close | find-driven shredding | — | src/runtime/machine-safety-guard.ts:309-310 | D02／gpt-6-astra |
| `RD02-207` | machine safety guardは、unwrap後の実行commandがtruncate・shred、または--delete付きrsyncの場合にblockする。 | safety_security | hook | fail_close | unwrapCommandでsudo等を除去 | — | src/runtime/machine-safety-guard.ts:312-320 | D02／gpt-6-astra |
| `RD02-208` | machine safety guardは、reboot・poweroff・shutdown・halt、またはsystemctlのpoweroff・reboot・haltをblockする。 | safety_security | hook | fail_close | host availability command集合 | — | src/runtime/machine-safety-guard.ts:321-327 | D02／gpt-6-astra |
| `RD02-209` | machine safety guardは、echo・printf以外の未知wrapperの引数中に危険なrmを見つけた場合もblockする。 | safety_security | hook | fail_close | rmIndexからclassifyRmを再適用 | `RUL-OSA-06` | src/runtime/machine-safety-guard.ts:341-350 | D02／gpt-6-astra |
| `RD02-337` | archive元削除判定器は、実際のarchive対象pathに重複がある場合に削除を許可しない。 | safety_security | gate | fail_close | duplicateActual | `RUL-COR-04` | src/runtime/retirement-preserve.ts:924-928; src/runtime/retirement-preserve.ts:963-968 | D02／gpt-6-astra |
| `RD02-338` | archive元削除判定器は、archive実体のpath・digest・byte数・mode・tracked属性が不正、またはsymlinkの場合に削除を許可しない。 | safety_security | gate | fail_close | archive観測値の形式検証 | `RUL-COR-04` | src/runtime/retirement-preserve.ts:929-943; src/runtime/retirement-preserve.ts:963-968 | D02／gpt-6-astra |
| `RD02-339` | archive元削除判定器は、manifestが要求するarchive実体が欠落している場合に削除を許可しない。 | safety_security | gate | fail_close | missing集合 | `RUL-OSM-07` | src/runtime/retirement-preserve.ts:944-946; src/runtime/retirement-preserve.ts:963-968 | D02／gpt-6-astra |
| `RD02-340` | archive元削除判定器は、manifestにないarchive実体がある場合に削除を許可しない。 | safety_security | gate | fail_close | extra集合 | `RUL-OSM-07` | src/runtime/retirement-preserve.ts:947-947; src/runtime/retirement-preserve.ts:963-968 | D02／gpt-6-astra |
| `RD02-341` | archive元削除判定器は、archive実体のdigest・byte数・mode・tracked状態がmanifestと異なる、またはsymlinkの場合に削除を許可しない。 | safety_security | gate | fail_close | changed集合 | `RUL-COR-02`、`RUL-OSM-07` | src/runtime/retirement-preserve.ts:948-968 | D02／gpt-6-astra |
| `RD04-031` | work-guard hookは、override markerの再計算nonceが期待値と異なる、または削除後もmarkerが残る場合に消費成功を返さない。 | safety_security | hook | fail_close | dev・ino・mtimeMs・本文によるnonce | `RUL-COR-03`、`RUL-OSM-06` | src/runtime/work-guard-hook.ts:149-158 | D04／gpt-6-astra |
| `RD05-169` | cutover-readinessは、dry_run_planにdry-runまたはrehearsalと、非破壊性を示す所定語の両方がない場合、失敗させる。 | safety_security | lint | fail_close | non-destructive/no apply/no write/branchのいずれかを受理 | `RUL-OSM-07` | src/lint/cutover-readiness.ts:399-407 | D05／gpt-6-astra |
| `RE01-246` | 外部の破壊的操作はexact target・dry-run・postcondition・rollback・期限付き承認が揃う場合だけ実行する。 | escalation_authority | gate | fail_close | destructive external action admission | `RUL-OSM-01` | docs/governance/helix-harness-requirements_v1.3.md:468-468 | E01／claude-opus |
| `RG03-012` | git-command-guardは、破壊的Git操作のoverride markerをone-shotで消費した際、その記録をaudit logに残す。 | evidence_claim | hook | n/a | HELIX_ALLOW_DESTRUCTIVE_GITと.helix/state/destructive-git-overrideを扱うgit-command-guard。 | `RUL-FRM-04` | CLAUDE.md:225-228 | G03／claude-opus |
| `RG16-012` | guard迂回を行う担当者は、診断済みの緊急事態の場合だけHELIX_ALLOW_RAW_AGENT=1を使用する。 | escalation_authority | prose | n/a | HELIX_ALLOW_RAW_AGENT=1 | `RUL-OSM-01` | docs/skills/agent-design.md:68-70 | G16／claude-opus |
| `RG16-013` | guardを迂回した担当者は、flag設定者、実行したagent call、通常経路が不適切だった理由を.helix/audit/へ記録する。 | evidence_claim | prose | n/a | HELIX_ALLOW_RAW_AGENT=1、.helix/audit/ | `RUL-FRM-04` | docs/skills/agent-design.md:71-72; docs/skills/agent-design.md:83-83 | G16／claude-opus |

## 副として対応づいた規則（24件）

`RA-034`、`RA-039`、`RA-040`、`RA-041`、`RA-042`、`RA-045`、`RA-165`、`RB0-012`、`RB05-024`、`RB06-009`、`RB06-084`、`RB08-300`、`RC0-029`、`RC00-031`、`RD00-306`、`RD01-231`、`RD01-234`、`RD01-236`、`RD01-237`、`RD01-301`、`RD04-029`、`RD04-030`、`RE01-206`、`RE01-243`
