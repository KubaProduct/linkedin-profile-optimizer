import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Jesteś ekspertem od LinkedIn i budowania marki osobistej.
Analizujesz profil LinkedIn i zwracasz wyniki w ŚCIŚLE określonej strukturze Markdown.

KRYTYCZNA ZASADA FORMATOWANIA:
- Używaj POJEDYNCZEGO # (jeden hash) WYŁĄCZNIE dla 6 głównych sekcji poniżej
- NIE używaj ## ani ### NIGDZIE - to zaburzy strukturę
- Podsekcje wewnątrz każdej sekcji oznaczaj TYLKO pogrubieniem: **📍 Obecnie:**, **✨ Sugestia:**, **💡 Dlaczego lepsze:**
- Odpowiadaj po polsku

WYMAGANA STRUKTURA (kopiuj dokładnie te tytuły):

# Ogólna ocena
**Ocena: X/10**
Podsumowanie 3-4 zdania: co jest dobre, co wymaga poprawy.

# Nagłówek i tytuł zawodowy
**📍 Obecnie:**
Cytat lub opis obecnego nagłówka.

**✨ Sugestia:**
Gotowy tekst nowego nagłówka do skopiowania.

**💡 Dlaczego lepsze:**
1-2 zdania wyjaśnienia.

# Sekcja "O mnie"
**📍 Obecnie:**
Opis lub cytat obecnej sekcji About.

**✨ Sugestia:**
Gotowy tekst nowej sekcji "O mnie" do skopiowania.

**💡 Dlaczego lepsze:**
1-2 zdania wyjaśnienia.

# Doświadczenie zawodowe
**📍 Obecny stan:**
Co jest dobrze/źle w opisach stanowisk.

**✨ Sugestie poprawy:**
Przepisane przykłady 1-2 stanowisk z liczbami i osiągnięciami.

# Umiejętności
**📍 Obecne umiejętności:**
Lista tego co jest na profilu.

**✨ Rekomendowane uzupełnienia:**
Lista brakujących umiejętności ważnych dla tej branży.

# Priorytety działań
Ponumerowana lista 3-5 najważniejszych zmian do zrobienia od razu.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pdfBase64, goal } = req.body;

  if (!pdfBase64) {
    return res.status(400).json({ error: 'Nie przesłano pliku PDF' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Brak klucza API Anthropic. Skonfiguruj zmienną ANTHROPIC_API_KEY' });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userGoal = goal?.trim() || '';
  const userMessage = userGoal
    ? `Przeanalizuj ten profil LinkedIn.\n\nCEL UŻYTKOWNIKA: ${userGoal}\n\nDopasuj wszystkie sugestie do tego celu. Zacznij od ogólnej oceny, a następnie przejdź przez każdą sekcję.`
    : 'Przeanalizuj ten profil LinkedIn i dostarcz szczegółowe, konkretne sugestie poprawy. Zacznij od ogólnej oceny, a następnie przejdź przez każdą sekcję.';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: userMessage,
            },
          ],
        },
      ],
    });

    let lineBuffer = '';
    let introLines = [];
    let currentTitle = null;
    let currentLines = [];

    function sendSection(title, lines) {
      const content = lines.join('\n').trim();
      if (!content) return;
      res.write(`data: ${JSON.stringify({ type: 'section', title, content })}\n\n`);
    }

    function processLine(line) {
      if (/^#(?!#)\s+/.test(line)) {
        const newTitle = line.replace(/^#\s+/, '').replace(/^\d+\.\s+/, '').trim();
        if (currentTitle === null) {
          if (introLines.some(l => l.trim())) {
            sendSection('Podsumowanie ogólne', introLines);
          }
        } else {
          sendSection(currentTitle, currentLines);
        }
        currentTitle = newTitle;
        currentLines = [];
      } else if (currentTitle !== null) {
        currentLines.push(line);
      } else {
        introLines.push(line);
      }
    }

    stream.on('text', (text) => {
      lineBuffer += text;
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop();
      for (const line of lines) processLine(line);
    });

    stream.on('message', () => {
      if (lineBuffer) {
        if (currentTitle !== null) currentLines.push(lineBuffer);
        else introLines.push(lineBuffer);
        lineBuffer = '';
      }
      if (currentTitle !== null) {
        sendSection(currentTitle, currentLines);
      } else if (introLines.some(l => l.trim())) {
        sendSection('Podsumowanie ogólne', introLines);
      }
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Błąd podczas analizy profilu: ' + error.message });
    }
  }
}
