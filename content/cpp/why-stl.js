registerLesson('why-stl', {
  title: 'Bridge: why the <em>STL</em> exists',
  lead: 'You now know enough C++ to build your own dynamic array from scratch. We will build one once, see how much work it takes, and then look at the standard library that already solves it.',
  blocks: [
    { t: 'h2', text: 'What you know now' },
    { t: 'ul', items: [
      'Variables, types and how data sits in **memory**.',
      '**Pointers** and the heap, and the danger of managing them by hand.',
      '**Classes** with constructors and destructors, so objects clean up after themselves.',
      '**Templates**, so one piece of code works for any type, and **lambdas**, so you can pass rules to it.',
    ] },
    { t: 'p', html: 'Those four ideas are exactly what the **Standard Template Library** is made of: containers (classes that own memory with RAII), written as templates, driven by algorithms that take lambdas.' },

    { t: 'h2', text: 'Building a growable array by hand' },
    { t: 'p', html: 'An array has a fixed size. To make one that can grow, we allocate a bigger one when it fills, copy everything over, and free the old one. Here is the idea:' },
    { t: 'viz', kind: 'array', cfg: { title: 'Growing a full array', arr: [1, 2, 3, 4], base: 0x1000, size: 4,
      code: `// capacity 4, size 4: FULL
push(5);
//   1. allocate a new array of capacity 8
//   2. copy the 4 old elements across
//   3. free the old array
//   4. store 5 in slot 4`,
      steps: [
        { line: 1, hl: [0, 1, 2, 3], note: 'The array has 4 slots, all used. There is no room for a fifth value.' },
        { line: 3, dim: [0, 1, 2, 3], note: 'Allocate a **new block twice as large** somewhere else on the heap. (The old block is dimmed.) The address will be different.' },
        { line: 4, hl: [0, 1, 2, 3], note: 'Copy each element across: O(n) work. This is the expensive part, and it happens rarely.' },
        { line: 5, note: 'Free the old block. Any pointer into it would now be **dangling**. That is exactly why iterators are invalidated when a vector grows.' },
        { line: 6, push: 5, hl: [4], note: 'Store the new value. There is room for three more pushes before the next copy.' },
      ] } },
    { t: 'code', file: 'my_vector.cpp', code: `#include <iostream>
using namespace std;

class IntArray {
    int* data = nullptr;
    int size_ = 0, cap = 0;
public:
    ~IntArray() { delete[] data; }
    IntArray() = default;
    IntArray(const IntArray&) = delete;              // forbid copies (we'd need a deep copy)
    IntArray& operator=(const IntArray&) = delete;

    void push(int x) {
        if (size_ == cap) {                          // full: grow
            cap = cap ? cap * 2 : 1;
            int* bigger = new int[cap];
            for (int i = 0; i < size_; i++) bigger[i] = data[i];
            delete[] data;
            data = bigger;
        }
        data[size_++] = x;
    }
    int& operator[](int i) { return data[i]; }
    int size() const { return size_; }
};

int main() {
    IntArray a;
    for (int i = 0; i < 10; i++) a.push(i * i);
    cout << a[9] << " " << a.size() << "\\n";    // 81 10
}` },
    { t: 'p', html: 'That is ~25 lines for **just ints**, without insert, erase, iterators, copying, moving, exception safety or bounds-checked access. Scale that to `string`, `map`, `set`, `priority_queue`…' },

    { t: 'h2', text: 'What the STL gives you' },
    { t: 'table', head: ['You need', 'You could hand-write', 'STL gives you'], rows: [
      ['A growable array', '25+ lines, bug-prone', '`vector<T>`'],
      ['Text', 'char arrays and `strcpy`', '`string`'],
      ['LIFO / FIFO', 'array plus a top index', '`stack`, `queue`'],
      ['Always-the-biggest element', 'a hand-built heap', '`priority_queue`'],
      ['Keys in sorted order', 'a balanced tree (hundreds of lines)', '`set`, `map`'],
      ['Instant lookup by key', 'a hash table', '`unordered_set`, `unordered_map`'],
      ['Sort, search, count…', 'your own loops', '`sort`, `binary_search`, `count`, …'],
    ] },
    { t: 'callout', kind: 'tip', html: 'The STL is **fast** (written by experts, tuned for decades), **correct** (heavily tested), **generic** (works with any type via templates) and **safe** (RAII: no leaks). In interviews it also lets you write a solution in 15 lines instead of 150.' },

    { t: 'h2', text: 'The three parts of the STL' },
    { t: 'ul', items: [
      '**Containers:** hold your data (`vector`, `map`, …).',
      '**Iterators:** a uniform “pointer-like finger” that walks any container. They come from the pointer arithmetic you learned.',
      '**Algorithms:** functions like `sort` that work on a range of iterators, often with a lambda for custom rules.',
    ] },
    { t: 'p', html: 'You are ready. Part 2 starts with the foundation (`pair`, iterators, comparators) and then goes container by container, always showing **what it looks like inside**, because you now know enough to understand it.' },

    { t: 'quiz', q: 'Which C++ features are the main ingredients the STL is built from?', opts: ['Only macros', 'Templates, RAII classes, and iterators', 'Global variables', 'Inline assembly'], ans: 1,
      why: 'Containers are class templates that manage their memory with RAII, and iterators generalize pointers so algorithms work on every container.' },
    { t: 'quiz', q: 'In our hand-written array, why is pushing O(1) **amortized** rather than always O(1)?', opts: ['It is always O(1)', 'Most pushes are cheap, but an occasional push triggers a copy of all elements', 'It depends on the type', 'It is O(n) every time'], ans: 1,
      why: 'Doubling means the expensive copy happens rarely, so averaged over many pushes the cost per push is constant.' },

    { t: 'recap', items: [
      'Describe why a growable array needs reallocation and copying.',
      'See `vector`, `string`, `map` and friends as ready-made, expert RAII templates.',
      'Name the three parts of the STL: containers, iterators, algorithms.',
    ] },
  ],
});
