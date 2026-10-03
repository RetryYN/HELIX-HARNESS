# Governance・Web・Scaffold配置統合の照合記録（2026-10-04）

本記録は、base `64be94b4cf90c2b06c4c9f28eb6b407689509403` に、Governanceの7記録移動、Web統合後のScaffold研究束、L3/L10配置ガイドを選択統合したローカル候補を照合する。対象HEADは `f0dcd917ea26ce90cc7d628d9f8e0d0b799307f6`。この記録自体はそのHEADの後に追加した監査資料であり、候補HEADを遡って書き換えない。

## Governanceの分割と履歴保持

7件の固定記録は、既存の `audits/source-rebaseline/`、`audits/source-rebaseline/github-projection-backups/`、`audits/requirements-stage/history-snapshots/` へ移した。旧位置、新位置、移動時点のSHAとbytes数は、既存の[Governance固定履歴移動監査](governance-fixed-history-relocation-audit-2026-10-03.json)に記録されている。同監査の7件は4件が同一bytes、3件のMarkdownは合計19件のリンク先tokenだけを深さに合わせて更新し、それ以外のbytesは維持した。別途、current参照の追従は13文書の39リンク先tokenで記録されている。移動前の監査はbase `4ef29ee37ee271d224b4f3e6c520b996075c66e3`時点の記録として保持し、本記録はそれを現在のmainや本候補と偽装しない。

2026-09-26の2 decision recordは時点の記録であり、Web候補内で相対リンクが更新されていたためbaseのexact bytesへ戻した。`helix-web-relocation-po-decisions-2026-09-26.md` はSHA-256 `6f689d117a0bb87338d6c6cc8b7796013965afe2364fddcf2c0c99a8f7cf4d0e`、`governance-legacy-migration-layout-po-decisions-2026-09-26.md` はSHA-256 `f4b48c25125081bb223857e7f8de73323b8ca7d2bbde114c395e2c83a4508376`で、いずれもsource revision・本文を保持する。これらの本文に残る当時の相対hrefは固定履歴locatorであり、現在のconsumer参照として数えない。移動したGovernance文書は上記の対応表で、新旧のWeb pathはWeb decision record内の対応表で辿る。新しいalias規則や承認手続きは設けない。

## L3/L10正本配置

[L3要件・L10総合検証の配置と著述規則](../../l3-l10-authoring-layout.md)を現在の正本として追加し、[現行作業入口](../../new-generation-start-here.md)の対象別L2入口に1リンクを加えた。配置は本体8機構の既存 `docs/<機構>/` 以下に `L3-requirements/` と `L10-verification/` を置く形とし、旧L3の3区分に対する6つのcanonical Markdown名、横断ACとL10の相互参照、現行L2・owner・版への再導出、旧sourceの項目別保持規則をガイドに明記した。現段階では物理ディレクトリやL3/L10本文は作っていない。物理ディレクトリは最初のL3本文と同時に作る。Webの未来要件を1.0へ繰り上げず、旧G3やruntime・sub-gateを移植しない。配置決定に新しいfreeze承認gateを加えない。

ガイドは旧sourceのasset ID、path、行、SHAを記録し、旧記述から保持・再導出・置換する内容を分ける。`business-requirements.md`は旧`business-detail.md`のコピーではなく、現行L3の業務要件を表す統一名として再導出する。HARNESS、LABO、OSのowner境界に基づき項目ごとに割り当てる。旧の値、承認動作、runtimeは現行の規範として継承しない。

## 現行参照と検証

現在の移行registerは1,075行、SHA-256 `520216521f09b7a9bc77a8c9b9a7d7a836f9ff457bfebcbd6560f17700eee5de`でbaseと同一。Scaffold Bindingは143件でIDと全非upstream fieldがbaseと同一だった。Governance移動とcurrent inputの再baselineでは13 current path fieldと101 upstream SHA fieldを更新し、L3/L10入口追記では `new-generation-start-here.md` のSHAを参照する73 Bindingと、そのBindingを参照するSCF-B-0149の2 SHA pinを追随した。役割、obligation、authority、state、replacement、過去noteは変更していない。Governanceの直接current root file数は27から28となった。

137件の現行static validatorをbase 64beと候補HEADで比較した。baseは79 pass／58 fail、候補は82 pass／55 fail、timeoutは両方0。差はSCF-B-0048、Web vision semantic atom 0081・0084の3 validatorがfailからpassへ変わったものだけで、passからfailへの変化はなく、残るfailed validatorのerror code集合も変わらない。比較manifestはこの監査のJSON版に収録する。これはこの候補のstatic validation結果であり、formal main上の完了証拠ではない。

候補HEADでの追加検証：`scfctl validate` 143件fail 0、`stale=0`、`residuals=0`、selftest 69件fail 0、rulebook再生成check 59 files、`govcheck` 7,622 atoms／57 requirements／58 files、`govcheck_selftest`全項目pass、`git diff --check` pass。配置ガイドと現行入口のMarkdown linkは78件、missing 0。旧decision本文の固定hrefはこのcurrent-link数に含めない。

機械可読のbase・candidate、固定履歴SHA、移行register、Binding差分、137件のbefore/after結果は[JSON照合記録](governance-web-scaffold-layout-integration-audit-2026-10-04.json)に記録する。
