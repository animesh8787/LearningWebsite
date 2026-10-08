registerLesson('queue', {
  title: '<em>queue:</em> first in, first out',
  lead: 'A line at a shop: whoever arrives first is served first. This is the structure behind breadth-first search, task scheduling and anything that must be fair.',
  blocks: [
    { t: 'h2', text: 'A line of people' },
    { t: 'levels',
      eli5: ['A queue at a ticket counter. New people join at the **back**. The person at the **front** is served and leaves. Nobody can cut in, and nobody leaves from the middle.'],
      plain: ['`queue<T>` has a **front** and a **back**. `push` adds at the back, `pop` removes from the front, `front()` and `back()` peek at the ends. All are **O(1)**. Like `stack` it is an adapter over a `deque` and offers no indexing or iteration.'],
      tech: ['`std::queue<T, Container = deque<T>>` forwards `push` → `push_back`, `pop` → `pop_front`. A `vector` cannot back it (no O(1) `pop_front`); a `list` can. A common hand-rolled alternative for BFS is a `vector` plus a `head` index that just advances, avoiding any pop. Circular buffers give a fixed-capacity queue with no allocation.'] },

    { t: 'viz', kind: 'array', cfg: { title: 'enqueue at the back, dequeue at the front', arr: [], addr: false,
      code: `queue<int> q;
q.push(1);
q.push(2);
q.push(3);
q.front();     // 1
q.pop();
q.push(4);`,
      steps: [
        { line: 1, note: 'An empty queue.' },
        { line: 2, push: 1, ptr: { front: 0, back: 0 }, note: 'The first arrival is both front and back.' },
        { line: 3, push: 2, ptr: { front: 0, back: 1 }, note: '`push(2)` joins at the **back**.' },
        { line: 4, push: 3, ptr: { front: 0, back: 2 }, note: 'And 3 behind it.' },
        { line: 5, hl: [0], ptr: { front: 0, back: 2 }, note: '`front()` is **1**, the one who has waited longest.' },
        { line: 6, shift: true, ptr: { front: 0, back: 1 }, note: '`pop()` serves the front. 1 leaves; 2 becomes the new front.' },
        { line: 7, push: 4, ptr: { front: 0, back: 2 }, note: 'A new arrival always goes to the back. First in, first out.' },
      ] } },

    { t: 'code', file: 'queue_basics.cpp', code: `#include <iostream>
#include <queue>
using namespace std;

int main() {
    queue<int> q;
    q.push(10); q.push(20); q.push(30);
    cout << q.front() << " " << q.back() << " " << q.size() << "\\n";   // 10 30 3

    while (!q.empty()) {
        cout << q.front() << " ";      // 10 20 30  (same order they came in)
        q.pop();
    }
}` },
    { t: 'callout', kind: 'warn', html: 'Same rule as stack: `front()` / `pop()` on an empty queue is **undefined behavior**. And `pop()` returns nothing: read `front()` first.' },

    { t: 'h2', text: 'The big one: breadth-first search' },
    { t: 'p', html: 'BFS explores a graph **level by level**: everything 1 step away, then everything 2 steps away. A queue enforces exactly that order, because nodes discovered earlier are processed earlier. That makes BFS find the **shortest path** in an unweighted graph.' },
    { t: 'code', file: 'bfs_grid.cpp', std17: true, code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int shortestPath(const vector<vector<int>>& g, pair<int,int> s, pair<int,int> t) {
    int R = g.size(), C = g[0].size();
    vector<vector<int>> dist(R, vector<int>(C, -1));      // -1 = not visited
    queue<pair<int,int>> q;
    dist[s.first][s.second] = 0;
    q.push(s);
    int dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        if (make_pair(r, c) == t) return dist[r][c];
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;   // stay inside
            if (g[nr][nc] == 1 || dist[nr][nc] != -1) continue;     // wall or seen
            dist[nr][nc] = dist[r][c] + 1;                          // one step further than its parent
            q.push({nr, nc});
        }
    }
    return -1;                                                      // unreachable
}

int main() {
    vector<vector<int>> g = {{0, 0, 0}, {1, 1, 0}, {0, 0, 0}};      // 1 = wall
    cout << shortestPath(g, {0, 0}, {2, 0}) << "\\n";                // 6
}` },
    { t: 'table', head: ['Problem', 'Why a queue'], rows: [
      ['Shortest path in a grid / unweighted graph', 'level-by-level exploration'],
      ['Level-order traversal of a tree', 'process a whole level, then the next'],
      ['Rotting Oranges, 01 Matrix (multi-source BFS)', 'start with many sources in the queue at once'],
      ['Topological sort (Kahn)', 'process nodes whose in-degree hit zero'],
      ['Task scheduling / round robin', 'fairness: first come, first served'],
      ['Sliding window max (needs deque)', 'queue with both ends'],
    ] },
    { t: 'code', file: 'level_order.cpp', run: false, code: `// Level-order pattern: capture the queue size before looping so you
// know where one level ends and the next begins.
while (!q.empty()) {
    int levelSize = q.size();              // number of nodes on THIS level
    for (int i = 0; i < levelSize; i++) {
        auto cur = q.front(); q.pop();
        // ... process cur, push its children ...
    }
    steps++;                               // finished one whole level
}` },
    { t: 'callout', kind: 'interview', html: 'Mark nodes as visited **when you push them**, not when you pop them. Otherwise the same node can be pushed many times and BFS balloons from O(V+E) to something much worse.' },

    { t: 'quiz', q: 'Why does BFS use a queue instead of a stack?', opts: ['Queues are faster', 'FIFO order explores nodes closest to the start first, giving shortest paths', 'A stack cannot hold pairs', 'No reason'], ans: 1,
      why: 'Nodes found earlier are nearer to the start, and FIFO processes them earlier, so exploration proceeds by increasing distance.' },
    { t: 'quiz', q: 'After `push(5) push(6) push(7) pop() push(8)` what are `front()` and `back()`?', opts: ['5 and 8', '6 and 8', '6 and 7', '8 and 6'], ans: 1,
      why: 'Queue: 5 6 7 → pop removes 5 → 6 7 → push 8 → 6 7 8. Front 6, back 8.' },

    { t: 'recap', items: [
      'Use push/front/back/pop and know they are O(1) FIFO.',
      'Write BFS with a queue and a visited / distance array.',
      'Do level-order processing by capturing the queue size.',
    ] },
  ],
});
