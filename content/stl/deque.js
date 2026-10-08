registerLesson('deque', {
  title: '<em>deque:</em> fast at both ends',
  lead: 'A vector is fast at the back but slow at the front. A deque (say “deck”) is fast at both, and still lets you index. The price is a more complicated insides.',
  blocks: [
    { t: 'h2', text: 'A row of small rooms' },
    { t: 'levels',
      eli5: ['Instead of one long hallway that must be moved when full, imagine a corridor of **small rooms**, each holding four items, plus a directory listing the rooms. To add on the left, you just open a new room on the left and update the directory. Nobody has to move.'],
      plain: ['A `deque<T>` (double-ended queue) stores its elements in several **fixed-size blocks** and keeps a small array (the **map**) of pointers to those blocks. `push_front` and `push_back` only touch the first or last block, adding a new block when needed. Existing elements never move, and indexing still works in O(1): block = `(i + offset) / blockSize`, slot = `(i + offset) % blockSize`.'],
      tech: ['libstdc++ uses 512-byte blocks; libc++ 4096 bytes; MSVC blocks are tiny (16 bytes), which makes it much slower there. Iterators are random-access but **not contiguous**, so `&dq[0]` + n is not valid. Insertions at either end invalidate iterators (but not references/pointers to elements); insertion in the middle invalidates everything. `std::queue` and `std::stack` use a `deque` as their default underlying container.'] },
    { t: 'p', html: 'Push to either end and watch blocks appear. Note nothing already stored ever shifts.' },
    { t: 'viz', kind: 'deqblocks', cfg: {} },

    { t: 'code', file: 'deque_basics.cpp', code: `#include <deque>
#include <iostream>
using namespace std;

int main() {
    deque<int> d = {2, 3, 4};
    d.push_front(1);              // 1 2 3 4        O(1)
    d.push_back(5);               // 1 2 3 4 5      O(1)
    d.pop_front();                // 2 3 4 5        O(1)
    d.pop_back();                 // 2 3 4          O(1)

    cout << d[1] << " " << d.front() << " " << d.back() << "\\n";   // 3 2 4
    d.insert(d.begin() + 1, 99);  // 2 99 3 4       O(n): shifts the nearer half

    for (int x : d) cout << x << " ";
}` },

    { t: 'h2', text: 'vector vs deque' },
    { t: 'table', head: ['', '`vector`', '`deque`'], rows: [
      ['push/pop at back', 'O(1) amortized', 'O(1)'],
      ['push/pop at **front**', '**O(n)**', '**O(1)**'],
      ['`d[i]`', 'O(1), very fast', 'O(1), a bit slower (two steps)'],
      ['Memory layout', 'one contiguous block', 'many blocks (not contiguous)'],
      ['Iteration speed', 'fastest (cache-friendly)', 'good'],
      ['Reallocation moves elements?', 'yes', '**no**'],
      ['`data()` pointer for C APIs', 'yes', 'no'],
    ] },
    { t: 'callout', kind: 'tip', html: 'Default to `vector`. Pick `deque` when you genuinely need both ends: sliding-window maximum (the **monotonic deque**), BFS variants (0-1 BFS), or a queue you also sometimes push to the front of.' },

    { t: 'h2', text: 'Sliding window maximum' },
    { t: 'p', html: 'The signature `deque` problem. Keep indices of candidate maxima in decreasing order of value: pop smaller ones from the **back**, expire old ones from the **front**. Every index enters and leaves once: O(n).' },
    { t: 'code', file: 'sliding_max.cpp', code: `#include <deque>
#include <iostream>
#include <vector>
using namespace std;

vector<int> maxWindow(const vector<int>& a, int k) {
    deque<int> dq;                                    // stores INDICES, values decreasing
    vector<int> out;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();   // smaller can never be max
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();      // front slid out of the window
        if (i >= k - 1) out.push_back(a[dq.front()]); // front is the window's max
    }
    return out;
}

int main() {
    for (int x : maxWindow({1, 3, -1, -3, 5, 3, 6, 7}, 3)) cout << x << " ";   // 3 3 5 5 6 7
}` },
    { t: 'callout', kind: 'interview', html: 'LeetCode 239 *Sliding Window Maximum* is the classic. The insight to say aloud: “each element is pushed once and popped once, so although there is a loop inside a loop, the total work is O(n).”' },

    { t: 'quiz', q: 'You must repeatedly remove the first element of a large sequence while appending to the end. Best container?', opts: ['`vector` with `erase(begin())`', '`deque` (or `queue`)', '`array`', '`set`'], ans: 1,
      why: '`vector::erase(begin())` shifts everything: O(n) each. A `deque` pops its front in O(1).' },
    { t: 'quiz', q: 'Why can a deque insert at the front without moving existing elements?', opts: ['It keeps spare space in front of one big array', 'It stores elements in separate blocks and just adds a new block via its map', 'It uses a linked list', 'It cannot'], ans: 1,
      why: 'The map of block pointers lets it prepend a new block. Existing blocks stay where they are.' },

    { t: 'recap', items: [
      'Explain the deque’s map-of-blocks structure and why both ends are O(1).',
      'Choose between `vector` and `deque`.',
      'Implement the monotonic-deque sliding window maximum.',
    ] },
  ],
});
