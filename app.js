(function () {
  var T = window.TESTE, C = window.Calculo;
  var POR_TELA = 10, TELAS = C.QTD_PERGUNTAS / POR_TELA, CHAVE = 'testededons.v1';
  var app = document.getElementById('app');
  var status = document.getElementById('status');
  var barra = document.getElementById('barra');
  var fill = document.getElementById('barra-fill');
  var semMovimento = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // tela: -1 início, 0..11 perguntas, 12 resultado. pontos: totais vindos de um link compartilhado.
  var estado = { resp: new Array(C.QTD_PERGUNTAS).fill(null), tela: -1, pontos: null, confirma: '' };

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify({ r: C.codificar(estado.resp) })); } catch (e) {}
  }
  function carregar() {
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      var r = d && C.decodificar(d.r);
      if (r) estado.resp = r;
    } catch (e) {}
  }
  function limpar() { try { localStorage.removeItem(CHAVE); } catch (e) {} }

  function respondidas() { return estado.resp.filter(function (r) { return r !== null; }).length; }
  function bloco(tela) { return Math.floor((tela * POR_TELA) / 20); }
  function faltantes(t) {
    var f = [];
    for (var i = t * POR_TELA; i < (t + 1) * POR_TELA; i++) if (estado.resp[i] === null) f.push(i);
    return f;
  }
  function primeiraIncompleta() {
    for (var t = 0; t < TELAS; t++) if (faltantes(t).length) return t;
    return TELAS;
  }
  function soma() { return estado.pontos || C.pontuar(estado.resp); }

  function hashDe(t) { return t < 0 ? '' : t >= TELAS ? '#resultado' : '#parte-' + (t + 1); }
  function telaDeHash(h) {
    var m = /^#parte-(\d{1,2})$/.exec(h);
    if (m && +m[1] >= 1 && +m[1] <= TELAS) return Math.min(+m[1] - 1, primeiraIncompleta() >= TELAS ? TELAS - 1 : primeiraIncompleta());
    if (h === '#resultado') return C.completo(estado.resp) ? TELAS : Math.min(primeiraIncompleta(), TELAS - 1);
    return -1;
  }

  function atualizarTopo() {
    var n = respondidas(), emTeste = estado.tela >= 0 && estado.tela < TELAS && !estado.pontos;
    barra.hidden = !emTeste;
    app.classList.toggle('com-barra', emTeste);
    fill.style.width = (n / C.QTD_PERGUNTAS * 100) + '%';
    status.textContent = estado.pontos ? 'Resultado compartilhado' : emTeste ? n + ' de ' + C.QTD_PERGUNTAS : '';
  }

  function ir(tela, semHistorico) {
    estado.tela = tela; estado.confirma = '';
    if (!semHistorico) history.pushState(null, '', location.pathname + hashDe(tela));
    desenhar();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function telaInicio() {
    var n = respondidas();
    var confirmando = estado.confirma === 'recomecar';
    var botoes = n > 0 && n < C.QTD_PERGUNTAS
      ? '<button class="btn grande" data-a="continuar">Continuar (' + n + ' de ' + C.QTD_PERGUNTAS + ')</button>' +
        '<button class="btn sec" data-a="' + (confirmando ? 'recomecar' : 'pedirrecomecar') + '">' + (confirmando ? 'Apagar respostas e recomeçar' : 'Recomeçar') + '</button>'
      : n === C.QTD_PERGUNTAS
        ? '<button class="btn grande" data-a="verresultado">Ver meu resultado</button><button class="btn sec" data-a="' + (confirmando ? 'recomecar' : 'pedirrecomecar') + '">' + (confirmando ? 'Apagar respostas e refazer' : 'Refazer o teste') + '</button>'
        : '<button class="btn grande" data-a="comecar">Começar o teste</button>';
    app.innerHTML =
      '<section class="hero"><p class="eyebrow">Servir · Dons espirituais</p>' +
      '<h1>Descubra seus dons espirituais</h1>' +
      '<p>Encontre o seu lugar de atuação no corpo de Cristo. São ' + C.QTD_PERGUNTAS + ' afirmações em ' + TELAS + ' telas curtas, cerca de 15 minutos.</p>' +
      '<div class="acoes">' + botoes + '</div></section>' +
      '<div class="passos">' +
      '<div class="passo c0"><b>Passo 1</b><h3>Responder</h3><p>Escolha, em cada afirmação, o círculo que mais combina com você hoje.</p></div>' +
      '<div class="passo c1"><b>Passo 2</b><h3>Descobrir</h3><p>Veja os três dons com maior pontuação e a descrição de cada um.</p></div>' +
      '<div class="passo c3"><b>Passo 3</b><h3>Servir</h3><p>Converse com o líder da célula e escolha onde servir.</p></div></div>' +
      '<div class="card"><ul class="dicas">' +
      '<li>Responda com sinceridade, pensando em quem você é hoje, não em quem gostaria de ser.</li>' +
      '<li>Quanto maior o círculo, maior a intensidade. O menor equivale a <b>0</b>, nada.</li>' +
      '<li>Se em alguma área você não tem nenhuma experiência, marque o menor círculo.</li>' +
      '<li>Suas respostas ficam só neste aparelho. Se fechar a página, você continua de onde parou.</li></ul></div>' +
      '<p class="nota">O teste não é conclusivo: é uma ferramenta de apoio. O resultado pode mudar com o tempo e não deve limitar o seu serviço, porque a igreja também precisa de quem se disponha a novas tarefas.</p>';
  }

  function linhaPergunta(i, b) {
    var esc = T.escalas[b], v = estado.resp[i];
    var h = '<div class="q" id="q' + i + '"><p class="txt"><span class="num">' + (i + 1) + '</span>' + (b === 3 ? '' : '… ') + T.perguntas[i] + '</p>' +
      '<fieldset class="escala"><legend>Resposta da afirmação ' + (i + 1) + '</legend>' +
      '<span class="ext ext-lo" aria-hidden="true">' + esc[4] + '</span><div class="dots">';
    for (var s = 0; s <= 4; s++) {
      h += '<div class="op s' + s + '"><input type="radio" name="p' + i + '" id="p' + i + '_' + s + '" value="' + s + '"' + (v === s ? ' checked' : '') +
        ' aria-label="' + s + ' - ' + esc[4 - s] + '"><label for="p' + i + '_' + s + '"></label></div>';
    }
    return h + '</div><span class="ext ext-hi" aria-hidden="true">' + esc[0] + '</span></fieldset>' +
      '<p class="escolhida" id="e' + i + '" aria-hidden="true">' + (v === null ? '' : 'Você marcou: ' + esc[4 - v]) + '</p></div>';
  }

  function telaPerguntas() {
    var t = estado.tela, b = bloco(t), ini = t * POR_TELA;
    var h = '<div class="parte"><b>Parte ' + (t + 1) + ' de ' + TELAS + '</b><span class="muted peq">' + (t < TELAS - 1 ? 'Faltam ' + (TELAS - 1 - t) + ' telas após esta' : 'Última tela') + '</span></div>' +
      '<div class="enunc-fixo" aria-hidden="true">' + T.enunciados[b] + '</div>' +
      '<div class="bloco"><p class="enunc">' + T.enunciados[b] + '</p>' +
      '<p class="dica">Escolha o círculo: do menor (' + T.escalas[b][4].toLowerCase() + ') ao maior (' + T.escalas[b][0].toLowerCase() + ').</p></div>' +
      '<div class="perguntas" id="perguntas">';
    for (var i = ini; i < ini + POR_TELA; i++) h += linhaPergunta(i, b);
    h += '</div><p class="aviso" id="aviso" role="alert" hidden>Faltam respostas nas afirmações destacadas.</p>' +
      '<div class="barra-inf"><div class="barra-inf-in">' +
      '<button class="btn sec peq-btn" data-a="voltar">' + (t === 0 ? 'Início' : 'Voltar') + '</button>' +
      '<div class="prog" id="prog"></div>' +
      '<button class="btn" data-a="avancar">' + (t === TELAS - 1 ? 'Ver resultado' : 'Avançar') + '</button></div></div>';
    app.innerHTML = h;
    marcarAtiva();
    observarBloco();
  }

  // A pergunta ativa é a primeira sem resposta da tela; as demais ficam levemente esmaecidas.
  function marcarAtiva() {
    var cont = document.getElementById('perguntas'); if (!cont) return;
    var f = faltantes(estado.tela), ativa = f.length ? f[0] : null;
    Array.prototype.forEach.call(cont.querySelectorAll('.q'), function (q) { q.classList.toggle('ativa', ativa !== null && q.id === 'q' + ativa); });
    cont.classList.toggle('tem-ativa', ativa !== null);
    var p = document.getElementById('prog');
    if (p) p.innerHTML = '<b>' + (POR_TELA - f.length) + ' de ' + POR_TELA + '</b>nesta tela';
  }

  // O enunciado do bloco fica fixo no topo só depois que o cartão original sai da tela.
  var obs = null;
  function observarBloco() {
    if (obs) obs.disconnect();
    var card = app.querySelector('.bloco'), fixo = app.querySelector('.enunc-fixo');
    if (!card || !fixo || !('IntersectionObserver' in window)) return;
    obs = new IntersectionObserver(function (es) { fixo.classList.toggle('mostra', !es[0].isIntersecting); }, { rootMargin: '-60px 0px 0px 0px' });
    obs.observe(card);
  }

  function categoria(d) { return 'c' + T.dons[d].cat; }

  function telaResultado() {
    var s = soma(), ord = C.ordenar(s), top = ord.slice(0, 3);
    var empate = ord.slice(3).filter(function (o) { return o.pontos === top[2].pontos; });
    var d0 = T.dons[top[0].dom], c0 = T.categorias[d0.cat];
    var h = '<p class="eyebrow">' + (estado.pontos ? 'Resultado do teste' : 'Seu resultado') + '</p>' +
      '<section class="res-hero ' + categoria(top[0].dom) + '"><div class="pos">1º dom · ' + top[0].pontos + ' de ' + C.MAX_POR_DOM + ' pontos</div>' +
      '<h2>' + d0.nome + '</h2><span class="selo">' + c0.nome + '</span>' +
      '<p class="resumo">' + d0.desc + '</p><p class="ref">Base bíblica: ' + d0.ref + '</p></section>' +
      '<div class="dom-sec">';
    top.slice(1).forEach(function (o, i) {
      var d = T.dons[o.dom];
      h += '<article class="dom ' + categoria(o.dom) + '"><div class="pos">' + (i + 2) + 'º dom · ' + o.pontos + ' de ' + C.MAX_POR_DOM + '</div><h3>' + d.nome + '</h3>' +
        '<span class="selo">' + T.categorias[d.cat].nome + '</span><p>' + d.desc + '</p><p class="ref">Base bíblica: ' + d.ref + '</p></article>';
    });
    h += '</div>';
    if (empate.length) {
      h += '<p class="nota topo-esp">Empate no 3º lugar: ' + empate.map(function (o) { return '<b>' + T.dons[o.dom].nome + '</b>'; }).join(', ') +
        ' também ' + (empate.length > 1 ? 'tiveram ' : 'teve ') + top[2].pontos + ' pontos. Vale conversar sobre todos com o líder da célula.</p>';
    }
    h += '<div class="card topo-esp"><h2>Todos os dons</h2><p class="muted peq">Toque em um dom para ler a descrição. Dons com a mesma pontuação estão empatados.</p><ul class="legenda-cat">';
    T.categorias.forEach(function (c, i) { h += '<li class="c' + i + '">' + c.nome + ' <span>(' + c.sub + ')</span></li>'; });
    h += '</ul><ol class="rank">';
    ord.forEach(function (o) {
      var d = T.dons[o.dom], emp = ord.some(function (x) { return x.dom !== o.dom && x.pontos === o.pontos; });
      h += '<li class="' + categoria(o.dom) + '"><details><summary><span class="nm">' + d.nome + (emp ? ' <em>(empate)</em>' : '') + '</span>' +
        '<span class="bar"><i data-w="' + (o.pontos / C.MAX_POR_DOM * 100) + '"></i></span><span class="v">' + o.pontos + '</span></summary>' +
        '<p>' + d.desc + '</p><p class="ref">Base bíblica: ' + d.ref + '</p></details></li>';
    });
    h += '</ol></div>' +
      '<div class="nota"><p><b>Lembre-se:</b> o teste não é conclusivo. Ele é uma ferramenta de apoio para encontrar o lugar de atuação no corpo de Cristo. O resultado pode mudar com o tempo, conforme a pessoa serve e conforme as necessidades da igreja, e não deve limitar a atuação.</p>' +
      '<p><b>Próximo passo:</b> converse sobre o resultado com o líder da célula e procure uma área da igreja onde possa servir com o seu dom, mesmo que seja por um período de experiência.</p></div>' +
      '<div class="acoes"><a class="btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + encodeURIComponent(resumo()) + '">Enviar pelo WhatsApp</a>' +
      '<button class="btn sec" data-a="copiar">Copiar resultado</button>' +
      '<button class="btn sec" data-a="imprimir">Imprimir / salvar PDF</button>' +
      (estado.pontos
        ? '<button class="btn sec" data-a="meuteste">Fazer meu teste</button>'
        : '<button class="btn sec" data-a="revisar">Revisar respostas</button>' +
          '<button class="btn sec" data-a="' + (estado.confirma === 'refazer' ? 'refazer' : 'pedirrefazer') + '">' + (estado.confirma === 'refazer' ? 'Tem certeza? Apagar e refazer' : 'Refazer o teste') + '</button>') +
      '</div><p class="toast" id="toast" role="status"></p>';
    app.innerHTML = h;
    Array.prototype.forEach.call(app.querySelectorAll('.bar i'), function (e) { e.style.width = e.dataset.w + '%'; });
  }

  function link() { return location.origin + location.pathname + '#s=' + C.codificarPontos(soma()); }
  function resumo() {
    var ord = C.ordenar(soma()).slice(0, 3);
    return 'Meu teste de dons espirituais:\n' +
      ord.map(function (o, i) { return (i + 1) + '. ' + T.dons[o.dom].nome + ' (' + o.pontos + '/' + C.MAX_POR_DOM + ')'; }).join('\n') + '\n' + link();
  }
  function aviso(msg) { var t = document.getElementById('toast'); if (t) t.textContent = msg; }

  function copiar() {
    var txt = resumo();
    var ok = function () { aviso('Resultado copiado. É só colar no WhatsApp.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, function () { aviso('Não consegui copiar. Use o botão Enviar pelo WhatsApp.'); });
    } else {
      var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { aviso('Não consegui copiar.'); }
      ta.remove();
    }
  }

  function desenhar() {
    if (estado.tela < 0) telaInicio();
    else if (estado.tela < TELAS) telaPerguntas();
    else telaResultado();
    atualizarTopo();
  }

  function rolarPara(el) { el.scrollIntoView({ block: 'center', behavior: semMovimento ? 'auto' : 'smooth' }); }

  app.addEventListener('change', function (e) {
    var m = /^p(\d+)_(\d)$/.exec(e.target.id || '');
    if (!m) return;
    var i = +m[1], v = +m[2], b = bloco(estado.tela), primeira = estado.resp[i] === null;
    estado.resp[i] = v;
    salvar();
    document.getElementById('e' + i).textContent = 'Você marcou: ' + T.escalas[b][4 - v];
    document.getElementById('q' + i).classList.remove('falta');
    if (!faltantes(estado.tela).length) document.getElementById('aviso').hidden = true;
    marcarAtiva();
    atualizarTopo();
    if (primeira) {
      var prox = faltantes(estado.tela).filter(function (x) { return x > i; })[0];
      if (prox !== undefined) rolarPara(document.getElementById('q' + prox));
    }
  });

  app.addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'); if (!a) return;
    switch (a.dataset.a) {
      case 'comecar': ir(0); break;
      case 'continuar': ir(Math.min(primeiraIncompleta(), TELAS - 1)); break;
      case 'verresultado': ir(TELAS); break;
      case 'pedirrecomecar': estado.confirma = 'recomecar'; desenhar(); break;
      case 'recomecar': estado.resp.fill(null); limpar(); ir(0); break;
      case 'voltar': ir(estado.tela - 1); break;
      case 'avancar':
        var f = faltantes(estado.tela);
        if (f.length) {
          f.forEach(function (i) { document.getElementById('q' + i).classList.add('falta'); });
          document.getElementById('aviso').hidden = false;
          rolarPara(document.getElementById('q' + f[0]));
        } else ir(estado.tela + 1);
        break;
      case 'copiar': copiar(); break;
      case 'imprimir': window.print(); break;
      case 'pedirrefazer': estado.confirma = 'refazer'; desenhar(); break;
      case 'refazer': estado.resp.fill(null); limpar(); ir(-1); break;
      case 'revisar': ir(0); break;
      case 'meuteste':
        estado.pontos = null; estado.resp.fill(null); carregar();
        ir(-1);
        break;
    }
  });

  window.addEventListener('popstate', function () {
    if (/^#s=/.test(location.hash)) { location.reload(); return; }
    estado.pontos = null;
    estado.tela = telaDeHash(location.hash);
    estado.confirma = '';
    desenhar();
    window.scrollTo(0, 0);
  });

  // Link compartilhado (#s=20 dígitos) mostra só os totais; nunca contém as respostas.
  var ms = /^#s=([0-9a-o]{20})$/.exec(location.hash);
  var pts = ms && C.decodificarPontos(ms[1]);
  carregar();
  if (pts && pts.every(function (v) { return v <= C.MAX_POR_DOM; })) { estado.pontos = pts; estado.tela = TELAS; }
  else estado.tela = telaDeHash(location.hash);
  desenhar();
})();
