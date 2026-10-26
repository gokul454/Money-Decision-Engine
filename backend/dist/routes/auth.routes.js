"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const validation_middleware_js_1 = require("../middleware/validation.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    currency: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
router.post('/register', (0, validation_middleware_js_1.validateBody)(registerSchema), auth_controller_js_1.AuthController.register);
router.post('/login', (0, validation_middleware_js_1.validateBody)(loginSchema), auth_controller_js_1.AuthController.login);
router.get('/me', auth_middleware_js_1.authMiddleware, auth_controller_js_1.AuthController.me);
exports.default = router;
