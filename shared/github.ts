import {PullsGetResponse, OrgsGetResponse, ReposGetResponse} from '@octokit/rest';

import {githubToken} from '../project-config.json';

/** 
 * The Github push webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
export interface GithubPushEvent { 
  ref: string;
  head: string;
  before: string;
  size: number;
  distinct_size: number;
  commits: Array<{
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    url: string;
    distinct: boolean;
  }>;
  repository: ReposGetResponse;
};


/** 
 * The Github pull_request webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
export interface GithubPullRequestEvent { 
  action: string;
  number: number;
  organization: OrgsGetResponse;
  pull_request: PullsGetResponse
  repository: ReposGetResponse;
};

/** Pushes a status to github for a commmit. */
export async function setStatusOnGithub(
  org: string, repo: string, sha: string, state: 'error' | 'failure' | 'pending' | 'success', 
  description: string = '', target_url: string = '', context: string = 'branch-manager') {
  const url = `https://api.github.com/repos/${org}/${repo}/statuses/${sha}`;
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO(josephperrott): Set up loading token at runtime
      'Authorization': `token ${githubToken}`,
    },
    body: JSON.stringify({state, target_url, description, context})
  };
  await fetch(url, config);
}
