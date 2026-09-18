---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-OSM-05
group: OS管理
product: OS
atoms_primary: 102
atoms_secondary: 32
issue_projection: none
---

# RUL-OSM-05（OS管理／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

破壊的な操作（履歴の書換え、強制push、一括削除、上書き）を既定で拒否する。例外は理由付き・一回限りとし、監査に残す。

## 主として対応づいた規則（102件）

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
| `RG22-007` | 承認packet生成器は、approvalVerificationCommandMatrixの全行にwritePolicy="no-write"を固定付与し、承認レビュー用の検証commandが書込みを行う経路を認めない。 | safety_security | lint | fail_close | approvalVerificationCommandMatrix の writePolicy field | `RUL-OSM-01` | src/lint/action-binding-approval-readiness.ts:120-134; src/lint/action-binding-approval-readiness.ts:722-722 | G22／claude-opus |
| `RG24-004` | completion review bundleの各review packetは、reviewPolicyをnon_destructive_review_onlyとし、matrix面を持たないpacketのwritePolicyをno-writeとして、レビュー経路が破壊的操作を持たないことを示さなければならない。 | safety_security | lint | fail_close | CompletionReviewBundlePacket の reviewPolicy / writePolicy | `RUL-OSA-01` | src/lint/completion-decision-packet.ts:2123-2150; src/lint/completion-decision-packet.ts:2056-2061 | G24／claude-opus |
| `RG28-003` | L1/L2 gap-check packetはplan-only・no-writeであり、検査自体がrepositoryを変更してはならない。 | safety_security | lint／config | n/a | PLAN-DISCOVERY-11 / PLAN-REVERSE-329 への固定参照 | `RUL-OSA-01` | src/lint/l1-l2-gap-check.ts:31-52; src/lint/l1-l2-gap-check.ts:69-76 | G28／claude-opus |
| `RG30-006` | outstanding snapshot guardは、照合のみを行い修復書込みを一切行わず、不整合時は明示のrepair commandを返すだけに留める。 | safety_security | lint | fail_close | helix db rebuild | `RUL-COR-01` | src/lint/outstanding-snapshot.ts:85-108 | G30／claude-opus |
| `RG31-001` | completion review bundleは、planOnly・mustNotDecide・mustNotApplyを常にtrueに固定し、review packetのreviewPolicyをnon_destructive_review_onlyとする。matrixを持たないpacketのwritePolicyはno-writeとする。 | safety_security | lint | fail_close | completion-review-bundle.v1 | `RUL-OSA-01` | src/lint/outstanding.ts:1588-1591; src/lint/outstanding.ts:1608-1620 | G31／claude-opus |
| `RG32-005` | PR scope preflightは、snapshot再生成やExpected宣言の追加を自動で行わず、案内の提示だけに留める。 | safety_security | lint | n/a | helix db rebuild / outstanding snapshot | `RUL-COR-01` | src/lint/pr-scope-preflight.ts:140-152 | G32／claude-opus |
| `RG36-008` | version-up のrehearsal packetとsecurity checklist packetは、planOnly=true・mustNotApply=true・writePolicy="no-write"を固定して生成しなければならない。 | safety_security | lint | fail_close | buildVersionUpActivationRehearsalPacket / securityChecklistPacket | `RUL-OSA-01` | src/lint/version-up-readiness.ts:1645-1659; src/lint/version-up-readiness.ts:1703-1724 | G36／claude-opus |
| `RG37-008` | agent間のmailbox送信は、dry_runをtrueに固定したmessageを生成するだけで、実送信を行ってはならない。 | lane_delegation | lint | n/a | buildAgentMessageDryRun の dry_run: true | `RUL-OSP-03` | src/runtime/agent-mailbox-conflict-locks.ts:92-108 | G37／claude-opus |
| `RG37-014` | agent観測・SSOT投影・artifact収束の各reportはread_onlyを真に固定し、報告だけを行って副作用を持ってはならない。 | safety_security | lint | n/a | 各reportの read_only: true | `RUL-OSA-01` | src/runtime/agent-observability-provenance.ts:225-235; src/runtime/agent-ssot-runtime-projection.ts:102-111; src/runtime/artifact-convergence-analyzer.ts:119-127 | G37／claude-opus |
| `RG38-005` | change package delta archiveのreportはdry_runを真に固定して生成し、archive操作そのものを実行してはならない。 | safety_security | lint | n/a | buildChangePackageDeltaArchiveReport の dry_run: true | `RUL-COR-04` | src/runtime/change-package-delta-archive.ts:81-97 | G38／claude-opus |
| `RG40-009` | 文書report書込器は、dry-run指定の場合、path検証だけを行いfilesystemを一切変更せずnullを返す。 | safety_security | prose | n/a | — | — | src/runtime/document-report-write-port.ts:88-104; src/runtime/document-report-write-port.ts:112-117 | G40／claude-opus |
| `RG40-015` | 相談gateのoverride markerは空でない理由を必須とし、markerの内容とファイル識別子・更新時刻からnonceを作り、one-shot transactionを通して同一nonceの再利用をblockしなければならない。 | safety_security | hook | fail_close | .helix/state/escalation-consult-override と harness.db guard_override_transactions | `RUL-OSM-01` | src/runtime/escalation-consult-gate.ts:258-276; src/runtime/escalation-consult-gate.ts:324-345 | G40／claude-opus |
| `RG41-001` | Git command guardは、bash/sh/zsh -c、eval、コマンド置換、バッククォートによる入れ子shellも一定深さまで展開してgit操作を抽出し、深さ超過・未閉じquote・バッククォート不整合があれば解析不能として拒否する。 | safety_security | hook | fail_close | depth 4 という具体上限 | `RUL-COR-04` | src/runtime/git-command-guard.ts:145-187 | G41／claude-opus |
| `RG41-002` | Git command guardは、-C・-c・--git-dir・--work-tree等のglobal optionを正規化して実効作業directoryを解決し、値欠落や--bare指定で解決できない場合は対象の変更操作・pushを拒否する。 | safety_security | hook | fail_close | git固有option名 | `RUL-COR-04` | src/runtime/git-command-guard.ts:189-242; src/runtime/git-command-guard.ts:386-466 | G41／claude-opus |
| `RG41-003` | Git command guardは、通常のstatus/diff/log/commit/push、branch切替、index限定のreset/restore、--help、rebase・amの現在patch表示、applyの検査系optionは通し、過剰にblockしてはならない。 | behavior_discipline | hook | fail_open | git subcommandとoptionの具体名 | — | src/runtime/git-command-guard.ts:1-9; src/runtime/git-command-guard.ts:363-382 | G41／claude-opus |
| `RG41-005` | Git guard hookは、checkout対象について同名のpathが実在すればpath-or-ambiguous、commitとして検証できなければunresolvedと判定し、いずれもrefs-onlyとして通してはならない。 | safety_security | hook | fail_close | git rev-parse --verify による確認 | `RUL-COR-04` | src/runtime/git-command-guard-hook.ts:221-252 | G41／claude-opus |
| `RG41-006` | 環境変数によるgit override は、session IDと対象command digestから導いたnonceを使い、session・対象単位のone-shotとして同じ監査transactionを通さなければならない。 | safety_security | hook | fail_close | HELIX_ALLOW_DESTRUCTIVE_GIT と guard_override_transactions | `RUL-OSM-01` | src/runtime/git-command-guard-hook.ts:313-335 | G41／claude-opus |
| `RG41-009` | guard override transactionは、marker（またはenv相当capability）を消費する前に必ず監査記録をcommitし、消費に失敗した場合は監査を中止扱いへ更新する。 | safety_security | hook | fail_close | guard_override_transactions table | `RUL-FRM-04` | src/runtime/guard-override-transaction.ts:50-72 | G41／claude-opus |
| `RG41-021` | PLAN authoring処理は、dry-run指定の場合はlockを取らず何も書かず、計画のみを返す。 | safety_security | gate | n/a | — | — | src/runtime/forward-plan-authoring-transaction.ts:650-650 | G41／claude-opus |
| `RG42-014` | 隔離worktreeのcleanupは、明示のtarget pathとdry-run証拠の双方が揃うことを要求しなければならない。 | safety_security | gate | fail_close | git worktree remove --force という具体コマンド | — | src/runtime/isolated-worktree-sandbox-runner.ts:96-100 | G42／claude-opus |
| `RG43-005` | machine safety guardは、静的に指定されたrepository内の単一file削除だけを許可し、対象範囲をhook時点で狭く証明できない操作はfail-closeする。blockした場合は、repository内の明示的な単一fileへ分解するか隔離sandbox内で実行することを要求する。 | safety_security | hook | fail_close | — | `RUL-COR-06` | src/runtime/machine-safety-guard.ts:1-8; src/runtime/machine-safety-guard.ts:25-35 | G43／claude-opus |
| `RG43-006` | machine safety guardは、判定の前にsudo・doas・command・env・nohup・setsid・nice・ionice・stdbuf・timeout・time・busybox・watch等のwrapperを剥がして実効commandを特定しなければならない。認識できないwrapperの引数中に危険な削除を見つけた場合も拒否する。 | safety_security | hook | fail_close | 各wrapperのoption表 | — | src/runtime/machine-safety-guard.ts:153-234; src/runtime/machine-safety-guard.ts:341-352 | G43／claude-opus |
| `RG43-007` | machine safety guardは、rmの再帰指定を大文字小文字を区別せずに判定しなければならない（-R と -r を同義として扱う）。 | safety_security | hook | fail_close | GNU coreutils／BSDのrm flag | — | src/runtime/machine-safety-guard.ts:253-259 | G43／claude-opus |
| `RG44-003` | provider引継ぎ実行器は、dryRun指定時はhandover fileとCURRENTを書かず、生成したpackageだけを返す。 | tooling_runtime | prose | n/a | — | — | src/runtime/provider-handover.ts:115-122 | G44／claude-opus |
| `RG45-005` | 状態機械template計画は executable=false かつ read_only=true として返され、生成workflowを実行許可として扱わない。 | process_gate | prose | n/a | helix state-machine template --json | `RUL-FRM-04` | src/runtime/state-machine-template-planner.ts:20-32; src/runtime/state-machine-template-planner.ts:86-98 | G45／claude-opus |

## 副として対応づいた規則（32件）

`RA-034`、`RA-039`、`RA-040`、`RA-041`、`RA-042`、`RA-045`、`RA-165`、`RB0-012`、`RB05-024`、`RB06-009`、`RB06-084`、`RB08-300`、`RC0-029`、`RC00-031`、`RD00-306`、`RD01-231`、`RD01-234`、`RD01-236`、`RD01-237`、`RD01-301`、`RD04-029`、`RD04-030`、`RE01-206`、`RE01-243`、`RG24-003`、`RG28-010`、`RG37-010`、`RG40-001`、`RG40-016`、`RG41-004`、`RG45-001`、`RG46-005`
