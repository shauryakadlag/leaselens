import { NextRequest, NextResponse } from "next/server";

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

    // Robust PDF text extraction via pdfjs-dist (installed with pdf-parse)
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
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
          .map((item: any) => (item && item.str ? item.str : ""))
          .filter(Boolean);
        fullText += pageStrings.join(" ") + "\n\n";
      }

      cleanText = fullText.replace(/\r\n/g, "\n").trim();
    } catch (primaryErr: unknown) {
      console.warn("Primary pdfjs extraction warning, trying secondary fallback:", primaryErr);
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: uint8Array });
        const textResult = await parser.getText();
        cleanText = (textResult.text || "").replace(/\r\n/g, "\n").trim();
        pageCount = textResult.total || textResult.pages?.length || 1;
        await parser.destroy();
      } catch (secondaryErr: unknown) {
        console.error("PDF parse error:", secondaryErr);
        return NextResponse.json(
          { error: "Failed to read PDF document. The file may be password-protected or corrupted." },
          { status: 422 }
        );
      }
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
  } catch (error: unknown) {
    console.error("PDF extraction route error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred while processing the lease PDF." },
      { status: 500 }
    );
  }
}
