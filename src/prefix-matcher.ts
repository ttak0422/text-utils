/** based on lightweight trie. */

import { assertEquals } from "./deps.ts";

class Node<T> {
  value?: T;
  isLeaf: boolean;
  children: { [key: string]: Node<T> };

  constructor(value = undefined) {
    this.value = value;
    this.isLeaf = false;
    this.children = {};
  }
}

export class Matcher<T> {
  root: Node<T>;

  constructor() {
    this.root = new Node<T>();
  }

  register(word: string, value: T): void {
    let node = this.root;
    for (const char of word) {
      if (node.children[char] == undefined) {
        node.children[char] = new Node<T>();
      }
      node = node.children[char];
    }
    node.isLeaf = true;
    node.value = value;
  }

  seek(word: string): T | undefined {
    let node = this.root;
    let longedstMatchValue: T | undefined = undefined;
    for (const char of word) {
      if (node.children[char] == undefined) {
        return longedstMatchValue;
      }
      node = node.children[char];
      if (node.isLeaf) {
        longedstMatchValue = node.value ?? longedstMatchValue;
      }
    }
    return longedstMatchValue;
  }
}

Deno.test("ascii", () => {
  const m = new Matcher<number>();
  m.register("a", 0);
  m.register("ab", 0);
  m.register("abc", 1);
  m.register("abcd", 2);
  m.register("abcdefg", -1);

  assertEquals(m.seek("a"), 0, "case a");
  assertEquals(m.seek("ab"), 0, "case ab");
  assertEquals(m.seek("abc"), 1, "case abc");
  assertEquals(m.seek("abcd"), 2, "case abcd");
  assertEquals(m.seek("abcde"), 2, "case abcde");
  assertEquals(m.seek("abcdefg"), -1, "case abcdefg");
  assertEquals(m.seek("0abcde"), undefined, "case 0abcde");
  assertEquals(m.seek("z"), undefined);
});

Deno.test("ja", () => {
  const m = new Matcher<number>();
  m.register("あ", 0);
  m.register("あい", 0);
  m.register("あいう", 1);
  m.register("あいうえ", 2);
  m.register("あいうえお", 2);
  m.register("あいうえおかき", -1);

  assertEquals(m.seek("あ"), 0, "case あ");
  assertEquals(m.seek("あい"), 0, "case あい");
  assertEquals(m.seek("あいう"), 1, "case あいう");
  assertEquals(m.seek("あいうえ"), 2, "case あいうえ");
  assertEquals(m.seek("あいうえお"), 2, "case あいうえお");
  assertEquals(m.seek("あいうえおかき"), -1, "case あいうえおかき");
  assertEquals(m.seek("んあいうえお"), undefined, "case 0あいうえお");
  assertEquals(m.seek("ん"), undefined);
});

Deno.test("emoji", () => {
  const m = new Matcher<number>();
  m.register("😀", 0);
  m.register("😀😁", 0);
  m.register("😀😁😂", 1);
  m.register("😀😁😂😃", 2);
  m.register("😀😁😂😃😄", 2);
  m.register("😀😁😂😃😄😅😆", -1);

  assertEquals(m.seek("😀"), 0);
  assertEquals(m.seek("😀😁"), 0);
  assertEquals(m.seek("😀😁😂"), 1);
  assertEquals(m.seek("😀😁😂😃"), 2);
  assertEquals(m.seek("😀😁😂😃😄"), 2);
  assertEquals(m.seek("😀😁😂😃😄😅😆"), -1);
  assertEquals(m.seek("🤞😀😁😂😃😄😅😆"), undefined);
  assertEquals(m.seek("🤞"), undefined);
});
