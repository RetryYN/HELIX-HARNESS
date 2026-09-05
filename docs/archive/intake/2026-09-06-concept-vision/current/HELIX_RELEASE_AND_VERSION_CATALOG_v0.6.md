# HELIX — リリース単位・版管理・旧成果対応 v0.6

外部提供はDevelopment Packageと、その必要最小限の基盤に限定する。内部統治・自己成長・自己公開工場はPackage数に含めない。13のPackage候補・46旧成果は実際の公開数ではない。 [DEC06]

## 1. 構成の関係

| 対象 | 意味 | 他との関係 | version |
|---|---|---|---|
| Package | 利用者に約束する開発責務と成果 | 必要なSliceと基盤の選択view。コードの新ownerではない。 | 公開Release版へ束縛。同じ公開実体のBundle版と二重管理せず、Profile設定版とは分ける。 |
| Module | 既存責務・path・artifact所有 | 一意なprimary所有。Packageへ移管しない。 | 独立SemVerの既存方針を維持。 |
| Functional Release Slice | 最小の検証・昇格・更新／rollback単位 | Packageが選び、既存Moduleが所有。正式採用は既存経路。 | 独立version要求を維持。文書IDで自動採番しない。 |
| Bundle／Profile | 利用目的別の実構成 | 選択Packageを説明に使っても、native構成はModule／Slice exact lockへ展開。 | 構成・公開利用契約が変わるとき判定。 |
| Artifact | 配布bytes／manifest／provenance | 公開実体・source・構成lockへ束縛。 | digestは内容証明。公開versionの上書きをしない。 |
| Wave／channel／世代 | 導入順／資格段階／内部能力の評価 | 包含木ではなく異なる属性。 | 互いをSemVerへ換算しない。 |

前の返答にあった「Package → Module → Slice」という固定の包含木は採用しない。Module ownershipと、利用者Packageの選択・組合せは別関係であり、Bundleのnative契約も変更しない。Packageに独自runtime registryや新しい永続正本を追加する必要はない。 [CUR07][CUR11]

## 2. 旧46成果の全件対応

| 旧ID | 元の成果（保全） | 今回の扱い | 主提供先／保全先 | 切出し境界 |
|---|---|---|---|---|
| RG01-01 | setup→doctor→是正箇所提示 | 開発用基盤のみ | DF09 | 選択Packageのsetup／doctor最小部分だけをDF09として同梱。HELIX全体doctorは内部に残す。 |
| RG01-02 | 変更→独立review/完了証拠packet | 開発Package | PKG-D05 | 独立品質review・不足証拠packet。mergeは含めない。 |
| RG01-03 | Issue/PLAN/PRのscope・検証・merge入口統制 | 開発Package | PKG-D08 | 対象projectのIssue／PLAN／PR統合。HELIX全体統治へは拡張しない。 |
| RG02-01 | CI実測収集→ボトルネック診断 | 開発Package | PKG-D06 | 対象projectのCI実測・ボトルネック診断へ限定。HELIX全体の自己進化は含めない。 |
| RG02-02 | 変更→必要検証義務と延期先の確定 | 開発Package | PKG-D06 | 対象変更の検証義務・延期先を返す。 |
| RG02-03 | 依存/資源に基づく配置→同一証拠の安全な再利用 | 開発Package | PKG-D06 | 配置とreceipt再利用は別受渡しを保つ。独立性検収前に2正式Sliceへ自動採番しない。 |
| RG03-01 | 要求候補/質問/採否→正規要件IR | 開発Package | PKG-D01 | 対象製品の要求形成・IR成果。 |
| RG03-02 | 前提調査→候補比較→根拠付き要求選択 | 開発Package | PKG-D01 | 対象目的の前提調査・選択根拠。 |
| RG03-03 | 要求差分→影響限定の再確定/再freeze | 開発Package | PKG-D01 | 対象要求差分と最小影響範囲の再確定。 |
| RG03-04 | 暫定責務→限定mutation→不足要求/Invariant/Recovery候補と根拠 | 開発Package | PKG-D01 | 対象製品の責務仮説検証。HELIX機構発明とは別。 |
| RG04-01 | 画面/interaction/要求のtrace→walkthrough検証 | 開発Package | PKG-D02 | prototype成果・trace・walkthrough。要求合意への受渡しを分ける。 |
| RG04-02 | デザイン調査→反応分類→受容済み要素を保持した再試作 | 開発Package | PKG-D02 | 人間反応に基づく設計成果。 |
| RG04-03 | 選択したmodalityのDesign IR・asset出典/権利・局所preview/検証・受け渡し | 開発Package | PKG-D02 | 共通IRとmodality別adapterを分け、実証scopeを選ぶ。 |
| RG05-01 | 限定task→Cursor等へ委譲→成果回収→独立検収/返却 | 開発Package | PKG-D04 | 独立成果は限定worker候補と実行receipt。独立review・親受入までの旧成果は横断E2Eとして保全。 |
| RG05-02 | 許可済みtask群→耐久queue/停止/再開/継続実行 | 開発Package | PKG-D03 | 進行統制・queue／停止再開が主責務。実WorkerはPKG-D04へ委譲。 |
| RG06-01 | ローカル作業/危険コマンドの検査・拒否 | 開発Package | PKG-D07 | 対象scopeの操作前認可。 |
| RG06-02 | 外部副作用/credentialへのcapability限定実行 | 開発Package | PKG-D07 | 対象行為の外部作用とcredential参照。 |
| RG07-01 | 全機能/責務/実装/証拠のread-only棚卸し | HELIX内部に保全 | IN01 | HELIX全体棚卸し。外部Packageから除外。 |
| RG07-02 | 新規差分→重複/不足/影響判定→工程別入口統制 | HELIX内部に保全 | IN01 | HELIX全体のWorld Delta／Admission管理。外部Packageから除外。 |
| RG07-03 | 提供群/世代/対象scopeの資格・停止理由の投影 | HELIX内部に保全 | IN01 | HELIX提供portfolio・世代資格の表示。外部Packageから除外。 |
| RG08-01 | task/attemptの結果→raw receipt→指標再計算 | HELIX内部に保全 | IN02 | HELIX自己評価Benchの収集・採点として内部保留。一般の品質・CI・運用観測は別の開発責務として残す。 |
| RG08-02 | task class別の実績→モデル/effort配車用の助言 | HELIX内部に保全 | IN02 | HELIXモデル運用の評価・配車助言生成は内部。開発側は承認済み固定policy／対象task証拠だけを利用でき、Benchに依存しない。 |
| RG09-01 | 責務/状況別の証拠付き最小knowledge packet | 開発部分だけ抽出 | PKG-D04 | 入力済み・対象限定・供給許可済みknowledge packetのcompile／読取り部分だけ。知識の新規昇格・cross-project転用は内部。 |
| RG09-02 | 反例/独立検証→知識の昇格・失効・機械規則化 | HELIX内部に保全 | IN05 | 知識の昇降格・機械化は内部。実際の改修だけ正規開発へ戻す。 |
| RG09-03 | Skill/Agent/Commandの利用効果・context費用→KEEP/統合/機械化/互換化の提案 | HELIX内部に保全 | IN05 | HELIX Skill／Agent／Command全体の有効性選別・置換提案は内部。 |
| RG10-01 | 選択したSlice/依存閉包→決定的artifact/manifest | HELIX内部に保全 | IN06 | HELIXのPackage制作工場。製品向けPKG-D09へ自動改名して公開しない。 |
| RG10-02 | clean consumer→導入/更新/rollback検証→昇格 | HELIX内部に保全 | IN06 | HELIXのconsumer検収・公開昇格工場。導入先が要る最小installerだけDF09で別に選択する。 |
| RG11-01 | 検証済みartifact→配備/health観測/rollback | 開発Package | PKG-D10 | 対象製品の配備・health・rollback。 |
| RG11-02 | incident→原因分類→要求/設計/実装修正→再配備 | 開発Package | PKG-D12 | 独立成果はChangeDiagnosis／BackflowDecision。修正→Release→再配備は他Packageへのhandoff。 |
| RG11-03 | 保守義務・期限・設定/データ移行→限定修復→再観測/再評価 | 開発Package | PKG-D11 | 保守義務と予定管理を主責務にし、実migration・環境適用はPKG-D10へ。 |
| RG12-01 | 意味接続graph→影響/置換/no-degradationの候補分析 | 開発Package | PKG-D13 | 対象製品の構造改善・置換・no-degradation分析。新設計の部分合成はPKG-D02からも同じnative familyを利用。 |
| RG12-02 | 既存機構の不足→新Invariant/Protocol候補→限定検証 | HELIX内部に保全 | IN04 | HELIXの新機構創出は内部。外部向け発明Packageは今回設けない。 |
| RG12-03 | 実践finding→既存機構での是正候補→限定検証→既存変更経路へ還流 | HELIX内部に保全 | IN03 | HELIX自己改善UILは内部。 |
| RG13-01 | 限定したoffline workload→FS/network/env隔離実行→結果/拒否理由の回収 | 開発Package | PKG-D07 | 選択offline workloadの隔離。 |
| RG13-02 | 許可済みprovider transportだけを持つ隔離profile→限定外部worker実行 | 開発Package | PKG-D07 | 認可済みtransportだけを許す隔離。 |
| RG13-03 | CPU/RAM/PID/領域容量/期限の制限付き実行→取消/終了/隔離資源回収 | 開発Package | PKG-D07 | 必要な資源制限・取消・終了回収。 |
| RG14-01 | 候補出力/差分→schema・artifact内容・scope・出典検査→受入候補/隔離 | 開発Package | PKG-D07 | 未信頼outputの入口検査。native module所有を安全Packageへ自動移管しない。 |
| RG14-02 | 受入候補→対象HEAD/lease/独立検証を再照合→限定適用/拒否/安全な再試行 | 開発Package | PKG-D08 | 品質／安全／HEAD／lease再照合後の親受入・共有反映。 |
| RG15-01 | host/guest/container別の継続負荷→圧迫原因/余力の表示 | 開発用基盤のみ | DF06 | 開発workloadに必要な資源観測だけDF06の利用範囲へ。独立host監視製品は作らない。 |
| RG15-02 | workload見積りとreserve→既存capacity/leaseへadmit/defer→解放/復旧 | 開発用基盤のみ | DF06 | 対象workloadの予約・解放・fence primitiveだけDF06へ。配車policyはPKG-D03／06。 |
| RG16-01 | provider設定源/起動packet→実効値・対応surface・未知箇所の診断 | 開発Package | PKG-D04 | 選択Workerの実効設定・起動契約診断。全HELIX設定を同梱しない。 |
| RG16-02 | provider/toolchain/規則更新→影響packetの失効・再検証→限定移行/rollback | 開発部分だけ抽出 | PKG-D11 | 対象製品のprovider／runtime／toolchain更新・互換再検証だけ。HELIX統治policy改版は内部。 |
| RG17-01 | 通知/レビュー依頼→配送・claim・期限監視→終端/再配送/dead-letter | 開発Package | PKG-D03 | 対象仕事・review依頼の協調通知。協調インターフェースはDF08を利用。 |
| RG17-02 | 中断/担当不在→最小引継ぎpacket→権限再照合→再開 | 開発Package | PKG-D03 | 対象仕事の中断・引継ぎ・再開。学習記憶への昇格は含めない。 |
| RG18-01 | 対象/操作の認可→限定検証→finding/修復/独立検収の追跡 | 開発Package | PKG-D07 | 認可されたengagementとfinding受渡しを切り出し、実検査・修復・reviewは各ownerへ。 |
| RG18-02 | 機密証拠の限定保管→認可失効/取消→配車・参照権限の停止 | 開発Package | PKG-D07 | 対象engagementの機密証拠・取消・参照停止。 |

同じ元成果を複数Packageへ二重所有させない。例えばRG05-01の旧end-to-end成果は失わず、Worker部分を主成果とし、review・親受入は他ownerとの受渡しとして保全する。RG11-02／03、RG18-01も横断シナリオと独立成果を分ける。元のModule配置案・source・観測・未確認はJSONおよびhistory/v0.5に保持する。

## 3. 組合せ候補

| view ID | 利用形態 | Package選択案 | native対応候補 | 条件 |
|---|---|---|---|---|
| PROFILE-REQ | Requirements-only | PKG-D01 | helix-requirements | UI生成を選ぶ場合だけPKG-D02の該当Sliceを追加。既存Bundleのscope改版と検収は別途必要。 |
| PROFILE-DESIGN | Design | PKG-D02 | helix-design | 設計・modalityをexact選択。要求は外部の同契約入力でもよい。 |
| PROFILE-CI | CI-only | PKG-D06 | helix-dynamic-ci | 品質義務を入力contractで満たす。Full HELIX・UIL・Benchを同梱しない。 |
| PROFILE-QUALITY | Quality | PKG-D05 | helix-quality | 実行する検証profileを選ぶ。CI配置が必要なときだけPKG-D06を追加。 |
| PROFILE-REFACTOR | Refactoring | PKG-D13 | helix-refactoring | 分析だけと実変更を分け、実行・品質・統合の必要adapterを選ぶ。 |
| PROFILE-OPS | Lifecycle Ops | PKG-D10、PKG-D11、PKG-D12 | helix-lifecycle-ops | OPS固有の依存・実環境E2E成立まで候補。 |
| PROFILE-LITE | Lite | 未確定。exact setを個別検収する。 | helix-lite | 既存consumer_core_v1のparity・除外を保持して再対応付け。v0.6は収載集合を勝手に確定しない。 |
| PROFILE-AUTONOMOUS | Autonomous | 未確定。exact setを個別検収する。 | helix-autonomous-dev | 対象jobで計画・実行・品質・安全・統合が閉じる検収済み集合。resident全機能を名前だけで有効化しない。 |
| PROFILE-FULL | Full | 未確定。exact setを個別検収する。 | helix-full | 指定release時点で選択・検収した開発Package集合。全repo、HELIX成長、将来候補を含むという意味ではない。 |

## 4. バージョンの整理

v0.6は文書版であり、Packageの0.6.0を発行しない。前版が観測したcheckout 0.1.0、consumer_core_v1のprofile 1.0.0、Release/tag状態は履歴として残すが、この編集時点の現在値へ更新したとは扱わない。全候補のpublished_versionはnullのまま。 [V05]

| 変更 | 改版する対象 | 維持する境界 |
|---|---|---|
| カテゴリー名・対応表だけの修正 | 文書revision | Package・Module・Sliceの内容が変わらなければ製品版を変えない。 |
| 選択Sliceの互換修正 | 当該Sliceと影響するModule／公開実体のPATCH候補 | consumerのpublic contractから判定する。 |
| 後方互換の機能追加 | 当該公開実体のMINOR候補 | 未検収能力をstable構成へ暗黙追加しない。 |
| 公開CLI／schema／状態・許可モデル等の非互換変更 | MAJOR候補または明示済み0.x方針 | migration／共存／rollbackを先に定義する。 |
| 複数Packageの組合せlock変更 | そのBundle／Profileの互換性から採番 | 未変更のModuleを同じ番号へ一斉bumpしない。 |
| 必要な共通基盤の更新 | 依存する対象だけ再検証・必要改版 | 成長側の全検収を必須依存にしない。 |
| HELIX内部の学習・Bench・世代更新 | 内部knowledge／policy／source／評価系列 | 外部artifact・contractが変わらなければ外部版を上げない。 |
| 同じartifactを別environmentへ適用 | Deployment revisionとreceipt | Package版と環境適用版を混ぜない。 |
| 候補がrc／stableへ昇格 | 対象資格・証拠・公開状態 | channel・SemVer・artifact digestを別管理。metadataを変更して再配布する場合は再生成物を再束縛。 |

公開済みversionの内容を置き換えない。Packageと既存Bundleが同一の公開実体ならそのRelease versionを参照する。Profile versionは選択設定の版であり、Packageの公開versionへ流用しない。別Package番号とBundle番号を形式的に同期させる二重台帳を新設しない。将来Package独自の公開API・artifactを新設する場合だけ、正式な単位・owner・版契約を別途承認する。 [CUR11][V05]

## 5. 公開までの境界

```text
開発責務の提供契約
  → native owner／正式Sliceとの対応
  → 必要基盤・入力・出力・除外・consumerのexact scope
  → public contractと構成lock
  → build／static検査／consumer／独立review／更新・rollback
  → versionとartifact・証拠の束縛
  → 許可された公開工程
```

HELIX自身のRLS-R-09のR0〜R11は内部公開工場のprotocolとして保全する。これを全Packageの同梱runtimeにしない。通常利用時に公開工場・World Governance・成長側へ問い合わせない構成を検収する。 [CUR11]

## 6. 未確定は未確定で残す

正式Slice ID、Packageに対応するnative Bundle/Profile、path ownership、exact依存lock、公開版、実環境適格性は今回確定していない。Packageへの意味上の切分けは済ませたが、コードの物理分離や出荷用ビルドは別工程である。特にPKG-D09の対象製品Release、PKG-D07のModule対応、各Packageのgrowth-off動作は実証が残る。

## 出典

[DEC06]: DECISIONS_v0.6.md
[V05]: history/v0.5/HELIX_RELEASE_AND_GENERATION_RESEARCH_v0.5.md "旧版調査書（今回の入力には未同梱）"
[CUR07]: https://github.com/RetryYN/HELIX-HARNESS/issues/1494
[CUR11]: https://github.com/RetryYN/HELIX-HARNESS/blob/8f835e23c8d4110260d1eff97c9b167987bff37d/docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md
[CUR12]: https://github.com/RetryYN/HELIX-HARNESS/blob/8f835e23c8d4110260d1eff97c9b167987bff37d/docs/governance/release-module-bundle-rollout-roadmap.md
