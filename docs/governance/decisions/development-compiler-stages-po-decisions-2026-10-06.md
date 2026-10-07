---
title: "Development Compilerの段階をConceptの版へ置くPO方針 decision record（2026-10-06）"
decision_record_id: HDEC-DEVELOPMENT-COMPILER-STAGES-2026-10-06
decision_status: recorded
decider_role: PO
decided_at: 2026-10-06
recorded_at: 2026-10-07
source: 2026-10-06（Asia/Tokyo）のClaude作業session（lane `review_merge`）での「HELIX Development Compiler 構想」の検討と、POの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Development Compilerの段階をConceptの版へ置くPO方針（2026-10-06）

## 記録の範囲

2026-10-06（Asia/Tokyo）のClaude作業sessionで、POが「責務コンパイラシステム構想」（HELIX Development Compiler 構想。設計の変更から、影響の範囲、ticketの差分、検証の義務を再計算する構想）を示した。AIが現行の要求と旧HELIXとの対応を調べ、Conceptの版との関係をPOに問うた。本書は、そのPOの発言とAIの整理の記録である。
POの発言はそのまま引用し、AIの整理と区別する。AIの整理のうち、POが「OK」で受けた範囲を方針とする。
Conceptは人が持つ上流である。本書はPR上でPO本人の確定を受けてからmainへ入れる。本書から、要求（L2）の合意、要件（L3）の承認、実装許可、PoC、CIの起動、release、Issue closeを生成しない。

## POの発言

会話の順に、構想に関わる発言を引用する。

1. 「責務コンパイラシステム構想」「やって」
2. 構想の部品を車にたとえた表を示し、CIを「ブレーキ＋車検＋故障診断」とした表について：「車検ｗ」「検査整備項目つくればええんよｗ」
3. AIがConceptへ入れる場合の判断点（D1〜D3）を示したことに対して：「それって最終的なConceptバージョン5だよね？そこまでのロードマップで今回のは責務とか境界で部品コンパイラができるって定義に近いからそこに差し込めば？」
4. AIが1.0〜5.0をコンパイラの段階として並べる案（1.0 部品コンパイラ、2.0 製品部品フィードバックコンパイラ、3.0 製品フィードバックコンパイラ、4.0 フローコンパイラ、5.0 System Compiler）を示した後：「フィードバックコンパイラはHELIXWebからの収集含んでるんだけど。」
5. AIがWeb由来の実績の集計・評価をHELIX-Benchの役割として説明したことに対して：「Web 由来の実績の集計と評価は、HELIX 本体の LABO に内蔵する HELIX-Bench が担う。これはAIモデルのはなしだろ？」
6. 「HELIX-Web-laboで実際の製品開発をしているところから出る問題を拾っていけばいい。」
7. AIが、その経路の候補としてLABOのWeb節（`HELIXLABO-L2-WEB-001..014`）を示したことに対して：「OK。というかいま提案しているもの1の段階でできるものだし。」

## 方針（AIの整理。PO本人の確定を要する）

### 1. 段階の名前と並び

Concept 5.0の「System Compiler」へは、版ごとにコンパイラが育つ段階として至る。既存の各版の行の意味は変えない。

| 版 | 段階の名前 | 対応するConceptの既存の内容 |
|---|---|---|
| 1.0 | 部品コンパイラ | OSの推進は、HARNESSが定めた工程の部品を規則どおりに組み合わせ、途中結果で差し戻す（[統合確認の判断記録](handoff-integration-po-decisions-2026-09-26.md) 4.） |
| 2.0 | 製品部品フィードバックコンパイラ | LABOが外の情報を分解し、使える構造をBRAINへ入れ、根拠付きで推薦する |
| 3.0 | 製品フィードバックコンパイラ | HELIXの開発データでローカルLLMを学習・評価する |
| 4.0 | フローコンパイラ | 部品にない流れまでINTELLIGENCEの判断で組み立てて再計画する |
| 5.0 | System Compiler | 改修は全再生成ではなく、検証可能な差分更新で行う |

### 2. 1.0の部品コンパイラ

POの発言7「いま提案しているもの1の段階でできるものだし」により、構想は1.0の範囲で作れるものとして扱う。
1.0の部品コンパイラは、新しい機構を足さず、既存の採択済み要求の接続として書く。

- HARNESS-L2-004（要求から設計・テストへの対応と、変更時の再検証範囲の導出）
- HARNESS-L2-005（ticketとの関係から決める検証義務）
- HARNESS-L2-027／028／029（Reverse・差分・往復改修。2026-09-28の[HARNESS要求の判断記録](helix-harness-requirements-po-decision-2026-09-28.md)）
- HELIXOS-L2-008／010／011（検証義務と統合計画に従うCI、推進、再計画）

### 3. 2.0／3.0のフィードバックの元と経路

- POの発言4・6により、2.0／3.0のフィードバックの元は、HELIX-Webで実際に製品を開発しているところから出る問題とする。
- 経路はLABOのWeb節（`HELIXLABO-L2-WEB-001..014`、[LABOの候補文書](../../helix-labo/candidates/improvement-research-requirements.md)の14節）とする。製品開発のepisodeは`HELIXLABO-L2-WEB-001`、顧客固有の意味と汎用化できる構造の分離は`HELIXLABO-L2-WEB-012`にあたる。
- POの発言5により、この流れは、Worker・モデルの水準を出すHELIX-Benchの評価（`HELIXLABO-L2-WEB-010`等）とは別に扱う。
- データの利用目的は、[HELIX-Web製品群の判断記録](helix-web-product-group-po-decisions-2026-09-26.md)の117行（個別プロジェクト内の利用、事業内の改善、横断的な知識化、モデル学習を分ける）に従う。2.0は横断的な知識化、3.0はモデル学習の目的にあたり、それぞれの同意がある範囲だけを使う。

### 4. コンパイラが持たない権限

- コンパイラが持つのは、入力と提案までとする。部品の規則を確定・変更する権限は持たない。
- 2.0の推薦の採否は、既存のownerが決める。外で成功した方式をそのままBRAINへ入れない（[LABOの判断記録](labo-core-engine-po-decisions-2026-09-26.md)）。
- 3.0のモデルは、INTELLIGENCEの提案として扱い、採用はOSが行う（[INTELLIGENCEの判断記録](intelligence-l1-idea-po-decisions-2026-09-26.md)）。

### 5. 保つ境界

- 全件CIやnightlyは復活しない（[HARNESS V字の判断記録](harness-v-valley-process-po-decisions-2026-09-26.md) 40〜58行：PR前のCIはticketとの関係で決め、merge直後の全件実行と夜間の補完はしない）。
- Ticket非参照境界（[OSのL2](../../helix-os/L2-requirements/governance-requirements.md) 1190行、HELIXOS-L2-047）：ticketを依存graphのnodeにしない。
- 影響の状態は、既存の要求の状態語（affected、unaffected、unknown、stale）を保つ。HARNESS-L2-082（2026-10-03の[PO判断](po-decision-2026-10-03-later35.md) 39行で承認。版は未指定）の、選択scopeのchild receiptをすべてstaleにする条件と、missing/unknown/staleをunknown／未完として扱う条件を、unaffectedへ狭めない。
- 検査をすり抜けた失敗の振り返りはLABO（上記HARNESS V字の判断記録）、後段のfailureと依存edgeの結び付けはHELIXOS-L2-031に残す。
- 進行中のL3／L10の固定親の意味を変えない。HARNESS-L2-040、HELIXLABO-L2-069／070へ、コンパイラの指標や構造を混ぜない。
- PoCは今回作らない。作る場合も、PoCとScaffoldは別のidentityとして扱う（[Scaffold Bindingの要求候補](../candidates/scaffold-binding-requirements.md) SCF-HARNESS-006）。

## 旧HELIXとの対応

旧HELIXの次の記述を起点にした。

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/system-synthesis-requirements.md` SYN-R-01（44行、接続identity）、SYN-R-02（49行、決定的部分合成） | node／edgeをidentity・revision・digestで束縛し、同じ入力から決定的に再生成する。曖昧・欠落・unknownをLLMの推測で補わない | なし（1.0の部品コンパイラの性質としてそのまま保つ） |
| 同 SYN-R-07（89行、影響profile） | 変更から、固定registryにある検査の集合を合成する | unknown／high-riskをfullへ倒し、main・nightlyでfull verificationを必須とする点は採らない。2026-09-26のPO判断（全件実行と夜間補完をしない）と、unknownを状態として保持する現行要求（HARNESS-L2-082）に従う |
| 同 SYN-R-09（102行、shadow限定の全体計画）、SYN-R-10（108行、Development Modelの昇格条件）。保留したincremental resynthesis（同123行、roadmap #1037） | 保留の解除条件（規則ベースの基準線を上回る再現可能な比較、複数projectの実績、誤判定の分類、shadowが書き込まないことの検証、L3での人の確認）を、2.0以降へ進む条件として引き継ぐ | 保留の対象を、2.0〜5.0の段階として名前を付けて並べる |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md` CIS-R-04（60行）〜CIS-R-15（121行） | 証明責務のidentityと、安全性の測定 | 検査範囲を決める元を変更の差分からticketへ移す（2026-09-26のPO判断） |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/impact-ci-recovery.md`、`L5-detail/impact-ci-recovery.md` | 影響範囲だけを検査し、省いた検査を記録して黙って捨てない | 回収の場所を、merge直後の全件実行から合流先のticketへ移す（同上） |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` HXT-FR-003／007／016 | ticketを作業指示として扱う | ticketを依存graphのnodeや実装部品として参照しない（Ticket非参照境界） |

新しく加わるのは、1.0〜5.0をコンパイラの段階として並べる名前と、2.0／3.0のフィードバックの元をHELIX-Webの製品開発とする点である。どちらもPOの発言3・4・6・7による。

## POへの問い（未決）

次の2件は、本書では決めない。

1. `HELIXLABO-L2-WEB-001`（Web由来のepisodeの関連づけ）と`HELIXLABO-L2-WEB-012`（顧客固有の意味と汎用化できる構造の分離）の採否と版。両者は2.0／3.0のフィードバックの元になるが、現在は候補であり（[LABOのL2](../../helix-labo/L2-requirements/labo-requirements.md) 352・374行）、本書から採択を生成しない。`HELIXLABO-L2-WEB-002..014`は今回扱わない。
2. LABOの候補文書の14節は、見出しを「HELIX-LABO内のHELIX-Benchに対する追加要求」としている。POの発言5（Benchはモデルの話）と、製品開発の問題を拾う流れを、同じ節の中でどう分けるか。

## 本書から生成しないもの

要求（L2）の合意、要件（L3）の承認、`HELIXLABO-L2-WEB-*`の採択、実装・PoC・CIの起動、release、Issue close。
