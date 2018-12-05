
/** The configuration for the branch manager. */
export interface BranchManagerRepoConfig {
  enabled: boolean;
  branches: Array<{
    branch: string;
    label: string;
  }>;
};
