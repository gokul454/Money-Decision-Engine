"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const transaction_controller_js_1 = require("../controllers/transaction.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validation_middleware_js_1 = require("../middleware/validation.middleware.js");
const router = (0, express_1.Router)();
const transactionSchema = zod_1.z.object({
    type: zod_1.z.enum(['expense', 'income', 'transfer']).default('expense'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    category: zod_1.z.string().min(1, 'Category is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    merchant: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(['UPI', 'Card', 'Cash', 'NetBanking']).default('UPI'),
    transactionDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    isImpulse: zod_1.z.boolean().optional(),
    timeOfDay: zod_1.z.string().optional(),
});
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', transaction_controller_js_1.TransactionController.list);
router.post('/', (0, validation_middleware_js_1.validateBody)(transactionSchema), transaction_controller_js_1.TransactionController.create);
router.get('/:id', transaction_controller_js_1.TransactionController.getById);
router.put('/:id', transaction_controller_js_1.TransactionController.update);
router.delete('/:id', transaction_controller_js_1.TransactionController.delete);
exports.default = router;
