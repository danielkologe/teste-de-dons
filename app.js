(function () {
  var T = window.TESTE, C = window.Calculo;
  var POR_TELA = 10, TELAS = C.QTD_PERGUNTAS / POR_TELA, CHAVE = 'testededons.v1';
  var app = document.getElementById('app');
  var status = document.getElementById('status');
  var barra = document.getElementById('barra');
  var fill = document.getElementById('barra-fill');

  var estado = { resp: new Array(C.QTD_PERGUNTAS).fill(null), tela: -1, compartilhado: false, confirmaRefazer: false };

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify({ r: C.codificar(estado.resp), t: estado.tela })); } catch (e) {}
  }
  function carregar() {
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      var r = d && C.decodificar(d.r);
      if (r) { estado.resp = r; estado.tela = Math.min(Math.max(d.t | 0, -1), TELAS); }
    } catch (e) {}
  }
  function limpar() { try { localStorage.removeItem(CHAVE); } catch (e) {} }

  function respondidas() { return estado.resp.filter(function (r) { return r !== null; }).length; }
  function bloco(tela) { return Math.floor((tela * POR_TELA) / 20); }

  function atualizarTopo() {
    var n = respondidas();
    barra.hidden = estado.tela < 0 || estado.tela >= TELAS;
    fill.style.width = (n / C.QTD_PERGUNTAS * 100) + '%';
    if (estado.compartilhado) status.textContent = 'Resultado compartilhado';
    else if (estado.tela >= 0 && estado.tela < TELAS) status.textContent = n + ' de ' + C.QTD_PERGUNTAS + ' respondidas';
    else status.textContent = '';
  }

  function ir(tela) {
    estado.tela = tela; estado.confirmaRefazer = false;
    if (!estado.compartilhado) salvar();
    desenhar();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function primeiraIncompleta() {
    for (var t = 0; t < TELAS; t++) if (faltantes(t).length) return t;
    return TELAS;
  }

  function faltantes(t) {
    var f = [];
    for (var i = t * POR_TELA; i < (t + 1) * POR_TELA; i++) if (estado.resp[i] === null) f.push(i);
    return f;
  }

  function telaInicio() {
    var n = respondidas();
    var retomar = n > 0 && n < C.QTD_PERGUNTAS;
    app.innerHTML =
      '<h1>Descubra seus dons espirituais</h1>' +
      '<p class="muted">Este teste ajuda a encontrar o seu lugar de atuação no corpo de Cristo. São ' + C.QTD_PERGUNTAS + ' afirmações em ' + TELAS + ' telas curtas, e leva cerca de 15 minutos.</p>' +
      '<div class="card"><ul class="dicas">' +
      '<li>Responda com sinceridade, pensando em quem você é hoje, não em quem gostaria de ser.</li>' +
      '<li>Em cada afirmação escolha de <b>4</b> (mais forte) a <b>0</b> (nada). A escala aparece no topo de cada tela.</li>' +
      '<li>Se em alguma área você não tem nenhuma experiência, marque <b>0</b>.</li>' +
      '<li>Suas respostas ficam só neste aparelho. Se fechar a página, você continua de onde parou.</li></ul>' +
      '<div class="acoes">' +
      (retomar
        ? '<button class="btn" data-a="continuar">Continuar (' + n + ' de ' + C.QTD_PERGUNTAS + ')</button><button class="btn sec" data-a="recomecar">Recomeçar</button>'
        : '<button class="btn" data-a="comecar">Começar o teste</button>') +
      '</div></div>' +
      '<p class="nota">O teste não é conclusivo: é uma ferramenta de apoio. O resultado pode mudar com o tempo e não deve limitar o seu serviço, porque a igreja também precisa de quem se disponha a novas tarefas.</p>';
  }

  function telaPerguntas() {
    var t = estado.tela, b = bloco(t), ini = t * POR_TELA, esc = T.escalas[b];
    var h = '<p class="muted" style="margin:0 0 4px">Parte ' + (t + 1) + ' de ' + TELAS + '</p>' +
      '<div class="card"><p class="enunc">' + T.enunciados[b] + '</p><ul class="legenda">';
    for (var k = 0; k < 5; k++) h += '<li><b>' + (4 - k) + '</b>' + esc[k] + '</li>';
    h += '</ul></div>';
    for (var i = ini; i < ini + POR_TELA; i++) {
      var v = estado.resp[i];
      h += '<div class="q" id="q' + i + '"><p class="txt"><span class="num">' + (i + 1) + '.</span>' + (b === 3 ? '' : '… ') + T.perguntas[i] + '</p>' +
        '<fieldset class="ops"><legend>Resposta da afirmação ' + (i + 1) + '</legend>';
      for (var s = 4; s >= 0; s--) {
        h += '<div class="op"><input type="radio" name="p' + i + '" id="p' + i + '_' + s + '" value="' + s + '"' + (v === s ? ' checked' : '') +
          ' aria-label="' + s + ' - ' + esc[4 - s] + '"><label for="p' + i + '_' + s + '">' + s + '</label></div>';
      }
      h += '</fieldset><p class="escolhida" id="e' + i + '">' + (v === null ? '' : esc[4 - v]) + '</p></div>';
    }
    h += '<p class="aviso" id="aviso" hidden>Faltam respostas nas afirmações destacadas.</p>' +
      '<div class="acoes"><button class="btn sec" data-a="voltar">' + (t === 0 ? 'Início' : 'Voltar') + '</button><span class="esp"></span>' +
      '<button class="btn" data-a="avancar">' + (t === TELAS - 1 ? 'Ver resultado' : 'Avançar') + '</button></div>';
    app.innerHTML = h;
  }

  function telaResultado() {
    var soma = C.pontuar(estado.resp), ord = C.ordenar(soma), top = ord.slice(0, 3);
    var empate = ord.slice(3).filter(function (o) { return o.pontos === top[2].pontos; });
    var h = '<h1>' + (estado.compartilhado ? 'Resultado do teste' : 'Seu resultado') + '</h1>' +
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
    h += '<div class="card"><h2>Todos os dons</h2><ol class="rank">';
    ord.forEach(function (o, i) {
      h += '<li class="' + (i < 3 ? 'top' : '') + '"><span>' + T.dons[o.dom].nome + '</span><span class="bar"><i style="width:' + (o.pontos / C.MAX_POR_DOM * 100) + '%"></i></span><span class="v">' + o.pontos + '</span></li>';
    });
    h += '</ol></div>' +
      '<p class="nota"><b>Lembre-se:</b> o teste não é conclusivo. Ele é uma ferramenta de apoio para encontrar o lugar de atuação no corpo de Cristo. O resultado pode mudar com o tempo, conforme a pessoa serve e conforme as necessidades da igreja, e não deve limitar a atuação. Converse sobre ele com o líder da célula.</p>' +
      '<div class="acoes"><button class="btn" data-a="copiar">Copiar resultado</button>' +
      (navigator.share ? '<button class="btn sec" data-a="compartilhar">Compartilhar</button>' : '') +
      (estado.compartilhado
        ? '<button class="btn sec" data-a="meuteste">Fazer meu teste</button>'
        : '<button class="btn sec" data-a="' + (estado.confirmaRefazer ? 'refazer' : 'pedirrefazer') + '">' + (estado.confirmaRefazer ? 'Tem certeza? Apagar e refazer' : 'Refazer o teste') + '</button>' +
          '<button class="btn sec" data-a="revisar">Revisar respostas</button>') +
      '</div><p class="toast" id="toast" role="status"></p>';
    app.innerHTML = h;
  }

  function link() { return location.origin + location.pathname + '#r=' + C.codificar(estado.resp); }
  function resumo() {
    var ord = C.ordenar(C.pontuar(estado.resp)).slice(0, 3);
    return 'Meu teste de dons espirituais:\n' +
      ord.map(function (o, i) { return (i + 1) + '. ' + T.dons[o.dom].nome + ' (' + o.pontos + '/' + C.MAX_POR_DOM + ')'; }).join('\n') + '\n' + link();
  }
  function aviso(msg) { var t = document.getElementById('toast'); if (t) t.textContent = msg; }

  function copiar() {
    var txt = resumo();
    var ok = function () { aviso('Resultado copiado. É só colar no WhatsApp.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(ok, function () { aviso('Não consegui copiar. Use o botão Compartilhar.'); });
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

  app.addEventListener('change', function (e) {
    var m = /^p(\d+)_(\d)$/.exec(e.target.id || '');
    if (!m) return;
    var i = +m[1], v = +m[2], b = bloco(estado.tela);
    estado.resp[i] = v;
    salvar();
    document.getElementById('e' + i).textContent = T.escalas[b][4 - v];
    document.getElementById('q' + i).classList.remove('falta');
    if (!faltantes(estado.tela).length) document.getElementById('aviso').hidden = true;
    atualizarTopo();
  });

  app.addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'); if (!a) return;
    switch (a.dataset.a) {
      case 'comecar': ir(0); break;
      case 'continuar': ir(Math.min(primeiraIncompleta(), TELAS - 1)); break;
      case 'recomecar': estado.resp.fill(null); limpar(); ir(0); break;
      case 'voltar': ir(estado.tela - 1); break;
      case 'avancar':
        var f = faltantes(estado.tela);
        if (f.length) {
          f.forEach(function (i) { document.getElementById('q' + i).classList.add('falta'); });
          document.getElementById('aviso').hidden = false;
          document.getElementById('q' + f[0]).scrollIntoView({ block: 'center', behavior: 'smooth' });
        } else ir(estado.tela + 1);
        break;
      case 'copiar': copiar(); break;
      case 'compartilhar': navigator.share({ title: 'Meu teste de dons', text: resumo() }).catch(function () {}); break;
      case 'pedirrefazer': estado.confirmaRefazer = true; desenhar(); break;
      case 'refazer': estado.resp.fill(null); limpar(); ir(-1); break;
      case 'revisar': ir(TELAS - 1); break;
      case 'meuteste':
        estado.compartilhado = false; estado.resp.fill(null); estado.tela = -1;
        history.replaceState(null, '', location.pathname);
        carregar(); if (estado.tela >= TELAS && !C.completo(estado.resp)) estado.tela = -1;
        desenhar(); window.scrollTo(0, 0);
        break;
    }
  });

  // Link compartilhado (#r=120 dígitos) tem prioridade sobre o que está salvo no aparelho.
  var m = /^#r=([0-4-]{120})$/.exec(location.hash);
  var comp = m && C.decodificar(m[1]);
  if (comp && C.completo(comp)) { estado.resp = comp; estado.tela = TELAS; estado.compartilhado = true; }
  else carregar();
  if (estado.tela >= TELAS && !C.completo(estado.resp)) estado.tela = Math.min(primeiraIncompleta(), TELAS - 1);
  desenhar();
})();
