# confirmed175 FR-L1-44 fixed f6 条件照合監査（2026-10-01）

旧source-qualified identity `harness/L1-requirements/functional-requirements.md::FR-L1-44` を、旧source・consumerとf6固定L2/L11へ照合したread-only静的監査。作成基準mainは`a3eae9cb8bdd2f57d7a79b8efa4910841d49f202`、固定L2/L11 revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。行・consumer・pair section・後発decision rowsのSHAは[JSON](legacy-confirmed175-fr-l1-44-source-qualified-fixed-f6-audit-2026-10-01.json)に記録する。

旧source line 75 / asset `LEGACY-ASSET-6B6C5CB0E481BE01088B` は `confirmed` / `preserved_pending_rehome`、successor未割当。原文SHAはfile `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line `6978d5198a63eeae9930e71f6a131dcaf86b7377a75853893a2044f223db9a0f`。既存queueは`not_individually_compared`・証拠なしで、旧FR44に対する個別fixed-f6条件監査は確認されなかった。queueのHARNESS-L2-019参照は関連記述であり、今回の条件別照合の重複ではない。

## 固定pairと条件別照合

固定対象はHELIX-HARNESS `HARNESS-L2-019` / 同IDのL11。HARNESS-L2-019は、既存要件・コード・PoCを受け取り、HELIXの要求・設計・検証の対とtraceへ変換し、変換不能・由来不明の部分をunknownとして残す。どのrelease unitからも入れ、Reverseの結果を承認済み要求・設計にしない。旧FR44のbaseline/import report/gateまでの全条件は閉じない。

| 旧FR-L1-44条件 | 固定pairで確認できる範囲 | 残る差分 |
|---|---|---|
| 既存コード/docs/PLAN資産一覧 | 既存要件・コード・PoCを入力にReverse変換する入口 | 資産一覧の完全性、docs/PLANを含むinventory schema、全資産の検出oracleはない |
| `.helix/`未初期化から初期baseline | どのrelease unitからでも入口を持つ | `.helix/`初期化、state schema/初期値、非破壊作成条件はない |
| 既存資産→state import report | 変換不能・由来不明をunknownとして返す | state storeへのimport transaction、report schema、分類・衝突・重複・再実行条件はない |
| onboarding完了gate証跡 | HARNESS-L2-003/L11は一般の凍結・差戻し・再開・完了条件を扱う | onboarding専用gate、証跡、未解決資産がある場合の完了不可条件はない |
| FR14/07/26との組合せ | Reverse・工程trace・OS service delivery・リリース単位の受渡しは個別pairにある | `inventory → baseline → state import report → onboarding gate`の結合sequenceを構成しない |

HARNESS-L2-019は、旧要求の「既存projectへの途中導入」と目的が近いが、state import完了までの手順を規定しない。HARNESS-L2-003/004は工程条件・影響範囲のtrace、HELIXOS-L2-006はサービス①〜⑦の導入・更新・復旧、HARNESS-L2-020はrelease単位間の契約・未完義務の受渡しを扱う。これらは限定的な接点であり、FR44の残差を閉じない。

## 旧consumerと途中導入の既存記述

旧L3はFR-14をReverse workflowとして展開し、FR-L1-44をその前段contextと明記する。FR-07は初回importの引継ぎ先として引用され、FR-26はRetrofit matrix・段階移行・rollbackを扱う。L3 §3のcarry表はFR44のPLAN-L4-NN-onboardingを挙げ、既存repoへのbaselineと`.helix/`初期化までを示す。

旧L4/L5/L6にもsetup/onboardingのconsumerが残る。L6 `setup-solo-team.md`は既存repoへのsetupと`.helix/state/setup.json`、GitHub設定のsolo/team差分を扱う。PLAN-L7-66は既存repo向けREADME/template、PLAN-L7-251はsetup import reportのidempotent rerunとconflict分類を扱い、`src/setup/index.ts`にもproject setup、baseline、import report関連の実装記述がある。これらは、旧世代の設計・PLAN・code consumerが途中導入機能を構成した証拠である。実行せず、本文の過去statusやテスト記録から現行動作・合格を主張しない。旧L3のBR-TTV-01「15分」や旧path/state schema、GitHub admin apply条件はFR44 source atomへ混ぜず、現行要求へ昇格しない。

## 追加した旧consumer条件と境界

archive全文検索で、L1 functional row以外にもFR44を具体化するconsumerを確認した。追加のpath・line・file SHAはJSONの`legacy_consumer_pins`に固定した。FR44のsource-qualified identity自体は増やさず、直接consumer・連動NFR・上位pillar・条件付きprocessを区別する。

| 追加consumer条件 | 固定f6との照合 | 扱い |
|---|---|---|
| `FR44-C05` v2 import ledger §6 / OT-23: baseline PLAN setを作り、欠損sub-docへ`skip_sub_doc`を設定し、段階整備の進捗をdashboardで見せる | L2/L11-019のReverse変換・unknown保持は近いが、PLAN生成、skip設定、dashboardはない。003の一般工程gateもonboarding段階を規定しない | FR44直接consumerとして未カバー |
| `FR44-C06` technical onboarding bootstrap / migration skill note: `.helix/`初期化、existing PLAN baseline、Phase 0 import、Reverse R0-R4前段、DBとfilesystemのasset count一致後にnew work開始 | 019はReverse入口を持つが、R0-R4 sequence、import状態・整合検査・開始条件を定めない | 部分接点。import/bootstrap closureは未カバー |
| `FR44-C07` linked NFR-16 / OT-29 / AT-NFR-16: docs/code/state不整合でもblockせず段階移行し、初回importで停止しない。skip設定後のstage gate通過とblock回避logを確認 | 019のunknown保持は推定で補わない境界。矛盾時に進む条件、skip例外、段階gate logはない。003の通常未検証停止との調停もない | 別identity NFR-16の連動条件として比較し、FR44へ統合しない。未カバー |
| `FR44-C08` OT-23/OT-29/AT-NFR-16のtest-design oracle: OT-23はHELIX未導入repoでbaseline PLAN・欠損sub-doc skip・dashboard、OT-29/ATはstage gate通過とblock回避logを検証 | L11-019のresult/unknown listにはbaseline/skip/dashboard/G1 stage-log oracleがない | OT-23はFR44固有consumer、OT-29/AT-NFR-16はlinked NFR16。archive test-design記載を実行済み・passと扱わない |
| `FR44-C09` data-migration skillの変換、count/checksum、null/constraint、idempotency、rollback obligations | 019/L11-019にmigration transactionやintegrity oracleはない | onboarding importを該当data/schema migrationとして扱う場合の条件付きprocess consumer。L1/固定L2へ自動昇格しない |
| `FR44-C10` HBR-P6: tag/release pinからone commandでrepo-local hooks・adapter・state/memory/evidence/feedback・GitHub rules/checksをbootstrap。PLAN-L1-06 line 99もFR44/setup方針を起点にDistribution/full setup overlayをHBR-P6/P9へ割当 | HELIXOS-L2-006はservice単位の導入・更新・復旧に接するが、full project baseline package一式を定めない | PLAN-L1-06は別のpillar/product-delivery scopeの系譜根拠として追加。FR44本文へ混ぜない |
| `FR44-C11` NFR-16 stage testsなどのtest-design oracle | L11-019のresult/unknown listにはbaseline/skip/dashboard/G1 stage-log oracleがない | old test-design conditionとして記録。実行・合格を主張しない |
| `FR44-C12` screen-requirements GD-01: static guide/document view、Onboarding categoryのHELIX使い方・初回PLAN・途中導入FR44・環境手順、FR44から「使い方 doc」へのprojection。PLAN-L1-03 line 87はFR44をscreen requirementsの上流batonとして列挙 | HARNESS-L2/L11-019はReverse変換結果とunknownを扱うが、GD-01、help content、表示・navigationを定めない | FR44 operational import/baseline workflowと別のscreen/document projection consumerとして明示除外。機能条件へ統合せず、独立したscreen-projection照合が必要。PLAN-L1-03 line 87は追加acceptance atomではない |

## archive consumer全体の検索と除外

`archive/.../root/{docs,src,tests}`をFR-L1-44、NFR-16 onboarding、OT-23、OT-29、onboarding bootstrap、`helix onboarding`、`skip_sub_doc`、baseline PLAN、初回importで検索した。FR44に直接結び付く追加詳細は上表とL3/L4/L6、PLAN、setup sourceに収まり、`src/`と`tests/`にはsource-qualified `FR-L1-44`参照はなかった。関連codeと過去test sourceもread-onlyで参照した。setup.test.ts / cli-surface.test.tsにはbrownfield import reportやskip_sub_doc routeのassertionがあるが、実行せず、baseline PLAN/dashboard/段階gateの被覆完了にも使わない。

ID誤用や別measureは明示的に除外した。PLAN-L1-02のFR-L1-44 role-validation/role-change記述とPLAN-L1-04 U-技術-4eのagent-guard記述は、source line 75の途中導入意味と衝突する古いID記述である。L3 NFR-gradeのNFR-16とD-09 handover ≥95%、D-15 continuation scoreもonboarding importの受入値にはしない。D-03 ≤30分、BR-TTV-01 ≤15分、sample repo/migration tool/training/CIのwhole-product記述は別のbusiness/marketing条件で、FR44 source rowにない数値・成果を固定pairへ持ち込まない。functional L1 line 119の「source referenceなし」は起源説明であり追加atomではない。

## 後発decision proximity screen

2026-09-29の57候補、同日の11候補、2026-09-30 live26判断について、採択済みregistration-decision rowsを全88件compact index化し、FR44 operational workflow/import atomsとC05–C11のmigration/staged-gate/setup consumer群への意味近接をscreenした。FR44の条件を具体化する近接pairはなかった。GD-01のstatic help/document projection (C12) とHBR-P6/P9 distribution package overlay (C10) は別のscreen/pillar identity scopeとしてこのzero-near判定の対象外であり、採択pairがscreen UXまたはdistribution packageに一切接続しないとは主張しない。全rowのidentity、registration ID、decision line/hashはJSONに保持する。

このscreenは後発採択の範囲を変更せず、source atomの採択・後継・closureを生成しない。固定pairと近接pairのL2/L11 file/section SHAおよび存在するMPR row SHAはJSONで固定する。

## 非主張と静的確認

旧要求意味の変更・retire、successor割当、closureはない。archive runtime、CLI、hook、test、CIを実行していない。f6固定pairの採択、実装、受入、Step 5全体の完了も主張しない。JSON内のsource、consumer、f6 pair、queue、decision rowsのSHAと件数を静的に照合する。
