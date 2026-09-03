How to generate resume.pdf from resume.html

Prerequisites
- Node.js (14+)

Install dependencies and generate the PDF:

```bash
cd d:/Github/workforce-management-portfolio
npm install
npm run generate-resume
```

This will produce `resume.pdf` in the repository root by rendering `resume.html` with Puppeteer.

If you prefer not to install Puppeteer, you can open `resume.html` in a browser and use Print → Save as PDF.
