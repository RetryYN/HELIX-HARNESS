# confirmed175 FR-L1-20・FR-L1-37・FR-L1-38・FR-L1-39・FR-L1-43 条件照合監査（2026-09-30）

本監査はconfirmed175のうち、2026-09-30条件比較queueで `not_individually_compared` とされた5 identityを、旧原文・consumer条件、固定f6dad2a L2/L11、後続判断済み近接pairと照合した静的記録である。authority effectはnone。個票・全hash・decision screenは[JSON記録](legacy-confirmed175-fr-l1-20-37-38-39-43-condition-audit-2026-09-30.json)を参照。

## sourceと方法

- 旧sourceは[`functional-requirements.md`](../../requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md)、archive実体 `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md`。asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`、file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。5件ともsource status `confirmed`、carry `preserved_pending_rehome`、successor IDsなし。個別行はFR-L1-20 line 51、FR-L1-37 line 68、FR-L1-38 line 69、FR-L1-39 line 70、FR-L1-43 line 74。
- 旧consumerはHM-05/HM-08の画面仕様・trace表（screen-requirements.md:188–197, 456, 472–473）、OT-18/22/24/40（L1-operational-test-design.md:37, 73, 75, 91）、L3 business detail（151–177, 198–230）、L6 function spec（276–280）、L7 unit test design（881–891）を読み、旧条件・数値・負例を確認した。個票へのsource path/SHA/行対応はJSONに収録。これらは履歴上のconsumerであり、採用または実行証拠ではない。
- 固定比較はrevision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のqueue target pairに限定。各文書SHA-256はJSONに保存した。
- 後続近接比較は57候補判断のsource HEAD `318ec4a04abb3c1cc17111b3d939f913facd5fd3` に記録されたHARNESS-L2-034、HELIXLABO-L2-065、HELIXLABO-L2-069のみ。57件・11件の全identity/status screenをJSONへ収録するが、screenは候補のsource atom coverageを意味しない。近接pairのL2/L11全体hashはsource HEAD `318ec4a04abb3c1cc17111b3d939f913facd5fd3` のraw bytesから再計算し、判断表と一致確認した。L2 section digestは同HEADのMPR register `candidate_semantic_digest`、L11 section digestはdecision記録の見出し境界規則に沿って再計算した。

## 個別条件照合

| identity / source行 | 旧条件、consumer、数値・例外 | 固定・後続pairが保持する意味 | 残差・負のoracle |
|---|---|---|---|
| **FR-L1-20** line 51 | 5 hookでAI実行を全量記録し、発火/トラブル/精度/予算を集約。追加4軸はskill/model使用parameter、trouble、token/利用cost。HM-05はinvocation_logのdate/model/role/task/result/token/cost、guard allow/block/bypass、budget/warning/bypass承認、skill/hook tabs、30秒polling、normal/bypass warning/block red/emptyを指定。HM-08はaccuracy_score等に接続。 | 固定LABO-001はsource identity/revision/authorityとsuccess/failure/rejected/cancelled/blocked/unknown/not_observedの区別、OS-018はassignment/run state、OS-022はcandidate/feedbackを保持する。後続HARNESS-034採択は測定契約・根拠の近接面。ただし5 hook全量、4軸、HM-05列/頻度は採択していない。 | hook event schema/coverage、計測軸の定義・分母・欠測処理、HM-05状態/頻度の受入oracle、精度/予算式が残る。unknown/not_observedを成功扱いせず、観測不能を0値へ変換しない条件が未固定。 |
| **FR-L1-37** line 68 | task×drive×L×残budgetからmodel ID、reasoning effort、選定根拠を推挙。旧拡張は`helix task estimate`/`helix skill suggest`入力とfrontier-reviewer/worker/fast-checker classを記載。OT-22はdrive欠落推定・model候補・drive state分割。 | 固定INTELLIGENCE-010の候補配置入力/根拠、LABO-055のtask-kind/model-class別評価・未評価区別、OS-027のoracle不在時un-evaluated境界は関連する。LABO-069は閾値なしの観測/評価能力。いずれもmodel/effortをtaskへ割り当てない。 | 直積の対応関数、候補集合、effort語彙、根拠ログ、unknown input oracle、旧class/CLI I/Oは未確定。drive/task/L/budget不明時に推測して推奨しない。provider名や性能を根拠なく固定しない。 |
| **FR-L1-38** line 69 | `model_runs` + `plan_registry`からper-model success rate 0..1。opt-in有効時のみ、disabled/missing opt-inとcold startは0 rows、未知pricingはnull。旧L3/L6/L7はconfirmed/completed success、model単位件数、pricing provenanceも扱う。 | 固定INTELLIGENCE-011のevidence/applicability/unknown、LABO-055のevaluated/un-evaluated履歴は隣接意味を保持する。LABO-065の初回AttemptとLABO-069の観測能力は別測定単位で、model成功率に対応しない。 | 現行pairはprojection table、opt-in、row cardinality、success denominator/status、価格根拠を規定しない。opt-inなしを成功率0と扱わない。未知pricingを捏造せずnullのままにする旧条件も未移管。 |
| **FR-L1-39** line 70 | size/dependency/uncertainty×driveで難易度scoreを算出しP0/P1/P2分類、effort推奨。旧拡張は`helix task classify --text/--plan/--diff`とkind/drive/size/complexity/risk flags。OT-22/HM-08はmodel候補・cost分析を接続。 | 固定INTELLIGENCE-066のhuman proposal schema/scope、OS-027のun-evaluated、HARNESS-003/005のprogression・verification dutiesは境界として関連するが、scoring algorithmではない。 | 数式/重み/閾値、CLI I/O、risk flags、P0/P1/P2の受入oracle、FR37 handoffは未解決。L6旧設計のunknown=explicit uncertainty, not low complexityは負例として保持し、低難易度に倒さない。 |
| **FR-L1-43** line 74 | confirmed/rejected/pivotからPoC success rate 0..1。cold startは0 rows、決定未記録は分母除外。旧consumerはpivotを分母に含む非成功とし、10件の例6/3/1=0.60を示す。 | 固定LABO-001はoutcome状態区別、LABO-006は比較不能/中断ケース、LABO-050はfeedback/edit/CIのみではimprovement closureでないことを保持する。LABO-065は初回Attempt、LABO-069は観測/評価能力であり、PoC結果率ではない。 | 現行pairはpopulation/decision source/count/rate/cold-start/undecided denominator/asOfを定義しない。pivotをsuccessにしない。未決をrejectedにしない。empty populationを0%と表示せずprojectionなしとする旧oracleは未移管。 |

## 後続近接pairの限定効果

57候補判断の近接行・L2/L11 source file SHAとsection digestはJSONに固定した。HARNESS-L2-034 adoptedは測定契約の根拠に近いが、FR20のhook/4軸やFR38/43のrate semanticsは含意しない。HELIXLABO-L2-065は条件付き採択で、D1として「最初のAttemptの結果」を扱い、067とは別指標である。FR38のmodel単位成功率やFR43のPoC outcome rateへ一般化しない。HELIXLABO-L2-069は観測/評価能力を採択するが、判断記録は固定閾値・自動学習を含めない。したがってFR37/39のscore/自動推挙やFR38/43のprojectionを採択したことにならない。

## 57+11 identity/status screen

JSONは57候補全件（42 adopted、11 conditional adopted、4 held）と後続11件全identity/statusを記録する。後続11件は8 adopted、2 adopted with dependency、1 not adopted at current revision。これは判断記録の範囲・status screenであり、今回5件との意味対応、要求採択、旧source atom coverageやsuccessor割当を表さない。近接digestは上記3 pairに限定した。

## 判定と限界

5件の保持は部分的・条件範囲内であり、個別source atom coverageは未確定である。旧CLI、`harness.db`、archive runtime/test/CIを実行しておらず、旧画面のnot-implementedや旧テストの合格を現行根拠にしていない。本記録は要求採択、意味変更/retire、formal successor、実装/実行、条件閉包、Step5完了を主張しない。

## 静的検証

JSON duplicate-key、archive/holding source一致、source line hash、入力ファイル/decision hash、f6 pair bytes、decision screen件数/status、near-pair全体hash、L2 MPR digest、L11 section digest、Markdownリンク、`git diff --check`を検証する。各pair hashはsource HEAD `318ec4a04abb3c1cc17111b3d939f913facd5fd3`のbytesから再計算する。検証結果は作業報告に記載する。
