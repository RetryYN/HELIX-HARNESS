import { writeFileSync } from "node:fs";
import { scanDigestInventory, DIGEST_VARIANTS } from "../src/lint/digest-inventory";
const rows=scanDigestInventory(process.cwd());
writeFileSync("config/digest-canonicalization-inventory.json",`${JSON.stringify({schema_version:"digest-inventory.v3",variants:DIGEST_VARIANTS,rows},null,2)}\n`);
