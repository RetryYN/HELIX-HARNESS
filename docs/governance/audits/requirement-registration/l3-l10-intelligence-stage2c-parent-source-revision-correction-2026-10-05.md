# INTELLIGENCE Stage 2c 親別L2/L11 source revision補足

この追補は、#2597のdecision recordとdelegated-decision pinにある一般化された固定L2/L11欄を、親ごとのsource revisionへ正確に分けて示すroot検収用記録である。旧decisionと旧pinは変更しない。6 canonical本文、本文revision、承認範囲は変更しない。

## 親別source

| 親 | 固定source revision | L2 source | L11 source | PO採択source |
|---|---|---|---|---|
| `HELIXINTELLIGENCE-L2-068` | `f6dad2a33e24f000b87d7f09b8d40288257e74cc` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:491–506` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:201–209` | `633bf12ea8f948db8ba3d6600179c4a9507377a7` `helix-intelligence-requirements-po-decision-2026-09-28.md:98` |
| `HELIXINTELLIGENCE-L2-075` | `1880c422311a7f8321dbb0e2b98fa12c69449201` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:618–625` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:337–343` | `po-decision-2026-10-03-later35.md:33`（同revision） |

**訂正の意味**：decisionの「固定L2/L11 revision `f6dad2a…`」および旧pinの `fixed_requirements.l2_l11_revision` は、`HELIXINTELLIGENCE-L2-068` のL2/L11へ適用する。`HELIXINTELLIGENCE-L2-075` はf6のL2・L11両ファイルに存在しない。075の承認対象は、本文が明示的にpinする1880c42のL2 `618–625` とL11 `337–343` である。075のPO採択はlater35の登録行に固定する。

## 実bytesのpin

JSONには上記6つのauthority/PO spanについてsource revision、path、inclusive physical line range、full-file SHA-256、LF-inclusive raw-span SHA-256、bytes数を保存した。source blobの実読みで全hashを再計算した。さらにf6のL2/L11全文（それぞれ559行、287行）を検索し、`HELIXINTELLIGENCE-L2-075` が0件であることを確認した。

- 068 L2 full SHA: `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span SHA: `152bd91c5e660815f0ac6cabcfc501d527adb18973db329f95c0d16e544a02d9`。
- 068 L11 full SHA: `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a`; span SHA: `f9733900a979eebc6058056ea6b51370f4acd5b602955988985bb1dbf97b3d26`。
- 075 L2 full SHA: `592c9efe7a5e68c53d56de696080f286e4c926110775f49e46de979fe232537c`; span SHA: `c302d45ef008b8d73f71c9484c1c9e2432c8e195f23c559b513d36309cdb80f6`。
- 075 L11 full SHA: `98413d69444934e047c1bc6626257aeee95f3892c6ea53fa63b7e854878efe33`; span SHA: `b81bd9e52df97cc92f0f228fb9effab476012836e7e113b985641ea2c99ac08e`。

## 不変性

修正前のdecision recordとdelegated-decision pinはappend-onlyの過去記録として保持した。追補JSONは旧record各SHAを記録する。対象6本文は`fdb5cbfff04fb555278242065957336a6e6f21f1`の各SHAと一致する。今回の追補は親別source attributionだけを明確にし、新しい承認・要求意味・owner・scope・versionを作らない。
