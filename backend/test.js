// fetch is globally available in Node v18+
// Since Node 18+, fetch is available globally. Let's just use it.

const TEST_URL = 'http://localhost:3000/bfhl';

const testCases = [
  {
    name: "Valid Tree - Simple",
    input: ["A->B", "A->C", "B->D"],
    expectedValid: true
  },
  {
    name: "Cycle Detection",
    input: ["X->Y", "Y->Z", "Z->X"],
    expectedCycle: true
  },
  {
    name: "Duplicates and Invalids",
    input: ["A->B", "A->B", "invalid", "123"],
    expectedInvalidsCount: 2,
    expectedDuplicatesCount: 1
  },
  {
    name: "Multi-parent (Diamond)",
    input: ["A->C", "B->C"],
    // C has two parents. B->C should be silently ignored.
    expectedValid: true
  }
];

async function runTests() {
  console.log("Starting backend tests...\n");
  for (const tc of testCases) {
    try {
      const response = await fetch(TEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: tc.input })
      });
      
      const result = await response.json();
      console.log(`[TEST]: ${tc.name}`);
      console.log(`Input: ${JSON.stringify(tc.input)}`);
      
      let passed = true;
      
      if (tc.expectedCycle) {
        if (result.summary.total_cycles < 1) passed = false;
      }
      
      if (tc.expectedInvalidsCount !== undefined) {
        if (result.invalid_entries.length !== tc.expectedInvalidsCount) passed = false;
      }

      if (tc.expectedDuplicatesCount !== undefined) {
        if (result.duplicate_edges.length !== tc.expectedDuplicatesCount) passed = false;
      }

      console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log("Response:", JSON.stringify(result, null, 2));
      console.log("--------------------------------------------------\n");
    } catch (e) {
      console.error(`[TEST]: ${tc.name} ❌ FAILED (Error: ${e.message})`);
    }
  }
  console.log("Testing complete.");
}

runTests();
