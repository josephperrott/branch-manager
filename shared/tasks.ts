import {PubSub} from '@google-cloud/pubsub';

import {setStatusOnGithub} from './github';

const presubmitPrTaskPublisher = (new PubSub()).topic('presubmit-pr-task').publisher()

/** 
 * Creates a task to be run as soon as quota is check and update the status
 * if the PR can be cherry-picked.
 */
export async function createPresubmitPrTask(
    org: string, repo: string, pr: string, branch: string, sha: string) {
  await setStatusOnGithub(org, repo, sha, 'pending');
  const data = JSON.stringify({org, repo, pr, branch, sha});
  await presubmitPrTaskPublisher.publish(data);
}
