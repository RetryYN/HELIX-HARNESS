---
title: "HELIX-Web・HELIX-Web-OSの文書の置き場所 decision record（2026-09-26）"
decision_record_id: HDEC-HELIX-WEB-RELOCATION-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source_repository_revision: c0fc5110e8241e9686af8d31ce783dd72060a530
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-Web・HELIX-Web-OSの文書の置き場所（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POがファイル構造の整理を指示し、AIの問いに対して置き場所を選んだ。本書はその記録である。
POの発言と選択はそのまま引用し、AIの整理と区別する。POが選んだ選択肢は、選択肢の説明文も含めてPOが選んだ内容として扱う。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの指示

> ファイル構造をもうちょい最適化してくれない？docsにHELIX本体の要求とHELIX-Webの要求が一緒に置いてあるのがきもいんだよな。同じ出自にはなるが、厳密にいえば、別のプロダクトだからね？

## AIの問いとPOの選択

AIの問い：

> HELIX-Web と HELIX-Web-OS の文書を、HELIX本体の docs/ からどこへ分けますか？（旧HELIXでも docs/design/ の下で helix（本体）と harness（製品）をフォルダで分けていた。判断記録や監査記録は書き換えない決まりなので、その中の古いパスは当時の記録として残し、旧パスと新パスの対応表を別に残す）

POの選択：「リポジトリ直下に helix-web/ を作る（推奨）」

> helix-web/ の下に Web（製品）と Web-OS の文書を置き、docs/ は HELIX 本体だけにする。

## AIの整理

- 2026-09-25には、AIが示したWeb・Web-OSの文書を`vision/`等へ移す案を、POが「なんでそれを触ろうと思ったのかその発想が正直信じられない。」で退けている（[機構の配置の判断記録](mechanism-placement-po-decisions-2026-09-25.md)）。今回の移動は、PO自身の指示（上の原文）と選択による。
- 今回変えたのは置き場所だけである。各文書の本文の意味、分類（2026-09-24のPO判断によるVisionレベルの材料）、authority状態（`draft_candidate`等）、ID、承認記録は変えていない。
- 移動に伴って変えたbytesは、移動した文書の中の相対リンクを新しい深さに合わせた部分と、front matterにある対の文書・親L1のpath（`pair_artifact`・`parent_l1_candidate`）を新しいpathへ改めた部分だけである。このため各文書のSHA-256は変わった（下表）。2026-09-17の旧L1承認は、従来どおり旧本文のexact SHAに限る。
- HELIX-Webは外部提供する製品、HELIX-Web-OSはそのサービスを運転する機構で製品ではない。両者はHELIX本体と同じ出自を持つため、親は引き続き[HELIX Concept](../../concept/helix-concept.md)である。

## 旧HELIXとの対応

- **旧source**：旧HELIXは設計文書を`archive/legacy-generation-2026-09-14/root/docs/design/helix/`（HELIX本体。L0企画書`L0-charter/helix-charter_v0.1.md`等）と`archive/legacy-generation-2026-09-14/root/docs/design/harness/`（製品としてのharness。`L1-requirements/`〜`L14-operations/`）に、対象ごとのフォルダで分けていた。旧`CLAUDE.md`（`archive/legacy-generation-2026-09-14/root/CLAUDE.md`）の37行目は`docs/design/harness/L3-functional/roadmap.md`、54行目は`docs/design/helix/L0-charter/helix-charter_v0.1.md`を指す。
- **保持する点**：対象ごとにフォルダを分け、対象のフォルダを見ればその対象の文書が分かるようにする。
- **変更する点**：旧HELIXは本体と製品を同じ`docs/design/`の下で分けていた。今回はPOの選択により、別製品のHELIX-WebとHELIX-Web-OSをrepository直下の`helix-web/`へ出し、`docs/`をHELIX本体だけにする。`helix-web/`の中は`docs/helix-web/`と`docs/helix-web-os/`とし、元のフォルダの中の構成（`L1-planning/`、`L2-requirements/`、`L11-acceptance/`、`README.md`）は変えない。
- **変更理由**：POの判断による（「同じ出自にはなるが、厳密にいえば、別のプロダクト」）。

## 移動の対応表

| 旧path | 新path | 移動前のSHA-256 | 移動後のSHA-256 |
|---|---|---|---|
| `docs/helix-web/README.md` | `helix-web/docs/helix-web/README.md` | `1502cb3a97b7db7eabe07d47c36741e8c92ac595bfebfcfcdca1c31bc9d32bcd` | `efd08e4b3e46797f2444acddee1cb7099f240d3a8e8522a7b27d5de5908d04d0` |
| `docs/helix-web/L1-planning/product-intent.md` | `helix-web/docs/helix-web/L1-planning/product-intent.md` | `d5b665017dec1c2f5c71e7006511a11ea81fa0e9aece028c1b9a691588f4fe54` | `b22d2da8cea573871499f25795ea7cebfb05c66722677577c7c192fc6724ff4f` |
| `docs/helix-web/L2-requirements/product-requirements.md` | `helix-web/docs/helix-web/L2-requirements/product-requirements.md` | `e6f21d6429c920e94a87fbc84bce63302a5e94966a57749dfcc60e32c11bd66d` | `32cc382a9d19ca6818ceb12e3be657fb64e848a804790d2e2d34d10209bbca63` |
| `docs/helix-web/L11-acceptance/product-acceptance.md` | `helix-web/docs/helix-web/L11-acceptance/product-acceptance.md` | `3e93a2f59d551fa62491849748eedb0e7a081db4eaa170b0c1a29e943dd84259` | `09fe6f046097f6f19f993e423fae993c0ff6130507017f4997506a7ee968711c` |
| `docs/helix-web-os/README.md` | `helix-web/docs/helix-web-os/README.md` | `817015b237dd28585d6bf319f4bfe742f9df2cd0aea53c4bb9c4eee1925622b9` | `8363b7b53bb811bd5cef1cfae258b7543b7d4a82b30f7312902041c098e2afca` |
| `docs/helix-web-os/L1-planning/system-intent.md` | `helix-web/docs/helix-web-os/L1-planning/system-intent.md` | `31aa8e4fbd260c2ac980300db201a84918b094695e3d24559e50edcb86873249` | `19a399519538917b0a2a3cd201ebb222981ad245e98a02eafed3ff19111d339b` |
| `docs/helix-web-os/L2-requirements/service-governance-requirements.md` | `helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md` | `84238131eeb2a60ae0be9c2aff2cb49cb03c7fc09485eb45341f3971dfb98210` | `b9a6a0d3c9293dda2cd45da688e17dbb7199e286190a42216e7c1393107cce27` |
| `docs/helix-web-os/L11-acceptance/service-acceptance.md` | `helix-web/docs/helix-web-os/L11-acceptance/service-acceptance.md` | `0d66b45e0bf2a54276af149ee2be75b9784c6a786f923b2c6f350c3b7bc908be` | `a342ba8c239757f517a755145abc3d42ed8264eb1f68f7e1b802b3707ce850c6` |

新しく`helix-web/README.md`（入口）を置いた。

## 参照の更新

- 更新した：現在の意味を持ち更新され続ける文書と台帳（repository直下と`docs/`の`README.md`、製品責務境界、作業入口、OSの`README.md`とL2、旧Concept由来要求のcrosswalk、要求対応表の`source_location`、現行L2分類台帳の現在の`source_path`、Phase Capability Inventoryの`current.refs`）と、Scaffold Bindingの上流path。
- 更新しない：判断記録、監査記録、source holding、snapshot、`scaffold/`配下の証拠と研究記録、要求対応表の`previous_l11_acceptance`、現行L2分類台帳の`previous_classification`、Phase Capability Inventoryの`current_evidence_snapshot`、[repository foundation readiness](../repository-foundation-readiness.md)（PR #1797時点の判定記録）、[archive-first移行記録](../archive-first-transition-record-2026-09-14.md)。これらの中の旧pathは当時の記録であり、上の対応表で新pathへ辿れる。

## 研究用validatorへの影響

### 研究用pin

`scaffold/`の研究用pinは、次の範囲だけを更新した。validatorの判定の条件・分岐・意味field・期待件数は変えていない。

- 本文の変わらない範囲のpath・ファイルSHA・行番号（範囲の本文が同じもの）。
- リンク先またはfront matterのpathだけが変わった行を含むpin 30件（phcap04-05に4件、phcap06に6件、phcap07に1件、phcap08-09に5件、phcap10-11に1件、phcap12-13に5件、phcap14に3件、phcap16に1件、phcap17に1件、phcap19に2件、phcap20に1件）。同じ範囲の後継文言への再pinとして、`exact_text`と行SHAも更新した。差がリンク先・pathだけであることは、旧文面と新文面のそれぞれでMarkdownリンクの括弧の中身（リンク先）を同じ記号に置き換え、`helix-web/docs/helix-web`を`docs/helix-web`に戻した結果が完全に一致することで確かめた。一致しないものは更新しない設定で実行し、該当は0件だった。
- Phase Capability InventoryのSHA、phase snapshotの`current_refs`のpath、wave37〜50のmetaのinput digestとdigest連鎖、現行counterpartのpath・bytes・SHA、Scaffold BindingのSHA。

### validatorのコードの定数

次の5件は、validatorのコードに移動対象を指すpath定数、またはそれに連動するPhase Capability InventoryのSHA定数があった。PO指示の移動に伴うpathの追従として、これらの定数行だけを新しいpath・現行SHAへ更新した。判定の条件・分岐・意味field・期待件数は変えていない。各ファイルで、`git diff`上の変更が定数行だけであることを確かめた。

| validator | 変えた定数 |
|---|---|
| `scaffold/phcap01-concept-l1-research/validate.py` | `EXPECTED_PHASE_REFS`のWeb・Web-OS L1のpath 2行、`ledger_provenance`の`phase_inventory`のSHA 1行 |
| `scaffold/phcap02-03-registration-classification-audit/validate.py` | `EXPECTED_DIGESTS`の`phase`（Phase Capability InventoryのSHA）1行。Phase Capability Inventoryの`refs`は新しいpathのままにした |
| `scaffold/phcap04-05-requirement-acceptance-research/validate.py` | `EXPECTED_REF_SHAPES`のWeb・Web-OS L2／L11のpath 4行 |
| `scaffold/rdp001-outside67-boundary-followup-073/validate.py` | `COUNTERPARTS`のWeb・Web-OS L1のpath（1行） |
| `scaffold/rdp001-outside67-product-entry-followup-076/validate.py` | `COUNTERPARTS`のWeb・Web-OSの`README.md`のpath（1行） |

`scaffold/phcap01-concept-l1-research/validate.py`は、定数の更新後も`E_PRODUCT_SOURCE_MEANING_HELIX-Web`と`E_PRODUCT_SOURCE_MEANING_HELIX-Web-OS`で通らない。このvalidatorは、同じ`HISTORICAL_REFS`のpathを、2026-09-17の承認commit `11a22679dc2bfce57d3294759531282445625001`での`git show`と、現行ファイルのmarker確認の両方に使っている。新しいpathはそのcommitに存在しないため、定数を変えるだけでは両方を満たせない。このため、現行ファイルのmarker確認だけが移動先を読むように、旧pathから新pathへの対応表`RELOCATED_PATHS`（2件）を定数として加え、marker確認の1行で読むpathをこの表で引き直した。承認commitでの`git show`は旧pathのまま読む。確かめる条件（承認時のbytes・行・範囲のSHAと、現行ファイルに意味のmarkerがあること）は変えていない。
