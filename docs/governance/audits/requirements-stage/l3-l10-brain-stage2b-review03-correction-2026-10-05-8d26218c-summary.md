# BRAIN Stage 2b #2600 review03 作成側修正

対象本文 `8d26218c2df7de73a94ce2b2f60ad83af5b83ef7` に対する #2600 review03 の作成側修正を記録する。対象はBRAIN-009、012、029。独立reviewやL3承認の結果ではない。

BRAIN-029では、製品固有requirement・screen・具体API・permissionの欠落や汎用候補への混入をHARNESSへ返し、選択済み製品Core sourceそのもののidentity/revision/provenanceだけを製品Coreへ返す境界を明示した。知識意味・適用条件・relation・候補構成の戻し先は固定L2が列挙するBRAIN L1-003/005/009に維持した。

BRAIN-009では、candidate作成と後続の昇格条件を分けた。candidate生成だけで即時昇格させず、候補作成前にLABO評価・OS登録・独立検証を要求しない。昇格は固定L2-025のLABO評価→OS登録/振分け→BRAIN変更手続き内の独立検証→既存採否経路に従う。検証caseは各未完状態と戻し先を独立にした。

BRAIN-012では問い合わせ側の必要知識領域input欠落と、BRAINの応答field欠落を別の状態としてAC/CASEへ結んだ。Stage 2b対象列挙も001–006および009–012に訂正し、Stage 1の007/008を含めていない。

固定根拠はf6dad2a33e24f000b87d7f09b8d40288257e74ccのL2-025、L2-018、L2-029、L2-012およびL11該当箇所。各sourceの全体SHA、物理行範囲、raw-LF span SHAと、本文の修正行literal/hashは同名JSON監査に記録した。6文書すべての承認済main prefixはbase `2e9e9f2267aab50bc1c22e3b3ca9c9d0ce808832` とbyte-identical。

旧監査は変更していない。新監査は、98b2d2a5 worker記録内のm11/m12戻し先の不一致、m2/m8修正が98b2本文ではなく後続5e5a2701本文に入った履歴、前回root correctionが029 C10–C12残差を明記しなかった点を訂正している。

検証: `scfctl validate` は147 bindings・fail 0、`stale=0`、`residuals=0`、`govcheck` はatoms 7622 / requirements 57 / files 58でPASS。6本文のprefix一致、変更行pin一致、表行の幅を確認した。旧runtime、旧CI、Bunは起動していない。PR更新・push・Ready化・mergeは行っていない。
