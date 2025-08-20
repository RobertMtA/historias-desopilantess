const StoryInteraction = require('./models/StoryInteraction');
const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    const stories = await StoryInteraction.find({});
    
    console.log(`\n📊 Datos encontrados: ${stories.length} historias\n`);
    
    stories.forEach(story => {
      console.log(`Historia ${story.storyId}:`);
      console.log(`  👍 Likes: ${story.likes}`);
      console.log(`  💬 Comentarios: ${story.comments.length}`);
      console.log(`  🌐 IPs que dieron like: ${story.likedIPs.length}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
