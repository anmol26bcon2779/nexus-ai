import { Router } from 'express';
import { dataStore } from '../store/dataStore';

export const logsRouter = Router();

// GET all execution logs
logsRouter.get('/', (req, res) => {
  const { limit = 50, status } = req.query;
  let logs = [...dataStore.executionLogs];

  if (status && status !== 'all') {
    logs = logs.filter((l) => l.status === status);
  }

  res.json({
    success: true,
    count: logs.length,
    logs: logs.slice(0, Number(limit)),
  });
});

// GET single execution log with detailed step payloads
logsRouter.get('/:id', (req, res) => {
  const log = dataStore.executionLogs.find((l) => l.id === req.params.id);
  if (!log) {
    return res.status(404).json({ success: false, message: 'Execution log not found' });
  }

  res.json({
    success: true,
    log,
  });
});
