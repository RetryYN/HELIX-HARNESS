# LABO Stage 5 review 01 補正記録（作成側照合記録）

対象: PR #2620 / comment 6004749682。候補revision `cf0b9200d2546a617d7e9e414840f7736742321f`、候補HEAD `cf0b9200d2546a617d7e9e414840f7736742321f`、main統合時点 `e03c3079e9b050d63f04715cb54ec344166cd19f`。
正式comment raw SHA-256 `e8d66f7e9822733728e46ff9fc36f230578ce7265aabf7232562038da9e569fc`、UTF-8 17081 bytes。JSONに全bodyと45個のexact substring/hash/byte offsetを保存。m6/m7は同一行から分割。
この記録は補正候補の対応表であり、独立review・承認・全所見closureを主張しない。旧immutable記録は保持。

## 固定source pin

全親はbasis `633bf12ea8f948db8ba3d6600179c4a9507377a7`。各親のL2 bounded span / L11 full-file pinの詳細SHAと登録・PO行はJSON `fixed_parent_pins` に保持。
- HELIXLABO-L2-050: L2 298–303、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-059: L2 416–440、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-060: L2 441–456、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-061: L2 457–469、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-063: L2 480–490、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-064: L2 491–502、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-065: L2 503–517、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-066: L2 518–528、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-067: L2 529–540、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-068: L2 541–551、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-069: L2 552–560、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-070: L2 561–575、L11 identity pin。raw/full SHAはJSONに保持。
- HELIXLABO-L2-071: L2 576–584、L11 identity pin。raw/full SHAはJSONに保持。

## 正式finding 45件

CASE番号は親内の末尾を表示。完全ID、原文、変位offset、raw SHA、FR/AC参照、全current line pinはJSONに保存。
- **M1** (050): target変更後verification receipt欠落CASE-15と、target変更結果receipt欠落CASE-20を区別。 CASE 2 IDs（例 15, 20）（完全ID/根拠pinはJSON）。
- **M2** (050): CIのみ/FeedbackのみCASE-16/17と、registrationのみ/target変更のみCASE-18/19の完了claimを分離。 CASE 4 IDs（例 16, 17）（完全ID/根拠pinはJSON）。
- **M3** (059): 059 CASE-30〜47に費用内訳・historical/current・未完run・母集団選択・未評価effort等を分け、NFR/traceを更新。 CASE 18 IDs（例 30, 31）（完全ID/根拠pinはJSON）。
- **M4** (060): 060 CASE-34〜45でSECURITY許可、stale、OS assignment、HARNESS契約、母集団/費用/INT proposalの不足を区別。 CASE 12 IDs（例 34, 35）（完全ID/根拠pinはJSON）。
- **M5** (061): 061 CASE-73〜106へ相殺禁止、historical証拠、通常履歴適用境界、15 field値unknown、receipt起因権限生成拒否を追加。 CASE 15 IDs（例 24, 73）（完全ID/根拠pinはJSON）。
- **M6** (061): 061 CASE-80/81のcontext欠落・漏洩routeを固定L2:467に合わせ、識別可能な入力sourceとSECURITYを区別。 CASE 2 IDs（例 80, 81）（完全ID/根拠pinはJSON）。
- **M7** (061): 061 CASE-80で未確認を明示し、隔離済みと推定しないoracleを追加。 CASE 1 IDs（例 80）（完全ID/根拠pinはJSON）。
- **M8** (063): 063 CASE-18〜50で原因/手順/結果証拠、OS execution、LABO evaluation各fieldのmissing/staleを単独化。 CASE 33 IDs（例 18, 19）（完全ID/根拠pinはJSON）。
- **M9** (063): 063 CASE-26、34、37〜42、49〜50で成功手順誤認、原因混合、候補抑止、候補だけの完了、gate権限、未見例を個別化。 CASE 10 IDs（例 26, 34）（完全ID/根拠pinはJSON）。
- **M10** (063): 063 CASE-03c/32/44の戻し先をLABO評価・source owner・unknownの既存境界に揃え、矛盾するrouteを除去。 CASE 3 IDs（例 03c, 32）（完全ID/根拠pinはJSON）。
- **M11** (064): 064 CASE-17〜30で5条件の欠落と変更、比較対象run欠落を分離。 CASE 14 IDs（例 17, 18）（完全ID/根拠pinはJSON）。
- **M12** (064): 064 CASE-22〜25に直接候補名、平均相殺、未見runtime/output形式、通常履歴への後付けblindを区別。 CASE 4 IDs（例 22, 23）（完全ID/根拠pinはJSON）。
- **M13** (064): 064 AC/CASEの戻し先を固定L2:500の観測元/evaluation ownerと依存するOS assignment・SECURITY許可に限定。 CASE 18 IDs（例 03a, 03b）（完全ID/根拠pinはJSON）。
- **M14** (065): 065 CASE-27〜39でmanifest/fixture-rubric digest/相殺/ゼロ扱い/未見scope/assignment receipt等を別fixtureにし、8軸を維持。 CASE 13 IDs（例 27, 28）（完全ID/根拠pinはJSON）。
- **M15** (065): 065 CASE-15/21/22の戻し先を判断ownerまたはLABO評価契約・source ownerへ固定親どおりに修正。 CASE 3 IDs（例 15, 21）（完全ID/根拠pinはJSON）。
- **M16** (066): 066 CASE-17〜28でtask/scope/revision/scorer・分母変更・誤修復/未解消・費用/速度相殺・receipt不備を分離。 CASE 12 IDs（例 17, 18）（完全ID/根拠pinはJSON）。
- **M17** (067): 067 CASE-03a/08〜14の戻し先を固定L2:533のtask/要求owner等へ合わせ、根拠のないOS/HARNESS routeを除く。 CASE 8 IDs（例 03a, 08）（完全ID/根拠pinはJSON）。
- **M18** (067): 067 CASE-17〜20でattempt count、065 first_pass/retry_count流用、059 cost/quality gate変更を拒否。 CASE 4 IDs（例 17, 18）（完全ID/根拠pinはJSON）。
- **M19** (067): 067 CASE-16/21で適用oracle/revisionとresult receiptの欠落を独立化。 CASE 2 IDs（例 16, 21）（完全ID/根拠pinはJSON）。
- **M20** (068): 068 CASE-13〜18でscope外attempt、担当交代後lineage、result receipt欠落を分けてunknownを保持。 CASE 5 IDs（例 13, 14）（完全ID/根拠pinはJSON）。
- **M21** (069): 069 CASE-20〜27でticket/assignment/source/time/evidence/evaluation状態とcohort scope/revision差を個別化。 CASE 8 IDs（例 20, 21）（完全ID/根拠pinはJSON）。
- **M22** (069): 069 CASE-22〜25の戻し先を固定L2:557のOSまたは識別されたsource ownerへ限定。 CASE 4 IDs（例 22, 23）（完全ID/根拠pinはJSON）。
- **M23** (070): 070 CASE-24〜64でdefinition revision、escaped-defect relation/母数/oracle、rollback event、queue-wait unitの欠落を区別。 CASE 41 IDs（例 24, 25）（完全ID/根拠pinはJSON）。
- **M24** (070): 070のsource/assignmentは特定source owner、oracle不足は要求owner、permission不足はSECURITYへ分け、固定親外のrouteを除去。 CASE 1 IDs（例 03e）（完全ID/根拠pinはJSON）。
- **M25** (071): 071 CASE-05〜19の不足根拠を固定L2/L11の既存source ownerへ返し、LABO一律routeを除去。 CASE 15 IDs（例 05, 06）（完全ID/根拠pinはJSON）。
- **m1** (050): 050/061の同一変異を主CASEへのindexとして区別し、重複を独立fixture数に数えない。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m2** (061): 061 FR traceのCASE-24をAC traceと整合させ、CASE-05〜72の索引範囲を維持。 CASE 1 IDs（例 24）（完全ID/根拠pinはJSON）。
- **m3** (059): 059/060のunknown戻し先をfixtureの原因・特定可能なownerに合わせ、推測routeを作らない。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m4** (060): 060 dependency categoryの変異対象を明記し、根拠のないOS一律routeを避ける。 CASE 1 IDs（例 22）（完全ID/根拠pinはJSON）。
- **m5** (060): 060 CASE-08/10/11をOS receiptまたはLABO比較scope等の固定親責務へ揃える。 CASE 1 IDs（例 08）（完全ID/根拠pinはJSON）。
- **m6** (061): 061 CASE-17のdigest-only差分を特定可能なdigest変異として明示。 CASE 1 IDs（例 17）（完全ID/根拠pinはJSON）。
- **m7** (061): 061 15項目のunknownをmissing/stale/mismatchと混同せず、未知値を独立に扱う。 CASE 1 IDs（例 03e）（完全ID/根拠pinはJSON）。
- **m8** (064): 064/065重複変異をindexと主CASEに分け、同じfixtureを二重計上しない。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m9** (063/065): 063 CASE-07/10と065 CASE-05/12の正常系をAC-01へ同期。 CASE 2 IDs（例 07, 05）（完全ID/根拠pinはJSON）。
- **m10** (063): 063/065/066の戻し先・unknownを固定親に合わせ、recipe/BRAIN等の根拠外routeを除去。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m11** (061/066): 061/066の表header/separatorを補いMarkdown上の表構造を維持。 CASE 4 IDs（例 24, 14）（完全ID/根拠pinはJSON）。
- **m12** (横断): 時点監査の065件数誤記をこの新記録で訂正し、旧監査自体は保持。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m13** (064/066): 066 CASE-13でmisrepair/unresolvedを明示し、064 CASE-03dの別Stage条件を混入させない。 CASE 2 IDs（例 03d, 13）（完全ID/根拠pinはJSON）。
- **m14** (068/069/070/071): raw findingは068–071の重複候補行を指す。CASE別alias/index関係と定義数は別集計し、広いcandidate_areaをfinding本文の親範囲と同一視しない。 CASE 22 IDs（例 03b, 08）（完全ID/根拠pinはJSON）。
- **m15** (067/070): 067 CASE-11のfirst result上書き表現と070 CASE-20のcoverage変異方向を明確化。 CASE 2 IDs（例 11, 20）（完全ID/根拠pinはJSON）。
- **m16** (067/071): 067/071の拒否と戻し先を固定親に合わせ、unsupported expiry claimを足さない。 CASE 2 IDs（例 04a, 03a）（完全ID/根拠pinはJSON）。
- **m17** (069/070): 069 CASE-29は未見reason classをunknown保持、070 CASE-65は070採択から067/068採択を推定しない。CASE-64は別oracle fixtureへのindex。 CASE 3 IDs（例 29, 64）（完全ID/根拠pinはJSON）。
- **m18** (横断): 表412と箇条26を区別し、全定義438および時点監査の件数差を訂正。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m19** (横断): registerの現locatorとPO/G0参照の差を注記し、metadata locatorを採択変更と扱わない。 CASE route/trace/census（完全ID/根拠pinはJSON）。
- **m20** (横断): source-body auditのline値を実ファイル物理行と照合して記録。 CASE route/trace/census（完全ID/根拠pinはJSON）。

## Root追加12群
- **R12-01**: NV/NG059の追補範囲をFV実体CASE-47まで同期。件数は独立fixture/coverageの証明にしない。 CASE 43 IDs（例 05, 06）。
- **R12-02**: 050にCASE-18登録のみ、CASE-19 target変更のみのclaimとCASE-20 target-result receipt欠落を分離。FR/NFR/BV traceを同期。 CASE 3 IDs（例 18, 19）。
- **R12-03**: 061のsnapshot変異と15項目value-unknownをfield単位で対応。CASE-74の5属性oracle表現、通常履歴適用境界、空値/unknownと重複indexを区別。 CASE 30 IDs（例 100, 101）。
- **R12-04**: 061漏洩CASE-10のsource owner+SECURITYを保持し、source identity不明はowner unknown。FR-061 CASE-24の正常fixture説明を合わせる。 CASE 1 IDs（例 10）。
- **R12-05**: 独立12群crosswalkに基づくformal M5範囲。CASE-77はindex、CASE-103〜106はreceipt由来のassignment/permission/admission/judge権限生成を別々に拒否。別個のroot numbered supplementはない。 CASE 5 IDs（例 103, 104）。
- **R12-06**: 063の同一変異のみ既存主CASEへindexし、CASE-51でtarget-change result receipt欠落を独立化。旧revision全件の意味同一性は未再構成。 CASE 14 IDs（例 03a, 03b）。
- **R12-07**: 064のsecurity failure相殺、scope逸脱、検証不能を分離し、runtime-only CASE-24/output-format-only CASE-33等の変異を別に扱う。CASE-17のindex関係は独立fixtureと数えない。 CASE 9 IDs（例 07, 17）。
- **R12-08**: 正式M14とRoot追加第8項: 066のmisrepair隠蔽/ unresolved隠蔽をCASE-29/30へ分離。065のrubric/価格等メモは別の付随検収項で、12群番号へ誤混入しない。 CASE 10 IDs（例 13, 23）。
- **R12-09**: 068 CASE-18で選択scopeのresult receiptだけ欠落させ、Attempt identity/stateはunknownのまま。 CASE 1 IDs（例 18）。
- **R12-10**: 069 CASE-29はsource有効の未見reason classをunknown/unclassified保持。070 CASE-64は別のsource-quality oracle indexであり代替fixtureにしない。 CASE 3 IDs（例 28, 29）。
- **R12-11**: 070 AC-03にrequirements ownerとSECURITYの既存routeを維持し、CASE-65で070採択から067/068採択を推定しない。 CASE 2 IDs（例 64, 65）。
- **R12-12**: 071 CASE-03cでrevision更新時の旧資格失効・新revision分離を明記。CASE-11はindex。064 CASE-16の複数主CASE indexも独立fixtureとして数えない。 CASE 4 IDs（例 13, 16）。

R12番号は旧crosswalkのgroup_id/topicに合わせた。Root追加markdownの項目7（065所見）はcrosswalkに独立groupがないため別補助項としてJSONに保持。crosswalk snapshotのcase IDsと現行candidate IDsはrevision差を含め別保存。

## 数量・構造・限界
現行選択13親は631定義（605 table + 26 bullet）、trace 39行は参照。旧時点594から+37定義であり、被覆・独立fixture成立・承認の証拠ではない。
Root独立構造検算は選択13親内でCASE/AC parent mismatch 0、dangling 0。旧prefixの略記・旧形式定義は対象外。
Root独立pin検算: 固定親39 span、追加main source 13、legacy full16/span14/comparison-only3、6本文/prefix/suffix、旧immutable記録9件のbyte/line一致。これは意味承認ではない。
未確認のまま保持: 旧source用途行の逐語照合、071追加legacy asset差、§24表の063–066への間接適用。formal m14 raw本文は068–071を列挙する一方、candidate_areaとRootメモに別parent群があるため、その不一致の対応は未確認。Root意味検収・Claude独立reviewはpending.

## Rootの確認範囲

補正body差分を全文読み、正常系の失敗時戻し先と索引連鎖を追加補正した。Git rawによるpin照合と構造検算はJSONに固定する。六本文はrevision `cf0b9200d2546a617d7e9e414840f7736742321f` と同じbytesで、新main `6008fb947c73466c11084474b0e938d76e912fb7` のprefixも一致。main統合HEADは `952c232edd23ad7142bbe56603b80fccd7cb60cc`。全45所見と旧未確認範囲はClaudeへ独立照合を依頼する。末尾m20のraw substringには元comment後段も含み、findingの範囲と区別する。
