const fs = require("fs");
const pdf = require("pdf-parse");
const { translate } = require("@vitalets/google-translate-api");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("fontkit");

// Function to extract text from PDF
async function extractText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

// Function to translate text
async function translateText(text, targetLanguage = "en") {
  try {
    const result = await translate(text, { to: targetLanguage });
    return result.text;
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
}

// Function to create new PDF with translated text
async function createTranslatedPdf(
  originalFilePath,
  translatedText,
  outputFilePath
) {
  const originalPdfBytes = fs.readFileSync(originalFilePath);
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  // Register fontkit
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = fs.readFileSync("./NotoSans-Regular.ttf");
  const notoSansFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const fontSize = 12;

  // Add translated text to the first page
  firstPage.drawText(translatedText, {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: notoSansFont,
    color: rgb(0, 0, 0),
    lineHeight: fontSize + 2,
    maxWidth: width - 100,
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Write the bytes to a new file
  fs.writeFileSync(outputFilePath, pdfBytes);
}

// Main function to extract, translate, and create new PDF
async function main() {
  const originalFilePath = "./demo_123.pdf"; // Updated with your file path
  const outputFilePath = "./demo_123_translated.pdf"; // Updated with your desired output file path

  try {
    // Step 1: Extract text from PDF
    const extractedText = await extractText(originalFilePath);
    console.log("Extracted Text:", extractedText);

    // Step 2: Translate extracted text
    const translatedText = await translateText(extractedText);
    console.log("Translated Text:", translatedText);

    // Step 3: Create new PDF with translated text
    await createTranslatedPdf(originalFilePath, translatedText, outputFilePath);
    console.log("Translated PDF created successfully:", outputFilePath);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
