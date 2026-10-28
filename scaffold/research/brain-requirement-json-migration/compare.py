"""この研究候補だけを固定原文へ静的照合する。製品renderer・意味判定器ではない。"""

from pathlib import Path
import copy
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
REVISION = "0437a7886aa2d61c9121fde1a3c4e6459c09ca65"
SOURCES = {
    "brain-requirements.json": (
        "docs/helix-brain/L2-requirements/brain-requirements.md",
        "ef41de572d35912a0345dad2960a3ae7015ca5434d67247503785b9f65e8346c",
    ),
    "brain-acceptance.json": (
        "docs/helix-brain/L11-acceptance/brain-acceptance.md",
        "b48433e20139daa2f6cd7da7bac1b35e1634fd802d68ada87a93a7d3d7b44c87",
    ),
}
IDS = {f"HELIXBRAIN-L2-{n:03d}" for n in [*range(1, 13), *range(18, 33)]}
IDS |= {f"HELIXBRAIN-L2-INFRA-{n:03d}" for n in range(1, 18)}


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def blob(path):
    return subprocess.check_output(["git", "show", REVISION + ":" + path], cwd=ROOT)


def value_at(document, pointer):
    assert pointer.startswith("/")
    value = document
    for token in pointer[1:].split("/"):
        assert re.search(r"~(?![01])", token) is None
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    assert isinstance(value, str)
    return value


def reconstruct(document):
    # 固定候補内の文字列だけを読む。原MDを返すfallback・外部refは無い。
    pieces = []
    for operation in document["surface_recipe"]:
        assert set(operation) in ({"ref"}, {"literal"})
        pieces.append(
            value_at(document, operation["ref"])
            if "ref" in operation
            else operation["literal"]
        )
    return "".join(pieces).encode("utf-8")


def source_structure(text):
    # この二文書の明示見出しとラベルだけを調べる。Markdown一般のparserではない。
    headings, facets = [], {}
    owner = None
    for line in text.splitlines():
        heading = re.match(r"^(#{1,6})[ \t]+(.+)$", line)
        if heading:
            title = heading[2]
            match = re.match(r"(HELIXBRAIN-L2-(?:INFRA-)?[0-9]{3})(.*)$", title)
            owner = match[1] if match else None
            headings.append((len(heading[1]), title, owner))
            if owner:
                assert owner not in facets
                facets[owner] = []
        # colon自体と本文の空白はsourceで確認し、未知のlabelを既存6項目へ圧縮しない。
        label = re.match(r"^\s*(?:-\s*)?\*\*(.+?)\*\*：(.*)$", line)
        if owner and label:
            facets[owner].append((label[1], label[2]))
    return headings, facets


def inspect(document, raw, is_l2):
    assert document["authority_effect"] == "none"
    assert document["candidate_status"] == "research_only_unadopted"
    assert document["approval_inheritance"] == "not_inherited_to_candidate_bytes"
    assert document["source"]["revision"] == REVISION
    assert document["source"]["sha256"] == digest(raw)
    assert document["source"]["bytes"] == len(raw)
    assert reconstruct(document) == raw
    records = document["requirements" if is_l2 else "acceptance_records"]
    identities = [
        r["identity"]["requirement_id"] if is_l2 else r["requirement_id"]
        for r in records
    ]
    assert len(identities) == len(set(identities)) == 44 and set(identities) == IDS
    headings, expected_facets = source_structure(raw.decode("utf-8"))
    non_id = [(level, title) for level, title, owner in headings if owner is None]
    assert non_id == [(h["level"], h["text"]) for h in document["headings"]]
    record_by_id = dict(zip(identities, records))
    compared_facets = 0
    for level, title, owner in headings:
        if owner is None:
            continue
        record = record_by_id[owner]
        detail = record["detail_heading"]
        assert detail["heading_level"] == level
        assert owner + detail["between_id_and_title"] + detail["title"] == title
        actual_facets = [
            (b["source_label"], b["raw_value"])
            for b in record["body"]
            if b["kind"] == "source_labeled_text"
        ]
        assert actual_facets == expected_facets[owner], owner
        compared_facets += len(actual_facets)
    rows = []
    for line in raw.decode("utf-8").splitlines():
        if line.startswith("| HELIXBRAIN-L2-"):
            cells = [c.strip() for c in line.split("|")[1:-1]]
            rows.append(cells)
    # BRAINのこの一覧に限る。注記/原source等の別tableを抽出して要求へ昇格しない。
    assert len(rows) == 40
    if is_l2:
        assert [row[0] for row in rows] == document["catalogue"]["source_row_order"]
        for identity, kind, parent, capability, version in rows:
            catalogue = record_by_id[identity]["catalogue"]
            assert [
                catalogue[k]
                for k in (
                    "kind",
                    "parent_l1_source_value",
                    "capability_summary",
                    "version_target",
                )
            ] == [kind, parent, capability, version]
    else:
        assert [row[0] for row in rows] == document["acceptance_matrix"][
            "source_row_order"
        ]
        for identity, version, conditions in rows:
            matrix = record_by_id[identity]["acceptance_matrix"]
            assert [
                matrix["version_target"],
                matrix["success_conditions_and_counterexamples"],
            ] == [version, conditions]
    return {
        "identities": 44,
        "table_rows": 40,
        "typed_headings_checked": len(headings),
        "original_labeled_facets_checked": compared_facets,
    }


def main():
    documents, raw_sources, results = {}, {}, {}
    for name, (path, expected_digest) in SOURCES.items():
        raw = blob(path)
        assert digest(raw) == expected_digest
        document = json.loads((HERE / name).read_text())
        assert document["source"]["path"] == path
        results[name] = inspect(document, raw, name == "brain-requirements.json")
        results[name].update(
            {
                "candidate_sha256": digest((HERE / name).read_bytes()),
                "candidate_bytes": (HERE / name).stat().st_size,
                "source_bytes": len(raw),
                "restored_sha256": digest(reconstruct(document)),
            }
        )
        documents[name], raw_sources[name] = document, raw
    negative = {}
    changed = copy.deepcopy(documents["brain-requirements.json"])
    facet = next(
        b
        for r in changed["requirements"]
        if r["identity"]["requirement_id"] == "HELIXBRAIN-L2-001"
        for b in r["body"]
        if b.get("source_label") == "提供するもの"
    )
    assert (
        facet["raw_value"]
        == "領域identity、意味、状態、Patternとの関係を識別できる分類構造。"
    )
    facet["raw_value"] += "変更検出用"
    assert reconstruct(changed) != raw_sources["brain-requirements.json"]
    negative["meaning_edit_changes_view_without_surface_edit"] = True
    for mode in (
        "remove_032",
        "change_shared_condition",
        "swap_acceptance_conditions",
        "wrong_heading_level",
    ):
        is_l2 = mode != "swap_acceptance_conditions"
        name = "brain-requirements.json" if is_l2 else "brain-acceptance.json"
        changed = copy.deepcopy(documents[name])
        if mode == "remove_032":
            changed["requirements"] = [
                r
                for r in changed["requirements"]
                if r["identity"]["requirement_id"] != "HELIXBRAIN-L2-032"
            ]
        elif mode == "change_shared_condition":
            shared = next(
                x for x in changed["source_content"] if "本書は" in x["raw_text"]
            )
            shared["raw_text"] += "条件の不正な変更"
        elif mode == "wrong_heading_level":
            changed["headings"][0]["level"] += 1
        else:
            records = changed["acceptance_records"]
            (
                records[0]["acceptance_matrix"][
                    "success_conditions_and_counterexamples"
                ],
                records[1]["acceptance_matrix"][
                    "success_conditions_and_counterexamples"
                ],
            ) = (
                records[1]["acceptance_matrix"][
                    "success_conditions_and_counterexamples"
                ],
                records[0]["acceptance_matrix"][
                    "success_conditions_and_counterexamples"
                ],
            )
        try:
            inspect(changed, raw_sources[name], is_l2)
        except (AssertionError, IndexError, KeyError):
            negative[mode] = True
        else:
            raise AssertionError("検出できなかった反例: " + mode)
    print(
        json.dumps(
            {
                "evidence_kind": "scaffold",
                "authority_effect": "none",
                "scope": "固定二文書の全bytes・原ラベル/ID/表/見出し対応の静的照合",
                "source_revision": REVISION,
                "results": results,
                "negative_controls": negative,
                "limits": [
                    "研究候補の範囲だけ。将来編集後の意味同等性、Markdown一般の仕様、正式schema、製品TDD、authority移行を判定しない。",
                    "source_content内の共通条件/旧source等の意味分類は未完。全bytesは保持している。",
                    "current44要求の一括承認、他14文書の移行、製品runtime/CI/受入の成立は主張しない。",
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
