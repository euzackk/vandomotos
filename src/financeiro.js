import { db, saveDB, utils } from './db.js';

export function renderFinanceiro(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Controle de Caixa</h2>
                    <p class="text-sm text-gray-500">Gestão de semanalidades e histórico de pagamentos.</p>
                </div>
                <div class="bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg text-emerald-800 font-bold text-lg shadow-sm flex items-center gap-2">
                    <i class="ph ph-wallet"></i> Saldo: <span id="saldo-total">R$ 0,00</span>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                
                <div class="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800 flex items-center gap-2"><i class="ph ph-bell-ringing text-brand-main"></i> Cobranças Ativas</h3>
                        <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold" id="qtd-cobrancas">0</span>
                    </div>
                    <div class="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/50" id="lista-receber">
                        </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div class="bg-gray-50 border-b border-gray-200 px-5 py-4">
                        <h3 class="font-bold text-gray-800 flex items-center gap-2"><i class="ph ph-list-numbers text-gray-400"></i> Histórico de Entradas</h3>
                    </div>
                    <div class="flex-1 overflow-y-auto">
                        <table class="w-full text-left whitespace-nowrap">
                            <tbody id="tb-historico" class="divide-y divide-gray-100">
                                </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    `;

    const listaReceber = document.getElementById('lista-receber');
    const tbHistorico = document.getElementById('tb-historico');
    const saldoTotal = document.getElementById('saldo-total');
    const qtdCobrancas = document.getElementById('qtd-cobrancas');

    function atualizarTela() {
        listaReceber.innerHTML = '';
        tbHistorico.innerHTML = '';

        // 1. CARREGA AS COBRANÇAS (Baseado nos Contratos Ativos)
        const contratosAtivos = db.contratos.filter(c => c.status === 'ativo');
        
        // Ordena para os atrasados/vencendo hoje aparecerem no topo
        contratosAtivos.sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
        
        qtdCobrancas.innerText = contratosAtivos.length;

        if (contratosAtivos.length === 0) {
            listaReceber.innerHTML = `
                <div class="text-center py-10">
                    <i class="ph ph-check-circle text-4xl text-gray-300 mb-2"></i>
                    <p class="text-sm text-gray-500">Nenhum contrato ativo para cobrar.</p>
                </div>
            `;
        } else {
            const hoje = new Date();
            hoje.setHours(0,0,0,0); // Zera as horas para comparar apenas o dia

            contratosAtivos.forEach(c => {
                const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: 'Desconhecido', wpp: '' };
                const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { placa: '---' };
                
                const dataVenc = new Date(c.vencimento);
                // Ajuste de fuso horário local
                dataVenc.setMinutes(dataVenc.getMinutes() + dataVenc.getTimezoneOffset());
                dataVenc.setHours(0,0,0,0);

                let statusCor = 'bg-white border-gray-200';
                let textoVencimento = utils.formatDate(c.vencimento);
                let iconeStatus = '<i class="ph-fill ph-clock text-gray-400"></i>';

                if (dataVenc < hoje) {
                    statusCor = 'bg-red-50 border-red-200 shadow-sm';
                    textoVencimento = `<span class="text-red-600 font-bold">ATRASADO (${utils.formatDate(c.vencimento)})</span>`;
                    iconeStatus = '<i class="ph-fill ph-warning-circle text-red-500"></i>';
                } else if (dataVenc.getTime() === hoje.getTime()) {
                    statusCor = 'bg-brand-light border-brand-main shadow-sm';
                    textoVencimento = `<span class="text-brand-hover font-bold">VENCE HOJE</span>`;
                    iconeStatus = '<i class="ph-fill ph-warning text-brand-main"></i>';
                }

                listaReceber.innerHTML += `
                    <div class="border rounded-xl p-4 flex justify-between items-center transition-all ${statusCor}">
                        <div>
                            <div class="font-bold text-gray-800 text-sm flex items-center gap-2">
                                ${iconeStatus} ${cli.nome}
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                Moto: <span class="font-mono font-bold text-gray-700">${vei.placa}</span> &bull; ${textoVencimento}
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <span class="font-black text-gray-900">${utils.formatMoney(c.valor)}</span>
                            <button class="btn-receber bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition" data-id="${c.id}" data-valor="${c.valor}">
                                Dar Baixa
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // 2. CARREGA O HISTÓRICO DE CAIXA
        const historico = [...db.financeiro].reverse(); // Do mais novo pro mais velho
        
        let saldoCalculado = 0;

        if (historico.length === 0) {
            tbHistorico.innerHTML = `<tr><td class="p-6 text-center text-gray-400 text-sm">O caixa está vazio. Nenhum pagamento registrado.</td></tr>`;
        } else {
            historico.forEach(f => {
                saldoCalculado += Number(f.valor);
                tbHistorico.innerHTML += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-5 py-4">
                            <div class="text-xs text-gray-400 font-mono">${utils.formatDate(f.data)}</div>
                        </td>
                        <td class="px-5 py-4">
                            <div class="text-sm font-semibold text-gray-700">${f.descricao}</div>
                        </td>
                        <td class="px-5 py-4 text-right">
                            <div class="text-sm font-bold text-emerald-600">+ ${utils.formatMoney(f.valor)}</div>
                        </td>
                    </tr>
                `;
            });
        }

        saldoTotal.innerText = utils.formatMoney(saldoCalculado);
    }

    // 3. AÇÃO: DAR BAIXA (Receber Pagamento)
    listaReceber.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-receber')) {
            const idContrato = Number(e.target.getAttribute('data-id'));
            const valorSugerido = Number(e.target.getAttribute('data-valor'));
            
            const c = db.contratos.find(x => x.id === idContrato);
            const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: 'Cliente' };
            const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { placa: '' };

            // Confirmação nativa simples e segura
            const confirma = confirm(`Deseja confirmar o recebimento da semanalidade de ${cli.nome} no valor de ${utils.formatMoney(valorSugerido)}?`);
            
            if (confirma) {
                // 1. Lança o valor no Caixa
                const hojeISO = new Date().toISOString().split('T')[0];
                db.financeiro.push({
                    id: Date.now(),
                    data: hojeISO,
                    descricao: `Pagamento Semanal - ${cli.nome} (${vei.placa})`,
                    valor: valorSugerido,
                    contrato_id: c.id
                });

                // 2. Renova o vencimento do contrato para +7 dias
                const dataAntiga = new Date(c.vencimento);
                dataAntiga.setMinutes(dataAntiga.getMinutes() + dataAntiga.getTimezoneOffset());
                dataAntiga.setDate(dataAntiga.getDate() + 7); // Adiciona 7 dias
                
                c.vencimento = dataAntiga.toISOString().split('T')[0];

                // 3. Salva e atualiza
                saveDB();
                atualizarTela();
                
                // Feedback visual rápido
                alert(`Sucesso! Pagamento de ${cli.nome} registrado. O próximo vencimento foi atualizado para ${utils.formatDate(c.vencimento)}.`);
            }
        }
    });

    atualizarTela();
}
