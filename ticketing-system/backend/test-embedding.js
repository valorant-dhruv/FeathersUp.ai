const EmbeddingService = require('./src/services/EmbeddingService');

async function testEmbeddingService() {
  console.log('Testing Embedding Service Integration...\n');

  const embeddingService = new EmbeddingService();

  // Test 1: Check service availability
  console.log('1. Checking service availability...');
  const status = await embeddingService.getServiceStatus();
  console.log('Service Status:', JSON.stringify(status, null, 2));

  // Test 2: Generate embedding for sample ticket
  console.log('\n2. Testing embedding generation...');
  const sampleTitle = 'Login page not working';
  const sampleDescription = 'Users are unable to log in to the system. Getting error 500 when submitting credentials.';
  
  try {
    const embedding = await embeddingService.generateTicketEmbedding(sampleTitle, sampleDescription);
    if (embedding) {
      console.log('✅ Embedding generated successfully!');
      console.log(`   Dimensions: ${embedding.length}`);
      console.log(`   Sample values: [${embedding.slice(0, 5).join(', ')}...]`);
    } else {
      console.log('❌ Embedding generation failed');
    }
  } catch (error) {
    console.log('❌ Error during embedding generation:', error.message);
  }

  // Test 3: Test with empty text
  console.log('\n3. Testing with empty text...');
  try {
    const emptyEmbedding = await embeddingService.generateTicketEmbedding('', '');
    console.log('Empty text result:', emptyEmbedding);
  } catch (error) {
    console.log('Error with empty text:', error.message);
  }

  console.log('\n✅ Embedding service test completed!');
}

// Run the test
testEmbeddingService().catch(console.error);
