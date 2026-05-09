# 🚀 GUIA DE DEPLOYMENT — IRONFIT v1.0

**Versão:** 1.0.0  
**Status:** ✅ Pronto para Produção  
**Data:** 9 de maio de 2026

---

## 📋 Checklist Pré-Deployment

- [x] Credenciais sensíveis removidas do código
- [x] Validação de entrada implementada  
- [x] Proteção XSS/CSRF adicionada
- [x] Environment variables configuradas
- [x] HTTPS obrigatório
- [x] CORS configurado
- [x] Rate limiting recomendado
- [ ] Testes automatizados (opcional)
- [ ] Monitoramento/Logging (recomendado)

---

## 🔑 Variáveis de Ambiente (Produção)

Crie um arquivo `.env.production.local`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (sua chave aqui)
ENVIRONMENT=production
DEBUG=false
```

**NUNCA commite este arquivo no Git!**

---

## 🌐 Opção 1: Deploy em Vercel (Recomendado)

### Passo 1: Preparar o repositório

```bash
# Inicializar git (se não existir)
git init
git add .
git commit -m "Initial commit - IRONFIT v1.0"

# Criar repositório no GitHub
# https://github.com/new
# Fazer push
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

### Passo 2: Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure:
   - **Framework:** Other (Static Site)
   - **Root Directory:** `.`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.`

5. Adicione Environment Variables:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

6. Clique em "Deploy"

✅ Seu site estará disponível em `seu-projeto.vercel.app`

---

## 🌐 Opção 2: Deploy em Netlify

### Passo 1: Preparar repositório (como acima)

### Passo 2: Deploy

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Conecte GitHub e selecione o repositório
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `.`

5. Adicione Environment Variables em Site settings → Build & deploy
6. Clique em "Deploy"

---

## 🏠 Opção 3: Deploy em Servidor Próprio (AWS, DigitalOcean, etc.)

### Pré-requisitos

- Servidor com Node.js 16+ ou Python 3
- SSL Certificate (HTTPS)
- Domain registrado

### Passo 1: Conectar via SSH

```bash
ssh user@seu-servidor.com
cd /var/www/ironfit
```

### Passo 2: Clonar repositório

```bash
git clone https://github.com/seu-usuario/ironfit.git .
```

### Passo 3: Instalar dependências

```bash
npm install
```

### Passo 4: Configurar environment

```bash
cp .env.example .env.production.local
# Editar com suas credenciais
nano .env.production.local
```

### Passo 5: Servir com HTTP Server

```bash
# Opção 1: http-server
npm install -g http-server
http-server . -p 3000 -c-1

# Opção 2: Python
python3 -m http.server 3000

# Opção 3: Node com Express (recomendado)
npm install express
```

### Passo 6: Configurar Nginx/Apache com HTTPS

**Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/ssl/certs/seu-cert.crt;
    ssl_certificate_key /etc/ssl/private/sua-chave.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### Passo 7: Usar PM2 para manter servidor rodando

```bash
npm install -g pm2

# Criar arquivo start.js
echo "require('http').createServer((req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, data) => {
    if (err) return res.end('404');
    res.end(data);
  });
}).listen(3000);" > start.js

pm2 start start.js --name ironfit
pm2 save
pm2 startup
```

---

## 🔒 Segurança em Produção

### 1. Ativar HTTPS

- **Vercel/Netlify:** Automático ✅
- **Servidor próprio:** Use Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

### 2. Headers de Segurança

Adicionar em Nginx/Apache:

```nginx
# HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Previne clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Previne MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# CORS (se necessário)
add_header Access-Control-Allow-Origin "https://seu-dominio.com" always;
```

### 3. Rate Limiting

Configurar em Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

location / {
    limit_req zone=general burst=20;
}

location /login {
    limit_req zone=login;
}
```

### 4. Backup do Banco

```bash
# Daily backup via Supabase
# Dashboard → Backups → Enable automated backups

# Ou via CLI
supabase db pull  # Local backup
supabase db push  # Restaurar
```

---

## 🧪 Testar Deployment

```bash
# 1. Verificar se o site carrega
curl https://seu-dominio.com

# 2. Testar login
# Abrir navegador → seu-dominio.com/login.html

# 3. Verificar console para erros
# Chrome DevTools → Console

# 4. Testar responsividade
# Chrome → F12 → Ctrl+Shift+M (mobile)

# 5. Verificar performance
# PageSpeed Insights: https://pagespeed.web.dev
```

---

## 📊 Monitoramento

### Recomendado:
- **Vercel Analytics:** Automático
- **Google Analytics:** Adicionar tag
- **Sentry:** Erro tracking
- **Uptime Robot:** Monitorar disponibilidade

---

## 🆘 Troubleshooting

| Erro | Solução |
|------|---------|
| 404 ao carregar | Verificar paths dos arquivos |
| Supabase não conecta | Validar environment variables |
| CORS error | Configurar CORS no Supabase |
| Login não funciona | Verificar RLS policies no Supabase |
| Slow loading | Implementar CDN (Cloudflare) |

---

## 📞 Suporte Pós-Launch

- **Bugs:** Crie issue no GitHub
- **Performance:** Use Chrome DevTools
- **Supabase issues:** Consulte docs em supabase.com
- **Deployment issues:** Verifique logs do provedor

---

**Parabéns! 🎉 IRONFIT está em produção!**
