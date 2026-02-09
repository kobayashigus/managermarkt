async function carregarDados() {
    try {
        console.log("Iniciando carregamento para torcedores...");
        const response = await fetch('./data/clubes.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const dados = await response.json();
        
        // Elementos da Interface
        const tabelaClubes = document.getElementById('tabela-corpo');
        const containerDirigentes = document.getElementById('cards-dirigentes');
        
        // Limpar conteúdos
        tabelaClubes.innerHTML = '';
        containerDirigentes.innerHTML = '';

        // Variáveis para os Cards de Resumo (Médias)
        let totalGastoPonto = 0;
        let totalGolsMilhao = 0;
        let totalReceita = 0;

        dados.forEach(item => {
            // --- CÁLCULOS ---
            const investimentoM = item.investimento / 1000000;
            const gastoPorPonto = (item.investimento / item.pontos_conquistados / 1000000).toFixed(2);
            const eficienciaGols = (item.gols_marcados / investimentoM).toFixed(2);
            
            // Somando para as médias
            totalGastoPonto += parseFloat(gastoPorPonto);
            totalGolsMilhao += parseFloat(eficienciaGols);
            totalReceita += item.receita_total;

            // --- 1. POPULAR ABA CLUBES (TABELA) ---
            tabelaClubes.innerHTML += `
                <tr class="hover:bg-gray-800 transition border-b border-gray-700">
                    <td class="px-6 py-4 font-bold text-white">${item.nome}</td>
                    <td class="px-6 py-4 text-gray-300">R$ ${(item.receita_total / 1000000).toFixed(0)}M</td>
                    <td class="px-6 py-4 text-center">
                        <span class="text-green-400 font-bold">${item.gols_marcados}</span> 
                        <span class="text-gray-500 mx-1">/</span> 
                        <span class="text-red-400">${item.gols_sofridos}</span>
                    </td>
                    <td class="px-6 py-4 font-semibold text-blue-300 italic">R$ ${gastoPorPonto}M</td>
                    <td class="px-6 py-4 font-semibold text-green-300">${eficienciaGols}</td>
                </tr>
            `;

            // --- 2. POPULAR ABA DIRIGENTES (CARDS) ---
            containerDirigentes.innerHTML += `
                <div class="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col items-center shadow-lg hover:border-blue-500 transition-all group">
                    <div class="relative">
                        <img src="${item.foto}" class="w-24 h-24 rounded-full border-4 border-gray-700 group-hover:border-blue-500 object-cover mb-4 transition-all">
                        <div class="absolute bottom-4 right-0 bg-blue-600 text-[10px] px-2 py-1 rounded-full font-bold">TOP</div>
                    </div>
                    <h4 class="text-xl font-bold text-white">${item.dirigente}</h4>
                    <p class="text-blue-400 text-xs mb-4 uppercase tracking-widest">${item.cargo}</p>
                    
                    <p class="text-gray-400 text-sm text-center mb-6 line-clamp-3 italic">"${item.bio}"</p>
                    
                    <div class="grid grid-cols-2 gap-2 w-full pt-4 border-t border-gray-700">
                        <div class="text-center">
                            <p class="text-[10px] text-gray-500 uppercase">Pontos</p>
                            <p class="text-lg font-bold">${item.pontos_conquistados}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-[10px] text-gray-500 uppercase">Investimento</p>
                            <p class="text-lg font-bold text-green-400">R$ ${investimentoM.toFixed(1)}M</p>
                        </div>
                    </div>
                    
                    <button onclick="verMais('${item.dirigente}', '${item.bio}')" class="mt-6 w-full py-2 bg-gray-700 hover:bg-blue-600 rounded-lg text-xs font-bold transition-colors">
                        PERFIL DETALHADO
                    </button>
                </div>
            `;
        });

        // --- 3. ATUALIZAR CARDS DE RESUMO (TOPO) ---
        const mediaGasto = (totalGastoPonto / dados.length).toFixed(2);
        const mediaGols = (totalGolsMilhao / dados.length).toFixed(2);
        const mediaGanhos = (totalReceita / dados.length / 1000000).toFixed(0);

        document.getElementById('resumo-gasto').innerText = `R$ ${mediaGasto}M`;
        document.getElementById('resumo-gols').innerText = mediaGols;
        document.getElementById('resumo-ganhos').innerText = `R$ ${mediaGanhos}M`;

    } catch (error) {
        console.error("Erro:", error);
    }
}

// Função para alternar abas
function switchTab(tabId) {
    const abaClubes = document.getElementById('aba-clubes');
    const abaDirigentes = document.getElementById('aba-dirigentes');
    const btnC = document.getElementById('btn-clubes');
    const btnD = document.getElementById('btn-dirigentes');

    if (tabId === 'aba-clubes') {
        abaClubes.classList.remove('hidden');
        abaDirigentes.classList.add('hidden');
        btnC.className = "py-2 px-6 text-blue-400 border-b-2 border-blue-400 font-bold transition-all";
        btnD.className = "py-2 px-6 text-gray-400 hover:text-white transition-all font-bold";
    } else {
        abaClubes.classList.add('hidden');
        abaDirigentes.classList.remove('hidden');
        btnD.className = "py-2 px-6 text-blue-400 border-b-2 border-blue-400 font-bold transition-all";
        btnC.className = "py-2 px-6 text-gray-400 hover:text-white transition-all font-bold";
    }
}

function verMais(nome, bio) {
    alert(`MANAGER PROFILE: ${nome}\n\nEstratégia: ${bio}`);
}

window.onload = carregarDados;