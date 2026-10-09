# 要件定義の最初に扱う、最小内部循環のロードマップ

## 目的と現在の位置

HARNESSの工程定義、COREの意味導出、BRAINの汎用知識、OSの案件運転をつなぎ、HELIX自身の開発・更新・評価を一周できる最小構成を整理する。要件定義の最初に扱う横断的な整理の入口とする。

現在はL2／L11の要求整理と接続条件の照合を行う。[10/10巻き戻し判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)によるL3以下の停止を保持する。ロードマップの起票は正式L3の再開、要件承認、実装、CI起動、内部デプロイの実施を意味しない。各機構・StageのL3／L10は再開後に現行の著述・reviewの単位で導出する。

## 指示の出典

2026-10-10（Asia/Tokyo）のユーザー指示を起点とする。

> HARNESSの定義からCoreの形成、BRAINと照会してBRAINの知識領域定義、CoreとHARNESSの定義からOSの規格を定義して、内部デプロイで随時更新できる環境。これがまずの主題？その後、SecurityとIntelligence観点からの防御と支援を加えて、CIやWorker負荷を計測するインフラとラボデータから循環してBRAINとIntelligenceへつなぐって順序であってる？

> これをロードマップイシューとして立てて要件定義の最初にするでOK？

以下はこの指示を、既存Concept・要求・判断記録の責務と停止境界へ対応付けた作業順の整理である。個別要求の採否・意味・版や既存Stage配属を変更しない。

## 作業の順序と照合する結果

| 順 | 主題 | 整理するもの | 照合する結果 |
|---|---|---|---|
| 1 | HARNESS・CORE・BRAINの照合 | HARNESSの工程契約、COREの対象要求と意味導出、BRAINの既存Domain／Pattern／Unit／Partと必要な知識。Pythonの意味処理とJSON正本の境界 | 一つの要求例から、選択知識の根拠・設計義務・必要input・不足質問・対検証を辿れる。製品固有の都合でBRAINの汎用領域を再定義しない |
| 2 | CORE／HARNESSとOSの接続 | COREの設計・依存・影響とHARNESS工程部品を、OS自身の要求、案件状態、許可、資源、優先度、予算、期限へ結ぶ | OSの作業具体化・割当・検収・Backflowが元のrevision／scope・義務へ戻る。OSが工程の意味を再定義しない |
| 3 | 最小の内部更新・復旧構成 | 選択した経路に必要なSECURITY、CONNECT、INFRASTRUCTURE、Worker、検証・結果記録。段階構成の版・検証・復旧先 | 承認・freeze後の後続段階で、要求確認→作業→検証→結果記録を一周し、検証した構成を別の内部デプロイ事象として追跡できる。今はその入力と受入条件を照合する |
| 4 | INTELLIGENCEの支援と防御の拡張 | 現状・知識・CORE契約を使う計画／配置／診断／review候補。反復ログと判定可能性が揃った対象の専門Bot・Security Bot | 候補、OSの割当、Workerの実作業、HARNESSの検証を区別する。Bot発行から権限を増やさない |
| 5 | 計測・LABO評価・知識と判断の改善 | CI／Workerの負荷、失敗、再作業、使用版とscopeの記録。LABOの比較評価とBRAIN／INTELLIGENCEへの受渡し | BRAINへは裏付けられた汎用構造候補、INTELLIGENCEへは判断・配置の評価材料を返す。評価・受領だけで採用や改善成功を生成しない |

これは検討の順序であり、前段全件完了を後段全作業のgateにしない。選択した経路の実依存を照合する。[既存の対応順序](audits/requirements-stage/implementation-order-2026-09-27.md)と[追補](audits/requirements-stage/implementation-order-addendum-2026-10-03.md)は当時の候補配属を保持し、現行要求・版・再開scopeとの比較材料にする。既存Stage番号をこの表の番号で置き換えない。

最小の認可・隔離・通信制約と利用可能な実行資源は順3から必要であり、防御を順4まで後回しにしない。使用版・結果・失敗・負荷の計測項目は最初の実行経路から整理し、順5で比較・改善循環を広げる。1.0はHARNESS定義済み工程部品の組合せと差戻し、部品外のフロー生成は4.0、ローカルLLM学習は3.0という既決の区分を保持する。

## 最初の整理で出すもの

- 一つの要求例について、BRAIN知識→COREのPython意味導出→OSの作業具体化→Worker→検収→COREへのBackflowを、正常・負例・unknownで通す対応表。
- 必要な単体・接続・構成体と、各端のidentity／revision／scope、input／output、未完義務、停止・戻し先、対oracleの照合先。
- 既存要求で保持できる条件と、追加・意味変更・版判断などが必要な不足の区別。既決の意味を繰り返し承認待ちにしない。
- 最小構成で扱えること、扱えないこと、実依存と未選択の機構・機能。全BRAIN知識や全Botの完成を初回の前提にしない。

schema・通信方式・実装配置・具体値は、この整理から確定済み扱いにせず、再開後の対象要件・設計と対検証で導出する。実装前test／oracleの定義・凍結、DDDの責務・命名、JSON正本と生成view、独立reviewを対象成果へ適用する。

## 既存の作業と正本

| 整理先 | 主に扱う範囲 | 要求・正本の入口 |
|---|---|---|
| #2841 | BRAINの汎用知識・template契約と選択材料 | [BRAIN L2](../helix-brain/L2-requirements/brain-requirements.md)／[L11](../helix-brain/L11-acceptance/brain-acceptance.md)、[template分担](template-work-allocation.md) |
| #2842、#1799、#1801 | COREの製品適用・Backflow、Python意味処理と旧behavior source | [HARNESS L2](../helix-harness/L2-requirements/product-requirements.md)／[L11](../helix-harness/L11-acceptance/product-acceptance.md)、[Python候補](../helix-harness/candidates/requirement-engine-python-core-requirements.md) |
| #1805、#2843、#1860 | OSの工程具体化・案件記録・検収、COREとの往復 | [OS L2](../helix-os/L2-requirements/governance-requirements.md)／[L11](../helix-os/L11-acceptance/governance-acceptance.md) |
| 本ロードマップの横断照合 | 支援、制約、実行資源、評価の選択接続 | [INTELLIGENCE L2](../helix-intelligence/L2-requirements/intelligence-requirements.md)／[L11](../helix-intelligence/L11-acceptance/intelligence-acceptance.md)、[SECURITY L2](../helix-security/L2-requirements/security-requirements.md)／[L11](../helix-security/L11-acceptance/security-acceptance.md)、[INFRASTRUCTURE L2](../helix-infrastructure/L2-requirements/infrastructure-requirements.md)／[L11](../helix-infrastructure/L11-acceptance/infrastructure-acceptance.md)、[LABO L2](../helix-labo/L2-requirements/labo-requirements.md)／[L11](../helix-labo/L11-acceptance/labo-acceptance.md)、[CONNECT L2](../helix-connect/L2-requirements/connect-requirements.md)／[L11](../helix-connect/L11-acceptance/connect-acceptance.md) |

既存Issueの作業を重複発行・完了扱いにせず、このロードマップへ対応付ける。ロードマップIssueは作業projectionであり、各要求・接続の採否や成立は上記正本と対象decisionで読む。

## 内部デプロイと旧sourceの対応

[段階リリース・内部デプロイ方針](decisions/stage-release-internal-deployment-po-decisions-2026-10-07.md)と[10/10巻き戻し判断](decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md)を保持する。部品更新は新しい段階構成として組み、検証と内部利用開始を分けて追う。段階を組み直さない部品・接続単独の内部デプロイは未決のまま保持し、「随時更新」からその許可を生成しない。実際のrelease／cutover等の扱いは既存方針に従う。

旧sourceは`archive/legacy-generation-2026-09-14/root/CLAUDE.md:49–63`（仕組みを土台に機能を積む、意味処理と外部作用の分離）、`docs/governance/candidates/functional-release-slice-requests.md:23–67`（archive root内。選択集合・局所影響・必要安全依存・内部先行利用・組合せ検収）、`docs/design/helix/L4-basic-design/design-template-json-authority.md:19–46`（同root内。意味契約・生成view・portfolio・pair）を読取り起点にした。

保持するのは仕組み先行、選択した小さな経路、必要な安全依存、版・検証・復旧の追跡である。変更するのは今回の指示による最初の整理主題を、現行BRAIN／CORE／OSと支援・評価の接続へ割り当てる点であり、旧Node固定・旧DB・旧runtime・旧test／CIを継承しない。新しい承認手続きや全件完了gateは加えない。
