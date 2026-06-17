// Importa o banco de dados, motor de autenticação e funções auxiliares
import { db, utils, loadDB, auth } from './db.js';

import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';
import { renderContratos } from './contratos.js';
import { renderFinanceiro } from './financeiro.js';

// 📡 TELEMETRIA GLOBAL: Captura erros invisíveis e joga na tela de Login
window.addEventListener('error', function(event) {
    const errBox = document.getElementById('login-erro');
    if(errBox) {
        errBox.classList.remove('hidden');
        errBox.innerHTML = `Falha no Código:<br><span class="text-white text-[10px] lowercase">${event.message} (Linha ${event.lineno})</span>`;
    }
});

window.addEventListener('unhandledrejection', function(event) {
    const errBox = document.getElementById('login-erro');
    if(errBox) {
        errBox.classList.remove('hidden');
        errBox.innerHTML = `Falha de Nuvem:<br><span class="text-white text-[10px] lowercase">${event.reason}</span>`;
    }
});

// Elementos de Autenticação e Interface Geral
const loginScreen = document.getElementById('login-screen');
const formLogin = document.getElementById('form-login');
const loginErro = document.getElementById('login-erro');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

const menuContainer = document.getElementById('main-menu');
const pageTitle = document.getElementById('page-title');
const appContent = document.getElementById('app-content');

const menuItems = [
    { id: 'dashboard', icon: 'ph-squares-four', title: 'Visão Geral' },
    { id: 'clientes', icon: 'ph-users', title: 'Clientes' },
    { id: 'veiculos', icon: 'ph-motorcycle', title: 'Frota de Veículos' },
    { id: 'contratos', icon: 'ph-handshake', title: 'Contratos / Locações' },
    { id: 'financeiro', icon: 'ph-wallet', title: 'Gestão de Caixa' }
];

// INICIALIZAÇÃO SEGURA DO SISTEMA
async function initApp() {
    try {
        const session = await auth.getSession();
        
        if (!session) {
            setupLoginForm();
            return; 
        }

        iniciarSistema();
    } catch (e) {
        loginErro.classList.remove('hidden');
        loginErro.innerHTML = `Erro Crítico de Arranque:<br><span class="text-white text-[10px] lowercase">${e.message}</span>`;
    }
}

// GESTÃO DO FORMULÁRIO DE LOGIN
function setupLoginForm() {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-senha').value.trim();

        btnLogin.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> A Validar...';
        loginErro.classList.add('hidden');

        try {
            await auth.login(email, senha);
            iniciarSistema();
        } catch (error) {
            loginErro.classList.remove('hidden');
            loginErro.innerHTML = `Acesso Negado:<br><span class="text-white font-normal text-[11px] lowercase">${error.message}</span>`;
            btnLogin.innerHTML = '<i class="ph-bold ph-lock-key text-lg"></i> Autenticar Sessão';
        }
    });
}

// ARRANQUE DO MOTOR ERP
async function iniciarSistema() {
    loginScreen.classList.add('opacity-0');
    setTimeout(() => loginScreen.classList.add('hidden'), 500);

    document.getElementById('current-date').innerText = new Date().toLocaleDateString('pt-BR');
    pageTitle.innerText = "Sincronizando Sistema...";
    
    btnLogout.addEventListener('click', () => {
        if(confirm("Deseja trancar o sistema e encerrar a sessão?")) auth.logout();
    });

    await loadDB(); 
    
    buildMenu();
    navigateTo('dashboard');
}

function buildMenu() {
    menuContainer.innerHTML = '';
    menuItems.forEach(item => {
        const btn = document.createElement('button');
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
        
        const receitaTotal = db.financeiro
            .filter(f => f.tipo === 'entrada')
            .reduce((acc, curr) => acc + Number(curr.valor), 0);
        
        wrapper.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-users text-lg"></i> Clientes Cadastrados</p>
                    <h3 class="text-4xl font-black text-brand-dark">${totalClientes}</h3>
                </div>
                
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-motorcycle text-lg"></i> Frota Registada</p>
                    <h3 class="text-4xl font-black text-brand-dark">${totalVeiculos}</h3>
                </div>
                
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between border-t-4 border-t-blue-500">
                    <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-handshake text-lg"></i> Locações Vigentes</p>
                    <h3 class="text-4xl font-black text-blue-600">${locacoesAtivas}</h3>
                </div>
                
                <div class="bg-brand-dark p-6 border border-brand-dark shadow-hard flex flex-col justify-between relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brand-main/5 transform rotate-45 translate-x-10 -translate-y-10 group-hover:bg-brand-main/10 transition-colors"></div>
                    <p class="text-xs font-bold text-brand-main uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2"><i class="ph ph-wallet text-lg"></i> Receita Bruta</p>
                    <h3 class="text-3xl font-black text-white relative z-10 mt-1">${utils.formatMoney(receitaTotal)}</h3>
                </div>
            </div>

            <div class="bg-white border border-gray-200 p-6 flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                <i class="ph ph-chart-line-up text-5xl text-gray-200 mb-4 relative z-10"></i>
                <h4 class="text-gray-900 font-black uppercase tracking-widest text-sm relative z-10">Módulo Analítico em Preparação</h4>
                <p class="text-gray-500 text-xs mt-2 relative z-10">O processamento de gráficos operacionais será libertado na próxima fase.</p>
                <div class="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent"></div>
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
