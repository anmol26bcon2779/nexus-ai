import { Router } from 'express';
import { dataStore } from '../store/dataStore';

export const settingsRouter = Router();

// GET settings
settingsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    settings: dataStore.settings,
  });
});

// UPDATE settings
settingsRouter.put('/', (req, res) => {
  const updates = req.body;
  dataStore.settings = {
    ...dataStore.settings,
    ...updates,
  };

  res.json({
    success: true,
    message: 'System settings updated successfully.',
    settings: dataStore.settings,
  });
});
