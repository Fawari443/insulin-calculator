export async function onRequestPost(context) {
  try {
    const { image, mediaType } = await context.request.json();
    const apiKey = context.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ result: '{}', error: 'API key missing' }, { status: 500 });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } },
            { type: 'text', text: 'Look at this food image and estimate the macronutrients in grams. Reply ONLY with valid JSON: {"carbs":0,"protein":0,"fat":0,"description":"meal name in Arabic"}' }
          ]
        }]
      })
    });

    const data = await response.json();
    return Response.json({ result: data.content?.[0]?.text || '{}' });
  } catch (e) {
    return Response.json({ result: '{}', error: e.message }, { status: 500 });
  }
}
