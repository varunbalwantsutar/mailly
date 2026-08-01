import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import contactsRoutes from './routes/contactsRoutes.js';
import audiencesRoutes from './routes/audiencesRoutes.js';
import campaignsRoutes from './routes/campaignsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { emailQueue } from './queues/emailQueue.js'; // Ensure worker/queue are loaded

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

// Configure CORS to allow frontend communication with credentials
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isVercel = origin.endsWith('.vercel.app');
    if (isLocal || isVercel || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/audiences', audiencesRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/dashboard', dashboardRoutes);





// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`Mailly Backend Server running on port ${PORT}`);
  console.log(`Email worker and queue initialized.`);
});

export default app;
export { server };
