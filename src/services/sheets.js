const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyGHh9Dx0IQt3qqmrwf29STxKxWTSvqWaWiMT5aaG-rtbHAAIHFdAaF0Mjcuv8aS4Ma/exec';

export async function sendToGoogleSheets(payload) {
  console.log('[Sheets] Preparando envio para planilha:', payload);

  try {
    const response = await fetch(APPS_SCRIPT_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    console.log('[Sheets] Resposta bruta do Apps Script:', rawText);

    if (!response.ok) {
      throw new Error(`Falha HTTP no Apps Script: ${response.status}`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }

    console.log('[Sheets] Envio concluído:', data);
    return data;
  } catch (error) {
    console.error('[Sheets] Erro ao enviar para planilha:', error);
    throw error;
  }
}
