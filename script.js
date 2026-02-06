// CONFIGURA��O
const LOJA_NUMERO = "5527999999295"; // Seu n�mero sem espa�os ou tra�os

// BANCO DE DADOS (Simula��o para o MVP)
// No futuro, isso viria do Supabase
const menuDatabase = [
    // SALGADOS
    { id: 1, nome: "Coxinha de Frango", preco: 6.50, categoria: "salgados" },
    { id: 2, nome: "Empada de Palmito", preco: 7.00, categoria: "salgados" },
    { id: 3, nome: "Kibe Recheado", preco: 6.50, categoria: "salgados" },
    
    // PETISCOS
    { id: 4, nome: "Batata Frita (400g)", preco: 25.00, categoria: "petiscos" },
    { id: 5, nome: "Isca de Peixe", preco: 35.00, categoria: "petiscos" },
    { id: 6, nome: "Calabresa Acebolada", preco: 28.00, categoria: "petiscos" },

    // ALMO�O
    { id: 7, nome: "Prato Feito (Carne)", preco: 18.00, categoria: "almoco" },
    { id: 8, nome: "Prato Feito (Frango)", preco: 18.00, categoria: "almoco" },
    { id: 9, nome: "Marmitex Executiva", preco: 22.00, categoria: "almoco" }
];

// ESTADO DO CARRINHO
let carrinho = []; // Array de objetos: { id, qtd, nome, preco }

// FORMATA��O DE MOEDA
const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// -------------------------------------------------------------------------
// NAVEGA��O
// -------------------------------------------------------------------------

function navegarPara(telaId) {
    // Esconde todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    // Mostra a tela desejada
    const tela = document.getElementById(telaId);
    tela.classList.remove('hidden');
    tela.classList.add('active');

    // Se for para o carrinho, atualiza a visualiza��o
    if(telaId === 'tela-carrinho') {
        renderizarCarrinho();
    }
    
    // Rola para o topo
    window.scrollTo(0,0);
}

function abrirCardapio(categoria) {
    const titulo = document.getElementById('titulo-categoria');
    const lista = document.getElementById('lista-produtos');
    
    titulo.innerText = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    lista.innerHTML = ''; // Limpa lista anterior

    const produtosFiltrados = menuDatabase.filter(p => p.categoria === categoria);

    produtosFiltrados.forEach(produto => {
        // Verifica se j� tem no carrinho para mostrar qtd
        const itemNoCarrinho = carrinho.find(item => item.id === produto.id);
        const qtdAtual = itemNoCarrinho ? itemNoCarrinho.qtd : 0;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'product-item';
        itemDiv.innerHTML = `
            <div class="prod-info">
                <h4>${produto.nome}</h4>
                <div class="price">${formatarMoeda(produto.preco)}</div>
            </div>
            <div class="prod-controls">
                <button class="btn-qtd" onclick="alterarQtd(${produto.id}, -1)">-</button>
                <span class="qtd-display" id="qtd-${produto.id}">${qtdAtual}</span>
                <button class="btn-qtd" onclick="alterarQtd(${produto.id}, 1)">+</button>
            </div>
        `;
        lista.appendChild(itemDiv);
    });

    navegarPara('tela-cardapio');
}

// -------------------------------------------------------------------------
// L�GICA DO CARRINHO
// -------------------------------------------------------------------------

function alterarQtd(idProduto, mudanca) {
    const produto = menuDatabase.find(p => p.id === idProduto);
    const itemIndex = carrinho.findIndex(item => item.id === idProduto);

    if (itemIndex >= 0) {
        // Produto j� est� no carrinho
        carrinho[itemIndex].qtd += mudanca;
        if (carrinho[itemIndex].qtd <= 0) {
            carrinho.splice(itemIndex, 1); // Remove se qtd for 0
        }
    } else if (mudanca > 0) {
        // Adiciona novo produto
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            qtd: 1
        });
    }

    atualizarInterface();
}

function atualizarInterface() {
    // Atualiza contadores na tela de card�pio (se estiver vis�vel)
    carrinho.forEach(item => {
        const display = document.getElementById(`qtd-${item.id}`);
        if(display) display.innerText = item.qtd;
    });
    
    // Se o item foi removido, zera o display
    menuDatabase.forEach(p => {
        if(!carrinho.find(i => i.id === p.id)) {
            const display = document.getElementById(`qtd-${p.id}`);
            if(display) display.innerText = '0';
        }
    });

    // Atualiza Barra Flutuante
    const totalItens = carrinho.reduce((total, item) => total + item.qtd, 0);
    const totalValor = carrinho.reduce((total, item) => total + (item.preco * item.qtd), 0);

    document.getElementById('contador-itens').innerText = totalItens;
    document.getElementById('total-flutuante').innerText = formatarMoeda(totalValor);

    const barra = document.getElementById('barra-carrinho');
    if (totalItens > 0) {
        barra.classList.remove('hidden');
    } else {
        barra.classList.add('hidden');
    }
}

function renderizarCarrinho() {
    const container = document.getElementById('itens-carrinho');
    const totalDisplay = document.getElementById('total-carrinho-tela');
    
    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<p class="empty-msg">Seu carrinho est� vazio.</p>';
        totalDisplay.innerText = 'R$ 0,00';
        return;
    }

    let totalGeral = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.qtd;
        totalGeral += subtotal;

        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `
            <div>${item.qtd}x ${item.nome}</div>
            <div>${formatarMoeda(subtotal)}</div>
        `;
        container.appendChild(div);
    });

    totalDisplay.innerText = formatarMoeda(totalGeral);
}

// -------------------------------------------------------------------------
// FINALIZA��O (WHATSAPP)
// -------------------------------------------------------------------------

function finalizarPedido() {
    // 1. Verifica se carrinho tem itens
    if (carrinho.length === 0) {
        alert("Seu carrinho est� vazio! Adicione itens antes de finalizar.");
        return;
    }

    // 2. Coleta dados do formul�rio
    const nome = document.getElementById('nome').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const bairro = document.getElementById('bairro').value;
    const complemento = document.getElementById('complemento').value;
    const referencia = document.getElementById('referencia').value;

    // 3. Valida��o simples (Campos obrigat�rios)
    if (nome === "" || rua === "" || numero === "" || bairro === "") {
        alert("?? Ops! Preencha NOME, RUA, N�MERO e BAIRRO para continuar.");

        // Destaca os campos vazios com borda vermelha (opcional visual)
        if (nome === "") document.getElementById('nome').style.border = "1px solid red";
        if (rua === "") document.getElementById('rua').style.border = "1px solid red";
        return;
    }

    // 4. Montagem da mensagem para o WhatsApp
    // %0A � a quebra de linha
    let mensagem = `*NOVO PEDIDO DO SITE* ??%0A%0A`;
    mensagem += `?? *Cliente:* ${nome}%0A`;
    mensagem += `?? *Endere�o:* ${rua}, ${numero} - ${bairro}%0A`;

    if (complemento) mensagem += `?? *Compl.:* ${complemento}%0A`;
    if (referencia) mensagem += `?? *Ref.:* ${referencia}%0A`;

    mensagem += `%0A?? *RESUMO DO PEDIDO:*%0A`;

    let total = 0;
    carrinho.forEach(item => {
        const subtotal = item.preco * item.qtd;
        total += subtotal;
        // Ex: 2x X-Burguer ...... R$ 30,00
        mensagem += `${item.qtd}x ${item.nome} ... ${formatarMoeda(subtotal)}%0A`;
    });

    mensagem += `%0A?? *TOTAL A PAGAR:* ${formatarMoeda(total)}%0A`;
    mensagem += `%0A_Aguardo confirma��o e tempo de entrega._`;

    // 5. Envio (Redirecionamento)
    // Usa window.location.href para garantir abertura no Mobile
    const numeroDestino = "5527999999295"; // Seu n�mero
    const url = `https://wa.me/${numeroDestino}?text=${mensagem}`;

    window.location.href = url;
}
