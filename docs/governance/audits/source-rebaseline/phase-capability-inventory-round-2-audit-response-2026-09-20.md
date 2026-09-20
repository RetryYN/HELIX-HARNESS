# HELIX全フェーズ Capability Inventory 外部監査 round 2対応

status: addressed_pending_rereview
authority_effect: none
pr: 1909
reviewed_content_sha: `f1be8b636df52eb1f2c6dd400d502c237ce1cc40`

## 入力

- Claude GUI review `RH-1909-02`／`GUI-1909-RESPONSE-02`: Blocker 0、Major 0、Minor 0、Info 1。
- 独立read-only監査: PHCAP-01〜10、PHCAP-11〜20、PR class／projectionの三分担。

GUI reviewのInfoはPHCAP-07のL10／L11代表asset不足だった。独立監査はさらに、候補製品scopeと現行証拠製品の混在、layer表記、test designとtest成立の混同、`research_premise` packet不足を指摘した。Draft解除可否は、追加指摘を解消した新HEADの再reviewまで未判定とする。

## 対応

- `product_targets`を調査候補scopeと定義し、全recordへ`current.evidence_products`を追加した。PHCAP-06／07／14／17／18／19など、候補scopeより現行証拠範囲が狭い箇所を明示した。
- current refをmain `e784fa68702af4b7c57911b866b48fe7df094f88`のSHA-256へ束縛した。PHCAP-01には承認対象の四製品L1を直接追加した。
- PHCAP-04へ要求authority runtime、PHCAP-06へdesign registry／lint実装、PHCAP-07へL10／L11／L10 acceptance designを追加した。
- PHCAP-08のgapへHARNESS L1 parent、ticket derivation統合可否、L2未適用を追加し、PHCAP-10へbootstrapで成立しない範囲を追加した。
- PHCAP-11はCI固有Scaffoldがないためcurrentを`candidate`へ下げ、旧L10 test designを追加した。PHCAP-12へL9 test designとtest source、PHCAP-16へL10 test designを追加した。
- PHCAP-13はdraft test designをsystem test成立と扱わず、`implemented_with_draft_system_test_design`へ修正した。
- PHCAP-15の`L7 plan`を`L13 plan`へ、PHCAP-19の`L11 acceptance`／最大L11を`L10 acceptance design`／最大L10へ訂正した。
- PHCAP-17はrunbookのcross-layer applicabilityを実装到達層から分離した。PHCAP-19／20のlearning／memory間の意味atom・consumer分割をgapへ追加した。
- `capability_status`をasset存在の分類と定義し、test／acceptance表記が実行・pass・confirmed・現行適合を意味しないことを明記した。
- `research_premise` classに必要な一つの判断論点、known／assumption／unknown／conflict／stale、取得時点、適用条件、限界、反例、再調査条件、返却先をpremise packetへ固定した。
- 初回projection receiptの短縮commitをfull SHAへ訂正した。

## 維持する未完了

全4,020 asset、全consumer、要求atom、unit／connection／composite、successor、正式L2／L11、L3／L10は未完である。20 IssueはOPENのまま維持し、今回のPRを完了証拠にしない。旧runtime、旧CI、旧testは実行していない。
