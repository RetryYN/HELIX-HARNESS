---
title: "HARNESS利用要求の受入案"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
freeze_blocking: true
pair_artifact: docs/helix-harness/L2-requirements/product-requirements.md
---

# HARNESS利用要求の受入案

全件未実行。合意した要求revision・対象artifact・操作・実結果を記録して判定する。
旧要求の整理では、原要求ID・原文digest・successor・未被覆atomを照合し、37件のrouting containerへの関連付けだけで
移管完了にしない。人間decisionのない削除・縮退・candidate降格を一件でも検出した場合は不合格とする。

| 親要求 | 利用者が確認する結果と反例 |
|---|---|
| HARNESS-L2-001 | L1–L12の成果と対を確認し、L2／L11とL3／L10の混同、片側欠落を識別できる。L2.5（Prototype・PoC）の結果を要求の合意と取り違えず、L2.5を飛ばした対象でも非適用の判定と理由が残る |
| HARNESS-L2-002 | 異なる開発方式の工程を確認し、開発方式とticketの種類（駆動）を混同しない。Discovery・PoCを開発方式のphaseへ混入させない。リリースカンバンで立てたリリース単位の順序と優先に沿って、各リリース単位を選んだ開発方式で進められ、提供の単位ごとにリリースカンバン上の状態を確認できる |
| HARNESS-L2-003 | 凍結・差戻し・再開・完了の条件を確認し、未合意・未検証で進行可能と判定しない。画面または技術的な成立性に不確定要素がある対象は、L2.5で確かめて合意するまで要件へ進めない。Vの谷より右側で、実物を対の設計と照合し、意味を保てる変更だけをRefactorし、意味が変わるものを対応する左の層へBackflowする。成果物の状態を前の状態から推定せず、Release Portの条件を開発の開始時から満たしていく |
| HARNESS-L2-004 | 要求変更から影響する設計・テストと再検証の範囲が導出され、変更した条件の検証漏れを識別できる |
| HARNESS-L2-005 | ticketとの関係（Forward 小・中・大、V字の対、触るコネクタ、変更の種類）と、変更の内容・layer・riskから必要な検証が導出され、固定の段数ではなくその検証に合うCIをPRの前に組み立てる規則が導かれ、HELIX-OSの検収がその規則でCIを組み立てられる。省いた検査は記録され、合流先のticketで回収される。異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない |
| HARNESS-L2-006 | サービス①〜⑦の単位で、提供版・依存・導入条件とリリースカンバン上の状態を確認し、選んだサービスだけをHELIX内部の運用状態を持たない利用環境で導入・利用できる |
| HARNESS-L2-007 | 検証対象として選定した複数プロダクトとHELIX自身のプロジェクトについて、要求revision、適用構成、成果、L11受入、L12運用評価へ辿る。サービス①〜⑦のすべてがそれぞれ単独で成り立ち、つなげて開発全体に使えることと、Conceptの1.0土台7項目（ログと証拠、データの利用区分、計測、接続契約と版、隔離の単位、構成版の固定と切戻し、後から加わる機構の受け口）が全機構で共通に成立していることを確認する。単一demo、HARNESS単体test、文書整合、土台の一部だけならVersion 1未完成とし、HELIX-Webの完成有無を判定へ混入させない |
| HARNESS-L2-008 | 設計パターンの選択に必要な質問が要求エンジンから出され、1次要求の形成と、L2.5の結果をBackflowで戻した2次形成を区別して確認できる。指示と要求候補を意味単位で比較し、欠落・意味追加・対象違い・未確定事項を確認できる。Python coreの出力、ログ、Issue、PR、CIだけでは要求合意や操作許可を成立させない |
| HARNESS-L2-009 | unit、connection、compositeの各要求に適用するtemplateと設計義務を確認し、必要input欠落をBackflow ticketで上流へ戻せる。template適用や文書生成だけでは要求合意・設計完成・検証成功を成立させない |

## 工程条件の確認シナリオ

- HARNESS-L2-001：旧L0–L14 pathを持つ成果でも現行6 pairを確認でき、L2の対をL10とする入力を拒否する。
- HARNESS-L2-002：4つの方式のどれでもL1–L3を共通に進め、要件の承認を経ることを確認する。L4以降は、Vモデルはslice化せず、スクラムはL3後に最小の製品へslice化し、ハイブリッドはユニット拡張単位で作って最後に結合し、リリースカンバンはv1・v2・v3とリリース段階を切って進むことを確認する。Decideで採用されていないDiscovery・PoCの結果をproductionへ持ち込まない。
- HARNESS-L2-002：開発方式の未選択と適用条件不成立をfail-closeし、起動条件が成立しないのにDiscovery・PoCを発行しない。複数の方式を合成した対象で、L1–L3、要件の承認、V字の対、品質条件のどれかが落ちる組み合わせを不成立とする。スクラムで要件の承認前に市場投入する入力、利用の記録から分かった改善をBackflowを経ずに要求へ取り込む入力を拒否する。
- HARNESS-L2-002：リリースカンバンを含む対象で、リリース段階（v1、v2、v3等）ごとの順序と優先の根拠、各段階が最終的なプロダクトゴールのどこに当たるかを確認する。根拠のない段階の着手、段階とプロダクトゴールの対応がない入力を不成立とする。
- HARNESS-L2-002／003：要求の段階で技術的な成立性が不明ならL2.5のPoCが、要求・成功条件・範囲が分からない、または開発の途中で検証が必要ならDiscoveryが発行されることを確認する。PoCの結果は、Backflowと要求の2次形成を経て、Decideの採用・不採用・方針変更のいずれかが出るまで要求の合意やL3へ合流しない。Discoveryの結果は発行元のticketへ戻り、要求の意味を変える結果だけがBackflow・2次形成・Decideを経る。検証の成功だけで採用と判定する入力、要求の意味を変えるDiscoveryの結果を発行元のticketだけで取り込む入力、要求の意味に関わる裁定を人の判断なしに成立させる入力を拒否する。
- HARNESS-L2-002／003：Researchの起動条件が成立したとき、Researchは参考ソースを依頼元へ返すだけで、選定はDecideの記録から技術の選定ならL4へ、要求への影響なら要求へ接続されることを確認する。Researchの成果物だけで選定が決まったと判定する入力、Researchに決定を含めた入力を拒否する。成立性の実験が必要なら、要求の段階ならL2.5のPoC、開発の途中ならDiscoveryが発行される。
- HARNESS-L2-002／003：スクラムで進める部分（リリースカンバンのリリース単位やハイブリッドのユニットにスクラムを合成した場合を含む）のcheckpoint trigger成立時にSR0–SR4を要求し、SR4 receipt欠落をrelease-readyにしない。findingの修正routeが0件または複数なら拒否する。
- HARNESS-L2-002／003：v1.3 L104-106に従い、`ProvisionalVProjection`をcanonical traceの根拠へ使う入力、SR4 receiptなしの`CanonicalVPublication`、4 entityを単一進捗値へ縮退する入力を拒否する。Design Refactorでobservable behavior／public surface／DB semantics／要求を変える入力はRedesign／Retrofitへrerouteし、送り先が0件なら拒否する。Performance Refactorはbaseline／budget／workload／profile／統計条件／回帰oracleを先に固定し、測定不能な高速化を拒否する。
- HARNESS-L2-003：Prototypeは画面の有無で、PoCは画面の有無に関係なく技術的な成立性が不明かどうかで、別々に判定されることを確認する。画面のない対象で成立性が不明な場合にPoCを省く入力、片方だけの非適用からL2.5全体を飛ばす入力を拒否する。
- HARNESS-L2-003：Prototypeの合意欠落、PoCの結果の未還流、非適用の記録（理由・判定者・HEAD・要求への影響・再評価条件）の欠落を別々に投入し、L2要求を飛ばしてL3凍結可能にならないことを確認する。
- HARNESS-L2-003：実装済み・総合検証済み・利用者受入済み・運用評価済みを区別し、一つの状態から残りを推定しない。
- HARNESS-L2-004：要求変更に対して影響する設計・V-pairが示され、無関係な要求を再承認対象へ巻き込まず、必要な検証を落とさない。
- HARNESS-L2-004：入力source atom集合の各atomが、当該要求への保持、別の生存中仮登録への保持、対象revision付き人間decisionのいずれか一つへ割り当てられる。未計上、根拠のない重複、digest違い、仮登録先の失効があれば`no_loss`を発行しない。
- HARNESS-L2-005：別revisionの証拠やCI成功のみを提示しても利用者受入成立と判定しない。実行基盤を変えても必要な証拠条件を維持する。
- HARNESS-L2-005：required oracleを欠くprofile、unknownをN/Aへ変えたprofile、expected failureと差戻し先を持たないprofileを不成立とする。providerを交換してもrequirement・pair・oracle・evidence identityが維持されることを確認する。
- HARNESS-L2-005：変更の内容・layer・pair・変更種別・riskが異なる変更を与え、それぞれに必要な検証だけが導出され、CIがその検証から組み立てられることを確認する。固定の段数をすべて回す構成、導出された検証を省いた構成、導出の根拠を説明できない構成を不成立とする。
- HARNESS-L2-005：Forward 小・中・大のticketを与え、PRの前に回すCIが、原子CI、境界の証明（触ったコネクタの契約を含む）、システムの証明と、ticketとの関係から導かれることを確認する。危険度の高い変更（認証、DBのmigration、security、release）は、小さな変更でも上の証明を早めに求めることを確認する。
- HARNESS-L2-005：Forward 小のscopeの中の変更でも、密結合によって別の接続・構成体の振る舞いに影響する変更を与え、影響する接続・構成体の検査がそのPRで広げられ、成立するまで合流が止まり、結合の解消はDesign-refactorとして別に発行されることを確認する。Design-refactorの発行と、省いた検査の後続ticketへの持ち越しだけで合流させる構成を不成立とする。
- HARNESS-L2-005：ticketの範囲の外を変更した変更を与え、mainへの合流が止まることを確認する。省いた検査の記録を欠く構成、合流先のticketで回収されない検査を残したままRelease Portを通す構成を不成立とする。
- HARNESS-L2-005：検査をすり抜けて合流の後に見つかった失敗を与え、失敗が閉じたticketへ証拠付きのrelationで接続され、元の完了の記録が書き換えられず、HELIX-LABOが原子CIやコネクタの契約が足りているかを評価して返すことを確認する。時間的な近さや同じpathだけで原因のticketを断定する構成を不成立とする（旧HXB-FR-007、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:319`）。
- HARNESS-L2-003：原子CIに合格した成果物をProvisionalとし、システムの成立、利用者の受入、Releaseの成立を主張しないことを確認する。局所のRefactorでpublic contract・要求・architectureの意味・stateの意味を変えた変更を与え、Backflowへ送られることを確認する。
- HARNESS-L2-003／004：右側の照合で、振る舞い・契約・要求を保てるずれはRefactorされ、詳細の契約・境界・要求・製品の価値のずれは、それぞれL5・L4・L3／L2・L1へBackflowされることを確認する。右側で左側の設計や要求を黙って書き換えた構成を不成立とする。
- HARNESS-L2-003／004：由来と対の設計が分かっている変更では、その範囲だけを照合し、全体のReverseを既定にしないことを確認する。由来が不明な変更、旧資産、設計traceの欠落では、全体のReverseが復旧の手段として選ばれることを確認する。通常の照合でticketを発行せず、明らかなずれ・同種findingの再発・性能の退行ではReverse ticketが発行されることを確認する。
- HARNESS-L2-003：Working→Provisional→Integrated→Verified→Accepted→Release-eligible→Deployed→Observedの各状態を、対応する証明の成立だけで進め、単体と結合の証明だけで、システムに固有の義務との差分を確かめずにVerifiedを、L10の合格からAcceptedを推定しないことを確認する。L11で意味の差を与え、コードの直接修正ではなくBackflowと要求への再投入に進むことを確認する。
- HARNESS-L2-003：開発の開始時にRelease Portの必須条件（必要な証明、成果物の識別、対象環境、依存、securityの条件、rollback、配備の条件、受入の状態）が置かれ、各工程で満たした条件と未充足の条件が分かることを確認する。
- HARNESS-L2-008／005：単体A・B・Cをすべて成立させ、A→BとB→Cの接続に固有の義務を未検証にする。単体の合格が接続の前提の証拠として集められ、接続A-B、接続B-C、構成体Xは成立にならないことを確認する。単体の成立だけで接続や構成体を成立させる構成を不成立とする。
- HARNESS-L2-008／005：すべての単体と接続を成立させ、構成体に固有のoracle（例：システム全体の応答時間）を未実行にする。構成体が未検証のまま残り、不足する固有の証明だけが求められることを確認する。下の合格の集合だけで構成体を成立させる構成を不成立とする。
- HARNESS-L2-005：すべての単体と接続が成立し、組み合わせの契約がそろい、未解決の構成体に固有の義務がないことがHARNESSの契約で示せる構成体を与える。大きな端から端までの検証をやり直さずに、構成体の合格が導かれることを確認する。下の証明をやり直す構成と、固有の義務があるのに差分を証明せずに合格とする構成を、どちらも不成立とする。
- HARNESS-L2-008／009：構成体を単体と接続へ分解し、端から端までの目的、システムの不変条件、failure、復旧、非機能、受入のうち分解後も必要な義務が構成体の側に残ることを確認する。分解しただけで構成体の要求を消す構成を不成立とする。
- HARNESS-L2-004：単体Aを変更し、Aが加わる接続と上の構成体がAffectedと識別されることを確認する。接続や構成体を自動でfailedやpassedにする構成を不成立とする。
- HARNESS-L2-004：影響を証明できないrelationを入力し、Unknownが保たれることを確認する。UnknownをUnaffectedや検証不要へ変える構成を不成立とする。
- HARNESS-L2-008：単体の要求として進めた変更に、実装や検証から接続の問題である証拠を与える。findingが保たれ、元の要求が黙って変わらず、Backflowへつながり、接続の要求の候補が形成され、影響する設計と検証が導き直されることを確認する。人の合意が要る意味の変更は、既存の要求の形成の経路へ戻ることを確認する。
- HARNESS-L2-002／006：提供の単位ごとのリリースカンバン上の状態を確認し、状態の欠落、状態と提供版の食い違い、Issue・PR・CIの状態だけからの状態推定を拒否する。
- HARNESS-L2-006：サービス①〜⑦のうち1つだけを選んで導入し、そのサービスの提供版・依存・導入条件だけで利用できることを確認する。選ばなかったサービスや統合版を暗黙に要求する場合は不成立とする。
- HARNESS-L2-007：1.0土台7項目のそれぞれについて、全機構で共通の形で成立している証拠を確認する。一つの機構だけ、または一部の項目だけの成立をVersion 1完成と判定しない。サービス①〜⑦のすべてについて、単独で成り立つこと（単体）と、つなげて開発全体に使えること（接続・構成体）を確認する。一部のサービスだけの成立、または統合版だけの成立をVersion 1完成と判定しない（2026-09-25 PO判断）。
- HARNESS-L2-008：設計パターンの選択に必要な入力が欠けた指示を与え、要求エンジンが質問を出すことを確認する。L2.5の結果をBackflowで戻した2次形成の結果を、1次形成の結果や合意済み要求と取り違えない。
- HARNESS-L2-009：templateの必須inputの欠落が、Backflow ticketとして上流へ戻されることを確認する。ticketにならない口頭の差戻しや、AIの補完で欠落を埋めた入力を不成立とする。

本書はHARNESSの利用者による工程規則の確認である。OS側のWorker・CI・ログ保存の実機能検証とは分ける。

旧資産退役条件はLAR-HARNESS要求の採用revision確定後に評価する。全件未実行。

- 旧path削除や旧test greenだけを与え、要求、behavior、設計、検証、consumer、後継上流IDの欠落を移管済みにしない。
- replacementのpair、oracle、expected failure、利用者受入、差戻し条件の一つを欠かし、退役を不成立にする。
- archive内の旧承認・成功証拠をcurrent authority、検証済み能力、工程完了として採用しない。
- HARNESS-L2-004／005／006：完全一致再利用候補について、同じ製品責務・要求revision・意味・interface・権利・security・consumer・実行境界と
  source／target digest一致を確認する。一条件でも不明な資産をコピー済み・移管済みとして受け入れない。
- HARNESS-L2-004／005／006：完全一致再利用が適格な資産を不要に再実装せず、意味再導出が必要な資産をbyte copyで置換しない。

## 旧HCV4受入条件の移管

総称HELIXの旧L11を再実行せず、工程・提供契約に属するnegative caseを次へ保持する。

| 旧受入ID | 本書の親要求 | 保持する利用結果 |
|---|---|---|
| HCV4-L11-001 | HARNESS-L2-003 | request、approval、decisionと対象revisionを区別し、相談や別revisionから合意を生成しない |
| HCV4-L11-002 | HARNESS-L2-004 | 要求から設計・検証・提供・運用へのtrace欠落を確認できる |
| HCV4-L11-003 | HARNESS-L2-003／HARNESS-L2-005 | 未実行oracle、不一致digest、別HEAD review、projectionだけの完了主張を拒否する |
| HCV4-L11-004 | HARNESS-L2-003／HARNESS-L2-005 | runtime交代後も同じ工程・証拠条件を維持し、不足時は再開不可と説明できる |
| HCV4-L11-005 | HARNESS-L2-006 | 提供範囲、artifact、release、deployment、rollbackの成立を別々に確認する |
| HCV4-L11-006 | HARNESS-L2-003／HARNESS-L2-004 | 改善候補による要求変更を再合意・再検証へ戻す |

これは受入条件の移管案であり、対象別L2の合意、実操作、passを成立させない。

## 運用品質工程の受入

NIO由来条件は新世代で採用する要求revisionの確定後に評価する。全件未実行。

- HARNESS-L2-003／004／005：対象製品の品質領域ごとに適用・非適用・unknown・決定ownerを確認し、根拠のないSLO値や保持期間を工程規則から生成しない。
- HARNESS-L2-003／005：designed、implemented、verified、observed、operatedを別々に提示し、文書存在、実装済み、CI成功、別環境の観測で後続状態を代替しない。
- HARNESS-L2-004／005：要求から設計・検証・運用観測・再要求化への接続欠落を検出し、旧graph、旧Issue、既存CIの結果で補完しない。
- HARNESS-L2-005：backupの存在、restore成功、rollback成功、恒久修復、再発防止を別結果として確認する。個別製品の実結果は対応する製品L11／L10／L12で判定する。

旧NIOのL10候補をHARNESS利用者受入へ一括転用せず、L2に対する利用者結果だけを本L11へ接続する。

HARNESS-L2-006：外部利用者の導入条件を確認し、HARNESSの提供版・仕様・必要な依存を辿れることを検証する。
HELIX内部のプロジェクト群や運用記録がないことだけを理由に、HARNESS利用不能とする暗黙依存を認めない。

提供機能を一つ選び、指定版のartifactと明示された依存だけを用いて導入・利用し、期待成果と実結果を記録する。
依存欠落・未対応版・非提供機能の要求では、満たせない条件を説明できることを確認する。
HELIX内部への未記載の接続が必要になった場合は不成立とする。これらの利用者受入は未実行である。

## 要求形成の工程条件の受入

AVS／RFA／DGH由来の条件は採用revision確定後に検証する。全件未実行。

- HARNESS-L2-003：委任範囲内の技術的具体化と範囲外の意味変更を分け、前者への不要な再承認と後者の無承認通過の両方を検出する。
- HARNESS-L2-003／005：指示文だけ、相談だけ、別revisionの承認を入力しても、検証済み・合意済みの条件を満たさない。
- HARNESS-L2-004：変更に対応する要求・対検証だけを再評価し、無関係な有効作業を一律失効させない。
- HARNESS-L2-003／005：根拠欠落、未解決finding、客観品質不合格、人間の未受容を個別に与え、文書リンクや一方の成功で残りの条件を相殺しない。
- HARNESS-L2-008：同じ意味を異なる表現で指示し、同じ要求identityへ収束できることを確認する。否定、取消、保留、対象製品変更を含む入力で旧候補を自動採用しない。
- HARNESS-L2-008：指示にない制約を追加した出力、指示の一部を落とした出力、別製品の規則を混入した出力を個別に不成立とし、質問・訂正・再抽出へ戻せることを確認する。
- HARNESS-L2-008：同一入力・engine版・製品pack版から決定論的な構造化結果を得る。network、DB、Git、GitHub、repository、credentialを与えずに意味処理できない場合は不成立とする。
- HARNESS-L2-008：機能A、機能B、機能Cの単体要求を成立させても、A→B／B→Cの接続要求とA–Cから成るシステムAの構成体要求が未成立なら全体を成立としない。接続の順序、data意味、timeout、部分失敗、回復とend-to-end acceptanceを個別に確認する。
- HARNESS-L2-008／009：子機能が個別に性能・security条件を満たしても、構成体全体の性能budget超過またはtrust boundary違反があれば不成立とする。非適用を選ぶ場合は理由、判断者、対象revision、再評価条件のいずれかを欠くN/Aを受け入れない。
- HARNESS-L2-008：構成体要求の変更から影響する接続・単体へ、単体interfaceの変更から影響する接続・構成体へ双方向に辿り、無関係な構成を失効させない。
- HARNESS-L2-009：同じunit要求へunit／connection／composite templateを順に与え、unitに非適用なtemplateを理由付きで区別する。接続要求へunit templateだけを適用しても設計義務を満たしたとしない。
- HARNESS-L2-009：templateの必須inputを一つ欠かし、AI補完ではなく質問・要求候補・N/A判断候補へbackflowする。未承認候補、stale版、別product版、該当なしで任意templateへfallbackしない。
- HARNESS-L2-002／003／008／009：同じ親要求と管理制約から推進方式を変えてticket graphを生成し、いずれもHARNESSが要求するlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowを満たすことを確認する。HARNESSが駆動tagや個別workflowを生成する実装は不成立とする。
- HARNESS-L2-002／003：PoC、Prototype、Forward（小）のticketを別identityで確認し、PoC成功、Prototype表示、Issue closeから要求合意・恒久技術採用・Forwardの完了を生成しない。

管理変更入口の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HARNESS-L2-003／004：管理観測や改善候補を入力し、意味が変わる最上流への差戻し、再合意、pair再凍結、再検証範囲を確認する。
- Issue作成、Project状態、旧`S0..S4`完了、既存CI成功だけでは製品Forwardの進行条件を満たさない。
- 管理上の緊急性を与えても、V-pair、trace、検証、利用者受入を省略しない。
- 旧DoR／DoD、sprint review、retrospective等のceremony完了を与えても、HARNESSの着手・完了・利用者受入・L12観測を自動成立させない。

限定修復の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HARNESS-L2-005：修復後も対象要求、必須oracle、expected failure、独立検証、consumer受入、差戻し条件が維持されることを確認する。
- 必須test削除、閾値緩和、scope拡張、意味digest更新、旧CI greenを与えても、適格な修復や検証完了と判定しない。

構造改善条件は新世代L1／L2の採用revision確定後に評価する。全件未実行。

- HARNESS-L2-004／005：意味保存、意味変更、実装故障、外部環境変化を個別に与え、影響する上流・設計・V-pair・再検証・差戻し先を区別する。
- 旧RF0 route、旧scope分類、既存CI成功だけでは構造改善の適格性や工程完了を成立させない。

Worker capacity由来条件は新世代の採用revision確定後に評価する。全件未実行。

- HARNESS-L2-005：作成・検証の担当、対象revision、証拠を変化させ、providerや並列数が同じでも独立性・revision有効性を個別に判定する。
- 固定worker数、PR review、Merge Train、既存CI成功を与えても、独立検証や利用者受入を成立させない。

Security工程条件は対象製品の採用revision確定後に評価する。全件未実行。

- HARNESS-L2-003／004／005：推定finding、再現、独立検証、修復、再検証、運用成立を個別に確認し、一状態から後続を推定しない。
- authority欠落、scope drift、sensitive evidence、自己検証を与え、旧broker／provider／CI greenで工程条件を相殺しない。

利用許諾条件はHARNESSの製品scope・契約・権利が正式承認された後に評価する。全件未実行。

- HARNESS-L2-006：提供artifactから適用許諾版、対象asset、第三者通知、導入・更新・復旧条件へ辿れることを確認する。
- 旧HELIX全体契約、候補文書、PR、CI、配布成功を与えても、HARNESSの契約発効・権利確認・公開承認を成立させない。

AI可読工程契約はAIDOC要求の採用revision確定後に評価する。全件未実行。

- AIDOC-HARNESS-001：異なるruntime／providerに同じHARNESS revisionを与え、layer・pair・artifact・required oracleが一致することを確認する。
- AIDOC-HARNESS-002：生成要約から正本sourceとrevisionへ逆参照し、要約の欠落・staleを検出する。要約自体をauthorityにしない。
- AIDOC-HARNESS-003：未承認、stale、compatibility、historical、unknownを入力し、current実行契約として採用しない。
- Worker inventory、provider session、CI運転、HELIX内部memoryがHARNESS工程契約へ混入した場合は不成立とする。

INV由来条件は新世代で個別採用した要求revisionの確定後に評価する。全件未実行。

- INV ID、P0..P4、投資効果、旧実装の存在だけではHARNESS要求・検証義務・提供機能を成立させない。
- 旧CI、cache、shard、fixture、warm環境の成功を与えても、対応する要求revision・oracle・利用者受入がなければ完了としない。

## 提供構成の受入

FRSと提供構成追補の採用revision確定後に評価する。全件未実行。
旧FRS v0.2の承認、旧Slice／Module／Bundle名、旧channel enum、既存CI結果は採用revisionの代替にしない。

- HARNESS-L2-006（FRS-BR-001／002／003）：選択した構成の収載・除外、機能の証拠、版を確認する。未適格機能の混入と階層間の自動昇格を拒否し、適格な機能単位を未完の上位構成と混同しない。
- HARNESS-L2-004／005（FRS-BR-004／007）：要求と変更箇所から必要検証へ辿り、未所属・二重所有・未検証・unknown影響を個別に識別する。
- HARNESS-L2-006（FRS-BR-005）：同一入力で再生成した提供物を比較し、clean consumerの利用結果と適格な復旧先を確認する。
- HARNESS-L2-005／006（FRS-BR-009）：個別機能が成功しても、組合せの統合・更新・復旧・運用検証が不足すれば全体受入済みとしない。
- HARNESS-L2-006（提供構成追補）：growth-offで対象開発機能を利用でき、未採択Visionや内部学習を必須依存にしない。文書版から公開版を推定せず、提供artifactと原証拠へ辿る。
- HARNESS-L2-006（Concept・Package取込）：旧PKG-D01..13、旧Module対応、Lite／Full、`8+1`を入力しても固定提供構成と判定しない。採用済み機能と明示依存から選択構成を確認する。

## ticket導出コア詳細要求の受入

対のL2の詳細IDに対応する未実行の受入案。採否・実装許可・受入済みを生成しない。種類の行は目的・発行・合流先を一組で確かめ、接続の行は端から端まで確かめる。各行でL2のシステム／運用の分担も確認し、入力・判断の不足をシステムで補完した場合は不成立とする。

| 詳細ID | 親主要求 | 成功条件 | 反例（不合格） |
|---|---|---|---|
| HXT-CORE-01 | HARNESS-L2-002／HARNESS-L2-008 | 方式を変えても必要な工程義務と人の判断箇所をコアから導ける。 | 工程義務の欠落／コアに人の上流判断を代行させる。 |
| HXT-CORE-02 | HARNESS-L2-002／HARNESS-L2-008 | コアの版と義務をOS側のticket・検証へ辿れ、コア提供・判断・発行・検収の責務を区別できる。 | HARNESS又はINTELLIGENCEによる発行／BRAINを稼働中の判断主体にする。 |

## リリース単位の要求とパック境界の受入

対のL2の「リリース単位の要求とパック境界」に対応する未実行の受入案。採否・実装許可・受入済みを生成しない。各単位の行は、その単位だけを必要な依存とともに導入した利用環境で確かめる。単体の合格から接続・構成体の合格を導かない。

| 親要求 | 成功条件 | 反例（不合格） |
|---|---|---|
| HARNESS-L2-010 | 各パックの入力・出力・必要な依存・検証範囲・版と所有先を確認でき、リリース単位へ収めたパックと収めないパックを明示の一覧で確かめられる。パックを一つ差し替えても、他のパックの版と証拠が保たれる。同じ入力と版から同じ成果物を再現し、失敗時に直前の適格な版へ戻せる | 宣言のない依存を実行時に使う／一つのパックを二つのリリース単位が所有する／未検証のパックを暗黙に収める／パックの昇格だけでリリース単位や製品を昇格させる／関数やフォルダの一覧をパックの一覧とする／全体を一つのパックにまとめて交換・更新できない |
| HARNESS-L2-011 | 画面を持たない呼出しで各パックを使い、能力名・契約の版・依存の版を照合し、渡した権限と隔離の単位の中で動き、相関ID付きの進行・結果・証拠を受け取り、途中で止めて同じ冪等キーで再開できる | 特定の画面・GUI・ローカルpath・provider・CI製品がないと呼べない／未対応の版を黙って読み替える／渡していない権限や別のtenantの資源を使う／呼出し元へHELIX本体の稼働DB・鍵・内部統制を渡す／期限切れや中断を成功として返す／Webの要求や設計を本要求から導く |
| HARNESS-L2-012 | ①だけを導入した環境で、要求の記述からPrototypeとPoCを別に判定し、試作とPoCの結果がBackflowを経て要求の2次形成へ戻る。非適用の対象では非適用の記録が残る | 試作やPoCの結果をDecideの前にproductionの成果にする／結果を要求の合意として扱う／②〜⑦がないと使えない |
| HARNESS-L2-013 | ②だけを導入した環境で、指示と根拠から1次要求を形成し、欠落・矛盾・過剰解釈等が提示され、L2↔L11とL3↔L10の対が人の承認待ちの形で出る | 人の承認なしに要件を確定する／出力を承認済み要求や操作権限にする／単体・接続・構成体を一つのidentityに混ぜる／①、③〜⑦がないと使えない |
| HARNESS-L2-014 | ③だけを導入した環境で、持ち込んだ承認済みの要件から、templateに基づく設計義務と対の検証の設計が導かれ、要求入力の不足が上流へ戻る質問・要求候補として出る | templateから要求の意味を決める／下の設計を束ねただけで構成体の設計義務を満たしたとする／②がないと使えない |
| HARNESS-L2-015 | ④だけを導入した環境で、凍結済みの設計からRed→Green→局所のRefactor→原子CIまでが閉じ、成果物がProvisionalになり、設計・テストとの双方向traceと省いた検査の記録が残る | ④だけの出力をIntegrated以上の状態とする／原子CIの合格を品質の証明・システムの成立・受入・Releaseの成立とする／局所のRefactorでpublic contractや要求の意味を変える／HELIX-OSのCI運転がないと使えない |
| HARNESS-L2-016 | ⑤だけを導入した環境で、振る舞い・契約・要求を保てる変更がRefactorされ、意味が変わる変更は対応する左の層へBackflowされる。Performance Refactorでは固定したbaselineと回帰oracleで比べる | 右側で左側のauthorityを黙って書き換える／測定できない高速化を採る／設計と契約のないコードをReverseなしで扱う |
| HARNESS-L2-017 | ⑥だけを導入した環境で、HARNESS-L2-022の契約を満たす検証済みの成果物（HELIXの外で検証・受入を行ったものを含む）とRelease Portの条件からリリースの仕組みが出て、Release-eligibleの条件、再現、直前の適格な版への戻しを確かめられる | Provisionalの成果物、またはHARNESS-L2-022の条件を満たさない外部の成果物を、Verified・Acceptedとして受け取る／回収されない省いた検査を残したままRelease-eligibleにする／配備をObservedとする／対象製品のリリースの仕組みをHELIX自身の実行環境と混同する |
| HARNESS-L2-018 | ⑦だけを導入した環境で、配備済みの製品と承認した運用品質の要求から、L12の観測と、観測から同じ要求revisionへ戻す再要求化の経路を確かめられる | 文書・実装・CIの存在だけでobserved／operatedとする／品質の値を全製品へ固定する／HELIX-OSの監視・復旧の運転がないと使えない |
| HARNESS-L2-019 | 既存の要件・コード・PoCを持ち込み、どのリリース単位からでも入れ、変換の結果と、変換できなかった部分・由来の不明な部分の一覧が出る | 変換の結果を承認済みの要求・設計とする／変換できない部分を推定で埋める／入る先の単位を限る |
| HARNESS-L2-020 | 枠に並べた隣り合う単位で、出力と入力の契約を版とともに照合し、意味の差をBackflowで最上流の層へ戻し、省いた検査・未解決・unknown・人の判断待ちが次の単位へ引き継がれて合流先で回収される。前の単位を使わず外部の成果を持ち込んでも同じ照合を通る | 版の合わない受渡しを読み替える／④のProvisionalを⑥へ直接渡す／下流で上流の意味を書き換える／引き継いだ未完の義務を完了にする／単体の合格だけで接続の合格とする |
| HARNESS-L2-021 | 一つの対象で要求から検証と受入（HARNESS-L2-022）を経て運用保守まで通し、L12の観測と実績の評価から要求へ戻る経路まで辿れる。端から端のtrace、横断する非機能、統合した版の更新・rollback、L12の運用検証が、個別の単位の成功とは別に確かめられる | 単位ごとの合格を集めただけで構成体の合格とする／構成体に固有の義務を確かめない／HARNESSが改善を自分で実行する、または評価の結果を要求へ戻す受け口がない |
| HARNESS-L2-022 | コアの検証と受入の契約だけを④なしで使い、持ち込んだProvisionalの成果物が、L8・L9のScoped Reverseと結合の証明でIntegrated、L10のシステムの証明でVerified、L11の受入でAcceptedへ、段階ごとの証拠とともに進む。振る舞い・契約・要求を保てる不一致は右側でRefactorされ、同じ段階の検証をやり直す。意味の変更が必要な不一致は、意味が変わる左側の層へBackflowで戻る。L11の意味の差は、コードで合わせずに要求へ戻る。HELIX-OSなしで、利用者のCIと受入の手段へ契約を渡して同じ判定ができる。外部で検証・受入を行った成果物は、条件を満たした段階までの状態で⑥へ渡る | 段階を飛ばして状態を進める／単体・結合の証明だけでVerifiedとする／L10の合格でAcceptedとする／意味の変更が必要な不一致を右側のコード修正で合わせる／意味を保てる不一致まで一律に左側へ戻す／見つけた検証層だけで戻し先を決める／L11の意味の差をコードの修正で合わせる／HELIX-OSの検収がないと使えない／外部の成果物を存在だけでVerified・Acceptedとする／この段階をサービス①〜⑦のどれかに所有させる |

### HARNESS-L2-023 利用条件別の依存宣言の受入

| 対応L2 | 成功条件 | 反例（不合格） |
|---|---|---|
| HARNESS-L2-023 | `version_target: 1.0`のpack contract revisionに依存identity、owner、dependency contract version/range、4区分、条件式、対象operation/source selectionを固定する。ある入力条件を与えると、常時必須＋成立した操作条件＋選択したsource条件の依存だけが有効closureとなり、条件不成立の依存、未選択/未観測source、参照のみの資料、unknown/staleを別状態で表示する。出力を同一入力・revisionで再評価したときclosureと理由が一致する。該当時の全安全依存は閉じ、必要identity/版/authority/evidenceのいずれかが不明なら該当操作を保留し、上記のowner/POへ戻す。 | 全source対応表を全呼出しの必須依存と読む／逆に依存リストを単なる対応可能一覧とみなし必須を落とす／unknown条件をfalse・参照のみ・未選択へ暗黙変換／stale/未対応契約版を黙読替え／安全依存をoptional化／一source失敗から無断fallback／未選択sourceを「未使用成功」「利用可能」と表示／人の代行で権限・version・scope・検証・receiptを省略／単体packのgreenから上位構成を成立扱いする |

**正常例と反例**

- **正常例：選択入力元に応じて必須**。HELIXLABO-L2-001の入力元一覧を「毎回すべて接続必須」とは解釈せず、Worker観測を一件集積する利用でWorker入力sourceのHELIXLABO-L2-028を選ぶ。028のsource identity/契約版/scopeと、その操作に適用されるsecurity/data-use条件をclosureに含める。021–027と029–030はこのrunでは「未選択・未観測」と明示し、LABO 001が全source入力に対応することや他sourceの成功・不在を推測しない。後で別sourceを選ぶ場合は、そのsource固有依存を別の利用入力として閉じる。
- **正常例：特定操作時のみ必須**。packが事前宣言したoperation-specific dependencyについて、当該呼出しで操作条件がfalseならその操作依存をclosureへ含めず理由を記録する。同じpackにおいて条件がtrueになる操作ではその依存を必須として追加し、版がunknownなら当該操作だけ保留する。packの別操作や対応能力全体の完成を根拠なく保留条件にしない。
- **正常例：常時必須と参照のみ**。常時必須のversioned contractは全利用で照合する。説明用資料は参照のみと記録する。authority sourceやrequired oracleを「参考資料」に分類しようとした入力は、その意味上の要件に基づいて拒否する。
- **正常例：人が実作業を代行**。同じoperation/source selection、scope、依存版、authority・隔離範囲で実施し、actor、入力/出力revision、検証結果、受領receiptを残す。該当安全依存は全て成立したままになる。必要条件の証拠を代行者の主張だけで省略しない。
- **反例：過剰依存**。LABO 001を利用する全caseでsource接続021–030の十件すべてを常時必須とし、Worker observation一本の限定利用まで別source一式完成待ちにする。
- **反例：過少依存**。Worker source 028を選んだのに028の契約/版/受領を外す、またはSECURITY/data-use/authority条件を「選択されていない」扱いにする。該当security applicabilityを判断できないまま実行可能扱いする。
- **反例：誤分類・隠れfallback**。sourceが未選択なのに利用可能または未利用成功と報告する、選択sourceがstaleのとき別sourceへ黙って切り替える、条件unknownを参照のみへ落とす、必須の人確認/検証を手作業という理由で消す。

### HARNESS-L2-024 要求形成の質問優先と収束の受入


| 対応要求 | 利用入力・合格結果 | 反例（不合格） |
|---|---|---|
| HARNESS-L2-024 | 同一engine/pack/target revision・scopeの指示、既回答、要求candidateと不足一覧を与える。高影響の未決事項が、影響・不確実性・下流変更cost・人間専決度とともに優先提示され、回答済み質問は重複せず、未回答項目は同じopen itemで追跡される。actor/task、正常/取消/failure/timeout/recovery、P0/P1、contradiction/defer owner/re-entry、implicit matrix、利用可能なiteration history、該当時prototype agreementを各statusと根拠で示す。必須情報unknown等の形成不備と、形成情報が揃った後の人間確認・合意待ちを別状態として示し、同一入力revisionで同じ候補・質問順序・理由・状態を再現する。 | 高影響unknownより低影響表現を先に問う／同じscope・回答済み質問を言い換えて再質問／新根拠なしで合意回答を再開／根拠なく人間専決値を補完／正常系だけでfailure/cancel/timeout/recovery、actor、surface、matrixを省く／矛盾/deferにowner・re-entryなし／N/A理由なし／利用可能な履歴やprototype agreementを無視／score、質問数、訂正率、iteration数だけで形成不備または人間合意を閉じる／timeoutを成功扱い／OS登録、engine candidate、Issue/PR、沈黙から採択・操作権限を作る。 |

**具体的な正常例・反例**

- **正常例・優先順位と重複**：同じtarget revision/scopeの既回答「対象actorはproject owner」を履歴に持ち、未回答の質問として「data retentionのowner」と「表示ラベル」を持つ。後者より先に、authority/data-useに影響する前者を根拠付きで示す。既回答actorを聞き直さず、owner未決を残す場合は担当・決定選択肢・影響候補を提示する。
- **正常例・同順位**：影響要素が同順位の二つの未回答質問を与え、pack revisionで固定したtie-break規則の期待結果どおり一意に選択する。同じ入力の再評価で順序が変わる、規則欠落を暗黙に補う、同順位の片方を消す場合は不合格。
- **正常例・合意再開**：agreement後に新しいL1 revisionまたはsource findingが到着し、特定のactor/scope条件を変える。engineは新根拠revision・旧新差分・影響identityを示し、affected decisionだけをownerへ戻す。関係ない合意はそのまま維持する。
- **正常例・形成資料準備、合意待ち**：必須behavior fieldsとfailure/surface/matrixが解決または理由付き非適用で、残るsecurity/法務の決定について原文・選択肢・推奨・影響と判断ownerを提示する。必要情報が揃い、decision packetが確認可能なため人の確認待ちへ進めるが、必須情報unknownによる形成不備とは区別し、当該判断・人の要求合意・L3承認はpendingのまま。
- **正常例・補助計測**：同一fixtureと未見fixtureで質問量・訂正率をengine候補のloopに沿って記録し、scope・対象・engine/pack revision・分母/測定方法・失敗内容を添える。現時点で根拠のない数値thresholdを設定せず、未決の必須判断は引き続きopenとして出す。
- **反例・必須の取りこぼし**：actor/taskやcancel/failure/timeout/recoveryを空欄にし、正常系が説明できることだけで収束させる。implicit matrix上のpermission/privacy項目やP0/P1 surfaceを無言で省略する。
- **反例・重複と再開**：同じrevision/scopeの回答済み質問を別表現で再送する。理由のない回答矛盾を無視・自動解消し、新根拠なしに合意を再開し、無関係な要求やすべてのagreementをstaleにする。
- **反例・スコア/回数による偽収束**：fixture scoreが高い、iterationが2回に達した/達していない、質問がN回、訂正率が低い、timeoutした、という理由だけで形成不備を消す、または人の合意を成立させる。
- **反例・人間判断の代行**：金額/権限/法務等の値をモデルが推定し、提案を合意済み要求・承認・実行可能へ変える。相談、Issue、PR、CI、沈黙をapprovalに使う。
- **反例・scope/data stale**：対象L1/source revisionが変化したのに旧回答やprototype agreementをcurrentとして流用する。変更影響がunknownなのに未影響へ変換する。
- **正常例・timeout**：応答期限に達したらactor/scope/target revision/最後のevent/open question/owner/re-entry conditionを保持して保留にする。再開時は新しい回答等を追記して差分を再評価し、途中で回答・合意・採択を生成しない。


- **初回形成**：既回答がまだない初回入力は明示的な空履歴として扱い、履歴が2回未満という理由で質問形成を拒否しない。既にある回答記録の紛失や対象revisionの不明は別の不足として示す。
- **計測の接続**：[engine候補の補助計測](../candidates/requirement-engine-python-core-requirements.md)に従い、同じfixtureと未見fixtureで質問量・訂正率・必須条件の見逃しを再測定できること。件数を減らすために必要な質問を落とした例や、訂正未観測を0とした例を改善として通さない。本受入は未実行の候補であり、実測値やengine完成を主張しない。

- **正常例・適用対象の合意未了**：prototype／非UI合意が該当し未了の入力でも、要求候補・根拠・未決判断packetを返し、合意待ちを明示する。合意未了だけで候補形成を拒まない。既存合意済み記録の紛失は別の形成資料不足とし、どちらも合意・freezeを捏造しない。

## 成果の内容品質に関する受入追補候補（G12）

本節は既存L2 identityのL11追補候補である。L2本文の意味・採否・owner・版範囲を変更せず、試験を実施済みとも扱わない。

### 共通受入の前提

各行の試験は固定したrequirement/design/contract/test-oracle revision、対象成果物revision、依存版、scope、実測結果で内容判定する。正常例に加え既知の誤り/反例と未公開だが同scopeの例を入れる。template/trace/test/evidence fieldの存在だけでは結果合格としない。oracle・判定基準・scopeが未提示なら「未評価/Provisional」を維持する。数値thresholdはL1/POで根拠がないため追加しない。成功は限定scopeに対するoracle結果であり、全欠陥不存在・あらゆる利用環境・万能品質を保証しない。

### 既存L11表の追補文

既存の「リリース単位の要求とパック境界の受入」へ本節を追補する。primaryは表に記したL2/L11 identityであり、親full IDが主たるL1責務。context parentは評価材料/接続範囲であり、所有責務を移さない。

#### HARNESS-L2-014（③設計）— `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-009`, `HARNESS-L1-001` / version_target 1.0

**正常**: ひとつの指定design unitで、承認済みrequirementsの明示制約（例: tenant境界維持、指定API契約、禁止side effect）をtemplateに基づいて設計へ反映する。oracleは各制約と設計要素の対応だけでなく、設計結果がfixture上で制約を満たすことを確認する。変更fixtureでは影響を受ける要求、隣接境界、対の検証設計を事前oracleに照合する。

**誤りを含む例**: seeded designがtenant境界を越える、許可されないside effectを含む、または一つの変更が影響する必要検証を落とした場合は不合格。template項目やtraceが全て埋まっていても、実制約違反・変更影響の見落としを合格にしない。

**未見例**: 作成側に伏せた別requirement combination/変更位置で、同じ適用範囲の制約充足と影響集合をoracleに照合する。scope外・oracle未提示は未評価。templateが要求の意味を決めたり、下位designを束ねただけで構成体design義務を満たしたりしない。1.0範囲の限定design fixtureの結果であり、全設計の正しさを保証しない。

#### HARNESS-L2-015（④開発）— `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-001`, `HARNESS-L1-004` / version_target 1.0

**正常**: 凍結済みdesign/contractと限定された実装scopeに対し、事前固定したbehavioral oracle/testで要求結果を得る。seeded正常caseの結果・artifact revision・対応する検証記録を照合し、当該開発単体の成果状態はProvisionalであることを確認する。

**誤りを含む例**: requirement違反、public contract変更、known seeded bug、または正常fixture退行があるコードを与える。原子CIがgreenでも内容oracleに反するなら品質受入失敗とする。設計/テストとのtraceや省略検査の記録の存在は必要だが、実結果を代替しない。④単体の出力をIntegrated/Verified/Accepted/Release eligibleへ進めない。

**未見例**: 未公開の同scope input/edge caseを既存のfrozen oracleに対して動かし、実結果が期待behaviorと合うか確認する。oracleがない入力、対象外のdomainやpropertyはunknown/未評価のままにする。合格はこのartifact revision・contract・実行範囲に限り、「ミスなく作られたコード」を欠陥不存在の一般保証として読まない。HARNESS-L2-022で後段を別途検証する。

#### HARNESS-L2-016（⑤Refactor）— `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-003` / version_target 1.0

**正常**: paired design/contract、要求と既存oracleを固定したrefactor前後で、指定scopeのobserved behavior、public contract、要求を比較し、同じ結果になることを確認する。Performance RefactorはL2記載どおりbaseline/budget/workload/profile/statistical condition/regression oracleを測定前に固定し、profile対象改善と全regression oracle結果を実測比較する。

**誤りを含む例**: seeded boundary/API/behavior regression、要求意味変更、またはperformance budget違反を入れ、差分・oracleから検出され不合格となること。測定不能な「速くなった」、構造が短くなった、または局所benchmark改善だけで他oracle regressionを無視する結果は合格でない。

**未見例**: 未公開の同scope call sequenceまたはinputをrefactor前後に与え、固定oracleで互換性を確認する。性能値は同じ環境/workload/profileに対応する値として報告する。scope外 behaviorや比較不能環境は未評価。要求・契約・境界の意味を変える必要があれば上流へBackflowし、右側で黙って変更しない。「境界を保ったきれいなコード」はこの限定比較を指し、全コードの保守性/性能を保証しない。

#### HARNESS-L2-022（コア検証と受入契約）— `HARNESS-L1-005`, `HARNESS-L1-001`, `HARNESS-L1-004` / version_target 1.0

**正常**: 対象artifact revisionに対しL8/L9 oracleでIntegrated、L10 system oracleでVerified、L11の上記能力別内容oracleと、当該revision/scopeに対する利用者受入およびその記録をそろえてAcceptedへ各証拠を段階的に照合する。oracle成功だけから利用者受入記録を生成しない。設計・実装・refactorの各受入結果に対して、そのscope内で何を確認したかを引き継ぐ。外部artifactも同じrevision/paired design/requirements/oracle/result/evidence条件で段階ごとに評価する。

**誤りを含む例**: 下位stage passだけでsystem固有義務の差分を確認せずVerified、L10 passだけでAccepted、またはtrace/evidenceの存在だけで品質をAcceptedとしたら不合格。L11内容oracleが成功しても利用者受入記録が欠ける/対象revisionが違う例はAcceptedにしない。L11内容oracleが失敗すれば、Provisional/Verified等、実際に満たした段階に留める。意味変更の必要なfailureはコードで合わせず、HARNESS-L2-003/004のBackflow先へ戻す。

**未見例**: 未公開の同scope artifactまたは外部持込み成果物で、同じstage contractとoracleを適用し、結果内容・証拠・revision対応が一致するか確認する。oracle不在/失効/適用scope不一致は上位stateを生成せず未評価として残す。CI green、artifact存在、下位単体合格は上位受入の代替でない。受入契約は判定の段階と証拠を持ち、HARNESS/INTELLIGENCEがOSのticket運転・検収を担うことはない。

### 原文と旧資産

[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第4項、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)を起点とする。旧VDH-FR-004〜013 / AC-004〜013の設計義務・対の検証・変更影響、旧UWJ-FR-002〜014 / AC-002〜014の判断・配分のproposal境界と品質計測、旧Bench R-03〜08 / AC-003〜014のtask/oracle/条件を固定した結果比較を読み、正常・誤り・未見の限定fixtureで内容を判定する受入へ再導出する。旧schema・runner・閾値・runtimeは移植/実行しない。

- `LEGACY-ASSET-335176749F6322C3CD8D`：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md:42–51`、SHA-256 `7dd1aff53747c60d080cdc367407751fb707e20b839ad64a9462537bb525cb2d`。
- `LEGACY-ASSET-879D95C07B789C9502CF`：`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ai-vision-design-harness-engine-acceptance.md:20–29`、SHA-256 `6b72ed546c07349dfd5b59e78f15ddfbb353ea0b232b7c8b5de8d1cae7854191`。
- `LEGACY-ASSET-5EE032D657C221184B00`：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:46–58`、SHA-256 `e20f475a3d1d082842415c2b734233e33a59f1b0bb1046c41e4ff4ec9c700e5b`。
- `LEGACY-ASSET-6FFD7F4E58066D08B053`：`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:18–30`、SHA-256 `1c4e07263eba5254cfe66b920c4baf46227e0e07cb47ff60ac2e854740645db3`。
- `LEGACY-ASSET-28FB139B26CD61CC51EE`：`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76–147`、SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`。
- `LEGACY-ASSET-A952A3A175EB82A4781B`：`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30–41`、SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`。

## 効果判定の優先関係に関する受入追補候補（G13）

[LABOの比較評価候補](../../helix-labo/L2-requirements/labo-requirements.md) HELIXLABO-L2-059および[INTELLIGENCEの配置入力契約候補](../../helix-intelligence/L2-requirements/intelligence-requirements.md) HELIXINTELLIGENCE-L2-067との責務境界を保持する。対象scopeに有効な品質・優先・許容悪化の判断は再利用し、未決・失効・適用境界外のみ判断ownerへ戻す。本追補は未実行の受入候補であり、実測改善や要求採択を生成しない。

| 対応要求 | 合格条件 | 反例 |
|---|---|---|
| `HARNESS-L2-015` L11補強（単体、parents `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-001`, `HARNESS-L1-004`） | 開発単体の出力をProvisionalに保ち、品質firstのoracle結果と省略検査を明示する。費用・時間が改善しても必要qualityを満たさないrunは改善成功にしない。 | Atomic CI/コード存在だけで品質適合・effect success・Acceptedとする。 |
| `HARNESS-L2-016` L11補強（単体、parents `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-003`） | performance比較は既存baseline/budget/workload/profile/statistical condition/regression oracleに従い、対象scopeのbefore/after結果と契約回帰を示す。費用・時間改善でbehavior/contract/requirement退行を相殺しない。 | profile対象の局所改善でregressionを隠す／性能oracleなしに「速い」とする／右側で上流意味を変更する。 |
| `HARNESS-L2-022` L11補強（単体、parents `HARNESS-L1-005`, `HARNESS-L1-001`, `HARNESS-L1-004`） | quality/security/acceptance oracleをstageごとに結び、provisional→Integrated→Verified→Acceptedの証拠と適用scopeを別々に判定する。未評価またはoracle/receipt不足の品質は未評価のまま保つ。 | lower-stage pass/CI green/evidence presenceだけで上位stageを成立させる／意思決定や要求承認を改善scoreで生成する。 |


## G15 設計合成候補の受入

起点は[PO原文第1項](../sources/capability-reinforcement-po-original-2026-09-27.md)と[判断記録](../../governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md)。以下は未実行の受入候補で、内容oracleとscopeが特定できたrevisionに限って判定する。fieldやtraceの存在だけを合格にしない。L3承認、要求採択、設計承認、実装許可を受入から生成しない。

### HARNESS-L2-026 unit（`HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-009`, `HARNESS-L1-001`）

**正常例**：対象L2要求/L11に結ばれた承認済みL3要件「申請は承認後に編集できない」を入力し、state/承認遷移、API/command precondition、actor別permission、画面での編集可否・拒否表示、DB/data更新不変条件を一組の設計候補として対応付ける。事前に定めたoracleで、各経路が承認後更新不可の意味を満たし、要求から設計へ・設計から要求へtraceできることを確認する。Design Template・CORE・BRAIN connector契約は常時必須である。BRAIN知識を使わない範囲でもconnector契約を照合し、その上で当該Patternを未選択/未観測と記録できれば、全知識完成待ちにしない。Pattern衝突fixtureでは、競合する制約・根拠・影響範囲を出し、代替構成を要求の不変条件oracleに照合する。採用可能な代替は不変条件をすべて満たし、両案の差分を示すこと。

**誤りを含む例**：画面が編集を隠すだけでAPI/commandが更新を受理する、権限のある別actorが迂回できる、同時更新でDB/state不変条件を破る、L3承認がない、要素間で要求revisionが異なる、または提示した代替構成が不変条件を破る。設計要素の欄やtraceが存在しても、違反経路をoracleで検出できなければ不合格。要求意味を「承認後の訂正可」へ変更した出力も不合格でL2-008へ戻す。

**未見例**：作成側へ伏せた同scopeの別actorまたは競合更新経路を検査し、固定oracleで承認後不変条件を照合する。対象scope/oracleがない、L3 authorityが不明、または異なる要件revisionは未評価/保留とする。合格は当該design unitの限定scopeに限り、構成体整合や実装品質を保証しない。

BRAIN知識接続の正本の受入は、[HELIXBRAIN-L2-030の対](../../helix-brain/L11-acceptance/brain-acceptance.md)に置く。本HARNESS unit/compositeはconnector契約版・互換を常時照合し、選択Patternを設計へ使う場合は当該connection receiptと知識条件を受入入力にする。未選択knowledgeは未観測であり、接続契約自体は任意化しない。

### HARNESS-L2-025 composite（`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-007`, `HARNESS-L1-009`）

**正常例**：同じ要求/L3 revisionで、申請作成→承認→承認後編集要求→拒否を画面・API/command・permission・state/data invariant・verification oracleまで辿る。構成体固有のoracleにより、各要素が同じ承認後不変条件を共有し、要求から全設計要素、対の検証設計まで双方向traceが閉じることを確認する。HARNESS-L2-026 unitのreceiptとBRAIN connector契約の照合が常時必須。選択Patternを利用する場合はHELIXBRAIN-L2-030 connection receiptも必須とし、構成体がその選択された知識条件を検証する。connector自体や受渡し契約を任意扱いにしない一方で、選択されていない全知識の完成は要求しない。

**誤りを含む例**：各画面/API/DB単体のfieldが埋まっていても権限・stateの前提が食い違う、traceが片方向、Pattern conflictを見落とす、構成体oracleがないのにunit合格を積み上げて成立扱い、または承認後更新経路を一つ残す。いずれも不合格。複数Patternが衝突する場合は、要求意味を保つ代替を比較可能な候補として示す。意味を変える代案の採用は提案せずL2-008へ戻す。

**未見例**：伏せた追加actor/state transitionを加え、端から端の許可/拒否条件・state/data invariant・影響traceのoracle結果を確認する。未評価のdomainや未提示oracle、L3承認・contract版の欠落は未評価/保留を維持する。composite合格は当該revisionと範囲の設計整合だけであり、実装成立、全プロダクトへの万能性、HARNESS全体の受入を意味しない。

### 014・026・025の境界と交換の受入

**正常**：利用者が014（③設計サービス）を選んだ構成で、026を設計構成の常時必須パック、025を提供する設計一式の横断整合検査として依存閉包へ含める。014が入力受付・差戻し・成果提供、026が具体設計と対の検証設計の生成、025が端から端の固有義務の検査を担当することを入出力で確かめる。014の完了receiptなしで026の生成から025の検査まで進み、他の①②④〜⑦サービスを導入せず014の出力契約を満たす。026を互換な別revisionへ交換した例で、契約版・scopeと同じ固定oracleの再検証結果を014へ結ぶ。

**誤り**：026を第二の③製品として任意選択にする、026欠落で014の具体設計生成を成立扱いする、025未実施で設計一式の横断整合を保証する、026の開始に014または025の完了を要求する、交換後も旧receiptを再利用する例は不合格。非互換・staleなら014の提供を保留し、契約ownerへ戻す。

**未見**：伏せた026の互換契約変更または出力scope変更を与え、014側の影響scopeと025の横断oracleを再評価する。互換な変更は再検証で成立し、未対応・非互換な変更は保留されることを確かめる。検査は対象revisionの候補であり、候補採択を意味しない。

### 依存区分と受入停止

各受入ではHARNESS-L2-026のDesign Template/CORE/BRAIN connector契約とL3 authority、HARNESS-L2-025の構成体scope/oracleを常時照合する。対の検証設計は常時出力必須とし、UI設計など対象別の専用契約と個別oracleは該当scopeで追加する。選んだPatternのidentity/version/compatibility/required inputは選択時に必須。背景資料は参照のみとする。未承認・missing・unknown・conflict・staleの必須入力がある操作は保留し、Pattern未選択は未観測とする。
## G16 既存製品のReverseと差分改修の受入候補

起点は[PO原文第2項](../sources/capability-reinforcement-po-original-2026-09-27.md)、[判断記録](../../governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md)、および追補candidate HARNESS-L2-027/028/029である。以下は未実行の内容oracle候補。各operationのsource authority、版、scope、対象を先に固定し、design revisionは保存設計との比較をする028/029で要求し、027単体には課さない。field/traceの存在のみを合格にしない。候補受入から要求・設計の採択、L3 approval、コード変更・migration適用の許可を生成しない。

### HARNESS-L2-027 unit（`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-005`）

HARNESS-L2-019は製品単位のFull Reverse入口とHELIX形式のresult/unknown境界を所有する。027は019から呼び出し得る選択source型の抽出unit/pack candidateで、019の完了receiptを前提にしない。HARNESS-L2-010/011がpack identityとcall/input contractを所有し、HARNESS-L2-014は承認設計のauthorityを保つ。027の出力は観測candidateであり、設計stageの承認成果ではない。

**正常例**：選択されたcode fixture（`if status != "draft": return 409; if amount > max: return 422; persist(amount); return 200`）のrevision/digestを入力する。抽出候補は、status guardがdraft以外を409で拒否すること、amountがmaxを超えると422で拒否してpersistへ到達しないこと、draftかつamount<=maxではpersist後200になることを各source spanへ結び、状態遷移・guard・副作用の順を明示する。これらはcodeから観測した振舞い候補であって、要求意味・承認設計・runtimeで実測した結果とは表示しない。選択したDB schema/API definition/configも各revision/digestと根拠spanへ結び、認識不能constructをunknown/unsupportedとして返す。未選択typeは未観測で「存在しない」としない。019の完了receiptやsaved design revisionなしでも、019のintake/result boundaryに沿うsource observationとして単独で成立する。

**誤りを含む例**：別branchのsourceを同じ対象としてjoinする、任意に添えた保存設計revisionがsource対象と不一致なのにsource observationの根拠として混ぜる、unsupported config keyを既定値と推測する、静的codeからの推論を実測behaviorまたはRequirementとして出す、parseできないcustom functionを削除対象扱いする、未選択sourceを「差分なし」と判定する場合は不合格。027の単独抽出は保存設計との比較を行わない。Missing/stale/ambiguous inputがある部分はunknownを保ち、既存要求・設計を書き換えない。

**未見例**：作成側が知らないAPI schema versionまたは未見のDB definition fieldを含むfixtureを入力する。対応できる範囲を根拠sourceとともに返し、非対応field/挙動をunknown/unsupportedに残す。共通fieldの抽出成功から未見fieldやruntime-only behaviorの抽出成功を外挿しない。対象version契約なしは保留とする。

### HARNESS-L2-028 connection（`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-006`）

**正常例**：同一product/scopeに属する027の抽出receiptと、対象revision/source/authority状態を確認できるcurrent saved design revisionを比較入力し、既知trace上のAPI変更をaffected exact setへ写す。comparison candidateとしての入力はapproved状態を意味しない。approvedとの主張は当該revisionに結び付くapproval receiptがある場合だけ許し、unknown/staleをapprovedへ昇格しない。外部で新規追加された独自処理は変更候補と保存対象に識別し、無関係なdesign/APIをaffectedへ混ぜない。known traceの局所比較とHARNESS-L2-003/004のScoped Reverseを用いる。

**誤りを含む例**：過去のsource receiptや違うdesign revisionを使う、対象revision/source/authority状態がunknown/staleなのにapprovedと主張する、approval receiptなしでapproved状態へ進める、単語/同じpathだけでaffectedを推測する、影響関係不明をUnaffectedにする、通常のscope付き差分で全体Reverseを強制する、または意味変更をright-side patchへ隠す場合は不合格。trace欠落時はunknownを明記して全体Reverse/reobservation候補へ送る。L2/L1のmeaning差はBackflowへ返す。

**未見例**：未見の独自helper functionとAPI dependencyが同じscope内に追加されたfixtureを入力し、抽出されたrelationとsaved designの既知edgeだけaffectedとし、不明edgeはunknownとして残す。confidence/filename similarityだけから保存designに存在したことや変更の非影響を主張しない。設計authorityのcurrent revisionが不明なら比較を保留する。

### HARNESS-L2-029 composite（`HARNESS-L1-001`, `HARNESS-L1-003`, `HARNESS-L1-004`, `HARNESS-L1-005`, `HARNESS-L1-006`）

既存HARNESS-L2-014が設計成果/authority、019が単体製品のFull Reverse入口、027が選択source抽出unit、028が抽出と保存designのconnectionをそれぞれ所有する。029はそのunit/connectionを通した差分改修proposalのcompositeで、各既存identityやpack境界を置き換えない。

**正常例（PO例を含む）**：対象revision/source/authority状態を特定できる保存designを比較候補として入力する。approvedとの主張は当該revisionに結び付くapproval receiptがある場合だけ許し、unknown/staleをapprovedへ昇格しない。そのうえで保存済みdesignが`/orders/approve` APIの変更を要求し、利用者が外で加えた`normalizeSupplierCode` custom processingを保つfixtureを与える。027が現実装・DB schema・API定義・設定をsource-bound candidateとして抽出し、028が保存designとのexact deltaとaffected APIを絞る。029のbundleには、該当APIの設計差分、当該APIだけのcode repair案、保存対象として特定した`normalizeSupplierCode`と非変更根拠、必要なDB schema migration案（source/target schema、対象scope、compatibility/rollback oracleまたは不足）を相互traceして返す。関係のないAPI/custom processingを含めない。migrationが不要なら「この対象では案なし」とoracle根拠を示す。出力はproposal/diff/planであり、working treeやDBへ適用しない。

**誤りを含む例**：独自処理を生成案で上書き・削除する、関連しないAPI全体を再生成する、DB migration案にdata-loss範囲・version前提を隠す、移行案を自動実行する、要求意味・saved design authorityを変更する、対象revision/source/authority状態がunknown/staleなのにapprovedと主張する、approval receiptなしでapproved状態へ進める、unknown sourceを既定処理で埋める、またはsource→delta→proposalのtraceを別revisionで混ぜる場合は不合格。意味保存なら限定proposalと対象検証、意味を変えるなら該当層へのBackflowを示す。新規design/code/migration proposalは次revisionのcandidateに留め、現行approved designへ自動昇格しない。

**未見例**：作成側へ伏せた第2のcustom processorと変更済みmigration historyがある対象を与える。既知仕様/fixtureで確認できるaffected APIだけを候補化し、所有範囲・過去migration状態・互換性を特定できない部分はunknownとしてproposalを保留する。既知APIの成功から未見custom behaviorを保持できたと一般化しない。対応外DB/API/config/versionを未対応と明記し、silent fallbackしない。

### 共通依存・scope oracle

HARNESS-L2-027/028/029の各利用で、4区分を次のように判定する。

- **常時必須**：HARNESS-L2-019 input/result boundary、HARNESS-L2-010/011 pack identity/version/scope/receipt、product/source revisionの対応、source read authorization/data-useの明示。HARNESS-L2-003/004 Backflow/impact contractとrequirement revision/authorityとの対応は、要求traceまたは保存設計との比較を行う028/029の該当operationで必須とし、raw source extractionだけを行う027には要求しない。保存design revisionも028/029で比較基準にする場合に必須であり、027には課さない。028/029で比較候補のdesign revisionをapprovedと主張するには、そのrevisionに結び付くapproval receiptが必要であり、対象revision/source/authority状態のunknownまたはstaleはapprovedへ昇格させない。
- **特定操作時のみ必須**：selected API repair proposalのAPI contract/oracle、DB migration proposalのschema/data ownership・compatibility/loss/rollback oracle、あるsource typeのversion-specific extractor契約。当該操作を含まない利用までその操作依存を要求しない。
- **選択した入力元に応じて必須**：選択したcode/DB definition/API definition/config/baselineごとのrevision・digest・scope・schema/profile契約とreceipt。未選択source/baselineは未観測であり、他sourceへのsilent fallbackは不合格。
- **参照資料のみ**：一般説明、旧設計例、類似製品の文書。requirement authority・saved design revision・source relation・data owner・oracleを参照扱いにできない。

実体に対する変更適用、migration実施、commit/releaseは全ケースで本candidateの外である。POの「code repair案／data migration案」を「修正の実行」や「data移行完了」と読み替えたら不合格。各passは対象revision・product・selected-source・affected-scopeだけを示し、他製品への万能性やVersion 1全体の完成をclaimしない。

## G18 テスト・再現ケース生成候補のL11受入案

以下は未採択の候補identityに対する限定受入である。根拠はHARNESS-L2-030〜033候補、既存`HARNESS-L2-014`の設計出力、`HARNESS-L2-022`のoracle/段階契約、PO原文第4項と判断記録に置く。HARNESS-L2-014は設計対、HARNESS-L2-022はoracle/義務/stage受入契約を所有し、030/031はそれらを使う独立versioned capability pack、032は選択executor接続、033は処理段階の構成体を所有する。case数・coverage率・mutation閾値・reduction回数/時間を新設せず、各fixtureの内容と事前に特定したoracleを比較する。生成物の存在、構文妥当性、OS CI greenだけでcase生成能力または品質を合格にしない。

### HARNESS-L2-030 テストscenario・case・data・double生成（単体候補）

**正常例**：対象scopeと承認済みL3要件revision、それに対応するHARNESS-L2-014の設計・対の検証設計revisionへ結び付いたAPI/state contractとHARNESS-L2-022 oracleを与える。例として、申請をdraftからsubmit可能なactorで送信するとsubmittedへ遷移し、承認後は編集拒否かつ保存状態不変、というfixtureを用いる。正常submit、仕様に明記された最小/最大・空/null境界、権限のあるactorとないactor、cancel可能/不可の各state、submit前approveやterminal後update等の順序違反を、仕様の該当範囲に限ってcase化する。各期待応答・状態不変条件は独立oracleへ対応し、test dataの値とcase identityが再現可能であることを確認する。選択された外部service contractに対するdoubleでは、contractに記載された応答/timeout等を返し、期待呼出し数・副作用条件をassertできる形にする。合格は生成内容が入力contract/oracleに沿うことであり、生成caseを実行済みとはしない。

**誤りを含む例**：未承認actorを許可するcase、仕様にない取消や境界を期待値として発明、承認後編集を許容、oracleと逆の状態遷移、同じ誤ったgeneratorからexpected valueを作る、実サービスへネットワーク接続するdouble、secretをfixtureへ含めるcaseを入力/候補へ混ぜる。権限・状態・期待結果・data permissionに反するcandidateを検出して拒否または未確定へ送り、存在だけで合格させない。coverageの増加やcase countで矛盾を相殺しない。

**未見例**：同じAPI/state domainの未公開actor/入力境界/操作順を与え、入力oracleが定義する場合だけ対応caseと期待結果を作り、内容・trace・scopeが一致するか確認する。oracleが未定義、sourceが未選択、またはdomain外なら期待値を作らずunknown/未評価を返す。合格はこのfixture・contract revision・scopeのみに限り、全actor/全境界/全欠陥を保証しない。

### HARNESS-L2-031 ログ・入力からの最小再現と回帰候補生成（単体候補）

**正常例（具体input・独立期待値）**：approved applicationの`note`を変更するsanitized incidentを与える。既存requirement/API contractと022 oracleは「構文と必須fieldが有効なapproved状態のPATCHは409で拒否され、保存済みnoteを変更しない。空bodyは必須field欠落として先に422で拒否し、保存状態を変更しない」と規定する。未修正target revisionでは、認証済みowner actorから元input `PATCH /applications/42` body `{"note":"corrected","debug":"trace","display":"preview"}`（debug/displayは契約で許可された無関係metadata、保存済みnoteは`current`）を送り、200を返してnoteを`corrected`へ書き換えるfailureを記録する。HARNESS-L2-031はdebug/display等を除いたreduction candidate `{"note":"corrected"}`を出し、HARNESS-L2-032経由で選択executor（OS-020または利用者CI）へ隔離run requestを送る。後続receiptが同じtarget revision・environmentで同じowner actor・endpointに対する200と`current`→`corrected` note変更を確認すれば、元failureと縮小後failureは同一oracle違反として保持される。さらに削除した空bodyが422となりnoteを変えない結果なら、より小さい入力は同じfailureでないとして保持candidateを`{"note":"corrected"}`へ戻す。期待値はgenerator由来でなく既存requirement/API contract/022 oracleから独立に得る。run結果がまだ返っていないcandidateは同一failure確認済みとしない。修正後版で409かつnote不変となる回帰passは後段の別revision run receiptであり、031のcandidate生成前提にしない。

**誤りを含む例**：secret/PIIを残す、無許可production inputを使う、032のisolated run request/resultなしに縮小後も同一failureと断定、縮小後の200が別response/body mutationなのに同一oracle違反と主張、再実行greenで元failureを消す、修正後pass receiptを作成開始前から必須入力にする、修正前failまたは修正後passを未実行なのに回帰成立とする、oracle未確認の根因を断定する。安全違反は拒否し、oracle不一致・再現不能は未再現として返す。元failureを削除/skipしない。

**未見例**：既知fixtureとは異なる同scope failure inputと許可sourceを使い、同一oracleで縮小後のobservable failureが保たれるか確認する。ログ形式/環境が未知、必要入力が欠落、oracleがない場合は未再現/不足の状態と理由を返し、成功とも失敗原因確定とも扱わない。合格は対象scopeの限定reductionであり、一般の障害原因特定能力を保証しない。

### HARNESS-L2-032 生成artifactからOS-020実行契約への接続（接続候補）

**正常例**：HARNESS-L2-030/031からartifact identity, source version, target HEAD/scope, oracle referenceを受け、選択済みOS-020または利用者CIの明示schema/versionに適合するrun input packetを構成する。packet内容のidentity/version/oracle参照とconsumer receipt参照が対応することを照合する。consumer receiptと実行結果はOS/利用者CIから返る後続情報であり、接続能力の作動前提にしない。

**誤りを含む例**：別HEAD/別scopeのcaseを接続、oracle参照を欠落・すり替え、互換性のないconsumer schemaへ送る、外部double指定を落として実providerを呼ばせる、packet送信をrun passとみなす。該当入力を保留/拒否し、CI greenやticket発行をHARNESS受入へ読み替えない。

**未見例**：新しいが宣言済みschema互換範囲のconsumer revisionへcase packetを渡し、対象HEAD・scope・source/oracle identityを保持したまま受領できるか確かめる。未宣言consumerや互換性のないschemaは未接続/unknown。合格は宣言済みconsumer/version組に限定し、OSの実行・ticket・検収をHARNESSが担うことを意味しない。

### HARNESS-L2-033 failure-to-regression trace構成体（構成体候補）

**正常例（回帰成立の構成体oracle）**：構成開始時の入力は許可済みsanitized original incident、target revision、独立022 oracle、必要な031/032 pack contractだけで、将来の生成receipt・実行結果・修正後passは要求しない。031が縮小candidateを作り、032が各候補を選択executorへ隔離requestし、後続receiptを受けてから次候補を縮小する。上記PATCH例では元inputと`{"note":"corrected"}`が未修正版でともに200＋永続note変更となり、独立oracle「approvedなら409＋不変」に対する同一failureであることを確かめる。より小さい空bodyが同じfailureでなければその候補を採らない。そこでcandidate regression caseを固定し、修正前revisionで同じoracle違反（fail）、修正後revisionで409かつ永続note不変（pass）となる隔離run receiptを後段で結ぶ。case/repro candidateの生成だけでは「回帰成立」とせず、回帰成立operationで必要なすべての後続receiptが揃ったときだけ033は成立とできる。contract-derived routeだけを選択した場合はincident/reduction段階を未適用、failure routeを選択しない限り同じfailure証明を要求しない。

**誤りを含む例**：縮小前後のobservable failureが異なる、隔離run receiptなしに同一failureを断定、修正前runがfailしない、修正後runがpassしないのに回帰成立とする、別revisionの結果を混ぜる、未選択consumerを実行済みとする、将来receiptがないため初回case/repro candidateを開始不能にする、case/traceだけで022のProvisional/Integrated/Verified/Acceptedを進める。trace不整合/誤った期待値は不合格、未解決permission/oracle/consumer条件は保留とする。

**未見例**：fixture作成者が隠した同scope failureで、縮小candidateごとの032 request→executor result→次の縮小の順序が守られ、失敗症状が同一oracleに残るか確認する。回帰成立を選んだ場合は修正前fail/修正後pass receiptも後段で結ぶ。oracleなし・source未許可・互換consumer未宣言なら該当段階は未評価/未接続。unit candidateの受入合格は回帰成立や修正済みを意味せず、完全coverage/全欠陥不存在を主張しない。

### 共通の責務・結果限界

HARNESS-L2-014が対の設計を、HARNESS-L2-022と承認済み要件がoracle・受入の意味を保持し、HARNESS-L2-010/011が各versioned pack/call境界を保持する。030/031 candidateは独立した生成能力pack、032は選択したexecutorへの接続、033はcandidate生成から後続resultまで段階を結ぶ構成体である。`HELIXOS-L2-020`または利用者CIはrun構成・隔離実行・結果回収を行い、run resultはHARNESS-L2-022 oracleに対する後続証拠としてstage別に扱う。030/031/032 packまたは依存契約を交換した場合は010/011のversion/compatibilityを照合し、影響するcase/oracle/repro/consumer packetを新revisionへ結び直して該当operationを再検証する。014の対設計または022のoracle/義務契約が変わったfixtureでは、既存candidateのtraceと期待値を新契約へ照合し、staleなcase/reproは再生成する。縮小実行を選択した場合は選択executorのisolated run receiptを新しいpack/source revisionに対して再取得する。旧receiptや旧artifactの合格を新版へ流用しない。テストの生成・受渡しだけではtest pass、ProvisionalからIntegratedへの進行、Verified、Accepted、要求承認、releaseを生成しない。上流意味不足はHARNESS-L2-003/004に基づく該当ownerへ、権限/data-use不足はsecurity/data ownerへ戻す。


## HARNESS-L2-027〜033 所属候補と利用境界の受入

所属は未採択候補であり、本文の有無を所属の採択とみなさない。下表はL2-010の主owner一つ、共通能力と利用先の分離を要求段階で照合する。正式なmanifest形式はL3へ渡すが、機能の所属候補をL3へ先送りしない。

| identity | 主owner候補 | 正常例で保持する利用境界 |
|---|---|---|
| HARNESS-L2-027 | HELIX-HARNESS共通部品 | Full Reverseを選択する各サービス。019共通入口のsource型抽出packとしてsource/provenanceを返し、COREの意味/trace契約と③/014の設計authorityを保持する。019の完了を抽出開始条件にしない。 |
| HARNESS-L2-028 | HELIX-HARNESS共通部品 | ②要件定義・③設計・④開発・⑤リファクタリング等、差分の対象となるサービス。observationと保存designの比較を共有し、affected requirement/design/code/dataを該当ownerへ戻す。⑤専用にはせず、CONNECTの共通通信と業務上の比較を分ける。 |
| HARNESS-L2-029 | HELIX-HARNESS-CORE | 設計・code・dataの差分案に関係する各サービス。複数サービスの意味・設計・影響traceを同じscopeで束ねる構成体の所有候補。各成果のauthorityと適用は該当サービスへ残し、候補生成から実変更を行わない。 |
| HARNESS-L2-030 | HELIX-HARNESS-CORE | case/data/double生成を選択する各サービス。Conceptの横断test/CIに対応する共有生成pack。014の対設計と022のoracle/検証義務を使用し、OS-020または利用者CIの実行責務を所有しない。 |
| HARNESS-L2-031 | HELIX-HARNESS共通部品 | ④開発・⑤リファクタリングのfailure、⑦運用保守のincident等。PO原文の障害を本番incidentだけへ限定せず、許可されたlog/inputから再現・回帰候補を共有提供する。CORE/022のoracle/traceと選択executorの隔離実行を保持する。 |
| HARNESS-L2-032 | HELIX-HARNESS-CORE | 030/031利用サービスと選択したOS-020または利用者CI。test artifact/oracle/revision/scopeをexecutor inputへ写す業務上の接続packを所有する。CONNECTは利用時の登録・版照合・通信・再送・追跡を担い、032の業務意味は持たない。実行・隔離・結果回収は選択executorへ残す。 |
| HARNESS-L2-033 | HELIX-HARNESS-CORE | case生成・再現・回帰を選択する各サービス。複数packを跨ぐtest/CIのtrace構成体を所有する。unit/接続成立と回帰成立を分け、014/022の意味authority、OS/利用者CIの実行を引き取らない。 |

- **誤りを含む例**：同じpackを二つのサービスが所有する、028/029を⑤専用として他の変更先を塞ぐ、031を本番incident専用とする、032の業務意味をCONNECTへ移す、通信成功を実行成功とする、共有pack利用を理由に未選択サービス/OS内部構成を必須にする場合は不合格。各既存IDの4依存区分と入力・出力・failureの条件は維持する。
- **未見例**：未fixtureのサービス組合せから027〜033の能力を選ぶ場合も、主owner候補・利用先・選択操作の依存閉包を別々に照合する。未宣言の組合せは受入を推定せずunknownとして当該pack/サービスownerへ戻す。所属のラベルだけで互換性や内容oracleの検証を代替しない。
- **人の確認へ渡すもの**：029/031/032の共有部品とCOREのどちらへ置くかは、消化記録に原文・具体案・推奨・影響IDを残す。確認前も候補を一つ提示し、既存の機構別確認PRで判断する。新しい承認手続きは設けない。

## 要求別の計測契約の受入追補候補（REG-03）

### HARNESS-L2-034 計測契約と完成判定の受入（1.0、全件未実行）

親はHARNESS-L1-001／004／005、対はL2の同IDである。各例の判定には対象scope・要求revision・契約版・oracle版を固定する。

- **正常例**：異なる二つの要求を与え、それぞれのmetric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定triggerを区別した契約が得られる。13品質領域の適用または根拠付き非適用が分かり、必須metricについて代表環境のcurrentな結果と閾値充足を確認できる。HARNESS-L2-022へ計測義務と実結果を渡しても、計測成功だけで他のsystem固有義務やL11利用者受入を成立させない。
- **欠落の反例**：14項目を一つずつ欠かした契約、同じmetric IDを異なる意味へ流用した契約、根拠のないN/A・閾値・無制限の許容差を与える。欠けた項目と対象が示され、未確定を完成した契約と扱わない。形式上全項目があっても、対象要求に無関係なoracleや再現不能なprobeでは成立しない。
- **完成判定の反例**：他のコード・文書・testはgreenのまま、必須metricの①未測定、②stale、③非代表環境、④閾値未達を別々に投入する。いずれも対象system completionが拒否され、不足条件と戻し先・再測定義務が残る。他metricの改善や別環境のpassでは相殺できない。
- **工程・安全の反例**：局所probe成功だけでsystem計測を済ませる、利用実態の受入を省く、時間軸の評価を瞬間値で代替する、overhead／再現条件を欠く、計測証拠に本番secret／PIIを含める例を拒否する。旧層名や旧実行結果の流用では現行pairの証拠を補えない。
- **接続の反例**：OSやLABOがHARNESSのoracle・要求目標を黙って変える、外部利用者へ内部OS一式を必須とする、INFRAの後続版能力がないことだけで1.0の契約起草を止める例を拒否する。実測を求める段階では必要な実資源・権限を欠けば実測済みにしない。
- **未見例**：事前のfixtureに含めない要求・workload・環境の組合せでも、同じ14項目と品質領域・4失敗条件を適用する。未定の閾値や代表性を過去のfixture値から推定せずunknownを残す。別の実行手段に交換しても対象revision、内容oracle、実結果、計測overhead、再現性と再測定triggerを辿る。scope外の旧結果や試験用数値は製品の目標値にならない。
- **失敗後の引継ぎ**：契約修正・再計測・Backflowそれぞれのowner、未完metricと理由を保持し、session交代でも未完が消えない。技術条件を通常のL3へ具体化することと、要求意味変更の合意を区別する。

旧原文の対応はL2末尾の `REQSRC-SUP-00192〜00194`。旧sourceの意味を保つ候補の内容確認であり、これらの例の実行、採用、L3承認を宣言しない。

- **NFR固有の正常例**：AIを含む永続化対象について、stable ID/source authority/surface、target/error budget/hard limitの区別、適用する品質領域とAI条件、storage/並行性の計測・異常条件・risk別手法、時系列とrequirement/release/regression/改善episodeへの関係を確認する。契約起草時にまだ測っていない項目は未測定のまま実行ownerへ渡す。
- **NFR固有の反例**：①error budgetをhard limitと混同、②baseline unknownを0/greenへ置換、③非AI対象へmemory汚染等を無理由で強制、④適用するquery/projection p95/p99やlock/再構築/soak条件の脱落、⑤再現のない根因断定、⑥fault/race/crash等の適用を根拠なく省略、⑦手法導入だけで完成、⑧実測時系列と改善episodeの関係欠落、を個別に拒否する。各failureは契約・設計・環境・測定・要求の該当ownerへ返す。
- **NFR固有の未見例**：新しい保存方式・provider・非AI対象でも、同じ品質条件の適用性とsource authorityを照合する。特定DB機能がないだけで旧実装を要求せず、対応する性能/回復/並行性のoracleを導く。根拠不明をN/Aにせず不足を残し、HARNESS005のticket別選択を超えた一律検査を追加しない。

旧source追補：`LEGACY-ASSET-02319C2481B9E01698D5`のHR-NFR-REG-001〜007（監査基準6fabd125:354–360、PREISO:369–375）を同一条件の別revisionとして保持する。旧NFR registryのschema/層番号/DB/metric event実装を現行へコピーせず、034の計測契約と005のticket/risk選択へ意味再導出する。元の13領域・14項目・4拒否条件を削除しない。未採択追補であり250候補の採択は継承しない。

### HARNESS-L2-035 要求候補の導出根拠と受入への寄与の照合

- **対応・境界**：L2-035と同じ未採択候補、1.0。原指示・上流revisionから要求候補への意味照合であり、工程反復やFeedback循環を禁止する検査ではない。
- **正常**：異なる原指示の表現から、同じscopeの候補を導き、上流revisionとauthority状態、受入への寄与、必要性、代替案、budgetの根拠を追跡できる。後続版の候補はその版と根拠を保持し、初版から除外しても削除されない。
- **個別反例**：候補Aだけを根拠にAを正当化、同時追加A/Bで互いを唯一の根拠にする、ID登録だけを上流根拠にする、存在しない上流、別revision、出所不明、非循環でも上流にない能力、受入寄与のないscope拡張、budget不明を0として扱う例を個別に投入し、根拠充足を主張せず不足/訂正へ戻ることを確認する。
- **未見・変化**：別branchから同じ上流へ導く候補でも、意味・revision・適用条件を再照合する。上流訂正後は以前の導出結果を流用しない。正当なFeedback循環や修復反復を、根拠循環という理由だけで不合格にしない。
- **責務**：CORE単体で結果を出せ、OS利用時も登録・実行許可と意味照合が別状態になる。未完候補から人の合意や実行権限を生成した場合は不合格とする。

### HARNESS-L2-036 検証観点の完全性とローカル・CIの同一契約の受入

**対応要求**：`HARNESS-L2-036`（unit candidate、`version_target: 1.0`、未採択）。親L1は`HARNESS-L1-001`, `HARNESS-L1-004`。HARNESSはgate・oracle契約を定め、選択されたticketのCI/実行と証拠保存はHELIX-OSが担う。既存`HARNESS-L2-005`のrisk/ticketに基づく段階選択と、`HARNESS-L2-022`の段階別oracle/利用者受入契約を維持する。

**受入例**

| 種別 | 入力と期待結果 | 不合格または保留となる反例 |
|---|---|---|
| 正常：W観点 | 同一対象revisionの現行設計成果、テスト設計成果、test-level定義、およびticketで選ばれた検証profileを渡す。各適用設計項目に該当するテスト観点が対応し、同一観点を複数levelへ重複計上していないとき、適用scope内の抜け0・重複0としてW gateをpassする。非適用は理由を保持し、実行を選択していない上位testを実行済みにしない。 | 設計項目に必要なテスト観点が結び付かない、level間重複がある、またはN/A理由のないscope除外をpassにする。W gateがfailなら該当ticketの合流条件を満たさない。 |
| 正常：dev-local/CI parity | Forward小ticketのprofileが原子lint/gateを選んだ例を用いる。dev-localとCIの双方が同じ内容snapshot、gate identity/version/settings、対象scopeを照合し、各結果がその環境の対象revisionに結び付く場合にparity成立とする。commit前のlocal revisionと後続CI revisionでcommit SHAが異なること自体は不一致にしない。OSはHARNESS-L2-005の規則で対象検証を組み立て、選択した範囲を実行・記録する。 | editorでpass、CIで異なる版/設定を実行、対象scope相違、または片側のresultが欠ける場合はparity不成立。editor fail後、局所修正へ戻さずcommit可能とする構成は不合格。 |
| 正常：cross-detection | 適用profileのscopeに対し、依存漏れ、契約漏れ、接続欠損、デグレを個別の観点・根拠・結果として返し、四観点がすべて0件で結果観測も完了している場合にのみcross-detection gateをpassする。 | どれかの観点にfindingが1件以上ある、または未観測なのに0件とする場合は不合格。 |
| 条件付き正常：FE 5軸 | 画面ありの適用記録と合意済みscreen scopeを持つticket対象でL2 prototype/screen scope、design-token SSOT、対象screenshots、state transitionと適用oracleを与える。`mock-promotion`、`design-token-drift`、`a11y-regression`、`visual-regression`、`state-transition-drift`の5軸すべてについて決定論的`DetectorResult`のpass/fail+詳細とCI証跡とのrelationが返り、すべてpass evidenceがある場合だけFE gateをpassする。 | 5軸の一つでもfailまたは必要証跡欠落ならpassにしない。非画面と根拠付きで判定されたticketへFE 5軸を一律要求する構成も不合格。画面ありの適用記録と合意済みscreen scopeを持つticket対象で一軸をN/A/非適用へ落とす構成も不合格。画面判定やscreen scope/合意がunknownなら003/008へ戻し、非適用にしない。 |
| 誤り：適用・oracle | FE軸で参照するtoken SSOTが別revision、screenshotsが対象scope外、transition oracleが失効、test profileの対象要求とのrelationがstaleである例を与える。誤った根拠をpassに流用せず該当結果を保留する。意味/oracle不足はHARNESS-L2-008または022、対象revisionとticketの運転はOSの該当境界へ返す。 | artifactの存在、CI green、違うrevisionのpass、単体の結果だけを受けてsystem/利用者受入まで自動成立させる。 |
| 未見：W scope拡張 | 公開fixtureにない設計項目を同scopeへ追加する。existing test-level定義と要求oracleから該当観点・levelを決められる場合は新しい対応行として判定し、根拠がない観点は不足一覧へ、oracle自体が未提示なら未評価へ返す。 | 未見という理由だけで適用範囲内の項目を一律拒否する、または未定oracleをAI補完してpassにする。 |
| 未見：gate parity | 同じticket-selected gateのdev-local設定が未公開の同scope実装でも、gate identity/version/settings・revision・scope・両面結果を照合する。照合可能なら差分を判定し、どちらかの実行が未観測ならparity未確認とする。 | 同名だけを根拠に異なる版・設定を同一gateとみなす、未観測をpassにする、または全環境同時実行を036の条件として追加する。 |
| 未見：FE | 未公開だが画面あり・合意済みscreen scopeを確認できる対象に、同じ5軸の適用契約を当てる。既知の適用scope内なら結果を軸別に判定し、5軸のいずれかに必要なoracle/input/schemaが未知ならFE gate全体を未評価として保留し、5軸中の該当軸をN/Aへ落とさない。 | fixtureにないだけで既知scopeの有効な入力を全拒否する、または未知軸を通過扱いにして5軸pass証跡を生成する。 |

**判定境界と旧条件の対応**

- FR-L1-21の「設計項目へのテスト観点抜け検出 + レベル間重複検出を static で fail-close」は、上表のW正常/誤りに対応する。
- FR-L1-22とNFR-06の`drive=fe`条件、5軸名称、決定論的判定、`DetectorResult (pass/fail+詳細)`、CI証跡およびfail-closeは条件付きFE例に対応する。旧drive enumではなく現行の画面適用記録を用い、非画面へ拡張しない。
- NFR-13の同一lint/gateのdev-local + CI双方での実行、editor fail後commit前の局所修正loop、cross-detection四軸とWの0件条件は上表の受入に対応する。NFR-13の「gate通過率≥90% (KPI D-02、B5=b)」は運用目標として保持する。適用母集団・期間・分母はL3で照合し、意味を変更する場合はPO判断へ戻す。個別ticketの合否と混同しない。
- HARNESS-L2-005に対する既存L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:48-51`は、ticket/riskによる必要検証、固定段数拒否、危険度、密結合、scope外停止、省略記録と回収を既に受入条件としている。036はその選択結果を利用する。全件CI、merge直後/夜間の一律回収、全環境での同時実行を新設しない。
- HARNESS-L2-022に対する既存L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:298-304`のIntegrated/Verified/Accepted分離、revision-bound oracle/result/evidence、未評価維持をそのまま適用する。036のgate passは品質全体、L10 Verified、L11 Accepted、利用者受入を生成しない。

**原文参照**

- `LEGACY-ASSET-6B6C5CB0E481BE01088B`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:52-53`、file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。FR-L1-21行SHA `b54119ad033bcb2f01c1977710d76249ab80a2789422ed02afa3c54d6ac3799b`、FR-L1-22行SHA `1cc6f208ebbbb6d900d791e546db07b6047e7a07e6a2071817391191b3abbdf9`。
- `LEGACY-ASSET-5429AA05B022E9F49B0A`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/nfr.md:31,51`、file SHA-256 `4853a43c5ea12354dc2dab20dc3a52b15ff6be075e49fdaf1bff26280e992122`。NFR-06行SHA `0e1efa8f6017fd18bc55f46f1c9096c64cf3e0c2d7e73d8abef3bc3ed43c0c80`、NFR-13行SHA `e1be1261c63355fe7439bad12c1c60df6fc130a91713a7a862169a7e5dbde0a1`。
- 現行L2対応点：`docs/helix-harness/L2-requirements/product-requirements.md:118-121`（005）、`:447-461`（022）。現行L11対応点：`docs/helix-harness/L11-acceptance/product-acceptance.md:48-51,298-304`。

- **適用漏れ・誤適用の反例**：①画面ありだが旧drive fieldが無い、②画面ありだがscreen scope/合意が未提示、③判定後に画面を追加、④非画面で技術PoCだけが必要、を別々に与える。①は5軸適用、②は003/008へ返し保留、③は再評価して旧非適用を流用せず、④は5軸非適用となる。判定者・理由・対象revision・HEAD・再評価条件を欠く非適用は受理しない。
- **出所の照合**：画面判定、合意済みscreen scope、ticket/profile、5軸結果が同一対象revisionに結び付くことを照合する。OSが根拠なく適用条件を変更する、036が画面の有無や合意を推測する、旧drive enumが無いことだけで検証を省く場合は不合格。

### HARNESS-L2-037 対L11受入追補候補

**対応要求**：`HARNESS-L2-037`（HARNESS-CORE所属のcomposite候補、`version_target: 1.0`、未採択。新サービスではない）。親L1は`HARNESS-L1-001`, `HARNESS-L1-004`, `HARNESS-L1-009`。HARNESSは二段設計・照合条件と受入へ渡すtraceを定義し、HELIX-OSは選択された工程・実行・state記録を運転する。適用scopeは現行`HARNESS-L2-009`が要求kind・target・構成・risk・domainと版付きDesign Templateから導出する。旧`drive=agent`は2026-09-24 PO判断で廃止されたdrive分類の意味としてのみ参照する。

**現行pairへの意味対応**

旧FR-L1-28の出力欄はPhaseごとの「L9成果物」、合流「L10」、後続「L11〜L12統合flow」と書く。旧screen requirementはW二段状態をTrace viewに表示するscopeも示しているため、trace UIを含む選択scopeでは表示上のphase/合流状態を受け入れ、UIを含まないscopeでは対応artifactのtraceで同じ意味を確認する。これは旧層番号として保持し、現行layerへ直写ししない。各Phaseは要求・要件を含むVであり、L4/L9だけへ縮めない。`HARNESS-L2-001`の現行pairに照らし、Phaseごとの設計成果をL4、各対検証をL9、両Phaseの合意済みL2要求・承認済みL3要件と統合system検証をL3↔L10、利用者受入をL2↔L11、運用評価をL1↔L12へ対応させる。037はpairやstateを新設・上書きせず、`HARNESS-L2-022`が定める各段階のoracle・証拠・state契約へ渡す。

**受入例**

| 種別 | 入力と期待結果 | 不合格または保留となる反例 |
|---|---|---|
| 正常：適用判定と二段実行 | 現行HARNESS-L2-009が要求kind・target・構成・risk・domainおよび版付きDesign Templateから二段scopeを導出する。開始入力にはPhase 1の合意済みL2要求・承認済みL3要件とPhase 1設計入力を与え、まだ生成されていないL4/L9成果は要求しない。Phase 1 L4生成後に対応L9 receiptを得て、その結果をPhase 2固有のL2形成へ渡す。Phase 2のL2合意・L3承認を確認してからL4を生成し、その後に対応L9 receiptを得てから合流する。両Phaseの異なる要求/要件revisionと合流対象revisionのrelationが対応し、Phase 2がPhase 1 contractを維持するか差分を解消していれば統合設計成果をL3↔L10 oracleへ渡す。 | 037の開始時に両PhaseのL9実行receiptを要求する、Phase 2をPhase 1より先に開始する、revision違いの結果を結ぶ、またはPhase 2がPhase 1 invariantを黙って変更したのに合流済みにする。 |
| 正常：後続pair | 統合設計とL3↔L10 resultを対象revision付きでL2↔L11 acceptance条件へつなぎ、利用者受入のoracle/result/recordを別途確認する。さらにL1↔L12 observationへ運用scope・結果のtraceを渡す。L10 passだけではL11 AcceptedにもL12 Observedにもならない。 | phase mergeのreceipt、設計文書、L10 passのいずれかだけからL11 acceptanceやL12運用評価の成功状態を作る。 |
| 誤り：意味・境界の不一致 | Phase 2のagent固有設計が一般systemのapproved contract、permission/invariant、error boundaryまたは対応oracleと矛盾する例を与える。037は差分と影響scopeを明示し、未解消なら統合設計を返さない。意味変更はHARNESS-L2-008/該当上流へ、設計template/required input不足はHARNESS-L2-009へ、oracle不足はHARNESS-L2-022へ戻す。 | Phase 2を理由にPhase 1の一般system意味を上書きする、HARNESSが上流authorityを書き換える、またはOSの実行結果で設計意味差を閉じる。 |
| 誤り：欠損・stale | Phase receipt/handoffがmissing、contract versionが互換範囲外、traceの対象revisionがstale、またはどちらかのPhaseのL9対検証証拠が欠ける例を与える。037はgap/差戻し先を返し、unknownをmerged/passとして扱わない。 | 文書・phase fieldの存在だけを合流証拠とする、古いPhase結果を現対象revisionに流用する、gap一覧なしに成功を返す。 |
| 未見：既知範囲内 | fixtureにない新しいagent構成でも、037の明示された適用契約範囲内であり、一般system制約、Phase 2設計、current L4/L9 pair oracleが特定できるなら、同じ内容oracleでtraceと差分を判定する。既知条件内の適合結果をfixture未収載だけで拒否しない。 | fixture未収載だけを理由に適用scope内の有効な設計を一律拒否する、または旧実装と同じ構造でないことだけで失敗にする。 |
| 正常：選択scopeのtrace表示 | 旧screen requirement由来のtrace UIを含む選択scopeでは、UIがPhase 1/2の状態、対象revision、合流状態、未解消gapを追える。UIを含まないscopeでは設計/検証artifactの同じtraceを確認する。いずれも専用の旧Trace画面実装を要求しない。 | UI scopeが選択されているのに片方のphase状態やgapが画面で追えない。または非UI scopeに専用画面を追加しなければ合格しないと扱う。 |
| 未見：適用・oracle不明 | 対象がagent-system scopeに該当するか不明、または一般system contract、Phase 2の適用template、L3 authority、必要oracleが不明の入力を与える。該当部分をunknown/未評価として示し、統合済み・Verified・Acceptedへ昇格しない。 | 未知の適用性を037の適用済みへ補完する、authority/oracleを自動生成する、または対象が不明というだけで固定の新しい人承認手続きを要求する。 |

**既存受入との対応と責務**

- 現行`HARNESS-L2-009`の対L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:29,69,129-130`は、unit/connection/composite template、required input不足のBackflow、誤ったtemplate適用を確認する。037はこれを二つのphase scopeに適用するが、template内容を複製しない。
- 現行`HARNESS-L2-022`の対L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:298-304`は、L8/L9 Integrated、L10 Verified、L11 Acceptedを別stateとし、oracle/result/evidence/revisionを確認する。037はその検証責務を置換せず、段階出力を用意する。
- 現行`HARNESS-L2-025/026`の対L11 `docs/helix-harness/L11-acceptance/product-acceptance.md:332-360`はunit設計と汎用composite整合を受け入れる。037はそのphase固有scopeをつなぐworkflowを受け入れ、既存のdesign unit/composite oracleを再実装しない。
- 適用scope内の二段階とPhase 1→Phase 2の依存順は旧FR-L1-28の意味なので受入で保持する。新たな全対象共通workflow、追加phase、固定運用substepは作らない。旧screen requirementの表示意味はtrace UIを選んだscopeに限って受け入れ、UIを含まないscopeではartifact traceを受け入れる。旧API/field/runtime実行や全外部agent/platformの一律依存は追加しない。L11 acceptance結果は利用者受入の条件・記録とともに別途確定する。

**原文参照と旧条件の保持**

- `LEGACY-ASSET-6B6C5CB0E481BE01088B`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:59`（FR-L1-28、file SHA-256 `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA-256 `a7b461949218e37e67110567ee4aad528901e8a2536341fc6d23a5cb35590106`）。保持する原条件は一般systemをPhase 1、agent昇華をPhase 2とするscope、Phase別成果、合流成果、後続acceptance/operationへのtrace、development style/case-driven modelとの分離。旧層番号は前節の通り現行pairへ意味対応する。
- `LEGACY-ASSET-3B905BB196962E2BE624`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/screen-requirements.md:464`（file SHA-256 `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`、line SHA-256 `096ba44a8a6a5c8ea7538755f94af4155201ddae5ead9d726611e4712f4d972f`）。旧Traceビューは旧screen requirementが対象とするUI scopeで二段状態を画面追跡する条件として保持する。UI scopeが選択されればphase state・revision・合流/gapを表示し、非UI scopeでは同じ情報をartifact traceで確認する。旧画面の固有実装や画面を全scopeへ強制することはしない。
- `LEGACY-ASSET-96CCD05C4CCA06F50D3D`：`docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/technical-requirements.md:169`（I-4、file SHA-256 `3e105358418cb54af0bc2e414d0b06171715ab2a26ea3b44dd16f932bcbfef88`、line SHA-256 `cc12f3fae870d6917c65a8c671f7de283c931f31788c61502561c894c6c52a5b`）。適用が確定したW scopeにPhase 1/2から統合状態がある意味は保持し、旧`phase.yaml`/`phase_merge`は固定しない。
- `LEGACY-ASSET-809D616D0D7D844F5720`：`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/function-spec.md:250`（file SHA-256 `f80b69a4d153d7775ecd789aa9e261c140baf2a443ac53a851de710cfce02b14`、line SHA-256 `da0f68bfde9fb763e7936678b9393b42c7b924630bdf1b07f2d53baf09a30785`）。旧候補の正常出力（merged stateまたはgap）とlayer boundary保持を参照し、関数名・実装I/Oを規範化しない。
- `LEGACY-ASSET-978C267AADC50615A1E2`：`archive/legacy-generation-2026-09-14/root/docs/design/harness/L6-function-design/fr-unit-coverage.md:64`（file SHA-256 `477c95b229b4ddffd4c2ed76fdfb99d8f3a4e8241b21ae7e883ffa2607d39dbf`、line SHA-256 `b5ff66c0f85a00aa4aa13700b2970733155b99bed54340f5fc8997803168e137`）。旧coverage対応がPhase merge state/handoffを成功・不成功で確認する方向を持った事実を保持する。旧test/runtime実行やそのgreenは現行受入証拠としない。

**現行適用判断の根拠**：2026-09-24のPO判断 `docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:75-83` は旧driveをticket種別へ置換し、開発styleと分ける。よって旧`drive=agent`は適用判定値ではなく、現行`HARNESS-L2-009`の要求kind/target/configuration/risk/domainと版付きtemplate適用に基づいて二段scopeを受け入れる。

**照合固定点**：現行`docs/helix-harness/L1-planning/product-intent.md`（HEAD `2beddd2b9e295f46bd6086de5f14148421144513`、SHA-256 `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f`）の`:31,34,39`（L1-001/004/009）。現行L2同HEAD・SHA-256 `07fe4e2e7a8205d37571fc745f1154022559cf6489022ec6711f3efad3940bcf`の`:60,116`（L2-009）、`:447-461`（L2-022）、`:530-540`（L2-026）、`:544-554`（L2-025）。現行L11同HEAD・SHA-256 `006c929d9c00d349b263bcbaa371e7d1638176966511420075cc85a45b9b8321`の`:29,69,129-130`, `:298-304`, `:332-360`。現行L2-001は標準V-pairを既に所有し、L2-022がstage transitionを所有するため037はそれらの定義を追加・変更しない。

- **実物がない反例**：PhaseのL4設計文書と静的整合結果だけがあり、必要な実装・L9実行証拠がない入力では、設計案を保持するが合流済みにしない。037がL9 receiptを自己生成する、利用者の実行手段を使うscopeに内部OS一式を必須とする場合は不合格。選択executorが後段で返したcurrentな結果だけを022の契約に照らして受理する。

- **各Vの上流判断の正常・反例**：Phase 1の確定仕様/検証結果を入力にPhase 2のL2候補を形成し、人のL2合意、その要求から導出したL3要件への承認がそれぞれPhase 2 identity/revisionへ結び付いて初めてPhase 2設計へ進む。Phase 1の承認だけでPhase 2を開始、単一L3へ黙って併合、Phase 2のL2/L3を飛ばす、別Phaseの判断を流用する例は不合格。未合意中は要求候補/未完を保持する。
- **上流変更の未見例**：未fixtureのagent目的が外殻の制約を変更するとき、Phase 1の該当上流へBackflowして影響pairをstaleにし、Phaseごとの再判断/revision対応を確認する。未知の要求を一般systemの承認から推定しない。
- **A-74の適用外**：HARNESS自身を対象に二回のVを強制する入力を拒否する。本候補は対象repositoryのagent systemへ提供する能力であり、自身の工程をWへ変更しない。

旧Concept根拠：`LEGACY-ASSET-75776FE016E550F5355F`、`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-concept_v3.1.md:343–361`、SHA-256 `b6cecb7bec29d85b36e299f8a594821c1d778328506fe2c056ca330ef76d968c`。一般系とagent系で各々要求/要件からVを通る意味とA-74の自身適用除外を保持する。旧L0-L14は現行ConceptとL1-L12の正規pairへ再導出し、旧provider環境を実装前提にしない。単一L3への畳み込みは本候補では採らない。

### HARNESS-L2-038 対応L11受入候補

本節はHARNESS-L2-038 unit candidate（`version_target: 1.0`候補、未採択）に対する内容oracle案。詳細な要求は[HARNESS-L2-038](../L2-requirements/product-requirements.md)を参照する。COREが契約と結果を評価し、HARNESS-L2-019はFull Reverseの入口/result境界、選択source型の抽出は必要時に027、設計authorityは014、検証/受入契約は022、requirements formationは008/024、trace/Backflowは003/004が既存ownerである。OSはHELIX管理下のticket/run/証拠運転を担当するが、HARNESS単体の受入成立をOS実行に依存させない。source extraction成功、L2候補、登録receiptだけで採択/承認/Acceptedを推定しない。

全fixtureは対象project、対象L1/要求revision、source snapshot revision/digest、選択source type/scope、authority状態を固定する。status語彙や採否権限は新設せず、既存契約のauthority/statusを入力し、038は当該scopeの内容照合結果と未完義務を返す。

**作業中の観測/要求形成は後段成果を要求しない**

**正常例**：選択した旧API/source fixtureに2つの観測可能な能力がある。027 receiptが各source spanとrevisionを示す。target requirementのauthorityが未決、保存design/testがまだない状態で038を呼ぶ。038は能力を別identityで記録し、各内容の根拠、要求候補/既存要求への関連または未確定、authority未決、将来のdesign/test/oracle義務と戻し先を分けて返す。調査・要求形成段階の結果を未完として明示し、pair-freeze/Full Reverse完了とは宣言しない。この段階で保存design、test result、detector runを要求しない。

**誤り**：設計/testがまだ生成されていないことだけを理由にsource observationや初期要求候補を不合格にする。または逆に、後段成果が未作成なのにcoverage-complete/pair-freeze/Acceptedと表示する。

**選択scope内の閉包claimは個々の能力で確認する**

**正常例**：既存authorityの下で要求が確定し、該当設計要素・test/oracleが作られた後、同一scopeを再評価する。能力Aはsource span→要求r1→design d1→test/oracle t1へrevision-bound relationを持つ。能力Bは適用外または別要求へ戻す根拠と既存status/ownerを持つ。038は選択scopeの個々の能力とclaimされた完了段階だけを照合し、対応済みと未完を分離する。該当するすべての能力が各段階義務へ閉じた場合だけ、そのscope/段階に限った閉包を返す。

**誤り**：能力A/Bを一つのaggregate IDでまとめる、同じ要求/design/testを根拠なしに複数能力へ複製joinする、上流の意味判断をAIが作った候補で自己正当化する、理由のない「不要/却下」でobligationを除外する、source scope外の機能を不存在とする、1段階の完了から後段stageの証明/受入まで推定する。個別relation・根拠・適用scopeが欠ける、または一つでも未判断/孤立が残るときは当該閉包claimを不成立にする。

**正常例（分母と双方向join）**：選択scopeのsource observation manifestがcapability `c1,c2,c3`を含み、038の結果にもこの3件が各一度ずつ現れる。各項目から該当requirement/basic design/test/detector-gateへ辿れ、該当endpoint側からも根拠capabilityへ戻れる。適用されるendpointが後段でまだ無い場合はその義務を未完として表示し、途中結果だけを返す。完了claimではmanifestと結果のidentity集合・件数が一致する。

**誤り例（欠落・重複・片方向）**：manifestに`c1,c2,c3`があるのに結果から`c3`を落としclosedとする、`c2`を同一identityで2回計上する、capabilityから要求へだけrelationがあり逆方向には孤立する、または適用されるdetector/gate endpointとの接続がないのにpair-freezeを返す。それぞれ閉包を拒否し、欠落/重複/孤立するidentityと戻し先を示す。

**空・複製・no-findingの偽閉包を拒否する**

**誤りfixture**：同じselected source setに対して (a) 空のcoverage表、(b) `TODO`等placeholderのみ、(c) source本文を貼り直しただけで意味/根拠を照合していない結果、(d) 同一内容/digestを別capabilityまたは別段階の証拠として再掲、(e) 対象obligationへのrelationがないのに「findingなし/対応不要」とする結果、を個別に与える。これらをsubstantive completion、negative oracle合格、pair-freeze成立として受け入れず、具体的な欠落・unknown・未完を返す。異なる正当な能力が同じ共通oracleを参照すること自体は拒否せず、個別source根拠と適用理由が確認できるかを判定する。

**未見source/変更scope**

**未見例**：同じsource typeの未見fieldまたは新しいselected source revisionを追加する。以前のscope receiptを流用せず、選択範囲とdigestを再固定する。対応可能な範囲はsource span/契約根拠を返し、未知のfield/behaviorはunsupported/unknownとして残す。新規scopeのunknownを無影響/不存在や過去scopeの失敗へ外挿しない。scope変更後に以前のclosed resultを新scopeの成立根拠として使わない。

**処置状態の意味区分**

**正常例**：選択scope内の能力について、現行status/authorityに基づき「既存義務への採用」「既存義務の強化」「再設計候補」「根拠とauthority付きの却下/対象外」「特定の既存義務への吸収」「未決/unknown」を区別する。旧語をenumとして要求せず、処置理由と適用先を辿れる。

**誤り例**：根拠なし却下、吸収先のないabsorbed相当、未決なのに採択済み表示、再設計候補を承認済み要求にする結果を拒否する。対象外の理由と決定authorityが欠ける場合も閉包しない。

**FR-35段階内容のoracle**

**正常例**：固定R0–R4ラベル/schemaを使わない現行artifact一式から、完了claimが対象とする範囲について、(1) source根拠と範囲のmap、(2) 観測契約、(3) as-is設計/test、(4) intent仮説と既存authorityによるPO検証状態、(5) gapとowner/routingを個別に辿れる。設計/test未作成の初期観測では(3)以降を未完として明示し、初期観測結果だけを成立させる。Full Reverseや該当stage完了をclaimする際は、そのclaimに必要な内容が欠けない。

**誤り例**：AIが生成した仮説だけをPO検証済み扱いする、残gap/owner/routingがないのに完了claimする、as-is design/testを含むべき段階なのにそれがなくcoverage表だけで完了する結果を拒否する。R3相当のPO検証が未実施なら、その判断を要する完了claimを保留し、既存authorityのownerへ戻す。新しい承認手続きは作らない。

**受入判定と段階境界**

受入では、選択scope、個別能力identity、provenance/source span、内容根拠、既存authority/status、該当段階のrequirement/design/oracle relation、未完義務、戻し先が辿れることを確認する。L2候補受入は要求採択やL3承認、実装/CI成功、利用者のAcceptedを生成しない。初期観測・要求候補形成では将来のdesign/test/detectorを前提にせず、pair-freeze/段階完了を主張するoperationに限って、その段階で適用する後段義務の閉包を求める。

旧HIL-FR-22/35の個別記録・内容oracleを選択scopeに対して照合する。固定R0–R4ラベルやschemaを使わなくても、FR-35の5つの段階内容とR3相当のPO検証を現行artifactで検査する。旧R0–R4のラベル、phase schema、固定enum、旧runtime、全4020 assetへの一括適用は受入条件に戻さない。Product Data Ingestionのfull/incremental取得等は旧HIL-FR-24の2.0候補に保持し、本fixtureへ含めない。

**出典**

- 旧HIL-FR-22: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:112`、SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。
- 旧HIL-FR-35: 同上 `:125`、同SHA。FR-22の旧target crosswalkは `docs/governance/audits/source-rebaseline/infinity-functional-target-crosswalk.md:31`、FR-35は `:44`。
- 現行親L1: `docs/helix-harness/L1-planning/product-intent.md:31-39`、SHA-256 `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f`。
- 現行L2根拠: `docs/helix-harness/L2-requirements/product-requirements.md:59-60,419-425,499-520,559-570,711-725`、SHA-256 `a80de323f18dffd36aef90536986b9284372117bc5dfa0fd6d733a3a87ac49d9`。
- 現行L11根拠: `docs/helix-harness/L11-acceptance/product-acceptance.md:45,214,365-373,479-485`、SHA-256 `103705cf8840fec1feaa9ff930af89f80222d746390cf2fa2cf950c6350ee1e5`。



**固定照合基準**：草稿が照合した現行本文の基準commitは `afc3963085b53a4bf86ac5da8f7663aef1bed144`。旧source・現行L1/L2/L11のfile SHAは出典に示す固定値を参照する。

**段階の内容依存と中断**：source根拠から観測契約、観測契約からas-is設計/test、これらを根拠とした意図仮説/PO検証、最後に差分/routingという内容の依存を保持する。見出し名を変えただけで段階を飛ばせない。選択scopeで必要なobligationが100%に満たなければcheckpoint後も未完とし、budget途中停止を完了へ丸めない。既存契約上不要な操作の追加はしない。旧受入根拠は `LEGACY-ASSET-AFE91778057B7E76BEEC`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:62`（HOT-HIL-35）、SHA-256 `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`。

**中断・順序違反の反例**：観測contractがないのにas-is設計の根拠充足を主張、PO検証を飛ばして仮説確定、budget切れcheckpoint後に残obligationを分母から落とし100%とする入力を拒否する。再開時は同revisionと残義務を確認し、source変更なら該当内容を再照合する。

### HARNESS-L2-039 体験・UI・Frontend契約を同一scopeへ結ぶ composite の受入候補

**対応要求・authority**：HARNESS-L2-039（CORE composite候補、`version_target: 1.0`、未採択）。主親はHARNESS-L1-001/003/004/006/008、関連親はL1-009、外部提供時等の文脈はL1-005/007。既採択のHARNESS-L2-024/025/026、HARNESS-L2-003/004/005/008/022の条件をそのまま入力契約として使い、再定義しない。039候補のL11例は未実行fixtureであり、候補採択、要求/設計合意、L3承認、実装許可、L11利用者受入を生成しない。

**正常例：UIを持たない要求のExperience親**：UIなしのworkflowを入力し、要求候補の各意味単位からUser Task、Business Outcome、scenario/context、success result、decision rationaleまで実際の意味関係を追う。適用しないUI契約は、対象・scope・判断根拠と再評価条件を伴うN/Aとして示す。小さな要求原子へ分割した後も業務成果・成功条件を辿れれば成立する。画面を持たないことを理由にExperience親graphまで省略しない。

**誤り例：見かけの親graph**：複数の小さな要求へ「Business Outcome」欄を同じ曖昧な語句で貼ったが、どの要求がどのtask/scenario/success resultを支えるか説明できないfixtureを与える。relation fieldが存在しても意味上の親・成果へ辿れない、成功結果が要求されている動作と無関係、または細分化で親成果が失われている場合は成立させず、要求形成の不足としてHARNESS-L2-008へ返す。意味に親がないときはLLMが補完して合格にしない。

**正常例：UI/Frontend設計・trace・drift**：同一対象revisionの要求、合意済screen scope、prototype/design資料、設計候補とそのoracleを与える。選択scopeで適用する画面/flow/interaction/action/state、permission/actor、command/API、data/state ownerと不変条件、domain/analytics event、content、design token/component、accessibility/responsive/motion、logging/error、および対応する検証・受入条件の間を意味的に双方向追跡する。適用sourceごとにrevision・scope・authorityを示し、条件の適用性がない要素は根拠と再評価条件を持つN/Aにする。差分があれば影響する対象/関係と戻し先を示す。

**誤り例：切れた契約・drift**：①画面では拒否するがAPIが同操作を許す、②interactionからacceptance/E2E oracleへ関係がない、③event/data ownerが設計外、④CSS/componentがtoken/design contractと食い違う、⑤contentまたはanalyticsが要求する成功条件と不一致、⑥screen scopeや要求revisionがstale、⑦影響がunknownなのにUnaffectedとして使い回す、の各fixtureを与える。いずれもfieldやscreenshotの存在だけでは合格しない。要求意味差は008、設計trace/unitは026、構成体整合は025、検証義務/oracleは005/022へ戻す。L11は設計そのものの承認や実行を代行しない。

**正常例：riskに応じた検証factor**：該当するUI scopeとrisk根拠を与え、device、input、role、locale、data volume、network、concurrent update、destructive/undoから適用要因とrisk-based pairwise組合せを選び、各選択・非選択の理由を返す。riskに無関係なfactorを根拠付きで外し、必要なfactorは代表組合せで覆える。全組合せ実行は成立条件にしない。選択した義務はHARNESS-L2-005のticket/risk別検証条件へ渡す。

**誤り例：factorの誤った省略・過剰**：削除/undoで不可逆な結果があるのにdestructive/undoを選外、複数roleでpermissionが異なるのにrole差を無視、localeで内容長・入力が変わるのにlocaleを無根拠で除外する例は不合格。逆に選択scopeに無関係なfactorの全直積や、device全機種の総当たりを一律要求する例も不合格。risk根拠がないfactorはpassにせず選択未確定として残す。

**正常例：状態・UX evidence**：design/prototypeだけを持つscopeでは設計候補として扱い、実測UX evidenceがまだないことだけで候補形成・設計義務の受入を拒否しない。`implemented`と`ux_verified`を別々に主張するfixtureでは、implementedは対象V-pair上の実装・検証relationへ、ux_verifiedはその主張を行う操作に限ってscopeに適用されるL10–L12 real-data evidenceとhuman evaluationへ結ぶ。real-data/human evaluationが未実施ならux_verifiedは未確認/保留であり、implementedやdesign済みから推定しない。

**誤り例：完成状態の混同**：screenshot、route/screen数、placeholder、generic table、prototype合意だけからimplementedまたはux_verifiedを主張する。あるいは全screenの設計候補生成開始に未来のreal-data/human evaluation完了を要求する。前者は不合格、後者も不合格。観測・評価未了はその状態の未確認として保持し、設計要求作成の開始を止めない。

**正常/誤り例：Discovery PoCと人の判断**：未確定のvision仮説をprototypeで比較しているPoCは、既存S4相当の人判断が未了なら仮説・未決状態のまま返せる。採択hypothesisだけを対象ownerの決定記録と同じscope/revisionで既存正規V-pairへ結び、implemented/ux_verified/production-readyは各々の適用証拠がある場合だけ主張する。PoC成果、AI推奨、prototype agreement、未回答や時間経過からproduct vision/brand/優先順位/要求採択を生成したfixtureは不合格。旧S0–S4自体を現行の必須工程として再導入しない。

**正常例：Full V/Scrum backfill**：選択されたFull V UI workflowまたはScrum UI sliceにprototype agreement、screen ledger/profile、frontend binding、mission/oracle、UX evidence、change deltaの一部が適用される場合、各義務を既存の対象V-pairのlayer・receipt・owner・戻し先へ結ぶ。作業初期で未作成の後段evidenceは未完義務と後段scopeとして記録でき、設計/要求の起点operationを拒まない。非適用は理由付きで示す。

**誤り例：段階・適用範囲の混同**：全UI scopeに旧artifact一式・旧S0–S4を新しい工程として必須化する、非UI scopeへscreen ledgerを要求する、または未作成UX evidenceを実施済みとしてSR4/Full Vのclosureへ流用する例は不合格。後段evidenceが未完なら、その段階の完了を主張するoperationのみ保留する。新しいfreeze、承認authority、旧layer番号を作らない。

**誤り例：review/release合流時のbackfill漏れ**：選択されたUI sliceがreview/release合流へ進む際、適用されるscreen/profile/binding/mission-oracle/UX-evidence/change-deltaの未完義務または既存pair receiptの欠落を隠してclosureを主張する例は不合格。既存SR4/review/release条件を使い、039独自の合流stageやfreezeを作らない。

**未見例：別UI/別製品scope**：既知fixtureと異なるframework、screen構造、content source、analytics event、device構成を用いる。対象契約revision・source authority・scopeが分かれば同じsemantic relationとrisk根拠で判定し、未見という理由だけでは拒否しない。必須関係や適用性を決める情報/oracleがunknownなら、当該主張を未評価/保留として不足と戻し先を示す。未知を自動補完して合格にせず、既知の無関係条件まで一律failにしない。

**依存と判定境界**：正常判定では親L1/要求revision、authority、scopeが一致する。UI操作では既存024/026/025の該当条件を操作別に、pattern等の入力sourceを選択に応じて照合する。実行・CI・ticket・証拠の保管を039単体に求めず、実行/状態記録はOSまたは外部利用者CI、通信はCONNECT、実測後の効果評価はLABOの既存契約に従う。HARNESS-L2-036のFE 5軸を選択scopeで使う場合だけ契約と後段の結果を照合し、039から036の採択を生成しない。

**旧source照合**：`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。§4.5:269–275（Experience/UI/Frontend、Full V/Scrum backfill、PoC状態・evidence・authority境界）と§4.9:385–392（HR-FR-DHR-001–006）を、現行L1/L2/L11の対象scope・V-pair・authority境界へ意味再導出した fixture である。旧schema名・旧runtime・実測済みとの主張は導入しない。

**prototype/walkthroughの反例**：UI scopeに静止画とscreen一覧・trace・agreement表示だけを与え、操作可能なprototype相当やwalkthroughの実施結果がないのに、prototype確認済みとしてclosureする例を拒否する。正常例では同一scope/revisionの操作可能性とwalkthrough結果・未決事項・訂正を既存008/024の合意根拠へ渡す。開始時に未実施なら未完義務として候補を返せるが、実施済みへ補完しない。旧manifest形式を別の固定schemaとして要求しない。

**正常例：UX完了に必要なcurrent evidence**：UI/UX適用scopeの同一対象scope/revisionについて、L10–L12で評価したreal-data、responsive、motion、accessibility、performance、continuity、人間評価の全7軸のcurrent evidenceがそろい、既存V-pair上の実装・検証関係も別途示されるfixtureを与える。実装状態と`ux_verified`は別に判定し、7軸の全てを確認できた場合だけUX完了主張を成立させる。個別軸をN/Aとして省略しない。非UI scopeは既存の根拠付きN/A境界を維持し、UX完了を主張しない。

**誤り例：UX evidenceの欠落・stale・適用性不明**：7軸のうちいずれか1軸について、証拠が欠ける、対象revision/scopeが異なる、またはcurrentでないfixtureは、その軸以外の証拠がそろっていてもUX完了を拒否する。7軸のいずれかの適用性がunknownであるfixtureもUX完了を拒否し、N/Aへ変換しない。こうした欠落は`implemented`や候補形成・要求/設計作業の開始を取り消さず、保留するのはUX完了主張だけとする。新しいauthority、承認者、実装状態は追加しない。

## HARNESS-L2-035 scope計測追補の受入

既存L11-035と併せる未実行・未採択候補。

- **正常**：scope拡張候補に、複雑さ、公開面、運用負債の変更前後の対象・方法・条件・結果と、受入oracleへの寄与、代替案、最小必要性の根拠を与える。同じscope/revisionで照合でき、三観点のどの義務が増減したかを示す。測定の実行手段や数式が違っても、宣言した条件と証拠へ辿る。
- **誤り**：追加機能数は少ないが公開API/設定面と保守義務を増やした候補に対して、追加数のみで最小必要とする。運用負債または複雑さの結果が欠けた例、旧revisionの計測を流用する例、別観点の好成績で欠測を相殺する例も、scope判定の根拠充足としない。原文にない共通閾値をAIが補って拒否・許可する例も不成立。
- **未見・開始境界**：新しい変更種別で測定値がまだない入力でも、候補形成と不足項目の提示は行える。測定方法・条件が未定なら該当ownerへ返し、結果や必要性成立を捏造しない。後段の計測完了を起草開始の前提にせず、未完のscope判定から実行権限を生成しない。


## HARNESS-CORE layer ledger／template抽出候補の受入

### HARNESS-L2-040 全層ledger契約と層外anchor

**対応要求**：HARNESS-L2-040（CORE unit candidate、`version_target: 1.0`、未採択）。親L1はHARNESS-L1-001/003/004。HARNESSはledger、layer/pair、anchor、row、coverageの意味契約を定め、実際の登録・保存・snapshot/projection・ticket運転は別のOS契約に従う。L0 charterは層外anchorでありpairではない。

**正常例**：同じ対象revisionのcatalogにcanonical L1–L12のledger契約と、L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7の6 pairがあり、L0 charterはidentity・対象revision・sourceを持つ層外authority anchor recordとして別登録される。各ledgerにtype/粒度/node/edge/authority/input-output/gate/template版があり、rowはstable subject ID/revision/source span/semantic digest/status/owner/upstream/downstream edgeへ結び付く。coverage receiptは同revisionの全層を列挙し、未完なしを内容で示す。HARNESSがcatalogの契約を提示してもOSの実保存やticket実行を成功と主張しない。

**誤りを含む例**：L7 ledgerが欠落、pairの片側edgeがない、L0 charterの独立anchor recordがなく参照文字列だけを置く、L0を第7pairまたはL0 layer ledgerにする、rowのowner/source span/revisionがない、別revisionのrowを同じcoverageに混ぜる。個々の欄が存在しても構造上の欠落を発見し、coverageを完了扱いにしない。OSの保存receiptがない場合はOS実行未確認と分け、HARNESS契約自体のoracleを代用しない。

**未見例**：同scopeの別layer/template revisionを伏せて与え、新しい必須node/edgeまたはpair変更がcatalog/coverageに現れないとき、その変更範囲をstale/uncoveredとして示す。root authority・scope・互換版がunknownなら対象外扱いで抜けさせず、その範囲を未評価に保つ。成功は指定revisionのcatalog契約照合に限り、OS runtime実装、全layer実保存、L3承認や全要求の成立を意味しない。

### HARNESS-L2-041 active templateのobligation抽出とgap提示

**対応要求**：HARNESS-L2-041（CORE unit candidate、`version_target: 1.0`、未採択）。親L1はHARNESS-L1-001/003/004/009。HARNESS-L2-009の選択・適用契約を使い、OSは選択操作の実行・保存・projectionを担う。041は正本ledgerへ直接登録せず、L3/実装/採択を生成しない。

**正常例**：固定されたactive template revisionの章、field、table row、applicability rule、done-when、pair contractを入力scopeに従って機械抽出し、一つずつatomまたは理由付き非適用/未解決として対応付ける。各atom/proposalにsource span、template revision、適用分岐、semantic digest、抽出器/version digestがあり、対応ledger契約版の候補行として出力される。全対象要素が個別に対応し、未対応要素・空/TBD・抽出不能・同一obligation重複のgap数と対象が具体的に示された場合だけ、そのscopeの抽出結果を照合済みとする。

**誤りを含む例**：templateの空fieldまたはTBDを値の推測で埋める、適用条件の分岐を読み飛ばす、同じobligationを別atomとして重複出力する、章/table rowの一部を候補ledger行から欠落させる、機械抽出の結果を持たず人手要約だけで完全抽出と称する。いずれもgap findingまたは不一致を返し、LLM自由補完・重複・未対応を合格にしない。templateのactive版や対象scopeが未提示なら抽出成功とせずunknown/保留にする。

**未見例**：同scopeの伏せた新template revisionまたは新しいapplicability分岐を与え、全要素を抽出できれば対応atomへ、未対応ならsource span付きgapへ返すことを確認する。選択されていない別templateの内容は未観測と記録し、万能な抽出保証へ外挿しない。結果は指定template/scopeでの契約受入であり、ledgerへの登録、設計成立、利用者受入、OS実行を意味しない。

**戻し先と境界**：template選択・必須input・適用性の不足はHARNESS-L2-009/該当ownerへ、ledger/pair契約の不足はHARNESS-L2-040相当の契約ownerへ返す。OSの保存/実行receipt欠落はOS側未実行/未確認として保持する。HARNESS-L2-025/026の設計生成・pair oracleと責務を混同しない。

**追加oracle候補（登録revision `MPR-RC-HARNESS-L2-041-003`、未採択；HARNESS-L2-041 L11）**：

- **原子的obligationの拒否例**：固定したactive template revisionと適用scopeに、異なる二つの義務がある。抽出結果が両方を一つの複合atomへまとめた場合、二つのsource spanに対応する個別atomが揃っていない不一致を示し、そのscopeを抽出済みとしない。各義務が別々のatomとして出る場合だけ、この原子性条件を満たす。これは抽出結果が要素ごとのatom対応を満たすかだけを判定する。
- **同一入力・同一extractor/versionの再抽出不一致例**：同じactive template bytes/revision、scope、applicability入力、extractor identity/versionで独立に得た二つの抽出結果を比較する。semantic digestが異なる場合、非決定的抽出として差分をfindingにし、一致した抽出結果として扱わず、そのscopeを未解決に保つ。同じdigestが得られた場合も、この比較に限った一致であり、抽出器の一般的な決定性や他scopeの成立へ外挿しない。判定範囲はこの入力scopeに対する抽出結果の一致に限る。

### HARNESS-L2-042 Design Refactor判定とepisode分離の受入候補

**対応要求**：`HARNESS-L2-042`（⑤のunit候補、`version_target: 1.0`、未採択）。親は`HARNESS-L1-003/004/005/007`。本節の例は未実行の内容oracleであり、文書の存在で候補採択・実装・利用者受入を生成しない。Performance Refactorの条件は採択済み`HARNESS-L2-016`と対L11に従う。

**正常例**：同じ対象revision・scopeの二つの改善対象について、名称だけでなくsemantic similarity、影響するconsumer、既存oracle、依存graphを照合し、各条件の根拠からDesign Refactorの可否と理由を返す。変更前後の対象scopeの振る舞い・契約・要求が維持されることを016のoracleで確認する。機能追加があれば別episodeへ分け、Design／Performance Refactorの当該episodeへ混ぜない。Performance Refactorを選ぶ場合は016の事前固定と実測比較の受入を別途満たす。

**誤りを含む例**：名称が似るだけで統合する例に加え、semantic similarityの根拠、関連consumer、oracle、依存graphのうち一つだけを欠く例を各々投入し、根拠不足を個別に不成立または未評価とする。機能追加をDesign RefactorまたはPerformance Refactorと同一episodeへ入れる例も拒否する。公開契約・要求・永続状態の意味が変わる例をRefactor成功として受け入れず、該当する左の層へBackflowする。性能の測定不能・回帰は016の対L11で拒否し、本節の成功で相殺しない。

**未見例**：未公開の同scope consumerまたは依存関係を含む変更候補を与え、固定された契約とoracleに照らしてDesign Refactorの根拠を照合する。consumer、oracle、依存graphまたは対象revisionを特定できない範囲はunknown／未評価に残す。判定の成功を別scope・別revision、機能追加、下流の実行結果へ外挿しない。

**戻し先**：意味判定・consumer・graphの不足はsource／設計／契約ownerへ、対設計の欠落は`HARNESS-L2-019`へ、要求または契約の意味変更は`HARNESS-L2-003/004/016`のBackflow先へ戻す。実行・ticket・CIの成否は該当OSまたは利用者の運転契約で扱う。

### HARNESS-L2-043 active templateのrule／branch別例coverage

**対応要求**：HARNESS-L2-043（HARNESS-CORE unit候補、`version_target: 1.0`、未採択、CORE配置は推奨案でPO未決）。親L1はHARNESS-L1-001/004/009。043は例coverage契約を定め、template選択・適用はL2-009、active templateの要素抽出は041、設計unit/compositeと対oracleは026/025へ分ける。旧sourceはHIL-FR-55、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:145`（line SHA-256 `78a2e6c819e73153ce2bbd832c0f87777dba08750fa1b84fcafc916fa7cafa30`）。旧packet `concept-requirement-po-decision-packet.md:1009`の配置表記は汎用の`部品`である。HARNESS-L2-009の同packet `:174–178`にある`部品：Design Template`は009自身の配置例であり、FR-55または043の既決配置を意味しない。CORE案は、選択scopeの例coverage oracleが製品固有の意味・設計を持つHARNESS core側の責務で、BRAINを設計patternの知識源としてconnector接続するという2026-09-25 PO記録（`docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md:51–55`）を理由とする提案であり、旧配置の証明ではない。COREは現候補の推奨配置にとどまり、PO判断を待つ。

**正常例**：選択されたactive template revisionと適用scopeの全validation rule／applicability branchを分母として確定する。各rule／branchにcanonical positive例と境界negative例を最低1件ずつ対応付け、例ごとに適用条件、期待する受理／拒否、oracle、source spanを照合する。状態遷移、failure、security、migration、multi-runtime差異については対象risk分析で未被覆と特定された場合だけ追加例と理由を示す。例の数ではなく、適用rule／branchと該当riskが内容上検査されたかを判定する。

**誤りを含む例**：いずれかの適用rule／branchについてpositiveまたは境界negativeを欠く、positive例がrule条件を満たさない、negative例が境界条件を試さない、期待結果とoracleが結び付かない、適用branchを飛ばす、または例数だけで十分とする入力は不合格または未評価とする。risk分析で未被覆とされた領域に追加例がない場合もcoverage未完とする。TBD・unknown・適用性不明を推測で埋めない。

**未見例**：作成側に伏せたactive template revisionまたは新しいapplicability branchを与え、対象rule／branchの分母を更新し、positive／boundary-negative例とoracleへの対応を照合する。新revisionやrisk根拠が欠落・矛盾・staleの場合は十分性を主張せずunknown／未評価にする。結果を未選択template、別scope、別revisionへ外挿しない。

**戻し先と境界**：templateのactive版・適用条件不足はHARNESS-L2-009/対象template owner、rule／branch抽出の不足はHARNESS-L2-041相当の契約owner、oracle・検証義務・risk根拠の不足はHARNESS-L2-004/該当ownerへ戻す。例のcoverage結果は要求合意、設計成立、L3承認、候補採択、実装、OS実行または利用者受入を生成しない。旧schemaやruntime固有形式を受入条件にしない。

### HARNESS-L2-044 design obligation portfolioの契約coverage（HELIX-HARNESS内の部品候補）

**対応要求**：HARNESS-L2-044（HELIX-HARNESS内の部品候補、単体能力、`version_target: 1.0`、未採択。個別部品の配置はPO判断待ち）。親L1は`HARNESS-L1-001/004/009`。本候補は旧HIL-FR-54、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:144`（line SHA-256 `502ef00823463c0fd4218c7b554e4b6959fc28aa9006d6d6eb79f555b86b4f67`）の意味条件を現行の抽象的なcoverage契約へ再導出する。旧PO packet `docs/governance/crosswalks/concept-requirement-po-decision-packet.md:1008`の配置表示は汎用の`HELIX-HARNESS、部品`までで、個別所属は決めない。受入は未実行であり、候補採択を意味しない。

**正常例**：同一対象revision/scopeの適用requirement atom、design obligation、normative contractと対oracleを意味classへ整理し、authority、lifecycle、interface/data/state/event/failure/security/observability/operation、V-pair oracle等の該当条件を各classで追跡する。各classについて、原則一つのnormative contractへの割当、既存契約の再利用、delta追加、新規作成、または根拠付き非適用を確認する。classごとの義務とoracleが割当先に対応し、未被覆classと意味重複がゼロであることをcoverageから再構成できる場合に限り、そのscopeのportfolio閉包を受け入れる。

**誤りを含む例**：適用義務classに契約／oracleがない、同じ意味の義務を複数契約へ無説明で割り当てる、根拠なしに非適用とする、既存normative contractを孤立させる、または未被覆・意味重複を残したまま最小portfolioとする場合は不合格とする。複数契約が必要な場合に境界・理由が示されない例も不合格とする。fieldやmatrixが存在しても、義務内容と契約の意味対応をoracleで照合できなければ受け入れない。

**未見・失敗例**：作成側に伏せた適用義務class、契約revision、またはapplicability branchを加え、分母とportfolio coverageを更新する。新classが未割当なら未被覆として検出され、意味重複があれば該当classとcontractを示す。source atom、active template、適用性、oracle、契約版の欠落・矛盾・staleはunknown／未評価に残し、合格扱いにしない。変更された入力に既存receiptを流用しない。

**戻し先と境界**：要求意味・authority不足は要求owner、template適用と義務導出不足はHARNESS-L2-009/対象template owner、template atom抽出不足はHARNESS-L2-041相当の契約owner、具体設計と対oracle不足はHARNESS-L2-026/022等の該当ownerへ戻す。HARNESS-L2-025のgeneric composite整合やHARNESS-L2-043の例coverageだけで本候補のportfolio閉包を代替しない。候補や受入結果は要求合意、L3承認、設計承認、実装、OS実行、利用者受入を生成せず、旧schema／runtime固有の形式を要求しない。

### HARNESS-L2-045 WBS作業単位の形の受入候補

**対応要求**：`HARNESS-L2-045`（単体候補、`version_target: 1.0`、未採択）。親候補は`HARNESS-L1-001/002/003/004`で、L2記載の導出理由に従う。以下は未実行の内容oracleであり、HDECによる分割前WBS-HARNESS-001の意味承認を、現行045の採択や受入済み状態へ読み替えない。

**正常例**：有効なHARNESS規範revisionと対象scopeを明示した作業単位について、依存、並列／直列、scope、予算上限値またはその出典参照、期限値またはその出典参照、対応するV-pair検証、受入条件、変更種別、工程順序、停止・差戻し条件が特定できる。依存関係と工程順序が整合し、依存先が完了する前に後続作業を並列可能としない。HARNESSが定めた規範項目をOS側schemaへ写しても意味と適用revisionが保持され、不適合な作業単位が登録対象にならないことを確認する。予算・期限は値と出典参照の保持だけを確認し、数値の妥当性や運用上の超過判定はこの受入で決めない。

**誤りを含む例**：必須形の一つを欠く、予算上限または期限の値も適用元参照もない、scopeまたは変更種別が特定できない、依存先が未完了なのに並列指定する、依存と工程順序が矛盾する、対応するV-pair検証または受入条件がない、規範の適用revisionと異なる形へOSが項目を改変する例を与え、登録不適合として拒否されることを確認する。適用すべき規範revisionが不明・stale、または適合性を決める入力がunknownの場合は、適合として登録せず保留する。値・参照は存在するが参照先の値、単位、許容値、超過時の運用扱いが未解決の場合、その意味や追加gateはPO未決とし、適合を推測して登録しない。

**未見例**：作成側に伏せた依存edgeまたは変更種別を含む作業単位と、未見の有効規範revisionを入力し、適用scope・規範項目・依存と順序の整合を再特定する。新しい形が有効規範に含まれると確認できない場合は、旧形式などへ暗黙fallbackせずunknown／保留にする。結果を別scopeまたは別revisionへ外挿しない。

**境界と戻し先**：HARNESSは規範と適合条件を所有し、OSはその有効版を台帳schemaへ写して登録時に適合を照合する。OSは規範を変更せず、適合しない作業単位は登録拒否、適用版または適合性unknownは保留とする。検証・受入条件不足は`HARNESS-L2-004/022`、依存区分は`HARNESS-L2-023`、工程style・順序・差戻しは`HARNESS-L2-002/003`のownerへ返す。旧PHCAP-08との同等性はunknownのままとし、旧固定上限、schema、runtime、CLIを受入条件にしない。予算・期限の値の意味や未設定・超過時の扱いはPO判断事項であり、本受入候補は決定しない。

### HARNESS-L2-046 V-model全体workflowとScrum slice deltaのbackfill受入候補

**対応要求**：`HARNESS-L2-046`（単体候補、`version_target: 1.0`、未採択）。親L1候補は`HARNESS-L1-001/002/004`で、L2記載の導出理由に従う。以下は未実行の内容oracleであり、L2-002/003の採択済み条件、SR4 receipt、OSの運転結果を置き換えない。

**Full Vの正常例**：Full Vを選択し、対象revisionのsystem workflowと適用するL1〜L5層・設計資産を入力する。workflowを該当層で段階的に明確化・freezeし、各段階の対応V-pairでsystem全体の全transition、loop、terminal、exception、permission、timeout、notification、audit、data、switching、routing、resource allocationを検証する。対象との関係、層ごとのfreeze状態、検証状態を追跡できることを確認し、条件の適用性やoracleが未提示ならunknownとして残してsystem全体のclosureを主張しない。このFull V scopeはslice化しない方式であり、Production Scrumのslice delta、Scrum Reverse、SR0〜SR4、SR4 receiptなしでも、Full Vの段階的freezeとV-pair検証closureが満たされれば候補条件を満たす。

**Production Scrumを含むscopeの正常例**：Production Scrumを選択したscope、または2026-09-25 PO判断に基づき許可された方式合成のうちL2-002/003でScrumを適用する部分に、system workflowから切り出したslice deltaを先行適用する。既存triggerに従い、sprint review時またはrelease合流前にScrum Reverseがsystem workflowと該当L1〜L5設計資産へbackfillし、SR4 pair-freezeを得たScrum scopeだけをrelease-ready候補にできることを確認する。SR0〜SR4を要する既存checkpoint triggerが成立するscopeでは各段階とreceiptを別々に確認し、SR4 receiptが欠けるScrum scopeをrelease-readyとしない。方式定義・合成許可、L3までの共通工程とtrigger条件は変更しない。

**誤りを含む例**：Full V scopeで適用するL1〜L5層の段階的freezeを欠く、system workflowのtransition等の適用条件を未検証のまま全体完了とする例は不成立またはunknownにする。Full VにScrum slice deltaやSR4 receiptがないことだけを理由に不成立とする判定は過剰適用であり、認めない。Production Scrumを選択・合成適用するscopeでは、slice deltaをsystem workflowへ戻さないままsprint reviewまたはrelease合流を進める、該当L1〜L5設計資産のbackfillを欠く、または必要なSR4 receiptなしにrelease-readyとする例を不成立またはunknownにする。slice単体の成功、一般的なV-pair一覧、別revisionのSR4 receiptでScrum scopeの不足を相殺しない。

**未見例**：作成側に伏せた追加transition、exception、または新しいslice deltaを与え、対象system workflowとbackfillのcoverageを再照合する。入力にoracle・適用性・source revisionがない範囲はunknown／未評価を維持し、別scopeや別revisionへ結果を外挿しない。

**戻し先と境界**：workflow semanticsまたはstyle適用条件の不足はHARNESS-L2-002/003、検証義務・pair oracleの不足はHARNESS-L2-004/022へ戻す。OS ticket、workflow instance、保存state、runtimeをこの候補の成果とせず、L11例は利用者受入の実行結果を生成しない。

### HARNESS-L2-047 専門Workerの必要性判断と契約生成の受入候補

**対応要求**：`HARNESS-L2-047`（HARNESS-CORE単体候補、`version_target: 1.0`、PO未決・未採択）。候補配置AはHARNESS-L1-001/002/004、比較案BはINTELLIGENCE配置である。HARNESSはprocess/verificationと候補契約の意味を定め、INTELLIGENCEの配置案、LABOの測定材料、OSのassignment/runtime lifecycle、SECURITYのauthorityを混同しない。この受入案から実行済み状態や要求採択を生成しない。

- **正常例：専門Workerを必要とするtask**：task identity/scope/revision、適用process phase・task-kind・verification oracle、single-worker既存roleとの比較条件、適用範囲が一致するLABO evidenceを入力する。専門知識、独立context、並列性、blind verification等のtask関連利益と比較根拠が決定に結ばれた場合だけ`muster`候補を返す。次にruntime-neutral contractがHIL-FR-59由来の全field（objective、成果物schema、tool guidance、task boundary、context selectors、allowed/denied tool/path候補、model/effort class、budget、checkpoint、escalation、verification contract）を持ち、input/output digest、generation rationale、guard validation結果へ追跡できることを確認する。同一正規化入力と生成規則revisionでは意味内容とdigestが一致する。
- **正常例：単一Workerで十分**：比較条件が既存roleで十分と示すtaskは`existing_role_sufficient`とし、追加specialist contractを生成しない。該当role候補へ戻し、OS assignmentは別の既存契約で扱う。
- **保留例：比較材料不足**：LABO evidenceが未評価、適用scope外、staleまたは欠落、比較対象不明、oracleまたはtask boundaryが未確定の場合は`unknown_or_defer`を返す。適用できない測定を専門化利益に換算せず、必要なowner/evidenceと未完条件を示し、contract生成・OS起動候補を進めない。
- **不成立例：根拠のないmuster**：single-worker比較を省略する、専門性ラベルだけを根拠にする、provider/model名・価格・Bench水準だけから選ぶ、無関係なtaskの並列性を便益とする、固定数値thresholdを追加する場合は不合格。比較測定はtask scope・適用oracle・evidenceへ結び、条件不足はunknownとする。
- **不成立例：境界/権限の昇格**：contract内のtool/path候補をSECURITY許可として扱う、OS assignmentやWorker起動をHARNESSが行う、INTELLIGENCE/LABO proposalを割当済みと扱う、HARNESSがSECURITY authorityや実行環境の隔離を代替する場合は不合格。OSが適格な既存runtime profile/assignmentを示せない場合、projectionはunknown/拒否となり完了しない。
- **不成立例：worker/verifier separation**：同じidentity・context・authorityをworkerとverifierに使う場合は不合格。同一provider/modelの属性だけを理由に別identity/context/authorityの検証を非独立と扱う場合も不合格。provider/model記録の欠落も検知する。
- **lifecycleと中断**：適用されるlease/fencing/失効/retire条件とOS lifecycle evidenceが不足または不一致なら当該候補を保留し、別assignmentへ資格情報・状態が漏れないことを別owner契約で確認する。source revision、scope、oracle、generator revision、runtime profileまたはauthorityが変化した場合、依存する判断/contractをstaleにして該当ownerへ再照合する。中断・budget/期限到達では判断根拠、partial contract、未完義務、再開条件を残し、成功扱いにしない。
- **未見例**：未見task-kind/domain/riskまたは適格profileを与え、同一の境界で必要性判断、unknown処理、contract field coverage、digest追跡を確かめる。未選択profileやoracleを推測で補わず、source/適用条件が不明なら保留する。
- **受入の限界**：このcandidateの静的oracleは測定実績、runtime実行、assignment、authority、採択、設計承認、利用者受入を生成しない。既存HARNESS/OS/INTELLIGENCE/LABO/SECURITYの正本要求を変更せず、旧runtime/schemaを再現しない。


### HARNESS-L2-048のL11受入候補（未実行）

- **有効例**：設計object、対象、役割型、canonical候補、stable object ID、implementation symbol、consumer、oracle IDを別edgeで与える。名称が変わってもobject IDとoracle IDへの対応が保持され、domain object＋operation＋oracle IDの対応が辿れ、要求・検証のpairは同じidentityを指す。
- **自動修正可の例**：canonical名が既決、internal symbolのみ、全consumerとsemantic signatureが列挙され、振る舞い不変、最小差分、rollback evidenceが揃う場合だけ、botが修正PR候補とrename receiptを作れる。bot自身はmergeしない。
- **拒否例**：文字列が似ているだけで統合、`Manager`等の曖昧語を根拠なく許可、private symbol名だけへoracleをbind、またはrename後にstable ID/oracle edgeが切れる場合は不合格。
- **返却例**：role unknown、consumer incompleteness、semantic signature mismatch、public API/CLI、persisted field/event、直接参照される設定keyでは自動修正を拒否し、理由・影響・戻し先を記録する。互換migrationが要る対象を単なるinternal renameで合格にしない。
- **例外経路**：自動修正不能findingは警告として残し、理由・owner・expiryのある例外が指定されたfixtureでは後続へ進める。期限なし・責任者なしの例外は不合格。
- **CI非権限**：検査結果と候補提示は証拠であり、採択・merge admission・実装権限を生成しない。受入条件は候補の期待結果であって未構築CIの実行証拠ではない。

### HARNESS-L11-049 画面prototypeの表示計測oracle・検査精度・文言量評価の受入候補

**対応要求**：`HARNESS-L2-049`（HELIX-HARNESS単体候補、`version_target: 1.0`、未採択）。以下は静的な受入oracle案であり、実際の描画、測定、LABO評価、PO合意を実施した証拠ではない。

- **単独成立例：既存screen identityを持つrendered prototypeを測定する**：screen ID、対象revision、当該scope・revisionでの利用許可、適用profile、device/view/viewport等の測定条件が入力に揃ったrenderable prototypeを、049は単独成立する測定対象として受け付ける。既知のpositive/negative fixtureがある測定項目は期待分類と実測を照合する。この成立にprototype生成、Pattern selection、screen IDの発行処理や発行証拠は要らない。049は入力済みscreen IDとrevisionの対応を使い、IDを新規発行しない。
- **screen ID欠落**：対象を指すscreen IDが入力に無い、または対象revisionへ結べない場合は、対象の測定をpassにせず不足／unknownとして返す。049は代替IDを作らず、欠落とrevision不一致を区別して記録する。screen IDが存在する場合に、その発行過程や発行者の証拠まで追加要求しない。
- **正常例：表示と測定**：選択したdevice conditionとview/viewport条件で実際に描画した対象画面、主要stateなどの条件、各測定のoracle/手段/版、証拠が同じ対象revisionへ結ばれる。適用対象についてアクセシビリティ、コントラスト、画面幅別の崩れ・はみ出し、主要状態、profileに基づく文言量の各結果を個別に確認できる。device/view条件が未指定または証拠に結べない測定はunknownとする。適用外または未測定は理由付きで識別し、他項目の結果で埋めない。
- **正常例：検査精度**：検査項目ごとの既知の正例・反例fixtureと期待分類、実測結果を照合し、誤検出・見逃しを評価できる。選択scopeと異なるfixture・source revisionの結果を流用しない。LABO評価が必要な範囲では既存接続経由の評価結果と未完義務を識別する。
- **正常例：文字量**：profileが画面・領域・文言の役割と目安を定める範囲で、上限超過、同じ内容の反復、説明のためだけの説明を理由付き候補として作成側へ返す。閾値をprofileや根拠なしに作らず、人の文言判断や修正を承認済みとして扱わない。
- **状態境界**：機械検査のpassは`implemented`や`ux_verified`を生成しない。両状態の分離は既存`HARNESS-L2-039`候補の範囲と重なるため、049の単独成立・測定結果から状態を主張できない。
- **不成立例**：表示せずに生成物/静止画だけで測定済みとする、screen IDまたは対象revisionが欠落・不整合なのに測定をpassにする、採択されていないPatternやCORE制約を確定済みとして用いる、検査精度がunknownなのにpass根拠へ使う、文字数の一律閾値を追加する、人の合意をAIが代行する、`implemented`から`ux_verified`を推定する、後続版のreal-user UX/drift/analyticsを1.0完了条件に混入する場合は不合格またはunknownとする。prototype生成、Pattern selection、screen ID発行の証拠が無いことだけでは失敗にしない。
- **未見例**：追加のdevice condition、view/viewport、画面状態、文言役割を与え、選択scopeのoracle・fixtureにない条件をunknownとして残せることを確認する。未選択の機器・役割・locale等について、実施・合格を推測しない。
- **受入の限界**：文書上の対応関係、candidate登録、fixture一覧、描画画像の存在だけでは要求採択、実測成功、検査精度、PO合意、実装、実利用者評価、L3/L11の実際の完了を成立させない。O10で後続版へ回したreal-data/user evaluation、prototype-implementation drift、analytics event接続を1.0候補の合格要件にしない。


### HARNESS-L11-050 レイヤ台帳リファクタリング証跡の受入候補（未実行）

**対応要求**：`HARNESS-L2-050`（HELIX-HARNESS単体候補、未採択、`version_target`未指定）。本節は静的な受入oracle案であり、実行・採択・旧ケースの合格を示さない。

- **正常例**：同一の対象scope/revisionについて変更前後のledger row/edge、重複・責務混在・semantic/name collision・変更波及・孤立edgeの個別評価、上下左右consumerの母集団と列挙結果、before/after oracle、対応V-pair、behavior/contract/state差分、rollback planを結ぶ。evidenceが揃い、behaviorと要求/public contract/persistent stateが不変の場合、候補操作と影響一覧をDesign Refactor判定用材料として記録する。既存016/042の判定をこの受入が代行しない。
- **異常例：evidence欠落**：consumer母集団またはrevision不明、edge/oracle/pairの対応欠落、前後比較不能、rollback planや戻し先欠落を個別に与える。該当範囲はunknownまたは不成立とし、Design Refactor成功扱いにしない。別revisionのreceiptや別scopeのoracleで不足を補わない。
- **異常例：意味・状態変更**：public contractまたは要求意味の変更を含む差分はDesign Refactor候補に通さずRedesignへ戻す。永続state変更はRetrofitへ戻す。pair/behavior破壊もbehavior-preserving候補を不成立にする。これらのrouteは既存要求の責務に従い、本候補が新しい承認や操作権限を作らない。
- **未見例**：作成側に伏せたconsumerまたはorphan edge、同名異義のrow、scope外の隣接ledger revisionを与える。既知母集団外・適用oracle不明の範囲をunknownに保ち、未見consumerなし、影響なし、全体closureと推定しない。
- **証拠と境界**：receiptは対象revision、scope、evidence参照、未評価範囲、戻し先を識別する。文書・receiptの存在だけで実際の変更、rollback成功、要求採択、L3承認、OS writer実行、CI、受入完了を主張しない。HOT-HIL-47/HST-HIL-033は設計oracleとして参照するだけで、実行しない。
- **明示的除外**：HIL-FR-51/52/53/54/55をこの対受入へ含めない。HIL-FR-50の全旧条件、HIL-BR-25/HIL-NFR-29の全条件、旧test/runtimeの実行結果についてclosureを主張しない。


### HARNESS-L11-051 工程終了 evidence 対応の受入候補（未実行）

**対応要求**：`HARNESS-L2-051`（HELIX-HARNESS単体候補、未採択）。本節は静的oracle案であり、実行・採択・stage exitを示さない。L11がL2の受入oracleを担い、L10や下位pairの結果だけでL11の受入を代替しない。

- **正常例**：一つの対象stage/scope/revisionで、stage goal、canonical/paired layer、owner、required output、適用oracle、evidence参照、未完条件の分類を相互に追える。適用stageに必要な既存pairの根拠が揃い、未解決事項がない場合は、その対象scopeで確認できた状態だけを示す。既存責務へ型付きで引き継いだ項目は、stage終了と区別して残る。
- **未完例**：必要なpair、oracle、対象revision、evidence参照が欠けるか互いに不一致の場合、欠落箇所をunknown/未完として特定し、完了・遷移可能とは扱わない。別stage、別scope、別revisionのpassやreceiptで補わない。
- **誤り例**：下位stage pass、CI green、文書/receiptの存在、OS ticketのclosedだけを入力し、stage exit済みと主張する。対象stageの根拠がなければ未完またはunknownに留める。
- **未解決事項**：空集合、既存の型付き後続義務への引継ぎ、または未完を保つdeferの区別を確認する。採択済み要求の未完・停止条件を保ち、期限、再入場条件、stageごとの独立reviewを必須とする解釈は本oracleの合格条件に含めず、別案として保留する。
- **未見例**：未知のstage/pair/owner/oracleや列挙範囲外のevidenceを与え、根拠がない項目をunknownに保ち、全体closureや不存在を推定しない。
- **authority境界**：receipt/document/registerの存在、本oracleの静的確認、または登録状態からPO採択、L3承認、実装・実行許可、旧要求coverage closure、実際のstage exitを生成しない。OSは参照と運転状態を記録する側であり、HARNESSの工程意味やexit判断を決めない。
- **旧source境界**：旧`LEGACY-ASSET-D27D4A1511BFD43623A9`のlines 47–68、70–72は局所照合の対象で、選択した25 line atomsはすべてsource holdingに残し、HARNESS-L2-051へ直接carryしない。旧条件を正式successorとして数えない。各stageの独立review必須化、defer期限・再入場条件も未採択optionであり、このoracleの必須合格条件ではない。旧test/runtimeは参照・実行しない。
### HARNESS-L11-052 canonical command意味identityと異payload再送の受入候補（未実行）

- **対応要求・状態**：`HARNESS-L2-052`（HELIX-HARNESS単体候補、未採択）。本節は静的oracle案であり、実行・採択・旧case合格・canonicalization実装を主張しない。
- **正常例**：同じcommand ID、scope、base revision、正規化規則revisionおよび意味payloadを持つ初回要求と再送を与える。両方が同一のcommand意味identity／意味結果へ対応し、再送を別の意味変更として数えないことを確認する。command ID以外の入力が同じであることを比較根拠としてreceiptに残す。
- **異payloadの負例**：最初のcommand IDを受け付けた後、同じIDで一つの意味payload atomだけを変えた再送を与える。後続要求が`conflict`となり、先行identity・先行意味結果・先行receiptのdigestとrevisionが変わらず、二つ目の意味revisionが生じないことを確認する。payload digestの欠落、scope違いまたは正規化規則revision違いを同一payloadとみなさない。
- **base競合の負例**：同一command ID・同一payloadでbase revisionのみが古い、または先行登録時と異なる入力を与える。意味identityの照合結果とOSのbase CAS結果を別々に記録し、OSがstale/conflictを返した場合にHARNESSが新しい意味canonicalizationとして受理しないことを確認する。
- **unknown・欠落例**：command ID、scope、base、payload digest、正規化規則revisionまたは先行identityのいずれかを欠落・不一致にする。値を補完・推測せず`unknown`または`conflict`とし、passにしない。別scope・別revisionのoracleで不足を埋めない。
- **証拠と責務境界**：oracleは入力各値、正規化規則revision、先行・後続semantic digest、判定、先行receiptの不変性と差戻し先を結ぶ。意味照合結果は、OSの永続化、multi-artifact commit、failure isolation、実際のretry成功、L3承認、要求採択、CIまたは全FR-52/53 closureを主張しない。HOT-HIL-49の異payload conflict条件はoracle設計の参照元として記録するだけで実行しない。
- **旧sourceとの対応・除外**：旧HIL-FR-52 line 142のcommand idempotencyを保持し、HOT-HIL-49のsame-command/different-payload negative caseで反証可能にする。base CASとartifact故障注入は対HELIXOS-L2/L11-053で扱う。HIL-FR-53 line 143およびHOT-HIL-49に列挙されたrename/split/merge、asset authority/oracle/typed edge保持は本受入の対象外であり、別のsource holdingに保持する。


### HARNESS-L11-053 意味revisionとasset lineageの受入候補（未実行）

**対応要求**：`HARNESS-L2-053`（HELIX-HARNESS単体候補、未採択）。以下は静的な受入oracle案であり、実行、採択、旧testの合格を示さない。

**確認する候補成果**：`asset revision`は意味変更のrevision記録、`identity/location history`はrename/move後も同一identityを追跡できる履歴、`split/merge disposition`は変換前後のidentityとrelationの対応、`semantic diff`は意味revision間の差分をそれぞれ指す。これらは候補受入で確認する出力名であり、実装済みreceiptの存在を表さない。

- **rename/move**：同じasset IDに対するpathまたは名称の変更前後、location履歴、対象revisionを追跡できる。配置変更だけで新しいidentity、意味revision、authority移転を捏造しない。
- **意味revision**：意味の変更前後を同一identityの異なるrevisionとして識別し、semantic diffと影響するoracle/typed edgeを対応付ける。変更のないrename/moveのみを意味変更として数えない。
- **split/merge/supersede**：入力・結果assetのidentity、lineage relation、各revision、authority、oracle、typed edgeの対応を個別に確認できる。親子や統合元の追跡が切れる、または対応が不明な項目は欠落・unknownとして扱い、全履歴保持やauthority移転の成立を主張しない。
- **authority欠落の負例**：split/merge/supersede後の対象identity・revisionは揃うがauthorityの対応が欠ける入力を与える。該当lineageのauthority保持を合格にせず、その欠落だけをunknownまたは不成立として報告する。
- **oracle欠落の負例**：対象revisionに必要なacceptance oracleの参照または対応が欠ける入力を与える。履歴やauthorityが揃っていても受入可能とは判定しない。
- **typed edge欠落の負例**：親子・統合元・後継identity間のtyped edgeが欠ける入力を与える。他の履歴、authority、oracleが揃っていてもlineage closureとは判定しない。
- **競合・未見条件**：同名異義、同一pathの再利用、identity重複、base revision違い、lineage先の欠落を与え、path/name一致だけで同一assetと判定しない。対応する履歴やauthorityが確認できない箇所をunknownに残す。
- **受入境界**：静的な候補、receipt、fixture、または文書参照の存在だけでは実際の保存処理、rollback、権限、実装、PO採択、L3承認、旧FRの全条件移管を成立させない。旧runtime、旧test、旧fixtureは実行しない。

### HARNESS-L11-054 専門Worker判定・契約のOS割当handoff受入候補（未実行）

**対応要求**：`HARNESS-L2-054`（HELIX-HARNESS connection候補、`version_target: 1.0`、未採択）。既存HARNESS-L2-047の内容oracleとOS-L2-004/-042/-043のassignment・成果・event責務を接続する静的oracle案であり、いずれの要求の採択・実行結果も示さない。

- **muster handoff**：対象task/scope/revision、`layer × drive`、process phase、task-kind、verification pattern/oracle、比較条件、適用LABO evidence状態を入力する。HARNESSの`muster_candidate`とcontract参照・digest・生成規則revision・理由・guard結果が同じ入力revisionへ結ばれ、OSが同じ対象と条件を既存assignmentへ結んだ場合だけhandoff対応を確認する。assignment/resultの記録はHARNESS contractの意味・oracleを変更しない。
- **既存role十分**：single-worker比較により`existing_role_sufficient`となる入力では既存role参照と比較根拠をhandoffし、追加specialist contractやそれ由来の新規専門assignmentを生成しない。既存の通常assignmentはOS側契約に従う。
- **unknown/defer**：`layer`、`drive`、軸のsource/revision、task boundary/oracle、比較対象、evidence適用範囲、contract digestまたはOS profile/lifecycle条件を一つずつ欠落・stale・conflictにする。未知値を別軸へ畳み込まず、HARNESSまたは不足を所有する機構へ戻し、該当specialist handoff/assignmentを保留する。layer/driveの現行phase等とのmappingが未定義ならmapping済みとして扱わない。
- **不成立例**：muster候補がないのにcontractをOSへ渡す、scope/revisionの違うcontractをassignmentへ使う、contract生成receiptをassignment・authority・Worker起動・成果受入として数える、tool/path候補やLABO/INTELLIGENCE材料からSECURITY許可を作る、worker/verifierのidentity・context・authorityの分離を欠く例は不成立とする。provider/modelの一致だけで独立性を否定しない。
- **未見例と変更**：未見task-kind/domain/riskまたは工程表の別layer/driveを与え、選択入力のrevision、軸、比較範囲、contract outcome、OSへの対応づけと戻し先を再照合する。source/authority/profile/oracleのrevision変更は依存するhandoffをstaleとして再確認する。
- **型と境界**：旧Claude/Codex専用projection、任意のTeamDefinition/member schema、固定Worker数を受入条件にしない。runtime-neutral contractの意味はHARNESS、assignment/runtime profile/lifecycleはOS、evidence適用性はLABO、placement案はINTELLIGENCE、operation authority/隔離はSECURITYの既存正本へ戻す。具体的なTeamDefinition相当の集約表現またはlayer/driveの厳密mappingが必要という判断は本oracleから生成せず、未決のPO/L3設計項目とする。
- **受入境界**：source/coverage receipt、候補本文、fixture、OS記録例の存在はoracle実行、実runtime projection、assignment、security許可、利用者受入、要求採択、L3承認を示さない。旧runtime/testを実行しない。

### HARNESS-L2-055 隣接層の双方向trace gate結果受入候補（未実行）

**対応要求**：HARNESS-L2-055（HARNESS-CORE unit候補、未採択）。以下は静的な内容oracle案であり、実行、採択、L3承認を示さない。

- **正常例**：固定したscopeに隣接する親・子の義務と上下両方向のtraceが揃う入力では、scopeと対象revisionが分かる成立範囲を示し、未解決descent/backflowを0として識別する。これは候補oracleの期待であり実行証拠ではない。
- **不成立例**：child側の上位参照だけを欠落させた入力では未降下を、親側のbackflowだけを欠落させた入力では未逆伝播をそれぞれ区別して提示し、片方向の関係から双方向成立を返さない。非隣接edge、親より粗いchild、個別義務をaggregateでまとめた入力は該当する不一致を個別に示し、scopeを成立扱いにしない。
- **unknown例**：対象scope/layer、row identity、source revisionまたは適用する隣接関係が欠ける・矛盾する場合はunknown/未完を示す。stale revisionやsnapshot不一致はNFR-29 cross-conditionへ残し、この候補のFR-48受入結果として数えない。
- **戻し先と境界**：要求意味・隣接層の定義不足はHARNESS側の要求ownerへ返し、台帳保存・ticket・実行証拠の欠落はOS側の該当ownerへ返す。候補の結果だけでL1承認、L2合意、L3承認、実行成功、要求採択を生成しない。

### HARNESS-L2-056 canonical V-pair gate結果とfeedback受入候補（未実行）

**対応要求**：HARNESS-L2-056（HARNESS-CORE composite候補、未採択）。以下は静的な内容oracle案であり、実行、採択、L3承認を示さない。

- **正常例**：対象revision/scopeでcanonical 6 pairが対応するatomic oracle単位で照合され、L12 feedbackがL1企画と層外L0 charterの両方へ結び付く入力では、pairごとの成立範囲を識別する。L0は層外anchorのままでpair数へ含めない。
- **不成立例**：6組のうち1組だけで片側edgeまたは対応する実行結果を欠落させたとき、そのpairと不足条件を特定し、そのpairをcomplete/greenにしない。設計側と検証側でoracle identityが異なるpairも対応済みとして扱わない。別の5組の成立を欠落組の証拠へ流用しない。L12→L1またはL12→L0のどちらか一方だけがある場合、欠けた出口をfeedback未完として示す。
- **unknown例**：canonical pair定義、対象scope、oracle identity/適用関係、feedback先または結果証拠が不明・矛盾する入力はunknown/未完に保つ。異snapshot・stale revisionはNFR-29 cross-conditionへ残し、本候補のFR-49 atomに混ぜない。
- **戻し先と境界**：pair/feedbackの要求意味不足はHARNESS側の該当ownerへ、OSの実行・保存・登録証拠の不足はOS側ownerへ返す。候補受入の期待結果を旧実装の合格、L3承認、採択、実行許可または要求stage終了へ読み替えない。

### HARNESS-L2-057 closure gate意味条件の受入候補（未実行）

- **対応要求・状態**：HARNESS-L2-057（HARNESS-CORE unit候補、未採択）。以下は静的oracle案で、候補判断、受入実行、Issue close、formal successor割当を示さない。
- **正常例**：固定scope/revisionについてPR、CI、独立audit、選択済みstyleへのmerge、oracle、子Issue状態の各入力を別々に識別する。すべての必須入力がcurrentで未解決条件がない場合に限り、そのscopeの候補対象条件の成立結果を示す。memory条件は別項目`未判定（holding）`として残し、旧HIL-FR-07全体のclose可否を主張しない。これを実際のclose operation、要求受入、stage完了と同一視しない。
- **欠落例**：旧HST-CASE-023-02/04/05および023-07を候補oracle参照とし、audit、child Issue、oracle receiptを個別に欠落させた入力では各理由を保ったままHARNESSが候補対象条件を成立と返さないことを確認する。HARNESSはreceiptを発行せず、今回候補の条件がcurrentで未解決条件がない場合だけその評価結果をOSへ返す。旧caseのclose 0件／receipt発行結果はOS運転のoracle参照であり、設計oracleであって実行済み結果ではない。
- **異状態例**：PR mergeやCI greenはあるが独立auditまたは必須oracleがmissingの入力、child Issueがopenの入力、別revisionのreceiptを混ぜた入力を与える。merge/CIから不足evidenceを推測せず、open childや不一致・stale・unknownを候補対象条件の成立へ丸めない。
- **memory receipt境界**：旧HST-CASE-023-03のmemory receipt欠落時close 0件はholdingのoracle参照として表示する。候補対象の他条件は評価を続け、memory条件の現行意味・適用scope・close可否をこの受入で判定しない。provider memoryやsummaryだけを旧receipt扱いせず、負例を採択済み条件や実行結果へ変換しない。
- **責務handoff**：HARNESS結果は今回候補の条件の意味だけを返し、PR/CI/audit/Issue情報の収集・保存・close運転はOS-L2-054候補の対象とする。OS側receiptがなくてもHARNESSの意味判定を運転完了とみなさず、逆にOSのclose結果だけでHARNESSの条件充足を推定しない。
- **受入限界**：旧HIL-FR-07 line 97とHST-CASE-023-01〜05/07はsource／oracle参照であり、旧test・runtime・CIを実行しない。新世代CI未構築のため今回候補に必要なCI結果がunknownなら候補対象条件を成立と判定しない。具体style定義、各sourceのvalidation schema、旧memory compactionの現行対応、候補採択、L3承認、実装・実行許可は本受入の対象外。

### HARNESS-L2-058 六分類とcurrent/successor判定の受入候補（未実行）

- **対応要求・状態**：HARNESS-L2-058（HARNESS-CORE unit候補、未採択）。この節は静的oracle候補であり、候補採択、旧system assertionの実行、audit運転、Issue発行またはformal successor割当を示さない。
- 同一のPR差分、contract/impact/coverage snapshot、finding identityを入力した場合、finding分類候補は`current_pr_fix`、`successor_issue`、`duplicate`、`false_positive`、`accepted_risk`、`telemetry`のいずれかを型付きで識別する。入力または根拠が不足するときは分類確定でなく未解決を返す。
- current contractへの影響と責務境界を固定しseverityだけを変えた対では、`current_pr_fix`／`successor_issue`の判断軸を変えない。契約影響または責務境界が不足する例は分類を確定しない。旧HIL-BR-17／FR-30の詳細な境界条件をこのoracleへ追加しない。
- `duplicate`は生存targetまたはacceptance包含証拠の欠落時、`false_positive`は別verifierの反証または独立reviewの欠落時、`accepted_risk`は独立reviewまたはaction-binding PO receiptの欠落時に確定せず`disposition_pending`を返す。
- `telemetry`は観測ownerとexpiryの両方を記録する。いずれかが欠ける例はpendingのままとする。四つのnon-actionable分類はいずれも元findingをappend-onlyに保持し、receiptとappeal/reopen routeを残す。
- `accepted_risk`のPO receiptはPOの既存判断権限を結ぶ。これはuser directiveのcancel/supersede receiptや取消権限と同一視しない。
- 参照oracle：旧`HST-CASE-005-05`（`infinity-loop-system-assertion-cases.md:367`）は証拠付き非終端receiptとappeal routeを要求する。旧`HOT-HIL-29`と`HR-FR-HIL-03`はcurrent/successor分岐の参照根拠。旧L5 §3、旧L4 §4.2、旧HIL-NFR-21の条件を照合済み。すべて未実装の旧設計資料であり、実行証拠ではない。

### HARNESS-L11-059 Issue contract field omission受入候補（未実行）

- **対応要求・状態**：HARNESS-L2-059に対応する未採択候補。以下は旧assertionを基にした静的oracle期待であり、実行、要求採択、L3承認、実装完了を示さない。
- **正常例**：11個の別field (`objective`, `acceptance oracle`, `development style`, `case-driven activation`, `specialist capabilities`, `runtime mode`, `affected layers`, `style target`, `risk`, `scope budget`, `digest`)を全て識別できる契約入力について、versioned issue contractとdigestが同じcontract revisionに結び付いている状態を候補適合として識別する。値の意味内容やencodingの正解は本oracleで決めない。
- **個別拒否例**：完全入力からfieldを一つだけ欠落させるfixtureを11通り別々に作り、各々で欠落field名を示して不成立とする。複数fieldの同時欠落を個別field omissionの代替証拠にしない。field名の変更、fieldの結合、digest欠落も別の欠落として示す。
- **version/digest不一致例**：contract revisionと結び付かないdigest、または異なるcontract revisionのdigestが提示される場合、同じversioned contractのdigestとして成立扱いにしない。計算方式、暗号方式、serialization、競合解決はoracleで新設せず未解決にする。
- **OS handoff境界**：OS projection/intakeでfieldが欠落・改名・結合されたfixtureは、HARNESSの11-field contractを保持したhandoffとして適合扱いにしない。OS受領・durable receiptの形式や保存機構はHELIXOS-L2-102側の責務であり、HARNESSの意味oracleを代行しない。
- **oracle出典と保留**：旧`infinity-loop-assertion-coverage-ledger.md:71`のHIL-FR-03 assertionは各fieldの単独omitを拒否する設計条件を示す (`HIL_ISSUE_CONTRACT_INCOMPLETE`; HOT-HIL-03/HST-HIL-001, draft-defined/not-implemented)。旧`system_contracts.json`、acceptance case、test/runtimeの実行結果を移管・再実行しない。11 fieldの具体意味、型・値域、version/digest encoding、旧IRその他の必須条件の現行対応は未決のまま保全する。


### HARNESS-L11-060 工程入力revision対応の受入候補（未実行）

- **対応要求・状態**：HARNESS-L2-060と対になる未採択・未実行の静的oracle案。要求採択、stage完了、L3承認、実行を主張しない。
- **対応する例**：適用契約が明示するstage、対象scope、入力source revision/digest、当該stageの結果/evidenceを与える。同一対象revisionへ対応したものだけが当該stageの証拠として追跡できる。
- **拒否・unknown例**：入力digestを欠く、異なる対象revisionの結果を結ぶ、scopeが異なる、またはstage契約が不明/staleの例ではstage成立を示さず、欠落・不一致を返す。
- **境界例**：下流stageの証拠だけで上流stage成立を推定する、evidenceの存在からpair-freeze/完了を表示する、旧sourceの工程名を現行契約にないscopeへ適用する例は不成立。旧工程列、InfinityLoopEvent schema、前段receiptの普遍必須化はoracleに含めない。OSの保存結果はOS側契約の対象であり、HARNESSのstage意味判定と混同しない。
- **受入限界**：source atom一件の意味を限定して照合する案であり、旧HIL-FR-01全条件、consumer closure、旧runtime/test/CI、実受入は対象外。HR-FR-HIL-02およびHAC-HIL-02a/b/cは関連source/oracle参照の範囲で、実行しない。

### HARNESS-L2-061 文書品質レビュー条件の受入候補（未実行）

- **対応要求・状態**：HARNESS-L2-061に対する未採択・未実行の静的oracle案。PO採択、L3承認、実レビュー実行、gate通過を主張しない。
- **trigger例**：適用契約で大規模改定と分類された文書改定、gate evidence提出、pair freezeの各例で、対象revision/scopeに対応するread-onlyレビュー結果が必要となる。大規模の分類根拠が無い例では適用性をunknownのまま示し、任意の閾値を足さない。
- **4軸例**：正常例では整合・網羅・一貫・明確を別々に示し、各軸の対象revision/scopeと根拠を結ぶ。各軸を一つずつ欠落させた例、または別revision/scopeの根拠を結ぶ例は、その軸または全体をcompleteとしない。findingあり／findingなしの両方で対象を改変しない。
- **未完・境界例**：該当triggerでレビューが無い、結果がunknown/stale、軸または対象対応が欠ける場合、該当範囲の品質条件を完了扱いせず、その品質条件が適用gateの前提なら当該gateを通過させない。旧G1/G3/G7/G11を現行の固定集合として再導入しない。レビュー済み表示だけで採択・承認・merge・releaseを作らず、reviewer自身によるsource editや新しい人間sign-offを要求しない。
- **PO例外の正常例**：review未完の対象revision・scope、未完の4軸または証拠、通過を許す理由をPO自身が明示し、その記録が監査可能に保持される場合に限り、該当文書review条件についてgate通過の例外を示せる。結果には未実施・unknownを残し、レビュー済みや4軸合格と表示しない。他のgate条件、採択、approval、merge、releaseはこの記録から許可しない。
- **PO例外の拒否例**：AI・reviewer・gate運転者が自分で例外を宣言する、POの対象revision/scopeまたは理由が無い、記録が監査不能、別revisionの記録を再利用する、review未完を消して合格に見せる例ではgateを通過させない。旧環境変数や旧保存先の存在だけをPO判断の代わりにしない。
- **受入限界**：候補は三trigger、4軸、記録付きPO例外という選択source意味を検査する案であり、旧role/path/bypass実装、旧gate ID、旧runtime/testの移植・実行、旧FR-L1-45全体のclosureは対象外。


### HARNESS-L2-062 baseline debtと新規debt ratchetの受入候補（未実行）

- **正常 oracle**：適用可能な既存authorityからbaseline debt集合・対象revision・比較scopeが与えられ、同じscope・共通のdebt分類基準によるcurrent debt集合と照合される。current集合のうちbaseline集合に含まれる項目と含まれない項目が区別される。差分なしではbaseline debtをnew debtと誤分類せず、baseline debt自体を許容・解消済みとも表示しない。
- **負の oracle**：現行入力にnewと分類されたdebtがあるのにratchetを成立/passとする結果は不合格。baselineにあるdebtが現行にもあることだけを理由にnew debt扱いしない一方、baselineの残存を免除・受容した扱いにする結果も不適格。
- **未評価 oracle**：baseline authority/identity/revision、scope、current debt集合、baseline/current間で共通に適用するdebt分類基準または比較対象がmissing／unknown／stale／conflictなら、unknown/未評価として示し、成立/passへ変換しない。未確定な基準を推測して補わない。
- **受入限界**：本候補は一つの入力scopeに対する比較と結果意味だけを扱う。baseline authority/更新者/鮮度、threshold、debt taxonomy、対象全体、実行器、ticket/CI gate、既存debtの返済条件は本候補では決めない。旧runtime/testは実行せず、候補oracleの実行も未実施。

### HARNESS-L2-063 source-authority binding and freeze closure

この候補L11はHARNESS利用者が確認する意味条件であり、OSの登録writer/state更新/ticket実行、実装、旧runtime/testの実行結果を受入証拠にしない。正常oracleと各不成立oracleを別々に評価する。

- **Positive — complete revision**：固定source snapshotの各選択atomに原文spanとauthority revisionが結び、source authorityの既存dispositionが有効で、challengeが対象revisionに対して解消済みまたは明示的に非該当の根拠を持つ。選択template revision・applicability・040の契約と041のatom/gapが同じscope/revisionへ結び、すべての要求edge・design obligation・L11 oracleに型付き対応がある。全required oracleに正例と境界/負例の契約があり、change/stale receiptが同じ前後revisionと影響範囲を指す。未解消gapがなく、評価結果はそのrevisionだけを`eligible`として返す。OSのactive登録は別の既存state契約による記録がある場合だけ確認し、HARNESS receipt単独から保存済みactive状態を主張しない。
- **Negative — source authority欠落／衝突**：source span、source digest、authority参照、対象revisionのいずれかを欠落・改変・別revisionへ置き換える。atomは`incomplete`または`unknown`となり、候補やPR上の説明からauthorityを補わず、eligibleを返さない。
- **Negative — challenge未解決**：選択atomへの異議・challengeを未処理、対象外の裁定を流用、またはdisposition根拠なしのN/Aとして与える。対象revisionをfreeze eligibleにしない。新しい人間approvalを自動要求せず、既存authority状態と要求意味に従う戻し先を示す。
- **Negative — atom/edge/oracle closure不足**：TBD/aggregate atom、orphan、片向き・誤型・誤端点のedge、受入oracleの片側欠落、required oracle未実行、根拠のないN/Aを一つずつ与える。該当closureが個別に未完と表示され、別atom・別revisionの合格で相殺しない。未選択scopeの不足は未観測のままにする。
- **Negative — change/stale receipt漏れ**：source/template/edge/oracleの依存revisionを変更しても前revisionのreceiptを提示する、または影響範囲のedge/oracleを省いたchange receiptを提示する。影響するclosureだけをstaleまたはunknownとし、旧receiptから現在revisionのeligibleを生成しない。
- **Negative — template gapの早期active化**：041のgapが未解消、独立review対象revisionが異なる、reviewerが作成者と同一、finding/dispositionが欠落、またはレビュー前にactive扱いした入力を与える。gapは未解消として残り、候補状態やOSのticket/PR/project表示からactiveを推定しない。
- **Unknown — 未選択または未観測source**：対象外template、oracle、依存機構の記録がない場合、N/A・pass・failureへ推測変換せず`unknown`とする。入力選択を変えた場合はそのscopeの契約を新たに確認する。
- **境界**：HARNESS-L2-009のtemplate選択・適用、041の抽出とgap列挙、040のcatalog/pair/edge契約、035の上流根拠と受入寄与の各oracleを再実装しない。OS state/ticket/保存の実行成功、L3承認、要求合意、実装完了、全HR-FR-HIL-17のno-lossを判定しない。

### HARNESS-L2-064 support tierとprofile evidenceの対応受入候補

このL11は、選択scope内のtier/profile対応意味を制御fixtureで照合する候補である。実OSのruntime successをL2/L3要求起草・承認・freezeのgateにしない。実測結果やOS-020のrun receiptがない状態で、実装・OS互換性・製品supportを成立扱いしない。

- **Positive — tier別profile対応**：上流authorityが明示した適用scopeとprofile集合、同一contract/fixture、対象revisionを与える。各profileの結果がそのprofile固有のtier label、environment/run identity、oracle、evidenceへ結ばれ、Linux `primary/full`、macOS `first-class portable`、Windows `compatibility`の意味区分が保たれることを確認する。HAC-HIL-14aの旧positive oracleを成立と主張するscopeでは、Linux/macOS/Windowsの3 profileをそれぞれgreenのevidenceへ結ぶ。候補scopeがこの全3 OS条件を満たすかは本候補が決めない。
- **Positive — Linux全core gateとadapter contract test**：Linux `primary/full`の対象revisionについてrequired core gateの全集合と個別結果を与え、全gateがLinuxで実行されgreenである場合にのみLinux core completionを対応づける。macOS `first-class portable`とWindows `compatibility`のcontract差異をadapter contract testで検出した結果を、profile・共通contract/fixture・revisionへ結ぶ。これは結果解釈の静的fixtureであり、要求stageで実OSを実行する条件ではない。
- **Positive — 共通contractとadapter差分**：同じdomain contract/fixtureを各選択profileへ適用し、profile間の許容差をOS adapter境界に限る。各profile結果が別々に追跡でき、同じtierや同じ結果へ畳み込まれないことを確認する。
- **Negative — Linux証拠の代用**：Linux未実行の状態でWindows wrapperだけgreen、またはmacOS portableだけgreenの結果を与える。Linux core completionを拒否し、未実行状態と不足するLinux evidenceを保持する。
- **Negative — Linux core gateの一部欠落**：Linux `primary/full`のrequired core gate集合のうち一部だけgreenで、別のrequired gateがmissing／not run／unknownの結果を与える。部分実行の成功を全core completionへ拡張せず、Linux core completionを未完として不足gateを示す。
- **Negative — OS差異のadapter test欠落**：macOSまたはWindows結果に差異があるのに対応するadapter contract test結果が無い、stale、または別profile／別contractの証拠である入力を与える。差異未検出や差異なしと扱わず、当該profile coverageをunknown／未完にする。domain logic forkが見つかった場合は次の負例どおり不成立とする。
- **Negative — 3 OS positive条件の一部のみ実施**：定義scopeにLinux/macOS/Windows全profileが含まれるHAC-HIL-14a条件で、Linuxのみgreen、残るmacOS/Windowsが未実行または未確認の入力を与える。HAC-HIL-14aを未完とし、1 profileの成功から「3 OSが定義scopeをgreen」を成立させない。
- **Negative — 他profileへの推定**：Linux full結果だけを与えてmacOS/Windowsをgreenとする、あるいはWindows compatibility結果からmacOS portableまたはLinux fullを成立とする入力を与える。証拠のprofile不一致としてcoverageを拒否する。
- **Negative — mapping/evidence drift**：scope/profile選択、tier label、contract/fixture identity、対象revision、environment/run identity、oracleのいずれかを欠落・不一致・staleにする。該当profileだけをunknown／未完として残し、別profileのpassで相殺しない。scope選択の未決・矛盾はscope frame A/B/C/DとD推奨をPOへ返す。oracle不足はHARNESS-L2-005 owner、profile実行・environment・receipt mismatchはHELIXOS-L2-020 ownerへ戻す。unknownや未選択をN/A／passへ変えた入力を拒否する。
- **Negative — domain fork**：共通fixtureの結果差にdomain logic forkを含める。adapter内の差として許容せず、不成立とし、該当scopeのprofile coverageを確定しない。
- **Negative — shellをcore前提化**：WSL、Git Bash、PowerShellのいずれかをcoreの実行前提に置くtier/profile mappingを与える。旧tier条件と不一致として受け入れず、未完として戻す。
- **適用限界と意味差**：本候補はprofile/tierの意味と証拠対応を検査する。どの製品・repository・consumer・段階を対象とするかは選択しない。scopeを3 OS未満に限定する案は旧HAC-HIL-14aの全3 OS positive oracleを満たさず、本候補の局所対応が旧条件の置換・formal successorになることもない。旧HIL-FR-34の個々のpath/process/lock oracle、HAC-HIL-14b/cのadapter failureとonline/offline supply-chain条件、HAT-HIL-14の合成受入は別範囲であり、本候補の合格に含めない。

### HARNESS-L2-065 選択adapter operationの取消・lock failure結果受入候補（未実行）

- **適用scope・入力**：上流で選択されたadapter operation、対象要求/pair revision、operationの子process ownershipまたはstate transaction、failure trigger、scope、実行環境、before state、oracle、run/evidence identityを与える。profile・製品・repository・storage実装・retry値は固定しない。
- **Positive — 正常終了**：processを持つ選択operationが正常終了したとき、そのoperation/run identityに結び付いた結果を返す。state transactionを持つoperationはcontractどおりの全体更新を一つの結果として照合する。個別成功やprofile結果から別scopeを推定しない。
- **Negative — cancel後に子processが残存**：選択operationが所有する子processを稼働中にしてcancelし、少なくとも一つが生きている、終了確認がない、またはprocessとrunの帰属が不明な入力を与える。`cancelled` terminal successを拒否し、`interrupted`／`unknown`と未完義務を保つ。別run、別assignment、親processだけの停止receiptを代用しない。
- **Negative — lock/timeout後の部分state**：sourceのall-or-none meaningを選択したoperationで、operation contractに定めた再試行範囲が尽きた後のlock contentionまたはそのcontractに適用されるtimeout failureを与える。failure oracleの期待はpartial transaction 0である。partial transactionが一つでも観測される、stateを照合できない、またはreceiptがstale/欠落する場合、065のstrict failure-atomicity oracleは不成立であり、operationをAccepted/完了としない。OS/Infrastructureは現行契約に従って失敗・実状態・未完recovery義務を記録する。旧SQLite以外の選択storageにも同じ意味oracleを適用するが、どのstorageにも新規採用を要求しない。operation contractがpartial side effect後の記録/復旧を認める場合、それは現行のfailure/recovery経路に対応しても、このstrict oracleを満たしたとは扱わず、意味差をPO判断材料へ戻す。
- **Negative — 結果の誤結合**：対象revision/scope/operation/runが異なるresult、stale receipt、未実行profileのpass、親のsuccessだけのcancel証拠を与える。対象結果へ流用せず、影響する義務を未完とする。
- **適用外・unknown**：子processまたは複数step transactionを持たないoperationは、適用外理由を対象contractで特定できる場合だけN/Aとする。適用性、操作owner、run/process/state相関、before/after観測がmissing／unknown／stale／conflictならpassにせずunknownを返す。fixture未実行は要求stageの起草・合意を止める新gateにしない。
- **戻し先と責務**：HARNESSは選択operationの意味、期待結果、oracle、証拠の妥当性を受け入れる。実行中processの制御、storage transactionの強制、rollback/resourceは既存Worker・SECURITY・operation/state ownerが担う。実runと再開の記録はHELIXOS-L2-020が担う。oracle不足はHARNESS-L2-005/022へ、実行制約やprocess cleanupはWorker/SECURITY ownerへ、state semantics/recoveryは対象operationのdesign ownerへ、receipt/runの不足はOS ownerへ戻す。いずれも下流で未完義務を保持する。
- **境界**：本受入は旧`LEGACY-ASSET-7B1C7AED3AA401868455`の直接consumer `HST-CASE-014-06` line 126（cancelled時process残存0）と`HST-CASE-014-07` line 127（SQLite lock failure時partial transaction 0）に由来する二つの結果だけを候補化し、親`HIL-FR-34` line 124自体に数値0があるとは扱わない。HAC-HIL-14b全体やHAT-HIL-14の実行を表さない。HST-014-05のroot外symlink write=0は既存SECURITY-L2-007のwrite path/diff/rollback oracleへ対応し、再計上しない。HST-014-04、case/space/Unicode/permission/executable discoveryの各fixture、064の同一profile fixture/domain fork=0、support-tier/3 OS scopeは本候補のsuccessor範囲に含めない。旧fixture/old runtime/test/CIは起動しない。受入oracle自体は未実行である。

### HARNESS-L2-067 source behavior atomizationの受入候補（未実行）

**状態**：HARNESS-L2-067に対応する未採択・未実行の内容oracle案。旧test設計は期待内容の参照に限り、ここで旧test/runtime/CIを実行しない。

- **正常例**：選択scope内のsource snapshot、source digest、read scope、extractor version、およびsource spanが分かるfixtureを与える。1つのfile内に複数の独立behaviorがある場合、各behaviorを別atomとし、guard/input、output/result、識別可能なside effectをそれぞれ根拠spanへ結ぶ。複数atomを持つaggregate parentはparent relationとchild countで示すがparentはcovered behaviorに数えない。file/entry/symbol classificationも分母に数えない。全childが個別atomとして識別され、unclassified/overlap/open-childがない範囲だけをatomic behaviorの観測済み範囲として返す。
- **不成立例**：file単位の一つのsummaryだけで内部複数behaviorを代表させる、parent aggregateをcovered atomとして足す、file件数をbehavior分母へ加える、childの欠落・未分類・重複overlapを隠す、根拠spanのないI/Oやside effectを補う、またはunknownを0件へ丸める場合は当該scopeのcoverage completeを返さない。
- **境界例**：未対応constructまたは静的sourceから識別できないruntime side effectを含むscopeは、その箇所をunsupported/unknownとして明示し、他のatomの個別状態を保つ。未選択file/entry/sourceの存在・不在を推測しない。source digestまたはextractor versionが変化した場合、影響するatomとchild closureをstaleとして再照合対象へ戻す。
- **依存境界**：この受入は027の選択source observationと038の個別capability manifest/closureを前提関係として照合するが、027/038の採択・実行済み状態を仮定しない。041のtemplate-derived obligation atomやOSのdurable source projectionをsource behavior atomと同一視しない。これは文書上の期待oracleであり、旧または現行runtimeの実動作・全sourceの網羅・要求採択を証明しない。

### HARNESS-L2-068 Design Refactor接続前条件の受入候補（未実行）

**状態**：HARNESS-L2-068に対応する未採択・未実行の静的内容oracle案。実変換・rollback実行・CI実施を表さない。

- **正常例 — 重複contract/policy/schema**：同じ選択scope内の二つのdesign nodeが重複候補として与えられる。両方の定義、責務、state invariant、全consumer、before/after oracleを比較して、重複の意味と独立変換単位を個別に記録する。単に関連nodeとして列挙するだけでは比較済みにしない。意味同等で統合可能な候補は独立した共通化等の変換計画へ結べるが、実際の統合や特定storage/layoutは実行しない。
- **正常例 — semantic rename**：名称が異なる二つのsymbolのsemantic signature（入力、出力、副作用、failure、state transition、call graph、consumer contract）が同一であるfixtureでは、意味同等を根拠に同義名の統一候補を示す。変換単位、全consumer、pair/oracle、対象Scope Authority、rollback/recovery basisが揃い、必要pairとoracleが対象revisionへ実際に更新済みの場合だけRefactorへ接続可能とする。
- **拒否例 — lexical-only rename**：名称の類似はあるがsemantic signatureの入力/出力、副作用、failure、state transition、call graphまたはconsumer contractのいずれかが異なるfixtureで、名称類似だけを理由に統一する判断は拒否する。
- **拒否例 — 同名異義**：同じ名称でもsemantic signatureまたは責務が異なる二つのsymbolを一つへ統合する判断は拒否し、別概念として分離候補にする。
- **拒否例 — 接続前条件と意味差分**：consumer欠落、必要pair未更新/stale/欠落、対oracleが更新後設計とrevisionまたは意味上不整合、更新予定の列挙だけ、pairをstaleと印すだけ、または適用可能なrollback根拠を示せない変換を既存Refactorへ接続可能とする場合は不成立またはunknownにする。observable behavior、public surface、DB semanticsまたは要求に意味差があるfixtureはHARNESS-L2-002/003/004の既存Redesign/Retrofit routeへ返し、Refactor内だけで修正を完結させない。
- **authority反例**：pair更新・oracle・rollback根拠が揃っていても、authority根拠が欠ける、別revisionへsupersedeされstaleである、または変換が許可scope外である各fixtureは、それぞれ既存Refactorへ接続しない。既存authority ownerへ不足を返し、新しい人手承認を一律に追加しない。
- **未見例**：依存関係が未選択sourceまたは未読artifactに及ぶ場合、そのconsumer/rollback適用性をunknownとして保持する。未読であることを影響なし・rollback可へ置き換えない。確認済み変換単位の個別結果は未見部分から分離する。
- **限界**：この受入はrollbackを実行する、特定の復旧手順を採択する、毎ticketの人手承認を要求する、または旧test/runtimeを復活させるものではない。候補本文とoracleからL2採択・L3承認・実装/実行許可を生成しない。
- **HARNESS-L2-053との境界**：053の採択pairはasset identity、revision、lineage relation、authority/oracle/typed-edge対応と欠落unknownを扱う。ここではそれらのhistoryを前提に、Design Refactorの独立変換計画、既存Refactor接続前に更新すべき設計pair、および対象scopeへ適用できる回復basisの有無を評価する。053のlineage確認だけでこれらの接続前条件が満たされたとはしない。

### HARNESS-L2-077 source条件からdesign-obligation graphを閉じる受入候補（未採択・未実行）

- **Positive — scope内graph closure**：authorityが選んだ同一scope/revisionについてsource/directive atom、requirement atom、capability/service、domain object、該当するAPI/data/state/event/failure/security/observability/lifecycle/operation/test-oracle/gate relation、適用pair/template契約とL11 oracleを与える。各適用relationから必要なdesign obligationが個別に導かれ、対応oracleへ結ばれる。各選択atomの順方向・逆方向のtyped pathが対応し、11観点の適用性と非適用理由がそれぞれ追跡でき、obligation graph、個別discharge/coverage receipt、未消込findingが同じscope/revisionに揃い、全義務に対応oracleがあれば、その選択scope/revisionだけをcomplete候補とする。
- **Negative — relation欠落・孤児**：列挙経路のnodeまたはtyped edgeを一つずつ欠落させる、端点・型・方向・revisionを不一致にする、またはsource/reverse pathの一方を孤児にする。該当閉包を未完としてpair-freezeを拒否する。
- **Negative — 未消込・placeholder**：未解消のdesign obligationまたはplaceholder nodeを含める。該当義務をcompleteとせず、別atomや観点の成功で埋め合わせない。
- **Negative — 根拠のないN/A・適用性unknown**：観点をN/Aとするが理由・scope根拠がない例、適用性がunknownの観点をN/A/passにした例を与える。どちらも閉包から除外し、pair-freezeを拒否する。unknownはunknownのまま返す。
- **Negative — aggregate一括消込**：一つのsummary/aggregate receiptだけで複数source atomまたは観点の個別義務を消し込む。個別対応の証拠がないatomを未完として残し、pair-freezeを拒否する。
- **受入限界**：旧HIL-FR-42一行の選択条件だけを対象とする静的oracle案で、旧HR-FR-HIL-17全体・全資産・実graph/runtime、要求採択、設計pair実体、実行結果、pair freeze実績を主張しない。旧runtime/test/CIは実行せず、本候補oracleも未実行である。


### HARNESS-L2-078 typed requirement definition・active-scope binding・変更receiptの受入候補（未採択・未実行）

- **Positive — definition fieldsとrevision**：一つの対象scopeのfixtureにactiveな`req-A@rev-1`と`req-B@rev-3`を2件とも明示し、各requirementの13 field群すべてに値・意味型・対象revisionへのtyped edgeを与える。両者についてsource atom、authority/rationale、acceptance oracle、template applicability、design obligationを個別に結び、`req-A`の`capability/service`は「このfixtureの対象scopeではservice/capability適用なし」とする理由・applicability根拠・authority/scope/revision参照を値として保持する。`req-B`にはfixture内の該当service/capability値を結ぶ。2件それぞれでNFR-28の6 bindingがそろい、ambiguity/orphan/staleがない場合に限り、このfixtureで列挙したtarget scopeのactive集合をcompleteとして示す。例のIDや表現は固定schema/enumではない。物理的に単一file/schemaへ格納することは検査しない。
- **Positive — FR-45の6変更操作receipt**：以下の各operationについて別々の対象fixtureを用意し、operation名、前後scope/revision、before/after semantic digest、全入力source atomそれぞれのdisposition、影響downstream範囲とstale/result、既存authority契約に基づくreview authorityが同じ変更に対応している場合だけ、そのoperationを適用済みとして表せる。

  | operation | 対象にする変化の例 |
  |---|---|
  | `split` | 1 requirementを複数の後続requirementへ分ける |
  | `merge` | 複数のsource requirementを1つの後続requirementへ統合する |
  | `rename` | 意味を保ったID/name変更を追跡する |
  | `supersede` | 旧revisionを後続revisionで置換する |
  | `reject` | 対象requirementを却下しsource dispositionを記録する |
  | `N/A` | requirement changeとして非適用を適用する |

  この表はoperationごとに異なる必須証拠を足さず、FR-45が列挙する共通receipt条件を全6種に適用する。field値のservice/capability非該当は`N/A` operationとは別であり、operation receiptを発生させない。
- **Positive — NFR-28の理由付き非該当値**：上の`req-A`では`capability/service` fieldを残したまま、値「このfixtureの対象scopeではservice/capability適用なし」に理由、対象scope/revision、根拠authority/applicabilityを同fieldへtyped relationで結ぶ。NFR-28はこの根拠付き値を許すため、値が非該当という理由だけで6 bindingを落とさず、active集合から`req-A`を除かず、field欠落とも扱わない。この非該当値だけでは要求変更operation `N/A`を実行しない。実際にchange operation `N/A`を選ぶ場合は、上表の全証拠を結ぶ。
- **Negative — field単独欠落・無根拠N/A**：13 field群の各項目を一つずつmissing、unknown、誤revisionまたは不明型にする。欠けた項目を他fieldから推測せず、definitionをcompleteとしない。`capability/service`を取り除く、暗黙にN/Aとする、理由・scope/revision・authority/applicability根拠のいずれかを欠いたN/A値にする入力も拒否する。理由付き非該当値を使って、他の12 fieldやtyped relationを省略してはならない。
- **Negative — NFR-28許容の他fieldへの一般化**：`service/capability`以外の各fieldへ、field固有の明示根拠がない非該当値を個別に与える。13 fieldの各field意味・必要値および関連relationは保持し、その値を正当化済みとしてgreenにしない。仮に別sourceが特定field値の非該当を明示的に認めるfixtureでも、そのfield値・理由・対象scope/revision・authority/applicability根拠を記録し、owner/source/oracle等のrelationを免除しない。
- **Negative — change receiptの各証拠欠落**：6操作それぞれに対し、before digest、after digest、いずれかのsource atom disposition、downstream stale/result、review authorityを個別に欠落・不一致にする。該当operationを適用済みにせず、orphan/stale findingと影響する義務・下流範囲を未完またはunknownとして残す。別操作、別revision、一般のasset lineage evidenceで欠落分を補わない。
- **Negative — active集合の一件除外・subset偽装**：対象scopeのauthority/membershipが`req-A@rev-1`と`req-B@rev-3`をactiveとしているのに、`req-B`を入力から落とす、`req-A`の理由付き非該当値を口実に`req-A`を落とす、別subsetだけを提示してscope全体のcompleteとする、またはmembership資料自体をunknownにする。全target scopeをgreen/completeとせず、欠落・scope不明をunknown／未完として示す。選択した旧source atomが2件という出所件数をtarget active requirementの分母に流用しない。集合外の別機構や全4,020資産をこのfixtureの母集団へ混ぜない。
- **Negative — NFR-28の6 bindingとfinding**：active requirementごとに、source atom、authority、acceptance oracle、capability/serviceまたは理由付き非該当、template applicability、design obligationの各relationについて、missing、unknown、wrong-revision、orphanを一つずつ独立に与える。各ケースでその要件をscope全体結果のgreenから除外せず、ambiguity/orphan/staleを特定してtarget scopeをcompleteにしない。subset評価しかできない場合はsubset結果と範囲を明示し、全scopeを完了としない。
- **Negative — revision/authority/stale不一致**：同じrequirement IDの本文意味を変えながらimmutable revision/digestを据え置く、別scopeのauthorityを参照する、影響downstreamをstaleにしない、または旧receiptを新revisionに流用する。新revisionの扱いを旧authorityで成立させず、現行authority-stateとchange契約に沿って未完として返す。
- **source範囲と意味判断**：今回の候補入力は旧HIL-FR-45 line 135とHIL-NFR-28 IR identity全体。HIL-NFR-28 line 208はIR statementの文言照合用corroborationで、別atomではない。根拠付き非該当値の許容はNFR-28が明示する`service/capability` fieldに限定し、他fieldへ一般化しない。別fieldの明示的な根拠がある場合もfield単位の証拠として区別し、FR-45 line 135に帰属させない。service/capability fieldの理由付き非該当値を認める候補案と、NFR-28の当該条件を未対応で保留する選択肢の両方をPO材料へ記録し、002自身は採択・意味変更を確定しない。
- **受入限界**：NFR-28については明示されたtarget scopeのactive requirement集合のみが分母であり、全4,020旧資産や全機構の母集団は規定しない。source全体のformal successor、他IR/HR条件のclosure、物理DB/schemaの採用、特定record layout、runtime、旧test/CI、PO採択、L3承認、実行受入を主張しない。候補oracleは未実行である。

### HARNESS-L2-072 選択pairのstale revision・異snapshot・deferred結果受入候補（未実行）

**対応要求**：HARNESS-L2-072（HARNESS-CORE unit候補、未採択）。以下は静的な内容oracle案であり、実行結果、採択、L3承認、実装許可を示さない。

- **FR48正常対照**：指定scope/revisionの隣接vertical pairに双方向edgeがあり、edge endpointが評価対象のcurrent semantic revisionへ結び付く入力は、stale findingを返さない。この対照は他のFR48条件全体やpair全体の成立を主張しない。
- **FR48独立負例**：FR48の双方向edge・隣接性・粒度は正常対照と同じまま、片方のedge endpointだけをsuperseded/古いsemantic revisionへ替える。stale revisionを特定し、そのpairを成立/currentとして返さない。旧HST-CASE-031-04（line 304、target digest旧版）と031-07（line 307、semantic revision mismatch）はこの期待のdesign-only参照であり、HIL-NFR-29に属するoracle参照を新しいsource atomへ加算しない。
- **FR49正常対照**：指定scope・対象revision・canonical pair・oracle対応を同一にしたまま、design artifactとverification evidenceが同じ実snapshotを指す入力ではsnapshot mismatchを返さない。この結果だけでpairの他条件や実行済みoracleを推定しない。
- **FR49独立負例**：正常対照からverification evidence側のsnapshot参照だけを別snapshotへ替え、pair、scope、target revision、source authority revision、oracle identity、表示revision labelは同じに保つ。このときsnapshot mismatchを識別し、該当pairをgreen／成立として返さない。revision labelまたはauthority revisionが一致してもsnapshot一致へ読み替えない。旧HST-CASE-032-12（line 320）はこの条件のdesign-only参照である。
- **欠落・不明境界**：比較対象scope/pair/revision、またはdesign/verification snapshot参照のどちらかが欠ける・矛盾する入力は一致と推定せずunknown／未完とし、greenにしない。旧HST-CASE-032-14（line 400）のsnapshot欠落fixtureは補助oracle参照として記録するが、FR49の選択source atomを増やさない。
- **deferred正常対照**：fixture例としてscope `S-A`に個別obligation `obl-A`とoracle `oracle-A`を置き、両側edgeが同じ意味粒度・対象revision `rev-A`・snapshot `snap-A`を指し、oracle結果がcurrent/verifiedとして与えられる場合、deferredであることを理由とする不成立は返さない。この対照はdeferred条件の結果だけを示し、pair成立、coverage、他条件の充足を主張しない。各ラベルは例示値で固定schema/enumではない。この静的fixtureは実行実績を主張しない。
- **deferred個別負例**：上の正常対照のscope `S-A`、`obl-A`、`oracle-A`、両側edge、粒度、`rev-A`/`snap-A`を保ち、pair状態だけを`deferred`にする。仮に他の入力にcurrent/verified相当の結果があっても、該当pairをgreen／complete／実行済みとして返さず、deferred理由を別に示す。`unexecuted`、stale revision、snapshot mismatch、片側欠落をdeferredと同一視しない。deferredかどうか自体がunknownなら、状態を補わずunknown／未完とする。各ラベルはfixture例で固定schema/enumではない。
- **IR identityとpair範囲**：source atom `HIL-NFR-29`（IR `#/HIL-NFR-29`）のstatement全体をr3 receiptに保存する（前回r2は履歴として保持する）。NFR-29各句の条件別対応は、採択済みHARNESS-055-001/056-001のexact selected scope、072で具体化するstale/snapshot/deferred、正式対応未確定に分け、これらのpair条件を同じNFR-29 sourceから採択・正式移管したとは扱わない。
- **証拠の限界と戻し先**：参照した旧HST-CASE-031-04/07、032-12/14、および031-09（line 399）はいずれも`design-defined / not-implemented`で、実行結果ではない。旧HST-CASE-030-15（`archive/legacy-generation-2026-09-14/root/docs/governance/infinity-loop-system-assertion-cases.md:437`、行SHA-256 without LF `1f55a1fc44c9d7c75854486ab470a8f3344bc402366462f9381277f4ae314bec`）もcoverage分母・atomic/bidirectional・同一revision/snapshot・実行済み条件を束ねたdesign-only oracleであり、実行結果ではない。旧target assessment `docs/governance/audits/source-rebaseline/infinity-quality-constraint-crosswalk.md:38`（行SHA-256 without LF `47336d3095c59897e39afe23c0ba385d549cccf09043651aa1c46e3d673ec33e`）はHARNESS／OSの歴史的評価で、現在の移管や採択判断ではない。source/scope/revisionやsnapshotの意味が不明なら該当要求ownerへ戻し、OSの保存・実行状態からHARNESS判定を推測しない。結果内容はFR48/49の選択条件とNFR-29のdeferred条件に限る。NFR-29全source句・formal successor・旧test/runtime/CI、実装、採択、source全体のclosureへ読み替えない。


### HARNESS-L2-079 画面prototype artifactとwalkthrough反復の受入候補（未採択・未実行）

**対応要求・authority**：HARNESS-L2-079（HELIX-HARNESS単体候補、未採択、`authority_effect: none`）。本節は要求本文の静的な受入oracle候補であり、artifactの実生成、walkthrough実行、ユーザー観測、要求反映、候補採択、L3承認または実装を示さない。source atomは旧HIL-FR-18 line 108とHIL-FR-19 line 109の2件に限る。旧CLAUDE.md:84の層対応により、旧L1の要求反映先は現行L2要求へ対応づける。既存012/039/049と003/024+OS Backflowの意味境界はL2-079に記録したとおり維持する。

- **正常 — FR18 executable artifact**：選択された画面scope/revisionのscreen ID、主要操作、遷移、state fixture、仮データ境界と、再生対象の操作経路を与える。実行可能artifactについてmanifest、digest、起動手順、screen／interaction／state traceを同じscope/revisionへ対応づけ、視覚忠実度の評価とは独立に要求発見用の操作経路を再生できることをoracleが確認する。旧consumerに列挙された9状態`empty, loading, loaded, partial, error, permission_denied, offline, conflict, completed`を各意味を保ってfixtureへ含め、いずれの状態も別状態との併合や省略で置き換えない。仮データ境界が追跡できる場合に限り、このartifact部分を候補条件充足とする。 例示入力：選択画面`account-settings`で主要操作「display nameを変更してSave」を行い、その画面・interaction・transitionをartifact traceへ結ぶ。fixture集合には旧consumerの全9名称`empty, loading, loaded, partial, error, permission_denied, offline, conflict, completed`をそれぞれ保持し、仮data境界を示す。これらの識別子・操作・例は説明用で、固定screen ID schemeや各stateの新しい物理定義を定めない。
- **正常 — FR19 walkthrough checkpoint**：FR18 artifactの特定revisionを実際に対象とするユーザーactorとwalkthrough観測、発見要求deltaまたは観測に基づく明示`no_delta`、deltaがあるときの対象要求（旧L1＝要求、現行L2）と現行L2への反映状態、L2要求への既存Backflow関係、再作成判断、bounded iteration policyと現在のcheckpoint・継続／停止／再作成判断を同じscope/revisionの記録として与える。企画（現行L1）の意味変更が生じる場合は既存の人間判断へ残し自動更新しない。各項目が対象artifactと観測に結ばれ、残る義務が明示される場合に限り、その反復記録を候補条件充足とする。数値の反復上限、状態enum、記録schemaはoracleから固定しない。 例示入力：prototype revision `p7`を試した利用者が「Save後に結果が分かりにくい」と観測した場合は、その観測とdeltaを結び、元sourceがいう旧L1要求層＝現行L2への反映先、既存L2 Backflow、再作成して次revisionへ進む判断をcheckpointへ示す。別の観測で新たな要求が見つからない場合は、観測内容を記録したうえで`no_delta`とし、要求変更なし・再作成しない判断と残義務を明示する。`no_delta`を観測なしの代用にしない。revision `p7`や文言は説明例でありschema/enumではない。
- **負例 — FR18欠落・静的代用**：artifactがstatic image/wireframe/proseだけ、起動手順またはmanifest/digestが欠ける、操作経路を再生できない、screen／interaction／state traceまたは仮データ境界が不足する、あるいは9状態のいずれか一つずつ欠落・重複・他状態への併合・誤った対応になる例を個別に与える。該当artifact条件を未完とし、別state、visual score、表示計測結果で代替しない。manifestとartifact digest不一致、起動結果とtrace対象revision不一致も同様に未完とする。
- **負例 — FR19欠落・revision混同**：正例からprototype revision、user actor、user observation、delta／`no_delta`、delta対象の要求（旧L1、現行L2）反映先・状態、再作成判断、bounded policy、またはiteration checkpointの各条件を一つずつ欠落させる。観測なしを`no_delta`と偽る、別prototype revisionの観測を流用する、deltaがあるのに対象要求（旧L1、現行L2）の反映先を欠く、再作成判断と対象artifactを結ばない、残る義務を隠す例はwalkthrough条件を未完とし、要求反映・合意済み・完了として扱わない。bound未提示のまま無制限に反復可能とする例はbounded条件を満たさず未完とする。具体の反復数値はoracleが作らない。
- **未見・unknown**：新しいscreen/interaction/stateまたはdata class、意味未確認のfixture、未確認の操作経路、artifact／traceのscope不一致、観測とdeltaの関係不明、要求反映先不明、再作成判断や残務の行先不明は、既知の状態や`no_delta`へ推測変換せずunknown／未完として返す。9状態の名称と意味を保持したうえで、未見stateを既知stateへ同化しない。
- **依存と受入境界**：対象scope/revision、既存画面適用性判定、要求source、必要なら旧L1要求層に対応する現行L2の対象要求・反映先を依存入力とする。採択HARNESS-L2-003/024とOS Backflowが扱うscope changeのstale/re-entryを再定義せず、その入力の現行性を既存契約で照合する。HARNESS-L2-012のBackflow、039のUI relation、049の表示計測だけでは本候補の不足を閉じない。本候補は採択済み023の分類意味に従うが、その依存意味の参照から079自体の採択を推定しない。本候補のfixtureは未実行であり、旧HAC/HATの設計期待も現行実行証拠ではない。
- **採択済みHARNESS-L2-023の依存4区分**：**常時必須**はsourceと対象要求のscope/revision（旧L1要求層の反映先は現行L2）、画面適用性authority、該当契約とL11 oracleのidentity/owner/契約版または互換range/適用根拠。**特定操作時のみ必須**はprototype生成・操作path replay時のscreen/operation/state/data条件と、walkthrough時のartifact revision/actor/observation/backflow/checkpoint条件。操作条件が明示的に不成立の場合だけ当該操作依存をclosure外にする。**選択入力元に応じて必須**なのは明示選択したscreen資料、requirements/data source、artifact、walkthrough observationのidentity/revision/scopeであり、未選択は未観測、選択source失敗は暗黙fallback不可。**参照資料のみ**は旧物理schema/runtimeと背景資料であり、現行oracleや依存にはしない。各依存にidentity/owner/version-range/conditionを対応づけ、同一入力・revisionで同じ有効closureと理由を再現する。条件unknownをfalseへ変換せず、unknown/staleな必要依存は該当operationを保留する。全source対応表を全operationの必須閉包にしたり、既存の安全/authority依存を参照資料へ落としたりしない。

**旧source・差分・保留**：asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、旧L1 lines 108–109、旧IR `requirements.json#/HIL-FR-18`／`#/HIL-FR-19`。旧consumerとしてL6 `U-SAP-005/006/007/009`、L5 `IT-SAP-005/006/007/008`、旧L5/L6 prototype designとHST-CASE-024-02/03/05/06/07/08を参照した。現Conceptのサービス①はHTML prototype/PoC、現L1-006はprototype適用性・合意/freeze/backflow、採択012はHARNESSのprototypeとBackflowを既に担うため、本候補は所属移管ではなく旧FR18/19の未明示artifact/walkthrough条件の意味再導出としている。旧crosswalkのFR18 `prototype生成機構はOS`、FR19 `L1反映先をL2要求へ是正`という提案は現行責務や採択判断として採用しない。FR19の旧L1要求反映先は現行L2要求へ対応づけ、L2 requirement deltaは既存012のBackflowへ結ぶ。旧crosswalkのtarget assessment `HARNESS／OS・意味変更要`は歴史的な照合情報として保持し、新しい人判断義務にはしない。旧9状態と条件を残し、旧L1が意味する要求反映先を現行L2へ対応づけたうえで、条件をHARNESS要求／L11 oracleの対へ再表現する。旧schema/API/runtime、数値上限、新しい承認者・承認gateは導入しない。旧IR/carry-forwardは`preserved_pending_rehome`のままで、successor・adoption・runtime closureは示さない。旧資料は参照のみで、旧test/runtime/CLI/CIは起動していない。

### HARNESS-L11-080 agent adapter再生成とregistry正本境界の受入候補

この受入候補は、HARNESS registryからのadapter再生成とruntime固有agent memory/rule siloを正本にしない意味だけを静的fixtureで照合する。候補本文・L11・旧HATの設計はruntime実行や受入完了の証拠ではない。

- **採択済み047との接続境界**：decision 57 row 52の採択revision `MPR-RC-HARNESS-L2-047-001`に対応する固定L2/L11の受入意味をfixtureで参照する。HARNESS側はruntime-neutral contractの意味・生成規範と、同一正規化入力/生成規則revisionからの同一意味内容・digest再現を担い、OS側は既存allowlist runtimeへのprojectionとassignment/lifecycle適用を担う。080で adapter の欠落後再生成を検査するとき、contract意味・生成結果のHARNESS正本とOSが扱うruntime projectionを混同せず、projectionの所有をHARNESSへ移したり、047の採択から080を採択済みと扱ったりしない。固定採択047の対象section SHAはL2 `sha256:733201471492a400db194369980f54499faa7f7860e1e1465c18589a43daa9b9`、L11 `sha256:8d92bb157dff9cffd87f72a43c2ce19977667a2fd928b5a3780f1f55912bdcb2`。
- **未採択054との区別**：HARNESS-L2/L11-054は047 contractをOS assignmentへhandoffする候補であり、未採択・未実行である。layer/driveから現行phase等へのmapping、registry全項目の分割、adapter drift/guardの全体閉包を054または080の存在だけで成立済みとしない。旧FR-11/12の未決/未割当境界は監査記録に沿って残し、本fixtureが決定しない。

- **正常 — registry保持・adapter欠落からの再生成**：選択されたregistry source identity/revision/digest、source owner、version range、適用条件、target identity/owner/range、operation、必要なcompatibility宣言を与え、adapterだけを欠落させる。fixtureでは `fixture:HARNESS-registry-A@r1`／owner `fixture:registry-owner-A`／range `fixture:registry-range-A` と `fixture:agent-target-R@v1`／owner `fixture:target-owner-R`／range `fixture:target-range-R` を選び、`fixture:compat-registry-A` と `fixture:compat-target-R` が明示scope Sでの適合を示す。HARNESS registry Aを残してtarget Rのadapterを再生成し、同じ入力のexpected digestと照合する。すべてのfixture値は成功例の入力値であって現行owner/versionを決定しない。
- **正常 — 047の契約再現とOS projectionを分離**：047固定受入fixtureの同一正規化入力と同一生成規則revisionから、HARNESS runtime-neutral contractの意味内容とdigestが再現されることを確認する。そこから選択OS runtime profileへ渡るadapter projectionは別の境界/結果として示し、OSのprojectionをHARNESS contract生成の代替としない。080のregistry-retained/adapter-missing fixtureでは同じ選択registry inputから対象adapter digestを再現する。契約の意味/digestとruntime adapter output digestは別oracleとして照合し、片方の一致で他方を補わない。
- **正常 — registryがruleの正本**：HARNESS registryから生成されたruntime projectionを与え、runtime固有memory/rule siloに同じruleまたは古い/異なるruleがある場合を区別する。candidateが使うruleは選択HARNESS registry sourceへ辿れ、runtime siloを根拠にrule authorityやregen successを成立させない。runtime用projectionや一時copyが存在するだけでは不合格にせず、正本として使われるかを確認する。
- **負例 — registry欠落／source不明**：adapterとregistryの双方が欠落、registry identity/revision/digestまたは選択sourceがunknown、または要求されたregistry sourceを読み取れないfixtureを個別に与える。adapter再生成成功を返さず、runtime-local memory/ruleや残存adapterをregistryの代替正本として使わない。
- **負例 — 同一入力の出力digest不一致**：正常例のregistry・sealed expected digest・全依存入力を保持し、再生成candidateだけを一byte変える。expectedとcandidate digestの不一致を再生成成功とせず、当該adapterのpublish・runtime executionへ進めない。旧 `IT-AGLC-002`（asset `LEGACY-ASSET-3CDF4110625C2E6BA1CC`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L5-harness-agent-lifecycle-integration-test-design.md:36`）の静的oracleとして参照し、旧testは実行しない。
- **負例 — source/revision/target不一致**：expected registry revision/digest・selected adapter targetを固定し、別registry revision、別source、別target由来の出力を一つずつ混ぜる。異なる入力のdigestを同一入力の再現結果として受け入れず、影響する対象をunknown／未完とする。新revisionが存在すること自体は拒否せず、異なるrevisionのまま比較結果を同一入力と偽ることを拒否する。
- **負例 — runtime siloを正本化**：registry sourceを欠落させる、またはregistryと異なるruntime固有memory/ruleだけを正本として与え、その内容からadapterを生成・復元して成功扱いするfixtureを与える。正本境界不成立として再生成成功を拒否する。未登録runtime agentまたは手編集adapterをregistry由来と偽る入力も同じ条件で拒否する。
- **負例 — 047境界の混同**：HARNESSが既存allowlist runtimeへのadapter projection/assignmentを行ったと主張する入力、またはOS projectionだけからHARNESS runtime-neutral contractの意味/生成規範が満たされたと主張する入力を個別に与える。責務境界の取り違えとして不成立にし、採択済み047の意味と080の追加候補範囲を分けて記録する。未採択054のhandoff mappingを選択済みと扱う入力も、handoff未決条件をunknown/未完として返す。
- **依存4区分と個別欠落反例**：採択HARNESS-L2-023の4分類に従い、常時必須＝`fixture:pack-A@v1`（owner `fixture:pack-owner-A`、range `fixture:pack-range-A`、scope SでAを選択、compatibility `fixture:compat-pack-A` が採択済みHARNESS-L2-010 section `9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`と011 section `30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`との対応を宣言）、特定操作時のみ必須＝`fixture:adapter-generator-A@v1`（owner `fixture:generator-owner-A`、range `fixture:generator-range-A`、condition `operation=regenerate`、compatibility `fixture:compat-generator-A`）、選択source依存＝registry Aとtarget R（前項の各identity/owner/range/compatibilityと明示source/target条件）、参照資料のみ＝旧L5/HAT/HAC各pinned asset（owner `fixture:historical-context`、rangeはsource SHA、conditionはlegacy oracleの解釈のみ、compatibilityは`not_applicable_for_execution`）を個別に与える。正常fixtureの必須dependencyは全field値を持ち、実在owner/versionの選択とは分ける。負例では常時必須・operation-specific・selected-source実行依存の各identity、owner、range、分類、適用条件、互換性根拠を一つずつ欠落/unknown/staleにし、該当operationをunknown／未完として再生成成功を拒否する。reference-only資料のowner/version unknownは実行closureの欠落ではなく、単独でoperationを止めない。
- **正常 — 同一入力の依存closure再現**：同じcontract revision、依存identity/owner/version-range/区分/条件、operation/scope/source選択を2回与え、effective dependency closureと各分類理由が一致することを確認する。これはadapter output digestの再現oracleとは別に判定し、一方の一致で他方の欠落を埋めない。
- **未見・unknown**：未選択runtime、未見registry source、target/scope不明、dependency rangeが解釈できない、registry read結果不明、candidate outputとsource provenanceが結べない場合は既知targetや非適用へ推測せずunknown／未完を返す。新しいprovider/runtime、schema、固定値、実装責務を設定しない。
- **適用限界**：旧HST-CASE-006-21のregistry保持＋adapter削除＋同一digest期待は未実行の歴史的受入oracleであり、現行実行結果ではない。旧HR-FR-HIL-08のlease、muster、checkpoint、verify、release、quarantine、retire等の別条件は本候補で閉じない。要求・source holding・owner/target/版の人間判断、採択、L3承認、実装・実行許可は生成しない。

### HARNESS-L11-081 source coverageの全量性と判断traceの受入候補（未採択・未実行）

**対象**：HARNESS-L2-081。選択atomは旧IR requirements.json#/HIL-NFR-12 の一件のみ。L1 line 192は同一移行内容のcorroborationであり別atomではない。親HARNESS-L1-004はf6dad2a33e24f000b87d7f09b8d40288257e74ccで固定されたrevisionにある。version_targetは未指定。source atom、親L1項目、PO選択根拠とA/Bの影響はL2-081本文およびcoverage receiptに記録する。以下は未実行の静的受入oracle候補である。

- **正常例 — 4区分と再現可能closure**：同一入力scope-A@rev-4、source-authority-A@rev-4、coverage operation op-cover-A@r1を二回与え、同じ4分類・有効closure・理由を得る。この正常fixtureではHARNESS source-coverage packの利用とその呼出しを明示的に選択しているため、選択したpack利用に対する010/011契約を照合する。これは全source censusに新たな常時callを課す意味ではない。owner値はすべてfixture用mock値で、現行owner割当ではない。
  - **常時必須（このfixtureで明示的に選択したpack利用の範囲）**：HARNESS-L2-010@f6dad2a33e24f000b87d7f09b8d40288257e74cc（section sha256:9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4、owner=mock-pack-owner、version range=この固定section revisionのみ、compatibility=同じPO固定pair、applicability=常時）と、HARNESS-L2-011@f6dad2a33e24f000b87d7f09b8d40288257e74cc（section sha256:30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952、owner=mock-call-owner、version range=この固定section revisionのみ、compatibility=同じPO固定pair、applicability=常時）を個別に示す。これらはf6固定の契約参照であり、候補081の採択を意味しない。
  - **特定操作時のみ必須**：op-cover-A@r1（owner=mock-coverage-operator、range=r1、compatibility=scope-A@rev-4 manifest、applicability=coverage completeを評価するとき成立）を評価時に加える。別のop-display@r1（owner=mock-display-operator、range=r1、compatibility=表示要求、applicability=表示時だけ）はcoverage評価を選択しないためこの評価closureに入れない。
  - **選択したsourceに応じて必須**：source-A@rev-4（owner=mock-source-owner-A、range=rev-4のみ、compatibility=scope-A@rev-4 manifest、applicability=scope-Aで明示選択）とsource-B@rev-4（owner=mock-source-owner-B、range=rev-4のみ、compatibility=scope-A@rev-4 manifest、applicability=scope-Aで明示選択）を含める。母集団manifestはdocs/a.md#A-1とdocs/b.json#/B-2の二entryを列挙し、各entry locator/digest/同一抽出時点を示す。母集団と列挙集合の一致、および各判断からentryへのpath/entry/digest/抽出時点traceを確認した範囲だけcomplete候補とする。未選択source-C@rev-4（owner=mock-source-owner-C、range=rev-4のみ、compatibility=scope-A manifest、applicability=未選択）は未観測でclosureへ入らずfallbackにも使わない。
  - **参照資料のみ**：旧HR-FR-HIL-09（archive revision=system_contracts.json file sha256:2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab、owner=mock-reference-owner、range=当該archive revision、compatibility=historical consumer context、applicability=参照のみ）、HAC-HIL-09a/b/c（archive revision=acceptance_cases.json sha256:4fabf58db6619ceaa5d0943fd295f5b0ec127be39f245428d203c6a3b366ae19、owner=mock-reference-owner、range=当該archive revision、compatibility=historical consumer context、applicability=参照のみ）、HAT-HIL-09（archive revision=system_tests.json sha256:7ff2a798c120f7622d77dff2aba83992c03fb5a40cfa3b491572b4e8558c191a、owner=mock-reference-owner、range=当該archive revision、compatibility=historical consumer context、applicability=参照のみ）を背景欄へ置く。これらを実行依存や実行証拠にしない。参照欄のmetadata不足は参照状態をunknownにするだけで、常時必須・成立した操作・選択sourceのexecution closureを止めない。
- **欄ごとの独立負例 — 各分類**：四分類それぞれについてidentity、owner、version range、compatibility basis、applicability conditionの一項目だけを欠落、unknown、または矛盾させた入力を個別に与える。常時必須・条件成立した操作・選択sourceのいずれかなら、その依存のclosureをunknown／未完とし欠落値を別行から推定しない。参照のみ欄の各同じ変異はその参照metadata状態のみunknownにしexecution closureを停止しない。分類が不明な入力は分類自体をunknownのまま残す。
- **010/011の独立負例**：正常入力からHARNESS-L2-010の固定revisionだけを欠落・差替えした例と、HARNESS-L2-011だけを欠落・差替えした例を別々に与える。該当契約をunknown／不整合にしcoverage closureをcompleteとしない。似た名前、candidate metadata、参照資料から補完しない。
- **HELIXOS-L2-123との責務境界fixture**：同じ旧HR-FR-HIL-09／HAC-HIL-09a/b/c／HAT-HIL-09をcontextに持つ二つの独立fixtureを扱う。NFR-12 fixtureでは宣言済みmock source scope、全path／entry、各判断のpath／entry・digest・抽出時点traceから081 oracleを評価する。別のBR-14 fixtureでは、OS-123候補の対象であるZIP・exact 2 repository・authority receipt・receipt由来分母・BR-14 atom dispositionを評価する。現在の比較時点で両候補は未採択であり、一方の採択・依存・source owner割当を他方へ自動生成しない。
  - **同一evidenceを再利用できる正常例**：選択した二つのscopeに同一source entry `fixture-source-A@rev-7#entry-3` が含まれ、そのentry locator、revision、digest `sha256:fixture-entry-3`、抽出時点 `fixture-time-T` が実値で一致する。entry evidenceは共有するが、081はNFR-12の宣言scope全体・entry全量性・判断traceを評価し、123はBR-14固有のauthority receipt・分母・atom dispositionからGateまでを評価する。共有entry一件でいずれかの残る条件を代替しない。候補の登録行、採否、source ownerはこのfixtureから生成しない。
  - **個別反例**：(1) BR-14用123 receiptがauthority receipt／分母だけを示し、NFR-12の該当entryのlocator／revision／digest／抽出時点との一致を立証せず、かつNFR-12 scope内の他entryも欠く。081はcoverageをunknown／未完とする。(2) 123候補の登録行、同一consumer ID、source宣言、read-complete表示だけをNFR-12のentry/digest/extraction-time証拠として提示する。081はcompleteとしない。(3) 081だけを採択した状態でBR-14のauthority receipt／ref・entry・edge分母がない場合、123側のBR-14閉包を成立させない。(4) 123だけを採択した状態でNFR-12の全量列挙または判断traceが欠ける場合、081 oracleを成立させない。両方の条件が適用されるoperationではそれぞれのoracleを個別に満たし、候補の採否は他方へ波及させない。
- **全量性と判断traceの負例**：文書名だけ、代表entryだけ、検索結果0件だけ、単一包括requirementだけを各々単独で完全性証拠として提示してもcompleteにしない。正常入力からpath、entry locator、digest、抽出時点、source snapshot/revisionを一項目ずつ欠落または不一致にした場合、当該判断のtraceだけをunknown／未完にし他判断の成功で相殺しない。
- **PO判断と影響**：根拠は旧IR HIL-NFR-12のsource意味、旧crosswalk docs/governance/audits/source-rebaseline/infinity-quality-constraint-crosswalk.md:21の歴史的OS target assessment、および9/28 PO決定記録docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:18（記録commit 03b1969b26a30e9e2b68149bff2e10c5bfe78110、file SHA-256 c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23）。判断対象revision f6dad2a33e24f000b87d7f09b8d40288257e74ccに固定したL1・対L2/L11合意と明示候補採択の記録である。選択肢A（推奨）は採択時にHARNESS-L1-004への意味接続を明示し、HARNESS-L2/L11-081をHARNESSの全量性・判断trace oracle候補として配置する。選択肢Bは同じsource意味を弱めず、target/successorを未割当のまま保持し、081両pairを未採択で残す。A/Bの具体差はHIL-NFR-12の意味oracleをHARNESS-L1-004に配置するかholdingのままにするかであり、source取得/event/保存の既存責務を移すか否かではない。どちらもHIL-NFR-12、HARNESS-L1-004とのrelation、HARNESS-L2/L11-081の採否状態に関わり、HARNESS-L2-010/011/023やOS acquisition/event contractの固定済み範囲を変更しない。候補の起草・独立reviewは判断待ちで停止しない。新たな承認手続きや実owner選択をfixtureから作らない。
- **限界**：候補oracleは未実行。固定件数、all-repository/反復走査、digest/timeの物理schema、source acquisition実装、PO採択、L3承認、全source closureを主張しない。旧test/runtime/CLI/CIは実行しない。

### HARNESS-L11-082 選択source scope全child receiptのstale化受入候補

本節は旧HIL-NFR-22の選択source scope全体を対象とするstale化意味についての未採択・未実行oracle候補である。旧HIL-FR-37由来のHARNESS-L2-067-001候補を採択済みと扱わず、候補本文、fixture、旧HAC/HATも現行の実行結果ではない。

- **旧条件と受入範囲**：選択source scopeのcoverage denominatorはatomic behavior childである。aggregate parent、directory/file件数、代表fixtureはcovered child件数に含めない。この分母・atomization条件はHARNESS-L2-038の採択範囲とHARNESS-L2-067-001の未採択候補を分けて参照する。082が個別に照合する残差は、選択scope内のsource diffまたはextractor revision changeが起きた時に、そのscopeに属する全prior child receiptをstaleにする条件である。
- **正常例 — source差分**：入力fixtureとしてsource `fixture:source-A@revision-r1/digest-d1`、明示scope `fixture:scope-S`、extractor `fixture:extractor-E@revision-e1`、および同scopeのatomic child `c1`, `c2`, `c3`に対応するprior receipt `receipt-c1`, `receipt-c2`, `receipt-c3`を与える。source Aの選択範囲内でc1の根拠spanにsource差分があるrevision r2/digest d2を与えるとき、3件すべてをstaleとして返し、変更箇所に直接触れないc2/c3のprior receiptもcurrent coverageへ再利用しない。 c2のreceiptが同じ選択scope／prior child集合に属し、c1とは別の過去runで取得されていてもstaleにする。run identity差だけでc2を対象外としてcurrentに残す独立反例は不合格とする。改訂sourceに対する新しいchild照合が終わるまで、scope Sのcoverage completeを返さない。fixture識別子とchild数は説明用で、schema、固定数値、実在sourceのowner/scopeを定義しない。
- **正常例 — extractor変更**：source A、scope S、prior receipts c1/c2/c3を同一に保ち、extractor revisionだけをe1からe2へ変える。変更がsource textへ影響したchildの有無にかかわらず、scope Sの全prior child receiptをstaleとして扱い、新revisionで再照合されるまでcurrent evidenceに数えない。正常例は全scopeの無効化条件を示すだけで、特定parserや実装方式を要求しない。
- **独立負例 — source差分後のsubset再利用**：正常source差分例でc1だけをstaleとし、c2/c3のprior receiptをcurrent／coveredとして残す入力を与える。選択scope全体のstale化を満たさず、coverage completeを拒否する。parent、別scope、別childの成功receiptで補わない。
- **独立負例 — extractor変更後のsubset再利用**：extractor e1→e2の例で、extractorの影響を受けたと主張するchildだけをstaleとし、同じscopeの残りprior child receiptをcurrent／coveredとして残す。全prior receiptのstale化条件を満たさず、scope Sのcoverage completeを拒否する。変更の影響範囲を計算できたことを全scope条件の代替にしない。
- **独立負例 — 集約・代表fixtureでの代用**：aggregate parent一件、directory/file数、代表fixture一件をchildのcoverage denominatorまたはcovered件数へ含める。atom単位の分母条件に反するため、該当scopeをcompleteとしない。これはsource diff後の全receipt stale条件とは別の条件として評価する。
- **欠落・unknown・未見**：source identity/revision/digest、scope、extractor revision、prior child集合またはそれらのscope relationのいずれかがmissing／unknown／staleなら、全receiptがcurrentと推測せずunknown／未完として残す。未見source constructまたは未見childは既知childへ併合せず、scopeの母数・影響を不明のまま示す。未選択sourceは未観測であり、別sourceへ暗黙fallbackしない。選択scope外のreceiptはこの条件の全体集合へ追加しない。
- **依存4区分と具体fixture**：採択HARNESS-L2-023の4分類を使う。固定decision row 52の選択L2/L11 section SHAはそれぞれ`32ad44e70357315304c5da5ce012f7ba4b9956e27a699f21ecddea1c54eeaf03`／`f505c8e6a2887ac0cf757a78de6617f9a9ee3f9e36084fee70b8a11915815a47`。HARNESS-L2-010／011の選択L2 section SHAは`9fbd159e2b1cbf31ef16913e29b33417ab2f247e2c0f0328268f2c9f67e2d6b4`／`30eb7f1ebc78889dc640155aa09811c7a6bcc2938bb4e34f122f245442c97952`。両者の固定L11 sourceはdecision対象revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の`product-acceptance.md` SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`（010/011の受入行205–206）。ここでは依存4区分と010/011の選択call適用条件だけを受入入力に使い、これらの契約を変更しない。
  - **常時必須**fixture：pack identity `fixture:coverage-pack-A@r1`、owner `fixture:pack-owner-A`、契約revision `fixture:coverage-pack-contract-A@r1`、適合range `r1`だけ（このfixtureに対する完全一致range）、class `always_required`、適用条件 `scope=S AND pack-A is selected`。`fixture:compat-pack-A@r1`の内容は、pack identity/owner/revision/range、入力source契約、operation、scope、dependency宣言、選択callの契約境界を列挙し、HARNESS-L2-010 exact section revisionに照合した結果`compatible`を示す。
  - **特定操作時のみ必須**fixture：recheck operation identity `fixture:coverage-recheck-A@r1`、owner `fixture:recheck-owner-A`、契約revision `fixture:coverage-recheck-contract-A@r1`、適合range `r1`だけ、class `operation_specific`、適用条件 `operation=recheck-selected-scope AND (selected-source-diff OR extractor-revision-change)`。`fixture:compat-recheck-A@r1`はpack A、scope S、選択source revision/digest、extractor identity/revision、child-receipt collection、operation identity/revisionを明示し、010のpack契約と011の選択call契約に対するfield別適合結果を持つ。条件が明示的にfalseならoperation-specific依存は実行closure外、条件unknownならfalseとせず該当操作を保留する。
  - **選択した入力元に応じて必須**fixture：source `fixture:source-A@r1/d1`、owner `fixture:source-owner-A`、契約revision `fixture:source-contract-A@r1`、適合range `r1`だけ、class `selected_source`、適用条件 `source-A is explicitly selected for scope-S`。child receipt collection `fixture:child-receipts-S@r1`はowner `fixture:receipt-owner-S`、契約revision `fixture:child-receipt-contract-S@r1`、適合range `r1`だけでscope Sのc1/c2/c3 receipt集合を識別し、source A・scope S・HARNESS-L2-010/011のselected-call fixtureへの互換根拠を`fixture:compat-source-A@r1`に記録する。
  - **参照資料のみ**fixture：旧IR asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`（`requirements.json` SHA `80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`）および同文corroborationの旧L1 asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` line 202（file SHA `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line SHA `a3883ab55532a3fabeb2f58620d243502ff339761c05b8aa6e8dd1d8f2ed5278`）。owner `fixture:historical-context`、契約revision/rangeは各固定source digest、class `reference_only`、適用条件 `interpret the legacy condition only`、compatibility `not_applicable_for_execution`。reference-onlyはexecution closureに入れない。
  - 上記`fixture:*`のowner/revision/range/compatibility値は受入例のmock valuesであり、現行owner・provider・version選択ではない。`r1`はfixture内のexact range例で、製品versionやschemaを定めない。実在owner、scope、適用versionは未指定のまま保持する。
  - **compatibility証拠の内容**：pack/call/source compatibility recordは、(a)依存identityとowner、(b)契約revisionとそのexact range、(c)classとapplicability、(d)source identity/revision/digestとscope、(e)operation/call identity、(f)互換性を判断した対象契約revision・fieldごとの照合結果・判定理由を持ち、同一scope/callの値を一組として結ぶ。pack側はL2-010、選択call側はL2-011の上記exact selected revisionsへそれぞれ照合する。fixture record内の文字列`compatible`だけで適合根拠を代用しない。
- **dependency欄別の独立負例**：execution closureへ入る各classについて、正常例から値を一つずつ欠落またはunknownにしたfixtureを使う。常時必須、operation-specific、selected-sourceの各classで、(1)dependency identity、(2)owner、(3)契約revision、(4)適合range、(5)class、(6)applicability条件、(7)compatibility evidenceまたはその対象revisionの各欄を個別に欠落／不一致／staleにし、該当operationをunknown／未完として保留する。各classの一欄の値を他欄や別classから推測しない。
- **010/011の独立適合負例**：他の全入力を固定したまま、pack側compatibility proofからHARNESS-L2-010 exact selected revisionの照合結果だけを削除またはstaleにした場合は、pack契約適合を示せないため保留する。別fixtureでcall側proofからHARNESS-L2-011 exact selected revisionの選択call照合結果だけを削除またはstaleにした場合も、call適合を示せず保留する。片方の適合で他方の欠落を補わない。
- **reference-onlyの個別unknown例**：reference-only分類と「legacy解釈のみ」のapplicabilityが判別できている一方、そのowner、version/range、またはexecution compatibility metadataがunknown/missingでも、旧資料はexecution closureに入らず、他の必須dependencyが充足する限りoperationを止めない。reference-onlyかnormative execution dependencyかのclass/applicability自体がunknownなら、これをreference-onlyと推測せず該当operationをunknown／未完とする。
- **同一入力closure再現**：同じ要求scope、source/provider selection、契約revision、各dependency identity/owner/version-range/class/condition/compatibilityを2回与え、同一の有効dependency closureと各分類理由を再現する。closure再現は、source/extractor変更後に全child receiptをstale化するoracleとは別条件であり、一方の成功で他方を補わない。
- **採択・意味境界**：このfixtureは未実行であり、旧HAT-HIL-09の設計定義を実行結果へ読み替えない。candidate 067-001、HARNESS-L2-038、または依存HARNESS-L2-010/011/023の存在は082を採択しない。source file全体の正式successor、旧要求全体のclosure、実装・実行・release許可を主張しない。
