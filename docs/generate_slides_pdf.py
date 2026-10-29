import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# Color Palette
BG_COLOR = colors.HexColor("#0B0F19")
CARD_BG = colors.HexColor("#111827")
CARD_BORDER = colors.HexColor("#1E293B")
HEADER_BORDER = colors.HexColor("#334155")
TEXT_WHITE = colors.HexColor("#FFFFFF")
TEXT_MUTED = colors.HexColor("#94A3B8")
TEXT_BODY = colors.HexColor("#E2E8F0")

COLOR_INDIGO = colors.HexColor("#6366F1")
COLOR_CYAN = colors.HexColor("#06B6D4")
COLOR_EMERALD = colors.HexColor("#10B981")
COLOR_AMBER = colors.HexColor("#F59E0B")
COLOR_ROSE = colors.HexColor("#EF4444")
COLOR_VIOLET = colors.HexColor("#8B5CF6")

def draw_slide_decorations(canvas, doc):
    canvas.saveState()
    # Draw Background
    canvas.setFillColor(BG_COLOR)
    canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], fill=True, stroke=False)

    # Top Accent Glow Line
    canvas.setStrokeColor(COLOR_INDIGO)
    canvas.setLineWidth(2.5)
    canvas.line(0.5 * inch, doc.pagesize[1] - 0.4 * inch, doc.pagesize[0] - 0.5 * inch, doc.pagesize[1] - 0.4 * inch)

    # Header Divider Line
    canvas.setStrokeColor(HEADER_BORDER)
    canvas.setLineWidth(0.8)
    canvas.line(0.5 * inch, doc.pagesize[1] - 1.45 * inch, doc.pagesize[0] - 0.5 * inch, doc.pagesize[1] - 1.45 * inch)

    # Footer Divider Line
    canvas.setStrokeColor(HEADER_BORDER)
    canvas.setLineWidth(0.8)
    canvas.line(0.5 * inch, 0.55 * inch, doc.pagesize[0] - 0.5 * inch, 0.55 * inch)

    # Footer Text
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(0.5 * inch, 0.38 * inch, "LAUNCHLOOP AI • NXTWAVE GROWTH CHALLENGE")
    canvas.drawString(4.5 * inch, 0.38 * inch, "GOAL: 500 REGISTRATIONS / 7 DAYS / ₹2,000 BUDGET")
    
    page_num = canvas.getPageNumber()
    canvas.drawRightString(doc.pagesize[0] - 0.5 * inch, 0.38 * inch, f"SLIDE {page_num:02d} OF 05")
    canvas.restoreState()

def build_pdf(filename="docs/NxtWave_LaunchLoop_Growth_Plan_5_Slides.pdf"):
    # 11 x 6.5 inches for widescreen presentation
    PAGE_WIDTH = 11 * inch
    PAGE_HEIGHT = 6.6 * inch
    doc = SimpleDocTemplate(
        filename,
        pagesize=(PAGE_WIDTH, PAGE_HEIGHT),
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.65 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    tag_style = ParagraphStyle(
        "TagStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=COLOR_INDIGO,
        textTransform="uppercase",
        spaceAfter=2,
    )

    title_style = ParagraphStyle(
        "SlideTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=TEXT_WHITE,
    )

    subtitle_style = ParagraphStyle(
        "SlideSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=12,
        textColor=TEXT_MUTED,
        spaceAfter=12,
    )

    h3_style = ParagraphStyle(
        "H3Style",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=TEXT_WHITE,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=TEXT_BODY,
    )

    bold_white = ParagraphStyle(
        "BoldWhite",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=TEXT_WHITE,
    )

    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=TEXT_MUTED,
        textTransform="uppercase",
    )

    code_style = ParagraphStyle(
        "CodeText",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        textColor=COLOR_CYAN,
    )

    story = []

    # =========================================================================
    # SLIDE 1: Target Students, Pain Points & Value Proposition
    # =========================================================================
    story.append(Paragraph("SLIDE 01 OF 05 • TARGET AUDIENCE & PROPOSITION", tag_style))
    story.append(Paragraph("Target Students, Student Pain Points & Workshop Proposition", title_style))
    story.append(Paragraph("Why final-year engineering students will act now on a 60-minute practical AI workshop", subtitle_style))

    # Audience Banner Table
    aud_content = [
        [
            Paragraph("<b>TARGET COHORT:</b> Final-Year & Pre-Final Year B.Tech/BE Students (2025/2026 Batches)", bold_white),
            Paragraph("<b>BRANCHES:</b> CSE, IT, AI/DS, ECE • Tier-2 & Tier-3 Colleges", bold_white),
        ],
        [
            Paragraph("Students actively facing campus placement season, technical screening rounds, and final-year project requirements.", body_style),
            Paragraph("High urgency for defensible, resume-ready project experience without complex setup friction.", body_style),
        ]
    ]
    t_aud = Table(aud_content, colWidths=[5.5 * inch, 4.5 * inch])
    t_aud.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#161F33")),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_INDIGO),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_aud)
    story.append(Spacer(1, 8))

    # 3 Pain Points Table
    p1 = [
        Paragraph("<b>01. Resume Inadequacy</b>", ParagraphStyle('P1', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_ROSE, leading=11)),
        Paragraph("Generic tutorial projects (calculators, to-dos) get filtered out by recruiters. Students need modern AI keywords (APIs, semantic search, latency optimization) on resumes.", body_style)
    ]
    p2 = [
        Paragraph("<b>02. Cloud Cost & Setup Dread</b>", ParagraphStyle('P2', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_AMBER, leading=11)),
        Paragraph("Fear of incurring unexpected credit card charges on paid LLM APIs or breaking Python/Docker environments. Students require a guaranteed 100% free build.", body_style)
    ]
    p3 = [
        Paragraph("<b>03. Course Fatigue & Time Limits</b>", ParagraphStyle('P3', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_CYAN, leading=11)),
        Paragraph("40-hour video courses suffer &lt; 5% completion rates during busy placement semesters. A 60-minute sprint provides immediate working closure with zero schedule friction.", body_style)
    ]

    t_pains = Table([[p1, p2, p3]], colWidths=[3.25 * inch, 3.25 * inch, 3.5 * inch])
    t_pains.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_pains)
    story.append(Spacer(1, 8))

    # Workshop Proposition Callout
    prop_content = [
        [
            Paragraph("<b>VALUE PROPOSITION: “Build Your First AI Project in 60 Minutes”</b>", ParagraphStyle('PropH', fontName='Helvetica-Bold', fontSize=10, textColor=TEXT_WHITE, leading=13)),
            Paragraph("<b>100% FREE • 60 MINS</b>", ParagraphStyle('PropB', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_EMERALD, leading=11, alignment=2)),
        ],
        [
            Paragraph("Go from idea to a working AI-powered application in one live guided sprint. Understand the client-to-model software architecture, connect an interface, and build an asset you can test and defend in job interviews.", body_style),
            Paragraph("Zero Paid Cloud Requirements", ParagraphStyle('PropSub', fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED, leading=10, alignment=2)),
        ]
    ]
    t_prop = Table(prop_content, colWidths=[7.5 * inch, 2.5 * inch])
    t_prop.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#1A1B35")),
        ('BOX', (0, 0), (-1, -1), 1.5, COLOR_INDIGO),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_prop)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: Priority Channels & Registration Acquisition Model
    # =========================================================================
    story.append(Paragraph("SLIDE 02 OF 05 • REGISTRATION ACQUISITION MODEL", tag_style))
    story.append(Paragraph("Priority Channels & Acquisition Model (500 Goal on ₹2,000 Budget)", title_style))
    story.append(Paragraph("Capital-efficient multi-channel architecture turning student networks into a viral movement", subtitle_style))

    # 4 Quick Metric Badges
    stat_data = [
        [
            Paragraph("<b>500</b><br/><font size=7 color='#94A3B8'>REGISTRATIONS</font>", ParagraphStyle('S1', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_INDIGO, alignment=1, leading=16)),
            Paragraph("<b>₹2,000</b><br/><font size=7 color='#94A3B8'>TOTAL BUDGET CAP</font>", ParagraphStyle('S2', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_EMERALD, alignment=1, leading=16)),
            Paragraph("<b>₹4.00</b><br/><font size=7 color='#94A3B8'>TARGET BLENDED CAC</font>", ParagraphStyle('S3', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_CYAN, alignment=1, leading=16)),
            Paragraph("<b>7 DAYS</b><br/><font size=7 color='#94A3B8'>CAMPAIGN TIMELINE</font>", ParagraphStyle('S4', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_VIOLET, alignment=1, leading=16)),
        ]
    ]
    t_stat = Table(stat_data, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch, 2.5 * inch])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#070A12")),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_stat)
    story.append(Spacer(1, 10))

    # Channel Matrix Table
    ch_matrix = [
        [
            Paragraph("Priority Channel", table_header),
            Paragraph("Target", table_header),
            Paragraph("Share", table_header),
            Paragraph("Budget", table_header),
            Paragraph("CAC", table_header),
            Paragraph("Tactical Acquisition Strategy", table_header),
        ],
        [
            Paragraph("<b>Campus Clubs & Student Ambassadors</b>", bold_white),
            Paragraph("150", code_style),
            Paragraph("30%", body_style),
            Paragraph("₹500", body_style),
            Paragraph("₹3.33", code_style),
            Paragraph("Onboard 15 student leads across key engineering colleges with club noticeboard flyers & digital kits.", body_style),
        ],
        [
            Paragraph("<b>WhatsApp Student Communities</b>", bold_white),
            Paragraph("140", code_style),
            Paragraph("28%", body_style),
            Paragraph("₹300", body_style),
            Paragraph("₹2.14", code_style),
            Paragraph("Value-first micro-carousels in 35+ departmental class, lab, and placement announcement groups.", body_style),
        ],
        [
            Paragraph("<b>College Email & Placement Bulletins</b>", bold_white),
            Paragraph("70", code_style),
            Paragraph("14%", body_style),
            Paragraph("₹0", body_style),
            Paragraph("₹0.00", code_style),
            Paragraph("Placement cell student rep forwarding; inclusion in official weekly department bulletins.", body_style),
        ],
        [
            Paragraph("<b>LinkedIn & Instagram Organic</b>", bold_white),
            Paragraph("60", code_style),
            Paragraph("12%", body_style),
            Paragraph("₹0", body_style),
            Paragraph("₹0.00", code_style),
            Paragraph("Student project breakdown clips: 'Why building a 60-min AI project beats 20-hr video courses.'", body_style),
        ],
        [
            Paragraph("<b>Referral-Led Acquisition</b> <i>(Overlay)</i>", ParagraphStyle('RefH', fontName='Helvetica-Bold', fontSize=8.5, textColor=COLOR_VIOLET)),
            Paragraph("80", code_style),
            Paragraph("16%", body_style),
            Paragraph("₹0", body_style),
            Paragraph("₹0.00", code_style),
            Paragraph("Post-registration peer viral loop (Target K &ge; 0.35) with collision-resistant links & leaderboard.", body_style),
        ],
        [
            Paragraph("<b>CAMPAIGN TOTAL / BLENDED</b>", ParagraphStyle('TotH', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_EMERALD)),
            Paragraph("<b>500</b>", ParagraphStyle('TotC', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_EMERALD)),
            Paragraph("<b>100%</b>", bold_white),
            Paragraph("<b>₹2,000</b>", ParagraphStyle('TotB', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_EMERALD)),
            Paragraph("<b>₹4.00</b>", ParagraphStyle('TotA', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_EMERALD)),
            Paragraph("Includes ₹800 high-intent search experiment & ₹400 contingency buffer.", body_style),
        ]
    ]

    t_ch = Table(ch_matrix, colWidths=[2.5 * inch, 0.7 * inch, 0.7 * inch, 0.8 * inch, 0.7 * inch, 4.6 * inch])
    t_ch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#070A12")),
        ('BACKGROUND', (0, 1), (-1, -2), CARD_BG),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#161F33")),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('GRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_ch)
    story.append(Spacer(1, 6))

    note_text = "<font color='#A5B4FC'><b>Double-Counting Governance:</b></font> Referral acquisition is an attribution overlay. Reaching students via WhatsApp and ambassadors feeds the viral loop, generating 80 verified peer registrations at ₹0 incremental cost."
    story.append(Paragraph(note_text, ParagraphStyle('Note', fontName='Helvetica-Oblique', fontSize=7.5, textColor=TEXT_MUTED, leading=10)))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: Seven-Day Execution Plan & Daily Milestones
    # =========================================================================
    story.append(Paragraph("SLIDE 03 OF 05 • SEVEN-DAY EXECUTION ROADMAP", tag_style))
    story.append(Paragraph("Seven-Day Execution Plan & Daily Targets (30 → 100 / Day)", title_style))
    story.append(Paragraph("Disciplined daily acquisition milestones paired with automated decision triggers", subtitle_style))

    # Days 1-4 Row
    d1 = [Paragraph("<b>DAY 01 • TARGET: 30</b> (Cum: 30)", ParagraphStyle('D1H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_INDIGO)),
          Paragraph("<b>Ambassador Program Launch</b><br/>Brief 15 core student campus leads with tracking copy kits; place posters on club noticeboards across 5 pilot engineering colleges.", body_style)]
    d2 = [Paragraph("<b>DAY 02 • TARGET: 50</b> (Cum: 80)", ParagraphStyle('D2H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_INDIGO)),
          Paragraph("<b>WhatsApp Class Hub Broadcast</b><br/>Distribute micro-carousels in 35+ departmental class and lab WhatsApp groups focusing on resume AI project benefits.", body_style)]
    d3 = [Paragraph("<b>DAY 03 • TARGET: 65</b> (Cum: 145)", ParagraphStyle('D3H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_INDIGO)),
          Paragraph("<b>Placement Bulletin Outreach</b><br/>Placement cell student rep email blasts; release the first public referral leaderboard update recognizing top student referrers.", body_style)]
    d4 = [Paragraph("<b>DAY 04 • TARGET: 75</b> (Cum: 220)", ParagraphStyle('D4H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_AMBER)),
          Paragraph("<b>Mid-Point Pacing Audit</b><br/>Publish LinkedIn project teasers. Trigger 70% pacing check: if cumulative registrations &lt; 154, shift 100% focus to top 2 channels.", body_style)]

    t_d1_4 = Table([[d1, d2, d3, d4]], colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch, 2.5 * inch])
    t_d1_4.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_d1_4)
    story.append(Spacer(1, 8))

    # Days 5-7 Row
    d5 = [Paragraph("<b>DAY 05 • TARGET: 85</b> (Cum: 305)", ParagraphStyle('D5H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_CYAN)),
          Paragraph("<b>Tactical Search Experiment</b><br/>Deploy optional ₹400-₹800 experiment targeting students seeking capstone projects; activate peer invites: 'Bring your project partner.'", body_style)]
    d6 = [Paragraph("<b>DAY 06 • TARGET: 95</b> (Cum: 400)", ParagraphStyle('D6H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_CYAN)),
          Paragraph("<b>Peer Referral Flywheel Surge</b><br/>Trigger in-app WhatsApp nudges: invite 2 peers to unlock Project Starter Kit. Spotlight top 3 ambassadors on the public leaderboard.", body_style)]
    d7 = [Paragraph("<b>DAY 07 • TARGET: 100</b> (Cum: 500)", ParagraphStyle('D7H', fontName='Helvetica-Bold', fontSize=8, textColor=COLOR_EMERALD)),
          Paragraph("<b>Final 24-Hour Registration Closeout</b><br/>Last-chance broadcast across all community hubs. Freeze registration pipelines, lock verified records, and deliver workshop credentials.", body_style)]

    t_d5_7 = Table([[d5, d6, d7]], colWidths=[3.33 * inch, 3.33 * inch, 3.34 * inch])
    t_d5_7.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_d5_7)
    story.append(Spacer(1, 10))

    # Decision Rule Box
    pacing_rule = [
        [
            Paragraph("<b>AUTOMATED 70% PACING DECISION RULE:</b>", ParagraphStyle('PRuleH', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_AMBER, leading=11)),
        ],
        [
            Paragraph("If cumulative registrations drop below 70% of target by Day 4 (&lt; 154 registrations), immediately freeze broad promotional spend, concentrate 100% effort on the top 2 highest-converting campus channels, and onboard 5 additional student ambassadors before drawing from contingency funds.", body_style)
        ]
    ]
    t_prule = Table(pacing_rule, colWidths=[10 * inch])
    t_prule.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#221D12")),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_AMBER),
        ('PADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(t_prule)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: ₹2,000 Budget Allocation, Telemetry & Decision Rules
    # =========================================================================
    story.append(Paragraph("SLIDE 04 OF 05 • BUDGET GOVERNANCE & TELEMETRY", tag_style))
    story.append(Paragraph("₹2,000 Budget Allocation, Governance & Decision Rules", title_style))
    story.append(Paragraph("Disciplined capital efficiency with automated, explainable growth intelligence", subtitle_style))

    # 4 Budget Categories
    b1 = [Paragraph("<b>Campus Ambassadors</b>", ParagraphStyle('B1H', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_INDIGO)),
          Paragraph("<b>₹500 (25%)</b>", ParagraphStyle('B1A', fontName='Helvetica-Bold', fontSize=14, textColor=TEXT_WHITE, leading=18)),
          Paragraph("Physical club flyers, noticeboard prints, and lead recognition rewards.", body_style)]
    b2 = [Paragraph("<b>Student Creatives</b>", ParagraphStyle('B2H', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_CYAN)),
          Paragraph("<b>₹300 (15%)</b>", ParagraphStyle('B2A', fontName='Helvetica-Bold', fontSize=14, textColor=TEXT_WHITE, leading=18)),
          Paragraph("WhatsApp carousel micro-kits, Figma visual templates, and class banners.", body_style)]
    b3 = [Paragraph("<b>Optional Experiment</b>", ParagraphStyle('B3H', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_AMBER)),
          Paragraph("<b>₹800 (40%)</b>", ParagraphStyle('B3A', fontName='Helvetica-Bold', fontSize=14, textColor=TEXT_WHITE, leading=18)),
          Paragraph("Targeted high-intent search experiment for capstone keywords (capped at ₹200/day).", body_style)]
    b4 = [Paragraph("<b>Contingency Reserve</b>", ParagraphStyle('B4H', fontName='Helvetica-Bold', fontSize=9, textColor=COLOR_EMERALD)),
          Paragraph("<b>₹400 (20%)</b>", ParagraphStyle('B4A', fontName='Helvetica-Bold', fontSize=14, textColor=TEXT_WHITE, leading=18)),
          Paragraph("Capital buffer for mid-campaign optimization or unexpected outreach needs.", body_style)]

    t_budget = Table([[b1, b2, b3, b4]], colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch, 2.5 * inch])
    t_budget.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_budget)
    story.append(Spacer(1, 10))

    # Rules & Telemetry Comparison
    gov_content = [
        [
            Paragraph("<b>GOVERNING FINANCIAL RULES</b>", ParagraphStyle('GovH', fontName='Helvetica-Bold', fontSize=9.5, textColor=COLOR_AMBER)),
            Paragraph("<b>EXPLAINABLE GROWTH INTELLIGENCE</b>", ParagraphStyle('GovH2', fontName='Helvetica-Bold', fontSize=9.5, textColor=COLOR_CYAN)),
        ],
        [
            Paragraph("<b>• Database-Level Cap Lock:</b> Enforced ₹2,000 ceiling. System rejects over-budget expenses unless explicitly confirmed.<br/><br/>"
                      "<b>• Organic Independence:</b> The campaign reaches 450+ registrations purely through campus clubs, WhatsApp, and referrals even if the ₹800 paid experiment produces zero results.<br/><br/>"
                      "<b>• Conversion Anomaly Rule:</b> If a channel logs &ge; 20 visits but &lt; 7.5% conversion, simplify form friction and align copy immediately.", body_style),
            Paragraph("<b>• Deterministic Heuristics:</b> Evaluates conversion funnels, viral coefficients (K), and campus clusters without paid third-party AI APIs.<br/><br/>"
                      "<b>• 'Explain This' Transparency:</b> Every recommendation in the admin dashboard details the mathematical evidence, sample size confidence, and risk of inaction.<br/><br/>"
                      "<b>• Zero Cloud Billing:</b> Runs 100% locally with zero cloud API keys, zero hallucinations, and zero unpredictable billing surprises.", body_style),
        ]
    ]

    t_gov = Table(gov_content, colWidths=[5 * inch, 5 * inch])
    t_gov.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0D1322")),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('GRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_gov)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: Working Software Asset, Assumptions & Risk Mitigation
    # =========================================================================
    story.append(Paragraph("SLIDE 05 OF 05 • TECHNICAL ASSET & RISK MATRIX", tag_style))
    story.append(Paragraph("Working Software Asset, Assumptions & Risk Mitigation", title_style))
    story.append(Paragraph("Complete integrated software platform turning one registration into a campus-wide movement", subtitle_style))

    asset_col = [
        Paragraph("<b>LAUNCHLOOP AI PLATFORM CAPABILITIES</b>", ParagraphStyle('AsH', fontName='Helvetica-Bold', fontSize=9.5, textColor=COLOR_INDIGO)),
        Spacer(1, 4),
        Paragraph("<b>1. Custom Local NoSQL Database:</b> 8 structured JSON document collections in <code>data/</code> with atomic writes, serialized mutex queues, and automatic corruption recovery.<br/><br/>"
                  "<b>2. Collision-Resistant Referral Engine:</b> Generates unambiguous <code>LL-XXXXX</code> codes, rejects self-referrals, enforces one-referrer rules, and updates privacy-masked leaderboards.<br/><br/>"
                  "<b>3. Telemetry & UTM Link Generator:</b> Tracked campaign links measuring click-to-registration conversion rates without external analytics trackers.<br/><br/>"
                  "<b>4. Executive Command Center:</b> 8 KPI cards, Recharts acquisition curves, CAC calculations, and spreadsheet formula injection-proof CSV exports.", body_style),
    ]

    risk_col = [
        Paragraph("<b>ASSUMPTIONS & RISK MITIGATION MATRIX</b>", ParagraphStyle('RkH', fontName='Helvetica-Bold', fontSize=9.5, textColor=COLOR_CYAN)),
        Spacer(1, 4),
        Paragraph("<b>• Key Assumptions:</b> Core ambassadors recruit 10–15 peers across their respective class sections. Free 60-min project framing converts at 10–12% of visits.<br/><br/>"
                  "<b>• Risk: WhatsApp Spam Fatigue:</b><br/>"
                  "<font color='#34D399'><i>Mitigation:</i></font> Hard cap of 2 high-value messages per group with actionable AI architecture snippets rather than generic links.<br/><br/>"
                  "<b>• Risk: Form Abandonment:</b><br/>"
                  "<font color='#34D399'><i>Mitigation:</i></font> Minimal fields; phone number is strictly optional with explicit consent; instant client validation.<br/><br/>"
                  "<b>• Risk: Referral Gaming:</b><br/>"
                  "<font color='#34D399'><i>Mitigation:</i></font> Server-side email normalization, duplicate detection, and anti-self-referral validation.", body_style),
    ]

    t_asset_risk = Table([[asset_col, risk_col]], colWidths=[5 * inch, 5 * inch])
    t_asset_risk.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, CARD_BORDER),
        ('GRID', (0, 0), (-1, -1), 0.5, CARD_BORDER),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_asset_risk)
    story.append(Spacer(1, 10))

    # Verification Badge Footer Banner
    verif_banner = [
        [
            Paragraph("<b>17/17 AUTOMATED VERIFICATION TESTS PASSED</b>", ParagraphStyle('VB1', fontName='Helvetica-Bold', fontSize=9.5, textColor=COLOR_EMERALD)),
            Paragraph("<b>100% LOCAL EXECUTION • ZERO PAID APIS</b>", ParagraphStyle('VB2', fontName='Helvetica-Bold', fontSize=8.5, textColor=COLOR_CYAN, alignment=2)),
        ],
        [
            Paragraph("Registration uniqueness, referral attribution, budget cap warnings, auth protection, NoSQL crash recovery, and CSV formula sanitization tested and verified.", body_style),
            Paragraph("Node.js • Express • React • TypeScript", ParagraphStyle('VB4', fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED, alignment=2)),
        ]
    ]
    t_verif = Table(verif_banner, colWidths=[7.5 * inch, 2.5 * inch])
    t_verif.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0D1A1F")),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_EMERALD),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_verif)

    # Build Document
    doc.build(story, onFirstPage=draw_slide_decorations, onLaterPages=draw_slide_decorations)
    print(f"Successfully generated presentation PDF: {filename}")

if __name__ == "__main__":
    build_pdf()
