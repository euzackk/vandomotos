import { db, saveDB, utils } from './db.js';

export function renderVeiculos(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-veiculos" placeholder="Buscar por placa, modelo ou RENAVAM..." class="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm focus:ring-0 outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-veiculo" class="bg-brand-dark hover:bg-black text-white px-5 py-2.5 font-bold text-sm flex items-center gap-2 border border-gray-800 transition-all shadow-hard">
                    <i class="ph ph-plus-bold text-brand-main text-lg"></i> Adicionar Veículo
                </button>
            </div>

            <div class="bg-white border border-gray-200 shadow-soft flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1 custom-scroll">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-mono">
                                <th class="px-6 py-4 font-bold">Placa / Modelo</th>
                                <th class="px-6 py-4 font-bold">RENAVAM</th>
                                <th class="px-6 py-4 font-bold">Status Operacional</th>
                                <th class="px-6 py-4 font-bold">Odômetro / Óleo</th>
                                <th class="px-6 py-4 font-bold">Doc / Vistoria</th>
                                <th class="px-6 py-4 font-bold text-right">Painel de Controle</th>
                            </tr>
                        </thead>
                        <tbody id="tb-veiculos" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                <div id="veiculos-empty" class="hidden flex-col items-center justify-center py-16 text-center">
                    <i class="ph ph-motorcycle text-5xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-bold uppercase tracking-wider">Frota vazia na Nuvem</p>
                </div>
            </div>
        </div>

        <div id="modal-veiculo" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 transition-opacity opacity-0">
            <div class="bg-white border border-gray-900 w-full max-w-4xl shadow-2xl overflow-hidden transform scale-95 transition-transform flex flex-col max-h-[90vh]" id="modal-veiculo-panel">
                
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight" id="modal-veiculo-title">Ficha Técnica do Patrimônio</h2>
                        <p class="text-xs text-gray-500 font-mono mt-0.5">Gestão de Ativos Vando Motos</p>
                    </div>
                    <button id="btn-fechar-modal-v" class="text-gray-400 hover:text-red-600 transition p-1"><i class="ph ph-x text-2xl"></i></button>
                </div>

                <div class="bg-gray-100 px-6 border-b border-gray-200 flex gap-2">
                    <button id="tab-dados-v" class="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-dark text-brand-dark bg-white mt-1">1. Especificações Técnicas</button>
                    <button id="tab-vistoria-v" class="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-gray-500 hover:text-gray-800 mt-1">2. Vistoria e Imagens</button>
                </div>

                <form id="form-veiculo" class="overflow-y-auto flex-1 p-6 space-y-6 custom-scroll bg-white">
                    <input type="hidden" id="v-id">

                    <div id="conteudo-tab-dados-v" class="space-y-6">
                        
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

                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-xs font-extrabold text-brand-hover uppercase tracking-widest mb-4 flex items-center gap-2">
                                <i class="ph ph-file-text text-base"></i> Registros Legais e Financeiros
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

                        <div class="border-t border-gray-200 pt-4">
                            <h3 class="text-xs font-extrabold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <i class="ph ph-wrench text-base"></i> Operacional e Manutenção
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status Físico</label>
                                    <select id="v-status" class="w-full px-3 py-2 border border-gray-300 text-sm bg-white focus:border-brand-main outline-none">
                                        <option value="disponivel">No Pátio (Disponível)</option>
                                        <option value="manutencao">Na Oficina (Bloqueada)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Venc. IPVA/Licenc.</label>
                                    <input type="date" id="v-doc" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none text-gray-600">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">KM Atual</label>
                                    <input type="number" id="v-km-atual" placeholder="0" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">KM Próx. Óleo</label>
                                    <input type="number" id="v-km-oleo" placeholder="0" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="conteudo-tab-vistoria-v" class="hidden space-y-4">
                        <div class="border border-dashed border-gray-300 p-6 flex flex-col justify-center items-center bg-gray-50 text-center">
                            <i class="ph ph-camera text-4xl text-gray-400 mb-2"></i>
                            <h4 class="text-sm font-bold text-gray-700 uppercase mb-1">Foto Oficial de Vistoria da Moto</h4>
                            <p class="text-xs text-gray-500 mb-4">Adicione uma foto geral do veículo para atestar as condições físicas atuais.</p>
                            
                            <label class="bg-gray-900 text-white px-4 py-2 text-xs font-bold cursor-pointer hover:bg-black transition border border-gray-700 shadow-hard">
                                Escolher Imagem
                                <input type="file" id="file-foto-moto" accept="image/*" class="hidden">
                            </label>
                            
                            <div id="preview-moto-box" class="mt-4 hidden w-full">
                                <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex justify-between items-center">
                                    <span class="flex items-center gap-2"><i class="ph-fill ph-check-circle text-base"></i> Foto capturada com sucesso!</span>
                                    <button type="button" id="btn-ver-moto" class="underline text-emerald-800 hover:text-black">Abrir Imagem</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-gray-100 flex gap-3 bg-white" id="modal-actions-footer-v">
                        <button type="button" id="btn-cancelar-v" class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2.5 bg-brand-dark text-brand-main font-black hover:bg-black shadow-hard border border-gray-900 transition">Salvar Patrimônio</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="lightbox-viewer-v" class="fixed inset-0 bg-black/90 z-[60] hidden flex flex-col items-center justify-center p-4">
            <button id="btn-fechar-lightbox-v" class="absolute top-5 right-5 text-white bg-gray-950 px-4 py-2 border border-gray-700 font-bold flex items-center gap-2 hover:bg-gray-800 transition"><i class="ph ph-x"></i> Fechar Imagem</button>
            <img id="img-lightbox-src-v" src="" alt="Foto Vistoria" class="max-w-full max-h-[85vh] object-contain border-4 border-white shadow-2xl bg-gray-900">
        </div>
    `;

    // DOM Mapeamento
    const tbody = document.getElementById('tb-veiculos');
    const emptyState = document.getElementById('veiculos-empty');
    const modal = document.getElementById('modal-veiculo');
    const modalPanel = document.getElementById('modal-veiculo-panel');
    const form = document.getElementById('form-veiculo');
    const inputBusca = document.getElementById('busca-veiculos');

    const tabDados = document.getElementById('tab-dados-v');
    const tabVistoria = document.getElementById('tab-vistoria-v');
    const conTabDados = document.getElementById('conteudo-tab-dados-v');
    const conTabVistoria = document.getElementById('conteudo-tab-vistoria-v');

    const fileFoto = document.getElementById('file-foto-moto');
    const boxFoto = document.getElementById('preview-moto-box');
    const lightbox = document.getElementById('lightbox-viewer-v');
    const lightboxImg = document.getElementById('img-lightbox-src-v');

    let imgMotoBase64 = "";

    // Controle de Abas
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

    // Leitor de Foto (Cloud Base64)
    fileFoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            imgMotoBase64 = reader.result;
            boxFoto.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('btn-ver-moto').addEventListener('click', () => {
        if (!imgMotoBase64) return;
        lightboxImg.src = imgMotoBase64;
        lightbox.classList.remove('hidden');
    });
    
    document.getElementById('btn-fechar-lightbox-v').addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });

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
                const isLocado = db.contratos.some(c => c.veiculo_id === v.id && c.status === 'ativo');
                const statusReal = isLocado ? 'locado' : v.status;
                
                const statusConfig = {
                    'disponivel': '<span class="inline-block px-1.5 py-0.5 text-[11px] font-bold bg-gray-900 text-white uppercase tracking-wider">No Pátio</span>',
                    'locado': '<span class="inline-block px-1.5 py-0.5 text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider">Locada</span>',
                    'manutencao': '<span class="inline-block px-1.5 py-0.5 text-[11px] font-bold bg-orange-600 text-white uppercase tracking-wider">Oficina</span>'
                };

                const kmAtual = Number(v.km_atual) || 0;
                const kmOleo = Number(v.km_oleo) || 0;
                const alertaOleo = (kmOleo > 0 && kmAtual >= kmOleo) ? '<i class="ph-fill ph-warning text-red-500 ml-1" title="Óleo Vencido!"></i>' : '';
                
                let alertaDoc = '';
                if (v.doc) {
                    const hoje = new Date();
                    const dataDoc = new Date(v.doc);
                    if (dataDoc < hoje) alertaDoc = '<span class="text-red-500 font-bold text-xs ml-1">(Vencido)</span>';
                }

                const badgeFoto = v.img_moto ? '<i class="ph-fill ph-image text-emerald-500" title="Possui Foto"></i>' : '<i class="ph ph-image text-gray-300" title="Sem Foto"></i>';

                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors";
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="font-bold text-gray-900">${v.modelo} <span class="text-xs font-normal text-gray-400 ml-1">${v.ano || ''}</span></div>
                        <div class="text-xs bg-gray-200 border border-gray-300 text-gray-800 px-1.5 py-0.5 mt-1 inline-block font-mono font-bold">${v.placa}</div>
                    </td>
                    <td class="px-6 py-4 text-gray-600 font-mono text-xs">${v.renavam || '---'}</td>
                    <td class="px-6 py-4">${statusConfig[statusReal]}</td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-mono text-gray-800 font-medium">${kmAtual.toLocaleString('pt-BR')} km ${alertaOleo}</div>
                        <div class="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">Óleo: ${kmOleo > 0 ? kmOleo.toLocaleString('pt-BR') : '--'}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-700">${utils.formatDate(v.doc)} ${alertaDoc}</div>
                        <div class="text-[11px] mt-0.5">${badgeFoto} Ficha Fotográfica</div>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="btn-editar-v text-white bg-brand-dark hover:bg-black px-3 py-1.5 text-xs font-bold shadow-sm transition mr-2" data-id="${v.id}">Dossiê</button>
                        ${!isLocado ? `<button class="btn-deletar-v text-gray-400 hover:text-red-600 px-2 py-1.5 text-xs font-bold transition" data-id="${v.id}">Excluir</button>` : `<span class="text-[11px] font-bold text-gray-300 px-2 uppercase tracking-widest">Travada</span>`}
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
                imgMotoBase64 = "";
                boxFoto.classList.add('hidden');
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
            renavam: document.getElementById('v-renavam').value,
            chassi: document.getElementById('v-chassi').value.toUpperCase(),
            fipe: document.getElementById('v-fipe').value,
            status: document.getElementById('v-status').value,
            doc: document.getElementById('v-doc').value,
            km_atual: document.getElementById('v-km-atual').value,
            km_oleo: document.getElementById('v-km-oleo').value,
            img_moto: imgMotoBase64
        };

        if (id) {
            const index = db.veiculos.findIndex(v => v.id === dados.id);
            if (!dados.img_moto) dados.img_moto = db.veiculos[index].img_moto;
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
            if (confirm("Alerta: Excluir a ficha deste patrimônio apagará definitivamente as fotos de vistoria e dados técnicos. Continuar?")) {
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
            document.getElementById('v-ano').value = v.ano || '';
            document.getElementById('v-renavam').value = v.renavam || '';
            document.getElementById('v-chassi').value = v.chassi || '';
            document.getElementById('v-fipe').value = v.fipe || '';
            document.getElementById('v-status').value = v.status;
            document.getElementById('v-doc').value = v.doc || '';
            document.getElementById('v-km-atual').value = v.km_atual || '';
            document.getElementById('v-km-oleo').value = v.km_oleo || '';
            
            imgMotoBase64 = v.img_moto || "";
            if (imgMotoBase64) boxFoto.classList.remove('hidden');

            document.getElementById('modal-veiculo-title').innerText = "Editar Dossiê do Patrimônio";
            toggleModal(true);
        }
    });

    document.getElementById('btn-novo-veiculo').addEventListener('click', () => toggleModal(true));
    document.getElementById('btn-fechar-modal-v').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancelar-v').addEventListener('click', () => toggleModal(false));
    inputBusca.addEventListener('input', atualizarTabela);

    atualizarTabela();
}
