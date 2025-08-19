/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.ts';
import materialsRoutes from './routes/materials.ts';
import movementsRoutes from './routes/movements.ts';
import machinesRoutes from './routes/machines.ts';
import workOrdersRoutes from './routes/workorders.ts';
import dashboardRoutes from './routes/dashboard.ts';
import adminRoutes from './routes/admin.ts';
import reportsRoutes from './routes/reports.ts';
import suppliersRoutes from './routes/suppliers.ts';
import categoriesRoutes from './routes/categories.ts';
import settingsRoutes from './routes/settings.ts';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();


const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/movements', movementsRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/workorders', workOrdersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings', settingsRoutes);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

/**
 * test endpoint to check Supabase data
 */
app.use('/api/test/materials', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dbAdmin } = await import('./lib/supabase.ts');
    const materials = await dbAdmin.materials.getAll();
    res.status(200).json({
      success: true,
      data: materials,
      count: materials.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;