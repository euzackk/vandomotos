import { db, saveDB, utils } from './db.js';

export function renderFinanceiro(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white p-5 border border-gray-200 shadow-soft relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform"></div>
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 relative z-10"><i class="ph ph-wallet"></i> Saldo em Caixa</p>
                    <h3 class="text-3xl font-black text-gray-900 relative z-10" id="dash-saldo">R$ 0,00</h3>
                </div>
                <div class="bg-emerald-50 border border-emerald-200 p-5 shadow-soft relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full group-hover:scale-150 transition-transform"></div>
                    <p class="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1 relative z-10"><i class="ph ph-trend-up"></i> Entradas (Receitas)</p>
                    <h3 class="text-3xl font-black text-emerald-600 relative z-10" id="dash-entradas">R$ 0,00</h3>
                </div>
                <div class="bg-red-50 border border-red-200 p-5 shadow-soft relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 w-16 h-16 bg-red-100 rounded-full group-hover:scale-150 transition-transform"></div>
                    <p class="text-xs font-bold text-red-700 uppercase tracking-widest mb-1 relative z-10"><i class="ph ph-trend-down"></i> Saídas (Despesas)</p>
                    <h3 class="text-3xl font-black text-red-600 relative z-10" id="dash-saidas">R$ 0,00</h3>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                
                <div class="bg-white border border-gray-200 shadow-soft flex flex-col overflow-hidden">
                    <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider text-xs"><i class="ph-fill ph-bell-ringing text-brand-hover text-base"></i> Painel de Cobranças</h3>
                        <span class="text-[10px] bg-gray-900 text-white px-2 py-1 font-bold tracking-widest uppercase" id="qtd-cobrancas">0 ATIVAS</span>
                    </div>
                    <div class="p-5 flex-1 overflow-y-auto space-y-4 bg-white custom-scroll" id="lista-receber">
                        </div>
                </div>

                <div class="bg-white border border-gray-200 shadow-soft flex flex-col overflow-hidden">
                    <div class="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider text-xs"><i class="ph-fill ph-list-numbers text-gray-400 text-base"></i> Livro Caixa (Extrato)</h3>
                        <button id="btn-novo-lancamento" class="text-[10px] bg-gray-200 hover:bg-brand-main hover:text-brand-dark text-gray-700 px-3 py-1.5 font-bold transition-colors uppercase tracking-widest flex items-center gap-1 border border-gray-300">
                            <i class="ph ph-plus"></i> Novo Registo Manual
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scroll p-0">
                        <table class="w-full text-left whitespace-nowrap text-sm">
                            <tbody id="tb-historico" class="divide-y divide-gray-100">
                                </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>

        <div id="modal-baixa" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 transition-opacity opacity-0">
            <div class="bg-white border border-gray-900 w-full max-w-md shadow-2xl overflow-hidden transform scale-95 transition-transform" id="modal-baixa-panel">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">Liquidação de Semanalidade</h2>
                    <button id="btn-fechar-baixa" class="text-gray-400 hover:text-red-600 transition"><i class="ph ph-x text-xl"></i></button>
                </div>
                <form id="form-baixa" class="p-6">
                    <input type="hidden" id="bx-id-contrato">
                    <input type="hidden" id="bx-valor-base">
                    
                    <div class="mb-4">
                        <p class="text-xs text-gray-500 uppercase tracking-widest font-bold">Cliente</p>
                        <p class="text-lg font-black text-gray-900" id="bx-nome-cliente">---</p>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Semanalidade Base (R$)</label>
                            <input type="text" id="bx-display-base" disabled class="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-sm font-mono font-bold text-gray-500 cursor-not-allowed">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase mb-1 flex justify-between">
                                <span>Multas / Acréscimos (R$)</span>
                                <span class="text-[10px] text-gray-400 font-normal">Atraso, Lavagem, Óleo</span>
                            </label>
                            <input type="number" id="bx-valor-extra" value="0" min="0" class="w-full px-3 py-2 border border-brand-main/50 text-sm focus:border-brand-main outline-none font-mono text-red-600 font-bold bg-red-50/30">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Motivo do Acréscimo (Se houver)</label>
                            <input type="text" id="bx-motivo-extra" placeholder="Ex: Multa de atraso (1h) + Lavagem Simples" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                        </div>
                    </div>

                    <div class="mt-6 p-4 bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                        <span class="text-xs font-black text-emerald-800 uppercase tracking-widest">Total a Receber</span>
                        <span class="text-2xl font-black text-emerald-600 font-mono" id="bx-display-total">R$ 0,00</span>
                    </div>

                    <div class="mt-6">
                        <button type="submit" class="w-full px-4 py-3 bg-brand-dark text-brand-main font-black hover:bg-black shadow-hard border border-gray-900 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs">
                            <i class="ph-fill ph-check-circle text-lg"></i> Confirmar Recebimento e Renovar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div id="modal-lancamento" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 transition-opacity opacity-0">
            <div class="bg-white border border-gray-900 w-full max-w-md shadow-2xl overflow-hidden transform scale-95 transition-transform" id="modal-lancamento-panel">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">Registo de Movimento</h2>
                    <button id="btn-fechar-lancamento" class="text-gray-400 hover:text-red-600 transition"><i class="ph ph-x text-xl"></i></button>
                </div>
                <form id="form-lancamento" class="p-6 space-y-4">
                    
                    <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tipo de Movimento *</label>
                        <select id="lan-tipo" class="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:border-brand-main outline-none font-bold">
                            <option value="saida">Saída (Despesa / Manutenção / Custos)</option>
                            <option value="entrada">Entrada (Receita Avulsa / Venda)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Categoria *</label>
                        <select id="lan-categoria" class="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:border-brand-main outline-none">
                            <option value="Manutenção de Frota">Manutenção de Frota (Oficina)</option>
                            <option value="Impostos e Taxas">Impostos, Taxas e Despachante</option>
                            <option value="Infraestrutura">Infraestrutura da Loja</option>
                            <option value="Serviços Terceirizados">Serviços Terceirizados (Lavagem, etc)</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descrição do Movimento *</label>
                        <input type="text" id="lan-descricao" required placeholder="Ex: Troca de óleo da Titan Placa ABC" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Data *</label>
                            <input type="date" id="lan-data" required class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none bg-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Valor (R$) *</label>
                            <input type="number" step="0.01" id="lan-valor" required placeholder="Ex: 150.00" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono font-bold">
                        </div>
                    </div>

                    <div class="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                        <button type="submit" class="flex-1 px-4 py-3 bg-brand-dark text-brand-main font-black hover:bg-black shadow-hard border border-gray-900 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs">
                            <i class="ph-fill ph-floppy-disk text-lg"></i> Gravar Registo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Elementos DOM
    const listaReceber = document.getElementById('lista-receber');
    const tbHistorico = document.getElementById('tb-historico');
    const qtdCobrancas = document.getElementById('qtd-cobrancas');
    
    // Dashboards
    const dashSaldo = document.getElementById('dash-saldo');
    const dashEntradas = document.getElementById('dash-entradas');
    const dashSaidas = document.getElementById('dash-saidas');

    // Modais
    const modalBaixa = document.getElementById('modal-baixa');
    const modalBaixaPanel = document.getElementById('modal-baixa-panel');
    const formBaixa = document.getElementById('form-baixa');
    
    const modalLan = document.getElementById('modal-lancamento');
    const modalLanPanel = document.getElementById('modal-lancamento-panel');
    const formLan = document.getElementById('form-lancamento');

    // Elementos do Formulário de Baixa
    const bxValorExtra = document.getElementById('bx-valor-extra');
    const bxDisplayTotal = document.getElementById('bx-display-total');

    function atualizarTela() {
        listaReceber.innerHTML = '';
        tbHistorico.innerHTML = '';

        // 1. CARREGAR COBRANÇAS (Módulo de Contratos)
        const contratosAtivos = db.contratos.filter(c => c.status === 'ativo');
        contratosAtivos.sort((a, b) => new Date(a.vencimento || a.data_fim) - new Date(b.vencimento || b.data_fim));
        
        qtdCobrancas.innerText = \`\${contratosAtivos.length} ATIVAS\`;

        if (contratosAtivos.length === 0) {
            listaReceber.innerHTML = \`
                <div class="text-center py-10">
                    <i class="ph ph-check-circle text-5xl text-gray-200 mb-2"></i>
                    <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nenhuma cobrança ativa no momento.</p>
                </div>
            \`;
        } else {
            const hoje = new Date();
            hoje.setHours(0,0,0,0);

            contratosAtivos.forEach(c => {
                const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: 'Desconhecido' };
                const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { placa: '---' };
                
                // Fallback para caso o contrato seja da versão antiga do sistema (usava 'data_fim' em vez de 'vencimento')
                const dataCobrar = c.vencimento ? c.vencimento : c.data_fim;
                const dataVenc = new Date(dataCobrar);
                dataVenc.setMinutes(dataVenc.getMinutes() + dataVenc.getTimezoneOffset());
                dataVenc.setHours(0,0,0,0);

                let statusCor = 'border-gray-200 bg-white';
                let iconeStatus = '<i class="ph-fill ph-clock text-gray-400 text-xl"></i>';
                let tagStatus = \`<span class="text-[10px] text-gray-500 font-bold ml-2">Vence: \${utils.formatDate(dataCobrar)}</span>\`;

                if (dataVenc < hoje) {
                    statusCor = 'border-red-500 bg-red-50/50';
                    iconeStatus = '<i class="ph-fill ph-warning-circle text-red-500 text-xl"></i>';
                    tagStatus = \`<span class="text-[10px] bg-red-600 text-white px-1.5 py-0.5 font-bold uppercase tracking-wider ml-2 shadow-sm">Atrasado (\${utils.formatDate(dataCobrar)})</span>\`;
                } else if (dataVenc.getTime() === hoje.getTime()) {
                    statusCor = 'border-brand-main bg-brand-light';
                    iconeStatus = '<i class="ph-fill ph-warning text-brand-hover text-xl"></i>';
                    tagStatus = \`<span class="text-[10px] bg-brand-hover text-black px-1.5 py-0.5 font-bold uppercase tracking-wider ml-2 shadow-sm">Vence Hoje</span>\`;
                }

                listaReceber.innerHTML += \`
                    <div class="border \${statusCor} p-4 flex justify-between items-center transition-all hover:shadow-soft group">
                        <div class="flex items-start gap-3">
                            <div class="mt-0.5">\${iconeStatus}</div>
                            <div>
                                <div class="font-bold text-gray-900 text-sm uppercase tracking-tight">\${cli.nome} \${tagStatus}</div>
                                <div class="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                                    <span class="bg-white border border-gray-300 px-1 font-mono font-bold text-gray-800">\${vei.placa}</span>
                                    <span>Doc: VM-\${c.id.toString().slice(-5)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <span class="font-black text-gray-900 font-mono">\${utils.formatMoney(c.valor)}</span>
                            <button class="btn-abrir-baixa text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-3 py-1.5 hover:bg-black transition shadow-hard border border-gray-900" 
                                data-id="\${c.id}" data-valor="\${c.valor}" data-nome="\${cli.nome}">
                                Efetuar Cobrança
                            </button>
                        </div>
                    </div>
                \`;
            });
        }

        // 2. CARREGAR LIVRO CAIXA E DASHBOARD
        const historico = [...db.financeiro].sort((a, b) => b.id - a.id); // Ordena do mais recente para o mais antigo
        
        let totalEntradas = 0;
        let totalSaidas = 0;

        if (historico.length === 0) {
            tbHistorico.innerHTML = \`<tr><td class="p-6 text-center text-gray-400 text-xs uppercase tracking-widest font-bold">O livro de registos está vazio.</td></tr>\`;
        } else {
            historico.forEach(f => {
                // Compatibilidade com a base de dados antiga (assumindo que sem 'tipo', era entrada)
                const tipoReal = f.tipo || 'entrada'; 
                const valorNum = Number(f.valor);

                let corValor = '';
                let iconeSeta = '';
                
                if (tipoReal === 'entrada') {
                    totalEntradas += valorNum;
                    corValor = 'text-emerald-600';
                    iconeSeta = '<i class="ph-bold ph-arrow-down-left text-emerald-500"></i>';
                } else {
                    totalSaidas += valorNum;
                    corValor = 'text-red-600';
                    iconeSeta = '<i class="ph-bold ph-arrow-up-right text-red-500"></i>';
                }

                tbHistorico.innerHTML += \`
                    <tr class="hover:bg-gray-50 transition-colors group">
                        <td class="px-5 py-4 w-10 text-center">\${iconeSeta}</td>
                        <td class="px-5 py-4">
                            <div class="text-[10px] text-gray-400 font-mono font-bold uppercase">\${utils.formatDate(f.data)}</div>
                        </td>
                        <td class="px-5 py-4">
                            <div class="text-xs font-bold text-gray-800 uppercase">\${f.descricao}</div>
                            <div class="text-[10px] text-gray-500 mt-0.5 tracking-wider">\${f.categoria || 'Locação Semanal'}</div>
                        </td>
                        <td class="px-5 py-4 text-right">
                            <div class="text-sm font-black font-mono \${corValor}">\${tipoReal === 'entrada' ? '+' : '-'} \${utils.formatMoney(valorNum)}</div>
                        </td>
                        <td class="px-5 py-4 text-right">
                            <button class="btn-deletar-registo text-gray-300 hover:text-red-500 transition px-2" data-id="\${f.id}" title="Eliminar Registo"><i class="ph-fill ph-trash"></i></button>
                        </td>
                    </tr>
                \`;
            });
        }

        // Atualiza Cards do Topo
        dashEntradas.innerText = utils.formatMoney(totalEntradas);
        dashSaidas.innerText = utils.formatMoney(totalSaidas);
        
        const saldoGeral = totalEntradas - totalSaidas;
        dashSaldo.innerText = utils.formatMoney(saldoGeral);
        if(saldoGeral < 0) {
            dashSaldo.classList.remove('text-gray-900');
            dashSaldo.classList.add('text-red-600');
        } else {
            dashSaldo.classList.remove('text-red-600');
            dashSaldo.classList.add('text-gray-900');
        }
    }

    // ------------------------------------------------------------------------
    // SISTEMA DE BAIXA DE FATURAS (COBRANÇA)
    // ------------------------------------------------------------------------
    
    function calcularTotalBaixa() {
        const base = Number(document.getElementById('bx-valor-base').value) || 0;
        const extra = Number(bxValorExtra.value) || 0;
        bxDisplayTotal.innerText = utils.formatMoney(base + extra);
    }

    bxValorExtra.addEventListener('input', calcularTotalBaixa);

    listaReceber.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-abrir-baixa')) {
            const idContrato = Number(e.target.getAttribute('data-id'));
            const valorSugerido = Number(e.target.getAttribute('data-valor'));
            const nomeCliente = e.target.getAttribute('data-nome');
            
            document.getElementById('bx-id-contrato').value = idContrato;
            document.getElementById('bx-nome-cliente').innerText = nomeCliente;
            document.getElementById('bx-valor-base').value = valorSugerido;
            document.getElementById('bx-display-base').value = utils.formatMoney(valorSugerido);
            
            bxValorExtra.value = "0";
            document.getElementById('bx-motivo-extra').value = "";
            calcularTotalBaixa();

            modalBaixa.classList.remove('hidden');
            setTimeout(() => { modalBaixa.classList.remove('opacity-0'); modalBaixaPanel.classList.remove('scale-95'); }, 10);
        }
    });

    document.getElementById('btn-fechar-baixa').addEventListener('click', () => {
        modalBaixa.classList.add('opacity-0');
        modalBaixaPanel.classList.add('scale-95');
        setTimeout(() => modalBaixa.classList.add('hidden'), 200);
    });

    formBaixa.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idContrato = Number(document.getElementById('bx-id-contrato').value);
        const valorBase = Number(document.getElementById('bx-valor-base').value);
        const valorExtra = Number(bxValorExtra.value) || 0;
        const motivoExtra = document.getElementById('bx-motivo-extra').value;
        const valorTotal = valorBase + valorExtra;

        const c = db.contratos.find(x => x.id === idContrato);
        if(!c) return;
        const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { placa: '' };
        const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: 'Cliente' };

        // Construção da Descrição Automática para o Extrato
        let desc = \`Recebimento Semanal - \${cli.nome} (\${vei.placa})\`;
        if (valorExtra > 0) {
            desc += \` [+ R$ \${valorExtra} : \${motivoExtra || 'Taxas adicionais'}]\`;
        }

        // 1. Lança no Caixa (Entrada)
        const hojeISO = new Date().toISOString().split('T')[0];
        db.financeiro.push({
            id: Date.now(),
            data: hojeISO,
            tipo: 'entrada',
            categoria: 'Locação Semanal',
            descricao: desc,
            valor: valorTotal,
            contrato_id: c.id
        });

        // 2. Renova o vencimento para a próxima semana
        const dataAntigaStr = c.vencimento ? c.vencimento : c.data_fim; 
        const dataAntiga = new Date(dataAntigaStr);
        dataAntiga.setMinutes(dataAntiga.getMinutes() + dataAntiga.getTimezoneOffset());
        dataAntiga.setDate(dataAntiga.getDate() + 7);
        
        c.vencimento = dataAntiga.toISOString().split('T')[0];

        saveDB();
        atualizarTela();
        document.getElementById('btn-fechar-baixa').click();
    });

    // ------------------------------------------------------------------------
    // SISTEMA DE LANÇAMENTO MANUAL (DESPESAS E RECEITAS AVULSAS)
    // ------------------------------------------------------------------------

    document.getElementById('btn-novo-lancamento').addEventListener('click', () => {
        const agora = new Date();
        agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
        document.getElementById('lan-data').value = agora.toISOString().split('T')[0];
        
        modalLan.classList.remove('hidden');
        setTimeout(() => { modalLan.classList.remove('opacity-0'); modalLanPanel.classList.remove('scale-95'); }, 10);
    });

    document.getElementById('btn-fechar-lancamento').addEventListener('click', () => {
        modalLan.classList.add('opacity-0');
        modalLanPanel.classList.add('scale-95');
        setTimeout(() => { modalLan.classList.add('hidden'); formLan.reset(); }, 200);
    });

    formLan.addEventListener('submit', (e) => {
        e.preventDefault();
        
        db.financeiro.push({
            id: Date.now(),
            data: document.getElementById('lan-data').value,
            tipo: document.getElementById('lan-tipo').value,
            categoria: document.getElementById('lan-categoria').value,
            descricao: document.getElementById('lan-descricao').value,
            valor: Number(document.getElementById('lan-valor').value)
        });

        saveDB();
        atualizarTela();
        document.getElementById('btn-fechar-lancamento').click();
    });

    // Eliminar registo manual do extrato
    tbHistorico.addEventListener('click', (e) => {
        const btnDel = e.target.closest('.btn-deletar-registo');
        if(btnDel) {
            const id = Number(btnDel.getAttribute('data-id'));
            if(confirm("Aviso: Eliminar este registo alterará o Saldo em Caixa atual. Confirma a exclusão deste movimento?")) {
                db.financeiro = db.financeiro.filter(f => f.id !== id);
                saveDB();
                atualizarTela();
            }
        }
    });

    // Inicialização da View
    atualizarTela();
}
