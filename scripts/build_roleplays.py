#!/usr/bin/env python3
"""
Reads every role play PDF in roleplays/ and writes js/roleplays.json, which
the BowtieGOAT Role Plays page (role-plays.html) renders its tiles from.

Filenames must follow:  GOAT_<EVENT CODE>_<YEAR>_<NAME>.pdf
  e.g. GOAT_AAM_2526_DISTRICT_EVENT1.pdf, GOAT_RFSM_2627_EXTRA2.pdf

From each PDF it pulls:
  - Instructional Area  (page 1, the line under "INSTRUCTIONAL AREA")
  - Performance Indicators (page 1, the numbered list)
  - Event Situation     (from "EVENT SITUATION" until the judge materials)
The event name and career cluster come from the event code in the filename,
using DECA's official names in EVENTS below -- not the text inside the PDF.

A file with a problem (unknown event code, missing section, bad filename) is
skipped and reported; every other file is still published. The script exits
with an error at the end so the GitHub Action shows as failed and emails you.

Run manually with `python3 scripts/build_roleplays.py` (needs `pip install pypdf`),
or automatically via .github/workflows/update-role-plays.yml whenever a PDF
in roleplays/ is added, replaced, or removed.
"""
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "roleplays"
OUTPUT_PATH = ROOT / "js" / "roleplays.json"

# DECA role play events: code -> (official name, career cluster key).
# To support a new event, add its DECA code here.
EVENTS = {
    # Business Management & Administration
    "BLTDM": ("Business Law and Ethics Team Decision Making", "business"),
    "HRM": ("Human Resources Management Series", "business"),
    "PBM": ("Principles of Business Management and Administration", "business"),
    # Entrepreneurship
    "ENT": ("Entrepreneurship Series", "entrepreneurship"),
    "ETDM": ("Entrepreneurship Team Decision Making", "entrepreneurship"),
    "PEN": ("Principles of Entrepreneurship", "entrepreneurship"),
    # Finance
    "ACT": ("Accounting Applications Series", "finance"),
    "BFS": ("Business Finance Series", "finance"),
    "FTDM": ("Financial Services Team Decision Making", "finance"),
    "PFN": ("Principles of Finance", "finance"),
    # Hospitality & Tourism
    "HLM": ("Hotel and Lodging Management Series", "hospitality"),
    "HTDM": ("Hospitality Services Team Decision Making", "hospitality"),
    "PHT": ("Principles of Hospitality and Tourism", "hospitality"),
    "QSRM": ("Quick Serve Restaurant Management Series", "hospitality"),
    "RFSM": ("Restaurant and Food Service Management Series", "hospitality"),
    "TTDM": ("Travel and Tourism Team Decision Making", "hospitality"),
    # Marketing
    "AAM": ("Apparel and Accessories Marketing Series", "marketing"),
    "ASM": ("Automotive Services Marketing Series", "marketing"),
    "BSM": ("Business Services Marketing Series", "marketing"),
    "BTDM": ("Buying and Merchandising Team Decision Making", "marketing"),
    "FMS": ("Food Marketing Series", "marketing"),
    "MCS": ("Marketing Communications Series", "marketing"),
    "MTDM": ("Marketing Management Team Decision Making", "marketing"),
    "PMK": ("Principles of Marketing", "marketing"),
    "RMS": ("Retail Merchandising Series", "marketing"),
    "SEM": ("Sports and Entertainment Marketing Series", "marketing"),
    "STDM": ("Sports and Entertainment Marketing Team Decision Making", "marketing"),
    # Personal Financial Literacy
    "PFL": ("Personal Financial Literacy", "pfl"),
}

# Spelling variants -> the instructional area name shown on the site.
# ("Information Management" and "Marketing-Information Management" are
# different DECA instructional areas -- never merge them.)
IA_ALIASES = {
    "Product/Services Management": "Product/Service Management",
}

FILENAME_RE = re.compile(r"^GOAT_([A-Z]+)_(\d{4})_([A-Z0-9-]+(?:_[A-Z0-9-]+)*)\.pdf$")

# Where the participant situation ends and judge-only material begins
SITUATION_END_RE = re.compile(
    r"(?:Possible|Potential) Judge|Judge[’']s Questions|JUDGE INSTRUCTIONS|JUDGE ROLE|Did the participant|Mathematical Calculations",
    re.IGNORECASE,
)

# Abbreviations whose period doesn't end a sentence (e.g. "SMITH & CO. FINANCIAL")
ABBREVIATIONS_RE = re.compile(r"\b(Co|Inc|Ltd|Corp|Mr|Mrs|Ms|Dr|St|Jr|Sr|Bros|vs|U\.S)\.", re.IGNORECASE)


def clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    # Re-join words split by a line-break hyphen: "fast- fashion" -> "fast-fashion"
    return re.sub(r"(\w)- (\w)", r"\1-\2", text)


def first_sentence(text: str) -> str:
    protected = ABBREVIATIONS_RE.sub(lambda m: m.group(0).replace(".", "\x00"), text)
    match = re.match(r"(.+?[.!?][”\"’']?)(?=\s+[A-Z“\"]|$)", protected)
    sentence = match.group(1) if match else protected
    return sentence.replace("\x00", ".")


def page_body(page_text: str) -> str:
    # Drop the two-line running header ("BowtieGOAT" / "ACT District Event 1 24-25")
    return "\n".join(page_text.splitlines()[2:])


def parse_pdf(path: Path) -> dict:
    match = FILENAME_RE.match(path.name)
    if not match:
        raise ValueError("filename doesn't match GOAT_<CODE>_<YEAR>_<NAME>.pdf (check for spaces)")
    code, year, name = match.groups()
    if code not in EVENTS:
        raise ValueError(f"unknown event code '{code}' -- add it to EVENTS in scripts/build_roleplays.py")
    event, cluster = EVENTS[code]

    pages = [p.extract_text() or "" for p in PdfReader(path).pages]
    lines = [l.strip() for l in pages[0].splitlines()]

    ia = None
    for i, line in enumerate(lines):
        if line == "INSTRUCTIONAL AREA":
            ia = next((l for l in lines[i + 1:] if l), None)
            break
    if not ia:
        raise ValueError("couldn't find the INSTRUCTIONAL AREA on page 1")
    ia = IA_ALIASES.get(ia, ia)

    pi_match = re.search(r"PERFORMANCE INDICATORS\s*(.+)", pages[0], re.DOTALL)
    if not pi_match:
        raise ValueError("couldn't find PERFORMANCE INDICATORS on page 1")
    pis = [clean(p) for p in re.split(r"(?:^|\s)\d{1,2}\.\s+", clean(pi_match.group(1))) if p.strip()]

    body = "\n".join(page_body(p) for p in pages[1:])
    sit_match = re.search(r"EVENT SITUATION\s*(.+)", body, re.DOTALL)
    if not sit_match:
        raise ValueError("couldn't find the EVENT SITUATION")
    situation = SITUATION_END_RE.split(sit_match.group(1), maxsplit=1)[0]
    situation = clean(situation)

    number = re.search(r"(\d+)$", name)
    return {
        "file": path.name,
        "code": code,
        "event": event,
        "cluster": cluster,
        "ia": ia,
        "sentence": first_sentence(situation),
        "situation": situation,
        "pis": pis,
        "_sort": (-int(year), event, -(int(number.group(1)) if number else 0), path.name),
    }


def main() -> int:
    items, problems = [], []
    for path in sorted(PDF_DIR.glob("*.pdf")):
        try:
            items.append(parse_pdf(path))
        except Exception as exc:  # report and skip, so one bad file never blocks the rest
            problems.append(f"{path.name}: {exc}")

    # Newest school year first, then event A-Z, then higher number first (EVENT2 before EVENT1)
    items.sort(key=lambda item: item["_sort"])
    for item in items:
        del item["_sort"]

    OUTPUT_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} role plays to {OUTPUT_PATH.relative_to(ROOT)}")

    if problems:
        print(f"\n{len(problems)} file(s) skipped -- fix and re-upload:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
