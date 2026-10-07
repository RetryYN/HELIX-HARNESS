# LABO Stage 5 parent063 review01 指摘の訂正追補

- 対象: PR #2694 review01（M1、Minor 1–5）、HEAD `838caee4f198a7dfe66c1137ac4c7a04ce8f512a`。formal commentは全6341 bytesを読み、本文SHA-256は `8573a207e5994b3d0db925fadf820d799f4890a9cc058237baaabfdb26ecb40c`。
- main同期後の作業基点: `b449de7d10e45e03e900da342f5bb21e19e801d3`。最新main `dddab671b034b866efeb56af8f6c0f192a06fe3f`との差分はOS文書・OS監査だけだったため、その範囲をmergeした。LABOの6本文はreview対象の同じbytesで開始した。
- authority/approval/execution effect: `none`。旧CASE実行、旧runtime/test/CIは行わない。

## 修正

1. FR:1758のtrace索引を72件（旧69件+CASE-66〜68）、正常候補6（01/02/05/07/10/67）、negative55、索引11へ同期した。11索引ID、CASE58/13の注記、独立性・意味完全性を認定しない限定を保った。
2. CrosswalkでL2:482の既存採用/実行許可を継承しない境界とL2:489の旧P4-02・HMC-BR-003・memory境界を追加した。L2:487をAC01/02/03、L2:488をAC02/03へ対応付けた。
3. L2:483に従い、HARNESSは検証契約・結果の証拠提供元、LABOはその証拠を含む効果評価主体と明記した。ownerによる変更または運用後観測の欠落は循環未完として保持する。
4. AC-02はtarget revision/applicabilityを識別できない間のunknown/open保持、AC-03は識別可能な不足の既存責務区分への返却と説明し、返却でunknownを消さないとした。
5. CASE-66はCASE-67相当の完全なsource-bound根拠を残し、success-basisの参照だけが単一green receiptになる変異に変更した。candidateのみを入力するCASE-34、手順欠落CASE-20、HARNESS receipt欠落CASE-46との違いを同じfixture行に記した。

## 根拠と監査の訂正

固定parentは`318ec4a04abb3c1cc17111b3d939f913facd5fd3`のL2:480–489（file SHA `5d939d81…`, span SHA `274ea8f4…`）とL11:225–231（file SHA `30de41e2…`, span SHA `5e7c8afa…`）。旧直接sourceは`LEGACY-ASSET-EE5DBACC7F28F7D1F605` P4-02のbaseline/pre-isolation HR-FR/HAC atom、paired consumerは`LEGACY-ASSET-44DD86E3DEC09E65EF51` HAT-P4-02:112。HMC-BR-003は`a2638477be294880ba33e215778a763caacfa6ee`の66–70。file/span SHAは同名JSONへ記録した。

旧 `labo-stage5-parent063-residual-repair-audit-2026-10-08` と `labo-stage5-parent063-main069070071-integration-2026-10-08` は書き換えていない。前者のfixture-count PASSはFV/NFRVの72 CASE実態を示すが、FR:1756の索引段落は69/5/53のまま残っていた。したがって旧PASSを六本文間の件数一致証明としては使わず、本追補はその範囲を訂正する。統合JSONの6本文pinはce706後の既存checkpoint値で、下のfinal pinsとは時点が異なる。

## 六本文pinと検証

修正前はreview HEAD `838caee4f198a7dfe66c1137ac4c7a04ce8f512a`、修正後はmain同期後の現在作業tree。SHA-256、byte数、git blob IDはJSONに固定する。FVは72 unique ID、AC distributionは01=5、02=2、03=65、index=11。normal/negative/index候補は6/55/11。NFRVに72 IDがすべてあること、case66–68の追加と他Stageのfixture保持を静的照合した。`git diff --check`、六本文SHA/byte数/blobの独立再計算、既存監査ファイル不変を確認しPASS。L10 CASE/旧runtime/test/CIは未実行。
