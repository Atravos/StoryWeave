// server/routes/prompts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Prompt = require('../models/Prompt');

// Get random prompt (optionally by category)
router.get('/random', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }

    // Count total prompts matching the query
    const count = await Prompt.countDocuments(query);
    
    if (count === 0) {
      return res.status(404).json({ message: 'No prompts found for this category' });
    }

    // Get a random prompt
    const random = Math.floor(Math.random() * count);
    const prompt = await Prompt.findOne(query).skip(random);

    res.json(prompt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get prompts by category
router.get('/category/:category', async (req, res) => {
  try {
    const prompts = await Prompt.find({ 
      category: req.params.category 
    }).sort({ usageCount: -1 });

    res.json(prompts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create new custom prompt
router.post('/', auth, async (req, res) => {
  try {
    const { text, category, tags } = req.body;

    const prompt = new Prompt({
      text,
      category: category || 'random',
      tags: tags || [],
      creator: req.user.id,
      isCustom: true
    });

    await prompt.save();

    res.status(201).json(prompt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all prompts (admin only or paginated)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const prompts = await Prompt.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ category: 1, usageCount: -1 });

    const total = await Prompt.countDocuments(query);

    res.json({
      prompts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Seed default prompts (for development)
router.post('/seed', async (req, res) => {
  try {
    // Only run this in development environment
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }

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

    await Prompt.deleteMany({}); // Clear existing prompts
    await Prompt.insertMany(defaultPrompts);

    res.status(201).json({ message: 'Default prompts seeded successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;