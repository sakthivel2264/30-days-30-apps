"use client";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useCallback } from "react";
import {
  DOCXExporter,
  docxDefaultSchemaMappings,
} from "@blocknote/xl-docx-exporter";
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import { pdf } from "@react-pdf/renderer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileText, File } from "lucide-react";

type ChildData = string;

interface DocEditorProps {
  documentdata: string;
  sendDocumentData: (data: ChildData) => void;
  downloadButtonState?: boolean;
}

const RichEditor: React.FC<DocEditorProps> = ({
  documentdata,
  sendDocumentData,
  downloadButtonState = false,
}) => {
  const editor = useCreateBlockNote({}, []);

  const onChange = useCallback(async () => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document);
    sendDocumentData(markdown);
  }, [editor, sendDocumentData]);

  useEffect(() => {
    const loadContent = async () => {
      if (documentdata) {
        const cleaned = documentdata.replace(/^([#]+) \/+/gm, "$1 ");
        const blocks = await editor.tryParseMarkdownToBlocks(cleaned);
        editor.replaceBlocks(editor.document, blocks);
      }
    };
    loadContent();
  }, [documentdata, editor]);

  // ✅ PDF download
  const downloadPDF = async () => {
    try {
      const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);
      const pdfDocument = await exporter.toReactPDFDocument(editor.document);
      const blob = await pdf(pdfDocument).toBlob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "Report.pdf";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  // ✅ DOCX download
  const downloadDocx = async () => {
    try {
      const exporter = new DOCXExporter(editor.schema, docxDefaultSchemaMappings);
      const blob = await exporter.toBlob(editor.document);

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "Report.docx";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading DOCX:", error);
    }
  };

  return (
    <div className="border rounded-lg shadow-md">
      <BlockNoteView
        editor={editor}
        onChange={onChange}
        theme="light"
        style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
      />

      {!downloadButtonState && (
        <div className="p-2 flex flex-row-reverse">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={downloadPDF}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={downloadDocx}
                className="flex items-center gap-2"
              >
                <File className="w-4 h-4" />
                Download DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default RichEditor;
