import { db, saveDB, utils } from './db.js';

export function renderVeiculos(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <!-- Barra Superior de Ações -->
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-veiculos" placeholder="Buscar por placa, modelo ou RENAVAM..." class="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm focus:ring-0 outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-veiculo" class="bg-brand-dark hover:bg-black text-white px-5 py-2.5 font-bold text-sm flex items-center gap-2 border border-gray-800 transition-all shadow-hard">
                    <i class="ph ph-plus-bold text-brand-main text-lg"></i> Adicionar Veículo
                </button>
            </div>

            <!-- Tabela de Dados Principais -->
            <div class="bg-white border border-gray-200 shadow-soft flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1 custom-scroll">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-mono">
                                <th class="px-6 py-4 font-bold">Placa / Modelo</th>
                                <th class="px-6 py-4 font-bold">Documentação Legal</th>
                                <th class="px-6 py-4 font-bold">Odômetro / Óleo</th>
                                <th class="px-6 py-4 font-bold">Combustível</th>
                                <th class="px-6 py-4 font-bold">Status Pátio</th>
                                <th class="px-6 py-4 font-bold text-right">Painel de Controle</th>
                            </tr>
                        </thead>
                        <tbody id="tb-veiculos" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                <!-- Estado Vazio -->
                <div id="veiculos-empty" class="hidden flex-col items-center justify-center py-16 text-center">
                    <i class="ph ph-motorcycle text-5xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-bold uppercase tracking-wider">Frota vazia na Nuvem</p>
                </div>
            </div>
        </div>

        <!-- MODAL MASTER: DOSSIÊ DA FROTA -->
        <div id="modal-veiculo" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 transition-opacity opacity-0">
            <div class="bg-white border border-gray-900 w-full max-w-4xl shadow-2xl overflow-hidden transform scale-95 transition-transform flex flex-col max-h-[90vh]" id="modal-veiculo-panel">
                
                <!-- Cabeçalho do Modal -->
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight" id="modal-veiculo-title">Ficha Técnica do Patrimônio</h2>
                        <p class="text-xs text-gray-500 font-mono mt-0.5">Gestão de Ativos e Vistoria Operacional</p>
                    </div>
                    <button id="btn-fechar-modal-v" class="text-gray-400 hover:text-red-600 transition p-1"><i class="ph ph-x text-2xl"></i></button>
                </div>

                <!-- Abas Superiores -->
                <div class="bg-gray-100 px-6 border-b border-gray-200 flex gap-2">
                    <button id="tab-dados-v" class="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1">1. Registro e Documentos</button>
                    <button id="tab-vistoria-v" class="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1">2. Painel de Vistoria Atual</button>
                </div>

                <!-- Formulário -->
                <form id="form-veiculo" class="overflow-y-auto flex-1 p-6 space-y-6 custom-scroll bg-white">
                    <input type="hidden" id="v-id">

                    <!-- ABA 1: REGISTRO E DOCUMENTOS -->
                    <div id="conteudo-tab-dados-v" class="space-y-6">
                        
                        <!-- Identificação Primária -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Placa *</label>
                                <input type="text" id="v-placa" required placeholder="ABC1D23" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none uppercase font-mono font-bold">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Modelo Comercial / Cor *</label>
                                <input type="text" id="v-modelo" required placeholder="Ex: Honda Titan 160 EX Preta" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Ano / Modelo</label>
                                <input type="number" id="v-ano" placeholder="2023" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                            </div>
                        </div>

                        <!-- Dados Governamentais e Valores -->
                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-xs font-extrabold text-brand-hover uppercase tracking-widest mb-4 flex items-center gap-2">
                                <i class="ph ph-identification-card text-base"></i> Registros Legais e Valores
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">RENAVAM</label>
                                    <input type="text" id="v-renavam" placeholder="Apenas números" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Chassi</label>
                                    <input type="text" id="v-chassi" placeholder="Apenas números/letras" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono uppercase">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Valor Tabela FIPE (R$)</label>
                                    <input type="number" id="v-fipe" placeholder="15000" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none">
                                </div>
                            </div>
                        </div>

                        <!-- Anexação e Controle do Documento -->
                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-xs font-extrabold text-gray-900 uppercase tracking-widest mb-3">
                                Licenciamento e CRLV Digital
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <!-- Vencimento Inteligente -->
                                <div class="bg-gray-50 border border-gray-200 p-4 relative">
                                    <div class="absolute top-4 right-4" id="badge-validacao-doc">
                                        <span class="text-[10px] font-bold px-2 py-1 bg-gray-200 text-gray-500 uppercase">Pendente</span>
                                    </div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Vencimento do Documento</label>
                                    <input type="date" id="v-doc" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none text-gray-800 font-bold mt-2">
                                    <p class="text-[10px] text-gray-500 mt-2">O sistema fará a auditoria automática desta data.</p>
                                </div>

                                <!-- Upload do CRLV -->
                                <div class="border border-dashed border-gray-300 p-4 flex flex-col justify-between bg-white">
                                    <div>
                                        <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Anexar Documento (CRLV/Verdinho)</label>
                                        <input type="file" id="file-doc-moto" accept="image/*,.pdf" class="text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:border-0 file:bg-brand-dark file:text-brand-main file:font-bold hover:file:bg-black w-full">
                                    </div>
                                    <div id="preview-doc-box" class="mt-3 hidden text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 p-2 border border-emerald-200">
                                        <i class="ph-fill ph-check-circle text-base"></i> Arquivo na Nuvem! <button type="button" id="btn-ver-doc" class="text-emerald-800 underline ml-2 font-bold hover:text-black">Visualizar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ABA 2: VISTORIA E CHECK-LIST -->
                    <div id="conteudo-tab-vistoria-v" class="hidden space-y-6">
                        
                        <!-- Bloco Operacional (Gasolina e Odômetro) -->
                        <div class="bg-gray-50 border border-gray-200 p-5">
                            <h3 class="text-xs font-extrabold text-brand-hover uppercase tracking-widest mb-4 flex items-center gap-2">
                                <i class="ph ph-sliders text-base"></i> Vistoria de Saída / Chegada
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <!-- Status da Moto -->
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Situação da Moto</label>
                                    <select id="v-status" class="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:border-brand-main outline-none font-bold">
                                        <option value="disponivel">Livre (No Pátio)</option>
                                        <option value="manutencao">Oficina / Quebrada</option>
                                    </select>
                                </div>
                                
                                <!-- Odômetro e Óleo -->
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">KM Atual no Painel</label>
                                    <input type="number" id="v-km-atual" placeholder="0" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">KM Próx. Óleo</label>
                                    <input type="number" id="v-km-oleo" placeholder="0" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono text-gray-500">
                                </div>

                                <!-- Marcador de Combustível -->
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Traços de Gasolina</label>
                                    <select id="v-combustivel" class="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:border-brand-main outline-none">
                                        <option value="0">0 Traços (Reserva Seca)</option>
                                        <option value="1">1 Traço</option>
                                        <option value="2">2 Traços</option>
                                        <option value="3">3 Traços (Meio Tanque)</option>
                                        <option value="4">4 Traços</option>
                                        <option value="5">5 Traços</option>
                                        <option value="6" selected>6 Traços (Tanque Cheio)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Foto de Vistoria -->
                        <div class="border border-dashed border-gray-300 p-6 flex flex-col justify-center items-center bg-gray-50 text-center relative overflow-hidden">
                            <i class="ph ph-camera text-4xl text-gray-400 mb-2"></i>
                            <h4 class="text-sm font-bold text-gray-700 uppercase mb-1">Foto do Estado Físico (Vistoria)</h4>
                            <p class="text-xs text-gray-500 mb-4 max-w-sm">Tire uma foto para atestar ranhuras, pneus e lataria da moto antes de entregar a chave.</p>
                            
                            <label class="bg-gray-900 text-white px-4 py-2 text-xs font-bold cursor-pointer hover:bg-black transition border border-gray-700 shadow-hard relative z-10">
                                Subir Foto da Vistoria
                                <input type="file" id="file-foto-moto" accept="image/*" class="hidden">
                            </label>
                            
                            <div id="preview-moto-box" class="mt-4 hidden w-full relative z-10">
                                <div class="p-3 bg-brand-light border border-brand-main text-brand-hover text-xs font-bold flex justify-between items-center">
                                    <span class="flex items-center gap-2"><i class="ph-fill ph-check-circle text-base"></i> Vistoria Registrada!</span>
                                    <button type="button" id="btn-ver-moto" class="underline text-black hover:text-brand-main">Ver Imagem</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Rodapé de Ações do Form -->
                    <div class="pt-4 border-t border-gray-100 flex gap-3 bg-white" id="modal-actions-footer-v">
                        <button type="button" id="btn-cancelar-v" class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-brand-dark text-brand-main font-black hover:bg-black shadow-hard border border-gray-900 transition">Salvar Patrimônio</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- POP-UP LIGHTBOX UNIVERSAL (MOTO OU DOC) -->
        <div id="lightbox-viewer-v" class="fixed inset-0 bg-black/90 z-[60] hidden flex flex-col items-center justify-center p-4">
            <button id="btn-fechar-lightbox-v" class="absolute top-5 right-5 text-white bg-gray-950 px-4 py-2 border border-gray-700 font-bold flex items-center gap-2 hover:bg-gray-800 transition"><i class="ph ph-x"></i> Fechar Imagem</button>
            <img id="img-lightbox-src-v" src="" alt="Inspeção Visual" class="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl bg-gray-900">
        </div>
    `;

    // Mapeamento DOM Geral
    const tbody = document.getElementById('tb-veiculos');
    const emptyState = document.getElementById('veiculos-empty');
    const modal = document.getElementById('modal-veiculo');
    const modalPanel = document.getElementById('modal-veiculo-panel');
    const form = document.getElementById('form-veiculo');
    const inputBusca = document.getElementById('busca-veiculos');

    // Mapeamento das Abas
    const tabDados = document.getElementById('tab-dados-v');
    const tabVistoria = document.getElementById('tab-vistoria-v');
    const conTabDados = document.getElementById('conteudo-tab-dados-v');
    const conTabVistoria = document.getElementById('conteudo-tab-vistoria-v');

    // Mapeamento de Arquivos
    const fileFoto = document.getElementById('file-foto-moto');
    const boxFoto = document.getElementById('preview-moto-box');
    const fileDoc = document.getElementById('file-doc-moto');
    const boxDoc = document.getElementById('preview-doc-box');
    
    // Vencimento dinâmico
    const inputDocDate = document.getElementById('v-doc');
    const badgeVencimento = document.getElementById('badge-validacao-doc');

    const lightbox = document.getElementById('lightbox-viewer-v');
    const lightboxImg = document.getElementById('img-lightbox-src-v');

    // Memória de arquivos em Base64
    let imgMotoBase64 = "";
    let imgDocBase64 = "";

    // ------------------------------------------------------------------------
    // FUNÇÃO NUCLEAR: AUDITORIA DE VENCIMENTO DO CRLV
    // ------------------------------------------------------------------------
    function auditarVencimento(dataString) {
        if (!dataString) return { status: 'PENDENTE', classe: 'bg-gray-200 text-gray-600' };
        
        // Zera o fuso para comparar apenas o dia exato
        const dataVenc = new Date(dataString);
        dataVenc.setMinutes(dataVenc.getMinutes() + dataVenc.getTimezoneOffset());
        dataVenc.setHours(0,0,0,0);
        
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        if (dataVenc < hoje) {
            return { status: 'VENCIDO', classe: 'bg-red-100 text-red-700 border border-red-200 shadow-sm' };
        } else if (dataVenc.getTime() === hoje.getTime()) {
            return { status: 'VENCE HOJE', classe: 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm' };
        } else {
            return { status: 'REGULAR', classe: 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' };
        }
    }

    // Auditoria em tempo real quando o usuário digita a data no modal
    inputDocDate.addEventListener('change', (e) => {
        const auditoria = auditarVencimento(e.target.value);
        badgeVencimento.innerHTML = `<span class="text-[10px] font-bold px-2 py-1 uppercase rounded-sm ${auditoria.classe}"><i class="ph-fill ph-warning-circle"></i> Auditoria: ${auditoria.status}</span>`;
    });

    // ------------------------------------------------------------------------
    // LÓGICA DAS ABAS
    // ------------------------------------------------------------------------
    tabDados.addEventListener('click', () => alternarAbas('dados'));
    tabVistoria.addEventListener('click', () => alternarAbas('vistoria'));

    function alternarAbas(aba) {
        if (aba === 'dados') {
            tabDados.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1";
            tabVistoria.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1";
            conTabDados.classList.remove('hidden');
            conTabVistoria.classList.add('hidden');
        } else {
            tabDados.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1";
            tabVistoria.className = "px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1";
            conTabDados.classList.add('hidden');
            conTabVistoria.classList.remove('hidden');
        }
    }

    // ------------------------------------------------------------------------
    // LEITORES DE ARQUIVO BASE64 (MOTO E DOCUMENTO)
    // ------------------------------------------------------------------------
    function registrarArquivo(inputElement, callback) {
        inputElement.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => callback(reader.result);
            reader.readAsDataURL(file);
        });
    }

    registrarArquivo(fileFoto, (base64) => {
        imgMotoBase64 = base64;
        boxFoto.classList.remove('hidden');
    });

    registrarArquivo(fileDoc, (base64) => {
        imgDocBase64 = base64;
        boxDoc.classList.remove('hidden');
    });

    // Lightbox Triggers
    document.getElementById('btn-ver-moto').addEventListener('click', () => abrirLightbox(imgMotoBase64));
    document.getElementById('btn-ver-doc').addEventListener('click', () => abrirLightbox(imgDocBase64));
    document.getElementById('btn-fechar-lightbox-v').addEventListener('click', () => lightbox.classList.add('hidden'));

    function abrirLightbox(src) {
        if (!src) return;
        lightboxImg.src = src;
        lightbox.classList.remove('hidden');
    }

    // ------------------------------------------------------------------------
    // PROCESSAMENTO E RENDERIZAÇÃO DA TABELA
    // ------------------------------------------------------------------------
    function atualizarTabela() {
        const termo = inputBusca.value.toLowerCase();
        tbody.innerHTML = '';
        
        const filtrados = db.veiculos.filter(v => 
            v.placa.toLowerCase().includes(termo) || 
            v.modelo.toLowerCase().includes(termo) ||
            (v.renavam && v.renavam.includes(termo))
        );

        if (filtrados.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            filtrados.forEach(v => {
                // Checa se a moto está locada no Módulo de Contratos
                const isLocado = db.contratos.some(c => c.veiculo_id === v.id && c.status === 'ativo');
                const statusReal = isLocado ? 'locado' : v.status;
                
                const statusConfig = {
                    'disponivel': '<span class="inline-block px-2 py-1 text-[10px] font-black bg-gray-900 text-white uppercase tracking-widest border-l-2 border-brand-main">Livre no Pátio</span>',
                    'locado': '<span class="inline-block px-2 py-1 text-[10px] font-black bg-blue-600 text-white uppercase tracking-widest border-l-2 border-blue-900">Alugada</span>',
                    'manutencao': '<span class="inline-block px-2 py-1 text-[10px] font-black bg-orange-600 text-white uppercase tracking-widest border-l-2 border-orange-900">Oficina</span>'
                };

                // Auditoria do Documento
                const auditoria = auditarVencimento(v.doc);
                const badgeDocFile = v.img_doc ? `<a href="#" class="text-[10px] text-emerald-600 font-bold ml-2 underline"><i class="ph-fill ph-file-pdf"></i> Arquivo Salvo</a>` : '';

                // Odômetro e Óleo
                const kmAtual = Number(v.km_atual) || 0;
                const kmOleo = Number(v.km_oleo) || 0;
                const alertaOleo = (kmOleo > 0 && kmAtual >= kmOleo) ? '<span class="text-xs bg-red-100 text-red-700 px-1 font-bold ml-1">TROCAR ÓLEO</span>' : '';
                
                // Combustível (Gasolina)
                const traços = Number(v.combustivel) || 0;
                const corGasolina = traços <= 1 ? 'text-red-500' : 'text-gray-800';

                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors";
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="font-bold text-gray-900">${v.modelo} <span class="text-xs font-normal text-gray-400 ml-1">${v.ano || ''}</span></div>
                        <div class="text-xs bg-white border border-gray-300 text-gray-800 px-1.5 py-0.5 mt-1 inline-block font-mono font-bold shadow-sm">${v.placa}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-[10px] font-bold px-1.5 py-0.5 uppercase ${auditoria.classe}">${auditoria.status}</span>
                        <div class="text-[11px] text-gray-500 mt-1 font-mono">Venc: ${utils.formatDate(v.doc)} ${badgeDocFile}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-mono text-gray-800 font-medium">${kmAtual.toLocaleString('pt-BR')} km ${alertaOleo}</div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Óleo em: ${kmOleo > 0 ? kmOleo.toLocaleString('pt-BR') : '--'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-bold text-sm flex items-center gap-1 ${corGasolina}">
                            <i class="ph-fill ph-gas-pump text-base"></i> ${traços}/6 Traços
                        </div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                            ${v.img_moto ? '<i class="ph-fill ph-check-circle text-emerald-500"></i> Vistoriada' : '<span class="text-red-400">Sem Vistoria Digital</span>'}
                        </div>
                    </td>
                    <td class="px-6 py-4">${statusConfig[statusReal]}</td>
                    <td class="px-6 py-4 text-right">
                        <button class="btn-editar-v text-white bg-brand-dark hover:bg-black px-3 py-1.5 text-xs font-bold shadow-sm transition mr-2" data-id="${v.id}">Vistoriar / Editar</button>
                        ${!isLocado ? `<button class="btn-deletar-v text-gray-400 hover:text-red-600 px-2 py-1.5 text-xs font-bold transition" data-id="${v.id}">Remover</button>` : ``}
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
                document.getElementById('v-id').value = '';
                document.getElementById('modal-veiculo-title').innerText = "Ficha Técnica do Patrimônio";
                
                // Reseta memória de imagens e auditoria
                imgMotoBase64 = "";
                imgDocBase64 = "";
                boxFoto.classList.add('hidden');
                boxDoc.classList.add('hidden');
                badgeVencimento.innerHTML = `<span class="text-[10px] font-bold px-2 py-1 bg-gray-200 text-gray-500 uppercase">Pendente</span>`;
            }, 200);
        }
    }

    // ------------------------------------------------------------------------
    // GRAVAÇÃO DE DADOS (CRIAR E EDITAR)
    // ------------------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('v-id').value;
        const dados = {
            id: id ? Number(id) : Date.now(),
            placa: document.getElementById('v-placa').value.toUpperCase(),
            modelo: document.getElementById('v-modelo').value,
            ano: document.getElementById('v-ano').value,
            renavam: document.getElementById('v-renavam').value,
            chassi: document.getElementById('v-chassi').value.toUpperCase(),
            fipe: document.getElementById('v-fipe').value,
            status: document.getElementById('v-status').value,
            doc: document.getElementById('v-doc').value,
            km_atual: document.getElementById('v-km-atual').value,
            km_oleo: document.getElementById('v-km-oleo').value,
            combustivel: document.getElementById('v-combustivel').value,
            img_moto: imgMotoBase64,
            img_doc: imgDocBase64
        };

        if (id) {
            // Edição: Mantém as imagens antigas caso o usuário não tenha upado novas
            const index = db.veiculos.findIndex(v => v.id === dados.id);
            if (!dados.img_moto) dados.img_moto = db.veiculos[index].img_moto;
            if (!dados.img_doc) dados.img_doc = db.veiculos[index].img_doc;
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
            if (confirm("Alerta: Excluir a ficha deste patrimônio apagará definitivamente as fotos de vistoria e CRLV. Continuar?")) {
                db.veiculos = db.veiculos.filter(v => v.id !== id);
                saveDB();
                atualizarTabela();
            }
        }
        
        if (e.target.classList.contains('btn-editar-v')) {
            const v = db.veiculos.find(v => v.id === id);
            
            // Povoar Aba 1
            document.getElementById('v-id').value = v.id;
            document.getElementById('v-placa').value = v.placa;
            document.getElementById('v-modelo').value = v.modelo;
            document.getElementById('v-ano').value = v.ano || '';
            document.getElementById('v-renavam').value = v.renavam || '';
            document.getElementById('v-chassi').value = v.chassi || '';
            document.getElementById('v-fipe').value = v.fipe || '';
            document.getElementById('v-doc').value = v.doc || '';
            
            // Dispara auditoria de data simulando um input
            const auditoria = auditarVencimento(v.doc);
            badgeVencimento.innerHTML = `<span class="text-[10px] font-bold px-2 py-1 uppercase rounded-sm ${auditoria.classe}"><i class="ph-fill ph-warning-circle"></i> Auditoria: ${auditoria.status}</span>`;

            // Povoar Aba 2
            document.getElementById('v-status').value = v.status;
            document.getElementById('v-km-atual').value = v.km_atual || '';
            document.getElementById('v-km-oleo').value = v.km_oleo || '';
            document.getElementById('v-combustivel').value = v.combustivel || '6';
            
            // Povoar Imagens Base64
            imgMotoBase64 = v.img_moto || "";
            imgDocBase64 = v.img_doc || "";
            
            if (imgMotoBase64) boxFoto.classList.remove('hidden');
            if (imgDocBase64) boxDoc.classList.remove('hidden');

            document.getElementById('modal-veiculo-title').innerText = "Vistoria e Atualização Cadastral";
            toggleModal(true);
        }
    });

    document.getElementById('btn-novo-veiculo').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-fechar-modal-v').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancelar-v').addEventListener('click', () => toggleModal(false));
    inputBusca.addEventListener('input', atualizarTabela);

    atualizarTabela();
}
