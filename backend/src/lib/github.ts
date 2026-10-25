import { errors, createHttpError } from "./errors.ts";
import { env } from "../config/env.ts";

/**
 * Pre-flight GitHub verification (defensive third-party integration).
 *
 * Before a submission reaches PostgreSQL we call the GitHub REST API to make
 * sure the repository is real, public and has a README — mentors should never
 * see dead or private links on the review dashboard.
 *
 * Docs: https://docs.github.com/en/rest/repos/repos (unset auth header,
 * `User-Agent` is mandatory for every GitHub API request).
 */

interface RepoInput {
  owner: string;
  repo: string;
}

// https://github.com/{owner}/{repo} — optional .git suffix or extra path
// segments (e.g. /tree/main) are tolerated when parsing.
const GITHUB_URL_PATTERN =
  /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-_.]*))\/([A-Za-z0-9-_.]+?)(?:\.git)?(?:\/.*)?$/i;

export function parseGitHubRepoUrl(url: string): RepoInput | null {
  const match = GITHUB_URL_PATTERN.exec(url);
  if (!match) return null;
  const [, owner, repo] = match;
  return { owner, repo };
}

function repoFieldError(message: string): never {
  throw createHttpError(400, message, {
    repoUrl: [message],
  });
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "project-submission-review-app",
    ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}),
    ...extra,
  };
}

async function fetchGitHub(path: string): Promise<Response | null> {
  try {
    return await fetch(`https://api.github.com${path}`, {
      headers: headers(),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Network / timeout / DNS — treat as "GitHub unreachable" instead of
    // blocking the whole submission pipeline on a transient outage.
    return null;
  }
}

async function verifyGitHubRepos(input: RepoInput): Promise<void> {
  const { owner, repo } = input;
  const repoResponse = await fetchGitHub(`/repos/${owner}/${repo}`);

  if (!repoResponse) {
    repoFieldError(
      "Could not reach GitHub to verify this repository. Please try again in a moment.",
    );
  }

  if (repoResponse.status === 404) {
    repoFieldError(
      "Repository not found on GitHub. Check the URL and make sure it is public.",
    );
  }

  if (repoResponse.status === 401 || repoResponse.status === 403) {
    // 403 is almost always secondary rate limiting for unauthenticated calls.
    repoFieldError(
      "GitHub is rate-limiting verification requests right now. Please try again in a minute.",
    );
  }

  if (!repoResponse.ok) {
    repoFieldError("GitHub could not verify this repository. Please try again.");
  }

  const repoPayload = (await repoResponse.json()) as { private?: boolean };

  if (repoPayload.private) {
    repoFieldError(
      "Repository is currently private. Please make it public on GitHub before submitting.",
    );
  }

  // README check: the /readme endpoint 404s when the repo has no README file.
  const readmeResponse = await fetchGitHub(`/repos/${owner}/${repo}/readme`);
  if (!readmeResponse || !readmeResponse.ok) {
    repoFieldError(
      "Repository must contain a README.md file. Add one on GitHub before submitting.",
    );
  }
}

/**
 * Validates a submission's repoUrl against the live GitHub API. Throws an
 * HttpError with a `repoUrl` field error the ShadCN form can surface inline.
 */
export async function verifyRepoUrl(repoUrl: string): Promise<void> {
  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed) {
    repoFieldError(
      "Repository URL must point to a GitHub repository (https://github.com/owner/repo).",
    );
  }
  await verifyGitHubRepos(parsed);
}
