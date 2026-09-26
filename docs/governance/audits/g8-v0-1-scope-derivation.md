# G8 v0.1段階構成の範囲導出監査

## 対象と結論

- 調査基準: base commit `b9fcc765377efb3fbbb5f7cc564fb39731d68149`（G7後）。入力候補のrevisionをここへ固定し、本PRの026は導出規則候補として別に参照する。文書参照をruntime自己依存と混同しない。
- 対象: HELIXOS-L2-014のv0.1段階構成候補。これはHELIX自身の内部段階識別子で、外部公開版、HARNESS製品⑥の配布版、tag、release許可ではない。
- 調査結果: 下記は要求された一周に対する**最小候補／未立証**であり、成立構成とは判定しない。最小性の比較空間が網羅されていないことと、個々の依存閉包の成立可否を分離する。文書内で追える依存辺は記録し、unknown/未接続辺を不足として示す。候補未採択、依存閉包の一部が未確認、実行/受入実績の証拠なしもそれぞれ別の状態である。
- 今回固定して比較する仕事: **既にauthorityのある単一の要求revisionと人が与えた差分指示から、HELIX-HARNESS内の一つの文書変更を作成し、該当する静的検査・意味review・受入結果を同じ要求revisionへ結び、失敗・未完義務も記録する**。要求の意味変更、外部操作、資格情報、顧客data、サービス配布は含まない。担当者は要求revisionと作業許可を確認し、意味判断が必要なら既存authority ownerへ返す。これは比較用の固定例で、現行の実作業、要求採択、最初の段階のscope決定を意味しない。
- 固定した分担: OS相当の管理・ticket・進行・証拠処理、Worker相当の変更作業、HARNESS相当の検証契約は候補機能として必要。人は既存authorityに従う要求確認・scope入力・意味判断、独立review、利用者受入、およびCI未構築中の検証実行を担える。人が代行しても、候補で宣言された依存契約、安全条件、独立した受入義務を省略しない。
- 最小性の比較空間: 下記の既読G1〜G7 L2/L11候補から、要求identity単位の境界を崩さない集合を比較する。各選択要素を一つずつ外したときの欠落は示すが、G1〜G7の全候補集合に対する網羅的探索や成立する複数の代替集合の証明はまだない。表示は「最小候補／未立証」である。

## 旧HELIX起点

先に読んだ旧sourceは、旧資産明細台帳の次の記録である。

| Asset ID | source / 行 | source SHA-256 | この監査で保持する意味 |
|---|---|---|---|
| `LEGACY-ASSET-201EED9C5D6D2FF4D41B` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md:23-67`（FRS-BR-001〜009） | `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | 明示収載・除外、独立した機能identity、依存と安全閉包、未知時停止、再現・rollback、機能成功から構成体成功を推定しない。特にFRS-BR-008/009は、必要な検証を保った限定先行利用と、安全依存閉包・統合/更新/rollbackの別判定を起点にする。 |
| `LEGACY-ASSET-67ADFAB856D954B3C5D2` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-acceptance.md:70-82`（BRとAC対応） | `bf3a5293a919a5b293ed5ac2c2f86a85539abbe7959ed9d66ea764922e868cee` | 要求条件と受入の対応を分け、runtime oracleの未実行を設計上の対応で隠さない。 |
| `LEGACY-ASSET-B75E46DBE77592351574` | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md:31-219`（FRS-R-01〜024） | `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | source authorityとexact revision/digest束縛、依存欠落時の拒否、局所検証とdependent closure、明示復旧先、必要な依存だけを含めて無関係な全基盤完成を待たないこと、publish/tag/cutoverを推定しない点を確認した。旧RLS/Module/Bundle/registry/builderを現行実装へ移さない。 |

保持点は現行HELIXOS-L2-014の「同じpackから組む」「狭くても一周」「安全依存を閉じる」「段階固有の受入・切戻しを別に確かめる」と一致する。変更点は、旧Slice/Module/Bundle名や旧実装・runtime・CIを持ち込まず、HARNESS-L2-010/011/022とG1〜G7の現在の候補identityを使うこと、および候補集合の証明が足りない場合に成立・最小性を主張しないこと。旧assetの未実装状態を変更理由にはしていない。旧assetの完全一致再利用ではなく、要求の意味を現行identityへ再導出する。

## 読んだ現行候補と母集団

| 系列 | 読んだ候補 / 受入 | 境界上の用途 | 調査基準SHA-256（文書全体） |
|---|---|---|---|
| HELIX-OS | `docs/helix-os/L2-requirements/governance-requirements.md`（base時点 `1c4d13fff300869fe66556c418be17247a41c6aa454a6da30cb64a2091e7ffd3`）、`docs/helix-os/L11-acceptance/governance-acceptance.md`（`cac2854be5c92f5927f9cdc5ddd077dd9920fa4a853ece12d28c93436eb056da`） | HELIXOS-L2-014、G1の015〜025と単体/接続/構成体候補・受入 | 上記 |
| HARNESS | `docs/helix-harness/L2-requirements/product-requirements.md` (`a19c526832ee2d08544346dc386a6364e6ee3a0dae01ae6fb382a9190ae9121c`)、`docs/helix-harness/L11-acceptance/product-acceptance.md` (`58a82f0bdcb5a7d7275524924e162c2b5317761b7a7865773ed13c92f94e0431`) | HARNESS-L2-010/011共通境界・呼出しと022コア検証/受入契約、既存7サービス等の除外判定 | 上記 |
| G2 SECURITY | `docs/helix-security/L2-requirements/security-requirements.md` (`027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c`)、`docs/helix-security/L11-acceptance/security-acceptance.md` | 方針/authority/隔離/credential/egress/Worker enforcementと停止伝播のowner境界 | L2 SHA上記 |
| G3 INFRASTRUCTURE | `docs/helix-infrastructure/L1-planning/infrastructure-intent.md` (`1673cf1333c762b817e1031cb610de90b6e967f7c2d851ab2a4b71e4959ebc37`)、`docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` (`cab7225b5461ba9a071c1397e75f6ee9e60511719c25342ca85627109c953730`) | 017 backup、018 restore、019 rollback、020独立復旧、022稼働構成identity、実資源のownerを確認。023は後版 | 上記 |
| G4 BRAIN | `docs/helix-brain/L2-requirements/brain-requirements.md` (`1cda52776f6306f6006d50c06c622b71dd6e6b141e4411974d1401666d933560`)、`docs/helix-brain/L11-acceptance/brain-acceptance.md` | 設計知識・knowledge状態のowner。固定した単一文書差分に必要な知識入力がなく、除外候補 | 上記 |
| G5 LABO | `docs/helix-labo/L2-requirements/labo-requirements.md` (`d5d1c6591b54819b65b56ba13b18a912a161e2ee4bff2116f2ebaa55260b6144`)、`docs/helix-labo/L11-acceptance/labo-acceptance.md` | HELIX-Bench水準のownerとWorker作業履歴の依存 | 上記 |
| G6 INTELLIGENCE | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` (`0f70488daf707b6cbc8cf4b382aac807987da1ad22e4a92da07149c74d34e0b0`)、`docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` | ticketごとのWorker配置案owner | 上記 |
| G7 CONNECT | `docs/governance/audits/g7-connect-source-connection-inventory.md`、`docs/helix-connect/L2-requirements/connect-requirements.md` (`d4e550eefa2bdb0b9e5b6aa0644db7486cc27bce4662025f3f73b33a7d077ffa`)、`docs/helix-connect/L11-acceptance/connect-acceptance.md` | 機構間の技術的handoff。G7 inventoryは9文書、293 source identity（明示connection 79、connection条件付きcomposite 23、共通pack descriptor条件を含むunit 2、その他unit/detail identity 174、Web補助Vision候補15）を記録する。source母集団は稼働endpoint一覧ではない | 上記 |

G8の導出規則候補HELIXOS-L2-026（`governance-requirements.md`末尾）と対のL11受入候補（`governance-acceptance.md`末尾）も読み、入力・固定基準・依存閉包・実行受入証拠・最小性を別に記録する条件を適用した。これらもcandidateである。

G1〜G7の候補は未採択で、候補本文・ID・L11案の存在は採用・実装・受入を証明しない。G7の棚卸し件数は全接続の実稼働数ではなく、HELIX-Web/WEB-OS補助Vision候補は内部機構のpackに含めない。

## 仕事範囲を満たす候補pack集合

ここでの「含む」は要求identity全体を候補集合に入れることを指す。候補が要求する能力を一部だけ物理実装する判断ではない。OS機能候補の境界が未確定・未採択であるため、物理pack分割や独自の薄い代替実装は選ばない。

| 含める候補identity | 粒度/owner | 閉じる仕事の義務 | 主な依存辺（source → target） |
|---|---|---|---|
| `HARNESS-L2-010`、`HARNESS-L2-011`、`HARNESS-L2-022` | HARNESS共通pack境界、呼出し契約、コアの検証・受入契約 | 宣言済み入出力・依存・版・検証範囲、呼出しscope、Provisional→Integrated→Verified→Acceptedの別証拠と意味差のBackflow | OS014 → 010/011/022。022はOSを必須依存にしない。OS020の計画/実行は022のoracleを変更しない |
| `HELIXOS-L2-015`、`016`、`017`、`018`、`019`、`020`、`023` | G1 OSの管理、Portfolio trace、ticket/workflow、Worker統制、evidence/continuity、検収実行、管理→推進→Worker→検収接続 | authorityある要求から変更ticket、実行、検証計画/結果、再開可能な記録への一周。019だけでは足りず、023は015〜020を要求する | 016 → 015。017 → 015/016 + HARNESS契約 + SECURITY authority、INT/LABO材料。018 → 017 + SECURITY制約 + INFRA資源 + LABO水準 + INT配置案。019 → 015/018 + 共通ログ/証拠 + 機構間接続。020 → 016/017/019 + HARNESS検証契約 + SECURITY + INFRA。023 → 015〜020の関係する単体とSECURITY/INFRA境界 |
| `HELIXINTELLIGENCE-L2-010` | G6 INTELLIGENCEのWorker配置候補単体 | OS018に必要なticket別配置案。案は割当てではない | OS018 → INT010。INT010 → ticket/task identity + LABO task-class evidence + Worker実績。OS017はこれに加えINT005計画案を使うcaseではその候補も必要 |
| `HELIXLABO-L2-055`、そのINT接続 `HELIXLABO-L2-054` と依存 `HELIXLABO-L2-001`、`028` | G5 LABOのBench水準・観測入力・INT接続 | task/model classの根拠付き水準・未評価状態をINT010/OS018へ同じscopeで渡す | OS018 → LABO水準。LABO055 → observation L2-001/028（必要時006） + Worker history。LABO054 → 055結果 + INTELLIGENCE connector。水準を人が作っても、LABOのsource/範囲/evidence義務を代行物に保持する |
| `HELIXSECURITY-L2-001/003/004/005/006/007/008/009/015/016` と `HELIXCONNECT-L2-001/002/003/004/005/006`（候補集合） | G2 SECURITYの信頼入力・隔離・設定integrity・credential/egress・Worker制約・operation authority・停止伝播・asset分類、およびG7共通connector境界 | authority、隔離、実行制約、data/asset分類、技術的handoffと停止/receipt | OS014 → SECURITY credential方針。OS017/018 → SECURITY authority/制約。SECURITY007 → 003/005/006/008 + OS/Worker/INFRA。SECURITY005/006 → authority/egress/Worker/INFRA/CONNECT等。SECURITY009 → OS/Worker/CONNECT/credential/artifact/INFRA。OS019/023 → 対象connectorと両端の版・receipt。G7 inventory L36でHELIXOS-L2-023 → HELIXCONNECT-L2-001..006を記録 |
| `HELIXINFRASTRUCTURE-L2-001/002/003/005/006/007`（候補集合）とL1-017/018/019/020/022 | G3 INFRASTRUCTUREの資源/環境/desired-actual/runtime drift、capacity、backup/restore/rollback、独立bootstrap/recovery、再構築、構成識別 | OS/Workerに使う資源状態、段階構成のbackup/restore/rollback/self-independent boot/recovery | L2-001 → approved Harness Core design/resource identity。002/003 → 001。005 → 001/002 + owner/restore environment。006 → 005 + 独立resource + SECURITY authority。007 → 001/005/006 + approved design/artifact/data evidence。これらはOS014が要求するL1能力に対応するが、該当artifact/環境受入証拠はない |

014が明示する段階構成の依存と実行能力は、HARNESSの三つの共通契約と上表の一周に必要なものを同じ候補構成に含める。これによりHARNESS-L2-021の「統合したHARNESS全体」や全7サービス完成を要求せずに済む。OS019を採る場合も機構間接続契約の必要性を消さない。

### 選択母集団のidentity追跡と非収載能力

次表は既読のG1〜G7 L2 identityを収載/非収載へ振り分けたもの。既存条件を束ねた候補は元条件を参照したまま数え、元条件を重複packにしない。非収載の独立能力はこの候補構成では使えない。依存が必要と判明した場合、非収載を人作業で置換せず、scopeと閉包を再導出する。

| 機構 / 既読identity母集団 | v0.1候補に収載するID | 非収載IDと、この範囲ではできないこと |
|---|---|---|
| G1 HELIX-OS: `L2-001..026` | Runtime candidate: `015..020`, `023`. `014`は段階要件として参照し、`026`は導出unitとして別判定 | 独立packに数えない参照元: `001..013`。015〜020/023が束ねる元条件は保持し、012/013のLABO移管を戻さない。非収載の能力候補: `021`, `022`, `024`, `025`。HARNESS構成版のproject配布/更新/復旧、改善候補還流、HARNESS提供からLABO/OSへの循環、OS統合運転はできない。`014`はruntime packでなくcomposite受入、`026`はruntime能力でなく候補構成導出を受け入れるunitである |
| G2 SECURITY: `L2-001..028` | `001`, `003..009`, `015..016` | `002`, `010..014`, `017..028`。命令様data/prompt injection対策、security pack更新/能力drift/supply chain/artifact update/promotion、semantic exfiltration/probing/core asset egress、guard/Bot境界、SECURITY固有の外部受渡し/authority composite/更新promotion/INFRA connection/WEB境界/INTELLIGENCE判断連携をこのscopeで運転・受入できない。対象を広げる場合は該当security identityを閉包へ追加する |
| G3 INFRASTRUCTURE: `L2-001..026` | `001..003`, `005..007`（L1 `017/018/019/020/022`を含む受入対応） | `004`, `008..026`。runtime incident/observability、CORE設計からdeployment targetへの接続、OS Work/Change接続、episode相関、段階変更、portability/location/cost/freshness/Web配置、1.0構成体、自動failover、Worker実行操作、INTELLIGENCE資源判断などはこの候補では使えない。特に承認済CORE design参照はL2-001の必要入力として残り、L2-008を含む採択済み接続版が確認できないためdeployment target mappingは未解決。実Worker操作がINFRA resource changeを含む場合はL2-010相当のauthority/Worker構成体がなく、本候補の範囲外で停止する |
| G4 BRAIN: `L2-001..012`, `L2-INFRA-001..017`, `L2-018..028` | なし（固定scopeはBRAIN知識を参照しない） | 母集団全IDを非収載。設計知識/Pattern/Infra知識、製品Coreへの再利用候補、LABO/INTELLIGENCE/COREへの知識受渡し、required input接続、独立検証/採否、外部知識取込み、descriptor互換を使えない。INFRA-L2-001が承認済HARNESS-CORE designを必須入力としているため、それがBRAIN知識に依存する場合は本候補の閉包にBRAIN identityが欠け、成立扱い不可 |
| G5 LABO: `L2-001..042`, `L2-050..055` | `001`, `028`, `054`, `055` | `002..027`, `029..042`, `050..053`。複数episode相関/分解/実験/比較/feedback、各source別集積connection、広い改善循環/外部知識/学習評価循環はできない。選択した055の水準をINTへ渡すには054を含めるが、その先の広範なLABO循環は含めない |
| G6 INTELLIGENCE: `L2-001..026`, `030..045`, `060..065` | `010` | `001..009`, `011..026`, `030..045`, `060..065`。一般の状況model、計画、予測/診断/review/audit、model適性比較、不確実性理由追跡、Bot/repair、INTのsource別connectionと自動計画/継続改善はこのscopeで行えない。配置候補の入力不足を人が補う場合も、選択した010の根拠/未評価/OS割当境界は維持する |
| G7 CONNECT: `L2-001..007` | `001..006` | `007`。複数機構を一つのcompositeとして結ぶ統合connection acceptanceは行わない。各source edgeの上位composite成立はHARNESS/OS等のownerへ残し、CONNECTの通信成功から推定しない |

HARNESS共通pack候補（G1〜G7 identityとは別枠）は`HARNESS-L2-010/011/022`のみを選択する。`HARNESS-L2-001..009`のうち010/011/022が参照する既存条件は保持し、別packとして重複収載しない。`012..021`の7サービス製品機能、フルリバース、製品間受渡し、全体統合はこの一文書変更の候補集合へ含めない。人による独立reviewと022の受入義務は除外しない。v1.0の全7サービス/INFRA最低18要求の目標は保持し、この候補表の収載範囲へ縮めない。

## 依存グラフ、閉包不足、実行可能性

### 依存の種類

次の辺は同一の「自己依存」判定にまとめない。

| 辺種別 | 判定する内容 | この監査で分かったこと |
|---|---|---|
| 要求/authority source reference | 他機構の要求、source revision、decision recordを読む参照 | 参照循環だけではboot/runtime自己依存を意味しない。出所を追う参照は保持する |
| pack契約/型依存 | 入出力、契約版、成果物版、依存版、互換範囲、検証範囲 | HARNESS-L2-010/011/022とG1〜G7候補には必要な契約が書かれているが、候補未採択で実版・artifactがない。契約版の一致は確認できない |
| 運用/データ依存 | ticket、要求revision、実行記録、checkpoint、data-use、未完義務の受渡し | OS015/017/018/019/023が関係する。stage用設定・データ形式・記録移行/再開の対応証拠は未作成 |
| 安全/authority依存 | 実行・credential・network・対象scopeを許可/拒否するownerとenforcer | OS018はSECURITYとWorker環境を依存し、INFRA資源も依存する。必要なSECURITY identity集合に未解決の相互edgeがあるため安全閉包を成立扱いできない |
| 起動/更新/復旧の実行前提 | その段階の起動・更新・復旧時に実際に呼ぶ実行環境、資源、artifact | HELIXINFRASTRUCTURE-L1-020と014が要求する。前段階から次段階を作る起動/restore/rollback実証がない。作業tree、次段階、稼働中の別段階を前提にしないことは未証明 |

### 依存閉包で確かめた辺と不足する辺

1. **OS→INT/LABO**: OS018はLABOのmodel-class水準とINTELLIGENCEの配置案を必須依存として列挙する。OS017のINT plan案/LABO水準は「提供される場合」の入力であり任意扱いだが、018を人分担の一言で省略してはならない。選択したLABO055→054→INT010の意味edgeはG7 inventory L42でCONNECT 001/002/003/005/006へ対応づけられる。候補の出力が与えられれば人が役割を実施できる可能性はあるが、その代行出力の入力・版・scope・受領証拠を固定する契約、許可されたBench履歴、Worker実績はまだ示されていない。
2. **LABO→観測/Worker履歴/INT**: LABO055はLABO001/028の許可されたobservationとWorker historyを必要とし、LABO054が水準・根拠・適用scope・未評価をINTへ渡す。該当sourceの可用revision、data-use許可、評価範囲、未評価状態を束ねるG5受入記録と、LABO054/INT connectorの実版・receiptはない。少数一件の手作業でLABO/BENCH能力を別名化・縮退してはならない。
3. **SECURITY→Worker/INFRA/CONNECT**: OS017/018の権限・制約境界だけを持ち込めば十分とは判断できない。SECURITY-007は003/005/006/008、OS、Worker、INFRAを参照し、005/006も相互のcredential/egress、CONNECT、INFRAを参照する。候補本文が要求する全境界を保持した上で、実行時制約、操作authority、資格情報なしの経路、止め方の主要な辺は候補identity上で対応づけたが、更新前提の未収載能力（下記10）があり、authority/adoption、互換version、実行時receiptはunknownである。
4. **OS019/023→CONNECT**: G7 inventory `g7-connect-source-connection-inventory.md` L36に、`HELIXOS-L2-023 → HELIXCONNECT-L2-001..006` の技術接続mappingがある。L49–53は共通edge identity、version/stale、配送/receipt、部分完了・未完義務を補い、接続先業務意味はOSへ残す。この監査はその対応を候補集合へ適用した。個別の契約/成果物version、両端の採択済みrevision、実送受信とreceiptの実行証拠はunknownであり、文書mappingが未実施という不足ではない。
5. **OS020→HARNESS実行**: HARNESS022契約とOS020の実行計画/CI機能は別責務。現在の新世代CIは未構築なので、OS020の実行能力としての証拠はない。人は、HARNESS022のoracleを変えず、固定された検証手順の実行・結果の提示を担えるが、これはOS020の実装/受入済みを意味しない。v0.1はCI未成立を「できないこと」として示すか、同じHARNESS契約を使う独立した人の検証手順と成果証拠を明示し、検証責務を落とさない。
6. **G3起動・復旧→自己独立性**: INFRA L1-017/018/019/020/022はbackup/restore/rollback、停止時にHELIX自身を使わない復旧、稼働構成の識別を要求する。設定の存在ではなく実際のrestore→完全性→依存再接続→起動→検証と、旧適格状態への復帰が必要だが証拠はない。INFRA L1-023（変更を候補→隔離→部分適用→昇格する能力）は1.0より後であり、この閉包にも加えない。
7. **stage-specific versions/state**: 選択候補の契約/成果物/依存version、互換範囲、設定/data schema、対応環境、candidate/active構成、rollback先が未生成。`version_target:1.0`はv0.1への収載禁止を意味しない一方、実versionや適格性を与えもしない。
8. **INFRA→HARNESS/BRAIN設計入力**: INFRASTRUCTURE-L2-001/005/007はapproved Harness Core designと対象state owner/artifactを参照する。今回の文書差分だけでは、承認済みの設計revision、設計artifact、owner、restore environmentは提示されていない。HARNESSの設計単位や必要なBRAIN知識を推測で部分収載せず、source/design input edgeとして未解決に残す。
9. **HARNESS022→対の設計/oracle**: HARNESS-L2-022はL2/L11、L3/L10、L8/L9の対と、構成体固有のsystem oracleを入力に取る。HARNESS-L2-010/011/022を含めただけでそれらの対象revision・verification profileまで揃ったとはいえず、今回変更する文書の対とoracle exact setが未指定である。
10. **SECURITYの更新前提→選択外能力**: SECURITY L2本文の共通前提（32–33行）は、SECURITY更新時にL2-010の更新受入とL2-013のartifact integrityを適用する。これらとpack版への束縛028は上の初期選択に含まれていない。したがって014の段階更新・切戻しまで満たす安全閉包は、文書上も未完である。010/013/028及びその依存を追加して再導出する必要があり、単に実装証拠が無いだけとしない。文書入力を読むWorkerに命令様dataを渡す場合も、非収載002の境界が必要になる。初期案の狭い仕事を理由にこの不足をoptional化しない。

候補要求の文面上ではOS015〜020の依存先をOS候補集合へ含め、LABO055の明示的な観測依存001/028とLABO054のINT受渡しも集合へ含めた。INFRA L2-001/002/003/005/006/007とSECURITY/CONNECTの該当identityも、既存source-to-connector mappingを参照して対応づけた。要求文書上のidentity mappingは確かめられるが、依存版・authority/adoption・一部のHARNESS Core design、実環境・execution receiptがunknownなので、「段階で使う依存closureが充足済み」とは扱わない。最小性が未立証だからclosureを否定するのではなく、更新前提の未収載能力と、個別edgeのauthority/version/runtime証拠がunknownで成立を保留している。

文書依存とruntime bootstrappingも分けた。source参照が循環していてもそれだけでは自己依存ではない。逆に、未release作業tree、次段階、稼働中の別段階を使わずに起動・更新・復旧できるかはINFRA L2-005/006/007の実環境受入がないため未立証である。

## 除外候補と除外時に失うもの

| 除外する候補/範囲 | 今回の固定仕事で除外できる根拠 | 同じ仕事範囲を変えた場合の欠落 |
|---|---|---|
| HARNESS-L2-012〜018（サービス①〜⑦）、HARNESS-L2-019フルリバース、HARNESS-L2-020サービス受渡し、HARNESS-L2-021統合HARNESS | 既存のauthorityある要求revisionをそのまま受け、HARNESS製品群の作成・配布・運用や全工程横断をしない。022は④の開発を必須にしない。 | 画面/PoC、要求形成、設計、production開発、対象製品release、全7サービス間handoff、HARNESS全体の構成体固有端から端受入が必要なら不適格な集合となる。 |
| OS-L2-021/022/024/025 | HELIX自身のstageと対象project向けHARNESS配布は別identity。今回の一周はproject配布やLABO改善還流まで扱わず、全OS複合運転も対象外。 | 外部projectへのHarness提供/更新/復旧、運用評価からLABO/OSへの改善循環、全対象portfolioやOS構成体の成立は証明できない。 |
| BRAINの要求identity | 固定仕事は意味・設計知識の創出やBRAIN knowledge照会をしない文書差分に限定する。INFRAのL2-001が承認済みHARNESS Core designを要求する点は別途不足として残し、その設計入力をBRAINが所有する場合はBRAINの該当候補を依存に追加して再照合する。 | BRAIN knowledgeを設計根拠として引く仕事では、BRAIN source revision/evaluation/acceptanceとの接続を加える必要がある。現時点で「BRAIN全機構が不要」とは主張しない。 |
| 外部ネットワーク、資格情報、顧客/案件実data | 固定scopeの作業入力と結果は非秘密の文書revisionに限定する。stageに案件data、秘密、資格情報を含めない（014）。 | これらの操作やdataを含むscopeに変えた場合、SECURITYのauthority/credential/egress/data-classification閉包とINFRA backup/migrationの受入を追加しない限り停止する。 |
| HELIXINFRASTRUCTURE-L1-023、全7製品/全18 INFRA最低範囲の完成 | 023は1.0より後。v0.1は必要な安全依存だけを閉じ、無関係な完成待ちはしない。 | INFRAの全1.0範囲やHARNESS全製品の完成はv0.1成立の条件ではない。14の必要な安全/復旧/構成識別が欠けたままなら、狭いscopeでも成立しない。 |
| 旧HELIX runtime/CLI/hook/CI、old FRSのSlice名、stageの別系統簡易実装 | 現行要求は旧runtime fallbackを禁止し、HARNESS現行pack契約から組む。 | 代用しても現行要求の受入証拠にはならず、旧sourceの意味再導出にもならない。 |

## 一要素ずつ外したときの義務欠落

この比較は上記の一つの固定仕事・人分担・候補identity境界を変えない。最小性を全候補空間について証明する表ではない。

| 候補要素を外す | 直ちに欠ける義務 | 判定 |
|---|---|---|
| HARNESS-L2-010 | 入出力・必要依存・検証範囲・版・所有・再現/切戻しをpackとして宣言できない | 同じ仕事をpackから構成できず不適格 |
| HARNESS-L2-011 | UI/作業環境から切り離した呼出し、明示権限scope、進行/結果/証拠、停止・冪等再開の共通契約がない | 同じ仕事の実行境界・再開を説明できず不適格 |
| HARNESS-L2-022 | verification stage、system-specific oracle、利用者acceptanceを区別する契約がない | 検証・受入を一周とみなせず不適格。人の実行はこの契約を省略できない |
| OS-L2-015/016 | 要求authority、対象revision、依存/影響状態の入力・追跡が欠ける | 要求確認と対象束縛が不成立 |
| OS-L2-017 | 実行可能なticket/scope/受入義務/戻し先を固定できない | 指示から作業への接続が欠ける |
| OS-L2-018 | assignment/attempt、Workerの制約、交代・独立reviewへのhandoffがない | 「作業」の責務・scope・実行証拠が欠ける |
| OS-L2-019 | request/decision/change/verification/result、未完義務/再開情報のprovenanceがない | 結果記録・継続性が欠ける |
| OS-L2-020または022を満たす明示的な人の検証手順/証拠 | HARNESS oracleの実行結果が欠ける | 検証責務が抜け、成立しない。新世代CI未構築を合格扱いしない |
| OS-L2-023または対象端点間の別個の明示handoff証拠 | 管理→推進→Worker→検収のscope/因果/未完義務/受領を結べない | 必要なconnection証拠が欠ける |
| SECURITY-L2-001 | untrusted requirement/input sourceのidentity・revision・authorityを保持できない | 入力の信頼境界が欠ける |
| SECURITY-L2-003/004 | project/environment/assignment隔離、exact config/HEADのintegrity確認が欠ける | 対象scopeと実行構成を確定できない |
| SECURITY-L2-005/006 | credential利用境界とegress destination/data class/purpose/authority照合が欠ける | secretなし・許可先限定の条件を示せない |
| SECURITY-L2-007/008 | Workerへ制約を適用・観測する経路、operation単位のauthorityが欠ける | 人/Workerどちらの実行も許可・制約を証明できない |
| SECURITY-L2-009 | revoke/unknown等の停止・quarantine伝播が欠ける | 安全停止時に割当・実行・CONNECTを一貫して止められない |
| SECURITY-L2-015/016 | asset identityとexposure classification基盤が欠ける | source/artifactのowner・revision・利用区分/unknownを記録できない |
| INFRASTRUCTURE-L2-001 | resource/topology/environment identityとapproved Harness Core design参照が欠ける | 適用環境、依存資源、stage再構築入力が確定しない |
| INFRASTRUCTURE-L2-002/003 | desired/actual/drift、容量・実行資源の観測が欠ける | Worker/検証の実行可能性を判定できない |
| INFRASTRUCTURE-L2-005 | 実restore・rollback適格性が欠ける | 前の適格状態へ戻せる根拠がない |
| INFRASTRUCTURE-L2-006 | HELIX control planeと独立したbootstrap/recoveryが欠ける | HELIX停止時の自己非依存復旧が証明できない |
| INFRASTRUCTURE-L2-007 | 独立環境でのruntime rebuildabilityが欠ける | 同じ選択構成を再現・検証できない |
| LABO-L2-001/028 | 許可されたobservation、Worker結果とticket/assignment同一性保持が欠ける | LABO055の水準入力に追跡可能な根拠がない |
| LABO-L2-055 | Worker historyから作業種別/model class別の水準・評価範囲・未評価状態が欠ける | INT010へ根拠ある配置材料を渡せない |
| LABO-L2-054 | Bench水準/根拠/scope/未評価状態のLABO→INT handoffが欠ける | INT010の入力を専用edgeで追跡できない |
| INTELLIGENCE-L2-010 | task capability/過去実績に基づく配置候補が欠ける | OS018のassignment材料を作れない。人が割当判断を代行しても同じ候補義務は残る |
| CONNECT-L2-001 | edge identity・両端契約登録が欠ける | source/targetと契約を特定できない |
| CONNECT-L2-002 | version互換/stale再検証が欠ける | 端点変更後に通信継続可否を判定できない |
| CONNECT-L2-003 | operation/契約revisionに束縛した通信が欠ける | 契約外入力を排除したedge実行を記録できない |
| CONNECT-L2-004 | bounded/idempotent retryが欠ける | このedgeで再送が必要な場合に重複効果を防げない |
| CONNECT-L2-005 | attempt、部分失敗、receipt追跡が欠ける | 未完operationとowner返却先を引き継げない |
| CONNECT-L2-006 | 片側交換後の互換照合/fail-closeが欠ける | 変更後の固定側と端点の互換を証明できない |

各候補を外すとこの固定例に対する義務が欠けるか、未解決依存が再発する。代替構成の具体比較として、(a) OS014+HARNESS010/011/022だけでは要求→ticket→作業→結果記録のownerがなく空の構成に近いため不適格、(b) OS015/017/019にWorkerを含めず人手の差分だけを記録する案はOS019が明示する018依存を外すため不適格、(c) OS015〜020/023とHarness共通契約だけに限定してSECURITY/INFRA/LABO/INT/CONNECTを落とす案は必要な安全・資源・配置・connector境界を失うため不適格、(d) G1〜G7全機構とHARNESS全7サービス・全体構成を含める案は固定された一文書変更に不要な設計知識、製品release、運用保守、改善循環まで持ち込み、今回の目的と候補境界に対し過剰である、の四案を比べた。(a)〜(c)は不足/義務欠落で除外、(d)は必要最小範囲より過剰で除外する。ただし現行candidate pack境界の候補空間を完全列挙したものではなく、等価な構成がない証明でもないため、**最小性は未立証**とする。

## 要求確認から記録までの経路と人の分担

| 順 | 処理とowner | 人/packの分担 | 必要証拠・停止条件 |
|---|---|---|---|
| 1. 要求確認 | OS管理候補015/016 | 人がsource authority ownerと要求revisionを示す。OS候補は対象・revision・digest・判断source・scope・影響を登録する | identity/revision/digest/authorityが不足、stale、conflictなら作業開始しない。PR/Issue/会話で要求採択を作らない |
| 2. 作業計画/発行 | OS017、INT010、LABO055/054（と055のobservation入力） | 人が既存の意味判断、予算/期限/scope等を必要な範囲で入力する。LABO054が水準をINTへ渡しINTが配置案を返す契約がなければ人は出力を受け渡せるが、そのsource・根拠・未評価状態を記録する。OSが許可/契約/依存を照合してticketを発行する | LABO/INT入力がunknownならassignmentをreadyにしない。BRAINの設計知識は固定scopeでは使わない |
| 3. 変更 | OS018、Worker実行境界、SECURITY/INFRA | Workerが限定scopeで差分を作る。人が実行する場合も同じscope/head/権限・成果記録・独立review義務を保つ。OSは資源正本やSECURITY authorityを代替しない | 操作authority・実行環境・resource・HEAD・期限・budget・lease不一致なら停止。secret/PIIを記録しない |
| 4. 検証・受入 | HARNESS022、OS020、review/受入担当 | HARNESSがoracle/戻し先を定め、OS020がCIを運転する。新CI未構築中は人が同一oracleを実行し、exact revisionの結果を記録する。作成者と独立review/acceptanceを分ける | pack単体passから接続/composite passを推定しない。契約・oracle欠落、結果未観測、unknown/staleは不合格/未完 |
| 5. 結果記録・再開 | OS019とOS023、CONNECTの対象handoff | source revision、要求、作業、検証、finding、受入、失敗、未完義務を相関IDで結ぶ。人は利用者受入と判断を記録し、OSが投影/continuityを保持 | 欠落/重複/stale/拒否/未実行を成功から区別。過去適格段階への復旧先と次段階への引継ぎstateが必要 |

これは依頼から受入証拠・結果記録までの**論理的な一周**である。実装・テスト・handoff・復旧の稼働証拠は未存在で、一周が動いたとは述べない。

## 使用する受入候補と現況

以下は選択した要求identityに対する既存L11の文書上の対応である。受入は候補記述であり、採択済み要求revisionへの適用、適合する実pack version、試験実行、result receiptは確認できていない。「文書mapping済み」と「実行/受入証拠unknown」を分ける。

| 選択した要求identity | 対応する既存L11受入identity | この一周で確認する受入義務 | 文書対応 / 実行状態 |
|---|---|---|---|
| `HELIXOS-L2-014` | `HELIXOS-L2-014` (`docs/helix-os/L11-acceptance/governance-acceptance.md:317`) | 同じ構成の再現、限定範囲の一周、人の分担、次段階の構築・検証、rollback/状態引継ぎ、自己依存なしの起動・更新・復旧、1.0到達との分離、未成立能力の表示 | identity対応済み。実行・受入証拠unknown |
| `HARNESS-L2-010` / `011` / `022` | 各同ID (`docs/helix-harness/L11-acceptance/product-acceptance.md:205`, `:206`, `:217`) | pack境界・依存・version・検証範囲、非UI呼出しとscope、証拠段階/構成体oracle/acceptanceの区別 | identity対応済み。実pack version・実行証拠unknown |
| `HELIXOS-L2-015` / `016` / `017` / `018` / `019` / `020` / `023` | 各同IDの未実行受入 (`docs/helix-os/L11-acceptance/governance-acceptance.md:324`, `:331`, `:338`, `:345`, `:352`, `:359`, `:380`) | authority/依存trace、ticket入力の再現性、Worker制約と独立handoff、provenance/continuity、CI計画/実行責務、管理→推進→Worker→検収の接続 | identity対応済み。新CI未構築でL2-020の実行能力証拠なし。その他も実行証拠unknown |
| `HELIXSECURITY-L2-001/003/004/005/006/007/008/009/015/016` | 各同ID (`docs/helix-security/L11-acceptance/security-acceptance.md:25`, `:27-33`, `:39-40`) | untrusted source識別、隔離/構成integrity、credential/egress、Worker制約、operation authority、停止伝播、asset分類とunknown保持 | identity対応済み。選択scopeのauthority/adoption・実環境・実行receipt unknown |
| `HELIXINFRASTRUCTURE-L2-001/002/003/005/006/007`（L1 `017/018/019/020/022`） | 各同ID (`docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:34`, `:44`, `:54`, `:74`, `:84`, `:94`)。L2-005はL1-017/018/019、L2-006はL1-020、L2-001はL1-022を含む (`docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md:36`, `:76`, `:86`) | topology/構成識別とdesired/actual、資源、実restore/rollback、HELIX独立recovery、rebuildability | identity対応済み。approved design、対応environment、実restore/bootstrap/rebuild証拠unknown |
| `HELIXLABO-L2-055`、`054` と依存 `001/028` | `HELIXLABO-L2-055`, `054`, `001`, `028` (`docs/helix-labo/L11-acceptance/labo-acceptance.md:56`, `:94`, `:45`, `:79`) | 成功/失敗/unknown等をsource revisionと保持、Worker履歴から水準・根拠/評価範囲/未評価を生成し、同じscopeでINTへ渡してticket/assignmentへ照合 | identity対応済み。許可済みobservation、Worker history、評価receipt、INT connector実行証拠unknown |
| `HELIXINTELLIGENCE-L2-010` | `HELIXINTELLIGENCE-L2-010` (`docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:71`) | capability/過去実績に応じた配置候補。未評価・evidence不足時は保留し、割当をOSに残す | identity対応済み。候補実行、入力評価evidence unknown |
| `HELIXCONNECT-L2-001/002/003/004/005/006` | `HELIXCONNECT-L11-001/002/003/004/005/006` (`docs/helix-connect/L11-acceptance/connect-acceptance.md:32-37`) | 接続identity/両端契約、version/stale照合、契約束縛通信、冪等再送、部分失敗追跡、片側交換時のfail-close | identity対応済み。採択済み端点revision・互換version・実handoff/receipt unknown |

新しいG8導出受入はOS-L2-026候補の対L11を使い、導出結果から採択・実装・releaseを生成しない。OS-L2-026は導出能力そのもののunit受入であり、出力された段階構成のcomposite受入はOS-L2-014の別判定である。

対象revision、oracle、実行者、結果、証拠、使用HARNESS契約versionを揃えた受入結果は存在しない。この文書は受入試験を実行した記録ではない。

## できること/できないことと次に必要な証拠

### この候補範囲でできること（候補上の約束）

- authorityのある一つの要求revisionから一つの許可された文書差分へscopeを限り、Worker相当の作業、既存oracleに基づく検証、独立review、人の受入、同じrevisionへの結果記録・再開情報を束ねる。
- 必要な機構を境界のまま選択し、宣言済みの依存・安全閉包だけを含める。パック構成、構成結果、要求採否は別記録とする。
- 検証工程が自動化されていないとき、人が同じ受入契約の実行役を担う案を立てる。人分担はauthority判断を新設せず、既存判断者が持つ意味を維持する。

### できないこと

- 現状の候補群を稼働するv0.1として起動/更新/復旧し、次段階へ実際に移行してrollback read-afterすること。identity/version/依存・設定/data形式/対応環境/backup/restore実証がない。
- 新世代CIを動かすこと、旧CIを代用すること、OS020のCI実行を人の手作業で「実装済み」と主張すること。
- 未採択L2/L11候補、HARNESS/OS/SECURITY/INFRA/LABO/INT/CONNECTの候補存在だけから要求意味・採用・権限・実装許可・利用者acceptanceを生成すること。
- 外部配布、public release、tag、cutover、対象projectへのHARNESS構成版配布、実データ/資格情報の移行、HELIX-Web 7製品の一部または全部の利用をv0.1から生じさせること。
- 本候補をv1.0の達成とすること。v1.0の目標（HELIX-HARNESS Version 1の7サービスすべて、HELIX-INFRASTRUCTUREの1.0最低18要求を含む）を保ち、段階を理由に削減しない。

### 段階成立を判定できるようにする不足

1. 固定仕事の具体的なsource requirement revision、exact diff、適用environment、権限、利用者acceptance authorityを入力して監査基準を具体化する。
2. OS-026導出結果の比較空間を拡張し、境界を保つ代替構成を実際に列挙・比較して最小性を立証するか、最後まで「最小候補／未立証」とする。
3. 各選択候補のauthority/adoption revision、pack identity、契約/成果物/依存version、互換範囲、artifact、scope、設定/data形式、対応環境を同じ構成recordで束縛する。
4. G2/G3/G5/G6/G7の必要安全・配置・接続dependency closureをowner/contract/receiptごとに閉じ、unknownを解消する。安全条件欠落時に人運用へ押し付けて合格にしない。
5. 前段階の別environmentで次stageを構築し、exact HARNESS022 oracleと受入を通す。backupではなく実restore/rollbackを実行し、HELIXなしでの起動・点検・復旧、状態/記録引継ぎ、artifact・構成revision一致をread-afterする。
6. その後の独立reviewでfindingを修正し、段階構成の正確な証拠とv1.0到達記録を分離する。tag・外部配布の許可はこの導出や成立から生成しない。

## 状態・境界

本監査は旧FRSを読み起点とした範囲導出判断材料であり、旧runtimeの実行・資産copyはしていない。本監査から要求の採択やruntime操作を生成していない。候補の未採択状態、実行可能性、受入証拠不足を保ったまま残し、具体的な段階構成の採用・実装・受入・外部作用を決めない。
