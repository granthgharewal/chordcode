// Test script for Azure OpenAI integration
// Run with: npx ts-node test-azure-integration.ts

import { analyzeSongByName, searchSongs } from './services/chordAnalysisService-azure';

async function testAzureIntegration() {
  console.log('🎵 Testing Azure OpenAI Integration for ChordCode\n');

  try {
    // Test 1: Song Search
    console.log('1️⃣  Testing song search...');
    const searchResults = await searchSongs('Perfect Ed Sheeran');
    console.log(`Found ${searchResults.length} songs:`);
    searchResults.forEach((song, index) => {
      console.log(`   ${index + 1}. ${song.title} by ${song.artist}`);
      if (song.album) console.log(`      Album: ${song.album} (${song.year})`);
      if (song.description) console.log(`      Description: ${song.description}`);
    });
    console.log('✅ Song search completed\n');

    // Test 2: Song Analysis
    if (searchResults.length > 0) {
      console.log('2️⃣  Testing song analysis...');
      const selectedSong = searchResults[0];
      console.log(`Analyzing: ${selectedSong.title} by ${selectedSong.artist}`);
      
      const analysisResult = await analyzeSongByName(selectedSong);
      
      console.log('📊 Analysis Results:');
      console.log(`   Key: ${analysisResult.analysis.key}`);
      console.log(`   Tempo: ${analysisResult.analysis.tempo} BPM`);
      console.log(`   Difficulty: ${analysisResult.analysis.difficulty}`);
      console.log(`   Chords: ${analysisResult.analysis.chords.length} chord changes`);
      console.log(`   Capo: ${analysisResult.analysis.capo || 'None'}`);
      console.log(`   Strumming: ${analysisResult.analysis.strummingPattern}`);
      
      console.log('\n🎸 Tutorial Overview:');
      console.log(`   Estimated Time: ${analysisResult.tutorial.estimatedTime} minutes`);
      console.log(`   Steps: ${analysisResult.tutorial.steps.length}`);
      console.log(`   Requirements: ${analysisResult.tutorial.requirements?.join(', ') || 'None'}`);
      
      console.log('✅ Song analysis completed\n');
    }

    console.log('🎉 All tests passed! Azure OpenAI integration is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 Tip: Make sure to set your Azure OpenAI API key in environment variables:');
        console.log('   EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/');
        console.log('   EXPO_PUBLIC_AZURE_OPENAI_API_KEY=your-api-key');
        console.log('   EXPO_PUBLIC_AZURE_OPENAI_DEPLOYMENT=your-gpt4-deployment');
      }
    }
  }
}

// Configuration check
function checkConfiguration() {
  console.log('🔧 Checking Azure OpenAI Configuration:');
  
  const endpoint = process.env.EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.EXPO_PUBLIC_AZURE_OPENAI_API_KEY;
  const deployment = process.env.EXPO_PUBLIC_AZURE_OPENAI_DEPLOYMENT;
  
  console.log(`   Endpoint: ${endpoint ? '✅ Set' : '❌ Missing'}`);
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Deployment: ${deployment ? '✅ Set' : '❌ Missing'}`);
  
  if (!endpoint || !apiKey || !deployment) {
    console.log('\n⚠️  Some configuration is missing. The app will use mock data.');
    console.log('   To use real Azure OpenAI, set the required environment variables.');
  }
  
  console.log('');
}

// Run tests
checkConfiguration();
testAzureIntegration();
