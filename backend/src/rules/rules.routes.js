import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', async (_req, res) => {
    const { data, error } = await supabase
        .from('rules')
        .select('rule_id, rule_name')
        .order('rule_name');
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true, data });
});

router.post('/', authenticate, async (req, res) => {
    const { rule_name } = req.body;
    if (!rule_name?.trim()) {
        return res.status(400).json({ success: false, message: 'rule_name wajib diisi' });
    }
    const { data, error } = await supabase
        .from('rules')
        .insert([{ rule_name: rule_name.trim() }])
        .select('rule_id, rule_name')
        .single();
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data });
});

router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('rules').delete().eq('rule_id', id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true });
});

export default router;
