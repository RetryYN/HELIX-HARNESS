# HELIX-CONNECT L3 業務要件（Stage 1・Stage 2a・Stage 4・Stage 5 部分草稿）

> 状態: Stage 1、Stage 2a、Stage 4、Stage 5の今回のCONNECT sliceに独立した業務要件identityはない。固定L2は機構間の業務意味を各ownerへ残すため、業務結果の意味・承認・保存をこの文書で新設しない。片側交換や複数edgeの技術終端から業務完了を生成しない。

本スライスは技術的な機能契約である。CONNECTは接続/送達receiptを業務成功へ昇格せず、送信authorityはSECURITYに委ねる。SECURITYは個別policy judgementを返すが、OS assignment、LABO評価、BRAIN登録、保存実行を所有しない。業務意味を担う上流L2/L1を変える必要が生じた場合だけ、その要求revisionを示してL2へ差し戻す。

個別FR/ACと受入範囲は[機能要件](../L3-requirements/functional-requirements.md)および[L10総合検証](../L10-verification/functional-verification.md)を参照する。これは業務要件の不存在を他機構へ一般化する主張ではなく、このStage 1 sliceの分類である。

## Stage 4・Stage 5の業務分類

| 親L2 | business要件への扱い | 境界 |
|---|---|---|
| HELIXCONNECT-L2-008 | 独立business requirementを導出しない | profile descriptorは安全・利用許可・事業適格性を証明しない。 |
| HELIXCONNECT-L2-009 | 独立business requirementを導出しない | feedback relationは送信権限、業務完了、retry policyを作らない。 |
| HELIXCONNECT-L2-007 | 独立business requirementを導出しない | 技術edge終端・構成体traceは接続先業務成立・承認を生成しない。 |
