import { generateHTML } from "@tiptap/html/server";
import { type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

export function RenderDescription({ json }: { json: JSONContent }) {
  const output = generateHTML(json, [
    StarterKit,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ]);

  return (
    <div
      className="prose dar:prose-invert prose-li:marker:text-primary"
      dangerouslySetInnerHTML={{ __html: output }}
    />
  );
}
