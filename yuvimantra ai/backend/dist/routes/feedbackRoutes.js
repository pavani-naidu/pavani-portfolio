"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController_1 = require("../controllers/feedbackController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Allow authenticated submissions
router.post('/', auth_1.authenticateToken, feedbackController_1.createFeedback);
exports.default = router;
