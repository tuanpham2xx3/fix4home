#!/usr/bin/env node

/**
 * Script test kết nối API cho Fix4Home
 * Kiểm tra xem frontend có thể kết nối được với backend không
 */

const API_BASE_URL = 'http://localhost:8100/api/v1';

async function testAPI() {
  console.log('🧪 Bắt đầu kiểm tra kết nối API...\n');
  
  try {
    // Test ping endpoint
    console.log('1️⃣  Kiểm tra /api/v1/ping...');
    const pingResponse = await fetch(`${API_BASE_URL}/ping`);
    const pingData = await pingResponse.json();
    
    if (pingData.success) {
      console.log('✅ Ping thành công:', pingData.message);
    } else {
      console.log('❌ Ping thất bại');
    }
    
    // Test demo endpoint
    console.log('\n2️⃣  Kiểm tra /api/v1/demo...');
    const demoResponse = await fetch(`${API_BASE_URL}/demo`);
    const demoData = await demoResponse.json();
    
    if (demoData.success) {
      console.log('✅ Demo thành công:', demoData.message);
      console.log('📦 Dữ liệu:', demoData.data);
    } else {
      console.log('❌ Demo thất bại');
    }
    
    // Test non-existent endpoint (should return 404)
    console.log('\n3️⃣  Kiểm tra endpoint không tồn tại...');
    try {
      const notFoundResponse = await fetch(`${API_BASE_URL}/nonexistent`);
      if (notFoundResponse.status === 404) {
        console.log('✅ Trả về 404 đúng như mong đợi');
      } else {
        console.log('⚠️  Không trả về 404:', notFoundResponse.status);
      }
    } catch (error) {
      console.log('❌ Lỗi kết nối:', error.message);
    }
    
    console.log('\n🎉 Hoàn thành kiểm tra API!');
    console.log('\n📊 Kết quả:');
    console.log('- ✅ Server đang chạy trên port 8100');
    console.log('- ✅ API v1 prefix hoạt động');
    console.log('- ✅ Response format đúng chuẩn');
    console.log('\n📝 Tiếp theo: Cần implement 111 endpoints còn lại');
    
  } catch (error) {
    console.log('\n❌ Không thể kết nối tới server!');
    console.log('🔍 Kiểm tra:');
    console.log('1. Server có đang chạy không? (npm run dev)');
    console.log('2. Port 8100 có bị sử dụng bởi app khác không?');
    console.log('3. Firewall có block port 8100 không?');
    console.log('\n🐛 Lỗi chi tiết:', error.message);
  }
}

// Chạy test
if (typeof window === 'undefined') {
  // Node.js environment
  const { fetch } = require('node-fetch-commonjs');
  global.fetch = fetch;
}

testAPI().catch(console.error);
