/**
 * Development server entry point
 */
import app from './app.ts';

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🔧 Work Orders API: http://localhost:${PORT}/api/workorders`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});