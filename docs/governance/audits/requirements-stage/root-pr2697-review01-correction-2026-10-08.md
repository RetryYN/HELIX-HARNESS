# #2697 review01 証拠訂正追補

このappend-only追補は、#2697 review01（正式comment 6048009544）のMajor 1件、Minor 7件に対する証拠範囲と記録上の訂正をまとめる。レビュー対象はHEAD `75e84b2c4602dd45b20bcc32aa6064619a9fbcb2`、base `d8ba018d74b05846e0eb489ed608c2881c9937cd`。正式comment rawは7,372 bytes、SHA-256 `42fa8f571852538c925fa9d245d4f963362fa981c8df882a72dcef0497a236ef`。JSON添付には対象blobのpath・revision・byte数・SHA、API comment raw hash、84 occurrenceのJSON pointerを含む。

対象PRの証拠は当該reviewed HEADで固定した。主な固定物は、Root memo（3,345 bytes、`f61a507c2eccb322b96005e51be672c81290d959131ee6de505e9f87485ece2f`）、ce706後limited-chain MD/JSON（5,290 / 36,297 bytes、`8c8c3e…83fa5` / `9690c0…80d4`）、41-group chain JSON（15,440,560 bytes、`f40140…23bb`）、index entry MD/JSON（5,677 / 8,952 bytes、`035ec8…4139` / `4963d2…2b31`）、readscope（6,110 bytes、`f937b6…0b738`）、closure followup MD/JSON（8,205 / 78,975 bytes、`d0d6aa…9f62` / `25f863…1f971`）である。全source full SHAはJSONに記録した。

## 指摘への訂正

- **M1（Major）**：Root memoの「他の修正PRも各merge時点でRoot read-after済み」という表現は、このPR内に固定された証拠範囲を越えている。ce706後limited-chainがRoot独立post-merge proofとして固定しているのは#2696のみで、残る#2688/#2692/#2694/#2695はClaudeのmerge/read-after commentを証拠にしている。追補の正確な記述は「このPR内のRoot独立read-after pinは#2696のみ。残る4件はPR上のClaude commentに依拠する」。他の場所でRootがread-afterした可能性までは否定しない。
- **Minor 1**：元entryの「未commit記録」「Root検収済み・独立review前」はその時点のsnapshot表現として保持する。review01は完了し指摘を受領したため、この新追補の状態は「review01指摘受領・訂正追補の独立review前」とする。元snapshotのstatusは遡及変更しない。
- **Minor 2**：readscope記載の302参照は、closure追補が実測した334件（親別120＋group-level 214）へ訂正する。readscope snapshotは書き換えず、本追補から[readscope](root-274-audit-source-parent-readscope-followup-2026-10-08.md)、[closure訂正](root-274-finding-closure-followup-2026-10-08.md)、[index entry](l3-stage-274-semantic-audit-index-followup-entry-2026-10-08.md)へ直接移れる導線を加える。
- **Minor 3**：41-group JSONの17 limitation項目中、同一文 `Per-parent later target-chain projection requires a tagged condition3_claim ...` は9回（0-based index 7–15、1-based位置8–16）重複している。source配列は不変とし、追補では一意表示1件に正規化する。
- **Minor 4**：同snapshotで`source_reported_body_sha256`とAPI raw SHAが異なるのは84 occurrenceだが、固有commentは6件。API rawを別欄に固定し、元の報告値は上書きしない。6件すべてでAPI raw SHAはsnapshotの`body_sha256`と一致し、`source_reported_body_sha256`とは異なる。

| comment | PR | occurrences | source-reported SHA | API raw SHA (= snapshot body SHA) |
|---|---:|---:|---|---|
| 6042918585 | #2670 | 15 | `e028bc9b…90d9ab` | `cdae9557…e18ae` |
| 6042950159 | #2670 | 15 | `dac89a65…2e6d9f` | `a1d028de…7b099` |
| 6043087447 | #2669 | 5 | `30449f6f…f8155` | `84807974…caae` |
| 6043124045 | #2669 | 5 | `aaa4f920…eea9f` | `fa4ea83a…66608` |
| 6043108257 | #2671 | 22 | `ed809568…b816e64` | `3d00504e…a40e6` |
| 6043144570 | #2671 | 22 | `7c7282a7…21c2c` | `e90f38fb…de146` |

84箇所の親配列indexとJSON pointer、6 commentのURL・UTF-8 byte数・実測raw SHAはJSONに含む。
- **Minor 5**：「PO事後確認は未記録」は、d8ba018時点で対象としたce706後の5件限定decision revisionに限る表現へ狭める。911b896fを基点とする既存PO事後確認はあるが、911b896f基点より後に変わった限定revisionへ、その既存確認を継承しない。L10未実行もこの限定記録の時点・scopeとして記し、全体の現在状態としない。living document、decision、closureのfull SHAと対象範囲をJSONに固定した。
- **Minor 6**：review01対象HEADには`/tmp/root-pr2696-postmerge-proof.json`と`/tmp/l3-final-274-parent-roster.json`のrepo mirrorがない。現共有worktreeの2ファイルはuntracked（proof: 1,815 bytes、`df93486d…342ca`；roster: 1,274,394 bytes、`701a85ae…4a3a`）。Rootの指示により、訂正追補と同じ次commitへ両mirrorを含める予定である。未来のcommit SHAは主張・pinせず、対象HEADの欠落と追補commitでの収録予定を区別する。
- **Minor 7**：d629 indexの`roster_source.basis_main=633bf12...`はaddendumのbasisとして区別し、当該addendumのbytes/SHAを検証したrevisionはd629/ce706/d8ba018とする。ファイルは633bf12時点には存在しないため、633bf12で当該ファイルbytesを直接検証したとの主張はしない。対象addendumは1,823,772 bytes、SHA-256 `ec970df79eaaf693f8825045b235c43ea10aefa7925701b1fff2a974df3e4e0a`。

## 静的照合と限界

formal reviewが列挙したissue-commentサンプル9件のAPI response bodyを再計算し、UTF-8 byte数とraw SHAを照合した。追補JSONに9件の全ID・URL・byte数・SHAを記録する。これはサンプル9件の確認であり、全commentの確認ではない。

原snapshotやsource-reported値は変更していない。追補は証拠文言・locator・表示の訂正のみで、新しい要件、承認、gate、PO事後確認、merge admission、L10実行を作らない。旧snapshotの意味やsource audit全体を再審査したものでもない。

機械検証：formal raw SHA、reviewed HEADの主要14 source blobと補助4 snapshot（計18）、API raw comments、84 mismatch pointers、9重複limitation位置を再計算した。JSONはparseでき、6/6のAPI rawとsnapshot `body_sha256`一致、9/9のformalサンプル再計算を確認した。

23親の参照位置は[locator訂正追補](root-274-review01-locator-correction-2026-10-08.md)に記録する。同commitに収録する原本は[2696 Root proof](root-pr2696-postmerge-proof.json)と[274親roster](l3-final-274-parent-roster.json)である。
