// Importação do Cliente Oficial do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Credenciais de Conexão Enterprise (Vando Motos Supabase)
const supabaseUrl = 'https://anhhgombnjkjhernbgga.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaGhnb21ibmpramhlcm5iZ2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDEwODcsImV4cCI6MjA5NzI3NzA4N30.gbuRU1wcxrNtJcCf4KcBhD2MZqxXs7tNovWtm4KvkFo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Estrutura de Memória Ativa (RAM do Sistema)
export const db = {
    clientes: [],
    veiculos: [],
    contratos: [],
    financeiro: [],
    rotinas: []
};

// INICIALIZAÇÃO: Baixa os dados das Tabelas SQL para o Sistema
export async function loadDB() {
    try {
        const [resClientes, resVeiculos, resContratos, resFinanceiro] = await Promise.all([
            supabase.from('clientes').select('*'),
            supabase.from('veiculos').select('*'),
            supabase.from('contratos').select('*'),
            supabase.from('financeiro').select('*')
        ]);

        if (resClientes.data) db.clientes = resClientes.data;
        if (resVeiculos.data) db.veiculos = resVeiculos.data;
        if (resContratos.data) db.contratos = resContratos.data;
        if (resFinanceiro.data) db.financeiro = resFinanceiro.data;
        
        console.log("🟢 Conexão Estabelecida: Motor PostgreSQL (Supabase) Ativo.");
    } catch (error) {
        console.error("❌ Falha de Conexão com o Supabase:", error);
        alert("Aviso Operacional: Falha ao carregar as tabelas da Nuvem. Verifique a rede.");
    }
}

// SINCRONIZAÇÃO: Salva alterações e executa varredura de integridade
export async function saveDB() {
    try {
        const tabelas = ['clientes', 'veiculos', 'contratos', 'financeiro'];
        
        for (const tabela of tabelas) {
            const dadosLocais = db[tabela];
            
            if (dadosLocais.length > 0) {
                // 1. Injeção de Dados (Upsert: Atualiza quem já existe, cria quem for novo)
                const { error: errUpsert } = await supabase.from(tabela).upsert(dadosLocais);
                if (errUpsert) console.error(`Erro na Tabela [${tabela}]:`, errUpsert);

                // 2. Limpeza Reversa (Apaga no Banco o que foi deletado na tela)
                const idsLocais = dadosLocais.map(item => item.id);
                const { error: errDelete } = await supabase
                    .from(tabela)
                    .delete()
                    .not('id', 'in', `(${idsLocais.join(',')})`);
                
                if (errDelete) console.error(`Erro de Limpeza [${tabela}]:`, errDelete);

            } else {
                // 3. Esvaziamento Total (Caso a tabela local esteja vazia)
                await supabase.from(tabela).delete().neq('id', 0);
            }
        }
        console.log("🛡️ Tabela Relacional Sincronizada com Sucesso!");
    } catch (error) {
        console.error("❌ Falha na Sincronização do Supabase:", error);
    }
}

// Utilitários de Formatação Global (Inalterados)
export const utils = {
    formatMoney: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0),
    formatDate: (isoDate) => {
        if (!isoDate) return '--';
        // Ajuste de fuso horário
        const dataObjeto = new Date(isoDate);
        dataObjeto.setMinutes(dataObjeto.getMinutes() + dataObjeto.getTimezoneOffset());
        return dataObjeto.toLocaleDateString('pt-BR');
    }
};
