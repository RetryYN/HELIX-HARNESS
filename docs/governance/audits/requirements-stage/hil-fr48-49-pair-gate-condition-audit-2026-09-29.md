# HIL-FR-48/49 層間・V-pair gateの旧条件照合（2026-09-29）

基準main: `319869830f3711a1509f6c76dd3663a3007e1fc5`（#2298統合後）。本書は旧原文から現行要求・受入への限定監査であり、要求の採択・変更、旧familyの被覆完了、実装・旧testの実行結果を生成しない。

## 原文とauthority

旧要求 [`infinity-loop-platform-requirements.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md) はasset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。HIL-FR-48は138行（改行を除くline SHA-256 `e12937bb604330b7c3d1ad13f23bb3e60969b888cd16a311405e7a993e360d41`）、HIL-FR-49は139行（`58417554e28eff13d562e183533c1f76fbca3c27a29de9385d09e70b615ccf37`）。前者は隣接層の上下双方向edge、未降下・未逆伝播・粒度・stale・aggregate一括pair拒否、後者は正規5組とL6↔L7の原子oracle単位join、L12→L1/L0還流、片側欠落・異snapshot・未実行oracle拒否を条件とする。

旧反例の主source [`infinity-loop-system-assertion-cases.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md) はfile SHA-256 `98d2f9c9721481e6b4363c0683c00b187ce789fd6a39723323eca72395102ea8`、301–321行。行中の`design-defined`/`not-implemented`を旧test合格と読まない。旧[test-design](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md)はfile SHA-256 `a0d9a570e2d4fd7ad77d4671202e21fb76fa29845a5d4bad7b3c374905401217`。そのAPI名、fixture数、旧digest形式は技術実装資料であり、現行の要求条件へ自動転用しない。

現行の[HARNESS-L2-040](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-040)と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-040)はcatalog、12層、6 pair、row edge、L0層外anchorの**契約**を扱い、#2295 PO判断のexact revisionで採択済み。採択を記す[判断記録](../../decisions/po-decision-2026-09-29-57candidates.md)の登録IDは`MPR-RC-HARNESS-L2-040-002`、L2節SHA-256 `c349606d7798e3f4eb5e6cb31e0618a83dcfa05f9fc888b0ce618f6d160757df`、L11節SHA-256 `366518f8e32ac4dda1e5f4ec88ef0cfed6bc363d597955ffffb1a82d706fc212`。別の[HARNESS-L2-022](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-022)と[対L11](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-022)は段階別検証・受入の意味を持つ。025/026は設計と対oracleの構成を扱う。040のcatalogだけをpair gateの評価結果へ繰り上げない。

## 条件別の照合

| 旧条件・反例 | 現行との関係 | 未完の意味または受入oracle |
|---|---|---|
| FR-48。031-01（301行、正常）、031-02（302行、`derived_from`欠落）、031-03（303行、backprop欠落） | 040は上下流edgeの存在を定め、L11はpair片側edgeの欠落を拒否する。003/004はBackflowの戻し先を定める | **部分対応**。隣接層ごとの`derived_from/downstream_to`と`backpropagates_to/supersedes`の双方を評価し、未降下と未逆伝播を別findingにするgateの出力・L11は未特定 |
| FR-48。031-05（305行、L5→L3飛越）、031-06（306行、子が親より粗い） | 040のcatalogは層とrow粒度を特定する | **未対応**。隣接性違反、粒度逆転、aggregate一括pairをそれぞれ拒否するoracleを040のL11一般欠落例から推定できない |
| NFR-29 cross-condition。031-04/07/08（304/307/308行、古いdigest・意味revision差・snapshot差） | 040の対象revision/staleおよびOS側の保存状態に関連する | **部分対応**。旧pair receiptをstaleとし新pair receiptを出さない具体的なnegative oracleは現行の対節で未確認。FR-48だけのatomとして数えない |
| FR-49。032-01（309行、正常）、032-02〜07（310–315行、6 pair各欠落） | 040は正規6 pairを明示し、L11はpair片側edge欠落を拒否。022はL8–L11の段階的検証、025/026は設計と対oracleの構成 | **部分対応**。各pairの原子oracleでの双方向joinを評価し、欠けたpairだけをfindingへ返す独立gateの受入は未特定。025/026の設計構成や022の段階判定を、旧gateの実行と同一視しない |
| FR-49。032-08（316行、L12→層外L0還流edge欠落） | 040はL0を層外anchorとして保持し、HARNESS-L2-021はL12観測から要求へ戻す | **未対応**。L12→L1と層外L0へのfeedback edgeを別々に照合するoracleは未特定。L0を7番目のpairにしない |
| NFR-29 cross-condition。032-09/12（317/320行、reverse欠落・異snapshot） | 040は上下流edgeと同revisionを要求。025は双方向traceを求める | **部分対応**。reverse片側欠落時の失敗とpair receipt増分0、異snapshot時のstale判定は対節で未確認。これらはFR-49だけのatomとして数えない |
| FR-49。032-13（321行、forward欠落） | 040は上下流edgeを定め、025は双方向traceを求める | **部分対応**。032-09のreverse欠落と対になるforward片側欠落のgate拒否・finding・pair receipt増分0は未特定。FR-49の旧反例として保持する |
| FR-49。032-10/11（318/319行、oracle ID不一致・execution receipt欠落） | 022はoracle結果と利用者受入記録を段階別に分け、025/026は対oracleを形成する | **部分対応**。pairのoracle identity不一致を拒否し、実行receipt欠落ではpairedに留めgreenを出さない具体例は旧gateとして未特定。設計済みoracleと実行済みoracleを混同しない |

031-09と032-14は旧test-designのassertion meta caseであり、FR-48/49の追加要求atomに数えない。旧test-designのCASE-032-08は`HIL_LAYER_L0_ANCHOR_PROJECTION_INVALID`、主sourceの旧system assertion CASE-032-08は`HIL_LAYER_FEEDBACK_L12_L0_ANCHOR_MISSING`と記す。両sourceの観測時点・意味を混同せず、本監査はFR-49原文と主sourceのfeedback欠落を照合対象とし、projection不正は別の残差として保留する。

## 次の処置境界

既存の[IR機能照合](legacy-ir-functional-source-recheck-2026-09-28.md)はFR-48/49を主に実装・技術具体化と分類し、現行の各pair/段階契約へ意味を分担している。したがって上表の「未特定」を直ちに新L2要求が欠けるという判定へ変えない。次に、旧gateの各拒否を現行要求意味の必須受入と、L3以降の設計・実行方法に分ける。前者だけが不足すると確かめた場合に、既存ownerのL11明確化または別候補を対象revision付きで起草する。後者は旧sourceをholdingに残して要件・設計引継ぎへ渡し、旧APIやfixtureを固定しない。旧HIL-BR-25、HIL-NFR-29、HAC/HAT、IR全体、実装API・fixtureは本監査で閉じない。既存の採択済み節を変える場合は対象revisionとPO判断の要否を再確認し、変更前の採択を新revisionへ自動継承しない。要求stage終了、formal successor、L3承認、実装許可、旧test合格を生成しない。
