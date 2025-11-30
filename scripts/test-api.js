/**
 * Test script for Vercel Functions
 * Usage: node scripts/test-api.js [base-url]
 * Example: node scripts/test-api.js http://localhost:3001
 */

const BASE_URL = process.argv[2] || 'http://localhost:3001';

async function testWikipediaSearch() {
  console.log('\n= Testing Wikipedia Search...');

  const queries = [
    'Tr§n H°ng ¡o',
    'Lý Thái TÕ',
    'Chi¿n th¯ng B¡ch ±ng'
  ];

  for (const query of queries) {
    try {
      const url = `${BASE_URL}/api/history/search?q=${encodeURIComponent(query)}&limit=2`;
      console.log(`\n  Query: ${query}`);
      console.log(`  URL: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.found) {
        console.log(`   Success (strategy: ${data.strategy})`);
        console.log(`  Results: ${data.pages.length} pages`);
        if (data.pages[0]) {
          console.log(`  First result: ${data.pages[0].title}`);
        }
      } else {
        console.log(`  L Failed: ${data.error || 'No results'}`);
      }
    } catch (error) {
      console.log(`  L Error: ${error.message}`);
    }
  }
}

async function testGeminiChat() {
  console.log('\n=¬ Testing Gemini Chat...');

  const messages = [
    'Ai là Tr§n H°ng ¡o?',
    'LËch sí ViÇt Nam có bao nhiêu triÁu ¡i?'
  ];

  for (const message of messages) {
    try {
      const url = `${BASE_URL}/api/gemini/chat`;
      console.log(`\n  Message: ${message}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        console.log(`   Success`);
        console.log(`  Reply: ${data.reply.substring(0, 100)}...`);
      } else {
        console.log(`  L Failed: ${data.error || data.message}`);
      }
    } catch (error) {
      console.log(`  L Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log(`\n>ê Testing Vercel Functions at: ${BASE_URL}\n`);
  console.log('=' .repeat(60));

  await testWikipediaSearch();
  await testGeminiChat();

  console.log('\n' + '='.repeat(60));
  console.log('\n Tests completed!\n');
}

main().catch(console.error);
