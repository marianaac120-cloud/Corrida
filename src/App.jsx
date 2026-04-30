import { useMemo, useState } from 'react';
import { sendToGoogleSheets } from './services/sheets';
import { sendReservationEmail } from './services/email';

const PIX_CODE =
  '00020126330014BR.GOV.BCB.PIX0111076425753605204000053039865802BR5925Mariana Maria Alves Matia6009SAO PAULO62140510Xvw0VX5kAG6304C506';
const NUBANK_LINK = 'https://nubank.com.br/cobrar/sm6/69f26225-70f7-4f28-b9dd-8d95c65231c9';

const tickets = [
  { name: 'Premium Plus', price: 200, details: '2 diárias all inclusive, de 22 a 24/05' },
  { name: 'Premium', price: 140, details: '1 diária all inclusive, de 23 a 24/05' },
  { name: 'Basic', price: 100, details: 'Dia 23/05 all inclusive' },
];

const formatBRL = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const generateTicketCode = () => `MAB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export default function App() {
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [form, setForm] = useState({ nome: '', email: '', quantidade: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservationData, setReservationData] = useState(null);

  const totals = useMemo(() => {
    const total = selectedTicket.price * Number(form.quantidade || 1);
    const half = total / 2;
    return { total, half };
  }, [selectedTicket, form.quantidade]);

  const handleReserve = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      nome: form.nome,
      email: form.email,
      ingresso: selectedTicket.name,
      quantidade: Number(form.quantidade),
      valor_total: formatBRL(totals.total),
      valor_primeira_parcela: formatBRL(totals.half),
      valor_segunda_parcela: formatBRL(totals.half),
      status: 'Reserva criada',
      data_compra: new Date().toISOString(),
      codigo_ingresso: generateTicketCode(),
      pix_codigo: PIX_CODE,
      nubank_link: NUBANK_LINK,
    };

    try {
      await sendToGoogleSheets(payload);
      setReservationData(payload);

      try {
        await sendReservationEmail(payload);
        setSuccess('Reserva criada com sucesso! Confira os dados de pagamento abaixo.');
      } catch (emailError) {
        console.error('[App] Erro no envio de e-mail após reserva:', emailError);
        setSuccess('Reserva registrada. Não conseguimos enviar o e-mail, mas seu ingresso foi gerado na tela.');
      }
    } catch (err) {
      console.error('[App] Erro no fluxo de reserva:', err);
      setError('Não foi possível concluir a reserva. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecondInstallment = async () => {
    if (!reservationData) return;

    setError('');
    setSuccess('');
    setLoading(true);

    const updatePayload = {
      ...reservationData,
      status: 'Segunda parcela informada',
      data_compra: new Date().toISOString(),
    };

    try {
      await sendToGoogleSheets(updatePayload);
      setReservationData(updatePayload);

      try {
        await sendReservationEmail(updatePayload);
        setSuccess('Segunda parcela informada com sucesso!');
      } catch (emailError) {
        console.error('[App] Erro no envio de e-mail da segunda parcela:', emailError);
        setSuccess('Reserva registrada. Não conseguimos enviar o e-mail, mas seu ingresso foi gerado na tela.');
      }
    } catch (err) {
      console.error('[App] Erro ao informar segunda parcela:', err);
      setError('Erro ao informar segunda parcela. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <section className="mx-auto max-w-5xl p-4 md:p-8">
        <div className="rounded-3xl bg-white p-6 shadow-soft md:p-10">
          <h1 className="text-3xl font-bold md:text-5xl">Mabrina Produções</h1>
          <p className="mt-3 text-lg text-slate-600">Mabrina #3 edição • Porto das Dunas - Aquiraz-CE</p>
          <p className="mt-1 text-slate-500">De 22/05 às 19h até 24/05 às 12h | Festa principal: 23/05 (sunset)</p>
          <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-slate-700">
            Sunset com gincanas, bebidas, comidas e muita música.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.name}
              type="button"
              onClick={() => setSelectedTicket(ticket)}
              className={`rounded-2xl border p-4 text-left shadow-soft transition ${selectedTicket.name === ticket.name ? 'border-coral bg-orange-50' : 'border-slate-200 bg-white'}`}
            >
              <h2 className="text-xl font-semibold">{ticket.name}</h2>
              <p className="mt-1 text-2xl font-bold text-coral">{formatBRL(ticket.price)}</p>
              <p className="mt-2 text-sm text-slate-600">{ticket.details}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleReserve} className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="text-xl font-semibold">Reserve seu ingresso</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input required placeholder="Nome completo" className="rounded-xl border p-3" value={form.nome} onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))} />
            <input required type="email" placeholder="E-mail" className="rounded-xl border p-3" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            <input required type="number" min="1" className="rounded-xl border p-3" value={form.quantidade} onChange={(e) => setForm((prev) => ({ ...prev, quantidade: e.target.value }))} />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
            <p>Total: <strong>{formatBRL(totals.total)}</strong></p>
            <p>1ª parcela (50% até 30/04): <strong>{formatBRL(totals.half)}</strong></p>
            <p>2ª parcela (50% até 15/05): <strong>{formatBRL(totals.half)}</strong></p>
          </div>

          <button disabled={loading} className="mt-4 w-full rounded-xl bg-coral px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {loading ? 'Processando...' : 'Reservar ingresso'}
          </button>
        </form>

        {!!error && <p className="mt-4 rounded-xl bg-red-100 p-3 text-red-700">{error}</p>}
        {!!success && <p className="mt-4 rounded-xl bg-green-100 p-3 text-green-700">{success}</p>}

        {reservationData && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
            <h4 className="text-xl font-semibold">Confirmação da reserva</h4>
            <p className="mt-2">Código do ingresso: <strong>{reservationData.codigo_ingresso}</strong></p>
            <p className="mt-3 text-sm">Pix copia e cola:</p>
            <p className="mt-1 break-all rounded-xl bg-slate-100 p-3 text-xs">{PIX_CODE}</p>
            <a className="mt-3 inline-block text-coral underline" href={NUBANK_LINK} target="_blank" rel="noreferrer">Pagar via link Nubank</a>

            <button onClick={handleSecondInstallment} disabled={loading} className="mt-4 w-full rounded-xl border border-coral px-5 py-3 font-semibold text-coral hover:bg-orange-50 disabled:opacity-60">
              Já paguei a segunda parcela
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
