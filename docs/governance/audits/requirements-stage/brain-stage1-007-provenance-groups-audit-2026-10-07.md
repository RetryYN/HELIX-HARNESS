# BRAIN Stage 1 L2-007 provenance group trace audit

対象はHELIXBRAIN-L2-007のStage 1 L3/L10対応である。固定L2/L11の意味・範囲・owner・1.0版を変更せず、文書上のgroup数、atomic mutant、CASE traceを整合させた。

固定L2 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2:150–160と対L11:35を原文照合し、full/span SHA-256をJSONへ固定した。旧L3定義からFR/ACとL10 pairの骨格を保持し、旧L10のsystem behavior検証と差戻し関係を保持した。旧RCLSは段階的promotion、Patternのscope/counterexample、independent verificationの意味比較に使用した。旧case ID、threshold、test/runtimeは移していない。

## Groupとatomic fieldの区別

必須groupは8つで、7 provenance group（source identity/revision、provenance、evidence、adopted reason、evaluated scope、counterexample、limitation）とLABO評価対象revision groupから成る。source identityとsource revisionは一つのprovenance group内に置き、atomic mutantでは別々に検査する。したがってatomic provenance fieldは8つ、LABO対象revisionは追加の別group/atomicであり、総数を9 groupと数えない。

L10 C02は8 atomic provenance fieldの個別欠落/stale/dangling変異を扱う。C05はLABO対象revision mismatch、C10は他条件を正常に保ったLABO対象revision missingの単独negativeである。C09の未見正常系、L3対応表、BR/NFR traceもC01–C10へ同期した。

## 検証

静的確認はPASS：C01–C10の一意性、8 group定義、atomic/group区別、C10の単独missing oracle、C05 mismatch、六本文のtrace参照、固定親full/span SHA、`git diff --check`。旧test、runtime、CIは実行していない。

L3承認、独立review、実行許可は成立・主張していない。詳細なpinと変更後6本文SHAは同名JSONを参照する。

## 変更後本文SHA-256

- `docs/helix-brain/L3-requirements/functional-requirements.md` — `19e06775a504283d3179a9ddc088f7d96ef60c9d3ca0ecd9817ec865716c04d1` (171666 bytes)
- `docs/helix-brain/L3-requirements/business-requirements.md` — `6b5bbc7c572dd9c7a5f444a8150b339ab00889041913f381f132a29c2dce5964` (12607 bytes)
- `docs/helix-brain/L3-requirements/nfr-grade.md` — `0b3e01ea34106837984cd7823b89940828fc1b6d859c56fbcc70c9b2bf892734` (38681 bytes)
- `docs/helix-brain/L10-verification/functional-verification.md` — `c169c41c05fa8b712212a3336eff3a6b4df337f30ec253a3bffc5c6bd1d992f5` (221326 bytes)
- `docs/helix-brain/L10-verification/business-verification.md` — `f020b57e9efd80cf1b5bbc3119f2165dfa0a5250e35433d82a56910defbbf495` (10498 bytes)
- `docs/helix-brain/L10-verification/nfr-verification.md` — `2aafd5c7fe34147a3fd6142c900315fb31bd976dd2c380b86da33cb482f6a981` (28984 bytes)

Root検収では旧NFRの不一致検査を維持し、C02とNFRに個別mismatchも明記した。
