const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { taskValidationRules, validate } = require('../middleware/validate');

// ─── GET /api/tasks ─────────────────────────────────────────────────────────
// Query params: status, priority, category, search, sort, page, limit
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, search, sort = 'createdAt_desc', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Build sort object
    const sortMap = {
      createdAt_desc: { createdAt: -1 },
      createdAt_asc: { createdAt: 1 },
      due_asc: { due: 1 },
      due_desc: { due: -1 },
      priority: { priority: 1 },
      title: { title: 1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: tasks,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
router.post('/', taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, priority, category, due, status } = req.body;
    const task = await Task.create({ title, description, priority, category, due, status });
    res.status(201).json({ success: true, data: task, message: 'Task created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────
router.put('/:id', taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, priority, category, due, status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, category, due, status },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task, message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
// Lightweight endpoint to toggle status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status value' });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── GET /api/tasks/stats/summary ────────────────────────────────────────────
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const priorityStats = await Task.aggregate([
      { $match: { status: { $ne: 'done' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { byStatus: stats, byPriority: priorityStats } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
