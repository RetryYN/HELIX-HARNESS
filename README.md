# HELIX 新世代上流再構築

このrepositoryは、HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSを対象別に分離し、
ConceptからL1、L2／L11、L3／L10、下流pairへ降ろし直している。

現在の入口は[新世代作業入口](docs/governance/new-generation-start-here.md)である。
GitHub Issue／PR／Projectsは共有・review・作業証拠のprojectionであり、要求意味の正本ではない。

旧世代の実行面は`archive/legacy-generation-2026-09-14/`へ隔離した。そこにあるworkflow、CLI、hook、
adapter、source、test、設定、AI instructionを実行・復元・fallbackしてはならない。旧資産は新世代を
上流から再導出するときのreference sourceとしてだけ読む。

archive内READMEのcopy禁止は旧世代snapshotに含まれる既定の隔離規則である。新世代側では
[完全一致再利用統制](docs/governance/legacy-asset-reuse-control.md)が上位の現行規則であり、そこに承認済み
`verbatim_reuse`行がある非実行資産だけをarchiveから同一byteでcopyできる。旧workflow、runtime／CLI、hook、
adapter、AI instruction／prompt、実行設定は例外対象外であり、archive内README自体はhistorical bytesとして変更しない。

新世代CIは未構築である。現時点のPRは上流候補の共有と許可された意味reviewに使えるが、旧CIのgreen、
merge、Issue closeを上流承認へ変換しない。
