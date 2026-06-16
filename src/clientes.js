import { db, saveDB, utils } from './db.js';

export function renderClientes(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-clientes" placeholder="Buscar por código, nome, CPF/CNPJ ou WhatsApp..." class="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm focus:ring-0 outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-cliente" class="bg-brand-dark hover:bg-black text-white px-5 py-2.5 font-bold text-sm flex items-center gap-2 border border-gray-800 transition-all shadow-hard">
                    <i class="ph ph-user-plus text-brand-main text-lg"></i> Cadastrar Cliente
                </button>
            </div>

            <div class="bg-white border border-gray-200 shadow-soft flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1 custom-scroll">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-mono">
                                <th class="px-6 py-4 font-bold">Cód. Identificador</th>
                                <th class="px-6 py-4 font-bold">Nome / Razão Social</th>
                                <th class="px-6 py-4 font-bold">Tipo</th>
                                <th class="px-6 py-4 font-bold">CPF / CNPJ</th>
                                <th class="px-6 py-4 font-bold">WhatsApp</th>
                                <th class="px-6 py-4 font-bold text-right">Painel de Controle</th>
                            </tr>
                        </thead>
                        <tbody id="tb-clientes" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                <div id="clientes-empty" class="hidden flex-col items-center justify-center py-16 text-center">
                    <i class="ph ph-users text-5xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-bold uppercase tracking-wider">Base de clientes vazia na Nuvem</p>
                </div>
            </div>
        </div>

        <div id="modal-cliente" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 transition-opacity opacity-0">
            <div class="bg-white border border-gray-900 w-full max-w-4xl shadow-2xl overflow-hidden transform scale-95 transition-transform flex flex-col max-h-[90vh]" id="modal-cliente-panel">
                
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight" id="modal-cliente-title">Dossiê Cadastral</h2>
                        <p class="text-xs text-gray-500 font-mono mt-0.5" id="modal-cliente-code">Código: Gerado automaticamente</p>
                    </div>
                    <button id="btn-fechar-modal" class="text-gray-400 hover:text-red-600 transition p-1"><i class="ph ph-x text-2xl"></i></button>
                </div>

                <div class="bg-gray-100 px-6 border-b border-gray-200 flex gap-2">
                    <button id="tab-dados" class="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1">1. Ficha Cadastral</button>
                    <button id="tab-historico" class="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1">2. Histórico de Locações</button>
                </div>

                <form id="form-cliente" class="overflow-y-auto flex-1 p-6 space-y-6 custom-scroll bg-white">
                    <input type="hidden" id="c-id">
                    <input type="hidden" id="c-codigo-gerado">

                    <div id="conteudo-tab-dados" class="space-y-6">
                        
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nome Completo / Razão Social *</label>
                                <input type="text" id="c-nome" required class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tipo de Pessoa *</label>
                                <select id="c-tipo" class="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:border-brand-main outline-none">
                                    <option value="PF">Física (PF)</option>
                                    <option value="PJ">Jurídica (PJ)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" id="lbl-doc">CPF *</label>
                                <input type="text" id="c-cpf-cnpj" required class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">WhatsApp Pessoal *</label>
                                <input type="text" id="c-wpp" required placeholder="(69) 9..." class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Endereço Residencial/Comercial Completo *</label>
                                <input type="text" id="c-endereco" required placeholder="Rua, Número, Bairro, Cidade, Ponto de Referência..." class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                            </div>
                        </div>

                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-xs font-extrabold text-brand-hover uppercase tracking-widest mb-4 flex items-center gap-2">
                                <i class="ph ph-phone-call text-base"></i> Triagem de Segurança (3 Referências)
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-gray-50 p-3 border border-gray-200">
                                    <span class="text-[10px] font-bold text-gray-400 uppercase font-mono block mb-2">Referência 01</span>
                                    <input type="text" id="c-ref-nome-1" placeholder="Nome do Contato 1" class="w-full px-3 py-1.5 border border-gray-300 text-xs mb-2 bg-white">
                                    <input type="text" id="c-ref-fone-1" placeholder="Telefone / Wpp 1" class="w-full px-3 py-1.5 border border-gray-300 text-xs bg-white">
                                </div>
                                <div class="bg-gray-50 p-3 border border-gray-200">
                                    <span class="text-[10px] font-bold text-gray-400 uppercase font-mono block mb-2">Referência 02</span>
                                    <input type="text" id="c-ref-nome-2" placeholder="Nome do Contato 2" class="w-full px-3 py-1.5 border border-gray-300 text-xs mb-2 bg-white">
                                    <input type="text" id="c-ref-fone-2" placeholder="Telefone / Wpp 2" class="w-full px-3 py-1.5 border border-gray-300 text-xs bg-white">
                                </div>
                                <div class="bg-gray-50 p-3 border border-gray-200">
                                    <span class="text-[10px] font-bold text-gray-400 uppercase font-mono block mb-2">Referência 03</span>
                                    <input type="text" id="c-ref-nome-3" placeholder="Nome do Contato 3" class="w-full px-3 py-1.5 border border-gray-300 text-xs mb-2 bg-white">
                                    <input type="text" id="c-ref-fone-3" placeholder="Telefone / Wpp 3" class="w-full px-3 py-1.5 border border-gray-300 text-xs bg-white">
                                </div>
                            </div>
                        </div>

                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-xs font-extrabold text-gray-900 uppercase tracking-widest mb-3">
                                Arquivos e Anexos Digitais (Imagens)
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="border border-dashed border-gray-300 p-4 flex flex-col justify-between bg-gray-50">
                                    <div>
                                        <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Habilitação (CNH) ou Identidade (RG)</label>
                                        <input type="file" id="file-cnh" accept="image/*" class="text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:border-0 file:bg-brand-dark file:text-brand-main file:font-bold hover:file:bg-black">
                                    </div>
                                    <div id="preview-cnh-box" class="mt-3 hidden text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                        <i class="ph-fill ph-check-circle text-base"></i> Documento Carregado! <button type="button" id="btn-ver-cnh" class="text-brand-hover underline ml-2">Visualizar</button>
                                    </div>
                                </div>

                                <div class="border border-dashed border-gray-300 p-4 flex flex-col justify-between bg-gray-50">
                                    <div>
                                        <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Comprovante de Residência Atualizado</label>
                                        <input type="file" id="file-residencia" accept="image/*" class="text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:border-0 file:bg-brand-dark file:text-brand-main file:font-bold hover:file:bg-black">
                                    </div>
                                    <div id="preview-res-box" class="mt-3 hidden text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                        <i class="ph-fill ph-check-circle text-base"></i> Comprovante Carregado! <button type="button" id="btn-ver-res" class="text-brand-hover underline ml-2">Visualizar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="conteudo-tab-historico" class="hidden space-y-4">
                        <div class="bg-gray-50 border p-4">
                            <h4 class="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider mb-3">Linha do Tempo de Aluguéis</h4>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs whitespace-nowrap">
                                    <thead>
                                        <tr class="border-b border-gray-200 text-gray-400 uppercase font-mono">
                                            <th class="pb-2">ID Contrato</th>
                                            <th class="pb-2">Veículo / Modelo</th>
                                            <th class="pb-2">Placa</th>
                                            <th class="pb-2">Valor Cobrado</th>
                                            <th class="pb-2">Situação Atual</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tb-historico-locacoes" class="divide-y divide-gray-100 text-gray-700 font-medium">
                                        </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-gray-100 flex gap-3 bg-white" id="modal-actions-footer">
                        <button type="button" id="btn-cancelar" class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-brand-dark text-brand-main font-black hover:bg-black shadow-hard border border-gray-900 transition">Gravar Dossiê</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="lightbox-viewer" class="fixed inset-0 bg-black/90 z-[60] hidden flex flex-col items-center justify-center p-4">
            <button id="btn-fechar-lightbox" class="absolute top-5 right-5 text-white bg-gray-950 px-4 py-2 border border-gray-700 font-bold flex items-center gap-2"><i class="ph ph-x"></i> Fechar Inspeção</button>
            <img id="img-lightbox-src" src="" alt="Inspeção de Documento" class="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl bg-gray-900">
        </div>
    `;

    // Mapeamentos DOM Estritos
    const tbody = document.getElementById('tb-clientes');
    const emptyState = document.getElementById('clientes-empty');
    const modal = document.getElementById('modal-cliente');
    const modalPanel = document.getElementById('modal-cliente-panel');
    const form = document.getElementById('form-cliente');
    const inputBusca = document.getElementById('busca-clientes');
    const selTipo = document.getElementById('c-tipo');
    const lblDoc = document.getElementById('lbl-doc');

    // Mapeamentos das Abas
    const tabDados = document.getElementById('tab-dados');
    const tabHistorico = document.getElementById('tab-historico');
    const conTabDados = document.getElementById('conteudo-tab-dados');
    const conTabHistorico = document.getElementById('conteudo-tab-historico');
    const footerActions = document.getElementById('modal-actions-footer');

    // Mapeamento de Anexos
    const fileCnh = document.getElementById('file-cnh');
    const fileRes = document.getElementById('file-residencia');
    const boxCnh = document.getElementById('preview-cnh-box');
    const boxRes = document.getElementById('preview-res-box');
    
    // Lightbox DOM
    const lightbox = document.getElementById('lightbox-viewer');
    const lightboxImg = document.getElementById('img-lightbox-src');

    // Memória Temporária de Imagens em Base64
    let imgCnhBase64 = "";
    let imgResBase64 = "";

    // Listener para alterar Label Dinamicamente entre CPF e CNPJ
    selTipo.addEventListener('change', () => {
        lblDoc.innerText = selTipo.value === 'PF' ? 'CPF *' : 'CNPJ *';
    });

    // Controle de Abas Internas do Modal
    tabDados.addEventListener('click', () => alternarAbas('dados'));
    tabHistorico.addEventListener('click', () => alternarAbas('historico'));

    function alternarAbas(aba) {
        if (aba === 'dados') {
            tabDados.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1";
            tabHistorico.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1";
            conTabDados.classList.remove('hidden');
            conTabHistorico.classList.add('hidden');
            footerActions.classList.remove('hidden');
        } else {
            tabDados.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1";
            tabHistorico.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1";
            conTabDados.classList.add('hidden');
            conTabHistorico.classList.remove('hidden');
            footerActions.classList.add('hidden'); // Histórico é apenas leitura
            carregarHistoricoLocacoes();
        }
    }

    // Leitor de arquivos de imagem e conversor Base64
    function escutarArquivo(input, callback) {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => callback(reader.result);
            reader.readAsDataURL(file);
        });
    }

    escutarArquivo(fileCnh, (base64) => {
        imgCnhBase64 = base64;
        boxCnh.classList.remove('hidden');
    });

    escutarArquivo(fileRes, (base64) => {
        imgResBase64 = base64;
        boxRes.classList.remove('hidden');
    });

    // Visualizadores Lightbox
    document.getElementById('btn-ver-cnh').addEventListener('click', () => abrirLightbox(imgCnhBase64));
    document.getElementById('btn-ver-res').addEventListener('click', () => abrirLightbox(imgResBase64));
    document.getElementById('btn-fechar-lightbox').addEventListener('click', () => lightbox.classList.add('hidden'));

    function abrirLightbox(src) {
        if (!src) return alert("Nenhuma imagem anexada.");
        lightboxImg.src = src;
        lightbox.classList.remove('hidden');
    }

    function carregarHistoricoLocacoes() {
        const idCliente = Number(document.getElementById('c-id').value);
        const tBodyHist = document.getElementById('tb-historico-locacoes');
        tBodyHist.innerHTML = '';

        if (!idCliente) {
            tBodyHist.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400 italic">Salve o cliente primeiro para gerar histórico.</td></tr>';
            return;
        }

        // Filtra contratos associados a este cliente
        const contratosDoCliente = db.contratos.filter(c => c.cliente_id === idCliente);

        if (contratosDoCliente.length === 0) {
            tBodyHist.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400 italic">Nenhum registro de locação encontrado para este CPF/CNPJ.</td></tr>';
            return;
        }

        contratosDoCliente.forEach(c => {
            const vei = db.veiculos.find(v => v.id === c.veiculo_id) || { modelo: 'Modelo Removido', placa: '---' };
            const statusLabel = c.status === 'ativo' 
                ? '<span class="text-blue-600 bg-blue-50 px-1.5 py-0.5 font-bold">Vigente</span>' 
                : '<span class="text-gray-500 bg-gray-100 px-1.5 py-0.5 font-normal">Encerrado</span>';

            tBodyHist.innerHTML += `
                <tr class="border-b">
                    <td class="py-2.5 font-mono text-gray-400">#${c.id.toString().slice(-5)}</td>
                    <td class="py-2.5">${vei.modelo}</td>
                    <td class="py-2.5 font-mono">${vei.placa}</td>
                    <td class="py-2.5 font-bold">${utils.formatMoney(c.valor)}</td>
                    <td class="py-2.5">${statusLabel}</td>
                </tr>
            `;
        });
    }

    function atualizarTabela() {
        const termo = inputBusca.value.toLowerCase();
        tbody.innerHTML = '';
        
        const filtrados = db.clientes.filter(c => 
            c.nome.toLowerCase().includes(termo) || 
            c.codigo.toLowerCase().includes(termo) || 
            c.cpf_cnpj.includes(termo) || 
            c.wpp.includes(termo)
        );

        if (filtrados.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            filtrados.forEach(c => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors";
                tr.innerHTML = `
                    <td class="px-6 py-4 font-mono font-bold text-brand-hover">${c.codigo}</td>
                    <td class="px-6 py-4 font-bold text-gray-900">${c.nome}</td>
                    <td class="px-6 py-4"><span class="text-xs px-1.5 py-0.5 font-bold bg-gray-900 text-white">${c.tipo}</span></td>
                    <td class="px-6 py-4 text-gray-600 font-mono text-xs">${c.cpf_cnpj}</td>
                    <td class="px-6 py-4 text-gray-700">${c.wpp}</td>
                    <td class="px-6 py-4 text-right">
                        <button class="btn-editar text-white bg-brand-dark hover:bg-black px-3 py-1.5 text-xs font-bold shadow-sm transition mr-2" data-id="${c.id}">Ver Dossiê</button>
                        <button class="btn-deletar text-gray-400 hover:text-red-600 px-2 py-1.5 text-xs font-bold transition" data-id="${c.id}">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function toggleModal(abrir = true) {
        if (abrir) {
            alternarAbas('dados');
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); modalPanel.classList.remove('scale-95'); }, 10);
        } else {
            modal.classList.add('opacity-0');
            modalPanel.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                form.reset();
                document.getElementById('c-id').value = '';
                document.getElementById('c-codigo-gerado').value = '';
                document.getElementById('modal-cliente-code').innerText = "Código: Gerado automaticamente";
                imgCnhBase64 = "";
                imgResBase64 = "";
                boxCnh.classList.add('hidden');
                boxRes.classList.add('hidden');
                lblDoc.innerText = 'CPF *';
            }, 200);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('c-id').value;
        
        // GERAÇÃO DE CÓDIGO SEQUENCIAL ENTERPRISE (Padronizado VM-0001)
        let codigoFinal = document.getElementById('c-codigo-gerado').value;
        if (!codigoFinal) {
            const numeroSequencial = db.clientes.length + 1;
            codigoFinal = `VM-${String(numeroSequencial).padStart(4, '0')}`;
        }

        const dados = {
            id: id ? Number(id) : Date.now(),
            codigo: codigoFinal,
            nome: document.getElementById('c-nome').value,
            tipo: selTipo.value,
            cpf_cnpj: document.getElementById('c-cpf-cnpj').value,
            wpp: document.getElementById('c-wpp').value,
            endereco: document.getElementById('c-endereco').value,
            ref_nome_1: document.getElementById('c-ref-nome-1').value,
            ref_fone_1: document.getElementById('c-ref-fone-1').value,
            ref_nome_2: document.getElementById('c-ref-nome-2').value,
            ref_fone_2: document.getElementById('c-ref-fone-2').value,
            ref_nome_3: document.getElementById('c-ref-nome-3').value,
            ref_fone_3: document.getElementById('c-ref-fone-3').value,
            img_cnh: imgCnhBase64,
            img_residencia: imgResBase64
        };

        if (id) {
            const index = db.clientes.findIndex(c => c.id === dados.id);
            // Preserva anexos antigos se novos não foram upados na edição
            if (!dados.img_cnh) dados.img_cnh = db.clientes[index].img_cnh;
            if (!dados.img_residencia) dados.img_residencia = db.clientes[index].img_residencia;
            
            db.clientes[index] = dados;
        } else {
            db.clientes.push(dados);
        }

        saveDB();
        atualizarTabela();
        toggleModal(false);
    });

    tbody.addEventListener('click', (e) => {
        const id = Number(e.target.getAttribute('data-id'));
        if (!id) return;

        if (e.target.classList.contains('btn-deletar')) {
            const temContratoAtivo = db.contratos.some(c => c.cliente_id === id && c.status === 'ativo');
            if (temContratoAtivo) {
                alert("Bloqueado: Este cliente possui um contrato de locação ativo e não pode ser removido.");
                return;
            }
            if (confirm("Deseja apagar este dossiê? Esta ação removerá o histórico permanente.")) {
                db.clientes = db.clientes.filter(c => c.id !== id);
                saveDB();
                atualizarTabela();
            }
        }
        
        if (e.target.classList.contains('btn-editar')) {
            const c = db.clientes.find(c => c.id === id);
            
            document.getElementById('c-id').value = c.id;
            document.getElementById('c-codigo-gerado').value = c.codigo;
            document.getElementById('modal-cliente-code').innerText = `Código: ${c.codigo}`;
            
            document.getElementById('c-nome').value = c.nome;
            selTipo.value = c.tipo;
            lblDoc.innerText = c.tipo === 'PF' ? 'CPF *' : 'CNPJ *';
            
            document.getElementById('c-cpf-cnpj').value = c.cpf_cnpj;
            document.getElementById('c-wpp').value = c.wpp;
            document.getElementById('c-endereco').value = c.endereco || '';
            
            document.getElementById('c-ref-nome-1').value = c.ref_nome_1 || '';
            document.getElementById('c-ref-fone-1').value = c.ref_fone_1 || '';
            document.getElementById('c-ref-nome-2').value = c.ref_nome_2 || '';
            document.getElementById('c-ref-fone-2').value = c.ref_fone_2 || '';
            document.getElementById('c-ref-nome-3').value = c.ref_nome_3 || '';
            document.getElementById('c-ref-fone-3').value = c.ref_fone_3 || '';
            
            imgCnhBase64 = c.img_cnh || "";
            imgResBase64 = c.img_residencia || "";

            if (imgCnhBase64) boxCnh.classList.remove('hidden');
            if (imgResBase64) boxRes.classList.remove('hidden');

            toggleModal(true);
        }
    });

    document.getElementById('btn-novo-cliente').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-fechar-modal').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancelar').addEventListener('click', () => toggleModal(false));
    inputBusca.addEventListener('input', atualizarTabela);

    atualizarTabela();
}
