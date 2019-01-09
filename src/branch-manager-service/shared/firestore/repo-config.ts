import {firestore} from '../firebase';

/** A branch from the repo config for the branch manager. */
export interface BranchManagerRepoConfigBranch {
  branchName: string;
  label: string;
}

/** The configuration for the branch manager. */
export interface BranchManagerRepoConfig {
  enabled: boolean;
  branches: Array<BranchManagerRepoConfigBranch>;
}

/** The default configuration to build other configurations from. */
const DEFAULT_CONFIG: BranchManagerRepoConfig = {
  enabled: false,
  branches: [],
};

/** Gets a instance of the Config document. */
export async function getConfig(repoId: number) {
  const configRef = await firestore.collection('repo_configs').doc(`${repoId}`);
  const configDoc = await configRef.get();
  return {...DEFAULT_CONFIG, ...configDoc.data()} as BranchManagerRepoConfig;
}

/** Updates all the fields in the Config document.  */
export async function updateConfig(repoId: number,
                                   newConfig: Partial<BranchManagerRepoConfig>) {
  const configRef = await firestore.collection('repo_configs').doc(`${repoId}`);
  const configDoc = await configRef.get();
  if (!configDoc.exists || JSON.stringify(configDoc.data()) !== JSON.stringify(newConfig)) {
    configRef.set(newConfig, {merge: true});
  }
}

/** Determine if a label is one of the target labels based on the repos config. */
export async function getBranchByLabel(
    repoId: number, label: string): Promise<BranchManagerRepoConfigBranch> {
  const config = await getConfig(repoId);
  return config.branches.find(branch => branch.label === label);
}

// TODO(josephperrott): Decide if this method should just be getBranchByName.
/** Determine if a label is one of the target labels based on the repos config. */
export async function getBranchByBranchName(
    repoId: number, branch: string): Promise<BranchManagerRepoConfigBranch> {
  const config = await getConfig(repoId);
  return config.branches.find(target => target.branchName === branch);
}
