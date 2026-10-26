"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const money_controller_js_1 = require("../controllers/money.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validation_middleware_js_1 = require("../middleware/validation.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
const affordabilitySchema = zod_1.z.object({
    itemName: zod_1.z.string().min(1, 'Item name is required'),
    itemPrice: zod_1.z.number().positive('Price must be greater than 0'),
    category: zod_1.z.string().optional(),
});
router.post('/check', (0, validation_middleware_js_1.validateBody)(affordabilitySchema), money_controller_js_1.AffordabilityController.check);
exports.default = router;
