import { supabaseAdmin } from '../lib/supabase-admin.js';

const BUCKET = 'room-images';

export const uploadRoomImage = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ success: false, message: 'Format file harus JPG, PNG, atau WEBP' });
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `room-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        console.error('Storage upload error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path);

    return res.status(200).json({
        success: true,
        data: { url: urlData.publicUrl },
    });
};
