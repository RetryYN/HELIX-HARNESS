# Design HARNESS ecosystem調査の採否台帳

## 位置づけ

本書はrootへ一時配置された `deep-research-report.md` の退役receiptと、既存coverage ledgerからIssue #1033 System Synthesisへの
non-authoritative dispositionである。全章のexact atomization正本は`docs/research/design-harness-deep-research-coverage-2026-07-29.md`とする。原稿内の生成系citation markerは参照URLとして再現不能なため、要求・採用根拠・
ライセンス判断へ直接流用しない。採用時は一次資料を再調査し、確認日、version、license、data boundaryをreceipt化する。

## 採否

| capability family | disposition | owner / 接続先 | 境界 |
|---|---|---|---|
| Canonical Design IR | adopt-with-hardening | #1033 Requirement IR / Design Registry | candidateとcanonicalを分離し、authority digestとapprovalを必須化 |
| DTCG token exchange | research-candidate | #1033 Contract Portfolio | current標準versionと変換lossを一次資料で再検証 |
| Figma / Penpot adapter | future-adapter | #1038 adapter family | 外部toolを正本にせず、read-through＋承認済write-backだけ許可 |
| Storybook / Playwright / a11y / visual diff | adopt-with-hardening | Verification Registry | 状態exact set、非決定要因固定、evidence digestを要求 |
| Asset provenance / C2PA sidecar | research-candidate | Asset Registry / #679 security | metadata消失を前提にsidecarとsink authorityを二重化 |
| glTF / Vega-Lite / editor document IR | future-modality | Design Registry subtype | 共通enumへ潰さずmodality別schemaを保持 |
| DOM / AST / screenshot Reverse | proposal-only | Reverse / Redesign | confidenceとcounterevidenceを持つcandidateに限定 |
| S3 / CloudFront / commercial SaaS | deferred-provider | Deployment / provider adapter | credential、region、license、cost、egress承認なしに採用しない |
| AI design generators | generator-tier-only | provider adapter | canonical write authorityを与えない |

## 責務分離

1. #1033はtool選定ではなく、Design IR、registry、evidence、replacement candidateの意味契約を所有する。
2. 個別tool adapterはprovider固有Issueへ分離し、HELIX current requirementsを追い越さない。
3. security、license、data residency、credential、network egressは#679および製品ライフサイクルauthorityへ接続する。
4. research候補はbenchmark／consumer実測を経てからrelease moduleへ昇格する。

## 原稿処分receipt

- source filename: `deep-research-report.md`
- source SHA-256: `a94aa99e0f22c40e75816beb46105b0c2f75173ccf430577df5355635f2dca39`
- raw proseのauthority: なし
- retained value: 上表のcapability候補と責務境界
- omitted: 再現不能citation marker、日付固定roadmap、未検証の製品・license・価格主張
