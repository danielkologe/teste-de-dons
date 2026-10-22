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

  function codificar(respostas) {
    return respostas.map(function (r) { return r === null || r === undefined ? '-' : String(r); }).join('');
  }

  function decodificar(texto) {
    if (typeof texto !== 'string' || !/^[0-4-]{120}$/.test(texto)) return null;
    return texto.split('').map(function (c) { return c === '-' ? null : Number(c); });
  }

  var api = {
    QTD_DONS: QTD_DONS, QTD_PERGUNTAS: QTD_PERGUNTAS, MAX_POR_DOM: MAX_POR_DOM,
    pontuar: pontuar, ordenar: ordenar, completo: completo, codificar: codificar, decodificar: decodificar
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Calculo = api;
})(typeof window !== 'undefined' ? window : this);
