
const SUPABASE_URL = "https://utswwuulmikcnpfliguv.supabase.co";
const SUPABASE_KEY = "sb_publishable_B3DuuPQ7Pfl41knhAPyz9g_ZRAtSUUH";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.db = db;
