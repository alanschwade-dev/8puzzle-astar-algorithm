const estadoObjetivo = "123456780";

// Mapeamento dos vizinhos: Regras de transição respeitando as bordas [cite: 103]
const movimentosValidos = {
    0: [1, 3],
    1: [0, 2, 4],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4, 8],
    6: [3, 7],
    7: [4, 6, 8],
    8: [5, 7]
};

// Função para calcular a Heurística h(n) - Distância de Manhattan [cite: 312, 408]
function calcularManhattan(estado) {
    const objetivoPos = {
        '1': [0, 0], '2': [0, 1], '3': [0, 2],
        '4': [1, 0], '5': [1, 1], '6': [1, 2],
        '7': [2, 0], '8': [2, 1], '0': [2, 2]
    };
    let distanciaTotal = 0;

    for (let i = 0; i < 9; i++) {
        let num = estado[i];
        if (num !== '0') {
            // Posição atual no grid 3x3
            let atualX = Math.floor(i / 3);
            let atualY = i % 3;
            // Posição onde a peça deveria estar
            let [objX, objY] = objetivoPos[num];
            // Soma das distâncias horizontais e verticais [cite: 408]
            distanciaTotal += Math.abs(atualX - objX) + Math.abs(atualY - objY);
        }
    }
    return distanciaTotal;
}

// Função principal disparada pelo botão
function iniciarBusca() {
    const input = document.getElementById('initialState').value;
    
    if (input.length !== 9 || !/^[0-8]+$/.test(input)) {
        alert("Por favor, insira exatamente 9 números de 0 a 8.");
        return;
    }

    desenharTabuleiro(input);
    resolverAStar(input);
}

// Algoritmo A* (Busca pela melhor escolha) [cite: 904-906]
function resolverAStar(estadoInicial) {
    // A estrutura armazena g(n), h(n) e f(n) = g(n) + h(n) [cite: 340, 906]
    let fila = [{ 
        estado: estadoInicial, 
        caminho: [], 
        posicaoZero: estadoInicial.indexOf('0'),
        g: 0, // Custo do nó inicial até n [cite: 907]
        h: calcularManhattan(estadoInicial), // Estimativa de custo até a meta [cite: 908]
        f: calcularManhattan(estadoInicial) // f(n) = g(n) + h(n)
    }];
    
    // Conjunto CLOSED para evitar repetições e loops [cite: 1626, 1651]
    let visitados = new Set();
    visitados.add(estadoInicial);

    let estadosTestados = 0;

    while (fila.length > 0) {
        // Simulação de Fila de Prioridade: escolhe o menor f(n) [cite: 1631, 1636]
        fila.sort((a, b) => a.f - b.f);
        
        let atual = fila.shift();
        estadosTestados++;

        // Checa se o estado n é o objetivo [cite: 1649]
        if (atual.estado === estadoObjetivo) {
            exibirResultados(atual.caminho, estadosTestados);
            return;
        }

        let movimentosPossiveis = movimentosValidos[atual.posicaoZero];

        for (let proximaPosicao of movimentosPossiveis) {
            // Gera sucessores trocando o 0 com o vizinho [cite: 1653, 1657]
            let novoEstado = trocarCaracteres(atual.estado, atual.posicaoZero, proximaPosicao);

            if (!visitados.has(novoEstado)) {
                visitados.add(novoEstado);
                
                let numeroMovido = atual.estado[proximaPosicao];
                let novoG = atual.g + 1; // custo g(n) acumulado
                let novoH = calcularManhattan(novoEstado); // custo h(n) estimado

                // Insere sucessor na lista OPEN com prioridade f(n) [cite: 1661]
                fila.push({
                    estado: novoEstado,
                    caminho: [...atual.caminho, numeroMovido],
                    posicaoZero: proximaPosicao,
                    g: novoG,
                    h: novoH,
                    f: novoG + novoH // Equação f(n) = g(n) + h(n) [cite: 340]
                });
            }
        }
    }

    alert("Solução não encontrada!");
}

// --- Funções Auxiliares (DOM e Manipulação de String) ---

function trocarCaracteres(str, i, j) {
    let arrayDeChars = str.split('');
    let temp = arrayDeChars[i];
    arrayDeChars[i] = arrayDeChars[j];
    arrayDeChars[j] = temp;
    return arrayDeChars.join('');
}

function exibirResultados(caminho, totalTestados) {
    document.getElementById('path').innerText = caminho.length > 0 ? caminho.join(' -> ') : "Já resolvido!";
    document.getElementById('moves').innerText = caminho.length;
    document.getElementById('testedStates').innerText = totalTestados;
}

function desenharTabuleiro(estado) {
    const board = document.getElementById('board');
    board.innerHTML = ''; 

    for (let i = 0; i < 9; i++) {
        let numero = estado[i];
        let tile = document.createElement('div'); // Manipulação de DOM [cite: 208]
        tile.classList.add('tile');
        
        if (numero === '0') {
            tile.classList.add('empty');
            tile.innerText = '';
        } else {
            tile.innerText = numero;
        }
        board.appendChild(tile);
    }
}