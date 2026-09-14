# L2凍結境界の意味差分proposal

各`.jsonpatch`はarchive内の旧`requirements-ir/*.json`から採取した、7レコードのsemantic atomを保存するhistorical proposalである。
revision・旧semantic digest・変更前本文のtestは出典同定のために保持し、旧IRまたは新世代要求へ適用するpatchとして扱わない。

生成時に全testをメモリ上で評価した。正本ファイルへの適用・書込みはしていない。
このpatchをcanonicalへ適用してはならない。内容を対象別L2へ個別採否し、人間合意後に新世代L3／L10と機械projectionを
承認済み上流から再導出する。旧Admissionや旧IRのin-place更新へ戻さない。

[是正判断と更新経路の調査](../l2-freeze-ir-correction.md)を参照する。これらのファイルは未承認のproposalであり、
機械が読む現行要求の探索rootやgenerated viewへ追加しない。
