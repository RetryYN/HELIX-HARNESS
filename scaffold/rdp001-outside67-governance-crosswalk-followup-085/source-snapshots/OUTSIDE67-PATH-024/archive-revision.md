# L2凍結境界の意味差分proposal

各`.jsonpatch`は同名の`requirements-ir/*.json`に対するJSON Patch形式の意味差分案である。
revision・既存semantic digest・変更前本文のtestを持つ。7レコードの本文差分だけを表し、正本化のtransactionではない。

生成時に全testをメモリ上で評価した。正本ファイルへの適用・書込みはしていない。
このpatch単体をcanonicalへ適用してはならない。変更後revision・semantic digest・manifest・履歴・下流失効・
生成view・DB・receiptを既存Admissionの正規更新として一括確定する工程が別に必要である。

[是正判断と更新経路の調査](../l2-freeze-ir-correction.md)を参照する。これらのファイルは未承認のproposalであり、
機械が読む現行要求の探索rootやgenerated viewへ追加しない。
