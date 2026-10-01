# v1.3 条件行 focused residual positions 21–40 比較監査

- 監査対象HEAD: `50686b6762788574cb471967e8c24846d3dd56ae`。入力bundle HEAD: `71528979630922dd9683c345adb06d9b02790e70`。固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`.
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）、asset `LEGACY-ASSET-02319C2481B9E01698D5`、台帳 `docs/governance/legacy-asset-disposition.jsonl:956`（行SHA-256 `a6d52de16ee4aa8ecb37ed092fb4c2beda22ec89d1d036b3028414a753375dde`）。

## 母集団と選定

- 固定queueは303行。`primary_residual`かつ`unresolved_for_closure_work`は255行。32個のfocused audit JSONのSHAを確認し、ID hitは全queue 154行、primary/unresolved 136行。未hit候補119行から先行監査20件を除外した99行の21–40番を選定した。
- exact source ID hitは監査の意味coverageを示さない。119/99件は、この限定したidentity filterの件数であり、全意味未review件数・全closure件数を表さない。
- #2353/#2356等のcandidate4755 (`LEGACY-CAND-LINE-*`) overlayはv1.3の`REQSRC-SUP-*`とは別populationのため除外した。

## 固定比較pair

- L2 `docs/helix-harness/L2-requirements/product-requirements.md` SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`。L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。いずれもrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 各current referenceは当該条件の一部に近接する文書上の記載として引用し、旧condition全体の同値・successor・closureを示さない。

## 20条件の結果

|候補位置|旧source ID / 行|結果|固定pairで確認した記載|未解消条件|
|---:|---|---|---|---|
|21|`REQSRC-SUP-00185` / 237|partial|L2-019は既存要件・コード・PoCを受け取り、HELIX形式へ変換した結果とunknownを示し、推定補完と承認済み昇格を禁じる。（参照: HARNESS-L2-019）|legacy mode/model等の各tokenに対するexact mapping、ambiguous/unsupported/convertedのexit規則はこのHARNESS pairだけでは示されない。|
|22|`REQSRC-SUP-00186` / 238|partial|L2-019は変換成功と由来不明・未変換部分を区別し、unknownを保持する。（参照: HARNESS-L2-019）|変換成功のみexit 0、ambiguous/unsupported exit 1、Forward等へのfallback禁止というadapter固有oracleは固定pairにない。|
|23|`REQSRC-SUP-00187` / 240|partial|L2-019のresult/unknown境界は既存入力の取り込みと不明部分保持に近接する。（参照: HARNESS-L2-019）|registryのcurrent entity存在、宣言axis一致、token/曖昧token重複禁止のvalidationは確認できない。|
|24|`REQSRC-SUP-00188` / 241|partial|L2-019は入力・変換結果・unknown境界を明示する。（参照: HARNESS-L2-019）|adapter receiptのfield・normalized token・deprecation warning、旧mode/model非再出力は固定pairから確認できない。|
|25|`REQSRC-SUP-00209` / 281|partial|L2-004は要求から設計・testへのtrace、L2-005は検証義務・証拠条件を扱う。（参照: HARNESS-L2-004, HARNESS-L2-005）|先行runtime/CLI/gateの機能をbackfillし、要件IDをL3・test oracle・runtime evidenceへ接続する具体的手続は固定pairにない。|
|26|`REQSRC-SUP-00212` / 285|partial|L2-003は工程の開始・凍結・完了条件を要求し、未解決の成果状態を推定しない。（参照: HARNESS-L2-003）|authority registry、typed review receipt、evidence digest/convergence epoch/CAS/atomic rollbackとclose_readyの個別条件は確認できない。|
|27|`REQSRC-SUP-00214` / 287|partial|L2-002とL11-002はDiscovery/PoCを開発方式のphaseから分ける。（参照: HARNESS-L2-002）|S0–S4 case-driven lifecycle、S4の人間decision receipt、production routeのexact options/迂回拒否は旧FR/ACの全条件を満たした証拠ではない。|
|28|`REQSRC-SUP-00215` / 288|gap|固定HARNESS L2/L11 pairにforeign worktree・stage/commit/HEAD・one-shot overrideを同一episodeへ記録する対象固有の規則を特定できない。（参照: 該当する対象固有pair記載を特定できず）|lane status/work-guard/git-command-guardの記録完全性とforeign hunk/未記録override/destructive gitの拒否oracle。|
|29|`REQSRC-SUP-00216` / 289|gap|固定HARNESS L2/L11 pairにmemory expiry/takeover/deliver-consume/retire/compactionの機能契約を特定できない。（参照: 該当する対象固有pair記載を特定できず）|memory v2のfence/idempotency、未反映memoryをretireしない条件、stale instructionの再提示防止。|
|30|`REQSRC-SUP-00218` / 291|gap|固定HARNESS L2/L11 pairにtask/drive/layer起点のskill推薦と推薦効果測定を定める条件を特定できない。（参照: 該当する対象固有pair記載を特定できず）|firing/acceptance/効果/誤推薦/stale versionの計測・改善と、不根拠推薦/未計測主張/旧version silent利用の拒否。|
|31|`REQSRC-SUP-00219` / 292|partial|L2-010はversioned packの入力・出力・依存・検証範囲・所有先、交換更新・再現・rollbackを明示する。（参照: HARNESS-L2-010）|開発正本からself-applyを除くmulti-project配布物を生成するplan/sync/publish、license/consumer smoke、段階promotion、action-binding approval等は全て確認できない。|
|32|`REQSRC-SUP-00220` / 293|gap|固定HARNESS L2/L11 pairにVSCode manifest/find/tree-viewのDB由来read-model、CLI/DBと同じID/HEAD/redactionを定める対象固有条件を特定できない。（参照: 該当する対象固有pair記載を特定できず）|IDE独自正本・stale projection・write-capable表示経路を拒否する受入oracle。|
|33|`REQSRC-SUP-00221` / 294|partial|L2-004はrequirement-to-design/test trace、L2-005はriskに応じたCI義務・証拠を扱う。（参照: HARNESS-L2-004, HARNESS-L2-005）|GH-FR-001..029、GH-NFR-009..022、GitHub surfaces・security/deployment/merge CLI/hook/DB/acceptanceの全traceと個別拒否oracleは確認できない。|
|34|`REQSRC-SUP-00269` / 349|partial|L2-004は変更要求と設計/testへのtrace、L11-004はsource atomsを生きた要求・仮登録・revision付きhuman decisionへ割り当て、未計上等でno_lossを出さない条件を持つ。（参照: HARNESS-L2-004）|Proposal→Candidate→Canonical Admission Transactionの状態/authority gateとAI authoring権限の完全な契約はpairから確認できない。|
|35|`REQSRC-SUP-00272` / 353|partial|L2-003は工程の合意・凍結・未検証条件、L2-004は変更traceと再検証範囲を扱う。（参照: HARNESS-L2-003, HARNESS-L2-004）|可逆authoringの自動確定と、L1目的・安全境界・外部契約・不可逆操作・trade-offだけをescalateする詳細な判断分岐は明示されない。|
|36|`REQSRC-SUP-00273` / 354|partial|L2-004/L11-004は要求trace、変更影響、source atomのno-loss割当を確認する。（参照: HARNESS-L2-004）|Admission Engineがsemantic diff/authority/revision/trace/pair/impact/security/rollbackを判定しexactly-one dispositionを返す契約は確認できない。|
|37|`REQSRC-SUP-00274` / 355|gap|固定HARNESS L2/L11 pairにMarkdown/asset/event ledger/trace/projection/receiptのCAS付き単一transactionと部分成功ゼロを保証する契約を特定できない。（参照: 該当する対象固有pair記載を特定できず）|atomic update/rollbackのtransaction boundaryとpartial-commitのfault-injection oracle。|
|38|`REQSRC-SUP-00275` / 356|partial|L2-004とL11-004はrequirement traceとsource atomのno-loss維持を扱う。（参照: HARNESS-L2-004）|path非依存immutable asset ID/revision、rename/move/split/merge/supersede後のauthority/AC/oracle/history保持は特定できない。|
|39|`REQSRC-SUP-00276` / 357|partial|L2-003の確認結果は合意・対成果物・検証条件を要求し、L11-003は別revisionや未実行oracleを完了根拠にしない。（参照: HARNESS-L2-003）|policy内可逆Authoringを人間入力なしでCanonical化する契約、境界ケースとadmission receiptの自動検証は示されない。|
|40|`REQSRC-SUP-00277` / 358|partial|L11-004はsource atomsの未計上・重複・digest違い等があればno_lossを発行しない。（参照: HARNESS-L2-004）|fault injection後に正本/ledger/trace/projection/receiptの部分current状態が0というatomicity NFRと測定oracleは示されない。|

## 非主張

- 選定20条件は未解消残余として保持。formal successor 0、closure 0、authority effectなし。
- L11文書の静的記載確認であり、受入実行・実装・旧source全量のno-lossを主張しない。旧runtime/test/CIは実行していない。
