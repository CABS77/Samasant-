# 🔑 Configuration Supabase - SamaSanté

## Votre Projet
- **Project ID** : `yenkbjxirxahoiliqanv`
- **Project URL** : `https://yenkbjxirxahoiliqanv.supabase.co`

---

## 📋 RÉCUPÉRER LA CLÉ ANON

### Accès direct
**URL** : https://supabase.com/dashboard/project/yenkbjxirxahoiliqanv/settings/api

### Étapes
1. Aller sur le lien ci-dessus
2. Chercher la section **"Project API keys"**
3. Copier la clé **"anon public"** (commence par `eyJ...`)

---

## ✏️ CONFIGURATION `.env.local`

Remplacer dans votre `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Par :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yenkbjxirxahoiliqanv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[COPIER LA CLÉ DEPUIS LE DASHBOARD]
```

---

## ✅ VÉRIFICATION FINALE

Votre `.env.local` complet devrait être :

```bash
# IA - DeepSeek
DEEPSEEK_API_KEY=sk-votre-cle-deepseek
DEEPSEEK_MODEL=chat

# Base de données - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yenkbjxirxahoiliqanv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[VOTRE CLÉ ANON]

# Sécurité
ENCRYPTION_KEY=b61e4da371fd0a6a68486f7798440d80b7a4b533ade61ba9706f4cf9aa68e8a3
ALLOWED_ORIGINS=http://localhost:9002,https://samasante.ai

# Optimisations
NEXT_WEBPACK_USEPOLLING=false
NEXT_TELEMETRY_DISABLED=1
FAST_REFRESH=true
NODE_OPTIONS="--max_old_space_size=4096"
NODE_ENV=development
```

---

## 🚀 LANCER L'APPLICATION

```bash
npm run dev
```

Ouvrir : http://localhost:9002

---

## 🧪 TESTER LE CHAT IA

1. Aller sur `/app`
2. Taper : "J'ai mal à la tête depuis 2 jours"
3. Cliquer sur "Répondre en français"
4. Attendre la réponse (5-10 secondes)

---

## ✅ SI TOUT FONCTIONNE

Vous devriez voir :
- ✅ L'IA répond avec une évaluation
- ✅ Des remèdes traditionnels suggérés
- ✅ Des prochaines étapes recommandées

---

## 🐛 SI ERREUR

Vérifier dans la console du navigateur (F12) et me dire l'erreur.
