# Aurora Dairies — Candidate Review System

This folder is Jeff's working area for reviewing incoming candidate CVs for both Aurora Dairies roles.

---

## How it works

### 1. A CV comes in
Save the file (PDF, DOCX, whatever format) into the correct `incoming/` folder:

- HR Business Partner candidates → `candidates/hrbp/incoming/`
- HR Analyst & Systems Administrator candidates → `candidates/hr-analyst/incoming/`

Any filename is fine. If the candidate's name isn't already in the filename, rename it for sanity (e.g. `Jane-Smith-CV.pdf`).

### 2. Ask Claude to review
In a chat message, say something like:

> *"Review the new CV in HRBP incoming"*
> or
> *"Please assess Jane-Smith-CV.pdf in the hrbp incoming folder"*

Claude will:
- Read the CV
- Cross-reference against the **Position Description** (in `briefing/`), the **internal briefing doc** (in `campaign/hrbp-briefing-internal.md` or `hr-analyst-briefing-internal.md`), and the relevant **ICP card statements**
- Write a structured assessment file into `candidates/[role]/assessments/[candidate-name]-assessment.md`
- Update `candidates/candidate-tracker.md` with the new entry + recommendation
- Move the CV from `incoming/` to `assessed/`

### 3. What you'll get in each assessment
See `ASSESSMENT-TEMPLATE.md` for the full structure. Every assessment includes:

- **Executive summary** — 2–3 sentence read of the candidate
- **PD alignment** — matches against the actual Position Description's essential + desirable criteria
- **Internal briefing alignment** — matches against the softer requirements from the recruiter briefing doc
- **ICP statement scoring** — Y / Maybe / N + evidence for each of the 5 ICP statements
- **Cultural fit signals** — get-shit-done, distributed workforce exposure, travel openness, long-term commitment
- **Red flags** — anything of concern (short tenure patterns, industry mismatch, gaps)
- **Tailored screening questions** — 3–5 questions specific to this candidate for the video vetting
- **Recommendation** — Strong Progress / Progress with Care / Second Look / Pass, with rationale

### 4. Candidate tracker
`candidate-tracker.md` is the running master list of every candidate seen — updated automatically as new assessments come in. Two tables (one per role), each showing:

- Date received
- Candidate name
- Source (LinkedIn / SEEK / Referral / etc.)
- Current status (Assessed / Screening / Shortlist / Interview 1 / Interview 2 / Offer / Placed / Passed)
- Recommendation from initial assessment
- Notes / next action

Whenever a candidate moves through the process (e.g. after the video vetting call, or after Jenna's interview), you can just say *"Update Jane Smith to shortlist status"* and Claude will update the tracker.

---

## Folder tree

```
candidates/
├── README.md                       ← this file
├── candidate-tracker.md            ← running master list
├── ASSESSMENT-TEMPLATE.md          ← template Claude uses for each assessment
│
├── hrbp/
│   ├── incoming/                   ← DROP CVs HERE
│   ├── assessed/                   ← moved after review
│   └── assessments/                ← written assessments live here
│
└── hr-analyst/
    ├── incoming/                   ← DROP CVs HERE
    ├── assessed/
    └── assessments/
```

---

## What Claude uses as reference material (all already loaded in context)

For each role, Claude cross-references against:

| Source | Where | What it provides |
|---|---|---|
| **Position Description** | `briefing/Position Description - [role].docx` | The formal essential + desirable skills, experience, competencies |
| **Internal briefing doc** | `campaign/[role]-briefing-internal.md` | The recruiter-only context including Jenna's exact language, cultural signals, deal-breakers |
| **ICP card statements** | The 5 statements on the visual ICP card | The specific "you're the person who..." signal statements |
| **Briefing transcript** | `briefing/Briefing_notes.md` | Original transcript of the Jenna briefing call for direct quote reference |

---

## Notes on confidentiality

All candidate information stored in this folder is confidential. `.vercelignore` excludes `clients/` from the public deploy, so nothing here is publicly accessible via `hextalent.com.au`.

If you're using a cloud sync (Dropbox, iCloud, OneDrive) for the parent HeXTalent Site folder, be aware that CVs are syncing there too. This is generally fine for solo operation but worth noting.
