class Node {
    constructor(value) {
      this.value = value;
      this.next = null;
      this.prev = null;
    }
  }
  
  class LinkedList {
    constructor() {
      this.head = null;
      this.tail = null;
      this.size = 0;
    }
  
    appendRight(value) {
      this.size++;
      const newNode = new Node(value);
      if (!this.head) {
        this.head = newNode;
        this.tail = newNode;
        return;
      }
  
      this.tail.next = newNode;
      this.tail.next.prev = this.tail;
      this.tail = this.tail.next;
      
    }

    appendLeft(value)
    {
        this.size++;
        const newNode = new Node(value);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            return;
        }
        newNode.next = this.head;
        this.head.prev = newNode;
        this.head = this.head.prev;
        
    }

    handleNeg(ind, size)
    {
        if(ind >= 0)
            return ind;
        return size + ind;
    }
  
    lrange(start, end) {
      let currentNode = this.head;
      const res = [];
      let index = 0;
      start = this.handleNeg(start, this.size);
      end = this.handleNeg(end, this.size);
      while (currentNode && index <= end) {
        if(index >= start && index <= end){
            res.push(currentNode.value);
        }
        currentNode = currentNode.next;
        index++;
      }
      return res;
    }
  }

  module.exports = LinkedList;
  
  const linkedList = new LinkedList();
  
  linkedList.appendRight(1);
  linkedList.appendRight(2);
  linkedList.appendLeft(3);
  
  console.log(linkedList.lrange(0, -4));
  