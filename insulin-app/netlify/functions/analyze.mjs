export default async (req) => {
  try {
    const { image, mediaType } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: 'انظر لهذه الصورة وقدّر الكميات التقريبية بالغرام. أجب فقط بـ JSON بدون أي نص آخر: {"carbs":0,"protein":0,"fat":0,"description":"اسم الوجبة"}' }
          ]
        }]
      })
    });

    const data = await response.json();
    const result = data.content?.[0]?.text || '{}';
    return Response.json({ result });

  } catch (e) {
    return Response.json({ result: '{}', error: e.message }, { status: 500 });
  }
};

export const config = { path: '/api/analyze' };
