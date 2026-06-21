const GEMINI_KEY = "AQ.Ab8RN6JsNdco3KxJ6WKAJ1CQtG5AcM5PMA9Dz_9cnLKPYyZiFg";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, image, mimeType, maxTokens = 800 } = req.body;

    const parts = [];
    if (image) parts.push({ inline_data: { mime_type: mimeType || 'image/jpeg', data: image } });
    parts.push({ text: prompt });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    console.log('Gemini status:', response.status);
    console.log('Gemini response:', JSON.stringify(data).slice(0, 300));

    if (data.error) {
      console.log('Gemini error:', data.error);
      return res.status(200).json({ text: '', error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text });
  } catch (err) {
    console.log('Handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
