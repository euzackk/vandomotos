// Chave usada no LocalStorage
const DB_KEY = 'vando_erp_master';

// Estrutura inicial do banco (Caso esteja vazio)
const defaultDB = {
    clientes: [],
    veiculos: [],
    contratos: [],
    financeiro: []
};

// Exporta o objeto do banco para ser usado em outras páginas
export const db = JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB;

// Função dedicada para salvar as alterações
export function saveDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    console.log('Banco de dados atualizado com sucesso.');
}

// Utilitários financeiros e de formatação globais
export const utils = {
    formatMoney: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
    formatDate: (isoDate) => {
        if (!isoDate) return '--';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }
};