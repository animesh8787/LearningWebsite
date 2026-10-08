registerLesson('grids', {
  title: '2D arrays and <em>grids</em>',
  lead: 'Maps, boards, images and matrices are all grids. They look two-dimensional, but memory is only one long line, and that tells you how they really work.',
  blocks: [
    { t: 'h2', text: 'Rows and columns, flattened' },
    { t: 'levels',
      eli5: ['A chocolate bar has rows and columns of squares. If you laid it flat as one long strip, row after row, you would still be able to say exactly which square is which. That is how a computer stores a grid.'],
      plain: ['`int g[3][4]` is 3 rows with 4 columns each. Memory stores it **row by row**: all of row 0, then all of row 1, and so on. This is called **row-major** order. So `g[r][c]` lives at position `r × (columns) + c` in that long strip.'],
      tech: ['A built-in 2D array is an array of arrays: `g[r]` is itself a `int[4]` object. Element address = `base + (r × COLS + c) × sizeof(T)`. Iterating columns in the **inner** loop walks memory sequentially and is cache-friendly; swapping the loops strides by a whole row each step and can be several times slower for large grids.'] },
    { t: 'p', html: 'Click any cell to see its position in the flat layout and its address:' },
    { t: 'viz', kind: 'grid2d', cfg: { rows: 3, cols: 4, pick: 6 } },

    { t: 'h2', text: 'Creating and looping' },
    { t: 'code', file: 'grid.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Fixed size, known at compile time:
    int g[3][4] = {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };

    // Size decided at run time: vector of vectors
    int R = 3, C = 4;
    vector<vector<int>> m(R, vector<int>(C, 0));   // R rows, each with C zeros

    for (int r = 0; r < R; r++) {          // rows: outer loop
        for (int c = 0; c < C; c++) {      // columns: inner loop
            m[r][c] = g[r][c] * 2;
        }
    }
    cout << m[2][3] << "\\n";    // 24
}` },
    { t: 'callout', kind: 'tip', html: 'On LeetCode a grid is nearly always `vector<vector<int>>` or `vector<vector<char>>`. Get the sizes with `grid.size()` (rows) and `grid[0].size()` (columns).' },

    { t: 'h2', text: 'Neighbors: the direction-array trick' },
    { t: 'p', html: 'Almost every grid problem needs the cells **up, down, left and right** of a given one. Instead of writing four near-identical blocks, store the four offsets in arrays and loop:' },
    { t: 'code', file: 'neighbors.cpp', hl: [5, 6, 12], code: `#include <iostream>
#include <vector>
using namespace std;

int dr[4] = {-1, 1, 0, 0};     // row offsets:    up, down, left, right
int dc[4] = { 0, 0,-1, 1};     // column offsets

int countNeighbors(const vector<vector<int>>& g, int r, int c) {
    int R = g.size(), C = g[0].size(), total = 0;
    for (int k = 0; k < 4; k++) {
        int nr = r + dr[k], nc = c + dc[k];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;   // stay inside!
        total += g[nr][nc];
    }
    return total;
}

int main() {
    vector<vector<int>> g = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    cout << countNeighbors(g, 1, 1) << "\\n";   // 2+8+4+6 = 20
    cout << countNeighbors(g, 0, 0) << "\\n";   // 4+2 = 6 (corner has two)
}` },
    { t: 'callout', kind: 'interview', html: 'The **bounds check** before touching `g[nr][nc]` is the part everyone forgets. Always test `nr, nc` against `0` and `R, C` first. Add `dr/dc` for 8 directions by extending the arrays to 8 entries.' },

    { t: 'h2', text: 'Row-major in action' },
    { t: 'table', head: ['Loop order', 'Memory walk', 'Speed on big grids'], rows: [
      ['`for r { for c { g[r][c] } }`', 'sequential, one cell after the next', 'fast'],
      ['`for c { for r { g[r][c] } }`', 'jumps a whole row each step', 'noticeably slower'],
    ] },

    { t: 'quiz', q: 'In `int g[5][7]`, what flat index does `g[2][3]` have?', opts: ['10', '17', '23', '13'], ans: 1,
      why: '`r × COLS + c = 2 × 7 + 3 = 17`. The number of **columns** is the row length.' },
    { t: 'quiz', q: 'For `vector<vector<int>> g`, how do you get the number of columns?', opts: ['`g.size()`', '`g[0].size()`', '`g.cols()`', '`g.size()[0]`'], ans: 1,
      why: '`g.size()` is the number of rows (outer vector). Each row is a vector, so `g[0].size()` gives the width. (Check `g` is not empty first!)' },

    { t: 'recap', items: [
      'Explain a grid as one long row-major strip and compute `r × COLS + c`.',
      'Build grids with `int g[R][C]` and `vector<vector<T>>`.',
      'Visit 4-neighbors with `dr`/`dc` arrays and a bounds check.',
      'Choose the cache-friendly loop order.',
    ] },
  ],
});
