// Importa o banco de dados e função de Nuvem
import { db, utils, loadDB } from './db.js';

// Importa os módulos das telas
import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';
import { renderContratos } from './contratos.js';
import { renderFinanceiro } from './financeiro.js';

// Configuração do Menu Lateral
const menuItems = [
    { id: 'dashboard', icon: 'ph-squares-four', title: 'Visão Geral' },
    { id: 'clientes', icon: 'ph-users', title: 'Clientes' },
    { id: 'veiculos', icon: 'ph-motorcycle', title: 'Frota de Veículos' },
    { id: 'contratos', icon: 'ph-handshake', title: 'Contratos / Locações' },
    { id: 'financeiro', icon: 'ph-wallet', title: 'Gestão de Caixa' }
];

const menuContainer = document.getElementById('main-menu');
const pageTitle = document.getElementById('page-title');
const appContent = document.getElementById('app-content');

async function initApp() {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR');
    
    pageTitle.innerText = "Sincronizando Sistema...";
    await loadDB(); // Aguarda a nuvem
    
    buildMenu();
    navigateTo('dashboard');
}

function buildMenu() {
    menuContainer.innerHTML = '';
    menuItems.forEach(item => {
        const btn = document.createElement('button');
        // Design quadrado e fluido do menu
        btn.className = `w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold mb-1.5 nav-btn border-l-4 border-transparent text-gray-400 hover:bg-gray-900 hover:text-white transition-all`;
        btn.dataset.id = item.id;
        btn.innerHTML = `<i class="ph ${item.icon} text-xl"></i> ${item.title}`;
        btn.onclick = () => navigateTo(item.id);
        menuContainer.appendChild(btn);
    });
}

function navigateTo(viewId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-brand-dark', 'text-brand-main', 'border-brand-main');
        btn.classList.add('text-gray-400', 'border-transparent');
        if (btn.dataset.id === viewId) {
            btn.classList.remove('text-gray-400', 'border-transparent');
            // Destaque quadrado agressivo na lateral esquerda (estilo software industrial)
            btn.classList.add('bg-brand-dark', 'text-brand-main', 'border-brand-main');
        }
    });

    const currentView = menuItems.find(i => i.id === viewId);
    pageTitle.innerText = currentView.title;
    renderView(viewId);
}

function renderView(viewId) {
    appContent.innerHTML = ''; 
    const wrapper = document.createElement('div');
    wrapper.className = 'fade-enter h-full flex flex-col';

    if (viewId === 'dashboard') {
        const totalClientes = db.clientes.length;
        const totalVeiculos = db.veiculos.length;
        const locacoesAtivas = db.contratos.filter(c => c.status === 'ativo').length;
        const receitaTotal = db.financeiro.reduce((acc, curr) => acc + Number(curr.valor), 0);
        
        wrapper.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-users text-lg"></i> Clientes Cadastrados</p>
                    <h3 class="text-4xl font-black text-brand-dark">${totalClientes}</h3>
                </div>
                
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-motorcycle text-lg"></i> Frota Registrada</p>
                    <h3 class="text-4xl font-black text-brand-dark">${totalVeiculos}</h3>
                </div>
                
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between border-t-4 border-t-blue-500">
                    <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-handshake text-lg"></i> Locações Vigentes</p>
                    <h3 class="text-4xl font-black text-blue-600">${locacoesAtivas}</h3>
                </div>
                
                <div class="bg-brand-dark p-6 border border-brand-dark shadow-hard flex flex-col justify-between relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brand-main/5 transform rotate-45 translate-x-10 -translate-y-10 group-hover:bg-brand-main/10 transition-colors"></div>
                    <p class="text-xs font-bold text-brand-main uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2"><i class="ph ph-wallet text-lg"></i> Faturamento Base</p>
                    <h3 class="text-3xl font-black text-white relative z-10 mt-1">${utils.formatMoney(receitaTotal)}</h3>
                </div>
            </div>

            <div class="bg-white border border-gray-200 p-6 flex-1 flex flex-col justify-center items-center">
                <i class="ph ph-chart-line-up text-5xl text-gray-200 mb-4"></i>
                <h4 class="text-gray-400 font-bold uppercase tracking-widest text-sm">Painel de Análise Operacional</h4>
                <p class="text-gray-400 text-xs mt-2">Os gráficos de performance da frota estarão disponíveis em breve.</p>
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

initApp();
