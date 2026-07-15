---
title: "HELIX Infinity Loop source snapshot manifest"
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: Codex / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
requirements:
  - HIL-FR-16
  - HIL-FR-21
  - HIL-FR-22
contract: docs/governance/infinity-loop-source-atomization-contract.md
extractor_version: helix-source-capture.v2-design
classification_version: helix-source-entry-classification.v1
captured_at: 2026-07-14T16:48:41Z
---

# HELIX Infinity Loop source snapshot台帳

## §0 目的と判定境界

本書は、Infinity Loop要件で参照するZIP、前身Git repository exact 2件、現行HELIXについて、source root、
authority receipt、entry集合、再生成command、digest、分類manifest、除外境界を固定する。全pathを本文へ転記せず、
同じ母集団を機械的に再生成できる情報を正本とする。前身Gitはremoteの可変件数を本文へ固定せず、current
`GitRefAuthorityReceiptV1`のref/content/edge denominatorとdigestだけをauthorityにする。

本書が証明するのは**固定したentry集合の閉包**と**全entryへの構造分類の付与**までである。file、branch、
module群をbehaviorと同一視しない。`behavior_atom_closed`は3 familyすべて`false`であり、
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
| `PREDECESSOR-UT-GIT` | `git+https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS.git` | receipt-derived | `pending:git-authority-receipt` | `pending:offline-capture` | `false`（current receipt未生成） | `false` |
| `LEGACY-HELIX-GIT` | `git+https://github.com/RetryYN/ai-dev-kit-vscode.git` | receipt-derived | `pending:git-authority-receipt` | `pending:offline-capture` | `false`（current receipt未生成） | `false` |
| `CURRENT-HELIX` | `repo://HELIX-HARNESS@9c8d09c224c5fc506eb314933519981dadfea3e9` | 1,931 full-tree path件数 | `sha256:b9708d6c5a7e85607ec7f481841f50f711f9f6e8fc7fad052d6a71a46d4fec09` | `sha256:d7d54c8bf4a7c1bb15fdbdc85e74a36d61eb33e6c0046a31598cc9974f4a3256` | `true`（full tree） | `false` |

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

## §3 前身2 repository Git authority

### §3.0 current authority契約

required repository setは次のexact 2件である。

| repository ID（リポジトリID） | canonical owner/repo（正規owner/repo） | authority status（権限状態） | current receipt（現行receipt） |
|---|---|---|---|
| `predecessor-ut` | `unison-ai-product/UT-TDD_AGENT-HARNESS` | **BLOCKED** | `pending:git-authority-receipt` |
| `legacy-helix` | `RetryYN/ai-dev-kit-vscode` | **BLOCKED** | `pending:git-authority-receipt` |

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
| source root | `repo://HELIX-HARNESS` |
| HEAD commit | `9c8d09c224c5fc506eb314933519981dadfea3e9` |
| HEAD tree | `ae66a258ac26c0578fcdcc69a4bbcfb277860c26` |
| primary scope | commit済みHEAD full tree |
| scoped entry count | 1,756 |
| breakdown | `src=359`、`tests=293`、`docs=1,104` |
| scope内entry set digest | `sha256:c2f8efe24e5b7713b039f95db62654c8d8c82009e1a580f803a896b2028a867c` |
| HEAD全tree file数 | 1,931 |
| HEAD全entry set digest | `sha256:b9708d6c5a7e85607ec7f481841f50f711f9f6e8fc7fad052d6a71a46d4fec09` |
| scope外tracked数 | 175 |
| full-tree分類digest | `sha256:d7d54c8bf4a7c1bb15fdbdc85e74a36d61eb33e6c0046a31598cc9974f4a3256` |
| `entry_set_closed` | `true`、1,931/1,931 |
| repository-wide closure | `true`（seed commitのtracked full tree） |
| `classification_set_closed` | `true`、1,931/1,931 |
| `behavior_atom_closed` | `false` |

core 1,756とoutside 175を非交差partitionとして同じCURRENT familyへ含める。outsideは別の意味分類へroutingするが、
source分母から除外しない。seed commit以降のHEADは恒久定数1,931を期待せず、新count/digestのsnapshotを発行する。

### §4.2 正規再生成command

```bash
git rev-parse HEAD
git rev-parse 'HEAD^{tree}'
git ls-tree -r --name-only HEAD -- src tests docs | wc -l
git ls-tree -r -z --full-tree HEAD -- src tests docs | sha256sum

git ls-tree -r --name-only HEAD -- src tests docs |
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

git -c core.quotePath=false ls-tree -r --name-only HEAD | wc -l
git ls-tree -r -z --full-tree HEAD | sha256sum
git -c core.quotePath=false ls-tree -r --name-only HEAD |
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
git diff --quiet HEAD --
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
| predecessor UT Git | **BLOCKED** receipt未生成 | **BLOCKED** offline capture未実行 | current A/B receiptなし | **FAIL** | FAIL |
| legacy HELIX Git | **BLOCKED** receipt未生成 | **BLOCKED** offline capture未実行 | current A/B receiptなし | **FAIL** | FAIL |
| 現行HELIX | PASS full-tree 1,931/1,931 | PASS 1,931/1,931 | commit/tree固定 | **FAIL** | FAIL |

次のいずれかで本manifestをstale化する。

1. ZIP archive SHA、entry count、entry set digest、classification digestの変化。
2. required repository identity、namespace policy、advertisement A/B、ref set、sealed mirror、authority receipt setの変化。
3. 現行HELIX baseline commit/tree、full-tree partition rule、count/digestの変更。
4. extractor/classification version、path ordering、serialization規則の変更。
5. exact 2 repository setの増減、excluded groupを本scopeへ昇格、または別manifestへ移管するrouting変更。

entry set greenはAtomizer開始条件であり、pair-freeze条件ではない。次段では本manifest digestへbindして
source spanとbehavior atomを生成し、aggregate parent算入0、generated fixture orphan 0、pending 0、
unjustified reject 0、HIL/design/assertion/gate orphan 0を別receiptで証明する。
