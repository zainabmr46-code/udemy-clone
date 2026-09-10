const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generates a simple certificate PDF and saves it to /certificates, returns the file path.
const generateCertificate = ({ studentName, courseTitle, date, certId }) => {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '..', 'certificates');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${certId}.pdf`);
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#4f46e5');
    doc.fontSize(28).fillColor('#4f46e5').text('Certificate of Completion', 0, 100, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#333').text('This certifies that', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#111').text(studentName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#333').text('has successfully completed the course', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor('#111').text(courseTitle, { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(12).fillColor('#666').text(`Date: ${date}`, { align: 'center' });
    doc.text(`Certificate ID: ${certId}`, { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = generateCertificate;
