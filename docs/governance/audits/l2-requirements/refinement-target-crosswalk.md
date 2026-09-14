# 追補契約の対象別照合

指定JSONの[refinement shard](../../../../archive/legacy-generation-2026-09-14/root/requirements-ir/refinement_contracts.json)の14契約を対象別整理へ接続する。
本表は契約・ID・状態と責務の照合であり、全本文・受入条件の再検証やJSON意味変更を完了した証拠ではない。

照合時SHA-256：`6230d6c0ae341ea45eba1e9bf1d40389363b9f1f12c158e5b5c15799122e1443`。

| 契約ID | revision／状態 | 要求ID数／受入ID数 | 対象・確認する範囲 |
|---|---|---|---|
| MIC-FR-001 | 1／specified | 7／12 | OS：HELIXOS-L2-002／004／008。PM割当、TL統合、セル・排他・capacity・投影 |
| CNW-FR-001 | 2／specified | 8／13 | OS：HELIXOS-L2-004／009。native worker、model／effort、hookとassignment。固定モデル指定は採用revisionに限定 |
| DIST-LITE-FR-001 | 2／specified | 5／9 | HARNESS-L2-006の提供条件とHELIXOS-L2-006の配布運用へ分離。DevOS配布先の意味宣言と実cutoverを区別 |
| SYN-FR-001 | 1／specified | 10／14 | OS：HELIXOS-L2-002／003／005。部分合成・観測・失効・候補昇格。HARNESSの工程条件は参照して適用 |
| OPS-FR-001 | 1／specified | 19／21 | OS：HELIXOS-L2-006／007／009。環境・配備・運用・保守・診断。提供artifact成立条件はHARNESS-L2-006 |
| RLO-FR-001 | 1／specified | 4／4 | OS：HELIXOS-L2-004／009。追加FR-037..040だけの収載であり、常駐レーン全体を移管済みにしない |
| 3L-FR-001 | 1／frozen | 3／3 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-002 | 1／frozen | 3／3 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-003 | 1／frozen | 3／4 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-004 | 1／frozen | 2／2 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-005 | 1／frozen | 6／6 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-006 | 1／frozen | 3／3 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-007 | 1／frozen | 3／4 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |
| 3L-FR-008 | 1／frozen | 2／2 | OS：HELIXOS-L2-004／007／008／009。三社レーンの役割・予算・割当・検証・運用。frozenは当該契約の状態であり、OS全体やL11受入の完了ではない |

3Lの8契約にはapprovalがあり、それ以外の6契約はapproval=nullである。後者を未承認の全機能と断定せず、
文書側の採用revisionとの照合が必要な状態とする。GitHubのclose状況で補わない。
OPSの集約FR本文には詳細Rが内包されるため、集約IDと詳細IDの数を独立した原子要求数として合算しない。

## 追補から見える境界

- DIST-LITEのsource authorityはdevelopment repositoryであり、配布repositoryの名前や公開状態を要求正本にしない。旧ルール文書との配布先名の差は別途整合が必要。
- CNWのSol／Lunaや3Lの固定lane・WIP・観測日数は、特定運用契約の条件である。HARNESSの利用先へ固定モデル・三社構成を強制しない。
- 3L-R-25の「Issue正本」はPhase Aのassignment／作業範囲の参照として読む。要求の意味・採否をIssue本文へ移す根拠にしない。
- SYNの合成とOPSの運用が、HARNESSの規則・提供物を変更する場合は対象要求へ戻す。OS内部の実行成功からHARNESS／Webの提供完了を推定しない。

各契約の原文参照・digest・承認・受入IDはJSONに保持される。本表へ本文を重複保持せず、指定JSONから再取得する。
