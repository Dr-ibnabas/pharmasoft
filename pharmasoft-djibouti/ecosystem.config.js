// PHARMASOFT - Configuration PM2 (option de demarrage auto sur le serveur).
//
// Prerequis : npm install -g pm2 (une fois, avec internet sur la machine de dev,
// puis copie du dossier global npm) OU installer pm2 hors-ligne.
//
// Demarrer :        pm2 start ecosystem.config.js
// Sauver l'etat :   pm2 save
// Auto au boot :    pm2-startup install   (paquet pm2-windows-startup)
//
// Le serveur ecoute sur 0.0.0.0 -> accessible depuis tous les postes du LAN.
module.exports = {
  apps: [
    {
      name: "pharmasoft",
      // On lance directement le binaire Next (robuste sous Windows).
      script: "node_modules/next/dist/bin/next",
      args: "start -H 0.0.0.0",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
};
