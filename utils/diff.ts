export type DiffResult = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

// Simple word-based diffing function using Longest Common Subsequence (LCS)
export const generateDiff = (text1: string, text2: string): DiffResult[] => {
  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);

  const n = words1.length;
  const m = words2.length;

  // DP table for LCS lengths
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build the diff
  const diff: DiffResult[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      diff.unshift({ value: words1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ value: words2[j - 1], added: true });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ value: words1[i - 1], removed: true });
      i--;
    } else {
        // Should not happen
        break;
    }
  }

  return diff;
};