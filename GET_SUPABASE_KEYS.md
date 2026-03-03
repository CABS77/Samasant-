# 🔑 Récupérer vos Clés Supabase

Votre projet Supabase : `ireuysbpywfkkzurycbg`

## 📋 ÉTAPES POUR RÉCUPÉRER LES CLÉS

### 1. Aller sur votre projet Supabase

**URL directe** : https://supabase.com/dashboard/project/ireuysbpywfkkzurycbg

Ou :
- Aller sur https://supabase.com/dashboard
- Cliquer sur votre projet

---

### 2. Aller dans Settings > API

Dans le menu de gauche :
1. Cliquer sur l'icône ⚙️ **Settings** (en bas)
2. Cliquer sur **API**

---

### 3. Copier les deux valeurs

Vous verrez deux sections importantes :

#### A. Project URL
```
Configuration > URL
```
Copier la valeur qui ressemble à :
```
https://ireuysbpywfkkzurycbg.supabase.co
```

#### B. API Keys > anon public
```
Project API keys > anon public
```
Copier la longue clé qui commence par `eyJ...`

---

### 4. Mettre dans `.env.local`

Ouvrir le fichier `.env.local` et remplacer :

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

Par :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ireuysbpywfkkzurycbg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.VOTRE_CLE_ICI
```

---

## ✅ VÉRIFICATION

Votre `.env.local` devrait maintenant avoir :

```bash
# ✅ DeepSeek configuré
DEEPSEEK_API_KEY=sk-1ecfd8aea801465cacc49a050e8afaed
DEEPSEEK_MODEL=chat

# ✅ Supabase à configurer
NEXT_PUBLIC_SUPABASE_URL=https://ireuysbpywfkkzurycbg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (votre clé)

# ✅ Chiffrement déjà configuré
ENCRYPTION_KEY=b61e4da371fd0a6a68486f7798440d80b7a4b533ade61ba9706f4cf9aa68e8a3
```

---

## 🚀 ENSUITE : Tester l'application

```bash
npm run dev
```

Ouvrir http://localhost:9002 et tester !

---

## 🐛 Si vous ne trouvez pas les clés

1. Assurez-vous d'être connecté à Supabase
2. Vérifiez que le projet est bien créé (pas en cours de création)
3. Allez dans Settings > API (pas dans Settings > General)

---

**Besoin d'aide ?** Dites-moi si vous trouvez les clés ou si vous avez besoin de plus de détails !
