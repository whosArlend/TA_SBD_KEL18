import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', async (_req, res) => {
    const { data, error } = await supabase
        .from('amenities')
        .select('amenity_id, amenity_name')
        .order('amenity_name');
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true, data });
});

router.post('/', authenticate, async (req, res) => {
    const { amenity_name } = req.body;
    if (!amenity_name?.trim()) {
        return res.status(400).json({ success: false, message: 'amenity_name wajib diisi' });
    }
    const { data, error } = await supabase
        .from('amenities')
        .insert([{ amenity_name: amenity_name.trim() }])
        .select('amenity_id, amenity_name')
        .single();
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data });
});

router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('amenities').delete().eq('amenity_id', id);
    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true });
});

export default router;
