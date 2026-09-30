# confirmed175 HBR-P4/P7/P8/P9・HNFR-P8 fixed f6 条件照合監査（2026-10-01）

旧source-qualified identity 5件を旧L1原文・旧L3/acceptance/operational-test consumerと、PO判断で固定されたf6 L2/L11 pairへ照合したread-only静的監査。作成基準mainは`e90ddf6e9eb22ba99585f591fc8458b1401f94f7`、fixed L2/L11 revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。旧source/consumerの行hash、固定pairの行またはsection digest、decision/MPRの行hashは[JSON証拠](legacy-confirmed175-hbr-p4-p7-p8-p9-hnfr-p8-fixed-f6-condition-audit-2026-10-01.json)に保持する。

5件はいずれもasset `LEGACY-ASSET-18F7940E7994634D39A1` の旧pillar sourceで、状態は`confirmed` / `preserved_pending_rehome`、formal successor未割当。2026-09-30 condition queueは全件`not_individually_compared`、証拠artifactなし、comparisonはclosureではない。今回、個票の条件を比較したが、旧identityのauthority・意味・successor状態は変更しない。

## 固定f6 pairと残差

| 旧identity | 旧sourceの条件 | f6で照合したL2/L11 | 条件比較と残差 |
|---|---|---|---|
| HBR-P4 | drift/劣化/不整合の自動検出から自動修復へroutingし、修復recipeを蓄積して予防gate/detectorへ昇格する。flake/performance劣化も対象。 | HELIXINTELLIGENCE-L2-015/016/017、HELIXLABO-L2-050 | 015は反復failureからBugbot candidateを作る条件、016はrevision・actor・write-set・side effect・budget等を束縛する限定修復candidate、017はSECURITY/Worker/HARNESS/OSの結果を別々に保つ。050はfeedbackから変更・検証・運用・再観測の改善循環を扱う。これらは限定されたfailure/candidateや結果の受渡しであり、汎用detector→repairの自動routing、repair authority、成功recipeのmemory登録と頻出時の予防gate昇格、flake/performance検出を合わせた一連の旧条件は構成しない。 |
| HBR-P7 | harness/projectの2層記憶を分離し、Claude/Codexが同じ正本revisionからbounded recallする。GlossaryをSSoTへ結び、provider標準memoryを使わない。 | HELIXOS-L2-015/019/004/009 | OS pairはauthority記録、assignment・実行・回収、evidence/continuity、停止・交代後のscope/budget/未完義務保持を扱う。これは限定された作業・受渡し状態であり、DBによる旧2層memory architecture、両agent surfaceの同一recall、Glossary SSoT、全記憶entryの投影・retireを示さない。2026-09-24のHMC判断はharness memoryをCodex/Claude連携用に限定し、知識ownerを1.0–2.x LABO、3.0以降INTELLIGENCEとし、旧Learning/Skill authorityを採用しない。よって旧owner/Glossary条件は単に現行pairへ移した扱いにしない。 |
| HBR-P8 | 外部sourceの調査・照合で幻覚を抑え、有益な知見をskill化・自己取込し、sandbox/trust-boundary下で実行する。 | HELIXLABO-L2-033/051、HELIXBRAIN-L2-026/027 | LABO/BRAIN pairは外部sourceを評価し、候補を版と評価境界のある構造へ渡す近接経路を持つ。これから汎用web/research loop、skillの自動取込、sandboxやtrust boundaryの一般実行基盤は導けない。2026-09-24判断で旧skillifyの意味はBRAINの汎用構造とLABO評価へ再導出されているため、旧skill registry名やownerの不在は残差として数えない。 |
| HBR-P9 | artifactをharness DBへ収束し、DB未収束を未完了として拒否する。cross-artifact relation graphとcontract ledgerでimpact・整合を分析する。 | HARNESS-L2-004、HELIXOS-L2-015、HARNESS-L2-023 | 004は要求/設計/検証relationから影響を導き、unknownを未影響にしない。OS-015はauthority/evidenceの記録、023は条件ごとの選択依存を宣言する。いずれもrelationやdependencyの限定確認であり、全artifactのDB収束、全体contract ledger、DB未収束=未完了というglobal gate、旧HOT dashboard acceptanceを構成しない。旧DBアーキテクチャを現行必須条件へ戻さない。 |
| HNFR-P8 | 外部連携をsecret漏洩防止・trust boundary・sandboxの下に置く。不可逆な高影響操作だけを定義された範囲で人へescalateする。 | HELIXSECURITY-L2-005/006/007/008/009 | pairはcredential/secret境界、network/egress制約、Worker制約の適用観測、operation単位authority、revoke/quarantine伝播を個別に扱う。これらは隣接するsecurity境界だが、全旧external-call taxonomy、汎用sandbox技術、全agentic段階導入を満たす証拠ではない。旧L3のaction-binding、injection分類、task-scoped permission等もconsumerとして残る。実行やsecurity validationの結果は本監査から主張しない。 |

旧consumerはL3のHR-FR-P4-01..03、P7-01..03、P8-01..04、P9-01..06、HR-NFR-P8-01..03と、対応するHATおよびHOT行を固定した。これらは旧条件が下流でどう具体化されたかの参照であり、旧test-designを実行したり、現行の合格証拠として扱ったりしない。個別のline/path/file SHAはJSONの`old_consumer_pins`にある。

## f6後の採択近接行

後発decisionは固定f6の構成に混ぜず、意味近接screenとして別に記録した。2026-09-29の採択decision row LABO-L2-062は、claimごとのsource span/版/支持・反証・一次確認に限る2.0条件であり、P8全体、一般web能力、sandboxを閉じない。同日のLABO-L2-063は同種再発から予防candidateへつなぐ選択されたrecurrence/evidence flowであり、P4全体や自動修復authorityを閉じない。両者のdecision row、MPR registration、現在のL2/L11選択section digestをJSONへ記録した。MPR記録上のmanagement stateは`registered_proposal`、authority effectは`none`であり、decision rowの「採択」を実装・実行の成立へ読み替えない。

2026-09-30 live26のHARNESS-L2-060/HELIXOS-L2-103は適用対象に限るevent/evidence因果、HELIXOS-L2-104/106/111はauthority・binding reference・receipt AND条件、HELIXOS-L2-105/107/108/109/110は限定されたcorrelation/provenance/consumer/digest条件に近接する。これらはP9全artifact収束やglobal DB completion gateを作らず、HNFR-P8の全security/sandbox条件も置換しない。各採択row、MPR registrationおよびcurrent L2/L11 section digestをJSONに記録するが、近接はsource closure・successor assignment・authority拡張を意味しない。

## 旧source起点と意味差分

旧asset ledger、carry-forward、identity structure classificationはいずれも個票の同一source path/idを示す。旧pillar source全体はSHA-256 `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc`。f6 pairは2026-09-28の機構別PO判断が固定したHARNESS/OS/LABO/BRAIN/INTELLIGENCE/SECURITYの対象revisionから取得し、現HEADの差分をf6の内容として混ぜていない。

意味差分として、2026-09-24 PO判断HMC-BR-003/-006はmemory knowledge ownerとprovider standard memoryの境界を明示し、旧Learning/Skill authority名を持ち込まない。2026-09-24のPO判断とLABO-L1-009によりP8のskillifyはBRAIN汎用構造とLABO評価の境界へ再導出された。旧P9のDB architectureも現行の個別relation/依存宣言へ置換された範囲だけを認め、旧global convergence gateは継承しない。これらの差分を、legacy archiveの不在・未完成・runtime有無を理由に正当化しない。

## 非主張と静的確認

この監査は旧要求の意味変更・retireを決めず、formal successorを割り当てず、authorityを発生させず、旧source closureやStep 5完了を主張しない。固定pairの存在は実装・runtime動作・テスト合格・CI・運用成功・security validation・利用者受入を意味しない。archiveのCLI/workflow/hook/adapter/runtime/test/CIは実行していない。

JSONの旧source/consumer行、asset/carry/classification pins、f6 L2/L11 target section digest、fixed-decision file SHA、後発decision/MPR/current-section pins、identity件数を静的照合する。現行`scfctl validate`・`scfctl stale`と`git diff --check`も実施し、動的テスト・CIは使用しない。
