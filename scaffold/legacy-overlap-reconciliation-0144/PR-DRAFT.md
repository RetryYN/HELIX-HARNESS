# #2078 overlap 36件を候補差分の人間判断packetへ

## 目的

PR #2078のoverlap 53件から、同一source path/SHAなのにmain research unionとcandidate resultが異なる36件を切り出し、両候補の静的根拠を比較可能にします。勝者や正式routeを自動選択せず、36件の新規asset研究にも数えません。

## 根拠と差分

- main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` の8 product-research bundleと、#2078現HEAD `8c8cf851b47c88f6d814dc828a38743fc3cd45b3` のoverlap inventory/generatorをGit objectから固定しました。作業開始時の886c pinからHEAD更新を検知したため、overlap53/差異36 ID集合、source identities、main候補結果が不変であることを再計算してre-pinしています。
- 36件すべてsource path/SHA、archive blob、regular mode/type、bytes SHA、MANIFEST digestが一致します。
- main候補はdirect 24件とmulti-product conflict 12件、#2078候補はinsufficient 36件です。source-specific main spanとtarget fallbackの一意1行spanは36件すべて異なります。
- #2078はoverlap行を最終classification JSONLから除外しています。target spanおよび四製品L1比較poolはtarget generatorのhelper/literalから固定archive bytesへ静的再構成し、出力済み証拠とは分離して示します。mainには36件すべて明示counterevidenceがあり、target overlap行にはtarget固有counterevidenceは記録されていません。
- 差分理由候補はscope/span/interpretation/classification-ruleを根拠参照付きで並べます。全件人間判断待ちです。

## 境界

research-only Scaffold Binding `SCF-B-0144`、formal classification/route/phase/successor/implementation/consumer closure更新なし、`authority_effect=none`、`new_build_allowed=false`。4製品に限定し、LABO適用はIssue #2089の棚上げ対象のため禁止です。旧archive内source/runtime/test/CI/hook/adapterは実行していません。

## HEAD追随

#2078現HEAD 8c8cf851を明示pinしました。今後の#2078更新後はrebase/baseを確認し、pin更新、generator・validator・selfcheck再実行、差分レビューを行います。branch refの自動追随はしません。

## 検証

`generate.py`、独立 `validate.py`、17件の順序固定negative selfcheck、`py_compile`、`scfctl validate`、`git diff --check`を実行します。レビュー依頼、merge、Issue closeはこのPRでは行いません。
