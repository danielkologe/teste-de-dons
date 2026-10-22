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
    fill.style.width = (n / C.QTD_PERGUNTAS * 100) + '%';
    status.textContent = estado.pontos ? 'Resultado compartilhado' : emTeste ? n + ' de ' + C.QTD_PERGUNTAS + ' respondidas' : '';
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
    var retomar = n > 0 && n < C.QTD_PERGUNTAS;
    var botoes = retomar
      ? '<button class="btn" data-a="continuar">Continuar (' + n + ' de ' + C.QTD_PERGUNTAS + ')</button>' +
        '<button class="btn sec" data-a="' + (estado.confirma === 'recomecar' ? 'recomecar' : 'pedirrecomecar') + '">' +
        (estado.confirma === 'recomecar' ? 'Apagar respostas e recomeçar' : 'Recomeçar') + '</button>'
      : n === C.QTD_PERGUNTAS
        ? '<button class="btn" data-a="verresultado">Ver meu resultado</button><button class="btn sec" data-a="' + (estado.confirma === 'recomecar' ? 'recomecar' : 'pedirrecomecar') + '">' + (estado.confirma === 'recomecar' ? 'Apagar respostas e refazer' : 'Refazer o teste') + '</button>'
        : '<button class="btn" data-a="comecar">Começar o teste</button>';
    app.innerHTML =
      '<h1>Descubra seus dons espirituais</h1>' +
      '<p class="muted">Este teste ajuda a encontrar o seu lugar de atuação no corpo de Cristo. São ' + C.QTD_PERGUNTAS + ' afirmações em ' + TELAS + ' telas curtas, e leva cerca de 15 minutos.</p>' +
      '<div class="card"><ul class="dicas">' +
      '<li>Responda com sinceridade, pensando em quem você é hoje, não em quem gostaria de ser.</li>' +
      '<li>Em cada afirmação escolha de <b>4</b> (mais forte) a <b>0</b> (nada). A escala aparece no topo de cada tela.</li>' +
      '<li>Se em alguma área você não tem nenhuma experiência, marque <b>0</b>.</li>' +
      '<li>Suas respostas ficam só neste aparelho. Se fechar a página, você continua de onde parou.</li></ul>' +
      '<div class="acoes">' + botoes + '</div></div>' +
      '<p class="nota">O teste não é conclusivo: é uma ferramenta de apoio. O resultado pode mudar com o tempo e não deve limitar o seu serviço, porque a igreja também precisa de quem se disponha a novas tarefas.</p>';
  }

  function telaPerguntas() {
    var t = estado.tela, b = bloco(t), ini = t * POR_TELA, esc = T.escalas[b];
    var h = '<p class="muted parte">Parte ' + (t + 1) + ' de ' + TELAS + '</p>' +
      '<div class="enunc-fixo" aria-hidden="true">' + T.enunciados[b] + '</div>' +
      '<div class="card"><p class="enunc">' + T.enunciados[b] + '</p><ul class="legenda">';
    for (var k = 0; k < 5; k++) h += '<li><b>' + (4 - k) + '</b>' + esc[k] + '</li>';
    h += '</ul></div>';
    for (var i = ini; i < ini + POR_TELA; i++) {
      var v = estado.resp[i];
      h += '<div class="q" id="q' + i + '"><p class="txt"><span class="num">' + (i + 1) + '.</span>' + (b === 3 ? '' : '… ') + T.perguntas[i] + '</p>' +
        '<fieldset class="ops"><legend>Resposta da afirmação ' + (i + 1) + '</legend>';
      for (var s = 4; s >= 0; s--) {
        h += '<div class="op"><input type="radio" name="p' + i + '" id="p' + i + '_' + s + '" value="' + s + '"' + (v === s ? ' checked' : '') +
          ' aria-label="' + s + ' - ' + esc[4 - s] + '"><label for="p' + i + '_' + s + '"><b>' + s + '</b><small>' + esc[4 - s] + '</small></label></div>';
      }
      h += '</fieldset><p class="escolhida" id="e' + i + '">' + (v === null ? '' : esc[4 - v]) + '</p></div>';
    }
    h += '<p class="aviso" id="aviso" role="alert" hidden>Faltam respostas nas afirmações destacadas.</p>' +
      '<div class="acoes"><button class="btn sec" data-a="voltar">' + (t === 0 ? 'Início' : 'Voltar') + '</button><span class="esp"></span>' +
      '<button class="btn" data-a="avancar">' + (t === TELAS - 1 ? 'Ver resultado' : 'Avançar') + '</button></div>';
    app.innerHTML = h;
  }

  function telaResultado() {
    var s = soma(), ord = C.ordenar(s), top = ord.slice(0, 3);
    var empate = ord.slice(3).filter(function (o) { return o.pontos === top[2].pontos; });
    var h = '<h1>' + (estado.pontos ? 'Resultado do teste' : 'Seu resultado') + '</h1>' +
      '<p class="muted">Estes são os três dons com maior pontuação no teste (máximo de ' + C.MAX_POR_DOM + ' pontos por dom).</p><div class="top3">';
    top.forEach(function (o, i) {
      var d = T.dons[o.dom];
      h += '<article class="dom"><div class="pos">' + (i + 1) + 'º dom</div><h3>' + d.nome + '</h3><div class="pts">' + o.pontos + ' de ' + C.MAX_POR_DOM + ' pontos</div>' +
        '<p>' + d.desc + '</p><p class="ref">Base bíblica: ' + d.ref + '</p></article>';
    });
    h += '</div>';
    if (empate.length) {
      h += '<p class="nota">Empate no 3º lugar: ' + empate.map(function (o) { return '<b>' + T.dons[o.dom].nome + '</b>'; }).join(', ') +
        ' também ' + (empate.length > 1 ? 'tiveram ' : 'teve ') + top[2].pontos + ' pontos. Vale conversar sobre todos com o líder da célula.</p>';
    }
    h += '<div class="card"><h2>Todos os dons</h2><p class="muted peq">Toque em um dom para ler a descrição. Dons com a mesma pontuação estão empatados.</p><ol class="rank">';
    ord.forEach(function (o, i) {
      var d = T.dons[o.dom], emp = ord.some(function (x) { return x.dom !== o.dom && x.pontos === o.pontos; });
      h += '<li class="' + (i < 3 ? 'top' : '') + '"><details><summary><span class="nm">' + d.nome + (emp ? ' <em>(empate)</em>' : '') + '</span>' +
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
    document.getElementById('e' + i).textContent = T.escalas[b][4 - v];
    document.getElementById('q' + i).classList.remove('falta');
    if (!faltantes(estado.tela).length) document.getElementById('aviso').hidden = true;
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
