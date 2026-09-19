#!/usr/bin/env python3
"""仮設パケットの改変・取り違えを検出する。旧testを使用しない。"""
import copy
import json
import subprocess
import sys
import unittest
import packet as p


class PacketChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.head = p.git("rev-parse", "HEAD").decode().strip()
        cls.base = p.git("rev-parse", "HEAD^").decode().strip()
        cls.request = json.loads(subprocess.check_output([
            sys.executable, "-B", str(p.Path(__file__).with_name("packet.py")), "build",
            "--base", cls.base, "--head", cls.head, "--pr", "1", "--request-id", "SELFTEST-ONLY",
            "--author", "codex", "--purpose", "仮設形式検査", "--scope", "合成入力のみ"], cwd=p.ROOT))

    def check(self, packet):
        p.validate(packet, self.base, self.head)

    def response(self):
        r = {k: self.request[k] for k in ("request_id", "base_sha", "content_sha", "reviewer")}
        r.update(schema="scaffold-review-response.v1", evidence_kind="scaffold", authority_effect="none",
                 request_payload_sha256=self.request["payload_sha256"], result="no_findings", findings=[], unreviewed=[])
        return r

    def test_roundtrip(self):
        self.check(self.request)
        p.validate_response(self.response(), self.request)

    def test_stale_head(self):
        with self.assertRaises(ValueError):
            p.validate(self.request, self.head, self.base)

    def test_payload_tamper(self):
        r = copy.deepcopy(self.request)
        r["purpose"] += "改変"
        with self.assertRaises(ValueError): self.check(r)

    def test_reference_omission(self):
        r = copy.deepcopy(self.request)
        r["references"].pop()
        with self.assertRaises(ValueError): self.check(r)

    def test_candidate_promotion(self):
        r = copy.deepcopy(self.request)
        r["references"][-1]["kind"] = "project_rule"
        with self.assertRaises(ValueError): self.check(r)

    def test_same_runtime(self):
        r = copy.deepcopy(self.request)
        r["reviewer"] = r["author"]
        with self.assertRaises(ValueError): self.check(r)

    def test_unknown_authority(self):
        for field, value in (("approved", True), ("authority_effect", "approved"), ("route", "cli")):
            r = copy.deepcopy(self.request)
            r[field] = value
            with self.assertRaises(ValueError): self.check(r)

    def test_wrong_response_binding(self):
        for field in ("request_id", "request_payload_sha256", "base_sha", "content_sha", "reviewer"):
            r = self.response()
            r[field] = "wrong"
            with self.assertRaises(ValueError): p.validate_response(r, self.request)

    def test_incomplete_not_clean(self):
        r = self.response()
        r["unreviewed"] = ["未確認"]
        with self.assertRaises(ValueError): p.validate_response(r, self.request)
        r["result"] = "incomplete"
        p.validate_response(r, self.request)

    def test_findings_need_evidence(self):
        r = self.response()
        r["result"] = "findings"
        r["findings"] = [{"id": "F1", "severity": "Major", "evidence": "", "change": "修正箇所"}]
        with self.assertRaises(ValueError): p.validate_response(r, self.request)
        r["findings"][0]["evidence"] = "対象path:行と反例"
        p.validate_response(r, self.request)


if __name__ == "__main__":
    unittest.main()
