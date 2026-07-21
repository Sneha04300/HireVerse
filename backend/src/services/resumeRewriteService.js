const fs = require("fs");
const path = require("path");
const { buildResumeRewritePrompt } = require("../prompts/resumeRewritePrompt");
const { generateResponse } = require("./groqService");
const { extractText } = require("./resumeService");
const { Document, Packer, Paragraph, TextRun, Header, Footer,
        AlignmentType, BorderStyle, WidthType, PageNumber,
        Table, TableRow, TableCell } = require("docx");
const PDFDocument = require("pdfkit");

const GENERATED_DIR = path.join(__dirname, "../../generated-resumes");
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

function safeParseJSON(text) {
  let cleaned = text.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  return JSON.parse(cleaned);
}

async function rewriteResume(filePath, jobDescription = "") {
  const rawText = await extractText(filePath);
  if (!rawText || rawText.trim().length < 20) {
    throw new Error("Could not extract text from the resume file.");
  }

  const { system, user } = buildResumeRewritePrompt(rawText, jobDescription);
  const llmResponse = await generateResponse(system, user, {
    maxTokens: 3000,
    temperature: 0.3,
  });

  const data = safeParseJSON(llmResponse);

  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e6);
  const baseName = `rewrite-${timestamp}-${random}`;
  const docxPath = path.join(GENERATED_DIR, `${baseName}.docx`);
  const pdfPath = path.join(GENERATED_DIR, `${baseName}.pdf`);

  await generateDOCX(data, docxPath);
  await generatePDF(data, pdfPath);

  return {
    preview: data,
    docxUrl: `/generated-resumes/${baseName}.docx`,
    pdfUrl: `/generated-resumes/${baseName}.pdf`,
    fileName: `${baseName}.docx`,
  };
}

async function generateDOCX(data, outputPath) {
  const children = [];

  function pushHeading(text, level) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: level === 0 ? 40 : 120 },
        children: [
          new TextRun({
            text: text.toUpperCase(),
            bold: true,
            size: level === 0 ? 36 : 22,
            color: level === 0 ? "1a1a2e" : "7C3AED",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  function pushSectionTitle(text) {
    children.push(
      new Paragraph({
        spacing: { before: 240, after: 100 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "7C3AED" },
        },
        children: [
          new TextRun({
            text: text.toUpperCase(),
            bold: true,
            size: 22,
            color: "1a1a2e",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  function pushText(text, options = {}) {
    children.push(
      new Paragraph({
        spacing: { after: options.after ?? 80 },
        alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            size: options.size ?? 20,
            bold: options.bold ?? false,
            italics: options.italics ?? false,
            color: options.color ?? "333333",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  function pushBullet(text) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        indent: { left: 400, hanging: 200 },
        children: [
          new TextRun({
            text: "• ",
            size: 20,
            font: "Calibri",
            color: "555555",
          }),
          new TextRun({
            text,
            size: 20,
            font: "Calibri",
            color: "333333",
          }),
        ],
      })
    );
  }

  function pushExperience(item) {
    const line = [item.company, item.role, item.duration].filter(Boolean).join(" | ");
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({
            text: line,
            bold: true,
            size: 20,
            font: "Calibri",
            color: "1a1a2e",
          }),
        ],
      })
    );
    (item.descriptions || []).forEach((d) => pushBullet(d));
  }

  function pushProject(item) {
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 20 },
        children: [
          new TextRun({
            text: item.title,
            bold: true,
            size: 20,
            font: "Calibri",
            color: "1a1a2e",
          }),
        ],
      })
    );
    if (item.technologies && item.technologies.length > 0) {
      pushText(`Technologies: ${item.technologies.join(", ")}`, { size: 18, color: "666666" });
    }
    if (item.description) {
      pushText(item.description, { size: 20 });
    }
  }

  function pushEducation(item) {
    const parts = [item.institution, item.degree, item.year].filter(Boolean);
    const line = parts.join(" | ");
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 20 },
        children: [
          new TextRun({
            text: line,
            bold: true,
            size: 20,
            font: "Calibri",
            color: "1a1a2e",
          }),
        ],
      })
    );
    if (item.cgpa) {
      pushText(`CGPA: ${item.cgpa}`, { size: 18, color: "666666" });
    }
  }

  children.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [] }));

  pushHeading(data.name || "Resume", 0);

  const contactParts = [data.email, data.phone, data.linkedin, data.github].filter(Boolean);
  if (contactParts.length > 0) {
    pushText(contactParts.join("  |  "), { center: true, size: 18, color: "555555", after: 200 });
  }

  if (data.summary) {
    pushSectionTitle("Professional Summary");
    pushText(data.summary, { size: 20, after: 120 });
  }

  if (data.skills && Object.keys(data.skills).length > 0) {
    pushSectionTitle("Skills");
    for (const [category, skillList] of Object.entries(data.skills)) {
      if (skillList.length > 0) {
        pushText(`${category}: ${skillList.join(", ")}`, { size: 20, after: 40 });
      }
    }
  }

  if (data.experience && data.experience.length > 0) {
    pushSectionTitle("Experience");
    data.experience.forEach((exp) => pushExperience(exp));
  }

  if (data.projects && data.projects.length > 0) {
    pushSectionTitle("Projects");
    data.projects.forEach((proj) => pushProject(proj));
  }

  if (data.education && data.education.length > 0) {
    pushSectionTitle("Education");
    data.education.forEach((edu) => pushEducation(edu));
  }

  if (data.certifications && data.certifications.length > 0) {
    pushSectionTitle("Certifications");
    data.certifications.forEach((cert) => pushBullet(cert));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 900,
              right: 900,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: data.name || "Resume",
                    size: 16,
                    color: "999999",
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Generated by HireVerse AI",
                    size: 16,
                    color: "999999",
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

async function generatePDF(data, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: `${data.name || "Resume"} - HireVerse`,
        Author: "HireVerse AI",
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const purple = "#7C3AED";
    const dark = "#1a1a2e";
    const gray = "#555555";
    const lightGray = "#999999";
    const bodyColor = "#333333";

    let y = doc.y;

    function centerText(text, size, color, bold = false) {
      const width = doc.widthOfString(text);
      const x = (doc.page.width - doc.page.margins.left - doc.page.margins.right - width) / 2 + doc.page.margins.left;
      if (bold) doc.font("Helvetica-Bold"); else doc.font("Helvetica");
      doc.fontSize(size).fillColor(color).text(text, x, y);
      y = doc.y + 4;
    }

    function sectionTitle(text) {
      y += 8;
      doc.font("Helvetica-Bold").fontSize(12).fillColor(purple);
      doc.text(text.toUpperCase(), doc.page.margins.left, y, { underline: false });
      doc.moveTo(doc.page.margins.left, y + 14)
         .lineTo(doc.page.width - doc.page.margins.right, y + 14)
         .strokeColor(purple)
         .stroke();
      y += 22;
    }

    function bodyText(text, options = {}) {
      doc.font(options.bold ? "Helvetica-Bold" : "Helvetica")
         .fontSize(options.size || 10)
         .fillColor(options.color || bodyColor);
      const opts = { width: doc.page.width - doc.page.margins.left - doc.page.margins.right };
      if (options.align === "center") {
        opts.align = "center";
      }
      doc.text(text, doc.page.margins.left, y, opts);
      y = doc.y + (options.after || 4);
    }

    function bullet(text, indent = 20) {
      doc.font("Helvetica").fontSize(10).fillColor(bodyColor);
      doc.text(`  \u2022  ${text}`, doc.page.margins.left + indent, y, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right - indent,
        continued: false,
      });
      y = doc.y + 2;
    }

    function checkPage() {
      if (y > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        y = doc.page.margins.top;
      }
    }

    y = doc.page.margins.top + 10;

    centerText(data.name || "Resume", 22, dark, true);
    y += 2;
    const contactParts = [data.email, data.phone, data.linkedin, data.github].filter(Boolean);
    if (contactParts.length > 0) {
      centerText(contactParts.join("  |  "), 9, gray);
    }
    y += 10;

    if (data.summary) {
      checkPage();
      sectionTitle("Professional Summary");
      checkPage();
      bodyText(data.summary, { size: 10, color: bodyColor, after: 6 });
    }

    if (data.skills && Object.keys(data.skills).length > 0) {
      checkPage();
      sectionTitle("Skills");
      for (const [category, skillList] of Object.entries(data.skills)) {
        if (skillList.length > 0) {
          checkPage();
          bodyText(`${category}: ${skillList.join(", ")}`, { size: 10, color: bodyColor, after: 4 });
        }
      }
    }

    if (data.experience && data.experience.length > 0) {
      checkPage();
      sectionTitle("Experience");
      for (const exp of data.experience) {
        checkPage();
        const line = [exp.company, exp.role, exp.duration].filter(Boolean).join(" | ");
        bodyText(line, { bold: true, size: 10, color: dark, after: 2 });
        (exp.descriptions || []).forEach((d) => {
          checkPage();
          bullet(d);
        });
        y += 2;
      }
    }

    if (data.projects && data.projects.length > 0) {
      checkPage();
      sectionTitle("Projects");
      for (const proj of data.projects) {
        checkPage();
        bodyText(proj.title, { bold: true, size: 10, color: dark, after: 2 });
        if (proj.technologies && proj.technologies.length > 0) {
          bodyText(`Technologies: ${proj.technologies.join(", ")}`, { size: 9, color: lightGray, after: 2 });
        }
        if (proj.description) {
          bodyText(proj.description, { size: 10, color: bodyColor, after: 4 });
        }
      }
    }

    if (data.education && data.education.length > 0) {
      checkPage();
      sectionTitle("Education");
      for (const edu of data.education) {
        checkPage();
        const parts = [edu.institution, edu.degree, edu.year].filter(Boolean);
        bodyText(parts.join(" | "), { bold: true, size: 10, color: dark, after: 2 });
        if (edu.cgpa) {
          bodyText(`CGPA: ${edu.cgpa}`, { size: 9, color: lightGray, after: 4 });
        }
      }
    }

    if (data.certifications && data.certifications.length > 0) {
      checkPage();
      sectionTitle("Certifications");
      data.certifications.forEach((cert) => {
        checkPage();
        bullet(cert);
      });
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

module.exports = { rewriteResume };
