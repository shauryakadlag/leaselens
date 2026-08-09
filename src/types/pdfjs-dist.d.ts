declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  const content: any;
  export default content;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export const getDocument: (params: any) => { promise: Promise<any> };
  export const GlobalWorkerOptions: { workerSrc: string };
}
