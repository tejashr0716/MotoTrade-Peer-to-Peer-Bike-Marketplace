/**
 * Zero-Allocation High-Frequency WebSocket Circular Ring Buffer for MotoTrade-Peer-to-Peer-Bike-Marketplace
 * Eliminates Garbage Collection (GC) pauses during 100k events/sec streaming.
 */

export class ZeroAllocationRingBuffer {
  private buffer: Float64Array;
  private capacity: number;
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  constructor(capacity: number = 65536) {
    this.capacity = capacity;
    // Pre-allocated contiguous typed array memory: 0 runtime allocations
    this.buffer = new Float64Array(capacity * 4); // [id, timestamp, price, volume]
  }

  public push(id: number, timestamp: number, price: number, volume: number): boolean {
    const offset = this.head * 4;
    this.buffer[offset] = id;
    this.buffer[offset + 1] = timestamp;
    this.buffer[offset + 2] = price;
    this.buffer[offset + 3] = volume;

    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    } else {
      this.tail = (this.tail + 1) % this.capacity; // Overwrite oldest on overflow
    }
    return true;
  }

  public getLatest(outArray: Float64Array): boolean {
    if (this.count === 0) return false;
    const latestIndex = (this.head - 1 + this.capacity) % this.capacity;
    const offset = latestIndex * 4;
    outArray[0] = this.buffer[offset];
    outArray[1] = this.buffer[offset + 1];
    outArray[2] = this.buffer[offset + 2];
    outArray[3] = this.buffer[offset + 3];
    return true;
  }

  public size(): number {
    return this.count;
  }
}
