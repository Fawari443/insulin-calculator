export async function onRequestPost(context) {
  try {
    const { image, mediaType, description } = await context.request.json();
    const apiKey = context.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ result: '{}', error: 'API key missing' }, { status: 500 });

    let promptText = 'Look at this food image and estimate the macronutrients in grams.';
    if (description && description.length > 0) {
      promptText += ' The user provided these details about the meal to help your analysis: "' + description + '". Use these details (portion sizes, ingredients, cooking method) to improve accuracy.';
    }
    promptText += ' Reply ONLY with valid JSON, no other text: {"carbs":0,"protein":0,"fat":0,"description":"meal name in Arabic"}';

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
            { type: 'text', text: promptText }
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
