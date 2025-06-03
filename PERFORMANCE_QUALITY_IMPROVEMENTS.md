npm run dev

# Tests et qualité
npm run lint          # Vérifier le code avec ESLint
npm run lint:fix      # Corriger automatiquement les erreurs ESLint
npm run typecheck     # Vérifier les types TypeScript
npm run test          # Exécuter les tests
npm run test:watch    # Exécuter les tests en mode watch
npm run test:coverage # Générer le rapport de couverture
npm run quality       # Exécuter lint, typecheck et tests

# Build et production
npm run build         # Construire l'application
npm run start         # Démarrer en production
```

## Prochaines étapes recommandées

### 1. Installation des dépendances
```bash
npm install
```

### 2. Initialisation de Husky
```bash
npx husky install
```

### 3. Corriger les erreurs TypeScript
Exécutez `npm run typecheck` et corrigez les erreurs qui apparaissent.

### 4. Corriger les erreurs ESLint
Exécutez `npm run lint:fix` pour corriger automatiquement la plupart des erreurs.

### 5. Exécuter les tests
```bash
npm run test
```

## Architecture des améliorations

### Mise en cache intelligente
- Les requêtes IA sont mises en cache pendant 1 heure (fraîches) et 24 heures (cache total)
- Le Service Worker utilise différentes stratégies selon le type de ressource
- Les images sont optimisées et mises en cache pendant 30 jours

### Optimisations de performance
- Lazy loading pour les composants lourds (Map, images)
- Debounce pour les recherches (300ms)
- Formats d'images modernes (AVIF, WebP)
- Service Worker pour le mode hors ligne

### Qualité et maintenabilité
- TypeScript strict pour éviter les bugs
- Tests automatisés pour les composants critiques
- Pre-commit hooks pour maintenir la qualité
- Configuration ESLint et Prettier pour un code cohérent

## Métriques de succès attendues

- **Performance** : Lighthouse score > 90
- **Temps de chargement** : < 3 secondes sur 3G
- **Cache hit rate** : > 60% pour les requêtes IA répétées
- **Couverture de tests** : > 80% sur les composants critiques
- **TypeScript** : 0 erreurs de compilation
- **ESLint** : 0 erreurs, warnings minimaux