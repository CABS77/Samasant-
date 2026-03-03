# 🚀 TEST DE L'APPLICATION - SamaSanté AI

## ✅ CONFIGURATION VALIDÉE

Toutes les clés sont configurées :
- ✅ DeepSeek API Key
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Encryption Key

---

## 🎯 LANCER L'APPLICATION

### Commande
```bash
npm run dev
```

### Résultat attendu
```
✓ Ready in 2.5s
○ Local:   http://localhost:9002
```

---

## 🧪 TESTS À EFFECTUER

### 1. Page d'accueil
- Ouvrir : http://localhost:9002
- Vérifier que la page se charge
- Cliquer sur "Lancer l'application web"

### 2. Chat IA (TEST PRINCIPAL)
- Aller sur : http://localhost:9002/app
- Taper un symptôme : **"J'ai mal à la tête depuis 2 jours"**
- Cliquer sur **"Répondre en français"**
- Attendre 5-10 secondes

#### ✅ Résultat attendu
- L'IA répond avec une évaluation
- Des remèdes traditionnels sont suggérés
- Des prochaines étapes sont recommandées
- Pas d'erreur dans la console

### 3. Tester en Wolof
- Taper : **"Dama xew"** (J'ai mal)
- Cliquer sur **"Répondre en wolof"**
- Vérifier que la réponse est en wolof

### 4. Rate Limiting
- Faire 7 requêtes
- À la 8ème, vous devriez voir : "Limite de 7 requêtes atteinte"

### 5. Géolocalisation (optionnel)
- Aller sur la page principale
- Autoriser la géolocalisation
- Vérifier que la carte s'affiche avec des cliniques

---

## 🐛 EN CAS D'ERREUR

### Erreur : "DEEPSEEK_API_KEY is not defined"
→ Redémarrer le serveur (Ctrl+C puis npm run dev)

### Erreur : "Failed to fetch"
→ Vérifier la connexion internet
→ Vérifier que la clé DeepSeek est valide

### Erreur : "Supabase client error"
→ Vérifier que les clés Supabase sont correctes
→ Vérifier que le projet Supabase est actif

### L'IA ne répond pas
→ Ouvrir la console du navigateur (F12)
→ Vérifier les erreurs
→ Vérifier les logs du terminal

---

## 📊 CHECKLIST DE VALIDATION

- [ ] Application démarre sans erreur
- [ ] Page d'accueil se charge
- [ ] Chat IA répond en français
- [ ] Chat IA répond en wolof
- [ ] Remèdes traditionnels s'affichent
- [ ] Rate limiting fonctionne (7 requêtes max)
- [ ] Pas d'erreur dans la console
- [ ] Pas d'erreur dans le terminal

---

## 🎉 SI TOUT FONCTIONNE

Félicitations ! Votre application SamaSanté est opérationnelle !

### Prochaines étapes
1. Configurer les tables Supabase (voir SETUP_GUIDE.md)
2. Tester toutes les fonctionnalités
3. Ajouter des données de test
4. Préparer le déploiement

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez un problème :
1. Vérifier les logs du terminal
2. Vérifier la console du navigateur (F12)
3. Consulter SETUP_GUIDE.md
4. Me dire l'erreur exacte

---

**Temps de test** : 5-10 minutes
**Difficulté** : Facile
