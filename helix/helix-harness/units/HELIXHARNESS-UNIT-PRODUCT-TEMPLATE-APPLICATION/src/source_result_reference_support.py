"""JSON pointer, equality, owner-routing, and row-construction helpers for FN12."""

import copy

REQUIRED_AXES = ("identity", "revision", "scope", "owner")

SOURCE_ENVELOPE_REQUIRED_MEMBERS_EXCEPT_RESULT_REF = (
    "/source_envelope_ref",
    "/qualification_claim/subject_ref",
    "/qualification_claim/subject_revision",
    "/qualification_claim/subject_scope",
    "/qualification_claim/subject_owner",
    "/row_binding/application_policy_ref",
    "/row_binding/template_ref",
    "/row_binding/binding",
    "/material/disposition",
    "/material/condition_pairs",
    "/material/obligation_refs",
    "/role",
)

SOURCE_COMPARISON_PAIRS = (
    ("/qualification_claim/subject_ref", "/application_input/input_ref"),
    ("/qualification_claim/subject_revision", "/application_input/input_ref/revision"),
    ("/qualification_claim/subject_scope", "/application_input/input_ref/scope"),
    ("/qualification_claim/subject_owner", "/application_input/input_ref/owner"),
    ("/row_binding/application_policy_ref", "/computed_row/application_policy_ref"),
    ("/row_binding/template_ref", "/computed_row/template_ref"),
    ("/row_binding/binding", "/computed_row/binding"),
    ("/material/disposition", "/computed_row/disposition"),
    ("/material/condition_pairs", "/computed_row/condition_pairs"),
    ("/material/obligation_refs", "/computed_row/obligation_refs"),
    ("/material/na_attributes", "/computed_row/na_attributes"),
)

OWNER_SEMANTIC_AXES = (
    (
        "BRAIN",
        (
            "/row_binding/template_ref",
            "/row_binding/binding/template_ref",
            "/application_input/binding/template_ref",
        ),
    ),
    (
        "HARNESS008",
        (
            "/row_binding/binding/requirement_ref",
            "/row_binding/binding/product_scope",
            "/application_input/binding/requirement_ref",
            "/application_input/binding/product_scope",
        ),
    ),
    (
        "HARNESS",
        (
            "/row_binding/application_policy_ref",
            "/row_binding/binding/process_contract_ref",
            "/row_binding/binding/application_contract_ref",
            "/material/disposition",
            "/material/condition_pairs",
            "/material/obligation_refs",
            "/material/na_attributes",
            "/application_input/binding/process_contract_ref",
            "/application_input/binding/application_contract_ref",
        ),
    ),
    ("OS", ("/material/usage_record",)),
)


def is_obj(value):
    return isinstance(value, dict)


def escape_ptr(segment):
    return str(segment).replace("~", "~0").replace("/", "~1")


def get_path(root, pointer):
    if not pointer:
        return True, root
    cur = root
    for raw_seg in pointer.lstrip("/").split("/"):
        seg = raw_seg.replace("~1", "/").replace("~0", "~")
        if isinstance(cur, dict):
            if seg not in cur:
                return False, None
            cur = cur[seg]
        elif isinstance(cur, list):
            try:
                idx = int(seg)
            except ValueError:
                return False, None
            if idx < 0 or idx >= len(cur):
                return False, None
            cur = cur[idx]
        else:
            return False, None
    return True, cur


def presence_of(root, key):
    if isinstance(root, dict) and key in root:
        return {"presence": "present", "value": copy.deepcopy(root[key])}
    return {"presence": "absent"}


def json_equal(left, right):
    if type(left) is bool or type(right) is bool:
        return type(left) is type(right) and left == right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return left == right
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        if set(left.keys()) != set(right.keys()):
            return False
        return all(json_equal(left[k], right[k]) for k in left)
    if isinstance(left, list):
        if len(left) != len(right):
            return False
        return all(json_equal(x, y) for x, y in zip(left, right))
    return left == right


def dedup(seq):
    out = []
    seen = set()
    for item in seq:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def _match_prefix(pointer, prefix):
    return pointer == prefix or pointer.startswith(prefix + "/")


def _to_source_route_path(pointer):
    if pointer == "/computed_row" or pointer.startswith("/computed_row/"):
        for src_p, cmp_p in SOURCE_COMPARISON_PAIRS:
            if cmp_p.startswith("/computed_row/") and _match_prefix(pointer, cmp_p):
                return src_p + pointer[len(cmp_p) :]
        return None
    return pointer


def resolve_logical_owner(source_relation, diff_paths, miss_paths):
    if source_relation == "content_corresponding":
        return "not_required"
    all_paths = list(diff_paths) + list(miss_paths)
    if not all_paths:
        return "unknown"
    owners = set()
    for path in all_paths:
        mapped = _to_source_route_path(path)
        if mapped is None:
            return "unknown"
        matched_owner = None
        for owner, prefixes in OWNER_SEMANTIC_AXES:
            if any(_match_prefix(mapped, pref) for pref in prefixes):
                matched_owner = owner
                break
        if matched_owner is None:
            return "unknown"
        owners.add(matched_owner)
    if len(owners) == 1:
        return next(iter(owners))
    return "unknown"


def eval_selector_side(root_obj, slot_ptr, diag_slot_ptr, diag_axis_ptr):
    ok_slot, slot_val = get_path(root_obj, slot_ptr)
    if not ok_slot:
        return False, None, diag_axis_ptr
    if slot_val is None or not is_obj(slot_val):
        return False, None, diag_slot_ptr
    if "identity" not in slot_val:
        return False, None, diag_axis_ptr
    id_val = slot_val["identity"]
    if not isinstance(id_val, str):
        return False, None, diag_axis_ptr
    return True, id_val, None


def compare_values_recursive(src_val, cmp_val, src_ptr, cmp_ptr, diff_out, miss_out):
    if is_obj(src_val) and is_obj(cmp_val):
        all_keys = sorted(
            set(src_val.keys()) | set(cmp_val.keys()),
            key=lambda k: escape_ptr(k).encode("utf-8"),
        )
        for key in all_keys:
            esc = escape_ptr(key)
            s_sub = f"{src_ptr}/{esc}"
            c_sub = f"{cmp_ptr}/{esc}"
            in_s = key in src_val
            in_c = key in cmp_val
            if in_s and not in_c:
                miss_out.append(c_sub)
            elif in_c and not in_s:
                miss_out.append(s_sub)
            else:
                compare_values_recursive(
                    src_val[key], cmp_val[key], s_sub, c_sub, diff_out, miss_out
                )
        return
    if isinstance(src_val, list) and isinstance(cmp_val, list):
        max_len = max(len(src_val), len(cmp_val))
        for idx in range(max_len):
            s_sub = f"{src_ptr}/{idx}"
            c_sub = f"{cmp_ptr}/{idx}"
            if idx >= len(src_val):
                miss_out.append(s_sub)
            elif idx >= len(cmp_val):
                miss_out.append(c_sub)
            else:
                compare_values_recursive(
                    src_val[idx], cmp_val[idx], s_sub, c_sub, diff_out, miss_out
                )
        return
    if not json_equal(src_val, cmp_val):
        diff_out.append(src_ptr)


def build_result_row(
    computed_row,
    source_envelopes_input,
    candidates,
    source_relation,
    source_relation_reason,
    diff_paths,
    miss_paths,
):
    dedup_diff = dedup(diff_paths)
    dedup_miss = dedup(miss_paths)
    owner = resolve_logical_owner(source_relation, dedup_diff, dedup_miss)
    return {
        "application_policy_ref": presence_of(computed_row, "application_policy_ref"),
        "template_ref": presence_of(computed_row, "template_ref"),
        "binding": presence_of(computed_row, "binding"),
        "computed_disposition": presence_of(computed_row, "disposition"),
        "computed_condition_pairs": presence_of(computed_row, "condition_pairs"),
        "computed_obligation_refs": presence_of(computed_row, "obligation_refs"),
        "computed_na_attributes": presence_of(computed_row, "na_attributes"),
        "source_envelopes_input": copy.deepcopy(source_envelopes_input),
        "source_candidate_envelopes": copy.deepcopy(candidates),
        "candidate_count": len(candidates),
        "source_result_ref_claims": [
            presence_of(cand, "result_ref") for cand in candidates
        ],
        "source_qualification_claims": [
            presence_of(cand, "qualification_claim") for cand in candidates
        ],
        "source_relation": source_relation,
        "source_relation_reason": source_relation_reason,
        "source_relation_difference_paths": dedup_diff,
        "source_relation_missing_paths": dedup_miss,
        "actual_source_qualification": "not_established",
        "logical_backflow_owner": owner,
        "actual_recipient_qualification": "not_established",
        "decision_impact": "none",
        "source_role_claims": [presence_of(cand, "role") for cand in candidates],
    }
