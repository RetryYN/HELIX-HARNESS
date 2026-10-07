# HELIX-OS Stage 3 parent 040 review01 Minor 1–3 補正記録

## 対象と根拠

この追補は、`#2682` の正式review01 comment `6045454030` に対する、採択済み `HELIXOS-L2-040` / `FR-OS-L3-040` の限定補正を記録する。comment本文はAPIから全文取得し、5204 UTF-8 bytes、SHA-256 `119d2bde6e3149c59e2d3d292fd749af92eb95f6dcf6644fb1bdb51ef2233c5c` を確認した。変更前の対象6本文は `cc893eb2ec371f0cad654dca4128716efda16d29` の実blobである。

固定親は `633bf12ea8f948db8ba3d6600179c4a9507377a7`。L2-040全体は `docs/helix-os/L2-requirements/governance-requirements.md:1125–1134`（親全体 SHA-256 `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a`、span 3403 bytes / SHA-256 `a5ba2bdca6bfc8adcf3216f523e882b53898d0a0424b886c1a5a6885542c3aee`）、L11-040全体は `docs/helix-os/L11-acceptance/governance-acceptance.md:732–743`（親全体 SHA-256 `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`、span 2296 bytes / SHA-256 `2fdcdc32156561d4b9f9931ee20194bf39b297ff96d477e58ff0d48c3abe232b`）。L11が固定する適用中policyの「初回attemptを数えるか」「対象となる失敗の範囲」「同一episodeの累積」を、要件・oracleで同じ入力意味のまま扱う。

旧sourceは `LEGACY-ASSET-3A15E5645D2D2A59DFF5` の `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:240–242`（全体 SHA-256 `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`、span 394 bytes / `e0eb944d58ec0a4cedd2515c537089b92a817c0f3903580728b8423968d2bfe1`）と `LEGACY-ASSET-BE8B151A0094B754FF20` の `execution-ticket-acceptance.md:43`（全体 SHA-256 `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`、span 83 bytes / `870ad165536e0233a5124db170f349386e7355fad08edca2b91795c28cd42b5e`）。前者のdurable attempt event・既存policy・resume時の非初期化・別budget分離、後者の上限到達時のtyped Recovery/Backflowという保持点を再照合した。旧分類や新しい上限値を導入していない。

## 補正

- Minor 1: `CASE-OS-L10-040-07j` を追加した。初回を数えない既存policyで正しい累積がN-1となる正常状態を固定し、集計側だけが初回eventを誤算入してNと読む単独変異を作る。N-1なら次の同scope retryを許可し、誤算入によるpremature typed routeを拒否する。既存07gの反対方向（初回を数えるpolicyの初回eventを集計から落とす）も保持した。
- Minor 2: 07gに正しい現在累積Nを明記した。07iに、正しいN-1の場合は同scopeの次回retryを許可する正常oracleを追加し、対象外failureの誤混入によるN判定とpremature route拒否を別fixtureとして維持した。
- Minor 3: FR AC-01とNFRVの初回使用箇所を、固定L11の文言「対象となる失敗の範囲」へ対応付けた。failure classの新分類・owner・threshold・gateは追加していない。
- 040のFR/NFRとFV/NFRVを同期した。BR/BVは040の機能要件・retryを回復成功と数えない既存境界を維持しており、CASE詳細の追跡を持たないため変更不要と確認した。036を含む他parentは変更していない。

## 本文pins

| 本文 | 変更前 SHA-256 (`cc893eb`) | 変更後実bytes SHA-256 | 状態 |
|---|---|---|---|
| BR `docs/helix-os/L3-requirements/business-requirements.md` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | 不変 |
| FR `docs/helix-os/L3-requirements/functional-requirements.md` | `55d68c119464756b1374be9a80dd1877ec5f6465c566915b3389bfab8cf96826` | `c2a11a70ccc7ad5af41eae92b3c690869c6e7e35fc22d2019b9287c980901731` | 040 AC-01のsource語彙を明示 |
| NFR `docs/helix-os/L3-requirements/nfr-grade.md` | `9d822aaefe3aece34ffa6c8c08bfa52946f4f4ca476ed54256ebbae01c269eb4` | `c815ea15001b7148a8b3257c36c2fb8a18cb19c035d0ef14f953ab9e993acacd` | 040 oracle traceのみ |
| BV `docs/helix-os/L10-verification/business-verification.md` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | `f785e13aa9a1ef8494154f03e20d0582418916281c51a6b729d385d5b66ef051` | 不変 |
| FV `docs/helix-os/L10-verification/functional-verification.md` | `9b1ec9f20ef7b81a7267c9721b5f5a7f62c03c3237969cca0c9a006f9ebe4b10` | `784b314d8425a26551a37951f777531570f287c87aef326d6ef751b521ad1822` | 040-07g/i/jのみ |
| NFRV `docs/helix-os/L10-verification/nfr-verification.md` | `2b06afe1715a28705c3963b0eb017311e020333510a49730fedcf653b0b715c1` | `bd98bf3265c74d5ddddd879b4f87d4eaec9343bf63ee377950c63f32fb47e868` | 040 traceのみ |

## 検証と限界

6本文のbefore/after実bytes SHAを計算し、diffで040以外の親が変更されていないこと、CASE-040-07jが一意でAC-02に結び付くこと、NFR/NFRVが07g..07jを参照すること、L2/L11/旧sourceが不変であることを静的に確認した。`git diff --check`も通過した。fixtureやruntimeは実行していない。既存audit `os-stage3-040-counter-semantics-2026-10-08-5857c0a.md` はSHA-256 `65d15ff0218fd1fd22cdf56b51349fc3bd304e93e6eebd276f8de167d56957d0` のまま保持し、今回の補正をこの新追補に記録した。
