// A simple line-by-line diff implementation to avoid adding new dependencies.
export type DiffLine = {
  type: 'added' | 'removed' | 'equal';
  line: string;
};

export const generateDiff = (textA: string, textB: string): DiffLine[] => {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const matrix = Array(linesA.length + 1).fill(null).map(() => Array(linesB.length + 1).fill(0));

  for (let i = 1; i <= linesA.length; i++) {
    for (let j = 1; j <= linesB.length; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        matrix[i][j] = 1 + matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = linesA.length;
  let j = linesB.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.unshift({ type: 'equal', line: linesA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      result.unshift({ type: 'added', line: linesB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      result.unshift({ type: 'removed', line: linesA[i - 1] });
      i--;
    }
  }
  return result;
};
