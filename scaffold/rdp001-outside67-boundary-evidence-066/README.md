# outside67 candidate research (030/033/043/045/055)

現行origin/main `dbcc0f332704302d2f8181479552e7198f102db7`へ明示的にrebaselineしたbranch worktree `research/outside67-next-candidates-066`（#2010、#2013、#2014、#2015のmergeを確認）で、MPR-SH-OUTSIDE67-001の未レビュー候補5件をsource/anchor単位で静的保持するresearch Scaffoldです。#2010の既レビュー7件（008/011/059/063/064/065/066）とはID・pathを共有しません。12/67の候補研究会計を独立検証し、SCF-B-0066へ登録します。正式holding採否、PR、正式要求、successor、ownerは確定しません。

030/033はpre-isolationからarchiveへのpath relocationを含み、043/045はpre/archive byte-identicalかつ現行counterpart hash-equalです。055はpre/archive bytesは同一ですが、現行counterpartのfrontmatter pathが変わっておりarchive hashと不一致です。この差分を観測事実として保持し、semantic equivalence、authority、implementation成立、重複解消は推論しません。

source rowsはAICR/CICR/NIO/FRS/LARのrelation・failure・consumer・decision候補を含みます。legacy ledger 7ファイルのsource path/ID exact hitは0件、holdingのcatalog recordは0、human decisionはnullです。implementation/degradation/authority/failure/consumer/decision/phaseはunknownとして保持します。

今回の検証幅は5 source path_revision_pairです。安全なbatch上限は断定せず、次候補ではsource chainを独立確認します。現行mainへのrebaseline、ancestor/materialization、source digest、validator、自検査まで完了しています。SCF-B-0066へresearch Bindingとして登録済みで、PRは未作成です。正式holding採用・正式要求は確定しません。