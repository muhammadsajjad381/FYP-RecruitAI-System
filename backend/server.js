require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const interviewRoutes = require('./routes/interviewRoutes');
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const jobRoutes = require('./routes/jobRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// --- Security, Logging, and Parsing Middlewares ---

// Secure HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Performance: Gzip compression
app.use(compression());

// Security: Sanitize data against NoSQL injection (Disabled due to Express 5 conflict)
// app.use(mongoSanitize());

// Security: Prevent XSS attacks (Disabled due to Express 5 conflict)
// app.use(xss());

// Security: Prevent http param pollution (Disabled due to Express 5 conflict)
// app.use(hpp());

// HTTP Request logging with Morgan (piped to Winston)
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads static folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ok', message: 'RecruitAI Backend is running.' });
});

// Mount Routes
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// --- Global Error Handling ---
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server successfully started! Running in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`📡 Listening for incoming requests on port ${PORT}`);
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Force a graceful exit in an ideal structured application architecture
  server.close(() => {
    process.exit(1);
  });
});
