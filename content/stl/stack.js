registerLesson('stack', {
  title: '<em>stack:</em> last in, first out',
  lead: 'Only the top is reachable. That restriction is the whole point: it matches how nested things (brackets, function calls, undo) naturally work.',
  blocks: [
    { t: 'h2', text: 'A stack of plates' },
    { t: 'levels',
      eli5: ['A pile of plates in a cafeteria. You can only add a plate on top or take the top one off. The last plate you put on is the first one you take. Nobody can pull a plate out of the middle.'],
      plain: ['`stack<T>` allows exactly three things: **push** onto the top, **pop** the top off, and look at the **top**. It is an *adapter*: a thin wrapper over another container (a `deque` by default) that hides everything except those operations. All three are **O(1)**.'],
      tech: ['`std::stack<T, Container = deque<T>>` stores a protected container `c` and forwards `push` → `c.push_back`, `pop` → `c.pop_back`, `top` → `c.back`. You can back it with a `vector` for better cache behaviour: `stack<int, vector<int>>`. It deliberately has no iterators and no random access. In many competitive solutions a plain `vector` used with `push_back` / `pop_back` / `back()` is the same thing with extra freedom (iteration, indexing).'] },

    { t: 'h2', text: 'Watch it work' },
    { t: 'viz', kind: 'array', cfg: { title: 'push, top, pop', arr: [], addr: false,
      code: `stack<int> st;
st.push(10);
st.push(20);
st.push(30);
st.top();      // 30
st.pop();
st.pop();`,
      steps: [
        { line: 1, note: 'An empty stack. (Drawn as a row; the **right end is the top**.)' },
        { line: 2, push: 10, ptr: { top: 0 }, note: '`push(10)`: it goes on top. It is also the bottom for now.' },
        { line: 3, push: 20, ptr: { top: 1 }, note: '`push(20)` lands on top of 10.' },
        { line: 4, push: 30, ptr: { top: 2 }, note: '`push(30)`. Top is now 30.' },
        { line: 5, hl: [2], ptr: { top: 2 }, note: '`top()` **looks** at 30 without removing it.' },
        { line: 6, pop: true, ptr: { top: 1 }, note: '`pop()` removes the top and **returns nothing**. 30 is gone; 20 is exposed.' },
        { line: 7, pop: true, ptr: { top: 0 }, note: 'Another pop. Last in, first out: elements leave in the reverse of the order they arrived.' },
      ] } },

    { t: 'code', file: 'stack_basics.cpp', code: `#include <iostream>
#include <stack>
using namespace std;

int main() {
    stack<int> st;
    st.push(1); st.push(2); st.push(3);

    cout << st.top() << " " << st.size() << "\\n";     // 3 3

    while (!st.empty()) {                              // drain it: prints in REVERSE
        cout << st.top() << " ";                       // 3 2 1
        st.pop();                                      // pop() returns void: read top() first
    }
}` },
    { t: 'callout', kind: 'warn', html: '`top()` or `pop()` on an **empty** stack is undefined behavior (often a crash). Always check `!st.empty()` first. And remember `pop()` returns nothing: call `top()` to get the value *before* popping.' },

    { t: 'h2', text: 'Pattern 1: matching brackets' },
    { t: 'p', html: 'Opening brackets go on the stack. A closing bracket must match whatever is on **top**, the most recent unclosed opener. That is LIFO exactly.' },
    { t: 'code', file: 'valid_parens.cpp', code: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') { st.push(c); continue; }
        if (st.empty()) return false;                    // closer with nothing open
        char o = st.top(); st.pop();
        if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;
    }
    return st.empty();                                   // anything left unclosed?
}

int main() {
    cout << isValid("{[()]}") << isValid("([)]") << isValid("((") << "\\n";   // 100
}` },

    { t: 'h2', text: 'Pattern 2: the monotonic stack' },
    { t: 'p', html: '“For each element, find the next **greater** one to its right.” Keep a stack of indices still waiting for an answer. A new bigger value answers everyone smaller on top. Each index is pushed and popped once: O(n).' },
    { t: 'code', file: 'next_greater.cpp', code: `#include <iostream>
#include <stack>
#include <vector>
using namespace std;

vector<int> nextGreater(const vector<int>& a) {
    vector<int> res(a.size(), -1);
    stack<int> st;                                       // indices, values DEcreasing from bottom to top
    for (int i = 0; i < (int)a.size(); i++) {
        while (!st.empty() && a[st.top()] < a[i]) {      // a[i] is the answer for everything smaller
            res[st.top()] = a[i];
            st.pop();
        }
        st.push(i);
    }
    return res;
}

int main() {
    for (int x : nextGreater({2, 1, 5, 3, 4})) cout << x << " ";   // 5 5 -1 4 -1
}` },
    { t: 'table', head: ['Problem', 'Stack idea'], rows: [
      ['Valid Parentheses', 'push openers, match on top'],
      ['Daily Temperatures / Next Greater Element', 'monotonic stack of indices'],
      ['Largest Rectangle in Histogram', 'monotonic increasing stack, compute width on pop'],
      ['Evaluate Reverse Polish Notation', 'push numbers, pop two on each operator'],
      ['Min Stack', 'keep a second stack of running minimums'],
      ['DFS without recursion', 'push neighbours, pop to visit'],
      ['Decode String (`3[a2[c]]`)', 'stack of (count, string) frames'],
    ] },
    { t: 'callout', kind: 'interview', html: 'Pattern recognition cue: if the problem asks about the **nearest** greater/smaller element, **matching pairs**, or “undo the most recent thing”, think stack. State the invariant aloud (“the stack holds indices in decreasing value order”) and the O(n) amortised argument.' },

    { t: 'quiz', q: 'After `push(1) push(2) push(3) pop() push(4)` what does `top()` return?', opts: ['3', '4', '2', '1'], ans: 1,
      why: 'Stack after pushes: 1 2 3. The pop removes 3, leaving 1 2. Push 4 → 1 2 4. The top is 4.' },
    { t: 'quiz', q: 'What is the complexity of `nextGreater` above?', opts: ['O(n²) because of the inner while', 'O(n): every index is pushed once and popped at most once', 'O(log n)', 'O(n log n)'], ans: 1,
      why: 'The inner loop only pops elements that were pushed, and each element is pushed exactly once, so total pops ≤ n.' },

    { t: 'recap', items: [
      'Use push/top/pop/empty correctly and know they are O(1).',
      'Solve bracket matching with a stack.',
      'Write the monotonic-stack template and justify its O(n) cost.',
    ] },
  ],
});
