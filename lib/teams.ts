export interface Team {
  key: string;
  name: string;
  nameZh: string;
  keywords: string[];
  affiliations: string[];
  color: string; // Tailwind color class
  region: "domestic" | "international";
}

export const TEAMS: Team[] = [
  // ── 国内团队 ──
  {
    key: "bytedance",
    name: "ByteDance Seed",
    nameZh: "字节 Seed",
    keywords: ["bytedance", "seed", "doubao"],
    affiliations: ["bytedance"],
    color: "bg-red-100 text-red-800",
    region: "domestic",
  },
  {
    key: "alibaba",
    name: "Alibaba Qwen",
    nameZh: "阿里千问",
    keywords: ["qwen", "alibaba", "tongyi"],
    affiliations: ["alibaba", "tongyi"],
    color: "bg-orange-100 text-orange-800",
    region: "domestic",
  },
  {
    key: "baidu",
    name: "Baidu ERNIE",
    nameZh: "百度文心",
    keywords: ["baidu", "ernie", "wenxin"],
    affiliations: ["baidu"],
    color: "bg-blue-100 text-blue-800",
    region: "domestic",
  },
  {
    key: "tencent",
    name: "Tencent Hunyuan",
    nameZh: "腾讯混元",
    keywords: ["tencent", "hunyuan"],
    affiliations: ["tencent"],
    color: "bg-green-100 text-green-800",
    region: "domestic",
  },
  {
    key: "zhipu",
    name: "Zhipu GLM",
    nameZh: "智谱 GLM",
    keywords: ["zhipu", "chatglm", "glm-"],
    affiliations: ["zhipu", "tsinghua"],
    color: "bg-purple-100 text-purple-800",
    region: "domestic",
  },
  {
    key: "deepseek",
    name: "DeepSeek",
    nameZh: "DeepSeek",
    keywords: ["deepseek"],
    affiliations: ["deepseek"],
    color: "bg-indigo-100 text-indigo-800",
    region: "domestic",
  },
  {
    key: "moonshot",
    name: "Moonshot Kimi",
    nameZh: "月之暗面",
    keywords: ["moonshot", "kimi"],
    affiliations: ["moonshot"],
    color: "bg-slate-100 text-slate-800",
    region: "domestic",
  },
  {
    key: "minimax",
    name: "MiniMax",
    nameZh: "MiniMax",
    keywords: ["minimax"],
    affiliations: ["minimax"],
    color: "bg-pink-100 text-pink-800",
    region: "domestic",
  },

  // ── 国际团队 ──
  {
    key: "openai",
    name: "OpenAI",
    nameZh: "OpenAI",
    keywords: ["openai"],
    affiliations: ["openai"],
    color: "bg-emerald-100 text-emerald-800",
    region: "international",
  },
  {
    key: "anthropic",
    name: "Anthropic",
    nameZh: "Anthropic",
    keywords: ["anthropic"],
    affiliations: ["anthropic"],
    color: "bg-amber-100 text-amber-800",
    region: "international",
  },
  {
    key: "google",
    name: "Google DeepMind",
    nameZh: "谷歌 DeepMind",
    keywords: ["deepmind", "google research", "gemini"],
    affiliations: ["deepmind", "google research", "google brain"],
    color: "bg-cyan-100 text-cyan-800",
    region: "international",
  },
  {
    key: "meta",
    name: "Meta AI",
    nameZh: "Meta AI",
    keywords: ["meta ai", "llama"],
    affiliations: ["meta ai", "fair", "meta platforms"],
    color: "bg-blue-100 text-blue-800",
    region: "international",
  },
  {
    key: "mistral",
    name: "Mistral AI",
    nameZh: "Mistral",
    keywords: ["mistral"],
    affiliations: ["mistral"],
    color: "bg-violet-100 text-violet-800",
    region: "international",
  },
  {
    key: "cohere",
    name: "Cohere",
    nameZh: "Cohere",
    keywords: ["cohere"],
    affiliations: ["cohere"],
    color: "bg-teal-100 text-teal-800",
    region: "international",
  },
];

export const TEAM_MAP = Object.fromEntries(TEAMS.map((t) => [t.key, t]));

export function getTeamByKey(key: string): Team | undefined {
  return TEAM_MAP[key];
}
