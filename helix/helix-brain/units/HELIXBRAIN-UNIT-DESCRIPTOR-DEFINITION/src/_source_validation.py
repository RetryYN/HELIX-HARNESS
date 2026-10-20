"""BRAIN032の原sourceと供給資格の照合。実rootの認証を生成しない。"""

import copy
from decimal import Decimal, DecimalException
import hashlib
import json
import math


def _exact_number(value):
    if type(value) is int:
        return Decimal(value)
    if type(value) is Decimal and value.is_finite():
        return value
    if type(value) is float and math.isfinite(value):
        # logical入力の現在のbinary値を正確に比較する。元JSON tokenは創作しない。
        return Decimal.from_float(value)
    return None


def _json_equal(left, right):
    if type(left) is bool or type(right) is bool:
        return type(left) is type(right) and left is right
    left_number, right_number = _exact_number(left), _exact_number(right)
    if left_number is not None or right_number is not None:
        return left_number is not None and right_number is not None and left_number == right_number
    if type(left) is not type(right):
        return False
    if left is None or type(left) is str:
        return left == right
    if type(left) is list:
        return len(left) == len(right) and all(_json_equal(a, b) for a, b in zip(left, right))
    if type(left) is dict:
        return left.keys() == right.keys() and all(_json_equal(left[k], right[k]) for k in left)
    return False


def _ref_same(left, right):
    if type(left) is not dict or type(right) is not dict:
        return False
    for key in ("identity", "revision", "scope", "owner"):
        if key not in left or key not in right or left[key] is None or right[key] is None:
            return False
        if not _json_equal(left[key], right[key]):
            return False
    if left.get("sha256") is not None and right.get("sha256") is not None:
        return _json_equal(left["sha256"], right["sha256"])
    return True


def _object_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate decoded JSON member.")
        result[key] = value
    return result


def _reject_constant(token):
    raise ValueError("Non-JSON numeric constant.")


def _parse_source(text):
    return json.loads(text, parse_int=Decimal, parse_float=Decimal,
                      parse_constant=_reject_constant, object_pairs_hook=_object_pairs)


def _issue(locator, reason, source_ref):
    return [{"locator": locator, "reason": reason, "source_ref": copy.deepcopy(source_ref)}]


def _check_original_content(source, source_path, ref):
    """原bytes/bodyの対応を検査し、測定digestと診断を返す。"""
    if "content_bytes" not in source:
        return None, _issue(source_path + "/content_bytes", "Original source bytes are not supplied.", ref)
    try:
        measured = hashlib.sha256(source["content_bytes"].encode("utf-8")).hexdigest()
    except UnicodeError:
        return None, _issue(source_path + "/content_bytes", "Original source text is not UTF-8 encodable.", ref)
    if ref.get("sha256") != measured:
        return None, _issue(source_path + "/ref/sha256", "Source digest differs from original bytes.", ref)
    try:
        body = _parse_source(source["content_bytes"])
    except (ValueError, DecimalException, OverflowError, RecursionError):
        return None, _issue(source_path + "/content_bytes", "Original source text is not strict JSON.", ref)
    if "content" not in source or not _json_equal(body, source["content"]):
        return None, _issue(source_path + "/content", "Original source bytes and supplied body differ.", ref)
    return measured, []


def _check_qualification(source, qualifications, roots, source_path, ref, measured):
    """owner資格と独立rootを照合する。bytes検査の成功は資格を代替しない。"""
    if type(qualifications) is not list or type(roots) is not list:
        return _issue(source_path + "/qualification_ref", "Independent qualification input is not supplied.", ref)
    matches = [(i, q) for i, q in enumerate(qualifications)
               if _ref_same(source.get("qualification_ref"), q.get("ref"))]
    if not matches:
        return _issue(source_path + "/qualification_ref", "Qualification reference is unresolved.", ref)
    qualification_index, qualification = matches[0]
    if any(not _json_equal(qualification, other) for _, other in matches[1:]):
        return _issue(source_path + "/qualification_ref", "Qualification reference has conflicting records.", ref)
    qualification_path = "/qualifications/" + str(qualification_index)
    if not _ref_same(qualification.get("subject_ref"), ref):
        return _issue(qualification_path + "/subject_ref", "Qualification subject differs from source.", ref)
    if qualification.get("subject_sha256") != measured:
        return _issue(qualification_path + "/subject_sha256", "Qualification digest differs from original bytes.", ref)
    if "qualification_body" not in qualification or qualification["qualification_body"] is None:
        return _issue(qualification_path + "/qualification_body", "Original owner qualification body is unresolved.", ref)
    if not any(_ref_same(qualification.get("root_ref"), root) for root in roots):
        return _issue(qualification_path + "/root_ref", "Independent qualification root is unresolved.", ref)
    if "applicable_scope" not in qualification:
        return _issue(qualification_path + "/applicable_scope", "Qualification scope is not supplied.", ref)
    if not _json_equal(qualification["applicable_scope"], ref.get("scope")):
        return _issue(qualification_path + "/applicable_scope",
                      "原資格の適用scopeが当該sourceのscopeに対応しない。", ref)
    return []


def validate_source(source, qualifications, roots, source_index):
    """形検査済みsourceを照合し、失敗の原所在をInputIssueへ残す。"""
    source_path = "/sources/" + str(source_index)
    ref = source.get("ref")
    if type(ref) is not dict:
        return _issue(source_path + "/ref", "Source reference is not supplied.", None)
    measured, issues = _check_original_content(source, source_path, ref)
    if issues:
        return issues
    return _check_qualification(source, qualifications, roots, source_path, ref, measured)
