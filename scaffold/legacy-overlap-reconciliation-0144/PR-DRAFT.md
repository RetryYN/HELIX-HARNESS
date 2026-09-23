# #2078 overlap 36件を候補差分の人間判断packetへ

## 目的

PR #2078のoverlap 53件から、同一source path/SHAなのにmain research unionとcandidate resultが異なる36件を切り出し、両候補の静的根拠を比較可能にします。勝者や正式routeを自動選択せず、36件の新規asset研究にも数えません。

## 根拠と差分

- main `7afee33ae892fe1a3cf1085fac4e02d923ece01d` へ再baselineしました。前main `2c94d171e9b1f2cb28aaceedf591129fb8e4db2e` から、四製品L1および旧分類8 JSONLを含む固定入力20 pathのblob/modeは不変です。mainへ追加された#2078の8 Scaffold filesはc55固定objectと一致します。現main unionは旧source-specific候補429件と新規67件の計496件ですが、36件の候補比較は旧429件対固定#2078 HEAD `c55ffc91b08aabb0a0216168b3cf2b1e5fe6bf03` のままです。
- 36件すべてsource path/SHA、archive blob、regular mode/type、bytes SHA、MANIFEST digestが一致します。
- main候補はdirect 24件とmulti-product conflict 12件、#2078候補はinsufficient 36件です。source-specific main spanとtarget fallbackの一意1行spanは36件すべて異なります。
- #2078はoverlap行を最終classification JSONLから除外しています。target spanおよび四製品L1比較poolはtarget generatorのhelper/literalから固定archive bytesへ静的再構成し、出力済み証拠とは分離して示します。mainには36件すべて明示counterevidenceがあり、target overlap行にはtarget固有counterevidenceは記録されていません。
- 36件はmain側にsource-specificなsemantic researchがあり、#2078側はgeneric insufficient-basis fallbackです。差分理由をscope/span/research-method-state/classification-ruleとして保持し、semantic interpretation conflictは両側が独立にsource-specific researchを行い解釈が両立しない場合に限ります。今回該当するsemantic conflictは0件です。全件の人間判断は引き続き未了です。

## 境界

research-only Scaffold Binding `SCF-B-0144`、formal classification/route/phase/successor/implementation/consumer closure更新なし、`authority_effect=none`、`new_build_allowed=false`。4製品に限定し、LABO適用はIssue #2089の棚上げ対象のため禁止です。旧archive内source/runtime/test/CI/hook/adapterは実行していません。

## HEAD追随

#2078 HEAD c55ffc91とmain HEAD 7afee33aを明示pinしました。どちらかが進んだ場合はbaseline/reviewを停止し、現行packetとして扱いません。新HEADとrebase baseを確認後、明示pin更新、generator・validator・selfcheck再実行、candidate union・36件・全evidenceの差分レビューを完了してからreviewを再開します。branch refを自動追随しません。

## 検証

`generate.py`、独立 `validate.py`、17件の順序固定negative selfcheck、`py_compile`、`scfctl validate`、`git diff --check`を実行します。レビュー依頼、merge、Issue closeはこのPRでは行いません。
