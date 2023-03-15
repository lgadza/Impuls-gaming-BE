import PdfPrinter from "pdfmake";
import request from "request";
import { pipeline } from "stream";
import { promisify } from "util";
import { getPDFWritableStream } from "./fs-tools.js";

// import watermark from "../../public/img/logo.png";
export const getPDFReadableStream = (confirmation) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
    },
  };

  const printer = new PdfPrinter(fonts);
  const watermark =
    "https://res.cloudinary.com/di6cppfze/image/upload/v1678842071/impulsgaming/img/logo_kzougd.png";
  request({ url: watermark, encoding: null }, (err, res, buffer) => {
    if (err) throw err;
    const dataUrl =
      "data:" +
      res.headers["content-type"] +
      ";base64," +
      buffer.toString("base64");
    const docDefinition = {
      content: [
        // confirmation.station_No.toString(),
        // confirmation.email,
        // confirmation.number.toString(),
        // confirmation.date,
        confirmation.userName,
      ],
      // background: {
      //   image: dataUrl,
      //   fit: [595.28, 841.89], // set the size of the watermark image to the size of the document
      // },
    };

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
    pdfReadableStream.end();

    return pdfReadableStream;
  });
};
