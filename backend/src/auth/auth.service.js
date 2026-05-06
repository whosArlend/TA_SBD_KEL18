import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepo from './auth.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tekspace-secret-fallback';
const JWT_EXPIRES_IN = '7d';

function normalizeRole(raw) {
    if (!raw) return 'user';
    const r = raw.toLowerCase();
    if (r === 'admin' || r === 'system admin') return 'admin';
    return 'user'; // mahasiswa, dosen, student, dll → user
}

function signToken(user) {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role: normalizeRole(user.role),
            full_name: user.full_name,
            department: user.department ?? null,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export const login = async (email, password) => {
    const user = await authRepo.findUserByEmail(email);
    if (!user) throw new Error('Email atau password salah');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error('Email atau password salah');

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;
    return { token, user: { ...safeUser, role: normalizeRole(user.role) } };
};

export const register = async ({ full_name, email, password, department }) => {
    if (!full_name) throw new Error('Nama lengkap wajib diisi');
    if (!email) throw new Error('Email wajib diisi');
    if (!password || password.length < 8) throw new Error('Password minimal 8 karakter');

    const exists = await authRepo.emailExists(email);
    if (exists) throw new Error('Email sudah terdaftar');

    const password_hash = await bcrypt.hash(password, 10);
    const user = await authRepo.createUser({ full_name, email, password_hash, department });

    const token = signToken(user);
    return { token, user: { ...user, role: normalizeRole(user.role) } };
};
