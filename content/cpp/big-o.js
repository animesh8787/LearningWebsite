registerLesson('big-o', {
  title: 'Big-O in <em>plain English</em>',
  lead: 'Two programs can both give the right answer, yet one finishes in a blink and the other takes a year. Big-O is the tool for seeing that difference before you run anything.',
  blocks: [
    { t: 'h2', text: 'How the work grows' },
    { t: 'levels',
      eli5: ['Finding a name in a phone book. If you check **every page**, a book twice as thick takes twice as long. If you open it in the middle and keep halving, doubling the book adds only **one more step**. Big-O describes that: how much *extra* work do I need when the job gets bigger?'],
      plain: ['Big-O describes how the number of steps **grows as the input size `n` grows**, ignoring small details. We drop constants and lesser terms: `3n + 10` steps is just **O(n)**. We care about the shape of the curve, because for big inputs the shape dominates everything else.'],
      tech: ['`f(n) = O(g(n))` means there exist constants `c` and `n₀` such that `f(n) ≤ c·g(n)` for all `n ≥ n₀`: an asymptotic **upper bound**. It abstracts away machine speed and constant factors. Big-O usually describes the **worst case**; **amortized** analysis averages cost over a sequence (e.g. `vector::push_back` is O(1) amortized); **space complexity** counts extra memory the same way.'] },

    { t: 'h2', text: 'See the curves' },
    { t: 'p', html: 'Drag **n** and compare how many steps each growth rate needs. The right-hand label tells you whether a typical judge (≈10⁸ simple operations per second) would finish in time.' },
    { t: 'viz', kind: 'bigo', cfg: {} },

    { t: 'h2', text: 'The classes you will meet' },
    { t: 'table', head: ['Class', 'Name', 'Example', 'Max n (≈1 s)'], rows: [
      ['`O(1)`', 'constant', 'array index, `unordered_map` lookup', 'any'],
      ['`O(log n)`', 'logarithmic', 'binary search, `map` lookup, heap push', '10¹⁸'],
      ['`O(n)`', 'linear', 'one loop over the data, `vector` search', '10⁷ – 10⁸'],
      ['`O(n log n)`', 'linearithmic', '`sort`, merge sort', '≈ 10⁶'],
      ['`O(n²)`', 'quadratic', 'two nested loops, bubble sort', '≈ 10⁴'],
      ['`O(2ⁿ)`', 'exponential', 'all subsets, naive Fibonacci', '≈ 25'],
      ['`O(n!)`', 'factorial', 'all permutations', '≈ 10'],
    ] },
    { t: 'callout', kind: 'interview', html: 'In contests, work **backwards from the limits**: if `n ≤ 10⁵`, an O(n²) solution (10¹⁰ steps) will time out, so you need O(n log n) or better. Constraints are a hint about the intended algorithm.' },

    { t: 'h2', text: 'Reading complexity from code' },
    { t: 'code', file: 'complexity.cpp', run: false, code: `// O(1): the work does not depend on n
int first(const vector<int>& v) { return v[0]; }

// O(n): one pass
int sum(const vector<int>& v) {
    int s = 0;
    for (int x : v) s += x;                  // n iterations
    return s;
}

// O(n^2): a loop inside a loop
bool hasDup(const vector<int>& v) {
    for (size_t i = 0; i < v.size(); i++)
        for (size_t j = i + 1; j < v.size(); j++)    // ~ n*n/2 pairs
            if (v[i] == v[j]) return true;
    return false;
}

// O(n): the same job with a hash set (trade memory for time)
bool hasDup2(const vector<int>& v) {
    unordered_set<int> seen;
    for (int x : v) { if (!seen.insert(x).second) return true; }   // each step O(1) on average
    return false;
}

// O(log n): halve the problem each step
int halvings(int n) { int c = 0; while (n > 1) { n /= 2; c++; } return c; }` },
    { t: 'ul', items: [
      '**Sequential** blocks **add**: O(n) then O(n) is O(n + n) = O(n).',
      '**Nested** loops **multiply**: n × n = O(n²).',
      'Throw away constants and the smaller term: O(2n + 50) → O(n); O(n² + n) → O(n²).',
      'Different inputs get different letters: looping over an `n × m` grid is O(n·m), not O(n²).',
    ] },

    { t: 'h2', text: 'Time vs space' },
    { t: 'p', html: 'You can often make a program faster by spending memory. `hasDup2` uses O(n) extra space to turn O(n²) into O(n). Recursion also costs space: a recursion of depth `d` uses O(d) stack. Always ask: **time and space?**' },

    { t: 'quiz', q: 'What is the complexity of: `for (i=0;i<n;i++) for (j=0;j<n;j++) work();` followed by `for (k=0;k<n;k++) work();`?', opts: ['O(n)', 'O(n²)', 'O(n²) + O(n) which simplifies to O(n²)', 'O(n³)'], ans: 2,
      why: 'Nested gives n², the extra loop gives n, and the sum is n² + n. We keep only the dominant term: **O(n²)**.' },
    { t: 'quiz', q: 'n = 10⁵. Which complexity is realistically too slow for a 1-second limit?', opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], ans: 2,
      why: 'n² = 10¹⁰ operations, about 100 seconds at 10⁸ per second. O(n log n) is only ~1.7 million.' },

    { t: 'recap', items: [
      'Explain Big-O as the growth rate of work versus input size.',
      'Place common operations on the scale from O(1) to O(n!).',
      'Read the complexity off loops: add sequences, multiply nests, drop constants.',
      'Use input limits to guess how fast your solution must be.',
    ] },
  ],
});
