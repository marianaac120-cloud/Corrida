import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_n01t7ij';
const TEMPLATE_ID = 'template_te3ysj7';
const PUBLIC_KEY = 'SmFWKdwphC5jYz4eN';

export async function sendReservationEmail(payload) {
  const templateParams = {
    buyer_name: payload.nome,
    buyer_email: payload.email,
    event_name: 'Mabrina #3 edição',
    ticket_type: payload.ingresso,
    quantity: payload.quantidade,
    total_price: payload.valor_total,
    first_installment: payload.valor_primeira_parcela,
    second_installment: payload.valor_segunda_parcela,
    pix_code: payload.pix_codigo,
    nubank_link: payload.nubank_link,
    ticket_code: payload.codigo_ingresso,
    payment_status: payload.status,
    deadline_notice: 'A segunda parcela deve ser paga até 15/05',
  };

  console.log('[EmailJS] Preparando envio de e-mail:', templateParams);

  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('[EmailJS] E-mail enviado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('[EmailJS] Erro ao enviar e-mail:', error);
    throw error;
  }
}
