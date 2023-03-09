import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util";
import { getPDFWritableStream } from "./fs-tools.js";
export const getPDFReadableStream = (confirmation) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      // confirmation.station_No.toString(),
      // confirmation.email,
      // confirmation.number.toString(),
      // confirmation.date,
      confirmation.userName,
    ],
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
export const asyncPDFGeneration = async (confirmation) => {
  const source = getPDFReadableStream(confirmation);
  const destination = getPDFWritableStream("reservation_confirmation.pdf");
  const promiseBasedPipeline = promisify(pipeline);

  await promiseBasedPipeline(source, destination);
};
