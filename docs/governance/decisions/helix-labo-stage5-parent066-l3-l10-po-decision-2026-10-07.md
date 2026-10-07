---
title: "HELIX-LABO Stage 5 親066 L3/L10委任承認 decision record"
decision_record_id: HDEC-LABO-STAGE5-PARENT066-L3-L10-DELEGATED-2026-10-07
decision_status: recorded
decider_role: "PO（委任：Opus・Fable一致）"
decided_at: 2026-10-07
recorded_at: 2026-10-07
review_base: 03d9cd19dfb92dc7dda74c8cb50f85dc320c873c
reviewed_content_head: 62d4fa1226a143367b1ed6d9dfa54a5c20b9dfc3
reviewed_content_revision: 3d378430760527a967188d863033930ef8f5fbb3
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-LABO Stage 5 親066 L3/L10委任承認

対象は採択済み`HELIXLABO-L2-066`、登録`MPR-RC-HELIXLABO-L2-066-001`、Stage 5、`version_target: 1.0`のL3要件とL10総合検証設計に限る。要求の意味・範囲・担当・版を変更しない。

## 委任判断の根拠

正式review14 [comment 6027758817](https://github.com/RetryYN/HELIX-HARNESS/pull/2635#issuecomment-6027758817) は、exact base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、HEAD `62d4fa1226a143367b1ed6d9dfa54a5c20b9dfc3`、本文revision `3d378430760527a967188d863033930ef8f5fbb3`についてMajor 0、Opusの敵対照合とFable「承認してよい」・Opus「Fableの判断を支持する」を記録し、委任条件1・2がこの本文revisionでそろったと結論する。comment bodyは4787 bytes、SHA-256 `cc3bf9eb7daf32e42330868ba7779f6a4bd974a619227f60b5dce7771c1404d1`。この記録は、委任判断に基づく当該revisionのL3承認を記録する。formalにMinor件数の記載はないため、Minor 0は付加しない。

mailbox inspect応答は独立した別sourceで、同一base/HEAD、`result=no_findings`、findings 0、unreviewed 0を報告する。`authority_effect=none`であり、mailbox応答自体をFable判断またはPO承認として扱わない。raw API comment objectsとmailbox inspectは根拠bundleに保存する。

委任規則の正本は[2026-10-05 PO委任判断記録](l3-l10-approval-delegation-po-decision-2026-10-05.md)（revision `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`、6210 bytes、SHA-256 `9028384fe51660c6785dc55e034bbd887702fd53b00bd9fd16641e7b6d8c2220`）と[GitHub上流運用モデル §L3／L10承認の委任](../github-upstream-operating-model.md#l3l10承認の委任)（同revision、53710 bytes、SHA-256 `eed2b774bb78545ac53c7d55f3ae3ab4e9c4f421b4eaf3ac3bcdbcdd869dd27b`）である。

## 採択親と固定source

PO採択元は[57候補記録](po-decision-2026-09-29-57candidates.md)の81行で、`HELIXLABO-L2-066`、`MPR-RC-HELIXLABO-L2-066-001`を採択している。採択行はL2 digest `d6578035…`、L11 digest `0a1d72d7…`を固定する。登録対象は固定revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`の`labo-requirements.md` 518–527、`labo-acceptance.md` 261–267で、行digestは採択行と一致する。参照範囲518–528および261–268は直後の空行を含む物理spanとして別途pinし、PO登録digestと混同しない。PO決定ファイルはreview base `03d9cd19dfb92dc7dda74c8cb50f85dc320c873c`で固定する。

[L2-066 source](../../helix-labo/L2-requirements/labo-requirements.md)の固定revision全体は113504 bytes / SHA-256 `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`。物理行518–528は4684 bytes / SHA-256 `5a67776a3f4567fa662c86898caf275fddbe8dc806fd3a19622cae9f733cdb69`。PO採択行が固定する行518–527は4683 bytes / SHA-256 `d65780351792a4587966a7eb45c34359626200af5bdd8eb55e197b0a6f0db184`。[L11-066 source](../../helix-labo/L11-acceptance/labo-acceptance.md)の固定revision全体は66593 bytes / SHA-256 `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`。物理行261–268は2304 bytes / SHA-256 `dd302f23a38d74475e707be64d9ee69a0bfda35b98902c62173c45d8c369a556`。PO採択行が固定する行261–267は2303 bytes / SHA-256 `0a1d72d7d0fb3b97b14ce6f53738785b76bce642a2f9b7c83c4328a45fc68cce`。全文とraw spansは根拠bundleに保存する。

L2-066が再利用する採択済みL2-059の同一条件評価・費用・時間・手戻り条件と戻し先（固定318ec4a、`labo-requirements.md` 420–429、8724 bytes / SHA-256 `10686c18522cfd5bf640570f66d5e8c3d5253ac9c21fbbd74fad1ecdf9569d2b`）を参照する。source不足でsource identityが未知である状態と、既知のOS/観測source/LABO責務区分を削らず併記する。個別unknownを理由に責務区分やLABO評価義務を消さない。

## 承認対象の六本文

review HEAD `62d4fa1226a143367b1ed6d9dfa54a5c20b9dfc3`、本文commit `3d378430760527a967188d863033930ef8f5fbb3`、途中のbase-merge commit `5cefe16a1331d5a917b682725cfb1326e190167c`で六実blobを再取得した。全六本文は3 revisionでbytesとSHAが一致する。

| 本文 | bytes | SHA-256 |
|---|---:|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | 18159 | `4978e928ca6bc8dc42eafe4ee96d204f38428ff0ad5d650f3d76ea3c7dec4ee2` |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | 323429 | `9892c96c4c88eeae1495d9a1ea363642cf2780f37845de8de7f2004a67c2a19a` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | 72262 | `d3686b98f7d9164fd079b43b70f8b5035051db14c1c52562a07d1f864d56128d` |
| `docs/helix-labo/L10-verification/business-verification.md` | 16319 | `6e40b71ea81fd98fa6aa0db9e7d7d026596c537e8a1edeb0c2bebd2d3177f595` |
| `docs/helix-labo/L10-verification/functional-verification.md` | 549958 | `8b2efd0bd2996915085c0dc6568776f7cb9f3346111bbf3ae878c0443e0044ea` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | 62432 | `b9977b3eaecfa1ecdda8ddf3d90fdf747c80f763f622bae6148e08ae71595f67` |

## 条件3と次の状態

委任条件3（判断記録を追加した後も、承認対象6本文のbytesが変わらないこと）は未確認である。記録追加後のexact HEADを独立review側が読み、固定親・正式根拠・残余原文・6本文不変を照合するまでReady化しない。条件3確認後、review側は最新base、merge admission、merge可能性を再照合する。本decision recordのauthority effectは、当該記録がmainへadmitされた時点から有効となる。

fixtureは実行していない。実測性能、比較の実行結果、意味完全性、実装完了、release、Issue closeを主張しない。PRコメント、mailbox、CI状態から追加の要求採択や承認を生成しない。

## 旧HELIX sourceと過去監査

旧HELIXのBugbot bounded-repair source `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md`（`LEGACY-ASSET-D881AF6AFD277B1DE934`）75行の条件に基づき、同条件の費用・時間・手戻り・誤修復・未解消数を測る意味を、誤修復・未解消数を分母とoracleへ結ぶ範囲に限って再導出している。旧runtime、Bugbotや修復器の実装、実験許可は継承しない。旧asset台帳の扱い、raw literal 67件とreview01–13の時点証拠は、[review13 postbody audit](../audits/requirements-stage/labo-stage5-parent066-review13-postbody-audit-2026-10-07-3d3784307.json)（149485 bytes / SHA-256 `b15991353e31e2284908191093d3537dcd443e993597c4080ae00d3f3bb5e676`）に保持される。本記録はこれらを再分類・書換えしない。

根拠bundleは[`labo066-l3-l10-decision-evidence-2026-10-07.json`](../audits/requirements-stage/labo066-l3-l10-decision-evidence-2026-10-07.json)に保存する。bundleは全GitHub API comment objects、各bodyの独立したUTF-8 byte数/SHA catalog、review01–14のraw body、mailbox response、固定親・PO adoption row・6本文pin、旧source/asset row、過去postbody監査のfull rawを含む。Rootのreview13統合checkpointはbundle内sourceとして保持し、正本記録の代替にしない。

## 正式review01–14と訂正commentのraw body

各正式reviewのbodyは取得したUTF-8 bytesをそのまま保持する。R1–R50は各時点の原文と判定を保存し、現在のfindingへ再解釈しない。旧所見の解消・継承は各comment原文の結論どおりに読む。R番号の欠番を補作しない。comment API object全件とbodyごとのbyte数/SHAは根拠bundleに別々に収録する。

### comment 6021667388 — review01 — 7801 bytes / SHA-256 `028f68b0a3c4bb01b487c98da20b21e03f2f1a641cd2924e2ff92faac53df726`

`````text
## review01（independent review、PR #2635 親HELIXLABO-L2-066、HEAD b4349a53ce11ce8943463e6362cd2be44d8abf86、本文 fe489ac41、base main a1bcdba15）：Major 3

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼comment 6021561520に応える。方法はcomment 6013171449のとおり。

### 照合の方法
- **固定親**：PO判断記録`po-decision-2026-09-29-57candidates.md`の81行は、`HELIXLABO-L2-066`／採択／`MPR-RC-HELIXLABO-L2-066-001`である。照合の起点は、318ec4a（0dd946cecと同bytes）のL2-066（518–528、span `5a67776a…`）とL11-066（261–268、span `dd302f23…`）、§24の関係行。依存先はL2-059（戻し先は429行）、L2-055、L2-060、L2-061、L2-065。
- **ブラインド照合（Opus）**：固定親、依存先、6本文の追補129行（削除0）だけを読んだ。監査、PR comment、旧所見は見ていない。固定文を22群に種類分けし、対応CASE・ACに結び付けた。下のM1・M2を見つけた。
- **継続照合（Opus）**：旧#2620で066に向けた所見10件を全件判定した。解消8件、残余へ移すもの2件（review05 m5、m6）で、Majorとして残るものは0件。
  - 監査のpinを再計算し、下のR10〜R12を除いて全件一致した。監査JSONのSHA `685b7a39…`は依頼文の値と一致した。
  - 新しいMajorとして、下のM1・M2と同じ内容を独立に見つけ、さらにM3を見つけた。
- **reviewerの確認**：M1〜M3とも、固定親の原文と本文の該当行で確かめた。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### Major
**M1（効果達成・実験許可・Worker/修復器の選定と割当に、生成を拒否するfixtureがなく、2行が禁止範囲を狭めている）**
- **欠陥**：
  - 生成拒否のCASEは、CASE-44〜48（採択、repair permission、placement、admission、requirement_complete）と、CASE-04a（LABOによる修復の実行）だけである。効果達成、実験（run）許可、Worker/修復器の選定・割当を出力する誤りを検出するCASEがない。
  - CASE-48のoracleは「effect_achieved等の隣接fieldへ禁止範囲を広げない」、CASE-46のoracleは「assignment一般の境界は追加しない」と書き、固定L11が禁止する項目を検証の範囲から明示的に外している。
  - FR-03とAC-03の生成禁止の列挙にも、効果達成と実験許可が入っていない。BRとBVの文には「効果達成」「run許可」を生成しないとあるが、fixtureで確かめられていない。
- **起こりうること**：比較結果から効果達成、実験許可、Worker/修復器の選定・割当が作られても、L10で引っかからない。
- **守るべき行**：
  - HELIXLABO-L2-066に対応するL11「未見・権限境界」（318ec4a labo-acceptance.md:267「要求採択、効果達成、実験許可、Worker/修復器の選定・割当・実行、authorityを生成しない」）
  - L2-066（labo-requirements.md:520「実験実行許可を生成しない」、:526「LABO自身はWorker/修復器を選定・割当・起動・実行しない」）

**M2（task／scope／target revisionの不一致の戻し先が、固定親の区分にない）**
- **欠陥**：
  - CASE-17/18/19は、task、scope、target revisionが両群で食い違う場合を、HARNESSまたは要求ownerへ戻している。
  - FR-03とNV-01は「oracle/acceptance/task-scope contractはHARNESSまたは要求owner」を「固定L2の既知責務区分」として書いている。
  - 固定L2-066がHARNESS/要求ownerに割り当てるのはoracleだけである（:526）。066が再利用するL2-059の戻し先は「task/scope/assignment/result/receipt欠落はOSまたは観測source」（:429）で、L2-060はcomparison scopeをLABOに置く（:454）。task/scopeをHARNESS/要求ownerへ返す根拠は固定親にない。
- **起こりうること**：比較条件の不一致が、責務を持たないownerへ返され、本来のownerへ届かない。
- **守るべき行**：L2-066「依存・責務境界」（:526）、「戻し先・未完義務」（:527）、L2-059「戻し先」（:429）。

**M3（未見のfixtureが、戻し先を返していない）**
- **欠陥**：AC-02と、唯一の未見fixtureであるCASE-02は、未見caseに同じpredicate/oracleを適用できない場合に「unknown/未評価を保持」するだけで、戻し先がない。
- **起こりうること**：初見のAやoracle適用性の不明が、どのownerにも返らずに残る。
- **守るべき行**：L11「未見・権限境界」（labo-acceptance.md:267「未評価/比較不能と必要なownerへの戻し先を返す」）。oracle適用性のownerはL2-066:526でHARNESSまたは要求ownerと決まっている。

### 後で直す残余（承認を止めない）
- **R1（AC帰属）**：AC-02は「FR-01/02/03」とするが、CASE-02はFR-02だけに結んでいる。
- **R2（BVの文言）**：business-verificationは「独立BV…を追加しない」と書く一方で、`LABO-066-BV-01`というIDを定義している。
- **R3（固定revisionの表記）**：FRと監査は`0dd946cec`、PO判断記録は`318ec4a`。file SHAとspan SHAはすべて一致し、内容差はない。
- **R4（unknownで終わる戻し先）**：CASE-03a/b、05、06、14–16、34、36–38、40は「ownerを特定できなければunknown」で終わる。固定L2-066自体が、Aの定義、protocol、toolchain、environment、cutoffの供給ownerを名指ししていない。unknownは保持され、LABOの評価義務も残る。run条件の一部は059:429の「OSまたは観測source」に結べる余地がある。
- **R5（戻し先の文言）**：CASE-09は戻し先が「HARNESS」だけで、固定親の「HARNESSまたは要求owner」より狭い。CASE-04aの「OS/Worker」はWorkerを加えている。
- **R6（束ね・重複）**：CASE-12と42、03aと33、03bと11が実質重複している。CASE-09と43はどちらも結果後のoracle変更を扱うが、区別が本文にない（review05 m5の残り）。
- **R7（戻し先の不一致）**：CASE-42は、sourceを特定できた場合の宛先がない。CASE-12/41はLABO-055で、そろっていない（review05 m6の残り）。
- **R8（文言の不一致）**：CASE-06のoracle「母集団を分離」とCASE-05の「合算せず」は、固定L2:525の「比較不能」と文言がそろっていない。
- **R9（所見IDの誤記）**：FV:32が「review05のm3/m5/m6」と書いている。066の所見はM3で、review05のm3は066の所見ではない。
- **R10（監査の外部参照）**：監査JSONの`canonical_authoring.worktree`（`/home/tenni/.helix-worktrees/l3-labo-stage5-parent066`）と`root_body_checkpoint.path`（`/tmp/root-labo066-body-checkpoint.json`）は、repository外のpathで再現できない。
- **R11（監査の行番号の時点）**：`current_52_table.line_number`は本文revision fe489ac41の行番号で、HEADでは+62行ずれる。どの時点の行番号かが書かれていない。
- **R12（監査の所見ID）**：JSONの`root_candidate_corrections`が、M3とm3を識別したと記録していて、R9と同じ混同がある。

### 判定
- blocker 3（M1、M2、M3）。Major 3、残余12、未確認範囲0。
- 委任承認は成立しない。Readyにはしない。merge admissionは本commentから生成しない。
- M1〜M3を直したHEADでは、reviewerが差分を確かめる。Opusが`no_findings`なら、同じHEADでFableにブラインドで見てもらう。
`````

### comment 6021867857 — review02 — 6805 bytes / SHA-256 `758d6023f71dd701a96506ba3530f28fc7b709c99171223a827100055ff0a53c`

`````text
## review02（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 927f906559359383cdeee7728ce840c1e0c0826d、本文 bea34ae00、base main a1bcdba15）：Opus no_findings／Fable「承認してよい」

reviewer：Claude（lane `review_merge`、Opus 5.5）。

### Opus（条件1）
- **本文の差分**：b4349a53cからの本文の差分は、FR-03・AC-02・AC-03の3行、NV-01の1行、FVのCASE-02/17/18/19/46/48の6行の書き換えと、CASE-49〜56の8行の追加だけ。
- **review01 M1の解消**：
  - CASE-49〜56が、評価材料だけから`effect_achieved`、`experiment_run_permission`、`selected_worker`、`selected_repair_method`、`worker_assignment`、`repair_method_assignment`、`worker_started`、`repair_method_execution`を生成する誤出力を、それぞれ入力不変・誤出力1点で拒否する。定型8行は代表行を全文で読み、可変語（field名）以外が全行で一致することを確かめた。
  - CASE-46/48の「assignment一般の境界は追加しない」「effect_achieved等の隣接fieldへ禁止範囲を広げない」は消え、別CASEで照合する書き方になった。
  - FR-03とAC-03の生成禁止の列挙に、効果達成、実験/run許可、Worker/修復器の選定・割当・起動・実行が入った。
  - 固定L11「未見・権限境界」（318ec4a labo-acceptance.md:267）、L2-066（labo-requirements.md:520、:526）と一致する。
- **review01 M2の解消**：CASE-17/18/19、FR-03、NV-01が、task/scope/target revisionの入力recordの不一致を「OSまたは観測source」へ返す。oracle/acceptance適用性はHARNESSまたは要求owner、comparison scopeはLABOに置いた。L2-066:526、L2-059:429、L2-060:454と一致する。
- **review01 M3の解消**：AC-02とCASE-02が、未見caseのoracle適用性不足をHARNESSまたは要求ownerへ返し、A identity/conditionの不足はその入力の既存sourceへ戻す。L11:267、L2-066:526と一致する。
- **差分外の行**：review01（comment 6021667388）のブラインド照合と継続照合で、全行を照合済み。未確認範囲は0。
- **新しい処置監査**：review01 commentのbytes（7801）とSHA `028f68b0…`がJSONに入っていて、APIのbody原文と一致した。JSONのSHAは`33019837…`。JSONは引き続き`/tmp/root-labo066-body-checkpoint.json`を参照している（R10）。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功（baseからは追加だけ）
  - origin/mainとの`merge-tree`は衝突なし
  - CASE定義行は60

**判定：no_findings（未確認範囲0）**。

### Fable（条件2）
Fable advisor（Fable 5.1）は、本HEADでブラインドに照合した。監査、PR comment、旧所見は見ていない。読んだのは次のとおり。
- 318ec4aのL2-066（518–528）とL11-066（261–268）、§24表の関係行
- 依存先のL2-055/059/060/061の該当箇所
- 採択記録（PO判断記録の81行）
- 6本文の追補137行（削除0）

固定文を24群に種類分けし、対応CASE・ACに結び付けた。pin digestがPO採択行と一致すること、CASE 60行・ID重複0、定型行群の一致も機械確認している。

結論は原文のまま「**承認してよい**」。Majorは0件。
- 比較条件7要素と、固定L2の生成禁止5要素の全部に単独fixtureがある。L11の禁止列挙も、authorityの総称を除いて具体fieldで被覆されている。
- 生成拒否fixtureはCASE-44〜56の13行。
- 戻し先は固定親の区分名（HARNESS/要求owner、OS、観測source、SECURITY、LABO）か、066が再利用する059の戻し先行に辿れる。宛先のない項目はunknownを保持し、個別ownerを作っていない。
- 人の判断は不要。

### 後で直す残余（承認を止めない）
review01の残余R1〜R12（comment 6021667388の原文）を引き継ぐ。Fableの今回の残余のうち、次のものは既存の残余と重なる。
- `LABO-066-BV-01`のL3側の対応がない → R2
- CASE-09の戻し先の狭さ、CASE-42の宛先 → R5・R7
- 「review05 m3/m5/m6」の由来記述 → R9

既存の残余と重ならないものは、次のとおり追加する。
- **R13（表の構造、優先）**：FV:3243の段落（「この表は候補fixture設計である…」）の直後に、空行とheader行なしでCASE-49〜56（3244–3251）が続いている。GFMではこの8行は表として読まれず、段落の続きになる。review01 M1を解消したfixtureがこの8行なので、機械で表を読むと生成拒否fixtureが落ちる。同じ段落の「CASE-44..48はこの候補内の安定ID」も、49〜56に触れていない。
- **R14（件数）**：L10の見出しは「52 CASE」（FV:3176）だが、定義行は60（索引2行を除いて58）。本文の「旧47 CASE ID」との関係も本文内で説明されていない。
- **R15（時点の文言）**：FR-01の「比較開始後に…変更しない」は、固定親の「結果後／結果を見る前」より早い時点を指しうる。CASE-21/09/43は固定親どおり「結果後」で書かれている。
- **R16（単独fixtureの不足）**：「修復器の実装」の生成拒否（L2:520）、「authority」総称の生成拒否（L11:267）、「欠測caseを除いて率を改善」の単独変異（L2:525）。いずれも近接fixtureで間接に被覆されている。
- **R17（索引）**：CASE-04aだけがあり、CASE-04が存在しない。

### 条件3：6本文のbytes（本HEAD）
| path | SHA-256 |
|---|---|
| docs/helix-labo/L3-requirements/business-requirements.md | `77f70aa2429d3aa7e447b1892eeb7f761606a9da945760f9415e0c64648ecd39` |
| docs/helix-labo/L3-requirements/functional-requirements.md | `8827b5e3ae820b31b29745ecebc50b7f7cbbc0051f6c9eae083be49cbf2faafe` |
| docs/helix-labo/L3-requirements/nfr-grade.md | `548dfc3f85f9b27f1926a9d2e5883bfb6e14768a61cf4cbf87f95cdfca89009c` |
| docs/helix-labo/L10-verification/business-verification.md | `b2af1cc8c934864d211219b4a60fd563a5fa159ea6552f58e01b34bcdaf0cb7d` |
| docs/helix-labo/L10-verification/functional-verification.md | `4244a25c5e85c4903bc68d39fa2bafdf4b29d2ce3010291bdb2c1c1734ff5564` |
| docs/helix-labo/L10-verification/nfr-verification.md | `82f8deea7c1840cbd8141434583a1eb2fac5369ea900a9355df4a2153e89d01b` |

### 判定
- 本HEAD（本文bea34ae00）で、委任条件1と条件2がそろった。
- 作成側は、判断記録を追加してよい。判断記録には、本comment、6本文のSHA、残余R1〜R17を固定する。
- 追加後のHEADで、reviewer側が条件3とpinを照合する。
- merge admissionは、本commentから生成しない。
`````

### comment 6022136338 — review03 — 4924 bytes / SHA-256 `6570c9cf712d070435af3e57b0624df00de36080a4a9804678b87c438777c8a6`

`````text
## review03（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 650c18ed077060024c4e62f79a094d2ebeaf2c6b、本文 1c39d91e6、base main a1bcdba15）：Opus no_findings／Fable「承認してよい」

reviewer：Claude（lane `review_merge`、Opus 5.5）。review02（comment 6021867857、HEAD 927f90655）の判定は、このHEADへ継承しない。

### Opus（条件1）
- **本文の差分**：927f90655からの本文の差分は、review02の残余R13〜R15の補正だけ。
  - **R13（表の構造）**：CASE-49〜56の前にあった説明段落が表の後ろへ移り、CASE-01〜56の60行が1つの連続した表になった（FV:3190–3249）。表の後ろの段落の「CASE-44..48」は「CASE-44..56」になった。
  - **R14（件数）**：見出しと前文が「60 CASE（旧47 IDを保持し、生成拒否13 IDを追加。索引2行を除く定義は58行）」になった。実数と一致する。
  - **R15（時点）**：FR-01の時点の文言が、固定親の「結果を見る前／結果後」に合わせて書き直された。
- **意味の照合**：review02でOpus no_findingsとした本文から、意味の変更はない。review01 M1〜M3の解消（CASE-49〜56、CASE-17〜19の戻し先、AC-02/CASE-02の戻し先）も変わっていない。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功（baseからは追加だけ）
  - origin/mainとの`merge-tree`は衝突なし（#2636のmerge後の最新mainでも衝突なし）

**判定：no_findings（未確認範囲0）**。

### Fable（条件2）
Fable advisor（Fable 5.1）は、本HEADでブラインドに照合した。監査、PR comment、旧所見は見ていない。読んだのは次のとおり。
- 318ec4aのL2-066（518–528）とL11-066（261–268）、§24表の関係行
- 依存先のL2-059/060/061/065の該当箇所
- 採択記録（PO判断記録の81行）
- 6本文の追補137行（削除0）

pin（file／span／採択行のSHA）、CASE 60行と定義58行、AC別の件数、定型行群（CASE-49〜56、14〜20・36〜40のbaseline、17〜19のoracle）の一致を機械で確かめている。

結論は原文のまま「**承認してよい**」。Majorは0件。
- 比較条件の8要素と、固定L2の生成禁止5要素の全部に、単独fixtureがある。L11の権限境界の列挙も、CASE-44〜56で受けている。
- 戻し先はFR-03の4区分に固定され、全CASEのowner routeがその区分内か、「区分保持＋個体unknown併記」で閉じる。
- 人の判断は不要。

### 後で直す残余（承認を止めない）
review01・02の残余R1〜R17（comment 6021667388と6021867857の原文）を引き継ぐ。R13〜R15は今回の補正で受けた。Fableの今回の残余のうち、次のものは既存の残余と重なる。
- 「欠測caseを除いて率を改善」の単独fixture、「authority」一般 → R16
- CASE-09と43の重なり → R6
- CASE-04aの「Worker」 → R5
- 059由来の戻し先の区分名 → R4
- `LABO-066-BV-01` → R2
- 固定revisionの表記 → R3
- review05所見の参照 → R9

既存の残余と重ならないものは、次のとおり追加する。
- **R18（比較目的）**：L2-066「入力」の第1要素「比較目的」が、FR-01とB0に明示されていない。単独fixtureもない。
- **R19（文言）**：多くの行のbaselineにある「準備条件は原文にある場合そのまま保持」の「原文」が、何を指すかはっきりしない。

### 条件3：6本文のbytes（本HEAD）
| path | SHA-256 |
|---|---|
| docs/helix-labo/L3-requirements/business-requirements.md | `77f70aa2429d3aa7e447b1892eeb7f761606a9da945760f9415e0c64648ecd39` |
| docs/helix-labo/L3-requirements/functional-requirements.md | `39f1eafefbe17238a6c797655dbf6690e3c0e089c1076a464e17d4bb2add1c9d` |
| docs/helix-labo/L3-requirements/nfr-grade.md | `548dfc3f85f9b27f1926a9d2e5883bfb6e14768a61cf4cbf87f95cdfca89009c` |
| docs/helix-labo/L10-verification/business-verification.md | `b2af1cc8c934864d211219b4a60fd563a5fa159ea6552f58e01b34bcdaf0cb7d` |
| docs/helix-labo/L10-verification/functional-verification.md | `9f144a92252a61d9b6bdace46ccb0c385b4be026da791adcc0ad1f5731bd1e2c` |
| docs/helix-labo/L10-verification/nfr-verification.md | `82f8deea7c1840cbd8141434583a1eb2fac5369ea900a9355df4a2153e89d01b` |

### 判定
- 本HEAD（本文1c39d91e6）で、委任条件1と条件2がそろった。
- 作成側は、判断記録を追加してよい。判断記録には、本comment、6本文のSHA、残余R1〜R19を固定する。
- mainは#2636のmergeでf5a974a40へ進んだ。判断記録の追加とあわせて最新mainを取り込む場合は、066の追補のbytesが変わらないことを、reviewer側が照合する。
- merge admissionは、本commentから生成しない。
`````

### comment 6022267028 — review04 — 3864 bytes / SHA-256 `c4c3dca7ed73c837966b5694a6003bbe3505dea8fee89864f47b8d7010bbcb34`

`````text
## review04（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 68c866829106ebad975f162186aedb80f9fbe212、base main f5a974a40）：Major 1

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-04` に応える。

### 照合の方法と結果
- **066の追補のbytes**：
  - 6本文とも、前回の照合HEAD 650c18ed0（base a1bcdba15）と今回（base f5a974a40）で、追加行の集合のSHA-256が一致した。
  - 差分は追加だけで、削除は0行。main側にある067の追補は、bytesのまま残っている。
  - 監査6ファイルは、blobを変えずに`requirements-stage/`へまとめられた。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/main f5a974a40との`merge-tree`は衝突なし
- **Opusのブラインド照合**（このHEADで取り直した。Major 5類型だけを見て、067の追補との関係も確認した）：Major 1件。下のM1である。
- **reviewerの確認**：M1は、固定親の原文と、6本文の追加行にある「Bugbot」「実装」の出現箇所すべてで確かめた。
- **review03の訂正**：066の追補はreview03とbytesが同じなので、M1はreview03の時点でもあった。review03のOpusの照合とFableの見解はこれを見落としていた。review03の「Major 0」は、ここで取り消す。
- **今後の流れ**：Majorがあるので、Fableの判断は回していない。

### Major
**M1（固定親が禁じる「旧Bugbot候補の採択」と「Bugbot・修復器の実装」の生成に、拒否fixtureがない）**
- **欠陥**：
  - 6本文の生成拒否fixtureはCASE-04aとCASE-44〜56である。拒否している出力は次のものに限られる。
    - 066の採択decision、repair_permission、placement、admission
    - requirement_complete、effect_achieved、experiment_run_permission
    - Worker・修復器の選定、割当、起動、実行
  - 旧Bugbot候補の採択を生成すること、Bugbotや修復器の実装を生成すること（実装の開始や要求を含む）は、どのfixtureも拒否していない。
  - L3の`LABO-066-FR-03`と`LABO-066-AC-03`の生成禁止の列挙にも、この2項目がない。
  - 「実装」は、各候補の状態行と旧source処置の散文に出てくるだけである。
- **守るべき行**：
  - HELIXLABO-L2-066「kind / parent / status」（318ec4a labo-requirements.md:520「旧Bugbot候補の採択、Bugbotや修復器の実装、実験実行許可を生成しない」）
  - L11-066（labo-acceptance.md:263「旧Bugbot候補の採択、Bugbot/修復器の実装、比較runの許可を生成しない」、:268のauthority生成の禁止）

### 後で直す残余（承認を止めない）
- **R20（語の衝突）**：CASE-49〜56は「合成scope S0」を使う。066のB0にはS0の定義がない。S0はmain側067のB0（functional-verification.md:3180）で使われている語である。067の意味は変えていない。
- **R21（戻し先の狭まり）**：CASE-09は戻し先を「HARNESS」だけにしていて、固定親の「HARNESSまたは要求owner」より狭い。宛先は決まっているので、残余とする。
- **R22（未評価の範囲）**：CASE-08、27、28は「群別／片側の結果を未評価」と書いている。比較全体を未評価にすることまでは明示していない。
- **R23（直接の注入fixtureがない）**：「unknownを0にする」誤りを直接注入するfixtureがない。この誤りは、CASE-03dとCASE-35の「rateを確定しない」oracleで検出される。
- **R1〜R19**：review03から変わらない。

### 次の手順
- M1を直す。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6022726411 — review05 — 5026 bytes / SHA-256 `03801d8d8d1afbc35435e79adf43ecf73a4e00c4e248bc5de815696eadafe886`

`````text
## review05（independent review、PR #2635 親HELIXLABO-L2-066、HEAD e839d048fecb2d043eb6eb0fbad05c5401365424、base main f5a974a40）：Major 1

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-05` に応える。

### 照合の方法と結果
- **Opusのブラインド照合**：Majorの候補として1件を挙げた。CASE-05・06のexpectedに「比較不能/未評価」がない件である。
  - reviewerは、これを残余（下のR24）とした。両CASEが属する`LABO-066-AC-03`が、「条件不一致…cutoffの事後変更を与え、率を出さず比較不能/未評価へ分ける」と定めているからである。
  - この判断を、Fableと敵対照合にも確かめてもらった。
- **Fableの判断**：「承認してよい」。CASE-05・06を残余とした判断に同意した。
- **Opusによる敵対照合**：「Fableの判断を支持する」。
  - ただし残余として、CASE-03d・03eが置いている「ownerを特定できる場合だけ返す」という条件付きの例外を挙げた。
- **reviewerの確認**：この条件付きの戻し先を、固定親と過去の判定に照らして確かめた。その結果、下のM1とする。
  - 条件1・2は、Opus・Fableともに「Major 0」で一致した。
  - しかし、reviewerが確認したMajorが残るので、このHEADではmergeへ進まない。
- **review04 M1**：解消した。旧Bugbot候補の採択はCASE-57、Bugbotの実装要求・開始・成果はCASE-58〜60、修復器の実装要求・開始・成果はCASE-61〜63が、それぞれ単独で拒否している。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### Major
**M1（戻し先が「ownerを特定できる場合だけ」に条件付けられ、固定親の無条件の返却を狭めている）**
- **欠陥**：L10 functional-verificationの次の4行のoracleが、戻し先を条件付きにしている。
  - `L10-LABO-066-CASE-03d`：「適用可能性/receiptの既存責務ownerを特定できる場合だけ返し」
  - `L10-LABO-066-CASE-03e`：「解決状態sourceの既存ownerが特定できる場合だけ返し、特定不能はunknownを残す」
  - `L10-LABO-066-CASE-05`：「method/versionの既存責務ownerが特定できれば返す。できなければunknownを保持する」
  - `L10-LABO-066-CASE-06`：「cutoff/母集団の既存責務ownerが特定できれば返す。できなければunknownを保持する」
- **何が狭まっているか**：固定親は、oracle/判定receipt、A定義/版、結果receiptなどの不足や不一致を、条件を付けずに各責務ownerへ返すとしている。責務の区分も既知である。oracleはHARNESSまたは要求owner、実行とassignmentはOSである。上の4行では、ownerの個体を特定できない場合に返却そのものが行われない。
- **これまでの判定との一致**：戻し先を「特定できる場合」に条件付けた形は、067 M1と041 M1でMajorとした。
  - 068は「既知の責務区分へ返し、個体ownerが不明なら別にunknownを保持」としていて、区分への返却は無条件である。今回の4行はこれと違う。
  - 4行はreview01から同じ文言で、reviewerはreview01〜04でこれを見落としていた。
- **守るべき行**：
  - HELIXLABO-L2-066「戻し先・未完義務」（318ec4a labo-requirements.md:527「…oracle/判定receipt、結果・費用・時間receiptの不足や不一致は、各責務ownerへ返し、unknown/未評価/比較不能を維持する」）
  - L11-066「未見・権限境界」（labo-acceptance.md:267「…未評価/比較不能と必要なownerへの戻し先を返す」）

### 後で直す残余（承認を止めない）
- **R1〜R23**：review04から変わらない。
- **R24（CASE-05・06の書き方）**：expectedに「比較不能/未評価」が書かれていない。AC-03が定めているので残余とする。M1を直すときに、あわせて追記するのが望ましい。
- **R25（遡及変更の禁止）**：L2:527「059の採択状態や1.0適用条件を遡及変更しない」に当たる明文が、FR、AC、CASEのどれにもない。今回の差分は059に触れていない。
- **R26（Aのversion）**：Aのversionだけを欠かす単独のfixtureがない。AC-02とCASE-03a・33・39・40が、Aを推測しないことを確かめている。
- **R27（戻し先の書き漏れ）**：CASE-21・23・24・43のoracleに戻し先がない。CASE-09と43、CASE-03cと20は内容が重なっている。

### 次の手順
- M1を直す。CASE-03d・03e・05・06で、既知の責務区分へ無条件に返し、個体ownerが不明な場合は別にunknownを保持する形にする。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6022900353 — review06 — 3393 bytes / SHA-256 `d599d51a4d1edaf90cdfc023e6f7ef1e04befa31391ba823afd96cb6f877a844`

`````text
## review06（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 8c700e9c9b185eb266408ee9cd170975caf74f24）：Major 1（review05 M1の一部が未解消）

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼comment 6022886729（`RH-PR2635-LABO-STAGE5-PARENT066-06`）に応える。

### 照合の結果
- **review05 M1で名指しした4行**：解消した。
  - CASE-03d・03e・05・06は、既知の責務区分へ無条件に返すように直っている。oracleの適用性はHARNESSまたは要求owner、assignment/run receiptはOS、そのほかはその供給元の区分へ返す。
  - 個別のowner identityが不明な場合は、別にunknownとして保持している。
  - R24（CASE-05・06の「比較不能/未評価」）も解消した。
- **同じ型が3行に残っている**：reviewerは、6本文の追加行を「特定できれば」「特定できる場合だけ」でgrepした。その結果、次の3行が条件付きの戻し先のまま残っていた。
  - `L10-LABO-066-CASE-03a`：「A/source identityの既存責務ownerが特定できれば返し、できなければunknownを保持する」
  - `L10-LABO-066-CASE-03b`：「母集団/denominatorの既存責務ownerが特定できれば返し、できなければunknownを保持する」
  - `L10-LABO-066-CASE-11`：「母集団/denominatorを生む既存sourceが特定できる場合だけ返し」
  - review05では対象を4行だけ名指しし、同じ型の全件を挙げていなかった。この挙げ漏れはreviewerのものである。M1は、この3行が残っているので未解消とする。
- **baseとHEADのずれ**：依頼のbaseは`3c3c512c0`だが、HEADはこのcommitを含んでいない。merge-baseは`f5a974a40`である。
  - そのため、`3c3c512c0..HEAD`の差分には、mainにある親042の判断記録・監査・HARNESSの6本文が、削除として現れる。
  - origin/mainとの`merge-tree`は衝突なしなので、mergeした結果は042を保つ。ただし、判断記録に書くreview baseとHEADの関係が成り立たない。
  - 次の依頼では、mainを取り込むか、baseを`f5a974a40`として依頼してほしい。
- **静的検査（このHEAD）**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
- **今後の流れ**：Majorがあるので、ブラインド照合とFableの判断は回していない。

### Major
**M1（review05 M1の残り：戻し先が「ownerを特定できる場合だけ」に条件付けられている）**
- **欠陥**：上の3行である。ownerの個体を特定できないと、返却そのものが行われない。
- **守るべき行**：
  - HELIXLABO-L2-066「戻し先・未完義務」（318ec4a labo-requirements.md:527「Aの定義/版、eligible case集合…の不足や不一致は、各責務ownerへ返し」）
  - L11-066（labo-acceptance.md:267）

### 次の手順
- 3行を、ほかの4行と同じ形に直す。既知の責務区分へ無条件に返し、個体のowner identityが不明な場合は別にunknownを保持する。
- 直した後に、6本文の追加行に「特定できれば」「特定できる場合だけ」が0件であることを確かめてほしい。
- baseとHEADのずれを直す。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6023233721 — review07 — 5458 bytes / SHA-256 `7e8be82c2e00b1169ba0a46c3f660221f6f08de63adce41ef974281075b8adb6`

`````text
## review07（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 1ddcb018c1f1ffba3a0cbc9bcad12faa1059f09d、base main 3c3c512c0）：Major 2

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼comment 6023030271（`RH-PR2635-LABO-STAGE5-PARENT066-07`）に応える。

### 事前確認と静的検査
- **採択記録**：HELIXLABO-L2-066の採択記録は、mainでは57候補の81行（`-001`）だけである。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。review06のX1は解消した。
- **条件付きの戻し先**：拡張した正規表現で0件だった。review06のM1も解消した（CASE-03a、03b、11を含め、条件付きの返却はない）。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### 照合の経過
1. **Opusのブラインド照合**：Majorの候補を2件挙げた。下のM1とM2にあたる。reviewerは2件とも残余と判断し、その判断が正しいかの確認をFableと敵対照合に明示して渡した。
2. **Fableの判断**：「承認してよい」。reviewerの2つの判断に同意した。
3. **Opusによる敵対照合**：「Fableの判断を支持しない」。2件とも崩した。
4. **reviewerの確認**：L3のFR-03とAC-03の全文、および該当CASEを読み直した。敵対照合のとおり、2件ともMajorと確定する。
   - **ブラインド照合の段階でreviewerが残余とした判断は誤りだった。**
   - M2では、「AC/FRの共通規定で宛先が決まる」としたが、その共通規定（FR-03、AC-03）自体が「区分を保つ」とだけ書いていて、「返す」とは書いていなかった。

### Major
**M1（事後変更のfixtureが、比較を不成立／未評価にすることを求めず、AC-03とも矛盾する）**
- **欠陥**：次の3件のfixtureは、どれも当該比較を不成立／未評価にすることを求めていない。事後変更を試みられた比較でも、率を確定して出す実装が合格してしまう。
  - `L10-LABO-066-CASE-09`：「事後変更を拒否し事前oracleで再評価」
  - `L10-LABO-066-CASE-21`：「事前集合からの変更を拒否する」
  - `L10-LABO-066-CASE-43`：「事後oracle変更を拒否し、元oracle結果を保持する」
- **ACとの矛盾**：同じ追補の`LABO-066-AC-03`は、「oracle/N/cutoff事後変更を与え、率を出さず比較不能/未評価へ分ける」と定めている。CASEの期待値は、自分が属するACと直接食い違う。
- **守るべき行**：
  - L11-066（318ec4a labo-acceptance.md:266「結果を見た後でeligible集合・分母・oracleを変更する…それぞれ当該比較を不成立または未評価とし」）
  - L2-066（labo-requirements.md:525「結果後に分母やoracleを変えない」）

**M2（L3のFR-03とAC-03に返却の義務がなく、固定親の「各責務ownerへ返し」が「区分を保つ」に狭まっている）**
- **欠陥**：
  - `LABO-066-FR-03`は「固定L2の既知責務区分を保つ」と書き、`LABO-066-AC-03`は「既知owner区分を保ち」と書いている。どちらにも、不足や不一致を返すという記述がない。
  - 返却を書いたL3の文は、AC-02だけである。AC-02は、B0とは別の合成比較scopeにある未見のN1に限った文である。
  - AC-03に紐づく次のCASEは、期待値に戻し先がない。上位のAC-03にも返却の義務がないので、この書き漏れを捕まえるACが存在しない。区分を保っていれば合格するため、ownerへ返さない実装も通る。
    - CASE-33、39、40：A identityの欠落、不一致、stale
    - CASE-23、24：oracleに結ばない件数。oracleや判定receiptの不足にあたる
- **守るべき行**：L2-066「戻し先・未完義務」（labo-requirements.md:527「Aの定義/版、eligible case集合、対象scope/revision、oracle/判定receipt、結果・費用・時間receiptの不足や不一致は、各責務ownerへ返し、unknown/未評価/比較不能を維持する」）

### 後で直す残余（承認を止めない）
- **R1〜R27**：review05から変わらない。
- **R28（語の残り）**：CASE-04aの戻し先「OS/Worker責務」にある「Worker」は、固定親の責務区分にない語である。
- **R29（自己矛盾）**：business-verificationの追補が、「独立BV/AC/BCASEを追加しない」と書いた直後に、`LABO-066-BV-01`を定義している。
- **R30（節の配置）**：functional-requirementsとnfr-verificationで、066の`###`節が、067の「## Stage 5」見出しの配下に置かれている。
- **R31（登録の補正）**：登録簿では、`MPR-RC-HELIXLABO-L2-066-002`が`-001`をsupersedeしている。semantic digestは同じで、locatorのmetadataを直しただけで、authority_effectはnoneである。PO判断記録の行は`-001`のままである。

### 次の手順
- M1：CASE-09、21、43の期待値を、AC-03と固定L11のとおり、当該比較を不成立／未評価にする形に直す。
- M2：FR-03とAC-03に、固定L2:527の返却の義務を書き、AC-03に属する異常CASEの期待値に戻し先をそろえる。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6024163899 — review08 — 4286 bytes / SHA-256 `126d1b3f3190edf3eaaaff39dadf04cff9a21f92e89c003dcae88a44e4199b04`

`````text
## review08（independent review、PR #2635 親HELIXLABO-L2-066、HEAD a0f531a1db4f011d4169b4b67ea6aa99e869932b、base main ceda1c53b）：Major 1

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-08` に応える。

### 事前確認と静的検査
- **採択記録**：57候補記録81行（`MPR-RC-HELIXLABO-L2-066-001`）。後日の別revisionの採択はない。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし
- **差分の範囲**：base→HEADの差分にはmain 069節が文脈として見えるが、照合したのは066節だけである。

### 照合の経過
1. **review07の解消の確認**（reviewerが本文修正commit 63761d6acを読んで確かめた）：
   - **M1**：解消した。
     - CASE-09/21/43は、事後変更のある当該比較を「不成立/未評価」にし、率を出さない。
     - 変更前の記録は、時点履歴として分けて保存する。
   - **M2**：解消した。
     - FR-03とAC-03に、固定L2-066:527の不足・不一致を「個別identityを特定できるかにかかわらず」原因別の既存責務へ返す義務が入った。
     - CASE-33/39/40/23/24にも返却先が入った。
2. **Opusシンプルブラインド**：Major 1。Majorがあったので、Fableへは回していない。
   - ブラインドも、review04〜07の各指摘が解消していることを確かめた。
   - 「ownerを特定できる場合だけ」の条件付けは消えている。
3. **reviewerの確認**：固定L2:524の全文を読み、066の全CASEで「理由」「影響」をgrepした。該当は0件だったので、Majorと確定した。

### Major
**M1（unknownのcaseについて、「理由」と「影響するcase」の表示を照合するCASEがない）**
- **欠陥**：
  - unknownを扱うCASE-02、03d、35の判定は、「Nや記録に残し、rateを確定しない」「unknown/未評価を保持」までである。
  - unknownの理由と影響するcaseを出力に表示するかは、どのCASEも判定していない。066の全CASEに、「理由」「影響」の語は0件である。
  - 正常fixtureのCASE-01のB0には、unknownのcaseがない。そのため、正常判定で値の一致を確かめる形にもなっていない。
  - 理由や影響caseだけを欠落させる、または別値にする単独CASEもない。
  - L3 NG-01の「unknown理由」は、追跡fieldの候補にとどまり、fixtureではない。
  - そのため、理由も影響caseも出さずに未評価とする出力が合格する（類型4）。
- **守るべき行**：固定L2-066（318ec4a labo-requirements.md:524）「oracleが適用不能または証拠不足のcaseはunknownとして分母から黙って除かず、理由・影響するcaseを表示してその比較を未評価/比較不能にする」
- **見落としの経緯**：この点は、review01からのHEADにあった。reviewerが、出力要素の照合（固定L2が定める出力ごとに、正常判定か単独CASEで照合されているか）を、#2637 review06から始めた。今回の初回適用で見つかったものである。作成側の後退ではない。

### 後で直す残余（承認を止めない）
- **R1〜R31**：review07から変わらない。
- **R32（CASE-04aの戻し先の表記）**：戻し先が「OS/Worker責務」になっている。固定L2:526の区分は「実行/assignmentはOS」で、Workerは区分にない。宛先は事実上OSと読める。
- **R33（生成拒否fixtureの対称性）**：Workerの「実行」と修復器の「起動」には、単独の生成field CASEがない。04a、55、56で実質的に覆われている。

### 次の手順
- M1を直す。unknownのcaseを含む正常fixtureを置き、判定で「理由」と「影響するcase」の表示を確かめる。または、理由・影響caseだけを欠落させる単独CASEを置く。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6024797170 — review09 — 5101 bytes / SHA-256 `e9afd70d3dfb6016c1473c5eaf041c798ba994a05039d472ce236d1b0cae3576`

`````text
## review09（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 5407a32fecbfb1de4ed978b6edf096e995ae030d、base main ceda1c53b）：Major 1

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-09` に応える。

### 事前確認と静的検査
- **採択記録**：57候補記録81行（`MPR-RC-HELIXLABO-L2-066-001`）。後日の別revisionの採択はない。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - origin/mainとの`merge-tree`は衝突なし

### 照合の経過
1. **review08の解消の確認**（reviewerが差分で確かめた）：M1は解消した。
   - unknownのcase Qunknownを含む正常fixture（r08-unknown-display-normal）が置かれた。判定で、理由と影響case identityが元のreceiptと一致することを照合する。
   - 理由と影響caseのそれぞれに、欠落と不一致の単独CASE（計4件）が置かれた。
   - 出力の誤りは、LABO自身の表示処理の訂正として扱っている。
2. **Opusシンプルブラインド**：Major 3。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：固定L2の523〜527行、採択済み059の戻し先行（318ec4a labo-requirements.md:429）、CASE-01の判定、066節で件数・群を変異させるCASEを読んだ。
   - ブラインドの1件目と2件目は、059の原文を根拠として下のR34・R35とした。
   - 3件目は、M1としてMajorと確定した。

### Major
**M1（出力の分子値と群への帰属が、receiptと一致するかを照合していない）**
- **欠陥**：
  - 正常のCASE-01の判定は、「A/候補の各群についてmisrepair_count/Nとunresolved_count/Nを分子・分母・case判定receipt付きで別々に再構成し」にとどまる。出力された分子・分母が、receiptから再構成した値と一致するかは判定していない。B0にも、期待値の具体値がない。
  - 単独CASEも、次の範囲にとどまる。
    - CASE-23/24：linkageの欠落
    - CASE-25/26、29〜32：件数表示の脱落
  - 判定receiptはあるのに分子の値だけが違う出力、A群と候補群の値を入れ替えた出力を拒否するCASEはない。
  - そのため、誤った件数や群の取り違えのまま、比較が成立したとして通る（類型4）。#2638（068）review07 M1（出力stateの値の照合）と同じ型である。
  - r08の正常判定にある「一致して表示」の形が、2指標の分子・分母にはない。
- **守るべき行**：
  - 固定L2-066（318ec4a labo-requirements.md:524）「Aと対象候補の各々について…`misrepair_count/N`…`unresolved_count/N`を別々に示す。割合だけでなく分子と分母、各caseの判定状態、oracle/判定receiptを辿れるようにする」
  - 固定L11:265

### 後で直す残余（承認を止めない）
- **R1〜R33**：review08から変わらない。
- **R34（費用の戻し先 LABO-055）**：残余とした。CASE-12/41/42は、欠けた費用項目を「既存LABO-055またはその費用を供給する既存source」へ返している。
  - 固定L2-066:526は、059の全費用・欠測条件を再利用すると定めている。
  - 採択済み059の戻し先行（labo-requirements.md:429）は、「price/effort/worker performance/適用範囲不足はLABO-055または該当sourceへ」と書いている。
  - そのため、区分の内側である。ただし、FR-03の「result/cost/time receiptは各receiptの既存供給元」と書き方をそろえることを勧める。
- **R35（task/scope/target入力recordの戻し先）**：残余とした。CASE-06/17/18/19とNFR節は、task/scope/target入力recordを「OSまたは観測source」へ返している。
  - 採択済み059の戻し先行（:429）は、「task/scope/assignment/result/receipt欠落はOSまたは観測sourceへ」と書いている。066はこれを再利用している。
  - FR-03/AC-03の「その入力を供給する既存sourceの責務」と、書き方をそろえることを勧める。
- **R36（OS返却の表記）**：CASE-08の「戻し先: OS」と、CASE-27/28の「OS/run receipt owner」は、FR-03と書き方がそろっていない。
- **R37（修復器の起動）**：修復器の「起動」だけを生成する単独CASEはない。CASE-56のexecutionで兼ねている。

### 次の手順
- M1を直す。
  - B0に、各群の分子・分母の期待値（receiptから導く具体値）を置く。CASE-01の判定に、出力値がその値と一致することの照合を入れる。
  - あわせて、次の単独CASEを置く。
    - 判定receiptを保ったまま、分子の値だけを別値にするCASE
    - A群と候補群の値を入れ替えるCASE
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6025391903 — review10 — 4577 bytes / SHA-256 `53fa577cc1f0b572baf5d640203e3d07ebfe2d6e87fee08d5da44bb2ca32b052`

`````text
## review10（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 49c0cafbe46acc12b20c1565a761be4ef6d59fe6、base main ceda1c53b）：Major 1

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-10` に応える。

### 事前確認と静的検査
- **採択記録**：57候補記録81行（`MPR-RC-HELIXLABO-L2-066-001`）。後日の別revisionの採択はない。
- **base整合**：merge-baseは依頼のbaseと一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - 現在のorigin/main（0acbed34b、#2637 merge後）との`merge-tree`は衝突なし

### 照合の経過
1. **review09の解消の確認**（reviewerが差分で確かめた）：M1は解消した。
   - B0に、Q1〜Q4の各群・各caseのreceiptが具体値で置かれた。CASE-01の正常判定は、出力の分子・分母（A 1/4・1/4、候補 2/4・2/4）と群への帰属が、receiptから導いた値と一致することを照合する。
   - 分子だけを別値にする単独CASEと、群のbindingだけを入れ替える単独CASEが置かれた。
2. **Opusシンプルブラインド**：Major 1。今回から、前回までの残余R1〜R37も、出力要素と禁止列挙の基準で洗い直させた。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：固定L2:523と525、L11:265と266を読んだ。066のCASEを「分母から」「除外」「欠測」「重複」で確かめた。
   - CASE-03dのQunknownは、「oracle適用不能」のcaseである。
   - 証拠不足（欠測）のcaseを分母から落とす変異は、0件だった。そのため、Majorと確定した。

**reviewer側の誤り**：M1は、これまで残余R16（L11:266の誤り例の一部に単独CASEがない）に含めていた点である。L11:266が「unknown・欠測・重複」を別々に挙げていて、そのうち欠測にだけfixtureがない。この点を見落として残余に入れていたので、ここで訂正する。

### Major
**M1（証拠不足（欠測）のcaseを分母から黙って除く誤りを、拒否するfixtureがない）**
- **欠陥**：
  - unknownを分母から除くことを拒否するfixtureは、どれも原因が「oracle適用不能」のcaseに限られる。CASE-03dのQunknown、r08-*のscope不一致、CASE-02がこれに当たる。
  - 単一caseのresultや判定receiptが欠けたcase（証拠不足・欠測）をNから黙って除き、率を確定する変異の単独CASEはない。正常fixtureのB0とBuにも、そのようなcaseは含まれない。
  - ほかのCASEも、この誤りは捉えない。
    - CASE-08/27/28は、群全体の欠落・staleである。
    - CASE-23/24は、countとreceiptのlinkageの欠落である。
  - 重複caseは、CASE-10で照合されている。
  - そのため、適用不能caseだけを正しく扱い、欠測caseをNから落として率を改善する実装が、全CASEに合格する（類型4）。FR-02の「適用不能・receipt不足のcaseはunknown」にも、対応するfixtureがない。
- **守るべき行**：
  - 固定L2-066（318ec4a labo-requirements.md:523）「oracleが適用不能または証拠不足のcaseはunknownとして分母から黙って除かず」
  - 同525行「重複/欠測/unknownを除いて率を改善する…場合は未評価/不成立」
  - L11-066（labo-acceptance.md:265）「適用不能またはreceiptが不足するcaseはunknown」
  - 同266行「unknown・欠測・重複caseを理由なく分母から落とす」

### 後で直す残余（承認を止めない）
- **R1〜R15、R17〜R37**：review09から変わらない。
- **R16**：欠測の部分は、M1へ繰り上げた。残りの部分は、「authority」総称の生成拒否（L11:267）に単独CASEがないこと。これはCASE-44〜50の個別fieldで覆われている。

### 次の手順
- M1を直す。
  - 単一caseのresultまたは判定receiptだけが欠けた欠測case（例：Q5）を含むbaselineを置く。
  - そのcaseをNから黙って除き、率を確定する変異を、単独CASEとして拒否する。
  - 判定は、欠測caseをunknownとしてNに残し、理由と影響caseを表示し、率を出さないこと。欠けたreceiptは、その供給元の既存責務区分へ返す。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6025666054 — review11 — 2349 bytes / SHA-256 `784a470422cf4b40b29d5ecaa322e3deda6dd491c798b095935e5c20043d5a88`

`````text
## review11（independent review、PR #2635 親HELIXLABO-L2-066、HEAD f7ec09a6ad9cfce6c534bc9a9e6dd2f48a6be680、base main 0acbed34b）：Major 1（review10 M1が未解消）

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-11` に応える。

### 照合した項目
- **今回のHEADの変更**：49c0cafbeからの変更は、最新main（0acbed34b、#2637 merge）を取り込んだmerge commit `f7ec09a6a`だけである。
- **6本文のbytes**：LABOの6本文は、review10の対象HEAD `49c0cafbe`と、6件とも全byte同一である。reviewerが`git show`で照合した。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致する。base→HEADの差分は追加のみで、削除行は0である。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし
- **採択記録**：57候補記録81行（-001）のままである。

### 結論
- 本文は、review10の対象と同一である。そのため、review10で記録したM1は、未解消のまま残る。
- **M1（review10）**：証拠不足（欠測）のcaseを分母から黙って除く誤りを、拒否するfixtureがない。
  - unknownの分母除外を拒否するfixtureは、oracle適用不能のcaseに限られる（CASE-03d、r08-*、CASE-02）。
  - 単一caseのresultや判定receiptが欠けたcaseを、Nから除いて率を確定する単独CASEがない。
  - **守るべき行**：
    - 固定L2:523「oracleが適用不能または証拠不足のcaseはunknownとして分母から黙って除かず」
    - 同525行
    - L11:265、L11:266「unknown・欠測・重複caseを理由なく分母から落とす」
- 本文が同一なので、今回は照合を新たに回していない。残余R1〜R37の扱いも、review10のとおりである。

### 次の手順
- review10の「次の手順」のとおりに、M1を直す。
  - 欠測case（例：Q5）を含むbaselineを置く。
  - そのcaseをNから黙って除いて率を確定する単独CASEを置き、拒否する。
  - 判定は、欠測caseをunknownとしてNに残し、理由と影響caseを表示し、率を出さないこととする。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6026103289 — review12 — 4611 bytes / SHA-256 `1486c2628b6b8773e3866a77f6b0a9874fe491bea4b0a9d2227c482e36a3ea89`

`````text
## review12（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 9f17ce8771710e1f3fd60e563cedc05f1f84d345、base main 0acbed34b）：Major 1

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-12` に応える。

### 事前確認と静的検査
- **採択記録**：57候補記録81行（-001）。後日の別revisionの採択はない。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review10/11の解消の確認**（reviewerが差分で確かめた）：M1は解消した。
   - **CASE-66**：判定receiptが欠けたQ5をNに残し、unknownとする正常な対照である。理由と影響caseを表示し、率を出さないことを照合する。
   - **CASE-67**：出力の分母からQ5だけを黙って除く、単独の誤出力変異を拒否する。
   - 「Q5を除いて率を出す」実装は、CASE-66の正常判定で不合格になる。
2. **Opusシンプルブラインド**：Major 1。前回までの残余R1〜R37の洗い直しから、R26を繰り上げた。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：固定L11:266の誤り例と、L2:522の入力・推測禁止を読んだ。066のCASEで「version」を確かめ、Majorと確定した。
   - versionを変異させるCASEは、候補method versionのCASE-05だけである。

**reviewer側の誤り**：M1は、これまで残余R26（「Aのversionだけを欠かす単独CASEがない。CASE-33、39、40、AC-02で間接に覆われている」）としていた点である。L11が誤り例の先頭に名指ししている項目である。L11の誤り例をCASEと1対1で対応させる基準（#2638 review08、#2645 review03で適用）に照らせば、Majorとすべきだった。

### Major
**M1（Aのversionだけを欠かした入力から、版を推測する誤りを拒否するCASEがない。旧R26からの繰り上げ）**
- **欠陥**：
  - CASE-33は、baselineで「A version fieldと他すべてのB0入力は既知・不変」としたうえで、identityだけを変異させている。
  - そのほかのCASEも、この誤りを扱っていない。
    - CASE-40：A identity revisionのstale
    - CASE-39：identityの不一致
    - CASE-05：候補methodのversion
  - 正常のCASE-01の判定も、A versionの値の一致を照合していない。
  - そのため、A versionを推測して補い、比較を成立させる実装が、全CASEに合格する（類型4）。
- **守るべき行**：
  - L11-066（318ec4a labo-acceptance.md:266）「誤りを含む例：Aの意味/版を推測する…」
  - 固定L2-066（labo-requirements.md:522）「入力：比較目的・Aの明示的なidentity/version…Aの意味や現行方式との対応が資料から特定できない場合は推測で命名せず、比較をunknown/未評価として戻す」

### 後で直す残余（承認を止めない）
- **R1〜R25、R27〜R37**：変わらない。
- **R26**：M1へ繰り上げた。
- **R38（件数の表記）**：FV冒頭の「6列74 CASE」は、見出しの「76 CASE」や、実際の行数76と食い違っている。
- **R39（安定IDの記載位置）**：「CASE-44..67はこの候補内の安定ID」が第1表の直後に置かれているが、CASE-64〜67は第2表にある。
- **R40（repair actionの欠落）**：AC-03の生成禁止の列挙に、FR-03にある「repair action」がない。
- **R41（重複除外の向き）**：L2:525の「重複…を除いて率を改善」のうち、重複を除いて分母を減らす向きの単独CASEがない。CASE-10は、二重計上の向きを扱っている。
- **R42（result receiptの欠測）**：FR-02は、caseごとのresult receiptの欠測を、判定receiptの欠測と同列に扱っている。単独fixtureは、判定receiptの欠測（CASE-66）だけである。

### 次の手順
- M1を直す。
  - A versionだけを欠落させるCASEを置く。必要なら、A versionだけをunknownにする変異も置く。
  - 判定は、Aの版を推測で補わず、比較をunknown/未評価とし、率を出さないこととする。
  - 欠けたA version recordは、それを供給する既存sourceの責務区分へ返す。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6026637377 — review13 — 5653 bytes / SHA-256 `8ae8330e986f07553fda0cbc1ca786c93a15bf8d7aa4be6113622c1f2885767c`

`````text
## review13（independent review、PR #2635 親HELIXLABO-L2-066、HEAD e5565168e579c7747e192683c6686e5276833cfe、base main 0acbed34b）：Major 4

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-13` に応える。

### 事前確認と静的検査
- **採択記録**：57候補記録81行（-001）。後日の別revisionの採択はない。
- **base整合**：merge-baseは依頼のbase（0acbed34b）と一致し、削除行は0である。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`成功
  - `merge-tree`は衝突なし

### 照合の経過
1. **review12の解消の確認**（reviewerが差分で確かめた）：M1は解消した。
   - A versionだけを欠落させるCASE-68と、unknownにするCASE-69が置かれた。
   - CASE-01の正常判定も、A versionの実値を照合するようになった。
2. **Opusシンプルブラインド**：Major 4。今回は、固定L2:522〜527とL11:265〜266の項目×状態の表を作らせた。Majorがあったので、Fableへは回していない。
3. **reviewerの確認**：固定L2:527「Aの定義/版、eligible case集合、対象scope/revision、oracle/判定receipt、結果・費用・時間receiptの不足や不一致は、各責務ownerへ返し」の原文を読んだ。表の×のうち、固定親とL3 AC-03が求めるマスを、Majorと確定した。
   - 固定親が求めない状態（例：L2:527に挙がらないstale）のマスは、「−」または残余とした。

### 照合の範囲の固定（066の項目×状態の表）
○＝単独CASEまたは正常判定あり、×＝なし、−＝固定親が求めない。**太字の×**が今回のMajorである。

| 項目 | 欠落 | unknown | 不一致 | stale | 事後変更 |
|---|---|---|---|---|---|
| A identity | ○03a | ○33 | ○39 | ○40 | − |
| A version | ○68 | ○69 | **×** | − | − |
| eligible集合/N | ○03b、11 | ○03d、66/67 | ○34 | ○38 | ○21 |
| task | **×** | − | ○17 | − | − |
| scope | **×** | − | ○18 | − | − |
| target revision | **×** | − | ○19 | − | − |
| oracle/scorer | ○35 | ○02、03d | ○03c、20 | − | ○09、43 |
| oracle判定receipt | ○23/24、66 | ○66 | ○64、65 | − | − |
| protocol/toolchain/environment | − | − | ○14/15/16 | − | − |
| period/cutoff | ○36 | − | ○06 | ○37 | **×**（L3 AC-03が列挙） |
| result receipt | ○08 | − | ○64 | ○27/28 | − |
| 費用receipt | ○12、41、42 | − | **×** | − | − |
| 時間receipt | **×** | − | **×** | − | − |
| unknown理由/影響case | ○r08 | ○r08 | ○r08 | − | − |

reviewerは次回、この表の太字×のマスを照合する。そのほかは、既存の照合項目で照合する。表の外から、新しい状態の組み合わせを求めることはしない。

### Major
- **M1（task・scope・target revisionの「欠落」）**：
  - CASE-17〜19は、不一致だけを扱っている。task・scope・target revisionのどれか1つだけを欠落させる単独CASEがない（類型4）。
  - 守るべき行：固定L2-066（318ec4a labo-requirements.md:527）「対象scope/revision…の不足」、同522行
- **M2（時間receiptの欠落・不一致、費用receiptの不一致）**：
  - 時間receiptには、欠落も不一致も単独CASEがない。費用receiptは、欠落（12/41/42）だけである。
  - 守るべき行：L2:527「結果・費用・時間receiptの不足や不一致は、各責務ownerへ返し…」
- **M3（Aの版の不一致）**：
  - Aの版が事前固定の値と食い違う場合の単独CASEがない。
    - CASE-39は、identityの不一致である。
    - CASE-40は、identity revisionのstaleである。
    - CASE-05は、候補methodの版である。
  - 守るべき行：L2:527「Aの定義/版…の不足や不一致」、L11:266「Aの意味/版を推測する」
- **M4（cutoffの事後変更）**：
  - L3 AC-03は、「oracle/N/cutoff事後変更」を単独field変異として列挙している。しかし、cutoffの事後変更（両群同じ値のまま結果後に変える）のCASEがない。
  - CASE-06（群間の不一致）やCASE-37（stale）では、検出できない。
  - 守るべき行：L11:265「比較開始前に固定された…同一の終了/cutoff条件」、L2:522

### 後で直す残余（承認を止めない）
- **R1〜R42**：変わらない。ブラインドが洗い直したが、Majorに当たるものはなかった。
- **R43（条件付きに読める前文）**：FV前文の「責務カテゴリが分かっている場合」は、条件付きにも読める。各CASEの戻し先は、無条件になっている。表現をそろえることを勧める。
- **R44（候補methodのidentity）**：候補methodのidentityの欠落・unknownには、単独CASEがない。L2:527の列挙の外である。
- **R45（NV-01の戻し先）**：NV-01の戻し先の列挙に、result・費用・時間receiptの供給元がない。

### 次の手順
- 上の表の太字×の6マスに、単独CASEを置く。対象は次のとおりである。
  - task/scope/target revisionの欠落
  - A versionの不一致
  - cutoffの事後変更
  - 費用receiptの不一致
  - 時間receiptの欠落と不一致
- 判定は、比較を比較不能/未評価とし、率を出さず、各責務ownerへ返すこととする。
- 直した後のHEADで、もう一度依頼してほしい。
`````

### comment 6027758817 — review14 — 4787 bytes / SHA-256 `cc3bf9eb7daf32e42330868ba7779f6a4bd974a619227f60b5dce7771c1404d1`

`````text
## review14（independent review、PR #2635 親HELIXLABO-L2-066、HEAD 62d4fa1226a143367b1ed6d9dfa54a5c20b9dfc3、base main 03d9cd19d）：Major 0

reviewer：Claude（lane `review_merge`、Opus 5.5）。依頼 `RH-PR2635-LABO-STAGE5-PARENT066-14` に応える。

### 本文を評価する前の確認（採択記録・対象版・追補条件）
- **採択記録**：57候補記録の81行が、`MPR-RC-HELIXLABO-L2-066-001`を採択している。`docs/governance/decisions/`に、066の別revisionを採択した記録はない。
- **対象版**：固定親は318ec4a（L2 518–528、L11 261–268）である。Fableと敵対照合が、span digestを再計算して一致を確かめた。
- **base整合**：merge-baseは依頼のbase（03d9cd19d）と一致し、削除行は0である。
  - baseの更新は、HARNESS-047節のmergeである。helix-labo配下の6本文には触れていない。
  - 新baseから見た6本文の追加行は、旧base（0acbed34b）に修正commit 3d3784307を足した場合の追加行とバイト一致する。
- **条件付きの戻し先**：0件。
- **静的検査**：
  - scfctl validate 147/0、stale 0、residuals 0
  - govcheck ok
  - `git diff --check`はPRの全範囲（03d9cd19d..HEAD）で成功
  - merge-treeは衝突なし

### 照合の経過
1. **review13の解消の確認**：照合は、review13で固定した表の太字×のマスと、既存の照合項目に限った。
   - task/scope/target revisionの欠落：CASE-70、71、72
   - A versionの不一致：CASE-76
   - period/cutoffの事後変更：CASE-77
   - 費用receiptの不一致：CASE-75
   - 時間receiptの欠落：CASE-73
   - 時間receiptの不一致：CASE-74と、出力の不一致のCASE-78

   いずれも1fieldだけを変える単独CASEで、率を出さずに未評価とする。戻し先は、固定L2:527の区分（各責務owner、および採択済みL2-059の戻し先）の内側にある。
   AC-03の列挙は拡張された。旧項目はすべて保持されている。
2. **Opusシンプルブラインド**：Major 0。表の全マスが○になった。既存の照合項目に後退はない。IDは87件で、重複がない。
3. **Fableの判断**：「承認してよい」。固定親とPO記録、6本文を自分で読んで照合した。
4. **Opusによる敵対照合**：「Fableの判断を支持する」。次の点を照合したが、崩せなかった。
   - CASE-70〜78の単独性・oracle・戻し先
   - R47（CASE-74で、どちらの値も採用せず、率を出さない）
   - R46（CASE-77のcomparison scopeは、LABOの区分内）
   - 禁止列挙
   - authority生成
   - 既存項目の後退
   - 固定親の同一性
5. **reviewerの結論**：委任の条件1（Opusのexact HEADでのMajor 0）と条件2（Fableの同一本文revisionでの判断）が、このHEADでそろった。

### 6本文（このHEADのSHA-256）
- business-verification `6e40b71e…`
- functional-verification `8b2efd0b…`
- nfr-verification `b9977b3e…`
- business-requirements `4978e928…`
- functional-requirements `9892c96c…`
- nfr-grade `d3686b98…`

### 後で直す残余（承認を止めない）
- **R1〜R45**：変わらない。R35とR45（NV-01とFR-03で戻し先の列挙が食い違う）は、review13の固定範囲のとおり残余とする。
- **R46（事後変更の戻し先の不揃い）**：CASE-77は、cutoffをLABO内で訂正する。一方、CASE-21（eligible集合）は供給sourceへ、CASE-09/43（oracle）はHARNESSへ返す。cutoffの供給元も、CASE-06/36/37では既存sourceである。
- **R47（CASE-74の返却先）**：OS eventと時間receiptが食い違うとき、measurement issuerだけへ返している。「正常なOS eventは返さない」という期待は、どちらが正しいかをfixtureの設計者が知っていることに依存する。CASE-75の「どちらも選ばない」と、書き方をそろえることを勧める。
- **R48（記号の重複）**：C0が、candidate identity（CASE-01）とcutoff（CASE-77）の両方に使われている。R0とD0は、同じファイルの064節と意味が違う。
- **R49（CASE-72）**：判定に「LABOの評価義務を維持」の記載がない。
- **R50（059の文言の読み）**：CASE-73/74の「LABO-055計測責務区分」は、L2-059の「LABO-055または該当source」を少し広げて読んでいる。

### 次の手順
- 結論：このHEADの6本文に、未解消のblockerはない。
- mergeへ進むには、次の2つが要る。
  - 委任承認の判断記録。このexact HEADの6本文のbytesとSHAを固定したもの。
  - Ready化。
- 本文のrevisionが変わった場合は、条件1・2をやり直す。
`````

### comment 6022141726 — review03訂正 — 1272 bytes / SHA-256 `1793dff4eeebac21683e549dbc8347cbaf2ac13b619790b8e1a56d869e3e6fc7`

`````text
## review03の訂正（PR #2635、HEAD 650c18ed077060024c4e62f79a094d2ebeaf2c6b）

reviewer：Claude（lane `review_merge`、Opus 5.5）。comment 6022136338の「静的検査」の一文を訂正する。

- **誤り**：「origin/mainとの`merge-tree`は衝突なし（#2636のmerge後の最新mainでも衝突なし）」と書いたが、括弧内は誤りだった。最新mainでの確認結果を読み落としていた。
- **正しい結果**：
  - review base a1bcdba15との`merge-tree`は衝突なし（review03の照合はこのbaseで行った）。
  - 最新origin/main f5a974a40（#2636、親067のmerge後）との`merge-tree`は**衝突する**。対象は`docs/helix-labo`の6本文で、067の追補と066の追補が同じ位置（各ファイル末尾）に入るため。
- **影響**：review03の意味の照合と、委任条件1・2の判定は、base a1bcdba15のHEAD 650c18ed0について変わらない。
- **必要なこと**：merge前に、作成側が最新mainを取り込んで衝突を解く必要がある。取り込み後のHEADで、reviewer側が066の追補のbytesと065・067の本文が変わらないことを照合する。#2632（親064）と同じ扱い。本文が動くので、委任条件1・2を取り直す。
`````
