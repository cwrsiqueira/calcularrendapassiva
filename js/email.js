(function () {
  const form  = document.getElementById('emailForm');
  if (!form) return;

  const input = document.getElementById('emailInput');
  const btn   = document.getElementById('emailBtn');
  const msg   = document.getElementById('emailMsg');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    msg.textContent = '';
    msg.className = 'email-msg';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        msg.textContent = '✓ Cadastrado! Você receberá as dicas em breve.';
        msg.className = 'email-msg success';
        form.querySelector('.email-row').style.display = 'none';
      } else {
        throw new Error(data.error || 'Erro ao cadastrar');
      }
    } catch (err) {
      msg.textContent = err.message || 'Erro ao cadastrar. Tente novamente.';
      msg.className = 'email-msg error';
      btn.disabled = false;
      btn.textContent = 'Quero novidades';
    }
  });
})();
