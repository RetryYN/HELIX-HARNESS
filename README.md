# HELIX 新世代上流再構築

このrepositoryは、HELIX-HARNESS、HELIX-OS、HELIX-Web（製品群）、HELIX-WEB-OSを対象別に分離し、
ConceptからL1、L2／L11、L3／L10、下流pairへ降ろし直している。
HELIX本体とWeb・WEB-OSの文書は`docs/`の下で対象ごとのfolderに分ける。配置の判断は[2026-10-03の判断記録](docs/governance/decisions/helix-web-docs-consolidation-po-decisions-2026-10-03.md)を参照。

現在の入口は[新世代作業入口](docs/governance/new-generation-start-here.md)である。
GitHub Issue／PR／Projectsは共有・review・作業証拠のprojectionであり、要求意味の正本ではない。

旧世代の実行面は`archive/legacy-generation-2026-09-14/`へ隔離した。そこにあるworkflow、CLI、hook、
adapter、source、test、設定、AI instructionを実行・復元・fallbackしてはならない。旧資産は新世代を
上流から再導出するときのreference sourceとしてだけ読む。

archive内READMEのcopy禁止は旧世代snapshotに含まれる既定の隔離規則である。新世代側では
[完全一致再利用統制](docs/governance/legacy-asset-reuse-control.md)が上位の現行規則であり、そこに承認済み
`verbatim_reuse`の承認行、または要求を落とさないための`source_snapshot_preservation`行がある非実行資産だけをarchiveから同一byteでcopyできる。後者は物理保全であり、対象productへの配置承認を意味しない。旧workflow、runtime／CLI、hook、
adapter、AI instruction／prompt、実行設定は例外対象外であり、archive内README自体はhistorical bytesとして変更しない。

新世代CIは未構築である。現時点のPRは上流候補の共有と許可された意味reviewに使えるが、旧CIのgreen、
merge、Issue closeを上流承認へ変換しない。

## ライセンス

現行の独自資産は[全権利留保（All Rights Reserved）の独自ライセンス表示](LICENSE)に従います。
GitHub規約上の閲覧・fork等、適用法上の権利、過去のMIT許諾を保持し、それらの範囲外での利用・複製・改変・実行・再配布等は、商用・非商用を問わずRetryYNとの別途の書面による有償ライセンスが必要です。
公開repositoryであることから無償利用許諾を生成しません。切替前に公開されたMIT版と既許諾の素材はMIT条件を維持します。切替前commitと履歴LICENSEへの参照はLICENSEに記載しています。
利用者の成果物とHELIX素材を区別し、第三者素材には元の条件を適用します。[第三者通知と棚卸しの範囲](THIRD_PARTY_NOTICES.md)も参照してください。
問い合わせは[GitHubのIssue](https://github.com/RetryYN/HELIX-HARNESS/issues)へ、秘密情報・個人情報を含めずに送ってください。価格・契約条件・評価版は未確定です。
