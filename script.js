// BANCO DE QUESTÕES ORGANIZADO POR LINGUAGEM
const QUESTION_DATABASE = {
    javascript: [
        {
            code: "let a = 10;\nlet b = 20;\nconsole.log(a + b);",
            options: ["10", "20", "30", "1020"],
            answer: 2,
            hint: "O operador + soma os dois valores numéricos."
        },
        {
            code: "let nome = 'Dev';\nconsole.log(nome + 'Mine');",
            options: ["Dev Mine", "DevMine", "Dev+Mine", "Erro"],
            answer: 1,
            hint: "Strings somadas são concatenadas (juntadas) sem espaços automáticos."
        }
    ],
    python: [
        {
            code: "a = 10\nb = 5\nprint(a // b)",
            options: ["2", "2.0", "5", "15"],
            answer: 0,
            hint: "Em Python, o operador // faz uma divisão inteira (descarta as casas decimais)."
        },
        {
            code: "lista = [1, 2, 3]\nprint(lista[-1])",
            options: ["1", "3", "Erro", "None"],
            answer: 1,
            hint: "Índices negativos em Python acessam os elementos de trás para frente. -1 é o último."
        }
    ],
    cpp: [
        {
            code: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int x = 5;\n  cout << ++x;\n  return 0;\n}",
            options: ["4", "5", "6", "Erro"],
            answer: 2,
            hint: "O operador ++x incrementa o valor antes de exibi-lo na tela."
        },
        {
            code: "int arr[3] = {10, 20, 30};\ncout << arr[1];",
            options: ["10", "20", "30", "Erro"],
            answer: 1,
            hint: "Vetores começam no índice 0. O índice 1 aponta para o segundo elemento."
        }
    ],
    c: [
        {
            code: "#include <stdio.h>\n\nint main() {\n  printf(\"%d\", 7 % 2);\n  return 0;\n}",
            options: ["3", "3.5", "1", "0"],
            answer: 2,
            hint: "O operador % calcula o resto da divisão. O resto de 7 dividido por 2 é 1."
        },
        {
            code: "int x = 10;\nif(x = 5) {\n  printf(\"Verdade\");\n}",
            options: ["Não exibe nada", "Verdade", "Erro de compilação", "0"],
            answer: 1,
            hint: "Cuidado! Um único '=' é atribuição. x recebe 5, que é considerado verdadeiro (não-zero)."
        }
    ]
};

const DevMineApp = (() => {
    let state = {
        user: "",
        score: 0,
        lives: 3,
        currentIdx: 0,
        activeQuestions: [],
        chosenLang: "javascript"
    };

    let modalCallback = null;

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const showModal = (title, message, icon = "🚀", callback = null) => {
        document.getElementById("modalTitle").textContent = title;
        document.getElementById("modalMessage").textContent = message;
        document.getElementById("modalIcon").textContent = icon;
        document.getElementById("customModal").classList.remove("hidden");
        modalCallback = callback;
    };

    const closeModal = () => {
        document.getElementById("customModal").classList.add("hidden");
        if (modalCallback) {
            modalCallback();
            modalCallback = null;
        }
    };

    const handleLogin = () => {
        const nameInput = document.getElementById("username");
        const name = nameInput.value.trim();
        
        if (!name) {
            showModal("Ops!", "Por favor, digite um codinome válido para acessar o terminal.", "⚠️");
            return;
        }
        
        state.user = name;
        localStorage.setItem("devmine_user", name);
        
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("appContainer").classList.remove("hidden");
        document.getElementById("displayUser").textContent = `Dev: ${name}`;
        renderRanking();
    };

    const switchTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(s => s.classList.add("hidden"));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove("active"));
        
        document.getElementById(`tab-${tabId}`).classList.remove("hidden");
        document.getElementById(`nav-${tabId}`).classList.add("active");
        
        if (tabId === 'ranking') renderRanking();
    };

    const handleLogout = () => {
        localStorage.removeItem("devmine_user");
        location.reload();
    };

    // INICIAR QUIZ ADAPTADO COM FILTRO DE LINGUAGEM
    const startQuiz = () => {
        const langSelect = document.getElementById("langSelect");
        state.chosenLang = langSelect.value; // Pega a linguagem escolhida no select

        state.score = 0; 
        state.lives = 3; 
        state.currentIdx = 0;
        
        // Carrega apenas as perguntas da linguagem selecionada
        const targetQuestions = QUESTION_DATABASE[state.chosenLang] || [];
        state.activeQuestions = shuffle([...targetQuestions]);
        
        // Altera o título do terminal para combinar com a linguagem escolhida
        const formatNames = { javascript: "JavaScript", python: "Python", cpp: "C++", c: "C Terminal" };
        document.getElementById("terminalTitle").textContent = `${formatNames[state.chosenLang]} Terminal`;

        document.getElementById("welcomeCard").classList.add("hidden");
        document.getElementById("quizStats").classList.remove("hidden");
        document.getElementById("quizDisplay").classList.remove("hidden");
        loadQuestion();
    };

    const loadQuestion = () => {
        if(state.activeQuestions.length === 0) {
            showModal("Erro", "Nenhuma questão cadastrada para esta linguagem.", "⚠️", resetGame);
            return;
        }

        const q = state.activeQuestions[state.currentIdx];
        document.getElementById("quizQuestionCode").textContent = q.code;
        document.getElementById("quizHint").classList.add("hidden");
        
        const container = document.getElementById("quizOptions");
        container.innerHTML = "";
        
        q.options.forEach((opt, idx) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(idx, btn);
            container.appendChild(btn);
        });
        updateUI();
    };

    const checkAnswer = (selectedIdx, clickedBtn) => {
        const currentQuestion = state.activeQuestions[state.currentIdx];
        const eagle = document.getElementById("eagle");
        
        document.querySelectorAll('.option-btn').forEach(b => b.style.pointerEvents = 'none');

        if (selectedIdx === currentQuestion.answer) {
            clickedBtn.classList.add("correct");
            state.score += 5;
            if (eagle) eagle.classList.add("eagle-flying");
        } else {
            clickedBtn.classList.add("wrong");
            state.lives--;
            
            const hintBox = document.getElementById("quizHint");
            hintBox.innerHTML = `<strong>❌ Incorreto!</strong> Dica: ${currentQuestion.hint}`;
            hintBox.classList.remove("hidden");
            
            if (eagle) {
                eagle.textContent = "😉";
                eagle.classList.add("eagle-winking");
            }
        }

        updateUI();

        setTimeout(() => {
            if (eagle) {
                eagle.classList.remove("eagle-flying", "eagle-winking");
                eagle.textContent = "🦅";
            }

            if (state.lives <= 0) {
                showModal("Fim de Jogo", `Vidas esgotadas! Você acumulou ${state.score} pontos treinando ${state.chosenLang.toUpperCase()}.`, "💀", finishGame);
            } else {
                state.currentIdx++;
                if (state.currentIdx >= state.activeQuestions.length) {
                    showModal("Vitória!", `Parabéns! Você completou os desafios de ${state.chosenLang.toUpperCase()} com ${state.score} pontos!`, "🏆", finishGame);
                } else {
                    loadQuestion();
                }
            }
        }, 1500);
    };

    const updateUI = () => {
        document.getElementById("quizScoreDisplay").textContent = state.score;
        document.getElementById("quizAttempts").textContent = "❤️".repeat(Math.max(0, state.lives));
        
        const maxScore = state.activeQuestions.length * 5;
        const percentage = maxScore > 0 ? (state.score / maxScore * 100) : 0;
        document.getElementById("progressBar").style.width = `${percentage}%`;
    };

    const finishGame = () => {
        let rank = JSON.parse(localStorage.getItem("devmine_rank") || "[]");
        
        // Salva também o nome da linguagem no ranking para ficar informativo
        rank.push({ 
            name: `${state.user} (${state.chosenLang.toUpperCase()})`, 
            score: state.score, 
            date: new Date().toLocaleDateString() 
        });
        
        rank.sort((a, b) => b.score - a.score);
        localStorage.setItem("devmine_rank", JSON.stringify(rank.slice(0, 5)));
        
        resetGame();
    };

    const resetGame = () => {
        document.getElementById("welcomeCard").classList.remove("hidden");
        document.getElementById("quizStats").classList.add("hidden");
        document.getElementById("quizDisplay").classList.add("hidden");
        switchTab('lab');
    };

    const renderRanking = () => {
        const rank = JSON.parse(localStorage.getItem("devmine_rank") || "[]");
        const body = document.getElementById("rankingBody");
        
        if (rank.length === 0) {
            body.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Nenhum registro no ranking ainda.</td></tr>`;
            return;
        }

        body.innerHTML = rank.map((r, i) => `
            <tr>
                <td><span class="rank-badge rank-${i+1}">#${i+1}</span></td>
                <td class="font-bold">${r.name}</td>
                <td class="text-accent font-bold">${r.score} pts</td>
            </tr>
        `).join("");
    };

    const limparRanking = () => {
        if (confirm("Deseja realmente limpar o ranking permanentemente?")) {
            localStorage.removeItem("devmine_rank");
            renderRanking();
        }
    };

    const init = () => {
        const saved = localStorage.getItem("devmine_user");
        if (saved) {
            document.getElementById("username").value = saved;
            handleLogin();
        }
    };

    return {
        init,
        handleLogin,
        handleLogout,
        switchTab,
        startQuiz,
        closeModal,
        limparRanking
    };
})();

window.onload = DevMineApp.init;