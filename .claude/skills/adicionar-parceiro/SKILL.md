---
name: adicionar-parceiro
description: Adiciona um parceiro ao mapa Seven Santos, incluindo foto numerada, geocodificação auditável e atualização dos dados.
---

# Adicionar parceiro ao mapa

Use este skill para cadastrar **um** novo parceiro. O mapa deriva os marcadores, popups e a lista lateral de `data/parceiros.json`; não edite `app.js`, `index.html` ou `style.css` para cadastrar dados.

## 1. Coletar os dados

Antes de editar, pergunte ao usuário pelos itens abaixo que ainda não foram fornecidos. Aceite os campos opcionais em branco e registre-os como `null` nos JSONs.

1. Nome completo (obrigatório).
2. Empresa/imobiliária (opcional).
3. CRECI (opcional; pergunte também a UF se ela não estiver no valor).
4. Telefone (opcional).
5. E-mail (opcional).
6. Site (opcional).
7. Instagram (opcional; aceite `@usuario` ou URL).
8. Endereço completo (preferível), ou cidade e UF quando não houver endereço de rua.
9. Caminho local da foto original (obrigatório).

Não invente dados, endereço ou coordenadas. Confirme o endereço que será enviado ao geocodificador quando ele for ambíguo ou incompleto.

## 2. Preparar identificadores e foto

1. Gere o `id` como o nome em minúsculas, sem acentos, com palavras separadas por hífen. Verifique em `data/parceiros.json` e `raw/parceiros-raw.json` que ele é único. Se já existir, pare e peça um identificador distinto.
2. Inspecione `img/` e obtenha o maior prefixo decimal de dois dígitos em arquivos com padrão `NN-*`; o novo prefixo é esse maior valor mais um. **Não** use a contagem de arquivos.
3. Gere o slug do nome com a mesma regra do `id`. Preserve a extensão do arquivo de foto original e copie-o para `img/NN-slug.ext`, com o prefixo calculado. Confirme que a origem existe antes de copiar e que o destino foi criado.
4. Use esse caminho relativo no campo `foto`, por exemplo `img/10-nome-do-parceiro.jpeg`.

## 3. Geocodificar e manter a evidência

1. Faça uma consulta a `https://nominatim.openstreetmap.org/search` usando parâmetros `q=<endereço>`, `format=jsonv2`, `limit=5` e um `User-Agent` identificável para este projeto.
2. Respeite no mínimo um segundo entre requisições ao Nominatim. Não repita consultas desnecessariamente.
3. Salve integralmente a resposta usada em `raw/geocode/NN.json`, com o mesmo número da foto sem zero à esquerda (por exemplo, `10.json`).
4. Leia a resposta e valide que `display_name`, cidade, UF e CEP/logradouro, quando informados, correspondem ao endereço do parceiro. Escolha somente um resultado compatível.
5. Para endereço de rua compatível, use suas coordenadas numéricas e `endereco_precisao: "endereco"`. Se o usuário só informou cidade/UF, consulte o centro municipal, use um resultado coerente e marque `endereco_precisao: "cidade"`.
6. Se nenhum resultado for confiável, não acrescente o parceiro aos arquivos finais: explique a divergência e peça um endereço melhor.

## 4. Atualizar todos os registros

Após obter uma coordenada confiável, acrescente o parceiro ao fim destes arquivos, mantendo a formatação e a ordenação atual:

- `parceiros.txt`: ficha humana com o novo número e os campos recebidos. Deixe campos ausentes vazios, no padrão existente.
- `raw/parceiros-raw.json`: registro pré-normalização. Use `endereco_texto` para a entrada de endereço original e inclua `email` quando fornecido. Preserve telefone, CRECI e Instagram tal como recebidos; `foto` recebe o novo caminho.
- `data/parceiros.json`: registro final com **todos** os campos, nesta ordem:
  `id`, `nome`, `empresa`, `creci`, `telefone`, `email`, `site`, `instagram`, `endereco`, `endereco_precisao`, `lat`, `lon`, `foto`.

Normalize o registro final conforme os exemplos existentes:

- `telefone`: formato brasileiro com `+55`, DDD entre parênteses e hífen no número, quando houver informação suficiente.
- `creci`: inclua a UF e mantenha o sufixo quando o usuário o informou; caso não seja possível determinar a UF, não invente uma.
- `instagram`: converta `@usuario` em `https://www.instagram.com/usuario/`; preserve URLs válidas.
- `endereco`: corrija apenas apresentação/pontuação sem perder a informação original. Mantenha a localização que foi efetivamente geocodificada.
- Campos não fornecidos usam `null`, nunca texto vazio.
- `lat` e `lon` devem ser números JSON, nunca strings.

## 5. Validar e relatar

1. Execute `python3 -m json.tool data/parceiros.json >/dev/null` e também valide `raw/parceiros-raw.json` e o novo `raw/geocode/NN.json`.
2. Verifique que o novo `id` ocorre uma vez em cada JSON aplicável, que o caminho de `foto` existe e que as coordenadas são numéricas.
3. Inicie `python3 -m http.server 8000` na raiz do projeto e teste no navegador: novo pin, item na sidebar, busca pelo nome/empresa, popup com foto e links, e `index.html?p=<id>`.
4. Informe ao usuário o `id`, o arquivo da foto, a precisão da localização e os arquivos atualizados. Se algum teste manual não puder ser executado, declare-o claramente.
