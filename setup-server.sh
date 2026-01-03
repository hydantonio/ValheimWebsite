#!/bin/bash

# Script di installazione automatica per il server VPS
# Eseguire con: bash setup-server.sh

echo "--- Inizio installazione Valheim Status Server ---"

# 1. Installa Node.js se non presente
if ! command -v node &> /dev/null; then
    echo "Node.js non trovato. Installazione in corso..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js già installato."
fi

# 2. Installa le dipendenze del progetto
echo "Installazione dipendenze..."
npm install

# 3. Installa PM2 per mantenere il server attivo
if ! command -v pm2 &> /dev/null; then
    echo "Installazione PM2..."
    sudo npm install -g pm2
fi

# 4. Avvia il server con PM2
echo "Avvio del server backend..."
pm2 delete valheim-status 2>/dev/null || true
pm2 start server.js --name "valheim-status"

# 5. Salva la lista dei processi PM2 per il riavvio automatico
pm2 save
pm2 startup | tail -n 1 > /tmp/pm2-startup-cmd.sh
chmod +x /tmp/pm2-startup-cmd.sh
# Esegui il comando di startup solo se necessario (l'utente potrebbe doverlo fare manualmente se chiede password)
# . /tmp/pm2-startup-cmd.sh

echo "--- Installazione Completata ---"
echo "Il backend è ora in esecuzione sulla porta 3000."
echo "Assicurati che la porta 3000 sia aperta nel firewall se non usi un proxy Apache."
echo "Comando per aprire la porta 3000 (se usi ufw): sudo ufw allow 3000/tcp"
