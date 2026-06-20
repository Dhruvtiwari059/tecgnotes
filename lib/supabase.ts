import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { id: string; email: string; added_by: string | null; created_at: string };
      };
      branches: {
        Row: { id: string; name: string; slug: string; created_at: string };
      };
      years: {
        Row: { id: string; number: number; label: string; created_at: string };
      };
      semesters: {
        Row: { id: string; year_id: string; branch_id: string; number: number; created_at: string };
      };
      subjects: {
        Row: { id: string; semester_id: string; name: string; code: string | null; slug: string; created_at: string };
      };
      syllabus_units: {
        Row: { id: string; subject_id: string; unit_number: number; content: string; created_at: string };
      };
      notes: {
        Row: { id: string; subject_id: string; unit_number: number; title: string; pdf_url: string; uploaded_at: string };
      };
      pyq: {
        Row: { id: string; subject_id: string; year: string; pdf_url: string; answer_pdf_url: string | null; uploaded_at: string };
      };
      dsa_topics: {
        Row: { id: string; name: string; notes_pdf_url: string | null; questions_pdf_url: string | null; created_at: string };
      };
      placement_topics: {
        Row: { id: string; company: string; category: string; title: string; pdf_url: string; created_at: string };
      };
      feedback: {
        Row: { id: string; name: string; email: string; message: string; created_at: string };
      };
      gemini_keys: {
        Row: { id: string; api_key: string; is_active: boolean; created_at: string };
      };
    };
  };
};
