export type LinkedInPack = {
  post: string;
  hook: string;
  length: number;
  warnings: string[];
};

const LINKEDIN_SOFT_LIMIT = 3000;

export function renderLinkedIn(markdown: string): LinkedInPack {
  const warnings: string[] = [];
  let post = markdown.replace(/^#\s+.+\n*/, "").trim();
  if (post.length > LINKEDIN_SOFT_LIMIT) {
    warnings.push(`Post is ${post.length} characters; LinkedIn truncates around ${LINKEDIN_SOFT_LIMIT}. Truncating.`);
    post = `${post.slice(0, LINKEDIN_SOFT_LIMIT - 1)}…`;
  }
  const hook = post.split(/\n+/)[0]?.slice(0, 210) ?? "";
  return { post, hook, length: post.length, warnings };
}
