import { renderClientes } from './clientes.js';
import { renderVeiculos } from './veiculos.js';
import { renderContratos } from './contratos.js';
import { renderFinanceiro } from './financeiro.js';
import { db } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const formLogin = document.getElementById('form-login');
    const btnLogout = document.getElementById('btn-logout');
    const appContent = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    const currentDate = document.getElementById('current-date');
    const mainMenu = document.getElementById('main-menu');
    const btnMenuMobile = document.getElementById('btn-menu-mobile');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Formata a data no topo
    const configData = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.innerText = new Date().toLocaleDateString('pt-BR', configData);

    // Sistema de Autenticação
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        // Credenciais Oficiais
        if (email === 'admin@vandomotos.com' && senha === 'admin123') {
            loginScreen.classList.add('opacity-0');
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                iniciarSistema();
            }, 500);
        } else {
            const erro = document.getElementById('login-erro');
            erro.innerText = "ACESSO NEGADO: Credenciais inválidas!";
            erro.classList.remove('hidden');
        }
    });

    btnLogout.addEventListener('click', () => {
        if(confirm("Deseja encerrar a sua sessão segura?")) {
            window.location.reload();
        }
    });

    // Controlo do Menu no Telemóvel
    btnMenuMobile.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
        setTimeout(() => sidebarOverlay.classList.remove('opacity-0'), 10);
    });

    sidebarOverlay.addEventListener('click', fecharMenuMobile);

    function fecharMenuMobile() {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('opacity-0');
        setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
    }

    // Arranque do ERP
    function iniciarSistema() {
        montarMenu();
        navegarPara('caixa'); // Abre logo no ecrã do dinheiro
        
        // Ativa o Robô de Notificações 5 segundos após entrar na App
        setTimeout(ativarMotorNotificacoes, 5000);
    }

    function montarMenu() {
        const itens = [
            { id: 'caixa', nome: 'Caixa & Financeiro', icone: 'ph-wallet' },
            { id: 'contratos', nome: 'Gestão de Contratos', icone: 'ph-handshake' },
            { id: 'clientes', nome: 'Base de Clientes', icone: 'ph-users' },
            { id: 'veiculos', nome: 'Pátio & Frota', icone: 'ph-motorcycle' }
        ];

        mainMenu.innerHTML = '';
        itens.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-400 hover:bg-brand-main hover:text-black transition-colors rounded-sm text-left';
            btn.innerHTML = `<i class="ph-bold ${item.icone} text-lg"></i> ${item.nome}`;
            btn.onclick = () => {
                navegarPara(item.id);
                fecharMenuMobile();
            };
            mainMenu.appendChild(btn);
        });
    }

    // Motor de Navegação entre Módulos
    function navegarPara(tela) {
        // Mostra loading suave
        appContent.innerHTML = '<div class="flex items-center justify-center h-full"><div class="w-8 h-8 border-4 border-brand-main border-t-transparent rounded-full animate-spin"></div></div>';
        
        setTimeout(() => {
            if (tela === 'caixa') {
                pageTitle.innerText = "Caixa & Financeiro";
                renderFinanceiro(appContent);
            } else if (tela === 'contratos') {
                pageTitle.innerText = "Gestão de Contratos";
                renderContratos(appContent);
            } else if (tela === 'clientes') {
                pageTitle.innerText = "Base de Clientes";
                renderClientes(appContent);
            } else if (tela === 'veiculos') {
                pageTitle.innerText = "Pátio & Frota";
                renderVeiculos(appContent);
            }
        }, 200);
    }

    // ============================================================================
    // ROBÔ DE VARREDURA E NOTIFICAÇÕES NATIVAS (PUSH)
    // ============================================================================
    function ativarMotorNotificacoes() {
        if (!("Notification" in window)) {
            console.log("Este navegador não suporta notificações Push.");
            return;
        }

        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permissao => {
                if (permissao === "granted") verificarContratosVencendoHoje();
            });
        } else if (Notification.permission === "granted") {
            verificarContratosVencendoHoje();
        }
    }

    function verificarContratosVencendoHoje() {
        const ultimaNotificacao = localStorage.getItem('vm_last_notif_date');
        const hojeStr = new Date().toISOString().split('T')[0];

        // Trava anti-spam: Só avisa 1 vez por dia
        if (ultimaNotificacao === hojeStr) return; 

        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        const contratosAtivos = (db.contratos || []).filter(c => c.status === 'ativo');
        let qtdVencendoHoje = 0;
        let qtdAtrasados = 0;

        contratosAtivos.forEach(c => {
            const dataVenc = new Date(c.vencimento || c.data_fim);
            dataVenc.setHours(0,0,0,0);

            if (dataVenc.getTime() === hoje.getTime()) {
                qtdVencendoHoje++;
            } else if (dataVenc < hoje) {
                qtdAtrasados++;
            }
        });

        // Disparo do Alerta
        if (qtdVencendoHoje > 0 || qtdAtrasados > 0) {
            let titulo = "Vando Motos - Relatório Operacional";
            let corpo = "";

            if (qtdVencendoHoje > 0) corpo += `🏍️ ${qtdVencendoHoje} moto(s) vencem HOJE.\n`;
            if (qtdAtrasados > 0) corpo += `⚠️ ${qtdAtrasados} contrato(s) em ATRASO crônico!\n`;
            corpo += "Clique aqui e abra o módulo Caixa para cobrar.";

            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(titulo, {
                    body: corpo,
                    icon: './assets/img/logo.png',
                    badge: './assets/img/logo.png',
                    vibrate: [200, 100, 200, 100, 200], // Código de vibração tripla de alerta
                    tag: 'vm-alerta-diario'
                });
                
                // Grava que o aviso de hoje já foi dado
                localStorage.setItem('vm_last_notif_date', hojeStr);
            });
        }
    }
});
