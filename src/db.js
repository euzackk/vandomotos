// Importa as funções oficiais do Google Firebase (Nuvem)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Suas chaves exclusivas de acesso à Nuvem
const firebaseConfig = {
    apiKey: "AIzaSyAFfDCOVSwEstGvfdq49SzW-NtBHMFTRkU",
    authDomain: "vando-motos-erp.firebaseapp.com",
    projectId: "vando-motos-erp",
    storageBucket: "vando-motos-erp.firebasestorage.app",
    messagingSenderId: "874527230105",
    appId: "1:874527230105:web:36271fad80626da51f9008"
};

// Inicializa a conexão com o Google
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Estrutura do Banco de Dados (Mantida a mesma para não quebrar o sistema)
export const db = {
    clientes: [],
    veiculos: [],
    contratos: [],
    financeiro: [],
    rotinas: []
};

// Nova Função: Baixa os dados da Nuvem quando você abre o sistema
export async function loadDB() {
    try {
        const docRef = doc(firestore, "banco_principal", "dados_locadora");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            // Injeta os dados da nuvem direto na variável db
            Object.assign(db, docSnap.data());
            console.log("✅ Sincronizado com a Nuvem: Dados carregados.");
        } else {
            // Se for a primeira vez, cria a "gaveta" vazia no Google
            await setDoc(docRef, db);
            console.log("☁️ Banco de dados inicializado na Nuvem.");
        }
    } catch (error) {
        console.error("❌ Erro de conexão com a Nuvem:", error);
        alert("Aviso: Falha ao sincronizar com a Nuvem. Verifique a sua conexão de internet.");
    }
}

// Nova Função: Salva os dados na Nuvem a cada alteração
export async function saveDB() {
    try {
        const docRef = doc(firestore, "banco_principal", "dados_locadora");
        await setDoc(docRef, db);
        console.log("✅ Alteração salva na Nuvem em tempo real!");
    } catch (error) {
        console.error("❌ Erro ao salvar:", error);
        alert("Erro ao gravar os dados na nuvem. Tente novamente.");
    }
}

// Utilitários financeiros e de formatação globais
export const utils = {
    formatMoney: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0),
    formatDate: (isoDate) => {
        if (!isoDate) return '--';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    }
};
