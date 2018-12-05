/** 
 * Limited implementation of the Github push webhook event from
 * https://developer.github.com/webhooks/#payloads
 */
export interface GithubPushEvent { 
  ref: string;
  repository: {
    id: number;
    full_name: string;
  }
};
