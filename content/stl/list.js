registerLesson('list', {
  title: '<em>list</em> and forward_list',
  lead: 'A chain of separate nodes joined by pointers. Insertion anywhere is cheap once you are there, but everything else is slower than you would expect. Know it, then mostly avoid it.',
  blocks: [
    { t: 'h2', text: 'A treasure hunt of notes' },
    { t: 'levels',
      eli5: ['A treasure hunt: each clue (a **node**) holds a prize and says where the next clue is. To add a clue in the middle you only rewrite two notes. But to find the 100th clue you must follow 99 notes, because there is no map.'],
      plain: ['`list<T>` is a **doubly linked list**: every element lives in its own heap-allocated node holding the value plus pointers to the previous and next node. Inserting or erasing at a position you already hold an iterator to just rewires a few pointers: **O(1)**, with no shifting. The downside: no `[]` indexing (finding position `i` takes O(i)), each element costs an extra allocation, and nodes are scattered in memory, which is slow for the CPU cache.'],
      tech: ['Each node of `std::list` carries `prev`/`next` plus the value (24 bytes overhead on 64-bit) and is individually allocated; `forward_list` drops `prev` (singly linked, 8 bytes overhead, forward iteration only). Iterators and references to elements stay valid across insertion and across erasure of other elements, which no other sequence container guarantees. `splice` transfers nodes between lists in O(1) without copying, and `list::sort` is a stable merge sort in O(n log n), since `std::sort` needs random access.'] },
    { t: 'p', html: 'Select a node and insert or erase. Notice the **addresses never change**: nodes do not move.' },
    { t: 'viz', kind: 'listviz', cfg: {} },

    { t: 'code', file: 'list_basics.cpp', code: `#include <iostream>
#include <list>
using namespace std;

int main() {
    list<int> l = {1, 2, 3};
    l.push_front(0);                      // 0 1 2 3      O(1)
    l.push_back(4);                       // 0 1 2 3 4    O(1)

    auto it = l.begin();
    advance(it, 2);                       // walk 2 steps: O(n) -- no it + 2 for lists
    l.insert(it, 99);                     // 0 1 99 2 3 4   O(1) at the iterator
    it = l.erase(it);                     // removes the 2; returns the next iterator
    cout << *it << "\\n";                  // 3

    l.remove(99);                         // remove ALL elements equal to 99
    l.sort();                             // member sort: std::sort needs random access
    l.reverse();
    for (int x : l) cout << x << " ";     // 4 3 1 0

    list<int> other = {7, 8};
    l.splice(l.end(), other);             // move other's nodes into l, O(1), no copying
    cout << other.size() << " " << l.size() << "\\n";   // 0 6
}` },

    { t: 'h2', text: 'The honest comparison' },
    { t: 'table', head: ['', '`vector`', '`list`'], rows: [
      ['`v[i]`', 'O(1)', '✗ not available (O(i) to walk)'],
      ['insert/erase at a known position', 'O(n) (shifts)', '**O(1)**'],
      ['find a position', 'O(1) by index', 'O(n)'],
      ['memory per element', 'just the value', 'value + 2 pointers + allocator overhead'],
      ['iteration speed', 'very fast (contiguous)', 'slow (pointer chasing, cache misses)'],
      ['iterators after insert/erase', 'invalidated', '**stay valid**'],
    ] },
    { t: 'callout', kind: 'warn', html: 'In practice a `vector` often beats a `list` **even for middle insertions**, because shifting a block of contiguous memory is so cache-friendly that it outruns chasing pointers until n is very large. Reach for `list` only when you need stable iterators or O(1) `splice`.' },

    { t: 'h2', text: 'LRU cache: where lists earn their keep' },
    { t: 'p', html: 'An LRU cache needs “move this item to the front” in O(1). Combine a `list` (order of use) with an `unordered_map` (key → iterator into the list). The stable iterators and O(1) splice make it work.' },
    { t: 'code', file: 'lru.cpp', code: `#include <iostream>
#include <list>
#include <unordered_map>
using namespace std;

class LRU {
    int cap;
    list<pair<int, int>> order;                                 // front = most recently used
    unordered_map<int, list<pair<int, int>>::iterator> where;   // key -> node in the list
public:
    LRU(int c) : cap(c) {}
    int get(int k) {
        auto f = where.find(k);
        if (f == where.end()) return -1;
        order.splice(order.begin(), order, f->second);          // move node to front: O(1), iterator stays valid
        return f->second->second;
    }
    void put(int k, int v) {
        auto f = where.find(k);
        if (f != where.end()) { f->second->second = v; order.splice(order.begin(), order, f->second); return; }
        if ((int)order.size() == cap) { where.erase(order.back().first); order.pop_back(); }   // evict oldest
        order.push_front({k, v});
        where[k] = order.begin();
    }
};

int main() {
    LRU c(2);
    c.put(1, 10); c.put(2, 20);
    cout << c.get(1) << "\\n";     // 10 (1 is now most recent)
    c.put(3, 30);                  // evicts 2
    cout << c.get(2) << "\\n";     // -1
}` },
    { t: 'callout', kind: 'interview', html: 'LeetCode 146 *LRU Cache* is the canonical use of `list`. Say: “hash map for O(1) lookup, linked list for O(1) reordering; I store list iterators in the map, and `splice` keeps them valid.”' },

    { t: 'quiz', q: 'Which is NOT available on `std::list`?', opts: ['`push_front`', '`insert(it, x)`', '`l[3]`', '`splice`'], ans: 2,
      why: 'There is no random access, since the nodes are not contiguous. You must walk with an iterator.' },
    { t: 'quiz', q: 'You hold an iterator to the 5th element of a list and erase the 2nd element. What happens to your iterator?', opts: ['It is invalid', 'It remains valid', 'It points to the 4th element', 'It becomes end()'], ans: 1,
      why: 'Erasing a **different** node leaves all other iterators and references valid. This stability is the list’s special strength.' },

    { t: 'recap', items: [
      'Describe a list as heap-allocated nodes with prev/next pointers.',
      'State its trade-offs honestly: O(1) splice/insert at an iterator, but no indexing and poor cache use.',
      'Recognize the LRU cache pattern (hash map + list).',
    ] },
  ],
});
