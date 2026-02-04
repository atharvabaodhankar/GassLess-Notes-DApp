const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSecurity() {
  console.log('🔒 Testing Backend Security Features...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: Health check with valid origin
    console.log('1️⃣ Testing CORS with valid origin...');
    const validResponse = await fetch(`${baseURL}/health`, {
      headers: { 'Origin': 'http://localhost:5174' }
    });
    
    if (validResponse.ok) {
      const data = await validResponse.json();
      console.log('✅ Valid origin accepted');
      console.log('📍 CORS config:', data.cors);
      console.log('📍 Rate limits:', data.rateLimits);
    }
    
    // Test 2: Health check with invalid origin
    console.log('\n2️⃣ Testing CORS with invalid origin...');
    try {
      const invalidResponse = await fetch(`${baseURL}/health`, {
        headers: { 'Origin': 'http://malicious-site.com' }
      });
      
      if (!invalidResponse.ok) {
        console.log('✅ Invalid origin blocked (as expected)');
      } else {
        console.log('❌ Invalid origin was allowed (security issue!)');
      }
    } catch (error) {
      console.log('✅ Invalid origin blocked with error (as expected)');
    }
    
    // Test 3: Check security headers
    console.log('\n3️⃣ Testing security headers...');
    const headerResponse = await fetch(`${baseURL}/health`, {
      headers: { 'Origin': 'http://localhost:5174' }
    });
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'referrer-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy'
    ];
    
    securityHeaders.forEach(header => {
      const value = headerResponse.headers.get(header);
      if (value) {
        console.log(`✅ ${header}: ${value}`);
      } else {
        console.log(`❌ Missing security header: ${header}`);
      }
    });
    
    // Test 4: Rate limiting (make multiple requests)
    console.log('\n4️⃣ Testing rate limiting...');
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        fetch(`${baseURL}/health`, {
          headers: { 'Origin': 'http://localhost:5174' }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimitHeaders = responses[0].headers;
    
    console.log('✅ Rate limit headers:');
    console.log(`   X-RateLimit-Limit: ${rateLimitHeaders.get('x-ratelimit-limit')}`);
    console.log(`   X-RateLimit-Remaining: ${rateLimitHeaders.get('x-ratelimit-remaining')}`);
    console.log(`   X-RateLimit-Reset: ${rateLimitHeaders.get('x-ratelimit-reset')}`);
    
    // Test 5: Blockchain endpoint rate limiting
    console.log('\n5️⃣ Testing blockchain endpoint rate limiting...');
    const blockchainResponse = await fetch(`${baseURL}/api/blockchain/status`, {
      headers: { 'Origin': 'http://localhost:5174' }
    });
    
    if (blockchainResponse.ok) {
      console.log('✅ Blockchain endpoint accessible');
      console.log(`   X-RateLimit-Limit: ${blockchainResponse.headers.get('x-ratelimit-limit')}`);
      console.log(`   X-RateLimit-Remaining: ${blockchainResponse.headers.get('x-ratelimit-remaining')}`);
    }
    
    console.log('\n🎉 Security test completed!');
    
  } catch (error) {
    console.error('❌ Security test failed:', error.message);
  }
}

testSecurity();