import { db, saveDB } from './db.js';

export function renderClientes(container) {
    // 1. Injeta o HTML da Tela de Clientes no container
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-clientes" placeholder="Buscar por nome ou WhatsApp..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-main outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-cliente" class="bg-brand-dark hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
                    <i class="ph ph-plus-bold text-brand-main"></i> Novo Cliente
                </button>
            </div>

            <div class="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                <th class="px-6 py-4 font-semibold">Nome Completo</th>
                                <th class="px-6 py-4 font-semibold">WhatsApp</th>
                                <th class="px-6 py-4 font-semibold">Documento / CNH</th>
                                <th class="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tb-clientes" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                <div id="clientes-empty" class="hidden flex-col items-center justify-center py-12 text-center">
                    <i class="ph ph-users text-4xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-medium">Nenhum cliente cadastrado.</p>
                </div>
            </div>
        </div>

        <div id="modal-cliente" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 hidden flex items-center justify-center transition-opacity opacity-0">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-95 transition-transform" id="modal-cliente-panel">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 class="text-lg font-bold text-gray-800" id="modal-cliente-title">Novo Cliente</h2>
                    <button id="btn-fechar-modal" class="text-gray-400 hover:text-red-500 transition"><i class="ph ph-x text-xl"></i></button>
                </div>
                <form id="form-cliente" class="p-6 space-y-4">
                    <input type="hidden" id="c-id">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nome Completo *</label>
                        <input type="text" id="c-nome" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">WhatsApp *</label>
                            <input type="text" id="c-wpp" required placeholder="(69) 9..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Categoria CNH</label>
                            <input type="text" id="c-cnh" placeholder="Ex: AB" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none uppercase">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Referências / Observações</label>
                        <textarea id="c-ref" rows="2" placeholder="Nome do pai, mãe, endereço..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-main outline-none"></textarea>
                    </div>
                    <div class="pt-4 flex gap-3">
                        <button type="button" id="btn-cancelar" class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-brand-main text-brand-dark font-bold rounded-lg hover:bg-brand-hover shadow-sm">Salvar Ficha</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // 2. Mapeamento dos Elementos do DOM
    const tbody = document.getElementById('tb-clientes');
    const emptyState = document.getElementById('clientes-empty');
    const modal = document.getElementById('modal-cliente');
    const modalPanel = document.getElementById('modal-cliente-panel');
    const form = document.getElementById('form-cliente');
    const inputBusca = document.getElementById('busca-clientes');

    // 3. Função para Renderizar a Tabela de Clientes
    function atualizarTabela() {
        const termo = inputBusca.value.toLowerCase();
        tbody.innerHTML = '';
        
        const filtrados = db.clientes.filter(c => c.nome.toLowerCase().includes(termo) || c.wpp.includes(termo));

        if (filtrados.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            filtrados.forEach(c => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors";
                tr.innerHTML = `
                    <td class="px-6 py-4 font-semibold text-gray-800">${c.nome}</td>
                    <td class="px-6 py-4 font-mono text-sm text-gray-600">${c.wpp}</td>
                    <td class="px-6 py-4 text-sm font-bold text-gray-500">${c.cnh || '--'}</td>
                    <td class="px-6 py-4 text-right">
                        <button class="btn-editar text-brand-hover hover:bg-brand-light px-3 py-1.5 rounded text-xs font-bold transition mr-2" data-id="${c.id}">Editar</button>
                        <button class="btn-deletar text-gray-400 hover:text-red-600 px-2 py-1.5 rounded text-xs font-bold transition" data-id="${c.id}">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // 4. Lógica de Abertura/Fechamento do Modal
    function toggleModal(abrir = true) {
        if (abrir) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modalPanel.classList.remove('scale-95');
            }, 10);
        } else {
            modal.classList.add('opacity-0');
            modalPanel.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                form.reset();
                document.getElementById('c-id').value = '';
                document.getElementById('modal-cliente-title').innerText = "Novo Cliente";
            }, 200);
        }
    }

    // 5. Salvar Cliente (Create / Update)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('c-id').value;
        const dados = {
            id: id ? Number(id) : Date.now(),
            nome: document.getElementById('c-nome').value,
            wpp: document.getElementById('c-wpp').value,
            cnh: document.getElementById('c-cnh').value.toUpperCase(),
            ref: document.getElementById('c-ref').value
        };

        if (id) {
            const index = db.clientes.findIndex(c => c.id === dados.id);
            db.clientes[index] = dados;
        } else {
            db.clientes.push(dados); // Adiciona na lista
        }

        saveDB(); // Salva no localStorage (banco)
        atualizarTabela();
        toggleModal(false); // Fecha o modal
    });

    // 6. Delegação de Eventos para os botões da tabela (Performance profissional)
    tbody.addEventListener('click', (e) => {
        const id = Number(e.target.getAttribute('data-id'));
        if (!id) return;

        if (e.target.classList.contains('btn-deletar')) {
            if (confirm("Excluir cliente permanentemente?")) {
                db.clientes = db.clientes.filter(c => c.id !== id);
                saveDB();
                atualizarTabela();
            }
        }
        
        if (e.target.classList.contains('btn-editar')) {
            const cliente = db.clientes.find(c => c.id === id);
            document.getElementById('c-id').value = cliente.id;
            document.getElementById('c-nome').value = cliente.nome;
            document.getElementById('c-wpp').value = cliente.wpp;
            document.getElementById('c-cnh').value = cliente.cnh;
            document.getElementById('c-ref').value = cliente.ref;
            document.getElementById('modal-cliente-title').innerText = "Editar Cliente";
            toggleModal(true);
        }
    });

    // 7. Configura os Listeners dos Botões Gerais
    document.getElementById('btn-novo-cliente').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-fechar-modal').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancelar').addEventListener('click', () => toggleModal(false));
    inputBusca.addEventListener('input', atualizarTabela);

    // Renderiza a tabela inicial
    atualizarTabela();
}
