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
