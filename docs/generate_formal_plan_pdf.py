import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ---------------------------------------------------------------------------
# Font Registration (Arial TTF for crisp typography and Indian Rupee ₹)
# ---------------------------------------------------------------------------
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"
FONT_BOLDITALIC = "Helvetica-Bold"

win_fonts = "C:/Windows/Fonts"
if os.path.exists(win_fonts):
    try:
        arial_path = os.path.join(win_fonts, "arial.ttf")
        arialbd_path = os.path.join(win_fonts, "arialbd.ttf")
        ariali_path = os.path.join(win_fonts, "ariali.ttf")
        arialbi_path = os.path.join(win_fonts, "arialbi.ttf")

        if os.path.exists(arial_path) and os.path.exists(arialbd_path):
            pdfmetrics.registerFont(TTFont("CustomArial", arial_path))
            pdfmetrics.registerFont(TTFont("CustomArial-Bold", arialbd_path))
            pdfmetrics.registerFont(TTFont("CustomArial-Italic", ariali_path if os.path.exists(ariali_path) else arial_path))
            pdfmetrics.registerFont(TTFont("CustomArial-BoldItalic", arialbi_path if os.path.exists(arialbi_path) else arialbd_path))
            
            FONT_REGULAR = "CustomArial"
            FONT_BOLD = "CustomArial-Bold"
            FONT_ITALIC = "CustomArial-Italic"
            FONT_BOLDITALIC = "CustomArial-BoldItalic"
    except Exception as e:
        print("Note: Falling back to standard Helvetica font:", e)


# ---------------------------------------------------------------------------
# Custom Canvas for Two-Pass Header & Footer (Page X of 5)
# ---------------------------------------------------------------------------
class FormalPlanCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, total_pages):
        self.saveState()
        w, h = self._pagesize
        left_margin = 54
        right_margin = w - 54

        # Top Header Text
        self.setFont(FONT_BOLD, 9)
        self.setFillColor(colors.HexColor("#000000"))
        self.drawString(left_margin, h - 36, "GROWTH PLAN: BUILD YOUR FIRST AI PROJECT IN 60 MINUTES")

        self.setFont(FONT_REGULAR, 9)
        self.drawRightString(right_margin, h - 36, "NxtWave Growth Challenge")

        # Top Header Divider Line
        self.setStrokeColor(colors.HexColor("#000000"))
        self.setLineWidth(0.75)
        self.line(left_margin, h - 43, right_margin, h - 43)

        # Footer Text
        self.setFont(FONT_REGULAR, 9)
        self.setFillColor(colors.HexColor("#374151"))
        self.drawString(left_margin, 38, "Vishnu Reddy")
        self.drawRightString(right_margin, 38, f"Page {self._pageNumber} of {total_pages}")

        self.restoreState()


def build_pdf(filename="docs/NxtWave_LaunchLoop_Growth_Plan_Formal.pdf"):
    # Letter: 612 x 792 pt
    # Margins: Left=54 pt, Right=54 pt -> Printable width = 504 pt
    # Top=58 pt, Bottom=54 pt -> Printable height = 680 pt
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=56,
        bottomMargin=52,
    )

    styles = getSampleStyleSheet()

    # Exact Reference Typography
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#000000"),
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=9,
    )

    h1_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=15.5,
        leading=19,
        textColor=colors.HexColor("#000000"),
        spaceBefore=10,
        spaceAfter=6,
    )

    h2_style = ParagraphStyle(
        "SubSectionHeading",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#000000"),
        spaceBefore=8,
        spaceAfter=3,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=9,
        leading=12.2,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=5,
    )

    bullet_style = ParagraphStyle(
        "BulletCustom",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=9,
        leading=12.2,
        textColor=colors.HexColor("#1F2937"),
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=3.5,
    )

    note_style = ParagraphStyle(
        "NoteText",
        parent=styles["Normal"],
        fontName=FONT_ITALIC,
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#4B5563"),
        spaceBefore=7,
        spaceAfter=4,
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=9,
        leading=11.5,
        textColor=colors.HexColor("#000000"),
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName=FONT_REGULAR,
        fontSize=8.5,
        leading=11.2,
        textColor=colors.HexColor("#111827"),
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName=FONT_BOLD,
        fontSize=8.5,
        leading=11.2,
        textColor=colors.HexColor("#000000"),
    )

    story = []

    # =========================================================================
    # PAGE 1: 1. Understand the Student
    # =========================================================================
    story.append(Paragraph("Growth Plan: 500 Final-Year<br/>Registrations in 7 Days", title_style))
    story.append(Paragraph("Workshop: Build Your First AI Project in 60 Minutes", subtitle_style))

    # Meta Table (504 pt total)
    col_w = [115, 95, 104, 190]
    meta_data = [
        [
            Paragraph("Target", table_header_style),
            Paragraph("Budget", table_header_style),
            Paragraph("Duration", table_header_style),
            Paragraph("Candidate", table_header_style),
        ],
        [
            Paragraph("500 registrations", table_cell_style),
            Paragraph("₹2,000", table_cell_style),
            Paragraph("7 days", table_cell_style),
            Paragraph("Vishnu Reddy", table_cell_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=col_w)
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#FFFFFF")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 4))

    asset_line = Paragraph(
        "Working asset: LaunchLoop live prototype, <i>vishnu-nxtwave.vercel.app</i> | Code: <i>github.com/Vishnureddy0917/Vishnu_nxtwave</i>",
        ParagraphStyle("AssetLine", parent=body_style, fontSize=8, leading=10.5, textColor=colors.HexColor("#374151")),
    )
    story.append(asset_line)
    story.append(Spacer(1, 4))

    # Section 1
    story.append(Paragraph("1. Understand the Student", h1_style))

    story.append(Paragraph("Who we are targeting", h2_style))
    story.append(Paragraph(
        "• <b>Core persona:</b> final-year B.Tech / B.E. students (2027 batch) at Tier-2 and Tier-3 engineering colleges, for example SRM AP, VIT-AP, KL University, Vignan and JNTU-affiliated colleges.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Branch mix:</b> about 60% CSE / IT / Data Science (primary audience) and 40% ECE / EEE / Mechanical / Civil, the under-served group where growth can come from.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Mindset:</b> anxious about placements and aware that recruiters skip generic academic projects such as weather apps or library systems. They know AI matters but feel put off by heavy theory and math.",
        bullet_style,
    ))

    story.append(Paragraph("Why they would care", h2_style))
    story.append(Paragraph(
        "• <b>Instant outcome:</b> build and deploy a working AI project to GitHub in 60 minutes, with no theory.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Placement value:</b> a concrete, current project to put on the resume before campus drives.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Low barrier:</b> free, beginner-friendly, no prior ML experience needed.",
        bullet_style,
    ))

    story.append(Paragraph("What makes them register", h2_style))
    story.append(Paragraph(
        "• <b>Proof of output:</b> seeing the finished project first (for example, an AI Resume Screener).",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Peer influence:</b> seeing batchmates from their own section and branch sign up.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>College rivalry:</b> a live leaderboard that pits their college against rivals.",
        bullet_style,
    ))

    # End of Page 1
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: 2. Strategy and Prioritised Channels
    # =========================================================================
    story.append(Paragraph("2. Strategy and Prioritised Channels", h1_style))

    constraint_text = Paragraph(
        "<b>Constraint.</b> ₹2,000 cannot buy 500 registrations through ads. At an assumed ₹35–₹50 per click on Meta or Google, the budget yields roughly 40–55 clicks and perhaps 15–20 registrations. <b>Strategy:</b> instead of buying traffic, turn each registered student into a distributor through peer referrals and campus champions.",
        body_style,
    )
    story.append(constraint_text)
    story.append(Spacer(1, 4))

    # Phases Table (504 pt)
    phase_widths = [110, 310, 84]
    phase_data = [
        [
            Paragraph("Phase", table_header_style),
            Paragraph("Mechanism", table_header_style),
            Paragraph("Projected<br/>registrations", table_header_style),
        ],
        [
            Paragraph("Days 1–2: Seed", table_cell_bold),
            Paragraph("10–12 class representatives and club leads post in batch groups across 5 colleges", table_cell_style),
            Paragraph("200", table_cell_style),
        ],
        [
            Paragraph("Days 3–5: Referral<br/>loop", table_cell_bold),
            Paragraph("LaunchLoop gives every registrant a code, a pre-written WhatsApp pitch and a leaderboard (assumed viral coefficient 1.15)", table_cell_style),
            Paragraph("230", table_cell_style),
        ],
        [
            Paragraph("Days 6–7: Campus<br/>battle and scarcity", table_cell_bold),
            Paragraph("Inter-college leaderboard plus a closing-seats push", table_cell_style),
            Paragraph("90", table_cell_style),
        ],
        [
            Paragraph("Total", table_cell_bold),
            Paragraph("", table_cell_style),
            Paragraph("520", table_cell_bold),
        ],
    ]
    phase_table = Table(phase_data, colWidths=phase_widths)
    phase_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F3F4F6")),
        ])
    )
    story.append(phase_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("Prioritised channels (two only)", h2_style))

    story.append(Paragraph("Channel 1: Class representatives and tech club leads (the seed)", ParagraphStyle("ChHeader", parent=h2_style, fontSize=10, spaceBefore=4, spaceAfter=2)))
    story.append(Paragraph(
        "• <b>Action:</b> direct outreach to 10–12 influential CRs and club leads across 5 colleges, giving each a ready-to-forward message and a branded poster.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Incentive:</b> a ₹200 Amazon voucher for each of the 4 best CRs who deliver 30+ verified sign-ups.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Why it works:</b> students read batch-group messages, and a recommendation from a trusted CR carries far more weight than an ad.",
        bullet_style,
    ))

    story.append(Paragraph("Channel 2: LaunchLoop referral loop (the multiplier)", ParagraphStyle("ChHeader2", parent=h2_style, fontSize=10, spaceBefore=4, spaceAfter=2)))
    story.append(Paragraph(
        "• <b>Action:</b> every registrant instantly gets a unique referral code and a personalised WhatsApp message generated by the asset.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Incentive:</b> the top 5 referrers each win a ₹200 mobile recharge (₹1,000 prize pool).",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Why it works:</b> game mechanics, a reward sized for a student budget, and one-tap sharing inside the app students already use.",
        bullet_style,
    ))

    story.append(Paragraph(
        "Note: the viral coefficient and seed sizes are planning assumptions. Days 1–2 results would be used to re-estimate them and adjust.",
        note_style,
    ))

    # End of Page 2
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: 3. 7-Day Sprint Calendar
    # =========================================================================
    story.append(Paragraph("3. 7-Day Sprint Calendar", h1_style))

    calendar_widths = [32, 90, 272, 45, 65]
    calendar_data = [
        [
            Paragraph("Day", table_header_style),
            Paragraph("Focus", table_header_style),
            Paragraph("Actions and milestones", table_header_style),
            Paragraph("New", table_header_style),
            Paragraph("Cumulative", table_header_style),
        ],
        [
            Paragraph("1", table_cell_bold),
            Paragraph("Seed launch", table_cell_bold),
            Paragraph("Onboard 10 CRs / club leads across 5 colleges; send seed links to official batch groups.", table_cell_style),
            Paragraph("75", table_cell_style),
            Paragraph("75", table_cell_bold),
        ],
        [
            Paragraph("2", table_cell_bold),
            Paragraph("Campus<br/>momentum", table_cell_bold),
            Paragraph("First 100 milestone (“Campus Buzz”). Post the first leaderboard snapshot in groups.", table_cell_style),
            Paragraph("125", table_cell_style),
            Paragraph("200", table_cell_bold),
        ],
        [
            Paragraph("3", table_cell_bold),
            Paragraph("Branch<br/>personalisation", table_cell_bold),
            Paragraph("Branch-specific project invites (Edge AI for ECE, predictive maintenance for Mechanical).", table_cell_style),
            Paragraph("85", table_cell_style),
            Paragraph("285", table_cell_bold),
        ],
        [
            Paragraph("4", table_cell_bold),
            Paragraph("Referral race", table_cell_bold),
            Paragraph("Announce top referrers; push 2nd and 3rd place users to rally friends for the ₹200 rewards.", table_cell_style),
            Paragraph("75", table_cell_style),
            Paragraph("360", table_cell_bold),
        ],
        [
            Paragraph("5", table_cell_bold),
            Paragraph("College battle", table_cell_bold),
            Paragraph("Highlight the inter-college gap, for example “VIT-AP is 15 seats behind SRM AP”.", table_cell_style),
            Paragraph("70", table_cell_style),
            Paragraph("430", table_cell_bold),
        ],
        [
            Paragraph("6", table_cell_bold),
            Paragraph("Scarcity push", table_cell_bold),
            Paragraph("“Only 50 seats left” message through groups and WhatsApp status.", table_cell_style),
            Paragraph("50", table_cell_style),
            Paragraph("480", table_cell_bold),
        ],
        [
            Paragraph("7", table_cell_bold),
            Paragraph("Final sprint", table_cell_bold),
            Paragraph("Last seats fill; announce the top 5 winners and send the workshop link.", table_cell_style),
            Paragraph("40", table_cell_style),
            Paragraph("520", table_cell_bold),
        ],
    ]
    calendar_table = Table(calendar_data, colWidths=calendar_widths)
    calendar_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
            ("TOPPADDING", (0, 0), (-1, -1), 3.2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.2),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(calendar_table)
    story.append(Spacer(1, 7))

    story.append(Paragraph("Daily rhythm", h2_style))
    story.append(Paragraph(
        "• <b>Morning:</b> check the leaderboard and registration count; pick that day’s shout-out.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Midday:</b> send the day’s message to ambassadors for forwarding.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Evening:</b> publish a leaderboard snapshot and thank the day’s top referrers.",
        bullet_style,
    ))

    # End of Page 3
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: 4. Funnel Math and Budget
    # =========================================================================
    story.append(Paragraph("4. Funnel Math and Budget", h1_style))

    story.append(Paragraph("Registration model", h2_style))
    story.append(Paragraph("Total registrations = seed sign-ups + referral sign-ups + urgency surge", ParagraphStyle("ModelBold", parent=body_style, fontName=FONT_BOLD, spaceAfter=3.5)))
    story.append(Paragraph(
        "• <b>Seed (days 1–2):</b> 10 colleges × 1 active CR or club lead × 20 registrations per group = 200.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Referral loop (days 3–5):</b> 200 × 1.15 = 230.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Campus battle and urgency (days 6–7):</b> 90.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Projected total:</b> 520, which is 20 above the target as a safety margin.",
        bullet_style,
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("Budget (₹2,000)", h2_style))

    budget_widths = [130, 75, 299]
    budget_data = [
        [
            Paragraph("Item", table_header_style),
            Paragraph("Amount", table_header_style),
            Paragraph("Rationale", table_header_style),
        ],
        [
            Paragraph("Top 5 referrer rewards", table_cell_bold),
            Paragraph("₹1,000", table_cell_style),
            Paragraph("5 winners × ₹200 mobile recharge; fuels the referral loop.", table_cell_style),
        ],
        [
            Paragraph("Top 4 CR vouchers", table_cell_bold),
            Paragraph("₹800", table_cell_style),
            Paragraph("4 best CRs × ₹200 Amazon voucher for 30+ verified sign-ups.", table_cell_style),
        ],
        [
            Paragraph("Contingency", table_cell_bold),
            Paragraph("₹200", table_cell_style),
            Paragraph("Testing costs and tie-breaker reward.", table_cell_style),
        ],
        [
            Paragraph("Total", table_cell_bold),
            Paragraph("₹2,000", table_cell_bold),
            Paragraph("<b>Cost per registration: ₹3.85</b> (₹2,000 / 520)", table_cell_style),
        ],
    ]
    budget_table = Table(budget_data, colWidths=budget_widths)
    budget_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F3F4F6")),
        ])
    )
    story.append(budget_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Risks and mitigations", h2_style))
    story.append(Paragraph(
        "• <b>Referral rate lower than 1.15:</b> each 0.1 drop costs about 20 registrations; mitigated by recruiting more CRs on day 2 and extending the leaderboard push.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Fake or duplicate sign-ups:</b> the production design allows one registration per verified phone number, and rewards are paid only on verified entries.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>CR drop-off:</b> keep 2 reserve CRs per college and share daily recognition.",
        bullet_style,
    ))

    # End of Page 4
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: 5. The Working Asset: LaunchLoop
    # =========================================================================
    story.append(Paragraph("5. The Working Asset: LaunchLoop", h1_style))
    story.append(Paragraph(
        "LaunchLoop is a referral engine and leaderboard that turns every registration into a distribution channel.",
        body_style,
    ))
    story.append(Spacer(1, 2))

    link_widths = [110, 394]
    link_data = [
        [
            Paragraph("Link", table_header_style),
            Paragraph("URL", table_header_style),
        ],
        [
            Paragraph("Live demo", table_cell_bold),
            Paragraph("https://vishnu-nxtwave.vercel.app", table_cell_style),
        ],
        [
            Paragraph("Repository", table_cell_bold),
            Paragraph("https://github.com/Vishnureddy0917/Vishnu_nxtwave", table_cell_style),
        ],
    ]
    link_table = Table(link_data, colWidths=link_widths)
    link_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(link_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("What was built", h2_style))
    story.append(Paragraph(
        "• <b>Lead capture:</b> full name, 10-digit Indian mobile validation and branch.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Pitch matcher:</b> project suggestions and WhatsApp copy tailored to the student’s branch (CSE, ECE, Mechanical, Civil) in four tones: Placement, FOMO, Friendly and Zero-Code.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>One-tap sharing:</b> WhatsApp deep link with the referral code pre-filled, tracked through the URL hash.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Gamification:</b> live progress bar with milestones, top 5 referrers board and inter-college battle.",
        bullet_style,
    ))
    story.append(Paragraph(
        "• <b>Demo mode:</b> a button that simulates a referral so the counting logic can be tested in seconds.",
        bullet_style,
    ))

    story.append(Paragraph("Architecture", h2_style))

    arch_widths = [110, 160, 234]
    arch_data = [
        [
            Paragraph("Layer", table_header_style),
            Paragraph("Technology", table_header_style),
            Paragraph("Role", table_header_style),
        ],
        [
            Paragraph("Prototype", table_cell_bold),
            Paragraph("Single-file HTML and JavaScript, browser storage", table_cell_style),
            Paragraph("Demonstrates the full flow with no setup.", table_cell_style),
        ],
        [
            Paragraph("Frontend<br/>(production)", table_cell_bold),
            Paragraph("React.js on Vercel", table_cell_style),
            Paragraph("Registration, dashboard, leaderboards.", table_cell_style),
        ],
        [
            Paragraph("Backend<br/>(production)", table_cell_bold),
            Paragraph("Node.js and Express on Render", table_cell_style),
            Paragraph("Register, referral credit and leaderboard APIs.", table_cell_style),
        ],
        [
            Paragraph("Database<br/>(production)", table_cell_bold),
            Paragraph("NoSQL database", table_cell_style),
            Paragraph("Users with a unique index on phone and referral code.", table_cell_style),
        ],
    ]
    arch_table = Table(arch_data, colWidths=arch_widths)
    arch_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(arch_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph(
        "Note: the prototype stores data in the browser; the Express backend with a NoSQL database is the planned production path.",
        note_style,
    ))

    # Build PDF with FormalPlanCanvas
    doc.build(story, canvasmaker=FormalPlanCanvas)
    print(f"Generated formal PDF successfully: {filename}")

    # Copy to client/public
    public_dest = "client/public/NxtWave_LaunchLoop_Growth_Plan_Formal.pdf"
    os.makedirs(os.path.dirname(public_dest), exist_ok=True)
    shutil.copyfile(filename, public_dest)
    print(f"Copied to web public folder: {public_dest}")

    # Copy to artifacts directory
    artifact_dir = r"C:\Users\vishn\.gemini\antigravity-ide\brain\45a8caa1-eb2c-4344-80e1-edb3c90a1da5"
    if os.path.exists(artifact_dir):
        artifact_dest = os.path.join(artifact_dir, "NxtWave_LaunchLoop_Growth_Plan_Formal.pdf")
        shutil.copyfile(filename, artifact_dest)
        print(f"Copied to artifact dir: {artifact_dest}")


if __name__ == "__main__":
    import sys
    out_file = sys.argv[1] if len(sys.argv) > 1 else "docs/NxtWave_LaunchLoop_Growth_Plan_Formal.pdf"
    build_pdf(out_file)
