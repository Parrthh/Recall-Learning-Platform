/**
 * Seed definitions for topics and their practice questions.
 * Adding a topic = add a markdown file under content/ + one entry here.
 * The seed script upserts by slug, so re-running is safe.
 */

export type SeedDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface SeedQuestion {
  slug: string;
  title: string;
  prompt: string;
  difficulty: SeedDifficulty;
  hints: string[];
  solutionMd: string;
  sourceUrl?: string;
}

export interface SeedTopic {
  category: "DSA" | "SYSTEM_DESIGN";
  section: string;
  title: string;
  slug: string;
  order: number;
  summary: string;
  contentPath: string;
  prerequisites: string[];
  questions: SeedQuestion[];
}

export const seedTopics: SeedTopic[] = [
  // ───────────────────────────── DSA · Foundations ─────────────────────────────
  {
    category: "DSA",
    section: "Foundations",
    title: "Big-O & Complexity Analysis",
    slug: "big-o-and-complexity-analysis",
    order: 1,
    summary:
      "How to derive time and space complexity from code: loops, recursion, recurrences, best/worst/average case, and amortized analysis.",
    contentPath: "dsa/big-o-and-complexity-analysis.md",
    prerequisites: [],
    questions: [
      {
        slug: "analyze-nested-loop-slice",
        title: "Spot the hidden quadratic",
        difficulty: "EASY",
        prompt: `What is the time complexity of this function, and why?

\`\`\`typescript
function firstHalves(words: string[]): string[] {
  const result: string[] = [];
  for (const w of words) {
    result.push(w.slice(0, w.length / 2));
  }
  return result;
}
\`\`\`

Assume n words of average length m.`,
        hints: [
          "How much work does `slice` do — is it O(1)?",
          "Count total characters copied across all iterations, not just loop iterations.",
        ],
        solutionMd: `**O(n·m) time, O(n·m) space.**

The loop runs n times, but \`slice\` copies about m/2 characters each iteration — string operations are proportional to the characters they touch, not O(1). Total work ≈ n·m/2 → **O(n·m)**.

The common mistake is counting loop iterations ("one loop → O(n)") while ignoring the cost of library calls inside it. \`slice\`, \`concat\`, spread, and \`indexOf\` all hide linear work.`,
      },
      {
        slug: "recurrence-two-recursive-calls",
        title: "Solve the recurrence",
        difficulty: "MEDIUM",
        prompt: `Give a tight complexity bound for this function and justify it with a recurrence:

\`\`\`typescript
function f(n: number): number {
  if (n <= 1) return 1;
  return f(n - 1) + f(n - 1);
}
\`\`\``,
        hints: [
          "Write T(n) in terms of T(n − 1).",
          "How many calls exist at depth d of the call tree?",
        ],
        solutionMd: `**O(2ⁿ) time, O(n) space.**

Recurrence: T(n) = 2·T(n−1) + O(1). The call tree doubles at each level and has depth n, so total calls = 1 + 2 + 4 + … + 2ⁿ⁻¹ = **O(2ⁿ)**.

Space is the maximum recursion depth, not the total calls: the two calls don't exist simultaneously — the stack holds one root-to-leaf path → **O(n)**.

(Memoizing on n collapses this to O(n) time — the same call is recomputed exponentially often.)`,
      },
    ],
  },
  {
    category: "DSA",
    section: "Foundations",
    title: "Complexity Reference",
    slug: "complexity-reference",
    order: 2,
    summary:
      "Side-by-side tables: core operation complexity for every data structure, and the typical time/space each pattern produces.",
    contentPath: "dsa/complexity-reference.md",
    prerequisites: ["big-o-and-complexity-analysis"],
    questions: [],
  },
  {
    category: "DSA",
    section: "Foundations",
    title: "Arrays, Strings & Hashing",
    slug: "arrays-strings-hashing",
    order: 3,
    summary:
      "The substrate of everything else: array mechanics, string immutability, and trading O(n) space for O(1) hash-map lookups.",
    contentPath: "dsa/arrays-strings-hashing.md",
    prerequisites: ["big-o-and-complexity-analysis"],
    questions: [
      {
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        sourceUrl: "https://leetcode.com/problems/two-sum/",
        prompt: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`. Exactly one solution exists; you may not use the same element twice.

Example: \`nums = [2, 7, 11, 15], target = 9\` → \`[0, 1]\`.

Can you do it in one pass?`,
        hints: [
          "For each number x, what single value would complete the pair?",
          "Store numbers you've already seen in a map from value → index, and look up the complement before inserting.",
        ],
        solutionMd: `Walk the array once; for each element check whether its complement (\`target − nums[i]\`) was already seen.

\`\`\`typescript
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const j = seen.get(target - nums[i]);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  throw new Error("no solution");
}
\`\`\`

**O(n) time, O(n) space.** Inserting *after* the lookup handles duplicates correctly (e.g. \`[3, 3], 6\`) and prevents pairing an element with itself.`,
      },
      {
        slug: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/group-anagrams/",
        prompt: `Given an array of strings, group the anagrams together. Example:

\`["eat","tea","tan","ate","nat","bat"]\` → \`[["eat","tea","ate"],["tan","nat"],["bat"]]\` (any order).`,
        hints: [
          "Two strings are anagrams when some canonical form of them is identical.",
          "Bucket the strings in a map keyed by that canonical form (sorted string, or a character-count signature).",
        ],
        solutionMd: `Map each word to a canonical key shared by exactly its anagrams, and bucket by key.

\`\`\`typescript
function groupAnagrams(words: string[]): string[][] {
  const buckets = new Map<string, string[]>();
  for (const w of words) {
    const key = [...w].sort().join(""); // canonical form
    const bucket = buckets.get(key);
    if (bucket) bucket.push(w);
    else buckets.set(key, [w]);
  }
  return [...buckets.values()];
}
\`\`\`

**O(n · k log k) time** (sorting each word of length k), **O(n·k) space**. A 26-slot count signature key (\`"1#0#2#…"\`) drops it to O(n·k). The transferable idea is the **canonical-key trick**: hash by "what makes these equivalent".`,
      },
    ],
  },

  // ───────────────────────────── DSA · Patterns ─────────────────────────────
  {
    category: "DSA",
    section: "Patterns",
    title: "Two Pointers",
    slug: "two-pointers",
    order: 4,
    summary:
      "Coordinated indices that only move forward: pair sums on sorted arrays, palindromes, and in-place compaction in O(n)/O(1).",
    contentPath: "dsa/two-pointers.md",
    prerequisites: ["arrays-strings-hashing"],
    questions: [
      {
        slug: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "EASY",
        sourceUrl: "https://leetcode.com/problems/valid-palindrome/",
        prompt: `Given a string, return \`true\` if it reads the same forwards and backwards after lowercasing and removing all non-alphanumeric characters.

Example: \`"A man, a plan, a canal: Panama"\` → \`true\`. Aim for O(1) extra space.`,
        hints: [
          "Compare characters from both ends moving inward.",
          "Skip non-alphanumeric characters by advancing the pointer that sits on one — don't build a cleaned copy.",
        ],
        solutionMd: `\`\`\`typescript
function isPalindrome(s: string): boolean {
  const alnum = (c: string) => /[a-z0-9]/i.test(c);
  let lo = 0, hi = s.length - 1;
  while (lo < hi) {
    while (lo < hi && !alnum(s[lo])) lo++;
    while (lo < hi && !alnum(s[hi])) hi--;
    if (s[lo].toLowerCase() !== s[hi].toLowerCase()) return false;
    lo++; hi--;
  }
  return true;
}
\`\`\`

**O(n) time, O(1) space** — converging pointers, each character visited once. Building a cleaned string first also works but costs O(n) space; the in-place skip is the pattern demonstration.`,
      },
      {
        slug: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/container-with-most-water/",
        prompt: `Given heights \`h[0..n-1]\` as vertical lines, choose two lines that, with the x-axis, contain the most water. Return the maximum area, i.e. \`max (j − i) · min(h[i], h[j])\`.

Example: \`[1,8,6,2,5,4,8,3,7]\` → \`49\`. O(n²) is easy — find O(n).`,
        hints: [
          "Start with the widest container: pointers at both ends.",
          "Moving the taller pointer inward can never help — width shrinks and the limiting (shorter) side stays. So always move the shorter one.",
        ],
        solutionMd: `\`\`\`typescript
function maxArea(h: number[]): number {
  let lo = 0, hi = h.length - 1, best = 0;
  while (lo < hi) {
    best = Math.max(best, (hi - lo) * Math.min(h[lo], h[hi]));
    if (h[lo] < h[hi]) lo++;
    else hi--;
  }
  return best;
}
\`\`\`

**O(n) time, O(1) space.** The correctness argument is the interview: the area is limited by the shorter line; moving the *taller* pointer inward shrinks width without raising the limit, so no candidate is lost by only ever moving the shorter side. Each step permanently discards one line → linear.`,
      },
      {
        slug: "three-sum",
        title: "3Sum",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/3sum/",
        prompt: `Given an integer array, return **all unique triplets** \`[a, b, c]\` with \`a + b + c = 0\`. The answer must not contain duplicate triplets.

Example: \`[-1,0,1,2,-1,-4]\` → \`[[-1,-1,2],[-1,0,1]]\`.`,
        hints: [
          "Sort first. Then fix one element and the problem reduces to a familiar one.",
          "For each fixed nums[i], find pairs summing to −nums[i] with converging pointers.",
          "Skip duplicate values at every level (the fixed index and both pointers) to dedupe triplets.",
        ],
        solutionMd: `Sort, fix the first element, two-pointer the rest.

\`\`\`typescript
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const res: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;                       // no triplet can sum to 0
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip duplicate anchors
    let lo = i + 1, hi = nums.length - 1;
    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];
      if (sum < 0) lo++;
      else if (sum > 0) hi--;
      else {
        res.push([nums[i], nums[lo], nums[hi]]);
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++; // skip dup pairs
        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
        lo++; hi--;
      }
    }
  }
  return res;
}
\`\`\`

**O(n²) time** (n anchors × linear pointer sweep), **O(1) extra space** beyond output. Duplicate-skipping at all three positions is where most attempts fail.`,
      },
    ],
  },
  {
    category: "DSA",
    section: "Patterns",
    title: "Sliding Window",
    slug: "sliding-window",
    order: 5,
    summary:
      "Grow-right/shrink-left windows with incremental state: longest/shortest/count of contiguous ranges in O(n).",
    contentPath: "dsa/sliding-window.md",
    prerequisites: ["two-pointers"],
    questions: [
      {
        slug: "longest-substring-without-repeating",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        prompt: `Given a string, find the length of the longest substring with no repeated characters.

Examples: \`"abcabcbb"\` → 3 (\`"abc"\`), \`"bbbbb"\` → 1, \`"pwwkew"\` → 3 (\`"wke"\`).`,
        hints: [
          "Maintain a window that always contains unique characters.",
          "When the character entering at `right` is already in the window, shrink from `left` until it isn't.",
        ],
        solutionMd: `\`\`\`typescript
function lengthOfLongestSubstring(s: string): number {
  const counts = new Map<string, number>();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    counts.set(s[right], (counts.get(s[right]) ?? 0) + 1);
    while ((counts.get(s[right]) ?? 0) > 1) {
      counts.set(s[left], counts.get(s[left])! - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
\`\`\`

**O(n) time** — \`left\` and \`right\` each advance at most n times — and **O(min(n, alphabet)) space**. This is the canonical variable-size window: admit, restore validity, record.`,
      },
      {
        slug: "minimum-window-substring",
        title: "Minimum Window Substring",
        difficulty: "HARD",
        sourceUrl: "https://leetcode.com/problems/minimum-window-substring/",
        prompt: `Given strings \`s\` and \`t\`, return the smallest substring of \`s\` containing every character of \`t\` (with multiplicity), or \`""\` if none exists.

Example: \`s = "ADOBECODEBANC", t = "ABC"\` → \`"BANC"\`.`,
        hints: [
          "Track how many of t's required characters the window currently satisfies.",
          "Grow right until the window covers t, then shrink left as far as possible while it still covers — record at each fully-covering position.",
          "Keep a single counter of 'fully satisfied characters' so the cover check is O(1), not a map comparison.",
        ],
        solutionMd: `\`\`\`typescript
function minWindow(s: string, t: string): string {
  const need = new Map<string, number>();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let satisfied = 0;                       // chars whose count requirement is met
  const window = new Map<string, number>();
  let left = 0, bestLen = Infinity, bestStart = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      window.set(c, (window.get(c) ?? 0) + 1);
      if (window.get(c) === need.get(c)) satisfied++;
    }
    while (satisfied === need.size) {      // window covers t → try shrinking
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const l = s[left++];
      if (need.has(l)) {
        if (window.get(l) === need.get(l)) satisfied--;
        window.set(l, window.get(l)! - 1);
      }
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}
\`\`\`

**O(|s| + |t|) time, O(alphabet) space.** The \`satisfied\` counter is the trick that keeps the "does the window cover t?" check constant-time.`,
      },
    ],
  },
  {
    category: "DSA",
    section: "Patterns",
    title: "Binary Search",
    slug: "binary-search",
    order: 6,
    summary:
      "Halving a monotonic search space: the boundary template, lower bound, and binary search on the answer space.",
    contentPath: "dsa/binary-search.md",
    prerequisites: ["big-o-and-complexity-analysis"],
    questions: [
      {
        slug: "first-bad-version",
        title: "First Bad Version",
        difficulty: "EASY",
        sourceUrl: "https://leetcode.com/problems/first-bad-version/",
        prompt: `Versions \`1..n\` were released in order; once a version is bad, all later versions are bad. Given \`isBadVersion(v)\`, find the first bad version with as few calls as possible.`,
        hints: [
          "The versions look like GGGGBBBB — a monotonic predicate. Find the boundary.",
          "When isBadVersion(mid) is true, mid might itself be the answer: keep it in range with hi = mid.",
        ],
        solutionMd: `Pure boundary-template binary search:

\`\`\`typescript
function firstBadVersion(n: number, isBad: (v: number) => boolean): number {
  let lo = 1, hi = n; // invariant: first bad ∈ [lo, hi]
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (isBad(mid)) hi = mid;   // mid could be the first bad → keep it
    else lo = mid + 1;          // strictly right of mid
  }
  return lo;
}
\`\`\`

**O(log n) calls, O(1) space.** Note \`hi = mid\` (not \`mid − 1\`) — the true boundary must stay inside the range, and the round-down \`mid\` guarantees progress.`,
      },
      {
        slug: "koko-eating-bananas",
        title: "Koko Eating Bananas",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/koko-eating-bananas/",
        prompt: `Koko has \`piles[]\` of bananas and \`h\` hours. Each hour she eats up to \`k\` bananas from one pile. Return the minimum integer \`k\` letting her finish all piles within \`h\` hours.

Example: \`piles = [3,6,7,11], h = 8\` → \`4\`.`,
        hints: [
          "You can't derive k directly — but for a given k, checking feasibility is easy.",
          "Feasibility is monotonic in k (faster always still works) → binary search the smallest feasible k in [1, max(piles)].",
        ],
        solutionMd: `Binary search **on the answer space**:

\`\`\`typescript
function minEatingSpeed(piles: number[], h: number): number {
  const canFinish = (k: number) =>
    piles.reduce((hrs, p) => hrs + Math.ceil(p / k), 0) <= h;
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (canFinish(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
\`\`\`

**O(n log maxPile) time, O(1) space.** The template is identical to First Bad Version — only the predicate changed. Recognizing "minimize k such that feasible(k)" as a binary-searchable shape is the skill; it also solves ship-capacity, split-array, and min-days problems.`,
      },
      {
        slug: "search-rotated-sorted-array",
        title: "Search in Rotated Sorted Array",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        prompt: `A sorted array of distinct integers was rotated at an unknown pivot (e.g. \`[4,5,6,7,0,1,2]\`). Find the index of \`target\` in O(log n), or −1.`,
        hints: [
          "At any mid, at least one half [lo..mid] or [mid..hi] is fully sorted — which one is decidable by comparing endpoints.",
          "Check whether target lies inside the sorted half's range; recurse into that half or the other.",
        ],
        solutionMd: `\`\`\`typescript
function search(nums: number[], target: number): number {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {              // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                   // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
\`\`\`

**O(log n) time, O(1) space.** The plain "is target < mid?" predicate isn't monotonic in a rotated array; the fix is deciding which half is sorted first, then doing an ordinary range check within it. Every step still halves the space.`,
      },
    ],
  },
  {
    category: "DSA",
    section: "Core Structures",
    title: "Stacks & Queues",
    slug: "stacks-queues",
    order: 7,
    summary:
      "LIFO/FIFO mechanics, nesting problems, and the monotonic stack for next-greater/smaller queries in amortized O(n).",
    contentPath: "dsa/stacks-queues.md",
    prerequisites: ["arrays-strings-hashing"],
    questions: [
      {
        slug: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "EASY",
        sourceUrl: "https://leetcode.com/problems/valid-parentheses/",
        prompt: `Given a string of \`()[]{}\`, return true if brackets close in the correct order and type. Examples: \`"()[]{}"\`→ true, \`"(]"\` → false, \`"([)]"\` → false.`,
        hints: [
          "The most recently opened bracket must close first — which structure models 'most recent'?",
          "Push openers; on a closer, pop and compare. Watch the two failure modes at the end: leftover openers and popping empty.",
        ],
        solutionMd: `\`\`\`typescript
function isValid(s: string): boolean {
  const match: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch in match) {
      if (stack.pop() !== match[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}
\`\`\`

**O(n) time, O(n) space.** Three failure modes, all covered: wrong type (\`pop !== match\`), closing with nothing open (\`pop\` returns \`undefined\` ≠ opener), and unclosed leftovers (final length check).`,
      },
      {
        slug: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/daily-temperatures/",
        prompt: `Given daily temperatures, return an array where \`answer[i]\` is the number of days you must wait after day \`i\` for a warmer temperature (0 if none).

Example: \`[73,74,75,71,69,72,76,73]\` → \`[1,1,4,2,1,1,0,0]\`.`,
        hints: [
          "Brute force checks every future day for every day — O(n²). Think 'next greater element'.",
          "Keep a stack of indices whose warmer day hasn't arrived, values decreasing. A new warm day resolves everything smaller on the stack.",
        ],
        solutionMd: `Monotonic (decreasing) stack of unresolved indices:

\`\`\`typescript
function dailyTemperatures(t: number[]): number[] {
  const answer = new Array<number>(t.length).fill(0);
  const stack: number[] = []; // indices with strictly decreasing temps
  for (let i = 0; i < t.length; i++) {
    while (stack.length > 0 && t[stack[stack.length - 1]] < t[i]) {
      const j = stack.pop()!;
      answer[j] = i - j;
    }
    stack.push(i);
  }
  return answer;
}
\`\`\`

**O(n) amortized time** — each index is pushed once and popped at most once, so the nested while is fine — **O(n) space**. Storing *indices* (not values) is what lets you compute the distance.`,
      },
    ],
  },
  {
    category: "DSA",
    section: "Patterns",
    title: "Graphs: BFS, DFS & Beyond",
    slug: "graphs",
    order: 8,
    summary:
      "Adjacency lists, BFS/DFS traversal, topological sort, union-find, and shortest paths — the O(V+E) toolkit.",
    contentPath: "dsa/graphs.md",
    prerequisites: ["stacks-queues"],
    questions: [
      {
        slug: "number-of-islands",
        title: "Number of Islands",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/number-of-islands/",
        prompt: `Given a 2D grid of \`'1'\` (land) and \`'0'\` (water), count the islands (groups of land connected horizontally/vertically).

\`\`\`
1 1 0 0
1 1 0 0
0 0 1 0
0 0 0 1
\`\`\`
→ 3 islands.`,
        hints: [
          "The grid is an implicit graph: cells are vertices, 4-directional adjacency is the edges.",
          "Scan every cell; when you find unvisited land, that's one island — flood-fill (DFS/BFS) to mark its whole component visited.",
        ],
        solutionMd: `\`\`\`typescript
function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0]?.length ?? 0;
  let islands = 0;
  const sink = (r: number, c: number): void => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; // mark visited in place
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        sink(r, c);
      }
    }
  }
  return islands;
}
\`\`\`

**O(rows × cols) time** — every cell visited a constant number of times — and **O(rows × cols) worst-case space** for the recursion (one giant snake-shaped island). Counting components = "how many times did I have to start a new traversal?"`,
      },
      {
        slug: "course-schedule",
        title: "Course Schedule",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/course-schedule/",
        prompt: `There are \`numCourses\` courses and prerequisite pairs \`[a, b]\` meaning "b before a". Return true if all courses can be finished (i.e., no circular prerequisites).`,
        hints: [
          "Model courses as a directed graph. When is completion impossible?",
          "Kahn's algorithm: repeatedly take courses with zero unfinished prerequisites; if you can't take them all, there's a cycle.",
        ],
        solutionMd: `Cycle detection via topological sort (Kahn's algorithm):

\`\`\`typescript
function canFinish(numCourses: number, prereqs: [number, number][]): boolean {
  const adj = new Map<number, number[]>();
  const indegree = new Array<number>(numCourses).fill(0);
  for (const [course, before] of prereqs) {
    if (!adj.has(before)) adj.set(before, []);
    adj.get(before)!.push(course);
    indegree[course]++;
  }
  const queue: number[] = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  let taken = 0;
  for (let head = 0; head < queue.length; head++) {
    taken++;
    for (const next of adj.get(queue[head]) ?? []) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return taken === numCourses;
}
\`\`\`

**O(V + E) time and space.** If a cycle exists, its members never reach in-degree 0 and \`taken < numCourses\`. The DFS-coloring alternative (white/gray/black) is equally valid — mention both.`,
      },
    ],
  },
  {
    category: "DSA",
    section: "Patterns",
    title: "Dynamic Programming",
    slug: "dynamic-programming",
    order: 9,
    summary:
      "Brute-force recursion + memory: deriving states, 1D/2D tables, the knapsack and LCS families, and space rolling.",
    contentPath: "dsa/dynamic-programming.md",
    prerequisites: ["big-o-and-complexity-analysis", "graphs"],
    questions: [
      {
        slug: "house-robber",
        title: "House Robber",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/house-robber/",
        prompt: `Given amounts in a row of houses, maximize the total you can rob without robbing two **adjacent** houses.

Example: \`[2,7,9,3,1]\` → \`12\` (2 + 9 + 1).`,
        hints: [
          "At each house you make one binary choice. Write the recursion for 'best from house i onward'.",
          "best(i) = max(nums[i] + best(i+2), best(i+1)) — then notice each state only needs the two after it.",
        ],
        solutionMd: `State: best loot from the first i houses. Transition: rob house i (add to best(i−2)) or skip it (keep best(i−1)).

\`\`\`typescript
function rob(nums: number[]): number {
  let skip = 0, take = 0; // best(i-1), best(i) rolling
  for (const amount of nums) {
    [skip, take] = [take, Math.max(take, skip + amount)];
  }
  return take;
}
\`\`\`

**O(n) time, O(1) space** after rolling the 1D table down to two variables. This is the cleanest example of the DP derivation pipeline: recursion → state (index) → memo → table → rolled table.`,
      },
      {
        slug: "coin-change",
        title: "Coin Change",
        difficulty: "MEDIUM",
        sourceUrl: "https://leetcode.com/problems/coin-change/",
        prompt: `Given coin denominations and an amount, return the **fewest** coins needed to make the amount exactly, or −1 if impossible. Coins are unlimited.

Example: \`coins = [1,2,5], amount = 11\` → \`3\` (5+5+1).`,
        hints: [
          "Greedy (largest coin first) fails — try coins [1,3,4], amount 6.",
          "dp[a] = fewest coins for amount a = 1 + min over coins c of dp[a − c].",
        ],
        solutionMd: `Unbounded-knapsack-family DP over amounts:

\`\`\`typescript
function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
\`\`\`

**O(amount × #coins) time, O(amount) space.** Note the contrast with 0/1 knapsack: here reuse is *allowed*, so iterating amounts upward is exactly right. Greedy fails because local "biggest coin" choices aren't exchange-safe — the counterexample in hint 1 is worth memorizing.`,
      },
    ],
  },

  // ───────────────────── System Design · Fundamentals ─────────────────────
  {
    category: "SYSTEM_DESIGN",
    section: "Fundamentals",
    title: "Scalability Basics",
    slug: "scalability-basics",
    order: 1,
    summary:
      "Vertical vs horizontal scaling, stateless services, the standard architecture evolution story, and back-of-envelope math.",
    contentPath: "system-design/scalability-basics.md",
    prerequisites: [],
    questions: [
      {
        slug: "stateless-vs-sticky",
        title: "The session problem",
        difficulty: "EASY",
        prompt: `Your app stores login sessions in each server's memory. You add a second server behind a load balancer and users start getting randomly logged out. Explain why, then give two fixes and their trade-offs.`,
        hints: [
          "Where does the session live, and which server does the next request hit?",
          "One fix changes the load balancer's behavior; the better one changes where state lives.",
        ],
        solutionMd: `**Why**: sessions are per-server state. The LB routes each request to either server, and the one that didn't create the session doesn't recognize the cookie → logout.

**Fix 1 — sticky sessions**: LB pins each client to one server (cookie/IP hash). Minimal code change, but load skews, and when a server dies its users are all logged out anyway — you've deferred the problem, not solved it.

**Fix 2 — externalize the state** (the real answer): sessions in Redis, or signed stateless tokens (JWT) carried by the client. Any server handles any request; scaling out and instance failure become non-events. Cost: a Redis dependency (or token revocation complexity for JWTs).

The general principle: **statelessness is what makes horizontal scaling work**.`,
      },
      {
        slug: "estimate-qps",
        title: "Back-of-envelope: sizing an API",
        difficulty: "MEDIUM",
        prompt: `A photo-sharing app has 10M daily active users. Each opens the app ~5 times/day; each open causes ~4 API requests and downloads ~2 MB of images. Estimate average and peak API QPS and image bandwidth, and state what you'd check before choosing an instance count.`,
        hints: [
          "A day is ~86,400 seconds; round to 10⁵ for mental math.",
          "Peak traffic is typically 2–5× the average for consumer apps (time-of-day concentration).",
        ],
        solutionMd: `**Requests**: 10⁷ users × 5 opens × 4 requests = 2×10⁸ requests/day. Divided by ~10⁵ seconds → **~2,000 QPS average**, peak ~3× → **~6,000 QPS**.

**Bandwidth**: 10⁷ × 5 × 2 MB = 10⁸ MB/day = 100 TB/day ≈ **~1.2 GB/s average**, ~3.5 GB/s peak — clearly a **CDN problem**, not an app-server problem; images must not transit your API tier.

**Before picking instance count**: measure per-instance capacity (requests/sec at acceptable p99 under a realistic mix), then divide peak by it with ~2× headroom, spread across ≥2 availability zones.

The meta-lesson: separate the *API problem* (thousands of QPS — modest) from the *bytes problem* (gigabytes/sec — CDN/object storage) before designing anything.`,
      },
    ],
  },
  {
    category: "SYSTEM_DESIGN",
    section: "Fundamentals",
    title: "Load Balancing",
    slug: "load-balancing",
    order: 2,
    summary:
      "L4 vs L7, routing algorithms from round robin to consistent hashing, health checks, and avoiding the LB as a SPOF.",
    contentPath: "system-design/load-balancing.md",
    prerequisites: ["scalability-basics"],
    questions: [
      {
        slug: "pick-the-algorithm",
        title: "Pick the right algorithm",
        difficulty: "MEDIUM",
        prompt: `For each scenario, choose a load-balancing algorithm and justify it: (a) a fleet of identical servers serving fast, uniform requests; (b) a report-generation service where requests range from 100 ms to 60 s; (c) a distributed cache tier where each node caches different keys and nodes are occasionally added.`,
        hints: [
          "Where does round robin break down?",
          "For (c): what happens to cache hit rate when the node count changes under plain modulo hashing?",
        ],
        solutionMd: `**(a) Round robin** (or weighted if instance sizes differ) — uniform requests on homogeneous servers need nothing smarter.

**(b) Least connections** — with wildly variable durations, rotation piles long-running reports onto unlucky servers; routing to the fewest active connections self-corrects because busy servers naturally hold connections longer.

**(c) Consistent hashing** — requests for a key must reach the node that cached it, so you need hash-based affinity. Plain \`hash(key) % n\` remaps almost every key when n changes (hit rate craters); a hash ring remaps only ~1/n of the keyspace when a node joins or leaves.

The interview skill: match the algorithm to the *traffic shape and affinity requirement*, not "the best one".`,
      },
    ],
  },
  {
    category: "SYSTEM_DESIGN",
    section: "Fundamentals",
    title: "Caching",
    slug: "caching",
    order: 3,
    summary:
      "Cache layers from browser to database, read/write strategies, invalidation, eviction, and the stampede failure modes.",
    contentPath: "system-design/caching.md",
    prerequisites: ["scalability-basics"],
    questions: [
      {
        slug: "design-product-page-cache",
        title: "Cache a product page",
        difficulty: "MEDIUM",
        prompt: `An e-commerce product page does 5 DB queries and renders in 300 ms at p50; traffic is 95% reads. Design the caching for it: what do you cache, keyed how, with what TTL, and how do updates (price changes) propagate? Then explain what happens when a flash sale makes one product extremely hot and its cache entry expires.`,
        hints: [
          "Cache-aside with a composed object (one key per product) is the default shape.",
          "Price changes: prefer deleting the key over updating it in place — think about the race.",
          "The last part is the cache stampede — name it and give two mitigations.",
        ],
        solutionMd: `**What/key/TTL**: cache the assembled product view (JSON of the 5 queries) in Redis, key \`product:{id}:v{schemaVersion}\`, TTL ~5–15 min as a staleness backstop. Cache-aside: read → miss → build from DB → set.

**Updates**: on price change, **delete** \`product:{id}\` (don't set the new value from the writer — a concurrent reader that read the old DB row could overwrite your update with stale data; delete-on-write + repopulate-on-read is race-resistant). If sellers need read-your-writes, render their own view from the DB.

**Flash-sale expiry = cache stampede**: thousands of concurrent misses on one key slam the DB with the same 5 queries. Mitigations:
- **Single-flight locking**: first miss takes a short Redis lock and rebuilds; others briefly wait or serve slightly-stale data.
- **Background/probabilistic refresh**: refresh hot keys before expiry so they never lapse.
- TTL jitter prevents the *mass* variant across many keys.

Bonus mention: negative-cache lookups of deleted products to blunt penetration.`,
      },
    ],
  },
  {
    category: "SYSTEM_DESIGN",
    section: "Fundamentals",
    title: "Databases: SQL vs NoSQL, Replication & Sharding",
    slug: "databases",
    order: 4,
    summary:
      "Choosing a store, B-tree indexing rules, leader-follower replication and its lag, and when (not) to shard.",
    contentPath: "system-design/databases.md",
    prerequisites: ["scalability-basics"],
    questions: [
      {
        slug: "scale-reads-then-writes",
        title: "Scale a database, in order",
        difficulty: "MEDIUM",
        prompt: `A Postgres instance serving a social app is at 90% CPU. Investigation shows 95% of load is reads of recent posts. Walk through how you'd scale it, in order of increasing cost/complexity, and say at what point you'd reach for sharding. Include the user-visible anomaly that read replicas introduce and how you'd fix it.`,
        hints: [
          "Cheapest first: is the existing box even being used well?",
          "The anomaly: a user posts, the page reloads… from where?",
        ],
        solutionMd: `**Order of operations**:
1. **Optimize in place**: find the top queries (\`pg_stat_statements\`), add missing indexes (recent posts → composite \`(author_id, created_at)\`), fix N+1s. Often ends the story.
2. **Cache**: recent-posts feeds are hot and repetitive — Redis absorbs the bulk of the 95% read load.
3. **Read replicas**: route reads to followers, writes to the leader. Scales reads linearly-ish.
4. **Vertical bump** of the leader for write headroom — writes are still single-node.
5. **Shard** only when *writes* or data size exceed one leader — by user_id (hash) for this workload. Sharding costs cross-shard queries, resharding pain, and an immutable key choice; it's last for a reason.

**The anomaly**: replication lag → a user posts (write to leader), the refresh reads a lagging replica, and their post is *missing* — a read-your-writes violation. Fixes: pin a user's reads to the leader for ~N seconds after they write (session stickiness), or serve their own profile/feed from the leader while fan-out reads use replicas.`,
      },
    ],
  },
  {
    category: "SYSTEM_DESIGN",
    section: "Fundamentals",
    title: "Consistency Models & CAP",
    slug: "consistency-and-cap",
    order: 5,
    summary:
      "What reads may return under replication: CAP during partitions, PACELC otherwise, quorums, and choosing per feature.",
    contentPath: "system-design/consistency-and-cap.md",
    prerequisites: ["databases"],
    questions: [
      {
        slug: "consistency-per-feature",
        title: "Pick a consistency model per feature",
        difficulty: "MEDIUM",
        prompt: `For a marketplace app, assign a consistency requirement to each feature and justify it: (a) the buyer's wallet balance, (b) the product's "142 people viewed this today" counter, (c) the seller editing their own listing and immediately previewing it, (d) inventory count during a flash sale of the last 3 units.`,
        hints: [
          "Ask for each: what breaks — money, trust, or nothing — if a read is stale?",
          "(c) is about *who* must see the write, not everyone.",
        ],
        solutionMd: `**(a) Wallet balance — strong/linearizable.** Money movement must serialize; stale reads enable double-spends. Single-leader transactions or consensus-backed storage.

**(b) View counter — eventual.** Nobody is harmed by 142 vs 147. Count via async increments (or approximate with HyperLogLog); never put this on the strong path.

**(c) Seller preview — read-your-writes (session consistency).** The *seller* must see their own edit immediately; other buyers can lag seconds. Implement by routing the writer's subsequent reads to the leader — full strong consistency is overkill.

**(d) Last-units inventory — strong at the moment of commitment.** Overselling the last 3 units is a broken promise. Browsing can show slightly-stale counts, but the *decrement at checkout* must be an atomic conditional (\`UPDATE … WHERE stock >= qty\`), i.e. strong where it counts.

The pattern interviewers want: **consistency is chosen per operation, and often the write path is strong while the read path is relaxed.**`,
      },
    ],
  },
  {
    category: "SYSTEM_DESIGN",
    section: "Fundamentals",
    title: "Message Queues & Async Processing",
    slug: "message-queues",
    order: 6,
    summary:
      "Task queues vs logs, at-least-once delivery and idempotent consumers, DLQs, ordering, and backpressure.",
    contentPath: "system-design/message-queues.md",
    prerequisites: ["scalability-basics"],
    questions: [
      {
        slug: "idempotent-email-worker",
        title: "The double-send bug",
        difficulty: "MEDIUM",
        prompt: `Your order service enqueues "send confirmation email" jobs to SQS. Occasionally customers receive the same confirmation twice. The worker code looks correct. Explain the root cause and design the fix — plus what you'd add so that a permanently-failing email doesn't retry forever.`,
        hints: [
          "What does SQS guarantee about delivery count? What happens if a worker crashes after sending but before acking?",
          "The fix isn't in SQS settings — it's a property your consumer needs.",
          "For the last part: where do messages go after N failed receives?",
        ],
        solutionMd: `**Root cause: at-least-once delivery.** SQS redelivers any message not deleted within the visibility timeout. A worker that sends the email but crashes (or just exceeds the timeout) before deleting the message → redelivery → second email. No setting removes this; it's the contract.

**Fix: idempotent consumption.** Give each job a stable idempotency key (\`order_id:confirmation\`). Before sending, atomically claim it — e.g. \`INSERT INTO sent_emails (key) …\` with a unique constraint, or Redis \`SET key NX EX 86400\`. Claim succeeded → send; claim failed → duplicate, delete and move on. (Also right-size the visibility timeout relative to worst-case send latency.)

**Permanent failures: dead-letter queue.** Configure a redrive policy (e.g. maxReceiveCount = 5) so poison messages (malformed address, provider rejects) park in a DLQ with alerting, instead of cycling forever and clogging the queue.

Interview soundbite: *"at-least-once delivery + idempotent consumers + DLQ"* is the standard reliable-worker triad.`,
      },
    ],
  },

  // ───────────────────── System Design · Case Studies ─────────────────────
  {
    category: "SYSTEM_DESIGN",
    section: "Case Studies",
    title: "Design a URL Shortener",
    slug: "url-shortener",
    order: 7,
    summary:
      "The classic warm-up: code generation strategies, a read-heavy cache-first redirect path, 301 vs 302, and async analytics.",
    contentPath: "system-design/url-shortener.md",
    prerequisites: ["caching", "databases", "load-balancing"],
    questions: [
      {
        slug: "shortener-full-walkthrough",
        title: "Full interview walkthrough",
        difficulty: "MEDIUM",
        prompt: `Run the complete exercise as if interviewing: design a URL shortener for 100M new URLs/month with a 100:1 read ratio and <50 ms redirect latency. Cover requirements, estimation, API, data model, code generation, the redirect path, and one deep-dive trade-off (301 vs 302). Use the scratchpad, then compare against the solution.`,
        hints: [
          "Do the estimation first — it tells you this is a caching problem, not a sharding problem.",
          "Spend your depth on code generation (counter+base62 vs random-with-retry) — it's where the interviewer probes.",
        ],
        solutionMd: `A strong 35-minute answer, compressed:

**Requirements**: shorten, redirect, optional custom alias + expiry; 100M/month writes (~40/sec — trivial), ~4k reads/sec (12k peak); availability > consistency for redirects; codes non-guessable-ish.

**Estimation → conclusion**: 3 TB over 5 years, tiny write rate, huge read skew ⇒ one relational DB + aggressive caching; sharding is optional insurance, not a requirement.

**API**: \`POST /api/urls {longUrl, customAlias?, expiresAt?}\` → \`{code}\`; \`GET /{code}\` → 302.

**Data model**: \`urls(code PK, long_url, owner_id?, created_at, expires_at?)\` + unique index. That's it — resist inventing tables.

**Code generation**: random 7-char base62 with unique-constraint insert + retry (collision probability negligible at 3.5T keyspace; no coordination, non-sequential). Alternative: range-allocated counter + base62 (no retries, but sequential — scramble if privacy matters). Either is acceptable *with* the justification.

**Redirect path**: LB → stateless API → Redis cache-aside (\`code → long_url\`, TTL + LRU) → DB on miss. Negative-cache misses for 60 s to blunt scanners. p99 well under 50 ms.

**301 vs 302**: 301 lets browsers cache permanently — least load, but you lose per-click analytics and the ability to edit/expire the mapping. 302 keeps every click observable and mappings mutable at ~zero real cost at this scale → **302** unless told analytics don't matter.

**Analytics**: emit click events to a queue; aggregate out-of-band — never synchronous DB writes on the redirect path.`,
      },
    ],
  },
  {
    category: "SYSTEM_DESIGN",
    section: "Case Studies",
    title: "Design a Notification System",
    slug: "notification-system",
    order: 8,
    summary:
      "Multi-channel fan-out behind a queue: idempotency, preference checks, priority tiers, provider rate limits, and DLQs.",
    contentPath: "system-design/notification-system.md",
    prerequisites: ["message-queues", "scalability-basics"],
    questions: [
      {
        slug: "notification-priority-design",
        title: "Campaigns vs OTPs",
        difficulty: "HARD",
        prompt: `Your notification system sends both marketing campaigns (10M pushes over an hour) and OTP login codes (must arrive in seconds, never dropped). A campaign launch is currently delaying OTPs by minutes. Diagnose the failure and redesign the pipeline so both workloads meet their requirements. Address: queue topology, worker scaling, provider rate limits, and what "never dropped" implies end-to-end.`,
        hints: [
          "One shared queue means one shared backlog — what does 10M enqueued campaign messages do to the OTP behind them?",
          "'Never dropped' is a statement about acking, retries, and what happens after max retries.",
        ],
        solutionMd: `**Diagnosis**: head-of-line blocking. A single shared queue puts 10M campaign messages ahead of every OTP; workers drain FIFO, so OTPs wait behind the blast. Autoscaling workers helps but then slams provider rate limits — the campaign consumes the shared quota too.

**Redesign**:
- **Separate queues per priority (and per channel)**: \`otp\` (high) and \`bulk\` (low), each with its own worker pools. OTP workers never touch campaign traffic. This is isolation, not just priority — a poison campaign message can't stall OTPs.
- **Campaign expander**: the campaign isn't enqueued as 10M messages at once; an expander streams the audience into \`bulk\` at a controlled rate (token bucket sized to spare provider quota), so queue depth and provider limits stay sane.
- **Provider quota partitioning**: reserve guaranteed throughput for the OTP pool (dedicated API keys/accounts if the provider supports it); bulk gets the remainder.
- **"Never dropped" end-to-end**: producer persists the OTP send-intent transactionally with the login attempt (outbox pattern) → enqueue with at-least-once delivery → **idempotent** workers (dedupe key = otp_id) → retries with exponential backoff → after N failures, **fallback channel** (SMS → voice call) and page the on-call via DLQ alarm — an OTP in a silent DLQ is still "dropped" from the user's perspective.
- **SLO monitoring**: alert on p99 enqueue→delivered latency per queue, and on bulk backlog age.`,
      },
    ],
  },
];
