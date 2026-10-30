# WR243 HARNESS-015 F04 L5/L8 candidate

## 状態と範囲

- Issue: #3510、work request `WR243-TDD-F03F04B01-L5L8`
- base: latest main `cf31240384980220249a4f58abe62ce57d47a880`; fixed blind source revision `988765e9be335f2a1d376721c1b11f808fd03372`
- 対象V-pair: HARNESS-015 F04のL5/L8候補のみ
- fixed blind: F03/F04/B01を含む既存source-only artifact。SHA-256 `846907d5802170ed775fbf08664c0b85f42e7b6ac0a9623e8584452f81ead813`、[Issue #3510 comment 6534177643](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534177643)
- binding: SCF-B-0208（L5 source candidate hashを登録。upstreamにscaffold pathを含めない）
- authority: `none`。承認、正式oracle、実行、受入、4way完成を示さない。

F03のL5/L8候補・fixed blind・比較・先行検証summaryとL8 canonical `unit_case_ids`／`unit_cases`は保持する。共有L5/L8 JSONへのF04 candidate追加に伴い、SCF-B-0204のL5 document SHA pinだけ現在bytesへ更新し、F03証拠本体は書き換えない。F03静的validatorはF03候補と固定証拠の検査を維持したまま、F04 candidate fieldの共存を許容する。

L8候補は既存negative U-ID 5件への短い対象・反例・期待・oracle欄のみ。全返却、fixture、seed、COPY、hash、test citation、U-ID row oracleを追加しない。L5/L8 candidate proseは日本語。fixed blindの英語bytesは変更しない。

## 固定sourceからの条件と全行比較

[`comparison.json`](comparison.json) はL3 F04、L10 F04、許可されたL4 F04 `behavior`／`output_contract`／`failure_conditions`をsource境界として記録し、比較後に既存L4/L9 negative rowを5行すべて照合する。L4/L9のcondition文は5行すべて一致する。

- `WR243-SO-F04-01`: 片方向または対象revisionが一致しないtrace。既存行0–1へ比較上対応。
- `WR243-SO-F04-02`: ④単独開発またはatomic CIからの上位状態主張。既存行2–4へ比較上対応。

このmany-to-one比較はfailure code、axis/state、owner、row oracleを定義しない。L9 pointerはsource traceであり、L8 targetはL5契約ID `HARNESS-L5-015-F04`。L3/L10 contract oracle `HARNESS-L10-015-F04` とU-ID row oracleは区別し、後者は不足のままにする。`unresolved_assignment_rule`、sequence等値の意味、failure-code語彙は決めない。

## 旧HELIXと同種失敗

- `LEGACY-ASSET-5E22432B0A5A8F7CC8B3`、`archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md:21-30`: 契約先行、Red/Greenを実証するTDD、1 behavior contract・1 ownerの原子単位。
- `LEGACY-ASSET-BD0E4DCE9725CA3612B2`、`archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-REVERSE-28-red-first-tdd-evidence.md:54-60`: Red-first evidenceが機械的に強制されなかったgap。
- `LEGACY-ASSET-93AB9941464AA413C9AB`、`archive/legacy-generation-2026-09-14/root/.helix/audit/A-114-ddd-tdd-strengthening-reaudit.md:37-41`: PLANのdraft/review evidenceが不足したまま実装が先行した失敗。
- `LEGACY-ASSET-158CE0FD538E9C1E553E`、`archive/legacy-generation-2026-09-14/root/.helix/audit/A-115-ddd-tdd-increment-closure.md:17-27`: invariant・doc/test trace・Red-first・oracle強度・negative testの実検出例。

保持するのは、実装前の契約、正方向／逆方向traceの明示、上位状態を別の契約根拠なしに認定しないこと。旧lint/runtime/test/CIをコピー・実行せず、旧sourceの規則本文を現行へ移植しない。F04の意味候補は現行L3/L10/L4から導出した。

## 静的検証と未実施

`validate_f04_candidate.py` はblind hash・source pointers、5行比較、F03証拠とF04以外の文書内容、canonical F04 IDs、L8 ownership境界、bindingsを静的照合する。`design_verification_checker.py check-child` は静的文書比較として実行する。algorithm、旧runtime/test/CI、新runtime/test/CIは実行しない。
