"""Structural validation for the fixed local-CI design manifest.

This module reads manifest/source bytes only. It does not execute checkers, read
repository paths, or infer semantic coverage from prose.
"""
from __future__ import annotations

import re
from collections import defaultdict

from common import Diagnostic, sha256, strict_json


EXPECTED_FILES = (
    ("docs/helix-harness/L4-basic-design/common-kernel.md", "l4", "docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md"),
    ("docs/helix-harness/L4-basic-design/repository-layout.md", "l4", "docs/helix-harness/L9-integration-verification/repository-layout-integration-verification.md"),
    ("docs/helix-harness/L9-integration-verification/common-kernel-integration-verification.md", "l9", "docs/helix-harness/L4-basic-design/common-kernel.md"),
    ("docs/helix-harness/L9-integration-verification/repository-layout-integration-verification.md", "l9", "docs/helix-harness/L4-basic-design/repository-layout.md"),
    ("docs/helix-os/L4-basic-design/local-ci.md", "l4", "docs/helix-os/L9-integration-verification/local-ci-integration-verification.md"),
    ("docs/helix-os/L9-integration-verification/local-ci-integration-verification.md", "l9", "docs/helix-os/L4-basic-design/local-ci.md"),
    ("docs/helix-os/L5-detail-design/local-ci-detail-design.md", "l5", "docs/helix-os/L8-detail-verification/local-ci-detail-verification.md"),
    ("docs/helix-os/L8-detail-verification/local-ci-detail-verification.md", "l8", "docs/helix-os/L5-detail-design/local-ci-detail-design.md"),
    ("docs/helix-os/L6-function-design/local-ci-function-design.md", "l6", "docs/helix-os/L7-unit-test-design/local-ci-unit-test-design.md"),
    ("docs/helix-os/L7-unit-test-design/local-ci-unit-test-design.md", "l7", "docs/helix-os/L6-function-design/local-ci-function-design.md"),
)
EXPECTED_PATHS = frozenset(row[0] for row in EXPECTED_FILES)

# Current source-contract inventory. These identifiers are configuration, not
# inferred at runtime from arbitrary document text. Section locators are the
# exact heading literals selected by the corresponding exact_heading ranges.
REQUIRED_SOURCE_IDS_BY_PATH = {
    "docs/helix-harness/L4-basic-design/common-kernel.md": frozenset((
        "K1-I1", "K1-I2", "K1-I3", "K1-I4", "K1-I5", "K1-I6", "K1-I7", "K1-I8", "K2-I1", "K2-I2", "K2-I2b", "K2-I3", "K2-I4", "K2-I5", "K2-I6", "K2-I7", "K5-I1", "K5-I2", "K5-I3", "K5-I4", "K5-I5", "K5-I6", "K5-I7", "K5-I8", "K5-I9", "K5-I10", "K5-I11", "K5-I12", "K5-I13", "K6-I1", "K6-I2", "K6-I3", "K6-I4", "K6-I5", "K6-I6", "K6-I7", "K6-I8", "K6-I9", "K6-I10", "G8-I1", "G8-I2", "G8-I3", "G8-I4", "G8-I5", "G8-I6", "P1-C1", "P1-C2", "P1-C3", "P1-C4", "K4-I1", "K4-I2", "K4-I3", "K4-I4", "K4-I5", "K4-I6", "G3-I1", "G3-I2", "G3-I3", "G3-I4", "G3-I5", "K10-I1", "K10-I2", "K10-I3", "K10-I4", "K10-I5", "K10-I6", "K10-I7", "K7-I1", "K7-I2", "K7-I2b", "K7-I3", "K7-I4", "K7-I4b", "K7-I5", "K7-I6", "G5-I1", "G5-I2", "G5-I3", "G5-I4", "G5-I5", "G5-I6", "K3-I1", "K3-I2", "K3-I3", "K3-I4", "K3-I5", "K3-I6", "K3-I7", "K9-I1", "K9-I2", "K9-I3", "K9-I4", "K9-I5", "K9-I6", "K9-I7", "K9-I8", "K8-I1", "K8-I2", "K8-I3", "K8-I4", "K8-I5", "K8-I6", "K8-I7", "K8-I8",
        "### 11.4 検証器自身の配布物：扱える範囲と扱えない範囲", "### 2.4 写像表（G10：不明の共通分類）", "### 14.2 型", "### 3.4 イベントとAPI境界", "### 3.4.1 role-bound input alias", "### 16.3 不変条件", "### 16.2 型と入力の所有", "### 13.2 型", "### 9.3 型", "### 9.5 API境界", "### 10.3 型", "## 12. Phase 1の条件の具体", "### 15.2 K7 世代pointerとfencing",
    )),
    "docs/helix-harness/L4-basic-design/repository-layout.md": frozenset((
        "RL-C1", "RL-C2", "RL-C3", "RL-C4", "RL-C5", "RL-C6", "RL-C7", "RL-R1", "RL-R2", "RL-R3", "RL-R4", "RL-R5", "RL-R6", "RL-R7", "RL-R8", "RL-V1", "RL-V2", "RL-V3", "RL-V4", "RL-V5", "RL-V6", "RL-P1", "RL-P2", "RL-P3", "RL-P4", "RL-P5", "RL-P6", "RL-P7", "RL-P8", "RL-P9", "RL-D1", "RL-D2", "RL-D3", "RL-D4", "RL-D5", "RL-T1", "RL-T2", "RL-T3", "RL-K1", "RL-K2", "RL-K3", "### 4.1 型", "### 6.1 符号化 `enc`",
    )),
    "docs/helix-os/L4-basic-design/local-ci.md": frozenset(("LC-SCF-001", "LC-SCF-002", "LC-GOV-001", "LC-DIFF-001", "LC-DESIGN-001", "#### 実行snapshotとprocess境界", "## 3. GitHub Actions provider境界", "## 4. 実装技術の選択")),
    "docs/helix-os/L5-detail-design/local-ci-detail-design.md": frozenset(("D-LCI-01", "D-LCI-02", "D-LCI-03", "D-LCI-04", "D-LCI-05")),
    "docs/helix-os/L6-function-design/local-ci-function-design.md": frozenset(("F-LCI-01", "F-LCI-02", "F-LCI-03", "F-LCI-04", "F-LCI-05", "F-LCI-06", "F-LCI-07", "F-LCI-08", "F-LCI-09a", "F-LCI-09b", "F-LCI-09c", "F-LCI-09d")),
}
REQUIRED_SOURCE_IDS = frozenset().union(*REQUIRED_SOURCE_IDS_BY_PATH.values())
EXPECTED_PARTIAL = frozenset(("RL-D4", "RL-T3"))
EXPECTED_NOT_EXERCISED = frozenset(("RL-V1", "RL-K3"))
EXPECTED_SCOPEOUTS = frozenset(("RL-D4",))
EXPECTED_UNSUPPORTED = frozenset(("U-LCI-01", "U-LCI-02", "U-LCI-03", "U-LCI-04"))
EXPECTED_LEGACY_ASSETS = frozenset((
    "LEGACY-ASSET-BACB1FC117A09D20F273",
    "LEGACY-ASSET-96CCD05C4CCA06F50D3D",
    "LEGACY-ASSET-99C939E249CAF40935CB",
    "LEGACY-ASSET-73D72E21D730270F3944",
    "LEGACY-ASSET-7AE45AD102EAB3B6D7E7",
    "LEGACY-ASSET-B62E49D2E156232B8C63",
    "LEGACY-ASSET-0327D0DF98618D3066FD",
))

_ID_RE = re.compile(r"^[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+(?:[a-d])?$")
_BACKTICK_ID_RE = re.compile(r"^`([A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+(?:[a-d])?)`$")
_HEADING_RE = re.compile(r"^#{1,6} .+$")
_BULLET_RE = re.compile(r"^- \*\*([^\s*]+) [^*]+\*\*.*$")
_SHA_RE = re.compile(r"^[0-9a-f]{64}$")
_RANGE_KEYS = {"range_id", "start_heading", "end_heading", "grammar", "id_column", "literal_expansions"}
_FILE_KEYS = {"path", "role", "source_kind", "expected_pair", "definition_ranges", "reference_ranges"}
_PARENT_AC_COVERAGE_KEY = "parent_ac_coverage"
_PARENT_AC_IDS = ("AC-OS-020-01", "AC-OS-020-03")
_PARENT_AC_SOURCE_PATH = "docs/helix-os/L4-basic-design/local-ci.md"
_PARENT_AC_START_HEADING = "### 親ACの適用範囲"
_PARENT_AC_END_HEADING = "## 2. local CI契約"
_MANIFEST_KEYS = {"version", "files", "coverage_edges", "coverage_dispositions", _PARENT_AC_COVERAGE_KEY, "source_scopeouts", "legacy_pins", "unsupported_items"}
_MANIFEST_REQUIRED_KEYS = _MANIFEST_KEYS - {_PARENT_AC_COVERAGE_KEY}


def _fail(classification: str, reason: str, detail: str = "") -> None:
    raise Diagnostic(classification, reason, detail)


def _obj(value, keys, where):
    if not isinstance(value, dict) or set(value) != set(keys):
        _fail("Rejected", "invalid_input", where + " fields/type")
    return value


def _text(value, where, nonempty=True):
    if not isinstance(value, str) or (nonempty and not value):
        _fail("Rejected", "invalid_input", where + " string")
    return value


def _list(value, where):
    if not isinstance(value, list):
        _fail("Rejected", "invalid_input", where + " list")
    return value


def _integer(value, where, minimum=1):
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        _fail("Rejected", "invalid_input", where + " integer")
    return value


def _decode_source(path, sources):
    data = sources.get(path)
    if data is None:
        _fail("Unknown", "missing_input", "source bytes missing: " + path)
    if not isinstance(data, bytes):
        _fail("Rejected", "invalid_input", "source value must be bytes: " + path)
    try:
        return data.decode("utf-8", "strict")
    except UnicodeDecodeError as exc:
        raise Diagnostic("Unknown", "unreadable", "source is not UTF-8: " + path) from exc


def _unfenced_lines(text):
    """Return (one-based line number, text) pairs outside Markdown fences."""
    out, fence_char, fence_len = [], None, 0
    for line_no, line in enumerate(text.splitlines(), 1):
        stripped = line.lstrip(" ")
        marker = re.match(r"(`{3,}|~{3,})", stripped)
        if fence_char is None:
            if marker:
                fence_char, fence_len = marker.group(1)[0], len(marker.group(1))
                continue
            out.append((line_no, line))
            continue
        if marker and marker.group(1)[0] == fence_char and len(marker.group(1)) >= fence_len:
            fence_char, fence_len = None, 0
    if fence_char is not None:
        _fail("Unknown", "conflict", "unterminated fenced code block")
    return out


def _range_lines(path, id_range, sources):
    text = _decode_source(path, sources)
    lines = _unfenced_lines(text)
    start = id_range["start_heading"]
    if not any(line == start and _HEADING_RE.fullmatch(line) for _, line in lines):
        _fail("Unknown", "missing_input", "range start heading missing: " + start)
    starts = [i for i, (_, line) in enumerate(lines) if line == start and _HEADING_RE.fullmatch(line)]
    if len(starts) != 1:
        _fail("Unknown", "conflict", "range start heading ambiguous: " + start)
    lo = starts[0]
    end = id_range["end_heading"]
    if end is None:
        hi = len(lines)
    else:
        ends = [i for i, (_, line) in enumerate(lines) if line == end and _HEADING_RE.fullmatch(line)]
        if not ends:
            _fail("Unknown", "missing_input", "range end heading missing: " + end)
        if len(ends) != 1 or ends[0] <= lo:
            _fail("Unknown", "conflict", "range end heading ambiguous: " + end)
        hi = ends[0]
    return lines[lo:hi]


def _table_cells(line):
    stripped = line.strip()
    if not (stripped.startswith("|") and stripped.endswith("|")):
        return None
    body = stripped[1:-1]
    cells, current, escaped = [], [], False
    for char in body:
        if char == "|" and not escaped:
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(char)
        if char == "\\" and not escaped:
            escaped = True
        else:
            escaped = False
    cells.append("".join(current).strip())
    return cells


def _is_separator(cells):
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def _table_data_rows(lines):
    rows = []
    raw = [(line_no, _table_cells(line)) for line_no, line in lines]
    for i, (line_no, cells) in enumerate(raw):
        if cells is None or _is_separator(cells):
            continue
        if i + 1 < len(raw) and raw[i + 1][1] is not None and _is_separator(raw[i + 1][1]):
            continue
        rows.append((line_no, cells))
    return rows


def _cell_id(cell):
    match = _BACKTICK_ID_RE.fullmatch(cell)
    token = match.group(1) if match else cell
    return token if _ID_RE.fullmatch(token) else None


def _contains_id_token(cell):
    """Recognize a fixed-corpus ID token without interpreting prose labels."""
    tokens = re.findall(r"`([^`]+)`", cell)
    if any(_ID_RE.fullmatch(token) for token in tokens):
        return True
    for ident in REQUIRED_SOURCE_IDS:
        if re.search(r"(?<![A-Za-z0-9])" + re.escape(ident) + r"(?=\s|$|[,;:])", cell):
            return True
    return False


def _validate_range(id_range, path, sources):
    _obj(id_range, _RANGE_KEYS, "IdRange")
    _text(id_range["range_id"], "range_id")
    start = _text(id_range["start_heading"], "start_heading")
    if not _HEADING_RE.fullmatch(start):
        _fail("Rejected", "invalid_input", "start_heading is not a heading")
    end = id_range["end_heading"]
    if end is not None and (not isinstance(end, str) or not _HEADING_RE.fullmatch(end)):
        _fail("Rejected", "invalid_input", "end_heading is not a heading or null")
    grammar = _text(id_range["grammar"], "grammar")
    if grammar not in {"heading_id", "table_column", "bullet_id", "exact_heading"}:
        _fail("Rejected", "invalid_input", "unsupported IdRange grammar")
    column = id_range["id_column"]
    if grammar == "table_column":
        _integer(column, "id_column")
    elif column is not None:
        _fail("Rejected", "invalid_input", "id_column must be null outside table_column")
    expansions = _list(id_range["literal_expansions"], "literal_expansions")
    expansion_map = {}
    for item in expansions:
        _obj(item, {"literal", "ids"}, "literal expansion")
        literal = _text(item["literal"], "literal")
        ids = _list(item["ids"], "literal expansion ids")
        if not ids or any(not isinstance(x, str) or not x for x in ids):
            _fail("Unknown", "missing_input", "empty/invalid literal expansion")
        if len(ids) != len(set(ids)):
            _fail("Unknown", "conflict", "duplicate id in literal expansion")
        if literal in expansion_map:
            _fail("Unknown", "conflict", "duplicate literal expansion")
        expansion_map[literal] = ids
    return expansion_map


def _validate_manifest_shape(manifest, sources):
    if not isinstance(manifest, dict):
        _fail("Rejected", "invalid_input", "DesignScopeManifest object")
    unknown_keys = set(manifest) - _MANIFEST_KEYS
    if unknown_keys:
        _fail("Rejected", "invalid_input", "DesignScopeManifest unknown fields")
    missing_keys = _MANIFEST_REQUIRED_KEYS - set(manifest)
    if missing_keys:
        _fail("Rejected", "invalid_input", "DesignScopeManifest required fields")
    if _PARENT_AC_COVERAGE_KEY not in manifest:
        _fail("Unknown", "missing_input", "DesignScopeManifest parent_ac_coverage missing")
    _text(manifest["version"], "manifest version")
    files = _list(manifest["files"], "files")
    seen_paths = set()
    file_by_path = {}
    for item in files:
        _obj(item, _FILE_KEYS, "DesignFile")
        path = _text(item["path"], "DesignFile.path")
        role = _text(item["role"], "DesignFile.role")
        source_kind = _text(item["source_kind"], "DesignFile.source_kind")
        pair = _text(item["expected_pair"], "DesignFile.expected_pair")
        if path not in EXPECTED_PATHS or path in seen_paths:
            _fail("Rejected", "invalid_input", "unknown/duplicate DesignFile path: " + path)
        seen_paths.add(path)
        expected = next(row for row in EXPECTED_FILES if row[0] == path)
        if (role, pair, source_kind) != (expected[1], expected[2], "current_contract"):
            _fail("Rejected", "invalid_input", "DesignFile role/pair/source_kind mismatch: " + path)
        if not isinstance(item["definition_ranges"], list) or not isinstance(item["reference_ranges"], list):
            _fail("Rejected", "invalid_input", "DesignFile ranges must be lists")
        all_range_ids = set()
        for group in ("definition_ranges", "reference_ranges"):
            for id_range in item[group]:
                _validate_range(id_range, path, sources)
                if id_range["range_id"] in all_range_ids:
                    _fail("Unknown", "conflict", "duplicate range_id in file: " + path)
                all_range_ids.add(id_range["range_id"])
        file_by_path[path] = item
    if seen_paths != EXPECTED_PATHS:
        _fail("Unknown", "missing_input", "fixed 10-document corpus incomplete")
    _validate_parent_ac_coverage(manifest[_PARENT_AC_COVERAGE_KEY], sources)
    return file_by_path


def _validate_parent_ac_coverage(rows, sources):
    """Validate the fixed OS parent-AC applicability record against its L4 table."""
    if not isinstance(rows, list):
        _fail("Rejected", "invalid_input", "parent_ac_coverage list")

    by_id = {}
    for row in rows:
        _obj(row, {"parent_ac_id", "state", "reason"}, "ParentAcCoverage")
        parent_id = _text(row["parent_ac_id"], "parent_ac_id")
        if parent_id not in _PARENT_AC_IDS:
            _fail("Rejected", "invalid_input", "unsupported parent_ac_id: " + parent_id)
        if row["state"] != "not_exercised":
            _fail("Rejected", "invalid_input", "parent AC cannot pass or change state: " + parent_id)
        reason = _text(row["reason"], "parent AC reason")
        if not reason.strip():
            _fail("Rejected", "invalid_input", "parent AC reason must be nonempty")
        if parent_id in by_id:
            _fail("Unknown", "conflict", "duplicate parent_ac_coverage row: " + parent_id)
        by_id[parent_id] = reason

    if set(by_id) != set(_PARENT_AC_IDS):
        _fail("Unknown", "missing_input", "parent_ac_coverage fixed parent set incomplete")

    locator = {
        "start_heading": _PARENT_AC_START_HEADING,
        "end_heading": _PARENT_AC_END_HEADING,
    }
    table_rows = _table_data_rows(_range_lines(_PARENT_AC_SOURCE_PATH, locator, sources))
    source_by_id = {}
    for line_no, cells in table_rows:
        if not cells:
            continue
        parent_id = _cell_id(cells[0])
        if parent_id not in _PARENT_AC_IDS:
            continue
        if parent_id in source_by_id:
            _fail("Unknown", "conflict", "duplicate parent AC in L4 applicability table: " + parent_id)
        if len(cells) < 3:
            _fail("Unknown", "missing_input", "parent AC applicability columns missing at line " + str(line_no))
        source_by_id[parent_id] = (cells[1], cells[2])

    if set(source_by_id) != set(_PARENT_AC_IDS):
        _fail("Unknown", "missing_input", "L4 parent AC applicability rows incomplete")
    for parent_id in _PARENT_AC_IDS:
        source_state, source_reason = source_by_id[parent_id]
        if source_state != "`not_exercised`" or by_id[parent_id] != source_reason:
            _fail("Unknown", "conflict", "parent AC applicability differs from L4 literal: " + parent_id)


def _extract_ids(manifest, sources):
    definitions, references = [], []
    def_ids_by_path = defaultdict(set)
    for file in manifest["files"]:
        path = file["path"]
        for id_range in file["definition_ranges"]:
            lines = _range_lines(path, id_range, sources)
            grammar = id_range["grammar"]
            expansions = {x["literal"]: x["ids"] for x in id_range["literal_expansions"]}
            if grammar == "exact_heading":
                if id_range["literal_expansions"]:
                    _fail("Rejected", "invalid_input", "exact_heading cannot have literal expansions")
                source_id = id_range["start_heading"]
                definitions.append({"id": source_id, "path": path, "range_id": id_range["range_id"], "definition_kind": "section_locator"})
                def_ids_by_path[path].add(source_id)
            elif grammar == "heading_id":
                headings = [(line_no, line) for line_no, line in lines if _HEADING_RE.fullmatch(line)]
                by_literal = defaultdict(list)
                for line_no, line in headings:
                    by_literal[line].append(line_no)
                if not expansions:
                    _fail("Unknown", "missing_input", "heading_id requires explicit expansions")
                mapped_ids = set()
                for literal, ids in expansions.items():
                    if literal not in by_literal:
                        _fail("Unknown", "missing_input", "heading_id literal missing: " + literal)
                    if len(by_literal[literal]) != 1:
                        _fail("Unknown", "conflict", "heading_id literal duplicated: " + literal)
                    for ident in ids:
                        if ident in mapped_ids:
                            _fail("Unknown", "conflict", "heading_id maps an ID more than once: " + ident)
                        mapped_ids.add(ident)
                        definitions.append({"id": ident, "path": path, "range_id": id_range["range_id"], "definition_kind": "heading_id"})
                        def_ids_by_path[path].add(ident)
                if set(expansions) - set(by_literal):
                    _fail("Unknown", "missing_input", "unused heading_id expansion")
            elif grammar == "bullet_id":
                for _, line in lines:
                    match = _BULLET_RE.fullmatch(line)
                    if match:
                        ident = match.group(1)
                        if not _ID_RE.fullmatch(ident):
                            _fail("Unknown", "conflict", "invalid leading bullet id: " + ident)
                        definitions.append({"id": ident, "path": path, "range_id": id_range["range_id"], "definition_kind": "bullet_id"})
                        def_ids_by_path[path].add(ident)
            elif grammar == "table_column":
                for line_no, cells in _table_data_rows(lines):
                    column = id_range["id_column"] - 1
                    if column >= len(cells):
                        _fail("Unknown", "missing_input", "definition table column missing")
                    ident = _cell_id(cells[column])
                    if ident is None:
                        _fail("Unknown", "missing_input", "definition table id cell unresolved at line " + str(line_no))
                    if path in REQUIRED_SOURCE_IDS_BY_PATH and ident not in REQUIRED_SOURCE_IDS_BY_PATH[path]:
                        if ident in REQUIRED_SOURCE_IDS:
                            references.append({"id": ident, "path": path, "range_id": id_range["range_id"], "reference_kind": "table_column"})
                            continue
                        _fail("Unknown", "conflict", "unexpected table ID in definition range at line " + str(line_no))
                    definitions.append({"id": ident, "path": path, "range_id": id_range["range_id"], "definition_kind": "table_column"})
                    def_ids_by_path[path].add(ident)
        for id_range in file["reference_ranges"]:
            lines = _range_lines(path, id_range, sources)
            grammar = id_range["grammar"]
            expansions = {x["literal"]: x["ids"] for x in id_range["literal_expansions"]}
            if grammar == "exact_heading":
                _fail("Rejected", "invalid_input", "exact_heading is only a definition selector")
            if grammar == "bullet_id":
                _fail("Rejected", "invalid_input", "bullet_id is only a definition selector")
            if grammar == "heading_id":
                _fail("Rejected", "invalid_input", "heading_id is only a definition selector")
            used_literals = set()
            for line_no, cells in _table_data_rows(lines):
                column = id_range["id_column"] - 1
                if column >= len(cells):
                    _fail("Unknown", "missing_input", "reference table column missing")
                literal = cells[column]
                ids = expansions.get(literal)
                if ids is None:
                    direct = _cell_id(literal)
                    if direct is None:
                        if _contains_id_token(literal):
                            _fail("Unknown", "missing_input", "ID-shaped reference has no fixed expansion at line " + str(line_no))
                        continue
                    ids = [direct]
                used_literals.add(literal)
                for ident in ids:
                    references.append({"id": ident, "path": path, "range_id": id_range["range_id"], "reference_kind": "table_column"})
            if set(expansions) - used_literals:
                _fail("Unknown", "missing_input", "unused reference literal expansion")
    for path, expected_ids in REQUIRED_SOURCE_IDS_BY_PATH.items():
        actual = def_ids_by_path[path]
        missing = expected_ids - actual
        extra = actual - expected_ids
        if missing:
            _fail("Unknown", "missing_input", "required source IDs absent in " + path + ": " + ",".join(sorted(missing)))
        if extra:
            _fail("Unknown", "conflict", "unexpected source IDs in " + path + ": " + ",".join(sorted(extra)))
    return definitions, references


def load_design_manifest(raw: bytes, sources: dict[str, bytes]) -> dict:
    """Parse strict JSON and validate the exact fixed corpus and selectors."""
    if not isinstance(raw, bytes):
        _fail("Rejected", "invalid_input", "manifest input must be bytes")
    manifest = strict_json(raw)
    _validate_manifest_shape(manifest, sources)
    _extract_ids(manifest, sources)
    _validate_nonpass_inventory(manifest)
    return manifest


def _validate_nonpass_inventory(manifest):
    dispositions = _list(manifest["coverage_dispositions"], "coverage_dispositions")
    seen = set()
    for item in dispositions:
        if not isinstance(item, dict):
            _fail("Rejected", "invalid_input", "CoverageDisposition object")
        state = _text(item.get("state"), "disposition state")
        base = {"source_id", "state", "edge_ids"}
        if state == "mapped":
            _obj(item, base, "mapped disposition")
        elif state in {"partial", "not_exercised"}:
            _obj(item, base | {"reason", "owner_ref", "operational_owner", "return_path"}, "non-pass disposition")
            _text(item["reason"], "disposition reason")
            _text(item["owner_ref"], "disposition owner_ref")
            _text(item["return_path"], "disposition return_path")
            owner = item["operational_owner"]
            if not isinstance(owner, dict) or not isinstance(owner.get("state"), str) or owner.get("state") not in {"known", "unresolved"}:
                _fail("Rejected", "invalid_input", "operational_owner")
            if owner["state"] == "known":
                _obj(owner, {"state", "ref"}, "known operational_owner")
                _text(owner["ref"], "operational_owner ref")
            else:
                _obj(owner, {"state"}, "unresolved operational_owner")
            if state == "not_exercised" and item["edge_ids"] != []:
                _fail("Rejected", "invalid_input", "not_exercised must have empty edge_ids")
        else:
            _fail("Rejected", "invalid_input", "unsupported disposition state")
        source_id = _text(item["source_id"], "disposition source_id")
        if source_id in seen:
            _fail("Unknown", "conflict", "duplicate disposition source")
        seen.add(source_id)
        if not isinstance(item["edge_ids"], list) or any(not isinstance(x, str) or not x for x in item["edge_ids"]):
            _fail("Rejected", "invalid_input", "disposition edge_ids")
        if state in {"mapped", "partial"} and not item["edge_ids"]:
            _fail("Unknown", "missing_input", "mapped/partial disposition requires an edge")
        expected_state = "partial" if source_id in EXPECTED_PARTIAL else "not_exercised" if source_id in EXPECTED_NOT_EXERCISED else "mapped"
        if state != expected_state:
            _fail("Rejected", "invalid_input", "fixed source disposition mismatch: " + source_id)
    if seen != REQUIRED_SOURCE_IDS:
        _fail("Unknown", "missing_input", "coverage dispositions do not cover the fixed source ID set")
    scopeouts = _list(manifest["source_scopeouts"], "source_scopeouts")
    scopeout_ids = set()
    for item in scopeouts:
        _obj(item, {"source_id", "reason", "owner_ref", "operational_owner", "return_path"}, "SourceScopeout")
        ident = _text(item["source_id"], "scopeout source_id")
        if ident in scopeout_ids:
            _fail("Unknown", "conflict", "duplicate scopeout")
        scopeout_ids.add(ident)
        for key in ("reason", "owner_ref", "return_path"):
            _text(item[key], "scopeout " + key)
        owner = item["operational_owner"]
        if not isinstance(owner, dict) or not isinstance(owner.get("state"), str) or owner.get("state") not in {"known", "unresolved"}:
            _fail("Rejected", "invalid_input", "scopeout operational_owner")
        if owner["state"] == "known":
            _obj(owner, {"state", "ref"}, "scopeout known operational_owner")
            _text(owner["ref"], "scopeout operational_owner ref")
        else:
            _obj(owner, {"state"}, "scopeout unresolved operational_owner")
    if scopeout_ids != EXPECTED_SCOPEOUTS:
        _fail("Unknown", "missing_input", "fixed source scopeout inventory incomplete")
    unsupported = _list(manifest["unsupported_items"], "unsupported_items")
    unsupported_ids = set()
    for item in unsupported:
        _obj(item, {"id", "reason", "disposition"}, "UnsupportedItem")
        ident = _text(item["id"], "unsupported id")
        _text(item["reason"], "unsupported reason")
        if item["disposition"] != "non_pass":
            _fail("Rejected", "invalid_input", "unsupported item cannot pass")
        if ident in unsupported_ids:
            _fail("Unknown", "conflict", "duplicate unsupported item")
        unsupported_ids.add(ident)
    if unsupported_ids != EXPECTED_UNSUPPORTED:
        _fail("Rejected", "invalid_input", "unsupported item inventory incomplete")
    pins = _list(manifest["legacy_pins"], "legacy_pins")
    pin_ids = set()
    for pin in pins:
        _obj(pin, {"asset_id", "archive_path", "full_file_sha256", "line_start", "line_end", "span_sha256"}, "LegacyPin")
        asset_id = _text(pin["asset_id"], "legacy asset_id")
        _text(pin["archive_path"], "legacy archive_path")
        if not isinstance(pin["full_file_sha256"], str) or not _SHA_RE.fullmatch(pin["full_file_sha256"]):
            _fail("Rejected", "invalid_input", "legacy full_file_sha256")
        _integer(pin["line_start"], "legacy line_start")
        _integer(pin["line_end"], "legacy line_end")
        if pin["line_end"] < pin["line_start"]:
            _fail("Rejected", "invalid_input", "legacy line span order")
        if pin["span_sha256"] is not None and (not isinstance(pin["span_sha256"], str) or not _SHA_RE.fullmatch(pin["span_sha256"])):
            _fail("Rejected", "invalid_input", "legacy span_sha256")
        if asset_id in pin_ids:
            _fail("Unknown", "conflict", "duplicate legacy asset pin")
        pin_ids.add(asset_id)
    if pin_ids != EXPECTED_LEGACY_ASSETS:
        _fail("Unknown", "missing_input", "fixed legacy pin inventory incomplete")


def resolve_id_graph(manifest: dict, sources: dict[str, bytes]) -> dict:
    """Extract unique definitions and resolve every explicit reference."""
    file_by_path = _validate_manifest_shape(manifest, sources)
    definitions, references = _extract_ids(manifest, sources)
    by_id = {}
    for definition in definitions:
        ident = definition["id"]
        if ident in by_id:
            _fail("Unknown", "conflict", "duplicate definition ID: " + ident)
        by_id[ident] = definition
    unresolved = [ref for ref in references if ref["id"] not in by_id]
    if unresolved:
        first = unresolved[0]
        _fail("Unknown", "missing_input", "unresolved reference: " + first["id"] + " at " + first["path"] + "::" + first["range_id"])
    table_rows = {}
    reference_pairs = set()
    for file in manifest["files"]:
        path = file["path"]
        for id_range in file["definition_ranges"] + file["reference_ranges"]:
            if id_range["grammar"] == "table_column":
                table_rows[(path, id_range["range_id"])] = _table_data_rows(_range_lines(path, id_range, sources))
        for id_range in file["reference_ranges"]:
            if id_range["grammar"] != "table_column":
                continue
            column = id_range["id_column"] - 1
            expansions = {item["literal"]: item["ids"] for item in id_range["literal_expansions"]}
            for _, cells in table_rows[(path, id_range["range_id"])]:
                if not cells or column >= len(cells):
                    continue
                literal = cells[column]
                target_ids = expansions.get(literal)
                if target_ids is None:
                    direct = _cell_id(literal)
                    target_ids = [direct] if direct else []
                if file["role"] == "l9":
                    verifier_id = _cell_id(cells[0])
                    if verifier_id is not None:
                        reference_pairs.update((source_id, verifier_id) for source_id in target_ids
                                               if source_id in REQUIRED_SOURCE_IDS)
                elif file["role"] == "l5":
                    source_id = _cell_id(cells[0])
                    if source_id in REQUIRED_SOURCE_IDS:
                        reference_pairs.update((source_id, verifier_id) for verifier_id in target_ids)
                elif file["role"] == "l7":
                    source_id = None
                    for token in re.findall(r"`([^`]+)`", cells[0]):
                        match = re.match(r"([A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+(?:[a-d])?)", token)
                        if match and match.group(1) in REQUIRED_SOURCE_IDS:
                            source_id = match.group(1)
                            break
                    if source_id is not None:
                        reference_pairs.update((source_id, verifier_id) for verifier_id in target_ids)
    return {"definitions": definitions, "references": references, "by_id": by_id,
            "file_by_path": file_by_path, "table_rows": table_rows,
            "reference_pairs": reference_pairs}


def verify_coverage_edges(manifest: dict, graph: dict) -> dict:
    """Check typed edge destinations and preserve designed non-pass inventory."""
    definitions = graph.get("by_id")
    if not isinstance(definitions, dict):
        _fail("Rejected", "invalid_input", "IdGraph missing definitions")
    edges = _list(manifest.get("coverage_edges"), "coverage_edges")
    edge_by_id, by_source = {}, defaultdict(list)
    files = {item["path"]: item for item in manifest["files"]}
    for edge in edges:
        _obj(edge, {"edge_id", "source_id", "source_path", "verifier_id", "verifier_path", "outcome_ref"}, "CoverageEdge")
        edge_id = _text(edge["edge_id"], "edge_id")
        if edge_id in edge_by_id:
            _fail("Unknown", "conflict", "duplicate edge_id: " + edge_id)
        edge_by_id[edge_id] = edge
        source_id, verifier_id = _text(edge["source_id"], "edge source_id"), _text(edge["verifier_id"], "edge verifier_id")
        _text(edge["source_path"], "edge source_path")
        _text(edge["verifier_path"], "edge verifier_path")
        source_def, verifier_def = definitions.get(source_id), definitions.get(verifier_id)
        if source_def is None or verifier_def is None:
            _fail("Unknown", "missing_input", "edge endpoint definition missing")
        if source_def["path"] != edge["source_path"] or verifier_def["path"] != edge["verifier_path"]:
            _fail("Unknown", "conflict", "edge endpoint path mismatch")
        if edge["source_path"] not in files or edge["verifier_path"] not in files:
            _fail("Unknown", "missing_input", "edge endpoint file missing")
        source_role = files[edge["source_path"]]["role"]
        verifier_role = files[edge["verifier_path"]]["role"]
        allowed = {"l4": {"l9"}, "l5": {"l8"}, "l6": {"l7"}}
        if verifier_role not in allowed.get(source_role, set()):
            _fail("Rejected", "invalid_input", "edge crosses an unsupported design pair")
        ref = _obj(edge["outcome_ref"], {"verifier_path", "range_id", "verifier_id", "outcome_column"}, "OutcomeRef")
        if ref["verifier_path"] != edge["verifier_path"] or ref["verifier_id"] != verifier_id:
            _fail("Unknown", "conflict", "OutcomeRef differs from edge destination")
        _text(ref["range_id"], "OutcomeRef.range_id")
        column = _integer(ref["outcome_column"], "OutcomeRef.outcome_column")
        verifier_file = files.get(ref["verifier_path"])
        if verifier_file is None:
            _fail("Unknown", "missing_input", "OutcomeRef file missing")
        ranges = [r for r in verifier_file["definition_ranges"]
                  if r["range_id"] == ref["range_id"]]
        if len(ranges) != 1 or ranges[0]["grammar"] != "table_column":
            _fail("Unknown", "missing_input", "OutcomeRef verifier definition range missing")
        verifier_definition = definitions[verifier_id]
        definition_range = ranges[0]
        if (verifier_definition["path"] != ref["verifier_path"] or
                verifier_definition["range_id"] != ref["range_id"] or
                verifier_definition["definition_kind"] != "table_column"):
            _fail("Unknown", "conflict", "OutcomeRef does not point to verifier's defining range")
        table_rows = graph.get("table_rows", {}).get((ref["verifier_path"], ref["range_id"]))
        if table_rows is None:
            _fail("Unknown", "missing_input", "OutcomeRef table rows unavailable")
        id_column = definition_range["id_column"]
        matches = [(line_no, cells) for line_no, cells in table_rows
                   if len(cells) >= id_column and _cell_id(cells[id_column - 1]) == verifier_id]
        if len(matches) != 1:
            _fail("Unknown", "missing_input", "OutcomeRef verifier definition row is absent or ambiguous")
        line_no, cells = matches[0]
        if column == id_column or column > len(cells) or not cells[column - 1].strip():
            _fail("Unknown", "missing_input", "OutcomeRef outcome cell is empty at line " + str(line_no))
        by_source[source_id].append(edge_id)
    dispositions = manifest["coverage_dispositions"]
    seen_dispositions = set()
    for disposition in dispositions:
        source = disposition["source_id"]
        if source in seen_dispositions:
            _fail("Unknown", "conflict", "duplicate coverage disposition")
        seen_dispositions.add(source)
        actual_ids = sorted(by_source.get(source, []))
        listed_ids = disposition["edge_ids"]
        if disposition["state"] == "not_exercised":
            if actual_ids or listed_ids:
                _fail("Rejected", "invalid_input", "not_exercised source has edge")
        elif not actual_ids:
            _fail("Unknown", "missing_input", "mapped/partial source has no edge: " + source)
        if sorted(listed_ids) != actual_ids:
            _fail("Unknown", "missing_input", "disposition edge_ids do not match source edges: " + source)
    if seen_dispositions != REQUIRED_SOURCE_IDS:
        _fail("Unknown", "missing_input", "coverage source set incomplete")
    required_pairs = graph.get("reference_pairs", set())
    actual_pairs = {(edge["source_id"], edge["verifier_id"]) for edge in edges}
    missing_pairs = required_pairs - actual_pairs
    if missing_pairs:
        source_id, verifier_id = sorted(missing_pairs)[0]
        _fail("Unknown", "missing_input", "reference-declared coverage edge missing: " + source_id + " -> " + verifier_id)
    nonpass = []
    for item in dispositions:
        if item["state"] != "mapped":
            nonpass.append({"kind": "coverage_disposition", **item})
    for item in manifest["source_scopeouts"]:
        nonpass.append({"kind": "source_scopeout", **item})
    for item in manifest["unsupported_items"]:
        nonpass.append({"kind": "unsupported_item", **item})
    return {"structure_complete": True, "edge_count": len(edges), "nonpass_inventory": nonpass}


def verify_legacy_pins(manifest: dict, sources: dict[str, bytes], ledger_bytes: bytes) -> dict:
    """Check asset ledger identity/path/full digest and independent line span."""
    if not isinstance(ledger_bytes, bytes):
        _fail("Rejected", "invalid_input", "ledger must be bytes")
    try:
        ledger_text = ledger_bytes.decode("utf-8", "strict")
    except UnicodeDecodeError as exc:
        raise Diagnostic("Unknown", "unreadable", "legacy ledger is not UTF-8") from exc
    records = {}
    for line_no, line in enumerate(ledger_text.splitlines(), 1):
        if not line.strip():
            continue
        record = strict_json(line)
        if not isinstance(record, dict) or not isinstance(record.get("asset_id"), str):
            _fail("Rejected", "invalid_input", "legacy ledger record shape at line " + str(line_no))
        asset = record["asset_id"]
        if asset in records:
            _fail("Unknown", "conflict", "duplicate asset ID in ledger: " + asset)
        records[asset] = record
    verified = []
    archive_prefix = "archive/legacy-generation-2026-09-14/root/"
    for pin in manifest["legacy_pins"]:
        asset = pin["asset_id"]
        record = records.get(asset)
        if record is None:
            _fail("Unknown", "missing_input", "legacy asset absent from ledger: " + asset)
        archive_path = pin["archive_path"]
        if not archive_path.startswith(archive_prefix):
            _fail("Rejected", "invalid_input", "legacy archive path is outside fixed archive root")
        expected_source_path = archive_path[len(archive_prefix):]
        if record.get("source_path") != expected_source_path or record.get("source_sha256") != pin["full_file_sha256"]:
            _fail("Unknown", "conflict", "legacy ledger path/full digest mismatch: " + asset)
        data = sources.get(archive_path)
        if data is None:
            _fail("Unknown", "missing_input", "legacy archive bytes missing: " + archive_path)
        if not isinstance(data, bytes):
            _fail("Rejected", "invalid_input", "legacy source must be bytes")
        if sha256(data) != pin["full_file_sha256"]:
            _fail("Unknown", "conflict", "legacy full file digest mismatch: " + asset)
        if pin["span_sha256"] is not None:
            lines = data.splitlines(keepends=True)
            lo, hi = pin["line_start"], pin["line_end"]
            if hi > len(lines):
                _fail("Unknown", "missing_input", "legacy line span unavailable: " + asset)
            if sha256(b"".join(lines[lo - 1:hi])) != pin["span_sha256"]:
                _fail("Unknown", "conflict", "legacy line-span digest mismatch: " + asset)
        verified.append(asset)
    return {"verified_count": len(verified), "asset_ids": verified}


def verify_design_manifest(raw: bytes, sources: dict[str, bytes], ledger_bytes: bytes) -> dict:
    """Run all structural source, graph, coverage, and historical-pin checks."""
    manifest = load_design_manifest(raw, sources)
    graph = resolve_id_graph(manifest, sources)
    coverage = verify_coverage_edges(manifest, graph)
    pins = verify_legacy_pins(manifest, sources, ledger_bytes)
    return {"structure_complete": coverage["structure_complete"],
            "nonpass_inventory": coverage["nonpass_inventory"],
            "edge_count": coverage["edge_count"],
            "definition_count": len(graph["definitions"]),
            "reference_count": len(graph["references"]),
            "legacy_pin_report": pins}
