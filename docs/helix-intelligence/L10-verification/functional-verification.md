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

状態: 未実行のL10設計候補。各CASEは固定633 L2/L11 parentとR2187-01の内容oracleに束縛し、PR/review/implementation/approvalから受入を生成しない。HARNESS-L2-010/011共通packは017・036・039では実際に消費するoperationだけに結び、他の対象親ではoperationごとに常時契約として照合する。これを個別sourceの選択条件へ弱めない。

### CASE-INT-017-01 — source-bound正常（AC-INT-017-01）

入力: 同一target revision/scopeに対するSECURITY permission/isolation・Worker実行・HARNESS検証義務・OS検収の各結果。出力: 境界別の未完/完了状態を保つ統合修復結果。責務: SECURITY permission/isolation; OS/Worker assignment/result; HARNESS obligation; OS acceptance。

**期待oracle:** 同一target revision/scopeについてSECURITY permission、Worker実行結果、HARNESS検証、OS検収を別々の証拠で受ける。操作時点permissionと後日の失効時刻を区別し、各段階の対応証拠がそろった時だけ完了する。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-017-02 — 親固有fieldの独立negative（AC-INT-017-02）

各行をCASE-INT-017-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-017-02a` | 操作時点permission receiptを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、SECURITY permission/isolation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02b` | Worker実行resultを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker result ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02c` | HARNESS verification obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS requirement/verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02d` | OS acceptance receiptを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS acceptance ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02e` | permissionのtarget scopeだけを別scopeへ差し替える | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、SECURITY permission/isolation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02f` | 実行時点のpermission statusだけを後日の失効statusへ差し替える | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、SECURITY permission/isolation ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02g` | 四段階のsource/revisionを一つへ統合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当する各source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02h` | 修復candidateに包括write authorityを付与 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、既存の該当authority ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-017-02i` | 実行時点ですでに期限切れまたはrevokedのpermissionで実行 | 操作を実行可能にせず、完了扱いしない。SECURITY permission/isolation ownerへ戻す。 |

### CASE-INT-017-03 — 未見入力の親oracle（AC-INT-017-03）

入力: 段階receiptの到着順が変わる未見fixtureでもtarget/scopeを照合し、実行時点permissionが当時有効なら後日失効で過去証拠を消さない。段階順そのものを変更/必須化しない。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-017-04のunknown変異として別に扱う。

### CASE-INT-017-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-017-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-017-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-017-04a` | SECURITY permissionの状態がunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04b` | Worker execution receiptのrevisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、Worker execution/result ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04c` | HARNESS obligation適用scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04d` | OS acceptance対象revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS acceptance ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-017-04e` | target scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-017-02）

この親でHARNESS-L2-010/011共通packを実際に消費するoperationに限り、pack contractを照合する。非消費operationにpack依存を追加しない。L2-017は036〜039各接続のadmitted contractに依存する。以下はpackを消費するoperationに限る別fixtureであり、一度にpack field一つだけを変えて親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-017-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-017-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-030-01 — source-bound正常（AC-INT-030-01）

入力: 許可されたHARNESS requirement/design revision、process contract、verification obligation、admitted connector contract。出力: source revision付きSituation Model情報。責務: HARNESS source owner; 適用されるCONNECT contract owner。

**期待oracle:** 同一HARNESS source identity/revisionのrequirement/designとcontract receiptをSituation Modelへ反映し、HARNESSを正本ownerとして残す。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-030-02 — 親固有fieldの独立negative（AC-INT-030-02）

各行をCASE-INT-030-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-030-02a` | HARNESS requirement source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02b` | requirement revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02c` | design source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02d` | design revisionをstaleにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02e` | process contract receiptをstale revisionにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02f` | verification obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02g` | HARNESS source scopeを別operationへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-030-02h` | HARNESS source ownerを別ownerへ置換 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS source ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-030-03 — 未見入力の親oracle（AC-INT-030-03）

入力: 宣言済compatibility範囲内の未見version pairのみ同一source契約に接続し、範囲外/未宣言はunknownとしてconnectorを自動選択しない。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-030-04のunknown変異として別に扱う。

### CASE-INT-030-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-030-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-030-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-030-04a` | HARNESS requirement/design revision fieldがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04b` | process/verification contract適用性がunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04c` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04d` | declared compatibility外のversion pair | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-030-04e` | operation scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS source ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-030-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-030-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-030-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-031-01 — source-bound正常（AC-INT-031-01）

入力: 許可ticket/current state/dependency/evidence、OS source revision、admitted connector contract。出力: OS revision付きSituation Model情報。OSがstate/authorityを保持。責務: OS source owner; 適用されるCONNECT contract owner。

**期待oracle:** OS ticketのstate revisionとdependencyをSituation Modelへ表示し、OS stateは変更しない。revision 8後に届いたrevision 7 eventでcurrent stateを巻き戻さない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-031-02 — 親固有fieldの独立negative（AC-INT-031-02）

親固有の追加negative oracle: 古いeventはcurrent stateを巻き戻さず、OSの最新state revisionを保持する。

各行をCASE-INT-031-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-031-02a` | OS ticket identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02b` | ticket state revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS state ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02c` | dependency evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02d` | 遅延state eventをcurrent stateへ誤結合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS state ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02e` | source scopeを別ticketへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02f` | OS authorityをINTELLIGENCEへ移す | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS authority ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-031-02h` | dependency revisionをstaleにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS source ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-031-03 — 未見入力の親oracle（AC-INT-031-03）

入力: 未見state/event valueでも宣言済OS契約内ならticket/revisionに結び渡す。契約外/定義不明の値のみunknownとしてOSへ照会する。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-031-04のunknown変異として別に扱う。

### CASE-INT-031-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-031-04）

親固有の追加negative oracle: 古いeventはcurrent stateを巻き戻さず、OSの最新state revisionを保持する。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-031-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-031-04a` | OS ticket/state revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04b` | dependency evidence revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04c` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04d` | state/event種別が宣言契約外 | 該当fieldだけunknown/incompleteとして推測を止め、OS state ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-031-04e` | ticket scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-031-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-031-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-031-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-032-01 — source-bound正常（AC-INT-032-01）

入力: BRAIN Pattern/Unit/Part、applicability、exception、counterexampleおよびrevision。出力: source-bound INTELLIGENCE判断材料。BRAIN knowledge canonicalを保持。責務: BRAIN source owner; 適用されるCONNECT contract owner。

**期待oracle:** `CASE-INT-032-01` は正常fixtureのみを扱い、Pattern identity/revisionとapplicability条件を照合して判断材料へ進める。scope内counterexample成立時の拒否は独立negative `CASE-INT-032-02c`で照合し、BRAIN knowledgeを変更しない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-032-02 — 親固有fieldの独立negative（AC-INT-032-02）

親固有の追加negative oracle: scope内counterexampleが成立する場合は適用を拒否し、BRAIN knowledgeを変更しない。

各行をCASE-INT-032-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-032-02a` | Pattern identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02i` | Pattern revisionを欠落 | revisionだけinvalid/incompleteにしBRAIN knowledge ownerへ戻す。適用を成立させない。 |
| `CASE-INT-032-02b` | applicability stateをunknownのまま適用済みにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02c` | 現在scopeで成立するcounterexampleを除外 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02d` | exception scopeをPattern scopeと不一致にする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02e` | applicability conditionが満たされないPatternを適用候補として出す | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02f` | BRAIN canonicalをINTELLIGENCEから変更 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-032-02h` | Pattern revisionの反例を別revisionへ混合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、BRAIN knowledge ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-032-03 — 未見入力の親oracle（AC-INT-032-03）

入力: 未fixture Pattern versionでも宣言済互換範囲・適用scope内で条件を満たしcounterexampleが非該当ならcandidate根拠にする。未宣言範囲はunknownとしてBRAINへ戻し、同名Patternを統合しない。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-032-04のunknown変異として別に扱う。

### CASE-INT-032-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-032-04）

親固有の追加negative oracle: scope内counterexampleが成立する場合は適用を拒否し、BRAIN knowledgeを変更しない。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-032-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-032-04a` | Pattern identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04f` | Pattern revisionがunknown | revisionだけunknown/incompleteとして保持しBRAIN knowledge ownerへ戻す。 |
| `CASE-INT-032-04b` | applicabilityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04c` | exception/counterexample適用scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04d` | declared compatibility外のPattern version | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-032-04e` | source scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-032-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-032-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-032-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

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
| `CASE-INT-033-02d` | 二sourceの同語異義を一つへ統合 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerとHARNESS ownerを別々に保持する。他の正常source/operationは維持する。 |
| `CASE-INT-033-02e` | scopeを異なるProduct Coreへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02f` | 二sourceのrevisionを取り違える | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、誤った各source ownerへ別々に戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当する親source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-033-02h` | Product Coreの意味変更をINTELLIGENCEが確定 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-033-03 — 未見入力の親oracle（AC-INT-033-03）

入力: 宣言済schema compatibility内の未見pairでもProduct Core/HARNESS source edgeを別々に保つ。未宣言schemaはunsupportedとして各source ownerへ返す。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-033-04のunknown変異として別に扱う。

### CASE-INT-033-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-033-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-033-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-033-04a` | Product Core source identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当Product Core ownerが特定されるまで各sourceを分離して保持し、source ownerが特定できれば当該ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04b` | HARNESS obligation revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04c` | 二sourceの意味衝突が未解決 | 該当fieldだけunknown/incompleteとして推測を止め、該当Product Core ownerとHARNESS ownerを別々に保持する。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04d` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-033-04e` | 片方のsource scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、該当する当該source ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-033-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-033-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-033-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-034-01 — source-bound正常（AC-INT-034-01）

入力: 過去evaluation、success/failure/counterexample、Worker/model実績、Bench level、explicitly unevaluatedと各source scope/revision。出力: scope付き判断材料。過去評価ownerはLABO、配置候補ownerはINTELLIGENCE。責務: LABO evaluation/source owner。

**期待oracle:** LABO評価済み結果と別caseの明示的未評価結果を受け、評価済みscopeだけ証拠とし未評価はそのまま保持する。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-034-02 — 親固有fieldの独立negative（AC-INT-034-02）

親固有の追加negative oracle: 異なるscopeのBench/evaluationは対象scopeのqualificationに使わない。

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

### CASE-INT-034-03 — 未見入力の親oracle（AC-INT-034-03）

入力: LABO定義済status/versionの未見fixtureは同scopeで扱い、explicitly unevaluatedは未評価として維持する。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-034-04のunknown変異として別に扱う。

### CASE-INT-034-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-034-04）

親固有の追加negative oracle: 異なるscopeのBench/evaluationは対象scopeのqualificationに使わない。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-034-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-034-04a` | LABO evaluation revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04b` | evaluation scope/Worker identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04c` | statusが未定義で評価済み/未評価を区別できない | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04d` | evidence source/provenanceがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-034-04e` | compatibility range外の評価version | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-034-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-034-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-034-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-035-01 — source-bound正常（AC-INT-035-01）

入力: plan/placement/diagnosis/review/repair candidate、根拠、停止条件、依存、source revision。出力: OSが受け取れる候補。ticket登録・割当・実行・進行はOS。責務: INTELLIGENCE candidate owner; OS ticket/assignment owner。

**期待oracle:** 承認済み目標・依存関係を含むcandidateをOSへ渡し、INTELLIGENCE出力はcandidate receiptまでとする。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-035-02 — 親固有fieldの独立negative（AC-INT-035-02）

各行をCASE-INT-035-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-035-02a` | candidate identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02i` | candidate source revisionを欠落 | source revisionだけinvalid/incompleteにしINTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-035-02b` | candidate evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02j` | candidate dependencyを欠落 | dependencyだけinvalid/incompleteにしINTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-035-02c` | 停止条件を欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02d` | stale candidateをcurrentとして提示 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02e` | OS ticket mappingを推測で確定 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02f` | INTELLIGENCE candidate receiptをOS ticketとして扱う | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02h` | candidate source scopeを別taskへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-035-02k` | 目標未承認のcandidateをticket化可能としてOSへ渡す | 承認を創作せずcandidateを保留し、OS ticket/assignmentを成立させない。INTELLIGENCE candidate ownerへ戻す。 |

### CASE-INT-035-03 — 未見入力の親oracle（AC-INT-035-03）

入力: 未fixture task classでも既知task/scope contractのcandidateを作り、ticket化はOSへ分離する。OS mapping未宣言ならunknownのまま独自ticketを作らない。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-035-04のunknown変異として別に扱う。

### CASE-INT-035-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-035-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-035-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-035-04a` | candidate source revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-035-04f` | dependency scopeがunknown | identityだけunknown/incompleteとして保持しINTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-035-04b` | goal scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-035-04c` | stop conditionが未定義 | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-035-04d` | OS ticket mappingがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-035-04e` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-035-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-035-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-035-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-036-01 — source-bound正常（AC-INT-036-01）

入力: operation candidateのactor/action/target/scope/revisionとSECURITY permission/constraint/revocation結果。出力: 修復candidateに付くpermission照合結果。permission/isolation authorityはSECURITY。責務: SECURITY permission/isolation owner。

**期待oracle:** actor/action/target/scopeに対する操作時点で有効なSECURITY permissionと制約を照合し、permissionを発行/変更しない。期限切れ/revoked permissionでは操作を実行可能にしない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-036-02 — 親固有fieldの独立negative（AC-INT-036-02）

親固有の追加negative oracle: 期限切れ/revoked permissionでは操作を実行可能にしない。

各行をCASE-INT-036-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-036-02a` | actor identityを欠落 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02b` | action identityを欠落 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02c` | target identityを欠落 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02d` | scopeだけを不一致にする | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02e` | permission revisionをstaleにする | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02f` | 操作時点ですでにrevokedのpermissionを有効扱いする | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02g` | 別actor/action/targetのpermissionを流用 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02h` | INTELLIGENCEがpermissionを発行/変更 | 変異fieldだけを不成立として保持し、SECURITY permission/isolation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-036-02i` | 操作時点ですでに期限切れのpermissionを有効扱いする | 操作timestamp時点の期限を照合して実行可能にせずSECURITY permission/isolation ownerへ戻す。後刻のrevocationを過去の操作へ遡及させない。 |

### CASE-INT-036-03 — 未見入力の親oracle（AC-INT-036-03）

未見actionでpermission sourceが欠落/unknownのfixtureでは、まずunknownとしてSECURITY permission/isolation ownerへ返し、操作を実行可能にしない。明示permissionによる照合は独立fixture `CASE-INT-036-03a` で扱う。scope外/unknown条件は04の独立fixtureでも照合する。

期待: このfixtureでは未見actionのpermission状態が確認できないためunknownを保ち、実行可能状態を作らない。別actionのpermissionは流用せず、INTELLIGENCEから実行許可を作らない。

### CASE-INT-036-03a — 未見action・明示permission（AC-INT-036-03）

未見actionでも、SECURITY permission sourceがactor/action/target/scopeを明示し、操作時点で有効ならその照合結果を返す。CASE-INT-036-03のunknown結果をこのfixtureへ引き継がず、別actionのpermissionやINTELLIGENCE生成許可を使わない。

### CASE-INT-036-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-036-04）

親固有の追加negative oracle: 期限切れ/revoked permissionでは操作を実行可能にしない。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-036-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-036-04a` | actor permissionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-036-04b` | action permissionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-036-04c` | target permissionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-036-04h` | permission statusがunknown | statusだけunknownとしてSECURITYへ戻し、実行可能にしない。 |
| `CASE-INT-036-04f` | scope適用性がunknown | scopeだけunknownとしてSECURITYへ戻す。 |
| `CASE-INT-036-04g` | permission revisionがunknown | revisionだけunknownとしてSECURITYへ戻し、実行可能にしない。 |
| `CASE-INT-036-04d` | revocation時点がunknown | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-036-04e` | actionがsourceに未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、SECURITY permission/isolation ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-036-02）

この親でHARNESS-L2-010/011共通packを実際に消費するoperationに限り、pack contractを照合する。非消費operationにpack依存を追加しない。L2-017は036〜039各接続のadmitted contractに依存する。以下はpackを消費するoperationに限る別fixtureであり、一度にpack field一つだけを変えて親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-036-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-036-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-037-01 — source-bound正常（AC-INT-037-01）

入力: OS発行・割当ticket、Worker actor、task scope、ticket revision、admitted contract。出力: Worker actor/scope付き実行結果を同ticketに結びOS/INTELLIGENCEへ返す。責務: OS ticket/assignment owner; Worker result integrity owner。

**期待oracle:** OSがticketとWorker/version/scopeを割り当てた後、その対応を保持してWorker resultを同ticketの結果として扱う。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-037-02 — 親固有fieldの独立negative（AC-INT-037-02）

各行をCASE-INT-037-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-037-02a` | OS-issued ticket identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02b` | Worker assignmentを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02c` | Worker identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02d` | Worker versionをassignmentと不一致にする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02e` | task scopeを別ticketへ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02f` | Worker result actorをassignmentと不一致にする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker execution/result ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02g` | Worker result provenanceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker execution/result ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-037-02h` | INTELLIGENCEから実行許可を追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS ticket/assignment ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-037-03 — 未見入力の親oracle（AC-INT-037-03）

入力: 未fixture Worker versionでもOS assignmentと宣言済compatibility/task scopeを満たす場合は同ticketで照合する。未宣言互換性はOSへ戻し、INTELLIGENCEから実行許可を足さない。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-037-04のunknown変異として別に扱う。

### CASE-INT-037-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-037-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-037-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-037-04a` | OS ticket identity/stateがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04b` | Worker assignment/versionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04c` | task scope compatibilityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS ticket/assignment ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04d` | Worker result provenanceがunknown | 該当fieldだけunknown/incompleteとして推測を止め、Worker execution/result ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-037-04e` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-037-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-037-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-037-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-038-01 — source-bound正常（AC-INT-038-01）

入力: requirement revision、oracle、expected failure、independent verification、consumer acceptance、backflow condition。出力: 修復scopeに束縛した検証義務一式。責務: HARNESS requirement/verification owner。

**期待oracle:** HARNESS requirement revisionのverification obligation一式をrepair ticketへ渡し、実行後も同じobligationを照合する。oracle/obligationの除去・弱化後を検証完了としない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-038-02 — 親固有fieldの独立negative（AC-INT-038-02）

親固有の追加negative oracle: oracle/verification obligationを除去または弱化した後を検証完了にしない。

各行をCASE-INT-038-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-038-02a` | requirement revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS requirement ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02b` | verification oracleを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02c` | expected failure conditionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02d` | independent verification obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02e` | consumer acceptance obligationを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS/consumer acceptance ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02f` | backflow conditionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS requirement/verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-038-02h` | 修復器がoracleを弱化し検証済みにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |

### CASE-INT-038-03 — 未見入力の親oracle（AC-INT-038-03）

入力: 未見obligation種別でもHARNESSが定める同じ要求revision/oracleに結び証拠がそろえば評価する。resultなしは未充足のままHARNESSへ戻す。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-038-04のunknown変異として別に扱う。

### CASE-INT-038-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-038-04）

親固有の追加negative oracle: oracle/verification obligationを除去または弱化した後を検証完了にしない。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-038-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-038-04a` | requirement/oracle revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS requirement/verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04b` | expected failure conditionが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04c` | independent verification statusがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04d` | consumer acceptance scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS/consumer acceptance ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-038-04e` | backflow conditionが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-038-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-038-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-038-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-039-01 — source-bound正常（AC-INT-039-01）

入力: scope付きrepair candidate、Worker execution evidence、HARNESS verification resultと各revision/receipt。出力: OS acceptanceへの検収入力。acceptance/progressはOS。責務: candidate/Worker/HARNESSの各source owner; OS acceptance owner。

**期待oracle:** 同一修復scopeのcandidate、execution evidence、HARNESS resultを区別してOSへhandoffし、OSが独自に受入判断できる証拠を残す。Worker成功だけではOS acceptanceを成立させない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-039-02 — 親固有fieldの独立negative（AC-INT-039-02）

親固有の追加negative oracle: Worker成功receiptだけではOS acceptanceを成立させない。

各行をCASE-INT-039-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-039-02a` | repair candidate scopeを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、INTELLIGENCE candidate ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02b` | execution evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、Worker execution/result ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02c` | HARNESS verification resultを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02d` | OS acceptance receiptをINTELLIGENCEが生成 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS acceptance ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02e` | 別scopeのevidenceを同じ候補へ結ぶ | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当evidence producer ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02f` | stale HARNESS resultをcurrent扱い | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、HARNESS verification ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02g` | 未選択connectorを必須依存として提案へ追加 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当する親source ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02h` | 重複receiptを新しいacceptance evidenceにする | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、OS acceptance ownerへ戻す。他の正常source/operationは維持する。 |
| `CASE-INT-039-02i` | receiptの到着順が逆であることだけを根拠に新しいacceptance evidenceとして採用 | OS acceptanceを生成せず、別段階receiptと順序を保持してOSへ戻す。 |

### CASE-INT-039-03 — 未見入力の親oracle（AC-INT-039-03）

入力: 未見receipt versionでも宣言済互換契約/correlation/scopeを満たすなら段階別に受領し、OS独自acceptanceを残す。範囲外は未受領としてproducer/OSへ返す。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-039-04のunknown変異として別に扱う。

### CASE-INT-039-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-039-04）

親固有の追加negative oracle: Worker成功receiptだけではOS acceptanceを成立させない。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-039-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-039-04a` | candidate scope/revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-039-04b` | execution evidence producer/revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、Worker execution/result ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-039-04c` | HARNESS verification applicabilityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、HARNESS verification ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-039-04d` | OS acceptance targetがunknown | 該当fieldだけunknown/incompleteとして推測を止め、OS acceptance ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-039-04e` | selected connector contract identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-039-02）

この親でHARNESS-L2-010/011共通packを実際に消費するoperationに限り、pack contractを照合する。非消費operationにpack依存を追加しない。L2-017は036〜039各接続のadmitted contractに依存する。以下はpackを消費するoperationに限る別fixtureであり、一度にpack field一つだけを変えて親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-039-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-039-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-040-01 — source-bound正常（AC-INT-040-01）

入力: prediction/diagnosis/review/placement/repair result、source revision、episode/scope、actual evidence/observation window。出力: LABOの過去評価材料。長期効果評価ownerはLABO。責務: INTELLIGENCE source/result owner; LABO evaluation owner。

**期待oracle:** predictionと後続actual outcomeを同一episode/scopeへ結び、source revisionと観測windowを分けてLABOへ渡す。prediction単独はactual receiptでない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-040-02 — 親固有fieldの独立negative（AC-INT-040-02）

親固有の追加negative oracle: predictionをactual outcome/receiptとして扱わず、actual欠落はLABOへ返す。

各行をCASE-INT-040-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-040-02a` | prediction source identityを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02i` | prediction source revisionを欠落 | source revisionだけinvalid/incompleteにしINTELLIGENCE result/source ownerへ戻す。 |
| `CASE-INT-040-02b` | actual outcomeをpredictionで代用 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02c` | episode/scope bindingを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02d` | observation windowを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02e` | 遅着actualを別episodeへ結ぶ | 変異fieldだけを不成立として保持し、INTELLIGENCE result/source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02f` | 重複actualを別成功に数える | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02g` | 未選択connectorを必須依存として提案へ追加 | 変異fieldだけを不成立として保持し、該当する親source ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-040-02h` | evaluation ownershipをINTELLIGENCEへ変更 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |

### CASE-INT-040-03 — 未見入力の親oracle（AC-INT-040-03）

入力: 遅延/重複actualをepisode/revisionで照合し、重複を別成功に数えない。未対応actualはunknownのままLABOへ渡す。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-040-04のunknown変異として別に扱う。

### CASE-INT-040-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-040-04）

親固有の追加negative oracle: predictionをactual outcome/receiptとして扱わず、actual欠落はLABOへ返す。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-040-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-040-04a` | prediction source identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04f` | prediction source revisionがunknown | revisionだけunknown/incompleteとしてINTELLIGENCE result/source ownerへ戻す。 |
| `CASE-INT-040-04b` | actual outcomeが未観測 | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ未観測として返す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04c` | episode/scope bindingがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04d` | observation windowが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-040-04e` | duplicate/late event identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE result/source ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-040-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-040-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-040-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-041-01 — source-bound正常（AC-INT-041-01）

入力: 各admitted mechanismの許可current state/evidence、個別revision、connector/authority contract。出力: source別Situation Model input。個別connector/authority identityを維持。責務: 各source owner; CONNECT contract owner。

**期待oracle:** HARNESSとOSを個別source identity/connectorで読み、各revision/scope/authorityを個別に保つ。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-041-02 — 親固有fieldの独立negative（AC-INT-041-02）

親固有の追加negative oracle: 各source identity/revision/authorityを分離して保持し、統合で消さない。

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

### CASE-INT-041-03 — 未見入力の親oracle（AC-INT-041-03）

入力: 未選択Web/WEB-OSは未観測のままにする。選択されたsourceだけ、明示されたsource identity/revision/scopeとconnector契約を照合し、未見互換値は宣言範囲内のみ受ける。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-041-04のunknown変異として別に扱う。

### CASE-INT-041-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-041-04）

親固有の追加negative oracle: 各source identity/revision/authorityを分離して保持し、統合で消さない。

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-041-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-041-04a` | selected source identity/revisionがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当source機構ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04b` | source scope/authorityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当source機構ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04c` | selected connector contractがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04d` | 互換性rangeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、該当source機構ownerとCONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-041-04e` | 未選択sourceを要求された | 該当fieldだけunknown/incompleteとして推測を止め、未選択sourceは未観測のまま保持する。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-041-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-041-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-041-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-044-01 — source-bound正常（AC-INT-044-01）

入力: INTELLIGENCE decision/candidate、genericization proposal、evidence/scope、LABO evaluation handoff。出力: candidateをLABO経路へ渡す。BRAIN knowledge canonicalを保持し直接出力しない。責務: LABO evaluation owner; BRAIN knowledge owner。

**期待oracle:** generic candidateと出典/scopeをLABOへ渡し、BRAIN knowledge正本を変えない。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-044-02 — 親固有fieldの独立negative（AC-INT-044-02）

各行をCASE-INT-044-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-044-02a` | generic candidate identityを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE candidate ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02i` | generic candidate sourceを欠落 | sourceだけinvalid/incompleteにしINTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-044-02b` | candidate evidence scopeを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE candidate ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02c` | LABO評価経路を省略 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02d` | 未評価candidateからBRAIN更新を試みる | 変異fieldだけを不成立として保持し、BRAIN knowledge ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02e` | evaluation evidenceを別scopeへ結ぶ | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02f` | 汎用性を根拠なく確定 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02g` | 未選択connectorを必須依存として提案へ追加 | 変異fieldだけを不成立として保持し、LABO evaluation ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-044-02h` | INTELLIGENCEからBRAINへ直接出力 | 変異fieldだけを不成立として保持し、BRAIN knowledge ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |

### CASE-INT-044-03 — 未見入力の親oracle（AC-INT-044-03）

入力: 未見candidate kindもsource/scopeを維持してLABOへ渡し、評価例がないものをgeneralizableと断定しない。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-044-04のunknown変異として別に扱う。

### CASE-INT-044-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-044-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-044-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-044-04a` | candidate identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-044-04f` | candidate sourceがunknown | sourceだけunknown/incompleteとしてINTELLIGENCE candidate ownerへ戻す。 |
| `CASE-INT-044-04g` | evaluation evidence identityがunknown | evidence identityだけunknown/incompleteとしてLABO evaluation ownerへ戻す。 |
| `CASE-INT-044-04b` | evaluation applicability/scopeがunknown | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-044-04c` | evaluation statusが未観測 | 該当fieldだけunknown/incompleteとして推測を止め、LABO evaluation ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-044-04d` | BRAIN direct-update経路が候補に含まれる | 該当fieldだけunknown/incompleteとして推測を止め、BRAIN knowledge ownerへ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-044-04e` | generic candidateの対象scopeが未宣言 | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-044-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-044-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-044-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |

### CASE-INT-045-01 — source-bound正常（AC-INT-045-01）

入力: Product Core meaning conflict/gap/improvement candidate、source revision、target identity。出力: 該当Product Core向けbackflow candidate。canonical変更はProduct Core owner。責務: 該当Product Core owner; target不明ならunrouted。

**期待oracle:** Product Core issueを該当product/revision/ownerに結ぶbackflow candidateを作り、正本変更はownerに残す。 L3に明記したowner/authorityとL11 R2187-01の当該親rowの正常条件を照合し、receiptの存在だけでは合格にしない。

### CASE-INT-045-02 — 親固有fieldの独立negative（AC-INT-045-02）

各行をCASE-INT-045-01の同一入力から作り、他fieldは有効な正常値に固定して一変数だけを変える。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-045-02a` | Product Core target identityを欠落 | 変異fieldだけを不成立として保持し、INTELLIGENCE candidate owner（unroutedとして保持）へ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-045-02b` | target product revisionを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerが判明するまでunroutedのまま保持する。他の正常source/operationは維持する。 |
| `CASE-INT-045-02c` | source meaning/conflict evidenceを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerが判明するまでunroutedのまま保持する。他の正常source/operationは維持する。 |
| `CASE-INT-045-02d` | 誤ったProduct Core ownerへrouting | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerが判明するまでunroutedのまま保持する。他の正常source/operationは維持する。 |
| `CASE-INT-045-02e` | INTELLIGENCEがProduct Core正本を変更 | 変異fieldだけを不成立として保持し、該当Product Core ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-045-02f` | candidateを既決修正として扱う | 変異fieldだけを不成立として保持し、INTELLIGENCE candidate ownerへ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-045-02g` | 未選択connectorを必須依存として提案へ追加 | 変異fieldだけを不成立として保持し、INTELLIGENCE candidate owner（unrouted保持）へ不足情報を戻す。無関係な正常field/operationは保持する。 |
| `CASE-INT-045-02h` | source identityを欠落 | 当該一項目だけをinvalid/incompleteにし、完了/権限/状態変更へ昇格させない。理由と不足fieldを特定し、該当Product Core ownerが判明するまでunroutedのまま保持する。他の正常source/operationは維持する。 |
| `CASE-INT-045-02i` | source revisionを欠落 | revisionだけinvalid/incompleteにし、適切なProduct Core ownerが判明するまでunrouted保持する。 |
| `CASE-INT-045-02j` | source scopeを欠落 | scopeだけinvalid/incompleteにし、適切なProduct Core ownerが判明するまでunrouted保持する。 |

### CASE-INT-045-03 — 未見入力の親oracle（AC-INT-045-03）

入力: 未見product identityでは、owner名の明示だけでは対象Product Coreを識別した扱いにせず、まずunrouted/unidentifiedのまま保持する。既知対象でsource/revision/scopeが照合できるnormalはCASE-INT-045-01で別確認する。

期待: この親のsource identity/revision/scopeとownerを保つ。正常に照合できない情報を補完せず、該当fieldだけをAC-INT-045-04のunknown変異として別に扱う。

### CASE-INT-045-04 — fieldごとのunknown/未宣言/範囲外（AC-INT-045-04）

各行は独立したfixtureであり、他のsource/fieldはCASE-INT-045-01の有効値を保つ。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-045-04a` | target product identityがunknown | 該当fieldだけunknown/incompleteとして推測を止め、INTELLIGENCE candidate owner（unroutedとして保持）へ戻す。無関係な正常source/operationは保持する。 |
| `CASE-INT-045-04b` | Product Core ownerが特定不能 | 該当fieldだけunknown/incompleteとして推測を止め、unroutedとして保持し、ownerを創作しない。無関係な正常source/operationは保持する。 |
| `CASE-INT-045-04c` | source identityがunknown | identityだけunknownとしてowner名があってもunrouted保持する。 |
| `CASE-INT-045-04f` | source revisionがunknown | revisionだけunknown/incompleteとしてunrouted保持する。 |
| `CASE-INT-045-04g` | source scopeがunknown | scopeだけunknown/incompleteとしてunrouted保持する。 |
| `CASE-INT-045-04d` | meaning conflictの根拠がunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当Product Core ownerが特定されるまでunroutedのまま保持する。無関係な正常source/operationは保持する。 |
| `CASE-INT-045-04e` | 選択connector contractがunknown | 該当fieldだけunknown/incompleteとして推測を止め、該当CONNECT contract ownerへ戻す。無関係な正常source/operationは保持する。 |

### 共通HARNESS-L2-010/011 pack — 個別field negative（AC-INT-045-02）

この固定親の各対象operationで共通HARNESS-L2-010/011 packを照合する。L2-017は036〜039各接続のadmitted contractに依存する。以下は各々別fixtureで、一度にpack field一つだけを変え、親固有source authorityは有効のままにする。pack不成立なら当該親の成立を未完了に保ち、HARNESS pack/contract ownerへ戻す。無関係なoperationは継続する。

| CASE | 単独変異 | 期待結果・戻し先 |
|---|---|---|
| `CASE-INT-045-05a` | pack identityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05b` | contract revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05c` | artifact revisionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05d` | artifact digestを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05e` | dependency versionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05f` | declared compatibilityを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05g` | exchange contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05h` | update contractを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05i` | rollback conditionを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05j` | pack scopeを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05k` | provenanceを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05l` | contract revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05m` | artifact revisionだけをstaleにする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05n` | artifact digestだけを一致しない値にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05o` | dependency versionだけを不一致にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05p` | 宣言済compatibility rangeは保持したまま入力version pairだけを範囲外にする | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05q` | provenanceだけを異なるsource identityへ結ぶ | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
| `CASE-INT-045-05r` | rollback contractだけを欠落 | pack照合だけをinvalid/incompleteとし、HARNESS-L2-010/011共通pack contractの定義ownerへ不足field/実値を戻す。親固有sourceのauthorityや別operationへ波及させない。 |
