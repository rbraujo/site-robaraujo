# Rob Araujo — 3D Artist Portfolio

Site estático com Decap CMS, pronto para GitHub + Netlify.

## Estrutura

```
robaraujo-portfolio/
├── index.html              ← Página principal
├── netlify.toml            ← Config Netlify
├── README.md
├── admin/
│   ├── index.html          ← Interface Decap CMS
│   └── config.yml          ← Schema do CMS
├── _data/
│   ├── site.json           ← Config geral (nav, socials, seções, about)
│   └── projects.json       ← Lista de projetos (title, image, category, enabled)
└── assets/
    ├── css/
    │   └── main.css
    ├── js/
    │   └── main.js
    └── images/
        ├── project_1.jpg … project_9.jpg
        ├── favicon.png
        ├── apple-touch-icon.png
        └── social-preview.jpg
```

## Deploy no Netlify

1. **Push para GitHub** — envie esta pasta como repositório
2. **Netlify → New site from Git** — selecione o repositório
3. **Build command:** deixe em branco (site estático)
4. **Publish directory:** `.` (raiz)
5. **Netlify Identity** → habilite em Site Settings → Identity
6. **Git Gateway** → habilite em Identity → Services → Git Gateway
7. Acesse `/admin` para gerenciar projetos e configurações

## Editar conteúdo via CMS

- Acesse `seusite.com/admin`
- Login com Netlify Identity
- **Projetos**: ative/desative, troque imagens, edite títulos e categorias
- **Configurações**: edite links sociais, ative/desative seções, edite o menu

## Adicionar projetos manualmente

Edite `_data/projects.json` e adicione um objeto:

```json
{
  "id": "meu-projeto",
  "title": "Nome do Projeto",
  "category": "print",
  "tag": "3D Print · Sculpture",
  "year": "2024",
  "image": "assets/images/minha-foto.jpg",
  "enabled": true
}
```

Categorias válidas: `"print"` | `"digital"`

## Ativar/desativar seções

Em `_data/site.json`, seção `"sections"`:

```json
"sections": {
  "gallery":  { "enabled": true  },
  "about":    { "enabled": true  },
  "contact":  { "enabled": false }
}
```

## Ativar/desativar itens do menu

Em `_data/site.json`, seção `"nav"`:

```json
"nav": [
  { "label": "Home",     "filter": "all",     "enabled": true  },
  { "label": "3D Print", "filter": "print",   "enabled": true  },
  { "label": "Digital",  "filter": "digital", "enabled": false },
  { "label": "About",    "filter": "about",   "enabled": true  }
]
```
