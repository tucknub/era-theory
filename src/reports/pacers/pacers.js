const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#pacers-mobile-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  mobileNav.hidden = expanded;
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const presets = {
  published: { scores:[79.31,59.86,83.62], text:'Published model: Haliburton wins by combining Finals-level postseason conversion with elite succession and system fit.' },
  equal: { scores:[79.56,63.23,80.71], text:'Equal weight: Haliburton still wins, but only narrowly. The George core closes the gap because elite-core quality and resilience matter more.' },
  durability: { scores:[78.09,63.65,72.89], text:'Regular-season durability: Paul George wins. This philosophy values sustained floor and resilience more than maximum playoff ceiling.' },
  postseason: { scores:[78.01,50.70,86.30], text:'Postseason ceiling: Haliburton wins clearly because two playoff trips produced five series wins and the NBA Finals.' },
  resilience: { scores:[78.31,64.16,73.37], text:'Resilience and floor: Paul George wins. The 2014-15 team survived a nearly full season without its superstar far better than the 2025-26 Pacers did without Haliburton.' }
};

const outputs = [document.querySelector('#pg-score'), document.querySelector('#os-score'), document.querySelector('#hali-score')];
const explainer = document.querySelector('#preset-explainer');
const buttons = [...document.querySelectorAll('[data-preset]')];
function applyPreset(name) {
  const preset = presets[name] || presets.published;
  outputs.forEach((output, i) => { if (output) output.textContent = preset.scores[i].toFixed(1); });
  if (explainer) explainer.textContent = preset.text;
  buttons.forEach(button => button.classList.toggle('active', button.dataset.preset === name));
}
buttons.forEach(button => button.addEventListener('click', () => applyPreset(button.dataset.preset)));
applyPreset('published');
