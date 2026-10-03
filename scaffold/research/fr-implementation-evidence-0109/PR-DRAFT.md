# HIL-FR-01〜20 旧資産証拠partition研究（SCF-B-0109）

## 目的

HIL-FR-01〜20の製品unitについて、旧実装／未実装／縮退／failure／consumerを同一の推測へ畳み込まず、固定BASEの原文、Wave1〜50、旧資産台帳、判断史、read-after、phase/product classificationから静的partitionを作成する。

## 変更

- FR01〜20の29 product unit（HELIX-OS 18、HELIX-HARNESS 11）を固定し、BR unitを除外。
- Wave1〜50を全scanし、87 semantic review edgeと46 unique old assetをunit別に固定。
- 旧assetのsource path／source SHA／BASE Git blob、ledger、decision、read-after、classificationをsource/history/failure/consumerへ分離。
- `implementation_evidence`、`degradation_evidence`、`failure_evidence`、`consumer_evidence`、代表assetを独立fieldで保持。
- PHCAP20定義と四製品L1はcontext-only入力としてdigest固定。phase/product authorityは昇格しない。
- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e`、全入力Git bytes digest、BASE祖先性を検証。
- Binding `SCF-B-0109`へbundle全成果物を登録。

validatorは`build.py`をimportせず、固定BASE Git object bytesから期待値を独立再導出する。generatorを一時改竄して再生成しても、実装成立／failure／consumer closure／未実装断定の混入を拒否する。

## 境界

`implementation_source`や旧source存在は候補証拠であり、正式実装成立を示さない。静的なcoverage.failure／counterevidenceは実行failure receiptではない。旧assetのconsumer refs、decision、read-afterはclosureを示さず、unitの未実装・縮退・phase/product authority・successorも確定しない。正式crosswalk、PHCAP、product L1、authorityは変更しない。旧archive実行、現行runtime／CI、merge、closeは行わない。

## 検証結果

- `python3 scaffold/fr-implementation-evidence-0109/validate.py` PASS
- `python3 scaffold/fr-implementation-evidence-0109/selfcheck.py` PASS（23 negative cases、期待error code照合。malformed bundle、source binding、generator再生成改竄を含む）
- `python3 -m py_compile scaffold/fr-implementation-evidence-0109/*.py` PASS
- `git diff origin/main...HEAD --check` PASS（commit後の最新HEADで実行済み）

Progress reference: #1813
