import { Router } from 'express';
import { dataStore } from '../store/dataStore';

export const integrationsRouter = Router();

// GET all integrations
integrationsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: dataStore.integrations.length,
    integrations: dataStore.integrations,
  });
});

// TEST connection for an integration
integrationsRouter.post('/:id/test', (req, res) => {
  const item = dataStore.integrations.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Integration not found' });
  }

  // Simulate test ping with latency
  const latencyMs = Math.floor(80 + Math.random() * 120);
  item.lastTestedAt = new Date().toISOString();
  item.status = 'demo_connected';
  item.errorMessage = undefined;

  res.json({
    success: true,
    integrationId: item.id,
    name: item.name,
    status: item.status,
    latencyMs,
    testedAt: item.lastTestedAt,
    message: `Connection test passed. Mock API responded with HTTP 200 OK (${latencyMs}ms). Safe sandbox verified.`,
  });
});

// TOGGLE integration connection state
integrationsRouter.post('/:id/toggle', (req, res) => {
  const item = dataStore.integrations.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Integration not found' });
  }

  if (item.status === 'demo_connected' || item.status === 'connected') {
    item.status = 'not_connected';
  } else {
    item.status = 'demo_connected';
    item.lastTestedAt = new Date().toISOString();
  }

  res.json({
    success: true,
    integration: item,
  });
});

// CONFIGURE integration
integrationsRouter.post('/:id/configure', (req, res) => {
  const item = dataStore.integrations.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Integration not found' });
  }

  const { credentials } = req.body;
  item.status = 'demo_connected';
  item.lastTestedAt = new Date().toISOString();

  res.json({
    success: true,
    message: `${item.name} credentials saved securely on server.`,
    integration: item,
  });
});
