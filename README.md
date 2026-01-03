# Valheim Server Status & Presentation Site

Un sito web moderno per visualizzare lo stato del tuo server Valheim e presentare la tua community. Include una dashboard con statistiche in tempo reale, una slideshow, e sezioni informative.

## Caratteristiche

- **Monitoraggio Server**: Stato online/offline, conteggio giocatori, ping e versione in tempo reale.
- **Grafico Storico**: Visualizza l'andamento dei giocatori negli ultimi minuti.
- **Design Moderno**: Stile ispirato a Valheim con effetti Glassmorphism e animazioni.
- **Responsive**: Ottimizzato per desktop e mobile.
- **API Backend**: Server Express.js leggero che interroga il server di gioco usando il protocollo Steam/Valve.

## Prerequisiti

- [Node.js](https://nodejs.org/) (versione 14 o superiore)
- Un server Valheim attivo (IP e porta Query)

---

## 🛠️ Guida all'Installazione (Windows)

Questa guida ti permetterà di avviare il sito sul tuo PC locale o su un server Windows.

1.  **Installa Node.js**
    *   Scarica e installa la versione LTS da [nodejs.org](https://nodejs.org/).

2.  **Scarica il Progetto**
    *   Scarica questo repository e estrailo in una cartella (es. `C:\ValheimWeb`).

3.  **Installa le Dipendenze**
    *   Apri il terminale (PowerShell o CMD).
    *   Naviga nella cartella del progetto:
        ```powershell
        cd C:\ValheimWeb
        ```
    *   Esegui il comando:
        ```powershell
        npm install
        ```

4.  **Configura l'IP del Server**
    *   Apri il file `server.js` con un editor di testo (Notepad, VS Code).
    *   Trova la riga:
        ```javascript
        const SERVER_IP = '57.129.6.50'; // Tuo IP
        const SERVER_PORT = 2457;        // Tua Porta Query
        ```
    *   Modifica con i tuoi dati se necessario.
    *   Apri `public/script.js` e aggiorna `SERVER_ADDRESS` all'inizio del file per farlo corrispondere al tuo server (per la visualizzazione).

5.  **Avvia il Sito**
    *   Nel terminale, esegui:
        ```powershell
        node server.js
        ```
    *   Il sito sarà accessibile a: `http://localhost:3000`

---

## 🐧 Guida all'Installazione (Linux - Ubuntu/Debian)

Questa guida è ideale per ospitare il sito su un VPS (Virtual Private Server).

### Metodo Automatico (Script)
Il progetto include uno script di installazione rapida.
1.  Carica i file sul server (es. via FileZilla o `git clone`).
2.  Dai i permessi di esecuzione allo script:
    ```bash
    chmod +x setup-server.sh
    ```
3.  Esegui lo script:
    ```bash
    ./setup-server.sh
    ```

### Metodo Manuale

1.  **Aggiorna il sistema**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Installa Node.js**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

3.  **Installa Process Manager (PM2)**
    PM2 serve a mantenere il sito attivo anche se chiudi la console.
    ```bash
    sudo npm install -g pm2
    ```

4.  **Configura il Progetto**
    *   Naviga nella cartella del progetto:
        ```bash
        cd /percorso/del/tuo/sito
        ```
    *   Installa le dipendenze:
        ```bash
        npm install
        ```

5.  **Avvia il Server**
    *   Avvia con PM2:
        ```bash
        pm2 start server.js --name "valheim-web"
        ```
    *   Configura l'avvio automatico al riavvio del server:
        ```bash
        pm2 startup
        pm2 save
        ```

6.  **Configurazione Firewall (Opzionale)**
    Se usi UFW, assicurati di aprire la porta 3000:
    ```bash
    sudo ufw allow 3000
    ```
    Ora il sito sarà visibile su `http://TUO_IP_VPS:3000`.

---

## 🌐 Esporre il sito sulla porta 80 (Opzionale - Consigliato)

Per accedere al sito senza specificare la porta (es. `http://tuosito.com` invece di `:3000`), puoi usare Nginx come Reverse Proxy.

1.  **Installa Nginx**:
    ```bash
    sudo apt install nginx -y
    ```

2.  **Configura il Proxy**:
    Modifica il file di configurazione default:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```
    Sostituisci la sezione `location /` con:
    ```nginx
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    ```

3.  **Riavvia Nginx**:
    ```bash
    sudo systemctl restart nginx
    ```

## 📂 Struttura Cartelle

- `public/`: Contiene i file frontend (HTML, CSS, JS, Immagini, Font).
- `server.js`: Il backend Node.js che gestisce le API.
- `package.json`: Lista delle dipendenze.
