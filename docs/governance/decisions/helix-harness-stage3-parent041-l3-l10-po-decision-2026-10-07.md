---
title: "HELIX-HARNESS Stage 3 親041 L3/L10委任承認 decision record（2026-10-07）"
decision_record_id: HDEC-HARNESS-STAGE3-PARENT041-L3-L10-DELEGATED-2026-10-07
decision_status: recorded
decider_role: PO（委任：Opus・Fable一致）
decided_at: 2026-10-07
recorded_at: 2026-10-07
review_base: ceda1c53b53c53fffb8c23f394add1f2b809deb1
reviewed_content_head: 4219c51f134b8c82f58007700d5958e859a56155
reviewed_content_revision: 70312c37561950bbf77e0d31f1a998807310bc86
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-HARNESS Stage 3 親041 L3/L10委任承認

[L3/L10承認の委任PO判断記録](l3-l10-approval-delegation-po-decision-2026-10-05.md)と[GitHub上流運用モデル](../github-upstream-operating-model.md)に従う。対象は採択済みHARNESS-L2-041、`MPR-RC-HARNESS-L2-041-003`、Stage 3のL3/L10 pairである。

## 委任判断の根拠

[正式review08](https://github.com/RetryYN/HELIX-HARNESS/pull/2637#issuecomment-6024250310)はreview base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`、content HEAD `4219c51f134b8c82f58007700d5958e859a56155`の同一対象について、Opusの独立reviewをMajor 0とし、Fableの結論を「承認してよい」と記録した。formal bodyは4563 bytes、SHA-256 `25cf4e37582d0f2fd196acc1a6736f2bb2dd865f4d7dba2d45f2795ebb16af5a`。formal reviewは、Fableが固定親と6本文を読み、review対象の同じ本文revisionを評価したと明記する。OpusとFableの両判断はこの正式commentに記録されている。

本判断記録はformalの条件1・2とmailboxのno_findings・未確認0の報告を対象HEADに結び、六本文の実blobをRootが再計算して一致を確かめた。記録追加後のHEADをreview側が独立に読み、引用・固定親・残余原文と六本文不変の条件3を照合する。その照合後に作成側がReady化し、review側が最新baseとmerge admissionを再照合して明示mergeする。本記録がmainへadmitされるまでauthority effectは有効にならない。

## 固定親と採択条件

固定親は記録用main `5aa100319361b0cc86edd3c51815ec777d55410a` のL2/L11である。PO判断記録の採択行は採択判断記録revision `b0b0719dfe786370e9bee48c5d2f753710546b6f` の11候補記録27行である。

| 固定本文 | 範囲 | full SHA-256 | raw-LF範囲SHA-256 |
|---|---:|---|---|
| `docs/helix-harness/L2-requirements/product-requirements.md` | 957–968 | `45955ffba1293b603f3c513ec1e9e328dd7bcf24b038463eb20dd480d1dc2108` | `d68926cf1d569478e86228065e9f4f2177f33be19166f48fbb31a167eb266260` |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | 699–714 | `216a8dccfff723408fd4b54701933a8e257f29e5c775aaef2a4458d1f36d3cc7` | `11759276200a6707762e76eeeefd901443e691bd1b0ff51b55cd3b6551fed58b` |
| `docs/governance/decisions/po-decision-2026-09-29-11candidates.md`（`MPR-RC-HARNESS-L2-041-003`） | 27 | `57419892406b5fa0c439d47d5ce6782edaed9585beba8759e2704b9548a54959` | `3a8ce36e3ff309ba7a635a5f9b9469fd6cdbfe1da8e26d7a64ca4ab3fcf28a17` |

L2/L11のraw spanとPO行は、対象版・担当・責務・意味の固定根拠である。過去の`-002`は履歴であり、現採択は`-003`である。正式review08は同じ判断IDについて後日の別採択がないと報告している。本記録はL2要求意味の変更、再採択、あるいは未採択本文metadataからのauthority生成を行わない。

## 承認対象の六本文

承認対象content revisionは`70312c37561950bbf77e0d31f1a998807310bc86`。formal reviewのcontent HEAD `4219c51f134b8c82f58007700d5958e859a56155`では六本文のbytesがcontent revisionと一致する。各SHA-256は対象HEADのGit blobから計算した。

| 本文 | SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | `bd781ad052b14fdeadff8c4e3294ef6cf50ff921b7c202a148ed9c0780af1a24` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `a673be158e96dd92eb09f91432077244724a03d25bd4e0fd88482d6e42086f09` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `4066acf1940761ef57fd781b878d933324f5d248465c44bb44f3e8abda235f7e` |
| `docs/helix-harness/L10-verification/business-verification.md` | `b756326334c652eec048e3ca34abc6a2a4df4638fa8eaa384c07a11801cfaa3e` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `24d7f597211b05505876c25f0cbf403bece96dfa1a52854b8795e3a08cbb4a19` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `89d26dcd990b8bd6b8305a2a8c8a8017df1f8179c95edf0c838ab2d27a98c4d3` |


| 項目 | 値 |
|---|---|
| exact review base | `ceda1c53b53c53fffb8c23f394add1f2b809deb1` |
| formal review content HEAD | `4219c51f134b8c82f58007700d5958e859a56155` |
| content revision | `70312c37561950bbf77e0d31f1a998807310bc86` |
| Opus/Fable formal comment | `6024250310` |
| formal body SHA-256 | `25cf4e37582d0f2fd196acc1a6736f2bb2dd865f4d7dba2d45f2795ebb16af5a` |

6本文は未実行の要件・総合検証設計であり、IDやCASE数は実行合格または意味完全性を示さない。

## 後で直す残余

以下はreview01–07とreview08が記録した残余の原文fragmentである。評価・修正・条件化・省略はこの記録では行わない。review08の範囲どおりR1–R27、R29、R30、およびR31–R34を載せ、未記載の番号は補作しない。

- **R1（出力の列挙と単独fixture）**：FR-041の「出力」とAC-02/03の列挙に、obligation種別がない。出力からextractor/version digest、template revision、applicability branchが欠けた場合の単独fixtureがない。field、done-when、pair contractの要素別の抽出、旧L0–L14配列・追加pairを作らないこと、「L3要件内容の生成」の拒否にも単独fixtureがない（L2:960、962、964）。
- **R2（理由付き非適用）**：理由付き非適用をtyped gapと一括にしていて、非適用の理由だけが欠けた場合の単独fixtureがない（L11:703）。
- **R3（索引）**：041-02/04/06がAC-02の単独行（r04-atom-gap、r09-001、r10-unresolved-obligation-aggregate-covered）を挙げていない。041-01はAC-01のr04-unselected-template-extrapolation、r09-002、r10-l2-009-applicability-unknownを挙げていない。041-03はAC-02のr04-atom-gapをラベルなしで含める。041-04（AC-02）がAC-01のr09-002を参照している。041-11/12でIDが二重backtickで囲まれている（review19 m18の残り）。
- **R4（兄弟行の戻し先の書き漏れ）**：r10-candidate-adoption、design-success、l3-approval、implementation-complete、candidate-template-authorityの各行に、041抽出契約ownerへの戻しが書かれていないか、書き方がそろっていない。AC-04の一般規定が覆っている（L2:964/965）。
- **R5（宛先の併記・条件分岐）**：r10-025/026-receipt-substitutesの「041の選択input/抽出契約へ」は、009（選択input）と041（抽出契約）を原因で分けていない。r09-003は、2宛先のどちらになるかが入力で固定されていない（L2:964、965）。
- **R6（英文の残存）**：「index only: …」「valid atom/gap/provenance output」「selected template/application input」「known responsibility class」など。AC-05末文の「041のinput contract内で得た結果に限る」は意味が取りにくい（旧英文所見の残り）。
- **R7（重複節）**：functional-requirements.mdにも「Stage 3 親041の業務要件」節があり、business-requirements.mdと文言が少し違う重複になっている。
- **R8（改訂範囲の記載）**：FR、FV見出し、監査mdは旧行の改訂をr05だけとしているが、r04-source-spanの3列も意味を改訂しており（入力span保持、出力span欠落へ）、旧行15件のAC帰属も付け替えている（例：r09-001はAC-03→AC-02、r09-002はAC-04→AC-01）。旧literalは監査JSONに残っているが、改訂として記録されていない。
- **R9（監査のL2 pinの範囲）**：監査のfixed_parent L2_041は957–970（3967 bytes、`ad8e344c…`）を「実physical slice」とし、空行969と次の節の見出し（970行）を含む。FRの宣言とPO行46のpin（957–968、`d68926cf…`）と範囲が違い、監査はd68926cfを照合していない。L11の`259c3832…`はPO pinと一致する。
- **R10（PO行のrevision）**：FRはPO行のrevisionをa2638477とし、監査はa1bcdbaで照合している。行のbytesは同じ。
- **R11（監査の外部参照）**：監査mdとJSONが、`/tmp`配下の4ファイルと、worktree `/home/tenni/.helix-worktrees/l3-harness-stage3-parent041`を参照していて、repositoryからは再現できない（4ファイルは現時点で手元に実在し、SHAは記録と一致した）。JSON limitations[2]の「all outputs are under /tmp」は、repository内に置かれた現状と合わない。
- **R12（件数metadata）**：埋め込みinventory（59行、新規21件）は古い。監査はこれをhistorical metadataとし、現在値61行・新規23件を別に記録していて、食い違いは開示済み。
- **R13（採択状態の表記）**：固定L11 @318ec4a:701は「未採択」と書くが、PO判断記録46行は「採択」である。採択前の文面で、L3はPO判断記録に従っている。
- **R14（oracleの戻し先）**：r10-candidate-adoption、design-success、l3-approval、implementation-completeのoracleに、「誤出力は041 contract ownerへ戻す」がない。AC-04の本文で宛先は一意に決まる。
- **R15（oracleの戻し先）**：r04-digest-atom-gapとr04-unselected-template-extrapolationのoracleに、戻し先がない。所属するAC-03とAC-01の本文で、宛先は一意に決まる。
- **R16（二通りに読める宛先）**：r10-025／026-receipt-substitutes-extractionの宛先「041の選択input/抽出契約へ」は、二通りに読める。baselineではinputが有効なので、041 contractに絞るほうがよい。
- **R17（未見の負例）**：L11「未見例」の「新しいapplicability分岐」と「未対応ならsource span付きgap」に当たる負例がない。r09-002は未見の正常例で、r09-003は既知のbranchの欠落である。
- **R18（atom種別の列挙）**：L2が挙げるatomの種別（chapter／field／row／rule／done-when／pair contract）が、FRとACに列挙されていない。done-whenとpair contractには個別のfixtureもない。
- **R19（場所の特定）**：L10の冒頭にある「添付authoring inventory」と、L3の「時点inventory」は、本文の中で場所が特定されていない。
- **R20（input時点の欠落）**：L2「依存区分」は、対象のHARNESS-L1 revisionを常に必須とし、入力に抽出器とversion identityを挙げている。しかし、AC-01のmissing／unknown／conflict／staleの列挙はtemplate／applicability／scope／sourceまでである。L1 revisionと、input時点の抽出器identityが欠けた場合に対応するfixtureがない。固定親はこの2つに宛先もunknownの規則も定めていないので、網羅の不足とする。
- **R21（重複節）**：functional-requirements.mdの末尾（760行付近）に、「## Stage 3 親041の業務要件」節が重複して置かれている。business-requirements.md:130と同じ見出しで、文面が少し違う。
- **R22（索引の帰属）**：CASE-HARNESS-L10-041-03はAC-03の索引なのに、AC-02に属するr09-001を「実在fixture」に含めている。
- **R23（戻し先の不揃い）**：r10-candidate-adoptionだけ、誤出力を041 contract ownerへ戻すという記述がない。同じ系列のほかのCASEとそろっていない。
- **R24（不一致の拒否）**：r05-root-revision-hiddenは、既知のprovenanceの不一致を「unknown/typed gap」として保持していて、不一致として拒否するとは明示していない。
- **R25（入力側のfixture）**：ledger契約版とextractor identityがmissing/unknownになる場合の、入力側の単独fixtureがない。
- **R26（戻し先の欠落）**：AC-05と、r10-025/026-completion-requiredの各CASEに、戻し先がない。固定L11は「025/026と責務を混同しない」と書くだけである。
- **R27（基準入力のspan）**：two-obligations-mergeの基準入力では、二つの義務が単一のSP0に置かれている。L11は「二つのsource span」と書いている。oracle自体は複合atomを拒否しているので、弱めてはいない。
- **R29（HELIXOS-L2-038 -002との接続）**：merge/digest不一致のfindingを、入力・template・extractor versionに結び付けることが、CASEに明記されていない。OS側の前提（governance-acceptance.md:692–695）との接続が暗黙になっている。条件そのものは崩していない。
- **R30（重複した業務要件節）**：functional-requirements.md:760に、業務要件節が重複して入っている。
- **R31（戻し先の記載）**：r04-digest-atom-gapとr04-unselected-template-extrapolationは、oracle欄に戻し先を書いていない。AC-02/03の本文の区分で、宛先は決まる。
- **R32（025/026の戻し先）**：r10-025/026-receipt-substitutesの戻し先「041の選択input/抽出契約」は、009と041のどちらか曖昧である。
- **R33（未見revisionのgap）**：L11未見例の後半「未対応ならsource span付きgapへ返す」を、未見revisionで直接変異させるCASEはない。r09-002/003が間接的に受けている。
- **R34（理由・source spanを欠いたgap）**：理由やsource spanを欠いたgapを単独で変異させるfixtureはない。CASE-05の正常判定が理由付きgapを求めるので、誤った完了は通らない。

## 旧HELIXとの対応と承認境界

旧HELIXの`CLAUDE.md`「自律境界」（`LEGACY-ASSET-6EBDB617A8104A7756D0`、archive全文SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は、人がL3要件を承認し、AIがL3を起草する境界を記録する。旧main承認運用（同ファイル195–197行）は、人間の明示承認を異なるruntimeのreview証拠と結び付けていた。

現行[GitHub上流運用モデルのL3/L10承認委任節](../github-upstream-operating-model.md#l3l10承認の委任)と[2026-10-05のPO委任判断](l3-l10-approval-delegation-po-decision-2026-10-05.md)は、この承認責務をOpusの独立`no_findings`とFableの同一revision判断の一致へ委任し、POは機構×Stageのまとまりで事後確認する。保持するのはL3起草をAIが担い人が持つ上流意味を勝手に変えない点。変更するのは承認の成立手段であり、本記録は既存委任判断の範囲で処理する。Concept、L1、L2の意味判断を委任しない。

## 判断と境界

委任による承認対象は、HARNESS-L2-041（`MPR-RC-HARNESS-L2-041-003`）に基づくこのexact Stage 3 L3/L10本文revisionである。条件1・2が同じ本文revisionで一致し、Rootが六本文SHAを再計算して不変を確認した。委任に基づき、親041のStage 3 L3要件とL10総合検証設計を承認する。authority effectは本記録がmainへadmitされる時点から有効となる。

他の機構・Stage・revisionの承認、L2意味変更、実装完了、検証実行・合格、運転、release、Issue closeは生成しない。機構×StageのPO事後確認一覧へ載せるのは、委任による対象revision承認が有効になった後の扱いである。
