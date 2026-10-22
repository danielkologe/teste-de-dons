# Teste de Dons Espirituais

Site estático com o teste de dons (120 afirmações, 20 dons) usado na rede de células. Resultado na hora, sem cadastro e sem servidor: as respostas ficam só no aparelho de quem responde.

**Online:** https://testededons.pages.dev

## Fonte
Perguntas e critério de pontuação do anexo "Teste de dons" do *Caderno III – Dons e Espiritualidade*, Primeira Igreja Batista de Curitiba, 2019. O teste não é conclusivo; é uma ferramenta de apoio. Se você representa os detentores do material e quer ajustes ou a remoção, abra uma issue neste repositório.

## Como funciona
- O dom `d` soma as perguntas `d, d+20, d+40, d+60, d+80, d+100` (máximo 24). Lógica em `public/calculo.js`, textos e categorias em `public/dados.js`, interface em `public/app.js` e `public/style.css`.
- O link de resultado compartilhado (`#s=`) leva só os 20 totais, nunca as respostas.
- `public/_headers` define CSP e cabeçalhos de segurança do Cloudflare Pages. Sem estilos inline: a CSP não permite.
- Identidade visual: vitral e dourado da série "Servir"; os dons usam as 4 categorias do material (Ministeriais, Palavra, Sinais, Serviço).

## Estrutura
```
public/        o que vai ao ar (tudo aqui é público)
tests/         testes de cálculo e dados (npm test)
wrangler.toml  projeto Cloudflare Pages: saída = public/
.github/       CI que roda os testes a cada push
```

## Desenvolvimento
```
npm test                              # testes de cálculo e dados
python -m http.server 8765 -d public  # servir localmente
```
Publicação: cada push na `main` é publicado pelo Cloudflare Pages (sem build). Outras branches geram uma prévia em `<branch>.testededons.pages.dev`; mudanças visuais devem passar por ela antes de ir à `main`.
