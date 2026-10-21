//! Titan Bare-Metal Native Accelerator for MotoTrade-Peer-to-Peer-Bike-Marketplace
//! Compiled with: RUSTFLAGS="-C target-cpu=native -C opt-level=3"
//! Provides AVX2/FMA hardware SIMD dot products and lock-free atomic ring buffers.

use std::sync::atomic::{AtomicUsize, Ordering};

#[repr(C)]
pub struct FastRingBuffer {
    head: AtomicUsize,
    tail: AtomicUsize,
    capacity: usize,
    data: *mut f64,
}

impl FastRingBuffer {
    pub fn new(capacity: usize) -> Self {
        let mut buffer = Vec::with_capacity(capacity * 4);
        let ptr = buffer.as_mut_ptr();
        std::mem::forget(buffer);
        Self {
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
            capacity,
            data: ptr,
        }
    }

    #[inline(always)]
    pub fn push_atomic(&self, id: f64, timestamp: f64, price: f64, volume: f64) -> bool {
        let current_head = self.head.fetch_add(1, Ordering::AcqRel);
        let offset = (current_head % self.capacity) * 4;
        unsafe {
            *self.data.add(offset) = id;
            *self.data.add(offset + 1) = timestamp;
            *self.data.add(offset + 2) = price;
            *self.data.add(offset + 3) = volume;
        }
        true
    }
}

/// AVX2 Hardware SIMD 512-dimensional vector dot-product
#[target_feature(enable = "avx2,fma")]
pub unsafe fn simd_dot_product_avx2(a: &[f32], b: &[f32]) -> f32 {
    #[cfg(target_arch = "x86_64")]
    {
        use std::arch::x86_64::*;
        let mut sum = _mm256_setzero_ps();
        let chunks = a.len() / 8;
        for i in 0..chunks {
            let va = _mm256_loadu_ps(a.as_ptr().add(i * 8));
            let vb = _mm256_loadu_ps(b.as_ptr().add(i * 8));
            sum = _mm256_fmadd_ps(va, vb, sum);
        }
        let mut buffer = [0.0f32; 8];
        _mm256_storeu_ps(buffer.as_mut_ptr(), sum);
        buffer.iter().sum()
    }
    #[cfg(not(target_arch = "x86_64"))]
    {
        a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
    }
}
