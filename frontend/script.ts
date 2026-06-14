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

// 1. GERENCIAMENTO DE SESSÃO E PERFIL
function verificarEstadoLogin(): void {
    const usuarioId = sessionStorage.getItem('usuarioId');
    const usuarioNome = sessionStorage.getItem('usuarioNome');
    const usuarioSobrenome = sessionStorage.getItem('usuarioSobrenome'); // ADICIONADO
    const usuarioEmail = sessionStorage.getItem('usuarioEmail');
    
    const navbarLoginBtn = document.getElementById('navbarLoginBtn') as HTMLElement;
    const comentarioForm = document.getElementById('comentarioForm') as HTMLFormElement;
    const comentarioLoginMsg = document.getElementById('comentarioLoginMsg') as HTMLElement;

    const secaoFormulario = document.getElementById('formulario');
    const linksInscricao = document.querySelectorAll('a[href="#formulario"]');

    if (usuarioId && usuarioNome) {
        if (navbarLoginBtn) {
            navbarLoginBtn.innerHTML = `<i class="fas fa-user-cog"></i> Olá, ${usuarioNome} (Perfil)`;
            
            if (navbarLoginBtn.classList.contains('btn-primary')) {
                navbarLoginBtn.classList.replace('btn-primary', 'btn-success');
            }
            
            navbarLoginBtn.setAttribute('data-bs-toggle', 'modal');
            navbarLoginBtn.setAttribute('data-bs-target', '#perfilUsuarioModal');
            navbarLoginBtn.onclick = null; 
        }

        // Preenche os 3 dados no modal do Perfil para o usuário
        const inputNome = document.getElementById('perfilNome') as HTMLInputElement;
        const inputSobrenome = document.getElementById('perfilSobrenome') as HTMLInputElement; // ADICIONADO
        const inputEmail = document.getElementById('perfilEmail') as HTMLInputElement;
        
        if (inputNome) inputNome.value = usuarioNome;
        if (inputSobrenome) inputSobrenome.value = usuarioSobrenome || ''; // ADICIONADO
        if (inputEmail) inputEmail.value = usuarioEmail || '';

        if (comentarioForm && comentarioLoginMsg) {
            comentarioForm.style.display = 'block';
            comentarioLoginMsg.style.display = 'none';
        }

        if (secaoFormulario) secaoFormulario.style.display = 'none';
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

// FUNÇÕES DO PAINEL DA CONTA (Sair, Salvar e Excluir)
(window as any).sairDaConta = () => {
    sessionStorage.clear();
    window.location.reload();
};

(window as any).salvarAlteracoesPerfil = async () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) return;

    const nomeInput = document.getElementById('perfilNome') as HTMLInputElement;
    const sobrenomeInput = document.getElementById('perfilSobrenome') as HTMLInputElement;
    const emailInput = document.getElementById('perfilEmail') as HTMLInputElement;
    const feedback = document.getElementById('perfilFeedback') as HTMLElement;

    // Pega o que o usuário digitou
    const nome = nomeInput.value.trim();
    const sobrenome = sobrenomeInput.value.trim();
    const email = emailInput.value.trim();

    const dadosParaAtualizar: any = {};
    let temErro = false;
    let mensagemErro = '';

    // LÓGICA DE VALIDAÇÃO INDIVIDUALIZADA
    if (nome !== "") {
        if (nome.length < 2) { temErro = true; mensagemErro = 'O nome precisa ter pelo menos 2 letras.'; }
        else { dadosParaAtualizar.nome = nome; }
    }
    if (sobrenome !== "" && !temErro) {
        if (sobrenome.length < 2) { temErro = true; mensagemErro = 'O sobrenome precisa ter pelo menos 2 letras.'; }
        else { dadosParaAtualizar.sobrenome = sobrenome; }
    }
    if (email !== "" && !temErro) {
        if (!validarEmail(email)) { temErro = true; mensagemErro = 'Informe um e-mail válido com @.'; }
        else { dadosParaAtualizar.email = email; }
    }

    // Se cometeu erro de digitação
    if (temErro) {
        feedback.className = 'alert alert-danger small mt-2';
        feedback.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagemErro}`;
        feedback.style.display = 'block';
        return;
    }

    // Se o usuário apagou tudo e não enviou nada novo
    if (Object.keys(dadosParaAtualizar).length === 0) {
        feedback.className = 'alert alert-warning small mt-2';
        feedback.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Preencha pelo menos um campo para alterar.';
        feedback.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`/usuario/atualizar/${usuarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaAtualizar)
        });

        const data = await response.json();

        if (response.ok) {
            if (data.nome) sessionStorage.setItem('usuarioNome', data.nome);
            if (data.sobrenome) sessionStorage.setItem('usuarioSobrenome', data.sobrenome);
            if (data.email) sessionStorage.setItem('usuarioEmail', data.email);
            
            feedback.className = 'alert alert-success small mt-2';
            feedback.innerHTML = '<i class="fas fa-check-circle"></i> ' + data.message;
            feedback.style.display = 'block';
            
            verificarEstadoLogin(); 
            carregarComentarios();  
            
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('perfilUsuarioModal'));
                modal?.hide();
                feedback.style.display = 'none';
            }, 1500);
        } else {
            feedback.className = 'alert alert-danger small mt-2';
            feedback.innerHTML = '<i class="fas fa-times-circle"></i> ' + data.error;
            feedback.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
    }
};

(window as any).deletarMinhaConta = () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) return;

    // 1. Esconde o modal de perfil atual
    const perfilModalElement = document.getElementById('perfilUsuarioModal');
    if (perfilModalElement) {
        const perfilModal = bootstrap.Modal.getInstance(perfilModalElement);
        if (perfilModal) perfilModal.hide();
    }

    // 2. Abre o modal estilizado de confirmação
    const modalElement = document.getElementById('excluirContaModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// Conecta com o servidor e apaga quando o botão "Sim, Excluir" é clicado
(window as any).confirmarExclusaoConta = async () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) return;

    const feedback = document.getElementById('excluirContaFeedback') as HTMLElement;

    try {
        const response = await fetch(`/usuario/deletar/${usuarioId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Esconde o modal de confirmação
            const confirmModalElement = document.getElementById('excluirContaModal');
            if (confirmModalElement) {
                const confirmModal = bootstrap.Modal.getInstance(confirmModalElement);
                if (confirmModal) confirmModal.hide();
            }

            // Mostra o modal de sucesso (Despedida)
            const successModalElement = document.getElementById('sucessoExcluirContaModal');
            if (successModalElement) {
                const successModal = new bootstrap.Modal(successModalElement);
                successModal.show();
            }
        } else {
            const data = await response.json();
            if (feedback) {
                feedback.className = 'alert alert-danger small mt-2';
                feedback.innerHTML = `<i class="fas fa-times-circle"></i> Erro ao excluir conta: ${data.error}`;
                feedback.style.display = 'block';
            }
        }
    } catch (error) {
        console.error("Erro ao excluir conta:", error);
    }
};

// Recarrega a página após o usuário clicar em "OK" na despedida
(window as any).finalizarExclusaoConta = () => {
    sessionStorage.clear();
    window.location.reload();
};

// 2. SISTEMA DE COMENTÁRIOS
async function carregarComentarios(): Promise<void> {
    const listaContainer = document.getElementById('listaComentarios');
    if (!listaContainer) return;

    const usuarioIdAtual = sessionStorage.getItem('usuarioId');

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

            // ESTILIZAÇÃO: Botões de ação arredondados e alinhados à direita
            let botoesAcao = '';
            if (usuarioIdAtual && String(coment.usuarioId) === String(usuarioIdAtual)) {
                const textoEscapado = coment.texto.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "\\n");
                
                botoesAcao = `
                    <div class="mt-3 pt-3 border-top border-light d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" onclick="abrirModalEditarComentario(${coment.id}, '${textoEscapado}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-sm" onclick="deletarMeuComentario(${coment.id})">
                            <i class="fas fa-trash-alt"></i> Excluir
                        </button>
                    </div>
                `;
            }

            const comentarioHTML = `
                <div class="comment-card shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="comment-author"><i class="fas fa-user-circle"></i> ${nomeAutor}</span>
                        <span class="comment-date small">${dataFormatada}</span>
                    </div>
                    <div class="comment-meta mb-2">
                        <span class="badge bg-success me-1"><i class="fas fa-coffee"></i> ${coment.tipoCafe}</span>
                        <span class="badge bg-secondary"><i class="fas fa-mug-hot"></i> ${coment.metodoPreparo}</span>
                    </div>
                    <p class="comment-text mb-0">${coment.texto}</p>
                    ${botoesAcao}
                </div>
            `;
            listaContainer.innerHTML += comentarioHTML;
        });
    } catch (error) {
        listaContainer.innerHTML = '<div class="alert alert-danger text-center">Erro ao carregar os comentários.</div>';
    }
}

// FUNÇÕES DE AÇÃO DO USUÁRIO
(window as any).abrirModalEditarComentario = (id: number, textoAtual: string) => {
    const idInput = document.getElementById('editComentarioId') as HTMLInputElement;
    const textoInput = document.getElementById('editComentarioTexto') as HTMLTextAreaElement;
    const feedback = document.getElementById('editComentarioFeedback') as HTMLElement;

    if (idInput && textoInput) {
        // Preenche os dados no Modal
        idInput.value = id.toString();
        textoInput.value = textoAtual.replace(/\\n/g, '\n'); 
        
        // Limpa erros antigos se houver
        textoInput.classList.remove('is-invalid');
        if (feedback) feedback.style.display = 'none';

        // Abre o Modal graciosamente
        const modalElement = document.getElementById('editarComentarioModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }
};

(window as any).salvarEdicaoComentario = async () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) return;

    const idInput = document.getElementById('editComentarioId') as HTMLInputElement;
    const textoInput = document.getElementById('editComentarioTexto') as HTMLTextAreaElement;
    const feedback = document.getElementById('editComentarioFeedback') as HTMLElement;
    
    const id = idInput.value;
    const novoTexto = textoInput.value.trim();

    // VALIDAÇÃO VISUAL (Sem alert)
    if (novoTexto.length < 5) {
        textoInput.classList.add('is-invalid');
        feedback.className = 'text-danger fw-bold mt-1';
        feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> O comentário deve ter pelo menos 5 caracteres.';
        feedback.style.display = 'block';
        return;
    } else {
        textoInput.classList.remove('is-invalid');
        feedback.style.display = 'none';
    }

    try {
        const response = await fetch(`/comentario/editar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: novoTexto, usuarioId })
        });

        const data = await response.json();

        if (response.ok) {
            // Fecha o modal após sucesso
            const modalElement = document.getElementById('editarComentarioModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            carregarComentarios(); // Recarrega a tela instantaneamente
        } else {
            // Mostra erro do servidor visualmente
            textoInput.classList.add('is-invalid');
            feedback.className = 'text-danger fw-bold mt-1';
            feedback.innerHTML = `<i class="fas fa-times-circle"></i> ${data.error}`;
            feedback.style.display = 'block';
        }
    } catch (error) {
        console.error("Erro ao editar o comentário:", error);
    }
};

// FUNÇÃO MODIFICADA: Apenas abre o modal e guarda o ID
(window as any).deletarMeuComentario = (id: number) => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) return;

    // Guarda o ID do comentário no input invisível do modal
    const idInput = document.getElementById('deleteComentarioId') as HTMLInputElement;
    if (idInput) {
        idInput.value = id.toString();
        
        // Abre o Modal graciosamente
        const modalElement = document.getElementById('excluirComentarioModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }
};

(window as any).confirmarExclusaoComentario = async () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    const idInput = document.getElementById('deleteComentarioId') as HTMLInputElement;
    
    if (!usuarioId || !idInput) return;

    const id = idInput.value;

    try {
        const response = await fetch(`/comentario/deletar/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId })
        });

        if (response.ok) {
            // Esconde o modal automaticamente
            const modalElement = document.getElementById('excluirComentarioModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            carregarComentarios(); // Recarrega a tela instantaneamente
        } else {
            const data = await response.json();
            alert("Erro ao excluir: " + data.error);
        }
    } catch (error) {
        console.error("Erro ao excluir o comentário:", error);
    }
};

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
            sessionStorage.setItem('usuarioSobrenome', data.sobrenome); // ADICIONADO AQUI
            sessionStorage.setItem('usuarioEmail', data.email); 
            
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