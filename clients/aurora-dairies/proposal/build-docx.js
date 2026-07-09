/*
 * Aurora Dairies — Recruitment Proposal & Terms of Business
 * Generates an editable Word (.docx) version.
 *
 * Design notes:
 *  - A4 paper, 20mm margins
 *  - Cover page: dark background with cream text, hex mark ASCII placeholder,
 *    "HeXTalent" wordmark with a highlighted "X"
 *  - Body: Calibri body / Cambria display headings (universally available in Word)
 *  - Terms of Business embedded as second half
 *  - Signature block at end
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat, PageBreak,
  HeadingLevel, BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber,
  TabStopType, TabStopPosition
} = require(path.join(process.env.HOME, '.npm-global/lib/node_modules/docx'));

// ---------- palette ----------
const INK = '0A0C10';
const CREAM = 'F1ECE1';
const ACCENT = '5A9FBE';
const ACCENT_DEEP = '3D7A9C';
const TEXT = '14181F';
const TEXT_SOFT = '4A4D55';
const TEXT_MUTE = '7A7D84';
const BORDER = 'D8D3C8';
const PAPER_SOFT = 'F7F5F0';

// ---------- helpers ----------
const p = (opts) => new Paragraph(opts);
const t = (text, opts = {}) => new TextRun({ text, font: 'Calibri', size: 22, ...opts });
const emptyLine = (points = 6) => p({ spacing: { after: points * 20 }, children: [new TextRun('')] });

// Heading factories
const heading1 = (text, opts = {}) => p({
  spacing: { before: 240, after: 120 },
  children: [ new TextRun({ text, font: 'Cambria', size: 44, color: INK, bold: false, ...opts }) ]
});
const heading2 = (text) => p({
  spacing: { before: 240, after: 80 },
  keepNext: true,
  children: [ new TextRun({ text, font: 'Cambria', size: 30, color: INK, bold: false }) ]
});
const heading3 = (text) => p({
  spacing: { before: 160, after: 40 },
  keepNext: true,
  children: [ new TextRun({ text, font: 'Calibri', size: 22, color: INK, bold: true }) ]
});
const eyebrow = (text) => p({
  spacing: { before: 120, after: 60 },
  border: {
    bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 }
  },
  children: [ new TextRun({ text, font: 'Calibri', size: 16, color: ACCENT_DEEP, bold: false, characterSpacing: 60 }) ]
});
const body = (text, opts = {}) => p({
  spacing: { after: 120, line: 300 },
  alignment: AlignmentType.LEFT,
  children: Array.isArray(text) ? text : [ new TextRun({ text, font: 'Calibri', size: 22, color: TEXT, ...opts }) ]
});
const lede = (text) => p({
  spacing: { after: 160, line: 320 },
  children: [ new TextRun({ text, font: 'Cambria', size: 26, color: TEXT }) ]
});
const bullet = (text) => p({
  spacing: { after: 60, line: 280 },
  numbering: { reference: 'bullets', level: 0 },
  children: [ new TextRun({ text, font: 'Calibri', size: 22, color: TEXT }) ]
});
const numbered = (text) => p({
  spacing: { after: 60, line: 280 },
  numbering: { reference: 'numbers', level: 0 },
  children: [ new TextRun({ text, font: 'Calibri', size: 22, color: TEXT }) ]
});

// Table cell shortcut
const cell = (children, opts = {}) => new TableCell({
  width: { size: opts.width || 4680, type: WidthType.DXA },
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR, color: 'auto' } : undefined,
  borders: {
    top:    { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
    left:   { style: BorderStyle.NONE, size: 0, color: BORDER },
    right:  { style: BorderStyle.NONE, size: 0, color: BORDER },
  },
  children: Array.isArray(children) ? children : [children],
});

// ============================================================
// COVER PAGE — as a single-page dark table filling the page
// ============================================================
const buildCoverPage = () => {
  const spacer = (points) => p({ spacing: { after: points * 20 }, children: [new TextRun('')] });
  const centered = (text, opts = {}) => p({
    alignment: AlignmentType.CENTER,
    spacing: opts.spacing || { after: 60 },
    children: [ new TextRun({ text, ...opts.run, color: opts.run?.color || CREAM }) ]
  });

  const coverCell = new TableCell({
    width: { size: 11340, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: { fill: INK, type: ShadingType.CLEAR, color: 'auto' },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: INK },
      bottom: { style: BorderStyle.NONE, size: 0, color: INK },
      left: { style: BorderStyle.NONE, size: 0, color: INK },
      right: { style: BorderStyle.NONE, size: 0, color: INK },
    },
    margins: { top: 2000, bottom: 2000, left: 800, right: 800 },
    children: [
      spacer(20),

      // Wordmark: HeXTalent with X in accent
      p({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({ text: 'He', font: 'Cambria', size: 96, color: CREAM }),
          new TextRun({ text: 'X', font: 'Cambria', size: 96, color: ACCENT }),
          new TextRun({ text: 'Talent', font: 'Cambria', size: 96, color: CREAM }),
        ]
      }),

      // Tagline
      p({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({ text: 'The Humanistic eXchange', font: 'Cambria', size: 32, color: ACCENT, italics: true })
        ]
      }),

      // Divider
      p({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [ new TextRun({ text: '· · ·', font: 'Cambria', size: 24, color: CREAM }) ]
      }),

      // Doctype eyebrow
      centered('RECRUITMENT PROPOSAL', {
        run: { font: 'Calibri', size: 18, color: ACCENT, characterSpacing: 120 },
        spacing: { after: 120 },
      }),

      // Title
      p({
        alignment: AlignmentType.CENTER,
        spacing: { after: 500 },
        children: [ new TextRun({ text: 'Prepared for Aurora Dairies', font: 'Cambria', size: 56, color: CREAM }) ]
      }),

      // Meta lines
      centered('Attention  ·  Jenna Tran, General Manager Human Resources', {
        run: { font: 'Calibri', size: 20, color: CREAM },
        spacing: { after: 60 },
      }),
      centered('Prepared by  ·  Jeff Teale, Founder & Director', {
        run: { font: 'Calibri', size: 20, color: CREAM },
        spacing: { after: 60 },
      }),
      centered(`Prepared  ·  ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`, {
        run: { font: 'Calibri', size: 20, color: CREAM },
        spacing: { after: 60 },
      }),
      centered('Reference  ·  HT-AD-2026-01', {
        run: { font: 'Calibri', size: 20, color: CREAM },
        spacing: { after: 600 },
      }),

      // Footer
      centered('HEX TALENT PTY LTD  ·  SUNSHINE COAST, QUEENSLAND', {
        run: { font: 'Calibri', size: 14, color: '888880', characterSpacing: 100 },
      }),
    ],
  });

  return new Table({
    width: { size: 11340, type: WidthType.DXA },
    columnWidths: [11340],
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: INK },
      bottom: { style: BorderStyle.NONE, size: 0, color: INK },
      left: { style: BorderStyle.NONE, size: 0, color: INK },
      right: { style: BorderStyle.NONE, size: 0, color: INK },
    },
    rows: [ new TableRow({ height: { value: 13500, rule: 'exact' }, children: [ coverCell ] }) ],
  });
};

// ============================================================
// TABLES for the roles + commercials
// ============================================================
const rolesTable = () => new Table({
  width: { size: 10000, type: WidthType.DXA },
  columnWidths: [4000, 2500, 3500],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell(p({ children: [new TextRun({ text: 'ROLE', font: 'Calibri', size: 18, bold: true, color: INK, characterSpacing: 40 })] }), { width: 4000, shading: PAPER_SOFT }),
        cell(p({ children: [new TextRun({ text: 'TYPE', font: 'Calibri', size: 18, bold: true, color: INK, characterSpacing: 40 })] }), { width: 2500, shading: PAPER_SOFT }),
        cell(p({ children: [new TextRun({ text: 'INDICATIVE PACKAGE', font: 'Calibri', size: 18, bold: true, color: INK, characterSpacing: 40 })] }), { width: 3500, shading: PAPER_SOFT }),
      ]
    }),
    new TableRow({ children: [
      cell(p({ children: [new TextRun({ text: 'Human Resources Business Partner', font: 'Calibri', size: 22, color: INK, bold: true })] }), { width: 4000 }),
      cell(p({ children: [new TextRun({ text: 'Full time, permanent', font: 'Calibri', size: 22, color: TEXT })] }), { width: 2500 }),
      cell(p({ children: [new TextRun({ text: 'Up to $150,000 pa + super', font: 'Calibri', size: 22, color: TEXT })] }), { width: 3500 }),
    ]}),
    new TableRow({ children: [
      cell(p({ children: [new TextRun({ text: 'Human Resources Administrator', font: 'Calibri', size: 22, color: INK, bold: true })] }), { width: 4000 }),
      cell(p({ children: [new TextRun({ text: 'Part time, permanent', font: 'Calibri', size: 22, color: TEXT })] }), { width: 2500 }),
      cell(p({ children: [new TextRun({ text: 'Circa $80,000 pa + super, pro-rated to part-time', font: 'Calibri', size: 22, color: TEXT })] }), { width: 3500 }),
    ]}),
  ]
});

const feesTable = () => {
  const keyCell = (text) => cell(p({ children: [new TextRun({ text, font: 'Calibri', size: 22, color: INK, bold: true })] }), { width: 3200 });
  const valCell = (main, sub) => cell([
    p({ spacing: { after: 40 }, children: [new TextRun({ text: main, font: 'Calibri', size: 22, color: INK, bold: true })] }),
    ...(sub ? [p({ children: [new TextRun({ text: sub, font: 'Calibri', size: 20, color: TEXT_MUTE, italics: true })] })] : []),
  ], { width: 6800 });

  return new Table({
    width: { size: 10000, type: WidthType.DXA },
    columnWidths: [3200, 6800],
    rows: [
      new TableRow({ children: [ keyCell('Placement fee'), valCell('15% of total remuneration per role', 'reduced from HeXTalent’s standard 18%') ]}),
      new TableRow({ children: [ keyCell('Engagement fee'), valCell('$3,000 + GST', 'a single flat fee to commence the work, covering both roles. Non-refundable, credited pro-rata against the successful placement invoices.') ]}),
      new TableRow({ children: [ keyCell('Balance'), valCell('Invoiced on the successful commencement of each Candidate, less the applicable engagement-fee credit.') ]}),
      new TableRow({ children: [ keyCell('Replacement guarantee'), valCell('Per Terms of Business — six months for full-time permanent placements of 12 months or more.') ]}),
    ]
  });
};

const guaranteeTable = () => new Table({
  width: { size: 10000, type: WidthType.DXA },
  columnWidths: [6600, 3400],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell(p({ children: [new TextRun({ text: 'ENGAGED ROLE', font: 'Calibri', size: 18, bold: true, color: INK, characterSpacing: 40 })] }), { width: 6600, shading: PAPER_SOFT }),
      cell(p({ children: [new TextRun({ text: 'GUARANTEE PERIOD', font: 'Calibri', size: 18, bold: true, color: INK, characterSpacing: 40 })] }), { width: 3400, shading: PAPER_SOFT }),
    ]}),
    new TableRow({ children: [
      cell(p({ children: [new TextRun({ text: 'Permanent Placement or fixed term contract of 12 months or more.', font: 'Calibri', size: 22, color: TEXT })] }), { width: 6600 }),
      cell(p({ children: [new TextRun({ text: 'Six (6) months', font: 'Calibri', size: 22, color: INK, bold: true })] }), { width: 3400 }),
    ]}),
    new TableRow({ children: [
      cell(p({ children: [new TextRun({ text: 'Permanent Placement or fixed term contract of less than 12 months but greater than six (6) months.', font: 'Calibri', size: 22, color: TEXT })] }), { width: 6600 }),
      cell(p({ children: [new TextRun({ text: 'Three (3) months', font: 'Calibri', size: 22, color: INK, bold: true })] }), { width: 3400 }),
    ]}),
    new TableRow({ children: [
      cell(p({ children: [new TextRun({ text: 'Permanent Placement or fixed term contract of less than six (6) months.', font: 'Calibri', size: 22, color: TEXT })] }), { width: 6600 }),
      cell(p({ children: [new TextRun({ text: 'Two (2) months', font: 'Calibri', size: 22, color: INK, bold: true })] }), { width: 3400 }),
    ]}),
  ]
});

// ============================================================
// SIGNATURE BLOCK
// ============================================================
const sigCell = (title, presigned) => {
  const lines = [
    p({ spacing: { after: 200 }, children: [new TextRun({ text: title, font: 'Cambria', size: 24, color: INK, bold: false })] }),
    p({
      spacing: { after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEXT_SOFT, space: 4 } },
      children: [new TextRun({ text: presigned?.signature || ' ', font: 'Calibri', size: 22, color: TEXT })]
    }),
    p({ spacing: { after: 200 }, children: [new TextRun({ text: 'SIGNATURE', font: 'Calibri', size: 14, color: TEXT_MUTE, characterSpacing: 40 })] }),
    p({
      spacing: { after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEXT_SOFT, space: 4 } },
      children: [new TextRun({ text: presigned?.name || ' ', font: 'Calibri', size: 22, color: TEXT })]
    }),
    p({ spacing: { after: 200 }, children: [new TextRun({ text: 'PRINTED NAME', font: 'Calibri', size: 14, color: TEXT_MUTE, characterSpacing: 40 })] }),
    p({
      spacing: { after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEXT_SOFT, space: 4 } },
      children: [new TextRun({ text: presigned?.position || ' ', font: 'Calibri', size: 22, color: TEXT })]
    }),
    p({ spacing: { after: 200 }, children: [new TextRun({ text: 'POSITION', font: 'Calibri', size: 14, color: TEXT_MUTE, characterSpacing: 40 })] }),
    p({
      spacing: { after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEXT_SOFT, space: 4 } },
      children: [new TextRun({ text: ' ', font: 'Calibri', size: 22, color: TEXT })]
    }),
    p({ children: [new TextRun({ text: 'DATE', font: 'Calibri', size: 14, color: TEXT_MUTE, characterSpacing: 40 })] }),
  ];
  return new TableCell({
    width: { size: 5000, type: WidthType.DXA },
    margins: { top: 160, bottom: 160, left: 160, right: 160 },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    children: lines,
  });
};

const signatureTable = () => new Table({
  width: { size: 10000, type: WidthType.DXA },
  columnWidths: [5000, 5000],
  rows: [
    new TableRow({ children: [
      sigCell('Signed on behalf of Aurora Dairies Pty Ltd'),
      sigCell('Signed on behalf of Hex Talent Pty Ltd', { name: 'Jeff Teale', position: 'Founder & Director' }),
    ]})
  ]
});

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  creator: 'Jeff Teale (HeXTalent)',
  title: 'Aurora Dairies — Recruitment Proposal & Terms of Business',
  description: 'Recruitment proposal from HeXTalent for Aurora Dairies',
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22 } }
    }
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 500, hanging: 260 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 500, hanging: 260 } } }
        }]
      },
      {
        reference: 'lower-alpha',
        levels: [{
          level: 0, format: LevelFormat.LOWER_LETTER, text: '(%1)',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 700, hanging: 400 } } }
        }]
      },
    ]
  },
  sections: [
    // ----- Cover page section (no header/footer) -----
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4 in DXA
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
      },
      children: [ buildCoverPage() ]
    },

    // ----- Body section with header/footer + margins -----
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1247, bottom: 1247, left: 1247 } // 20mm-22mm-22mm-22mm
        }
      },
      headers: {
        default: new Header({
          children: [
            p({
              tabStops: [{ type: TabStopType.RIGHT, position: 9413 }],
              spacing: { after: 60 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 4 } },
              children: [
                new TextRun({ text: 'HEXTALENT  ·  RECRUITMENT PROPOSAL', font: 'Calibri', size: 16, color: TEXT_MUTE, characterSpacing: 40 }),
                new TextRun({ text: '\t', font: 'Calibri' }),
                new TextRun({ text: 'Aurora Dairies', font: 'Cambria', size: 18, color: TEXT_MUTE, italics: true }),
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            p({
              tabStops: [{ type: TabStopType.RIGHT, position: 9413 }],
              children: [
                new TextRun({ text: 'HEXTALENT  ·  AURORA DAIRIES', font: 'Calibri', size: 14, color: TEXT_MUTE, characterSpacing: 40 }),
                new TextRun({ text: '\t', font: 'Calibri' }),
                new TextRun({ text: 'Page ', font: 'Calibri', size: 14, color: TEXT_MUTE }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 14, color: TEXT_MUTE }),
              ]
            })
          ]
        })
      },
      children: [
        // === Opening letter ===
        eyebrow('OVERVIEW'),
        heading1('Dear Jenna,'),
        lede('Thank you for the conversation earlier this week and the opportunity to support Aurora Dairies with two important additions to your HR team. It’s a pleasure to submit this proposal for your consideration.'),
        body('HeXTalent has evolved considerably over the past year. It now sits as the parent company behind a small portfolio of focused, human-first products — including Careers in HR (Australia’s specialist HR market platform) and CiHR Talent (a career positioning and support platform for HR professionals). Our recruitment work draws directly on this infrastructure: HR-specific reach, HR-specific market intelligence, and a candidate community built entirely around the profession.'),
        body('For Aurora Dairies, that means the search will be conducted through a genuinely specialist channel — not a generalist agency approach.'),

        heading2('The Engagement'),
        body('Based on our discussion, this proposal covers the following two appointments:'),
        rolesTable(),
        emptyLine(4),
        body('Formal briefs, including hiring manager stakeholders, role scope, and success criteria, will be taken upon acceptance of these terms.'),

        p({ children: [new PageBreak()] }),

        // === Our Approach ===
        eyebrow('METHODOLOGY'),
        heading1('Our Approach'),
        body('Every search follows a considered, quality-led rhythm rather than a volume-first one. Broadly:'),
        bullet('Discovery brief — Detailed briefing with you and any relevant hiring stakeholders, capturing role context, culture, non-negotiables, and success indicators.'),
        bullet('Targeted search — A blended sourcing approach across active and passive channels, including direct visibility through Careers in HR.'),
        bullet('Structured screening — Rigorous initial conversations and candidate validation before any candidate reaches your desk.'),
        bullet('Curated shortlist — A small shortlist of qualified, culturally-aligned candidates, with full context and honest positioning.'),
        bullet('Interview & offer support — Facilitation through interviews, post-interview reference checks prior to formal written offer, offer negotiation, and onboarding hand-over.'),
        bullet('Guarantee period — A replacement guarantee applies as detailed in our Terms of Business.'),

        heading2('Indicative Timelines'),
        body('Timelines below commence from formal brief and terms acceptance. As a general guide:'),
        bullet('Weeks 0–3 — Active search and screening'),
        bullet('Weeks 3–5 — Shortlist submitted, interviews facilitated'),
        bullet('Weeks 5–6 — Post-interview reference checks, offer, acceptance, onboarding support'),
        bullet('Post-placement — Replacement guarantee in force per the Terms of Business'),

        p({ children: [new PageBreak()] }),

        // === Commercial Terms ===
        eyebrow('COMMERCIALS'),
        heading1('Commercial Terms'),
        body('In recognition of the dual engagement, HeXTalent is pleased to offer a reduced placement fee for both roles.'),
        feesTable(),
        emptyLine(4),
        p({
          spacing: { after: 200 },
          shading: { fill: PAPER_SOFT, type: ShadingType.CLEAR, color: 'auto' },
          border: {
            left: { style: BorderStyle.SINGLE, size: 24, color: ACCENT, space: 8 },
            top: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 4 },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 4 },
            right: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 4 },
          },
          children: [
            new TextRun({ text: 'Fees and full terms are detailed in the accompanying Terms of Business (Section 2 onwards). All amounts are exclusive of GST unless otherwise stated.', font: 'Calibri', size: 20, color: TEXT_SOFT })
          ]
        }),

        heading2('Next Steps'),
        numbered('Review the attached Terms of Business, tailored to this engagement.'),
        numbered('Return a signed copy to jeff@hextalent.com.au — or accept online at the link this proposal was shared from.'),
        numbered('On receipt, we will issue an invoice for the engagement fee and schedule the formal role briefings with you.'),
        numbered('Active search commences immediately following the briefs.'),

        body('Thank you again, Jenna — I’m looking forward to partnering with Aurora Dairies on these appointments and to representing your business well in the HR market.'),

        p({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text: 'Warmly,', font: 'Cambria', size: 24, color: TEXT, italics: true })] }),
        p({ spacing: { after: 40 }, children: [new TextRun({ text: 'Jeff Teale', font: 'Cambria', size: 28, color: INK, bold: false })] }),
        p({ children: [new TextRun({ text: 'Founder & Director, Hex Talent Pty Ltd (trading as HeXTalent) · jeff@hextalent.com.au · 0413 682 586 · hextalent.com.au', font: 'Calibri', size: 18, color: TEXT_SOFT })] }),

        p({ children: [new PageBreak()] }),

        // === TERMS OF BUSINESS ===
        eyebrow('LEGAL'),
        heading1('Terms of Business'),
        lede('Permanent Recruitment — prepared for Aurora Dairies Pty Ltd (ABN 55 121 510 067).'),

        heading2('1. Introduction'),

        heading3('The Parties'),
        body([
          new TextRun({ text: '1.1 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'These terms and conditions of business are between ', font: 'Calibri', size: 22, color: TEXT }),
          new TextRun({ text: 'Hex Talent Pty Ltd', font: 'Calibri', size: 22, bold: true, color: TEXT }),
          new TextRun({ text: ' (trading as “HeXTalent”) and/or any subsidiaries or associates thereof (hereinafter called ‘the Company’ or ‘we’) and ', font: 'Calibri', size: 22, color: TEXT }),
          new TextRun({ text: 'Aurora Dairies Pty Ltd', font: 'Calibri', size: 22, bold: true, color: TEXT }),
          new TextRun({ text: ' (ABN 55 121 510 067) and/or any subsidiaries or associates thereof (hereinafter called ‘the Client’ or ‘you’).', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        body([
          new TextRun({ text: '1.2 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The Client agrees to receive services pursuant to these terms and conditions.', font: 'Calibri', size: 22, color: TEXT }),
        ]),

        heading3('Definitions'),
        body([
          new TextRun({ text: '1.3 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'In these terms of business:', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        bullet('Associate means any director, officer, subsidiary or any associate of the Company.'),
        bullet('Candidate means any person introduced to you either directly or indirectly by the Company.'),
        bullet('Engagement Fee means the amount payable on acceptance of these terms to commence the engagement, as set out in clause 2.1.'),
        bullet('Employee means a Candidate who enters into an employment contract with the Client or begins working in the Client’s business after being Introduced to the Client by the Company.'),
        bullet('Engagement, Engaged or Engage means any direct or indirect engagement, employment, retention, contracting or use of a Candidate or Employee by you, your Associate or a third party acting with your encouragement and knowledge.'),
        bullet('Fees means the amounts set out in clause 2 payable by the Client to the Company for the provision of services.'),
        bullet('GST has the meaning given to that term in the GST Law.'),
        bullet('GST Act means A New Tax System (Goods and Services Tax) Act 1999 (Cth).'),
        bullet('GST Law has the meaning given to that term in the GST Act.'),
        bullet('Introduced and Introduction means receipt of a CV, resume or any information, whether orally or in writing, sufficient to identify a Candidate or an Employee.'),
        bullet('Permanent Placement means an Employee who enters into a permanent employment contract (full time or part time) with the Client.'),
        bullet('Remuneration means the aggregate gross annual remuneration package payable to, or on behalf of, a Candidate pursuant to the Engagement, including all inducement payments, Fees (if applicable), base salary and superannuation.'),

        heading3('Acceptance of Terms of Business'),
        body([
          new TextRun({ text: '1.4 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The Client accepts these terms of business if it does any of the following:', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        bullet('(a) returns a signed copy of these terms of business to the Company;'),
        bullet('(b) gives instructions to the Company to provide an Introduction;'),
        bullet('(c) otherwise communicates its intentions to interact with, Engage, recruit or procure a Candidate, whether verbally, orally, in writing or by conduct;'),
        bullet('(d) Engages a Candidate or Employee; or'),
        bullet('(e) otherwise communicates an acceptance of these terms of business (including by electronic acceptance under the Electronic Transactions Act 1999 (Cth)).'),

        heading3('Appointment'),
        body([
          new TextRun({ text: '1.5 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'You are deemed to have appointed the Company to Introduce a Candidate to you on the terms of this agreement if either:', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        bullet('(a) you request that the Company provide you with information about Candidates (including resumes); or'),
        bullet('(b) the Company provides you with information about a Candidate and you do anything in relation to that Candidate including communicating with or contacting, in any way, that Candidate.'),
        body([
          new TextRun({ text: '1.6 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The passing on of an Introduction to another employer which results in an Engagement renders the Client liable to payment of the Fee as set out in clause 2.', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        body([
          new TextRun({ text: '1.7 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'Fees will be charged for any Permanent Placement Engaged as a consequence of, or resulting from, an application to the Company, regardless of whether the Introduction was made directly or indirectly.', font: 'Calibri', size: 22, color: TEXT }),
        ]),

        heading2('2. Fees'),

        heading3('2.1 Engagement Fee'),
        body('An Engagement Fee of $3,000 (exclusive of GST) is payable by the Client to the Company on acceptance of these terms of business, to commence the work under this engagement (covering both roles listed in the accompanying proposal).'),

        heading3('2.2 Placement Fee'),
        body('A Placement Fee of 15% of Remuneration is payable per Candidate on Permanent Placement.'),

        heading3('2.3 Credit of Engagement Fee'),
        body('The Engagement Fee is non-refundable in all circumstances. On Permanent Placement of a Candidate for either role under this engagement, the Engagement Fee will be credited on a pro-rata basis against the Placement Fee invoice(s). If no Permanent Placement occurs, or if the engagement is cancelled or withdrawn by the Client for any reason, the Engagement Fee remains payable in full and is not credited or refunded.'),

        heading3('2.4 Minimum Fee'),
        body('If the Placement Fee for any Permanent Placement does not exceed $5,000, then a minimum Placement Fee of $5,000 will apply.'),

        heading3('2.5 GST'),
        body('All Fees are exclusive of GST. In addition to our Fees you must also pay to us GST payable in respect of the taxable supply at the time payment for the taxable supply is due.'),

        heading3('2.6 Invoicing'),
        body('The Placement Fee (or remainder of the Placement Fee after application of the Engagement Fee credit) will be invoiced upon the Candidate’s commencement date.'),

        heading3('2.7 Payment terms'),
        body('All invoices must be paid within 14 days of the invoice date.'),

        heading3('2.8 Cancellation'),
        body('If, after an offer of employment has been accepted by the Candidate, the Client decides for any reason not to proceed with the Employment, a cancellation Fee of $5,000 plus GST is payable in addition to the Engagement Fee already paid. If the Client subsequently hires the Candidate within a period of 12 months following the cancellation, a full Placement Fee as set out above is then payable, less the cancellation Fee (but not less the Engagement Fee, which is retained by the Company).'),

        heading3('2.9 Part-time placements'),
        body('Where a Candidate is placed on a part-time position, the Placement Fee shall be calculated on a pro-rata basis on the actual Remuneration payable. Should the contract be extended past the agreed end date or should the Candidate go permanent full-time, an additional Fee of no more than the balance of the ‘full’ permanent placement Fee will apply.'),

        heading3('2.10 Calculation basis'),
        body('The Placement Fee payable to the Company by the Client for the introduction of a Candidate is an amount equal to a percentage of the gross annual remuneration (including superannuation) paid by the Client to the Candidate.'),

        heading3('2.11 Deemed engagement'),
        body('Without limitation, the Client will be deemed to have employed a Candidate if you or any related party of the Client:'),
        bullet('(a) employs, retains or engages the Candidate in any capacity;'),
        bullet('(b) enters into an agreement, contract, arrangement or understanding with the Candidate (i) for the provision of goods or services; or (ii) in the nature of contract of services or contract for services; or (iii) in the nature of a partnership, merger, joint venture, consultancy or similar.'),
        bullet('(c) offers any of the above to a Candidate and the Candidate accepts that offer, or you accept an offer from a Candidate in relation to any of the above (whether or not formal contracts are signed or exchanged).'),

        heading3('2.12 Variation'),
        body('Any variation of this contract (including these terms and conditions) must be in writing and agreed by both parties prior to the Introduction of any particular Candidate.'),

        heading3('2.13 Revised Fee Notice'),
        body('We may by notice in writing vary the manner in which the Placement Fee is to be calculated (“Revised Fee Notice”). Our revised Fee structure applies only in relation to a Candidate that the Client employs after the date of the Revised Fee Notice.'),

        heading3('2.14 Client’s decision'),
        body('You must make the final decision on whether to employ a Candidate Introduced by the Company. The Client must satisfy itself as to the qualifications, capabilities, integrity and suitability of that Candidate for the relevant role and the accuracy of any information that the Client obtains in respect of the Candidate.'),

        heading3('2.15 Post-placement information'),
        body('The Client must provide the Company with full particulars of any communication that the Client has with a Candidate in relation to the Client employing that Candidate. Without limitation, the Company must be entitled to receive this information for the first 12 months of the commencement of the employment.'),

        heading2('3. Guarantee Period'),
        body([
          new TextRun({ text: '3.1 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'If a Candidate withdraws from, or proves unsatisfactory for, the role to which they were appointed for a reason which should have been identified within the selection process, and during the Guarantee period referred to in clause 3.2, we will recruit one replacement candidate (“Replacement Candidate”) for the Client on an exclusive basis (“Guarantee”).', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        body([
          new TextRun({ text: '3.2 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The following Guarantee periods will apply to Candidates Engaged by the Client:', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        guaranteeTable(),
        emptyLine(4),
        body('For the avoidance of doubt, the duration of the Engaged Role is the length of time, at the Candidate’s commencement, that the Client Engages the Candidate for (as documented on the Candidate’s employment contract), and not the length of time that the Candidate actually works for or is employed by the Client.', { italics: true, color: TEXT_SOFT }),

        body([
          new TextRun({ text: '3.3 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The Guarantee will not apply:', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        bullet('(a) if the Client has not complied with these terms of business, including the Client’s obligation to pay any invoice for the Fee within 14 days of the invoice date;'),
        bullet('(b) if the Client has not notified the Company in writing of the end of the Candidate’s Employment within seven (7) days of the termination or resignation occurring;'),
        bullet('(c) if the Candidate has been made redundant, redeployed or their role has been restructured;'),
        bullet('(d) if a Candidate chooses to leave their Employment or is terminated due to the alteration of the original job description;'),
        bullet('(e) if the Candidate has made application against the Client alleging a breach of any anti-discrimination laws, unfair dismissal laws or any Fair Work laws;'),
        bullet('(f) to any Replacement Candidate; and'),
        bullet('(g) to any Replacement Candidate who has a higher Remuneration than the original Candidate. If this situation occurs, then the Company will still provide a Guarantee, but the Client must pay the Placement Fee calculated on the difference between the Remuneration of the original Candidate and the Remuneration of the Replacement Candidate.'),
        body([
          new TextRun({ text: '3.4 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'If the Company is unable to find a Replacement Candidate within 90 calendar days of receiving notice from the Client, then the Company will allow a full credit towards any other Candidate that commences within seven months from the end of the 90-day calendar period.', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        body([
          new TextRun({ text: '3.5 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'No cash refund will be provided.', font: 'Calibri', size: 22, color: TEXT }),
        ]),

        heading2('4. Disclaimer'),
        body([
          new TextRun({ text: '4.1 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The Company makes no warranty as to the suitability of any Candidate. The Company will use reasonable endeavours to determine the suitability of the Candidate, including making reasonable efforts to attempt to verify that the Candidate is appropriate for the Client’s position.', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        body([
          new TextRun({ text: '4.2 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'If the Company has agreed to engage a third-party service on behalf of the Client to undertake verification, investigations, searches or checks in relation to a Candidate, the Company makes no warranty as to the accuracy or reliability of any information provided to the Client or to the Company by that third party.', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        body([
          new TextRun({ text: '4.3 ', font: 'Calibri', size: 22, bold: true, color: INK }),
          new TextRun({ text: 'The Client is responsible for:', font: 'Calibri', size: 22, color: TEXT }),
        ]),
        bullet('(a) satisfying itself as to the suitability of any Candidate;'),
        bullet('(b) evaluating references and verifying that the Candidate has the experience;'),
        bullet('(c) training, qualifications and any authorisation which may be required by law or by any professional body; and'),
        bullet('(d) obtaining any required work permits and/or permissions to work as may be required, and arranging any medical examinations and/or investigations into the medical history of the Candidate required by law.'),

        heading2('5. Confidentiality'),
        body('Any information that the Company provides to the Client about a Candidate (“Confidential Information”) is confidential and may be subject to the provisions of the Privacy Act 1988 (Cth). Accordingly, the Client:'),
        bullet('(a) must not disclose the Confidential Information about a Candidate to third parties;'),
        bullet('(b) must deal with the Confidential Information provided to the Client about a Candidate in accordance with the Privacy Act 1988 (Cth);'),
        bullet('(c) must not contact the employer of any Candidate the Company introduces to the Client;'),
        bullet('(d) must use the Confidential Information held by the Client for the sole purpose of fulfilling their obligations under this agreement;'),
        bullet('(e) must take all reasonable steps to ensure that the Confidential Information held by the Client is protected from misuse, loss, unauthorised access, unauthorised modification or unauthorised disclosure;'),
        bullet('(f) must notify the Company immediately in writing upon becoming aware of any breach of this clause 5, giving details of such breach;'),
        bullet('(g) must not conduct any reference checks on the Candidate without authority from the Company and the Candidate; and'),
        bullet('(h) agrees to indemnify the Company against any liability, costs, damages or losses incurred as a result of a breach of this provision.'),

        heading2('6. Termination'),
        body('This agreement cannot be terminated unless agreed in writing by both parties.'),

        heading2('7. Governing Law and Jurisdiction'),
        body('These terms and conditions are governed by, and are to be construed in accordance with, the laws of the State of Queensland and the Commonwealth of Australia. Each party submits to the non-exclusive jurisdiction of the Courts and Tribunals of Queensland and any court of competent jurisdiction elsewhere in Australia.'),

        heading2('8. Assignment'),
        body('The Company can assign all or any of the Company’s rights and obligations under this agreement to any person without the Client’s consent, and the Client acknowledges and agrees to each such assignment. The Client cannot, and must not, assign any of the Client’s rights and obligations under this agreement to any person without the Company’s prior written consent.'),

        heading2('9. Invalidity'),
        body('Even if part of this agreement is for any reason invalid or unenforceable, the remaining portion remains in full effect as if each party had signed it without the invalid portion.'),

        heading2('10. Entire Agreement'),
        body('This agreement constitutes the entire agreement between the parties with respect to the subject matter of this agreement.'),

        heading2('11. Notices'),
        body('Any notice or other communication required under this agreement:'),
        bullet('(a) must be in legible writing and in English, and addressed to the party concerned or to that party’s address; and'),
        bullet('(b) may be delivered to a party by being left at, or posted by security post or sent by electronic mail to that party’s address.'),

        heading2('12. Agreement to Terms of Business'),
        body('The Client understands and agrees to the rates, terms and conditions stated herein.'),

        emptyLine(8),

        signatureTable(),
      ]
    }
  ]
});

Packer.toBuffer(doc).then((buf) => {
  const outPath = path.join(__dirname, 'Aurora-Dairies-Recruitment-Proposal.docx');
  fs.writeFileSync(outPath, buf);
  console.log(`docx written: ${outPath} (${buf.length} bytes)`);
});
