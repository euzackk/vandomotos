// Importa o banco de dados, ferramentas e a nova função de Nuvem
import { db, utils, loadDB } from './db.js';

// Importa os módulos das telas
import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';
import { renderContratos } from './contratos.js';
import { renderFinanceiro } from './financeiro.js';

// Configuração do Menu Lateral
const menuItems = [
    { id: 'dashboard', icon: 'ph-squares-four', title: 'Visão Geral' },
    { id: 'clientes', icon: 'ph-users', title: 'Base de Clientes' },
    { id: 'veiculos', icon: 'ph-motorcycle', title: 'Gestão de Frota' },
    { id: 'contratos', icon: 'ph-handshake', title: 'Locações Ativas' },
    { id: 'financeiro', icon: 'ph-wallet', title: 'Caixa e Receitas' }
];

// Elementos Principais do DOM
const menuContainer = document.getElementById('main-menu');
const pageTitle = document.getElementById('page-title');
const appContent = document.getElementById('app-content');

// Inicia o Sistema (Agora de forma Sincronizada com o Google)
async function initApp() {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR');
    
    // Trava a tela até baixar tudo do servidor
    pageTitle.innerText = "Sincronizando com a Nuvem...";
    await loadDB();
    
    buildMenu();
    navigateTo('dashboard'); // Libera a tela inicial
}

// Constrói o menu dinamicamente
function buildMenu() {
    menuContainer.innerHTML = '';
    menuItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 nav-btn text-gray-400 hover:text-white hover:bg-gray-800`;
        btn.dataset.id = item.id;
        btn.innerHTML = `<i class="ph ${item.icon} text-lg"></i> ${item.title}`;
        btn.onclick = () => navigateTo(item.id);
        menuContainer.appendChild(btn);
    });
}

// Sistema de Roteamento (Muda de tela)
function navigateTo(viewId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-brand-main/10', 'text-brand-main');
        btn.classList.add('text-gray-400');
        if (btn.dataset.id === viewId) {
            btn.classList.remove('text-gray-400');
            btn.classList.add('bg-brand-main/10', 'text-brand-main');
        }
    });

    const currentView = menuItems.find(i => i.id === viewId);
    pageTitle.innerText = currentView.title;

    renderView(viewId);
}

// Renderiza o conteúdo modular
function renderView(viewId) {
    appContent.innerHTML = ''; 
    const wrapper = document.createElement('div');
    wrapper.className = 'fade-enter h-full flex flex-col';

    // MÓDULO: DASHBOARD
    if (viewId === 'dashboard') {
        const totalClientes = db.clientes.length;
        const totalVeiculos = db.veiculos.length;
        const locacoesAtivas = db.contratos.filter(c => c.status === 'ativo').length;
        const receitaTotal = db.financeiro.reduce((acc, curr) => acc + Number(curr.valor), 0);
        
        wrapper.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"><i class="ph ph-users"></i> Clientes</p>
                    <h3 class="text-4xl font-black text-gray-900">${totalClientes}</h3>
                </div>
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"><i class="ph ph-motorcycle"></i> Patrimônio</p>
                    <h3 class="text-4xl font-black text-gray-900">${totalVeiculos}</h3>
                </div>
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-500">
                    <p class="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2"><i class="ph ph-handshake"></i> Locações Ativas</p>
                    <h3 class="text-4xl font-black text-blue-600">${locacoesAtivas}</h3>
                </div>
                <div class="bg-brand-dark p-6 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-brand-main/10 rounded-bl-full -mr-4 -mt-4"></div>
                    <p class="text-xs font-bold text-brand-main uppercase tracking-widest mb-2 relative z-10"><i class="ph ph-wallet"></i> Faturamento</p>
                    <h3 class="text-2xl font-black text-white relative z-10 mt-2">${utils.formatMoney(receitaTotal)}</h3>
                </div>
            </div>
        `;
        appContent.appendChild(wrapper);

    } else if (viewId === 'clientes') {
        appContent.appendChild(wrapper);
        renderClientes(wrapper); 
    } else if (viewId === 'veiculos') {
        appContent.appendChild(wrapper);
        renderVeiculos(wrapper); 
    } else if (viewId === 'contratos') {
        appContent.appendChild(wrapper);
        renderContratos(wrapper); 
    } else if (viewId === 'financeiro') {
        appContent.appendChild(wrapper);
        renderFinanceiro(wrapper); 
    }
}

// Iniciação disparada
initApp();
