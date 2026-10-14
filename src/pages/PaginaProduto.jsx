import { Link, useParams } from 'react-router'
import { useEffect, useState } from 'react'

export default function PaginaProduto({ produtos, clienteAtual, onAdicionar, onRegistrarEspera }) {
  const { id } = useParams()
  const produto = produtos.find((item) => item.id === id)
  const [nome, setNome] = useState(clienteAtual?.nome ?? '')
  const [email, setEmail] = useState(clienteAtual?.email ?? '')
  const [mensagem, setMensagem] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    if (clienteAtual) {
      setNome(clienteAtual.nome ?? '')
      setEmail(clienteAtual.email ?? '')
    }
  }, [clienteAtual])

  if (!produto) {
    return (
      <div className="estado-vazio">
        <p>Produto não encontrado.</p>
        <Link to="/" className="botao botao-secundario">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const esgotado = Number(produto.estoque ?? 0) === 0
  const indisponivel = esgotado || !Number.isFinite(Number(produto?.price))
  const formatarPrecoProduto = (valor) =>
    Number.isFinite(Number(valor)) ? `R$ ${Number(valor).toFixed(2).replace('.', ',')}` : 'Preço indisponível'
  const relacionados = produtos
    .filter(
      (item) =>
        item.category === produto.category &&
        item.id !== produto.id &&
        Number(item.estoque ?? 0) > 0 &&
        Number.isFinite(Number(item.price))
    )
    .slice(0, 4)

  function registrarInteresse(evento) {
    evento.preventDefault()

    if (!nome.trim() || !email.trim()) {
      setMensagem('Informe seu nome e e-mail para receber o aviso.')
      return
    }

    onRegistrarEspera({
      produtoId: produto.id,
      produtoNome: produto.title,
      nome: nome.trim(),
      email: email.trim(),
    })

    setMensagem('Você entrou na lista de espera. Te avisaremos assim que o produto voltar.')
  }

  return (
    <section>
      <nav className="trilha" aria-label="Você está em">
        <Link to="/">Loja</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.title}</span>
      </nav>

      <div className="detalhe">
        <div className="detalhe-imagem-moldura">
          <img src={produto.image} alt={produto.title} className="detalhe-imagem" />
        </div>

        <div className="detalhe-info">
          <h1>{produto.title}</h1>
          <p className="card-avaliacao">
            ★ {produto.rating.rate} <span>({produto.rating.count} avaliações)</span>
          </p>
          <p className="detalhe-preco">{formatarPrecoProduto(produto.price)}</p>
          <p className="detalhe-descricao">{produto.description}</p>
          <p className="detalhe-estoque">{produto.estoque} unidades disponíveis</p>

          {indisponivel ? (
            <div className="estado-vazio">
              <p className="selo selo-esgotado">{esgotado ? 'Esgotado' : 'Indisponível'}</p>
              <p>
                {esgotado
                  ? 'Este produto está fora de estoque no momento.'
                  : 'Este produto ainda não está disponível para venda.'}
              </p>

              {!mostrarFormulario ? (
                <button
                  type="button"
                  className="botao botao-grande"
                  onClick={() => setMostrarFormulario(true)}
                >
                  Quero ser avisado
                </button>
              ) : (
                <form onSubmit={registrarInteresse} className="cupom">
                  <label htmlFor="nome-aviso" className="rotulo">
                    Nome
                  </label>
                  <input
                    id="nome-aviso"
                    value={nome}
                    onChange={(evento) => setNome(evento.target.value)}
                    placeholder="Seu nome"
                  />

                  <label htmlFor="email-aviso" className="rotulo">
                    E-mail
                  </label>
                  <input
                    id="email-aviso"
                    type="email"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    placeholder="seu@email.com"
                  />

                  <button type="submit" className="botao botao-grande">
                    Confirmar aviso
                  </button>
                </form>
              )}

              {mensagem && <p className="mensagem-cupom">{mensagem}</p>}
            </div>
          ) : (
            <button
              className="botao botao-grande"
              onClick={() => onAdicionar(produto)}
              disabled={produto.estoque === 0}
            >
              Adicionar ao carrinho
            </button>
          )}

          <ul className="detalhe-garantias">
            <li>Troca grátis em até 30 dias</li>
            <li>Parcele em até 10x sem juros</li>
          </ul>
        </div>
      </div>

      <h2>Produtos relacionados</h2>
      <div className="grade">
        {relacionados.map((item) => (
          <article key={item.id} className="card">
            <Link to={`/produto/${item.id}`} className="card-link">
              <div className="card-imagem-moldura">
                <img src={item.image} alt={item.title} className="card-imagem" />
              </div>
              <h3 className="card-titulo">{item.title}</h3>
            </Link>
            <p className="preco">{formatarPrecoProduto(item.price)}</p>
            <button className="botao" onClick={() => onAdicionar(item)}>
              Adicionar ao carrinho
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
