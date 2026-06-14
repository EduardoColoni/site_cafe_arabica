declare var bootstrap: any;

// ============================================
// VALIDAÇÕES E UTILITÁRIOS
// ============================================

function gerenciarEstadoValidacao(inputElement: HTMLInputElement, isValid: boolean): void {
    if (inputElement.value.trim().length === 0) {
        inputElement.classList.remove('is-invalid', 'is-valid');
        return;
    }
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    }
}

function validarNomeTempoReal(): void {
    const input = document.getElementById('nome') as HTMLInputElement;
    gerenciarEstadoValidacao(input, input.value.trim().length >= 2);
}

function validarSobrenomeTempoReal(): void {
    const input = document.getElementById('sobrenome') as HTMLInputElement;
    gerenciarEstadoValidacao(input, input.value.trim().length >= 2);
}

function validarEmailTempoReal(): void {
    const input = document.getElementById('email') as HTMLInputElement;
    gerenciarEstadoValidacao(input, validarEmail(input.value.trim()));
}

function validarTelefoneTempoReal(): void {
    const input = document.getElementById('telefone') as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    gerenciarEstadoValidacao(input, digits.length >= 10 && digits.length <= 11);
}

function validarCPF(cpf: string): boolean {
    let digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;

    let allEqual = true;
    for (let j = 1; j < 11; j++) {
        if (digits[j] !== digits[0]) {
            allEqual = false;
            break;
        }
    }
    if (allEqual) return false;

    let sum1 = 0;
    for (let j = 0; j < 9; j++) {
        sum1 += (digits.charCodeAt(j) - 48) * (j + 1);
    }
    let b1 = sum1 % 11;
    if (b1 === 10) b1 = 0;

    let sum2 = 0;
    for (let j = 0; j < 9; j++) {
        sum2 += (digits.charCodeAt(j) - 48) * (9 - j);
    }
    let b2 = sum2 % 11;
    if (b2 === 10) b2 = 0;

    let d10 = digits.charCodeAt(9) - 48;
    let d11 = digits.charCodeAt(10) - 48;

    return (b1 === d10 && b2 === d11);
}

function validarRequisitosSenh(): boolean {
    const senhaInput = document.getElementById('senha') as HTMLInputElement;
    const senha = senhaInput.value;

    const requisitos: Record<string, boolean> = {
        'req-length': senha.length >= 8,
        'req-uppercase': /[A-Z]/.test(senha),
        'req-number': /[0-9]/.test(senha),
        'req-special': /[!@#$%^&*]/.test(senha)
    };

    for (const [id, isValid] of Object.entries(requisitos)) {
        const elemento = document.getElementById(id) as HTMLElement;
        const icon = elemento.querySelector('i') as HTMLElement;
        
        if (isValid) {
            elemento.classList.add('valid');
            elemento.classList.remove('invalid');
            icon.classList.remove('fa-times', 'text-danger');
            icon.classList.add('fa-check', 'text-success');
        } else {
            elemento.classList.add('invalid');
            elemento.classList.remove('valid');
            icon.classList.remove('fa-check', 'text-success');
            icon.classList.add('fa-times', 'text-danger');
        }
    }

    const todosAtendidos = Object.values(requisitos).every((req: boolean) => req === true);
    gerenciarEstadoValidacao(senhaInput, todosAtendidos);
    return todosAtendidos;
}

function validarCPFEmTempoReal(): void {
    const cpfInput = document.getElementById('cpf') as HTMLInputElement;
    const cpfFeedback = document.getElementById('cpfFeedback') as HTMLElement;
    const cpf = cpfInput.value;

    if (cpf.length === 0) {
        cpfFeedback.innerHTML = '';
        cpfInput.classList.remove('is-invalid', 'is-valid');
        return;
    }

    if (validarCPF(cpf)) {
        cpfFeedback.innerHTML = '<i class="fas fa-check-circle text-success"></i> CPF válido';
        cpfFeedback.style.color = '#28a745';
        cpfInput.classList.remove('is-invalid');
        cpfInput.classList.add('is-valid');
    } else {
        cpfFeedback.innerHTML = '<i class="fas fa-times-circle text-danger"></i> CPF inválido';
        cpfFeedback.style.color = '#dc3545';
        cpfInput.classList.remove('is-valid');
        cpfInput.classList.add('is-invalid');
    }
}

// ============================================
// MÁSCARAS DE FORMATAÇÃO
// ============================================

function formatarTelefone(telefone: string): string {
    let digits = telefone.replace(/\D/g, '');
    digits = digits.substring(0, 11);
    
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
}

function formatarCPF(cpf: string): string {
    let digits = cpf.replace(/\D/g, '');
    digits = digits.substring(0, 11);
    
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`;
}

function validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ============================================
// LÓGICA DE NEGÓCIO E INTEGRAÇÃO API
// ============================================

// 1. GERENCIAMENTO DE SESSÃO
function verificarEstadoLogin(): void {
    const usuarioId = sessionStorage.getItem('usuarioId');
    const usuarioNome = sessionStorage.getItem('usuarioNome');
    
    const navbarLoginBtn = document.getElementById('navbarLoginBtn') as HTMLElement;
    const comentarioForm = document.getElementById('comentarioForm') as HTMLFormElement;
    const comentarioLoginMsg = document.getElementById('comentarioLoginMsg') as HTMLElement;

    // Elementos de inscrição devem sumir
    const secaoFormulario = document.getElementById('formulario');
    const linksInscricao = document.querySelectorAll('a[href="#formulario"]');

    if (usuarioId && usuarioNome) {
        // Usuário está Logado
        if (navbarLoginBtn) {
            navbarLoginBtn.innerHTML = `<i class="fas fa-user-check"></i> Olá, ${usuarioNome} (Sair)`;
            
            if (navbarLoginBtn.classList.contains('btn-primary')) {
                navbarLoginBtn.classList.replace('btn-primary', 'btn-success');
            }
            
            navbarLoginBtn.removeAttribute('data-bs-toggle');
            navbarLoginBtn.removeAttribute('data-bs-target');
            navbarLoginBtn.onclick = () => {
                sessionStorage.clear();
                window.location.reload(); // Atualiza a página ao sair e traz os botões de volta
            };
        }
        if (comentarioForm && comentarioLoginMsg) {
            comentarioForm.style.display = 'block';
            comentarioLoginMsg.style.display = 'none';
        }

        // Oculta a área de inscrição e todos os botões/links que levam a ela
        if (secaoFormulario) {
            secaoFormulario.style.display = 'none';
        }
        linksInscricao.forEach(link => {
            const parentLi = link.closest('li');
            if (parentLi) {
                parentLi.style.display = 'none';
            } else {
                (link as HTMLElement).style.display = 'none';
            }
        });
    }
}

// 2. SISTEMA DE COMENTÁRIOS
async function carregarComentarios(): Promise<void> {
    const listaContainer = document.getElementById('listaComentarios');
    if (!listaContainer) return;

    try {
        const response = await fetch('/comentario/lista');
        const comentarios = await response.json();

        listaContainer.innerHTML = '';

        if (comentarios.length === 0) {
            listaContainer.innerHTML = '<div class="alert alert-info text-center">Nenhum comentário ainda. Seja o primeiro a avaliar!</div>';
            return;
        }

        comentarios.forEach((coment: any) => {
            const dataFormatada = new Date(coment.createdAt).toLocaleDateString('pt-BR');
            const nomeAutor = coment.autor ? `${coment.autor.nome} ${coment.autor.sobrenome}` : 'Usuário Anônimo';

            const comentarioHTML = `
                <div class="comment-card shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="comment-author"><i class="fas fa-user-circle"></i> ${nomeAutor}</span>
                        <span class="comment-date text-muted small">${dataFormatada}</span>
                    </div>
                    <div class="comment-meta mb-2">
                        <span class="badge bg-success me-1"><i class="fas fa-coffee"></i> ${coment.tipoCafe}</span>
                        <span class="badge bg-secondary"><i class="fas fa-mug-hot"></i> ${coment.metodoPreparo}</span>
                    </div>
                    <p class="comment-text mb-0">${coment.texto}</p>
                </div>
            `;
            listaContainer.innerHTML += comentarioHTML;
        });
    } catch (error) {
        listaContainer.innerHTML = '<div class="alert alert-danger text-center">Erro ao carregar os comentários.</div>';
    }
}

async function enviarComentario(event: Event): Promise<void> {
    event.preventDefault();

    const usuarioId = sessionStorage.getItem('usuarioId');
    const tipoCafe = (document.getElementById('tipoCafe') as HTMLSelectElement).value;
    const metodoPreparo = (document.getElementById('metodoPreparo') as HTMLSelectElement).value;
    const texto = (document.getElementById('textoComentario') as HTMLTextAreaElement).value.trim();
    const feedback = document.getElementById('comentarioFeedback') as HTMLElement;

    // Fail Fast Frontend
    if (!usuarioId) {
        alert("Sua sessão expirou. Faça login novamente.");
        return;
    }
    if (!tipoCafe || !metodoPreparo) {
        feedback.className = 'alert alert-warning small mt-3';
        feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Selecione o tipo de café e o preparo.';
        feedback.style.display = 'block';
        return;
    }
    if (texto.length < 5) {
        feedback.className = 'alert alert-warning small mt-3';
        feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Escreva pelo menos 5 caracteres no comentário.';
        feedback.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/comentario/novo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId, tipoCafe, metodoPreparo, texto })
        });

        const data = await response.json();

        if (response.ok) {
            (document.getElementById('comentarioForm') as HTMLFormElement).reset();
            feedback.className = 'alert alert-success small mt-3';
            feedback.innerHTML = '<i class="fas fa-check-circle"></i> ' + data.message;
            feedback.style.display = 'block';
            
            carregarComentarios();

            setTimeout(() => { feedback.style.display = 'none'; }, 3000);
        } else {
            feedback.className = 'alert alert-danger small mt-3';
            feedback.innerHTML = '<i class="fas fa-times-circle"></i> ' + data.error;
            feedback.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro ao publicar:", error);
    }
}

// 3. INSCRIÇÃO E LOGIN
async function validarFormularioInscricao(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = document.getElementById('inscricaoForm') as HTMLFormElement;
    const nome = (document.getElementById('nome') as HTMLInputElement).value.trim();
    const sobrenome = (document.getElementById('sobrenome') as HTMLInputElement).value.trim();
    const telefone = (document.getElementById('telefone') as HTMLInputElement).value.trim();
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const cpf = (document.getElementById('cpf') as HTMLInputElement).value.trim();
    const senha = (document.getElementById('senha') as HTMLInputElement).value;
    
    // 1. Verifica se os campos estão vazios
    if (!nome || !sobrenome || !telefone || !email || !cpf || !senha) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    // 2. Verifica se o CPF é realmente válido
    if (!validarCPF(cpf)) {
        alert("O CPF informado é inválido. Verifique os números.");
        const cpfInput = document.getElementById('cpf') as HTMLInputElement;
        cpfInput.focus();
        return;
    }

    // 3. Verifica se a senha passou em todos os requisitos
    if (!validarRequisitosSenh()) {
        alert("A senha deve atender a todos os requisitos de segurança listados abaixo.");
        const senhaInput = document.getElementById('senha') as HTMLInputElement;
        senhaInput.focus();
        return;
    }
    
    try {
        const response = await fetch('/usuario/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, sobrenome, telefone, email, cpf, senha })
        });

        const data = await response.json();

        const successMessage = document.getElementById('successMessage') as HTMLElement;
        
        if (response.ok) {
            successMessage.className = 'alert alert-success mb-4';
            successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            form.reset();
            form.classList.remove('was-validated');
            
            document.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
            (document.getElementById('cpfFeedback') as HTMLElement).innerHTML = '';
            
            // Reseta a caixinha de requisitos da senha visualmente
            document.querySelectorAll('.requirement').forEach(req => {
                req.classList.remove('valid');
                req.classList.add('invalid');
                const icon = req.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-check', 'text-success');
                    icon.classList.add('fa-times', 'text-danger');
                }
            });
            
            setTimeout(() => { successMessage.style.display = 'none'; }, 5000);
        } else {
            successMessage.className = 'alert alert-danger mb-4';
            successMessage.innerHTML = `<i class="fas fa-times-circle"></i> ${data.error}`;
            successMessage.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
    }
}

async function realizarLogin(): Promise<void> {
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value.trim();
    const senha = (document.getElementById('loginSenha') as HTMLInputElement).value;
    const loginMessage = document.getElementById('loginMessage') as HTMLElement;
    
    if (!email || !senha) {
        loginMessage.className = 'alert alert-warning';
        loginMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Preencha e-mail e senha.';
        loginMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/usuario/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('usuarioId', data.id);
            sessionStorage.setItem('usuarioNome', data.nome);
            
            loginMessage.className = 'alert alert-success';
            loginMessage.innerHTML = `<i class="fas fa-check-circle"></i> Bem-vindo, ${data.nome}!`;
            loginMessage.style.display = 'block';
            
            verificarEstadoLogin();

            setTimeout(() => {
                const modalElement = document.getElementById('loginModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    modal?.hide();
                }
                (document.getElementById('loginEmail') as HTMLInputElement).value = '';
                (document.getElementById('loginSenha') as HTMLInputElement).value = '';
                loginMessage.style.display = 'none';
            }, 1500);
        } else {
            loginMessage.className = 'alert alert-danger';
            loginMessage.innerHTML = `<i class="fas fa-times-circle"></i> ${data.error}`;
            loginMessage.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
    }
}

// ============================================
// INICIALIZAÇÃO E EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoLogin();
    carregarComentarios();

    // Listener de Comentários
    const comentarioForm = document.getElementById('comentarioForm');
    if (comentarioForm) {
        comentarioForm.addEventListener('submit', enviarComentario);
    }

    const toggleSenhaBtn = document.getElementById('toggleSenha');
    const senhaInputToggle = document.getElementById('senha');
    
    if (toggleSenhaBtn && senhaInputToggle) {
        toggleSenhaBtn.addEventListener('click', function(this: HTMLElement) {
            const type = senhaInputToggle.getAttribute('type') === 'password' ? 'text' : 'password';
            senhaInputToggle.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    const toggleLoginSenhaBtn = document.getElementById('toggleLoginSenha');
    const loginSenhaInputToggle = document.getElementById('loginSenha');
    
    if (toggleLoginSenhaBtn && loginSenhaInputToggle) {
        toggleLoginSenhaBtn.addEventListener('click', function(this: HTMLElement) {
            const type = loginSenhaInputToggle.getAttribute('type') === 'password' ? 'text' : 'password';
            loginSenhaInputToggle.setAttribute('type', type);
            const icon = this.querySelector('i');
            if(icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    const inscricaoForm = document.getElementById('inscricaoForm');
    if (inscricaoForm) {
        inscricaoForm.addEventListener('submit', validarFormularioInscricao);
    }
    
    const nomeInput = document.getElementById('nome');
    if (nomeInput) nomeInput.addEventListener('input', validarNomeTempoReal);
    
    const sobrenomeInput = document.getElementById('sobrenome');
    if (sobrenomeInput) sobrenomeInput.addEventListener('input', validarSobrenomeTempoReal);
    
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.addEventListener('input', validarEmailTempoReal);

    const senhaInput = document.getElementById('senha');
    if (senhaInput) {
        senhaInput.addEventListener('input', validarRequisitosSenh);
    }
    
    const cpfInput = document.getElementById('cpf') as HTMLInputElement;
    if (cpfInput) {
        cpfInput.addEventListener('input', function(this: HTMLInputElement) {
            this.value = formatarCPF(this.value);
            validarCPFEmTempoReal();
        });
    }
    
    const telefoneInput = document.getElementById('telefone') as HTMLInputElement;
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(this: HTMLInputElement) {
            this.value = formatarTelefone(this.value);
            validarTelefoneTempoReal(); 
        });
    }
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', realizarLogin);
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                realizarLogin();
            }
        });
    }
});

// ============================================
// PERFORMANCE E ACESSIBILIDADE
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(this: HTMLAnchorElement, e: Event) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href) as HTMLElement;
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                if(img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}