import * as firebase from 'firebase-admin';
import {firestoreInstance} from '../firebase-common';

/** A branch from the repo config for the branch manager. */
export interface BranchManagerRepoConfigBranch {
  branchName: string;
  label: string;
};

/** The configuration for the branch manager. */
export interface BranchManagerRepoConfig {
  enabled: boolean;
  branches: Array<BranchManagerRepoConfigBranch>;
};

/** An empty default config object to expand from. */
const DEFAULT_CONFIG: BranchManagerRepoConfig = {
  enabled: false,
  branches: [],
};

/** Gets a reference to the Config document. */
export async function getConfigRef(id: string) {
  // The document from the repo config collected for the repo, as identified by githubs repo id.
  return firestoreInstance.collection('repo_configs').doc(id);
}

/** Gets a instance of the Config document. */
export async function getConfig(id: string) {
  const configRef = await getConfigRef(id);
  return configRef.get()
}

/** Gets the config data from an instance of the Config document. */
export function getConfigData(config: firebase.firestore.DocumentSnapshot) {
  const configFromData = ((config && config.data()) || {}) as BranchManagerRepoConfig;
  return {...DEFAULT_CONFIG, ...configFromData};
}

/** Updates all the fields in the Config document.  */
export async function updateConfigRef(configRef: firebase.firestore.DocumentReference,
                                      newConfig: Partial<BranchManagerRepoConfig>) {
  const oldConfig = await configRef.get();
  if (!oldConfig.exists || JSON.stringify(oldConfig.data()) !== JSON.stringify(newConfig)) {
    configRef.set(newConfig);
  }
}

/** Determine if a label is one of the target labels based on the repos config. */
export async function getBranchByLabel(
    configId: string, label: string): Promise<BranchManagerRepoConfigBranch> {
  const configDoc = await getConfig(configId);
  return getConfigData(configDoc).branches.find(branch => branch.label === label);
}

// TODO(josephperrott): Decide if this method should just be getBranchByName.
/** Determine if a label is one of the target labels based on the repos config. */
export async function getBranchByBranchName(
    configId: string, branchName: string): Promise<BranchManagerRepoConfigBranch> {
  const configDoc = await getConfig(configId);
  return getConfigData(configDoc).branches.find(branch => branch.branchName === branchName);
}
