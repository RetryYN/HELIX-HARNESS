---
title: "HELIX Infinity Loop source snapshot manifest"
status: draft
created: 2026-07-15
updated: 2026-07-17
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
requirements:
  - HIL-FR-16
  - HIL-FR-21
  - HIL-FR-22
contract: docs/governance/infinity-loop-source-atomization-contract.md
git_authority_observation: docs/governance/infinity-loop-git-authority-observation-2026-07-16.md
pr_ci_inventory: docs/governance/infinity-loop-predecessor-pr-ci-inventory.md
extractor_version: helix-source-capture.v2-design
classification_version: helix-source-entry-classification.v1
captured_at: 2026-07-15T16:06:58Z
---

# HELIX Infinity Loop source snapshot台帳

## §0 目的と判定境界

本書は、Infinity Loop要件で参照するZIP exact 3件、前身Git repository exact 2件、現行HELIXについて、source root、
authority receipt、entry集合、再生成command、digest、分類manifest、除外境界を固定する。全pathを本文へ転記せず、
同じ母集団を機械的に再生成できる情報を正本とする。前身Gitはremoteの可変件数を本文へ固定せず、current
`GitRefAuthorityReceiptV1`のref/content/edge denominatorとdigestだけをauthorityにする。

本書が証明するのは**固定したentry集合の閉包**と**全entryへの構造分類の付与**までである。file、branch、
module群をbehaviorと同一視しない。`behavior_atom_closed`は全familyで`false`であり、
`docs/governance/infinity-loop-source-atomization-contract.md`が定める
`source entry -> behavior atom -> decision -> HIL -> design -> assertion -> gate`の閉包証拠にはならない。

機械生成時の共通条件は次とする。

| field | 固定値・規則 |
|---|---|
| `extractor_version` | `helix-source-capture.v2-design`（実装receipt未生成） |
| `classification_version` | `helix-source-entry-classification.v1` |
| text encoding | UTF-8、BOMなし、LF |
| path order | `LC_ALL=C`のbyte順。ZIP分類だけはJSONLの`source_ref_id,path`順 |
| digest | SHA-256、小文字hex。machine fieldでは`sha256:` prefixを付ける |
| current authority | ZIP bytes、前身exact 2 repoのsealed Git authority receipts、現行HELIX commit済みHEAD |
| foreign state | source entryへ混入させず、別観測としてのみ扱う |

## §1 family要約receipt

| family ID | source root | 主count | entry/set digest | 分類manifest digest | entry集合閉包 | behavior atom閉包 |
|---|---|---:|---|---|---|---|
| `ZIP-HYBRID-V1` | `repo://ハイブリッド設計ドキュメントv1-fixed.zip` | 703 entries | `sha256:77c6d07b8db1ce6b15a878ebc7ec47ee167f190e24b257ce967ebf29ee2b3fa2` | `sha256:ae0d429a339edf070f9d5ae0a790a051a7cdd140b58a5fa7a4f0fe54b993cd87` | `true` | `false` |
| `ZIP-HELIX-HYBRID-V040` | `repo://HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.4.0.zip` | 184 entries | `sha256:0a97620113d9616f27b99bf4ebd933cc5d09aeb562fe001b0dcc3d400f06114c` | `sha256:223d0f736ffcb12c449dd42dddfe5dbdb01b7ef10d13243689e190c9c93fd63d` | `true` | `false` |
| `ZIP-UNIVERSAL-WORKFLOW-V110` | `repo://UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip` | 14 entries | `sha256:8ae2f2c26cf9a62e853d986b5f36cf92b1a15a17073543c0e13cbe4b37d72dca` | `sha256:a78559cdcfbc05e6f3644437d3888db9d8a2a853204265b1a4d269646bff437f` | `true` | `false` |
| `ZIP-HELIX-REBASELINE-V040` | `repo://HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.4.0.zip` | 184 entries | `sha256:89eff7b5bad1667da3d65014e871a2525233425ee2849ae96d61c46b8c487bf2`（entry TSV） | `pending:semantic-classification` | `true` | `false` |
| `PREDECESSOR-UT-GIT` | `git+https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git` | candidate-derived 69 refs | `candidate:9231e98b...881ca` | `blocked:no-trusted-authority` | `false`（trusted/current receipt未生成） | `false` |
| `LEGACY-HELIX-GIT` | `git+https://github.com/RetryYN/ai-dev-kit-vscode.git` | candidate-derived 21 refs | `candidate:85e9a072...5df9e` | `blocked:no-trusted-authority` | `false`（trusted/current receipt未生成） | `false` |
| `CURRENT-HELIX` | `repo://HELIX-HARNESS@fcbf942835d0014e38c7e20fbd471580fd41af33` | 2,029 full-tree path件数 | `sha256:b73bcae478b3c7a26d083ee056db5d999af251920af40d7a83a586ba8db7b518` | `sha256:44e4f685a945e70ba47cb9d56bb5bcefc4e0b370524a56b8e346c0ddc2676800` | `true`（full tree） | `false` |

v2 family要約digestは、exact 2 Git authority receiptが未生成のため`pending`である。v1のfamily digest、
4,470 entry、固定5 ref、full-tree 8,935行は2026-07-14時点のhistorical seedとして§3.4へ隔離し、current manifest、
acceptance denominator、coverage receiptへ再利用しない。v2ではref denominator、unique content denominator、全ref-entry
edge denominatorを別々にdigest化し、exact 2 receipt setと結合する。いずれが閉じても`behavior_atom_closed=false`である。

## §2 ZIP source群

### §2.1 固定値

| field | value |
|---|---|
| `family_id` | `ZIP-HYBRID-V1` |
| source root | `repo://ハイブリッド設計ドキュメントv1-fixed.zip` |
| archive SHA-256 | `sha256:9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3` |
| archive entry root | `hybrid-docgen/` |
| entry count | 703 |
| file entries | 703 |
| directory entries | 0 |
| entry set digest | `sha256:77c6d07b8db1ce6b15a878ebc7ec47ee167f190e24b257ce967ebf29ee2b3fa2` |
| classification manifest digest | `sha256:ae0d429a339edf070f9d5ae0a790a051a7cdd140b58a5fa7a4f0fe54b993cd87` |
| 既存監査のpath＋content digest | `sha256:eb1d3238a833d7eb65ce92a2fae5c946f500f249b23c9d0d91a86b5111542cc5` |
| 安全scan | duplicate=0、encrypted=0、symlink=0、traversal=0、CRC error=0 |
| `entry_set_closed` | `true` |
| `classification_set_closed` | `true`、703/703 |
| `behavior_atom_closed` | `false` |

既存監査のpath＋content digestはcanonicalization versionが記録されていないため、entry set digestの代替にしない。
archive bytesが一致した上で、以下のcommandからentry setとclassification manifestを再生成する。

### §2.2 正規再生成command

`ZIP_PATH`はrepository rootの対象ZIPを指す。commandはpath本文を表示せず、countとdigestだけを返す。

```bash
sha256sum "$ZIP_PATH"

ZIP_PATH="$ZIP_PATH" python3 - <<'PY'
from collections import Counter
from hashlib import sha256
from pathlib import PurePosixPath
from zipfile import ZipFile
import json
import os

source_ref_id = "ZIP-HYBRID-V1"
root = "hybrid-docgen/"
class_by_group = {
    ".claude": "runtime_adapter_source",
    ".github": "ci_policy_source",
    ".vscode": "editor_adapter_source",
    "api": "schema_fixture",
    "build": "generated_candidate",
    "docs": "human_source",
    "schema": "schema_source",
    "scripts": "hook_source",
    "templates": "template_source",
    "tools": "python_source",
    "root": "policy_config_source",
}

entries = []
classifications = []
with ZipFile(os.environ["ZIP_PATH"]) as archive:
    infos = archive.infolist()
    names = [item.filename for item in infos]
    assert len(infos) == 703
    assert sum(value - 1 for value in Counter(names).values() if value > 1) == 0
    assert not any(item.flag_bits & 1 for item in infos)
    assert not any(((item.external_attr >> 16) & 0o170000) == 0o120000 for item in infos)
    assert not any(
        PurePosixPath(name).is_absolute() or ".." in PurePosixPath(name).parts
        for name in names
    )
    assert archive.testzip() is None
    for item in infos:
        content = archive.read(item)
        path = item.filename
        relative = path[len(root):] if path.startswith(root) else path
        group = relative.split("/", 1)[0] if "/" in relative else "root"
        entries.append({
            "blob_sha256": sha256(content).hexdigest(),
            "compressed_size": item.compress_size,
            "crc32": f"{item.CRC:08x}",
            "path": path,
            "size": item.file_size,
            "source_ref_id": source_ref_id,
        })
        classifications.append({
            "classification": class_by_group.get(group, "unclassified"),
            "group": group,
            "path": path,
            "source_ref_id": source_ref_id,
        })

def canonical(rows):
    ordered = sorted(rows, key=lambda row: (row["source_ref_id"], row["path"]))
    return "".join(
        json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
        for row in ordered
    ).encode("utf-8")

assert all(row["classification"] != "unclassified" for row in classifications)
print("entry_count", len(entries))
print("entry_set_sha256", sha256(canonical(entries)).hexdigest())
print("classification_count", len(classifications))
print("classification_sha256", sha256(canonical(classifications)).hexdigest())
PY
```

### §2.3 分類と除外方針

| structural class | count | source capture上の意味 |
|---|---:|---|
| `runtime_adapter_source` | 16 | `.claude/` source候補。behavior採否は未実施 |
| `ci_policy_source` | 1 | `.github/` policy候補 |
| `editor_adapter_source` | 3 | `.vscode/` portability候補 |
| `schema_fixture` | 1 | `api/` fixture。runtime behaviorへ算入しない |
| `generated_candidate` | 427 | `build/`生成候補。producer/fixture atom未結線 |
| `human_source` | 139 | `docs/`契約候補 |
| `schema_source` | 2 | `schema/`契約候補 |
| `hook_source` | 1 | `scripts/` hook候補 |
| `template_source` | 77 | `templates/`契約候補 |
| `python_source` | 29 | `tools/` engine/detector候補 |
| `policy_config_source` | 7 | root policy/config候補 |

ZIP entryは**除外0件**である。`build/`をsource集合から落とさず、generated候補として分類した上で
fixture atomへ分離する。archive外の展開directory、OS metadata、inspection用一時pathはsource rootに含めない。

### §2.4 HELIX Hybrid v0.4.0 / Universal Workflow v1.1.0追加source

| field | `ZIP-HELIX-HYBRID-V040` | `ZIP-UNIVERSAL-WORKFLOW-V110` |
|---|---|---|
| archive SHA-256 | `sha256:c0d839bd65a221bd9614b9820cd08d3f5c21cad057bbde03bb9b2e532d05a812` | `sha256:b6fd08f5054930dde8379969bf9a84cb21270d1b7bac8e87be3bc243ad425d26` |
| file entry count | 184 | 14 |
| entry set digest | `sha256:0a97620113d9616f27b99bf4ebd933cc5d09aeb562fe001b0dcc3d400f06114c` | `sha256:8ae2f2c26cf9a62e853d986b5f36cf92b1a15a17073543c0e13cbe4b37d72dca` |
| classification digest | `sha256:223d0f736ffcb12c449dd42dddfe5dbdb01b7ef10d13243689e190c9c93fd63d` | `sha256:a78559cdcfbc05e6f3644437d3888db9d8a2a853204265b1a4d269646bff437f` |
| safety scan | duplicate/encrypted/symlink/traversal/CRC error = 0 | duplicate/encrypted/symlink/traversal/CRC error = 0 |
| structural classes | human 95、structured contract 44、schema/fixture 33、diagram 6、historical validation 4、DB schema 1、inventory 1 | human 8、schema/fixture 5、structured contract 1 |
| entry/classification closure | 184/184、184/184 | 14/14、14/14 |
| behavior atom closure | `false` | `false` |

分類はsuffix exact mapping（`.md` human、`.json` schema/fixture、`.yaml/.yml` structured contract、`.sql` DB schema、
`.csv` inventory、`.mmd` diagram、`.log` historical validation）であり、採用判断ではない。両archiveはsource entryを
全件登録しただけで、`absorbed/adopt/harden/redesign/reject/defer`、既存symbol、oracle、gate、runtime receiptへ接続するまで
coverage creditを0とする。Universal Workflowを既存`judgment-core`へ名前の類似だけで吸収済みと判定しない。

### §2.4 HELIX Rebaseline v0.4.0 candidate source （日本語の契約見出し）

| field | value |
|---|---|
| `family_id` | `ZIP-HELIX-REBASELINE-V040` |
| archive SHA-256 | `sha256:c0d839bd65a221bd9614b9820cd08d3f5c21cad057bbde03bb9b2e532d05a812` |
| entry / uncompressed / compressed | 184 / 601,605 bytes / 220,703 bytes | （日本語の機械契約記述）
| entry inventory digest | `sha256:89eff7b5bad1667da3d65014e871a2525233425ee2849ae96d61c46b8c487bf2` |
| format | Markdown 95、JSON 33、YAML 44、Mermaid 6、log 4、CSV 1、SQL 1 | （日本語の機械契約記述）
| safety | traversal/absolute/backslash/NUL/symlink/encryption/duplicate path 0、全entry regular 100644 |
| parse | JSON 33/33、YAML 44/44、SQLite fresh-memory 20 table create PASS | （日本語の機械契約記述）
| package claim | requirements 163、AC 111、trace 286、chat 20、Python binding 21、document binding 9 | （日本語の機械契約記述）
| authority | `proposed`、`approval_required=true`。candidate sourceであってactive正本ではない |
| `entry_set_closed` | `true` |
| `behavior_atom_closed` | `false` |

root CHECKSUMS 182行とnested CHECKSUMS 52行は全一致した。root manifestは循環metadata 5件を意図的に列挙外とするため、
archive 184件とmanifest listを同一分母にしない。content duplicateは13組で、active/source template/exampleとroot/vendor schemaを
alias relationへ送る。実行code/test sourceは含まれず、validation log/report 5件は再実行証拠ではない。

明確なpackage defectとしてREADMEの`19-v0.4.0-errata.md`参照に対し実pathは`19-v0.3.2-errata.md`である。
また`AC-PY-02`のResourceWarning 0要求に対しselftest logへunclosed-file warningがあるため、package `ok=true`をAC green、
implementation ready、runtime evidenceとして採用しない。

semantic dispositionは次の境界で行う。

- adopt-with-hardening: Design HARNESS typed contracts、semantic ID continuity、Capsule、Linux contract、projection/rebuild、Infinity loop。 （日本語の機械契約記述）
- redesign: L0–L14をL1–L12＋6 V-pairへremap、Production Scrum/TDD、no-UI receipt、DB state machine、Issue gate、連鎖台帳。
- reject: UT namespace/DB/PLAN/roleのactive持込み、独立Design engine、Python/Node意味判定の二重実装、Python canonical/external write。
- retain as evidence: package内UT audit。全ref検査義務は外さず、exact 69-ref UT authority observationを上位証拠にする。

package内chat 20件は現行chat semantic ledger 57件の代替にしない。163 requirementを現行141 requirementへ一括置換せず、
source requirementごとのalias/adopt/harden/redesign/reject edgeを作り、未収録chat要求を保持したまま統合する。

## §3 前身2 repository Git authority

### §3.0 current authority契約

required repository setは次のexact 2件である。

| repository ID（リポジトリID） | canonical owner/repo（正規owner/repo） | authority status（権限状態） | current receipt（現行receipt） |
|---|---|---|---|
| `predecessor-ut` | `unison-ai-product/UT-TDD_AGENT-HARNESS` | **PARTIAL**（materialize＋ephemeral seal observed、trusted CAS promotion pending） | `candidate:9231e98b...881ca`（current=false） | （日本語の機械契約記述）
| `legacy-helix` | `RetryYN/ai-dev-kit-vscode` | **PARTIAL**（materialize＋ephemeral seal observed、trusted CAS promotion pending） | `candidate:85e9a072...5df9e`（current=false） | （日本語の機械契約記述）

namespace policyは`refs/heads/*`、`refs/tags/*`、`refs/pull/*/{head,merge}`をexact対象とする。symbolic `HEAD`と
annotated tagの`^{}` pseudo-lineはref denominatorへ数えず、symbolic target/tag peel evidenceとして保存する。
default cloneやheads-only refspecはauthority取得に使用しない。

各repositoryは、advertisement A → advertised exact OIDのquarantine materialize → object/type/tree/reachability/tag peel検証
→ advertisement B → A/B canonical refname＋OID set完全一致 → sealed bundle → trusted store CASの順でcurrent化する。
receiptはrepository identity、namespace policy version/digest、A/B raw/canonical digest、kind別ref count、ref set digest、
sealed mirror digest、unique object/tree/content count、全ref-entry edge count/digest、取得器version、observed/fresh-until、
authority revision/headを持つ。remote件数はreceiptの観測値であり本設計へ固定しない。

captureはcurrent receiptとsealed local mirrorだけを読み、network/fetch/checkoutを行わない。exact 2 receiptの一方でも
missing/stale/driftedならmanifest statusはBLOCKED、capture planは0である。Git authority greenでも
`behavior_atom_closed=false`を維持する。

### §3.0.1 2026-07-15 advertisement観測（authority前段）

同一URLへ`git ls-remote`を二回実行し、`refs/heads/*`、`refs/tags/*`、
`refs/pull/*/{head,merge}`だけをrefname byte順で`<oid>\t<ref>\n`へ正規化した。両repositoryともA/Bは一致した。
これはexact OID materialize、object/tree/tag peel、sealed bundle、content/edge digestをまだ証明しないため、current receiptへ昇格しない。

| repository | observed at UTC | heads | tags | pull head | pull merge | ref total | unique OID | canonical ref-set SHA-256 | A/B | （日本語の機械契約記述）
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| `predecessor-ut` | `2026-07-15T16:11:24Z` | 4 | 0 | 64 | 1 | 69 | 67 | `sha256:b01a2d2416bde5aa9c10e7e6ff0a6e4c0077e5e5db3d2c7205003b2033cb6803` | equal |
| `legacy-helix` | `2026-07-15T16:11:24Z` | 7 | 2 | 7 | 5 | 21 | 16 | `sha256:146907101fcaade4e4dc9b157c814da3551d0fe603984c9acac4ca018468002d` | equal |

後続の一時mirror検査ではremote/local ref set一致、invalid object 0、strict fsck、tag/commit/tree peel、bundle verifyが
exact 2件ともPASSした。ref-entry edgeはUT 106,347件、legacy 38,929件まで固定した。詳細digestは
`infinity-loop-git-authority-observation-2026-07-16.md`を正とする。ただしbundle custodyが一時領域だけなので
trusted CAS receiptは未生成であり、authority statusは`PARTIAL`のままとする。

### §3.0.2 exact 2 machine candidateとpromotion境界

machine candidate正本は`docs/governance/generated/git-ref-authority-candidates-exact2-v1.json`
（SHA-256=`95e2f00dc08d239cfaa1b9a4e946d0886573e7daa4330a3caff38627b2a01d2f`）である。
candidate 2、trusted 0、offline manifest generated 0、coverage credit 0を明示し、ephemeral bundleをcurrent authorityへ
昇格しない。trusted storage policyは`undecided`であり、CAS URI、promotion receipt、retention、immutability、access
controlを確定してからatomic copy、trusted-store digest replay、独立検証、`fresh_until` bindingを行う。

trusted custodyのtarget policyは
`docs/governance/generated/git-trusted-custody-promotion-contract-exact2-v1.json`
（SHA-256=`e944bf33992fcc9a8f6b9d39ca4cfe3ff030d9f4bdbca32e1053b10ca78ebf46`）にmachine contract化した。namespaceは
project-owned `.helix/cas/git-authority/sha256`に限定し、SHA-256 write-once、retention、least-privilege access、append-only
revocation、advertisement B起点の`fresh_until`、bundle/ref/tree/edge receipt、network 0 offline manifest、isolated restore drill、
Nodeのatomic candidate→trusted gateを定義する。ただし`designed-not-executed`であり、project外操作、CAS copy、promotionは0、
trusted/current receiptも0/2である。旧candidate内の`policy=undecided`は観測時点の状態として改変せず、新contractへのexact bindingで後続設計を表す。

offline capture/classificationはnetwork accessを使わず、trusted receiptとtrusted CASだけを入力にする。machine candidate内の
offline recordはexpected ref/content/edge denominatorを保持するが、status=`blocked-no-trusted-authority`、manifest/classification
count=0、digest=`null`である。従ってentry set、classification、behavior atomのcoverage分子には算入しない。

exact2 custody／behavior replay readinessの再実行可能な監査は
`scripts/audit/audit-exact2-custody-replay-readiness.mjs`が生成する
`docs/governance/generated/exact2-custody-replay-readiness-v1.json`
（SHA-256=`21aa2a608ff076da4addc3a829d5657d8f061ee6acc685492745d76ec1d606b0`）を正本とする。

| source | ref | root tree | ref-entry edge | path/content | PR | HIL/HR candidate | candidate test/oracle route | historical retention | trusted/offline/restore/replay | （日本語の機械契約記述）
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| predecessor UT | 69 | 66 | 106,347 | 3,380 | 64 | 64 | 64/64 | 0/64 | 0/1 |
| legacy HELIX | 21 | 13 | 38,929 | 3,287 | 7 | 7 | 7/7 | 0/7 | 0/1 |
| total | 90 | 79 | 145,276 | 6,667 | 71 | 71 | 71/71 | 0/71 | 0/2 |

ephemeral bundleはdigest一致と`git bundle verify`が2/2であってもcandidateに留まり、trusted custodyへ昇格しない。
root-tree set digest、project-owned CAS object、promotion／current receipt、network 0 offline manifest、isolated restore、 （日本語の機械契約記述）
entry classification、behavior atom固定分母、candidate test/oracleの実行、historical retention receiptが未生成であるため、
trusted/current、offline、restore、behavior replay、coverage creditはすべて0である。

PR別のcandidate test/oracle routeとhistorical check/run retention schemaは
`scripts/audit/build-predecessor-pr-test-retention-routes.mjs`が生成する
`docs/governance/generated/predecessor-pr-test-retention-routes-71-v1.json`
（SHA-256=`4f6cf505dfa7763482da01febd6fee03e66d23703d8815737cb744e7476dfd9a`）に固定した。
final reconciliationのHR→current HAT、HIL→current HSTをexact IDで71/71接続し、HATが明示するVisual test IDは該当1件だけに付与した。
各PRはrepository/PR/head/mergeとworkflow run/attempt、check suite/run、lineage、result、sanitized evidence digestを要求し、
共通retention schema digestは`a7837668c8fe6198526ba889a1fd611cac8982c237e10e9aae0849a2932eadf9`である。
これはcandidate設計閉鎖であり、historical artifact取得、retained、trusted、current、runtime verified、coverage creditは0/71のままにする。

### §3.1 historical seedの固定値（current authorityではない）

#### §3.1.1 ref集合と固定値

以下は2026-07-14監査の再現用historical seedであり、current ref集合、active denominator、pair-freeze証拠にしない。
source rootは`git+https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git`だった。
`origin/HEAD`は`origin/main`と同一commitのsymbolic aliasとして旧ref分母から除外していた。

| remote ref | commit | tree | file数 | entry set SHA-256 | main比behind/ahead | 固有delta file数 | 固有binary diff SHA-256 |
|---|---|---|---:|---|---:|---:|---|
| `origin/main` | `e506a67e9c243cc9781ff4a6d8d1870b072fd37b` | `2f0eda9a0ec69213a0a91ea9b1d3030d14f0c720` | 1,784 | `0d4504197ae0213e35d712817f9f4dd4e4b8c9c6409cf49cf38e2b8cf690b188` | 0/0 | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `origin/work/l6-81-agent-registry-design` | `ffb13d6c87b3903fbef89d4632b04b1267ecd772` | `dff1970a4be6e18957e938cbf3ffbc1f12bb8a65` | 1,783 | `861e29bc9642ba2452b53124367836011955e19968cf37a5d90d4f5362f2e8c8` | 5/2 | 1 | `d858def2d0bf410a7ea60b9146d465f2181b415efa3d6a0666163df5fe1d8ff1` |
| `origin/work/l6-82-universal-pr-trigger` | `9bcdbe5af48345af13485c1d098390cd4de935bc` | `188b01f01db15b17c690bdd28b59ca7d3f493ad8` | 1,787 | `5e02ad5daeae7cc22b7a6219a955606b933ffef0297f2fd7da23a65626f2c810` | 0/6 | 11 | `9ccba3db263cc60038f65ebdfe16f372dd13646b817fe08f158fd8d9ca798575` |
| `origin/work/l7-418-plan-asset-v2` | `a588981b4d580ad78f1534bc47fc065ddb5cef01` | `657af0fcb1e38d98a720d73c286cd9fa6aaf1622` | 1,804 | `b3c08942f1d5d4091bb835cb0cc00e81b9e736997ab8c77439f0fe3acc49b289` | 0/25 | 40 | `9a5c3f1a1ef25fab9377b5d3dd885bccf8ff9f7d7e3d61ead9c6aeefa1b2bd67` |
| `origin/work/l7-421-test-hygiene-live-tree-fence` | `c163e6e5d4ec41c8b5192355e10cc5cc88102e50` | `d2f597e3bc64e9147a6ab9f5654d2628ab2ed1d1` | 1,777 | `df55ca7aea39def4b338ff2301a548ea2a4d021c703c84689e9575dee9a02c11` | 47/0 | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

5 refの`ref,commit,tree,file_count,entry_set_digest,unique_delta_digest`行をbyte順に並べたref set digestは
`sha256:db6c53889752df15487ae64cadab8794dcfdd1c2cc9b7cbe929122500d9fd432`である。
全ref treeのpathをref別に保持した構造分類manifestは8,935行で、digestは
`sha256:1eb4b1e3e4d086aa1d713b100e013c8970a18a7ac2f7bfa68fb7b3515a43a1cf`である。
同一path/blobが複数refに存在してもentry分類では落とさず、behavior atom段階でsource spanを束ねる。

### §3.2 historical seed再現command（current authority生成禁止）

`UT_INSPECTION_ROOT`はhistorical inspection cloneを指す。以下のheads-only commandはpull/tagsを欠落させるため、
current authority生成に使用してはならない。旧digestの調査再現だけに限定する。

```bash
git -C "$UT_INSPECTION_ROOT" fetch --prune origin \
  '+refs/heads/*:refs/remotes/origin/*'

REFS=(
  origin/main
  origin/work/l6-81-agent-registry-design
  origin/work/l6-82-universal-pr-trigger
  origin/work/l7-418-plan-asset-v2
  origin/work/l7-421-test-hygiene-live-tree-fence
)

git -C "$UT_INSPECTION_ROOT" for-each-ref \
  --format='%(refname) %(objectname)' refs/remotes/origin

for ref in "${REFS[@]}"; do
  git -C "$UT_INSPECTION_ROOT" rev-parse "$ref"
  git -C "$UT_INSPECTION_ROOT" rev-parse "$ref^{tree}"
  git -C "$UT_INSPECTION_ROOT" ls-tree -r --name-only "$ref" | wc -l
  git -C "$UT_INSPECTION_ROOT" ls-tree -r -z --full-tree "$ref" | sha256sum
  git -C "$UT_INSPECTION_ROOT" rev-list --left-right --count origin/main..."$ref"
  git -C "$UT_INSPECTION_ROOT" diff --name-only origin/main..."$ref" | wc -l
  git -C "$UT_INSPECTION_ROOT" diff --binary --full-index origin/main..."$ref" | sha256sum
done

for ref in "${REFS[@]}"; do
  git -C "$UT_INSPECTION_ROOT" ls-tree -r --name-only "$ref" |
    awk -F/ -v ref="$ref" \
      'BEGIN{OFS="\t"} {g=(NF>1?$1:"root"); print ref,"tree-entry","P",$0,g}'
done | LC_ALL=C sort | sha256sum
```

path分類commandは、対象treeにtab/LFを含むpathが0件であることを前提にする。capture時は次のNUL走査も行い、
0以外ならTS/PythonのNUL-safe extractorへfail-closeで切り替える。

```bash
git -C "$UT_INSPECTION_ROOT" ls-tree -r -z --name-only origin/main |
  tr -cd '\n\t' | wc -c
```

### §3.3 historical seedの除外、unique、foreign方針

- `origin/HEAD`はaliasとしてref分母から除外するが、alias target一致はmanifestへ記録する。
- local branch、inspection cloneのindex/worktree、reflog、object databaseの未到達objectはsource entryに含めない。
- 観測cloneは当時tag 0件、working tree change 0件だった。この事実をcurrent namespace policyへ流用しない。
- main共通entryをbranchごとにbehavior数へ重複算入しない。ただし全5 treeのentry set digestは個別に保持する。
- unique deltaは`merge-base..branch`の探索面であり、file数をbehavior数へ変換しない。
- `work/l7-421-test-hygiene-live-tree-fence`はmainのancestor、ahead=0、unique delta=0である。aggregate absorbedを
  示せるが、他branchの子atomを代替しない。
- この観測にはfetch完了timestampの永続receiptがなく、remote ref集合の鮮度は`stale`である。v2 current authorityへ
  昇格せず、§3.0のA/B取得から作り直す。

### §3.4 v1 historical denominator（履歴分母）

旧family digest `sha256:a36c7884260dbb86573748a040b7a23ea2463ad612dadc163e664b8abaecfa4b`、
旧entry分母4,470、旧固定5 ref、旧ref-entry 8,935行はgap比較専用である。`historical_seed=true`、
`authority_reuse_allowed=false`、`coverage_reuse_allowed=false`として扱い、v2 manifest digestへ含めない。

## §4 現行HELIX source family

### §4.1 固定値とscope

| field | value |
|---|---|
| `family_id` | `CURRENT-HELIX` |
| snapshot ID | `CURRENT-HELIX-fcbf942835d0014e` |
| producer | `helix-source-capture.v2-design/manual-command-receipt` |
| source root | `repo://HELIX-HARNESS` |
| HEAD commit | `fcbf942835d0014e38c7e20fbd471580fd41af33` |
| HEAD tree | `4d923890bcd0b19bfbd659aad2e1d9f9a8b86c61` |
| primary scope | commit済みHEAD full tree |
| scoped entry count | 1,854 |
| breakdown | `src=359`、`tests=295`、`docs=1,200` |
| scope内entry set digest | `sha256:9d2f92a4072def2e9d5bad36114f99a2f38e6452c9d531d40dc81ab32df45410` |
| HEAD全tree file数 | 2,029 |
| HEAD全entry set digest | `sha256:b73bcae478b3c7a26d083ee056db5d999af251920af40d7a83a586ba8db7b518` |
| scope外tracked数 | 175 |
| full-tree分類digest | `sha256:44e4f685a945e70ba47cb9d56bb5bcefc4e0b370524a56b8e346c0ddc2676800` |
| core分類digest | `sha256:65e2a63f001cae07f572908ef9ed67051732bfb1656ecc0ecec2fb543d6e0cf5` |
| classification group count | core 53、outside 8、full 61 | （日本語の機械契約記述）
| unsafe path telemetry | unclassified 0、tab path 0、LF path 0 | （日本語の機械契約記述）
| `entry_set_closed` | `true`、2,029/2,029 |
| repository-wide closure | `true`（seed commitのtracked full tree） |
| `classification_set_closed` | `true`、2,029/2,029 |
| `behavior_atom_closed` | `false` |

core 1,854とoutside 175を非交差partitionとして同じCURRENT familyへ含める。outsideは別の意味分類へroutingするが、
source分母から除外しない。HEAD更新後は直前snapshotの件数を恒久定数として期待せず、新count/digestのsnapshotを発行する。

### §4.2 正規再生成command

```bash
SNAPSHOT_COMMIT=fcbf942835d0014e38c7e20fbd471580fd41af33
git rev-parse "$SNAPSHOT_COMMIT"
git rev-parse "$SNAPSHOT_COMMIT^{tree}"
git ls-tree -r --name-only "$SNAPSHOT_COMMIT" -- src tests docs | wc -l
git ls-tree -r -z --full-tree "$SNAPSHOT_COMMIT" -- src tests docs | sha256sum

git ls-tree -r --name-only "$SNAPSHOT_COMMIT" -- src tests docs |
  awk -F/ '
    {
      if ($1=="src") {
        g=(NF==2&&$2=="cli.ts"?"src:cli":"src:"$2)
      } else if ($1=="docs") {
        g=(NF==2?"docs:top-level":"docs:"$2)
      } else {
        g=(NF==2?"tests:root":"tests:"$2)
      }
      print $0 "\t" g
    }
  ' | sha256sum

git -c core.quotePath=false ls-tree -r --name-only "$SNAPSHOT_COMMIT" | wc -l
git ls-tree -r -z --full-tree "$SNAPSHOT_COMMIT" | sha256sum
git -c core.quotePath=false ls-tree -r --name-only "$SNAPSHOT_COMMIT" |
  awk -F/ '
    {
      if ($1=="src") g=(NF==2&&$2=="cli.ts"?"src:cli":"src:"$2)
      else if ($1=="docs") g=(NF==2?"docs:top-level":"docs:"$2)
      else if ($1=="tests") g=(NF==2?"tests:root":"tests:"$2)
      else if ($1==".helix") g="outside:.helix"
      else if ($1==".claude") g="outside:.claude"
      else if ($1=="config") g="outside:config"
      else if ($1==".github") g="outside:.github"
      else if ($1==".codex") g="outside:.codex"
      else if ($1=="scripts") g="outside:scripts"
      else if (NF==1 && $0=="ハイブリッド設計ドキュメントv1-fixed.zip") g="outside:root-zip"
      else if (NF==1) g="outside:root"
      else g="unclassified"
      print $0 "\t" g
    }
  ' | sha256sum
# working tree telemetry。snapshot closureには算入しない。
git diff --quiet "$SNAPSHOT_COMMIT" --
```

### §4.3 除外とforeign policy

HEADのoutside 175 tracked entryは削除・無視せず、CURRENT family内で次の意味分類へroutingする。

| scope外group | count | 移管先 |
|---|---:|---|
| `.helix/` tracked evidence | 105 | evidence/source custody台帳 |
| `.claude/` | 34 | runtime adapter/agent registry台帳 |
| `config/` | 12 | schema/config manifest |
| `.github/` | 6 | CI/source trigger manifest |
| `.codex/` | 2 | runtime adapter/hook台帳 |
| `scripts/` | 2 | OS entrypoint manifest |
| root ZIP | 1 | `ZIP-HYBRID-V1`で別捕捉 |
| root files/config/license | 13 | distribution/supply-chain台帳 |
| **合計** | **175** | full-tree分母へ含め、coreと混同しない |

working treeのmodified/untracked fileは他runtimeの正規作業であり、HEAD sourceへ含めない。capture時に
`git status --porcelain=v1 -z`のdigestと件数をtelemetryとして記録できるが、entry set digest、分類率、
behavior coverageの分母にはしない。本書自身を含むuntracked設計成果も、commitされるまでCURRENT-HELIXの
baselineではない。

## §5 closure判定とstale条件

| family | source entry閉包 | 構造分類閉包 | remote/current鮮度 | behavior atom閉包 | Source Coverage freeze |
|---|---|---|---|---|---|
| ZIP | PASS 703/703 | PASS 703/703 | archive digest固定 | **FAIL** | FAIL |
| predecessor UT Git | **PARTIAL** candidate 1、trusted/current 0 | **BLOCKED** offline capture 0 | A/B一致、ephemeral seal observed、trusted CAS pending | **FAIL** | FAIL |
| legacy HELIX Git | **PARTIAL** candidate 1、trusted/current 0 | **BLOCKED** offline capture 0 | A/B一致、ephemeral seal observed、trusted CAS pending | **FAIL** | FAIL |
| 現行HELIX | PASS full-tree 2,029/2,029 | PASS 2,029/2,029 | commit/tree固定 | **FAIL** | FAIL |

次のいずれかで本manifestをstale化する。

1. ZIP archive SHA、entry count、entry set digest、classification digestの変化。
2. required repository identity、namespace policy、advertisement A/B、ref set、sealed mirror、authority receipt setの変化。
3. 現行HELIX baseline commit/tree、full-tree partition rule、count/digestの変更。
4. extractor/classification version、path ordering、serialization規則の変更。
5. exact 2 repository setの増減、excluded groupを本scopeへ昇格、または別manifestへ移管するrouting変更。

entry set greenはAtomizer開始条件であり、pair-freeze条件ではない。次段では本manifest digestへbindして
source spanとbehavior atomを生成し、aggregate parent算入0、generated fixture orphan 0、pending 0、
unjustified reject 0、HIL/design/assertion/gate orphan 0を別receiptで証明する。
