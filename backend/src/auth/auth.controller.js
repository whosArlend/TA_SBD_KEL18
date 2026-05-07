import * as authService from './auth.service.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
        }
        const result = await authService.login(email, password);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const { full_name, email, password, department } = req.body;
        const result = await authService.register({ full_name, email, password, department });
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getMe = async (req, res) => {
    return res.status(200).json({ success: true, data: req.user });
};
