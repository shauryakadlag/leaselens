import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cached Base64 Data URL for pdf.worker.mjs in Node.js server context
let cachedWorkerDataUrl: string | null = null;

function getWorkerDataUrl(): string {
  if (cachedWorkerDataUrl) return cachedWorkerDataUrl;
  try {
    const workerPath = path.join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.mjs"
    );
    if (fs.existsSync(workerPath)) {
      const workerContent = fs.readFileSync(workerPath, "utf8");
      cachedWorkerDataUrl = `data:application/javascript;base64,${Buffer.from(
        workerContent
      ).toString("base64")}`;
      return cachedWorkerDataUrl;
    }
  } catch (err) {
    console.warn("Failed to load pdf.worker.mjs directly from disk:", err);
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please select a residential lease PDF." },
        { status: 400 }
      );
    }

    // Validate MIME type or file extension
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Invalid file format. LeaseLens only accepts PDF documents." },
        { status: 400 }
      );
    }

    // 15MB file size limit
    const MAX_SIZE_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds the 15MB limit. Please upload a smaller lease document." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    let cleanText = "";
    let pageCount = 1;

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // Register Base64 worker Data URL to bypass Turbopack chunk resolution
      const workerUrl = getWorkerDataUrl();
      if (workerUrl) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      }

      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true,
        verbosity: 0,
      });

      const pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;

      let fullText = "";
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item: any) => (item && typeof item.str === "string" ? item.str : ""))
          .filter(Boolean);
        fullText += `--- PAGE ${i} ---\n` + pageStrings.join(" ") + "\n\n";
      }

      cleanText = fullText.replace(/\r\n/g, "\n").trim();
    } catch (pdfErr: any) {
      console.error("PDF extraction error:", pdfErr);
      return NextResponse.json(
        { error: `Failed to read PDF document: ${pdfErr?.message || "The file may be corrupt or password-protected."}` },
        { status: 422 }
      );
    }

    // Check for scanned / image-only PDFs
    if (cleanText.length < 50) {
      return NextResponse.json(
        {
          error: "No extractable text found. This lease document appears to be scanned or image-based.",
          isScanned: true,
        },
        { status: 422 }
      );
    }

    const words = cleanText.split(/\s+/).filter(Boolean);

    return NextResponse.json({
      success: true,
      text: cleanText,
      numPages: pageCount,
      fileName: file.name,
      fileSize: file.size,
      wordCount: words.length,
      extractedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("PDF extraction route unexpected error:", error);
    return NextResponse.json(
      { error: `Server error: ${error?.message || "An unexpected error occurred during text extraction."}` },
      { status: 500 }
    );
  }
}
