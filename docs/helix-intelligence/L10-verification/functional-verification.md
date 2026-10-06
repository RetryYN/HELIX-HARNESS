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

## Stage 3 — 採択親の機能検証case

状態: 静的fixture設計。実行、実測、L3承認を表さない。全caseは指定FR/ACに対応し、正常、列挙条件ごとの反例、未見正常・局所unknownを分離する。

| case ID | L3 FR | L3 AC | 入力fixture / mutation | 期待する観測結果 | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-001-01` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-01` | 開発・運用対象から新しいdomainをaddする正常fixture。 | 新identityを付け、固定enumや独立authorityにせずdomain編成候補として返す。 | 正常fixtureがAC-01のidentity/lifecycle oracleと異なれば不合格。 |
| `CASE-INTELLIGENCE-L10-001-02` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-01` | 既存domainをsplitし、旧identityと両方の新identityを結ぶ正常fixture。 | split前後のidentityとsplit relationを追跡可能に保持する。 | relationが別domainや履歴へ誤結合する場合は不合格。編成粒度・source不足はINTELLIGENCEのdomain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-03` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-01` | 複数domainをmergeする正常fixture。 | 旧identity群、新identity、merge relationと参照履歴を保持する。 | 旧identity履歴が消えるか別domainへ結ばれたら不合格。domain編成・関係不足はINTELLIGENCEのdomain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-04` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-01` | domainをretireする正常fixture。 | retired identityと参照可能な履歴を保持し、新しい操作へ混同しない。 | 退役履歴を消す、または既存参照を追跡不能にしたら不合格。履歴/source不足は該当domain編成ownerへ戻す。 |
| `CASE-INTELLIGENCE-L10-001-05` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | 他条件を正常に保ち、lifecycle対象のidentityだけを欠落させる。 | 対象identityとその関係だけを未確定にし、不足を特定する。 | identity欠落を補完・確定したら不合格。domain粒度・編成不足はINTELLIGENCE domain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-06` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | 他条件を正常に保ち、同じactive identityを別domainへ割り当てる衝突だけを注入する。 | 衝突したidentity関係だけを候補確定せず保留し、他の有効domain候補を保持する。 | 衝突を受入、または全編成を無関係に失敗させたら不合格。identity編成不足はINTELLIGENCE domain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-07` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | splitは有効だが、そのsplit relationだけを欠落させる。 | split後の未結合edgeだけunknownにし、domain追加など他の有効操作を保つ。 | split関係を推測・確定したら不合格。欠落関係はINTELLIGENCE domain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-08` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | mergeは有効だが、そのmerge relationだけを欠落させる。 | merge relationだけunknownにし、他のidentity/historyを保持する。 | merge関係を推測・確定、または無関係identityを変更したら不合格。relation不足はINTELLIGENCE domain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-09` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | 正常なsplitとretire履歴があるbaselineから、履歴参照先だけを別identityへ混同する。 | 混同した履歴relationだけ未確定にし、正しいlifecycle履歴を保つ。 | 履歴混同を確定、または有効な過去参照を消したら不合格。domain identity/lifecycleの再照合はINTELLIGENCE domain編成ownerへ戻す。 |
| `CASE-INTELLIGENCE-L10-001-10` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-02` | CASE-05〜09のうちidentity衝突とsplit relation欠落を同時に注入する併発fixture。 | 2つの問題を別理由・別edgeとして残し、無関係の正常domain lifecycleを維持する。 | 片方の変異だけ検出、両方を一つの曖昧理由へ隠す、または全正常関係を失えば不合格。双方のidentity/relation不足はINTELLIGENCE domain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-11` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-03` | 既存fixtureにないdomain名と有効なidentity、宣言済みsplit操作でdomain-uをdomain-u1/domain-u2へ分ける関係を持つheld-out正常例。 | 未見性だけでは拒否せず、同じlifecycle contractで関係を追跡する。 | 正常な未見domainを一律rejectまたは新authorityにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-001-12` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-03` | CASE-11の同じheld-out例からsplit後の片側identity relationだけを欠落させる局所unknown対照。 | 欠落edgeだけunknownにし、成立しているidentityと関係は候補として保持する。 | 未見性で全体reject、欠落edgeを推測補完、または有効部分も落としたら不合格。relation不足はdomain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-001-13` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 有効なdomain候補を固定enumの一員でなければ拒否する変異だけを与える。 | domain候補をenum外だけの理由で拒否しない。domain identityの意味/粒度がsourceから未確定ならdomain編成ownerへ返す。 | 未宣言enumを要求するか、根拠なしに意味を確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-001-14` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | domain追加をINTELLIGENCE外の独立authority追加として扱う変異だけを与える。 | 独立authorityを生成せず、domain編成candidateに留める。 | 新authorityを追加したら不合格。編成粒度不明はdomain編成へ戻す。 |
| `CASE-INTELLIGENCE-L10-002-01` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-01` | Domain Aに根拠付きUnderstand/Review、BにPlan、Cを未構成とする正常入力。 | domain別の宣言済み能力集合を返し、Cは未構成のまま保つ。 | 正常fixtureがAC-01のdomain別構成oracleと異なれば不合格。 |
| `CASE-INTELLIGENCE-L10-002-02` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-02` | AのReview capabilityだけ根拠を欠落させ、B/Cの他fieldは正常に保つ。 | AのReviewだけ未構成/unknownにし、不足はINTELLIGENCE判断設計ownerへ戻す。 | B/Cを巻き込む、根拠を推測する、または全能力をrejectしたら不合格。 |
| `CASE-INTELLIGENCE-L10-002-03` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-02` | Aの能力一つだけをBにも割り当てるdomain間流用変異。 | 流用されたBの能力だけ未構成に戻し、Aの有効能力は維持する。 | 別domain設定を根拠として受入したら不合格。source/責務不足は対象domainのINTELLIGENCE判断設計へ戻す。 |
| `CASE-INTELLIGENCE-L10-002-04` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-02` | Cの未構成capability一つだけを暗黙trueにする変異。 | Cの該当能力を未構成/unknownに保つ。 | 未宣言能力を有効として返したら不合格。能力source不足は該当domainのINTELLIGENCE判断設計へ戻す。 |
| `CASE-INTELLIGENCE-L10-002-05` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-02` | CASE-02〜04の根拠欠落、別domain流用、暗黙true化を併発させる。 | 各domain/capability問題を個別理由と状態で返し、有効な別設定は維持する。 | 異なる変異を単一の曖昧な理由にまとめる、または一つでも見逃したら不合格。各不足は該当domainのINTELLIGENCE判断設計へ戻す。 |
| `CASE-INTELLIGENCE-L10-002-06` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-03` | 既知domain fixtureにないDomain Dへ、根拠付きsubset capabilityだけを与えるheld-out正常例。 | subsetだけ構成し、未列挙の他能力は未構成にする。 | 未見性を理由に全domain reject、または他domainの能力を流用したら不合格。 |
| `CASE-INTELLIGENCE-L10-002-07` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-03` | CASE-06から一能力の根拠だけを欠落させる局所unknown対照。 | 欠落根拠の能力だけunknown/未構成とし、宣言済みsubsetを維持する。不足はINTELLIGENCE判断設計ownerへ戻す。 | 未見全体をreject、または根拠のない能力をtrueにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-003-01` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-01` | target、requirement/design revision、ticket/state、dependency/evidence/finding、worker/model/provider/environment、cost/budget/risk/time、known/unknownを互いに異なるsource identity/revisionで結ぶ正常join。 | source truthを変えず各fieldとrevision relationをSituation Modelへ結ぶ。 | source value改変、authority昇格、またはrequired relation脱落は不合格。 |
| `CASE-INTELLIGENCE-L10-003-02` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-02` | 他のjoinを正常に保ち、evidence sourceだけをmissingにする。 | evidence relationだけunknownとし、そのevidence source ownerへ再照合を返す。 | evidence source不在を推測補完、または他の一致sourceを失ったら不合格。 |
| `CASE-INTELLIGENCE-L10-003-03` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-02` | 他のsource/relationを正常に保ち、dependency source revisionだけstaleにする。 | dependency relationだけunknown/staleとして可視化し、dependency source ownerへ再照合を返す。 | 古いrevisionでjoin、または他のfieldを誤ってunknown化したら不合格。 |
| `CASE-INTELLIGENCE-L10-003-04` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-02` | risk valueの二source間の矛盾だけを注入する。 | risk relationだけunknown/contradictoryと表示し、両source ownerへ再照合を返す。 | 一方のsourceを根拠なく優先、または値を平均・補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-003-05` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-02` | dependency edgeの片側source relationだけを孤立させる。 | 孤立dependencyだけunknownとし、関係するdependency source ownerへ再照合を返す。 | 孤立edgeを接続推測、または無関係の有効edgeを落としたら不合格。 |
| `CASE-INTELLIGENCE-L10-003-06` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-02` | CASE-02の必須source missingとCASE-03のdependency staleを同時に注入する併発fixture。 | missingとstaleを別field/reasonで保持し、残るsource-consistent relationを維持する。各不足を該当source ownerへ返す。 | 一方を見逃す、または併発を一つの補完値へ潰したら不合格。 |
| `CASE-INTELLIGENCE-L10-003-07` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-03` | 未見worker/provider/environmentを含むが全required source identity/revisionとrelationsが一致するheld-out正常join。 | 未見値でも同契約で完全joinし、source truthを保持する。 | 未見属性だけを理由にrejectまたはauthorityへ昇格したら不合格。 |
| `CASE-INTELLIGENCE-L10-003-08` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-03` | CASE-07からdependency revisionだけ未取得にした局所unknown対照。 | dependency relationだけunknownとし、他sourceが揃うjoinを保持する。dependency source ownerへ再照合を返す。 | 未見全体をreject、またはdependencyを推測補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-004-01` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-01` | source-backed observation、そこから導くinterpretation、仮説、未取得fieldを同一recordに与える正常例。 | Fact/Interpretation/Hypothesis/Unknownを区別し、各々source/evidence/revisionへ結ぶ。 | 分類が一つでも欠落またはsourceと誤結合したら不合格。 |
| `CASE-INTELLIGENCE-L10-004-02` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-02` | 他分類を正常に保ち、Hypothesis labelだけをObserved Factへ変更する。 | 仮説をfactとして確定せず、その分類だけ不成立としてsource/evidence ownerへ戻す。 | 仮説のfact昇格を受け入れたら不合格。 |
| `CASE-INTELLIGENCE-L10-004-03` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-02` | fact値はあるが、そのsource identityだけを欠落させる。 | 影響fieldのみunknownとし、source ownerへ照合を戻す。他の分類は保持する。 | source identityを推測・補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-004-04` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-02` | source identityはあるが、対象revisionだけを欠落させる。 | 対象fieldをunknownとしsource ownerへrevisionを再照合する。 | revision欠落をcurrent扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-004-05` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-02` | 明示Unknownをsuccess/正常確定として扱う変異だけを注入する。 | unknownをunknownのまま残し、確定表示を拒否する。根拠不足はsource/evidence ownerへ戻す。 | unknownを成功扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-004-06` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-02` | Hypothesis-to-Fact変更とsource revision欠落を併発させる。 | 誤分類と出典不足を別々に報告し、正しい他分類は維持する。 | 併発を一理由へ隠す、またはunknownを確定したら不合格。分類/出典不足を該当source/evidence ownerへ返す。 |
| `CASE-INTELLIGENCE-L10-004-07` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-03` | 未見evidence typeだがsource locatorと観測内容が明示されたheld-out正常例。 | 同じ4分類契約を使い、source-backed factを保持する。 | 未見typeだけでrejectまたは新分類を発明したら不合格。 |
| `CASE-INTELLIGENCE-L10-004-08` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-03` | CASE-07からsource locatorだけを欠落させる局所unknown対照。 | locator欠落fieldだけunknownとし、観測内容がsource-backedである部分を維持する。該当locatorの提供元へ照合を戻す。 | 全record reject、またはsource不明fieldをfactとしたら不合格。 |
| `CASE-INTELLIGENCE-L10-005-01` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-01` | 承認済target/current requirement revision、HARNESS contract revision、BRAIN knowledge tuple、prerequisite/dependency/order、parallelizable work、expected result、risk condition/uncertainty、stop/fallbackを持つ正常plan input。 | 要求された関係を含むplan candidateを返し、ticket/assignmentを発行せずOS handoffとする。 | 必須fieldの欠落、またはcandidateをticket/assignmentへ昇格したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-02` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | 同一plan baselineでtarget requirementのapproval stateだけ未承認にする。 | planを確定せず未承認要件を示し、該当requirement ownerへ戻す。 | 未承認targetから確定planを返したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-03` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | 同一plan baselineでrequirement revisionだけstaleにする。 | stale revisionを使わずplanを保留し、requirement source ownerへ照合を戻す。 | 古いrequirement revisionでplanを確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-04` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | planの一prerequisite dependencyだけ欠落させる。 | 影響plan部分だけ未確定にし、dependency source ownerへ不足を返す。他の比較可能部分は保持する。 | 依存を推測補完またはticket発行したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-05` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | dependency edgeだけ循環し、他のplan fieldsは正常に保つ。 | 循環依存部分を未確定として関係source ownerへ戻す。 | 順序を捏造、循環を正常としたら不合格。循環edgeの意味は関係source ownerへ戻す。 |
| `CASE-INTELLIGENCE-L10-005-06` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | fallbackだけを欠落させる。 | fallback不足を理由に影響planを未確定にし、当該fallback条件を定めるrequirement ownerへ戻す。 | fallbackを自作してplan確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-07` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | target requirement未承認とdependency欠落を併発させる。 | 2不足を個別理由・sourceへ返し、有効なrisk/stop情報は保持する。 | 一方を見逃す、または両方を補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-08` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-03` | 未見dependency構成でもapproved target/current contractと全dependency revisionが宣言済みのheld-out正常例。 | 同一contractでcandidateを返し、未見性のみでrejectせずticketを作らない。 | 未見だけを理由に新gateを作る、またはticket化したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-09` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-03` | CASE-08からstop conditionだけを欠落させる局所unknown対照。 | stop不足の影響範囲だけ未確定として保ち、他の宣言済みplan fieldを保持する。source不足は該当source ownerへ戻す。 | 未見全体をreject、stop conditionを推測補完、またはticket化したら不合格。 |
| `CASE-INTELLIGENCE-L10-005-10` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 他入力を正常に保ちcurrent state sourceだけを欠落させる。 | stateを推測せずaffected plan部分だけ未確定にし、current state source ownerへ照合を戻す。 | 欠落stateを補完してplanを確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-01` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-01` | 同一scopeのcurrent Situation Model/change candidateから、要求・設計・dependency、regression、CI/integration、performance/release risk、Worker failure、cost/time各該当予測をsource evidenceに基づき作る正常例。 | 各predictionへassumption/evidence/uncertainty/falsificationを結び、future actualは未発生としてLABOへ渡す。 | 予測を実測事実、またはLABO評価済みと表示したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-02` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-02` | 他のprediction partsを正常に保ち、evidenceだけを欠落させる。 | 該当predictionだけunknown/未評価にし、source ownerへ再照合する。 | 根拠なしにpredictionを確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-03` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-02` | evidenceはあるが、反証可能条件falsificationだけを欠落させる。 | 該当predictionを確定せず、falsification不足を特定しsource ownerへ戻す。 | 反証条件なしで確定表示したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-04` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 一予測のassumptionだけを欠落させる。 | 該当predictionを未確定にし、assumption source ownerへ戻す。 | assumptionを暗黙補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-05` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 一予測のuncertaintyだけを欠落させる。 | uncertainty不足を保持し、確度を捏造せず該当source ownerへ戻す。 | 不確実性を隠して確定表示したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-05b` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 一予測のuncertaintyを根拠なく確定値へ偽装する。 | 元のuncertaintyを保持し、確度を捏造せず該当source ownerへ戻す。 | 不確実性を隠して確定表示したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-06` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-02` | LABOの後続actual measurementをprediction値へ上書きする変異だけを与える。 | predictionとactual resultを分離し、実測は別LABO recordのまま保持する。 | 実測値で事前predictionを上書きしたら不合格。actual measurementの責務はLABOに残す。 |
| `CASE-INTELLIGENCE-L10-006-07` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-02` | evidence欠落とfalsification欠落を同時に注入する併発fixture。 | 両不足を別々に示し、該当predictionだけunknown/未評価、他の根拠済みpredictionを維持する。 | 片方を見逃す、または曖昧な一理由へ統合したら不合格。各欠落はそれぞれのsource ownerへ再照合する。 |
| `CASE-INTELLIGENCE-L10-006-08` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-03` | 未見prediction targetでも同一scopeのcurrent state/evidence、assumption、uncertainty、falsificationが揃うheld-out正常例。 | 同じprediction contractを適用し、実測は未発生として保持する。 | 未見性のみでreject、またはactualを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-09` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-03` | CASE-08からfalsification sourceだけを欠落させる局所unknown対照。 | 反証条件だけunknownとして該当source ownerへ照合を戻し、成立した他のprediction fieldを保持する。 | 未見全体reject、またはfalsificationを推測補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-006-10` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | current Situation Model source revisionだけをstaleにし、predictionの他fieldは保つ。 | stale sourceを使わず影響predictionのみunknown/未評価にして該当source ownerへ照合する。 | stale stateから予測を確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-007-01` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-01` | episode内の複数source・反証を評価する診断candidate。repair実行、長期効果評価は生成しない。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。該当source ownerへ追加観測、長期効果はLABO、repair実行/assignmentは本親から生成しない。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-007-02a` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | 同一正常baselineから独立変異: 単独相関だけを入力し、独立sourceを除く。 | 相関だけではroot cause確定を拒みprobable/unknownを保つ 戻し先: episode evidence不足は該当source ownerへ照合し、追加観測が必要なら該当sourceへ観測要求を返す。終了episodeの長期効果はLABOへ返す。repair実行/assignmentはL2-007から生成しない。 | 「単独相関だけを入力し、独立sourceを除く」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-007-02b` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | 同一正常baselineから独立変異: counterevidenceを一つ欠落。 | 反証不足を表示し確定度を上げない 戻し先: 反証不足は該当sourceへ追加観測要求を返してprobable/unknownを保つ。終了episodeの長期効果はLABOへ返す。repair実行/assignmentはL2-007から生成しない。 | 「counterevidenceを一つ欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-007-02c` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 同一正常baselineから独立変異: episode identityを別episodeへ変更。 | episode外証拠を分離し対象diagnosisだけunknown 戻し先: episode identity不一致は該当sourceへ識別・観測要求を返し、終了episodeの長期効果はLABOへ返す。repair実行/assignmentはL2-007から生成しない。 | 「episode identityを別episodeへ変更」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-007-02d` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 同一正常baselineから独立変異: episode source revisionをstale化。 | 該当根拠のみ無効としてsource ownerへ戻す 戻し先: stale episode sourceはそのsourceへ再照合を返し、終了episodeの長期効果はLABOへ返す。repair実行/assignmentはL2-007から生成しない。 | 「episode source revisionをstale化」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-007-02e` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | 同一正常baselineから独立変異: diagnosisからrepair実行済み状態を生成。 | diagnosis candidateを未実施のまま保ち、誤った実行状態を除外する。repair/assignmentの宛先をINTELLIGENCEから生成しない。終了episodeの長期効果はLABOへ返す。 | 「diagnosisからrepair実行済み状態を生成」による誤りを正常とする、実行状態を生成する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-007-02f` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | 同一正常baselineから独立変異: diagnosisからLABO長期評価を生成。 | 長期効果を生成せずLABO責務へ残す 戻し先: 長期評価はLABOへ返し、INTELLIGENCEのepisode diagnosisへ混ぜない。 | 「diagnosisからLABO長期評価を生成」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-007-02z` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | 同一正常baselineで併発fixture: episode外証拠混入+counterevidence欠落を同時投入し、両理由を別々に保持。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。該当source ownerへ追加観測、長期効果はLABO、repair実行/assignmentは本親から生成しない。戻し先: episode外evidenceとcounterevidence不足はそれぞれのsource ownerへ観測要求として返す。終了episodeの長期効果はLABOへ返し、repair実行/assignmentはL2-007から生成しない。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-007-03` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-03` | 新episode ep-u7/scope-u7/rev-u7へ、独立のsymptom/error/stall観測obs-a/obs-b、候補原因cause-uと反証obs-c、追加観測案を結ぶ。全観測は同episode/source revisionへ追跡可能。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-007-04` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-03` | CASE-INTELLIGENCE-L10-007-03からobs-cのsource locatorだけをmissingにする。他のsource/revision/scopeは正常。 | 診断の反証根拠だけunknown/probableを保ち、obs-a/obs-bと追加観測案を保持してその観測source ownerへ返す。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-008-01` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-01` | 一致するtarget HEAD/scopeに結ぶreview finding candidate。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。対象artifactの既存ownerへ戻す。acceptance/merge/releaseは既存authorityへ残す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-008-02a` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: target HEADを別revisionへ変更。 | findingを対象revisionへ適用せず再照合へ戻す 戻し先: 対象artifactの既存owner。 | 「target HEADを別revisionへ変更」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02b` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: review scopeを対象外へ変更。 | scope mismatchとして該当範囲だけ未確定 戻し先: 対象artifactの既存owner。 | 「review scopeを対象外へ変更」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02c` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: reproduction evidenceを欠落。 | findingを未再現として対象ownerへ戻す 戻し先: 対象artifactの既存owner。 | 「reproduction evidenceを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02d` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: counterexampleを欠落。 | 反例未取得としてfindingを未確定にする 戻し先: 対象artifactの既存owner。 | 「counterexampleを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02e` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: free-text routeでmerge状態を生成。 | 昇格を拒否し候補findingのまま保持 戻し先: 対象artifactの既存owner。 | 「free-text routeでmerge状態を生成」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02e2` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: free-text routeでrequirement change状態を生成。 | 昇格を拒否し候補findingのまま保持 戻し先: 対象artifactの既存owner。 | 「free-text routeでrequirement change状態を生成」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02e3` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: free-text routeでrelease状態を生成。 | 昇格を拒否し候補findingのまま保持 戻し先: 対象artifactの既存owner。 | 「free-text routeでrelease状態を生成」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02e4` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineから独立変異: free-text routeでacceptance状態を生成。 | 昇格を拒否し候補findingのまま保持 戻し先: 対象artifactの既存owner。 | 「free-text routeでacceptance状態を生成」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-008-02z` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-02` | 同一正常baselineで併発fixture: HEAD mismatch+counterexample欠落を同時投入し、両方を別理由で返す。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。対象artifactの既存ownerへ戻す。acceptance/merge/releaseは既存authorityへ残す。戻し先: 対象artifactの既存owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-008-03` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-03` | 新target artifact art-u8/HEAD-h8/scope-u8にfinding-f8、severity、evidence-e8、reproduction-r8、counterexample-c8、suggested routeを結ぶ。通常例とは別artifactで全参照が適用可能。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-008-04` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-03` | CASE-INTELLIGENCE-L10-008-03からreproduction-r8のsource locatorだけをmissingにする。他のsource/revision/scopeは正常。 | 当該findingの再現部分だけincompleteにし、他finding fieldを保持してartifact/evidence ownerへ追加材料を返す。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-009-01` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-01` | target HEAD/authority/producerと各evidenceを結ぶtyped audit finding candidate。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。不明なsourceはそのsource owner、AAFD/UIL/TER等の判断は既存責務ownerへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-009-02a` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | 同一正常baselineから独立変異: authority revisionを不一致にする。 | authority結合をunknownにし該当authority ownerへ戻す 戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 「authority revisionを不一致にする」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-009-02b` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 同一正常baselineから独立変異: producer identityを欠落。 | producer不明としてfinding未確定 戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 「producer identityを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-009-02c` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | 同一正常baselineから独立変異: evidence provenanceを欠落。 | provenance欠落を示しsource ownerへ戻す 戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 「evidence provenanceを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-009-02d` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 同一正常baselineから独立変異: reproductionを欠落。 | 再現未確認のfindingとして保つ 戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 「reproductionを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-009-02e` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 同一正常baselineから独立変異: falsificationを欠落。 | 反証未確認の範囲だけunknown 戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 「falsificationを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-009-02f` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | 同一正常baselineから独立変異: free textでauthority/statusを変更。 | 自由文からauthorityを生成しない 戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 「free textでauthority/statusを変更」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-009-02z` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | 同一正常baselineで併発fixture: authority mismatch+producer identity欠落を同時投入し両方のunknownを維持。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。不明なsourceはそのsource owner、AAFD/UIL/TER等の判断は既存責務ownerへ戻す。戻し先: 該当authority/source owner。AAFD/UIL/TER判断は既存責務owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-009-02g` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | 正常audit fixtureからtarget HEADだけを欠落する。 | findingを対象HEADへ結び付けず、該当artifact ownerへ再照合を返す。 | target HEADを推測補完し、HEAD未特定のfindingをcurrentとして受け入れたら不合格。 |
| `CASE-INTELLIGENCE-L10-009-02g2` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-02` | 正常audit fixtureからtarget HEADだけを別HEADへ変更する。 | findingを対象HEADへ結び付けず、該当artifact ownerへ再照合を返す。 | 別HEADのfindingをcurrent authority/evidenceとして受け入れたら不合格。 |
| `CASE-INTELLIGENCE-L10-009-03` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-03` | 新mechanism input mech-u9/HEAD-h9へauthority-a9、producer-p9、design/runtime/projection/responsibility source、evidence-e9/reproduction-r9/falsification-f9を別edgeで結ぶ。既存owner責務を保持する。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-009-04` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-03` | CASE-INTELLIGENCE-L10-009-03からevidence-e9のsource locatorだけをmissingにする。他のsource/revision/scopeは正常。 | evidence edgeだけunknownとして該当mechanism source ownerへ照合を戻し、HEAD/producerと他edgeを保持する。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-011-01` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-01` | 共通corpus/responsibility scopeと評価条件revisionを揃え、current/candidateそれぞれのmodel/provider実行版を記録して軸別比較する。候補実行版は異なってよい。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。corpus/scope/評価条件のsource mismatchは比較不能としてINTELLIGENCE判断へ戻す。実行版/結果版の不一致は各実行記録ownerへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-011-02a` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: corpus revisionだけを変える。 | corpus不一致の比較だけをunknownにする 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「corpus revisionだけを変える」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02b` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: responsibility scopeだけを変える。 | scope不一致の比較だけをunknownにする 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「responsibility scopeだけを変える」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02c` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: 共通評価条件revisionだけを変える。 | 比較条件不一致として該当比較を止める 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「共通評価条件revisionだけを変える」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02d` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: 一方のmodel/provider execution revisionを欠落。 | その候補の実行版をunknownにし比較不能 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「一方のmodel/provider execution revisionを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02e` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: 宣言execution revisionと結果に記録された実行版を不一致にする。 | その結果だけを無効/unknownとし実行記録ownerへ戻す 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「宣言execution revisionと結果に記録された実行版を不一致にする」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02f` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: 有効なcurrent/candidate execution revisionsが異なることだけを理由に比較を拒否する。 | 異なる実行版を各々表示し、共通条件が揃うmetricは比較可能に保つ 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「有効なcurrent/candidate execution revisionsが異なることだけを理由に比較を拒否する」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02g` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineから独立変異: metricをまとめて単一winnerへ変換。 | 軸別結果を保持しwinner/自動切替を出さない 戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 「metricをまとめて単一winnerへ変換」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-011-02z` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同一正常baselineで併発fixture: corpus mismatch+execution/result revision mismatchを併発し別々の比較不能理由を示す。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。corpus/scope/評価条件のsource mismatchは比較不能としてINTELLIGENCE判断へ戻す。実行版/結果版の不一致は各実行記録ownerへ戻す。戻し先: 共通比較条件の不一致はINTELLIGENCE比較owner、実行版/結果版不一致は実行記録owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-011-03` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-03` | 未見provider pair prov-u11a/prov-u11bの実行版run-a/run-bを個別記録し、同corpus-cu11/responsibility-scope-su11/評価条件rev-e11へ両結果を結ぶ。findings/FP/miss/reproducibility/latency/costは軸別に与える。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-011-04` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-03` | CASE-INTELLIGENCE-L10-011-03からprov-u11bのcost観測だけをmissingにする。他のsource/revision/scopeは正常。 | costだけ未評価とし、比較可能な他metricと各実行版を保持する。costの実行記録sourceへ不足を返しwinner/自動切替を生成しない。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-012-01` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-01` | 既知・probable・uncertain・unknown・contradictoryと必要情報をfield単位で返す。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。各不足source ownerまたは必要なDiscovery/test/review/human decisionへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-012-02a` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-02` | 同一正常baselineから独立変異: unknownをsafeへ変換。 | unknownを保つ 戻し先: 該当source owner、または必要なDiscovery/test/review/human decisionの既存owner。 | 「unknownをsafeへ変換」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-012-02b` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-02` | 同一正常baselineから独立変異: unknownをsuccessへ変換。 | successを生成しない 戻し先: 該当source owner、または必要なDiscovery/test/review/human decisionの既存owner。 | 「unknownをsuccessへ変換」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-012-02c` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-02` | 同一正常baselineから独立変異: unknownをno-issueへ変換。 | no-issueを生成しない 戻し先: 該当source owner、または必要なDiscovery/test/review/human decisionの既存owner。 | 「unknownをno-issueへ変換」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-012-02d` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-02` | 同一正常baselineから独立変異: contradictory evidenceを削除。 | 対立状態と両sourceを保持 戻し先: 該当source owner、または必要なDiscovery/test/review/human decisionの既存owner。 | 「contradictory evidenceを削除」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-012-02e` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 同一正常baselineから独立変異: missing fieldを補完済みにする。 | 不足fieldを特定しownerへ戻す 戻し先: 該当source owner、または必要なDiscovery/test/review/human decisionの既存owner。 | 「missing fieldを補完済みにする」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-012-02z` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-02` | 同一正常baselineで併発fixture: unknownをsuccessへ変換しつつcontradictory sourceを隠す併発変異を両方検出。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。各不足source ownerまたは必要なDiscovery/test/review/human decisionへ戻す。戻し先: 該当source owner、または必要なDiscovery/test/review/human decisionの既存owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-012-03` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-03` | 新判断candidate j-u12/scope-u12/rev-u12へ観測backed field-a、推論field-b、対立source対field-cを与え、known/probable/contradictoryと各必要追加証拠を別fieldで記録する。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-012-04` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-03` | CASE-INTELLIGENCE-L10-012-03からfield-bの推論根拠sourceだけをmissingにする。他のsource/revision/scopeは正常。 | field-bだけunknownとしてそのsource ownerへ追加証拠照合を戻し、known field-aとcontradictory field-cの両sourceを保つ。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-013-01` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-01` | 重要判断をinput/rule/knowledge/observation/assumption/model-provider-version/reasoning/uncertainty/alternatives/data-use classへrevision-boundで結ぶ。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。欠落根拠は該当source ownerへ。data-use permissionは固定sourceで特定されるauthority ownerへ戻し、不明ならunknownを保つ。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-013-02a` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | 同一正常baselineから独立変異: input revisionを一つ欠落。 | 該当input edgeだけunknown 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「input revisionを一つ欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02b` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | 同一正常baselineから独立変異: rule revisionを一つ欠落。 | rule source ownerへ照合 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「rule revisionを一つ欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02c` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | 同一正常baselineから独立変異: BRAIN knowledge revisionを一つ欠落。 | knowledge edgeだけunknown、BRAINへ戻す 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「BRAIN knowledge revisionを一つ欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02d` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 同一正常baselineから独立変異: observationとassumptionを混同。 | 観測/仮定を分け直す 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「observationとassumptionを混同」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02e` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 同一正常baselineから独立変異: model/provider/version edgeを欠落。 | 実行identityをunknownにする 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「model/provider/version edgeを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02f` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 同一正常baselineから独立変異: reasoning edgeを欠落。 | 理由の不足を表示 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「reasoning edgeを欠落」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02g` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 同一正常baselineから独立変異: uncertaintyを落とす。 | 確度を確定せず不確実性を保持 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「uncertaintyを落とす」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02h` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | 同一正常baselineから独立変異: rejected alternativeを一つ省略。 | 省略alternativeをtrace不足として示す 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「rejected alternativeを一つ省略」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02i` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | 同一正常baselineから独立変異: data-use classからtraining permissionを推論。 | permission生成を拒否し固定sourceで特定されるauthority ownerへ戻す 戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 「data-use classからtraining permissionを推論」による誤りを内容oracleに照らさず正常とする、該当fieldを推測補完する、または成立した他fieldまで失えば不合格。 |
| `CASE-INTELLIGENCE-L10-013-02z` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-02` | 同一正常baselineで併発fixture: rule revision欠落+alternative省略を併発し各edge不足を別記。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。欠落根拠は該当source ownerへ。data-use permissionは固定sourceで特定されるauthority ownerへ戻し、不明ならunknownを保つ。戻し先: 該当input/rule/BRAIN source owner。data-use permissionは固定sourceで特定されるauthority owner（不明ならunknown）。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-013-03` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-03` | 新candidate j-u13/rev-u13へinput revisions/rules/BRAIN/observations/assumptions/model-provider-version/reasoning/uncertainty/rejected alternativesをそれぞれ独立sourceへ結ぶ。sourceが提供するdata-use classも記録しtraining許可を生成しない。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-013-04` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-03` | CASE-INTELLIGENCE-L10-013-03からrejected alternative alt-u13のsource locatorだけをmissingにする。他のsource/revision/scopeは正常。 | alt-u13の理由だけunknownとして該当source ownerへ照合を戻し、他trace edgeを保持する。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-014-01` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-01` | Bot identityをINTELLIGENCEと分離し、purpose/scope/input/output/allowed action/stop/versionをsource-bound manifest candidateにする。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。manifest/scope不足は通常のINTELLIGENCE判断候補、assignment/実作業はOSへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02a` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: Bot identityをINTELLIGENCE identityと衝突させる。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「Bot identityをINTELLIGENCE identityと衝突させる」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02b` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: purposeを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「purposeを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02c` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: scopeを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「scopeを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02d` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: inputを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「inputを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02e` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: outputを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「outputを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02f` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: allowed actionを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「allowed actionを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02g` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: stop conditionを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「stop conditionを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02h` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: versionを欠落。 | 該当manifest fieldを未完として通常INTELLIGENCE判断候補へ戻す。OS assignment/実作業を生成せず、他の正常fieldを保持する。 | 当該変異「versionを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02i` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineから独立変異: OS assignmentを生成。 | assignment生成を拒否し、OS assignment ownerへ戻す。manifestの正常fieldを保持する。 | 当該変異「OS assignmentを生成」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02z` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 同一正常baselineで併発fixture: scope欠落+stop condition欠落を併発しmanifest全体を権限化せず未完保持。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。manifest/scope不足は通常のINTELLIGENCE判断候補、assignment/実作業はOSへ戻す。戻し先: 通常のINTELLIGENCE判断候補。assignment/実作業はOS。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-014-02j` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからpurposeのsource値だけを別値にし、他の欄は一致させる。 | purpose mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-02k` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからscopeのsource値だけを別値にし、他の欄は一致させる。 | scope mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-02l` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからinputのsource値だけを別値にし、他の欄は一致させる。 | input mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-02m` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからoutputのsource値だけを別値にし、他の欄は一致させる。 | output mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-02n` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからallowed actionのsource値だけを別値にし、他の欄は一致させる。 | allowed action mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-02o` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからstop conditionのsource値だけを別値にし、他の欄は一致させる。 | stop condition mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-02p` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | 正常manifestからversionのsource値だけを別値にし、他の欄は一致させる。 | version mismatchとしてその欄の適用だけ未完にし、通常のINTELLIGENCE判断候補へ戻す。OS assignmentは生成しない。 | 各欄の不一致を個別に識別できなければ不合格。 |
| `CASE-INTELLIGENCE-L10-014-03` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-03` | 新task typeに対しBot bot-u14をINTELLIGENCE identityと分離し、反復可能な限定purpose/scope/input/output/allowed action/stop/version manifestを与える。candidate作成とOS assignment未取得を別状態にする。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-014-04` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-03` | CASE-INTELLIGENCE-L10-014-03からmanifestのstop conditionだけをmissingにする。他のsource/revision/scopeは正常。 | Bot manifestの適用を確定せず通常のINTELLIGENCE判断candidateへ戻し、他manifest fieldを保持する。OS assignmentを生成しない。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-01` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-01` | 独立episodeのpattern/reproducibility/machine-detectability/false-positive/scope/repairabilityを別軸評価してBot candidateに止める。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。履歴/再現/検出根拠不足は該当source ownerへ追加観測。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02a` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: pattern evidenceを欠落。 | pattern unknown 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「pattern evidenceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02b` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: reproducibility evidenceを欠落。 | 再現性unknown 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「reproducibility evidenceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02c` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: machine-detectability evidenceを欠落。 | 候補で停止し昇格せず、検出性unknown 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「machine-detectability evidenceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02d` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: false-positive evidenceを欠落。 | 誤検知軸unknown 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「false-positive evidenceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02e` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: scope evidenceを欠落。 | scope unknown 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「scope evidenceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02f` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: repairability evidenceを欠落。 | repairability unknown; trigger根拠にしない 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「repairability evidenceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02g` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: repairabilityだけを与え他軸を欠落。 | Bot candidate triggerを拒否 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「repairabilityだけを与え他軸を欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02h` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: 独立episode一件だけを与える。 | 恒久化せず単発として保留 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「独立episode一件だけを与える」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02i` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineから独立変異: 同一episodeを複製して複数件に見せる。 | 重複を独立episodeとして数えない 戻し先: 追加観測が必要な履歴/evidence source owner。 | 当該変異「同一episodeを複製して複数件に見せる」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02z` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 同一正常baselineで併発fixture: scope mismatch+false-positive evidence欠落を併発し各不足を別表示。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。履歴/再現/検出根拠不足は該当source ownerへ追加観測。戻し先: 追加観測が必要な履歴/evidence source owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02j` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからpattern evidenceだけを反証された内容へ変える。 | patternだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02j2` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからpattern evidenceだけを異scopeの根拠へ変える。 | patternだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02k` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからreproducibility evidenceだけを反証された内容へ変える。 | reproducibilityだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02k2` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからreproducibility evidenceだけを異scopeの根拠へ変える。 | reproducibilityだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02l` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからmachine-detectability evidenceだけを反証された内容へ変える。 | machine-detectabilityだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02l2` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからmachine-detectability evidenceだけを異scopeの根拠へ変える。 | machine-detectabilityだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02m` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからfalse-positive evidenceだけを反証された内容へ変える。 | false-positiveだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02m2` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからfalse-positive evidenceだけを異scopeの根拠へ変える。 | false-positiveだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02n` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからscope evidenceだけを反証された内容へ変える。 | scopeだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02n2` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからscope evidenceだけを異scopeの根拠へ変える。 | scopeだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02o` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからrepairability evidenceだけを反証された内容へ変える。 | repairabilityだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-02o2` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-02` | 正常episode setからrepairability evidenceだけを異scopeの根拠へ変える。 | repairabilityだけ未評価/不成立とし、他軸は保持して追加観測を該当history/evidence ownerへ戻す。 | 反証を隠す、または他軸で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-03` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-03` | 通常例と別の独立episode ep-u15a/ep-u15bを同scope-su15へ結び、failure pattern/reproduction/machine-detectability/false-positive/scope/repairability evidenceを軸別に与える。Bugbotはcandidateであり恒久採用を生成しない。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-015-04` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-03` | CASE-INTELLIGENCE-L10-015-03からmachine-detectability evidenceだけをmissingにする。他のsource/revision/scopeは正常。 | 機械判定性だけunknownとしてcandidateを保留し追加log/evidence観測へ返す。他の軸を採用証拠へ相殺しない。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-01` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-01` | candidateの9束縛と結果照合を分離し、結果は既存authority/OS assignment/Worker resultからだけ照合する。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。target/scope/副作用はsource owner、permission/実行はSECURITY/OS、要求意味差は上流ownerへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02a` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: target revisionを欠落。 | candidate未完 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「target revisionを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02b` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: actorを欠落。 | actor未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「actorを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02c` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: write-setを欠落。 | write boundary unknown 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「write-setを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02d` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: side effectを欠落。 | 副作用unknown 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「side effectを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02e` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: budgetを欠落。 | budget未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「budgetを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02f` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: deadlineを欠落。 | deadline未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「deadlineを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02g` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: retry条件を欠落。 | retry未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「retry条件を欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02h` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: impact scopeを欠落。 | scope未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「impact scopeを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02i` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: recoveryを欠落。 | recovery未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「recoveryを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02j` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: result targetをstale化。 | 結果を宣言targetへ結べず再照合 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「result targetをstale化」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02k` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: write-set外書込を投入。 | 逸脱として失敗/停止保持 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「write-set外書込を投入」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02l` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: 循環だけを投入。 | 再実行を許さず異常保持 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「循環だけを投入」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02l2` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: 二重実行だけを投入。 | 再実行を許さず異常保持 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「二重実行だけを投入」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02m` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: budget超過を投入。 | 超過を成功に丸めない 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「budget超過を投入」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02n` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: 未知side effectを投入。 | 副作用unknownとして結果未確定 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「未知side effectを投入」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02o` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineから独立変異: 要求/verification意味差を候補で確定。 | 確定を拒否し上流ownerへ差分返却 戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 当該変異「要求/verification意味差を候補で確定」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02z` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | 同一正常baselineで併発fixture: scope外書込+budget超過を併発し、どちらも独立した失敗として保持。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。target/scope/副作用はsource owner、permission/実行はSECURITY/OS、要求意味差は上流ownerへ戻す。戻し先: target/scopeのsource owner。permission/実行はSECURITY/OS、要求意味変更は上流owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02p` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからtarget revisionだけを不一致/別版へ変える。 | target revision mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | target revisionを持つ既存source ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02q` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからactorだけを不一致/別版へ変える。 | actor mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | actor authorityを持つSECURITYへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02r` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからwrite-setだけを不一致/別版へ変える。 | write-set mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | 固定L2:142/L11:77の該当source/SECURITY/OS ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02s` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからside effectだけを不一致/別版へ変える。 | side effect mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | 副作用/permissionを持つSECURITYへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02t` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからbudgetだけを不一致/別版へ変える。 | budget mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | budget契約を持つ既存ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02u` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからdeadlineだけを不一致/別版へ変える。 | deadline mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | deadline契約を持つ既存ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02v` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからretryだけを不一致/別版へ変える。 | retry mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | retry契約を持つ既存ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02w` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからimpact scopeだけを不一致/別版へ変える。 | impact scope mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | impact scopeを持つ既存ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-02x` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-02` | normal candidateからrecoveryだけを不一致/別版へ変える。 | recovery mismatchとしてcandidate該当fieldだけ未完にする。実結果/実行許可を生成しない。 | recovery契約を持つ既存ownerへ照合を戻さないまま確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-03` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-03` | 新限定problem prob-u16/target-rev-u16にactor、限定write-set、side effect、供給済budget/deadline/retry/impact/recoveryを結ぶ。既存authority/OS assignment/Worker resultはcandidateと別sourceとして明示する。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-016-04` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-03` | CASE-INTELLIGENCE-L10-016-03からside-effect sourceだけをmissingにする。他のsource/revision/scopeは正常。 | 副作用不明として修復候補の適用を停止し該当source ownerへ戻す。candidateの既知fieldを保持し、実行/包括write許可を生成しない。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-018-01` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-01` | current INTELLIGENCE judgmentと時点/scope付きLABO historical effectを分離する。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。historical evidenceはLABO、current conflictはcurrent source/ownerへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-018-02a` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-02` | 同一正常baselineから独立変異: 古いLABO outcomeをcurrent truthへ代入。 | current stateを上書きしない 戻し先: historical effectはLABO、current conflictはcurrent-state owner。 | 当該変異「古いLABO outcomeをcurrent truthへ代入」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-018-02b` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-02` | 同一正常baselineから独立変異: INTELLIGENCE自身が改善を採択。 | 自己採択を拒否し、採択は対象ownerの既存判断へ戻す。 | 当該変異「INTELLIGENCE自身が改善を採択」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-018-02b-labo-only` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-02` | 同一正常baselineでLABO historical evaluationだけを採択状態へ昇格し、他のcurrent judgment/OS registrationは変えない。 | LABO評価をhistorical evidenceのまま保ち採択しない。current judgment/authorityを変更せず、対象owner判断なしに変更済みとしない。長期改善評価はLABO、採択は対象ownerの既存判断へ戻す。 | LABO評価だけで長期改善を採択したら不合格。 |
| `CASE-INTELLIGENCE-L10-018-02c` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-02` | 同一正常baselineから独立変異: 対象owner判断なしに意味変更済みとする。 | 変更をcandidateのまま保留 戻し先: historical effectはLABO、current conflictはcurrent-state owner。 | 当該変異「対象owner判断なしに意味変更済みとする」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-018-02z` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-02` | 同一正常baselineで併発fixture: historical outcome昇格+自己採択を同時に試し各境界違反を特定。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。historical evidenceはLABO、current conflictはcurrent source/ownerへ戻す。戻し先: historical effectはLABO、current conflictはcurrent-state owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-018-03` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-03` | 新current judgment cur-u18/scope-su18/rev-cu18と、別の終了episode ep-u18のLABO historical evaluation hist-u18/rev-hu18を明示対応づける。current/historicalラベルを保持し両版を同一視しない。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-018-04` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-03` | CASE-INTELLIGENCE-L10-018-03からhist-u18のsource scopeだけをmissingにする。他のsource/revision/scopeは正常。 | historical effectだけ未評価としてLABOへ照合を戻し、current judgment/sourceを上書きせず保持する。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-019-01` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-01` | BRAIN knowledge applicabilityをsource-bound candidateとして評価し、正本はBRAIN、汎用評価はLABOへ残す。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。knowledge/source truthはBRAIN、一般化/評価はLABOへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02a` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineから独立変異: domain/scopeを対象外にする。 | 適用を拒みBRAINへ戻す 戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 当該変異「domain/scopeを対象外にする」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02b` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineから独立変異: Pattern sourceを欠落。 | 該当knowledge edge unknown 戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 当該変異「Pattern sourceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02c` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineから独立変異: Unit sourceを欠落。 | 該当knowledge edge unknown 戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 当該変異「Unit sourceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02d` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineから独立変異: Part sourceを欠落。 | 該当knowledge edge unknown 戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 当該変異「Part sourceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02e` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineから独立変異: INTELLIGENCEがBRAIN knowledgeを書き換える。 | 書換えを拒否しBRAINへ戻す 戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 当該変異「INTELLIGENCEがBRAIN knowledgeを書き換える」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02f` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineから独立変異: INTELLIGENCEがLABO評価を代行する。 | 評価を生成せずLABOへ戻す 戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 当該変異「INTELLIGENCEがLABO評価を代行する」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02z` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 同一正常baselineで併発fixture: scope mismatch+knowledge source欠落を併発し適用だけ保留。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。knowledge/source truthはBRAIN、一般化/評価はLABOへ戻す。戻し先: knowledge正本はBRAIN、一般評価はLABO。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02g` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 正常適用candidateのPattern source revisionだけを既存currentness条件上staleにする。他sourceは正常。 | 該当適用根拠だけunknownとしてBRAINへ照合を戻し、Unit/Partとcandidate状態を保つ。 | 古いsourceを現在の適用根拠にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-019-02h` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-02` | 今回のcandidate結果だけをBRAIN knowledgeの採用済み正本状態へ偽装する。他入力は正常。 | 候補とknowledge正本を分離し、採用状態を生成/変更せずBRAINの既存ownerへ照合を戻す。 | INTELLIGENCEの今回判断でknowledge正本の採用状態を確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-019-03` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-03` | 新current situation sit-u19にBRAIN Pattern-pu19/Unit-uu19/Part-tu19のidentity/revisionとapplicability/exception/counterexampleを結び、今回の適用candidateをknowledge正本と分離する。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-019-04` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-03` | CASE-INTELLIGENCE-L10-019-03からPattern-pu19のapplicability sourceだけをmissingにする。他のsource/revision/scopeは正常。 | そのknowledge適用だけunknownとしてBRAINへ照合を戻し、Unit/Partの既知sourceとcandidate/正本の区別を保持する。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-01` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-01` | Product Core meaningとtarget revisionを結んだ差分/backflow candidateを返す。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。meaningはProduct Core/要求/design authorityへ、source不足は該当ownerへ戻す。戻し先: Product Core/requirement/design authority owner。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02a` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 同一正常baselineから独立変異: meaning sourceを欠落。 | 差分根拠unknown 戻し先: Product Core/requirement/design authority owner。 | 当該変異「meaning sourceを欠落」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02b` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 同一正常baselineから独立変異: current/target revisionを異版同一視。 | 一致とせずrevision不明として戻す 戻し先: Product Core/requirement/design authority owner。 | 当該変異「current/target revisionを異版同一視」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02c` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 同一正常baselineから独立変異: 要求を直接変更する。 | 変更を拒否しownerへcandidate差分を返す 戻し先: Product Core/requirement/design authority owner。 | 当該変異「要求を直接変更する」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02c2` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 同一正常baselineから独立変異: designを直接変更する。 | 変更を拒否しownerへcandidate差分を返す 戻し先: Product Core/requirement/design authority owner。 | 当該変異「designを直接変更する」を正常/成立として通す、欠落値を推測補完する、または他の正常fieldまで変化させたら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02z` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 同一正常baselineで併発fixture: meaning source欠落+target revision不一致を併発し差分を確定しない。 | 併発した各異常を別々に検出し、成立している無関係fieldを維持する。meaningはProduct Core/要求/design authorityへ、source不足は該当ownerへ戻す。戻し先: Product Core/requirement/design authority owner。 | 一方の変異で他方を隠す、または正常条件を失敗fixtureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02d` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 正常meaning/backflow inputのProduct Core identityだけを別製品へ置換する。 | 別製品のmeaningを適用せず該当差分をcandidateのまま保持し、識別済み該当Product Core ownerへ照会する。 | 別製品sourceで対象差分を確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02e` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 正常meaning/backflow inputのowner locatorだけをunknownにする。 | 差分は保持しbackflow未routed/owner unknownを残す。ownerを推測せず識別できるProduct Core既存窓口への照会candidateに留める。 | ownerを創作、またはunknownから変更済みを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02f` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 正常candidate結果だけでProduct Core acceptance authorityを変更する。 | authority変更を拒否しProduct Coreの既存ownerへcandidate提示に留める。 | acceptance authorityをINTELLIGENCE判断で変更したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-02g` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-02` | 正常candidate結果だけでProduct Core固有meaningの正本を変更する。 | meaning変更を拒否し識別済みProduct Core ownerへcandidateを提示する。 | meaning正本を直接変更したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-03` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-03` | 新Product Core product-u20のrequirement/design/meaningとrev-u20、既存Product Core owner-o20へ差分candidate/backflow targetを結ぶ。各正本/acceptance authorityを保持する。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-020-04` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-03` | CASE-INTELLIGENCE-L10-020-03からbackflow target revisionだけをmissingにする。他のsource/revision/scopeは正常。 | 該当backflowをcandidateのまま未確定にして識別済みProduct Core ownerへ照会する。他のmeaning sourceを上書きしない。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-01` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-01` | 既決quality/order inputとscope-bound LABO evidence、LABO052と同一結果のreceiptを既存L2-010 proposalへ反映する。 | 固定source条件と入力scope/revisionを保持し、candidateの範囲だけを評価する。quality/orderの決定source ownerへ、evidenceはLABOへ、task/scope不足はOSへ戻す。 | normal oracleと異なる、または新authority/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-02a` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-02` | 同一正常baselineから独立変異: quality/order inputを未決状態にする。 | 新しい順位を作らず該当入力unknownとして、その判断を持つ既存ownerへ戻す。task/scopeとLABO evidenceは保持する。 | 未決入力から新しい順位を生成、または別ownerへ返したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-02b` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-02` | 同一正常baselineから独立変異: 適用境界外にする。 | 対象scopeの適用判断だけを保留し、その判断を持つ既存decision ownerへ戻す。quality/order decisionとLABO evidenceは保持する。 | scope外入力を適用、またはdecision/evidenceを無関係に未完化したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-02c` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-02` | 同一正常baselineから独立変異: LABO evidenceを欠落。 | evidence不足だけをLABOへ戻し、decisionとscopeを保持する。 | evidenceを推測補完、またはquality/order decision ownerへ誤返却したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-02z` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-02` | 同一正常baselineで併発fixture: 未決input+LABO evidence欠落を併発し成立fieldを保持したまま部分保留。 | 未決quality/order inputを既存decision source ownerへ、欠落LABO evidenceをLABOへそれぞれ返す。scope/taskと成立fieldは維持する。 | 2不足を一つへ統合、どちらかを見逃す、または別ownerへ返したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-03` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-03` | 新task tk-u67/scope-su67について既決quality/order入力decision-du67と適用scope/revision、同scopeのLABO evidence-eu67を既存L2-010 proposal field/provenanceへ対応づける。新順位/assignmentを生成しない。 | 対応ACのnormal oracleを同契約で照合し、未見identityだけで拒否しない。既存責務・candidate境界を保持する。 | 未見性だけで拒否、または未宣言条件/ownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-067-04` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-03` | CASE-INTELLIGENCE-L10-067-03からLABO evidence-eu67のsource locatorだけをmissingにする。他のsource/revision/scopeは正常。 | evidence部分だけunknownとしてLABOへ照合を戻し、既決decisionと既知proposal入力を保持する。 | unknownをsuccess/falseへ推測補完、または無関係な成立fieldまで停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-scope-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みscope source tupleだけのidentityを変異。他の5 sourceとpack/scopeは同一。 | scopeの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しscope ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-scope-revision` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みscope source tupleだけのrevisionを変異。他の5 sourceとpack/scopeは同一。 | scopeの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しscope ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-scope-digest` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みscope source tupleだけのdigestを変異。他の5 sourceとpack/scopeは同一。 | scopeの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しscope ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-unselected-scope` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | scopeを明示的に非選択としたfixtureで当該source revisionだけ変更。 | scope依存を未観測のまま保持しselected facetはstaleにしない。 | 非選択sourceをselected/current/successと推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selection-unknown-scope` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | scope sourceの選択有無だけunknownにする。 | 該当facetのみunknownとし適用操作を保留、他の明示選択sourceは保持。ownerが特定できなければownerを作らない。 | 非選択/selected/fresh/staleのいずれかへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-requirement-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みrequirement source tupleだけのidentityを変異。他の5 sourceとpack/scopeは同一。 | requirementの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持し該当requirement ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-requirement-revision` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みrequirement source tupleだけのrevisionを変異。他の5 sourceとpack/scopeは同一。 | requirementの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持し該当requirement ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-requirement-digest` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みrequirement source tupleだけのdigestを変異。他の5 sourceとpack/scopeは同一。 | requirementの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持し該当requirement ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-unselected-requirement` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | requirementを明示的に非選択としたfixtureで当該source revisionだけ変更。 | requirement依存を未観測のまま保持しselected facetはstaleにしない。 | 非選択sourceをselected/current/successと推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selection-unknown-requirement` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | requirement sourceの選択有無だけunknownにする。 | 該当facetのみunknownとし適用操作を保留、他の明示選択sourceは保持。ownerが特定できなければownerを作らない。 | 非選択/selected/fresh/staleのいずれかへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-template-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みtemplate source tupleだけのidentityを変異。他の5 sourceとpack/scopeは同一。 | templateの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しtemplate ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-template-revision` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みtemplate source tupleだけのrevisionを変異。他の5 sourceとpack/scopeは同一。 | templateの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しtemplate ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-template-digest` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みtemplate source tupleだけのdigestを変異。他の5 sourceとpack/scopeは同一。 | templateの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しtemplate ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-unselected-template` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | templateを明示的に非選択としたfixtureで当該source revisionだけ変更。 | template依存を未観測のまま保持しselected facetはstaleにしない。 | 非選択sourceをselected/current/successと推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selection-unknown-template` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | template sourceの選択有無だけunknownにする。 | 該当facetのみunknownとし適用操作を保留、他の明示選択sourceは保持。ownerが特定できなければownerを作らない。 | 非選択/selected/fresh/staleのいずれかへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-skill-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みskill source tupleだけのidentityを変異。他の5 sourceとpack/scopeは同一。 | skillの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しskill ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-skill-revision` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みskill source tupleだけのrevisionを変異。他の5 sourceとpack/scopeは同一。 | skillの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しskill ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-skill-digest` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みskill source tupleだけのdigestを変異。他の5 sourceとpack/scopeは同一。 | skillの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しskill ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-unselected-skill` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | skillを明示的に非選択としたfixtureで当該source revisionだけ変更。 | skill依存を未観測のまま保持しselected facetはstaleにしない。 | 非選択sourceをselected/current/successと推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selection-unknown-skill` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | skill sourceの選択有無だけunknownにする。 | 該当facetのみunknownとし適用操作を保留、他の明示選択sourceは保持。ownerが特定できなければownerを作らない。 | 非選択/selected/fresh/staleのいずれかへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-model-catalog-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みmodel-catalog source tupleだけのidentityを変異。他の5 sourceとpack/scopeは同一。 | model-catalogの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しmodel-catalog ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-model-catalog-revision` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みmodel-catalog source tupleだけのrevisionを変異。他の5 sourceとpack/scopeは同一。 | model-catalogの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しmodel-catalog ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-model-catalog-digest` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みmodel-catalog source tupleだけのdigestを変異。他の5 sourceとpack/scopeは同一。 | model-catalogの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しmodel-catalog ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-unselected-model-catalog` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | model-catalogを明示的に非選択としたfixtureで当該source revisionだけ変更。 | model-catalog依存を未観測のまま保持しselected facetはstaleにしない。 | 非選択sourceをselected/current/successと推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selection-unknown-model-catalog` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | model-catalog sourceの選択有無だけunknownにする。 | 該当facetのみunknownとし適用操作を保留、他の明示選択sourceは保持。ownerが特定できなければownerを作らない。 | 非選択/selected/fresh/staleのいずれかへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-allowlist-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みallowlist source tupleだけのidentityを変異。他の5 sourceとpack/scopeは同一。 | allowlistの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しallowlist ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-allowlist-revision` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みallowlist source tupleだけのrevisionを変異。他の5 sourceとpack/scopeは同一。 | allowlistの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しallowlist ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selected-allowlist-digest` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 正常選択済みallowlist source tupleだけのdigestを変異。他の5 sourceとpack/scopeは同一。 | allowlistの該当candidate facetだけstale、他5 facetとcandidate identity/versionを保持しallowlist ownerへ照合を返す。 | 別sourceへ波及、旧facetをcurrent扱い、又は無根拠にcandidate全体を失効したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-unselected-allowlist` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | allowlistを明示的に非選択としたfixtureで当該source revisionだけ変更。 | allowlist依存を未観測のまま保持しselected facetはstaleにしない。 | 非選択sourceをselected/current/successと推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-selection-unknown-allowlist` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | allowlist sourceの選択有無だけunknownにする。 | 該当facetのみunknownとし適用操作を保留、他の明示選択sourceは保持。ownerが特定できなければownerを作らない。 | 非選択/selected/fresh/staleのいずれかへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-pin-bytes-01` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureの072-004 L2 original raw spanだけをbytes mismatchにする。 | 当該partだけ不一致/未完としてsource pin ownerへ返し、他5 partのmeaning/statusは保持。 | full-file hash、他part、又はcomposite labelだけで当該spanを通したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-pin-bytes-02` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureの072-004 L2 supplement raw spanだけをbytes mismatchにする。 | 当該partだけ不一致/未完としてsource pin ownerへ返し、他5 partのmeaning/statusは保持。 | full-file hash、他part、又はcomposite labelだけで当該spanを通したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-pin-bytes-03` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureの072-004 L11 original raw spanだけをbytes mismatchにする。 | 当該partだけ不一致/未完としてsource pin ownerへ返し、他5 partのmeaning/statusは保持。 | full-file hash、他part、又はcomposite labelだけで当該spanを通したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-pin-bytes-04` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureの072-004 L11 supplement raw spanだけをbytes mismatchにする。 | 当該partだけ不一致/未完としてsource pin ownerへ返し、他5 partのmeaning/statusは保持。 | full-file hash、他part、又はcomposite labelだけで当該spanを通したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-pin-bytes-05` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureの072-005 L2 NFR-34 supplement raw spanだけをbytes mismatchにする。 | 当該partだけ不一致/未完としてsource pin ownerへ返し、他5 partのmeaning/statusは保持。 | full-file hash、他part、又はcomposite labelだけで当該spanを通したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-pin-bytes-06` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureの072-005 L11 NFR-34 supplement raw spanだけをbytes mismatchにする。 | 当該partだけ不一致/未完としてsource pin ownerへ返し、他5 partのmeaning/statusは保持。 | full-file hash、他part、又はcomposite labelだけで当該spanを通したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-candidate-before-receipts` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | scope/sourceが成立したcandidate inputからcandidate identity/versionを生成しshadow/review receiptは両方欠落。 | candidateを作成しshadowとreviewを別々の後続未完義務として記録。 | receiptを事前要求、または未実施を完了扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-self-dependency` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | candidate生成前にshadow/review receiptを事前条件として要求する入力を与える。 | scope/sourceが成立すればcandidate生成し、receipt未取得を後続義務へ分離。 | candidateが将来receiptを事前前提にして生成不能なら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-reuse-valid-evidence` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 同一scope/revision/case/oracleに適用できる既存有効shadow/effect evidenceを入力。 | 証拠をsource/revisionとともに再利用し、別Worker実験を要求しない。 | 新実験を一律必須にする、又は適用範囲外証拠を再利用したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-no-every-time-experiment` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 有効な既存evidenceがあるcandidateで新規Worker実験が未選択。 | candidateを証拠のscope内で評価し、未選択operationを必須化しない。 | 新実験を一律前提化したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-no-auto-improvement-1_0` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | finding/reversal/retry/escaped defect/skill efficacyだけから自動pack改訂を試みる。 | 自動改善を拒否し、1.0 candidateとLABO保持範囲を変えない。 | 1.0 packを自動改訂、又は3.0学習を1.0条件化したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-brain-not-selected` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | BRAIN knowledge sourceを選ばないcandidate入力。 | BRAIN knowledge tuple/028互換照合を要求せず、他sourceを保持。 | BRAIN sourceを無条件依存にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-brain-selected-compatible` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | BRAIN knowledgeを実際に選び、identity/revision/state/provenance/declared compatibility range/evidenceが成立。 | 選択tupleだけを照合しcandidateへ結ぶ。 | 番号だけで互換とみなす、又は非選択時にも要求したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-brain-selected-compat-unknown` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 選択BRAIN knowledgeの宣言互換範囲だけunknown。 | BRAIN facetをunknown/未完としてBRAIN ownerへ戻し他sourceは保持。 | version番号だけで利用可能と推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-dependency-closure-normal` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-09` | pack identity/revision、HARNESS-010/011 contract revision、dependency identity/owner/version range/class/condition/operation/source、scope/authority/evidenceを同一入力にする。 | 常時必須＋成立condition＋実選択sourceのeffective closureと理由を再現。 | 未選択、reference-only、false条件を必須closureへ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-condition-false-local` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-09` | 一つのoperation conditionだけ明示的false、他の常時依存と成立条件は正常。 | false条件依存だけclosure外、常時必須と成立条件はclosure内に残す。 | falseをunknownへ格上げ、又は常時依存まで外したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-condition-unknown-hold` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | 一つのconditionをunknownに変更。 | 該当operationだけ保留しdeclared ownerへ戻す。 | unknownをfalse/nonapplicable/reference-onlyへ変換したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-source-fallback-reject` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | 選択sourceのread/compatibility照合失敗と別sourceの正常receiptを併置。 | 選択source ownerへ戻し、別sourceへfallbackしない。 | 別sourceを選択済みのようにclosureへ入れたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-reviewer-identity` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 正常な別reviewer fixtureのidentityだけを作成側と同一にする。 | そのreview receiptだけ独立性未成立、candidate/shadow stateを維持し該当review未完。 | 同一identityを独立と扱う、又はprovider/model一致だけを基準としたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-reviewer-context` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 正常な別reviewer fixtureのcontextだけを作成側と同一にする。 | そのreview receiptだけ独立性未成立、candidate/shadow stateを維持し該当review未完。 | 同一contextを独立と扱う、又はprovider/model一致だけを基準としたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-reviewer-authority` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 正常な別reviewer fixtureのauthorityだけを作成側と同一にする。 | そのreview receiptだけ独立性未成立、candidate/shadow stateを維持し該当review未完。 | 同一authorityを独立と扱う、又はprovider/model一致だけを基準としたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-reviewer-route` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 正常な別reviewer fixtureのrouteだけを作成側と同一にする。 | そのreview receiptだけ独立性未成立、candidate/shadow stateを維持し該当review未完。 | 同一routeを独立と扱う、又はprovider/model一致だけを基準としたら不合格。 |
| `CASE-INTELLIGENCE-L10-073-01` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-01` | 未知finding自由文text-a、既存UIL deterministic detector結果det-a、対象scope/revisionを与える。 | Probe探索をdetectorの代替にせず、finding/candidateを未判断で保持。Issue/Requirement/CI/mergeへのdirect projectionを各別に観測する。 | detector置換または自由文単独のdirect projectionがあれば不合格。 |
| `CASE-INTELLIGENCE-L10-073-02a` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01からProbe探索結果で既存deterministic detectorを置換する単独変異。 | 置換を拒否し既存detectorの役割・結果を保持する。検出/qualificationは既存UIL ownerに残す。 | Probeがdetectorの役割/結果を置換したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02b` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の根拠source locatorだけmissing。他条件は正常。 | 根拠だけunknownとしてfinding/candidateを保持し、識別済み該当source ownerへ照合を戻す。宛先owner不明なら推測せず未判断を保持する。 | 未知根拠をauthorityとする、またはcandidate記録自体を一律禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02c` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にIssue作成を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は既存経路を維持し、自由文からownerを作らない。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02c2` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にIssue更新を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は既存経路を維持し、自由文からownerを作らない。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02d` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にRequirement本文変更を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は上流要求ownerに残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02d2` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にRequirement承認状態の確定を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は上流要求ownerに残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02e` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にCI定義変更を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は既存OS/HARNESS verification ownerに残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02e2` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にCI実行要求生成を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は既存OS/HARNESS verification ownerに残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02e3` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にCI pass/完了状態生成を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は既存OS/HARNESS verification ownerに残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02f` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にmerge admission生成を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は現行GitHub review/merge authority経路に残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-02f2` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | CASE-01の自由文だけを根拠にmerge状態生成を試みる単独変異。 | direct projectionを拒否しcandidate提示に留める。独立した既存判断は現行GitHub review/merge authority経路に残す。 | 別宛先の拒否を本宛先の拒否へ代用、または既存owner経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-03` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-03` | 通常例と異なる未知finding文text-u73/rev-u73/scope-u73を与え、独立のdetector結果det-u73と識別済み既存ownerへのcandidate提示を対応づける。 | detectorを置換せず、Issue/Requirement/CI/mergeの直接投影を各々発生させない。candidate提示・未判断状態は保持する。 | 未知文だけでdetector置換/投影する、または未見性だけでcandidateを拒否したら不合格。 |
| `CASE-INTELLIGENCE-L10-073-04` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-03` | CASE-03から根拠source locatorだけmissingにする。他fieldは正常。 | 該当根拠だけunknownのfindingを保ち、識別済みsource ownerへ戻す。4宛先の非投影とdetector非置換を維持する。 | unknownを根拠充足/authorityへ推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-01` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-01` | PO固定6 part (`MPR-RC-HELIXINTELLIGENCE-L2-072-004`登録の4 partと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`登録の2 part)を規定順で入力し、identityと各raw spanを結ぶ。 | 6-part candidate/shadowを非強制で保持し、review/rollback後続義務を別statusにする。 | part境界を統合/混同、またはactive/gateを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02c` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | 6-part全体のPO digest不一致だけを投入。 | composite不一致としてcandidateを未確定にし、part別状態は保持。戻し先: 該当する要求/対象owner。 | full-file SHAで代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02d` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 実際に選択したsourceだけrevision/digestを変更。 | 選択facetだけstaleとしてそのsource ownerへ戻す。戻し先: 変更した選択sourceの特定できるsource owner。 | 非選択facetへ波及したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02e` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | 同じsource種別の非選択sourceだけ変更。 | changeを未観測/非適用として記録し選択facetをstaleにしない。戻し先: なし。非選択source変更は未観測で保持する。 | 非選択sourceを選択済み扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02f` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-05` | source選択状態だけをunknownにする。 | 影響facetだけunknownとして保持。戻し先: 特定できる選択source owner。formal ownerが不明ならowner unknownを保持して捏造しない。 | fresh/staleを推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02g` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-06` | 重複source edgeだけを投入。 | 重複を識別しつつ各identity/revision/applicabilityを追跡。戻し先: 該当source owner。 | edgeを消して意味を失ったら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02h` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-06` | 異なるrequirement/evidence/反証/stop条件のsource競合だけを投入。 | 両方のmeaningとconflict/unknownを保ち、優先採択しない。戻し先: 該当する要求/対象owner。 | 暗黙に一方を採用したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02i` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02`, `AC-INTELLIGENCE-L3-072-08` | candidateをforced/activeへ昇格する単一変異。 | forced stateを拒否し、採否・active化の既存対象authority ownerの判断記録がない限りcandidateを保つ。 | 候補から適用を発生させたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02j` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | candidate作成後、shadow receiptだけ欠落。 | candidate作成を保ちreceiptを後続義務として未完にする。戻し先: LABO。 | candidate生成を拒否したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02k` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02`, `AC-INTELLIGENCE-L3-072-08` | review receiptだけ欠落。 | candidateを保ち、作成側と異なるidentity/context/authority/routeによるreview obligationを未完のまま保持する。 | receipt取得済みと推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02l` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 作成者自身または作成側subagentをreviewerにする。 | 独立reviewと扱わずreview独立性unknownと未完義務を保持し、強制規則へ昇格させない。宛先を新設しない。 | subagentを独立reviewer扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02m` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02`, `AC-INTELLIGENCE-L3-072-07` | 同条件scope/revision/case/oracleのcandidate有無比較でrollback evidenceだけ欠落。 | 比較/rollback部分だけ未完にし閾値/方式を新設しない。対象owner/OSの既存rollback記録を参照し、なければ未完を保つ。 | rollback完了を推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02n` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureから072-004 L2 original source spanだけを欠落させる単独変異。 | 該当partだけ不足として表示し、他5 partと対応するcandidate状態は保持してsource pin ownerへ返す。 | full-file hashや別partを代用して成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02o` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureから072-004 L2 supplement source spanだけを欠落させる単独変異。 | 該当partだけ不足として表示し、他5 partと対応するcandidate状態は保持してsource pin ownerへ返す。 | full-file hashや別partを代用して成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02p` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureから072-004 L11 original source spanだけを欠落させる単独変異。 | 該当partだけ不足として表示し、他5 partと対応するcandidate状態は保持してsource pin ownerへ返す。 | full-file hashや別partを代用して成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02q` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureから072-004 L11 supplement source spanだけを欠落させる単独変異。 | 該当partだけ不足として表示し、他5 partと対応するcandidate状態は保持してsource pin ownerへ返す。 | full-file hashや別partを代用して成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02r` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureから072-005 L2 NFR-34 source spanだけを欠落させる単独変異。 | 該当partだけ不足として表示し、他5 partと対応するcandidate状態は保持してsource pin ownerへ返す。 | full-file hashや別partを代用して成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02s` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-03` | PO固定6-part fixtureから072-005 L11 NFR-34 source spanだけを欠落させる単独変異。 | 該当partだけ不足として表示し、他5 partと対応するcandidate状態は保持してsource pin ownerへ返す。 | full-file hashや別partを代用して成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02t` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 正常6-part candidateで選択sourceのrevisionだけをstaleにする。review receiptは有効な別fixtureで保持する。 | 選択facetだけstaleとしてsource ownerへ戻し、他partを保つ。 | staleをfreshへ読み替え、または非選択sourceまで失効させたら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-applicability-stale` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02` | packの対象scopeへのapplicability evidenceだけをstaleにする。pack/source identity・revision/digest、shadow/review receipt、rollback evidenceは正常fixtureで保持する。 | candidateを保持しapplicability facetだけstale/未完として適用を保留し、applicability evidenceの既存source ownerへ照合を戻す。 | stale applicabilityを適用可能/fresh/forcedと扱う、別facetを失効させる、またはownerを新設したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-03` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-04` | 未見の6-part-compatible pack revisionで全source pinとapplicabilityが一致。 | 同契約でcandidate/shadowを評価し、後続義務を維持。 | 未見性だけで拒否したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-04` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-04` | held-out fixtureでselected source applicabilityだけunknown。 | そのfacetだけunknownとしてsource ownerへ返し他partを保持。 | unknownをfresh/staleに推測したら不合格。 |
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
| `CASE-INTELLIGENCE-L10-078-02a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | authorityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | responsibilityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | runtimeだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | providerだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | dependencyだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | securityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | verificationだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | capacityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | costだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | migrationだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを missing / 欠落 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | releaseだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | authorityだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | responsibilityだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | runtimeだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | providerだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | dependencyだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | securityだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | verificationだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | capacityだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | costだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | migrationだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-03k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを unknown / 値不明 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | releaseだけunknownとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | authorityだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | responsibilityだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | runtimeだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | providerだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | dependencyだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | securityだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | verificationだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | capacityだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | costだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | migrationだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-04k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを stale / 旧revision に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | releaseだけstaleとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05a` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: authority次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | authorityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05b` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: responsibility次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | responsibilityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05c` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: runtime次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | runtimeだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05d` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: provider次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | providerだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05e` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: dependency次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | dependencyだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05f` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: security次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | securityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05g` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: verification次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | verificationだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05h` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: capacity次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | capacityだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05i` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: cost次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | costだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05j` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: migration次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | migrationだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-05k` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | 独立negative: release次元だけを mismatch / 対象・digest・authority不一致 に変異し、他10次元と共通正常source fixtureを保つ。 選択source owner identityは正常source receiptで有効に束縛して保持する。 | releaseだけincompleteとして残し、正常に結べる他次元と親の未完義務を維持する。このfixtureで有効に束縛した選択source ownerへ当該次元の不成立を返す。 | 異常次元を推測補完、unchanged/successへ丸める、他次元を巻き込む、または新ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-02` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | 同一source receipt/registry/policyをat-least-onceで2回受信する正常対を与える。 | 同じdelta exact set/digestを再現し、retry/重複配信を別episodeにしない。 | 重複受信だけで別delta/episodeを作成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-06` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | 同じauthority/event journalから初回構築したprojection/digestの正常期待fixture。 | delta/invalidation/intake projectionのexact set/digestを正本journalに結び、runtime実行結果と混同しない。 | 欠落projectionやdigest差を成功扱いしない。未fixtureのevent/source範囲のみunknownとする。 |
| `CASE-INTELLIGENCE-L10-078-07` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-07` | 既存contractが支持するsource kindのsnapshot-su78/revision-ru78/digest-du78と、既存journal契約が支持する新event組合せevent-eu78を同scopeへ結ぶ。R-06全意味要素、R-07対、F0 exact snapshot、affected set、authority/evidenceが正常な未見identityのfixture。 | 必須source/contract条件が揃う未見例は同じ親contractで評価し、肯定条件を満たす部分を正常として保持する。 | 未見正常を一律rejectしない。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-01-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでstable IDだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | stable IDだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-01-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでstable IDだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | stable IDだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-01-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでstable IDだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | stable IDだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-02-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでsource receipt revisionだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | source receipt revisionだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-02-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでsource receipt revisionだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | source receipt revisionだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-02-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでsource receipt revisionだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | source receipt revisionだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-03-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでsource receipt digestだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | source receipt digestだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-03-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでsource receipt digestだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | source receipt digestだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-03-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでsource receipt digestだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | source receipt digestだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-04-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでtarget HEAD identityだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | target HEAD identityだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-04-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでtarget HEAD identityだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | target HEAD identityだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-04-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでtarget HEAD identityだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | target HEAD identityだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-05-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでauthority identityだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | authority identityだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-05-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでauthority identityだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | authority identityだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-05-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでauthority identityだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | authority identityだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-06-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでenvironment identityだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | environment identityだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-06-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでenvironment identityだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | environment identityだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-06-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでenvironment identityだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | environment identityだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-07-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでaffected responsibilityだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | affected responsibilityだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-07-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでaffected responsibilityだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | affected responsibilityだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-07-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでaffected responsibilityだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | affected responsibilityだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-08-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでprevious stateだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | previous stateだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-08-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでprevious stateだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | previous stateだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-08-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでprevious stateだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | previous stateだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-09-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでobserved stateだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | observed stateだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-09-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでobserved stateだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | observed stateだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-09-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでobserved stateだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | observed stateだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-10-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでevidenceだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | evidenceだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-10-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでevidenceだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | evidenceだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-10-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでevidenceだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | evidenceだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-11-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでcounterevidenceだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | counterevidenceだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-11-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでcounterevidenceだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | counterevidenceだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-11-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでcounterevidenceだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | counterevidenceだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-12-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでconfidenceだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | confidenceだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-12-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでconfidenceだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | confidenceだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-12-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでconfidenceだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | confidenceだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-13-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでunknown stateだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | unknown stateだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-13-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでunknown stateだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | unknown stateだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-13-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでunknown stateだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | unknown stateだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-14-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでinvalidation exact setだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | invalidation exact setだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-14-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでinvalidation exact setだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | invalidation exact setだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-14-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでinvalidation exact setだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | invalidation exact setだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-15-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでre-synthesis-needed stateだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | re-synthesis-needed stateだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-15-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでre-synthesis-needed stateだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | re-synthesis-needed stateだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-15-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでre-synthesis-needed stateだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | re-synthesis-needed stateだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-16-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでdelta digestだけmissing。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | delta digestだけincompleteとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-16-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでdelta digestだけunknown。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | delta digestだけunknownとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-16-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06正常delta fixtureでdelta digestだけstale。他要素は同一scope/revision/source/authorityに束縛。 選択source owner identityは有効に保持する。 | delta digestだけstaleとして記録し、他の成立fieldを保持しこのfixtureで有効に束縛した選択source ownerへ戻す。 | 周辺値から補完、全deltaをsuccess扱い、無関係fieldまで巻き込んだら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-01-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでpack identityだけmissing、残りfieldは保持。 | pack identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-01-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでpack identityだけunknown、残りfieldは保持。 | pack identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-01-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでpack identityだけstale、残りfieldは保持。 | pack identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-02-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでpack revisionだけmissing、残りfieldは保持。 | pack revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-02-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでpack revisionだけunknown、残りfieldは保持。 | pack revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-02-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでpack revisionだけstale、残りfieldは保持。 | pack revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-03-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでHARNESS-L2-010 contract revisionだけmissing、残りfieldは保持。 | HARNESS-L2-010 contract revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-03-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでHARNESS-L2-010 contract revisionだけunknown、残りfieldは保持。 | HARNESS-L2-010 contract revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-03-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでHARNESS-L2-010 contract revisionだけstale、残りfieldは保持。 | HARNESS-L2-010 contract revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-04-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでHARNESS-L2-011 contract revisionだけmissing、残りfieldは保持。 | HARNESS-L2-011 contract revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-04-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでHARNESS-L2-011 contract revisionだけunknown、残りfieldは保持。 | HARNESS-L2-011 contract revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-04-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでHARNESS-L2-011 contract revisionだけstale、残りfieldは保持。 | HARNESS-L2-011 contract revisionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-05-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency identityだけmissing、残りfieldは保持。 | dependency identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-05-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency identityだけunknown、残りfieldは保持。 | dependency identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-05-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency identityだけstale、残りfieldは保持。 | dependency identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-06-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency ownerだけmissing、残りfieldは保持。 | dependency ownerだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-06-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency ownerだけunknown、残りfieldは保持。 | dependency ownerだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-06-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency ownerだけstale、残りfieldは保持。 | dependency ownerだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-07-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency contract versionだけmissing、残りfieldは保持。 | dependency contract versionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-07-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency contract versionだけunknown、残りfieldは保持。 | dependency contract versionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-07-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでdependency contract versionだけstale、残りfieldは保持。 | dependency contract versionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-08-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureで4区分分類だけmissing、残りfieldは保持。 | 4区分分類だけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-08-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureで4区分分類だけunknown、残りfieldは保持。 | 4区分分類だけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-08-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureで4区分分類だけstale、残りfieldは保持。 | 4区分分類だけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-09-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでapplicability conditionだけmissing、残りfieldは保持。 | applicability conditionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-09-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでapplicability conditionだけunknown、残りfieldは保持。 | applicability conditionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-09-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでapplicability conditionだけstale、残りfieldは保持。 | applicability conditionだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-10-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでtarget operationだけmissing、残りfieldは保持。 | target operationだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-10-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでtarget operationだけunknown、残りfieldは保持。 | target operationだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-10-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでtarget operationだけstale、残りfieldは保持。 | target operationだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-11-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでselected-source identityだけmissing、残りfieldは保持。 | selected-source identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-11-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでselected-source identityだけunknown、残りfieldは保持。 | selected-source identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-11-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでselected-source identityだけstale、残りfieldは保持。 | selected-source identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-12-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでscopeだけmissing、残りfieldは保持。 | scopeだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-12-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでscopeだけunknown、残りfieldは保持。 | scopeだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-12-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでscopeだけstale、残りfieldは保持。 | scopeだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-13-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでauthority identityだけmissing、残りfieldは保持。 | authority identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-13-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでauthority identityだけunknown、残りfieldは保持。 | authority identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-13-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでauthority identityだけstale、残りfieldは保持。 | authority identityだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-14-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでevidenceだけmissing、残りfieldは保持。 | evidenceだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-14-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでevidenceだけunknown、残りfieldは保持。 | evidenceだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-14-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常effective-closure fixtureでevidenceだけstale、残りfieldは保持。 | evidenceだけそのstate/reasonで未充足として該当operationを保留し既存ownerへ戻す。成立している常時必須/他条件は維持。 | 当該fieldをfalse/nonapplicable/reference-only/unselected/successへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-condition-false` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 一つの適用conditionだけがsource上falseと確定。 | そのconditionのdependencyだけclosure外、常時必須と他の成立条件はclosure内。 | falseをunknownへ混ぜる、全closureを外す、又は条件を成立扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-condition-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | conditionだけunknownで他入力は正常。 | 該当operationだけ保留しunknown reasonとdeclared ownerを保持。 | unknownをfalse/nonapplicable/reference-onlyへ分類したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-ref-only` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 旧schema/runtime/adapter/CLI/test等の参照資料だけをdependency候補にする。 | reference-onlyとしてclosure外、owner/dependencyへ昇格しない。 | 参照資料だけでeffective dependencyを作ったら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-omitted` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 選択したsource dependencyをeffective closure入力から欠落。 | closureをincompleteにしsource ownerへ返し該当operationを保留。 | selected sourceをoptional/reference-onlyへ落としたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-unselected-as-success` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 正常な選択source入力を保ち、未選択sourceのreceipt不在を未使用成功/利用可能とする誤表示だけを出力へ加える。 | 未選択/未観測として保持しsuccess/qualificationを生成しない。 | 不在をsuccess/qualifiedへ変えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-version-fallback` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | stale/未対応contract version-rangeと別版の正常候補を併置。 | 宣言ownerへ戻し、別版へ黙って読み替えずclosureをunknown/incomplete。 | version/rangeを代替または採択したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-same-input` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-08` | 同一pack/dependency/condition/operation/source/scope/authority/evidenceを独立に再評価。 | closure memberと適用/除外理由が一致。delta exact set/digestは別oracle。 | member/reason不一致を通す、又はdelta一致でclosure差異を相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-delta-local-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-07` | snapshot-su78/event-eu78の未見正常から選択source receiptのdigest-du78だけmissingにする。他のidentity/revision/scope/authority/evidenceは正常。 | そのfieldと依存結果だけunknown/incomplete、他の成立結果と未完義務を維持。 | 全体success/rejectで局所状態を消したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-normal` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | 同じreceipt/registry/policyを同入力で2回評価。 | delta exact set/digestが一致しepisodeを増殖しない。 | 同入力不一致をcurrent successとしたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-stale-revision` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | receipt revisionだけstale。 | 評価を拒否し該当source ownerへ戻す。 | staleをcurrent扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-wrong-head` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | target HEADだけ不一致。 | wrong HEADのR-07 deltaを拒否し、比較不能/未完を保持する。 | 異なるHEADを同一結果としたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-wrong-authority` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | authority identityだけ不一致。 | wrong authorityのR-07 deltaを拒否し、該当authority ownerへ不一致を返す。 | 異authorityを同じdeltaとしたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-missing-receipt` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | source receiptだけ欠落。 | R-07対象を拒否し、receipt欠落を補完せず影響結果を不成立として保持する。 | 欠落receiptからdelta/qualificationを成立させたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-duplicate-change` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | 同一changeを一度重複入力。 | duplicate delta/episodeを増やさない。 | 重複を別changeに数えたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r09-source-identity` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-03` | F0 joinでsource-identityだけ不一致。 | join不成立/staleまたはreobservation requiredとして該当source ownerへ返す。 | 他keyで不一致を代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r09-snapshot-revision` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-03` | F0 joinでsnapshot-revisionだけ不一致。 | join不成立/staleまたはreobservation requiredとして該当source ownerへ返す。 | 他keyで不一致を代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r09-snapshot-digest` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-03` | F0 joinでsnapshot-digestだけ不一致。 | join不成立/staleまたはreobservation requiredとして該当source ownerへ返す。 | 他keyで不一致を代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r10-missing-affected` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-04` | affected exact setから一対象だけ欠落。 | そのinvalidation欠落だけ示し、他の対象/非対象を維持。 | whole-system再投影で隠したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r10-unrelated-added` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-04` | unaffected projectionを一つだけaffected setへ追加。 | 余分な対象を拒否しunaffected projectionをcurrentに保つ。 | 広域stale化したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r10-whole-system` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-04` | whole-system再投影を要求する単独変異。 | fixed exact setだけ保持し全体再投影を拒否。 | scope拡大したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r10-structure-change` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-04` | 構造変更をcurrent updateとして適用する。 | proposal-only、current-write parking維持。 | 構造proposalからwrite解除したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-stale-directive-assignment` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | stale directiveだけを与え、assignment発行を観測。 | assignmentを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | assignmentが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-stale-directive-release` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | stale directiveだけを与え、release発行を観測。 | releaseを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | releaseが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-stale-directive-retire` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | stale directiveだけを与え、retire発行を観測。 | retireを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | retireが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-stale-directive-requirement-write` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | stale directiveだけを与え、requirement write発行を観測。 | requirement writeを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | requirement writeが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-stale-directive-design-write` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | stale directiveだけを与え、design write発行を観測。 | design writeを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | design writeが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-unresolved-unknown-assignment` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | unresolved unknownだけを与え、assignment発行を観測。 | assignmentを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | assignmentが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-unresolved-unknown-release` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | unresolved unknownだけを与え、release発行を観測。 | releaseを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | releaseが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-unresolved-unknown-retire` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | unresolved unknownだけを与え、retire発行を観測。 | retireを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | retireが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-unresolved-unknown-requirement-write` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | unresolved unknownだけを与え、requirement write発行を観測。 | requirement writeを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | requirement writeが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-unresolved-unknown-design-write` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | unresolved unknownだけを与え、design write発行を観測。 | design writeを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | design writeが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-missing-source-receipt-assignment` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | missing source receiptだけを与え、assignment発行を観測。 | assignmentを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | assignmentが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-missing-source-receipt-release` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | missing source receiptだけを与え、release発行を観測。 | releaseを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | releaseが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-missing-source-receipt-retire` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | missing source receiptだけを与え、retire発行を観測。 | retireを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | retireが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-missing-source-receipt-requirement-write` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | missing source receiptだけを与え、requirement write発行を観測。 | requirement writeを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | requirement writeが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r11-missing-source-receipt-design-write` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-05` | missing source receiptだけを与え、design write発行を観測。 | design writeを発行せずR-11理由と対象を保持し既存ownerへ戻す。 | design writeが発生したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r12-normal` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | 同一authority/event journalから同じ入力を二度再構築する期待値対。 | delta/invalidation/intake projection exact set/digestが一致。 | 同入力不一致を成功扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r12-event-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | journal event一件だけ欠落。 | 影響結果unknown/incomplete、欠落eventを特定。 | 欠落値を推測補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r12-order-change` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | 同event集合だけ順序変更。 | 同じ結果期待値と照合し差があればreplay不一致。 | 別episode生成で成功扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r12-rebuild-divergence` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | DB喪失後の再構築期待値だけ元exact set/digestと異なる。 | 再構築一致とせず差を未完に保持。実DB操作はしない。 | 差異を成功/authorityへ昇格したら不合格。 |

### rootによるclosure tuple・再現oracleの独立追補

| L10 Case | L3 FR | L3 AC | 入力・単独変異 | oracle・既存戻し先 | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-078-08-closure-dependency-contract-range-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からdependency contract rangeだけmissingにする。他のidentity/version/scope/authority/evidenceは正常。 | dependency contract rangeのmissing理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-dependency-contract-range-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からdependency contract rangeだけunknownにする。他のidentity/version/scope/authority/evidenceは正常。 | dependency contract rangeのunknown理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-dependency-contract-range-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からdependency contract rangeだけstaleにする。他のidentity/version/scope/authority/evidenceは正常。 | dependency contract rangeのstale理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-source-revision-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からselected-source revisionだけmissingにする。他のidentity/version/scope/authority/evidenceは正常。 | selected-source revisionのmissing理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-source-revision-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からselected-source revisionだけunknownにする。他のidentity/version/scope/authority/evidenceは正常。 | selected-source revisionのunknown理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-source-revision-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からselected-source revisionだけstaleにする。他のidentity/version/scope/authority/evidenceは正常。 | selected-source revisionのstale理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-source-digest-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からselected-source digestだけmissingにする。他のidentity/version/scope/authority/evidenceは正常。 | selected-source digestのmissing理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-source-digest-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からselected-source digestだけunknownにする。他のidentity/version/scope/authority/evidenceは正常。 | selected-source digestのunknown理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-selected-source-digest-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からselected-source digestだけstaleにする。他のidentity/version/scope/authority/evidenceは正常。 | selected-source digestのstale理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-scope-revision-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からscope revisionだけmissingにする。他のidentity/version/scope/authority/evidenceは正常。 | scope revisionのmissing理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-scope-revision-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からscope revisionだけunknownにする。他のidentity/version/scope/authority/evidenceは正常。 | scope revisionのunknown理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-scope-revision-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からscope revisionだけstaleにする。他のidentity/version/scope/authority/evidenceは正常。 | scope revisionのstale理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-compatibility-basis-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からcompatibility basisだけmissingにする。他のidentity/version/scope/authority/evidenceは正常。 | compatibility basisのmissing理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-compatibility-basis-unknown` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からcompatibility basisだけunknownにする。他のidentity/version/scope/authority/evidenceは正常。 | compatibility basisのunknown理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-compatibility-basis-stale` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-09` | 正常closure入力からcompatibility basisだけstaleにする。他のidentity/version/scope/authority/evidenceは正常。 | compatibility basisのstale理由を保持し該当operationだけunknown/incompleteとして宣言済みownerへ戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-brain-compat-missing` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 選択BRAIN knowledgeの宣言互換範囲だけmissing。他のsource tupleとevidenceは正常。 | BRAIN利用facetだけunknown/未完としてBRAIN ownerへ照合を戻す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-brain-applicability-missing` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 選択BRAIN knowledgeのapplicability evidenceだけmissing。他のidentity/revision/互換範囲は正常。 | 適用性を推測せずBRAIN facetだけ未完としてBRAIN ownerへ返す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-072-02-brain-applicability-unknown` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 選択BRAIN knowledgeのapplicability evidenceだけunknown。他のidentity/revision/互換範囲は正常。 | 適用性を推測せずBRAIN facetだけ未完としてBRAIN ownerへ返す。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-invalidation-projection-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06の正常deltaからprojectionのinvalidation exact setだけmissing。他の二種類のsetは正常。 | 欠落した種類だけunknown/incompleteとして保持し、他setで欠落を埋めない。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-invalidation-future-type-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06の正常deltaからfuture-typeのinvalidation exact setだけmissing。他の二種類のsetは正常。 | 欠落した種類だけunknown/incompleteとして保持し、他setで欠落を埋めない。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-invalidation-assumption-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06の正常deltaからassumptionのinvalidation exact setだけmissing。他の二種類のsetは正常。 | 欠落した種類だけunknown/incompleteとして保持し、他setで欠落を埋めない。 | 他fieldの変異で相殺、未完を成功化、又は未宣言条件/ownerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-member-divergence` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-08` | 同一closure入力の再評価対でmember一つだけが異なる。適用理由とdelta digestは一致。 | member不一致としてclosure oracleを不合格にし、他memberとdelta結果を別に保持する。 | member不一致をdelta一致で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-08-closure-reason-divergence` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-08` | 同一closure入力の再評価対で適用理由一つだけが異なる。memberとdelta digestは一致。 | 理由不一致としてclosure oracleを不合格にし、memberとdelta結果を別に保持する。 | 理由不一致をmember/delta一致で相殺したら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r07-same-input-divergence` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | 同一source receipt/registry/policyの再評価でdelta digestだけ異なる。 | delta再現不成立として差を未完に保持し、closure一致で代替しない。 | 同一入力のdelta digest差をclosure一致で相殺し、再現成立としたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r12-invalidation-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | 同じauthority/event journalからの再構築期待fixtureでinvalidation projectionだけを欠落させる。deltaと他projectionは正常。 | そのprojectionの欠落を検出し再構築一致として返さずunknown/未完に保持する。実DB操作はしない。 | invalidation projection欠落を他projectionやdelta一致で補い、再構築一致としたら不合格。 |
| `CASE-INTELLIGENCE-L10-078-09-r12-intake-missing` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | 同じauthority/event journalからの再構築期待fixtureでintake projectionだけを欠落させる。deltaと他projectionは正常。 | そのprojectionの欠落を検出し再構築一致として返さずunknown/未完に保持する。実DB操作はしない。 | intake projection欠落を他projectionやdelta一致で補い、再構築一致としたら不合格。 |

### #2607 review01 個別補正fixture

以下は固定L2/L11の既決句に対応する単独変異または未見正常であり、結果は機能ACに限る。新しい実行・承認・authorityを生成しない。

003補助fixture索引: `CASE-INTELLIGENCE-L10-2607-003-06`はfield順序変更とdependency evidence missingの複合held-out例、`CASE-INTELLIGENCE-L10-2607-003-order-and-missing-heldout`はfield順序変更とdependency revision missingの複合held-out例、`CASE-INTELLIGENCE-L10-003-08`はdependency revision missingだけの局所unknown例である。入力変異と照合範囲を混同しない。

| L10 CASE | L3 FR | L3 AC | 入力・独立変異 | 期待oracle・戻し先 | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-2607-001-01` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 二つの別domain責務と一つの明示共有責務、および責務未定義のcapabilityを入力する。 | 明示共有責務だけ共有し、各domain責務を保持する。未定義capabilityは割り当てずunknownとしてINTELLIGENCE domain編成ownerへ戻す。 | 根拠のないdomain統合があれば不合格。責務定義のない能力は割当てずunknownで既存domain編成ownerへ戻す。 |
| `CASE-INTELLIGENCE-L10-2607-001-02` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 新domain候補と根拠を返す別fixtureで、責務定義のないdata-governance capabilityだけを入力。 | capabilityだけunknownとしてINTELLIGENCE domain編成ownerへ戻し、根拠付きdomain candidateと他domain lifecycleを保持。 | capability ownerや固定enumを作成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-different-ticket-dependency` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 正常sourceのstate/evidence/revisionを保ち、dependency edge一つだけ別ticketのedgeへ置換する。 | 別ticket dependencyを対象ticketの現在値として結合せず、矛盾箇所を示し当該dependency source ownerへ戻す。 | 別ticketのedgeを同一対象へ結合または推測補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-003-06` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 未公開sourceのfield順序を変え、dependency evidence一fieldだけ未取得にする。対象identityと取得済revisionは同じものを保持する複合未見fixture。 | 取得済値と関係はsource正本と一致させ、未取得fieldだけunknownを残して該当source ownerへ不足を戻す。順序に依存せず対象を識別する。 | field一覧やtraceの存在だけで成功、未知値の補完、対象混同をしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-004-08` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | unknown fieldへ事実値を補完するmutation | unknownを保持しclassificationを未完にする 戻し先: 該当classification source ownerへ照合を戻す。 | 補完値をObserved Fact扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-004-09` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 同じ根拠関係を別source表現で与えるheld-out normal | source identity/revisionと関係が一致する範囲を同一分類 | 表現が未見なだけで拒否したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-005-10` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | dependency orderをA→BからB→Aへ逆転 | plan candidateを未確定として順序矛盾を表示 戻し先: dependency orderを定める既存source ownerへ照合を戻す。 | 逆順をsuccessにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-006-12` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | target/scope/observation windowを先固定し、後日LABO actualを別recordで投入 | predictionとactualを分離して比較する。LABO送達成立はL2-040で別判定し、本CASEでは判定しない。 | predictionを実測事実へ昇格、またはL2-040以外でLABO送達成立を判定したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-006-13` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 後続actualをpredictionと不一致に変える。 | 不一致を保持し、予測をactualへ上書きしない。予測/実測差の根拠source ownerへ照合を戻す。 | 不一致を成功へ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-006-14` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | scopeだけを事前固定scopeと異なる値にした後続実測。 | scope不一致で実測比較をunknownにし、該当source record ownerへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-006-14-r2` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | actual revisionだけをstaleにした後続実測。 | stale実測をunknownにし、該当source record ownerへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-006-14-r3` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 他の正常条件を保ち、後続actual resultだけをmissingにする。 | 実測比較をunknownにし、未発生結果を補完しない。LABOへ未到着actualを戻す。 | 未発生結果を推測補完またはunknownをsuccessへ変えたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-007-15` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 反証を含む正常診断へ反証無視だけを一変数注入 | 追加観測/検査へ辿り、反証を残す。source欠落はそのsource ownerへ戻す。 | 反証を無視した、または欠落sourceを推測したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-007-15-irrelevant-check` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 正常episodeへ原因を識別しない無関係検査だけを追加指示する。 | 無関係検査を拒否し、原因を識別できる追加観測だけをcandidateで提示する。 | 無関係検査を診断要件化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-007-16` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-02` | diagnosisのsource、episode、反証は正常なまま、repair提案だけをOS assignmentへ変換する。 | repair提案をcandidateのまま保持し、assignmentを生成しない。実行/assignmentの状態はOSの既存assignment ownerに残す。 | 提案からassignmentを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-008-17` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | seeded must-fixを一件だけ見逃す | そのfindingだけfalse-negativeとして記録 | 見逃しをpassとしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-008-18` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | clean artifactを一件だけ誤指摘する | false-positiveとして区別し、scope外は未評価。誤指摘の修正先は対象artifactの既存owner。 | clean artifactを欠陥ありとして通したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-009-20` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | UIL/TER/Future Synthesisと重複するfindingを一つ入力 | 重複実装を避け既存機構へ戻す | 重複機能をINTが実装要件化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-009-21` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 根拠sourceなしfindingを一つ入力 | findingを根拠不足として未完保持 | 根拠なしを確定findingにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-009-22` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 別findingの反証を誤結合するmutation | 反証の対象finding mismatchを拒否 | 誤結合したまま成立したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-23` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 比較normalでcurrent/candidate provider実行版を異なる値にし共通評価基準revisionは同じにする | 両実行版と共通評価revisionを別軸で記録し比較可能性を評価 | 実行版同一を要求したり版更新だけで優位判定したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからtask snapshotだけをmissingにする。 | task snapshot不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24-r2` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからscoring versionだけをmissingにする。 | scoring version不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24-r3` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからrun protocolだけをmissingにする。 | run protocol不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24-r4` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからhardware classだけをmissingにする。 | hardware class不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24-r5` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからindependent oracleだけをmissingにする。 | independent oracle不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24-r6` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからcache conditionだけをmissingにする。 | cache condition不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-24-r7` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalからhuman intervention conditionだけをmissingにする。 | human intervention condition不足により比較不能としINTELLIGENCE判断へ戻して追加の同条件結果を求める。ほかの比較条件は保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-25` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalでrescueだけを除外する。 | rescueを別指標に記録して欠落を拒否し、比較sourceへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-25-r2` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalでreworkだけを除外する。 | reworkを別指標に記録して欠落を拒否し、比較sourceへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-25-r3` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件比較normalでhuman interventionだけを除外する。 | human interventionを別指標に記録して欠落を拒否し、比較sourceへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-25-r4` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | baseline/current/candidate/hybridのconditionをHELIXなし/旧/新のcohortと同じ軸へ混ぜる。 | conditionとcohortを別軸に戻し、混合比較の順位を出さない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-25-r5` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | priority/tolerance未定の指標からwinnerを生成する。 | 勝敗を生成せず測定値と未定義条件を保持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-26` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | costのpricing sourceだけをmissingにする。 | pricing source不足とcost unknownを保持しprice単独で上位認定しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-26-r2` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | costのcurrencyだけをmissingにする。 | currency不足とcost unknownを保持しprice単独で上位認定しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-26-r3` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | costのeffective timestampだけをmissingにする。 | effective timestamp不足とcost unknownを保持しprice単独で上位認定しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-26-r4` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | costのcharging classだけをmissingにする。 | charging class不足とcost unknownを保持しprice単独で上位認定しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-26-r5` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | cost観測だけをmissingにし0を記録する。 | 欠測costをunknownに戻し、ゼロの実測値と区別する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-011-26-r6` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 価格だけを根拠にcandidateを上位認定する。 | 価格単独の順位を拒否し、必要品質と比較条件を維持する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-012-27` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | fixture oracleでuncertainと定めた判断をprobableへ縮める。 | 原uncertainと追加証拠要求を保持し、勝手な確度昇格を拒否する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-012-27-r2` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | fixture oracleでuncertainと定めた判断をknownへ縮める。 | 原uncertainと追加証拠要求を保持し、勝手な確度昇格を拒否する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-012-28` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 境界規則未決で確定判断を要求 | 判定不能を保持し、その閾値判断を持つ既存ownerへ不足を返す。ownerを特定できなければunknownのままにする。 | 新閾値を設ける、またはownerを創作したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-012-29` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | source revisionだけをstaleにした未見判断。 | stale rootだけをunknownとして該当source ownerへ再照合し、他の既知fieldとclassificationを保つ。 | stale sourceをcurrent扱いする、または未変異の分類/次証拠をunknown化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-012-29-r2` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 相反する二証拠を単一factへ変換する。 | 両証拠とcontradictoryを保持し、単一fact化を拒否する。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-013-30` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | sourceにない事実をtrace edgeに追加する | 根拠なしedgeを未完拒否 | source事実として表示したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-013-31` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | current根拠に異版sourceを付ける | revision mismatchを検知しsource ownerへ戻す | 異版をcurrent根拠として通したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-013-32` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 完全再生成を行わないことだけを理由に根拠を省く | 存在するsource/revision/data-use traceを保持 | 根拠省略を許したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-014-33-assignment-evidence-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 反復可能taskのscope内operationを保ち、OS assignment/evidenceだけを欠落させる。 | assignment/evidence不足だけをOS assignment ownerへ戻す。manifestは保持する。 | assignment/evidenceを補完または作業済みにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-014-33-manifest-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | scope内operationを保ち、manifest必須欄だけを欠落させる。 | manifest不足を通常INTELLIGENCE判断candidateとして保持する。OS assignment/evidenceは正常に保持する。 | 欠落manifestを推測補完、またはOS割当状態を未完化したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-scope-outside-operation-only` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | manifest、OS assignment/evidence、scope内operationを正常に保ち、scope外operationを一件だけ追加する。 | 当該operationだけを拒否し、scope内candidateと既存assignment evidenceを保持する。 | scope外operationを許可、または他fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-014-34` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | stop成立後に操作を一件実行する | 停止後executionを拒否しINT candidateを未完保持、assignment/evidence不足はOS assignment ownerへ戻す | 停止後実行を許可したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-014-35` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 正常manifestのpurpose/input/output/stopを保ち、manifestの記載だけで既存actorのauthorityを追加する。 | manifestから権限を生成せず既存authorityを保持する。Bot manifest候補のまま保持し、OS assignment成立とみなさない。 | manifest単独でauthority追加を成立させたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-015-36` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 正常near-miss clean exampleにだけ変異を加え過検出させる | 非該当exampleの誤検出を明示しcandidateを止め、独立episode/ログ不足は追加ログ観測へ戻す。 | clean exampleを適用可能として通す、または追加ログが必要な状態を確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-015-37` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 別実装表現の未見正常exampleを与える | 固定親の意味軸で評価し候補状態を維持 source評価不足は該当source ownerへ戻す。 | 未見表現だけで拒否、またはcandidateを昇格したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-39` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 登録候補へ包括write権限を付与するmutation | untrusted/candidateのまま保持しwrite権限を付与しない | 権限昇格で不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-40` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 既知seeded counterexampleが修正後も失敗する。 | 反例未修正を不合格/停止として保持する。この反例fixtureは失敗したoracleの対象sourceとsource owner identityを他の正常入力で特定して与え、そのsource ownerへ反例未修正を返す。SECURITY/OSの別原因を併記しない。 | 未修正を成功扱いする、宛先を推測する、または無関係scopeへ一般化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-40-r2` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 既存正常caseだけが修正後に退行する。 | regressionを不合格/停止として保持する。失敗したoracle/対象sourceと責務を照合できる場合だけ固定親の該当既存ownerへ原因別に戻し、宛先を確定できない入力は戻し先unknownを保つ。 | regressionを成功扱いする、宛先を推測する、または無関係scopeへ一般化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-40-r3` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 修復対象scope外の問題を入力する。 | scope外を未評価として止め、局所品質から接続成功を導かない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-40-r4` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 対象scope内だが未対応の新種問題を入力する。 | 新種を未評価として止め、既存oracleなしにpassを生成しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-41` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | actual result fieldのみmissing、candidate fieldsは有効 | result部分のみunknownとしてOS assignment/Worker result ownerへ再照合し、candidate条件は保持する。 | candidateまで一括失敗/成功扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-018-42-labo-history-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | current judgment、OS current registrationとLABO評価のidentityを正常に保ち、historical evidence recordだけを欠落させる。 | historical evidence不足だけをLABOへ戻し、current judgmentとOS registrationを保持する。採択や過去評価を補完しない。 | 歴史証拠欠落を補完、採択を生成、またはcurrent状態まで未完化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-018-42-os-registration-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | LABO評価とhistorical evidenceを正常に保ち、OS current registrationだけを欠落させる。 | 採択状態を生成せず、OS registration不足だけをOSへ戻す。 | OS登録欠落を補完、またはLABO履歴まで未完化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-018-43` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | outcome receiptだけを遅延させた未見episode。 | episode/revisionを保持し、未到着historical部分をunknownとしてLABOへ照合を戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-018-43-r2` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 同じepisode集合のoutcome受信順序だけを逆転する。 | episode/revisionで正しく結びcurrentを過去結果で上書きしない。結果順序の履歴評価が不足ならLABOへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-018-43-r3` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | current sourceに相反する状態を与える。 | 現在source間のconflictだけを保持して当該current source ownerへ戻す。歴史評価ownerへは送らない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-018-43-r4` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | outcomeの時点だけをmissingにする。 | historical timestamp不足をunknownとしてLABOへ戻す。 | timestampを推測補完、またはcurrent stateまでunknown化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-019-44-r2` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | exception条件だけをmissingにする。 | exception不足を未完としBRAINへ返す。ほかの条件で代替しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-019-44-r3` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | counterexample条件だけをmissingにする。 | counterexample不足を未完としBRAINへ返す。ほかの条件で代替しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-019-44-r4` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | counterexample条件が成立する知識をcurrent situationへ適用する。 | 適用を拒否し知識正本を保持してBRAINへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-020-45` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 正常戻し先ownerと意味変更層を一致させるheld-out | 戻し先が意味を変える層に一致する | 誤ownerへ戻したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-067-46` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 適用scope内のvalid decisionに毎runのPO再確認を強制する。 | 既決decisionを再利用し重複確認を要求しない。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-067-46-r2` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | decisionの有効性だけをexpiredにする。 | proposalを確定せずdecision ownerへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-067-46-r3` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | scope内decisionに相反する決定根拠を与える。 | conflictを未完に保持しdecision ownerへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-067-48` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | conditionをcohortと混同する。 | 軸を分離し、比較scope/evidence不足をLABOへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-067-48-r2` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | LABO035→INT034のcompatibility rangeだけを不一致にする。 | 同結果receiptを有効扱いせずLABO（送信source owner）へ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-067-48-r3` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | LABO052の同一結果receiptだけをmissingにする。 | 未受領/未評価を保持してLABOへ戻す。 | この個別oracleに反する結果、推測補完または無関係scopeへの一般化は不合格。 |
| `CASE-INTELLIGENCE-L10-2607-072-51` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 同一pack/scope/snapshot/case/oracle/evaluation conditionを固定し、選択済みsource tupleのidentity/revision/digestだけを更新する。新candidate revision/digestには有効なshadow receipt/evaluationを与える。 | 新revisionのshadow/evaluation済み状態とreview obligationを分離して保持し、旧receiptを流用せずactive/admissionも生成しない。 | 変えていないtupleをstale化する、または旧receiptを新revisionへ流用したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-078-56` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-11` | R-06 sourceを078親の固定source span以外のR-08行へ置換する | source mismatchとして不合格 | R-08/他parent atomを078根拠としたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-01` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | 必須依存を一つだけmissingにする | 該当pack operationのみ未完としてHARNESS共通contract ownerへ戻す | missingをsuccess扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-02` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | 正常依存から一つだけstaleにする | 当該selected facetだけstaleとしてsource ownerへ戻す | 非選択sourceへ波及したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-03` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | dependency contract versionをunsupportedへ変える | 未完を保持しHARNESSへ戻す | 旧versionを読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-04` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | reference-only資料をrequired dependencyへ昇格 | reference-onlyのまま保持する | 依存化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-05` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 索引：domain identity欠落は`CASE-INTELLIGENCE-L10-R2607-072-20`、capability構成欠落は`CASE-INTELLIGENCE-L10-R2607-072-21`で別々に投入する。 | 各個別CASEのunknownと戻し先を照合する。この索引を独立fixtureとは数えない。 | 二つの欠落を単一変異として扱う、または個別CASEの期待を省いたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-06` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 採択済checklistがない時にdefault checklistへfallback | fallbackせずunknown/incompleteを保持 | default checklistを用いたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-07` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | comparison condition revisionだけ不一致 | 比較結果unknownとしてLABOへ戻す。 | 不一致結果を同一比較へ混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-072-08` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | candidate resultをfinal judgmentとして扱う | candidate状態を保ち既存ownerの判断を待つ | 判断authorityを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-078-14` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | R-07 retryだけを変更しsource inputは固定 | 同じepisode/digestへ束ね、別deltaを作らない | retryでepisodeを増やしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-078-15` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-02` | R-07 event orderingだけを変更する | 同じinput event集合で同一exact set/digestを照合 | ordering差で新episodeにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-078-16` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-01` | R-06 dimension間でproviderとruntimeを混同 | dimension identityを分離してsourceへ結ぶ | dimensionを結合したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-078-17` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-11` | R-11 fresh/resolved/receipt済みからdirect requirement changeを試みる | 直接変更数0のまま、候補として既存ownerへ戻す | proposalから直接変更したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607X-067-18` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | LABO035→INT034 receiptのcontract versionだけをstale化。他のidentity/scope/resultは正常。 | receiptを有効扱いせず、送信source ownerであるLABOへ戻す。 | stale receiptを使ってsuccessにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-005-01` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | stale工程contractだけをnormalから変異 | 該当planを未完として固定contract ownerへ照合を戻す | stale contractを使って確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-005-02` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | INTELLIGENCEにOS ticket発行を要求する | 候補はOS handoffのまま、ticket identity/assignmentを生成しない | ticketを発行または割り当てたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-008-03` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | seeded must-fixのseverityだけを誤分類する | finding自体とseverity mismatchを分けて記録 | 誤severityを期待値一致としたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-008-04` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | seeded must-fixの反例だけを別欠陥へ取り違える | counterexample mismatchで不成立にする | 別反例を結んだら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-008-05` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | seeded must-fix routeだけを誤る | finding内容を保ちroute mismatchを対象artifactの既存ownerへ戻す | 誤routeで合格したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-008-06` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | scope外欠陥のheld-out inputを与える | 未評価と記録しscope内oracleに混ぜない | scope外をFP/FNの確定判定に混ぜたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-067-08` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | priceだけを上げ、quality gate failureは維持 | quality failureを先に判定し価格が相殺しない | 価格で品質未達を通したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607Y-078-10` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-06` | R-12 DB deletion後のsame input replayを期待値で照合 | 同一event inputから同一projection/digestを再構築する設計oracleを照合し、物理DB削除・再実行はしない | ACCEPTED expected output mismatchを隠したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-01` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 責務sourceで分離された二責務を根拠なく一domainへ統合する。 | 統合を拒否し、衝突する責務の箇所を示してINTELLIGENCE domain編成ownerへ戻す。明示共有責務だけ共有する。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-02` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 根拠が異なる各domainへ全能力を一律適用する。 | 各domainの宣言能力だけを保持し、未構成をunknownとしてINTELLIGENCE判断設計ownerへ戻す。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-03` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | source正本と食い違うSituation Modelの値を正本として採用する。 | source正本を優先してSituation Modelを照合し、上流authorityを生成せず該当source ownerへ戻す。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-04` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | Derived InterpretationをObserved Factとして表示する。 | 解釈とsource観測事実を分離し、誤分類を拒否する。classification sourceに誤りがあればそのsource/evidence提供元へ戻す。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-05` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 判定基準が未定で複数解釈の一つを不合格扱いする。 | 判定不能を保持して基準を人へ戻す。新しい分類閾値を設けない。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-06` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 必要なOS ticket化が成立しない入力を正常planへ与える。 | OS接続の成立を別判定に保ち、ticket化不足をOSへ戻す。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-07` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 事前predictionを後続実測事実として扱う。 | predictionとactualを分離し、実測済みの主張を拒否する。実際の後続実測はLABOが所有する。 | 事前predictionを実測済みと主張したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-09` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 製品意味を変更する層と異なるownerへbackflowする。 | 誤ownerへの戻しを拒否し該当意味層の既存ownerへ戻す。 | この個別oracleを満たさない結果は不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-20` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 選択domain identityだけをmissingにする。capability構成と他のsourceは正常に保つ。 | judgment意味/scopeの当該domain部分をunknown/未完として、L2-001の意味・対象を持つ既存要求／対象ownerへ返す。他のsourceとcandidate状態は保持する。 | domain identityを推測する、無関係fieldを未完にする、または既存要求／対象owner以外へ意味判断を委ねたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-21` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | L2-002の選択capability構成だけをmissingにする。domain identityと他のsourceは正常に保つ。 | 未構成能力を実行可能とせずunknown/未完として、L2-002の意味・対象を持つ既存要求／対象ownerへ返す。domain identityとcandidate状態は保持する。 | capabilityを推測付与する、domainを未完にする、または既存要求／対象owner以外へ意味判断を委ねたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-22` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 新しい実験を選択しLABO-006のOS割当Worker・結果対応を満たす。 | OS割当Worker/result receiptを対応付け、選択実験条件と効果評価はLABOの既存ownerへ残す。 | 個別条件を別source/operationで代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-23` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 選択した新規実験でLABO-006のOS割当対応だけをmissingにする。 | OS assignment/result対応の不足をOS assignment ownerへ戻し、LABO評価を自己評価で代替しない。 | 個別条件を別source/operationで代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-24` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | system化/operation配分評価を選択しLABO-007条件を満たす。 | 選択operationの条件を照合しLABOの評価責務を保持する。 | 個別条件を別source/operationで代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-25` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 選択したsystem化/operation配分評価でLABO-007条件だけをmissingにする。 | 評価部分を未完としてLABO条件はLABO result ownerへ、OS割当/Worker結果不足はOS assignment ownerへ戻す。 | 個別条件を別source/operationで代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-26` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-04` | 正常sourceのprojection revisionだけをstaleにして再利用する。 | stale projectionをcurrentとして使わず、そのprojectionの既存source ownerへ戻す。 | 個別条件を別source/operationで代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-route-issue` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-01` | Issue宛先について、自由文単独のProbe候補とは独立に適格根拠・対象revision・既存ownerの判断を満たす既存経路のfixtureを与える。 | Probeから直接投影せず、既存経路はその根拠とowner条件に従って成立可能なまま保つ。 | Probe候補の拒否を理由にIssue宛先の既存経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-route-requirement` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-01` | Requirement宛先について、自由文単独のProbe候補とは独立に適格根拠・対象revision・既存ownerの判断を満たす既存経路のfixtureを与える。 | Probeから直接投影せず、既存経路はその根拠とowner条件に従って成立可能なまま保つ。 | Probe候補の拒否を理由にRequirement宛先の既存経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-route-ci` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-01` | CI宛先について、自由文単独のProbe候補とは独立に適格根拠・対象revision・既存ownerの判断を満たす既存経路のfixtureを与える。 | Probeから直接投影せず、既存経路はその根拠とowner条件に従って成立可能なまま保つ。 | Probe候補の拒否を理由にCI宛先の既存経路を恒久禁止したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-route-merge` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-01` | merge宛先について、自由文単独のProbe候補とは独立に適格根拠・対象revision・既存ownerの判断を満たす既存経路のfixtureを与える。 | Probeから直接投影せず、既存経路はその根拠とowner条件に従って成立可能なまま保つ。 | Probe候補の拒否を理由にmerge宛先の既存経路を恒久禁止したら不合格。 |

### Stage3 固定親の共通pack契約照合

本PR対象001〜009/011〜016/018〜020と067の共通pack contractへ、固定L2の記載どおり実版・互換・交換/更新条件を適用する。別の消費操作選択は前提とせず、pack field不成立では当該親の成立をunknown/未完とする。010は承認済み別Stage、017はStage4の範囲であり、この追補で両親の正本prefixを変更しない。normal oracleには契約identity、実contract版、成果物版、依存版、宣言compatibility range、交換/更新条件を含める。

| L10 CASE | L3 FR | L3 AC | 入力・独立変異 | 期待oracle・戻し先 | 不合格条件 |
|---|---|---|---|---|---|
|`CASE-INTELLIGENCE-L10-R2607-001-pack-normal`|`FR-INTELLIGENCE-L3-001-01`|`AC-INTELLIGENCE-L3-001-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親001のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-contract-stale` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-range-mismatch` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-001-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-001-01` | `AC-INTELLIGENCE-L3-001-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-002-pack-normal`|`FR-INTELLIGENCE-L3-002-01`|`AC-INTELLIGENCE-L3-002-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親002のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-contract-stale` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-range-mismatch` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-002-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-002-01` | `AC-INTELLIGENCE-L3-002-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-003-pack-normal`|`FR-INTELLIGENCE-L3-003-01`|`AC-INTELLIGENCE-L3-003-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親003のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-contract-stale` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-range-mismatch` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-003-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-004-pack-normal`|`FR-INTELLIGENCE-L3-004-01`|`AC-INTELLIGENCE-L3-004-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親004のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-contract-stale` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-range-mismatch` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-004-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-004-01` | `AC-INTELLIGENCE-L3-004-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-005-pack-normal`|`FR-INTELLIGENCE-L3-005-01`|`AC-INTELLIGENCE-L3-005-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親005のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-contract-stale` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-range-mismatch` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-006-pack-normal`|`FR-INTELLIGENCE-L3-006-01`|`AC-INTELLIGENCE-L3-006-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親006のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-contract-stale` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-range-mismatch` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-014-pack-normal`|`FR-INTELLIGENCE-L3-014-01`|`AC-INTELLIGENCE-L3-014-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親014のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-contract-stale` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-range-mismatch` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-015-pack-normal`|`FR-INTELLIGENCE-L3-015-01`|`AC-INTELLIGENCE-L3-015-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親015のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-contract-stale` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-range-mismatch` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-015-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-015-01` | `AC-INTELLIGENCE-L3-015-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-016-pack-normal`|`FR-INTELLIGENCE-L3-016-01`|`AC-INTELLIGENCE-L3-016-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親016のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-contract-stale` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-range-mismatch` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-018-pack-normal`|`FR-INTELLIGENCE-L3-018-01`|`AC-INTELLIGENCE-L3-018-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親018のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-contract-stale` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-range-mismatch` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-018-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-018-01` | `AC-INTELLIGENCE-L3-018-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-019-pack-normal`|`FR-INTELLIGENCE-L3-019-01`|`AC-INTELLIGENCE-L3-019-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親019のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-contract-stale` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-range-mismatch` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-020-pack-normal`|`FR-INTELLIGENCE-L3-020-01`|`AC-INTELLIGENCE-L3-020-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親020のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-contract-stale` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-range-mismatch` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-020-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-020-01` | `AC-INTELLIGENCE-L3-020-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
### 共通pack契約の欠落親に対する個別照合
| L10 CASE | L3 FR | L3 AC | 入力・独立変異 | 期待oracle・戻し先 | 不合格条件 |
|---|---|---|---|---|---|
|`CASE-INTELLIGENCE-L10-R2607-007-pack-normal`|`FR-INTELLIGENCE-L3-007-01`|`AC-INTELLIGENCE-L3-007-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親007のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-contract-stale` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-range-mismatch` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-007-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-007-01` | `AC-INTELLIGENCE-L3-007-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-008-pack-normal`|`FR-INTELLIGENCE-L3-008-01`|`AC-INTELLIGENCE-L3-008-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親008のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-contract-stale` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-range-mismatch` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-009-pack-normal`|`FR-INTELLIGENCE-L3-009-01`|`AC-INTELLIGENCE-L3-009-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親009のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-contract-stale` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-range-mismatch` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-011-pack-normal`|`FR-INTELLIGENCE-L3-011-01`|`AC-INTELLIGENCE-L3-011-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親011のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-contract-stale` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-range-mismatch` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-012-pack-normal`|`FR-INTELLIGENCE-L3-012-01`|`AC-INTELLIGENCE-L3-012-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親012のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-contract-stale` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-range-mismatch` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-012-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-012-01` | `AC-INTELLIGENCE-L3-012-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-013-pack-normal`|`FR-INTELLIGENCE-L3-013-01`|`AC-INTELLIGENCE-L3-013-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親013のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-contract-stale` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-range-mismatch` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-013-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-013-01` | `AC-INTELLIGENCE-L3-013-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |
|`CASE-INTELLIGENCE-L10-R2607-067-pack-normal`|`FR-INTELLIGENCE-L3-067-01`|`AC-INTELLIGENCE-L3-067-04`|固定親に適用するcontract identity、contract/artifact/dependency version、宣言compatibility rangeと交換/更新条件を同scope/revisionへ束縛する。 |版と交換/更新条件を個別に記録して適用範囲を照合する。親単体のpassを接続成功に変換しない。 |全条件が正常に揃う固定親067のpack inputをunknown/未完/拒否扱いする、同scope/revisionの束縛を失う、または親単体の正常結果から他操作の接続成功を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-contract-identity-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからcontract identityだけをmissingにする。 | contract identity不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-contract-version-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからcontract versionだけをmissingにする。 | contract version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-artifact-version-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからartifact versionだけをmissingにする。 | artifact version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-dependency-version-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからdependency versionだけをmissingにする。 | dependency version不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-compatibility-range-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからcompatibility rangeだけをmissingにする。 | compatibility range不足で当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-contract-stale` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 実contract revisionだけをstaleにする。 | 当該親の成立を未完として共通pack contract ownerへ戻し、staleを成功へ変換しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-range-mismatch` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 実artifact versionだけを宣言compatibility range外へ変える。 | 互換不成立を個別に保持して共通pack contract ownerへ戻し、単体成功で代替しない。 | 当該fieldを補完・旧版で代替・別操作へ依存追加したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-dependency-version-stale` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからdependency versionだけをstaleにする。他のcontract/artifact/range fieldは正常。 | dependency versionのstaleだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | stale dependency versionをcurrentとして使う、推測補完する、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-dependency-version-mismatch` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 固定親の正常contractからdependency versionだけを宣言compatibility range外へ変える。他のcontract/artifact/range fieldは正常。 | dependency version mismatchだけを検出し、当該親の成立を未完としてHARNESS共通pack contract ownerへ戻す。他の正常fieldを保持する。 | mismatch dependency versionを互換扱いする、別dependencyへ読み替える、または無関係fieldを未完にしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-pack-exchange-update-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 他の共通pack条件を正常に保ち、交換/更新条件だけをmissingにする。 | 当該fieldをunknown/未完として共通pack contract ownerへ戻し、他の正常fieldは保持する。 | 交換/更新条件を推測補完、またはpack applicabilityを特定の消費操作を選ぶ条件へ読み替えたら不合格。 |

### review03 個別補正fixture

| L10 CASE | L3 FR | L3 AC | 入力・独立変異 | 期待oracle・戻し先 | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-R2607-072-reassessment-same-version-normal` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | `pack-P@r1`, `scope-S@r4`, `snapshot=snap-A/digest=d-A`、採択済み004/005の6 partと選択済みsource tuple（identity/revision/digest/range/compatibility/applicability）を固定し、case/oracle/evaluation conditionを変えず再評価する。 | 固定L11:401に沿った同じ`current-for-this-candidate` normal oracleを再現して同一版の再評価記録にし、candidate/shadow状態を保持する。shadow/reviewは後続義務、active/admissionは生成しない。 | 同一tupleで結果を変える、source updateを捏造する、または後続権限へ昇格したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-reassessment-new-revision-normal` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | 正常baselineの選択requirement sourceが変更された負例から、source ownerが提供する新revision/digest、scope-Sへのapplicability、更新snapshot snap-B/digest d-Bを結び、candidate pack-P@r2を作る。他の選択sourceと6 part契約は保持し、対応shadowは未実施とする。 | 固定L11:425どおり新candidate revisionとsource traceを返し、未実施shadowを未完義務として表示する。更新だけでreview済み/active/gate強制へ昇格しない。 | 旧snapshotを流用する、新source根拠を結ばない、未実施shadowを実施済みにする、更新だけでactive化するなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-heldout-stop-local-unknown` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-03` | `CASE-INTELLIGENCE-L10-R2607-005-heldout-graph-risk-normal`からstop条件だけを欠落させる。risk条件、依存、target、current contractは正常のまま固定する。 | stop条件だけunknown/未完として該当入力ownerへ戻し、riskと他の依存/plan fieldを保持する。 | 未見性だけで拒否、stop条件を推測補完、または他fieldを未完化したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-confidence-assumption-presence-only` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | confidence/assumption欄だけ存在し、独立source根拠はない。 | 欄の存在を正しさとせず、根拠不明をunknownとする。該当prediction根拠のsource ownerへ照合を戻す。 | 欄の存在から正解/適格化を決めたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-006-precision-threshold-unsettled` | `FR-INTELLIGENCE-L3-006-01` | `AC-INTELLIGENCE-L3-006-04` | 精度thresholdが未決の測定値。 | 測定値を記録しpass/適格化は判定しない。threshold判断を持つ既存ownerへ戻す。 | 未決thresholdから合格を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-brain-input-data-use-unprovided-normal` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-01` | 選択済みBRAIN sourceのidentity/revision/applicability/source traceは有効で、そのsourceはdata-use classを提供しない。 | sourceを正常入力としてplan candidateへ結び、未提供fieldを欠落やunknownとせずOS ticket/authorityを生成しない。 | 未提供だけを異常化、またはsourceの別の実際の不足を隠したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-brain-input-missing-identity` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 他の正常入力を保持し、選択済みBRAIN sourceのidentityだけを欠落させる。 | 欠けた知識関係をunknownとして該当source ownerへ戻し、OS ticket/authorityは作らない。 | 欠落を補完してsource identity/revision/applicabilityを確定扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-brain-input-missing-revision` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 他の正常入力を保持し、選択済みBRAIN sourceのrevisionだけを欠落させる。 | 欠けた知識関係をunknownとして該当source ownerへ戻し、OS ticket/authorityは作らない。 | 欠落を補完してsource identity/revision/applicabilityを確定扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-brain-input-missing-applicability` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 他の正常入力を保持し、選択済みBRAIN sourceのapplicabilityだけを欠落させる。 | 欠けた知識関係をunknownとして該当source ownerへ戻し、OS ticket/authorityは作らない。 | 欠落を補完してsource identity/revision/applicabilityを確定扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-brain-input-source-trace-unreachable` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 他の正常入力を保ち、選択済みBRAIN knowledgeのsource traceだけを原sourceへ辿れなくする。 | source traceをunknown/未完として該当source ownerへ照合を戻し、他の正常入力とOS境界を保持する。 | trace不能を根拠十分として確定、またはdata-use未提供だけを異常化したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-brain-input-missing-data-use` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | data-use classを提供する選択済みsourceで、identity/revision/applicability/source traceは正常のまま提供済みdata-use値だけを欠落させる。 | 提供済み値の欠落を未完として該当source ownerへ戻し、他の正常fieldとOS境界を保持する。 | 提供済み値を推測補完、または未提供sourceまで異常化したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-008-heldout-defect-clean` | `FR-INTELLIGENCE-L3-008-01` | `AC-INTELLIGENCE-L3-008-04` | 対象集合内で既知位置と異なる未見表現の欠陥とclean例を与える。 | 欠陥/cleanをTP/FN/FPへ別々に分類しscope外は未評価。 | 未見性だけで拒否、またはclean例をfinding扱いしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-009-heldout-mismatch-kind` | `FR-INTELLIGENCE-L3-009-01` | `AC-INTELLIGENCE-L3-009-03` | 未見のmismatch類型で、source/revision/producer/reproduction/falsificationが揃う例。 | 固定finding型に従いheld-outとして評価し、類型だけで拒否しない。 owner routeがfixture oracleと一致することも照合する。 | 未見類型を既知failureへ読み替えたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-014-bot-work-outside-os-assignment` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-02` | Botの実作業をOS割当scope外で実行する。 | 実作業を止めOS assignment ownerへ戻し、manifestから権限を生成しない。 | scope外実作業を許可したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-untrusted-command-input-external-command` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 外部文章のcommandだけを特権実行する。 | 未信頼操作を拒否し、authority判断をSECURITYへ戻す。 | 未信頼入力を特権実行したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-untrusted-command-input-modified-repairer` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 改変された修復器だけを特権実行する。 | 未信頼操作を拒否し、authority判断をSECURITYへ戻す。 | 未信頼入力を特権実行したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-untrusted-command-input-untrusted-input` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 未信頼入力だけを特権実行する。 | 未信頼操作を拒否し、authority判断をSECURITYへ戻す。 | 未信頼入力を特権実行したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-019-applicability-exception-fulfilled` | `FR-INTELLIGENCE-L3-019-01` | `AC-INTELLIGENCE-L3-019-04` | 正常適用candidateからapplicability exceptionだけを成立させる。他の条件とsourceは正常。 | この知識の適用を拒否し、知識正本を保持してBRAINへ戻す。 | exception成立中も適用したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-registration-004-005-confusion` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-10` | `MPR-RC-HELIXINTELLIGENCE-L2-072-004`の4 partと`...072-005`の2 partの登録IDを入替える。 | 登録identity/part数を保持し、混同を不一致として当該registration sourceへ戻す。 | 004/005登録partをL2-004/005要求と誤認、または相互代替したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-no-harness-vs-helix-absent` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | no-HarnessだがHELIXは存在するscopeと、HELIX自体が不存在のscopeを別々に与える。 | 2状態を別軸で表し、同一化しない。 | no-HarnessをHELIX不存在と同一視したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-unknown-oracle-owner-oracle` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 選択scopeのoracleだけunknown。他の入力は正常。 | winner/quality判断を保留しoracle定義を持つ既存ownerへ戻す。 | 推測したoracleで適格化したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-unknown-oracle-owner-quality-gate` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 選択scopeのquality gateだけunknown。他の入力は正常。 | winner/quality判断を保留しquality gate定義を持つ既存ownerへ戻す。 | 推測したoracleで適格化したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-human-time-excluded` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 他条件を保持し、換算率未承認のhuman時間だけを0円にする。 | human時間を独立記録し、未貨幣化costはunknownに保つ。 | 換算根拠なしにhuman時間を0円としたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-labo052-same-receipt-normal` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-01` | contract version/compatibility/scope一致、LABO052と同一結果receipt。 | 同一結果receiptを追跡しproposalの適用可能性を評価する。 | receipt不一致またはscope違いを同一結果としたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-engine-assignment-switch-engine` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 他正常条件を保持し、067の入力契約proposalだけから新engineを生成する。 | proposalのまま保持し、実assignment/切替はOSの別判断へ残す。 | proposalだけから新engineを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-engine-assignment-switch-assignment` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 他正常条件を保持し、067の入力契約proposalだけからassignmentを生成する。 | proposalのまま保持し、実assignment/切替はOSの別判断へ残す。 | proposalだけからassignmentを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-engine-assignment-switch-worker` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 他正常条件を保持し、067の入力契約proposalだけから自動Worker差替えを生成する。 | proposalのまま保持し、実assignment/切替はOSの別判断へ残す。 | proposalだけから自動Worker差替えを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-engine-assignment-switch-model` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 他正常条件を保持し、067の入力契約proposalだけから自動model差替えを生成する。 | proposalのまま保持し、実assignment/切替はOSの別判断へ残す。 | proposalだけから自動model差替えを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-price-model-benchmark-only-price` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | priceだけを根拠にwinnerを出す。他の品質根拠は与えない。 | 優先条件・品質根拠がないwinnerを生成しない。 | 単一指標だけでwinnerを決定したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-price-model-benchmark-only-model` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | model名だけを根拠にwinnerを出す。他の品質根拠は与えない。 | 優先条件・品質根拠がないwinnerを生成しない。 | 単一指標だけでwinnerを決定したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-price-model-benchmark-only-benchmark` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | benchmark値だけを根拠にwinnerを出す。他の品質根拠は与えない。 | 優先条件・品質根拠がないwinnerを生成しない。 | 単一指標だけでwinnerを決定したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-priority-undefined` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | priorityが未定義のmetricでwinnerを出す。 | 未定義metricを保持しwinnerを保留する。 | priorityを補ってwinnerを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-072-reassessment-new-revision-shadow-pending` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-11` | `CASE-INTELLIGENCE-L10-2607-072-51`と同じsource tuple更新およびcandidate revision/digestを与えるが、新revisionのshadow receipt/evaluationだけ未取得にする。 | 新revisionをshadow未完として保持し、review済み/activeへ昇格しない。 | shadow/evaluation未取得の新revisionを完了扱い、または旧receiptを流用したら不合格。新規Worker実験を一律必須にはしない。 |
| `CASE-INTELLIGENCE-L10-R2607-073-free-text-cannot-create-authority-identity` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | 自由文だけからRequirement identityを作成する。 | 自由文をcandidateのまま保持し、それらのauthority/resultを新設しない。 | 自由文のみでidentity/revision/result/authorityを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-free-text-cannot-create-authority-revision` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | 自由文だけからRequirement revisionを変更する。本文とidentityは既存のまま保持する。 | 自由文をcandidateのまま保持し、それらのauthority/resultを新設しない。 | 自由文のみでidentity/revision/result/authorityを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-free-text-cannot-create-authority-ci-result` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | 自由文だけからCI実行結果を生成する。実行要求とpass状態は別fixtureで照合する。 | CI実行結果を生成せず、自由文をcandidateに保持する。 | 自由文のみでCI結果を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-new-ci-gate` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | 候補から新CI停止/起動またはgateを追加する。 | 既存CI/review経路を保持し新gateを追加しない。 | 新規CI gateを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-073-review-merge-admission` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | 候補で既存review/merge admissionを置換または追加制約する。 | 既存admissionのまま保持し候補を権限化しない。 | admissionを候補で変更したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-condition-values-hidden-protocol` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同corpus/scope内でrun protocolだけをcurrent/candidate間で異ならせ、差を隠す。他の実行条件は一致。 | 差を比較不能/条件差として保持しINTELLIGENCE判断へ戻す。 | 条件差を隠して同条件勝敗を出したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-condition-values-hidden-hardware` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同corpus/scope内でhardware classだけをcurrent/candidate間で異ならせ、差を隠す。他の実行条件は一致。 | 差を比較不能/条件差として保持しINTELLIGENCE判断へ戻す。 | 条件差を隠して同条件勝敗を出したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-condition-values-hidden-cache` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同corpus/scope内でcache conditionだけをcurrent/candidate間で異ならせ、差を隠す。他の実行条件は一致。 | 差を比較不能/条件差として保持しINTELLIGENCE判断へ戻す。 | 条件差を隠して同条件勝敗を出したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-condition-values-hidden-intervention` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同corpus/scope内でhuman intervention conditionだけをcurrent/candidate間で異ならせ、差を隠す。他の実行条件は一致。 | 差を比較不能/条件差として保持しINTELLIGENCE判断へ戻す。 | 条件差を隠して同条件勝敗を出したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-miss-fp-dropped-miss` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 正常集計からmiss一件だけを落とす。 | miss/FP双方を比較scope内に個別保持する。 | 必要scope結果からmiss/FPを削除したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-miss-fp-dropped-fp` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 正常集計からFP一件だけを落とす。 | miss/FP双方を比較scope内に個別保持する。 | 必要scope結果からmiss/FPを削除したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-cost-priced-normal` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | pricing source、currency、effective time、billing category、cost valueが揃った正常cost record。 | pricing basisに紐づく費用を記録し、他quality条件と別軸にする。 | pricing source等を失う、またはprice単独winnerにしたら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-003-order-and-missing-heldout` | `FR-INTELLIGENCE-L3-003-01` | `AC-INTELLIGENCE-L3-003-03` | 未見source field順序とdependency revision一つの欠落を同時に与える。 | 順序に頑健なtraceは維持し、欠けたedgeだけunknownとしてsource ownerへ戻す。 | 未見順序だけで拒否、またはmissing edgeを推測補完したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-005-risk-condition-missing` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-02` | 他の正常plan入力を保ち、risk条件だけ欠落させる。 | riskだけunknown/未完として該当入力ownerへ戻し、OS ticketを作らない。 | riskを推測補完、またはplanをticket化したら不合格。 |
| `CASE-INTELLIGENCE-L10-2607-016-02-untrusted-positive` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-01` | 別の宣言済みuntrusted candidateでtarget/actor/write-set/side-effect/budget/deadline/retry/scope/recoveryが整い、特権実行なし。 | candidate境界と全束縛を保ち、実行許可/actual resultを生成しない。 | 入力妥当性から権限や実行を推論したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-005-heldout-graph-risk-normal` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-03` | 未公開task graph D→Eと独立F、risk条件一つ、stop/fallback、approved target/current contractを固定する。 | 依存順序・実現可能性・stop/fallbackが事前oracleに一致し、OSへ渡すproposalのまま返す。 | risk/依存を隠す、またはticket/assignmentを出したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-016-worker-result-original-oracle-normal` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-04` | 既存authority/OS assignmentに結ぶWorker結果で元test/oracleが通り、要求/設計/verification obligationの同revisionを保持する。 | 元oracle passと意味不変を個別照合し、実行許可や新義務を生成しない。 | 元oracle不合格または意味変更を正常修復としたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-067-intervention-omitted-total` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 有効な換算根拠と他の費用fieldを保ち、介入費用だけを除いた額を総費用と主張する。 | 介入を除いた額を総費用としない。総費用を不完全／unknownとして保持し、欠けた介入内訳をLABOへ戻す。内訳が揃うまで総費用の完全性を主張しない。 | 介入除外額を総費用としたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-price-basis-difference-hidden` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同corpus/scopeの比較で価格根拠だけを異ならせ、差を隠して同条件と主張する。 | 価格根拠差を別条件として記録し、比較判断を保留してINTELLIGENCEの判断へ戻す。価格根拠のsource recordに不足があればその記録の提供元へ補足を求める。 | 価格根拠差を隠した同条件勝敗を出したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-011-result-outside-necessary-scope` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-04` | 同条件の正常比較結果へ必要scope外の一結果だけを混ぜる。 | 必要scopeの結果だけに限定しscope外を未評価に保つ。 | scope外結果を同じ比較に集約したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-04-011-updated-name-only` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 同条件の正常比較入力を保持し、modelの更新名だけを理由にcandidateを上位と判定する。 | 更新名だけでは優位判定せず、軸別結果と比較条件を保持する。 | 更新名だけで優位判定したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-04-011-comparison-auto-swap` | `FR-INTELLIGENCE-L3-011-01` | `AC-INTELLIGENCE-L3-011-02` | 正常な同条件比較結果だけを根拠にmodel差替えの自動実行を成立させる。 | 比較結果に留め、自動差替えを実行しない。 | 比較結果から自動差替えしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-04-014-bot-identity-authority` | `FR-INTELLIGENCE-L3-014-01` | `AC-INTELLIGENCE-L3-014-04` | 正常manifestと既存actor authorityを保持し、新しいBot identityの追加だけを根拠に操作権限を推論する。 | Bot identityから操作権限を生成せず、正常manifestをcandidateのまま保持し、通常INTELLIGENCE判断へ戻す条件を新設しない。 | Bot identityの追加だけから操作権限を生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-04-073-free-text-merge-operation-authority` | `FR-INTELLIGENCE-L3-073-01` | `AC-INTELLIGENCE-L3-073-02` | 自由文だけを根拠にmerge操作のauthorityを生成する。admissionとmerge状態は既存のまま保持する。 | 操作authorityを生成せずcandidate提示に留め、既存GitHub判断経路を保持する。 | 自由文単独でmerge操作authorityを生成したら不合格。 |

## review06 — 078 fallbackの独立反例（未実行）

| CASE | FR | AC | 入力fixture | 期待oracle | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-identity` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 選択sourceの正常closureを保ち、必要なdependency identityだけ欠落した入力に、代行者の主張だけで欠落を省けるというclaimを加える。選択source owner参照は独立の有効receiptで保持する。 | 固定L11:376の代行主張によるidentity省略を拒否し、対象closureをincompleteとして該当operationだけ保留する。選択source ownerへ不足を返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-owner` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 選択sourceの正常closureを保ち、必要なdependency ownerだけ欠落した入力に、代行者の主張だけで欠落を省けるというclaimを加える。選択source owner参照は独立の有効receiptで保持する。 | 固定L11:376の代行主張によるowner省略を拒否し、対象closureをincompleteとして該当operationだけ保留する。選択source ownerへ不足を返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-version` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 選択sourceの正常closureを保ち、必要なdependency versionだけ欠落した入力に、代行者の主張だけで欠落を省けるというclaimを加える。選択source owner参照は独立の有効receiptで保持する。 | 固定L11:376の代行主張によるversion省略を拒否し、対象closureをincompleteとして該当operationだけ保留する。選択source ownerへ不足を返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-proxy-claim-evidence` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 選択sourceの正常closureを保ち、必要なdependency evidenceだけ欠落した入力に、代行者の主張だけで欠落を省けるというclaimを加える。選択source owner参照は独立の有効receiptで保持する。 | 固定L11:376の代行主張によるevidence省略を拒否し、対象closureをincompleteとして該当operationだけ保留する。選択source ownerへ不足を返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-selected-read-fallback` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 正常closureの選択sourceだけread失敗とし、失敗を根拠に未選択sourceへ切替える出力を加える。source identity/revisionとowner receiptは有効に保持する。 | 固定L11:376の失敗からの別source切替を拒否する。選択sourceのread失敗と未完義務を保持し、当該選択source ownerへ返す。未選択sourceの成立を生成しない。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-selected-qualification-fallback` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 正常closureの選択sourceだけqualification失敗とし、失敗を根拠に未選択sourceへ切替える出力を加える。source identity/revisionとowner receiptは有効に保持する。 | 固定L11:376の失敗からの別source切替を拒否する。選択sourceのqualification失敗と未完義務を保持し、当該選択source ownerへ返す。未選択sourceの成立を生成しない。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-unreadable-receipt-other-receipt` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 正常入力の選択receiptだけを読取不能にし、他receiptで選択receiptを代用する出力を加える。選択source owner参照は独立の有効束縛から特定する。 | 固定L11:381に従い他receiptへのfallbackを拒否し、選択receiptの確認をincompleteとして保持して当該選択source ownerへ返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-unreadable-receipt-unselected-source` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 正常入力の選択receiptだけを読取不能にし、未選択sourceで選択receiptを代用する出力を加える。選択source owner参照は独立の有効束縛から特定する。 | 固定L11:381に従い未選択sourceへのfallbackを拒否し、選択receiptの確認をincompleteとして保持して当該選択source ownerへ返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |
| `CASE-INTELLIGENCE-L10-R2607-078-unreadable-receipt-reference-only` | `FR-INTELLIGENCE-L3-078-01` | `AC-INTELLIGENCE-L3-078-10` | 正常入力の選択receiptだけを読取不能にし、reference-only資料で選択receiptを代用する出力を加える。選択source owner参照は独立の有効束縛から特定する。 | 固定L11:381に従いreference-only資料へのfallbackを拒否し、選択receiptの確認をincompleteとして保持して当該選択source ownerへ返す。 | 拒否せず成功にする、他sourceで補完する、または元のscope/authorityを変えるなら不合格。 |

## review08 固定親の単独反例・未見・比較対照追補

各fixtureは実行済み成果ではなく検証設計である。明示した一条件以外のsource/revision/scope/authorityと既存正常条件を保持する。

| CASE ID | L3 FR | L3 AC | 入力fixture／単独変異 | 期待oracle | 不合格条件 |
|---|---|---|---|---|---|
| `CASE-INTELLIGENCE-L10-R08-005-prerequisite-unfulfilled` | `FR-INTELLIGENCE-L3-005-01` | `AC-INTELLIGENCE-L3-005-04` | 承認済み目標、宣言済みA→B依存、独立C、stop/fallbackの正常graphで、Aのprerequisite達成状態だけを未充足にする。依存宣言や順序は欠落しない。 | Bを実行可能としたproposalを拒否し、未充足条件と既存source ownerを示して計画を未確定に保つ。独立Cの成立部分と依存宣言を保持し、ticket/assignmentを生成しない。 | 未充足Aを達成済みへ補完してBを実行可能としたら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-016-heldout-result-same-scope` | `FR-INTELLIGENCE-L3-016-01` | `AC-INTELLIGENCE-L3-016-03` | 未公開の同scope局所欠陥variant。9束縛が正常なcandidateと既存authority/OS assignmentに結ぶWorker resultを別入力として受け、同じ既存test/oracleの再検査結果と要求/設計/verification obligationの同revisionを与える。 | 修復されたseeded counterexampleと既存正常caseの回帰なしが元oracleと一致することを照合する。candidate生成と結果照合を別状態に保ち、SECURITY許可/Worker実行/HARNESS検証/OS検収を代行・生成しない。 | 未見性だけの拒否、元oracleの差替え、回帰を成功にする、単体結果を接続成功へ昇格したら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-067-evaluation-scope-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 同scopeで有効なquality/order decisionとINT034経由LABO評価packetが正常な未見対照から、評価packetのscopeだけを欠落させる。source locator・同一結果receipt・他fieldは有効。 | 当該packetのscope不足を未受領/未評価として送信元LABOへ戻す。既決decisionと既知proposal入力は保持し、評価対象範囲を推測しない。 | 他sourceやdecisionの値で評価packetを補完、未評価を成功にする、無関係部分まで一括停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-067-evaluation-revision-missing` | `FR-INTELLIGENCE-L3-067-01` | `AC-INTELLIGENCE-L3-067-04` | 同scopeで有効なquality/order decisionとINT034経由LABO評価packetが正常な未見対照から、評価packetのrevisionだけを欠落させる。source locator・同一結果receipt・他fieldは有効。 | 当該packetのrevision不足を未受領/未評価として送信元LABOへ戻す。既決decisionと既知proposal入力は保持し、評価対象範囲を推測しない。 | 他sourceやdecisionの値で評価packetを補完、未評価を成功にする、無関係部分まで一括停止したら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-shadow-pair-normal` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-07` | 同じ対象scope/revision/case集合/oracleでcandidateあり・なしのshadow結果を対にし、既知FP/FN/unknown/seeded counterexampleと各結果、既存rollback先・戻し条件・当該版evidenceを正常に束縛する。 | 各側のFP/FN/unknown/反例と差を原結果からscorecardへ照合し、同versionのrollback参照を保持する。比較成立は採用優位・active・強制gate・実判断変更を生成しない。 | 片側結果やunknown/反例の欠落、oracle差替え、比較結果からauthorityを生成したら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-invented-threshold-reject` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-07` | 同じ対象scope/revision/case集合/oracleでcandidateあり・なしのshadow結果を対にし、既知FP/FN/unknown/seeded counterexampleと各結果、既存rollback先・戻し条件・当該版evidenceを正常に束縛する。結果評価時の閾値だけを根拠のない新値へ変え、差を成功扱いする入力。 | 新閾値による成功化を拒否し、元oracleと両shadow結果を保持して当該比較を未評価としてLABOへ照合を戻す。 | 閾値創作で成功/優位を確定したら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-added-case-success-reject` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-07` | 同じ対象scope/revision/case集合/oracleでcandidateあり・なしのshadow結果を対にし、既知FP/FN/unknown/seeded counterexampleと各結果、既存rollback先・戻し条件・当該版evidenceを正常に束縛する。成功判定のcase集合だけへcandidate側の成功caseを追加する入力。 | 同一case比較の不成立を検出し比較不能/未評価を保持してLABOへ戻す。元case集合と両側結果は消さない。 | case追加による差を同条件の成功として扱ったら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-external-knowledge-required-reject` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-08` | 1.0の正常candidate生成入力に、選択していない2.0外部知識取得だけを全1.0候補の必須依存として加える。対象scope/sourceは正常。 | 外部取得の無条件必須化を拒否し、固定1.0生成条件でcandidateを生成できる状態を保持する。shadow/reviewは後続義務のままにし、2.0能力の実行を要求しない。 | 未選択2.0取得がない理由で1.0候補生成を停止、又は2.0を1.0能力へ前倒ししたら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-heldout-process-outside` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-04` | 未公開scopeのpack入力で工程だけを宣言適用条件外へ変える。他のdomain/risk/authority/version/sourceは正常。 | 該当適用facetをunknown/非適用として既存適用条件のsource ownerへ戻し、既知の正常facetは保持する。既定checklistへのfallbackやgate強制を行わない。 | 未見条件外を適用可能へ推測、又は自動fallbackしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-heldout-failure-mode-outside` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-04` | 未公開scopeのpack入力でfailure modeだけを宣言適用条件外へ変える。他のdomain/risk/authority/version/sourceは正常。 | 該当適用facetをunknown/非適用として既存適用条件のsource ownerへ戻し、既知の正常facetは保持する。既定checklistへのfallbackやgate強制を行わない。 | 未見条件外を適用可能へ推測、又は自動fallbackしたら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-applicability-authority-mismatch` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02` | 正常な対象packのscope/version/sourceとshadow条件を保持し、authority参照だけを当該packの適用根拠と不一致にする。 | 不一致facetを適用可能とせずunknown/未評価として該当source ownerへ返す。authority参照の不一致は既存authorityの対象ownerへ戻し、追加許可・gate強制を生成しない。 | 不一致を互換として推測する、無関係なfieldを補完、又は実判断を変えたら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-applicability-risk-mismatch` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02` | 正常な対象packのscope/version/sourceとshadow条件を保持し、riskだけを当該packの適用根拠と不一致にする。 | 不一致facetを適用可能とせずunknown/未評価として該当source ownerへ返す。追加許可・gate強制を生成しない。 | 不一致を互換として推測する、無関係なfieldを補完、又は実判断を変えたら不合格。 |
| `CASE-INTELLIGENCE-L10-R08-072-applicability-failure-mismatch` | `FR-INTELLIGENCE-L3-072-01` | `AC-INTELLIGENCE-L3-072-02` | 正常な対象packのscope/version/sourceとshadow条件を保持し、failure modeだけを当該packの適用根拠と不一致にする。 | 不一致facetを適用可能とせずunknown/未評価として該当source ownerへ返す。追加許可・gate強制を生成しない。 | 不一致を互換として推測する、無関係なfieldを補完、又は実判断を変えたら不合格。 |
## Stage 5 — INTELLIGENCE機能fixture（採択済みL2の9親）

状態: 以下は未実行fixture設計。対象はこの9親と個別operationのscopeに限り、L3承認や実動作合格を示さない。各negative rowは列記した一変数だけを変え、独立した反例と期待oracleを持つ。

### CASE-INT-060-01 — 計画候補の正常例 (AC-INT-060-01)

入力: approved requirement revision, HARNESS process contract source identity/owner/revision, current OS state, applicable BRAIN source, graph A→B plus independent C and stop condition. 期待oracle: node/source/edge traceとcandidateの順序はL11-060/005 oracleに一致する。OSだけが別途ticket/進行する。

### CASE-INT-060-02 — 独立計画反例 (AC-INT-060-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-060-02a` | 未承認requirement stateだけを実行可能とする | planを実行可能にせず該当requirement ownerへ戻す。 |
| `CASE-INT-060-02b` | HARNESS contract revisionだけstale | affected nodeだけ保留しHARNESS ownerへ戻す。 |
| `CASE-INT-060-02c` | OS current stateだけstale | affected planning inputを保留しOS state ownerへ戻す。 |
| `CASE-INT-060-02d` | HARNESS process contract source identityが明示された状態でA→B依存だけ逆転 | 不合格。BをAより前へ置かず、明記されたHARNESS process contract source/contract ownerへ戻す。 |
| `CASE-INT-060-02e` | 4.0 workflowだけを1.0必要条件へ追加する | 不合格。4.0を要求せず、固定L2-060のscope内のcandidateを保持する。 |
| `CASE-INT-060-02f` | INTELLIGENCEがOS ticketを発行する | 発行を拒否しticket/推進authorityをOSへ保持する。 |

### CASE-INT-060-03 — 未見計画graph (AC-INT-060-03)

入力: 未公開task graph, declared dependency edge, independent task node, one stop condition. 期待oracle: declared edgeだけ順序化し、独立nodeは依存させず、OS assignment/ticketを生成しない。

### CASE-INT-060-04 — 依存入力unknown (AC-INT-060-04)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-060-04a` | selected BRAIN knowledge applicabilityだけunknown | source fieldをunknownに保ちBRAIN ownerへ返す。 |
| `CASE-INT-060-04b` | HARNESS process contract source identityが明示された状態でgraphの一dependency identityだけ未宣言 | dependencyを解消済みに扱わず、明記されたHARNESS source/contract ownerへ返し、独立branchは保持する。 |

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

入力: 同じtarget revision/scopeを持つ個別SECURITY permission（operation admission/actor/scope）、Worker result、HARNESS verification、OS acceptance-stage input receipts. 期待oracle: 四段階を別receiptで順序づけ、各owner authorityを保ち、acceptance inputまで未完状態を落とさない。

### CASE-INT-062-02 — 修復段階の独立反例 (AC-INT-062-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-062-02a` | SECURITY permission receiptだけ欠落 | 該当stage未成立、SECURITY ownerへ戻す。 |
| `CASE-INT-062-02b` | permission actorだけ別対象（scopeは正常例と同じ） | operation未許可のままSECURITY ownerへ戻す。 |
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
| `CASE-INT-063-02f` | BRAIN applicabilityだけ未承認/unknown | BRAIN candidateをgeneric knowledgeにせず、適用性確認をBRAIN ownerへ戻す。 |
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
| `CASE-INT-069-04a` | service ruleだけ欠落 | throughput/timeを創作せず計算不能/部分unknownを返す。source ownerが明示されている場合だけ照合し、特定できなければ戻し先unknown。 |
| `CASE-INT-069-04b` | selected cost source identityを明示した上でcost rateだけ別revision | mixed-revision costを拒否しProduct Core/HARNESS/SECURITYへ照合する。 |
| `CASE-INT-069-04c` | unit labelだけ不一致 | 照合不能をunknownとし暗黙換算しない。source/modelが特定できる場合だけ既存source ownerへ戻す。 |
| `CASE-INT-069-04d` | priceだけ欠落 | cost unknownのまま。0 costにしない。 |
| `CASE-INT-069-04e` | reporting branchに宣言されていないDB dependency edgeを追加する | edgeを追加せずreporting stateを不変にする。原因source/ownerが入力で識別できる場合だけ照合し、識別できなければ戻し先unknown。 |
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
| `CASE-INT-070-05f` | L2-033で選択したProduct Core source identity/contractを固定し、payload missing relationだけを新必須fieldへ黙って変換 | candidate独自schema追加を拒否し不成立を保持し、固定済みL2-033 source/contract ownerへ戻す。 |

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
| `CASE-INT-070-06h` | 040 send receiptだけ遅着 | 元scenario/time/correlationへ結び、sendだけを記録しconsumer receiptを生成しない。送達責務は既存040 ownerに保持する。 |
| `CASE-INT-070-06i` | LABO-024 consumer receiptだけ遅着 | 元scenario/time/correlationへ結び、consumer受領だけを記録しLABO評価成立を生成しない。consumer receipt不足はLABOに保持する。 |

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
| `CASE-INT-077-03g` | Future Synthesis consumer/ownerがunknownのまま、route/ownerだけを推測 | route/ownerを作らずunknown/incompleteを保持する。L11:361に従いsource/qualificationは該当source owner、consumer自体が未特定ならunknownのまま上流scope照合。 |
| `CASE-INT-077-03h` | Releaseだけ直接変更 | writeを拒否し、既存release authority/stateを不変にする。戻し先は推測しない。 |
| `CASE-INT-077-03i` | Assignmentだけ直接変更 | writeを拒否し、OSのassignment authority/stateを不変にする。 |
| `CASE-INT-077-03j` | merge authority/stateだけ直接変更 | writeを拒否し、merge authority/stateを不変にする。戻し先は推測しない。 |
| `CASE-INT-077-03k` | 索引のみ。同じunknown→neutral変異の `CASE-INT-077-05b` を参照。 | 05bだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-077-03l` | 索引のみ。同じunknown→unchanged変異の `CASE-INT-077-05c` を参照。 | 05cだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-077-03m` | 索引のみ。同じunknown→observed変異の `CASE-INT-077-05d` を参照。 | 05dだけを独立fixtureに計上し、この行を別negative数へ加えない。 |

### CASE-INT-077-04 — 未見source/consumer (AC-INT-077-04)

固定L11の未見例を保持する。選択receiptについてowner、origin type、revision、qualification evidenceのいずれか一つが欠落/不一致または未見なら、candidateをunknown/incompleteに保ち、未選択receiptやreference-only資料へfallbackしない。明示済みexisting owner identityとの照合成功は正常側に別記し、owner identity不明時は新owner/routeを作らない。



#### Stage 5 独立fixture補完（AC参照はL3補完表に対応）

各行は別fixtureで一項目だけ変え、表にない条件は正常のまま固定する。正常/未見正常は既存CASE-INT-*-01/03/04を保持し、下表を同じCASE IDの集約negative件数として数えない。

| CASE | 親/AC | 入力の単独変異 | 期待oracle・戻し先 |
|---|---|---|---|
| `CASE-INT-060-05a` | 060/AC-INT-060-05 | 索引のみ。同じapproved requirement revision欠落の `CASE-INT-060-06a` を参照。 | 06aだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-060-05b` | 060/AC-INT-060-05 | 索引のみ。同じHARNESS process contract欠落の `CASE-INT-060-06f` を参照。 | 06fだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-060-05c` | 060/AC-INT-060-05 | 索引のみ。同じcurrent OS state欠落の `CASE-INT-060-06i` を参照。 | 06iだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-060-05d` | 060/AC-INT-060-05 | 索引のみ。同じ選択BRAIN knowledge欠落の `CASE-INT-060-06l` を参照。 | 06lだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-060-05e` | 060/AC-INT-060-05 | stop conditionだけ欠落 | stop条件を推測せずaffected planを未完にする。固定L2が個別ownerを指定しないため戻し先unknown。 |
| `CASE-INT-060-05f` | 060/AC-INT-060-05 | 宣言済みstop時のfallbackだけ欠落 | fallbackを補完せず影響nodeとstop理由を保持してsource ownerへ戻す。 |
| `CASE-INT-060-05g` | 060/AC-INT-060-05 | HARNESS process contract source identityが明示された上でdependency cycleだけ存在 | 解決済み順序を出さずplanを未完にし、明記されたHARNESS source/contract ownerへ戻す。 |
| `CASE-INT-060-05h` | 060/AC-INT-060-05 | HARNESS process contract source identityだけunknown | dependencyを解決済みにせずunknownを保持し、入力に含むHARNESS source/contract ownerへ戻す。 |
| `CASE-INT-060-05i` | 060/AC-INT-060-05 | declared stop後の指定fallback（正常） | 指定fallbackだけを同じsource/scopeで適用し、ticket発行はOSに残す。 |
| `CASE-INT-061-05a` | 061/AC-INT-061-05 | compatibility evidenceだけ未見 | 評価互換性をunknownに保ちLABOへ戻す。 |
| `CASE-INT-061-05b` | 061/AC-INT-061-05 | task scopeだけunknown | 適用範囲を確定せずINTELLIGENCEへ戻す。 |
| `CASE-INT-061-05c` | 061/AC-INT-061-05 | assignment可否だけunknown | proposalをassignmentにせずOSへ戻す。 |
| `CASE-INT-061-05d` | 061/AC-INT-061-05 | task identityだけ別段階receiptから流用 | identity不一致を検出しproposalを未確定にしてINTELLIGENCEへ戻す。 |
| `CASE-INT-061-05e` | 061/AC-INT-061-05 | revisionだけ異なる段階receiptから流用 | stale/別revisionを混ぜず、source/evaluationならLABO、assignmentならOSの既存責務に従う。 |
| `CASE-INT-061-05f` | 061/AC-INT-061-05 | 評価理由だけ欠落 | proposalを未確定のままLABO評価へ戻し、他のscope/evidenceは保持する。 |
| `CASE-INT-062-04a` | 062/AC-INT-062-04 | isolation evidenceだけ欠落 | 実行成立にせずSECURITYへ戻す。 |
| `CASE-INT-062-04b` | 062/AC-INT-062-04 | 索引のみ。同じrepair candidate欠落の `CASE-INT-062-05a` を参照。 | 05aだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-062-04c` | 062/AC-INT-062-04 | targetだけ別revision | CASE-INT-062-02dと同じtarget revision変異の索引。独立fixture数へ重ねない。 |
| `CASE-INT-062-04d` | 062/AC-INT-062-04 | SECURITY permission stageのscopeだけ別 | 他scopeのpermissionを流用せず、このstageを未成立としてSECURITY ownerへ戻す。Worker/HARNESS/OS段階は正常のまま保持する。 |
| `CASE-INT-062-04e` | 062/AC-INT-062-04 | SECURITY permission receipt revisionだけstale | stale permissionを適用せずSECURITY ownerへ戻す。ほかのstage receiptは保持する。 |
| `CASE-INT-062-04f` | 062/AC-INT-062-04 | SECURITY permission stageのowner identityだけ別 | 誤ったpermission ownerを採用せず、このstageを未成立として固定ownerのSECURITYへ戻す。その他のstage ownerは正常のまま保持する。 |
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
| `CASE-INT-070-07a` | 070/AC-INT-070-07 | HELIXINTELLIGENCE-L2-040送達契約だけ欠落 | send未成立を保持し、CONNECT・当該connector契約ownerへ戻す。 |
| `CASE-INT-070-07b` | 070/AC-INT-070-07 | HELIXINTELLIGENCE-L2-040送達契約revisionだけ不一致 | send receiptを結ばず、CONNECT・当該connector契約ownerへ戻す。 |
| `CASE-INT-070-07c` | 070/AC-INT-070-07 | correlationだけ別 | 別operationのreceiptを混ぜず、接続状態を未確定に保つ。固定L2が戻し先を指定しないため戻し先unknown。 |
| `CASE-INT-070-07d` | 070/AC-INT-070-07 | target scopeだけ別 | 対象scopeのsend未完として保持し、固定L2が明記するsource ownerへ照合する。 |
| `CASE-INT-070-07e` | 070/AC-INT-070-07 | LABO-024 consumer contractだけ欠落 | consumer受領を成立させずLABOへ戻す。 |
| `CASE-INT-070-07f` | 070/AC-INT-070-07 | LABO-024 contract revisionだけ不一致 | 別版consumer契約を流用せずLABOへ戻す。 |
| `CASE-INT-070-07g` | 070/AC-INT-070-07 | input source identityだけ不一致 | stage bindingを失敗にし該当source ownerへ戻す。 |
| `CASE-INT-070-07h` | 070/AC-INT-070-07 | model identityだけ不一致 | resultを結ばずCORE model authorityであるProduct Core/HARNESSへ照合する。 |
| `CASE-INT-070-07i` | 070/AC-INT-070-07 | data-use bindingだけ欠落 | 計算/送達への利用を成立扱いせず該当SECURITY/source ownerへ戻す。 |
| `CASE-INT-070-07j` | 070/AC-INT-070-07 | 選択connector登録だけ欠落 | 通信段階を未完に保ちCONNECTへ戻す。source identity不一致は07g/07hで照合する。 |
| `CASE-INT-070-07k` | 070/AC-INT-070-07 | 選択connector互換判定だけstale | 通信段階を未完に保ちCONNECTへ戻す。 |
| `CASE-INT-070-07l` | 070/AC-INT-070-07 | 選択connector transport receiptだけ欠落 | 送達未成立を保持しCONNECTへ戻す。 |
| `CASE-INT-070-08a` | 070/AC-INT-070-08 | simulation statusだけactualへ変更 | 索引のみ。同じsimulation→actual変異の `CASE-INT-070-05c` を参照し、独立fixture数へ加えない。 |
| `CASE-INT-070-08b` | 070/AC-INT-070-08 | predictionとactual source identityだけ同一化 | 二つのsource/時点を分離し、actual evaluationはLABOに残す。 |
| `CASE-INT-070-08c` | 070/AC-INT-070-08 | later observation windowだけ不一致 | 比較を保留しunknownを維持する。LABOは独立評価ownerとして保持し、このidentity/window不一致だけでは返却先を追加しない。 |
| `CASE-INT-070-08d` | 070/AC-INT-070-08 | 未決閾値だけpass/failへ変異 | 測定値のみ保持し閾値判断を作らない。固定L2に戻し先がないため戻し先unknown。 |
| `CASE-INT-070-08e` | 070/AC-INT-070-08 | 未選択consumer fieldだけ一般互換と解釈 | 外挿せずunknownを保持し、未選択consumerへのrouteを作らない。戻し先unknown。 |
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
| `CASE-INT-074-05j` | 074/AC-INT-074-05 | comparison scopeだけ別 | 比較scopeを混ぜずfeedbackを未適用に保ちLABOへ戻す。 |
| `CASE-INT-074-05k` | 074/AC-INT-074-05 | feedback target revisionだけ別 | current evidenceへ流用しない。 |
| `CASE-INT-074-05l` | 074/AC-INT-074-05 | 02bと同じ異なるtask classのevidenceだけを適用 | 別taskへ転用せずLABO evidence scope不一致としてLABOへ戻す。完全ID索引として02bを参照し、独立negative件数へ重ねない。 |
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
| `CASE-INT-074-05w` | 074/AC-INT-074-05 | 正常feedbackのtrace（正常fixture） | return reason、missing input/oracle、再発行後verification状態、母集団/window、再評価条件を同一評価receiptへ結ぶ。LABO評価だけでproposalの正しさを保証しない。 |
| `CASE-INT-074-05x` | 074/AC-INT-074-05 | 同じ理由class・宣言済み同scopeの未見正常例 | 根拠の引用と再評価条件を保ち、成功や適格性は自動生成しない。 |
| `CASE-INT-074-05y` | 074/AC-INT-074-05 | 索引のみ。同じcomparison scope mismatchの `CASE-INT-074-05j` を参照。 | 05jだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-074-05z` | 074/AC-INT-074-05 | evidenceだけ不足（scopeは一致） | scope一致を保ちつつevidence不足だけで評価適用を成立させず、LABOへ戻す。 |
| `CASE-INT-074-05aa` | 074/AC-INT-074-05 | task class/domain入力は存在するが、LABO evaluation evidenceのtask class/domainだけ不一致。評価receiptだけでproposal適格性を確定 | L2-074:612とL2-010:104の根拠を照合し、evidence scope不一致としてLABOへ戻す。proposalは未確定のまま保つ。 |
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
| `CASE-INT-060-06a` | 060/AC-INT-060-06 | approved requirement revisionだけ欠落 | planを実行可能にせず、該当requirement sourceへ戻す。 |
| `CASE-INT-060-06b` | 060/AC-INT-060-06 | approved requirement revisionだけunknown | requirement状態をunknownのまま保持し、他入力で埋めず該当sourceへ戻す。 |
| `CASE-INT-060-06c` | 060/AC-INT-060-06 | approved requirement revisionだけstale | 当該requirementを使うnodeだけ保留しrequirement sourceへ戻す。 |
| `CASE-INT-060-06d` | 060/AC-INT-060-06 | HARNESS process contractだけunknown | 適用contractを推測せずHARNESSへ戻す。 |
| `CASE-INT-060-06e` | 060/AC-INT-060-06 | 索引のみ。同じHARNESS contract stale変異の `CASE-INT-060-02b` を参照。 | 02bだけを独立fixtureに計上する。 |
| `CASE-INT-060-06f` | 060/AC-INT-060-06 | HARNESS process contractだけ欠落 | 対応nodeを保留しHARNESSへ戻す。 |
| `CASE-INT-060-06g` | 060/AC-INT-060-06 | OS current stateだけunknown | current state依存nodeをunknownに保ちOS state ownerへ戻す。 |
| `CASE-INT-060-06h` | 060/AC-INT-060-06 | 索引のみ。同じOS state stale変異の `CASE-INT-060-02c` を参照。 | 02cだけを独立fixtureに計上する。 |
| `CASE-INT-060-06i` | 060/AC-INT-060-06 | OS current stateだけ欠落 | affected planだけ保留しOS state ownerへ戻す。 |
| `CASE-INT-060-06j` | 060/AC-INT-060-06 | selected BRAIN knowledgeだけstale | applicabilityを流用せずBRAIN source ownerへ戻す。 |
| `CASE-INT-060-06k` | 060/AC-INT-060-06 | 索引のみ。同じBRAIN applicability unknown変異の `CASE-INT-060-04a` を参照。 | 04aだけを独立fixtureに計上する。 |
| `CASE-INT-060-06l` | 060/AC-INT-060-06 | selected BRAIN knowledgeだけ欠落 | selected knowledgeを使うnodeだけ未完にしBRAINへ戻す。 |
| `CASE-INT-061-06a` | 061/AC-INT-061-06 | task identityだけ欠落 | task別proposalを確定せずscopeを推測しない。固定L2に従いINTELLIGENCEへ戻す。 |
| `CASE-INT-061-06b` | 061/AC-INT-061-06 | Worker実績sourceだけ欠落 | 実績を未評価としLABOへ戻す。 |
| `CASE-INT-061-06c` | 061/AC-INT-061-06 | Worker実績revisionだけstale | stale実績をcurrent proposalへ流用せずLABOへ戻す。 |
| `CASE-INT-062-05a` | 062/AC-INT-062-05 | repair candidateだけ欠落 | repairを未完とし、固定L2がこの入力欠落のownerを指定しないため戻し先unknown。 |
| `CASE-INT-062-05b` | 062/AC-INT-062-05 | 有効な正常repair結果だけを既知regressionで置換 | regressionを成功扱いしない。検証はHARNESS、検収はOSの固定責務に従い、原因ownerはsourceで特定できる範囲だけ返す。 |
| `CASE-INT-062-05c` | 062/AC-INT-062-05 | HARNESS write-set外の一変更だけを結果へ加える | 対象を不合格にしHARNESS verificationへ戻す。 |
| `CASE-INT-062-05d` | 062/AC-INT-062-05 | HARNESS verification obligationだけ変更 | acceptanceに昇格させずHARNESSへ戻す。 |
| `CASE-INT-062-05e` | 062/AC-INT-062-05 | 既存HARNESS obligationの一つだけstale | 当該検証を未成立としHARNESSへ戻す。 |
| `CASE-INT-063-05a` | 063/AC-INT-063-05 | current INT judgmentだけ欠落 | historical LABO/BRAIN inputsから判断を生成せず未完を保持する。固定L2に個別return先がないため戻し先unknown。 |
| `CASE-INT-063-05b` | 063/AC-INT-063-05 | current INT judgmentだけstale | stale判断をcurrent扱いせず未確定を保持する。固定L2に個別return先がないため戻し先unknown。 |
| `CASE-INT-063-05c` | 063/AC-INT-063-05 | HARNESS process contractだけ欠落 | 工程contractを推測せず循環を未完にする。固定L2はHARNESSをcontract ownerとするが戻し先を指定しないため戻し先unknown。 |
| `CASE-INT-063-05d` | 063/AC-INT-063-05 | HARNESS process contractだけstale | stale contractで循環を成立させない。固定L2はHARNESSをcontract ownerとするが戻し先を指定しないため戻し先unknown。 |
| `CASE-INT-069-08a` | 069/AC-INT-069-08 | selected model source identityを明示した上でmodel revisionだけstale | 計算をcurrent結果として結ばずProduct Core/HARNESS/SECURITYへ照合する。 |
| `CASE-INT-069-08b` | 069/AC-INT-069-08 | model schema versionだけ欠落 | schema適用をunknownにする。固定L2-069が指定するmodel ownerへ照合し、具体的owner identityが入力で特定された場合だけそのownerへ返す。 |
| `CASE-INT-069-08c` | 069/AC-INT-069-08 | finite state setだけ欠落 | stateを補わず未対応/unknownとし、選択source ownerが明示される場合だけ照合する。 |
| `CASE-INT-069-08d` | 069/AC-INT-069-08 | initial stateだけ欠落 | 遷移計算を開始せずunknownを保持し、選択source ownerが明示される場合だけ照合する。 |
| `CASE-INT-069-08e` | 069/AC-INT-069-08 | baseline条件だけ欠落 | baselineを補完せず計算不能/部分unknownを返す。固定L2が返却ownerを指定しないため戻し先unknown。 |
| `CASE-INT-069-08f` | 069/AC-INT-069-08 | scenario条件だけ欠落 | baselineのみから比較を作らず計算不能/部分unknownを返す。固定L2が返却ownerを指定しないため戻し先unknown。 |
| `CASE-INT-069-08g` | 069/AC-INT-069-08 | input event seriesだけ欠落 | eventを捏造せず計算を未完にする。 |
| `CASE-INT-069-08h` | 069/AC-INT-069-08 | load seriesだけ欠落 | 負荷結果を計算不能/部分unknownとし、source ownerが入力で識別できる場合だけ照合する。未識別なら戻し先unknown。 |
| `CASE-INT-069-08i` | 069/AC-INT-069-08 | capacityだけ欠落 | throughput/timeを計算不能/部分unknownとし、source ownerが入力で識別できる場合だけ照合する。未識別なら戻し先unknown。 |
| `CASE-INT-069-08j` | 069/AC-INT-069-08 | service rateだけunknown | 率を補わず時間/throughputをunknownとする。 |
| `CASE-INT-069-08k` | 069/AC-INT-069-08 | currencyだけ欠落 | costを比較せず、選択price source/ownerが入力で識別できる場合だけ照合する。未識別なら戻し先unknown。 |
| `CASE-INT-069-08l` | 069/AC-INT-069-08 | selected price source identity/ownerを明示した上でprice effective timestampだけstale | stale priceをcurrent costへ流用せずcostをunknownに保ち、Product Core/HARNESS/SECURITYへ照合する。 |
| `CASE-INT-069-08m` | 069/AC-INT-069-08 | selected model sourceのowner identityだけ欠落（source identityは既知） | source authorityを推測せず該当model/sourceをunknownとし、Product Core/HARNESS/SECURITYへ照合する。 |
| `CASE-INT-069-08n` | 069/AC-INT-069-08 | stop/cutoff conditionだけ欠落 | 計算完了位置を捏造せず途中結果を未確定とする。 |
| `CASE-INT-069-08o` | 069/AC-INT-069-08 | selected model source identity/ownerを明示した上でselected model digestだけ不一致（revisionは一致） | digest不一致modelを使わずunknown/未完とし、Product Core/HARNESS/SECURITYへ照合する。 |
| `CASE-INT-070-09a` | 070/AC-INT-070-09 | 033 input receiptだけ欠落 | 後段計算/送達receiptを前提にせずinput段階だけ未成立とする。 |
| `CASE-INT-070-09b` | 070/AC-INT-070-09 | 033 input receipt revisionだけstale | current inputと結ばずsource ownerへ戻す。 |
| `CASE-INT-070-09c` | 070/AC-INT-070-09 | 069 result receiptだけ欠落 | input成立は保持し、result/send/consumerを未成立とする。 |
| `CASE-INT-070-09d` | 070/AC-INT-070-09 | scenario identityだけ不一致 | resultをinput scenarioへ束ねない。 |
| `CASE-INT-070-09e` | 070/AC-INT-070-09 | product identityだけ不一致 | 別product receiptを混ぜずsource ownerへ戻す。 |
| `CASE-INT-070-09f` | 070/AC-INT-070-09 | known regressionの誤予測だけ成功扱い | comparisonを不合格とし後の実測/evaluationをLABO ownerへ残す。 |
| `CASE-INT-070-09g` | 070/AC-INT-070-09 | source design authorityだけをINTELLIGENCEへ移す | authorityを移さず既存design source ownerを保持する。 |
| `CASE-INT-070-10a` | 070/AC-INT-070-10 | 有効な033 inputと069 resultを保持し、040送達前にLABO-024 receiptだけ先着 | 順序不成立として当該receiptを現行consumer受領に結ばず、LABO-024 consumer receipt未成立を保持しLABO ownerへ戻す。 |
| `CASE-INT-070-10b` | 070/AC-INT-070-10 | 他receiptを保持し、040 send receipt revisionだけstale | 040送達を現行段階で未成立に保ち、CONNECT・当該source/consumer契約ownerへ照合する。 |
| `CASE-INT-070-10c` | 070/AC-INT-070-10 | 有効な040 sendを保持し、LABO-024 consumer receipt revisionだけstale | send成立は保持し、現行consumer receipt未成立としてLABO ownerへ戻す。 |
| `CASE-INT-071-05a` | 071/AC-INT-071-05 | expected-result verification operationだけoracle欠落 | そのverificationだけ保留。通常scenario計算は引き続き明示ruleから結果/trace/unknownを返す。 |
| `CASE-INT-071-05b` | 071/AC-INT-071-05 | 通常scenarioにoracleがないことだけを失敗扱い | 固定L2/L11に反してoracle必須化しない。明示rule計算を受け入れる。 |
| `CASE-INT-071-05c` | 071/AC-INT-071-05 | 数値threshold decisionだけ未決 | 実測/計算値のみ記録し合否/適格化を付けない。 |
| `CASE-INT-071-05d` | 071/AC-INT-071-05 | 入力前に後段receiptを要求 | 順序を不成立とし、該当stageのreceiptはそのstage後に照合する。 |
| `CASE-INT-071-05e` | 071/AC-INT-071-05 | modelにないrollbackだけ生成 | rollbackを補完せず当該scenarioをunknown/blockedに保つ。 |
| `CASE-INT-071-05f` | 071/AC-INT-071-05 | modelにないretryだけ生成 | 索引のみ。同じretry rule欠落の `CASE-INT-071-04f` を参照し、独立fixture数へ加えない。 |
| `CASE-INT-071-05g` | 071/AC-INT-071-05 | worker数から線形speedupだけ仮定 | shared ceiling/service ruleを維持し比例改善を主張しない。 |
| `CASE-INT-071-05h` | 071/AC-INT-071-05 | recovery ruleだけ未定義 | 索引のみ。同じrecovery rule欠落の `CASE-INT-071-04g` を参照し、独立fixture数へ加えない。 |
| `CASE-INT-071-05i` | 071/AC-INT-071-05 | 033 input receiptだけ欠落 | calculationを開始せずinput stageを未完とする。 |
| `CASE-INT-071-05j` | 071/AC-INT-071-05 | 033 input receiptだけstale | stale inputをcurrent comparisonへ結ばない。 |
| `CASE-INT-071-05k` | 071/AC-INT-071-05 | selected connector contractだけ欠落 | connection inputを成立扱いせず、固定L2に戻し先指定がないため戻し先unknownを保持する。CONNECTを新たな返却先にしない。 |
| `CASE-INT-071-05l` | 071/AC-INT-071-05 | same-unit load seriesだけ欠落 | 欠落seriesを補わず該当sourceをunknownとする。 |
| `CASE-INT-071-05m` | 071/AC-INT-071-05 | stop conditionだけ欠落 | 無制限完了を主張せず停止条件unknownを保持する。 |
| `CASE-INT-071-05n` | 071/AC-INT-071-05 | known unsupported stateだけsuccessへ置換 | unsupported/unknownをsuccessにしない。 |
| `CASE-INT-071-05o` | 071/AC-INT-071-05 | 常時必須HARNESS-L2-010 pack contract identityだけ欠落 | contract成立とせずHARNESS pack contract ownerへ戻す。 |
| `CASE-INT-071-05p` | 071/AC-INT-071-05 | 常時必須HARNESS-L2-011 pack contract revisionだけstale | stale contractを使わずHARNESS pack contract ownerへ戻す。call固有inputはこのfixtureで変えない。 |
| `CASE-INT-071-05q` | 071/AC-INT-071-05 | 宣言済みoperationに適用するHARNESS-L2-023 dependency classだけ欠落 | dependency適用を成立扱いせずHARNESS pack contract ownerへ照合し、他の契約/operation状態を保持する。 |
| `CASE-INT-071-05r` | 071/AC-INT-071-05 | L1-013 provenanceだけ欠落 | provenanceを補わず当該sourceをunknownにし、固定L2が指定する該当source ownerへ照合する。 |
| `CASE-INT-074-06a` | 074/AC-INT-074-06 | reason classだけ欠落 | feedback分類を推測せずLABO評価を未確定とする。 |
| `CASE-INT-074-06b` | 074/AC-INT-074-06 | missing input listだけ欠落 | missing inputを補わずLABOへ戻す。 |
| `CASE-INT-074-06c` | 074/AC-INT-074-06 | oracle identityだけ欠落 | 再評価成立を推測せずLABOへ戻す。 |
| `CASE-INT-074-06d` | 074/AC-INT-074-06 | reissue verification stateだけstale | 古い成立状態を流用せずLABOへ戻す。 |
| `CASE-INT-074-06e` | 074/AC-INT-074-06 | 索引のみ。同じtask-class evidence scope mismatchの `CASE-INT-074-02b` を参照。 | 02bだけを独立fixtureに計上し、evidence mismatchはLABOへ戻す。 |
| `CASE-INT-074-06f` | 074/AC-INT-074-06 | observation populationだけ欠落 | 母集団を捏造せず評価適用をunknownにし、固定L2の評価scope ownerであるLABOへ戻す。 |
| `CASE-INT-074-06g` | 074/AC-INT-074-06 | observation windowだけstale | 古いwindowからcurrentを推定せずLABOへ戻す。 |
| `CASE-INT-074-06h` | 074/AC-INT-074-06 | LABO evaluation stateだけunknown | 評価済みと推測せずLABO評価をunknownに保ちLABOへ戻す。 |
| `CASE-INT-077-06a` | 077/AC-INT-077-06 | constant dependency identityだけ欠落 | closureを成立扱いせず、HARNESS-L2-023分類契約とsource identityを照合する。 |
| `CASE-INT-077-06b` | 077/AC-INT-077-06 | dependency contract revisionだけstale | stale dependencyを現在適用せず、source/consumer ownerが特定できる場合だけ照合し、特定できなければunknownを保つ。HARNESS-L2-023は返却ownerを決めない。 |
| `CASE-INT-077-06c` | 077/AC-INT-077-06 | selected-source conditionだけ欠落 | source qualificationを推測せずselected source状態をunknownにする。 |
| `CASE-INT-077-06d` | 077/AC-INT-077-06 | 特定operation条件だけ常時必須へ混同 | 適用外operationへ追加義務を持ち込まず親のoperation別条件を保つ。 |
| `CASE-INT-077-06e` | 077/AC-INT-077-06 | 索引のみ。同じreference-only資料をselected sourceへ昇格する `CASE-INT-077-05w` を参照。 | 05wだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-077-06f` | 077/AC-INT-077-06 | 索引のみ。同じ未選択sourceへのfallbackを拒否する `CASE-INT-077-05v` を参照。 | 05vだけを独立fixtureに計上し、この行を別negative数へ加えない。 |
| `CASE-INT-077-06g` | 077/AC-INT-077-06 | unknown applicability conditionだけreference-onlyとして扱う | unknownをreference-onlyへ読み替えずunknown/incompleteを保持する。未選択sourceやowner不明consumerへ昇格・fallbackせず、戻し先unknownを保つ。 |

同一項目のmissing/unknown/staleは別fixtureである。予測状態をactualへ置換するCASE-063-02dは固定親trace外としてこのStageの個別negative母集団に含めない。HARNESS-L2-011は069の常時依存条件の一部であり、call未選択を理由に契約照合を省略するnormal fixtureを作らない。
