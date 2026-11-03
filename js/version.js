// ==========================================================
// MarketPulse — Versión del programa y sello del pie de página
// ÚNICA FUENTE DE VERDAD de la versión mostrada en el pie de
// página (index, analysis, metals, forex, about y legal).
// Al publicar una versión nueva, cambia solo APP_VERSION aquí.
// ==========================================================

// Origen real fijado en https://matthtorres.github.io/MarketPulse/ (31 URLs
// absolutas: canonical, og:url, og:image, twitter:image, robots.txt y
// sitemap.xml). Si algún día cambia el hosting, se rehace con:
//   python tools/set_site_origin.py <url>
const APP_VERSION = '3.10.0';
const APP_RELEASE = {
  es: '28 de septiembre de 2026',
  en: 'September 28, 2026',
};

function appLang() {
  return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es';
}

// Rellena los marcadores del pie: versión, año de copyright y fecha de la política.
function stampVersionFooter() {
  const lang = appLang();
  document.querySelectorAll('[data-app-version]').forEach(el => {
    el.textContent = 'v' + APP_VERSION;
  });
  document.querySelectorAll('[data-app-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll('[data-app-release]').forEach(el => {
    el.textContent = APP_RELEASE[lang] || APP_RELEASE.es;
  });
  // En páginas sin datos de mercado que sí muestran el sello (about.html) la hora
  // de carga hace de "Actualizado:"; legal.html no incluye hora y usa footerBrandLine.
  const ut = document.getElementById('updateTime');
  if (ut && ut.textContent.trim() === '—') {
    ut.textContent = new Date().toLocaleString(lang === 'es' ? 'es-ES' : 'en-US');
  }
}

// Los scripts se cargan al final del <body>, con el pie ya en el DOM.
stampVersionFooter();
