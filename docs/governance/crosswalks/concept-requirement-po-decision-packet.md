# Concept要求再配置 PO判断パッケージ

親：[HELIX Concept](../../concept/helix-concept.md)。本書は採否を**求める候補一覧**であり、採否・承認・Issue close・successor採番を記録しない。原文と全列は[要求対応表](concept-mechanism-version-requirement-crosswalk.jsonl)に保持する。原文は各項目に短縮せず示す。Conceptの現行ファイルを基準にする。

## PO判断に載せる条件

人が持つConcept・L1・L2／prototype合意・L3承認の意味が変わる項目、または[authority状態モデル](../authority-state-model.md)が対象revisionの人間decisionを求める項目だけを判断対象とする。旧sourceの未承認、conflict、未特定、旧HELIXの対応記述が見つからない箇所も残す。旧sourceでのconfirmed／specified/frozenは新配置の承認ではない。担当移動や技術選定だけは後段のAI作業一覧に置く。

各選択肢の「保留」は原文と旧authority状態を保持し、完成・不採用・retireを意味しない。推奨は**レビュー順序・候補**であり、PO decisionではない。

## 承認済み上流revisionとの差分

次の旧SHAだけが各decision recordの承認対象である。現行ファイルはConceptを親にした**未承認候補**であり、旧承認を継承しない。選択肢Aでもこの文書はdecisionを記録せず、POが対象revisionを指定して判断する。

### HARNESS L1（HARNESS-L1-001〜009）

- 原文・revision：[旧承認L1](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/helix-harness/L1-planning/product-intent.md)、SHA-256 `a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04`。対象外節は「Worker割当、CI運転、ログ・state保存、学習、プロジェクト群の統制、artifact配布運転はHELIX-OSが所有する」。
- 提案・差分：親を現行Conceptへ移し、サービス①〜⑦を個別成立・利用・release単位と記述する。旧OS一括の学習・評価をLABOの独立評価と3.0 Intelligenceの知識・モデル改善へ分ける。既存9 IDのサービス別分割とL11受入は未了。
- 理由・影響：Conceptの製品内区分と機構境界へ合わせるため。サービス単独成立の意味はL1提供価値を増やし、旧対象外節のownerを変更する。旧decisionは新bytesを承認しない。
- 選択肢：A 現行候補を対象revisionで採る→各サービスの単体・接続L2／L11を別途起草。B 旧意味を保持し、Conceptとの差分を未解決にする→旧L1は履歴として保持し、当該差分からL2を導かない。C 保留→現行候補は未承認のまま。
- 推奨：Aを審査候補とし、9 IDからサービス①〜⑦への無損失被覆表をPO判断前に確認する。

### HELIX-OS L1（HELIXOS-L1-001〜012、とくに006）

- 原文・revision：[旧承認L1](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/helix-os/L1-planning/system-intent.md)、SHA-256 `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8`。提供価値は「authority、変更、Worker、状態、証拠、CI、配布運転を管理・統制」。`HELIXOS-L1-006`原文は「人間は、HARNESS自身への適用を含む観測・失敗・学習を評価し、HELIX-OSに採択済み改善の実行・再検証・効果確認を継続させられる」。
- 提案・差分：OSを管理・推進・検収に分け、ticket発行とCI・test最適化を明示する。L1-006はLABOの独立評価を受けてOSが改善を登録・実行・再検証する候補に変更し、OS自身の学習評価を外す。
- 理由・影響：ConceptでLABOは1.0から評価、Intelligenceは3.0から知識・モデル改善を担う。旧L1-006の「学習を評価」と効果確認のownerが変わる。L2-005とL11の対条件は旧承認から継承できない。
- 選択肢：A 現行候補を対象revisionで採る→LABO評価とOS登録・推進・検収の単体／接続受入を起草。B 旧意味を保持→Conceptとの衝突を明示し、学習側のL2へ進めない。C 保留→旧承認revisionのみ有効な履歴として残す。
- 推奨：Aを審査候補とし、L1-006の評価入力・改善採否・効果確認を別責務として確認する。

### HELIX-Web L1（HELIXWEB-L1-001〜006）

- 原文・revision：[旧承認L1](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/helix-web/L1-planning/product-intent.md)、SHA-256 `26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756`。「HELIX-Webは、利用者が許可した開発環境と能力へConnectorで接続し、長時間の開発作業、進行、成果、停止・再開をダッシュボードから確認・操作できるAI開発SaaSを目指す」。
- 提案・差分：現行候補は1.xでHARNESSサービス①〜⑦をrelease単位として顧客へ提供すると加えた。顧客提供の範囲とWeb-OSの運転接続が旧L1より具体化する。
- 理由・影響：Conceptの1.x Web提供と7サービス独立性に合わせるため。旧L1のConnector型SaaSの意味を保持しつつ提供単位を増やすため、対象revisionのL1判断が必要。
- 選択肢：A 現行候補を対象revisionで採る→サービスごとの顧客利用・取消・復旧をL2/prototype/L11へ分ける。B 旧SaaS記述のまま保持→Conceptの7単位との接続を未解決とする。C 保留→現行追加文からrelease条件を導かない。
- 推奨：Aを審査候補とし、HARNESS各サービスの成立とWebによる提供を別受入で確認する。

### HELIX-Web-OS L1（HELIXWEBOS-L1-001〜005）

- 原文・revision：[旧承認L1](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/helix-web-os/L1-planning/system-intent.md)、SHA-256 `600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c`。「HELIX-Web-OSは、HELIX-Webの展開時にHELIX-OSの外へ構成し、利用者向けWebサービスを安全かつ継続的に運転する基盤である」。
- 提案・差分：親を現行Conceptへ付け替え、旧承認revisionからの差分照合を採択条件へ明示した。L1要求5件の本文意味は変更していないが、decision recordは誤記を含むbytes変更にも新revision判断を要求する。
- 選択肢：A 現行の親付替えrevisionを対象SHAで確認→1.xのWeb-OS候補として下流へ。B 旧承認bytesを履歴の根拠に保ち、現行差分を未承認にする。C 保留→現行L1から合意を生成しない。
- 推奨：Aを審査候補とする。Web-OSのservice runtimeとOSのproject管理が混ざっていないことを確認する。

### 5大目標（HELIX-FIVE-GOALS-V0.1）

- 原文・revision：[旧承認本文](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/concept/helix-five-goals.md)、SHA-256 `cfade733b9023bcc3329916206a911794e13f2b4f4f1e198d6c57618049771ca`。位置づけは「まず目標差分を取り込んだConcept revisionを人間判断へ戻す。そのConceptの承認後に、対象別L1、L2／L11へ無損失に分解する」。関与表にはsimulation contract、Web-OS Worker、Web同意管理のowner未確定を記録していた。
- 提案・差分：現行候補は5大目標を単一Conceptの子へ接続し、8機構＋2共通部品と版ごとの関与表へ置換した。旧表の未確定ownerを一部1.0責務として具体化した。simulation入力・同意管理・Web-OS Workerの旧未決点はなお未決として保持する。
- 理由・影響：現行Conceptとの親・責務整合のため。ただし旧decision recordが位置づけの一文を根拠に引用し、承認は旧SHAだけに効く。新しい1.0責務表を承認済みとして使えない。
- 選択肢：A 現行候補の責務表を対象revisionで採る→各L1とL2/L11の未被覆を別判断へ。B 旧表の未決ownerを残して再編集→具体化前に責務候補を比較。C 保留→旧承認本文だけを履歴authorityとして保持。
- 推奨：B。旧表の3未決点を保持し、Conceptが確定する責務だけを新表へ入れてから対象revisionを審査する。

### 製品責務境界（product-boundary.md）

- 原文・revision：[旧承認本文](https://github.com/RetryYN/HELIX-HARNESS/blob/11a22679dc2bfce57d3294759531282445625001/docs/concept/product-boundary.md)、SHA-256 `097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038`。旧OS行は「authority管理、Worker、実行制御、CI、ログ、状態、学習、改善、配布運転」。旧PO対応表は要求PRを人間が確認する読み方を含む。
- 提案・差分：現行候補はOSを管理・推進・検収に分け、ticket発行とCI・test最適化、LABOの独立評価、3.0 Intelligenceの知識・モデル改善へ責務を分離する。PO判断条件は上流意味変更とauthority-state-modelの人間decisionに限り、担当移動・技術変更はAI作業へ送る。
- 理由・影響：旧承認のOS一括学習・Worker責務と人間確認の範囲が変わる。`hil-br-02-product-scope-2026-09-23.md`が引用した旧SHAは現行本文を承認せず、旧OS routingを現行機構へ自動継承できない。
- 選択肢：A 現行責務表とPO境界を対象revisionで採る→OS／LABO／Intelligenceの単体・接続L2/L11を旧ID付きで照合。B 旧OS一括責務を維持→Conceptの機構と3.0版境界とのconflictを保持し、当該下流を確定しない。C 保留→旧承認SHAだけを履歴authorityとして保持する。
- 推奨：Aを審査候補とし、旧OSの「学習」と「Worker」に含まれた原要求・受入を各機構へ無損失に割り当てられるか確認する。

## 判断項目

### HARNESS-L2-001

- 原要求ID・原文位置・revision：`HARNESS-L2-001`、`docs/helix-harness/L2-requirements/product-requirements.md:52`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：企画・要求・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる
- 原制約・authority：L2要求とL11受入、L3要件とL10総合検証を混同せず、各層の成果と対が分かる（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:21：L1–L12の成果と対を確認し、L2／L11とL3／L10の混同、片側欠落を識別できる
- 提案：原文「企画・要求・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる」と原制約を保ち、HELIX-HARNESS（HARNESS内 枠）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:21：L1–L12の成果と対を確認し、L2／L11とL3／L10の混同、片側欠落を識別できる。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:21：L1–L12の成果と対を確認し、L2／L11とL3／L10の混同、片側欠落を識別できるを同revisionの対条件として具体化。B 「企画・要求・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `枠`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-002

- 原要求ID・原文位置・revision：`HARNESS-L2-002`、`docs/helix-harness/L2-requirements/product-requirements.md:53`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：対象プロダクトに適した開発styleと工程の進め方を選べる
- 原制約・authority：Full V／Production Scrum／Hybridを区別し、Discovery／PoCを別軸で扱う（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:22：異なる開発styleの工程を確認し、Discovery／PoCをScrumへ混入させない
- 提案：原文「対象プロダクトに適した開発styleと工程の進め方を選べる」と原制約を保ち、HELIX-HARNESS（HARNESS内 枠）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:22：異なる開発styleの工程を確認し、Discovery／PoCをScrumへ混入させない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:22：異なる開発styleの工程を確認し、Discovery／PoCをScrumへ混入させないを同revisionの対条件として具体化。B 「対象プロダクトに適した開発styleと工程の進め方を選べる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `枠`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-003

- 原要求ID・原文位置・revision：`HARNESS-L2-003`、`docs/helix-harness/L2-requirements/product-requirements.md:54`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる
- 原制約・authority：必要な合意、対成果物、検証、未解決事項が明示され、実行成功だけで工程完了にならない（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:23：凍結・差戻し・再開・完了の条件を確認し、未合意・未検証で進行可能と判定しない
- 提案：原文「工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる」と原制約を保ち、HELIX-HARNESS（HARNESS内 枠）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:23：凍結・差戻し・再開・完了の条件を確認し、未合意・未検証で進行可能と判定しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:23：凍結・差戻し・再開・完了の条件を確認し、未合意・未検証で進行可能と判定しないを同revisionの対条件として具体化。B 「工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `枠`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-004

- 原要求ID・原文位置・revision：`HARNESS-L2-004`、`docs/helix-harness/L2-requirements/product-requirements.md:55`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：要求から設計・テストへ対応を定義し、変更時の再検証範囲を決められる
- 原制約・authority：上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:24：要求変更から影響設計・テストへ辿り、変更した条件の検証漏れを識別できる
- 提案：原文「要求から設計・テストへ対応を定義し、変更時の再検証範囲を決められる」と原制約を保ち、HELIX-HARNESS（HARNESS内 コア）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:24：要求変更から影響設計・テストへ辿り、変更した条件の検証漏れを識別できる。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:24：要求変更から影響設計・テストへ辿り、変更した条件の検証漏れを識別できるを同revisionの対条件として具体化。B 「要求から設計・テストへ対応を定義し、変更時の再検証範囲を決められる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `コア`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-005

- 原要求ID・原文位置・revision：`HARNESS-L2-005`、`docs/helix-harness/L2-requirements/product-requirements.md:56`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：言語・tool・実装方式が異なっても、layer・pair・変更種別・riskに応じた検証義務と証拠条件を適用できる
- 原制約・authority：特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:25：異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない
- 提案：原文「言語・tool・実装方式が異なっても、layer・pair・変更種別・riskに応じた検証義務と証拠条件を適用できる」と原制約を保ち、HELIX-HARNESS（HARNESS内 コア）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:25：異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:25：異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしないを同revisionの対条件として具体化。B 「言語・tool・実装方式が異なっても、layer・pair・変更種別・riskに応じた検証義務と証拠条件を適用できる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `コア`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-006

- 原要求ID・原文位置・revision：`HARNESS-L2-006`、`docs/helix-harness/L2-requirements/product-requirements.md:57`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：外部利用者が、提供範囲・版・必要依存・導入条件を確認してHARNESSを利用できる
- 原制約・authority：HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:26：提供版・機能・依存・導入条件を確認し、HELIX内部の運用状態を持たない利用環境で対象機能を利用できる
- 提案：原文「外部利用者が、提供範囲・版・必要依存・導入条件を確認してHARNESSを利用できる」と原制約を保ち、HELIX-HARNESS（HARNESS内 コア）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:26：提供版・機能・依存・導入条件を確認し、HELIX内部の運用状態を持たない利用環境で対象機能を利用できる。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:26：提供版・機能・依存・導入条件を確認し、HELIX内部の運用状態を持たない利用環境で対象機能を利用できるを同revisionの対条件として具体化。B 「外部利用者が、提供範囲・版・必要依存・導入条件を確認してHARNESSを利用できる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `コア`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-007

- 原要求ID・原文位置・revision：`HARNESS-L2-007`、`docs/helix-harness/L2-requirements/product-requirements.md:58`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：検証フェーズで複数のプロダクトを開発し、HELIX自身のプロジェクトにも適用した結果を含めて、HELIX-HARNESS製品群Version 1の完成を確認できる
- 原制約・authority：性質の異なる対象で要求から受入・運用評価までの成立証拠を確認し、HELIX-Web等の展開前提を判定できる。Web自体の完成をVersion 1へ含めない（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:27：検証対象として選定した複数プロダクトとHELIX自身のプロジェクトについて、要求revision、適用構成、成果、L11受入、L12運用評価へ辿る。単一demo、HARNESS単体test、文書整合だけならVersion 1未完成とし、HELIX-Webの完成有無を判定へ混入させない
- 提案：原文「検証フェーズで複数のプロダクトを開発し、HELIX自身のプロジェクトにも適用した結果を含めて、HELIX-HARNESS製品群Version 1の完成を確認できる」と原制約を保ち、HELIX-HARNESS（HARNESS内 サービス①〜⑦（構成体））の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:27：検証対象として選定した複数プロダクトとHELIX自身のプロジェクトについて、要求revision、適用構成、成果、L11受入、L12運用評価へ辿る。単一demo、HARNESS単体test、文書整合だけならVersion 1未完成とし、HELIX-Webの完成有無を判定へ混入させない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:27：検証対象として選定した複数プロダクトとHELIX自身のプロジェクトについて、要求revision、適用構成、成果、L11受入、L12運用評価へ辿る。単一demo、HARNESS単体test、文書整合だけならVersion 1未完成とし、HELIX-Webの完成有無を判定へ混入させないを同revisionの対条件として具体化。B 「検証フェーズで複数のプロダクトを開発し、HELIX自身のプロジェクトにも適用した結果を含めて、HELIX-HARNESS製品群Version 1の完成を確認できる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `サービス①〜⑦（構成体）`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-008

- 原要求ID・原文位置・revision：`HARNESS-L2-008`、`docs/helix-harness/L2-requirements/product-requirements.md:59`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：Concept／企画L1、利用者指示と根拠から要求候補を形成し、単体・接続・構成体の対象粒度を分け、要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示して、人間の訂正と合意により要求へ収束できる
- 原制約・authority：意味密度の高い処理をPython coreとして複数製品へ適用でき、機能A、A→Bの接続、A–Cから成るシステムAの要求と成立を混同せず、出力を承認済み要求や操作権限へ自動昇格させない（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:28：指示と要求候補を意味単位で比較し、欠落・意味追加・対象違い・未確定事項を確認できる。Python coreの出力、ログ、Issue、PR、CIだけでは要求合意や操作許可を成立させない
- 提案：原文「Concept／企画L1、利用者指示と根拠から要求候補を形成し、単体・接続・構成体の対象粒度を分け、要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示して、人間の訂正と合意により要求へ収束できる」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:28：指示と要求候補を意味単位で比較し、欠落・意味追加・対象違い・未確定事項を確認できる。Python coreの出力、ログ、Issue、PR、CIだけでは要求合意や操作許可を成立させない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:28：指示と要求候補を意味単位で比較し、欠落・意味追加・対象違い・未確定事項を確認できる。Python coreの出力、ログ、Issue、PR、CIだけでは要求合意や操作許可を成立させないを同revisionの対条件として具体化。B 「Concept／企画L1、利用者指示と根拠から要求候補を形成し、単体・接続・構成体の対象粒度を分け、要求化漏れ・企画外追加・矛盾・重複・過剰解釈・対象違い・scope／non-goal逸脱・変更影響を提示して、人間の訂正と合意により要求へ収束できる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン`、版 `1.0`、判定候補 `維持`。

### HARNESS-L2-009

- 原要求ID・原文位置・revision：`HARNESS-L2-009`、`docs/helix-harness/L2-requirements/product-requirements.md:60`、`git-blob:a878c37df08389d5cb11f244b2019fffe7c0c14d`。
- 原文：要求kind、対象、構成、risk、domainに合うversioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補として上流へ戻せる
- 原制約・authority：初期seedを参照して設計の恣意性を抑え、templateから要求意味を自動決定せず、unit・connection・composite固有の設計と検証へ接続できる（`draft`）。
- L11対応：docs/helix-harness/L11-acceptance/product-acceptance.md:29：unit、connection、compositeの各要求に適用するtemplateと設計義務を確認し、必要input欠落を上流質問へ戻せる。template適用や文書生成だけでは要求合意・設計完成・検証成功を成立させない
- 提案：原文「要求kind、対象、構成、risk、domainに合うversioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補として上流へ戻せる」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：Design Template）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-harness/L11-acceptance/product-acceptance.md:29：unit、connection、compositeの各要求に適用するtemplateと設計義務を確認し、必要input欠落を上流質問へ戻せる。template適用や文書生成だけでは要求合意・設計完成・検証成功を成立させない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-harness/L11-acceptance/product-acceptance.md:29：unit、connection、compositeの各要求に適用するtemplateと設計義務を確認し、必要input欠落を上流質問へ戻せる。template適用や文書生成だけでは要求合意・設計完成・検証成功を成立させないを同revisionの対条件として具体化。B 「要求kind、対象、構成、risk、domainに合うversioned Design Templateから必要な設計義務を導き、templateが必要とする要求入力の不足を質問・要求候補として上流へ戻せる」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：Design Template`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-001

- 原要求ID・原文位置・revision：`HELIXOS-L2-001`、`docs/helix-os/L2-requirements/governance-requirements.md:54`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる
- 原制約・authority：GitHubの状態から要求を推定せず、何に対する要求かと判断の出所が分かる（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:21：各要求の対象プロダクト・正本・合意revisionへ辿る。Issue closeを要求の削除・受入として表示しない
- 提案：原文「プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:21：各要求の対象プロダクト・正本・合意revisionへ辿る。Issue closeを要求の削除・受入として表示しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:21：各要求の対象プロダクト・正本・合意revisionへ辿る。Issue closeを要求の削除・受入として表示しないを同revisionの対条件として具体化。B 「プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-002

- 原要求ID・原文位置・revision：`HELIXOS-L2-002`、`docs/helix-os/L2-requirements/governance-requirements.md:55`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる
- 原制約・authority：未接続・未合意・未実装・未検証を区別し、部分成功で全体完了にならない（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:22：異なるプロジェクトの欠落・競合・未検証を個別に把握し、一方の成功で他方の未完を相殺しない
- 提案：原文「プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:22：異なるプロジェクトの欠落・競合・未検証を個別に把握し、一方の成功で他方の未完を相殺しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:22：異なるプロジェクトの欠落・競合・未検証を個別に把握し、一方の成功で他方の未完を相殺しないを同revisionの対条件として具体化。B 「プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-003

- 原要求ID・原文位置・revision：`HELIXOS-L2-003`、`docs/helix-os/L2-requirements/governance-requirements.md:56`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる
- 原制約・authority：あるプロダクトの方式変更が他プロダクトや共通統制を暗黙に変えない（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:23：開発方式の変更で影響する範囲だけを再評価し、共通統制の無断変更を拒否する
- 提案：原文「共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:23：開発方式の変更で影響する範囲だけを再評価し、共通統制の無断変更を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:23：開発方式の変更で影響する範囲だけを再評価し、共通統制の無断変更を拒否するを同revisionの対条件として具体化。B 「共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-004

- 原要求ID・原文位置・revision：`HELIXOS-L2-004`、`docs/helix-os/L2-requirements/governance-requirements.md:57`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる
- 原制約・authority：実行担当の交代で責務・未完義務・累積制約が失われず、自己承認や二重割当を防ぐ（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:24：割当・依存・予算・review待ちを確認し、担当交代による二重作業と自己承認を拒否する
- 提案：原文「Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる」と原制約を保ち、HELIX-OS／HELIX-BRAIN／Runner／Sandbox／HELIX-Security（HARNESS内 非該当）の1.0候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:24：割当・依存・予算・review待ちを確認し、担当交代による二重作業と自己承認を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:24：割当・依存・予算・review待ちを確認し、担当交代による二重作業と自己承認を拒否するを同revisionの対条件として具体化。B 「Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる」の意味を変更→変更前後、影響するHELIX-OS／HELIX-BRAIN／Runner／Sandbox／HELIX-SecurityとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-OS／HELIX-BRAIN／Runner／Sandbox／HELIX-Security`、属性 `HELIX-OS:非製品、HELIX-BRAIN:非製品、Runner／Sandbox:共通部品、HELIX-Security:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `改変`。

### HELIXOS-L2-005

- 原要求ID・原文位置・revision：`HELIXOS-L2-005`、`docs/helix-os/L2-requirements/governance-requirements.md:58`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して対象要求へ還流し、採択後の変更・再検証・効果確認まで継続できる
- 原制約・authority：HARNESS自身と各productの改善を同じ機構で追跡し、経験を正本へ勝手に昇格させず、訂正・棄却・保留・失効と影響範囲を確認できる（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:25：HARNESS自身への適用と各productの観測から改善候補・採否・変更・再検証・効果確認を追跡し、未承認経験の規則化、HARNESS改善責務の欠落、棄却理由の消失を拒否する
- 提案：原文「HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して対象要求へ還流し、採択後の変更・再検証・効果確認まで継続できる」と原制約を保ち、HELIX-OS／HELIX-LABO（HARNESS内 非該当）の1.0候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:25：HARNESS自身への適用と各productの観測から改善候補・採否・変更・再検証・効果確認を追跡し、未承認経験の規則化、HARNESS改善責務の欠落、棄却理由の消失を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:25：HARNESS自身への適用と各productの観測から改善候補・採否・変更・再検証・効果確認を追跡し、未承認経験の規則化、HARNESS改善責務の欠落、棄却理由の消失を拒否するを同revisionの対条件として具体化。B 「HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して対象要求へ還流し、採択後の変更・再検証・効果確認まで継続できる」の意味を変更→変更前後、影響するHELIX-OS／HELIX-LABOとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-OS／HELIX-LABO`、属性 `HELIX-OS:非製品、HELIX-LABO:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `改変`。

### HELIXOS-L2-006

- 原要求ID・原文位置・revision：`HELIXOS-L2-006`、`docs/helix-os/L2-requirements/governance-requirements.md:59`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：HARNESSの提供版を新規・既存プロジェクトへ導入し、更新・復旧できる
- 原制約・authority：source・要求revision・artifactが辿れ、既存成果を壊さず導入できる（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:26：fresh／既存repoへ提供版を導入・更新・復旧し、無断の成果消失や別artifactへの切替を拒否する
- 提案：原文「HARNESSの提供版を新規・既存プロジェクトへ導入し、更新・復旧できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:26：fresh／既存repoへ提供版を導入・更新・復旧し、無断の成果消失や別artifactへの切替を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:26：fresh／既存repoへ提供版を導入・更新・復旧し、無断の成果消失や別artifactへの切替を拒否するを同revisionの対条件として具体化。B 「HARNESSの提供版を新規・既存プロジェクトへ導入し、更新・復旧できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-007

- 原要求ID・原文位置・revision：`HELIXOS-L2-007`、`docs/helix-os/L2-requirements/governance-requirements.md:60`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：Worker・判断・操作・検証のログと証拠を保存し、対象プロジェクトと要求revisionから参照できる
- 原制約・authority：欠落・重複・古い証拠を識別し、ログの存在だけで承認・完了にしない（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:27：Worker・判断・検証ログを要求revisionから辿り、欠落・重複・staleを成功証拠として使わない
- 提案：原文「Worker・判断・操作・検証のログと証拠を保存し、対象プロジェクトと要求revisionから参照できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:27：Worker・判断・検証ログを要求revisionから辿り、欠落・重複・staleを成功証拠として使わない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:27：Worker・判断・検証ログを要求revisionから辿り、欠落・重複・staleを成功証拠として使わないを同revisionの対条件として具体化。B 「Worker・判断・操作・検証のログと証拠を保存し、対象プロジェクトと要求revisionから参照できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-008

- 原要求ID・原文位置・revision：`HELIXOS-L2-008`、`docs/helix-os/L2-requirements/governance-requirements.md:61`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：承認済み上流revisionとHARNESSの検証契約から責務に合うCI profileを組み立て、隔離して実行・監視・回収・再開できる
- 原制約・authority：上流意味reviewと下流CIを分け、未実行・失敗・中断・staleを区別し、旧CI greenで新世代未実行やreview・承認を代替しない（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:28：承認上流から生成したCI profileの起動・失敗・修復・再実行を追跡し、旧CI成功で新世代の未実行・中断・staleやreview欠落を相殺しない
- 提案：原文「承認済み上流revisionとHARNESSの検証契約から責務に合うCI profileを組み立て、隔離して実行・監視・回収・再開できる」と原制約を保ち、HELIX-OS／Runner／Sandbox（HARNESS内 非該当）の1.0候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:28：承認上流から生成したCI profileの起動・失敗・修復・再実行を追跡し、旧CI成功で新世代の未実行・中断・staleやreview欠落を相殺しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:28：承認上流から生成したCI profileの起動・失敗・修復・再実行を追跡し、旧CI成功で新世代の未実行・中断・staleやreview欠落を相殺しないを同revisionの対条件として具体化。B 「承認済み上流revisionとHARNESSの検証契約から責務に合うCI profileを組み立て、隔離して実行・監視・回収・再開できる」の意味を変更→変更前後、影響するHELIX-OS／Runner／SandboxとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-OS／Runner／Sandbox`、属性 `HELIX-OS:非製品、Runner／Sandbox:共通部品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `改変`。

### HELIXOS-L2-009

- 原要求ID・原文位置・revision：`HELIXOS-L2-009`、`docs/helix-os/L2-requirements/governance-requirements.md:62`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：中断・担当交代・障害後に、許可範囲内で継続・復旧できる
- 原制約・authority：累積予算・期限・未完義務を保持し、二重実行や範囲外操作を防ぐ（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:29：中断・担当交代後も制約と未完義務を引き継ぎ、二重実行・予算リセット・無許可復旧を拒否する
- 提案：原文「中断・担当交代・障害後に、許可範囲内で継続・復旧できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:29：中断・担当交代後も制約と未完義務を引き継ぎ、二重実行・予算リセット・無許可復旧を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:29：中断・担当交代後も制約と未完義務を引き継ぎ、二重実行・予算リセット・無許可復旧を拒否するを同revisionの対条件として具体化。B 「中断・担当交代・障害後に、許可範囲内で継続・復旧できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-010

- 原要求ID・原文位置・revision：`HELIXOS-L2-010`、`docs/helix-os/L2-requirements/governance-requirements.md:63`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：管理・推進・検収を別責務として編成し、同じticketと因果関係を保ちながら双方向に調整できる
- 原制約・authority：管理は目的・要求・制約・優先度・依存・資源・停止を推進へ渡す。推進はHARNESSのnormative工程語彙・順序を参照し、operational tag、mapping、composition、workflow instance生成規則を所有してticketと成果を生成する。管理は登録・統制し、検収はHARNESS contractへの収束を判断する。許可内の直接通信を保ち、固定モデル数や全通信の中央中継を要求しない（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:30：管理・推進・検収が同じticketと因果IDで直接調整し、scope・優先度・共有資源・要求意味の変更だけを正しい判断先へ返す。役割を固定モデル数や中央中継へ変換しない
- 提案：原文「管理・推進・検収を別責務として編成し、同じticketと因果関係を保ちながら双方向に調整できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:30：管理・推進・検収が同じticketと因果IDで直接調整し、scope・優先度・共有資源・要求意味の変更だけを正しい判断先へ返す。役割を固定モデル数や中央中継へ変換しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:30：管理・推進・検収が同じticketと因果IDで直接調整し、scope・優先度・共有資源・要求意味の変更だけを正しい判断先へ返す。役割を固定モデル数や中央中継へ変換しないを同revisionの対条件として具体化。B 「管理・推進・検収を別責務として編成し、同じticketと因果関係を保ちながら双方向に調整できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-011

- 原要求ID・原文位置・revision：`HELIXOS-L2-011`、`docs/helix-os/L2-requirements/governance-requirements.md:64`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：ticket、設計、実差分、統合先、依存と承認済みHARNESS契約から、統合順序・統合単位・検証実行計画を導出し、実行結果とbase変更に応じて再計画できる
- 原制約・authority：HARNESSの検証義務を追加・削除せず、実際の統合候補で具体化する。必要CI欠落、影響不明、契約解釈不明、stale結果を拒否し、review、内容検証、merge admission、release、運用評価を分けて収束させる（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:31：HARNESS契約で同じ検証義務を与え、A→Bの依存を実際のbase+A+Bで具体化する。base更新・候補増減・順序変更で再計画し、OSによるoracle削除・追加、必要CI欠落、影響証明不能、契約解釈不明、別HEADの成功ではmerge可能としない
- 提案：原文「ticket、設計、実差分、統合先、依存と承認済みHARNESS契約から、統合順序・統合単位・検証実行計画を導出し、実行結果とbase変更に応じて再計画できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:31：HARNESS契約で同じ検証義務を与え、A→Bの依存を実際のbase+A+Bで具体化する。base更新・候補増減・順序変更で再計画し、OSによるoracle削除・追加、必要CI欠落、影響証明不能、契約解釈不明、別HEADの成功ではmerge可能としない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:31：HARNESS契約で同じ検証義務を与え、A→Bの依存を実際のbase+A+Bで具体化する。base更新・候補増減・順序変更で再計画し、OSによるoracle削除・追加、必要CI欠落、影響証明不能、契約解釈不明、別HEADの成功ではmerge可能としないを同revisionの対条件として具体化。B 「ticket、設計、実差分、統合先、依存と承認済みHARNESS契約から、統合順序・統合単位・検証実行計画を導出し、実行結果とbase変更に応じて再計画できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-012

- 原要求ID・原文位置・revision：`HELIXOS-L2-012`、`docs/helix-os/L2-requirements/governance-requirements.md:65`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる
- 原制約・authority：内部事例を先に照合し、不足分だけを未信頼外部情報として取得する。秘密を送信せず、取得文の命令やpatchを実行せず、closed／mergedだけで解決済みにしない（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:32：内部情報の欠落と外部情報の相違を保持し、秘密送信、取得命令実行、外部patch自動採用、closed／mergedだけの解決認定を拒否する
- 提案：原文「内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:32：内部情報の欠落と外部情報の相違を保持し、秘密送信、取得命令実行、外部patch自動採用、closed／mergedだけの解決認定を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:32：内部情報の欠落と外部情報の相違を保持し、秘密送信、取得命令実行、外部patch自動採用、closed／mergedだけの解決認定を拒否するを同revisionの対条件として具体化。B 「内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### HELIXOS-L2-013

- 原要求ID・原文位置・revision：`HELIXOS-L2-013`、`docs/helix-os/L2-requirements/governance-requirements.md:66`、`git-blob:6f0128f28255c83df497393d9f929f3fa18294a0`。
- 原文：管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる
- 原制約・authority：観測事実・AI仮説・承認・表示、未着手・観測停止・正常を区別する。管理自身も是正対象とし、自動writeせず、修正後の症状と退行を再観測する（`draft`）。
- L11対応：docs/helix-os/L11-acceptance/governance-acceptance.md:33：同じ仕事について上流からの欠落と失敗からの原因候補を突合し、管理自身を含む是正ticket、再検証、再観測へ辿る。未着手や観測停止を正常と表示しない
- 提案：原文「管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる」と原制約を保ち、HELIX-OS／HELIX-LABO（HARNESS内 非該当）の1.0候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-os/L11-acceptance/governance-acceptance.md:33：同じ仕事について上流からの欠落と失敗からの原因候補を突合し、管理自身を含む是正ticket、再検証、再観測へ辿る。未着手や観測停止を正常と表示しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-os/L11-acceptance/governance-acceptance.md:33：同じ仕事について上流からの欠落と失敗からの原因候補を突合し、管理自身を含む是正ticket、再検証、再観測へ辿る。未着手や観測停止を正常と表示しないを同revisionの対条件として具体化。B 「管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる」の意味を変更→変更前後、影響するHELIX-OS／HELIX-LABOとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-OS／HELIX-LABO`、属性 `HELIX-OS:非製品、HELIX-LABO:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `改変`。

### HELIXWEB-L2-001

- 原要求ID・原文位置・revision：`HELIXWEB-L2-001`、`docs/helix-web/L2-requirements/product-requirements.md:36`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない
- 原制約・authority：利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:20：選択した環境と別環境を区別し、対象不明・未接続を操作成功と表示しない。対象projectの進行・状態・成果をダッシュボードで辿れる
- 提案：原文「利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:20：選択した環境と別環境を区別し、対象不明・未接続を操作成功と表示しない。対象projectの進行・状態・成果をダッシュボードで辿れる。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:20：選択した環境と別環境を区別し、対象不明・未接続を操作成功と表示しない。対象projectの進行・状態・成果をダッシュボードで辿れるを同revisionの対条件として具体化。B 「利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEB-L2-002

- 原要求ID・原文位置・revision：`HELIXWEB-L2-002`、`docs/helix-web/L2-requirements/product-requirements.md:37`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない
- 原制約・authority：必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:21：選択構成・依存・版と導入結果を照合し、未適格な構成や更新失敗を利用可能と表示しない
- 提案：原文「必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない」と原制約を保ち、HELIX-Web／HELIX-CONNECT（HARNESS内 非該当）の1.x候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:21：選択構成・依存・版と導入結果を照合し、未適格な構成や更新失敗を利用可能と表示しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:21：選択構成・依存・版と導入結果を照合し、未適格な構成や更新失敗を利用可能と表示しないを同revisionの対条件として具体化。B 「必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない」の意味を変更→変更前後、影響するHELIX-Web／HELIX-CONNECTとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-Web／HELIX-CONNECT`、属性 `HELIX-Web:製品、HELIX-CONNECT:共通部品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `改変`。

### HELIXWEB-L2-003

- 原要求ID・原文位置・revision：`HELIXWEB-L2-003`、`docs/helix-web/L2-requirements/product-requirements.md:38`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない
- 原制約・authority：長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:22：切断中・取消待ち・結果不明を成功と区別し、復帰後に同じjobと結果へ辿る。二重実行を拒否する
- 提案：原文「長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:22：切断中・取消待ち・結果不明を成功と区別し、復帰後に同じjobと結果へ辿る。二重実行を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:22：切断中・取消待ち・結果不明を成功と区別し、復帰後に同じjobと結果へ辿る。二重実行を拒否するを同revisionの対条件として具体化。B 「長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEB-L2-004

- 原要求ID・原文位置・revision：`HELIXWEB-L2-004`、`docs/helix-web/L2-requirements/product-requirements.md:39`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない
- 原制約・authority：対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:23：未対応経路・返送対象外の情報を与え、対応済み表示や無断転送が起きない。実方式の採用前に根拠と適用範囲を確認する
- 提案：原文「対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:23：未対応経路・返送対象外の情報を与え、対応済み表示や無断転送が起きない。実方式の採用前に根拠と適用範囲を確認する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:23：未対応経路・返送対象外の情報を与え、対応済み表示や無断転送が起きない。実方式の採用前に根拠と適用範囲を確認するを同revisionの対条件として具体化。B 「対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEB-L2-005

- 原要求ID・原文位置・revision：`HELIXWEB-L2-005`、`docs/helix-web/L2-requirements/product-requirements.md:40`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる
- 原制約・authority：何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:24：診断・更新・復旧と案内付き改修を操作別に評価し、要求差分・影響・プレビュー・回復結果へ辿る。一操作の成功を全改修対応と表示しない
- 提案：原文「何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:24：診断・更新・復旧と案内付き改修を操作別に評価し、要求差分・影響・プレビュー・回復結果へ辿る。一操作の成功を全改修対応と表示しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:24：診断・更新・復旧と案内付き改修を操作別に評価し、要求差分・影響・プレビュー・回復結果へ辿る。一操作の成功を全改修対応と表示しないを同revisionの対条件として具体化。B 「何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEB-L2-006

- 原要求ID・原文位置・revision：`HELIXWEB-L2-006`、`docs/helix-web/L2-requirements/product-requirements.md:41`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：適用範囲・版・評価証拠を確認したHDAを開発補助に利用できる。学習と分散推論の提供責務を分け、応答を独立検収済みとみなさない
- 原制約・authority：適用範囲・版・評価証拠を確認したHDAを開発補助に利用できる。学習と分散推論の提供責務を分け、応答を独立検収済みとみなさない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:25：モデル版・適用範囲・根拠・不確実性を確認し、不適格モデルや未検証応答を検収済み成果として採用しない
- 提案：原文のモデル利用価値を、3.0 WebのHDA提供、Intelligenceの知識・モデル改善、LABOの独立評価、Web-OSのservice運転の単体・接続要求に分ける。
- 理由：旧Web単体の記載から機構分担を変え、モデルの出典・適格性・不確実性というL11条件を各接続で保つ必要がある。1.x Web提供の完成条件へ3.0 HDAを入れない。
- 選択肢と影響：A この4機構の分割と3.0版を選ぶ→原L11の全条件を接続受入で検証。B 旧Web単体のまま選ぶ→Conceptの機構境界変更が必要。C 保留→旧draftを維持し、HDAの提供を確定しない。
- 推奨：A。モデル版・適用範囲・根拠・不確実性のnegative caseを残す。
- 対応印：機構 `HELIX-Web／HELIX-Intelligence／HELIX-LABO／HELIX-Web-OS`、属性 `HELIX-Web:製品、HELIX-Intelligence:非製品、HELIX-LABO:非製品、HELIX-Web-OS:非製品`、HARNESS内 `非該当`、版 `3.0`、判定候補 `未特定`。

### HELIXWEB-L2-007

- 原要求ID・原文位置・revision：`HELIXWEB-L2-007`、`docs/helix-web/L2-requirements/product-requirements.md:42`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない
- 原制約・authority：Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:26：Web版と構成版が異なるケースで実構成へ辿り、同一版番号だけを互換性・接続成功の証拠にしない
- 提案：原文「Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:26：Web版と構成版が異なるケースで実構成へ辿り、同一版番号だけを互換性・接続成功の証拠にしない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:26：Web版と構成版が異なるケースで実構成へ辿り、同一版番号だけを互換性・接続成功の証拠にしないを同revisionの対条件として具体化。B 「Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEB-L2-008

- 原要求ID・原文位置・revision：`HELIXWEB-L2-008`、`docs/helix-web/L2-requirements/product-requirements.md:43`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない
- 原制約・authority：Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:27：project内利用、Web-OSからHELIX-OSへの運用log export、事業改善、横断知識化、モデル学習を区別し、範囲外の共有を拒否する。改善候補の採否をWeb固有の要求変更と混同しない
- 提案：原文「Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:27：project内利用、Web-OSからHELIX-OSへの運用log export、事業改善、横断知識化、モデル学習を区別し、範囲外の共有を拒否する。改善候補の採否をWeb固有の要求変更と混同しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:27：project内利用、Web-OSからHELIX-OSへの運用log export、事業改善、横断知識化、モデル学習を区別し、範囲外の共有を拒否する。改善候補の採否をWeb固有の要求変更と混同しないを同revisionの対条件として具体化。B 「Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEB-L2-009

- 原要求ID・原文位置・revision：`HELIXWEB-L2-009`、`docs/helix-web/L2-requirements/product-requirements.md:44`、`git-blob:9bb0009b49bc5d5bacd01fe5b6d8acad5bce3ce9`。
- 原文：複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない
- 原制約・authority：複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない（`draft`）。
- L11対応：docs/helix-web/L11-acceptance/product-acceptance.md:28：複数プロダクトの開発検証またはHELIX自身への適用証拠を欠くHARNESS Version 1ではWeb展開を拒否する。全証拠が揃えば展開可能と判定し、それをWeb完成・公開済みと読み替えない
- 提案：原文「複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない」と原制約を保ち、HELIX-Web（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web/L11-acceptance/product-acceptance.md:28：複数プロダクトの開発検証またはHELIX自身への適用証拠を欠くHARNESS Version 1ではWeb展開を拒否する。全証拠が揃えば展開可能と判定し、それをWeb完成・公開済みと読み替えない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web/L11-acceptance/product-acceptance.md:28：複数プロダクトの開発検証またはHELIX自身への適用証拠を欠くHARNESS Version 1ではWeb展開を拒否する。全証拠が揃えば展開可能と判定し、それをWeb完成・公開済みと読み替えないを同revisionの対条件として具体化。B 「複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない」の意味を変更→変更前後、影響するHELIX-WebとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web`、属性 `HELIX-Web:製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEBOS-L2-001

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-001`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:28`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：tenant・利用者・project・environmentごとにauthority、resource、state、evidenceを隔離できる
- 原制約・authority：一利用者の資格・job・data・結果が別scopeへ流れず、HELIX-OS内部stateをservice authorityとして共有しない（`draft`）。
- L11対応：docs/helix-web-os/L11-acceptance/service-acceptance.md:17：異なるtenant・利用者・projectへ同じ識別子やdataを与え、scope越境とHELIX-OS内部stateのservice利用を拒否する
- 提案：原文「tenant・利用者・project・environmentごとにauthority、resource、state、evidenceを隔離できる」と原制約を保ち、HELIX-Web-OS（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web-os/L11-acceptance/service-acceptance.md:17：異なるtenant・利用者・projectへ同じ識別子やdataを与え、scope越境とHELIX-OS内部stateのservice利用を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web-os/L11-acceptance/service-acceptance.md:17：異なるtenant・利用者・projectへ同じ識別子やdataを与え、scope越境とHELIX-OS内部stateのservice利用を拒否するを同revisionの対条件として具体化。B 「tenant・利用者・project・environmentごとにauthority、resource、state、evidenceを隔離できる」の意味を変更→変更前後、影響するHELIX-Web-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web-OS`、属性 `HELIX-Web-OS:非製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEBOS-L2-002

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-002`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:29`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：適格なHARNESS能力をConnectorへ導入・更新・撤去し、Web版・Connector版・能力版・接続契約を追跡できる
- 原制約・authority：Connectorに開発engineを重複実装せず、不適格版や更新失敗を利用可能と表示しない（`draft`）。
- L11対応：docs/helix-web-os/L11-acceptance/service-acceptance.md:18：Web・Connector・HARNESS能力の版を不一致にし、不適格構成の起動、暗黙更新、engine重複を拒否する
- 提案：原文「適格なHARNESS能力をConnectorへ導入・更新・撤去し、Web版・Connector版・能力版・接続契約を追跡できる」と原制約を保ち、HELIX-Web-OS／HELIX-CONNECT（HARNESS内 非該当）の1.x候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-web-os/L11-acceptance/service-acceptance.md:18：Web・Connector・HARNESS能力の版を不一致にし、不適格構成の起動、暗黙更新、engine重複を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web-os/L11-acceptance/service-acceptance.md:18：Web・Connector・HARNESS能力の版を不一致にし、不適格構成の起動、暗黙更新、engine重複を拒否するを同revisionの対条件として具体化。B 「適格なHARNESS能力をConnectorへ導入・更新・撤去し、Web版・Connector版・能力版・接続契約を追跡できる」の意味を変更→変更前後、影響するHELIX-Web-OS／HELIX-CONNECTとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-Web-OS／HELIX-CONNECT`、属性 `HELIX-Web-OS:非製品、HELIX-CONNECT:共通部品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `改変`。

### HELIXWEBOS-L2-003

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-003`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:30`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：長時間jobの受付、配信、進行、切断、取消、再開、終端、結果不明を同じjob identityで管理できる
- 原制約・authority：再送・障害・再接続で副作用を二重実行せず、期限・予算・許可・未完義務を失わない（`draft`）。
- L11対応：docs/helix-web-os/L11-acceptance/service-acceptance.md:19：切断、再送、取消競合、timeout、結果不明、再起動を与え、二重副作用なしで同じjobと未完義務へ戻る
- 提案：原文「長時間jobの受付、配信、進行、切断、取消、再開、終端、結果不明を同じjob identityで管理できる」と原制約を保ち、HELIX-Web-OS（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web-os/L11-acceptance/service-acceptance.md:19：切断、再送、取消競合、timeout、結果不明、再起動を与え、二重副作用なしで同じjobと未完義務へ戻る。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web-os/L11-acceptance/service-acceptance.md:19：切断、再送、取消競合、timeout、結果不明、再起動を与え、二重副作用なしで同じjobと未完義務へ戻るを同revisionの対条件として具体化。B 「長時間jobの受付、配信、進行、切断、取消、再開、終端、結果不明を同じjob identityで管理できる」の意味を変更→変更前後、影響するHELIX-Web-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web-OS`、属性 `HELIX-Web-OS:非製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEBOS-L2-004

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-004`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:31`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：認証、provider経路、credential利用、network／data scope、利用者環境から返送する情報を操作ごとに制御できる
- 原制約・authority：未確認経路、期限切れ権限、秘密送信、範囲外data返送を拒否し、サービス利用を横断学習同意へ変換しない（`draft`）。
- L11対応：docs/helix-web-os/L11-acceptance/service-acceptance.md:20：wrong target、期限切れ、revoke、範囲外network／data、secret混入を与え、接続・返送・学習利用を拒否する
- 提案：原文「認証、provider経路、credential利用、network／data scope、利用者環境から返送する情報を操作ごとに制御できる」と原制約を保ち、HELIX-Web-OS／HELIX-Security／HELIX-CONNECT（HARNESS内 非該当）の1.x候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-web-os/L11-acceptance/service-acceptance.md:20：wrong target、期限切れ、revoke、範囲外network／data、secret混入を与え、接続・返送・学習利用を拒否する。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web-os/L11-acceptance/service-acceptance.md:20：wrong target、期限切れ、revoke、範囲外network／data、secret混入を与え、接続・返送・学習利用を拒否するを同revisionの対条件として具体化。B 「認証、provider経路、credential利用、network／data scope、利用者環境から返送する情報を操作ごとに制御できる」の意味を変更→変更前後、影響するHELIX-Web-OS／HELIX-Security／HELIX-CONNECTとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-Web-OS／HELIX-Security／HELIX-CONNECT`、属性 `HELIX-Web-OS:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `改変`。

### HELIXWEBOS-L2-005

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-005`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:32`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：jobの原eventと証拠から、HELIX-Webのダッシュボードへ進行・状態・成果・停止・再開をrevision付きで投影できる
- 原制約・authority：projection欠落・遅延・stale・conflict・結果不明を成功表示せず、画面表示を実行事実や受入の正本にしない（`draft`）。
- L11対応：docs/helix-web-os/L11-acceptance/service-acceptance.md:21：event欠落、projection遅延、stale revision、conflictを与え、ダッシュボードが成功・受入済みへ補完しない
- 提案：原文「jobの原eventと証拠から、HELIX-Webのダッシュボードへ進行・状態・成果・停止・再開をrevision付きで投影できる」と原制約を保ち、HELIX-Web-OS（HARNESS内 非該当）の1.x候補へ置く。既存L2の対象を維持し、Conceptの属性・導入版を明示する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。対象L2／L11はdraft。対象revisionの合意未了。 対応受入 docs/helix-web-os/L11-acceptance/service-acceptance.md:21：event欠落、projection遅延、stale revision、conflictを与え、ダッシュボードが成功・受入済みへ補完しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web-os/L11-acceptance/service-acceptance.md:21：event欠落、projection遅延、stale revision、conflictを与え、ダッシュボードが成功・受入済みへ補完しないを同revisionの対条件として具体化。B 「jobの原eventと証拠から、HELIX-Webのダッシュボードへ進行・状態・成果・停止・再開をrevision付きで投影できる」の意味を変更→変更前後、影響するHELIX-Web-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-Web-OS`、属性 `HELIX-Web-OS:非製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `維持`。

### HELIXWEBOS-L2-006

- 原要求ID・原文位置・revision：`HELIXWEBOS-L2-006`、`docs/helix-web-os/L2-requirements/service-governance-requirements.md:33`、`git-blob:8c0fcb438d9a8ea81480d2f8342b192d99670d1a`。
- 原文：service release、deployment、monitoring、incident、backup、restore、rollback、maintenanceを対象版と証拠へ束縛し、許可されたservice log・telemetry・利用結果をHELIX-OSの改善入口へ渡せる
- 原制約・authority：exportごとに出典、tenant／data scope、目的、同意、revision、時点、欠測、保持条件を示す。配備成功、復旧成功、恒久修復、Web利用者受入を分け、運用結果からHARNESS・Web・OS要求を直接変更しない（`draft`）。
- L11対応：docs/helix-web-os/L11-acceptance/service-acceptance.md:22：deployment、monitoring、rollback、restore、恒久修復、利用者受入を個別に失敗させ、一つの成功で残りを完了にしない。許可logだけがscope・目的・同意・revision付きでHELIX-OSへ届き、credential、tenant原data、同意範囲外logを拒否する。改善proposalが各対象要求を直接変更しない
- 提案：原文「service release、deployment、monitoring、incident、backup、restore、rollback、maintenanceを対象版と証拠へ束縛し、許可されたservice log・telemetry・利用結果をHELIX-OSの改善入口へ渡せる」と原制約を保ち、HELIX-Web-OS／HELIX-LABO／HELIX-OS（HARNESS内 非該当）の1.x候補へ置く。現行Conceptの責務へ分割・接続する候補。意味変更の有無は別列で扱う。
- 理由：source authority draft。現行Conceptとの責務分割・L11の対応を対象revisionで確認。 対応受入 docs/helix-web-os/L11-acceptance/service-acceptance.md:22：deployment、monitoring、rollback、restore、恒久修復、利用者受入を個別に失敗させ、一つの成功で残りを完了にしない。許可logだけがscope・目的・同意・revision付きでHELIX-OSへ届き、credential、tenant原data、同意範囲外logを拒否する。改善proposalが各対象要求を直接変更しない。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→docs/helix-web-os/L11-acceptance/service-acceptance.md:22：deployment、monitoring、rollback、restore、恒久修復、利用者受入を個別に失敗させ、一つの成功で残りを完了にしない。許可logだけがscope・目的・同意・revision付きでHELIX-OSへ届き、credential、tenant原data、同意範囲外logを拒否する。改善proposalが各対象要求を直接変更しないを同revisionの対条件として具体化。B 「service release、deployment、monitoring、incident、backup、restore、rollback、maintenanceを対象版と証拠へ束縛し、許可されたservice log・telemetry・利用結果をHELIX-OSの改善入口へ渡せる」の意味を変更→変更前後、影響するHELIX-Web-OS／HELIX-LABO／HELIX-OSとL11をdecisionへ明記。C 保留→原状態 draftを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。原文の制約と受入を分割後の各接続に残す。
- 対応印：機構 `HELIX-Web-OS／HELIX-LABO／HELIX-OS`、属性 `HELIX-Web-OS:非製品、HELIX-LABO:非製品、HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.x`、判定候補 `改変`。

### HIL-BR-03

- 原要求ID・原文位置・revision：`HIL-BR-03`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:55`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Claude CodeはCodex完了時にraw実行ログ、PR、test/CI、監査所見を圧縮し、永続知識だけをharness memoryへ昇格する。進捗はDB continuationへ残しmemoryへ混載しない。
- 原制約・authority：IRのacceptance_ids=HAC-HIL-07a,HAC-HIL-07b,HAC-HIL-07c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：完了時のraw log・PR・CI・監査所見はOSのepisode証拠として保持し、memoryには有期限の通知・再検索キーだけを置く。永続知識の選別・改善は3.0 Intelligenceの別要求候補とする。
- 理由：旧原文は完了時に「永続知識だけをharness memoryへ昇格」と固定する。現行HMCの通知境界と3.0の知識改善を採ると、昇格先と時点が変わる。
- 選択肢と影響：A 旧memory永続昇格を維持→HMCの有期限通知境界とのconflictを残す。B memoryを通知・検索キーに限り、永続知識選別を3.0へ送る→旧昇格条件の意味変更を対象revisionで承認し、証拠保全L11と知識改善L11を分ける。C 保留→旧IRの昇格を現行完了条件にしない。
- 推奨：B。raw証拠の保持先と通知失効後の再検索をL11で確認する。
- 対応印：機構 `HELIX-OS／HELIX-LABO／HELIX-Intelligence`、属性 `HELIX-OS:非製品、HELIX-LABO:非製品、HELIX-Intelligence:非製品`、HARNESS内 `非該当`、版 `1.0記録土台／3.0候補（知識・モデル改善）`、判定候補 `未特定`。

### HIL-BR-16

- 原要求ID・原文位置・revision：`HIL-BR-16`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-16 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:68`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：検証をslice統合前のimpact CI、candidate固定後のfull CI、GitHub PR上の外部CIの3段に固定し、各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない。style内統合によるSHA変更はpredecessor bindingで追跡する。
- 原制約・authority：IRのacceptance_ids=HAC-HIL-06a,HAC-HIL-06b,HAC-HIL-06c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：検証段階ごとにSHA/tree・前段receipt・必須checkを結ぶ意味を保持し、三段の固定数とGitHub外部CIの必須化を構成候補へ下ろす。
- 理由：旧原文は三段と順序を固定する。ConceptはCI・testの選定と最適化をOS検収に置くが段数を定めない。
- 選択肢と影響：A 旧三段固定を維持→1.0の全作業で外部CIまで必須。B 段数・段名を対象riskと検証契約に委ねる→旧固定段数の意味変更を対象revisionで承認し、lineageと欠落検出をL11に残す。C 保留→旧三段を現行1.0の完了条件にしない。
- 推奨：B。lineage不一致を拒否する負例を維持する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品`、HARNESS内 `枠`、版 `1.0候補（CI証拠lineage。旧三段固定の採否はPO未決）`、判定候補 `未特定`。

### HIL-FR-01

- 原要求ID・原文位置・revision：`HIL-FR-01`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:91`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：`InfinityLoopEvent`を受理し、`intake→reverse→redesign?→pair-freeze→implementation→local-prejoin-ci→forward-join→internal-postjoin-ci→github-pr→external-ci→audit→merge/issue`を状態遷移する。各段は入力commit/tree digestと前段receiptへbindする。 | append-only event、現在state、parent/cause ID
- 原制約・authority：IRのacceptance_ids=HAC-HIL-02a,HAC-HIL-02b,HAC-HIL-02c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：event受理から検収までの状態・証拠を保持し、Reverse段階は適用条件が成立した仕事だけに要求する候補へ分ける。
- 理由：旧event列はintake後のreverseを一律遷移とする。現行の条件付きReverseでは適用範囲が変わる。
- 選択肢と影響：A 全eventにReverseを維持→条件付き適用とのconflictを残す。B Reverse適用条件と非適用receiptを明示→旧一律遷移の意味変更を対象revisionで承認し、適用時のR0–R4受入を保持。C 保留→旧event列で実行完了を判定しない。
- 推奨：B。条件外の仕事と適用後のstage欠落を別の負例にする。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0候補（旧IRの現行採択・完成条件ではない）`、判定候補 `未特定`。

### HIL-FR-04

- 原要求ID・原文位置・revision：`HIL-FR-04`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:94`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Universal Reverse Gateは全IssueのR0–R4を順序実行し、各phaseのobligation集合、input/output digest、stage固有schema、source coverage、R4 routing、双方向参照を検査する。R1を含むphase skipは認めず、該当契約なしも探索証拠付き結論として記録する。 | pass/fail receipt＋不足/空洞化code
- 原制約・authority：IRのacceptance_ids=HAC-HIL-04a,HAC-HIL-04b,HAC-HIL-04c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：Reverse適用時のR0–R4順序、obligation、digest、coverageを保持し、全Issue一律のGate条件を条件付き適用へ変更する候補。
- 理由：旧原文の「全Issue」は現行の条件付きReverseと衝突する。stage証拠は保持できるが必須母集団が変わる。
- 選択肢と影響：A 全Issue一律を維持→現行BR-04とのconflictを残す。B 適用条件をL2で定め、該当IssueのR0–R4を必須にする→母集団変更を対象revisionで承認し、非適用receiptをL11へ追加。C 保留→全Issueの完了判定に使わない。
- 推奨：B。budget不足時に義務を消さない条件も残す。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `未特定（全IssueのReverse必須化はBR-04の条件付き適用と衝突）`、判定候補 `未特定`。

### HIL-FR-10

- 原要求ID・原文位置・revision：`HIL-FR-10`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:100`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Memory CompactorはIssue admission時の問題・判断要約とCodex completion時の永続知識を別event種別で圧縮し、promote/supersede/no-promotionを記録する。進捗/raw logはmemoryへ複製しない。 | issue-summary、compressed memoryまたはno-promotion receipt
- 原制約・authority：IRのacceptance_ids=HAC-HIL-07a,HAC-HIL-07b,HAC-HIL-07c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：問題・判断要約と完了時の知見候補を別eventとして記録し、memoryには有期限通知だけを置く。永続知識の選別は3.0へ分ける。
- 理由：旧Memory Compactorはpromote/supersede/no-promotionで永続知識をmemoryに昇格する。現行HMC通知境界ではpromote先と失効条件が変わる。
- 選択肢と影響：A 旧memory昇格を維持→HMCとのconflictを残す。B memoryは通知、知識改善は3.0 Intelligenceへ分ける→旧promote条件の意味変更を承認し、要約・失効・知識選別のL11を別にする。C 保留→旧Compactorを現行memory完成条件へ使わない。
- 推奨：B。原記録と要約の出所を追跡できる負例を残す。
- 対応印：機構 `HELIX-OS／HELIX-LABO／HELIX-Intelligence`、属性 `HELIX-OS:非製品、HELIX-LABO:非製品、HELIX-Intelligence:非製品`、HARNESS内 `非該当`、版 `1.0記録土台／3.0候補（知識・モデル改善）`、判定候補 `未特定`。

### HIL-FR-19

- 原要求ID・原文位置・revision：`HIL-FR-19`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-19 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:109`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：画面対象のWalkthrough Loopはprototype版、ユーザー観測、発見要求deltaまたは`no_delta`、L1反映先、再作成判断を記録し、boundedに反復する。 | walkthrough receipt、requirements delta、iteration checkpoint
- 原制約・authority：IRのacceptance_ids=HAC-HIL-15a,HAC-HIL-15b,HAC-HIL-15c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：Walkthroughのprototype版、観測、delta/no_delta、再作成判断を保持し、発見した要求差分の一次反映先をL2、企画価値の差分だけL1へ還流する候補。
- 理由：旧原文は要求deltaのL1反映先を固定する。現行層ではL1は企画、L2が要求とprototype合意を持つため、要求差分の意味の置き場所が変わる。
- 選択肢と影響：A 全deltaをL1へ反映→企画と要求の混在を残す。B 要求deltaはL2、企画差分はL1へ分ける→旧反映先の意味変更を対象revisionで承認し、prototype合意のL11へ接続。C 保留→旧L1反映を現行承認扱いにしない。
- 推奨：B。no_deltaでも観測と再作成判断を残す。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `サービス①`、版 `1.0候補（旧IRの現行採択・完成条件ではない）`、判定候補 `未特定`。

### HIL-FR-20

- 原要求ID・原文位置・revision：`HIL-FR-20`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-20 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:110`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Screen Gateは画面対象ならartifact、walkthrough、要求反映、prototype agreementを検査し、画面非対象ならskip receiptのscope/digest/再entry条件を検査する。いずれも無い場合はL1 freezeとL3開始をfail-closeする。 | G2判定、agreementまたはskip receipt、不足code
- 原制約・authority：IRのacceptance_ids=HAC-HIL-15a,HAC-HIL-15b,HAC-HIL-15c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：画面対象のprototype合意と非画面対象のskip receiptを保持し、L2合意後にL3へ進む境界に置く。
- 理由：旧Screen GateはL1 freezeからL3開始を判定する。現行L1企画とL2要求/prototypeの境界を飛ばす。
- 選択肢と影響：A 旧L1 freeze境界を維持→L2合意を飛ばすconflictを残す。B L2/prototype合意をGate条件にする→旧境界の意味変更を対象revisionで承認し、画面/非画面のL11を分ける。C 保留→旧GateからL3開始を認めない。
- 推奨：B。非画面skipもscope・digest・再entry条件を要求する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品`、HARNESS内 `サービス①`、版 `1.0候補（旧IRの現行採択・完成条件ではない）`、判定候補 `未特定`。

### HIL-FR-28

- 原要求ID・原文位置・revision：`HIL-FR-28`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-28 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:118`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：Three-stage CI Orchestratorは各段の必須check、対象SHA/tree digest、結果、artifactを記録し、`local_prejoin→internal_postjoin→github_external`の単調遷移を強制する。 | stage receipt、SHA binding、next-stage可否
- 原制約・authority：IRのacceptance_ids=HAC-HIL-06a,HAC-HIL-06b,HAC-HIL-06c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：各CI段の必須check、対象SHA/tree、artifact、前段lineageを保持し、local/internal/GitHubの三段固定を検証契約の候補へ下ろす。
- 理由：旧Orchestratorは三段を順番固定する。ConceptのOS検収は検証集合の選定・最適化を担うが三段固定は規定しない。
- 選択肢と影響：A 三段固定を維持→全仕事の外部CI必須化を明記。B 段数を検証契約に従わせる→旧順序固定の意味変更を承認し、SHA/treeとlineage検査を各段のL11に残す。C 保留→旧三段を1.0完成条件にしない。
- 推奨：B。NFR-15のreceipt chainを落とさない。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0候補（CI証拠lineage。旧三段固定の採否はPO未決）`、判定候補 `未特定`。

### HIL-NFR-03

- 原要求ID・原文位置・revision：`HIL-NFR-03`、`archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:183`、`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。
- 原文：全IssueのReverse処理量を省略しない。`none/not-required/exempt`とphase skipを禁止し、budget到達は未完obligationを免除せずcheckpoint＋未完了状態へ遷移する。
- 原制約・authority：IRのacceptance_ids=HAC-HIL-04a,HAC-HIL-04b,HAC-HIL-04c（`specified_frozen`）。
- L11対応：未特定（現行4対象L11を原ID検索、直接対応なし）
- 提案：Reverse適用時の省略禁止と、budget到達時も未完義務を保持してcheckpointへ遷移する意味を残す。
- 理由：旧原文は全IssueのReverse省略とexemptを禁止する。条件付き適用を認めると必須母集団が変わる。
- 選択肢と影響：A 全Issue必須を維持→現行BR-04とのconflictを残す。B 適用条件に該当するIssueだけ省略禁止とする→旧全Issue条件の意味変更を承認し、非適用receiptとcheckpointのL11を追加。C 保留→旧一律Gateで完了を宣言しない。
- 推奨：B。適用後にbudgetを理由とする免除を許さない。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品`、HARNESS内 `枠`、版 `未特定（全IssueのReverse必須化はBR-04の条件付き適用と衝突）`、判定候補 `未特定`。

### DTK-HARNESS-001

- 原要求ID・原文位置・revision：`DTK-HARNESS-001`、`docs/governance/candidates/development-ticket-derivation-requirements.md:21`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：要求候補または合意要求から推進がtyped ticketを生成するときに、解消すべき不確実性、次の成果、ticket identityを区別するcontractを定める
- 原制約・authority：HARNESS自身がticketを生成せず、要求本文、Issue、実装作業を同じidentityにしない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「要求候補または合意要求から推進がtyped ticketを生成するときに、解消すべき不確実性、次の成果、ticket identityを区別するcontractを定める」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「要求候補または合意要求から推進がtyped ticketを生成するときに、解消すべき不確実性、次の成果、ticket identityを区別するcontractを定める」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-HARNESS-002

- 原要求ID・原文位置・revision：`DTK-HARNESS-002`、`docs/governance/candidates/development-ticket-derivation-requirements.md:22`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：`poc` ticketは技術・成立性仮説、対象要求、timebox、許可scope、入力、判定基準、expected evidence、終了条件、backflow先を持つ
- 原制約・authority：PoC成功をproduction要求採用・製品完成・恒久技術選定へ自動昇格しない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「`poc` ticketは技術・成立性仮説、対象要求、timebox、許可scope、入力、判定基準、expected evidence、終了条件、backflow先を持つ」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「`poc` ticketは技術・成立性仮説、対象要求、timebox、許可scope、入力、判定基準、expected evidence、終了条件、backflow先を持つ」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-HARNESS-003

- 原要求ID・原文位置・revision：`DTK-HARNESS-003`、`docs/governance/candidates/development-ticket-derivation-requirements.md:23`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：`ui_prototype` ticketは対象要求・actor・task・surface、prototype revision、確認する操作・状態・failure、利用者反応、合意／未解決、backflow先を持つ
- 原制約・authority：画像作成、画面表示、AI評価だけで要求合意にしない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「`ui_prototype` ticketは対象要求・actor・task・surface、prototype revision、確認する操作・状態・failure、利用者反応、合意／未解決、backflow先を持つ」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「`ui_prototype` ticketは対象要求・actor・task・surface、prototype revision、確認する操作・状態・failure、利用者反応、合意／未解決、backflow先を持つ」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-HARNESS-004

- 原要求ID・原文位置・revision：`DTK-HARNESS-004`、`docs/governance/candidates/development-ticket-derivation-requirements.md:24`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：`feature` ticketは採用済み親要求、対象kind、設計義務、pair、acceptance、scope、依存、許可、停止、証拠を持つ
- 原制約・authority：未承認要求やPoC仮説をproduction実装へ降ろさない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「`feature` ticketは採用済み親要求、対象kind、設計義務、pair、acceptance、scope、依存、許可、停止、証拠を持つ」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「`feature` ticketは採用済み親要求、対象kind、設計義務、pair、acceptance、scope、依存、許可、停止、証拠を持つ」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-HARNESS-005

- 原要求ID・原文位置・revision：`DTK-HARNESS-005`、`docs/governance/candidates/development-ticket-derivation-requirements.md:25`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：ticket結果を要求エンジンへ戻し、要求候補の訂正・採否、追加質問、設計template再選定、stale範囲を提示する
- 原制約・authority：ticket closeやartifact存在から要求意味・合意・受入を逆生成しない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「ticket結果を要求エンジンへ戻し、要求候補の訂正・採否、追加質問、設計template再選定、stale範囲を提示する」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「ticket結果を要求エンジンへ戻し、要求候補の訂正・採否、追加質問、設計template再選定、stale範囲を提示する」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-HARNESS-006

- 原要求ID・原文位置・revision：`DTK-HARNESS-006`、`docs/governance/candidates/development-ticket-derivation-requirements.md:26`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：技術選定は承認済み要求と新世代architecture責務から導き、PoCで適合性、risk、運用、移行、rollbackを比較する
- 原制約・authority：旧実装言語・framework・runtimeを思想の保持と混同しない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「技術選定は承認済み要求と新世代architecture責務から導き、PoCで適合性、risk、運用、移行、rollbackを比較する」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「技術選定は承認済み要求と新世代architecture責務から導き、PoCで適合性、risk、運用、移行、rollbackを比較する」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-HARNESS-007

- 原要求ID・原文位置・revision：`DTK-HARNESS-007`、`docs/governance/candidates/development-ticket-derivation-requirements.md:27`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：推進側が生成するworkflowを検証できるよう、対象要求とHARNESS版に必要なlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowの充足contractを提供する
- 原制約・authority：HARNESSがticket tagや個別workflowを生成せず、推進方式が変わっても落としてはならない工程義務を確認できる（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「推進側が生成するworkflowを検証できるよう、対象要求とHARNESS版に必要なlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowの充足contractを提供する」と原制約を保ち、HELIX-HARNESS（HARNESS内 部品：要求エンジン／枠）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「推進側が生成するworkflowを検証できるよう、対象要求とHARNESS版に必要なlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowの充足contractを提供する」の意味を変更→変更前後、影響するHELIX-HARNESSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-HARNESS`、属性 `HELIX-HARNESS:製品`、HARNESS内 `部品：要求エンジン／枠`、版 `1.0`、判定候補 `維持`。

### DTK-OS-001

- 原要求ID・原文位置・revision：`DTK-OS-001`、`docs/governance/candidates/development-ticket-derivation-requirements.md:33`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：管理は目的、親要求revision、優先度、制約、許可、予算、期限、適用HARNESS版を推進へ渡し、推進が生成したlocal ticketとworkflowを登録・統制する
- 原制約・authority：管理が作業分解や駆動tagを先決めせず、登録を要求採用・実行許可・完了にしない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「管理は目的、親要求revision、優先度、制約、許可、予算、期限、適用HARNESS版を推進へ渡し、推進が生成したlocal ticketとworkflowを登録・統制する」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「管理は目的、親要求revision、優先度、制約、許可、予算、期限、適用HARNESS版を推進へ渡し、推進が生成したlocal ticketとworkflowを登録・統制する」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### DTK-OS-002

- 原要求ID・原文位置・revision：`DTK-OS-002`、`docs/governance/candidates/development-ticket-derivation-requirements.md:34`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：local ticketをGitHub Issue等へprojectionし、remote番号・状態・commentを原ticketへ関連付ける
- 原制約・authority：Issue本文・label・closeから親要求、承認、完了を補完しない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「local ticketをGitHub Issue等へprojectionし、remote番号・状態・commentを原ticketへ関連付ける」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「local ticketをGitHub Issue等へprojectionし、remote番号・状態・commentを原ticketへ関連付ける」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### DTK-OS-003

- 原要求ID・原文位置・revision：`DTK-OS-003`、`docs/governance/candidates/development-ticket-derivation-requirements.md:35`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：PoC／prototype／featureの実行・成果・反応・finding・期限切れ・取消を別stateで管理し、正しい要求・template・設計へbackflowする
- 原制約・authority：PoC成功やprototype合意を無関係なfeatureへ伝播しない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「PoC／prototype／featureの実行・成果・反応・finding・期限切れ・取消を別stateで管理し、正しい要求・template・設計へbackflowする」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「PoC／prototype／featureの実行・成果・反応・finding・期限切れ・取消を別stateで管理し、正しい要求・template・設計へbackflowする」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### DTK-OS-004

- 原要求ID・原文位置・revision：`DTK-OS-004`、`docs/governance/candidates/development-ticket-derivation-requirements.md:36`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：architectureで分けたsemantic／transactional責務ごとに技術候補、評価条件、PoC結果、採否、失効を管理する
- 原制約・authority：人気、旧採用、単一benchmarkだけで技術を固定しない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「architectureで分けたsemantic／transactional責務ごとに技術候補、評価条件、PoC結果、採否、失効を管理する」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「architectureで分けたsemantic／transactional責務ごとに技術候補、評価条件、PoC結果、採否、失効を管理する」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### DTK-OS-005

- 原要求ID・原文位置・revision：`DTK-OS-005`、`docs/governance/candidates/development-ticket-derivation-requirements.md:37`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：推進は管理から受けた目的・要求・制約とHARNESS contractを解釈し、triggerに合うHARNESS routeを選び、operational tag、versioned mapping、composition、workflow instance生成規則でPoC／UI prototype／Feature ticketとworkflowを生成する
- 原制約・authority：管理指示を一枚の作業へ丸めず、同じ入力・HARNESS版・生成規則から同じticket graphとworkflow digestを得る（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「推進は管理から受けた目的・要求・制約とHARNESS contractを解釈し、triggerに合うHARNESS routeを選び、operational tag、versioned mapping、composition、workflow instance生成規則でPoC／UI prototype／Feature ticketとworkflowを生成する」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「推進は管理から受けた目的・要求・制約とHARNESS contractを解釈し、triggerに合うHARNESS routeを選び、operational tag、versioned mapping、composition、workflow instance生成規則でPoC／UI prototype／Feature ticketとworkflowを生成する」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### DTK-OS-006

- 原要求ID・原文位置・revision：`DTK-OS-006`、`docs/governance/candidates/development-ticket-derivation-requirements.md:38`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：operational tag、HARNESS normative vocabularyへのmapping、composition、workflow instance生成規則を推進がversion管理し、開発style、work kind、変更種別、risk、surfaceを必要に応じて合成する
- 原制約・authority：HARNESSが所有する語彙の意味・trigger・route内順序を再定義せず、旧9-modeや`signal → mode`を単一enumとして再導入せず、PoCとScrum等の異なる軸を排他的にしない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「operational tag、HARNESS normative vocabularyへのmapping、composition、workflow instance生成規則を推進がversion管理し、開発style、work kind、変更種別、risk、surfaceを必要に応じて合成する」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「operational tag、HARNESS normative vocabularyへのmapping、composition、workflow instance生成規則を推進がversion管理し、開発style、work kind、変更種別、risk、surfaceを必要に応じて合成する」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### DTK-OS-007

- 原要求ID・原文位置・revision：`DTK-OS-007`、`docs/governance/candidates/development-ticket-derivation-requirements.md:39`、`git-blob:f047f74234fc802d7d1022a162e5877090a61500`。
- 原文：検収は推進が生成したticket graphとworkflowを承認済みHARNESS contract、親要求、依存、許可に照らして独立確認し、不足を推進または上流へ戻す
- 原制約・authority：推進の自己申告、tag、Issue作成だけでworkflowを適格としない（`draft_candidate`）。
- L11対応：未特定（4対象L11をDTK ID検索、直接対応なし）
- 提案：原文「検収は推進が生成したticket graphとworkflowを承認済みHARNESS contract、親要求、依存、許可に照らして独立確認し、不足を推進または上流へ戻す」と原制約を保ち、HELIX-OS（HARNESS内 非該当）の1.0候補へ置く。HARNESSはticket契約、OS推進はticket生成、OS管理は登録、OS検収は独立確認へ分ける候補。
- 理由：source authority draft_candidate。candidateの採否とL11対受入が未決。 対応受入 未特定（4対象L11をDTK ID検索、直接対応なし）。
- 選択肢と影響：A 原文と制約を保持してこの機構・版で対象revisionを合意→未特定（4対象L11をDTK ID検索、直接対応なし）を同revisionの対条件として具体化。B 「検収は推進が生成したticket graphとworkflowを承認済みHARNESS contract、親要求、依存、許可に照らして独立確認し、不足を推進または上流へ戻す」の意味を変更→変更前後、影響するHELIX-OSとL11をdecisionへ明記。C 保留→原状態 draft_candidateを維持し、対象L2/L11の承認を生成しない。
- 推奨：Aを審査候補とする。単体の原制約とL11受入を同revisionで確認する。
- 対応印：機構 `HELIX-OS`、属性 `HELIX-OS:非製品`、HARNESS内 `非該当`、版 `1.0`、判定候補 `維持`。

### L1-COV-G1-SYSTEM-DRIVEN-AUTONOMY

- 原要求ID・原文位置・revision：`L1-COV-G1-SYSTEM-DRIVEN-AUTONOMY`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:52`、`git-blob:9d9c17b4884375f5bfee04c2988c8d42aa4caf6d`。
- 原文：| `L1-COV-G1-SYSTEM-DRIVEN-AUTONOMY` | 承認済み上流から進行、停止、差戻し、再開、完了を判断できる工程・検証契約 | system stateとwork graphから次のactionable workを導き、Workerへ割り当て、要求・承認・権限を自己生成せず継続する管理・推進・検収 | 製品固有の目的、制約、許可、停止条件、利用者判断を提供する責務 |
- 原制約・authority：監査work unitであり要求ID・採択済みscopeではない（`coverage_audit_only`）。
- L11対応：未特定（監査work unitに直接L11 IDなし）
- 提案：監査work unitの未被覆価値を現行ConceptのL1差分候補として扱う。対応機構 HELIX-HARNESS／HELIX-OS、版 1.0土台／1.x Web（該当時）。
- 理由：対象L1の意味変更と受入の採否待ち。 旧L1のexact承認revisionから意味が増えるため、L1変更にはPO判断が要る。
- 選択肢と影響：A この未被覆価値を対象L1改訂へ含める→該当サービス・OS/LABO/BRAINの受入を別起草。B 既存L1に完全被覆があると判断→原文とL11の対応を示して追加を避ける。C 保留→監査unitを要求IDにせず保持。
- 推奨：Aを審査候補とする。既存L1との重複をID・原文単位で照合する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品`、HARNESS内 `枠／コア候補（未確定）`、版 `1.0土台／1.x Web（該当時）`、判定候補 `追加`。

### L1-COV-G3-SIMULATION

- 原要求ID・原文位置・revision：`L1-COV-G3-SIMULATION`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:53`、`git-blob:9d9c17b4884375f5bfee04c2988c8d42aa4caf6d`。
- 原文：| `L1-COV-G3-SIMULATION` | simulation入力・relation・不確実性・反証・検証義務の開発契約 | simulationの実行、revision付き記録、実測差、再計画、改善候補化 | 製品固有の価値、制約、運用条件を入力として提供する責務 |
- 原制約・authority：監査work unitであり要求ID・採択済みscopeではない（`coverage_audit_only`）。
- L11対応：未特定（監査work unitに直接L11 IDなし）
- 提案：監査work unitの未被覆価値を現行ConceptのL1差分候補として扱う。対応機構 HELIX-HARNESS／HELIX-BRAIN／HELIX-LABO／HELIX-OS、版 1.0土台／1.x Web（該当時）。
- 理由：対象L1の意味変更と受入の採否待ち。 旧L1のexact承認revisionから意味が増えるため、L1変更にはPO判断が要る。
- 選択肢と影響：A この未被覆価値を対象L1改訂へ含める→該当サービス・OS/LABO/BRAINの受入を別起草。B 既存L1に完全被覆があると判断→原文とL11の対応を示して追加を避ける。C 保留→監査unitを要求IDにせず保持。
- 推奨：Aを審査候補とする。既存L1との重複をID・原文単位で照合する。
- 対応印：機構 `HELIX-HARNESS／HELIX-BRAIN／HELIX-LABO／HELIX-OS`、属性 `HELIX-HARNESS:製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-OS:非製品`、HARNESS内 `枠／コア候補（未確定）`、版 `1.0土台／1.x Web（該当時）`、判定候補 `追加`。

### L1-COV-G4-NONENGINEER

- 原要求ID・原文位置・revision：`L1-COV-G4-NONENGINEER`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:54`、`git-blob:9d9c17b4884375f5bfee04c2988c8d42aa4caf6d`。
- 原文：| `L1-COV-G4-NONENGINEER` | 非エンジニアが目的、判断事項、進行条件、品質、未決、riskを理解できる開発契約 | CI・bot・Workerによる自動実行、差戻し、証拠化、停止・再開の統制 | HELIX-WebはVersion 1後にdashboard操作体験を提供する。HARNESS Version 1の成立を代替しない |
- 原制約・authority：監査work unitであり要求ID・採択済みscopeではない（`coverage_audit_only`）。
- L11対応：未特定（監査work unitに直接L11 IDなし）
- 提案：監査work unitの未被覆価値を現行ConceptのL1差分候補として扱う。対応機構 HELIX-HARNESS／HELIX-OS／HELIX-Web、版 1.0土台／1.x Web（該当時）。
- 理由：対象L1の意味変更と受入の採否待ち。 旧L1のexact承認revisionから意味が増えるため、L1変更にはPO判断が要る。
- 選択肢と影響：A この未被覆価値を対象L1改訂へ含める→該当サービス・OS/LABO/BRAINの受入を別起草。B 既存L1に完全被覆があると判断→原文とL11の対応を示して追加を避ける。C 保留→監査unitを要求IDにせず保持。
- 推奨：Aを審査候補とする。既存L1との重複をID・原文単位で照合する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-Web`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-Web:製品`、HARNESS内 `枠／コア候補（未確定）`、版 `1.0土台／1.x Web（該当時）`、判定候補 `追加`。

### L1-COV-G5-WORKER-OPTIMIZATION

- 原要求ID・原文位置・revision：`L1-COV-G5-WORKER-OPTIMIZATION`、`docs/governance/audits/source-rebaseline/l1-goals-principles-coverage-audit.md:55`、`git-blob:9d9c17b4884375f5bfee04c2988c8d42aa4caf6d`。
- 原文：| `L1-COV-G5-WORKER-OPTIMIZATION` | 作業分類、能力契約、検証義務、escalation条件 | Worker実測、費用、capacity、assignment、再配置、独立検証 | 製品固有のrisk、data、作用、品質、期限、費用制約を提供する責務 |
- 原制約・authority：監査work unitであり要求ID・採択済みscopeではない（`coverage_audit_only`）。
- L11対応：未特定（監査work unitに直接L11 IDなし）
- 提案：監査work unitの未被覆価値を現行ConceptのL1差分候補として扱う。対応機構 HELIX-HARNESS／HELIX-BRAIN／HELIX-OS／HELIX-LABO、版 1.0土台／1.x Web（該当時）。
- 理由：対象L1の意味変更と受入の採否待ち。 旧L1のexact承認revisionから意味が増えるため、L1変更にはPO判断が要る。
- 選択肢と影響：A この未被覆価値を対象L1改訂へ含める→該当サービス・OS/LABO/BRAINの受入を別起草。B 既存L1に完全被覆があると判断→原文とL11の対応を示して追加を避ける。C 保留→監査unitを要求IDにせず保持。
- 推奨：Aを審査候補とする。既存L1との重複をID・原文単位で照合する。
- 対応印：機構 `HELIX-HARNESS／HELIX-BRAIN／HELIX-OS／HELIX-LABO`、属性 `HELIX-HARNESS:製品、HELIX-BRAIN:非製品、HELIX-OS:非製品、HELIX-LABO:非製品`、HARNESS内 `枠／コア候補（未確定）`、版 `1.0土台／1.x Web（該当時）`、判定候補 `追加`。

### 仮ID-BASE-01

- 原要求ID・原文位置・revision：`仮ID-BASE-01`、`docs/concept/helix-concept.md:96`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| ログと証拠 | すべての機構が共通の形で記録する。誰が・何を・どの要求と構成の版で・どの能力とモデルの版を使い・どうなったかを、相関IDで結ぶ。要求、判断、変更、検証、手戻り、結果を一つの開発の経過（episode）として辿れるようにする | 1.0の計測と復旧、2.0の推薦の実績、3.0の学習データ、4.0の判断根拠 |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。OSはepisode・evidenceの管理、HARNESSは証拠契約、各機構は自責務のeventを記録する。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。能力・モデル版と相関IDを欠くepisodeを拒否するL11を先に起草する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

### 仮ID-BASE-02

- 原要求ID・原文位置・revision：`仮ID-BASE-02`、`docs/concept/helix-concept.md:97`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| データの利用区分 | 記録する時点で、出典、権利、機密区分、学習や外部送信に使ってよいかを付ける。学習用と評価用を分けられるようにする | 3.0の学習、Web提供でのデータ還流 |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。Securityは利用区分と保護、各機構は自らの記録へ区分を付ける。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。出典・権利・機密・学習用/評価用の欠落と誤混用を拒否するL11を起草する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

### 仮ID-BASE-03

- 原要求ID・原文位置・revision：`仮ID-BASE-03`、`docs/concept/helix-concept.md:98`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| 計測 | 品質、費用、時間、再作業、失敗を、作業と構成の版ごとに測る | 1.0のWorker配置、以降すべての改善の比較 |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。LABOは独立計測・比較、OSは実行証拠、BRAINは配置案、HARNESSは検証契約を持つ。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。品質・費用・時間・再作業・失敗を構成版別に比較でき、計測欠落を検出するL11を起草する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

### 仮ID-BASE-04

- 原要求ID・原文位置・revision：`仮ID-BASE-04`、`docs/concept/helix-concept.md:99`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| 接続契約と版 | 機構どうし、外部とのやりとりに、能力名、契約版、対象範囲、相関ID、期限、冪等キー、結果状態を持たせる。未対応の版を黙って読み替えない | 機構の追加と交換、1.xのConnector、2.0の外部データ |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。CONNECTは接続契約、各機構は入出力に契約版・相関ID・結果状態を実装する。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。能力名・相関ID・期限・冪等キー・結果状態の不整合を拒否する接続L11を起草する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

### 仮ID-BASE-05

- 原要求ID・原文位置・revision：`仮ID-BASE-05`、`docs/concept/helix-concept.md:100`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| 隔離の単位 | project、tenant、環境を、すべての記録、権限、データ、資源に最初から付ける | 1.xのWeb提供、複数製品の並行開発 |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。Securityは隔離方針、Runner／Sandboxは実行隔離、各機構は記録・権限・資源にscopeを付ける。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。project/tenant/環境を跨ぐ記録・権限・データ・資源の混線を拒否するL11を起草する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

### 仮ID-BASE-06

- 原要求ID・原文位置・revision：`仮ID-BASE-06`、`docs/concept/helix-concept.md:101`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| 構成版の固定と切戻し | 実行中のjobが使っている能力、モデル、構成の版を固定して記録し、候補版の段階適用と切戻しをできるようにする | HELIXの自己更新、3.0以降のモデル差し替え |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。OSはjob・構成版の登録と切戻し、Runner／Sandboxは固定版実行、各機構は自分の能力版を宣言する。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。jobの能力・モデル・構成版固定と切戻し後の再現性をL11へ分ける。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

### 仮ID-BASE-07

- 原要求ID・原文位置・revision：`仮ID-BASE-07`、`docs/concept/helix-concept.md:102`、`concept-current; git-blob:8f317c6a07a3ba6866f82fc805496c38fdb1f638`。
- 原文：| 後から加わる機構の受け口 | 機構どうしの入出力を接続契約で定め、後から加わる機構が使う入出力（評価用の計測、学習用の記録など）も1.0から記録しておく | 3.0のIntelligence |
- 原制約・authority：Conceptの1.0土台。後続版の能力自体は含めない（`approved_concept_meaning; requirement_identity_unassigned`）。
- L11対応：未特定（全条件を満たすL11受入の直接対応は未確認）
- 提案：Conceptの1.0土台を7機構・共通部品の単体記録と接続受入へ分け、仮IDの追加候補として起草する。CONNECTは後発機構の接続口、LABOは評価入力、各機構は将来の学習用・評価用記録を残す。
- 理由：既存L2/HILには部分候補があるが、Conceptの「すべての機構」等の全条件とL11合成被覆が未証明。後続版の能力は1.0の完成条件へ入れない。
- 選択肢と影響：A 不足分を追加→1.0単体・接続L2/L11を仮IDで起草し、採番は別判断。B 既存要求で全条件を被覆→対応する原ID/L11の全atomを提示して追加を避ける。C 保留→未被覆疑義を維持し1.0完成を宣言しない。
- 推奨：A。後発機構が接続前の評価・学習入力を読める1.0の記録契約をL11へ起草する。
- 対応印：機構 `HELIX-HARNESS／HELIX-OS／HELIX-BRAIN／HELIX-LABO／HELIX-Security／HELIX-CONNECT／Runner／Sandbox`、属性 `HELIX-HARNESS:製品、HELIX-OS:非製品、HELIX-BRAIN:非製品、HELIX-LABO:非製品、HELIX-Security:非製品、HELIX-CONNECT:共通部品、Runner／Sandbox:共通部品`、HARNESS内 `枠（全サービスに適用する共通契約の候補。サービス別受入は未決）`、版 `1.0土台`、判定候補 `追加`。

## AIが進める項目（担当移動・技術変更・未特定の調査）

ここに置くHIL原IDはsourceの`specified_frozen`を保持する。現行successor採用、意味変更、retireは記録しない。機構配置とHARNESS内区分の未特定はAIが原文・旧照合・Conceptを追加調査し、意味差分が生じた時だけPO項目へ移す。

| 原ID | 原文位置・revision | 機構／HARNESS内区分／導入版の候補 | 次のAI作業・未特定結果 |
|---|---|---|---|
| HIL-BR-01 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:53`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS／HELIX-BRAIN、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-02 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:54`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-CONNECT、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-04 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:56`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-05 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:57`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-06 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:58`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-07 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:59`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原記録・終端権限・単体/接続L11と旧consumerの被覆をAIが照合し、上流意味差分が判明した場合だけPOへ戻す。 |
| HIL-BR-08 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:60`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-09 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:61`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-BR-10 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:62`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-11 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:63`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO／HELIX-Intelligence、非該当、`1.0記録・評価受け口／3.0候補（知識・モデル改善）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。1.0記録土台と3.0知識・モデル改善を同一完成条件にしない。 |
| HIL-BR-12 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-12 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:64`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-CONNECT、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-13 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-13 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、入口、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-14 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-14 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:66`・`IR-revision:2; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-15 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-15 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-BRAIN／HELIX-CONNECT、非該当、`1.0接続土台／2.0候補（外部データ実取込）` | 1.0接続受け口と2.0実取込・推薦のL11合成被覆は未証明。版割当はAIがConceptと原制約で照合し、上流意味を変える場合だけPOへ戻す。 |
| HIL-BR-17 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-17 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:69`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-18 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-18 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:70`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-BR-19 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-19 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:71`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-BR-20 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-20 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:72`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-21 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-21 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:73`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、サービス⑤、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-BR-22 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-22 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:74`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-23 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-23 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:75`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-BR-24 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-24 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:76`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-25 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-25 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:77`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-26 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-26 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:78`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-BR-27 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-27 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:79`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-28 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-28 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:80`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-29 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-29 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:81`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（pack運用・gap/効果評価のみ。知識・判断方法・モデル改善は3.0接続）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-30 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-30 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:82`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-BR-31 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-31 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:83`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-32 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-32 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-BR-33 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-BR-33 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:85`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、サービス⑥、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-02 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:92`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-CONNECT、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-03 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:93`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-05 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:95`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-06 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:96`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-07 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:97`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-08 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:98`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-09 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:99`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-11 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:101`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-FR-12 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-12 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:102`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品（Agent Registry）、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-13 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-13 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:103`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-14 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-14 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:104`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO／HELIX-Intelligence、非該当、`1.0記録・評価受け口／3.0候補（知識・モデル改善）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。1.0記録土台と3.0知識・モデル改善を同一完成条件にしない。 |
| HIL-FR-15 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-15 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:105`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-16 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-16 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:106`・`IR-revision:2; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-17 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-17 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:107`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、入口、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-18 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-18 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:108`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、サービス①、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-21 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-21 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:111`・`IR-revision:2; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-22 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-22 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:112`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-23 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-23 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:113`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／HELIX-CONNECT、非該当、`1.0接続土台／2.0候補（外部データ実取込）` | 1.0接続受け口と2.0実取込・推薦のL11合成被覆は未証明。版割当はAIがConceptと原制約で照合し、上流意味を変える場合だけPOへ戻す。 |
| HIL-FR-24 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-24 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:114`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-BRAIN／HELIX-Security／HELIX-CONNECT、非該当、`2.0候補（外部データ実取込。1.0は接続・記録土台のみ）` | 1.0接続受け口と2.0実取込・推薦のL11合成被覆は未証明。版割当はAIがConceptと原制約で照合し、上流意味を変える場合だけPOへ戻す。 |
| HIL-FR-25 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-25 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:115`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-26 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-26 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:116`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-27 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-27 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:117`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`未特定（旧実現方式の採否・適用版はConcept未記載）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。Conceptに旧技術の採用版がなく、導入版未特定。 |
| HIL-FR-29 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-29 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:119`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-30 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-30 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:120`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原記録・終端権限・単体/接続L11と旧consumerの被覆をAIが照合し、上流意味差分が判明した場合だけPOへ戻す。 |
| HIL-FR-31 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-31 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:121`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-32 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-32 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:122`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-33 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-33 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:123`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-FR-34 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-34 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:124`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-FR-35 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-35 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:125`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、入口、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-36 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-36 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:126`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-37 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-37 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:127`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-38 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-38 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:128`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-39 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-39 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:129`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、サービス⑤、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-40 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-40 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:130`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-41 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-41 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:131`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品（Design Template）、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-42 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-42 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:132`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-43 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-43 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:133`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-44 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-44 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:134`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（pack運用・gap/効果評価のみ。知識・判断方法・モデル改善は3.0接続）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-45 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-45 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:135`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-46 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-46 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:136`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-47 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-47 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:137`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-48 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-48 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:138`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-49 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-49 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:139`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-50 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-50 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:140`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、サービス⑤、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-51 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-51 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:141`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-52 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-52 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:142`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-FR-53 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-53 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:143`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-54 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-54 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-55 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-55 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:145`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-56 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-56 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:146`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-57 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-57 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:147`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-58 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-58 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:148`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO、非該当、`1.0候補（pack運用・gap/効果評価のみ。知識・判断方法・モデル改善は3.0接続）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-59 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-59 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:149`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-60 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-60 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:150`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-61 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-61 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:151`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-62 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-62 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:152`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-63 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-63 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:153`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-BRAIN、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-64 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-64 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:154`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-65 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-65 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:155`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-66 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-66 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:156`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-67 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-67 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:157`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-68 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-68 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:158`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／HELIX-CONNECT／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-FR-69 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-FR-69 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:159`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO／HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-01 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:181`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-02 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:182`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-04 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:184`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-05 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:185`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-Security、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-06 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:186`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-Security、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-07 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:187`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-08 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:188`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-09 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:189`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-NFR-10 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:190`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-NFR-11 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:191`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、サービス①、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-12 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-12 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:192`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-13 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-13 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:193`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、コア（source変換・detectorの決定性契約）、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-14 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-14 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:194`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-NFR-15 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-15 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:195`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、サービス⑥、`1.0候補（CI証拠lineage。旧三段固定の採否はPO未決）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-16 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-16 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:196`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-17 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-17 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:197`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-18 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-18 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:198`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-19 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-19 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:199`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-NFR-20 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-20 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:200`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、入口、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-21 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-21 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:201`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-NFR-22 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-22 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:202`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-23 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-23 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:203`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、枠、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-24 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-24 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:204`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、サービス⑤、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-25 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-25 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:205`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品（設計契約。DDD規律の適用範囲は未決）、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-26 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-26 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:206`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-27 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-27 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:207`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-28 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-28 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:208`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-29 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-29 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:209`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-30 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-30 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:210`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 原文の目的・制約・旧authorityを保持したまま、単体/接続受入と旧consumerをAIが照合する。意味差分が判明した場合に対象revisionをPOへ戻す。 |
| HIL-NFR-31 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-31 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:211`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-32 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-32 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:212`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、コア、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-33 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-33 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:213`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-34 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-34 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:214`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-HARNESS／HELIX-OS、部品、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-35 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-35 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:215`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-LABO、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-36 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-36 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:216`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-BRAIN、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-37 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-37 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:217`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-38 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-38 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:218`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-39 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-39 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:219`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-Security／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-NFR-40 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-NFR-40 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:220`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`1.0候補（旧IRの現行採択・完成条件ではない）` | 具体的な候補を得たが、successor・L11合成被覆・適用版の承認は未了。 |
| HIL-TR-01 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-01 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:165`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-02 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-02 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:166`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-CONNECT、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-03 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-03 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:167`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-04 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-04 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:168`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-05 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-05 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:169`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-06 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-06 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:170`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／HELIX-Security、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-07 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-07 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:171`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-08 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-08 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:172`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-09 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-09 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:173`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS／Runner／Sandbox、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-10 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-10 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:174`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |
| HIL-TR-11 | `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/HIL-TR-11 ; migration:docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:175`・`IR-revision:1; file-sha256:80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688` | HELIX-OS、非該当、`未特定（技術方式はL3以下で検討。機能版は上流要求の導入版に従う）` | 旧固定方式の現行採用と導入版は未特定。原目的・制約・受入の対応をAIが旧consumerと照合し、上流意味の変更が必要な場合だけPOへ戻す。 |

## 今回指定された系列以外の残母集団

今回の215行はユーザー指定の4対象L2・HIL・DTK・L1-COVと1.0土台7項目である。別管理のconfirmed文書identity 175件、IR補助134件、v1.3の521非空行、旧candidate 92文書4,755行、atom化待ち2,058行／721 unit、補助source 655 itemは[carry-forward状況](../requirement-carry-forward-status.md)と[semantic line inventory](../legacy-requirement-semantic-line-inventory.md)に原状態で残す。これらを215行へ合算・採否・retire済みと扱わず、次のsource atom照合queueとして保持する。

同じ`docs/governance/candidates/`のdraft candidate要求系列には`AIDOC-*`、`DST-*`、`LAR-*`、`NCI-*`、`REQENG-*`、`SCF-*`、`WBS-*`、`HXT-RQ`と各`*-BR`群もある。これらは今回指定された原要求ID系列に含まれないため215行の分母へ加えていない。親をConceptへ付け替えた候補文書も含めて未採否のまま別queueで原文・revisionを保持し、未掲載を不要・移管済みとは読まない。

## 判断とAI作業の境界

POがA/B/Cを選ぶ前に、原文・digest・原authorityと対象revisionの一致、接続後の意味atom全件、L11の受入を照合する。担当や技術の変更だけならAIが差分を記録して進める。原文を縮退・統合・retireする場合だけ、対象revisionと変更前後を持つ人間decisionに戻す。未特定の行は検索範囲と結果を対応表に残したまま先へ進む。
