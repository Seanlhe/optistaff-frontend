const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

// Create Supabase client with anon key for client operations
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Create admin client with service role key for admin operations
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = {
  supabase,
  supabaseAdmin
};
