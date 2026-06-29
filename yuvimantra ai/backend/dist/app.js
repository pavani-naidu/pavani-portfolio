"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environmental variables
dotenv_1.default.config();
// Imports routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const moodRoutes_1 = __importDefault(require("./routes/moodRoutes"));
const journalRoutes_1 = __importDefault(require("./routes/journalRoutes"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // For demo / local development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting: 100 requests per 15 minutes per IP
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        mongodb: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});
// Bind routers
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/chats', chatRoutes_1.default);
app.use('/api/moods', moodRoutes_1.default);
app.use('/api/journals', journalRoutes_1.default);
app.use('/api/habits', habitRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/feedbacks', feedbackRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});
// Connect to MongoDB & Start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yuvimantra';
app.listen(PORT, () => {
    console.log(`[Server] YuviMantra AI server running on port ${PORT}`);
    mongoose_1.default
        .connect(MONGODB_URI)
        .then(() => {
        console.log('[Database] MongoDB connected successfully.');
    })
        .catch((err) => {
        console.warn('[Database] MongoDB connection offline. Entering Local Memory Mode.');
    });
});
exports.default = app;
