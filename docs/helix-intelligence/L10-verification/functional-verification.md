# HELIX-INTELLIGENCE L10 機能総合検証（Stage 2a）

状態: L3と対になる検証設計候補。実行結果、PO L3承認、実装/実行許可を生成しない。L3 `functional-requirements.md`のAC identityを参照し、固定L2/L11のsource/revision/scopeとowner境界をoracleにする。

旧L10 verification layerのfailure/backflow定義（LEGACY-ASSET-34DF3B535879CC73FA86, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`）と、旧worker acceptanceのfixture/negative trace（LEGACY-ASSET-C6ADB99F1353965C5449, `worker-common-contract-acceptance.md:18-37,39-64`）を再導出する。旧HAT/AT件数、CI/runtime、provider/sandbox値は移さない。

## CASE-INT-010-01 — 適合範囲内のproposal（AC-INT-010-01）

- 入力: task identityとtype/domain/complexity/context/tool requirements、複数Workerのcapability/version。期待evidenceはLABOがsource/revision/scopeとtask/model classを固定した同scopeの観測実績。fixtureは条件差を含む候補を作る。少なくとも一つのnormal対照ではcost観測をtask属性・Worker capability・同scopeのsuccess/failure/rework/latency/reliability・LABO task/model class evidenceと併用し、価格単独で決定しない理由をexpected oracleに記録する。oracle ownerが適合/不適合/未評価を事前に記録する。
- 観測: proposal候補、各理由と除外、metric/evidence trace、未評価表示、scope/revisionに有効な場合のquality/priority/tolerance判断の適用、OS handoffおよび別状態のassignment記録。
- 合格: proposalはoracleで許可されたscope内候補と理由だけを含み、evidence不足候補をqualified扱いせず、有効な既決判断を再利用し、OS handoffとassignmentを別に示す。該当する有効判断がない場合はunknown/未評価を保つ。L11 G12共通oracleに従い、field/evidenceの存在、自己申告confidence、proposalの体裁だけを合格根拠にしない。

## AC-INT-010-02 / AC-INT-010-03 / AC-INT-010-04 — 独立negative mutations

同一normal fixtureから一変数ずつ変異し、異なる失敗を相殺しない。

| L10 CASE | L3 AC | mutation | expected oracle / return |
|---|---|---|---|
| `CASE-INT-010-02a` | `AC-INT-010-02` | task属性、Worker capability、performance/evidence根拠を理由から除きpriceだけで順位づけ | price-only決定を拒否。priceと他の必須根拠を併用するnormalは `CASE-INT-010-01` で確認 |
| `CASE-INT-010-02b` | `AC-INT-010-02` | model nameだけを独立理由にする | name-only順位づけを拒否 |
| `CASE-INT-010-02c` | `AC-INT-010-02` | 元の適用scopeとtask/model classを保ったまま、比較理由をbenchmark値だけへ変える | benchmark-only選定を拒否。task/model class不一致は `CASE-INT-010-03b` で別に照合 |
| `CASE-INT-010-03a` | `AC-INT-010-03` | source scopeをtaskから外す | evidenceを適用せずLABOへ戻す、proposal未確定 |
| `CASE-INT-010-03b` | `AC-INT-010-03` | task class/model classを変える | evidence不一致を見逃さずLABOへ戻す |
| `CASE-INT-010-04a` | `AC-INT-010-04` | ticket/task identity欠落 | OSへ戻す |
| `CASE-INT-010-04b` | `AC-INT-010-04` | task type欠落 | OSへ戻す |
| `CASE-INT-010-04c` | `AC-INT-010-04` | domain欠落 | OSへ戻す |
| `CASE-INT-010-04d` | `AC-INT-010-04` | complexity欠落 | OSへ戻す |
| `CASE-INT-010-04e` | `AC-INT-010-04` | context欠落 | OSへ戻す |
| `CASE-INT-010-04f` | `AC-INT-010-04` | tool requirement欠落 | OSへ戻す |
| `CASE-INT-010-04g` | `AC-INT-010-04` | Worker capabilityまたはversion欠落/stale | evidenceを適用せずLABOへ戻す。固定L2-061:362-364はLABOが水準/Worker実績を提示しINTELLIGENCEが配置案、OSが実割当を担うため、能力・版の評価根拠不足はLABOへ戻す |
| `CASE-INT-010-04h` | `AC-INT-010-04` | success/failure/rework/latency/cost/reliability観測sourceまたはrevision欠落/stale | 6観測次元の変異を個別実行。該当evidence不足としてLABOへ戻す |
| `CASE-INT-010-04i` | `AC-INT-010-04` | evidence scope欠落/不一致 | LABOへ戻す |
| `CASE-INT-010-04j` | `AC-INT-010-04` | HELIX-Bench作業種別またはmodel class不一致 | LABOへ戻す |
| `CASE-INT-010-04k` | `AC-INT-010-04` | Bench statusをunassessedからqualifiedへ偽変異 | 拒否し未評価保持、LABO ownerを示す |
| `CASE-INT-010-02d` | `AC-INT-010-07` | 必要quality未達をproposal理由/状態から隠す | 不成立、未達を理由・除外として保持する。判断が未決・失効・適用境界外の場合だけ判断ownerへ戻す |
| `CASE-INT-010-02e` | `AC-INT-010-07` | unknown評価を確定値/適格値として表示 | 不成立、unknownを保持 |
| `CASE-INT-010-02f` | `AC-INT-010-07` | 未評価Worker/effort候補を評価済みとして表示 | 不成立、未評価を保持しLABOへ戻す |
| `CASE-INT-010-02g` | `AC-INT-010-07` | scope/revisionに有効な既決quality/priority/toleranceを各runで再確認する | 不成立、既決判断を適用範囲内で再利用し追加確認要求を作らない |
| `CASE-INT-010-02h` | `AC-INT-010-07` | human intervention costを総費用から除いた値をtotal costとして比較 | 不成立、介入費用を含む既存evidenceを照合。不明ならcostをunknownにする |
| `CASE-INT-010-02i` | `AC-INT-010-07` | proposalをOS assignmentとして扱い、proposalだけでassignmentを成立させる | 不成立、proposalとassignmentを分離し、assignmentはOSの別判断に残す |
| `CASE-INT-010-02j` | `AC-INT-010-07` | proposalを実行許可として扱い、proposalだけで実行を許可する | 不成立、proposalは実行許可を与えず、許可判断はOSに残す |

## CASE-INT-010-05 — 未見task/profile組合せ（AC-INT-010-05）

未公開task/Worker profile組合せをheld-outとして与える。事前oracleはscope内で根拠のある候補だけを許し、根拠のない能力や未評価を明示する。scope外証拠の流用、qualified化、proposalからのOS assignment生成があれば不合格。source不足はunknownのままLABO/OSの既存ownerへ戻す。

## CASE-INT-010-06 — consumed pack contract binding（AC-INT-010-06）

選択したconsumer operationがHARNESS-L2-010/011共通pack contractを実際に消費するfixtureだけで、contract identity、contract/artifact/dependency version、compatibility range、exchange/update conditionsを束縛する。各bindingを欠落・stale・不一致に変える独立mutationを行う。合格には固定共通契約上の互換性確認が必要である。互換不成立ならproposalを未確定にし共通pack contract ownerの定めへ戻す。HARNESS共通packの定義ownerやversionは変更しない。無関係なoperationにpack dependencyを追加しない。

## CASE-INT-066-01 — runtimeが使える通常LABO→INT→OS経路（AC-INT-066-01）

- 入力: 固定scope/revisionのLABO-055/054評価材料、task identity、L2-010 proposal schema/contract revision。
- 観測: LABO材料のsource/revision/scopeと評価状態、INT生成proposalのoriginと根拠、OS受領/別assignment record。
- 合格: 同scope材料がLABOからINTへ届き、INT proposalが根拠・未評価を保ち、OSが別途proposalを審査してassignment判断する。receipt成功だけでは評価成功・assignment成立にしない。
- 範囲: これはnormal comparison pathのoracleであり、この起草・受入の前提としてINT runtime実装を要求しない。

## CASE-INT-066-02 — runtimeなしの人代行normal（AC-INT-066-02）

INT runtimeを呼べないfixtureで、人がL2-010と同じaccepted schema/contract revisionを用いて配置案を記入する。入力にはtask/ticket identityと属性、推奨Worker、capability/version、LABO evidenceまたは未評価とsource revision/scope、根拠・除外・不確実性、作成actor/timeを束縛する。OS receiptはproposal内容および受領actor/timeを保持し、assignmentは別状態にする。receiptが無いfixtureでもproposal記録は許すが、assignment成立は許さない。合格は人案がINT生成/評価済みと表示されず、元入力と受領recordを追跡できること。

## 人代行経路の独立negative mutations

| L10 CASE | L3 AC | mutation | expected oracle / return |
|---|---|---|---|
| `CASE-INT-066-03a` | `AC-INT-066-03` | human originをINT generatedへ書換え | 不合格、originを人入力に保つ |
| `CASE-INT-066-03b` | `AC-INT-066-03` | unassessed evidenceをqualified/scoredへ書換え | 不合格、LABOへ戻してunassessed保持 |
| `CASE-INT-066-03c` | `AC-INT-066-03` | 根拠のないunknown埋め：unknown状態を確認なしに確定値へ変換 | 不合格、元のunknownを保持し、evidence/stateの根拠をLABOへ戻す |
| `CASE-INT-066-04a` | `AC-INT-066-04` | ticket/task identityと必須task属性について、各fieldの欠落と元taskとの不一致を一度に一fieldずつ独立変異 | OSへ戻す、assignment materialとして受領しない。NFRの全binding censusにも同じfixtureを対応づける |
| `CASE-INT-066-04b` | `AC-INT-066-04` | OS receipt identity欠落/不一致 | OSへ戻す、assignmentを開始しない |
| `CASE-INT-066-04c` | `AC-INT-066-04` | OS receiver actor欠落/不一致 | OSへ戻す、assignmentを開始しない |
| `CASE-INT-066-04d` | `AC-INT-066-04` | OS receipt時点欠落/不一致 | OSへ戻す、assignmentを開始しない |
| `CASE-INT-066-05a` | `AC-INT-066-05` | Worker identity欠落/不一致 | profile/evidenceの根拠をLABOへ戻す |
| `CASE-INT-066-05b` | `AC-INT-066-05` | Worker capability欠落/不一致 | profile/evidenceの根拠をLABOへ戻す |
| `CASE-INT-066-05c` | `AC-INT-066-05` | Worker version欠落/stale | evidence適用を止めLABOへ戻す |
| `CASE-INT-066-05d` | `AC-INT-066-05` | LABO evidenceまたは明示的unassessed state欠落 | LABOへ返しunknown保持 |
| `CASE-INT-066-05e` | `AC-INT-066-05` | evidence source欠落/他source由来 | LABOへ返し受領・評価不成立 |
| `CASE-INT-066-05f` | `AC-INT-066-05` | evidence revision欠落/stale | LABOへ返し受領・評価不成立 |
| `CASE-INT-066-05g` | `AC-INT-066-05` | evidence scope欠落/不一致 | LABOへ返しunknown保持 |
| `CASE-INT-066-05h` | `AC-INT-066-05` | L2-010 proposal schema identity欠落/不一致 | INTELLIGENCEへ戻しproposal未確定 |
| `CASE-INT-066-05i` | `AC-INT-066-05` | proposal contract revision欠落/stale | INTELLIGENCEへ戻しproposal未確定 |
| `CASE-INT-066-05j` | `AC-INT-066-05` | proposal contract version欠落/stale | INTELLIGENCEへ戻しproposal未確定 |
| `CASE-INT-066-05k` | `AC-INT-066-05` | 適用対象pack contract identity欠落/不一致 | schema/contract identityが不明ならINTELLIGENCEへ戻してproposal未確定を保つ。OS receipt後の互換性が不明ならCASE-INT-066-08bに従いOSへ戻し、assignmentを成立扱いしない |
| `CASE-INT-066-05l` | `AC-INT-066-05` | 適用対象pack contract version欠落/不一致 | contract versionが不明ならINTELLIGENCEへ戻してproposal未確定を保つ。OS receipt後のversion/scope互換性が不明ならCASE-INT-066-08bに従いOSへ戻し、assignmentを成立扱いしない |
| `CASE-INT-066-05m` | `AC-INT-066-05` | human proposal作成actor欠落/不一致 | OS receipt binding不成立。OSはassignment材料として受領しない |
| `CASE-INT-066-05n` | `AC-INT-066-05` | human proposal作成時点欠落/不一致 | OS receipt binding不成立。OSはassignment材料として受領しない |
| `CASE-INT-066-05o` | `AC-INT-066-05` | 推奨Worker fieldを欠落/別Workerへ変更 | receipt binding不成立、OSへ戻す |
| `CASE-INT-066-05p` | `AC-INT-066-05` | 根拠fieldを欠落/改変 | receipt binding不成立、proposalを未確定にする |
| `CASE-INT-066-05q` | `AC-INT-066-05` | 除外理由fieldを欠落/改変 | receipt binding不成立、proposalを未確定にする |
| `CASE-INT-066-05r` | `AC-INT-066-05` | 不確実性fieldを欠落/確実へ改変 | receipt binding不成立、不確実性を保持 |
| `CASE-INT-066-05s` | `AC-INT-066-05` | unknown fieldを欠落 | receipt binding不成立、欠落fieldを特定して元ownerへ戻す |
| `CASE-INT-066-05t` | `AC-INT-066-05` | 未評価表示を欠落/qualifiedへ改変 | receipt binding不成立、未評価を保持しLABOへ戻す |
| `CASE-INT-066-06a` | `AC-INT-066-06` | proposalだけでauthorityを拡張 | 拒否。authority境界を変えない |
| `CASE-INT-066-06b` | `AC-INT-066-06` | INT proposalがLABO評価を代替またはOS受領を迂回 | 拒否、該当する既存ownerへ戻す |
| `CASE-INT-066-06c` | `AC-INT-066-06` | proposalだけでscopeを拡張 | 拒否。scopeを拡張しない |
| `CASE-INT-066-06d` | `AC-INT-066-06` | proposalだけでbranchを拡張 | 拒否。branchを拡張しない |
| `CASE-INT-066-06e` | `AC-INT-066-06` | proposalに実行許可を付与 | 拒否。実行許可を付与しない |
| `CASE-INT-066-06f` | `AC-INT-066-06` | proposalからOS assignmentを生成 | 拒否。assignmentはOSの別判断に残す |

## CASE-INT-066-07 — 未見人代行proposal（AC-INT-066-07）

未公開task/profileのvalid human-authored proposalをheld-out fixtureとして使う。oracleは推奨Worker、根拠、除外理由、不確実性、unknown/未評価、Worker identity/capability/version、task/ticket/scope、schema/contractとpack contract identity/version、source/evidence revision/scope、origin、作成/受領actor/timeの全bindingを事前記録する。合格には人代行normalと同じschema-bound receipt、unknown保持、OSの別assignment判断を要求する。missing/stale binding変異は受領を不成立にし、L3に記したownerへ戻す。

## CASE-INT-066-08 — 重複根拠・未見版/遅延receipt（AC-INT-066-08）

| L10 CASE | L3 AC | mutation | expected oracle / return |
|---|---|---|---|
| `CASE-INT-066-08a` | `AC-INT-066-08` | 同一proposalを重複提出し新しい根拠として数える | 保留し、新規根拠/assignment成立としない |
| `CASE-INT-066-08b` | `AC-INT-066-08` | 未見contract versionまたは遅延receiptでversion/scope互換性がunknownなのに受領・割当を進める | 受領/assignmentを保留し、receipt未完としてOSへ戻す。schema/contract identityまたはversion自体が不明なCASE-INT-066-05k/lとは区別する |

## evidenceとNFR計測の扱い

全caseは入力fixture digest、親source revision、expected oracle、実際のproposal/receiptとowner routeを記録する。固定L2/L11 source/revision/scopeの変化、通常経路と人代行経路の混同、positive/negative/unseenのfixture差を読めるようにする。NFRの母集団/指標候補は `nfr-verification.md` にtraceする。旧tests、CI、runtimeは実行せず、将来の実装testがこの設計を実証済みとすることもない。

## C13 carry-forward

C13-M10、C13-M7、C13-M12 audit-record correction、Minor INT-010、Minor INT-060-078は未解消として引き継ぐ。`C13-U-INT-NFR-060-078`と`C13-U-all-crosswalk-and-legacy`は未確認であり、特にL2-060-078および旧source crosswalkの全量reviewを済んだとは扱わない。この設計と作成者の自己照合は独立reviewやfinding closureではない。revision-specificなsource pin/crosswalk handoffはroot監査へ収録する時点記録であり、private `/tmp` artifactを継続的な正本依存にしない。


## Stage 2c — 068/075の起草範囲とsource

状態: 以下のStage 2c追補はL3未承認の起草候補・未実行の検証設計である。上のStage 2a本文とその承認範囲を変更しない。対象は採択済みHELIXINTELLIGENCE-L2-068/075に限る。旧source起点・項目別の再導出/置換は各項目と時点監査に記録する。

状態: L3と対になる検証設計候補。実行結果、PO L3承認、実装/実行許可を生成しない。L3 `functional-requirements.md`のAC identityを参照し、固定L2/L11のsource/revision/scopeとowner境界をoracleにする。

旧L10 verification layerのfailure/backflow定義（LEGACY-ASSET-34DF3B535879CC73FA86, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`）と、旧worker acceptanceのfixture/negative trace（LEGACY-ASSET-C6ADB99F1353965C5449, `worker-common-contract-acceptance.md:18-37,39-64`）を再導出する。旧HAT/AT件数、CI/runtime、provider/sandbox値は移さない。

対象は採択済み `HELIXINTELLIGENCE-L2-068` と `HELIXINTELLIGENCE-L2-075`。この追補は承認済みStage 2aの010/066範囲を変更しない。項目別sourceと再導出は時点監査へ記録する。


## CASE-INT-068-01 — 失敗前の事前準備（AC-INT-068-01, AC-INT-068-04）

- 入力: 元Workerの着手予定assignment、ticket/task identity、scope、承認済みrequirement/design revision、HARNESS-L2-022の既存oracle/受入義務、OSの既存budget/deadline/stop条件。例は固定L11の `PATCH /applications/{id}` 状態遷移で、`draft`更新は許可・保存され、`approved`更新は拒否され値不変。failure report、過去failure、consult receiptを与えない。
- 期待: INTELLIGENCEは候補test/instructionを要求状態と既存oracleにtraceし、作業前に返す。各case候補は状態遷移、境界値、無関係fieldへの副作用を分ける。これは実行・合格・採択ではない。
- 合格: 失敗資料を欠くことだけで候補を止めず、既存義務・停止条件・元Worker責任を保つ。consult不要のためHELIXOS-L2-028 receiptを要求しない。

## CASE-INT-068-02 — 選択sourceと条件付きpacket利用（AC-INT-068-03）

有効な設計/code sourceを実際に選ぶfixtureではidentity、version、owner、scope、provenance、permission、applicabilityを入力し、sourceに追跡可能なcontextを候補へ含める。operationとtrigger、期待outputとscopeも識別する。別のpacket-use fixtureではAIDOC source/revision/authorityとsummary non-authority、OS CLR-R06必須contextおよび未完義務を維持する。合格は、summaryから権威や許可を推論せず、secret/private reasoning・未承認結論を混入せず、継続に必要な未完義務を保持すること。packetを使わないnormal fixtureも許し、packet能力/receiptを全operationへ要求しない。

## CASE-INT-068-03 — 診断に必要な観測と証拠限定（AC-INT-068-02）

- normal: `approved`状態の対象へ `PATCH` が200を返した観測を、request/responseと再現sourceに束縛して与える。候補は観測事実、原因hypothesis、unknownを分け、必要なら「approved判定の契約と拒否時の未変更条件」を既存requirement/oracle ownerへ問う限定相談候補を返す。入力観測を越えて原因を断定しない。
- negative: diagnosis operationの症状・観測・再現sourceを一項目ずつ欠落/stale/conflictにし、diagnosis candidateを保留して不足とownerを示す。同じfixtureの有効なpre-test candidateは失敗証拠不足だけを理由に保留しない。

## CASE-INT-068-04 — 選択sourceの不整合と未選択sourceの独立（AC-INT-068-03, AC-INT-068-06）

同一の有効baselineから、一度に一条件ずつ、選択sourceのidentity欠落、version stale、scope不一致、provenance欠落、利用制限、適用性unknown/conflictを変える。該当sourceに依存するcandidateだけを成功扱いせず、candidateに該当sourceをmissing/contradictoryとして表示し、必要なsource ownerまたはSECURITY/OSへ不足を返す。sourceを選択していない別operationは無条件にそのsourceへ依存しない。組合せfixtureでも誤った事実化・波及停止がないことを確認する。

## CASE-INT-068-05 — unsupported fact・誤助言・unknown保持（AC-INT-068-02, AC-INT-068-04）

正常対照のsource factと明示unknownを固定し、次のnegativeを独立に適用する: 過去類似例だけから `approved` 更新可と断定する、仮説を観測factとして表示する、未知oracle適用性をgeneric passへ変える、source/revision/scopeの不一致を黙って採用する。候補出力ではmissing/contradictory sourceとして表示し、正しい既存ownerへBackflowする。各変異は候補を不合格とし、必要requirement/design/oracle意味を既存ownerへ返し、unknownを維持する。

## CASE-INT-068-06 — authority、担当、未完義務（AC-INT-068-04, AC-INT-068-05, AC-INT-068-06）

有効候補の一要素を個別に変え、INTELLIGENCEまたは支援者がassignment/dispatch、test実行/CI、acceptance、merge、requirement/design authority、BRAIN直接promotion、独立review/利用者受入を行ったように見せる。別fixtureで、test/oracle追加案をaccepted oracleまたは受入条件として確定する変異と、既存HARNESS-L2-022 oracleの期待結果/条件を書き換える変異を独立に与える。全て拒否し、既存oracleと受入条件の意味を変更せず、必要ならHARNESSまたは対象requirement/design ownerへ戻す。元Workerの責任と現行ownerを保持する。選択packetの未完義務を一つずつ除いたnegativeも置き、継続状態を完了扱いしない。長期effectiveness未評価、Bench未評価を有効性・配置適性へ誤変換しない。

## CASE-INT-068-07 — owner別不足・停止と部分継続（AC-INT-068-01, AC-INT-068-06）

task/ticket/assignment/scopeまたは元budget/deadline/stopの不足はOSへ、source truth/provenanceはsource ownerへ、requirement/design/oracle applicabilityはHARNESSまたは既存対象ownerへ、permission/data-useはSECURITY/OSへ、BRAIN applicabilityはBRAINへ、effectiveness/generalizationはLABOへそれぞれ独立に返す。該当operationだけをholdし、他の十分なpreparation operationを継続可能にする。戻し先を特定できない業務責任を新ownerへ割り当てずunknownとして示す。

## CASE-INT-068-08 — 未見endpoint/state model（AC-INT-068-02, AC-INT-068-04, AC-INT-068-06）

未見endpointと異なるstate modelを与え、類似sourceはあるが対象oracleへの適用性と更新副作用が未確定のfixtureを使う。INTELLIGENCEは必要なrequirement/design evidenceと既存oracle ownerへの質問候補、alternative、unknown、return targetを返す。generic pass、approved後編集可能という一般化、またはowner創作があれば不合格。

## CASE-INT-068-09 — 支援候補の独立成立と関連能力の分離（AC-INT-068-01, AC-INT-068-05）

有効なtask/input/output contractから単体支援candidateを作るnormalではHELIXOS-L2-028実相談receiptもHELIXOS-L2-029の完了loopも要求しない。対照としてactual consultationを選ぶ場合はHELIXOS-L2-028、test実行を選ぶ場合はHELIXOS-L2-020、Worker作業・検証・修正往復を評価する場合はHELIXOS-L2-029およびHARNESS-L2-022の各owner契約へ分離する。proposal生成をそれらの実行済み証拠と表示しない。

## CASE-INT-068-10 — 未見normal support operation（AC-INT-068-01, AC-INT-068-04, AC-INT-068-05）

未公開の支援operationで、必須入力/source契約が有効、consultもfailure diagnosisも不要なものをheld-out normalとして与える。operation/scope/根拠/不確実性・代替案・owner return・未完義務・stopを追跡した候補を返し、既存authority境界を守れば合格。未見を理由に新gate、owner、universal source dependencyを作らない。

## CASE-INT-068-11 — operation record欠落（AC-INT-068-04）

CASE-INT-068-01の同一baselineから、実施operation、trigger、期待output、scopeの各記録を一つずつ欠落させる独立negativeを作る。期待oracleは欠落fieldをcandidateに明示し、完全なoperation recordや受入条件として扱わず、不足に関係するHARNESSまたは対象ownerへ戻すこと。accepted oracleを新設/変更しない。

## L2-068 / L11-068 atom coverage

`docs/helix-intelligence/L2-requirements/intelligence-requirements.md:491-506` と同固定revisionのL11 `intelligence-acceptance.md:202-209` を条件別に読み、FR/ACと本CASEへ配置した。L11:201は `HELIXINTELLIGENCE-L2-068` 見出しであり、条件atomとして扱わない。C13実comment `RH-PR2564-L3L10-274-13`（SHA-256 `4d837e616451040cb15762e98b65cb9f104db8856f0319f4f376a47459644f1c`）のM12・line 168「068のatomをheadingだけにしない」は、Stage 2cでsource条件を本CASEへ展開したことだけではclosureとならず、共通監査findingとして未解消のまま残す。この対応表は独立review/closureではない。句ごとのsource/raw pinとcrosswalkはhandoff監査記録に収録する。


## CASE-INT-075-01 — 完全な正常proposal（AC-INT-075-01）

合成fixtureにproposal ID、audit episode、producer/provider/runtime/model/version/session、repository/candidate HEAD/resolved worktree、authority revision/digest、responsibility/invariant ID、observed behavior、evidence/reproduction/counterevidence、confidence/expiry、finding advisory/remediation advisory、proposal digestを全て与える。全fieldを一つのaudit episodeとtarget revisionへ束ね、content/digestを再計算可能なinputから照合する。PR review findingとsystem proposalは別identity・別schema、findingとremediationは別identity・別判定で返り、authority/priority/qualification状態が変更されなければ合格。

## CASE-INT-075-02 — identity／evidence各fieldの失敗（AC-INT-075-02, AC-INT-075-03）

CASE01の正常baselineから各fieldを一つずつ変える。親の6 identity条件（exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidence）は各fieldにつきmissing、changed、wrong-revisionを別fixtureで検査する。その他の列挙proposal field（proposal/episode/producer attributes/repository/responsibility ID/observation/reproduction/counterevidence/confidence/expiry/advisories/digest）もそれぞれ独立に欠落・不一致を変異する。各fixtureは影響fieldを個別reasonとともにincomplete/rejectedへし、正常対照や別fieldから値を補わない。reasonの用語・enum・schemaはoracleに固定しない。項目固有reasonを汎用拒否理由だけへ集約する独立変異も不合格とし、失敗fieldと欠落／不一致の種類が読めることを観測する。

## CASE-INT-075-03 — authority時制の分離（AC-INT-075-04）

CASE01からauthority/evidence時制だけを切替え、current、source契約内のcompatibility、historicalの3 fixtureを独立に評価する。currentはそのrevision/digestを束縛し、compatibilityは契約範囲の根拠を示し、historicalは歴史材料として明記される。historicalをcurrentへ昇格する変異は不合格、compatibility適用範囲が未確定の変異はunknown/incompleteへ留まる。

## CASE-INT-075-04 — 適格化条件ごとの失敗（AC-INT-075-05）

normal proposalからqualification facetを一度に一つ変異する。AI self-ratingだけでverified/P0/P1/owner/route/remediation adoptionを確定する、duplicate/existing owner照合が無い、independent reproductionが無い、反証が未処理、expiry根拠が無い/expired、supersession状態が未解決、finding/remediationを同じidentityまたは単一decisionへ統合する各negativeを個別fixtureにする。各々未qualified/unknownのまま保持し、既存UIL-01〜04の適切な既存ownerへ返す。独立に有効な他facetは改変fixtureの根拠に流用しない。

## CASE-INT-075-05 — 未見の正常監査episode（AC-INT-075-01, AC-INT-075-06）

未使用のaudit episodeで、既知のproducer identity/authority contract内のsourceとtarget revisionが全て一致し、CASE01と同じdeclared fieldsが完全なnormal fixtureを与える。proposalを返しつつqualification状態はcandidateのまま保持し、new episodeであることだけを理由に新gate/owner/routeを発明しない。

## CASE-INT-075-06 — 未見・不完全identityの返却（AC-INT-075-03, AC-INT-075-06）

未見producer/session、別HEAD、stale evidence、期限切れ、superseded、duplicate proposalを互いに独立なfixtureとして与える。確認できないproducer/owner/authority relationはunknown/incompleteとし、該当ownerへ照会候補を返す。過去のcurrent resultや別proposalで補完しない。Proposal生成からruntime/Issue/Requirement/CI/merge/Future Synthesis operationが発生しない。

## CASE-INT-075-07 — finding／remediation identityの分離（AC-INT-075-01, AC-INT-075-05）

正常proposalがfinding advisoryとremediation advisoryを別identity・別判定として持つfixtureを通す。両advisoryのidentity、evidence、stateを同一化するnegativeを一変数で注入し拒否する。PR review findingとsystem audit proposalを同identityまたは同schemaへ混同する変異も独立に拒否する。具体的PR schemaの新設はしない。提案の生成をremediation実行や採用へ変換しない。

## CASE-INT-075-08 — 根拠のない自己適格化とroute生成（AC-INT-075-05, AC-INT-075-06）

proposal proseが独立資格情報なしにverified/P0/P1、正式owner/route、remediation adoptionを宣言する別々のnegative fixtureを与える。全てその結論を権威化せず、根拠不足と既存UIL/該当ownerへの返却を保持する。新route・priority enumは作らない。

## CASE-INT-075-09 — detector／direct-projectionの対象外境界（AC-INT-075-06）

L2-075へAAFD-R-04 detector優先/direct-projection要件を加えるfixture要求や自由文direct write結果を与え、Stage 2c L3 candidateがその能力を主張しないことを確認する。決定論的検出器の契約はL2-073のauthority範囲のままとし、このCASEでL2-073自体のqualification/実行を要求しない。

## L2-075／L11-075条件の対応

固定L2 `intelligence-requirements.md:618-625`、L11 `intelligence-acceptance.md:337-343` とPO採択行 `po-decision-2026-10-03-later35.md:33` のsource pinはrevision-specific auditに収録する。L2 snapshotの旧「未採択」表示はこのrevisionの後続PO判断と同一semantic digestにより読み替える。旧AAFD AC-001〜003の実行/受入条件を15-17行で照合し、L2-075に含まれるidentity/evidence/qualificationを本FR/AC/CASEへ配置した。旧AC-004/R-04 detector条件は対象外。source再導出記録はclosureや独立reviewを意味しない。


## Stage 4 — 1.0接続15親の総合検証

状態: 未実行のL10設計候補。各CASEは固定633 L2/L11 parentとR2187-01の内容oracleに束縛し、PR/review/implementation/approvalから受入を生成しない。 各04表のA/B列挙は各fieldを別runで一変数ずつunknownにする。行IDはfixture family識別子とし、各runは選んだfieldを記録して区別する。同時変異や1runへの束ね、分母重複をしない。HARNESS-L2-010/011共通packは固定L2に共通pack句を持たない017では、packを消費する場合の補助検証として消費時だけ、036・039および他の固定親では各operationに常時適用する。これを個別sourceの選択条件へ弱めない。

### CASE-INT-017-01 — source-bound正常（AC-INT-017-01）

入力: 同一target revision/scopeに対するSECURITY permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。出力: 境界別の未完/完了状態を保つ統合修復結果。責務: SECURITY permission/isolation; Worker execution/result; HARNESS obligation; OS acceptance。

**期待oracle:** 同一target revision/scopeについてSECURITY permission、Worker実行結果、HARNESS検証、OS検収を別々の証拠で受ける。操作時点permissionと後日の失効時刻を区別し、未完義務は統合結果に未完として残し、各段階の対応証拠がそろった時だけ完了する。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-017-01a — 未完義務の保持（AC-INT-017-01）

入力: SECURITY permission、Worker result、HARNESS obligation、OS acceptanceのうち、他の有効結果をそろえHARNESS obligationだけを未完にする。
期待oracle: 未完義務を統合結果の未完状態に残し、全段階完了へ昇格させない。未完義務を消したり、無関係な有効sourceを止めたりしない。

### CASE-INT-017-02 — 親固有fieldの独立negative（AC-INT-017-02）

各行をCASE-INT-017-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。 固定L11:92の別owner代替反例は017-02h/02nに加え、permissionはCASE-INT-036-02h、executionはCASE-INT-037-02i、acceptanceはCASE-INT-039-02c/02d/02fへtraceし、同一fixtureを重複分母へ入れない。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-017-02a` | 操作時点permission receiptを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、SECURITY permission/isolation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02b` | Worker実行resultを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker execution/result ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02c` | HARNESS verification obligationを欠落 | 修復成功をOS検収済みにせず、欠落検証義務をHARNESS/OSへ戻し、修復未完了を保持する。他の正常sourceは維持する。 |
| `CASE-INT-017-02d` | OS acceptance receiptを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS acceptance ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02e` | permissionのtarget scopeだけを別scopeへ差し替える | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、SECURITY permission/isolation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02f` | 実行時点で有効だったpermissionの後日失効だけを根拠に、過去の有効証拠を無効として棄却する | 不合格。後日失効を遡及させず、実行時点の有効証拠と過去の完了判定を保持する。 |
| `CASE-INT-017-02g` | 四段階のsource/revisionを一つへ統合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当する各source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02h` | 修復candidateに包括write authorityを付与 | 包括write authorityを拒否し、SECURITY permission/isolationとWorker実行・HARNESS検証・OS検収それぞれの既存owner責務を保持する。 |
| `CASE-INT-017-02i` | 実行時点ですでに期限切れのpermissionで実行（revokedは別CASE-INT-017-02o） | 操作を実行可能にせず、完了扱いしない。SECURITY permission/isolation ownerへ戻す。 |
| `CASE-INT-017-02o` | 実行時点permissionの状態だけをrevokedにする。他のtarget/scope/期限/receiptは正常 | 当該操作を実行可能/完了扱いせずSECURITY permission/isolation ownerへ戻す。他の有効段階証拠を保持する。 |
| `CASE-INT-017-02j` | Worker result target revisionだけを別revisionへ変更 | 当該Worker証拠を不一致として完了から除外し、Worker execution/result ownerへ戻す。 |
| `CASE-INT-017-02k` | HARNESS検証対象revisionだけを別revisionへ変更 | 当該検証証拠を不一致として完了から除外し、HARNESS verification ownerへ戻す。 |
| `CASE-INT-017-02l` | OS検収対象revisionだけを別revisionへ変更 | 当該検収証拠を不一致として完了から除外し、OS acceptance ownerへ戻す。 |
| `CASE-INT-017-02m` | 接続契約を未admitted contractへ差し替える | 当該接続を未admitted/unknownとして修復を未完了にし、適用CONNECT contract ownerへ戻す。 |
| `CASE-INT-017-02n` | Worker実行結果をHARNESS verification evidenceへ付け替える | 不合格。Worker結果を検証証拠にせず段階別に保持し、HARNESS verification ownerへ不足を戻して統合修復は未完了とする。 |

### CASE-INT-017-03 — 未見入力の親oracle（AC-INT-017-03）

入力: 同一target R17/scope S1のSECURITY permission P1（操作時有効）、Worker execution W1、HARNESS verification H1、OS acceptance O1を、受信順 O1/H1/P1/W1で与える。各receiptには別source revisionと対象scopeを付す。

期待oracle: 到着順が逆でもreceiptごとのsource, revision, target, scopeを照合し、同一target/scopeに一致する証拠だけを各境界へ結ぶ。新しい段階順を生成しない。操作時permissionは受領順と独立して評価し、後日失効の判定は03aへ分ける。 四段階すべての有効な対応証拠と各段階のauthorityを確認できる場合だけ統合修復結果を完了とする。いずれかのauthorityが確認できない場合は当該段階を保留し、統合結果を未完了に保つ。

### CASE-INT-017-03a — 後日失効の非遡及正常（AC-INT-017-03）

入力: 実行時点のpermissionは有効で、段階receiptの順序・target/revision/scopeは固定したまま、実行後の失効時刻だけを与える。
期待oracle: 過去の有効実行証拠と成立済み完了判定を保持する。後日の失効は将来操作の判定へ使い、過去証拠を消さない。

### CASE-INT-017-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-017-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-017-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-017-04a` | 操作時点のSECURITY permission authorityを確認できない（他の三段階は有効） | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。当該段階を保留し統合修復結果を未完了に保つ。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04b` | Worker execution receiptのrevisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、Worker execution/result ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04c` | HARNESS obligation適用scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04d` | OS acceptance対象revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS acceptance ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04e` | Worker実行結果のtarget scopeだけが未宣言 | 当該Worker結果のscopeをunknownとして統合修復を未完了に保ち、Worker execution/result ownerへscope確認を戻す。他の段階scopeは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-017-02）

この親ではHARNESS-L2-010/011共通pack contractを実際に消費するoperationだけに適用し、非消費operationにpack依存を追加しない。以下は一度にpack field一つだけを変えた別fixtureであり、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-017-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-030-01 — source-bound正常（AC-INT-030-01）

入力: 許可されたHARNESS requirement/design revision、process contract、verification obligation、admitted connector contract。出力: source revision付きSituation Model情報。責務: HARNESS source owner; 適用されるCONNECT contract owner。

**期待oracle:** 同一HARNESS source identity/revisionのrequirement/design、process contract、verification obligationとcontract receiptをSituation Modelへ反映し、HARNESSを正本ownerとして残す。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-030-02 — 親固有fieldの独立negative（AC-INT-030-02）

各行をCASE-INT-030-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-030-02a` | HARNESS requirement source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02b` | requirement revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02c` | design source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02d` | design revisionをstaleにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。  staleと判定しcurrent化せず、設計義務を上書きしない。 |
| `CASE-INT-030-02e` | process contract receiptをstale revisionにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。  staleと判定しcurrent化せず、設計義務を上書きしない。 |
| `CASE-INT-030-02f` | verification obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02g` | HARNESS source scopeを別operationへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02h` | HARNESS source ownerを別ownerへ置換 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-030-03 — 未見入力の親oracle（AC-INT-030-03）

入力: 未fixtureのcontract/pack version pair 2/3を、2/3を許容する宣言済compatibility・同一HARNESS source identity/revision・有効oracleと共に与える。

期待oracle: 送受契約で宣言された範囲内の2/3を接続し、source identity/revisionとHARNESS正本を保持する。未fixtureであることだけを拒否理由にしない。

### CASE-INT-030-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-030-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-030-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-030-04a` | HARNESS requirement/design revision fieldがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04b` | process/verification contract適用性がunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04c` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04d` | declared compatibility外のversion pair | version pairをunknownのまま保持して送受契約owner（適用CONNECT contract owner）へ返す。HARNESS source正本は保持する。 |
| `CASE-INT-030-04e` | operation scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04f` | declared compatibility rangeだけを未宣言にする | version pairをunknownに保ち自動connector選択をせず、送受契約owner（適用CONNECT contract owner）へ返す。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-030-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-030-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-031-01 — source-bound正常（AC-INT-031-01）

入力: 許可ticket/current state/dependency/evidence、OS source revision、admitted connector contract。出力: OS revision付きSituation Model情報。OSがstate/authorityを保持。責務: OS source owner; 適用されるCONNECT contract owner。

**期待oracle:** OS ticketのstate revisionとdependencyをSituation Modelへ表示し、OS stateは変更しない。L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-031-02 — 親固有fieldの独立negative（AC-INT-031-02）

各行をCASE-INT-031-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-031-02a` | OS ticket identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02b` | ticket state revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02c` | dependency evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02d` | revision 8後にrevision 7の遅延state eventをcurrent stateへ誤結合 | 不合格。revision 7を古いeventとして識別しcurrent stateを巻き戻さず、OS source ownerへ再照合を戻す。 |
| `CASE-INT-031-02e` | source scopeを別ticketへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02f` | OS authorityをINTELLIGENCEへ移す | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02g` | dependency revisionをstaleにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02n` | Situation ModelからOS ticket stateへのwriteを要求 | 不合格。writeを拒否しOS stateは不変、OS source ownerへ戻して再照合する。 |

### CASE-INT-031-03 — 未見入力の親oracle（AC-INT-031-03）

入力: 未fixtureのstate value `paused_by_dependency` を、同値を宣言するOS state契約・ticket T-17・state revision 8・有効dependency evidenceと共に与える。

期待oracle: 宣言契約内の値をticket/revisionへ照合し、その定義どおりSituation Modelへ渡す。未fixtureであることだけを理由に拒否せず、OS state/authorityは変更しない。契約外種別は04dの別fixtureとする。

### CASE-INT-031-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-031-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-031-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-031-04a` | OS ticket/state revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04b` | dependency evidence revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04c` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04d` | state/event種別が宣言契約外 | 該当fieldだけunknown/incompleteとして推測を止め、OS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04e` | ticket scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、OS source ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-031-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-031-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-032-01 — source-bound正常（AC-INT-032-01）

入力: BRAIN Pattern/Unit/Part、applicability、exception、counterexampleおよびrevision。出力: source-bound INTELLIGENCE判断材料。BRAIN knowledge canonicalを保持。責務: BRAIN knowledge owner; 適用されるCONNECT contract owner。

**期待oracle:** `CASE-INT-032-01` は正常fixtureのみを扱い、Pattern/Unit/Partのidentityと各revision、applicability条件を照合し、適用理由と該当Pattern revisionを付して判断材料へ進める。scope内counterexample成立時の拒否は独立negative `CASE-INT-032-02c`で照合し、BRAIN knowledgeを変更しない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-032-02 — 親固有fieldの独立negative（AC-INT-032-02）

各行をCASE-INT-032-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-032-02a` | Pattern identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02h` | Pattern revisionを欠落 | revisionだけinvalid/incompleteにしBRAIN knowledge ownerへ戻す。適用を成立させない。 |
| `CASE-INT-032-02b` | applicability stateをunknownのまま適用済みにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02c` | 現在scopeで成立するcounterexampleを除外 | Pattern適用を棄却し、適用candidateを出さない。BRAIN knowledge canonicalは変更せず、当該counterexampleを保持してBRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02d` | exception scopeをPattern scopeと不一致にする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02e` | applicability conditionが満たされないPatternを適用候補として出す | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02f` | BRAIN canonicalをINTELLIGENCEから変更 | 書込みを拒否し、BRAIN knowledge canonicalを不変に保つ。INTELLIGENCEから正本を変更せず、BRAIN knowledge ownerへ不足/不一致を戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02g` | Pattern revisionの反例を別revisionへ混合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02i` | 同名だが異なるPattern identity/revisionを一つへ統合 | 不合格。重複Patternは別identity/revisionのまま保持し、BRAIN canonicalを変更せずBRAIN knowledge ownerへ戻す。 |
| `CASE-INT-032-02j` | Patternと他のUnit/Part fieldは有効に保ち、Unit identityを欠落 | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |
| `CASE-INT-032-02k` | Patternと他のUnit/Part fieldは有効に保ち、Unit revisionを欠落 | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |
| `CASE-INT-032-02l` | Patternと他のUnit/Part fieldは有効に保ち、Part identityを欠落 | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |
| `CASE-INT-032-02m` | Patternと他のUnit/Part fieldは有効に保ち、Part revisionを欠落 | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |

### CASE-INT-032-03 — 未見入力の親oracle（AC-INT-032-03）

入力: 未fixtureのPattern version 3を、3を含む宣言済互換範囲・適用scope・有効Pattern/Unit/Part identityとrevision・成立する適用条件・非該当counterexampleと共に与える。

期待oracle: Pattern/Unit/Part identityと各revisionを別々に保持し、適用理由とPattern revisionを判断候補に付して根拠として受け入れる。未fixtureだけを理由に拒否せず、BRAIN canonicalは変更しない。

### CASE-INT-032-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-032-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-032-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-032-04a` | Pattern identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04f` | Pattern revisionがunknown | revisionだけunknown/incompleteとして保持しBRAIN knowledge ownerへ戻す。 |
| `CASE-INT-032-04b` | applicabilityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04c` | exception/counterexample適用scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04d` | declared compatibility外のPattern version | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04e` | source scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04g` | selected connector contractのadmission状態だけをunknownにする | 契約の成立を推測せず当該接続を未成立として保持し、適用CONNECT contract ownerへ確認を戻す。他fieldとsource authorityは保持する。 |
| `CASE-INT-032-04h` | Pattern versionのcompatibility rangeだけを未宣言にする | 互換性を外挿せずunknownとしてBRAIN knowledge ownerへ戻し、BRAIN canonicalは変更しない。 |
| `CASE-INT-032-04i` | Patternと他のUnit/Part fieldは有効に保ち、Unit identityだけunknown | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |
| `CASE-INT-032-04j` | Patternと他のUnit/Part fieldは有効に保ち、Unit revisionだけunknown | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |
| `CASE-INT-032-04k` | Patternと他のUnit/Part fieldは有効に保ち、Part identityだけunknown | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |
| `CASE-INT-032-04l` | Patternと他のUnit/Part fieldは有効に保ち、Part revisionだけunknown | 該当fieldをunknown/incompleteに保ち判断候補へ昇格せずBRAIN knowledge ownerへ戻す。canonicalを変更しない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-032-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-032-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-033-01 — source-bound正常（AC-INT-033-01）

入力: Product Core requirement/design/meaningとHARNESS process contract/verification obligationを別source/revisionで受領。出力: source別revisionを保持するINTELLIGENCE理解材料。責務: 該当Product Core owner; HARNESS owner; CONNECT contract owner。

**期待oracle:** Product Core requirementとHARNESS verification obligationを別source/revisionで受け、各主張を対応ownerへ追跡可能にする。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-033-02 — 親固有fieldの独立negative（AC-INT-033-02）

各行をCASE-INT-033-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-033-02a` | Product Core source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02b` | Product Core revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02c` | HARNESS process contractを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source/verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02i` | HARNESS verification obligationを欠落 | obligationだけinvalid/incompleteにしHARNESS verification ownerへ戻す。 |
| `CASE-INT-033-02d` | 二sourceの同語異義を一つへ統合 | 融合結果を不合格とし、矛盾した両sourceを分離保持して該当Product Core ownerとHARNESS ownerへ別々に戻す。 |
| `CASE-INT-033-02e` | scopeを異なるProduct Coreへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02f` | 二sourceのrevisionを取り違える | 二sourceのrevision取り違えを拒否し、元の各sourceを保持してそのsourceを所有するProduct Core/HARNESS ownerへ別々に戻す。 |
| `CASE-INT-033-02g` | 受領時に未選択connectorを必須依存として追加 | 未選択connectorを使用/追加せず未観測として保持し、適用CONNECT contract ownerへ照会する。 |
| `CASE-INT-033-02h` | 有効なProduct Core/HARNESS入力のまま、INTELLIGENCEがProduct Coreの意味変更を確定する | 意味変更の確定を拒否し、Product Coreの意味・正本を不変に保つ。判断はProduct Core ownerへ返し、INTELLIGENCEは解釈候補を確定事実へ昇格させない。他の正常source/operationは維持する。 |

### CASE-INT-033-03 — 未見入力の親oracle（AC-INT-033-03）

入力: 初めて受領するProduct Core要求schema版で、宣言済みcompatibility内の版と有効HARNESS sourceを別identity/revisionで与える。

期待oracle: 二sourceを別々の意味・revision・ownerへ束縛して受領する。未宣言schemaの反例はCASE-INT-033-03aを参照し、両者を同じ入力に混ぜない。

### CASE-INT-033-03a — 未宣言schemaのunsupported保持（AC-INT-033-03 / AC-INT-033-04）

入力: 033-01と同じProduct Core/HARNESS source pairからschema compatibility declarationだけを外した未見pairを与える。
期待oracle: pairをunsupported/unknownとして受領完了にせず、二sourceを別々に保持して各source ownerへ返す。未宣言schemaを正常未見versionとして受け入れない。
### CASE-INT-033-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-033-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-033-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-033-04a` | Product Core source identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当Product Core ownerが特定されるまで各sourceを分離して保持し、source ownerが特定できれば当該ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04b` | HARNESS obligation revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04c` | 二sourceの意味衝突が未解決 | 意味衝突をunknown/incompleteとして両sourceを分離保持し、該当Product Core ownerとHARNESS ownerへ別々に戻す。 |
| `CASE-INT-033-04d` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04e` | 片方のsource scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、該当する当該source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04f` | 索引：未宣言schema変異はCASE-INT-033-03aを参照 | CASE-INT-033-03aでunsupported/unknown・両source分離・各owner返却を照合し、独立fixtureとして二重計上しない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-033-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-033-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-034-01 — source-bound正常（AC-INT-034-01）

入力: 過去evaluation、success/failure/counterexample、Worker/model実績、Bench level、explicitly unevaluatedと各source scope/revision。出力: scope付き判断材料。過去評価ownerはLABO、配置候補ownerはINTELLIGENCE。責務: LABO evaluation/source owner; 適用CONNECT contract owner。

**期待oracle:** LABO評価済み結果と別caseの明示的未評価結果を受け、評価済みscopeだけ証拠とし未評価はそのまま保持する。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-034-02 — 親固有fieldの独立negative（AC-INT-034-02）

各行をCASE-INT-034-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-034-02a` | LABO evaluation identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02b` | evaluation source revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02c` | 評価scopeを別Worker/modelへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02d` | explicitly unevaluatedを評価済みに変換 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02e` | 現在scopeで成立するcounterexampleだけを除外 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02f` | Bench levelを根拠なく別水準へ変換 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02g` | 評価結果のownerをINTELLIGENCEへ変更 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02h` | stale evaluationをcurrent evidenceとして使う | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、LABO evaluation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-034-02i` | LABO historyだけを入力にINTELLIGENCEが現在のOS assignmentを書き換える | 不合格。照合をLABO evaluation ownerへ戻し、現在割当はOSに残して変更しない。 |
| `CASE-INT-034-02j` | Bench evaluation source identityだけを別sourceへ変える | 当該Bench評価を対象Workerの適格証拠にせずLABOへ戻す。他の同scope正常評価を保持する。 |
| `CASE-INT-034-02k` | 索引：Bench評価scopeの別Worker/modelへの流用 | CASE-INT-034-02cで照合し、この行を独立fixture/分母へ重複算入しない。 |
| `CASE-INT-034-02l` | 同scope LABO原結果がsuccessと分かる正常入力から結果値だけfailureへ反転し、identity/revision/evidenceは保持する | 原結果との不一致を検出し判断evidenceへ使わずLABO evaluation ownerへ戻す。原結果と他の有効材料は保持する。 |
| `CASE-INT-034-02m` | 同scope LABO正常評価packetからsuccess/failure結果値だけを欠落させる。他のsource/revision/scope/evidenceは有効 | 欠落値をunknown/未評価として保持し、判断evidenceへ使わずLABO evaluation ownerへ戻す。値を成功/失敗へ補完しない。 |
| `CASE-INT-034-02n` | 同scope LABO原結果がfailureと分かる正常入力から結果値だけsuccessへ反転し、identity/revision/evidenceは保持する | 原結果との不一致を検出し判断evidenceへ使わずLABO evaluation ownerへ戻す。failure原結果と他の有効材料は保持し、過去失敗を成功へ変換しない。 |

### CASE-INT-034-03 — 未見入力の親oracle（AC-INT-034-03）

入力: 初めて受領するLABO評価versionだが、LABOの宣言済みcompatibility内でstatus/evidence/scopeを解釈できるfixture。

期待oracle: 同scopeの評価済み材料だけを証拠として受領し、別caseの明示的未評価印は未評価のまま保つ。未知status/範囲外版は04c/04eで別検証する。

### CASE-INT-034-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-034-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-034-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-034-04a` | LABO evaluation revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04b` | evaluation scope/Worker identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04c` | statusが未定義で評価済み/未評価を区別できない | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 当該caseは未評価のまま保持する。 |
| `CASE-INT-034-04d` | evidence source/provenanceがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04e` | compatibility range外の評価version | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 当該caseは未評価のまま保持する。 |
| `CASE-INT-034-04f` | 選択された専用HELIX-CONNECT connector contractのidentityだけをunknownにする | 契約unknownを保持し、CONNECT contract ownerへ照会する。契約を推測して接続しない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-034-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-034-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-035-01 — source-bound正常（AC-INT-035-01）

入力: plan/placement/diagnosis/review/repair candidate、根拠、停止条件、依存、source revision。出力: OSが受け取れる候補。ticket登録・割当・実行・進行はOS。責務: INTELLIGENCE candidate owner; OS ticket/assignment owner。

**期待oracle:** 承認済み目標・依存関係を含むcandidateをOSへ渡し、INTELLIGENCE出力はcandidate receiptまでとする。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-035-02 — 親固有fieldの独立negative（AC-INT-035-02）

各行をCASE-INT-035-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-035-02a` | candidate identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02i` | candidate source revisionを欠落 | source revisionだけinvalid/incompleteにしINTELLIGENCE candidate ownerへ戻す。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02b` | candidate evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02j` | candidate dependencyを欠落 | dependencyだけinvalid/incompleteにしINTELLIGENCE candidate ownerへ戻す。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02c` | 停止条件を欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02d` | stale candidateをcurrentとして提示 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02e` | OS ticket mappingが未宣言なのに推測 | ticket mapping unknownを保ち、INTELLIGENCE candidateをticket化しない。mapping/発行はOSに残し、mapping candidateの不備はINTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-035-02f` | INTELLIGENCE candidate receiptだけをOS ticketとして扱う。他candidate入力は有効で、OS ticketは未発行。 | candidate receiptからのticket昇格を拒否し、候補を候補のまま保持する。INTELLIGENCE candidate ownerへ誤った昇格を戻し、mapping/発行authorityをOSに残す。ticketを生成・発行しない。 |
| `CASE-INT-035-02g` | 未選択connectorを必須依存として候補へ追加 | 未選択connectorは未観測のまま保持し、適用CONNECT contract ownerへ照会する。ticket/assignmentを生成しない。 |
| `CASE-INT-035-02h` | candidate source scopeを別taskへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 この不完全なcandidateをticket化しない。 |
| `CASE-INT-035-02k` | 目標未承認のcandidateをticket化可能としてOSへ渡す | 承認を創作せずcandidateを保留し、OS ticket/assignmentを成立させない。INTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-035-02l` | INTELLIGENCEがOS assignmentを生成・確定する | 不合格。INTELLIGENCEはplacement proposalまでとし、誤ったassignment生成はINTELLIGENCE candidate ownerへ戻す。assignmentの発行・確定はOSへ残す。 |
| `CASE-INT-035-02m` | 他のcandidate入力は有効なまま、INTELLIGENCE自身がOS ticketを生成・発行する | ticket生成・発行を拒否し、ticket authorityをOSに残す。candidateはINTELLIGENCE candidate ownerへ戻し、OS ticket/assignment成立として扱わない。 |

### CASE-INT-035-03 — 未見入力の親oracle（AC-INT-035-03）

入力: 未fixture task classの候補で、既知task/scope契約とOSが宣言したticket mappingを満たす。

期待oracle: candidate receiptをOSへ渡し、ticket化とassignmentはOSへ残す。mapping unknownは04dで別検証する。

### CASE-INT-035-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-035-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-035-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-035-04a` | candidate source revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。  独自ticketを生成せずticket化しない。 |
| `CASE-INT-035-04g` | candidate identityだけをunknownにする | 当該identityをunknownとして候補を保存し、INTELLIGENCE candidate ownerへ戻す。独自ticketを作らない。 |
| `CASE-INT-035-04f` | dependency scopeがunknown | dependency scopeだけunknown/incompleteとして候補を保存し、INTELLIGENCE candidate ownerへ戻す。独自ticketを作らない。 |
| `CASE-INT-035-04b` | goal scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。  独自ticketを生成せずticket化しない。 |
| `CASE-INT-035-04c` | stop conditionが未定義 | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。  独自ticketを生成せずticket化しない。 |
| `CASE-INT-035-04d` | OS ticket mappingがunknown | OS ticket mappingをunknownとしてcandidateを保存し、OS ticket/assignment ownerへ照会する。独自ticketを作らない。 |
| `CASE-INT-035-04e` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-035-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-035-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-036-01 — source-bound正常（AC-INT-036-01）

入力: operation candidateのactor/action/target/scope/revisionとSECURITY permission/constraint/revocation結果。出力: 修復candidateに付くpermission照合結果。permission/isolation authorityはSECURITY。責務: SECURITY permission/isolation owner; 適用CONNECT contract owner。

**期待oracle:** actor/action/target/scopeに対する操作時点で有効なSECURITY permissionと制約を照合し、permissionを発行/変更しない。期限切れ/revoked permissionでは操作を実行可能にしない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-036-02 — 親固有fieldの独立negative（AC-INT-036-02）

各行をCASE-INT-036-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-036-02a` | actor identityを欠落 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-02b` | action identityを欠落 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-02c` | target identityを欠落 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-02d` | scopeだけを不一致にする | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-02e` | permission revisionをstaleにする | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-02f` | 操作時点ですでにrevokedのpermissionを有効扱いする | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-02g` | 別actorのpermissionを流用（action/targetは一致） | actor mismatchだけを拒否し、当該operationを実行可能にしない。SECURITY permission/isolation ownerへ照合を戻し、他fieldは保持する。 |
| `CASE-INT-036-02h` | INTELLIGENCEがSECURITY permissionを新規発行する | 不合格。permission発行はSECURITY authorityに残し、SECURITYへ戻す。 |
| `CASE-INT-036-02i` | 操作時点ですでに期限切れのpermissionを有効扱いする | 操作timestamp時点の期限を照合して実行可能にせずSECURITY permission/isolation ownerへ戻す。 |
| `CASE-INT-036-02j` | 索引：新規permission発行変異はCASE-INT-036-02hを参照 | CASE-INT-036-02hで検証し、この行を独立fixture/分母へ重複算入しない。 |
| `CASE-INT-036-02k` | INTELLIGENCEが既存SECURITY permissionを変更する | 不合格。permissionはSECURITY authorityに残し、SECURITY ownerへ戻す。 |
| `CASE-INT-036-02l` | permissionは有効だがSECURITY constraintに違反するactionを許可扱いする | 不合格。operationを実行可能にせず、SECURITY permission/isolation ownerへ戻す。 |
| `CASE-INT-036-02n` | 別actionのpermissionを流用（actor/targetは一致） | action mismatchだけを拒否し、当該operationを実行可能にしない。SECURITY permission/isolation ownerへ照合を戻し、他fieldは保持する。 |
| `CASE-INT-036-02o` | 別targetのpermissionを流用（actor/actionは一致） | target mismatchだけを拒否し、当該operationを実行可能にしない。SECURITY permission/isolation ownerへ照合を戻し、他fieldは保持する。 |

### CASE-INT-036-03 — 未見入力の親oracle（AC-INT-036-03）

未見actionでpermission sourceが欠落/unknownのfixtureでは、まずunknownとしてSECURITY permission/isolation ownerへ返し、操作を実行可能にしない。明示permissionによる照合は独立fixture `CASE-INT-036-03a` で扱う。scope外/unknown条件は04の独立fixtureでも照合する。

期待: このfixtureでは未見actionのpermission状態が確認できないためunknownを保ち、実行可能状態を作らない。別actionのpermissionは流用せず、INTELLIGENCEから実行許可を作らない。

### CASE-INT-036-03a — 未見action・明示permission（AC-INT-036-03）

未見actionでも、SECURITY permission sourceがactor/action/target/scopeを明示し、操作時点で有効ならその照合結果を返す。CASE-INT-036-03のunknown結果をこのfixtureへ引き継がず、別actionのpermissionやINTELLIGENCE生成許可を使わない。

### CASE-INT-036-03b — 未見actionと別actionの有効permission（AC-INT-036-03）

入力: 未見actionの許可結果だけを欠落させ、同一actor/target/scopeに一致する別actionの有効permissionは存在する。

期待: 別actionの有効permissionを流用せず、未見actionをunknownとしてSECURITY permission/isolation ownerへ戻す。当該operationは実行可能にしない。

### CASE-INT-036-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-036-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-036-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-036-04a` | actor permissionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。  当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-04b` | action permissionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。  当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-04c` | target permissionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。  当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-04h` | permission statusがunknown | statusだけunknownとしてSECURITYへ戻し、実行可能にしない。 |
| `CASE-INT-036-04f` | scope適用性がunknown | scopeだけunknownとしてSECURITYへ戻す。  当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-04g` | permission revisionがunknown | revisionだけunknownとしてSECURITYへ戻し、実行可能にしない。 |
| `CASE-INT-036-04d` | revocation時点がunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。  当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-04e` | actionがsourceに未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。  当該operationを実行せず、実行可能にも昇格させない。 |
| `CASE-INT-036-04i` | SECURITY constraintが欠落 | constraint適用性をunknownとして実行可能にせず、SECURITY permission/isolation ownerへ戻す。 |
| `CASE-INT-036-04j` | 選択された専用HELIX-CONNECT connector contractのidentityだけをunknownにする | 契約unknownを保持してCONNECT contract ownerへ照会し、操作を実行可能にしない。SECURITY authorityは保持する。 |
| `CASE-INT-036-04k` | 既知action/actor/target/scopeは有効だがSECURITY permission結果だけを欠落させる | permission結果欠落をunknown/incompleteとしてSECURITY permission/isolation ownerへ戻す。INTELLIGENCEは許可を推測せず、operationを実行可能にしない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-036-02）

この親の各operationにHARNESS-L2-010/011共通pack contractを適用する。以下は一度にpack field一つだけを変えた別fixtureであり、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-036-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-037-01 — source-bound正常（AC-INT-037-01）

入力: OS発行・割当ticket、Worker actor、task scope、ticket revision、admitted contract。出力: Worker actor/scope付き実行結果を同ticketに結びOS/INTELLIGENCEへ返す。責務: OS ticket/assignment owner; Worker execution/result owner。

**期待oracle:** OSがticketとWorker/version/scopeを割り当てた後、その対応を保持してWorker resultを同ticketの結果として扱う。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-037-02 — 親固有fieldの独立negative（AC-INT-037-02）

各行をCASE-INT-037-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-037-02a` | OS-issued ticket identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02b` | Worker assignmentを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02c` | Worker identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02d` | Worker versionをassignmentと不一致にする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02e` | task scopeを別ticketへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02f` | Worker result actorをassignmentと不一致にする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker execution/result ownerへ戻す。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02g` | Worker resultのactor/scope由来を照合する根拠だけを欠落 | 結果のactor/scope同一性を未確認としてWorker execution/result ownerへ照合を戻し、正しいticketの結果として完了扱いしない。有効なOS assignmentは保持する。 |
| `CASE-INT-037-02h` | INTELLIGENCEから実行許可を追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。他の正常source/operationは維持し、unknown/不適合ticketをWorker実行へ渡さない。 |
| `CASE-INT-037-02i` | actor/executorをINTELLIGENCEに差し替える | 不合格。INTELLIGENCEをWorkerとして扱わず、OSへ戻しWorker実行に渡さない。 |
| `CASE-INT-037-02j` | 有効な別ticketに割当済みWorker resultのticket identityだけを差し替える | 当該resultを現在ticketへ結ばず割当済み扱いしない。OS ticket/assignment ownerへ戻し、Worker result identityを保持する。 |

### CASE-INT-037-03 — 未見入力の親oracle（AC-INT-037-03）

入力: 未fixtureのWorker version 3、同版を許容する宣言済compatibility、OS-issued ticket T-17、同ticketのassignmentと有効task/scopeを与える。

期待oracle: OS assignmentとtask/scopeを照合して同ticketのWorker resultとして受け入れる。未fixtureだけを拒否理由にせず、INTELLIGENCEが実行許可を追加しない。

### CASE-INT-037-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-037-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-037-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-037-04a` | OS ticket identity/stateがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04b` | Worker assignment/versionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04c` | task scope compatibilityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻し、Worker実行へ渡さない。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04d` | Worker result provenanceがunknown | 該当fieldだけunknown/incompleteとして推測を止め、Worker execution/result ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04e` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04f` | Worker version/assignment/declared compatibilityは有効だがtask適合の確認だけがない | task適合をunknownに保ちOSへ戻す。INTELLIGENCEから実行許可を追加せずWorker実行へ渡さない。 |
| `CASE-INT-037-04g` | OS assignment・task scopeは有効だがWorker版compatibility rangeが未宣言 | compatibilityをunknownとして保持しOSへ戻す。実行許可を足さずWorker実行へ渡さない。 |
| `CASE-INT-037-04h` | compatibility rangeは宣言済みだがWorker版とのcompatibility値だけがunknown | compatibilityだけunknownとして保持しOSへ戻す。実行許可を足さずWorker実行へ渡さない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-037-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-037-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-038-01 — source-bound正常（AC-INT-038-01）

入力: requirement revision、oracle、expected failure、independent verification、consumer acceptance、backflow condition。出力: 修復scopeに束縛した検証義務一式。責務: HARNESS requirement/verification owner。

**期待oracle:** HARNESS requirement revisionのverification obligation一式をrepair ticketへ渡し、実行後も同じobligationを照合する。oracle/obligationの除去・弱化後を検証完了としない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-038-02 — 親固有fieldの独立negative（AC-INT-038-02）

各行をCASE-INT-038-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-038-02a` | requirement revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS requirement ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02b` | verification oracleを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02c` | expected failure conditionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02d` | independent verification obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02e` | consumer acceptance obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02f` | backflow conditionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02g` | 未選択connectorを必須依存として提案へ追加 | 未選択connectorは未観測のまま保持して追加を拒否し、適用CONNECT contract ownerへ契約照会を戻す。他の有効source/operationは保持する。 |
| `CASE-INT-038-02h` | 修復器がoracleを弱化し検証済みにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02i` | repairerがverification obligationを1件削除 | 不合格。元の義務を保持しHARNESSへ戻す。 |
| `CASE-INT-038-02j` | repairerがverification obligationを1件追加 | 不合格。新規義務を作らずHARNESSへ戻す。 |
| `CASE-INT-038-02k` | repair後結果がoracle不合格なのに検証済み扱いする | 不合格。修復を未完了としHARNESSへ戻す。 |
| `CASE-INT-038-02l` | obligationを別repair scopeへ束縛する | 不合格。修復scopeに結び付く検証義務を再照合するためHARNESSへ戻す。 |

### CASE-INT-038-03 — 未見入力の親oracle（AC-INT-038-03）

入力: 未見obligation種別を受け取り、source revisionとscopeは有効だがHARNESSの判定可能な結果はまだない。

期待oracle: passとせず、HARNESSが判定可能にするまで未充足を保持してHARNESSへ戻す。INTELLIGENCEが受入を生成しない。

### CASE-INT-038-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-038-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-038-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-038-04a` | requirement/oracle revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS requirement/verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04b` | expected failure conditionが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04c` | independent verification statusがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04d` | consumer acceptance scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04e` | backflow conditionが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04f` | selected connector contractのadmission状態だけをunknownにする | 契約の成立を推測せず当該接続を未成立として保持し、適用CONNECT contract ownerへ確認を戻す。他fieldとsource authorityは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-038-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-038-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-039-01 — source-bound正常（AC-INT-039-01）

入力: scope付きrepair candidate、Worker execution evidence、HARNESS verification resultと各revision/receipt。出力: OS acceptanceへの検収入力。acceptance/progressはOS。責務: candidate/Worker/HARNESSの各source owner; OS acceptance owner。

**期待oracle:** 同一修復scopeのcandidate、execution evidence、HARNESS resultを区別してOSへhandoffし、OSが独自に受入判断できる証拠を残す。Worker成功だけではOS acceptanceを成立させない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-039-02 — 親固有fieldの独立negative（AC-INT-039-02）

各行をCASE-INT-039-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-039-02a` | repair candidate scopeを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-02b` | execution evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker execution/result ownerへ戻す。他の正常source/operationは維持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-02c` | HARNESS verification resultを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-02d` | OS acceptance receiptをINTELLIGENCEが生成 | 生成を拒否し、OS acceptanceを成立させない。OS acceptance authorityをOS ownerに保持し、INTELLIGENCEはacceptance receiptを作らない。 |
| `CASE-INT-039-02e` | 別scopeのevidenceを同じ候補へ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当evidence producer ownerへ戻す。他の正常source/operationは維持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-02f` | stale HARNESS resultをcurrent扱い | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、適用CONNECT contract ownerへ照会し、未選択connectorは未観測のまま保持する。他の正常source/operationは維持する。OS acceptanceは成立させない。 |
| `CASE-INT-039-02h` | 重複receiptを新しいacceptance evidenceにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS acceptance ownerへ戻す。他の正常source/operationは維持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-02i` | receiptの到着順が逆であることだけを根拠に新しいacceptance evidenceとして採用 | OS acceptanceを生成せず、別段階receiptと順序を保持してOSへ戻す。 |

### CASE-INT-039-03 — 未見入力の親oracle（AC-INT-039-03）

入力: 未fixtureのreceipt version 3、3を許容する宣言済互換契約、同一correlation ID/repair scopeと各producerのsource revisionを与える。

期待oracle: 段階別にreceiptを受領し、candidate/Worker/HARNESSの証拠を区別してOSへhandoffする。OSの独自acceptanceは生成しない。互換範囲外/correlation不一致は03a/03bで別検査する。

### CASE-INT-039-03a — correlation ID不一致（AC-INT-039-03）

入力: 他のreceipt fieldは正常値のまま、correlation IDだけを対応operationと不一致にする。
期待oracle: receiptを未受領として保持し、該当producer/OSへ戻す。

### CASE-INT-039-03b — 範囲外receipt version（AC-INT-039-03）

入力: 他のreceipt fieldは正常値のまま、versionだけを宣言済compatibility range外にする。
期待oracle: receiptを未受領/unknownとして保持し、該当producer/OSへ戻す。

### CASE-INT-039-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-039-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-039-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-039-04a` | candidate scope/revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-04b` | execution evidence producer/revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、Worker execution/result ownerへ戻す。無関係な正常source/operationは保持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-04c` | HARNESS verification applicabilityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-04d` | OS acceptance targetがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS acceptance ownerへ戻す。無関係な正常source/operationは保持する。  OS acceptanceを成立させない。 |
| `CASE-INT-039-04e` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。OS acceptanceは成立させない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-039-02）

この親の各operationにHARNESS-L2-010/011共通pack contractを適用する。以下は一度にpack field一つだけを変えた別fixtureであり、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-039-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-040-01 — source-bound正常（AC-INT-040-01）

入力: prediction/diagnosis/review/placement/repair result、source revision、episode/scope、actual evidence/observation window。出力: LABOの過去評価材料。長期効果評価ownerはLABO。責務: INTELLIGENCE source/result owner; LABO evaluation owner。

**期待oracle:** predictionと後続actual outcomeを同一episode/scopeへ結び、source revisionと観測windowを分けてLABOへ渡す。prediction単独はactual receiptでない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-040-01a — prediction結果のsource binding（AC-INT-040-01）

入力: prediction result、source identity/revision、episode/scope、observation window。
期待oracle: prediction種別とsourceを固定し、actual outcomeとして扱わずLABOへ渡す。

### CASE-INT-040-01b — diagnosis結果のsource binding（AC-INT-040-01）

入力: diagnosis result、source identity/revision、episode/scope、observation window。
期待oracle: diagnosis種別とsourceを固定し、predictionまたはactualへ読み替えずLABOへ渡す。

### CASE-INT-040-01c — review結果のsource binding（AC-INT-040-01）

入力: review result、source identity/revision、episode/scope、observation window。
期待oracle: review種別とsourceを固定し、predictionまたはactualへ読み替えずLABOへ渡す。

### CASE-INT-040-01d — placement結果のsource binding（AC-INT-040-01）

入力: placement result、source identity/revision、episode/scope、observation window。
期待oracle: placement種別とsourceを固定し、predictionまたはactualへ読み替えずLABOへ渡す。

### CASE-INT-040-01e — repair resultのsource binding（AC-INT-040-01）

入力: repair result、source identity/revision、episode/scope、observation window。
期待oracle: repair result種別とsourceを固定し、predictionまたはactualへ読み替えずLABOへ渡す。

### CASE-INT-040-02 — 親固有fieldの独立negative（AC-INT-040-02）

各行をCASE-INT-040-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-040-02a` | prediction source identityを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02i` | prediction source revisionを欠落 | source revisionだけinvalid/incompleteにしINTELLIGENCE result/source ownerへ戻す。 |
| `CASE-INT-040-02b` | predictionだけをactual outcomeとして提出し、実測source/actual eventは存在しない | 不合格。predictionをactualとして受領済みにせず、実測不足・未観測を保持してLABO evaluation ownerへ戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02c` | episode/scope bindingを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02d` | observation windowを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02e` | 遅着actualを別episodeへ結ぶ | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02f` | 重複actualを別成功に数える | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02g` | 未選択connectorを必須依存として提案へ追加 | 未選択connectorは未観測のまま保持して追加を拒否し、適用CONNECT contract ownerへ契約照会を戻す。他の有効source/operationは保持する。 |
| `CASE-INT-040-02h` | evaluation ownershipをINTELLIGENCEへ変更 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02j` | actual resultのsource revisionだけを欠落させる | actualを未検証/unknownとして保持し、INTELLIGENCE result/source ownerへ戻す。 |
| `CASE-INT-040-02k` | actual resultのsource revisionをpredictionと同一扱いにする | sourceを取り違えたactualを拒否し、両sourceを分離してINTELLIGENCE result/source ownerへ戻す。 |
| `CASE-INT-040-02l` | diagnosis resultの種別fieldだけをpredictionへ付け替える | source identity/revision/episode/scopeを維持したまま種別取り違えを拒否し、INTELLIGENCE source/result ownerへ照合を戻す。 |

### CASE-INT-040-03 — 未見入力の親oracle（AC-INT-040-03）

入力: episode E17/source revision R3/window W1のpredictionと、同じepisodeへ結べる遅着actual A1を与える。同一event identity A1の重複を再送し、実測source revisionはpredictionから分離する。

期待oracle: 遅着actualを正しいepisodeへ結び、同一A1を1件だけ保持して成功件数を増やさない。prediction単独を実績にせず、未対応actualは独立03aでunknownを保持する。

### CASE-INT-040-03a — 対応episodeのないactual（AC-INT-040-03）

入力: actualのidentity/source revision/観測windowは有効だが、対応episodeが見つからない。

期待oracle: 対応を推測せずLABOへunknownとして送り、成功件数に数えない。identity欠落は04eの別fixtureとする。

### CASE-INT-040-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-040-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-040-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-040-04a` | prediction source identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04f` | prediction source revisionがunknown | revisionだけunknown/incompleteとしてINTELLIGENCE result/source ownerへ戻す。 |
| `CASE-INT-040-04b` | actual outcomeが未観測 | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ未観測として返す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04c` | episode/scope bindingがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04d` | observation windowが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04e` | actual event identityだけをunknownにし、episode対応とは区別する | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04g` | selected connector contractのadmission状態だけをunknownにする | 契約の成立を推測せず当該接続を未成立として保持し、適用CONNECT contract ownerへ確認を戻す。他fieldとsource authorityは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-040-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-040-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-041-01 — source-bound正常（AC-INT-041-01）

入力: 各admitted mechanismの許可current state/evidence、個別revision、connector/authority contract。出力: source別Situation Model input。個別connector/authority identityを維持。責務: 各source owner; CONNECT contract owner。

**期待oracle:** HARNESSとOSを個別source identity/connectorで読み、各revision/scope/authorityを個別に保つ。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-041-02 — 親固有fieldの独立negative（AC-INT-041-02）

各行をCASE-INT-041-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-041-02a` | source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当source機構ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-041-02b` | source current-state revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当source機構ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-041-02c` | source evidence scopeを別機構へ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当source機構ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-041-02d` | 同名HARNESS/OS fieldを同一identityへ統合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESSとOSの各source ownerを別々に保持する。他の正常source/operationは維持する。 |
| `CASE-INT-041-02e` | 選択sourceのconnector contractを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当CONNECT contract ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-041-02f` | 選択sourceの互換範囲外revisionを採用 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当source機構ownerとCONNECT contract ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-041-02g` | 未選択Web/WEB-OSを常時依存へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、未選択sourceは未観測として保持し依存ownerを追加しない。他の正常source/operationは維持する。 |
| `CASE-INT-041-02h` | source authorityをINTELLIGENCEへ移す | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当source機構ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-041-02i` | source identity/revision/scopeはHARNESSとOSで別々の有効値を保持し、OS connector bindingだけをHARNESS専用connectorと同一へ変える | source間connector共有を不合格とし、source別bindingを保って各source ownerおよびCONNECT contract ownerへ戻す。 |

### CASE-INT-041-03 — 未見入力の親oracle（AC-INT-041-03）

入力: Web/WEB-OS connector契約が未選択のfixtureで、選択済みHARNESS/OSの有効source契約を与える。

期待oracle: 未選択Web/WEB-OSは未観測として記録し、HARNESS/OSに常時必須のsourceとして要求しない。選択済みsourceは別connector/identity/revision/scopeで保持する。

### CASE-INT-041-03a — 宣言済範囲内の未見source版（AC-INT-041-03）

入力: 選択HARNESS source identity H1の未fixture版3、3を含む宣言済互換範囲2–4、scope S1、有効な専用connector contractを与える。
期待oracle: source identity/revision/scopeを保持してSituation Modelへ受け、HARNESS source authorityを変えない。未見であることだけで拒否しない。

### CASE-INT-041-03b — 選択source互換性不明（AC-INT-041-03）

入力: 選択source identity/version/scopeは有効なまま、その版の互換性だけをunknownにする。
期待oracle: unknownを保持して該当source ownerへ照会し、宣言済範囲内として受けた扱いにしない。

### CASE-INT-041-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-041-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-041-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-041-04a` | selected source identity/revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当source機構ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04b` | source scope/authorityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当source機構ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04c` | selected connector contractがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04d` | 互換性rangeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、該当source機構ownerとCONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04e` | 未選択sourceを要求された | 該当fieldだけunknown/incompleteとして推測を止め、未選択sourceは未観測のまま保持する。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-041-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-041-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-044-01 — source-bound正常（AC-INT-044-01）

入力: INTELLIGENCE decision/candidate、genericization proposal、evidence/scope、LABO evaluation handoff。出力: candidateをLABO経路へ渡す。BRAIN knowledge canonicalを保持し直接出力しない。責務: LABO evaluation owner; BRAIN knowledge owner。

**期待oracle:** generic candidateと出典/scopeをLABOへ渡し、BRAIN knowledge正本を変えない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-044-02 — 親固有fieldの独立negative（AC-INT-044-02）

各行をCASE-INT-044-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-044-02a` | generic candidate identityを欠落 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02i` | generic candidate sourceを欠落 | sourceだけinvalid/incompleteにしLABO evaluation ownerへ戻す。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02b` | candidate evidence scopeを欠落 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02c` | LABO評価経路を省略 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02d` | 未評価candidateからBRAIN更新を試みる | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02e` | evaluation evidenceを別scopeへ結ぶ | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02f` | 汎用性を根拠なく確定 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02g` | 未選択connectorを必須依存として追加 | 未選択connectorを使用/追加せず未観測のまま保持し、CONNECT contract ownerへ照会する。BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02h` | INTELLIGENCEからBRAINへ直接出力 | 変異fieldだけを不成立として保持し、BRAIN knowledge ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-02j` | evidenceが欠落したcandidateからBRAIN canonicalを更新する | 不合格。BRAIN canonicalを不変に保ち、evidence/candidateをLABO evaluation ownerへ戻す。 |

### CASE-INT-044-03 — 未見入力の親oracle（AC-INT-044-03）

入力: 初めて受けるpattern種別のcandidateで、source/scopeは有効だが対象scopeのLABO評価例はまだない。

期待oracle: 一般化可能と断定せず、評価例なしをunknownのままLABO評価経路へ渡す。BRAIN canonicalは変更しない。

### CASE-INT-044-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-044-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-044-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-044-04a` | candidate identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04f` | candidate sourceがunknown | sourceだけunknown/incompleteとしてLABO evaluation ownerへ戻す。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04g` | evaluation evidence identityがunknown | evidence identityだけunknown/incompleteとしてLABO evaluation ownerへ戻す。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04b` | evaluation applicability/scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04c` | evaluation statusが未観測 | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04d` | BRAIN direct-update経路が候補に含まれる | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04e` | generic candidateの対象scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 BRAIN canonicalは変更しない。 |
| `CASE-INT-044-04h` | 選択connectorのidentity/versionは有効だがadmission状態だけunknown | 成立を保留しCONNECT contract ownerへ戻す。BRAIN canonicalを変更しない。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-044-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-044-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-045-01 — source-bound正常（AC-INT-045-01）

入力: Product Core meaning conflict/gap/improvement candidate、source revision、target identity。出力: 該当Product Core向けbackflow candidate。canonical変更はProduct Core owner。責務: 該当Product Core owner; target不明ならunrouted。

**期待oracle:** Product Core issueを該当product/revision/ownerに結ぶbackflow candidateを作り、正本変更はownerに残す。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-045-02 — 親固有fieldの独立negative（AC-INT-045-02）

各行をCASE-INT-045-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-045-02a` | Product Core target identityを欠落 | 変異fieldだけを不成立として保持し、該当Product Core ownerへ照会し、対象ownerの特定/確認を求める。無関係な正常field/operationは保持する。  unroutedを保持し別Product Coreへ推測routeしない。 |
| `CASE-INT-045-02b` | target product revisionを欠落（target identity/ownerは有効） | revision欠落をunknownとして保持したbackflow candidateを既知の該当Product Core ownerへ返す。target identityをunrouted/未識別へ変えない。 |
| `CASE-INT-045-02c` | source meaning/conflict evidenceを欠落（target identity/ownerは有効） | evidence欠落をunknownとして保持したbackflow candidateを既知の該当Product Core ownerへ返す。target identityは保持し、新しい識別照会を作らない。 |
| `CASE-INT-045-02d` | 誤ったProduct Core ownerへrouting | 誤routingを拒否し、既知targetに対応する正しいProduct Core owner向けbackflow candidateを作る。別targetへrouteせず、追加のowner特定照会も作らない。 |
| `CASE-INT-045-02e` | INTELLIGENCEがProduct Core正本を変更 | 変異fieldだけを不成立として保持し、該当Product Core ownerへ不足情報を戻す。無関係な正常field/operationは保持する。  正本への書込みを拒否してProduct Core正本を不変に保ち、backflow candidateとして該当Product Core ownerへ照会する。 |
| `CASE-INT-045-02f` | candidateを既決修正として扱う | 既決修正への昇格を拒否してcandidateを保持し、該当Product Core ownerへ確認を戻す。正本は変更しない。 |
| `CASE-INT-045-02g` | 未選択connectorを必須依存として提案へ追加 | 未選択connectorを未観測のまま保ち必須依存追加を拒否し、CONNECT contract ownerへ契約照会を戻す。 |
| `CASE-INT-045-02h` | source identityを欠落（target identity/ownerは有効） | source identityをunknownとして保持したbackflow candidateを既知の該当Product Core ownerへ返す。target identityをunrouted/未識別へ変えない。 |
| `CASE-INT-045-02i` | source revisionを欠落（target identity/ownerは有効） | source revisionだけunknownとして保持し、candidateを既知の該当Product Core ownerへ返す。 |
| `CASE-INT-045-02j` | source scopeを欠落（target identity/ownerは有効） | source scopeだけunknownとして保持し、candidateを既知の該当Product Core ownerへ返す。 |
| `CASE-INT-045-02k` | target Product Core identity/owner/revisionは既知だが、backflow candidateを経ず直接routeする | 不合格。直接routeを拒否し、該当Product Core owner向けbackflow candidateとして渡す。既知targetのowner特定照会は追加しない。 |
| `CASE-INT-045-02l` | target owner不明のcandidateを別Product Coreへrouteしようとする | 不合格。routeを拒否してunroutedを保持し、Product Core ownerへ照会する。target revision等の他fieldは有効のまま保つ。 |
| `CASE-INT-045-02m` | target owner/identityは有効なままtarget revisionだけunknownのcandidateを別Product Coreへrouteしようとする | 不合格。別Product Coreへのrouteを拒否し元targetとunknown revisionを保持してProduct Core ownerへ照会する。 |

### CASE-INT-045-03 — 未見入力の親oracle（AC-INT-045-03）

入力: 未見product identityを含むbackflow issueで、既存のProduct Core owner名だけがある。

期待oracle: owner名からtargetを推測せずunrouted candidateを保存し、該当Product Coreへの照会でtarget/owner特定を求める。identityとownerが確認できるまで別Product Coreへ送らない。

### CASE-INT-045-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-045-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-045-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-045-04a` | target product identityがunknown | target product identityをunknown、candidateをunroutedとして保持し、Product Core ownerへ照会してtarget/owner特定を求める。別Product Coreへ推測routeしない。 |
| `CASE-INT-045-04b` | Product Core ownerが特定不能 | owner不明を保ち、該当Product Coreへ照会candidateを作ってownerの特定を求める。ownerを創作せず、回答前に別Product Coreへrouteしない。 |
| `CASE-INT-045-04c` | source identityがunknown | source identityがunknownをunknownとして保持し、有効なtarget identity/ownerを変えず該当Product Core ownerへ不足情報を照会する。未確定内容を正本へ書き込まない。 |
| `CASE-INT-045-04f` | source revisionがunknown | source revisionがunknownをunknownとして保持し、有効なtarget identity/ownerを変えず該当Product Core ownerへ不足情報を照会する。未確定内容を正本へ書き込まない。 |
| `CASE-INT-045-04g` | source scopeがunknown | source scopeがunknownをunknownとして保持し、有効なtarget identity/ownerを変えず該当Product Core ownerへ不足情報を照会する。未確定内容を正本へ書き込まない。 |
| `CASE-INT-045-04d` | meaning conflictの根拠がunknown | meaning conflictの根拠がunknownをunknownとして保持し、有効なtarget identity/ownerを変えず該当Product Core ownerへ不足情報を照会する。未確定内容を正本へ書き込まない。 |
| `CASE-INT-045-04e` | 選択connector contractがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-045-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-045-05a` | pack/ability identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05b` | contract versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05c` | pack versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05d` | declared input contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05e` | required dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05f` | declared compatibility rangeを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05g` | exchange conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05h` | update conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05i` | rollback先として直前の適格版または明示replacementを宣言しない | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05j` | declared verification scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05k` | declared output contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05l` | contract versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05m` | pack versionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05n` | 同じ入力とversionから異なるartifactを生成する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05o` | required dependency versionを非互換値へ変更する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05p` | 宣言済compatibility range外のversion pairを入力する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05q` | 宣言されていないdependencyを暗黙に使用する | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |


## Stage 5 — INTELLIGENCE機能fixture（採択済みL2の9親）

状態: 以下は未実行fixture設計。対象はこの9親と個別operationのscopeに限り、L3承認や実動作合格を示さない。各negative rowは列記した一変数だけを変え、独立した反例と期待oracleを持つ。

### CASE-INT-060-01 — 計画候補の正常例 (AC-INT-060-01)

入力: approved requirement revision, HARNESS process contract, current OS state, applicable BRAIN source, graph A→B plus independent C and stop condition. 期待oracle: node/source/edge traceとcandidateの順序はL11-060/005 oracleに一致する。OSだけが別途ticket/進行する。

### CASE-INT-060-02 — 独立計画反例 (AC-INT-060-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-060-02a` | 未承認requirement stateだけを実行可能とする | planを実行可能にせず該当requirement ownerへ戻す。 |
| `CASE-INT-060-02b` | HARNESS contract revisionだけstale | affected nodeだけ保留しHARNESS ownerへ戻す。 |
| `CASE-INT-060-02c` | OS current stateだけstale | affected planning inputを保留しOS state ownerへ戻す。 |
| `CASE-INT-060-02d` | A→B依存だけ逆転 | 不合格。BをAより前へ置かない。dependency ownerを特定できる入力ならそのsourceへ戻し、特定できない場合はowner unknownを保持する。 |
| `CASE-INT-060-02e` | 4.0 workflowだけを1.0必要条件へ追加する | 不合格。4.0を要求せず、固定L2-060のscope内のcandidateを保持する。 |
| `CASE-INT-060-02f` | INTELLIGENCEがOS ticketを発行する | 発行を拒否しticket/推進authorityをOSへ保持する。 |

### CASE-INT-060-03 — 未見計画graph (AC-INT-060-03)

入力: 未公開task graph, declared dependency edge, independent task node, one stop condition. 期待oracle: declared edgeだけ順序化し、独立nodeは依存させず、OS assignment/ticketを生成しない。

### CASE-INT-060-04 — 依存入力unknown (AC-INT-060-04)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-060-04a` | selected BRAIN knowledge applicabilityだけunknown | source fieldをunknownに保ちBRAIN ownerへ返す。 |
| `CASE-INT-060-04b` | graphの一dependency identityだけ未宣言 | dependencyを解消済みに扱わず該当source/contract ownerへ返し、独立branchは保持する。 |

### CASE-INT-061-01 — 同scope根拠に基づく配置案 (AC-INT-061-01)

入力: task identity/capability/tool/domain、2 Worker profile、同作業種別/classのLABO evaluation evidence. 期待oracle: evidenceに適合する候補と除外理由/未評価を出し、OS assignmentとは別のproposalにする。

### CASE-INT-061-02 — 独立配置反例 (AC-INT-061-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-061-02a` | priceだけで順位を確定 | 不合格。根拠不足を明示しINT proposalを確定せず返す。 |
| `CASE-INT-061-02b` | model nameだけで順位を確定 | 不合格。nameを単独適格根拠にしない。 |
| `CASE-INT-061-02c` | benchmark scalarだけで順位を確定 | 不合格。LABO evidence scope/条件と併用せず順位を決めない。 |
| `CASE-INT-061-02d` | evidence task scopeだけ別task | 適合実績へ流用せずLABOへ戻す。 |
| `CASE-INT-061-02e` | LABO stateだけ未評価なのにqualifiedとする | 不合格。未評価を保ちLABOへ戻す。 |
| `CASE-INT-061-02f` | LABOがOS assignmentを実行 | assignmentを成立させずOS ownerに残す。 |
| `CASE-INT-061-02g` | INTELLIGENCE proposalをassignment済み扱いする | assignmentを生成せずOSへhandoffする。 |
| `CASE-INT-061-02h` | selected evidence revisionだけstale | stale evidenceをcurrent評価へ使わずLABOへ戻す。 |

### CASE-INT-061-03 — 未見task class (AC-INT-061-03)

未見task classと宣言済み互換評価scopeを入力する。互換が確認できるfieldのみ照合し、評価なしを未評価として保持し実assignmentを作らない。

### CASE-INT-061-04 — task class適用unknown (AC-INT-061-04)

未宣言task-class compatibilityだけunknownにし、範囲内の他evidenceを保持したままLABO/該当ownerへ返す。

### CASE-INT-062-01 — 修復段階receiptの正常例 (AC-INT-062-01)

入力: 同じtarget revision/scopeを持つ個別SECURITY permission、Worker result、HARNESS verification、OS acceptance-stage input receipts. 期待oracle: 四段階を別receiptで順序づけ、各owner authorityを保ち、acceptance inputまで未完状態を落とさない。

### CASE-INT-062-02 — 修復段階の独立反例 (AC-INT-062-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-062-02a` | SECURITY permission receiptだけ欠落 | 該当stage未成立、SECURITY ownerへ戻す。 |
| `CASE-INT-062-02b` | permission actor/scopeだけ別対象 | operation未許可のままSECURITY ownerへ戻す。 |
| `CASE-INT-062-02c` | Worker execution resultだけ欠落 | Worker stage未成立、Worker execution/result ownerへ戻す。 |
| `CASE-INT-062-02d` | Worker result target revisionだけ別 | resultをrepair scopeへ結ばずWorker ownerへ戻す。 |
| `CASE-INT-062-02e` | HARNESS verificationだけ欠落 | verification未成立、HARNESS verification ownerへ戻す。 |
| `CASE-INT-062-02f` | OS acceptance receiptだけ欠落 | acceptance未成立、OS ownerへ戻す。 |
| `CASE-INT-062-02g` | 全receiptを保ったまま順序だけ逆転 | 欠落stageがあるとは報告せず、順序不成立として該当段階の既存ownerへ戻す。 |
| `CASE-INT-062-02h` | intermediate successだけでrepair完了claim | 不合格。先行段階成功は後段を代替しない。 |

### CASE-INT-062-03 — 未見receipt版 (AC-INT-062-03)

一stageの未見receipt版だけを与える。互換性unknownならそのstageのみ保留し、無関係な成立receiptを維持する。duplicate receiptは同一stageを二重計上しない。

### CASE-INT-063-01 — ownerとepisodeを分けた改善trace (AC-INT-063-01)

入力: LABO past evaluation、BRAIN applicable knowledge、current INT judgment、OS execution、HARNESS process evidenceを一episode/target revision/scopeに束ねる。期待oracle: historical effect, current state, candidate knowledge, execution resultを区別し、effect is LABO-owned/BRAIN canonical is BRAIN-owned.

### CASE-INT-063-02 — 自己改善の独立反例 (AC-INT-063-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-063-02a` | INT self-evaluationだけでlong-term effectを確定 | 効果を確定せずLABO ownerへ返す。 |
| `CASE-INT-063-02b` | INTがBRAIN canonicalへ直接write | 書込み拒否、BRAIN正本不変、BRAIN ownerへ返す。 |
| `CASE-INT-063-02c` | LABO evaluation revisionだけstale | current効果へ使わずLABOへ返す。 |
| `CASE-INT-063-02d` | prediction statusだけactualに置換 | 固定L2-063/L11-117/284に該当条件がない旧fixture。Stage5要件/NFR分母に含めない。 |
| `CASE-INT-063-02e` | OS runだけ未完了でloop完了claim | loop completionを保留しOS ownerへ戻す。 |
| `CASE-INT-063-02f` | BRAIN applicabilityだけ未承認/unknown | BRAIN candidateをgeneric knowledgeにしない。 |
| `CASE-INT-063-02g` | duplicate/out-of-order resultだけ別episodeへbinding | 複合旧index。out-of-orderはCASE-INT-063-04g、duplicateは04hで個別判定する。 |

### CASE-INT-063-03 — 遅着した過去結果 (AC-INT-063-03)

遅着outcomeだけを与える。元episodeへ記録しcurrent judgmentを変更せず、applicability unknownはBRAIN/LABO ownerへ返す。

### CASE-INT-069-01 — queue有限計算 (AC-INT-069-01)

model/rule/unit/revisionを固定しL2 fixtureの5/5 baselineと5/10 scenario, service cap 8を入力する。期待oracle: baseline served 5/5,end queue 0/0; scenario served 5/8,end queue 0/2。

### CASE-INT-069-02 — 明示DB failure edgeの伝播 (AC-INT-069-02)

DB disconnect eventと要求されたdependency/failure/retry edgeを入力する。期待oracle: dependent order processだけwaiting/retryへ進み、edgeなしreporting stateは変化せず、未定義recoveryを作らない。

### CASE-INT-069-03 — 仮想Worker bottleneckの算術 (AC-INT-069-03)

18 jobs, service 3 jobs/min/worker, DB cap 8 jobs/min, worker cost 0.20 credit/(worker·min), DB 0.10 credit/minを入力する。期待oracle: n=2は6 jobs/min/3 min/1.50 credits、n=4は8 jobs/min/2.25 min/2.025 credits。仮想数はOS assignmentを変えない。

### CASE-INT-069-04 — 未対応・不正model入力の独立反例 (AC-INT-069-04)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-069-04a` | service ruleだけ欠落 | throughput/timeを創作せずunknownを保持する。source ownerが明示されている場合だけそこへ照合し、特定できなければ戻し先unknown。 |
| `CASE-INT-069-04b` | selected cost rateだけ別revision | mixed-revision costを拒否しsource ownerへ戻す。 |
| `CASE-INT-069-04c` | unit labelだけ不一致 | 照合不能をunknownとし暗黙換算しない。source/modelが特定できる場合だけ既存source ownerへ戻す。 |
| `CASE-INT-069-04d` | priceだけ欠落 | cost unknownのまま。0 costにしない。 |
| `CASE-INT-069-04e` | reportingにDB dependency edgeを追加せずDB failureを伝播 | edge外stateを不変にしunsupported/blockedを保持する。戻し先ownerを推測しない。 |
| `CASE-INT-069-04f` | recovery ruleだけ不在 | recovery/retry成功を補完せずunknown/blockedを保持し、固定L2が指定するownerを特定できない場合は戻し先unknown。 |
| `CASE-INT-069-04g` | virtual resultを実環境結果と表示 | virtual/actualを区別し不合格、actual観測は未成立のままにする。実測sourceを入力が特定しない場合は戻し先unknown。 |
| `CASE-INT-069-04h` | AI explanationだけをtransition evidenceとして提示 | explanationをstate transition根拠とせず、source/model rule traceを照合する。 |
| `CASE-INT-069-04i` | shared DB ceilingだけを削除 | worker追加の速度比例を算出せず、明示されたceilingを維持する。 |

### CASE-INT-069-05 — 未見の有限state/rule (AC-INT-069-05)

未見state name/edgeを明示rule内に与え、独立small interpreter結果を照合する。外側のdomainだけunknown/unsupportedで返す。

### CASE-INT-070-01 — CORE入力段階 (AC-INT-070-01)

許可sourceとadmitted 033 connectorの正常receiptを同一source/model revision/scopeへ束縛する。

### CASE-INT-070-02 — 計算結果のbinding (AC-INT-070-02)

069 result identity/assumptions/unknownを元033 inputと同scenarioへ結ぶ。

### CASE-INT-070-03 — 結果送信段階 (AC-INT-070-03)

計算後resultのみを040 contractで送り、send receiptを記録する。

### CASE-INT-070-04 — LABO consumer受領 (AC-INT-070-04)

040送達後にLABO-024 consumer receiptを別に取得し、LABO evaluation authorityをLABOに残す。

### CASE-INT-070-05 — 接続失敗の独立反例 (AC-INT-070-05)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-070-05a` | model revisionだけ別 | receiptを結ばずProduct Core/HARNESSへ戻す。 |
| `CASE-INT-070-05b` | 033 admitted connector contractだけ欠落 | input stage未成立、CONNECT/source ownerへ戻す。 |
| `CASE-INT-070-05c` | simulated result statusだけactualへ変更 | 仮想結果を実測にせず不合格。result source/measurementを特定できない場合は戻し先unknown。 |
| `CASE-INT-070-05d` | consumer receiptだけ欠落 | send済みは保持するがconsumer受領/connection完了は成立しない。 |
| `CASE-INT-070-05e` | correlation IDだけ異なる | receiptを同一scenarioに混ぜずconnection未成立とする。既存source/connector責務を特定できない場合は戻し先unknown。 |
| `CASE-INT-070-05f` | payload missing relationを新必須fieldへ黙って変換 | candidate独自schema追加を拒否し不成立を保持する。固定L2にowner指定がないため戻し先unknown。 |

### CASE-INT-070-06 — 遅延・未見receipt (AC-INT-070-06)

未見compatible receipt版は既存contract/identity/revision/scopeで照合し、正常receiptとして記録する。次の独立fixtureはそれぞれ一つの段階receiptだけを変える。

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-070-06a` | 未見互換receipt版（正常） | 固定contractとの互換を確認し、source/consumer段階を別々に記録する。 |
| `CASE-INT-070-06b` | 033 inputの重複receiptだけ追加 | 同一入力を一度だけ保持し、重複を新しいresult/sendへ昇格しない。 |
| `CASE-INT-070-06c` | 069 resultの重複receiptだけ追加 | result重複を一度だけ保持し、別scenario/送達へ流用しない。 |
| `CASE-INT-070-06d` | 040 send receiptの重複だけ追加 | send重複を一度だけ保持し、consumer receiptを生成しない。 |
| `CASE-INT-070-06e` | LABO-024 receiptの重複だけ追加 | consumer重複を一度だけ保持し、evaluation authorityをLABOに残す。 |
| `CASE-INT-070-06f` | 033 inputだけ遅着 | 元source/time/correlationを保持し、後段receiptを先行成立させない。 |
| `CASE-INT-070-06g` | 069 resultだけ遅着 | 元scenario/timeへ結び、後続段階を遡及成立させない。 |
| `CASE-INT-070-06h` | 040 sendまたはLABO receiptだけ遅着 | 遅着した当該段階だけを記録し、他段階/consumer評価を推測しない。戻し先ownerを特定できない場合はunknown。 |

### CASE-INT-071-01 — 有限scenario比較fixture (AC-INT-071-01)

L11 R2187-01のbaseline 5/5、load 5/10、per-step cap 8でqueue oracleを照合する。独立scenarioとしてload increase、DB disconnect、virtual Worker 2→4を実行設計し、3→2.25 minおよび1.50→2.025 credits fixture arithmeticをtraceに束ねる。DB断時は明示order edgeのみblocked、recovery未定義。送達後のLABO-024 receiptがそろって初めてconnection段階を反映する。

### CASE-INT-071-02 — compositeの独立反例 (AC-INT-071-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-071-02a` | baseline model revisionだけscenarioと異なる | 比較不成立、mixed-revisionを拒否する。選択sourceが特定できる場合だけそのsource ownerへ照合し、戻し先を特定できない場合はunknown。 |
| `CASE-INT-071-02b` | one scenario unitだけ不一致 | 異単位差分を比較せずunknown/未比較にする。 |
| `CASE-INT-071-02c` | DB failure edgeだけ欠落 | edge外伝播/復旧を生成せず、該当scenarioをunknown/blockedにする。明示source/規則のownerを特定できる場合だけそこへ照合し、特定できなければ戻し先unknown。 |
| `CASE-INT-071-02d` | virtual worker count変更をOS worker assignmentへ反映 | 変更を拒否しOS assignmentを不変にする。 |
| `CASE-INT-071-02e` | LABO receiptだけ欠落 | calculation/send evidenceは保持しconsumer受領/composite handoff未完了とする。 |
| `CASE-INT-071-02f` | unsupported cost fieldだけ0へ補完 | 不合格。cost unknownを保持する。 |
| `CASE-INT-071-02g` | 069単体結果だけcomposite完了と表示 | 不合格。071比較/後続receiptを成立扱いしない。 |
| `CASE-INT-071-02h` | target scopeだけbaseline/scenario間で不一致 | 該当scenarioを比較不成立/unknownとし、scopeを推測せず他scenarioを保持する。 |

### CASE-INT-071-03 — 未見有限比較 (AC-INT-071-03)

held-out graphで宣言済ruleのみ照合し、unknown edgeと未取得actual receiptは該当scenarioだけ未対応/未比較にする。

### CASE-INT-074-01 — 後続proposalで使う適格LABO feedback (AC-INT-074-01)

評価済み返却feedbackがtask-class/revision/scope/window/source completenessと一致するfixtureを与える。既存L2-010への引用と適用条件を示し、OS ticket/assignmentは作らない。

### CASE-INT-074-02 — feedbackの独立反例 (AC-INT-074-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-074-02a` | LABO evaluation stateだけ未評価 | 実績適合にせずLABOへ戻す。 |
| `CASE-INT-074-02b` | task classだけ別task | feedbackを流用せずLABOへ戻す。 |
| `CASE-INT-074-02c` | target revisionだけstale | current proposal根拠にせずLABOへ戻す。 |
| `CASE-INT-074-02d` | single feedbackをpermanent worker rankにする | 恒久順位/資格化を拒否する。 |
| `CASE-INT-074-02e` | feedbackからmodel/requirementを更新する | CASE-INT-074-05q/05rへの旧複合index。直接writeを拒否し独立fixture数へ重ねない。 |
| `CASE-INT-074-02f` | INTELLIGENCEからOS ticket/assignmentを発行 | CASE-INT-074-05s/05uへの旧複合index。発行・変更を拒否し独立fixture数へ重ねない。 |

### CASE-INT-074-03 — 未見feedback理由class (AC-INT-074-03)

未見reason classと明示互換範囲を入力する。適用範囲が確定するfieldだけを引用し、他をunknown/未評価とする。

### CASE-INT-074-04 — feedback field別unknownの索引 (AC-INT-074-04)

旧fixtureのsource completeness/window/applicability owner複合例は索引としてのみ保持する。独立fixtureは04a–04cに分け、他fieldを有効に固定する。

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-074-04a` | source completenessだけunknown | completenessだけunknownのままにし、評価適用を成立させずLABOへ戻す。 |
| `CASE-INT-074-04b` | observation windowだけunknown | windowだけunknownのままにし、範囲を推測せずLABOへ戻す。 |
| `CASE-INT-074-04c` | applicability statusだけunknown | statusだけunknownのままにし、owner/戻し先を推測せずunknownを保つ。 |

### CASE-INT-077-01 — qualified internal source delta候補 (AC-INT-077-01)

internal selected receiptのsource identity/revision/owner/originを束ね、qualified sourceの根拠が示すdelta candidateを返す。Requirements/Design/Release/Assignmentは変更しない。

### CASE-INT-077-02 — qualified external sourceの分離維持 (AC-INT-077-02)

qualified external receiptを別origin typeで示す。external observationだけからHELIX defectを確定せずinternal sourceと合併しない。

### CASE-INT-077-03 — authorityを変更しない独立反例 (AC-INT-077-03)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-077-03a` | unknown deltaだけ0へ補完 | unknownを維持しselected source ownerへ戻す。 |
| `CASE-INT-077-03b` | origin typeだけinternal/external swap | identity不一致を拒否し元source ownerへ戻す。 |
| `CASE-INT-077-03c` | selected receipt qualificationだけ欠落 | candidateをqualified sourceに結ばず、選択source ownerへ照合する。 |
| `CASE-INT-077-03d` | Requirementだけ直接write | writeを拒否しauthorityを不変にする。戻し先は推測しない。 |
| `CASE-INT-077-03e` | Designだけ直接write | writeを拒否しauthorityを不変にする。戻し先は推測しない。 |
| `CASE-INT-077-03f` | Requirement/Design/Release/Assignment/mergeの複数直接変更を束ねた旧fixture | 03d/e/h/i/jのaggregate index。単独negative件数には算入しない。 |
| `CASE-INT-077-03g` | unknown consumerから新route/ownerを推測 | route/ownerを作らずunknown/incompleteを保持する。戻し先も推測しない。 |
| `CASE-INT-077-03h` | Releaseだけ直接変更 | writeを拒否し、既存release authority/stateを不変にする。戻し先は推測しない。 |
| `CASE-INT-077-03i` | Assignmentだけ直接変更 | writeを拒否し、OSのassignment authority/stateを不変にする。 |
| `CASE-INT-077-03j` | merge authority/stateだけ直接変更 | writeを拒否し、merge authority/stateを不変にする。戻し先は推測しない。 |
| `CASE-INT-077-03k` | unknown deltaだけneutralへ補完 | unknownを維持し、neutral値へ置換しない。選択source ownerへ照合する。 |
| `CASE-INT-077-03l` | unknown deltaだけunchangedへ補完 | unknownを維持し、unchangedと判定しない。選択source ownerへ照合する。 |
| `CASE-INT-077-03m` | unknown deltaだけobservedへ補完 | unknownを維持し、観測済みと判定しない。選択source ownerへ照合する。 |

### CASE-INT-077-04 — 未見source/consumer (AC-INT-077-04)

未見source typeまたはconsumer identityを一項目だけ与える。未宣言のsource owner/consumerを作らずunknown/incompleteで保持する。



#### Stage 5 独立fixture補完（AC参照はL3補完表に対応）

各行は別fixtureで一項目だけ変え、表にない条件は正常のまま固定する。正常/未見正常は既存CASE-INT-*-01/03/04を保持し、下表を同じCASE IDの集約negative件数として数えない。

| CASE | 親/AC | 入力の単独変異 | 期待oracle・戻し先 |
|---|---|---|---|
| `CASE-INT-060-05a` | 060/AC-INT-060-05 | approved requirementだけ欠落 | planを実行可能にせず、該当requirement ownerへ戻す。 |
| `CASE-INT-060-05b` | 060/AC-INT-060-05 | HARNESS process contractだけ欠落 | 影響nodeを未完にしHARNESSへ戻す。 |
| `CASE-INT-060-05c` | 060/AC-INT-060-05 | current OS stateだけ欠落 | state依存nodeを未確定にしOSへ戻す。 |
| `CASE-INT-060-05d` | 060/AC-INT-060-05 | 選択BRAIN knowledgeだけ欠落 | knowledge依存をunknownとしてBRAINへ戻す。 |
| `CASE-INT-060-05e` | 060/AC-INT-060-05 | stop conditionだけ欠落 | stop条件を推測せずaffected planを未完にする。固定L2が個別ownerを指定しないため戻し先unknown。 |
| `CASE-INT-060-05f` | 060/AC-INT-060-05 | 宣言済みstop時のfallbackだけ欠落 | fallbackを補完せず影響nodeとstop理由を保持してsource ownerへ戻す。 |
| `CASE-INT-060-05g` | 060/AC-INT-060-05 | dependency cycleだけ存在 | 解決済み順序を出さずplanを未完にする。dependency ownerがsourceから特定できる場合だけ戻す。 |
| `CASE-INT-060-05h` | 060/AC-INT-060-05 | dependency identityだけ未知 | unknown dependencyを保持する。ownerを特定できない場合は戻し先unknown。 |
| `CASE-INT-060-05i` | 060/AC-INT-060-05 | declared stop後の指定fallback（正常） | 指定fallbackだけを同じsource/scopeで適用し、ticket発行はOSに残す。 |
| `CASE-INT-061-05a` | 061/AC-INT-061-05 | compatibility evidenceだけ未見 | 評価互換性をunknownに保ちLABOへ戻す。 |
| `CASE-INT-061-05b` | 061/AC-INT-061-05 | task scopeだけunknown | 適用範囲を確定せずINTELLIGENCEへ戻す。 |
| `CASE-INT-061-05c` | 061/AC-INT-061-05 | assignment可否だけunknown | proposalをassignmentにせずOSへ戻す。 |
| `CASE-INT-061-05d` | 061/AC-INT-061-05 | task identityだけ別段階receiptから流用 | identity不一致を検出しproposalを未確定にする。task identity ownerを新設せず戻し先unknown。 |
| `CASE-INT-061-05e` | 061/AC-INT-061-05 | revisionだけ異なる段階receiptから流用 | stale/別revisionを混ぜず、source/evaluationならLABO、assignmentならOSの既存責務に従う。 |
| `CASE-INT-061-05f` | 061/AC-INT-061-05 | 評価理由だけ欠落 | proposalを未確定のままLABO評価へ戻し、他のscope/evidenceは保持する。 |
| `CASE-INT-062-04a` | 062/AC-INT-062-04 | isolation evidenceだけ欠落 | 実行成立にせずSECURITYへ戻す。 |
| `CASE-INT-062-04b` | 062/AC-INT-062-04 | repair candidateだけ欠落 | repair目的を推測せず未完を保つ。固定L2に戻し先指定がないためowner unknown。 |
| `CASE-INT-062-04c` | 062/AC-INT-062-04 | targetだけ別revision | CASE-INT-062-02dと同じtarget revision変異の索引。独立fixture数へ重ねない。 |
| `CASE-INT-062-04d` | 062/AC-INT-062-04 | scopeだけ別 | 他scopeの成功を流用せず不成立にする。固定L2に個別owner指定がないため戻し先unknown。 |
| `CASE-INT-062-04e` | 062/AC-INT-062-04 | revisionだけstale | stale evidenceを拒否する。stage/source ownerを特定できる場合だけそこへ戻し、特定不能はunknown。 |
| `CASE-INT-062-04f` | 062/AC-INT-062-04 | owner identityだけ別 | owner不一致を保留し、実際の固定ownerをsourceで特定できない限り戻し先unknown。 |
| `CASE-INT-062-04g` | 062/AC-INT-062-04 | 順序だけ逆転（全receiptは存在） | CASE-INT-062-02gの同一order-negative索引。独立fixture数へ重ねない。 |
| `CASE-INT-062-04h` | 062/AC-INT-062-04 | HARNESS verification resultだけ不合格 | verificationを未成立にしHARNESS verification ownerへ戻す。 |
| `CASE-INT-062-04i` | 062/AC-INT-062-04 | OS acceptance inputだけ未完了 | acceptanceを未成立に保ちOSへ戻す。 |
| `CASE-INT-063-04a` | 063/AC-INT-063-04 | LABO評価だけ不足 | 効果結論を保留しLABOへ戻す。 |
| `CASE-INT-063-04b` | 063/AC-INT-063-04 | BRAIN sourceだけ不明 | knowledge適用をunknownとしBRAINへ戻す。 |
| `CASE-INT-063-04c` | 063/AC-INT-063-04 | OS実行だけ未完 | loop完了をclaimせずOSへ戻す。 |
| `CASE-INT-063-04d` | 063/AC-INT-063-04 | historical evaluationだけcurrent stateへ上書き | 時点を分け、current stateを保持する。 |
| `CASE-INT-063-04e` | 063/AC-INT-063-04 | 未承認BRAIN candidateだけ一般知識扱い | canonical知識化せずBRAINへ戻す。 |
| `CASE-INT-063-04f` | 063/AC-INT-063-04 | delayed outcome（正常）を元episodeへ遅着 | 元episode/source/timeを保ちcurrent judgmentは上書きしない。 |
| `CASE-INT-063-04g` | 063/AC-INT-063-04 | out-of-order outcome（正常）を元episodeへ到着 | 到着順でcurrent episodeを巻き戻さず履歴へ結ぶ。 |
| `CASE-INT-063-04h` | 063/AC-INT-063-04 | duplicate outcomeだけ別episodeへ適用 | 二重計上せず元episodeを保持する。 |
| `CASE-INT-069-06a` | 069/AC-INT-069-06 | HARNESS-010 pack identityだけ欠落 | input contractを成立扱いせずHARNESS ownerへ戻す。 |
| `CASE-INT-069-06b` | 069/AC-INT-069-06 | HARNESS-010 contract revisionだけstale | calculationを保留しHARNESSへ戻す。 |
| `CASE-INT-069-06c` | 069/AC-INT-069-06 | HARNESS-010 scopeだけ不一致 | 別scope契約を流用せずHARNESSへ戻す。 |
| `CASE-INT-069-06d` | 069/AC-INT-069-06 | HARNESS-010 provenanceだけ欠落 | 出所不明をunknownにしHARNESSへ戻す。 |
| `CASE-INT-069-06e` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall identityだけ欠落 | callを成立扱いせずHARNESS pack contract ownerへ戻す。HARNESSが計算実行主体になるとは扱わない。 |
| `CASE-INT-069-06f` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall contract revisionだけstale | 該当callを保留しHARNESS pack contract ownerへ戻す。 |
| `CASE-INT-069-06g` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall scopeだけ不一致 | 別scope contractを混ぜずHARNESS pack contract ownerへ戻す。 |
| `CASE-INT-069-06h` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall provenanceだけ欠落 | 出所を推測せずHARNESS pack contract ownerへ戻す。 |
| `CASE-INT-069-06i` | 069/AC-INT-069-06 | 選択model/source identityだけ不一致 | model resultを結ばずsource ownerへ戻す。 |
| `CASE-INT-069-06j` | 069/AC-INT-069-06 | L2-033 input receiptだけ欠落 | 単体計算のCORE入力を作らずsource ownerへ戻す。 |
| `CASE-INT-069-06k` | 069/AC-INT-069-06 | L2-003 current state sourceだけ欠落 | source-owned stateを補完せず当該source ownerへ戻す。 |
| `CASE-INT-069-06l` | 069/AC-INT-069-06 | L2-004 fact/inference区分だけ欠落 | 区分不明を保持し、該当source ownerを特定できる場合だけそこへ照合する。特定できなければ戻し先unknown。 |
| `CASE-INT-069-06m` | 069/AC-INT-069-06 | L2-012 unknown/source attributionだけ欠落 | 不確実性を確定値にせずunknownに保つ。source identityからownerを特定できる場合だけそのsource ownerへ照合し、特定できなければ戻し先unknown。 |
| `CASE-INT-069-06n` | 069/AC-INT-069-06 | L2-013 trace/source revisionだけ欠落 | traceを結ばず該当source ownerへ戻す。 |
| `CASE-INT-069-06o` | 069/AC-INT-069-06 | 適用data-use/authority条件だけ欠落 | 利用可能と推測せず、適用される既存SECURITY/source ownerが特定できる場合だけ戻す。 |
| `CASE-INT-069-06p` | 069/AC-INT-069-06 | stop conditionだけ欠落 | 完了を作らずsource/選択source ownerが明示される場合だけそこへ照合する。 |
| `CASE-INT-069-06q` | 069/AC-INT-069-06 | unselected model/sourceへのfallbackだけ追加 | 未選択sourceを未観測に保ちfallbackを拒否する。 |
| `CASE-INT-069-06r` | 069/AC-INT-069-06 | HARNESS-L2-011 pack contract identityだけ欠落（call未選択） | 常時必須contract照合を成立扱いせずHARNESS pack ownerへ戻す。 |
| `CASE-INT-069-06s` | 069/AC-INT-069-06 | HARNESS-L2-011 pack contract revisionだけstale（call未選択） | stale contractを使わずHARNESS pack ownerへ戻す。 |
| `CASE-INT-069-06t` | 069/AC-INT-069-06 | HARNESS-L2-011 contract scopeだけ不一致（call未選択） | contract照合を不成立としHARNESS pack ownerへ戻す。 |
| `CASE-INT-069-06u` | 069/AC-INT-069-06 | HARNESS-L2-011 contract provenanceだけ欠落（call未選択） | 出所を推測せずHARNESS pack ownerへ戻す。 |
| `CASE-INT-069-07a` | 069/AC-INT-069-07 | 通常計算で期待値oracleもHARNESS-L2-011 callも選択されない（正常） | HARNESS-L2-010/011の常時必須pack contractを照合し、入力source/ruleと明示model/ruleから結果・trace・unknownを算出する。call固有inputは未選択で、oracleやcall inputの不存在だけを理由に保留しない。 |
| `CASE-INT-069-07b` | 069/AC-INT-069-07 | 通常計算で070/040/LABO-024後段receiptなし（正常） | 計算結果を返し、後段connection未完を別保持する。 |
| `CASE-INT-069-07c` | 069/AC-INT-069-07 | 利用者指定verificationの期待値oracleだけ欠落 | そのverificationだけ保留しscenario author/選択source ownerへ戻す。 |
| `CASE-INT-069-07d` | 069/AC-INT-069-07 | stop/cutoff位置だけ欠落 | 成功完了にせず打切り位置unknownを保持する。 |
| `CASE-INT-069-07e` | 069/AC-INT-069-07 | 計算resourceだけ不足 | 途中resultと停止位置を保持し、OS運転成功に変換しない。 |
| `CASE-INT-069-07f` | 069/AC-INT-069-07 | 選択source/permissionだけ期限切れ | 該当operationだけ保留し、選択sourceまたは固定SECURITY permission ownerへ戻す。 |
| `CASE-INT-070-07a` | 070/AC-INT-070-07 | HELIXINTELLIGENCE-L2-040送達契約だけ欠落 | send未成立を保持し、既存L2-040の責務ownerへ戻す。 |
| `CASE-INT-070-07b` | 070/AC-INT-070-07 | HELIXINTELLIGENCE-L2-040送達契約revisionだけ不一致 | send receiptを結ばず、既存L2-040の責務ownerへ戻す。 |
| `CASE-INT-070-07c` | 070/AC-INT-070-07 | correlationだけ別 | 別operationのreceiptを混ぜない。 |
| `CASE-INT-070-07d` | 070/AC-INT-070-07 | target scopeだけ別 | 対象scopeのsend未完として保持する。 |
| `CASE-INT-070-07e` | 070/AC-INT-070-07 | LABO-024 consumer contractだけ欠落 | consumer受領を成立させずLABOへ戻す。 |
| `CASE-INT-070-07f` | 070/AC-INT-070-07 | LABO-024 contract revisionだけ不一致 | 別版consumer契約を流用せずLABOへ戻す。 |
| `CASE-INT-070-07g` | 070/AC-INT-070-07 | input source identityだけ不一致 | stage bindingを失敗にし該当source ownerへ戻す。 |
| `CASE-INT-070-07h` | 070/AC-INT-070-07 | model identityだけ不一致 | resultを結ばずCORE model authorityであるProduct Core/HARNESSへ照合する。 |
| `CASE-INT-070-07i` | 070/AC-INT-070-07 | data-use bindingだけ欠落 | 計算/送達への利用を成立扱いせず該当SECURITY/source ownerへ戻す。 |
| `CASE-INT-070-07j` | 070/AC-INT-070-07 | 選択connector登録だけ欠落 | 通信段階を未完に保ちCONNECTへ戻す。source identity不一致は07g/07hで照合する。 |
| `CASE-INT-070-07k` | 070/AC-INT-070-07 | 選択connector互換判定だけstale | 通信段階を未完に保ちCONNECTへ戻す。 |
| `CASE-INT-070-07l` | 070/AC-INT-070-07 | 選択connector transport receiptだけ欠落 | 送達未成立を保持しCONNECTへ戻す。 |
| `CASE-INT-070-08a` | 070/AC-INT-070-08 | simulation statusだけactualへ変更 | virtual結果を実測へ昇格しない。 |
| `CASE-INT-070-08b` | 070/AC-INT-070-08 | predictionとactual source identityだけ同一化 | 二つのsource/時点を分離する。 |
| `CASE-INT-070-08c` | 070/AC-INT-070-08 | later observation windowだけ不一致 | 比較不能としてLABOへ戻す。 |
| `CASE-INT-070-08d` | 070/AC-INT-070-08 | 未決閾値だけpass/failへ変異 | 測定値のみ保持し閾値判断を作らない。 |
| `CASE-INT-070-08e` | 070/AC-INT-070-08 | 未選択consumer fieldだけ一般互換と解釈 | 外挿せずunknownを保持する。 |
| `CASE-INT-071-04a` | 071/AC-INT-071-04 | 固定baseline/load正常scenario | 5/5・5/10 arrival、cap 8の計算と6出力facetを独立照合する。 |
| `CASE-INT-071-04b` | 071/AC-INT-071-04 | 固定DB断正常scenario | 明示order edgeだけblocked、recovery未定義を保持する。 |
| `CASE-INT-071-04c` | 071/AC-INT-071-04 | 固定virtual worker 2→4正常scenario | 3→2.25 min、1.50→2.025 creditsを算術照合しOS assignmentを不変にする。 |
| `CASE-INT-071-04d` | 071/AC-INT-071-04 | comparison coefficientだけ不一致 | 該当scenarioだけを未比較にする。 |
| `CASE-INT-071-04e` | 071/AC-INT-071-04 | observation windowだけ不一致 | 該当scenarioだけを未比較にする。 |
| `CASE-INT-071-04f` | 071/AC-INT-071-04 | modelにretry ruleだけ存在しない | retry成功を補わずunknown/blockedを保持し、ownerを推測しない。 |
| `CASE-INT-071-04g` | 071/AC-INT-071-04 | modelにrecovery ruleだけ存在しない | recoveryを創作せずunknown/blockedを保持し、ownerを推測しない。 |
| `CASE-INT-071-04h` | 071/AC-INT-071-04 | edge外failureだけ伝播 | edge外stateを不変にしunsupported/blockedを保持、ownerを推測しない。 |
| `CASE-INT-071-04i` | 071/AC-INT-071-04 | simulationだけactualへ昇格 | 実測へ昇格しない。 |
| `CASE-INT-071-04j` | 071/AC-INT-071-04 | simulationだけLABO評価済みへ昇格 | 評価済みへ昇格せずLABOへ戻す。 |
| `CASE-INT-074-05a` | 074/AC-INT-074-05 | source completenessだけ欠落 | 評価済み適用をclaimせずLABOへ戻す。 |
| `CASE-INT-074-05b` | 074/AC-INT-074-05 | observation windowだけ欠落 | windowを推測せずLABOへ戻す。 |
| `CASE-INT-074-05c` | 074/AC-INT-074-05 | applicability statusだけunknown | statusをunknownに保ち、owner/戻し先を推測しない。 |
| `CASE-INT-074-05d` | 074/AC-INT-074-05 | task attributeだけ欠落 | task/ticket条件をOSへ戻す。 |
| `CASE-INT-074-05e` | 074/AC-INT-074-05 | scopeだけ不足 | 適用scopeをunknownに保ち、LABOへ戻す。 |
| `CASE-INT-074-05f` | 074/AC-INT-074-05 | evaluation stateだけ未評価 | eligible evidenceにしない。 |
| `CASE-INT-074-05g` | 074/AC-INT-074-05 | comparisonだけ不能 | 比較不能をunknownのままLABOへ戻す。 |
| `CASE-INT-074-05h` | 074/AC-INT-074-05 | comparison sourceだけ欠落 | sourceを補完せずLABOへ戻す。 |
| `CASE-INT-074-05i` | 074/AC-INT-074-05 | comparison revisionだけstale | current evidenceへ流用しない。 |
| `CASE-INT-074-05j` | 074/AC-INT-074-05 | comparison scopeだけ別 | CASE-INT-074-05yと同一scope mismatchの旧index。独立計上しない。 |
| `CASE-INT-074-05k` | 074/AC-INT-074-05 | feedback target revisionだけ別 | current evidenceへ流用しない。 |
| `CASE-INT-074-05l` | 074/AC-INT-074-05 | task classだけ異なる | 別taskへの転用を拒否する。 |
| `CASE-INT-074-05m` | 074/AC-INT-074-05 | 単一feedbackから恒久除外 | 永続状態を作らない。 |
| `CASE-INT-074-05n` | 074/AC-INT-074-05 | 単一feedbackから恒久昇格 | 永続状態を作らない。 |
| `CASE-INT-074-05o` | 074/AC-INT-074-05 | feedbackだけから因果能力差を確定 | 因果結論を作らない。 |
| `CASE-INT-074-05p` | 074/AC-INT-074-05 | feedbackだけから恒久順位を更新 | rankを更新しない。 |
| `CASE-INT-074-05q` | 074/AC-INT-074-05 | feedbackからmodelを直接更新 | writeを拒否する。 |
| `CASE-INT-074-05r` | 074/AC-INT-074-05 | feedbackからRequirementを直接更新 | writeを拒否する。 |
| `CASE-INT-074-05s` | 074/AC-INT-074-05 | INTELLIGENCEからticketを直接発行 | 発行を拒否しOSへ戻す。 |
| `CASE-INT-074-05t` | 074/AC-INT-074-05 | INTELLIGENCEからreissueを直接発行 | 発行を拒否しOSへ戻す。 |
| `CASE-INT-074-05u` | 074/AC-INT-074-05 | INTELLIGENCEからassignmentを直接変更 | 変更を拒否しOSへ戻す。 |
| `CASE-INT-074-05v` | 074/AC-INT-074-05 | INTELLIGENCEからdispatchを実行 | 実行を拒否しOSへ戻す。 |
| `CASE-INT-074-05w` | 074/AC-INT-074-05 | 正常feedbackのtrace（正常fixture） | return reason、missing input/oracle、再発行後verification状態、母集団/window、再評価条件を同一評価receiptへ結ぶ。 |
| `CASE-INT-074-05x` | 074/AC-INT-074-05 | 同じ理由class・宣言済み同scopeの未見正常例 | 根拠の引用と再評価条件を保ち、成功や適格性は自動生成しない。 |
| `CASE-INT-074-05y` | 074/AC-INT-074-05 | 同じ理由classだが異なるscope | feedbackを転用せず適用外/unknownを保持しLABOへ戻す。05jと重複計上しない。 |
| `CASE-INT-074-05z` | 074/AC-INT-074-05 | evidenceだけ不足（scopeは一致） | scope一致を保ちつつevidence不足だけで評価適用を成立させず、LABOへ戻す。 |
| `CASE-INT-077-05a` | 077/AC-INT-077-05 | unknownを0へ変異 | unknownを保持する。 |
| `CASE-INT-077-05b` | 077/AC-INT-077-05 | unknownをneutralへ変異 | unknownを保持する。 |
| `CASE-INT-077-05c` | 077/AC-INT-077-05 | unknownをunchangedへ変異 | unknownを保持する。 |
| `CASE-INT-077-05d` | 077/AC-INT-077-05 | unknownをobservedへ変異 | unknownを保持する。 |
| `CASE-INT-077-05e` | 077/AC-INT-077-05 | Requirementへ直接write | writeを拒否し既存正本を不変にする。 |
| `CASE-INT-077-05f` | 077/AC-INT-077-05 | Designへ直接write | writeを拒否する。 |
| `CASE-INT-077-05g` | 077/AC-INT-077-05 | Releaseへ直接write | writeを拒否する。 |
| `CASE-INT-077-05h` | 077/AC-INT-077-05 | Assignmentへ直接write | writeを拒否する。 |
| `CASE-INT-077-05i` | 077/AC-INT-077-05 | merge authority/stateを直接変更 | authority/stateを変更しない。 |
| `CASE-INT-077-05j` | 077/AC-INT-077-05 | selected receipt identityだけ欠落 | 別sourceで補完せず選択source ownerへ戻す。 |
| `CASE-INT-077-05k` | 077/AC-INT-077-05 | selected receipt identityだけ不一致 | receiptを結ばず選択source ownerへ戻す。 |
| `CASE-INT-077-05l` | 077/AC-INT-077-05 | selected receipt revisionだけ欠落 | 別revisionで補完せず選択source ownerへ戻す。 |
| `CASE-INT-077-05m` | 077/AC-INT-077-05 | 選択receiptのrevisionが要求対象revisionと不一致、他bindingは一致 | receiptをcurrent candidateへ流用せずstale/unknownにし、選択source ownerへ戻す。 |
| `CASE-INT-077-05n` | 077/AC-INT-077-05 | origin typeだけ欠落 | internal/externalを推測せずunknownを保つ。fixtureで選択source identityが明示される場合だけ、そのsource ownerへ照合する。 |
| `CASE-INT-077-05o` | 077/AC-INT-077-05 | origin typeだけ不一致 | originを統合せずsource ownerへ戻す。 |
| `CASE-INT-077-05p` | 077/AC-INT-077-05 | source owner identityだけ欠落 | ownerを推測せずunknownを保つ。selected source identityが既知でもownerが明示されない場合は戻し先unknown。 |
| `CASE-INT-077-05q` | 077/AC-INT-077-05 | source owner identityだけ不一致 | owner不一致をunknownに保ち、選択source ownerへ照合する。 |
| `CASE-INT-077-05r` | 077/AC-INT-077-05 | qualification evidenceだけ欠落 | qualified扱いせずselected source ownerへ戻す。 |
| `CASE-INT-077-05s` | 077/AC-INT-077-05 | qualification evidenceだけ不一致 | qualificationを継承せずselected source ownerへ戻す。 |
| `CASE-INT-077-05t` | 077/AC-INT-077-05 | selected receiptだけstale | candidateをincompleteに保ち、選択source ownerへ照合する。 |
| `CASE-INT-077-05u` | 077/AC-INT-077-05 | selected receiptだけread failure | candidateをincompleteに保ち、選択source ownerへ照合する。 |
| `CASE-INT-077-05v` | 077/AC-INT-077-05 | unselected receiptへfallback | unselectedを未観測のまま保つ。 |
| `CASE-INT-077-05w` | 077/AC-INT-077-05 | reference-only資料をselected sourceへ昇格 | 参照資料を資格根拠へしない。 |
| `CASE-INT-077-05x` | 077/AC-INT-077-05 | internal sourceをexternal/TERへ付替 | source identity/originを維持しHELIX defectを推定しない。 |
| `CASE-INT-077-05y` | 077/AC-INT-077-05 | external sourceをinternal/UILだけへ付替 | source identity/originを維持し必要ならunknownで戻す。 |
| `CASE-INT-077-05z` | 077/AC-INT-077-05 | external release observationだけからHELIX defectを確定 | defectを確定せずfinding/candidateを未確定で保持する。 |

この補完表は候補fixture設計である。execution、実環境qualification、成功率、実測済み性能、またはL3承認を示さない。

## Stage 5 review01 correction fixtures（追加独立fixture）

以下の行は固定L2/L11の列挙条件に対する追加fixtureである。各行は有効な基準fixtureから記載した一つの入力だけを変える。既存IDの索引行・複合fixtureは独立fixture数に数えず、旧fixtureは消去せず該当facetのindexとして保持する。

| CASE | 親/AC | 単独変異 | 期待oracle・戻し先 |
|---|---|---|---|
| `CASE-INT-060-06a` | 060/AC-060-06 | approved requirement revisionだけ欠落 | planを実行可能にせず、該当requirement sourceへ戻す。 |
| `CASE-INT-060-06b` | 060/AC-060-06 | approved requirement revisionだけunknown | requirement状態をunknownのまま保持し、他入力で埋めず該当sourceへ戻す。 |
| `CASE-INT-060-06c` | 060/AC-060-06 | approved requirement revisionだけstale | 当該requirementを使うnodeだけ保留しrequirement sourceへ戻す。 |
| `CASE-INT-060-06d` | 060/AC-060-06 | HARNESS process contractだけunknown | 適用contractを推測せずHARNESSへ戻す。 |
| `CASE-INT-060-06e` | 060/AC-060-06 | HARNESS process contractだけstale | stale contract依存nodeだけ未完にしHARNESSへ戻す。 |
| `CASE-INT-060-06f` | 060/AC-060-06 | HARNESS process contractだけ欠落 | 対応nodeを保留しHARNESSへ戻す。 |
| `CASE-INT-060-06g` | 060/AC-060-06 | OS current stateだけunknown | current state依存nodeをunknownに保ちOS state ownerへ戻す。 |
| `CASE-INT-060-06h` | 060/AC-060-06 | OS current stateだけstale | 古いstateで現在計画を確定せずOS state ownerへ戻す。 |
| `CASE-INT-060-06i` | 060/AC-060-06 | OS current stateだけ欠落 | affected planだけ保留しOS state ownerへ戻す。 |
| `CASE-INT-060-06j` | 060/AC-060-06 | selected BRAIN knowledgeだけstale | applicabilityを流用せずBRAIN source ownerへ戻す。 |
| `CASE-INT-060-06k` | 060/AC-060-06 | selected BRAIN knowledgeだけunknown | knowledge applicabilityをunknownのまま保持しBRAINへ戻す。 |
| `CASE-INT-060-06l` | 060/AC-060-06 | selected BRAIN knowledgeだけ欠落 | selected knowledgeを使うnodeだけ未完にしBRAINへ戻す。 |
| `CASE-INT-061-06a` | 061/AC-061-06 | task identityだけ欠落 | task別proposalを確定せずscopeを推測しない。固定L2にこの不足の個別返却先指定はないため戻し先unknown。 |
| `CASE-INT-061-06b` | 061/AC-061-06 | Worker実績sourceだけ欠落 | 実績を未評価としLABOへ戻す。 |
| `CASE-INT-061-06c` | 061/AC-061-06 | Worker実績revisionだけstale | stale実績をcurrent proposalへ流用せずLABOへ戻す。 |
| `CASE-INT-062-05a` | 062/AC-062-05 | repair candidateだけ欠落 | repairを未完とし、固定L2がこの入力欠落のownerを指定しないため戻し先unknown。 |
| `CASE-INT-062-05b` | 062/AC-062-05 | 有効な正常repair結果だけを既知regressionで置換 | regressionを成功扱いしない。検証はHARNESS、検収はOSの固定責務に従い、原因ownerはsourceで特定できる範囲だけ返す。 |
| `CASE-INT-062-05c` | 062/AC-062-05 | HARNESS write-set外の一変更だけを結果へ加える | 対象を不合格にしHARNESS verificationへ戻す。 |
| `CASE-INT-062-05d` | 062/AC-062-05 | HARNESS verification obligationだけ変更 | acceptanceに昇格させずHARNESSへ戻す。 |
| `CASE-INT-062-05e` | 062/AC-062-05 | 既存HARNESS obligationの一つだけstale | 当該検証を未成立としHARNESSへ戻す。 |
| `CASE-INT-063-05a` | 063/AC-063-05 | current INT judgmentだけ欠落 | historical LABO/BRAIN inputsから判断を生成せず、判断材料を未完とする。固定L2の個別return指定外なら戻し先unknown。 |
| `CASE-INT-063-05b` | 063/AC-063-05 | current INT judgmentだけstale | stale判断をcurrent扱いしない。INTELLIGENCE判断を未確定で保持する。 |
| `CASE-INT-063-05c` | 063/AC-063-05 | HARNESS process contractだけ欠落 | 工程contractを推測せずHARNESSへ戻す。 |
| `CASE-INT-063-05d` | 063/AC-063-05 | HARNESS process contractだけstale | stale contractを使った循環を未完としHARNESSへ戻す。 |
| `CASE-INT-069-08a` | 069/AC-069-08 | model revisionだけstale | 計算をcurrent結果として結ばずmodel/source ownerへ戻す。 |
| `CASE-INT-069-08b` | 069/AC-069-08 | model schema versionだけ欠落 | schema適用をunknownにする。CORE model schema authorityであるProduct Core/HARNESSへ照合する。 |
| `CASE-INT-069-08c` | 069/AC-069-08 | finite state setだけ欠落 | stateを補わず未対応/unknownとし、選択source ownerが明示される場合だけ照合する。 |
| `CASE-INT-069-08d` | 069/AC-069-08 | initial stateだけ欠落 | 遷移計算を開始せずunknownを保持し、選択source ownerが明示される場合だけ照合する。 |
| `CASE-INT-069-08e` | 069/AC-069-08 | baseline条件だけ欠落 | 比較結果を作らずscenario author/sourceへ戻す。 |
| `CASE-INT-069-08f` | 069/AC-069-08 | scenario条件だけ欠落 | baselineのみから比較を作らずscenario author/sourceへ戻す。 |
| `CASE-INT-069-08g` | 069/AC-069-08 | input event seriesだけ欠落 | eventを捏造せず計算を未完にする。 |
| `CASE-INT-069-08h` | 069/AC-069-08 | load seriesだけ欠落 | 負荷結果をunknownとし選択source ownerへ戻す。 |
| `CASE-INT-069-08i` | 069/AC-069-08 | capacityだけ欠落 | throughput/timeを計算せず選択source ownerへ戻す。 |
| `CASE-INT-069-08j` | 069/AC-069-08 | service rateだけunknown | 率を補わず時間/throughputをunknownとする。 |
| `CASE-INT-069-08k` | 069/AC-069-08 | currencyだけ欠落 | costを比較せずprice source ownerへ戻す。 |
| `CASE-INT-069-08l` | 069/AC-069-08 | price effective timestampだけstale | stale priceをcurrent costに流用しprice source ownerへ戻す。 |
| `CASE-INT-069-08m` | 069/AC-069-08 | source owner identityだけ欠落 | source authorityを推測せず該当model/sourceをunknownとする。 |
| `CASE-INT-069-08n` | 069/AC-069-08 | stop/cutoff conditionだけ欠落 | 計算完了位置を捏造せず途中結果を未確定とする。 |
| `CASE-INT-069-08o` | 069/AC-069-08 | selected model digestだけ不一致（revisionは一致） | digest不一致modelを使わずunknown/未完とし、固定L2が指定する選択source ownerへ照合する。特定できなければ戻し先unknown。 |
| `CASE-INT-070-09a` | 070/AC-070-09 | 033 input receiptだけ欠落 | 後段計算/送達receiptを前提にせずinput段階だけ未成立とする。 |
| `CASE-INT-070-09b` | 070/AC-070-09 | 033 input receipt revisionだけstale | current inputと結ばずsource ownerへ戻す。 |
| `CASE-INT-070-09c` | 070/AC-070-09 | 069 result receiptだけ欠落 | input成立は保持し、result/send/consumerを未成立とする。 |
| `CASE-INT-070-09d` | 070/AC-070-09 | scenario identityだけ不一致 | resultをinput scenarioへ束ねない。 |
| `CASE-INT-070-09e` | 070/AC-070-09 | product identityだけ不一致 | 別product receiptを混ぜずsource ownerへ戻す。 |
| `CASE-INT-070-09f` | 070/AC-070-09 | known regressionの誤予測だけ成功扱い | comparisonを不合格とし後の実測/evaluationをLABO ownerへ残す。 |
| `CASE-INT-070-09g` | 070/AC-070-09 | source design authorityだけをINTELLIGENCEへ移す | authorityを移さず既存design source ownerを保持する。 |
| `CASE-INT-071-05a` | 071/AC-071-05 | expected-result verification operationだけoracle欠落 | そのverificationだけ保留。通常scenario計算は引き続き明示ruleから結果/trace/unknownを返す。 |
| `CASE-INT-071-05b` | 071/AC-071-05 | 通常scenarioにoracleがないことだけを失敗扱い | 固定L2/L11に反してoracle必須化しない。明示rule計算を受け入れる。 |
| `CASE-INT-071-05c` | 071/AC-071-05 | 数値threshold decisionだけ未決 | 実測/計算値のみ記録し合否/適格化を付けない。 |
| `CASE-INT-071-05d` | 071/AC-071-05 | 入力前に後段receiptを要求 | 順序を不成立とし、該当stageのreceiptはそのstage後に照合する。 |
| `CASE-INT-071-05e` | 071/AC-071-05 | modelにないrollbackだけ生成 | rollbackを補完せず当該scenarioをunknown/blockedに保つ。 |
| `CASE-INT-071-05f` | 071/AC-071-05 | modelにないretryだけ生成 | retry成功を作らず明示failure edgeの状態を保つ。 |
| `CASE-INT-071-05g` | 071/AC-071-05 | worker数から線形speedupだけ仮定 | shared ceiling/service ruleを維持し比例改善を主張しない。 |
| `CASE-INT-071-05h` | 071/AC-071-05 | recovery ruleだけ未定義 | recoveryを生成せず当該failure scenarioをblocked/unknownにする。 |
| `CASE-INT-071-05i` | 071/AC-071-05 | 033 input receiptだけ欠落 | calculationを開始せずinput stageを未完とする。 |
| `CASE-INT-071-05j` | 071/AC-071-05 | 033 input receiptだけstale | stale inputをcurrent comparisonへ結ばない。 |
| `CASE-INT-071-05k` | 071/AC-071-05 | selected connector contractだけ欠落 | connection inputを成立扱いせずCONNECT/source contract ownerへ戻す。 |
| `CASE-INT-071-05l` | 071/AC-071-05 | same-unit load seriesだけ欠落 | 欠落seriesを補わず該当sourceをunknownとする。 |
| `CASE-INT-071-05m` | 071/AC-071-05 | stop conditionだけ欠落 | 無制限完了を主張せず停止条件unknownを保持する。 |
| `CASE-INT-071-05n` | 071/AC-071-05 | known unsupported stateだけsuccessへ置換 | unsupported/unknownをsuccessにしない。 |
| `CASE-INT-071-05o` | 071/AC-071-05 | 常時必須HARNESS-L2-010 pack contract identityだけ欠落 | contract成立とせずHARNESS pack contract ownerへ戻す。 |
| `CASE-INT-071-05p` | 071/AC-071-05 | 常時必須HARNESS-L2-011 pack contract revisionだけstale | stale contractを使わずHARNESS pack contract ownerへ戻す。call固有inputはこのfixtureで変えない。 |
| `CASE-INT-071-05q` | 071/AC-071-05 | 宣言済みoperationに適用するHARNESS-L2-023 dependency classだけ欠落 | dependency適用を成立扱いせずHARNESS pack contract ownerへ照合し、他の契約/operation状態を保持する。 |
| `CASE-INT-071-05r` | 071/AC-071-05 | L1-013 provenanceだけ欠落 | provenanceを補わず当該sourceをunknownにし、固定L2が指定する該当source ownerへ照合する。 |
| `CASE-INT-074-06a` | 074/AC-074-06 | reason classだけ欠落 | feedback分類を推測せずLABO評価を未確定とする。 |
| `CASE-INT-074-06b` | 074/AC-074-06 | missing input listだけ欠落 | missing inputを補わずLABOへ戻す。 |
| `CASE-INT-074-06c` | 074/AC-074-06 | oracle identityだけ欠落 | 再評価成立を推測せずLABOへ戻す。 |
| `CASE-INT-074-06d` | 074/AC-074-06 | reissue verification stateだけstale | 古い成立状態を流用せずLABOへ戻す。 |
| `CASE-INT-074-06e` | 074/AC-074-06 | domain/task classだけ不一致 | 別taskへの転用を拒否しLABOへ戻す。 |
| `CASE-INT-074-06f` | 074/AC-074-06 | observation populationだけ欠落 | 母集団を捏造せず評価適用をunknownにする。 |
| `CASE-INT-074-06g` | 074/AC-074-06 | observation windowだけstale | 古いwindowからcurrentを推定せずLABOへ戻す。 |
| `CASE-INT-074-06h` | 074/AC-074-06 | LABO evaluation stateだけunknown | 評価済みと推測せずLABO評価をunknownに保ちLABOへ戻す。 |
| `CASE-INT-077-06a` | 077/AC-077-06 | constant dependency identityだけ欠落 | closureを成立扱いせず、HARNESS-L2-023分類契約とsource identityを照合する。 |
| `CASE-INT-077-06b` | 077/AC-077-06 | dependency contract revisionだけstale | stale dependencyを現在適用せず契約ownerへ照合する。 |
| `CASE-INT-077-06c` | 077/AC-077-06 | selected-source conditionだけ欠落 | source qualificationを推測せずselected source状態をunknownにする。 |
| `CASE-INT-077-06d` | 077/AC-077-06 | 特定operation条件だけ常時必須へ混同 | 適用外operationへ追加義務を持ち込まず親のoperation別条件を保つ。 |
| `CASE-INT-077-06e` | 077/AC-077-06 | reference-only資料だけselected sourceとして扱う | 資料をauthority/qualificationへ昇格しない。 |
| `CASE-INT-077-06f` | 077/AC-077-06 | 未選択sourceのreceiptだけunknown | 未選択sourceは未観測であり、successful/failedいずれも推測しない。 |

同一項目のmissing/unknown/staleは別fixtureである。予測状態をactualへ置換するCASE-063-02dは固定親trace外としてこのStageの個別negative母集団に含めない。HARNESS-L2-011は069の常時依存条件の一部であり、call未選択を理由に契約照合を省略するnormal fixtureを作らない。
