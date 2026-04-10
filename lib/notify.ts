import { Paper } from "./arxiv";
import { getTeamByKey } from "./teams";

const WECHAT_WEBHOOK_URL = process.env.WECHAT_WEBHOOK_URL || "";
const BATCH_SIZE = 5; // max papers per message

function formatPaperMessage(papers: Paper[]): string {
  const lines: string[] = [];

  lines.push(`📄 **AI Paper Tracker** — ${papers.length} 篇新论文\n`);

  for (const paper of papers) {
    const team = getTeamByKey(paper.team);
    const teamLabel = team ? `[${team.nameZh}]` : `[${paper.team}]`;
    const pubDate = new Date(paper.publishedAt).toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    });
    const authorsStr =
      paper.authors.slice(0, 3).join(", ") +
      (paper.authors.length > 3 ? " et al." : "");
    const abstractPreview =
      paper.abstract.length > 200
        ? paper.abstract.slice(0, 200) + "..."
        : paper.abstract;

    lines.push(
      `---\n` +
        `**${teamLabel} ${paper.title}**\n` +
        `👥 ${authorsStr}\n` +
        `📅 ${pubDate}  🏷️ ${paper.categories.slice(0, 3).join(", ")}\n` +
        `📝 ${abstractPreview}\n` +
        `🔗 [arXiv](${paper.url})  |  [PDF](${paper.pdfUrl})\n`
    );
  }

  return lines.join("\n");
}

async function sendWeChatMessage(content: string): Promise<void> {
  if (!WECHAT_WEBHOOK_URL) {
    console.warn("[notify] WECHAT_WEBHOOK_URL not configured, skipping.");
    return;
  }

  const body = {
    msgtype: "markdown",
    markdown: { content },
  };

  const res = await fetch(WECHAT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WeChat webhook error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errcode !== 0) {
    throw new Error(`WeChat API error: ${JSON.stringify(json)}`);
  }
}

export async function notifyNewPapers(papers: Paper[]): Promise<void> {
  if (!papers.length) return;

  // Split into batches of BATCH_SIZE
  for (let i = 0; i < papers.length; i += BATCH_SIZE) {
    const batch = papers.slice(i, i + BATCH_SIZE);
    const content = formatPaperMessage(batch);

    try {
      await sendWeChatMessage(content);
      console.log(
        `[notify] Sent batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} papers`
      );
    } catch (err) {
      console.error(`[notify] Failed to send batch:`, err);
    }

    // Brief delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < papers.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
