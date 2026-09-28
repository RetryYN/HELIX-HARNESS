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

### HARNESS-L2-042 Design Refactor判定とepisode分離の受入候補

**対応要求**：`HARNESS-L2-042`（⑤のunit候補、`version_target: 1.0`、未採択）。親は`HARNESS-L1-003/004/005/007`。本節の例は未実行の内容oracleであり、文書の存在で候補採択・実装・利用者受入を生成しない。Performance Refactorの条件は採択済み`HARNESS-L2-016`と対L11に従う。

**正常例**：同じ対象revision・scopeの二つの改善対象について、名称だけでなくsemantic similarity、影響するconsumer、既存oracle、依存graphを照合し、各条件の根拠からDesign Refactorの可否と理由を返す。変更前後の対象scopeの振る舞い・契約・要求が維持されることを016のoracleで確認する。機能追加があれば別episodeへ分け、Design／Performance Refactorの当該episodeへ混ぜない。Performance Refactorを選ぶ場合は016の事前固定と実測比較の受入を別途満たす。

**誤りを含む例**：名称が似るだけで統合する例に加え、semantic similarityの根拠、関連consumer、oracle、依存graphのうち一つだけを欠く例を各々投入し、根拠不足を個別に不成立または未評価とする。機能追加をDesign RefactorまたはPerformance Refactorと同一episodeへ入れる例も拒否する。公開契約・要求・永続状態の意味が変わる例をRefactor成功として受け入れず、該当する左の層へBackflowする。性能の測定不能・回帰は016の対L11で拒否し、本節の成功で相殺しない。

**未見例**：未公開の同scope consumerまたは依存関係を含む変更候補を与え、固定された契約とoracleに照らしてDesign Refactorの根拠を照合する。consumer、oracle、依存graphまたは対象revisionを特定できない範囲はunknown／未評価に残す。判定の成功を別scope・別revision、機能追加、下流の実行結果へ外挿しない。

**戻し先**：意味判定・consumer・graphの不足はsource／設計／契約ownerへ、対設計の欠落は`HARNESS-L2-019`へ、要求または契約の意味変更は`HARNESS-L2-003/004/016`のBackflow先へ戻す。実行・ticket・CIの成否は該当OSまたは利用者の運転契約で扱う。

### HARNESS-L2-043 active templateのrule／branch別例coverage

**対応要求**：HARNESS-L2-043（HARNESS-CORE unit候補、`version_target: 1.0`、未採択）。親L1はHARNESS-L1-001/004/009。043は例coverage契約を定め、template選択・適用はL2-009、active templateの要素抽出は041、設計unit/compositeと対oracleは026/025へ分ける。旧sourceはHIL-FR-55、`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:145`（line SHA-256 `78a2e6c819e73153ce2bbd832c0f87777dba08750fa1b84fcafc916fa7cafa30`）。

**正常例**：選択されたactive template revisionと適用scopeの全validation rule／applicability branchを分母として確定する。各rule／branchにcanonical positive例と境界negative例を最低1件ずつ対応付け、例ごとに適用条件、期待する受理／拒否、oracle、source spanを照合する。状態遷移、failure、security、migration、multi-runtime差異については対象risk分析で未被覆と特定された場合だけ追加例と理由を示す。例の数ではなく、適用rule／branchと該当riskが内容上検査されたかを判定する。

**誤りを含む例**：いずれかの適用rule／branchについてpositiveまたは境界negativeを欠く、positive例がrule条件を満たさない、negative例が境界条件を試さない、期待結果とoracleが結び付かない、適用branchを飛ばす、または例数だけで十分とする入力は不合格または未評価とする。risk分析で未被覆とされた領域に追加例がない場合もcoverage未完とする。TBD・unknown・適用性不明を推測で埋めない。

**未見例**：作成側に伏せたactive template revisionまたは新しいapplicability branchを与え、対象rule／branchの分母を更新し、positive／boundary-negative例とoracleへの対応を照合する。新revisionやrisk根拠が欠落・矛盾・staleの場合は十分性を主張せずunknown／未評価にする。結果を未選択template、別scope、別revisionへ外挿しない。

**戻し先と境界**：templateのactive版・適用条件不足はHARNESS-L2-009/対象template owner、rule／branch抽出の不足はHARNESS-L2-041相当の契約owner、oracle・検証義務・risk根拠の不足はHARNESS-L2-004/該当ownerへ戻す。例のcoverage結果は要求合意、設計成立、L3承認、候補採択、実装、OS実行または利用者受入を生成しない。旧schemaやruntime固有形式を受入条件にしない。
