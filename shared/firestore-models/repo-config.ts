import * as firebase from 'firebase-admin';
import {getFirebaseInstance} from '../firebase-common';

/** The Firebase app's firestore database. */
const firestore = getFirebaseInstance().firestore();

/** The configuration for the branch manager. */
export interface BranchManagerRepoConfig {
  enabled: boolean;
  branches: Array<{
    branch: string;
    label: string;
  }>;
};

/** Gets a reference to the Config document. */
export async function getConfigRef(id: string) {
  // The document from the repo config collected for the repo, as identified by githubs repo id.
  return firestore.collection('repo_configs').doc(id);
}

/** Updates all the fields in the Config document.  */
export async function updateConfigRef(configRef: firebase.firestore.DocumentReference,
                                      newConfig: Partial<BranchManagerRepoConfig>) {
  const oldConfig = await configRef.get();
  if (!oldConfig.exists || JSON.stringify(oldConfig.data()) !== JSON.stringify(newConfig)) {
    configRef.set(newConfig);
  }
}
