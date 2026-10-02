# AAFD-R-05/R-08 現行対応と候補追補

## 作業基準

- base: `064eb83cdf78dad0bad6f5f256ff7048b25203bd`（#2505統合後）
- 旧source: `LEGACY-ASSET-EB3700B0088F311C2295` requirements lines 52–53, 71; `LEGACY-ASSET-CAC0C64EB7540180B1FE` acceptance lines 19, 22, 39, 40, 42, 44。本文・物理行・SHAはpaired source JSONLを参照。
- current parent: `HELIXINTELLIGENCE-L1-009`（current concept/planning SHAはreceipt pins）、scopeは監査提案のtrace/no-free-text-authority。現行資料はformal future-delta consumer/ownerを確定していない。

## 現行pairとの照合

- 採択済み `HELIXINTELLIGENCE-L2/L11-009` は監査findingのsource/evidence trace、`L2/L11-012` はunknown保持を持つが、旧AAFD-R-05のqualified internal/UIL vs external/TER source receiptとorigin/owner別保持、AC-005のowner-swap oracleは対象atomへ接続されていない。
- 採択済み `HARNESS-L2/L11-023` は依存を「常時必須」「特定操作時のみ必須」「選択した入力元に応じて必須」「参照資料のみ」に分ける。これは適用依存の扱いであり、AAFD owner/consumerを定義しない。candidate/L11-077はこの4区分を適用条件として明示する。選択receiptの読取またはqualification照合に失敗したらunknown/incompleteのまま選択source ownerへ戻し、別receipt・未選択source・reference-only資料へfallbackしない。
- AAFD `L2/L11-073` はR-04のdetector priority/direct projection限定、`075` はR-01–03 proposal identity/qualification、`076` はR-13–14 model comparison。いずれも今回のR-05/R-08保証を保持しない。075/076はunadopted proposalsであり、採択証拠には数えない。073の採択revisionは28日decisionと29日decision rowから読む。
- R-08のAC-008 line 22はunknown→0/unchanged/observedとRequirement direct writeを挙げるが、R-08 line 71は `0, neutral, unchanged, observed` の4値、Requirement/Design/Release/Assignment/mergeの全出力を列挙する。candidateは原文の全集合を保持し、AC-008を全条件の代わりにしない。

## 追補内容と未決の責務

L2/L11-077は、qualified internal/UILまたはexternal/TER source receiptをdelta candidateの起点とし、origin typeとownerを別に保つ。L11 positive fixtureではreceipt identity/revision、origin type、fixture入力の既存source-owner identityを個別に照合し、external provider release observationのみではHELIX defectとしない。external release単独をHELIX defectへ、internal/external driftを逆のownerへ読み替えない。4つのunknown補完変異と、Requirement/Design/Release/Assignment/merge各直接変更をそれぞれ拒否し、candidate保持と別途の既存owner判断を分ける。

現行L1-009は将来delta consumerや形式ownerを確定しないため、旧UIL/TERを現行機構として新設しない。候補はA（推奨: audit proposal scope維持、formal consumerはunknown）、B（INTELLIGENCEのscope/責務をL1でPO判断）、C（別機構なら既存L1と採択pair確認後に配置）の選択肢を提示し、影響要求をreceiptに記録する。候補化・比較はPO選択を開始条件にしない。

## 判定境界

これは9 selected source atomの意味対応に限る。R-06/07/09–12のFuture Synthesis処理、R-13–15、AAFD全体のformal successor、runtime/実行、採択は主張しない。positive/negative/unseenは要求oracleの提案であり、実行結果ではない。旧runtime/CLI/CI/testは実行していない。

Receipt: `docs/governance/audits/requirement-registration/aafd-r05-r08-coverage-receipt-2026-10-02.json`  
Source atoms: `docs/governance/audits/requirement-registration/aafd-r05-r08-source-lines-2026-10-02.jsonl`
