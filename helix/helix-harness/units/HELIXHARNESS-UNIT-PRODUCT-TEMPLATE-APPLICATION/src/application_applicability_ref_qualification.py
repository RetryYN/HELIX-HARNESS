"""Reference identity and source qualification helpers for FN3."""

import copy

from application_input_schema import _json_equal, _valid


_REF_FIELDS = (
    "identity",
    "revision",
    "scope",
    "owner",
    "source_locator",
    "sha256",
)


def _same_full_ref(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return all(_json_equal(left.get(field), right.get(field)) for field in _REF_FIELDS)


def _same_ref_ignoring_sha(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    for field in ("identity", "revision", "scope", "owner", "source_locator"):
        if not _json_equal(left.get(field), right.get(field)):
            return False
    left_sha = left.get("sha256")
    right_sha = right.get("sha256")
    if left_sha is not None and right_sha is not None:
        return left_sha == right_sha
    return True


def _is_formed_ref(ref):
    if not isinstance(ref, dict):
        return False
    if set(ref.keys()) != set(_REF_FIELDS):
        return False
    if not _valid(ref, "Ref"):
        return False
    if not isinstance(ref.get("identity"), str) or not ref["identity"]:
        return False
    if not isinstance(ref.get("revision"), str) or not ref["revision"]:
        return False
    if not isinstance(ref.get("owner"), str) or not ref["owner"]:
        return False
    return isinstance(ref.get("scope"), dict)


def _record_qualification_info(
    raw,
    collection,
    record,
    unusable_source_refs,
    product_scope,
    expected_revision,
):
    if not isinstance(record, dict):
        return False, []
    source_ref = record.get("source_ref")
    if not _is_formed_ref(source_ref):
        return False, []
    if not _json_equal(source_ref.get("scope"), product_scope):
        return False, []
    if source_ref.get("revision") != expected_revision:
        return False, []
    if any(_same_ref_ignoring_sha(source_ref, u) for u in unusable_source_refs):
        return False, []

    sources = raw.get("sources")
    qualifications = raw.get("qualifications")
    roots = raw.get("qualification_roots")
    if (
        not isinstance(sources, list)
        or not isinstance(qualifications, list)
        or not isinstance(roots, list)
    ):
        return False, []

    expected_payload = {k: v for k, v in record.items() if k != "source_ref"}
    observed_refs = []
    qualified = False

    for source in sources:
        if not isinstance(source, dict):
            continue
        s_ref = source.get("ref")
        if not _same_ref_ignoring_sha(s_ref, source_ref):
            continue
        if any(_same_full_ref(s_ref, u) for u in unusable_source_refs):
            continue
        body = source.get("body")
        if not isinstance(body, dict) or not isinstance(body.get("records"), list):
            continue
        has_record = any(
            isinstance(entry, dict)
            and entry.get("collection") == collection
            and _same_full_ref(entry.get("ref"), record.get("ref"))
            and _json_equal(entry.get("payload"), expected_payload)
            for entry in body["records"]
        )
        if not has_record:
            continue
        q_ref = source.get("qualification_ref")
        if not _is_formed_ref(q_ref):
            continue
        for qual in qualifications:
            if not isinstance(qual, dict):
                continue
            if not _same_full_ref(qual.get("ref"), q_ref):
                continue
            if not _json_equal(qual.get("scope"), product_scope):
                continue
            if qual.get("owner") != source_ref.get("owner"):
                continue
            if qual.get("subject_sha256") != s_ref.get("sha256"):
                continue
            root_ref = qual.get("root_ref")
            if not _is_formed_ref(root_ref):
                continue
            for root in roots:
                if not isinstance(root, dict):
                    continue
                if not _same_full_ref(root, root_ref):
                    continue
                if not _json_equal(root.get("scope"), product_scope):
                    continue
                if root.get("owner") != qual.get("owner"):
                    continue
                observed_refs.append(copy.deepcopy(qual["ref"]))
                observed_refs.append(copy.deepcopy(root))
                qualified = True

    return qualified, observed_refs
