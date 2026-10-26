// Menu mobile
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

// Année du pied de page
const year = document.getElementById('y');
if (year) year.textContent = new Date().getFullYear();

// Formulaire de devis : prépare un email prêt à envoyer à l'adresse de contact.
// Renseigner l'adresse dans l'attribut data-email du formulaire (devis.html).
const form = document.getElementById('devis-form');
if (form) {
  const notice = document.getElementById('notice');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const to = form.dataset.email;
    if (!to) {
      notice.textContent = "L'envoi n'est pas encore branché : l'adresse de contact reste à renseigner.";
      notice.hidden = false;
      return;
    }
    const d = new FormData(form);
    const body = [
      `Nom : ${d.get('nom')}`,
      `Entreprise : ${d.get('entreprise')}`,
      `Email : ${d.get('email')}`,
      `Téléphone : ${d.get('tel') || '-'}`,
      `Besoin : ${d.getAll('besoin').join(', ') || '-'}`,
      `Taille : ${d.get('taille')}`,
      `Délai : ${d.get('delai')}`,
      '',
      d.get('message'),
    ].join('\n');
    location.href = `mailto:${to}?subject=${encodeURIComponent('Demande de devis — ' + d.get('entreprise'))}&body=${encodeURIComponent(body)}`;
    notice.textContent = 'Votre messagerie s’ouvre avec la demande prête à envoyer.';
    notice.hidden = false;
  });
}
