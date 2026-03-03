# 🚀 Guide de Configuration - SamaSanté AI

## 📋 Prérequis

- Node.js >= 18.x
- npm ou yarn
- Compte DeepSeek (pour l'IA)
- Compte Supabase (pour la base de données)
- Compte Mapbox (optionnel, pour la géolocalisation)
- Compte Twilio (optionnel, pour les SMS)

---

## 🔧 Installation

### 1. Cloner le projet et installer les dépendances

```bash
git clone https://github.com/CABS77/Samasant-.git
cd Samasant-
npm install
```

### 2. Configurer les variables d'environnement

Copiez le fichier d'exemple et remplissez avec vos vraies clés :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos credentials :

```bash
# ============================================
# CONFIGURATION IA - DEEPSEEK (REQUIS)
# ============================================
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_MODEL=chat  # ou 'reasoner' pour plus de précision

# ============================================
# CONFIGURATION SUPABASE (REQUIS)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ============================================
# CONFIGURATION MAPBOX (OPTIONNEL)
# ============================================
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ4eHh4eHh4In0.xxxxx

# ============================================
# CONFIGURATION TWILIO SMS (OPTIONNEL)
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+221xxxxxxxxx
```

---

## 🔑 Obtenir les Clés API

### DeepSeek (REQUIS)

1. Créez un compte sur [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Allez dans "API Keys"
3. Créez une nouvelle clé API
4. Copiez la clé dans `DEEPSEEK_API_KEY`

**Coûts** :
- Chat model : ~$0.14 par 1M tokens (rapide)
- Reasoner model : ~$2.19 par 1M tokens (plus précis)

### Supabase (REQUIS)

1. Créez un compte sur [https://supabase.com/](https://supabase.com/)
2. Créez un nouveau projet
3. Allez dans Settings > API
4. Copiez :
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Coûts** : Gratuit jusqu'à 500MB, puis $25/mois

### Mapbox (OPTIONNEL)

1. Créez un compte sur [https://account.mapbox.com/](https://account.mapbox.com/)
2. Allez dans "Access tokens"
3. Créez un nouveau token avec les scopes :
   - `styles:read`
   - `geocoding:read`
4. Copiez le token dans `NEXT_PUBLIC_MAPBOX_TOKEN`

**Coûts** : 50,000 requêtes gratuites/mois

### Twilio (OPTIONNEL)

1. Créez un compte sur [https://console.twilio.com/](https://console.twilio.com/)
2. Obtenez un numéro de téléphone Twilio
3. Copiez vos credentials :
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - Phone Number → `TWILIO_PHONE_NUMBER`

**Coûts** : ~$0.05 par SMS

---

## 🗄️ Configuration de la Base de Données

### Créer les tables Supabase

Connectez-vous à votre projet Supabase et exécutez ces requêtes SQL :

```sql
-- Table utilisateurs
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table remèdes traditionnels
CREATE TABLE remedes_traditionnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  symptome TEXT,
  image_url TEXT,
  langue TEXT DEFAULT 'french',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table rendez-vous
CREATE TABLE rendez_vous (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jefandikukat_id UUID REFERENCES utilisateurs(id),
  doktoor_id UUID,
  date_heure TIMESTAMP,
  statut TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table historiques de chat
CREATE TABLE historiques_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jefandikukat_id UUID REFERENCES utilisateurs(id),
  message TEXT,
  reponse TEXT,
  langue TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table articles de santé
CREATE TABLE articles_sante (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  contenu TEXT,
  auteur TEXT,
  langue TEXT DEFAULT 'french',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Appliquer les règles de sécurité

Les règles Firestore sont déjà définies dans `firestore.rules`. Pour Supabase, configurez les Row Level Security (RLS) :

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE remedes_traditionnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE historiques_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_sante ENABLE ROW LEVEL SECURITY;

-- Politique pour les remèdes (lecture publique)
CREATE POLICY "Remèdes publics" ON remedes_traditionnels
  FOR SELECT USING (true);

-- Politique pour les articles (lecture publique)
CREATE POLICY "Articles publics" ON articles_sante
  FOR SELECT USING (true);
```

---

## ✅ Vérification de l'Installation

### 1. Vérifier TypeScript

```bash
npm run typecheck
```

Devrait afficher : ✅ Aucune erreur

### 2. Vérifier ESLint

```bash
npm run lint
```

Devrait afficher : ✅ Aucune erreur critique

### 3. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:9002](http://localhost:9002)

### 4. Tester l'IA

1. Allez sur la page `/app`
2. Tapez un symptôme : "J'ai mal à la tête"
3. Cliquez sur "Répondre en français"
4. Vérifiez que l'IA répond correctement

---

## 🧪 Tests

### Lancer les tests unitaires

```bash
npm run test
```

### Lancer les tests avec couverture

```bash
npm run test:coverage
```

### Lancer les tests en mode watch

```bash
npm run test:watch
```

---

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

1. Installez Vercel CLI :
```bash
npm i -g vercel
```

2. Déployez :
```bash
vercel
```

3. Configurez les variables d'environnement dans le dashboard Vercel

### Build de production local

```bash
npm run build
npm run start
```

---

## 🔒 Sécurité

### Checklist avant production

- [ ] Toutes les clés API sont dans `.env.local` (pas dans le code)
- [ ] `.env.local` est dans `.gitignore`
- [ ] Les règles Supabase RLS sont activées
- [ ] Rate limiting est configuré côté serveur
- [ ] CORS est configuré correctement
- [ ] CSP headers sont définis
- [ ] Authentification utilisateur est implémentée

---

## 📊 Monitoring

### Ajouter Sentry (Recommandé)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configurer Vercel Analytics

Les analytics Vercel sont déjà intégrés. Activez-les dans le dashboard Vercel.

---

## 🐛 Dépannage

### Erreur : "DEEPSEEK_API_KEY is not defined"

→ Vérifiez que `.env.local` contient bien `DEEPSEEK_API_KEY=...`

### Erreur : "Supabase environment variables are not set"

→ Vérifiez que `.env.local` contient `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Les dépendances ne s'installent pas

```bash
rm -rf node_modules package-lock.json
npm install
```

### Le Service Worker ne fonctionne pas

→ Le Service Worker ne fonctionne qu'en production. Lancez :
```bash
npm run build
npm run start
```

---

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation DeepSeek](https://platform.deepseek.com/docs)
- [Documentation Mapbox](https://docs.mapbox.com/)
- [Documentation Twilio](https://www.twilio.com/docs)

---

## 💬 Support

Pour toute question :
- GitHub Issues : [https://github.com/CABS77/Samasant-/issues](https://github.com/CABS77/Samasant-/issues)
- Email : contact@samasante.com

---

**Bon développement ! 🎉**
