# Concept v4.1・対象別L1 人間判断packet

prepared_at: 2026-09-14
revision_binding: exact SHA-256 in this packet
status: review_refresh_pending
latest_repository_review_head: `1d44da71f3757c362771ae80820ab495110c2af9`
latest_repository_review_result: blocker_0_finding_0
current_revision_review_status: requirement_engine_delta_review_pending

## 判断の目的

本packetは、HELIXの新世代上流をGitHub Issue、PR、CI、既存実装から推定せず、exactなローカル文書revisionに
対して人間が判断するための入力である。remote branchへの同期、許可されたreview通路の結果、静的検査は判断材料であり、
承認を自動成立させない。

## 何を判断するpacketなのか

人間に判断を求める内容は、文書IDやSHAそのものではなく、次の製品方針である。

| 平易な判断事項 | 採用した場合 | 採用しない場合 |
|---|---|---|
| 外部へ提供する製品をHARNESSとする | V-model、工程、検証契約、利用条件をHARNESSへまとめる | 外部提供物のidentityを別途定義し直す |
| HELIX-OSを内部の管理・統制・継続改善機構とする | HARNESS自己適用、authority、Worker、log、CI、学習、改善、配布運転をOSへまとめる | 管理・統制・HARNESS改善ownerを別途定義し直す |
| HELIX-WebをOSが管理する個別製品とする | Web固有の利用要求を持ち、OSの管理UIへ還元しない | Webの位置づけを別途定義し直す |
| HELIX-Web-OSをHELIX-OS外へ置く | Web展開後のservice runtimeを分離し、許可logをHELIX-OSの改善loopへ接続する | Webサービスの運転ownerと改善接続を再定義する |
| Version 1をHARNESS製品群の完成境界とする | 複数プロダクトの実開発とHELIX自身への適用でHARNESSを検証し、その完成をWeb展開の必須前提とする。Web自体はVersion 1完成分母に入れない | Web展開の依存関係とVersion 1の範囲を再定義する |
| GitHubを作業・共有・証拠の投影先とする | ローカルの対象別Concept／L1／L2等を意味正本にする | Issue／PR等のどこが意味正本かを再定義する |
| 現行資産を参考資料へ退役し、新世代を上流から再構築する | 旧CI・runtime・AI文書を非実行archiveへ先に隔離し、baselineにせずarchive sourceから意味を採取する | 維持する旧実行系と互換範囲を別途決める |
| 要求エンジンをHARNESS能力、企画との齟齬管理をHELIX-OS責務とする | 単体・接続・構成体を分けて要求候補を形成し、OSがConcept／企画から採用要求までの欠落・追加・対象違いを管理する | 要求形成能力と、その出力・改善logを管理するownerを別途定義し直す |
| Design TemplateをHARNESS能力、版・適用・改善管理をHELIX-OS責務とする | 初期seedから必要設計を導き、必要な要求入力の不足を上流へ戻して、複数projectの結果からtemplateを改善する | 初期設計知識と継続改善ownerを別途定義し直す |
| 駆動モデルをticket tagとして推進がworkflow生成する | 管理が目的・要求・制約を推進へ渡し、推進がPoC、UI prototype、Featureを別ticketに分解して、直交tagとHARNESS版から工程・pair・oracle・backflowを生成する | 固定modeまたは別のworkflow選択・生成方式を定義し直す |

これら10点は、2026-09-15までのPO指示で既に方向が示されている。本packetで改めて曖昧な一括承認を要求する
必要はない。残る確認対象は、下記候補文書がこの既決方針に余計な意味を追加していないか、または必要な意味を
落としていないかである。修正が必要なら、文書IDではなく「どの方針が違うか」を指示できる。

### 文書で具体化した内容

- HARNESS: L1–L12、正規V-pair、工程選択、単体・接続・構成体を分ける要求エンジン、Design Templateとseed、PoC／UI prototype／Feature ticket contract、駆動tagからのworkflow生成、要求形成・合意・freeze・差戻し・完了、検証義務、外部利用条件、複数プロダクトと自己プロジェクトへの適用検証。
- HELIX-OS: HARNESS自己適用と継続改善、Concept／企画から要求エンジン出力・採用要求までの齟齬管理、template lifecycle、管理から推進への工程入力、推進によるtyped ticket・workflow生成、管理登録、検収、Issue projection、対象別authority、複数project管理、Worker、統合再計画、crawler、CI、因果診断、継続・復旧、学習・改善、HARNESS package運転、個別製品のrelease準備・artifact受渡し・observation統制。
- HELIX-Web: HARNESS Version 1完成後の展開、Connector接続、ダッシュボードによる進行確認、利用者の変更・受入判断、構成版、改善利用への同意。
- HELIX-Web-OS: HELIX-OS外のservice runtime、tenant・job・credential・stateの運転、許可logのHELIX-OS改善入口へのexport。
- 共通: GitHub非authority、旧資産非継承、Concept→L1→L2→L3の順序、L2↔L11／L3↔L10。

上記に誤りがなければ、必要な返答は「この方向で進める」で足りる。異なる点があれば、その点だけを指定する。
内部記録では対象別revisionを混同しないためDecision IDを分けるが、人間へID入力を要求しない。

## 判断対象

| 対象 | SHA-256 | 判断する意味 |
|---|---|---|
| `docs/concept/helix-concept-v4.1.md` | `5c40a2e355308fceec9b4f149821cbedff7803c0f436dff8759d7aadad761a28` | HELIX、HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSのidentity、HARNESS要求エンジン、Design Template、意味密度によるPython抽出、管理→推進→管理登録→検収のticket tag／workflow生成、企画との齟齬管理、HARNESS自己改善、Version 1境界、改善接続、9原則、archive-first新世代境界、authority順序、旧実行・検証資産の完全一致再利用禁止 |
| `docs/helix-harness/L1-planning/product-intent.md` | `a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04` | HARNESSの外部提供価値9件と対象外 |
| `docs/helix-os/L1-planning/system-intent.md` | `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8` | HELIX-OSのHARNESS自己改善・管理・統制価値12件と対象外 |
| `docs/helix-web/L1-planning/product-intent.md` | `26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756` | HELIX-Webの個別製品価値6件と対象外 |
| `docs/helix-web-os/L1-planning/system-intent.md` | `600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c` | HELIX-Web-OSのservice運転価値5件と対象外 |

L2文書4件は上記L1とのrelation案を持つが、本判断対象には含めない。L2では利用者、場面、操作、期待結果、
prototype／非UI適用性を個別採否し、別の人間合意を行う。

## v4.0から変える意味

| 項目 | v4.1での決定候補 |
|---|---|
| 製品境界 | HARNESSを外部提供製品、HELIX-OSをHARNESS自身とHELIX全体の管理・統制・継続改善機構、HELIX-Webを個別製品、HELIX-Web-OSをOS外のservice runtimeとする。許可logを改善loopへ接続する |
| Version 1 | 複数プロダクトの実開発とHELIX自身への適用を含めてHELIX-HARNESS製品群を完成させ、その完成をHELIX-Web展開の必須前提にする。Web自体は完成分母へ入れない |
| Contract Compilation | Requirement IR／Release Sliceを先に固定せず、Concept→対象別L1→L2→L3→設計・検証・実装・運用の順にする |
| Durable State | semantic authority、実行事実、projection、working contextを分け、OSが原情報から再構築する |
| Composable Release | 旧Slice／Module／Bundle／DevOS artifactを新世代identityにせず、承認済み機能と適格性からHARNESS提供構成を再導出する |
| GitHub | 作業・協調・証拠projectionに限定し、要求意味・採否・合意・受入を生成しない |
| 既存資産 | 元構造と出典を保った非実行archiveへ先に隔離し、そこから意味を採取する。新世代のbaseline、parity oracle、fallbackにしない |
| CI／AI文書 | 旧実行面をarchiveへ隔離して最小上流入口へ置換する。承認済み上流から新規導出し、要求整理中は旧CIを起動しない |

## reviewと修正状態

[Claude初回review](concept-v4.1-claude-review-96171b9ba.md)はBlocker 3件、Major 6件を報告した。
修正版では次を変更した。

| 旧所見 | 修正文書上の対応 | 独立再review |
|---|---|---|
| B1 原則変更を保持と誤記 | v4.1に保持／改訂／追加と理由の表を追加 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| B2 L1→L2が片方向 | 4対象のL2に`parent_l1_candidate`と全L1 ID relationを追加 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| B3 v4.0／v4.1 identity衝突 | v4.1を`HELIX-CONCEPT-V4.1`へ分離 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| M1 L12接続欠落 | 4対象L1の採択条件へL12運用評価を追加 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| M2 L0柱がL1を迂回 | 4対象L1へP0–P9の帰属／非該当を追加 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| M3 総称HELIXが要求owner | 旧HCV4-L2／L11を`migration_crosswalk_only`とし、全6件をHARNESS／OSへ分割 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| M4 OS責務欠落 | HARNESS package運転、個別製品のrelease準備・artifact受渡し・observation統制とprojection再構築のL1要求を追加。展開先deployment authorityは個別runtimeに分離 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| M5 HARNESS責務欠落 | 要求形成、合意、freeze、差戻し、再開、完了のL1要求を追加 | GitHub comment 5667389441で対応記述の存在を静的確認 |
| M6 移行中gate不明 | 静的意味検査と人間判断の効力、旧CI／旧gate非利用を明記 | GitHub comment 5667389441で対応記述の存在を静的確認 |

初期の修正版へのClaude再reviewは2回ともprovider `outcome:error`で本文が返らなかった。第3回はsealed worker contextから
remote同期済みHEAD `46e441fe714bc38a26026bc9cdde7bef9f6c3d4f`を対象に起動したが、20分deadlineで
`terminal_failure=timed_out`となり本文を返さなかった。これらの試行自体は合格receiptとして扱わない。
sealed reviewのB1..B3／M1..M6と後続GitHub reviewの同名IDは別系列である。GitHub
[comment 5667389441](https://github.com/RetryYN/HELIX-HARNESS/pull/1797#issuecomment-5667389441)は、HEAD `5d03921e4`で
各対応記述の存在を静的確認したが、sealed reviewerによる`resolved`判定を代替しない。

2026-09-14、最新revisionへの再reviewとしてローカルClaude CLIを起動したが、そのCLI通路はPOから許可されていなかった。
実行は停止し、無出力の一時ファイルを削除した。この試行をreview実施、失敗receipt、再試行許可のいずれにも数えない。
以後はreviewer指定と実行通路の許可を分け、許可されたGitHub上のreview通路以外へ自動fallbackしない。

## GitHub Claude reviewの現況

- HEAD `250fbe1ef8cbc0a9c483300fe52e9956b1b35f87`の
  [review](concept-v4.1-github-review-250fbe1ef.md)ではB1／B2、M1..M4、m1..m3を検出した。これらは後続revisionで
  archive-first順序、旧authority表示、Web-OS接続、deployment境界、relation、発言記録binding、READMEを修正した。
- HEAD `5dd1f685c2acda99caf0bcc07069368b60ce2629`の
  [review](legacy-reuse-github-review-5dd1f685c.md)ではB3..B5、M5..M8、m4..m5を検出した。これらは後続revisionで
  copy実績の誤記、archive規則の優先関係、完全一致copy対象外class、disposition語彙、`unresolved`既定、CodeQL記録、
  L11親ID、台帳状態を修正した。
- HEAD `3969a2f8b80c8d1659718dd6fa63bd3958a51a06`の
  [review](upstream-github-review-3969a2f8b.md)では、過去22所見のうち21件が解消済みと判定された。残るB6は
  CodeQL停止の記録scopeとrepository-wide実作用の不一致、minor 2件は再利用統制の必読経路とhistorical注記だった。
  後続revisionでCodeQLを変更前相当へ復元し、会話からの許可推定を無効化し、2注記を追加した。
- HEAD `f92651a66366562eb09466c523a87b39b14669e4`の
  [review](upstream-github-review-f92651a66.md)ではBlocker 0件、新規所見0件、過去25所見すべて解消と判定された。
  要求欠落防止、完全一致再利用統制、4対象責務境界は成立し、全4020件のatom閉包は未完として保持されている。
- HEAD `8bbb7c969b2e0b562e6e9d1c929fd4aa682085d5`の
  [資産明細台帳review](upstream-github-review-8bbb7c969.md)ではBlocker 0件、Major 1件、Minor 2件を検出した。
  行revisionと個別採否欄、再利用除外class、AIの照会境界を後続revisionで是正した。
- HEAD `afd9ab7298749507f64247cbd7a7a92d72e8ba81`の
  [台帳再review](upstream-github-review-afd9ab729.md)ではBlocker 0件、Major 1件、Minor 2件を検出した。
  archive内template等の除外class、append-only判断ログ、classラベルを後続revisionで是正した。
- HEAD `4e9c4103338e6e81a1e4bd190ad306f5c250755a`以降は、資産判断・copy read-afterログ、Issue／Project projection退役の
  外部作用と可逆性を追加確認した。HEAD `1d44da71f3757c362771ae80820ab495110c2af9`の
  [最終review](upstream-github-review-1d44da71f.md)はBlocker 0件、所見0件である。

各reviewは対象HEADのfindingであり、人間承認ではない。資産明細台帳reviewの所見を受け、Conceptは旧test／fixture／oracleと
旧runtime state／evidenceも完全一致再利用しない条件を追加してSHAを再固定した。4対象L1は変更していない。判断時には
対象SHAと最新reviewの未解消blocker数をread-afterする。

## 内部で分けて記録する判断

| Decision ID | 対象 | 選択肢 | 依存 |
|---|---|---|---|
| HDEC-CONCEPT-4.1 | Concept v4.1 exact SHA | approve／changes_requested／reject | なし |
| HDEC-HARNESS-L1-01 | HARNESS L1 exact SHA | approve／changes_requested／reject | HDEC-CONCEPT-4.1=approve |
| HDEC-HELIXOS-L1-01 | HELIX-OS L1 exact SHA | approve／changes_requested／reject | HDEC-CONCEPT-4.1=approve |
| HDEC-HELIXWEB-L1-01 | HELIX-Web L1 exact SHA | approve／changes_requested／defer／reject | HDEC-CONCEPT-4.1=approve |
| HDEC-HELIXWEBOS-L1-01 | HELIX-Web-OS L1 exact SHA | approve／changes_requested／defer／reject | HDEC-CONCEPT-4.1=approve |

人間に5つのDecision IDを回答させるための表ではない。人間の平易な回答を、対象とrevisionを失わないようOS側の
記録で5判断へ投影する。Web／Web-OSを保留する指示があってもHARNESS／HELIX-OSの上流判断を自動失効させず、対象固有L2だけを
保留する。修正指示では対象、変更理由、維持する条件を記録する。

## この判断で成立しないもの

- 対象別L2の採択・合意、prototype合意、L11受入。
- L3／L10、Requirement IR、runtime、DB、CLI、hook、adapter、AI manifest、新世代CIの設計・実装。
- archive sourceの意味採否、v3.1／v4.0や旧L0-L14文書の最終配置、物理削除、replacement consumer切替。
- PR作成、merge、Issue close、release、deployment、公開。

ConceptとL1が承認された場合だけ、次は要求source atomを対象別L2へ個別採否する。
