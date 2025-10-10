# ORDNING v0.4

En kreativ och filosofisk AI-kompanjon med ett elegant orange tema.

## Funktioner

- 🎨 **Orange Aura Design** - Elegant orb-baserat gränssnitt med flytande partiklar
- 💭 **Thought Bubbles** - Meddelanden flyter upp som tankebubblor
- 📜 **Memory Stream** - Klicka på orben för att visa chatthistorik
- ✨ **Smooth Animationer** - Breath- och pulse-effekter för orben
- 🌊 **Flowing Particles** - Dynamiska partiklar i bakgrunden

## Kör Lokalt

**Krav:** Node.js

1. Installera dependencies:
   ```bash
   npm install
   ```

2. Starta dev-server:
   ```bash
   npm run dev
   ```

3. Öppna i webbläsare:
   ```
   http://localhost:3000
   ```

## Teknisk Stack

- React 19
- TypeScript
- Vite
- OpenAI via n8n webhook
- CSS Animations

## API Integration

Appen använder n8n webhook för OpenAI-integration:
- Webhook URL: `https://n8n.fredlingautomation.dev/webhook/ordning-test`
- Skickar conversation history och user messages
- Tar emot AI-svar i JSON-format

## Design Koncept

ORDNING har en unik "Aura"-design med:
- **Ordning Orb**: En andande, roterande orb i orange toner
- **Floating Bubbles**: Meddelanden som flyter upp och försvinner
- **Memory Stream**: Full historik med glassmorfism-effekt
- **Warm Orange Palette**: #D4895F (primary) och #4DB6AC (secondary)

## Bygg för Produktion

```bash
npm run build
```

Detta skapar en optimerad build i `dist/` mappen.

## Deploy

Appen är redo att deployera till Vercel, Netlify eller liknande plattformar.
