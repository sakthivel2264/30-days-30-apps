"use client";

import { useState } from "react";
import RichEditor from "@/components/RichEditor";

export default function Home() {
  const [doc, setDoc] = useState<string>("");

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Rich Editor App</h1>
      <RichEditor
        documentdata={doc}
        sendDocumentData={(data) => setDoc(data)}
      />
      <div className="mt-6">
        <h2 className="font-semibold">Markdown Preview:</h2>
        <pre className="bg-gray-100 p-2 rounded-md text-sm mt-2 whitespace-pre-wrap">
          {doc}
        </pre>
      </div>
    </main>
  );
}
