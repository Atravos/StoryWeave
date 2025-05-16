require('dotenv').config();
const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');

const defaultPrompts = [
  {
    text: 'A mysterious door appears in a forest that wasn\'t there yesterday...',
    category: 'fantasy',
    tags: ['mystery', 'magic', 'forest']
  },
  {
    text: 'The spaceship\'s AI suddenly develops a peculiar obsession...',
    category: 'sci-fi',
    tags: ['AI', 'space', 'humor']
  },
  {
    text: 'At the reading of a will, everyone receives a key to a different lock...',
    category: 'mystery',
    tags: ['inheritance', 'secrets', 'puzzle']
  },
  {
    text: 'Two strangers discover they\'ve been writing to the same fictional pen pal...',
    category: 'romance',
    tags: ['coincidence', 'letters', 'connection']
  },
  {
    text: 'A small town\'s residents start to remember events that never happened...',
    category: 'horror',
    tags: ['memory', 'small town', 'psychological']
  },
  {
    text: 'A chef\'s signature dish starts causing peculiar side effects...',
    category: 'comedy',
    tags: ['food', 'magic', 'restaurant']
  },
  {
    text: 'On your birthday, you receive a letter you wrote to yourself five years ago...',
    category: 'random',
    tags: ['time', 'self-reflection', 'surprise']
  },
  {
    text: 'A librarian discovers a book that seems to be writing itself in real-time...',
    category: 'fantasy',
    tags: ['books', 'magic', 'prophecy']
  },
  {
    text: 'Every night at exactly 3:33 AM, all electronic devices display the same message...',
    category: 'sci-fi',
    tags: ['technology', 'mystery', 'communication']
  },
  {
    text: 'During a routine home renovation, a family discovers something hidden in the walls...',
    category: 'mystery',
    tags: ['house', 'secrets', 'history']
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing prompts
      await Prompt.deleteMany({});
      console.log('Cleared existing prompts');
      
      // Insert default prompts
      await Prompt.insertMany(defaultPrompts);
      console.log('Default prompts seeded successfully!');
    } catch (err) {
      console.error('Error seeding prompts:', err);
    }
    
    // Disconnect from database
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
