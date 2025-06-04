// Configuration webpack supplémentaire pour Samasanté
// Gestion des modules problématiques avec Genkit AI

module.exports = {
  // Suppression des avertissements spécifiques
  ignoreWarnings: [
    {
      module: /node_modules\/handlebars\/lib\/index\.js/,
      message: /require\.extensions is not supported by webpack/,
    },
    {
      module: /node_modules\/dotprompt/,
      message: /require\.extensions is not supported by webpack/,
    },
    {
      module: /node_modules\/@genkit-ai/,
      message: /require\.extensions is not supported by webpack/,
    },
  ],
  
  // Configuration pour les modules externes
  externals: {
    'handlebars': 'commonjs handlebars',
  },
  
  // Résolution des modules
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "os": false,
    }
  },
};
