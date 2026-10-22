const fs = require('fs');
const path = require('path');
const C = require('../calculo.js');
const raiz = path.join(__dirname, '..');
const T = new Function('window', fs.readFileSync(path.join(raiz, 'dados.js'), 'utf8') + '; return window.TESTE;')({});

let falhas = 0;
const chk = (ok, msg) => { if (!ok) { falhas++; console.log('FALHA:', msg); } };

// dados
chk(T.perguntas.length === 120 && T.perguntas.every(p => typeof p === 'string' && p.length > 8), '120 perguntas com texto');
chk(T.dons.length === 20 && T.dons.every(d => d.nome && d.desc && d.ref), '20 dons completos');
chk(T.escalas.length === 6 && T.escalas.every(e => e.length === 5), '6 escalas de 5 níveis');
chk(T.enunciados.length === 6, '6 enunciados');

// pontuação
chk(C.pontuar(new Array(120).fill(4)).every(v => v === 24), 'tudo 4 = 24 por dom');
chk(C.pontuar(new Array(120).fill(0)).every(v => v === 0), 'tudo 0 = 0');
const ex = new Array(120).fill(0);
[[0, 4], [20, 2], [40, 0], [60, 1], [80, 2], [100, 4]].forEach(([i, v]) => ex[i] = v);
const s = C.pontuar(ex);
chk(s[0] === 13 && s.slice(1).every(v => v === 0), 'exemplo do material: Administração = 13');
const r2 = new Array(120).fill(0); r2[19] = 3; r2[119] = 2;
chk(C.pontuar(r2)[19] === 5, 'Línguas soma perguntas 20 e 120');

// ordenação e empate
const o = C.ordenar(new Array(20).fill(5));
chk(o[0].dom === 0 && o[19].dom === 19, 'empate mantém a ordem do material');

// respostas salvas
chk(C.decodificar(C.codificar(ex)).join() === ex.join(), 'ida e volta das respostas');
chk(C.decodificar('x') === null && C.decodificar('5'.repeat(120)) === null, 'respostas inválidas rejeitadas');
chk(C.completo(ex) && !C.completo(new Array(120).fill(null)), 'completo');

// link de resultado: só totais
const totais = [0, 1, 9, 10, 24, 13, 7, 8, 20, 11, 12, 14, 15, 16, 17, 18, 19, 21, 22, 23];
const cod = C.codificarPontos(totais);
chk(cod.length === 20 && C.decodificarPontos(cod).join() === totais.join(), 'ida e volta dos totais');
chk(C.decodificarPontos('<script>alert(1)</sc') === null && C.decodificarPontos('z'.repeat(20)) === null && C.decodificarPontos('0'.repeat(19)) === null, 'totais inválidos rejeitados');

console.log(falhas ? falhas + ' falha(s)' : 'TUDO OK');
process.exit(falhas ? 1 : 0);
