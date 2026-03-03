# 🚀 DÉMARRAGE IMMÉDIAT - SamaSanté AI

## ✅ Ce qui est déjà fait
- Installation des dépendances ✅
- Code sécurisé ✅
- Tests qui passent ✅

## 🎯 Ce qu'il faut faire MAINTENANT (30 minutes)

---

## ÉTAPE 1 : Obtenir les Clés API (15 minutes)

### A. DeepSeek (OBLIGATOIRE - 5 min)

1. **Aller sur** : https://platform.deepseek.com/
2. **Créer un compte** (email + mot de passe)
3. **Aller dans "API Keys"**
4. **Cliquer sur "Create API Key"**
5. **Copier la clé** (commence par `sk-`)
6. **Garder la clé** quelque part (vous en aurez besoin à l'étape 2)

💰 **Coût** : ~$0.14 par 1M tokens (très peu cher)
📝 **Note** : Vous pouvez commencer avec $5 de crédit gratuit

---

### B. Supabase (OBLIGATOIRE - 5 min)

1. **Aller sur** : https://supabase.com/
2. **Créer un compte** (GitHub ou email)
3. **Créer un nouveau projet** :
   - Nom : `samasante`
   - Database Password : (choisir un mot de passe fort)
   - Region : `West EU (Ireland)` ou le plus proche
4. **Attendre 2 minutes** que le projet se crée
5. **Aller dans Settings > API**
6. **Copier** :
   - `Project URL` (commence par `https://`)
   - `anon public` key (commence par `eyJ`)

💰 **Coût** : Gratuit jusqu'à 500MB
📝 **Note** : Parfait pour commencer

---

### C. Mapbox (OPTIONNEL - 3 min)

1. **Aller sur** : https://account.mapbox.com/
2. **Créer un compte**
3. **Aller dans "Access tokens"**
4. **Copier le "Default public token"** (commence par `pk.`)

💰 **Coût** : 50,000 requêtes gratuites/mois
📝 **Note** : Pas obligatoire, l'app fonctionne sans (données mockées)

---

### D. Twilio (OPTIONNEL - 3 min)

1. **Aller sur** : https://console.twilio.com/
2. **Créer un compte**
3. **Obtenir un numéro de téléphone**
4. **Copier** :
   - Account SID
   - Auth Token
   - Phone Number

💰 **Coût** : ~$0.05 par SMS
📝 **Note** : Pas obligatoire, l'app fonctionne sans (logs uniquement)

---

## ÉTAPE 2 : Configurer `.env.local` (5 minutes)

### Ouvrir le fichier `.env.local`

```bash
# Dans votre terminal
nano .env.local
# ou ouvrir avec votre éditeur préféré
```

### Remplir avec vos clés

Remplacer les valeurs `your-xxx-here` par vos vraies clés :

```bash
# ============================================
# CONFIGURATION IA - DEEPSEEK (REQUIS)
# ============================================
DEEPSEEK_API_KEY=sk-VOTRE-CLE-ICI
DEEPSEEK_MODEL=chat

# ============================================
# CONFIGURATION SUPABASE (REQUIS)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.VOTRE-CLE-ICI

# ============================================
# CONFIGURATION MAPBOX (OPTIONNEL)
# ============================================
NEXT_PUBLIC_MAPBOX_TOKEN=pk.VOTRE-TOKEN-ICI

# ============================================
# CONFIGURATION TWILIO SMS (OPTIONNEL)
# ============================================
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_PHONE_NUMBER=+221XXXXXXXXX

# ============================================
# SÉCURITÉ (REQUIS)
# ============================================
ENCRYPTION_KEY=VOIR-ETAPE-3
ALLOWED_ORIGINS=http://localhost:9002,https://samasante.ai

# ============================================
# OPTIMISATIONS NEXT.JS
# ============================================
NEXT_WEBPACK_USEPOLLING=false
NEXT_TELEMETRY_DISABLED=1
FAST_REFRESH=true
NODE_OPTIONS="--max_old_space_size=4096"
NODE_ENV=development
```

### Sauvegarder le fichier
- Nano : `Ctrl+X`, puis `Y`, puis `Enter`
- VS Code : `Cmd+S` (Mac) ou `Ctrl+S` (Windows)

---

## ÉTAPE 3 : Générer la Clé de Chiffrement (1 minute)

### Générer la clé

```bash
openssl rand -hex 32
```

Vous obtiendrez quelque chose comme :
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Copier dans `.env.local`

Remplacer `VOIR-ETAPE-3` par la clé générée :
```bash
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## ÉTAPE 4 : Tester l'Application (5 minutes)

### Lancer l'application

```bash
npm run dev
```

Vous devriez voir :
```
✓ Ready in 2.5s
○ Local:   http://localhost:9002
```

### Ouvrir dans le navigateur

Aller sur : http://localhost:9002

### Tester le Chat IA

1. Cliquer sur "Lancer l'application web"
2. Aller sur la page `/app`
3. Taper un symptôme : "J'ai mal à la tête depuis 2 jours"
4. Cliquer sur "Répondre en français"
5. Attendre la réponse de l'IA (5-10 secondes)

### ✅ Vérifications

Si tout fonctionne, vous devriez voir :
- ✅ L'IA répond avec une évaluation
- ✅ Des remèdes traditionnels suggérés
- ✅ Des prochaines étapes recommandées
- ✅ Pas d'erreur dans la console

---

## 🐛 Dépannage

### Erreur : "DEEPSEEK_API_KEY is not defined"
→ Vérifiez que la clé est bien dans `.env.local`
→ Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

### Erreur : "Supabase environment variables are not set"
→ Vérifiez que l'URL et la clé Supabase sont dans `.env.local`
→ Redémarrez le serveur

### Erreur : "Failed to fetch"
→ Vérifiez votre connexion internet
→ Vérifiez que la clé DeepSeek est valide

### L'IA ne répond pas
→ Vérifiez la console du navigateur (F12)
→ Vérifiez que vous avez du crédit sur DeepSeek
→ Vérifiez les logs du terminal

---

## ✅ CHECKLIST FINALE

- [ ] Compte DeepSeek créé
- [ ] Clé DeepSeek copiée dans `.env.local`
- [ ] Compte Supabase créé
- [ ] URL et clé Supabase copiées dans `.env.local`
- [ ] Clé de chiffrement générée et copiée
- [ ] `npm run dev` fonctionne
- [ ] Application accessible sur http://localhost:9002
- [ ] Chat IA répond correctement

---

## 🎉 SUCCÈS !

Si toutes les étapes sont validées, votre application fonctionne !

### Prochaines étapes

1. **Configurer la base de données Supabase** (voir `SETUP_GUIDE.md`)
2. **Tester toutes les fonctionnalités**
3. **Déployer en staging**

---

## 📞 Besoin d'aide ?

- Consultez `SETUP_GUIDE.md` pour plus de détails
- Vérifiez les logs dans le terminal
- Ouvrez la console du navigateur (F12)

---

**Temps estimé total** : 30 minutes
**Difficulté** : Facile
**Prérequis** : Connexion internet, email valide
