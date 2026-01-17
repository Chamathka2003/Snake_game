// LinkedList Node class
export class ListNode {
  x: number;
  y: number;
  next: ListNode | null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.next = null;
  }
}

// LinkedList class for managing the snake
export class LinkedList {
  head: ListNode | null;
  tail: ListNode | null;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // Add a new segment to the head (front of snake)
  addToHead(x: number, y: number): void {
    const newNode = new ListNode(x, y);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    
    this.length++;
  }

  // Remove the tail segment (back of snake)
  removeTail(): ListNode | null {
    if (!this.head) return null;
    
    if (this.head === this.tail) {
      const removed = this.tail;
      this.head = null;
      this.tail = null;
      this.length = 0;
      return removed;
    }

    let current = this.head;
    while (current.next !== this.tail) {
      current = current.next!;
    }

    const removed = this.tail;
    current.next = null;
    this.tail = current;
    this.length--;
    return removed;
  }

  // Convert linked list to array for rendering
  toArray(): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = [];
    let current = this.head;
    
    while (current) {
      result.push({ x: current.x, y: current.y });
      current = current.next;
    }
    
    return result;
  }

  // Check if position exists in the linked list
  contains(x: number, y: number): boolean {
    let current = this.head;
    
    while (current) {
      if (current.x === x && current.y === y) {
        return true;
      }
      current = current.next;
    }
    
    return false;
  }

  // Get the head position
  getHead(): { x: number; y: number } | null {
    return this.head ? { x: this.head.x, y: this.head.y } : null;
  }

  // Clear the entire list
  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}
