import * as fetch from 'node-fetch';
import * as express from 'express';
import {CloudTasksClient} from '@google-cloud/tasks';

import {setStatusOnGithub} from '../../shared/github';

/** The Cloud Tasks client instance for creating cloud tasks. */
const client = new CloudTasksClient();
/** The fullly qualified resource id of the task queue used for presubmit queue  */
const parent = client.queuePath('branch-manager', 'presubmit-pr-queue', 'us-central1');

/** The URL path at which presubmit pr tasks are triggered. */
export const PRESUBMIT_PR_URL = '/_presubmit_pr_task';

/** 
 * The handler function for a presubmit pr task.
 * 
 * Checks the if the pr is able to be cherry-picked cleanly to its target branch, and
 * set the status on github as a result.
 */
export async function handlePresubmitPrTask(request: express.Request, response: express.Response) {
  const {org, repo, pr, branch, sha} = request.body;
  const url = `https://presubmit-service-dot-branch-manager.appspot.com/check_pr`;
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({org, repo, pr, branch, sha})
  }
  await fetch(url, config).then(response => response.json()).then(
    (response) => {
      setStatusOnGithub(org, repo, sha, response.status);
    },
    (reason) => {
      setStatusOnGithub(org, repo, sha, reason.status, 'The PR does not cleanly cherry-pick onto the targetted branch');
    });
  response.send();
}

/** Creates a task to be run as soon as quota is check and update the status if the PR can be cherry-picked. */
export async function createPresubmitPrTask(org: string, repo: string, pr: string, branch: string, sha: string) {
  setStatusOnGithub(org, repo, sha, 'pending');
  const task = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUri: PRESUBMIT_PR_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      body: Buffer.from(JSON.stringify({org, repo, pr, branch, sha})).toString('base64')
    }
  };
  return await client.createTask({parent, task});
}
