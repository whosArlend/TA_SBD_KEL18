import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tekspace-secret-fallback';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah expired' });
    }
};
