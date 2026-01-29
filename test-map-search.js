// Test script for the new Map Search API integration
import { searchPlaces } from './client/lib/mapSearchApi.js';

async function testMapSearch() {
  try {
    console.log("Testing Map Search API...");
    
    const query = "lagos";
    console.log(`Searching for: ${query}`);
    
    const results = await searchPlaces(query, 10);
    
    console.log("Search Results:", JSON.stringify(results, null, 2));
    
    if (results.length > 0) {
      console.log(`✅ API integration test successful! Found ${results.length} results.`);
      console.log("First result:", results[0]);
    } else {
      console.log("⚠️ No results returned from API");
    }
    
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testMapSearch();
} else {
  // Browser environment
  window.testMapSearch = testMapSearch;
  console.log("Test function available as window.testMapSearch()");
}