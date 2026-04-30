const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyGHh9Dx0IQt3qqmrwf29STxKxWTSvqWaWiMT5aaG-rtbHAAIHFdAaF0Mjcuv8aS4Ma/exec';

export async function sendToGoogleSheets(payload) {
  console.log('[Sheets] Preparando envio para planilha:', payload);

  try {
    await fetch(APPS_SCRIPT_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });

    console.log('[Sheets] Envio disparado para Apps Script');
    return { ok: true };
  } catch (error) {
    console.error('[Sheets] Erro ao enviar para planilha:', error);
    throw error;
  }
}
