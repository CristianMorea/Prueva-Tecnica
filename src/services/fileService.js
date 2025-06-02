const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const tempDir = path.join(__dirname, '../temp');

const createTestFiles = (pdfContent, txtContent) => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const pdfPath = path.join(tempDir, 'test-pdf.pdf');
  const txtPath = path.join(tempDir, 'test-txt.txt');

  fs.writeFileSync(pdfPath, pdfContent);
  fs.writeFileSync(txtPath, txtContent);

  return { pdfPath, txtPath };
};

const readTextFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  return fs.readFileSync(filePath, 'utf8');
};

const readPdfFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
};

const cleanTestFiles = () => {
  try {
    const pdfPath = path.join(tempDir, 'test-pdf.pdf');
    const txtPath = path.join(tempDir, 'test-txt.txt');

    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
  } catch (err) {
    console.error('Error cleaning test files:', err);
  }
};

module.exports = {
  createTestFiles,
  readTextFile,
  readPdfFile,
  cleanTestFiles
};
