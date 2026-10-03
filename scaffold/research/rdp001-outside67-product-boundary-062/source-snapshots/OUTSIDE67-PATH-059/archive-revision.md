# HARNESS・HELIX-OS・個別プロダクトの責務決定

本書は2026-09-14の本作業会話でPOが明示した、要求対象と責務の決定を記録する。
要求整理ではこの決定を旧文書の混在表現より優先する。個別L2要求案の一括承認、L3凍結、IR admission、
実装・受入・公開の完了を記録する文書ではない。

## 明示された決定

| POの発言 | 固定する関係 |
|---|---|
| 「要求を整理してそれを正しく分離するのが正解な。何に対する要求なのかを。これはフォルダ管理的に分離したほうがいい。」 | 要求は対象別のフォルダに分離し、管理機構と個別プロダクトの機能を混在させない |
| 「Oじゃなくて、OSな。」 | 管理・統制機構の名称はHELIX-OS |
| 「OSは管理、統制、Worker、学習、ログ、CIとかだな。HARNESSはVモデルとかの話になるんじゃないかな？」 | OSは実行・管理・改善、HARNESSは提供する開発工程の仕組みを担う |
| 「プロダクトとして輸出するのはHARNESSのほうね。HELIX-OSはそれらの管理統制をしてHELIXを改善し続ける機構な。」 | HARNESSを外部提供する。OSはHELIXプロジェクト群を統制し、継続改善する |
| 「Vision2のHELIX-WebはHELIX-OSが管理すると考えればわかるだろ？」 | WebはOSが管理する個別プロダクト。Web固有要求はWeb側に置く |
| 「HELIX-Webの展開要件がHELIX-HARNESS製品群の完成が必須になるってこと。だからバージョン1で切ってるわけな。」 | Version 1はHARNESS製品群の完成境界。Web自体をVersion 1へ含めず、その完成をWeb展開の必須前提にする |
| 「検証フェーズでいくつかのプロダクトを作ってみてWeb展開だから自己プロジェクトへの適応が入ると思ってくれ。」 | Version 1完成前に複数プロダクトを実開発し、HELIX自身のプロジェクトへの適用も検証する。その実証後にWebを展開する |
| 「HELIX-Webの展開時はHELIX-OSの外にHELIX-Web-OSを作る感じだな。」 | Webのservice runtimeは独立したHELIX-Web-OSが担う。HELIX-OSはその開発・改善projectを統制する |
| 「Web-OSからのログをHELIX-OSが吸収してサービスを改善していくから最終的に接続される。」 | Web-OSは許可されたservice log・telemetryをHELIX-OSへ連携し、HELIX-OSが改善候補へ統合する。運転authorityは分離したまま改善loopで接続する |

## 対象別の正規入口

| 対象 | 所有する要求 | ローカル入口 |
|---|---|---|
| HARNESS | Vモデル、工程、要求・設計・検証の対応、進行・完了条件、外部提供物の成立条件 | [HARNESS](../design/harness/README.md) |
| HELIX-OS | プロジェクト群の管理・統制、Worker、CI、ログ、学習、継続・復旧、HELIXの改善循環 | [HELIX-OS](../design/helix-os/README.md) |
| HELIX-Web | Connector型AI開発SaaSとしてWeb利用者が受け取るダッシュボード、サービス、操作体験 | [HELIX-Web](../design/helix-web/README.md) |
| HELIX-Web-OS | Web展開先のtenant・Connector・job・service state・配備・監視・復旧 | [HELIX-Web-OS](../design/helix-web-os/README.md) |

要求対象の一覧はこの三つで閉じない。別プロダクトが加わるときも、固有要求はその対象に置き、OSの管理対象として接続する。
HARNESS自身もOSが管理する開発対象である。HARNESSの工程規則をOSが適用し、OSの運用から得た改善を
HARNESS自身の要求・設計・実装・検証へ戻す。HELIX-OSはこの自己適用・改善loopを継続運転し、HARNESSを
改善し続ける責務を持つ。管理対象と規則の参照関係を、同一の要求所有へ潰さない。

## 上位Conceptへの正規投影

上位概念では、HELIXを一つの配布製品名として扱わず、HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS等を含む
プロジェクト群の総称として扱う。

| 上位identity | 意味 | 所有するConcept |
|---|---|---|
| HELIX | プロジェクト群と、その改善を継続する全体構想 | 人間の意図から検証済み変更へ閉じ、運用結果を次の要求へ戻す |
| HARNESS | 外部へ提供する開発基盤 | V-model、層、pair、工程、要求・設計・検証契約、進行・完了条件、consumer package |
| HELIX-OS | HELIXプロジェクト群の内部管理・統制機構 | authority管理、Worker、実行制御、CI、ログ、状態、学習、改善、配布運転 |
| HELIX-Web | HELIX-OSが管理する個別製品 | Connector型AI開発SaaSとしてWeb利用者へダッシュボード、操作、進行表示、サービス体験を提供する |
| HELIX-Web-OS | HELIX-OS外のWebサービス運転基盤 | tenant、Connector、job、service state、evidence projection、配備・監視・復旧 |

HARNESSをHELIX-OSの内部Kernelだけに縮退させない。HELIX-OSはHARNESSを利用・管理するが、
HARNESSの工程意味を所有する別正本を作らない。HARNESSのartifact内容とconsumer利用条件はHARNESS、
artifactの生成、配布、promotion、rollback、監視の実行統制はHELIX-OSが担う。

HELIX-OSによる「管理」は、HELIX-Web-OSのservice runtimeを内包する意味ではない。HELIX-OSはWebとWeb-OSの
要求・開発・検証・release準備・改善proposalをHELIX projectとして統制し、Web-OSは展開後の利用者向けserviceを
独立したauthority、state、credential、writerで運転する。

両OSは改善loopで接続する。HELIX-Web-OSがservice log、telemetry、incident、利用結果を許可された目的・scopeで
HELIX-OSへexportし、HELIX-OSがHARNESS自身の実践を含む他projectの証拠と突合して改善候補を重複排除・評価する。
採択された候補だけをHARNESS、Web、Web-OS等の対象要求・設計・検証へ戻す。credential、tenant原data、
同意範囲外logの吸収や、logからの直接変更は行わない。

## 既存Conceptとの意味差分

[Concept v4.0候補](../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/helix-concept-v4.0.md)の承認対象本文はbytesを保持するが、製品identityは
本決定より前の区分を含む。その差分は[Concept v4.1候補](candidates/helix-concept-v4.1.md)へ投影済みである。
v4.0の承認を流用せず、v4.1の人間承認後に次の境界を同じrevisionで固定する。

| v4候補の表現 | 最新Conceptへの投影 |
|---|---|
| `HELIX Harness`を`Assurance Kernel`とする | Assurance KernelはHARNESSの構成要素。HARNESS全体は外部提供する工程・契約・consumer packageを含む |
| `HELIX Control Plane` | HELIX-OSの実行統制componentとして扱い、独立した要求対象にしない |
| `HELIX DevOS` | 独立した提供製品identityにしない。配布物はHARNESS、配布運転はHELIX-OSへ分ける |
| Control／Execution／Ledger／Adaptation Plane | HELIX-OSの管理・統制・Worker・ログ・学習・改善責務へ接続する |
| Change Contract Compiler／Assurance Kernel | HARNESSが提供する工程・契約・検証能力と、OSが行うcanonical transactionを分ける |

現行L0 charterのP0–P9も同様に対象別へ投影する。V-model、工程、検証、外部利用条件はHARNESSへ、
連続走行、orchestration、GitHub／CI運転、memory／状態、学習、外部実行統制はHELIX-OSへ置く。
「harness memoryを根幹に自己保守する」という旧表現は、HARNESS製品がmemoryを必須内包する意味に使わず、
HELIX-OSが要求正本・状態・証拠を分離して管理し改善する責務へ置き換える。

この投影はConcept v4候補の承認対象を遡及改変せず、候補のcanonical promotion、L1再編、L2合意、L3凍結を
完了させない。次revisionでは本表を親に、対象別L1／L2と対検証へ一方向に導出する。

## 文書整備で守ること

- 上位概念を本決定に対応づけ、L2要求とL11受入、L3要件とL10総合検証を対象別に接続する。現行L1–L12と正規pairは維持する。
- 要求意味の正本は指定されたローカル文書・JSONと、その採否・合意revisionである。GitHubは作業管理の接続先であり、Issue closeから要求削除・充足を生成しない。
- 旧Concept・旧物理path・旧名称を理由に、OSの内部運用をHARNESSの必須提供構成に戻さない。参照するHARNESS版と適用対象を記録する。
- 候補承認、対象別L2合意、L3凍結、IR移管、実装、利用者受入は別状態として保持する。旧候補の承認を新しい具体化の承認へ流用しない。
- remote branchへの同期、独立した上流意味review、人間の採否、PR／CIによる下流検証を別operationにする。旧CIを通すことを上流整理の成立条件にしない。
- 旧資料の削除前に、条件の移管先、不採用理由、未判断、参照影響を確認する。名称変更だけで意味の移管が終わったことにしない。

既存CLI・runtime state・配布repositoryの切替は、本決定の記録で実施済み・認可済みとはしない。
現在の移管状況と未整備項目は[要求監査入口](../design/helix/L2-requirements/README.md)で追跡する。
[上流再整備と既存資産統制方針](upstream-rebaseline-and-asset-governance-policy-2026-09-14.md)は、
本決定を変更受付、上流再導出、自動走行、既存資産移行・退役へ適用する管理体制を定める。
