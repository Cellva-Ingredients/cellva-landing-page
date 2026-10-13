# Cellva Landing Page

Landing page da **Cellva Ingredients** para captação de leads. Visitantes conhecem o extrato de polpa de café e pedem contato pelo formulário. Cada envio chega por e-mail e fica registrado numa planilha Google.

- **Site:** HTML, CSS e JavaScript puros (sem framework nem etapa de build)
- **Formulário:** Google Apps Script (sem servidor próprio)
- **Hospedagem:** GitHub Pages, em https://register.cellva.com (domínio na GoDaddy)

## Como funciona

```
Visitante preenche o formulário (site no GitHub Pages)
                  ↓
   Google Apps Script (conta Cellva)
          ↓                 ↓
 grava na planilha    envia e-mail para o comercial
```

O script valida os campos, ignora robôs (campo invisível "honeypot") e limita a 30 envios por hora.

## Estrutura

```
docs/                     → o site (pasta publicada pelo GitHub Pages)
├── index.html
└── assets/
    ├── css/style.css     → estilos e cores da marca
    ├── js/i18n.js        → traduções (EN, PT, DE) e seletor de idioma
    ├── js/main.js        → envio do formulário (contém a URL do Apps Script)
    ├── img/              → logos, favicon, foto do topo e ícones
    └── fonts/            → (opcional) arquivos da fonte Pastiche Grotesk
apps-script/
└── Code.gs               → código que roda no Google Apps Script
```

## Rodar localmente

```bash
cd docs
python3 -m http.server 8000
```

Acesse http://localhost:8000. O formulário funciona localmente e envia leads de verdade.

## Publicação (GitHub Pages)

O GitHub Pages publica automaticamente a pasta `docs/` da branch `main`. Cada push na `main` atualiza o site em 1 a 2 minutos (acompanhe na aba **Actions**).

- **Configuração:** Settings → Pages → Source: *Deploy from a branch* → `main` / `/docs`
- **Domínio:** `register.cellva.com`, por um registro CNAME na GoDaddy apontando para `cellva-ingredients.github.io`. O arquivo `docs/CNAME` guarda esse domínio e não deve ser apagado.
- **Fluxo:** desenvolva na `dev` e leve para a `main` quando estiver pronto para publicar.

## Formulário (Google Apps Script)

O script já está publicado. A URL fica em `docs/assets/js/main.js` (constante `API_URL`).

**Alterar o script** (por exemplo, para trocar o e-mail de destino em `EMAIL_DESTINO`):
1. Edite o código no editor do Apps Script (planilha de leads > **Extensões > Apps Script**) e mantenha `apps-script/Code.gs` igual.
2. **Implantar > Gerenciar implantações > ✏️ editar > Versão: Nova versão > Implantar.**
   Assim a URL continua a mesma e o site não precisa mudar.

<details>
<summary>Configurar do zero (nova planilha ou nova conta)</summary>

1. No Google Drive da Cellva, crie uma planilha (ex.: "Leads landing page").
2. Na planilha: **Extensões > Apps Script**. Cole o conteúdo de `apps-script/Code.gs` e salve.
3. Selecione a função `testarEnvio` e clique em **Executar**. Autorize quando o Google pedir.
   Deve chegar um e-mail de teste e aparecer a aba "Leads".
4. **Implantar > Nova implantação > App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa** (não "Qualquer pessoa na Cellva")
5. Copie a URL terminada em `/exec` e coloque em `API_URL`, no `docs/assets/js/main.js`.
   Use o formato `https://script.google.com/macros/s/.../exec` (sem `/a/macros/cellva.com/`).

</details>

## Idiomas

A página está em **inglês (padrão)**, **português** e **alemão**. O seletor fica no canto superior direito, e a escolha do visitante fica salva no navegador.

- **Editar um texto:** altere em `docs/assets/js/i18n.js`, nos três idiomas. No HTML, cada texto traduzível tem um atributo `data-i18n="chave"`.
- **Novo texto na página:** coloque `data-i18n="nova.chave"` no elemento e adicione a chave em `en`, `pt` e `de`.
- **Leads:** o segmento chega sempre em português no e-mail e na planilha, qualquer que seja o idioma do visitante.

## Identidade visual

Segue o [Brandcenter da Cellva](https://cba.frontify.com/d/8J4fc4g91SS2/identidade-visual). As cores estão como variáveis no início do `style.css`:

| Cor | HEX | Uso no site |
|---|---|---|
| Verde | `#143a33` | textos, botões, contato e rodapé |
| Amarelo | `#fac940` | botões de ação e destaques |
| Offwhite | `#f2f2e9` | fundo |
| Cinza Claro | `#d7dbca` | fundo de seções e bordas |
| Musgo | `#56682b` | detalhes |
| Azul Claro | `#227773` | hover e foco |

- **Fontes:** Rethink Sans (Google Fonts) nos textos. A fonte de títulos da marca, **Pastiche Grotesk**, é licenciada. Para ativá-la, coloque `PasticheGrotesk-Bold.woff2` e `PasticheGrotesk-Medium.woff2` em `docs/assets/fonts/`. Até lá, os títulos usam Rethink Sans.
- **Logo:** assinatura principal (verde) no topo e secundária (amarela) no rodapé, com 160 px de largura (mínimo da marca: 150 px).

## Branches

- `main`: versão publicada
- `dev`: desenvolvimento. Alterações entram em `main` por pull request.
