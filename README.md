# Mapa de Parceiros — Seven Santos

Mapa interativo (Leaflet + OpenStreetMap, sem chave de API) com os parceiros extraídos
da conversa de WhatsApp. Cada pin abre um popup com foto, dados e links do parceiro.
Visual segue a identidade da Seven Santos (preto `#030303` + dourado `#c59b27`, extraídos
de https://7santos.com.br/), com o monograma da marca usado no pino e no cabeçalho.

## Funcionalidades

- Pino customizado (monograma dourado da Seven Santos) para todos os parceiros.
- Popup ao clicar: foto, empresa, endereço, CRECI, telefone/e-mail clicáveis, botões de
  Site e Instagram.
- Sidebar com busca (por nome ou empresa, ignora acento/maiúscula) e lista completa dos
  parceiros — mostra quantos e quais existem.
- Clicar num item da lista dá zoom no local dele e abre o popup.
- Botão **"Ver todos"** (canto superior direito do mapa) volta a visão inicial com todos
  os pinos centralizados.
- Link direto: `index.html?p=<id-do-parceiro>` abre a página já com o popup daquele
  parceiro aberto (ex: `?p=gabriel-barretti`, ids em `data/parceiros.json`).

## Como abrir

`fetch()` não funciona abrindo `index.html` direto (`file://`) por causa de CORS. Rode um
servidor local simples na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## Estrutura

- `chat.txt` / `chat.md` — export original do WhatsApp (referência, não usado pela página)
- `parceiros.txt` — lista revisada manualmente por Bruno com os dados de cada parceiro
- `img/NN-nome.jpeg` — fotos dos parceiros, numeradas conforme `parceiros.txt`
- `raw/parceiros-raw.json` — dados extraídos antes da geocodificação
- `raw/geocode/*.json` — respostas brutas da API Nominatim usadas na geocodificação
- `data/parceiros.json` — **dado final** consumido pela página (nome, empresa, creci,
  telefone, site, instagram, endereço, lat/lon, foto)
- `assets/seven-santos-mark.png` — monograma da Seven Santos (fundo removido), usado no
  pino do mapa e no cabeçalho; `assets/seven-santos-logo-completo.jpg` — logo original
  (extraída de 7santos.com.br) mantida de referência
- `index.html`, `app.js`, `style.css` — a página do mapa

## Atualizando a lista de parceiros

1. Edite `parceiros.txt` (ou peça pra reprocessar a partir do chat).
2. Geocodifique endereços novos via Nominatim (`https://nominatim.openstreetmap.org/search`,
   respeitando o limite de 1 requisição/segundo e enviando um `User-Agent` identificável).
3. Atualize `data/parceiros.json` com os campos: `id, nome, empresa, creci, telefone,
   email, site, instagram, endereco, endereco_precisao ("endereco" ou "cidade"), lat, lon, foto`.
4. Recarregue a página — não precisa de build.

## Observações sobre os dados

- **Gabriel Navarro**: sem endereço de rua disponível — pin fica no centro de João Pessoa - PB
  (`endereco_precisao: "cidade"`, sinalizado no popup).
- Todos os demais parceiros têm endereço de rua geocodificado com precisão.

## TODO LIST

- Centralizar o popup no meio da tela horizontalmente
- Se tem dois pinos com o mesmo endereço, tem que ter maneira de ver mais que um popup, talvez com setas
