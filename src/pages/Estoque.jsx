// Página usada pelo time de estoque para acompanhar a quantidade de cada produto
export default function Estoque({ produtos, listaEspera = [] }) {
  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0)

  const categorias = ['roupas', 'eletronicos', 'acessorios', 'casa']
  const MARGEM_ESTIMADA = 0.35

  const estatisticasPorCategoria = categorias.map((categoria) => {
    const itensCategoria = (produtos || []).filter((produto) => produto.category === categoria)
    const valorEmEstoque = itensCategoria.reduce((total, produto) => {
      const preco = Number(produto?.price)
      const estoque = Number(produto?.estoque ?? 0)

      if (!Number.isFinite(preco) || estoque <= 0) {
        return total
      }

      return total + preco * estoque
    }, 0)

    const aguardandoPreco = itensCategoria.filter(
      (produto) => !Number.isFinite(Number(produto?.price))
    ).length

    const clientesEsperando = listaEspera.filter((item) =>
      itensCategoria.some((produto) => produto.id === item.produtoId)
    ).length

    return {
      categoria,
      valorEmEstoque,
      lucroPotencial: valorEmEstoque * MARGEM_ESTIMADA,
      unidades: itensCategoria.reduce((total, produto) => total + Number(produto?.estoque ?? 0), 0),
      aguardandoPreco,
      clientesEsperando,
    }
  })

  const valorEmEstoqueTotal = estatisticasPorCategoria.reduce(
    (total, categoria) => total + categoria.valorEmEstoque,
    0
  )

  const lucroPotencialTotal = estatisticasPorCategoria.reduce(
    (total, categoria) => total + categoria.lucroPotencial,
    0
  )

  const produtosSemPreco = (produtos || []).filter(
    (produto) => !Number.isFinite(Number(produto?.price))
  )

  // slice cria uma cópia, para o sort não alterar a lista original
  const ordenados = produtos.slice().sort((a, b) => a.estoque - b.estoque)

  return (
    <section>
      <p className="sobretitulo">Área interna</p>
      <h1>Painel da loja</h1>

      <div className="dashboard-grid">
        <div className="metric-card">
          <span className="metric-label">Dinheiro em estoque</span>
          <strong>{formatarMoeda(valorEmEstoqueTotal)}</strong>
          <small>valor atual do estoque disponível</small>
        </div>

        <div className="metric-card">
          <span className="metric-label">Produtos sem preço</span>
          <strong>{produtosSemPreco.length}</strong>
          <small>aguardando definição do time de suprimentos</small>
        </div>

        <div className="metric-card">
          <span className="metric-label">Clientes na fila de espera</span>
          <strong>{listaEspera.length}</strong>
          <small>esperando produto voltar ao catálogo</small>
        </div>

        <div className="metric-card">
          <span className="metric-label">Lucro potencial estimado</span>
          <strong>{formatarMoeda(lucroPotencialTotal)}</strong>
          <small>estimativa com base no valor de venda atual</small>
        </div>
      </div>

      <div className="tabela-moldura">
        <table className="tabela">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Valor em estoque</th>
              <th>Unidades</th>
              <th>Sem preço</th>
              <th>Clientes esperando</th>
              <th>Lucro potencial</th>
            </tr>
          </thead>
          <tbody>
            {estatisticasPorCategoria.map((item) => (
              <tr key={item.categoria}>
                <td>{item.categoria}</td>
                <td>{formatarMoeda(item.valorEmEstoque)}</td>
                <td>{item.unidades}</td>
                <td>{item.aguardandoPreco}</td>
                <td>{item.clientesEsperando}</td>
                <td>{formatarMoeda(item.lucroPotencial)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bloco-interno">
        <h2>Produtos aguardando preço</h2>
        {produtosSemPreco.length === 0 ? (
          <p className="aviso">Nenhum produto está parado por falta de preço.</p>
        ) : (
          <div className="tabela-moldura">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {produtosSemPreco.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.title}</td>
                    <td>{produto.category}</td>
                    <td>{produto.estoque}</td>
                    <td>
                      <span className="selo selo-alerta">Sem preço</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bloco-interno">
        <h2>Lista de espera</h2>
        {listaEspera.length === 0 ? (
          <p className="aviso">Nenhum cliente aguardando retorno.</p>
        ) : (
          <div className="tabela-moldura">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                </tr>
              </thead>
              <tbody>
                {listaEspera.map((item) => (
                  <tr key={item.id}>
                    <td>{item.produtoNome}</td>
                    <td>{item.nome}</td>
                    <td>{item.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bloco-interno">
        <h2>Estoque por produto</h2>
        <div className="tabela-moldura">
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Unidades</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.title}</td>
                  <td>{produto.category}</td>
                  <td>{produto.estoque}</td>
                  <td>
                    {produto.estoque === 0 && <span className="selo selo-esgotado">Esgotado</span>}
                    {produto.estoque > 0 && produto.estoque < 5 && (
                      <span className="selo selo-alerta">Repor</span>
                    )}
                    {produto.estoque >= 5 && <span className="selo selo-ok">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
