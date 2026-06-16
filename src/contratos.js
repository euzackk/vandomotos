import { db, saveDB, utils } from './db.js';

export function renderContratos(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-contratos" placeholder="Buscar por cliente ou placa..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-main outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-contrato" class="bg-brand-main hover:bg-brand-hover text-brand-dark px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
                    <i class="ph ph-handshake text-lg"></i> Nova Locação
                </button>
            </div>

            <div class="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                <th class="px-6 py-4 font-semibold">Cód.</th>
                                <th class="px-6 py-4 font-semibold">Cliente</th>
                                <th class="px-6 py-4 font-semibold">Veículo</th>
                                <th class="px-6 py-4 font-semibold">Valor / Vencimento</th>
                                <th class="px-6 py-4 font-semibold">Status</th>
                                <th class="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tb-contratos" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                <div id="contratos-empty" class="hidden flex-col items-center justify-center py-12 text-center">
                    <i class="ph ph-folder-open text-4xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-medium">Nenhum contrato de locação ativo.</p>
                </div>
            </div>
        </div>

        <div id="modal-contrato" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 hidden flex items-center justify-center transition-opacity opacity-0">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-95 transition-transform" id="modal-contrato-panel">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 class="text-lg font-bold text-gray-800">Firmar Novo Contrato</h2>
                    <button id="btn-fechar-modal-c" class="text-gray-400 hover:text-red-500 transition"><i class="ph ph-x text-xl"></i></button>
                </div>
                <form id="form-contrato" class="p-6 space-y-5">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Selecione o Cliente *</label>
                            <select id="loc-cliente" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none bg-white">
                                </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Veículo (Disponíveis) *</label>
                            <select id="loc-veiculo" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none bg-white">
                                </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Semanalidade (R$) *</label>
                            <input type="number" id="loc-valor" required placeholder="Ex: 450" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">1º Vencimento *</label>
                            <input type="date" id="loc-venc" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none text-gray-600">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Caução Recebida (R$)</label>
                            <input type="number" id="loc-caucao" placeholder="Ex: 1000" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                        </div>
                    </div>

                    <div class="pt-4 flex gap-3">
                        <button type="button" id="btn-cancelar-c" class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-brand-dark text-brand-main font-bold rounded-lg hover:bg-black shadow-sm flex justify-center items-center gap-2">
                            <i class="ph ph-check-circle text-lg"></i> Gerar Locação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tbody = document.getElementById('tb-contratos');
    const emptyState = document.getElementById('contratos-empty');
    const modal = document.getElementById('modal-contrato');
    const modalPanel = document.getElementById('modal-contrato-panel');
    const form = document.getElementById('form-contrato');
    const inputBusca = document.getElementById('busca-contratos');

    function carregarSelects() {
        const selectCliente = document.getElementById('loc-cliente');
        const selectVeiculo = document.getElementById('loc-veiculo');
        
        selectCliente.innerHTML = '<option value="">-- Escolha um cliente --</option>';
        selectVeiculo.innerHTML = '<option value="">-- Escolha a moto (Pátio) --</option>';

        // Carrega Clientes
        db.clientes.forEach(c => {
            selectCliente.innerHTML += `<option value="${c.id}">${c.nome} - ${c.wpp}</option>`;
        });

        // Carrega Veículos (Filtrando os que estão locados ou na oficina)
        const veiculosDisponiveis = db.veiculos.filter(v => {
            const isLocado = db.contratos.some(c => c.veiculo_id === v.id && c.status === 'ativo');
            return v.status === 'disponivel' && !isLocado;
        });

        veiculosDisponiveis.forEach(v => {
            selectVeiculo.innerHTML += `<option value="${v.id}">${v.modelo} [${v.placa}]</option>`;
        });
    }

    function atualizarTabela() {
        const termo = inputBusca.value.toLowerCase();
        tbody.innerHTML = '';
        
        const filtrados = db.contratos.filter(c => {
            const cli = db.clientes.find(x => x.id === c.cliente_id);
            const vei = db.veiculos.find(x => x.id === c.veiculo_id);
            const nomeCli = cli ? cli.nome.toLowerCase() : '';
            const placaVei = vei ? vei.placa.toLowerCase() : '';
            return nomeCli.includes(termo) || placaVei.includes(termo);
        });

        // Ordena para mostrar os ativos primeiro
        filtrados.sort((a, b) => a.status === 'ativo' ? -1 : 1);

        if (filtrados.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            filtrados.forEach(c => {
                const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: 'Cliente Removido' };
                const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { modelo: 'Veículo Removido', placa: '---' };
                
                const isAtrasado = c.status === 'ativo' && new Date(c.vencimento) < new Date(new Date().toDateString());
                
                let badgeStatus = '';
                if (c.status === 'ativo') {
                    badgeStatus = isAtrasado 
                        ? `<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><i class="ph-fill ph-warning-circle"></i> Atrasado</span>` 
                        : `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><i class="ph-fill ph-play-circle"></i> Em Curso</span>`;
                } else {
                    badgeStatus = `<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><i class="ph-fill ph-check-circle"></i> Encerrado</span>`;
                }

                const tr = document.createElement('tr');
                tr.className = `border-b border-gray-50 last:border-0 transition-colors ${c.status === 'encerrado' ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50'}`;
                tr.innerHTML = `
                    <td class="px-6 py-4 text-xs font-mono text-gray-400">#${c.id.toString().slice(-5)}</td>
                    <td class="px-6 py-4 font-bold text-gray-800">${cli.nome}</td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-700">${vei.modelo}</div>
                        <div class="text-xs bg-gray-200 inline-block px-1 rounded font-mono text-gray-600 mt-1">${vei.placa}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-bold text-gray-800">${utils.formatMoney(c.valor)}/sem</div>
                        <div class="text-xs mt-1 ${isAtrasado ? 'text-red-600 font-bold' : 'text-gray-500'}">Vence: ${utils.formatDate(c.vencimento)}</div>
                    </td>
                    <td class="px-6 py-4">${badgeStatus}</td>
                    <td class="px-6 py-4 text-right">
                        ${c.status === 'ativo' ? `<button class="btn-encerrar text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-600 px-3 py-1.5 rounded text-xs font-bold transition" data-id="${c.id}">Encerrar Locação</button>` : `<span class="text-xs text-gray-400">Finalizado</span>`}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function toggleModal(abrir = true) {
        if (abrir) {
            carregarSelects();
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); modalPanel.classList.remove('scale-95'); }, 10);
        } else {
            modal.classList.add('opacity-0');
            modalPanel.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                form.reset();
            }, 200);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const valorCaucao = Number(document.getElementById('loc-caucao').value) || 0;
        
        const novoContrato = {
            id: Date.now(),
            cliente_id: Number(document.getElementById('loc-cliente').value),
            veiculo_id: Number(document.getElementById('loc-veiculo').value),
            valor: Number(document.getElementById('loc-valor').value),
            vencimento: document.getElementById('loc-venc').value,
            caucao: valorCaucao,
            status: 'ativo' // 'ativo' ou 'encerrado'
        };

        db.contratos.push(novoContrato);

        // Se houver caução, já joga no Caixa do Módulo Financeiro
        if(valorCaucao > 0) {
            db.financeiro.push({
                id: Date.now(),
                data: new Date().toISOString().split('T')[0],
                descricao: 'Recebimento de Caução (Novo Contrato)',
                valor: valorCaucao,
                contrato_id: novoContrato.id
            });
        }

        saveDB();
        atualizarTabela();
        toggleModal(false);
    });

    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-encerrar')) {
            const id = Number(e.target.getAttribute('data-id'));
            if (confirm("Tem certeza que deseja encerrar este contrato? A moto voltará a ficar disponível no pátio.")) {
                const index = db.contratos.findIndex(c => c.id === id);
                db.contratos[index].status = 'encerrado';
                saveDB();
                atualizarTabela();
            }
        }
    });

    document.getElementById('btn-novo-contrato').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-fechar-modal-c').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancelar-c').addEventListener('click', () => toggleModal(false));
    inputBusca.addEventListener('input', atualizarTabela);

    atualizarTabela();
}
