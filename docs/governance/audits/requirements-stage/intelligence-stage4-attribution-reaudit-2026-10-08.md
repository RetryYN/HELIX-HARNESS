# INTELLIGENCE Stage 4 委任帰属訂正と現行本文の再照合依頼

- 作業基点: `origin/main` / `74e82abff8f06d390ea8727966fd3169864a79f0`
- 隔離worktree: `/home/tenni/.helix-worktrees/intelligence-stage4-attribution-reaudit`
- branch: `codex/intelligence-stage4-attribution-reaudit`
- 対象: HELIXINTELLIGENCE-L2-017、030–041、044、045のStage 4 L3/L10。対象6本文は下表の現行全文revision。
- 権限効果: `none`。本記録は過去判断を変更せず、現行本文へのL3承認を作らない。

## 帰属の訂正

PR #2612の旧条件1根拠として記録されたcomment #6003660688は、実際にはClaude/Fable 5.1のreviewであり、Opusの`no_findings`ではなかった。comment本文自身がOpus側と称していたものの、モデル帰属が誤っていた。したがって旧判断記録に記載されたOpus/Fable一致は成立根拠として使えない。

Opus 5.5の正式な再照合comment #6039142543は、旧本文revision `8227416bc6abc97ee1a02963dd47c676ce5f5623`、HEAD `976d2a2bf12dabd105c1e5db72edfe9f36aeea3e`、base `1a7933157`、固定親 `633bf12ea8f948db8ba3d6600179c4a9507377a7`に対する結果である。対象はL2-017、030–041、044、045の15親。commentは当時の本文についてMajor 0／未確認範囲0とし、残余として033-04aの最終宛先、044の戻し先にBRAIN knowledge ownerを含めた点、NFR 100%候補の記述を列挙した。これは旧本文だけのOpus判定であり、旧Fable見解を今のrevisionへ持ち越さない。

実際の両comment本文、URL、作成時刻、byte数、UTF-8 SHA-256は対応するJSONに全文固定した。旧decision record `helix-intelligence-stage4-l3-l10-po-decision-2026-10-06.md` は変更していない。

## 旧判断と現行本文のrevision照合

過去のdecision recordが対象にした6本文SHAは、旧本文revision `8227416bc` の実blobと6/6一致する。現行mainの6本文SHAはそのいずれとも一致せず、完全一致は0/6である。このため旧Opus結果・旧Fable結論は現行本文の判断根拠として継承しない。

| 文書 | 旧decision対象SHA | 現行main SHA | Stage 4スパン位置 | 現行Stage 4スパンSHA |
|---|---|---|---|---|
| `docs/helix-intelligence/L3-requirements/business-requirements.md` | `f8c5ef63ec7af57303e5ddac90f9042d28a0fbec21b963e6424c58d9f61df6b5` | `989dce01d43479c2dfba31f673c1045f9c039f5ad7cffdfd8652b4008a0581f5` | 45–68 | `b74bd443eed6abf3285e4ac922b7af492aae853a97cfb5915f4ed8a9f1c424a0` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `1fb1b928e91c060a4f45061d743f32cb9a528f726bb12555d0489376cc0c647e` | `86a3f1e08d0345686755356426f86a866cbd9018824f13cc593b339b9f415321` | 118–299 | `1aec222c3a99687e700babcb2c3203e66800b224b7ad3d41b534a6535e603ae5` |
| `docs/helix-intelligence/L3-requirements/nfr-grade.md` | `d17dcaf9e5b69121200874e6183ed2e3e1d54467d01954fb948cf9ec811123bb` | `31d9c9d3ce0bc82a6c0ed33758dc43c01a9f56d08abd3e4e7368ce7d9cf5f9bc` | 62–174 | `eac82e012d078df332cd90873323ca513dcf0c32ec1dda51a633743797c316a0` |
| `docs/helix-intelligence/L10-verification/business-verification.md` | `a7f96a9feb279af62d746ee8f9ef372f557256d8f7126df017c4d429ce844795` | `218537c593876ef23f98ba8d729005e299dbc31894e42e87ea05ef2daf8bb100` | 49–72 | `00cc54e7f1415e7354f7ea89f9676638cae3935b4b9360a2e73cc97397a55599` |
| `docs/helix-intelligence/L10-verification/functional-verification.md` | `28b7feee18ec722a6f48b205ca5986fd5f79c9b5af7554481d7add54c4e25d23` | `baecb44fd82be4814cd4c2d77ad94e911a2b5b240c961dc4a0de0c1cc7dc1c92` | 224–1325 | `30bf6ab194d6c333d757d73f7134e595b1a9b3ecb09fd7ddd7b50ef29f28e996` |
| `docs/helix-intelligence/L10-verification/nfr-verification.md` | `17a453efcc7f5a85fa67051c8f3bed2b22496b78916d21a89cf07977d5d2b3d4` | `c4fa2eb132472bc3968c0a28c1db0a034332131c40a7c1b24c95c77ea9f97006` | 60–88 | `a985ba080ab884b5534e396fc498b6a31b86cebb3d7e9cb1ed3bca091ecee48d` |

現行のStage 4本文スパンは、旧review対象の対応スパンと比較し、末尾の追加空行を除けば6/6同じbytesだった。差分は各文書全体の後続追補・追加であり、この局所的な一致は現行全文のreview、Opus/Fable一致、承認を意味しない。L3 NFRと対L10 NFRのStage 4 coverage CASEはそれぞれ現行Stage 4位置を指定している。L10の実行や測定はしていない。

## 固定親・旧sourceの照合根拠

固定要求基準は `633bf12ea8f948db8ba3d6600179c4a9507377a7`。そのL2原本 `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` の全文SHA-256は `592c9efe7a5e68c53d56de696080f286e4c926110775f49e46de979fe232537c`、L11原本 `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` は `98413d69444934e047c1bc6626257aeee95f3892c6ea53fa63b7e854878efe33`。JSONには対象15 L2親それぞれのsection hash、L11基本表92–108、R2187-01の該当行範囲と行locatorを固定した。

親の意味は、L2本文の個別接続条件とL11基本表/R2187-01を正本に照合した。全15親のL2 sectionおよびL11基本表は、owner・source/revision/scope・戻し先・禁止されたauthority移動を確認する基準である。後続のStage 5候補をStage 4へ混入しない。

旧HELIX起点は旧L3 pillar FR/AC定義と対のacceptance test design。親固有の補助sourceは旧system-synthesis requirements/acceptance (017/030/038)、universal workflow requirements/acceptance (031/044)、design registry・document-authority census (032/033/041)、HELIX-Bench evaluation (034/040)、resident-lane orchestration (035/039)、security capability broker (036)、worker common contract (037)、Bugbot generation (045)。既存のStage 4 publication auditが記録した旧source span 25件を実blobと照合し、25/25のsource SHAとspan SHAが一致した。保持・再導出・置換の親別判断は同auditを参照し、本監査は書き換えない。

旧共通L3定義は要求をFR/ACと対の検証oracleへ分解する形式だけを再導出する。旧ID、旧runtime、approval、CI/CLI、route/DB authorityは移さない。親固有sourceは現行L2/L11の意味とscopeに限定し、旧項目全体の採択を主張しない。

## 現行revisionへの再照合依頼

Opus 5.5とFable 5.1に、上表の現行全文6 SHAとStage 4 spanを対象に独立再読を依頼する。固定L2/L11のrevision、旧source pins、対象15親、Stage 4範囲を同じ依頼に含め、各モデルが現行本文に対する所見・未確認範囲を明示する。過去Fable commentの結論と過去Opus no-findingsを現行本文の結果へ再利用しない。依頼文はJSONの `new_reread_request` に固定した。

今の作業範囲では限定修正に値する具体的なStage 4意味欠陥を確定していないため、本文変更案は出さない。現行本文に対する新しい独立読解がまだないことを未解決として残す。実装・実行・L10測定・runtime/test/CIは未実施。

## 検証状態

- 旧レビュー対象SHAは実blobと6/6一致。
- 現行mainの全文SHAは旧decision対象と0/6一致。
- 現行Stage 4 spanは旧review対象spanと末尾空行を除き6/6一致。
- 固定L2/L11全文とsection/row spansをrevision `633bf12...` からpin。
- 既存Stage 4 auditのlegacy source pins 25件を実ファイルで再計算し25/25一致。
- GitHub formal comment #6003660688、#6039142543を実取得し全文・SHAを保存。
- authority effect `none`。新しいL3承認は未生成。
- runtime/test/CIは未起動。`git diff --check` 等の文書静的検査は作成後に実施する。
