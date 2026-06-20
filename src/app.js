import { db, utils, loadDB, auth } from './db.js';

import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';
import { renderContratos } from './contratos.js';
import { renderFinanceiro } from './financeiro.js';

// Elementos de Autenticação e Interface Geral
const loginScreen = document.getElementById('login-screen');
const formLogin = document.getElementById('form-login');
const loginErro = document.getElementById('login-erro');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

const menuContainer = document.getElementById('main-menu');
const pageTitle = document.getElementById('page-title');
const appContent = document.getElementById('app-content');

// Elementos Responsivos Mobile
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const btnMenuMobile = document.getElementById('btn-menu-mobile');

let currentUserEmail = '';

const menuItems = [
    { id: 'dashboard', icon: 'ph-squares-four', title: 'Visão Geral' },
    { id: 'clientes', icon: 'ph-users', title: 'Clientes' },
    { id: 'veiculos', icon: 'ph-motorcycle', title: 'Frota' },
    { id: 'contratos', icon: 'ph-handshake', title: 'Locações' },
    { id: 'financeiro', icon: 'ph-wallet', title: 'Caixa' }
];

window.addEventListener('error', function(event) {
    if(loginErro) {
        loginErro.classList.remove('hidden');
        loginErro.innerHTML = `Erro:<br><span class="text-white text-[10px] lowercase">${event.message}</span>`;
    }
});

// LÓGICA DO MENU MOBILE
function toggleMobileMenu(forceClose = false) {
    if (forceClose || !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('opacity-0');
        setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
    } else {
        sidebarOverlay.classList.remove('hidden');
        setTimeout(() => sidebarOverlay.classList.remove('opacity-0'), 10);
        sidebar.classList.remove('-translate-x-full');
    }
}

if(btnMenuMobile) btnMenuMobile.addEventListener('click', () => toggleMobileMenu());
if(sidebarOverlay) sidebarOverlay.addEventListener('click', () => toggleMobileMenu(true));

async function initApp() {
    try {
        const session = await auth.getSession();
        if (!session) {
            setupLoginForm();
            return; 
        }
        currentUserEmail = session.user.email;
        iniciarSistema();
    } catch (e) {
        if(loginErro) {
            loginErro.classList.remove('hidden');
            loginErro.innerHTML = `Erro Nuvem:<br><span class="text-white text-[10px] lowercase">${e.message}</span>`;
        }
    }
}

function setupLoginForm() {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-senha').value.trim();

        btnLogin.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> A Validar...';
        loginErro.classList.add('hidden');

        try {
            const data = await auth.login(email, senha);
            currentUserEmail = data.user.email;
            iniciarSistema();
        } catch (error) {
            loginErro.classList.remove('hidden');
            loginErro.innerHTML = `Acesso Negado:<br><span class="text-white font-normal text-[11px] lowercase">${error.message}</span>`;
            btnLogin.innerHTML = '<i class="ph-bold ph-lock-key text-lg"></i> Entrar';
        }
    });
}

async function iniciarSistema() {
    loginScreen.classList.add('opacity-0');
    setTimeout(() => loginScreen.classList.add('hidden'), 500);

    const isMechanic = currentUserEmail === 'oficina@vandomotos.com';
    const roleLabel = document.getElementById('user-role-label');
    if(roleLabel) roleLabel.innerText = isMechanic ? 'Painel Oficina' : 'Gestão Central';
    
    document.getElementById('current-date').innerHTML = isMechanic 
        ? `<span class="text-orange-600">Acesso Restrito</span>` 
        : `<span class="text-emerald-600">Acesso Total</span>`;
    
    pageTitle.innerText = "A Carregar...";
    
    btnLogout.addEventListener('click', () => {
        if(confirm("Deseja trancar o sistema e encerrar a sessão?")) auth.logout();
    });

    await loadDB(); 
    buildMenu();
    navigateTo('dashboard');
}

function buildMenu() {
    menuContainer.innerHTML = '';
    const isMechanic = currentUserEmail === 'oficina@vandomotos.com';
    const allowedItems = isMechanic ? menuItems.filter(i => i.id === 'dashboard' || i.id === 'veiculos') : menuItems;

    allowedItems.forEach(item => {
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
    if(currentView) pageTitle.innerText = currentView.title;
    
    renderView(viewId);
    toggleMobileMenu(true); // Oculta o menu lateral automaticamente em telemóveis após o clique
}

function renderView(viewId) {
    appContent.innerHTML = ''; 
    const wrapper = document.createElement('div');
    wrapper.className = 'fade-enter h-full flex flex-col';

    const isMechanic = currentUserEmail === 'oficina@vandomotos.com';

    if (viewId === 'dashboard') {
        const totalClientes = db.clientes.length;
        const totalVeiculos = db.veiculos.length;
        const locacoesAtivas = db.contratos.filter(c => c.status === 'ativo').length;
        const receitaTotal = db.financeiro.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + Number(curr.valor), 0);
        const despesaTotal = db.financeiro.filter(f => f.tipo === 'saida').reduce((acc, curr) => acc + Number(curr.valor), 0);
        const veiculosOficina = db.veiculos.filter(v => v.status === 'manutencao').length;
        const veiculosLivres = totalVeiculos - locacoesAtivas - veiculosOficina;

        wrapper.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                ${!isMechanic ? `
                <div class="bg-white p-4 md:p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><i class="ph ph-users text-lg"></i> Clientes</p>
                    <h3 class="text-2xl md:text-4xl font-black text-brand-dark">${totalClientes}</h3>
                </div>
                ` : ``}
                
                <div class="bg-white p-4 md:p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><i class="ph ph-motorcycle text-lg"></i> Frota</p>
                    <h3 class="text-2xl md:text-4xl font-black text-brand-dark">${totalVeiculos}</h3>
                </div>
                
                <div class="bg-white p-4 md:p-6 border border-gray-200 shadow-soft flex flex-col justify-between border-t-4 border-t-blue-500">
                    <p class="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><i class="ph ph-handshake text-lg"></i> Locações</p>
                    <h3 class="text-2xl md:text-4xl font-black text-blue-600">${locacoesAtivas}</h3>
                </div>
                
                ${!isMechanic ? `
                <div class="bg-brand-dark p-4 md:p-6 border border-brand-dark shadow-hard flex flex-col justify-between relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brand-main/5 transform rotate-45 translate-x-10 -translate-y-10"></div>
                    <p class="text-[10px] md:text-xs font-bold text-brand-main uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2"><i class="ph ph-wallet text-lg"></i> Receita Bruta</p>
                    <h3 class="text-xl md:text-3xl font-black text-white relative z-10 mt-1">${utils.formatMoney(receitaTotal)}</h3>
                </div>
                ` : `
                <div class="bg-orange-50 p-4 md:p-6 border border-orange-200 shadow-soft flex flex-col justify-between">
                    <p class="text-[10px] md:text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2"><i class="ph-fill ph-wrench text-lg"></i> Na Oficina</p>
                    <h3 class="text-2xl md:text-4xl font-black text-orange-600">${veiculosOficina}</h3>
                </div>
                `}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1">
                <div class="bg-white border border-gray-200 p-4 shadow-soft flex flex-col min-h-[300px]">
                    <h4 class="text-[10px] md:text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Status da Frota</h4>
                    <div class="relative flex-1 w-full flex items-center justify-center">
                        <canvas id="chart-frota"></canvas>
                    </div>
                </div>

                ${!isMechanic ? `
                <div class="bg-white border border-gray-200 p-4 shadow-soft flex flex-col min-h-[300px]">
                    <h4 class="text-[10px] md:text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Balanço Global</h4>
                    <div class="relative flex-1 w-full flex items-center justify-center">
                        <canvas id="chart-financas"></canvas>
                    </div>
                </div>
                ` : ``}

                <div class="bg-white border border-gray-200 p-4 shadow-soft flex flex-col min-h-[300px]">
                    <h4 class="text-[10px] md:text-xs font-black text-red-600 uppercase tracking-widest mb-4 border-b border-red-100 pb-2 flex items-center gap-2">
                        <i class="ph-fill ph-warning-circle text-lg"></i> Alertas
                    </h4>
                    <div id="radar-alertas" class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-2"></div>
                </div>
            </div>
        `;
        appContent.appendChild(wrapper);

        setTimeout(() => {
            const ctxFrota = document.getElementById('chart-frota');
            if(ctxFrota) {
                new Chart(ctxFrota, {
                    type: 'doughnut',
                    data: {
                        labels: ['Livre', 'Locada', 'Oficina'],
                        datasets: [{
                            data: [veiculosLivres, locacoesAtivas, veiculosOficina],
                            backgroundColor: ['#10b981', '#3b82f6', '#f97316'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, family: 'Inter' } } } } }
                });
            }

            const ctxFin = document.getElementById('chart-financas');
            if(ctxFin) {
                new Chart(ctxFin, {
                    type: 'bar',
                    data: {
                        labels: ['Fluxo'],
                        datasets: [
                            { label: 'Entradas', data: [receitaTotal], backgroundColor: '#10b981', borderRadius: 4 },
                            { label: 'Saídas', data: [despesaTotal], backgroundColor: '#ef4444', borderRadius: 4 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, display: false } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, family: 'Inter' } } } } }
                });
            }

            const radar = document.getElementById('radar-alertas');
            let alertasHTML = '';
            
            db.veiculos.forEach(v => {
                const kmAt = Number(v.km_atual) || 0;
                const kmOl = Number(v.km_oleo) || 0;
                if(kmOl > 0 && kmAt >= kmOl) {
                    alertasHTML += `<div class="bg-orange-50 text-orange-700 p-2 border border-orange-200 text-[10px] font-bold shadow-sm rounded-sm"><div class="uppercase tracking-widest text-orange-500 mb-0.5">Óleo Vencido</div><div class="text-xs">Moto <span class="font-mono text-black">${v.placa}</span> passou do limite (${kmOl}km).</div></div>`;
                }
                
                if(v.doc) {
                    const docDate = new Date(v.doc);
                    docDate.setMinutes(docDate.getMinutes() + docDate.getTimezoneOffset());
                    docDate.setHours(0,0,0,0);
                    const hoje = new Date();
                    hoje.setHours(0,0,0,0);
                    if(docDate <= hoje) {
                         alertasHTML += `<div class="bg-red-50 text-red-700 p-2 border border-red-200 text-[10px] font-bold shadow-sm rounded-sm"><div class="uppercase tracking-widest text-red-500 mb-0.5">Documento Vencido</div><div class="text-xs">CRLV da <span class="font-mono text-black">${v.placa}</span> encontra-se expirado.</div></div>`;
                    }
                }
            });

            db.contratos.filter(c => c.status === 'ativo').forEach(c => {
                 const dataFim = new Date(c.data_fim);
                 if(dataFim < new Date()) {
                     const cli = db.clientes.find(x => x.id === c.cliente_id) || {nome: 'Desconhecido'};
                     alertasHTML += `<div class="bg-red-50 text-red-700 p-2 border border-red-200 text-[10px] font-bold shadow-sm rounded-sm"><div class="uppercase tracking-widest text-red-500 mb-0.5">Atraso na Devolução</div><div class="text-xs">Cliente <span class="text-black">${cli.nome.split(' ')[0]}</span> atrasado no contrato VM-${c.id.toString().slice(-5)}.</div></div>`;
                 }
            });

            if(alertasHTML === '') {
                radar.innerHTML = '<div class="text-gray-400 text-[10px] font-bold uppercase tracking-widest p-6 text-center border border-gray-200 border-dashed bg-gray-50 flex flex-col items-center gap-2"><i class="ph-fill ph-shield-check text-3xl text-emerald-300"></i> Sem pendências.</div>';
            } else {
                radar.innerHTML = alertasHTML;
            }
        }, 150);

    } else if (viewId === 'clientes' && !isMechanic) {
        appContent.appendChild(wrapper);
        renderClientes(wrapper); 
    } else if (viewId === 'veiculos') {
        appContent.appendChild(wrapper);
        renderVeiculos(wrapper); 
    } else if (viewId === 'contratos' && !isMechanic) {
        appContent.appendChild(wrapper);
        renderContratos(wrapper); 
    } else if (viewId === 'financeiro' && !isMechanic) {
        appContent.appendChild(wrapper);
        renderFinanceiro(wrapper); 
    }
}

initApp();
