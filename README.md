# cellva-landing-page
Landing page institucional da Cellva Ingredients

## Estrutura
- `frontend/`: a página (HTML, CSS, JS). É só isso que vai para a hospedagem (GoDaddy).
- `apps-script/Code.gs`: script do Google que recebe o formulário, grava o lead numa planilha e envia por e-mail.

## Configurar o formulário (uma vez)
1. No Google Drive (conta Cellva), crie uma planilha, por exemplo "Leads landing page".
2. Na planilha: **Extensões > Apps Script**. Apague o conteúdo do editor e cole o conteúdo de `apps-script/Code.gs`. Salve.
3. No editor, escolha a função `testarEnvio` e clique em **Executar**. Autorize o acesso quando o Google pedir.
   Deve chegar um e-mail de teste e aparecer uma aba "Leads" na planilha.
4. **Implantar > Nova implantação > tipo "App da Web"**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Copie a URL gerada (termina em `/exec`) e cole em `frontend/assets/js/main.js`, no lugar de `COLE_AQUI_A_URL_DO_APPS_SCRIPT`.

Se alterar o script depois: **Implantar > Gerenciar implantações > editar > Nova versão**, para manter a mesma URL.

## Publicar na GoDaddy
Envie o conteúdo da pasta `frontend/` (index.html e a pasta assets) para a pasta pública do site (`public_html` no cPanel).

## Testar localmente
```bash
cd frontend && python3 -m http.server 8000
```
Acesse http://localhost:8000
