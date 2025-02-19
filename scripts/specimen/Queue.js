"use strict";
//pasted straight from a website sadge

class QueueNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.front = null;  
        this.rear = null; 
        this.size = 0; 
    }
    enqueue(data) {
        const newNode = new QueueNode(data);
        if (this.isEmpty()) {
            this.front = newNode;
            this.rear = newNode;
        } else {
            this.rear.next = newNode;
            this.rear = newNode;
        }
        this.size++;
    }
    dequeue() {
        if (this.isEmpty()) {
            return null; 
        }
        const removedNode = this.front;
        this.front = this.front.next;
        if (this.front === null) {
            this.rear = null;
        }
        this.size--;
        return removedNode.data;
    }
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.front.data;
    }
    isEmpty() {
        return this.size === 0;
    }
    getSize() {
        return this.size;
    }
    print() {
        let current = this.front;
        const elements = [];
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log(elements.join(' -> '));
    }
}