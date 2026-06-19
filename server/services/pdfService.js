const PDFDocument = require('pdfkit');

function generatePDFReport(data, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="delhi-cm-report-${Date.now()}.pdf"`);
  doc.pipe(res);

  const { overview, categories, departments, breaches, districts, dateRange } = data;

  // ─── HEADER ───────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 90).fill('#1A3A6B');
  doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
    .text('Government of National Capital Territory of Delhi', 50, 20, { align: 'center' });
  doc.fontSize(14).text("Chief Minister's Grievance & Complaint Management Report", 50, 48, { align: 'center' });
  doc.fontSize(10).text(`Report Period: ${dateRange.from} to ${dateRange.to}`, 50, 70, { align: 'center' });

  // ─── SUMMARY BOX ──────────────────────────────────────────
  doc.fillColor('#1A3A6B').fontSize(14).font('Helvetica-Bold').text('Executive Summary', 50, 110);
  doc.moveTo(50, 128).lineTo(545, 128).strokeColor('#1A3A6B').stroke();

  const summaryY = 140;
  const cols = [50, 170, 310, 420];
  const labels = ['Total Complaints', 'Resolved', 'Pending', 'SLA Breached'];
  const values = [
    overview.total || 0,
    overview.resolved || 0,
    overview.pending || 0,
    overview.slaBreached || 0
  ];

  cols.forEach((x, i) => {
    doc.rect(x, summaryY, 110, 60).fillAndStroke('#F8FAFC', '#CBD5E1');
    doc.fillColor('#1A3A6B').fontSize(22).font('Helvetica-Bold').text(String(values[i]), x + 5, summaryY + 8, { width: 100, align: 'center' });
    doc.fillColor('#64748B').fontSize(8).font('Helvetica').text(labels[i], x + 5, summaryY + 38, { width: 100, align: 'center' });
  });

  // Resolution Rate
  const rate = overview.total > 0 ? ((overview.resolved / overview.total) * 100).toFixed(1) : 0;
  doc.fillColor('#16A34A').fontSize(13).font('Helvetica-Bold')
    .text(`Overall Resolution Rate: ${rate}%`, 50, summaryY + 75);
  doc.fillColor('#64748B').fontSize(10).font('Helvetica')
    .text(`Average Resolution Time: ${overview.avgResolutionHours?.toFixed(1) || 'N/A'} hours`, 50, summaryY + 95);

  // ─── CATEGORY BREAKDOWN ───────────────────────────────────
  doc.fillColor('#1A3A6B').fontSize(14).font('Helvetica-Bold').text('Top Complaint Categories', 50, summaryY + 130);
  doc.moveTo(50, summaryY + 148).lineTo(545, 148 + summaryY).strokeColor('#1A3A6B').stroke();

  let catY = summaryY + 160;
  const topCats = (categories || []).slice(0, 5);
  topCats.forEach((cat, i) => {
    doc.fillColor(i % 2 === 0 ? '#F8FAFC' : 'white').rect(50, catY, 495, 22).fill();
    doc.fillColor('#1E293B').fontSize(10).font('Helvetica')
      .text(`${i + 1}. ${cat._id}`, 55, catY + 5)
      .text(String(cat.count), 490, catY + 5, { align: 'right' });
    catY += 22;
  });

  // ─── DEPARTMENT PERFORMANCE ───────────────────────────────
  doc.addPage();
  doc.rect(0, 0, doc.page.width, 50).fill('#1A3A6B');
  doc.fillColor('white').fontSize(16).font('Helvetica-Bold')
    .text('Department-wise Performance', 50, 15);

  let deptY = 70;
  doc.fillColor('#1A3A6B').fontSize(11).font('Helvetica-Bold')
    .text('Department', 50, deptY)
    .text('Total', 270, deptY)
    .text('Resolved', 330, deptY)
    .text('Pending', 400, deptY)
    .text('SLA %', 470, deptY);
  doc.moveTo(50, deptY + 16).lineTo(545, deptY + 16).strokeColor('#CBD5E1').stroke();
  deptY += 24;

  (departments || []).forEach((dept, i) => {
    const slaRate = dept.total > 0 ? (((dept.total - (dept.breached || 0)) / dept.total) * 100).toFixed(0) : '100';
    doc.fillColor(i % 2 === 0 ? '#F8FAFC' : 'white').rect(50, deptY - 2, 495, 20).fill();
    doc.fillColor('#1E293B').fontSize(9).font('Helvetica')
      .text(dept._id || 'Unassigned', 50, deptY, { width: 210 })
      .text(String(dept.total || 0), 270, deptY)
      .text(String(dept.resolved || 0), 330, deptY)
      .text(String(dept.pending || 0), 400, deptY)
      .text(`${slaRate}%`, 470, deptY);
    deptY += 20;
    if (deptY > 750) { doc.addPage(); deptY = 50; }
  });

  // ─── SLA BREACH LIST ──────────────────────────────────────
  if (breaches && breaches.length > 0) {
    deptY += 20;
    if (deptY > 650) { doc.addPage(); deptY = 50; }
    doc.fillColor('#DC2626').fontSize(14).font('Helvetica-Bold').text('⚠ SLA Breach List', 50, deptY);
    deptY += 20;
    (breaches.slice(0, 20)).forEach((b, i) => {
      doc.fillColor('#1E293B').fontSize(9).font('Helvetica')
        .text(`${i + 1}. [${b.priority}] ${b.title} — ${b.district} — ${b.assignedDepartment || 'Unassigned'}`, 50, deptY, { width: 495 });
      deptY += 16;
      if (deptY > 750) { doc.addPage(); deptY = 50; }
    });
  }

  // ─── DISTRICT SUMMARY ─────────────────────────────────────
  deptY += 20;
  if (deptY > 650) { doc.addPage(); deptY = 50; }
  doc.fillColor('#1A3A6B').fontSize(14).font('Helvetica-Bold').text('District-wise Complaint Count', 50, deptY);
  deptY += 24;
  (districts || []).forEach((d, i) => {
    doc.fillColor(i % 2 === 0 ? '#F8FAFC' : 'white').rect(50, deptY - 2, 495, 18).fill();
    doc.fillColor('#1E293B').fontSize(9).font('Helvetica')
      .text(d._id || 'Unknown', 50, deptY)
      .text(String(d.count), 490, deptY, { align: 'right' });
    deptY += 18;
    if (deptY > 750) { doc.addPage(); deptY = 50; }
  });

  // ─── FOOTER ───────────────────────────────────────────────
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(pages.start + i);
    doc.fillColor('#64748B').fontSize(8).font('Helvetica')
      .text(`Generated by Delhi CM Dashboard | ${new Date().toLocaleString('en-IN')} | Page ${i + 1} of ${pages.count}`,
        50, doc.page.height - 30, { align: 'center' });
  }

  doc.end();
}

module.exports = { generatePDFReport };
