registerLesson('cheatsheet', {
  title: 'The <em>cheat sheet</em>',
  lead: 'Everything you need at a glance: headers, declarations, the operations you use daily, and a one-page template for contests and interviews. Print this page with Ctrl+P.',
  blocks: [
    { t: 'h2', text: 'Headers' },
    { t: 'table', head: ['Header', 'Gives you'], rows: [
      ['`<vector>` `<string>` `<array>` `<deque>` `<list>`', 'sequence containers'],
      ['`<stack>` `<queue>`', '`stack`, `queue`, and `priority_queue` (in `<queue>`)'],
      ['`<set>` `<map>`', '`set`, `multiset`, `map`, `multimap`'],
      ['`<unordered_set>` `<unordered_map>`', 'hash containers'],
      ['`<algorithm>`', '`sort`, `find`, `lower_bound`, `reverse`, `unique`, `max_element`, `count`, …'],
      ['`<numeric>`', '`accumulate`, `iota`, `partial_sum`, `gcd`, `lcm`'],
      ['`<utility>` `<tuple>`', '`pair`, `move`, `swap`, `tuple`'],
      ['`<climits>` `<cmath>`', '`INT_MAX`, `LLONG_MAX`; `sqrt`, `pow`, `abs`, `ceil`'],
      ['`<bits/stdc++.h>`', 'GCC only: everything (handy in contests, not portable)'],
    ] },

    { t: 'h2', text: 'Declarations' },
    { t: 'code', file: 'declarations.cpp', run: false, code: `vector<int> v;                      vector<int> v(n, 0);              vector<vector<int>> g(R, vector<int>(C));
string s;                           array<int, 26> cnt = {};          deque<int> dq;           list<int> l;
stack<int> st;                      queue<int> q;
priority_queue<int> maxh;           priority_queue<int, vector<int>, greater<int>> minh;
set<int> s;   multiset<int> ms;     map<string, int> m;   multimap<int, int> mm;
unordered_set<int> us;              unordered_map<string, int> um;
pair<int, int> p = {a, b};          tuple<int, string, double> t;
auto [x, y] = p;                    // C++17 structured binding` },

    { t: 'h2', text: 'Operations by container' },
    { t: 'table', head: ['Container', 'Add', 'Remove', 'Access / query', 'Cost'], rows: [
      ['`vector`', '`push_back`, `insert(it,x)`, `emplace_back`', '`pop_back`, `erase(it)`, `clear`', '`v[i]`, `front`, `back`, `size`, `empty`', 'back O(1), mid O(n)'],
      ['`string`', '`+=`, `push_back`, `insert`', '`pop_back`, `erase`', '`s[i]`, `substr`, `find`', 'as vector; `substr` O(len)'],
      ['`deque`', '`push_front`, `push_back`', '`pop_front`, `pop_back`', '`d[i]`, `front`, `back`', 'both ends O(1)'],
      ['`list`', '`push_*`, `insert(it,x)`, `splice`', '`pop_*`, `erase(it)`, `remove(x)`', 'iterators only', 'O(1) at iterator'],
      ['`stack`', '`push`', '`pop`', '`top`', 'O(1)'],
      ['`queue`', '`push`', '`pop`', '`front`, `back`', 'O(1)'],
      ['`priority_queue`', '`push`', '`pop`', '`top`', 'push/pop O(log n)'],
      ['`set` / `multiset`', '`insert`', '`erase(key / it)`', '`find`, `count`, `lower_bound`, `upper_bound`, `begin`, `rbegin`', 'O(log n)'],
      ['`map`', '`m[k]=v`, `insert`, `emplace`', '`erase(k)`', '`m[k]`⚠, `at`, `find`, `count`, `lower_bound`', 'O(log n)'],
      ['`unordered_set` / `_map`', '`insert`, `m[k]=v`', '`erase(k)`', '`find`, `count`, `m[k]`⚠, `reserve`', 'O(1) average'],
    ] },

    { t: 'h2', text: 'Algorithms you reach for' },
    { t: 'code', file: 'algorithms_sheet.cpp', run: false, code: `sort(b, e);   sort(b, e, greater<int>());   sort(b, e, [](auto& x, auto& y){ return x.second < y.second; });
reverse(b, e);   unique(b, e);   rotate(b, mid, e);   fill(b, e, 0);   iota(b, e, 1);
*max_element(b, e);   *min_element(b, e);   count(b, e, x);   count_if(b, e, pred);   find(b, e, x);
accumulate(b, e, 0LL);   partial_sum(b, e, out);   all_of / any_of / none_of(b, e, pred);
binary_search(b, e, x);   lower_bound(b, e, x);   upper_bound(b, e, x);    // sorted range only
nth_element(b, b + k, e);   next_permutation(b, e);   max({a, b, c});   swap(a, b);
v.erase(remove_if(b, e, pred), e);        // erase–remove idiom
v.erase(unique(b, e), e);                 // dedupe (after sort)` },

    { t: 'h2', text: 'Complexity ladder' },
    { t: 'table', head: ['n up to…', 'Allowed', 'Typical'], rows: [
      ['≈ 10', 'O(n!)', 'permutations, brute force'],
      ['≈ 20–25', 'O(2ⁿ)', 'subsets, bitmask'],
      ['≈ 500', 'O(n³)', 'triple loops, Floyd–Warshall'],
      ['≈ 5 000', 'O(n²)', 'double loops, simple DP'],
      ['≈ 10⁵–10⁶', 'O(n log n)', 'sort, heap, binary search, set/map'],
      ['≈ 10⁷–10⁸', 'O(n)', 'one pass, hash, two pointers'],
      ['≈ 10¹⁸', 'O(log n)', 'binary search, fast power'],
    ] },

    { t: 'h2', text: 'A contest / interview template' },
    { t: 'code', file: 'template.cpp', code: `#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int INF = 1e9;
const ll LINF = 1e18;

int main() {
    ios::sync_with_stdio(false);        // fast I/O
    cin.tie(nullptr);

    int n = 0;
    cin >> n;
    vector<ll> a(n);
    for (auto& x : a) cin >> x;

    sort(a.begin(), a.end());
    ll total = accumulate(a.begin(), a.end(), 0LL);
    cout << total << "\\n";
    return 0;
}` },
    { t: 'callout', kind: 'tip', html: 'Press **Ctrl + P** to print or save this page as a PDF (the print layout hides the sidebar and controls). Keep it next to you while you practise until the table above lives in your head.' },

    { t: 'recap', items: [
      'Know which header each container and algorithm lives in.',
      'Recall the add / remove / query operations and their costs per container.',
      'Use the complexity ladder to choose an algorithm from the input size.',
    ] },
  ],
});
