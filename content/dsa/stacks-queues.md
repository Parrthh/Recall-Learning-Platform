## Theory

- A **stack** is LIFO: push and pop at the same end, both O(1). It models nesting (parentheses, call frames, undo) and "most recent unresolved thing".
- A **queue** is FIFO: enqueue at the back, dequeue at the front. It models fair processing order and is the engine of BFS.

The interview superpower here is the **monotonic stack**: a stack whose elements are kept in sorted order *by construction* — before pushing, pop everything that violates the order. It answers "nearest greater/smaller element to the left/right" questions in O(n), which unlock histogram areas, daily temperatures, stock spans, and window maximums (as a deque).

## Pattern

**Matching/nesting** — valid parentheses:

```typescript
// O(n) time, O(n) space
function isValid(s: string): boolean {
  const closer: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (stack.pop() !== closer[ch]) return false;
  }
  return stack.length === 0;
}
```

**Monotonic stack** — next greater element to the right:

```typescript
// result[i] = first element right of i that is larger, else -1.
// O(n) time (each index pushed & popped once), O(n) space.
function nextGreater(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(-1);
  const stack: number[] = []; // indices with strictly decreasing values
  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop()!] = nums[i]; // nums[i] is their answer
    }
    stack.push(i);
  }
  return result;
}
```

Choosing the stack's direction: keep it **decreasing** to find the next *greater* element (an incoming larger value resolves the stack's tops), **increasing** to find the next *smaller*.

### Complexity of this pattern

Stack/queue operations are O(1); monotonic stack algorithms are **O(n) time amortized** — despite the nested `while`, every element is pushed exactly once and popped at most once — and **O(n) space** worst case (strictly decreasing input).

## Common Pitfalls

- Implementing a queue with `array.shift()` — that's O(n) per dequeue. Use an index pointer or a deque.
- Popping from an empty stack — guard `stack.length > 0` in the while condition *before* peeking.
- Strict vs non-strict comparisons in monotonic stacks (`<` vs `<=`) change how duplicates resolve — pick based on whether equal elements should "answer" each other.
- Forgetting leftover stack items at the end — for "next greater" they correctly stay −1, but for span/area problems they usually need a final flush pass (sentinel values help).

## Related Topics

- Prerequisite: **Arrays, Strings & Hashing**.
- Queues drive breadth-first traversal: **Graphs** and **Trees**.
- Window max/min via monotonic deque extends **Sliding Window**.
