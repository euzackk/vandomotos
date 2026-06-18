import { db, saveDB, utils } from './db.js';

export function renderContratos(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div class="relative w-full md:max-w-md">
                    <i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-contratos" placeholder="Buscar por cliente, placa ou número do contrato..." class="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm focus:ring-0 outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-contrato" class="w-full md:w-auto justify-center bg-brand-dark hover:bg-black text-white px-5 py-3 md:py-2.5 font-bold text-sm flex items-center gap-2 border border-gray-800 transition-all shadow-hard">
                    <i class="ph-bold ph-handshake text-brand-main text-lg"></i> Firmar Novo Contrato
                </button>
            </div>

            <div class="bg-white border border-gray-200 shadow-soft flex-1 overflow-hidden flex flex-col">
                <div class="overflow-x-auto flex-1 custom-scroll">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-mono">
                                <th class="px-6 py-4 font-bold">Nº Contrato</th>
                                <th class="px-6 py-4 font-bold">Cliente</th>
                                <th class="px-6 py-4 font-bold">Veículo / Placa</th>
                                <th class="px-6 py-4 font-bold">Período de Vigência</th>
                                <th class="px-6 py-4 font-bold">Status Operacional</th>
                                <th class="px-6 py-4 font-bold text-right">Painel de Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tb-contratos" class="divide-y divide-gray-100"></tbody>
                    </table>
                </div>
                
                <div id="contratos-empty" class="hidden flex-col items-center justify-center py-16 text-center">
                    <i class="ph ph-folder-open text-5xl text-gray-300 mb-3"></i>
                    <p class="text-sm text-gray-500 font-bold uppercase tracking-wider">Nenhum contrato registado na base de dados</p>
                </div>
            </div>
        </div>

        <div id="modal-contrato" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 transition-opacity opacity-0">
            <div class="bg-white border border-gray-900 w-full max-w-4xl shadow-2xl overflow-hidden transform scale-95 transition-transform flex flex-col" id="modal-contrato-panel">
                
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight">Emissão de Contrato de Locação</h2>
                        <p class="text-xs text-gray-500 font-mono mt-0.5">Cruzamento de dados do Cliente e Patrimônio</p>
                    </div>
                    <button id="btn-fechar-modal-c" class="text-gray-400 hover:text-red-600 transition p-1"><i class="ph ph-x text-2xl"></i></button>
                </div>

                <form id="form-contrato" class="p-6 space-y-6 bg-white overflow-y-auto max-h-[70vh] custom-scroll">
                    <div class="bg-brand-light border border-brand-main p-4 flex flex-col md:flex-row gap-4 mb-2">
                        <div class="flex-1">
                            <label class="block text-xs font-extrabold text-brand-hover uppercase tracking-wider mb-1"><i class="ph-fill ph-user"></i> Selecione o Cliente *</label>
                            <select id="loc-cliente" required class="w-full px-3 py-2 border border-brand-main/50 text-sm bg-white focus:border-brand-main outline-none font-bold text-gray-800 shadow-sm"></select>
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-extrabold text-brand-hover uppercase tracking-wider mb-1"><i class="ph-fill ph-motorcycle"></i> Patrimônio Disponível no Pátio *</label>
                            <select id="loc-veiculo" required class="w-full px-3 py-2 border border-brand-main/50 text-sm bg-white focus:border-brand-main outline-none font-bold text-gray-800 shadow-sm"></select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-5">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Data e Hora da Saída *</label>
                            <input type="datetime-local" id="loc-data-inicio" required class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none bg-white">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Previsão de Devolução (Data e Hora) *</label>
                            <input type="datetime-local" id="loc-data-fim" required class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none bg-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-5">
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Valor Total da Locação (R$) *</label>
                            <input type="number" id="loc-valor" required placeholder="Ex: 450" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono font-bold text-lg text-emerald-700">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Caução Retida para Avarias (R$) *</label>
                            <input type="number" id="loc-caucao" required placeholder="Ex: 1000" class="w-full px-3 py-2 border border-gray-300 text-sm focus:border-brand-main outline-none font-mono">
                            <p class="text-[10px] text-gray-500 mt-1">Este valor servirá de base na Cláusula 4ª do contrato.</p>
                        </div>
                    </div>

                    <div class="pt-6 mt-2 border-t border-gray-100 flex gap-3">
                        <button type="button" id="btn-cancelar-c" class="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition uppercase tracking-wider text-xs">Cancelar Operação</button>
                        <button type="submit" class="flex-1 px-4 py-3 bg-brand-dark text-brand-main font-black hover:bg-black shadow-hard border border-gray-900 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs">
                            <i class="ph-fill ph-file-pdf text-lg"></i> Gerar e Emitir Contrato
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

    const selCliente = document.getElementById('loc-cliente');
    const selVeiculo = document.getElementById('loc-veiculo');
    const inputInicio = document.getElementById('loc-data-inicio');

    function carregarSelects() {
        selCliente.innerHTML = '<option value="">-- Indique o Cliente --</option>';
        selVeiculo.innerHTML = '<option value="">-- Moto Livre no Pátio --</option>';

        db.clientes.forEach(c => {
            selCliente.innerHTML += `<option value="${c.id}">${c.codigo || 'S/C'} - ${c.nome} (CPF: ${c.cpf_cnpj})</option>`;
        });

        const veiculosDisponiveis = db.veiculos.filter(v => v.status === 'disponivel');
        
        veiculosDisponiveis.forEach(v => {
            selVeiculo.innerHTML += `<option value="${v.id}">${v.placa} - ${v.modelo} [${v.combustivel || 0} Traços]</option>`;
        });
    }

    function atualizarTabela() {
        const termo = inputBusca.value.toLowerCase();
        tbody.innerHTML = '';
        
        const filtrados = db.contratos.filter(c => {
            const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: '' };
            const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { placa: '' };
            return cli.nome.toLowerCase().includes(termo) || vei.placa.toLowerCase().includes(termo) || c.id.toString().includes(termo);
        });

        filtrados.sort((a, b) => {
            if (a.status === 'ativo' && b.status !== 'ativo') return -1;
            if (a.status !== 'ativo' && b.status === 'ativo') return 1;
            return b.id - a.id;
        });

        if (filtrados.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            filtrados.forEach(c => {
                const cli = db.clientes.find(x => x.id === c.cliente_id) || { nome: 'Cliente Apagado', wpp: '---' };
                const vei = db.veiculos.find(x => x.id === c.veiculo_id) || { modelo: 'Veículo Apagado', placa: '---' };
                
                const dataFimObj = new Date(c.data_fim);
                const isAtrasado = c.status === 'ativo' && dataFimObj < new Date();
                
                let badgeStatus = '';
                if (c.status === 'ativo') {
                    badgeStatus = isAtrasado 
                        ? `<span class="bg-red-100 text-red-700 px-2 py-1 text-[10px] font-black uppercase tracking-widest border border-red-200"><i class="ph-fill ph-warning-circle"></i> Atraso Crítico</span>` 
                        : `<span class="bg-blue-100 text-blue-700 px-2 py-1 text-[10px] font-black uppercase tracking-widest border border-blue-200"><i class="ph-fill ph-play-circle"></i> Em Trânsito</span>`;
                } else {
                    badgeStatus = `<span class="bg-gray-100 text-gray-500 px-2 py-1 text-[10px] font-black uppercase tracking-widest border border-gray-300"><i class="ph-fill ph-check-circle"></i> Finalizado</span>`;
                }

                const dtInicio = new Date(c.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                const dtFim = new Date(c.data_fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

                const tr = document.createElement('tr');
                tr.className = `border-b border-gray-100 last:border-0 transition-colors ${c.status === 'encerrado' ? 'bg-gray-50/50 opacity-80' : 'hover:bg-gray-50'}`;
                
                tr.innerHTML = `
                    <td class="px-6 py-4 text-xs font-mono font-bold text-gray-500">#VM-${c.id.toString().slice(-5)}</td>
                    <td class="px-6 py-4">
                        <div class="font-bold text-gray-900">${cli.nome}</div>
                        <div class="text-[10px] text-gray-500 mt-1 uppercase"><i class="ph-fill ph-whatsapp text-emerald-500"></i> ${cli.wpp}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-bold text-gray-800">${vei.modelo}</div>
                        <div class="text-xs bg-white border border-gray-300 inline-block px-1.5 py-0.5 shadow-sm font-mono text-gray-900 mt-1 font-bold">${vei.placa}</div>
                    </td>
                    <td class="px-6 py-4 text-xs">
                        <div class="text-gray-500 mb-1">Saída: <span class="font-bold text-gray-800">${dtInicio}</span></div>
                        <div class="${isAtrasado ? 'text-red-600 font-bold' : 'text-gray-500'}">Retorno: <span class="font-bold">${dtFim}</span></div>
                    </td>
                    <td class="px-6 py-4">${badgeStatus}</td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex flex-col gap-1.5 items-end justify-center h-full w-full">
                            <div class="flex gap-1 w-full justify-end">
                                <button class="btn-wpp bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 px-2 py-1 text-[10px] uppercase tracking-wider font-black transition rounded-sm flex items-center gap-1 shadow-sm" data-id="${c.id}" title="Avisar no WhatsApp">
                                    <i class="ph-bold ph-whatsapp text-sm"></i> WPP
                                </button>
                                <button class="btn-pdf bg-brand-main hover:bg-brand-hover text-brand-dark px-2 py-1 text-[10px] uppercase tracking-wider font-black transition border border-brand-dark rounded-sm flex items-center gap-1 shadow-sm" data-id="${c.id}" title="Gerar PDF Oficial">
                                    <i class="ph-bold ph-printer text-sm"></i> PDF
                                </button>
                            </div>
                            <div class="flex gap-1 w-full justify-end">
                                ${c.status === 'ativo' ? `
                                <button class="btn-renovar bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-700 px-2 py-1 text-[10px] font-black uppercase tracking-wider transition rounded-sm flex items-center gap-1 shadow-sm" data-id="${c.id}" title="Renovação Automática">
                                    <i class="ph-bold ph-arrows-clockwise text-sm"></i> Renovar
                                </button>
                                <button class="btn-encerrar bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-700 px-2 py-1 text-[10px] font-black uppercase tracking-wider transition rounded-sm flex items-center gap-1 shadow-sm" data-id="${c.id}" title="Encerrar Contrato">
                                    <i class="ph-bold ph-stop text-sm"></i> Baixa
                                </button>
                                ` : ``}
                                <button class="btn-excluir-contrato bg-red-50 text-red-700 border border-red-200 hover:bg-red-700 hover:text-white hover:border-red-800 px-2 py-1 text-[10px] font-black uppercase tracking-wider transition rounded-sm flex items-center gap-1 shadow-sm" data-id="${c.id}" title="Apagar Registro Definitivamente">
                                    <i class="ph-bold ph-trash text-sm"></i> Apagar
                                </button>
                            </div>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // ============================================================================
    // MOTOR DEFINITIVO DE PDF (HTML2PDF com Injeção de Marca D'água jsPDF)
    // ============================================================================
    function gerarPDFContrato(contratoId) {
        const c = db.contratos.find(x => x.id === contratoId);
        if(!c) return;
        
        const cli = db.clientes.find(x => x.id === c.cliente_id) || {};
        const vei = db.veiculos.find(x => x.id === c.veiculo_id) || {};

        const dataInicioStr = new Date(c.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const dataFimStr = new Date(c.data_fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const dataAtualObj = new Date();
        const dataAtualExtenso = dataAtualObj.toLocaleDateString('pt-BR', { dateStyle: 'long' });
        const horaAtual = dataAtualObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const enderecoCompleto = cli.logradouro ? `${cli.logradouro}, ${cli.numero} ${cli.complemento || ''} - ${cli.bairro}, ${cli.cidade}/${cli.uf}` : (cli.endereco || '________________________________________________');
        const combustivelSaida = c.tracos_saida ?? (vei.combustivel || 0);

        // Prepara a imagem para injeção no PDF
        const logoUrl = new URL('./assets/img/logo.png', document.baseURI).href;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = logoUrl;

        // Inicia a geração apenas quando a imagem for carregada na memória
        img.onload = function() {
            alert("A compilar o PDF Oficial. O download será iniciado em poucos segundos...");

            // Converte a logo para Base64 com opacidade para a Marca D'água
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.globalAlpha = 0.15; // 15% de Opacidade (Perfeito e subtil)
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');

            // Cria o corpo do documento (Sem a imagem, porque a imagem vai direto pro motor PDF)
            const container = document.createElement('div');
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.color = '#000';
            container.style.fontSize = '12px';
            container.style.lineHeight = '1.5';
            container.style.padding = '0';

            container.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    <h2 style="margin:0; font-size: 18px; font-weight: bold; text-transform: uppercase;">VANDO MOTOS LOCADORA LTDA</h2>
                    <p style="margin:0; font-size: 12px;">CNPJ: 28.623.431/0001-23 | Rua Algodoeiro, 4581 - Caladinho, Porto Velho/RO</p>
                </div>
                <h1 style="text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin-bottom: 15px;">CONTRATO DE LOCAÇÃO DE VEÍCULO</h1>

                <p style="text-align: justify; margin-bottom: 10px;"><strong>LOCADOR:</strong> VANDO MOTOS LOCADORA LTDA, inscrita no CNPJ sob o nº 28.623.431/0001-23, Nome Fantasia: VANDO MOTOS, com sede na Rua Algodoeiro, nº 4581, Bairro Caladinho, CEP 76.808-252, Porto Velho - RO. Telefone: (69) 3227-1985 / (69) 9222-2722.</p>
                <p style="text-align: justify; margin-bottom: 15px;"><strong>LOCATÁRIO(A):</strong> <strong style="text-transform:uppercase;">${cli.nome || '___________________________'}</strong>, portador(a) do CPF/CNPJ: ${cli.cpf_cnpj || '________________'}, residente e domiciliado(a) na ${enderecoCompleto}. Contato: ${cli.wpp || '________________'}.</p>

                <h2 style="font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; background: #f0f0f0; padding: 4px;">CLÁUSULA 1ª - DO OBJETO DA LOCAÇÃO</h2>
                <ul style="margin-top: 5px; margin-bottom: 10px; padding-left: 20px;">
                    <li><strong>Modelo/Cor:</strong> ${vei.modelo || '___________________'}</li>
                    <li><strong>Placa:</strong> ${vei.placa || '_________'}</li>
                    <li><strong>RENAVAM:</strong> ${vei.renavam || '___________________'}</li>
                    <li><strong>Vistoria Inicial:</strong> Veículo entregue com <strong>${combustivelSaida} traço(s) de combustível</strong>, higienizado e inspecionado no sistema.</li>
                </ul>

                <h2 style="font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; background: #f0f0f0; padding: 4px;">CLÁUSULA 2ª - DA FINALIDADE E USO</h2>
                <p style="text-align: justify; margin-bottom: 10px;">O veículo destina-se a uso exclusivo do LOCATÁRIO, restrito à área urbana e rural limítrofe do município de Porto Velho - RO. É expressamente proibido ceder, emprestar ou sublocar a terceiros, sob pena de apreensão imediata do bem e rescisão contratual.</p>

                <h2 style="font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; background: #f0f0f0; padding: 4px;">CLÁUSULA 3ª - DO PRAZO E DEVOLUÇÃO</h2>
                <p style="text-align: justify; margin-bottom: 10px;">O presente contrato tem vigência a partir de <strong>${dataInicioStr}</strong> com encerramento fixado para <strong>${dataFimStr}</strong>. A não devolução do bem no prazo estipulado configura Apropriação Indébita (Art. 168 do Código Penal).</p>

                <h2 style="font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; background: #f0f0f0; padding: 4px;">CLÁUSULA 4ª - DOS VALORES E GARANTIAS</h2>
                <p style="text-align: justify; margin-bottom: 5px;">O LOCATÁRIO pagará a importância de <strong>${utils.formatMoney(c.valor)}</strong> pela locação. Concorda expressamente com:</p>
                <ol style="margin-top: 5px; margin-bottom: 10px; padding-left: 20px;">
                    <li><strong>Atraso na Devolução:</strong> Multa imediata de R$ 50,00, acrescida de R$ 50,00 por cada hora excedente ao horário fixado.</li>
                    <li><strong>Combustível e Limpeza:</strong> Taxa de R$ 50,00 por traço faltante de gasolina. Devolução suja gera taxa de lavagem de R$ 50,00 a R$ 150,00.</li>
                    <li><strong>Caução:</strong> Valor retido de <strong>${utils.formatMoney(c.caucao)}</strong>, devolvido na vistoria isenta de danos.</li>
                    <li><strong>Garantia Total:</strong> Assinatura de Promissória no valor venal do veículo (FIPE: ${utils.formatMoney(vei.fipe)}), executável em caso de roubo, furto ou perda total.</li>
                </ol>

                <h2 style="font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; background: #f0f0f0; padding: 4px;">CLÁUSULA 5ª - RESPONSABILIDADE CIVIL E CRIMINAL</h2>
                <p style="text-align: justify; margin-bottom: 5px;">O LOCATÁRIO assume exclusiva responsabilidade por quaisquer danos materiais, pessoais, morais ou a terceiros. Em caso de acidente, incêndio, furto ou roubo, o LOCATÁRIO arcará com 100% dos custos de reparo em oficina de confiança da LOCADORA.</p>
                <p style="text-align: justify; margin-bottom: 10px;">Parágrafo Único: O LOCATÁRIO também concorda em indenizar a LOCADORA pelas diárias correspondentes ao período em que o veículo ficar imobilizado na oficina (lucros cessantes).</p>

                <h2 style="font-size: 14px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; background: #f0f0f0; padding: 4px;">CLÁUSULA 6ª - DAS INFRAÇÕES DE TRÂNSITO</h2>
                <p style="text-align: justify; margin-bottom: 10px;">O LOCATÁRIO autoriza a indicação do seu nome e CNH como condutor infrator para toda e qualquer multa. Despesas com guincho, pátio do DETRAN e taxas correrão por conta do LOCATÁRIO.</p>

                <p style="text-align: right; margin-top: 30px; font-weight: bold;">Porto Velho - RO, ${dataAtualExtenso} às ${horaAtual}.</p>

                <div style="margin-top: 50px; width: 100%; display: flex; justify-content: space-between; text-align: center;">
                    <div style="width: 45%;">
                        <div style="border-top: 1px solid #000; padding-top: 5px;">
                            <strong>VANDO MOTOS LOCADORA LTDA</strong><br>(Locador)
                        </div>
                    </div>
                    <div style="width: 45%;">
                        <div style="border-top: 1px solid #000; padding-top: 5px;">
                            <strong style="text-transform:uppercase;">${cli.nome || 'LOCATÁRIO'}</strong><br>(Locatário)
                        </div>
                    </div>
                </div>
            `;

            // Configurações do Compilador PDF
            const opt = {
                margin:       15,
                filename:     `Contrato_${cli.nome.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Compila o PDF e injeta a marca d'água no meio de TODAS as páginas
            html2pdf().set(opt).from(container).toPdf().get('pdf').then(function (pdf) {
                const totalPages = pdf.internal.getNumberOfPages();
                
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    
                    // Tamanho A4: 210mm x 297mm. Vamos fazer a logo ter 120mm de largura
                    const imgWidth = 120;
                    const imgHeight = (img.height * imgWidth) / img.width;
                    const x = (210 - imgWidth) / 2;
                    const y = (297 - imgHeight) / 2;
                    
                    // Desenha a imagem exatamente no centro da página
                    pdf.addImage(dataURL, 'PNG', x, y, imgWidth, imgHeight);
                }
            }).save();
        };

        img.onerror = function() {
            alert("Erro de conexão ao carregar o logótipo oficial. Tente novamente.");
        };
    }

    function toggleModal(abrir = true) {
        if (abrir) {
            carregarSelects();
            const agora = new Date();
            agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
            inputInicio.value = agora.toISOString().slice(0, 16);
            modal.classList.remove('hidden');
            setTimeout(() => { modal.classList.remove('opacity-0'); modalPanel.classList.remove('scale-95'); }, 10);
        } else {
            modal.classList.add('opacity-0');
            modalPanel.classList.add('scale-95');
            setTimeout(() => { modal.classList.add('hidden'); form.reset(); }, 200);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const veiId = Number(selVeiculo.value);
        const veiculoObj = db.veiculos.find(v => v.id === veiId);
        
        const novoContrato = {
            id: Date.now(),
            cliente_id: Number(selCliente.value),
            veiculo_id: veiId,
            data_inicio: inputInicio.value,
            data_fim: document.getElementById('loc-data-fim').value,
            valor: Number(document.getElementById('loc-valor').value),
            caucao: Number(document.getElementById('loc-caucao').value),
            tracos_saida: veiculoObj ? (veiculoObj.combustivel || 0) : 0,
            status: 'ativo'
        };

        db.contratos.push(novoContrato);
        if (veiculoObj) veiculoObj.status = 'locado';

        saveDB();
        atualizarTabela();
        toggleModal(false);

        if(confirm("Contrato registado com sucesso no sistema! Deseja compilar o ficheiro PDF Limpo agora?")) {
            gerarPDFContrato(novoContrato.id);
        }
    });

    tbody.addEventListener('click', (e) => {
        const btnPDF = e.target.closest('.btn-pdf');
        const btnEncerrar = e.target.closest('.btn-encerrar');
        const btnWpp = e.target.closest('.btn-wpp');
        const btnRenovar = e.target.closest('.btn-renovar');
        const btnExcluirContrato = e.target.closest('.btn-excluir-contrato');

        if (btnExcluirContrato) {
            const id = Number(btnExcluirContrato.getAttribute('data-id'));
            const c = db.contratos.find(x => x.id === id);
            
            const senha = prompt("⚠️ AÇÃO RESTRITA ADMINISTRATIVA ⚠️\\n\\nEste registro será apagado permanentemente.\\nDigite a senha administrativa para confirmar:");
            
            if (senha === "admin123") {
                if (c && c.status === 'ativo') {
                    const veiIndex = db.veiculos.findIndex(v => v.id === c.veiculo_id);
                    if (veiIndex > -1) db.veiculos[veiIndex].status = 'disponivel';
                }
                
                db.contratos = db.contratos.filter(x => x.id !== id);
                saveDB();
                atualizarTabela();
                alert("Registro excluído com sucesso.");
            } else if (senha !== null) {
                alert("❌ Senha incorreta. Exclusão abortada por segurança.");
            }
        }

        if (btnWpp) {
            const id = Number(btnWpp.getAttribute('data-id'));
            const c = db.contratos.find(x => x.id === id);
            const cli = db.clientes.find(x => x.id === c.cliente_id) || {nome: 'Cliente', wpp: ''};
            const vei = db.veiculos.find(x => x.id === c.veiculo_id) || {modelo: 'Moto', placa: ''};
            const dataFimStr = new Date(c.data_fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
            
            let texto = `Olá *${cli.nome.trim()}*, tudo bem? 👋\\n\\n`;
            texto += `Aqui é da *VANDO MOTOS LOCADORA*.\\n`;
            texto += `Este é o aviso oficial do seu contrato de locação da moto *${vei.modelo}* (Placa: *${vei.placa}*).\\n`;
            texto += `A devolução/renovação do veículo está fixada para o dia: *${dataFimStr}*.\\n\\n`;
            texto += `Qualquer dúvida, a nossa oficina está à disposição! 🏍️`;

            const fone = cli.wpp.replace(/\\D/g, '');
            if (fone.length >= 10) {
                window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(texto)}`, '_blank');
            } else {
                alert("O número de WhatsApp cadastrado para este cliente é inválido.");
            }
        }

        if (btnRenovar) {
            const id = Number(btnRenovar.getAttribute('data-id'));
            const c = db.contratos.find(x => x.id === id);
            const diasTexto = prompt("RENOVAÇÃO AUTOMÁTICA\\n\\nQuantos dias deseja adicionar de extensão a este contrato?\\n(Ex: 7 para uma semana)", "7");
            
            if (diasTexto !== null) {
                const dias = parseInt(diasTexto);
                if (!isNaN(dias) && dias > 0) {
                    const dataAtual = new Date(c.data_fim);
                    dataAtual.setDate(dataAtual.getDate() + dias);
                    const novaDataLocal = new Date(dataAtual.getTime() - (dataAtual.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                    c.data_fim = novaDataLocal;
                    
                    if(c.vencimento) {
                        const dataVenc = new Date(c.vencimento);
                        dataVenc.setDate(dataVenc.getDate() + dias);
                        c.vencimento = new Date(dataVenc.getTime() - (dataVenc.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    }

                    saveDB();
                    atualizarTabela();
                    alert(`✅ Contrato atualizado! Prolongado por mais ${dias} dias.`);
                } else {
                    alert("Atenção: Introduza um número válido de dias.");
                }
            }
        }

        if (btnPDF) {
            const id = Number(btnPDF.getAttribute('data-id'));
            gerarPDFContrato(id);
        }
        
        if (btnEncerrar) {
            const id = Number(btnEncerrar.getAttribute('data-id'));
            if (confirm("Confirma a receção do veículo e o encerramento da locação? O veículo voltará a ficar 'Disponível' no pátio para novos contratos.")) {
                const index = db.contratos.findIndex(c => c.id === id);
                db.contratos[index].status = 'encerrado';
                
                const veiIndex = db.veiculos.findIndex(v => v.id === db.contratos[index].veiculo_id);
                if (veiIndex > -1) db.veiculos[veiIndex].status = 'disponivel';

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
