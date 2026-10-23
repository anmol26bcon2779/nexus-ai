import express from 'express';
import cors from 'cors';
import { ordersRouter } from './routes/ordersRoutes';
import { workflowsRouter } from './routes/workflowsRoutes';
import { integrationsRouter } from './routes/integrationsRoutes';
import { leadsRouter } from './routes/leadsRoutes';
import { approvalsRouter } from './routes/approvalsRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';
import { logsRouter } from './routes/logsRoutes';
import { assistantRouter } from './routes/assistantRoutes';
import { settingsRouter } from './routes/settingsRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'NEXUS AI Enterprise Automater API',
    tagline: 'One workspace. Every tool. Smarter business.',
    timestamp: new Date().toISOString(),
    demoMode: true,
  });
});

// API Routes
app.use('/api/orders', ordersRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/settings', settingsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`[NEXUS AI] Backend API Engine running at http://localhost:${PORT}`);
  console.log(`[NEXUS AI] Safe Demo Sandbox active. Logistics & automation adapters ready.`);
});

export default app;
