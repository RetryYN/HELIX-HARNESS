# Web / Web-OS 直接要求分母前段: Vision source relation research (Scaffold)

基準は `origin/main` の `ea771fb2c496d40fcc429877b0fcd8cff6999526` です。この束は旧Visionの§3/4/6.1–6.3/7/8/12、U07–U19、O03–O10を29 exact span（Vision全583行中、選択範囲の重複を除く179行、未選択404行）として静的保存し、現行Web L2 9件とWeb-OS L2 6件のsource relation候補を照合可能にします。旧Visionから正式な直接要求unit分母、owner、authority、採否、実装、縮退を生成しません。

Web L2 9件は現行 `product-requirements.md` の出典表に明記された行を `document_declared_candidate` として記録しました。Web-OS L2 6件には旧Visionのexact mappingが現行文書内にないため、旧Vision spanは調査候補だけを `candidate_semantic_connection_only` として記録しています。いずれもsemantic equivalenceやformal adoptionではありません。

旧assetはcatalog 4,020件中の代表12件に限定しました（未調査4,008件）。Vision、Package/Release catalog、Connector design、post-deploy、dashboard planをcatalog・disposition・decision・consumer欄とfailure検索結果へ照合し、`legacy-sources/`へsource bytesを静的snapshotしました。12件は全て台帳上 `legacy_implementation_status=unknown`、`consumer_closure_status=pending`、`authority_effect=none` です。一致するdecision recordは0件で、asset単位のdedicated failure recordとread-after recordも確認できません。これはfailure不存在や採否否定の確定ではありません。

四製品は候補境界として保持し、Web/Web-OSの正式分母は未生成です。旧archiveはGit objectから読むだけで、runtime・test・CI・workflow・hook・adapterは実行していません。

## 検証

```text
python3 -B scaffold/rdp001-web-webos-vision-source-0080/validate.py
python3 -B scaffold/rdp001-web-webos-vision-source-0080/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

Bindingは `scaffold/bindings/SCF-B-0080.json` です。成果物はresearch ScaffoldとしてDraft PRで意味reviewへ渡す候補です。merge／closeは実施していません。
