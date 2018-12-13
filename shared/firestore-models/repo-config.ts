import * as firebase from 'firebase-admin';
import {firestoreInstance} from '../firebase-common';

/** A branch from the repo config for the branch manager. */
export interface BranchManagerRepoConfigBranch {
  branch: string;
  label: string;
};

/** The configuration for the branch manager. */
export interface BranchManagerRepoConfig {
  enabled: boolean;
  branches: Array<BranchManagerRepoConfigBranch>;
};

/** Gets a reference to the Config document. */
export async function getConfigRef(id: string) {
  // The document from the repo config collected for the repo, as identified by githubs repo id.
  return firestoreInstance.collection('repo_configs').doc(id);
}

/** Gets a instance of the Config document. */
export async function getConfig(id: string) {
  const configRef = await getConfigRef(id);
  return configRef.get();
}

/** Updates all the fields in the Config document.  */
export async function updateConfigRef(configRef: firebase.firestore.DocumentReference,
                                      newConfig: Partial<BranchManagerRepoConfig>) {
  const oldConfig = await configRef.get();
  if (!oldConfig.exists || JSON.stringify(oldConfig.data()) !== JSON.stringify(newConfig)) {
    configRef.set(newConfig);
  }
}
