# 要求全体のレビューとIssue棚卸し（2026-10-10）

HELIX要求全体の確認記録（2026-10-10）
対象main: 64281f5620587103773a888f1935258aeaecb7e3

結論
要求の採否・所在・対となる受入の参照は揃っている。ただし、要求全体とそれを運転する文書が整合済みとは判断できない。要求意味に既知の矛盾1点、版と接続範囲の未整理1点、運用文書の不整合2点を確認した。既決の採択や版判断をこの確認から変更しない。

確認対象と方法
本体8対象（7機構と共通部品CONNECT）、Concept、七大原則、JSON正本のPO判断、L1、L2/L11の要求集合、採否判断記録、管理層仮登録、版・順序の追補、旧source対応を横断照合した。Web/WEB-OSは要求層から外したVision材料として確認し、8対象の要求件数に算入していない。テンプレートseedの存在を採用や正式機構の成立へ読み替えていない。

採否と版
最新候補identityは384件：採択374、保留5、現revision不採択5、判断未記録0。MPR物理1,077行はrevision履歴・source holdingも含み、候補数ではない。
採択374件内は1.0対象309、版未指定27、後続版35、Web条件付き3。10/10判断で35件が版未指定から1.0へ移った。別分母のHARNESS routing条件8件も1.0になった。routing8件を374件の採択候補へ混ぜて再集計しない。旧順序・版JSONの274/62は固定snapshotであり、現在値には10/10判断を重ねる。

機構別（採択件数／1.0／版未指定／後続版／Web条件付き）
HELIX-HARNESS: 68 / 61 / 6 / 1 / 0
HELIX-BRAIN: 43 / 41 / 0 / 2 / 0
HELIX-CONNECT: 9 / 9 / 0 / 0 / 0
HELIX-INFRASTRUCTURE: 26 / 12 / 0 / 14 / 0
HELIX-INTELLIGENCE: 60 / 50 / 0 / 10 / 0
HELIX-LABO: 64 / 57 / 0 / 4 / 3
HELIX-OS: 69 / 48 / 21 / 0 / 0
HELIX-SECURITY: 35 / 31 / 0 / 4 / 0

責務と主要接続
HARNESSは工程・意味・設計義務・検証契約、OSは登録・推進・ticket・割当・検収運転、BRAINは汎用構造、INTELLIGENCEは稼働時の判断候補、LABOは効果と退行の評価、SECURITYは操作制約・authority、INFRASTRUCTUREは実資源と状態、CONNECTは接続・契約版・通信を持つ。単体・接続・構成体の区別、LABO→INTELLIGENCE→OSの配置、BRAIN→COREの知識提供、OS状態と実資源状態の分離、1.0と後続版の境界を確認した。これらの主線について、新たな要求欠落は今回確定していない。

指摘1：JSON正本方針とOS053の要求・受入が食い違う（意味の不整合、既知）
JSONを正本としてMarkdown/HTMLを生成するPO判断に対し、HELIXOS-L2-053は「Markdown上のcanonical本文」を更新対象とし、L11-053もMarkdown/asset revisionを受入入力に含む。10/10の版判断はこの矛盾を明記し、意味修正を別作業へ残している。#2824の版反映で解消された問題ではない。JSON意味正本と人向け投影の責務を、L2と対のL11で揃える必要がある。
根拠:
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md#L77
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-os/L2-requirements/governance-requirements.md#L1250
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-os/L11-acceptance/governance-acceptance.md#L859
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/decisions/discipline-requirements-into-1.0-po-decision-2026-10-10.md
旧対応: archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:19-29,40（JSON契約の正本、generated view、説明Markdownを分離）。旧runtimeは実行していない。

指摘2：1.0へ入れた要求の接続相手に、版未指定の要求が残る（成立範囲の確認事項）
HARNESS-L2-059は1.0だが、同一判断単位としてセット採択されたHELIXOS-L2-102は版未指定のままである。前者のIssue契約意味だけを1.0で成立させるのか、OSのdurable intake/projection/handoffまで含めるのかが、版変更後の成立範囲として整理されていない。
同様に1.0へ移したHELIXOS-L2-053のcommand semantic identity入力はHARNESS-L2-052を参照し、052は版未指定のままである。053本文はこの入力を条件付きと明記しているため、全1.0機能が必ず052に依存すると断定はしない。
この指摘は、102/052を自動で1.0へ足す判断ではない。10/10の明示的な対象外指定を維持し、1.0で成立させる操作・保証・接続範囲を確認する必要がある。
根拠:
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/decisions/po-decision-2026-09-30-live26.md#L70
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-harness/L2-requirements/product-requirements.md#L1222
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-os/L2-requirements/governance-requirements.md#L1297
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-os/L2-requirements/governance-requirements.md#L1255
旧対応: 059/102本文に記録されたLEGACY-ASSET-719D5EC9C06FC4AAD0FF:93のIssue契約とversioned contract＋digestの受渡し。原要求の選択外条件はholdingに残る。

指摘3：現行運用の開発方式・Discovery/PoCが、既決要求の変更へ追随していない（運用文書の不整合）
HARNESS-L2-002と9/25 PO判断は4方式の合成を認める。一方、GitHub上流運用モデル200行は旧三方式から一つだけを選び、複数選択をfail-closeする。201行もDiscovery/PoCを旧S0〜S4へ一括し、採択結果をL3機能要件へ合流させる。
要求側はDiscovery・PoC・Decideを別ticketとし、要求段階のPoCはBackflow→L2の2次形成→Decideへ戻す。現行運用の表を要求側の既決変更と揃える必要がある。旧記述の移植ではなく、既にPOが決めた差分への追随である。
根拠:
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/github-upstream-operating-model.md#L200
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-harness/L2-requirements/product-requirements.md#L53
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/helix-os/L2-requirements/governance-requirements.md#L123
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md#L51
旧対応: archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:70-88。旧の三方式・Hybridの意味が9/25判断で変わったことは既に記録されている。

指摘4：現在の案内文書に、巻き戻しで失効したL3承認状態が残る（状態表示の不整合）
GitHub上流運用モデル391〜393行はOS046/035/052のStage 3/4 L3を「承認済み」と記す。しかし10/10巻き戻し判断は機構×StageのL3/L10承認を失効させた。旧判断記録・監査記録を残すことは正しいが、現在の移管表で有効な状態として読める表示は訂正が必要である。
また、現在の要求読取り入口l2-source-registerとRDP-001〜003には、旧4対象・未承認・未採否等の以前の状態が残る。これらを採否正本としては使わず、作業入口と現行判断を優先する。過去の固定snapshotそのものを改変する指摘ではない。
根拠:
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/github-upstream-operating-model.md#L391
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/decisions/rollback-to-requirements-closure-po-decision-2026-10-10.md#L73
https://github.com/RetryYN/HELIX-HARNESS/blob/64281f5620587103773a888f1935258aeaecb7e3/docs/governance/audits/source-rebaseline/l2-source-register.md

確認済みの証拠と限界
・374採択identityはすべてL2本文と対L11でIDを確認できた。L11のIDはL2-ID表記とL11-ID表記の両方を照合した。これは所在・参照の確認であり、全oracleの意味完全性の証明ではない。
・374件の終了基準633bf12上のL2 source section raw hashは追補JSONと全件一致。exact registrationはPO判断本文またはその指定fixed確認packetへ全件辿れた。該当登録のunaccounted_atom_refsはすべて空。これを選択外sourceの完全被覆とは扱わない。
・現在の本体8対象のL1/L2/L11を終了基準と比較すると、L2の36本の版行追加とOSのWebリンク2件訂正以外に差分はなかった。要求意味の無断変更はこの差分照合では見つからなかった。
・対象10組のL2/L11のpairファイルは実在。確認したL2 Markdownファイルリンクの参照先欠落0。
・scfctl validate: bindings=147 fail=0。scfctl stale: stale=0。govcheck: ok atoms=7622 requirements=57 files=58。govcheckの57は採択374件の全意味検査数ではない。
・旧IR153の行き先整理と、旧sourceの全条件・全consumerの無損失移管は別である。正式successor未割当のholdingや部分coverageの未解決条件は残っており、今回それらの全原文を再atom化していない。現在の要求整理終了を、旧sourceの全移管完了に拡張しない。
・現行の停止方針に従い、L3以下、旧test/CI/runtime、新世代実装は実行していない。

次に整える順序
JSON正本とL2/L11の整合 → 1.0で成立させる接続範囲 → 既決工程への運用表の追随 → 現在の状態案内の訂正。意味・版の判断が必要な箇所と、既決判断への文書追随を分ける。追加gateや新たな承認手続きを作らない。


## テンプレートの配置と作業の引継ぎ

汎用の構造・意味契約・版・seedはHELIX-BRAIN、製品の要求への適用・設計義務・Backflow・適用判定はHELIX-HARNESS-CORE、案件のexact set・版・適用結果の記録はHELIX-OS。改善候補の登録・振り分けはOS、効果・退行の評価はLABO、評価後の汎用パーツはBRAINに戻す。根拠はConcept、9/25 PO判断と`docs/helix-brain/candidates/design-template-system-requirements.md:23–44`。候補本文やseedを採択・正式機構成立へ昇格しない。

旧Issue #1802・#1803とそのimmutable ticketは旧分担の発行記録として残す。今回のユーザー指示により、現行分担に合わせた後続作業を新ticketへ引き継ぎ、旧Issueは作業の差替えとして閉じる。要求のretireやtemplate完成を意味しない。#2730・#2735は10/10巻き戻しで作業入力・成果物・ticketがカットされ、実装解禁も失効しているため、今回のIssue整理指示により取り消した作業として閉じる。CI要求自体をretireしない。

## 既存Issueの棚卸し（52件の固定snapshot）

GitHub Issueの分類は作業案内であり、要求の採否・承認・作業開始・mergeの条件ではない。親Issueや関連Issueの番号から依存gateを作らない。残る48件は完了証拠を全件確認していないため閉じない。要求段階の終了と旧資産の全consumer移管完了、仮設の正式置換完了を分ける。

| Issue | 作業群 | 発行時のタイトル |
|---|---|---|
| [#1798](https://github.com/RetryYN/HELIX-HARNESS/issues/1798) | 正式機構の後続作業（再開条件を正本で確認） | feat(helix-os): 要求候補の因果関係付き原登録層を設ける |
| [#1799](https://github.com/RetryYN/HELIX-HARNESS/issues/1799) | 正式機構の後続作業（再開条件を正本で確認） | feat(harness): Python要求意味コアを構築する |
| [#1801](https://github.com/RetryYN/HELIX-HARNESS/issues/1801) | 正式機構の後続作業（再開条件を正本で確認） | feat(harness): 旧資産からPython意味コア候補を抽出する |
| [#1802](https://github.com/RetryYN/HELIX-HARNESS/issues/1802) | テンプレート旧分担から後続作業へ引継ぎ | feat(harness): Design Template意味コアと初期seedを定義する |
| [#1803](https://github.com/RetryYN/HELIX-HARNESS/issues/1803) | テンプレート旧分担から後続作業へ引継ぎ | feat(helix-os): Design Templateの版と適用履歴を管理する |
| [#1804](https://github.com/RetryYN/HELIX-HARNESS/issues/1804) | 正式機構の後続作業（再開条件を正本で確認） | feat(harness): PoC・画面prototype・Featureの開発検証契約を定義する |
| [#1805](https://github.com/RetryYN/HELIX-HARNESS/issues/1805) | 正式機構の後続作業（再開条件を正本で確認） | feat(helix-os): 推進機構が駆動tag・workflow・typed ticketを生成する |
| [#1812](https://github.com/RetryYN/HELIX-HARNESS/issues/1812) | 正式機構の後続作業（再開条件を正本で確認） | feat(helix-os): GitHub一方向projection・read-after同期adapterを設ける |
| [#1813](https://github.com/RetryYN/HELIX-HARNESS/issues/1813) | 要求・責務・技術比較の継続整理 | chore(governance): 全要求の要否・再配置を無損失で整理する |
| [#1814](https://github.com/RetryYN/HELIX-HARNESS/issues/1814) | 要求・責務・技術比較の継続整理 | chore(governance): 要求間の責務・機能重複候補を無損失で整理する |
| [#1815](https://github.com/RetryYN/HELIX-HARNESS/issues/1815) | 要求・責務・技術比較の継続整理 | research(governance): 旧技術の代替可能性を要求意味と分けて判断する |
| [#1837](https://github.com/RetryYN/HELIX-HARNESS/issues/1837) | 正式機構の後続作業（再開条件を正本で確認） | HELIX-OS: 要求登録bot・監査crawler・admission CIを整備する |
| [#1847](https://github.com/RetryYN/HELIX-HARNESS/issues/1847) | 仮設・GUI通知・開発運転 | feat(governance): 設計・実装・CIの仮設束縛Scaffoldを設ける |
| [#1852](https://github.com/RetryYN/HELIX-HARNESS/issues/1852) | 要求・責務・技術比較の継続整理 | feat(harness): フルリバース機構（持ち込まれた既存資産をHELIX流へ変換する入口）を要求として整理する |
| [#1853](https://github.com/RetryYN/HELIX-HARNESS/issues/1853) | 要求・責務・技術比較の継続整理 | feat(harness): デザインHARNESSとサービス①（画面プロト／PoC）を要求として整理する |
| [#1854](https://github.com/RetryYN/HELIX-HARNESS/issues/1854) | 要求・責務・技術比較の継続整理 | feat(harness): サービス④（ミスなく開発する）の要求を新規に形成する |
| [#1855](https://github.com/RetryYN/HELIX-HARNESS/issues/1855) | 要求・責務・技術比較の継続整理 | feat(harness): サービス⑤（リファクタリング）と境界を保つ仕組みを要求として整理する |
| [#1856](https://github.com/RetryYN/HELIX-HARNESS/issues/1856) | 要求・責務・技術比較の継続整理 | feat(harness): サービス⑥（リリース）の要求を新規に形成する |
| [#1857](https://github.com/RetryYN/HELIX-HARNESS/issues/1857) | 要求・責務・技術比較の継続整理 | feat(harness): サービス⑦（運用保守で改善し続ける）の要求を新規に形成する |
| [#1858](https://github.com/RetryYN/HELIX-HARNESS/issues/1858) | 要求・責務・技術比較の継続整理 | feat(harness): 枠（開発方式・Layer Ledger・V-pair・Gate）の接続要求を整理する |
| [#1859](https://github.com/RetryYN/HELIX-HARNESS/issues/1859) | 要求・責務・技術比較の継続整理 | feat(helix-os): 推進のレーンとHELIXサブエージェントを要求として整理する |
| [#1860](https://github.com/RetryYN/HELIX-HARNESS/issues/1860) | 要求・責務・技術比較の継続整理 | feat(helix-os): 検収（チケットからCI・テストを最適化）を要求として整理する |
| [#1861](https://github.com/RetryYN/HELIX-HARNESS/issues/1861) | 要求・責務・技術比較の継続整理 | feat(helix-os): 改善の実行統制（改修・検証・配布・切戻し）を要求として整理する |
| [#1864](https://github.com/RetryYN/HELIX-HARNESS/issues/1864) | 仮設・GUI通知・開発運転 | docs(governance): 旧HELIXのAIレーン設定（収束review・escalate限定・委譲）の意味を新世代へ引き継ぐ |
| [#1866](https://github.com/RetryYN/HELIX-HARNESS/issues/1866) | 仮設・GUI通知・開発運転 | 仮組み→本実装 差し替え台帳（Scaffold Binding の置換・撤去を追跡する） |
| [#1884](https://github.com/RetryYN/HELIX-HARNESS/issues/1884) | 仮設・GUI通知・開発運転 | scaffold(helix-os): VS CodeのClaude×Codex GUIレーンを双方向通知で接続する |
| [#1888](https://github.com/RetryYN/HELIX-HARNESS/issues/1888) | 旧資産・条件・consumer監査 | chore(governance): 新世代HELIX全フェーズCapability Inventoryを閉包する |
| [#1889](https://github.com/RetryYN/HELIX-HARNESS/issues/1889) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-01] Concept／L1企画の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1890](https://github.com/RetryYN/HELIX-HARNESS/issues/1890) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-02] 要求収集・原登録の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1891](https://github.com/RetryYN/HELIX-HARNESS/issues/1891) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-03] 要求分類の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1892](https://github.com/RetryYN/HELIX-HARNESS/issues/1892) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-04] 要求採否／L2の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1893](https://github.com/RetryYN/HELIX-HARNESS/issues/1893) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-05] L11受入の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1894](https://github.com/RetryYN/HELIX-HARNESS/issues/1894) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-06] Design／L3の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1895](https://github.com/RetryYN/HELIX-HARNESS/issues/1895) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-07] Verification／L10の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1896](https://github.com/RetryYN/HELIX-HARNESS/issues/1896) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-08] WBSの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1897](https://github.com/RetryYN/HELIX-HARNESS/issues/1897) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-09] Ticket生成の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1898](https://github.com/RetryYN/HELIX-HARNESS/issues/1898) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-10] Worker実行の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1899](https://github.com/RetryYN/HELIX-HARNESS/issues/1899) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-11] CI／Testの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1900](https://github.com/RetryYN/HELIX-HARNESS/issues/1900) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-12] Review convergenceの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1901](https://github.com/RetryYN/HELIX-HARNESS/issues/1901) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-13] Merge admissionの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1902](https://github.com/RetryYN/HELIX-HARNESS/issues/1902) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-14] Releaseの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1903](https://github.com/RetryYN/HELIX-HARNESS/issues/1903) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-15] Deployの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1904](https://github.com/RetryYN/HELIX-HARNESS/issues/1904) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-16] 運用・監視の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1905](https://github.com/RetryYN/HELIX-HARNESS/issues/1905) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-17] Incidentの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1906](https://github.com/RetryYN/HELIX-HARNESS/issues/1906) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-18] Refactorの旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1907](https://github.com/RetryYN/HELIX-HARNESS/issues/1907) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-19] Learning／改善の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#1908](https://github.com/RetryYN/HELIX-HARNESS/issues/1908) | 旧資産・条件・consumer監査 | audit(capability): [PHCAP-20] Memory／継続再構成の旧到達層・実装状況・機構・版・製品属性の候補分類を照合する |
| [#2089](https://github.com/RetryYN/HELIX-HARNESS/issues/2089) | 要求・責務・技術比較の継続整理 | chore(governance): HELIX-LABOとHELIX-Intelligenceの責務分離の要求境界を整理する |
| [#2093](https://github.com/RetryYN/HELIX-HARNESS/issues/2093) | 仮設・GUI通知・開発運転 | chore(ops): 作業ブランチとworktreeの残置を継続管理する |
| [#2100](https://github.com/RetryYN/HELIX-HARNESS/issues/2100) | 旧資産・条件・consumer監査 | research: 旧資産の分類深度を集計と判断入力で分離する |
| [#2730](https://github.com/RetryYN/HELIX-HARNESS/issues/2730) | 巻き戻しによる作業取消 | FT-OS-LOCALCI-001: 開発repository向けlocal CI driver |
| [#2735](https://github.com/RetryYN/HELIX-HARNESS/issues/2735) | 巻き戻しによる作業取消 | FT-OS-LOCALCI-002: 開発repository専用CIの実装と検証 |
