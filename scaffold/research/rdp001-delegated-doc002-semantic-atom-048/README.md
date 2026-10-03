# RDP-001 DELEGATED-DOC-002 semantic atom candidate

これは旧委任文書 `DELEGATED-DOC-002`（`github-atomic-development-requirements.md`）を、旧sourceの意味を落とさずに静的なsemantic atom候補へ分解するscaffoldである。要求採否、successor、現行authority、owner確定、L3/L10/L11 freeze、実装、consumer closureは生成しない。

固定sourceは archive commit `5fcdc80f23c0fb3e959293b9fbd751fa31eeb792` の `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-atomic-development-requirements.md`（133行、11059 bytes、SHA-256 `52af19a483d6222f31d1d52031482fc60c62c504fe97496687d8175aa7a53756`）である。source holding 114件の分母からDOC-002一件を選び、metadata・目的・6整備基準、FR024〜028の独立契約／拒否条件、NFR、AC、freeze／PLANを49 semantic atomsへ分けた。見出し・空白など21 residual linesもdigestで保持し、原文漏れを作らない。FR024のowner／ID拒否、FR025のperformance receiptとNFR009/010など、同一source fragmentを複数の意味単位が共有する箇所は3件の`shared_source_relations`へ記録し、単純な行分割と区別する。参照edgeはDOC-002に属する `DELEGATED-REF-0301`（pair artifact、line 9）と `DELEGATED-REF-0302`（本文参照、line 130）の2件を台帳と同一内容で保持する。

四製品候補（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）を分母から除外せず、owner／consumerの直接確定はしない。asset phaseは `PHCAP-11`／`PHCAP-18` の候補、legacy implementation・degraded・failure・consumer・decision historyは未確認またはpendingとして保持する。asset dispositionはHistorical／unresolved、asset consumer_refsは空、対応するappend-only decision／copy-read-after／observed failure ledgerは見つからないため、source条件からclosureを推測しない。

既存 `scaffold/delegated-doc-002-013-004-029/` と `SCF-B-0010` はDOC-002/013/004/029のL3/L10 pair候補である。この候補は既存artifactを変更せず、`scaffold/rdp001-delegated-doc002-semantic-atom-048/` と `SCF-B-0048` をDOC-002単体の細粒度候補として束ねる。両者のDOC-002 source blob／edge／原IDの一部が共有される一方、B0010はDOC-013／004／029とpair parityを扱い、B0048はDOC-002の契約単位を扱う。粒度差分と将来crosswalkは未解決relationとして保持し、replacement、二者択一、採否、authorityは生成しない。

検証は静的な固定blob・holding・asset／phase ledger・現行4製品境界の照合だけである。旧archiveのruntime、test、CI、hook、adapter、GitHub、DB、Issue、PRは実行・更新しない。

検証器は49件の`normalized_statement`本文をvalidator内の独立canonical定数とdigestへ照合し、candidate kind、original ID、owner／consumer候補、actors、authority／negative conditions、shared relation reasonも一つのsemantic ledger digestへ束縛する。`product_boundary`、candidate resolution、review limits、coverage policy、closure guardの意味fieldを独立pinし、inventory全階層のrecursive keysetを固定するため、本文とdigestの同時改変や`authority`／`accepted`／`merge_admission`などの未知nested field追加をfail-closeする。

selfcheckはno-op baseline guardと期待error code付き43 negative casesを持ち、normalized text／digest同時改変、semantic field、shared relation reason、product allocation、review／coverage／closureの意味反転、recursive keyset違反を検証する。


```text
python3 scaffold/rdp001-delegated-doc002-semantic-atom-048/validate.py
python3 scaffold/rdp001-delegated-doc002-semantic-atom-048/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validator/selfcheckの合格は、意味同値、要求採用、現行authority、実装、受入、CI、release、consumer closureを意味しない。
