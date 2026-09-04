const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const resumePath = path.resolve(__dirname, '..', 'resume.html');
  await page.goto('file://' + resumePath, { waitUntil: 'networkidle0' });
  const pdfPath = path.resolve(__dirname, '..', 'resume.pdf');
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();
  console.log('Saved resume to', pdfPath);
})();
