# LABO Stage 2b残22親の個別L10 fixture補正

authority_effect: none  
body_revision: `e5d36a7491f7cddcf414e9d6cc4950ff58820a22`  
状態: 候補。Root検収・独立review待ち。L3承認、実行、release、業務完了を生成しない。

Root部分検収が見つけたL10単独fixture不足へ、22親に64個の独立合成fixtureを追加した。各fixtureは変更する入力条件を一つに限定し、固定L2が指定するsource/ownerへ戻す期待oracleを記載した。C02/C03の既存集約familyやsummaryを単独negative件数へ算入しない。

補正範囲はunknownの成功化、分類軸/条件/意味の混同、目的逆転・制約除去、target/rule/source/contract版欠落とstale、counterexample保持、assignment/receiptの対応、permission/scope不明、authority write移転、source trace、cancel/interrupted、Bench水準/unassessed、選択source閉包と再閉包である。HELIXLABO-L2-028では、L2-006のexperiment identityとtarget versionを同じresultへ束縛する正常fixtureおよび各不一致負例を分け、receipt戻し先とresult source戻し先も分離した。L2-058は複数selected sourceの正常閉包、閉包欠落、sourceの追加/削除・operation/scope/契約版変更後の再閉包、permission unknown、receipt stale、安全依存、unselected観測成功化、単一call passからall-source 1.0を推定する誤り、外部2.0混入を個別化した。

機能FRの各親ACへCASE索引を追補し、NFR候補とNFR検証表へ64 IDを親別に同期した。固定L2/L11に独立business outcomeがない既定を保ち、BR/BV/BCASEは追加せず機能AC/L10へのtraceのみ明記した。採択状態、意味、owner、scope、versionは変えていない。Web展開後の内容も1.0へ前倒ししていない。

検証では現行main `5acae384305b01d10e88eeb2e6406f847baf66df` が持つ6 canonicalの指定prefix bytesとSHAが全件一致した。固定L2/L11/PO/G0の全file SHAと22親のL2/L11/PO spanをGit objectから再計算し一致した。旧親別source pin 75件もGit bytesで再照合した。以前の記録でUIL-R-02の26–31行を意味根拠に使った誤locatorは変更せず、根拠となる実本文43–57行を別pinとして訂正した。64新CASEは一意で、FR AC・NFR grade・NFR verificationにdangling参照はない。`git diff --check`はpass。

固定根拠、全source pin、各CASEのfixture/oracle/current line pin、6 canonical SHA/prefix、旧時点記録との関係と未確認範囲は[JSON監査](labo-stage2b-remainder-root-case-correction-2026-10-06.json)に記録した。本文は `e5d36a7` にcommit済み。旧本文・監査は変更していない。実fixture実行、CI、独立review、PO確認は未実施。
