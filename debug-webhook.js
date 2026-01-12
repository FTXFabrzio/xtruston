const axios = require('axios');
const fs = require('fs');

async function test(text, actionId = null) {
    try {
        const payload = JSON.parse(fs.readFileSync('test-webhook.json', 'utf8'));
        const msg = payload.entry[0].changes[0].value.messages[0];

        if (actionId) {
            // Simular clic en botón
            delete msg.text;
            msg.type = 'interactive';
            msg.interactive = {
                type: 'button_reply',
                button_reply: { id: actionId, title: text }
            };
        } else {
            // Simular texto
            msg.type = 'text';
            msg.text = { body: text };
            delete msg.interactive;
        }

        console.log(`Testing with: ${text} (ID: ${actionId || 'none'})`);
        const response = await axios.post('http://localhost:3000/webhook/whatsapp', payload);
        fs.writeFileSync('debug-result.json', JSON.stringify(response.data, null, 2), 'utf8');
        console.log('Done. Check debug-result.json');
    } catch (error) {
        const errData = error.response ? error.response.data : error.message;
        fs.writeFileSync('debug-result.json', JSON.stringify(errData, null, 2), 'utf8');
        console.log('Error logged to debug-result.json');
    }
}

// Para probar HOLA: node debug-webhook.js Hola
// Para probar BOTON: node debug-webhook.js "Soy Residente" NR_RESIDENT
const argText = process.argv[2] || 'Hola';
const argId = process.argv[3] || null;

test(argText, argId);
