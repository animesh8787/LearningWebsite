registerLesson('structs', {
  title: 'Structs: your own <em>types</em>',
  lead: 'int and double describe numbers. But a student has a name, an age and a grade, all at once. A struct lets you invent a new type that bundles related values together.',
  blocks: [
    { t: 'h2', text: 'The idea' },
    { t: 'levels',
      eli5: ['A form with several blanks: name, age, favorite color. The form itself is a **struct**. Each filled-in copy is one **object**. You pick the blanks; C++ lays them out neatly in memory.'],
      plain: ['A `struct` groups variables (called **members** or **fields**) under one name. Defining it creates a new **type**; creating a variable of that type gives you an **object**. Use `.` to reach a member: `s.age`.'],
      tech: ['A struct is a class whose members default to public. Members are laid out in declaration order, subject to **alignment padding**: `struct { char c; int i; }` is typically 8 bytes, not 5. Aggregates (no user constructors, all-public members) can use brace initialization and, since C++20, designated initializers: `Point{.x = 1, .y = 2}`.'] },

    { t: 'code', file: 'student.cpp', code: `#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double gpa;
};

void print(const Student& s) {                 // pass big objects by const reference
    cout << s.name << " (" << s.age << ") GPA " << s.gpa << "\\n";
}

int main() {
    Student a = {"Mia", 20, 3.8};              // fill in order
    Student b;                                 // fields start uninitialized (except string)
    b.name = "Raj";
    b.age = 22;
    b.gpa = 3.4;

    print(a);
    print(b);

    Student c = a;                             // copies every member
    c.name = "Sam";                            // a is unaffected
    print(a);
}` },

    { t: 'viz', kind: 'memory', cfg: { title: 'An object in memory',
      code: `struct Point { int x; int y; };
Point p = {3, 4};
p.x = 10;
Point q = p;
q.y = 0;`,
      steps: [
        { line: 2, set: { p: ['Point', '{ x: 3, y: 4 }'] }, note: 'One box named `p`, sized to hold **both** ints (8 bytes), with `x` first then `y`.' },
        { line: 3, set: { p: '{ x: 10, y: 4 }' }, note: '`p.x = 10` changes only the `x` part of the object.' },
        { line: 4, set: { q: ['Point', '{ x: 10, y: 4 }'] }, note: '`q = p` makes an **independent copy** of the whole object, member by member.' },
        { line: 5, set: { q: '{ x: 10, y: 0 }' }, note: 'Changing `q` does not touch `p`. Structs behave like values, just as `int` does.' },
      ] } },

    { t: 'h2', text: 'Collections of structs' },
    { t: 'code', file: 'vector_of_structs.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Point { int x, y; };

int main() {
    vector<Point> pts = {{3, 1}, {1, 4}, {2, 2}};

    // sort by x using a lambda (you will meet these soon)
    sort(pts.begin(), pts.end(), [](const Point& a, const Point& b) { return a.x < b.x; });

    for (const Point& p : pts) cout << "(" << p.x << "," << p.y << ") ";   // (1,4) (2,2) (3,1)
}` },

    { t: 'h2', text: 'Struct, or pair?' },
    { t: 'table', head: ['', '`pair<int,int>`', 'your own `struct`'], rows: [
      ['Setup', 'none, ready made', 'a few lines'],
      ['Field names', '`.first`, `.second` (meaningless)', '`.x`, `.y`, `.weight`: self-documenting'],
      ['Use when', 'quick, throw-away, 2 values', 'anything that lives longer than a few lines, or has 3+ fields'],
    ] },
    { t: 'callout', kind: 'interview', html: 'In interviews `pair` and `tuple` are fine for speed, but a tiny named struct (`struct Edge { int to, w; };`) is more readable and reads as more professional when a problem has several fields.' },

    { t: 'callout', kind: 'tip', html: 'Order members from **largest to smallest** type to reduce padding: `double, int, char` wastes less space than `char, double, int`. Check with `sizeof`.' },

    { t: 'quiz', q: 'After `Point q = p; q.x = 99;` what happens to `p.x`?', opts: ['It becomes 99', 'Nothing: `q` is an independent copy', 'Compile error', 'Both are deleted'], ans: 1,
      why: 'Assigning a struct copies all its members. The two objects are separate boxes.' },
    { t: 'quiz', q: 'Why pass a struct as `const Student& s` instead of `Student s`?', opts: ['Required by C++', 'Avoids copying the whole object, and prevents accidental changes', 'It makes the struct smaller', 'It enables sorting'], ans: 1,
      why: 'By-value copies every member (including strings). `const&` gives read-only access with no copy.' },

    { t: 'recap', items: [
      'Define a struct, create objects and reach members with `.`.',
      'Explain that assigning a struct copies it, member by member.',
      'Choose between a `pair` and a named struct.',
    ] },
  ],
});
