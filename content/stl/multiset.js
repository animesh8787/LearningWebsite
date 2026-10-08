registerLesson('multiset', {
  title: '<em>multiset:</em> a sorted bag with repeats',
  lead: 'A set that allows duplicates. Use it when you need the smallest and largest of a changing collection, including repeated values, and need to remove specific ones.',
  blocks: [
    { t: 'h2', text: 'A set, minus the uniqueness rule' },
    { t: 'levels',
      eli5: ['A shoebox of coins that is always sorted from smallest to biggest. You can drop in another 5-cent coin even if there is already one. You can take out any one coin, and you can always grab the smallest or the biggest instantly.'],
      plain: ['`multiset<T>` behaves exactly like `set<T>` (same sorted balanced tree, same O(log n) operations) but `insert` always succeeds, even for a value already present. Duplicates sit next to each other. `count(x)` can now be bigger than 1.'],
      tech: ['Same red-black tree. Equivalent keys are kept in insertion order among themselves (`insert` places the new element at the upper bound of its equal range). `equal_range(x)` returns the half-open range of all elements equivalent to `x`. Erasing by **key** removes every copy; erasing by **iterator** removes exactly one.'] },

    { t: 'code', file: 'multiset_basics.cpp', code: `#include <iostream>
#include <set>
using namespace std;

int main() {
    multiset<int> ms = {5, 1, 5, 3, 5};
    for (int x : ms) cout << x << " ";                    // 1 3 5 5 5
    cout << "\\n" << ms.count(5) << " " << ms.size() << "\\n";   // 3 5

    ms.erase(ms.find(5));                  // removes ONE 5   (erase by iterator)
    cout << ms.count(5) << "\\n";           // 2
    ms.erase(5);                           // removes ALL remaining 5s   (erase by key)
    cout << ms.count(5) << "\\n";           // 0

    ms.insert(2); ms.insert(2);
    auto range = ms.equal_range(2);        // [first 2, one past last 2)
    for (auto it = range.first; it != range.second; ++it) cout << *it << " ";   // 2 2
    cout << "\\n" << *ms.begin() << " " << *ms.rbegin() << "\\n";    // min and max
}` },
    { t: 'callout', kind: 'warn', html: '`ms.erase(value)` deletes **every** copy. To remove just one, erase through an iterator: `ms.erase(ms.find(value))`. This is the most common multiset bug.' },

    { t: 'h2', text: 'Pattern: a moving window you can query' },
    { t: 'p', html: 'When a window slides, you add one value and remove the one that left. A multiset keeps the window sorted, so the min and max are always at the ends (this also supports medians with an iterator trick).' },
    { t: 'code', file: 'window_minmax.cpp', code: `#include <iostream>
#include <set>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {4, 2, 12, 3, 8, 3};
    int k = 3;
    multiset<int> win;
    for (int i = 0; i < (int)a.size(); i++) {
        win.insert(a[i]);                                   // value enters
        if (i >= k) win.erase(win.find(a[i - k]));          // old value leaves: ONE copy only
        if (i >= k - 1) cout << *win.begin() << ".." << *win.rbegin() << " ";
    }
}` },
    { t: 'table', head: ['Need', 'Container'], rows: [
      ['sorted, duplicates kept, remove arbitrary elements', '`multiset`'],
      ['just counts of each value, ordered by value', '`map<T,int>`'],
      ['only want max (or min) and never remove arbitrary ones', '`priority_queue` (faster, simpler)'],
    ] },
    { t: 'callout', kind: 'interview', html: 'A `priority_queue` cannot delete arbitrary elements, a multiset can. If a sliding window problem needs min/max **and** removal of an element that is not the top, reach for `multiset` (or the monotonic deque if you only need the max/min).' },

    { t: 'quiz', q: '`multiset<int> m = {2, 2, 2}; m.erase(2); m.size()` gives?', opts: ['2', '1', '0', '3'], ans: 2,
      why: '`erase(key)` removes **all** elements equivalent to the key, leaving an empty multiset.' },
    { t: 'quiz', q: 'How do you remove exactly one copy of 7 from a multiset `m`?', opts: ['`m.erase(7)`', '`m.erase(m.find(7))`', '`m.remove(7)`', '`m.pop(7)`'], ans: 1,
      why: 'Erasing by iterator removes only that element. Make sure `find` did not return `end()` first.' },

    { t: 'recap', items: [
      'Explain multiset as a set that keeps duplicates.',
      'Remove one copy vs all copies correctly.',
      'Choose between multiset, map of counts, and priority_queue.',
    ] },
  ],
});
