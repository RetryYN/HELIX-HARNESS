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

## Stage 3 — 採択親の機能検証case

状態: 静的fixture設計。実行、実測、L3承認を表さない。全caseは指定FR/ACに対応し、正常、列挙条件ごとの反例、未見正常・局所unknownを分離する。

| case ID | L3 FR | L3 AC | 入力fixture / mutation | 期待する観測結果 | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-001-01` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-01` | 二つの新規domainを入力し、片方をsplit、子domainをmerge、旧domainをretireする候補操作列。 | 各操作の前後identityとadd/split/merge/retire relationを別々に出し、固定enumを要求しない。 | 同一identityを別domainへ割当て、split relationを欠落させた各例と併発例。 |
| `CASE-INTELLIGENCE-L10-001-02` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | 同一identityを別domainへ割当て、split relationを欠落させた各例と併発例。 | 衝突/欠落したrelationだけ未確定にして正しいdomain編成候補は保つ。retired identityの再利用を一律拒否しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-001-03` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-03` | 未見domain種別で有効なidentityと編成relationが揃う操作列。 | 同一lifecycle contractでrelationを追跡し、どのrelationが不足した場合だけそのedgeをunknownにする。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-002-01` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-01` | Domain AにUnderstand/Review、Domain BにPlanだけを宣言し、Domain Cの能力は未決にする入力。 | A/Bの宣言済み集合だけをdomain別に返し、Cは未構成のまま保持する。 | AのReview根拠欠落、BへAの能力を流用、Cを全能力trueとした各例および併発例。 |
| `CASE-INTELLIGENCE-L10-002-02` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-02` | AのReview根拠欠落、BへAの能力を流用、Cを全能力trueとした各例および併発例。 | 各domainのunsupported capabilityを未構成に戻し、他domainのvalid configurationは保つ。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-002-03` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-03` | 未見Domain Dに根拠付きsubset capabilityを入力する例と、同じ例の一能力根拠欠落版。 | subsetは同じ契約で返し、根拠がない能力だけ未構成/unknownとする。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-003-01` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-01` | target、L2/L3 revision、ticket/state、dependency/evidence/finding、worker/model/provider/environment、cost/budget/risk/timeを各source identity/revision付きで入力する。 | Situation Model各fieldをsource/revisionへ結び、source truthの値を保ったjoinを返す。 | dependency sourceをstaleにする例、risk値が矛盾する例、evidence sourceを欠く例とstale+欠落の併発例。 |
| `CASE-INTELLIGENCE-L10-003-02` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-02` | dependency sourceをstaleにする例、risk値が矛盾する例、evidence sourceを欠く例とstale+欠落の併発例。 | stale/矛盾/欠落したfieldだけunknownとし、他の一致sourceを保持する。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-003-03` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-03` | 未見provider/environmentを含むが全参照revisionが一致するjoinと、未取得dependency revisionの対照。 | 完全joinは同契約で返し、未取得dependency relationだけunknownにする。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-004-01` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-01` | 一つのsource-backed fact、そこから導いたinterpretation、検証前hypothesis、未取得fieldを同一判断に入力する。 | 4区分をそれぞれのsource/evidence/revisionへ結び、Observed Fact/Derived Interpretation/Hypothesis/Unknownを保持する。 | hypothesisをObserved Factとラベルした例、source revision欠落、unknownをsuccessとした例とhypothesis昇格+根拠欠落の併発。 |
| `CASE-INTELLIGENCE-L10-004-02` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-02` | hypothesisをObserved Factとラベルした例、source revision欠落、unknownをsuccessとした例とhypothesis昇格+根拠欠落の併発。 | 誤分類を確定せず分類根拠不足を示し、他の正しい区分は保持する。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-004-03` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-03` | 未見のevidence typeでもsourceと観測内容が明示された例、および同じ入力のsource locator欠落版。 | 観測可能部分を同じ4区分に分類し、source不明fieldだけUnknownにする。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-005-01` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-01` | 承認済みtarget/requirement revision、二つのprerequisite、依存順序、並列可能作業、期待結果、risk/uncertainty、stop/fallbackを含むplan input。 | 順序/並列関係、各成果、risk、stop/fallback付きcandidateを返し、ticket/assignmentは生成しない。 | 一つのdependency欠落、dependency cycle、stopまたはfallback欠落を個別に投入し、欠落+cycleも併発する。 |
| `CASE-INTELLIGENCE-L10-005-02` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | 一つのdependency欠落、dependency cycle、stopまたはfallback欠落を個別に投入し、欠落+cycleも併発する。 | 影響するplan部分を未確定としてrequirement/OS ownerへ戻し、有効な比較情報は維持、ticketなし。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-005-03` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-03` | 未見task classだがtarget/current contract/prerequisitesが宣言済みのplanと、dependency revision未解決の対照。 | 宣言済み条件でplan candidateを返し、未解決dependencyだけunknownとしてticketを作らない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-006-01` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-01` | 同一scopeのprediction対象、source evidence、明示assumption、反証可能な観測条件と予測を入力する。 | prediction/assumption/evidence/falsificationを別欄で返し、実測は未発生としてLABO actual resultと分ける。 | evidence欠落、falsification条件欠落、predictionをactual outcomeに複写する例と欠落併発例。 |
| `CASE-INTELLIGENCE-L10-006-02` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-02` | evidence欠落、falsification条件欠落、predictionをactual outcomeに複写する例と欠落併発例。 | 根拠不十分なpredictionだけ未評価にし、actual outcome/長期effectを生成しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-006-03` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-03` | 未見の予測対象でもsource/assumption/反証条件が揃う例と、反証sourceが欠ける対照。 | 成立部分は同じprediction contractで返し、欠けた反証根拠のみunknownとし実測扱いしない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-007-01` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-01` | 一つのactive incident episodeに紐づく複数log/evidenceと、異なる方向を示すcounterevidenceを入力する。 | episode内の観測・推論・反証を分け、証拠の範囲に応じprobable/unknown diagnosisとrepair候補の分離を返す。 | 単独相関のみ、episode外のevidence混入、counterevidence欠落を個別に、相関+episode混入も併発投入。 |
| `CASE-INTELLIGENCE-L10-007-02` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | 単独相関のみ、episode外のevidence混入、counterevidence欠落を個別に、相関+episode混入も併発投入。 | root causeを断定せず不足/矛盾を表示し、LABO長期historyやrepair実行を生成しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-007-03` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-03` | 未見episodeで同一scopeのsource evidenceが揃う正常例と、必要なcounterevidence source未取得の対照。 | 観測済み部分をdiagnosis候補として扱い、欠けたsource/反証だけprobable/unknownに留める。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-008-01` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-01` | target HEAD/requirement revision、review scope、evidence、再現手順、counterexampleを持つfinding fixture。 | finding severity候補・scope・根拠・再現・反例・routeを同一target revisionへ結ぶ。 | 別HEADでの再現結果、scope不一致、counterexample省略を個別に、別HEAD+scope不一致も併発投入。 |
| `CASE-INTELLIGENCE-L10-008-02` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 別HEADでの再現結果、scope不一致、counterexample省略を個別に、別HEAD+scope不一致も併発投入。 | 対象revisionのfindingを確定扱いせず、merge/requirement/release/acceptance状態を変更しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-008-03` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-03` | 未見finding種でもexact targetと再現根拠が揃う例、およびcounterexample source未解決の対照。 | 成立条件のfindingを同じreview contractで扱い、反例不足だけ未確定として保持する。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-009-01` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-01` | 全体audit target HEAD/authority revision、producer identity、evidence, reproduction, falsificationを含むfinding。 | findingと各入力sourceを追跡可能に結び、自由文からauthority/statusを変更しないcandidateを返す。 | authority revision不一致、producer欠落、falsification欠落を各単独とproducer+authority欠落の併発で投入。 |
| `CASE-INTELLIGENCE-L10-009-02` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | authority revision不一致、producer欠落、falsification欠落を各単独とproducer+authority欠落の併発で投入。 | 誤結合fieldを明示して該当ownerへ戻し、UIL/TER/AAFD qualificationを代行しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-009-03` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-03` | 未見responsibilityのauditだがtarget/authority/sourceが揃う例と、authority locatorのみ欠落した対照。 | trace可能なscopeはcandidateとして保ち、authority不明部分だけunknownにする。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-011-01` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-01` | 同一corpus/responsibility scopeに対するcurrent/candidate model-provider各版のfindings、false positives/misses、reproducibility、latency/cost結果。 | 比較条件と版を並べ各metricを別々に示し、同条件部分だけ比較可能、winner/自動切替なし。 | corpusだけ異なる例、責務scopeだけ異なる例、model version欠落例を別々に、scope差+版欠落併発も投入。 |
| `CASE-INTELLIGENCE-L10-011-02` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | corpusだけ異なる例、責務scopeだけ異なる例、model version欠落例を別々に、scope差+版欠落併発も投入。 | 不一致比較は不確実として該当比較だけ止め、合う他のmetricを残し自動winnerを出さない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-011-03` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-03` | 未見provider pairでcorpus/scope/run versionが揃う例と、cost observation未取得の対照。 | 揃った軸は同条件で比較し未取得costだけ未評価、モデル切替なし。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-012-01` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-01` | 同一状況にknown evidence、contradictory evidence、probable interpretation、missing fieldを一緒に入力する。 | 各known/probable/uncertain/unknown/contradictory状態と次に要るevidence/decisionを個別に返す。 | unknownをsafeへ変換、contradictory sourceを削除、不足をsuccess扱いする各例とunknown+conflict併発例。 |
| `CASE-INTELLIGENCE-L10-012-02` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-02` | unknownをsafeへ変換、contradictory sourceを削除、不足をsuccess扱いする各例とunknown+conflict併発例。 | 対応する状態を誤って確定しないで不足/対立fieldと必要な証拠を示す。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-012-03` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-03` | 未見状況で一部根拠は検証可能、別fieldの追加証拠は未取得の例。 | known部分は保持し、証拠不足fieldのみunknownとしsafe/successへ写さない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-013-01` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-01` | 重要判断fixtureへ入力revision、rule/knowledge source、observation/assumption、model/provider/version、reasoning、uncertainty、rejected alternative、data-use classを入力する。 | 各判断edgeをsource revisionへ辿れるtraceとして返し、data-use classを記録するがtraining permissionを生成しない。 | rule revision欠落、rejected alternative省略、data-use classからtraining許可を推論する各例と欠落併発例。 |
| `CASE-INTELLIGENCE-L10-013-02` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | rule revision欠落、rejected alternative省略、data-use classからtraining許可を推論する各例と欠落併発例。 | 欠落traceをunknownで示し、training/learning stateを変更しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-013-03` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-03` | 未見判断種でも全source edgeが揃う例と、一つのBRAIN knowledge revisionが未取得の対照。 | 揃うedgeを同じtrace contractで返し未取得edgeだけunknown、full regenerationを要求しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-014-01` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-01` | 一つのBot候補に別identity、purpose、bounded scope、input/output、allowed action、stop condition、versionと各source/revisionを入力する。OS assignmentは未発行。 | 出力manifestの7要素とidentity/source locatorが入力に一対一対応し、candidateのまま返る。OS assignment/実作業状態は生成されない。 | manifest fieldが欠けているのに完成扱い、INTELLIGENCE identityとの混同、OS assignment自動生成は不合格。 |
| `CASE-INTELLIGENCE-L10-014-02` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同じmanifestからpurpose/scope/input/output/allowed-action/stop/versionをそれぞれ一つずつ削るfixture、各fieldの異版/範囲ずれfixture、scope+stop欠落の併発fixtureを投入する。 | 不成立fieldと影響するmanifest範囲を個別表示し、限定不能なら通常の判断candidateへ戻す。OS assignment/実行は発生しない。 | 不足fieldを補完、無関係fieldで相殺、candidateをBot authorityとして扱ったら不合格。 |
| `CASE-INTELLIGENCE-L10-014-03` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-03` | 未見Bot目的だが全7 manifest field/source revisionが限定済みの例と、allowed actionのみsource未取得の対照を入力する。 | 完備manifestは同一contractでcandidate化し、action fieldだけunknownにする。OS assignmentなし。 | 未見purposeで一律拒否、または欠落actionを推測補完すれば不合格。 |
| `CASE-INTELLIGENCE-L10-015-01` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-01` | 複数の独立CI/実行failure episodeと同pattern再現記録を入力。各episodeのscope、machine-detectability evidence、false-positive対照、repairability evidenceを別fieldで与える。 | pattern/reproducibility/machine detectability/FP/scope/repairabilityを分けた評価と不足fieldを返し、条件を満たす場合もBot candidateに止める。 | 1 eventから恒久Bot化、repairabilityだけでtrigger、または未測定条件を確定としたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからpattern、reproduction, machine-detectability, false-positive, scope, repairability evidenceを一つずつ欠落/反証/異scope化。単発のみ、同一episodeの重複、scope+FP欠落も個別/併発fixtureにする。 | episode identityと6評価軸を別々に判定し、欠落軸をunknown/未評価としてcandidate保留。単発/重複を複数独立episodeとして数えない。 | repairability評価自体を省略、他軸で欠落を相殺、またはrepairabilityのみで候補triggerなら不合格。 |
| `CASE-INTELLIGENCE-L10-015-03` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-03` | 未見failure patternの複数episodeで6 evidence軸が揃うfixtureと、同条件のmachine-detectability sourceだけ未取得の対照を入力。 | 完備例は同契約でcandidate評価、対照はその軸だけunknown。どちらも実Bot/恒久化を生じない。 | 未見という理由で一律reject、または未取得sourceをsuccessとして補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-01` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-01` | candidate fixtureに9束縛（target revision, actor, write-set, side effect, budget, deadline, retry, impact scope, recovery point）と期待効果を入力。結果fixtureは別にし、既存authority/OS assignmentに対応するWorker result, before/after state, side effects, actual budget/retry, recovery/post-checkを与える。 | candidateでは9束縛と期待結果が結ばれ実行されない。result fixtureでは既存executionとの対応を確認して、actual diff/副作用/使用budget/recovery/post-checkを宣言境界と比較する。新しい実行許可は生じない。 | candidate記録を実結果扱い、またはWorker resultだけで欠落したauthority/assignmentを補ったら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 9束縛の各field欠落/異版を個別入力。実結果側ではstale target、scope外write、cycle、duplicate execution、supplied budget超過、unknown side effectを個別入力し、scope外+budget超過と意味変更+recovery欠落の併発例も与える。 | candidateは必要fieldごとに未完を示す。既存Worker resultは異常項目をsuccessとせず、scope/side effect/recovery結果を照合しsemantic diffは上流ownerへ返す。 | 候補自体を抹消するのではなく、未確定/失敗理由と戻し先を出す。未許可の再実行、結果確定、要求意味変更は不合格。 |
| `CASE-INTELLIGENCE-L10-016-03` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-03` | 未見targetでも9束縛がそろうcandidate fixtureと、そのtargetの既存assignment/Worker result・recovery evidenceがそろう結果fixtureを入力。対照はrecovery evidenceだけ欠落。 | candidateとresultを別状態で評価し、完備結果だけ宣言scopeとの照合ができる。対照はrecovery resultだけunknown、candidateは残る。 | 未見targetを一律拒否、またはcandidateからexecution resultを捏造したら不合格。 |
| `CASE-INTELLIGENCE-L10-018-01` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-01` | 同一methodのcurrent INTELLIGENCE judgmentと、別時点episodeのLABO effect/evaluation recordを各scope/time付きで入力する。 | current/ historical label、対象scope、LABO sourceを分けて出し過去評価でcurrent authorityを上書きしない。 | 古いLABO outcomeをcurrent statusに代入、INTELLIGENCE自己評価で改善を採択する例を個別/併発で投入。 |
| `CASE-INTELLIGENCE-L10-018-02` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-02` | 古いLABO outcomeをcurrent statusに代入、INTELLIGENCE自己評価で改善を採択する例を個別/併発で投入。 | historic resultを維持しcurrent judgment/authorityに混ぜず、変更提案はtarget ownerへ戻す。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-018-03` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-03` | 未見期間のLABO historyが同method/scopeで結べる例と、期間境界未取得の対照。 | 同一時系列contractで別時点を保持し、欠けたtime rangeだけunknown。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-019-01` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-01` | Product Core query、BRAIN Pattern/Unit/Part exact versions、required inputs/conditions/alternatives/constraints/counterexamples/evidence/maturityを入力する。 | 適用性candidateをsource/version付きで返しknowledgeはBRAIN正本、汎用評価はLABOへ残す。 | scope不一致、Pattern/Unit/Part欠落、旧version、採用状態の偽装を単独/併発投入。 |
| `CASE-INTELLIGENCE-L10-019-02` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | scope不一致、Pattern/Unit/Part欠落、旧version、採用状態の偽装を単独/併発投入。 | candidateをaccepted/matureへ昇格させず、不足sourceはBRAIN、generic evaluationはLABOへ戻す。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-019-03` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-03` | 未見Pattern/Unit/Partで正本versionと適用条件が揃う例と、反例evidence未取得の対照。 | 確認可能な適用性をcandidateとして返し反例不足範囲だけunknown、知識を書き換えない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-020-01` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-01` | Product Core identity/revision、該当issue、意味主張のsource、backflow proposal、owner locatorを入力する。 | proposalを製品/版/ownerへ結び、正本変更をProduct Core ownerへ返す。 | 対象revision違い、別product identity流用、owner不明、INTELLIGENCE直接編集の各例と異版+owner欠落併発。 |
| `CASE-INTELLIGENCE-L10-020-02` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 対象revision違い、別product identity流用、owner不明、INTELLIGENCE直接編集の各例と異版+owner欠落併発。 | 該当proposalを未routed/unknownにし、Product Core意味/要求/designは変更しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-020-03` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-03` | 未見product identityで双方のmeaning revisionsとownerが揃う例、片側revision欠落の対照。 | 揃う差分を同じbackflow candidateとして返し欠落revisionだけunknown。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-067-01` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-01` | 既に決定済みのquality/order input、その適用scope/source revision、LABO evidenceを既存L2-010 proposal inputへ渡す。 | 同じL2-010 fieldへ理由/適用scopeを添えて反映し、独立ranker/router/assignmentを生成しない。 | 未決品質input、L2-010外scope、LABO evidence欠落を個別/併発で入力する。 |
| `CASE-INTELLIGENCE-L10-067-02` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-02` | 未決品質input、L2-010外scope、LABO evidence欠落を個別/併発で入力する。 | 該当判断を未確定とし、他の成立済みproposal fieldは保持。順位やassignmentを自動生成しない。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-067-03` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-03` | 未見の決定済みquality inputがL2-010 scopeに一致する例と、LABO evidence未取得の対照。 | scope一致部分だけ既存proposalへ通し、欠落evidenceのみunknown。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-072-01` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-01` | 004 original L2 `561–589` `a828bff2126dfe8b029c75ff922f4b52613e6aa48cd957a3f8056be635b97dd2`、004 L2 supplement `592–598` `08d3915feb65dfe071ce69f56fb97070822e08e5cd7f30a92b4d42e22953cf8b`、004 L11 original `289–303` `b0a3131940865e2cb30b016ec7232f6f9e40c6cb9fdd20f3974c7654e8a6a31f`、004 L11 supplement `306–314` `8d9514cc6964d617928abe6dacaece211004f754c337fbe8d78bda678ab187c8`、005 L2 NFR34 `673–687` `511c0083b8aaeab292ab348f488367b197516a9faaf92a44a27df1e80c6f21d8`、005 L11 NFR34 `398–434` `9884a284fbaecc0134936e0b3772871974d5eb24d78c4ebbef22ebf2c6bbb194`の6正規化partをfixtureへ設定する。PO指定順・区切りなしで合成したdigestは`d8376dc314dc4aebe7b413a40d4855e3147d6e5ec870d9790395825c5f8cc775`。 | 004 partsに基づく候補/shadow・review・rollback状態と、005 selected-source stale facetを別々に観測し、候補を非強制で保持する。 | 6 partの一つでも別identity/bytesと結合、または6 part compositeがPO digestと一致しなければ不合格。 |
| `CASE-INTELLIGENCE-L10-072-02` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02` | PO固定6 partの各々を一つずつ欠落または別bytesにした6 fixtureと、004 original L2欠落+005 NFR34 L11不一致の併発fixtureを投入する。 | 各partのL2/L11区分・path・行範囲・欠落/不一致digestを個別に示し、影響する状態だけ未完にする。他の一致partは保持する。 | semantic/full-file SHAをpart digestの代用にする、欠落partを別partで補完する、または004/005の区分を消したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-03` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6 partが一致するfixtureから、005で実際に選択したsource identity/revision/digestを一つ変更する例と、同じ種類だが選択されていないsourceだけを変更する例を分離して入力する。 | 選択source変更では005 candidate/shadow facetだけstaleとしsource ownerへ照合を戻す。非選択source変更ではその変更を未観測として記録し、004の4 pinおよび他facetをstale化しない。 | 005 staleを004の4 partへ波及、非選択sourceの変更で全packをstale化、または選択/非選択不明を確定扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-05` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | scope、requirement、template、skill、model catalog、allowlistの各source tupleを一つずつ選択した6 fixtureを作る。各fixtureでは選択tupleのidentity、revision、digestの一つだけを変更し、別fixtureでは同じ種別の非選択sourceを変更する。さらに選択状態を特定できない入力を与える。 | 選択sourceごとに当該facetだけstaleとなりsource ownerへの照合先を保持する。非選択source変更を選択source staleと誤認せず、選択状態不明はunknownとしてその範囲だけ保留する。 | 6種のどれかを省略して他sourceで代表させる、非選択変更を選択済みとして扱う、またはunknownをfresh/staleへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-06` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-06` | 同じidentity/revisionを指す重複edge fixtureと、requirement/evidence/反証/停止条件が異なる二sourceの競合fixtureを別々に入力する。 | 重複をまとめても各source edgeのidentity/revision/applicabilityを追跡できる。競合fixtureは両方の意味と未解決点をconflict/unknownとして保持し、どちらかを優先採択しない。 | edgeの削除、競合の暗黙解消、INTELLIGENCEが優先順を創作する出力は不合格。 |
| `CASE-INTELLIGENCE-L10-072-07` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-07` | 同一scope、target revision、case、oracleの入力をcandidateあり/なしの対で与える。両側にpositive例、false-positive例、false-negative例、unknown例、明示反例を含め、同一pack versionのrollback先・戻し条件・rollback evidenceも入力する。対照としてscope不一致とrollback evidence欠落を与える。 | candidate有無の結果を同条件で並べ、false-positive/false-negative/unknown/反例を別々に識別し、rollback先・条件・evidenceをversionへ結ぶ。不一致条件または欠落evidenceの比較/rollbackだけを未完にする。 | 条件不一致を同一比較として扱う、unknownを成功へ寄せる、rollback根拠なしで復帰済みとする、または新しい閾値/rollback方式を定めたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-08` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | scope/sourceが揃いcandidate identity/versionを作れる入力を与え、shadow receiptなし・review receiptなしの二例を作る。別fixtureではcandidate作成側と異なるreviewer identity/context/authority/routeを設定し、同一作成者review例、作成側が起用したsubagentによるreview例、provider/modelだけ同一でidentity/context/authority/routeは別の例を対照にする。 | candidate生成はshadow/review receiptが先になくても成立し、未取得receiptは後続義務として保留される。独立性はidentity/context/authority/routeの差を確認し、provider/model一致だけで肯定も否定もしない。全証拠が揃っても既存ownerの採択なしにactive/gateにならない。 | receiptをcandidate生成の前提にする、作成者自身または作成側subagentのreviewを独立扱いする、provider/modelだけで独立性を断定する、または候補からactive/gateを発生させたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-04` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-04` | 未見source tupleが選択済みで全pinが一致する例と、selected sourceだけdigest changedの対照。 | complete tupleはcandidate/shadow入力で保持、changed 005 facetだけstale; unknown applicabilityだけsource ownerへ返す。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-073-01` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-01` | AAFD R-04対象のfree-text finding、detector identity/priority evidence、finding source revisionとcandidate result fieldを入力する。 | priority付きdetector candidateを根拠へ結び、Issue/Requirement/CI/merge objectを作らない。 | priority未宣言、根拠欠落、自由文からIssue等を直接投影する例とpriority+evidence欠落の併発。 |
| `CASE-INTELLIGENCE-L10-073-02` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | priority未宣言、根拠欠落、自由文からIssue等を直接投影する例とpriority+evidence欠落の併発。 | 不確定detector resultをcandidate/unknownに止め、直接projectionを拒否する。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-073-03` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-03` | 未見finding wordingでもdetector/priority evidenceが揃う例とpriorityだけ不明の対照。 | known detector scopeは同じpriority contractで評価しpriority不明部分だけunknown、直接projectionなし。 | 期待出力がL3 ACのoracleと一致しない場合は不合格。 |
| `CASE-INTELLIGENCE-L10-078-01a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: authorityだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | authorityの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | authorityを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: responsibilityだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | responsibilityの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | responsibilityを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: runtimeだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | runtimeの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | runtimeを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: providerだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | providerの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | providerを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: dependencyだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | dependencyの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | dependencyを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: securityだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | securityの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | securityを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: verificationだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | verificationの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | verificationを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: capacityだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | capacityの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | capacityを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: costだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | costの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | costを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: migrationだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | migrationの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | migrationを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-01k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 正常fixture: releaseだけを対象に、source-bound previous/observed状態・revision/digest・対象identity・evidenceを与え、親の他10次元は独立に保持する。 | releaseの意味差分を他次元へ畳まず同一選択source/authorityへbindし、支持された状態だけdeltaへ反映する。 | releaseを別次元として扱わない、source境界を外す、または観測されていない値を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | authorityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | responsibilityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | runtimeだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | providerだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | dependencyだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | securityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | verificationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | capacityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | costだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | migrationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 | releaseだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | authorityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | responsibilityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | runtimeだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | providerだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | dependencyだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | securityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | verificationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | capacityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | costだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | migrationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 | releaseだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | authorityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | responsibilityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | runtimeだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | providerだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | dependencyだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | securityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | verificationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | capacityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | costだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | migrationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 | releaseだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | authorityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | responsibilityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | runtimeだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | providerだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | dependencyだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | securityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | verificationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | capacityだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | costだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | migrationだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 | releaseだけunknown/incompleteとして残し、正常に結べる他次元と親の未完義務を維持する。選択source/責務ownerが明示されていればそこへ戻し、owner不明なら推測しない。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | 同一項目のpositive fixtureから作る否定入力: 同一source receipt/registry/policyを2回評価する正常対と、stale revision、wrong HEAD、wrong authority、missing receipt、duplicate changeをそれぞれ独立に変えたfixtureを与える。. 各記載条件を単独に変異したfixtureを投入し、列挙条件を同時適用した併発fixtureも投入する。 | 正常対はexact set/digest一致。各異常を別理由で不成立にしretry/順序変更でepisodeを増殖させない。 | 変異ごとの拒否が混ざる、別deltaとして重複作成する、又は不一致をcurrent成功にすると不合格。 |
| `CASE-INTELLIGENCE-L10-078-03` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-03` | delta source identityと一致するF0 snapshot revision/digest、別revisionだけの例、digestだけ異なる例を別fixtureにする。 | 完全一致だけjoinし、不一致はstale/reobservation required。 | 不一致値を現行としてjoin、source値を推測補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-04` | affected Future Type/assumption/projection/directive exact setのfixtureと、affected item欠落・無関係item追加・whole-system再投影の各変異を投入する。 | exact affected itemsだけstale/再投影し、unaffected itemは維持。構造変更はproposal-onlyでparkingを維持する。 | 対象外projectionの再生成、scope拡大、current-write parking解除は不合格。 |
| `CASE-INTELLIGENCE-L10-078-05` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | stale Future Directive、unresolved unknown、missing receiptを一つずつ与え、各々でassignment/release/retire/requirement write/design writeの観測欄を比較する。 | 各条件で該当操作の発行を抑止し、R-11の理由と対象を残す。 | 一つでも操作を発行、またはR-08 non-writeに畳んで条件が追跡不能なら不合格。 |
| `CASE-INTELLIGENCE-L10-078-06` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | 同じauthority/event journalからの初回構築、DB喪失後再構築、同じevent集合の順序変更を行う期待結果fixtureを比較する（runtimeは実行せず静的期待値を照合）。 | 各比較でdelta/invalidation/intake projectionのexact set/digestが一致する期待値を保つ。 | 欠落projectionやdigest差を成功扱いしない。未fixtureのevent/source範囲のみunknownとする。 |
| `CASE-INTELLIGENCE-L10-078-07` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-07` | Held-out fixture: 未見snapshot/event combinationでもR-06/R-07/R-09–12に必要なidentity・receipt・authorityが揃う範囲は同じ各R oracleで照合し、欠けたpartだけunknownとする。 | 必須source/contract条件が揃う未見例は同じ親contractで評価し、肯定条件を満たす部分を正常として保持する。 | 比較側は同じfixtureから一つの該当入力だけmissing/unresolvedにした局所unknown対照。未見を一律rejectしない。 |
