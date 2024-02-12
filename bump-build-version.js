import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

function getGitBranch() {
  try {
    // Get the current Git branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    return branch;
  } catch (error) {
    console.error('Error getting Git branch:', error.message);
    process.exit(1);
  }
}

function getCommitCount() {
  try {
    // Get the number of commits on the current branch
    const commitCount = execSync('git rev-list --count HEAD').toString().trim();
    return commitCount;
  } catch (error) {
    console.error('Error getting commit count:', error.message);
    process.exit(1);
  }
}

function generateBuildNumber(branch, commitCount) {
  // Replace special characters in branch name with underscores
  const sanitizedBranch = branch.replace(/[^a-zA-Z0-9]/g, '_');

  // Combine branch name and commit count to create a unique build number
  const buildNumber = `${sanitizedBranch}-C${commitCount}`;

  return buildNumber;
}

// Get the current Git branch
const currentBranch = getGitBranch();

// Get the number of commits on the current branch
const commitCount = getCommitCount();

// Generate build number based on the branch name and commit count
const buildNumber = generateBuildNumber(currentBranch, commitCount);

const pjson = JSON.parse(readFileSync('./package.json', 'utf8'));
pjson.buildNumber = buildNumber;
writeFileSync('./package.json', JSON.stringify(pjson, null, 2));

console.log('Build Number:', buildNumber);
