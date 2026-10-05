# HELIX-INTELLIGENCE L10 機能総合検証（Stage 2a）

状態: L3と対になる検証設計候補。実行結果、PO L3承認、実装/実行許可を生成しない。L3 `functional-requirements.md`のAC identityを参照し、固定L2/L11のsource/revision/scopeとowner境界をoracleにする。

旧L10 verification layerのfailure/backflow定義（LEGACY-ASSET-34DF3B535879CC73FA86, `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md:162-170,195-207`）と、旧worker acceptanceのfixture/negative trace（LEGACY-ASSET-C6ADB99F1353965C5449, `worker-common-contract-acceptance.md:18-37,39-64`）を再導出する。旧HAT/AT件数、CI/runtime、provider/sandbox値は移さない。

## CASE-INT-010-01 — 適合範囲内のproposal（AC-INT-010-01）

- 入力: task identityとtype/domain/complexity/context/tool requirements、複数Workerのcapability/version。期待evidenceはLABOがsource/revision/scopeとtask/model classを固定した同scopeの観測実績。fixtureは条件差を含む候補を作る。少なくとも一つのnormal対照ではcost観測をtask属性・Worker capability・同scopeのsuccess/failure/rework/latency/reliability・LABO task/model class evidenceと併用し、価格単独で決定しない理由をexpected oracleに記録する。oracle ownerが適合/不適合/未評価を事前に記録する。
- 観測: proposal候補、各理由と除外、metric/evidence trace、未評価表示、OS handoffおよび別状態のassignment記録。
- 合格: proposalはoracleで許可されたscope内候補と理由だけを含み、evidence不足候補をqualified扱いせず、OS handoffとassignmentを別に示す。

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
| `CASE-INT-010-04g` | `AC-INT-010-04` | Worker capabilityまたはversion欠落/stale | evidenceを適用せずLABOへ戻す |
| `CASE-INT-010-04h` | `AC-INT-010-04` | success/failure/rework/latency/cost/reliability観測sourceまたはrevision欠落/stale | 6観測次元の変異を個別実行。該当evidence不足としてLABOへ戻す |
| `CASE-INT-010-04i` | `AC-INT-010-04` | evidence scope欠落/不一致 | LABOへ戻す |
| `CASE-INT-010-04j` | `AC-INT-010-04` | HELIX-Bench作業種別またはmodel class不一致 | LABOへ戻す |
| `CASE-INT-010-04k` | `AC-INT-010-04` | Bench statusをunassessedからqualifiedへ偽変異 | 拒否し未評価保持、LABO ownerを示す |

## CASE-INT-010-05 — 未見task/profile組合せ（AC-INT-010-05）

未公開task/Worker profile組合せをheld-outとして与える。事前oracleはscope内で根拠のある候補だけを許し、根拠のない能力や未評価を明示する。scope外証拠の流用、qualified化、proposalからのOS assignment生成があれば不合格。source不足はunknownのままLABO/OSの既存ownerへ戻す。

## CASE-INT-010-06 — consumed pack contract binding（AC-INT-010-06）

選択したconsumer operationがHARNESS-L2-010/011共通pack contractを実際に消費するfixtureだけで、contract identity、contract/artifact/dependency version、compatibility range、exchange/update conditionsを束縛する。各bindingを欠落・stale・不一致に変える独立mutationを行う。合格には固定共通契約上の互換性確認が必要であり、未知の消費側schema/pack versionはINTELLIGENCEへ戻してproposalを保留する。HARNESS共通packの定義ownerやversionは変更しない。無関係なoperationにpack dependencyを追加しない。

## CASE-INT-066-01 — runtimeが使える通常LABO→INT→OS経路（AC-INT-066-01）

- 入力: 固定scope/revisionのLABO-055/054評価材料、task identity、L2-010 proposal schema/contract revision。
- 観測: LABO材料のsource/revision/scopeと評価状態、INT生成proposalのoriginと根拠、OS受領/別assignment record。
- 合格: 同scope材料がLABOからINTへ届き、INT proposalが根拠・未評価を保ち、OSが別途proposalを審査してassignment判断する。receipt成功だけでは評価成功・assignment成立にしない。
- 範囲: これはnormal comparison pathのoracleであり、この起草・受入の前提としてINT runtime実装を要求しない。

## CASE-INT-066-02 — runtimeなしの人代行normal（AC-INT-066-02）

INT runtimeを呼べないfixtureで、人がL2-010と同じaccepted schema/contract revisionを用いて配置案を記入する。入力にはtask/ticket identityと属性、Worker capability/version、LABO evidenceまたは未評価とsource revision/scope、根拠・除外・不確実性、作成actor/timeを束縛する。OS receiptはproposal内容および受領actor/timeを保持し、assignmentは別状態にする。合格は人案がINT生成/評価済みと表示されず、元入力と受領recordを追跡できること。

## 人代行経路の独立negative mutations

| L10 CASE | L3 AC | mutation | expected oracle / return |
|---|---|---|---|
| `CASE-INT-066-03a` | `AC-INT-066-03` | human originをINT generatedへ書換え | 不合格、originを人入力に保つ |
| `CASE-INT-066-03b` | `AC-INT-066-03` | unassessed evidenceをqualified/scoredへ書換え | 不合格、LABOへ戻してunassessed保持 |
| `CASE-INT-066-04a` | `AC-INT-066-04` | ticket/task identityと必須task属性について、各fieldの欠落と元taskとの不一致を一度に一fieldずつ独立変異 | OSへ戻す、assignment materialとして受領しない。NFRの全binding censusにも同じfixtureを対応づける |
| `CASE-INT-066-04b` | `AC-INT-066-04` | OS receiptまたはreceiver actor/timeを欠落/不一致 | OSへ戻す、assignmentを開始しない |
| `CASE-INT-066-05a` | `AC-INT-066-05` | Worker identity欠落/不一致 | profile/evidenceの根拠をLABOへ戻す |
| `CASE-INT-066-05b` | `AC-INT-066-05` | Worker capability欠落/不一致 | profile/evidenceの根拠をLABOへ戻す |
| `CASE-INT-066-05c` | `AC-INT-066-05` | Worker version欠落/stale | evidence適用を止めLABOへ戻す |
| `CASE-INT-066-05d` | `AC-INT-066-05` | LABO evidenceまたは明示的unassessed state欠落 | LABOへ返しunknown保持 |
| `CASE-INT-066-05e` | `AC-INT-066-05` | evidence source欠落/他source由来 | LABOへ返し受領・評価不成立 |
| `CASE-INT-066-05f` | `AC-INT-066-05` | evidence revision欠落/stale | LABOへ返し受領・評価不成立 |
| `CASE-INT-066-05g` | `AC-INT-066-05` | evidence scope欠落/不一致 | LABOへ返しunknown保持 |
| `CASE-INT-066-05h` | `AC-INT-066-05` | L2-010 proposal schema identity欠落/不一致 | INTELLIGENCEへ戻しproposal未確定 |
| `CASE-INT-066-05i` | `AC-INT-066-05` | proposal contract revision/version欠落/stale | INTELLIGENCEへ戻しproposal未確定 |
| `CASE-INT-066-05j` | `AC-INT-066-05` | 適用対象pack contract identity/version欠落/不一致 | INTELLIGENCEへ戻す。connectorや他Stage1草稿をauthority扱いしない |
| `CASE-INT-066-05k` | `AC-INT-066-05` | human proposal作成actor/time欠落/不一致 | schema/proposal binding不成立としてINTELLIGENCEへ戻す |
| `CASE-INT-066-06a` | `AC-INT-066-06` | proposalでauthority/scope/branchを拡張するかOS assignmentを生成 | 拒否。assignment/実行はOSの独立判断に残す |
| `CASE-INT-066-06b` | `AC-INT-066-06` | INT proposalがLABO評価を代替またはOS受領を迂回 | 拒否、該当する既存ownerへ戻す |

## CASE-INT-066-07 — 未見人代行proposal（AC-INT-066-07）

未公開task/profileのvalid human-authored proposalをheld-out fixtureとして使う。oracleはorigin・contract/source revision・scope・evidence status・作成/受領actor/timeの全bindingを事前記録する。合格には人代行normalと同じschema-bound receipt、unknown保持、OSの別assignment判断を要求する。missing/stale binding変異は受領を不成立にし、L3に記したownerへ戻す。

## evidenceとNFR計測の扱い

全caseは入力fixture digest、親source revision、expected oracle、実際のproposal/receiptとowner routeを記録する。固定L2/L11 source/revision/scopeの変化、通常経路と人代行経路の混同、positive/negative/unseenのfixture差を読めるようにする。NFRの母集団/指標候補は `nfr-verification.md` にtraceする。旧tests、CI、runtimeは実行せず、将来の実装testがこの設計を実証済みとすることもない。

## C13 carry-forward

C13-M10、C13-M7、C13-M12 audit-record correction、Minor INT-010、Minor INT-060-078は未解消として引き継ぐ。`C13-U-INT-NFR-060-078`と`C13-U-all-crosswalk-and-legacy`は未確認であり、特にL2-060-078および旧source crosswalkの全量reviewを済んだとは扱わない。この設計と作成者の自己照合は独立reviewやfinding closureではない。revision-specificなsource pin/crosswalk handoffはroot監査へ収録する時点記録であり、private `/tmp` artifactを継続的な正本依存にしない。
