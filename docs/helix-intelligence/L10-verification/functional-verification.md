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
