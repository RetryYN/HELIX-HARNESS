"""Raw collection and canonical JSON helpers for FN11 projection."""

from __future__ import annotations

import hashlib
import json
import math
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from application_input_schema import _json_equal as _schema_json_equal


ABSENT = object()
COMPARE_FIELDS = ("identity", "revision", "scope", "owner")


@dataclass(frozen=True)
class CollectionSlot:
    presence: str
    value: Any = ABSENT


def read_member(value: Any, key: str) -> Any:
    if not isinstance(value, dict) or key not in value:
        return ABSENT
    return value[key]


def read_path(root: Any, path: tuple[str, ...]) -> Any:
    current = root
    for key in path:
        current = read_member(current, key)
        if current is ABSENT:
            return ABSENT
    return current


def read_collection(root: Any, path: tuple[str, ...]) -> CollectionSlot:
    value = read_path(root, path)
    if value is ABSENT:
        return CollectionSlot("absent")
    if value is None:
        return CollectionSlot("null", None)
    if not isinstance(value, list):
        return CollectionSlot("invalid_type", value)
    if not value:
        return CollectionSlot("empty", value)
    return CollectionSlot("value", value)


def json_equal(left: Any, right: Any) -> bool:
    """JSON logical equality; caller must distinguish ABSENT before this call."""
    return _schema_json_equal(left, right)


def _number_text(value: int | float) -> str:
    if isinstance(value, bool):
        raise TypeError("boolean is not a JSON number")
    number = float(value)
    if not math.isfinite(number):
        raise ValueError("non-finite number is outside the JSON value domain")
    if number == 0:
        return "0"
    text = repr(number).lower()
    if "e" not in text:
        if text.endswith(".0"):
            text = text[:-2]
        return text
    mantissa, exponent_text = text.split("e", 1)
    exponent = int(exponent_text)
    if -6 <= exponent < 21:
        fixed = format(Decimal(text), "f")
        if "." in fixed:
            fixed = fixed.rstrip("0").rstrip(".")
        return fixed
    mantissa = mantissa[:-2] if mantissa.endswith(".0") else mantissa
    sign = "+" if exponent >= 0 else ""
    return f"{mantissa}e{sign}{exponent}"


def canonical_json_text(value: Any) -> str:
    """Serialize fixture-domain JSON with UTF-16 key ordering and ECMAScript numbers."""
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return _number_text(value)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(canonical_json_text(item) for item in value) + "]"
    if isinstance(value, dict):
        keys = sorted(value, key=lambda key: str(key).encode("utf-16-be", "surrogatepass"))
        return "{" + ",".join(
            json.dumps(str(key), ensure_ascii=False, separators=(",", ":"))
            + ":"
            + canonical_json_text(value[key])
            for key in keys
        ) + "}"
    raise TypeError(f"value is outside the JSON RawValue domain: {type(value).__name__}")


def canonical_sha256(value: Any) -> str:
    encoded = canonical_json_text(value).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def collection_sha256(slot: CollectionSlot) -> str | None:
    if slot.presence not in {"empty", "value"}:
        return None
    return canonical_sha256(slot.value)


def template_non_ref_sha256(slot: CollectionSlot) -> list[str] | None:
    if slot.presence == "empty":
        return []
    if slot.presence != "value":
        return None
    digests = []
    for snapshot in slot.value:
        if isinstance(snapshot, dict):
            non_ref = dict(snapshot)
            non_ref.pop("ref", None)
            digests.append(canonical_sha256(non_ref))
        else:
            digests.append(canonical_sha256(snapshot))
    return digests


def ref_presence(value: Any) -> str:
    if value is ABSENT:
        return "absent"
    if value is None:
        return "null"
    if isinstance(value, dict):
        return "value"
    return "invalid_type"


def record_presence(value: Any, absent_allowed: bool = False) -> str:
    if value is ABSENT and absent_allowed:
        return "absent"
    if value is None:
        return "null"
    if isinstance(value, dict):
        return "object"
    return "non_object"
