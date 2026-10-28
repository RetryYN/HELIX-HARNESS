---
title: Pythonのformatter・linter選択
decision_record_id: HDEC-PYTHON-FORMAT-LINT-2026-10-28
decision_status: technical_selection
decider_role: AI作成レーン（独立review対象）
authority_effect: repository_local_tooling_only
---

# Pythonのformatter・linter選択

## 対象と判断

WR-CLAUDE-PY-FORMAT-LINT-3510-20261028-73（[#3510](https://github.com/RetryYN/HELIX-HARNESS/issues/3510)）に基づき、
`helix/`と`scaffold/`のPython整形・静的検査をRuffにまとめる。
起点はmain `5751f670ed8aff984ac03076a05f28b6df38ee53`、tracked Pythonは526ファイル
（helix 138、scaffold 388）である。既存の`.editorconfig`は文字コード・改行の設定を持つ。

Ruffはformat/checkを同じtoolと設定で扱えるため選ぶ。
[HARNESSの既存pack設計](../../helix-harness/L5-detail-design/pack-boundary.json)の
`config_sections`にある0.17.1、Python 3.12、行幅88、E4/E7/E9/Fに合わせる。
同設計本文のmetadataは候補状態を示すため、承認済みtool選択の根拠にはしない。
既存候補と設定の差を増やさない技術選択であり、当該packの実装・環境受入を成立させない。
本repositoryのローカル開発に限る。
設定をルートの`ruff.toml`1ファイルに置く。
[公式設定仕様](https://docs.astral.sh/ruff/configuration/)と
[formatter仕様](https://docs.astral.sh/ruff/formatter/)を照合した。

Black＋Flake8は同じ目的に2ツールと別設定を要するため採らない。
旧Biome設定はTypeScript用でありPython用へ転用しない。
最新0.17.3も予備計測したが、既存pack設計との版差を増やす理由がないため採らない。

## 旧HELIXと失敗事例

旧sourceは`archive/legacy-generation-2026-09-14/root/`以下を読むだけにした。

| 旧source・asset | 確認した内容 |
|---|---|
| `biome.json:2–31`（LEGACY-ASSET-2BC8A1F5E9380D5A187A） | TSのsrc/tests、整形とrecommended lint、行幅100 |
| `package.json:19–20,41`（LEGACY-ASSET-7AE45AD102EAB3B6D7E7） | lintとformatの実行方法、Biome依存 |
| `.github/workflows/harness-check.yml:213–216,518–558`（LEGACY-ASSET-1C7E5C0B33364FBF9EC6） | lint stepの継続と後段集約を分離 |
| `docs/plans/PLAN-L7-05-biome-debt.md:64–104`（LEGACY-ASSET-3557487699D9DB9B7852） | tool版差・既存違反を調べ、整形と動作検証を区別 |
| `docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md:27–70`（LEGACY-ASSET-DA012A9B04D5BE9419CE） | CI責務・authority。Python formatterの指定は見つからない |
| 同L3の`technology-environment-reconciliation-requirements.md:32–70`（LEGACY-ASSET-7F8960532611D89D03E1） | 外部技術・設定・実効環境の照合。特定formatterの指定は見つからない |

前身[UT-TDD #729](https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS/issues/729)は、
約2秒のBiome lintが10分22秒の全test後に置かれ、#724のunused-import/format失敗が約13分後に判明した事例を記録する。
今回はローカルで短い検査を再現できる入口を置く。CI配置の変更は持ち込まない。
[ProFine #28](https://github.com/RetryYN/ProFine/pull/28)は99設計文書と5 planのfrontmatter整形であり、
Python source formatterの失敗例とは扱わない。

旧rootとarchiveの設定名検索、指定L3・workflow・監査の語句検索ではPython formatter設定を確認できなかった。
派生repoのIssue/PRをformatter/format/lint/Biome/Prettier/Ruff/Flake8/Black/Pylintで検索した。
ProFineのroot packageには該当script/依存がなく、VIDEO-STUDIOの該当Issue/PRは0件だった。
WP-THEMEとWP-HARNESSはAPI 404／検索422で参照不能であり、不存在とは判断しない。
検索不成立・該当0件を、全履歴で未使用だった証明にはしない。

保持する点は、tool・版・対象・設定を明示し、整形と意味の検証を分けることである。
変更する点はTS/BiomeをPython/Ruffへ再導出し、repository直下で範囲を固定すること。
理由は現行実装言語がPythonで、旧設定がTSだけを含むためである。旧設定のcopyや旧実行経路の復活ではない。

## 初回の規則と計測

固定版0.17.1でE4/E7/E9/Fを指定した整形前の診断は3,905件だった。
既存417 unit testは同じbaseで合格した（bounded実行26,869ms、出力切詰めなし、process回収済み）。

| 規則 | 件数 | 初回の扱いと理由 |
|---|---:|---|
| E701/E702/E703 | 2003/1617/6 | 有効。statementの改行は整形PRで解消し、前後ASTを照合 |
| E401/E402 | 66/3 | 段階導入。import再構成・動的path設定を整形に混ぜない |
| E741 | 55 | 段階導入。変数名変更を整形に混ぜない |
| F401/F841 | 82/60 | 段階導入。importや評価式の削除による副作用変更を混ぜない |
| F541 | 12 | 段階導入。式の表記変更を整形に混ぜない |
| invalid-syntax | 1 | CPythonとRuffのparser差。下記を参照 |

その他のE4/E7/E9/Fは有効。段階導入の6規則は`ignore`に明示し、toolの既定規則変更に追随しない。
対象ファイルを変更する別作業で違反の意味と副作用を確認し、個別に解消してから除外を減らす。
`--exit-zero`やlintの自動修正は使わない。

`scaffold/research/rdp001-web-webos-vision-source-0080/validate.py:148`の
`; match=[...]`はCPython 3.12のAST parserでは成立するがRuffがcompound statementとして拒否した。
最小例`x = 1; match = []`でも再現する。整形PRではこのセミコロンを改行へ分け、前後AST一致で確かめる。
構文エラーを無視する設定や当該ファイル除外は追加しない。

設定PRと一括整形PRを分ける。整形PRにはAST・文字列値・対象集合の一致、全unit testの前後結果を付ける。
実行方法は[Python tooling](../python-tooling.md)に置く。
GitHub workflow、required check、新しい承認gate、品質保証全体の完了はこの判断に含めない。

## 外部実行資産の材料と未確認

SECURITY L3の012-F01/F03・013-F01〜F03に対する初回toolの材料を次のように分ける。
対象はPyPI packageとその内包binaryであり、他の7資産種の採用はない。

| 項目 | 固定した材料／限界 |
|---|---|
| source/version | [PyPI ruff 0.17.1](https://pypi.org/pypi/ruff/0.17.1/json)、manylinux_2_17_x86_64 wheel、10,350,811 bytes |
| digest | wheel SHA-256 `a6ef98e51de8ef38082f90653ceeb84944bd7673783eea13e1647c5b9b064189` |
| producer | metadataはAstral Software Inc.を示す。[公式release](https://github.com/astral-sh/ruff/releases/tag/0.17.1)とwheel生成を結ぶbuild来歴は未証明 |
| dependency | Requires-Distなし。native/OS依存の完全な閉包は未監査 |
| permission | 実行者の権限を継承。checkは`--no-fix --no-cache`、整形は指定対象への書込。OS sandboxによる権限縮小は未実施 |
| network | 取得時はPyPIへの通信。lint/format実行時の通信監査・egress制限は未実施 |
| known risk/update | PyPI応答のvulnerability一覧は空だったが網羅監査ではない。初回導入であり、既適格版からの更新とは扱わない |
| rollback | source/configはgitで前revisionを保持。以前のRuff環境はなく、tool実環境のrollback試験は未実施 |

取得・install・実行対象のdigest照合を局所検証記録へ結ぶ。
これらをSECURITYの実collector、trust、供給網全体、正式なpack適格性の成立とは扱わない。
