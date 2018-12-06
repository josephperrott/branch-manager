import {PullsGetResponse, OrgsGetResponse, ReposGetResponse} from '@octokit/rest';

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
