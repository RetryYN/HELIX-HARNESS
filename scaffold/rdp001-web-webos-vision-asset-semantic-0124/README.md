# SCF-B-0124 Vision 35 × legacy asset 12 semantic research

固定BASE `1cfe3895d861e0cd1533fde08688a9f81f557645` で、SCF-B-0080／0081／0084／0088のVision 35候補と代表旧asset 12件をcandidate atom単位で静的照合する研究用Scaffoldである。#2073のmain統合commit `cb5a45fea289d61b67cba100fd2406813021ef48` にあるWeb L1 6＋Web-OS L1 5のanchor候補をblob `8d034128cc09a3b2c03abcfe31e89f8719ca170b`・digest `0c00dfa823ac0302e3ab496f9b5c264c18d8239a679ff99bb9c8515744bb64fe` とともに入力として、製品境界candidate-onlyの接続可能性を保持する。

候補35件はexact source span／ID／digestを保持し、phase connection 0/35、asset semantic link 0/35、formal requirement／phase／product authority／implementation／degradationは生成しない。製品固定候補はWeb 13、Web-OS 14、製品未解決8。未解決8はU18／U19／O05〜O10であり、L1接続を確定しない。

`asset-matrix.jsonl` は35×12=420 pairを、source digest provenance、source path／digest反証、asset-level candidate-only relation、history／failure／consumer／decision不足へ分ける。shared source digestは意味linkではない。12 asset全件について、candidate atom IDへの明示link、read-after、dedicated failure、decision、consumer closureは不足している。総当たりpairを成立扱いしない。

## 検証

```text
python3 scaffold/rdp001-web-webos-vision-asset-semantic-0124/generate.py
python3 scaffold/rdp001-web-webos-vision-asset-semantic-0124/validate.py
python3 scaffold/rdp001-web-webos-vision-asset-semantic-0124/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは固定BASE、親4束／Vision source／12 asset source、#2073 anchor digest、承認decision digest、35 candidate set、420 matrix cardinality、phase／asset／authority boundaryを独立照合する。#2073の11行はraw metadata（draft／awaiting_parent_approval）とdecision effective approved（HDEC-HELIXWEB／HELIXWEBOS-L1-01）を分離し、研究candidate authority noneを確認する。selfcheckは18負例を期待error codeまで確認する。L1 merge commit祖先性とblob固定の改変も専用error codeで拒否する。旧archiveは静的bytesの参照のみで、実行しない。
