const puppeteer = require("puppeteer");
const sass = require("sass");
const fs = require("fs");
const path = require("path");

const inputFile = process.argv.slice(2)[0] ?? "index.html";

const filename = path.parse(path.basename(inputFile)).name;

let dir = "";
let outputPath = path.resolve(__dirname, `../build/${filename}.pdf`);

const dirs = path.dirname(inputFile).split("/");
console.log('dirs', dirs)
if (dirs.length > 0 && dirs[0] !== '.') {
  dir = dirs[dirs.length - 1];
  outputPath = path.resolve(__dirname, `../build/${dir}/${filename}/cv.pdf`);
}

const folderPath = path.dirname(outputPath);
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log("Folder created:", folderPath);
} else {
  console.log("Folder already exists:", folderPath);
}

const HTML_PATH = path.resolve(__dirname, inputFile);
const SCSS_PATH = path.resolve(__dirname, "style.scss");
const COMPILED_CSS_PATH = path.resolve(__dirname, "../build/style.css");
const COMPILED_PDF_PATH = outputPath;

(async () => {
  const result = await sass.compileAsync(path.resolve(__dirname, SCSS_PATH));

  const cssPath = path.resolve(__dirname, COMPILED_CSS_PATH);
  fs.writeFileSync(cssPath, result.css);

  const htmlPath = path.resolve(__dirname, HTML_PATH);
  let htmlContent = fs.readFileSync(htmlPath, "utf8");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  await page.addStyleTag({ path: COMPILED_CSS_PATH });

  await page.pdf({
    path: COMPILED_PDF_PATH,
    format: "A4",
    printBackground: true,
    
    margin: {
      top: '70px',
      right: '60px',
      bottom: '70px',
      left: '60px'
    }
  });

  await browser.close();

  console.log("PDF compiled successfully");
})();
