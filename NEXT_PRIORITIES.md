# 🚀 PROCHAINES PRIORITÉS - SamaSanté AI

Application déployée : https://samasante.vercel.app ✅

---

## 📊 ÉTAT ACTUEL

✅ Application en production
✅ Clés API configurées
✅ Sécurité renforcée (9/10)
✅ Code de qualité (8.5/10)

---

## 🎯 PRIORITÉS IMMÉDIATES

### 🔴 PRIORITÉ 1 : Configurer la Base de Données Supabase (30 min)

**Pourquoi** : Actuellement, les données ne sont pas persistées.

**Actions** :

1. **Aller dans votre projet Supabase** : https://app.supabase.com/
2. **Ouvrir SQL Editor**
3. **Exécuter ce script** :

```sql
-- Table utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table remèdes traditionnels
CREATE TABLE IF NOT EXISTS remedes_traditionnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  symptome TEXT,
  image_url TEXT,
  langue TEXT DEFAULT 'french',
  valide BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table rendez-vous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jefandikukat_id UUID REFERENCES utilisateurs(id),
  doktoor_id UUID,
  date_heure TIMESTAMP,
  statut TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table historiques de chat
CREATE TABLE IF NOT EXISTS historiques_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jefandikukat_id UUID REFERENCES utilisateurs(id),
  message TEXT,
  reponse TEXT,
  langue TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table articles de santé
CREATE TABLE IF NOT EXISTS articles_sante (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  contenu TEXT,
  auteur TEXT,
  langue TEXT DEFAULT 'french',
  publie BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE remedes_traditionnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE historiques_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_sante ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Remèdes publics" ON remedes_traditionnels
  FOR SELECT USING (valide = true);

CREATE POLICY "Articles publics" ON articles_sante
  FOR SELECT USING (publie = true);

-- Insérer quelques remèdes de test
INSERT INTO remedes_traditionnels (nom, description, symptome, langue, valide) VALUES
  ('Tisane de gingembre', 'Faire bouillir du gingembre frais dans de l''eau pendant 10 minutes. Boire chaud avec du miel.', 'mal de tête', 'french', true),
  ('Infusion de feuilles de neem', 'Faire infuser des feuilles de neem séchées. Boire 2 fois par jour.', 'fièvre', 'french', true),
  ('Miel et citron', 'Mélanger du miel avec du jus de citron dans de l''eau tiède.', 'toux', 'french', true);
```

4. **Vérifier** que les tables sont créées (onglet "Table Editor")

**Impact** : Persistance des données, historique des consultations

---

### 🟡 PRIORITÉ 2 : Implémenter Redis pour le Rate Limiting (1h)

**Pourquoi** : Le rate limiting actuel est en mémoire (perdu au redémarrage de Vercel).

**Actions** :

1. **Créer un compte Upstash** (Redis serverless) : https://upstash.com/
2. **Créer une base Redis**
3. **Installer le client** :
```bash
npm install @upstash/redis
```

4. **Créer `src/lib/rateLimitRedis.ts`** :
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimitRedis(
  identifier: string,
  maxRequests: number = 7,
  windowMs: number = 24 * 60 * 60 * 1000
) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  
  // Incrémenter le compteur
  const count = await redis.incr(key);
  
  // Définir l'expiration si c'est la première requête
  if (count === 1) {
    await redis.pexpire(key, windowMs);
  }
  
  const ttl = await redis.pttl(key);
  const resetTime = now + ttl;
  
  return {
    limited: count > maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetTime,
  };
}
```

5. **Mettre à jour `src/app/api/health-assessment/route.ts`** :
```typescript
import { checkRateLimitRedis } from '@/lib/rateLimitRedis';
// Remplacer checkRateLimit par checkRateLimitRedis
```

6. **Ajouter dans Vercel** :
   - Settings > Environment Variables
   - Ajouter `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

**Impact** : Rate limiting persistant, scalable

---

### 🟢 PRIORITÉ 3 : Configurer le Monitoring avec Sentry (30 min)

**Pourquoi** : Détecter et corriger les erreurs en production.

**Actions** :

1. **Créer un compte Sentry** : https://sentry.io/
2. **Installer Sentry** :
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

3. **Suivre les instructions** du wizard
4. **Tester** en provoquant une erreur volontaire
5. **Vérifier** dans le dashboard Sentry

**Impact** : Détection proactive des bugs, meilleure stabilité

---

### 🟢 PRIORITÉ 4 : Ajouter l'Authentification (2-3h)

**Pourquoi** : Personnaliser l'expérience, sauvegarder l'historique.

**Option A : NextAuth.js** (Recommandé)

```bash
npm install next-auth
```

**Option B : Supabase Auth** (Plus simple)

```typescript
import { createClient } from '@supabase/supabase-js';

// Déjà configuré, juste activer l'auth
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});
```

**Fonctionnalités à ajouter** :
- Inscription/Connexion
- Profil utilisateur
- Historique des consultations
- Favoris de remèdes

**Impact** : Expérience personnalisée, fidélisation

---

### 🔵 PRIORITÉ 5 : Optimiser les Performances (1-2h)

**Actions** :

1. **Analyser le bundle** :
```bash
npm run build
# Vérifier la taille des chunks
```

2. **Optimiser les images** :
   - Remplacer `<img>` par `<Image>` de Next.js
   - Utiliser WebP/AVIF

3. **Lazy loading** :
```typescript
const Map = dynamic(() => import('@/components/map'), { ssr: false });
```

4. **Réduire les dépendances** :
```bash
npm install -g depcheck
depcheck
```

**Objectif** : Bundle < 500KB, Lighthouse > 90

---

### 🔵 PRIORITÉ 6 : Compléter les Traductions (2-3h)

**Pourquoi** : Accessibilité pour les utilisateurs wolof/pulaar.

**Actions** :

1. **Créer les fichiers de traduction** :
   - `src/locales/wo/translation.json` (wolof)
   - `src/locales/ff/translation.json` (pulaar)

2. **Traduire les clés principales** :
```json
{
  "welcome": "Dalal ak jamm",
  "symptoms": "Malaaka",
  "chat": "Waxtaan",
  ...
}
```

3. **Tester** le changement de langue

**Impact** : Inclusivité, meilleure adoption

---

## 📊 ROADMAP COMPLÈTE

### Cette Semaine
- [x] Déploiement en production ✅
- [ ] Configuration base de données Supabase
- [ ] Redis pour rate limiting
- [ ] Monitoring Sentry

### Ce Mois
- [ ] Authentification utilisateur
- [ ] Optimisation performances
- [ ] Traductions complètes
- [ ] Tests E2E

### Ce Trimestre
- [ ] Programme beta testeurs au Sénégal
- [ ] Partenariats avec cliniques
- [ ] Application mobile (React Native)
- [ ] Certification sécurité

---

## 🎯 RECOMMANDATION

**Commencez par les Priorités 1-3** (2-3 heures) :
1. Base de données Supabase
2. Redis pour rate limiting
3. Monitoring Sentry

Ces 3 améliorations auront le plus grand impact sur la stabilité et la scalabilité.

---

## 📈 MÉTRIQUES À SUIVRE

### Actuellement
- Utilisateurs : ?
- Requêtes/jour : ?
- Taux d'erreur : ?
- Temps de réponse : ?

### Objectifs
- 1000 utilisateurs/mois
- < 1% taux d'erreur
- < 3s temps de réponse
- > 90 Lighthouse score

---

## 💡 IDÉES FUTURES

- Notifications push pour rappels
- Chatbot vocal (reconnaissance vocale)
- Intégration WhatsApp
- Dashboard admin
- Analytics avancées
- Programme de fidélité
- Marketplace de remèdes validés

---

**Prochaine action** : Configurer la base de données Supabase (30 min)

Voulez-vous que je vous aide avec une priorité spécifique ?
