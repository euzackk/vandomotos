import { db, saveDB, utils } from './db.js';

export function renderVeiculos(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-veiculos" placeholder="Buscar por placa ou modelo..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-main outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-veiculo" class="bg-brand-dark hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
                    <i class="ph ph-plus-bold text-brand-main"></i> Cadastrar Veículo
                </button>
            </div>

            <div class="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                <th class="px-6 py-4 font-semibold">Veículo / Placa</th>
                                <th class="px-6 py-4 font-semibold">Status</th>
                                <th class="px-6 py-4 font-semibold">Manutenção (Óleo)</th>
                                <th class="px-6 py-4 font-semibold">Doc (Licenciamento)</th>
                                <th class="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tb-veiculos" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                <div id="veiculos-empty" class="hidden flex-col items-center justify-center py-12 text-center">
                    <i class="ph ph-motorcycle text-4xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-medium">Nenhum veículo cadastrado na frota.</p>
                </div>
            </div>
        </div>

        <div id="modal-veiculo" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 hidden flex items-center justify-center transition-opacity opacity-0">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-95 transition-transform" id="modal-veiculo-panel">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 class="text-lg font-bold text-gray-800" id="modal-veiculo-title">Ficha do Veículo</h2>
                    <button id="btn-fechar-modal-v" class="text-gray-400 hover:text-red-500 transition"><i class="ph ph-x text-xl"></i></button>
                </div>
                <form id="form-veiculo" class="p-6 space-y-5">
                    <input type="hidden" id="v-id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Placa *</label>
                            <input type="text" id="v-placa" required placeholder="ABC-1234" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none uppercase font-mono">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Modelo / Cor *</label>
                            <input type="text" id="v-modelo" required placeholder="Ex: Honda Fan 160 Vermelha" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Ano</label>
                            <input type="number" id="v-ano" placeholder="2024" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Status Padrão</label>
                            <select id="v-status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none bg-white">
                                <option value="disponivel">🟢 Disponível (Pátio)</option>
                                <option value="manutencao">🟠 Na Oficina</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Vencimento Doc.</label>
                            <input type="date" id="v-doc" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none text-gray-600">
                        </div>
                    </div>

                    <div class="pt-2 border-t border-gray-100">
                        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Controle de Manutenção</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">KM Atual</label>
                                <input type="number" id="v-km-atual" placeholder="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Próxima Troca de Óleo (KM)</label>
                                <input type="number" id="v-km-oleo" placeholder="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 flex gap-3">
                        <button type="button" id="btn-cancelar-v" class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-brand-main text-brand-dark font-bold rounded-lg hover:bg-brand-hover shadow-sm">Salvar Patrimônio</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Mapeamento DOM
    const tbody = document.getElementById('tb-veiculos');
    const emptyState = document.getElementById('veiculos-empty');
    const modal = document.getElementById('modal-veiculo');
    const modalPanel = document.getElementById('modal-veiculo-panel');
    const form = document.getElementById('form-veiculo');
    const inputBusca = document.getElementById('busca-veiculos');

    function atualizarTabela() {
        const termo = inputBusca.value.toLowerCase();
        tbody.innerHTML = '';
        
        const filtrados = db.veiculos.filter(v => v.placa.toLowerCase().includes(termo) || v.modelo.toLowerCase().includes(termo));

        if (filtrados.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            filtrados.forEach(v => {
                // Lógica Enterprise: Verifica se está alugado no módulo de contratos
                const isLocado = db.contratos.some(c => c.veiculo_id === v.id && c.status === 'ativo');
                const statusReal = isLocado ? 'locado' : v.status;
                
                // Configuração Visual dos Status
                const statusConfig = {
                    'disponivel': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> No Pátio</span>',
                    'locado': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Locado</span>',
                    'manutencao': '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700"><span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Oficina</span>'
                };

                // Alertas de Manutenção e Documento
                const kmAtual = Number(v.km_atual) || 0;
                const kmOleo = Number(v.km_oleo) || 0;
                const alertaOleo = (kmOleo > 0 && kmAtual >= kmOleo) ? '<i class="ph-fill ph-warning text-red-500" title="Passou da KM de troca de óleo!"></i>' : '';
                
                let alertaDoc = '';
                if (v.doc) {
                    const hoje = new Date();
                    const dataDoc = new Date(v.doc);
                    if (dataDoc < hoje) alertaDoc = '<span class="text-red-500 font-bold ml-2">(Vencido)</span>';
                }

                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors";
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="font-bold text-gray-800">${v.modelo} <span class="text-xs font-normal text-gray-400 ml-1">${v.ano || ''}</span></div>
                        <div class="text-xs font-mono bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">${v.placa}</div>
                    </td>
                    <td class="px-6 py-4">${statusConfig[statusReal]}</td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-700 font-medium flex items-center gap-2">
                            ${kmAtual.toLocaleString('pt-BR')} km ${alertaOleo}
                        </div>
                        <div class="text-xs text-gray-400 mt-0.5">Troca: ${kmOleo > 0 ? kmOleo.toLocaleString('pt-BR') : '--'}</div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-700">
                        ${utils.formatDate(v.doc)} ${alertaDoc}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="btn-editar-v text-brand-hover hover:bg-brand-light px-3 py-1.5 rounded text-xs font-bold transition mr-2" data-id="${v.id}">Ficha</button>
                        ${!isLocado ? `<button class="btn-deletar-v text-gray-400 hover:text-red-600 px-2 py-1.5 rounded text-xs font-bold transition" data-id="${v.id}">Excluir</button>` : `<span class="text-xs text-gray-400 px-2">Bloqueado</span>`}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function toggleModal(abrir = true) {
        if (abrir) {
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); modalPanel.classList.remove('scale-95'); }, 10);
        } else {
            modal.classList.add('opacity-0');
            modalPanel.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                form.reset();
                document.getElementById('v-id').value = '';
                document.getElementById('modal-veiculo-title').innerText = "Ficha do Veículo";
            }, 200);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('v-id').value;
        const dados = {
            id: id ? Number(id) : Date.now(),
            placa: document.getElementById('v-placa').value.toUpperCase(),
            modelo: document.getElementById('v-modelo').value,
            ano: document.getElementById('v-ano').value,
            status: document.getElementById('v-status').value,
            doc: document.getElementById('v-doc').value,
            km_atual: document.getElementById('v-km-atual').value,
            km_oleo: document.getElementById('v-km-oleo').value
        };

        if (id) {
            const index = db.veiculos.findIndex(v => v.id === dados.id);
            db.veiculos[index] = dados;
        } else {
            db.veiculos.push(dados);
        }

        saveDB();
        atualizarTabela();
        toggleModal(false);
    });

    tbody.addEventListener('click', (e) => {
        const id = Number(e.target.getAttribute('data-id'));
        if (!id) return;

        if (e.target.classList.contains('btn-deletar-v')) {
            if (confirm("Deseja realmente remover este patrimônio da frota?")) {
                db.veiculos = db.veiculos.filter(v => v.id !== id);
                saveDB();
                atualizarTabela();
            }
        }
        
        if (e.target.classList.contains('btn-editar-v')) {
            const v = db.veiculos.find(v => v.id === id);
            document.getElementById('v-id').value = v.id;
            document.getElementById('v-placa').value = v.placa;
            document.getElementById('v-modelo').value = v.modelo;
            document.getElementById('v-ano').value = v.ano;
            document.getElementById('v-status').value = v.status;
            document.getElementById('v-doc').value = v.doc;
            document.getElementById('v-km-atual').value = v.km_atual;
            document.getElementById('v-km-oleo').value = v.km_oleo;
            document.getElementById('modal-veiculo-title').innerText = "Editar Patrimônio";
            toggleModal(true);
        }
    });

    document.getElementById('btn-novo-veiculo').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-fechar-modal-v').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancelar-v').addEventListener('click', () => toggleModal(false));
    inputBusca.addEventListener('input', atualizarTabela);

    atualizarTabela();
}
