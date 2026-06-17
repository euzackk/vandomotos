import { db, saveDB, utils } from './db.js';

export function renderContratos(container) {
    container.innerHTML = `
        <div class="flex flex-col h-full fade-enter">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-full max-w-md">
                    <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" id="busca-contratos" placeholder="Buscar por cliente, placa ou número do contrato..." class="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm focus:ring-0 outline-none transition shadow-sm">
                </div>
                <button id="btn-novo-contrato" class="bg-brand-dark hover:bg-black text-white px-5 py-2.5 font-bold text-sm flex items-center gap-2 border border-gray-800 transition-all shadow-hard">
                    <i class="ph ph-handshake text-brand-main text-lg"></i> Firmar Novo Contrato
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
                                <th class="px-6 py-4 font-bold text-right">Ações Legais</th>
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
                            <select id="loc-cliente" required class="w-full px-3 py-2 border border-brand-main/50 text-sm bg-white focus:border-brand-main outline-none font-bold text-gray-800 shadow-sm">
                                </select>
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-extrabold text-brand-hover uppercase tracking-wider mb-1"><i class="ph-fill ph-motorcycle"></i> Patrimônio Disponível no Pátio *</label>
                            <select id="loc-veiculo" required class="w-full px-3 py-2 border border-brand-main/50 text-sm bg-white focus:border-brand-main outline-none font-bold text-gray-800 shadow-sm">
                                </select>
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
                    <td class="px-6 py-4 text-right flex flex-col gap-2 items-end justify-center h-full">
                        <button class="btn-pdf text-brand-dark bg-brand-main hover:bg-brand-hover px-3 py-1.5 text-xs font-bold shadow-sm transition border border-brand-dark flex items-center gap-1 w-32 justify-center" data-id="${c.id}">
                            <i class="ph-fill ph-printer"></i> Imprimir PDF
                        </button>
                        ${c.status === 'ativo' ? `
                        <button class="btn-encerrar text-gray-600 bg-white hover:text-red-600 hover:border-red-600 border border-gray-300 px-3 py-1.5 text-xs font-bold transition w-32 justify-center" data-id="${c.id}">
                            Registrar Retorno
                        </button>` : ``}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function gerarPDFContrato(contratoId) {
        const c = db.contratos.find(x => x.id === contratoId);
        if(!c) return;
        
        const cli = db.clientes.find(x => x.id === c.cliente_id) || {};
        const vei = db.veiculos.find(x => x.id === c.veiculo_id) || {};

        const dataInicioStr = new Date(c.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const dataFimStr = new Date(c.data_fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const dataAtual = new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' });
        
        const enderecoCompleto = cli.logradouro 
            ? `${cli.logradouro}, ${cli.numero} ${cli.complemento || ''} - ${cli.bairro}, ${cli.cidade}/${cli.uf}` 
            : (cli.endereco || 'Endereço não informado no cadastro');

        const combustivelSaida = c.tracos_saida ?? (vei.combustivel || 0);

        const janelaPDF = window.open('', '_blank');
        
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Contrato Oficial - ${cli.nome}</title>
                <style>
                    @page { size: A4; margin: 20mm; }
                    body { font-family: 'Times New Roman', serif; color: #000; line-height: 1.5; font-size: 11pt; }
                    h1 { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin-bottom: 25px; }
                    h2 { font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
                    p { text-align: justify; margin-bottom: 8px; }
                    .bold { font-weight: bold; }
                    .signatures { margin-top: 50px; width: 100%; text-align: center; }
                    .sign-line { width: 45%; display: inline-block; border-top: 1px solid #000; padding-top: 5px; margin: 0 2%; vertical-align: top; font-size: 10pt; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    ul { margin-top: 5px; margin-bottom: 10px; padding-left: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2 style="margin:0; font-size: 16pt;">VANDO MOTOS LOCADORA</h2>
                    <p style="text-align: center; font-size: 10pt; margin:0;">Gestão de Frota e Mobilidade - Porto Velho/RO</p>
                </div>

                <h1>CONTRATO DE LOCAÇÃO DE VEÍCULO</h1>

                <p><span class="bold">LOCADOR:</span> V.M. LOCACAO DE VEICULOS LTDA - ME, inscrita no CNPJ: 14.961.352/0001-18, Nome Fantasia: VANDO MOTOS LOCADORA, com sede na Rua Algodoeiro, 4640, Bairro Caladinho, Porto Velho - RO. Telefones: (69) 8403-7923 / 9222-2722.</p>

                <p><span class="bold">LOCATÁRIO(A):</span> <span class="bold" style="text-transform:uppercase;">${cli.nome || 'N/A'}</span>, portador(a) do CPF/CNPJ: ${cli.cpf_cnpj || 'N/A'}, residente e domiciliado(a) na ${enderecoCompleto}. Contato Whatsapp: ${cli.wpp || 'N/A'}.</p>

                <h2>CLÁUSULA 1ª - DO OBJETO DA LOCAÇÃO</h2>
                <p>O LOCADOR entrega em locação o veículo de sua propriedade sob as seguintes características:</p>
                <ul>
                    <li><span class="bold">Modelo/Cor:</span> ${vei.modelo || 'N/A'}</li>
                    <li><span class="bold">Placa:</span> ${vei.placa || 'N/A'}</li>
                    <li><span class="bold">Chassi:</span> ${vei.chassi || 'N/A'}</li>
                    <li><span class="bold">Vistoria Inicial:</span> Veículo entregue com <span class="bold">${combustivelSaida} traço(s) de combustível</span>, higienizado e conforme registro fotográfico em anexo no sistema.</li>
                </ul>

                <h2>CLÁUSULA 2ª - DA FINALIDADE E USO</h2>
                <p>O veículo destina-se a uso exclusivo do LOCATÁRIO, restrito à área urbana e rural limítrofe do município de Porto Velho - RO. É expressamente proibido ceder, sublocar, emprestar ou transferir o veículo a terceiros sob qualquer pretexto.</p>

                <h2>CLÁUSULA 3ª - DO PRAZO E DEVOLUÇÃO</h2>
                <p>O presente contrato tem vigência a partir de <span class="bold">${dataInicioStr}</span> com encerramento fixado para <span class="bold">${dataFimStr}</span>.</p>
                <p><span class="bold">Parágrafo Único:</span> A não devolução no prazo configura quebra de contrato e apropriação indébita, autorizando o LOCADOR a tomar medidas policiais e judiciais de busca e apreensão.</p>

                <h2>CLÁUSULA 4ª - DOS VALORES, GARANTIAS E PENALIDADES</h2>
                <p>O LOCATÁRIO pagará a importância total de <span class="bold">${utils.formatMoney(c.valor)}</span>. Em caso de devolução antecipada, não haverá reembolso de valores. O LOCATÁRIO concorda com as seguintes penalidades rigorosas:</p>
                <ul>
                    <li><span class="bold">Atraso na Devolução:</span> Tolerância zero. Ao passar 1 minuto do horário fixado, incidirá multa imediata de R$ 50,00, acrescida de R$ 50,00 por hora excedente.</li>
                    <li><span class="bold">Combustível:</span> O veículo deve retornar com a mesma quantidade de traços de combustível da vistoria inicial. Cobrar-se-á taxa de R$ 50,00 por traço faltante.</li>
                    <li><span class="bold">Limpeza e Conservação:</span> A devolução do veículo sujo implicará em cobrança de R$ 50,00 (lavagem simples) ou R$ 150,00 (lavagem especial/barro pesado).</li>
                    <li><span class="bold">Caução:</span> Fica retido o valor de <span class="bold">${utils.formatMoney(c.caucao)}</span>, a ser devolvido após a vistoria final se isento de multas ou danos.</li>
                    <li><span class="bold">Garantia Total:</span> O LOCATÁRIO assina Nota Promissória no valor venal do veículo (<span class="bold">${utils.formatMoney(vei.fipe)}</span>), a ser executada em caso de perda total, roubo ou apropriação indébita.</li>
                </ul>

                <h2>CLÁUSULA 5ª - DA RESPONSABILIDADE CIVIL, CRIMINAL E TRÂNSITO</h2>
                <p>O LOCATÁRIO assume total e irrestrita responsabilidade por quaisquer danos materiais ou corporais causados a si mesmo, ao veículo ou a terceiros.</p>
                <ul>
                    <li><span class="bold">Infrações de Trânsito:</span> Autoriza expressamente a indicação do seu nome/CNH como condutor infrator para qualquer multa no período.</li>
                    <li><span class="bold">Apreensão:</span> Despesas com guincho, diárias de pátio do Detran e despachante devidas à conduta do LOCATÁRIO correrão por sua conta exclusiva.</li>
                    <li><span class="bold">Manutenção:</span> A fundição do motor por negligência na verificação de óleo será cobrada integralmente ao LOCATÁRIO.</li>
                </ul>

                <h2>CLÁUSULA 6ª - DO FORO</h2>
                <p>Elegem as partes o Foro da Comarca de Porto Velho - RO para dirimir eventuais dúvidas. E, por estarem de acordo, assinam o presente contrato.</p>

                <p style="text-align: right; margin-top: 30px;">Porto Velho - RO, ${dataAtual}.</p>

                <div class="signatures">
                    <div class="sign-line">
                        <span class="bold">VANDO MOTOS LOCADORA LTDA</span><br>(Locador / Vistoriador)
                    </div>
                    <div class="sign-line">
                        <span class="bold" style="text-transform:uppercase;">${cli.nome || 'LOCATÁRIO'}</span><br>CPF/CNPJ: ${cli.cpf_cnpj || ''}
                    </div>
                </div>
            </body>
            </html>
        `;

        janelaPDF.document.write(html);
        janelaPDF.document.close();
        janelaPDF.focus();
        
        setTimeout(() => {
            janelaPDF.print();
        }, 800);
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
            setTimeout(() => {
                modal.classList.add('hidden');
                form.reset();
            }, 200);
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

        if (veiculoObj) {
            veiculoObj.status = 'locado';
        }

        saveDB();
        atualizarTabela();
        toggleModal(false);

        if(confirm("Contrato registado com sucesso no sistema! Deseja imprimir o ficheiro PDF agora?")) {
            gerarPDFContrato(novoContrato.id);
        }
    });

    tbody.addEventListener('click', (e) => {
        const btnPDF = e.target.closest('.btn-pdf');
        const btnEncerrar = e.target.closest('.btn-encerrar');

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
                if (veiIndex > -1) {
                    db.veiculos[veiIndex].status = 'disponivel';
                }

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
