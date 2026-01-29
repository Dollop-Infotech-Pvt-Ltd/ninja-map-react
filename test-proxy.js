// Simple test to verify the proxy is working
// Run this after starting the dev server: npm run dev

async function testProxy() {
  try {
    console.log('Testing proxy endpoint...');
    
    // Test the local proxy endpoint
    const response = await fetch('http://localhost:8080/api/map/search?search=lagos&size=5');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Proxy test successful!');
    console.log(`Found ${data.results?.places?.length || 0} results`);
    console.log('First result:', data.results?.places?.[0]);
    
  } catch (error) {
    console.error('❌ Proxy test failed:', error.message);
    console.log('Make sure the dev server is running: npm run dev');
  }
}

// For Node.js environments
if (typeof window === 'undefined') {
  // Use dynamic import for fetch in Node.js
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testProxy();
  }).catch(() => {
    console.log('Install node-fetch to run this test: npm install node-fetch');
  });
} else {
  // Browser environment
  testProxy();
}