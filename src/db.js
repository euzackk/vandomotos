import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://anhhgombnjkjhernbgga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaGhnb21ibmpramhlcm5iZ2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDEwODcsImV4cCI6MjA5NzI3NzA4N30.gbuRU1wcxrNtJcCf4KcBhD2MZqxXs7tNovWtm4KvkFo';
const supabase = createClient(supabaseUrl, supabaseKey);

// 🛡️ MOTOR DE AUTENTICAÇÃO (NOVO)
export const auth = {
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    logout: async () => {
        await supabase.auth.signOut();
        window.location.reload(); // Recarrega a página para trancar o sistema
    },
    getSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        return data.session;
    }
};

// Estrutura de Memória Ativa (RAM)
export const db = {
    clientes: [],
    veiculos: [],
    contratos: [],
    financeiro: [],
    rotinas: []
};

// ... MANTER O RESTANTE DO FICHEIRO db.js IGUAL (loadDB, saveDB, utils) ...
