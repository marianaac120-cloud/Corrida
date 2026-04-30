import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_n01t7ij';
const TEMPLATE_ID = 'template_te3ysj7';
const PUBLIC_KEY = 'SmFWKdwphC5jYz4eN';

export async function sendReservationEmail(payload) {
  const templateParams = {
    to_email: payload.email,
    to_name: payload.nome,
    event_name: 'Mabrina #3 edição',
    ticket_type: payload.ingresso,
    quantity: payload.quantidade,
    total_value: payload.valor_total,
    first_installment: payload.valor_primeira_parcela,
    second_installment: payload.valor_segunda_parcela,
    ticket_code: payload.codigo_ingresso,
    pix_code: payload.pix_codigo,
    nubank_link: payload.nubank_link,
    status: payload.status,
  };

  console.log('[EmailJS] Objeto enviado para o template:', templateParams);

  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('[EmailJS] E-mail enviado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('[EmailJS] Erro ao enviar e-mail:', error);
    throw error;
  }
}
