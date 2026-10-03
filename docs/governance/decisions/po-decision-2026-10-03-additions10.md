---
title: "追加・改訂要求候補10件に対するPO判断（2026-10-03）"
decision_record_id: HDEC-REQUIREMENTS-ADDITIONS10-2026-10-03
decision_status: recorded
decider_role: PO
decided_at: 2026-10-03
recorded_at: 2026-10-03
source_repository_revision: 898e9d1b6277861b2ee9ec1a42083fabb401529c
decision_basis_revision: 898e9d1b6277861b2ee9ec1a42083fabb401529c
authority_effect: effective_when_this_record_is_admitted_to_main_for_only_explicitly_fixed_revisions
---

# 追加・改訂要求候補10件に対するPO判断

## PO判断の出所

受領した判断依頼の保存copyは[受領handoff](../audits/requirements-stage/po-decision-received-handoff-additions10-2026-10-03.md)（元path `scaffold/review-handoff/local/po-decision-2026-10-03-additions10.md`、SHA-256 `cc735c33e298ca51a388b715ff5f9632f9ed20c42e453ff5bfc8db63f2d75954`）である。POの発言原文は「これで承認」。本記録はhandoffに保存された評価見解とPO発言を判断根拠とし、handoff自体、Claudeの受け取り、mailbox、PR、review、mergeから採否を生成しない。

handoffは同日のlater35判断依頼を置き換えない。本記録はlater35の対象外だった4件（OS-001-001、OS-018-002、SECURITY-029-003、SECURITY-035-001）と、その後に追加された6件（INTELLIGENCE-072-005、OS-129-002、HARNESS-086-002、HARNESS-087-002＋OS-130-002の一組、HARNESS-088-001）を対象にする。合計10 identityを個別の登録revisionへ固定し、087/130だけを一組として採択する。後発35件とは対象集合・PO発言・判断を分ける。

## 判断basisと照合方法

判断basisはmain `898e9d1b6277861b2ee9ec1a42083fabb401529c`。当該時点の管理仮登録registerは707行、SHA-256 `c10aff53eda8f8220b6af724365777636ad5bf723e32b2ad6f57905b91cfbab3`。後続のmain `62d9eedca25a927916594a0a96690b2441437712`（later35判断記録・authority register追記を含む）でも、registerと対象4機構のL2/L11 8ファイル（計9ファイル）に差分がないことを確認した。判断対象の候補bytesは両mainで同じである。各表の採否は、exact `registration_id`、候補semantic digest、および下記L2/L11節または順序付きpart集合へ束縛する。候補本文の`draft`表示やMPRの`registered_proposal`は判断状態を決めない。

通常の単一節は、記した正確なidentity見出しから次の同階層以上の見出し直前までを選び、末尾空行を除いてUTF-8のLF一つで正規化する。multipartのpart境界と連結方法は各行に記載したcoverage receiptのdigest規則を使う。HARNESS-086-002だけは例外として、MPR-001で公開されたimmutable sectionと、公開時点のfull-file EOFへ追記されたMPR-002の物理suffixを使う。suffixは先頭separator LF 2個を含むexact bytesで、正規化・再シリアライズしない。MPRの`candidate_semantic_digest`に含まれる選択bytesは、登録ごとのdigest規則に従う。072-005はL2/L11六partの合成digestである。ほかは単一L2節またはL2合成digestであり、別に定義されたpair digestと取り違えない。全登録行、receipt、現物節・partの照合結果は[静的照合証拠](../audits/requirements-stage/po-decision-additions10-verification-2026-10-03.json)に記録する。

## 採択した対象revision

### 先に承認を進めてよいもの（4件）

| Identity | 採択する登録revision | L2 pin | L11 pin | 判断範囲 |
|---|---|---|---|---|
| `HELIXOS-L2-001` | `MPR-RC-HELIXOS-L2-001-001` | `sha256:77887b2d5c6d7c4f01ee905c503276fe96edaddc6505b28f6ffaafedc315472b` | `sha256:9e60291b227320cee9647f5c22c0ee8dec0d728aba1dca63decd3c18864f7aaf` | HIL-NFR-32六条件に対応する受入追補。権限、影響範囲、設計と検証の対応、判定基準、復旧根拠、下流stale更新の欠落を個別に拒否する。既存の更新条件の具体化であり、新しい承認手続きを加えない。 |
| `HELIXOS-L2-018` | `MPR-RC-HELIXOS-L2-018-002` | `sha256:5e2a621be8b4bda140bd796a48bedf2b3369daf5fad2665060ac41aa1a3174d2` | `sha256:e32e45319a3ac91004e3e1a985c7ff44e91b9e86f05b85c266d6b8d67acf87b5` | HIL-NFR-36の残差追補。既定構成からの逸脱の事実・理由、品質問題で実際に通った対応手順と結果を記録し、予定した対応と実行した対応を区別する。新しい既定値や全案件共通の対応順序を作らない。 |
| `HELIXSECURITY-L2-029` | `MPR-RC-HELIXSECURITY-L2-029-003` | `sha256:0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745` | composite `sha256:bad6c3ebc301cecf328777a9497ad17cfcc9df023b57a5e897db8f44437da210`（L11 part 1: `sha256:3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0`; part 2: `sha256:9454998c4b19552f845ad5c6f3ba0f16ac64030e82b95409b970dada40814288`） | 採択済み002に加える型別ローカル強制証拠の受入追補。選んだ追加runtime operationに適用する証拠だけを要求し、sandbox、allowlist、実際の外向き通信、file diffを個別に確認する。主Worker全体へ制限を広げず、全operationで4種類を一律必須にしない。 |
| `HELIXINTELLIGENCE-L2-072` | `MPR-RC-HELIXINTELLIGENCE-L2-072-005` | 6 part composite `sha256:d8376dc314dc4aebe7b413a40d4855e3147d6e5ec870d9790395825c5f8cc775`（追加L2 part: `sha256:511c0083b8aaeab292ab348f488367b197516a9faaf92a44a27df1e80c6f21d8`） | 6 part compositeに含む追加L11 part: `sha256:9884a284fbaecc0134936e0b3772871974d5eb24d78c4ebbef22ebf2c6bbb194` | 採択済み004の範囲を保ち、選択sourceが変わった場合のcandidate/shadow facet stale条件を追補する。全catalogの一律失効、OS実行制御、model qualification更新は含めない。選んだ依存または対象scope/revisionだけをstaleへ結び、非選択sourceは未観測、選択または適用性不明はunknownとする（receiptの選択肢B）。 |

### 軸を明記して選択した採択（6件）

| Identity | 採択する登録revision | L2 pin | L11 pin | POが選んだ内容と理由 |
|---|---|---|---|---|
| `HELIXOS-L2-129` | `MPR-RC-HELIXOS-L2-129-002` | `sha256:42ac19a01b0929a9e92b8d5ba83061ea929c0f23d02c8d885472d2c2969137c7` | `sha256:f1f756669272512f3d53a84b9b1a1d266b2a3f83e518ea86ea825e17fad33394` | **適用範囲B**：主Workerを含む、選択されたruntime一般。**内容A**：quota/rateを予定状態として扱い、fail-closeでqueue holdまたは別runtimeのrouting proposalへ退避する。quota枯渇を無視して続行せず、無計画retryをしない。代替runtimeの提案は自動切替や実行許可ではない。既存budget、deadline、未完作業の引継ぎを保つ。HAC-23cのegress/quarantine配賦は保留し、NFR-40候補へ追加しない。 |
| `HELIXSECURITY-L2-035` | `MPR-RC-HELIXSECURITY-L2-035-001` | `sha256:788594f7b2d11ccd87c984b0751584aa91dbdeb7cb83ae17ba211be67ae0828c` | `sha256:76f7f174a03db3d162c14409b4c970b75d202af4794c5faf6d7832593a42fa7b` | **適用範囲A**：HIL-BR-32で定める追加runtimeだけ。**配置A**：policy/authorityはSECURITY、強制はWorker実行環境、run/assignment運転はOS。run限定bypass/YOLO/auto-approve設定を終了時に除去し、repositoryの恒久denyとdeny優先・明示allowlist条件を保持する。この採択はbypass利用の許可ではない。 |
| `HARNESS-L2-086` | `MPR-RC-HARNESS-L2-086-002` | composite `sha256:1156537dc160a27de13dc9b9f3b5f829128010bfd31f39ac99ed7bf2e6d01094`（revision 001 section `sha256:cef4bb68938fc082b87618b000fb32b1f428aa2d6322916b8926fb6ffcb037a2`; 002 supplement `sha256:79d045418eef00464074f5b451721452c094feeca2a1adee855366a46cee4f7c`） | revision 001 section `sha256:82cf498972d8f2bfcb5a396b82a67aabc466a9a3d0594caee587517457f32771` とrevision 002 supplement `sha256:21fcbd6382b2c34ef8fb73c418ceb080999efc609230966d4c25716cb3dd297f`を個別に固定 | backend由来の画面要求形成・検証接続を**後続版向け**の機能要求として採択する。1.0へ加えない。旧工程名・CLIを復活させず、画面なしの根拠付き非適用を認める。HARNESS-079の試作品・walkthrough証拠条件を代替しない。 |
| `HARNESS-L2-087`＋`HELIXOS-L2-130` | `MPR-RC-HARNESS-L2-087-002`＋`MPR-RC-HELIXOS-L2-130-002`（一組） | 087 composite `sha256:b361e4a28f7e9a7c8cc8b678bdc87c4f7495e45e49e5b253bf28666c6b7bc462`; 130 composite `sha256:e89705deadaae98977387141f10e7413c5d0e085e07d2ebe047c3c565559cddf` | 087 composite `sha256:4a55bb10d3eb9bd4cfb7f967cef6aa0f30353f5ee853d8e726f82bcdff6b35d6`; 130 composite `sha256:bc525bc9a1734f3f994e3ec4d257aae0c0c9f1d7c8e78a576ee848decafd0949` | **配置A**：HARNESSがZIP metadataをHELIX契約候補へ変換し、OSが出所・採否参照・関係の管理projectionを担う。**ZIP適用範囲B**：案件ごとに明示選択されたZIPへ再利用できるunitとし、旧ZIPをsource例として保つ。ZIP以外は含めない。ZIP内担当・予定を実割当や期限にしない。変換成功を要求承認としない。2 identityを一体で採択し、個別片側だけの採択にはしない。 |
| `HARNESS-L2-088` | `MPR-RC-HARNESS-L2-088-001` | composite `sha256:f8f4842fda5287dd86e41d539d51b386828ccafd404ece4c33d4f2ec5933f36e`（part 1 `sha256:7fd0e4ff72ee2bacb4d117e65b591596708af7bab603c97e74aac624c99d098b`; part 2 `sha256:42830ea75a20fb3ce71c2e77bd69e8f68ec79a7d6243a2b81d5525eed4462a0a`） | composite `sha256:b0cbc3c8d32ea886e5aeb1e179b6f10f9c0ff2edce51265331232a3f7506647f`（part 1 `sha256:52b64e970594554810a594bd2e5ef22fd8b7b771c5241f9b6cfd139c31fed4ea`; part 2 `sha256:b6469cb77bbee91d7a9325bd1444a800fe0da84055342119f44692b7ec878f9d`） | **配置A**：機能比較と四つのdisposition oracleはHARNESS、source authorityの観測とprovenance custodyはOS。**適用範囲B**：選択sourceを扱う再利用可能な比較能力とする。今回の旧資産照合では現行HELIX、ZIP、前身repository exact 2件の全sourceを維持し、一部だけの確認で全体完了としない。すべての利用案件へその4 sourceを一律必須にはしない。 |

087/130のcompositeは各側で、identity節と末尾追補を正規化し、LF一つでつないだbytesのSHA-256である。087/130のpair digestはL2 composite bytes＋LF一つ＋L11 composite bytesのSHA-256である。088は各sideでidentity節とscope補足を正規化しLF一つでつなぐ。pair digestはreceiptに示すとおりL2 composite bytes＋NUL byte＋L11 composite bytesのSHA-256である。029-003のL11 compositeは、既存029 L11節とNFR-39追補partをそれぞれ正規化し、列挙順にLF一つで連結したbytesのSHA-256である。072-005の6 partは、L2-original → L2-supplement → L11-original → L11-supplement → L2-NFR34-supplement → L11-NFR34-supplementの順である。既採択004の最初の4 partは不変。追補2 partを加えた正規化bytesを区切りなしで連結してSHA-256を取る。086-002はrevision 001の選択節bytesとrevision 002追補bytesを連結する。087と130はそれぞれidentity節＋EOF追補をLF一つで連結して各side digestを得る。087/130のpair digestはL2 composite bytes＋LF一つ＋L11 composite bytesである。088は各sideで2 partをLF一つで結合するが、pair digestはL2 composite bytes＋NUL byte＋L11 composite bytesであり、LF区切りのpair digestではない。既存sectionと追補の各pinは次の表と静的証拠に記録し、L11をL2採択digestと混同しない。


### 複合pinのpart一覧

| 対象 | L2 parts（正規化後の順序） | L11 parts（正規化後の順序） | 合成規則 |
|---|---|---|---|
| OS-001-001 | HELIXOS-L2-001表行 `sha256:4acfd31eda15d28fa8d73fa4934437943a6c437c17fbd1f7e317bd29fddf9a78`; `要求正本を更新する管理条件` `sha256:89ae22c348d83783920e5423d7c3bbe076c2b315b1dd6fcc65fbea416461cbd5` | L11-001表行 `sha256:ff822f0d9751edf6beeb58ee691fe957e3e3b9d6acea35faa0b0b773a2856364`; `要求正本更新の受入` `sha256:e39078e65d47e75116e10eeffe9a3791368e1c70c3cda3fa9256da37efeb6ea1`; EOF追補 `sha256:52b0cb4a04ce26c7cba9badf97b95387d6bd4b103e3fd8625d7a8232e34c64f6` | 各part末尾空行除去＋LF終端、列挙順にLF一つで連結して各side SHA-256。 |
| OS-018-002 | identity節 `sha256:4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408`; revision 002追補 `sha256:634b700e1ed79c60f53235f6fb0e73348b7cc07264d4e4f8afb69e107aa1996d` | identity節 `sha256:77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53`; revision 002追補 `sha256:ba303351c99a385506d9f151d0b51c03fb08922ce7d2848ffb3b1f485c4c221c` | 各part末尾空行除去＋LF終端。identity節＋LF一つ＋追補partを連結し各side SHA-256。 |
| SECURITY-029-003 | identity節 `sha256:0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745` | 採択済み029 L11節 `sha256:3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0`; NFR-39追補 `sha256:9454998c4b19552f845ad5c6f3ba0f16ac64030e82b95409b970dada40814288` | L2は単一節。L11二partを正規化しLF一つで連結。 |
| INTELLIGENCE-072-005 | 004由来original `sha256:a828bff2126dfe8b029c75ff922f4b52613e6aa48cd957a3f8056be635b97dd2`; 004補足 `sha256:08d3915feb65dfe071ce69f56fb97070822e08e5cd7f30a92b4d42e22953cf8b`; 新005補足 `sha256:511c0083b8aaeab292ab348f488367b197516a9faaf92a44a27df1e80c6f21d8` | 004由来original `sha256:b0a3131940865e2cb30b016ec7232f6f9e40c6cb9fdd20f3974c7654e8a6a31f`; 004補足 `sha256:8d9514cc6964d617928abe6dacaece211004f754c337fbe8d78bda678ab187c8`; 新005補足 `sha256:9884a284fbaecc0134936e0b3772871974d5eb24d78c4ebbef22ebf2c6bbb194` | 六partを列挙順に、各末尾空行除去＋LF終端後、part間区切りなしで連結しSHA-256。既採択004の最初の4 partは不変。 |
| HARNESS-086-002 | immutable 001節（L2 lines 1455–1485）`sha256:cef4bb68938fc082b87618b000fb32b1f428aa2d6322916b8926fb6ffcb037a2`; exact 002 EOF suffix（lines 1486–1498。先頭2 separator LFとheadingを含む）`sha256:79d045418eef00464074f5b451721452c094feeca2a1adee855366a46cee4f7c` | immutable 001節（L11 lines 1225–1263）`sha256:82cf498972d8f2bfcb5a396b82a67aabc466a9a3d0594caee587517457f32771`; exact 002 EOF suffix（lines 1264–1276。先頭2 separator LFとheadingを含む）`sha256:21fcbd6382b2c34ef8fb73c418ceb080999efc609230966d4c25716cb3dd297f` | L2 semantic digestは001節bytes＋002追補bytes。L11の001節と002追補はそれぞれ独立固定し、L11を採択L2 digestとして扱わない。002追補bytesはMPR-001の公開時点の各full-file bytes直後に追記された物理suffixで、先頭のseparator LF 2個を含む。L2 semantic compositeはimmutable 001節bytes＋当該正確なsuffix bytes。 |
| HARNESS-087-002＋OS-130-002 | 087 identity `sha256:6ff019751ec9b357dad94a946ac79ecacf7f92b09550fdd09e5c68f2bd4456c7`; supplement `sha256:4bbb651b7e88b3d6c256444f55112636ba18df2c26ab993458c7492562ce14a1`; 130 identity `sha256:9916804ec017c5854f496066e76fb6d4c7781462388478c8e9d4a0f4196027a5`; supplement `sha256:485068e885c39889d72cb8278da492664fe5347b8b059f469e11accc27e816a1` | 087 identity `sha256:171d3433842b1044626b56884b89c6a88193d6d31c15be04a1e25d00a275311a`; supplement `sha256:2497a6804926a73e4014ad96aa0e4ff2a4556fc8cd63e01ab4608cce8f88084f`; 130 identity `sha256:8e5fc049b06882e6049b02fd7c1fd4f21a20a352d4193532bbf0996536eaf1a1`; supplement `sha256:9e57c45852ce4680b6460e2a25aeec82a0e96ca5bd92b32cf5ff291e9fd56bd6` | 各pair側のidentity節＋LF一つ＋EOF追補。087 pair digest `sha256:0825339bc745181b16ddd73032c93e37ea2a450552cb6ec11920534c75712cc4`; 130 pair digest `sha256:b14e358f2d7b6c09d5f257de0033c30ad88174c1f098bb5eb4e736cbc38c0075`。 |
| HARNESS-088-001 | identity `sha256:7fd0e4ff72ee2bacb4d117e65b591596708af7bab603c97e74aac624c99d098b`; scope supplement `sha256:42830ea75a20fb3ce71c2e77bd69e8f68ec79a7d6243a2b81d5525eed4462a0a` | identity `sha256:52b64e970594554810a594bd2e5ef22fd8b7b771c5241f9b6cfd139c31fed4ea`; scope supplement `sha256:b6469cb77bbee91d7a9325bd1444a800fe0da84055342119f44692b7ec878f9d` | 各sideでidentity節＋LF一つ＋supplement。pair digest `SHA256(L2 composite bytes + NUL byte + L11 composite bytes)` = `sha256:3ce8866aa9455fa4323b7dc87bab44bc1b36fbb3215ab4f038acbc39a0fa45db`。 |


## 既採択revisionとの区別

以下は今回の採択対象ではなく、先行判断で採択済みのexact revisionを示す。新しい追補revisionは別行の判断対象であり、先行採択を引き継いで自動採択されたものではない。

| Identity | 先行採択revision | 先行判断記録のpin | 今回との関係 |
|---|---|---|---|
| `HELIXSECURITY-L2-029` | `MPR-RC-HELIXSECURITY-L2-029-002`、L2 `sha256:0faf8ac952341e621c2f76f7ef44249f03a673ac0a37180f0034914df00f4745`、L11 `sha256:3a5d5311fd03cae17db54bd1ad323cb4222d44d43196c3a4d50ce2a8cf2759f0` | [57-candidates decision row 88](po-decision-2026-09-29-57candidates.md#L88) | 002の範囲・主Worker境界を保つ。今回003はローカル強制証拠型の追補で、別revisionとして採択。 |
| `HELIXINTELLIGENCE-L2-072` | `MPR-RC-HELIXINTELLIGENCE-L2-072-004`、L2/L11 4-part composite `sha256:02e8cd954584625a6f02a757e860aed71b0e5a173ba9c5c846c558c0339699e4` | [57-candidates decision row 85](po-decision-2026-09-29-57candidates.md#L85) | 004の既存4 part、B配置、1.0のcandidate generation/shadow evaluation境界を保持。今回005は選択source stale facet追補だけを別revisionとして採択し、004を置換・拡張しない。 |


## 旧HELIXのlineageと保持・変更点

旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md`「自律境界」82–85行は、人が企画・要求・デザインモックを持ち、L3要件を承認し、AIが要件起草以下を進める役割分担を記す。本判断はその責務境界を現行Concept／対象別L1・L2/L11に対応させ、旧世代の層番号、runtime、CLI、実行手順を採用しない。要求意味の採択と候補起草を分け、必要な上流意味選択だけをこのexact revisionの判断に記録する。

各登録行の`source_atom_set_ref`と`coverage_receipt_ref`が示す旧source、consumer、asset、source差分を、候補本文と受入partへ照合した。receiptに記録された旧asset path／行／source digestと、保持・変更・未選択の境界は[静的照合証拠](../audits/requirements-stage/po-decision-additions10-verification-2026-10-03.json)から辿れる。

| 対象 | 旧source atomと固定参照 | 保持点・変更境界 |
|---|---|---|
| OS-001-001 | `MPR-SH-IR-003#HIL-NFR-32`、登録行の`source_atom_set_ref`、NFR-32 correction receipt r3 | 原文の六条件を個別受入へ対応する。OS-001の既存管理条件と対にするが、旧IRや下流closure完了とはしない。 |
| OS-018-002 | `MPR-SH-IR-003#HIL-NFR-36`、NFR-36 receipt r2 | sourceで実際に起きた構成逸脱・対応手順・結果を予定状態と分ける。固定採択済み018-001の割当・実行統制は変更しない。 |
| SECURITY-029-003 | `HIL-NFR-39` whole record、既存SECURITY-029-002 receiptとNFR-39 L11 receipt r1 | 選んだ追加runtime operationの型別証拠を加える。旧sourceの他の条件、全source closure、主Workerへの適用拡大は主張しない。 |
| INTELLIGENCE-072-005 | `HIL-NFR-34` whole record、NFR-34 receipt r1 | 選択source changeによる該当candidate/shadow facetのstale条件のみ追加する。採択済み004の4 partとB配置を維持し、runtime guard／dispatch条件は既存OS契約に残す。 |
| OS-129-002 | `HIL-NFR-40` whole record、NFR-40 receipt r2 | planned quota/rate状態、queue holdまたはrouting proposal、無視・無計画retry拒否を維持する。HAC-23cのegress/quarantine consumer条件は候補へ割り当てない。 |
| SECURITY-035-001 | `HIL-NFR-38` whole record、NFR-38 source atom/receipt | runだけ有効なbypass設定と終了時除去、repository permanent deny能力、deny優先等を追加runtime向けに受け入れる。主Worker適用を選ばず、bypass利用許可も作らない。 |
| HARNESS-086-002 | v1.3.14 `§4.2.2` lines 167–171、`design-bottomup.md` §§1–4、v1.3 lines 174–175および236–238。source atom set r2とcoverage receipt r2 | 選択した機能条件、後続version、bare-token ambiguity、unsupported境界を保持し、079のartifact/walkthrough oracleと分ける。既存source holdingと未選択条件は残し、1.0へ前倒ししない。 |
| HARNESS-087-002＋OS-130-002 | `HIL-FR-15` whole IR atom、FR15 receipt r2 | HARNESS変換とOSの出所・採否関係の記録を一組として結ぶ。ZIP以外へ拡張せず、source closure・formal successorを主張しない。 |
| HARNESS-088-001 | `HIL-FR-16` whole IR atom、FR16 receipt r1 | 今回は指定された全source照合を保持し、他案件での選択source再利用能力を選ぶ。source scope未選択条件・routing訂正・全旧consumer closureは保留する。 |

これらの参照は旧sourceの意味を保持・比較する根拠であり、旧workflow、runtime、CLI、test、CIを実行した証拠ではない。未選択のsource atomとconsumer条件は生存するholdingへ残り、今回の採択からsource移管、formal successor、旧要求全体のclosureを生成しない。

## 採択しない訂正提案と保留

`PRC-CORR-HIL-FR-15-001`および`PRC-CORR-HIL-FR-16-001`は今回の承認対象ではない。087/130と088で選んだ配置が各提案のrouting訂正方向に似ていても、その訂正自体は`proposed_pending_po_review`、`authority_effect: none`、`meaning_change_applied: false`のまま維持する。候補配置の選択から旧routingの訂正やsource owner移管を生成しない。

今回の承認は、handoffが保留を変えないと記したものを解除しない。`HELIXOS-L2-125`はbackpressure時に欠損なく待機・再開できる場合と、不正・部分結果を成功扱いする場合の受入条件の書き分け待ちである。`HARNESS-L2-067`は親参照の訂正登録を確認できず、訂正済みとも未修正確定とも扱わない。`HARNESS-L2-064`／`HELIXOS-L2-030`、`HELIXOS-L2-112`／`114`、`HELIXINTELLIGENCE-L2-076`／`079`、WBS・文書review等の保留も解除しない。later35の判断依頼が扱う以前からの保留も、その記録の対象と判断を別に保つ。

## Authorityと適用境界

対象MPR行は管理上の`registered_proposal`かつ`authority_effect: none`のままである。採択authorityは本記録がmainに入った後、明記したexact registration revisionと対象L2/L11 bytesに限って発生する。今回採択した候補から、別revision・他identity・未記載scope・source holding解除・旧要求全体の引継ぎ完了・formal successor・L3承認・設計、実装、実行、配布許可・要求stage完了を生成しない。旧sourceやconsumer、fixtureが存在することもsource closureや実行済み受入を示さない。

本記録を参照する追記を[上流authority register](../upstream-authority-register-2026-09-14.md)へ追加した。追記bytesとregisterのappend-only prefix検証は静的照合証拠に記録する。MPRは編集せず、各行の`registered_proposal`／`authority_effect: none`を維持する。

## 受領した見解（原文）

以下はPOが会話へ貼り付けた評価見解の保存copyからの引用である。原文の語句・選択肢・理由を保持する。

---

帝王様、**確認した最新mainは `898e9d1`です。今回の追加・改訂分では、要求の採択を進めてよいものがあります。ただし、既存要求への追補と、新機能・適用範囲の変更は分けて承認するのがよいです。**

## 先に承認を進めてよいもの

| 対象 | 最新判断・理由 |
|---|---|
| **HELIXOS-L2-001の受入追補** | **承認推奨。** 要求の正本更新時に、権限・影響範囲・設計と検証の対応・判定基準・復旧根拠・下流の古い状態への更新を、一つずつ欠落させて拒否を確認する。既存の更新条件を具体的に検証する追補であり、新しい承認手続きの追加にはしない。 |
| **HELIXOS-L2-018〈登録002〉** | **承認推奨。** 既定構成から逸脱した事実・理由と、品質問題で実際に通った対応手順・結果を記録する。**「予定した対応」と「実行した対応」を区別できる**。新しい既定値や全案件共通の対応順序は作らない。 |
| **HELIXSECURITY-L2-029〈登録003〉** | **追加runtime向けの受入追補として承認推奨。** sandbox、通信許可リスト、実際の外向き通信、ファイル差分を個別に確認する。対象操作に適用する証拠だけを要求し、**主Worker全体への制限拡張や、全操作への四種類一律必須化はしない**。 |
| **HELIXINTELLIGENCE-L2-072〈登録005〉** | **選択source変更時の候補・shadow評価の失効条件として承認推奨。** 承認済み004の範囲を維持し、今回使った根拠が変わったのに古い評価を有効扱いすることを防ぐ。全catalogの一律失効、OSの実行制御、モデル資格更新まで含めない。 |

**既存版が承認済みでも、追補まで自動的に承認済みにはなりません。** 特にSECURITY-029は承認済み002と未承認003、INTELLIGENCE-072は承認済み004と未承認005を分けて判断します。

## 選択内容を明記して承認したいもの

| 対象 | 私が勧める選択 | そのまま一括承認してはいけない理由 |
|---|---|---|
| **HELIXOS-L2-129〈登録002〉**：利用上限・レート制限時の退避 | **適用範囲B：主Workerを含む、選択されたruntime一般。** 上限到達を無視せず、キュー保留または代替runtimeの提案へ退避する。 | 追加runtimeだけに限定するA案とは保証範囲が違う。**代替案が出たことを、そのまま自動切替・実行許可にしない**。既存の予算・期限・未完作業を引き継ぐ。 |
| **HELIXSECURITY-L2-035〈登録001〉**：bypass設定の後始末・恒久禁止 | **適用範囲A：追加runtimeに限定。配置もA：方針はSECURITY、強制は実行環境、運転はOS。** | 主Workerにも同じ条件を適用するかは別の選択。run終了後の設定除去、repository側の恒久禁止、deny優先・明示allowlistを採るが、**この承認自体をbypass利用の許可にはしない**。 |
| **HARNESS-L2-086〈登録002〉**：backend由来の画面要求形成・検証接続 | **後続版向けの機能要求として承認推奨。** API・権限・エラー等から画面要求を抽出し、試作、要求・設計への反映、不確実な部分の調査へ結ぶ。 | **1.0への追加承認にはしない。** 旧工程名・CLIを復活させず、画面なしの根拠付き非適用も認める。079の試作品・walkthroughの証拠条件を代替したことにもならない。 |
| **HARNESS-L2-087 ＋ HELIXOS-L2-130〈ともに登録002〉**：ZIP資料の変換と採否の追跡 | **セットで、配置A＋ZIP適用範囲Bを推奨。** HARNESSが変換、OSが出所・採否・関係を管理し、案件ごとに明示選択されたZIPへ再利用する。 | 旧ZIP一件だけから、案件別のZIPへ対象を広げる意味変更を含む。ZIP内の担当・予定を実際の割当や期限にせず、**変換成功を要求承認にしない**。非ZIP形式は含めない。  |
| **HARNESS-L2-088〈登録001〉**：全sourceから機能別の採否までの追跡 | **配置A＋適用範囲Bを推奨。** 比較・判定規則はHARNESS、出所の観測・記録はOS。案件別の選択sourceを扱える能力とし、今回の旧資産照合では指定された全sourceを維持する。 | 今回のHELIX・ZIP・前身2リポジトリを、**全利用者案件の必須入力にはしない**。逆に、今回の照合で一部だけ読んで全件完了にもさせない。一般能力への拡張と、旧routingの正式な訂正は別々に記録する。 |

ここでの「配置A」と「適用範囲B」は**別の判断軸**です。単に「Aで承認」と書くと、責務と対象範囲のどちらを選んだか曖昧になります。

## 保留判断を変えないもの

**OS-125は修正待ちを維持します。** backpressureが発生しただけで、欠損なく待機・再開できる場合まで失敗にする受入条件は分けるべきです。不正・部分結果の成功扱いを禁止する目的は維持します。

**H-064／OS-030、OS-112、OS-114、INT-076／079、以前からのWBS・文書レビュー等の保留についても、今回の新候補の追加を解除理由にはしません。** 個々に残る対応環境、適用範囲、責務、本文修正の判断が必要です。

また、**H-067の親参照については、今回、訂正済みと断定できる記録を確認できなかったため、承認側へ移していません。** 「未修正と確定」ではなく、解除根拠の確認が取れていない扱いです。

**優先するなら、OS-129の上限制御、OS-018の実行事実の記録、SECURITY-029の証拠検証から。その次に087＋130のZIP変換・追跡をセットで進める判断です。** 今回は変更分の評価で、全候補の再集計や承認記録の変更は行っていません。これで承認
