// Regras do material: o dom d (0 a 19) soma as perguntas d, d+20, d+40, d+60, d+80 e d+100.
(function (raiz) {
  var QTD_DONS = 20, QTD_PERGUNTAS = 120, MAX_POR_DOM = 24;

  function pontuar(respostas) {
    var soma = [];
    for (var d = 0; d < QTD_DONS; d++) soma.push(0);
    for (var i = 0; i < QTD_PERGUNTAS; i++) soma[i % QTD_DONS] += respostas[i] || 0;
    return soma;
  }

  // Do maior para o menor; empate mantém a ordem da tabela do material.
  function ordenar(soma) {
    return soma.map(function (v, d) { return { dom: d, pontos: v }; })
      .sort(function (a, b) { return b.pontos - a.pontos || a.dom - b.dom; });
  }

  function completo(respostas) {
    if (!respostas || respostas.length !== QTD_PERGUNTAS) return false;
    return respostas.every(function (r) { return r === 0 || r === 1 || r === 2 || r === 3 || r === 4; });
  }

  // Respostas salvas no aparelho: 120 caracteres, "-" = sem resposta.
  function codificar(respostas) {
    return respostas.map(function (r) { return r === null || r === undefined ? '-' : String(r); }).join('');
  }

  function decodificar(texto) {
    if (typeof texto !== 'string' || !/^[0-4-]{120}$/.test(texto)) return null;
    return texto.split('').map(function (c) { return c === '-' ? null : Number(c); });
  }

  // Link de resultado: só os 20 totais (0 a 24), um dígito base 25 por dom. Não revela as respostas.
  function codificarPontos(soma) {
    return soma.map(function (v) { return v.toString(25); }).join('');
  }

  function decodificarPontos(texto) {
    if (typeof texto !== 'string' || !/^[0-9a-o]{20}$/.test(texto)) return null;
    return texto.split('').map(function (c) { return parseInt(c, 25); });
  }

  var api = {
    QTD_DONS: QTD_DONS, QTD_PERGUNTAS: QTD_PERGUNTAS, MAX_POR_DOM: MAX_POR_DOM,
    pontuar: pontuar, ordenar: ordenar, completo: completo, codificar: codificar, decodificar: decodificar,
    codificarPontos: codificarPontos, decodificarPontos: decodificarPontos
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Calculo = api;
})(typeof window !== 'undefined' ? window : this);
