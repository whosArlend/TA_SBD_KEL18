import { supabaseAdmin as supabase } from '../lib/supabase-admin.js';

export const findUserByEmail = async (email) => {
    const { data, error } = await supabase
        .from('users')
        .select('user_id, email, password_hash, role, full_name, department')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

    if (error) return null;
    return data;
};

export const findUserByDepartment = async (department) => {
    const { data, error } = await supabase
        .from('users')
        .select('user_id, email, password_hash, role, full_name, department')
        .eq('department', department)
        .is('deleted_at', null)
        .single();

    if (error) return null;
    return data;
};

export const findUserById = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('user_id, email, role, full_name, department')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

    if (error) return null;
    return data;
};

export const emailExists = async (email) => {
    const { data } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .maybeSingle();
    return !!data;
};

export const departmentExists = async (department) => {
    const { data } = await supabase
        .from('users')
        .select('user_id')
        .eq('department', department)
        .maybeSingle();
    return !!data;
};

export const createUser = async ({ full_name, email, password_hash, department }) => {
    const { data, error } = await supabase
        .from('users')
        .insert([{ full_name, email, password_hash, role: 'User', department }])
        .select('user_id, email, role, full_name, department')
        .single();

    if (error) throw error;
    return data;
};
