# 調査前提

- path_revision_pairは要求atomではなく、5件の代表relation rowは候補である。
- holdingのshared-cross-productは候補境界であり、四製品へのassignmentではない。
- archive relocation、counterpart hash一致、055のhash不一致、ledger exact hitなしは、implementation、degradation、failure、consumer closure、decision、authorityの証拠ではない。
- 旧sourceは意味・判断史・failure・consumerを調べるreferenceとしてだけ読む。旧CI/runtime/testを実行しない。
- #2010 merge後にf369e2fへrebaselineしmaterializationしたが、人間判断、正式holding採否、製品・phase authorityが未確定のため、候補を正式要求へ昇格しない。
