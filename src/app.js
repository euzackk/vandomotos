// Importa o banco de dados e ferramentas
import { db, utils } from './db.js';

// Importa os módulos das telas
import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';

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

// Inicia o Sistema
function initApp() {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR');
    buildMenu();
    navigateTo('dashboard'); // Tela inicial padrão
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
        
        wrapper.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"><i class="ph ph-users"></i> Clientes</p>
                    <h3 class="text-4xl font-black text-gray-900">${totalClientes}</h3>
                </div>
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"><i class="ph ph-motorcycle"></i> Frota (Veículos)</p>
                    <h3 class="text-4xl font-black text-gray-900">${totalVeiculos}</h3>
                </div>
                <div class="bg-brand-dark p-6 rounded-xl shadow-md flex flex-col justify-between">
                    <p class="text-xs font-bold text-brand-main uppercase tracking-widest mb-2">Vando Motos ERP</p>
                    <div>
                        <h3 class="text-xl font-bold text-white mt-2">Módulos Ativos</h3>
                        <p class="text-sm text-gray-400">Clientes e Frota integrados.</p>
                    </div>
                </div>
            </div>
        `;
        appContent.appendChild(wrapper);

    } 
    // MÓDULO: CLIENTES
    else if (viewId === 'clientes') {
        appContent.appendChild(wrapper);
        renderClientes(wrapper); 

    }
    // MÓDULO: VEÍCULOS (FROTA)
    else if (viewId === 'veiculos') {
        appContent.appendChild(wrapper);
        renderVeiculos(wrapper); 

    }
    // MÓDULOS EM DESENVOLVIMENTO
    else {
        wrapper.innerHTML = `
            <div class="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div class="text-center">
                    <i class="ph ph-wrench text-4xl text-gray-400 mb-3"></i>
                    <h3 class="text-lg font-bold text-gray-700">Módulo ${viewId}</h3>
                    <p class="text-sm text-gray-500">Em desenvolvimento. Próxima etapa da engenharia.</p>
                </div>
            </div>
        `;
        appContent.appendChild(wrapper);
    }
}

// Inicializa
initApp();
