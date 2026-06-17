// Importa o banco de dados, motor de autenticação e funções auxiliares
import { db, utils, loadDB, auth } from './db.js';

// Importa os módulos das telas
import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';
import { renderContratos } from './contratos.js';
import { renderFinanceiro } from './financeiro.js';

// 📡 TELEMETRIA GLOBAL
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

// ==========================================
// RENDERIZAÇÃO DE MÓDULOS E DASHBOARD
// ==========================================
function renderView(viewId) {
    appContent.innerHTML = ''; 
    const wrapper = document.createElement('div');
    wrapper.className = 'fade-enter h-full flex flex-col';

    if (viewId === 'dashboard') {
        
        // 1. CÁLCULO DE ESTATÍSTICAS BASE
        const totalClientes = db.clientes.length;
        const totalVeiculos = db.veiculos.length;
        const locacoesAtivas = db.contratos.filter(c => c.status === 'ativo').length;
        
        const receitaTotal = db.financeiro.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + Number(curr.valor), 0);
        const despesaTotal = db.financeiro.filter(f => f.tipo === 'saida').reduce((acc, curr) => acc + Number(curr.valor), 0);
        
        // 2. CÁLCULOS DA FROTA
        const veiculosOficina = db.veiculos.filter(v => v.status === 'manutencao').length;
        const veiculosLivres = totalVeiculos - locacoesAtivas - veiculosOficina;

        // 3. ESTRUTURA HTML DO DASHBOARD
        wrapper.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white p-6 border border-gray-200 shadow-soft flex flex-col justify-between">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="ph ph-users text-lg"></i> Clientes Base</p>
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
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brand-main/5 transform rotate-45 translate-x-10 -translate-y-10"></div>
                    <p class="text-xs font-bold text-brand-main uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2"><i class="ph ph-wallet text-lg"></i> Receita Bruta</p>
                    <h3 class="text-3xl font-black text-white relative z-10 mt-1">${utils.formatMoney(receitaTotal)}</h3>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                
                <div class="bg-white border border-gray-200 p-5 shadow-soft flex flex-col">
                    <h4 class="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Status da Frota (Ocupação)</h4>
                    <div class="relative flex-1 min-h-[250px] w-full flex items-center justify-center">
                        <canvas id="chart-frota"></canvas>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 p-5 shadow-soft flex flex-col">
                    <h4 class="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Balanço de Caixa Global</h4>
                    <div class="relative flex-1 min-h-[250px] w-full flex items-center justify-center">
                        <canvas id="chart-financas"></canvas>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 p-5 shadow-soft flex flex-col">
                    <h4 class="text-xs font-black text-red-600 uppercase tracking-widest mb-4 border-b border-red-100 pb-2 flex items-center gap-2">
                        <i class="ph-fill ph-warning-circle text-lg"></i> Radar de Alertas
                    </h4>
                    <div id="radar-alertas" class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-2">
                        </div>
                </div>

            </div>
        `;
        appContent.appendChild(wrapper);

        // 4. RENDERIZAÇÃO DOS GRÁFICOS (Apenas após o HTML estar na tela)
        setTimeout(() => {
            // Renderiza Gráfico 1: Frota
            const ctxFrota = document.getElementById('chart-frota');
            if(ctxFrota) {
                new Chart(ctxFrota, {
                    type: 'doughnut',
                    data: {
                        labels: ['No Pátio (Livre)', 'Locada', 'Na Oficina'],
                        datasets: [{
                            data: [veiculosLivres, locacoesAtivas, veiculosOficina],
                            backgroundColor: ['#10b981', '#3b82f6', '#f97316'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        cutout: '70%', 
                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, family: 'Inter' } } } } 
                    }
                });
            }

            // Renderiza Gráfico 2: Finanças
            const ctxFin = document.getElementById('chart-financas');
            if(ctxFin) {
                new Chart(ctxFin, {
                    type: 'bar',
                    data: {
                        labels: ['Fluxo Total'],
                        datasets: [
                            { label: 'Entradas Brutas', data: [receitaTotal], backgroundColor: '#10b981', borderRadius: 4 },
                            { label: 'Despesas / Saídas', data: [despesaTotal], backgroundColor: '#ef4444', borderRadius: 4 }
                        ]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        scales: { y: { beginAtZero: true, display: false } },
                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, family: 'Inter' } } } } 
                    }
                });
            }

            // Renderiza Radar de Alertas
            const radar = document.getElementById('radar-alertas');
            let alertasHTML = '';
            
            // Verificação 1: Óleo e Documentos
            db.veiculos.forEach(v => {
                const kmAt = Number(v.km_atual) || 0;
                const kmOl = Number(v.km_oleo) || 0;
                
                // Alerta de Óleo Vencido
                if(kmOl > 0 && kmAt >= kmOl) {
                    alertasHTML += `<div class="bg-orange-50 text-orange-700 p-3 border border-orange-200 text-[10px] font-bold shadow-sm"><div class="uppercase tracking-widest text-orange-500 mb-1">Manutenção Motor</div><div class="text-xs">A moto placa <span class="font-mono text-black">${v.placa}</span> passou do limite da troca de óleo (${kmOl}km).</div></div>`;
                }
                
                // Alerta de CRLV Vencido
                if(v.doc) {
                    const docDate = new Date(v.doc);
                    docDate.setMinutes(docDate.getMinutes() + docDate.getTimezoneOffset());
                    docDate.setHours(0,0,0,0);
                    const hoje = new Date();
                    hoje.setHours(0,0,0,0);
                    if(docDate <= hoje) {
                         alertasHTML += `<div class="bg-red-50 text-red-700 p-3 border border-red-200 text-[10px] font-bold shadow-sm"><div class="uppercase tracking-widest text-red-500 mb-1">Irregularidade Legal</div><div class="text-xs">Documento (CRLV) da moto <span class="font-mono text-black">${v.placa}</span> está VENCIDO. Risco de Pátio Detran.</div></div>`;
                    }
                }
            });

            // Verificação 2: Contratos Atrasados
            db.contratos.filter(c => c.status === 'ativo').forEach(c => {
                 const dataFim = new Date(c.data_fim);
                 if(dataFim < new Date()) {
                     const cli = db.clientes.find(x => x.id === c.cliente_id) || {nome: 'Desconhecido'};
                     alertasHTML += `<div class="bg-red-50 text-red-700 p-3 border border-red-200 text-[10px] font-bold shadow-sm"><div class="uppercase tracking-widest text-red-500 mb-1">Atraso na Devolução</div><div class="text-xs">O cliente <span class="text-black">${cli.nome}</span> não devolveu a mota no prazo (Contrato VM-${c.id.toString().slice(-5)}).</div></div>`;
                 }
            });

            if(alertasHTML === '') {
                radar.innerHTML = '<div class="text-gray-400 text-[10px] font-bold uppercase tracking-widest p-6 text-center border border-gray-200 border-dashed bg-gray-50 flex flex-col items-center gap-2"><i class="ph-fill ph-shield-check text-3xl text-emerald-300"></i> Nenhum alerta crítico. Operação 100% estabilizada.</div>';
            } else {
                radar.innerHTML = alertasHTML;
            }

        }, 150); // Delay de segurança para o DOM renderizar o Canvas

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
