import { promises as fs } from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * Read a topic's markdown body from the content directory.
 * `contentPath` is stored relative to content/ (e.g. "dsa/two-pointers.md")
 * so adding a topic only requires a new file plus a DB row.
 */
export async function readTopicContent(contentPath: string): Promise<string> {
  const resolved = path.resolve(CONTENT_ROOT, contentPath);
  if (!resolved.startsWith(CONTENT_ROOT + path.sep)) {
    throw new Error(`content path escapes content directory: ${contentPath}`);
  }
  return fs.readFile(resolved, "utf8");
}
