registerLesson('pick-container', {
  title: 'Which container? <em>A decision tree</em>',
  lead: 'Three questions answer it almost every time. Use the tool below until it becomes second nature, then keep the master table as your reference.',
  blocks: [
    { t: 'h2', text: 'Answer a few questions' },
    { t: 'viz', kind: 'decision', cfg: {} },

    { t: 'h2', text: 'The master complexity table' },
    { t: 'table', head: ['Container', 'Access by index', 'Search', 'Insert', 'Erase', 'Ordered?', 'Notes'], rows: [
      ['`vector`', '**O(1)**', 'O(n)', 'O(1) back / O(n) mid', 'O(1) back / O(n) mid', 'insertion order', 'the default; contiguous, cache-friendly'],
      ['`array`', '**O(1)**', 'O(n)', '—', '—', 'insertion order', 'fixed size at compile time'],
      ['`deque`', '**O(1)**', 'O(n)', 'O(1) both ends', 'O(1) both ends', 'insertion order', 'fast at front and back'],
      ['`list`', '—', 'O(n)', 'O(1) at iterator', 'O(1) at iterator', 'insertion order', 'stable iterators, slow in practice'],
      ['`stack` / `queue`', '—', '—', 'O(1)', 'O(1)', 'LIFO / FIFO', 'adapters; top / front only'],
      ['`priority_queue`', '—', '—', 'O(log n)', 'O(log n) (top only)', 'top is max', 'heap; `top()` is O(1)'],
      ['`set` / `multiset`', '—', '**O(log n)**', 'O(log n)', 'O(log n)', '**sorted**', 'balanced tree; `lower_bound`'],
      ['`map` / `multimap`', '`m[k]` O(log n)', '**O(log n)**', 'O(log n)', 'O(log n)', '**sorted by key**', 'key → value'],
      ['`unordered_set`', '—', '**O(1)** avg', 'O(1) avg', 'O(1) avg', 'no order', 'hash table; O(n) worst'],
      ['`unordered_map`', '`m[k]` O(1) avg', '**O(1)** avg', 'O(1) avg', 'O(1) avg', 'no order', 'hash table; O(n) worst'],
    ] },

    { t: 'h2', text: 'Three rules that cover most cases' },
    { t: 'ul', ordered: true, items: [
      '**Start with `vector`.** Contiguous memory beats clever structures for all but the largest inputs. Change only when a *specific* operation is too slow.',
      '**Need fast lookup by key?** `unordered_map` / `unordered_set` by default. Use `map` / `set` when you need **sorted order, ranges, or neighbours** (`lower_bound`), or when the key has no hash.',
      '**Need the best element repeatedly?** `priority_queue`. Need order **and** removal of arbitrary items? `set` / `multiset`.',
    ] },
    { t: 'callout', kind: 'tip', html: 'Not sure? Think about the **dominant operation** in your solution. If it is “look up a key”: hash. “Get the next smallest”: heap. “Walk in sorted order or find the neighbour”: tree. “Index and scan”: vector.' },

    { t: 'h2', text: 'Quick scenarios' },
    { t: 'table', head: ['Scenario', 'Container', 'Why'], rows: [
      ['Count word frequencies', '`unordered_map<string,int>`', 'key → count, O(1)'],
      ['Print word frequencies alphabetically', '`map<string,int>`', 'sorted iteration for free'],
      ['Remove duplicates, order irrelevant', '`unordered_set`', 'O(1) membership'],
      ['Remove duplicates and keep sorted', '`set`', 'unique + sorted'],
      ['BFS on a grid', '`queue<pair<int,int>>`', 'FIFO frontier'],
      ['Undo history / bracket matching', '`stack`', 'LIFO'],
      ['Running median', 'two `priority_queue`s', 'max-heap + min-heap'],
      ['Interval scheduling timeline', '`map<int,int>` or sorted `vector`', 'ordered events'],
      ['LRU cache', '`list` + `unordered_map`', 'O(1) reorder + O(1) lookup'],
      ['Sliding window maximum', '`deque`', 'pop from both ends'],
    ] },

    { t: 'quiz', q: 'You need to repeatedly find the smallest stored number that is greater than x, while inserting new numbers. Which?', opts: ['`unordered_set`', '`set` with `upper_bound`', '`stack`', '`vector` with `push_back`'], ans: 1,
      why: 'An ordered tree supports insertion and `upper_bound` in O(log n) each.' },
    { t: 'quiz', q: 'You only count how many times each string appears and never need sorted output. Which?', opts: ['`map<string,int>`', '`unordered_map<string,int>`', '`vector<string>`', '`list<string>`'], ans: 1,
      why: 'No ordering requirement means the hash table wins: O(1) average per update.' },

    { t: 'recap', items: [
      'Choose a container from the operation you perform most.',
      'Recall the complexities of every container from the master table.',
      'Default to vector and unordered_map, and justify every deviation.',
    ] },
  ],
});
