import * as GithubApi from '@octokit/rest'; 
import * as jwt from 'jsonwebtoken';
import {readFileSync} from 'fs';

import {githubAppId} from '../../../.config/project-config.json';

/** The Github Api instance to interact with the Github REST api. */
const github = new GithubApi();

// Set the Authentication using the github token.
authenticateGithubAsApplication();

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
  repository: GithubApi.ReposGetResponse;
}


/** 
 * The Github pull_request webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
interface PullRequestEvent { 
  action: PullRequestEventActions;
  number: number;
  pull_request: GithubApi.PullsGetResponse;
  repository: GithubApi.ReposGetResponse;
}

enum PullRequestEventActions {
  Closed = 'closed',
  Labeled = 'labeled',
  Opened = 'opened',
  Reopened = 'reopened',
  Synchronize = 'synchronize',
  Unlabeled = 'unlabeled',
}

interface PullRequestEventClosed extends PullRequestEvent {
  action: PullRequestEventActions.Closed;
}

interface PullRequestEventLabeled extends PullRequestEvent {
  action: PullRequestEventActions.Labeled;
  label: GithubApi.IssuesGetLabelResponse;
}

interface PullRequestEventOpened extends PullRequestEvent {
  action: PullRequestEventActions.Opened;
}

interface PullRequestEventReopened extends PullRequestEvent {
  action: PullRequestEventActions.Reopened;
}

interface PullRequestEventSynchronize extends PullRequestEvent {
  action: PullRequestEventActions.Synchronize;
}

interface PullRequestEventUnlabeled extends PullRequestEvent {
  action: PullRequestEventActions.Unlabeled;
  label: GithubApi.IssuesGetLabelResponse;
}

export type GithubPullRequestEvent =
  PullRequestEventClosed |
  PullRequestEventLabeled |
  PullRequestEventOpened |
  PullRequestEventReopened |
  PullRequestEventSynchronize |
  PullRequestEventUnlabeled;

/** Pushes a status to github for a commmit. */
export async function setStatusOnGithub(
    owner: string, repo: string, sha: string, state: 'error' | 'failure' | 'pending' | 'success',
    description: string = '', target_url: string = '', context: string = 'branch-manager') {
  await authenticateGithubForInstallation(owner, repo);
  const statusParams: GithubApi.ReposCreateStatusParams = {
    context, description, owner, repo, sha, state, target_url 
  };
  return github.repos.createStatus(statusParams);
}

/** Set github authentication to the the JWT for the github application. */
export function authenticateGithubAsApplication() {
  github.authenticate({type: 'app', token: generateJWT()});
}

/** Set github authentication to the token for the installation for a specific repo. */
export async function authenticateGithubForInstallation(owner: string, repo: string) {
  try {
    authenticateGithubAsApplication();
    const installationId = await github.apps.findRepoInstallation({owner, repo})
                                            .then(response => response.data.id);
    const token = await github.apps.createInstallationToken({installation_id: installationId})
                                    .then(response => response.data.token);
    github.authenticate({type: 'token', token});
  } catch (e) {
    throw Error(`Could not authenticate as Installation: ${JSON.stringify(e)}`);
  }
}

/** Creates a JWT for the github application.  */
function generateJWT() {
  const payload = {
    // Issued at time (iat).
    iat: Math.floor(Date.now() / 1000),
    // Expiration time (exp), 1 min later.
    exp: Math.floor(Date.now() / 1000) + 60,
    // Github App identifier.
    iss: githubAppId
  };
  return jwt.sign(payload, readFileSync(`${__dirname}/../../../.config/github-app-key.pem`),
    {algorithm: 'RS256'});
}
