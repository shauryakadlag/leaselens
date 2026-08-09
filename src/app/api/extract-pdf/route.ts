import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// W3C Spec-Compliant 2D DOMMatrix class for Node.js / Netlify serverless context where globalThis.DOMMatrix is undefined
if (typeof globalThis.DOMMatrix === "undefined") {
  class DOMMatrix {
    a: number = 1;
    b: number = 0;
    c: number = 0;
    d: number = 1;
    e: number = 0;
    f: number = 0;
    m11: number = 1;
    m12: number = 0;
    m21: number = 0;
    m22: number = 1;
    m41: number = 0;
    m42: number = 0;
    is2D: boolean = true;
    isIdentity: boolean = true;

    constructor(init?: any) {
      if (Array.isArray(init) || init instanceof Float32Array || init instanceof Float64Array) {
        if (init.length >= 6) {
          this.a = this.m11 = init[0];
          this.b = this.m12 = init[1];
          this.c = this.m21 = init[2];
          this.d = this.m22 = init[3];
          this.e = this.m41 = init[4];
          this.f = this.m42 = init[5];
        }
      } else if (init && typeof init === "object") {
        this.a = this.m11 = init.a ?? 1;
        this.b = this.m12 = init.b ?? 0;
        this.c = this.m21 = init.c ?? 0;
        this.d = this.m22 = init.d ?? 1;
        this.e = this.m41 = init.e ?? 0;
        this.f = this.m42 = init.f ?? 0;
      }
      this.isIdentity = this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
    }

    static fromMatrix(other?: any) {
      return new DOMMatrix(other);
    }

    static fromFloat32Array(array32: Float32Array) {
      return new DOMMatrix(array32);
    }

    static fromFloat64Array(array64: Float64Array) {
      return new DOMMatrix(array64);
    }

    multiply(other?: any) {
      const o = other || new DOMMatrix();
      const a = this.a * o.a + this.c * o.b;
      const b = this.b * o.a + this.d * o.b;
      const c = this.a * o.c + this.c * o.d;
      const d = this.b * o.c + this.d * o.d;
      const e = this.a * o.e + this.c * o.f + this.e;
      const f = this.b * o.e + this.d * o.f + this.f;
      return new DOMMatrix([a, b, c, d, e, f]);
    }

    translate(tx = 0, ty = 0) {
      return this.multiply(new DOMMatrix([1, 0, 0, 1, tx, ty]));
    }

    scale(sx = 1, sy = sx) {
      return this.multiply(new DOMMatrix([sx, 0, 0, sy, 0, 0]));
    }

    rotate(angle = 0) {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return this.multiply(new DOMMatrix([cos, sin, -sin, cos, 0, 0]));
    }

    inverse() {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) return new DOMMatrix();
      const invDet = 1 / det;
      return new DOMMatrix([
        this.d * invDet,
        -this.b * invDet,
        -this.c * invDet,
        this.a * invDet,
        (this.c * this.f - this.d * this.e) * invDet,
        (this.b * this.e - this.a * this.f) * invDet,
      ]);
    }

    transformPoint(point?: { x?: number; y?: number }) {
      const x = point?.x ?? 0;
      const y = point?.y ?? 0;
      return {
        x: x * this.a + y * this.c + this.e,
        y: x * this.b + y * this.d + this.f,
      };
    }

    toFloat32Array() {
      return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]);
    }

    toFloat64Array() {
      return new Float64Array([this.a, this.b, this.c, this.d, this.e, this.f]);
    }
  }

  (globalThis as any).DOMMatrix = DOMMatrix;
}

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
