registerLesson('variables', {
  title: 'Variables: <em>boxes</em> in memory',
  lead: 'Every program remembers things. A variable is how you tell the computer: “keep this for me, and call it that.”',
  blocks: [
    { t: 'h2', text: 'The idea, three ways' },
    { t: 'levels',
      eli5: ['Imagine a shelf full of empty boxes. You grab one, stick a label on it that says **age**, and put the number 21 inside. That box is a variable.',
             'Later you can look inside the box, or swap what is inside for something new. The label never changes, only the stuff in the box.'],
      plain: ['A [[variable]] is a named place in the computer’s [[memory]] that holds one value. You choose the name, and you choose the [[type]], which decides how big the place is and what kind of value fits in it.',
              'Writing `int age = 21;` does three things at once: it reserves a 4-byte box, labels it `age`, and puts 21 inside.'],
      tech: ['A variable is a named object: a region of storage with a type, a lifetime and an [[address]]. A [[declaration]] introduces the name; the definition reserves storage. For locals that storage is usually on the [[stack]], at a fixed offset from the frame pointer, so the name compiles away into an address.',
             'The type determines `sizeof`, alignment and the set of valid operations. Reading an object before it is [[initialization|initialized]] is undefined behavior for most built-in types.'] },

    { t: 'h2', text: 'See it happen' },
    { t: 'p', html: 'Step through this tiny program. On the right, watch memory change one line at a time. Each box shows its **name**, its **type**, the **value** inside, and the **address** where it lives.' },
    { t: 'viz', kind: 'memory', cfg: {
      title: 'Variables in memory',
      code: `int apples = 5;
int oranges = 3;
int fruit = apples + oranges;
apples = 10;
double price = 2.5;
char grade = 'A';`,
      steps: [
        { line: 1, set: { apples: ['int', 5] }, note: 'The compiler reserves **4 bytes** for `apples`, labels them, and writes `5` inside. That is a declaration with initialization.' },
        { line: 2, set: { oranges: ['int', 3] }, note: 'A second box, right next to the first. Stack variables are packed together, each at its own address.' },
        { line: 3, set: { fruit: ['int', 8] }, note: 'The right-hand side runs first: read `apples` (5), read `oranges` (3), add them to get 8. Only then is a new box created to hold the result.' },
        { line: 4, set: { apples: 10 }, note: 'This is **assignment**, not declaration. No new box. The old `5` is overwritten with `10`. Notice `fruit` is still 8: it stored a copy of the result, not a formula.' },
        { line: 5, set: { price: ['double', 2.5] }, note: 'A `double` needs **8 bytes** because decimals are stored differently. Different type, bigger box.' },
        { line: 6, set: { grade: ['char', "'A'"] }, note: 'A `char` is just **1 byte**. The letter A is stored as the number 65 and displayed as a letter.' },
      ] } },

    { t: 'callout', kind: 'tip', html: 'Click the visualizer and use the **← →** keys, or drag the slider. Going backwards is how you build intuition for what each line changed.' },

    { t: 'h2', text: 'Declaring and assigning' },
    { t: 'code', file: 'variables.cpp', hl: [5, 9], code: `#include <iostream>
using namespace std;

int main() {
    int score = 90;          // declare + initialize
    int bonus;               // declared, NOT initialized (garbage inside!)
    bonus = 5;               // assigned later

    score = score + bonus;   // read, add, write back
    cout << "Total: " << score << endl;
    return 0;
}` },
    { t: 'ul', items: [
      '**Declare**: `type name;` reserves the box.',
      '**Initialize**: `type name = value;` reserves it and fills it in one step. Prefer this.',
      '**Assign**: `name = value;` replaces what is inside an existing box.',
    ] },
    { t: 'callout', kind: 'warn', html: '`int bonus;` leaves whatever bytes happened to be in that spot. Printing it before you assign gives a random number, and the compiler will not stop you. **Initialize everything.**' },

    { t: 'h2', text: 'Types decide the size of the box' },
    { t: 'table', head: ['Type', 'Holds', 'Typical size', 'Example'], rows: [
      ['`int`', 'whole numbers', '4 bytes', '`int n = -42;`'],
      ['`long long`', 'big whole numbers', '8 bytes', '`long long big = 9000000000;`'],
      ['`double`', 'decimals', '8 bytes', '`double pi = 3.14159;`'],
      ['`char`', 'one character', '1 byte', '`char c = \'x\';`'],
      ['`bool`', 'true / false', '1 byte', '`bool ok = true;`'],
    ] },

    { t: 'h2', text: 'What if the number is too big?' },
    { t: 'p', html: 'A box has a fixed number of switches (bits), so it can only count so high. Past the top, it **wraps around**, like a car odometer going from 999999 to 000000. Play with it:' },
    { t: 'viz', kind: 'typebox', cfg: {} },
    { t: 'callout', kind: 'interview', html: 'Interviewers love this: “What happens if you add 1 to `INT_MAX`?” For signed types it is **undefined behavior**; in practice it wraps to the most negative value. This is also why LeetCode sums often need `long long`.' },

    { t: 'quiz', q: 'After running `int a = 7; int b = a; a = 99;`, what is `b`?', opts: ['99', '7', '106', 'It depends on the compiler'], ans: 1,
      why: '`b` got its **own copy** of 7 when it was created. Changing `a` afterwards only changes `a`’s box. Variables are independent boxes, not links.' },
    { t: 'quiz', q: 'Which line creates a **new** variable?', opts: ['`x = 5;`', '`int x = 5;`', '`x + 5;`', '`5 = x;`'], ans: 1,
      why: 'Only a line that starts with a type creates a new box. `x = 5;` assumes `x` already exists.' },

    { t: 'recap', items: [
      'Explain a variable as a named, typed box in memory with an address.',
      'Tell a **declaration**, an **initialization** and an **assignment** apart.',
      'Predict how much memory common types use, and why `char` is 1 byte but `double` is 8.',
      'Recognize overflow and know why unsigned and signed types wrap differently.',
    ] },
  ],
});
