# v1.3 §2 層連鎖／V-pair 12条件のStep5個別監査

- 基準main: `81d1f35f9c5793c5312be4ae52526c96b609c254`
- 固定比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md`（SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`）
- 対象: §2の物理行46–57、`REQSRC-SUP-00034`〜`REQSRC-SUP-00045`の12条件
- status: 12/12 `partial`。formal successor 0、採択・closure・実装・受入完了なし。authority effect `none`。

## queueからの選定と重複除外

v1.3 closure queueの303条件中、対象12行は連続するsource identityで、全件`primary_residual` / `unresolved_for_closure_work`、個別監査参照0件だった。#2411で個別監査された§6の17行（`REQSRC-SUP-00398`〜`00432`）と、queueが記録する他の既存個別監査identityを除外した。queue上の既存statusは更新していない。

## 旧sourceとconsumer

旧assetは`LEGACY-ASSET-02319C2481B9E01698D5`（台帳956行）で、`source_snapshot_preservation` / `preserved_pending_rehome`。旧L12再基線requirements（`l12-scrum-rebaseline-requirements.md` SHA `7da3f496…f730`）、その受入設計（`l12-scrum-rebaseline-acceptance.md` SHA `f584c65a…93df6`）、およびlegacy L0–L14からcanonical L1–L12へのcutover設計（旧L7→現L6、旧L8–L12→現L7–L11のmappingを含む）（`vmodel-canonical-authority-cutover.md` SHA `efc06fe5…76951`）をconsumer文書として読んだ。いずれも読み取りのみ。旧受入設計が持つexactly-once・6 pair・互換入力のoracleは旧consumer契約の証拠であり、新世代の採択や実行証拠ではない。

## 固定f6比較と後発判断の境界

2026-09-28 HARNESS PO decision（SHA `c7a6d39c…fd23`）のline 66は、既存HARNESS-L2-001〜009と対L11を一式として保持し、今回採択した明示24候補へ重複加算しない。主比較のHARNESS-L2-001/L11-001はf6 L2 line 52（line SHA `19bc5f02…b5e0e`、file SHA `aed75cb4…3100a`）とL11 line 21（line SHA `c4c9fa75…928e1`）とnegative scenario line 33（line SHA `137bce38…384bd`、同じfile SHA `09b29631…bcd4`）にpinした。条件別にHARNESS-L2-003/L11-003（L2 line 54、L11 line 23）とHARNESS-L2-004/L11-004（L2 line 55、L11 line 24）もJSONのline SHAでpinし、関連する個票だけに結び付けた。current Concept line 238も層順と6 pairを示す。これは上位pairの意味を支える比較であり、§2表の全ての工程別成果・例外・oracleが採択済みであることや個票ごとのcoverageを証明しない。

2026-09-29の57件判断（source revision `318ec4a0…fd5d3`、42 adopted / 11 conditional / 4 held）と追加11件判断（source revision `5aa10031…410a`、10 adopted / 1 current revision not adopted）をexact identity/revision scopeで確認した。HARNESS-L2-039/L11-039の採択はdecision row 44と固定section digest（L2 `e2a71f79…9215a0`、L11 `63177fee…211746`）に限定する。旧行47（00035）では選択UI scopeのExperience/UI/Frontend relationを補助するが、prototype agreement、L2.5判断、非UI receipt全体の成立やsource successorを与えない。旧行56（00044）では`ux_verified`主張時の選択scope real-data evidence/human evaluationだけに関係し、L11 acceptance全体と同義ではない。HARNESS-L2-041のlayer-ledger extraction、11件判断のHARNESS-L2-041/-048も各exact revisionに限り、6 pairの定義を更新せず、この12 source identityへsuccessorを与えない。

## 12条件別の照合

| ID / 旧行 | 旧sourceの条件 | 固定f6で保持される意味 | status / 残差 | 数値・例外・反例 |
|---|---|---|---|---|
| `REQSRC-SUP-00034` / 46 | \| L1 \| 企画 \| L12 運用テスト \| 価値、目的、対象、非対象、route判断が確定 \| | 固定HARNESS-L2-001はL1–L12全体と正規pairを扱い、L11は全体の成果・対の確認を要求する。current ConceptもL1を企画、L12を運用評価としてL1↔L12に接続する。 | `partial`: 固定L2/L11 pairはL1の価値・対象境界とL12の時間軸・監視・改善効果の個別oracle、観測期間、再評価条件までは指定しない。概念上の対応だけではL12の利用者受入結果にならない。 | pairはL1↔L12の1組。L12評価からL1の意味を自動変更しない。変更が必要なら既存の上流要求判断へ戻す。 反例: L12に監視値があるだけで価値・対象境界が正しいとする、または運用実績なしでL1↔L12 pairをacceptedにする。 |
| `REQSRC-SUP-00035` / 47 | \| L2 \| 要求＋画面プロト \| L11 受入テスト \| 要求とプロトを往復し、合意receiptまたは非UI N/A receiptが存在 \| | 固定HARNESS-L2-001/L11-001はL2／L11とL3／L10を区別し、prototype/PoCを要求合意と同一視しない。後発採択HARNESS-L2-039/L11-039は選択UI scopeのExperience/UI/Frontend relationとUX evidenceを同一scope/revisionへ結ぶ範囲で関連する。 後発限定scope: HARNESS-L2-039/L11-039. | `partial`: L2-039はprototype agreementやL2.5判断を所有せず、既存L2-024等の入力契約を参照する。旧行のprototype往復、合意receipt/非UI N/A receiptの各fieldと、このlegacy条件全体が採択pair上で成立することは未確定。L2-039の採択はこの行のcoverageやsuccessorを与えない。 | L2↔L11は1組。L2.5はcanonicalな追加layerではなく、適用時だけ挿入する。画面・技術的不確実性がない場合に限り適用を飛ばせるが、理由付きN/Aは残る。 反例: 画面がないことだけで技術PoCまで非適用にする、またはprototype表示・PoC成功をL2要求合意やL3凍結と同一視する。 |
| `REQSRC-SUP-00036` / 48 | \| L3 \| 要件定義・凍結 \| L10 総合テスト \| FR/NFR/AC、出所、優先度、非目標、test oracleが凍結 \| | 固定HARNESS-L2-001とL11-001はL3／L10をL2／L11から区別し、片側欠落を検出する。 | `partial`: 対象ごとのL3要件正本・承認revision、FR/NFR/ACの完全性、優先度・non-goalの扱い、各oracleのcurrent evidenceはこのL2/L11固定pairには展開されていない。system testの実行・結果も証明されない。 | L3↔L10は1組。L3 freezeには採択済み対象revisionの人間decisionが要る場合があり、別revisionの承認を転用しない。 反例: L2要求の合意だけでL3をfreezeする、L10の単一greenから全FR/NFR/AC closureを推定する、またはoracle欠落を非適用扱いにする。 |
| `REQSRC-SUP-00037` / 49 | \| L4 \| 基本設計 \| L9 結合テスト \| 外部設計、architecture、境界、依存、接続が確定 \| | 固定HARNESS-L2-001は6組の正規pairを保持し、対L11-001は片側欠落を識別する。固定HARNESS-L2-004/L11-004は要求から設計・testへのtraceと変更時再検証を要求する。 | `partial`: L4設計の対象revision、component/interface境界・依存方向・接続契約と、L9のtransaction/adapter等のintegration oracleを同一pairで照合する具体条件は、この固定L2/L11 pairのscope外。 | L4↔L9は1組。対象にintegration edgeがない場合のN/A条件・理由・再評価条件は本source行にもf6 pairにも個別oracle化されていない。 反例: L4設計が存在するだけでL9合格とする、または1つのintegration結果を別依存・adapter境界へ横展開する。 |
| `REQSRC-SUP-00038` / 50 | \| L5 \| 詳細設計＋先行テスト設計 \| L8 単体テスト \| 内部設計、契約、edge case、test designが対で凍結 \| | 固定HARNESS-L2-001はL5↔L8を正規pairに含み、固定HARNESS-L2-004/L11-004は要求から設計/testへのtraceと再検証範囲を要求する。 | `partial`: test caseと先行test designの対応、edge-case集合、対象revisionとexpected failureの一致、unit fixtureの適用可能性は固定L2/L11 pairから具体化されない。 | L5↔L8は1組。test-design artifactなしを黙ってN/Aにできる根拠はなく、非適用なら対象・理由を特定する必要がある。 反例: L5契約にない動作をL8 testで要求する、edge caseを欠いたままunit passとする、またはtest designがない状態を暗黙に合格にする。 |
| `REQSRC-SUP-00039` / 51 | \| L6 \| 実装 \| L7 TDD closure \| L5契約内のproduct code。scope外機能を追加しない \| | 固定HARNESS-L2-001はL6↔L7を正規pairに含む。固定HARNESS-L2-003/L11-003は工程状態を実行成功だけから推定しない。 | `partial`: L5契約のどの実装差分がL6成果か、scope外機能の識別、実装revisionとL7証拠の一致は、HARNESS-L2-001/対L11だけでは条件別に定義されていない。 | L6↔L7は1組。implementation存在やCI success単独はpair closureにならない。 反例: 動く実装があることからtest closureを推定する、またはL5 scope外機能を追加しても同一pairのpassにする。 |
| `REQSRC-SUP-00040` / 52 | \| L7 \| テスト実装・TDD closure \| L6 実装 \| Red→Green→Refactor、実装とtestの双方向traceを閉じる \| | 固定HARNESS-L2-003/L11-003は工程結果を前段状態から推定しない。固定HARNESS-L2-001はL6↔L7のpair identityを提示する。 | `partial`: Red/Green/Refactor各状態の具体的oracleとsource requirementからtestへの逆traceの個票条件は固定L2/L11 pairで特定されていない。旧consumerのcutoverは旧L7 implementation→現L6とする一方、v1.3行52は旧L7をtest実装と記す。この旧記述間の差を解決せず、現行L7へ番号だけで写像しない。 | Red→Green→Refactorの順序は旧sourceに明示されるが、f6 pairは段階ごとの実行成功や件数を定めない。旧L7 labelを現行層へ機械写像しない。 反例: Greenだけを見てRedの失敗証拠やRefactor後の再実行を省く、またはtest/code trace欠落をpassにする。 |
| `REQSRC-SUP-00041` / 53 | \| L8 \| 単体テスト \| L5 詳細設計 \| 合成/局所データで内部設計を検証 \| | 固定HARNESS-L2-001はL5↔L8を示し、固定HARNESS-L2-004/L11-004は変更条件の検証漏れを追跡する。 | `partial`: 局所fixtureと実利用データの境界、L8の対象範囲・oracle・expected failureの粒度、L5 detail単位のtrace receiptはこのpairで閉じない。 | L5↔L8は1組。合成/局所データはL8の条件であり、L11の実利用・実データ受入と混同しない。 反例: L8の合成fixture passをL11実利用結果へ昇格する、または対応L5 designがないunit testを無関係な設計へ結ぶ。 |
| `REQSRC-SUP-00042` / 54 | \| L9 \| 結合テスト \| L4 基本設計 \| 接続、依存、transaction、adapter境界を検証 \| | 固定HARNESS-L2-001は正規L4↔L9 pairを明記し、固定HARNESS-L2-004/L11-004は要求変更に伴う再検証範囲を保持する。 | `partial`: どの接続edgeが対象か、transaction/adapter failure、依存方向違反の具体oracleと、失敗時の戻し先はf6 L2/L11-001に書かれていない。 | L4↔L9は1組。L8 unit passだけでは選択されたL9 integration条件を満たす証拠にならない。 反例: L8 unit passだけから、選択されたL9 integration条件（接続・依存・transaction・adapter境界）の成立を推定する。 |
| `REQSRC-SUP-00043` / 55 | \| L10 \| 総合テスト \| L3 要件 \| system全体でFR/NFR/ACを検証 \| | 固定HARNESS-L2-001およびL11-001はL3／L10とL2／L11の混同・片側欠落を検出する。 | `partial`: system-level requirement/oracle coverage、該当NFRに定義される場合の測定条件・閾値・staleness、未解決findingの扱いはこの固定pairの個別条件には含まれない。system testの実行・結果も証明されない。 | L3↔L10は1組。L10 passはL11利用者受入やL12運用評価を代替しない。FR/NFR/ACのいずれかが未traceなら全体完了を推定しない。 反例: 全unit/integration testがpassしただけでsystem固有NFRを未測定のままL10 acceptedにする。 |
| `REQSRC-SUP-00044` / 56 | \| L11 \| 受入テスト \| L2 要求＋画面プロト \| 実利用・実データで要求とUXを検証 \| | 固定HARNESS-L2-001/L11-001はL2とL11のpair、L2/L11とL3/L10の区別を示す。後発採択HARNESS-L2-039/L11-039は選択scopeに適用されるreal-data evidenceとhuman evaluationを、ux_verified主張に限り別状態で扱う。 後発限定scope: HARNESS-L2-039/L11-039. | `partial`: 039が扱うUX evidenceは、旧行のL11利用者受入全体と同義ではない。実利用条件、対象者/role、要求ごとの受入oracle・record・拒否基準の全条件と、039以外のL11受入条件は残る。039の採択からlegacy rowのcoverage、L2.5 agreement、formal successorは導けない。 | L2↔L11は1組。prototype/PoCを適用しない場合でも理由付きN/Aが必要。L10 passからL11 passを導けない。 反例: demo/prototypeのみを実利用者受入とする、またはL2.5 N/Aの根拠なくL11を飛ばす。 |
| `REQSRC-SUP-00045` / 57 | \| L12 \| 運用テスト・改善還流 \| L1 企画 \| 運用時間軸、価値、監視、改善を検証し次cycleへ還流 \| | 固定HARNESS-L2-001はL1↔L12を正規pairに含み、current ConceptもL12を運用評価と定義する。 | `partial`: 運用時間窓、監視対象とowner、期待価値測定、improvement feedbackからL1へ戻すtrigger/oracleはf6 L2/L11-001では定義されていない。L11は利用者受入でありL12運用testと同義ではない。 | L1↔L12は1組。L11 acceptanceはrelease/operation evidenceに代替しない。時間経過なしに長期評価を成立扱いしない。 反例: L11受入passだけで監視・運用実績・改善効果まで成立とする、または運用feedbackから企画意味を無承認で書き換える。 |
## 差分と監査上の結論

旧L12受入consumerは各層のexactly-once配置や個別ACを持つ一方、f6固定HARNESS-L2-001/対L11はL1–L12全体、正規pair、L2/L11とL3/L10の区別、片側欠落検出を要求する上位契約である。旧consumerの詳細oracleが現行L2/L11 pairで個別に採択されていない部分は残差として保持した。current Conceptの層定義も参照し、旧cutover mappingは旧L7 implementationを現L6へ、旧L8–L12 test-design/verificationを現L7–L11へ移す。したがって旧sourceのL7「test implementation/TDD closure」をcurrentの同番号L7へ無条件に写像しない。

この比較は工程pairの意味親が固定L2/L11にあることと、旧sourceの各詳細条件が一対一で閉じていないことを示す。L2.5は独立canonical layerではなく、prototype/PoCの適用性は別に判定する。L10 passからL11 acceptanceやL12 operational evidenceを推定しない。残差は今後の対象revisionとauthority確認に戻すが、本監査は要求変更、PO判断、successor割当、source closureを生成しない。

## 静的検証

- archive本文とqueueの物理行46–57、source text、line SHA-256を再照合: 12/12一致。
- 対象IDの重複: 0。個別監査参照との重複: 0。
- baseline状態: `primary_residual` 12、既存個別監査ref 0。
- 判定内訳: `partial` 12、`covered` 0、formal successor 0。
- 旧runtime、CLI、hook、test、CIは実行していない。
- JSON: `v13-layer-chain-12-condition-audit-2026-09-30.json`。
