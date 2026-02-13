const btnGenerate = document.querySelector("#generate-pdf")
const infosTabela = document.getElementById("infos-tabela")
const btnLimpar = document.querySelector("#btnLimpar")

let linhaEditando = null

btnGenerate.addEventListener("click", () => {
  //Conteúdo do PDF
  const content = document.querySelector("#content")

  //Configuração do arquivo final de PDF
  const options = {
    margin: 10,
    filename: "conta_prefeitura.pdf",
    html2canvas: {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff"
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  }

  let elementos = document.querySelectorAll(".no-print")

  // esconder botões
  elementos.forEach(e => e.style.display = "none")

  //Gerar e baixar o PDF
  html2pdf().set(options).from(content).save()
})

const add = (
  qtdParam,
  descParam,
  eventoParam,
  dataParam,
  valorParam
) => {

  /* =========================
     PEGAR VALORES
  ========================= */

  let quantidade = qtdParam ?? document.getElementById("quantidade").value
  let descricao = descParam ?? document.getElementById("descricao").value
  let evento = eventoParam ?? document.getElementById("evento-local").value
  let data = dataParam ?? document.getElementById("data").value
  let valor = valorParam ?? document.getElementById("valor").value

  if (!quantidade || !descricao || !valor) return

  /* =========================
     FORMATAR DATA
  ========================= */

  if (data.includes("-")) {
    let [ano, mes, dia] = data.split("-")
    data = `${dia}/${mes}/${ano}`
  }

  /* =========================
     FORMATAR VALOR
  ========================= */

  valor = valor.replace(",", ".")
  let numero = parseFloat(valor) || 0

  let valorFormatado = numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })


  /* =========================
     CRIAR ELEMENTOS
  ========================= */

  const tabela = document.getElementById("corpoTabela")

  const linha = document.createElement("tr")

  const colQtd = document.createElement("td")
  const colDesc = document.createElement("td")
  const colEvento = document.createElement("td")
  const colData = document.createElement("td")
  const colValor = document.createElement("td")

  colValor.classList.add("col-valor")

  colQtd.textContent = quantidade
  colDesc.textContent = descricao
  colEvento.textContent = evento
  colData.textContent = data

  /* =========================
     VALOR + BOTÕES (WRAPPER)
  ========================= */

  const wrapper = document.createElement("div")
  wrapper.classList.add("valor-wrapper")

  const spanValor = document.createElement("span")
  spanValor.classList.add("valor")
  spanValor.textContent = valorFormatado

  /* ===== BOTÃO EDITAR ===== */

  const btnEditar = document.createElement("button")
  btnEditar.innerHTML = '<i class="fa-solid fa-pen"></i>'
  btnEditar.classList.add("btn", "btn-editar", "no-print")
  btnEditar.title = "Editar"

  btnEditar.addEventListener("click", () => {
    document.getElementById("quantidade").value = colQtd.textContent
    document.getElementById("descricao").value = colDesc.textContent
    document.getElementById("evento-local").value = colEvento.textContent

    let [dia, mes, ano] = colData.textContent.split("/")
    document.getElementById("data").value = `${ano}-${mes}-${dia}`

    document.getElementById("valor").value =
      spanValor.textContent.replace(".", "").replace(",", ".")

    linha.remove()
    atualizarTotal()
    salvarLocalStorage()
  })

  /* ===== BOTÃO DUPLICAR ===== */

  const btnDuplicar = document.createElement("button")
  btnDuplicar.innerHTML = '<i class="fa-solid fa-copy"></i>'
  btnDuplicar.classList.add("btn", "btn-duplicar", "no-print")
  btnDuplicar.title = "Duplicar"

  btnDuplicar.addEventListener("click", () => {

    add(
      colQtd.textContent,
      colDesc.textContent,
      colEvento.textContent,
      colData.textContent,
      spanValor.textContent
    )

  })

  /* ===== BOTÃO EXCLUIR ===== */

  const btnExcluir = document.createElement("button")
  btnExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>'
  btnExcluir.classList.add("btn", "btn-excluir", "no-print")
  btnExcluir.title = "Excluir"

  btnExcluir.addEventListener("click", () => {
    linha.remove()
    atualizarTotal()
    salvarLocalStorage()
  })

  /* ===== MONTAR ===== */

  wrapper.appendChild(spanValor)
  wrapper.appendChild(btnDuplicar)
  wrapper.appendChild(btnEditar)
  wrapper.appendChild(btnExcluir)

  colValor.appendChild(wrapper)

  linha.append(colQtd, colDesc, colEvento, colData, colValor)

  tabela.appendChild(linha)

  /* =========================
     FINALIZAÇÃO
  ========================= */

  document.querySelector("form").reset()

  atualizarTotal()
  salvarLocalStorage()
}

const atualizarTotal = () => {
  let soma = 0

  document.querySelectorAll("#corpoTabela tr").forEach(linha => {

    let valorTexto = linha.children[4].textContent

    let numero = valorTexto
      .replace(/\./g, "") // remove milhares
      .replace(",", "."); // vírgula → ponto

    soma += parseFloat(numero) || 0
  })

  document.getElementById("total").textContent =
    soma.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
}

const limparTudo = () => {
  localStorage.removeItem("tabelaDados")
  document.getElementById("corpoTabela").innerHTML = ""
  atualizarTotal()
}

const modal = document.getElementById("modalConfirm")
const btnCancelar = document.getElementById("btnCancelar")
const btnConfirmar = document.getElementById("btnConfirmar")
const btnPopupLimpar = document.getElementById("btnLimpar"); // botão da tela

btnPopupLimpar.addEventListener("click", () => {
  modal.classList.remove("hidden")
})

btnCancelar.addEventListener("click", () => {
  modal.classList.add("hidden")
})

btnConfirmar.addEventListener("click", () => {
  limparTudo()
  modal.classList.add("hidden")
})

const salvarLocalStorage = () => {
  const dados = []

  document.querySelectorAll("#corpoTabela tr").forEach(tr => {
    dados.push({
      qtd: tr.children[0].textContent,
      desc: tr.children[1].textContent,
      evento: tr.children[2].textContent,
      data: tr.children[3].textContent,
      valor: tr.querySelector(".valor").textContent
    })
  })

  localStorage.setItem("tabelaDados", JSON.stringify(dados))
}

const carregarLocalStorage = () => {
  const dados = JSON.parse(localStorage.getItem("tabelaDados")) || []

  dados.forEach(item => {
    add(item.qtd, item.desc, item.evento, item.data, item.valor)
  })
}

/* =========================
   MÁSCARA MOEDA (FINAL)
========================= */

const inputValor = document.getElementById("valor");

const formatarMoeda = (valor) => {
  let numeros = valor.replace(/\D/g, "");
  let numero = (parseInt(numeros || 0) / 100);

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// valor inicial
inputValor.value = formatarMoeda("0")

// enquanto digita
inputValor.addEventListener("input", (e) => {
  e.target.value = formatarMoeda(e.target.value)
})

// quando o form resetar
infosTabela.addEventListener("reset", () => {
  setTimeout(() => {
    inputValor.value = formatarMoeda("0")
  })
})

const atualizarCorValor = () => {
  if (inputValor.value === "0,00") {
    inputValor.classList.add("vazio")
  } else {
    inputValor.classList.remove("vazio")
  }
}

atualizarCorValor()

inputValor.addEventListener("input", atualizarCorValor)
infosTabela.addEventListener("reset", () => setTimeout(atualizarCorValor))


window.addEventListener("DOMContentLoaded", carregarLocalStorage)

btnLimpar.addEventListener("click", limparTudo)

infosTabela.addEventListener("submit", event => {
  event.preventDefault()
  add()
  document.getElementById("quantidade").focus()
})
