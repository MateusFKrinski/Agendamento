type MimeType =
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/pdf"
  | "text/csv"
  | (string & {});

export function downloadFile(
  fileData: number[] | string | ArrayBuffer,
  fileName: string,
  mimeType: MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
) {
  const buffer = Buffer.from(fileData as unknown as Uint8Array);
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}
