registerLesson('templates', {
  title: 'Templates: <em>one</em> function, every type',
  lead: 'Writing max for int, then again for double, then again for string is repetitive. Templates let you write it once and let the compiler produce each version when needed.',
  blocks: [
    { t: 'h2', text: 'A recipe with a blank' },
    { t: 'levels',
      eli5: ['A cookie cutter does not care whether you press it into chocolate dough or gingerbread. You make **one** cutter, and it works on any dough. A template is a cutter for code: write the shape once, and the compiler presses it into every type you use.'],
      plain: ['A **template** is a function or class with a placeholder for a type, usually called `T`. When you call it with, say, `int`, the compiler **generates a real function** with `T` replaced by `int`. Each different type gets its own generated version. This happens at compile time, so templates cost nothing at run time.'],
      tech: ['Templates are instantiated per distinct set of template arguments (**monomorphization**), after template argument deduction from the call. The definition must be visible at the point of instantiation, which is why templates normally live in headers. Operations on `T` are checked only on instantiation: `max(a, b)` needs `operator>` on `T`. C++20 **concepts** let you state such requirements explicitly (`requires std::totally_ordered<T>`).'] },
    { t: 'p', html: 'Pick an argument type and see the real function the compiler writes:' },
    { t: 'viz', kind: 'stamp', cfg: {} },

    { t: 'h2', text: 'Function templates' },
    { t: 'code', file: 'max.cpp', code: `#include <iostream>
#include <string>
using namespace std;

template <typename T>
T maxOf(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    cout << maxOf(3, 9) << "\\n";                 // T = int
    cout << maxOf(2.5, 1.5) << "\\n";             // T = double
    cout << maxOf(string("pear"), string("apple")) << "\\n";   // T = string
    cout << maxOf<double>(3, 4.5) << "\\n";       // ask for T explicitly when args disagree
    // cout << maxOf(3, 4.5);                    // ✗ T can't be both int and double
}` },
    { t: 'callout', kind: 'tip', html: 'The standard library already has `std::max`, `std::min` and `std::swap`, which are exactly such templates. In real code, use those. Writing your own is how you understand them.' },

    { t: 'h2', text: 'Class templates' },
    { t: 'p', html: 'This is how `vector<int>`, `stack<char>` and `map<string,int>` exist. Here is a tiny fixed-capacity stack:' },
    { t: 'code', file: 'stack_template.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

template <typename T>
class MyStack {
    vector<T> items;
public:
    void push(const T& x) { items.push_back(x); }
    T pop() { T x = items.back(); items.pop_back(); return x; }
    bool empty() const { return items.empty(); }
};

int main() {
    MyStack<int> a;          // you spell out T for class templates (before C++17 deduction)
    a.push(1); a.push(2);
    cout << a.pop() << "\\n";     // 2

    MyStack<string> b;
    b.push("hello");
    cout << b.pop() << "\\n";     // hello
}` },
    { t: 'p', html: 'Look at how the STL names read now: in `vector<int>` the `<int>` is simply the template argument. `map<string, int>` has two parameters. Every container in Part 2 is a class template.' },

    { t: 'h2', text: 'Non-type parameters and auto' },
    { t: 'code', file: 'nontype.cpp', code: `#include <array>
#include <iostream>
using namespace std;

template <int N>                 // N is a VALUE known at compile time
int sumUpTo() { int s = 0; for (int i = 1; i <= N; i++) s += i; return s; }

auto square(auto x) { return x * x; }     // C++20: auto parameters make a template implicitly

int main() {
    array<int, 5> a = {1, 2, 3, 4, 5};   // array<T, N>: the size is part of the type
    cout << sumUpTo<10>() << "\\n";       // 55
    cout << square(4) << " " << square(1.5) << "\\n";   // 16 2.25
}` },
    { t: 'callout', kind: 'warn', html: 'Template errors are notoriously long, because the compiler reports the failure deep inside the generated code. Read the **first** error line and the “required from here” line that names **your** call. That is the one to fix.' },

    { t: 'quiz', q: 'When does the compiler turn `maxOf<T>` into real machine code for `int`?', opts: ['At run time, on the first call', 'At compile time, when it sees `maxOf(3, 9)`', 'When the program exits', 'Never; it is interpreted'], ans: 1,
      why: 'Templates are expanded at compile time. By the time the program runs there are ordinary functions, so there is no speed penalty.' },
    { t: 'quiz', q: 'Why does `maxOf(3, 4.5)` fail to compile for `template <typename T> T maxOf(T a, T b)`?', opts: ['`maxOf` is not defined', 'T would have to be int and double at once', 'Doubles are not allowed', 'Templates cannot take two arguments'], ans: 1,
      why: 'Both parameters share one `T`, and the compiler deduces `int` from one argument and `double` from the other. Specify it: `maxOf<double>(3, 4.5)`.' },

    { t: 'recap', items: [
      'Explain templates as compile-time code generation for each type.',
      'Write simple function and class templates.',
      'Recognize that `vector<int>` is just a class template instantiated with `int`.',
    ] },
  ],
});
