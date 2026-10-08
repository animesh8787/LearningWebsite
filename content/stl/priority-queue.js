registerLesson('priority-queue', {
  title: '<em>priority_queue:</em> always the best next',
  lead: 'A line where the most important person is always served first, whenever they arrived. It is a heap in disguise, and it powers top-K, Dijkstra, scheduling and merging.',
  blocks: [
    { t: 'h2', text: 'The VIP line' },
    { t: 'levels',
      eli5: ['An emergency room. People are not seen in the order they arrive but by **how urgent** they are. A new, more urgent patient jumps to the front. The doctor always asks one question: “who is the most urgent right now?”'],
      plain: ['`priority_queue<T>` lets you `push` any element and always gives back the **largest** one with `top()` / `pop()`. It does not keep everything sorted (that would be wasteful); it only keeps the biggest ready. Pushing and popping cost **O(log n)**, and peeking at the top is **O(1)**. The default is a **max-heap**; flip it with `greater<T>` for a min-heap.'],
      tech: ['It is an adapter over a `vector` that maintains the **binary heap** invariant using `push_heap` / `pop_heap`: every parent is ≥ its children (for the default `less<T>`). The complete-binary-tree shape lets the tree live in an array: children of `i` at `2i+1`, `2i+2`. `make_heap` builds a heap from n items in O(n). There are no iterators and no `decrease-key`, so Dijkstra uses the “lazy deletion” variant (push duplicates, skip stale entries).'] },

    { t: 'h2', text: 'The heap, shown as a tree and as an array' },
    { t: 'p', html: 'Push values and watch them **sift up** the highlighted path; pop and watch the last element sift **down**. Toggle between max- and min-heap.' },
    { t: 'viz', kind: 'heaptree', cfg: { items: [50, 30, 40, 10, 20], next: 45 } },

    { t: 'code', file: 'pq_basics.cpp', code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    priority_queue<int> maxh;                 // max-heap (default)
    for (int x : {5, 1, 8, 3}) maxh.push(x);
    cout << maxh.top() << "\\n";               // 8
    maxh.pop();
    cout << maxh.top() << " " << maxh.size() << "\\n";   // 5 3

    priority_queue<int, vector<int>, greater<int>> minh;   // MIN-heap
    for (int x : {5, 1, 8, 3}) minh.push(x);
    cout << minh.top() << "\\n";               // 1

    // pairs compare by first, then second: a ready-made (priority, payload)
    priority_queue<pair<int, string>> tasks;
    tasks.push({2, "email"}); tasks.push({9, "fire!"}); tasks.push({5, "lunch"});
    cout << tasks.top().second << "\\n";       // fire!

    // custom order with a lambda: shortest string first
    auto cmp = [](const string& a, const string& b) { return a.size() > b.size(); };
    priority_queue<string, vector<string>, decltype(cmp)> byLen(cmp);
    byLen.push("banana"); byLen.push("fig"); byLen.push("apple");
    cout << byLen.top() << "\\n";              // fig
}` },
    { t: 'table', head: ['Operation', 'Cost'], rows: [
      ['`top()`', 'O(1)'],
      ['`push(x)`', 'O(log n)'],
      ['`pop()`', 'O(log n)'],
      ['build from n items (`make_heap` / range constructor)', 'O(n)'],
      ['search / iterate / change a priority', '✗ not supported'],
    ] },
    { t: 'callout', kind: 'warn', html: 'Default = **max**-heap, the opposite of what many people expect. For “smallest first” you must write `priority_queue<int, vector<int>, greater<int>>`. A handy shortcut: push **negatives** into the default heap and negate on the way out.' },

    { t: 'h2', text: 'Pattern 1: top-K elements' },
    { t: 'p', html: 'To keep the **K largest** of a stream, hold a **min**-heap of size K. If a new value beats the smallest of your K, swap it in. Memory O(K), time O(n log K), much better than sorting everything when K is small.' },
    { t: 'code', file: 'top_k.cpp', code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

vector<int> topK(const vector<int>& a, int k) {
    priority_queue<int, vector<int>, greater<int>> h;   // min-heap holding the K best so far
    for (int x : a) {
        h.push(x);
        if ((int)h.size() > k) h.pop();                 // evict the smallest of the K+1
    }
    vector<int> out;
    while (!h.empty()) { out.push_back(h.top()); h.pop(); }
    return out;                                         // ascending
}

int main() {
    for (int x : topK({7, 2, 9, 4, 11, 5}, 3)) cout << x << " ";   // 7 9 11
}` },

    { t: 'h2', text: 'Pattern 2: Dijkstra’s shortest path' },
    { t: 'p', html: 'Always expand the **closest unfinished node**. A min-heap of `(distance, node)` gives exactly that in O(log n). Because pairs compare by `first`, distance goes first.' },
    { t: 'code', file: 'dijkstra.cpp', code: `#include <climits>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n = 5;
    vector<vector<pair<int,int>>> adj(n);                 // adj[u] = list of (neighbour, weight)
    auto edge = [&](int u, int v, int w) { adj[u].push_back({v, w}); adj[v].push_back({u, w}); };
    edge(0, 1, 4); edge(0, 2, 1); edge(2, 1, 2); edge(1, 3, 1); edge(2, 3, 5); edge(3, 4, 3);

    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;   // (dist, node)
    dist[0] = 0; pq.push({0, 0});
    while (!pq.empty()) {
        pair<int,int> top = pq.top(); pq.pop();
        int d = top.first, u = top.second;
        if (d > dist[u]) continue;                        // stale entry: a shorter path was found already
        for (auto& e : adj[u]) {
            int v = e.first, w = e.second;
            if (d + w < dist[v]) { dist[v] = d + w; pq.push({dist[v], v}); }
        }
    }
    for (int d : dist) cout << d << " ";                  // 0 3 1 4 7
}` },
    { t: 'table', head: ['Problem', 'Heap idea'], rows: [
      ['Kth Largest Element', 'min-heap of size K'],
      ['Top K Frequent Elements', 'count with a map, then heap of (count, value)'],
      ['Merge K Sorted Lists', 'heap of the current head of each list'],
      ['Find Median from a Data Stream', 'a max-heap (lower half) and a min-heap (upper half)'],
      ['Task Scheduler / CPU scheduling', 'always run the most frequent remaining task'],
      ['Dijkstra, Prim’s MST', 'min-heap of (cost, node)'],
      ['Meeting Rooms II', 'min-heap of end times'],
    ] },
    { t: 'callout', kind: 'interview', html: 'Say the two-heap median trick out loud: “a max-heap for the smaller half, a min-heap for the larger half, kept within one element of each other. The median is on top of one or the average of both.” Insert O(log n), median O(1).' },

    { t: 'quiz', q: 'Which declaration gives you a **min**-heap of ints?', opts: ['`priority_queue<int> pq;`', '`priority_queue<int, vector<int>, greater<int>> pq;`', '`priority_queue<int, less<int>> pq;`', '`min_priority_queue<int> pq;`'], ans: 1,
      why: 'The default comparator is `less<int>`, which makes a max-heap. `greater<int>` flips it so the smallest value is on top.' },
    { t: 'quiz', q: 'You need the 10 largest of 10 million numbers. Which is best?', opts: ['Sort everything: O(n log n)', 'A min-heap of size 10: O(n log 10)', 'A `set` of all numbers', 'A `list`'], ans: 1,
      why: 'Keeping only a 10-element min-heap costs O(n log K) time and just O(K) memory.' },

    { t: 'recap', items: [
      'Describe a heap as a complete tree stored in an array, with sift-up and sift-down.',
      'Declare max-heaps and min-heaps, and use pairs and lambdas as priorities.',
      'Apply the top-K and Dijkstra patterns.',
    ] },
  ],
});
