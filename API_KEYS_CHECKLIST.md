# ✅ CHECKLIST - Obtention des Clés API

## 📋 Instructions Rapides

Cochez au fur et à mesure :

---

## 1️⃣ DeepSeek (OBLIGATOIRE)

**Temps** : 5 minutes

### Étapes :
- [ ] Aller sur https://platform.deepseek.com/
- [ ] Créer un compte (email + mot de passe)
- [ ] Vérifier l'email
- [ ] Se connecter
- [ ] Aller dans "API Keys" (menu de gauche)
- [ ] Cliquer sur "Create API Key"
- [ ] Donner un nom : "SamaSante"
- [ ] Copier la clé (commence par `sk-`)

### Où la mettre :
Ouvrir `.env.local` et remplacer :
```bash
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```
par :
```bash
DEEPSEEK_API_KEY=sk-VOTRE-VRAIE-CLE-ICI
```

### ✅ Vérification :
La clé doit commencer par `sk-` et faire environ 50 caractères.

---

## 2️⃣ Supabase (OBLIGATOIRE)

**Temps** : 5 minutes

### Étapes :
- [ ] Aller sur https://supabase.com/
- [ ] Créer un compte (GitHub recommandé, ou email)
- [ ] Cliquer sur "New Project"
- [ ] Remplir :
  - Name : `samasante`
  - Database Password : (choisir un mot de passe fort et le noter)
  - Region : `West EU (Ireland)` ou le plus proche
- [ ] Cliquer sur "Create new project"
- [ ] Attendre 2-3 minutes (le projet se crée)
- [ ] Une fois créé, aller dans Settings > API
- [ ] Copier :
  - **Project URL** (section "Project URL")
  - **anon public** key (section "Project API keys")

### Où les mettre :
Ouvrir `.env.local` et remplacer :
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
par :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.VOTRE-CLE-ICI
```

### ✅ Vérification :
- L'URL doit commencer par `https://` et finir par `.supabase.co`
- La clé doit commencer par `eyJ` et faire environ 200 caractères

---

## 3️⃣ Mapbox (OPTIONNEL)

**Temps** : 3 minutes

### Étapes :
- [ ] Aller sur https://account.mapbox.com/
- [ ] Créer un compte
- [ ] Aller dans "Access tokens"
- [ ] Copier le "Default public token" (commence par `pk.`)

### Où le mettre :
Ouvrir `.env.local` et remplacer :
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
```
par :
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.VOTRE-TOKEN-ICI
```

### ✅ Vérification :
Le token doit commencer par `pk.` et faire environ 100 caractères.

### 📝 Note :
Si vous ne configurez pas Mapbox, l'app utilisera des données mockées pour la géolocalisation.

---

## 4️⃣ Twilio (OPTIONNEL)

**Temps** : 5 minutes

### Étapes :
- [ ] Aller sur https://console.twilio.com/
- [ ] Créer un compte
- [ ] Vérifier votre numéro de téléphone
- [ ] Aller dans "Phone Numbers" > "Buy a number"
- [ ] Choisir un numéro sénégalais (+221) si disponible
- [ ] Aller dans "Account" > "API keys & tokens"
- [ ] Copier :
  - Account SID
  - Auth Token
  - Phone Number (le numéro acheté)

### Où les mettre :
Ouvrir `.env.local` et remplacer :
```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=your-twilio-phone-number-here
```
par :
```bash
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_PHONE_NUMBER=+221XXXXXXXXX
```

### ✅ Vérification :
- Account SID commence par `AC`
- Auth Token fait 32 caractères
- Phone Number commence par `+221`

### 📝 Note :
Si vous ne configurez pas Twilio, les SMS ne seront pas envoyés (juste loggés).

---

## ✅ VÉRIFICATION FINALE

### Votre `.env.local` doit ressembler à :

```bash
# OBLIGATOIRE
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=chat
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxx

# OPTIONNEL
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+221xxxxxxxxx

# DÉJÀ CONFIGURÉ
ENCRYPTION_KEY=b61e4da371fd0a6a68486f7798440d80b7a4b533ade61ba9706f4cf9aa68e8a3
ALLOWED_ORIGINS=http://localhost:9002,https://samasante.ai
```

---

## 🚀 PRÊT À TESTER

Une fois les clés configurées :

```bash
# Lancer l'application
npm run dev

# Ouvrir dans le navigateur
# http://localhost:9002
```

---

## 💰 COÛTS ESTIMÉS

| Service | Coût | Limite Gratuite |
|---------|------|-----------------|
| DeepSeek | $0.14/1M tokens | $5 de crédit initial |
| Supabase | Gratuit | 500MB |
| Mapbox | Gratuit | 50k requêtes/mois |
| Twilio | $0.05/SMS | $15 de crédit initial |

**Total pour débuter** : GRATUIT (avec les crédits initiaux)

---

## 🐛 Problèmes Courants

### "Invalid API key"
→ Vérifiez que vous avez bien copié la clé complète
→ Pas d'espaces avant/après la clé

### "Project not found"
→ Attendez que le projet Supabase soit complètement créé (2-3 min)
→ Vérifiez l'URL

### "Rate limit exceeded"
→ Vous avez dépassé les 7 requêtes/jour
→ Attendez 24h ou testez avec un autre appareil

---

**Temps total** : 15-20 minutes
**Difficulté** : Facile
**Coût** : Gratuit pour commencer
