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
| `CASE-INT-060-02d` | A→B依存だけ逆転 | 不合格。BをAより前へ置かず該当dependency ownerへ戻す。 |
| `CASE-INT-060-02e` | 4.0 workflowだけを1.0必要条件へ追加する | 不合格。4.0を要求せずcandidateをL2-060の範囲へ戻す。 |
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
| `CASE-INT-063-02d` | prediction statusだけactualに置換 | 仮想予測をactual evidenceへ昇格しない。 |
| `CASE-INT-063-02e` | OS runだけ未完了でloop完了claim | loop completionを保留しOS ownerへ戻す。 |
| `CASE-INT-063-02f` | BRAIN applicabilityだけ未承認/unknown | BRAIN candidateをgeneric knowledgeにしない。 |
| `CASE-INT-063-02g` | duplicate/out-of-order resultだけ別episodeへbinding | original episode/time lineageを維持しLABO ownerへ戻す。 |

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
| `CASE-INT-069-04a` | service ruleだけ欠落 | throughput/timeを創作せずunknown、model ownerへ戻す。 |
| `CASE-INT-069-04b` | selected cost rateだけ別revision | mixed-revision costを拒否しsource ownerへ戻す。 |
| `CASE-INT-069-04c` | unit labelだけ不一致 | 照合不能をunknownとし、暗黙換算しない。 |
| `CASE-INT-069-04d` | priceだけ欠落 | cost unknownのまま。0 costにしない。 |
| `CASE-INT-069-04e` | reportingにDB dependency edgeを追加せずDB failureを伝播 | edge外stateを不変にする。 |
| `CASE-INT-069-04f` | recovery ruleだけ不在 | recovery/retry成功を補完しない。 |
| `CASE-INT-069-04g` | virtual resultを実環境結果と表示 | virtual/actualを区別し不合格。 |

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
| `CASE-INT-070-05c` | simulated result statusだけactualへ変更 | 仮想結果を実測にせず不合格。 |
| `CASE-INT-070-05d` | consumer receiptだけ欠落 | send済みは保持するがconsumer受領/connection完了は成立しない。 |
| `CASE-INT-070-05e` | correlation IDだけ異なる | receiptを同一scenarioに混ぜない。 |
| `CASE-INT-070-05f` | payload missing relationを新必須fieldへ黙って変換 | ownerへ不足を戻しcandidate独自schema追加を拒否する。 |

### CASE-INT-070-06 — 遅延・未見receipt (AC-INT-070-06)

未見compatible receipt版を各stage単独で与える。重複/遅着を記録し、欠落compatibilityをunknown/not receivedに保つ。

### CASE-INT-071-01 — 有限scenario比較fixture (AC-INT-071-01)

L11 R2187-01のbaseline 5/5、load 5/10、per-step cap 8でqueue oracleを照合する。独立scenarioとしてload increase、DB disconnect、virtual Worker 2→4を実行設計し、3→2.25 minおよび1.50→2.025 credits fixture arithmeticをtraceに束ねる。DB断時は明示order edgeのみblocked、recovery未定義。送達後のLABO-024 receiptがそろって初めてconnection段階を反映する。

### CASE-INT-071-02 — compositeの独立反例 (AC-INT-071-02)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-071-02a` | baseline model revisionだけscenarioと異なる | 比較不成立、affected scenarioをmodel ownerへ戻す。 |
| `CASE-INT-071-02b` | one scenario unitだけ不一致 | 異単位差分を比較せずunknown。 |
| `CASE-INT-071-02c` | DB failure edgeだけ欠落 | edge外伝播/復旧を生成しない。 |
| `CASE-INT-071-02d` | virtual worker count変更をOS worker assignmentへ反映 | 変更を拒否しOS assignmentを不変にする。 |
| `CASE-INT-071-02e` | LABO receiptだけ欠落 | calculation/send evidenceは保持しconsumer受領/composite handoff未完了とする。 |
| `CASE-INT-071-02f` | unsupported cost fieldだけ0へ補完 | 不合格。cost unknownを保持する。 |
| `CASE-INT-071-02g` | 069単体結果だけcomposite完了と表示 | 不合格。071比較/後続receiptを成立扱いしない。 |

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
| `CASE-INT-074-02e` | feedbackからmodel/requirementを更新する | writeを拒否しexisting ownerへ返す。 |
| `CASE-INT-074-02f` | INTELLIGENCEからOS ticket/assignmentを発行 | 発行拒否、OS authorityを維持する。 |

### CASE-INT-074-03 — 未見feedback理由class (AC-INT-074-03)

未見reason classと明示互換範囲を入力する。適用範囲が確定するfieldだけを引用し、他をunknown/未評価とする。

### CASE-INT-074-04 — feedback field別unknownの索引 (AC-INT-074-04)

旧fixtureのsource completeness/window/applicability owner複合例は索引としてのみ保持する。独立fixtureは04a–04cに分け、他fieldを有効に固定する。

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-074-04a` | source completenessだけunknown | completenessだけunknownのままにし、評価適用を成立させずLABOへ戻す。 |
| `CASE-INT-074-04b` | observation windowだけunknown | windowだけunknownのままにし、範囲を推測せずLABOへ戻す。 |
| `CASE-INT-074-04c` | applicability ownerだけunknown | ownerだけunknownのままにし、ownerを推測せず既存L1/L2 ownerへ照合する。 |

### CASE-INT-077-01 — qualified internal source delta候補 (AC-INT-077-01)

internal selected receiptのsource identity/revision/owner/originを束ね、qualified sourceの根拠が示すdelta candidateを返す。Requirements/Design/Release/Assignmentは変更しない。

### CASE-INT-077-02 — qualified external sourceの分離維持 (AC-INT-077-02)

qualified external receiptを別origin typeで示す。external observationだけからHELIX defectを確定せずinternal sourceと合併しない。

### CASE-INT-077-03 — authorityを変更しない独立反例 (AC-INT-077-03)

| CASE | 単独変異 | 期待oracle・戻し先 |
|---|---|---|
| `CASE-INT-077-03a` | unknown deltaだけ0へ補完 | unknownを維持しselected source ownerへ戻す。 |
| `CASE-INT-077-03b` | origin typeだけinternal/external swap | identity不一致を拒否し元source ownerへ戻す。 |
| `CASE-INT-077-03c` | selected receipt qualificationだけ欠落 | candidateをqualified sourceに結ばない。 |
| `CASE-INT-077-03d` | Requirementだけ直接write | writeを拒否しauthorityを不変にする。 |
| `CASE-INT-077-03e` | Designだけ直接write | writeを拒否する。 |
| `CASE-INT-077-03f` | 複数の直接変更を束ねた旧fixture | 個別negative件数には算入せず、03h–03jの索引として扱う。 |
| `CASE-INT-077-03g` | unknown consumerから新route/ownerを推測 | route/ownerを作らずunknownとして既存requirement ownerへ照合する。 |
| `CASE-INT-077-03h` | Releaseだけ直接変更 | writeを拒否し、既存release authority/stateを不変にする。 |
| `CASE-INT-077-03i` | Assignmentだけ直接変更 | writeを拒否し、OSのassignment authority/stateを不変にする。 |
| `CASE-INT-077-03j` | merge authority/stateだけ直接変更 | writeを拒否し、merge authority/stateを不変にする。 |

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
| `CASE-INT-060-05e` | 060/AC-INT-060-05 | stop conditionだけ欠落 | stop条件を推測せずplan candidateを未完にする。 |
| `CASE-INT-060-05f` | 060/AC-INT-060-05 | 宣言済みstop時のfallbackだけ欠落 | fallbackを補完せず影響nodeとstop理由を保持してsource ownerへ戻す。 |
| `CASE-INT-060-05g` | 060/AC-INT-060-05 | dependency cycleだけ存在 | 解決済み順序を出さず該当dependency ownerへ戻す。 |
| `CASE-INT-060-05h` | 060/AC-INT-060-05 | dependency identityだけ未知 | unknown dependencyを保ちsource ownerへ戻す。 |
| `CASE-INT-060-05i` | 060/AC-INT-060-05 | declared stop後の指定fallback（正常） | 指定fallbackだけを同じsource/scopeで適用し、ticket発行はOSに残す。 |
| `CASE-INT-061-05a` | 061/AC-INT-061-05 | compatibility evidenceだけ未見 | 評価互換性をunknownに保ちLABOへ戻す。 |
| `CASE-INT-061-05b` | 061/AC-INT-061-05 | task scopeだけunknown | 適用範囲を確定せずINTELLIGENCEへ戻す。 |
| `CASE-INT-061-05c` | 061/AC-INT-061-05 | assignment可否だけunknown | proposalをassignmentにせずOSへ戻す。 |
| `CASE-INT-061-05d` | 061/AC-INT-061-05 | task identityだけ別段階receiptから流用 | identity不一致を検出し対応stage ownerへ戻す。 |
| `CASE-INT-061-05e` | 061/AC-INT-061-05 | revisionだけ異なる段階receiptから流用 | stale/別revisionを混ぜず該当producer ownerへ戻す。 |
| `CASE-INT-062-04a` | 062/AC-INT-062-04 | isolation evidenceだけ欠落 | 実行成立にせずSECURITYへ戻す。 |
| `CASE-INT-062-04b` | 062/AC-INT-062-04 | repair candidateだけ欠落 | repair目的を推測せずINTELLIGENCEへ戻す。 |
| `CASE-INT-062-04c` | 062/AC-INT-062-04 | targetだけ別revision | receiptを結ばず実行stage ownerへ戻す。 |
| `CASE-INT-062-04d` | 062/AC-INT-062-04 | scopeだけ別 | 他scopeの成功を流用せず該当stage ownerへ戻す。 |
| `CASE-INT-062-04e` | 062/AC-INT-062-04 | revisionだけstale | stale evidenceを拒否しそのstage ownerへ戻す。 |
| `CASE-INT-062-04f` | 062/AC-INT-062-04 | owner identityだけ別 | owner不一致を保留し既存stage ownerへ返す。 |
| `CASE-INT-062-04g` | 062/AC-INT-062-04 | 順序だけ逆転（全receiptは存在） | 「最初の欠落」と誤表示せず、順序不成立を検出した既存stage ownerへ戻す。 |
| `CASE-INT-062-04h` | 062/AC-INT-062-04 | repair resultだけ失敗 | acceptanceを作らず失敗したstage ownerへ戻す。 |
| `CASE-INT-062-04i` | 062/AC-INT-062-04 | repair stageだけ未完了 | 未完stageを完了化せず対応ownerへ戻す。 |
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
| `CASE-INT-069-06e` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall identityだけ欠落 | callを成立扱いせず、call入力を選択した呼出しownerへ戻す。HARNESSが計算実行主体になるとは扱わない。 |
| `CASE-INT-069-06f` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall contract revisionだけstale | 該当callを保留し、呼出しownerへ戻す。 |
| `CASE-INT-069-06g` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall scopeだけ不一致 | 別scope callを混ぜず、呼出しownerへ戻す。 |
| `CASE-INT-069-06h` | 069/AC-INT-069-06 | HARNESS-L2-011 callを選択したoperationでcall provenanceだけ欠落 | 出所を推測せず、呼出しownerへ戻す。 |
| `CASE-INT-069-06i` | 069/AC-INT-069-06 | 選択model/source identityだけ不一致 | model resultを結ばずsource ownerへ戻す。 |
| `CASE-INT-069-06j` | 069/AC-INT-069-06 | L2-033 input receiptだけ欠落 | 単体計算のCORE入力を作らずsource ownerへ戻す。 |
| `CASE-INT-069-06k` | 069/AC-INT-069-06 | L2-003 current state sourceだけ欠落 | source-owned stateを補完せず当該source ownerへ戻す。 |
| `CASE-INT-069-06l` | 069/AC-INT-069-06 | L2-004 fact/inference区分だけ欠落 | 区分不明を保持しINT/source ownerへ戻す。 |
| `CASE-INT-069-06m` | 069/AC-INT-069-06 | L2-012 unknown/source attributionだけ欠落 | 不確実性を確定値にせず当該source ownerへ戻す。 |
| `CASE-INT-069-06n` | 069/AC-INT-069-06 | L2-013 trace/source revisionだけ欠落 | traceを結ばず該当source ownerへ戻す。 |
| `CASE-INT-069-06o` | 069/AC-INT-069-06 | 適用data-use/authority条件だけ欠落 | 利用可能と推測せず該当security/source ownerへ戻す。 |
| `CASE-INT-069-06p` | 069/AC-INT-069-06 | stop conditionだけ欠落 | 完了を作らずsource/model ownerへ戻す。 |
| `CASE-INT-069-06q` | 069/AC-INT-069-06 | unselected model/sourceへのfallbackだけ追加 | 未選択sourceを未観測に保ちfallbackを拒否する。 |
| `CASE-INT-069-07a` | 069/AC-INT-069-07 | 通常計算で期待値oracleもHARNESS-L2-011 callも選択されない（正常） | HARNESS-L2-010と入力source/ruleを照合し、明示model/ruleから結果・trace・unknownを算出する。oracleや未選択callなしを理由に保留しない。 |
| `CASE-INT-069-07b` | 069/AC-INT-069-07 | 通常計算で070/040/LABO-024後段receiptなし（正常） | 計算結果を返し、後段connection未完を別保持する。 |
| `CASE-INT-069-07c` | 069/AC-INT-069-07 | 利用者指定verificationの期待値oracleだけ欠落 | そのverificationだけ保留しscenario author/選択source ownerへ戻す。 |
| `CASE-INT-069-07d` | 069/AC-INT-069-07 | stop/cutoff位置だけ欠落 | 成功完了にせず打切り位置unknownを保持する。 |
| `CASE-INT-069-07e` | 069/AC-INT-069-07 | 計算resourceだけ不足 | 途中resultと停止位置を保持し、OS運転成功に変換しない。 |
| `CASE-INT-069-07f` | 069/AC-INT-069-07 | 選択source/permissionだけ期限切れ | 該当operationだけ保留し既存source/SECURITY ownerへ戻す。 |
| `CASE-INT-070-07a` | 070/AC-INT-070-07 | HELIXINTELLIGENCE-L2-040送達契約だけ欠落 | send未成立を保持し、既存L2-040の責務ownerへ戻す。 |
| `CASE-INT-070-07b` | 070/AC-INT-070-07 | HELIXINTELLIGENCE-L2-040送達契約revisionだけ不一致 | send receiptを結ばず、既存L2-040の責務ownerへ戻す。 |
| `CASE-INT-070-07c` | 070/AC-INT-070-07 | correlationだけ別 | 別operationのreceiptを混ぜない。 |
| `CASE-INT-070-07d` | 070/AC-INT-070-07 | target scopeだけ別 | 対象scopeのsend未完として保持する。 |
| `CASE-INT-070-07e` | 070/AC-INT-070-07 | LABO-024 consumer contractだけ欠落 | consumer受領を成立させずLABOへ戻す。 |
| `CASE-INT-070-07f` | 070/AC-INT-070-07 | LABO-024 contract revisionだけ不一致 | 別版consumer契約を流用せずLABOへ戻す。 |
| `CASE-INT-070-07g` | 070/AC-INT-070-07 | input source identityだけ不一致 | stage bindingを失敗にし該当source ownerへ戻す。 |
| `CASE-INT-070-07h` | 070/AC-INT-070-07 | model identityだけ不一致 | resultを結ばずmodel ownerへ戻す。 |
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
| `CASE-INT-071-04f` | 071/AC-INT-071-04 | modelにretry ruleだけ存在しない | retry成功を補わずmodel ownerへ戻す。 |
| `CASE-INT-071-04g` | 071/AC-INT-071-04 | modelにrecovery ruleだけ存在しない | recoveryを創作せずmodel ownerへ戻す。 |
| `CASE-INT-071-04h` | 071/AC-INT-071-04 | edge外failureだけ伝播 | edge外stateを不変にしmodel ownerへ戻す。 |
| `CASE-INT-071-04i` | 071/AC-INT-071-04 | simulationだけactualへ昇格 | 実測へ昇格しない。 |
| `CASE-INT-071-04j` | 071/AC-INT-071-04 | simulationだけLABO評価済みへ昇格 | 評価済みへ昇格せずLABOへ戻す。 |
| `CASE-INT-074-05a` | 074/AC-INT-074-05 | source completenessだけ欠落 | 評価済み適用をclaimせずLABOへ戻す。 |
| `CASE-INT-074-05b` | 074/AC-INT-074-05 | observation windowだけ欠落 | windowを推測せずLABOへ戻す。 |
| `CASE-INT-074-05c` | 074/AC-INT-074-05 | applicability ownerだけ不明 | ownerを推測せずunknownを保持する。 |
| `CASE-INT-074-05d` | 074/AC-INT-074-05 | task attributeだけ欠落 | task/ticket条件をOSへ戻す。 |
| `CASE-INT-074-05e` | 074/AC-INT-074-05 | scopeだけ不足 | 適用scopeをunknownに保ち、LABOへ戻す。 |
| `CASE-INT-074-05f` | 074/AC-INT-074-05 | evaluation stateだけ未評価 | eligible evidenceにしない。 |
| `CASE-INT-074-05g` | 074/AC-INT-074-05 | comparisonだけ不能 | 比較不能をunknownのままLABOへ戻す。 |
| `CASE-INT-074-05h` | 074/AC-INT-074-05 | comparison sourceだけ欠落 | sourceを補完せずLABOへ戻す。 |
| `CASE-INT-074-05i` | 074/AC-INT-074-05 | comparison revisionだけstale | current evidenceへ流用しない。 |
| `CASE-INT-074-05j` | 074/AC-INT-074-05 | comparison scopeだけ別 | 別scopeへ転用せずLABOへ戻す。 |
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
| `CASE-INT-074-05w` | 074/AC-INT-074-05 | 正常feedbackのtrace | return reason、missing input/oracle、再発行後verification状態、母集団/window、再評価条件を同一評価receiptへ結ぶ。 |
| `CASE-INT-074-05x` | 074/AC-INT-074-05 | 同じ理由class・宣言済み同scopeの未見正常例 | 根拠の引用と再評価条件を保ち、成功や適格性は自動生成しない。 |
| `CASE-INT-074-05y` | 074/AC-INT-074-05 | 同じ理由classだが異なるscope | feedbackを転用せず適用外/unknownを保持しLABOへ戻す。 |
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
| `CASE-INT-077-05n` | 077/AC-INT-077-05 | origin typeだけ欠落 | internal/externalを推測しない。 |
| `CASE-INT-077-05o` | 077/AC-INT-077-05 | origin typeだけ不一致 | originを統合せずsource ownerへ戻す。 |
| `CASE-INT-077-05p` | 077/AC-INT-077-05 | source owner identityだけ欠落 | ownerを推測しない。 |
| `CASE-INT-077-05q` | 077/AC-INT-077-05 | source owner identityだけ不一致 | owner不一致をunknownに保つ。 |
| `CASE-INT-077-05r` | 077/AC-INT-077-05 | qualification evidenceだけ欠落 | qualified扱いせずselected source ownerへ戻す。 |
| `CASE-INT-077-05s` | 077/AC-INT-077-05 | qualification evidenceだけ不一致 | qualificationを継承せずselected source ownerへ戻す。 |
| `CASE-INT-077-05t` | 077/AC-INT-077-05 | selected receiptだけstale | candidateをincompleteに保つ。 |
| `CASE-INT-077-05u` | 077/AC-INT-077-05 | selected receiptだけread failure | candidateをincompleteに保つ。 |
| `CASE-INT-077-05v` | 077/AC-INT-077-05 | unselected receiptへfallback | unselectedを未観測のまま保つ。 |
| `CASE-INT-077-05w` | 077/AC-INT-077-05 | reference-only資料をselected sourceへ昇格 | 参照資料を資格根拠へしない。 |
| `CASE-INT-077-05x` | 077/AC-INT-077-05 | internal sourceをexternal/TERへ付替 | source identity/originを維持しHELIX defectを推定しない。 |
| `CASE-INT-077-05y` | 077/AC-INT-077-05 | external sourceをinternal/UILだけへ付替 | source identity/originを維持し必要ならunknownで戻す。 |
| `CASE-INT-077-05z` | 077/AC-INT-077-05 | external release observationだけからHELIX defectを確定 | defectを確定せずfinding/candidateを未確定で保持する。 |

この補完表は候補fixture設計である。execution、実環境qualification、成功率、実測済み性能、またはL3承認を示さない。
