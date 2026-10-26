"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, currency } = req.body;
            const result = await auth_service_js_1.AuthService.register({ name, email, password, currency });
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_js_1.AuthService.login({ email, password });
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }
    static async me(req, res) {
        try {
            const user = await auth_service_js_1.AuthService.findById(req.userId);
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            res.json({
                success: true,
                data: {
                    id: user._id?.toString() || user.id,
                    name: user.name,
                    email: user.email,
                    currency: user.currency || 'INR',
                    levelTitle: user.levelTitle || 'Level 2 Money Smart',
                },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AuthController = AuthController;
