const express = require('express');
const router = express.Router();
const conditionalAuth = require('../middleware/conditional-auth'); // Switches based on ENABLE_AUTH_BYPASS flag

// Get user's agents
router.get('/', conditionalAuth, async (req, res) => {
  try {
    // Mock agents - replace with database query
    const agents = [];
    res.json({ agents });
  } catch (error) {
    console.error('Agent fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Deploy new agent
router.post('/deploy', conditionalAuth, async (req, res) => {
  try {
    const { name, description, budget } = req.body;
    const { nullifier } = req.user;

    if (!name || !description || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create agent (mock - replace with actual agent creation)
    const agent = {
      id: Date.now().toString(),
      name,
      description,
      budget: parseFloat(budget),
      spent: 0,
      status: 'active',
      nullifier,
    };

    res.json({ success: true, agent });
  } catch (error) {
    console.error('Agent deployment error:', error);
    res.status(500).json({ error: 'Failed to deploy agent' });
  }
});

module.exports = router;

