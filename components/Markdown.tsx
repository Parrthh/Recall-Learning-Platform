import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/** Server-rendered markdown with GFM tables and syntax-highlighted code blocks. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-invert prose-slate max-w-none prose-headings:scroll-mt-20 prose-table:text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
