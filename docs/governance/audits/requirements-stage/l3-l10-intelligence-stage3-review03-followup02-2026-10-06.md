# #2607 review03 correction follow-up 02 — 2026-10-06

## 対象

Root検収で判明した072-02のFV trace欠落と、073追補CASEの複合入力を対象とする作成側追補。直前の追補 `l3-l10-intelligence-stage3-review03-followup-2026-10-06.md/.json` とそれ以前の監査は変更しない。

読み合わせた現行FR `functional-requirements.md`（072-02/073-02）、FV `functional-verification.md`、固定L2-072 NFR-34 673–687、L11-072 289–303/306–314、L11-073 317–326、およびL2/L11固定revision `633bf12ea8f948db8ba3d6600179c4a9507377a7`。旧sourceはasset inventoryのpath/SHAと、`LEGACY-ASSET-EB3700B0088F311C2295` 45–46、`LEGACY-ASSET-CAC0C64EB7540180B1FE` 18をread-onlyで照合した。旧AAFDはdeterministic detectorを保持し、自由文のIssue/Requirement/CI/merge authorityへの直接projectionを拒否する比較起点であり、現行の宛先別oracleは採択L2/L11から再導出している。

## 072-02のCASEとtrace

FR 072-02はstale applicability、review receipt欠落、rollback evidence欠落、forced stateを独立変異として列挙する。FVで既に個別oracleがあるのは、`CASE-INTELLIGENCE-L10-072-02i`（forced）、`-02k`（review receipt欠落）、`-02m`（rollback evidence欠落）。それぞれ入力一項目だけを変え、不合格条件も対応する状態の読み替えを拒否するが、旧traceはAC-08/07だけだった。この3行へAC-02を追加し、既存AC traceも維持した。

既存`CASE-INTELLIGENCE-L10-072-04`はselected-source applicabilityのunknownでありstaleを検証しない。`-02d`および型別source tuple CASE群はsource identity/revision/digest変化によるfacet staleを扱うが、packのscopeへのapplicability evidence自体を stale にするoracleではない。そのため `CASE-INTELLIGENCE-L10-072-02-applicability-stale` を追加した。applicability evidenceだけstale、他のpack/source tupleとshadow/review/rollback evidenceは正常とし、candidateを保持してapplicability facetのみ適用保留、既存source ownerへ戻す。これにより4種類を個別変異・独立oracleとしてAC-02へtraceした。固定L2-005の選択source stale境界を越えて新しい権限・状態・ownerは追加していない。

## 073追補CASEの単独化

現行FVに次の単独CASEが既にあることを確認した。

- CI実行要求: `CASE-INTELLIGENCE-L10-073-02e2`
- CI pass/完了状態: `CASE-INTELLIGENCE-L10-073-02e3`
- merge admission: `CASE-INTELLIGENCE-L10-073-02f`
- merge状態: `CASE-INTELLIGENCE-L10-073-02f2`

これらはそれぞれ自由文だけを唯一の根拠にした単独入力で、AC-073-02へtrace済みだった。review03追補の束ねた2行からCI実行要求/passの再列挙とmerge admission/stateの再列挙を除いた。個別oracleが無かった「自由文からCI実行結果を作成する」だけを `CASE-INTELLIGENCE-L10-R2607-073-free-text-cannot-create-authority-ci-result` に単独fixtureとして残した。元行のCI compositeは実行要求/結果/passを一条件に束ねていたため、CI実行結果のみに限定した。merge composite行は前記`02f`と`02f2`の個別oracleが存在するため削除した。CI gate追加拒否とreview/merge admission置換拒否のCASEも既存行に残る。

## 静的検証と限界

072の4単独oracleは全てAC-072-02にtraceされ、旧AC traceを保つ。073は上記4宛先/状態の独立CASEとCI実行結果の単独CASEを確認した。FV CASE tableは6列、CASE IDは重複なし、FVが参照するFR/ACは存在する。JSON構文と`git diff --check`を確認した。repository test、CI、Bun、旧runtime/CLIは起動していない。これは本文・期待oracleの静的対応であり、実consumerの挙動や独立reviewを証明しない。
