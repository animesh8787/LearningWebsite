registerLesson('raii', {
  title: 'RAII and the rule of <em>3, 5 and 0</em>',
  lead: 'The single most important idea in modern C++: tie a resource’s lifetime to an object’s lifetime, and let the destructor do the cleanup.',
  blocks: [
    { t: 'h2', text: 'The idea behind everything' },
    { t: 'levels',
      eli5: ['A hotel room that cleans itself the moment you leave. You do not have to remember. If you rush out the fire exit, it is cleaned anyway. RAII is that for files, memory, locks: **whoever holds it cleans it, automatically, no matter how you leave.**'],
      plain: ['**RAII** stands for “Resource Acquisition Is Initialization”. A resource (heap memory, an open file, a lock) is acquired in a constructor and released in the destructor. Since destructors run whenever an object goes out of scope, the cleanup can never be forgotten, even with early returns or exceptions.'],
      tech: ['C++ guarantees destructors of fully constructed automatic objects run during normal scope exit and during **stack unwinding** after an exception. Encapsulating each resource in an owning object therefore gives exception safety without `try/finally`. `vector`, `string`, `unique_ptr`, `shared_ptr`, `fstream` and `lock_guard` are all RAII types.'] },

    { t: 'h2', text: 'A tiny owner, written by hand' },
    { t: 'code', file: 'buffer.cpp', hl: [8, 9], code: `#include <iostream>
using namespace std;

class Buffer {
    int* data;
    int  n;
public:
    Buffer(int n) : data(new int[n]()), n(n) { cout << "acquire\\n"; }   // grab
    ~Buffer()     { delete[] data;               cout << "release\\n"; }  // always give back
    int& at(int i) { return data[i]; }
};

int main() {
    Buffer b(100);
    b.at(0) = 42;
    cout << b.at(0) << "\\n";
}   // b goes out of scope: "release" prints automatically` },
    { t: 'p', html: 'This is safe even when something goes wrong in the middle: any `return` or `throw` leaves the scope, and the destructor still runs.' },

    { t: 'h2', text: 'The problem: copying' },
    { t: 'p', html: 'If you copy a `Buffer`, the default copy duplicates the **pointer**, not the array. Two objects now own the same memory, and both will `delete[]` it. Step through what happens:' },
    { t: 'viz', kind: 'heapview', cfg: { title: 'Shallow copy = double free', heapIds: ['b1'],
      code: `Buffer a(3);
Buffer b = a;   // default copy: copies the pointer
// scope ends: ~b() then ~a()`,
      steps: [
        { line: 1, stack: { a: { type: 'Buffer', ref: 'h:b1' } }, heap: { b1: { val: '[0, 0, 0]', size: 12 } }, note: '`a` owns one heap array.' },
        { line: 2, stack: { b: { type: 'Buffer', ref: 'h:b1' } }, note: 'The default copy copies each member bit for bit, including the **pointer**. Both objects now point at the same array. Each thinks it is the only owner.' },
        { line: 3, heap: { b1: { freed: true } }, note: '`~b()` frees the array. Then `~a()` frees **the same array again**. Double free: undefined behavior, often a crash.' },
      ] } },
    { t: 'p', html: 'The fix is to define what copying **means** for this class: give the copy its own array (a **deep copy**), or forbid copying, or let a smart pointer or `vector` handle it.' },

    { t: 'h2', text: 'The rules' },
    { t: 'table', head: ['Rule', 'Statement', 'In practice'], rows: [
      ['**Rule of 0** (best)', 'Own resources only through RAII members (`vector`, `string`, `unique_ptr`) and write none of the special functions.', 'Almost all your classes.'],
      ['**Rule of 3**', 'If you write one of: destructor, copy constructor, copy assignment, you almost certainly need all three.', 'Pre-C++11 raw-resource classes.'],
      ['**Rule of 5**', 'Add the move constructor and move assignment to the three.', 'Classes that really manage a raw resource.'],
    ] },
    { t: 'code', file: 'rule_of_zero.cpp', code: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Student {
    string name;
    vector<int> grades;          // owns heap memory, but we write NO special functions
public:
    Student(string n) : name(n) {}
    void add(int g) { grades.push_back(g); }
    double avg() const {
        double s = 0;
        for (int g : grades) s += g;
        return grades.empty() ? 0 : s / grades.size();
    }
};   // copying, moving and destroying all just work: vector and string do the right thing

int main() {
    Student a("Mia"); a.add(90); a.add(80);
    Student b = a;               // a correct deep copy, for free
    b.add(100);
    cout << a.avg() << " " << b.avg() << "\\n";   // 85 90
}` },
    { t: 'code', file: 'rule_of_five.cpp', run: false, code: `class Buffer {
    int* data; int n;
public:
    Buffer(int n) : data(new int[n]()), n(n) {}
    ~Buffer() { delete[] data; }                                   // 1. destructor

    Buffer(const Buffer& o) : data(new int[o.n]), n(o.n) {         // 2. copy ctor: DEEP copy
        for (int i = 0; i < n; i++) data[i] = o.data[i];
    }
    Buffer& operator=(const Buffer& o) {                           // 3. copy assignment
        if (this != &o) { Buffer tmp(o); swap(data, tmp.data); swap(n, tmp.n); }
        return *this;
    }
    Buffer(Buffer&& o) noexcept : data(o.data), n(o.n) {           // 4. move ctor: STEAL
        o.data = nullptr; o.n = 0;
    }
    Buffer& operator=(Buffer&& o) noexcept {                       // 5. move assignment
        if (this != &o) { delete[] data; data = o.data; n = o.n; o.data = nullptr; o.n = 0; }
        return *this;
    }
};` },
    { t: 'callout', kind: 'interview', html: 'The expected answer to “how do you manage resources in C++?” is **“RAII, and the Rule of Zero: I let `vector`/`unique_ptr` own things, so I never write destructors.”** Mentioning Rule of Five for the rare raw-resource class shows depth.' },

    { t: 'quiz', q: 'What is the safest way to give a class an array it owns?', opts: ['`int* data = new int[n];` with a destructor you write', 'A `vector<int>` member', 'A global array', 'A pointer you never free'], ans: 1,
      why: 'A `vector` member is RAII: it frees itself, and copying the class copies the vector deeply. That is the Rule of Zero.' },
    { t: 'quiz', q: 'You wrote a destructor that calls `delete[]`. What else should you almost certainly define or delete?', opts: ['A `main` function', 'Copy constructor and copy assignment', 'A static member', 'Nothing'], ans: 1,
      why: 'Rule of Three: a class that needs a custom destructor owns something, so the default shallow copy is probably wrong.' },

    { t: 'recap', items: [
      'State RAII in a sentence and give three RAII types from the standard library.',
      'Explain why a raw-pointer member makes the default copy dangerous.',
      'Recite Rules of 0, 3 and 5, and prefer Rule of 0.',
    ] },
  ],
});
