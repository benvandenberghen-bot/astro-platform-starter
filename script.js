const form = document.getElementById('gevel-form');
const breedteInput = document.getElementById('breedte');
const hoogteInput = document.getElementById('hoogte');
const ramenInput = document.getElementById('ramen');
const brutoEl = document.getElementById('bruto');
const nettoEl = document.getElementById('netto');
const formuleEl = document.getElementById('formule');
const meldingEl = document.getElementById('melding');

function formatGetal(waarde) {
  return waarde.toLocaleString('nl-NL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  meldingEl.textContent = '';

  const breedte = Number.parseFloat(breedteInput.value);
  const hoogte = Number.parseFloat(hoogteInput.value);
  const ramen = Number.parseFloat(ramenInput.value);

  if ([breedte, hoogte, ramen].some((waarde) => Number.isNaN(waarde) || waarde < 0)) {
    meldingEl.textContent = 'Vul geldige, niet-negatieve waarden in.';
    return;
  }

  const bruto = breedte * hoogte;

  if (ramen > bruto) {
    meldingEl.textContent = 'Raamoppervlakte kan niet groter zijn dan de bruto geveloppervlakte.';
    return;
  }

  const netto = bruto - ramen;

  brutoEl.textContent = formatGetal(bruto);
  nettoEl.textContent = formatGetal(netto);
  formuleEl.textContent = `Formule: bruto = breedte × hoogte = ${formatGetal(breedte)} × ${formatGetal(hoogte)} = ${formatGetal(bruto)} m² | netto = bruto − ramen = ${formatGetal(bruto)} − ${formatGetal(ramen)} = ${formatGetal(netto)} m²`;
});
