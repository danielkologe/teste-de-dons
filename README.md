# Teste de Dons Espirituais

Site estático com o teste de dons (120 afirmações, 20 dons) usado na rede de células. Resultado na hora, sem cadastro e sem servidor: as respostas ficam só no aparelho de quem responde.

**Online:** https://testededons.pages.dev

## Fonte
Perguntas e critério de pontuação do anexo "Teste de dons" do *Caderno III – Dons e Espiritualidade*, Primeira Igreja Batista de Curitiba, 2019. O teste não é conclusivo; é uma ferramenta de apoio. Se você representa os detentores do material e quer ajustes ou a remoção, abra uma issue neste repositório.

## Como funciona
- O dom `d` soma as perguntas `d, d+20, d+40, d+60, d+80, d+100` (máximo 24). Lógica em `calculo.js`, textos em `dados.js`, interface em `app.js` e `style.css`.
- O link de resultado compartilhado (`#s=`) leva só os 20 totais, nunca as respostas.
- `_headers` define CSP e cabeçalhos de segurança do Cloudflare Pages.

## Desenvolvimento
```
npm test                       # testes de cálculo e dados
python -m http.server 8765     # servir localmente
```
Publicação: cada push na `main` é publicado automaticamente pelo Cloudflare Pages (sem build, raiz do repositório).
