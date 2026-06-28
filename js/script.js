const API_URL = "http://127.0.0.1:5000/hqs";

const form = document.getElementById("hq-form");
const hqIdInput = document.getElementById("hq-id");
const tituloInput = document.getElementById("titulo");
const autorInput = document.getElementById("autor");
const editoraInput = document.getElementById("editora");
const generoInput = document.getElementById("genero");
const volumeInput = document.getElementById("volume");
const notaInput = document.getElementById("nota");
const imagemInput = document.getElementById("imagem");
const statusInput = document.getElementById("status");

const hqsList = document.getElementById("hqs-list");
const message = document.getElementById("message");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const filterStatus = document.getElementById("filter-status");

async function listarHqs() {
    try {
        const response = await fetch(`${API_URL}/`);
        const hqs = await response.json();

        if (!response.ok) {
            mostrarMensagem("Erro ao carregar HQs.");
            return;
        }

        renderizarHqs(hqs);
    } catch (error) {
        mostrarMensagem("Não foi possível conectar com a API.");
    }
}

function renderizarHqs(hqs) {
    hqsList.innerHTML = "";

    if (hqs.length === 0) {
        hqsList.innerHTML = "<p>Nenhuma HQ cadastrada.</p>";
        return;
    }

    hqs.forEach(hq => {
        const card = document.createElement("div");
        card.className = "card";

        const imagem = hq.imagem && hq.imagem.trim() !== ""
            ? hq.imagem
            : "https://placehold.co/400x600?text=Sem+Capa";

        card.innerHTML = `
            <img src="${imagem}" alt="Capa da HQ ${hq.titulo}">
            <div class="card-content">
                <h3>${hq.titulo}</h3>
                <p><strong>Autor:</strong> ${hq.autor}</p>
                <p><strong>Editora:</strong> ${hq.editora}</p>
                <p><strong>Gênero:</strong> ${hq.genero}</p>
                <p><strong>Volume:</strong> ${hq.volume}</p>
                <p><strong>Status:</strong> ${hq.status}</p>
                <p><strong>Nota:</strong> ${hq.nota}</p>

                <div class="card-actions">
                    <button class="edit-btn" onclick="prepararEdicao(${hq.id})">Editar</button>
                    <button class="delete-btn" onclick="excluirHq(${hq.id})">Excluir</button>
                </div>
            </div>
        `;

        hqsList.appendChild(card);
    });
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const hq = {
        titulo: tituloInput.value,
        autor: autorInput.value,
        editora: editoraInput.value,
        genero: generoInput.value,
        volume: Number(volumeInput.value),
        status: statusInput.value,
        nota: Number(notaInput.value),
        imagem: imagemInput.value
    };

    const id = hqIdInput.value;

    if (id) {
        await atualizarHq(id, hq);
    } else {
        await cadastrarHq(hq);
    }
});

async function cadastrarHq(hq) {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(hq)
        });

        if (!response.ok) {
            mostrarMensagem("Erro ao cadastrar HQ.");
            return;
        }

        mostrarMensagem("HQ cadastrada com sucesso!");
        limparFormulario();
        listarHqs();
    } catch (error) {
        mostrarMensagem("Não foi possível cadastrar a HQ.");
    }
}

async function prepararEdicao(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const hq = await response.json();

        if (!response.ok) {
            mostrarMensagem("HQ não encontrada.");
            return;
        }

        hqIdInput.value = hq.id;
        tituloInput.value = hq.titulo;
        autorInput.value = hq.autor;
        editoraInput.value = hq.editora;
        generoInput.value = hq.genero;
        volumeInput.value = hq.volume;
        statusInput.value = hq.status;
        notaInput.value = hq.nota;
        imagemInput.value = hq.imagem || "";

        formTitle.textContent = "Editar HQ";
        submitBtn.textContent = "Salvar alterações";
        cancelBtn.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    } catch (error) {
        mostrarMensagem("Erro ao carregar HQ para edição.");
    }
}

async function atualizarHq(id, hq) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(hq)
        });

        if (!response.ok) {
            mostrarMensagem("Erro ao atualizar HQ.");
            return;
        }

        mostrarMensagem("HQ atualizada com sucesso!");
        limparFormulario();
        listarHqs();
    } catch (error) {
        mostrarMensagem("Não foi possível atualizar a HQ.");
    }
}

async function excluirHq(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta HQ?");

    if (!confirmar) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            mostrarMensagem("Erro ao excluir HQ.");
            return;
        }

        mostrarMensagem("HQ excluída com sucesso!");
        listarHqs();
    } catch (error) {
        mostrarMensagem("Não foi possível excluir a HQ.");
    }
}

searchBtn.addEventListener("click", async function () {
    const titulo = searchInput.value.trim();

    if (titulo === "") {
        listarHqs();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/nome/${encodeURIComponent(titulo)}`);
        const data = await response.json();

        if (!response.ok) {
            renderizarHqs([]);
            mostrarMensagem("Nenhuma HQ encontrada com esse título.");
            return;
        }

        renderizarHqs(data);
    } catch (error) {
        mostrarMensagem("Erro ao buscar HQ.");
    }
});

filterStatus.addEventListener("change", async function () {
    const status = filterStatus.value;

    if (status === "") {
        listarHqs();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/status/${encodeURIComponent(status)}`);
        const data = await response.json();

        if (!response.ok) {
            renderizarHqs([]);
            mostrarMensagem("Nenhuma HQ encontrada com esse status.");
            return;
        }

        renderizarHqs(data);
    } catch (error) {
        mostrarMensagem("Erro ao filtrar HQs.");
    }
});

clearBtn.addEventListener("click", function () {
    searchInput.value = "";
    filterStatus.value = "";
    listarHqs();
    mostrarMensagem("");
});

cancelBtn.addEventListener("click", function () {
    limparFormulario();
});

function limparFormulario() {
    form.reset();
    hqIdInput.value = "";
    formTitle.textContent = "Cadastrar HQ";
    submitBtn.textContent = "Cadastrar";
    cancelBtn.classList.add("hidden");
}

function mostrarMensagem(texto) {
    message.textContent = texto;
}

listarHqs();