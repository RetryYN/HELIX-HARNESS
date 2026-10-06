# LABO-069 起草時点の静的照合監査

記録日: 2026-10-07。対象本文: `bf5695526e203e03c591c60a21f5448579d6e914`、base/parent: `a1bcdba15b4c10271d80291dc6062cf31250cf3e`。この監査は追記型の時点記録であり、canonical本文・authority・承認を変更しない。

## 対象と入力

WT HEAD `bf5695526e203e03c591c60a21f5448579d6e914` / parent `a1bcdba15b4c10271d80291dc6062cf31250cf3e`。状態: `## l3-labo-stage5-parent069...origin/l3-labo-stage5-parent069`。

- `/tmp/root-labo069-six-suffixes-candidate.json`: 77951 bytes, SHA-256 `2bd1194178639e2d64b7155202d24a68e5a0b81354ecf282c698d62ab9c87311`
- `/tmp/labo069-six-document-markdown-suffix-candidate.json`: 76584 bytes, SHA-256 `d0d9464fb7ed1d5b0dd1eec9f790f2bb6208dfab9834bc5cb5fd4e58ee5dd1ac`
- `/tmp/labo069-authoring-preflight-worker.json`: 88617 bytes, SHA-256 `f8dc01ecae6f7aaa05027089349f866f63125cf193ac7865d870bb85fa62164f`
- `/tmp/root-labo069-body-checkpoint.json`: 2491 bytes, SHA-256 `2924e64b420cfb7ac9495d7b9f8fdcc2cd53991a92d6f2783d1a57188861343f`
- `/tmp/root-labo069-old-case-literal-checkpoint.json`: 79 bytes, SHA-256 `bfccf0ff6b255ee27c36a1eb3b2b0f6fd1be812c271b7ffc63eebfbe480cdbc8`

## 六文書の物理suffix

各ファイルは対象bodyの親revisionの全bytesをprefixとして、body revisionの末尾suffixを物理的に抽出した。checkpointのsuffix/full hashと一致した。Root埋込suffixは全6件とも末尾LF 1 byteがなく、Worker埋込suffixは6件ともbody suffixと不一致。候補埋込データは中間時点metadataとして保存し、現在値として採用していない。Root/Workerのscope metadataはmain baselineを`e015c347...`と記録する一方、対象body parentは`a1bcdba...`。この2 revisionは同一視せず、今回の物理抽出はbody parentとcheckpointに基づく。

|文書|suffix bytes/hash|full hash|Root埋込一致|Worker埋込一致|
|---|---|---|---|---|
|`docs/helix-labo/L3-requirements/functional-requirements.md`|3998 / `dcd3af542b64b12a06a75007e8abfaa28bba3ce14e17f6ea4c9de9bff7674335`|`12429a06e1682fb339b6d5033db06e5c5f3b04bd9eef66e46b6133038649e06f`|False (3997 bytes)|False (3922 bytes)|
|`docs/helix-labo/L3-requirements/business-requirements.md`|752 / `f28a577377c4c3618e068a6752c29367ac1855bd625aa240f3067f3f68738dea`|`74b1035da0ed803aa3d8885f4903cce2ba13aea76890b590698194e6dcf5511f`|False (751 bytes)|False (737 bytes)|
|`docs/helix-labo/L3-requirements/nfr-grade.md`|1797 / `5f46397c3a46c9b0e8de2565b64ffc8e71118c78f1520755ac4262a6ed398fcb`|`f2294e3f4b809269cf629e18857e3290d70327f756c99b242bf762761dafdd48`|False (1796 bytes)|False (1782 bytes)|
|`docs/helix-labo/L10-verification/functional-verification.md`|14069 / `6f431c37b61a94fcb7902032c321a237ba3f829eb0b40ea4113959101bf9050b`|`983ddbd879aa2bb301e8d0007c91f2043a5188cbf573c60f834ef1bb497940c5`|False (14068 bytes)|False (13006 bytes)|
|`docs/helix-labo/L10-verification/business-verification.md`|1156 / `759e805e542d1449ff5510d88a8e2c6448764bcdce1be645a596fbd76968adb1`|`f52e2af9f8c05c5401eba807eccc78db8b1cb76dacc00059954ef309b92c292c`|False (1155 bytes)|False (1141 bytes)|
|`docs/helix-labo/L10-verification/nfr-verification.md`|1897 / `683762b432726e124a912203b933f040337b9840c292411390b9cbdd14c6f394`|`61334283b6bce2746f7af99f900e2b5eb10e3c2e4d9a7cef4487a25bb44dc870`|False (1896 bytes)|False (1882 bytes)|

Root/Worker埋込suffixとの非一致は各suffixごとにJSONへ共通prefix/suffix長と中央byte列の長さ/hashを記録した。修正候補の扱いを意味評価へ拡張せず、差分は物理不一致として記録する。

## 固定親とPO

- l2 `318ec4a04abb3c1cc17111b3d939f913facd5fd3:docs/helix-labo/L2-requirements/labo-requirements.md:552-559`: full `5d939d814f0aca2fa4bdde89f09c68428ef434e8c9b662f5bd3c546533897ae9`, span `605acfa9ec39bbdc0d964f3bf3c644122f1c081c202ddea48fe682ac31be5bc9`; full/span/literal match=True/True/True.
- l11 `318ec4a04abb3c1cc17111b3d939f913facd5fd3:docs/helix-labo/L11-acceptance/labo-acceptance.md:288-295`: full `30de41e2361405f3598e3ee511bfec1b51e47514af4de3e6c480c2a068073de0`, span `d1cc8c180bab90b84ef6300bf91c79d622cff416a596131fe0b1843fd6aa61db`; full/span/literal match=True/True/True.
- PO row 84 `048a1770d10f5a1f24f7cf0a95f43dfdc318591d:docs/governance/decisions/po-decision-2026-09-29-57candidates.md:84`: raw line `d2fcd71739876ef48716f86a04e8070ccca7c921f70d32952ee5c8eee7e9953a`, file `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`; exact literal match=True.
- Registration 001 `318ec4a04abb3c1cc17111b3d939f913facd5fd3:docs/governance/management-provisional-requirement-register.jsonl:577`: raw line `a7cea852f4ef1771c39e02abf15e3660c5a70e495b88bd71744b6398c493a1e4`, exact literal match=True.

## 旧36定義と現在のFV定義

旧snapshot `a4a365dcdfe824ebb28d040c8bc3bc924556efad:docs/helix-labo/L10-verification/functional-verification.md`: 36 old definitions; source literal/hash matches=True; all old IDs present in target body=True; original old bullet literals are retained as pinned snapshot evidence, not byte-for-byte current table rows. 各ID・物理行・literal・LF付きraw SHAはJSONに全件掲載。

現在のbody `bf5695526e203e03c591c60a21f5448579d6e914` のFV表は物理行から46定義を抽出し、IDは一意=True。Root候補とWorker候補に埋込まれた44件は中間inventory。bodyにはCASE-41（target_changed）とCASE-42（placement_changed）があり、現時点の実数は46。両行raw SHA: `45646d5f1df31455d040d2c32cf11aba8252b84fcd32946be5fc9f31733bb1b7`, `ba2c95d529b16923058bc89b6edb0edf9815bee341c44c294495a5f0322cdf8c`。全46行のliteral/hashはJSONに記録。

## 旧source・consumerと旧L3起点

選択済みpost-close source、count-reduction source、paired acceptance consumer、feedback lifecycle context、登録atom/ledger行を指定revisionのfull bytesと行/spanで照合した。範囲は選択記録のみに限定し、archive全体のconsumer網羅や不在を主張しない。

067 RootRead pinを起点に旧generic L3定義のREADMEおよびfunctional-requirementsから選択lineを実読・pinした。L1→旧L3のFR/AC detail、FR/AC/NFR-grade文書と下流pair/gate構成を歴史sourceとして記録した。旧L3/L12番号、旧gate/autonomyを現行権限として移植したとは扱わない。全source line hashはJSON。

## 検証と限界

静的bytes/source/prefix/suffix/ID/literal照合のみ。fixture実行、独立review、POのL3意味承認、実装許可はこの監査からは確認も生成もしない。物理件数は対象revision上の定義数であり、要求完全性の証明ではない。

