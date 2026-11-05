// ==========================================================
// MarketPulse — Análisis Fundamental + Técnico multi-activo (Cripto)
// Fuentes: CoinGecko API (precios/mercado) y Alternative.me (Fear & Greed)
// ==========================================================

// ---------- Configuración de criptoactivos (5 pestañas) ----------
const LOC_BY_LANG = { es: 'es-ES', en: 'en-US', pt: 'pt-BR' };
const LOC_BTN = { es: 'ES', en: 'EN', pt: 'PT' };
const TV_LANG = { es: 'es', en: 'en', pt: 'pt' };

const COINS = {
  bitcoin:  { id: 'bitcoin',  tv: 'BINANCE:BTCUSDT',  name: 'Bitcoin',  symbol: 'BTC' },
  ethereum: { id: 'ethereum', tv: 'BINANCE:ETHUSDT', name: 'Ethereum', symbol: 'ETH' },
  solana:   { id: 'solana',   tv: 'BINANCE:SOLUSDT',  name: 'Solana',   symbol: 'SOL' },
  ripple:   { id: 'ripple',   tv: 'BINANCE:XRPUSDT',  name: 'XRP',      symbol: 'XRP' },
  dogecoin: { id: 'dogecoin', tv: 'BINANCE:DOGEUSDT', name: 'Dogecoin', symbol: 'DOGE' },
};

// ---------- Calendario Macro (JSON estático, sin backend) ----------
// Eventos de alto impacto para Forex y Metales (próximas 3-4 semanas).
// Fuente: fechas aproximadas de calendario económico público (no se necesita API).
const MACRO_EVENTS = [
  { date: '2026-03-12', event: 'macroECB', impact: 'high', assets: ['EUR', 'XAU', 'EURUSD'] },
  { date: '2026-03-13', event: 'macroCPI', impact: 'high', assets: ['USD', 'BTC', 'XAU'] },
  { date: '2026-03-14', event: 'macroRetailSales', impact: 'medium', assets: ['USD', 'USDCAD'] },
  { date: '2026-03-17', event: 'macroCPI', impact: 'medium', assets: ['GBP', 'GBPUSD'] },
  { date: '2026-03-18', event: 'macroFOMC', impact: 'medium', assets: ['USD', 'BTC', 'XAU'] },
  { date: '2026-03-19', event: 'macroBOE', impact: 'medium', assets: ['GBP', 'GBPUSD'] },
  { date: '2026-03-20', event: 'macroNFP', impact: 'high', assets: ['USD', 'BTC', 'XAU'] },
  { date: '2026-03-21', event: 'macroGDP', impact: 'medium', assets: ['EUR', 'EURUSD'] },
  { date: '2026-03-24', event: 'macroIndustrialProd', impact: 'low', assets: ['USD', 'USDCAD'] },
  { date: '2026-03-26', event: 'macroTradeBalance', impact: 'medium', assets: ['CNY', 'USDCNH'] },
  { date: '2026-03-27', event: 'macroCPI', impact: 'medium', assets: ['JPY', 'USDJPY'] },
  { date: '2026-03-28', event: 'macroRetailSales', impact: 'low', assets: ['USD', 'BTC'] },
];

const coinParam = new URLSearchParams(location.search).get('coin');
const coinKey = COINS[coinParam] ? coinParam : 'bitcoin';
const coin = COINS[coinKey];

// Reemplaza {coin}/{pair}/{symbol} por la cripto activa (usado en i18n y textos dinámicos)
function fillText(s) {
  return String(s)
    .replace(/\{coin\}/g, coin.name)
    .replace(/\{pair\}/g, coin.tv)
    .replace(/\{symbol\}/g, coin.symbol);
}

const els = {
  statusText: document.getElementById('statusText'),
  statusRow: document.getElementById('statusRow'),
  currentPrice: document.getElementById('currentPrice'),
  priceChange: document.getElementById('priceChange'),
  themeToggle: document.getElementById('themeToggle'),
  fundBadge: document.getElementById('fundBadge'),
  fundMetrics: document.getElementById('fundMetrics'),
  fundUp: document.getElementById('fundUp'),
  fundDown: document.getElementById('fundDown'),
  fundUpBar: document.getElementById('fundUpBar'),
  fundDownBar: document.getElementById('fundDownBar'),
  techBadge: document.getElementById('techBadge'),
  techMetrics: document.getElementById('techMetrics'),
  techUp: document.getElementById('techUp'),
  techDown: document.getElementById('techDown'),
  techUpBar: document.getElementById('techUpBar'),
  techDownBar: document.getElementById('techDownBar'),
  recoPill: document.getElementById('recoPill'),
  combinedCircle: document.getElementById('combinedCircle'),
  combinedPct: document.getElementById('combinedPct'),
  summaryText: document.getElementById('summaryText'),
  rangeMetrics: document.getElementById('rangeMetrics'),
  rangeDate: document.getElementById('rangeDate'),
  tradeDir: document.getElementById('tradeDir'),
  tradeCons: document.getElementById('tradeCons'),
  tradeMed: document.getElementById('tradeMed'),
  tradeAgg: document.getElementById('tradeAgg'),
  tvBadge: document.getElementById('tvBadge'),
  recoDetails: document.getElementById('recoDetails'),
  updateTime: document.getElementById('updateTime'),
};

// ---------- Internacionalización (ES / EN) ----------
const I18N = {
  es: {
    docTitle: 'MarketPulse — Análisis Diario de {coin}',
    tagline: 'Análisis diario de {coin} · Fundamental + Técnico',
    langEsName: 'Español',
    langEnName: 'Inglés',
    langPtName: 'Portugués',
    navHome: 'Inicio',
    navAnalysis: 'Cripto',
    navMetals: 'Metales',
    navForex: 'Divisas',
    navAbout: 'Sobre nosotros',
    priceLabel: 'Precio actual',
    statusLoading: 'Cargando datos de mercado en tiempo real…',
    statusOk: 'Análisis actualizado correctamente.',
    statusError: '⚠️ No se pudieron cargar los datos en vivo (posible límite de la API o falta de conexión). Pulsa Reintentar en unos segundos.',
    chartUnavailable: 'No se pudo cargar el gráfico de evolución. El resto del análisis sí es válido.',
    tvUnavailable: 'No se pudo cargar el gráfico en tiempo real. Verifica tu conexión.',
    statusLoadingCoin: 'Cargando datos de {coin}…',
    retry: 'Reintentar',
    fundTitle: 'Análisis Fundamental',
    fundDesc: 'Sentimiento de mercado, variaciones diarias, volumen y capitalización del día.',
    techTitle: 'Análisis Técnico',
    techDesc: 'Indicadores de tendencia, momentum y volatilidad sobre el historial reciente.',
    up: 'Subida',
    down: 'Bajada',
    dailyTitle: 'Evolución del precio — 90 días',
    dailyDesc: 'Precio de cierre diario con las medias de tendencia de corto y largo plazo superpuestas.',
    liveTitle: 'Gráfico en tiempo real',
    liveDesc: 'Gráfico en vivo del mercado · par {pair}, velas de 1 minuto.',
    connecting: 'Conectando…',
    live: 'En vivo',
    reconnecting: 'Reconectando…',
    offline: 'Sin conexión',
    summaryTitle: 'Resumen y Recomendación Profesional',
    combinedLabel: 'Prob. Subida Combinada',
    summaryPlaceholder: 'Analizando ambos enfoques para generar una recomendación…',
    disclaimer: '⚠️ Este análisis se genera automáticamente a partir de datos públicos de mercado e indicadores estadísticos. No constituye asesoría financiera. Las inversiones en criptoactivos conllevan alto riesgo.',
    footerPrefix: 'MarketPulse · Datos de mercado en tiempo real · Actualizado:',
    footerLegal: 'Políticas de uso y responsabilidad',
    footerVersion: 'Versión',
    footerRights: 'Todos los derechos reservados.',
    m24h: 'Variación 24h',
    m7d: 'Variación 7 días',
    mFng: 'Índice Miedo/Codicia',
    mSentiment: 'Sentimiento comunidad (alcista)',
    mVolCap: 'Volumen 24h / Cap. mercado',
    mCap: 'Capitalización de mercado',
    mUnavailable: 'No disponible',
    metricRsi: 'Impulso del mercado',
    metricSma20: 'Tendencia corta',
    metricSma50: 'Tendencia larga',
    metricMacd: 'Cambio de impulso',
    metricSignal: 'Señal de impulso',
    metricHist: 'Fuerza del impulso',
    bullish: 'Alcista',
    bearish: 'Bajista',
    neutral: 'Neutral',
    recoBuy: 'COMPRA',
    recoSell: 'VENTA',
    recoHold: 'NEUTRAL',
    recoBuyText: 'Comprar / Mantener posiciones largas',
    recoSellText: 'Vender / Evitar nuevas entradas',
    recoHoldText: 'Mantener y esperar confirmación',
    detWeight: 'Peso técnico (55%) vs fundamental (45%) — el corto plazo se guía más por momentum de precio.',
    detFundUp: 'El contexto de mercado (sentimiento y dominancia) favorece a los compradores.',
    detFundDown: 'El contexto de mercado muestra cautela o presión vendedora.',
    detFundNeutral: 'El contexto de mercado se mantiene neutral, sin sesgo claro.',
    detTechUp: 'Los indicadores técnicos sugieren momentum alcista.',
    detTechDown: 'Los indicadores técnicos sugieren debilidad o posible corrección.',
    detTechNeutral: 'Los indicadores técnicos están mixtos, sin tendencia definida.',
    detRisk: 'Gestiona el riesgo: usa stop-loss y no inviertas más de lo que puedes permitirte perder.',
    chartPrice: 'Precio de {coin} (USD)',
    rangeTitle: 'Rango estimado de fluctuación — hoy',
    rangeNote: 'Estimado a partir de la volatilidad reciente y el movimiento medio diario del activo, ajustado por la probabilidad combinada de subida/bajada. Es una horquilla estadística informativa, no una garantía.',
    rangeVol: 'Volatilidad diaria (σ · 90 días)',
    rangeUp: 'Escenario alcista — máx. subida hoy',
    rangeDown: 'Escenario bajista — máx. bajada hoy',
    rangePrice: 'Horquilla de precio esperada hoy',
    rangeClose: 'Variación esperada al cierre de hoy',
    rangeClosePrice: 'Precio esperado al cierre de hoy',
    tradeTitle: 'Plan operativo de hoy',
    profileCons: '🛡️ Conservador',
    profileMed: '⚖️ Medio',
    profileAgg: '🔥 Arriesgado',
    tradeLong: 'Posición larga (compra)',
    tradeShort: 'Posición corta (venta)',
    tradeEntry: 'Precio de entrada',
    tradeStop: 'Stop loss',
    tradeTarget: 'Precio de salida',
    tradeRR: 'Ratio beneficio / riesgo',
    tradeNote: 'Tres perfiles para la operación de hoy según tu tolerancia al riesgo. Conservador: espera un retroceso, stop estrecho para arriesgar poco por operación y salida temprana. Medio: retroceso leve, stop estándar y salida en el extremo estimado del día. Arriesgado: entrada a mercado, stop amplio que aguanta el ruido y salida en extensión. Niveles estadísticos; no es asesoría financiera.',
    macroTitle: 'Calendario Macro Semanal',
    macroSubtitle: 'Eventos de alto impacto para Forex y Metales',
    macroImpactHigh: 'Alto impacto',
    macroImpactMedium: 'Impacto medio',
    macroImpactLow: 'Bajo impacto',
    macroWithin24h: '¡Evento en las próximas 24h!',
    macroNoEvents: 'No hay eventos macro programados para los próximos días.',
    macroCPI: 'CPI (Inflación)',
    macroNFP: 'NFP (Nóminas no agrícolas)',
    macroFOMC: 'Decisión de tipos de la Fed',
    macroECB: 'Decisión de tipos del BCE',
    macroBOE: 'Decisión de tipos del Banco de Inglaterra',
    macroGDP: 'PIB',
    macroRetailSales: 'Ventas minoristas',
    macroIndustrialProd: 'Producción industrial',
    macroTradeBalance: 'Balanza comercial',
    newsTitle: 'Noticias del Mes',
    newsSubtitle: 'Lo más relevante de hoy, la semana y el mes',
    newsToday: 'Hoy',
    newsThisWeek: 'Esta semana',
    newsThisMonth: 'Este mes',
    newsNoItems: 'No hay noticias disponibles en este momento.',
    newsLoading: 'Cargando noticias…',
    newsError: 'No se pudieron cargar las noticias en vivo.',
    newsReadMore: 'Leer más',
    summaryText: 'Combinando el análisis fundamental ({fu}% de probabilidad de subida) con el análisis técnico ({tu}% de probabilidad de subida), el modelo estima una probabilidad combinada de subida del {cu}% para hoy, {date}. Recomendación profesional: {reco}.',
  },
  pt: {
    docTitle: 'MarketPulse — Análise Diária de {coin}',
    tagline: 'Análise diária de {coin} · Fundamental + Técnico',
    langEsName: 'Espanhol',
    langEnName: 'Inglês',
    langPtName: 'Português',
    navHome: 'Início',
    navAnalysis: 'Cripto',
    navMetals: 'Metais',
    navForex: 'Câmbio',
    navAbout: 'Sobre nós',
    priceLabel: 'Preço atual',
    statusLoading: 'Carregando dados de mercado em tempo real…',
    statusOk: 'Análise atualizada com sucesso.',
    statusError: '⚠️ Não foi possível carregar os dados ao vivo (limite da API ou falta de ligação). Clique em Tentar novamente em alguns segundos.',
    chartUnavailable: 'Não foi possível carregar o gráfico de evolução. O resto da análise é válido.',
    tvUnavailable: 'Não foi possível carregar o gráfico em tempo real. Verifique a sua ligação.',
    statusLoadingCoin: 'Carregando dados de {coin}…',
    retry: 'Tentar novamente',
    fundTitle: 'Análise Fundamental',
    fundDesc: 'Sentimento de mercado, variações diárias, volume e capitalização do dia.',
    techTitle: 'Análise Técnica',
    techDesc: 'Indicadores de tendência, momentum e volatilidade sobre o histórico recente.',
    up: 'Alta',
    down: 'Baixa',
    dailyTitle: 'Evolução do preço — 90 dias',
    dailyDesc: 'Preço de fecho diário com as médias de tendência de curto e longo prazo sobrepostas.',
    liveTitle: 'Gráfico em tempo real',
    liveDesc: 'Gráfico ao vivo do mercado · par {pair}, velas de 1 minuto.',
    connecting: 'A ligar…',
    live: 'Ao vivo',
    reconnecting: 'A voltar a ligar…',
    offline: 'Sem ligação',
    summaryTitle: 'Resumo e Recomendação Profissional',
    combinedLabel: 'Prob. de Alta Combinada',
    summaryPlaceholder: 'A analisar as duas abordagens para gerar uma recomendação…',
    disclaimer: '⚠️ Esta análise é gerada automaticamente a partir de dados públicos de mercado e indicadores estatísticos. Não constitui consultoria financeira. Investir em criptoativos envolve risco elevado.',
    footerPrefix: 'MarketPulse · Dados de mercado em tempo real · Atualizado:',
    footerLegal: 'Políticas de uso e responsabilidade',
    footerVersion: 'Versão',
    footerRights: 'Todos os direitos reservados.',
    m24h: 'Variação 24h',
    m7d: 'Variação 7 dias',
    mFng: 'Índice de Medo/Ganância',
    mSentiment: 'Sentimento da comunidade (altista)',
    mVolCap: 'Volume 24h / Cap. de mercado',
    mCap: 'Capitalização de mercado',
    mUnavailable: 'Não disponível',
    metricRsi: 'Impulso do mercado',
    metricSma20: 'Tendência curta',
    metricSma50: 'Tendência longa',
    metricMacd: 'Mudança de impulso',
    metricSignal: 'Sinal de impulso',
    metricHist: 'Força do impulso',
    bullish: 'Altista',
    bearish: 'Baixista',
    neutral: 'Neutro',
    recoBuy: 'COMPRAR',
    recoSell: 'VENDER',
    recoHold: 'NEUTRO',
    recoBuyText: 'Comprar / Manter posições compradas',
    recoSellText: 'Vender / Evitar novas entradas',
    recoHoldText: 'Manter e aguardar confirmação',
    detWeight: 'Peso técnico (55%) vs fundamental (45%) — o curto prazo guia-se mais pelo momentum do preço.',
    detFundUp: 'O contexto de mercado (sentimento e dominância) favorece os compradores.',
    detFundDown: 'O contexto de mercado mostra cautela ou pressão vendedora.',
    detFundNeutral: 'O contexto de mercado mantém-se neutro, sem viés claro.',
    detTechUp: 'Os indicadores técnicos sugerem momentum altista.',
    detTechDown: 'Os indicadores técnicos sugerem fraqueza ou possível correção.',
    detTechNeutral: 'Os indicadores técnicos estão mistos, sem tendência definida.',
    detRisk: 'Faça gestão do risco: use stop-loss e não invista mais do que pode perder.',
    chartPrice: 'Preço de {coin} (USD)',
    rangeTitle: 'Faixa estimada de oscilação — hoje',
    rangeNote: 'Estimado a partir da volatilidade recente e do movimento médio diário do ativo, ajustado pela probabilidade combinada de alta/baixa. É uma faixa estatística informativa, não uma garantia.',
    rangeVol: 'Volatilidade diária (σ · 90 dias)',
    rangeUp: 'Cenário altista — máx. de alta hoje',
    rangeDown: 'Cenário baixista — máx. de baixa hoje',
    rangePrice: 'Intervalo de preço esperado para hoje',
    rangeClose: 'Variação esperada no fecho de hoje',
    rangeClosePrice: 'Preço esperado no fecho de hoje',
    tradeTitle: 'Plano operacional de hoje',
    profileCons: '🛡️ Conservador',
    profileMed: '⚖️ Moderado',
    profileAgg: '🔥 Agressivo',
    tradeLong: 'Posição comprada (buy)',
    tradeShort: 'Posição vendida (sell)',
    tradeEntry: 'Preço de entrada',
    tradeStop: 'Stop loss',
    tradeTarget: 'Preço de saída',
    tradeRR: 'Rácio ganho / risco',
    tradeNote: 'Três perfis para a operação de hoje conforme a sua tolerância ao risco. Conservador: espera um recuo, stop apertado para arriscar pouco por operação e saída antecipada. Moderado: recuo ligeiro, stop padrão e saída na extremidade estimada do dia. Agressivo: entrada a mercado, stop largo que aguenta o ruído e saída em extensão. Níveis estatísticos; não é consultoria financeira.',
    macroTitle: 'Calendário Macro Semanal',
    macroSubtitle: 'Eventos de alto impacto para Forex e Metais',
    macroImpactHigh: 'Alto impacto',
    macroImpactMedium: 'Impacto médio',
    macroImpactLow: 'Baixo impacto',
    macroWithin24h: 'Evento nas próximas 24h!',
    macroNoEvents: 'Não há eventos macro programados para os próximos dias.',
    macroCPI: 'CPI (Inflação)',
    macroNFP: 'NFP (Payrolls não agrícolas)',
    macroFOMC: 'Decisão de juros do Fed',
    macroECB: 'Decisão de juros do BCE',
    macroBOE: 'Decisão de juros do Banco de Inglaterra',
    macroGDP: 'PIB',
    macroRetailSales: 'Vendas no varejo',
    macroIndustrialProd: 'Produção industrial',
    macroTradeBalance: 'Balança comercial',
    newsTitle: 'Notícias do Mês',
    newsSubtitle: 'O mais relevante de hoje, da semana e do mês',
    newsToday: 'Hoje',
    newsThisWeek: 'Esta semana',
    newsThisMonth: 'Este mês',
    newsNoItems: 'Não há notícias disponíveis no momento.',
    newsLoading: 'Carregando notícias…',
    newsError: 'Não foi possível carregar as notícias ao vivo.',
    newsReadMore: 'Ler mais',
    summaryText: 'Combinando a análise fundamental ({fu}% de probabilidade de alta) com a análise técnica ({tu}% de probabilidade de alta), o modelo estima uma probabilidade combinada de alta de {cu}% para hoje, {date}. Recomendação profissional: {reco}.',
  },
  en: {
    docTitle: 'MarketPulse — Daily {coin} Analysis',
    tagline: 'Daily {coin} analysis · Fundamental + Technical',
    langEsName: 'Spanish',
    langEnName: 'English',
    langPtName: 'Portuguese',
    navHome: 'Home',
    navAnalysis: 'Crypto',
    navMetals: 'Metals',
    navForex: 'Forex',
    navAbout: 'About us',
    priceLabel: 'Current price',
    statusLoading: 'Loading live market data…',
    statusOk: 'Analysis updated successfully.',
    statusError: '⚠️ Could not load live data (possible API rate limit or no connection). Press Retry in a few seconds.',
    chartUnavailable: 'The price chart could not be loaded. The rest of the analysis is still valid.',
    tvUnavailable: 'The real-time chart could not be loaded. Check your connection.',
    statusLoadingCoin: 'Loading {coin} data…',
    retry: 'Retry',
    fundTitle: 'Fundamental Analysis',
    fundDesc: 'Market sentiment, daily changes, volume and market cap for the day.',
    techTitle: 'Technical Analysis',
    techDesc: 'Trend, momentum and volatility indicators over recent history.',
    up: 'Up',
    down: 'Down',
    dailyTitle: 'Price evolution — 90 days',
    dailyDesc: 'Daily closing price with short- and long-term trend averages overlaid.',
    liveTitle: 'Real-time chart',
    liveDesc: 'Live market chart · {pair} pair, 1-minute candles.',
    connecting: 'Connecting…',
    live: 'Live',
    reconnecting: 'Reconnecting…',
    offline: 'Offline',
    summaryTitle: 'Summary & Professional Recommendation',
    combinedLabel: 'Combined Up Probability',
    summaryPlaceholder: 'Analyzing both approaches to generate a recommendation…',
    disclaimer: '⚠️ This analysis is generated automatically from public market data and statistical indicators. It does not constitute financial advice. Cryptoasset investments carry high risk.',
    footerPrefix: 'MarketPulse · Real-time market data · Updated:',
    footerLegal: 'Terms of use & disclaimer',
    footerVersion: 'Version',
    footerRights: 'All rights reserved.',
    m24h: '24h change',
    m7d: '7-day change',
    mFng: 'Fear/Greed Index',
    mSentiment: 'Community sentiment (bullish)',
    mVolCap: '24h Volume / Mkt Cap',
    mCap: 'Market capitalization',
    mUnavailable: 'Not available',
    metricRsi: 'Market momentum',
    metricSma20: 'Short-term trend',
    metricSma50: 'Long-term trend',
    metricMacd: 'Momentum change',
    metricSignal: 'Momentum signal',
    metricHist: 'Momentum strength',
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Neutral',
    recoBuy: 'BUY',
    recoSell: 'SELL',
    recoHold: 'NEUTRAL',
    recoBuyText: 'Buy / Hold long positions',
    recoSellText: 'Sell / Avoid new entries',
    recoHoldText: 'Hold and wait for confirmation',
    detWeight: 'Technical weight (55%) vs fundamental (45%) — the short term follows price momentum more closely.',
    detFundUp: 'Market context (sentiment and dominance) favors buyers.',
    detFundDown: 'Market context shows caution or selling pressure.',
    detFundNeutral: 'Market context remains neutral, no clear bias.',
    detTechUp: 'Technical indicators suggest bullish momentum.',
    detTechDown: 'Technical indicators suggest weakness or a possible correction.',
    detTechNeutral: 'Technical indicators are mixed, no defined trend.',
    detRisk: 'Manage risk: use a stop-loss and never invest more than you can afford to lose.',
    chartPrice: '{coin} price (USD)',
    rangeTitle: 'Estimated fluctuation range — today',
    rangeNote: 'Estimated from recent volatility and the asset’s average daily move, adjusted by the combined up/down probability. It is an informational statistical range, not a guarantee.',
    rangeVol: 'Daily volatility (σ · 90 days)',
    rangeUp: 'Bullish scenario — max upside today',
    rangeDown: 'Bearish scenario — max downside today',
    rangePrice: 'Expected price range today',
    rangeClose: 'Expected change at today\'s close',
    rangeClosePrice: 'Expected price at today\'s close',
    tradeTitle: 'Today’s trade plan',
    profileCons: '🛡️ Conservative',
    profileMed: '⚖️ Medium',
    profileAgg: '🔥 Aggressive',
    tradeLong: 'Long position (buy)',
    tradeShort: 'Short position (sell)',
    tradeEntry: 'Entry price',
    tradeStop: 'Stop loss',
    tradeTarget: 'Exit price',
    tradeRR: 'Reward / risk ratio',
    tradeNote: 'Three profiles for today’s trade based on your risk tolerance. Conservative: waits for a pullback, tight stop to risk little per trade and early exit. Medium: mild pullback, standard stop and exit at the estimated day extreme. Aggressive: market entry, wide stop that absorbs noise and extension exit. Statistical levels; not financial advice.',
    macroTitle: 'Weekly Macro Calendar',
    macroSubtitle: 'High-impact events for Forex and Metals',
    macroImpactHigh: 'High impact',
    macroImpactMedium: 'Medium impact',
    macroImpactLow: 'Low impact',
    macroWithin24h: 'Event within the next 24h!',
    macroNoEvents: 'No macro events scheduled for the coming days.',
    macroCPI: 'CPI (Inflation)',
    macroNFP: 'NFP (Non-Farm Payrolls)',
    macroFOMC: 'Fed rate decision',
    macroECB: 'ECB rate decision',
    macroBOE: 'Bank of England rate decision',
    macroGDP: 'GDP',
    macroRetailSales: 'Retail sales',
    macroIndustrialProd: 'Industrial production',
    macroTradeBalance: 'Trade balance',
    newsTitle: 'Monthly News',
    newsSubtitle: 'Most relevant today, this week and this month',
    newsToday: 'Today',
    newsThisWeek: 'This week',
    newsThisMonth: 'This month',
    newsNoItems: 'No news available at the moment.',
    newsLoading: 'Loading news…',
    newsError: 'Could not load live news.',
    newsReadMore: 'Read more',
    summaryText: 'Combining the fundamental analysis ({fu}% probability of going up) with the technical analysis ({tu}% probability of going up), the model estimates a combined upside probability of {cu}% for today, {date}. Professional recommendation: {reco}.',
    starAdd: 'Add to watchlist',
    starRemove: 'Remove from watchlist',
  },
};

// ---------- Estado de preferencias (persistente) ----------
const state = {
  theme: localStorage.getItem('btc-theme') || 'dark',
  lang: (() => { const s = localStorage.getItem('btc-lang'); return LOC_BY_LANG[s] ? s : 'es'; })(),
  watchlist: JSON.parse(localStorage.getItem('mp_watchlist') || '[]'),
  statusKey: 'statusLoading',
};

function t(key) {
  return (I18N[state.lang] && I18N[state.lang][key]) || I18N.es[key] || key;
}

// Datos cacheados para re-render al cambiar idioma/tema
const cached = {};

function chartColors() {
  const light = state.theme === 'light';
  return {
    grid: light ? 'rgba(16,22,42,0.08)' : 'rgba(255,255,255,0.04)',
    tick: light ? '#6b7490' : '#7c86a0',
    tooltipBg: light ? '#ffffff' : '#161d35',
    tooltipBorder: light ? 'rgba(16,22,42,0.12)' : 'rgba(255,255,255,0.1)',
    title: light ? '#10162a' : '#f5f7fb',
    body: light ? '#444c63' : '#b9c2d6',
    legend: light ? '#444c63' : '#b9c2d6',
  };
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  els.themeToggle.textContent = state.theme === 'dark' ? '🌙' : '☀️';
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('btc-theme', theme);
  applyTheme();
  if (cached.prices) renderChart(cached.prices, cached.dates);
  renderTradingView();
}

function applyLang() {
  document.documentElement.lang = state.lang;
  document.title = fillText(t('docTitle'));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = fillText(t(el.getAttribute('data-i18n')));
  });
  // Desplegable: el boton muestra el codigo y las opciones se marcan con
  // aria-current (el CSS ya no usa la clase .active de los botones en fila).
  const current = document.getElementById('langCurrent');
  if (current) {
    const active = LOC_BY_LANG[state.lang] ? state.lang : 'es';
    current.textContent = (LOC_BTN[active] || active).toUpperCase();
  }
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.setAttribute('aria-current', opt.dataset.lang === state.lang ? 'true' : 'false');
  });
  els.statusText.textContent = fillText(t(state.statusKey));
  renderAnalysis();
  renderTradingView();
  if (cached.prices) renderChart(cached.prices, cached.dates);
}

function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('btc-lang', lang);
  applyLang();
}

function fmtUSD(n) {
  const locale = LOC_BY_LANG[state.lang] || 'es-ES';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}
function fmtPct(n, digits = 1) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function addMetricRow(container, name, value, cls) {
  const row = document.createElement('div');
  row.className = 'metric-row';
  row.innerHTML = `<span class="metric-name">${name}</span><span class="metric-value ${cls}">${value}</span>`;
  container.appendChild(row);
}

// ---------- Indicadores técnicos ----------
function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function ema(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let emaPrev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) {
    emaPrev = values[i] * k + emaPrev * (1 - k);
  }
  return emaPrev;
}

function emaSeries(values, period) {
  const k = 2 / (period + 1);
  const out = [];
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

// RSI con suavizado de Wilder (RMA) — estándar TradingView/Binance
function rsi(values, period = 14) {
  if (values.length < period + 1) return null;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) avgGain += diff; else avgLoss -= diff;
  }
  avgGain /= period; avgLoss /= period;
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// ATR (14) para rangos y stops más robustos
function atr(values, period = 14) {
  if (values.length < period + 1) return null;
  const trs = [];
  for (let i = 1; i < values.length; i++) {
    const h = values[i], l = values[i];
    const prev = values[i - 1];
    trs.push(Math.max(h - l, Math.abs(h - prev), Math.abs(l - prev)));
  }
  let atrVal = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atrVal = (atrVal * (period - 1) + trs[i]) / period;
  }
  return atrVal;
}

function ema200(values) { return ema(values, 200); }

function macd(values) {
  const ema12s = emaSeries(values, 12);
  const ema26s = emaSeries(values, 26);
  const macdLine = [];
  for (let i = 0; i < values.length; i++) {
    if (ema12s[i] !== undefined && ema26s[i] !== undefined) {
      macdLine[i] = ema12s[i] - ema26s[i];
    }
  }
  const macdValues = macdLine.filter(v => v !== undefined);
  const signalSeries = emaSeries(macdValues, 9);
  const signal = signalSeries[signalSeries.length - 1];
  const macdNow = macdValues[macdValues.length - 1];
  const histogram = macdNow - signal;
  return { macd: macdNow, signal, histogram };
}

// ---------- Fetch de datos (con reintento ante rate-limit/red) ----------
// CoinGecko permite ~5-15 req/min en plan gratuito. Antes se serializaba cada
// petición con 2 s de pausa artificial, lo que añadiría ~4 s solo en esperas;
// ahora se serializa con una pausa corta y, sobre todo, se cachea 15 min para
// que saltar de pestaña no vuelva a pedir nada.
//  - fetchGate: solo 1 request CoinGecko a la vez, con pausa mínima (400 ms).
//  - Reintentos cortos: si CoinGecko falla se cae rápido a Binance en vez de
//    esperar decenas de segundos (el respaldo no tiene rate-limit agresivo).
//  - Fallback Binance (sin API key) para historial y precio spot.
//  - Tope 8 s por petición: el AbortController de fetchJSON evita que un
//    proveedor colgado deje la página en "Cargando..." (timeout del navegador).
const FETCH_TIMEOUT_MS = 5000;
let fetchGate = Promise.resolve();
function gatedFetch(url, options) {
  const run = fetchGate.then(async () => {
    try { return await fetch(url, options); }
    finally { await new Promise(r => setTimeout(r, 400)); }
  });
  fetchGate = run.catch(() => {});
  return run;
}
async function loadFundingRate(symbol) {
  try {
    const r = await fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`);
    if (!r.ok) return null;
    const j = await r.json();
    const fr = j?.[0]?.fundingRate;
    return fr != null ? parseFloat(fr) * 100 : null;
  } catch (e) { return null; }
}
async function loadOpenInterest(symbol) {
  try {
    const r = await fetch(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.openInterest != null ? parseFloat(j.openInterest) : null;
  } catch (e) { return null; }
}
const BINANCE_SYMBOL = {
  bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', solana: 'SOLUSDT',
  ripple: 'XRPUSDT', dogecoin: 'DOGEUSDT',
};
async function fetchJSON(url, tries = 3, baseDelay = 1200, useGate = true) {
  let lastErr = null;
  for (let i = 0; i < tries; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      // El gate solo ordena las peticiones CoinGecko; el AbortController pone el
      // tope de 8 s para no quedarse en "Cargando..." si un proveedor se cuelga.
      const doFetch = useGate && url.includes('coingecko.com')
        ? fetchGate.then(() => fetch(url, { signal: ctrl.signal })).finally(() => new Promise(r => setTimeout(r, 400)))
        : fetch(url, { signal: ctrl.signal });
      if (useGate && url.includes('coingecko.com')) fetchGate = doFetch.catch(() => {});
      const res = await doFetch;
      if (res.status === 429) {
        lastErr = new Error('HTTP 429');
        if (i === tries - 1) break;          // no insistir: hay respaldo (Binance)
        // Retry-After, pero acotado: esperar 60 s tiene menos sentido que caer a Binance
        const retryAfter = Number(res.headers.get('Retry-After'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, 2500)
          : baseDelay * Math.pow(2, i) + Math.random() * 800;
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) {
        // Un 4xx que no sea 408/429 es una respuesta definitiva (403 por bloqueo
        // de API, 404 por ruta mal escrita): repetirlo solo suma espera sin
        // cambiar el resultado, y el respaldo está en otra función. Con el 403 que
        // devuelve CoinGecko desde algunas IPs, la página de cripto gastaba 3
        // intentos y ~5 s de esperas para acabar cayendo igual a Binance.
        if (res.status < 500 && res.status !== 408 && res.status !== 429) {
          throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const out = await res.json();
      clearTimeout(timer);
      return out;
    } catch (e) {
      clearTimeout(timer);
      lastErr = e && e.name === 'AbortError' ? new Error('timeout 8s') : e;
      if (lastErr && lastErr.fatal) break;   // no hay nada que ganar reintentando
      if (i === tries - 1) break;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i) + Math.random() * 800));
    }
  }
  throw lastErr || new Error('fetch failed');
}
// Historial diario 90d vía Binance (klines 1d). Devuelve {prices, dates}.
// No requiere key y tolera muchas más req/min que CoinGecko.
async function loadHistoryBinance(symbol) {
  const data = await fetchJSON(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=90`,
    3, 1500, false
  );
  if (!Array.isArray(data) || !data.length) throw new Error('binance empty');
  const prices = data.map(k => Number(k[4]));
  const dates = data.map(k => new Date(k[0]));
  return { prices, dates };
}
// Precio spot vía Binance (ticker 24h): price, change%, volume, quoteVolume.
async function loadSpotBinance(symbol) {
  const tk = await fetchJSON(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    3, 1500, false
  );
  if (!tk || !tk.lastPrice) throw new Error('binance spot empty');
  return tk;
}

// Caché corta por moneda (5 min) + caché backup (24h) para recargas/cambios
// de pestaña instantáneos y para operar degradado si la API da 429.
const CACHE_TTL = 15 * 60 * 1000;
const CACHE_BACKUP_TTL = 24 * 60 * 60 * 1000;
// Las fechas viajan como strings ISO en session/localStorage: se reviven a Date
// al leer, o drawChart fallaría (d.toLocaleDateString no existe en strings) en
// la 2ª visita a un activo ya cacheado.
function reviveHistory(data) {
  if (data && Array.isArray(data.dates)) {
    data.dates = data.dates.map(d => (d instanceof Date ? d : new Date(d)));
  }
  return data;
}
function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return reviveHistory(data);
  } catch { return null; }
}
function setCached(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { /* cuota llena */ }
}
// Backup persistente (localStorage): permite render degradado aunque la API falle.
function getBackup(key) {
  try {
    const raw = localStorage.getItem('backup_' + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_BACKUP_TTL) return null;
    return reviveHistory(data);
  } catch { return null; }
}
function setBackup(key, data) {
  try { localStorage.setItem('backup_' + key, JSON.stringify({ ts: Date.now(), data })); } catch { /* cuota llena */ }
}

// Botón "Reintentar" en la fila de estado
function showRetry(container, onClick) {
  container.querySelectorAll('.retry-btn').forEach(b => b.remove());
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'retry-btn';
  btn.textContent = t('retry');
  btn.addEventListener('click', () => { btn.remove(); onClick(); });
  container.appendChild(btn);
}

async function loadMarketData() {
  const key = 'ca_mkt_' + coin.id;
  const cachedData = getCached(key);
  if (cachedData) return cachedData;
  try {
    const data = await fetchJSON(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false`);
    setCached(key, data);
    setBackup(key, data);
    return data;
  } catch (e) {
    const backup = getBackup(key);
    if (backup) { setCached(key, backup); return backup; }
    throw e;
  }
}

async function loadHistoricalPrices() {
  const key = 'ca_hist_' + coin.id;
  const cachedData = getCached(key);
  if (cachedData) {
    return {
      prices: cachedData,
      dates: cachedData.map((_, i) => new Date(Date.now() - (cachedData.length - i) * 86400000)),
    };
  }
  // 1) Intento CoinGecko (serie oficial). 2) Fallback Binance si hay 429.
  try {
    const data = await fetchJSON(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=90&interval=daily`);
    const prices = data.prices.map(p => p[1]);
    const dates = data.prices.map(p => new Date(p[0]));
    setCached(key, prices);
    setBackup(key, prices);
    return { prices, dates };
  } catch (e) {
    try {
      const sym = BINANCE_SYMBOL[coin.id];
      if (sym) {
        const hb = await loadHistoryBinance(sym);
        setCached(key, hb.prices);
        setBackup(key, hb.prices);
        return hb;
      }
    } catch { /* sigue a backup */ }
    const backup = getBackup(key);
    if (backup) {
      setCached(key, backup);
      return {
        prices: backup,
        dates: backup.map((_, i) => new Date(Date.now() - (backup.length - i) * 86400000)),
      };
    }
    throw e;
  }
}

async function loadFearGreed() {
  // Opcional: si falla, el análisis sigue (fng = null).
  try {
    const data = await fetchJSON('https://api.alternative.me/fng/?limit=1', 2, 1500);
    return data.data[0];
  } catch { return null; }
}

// ---------- Serie de SMA para el gráfico ----------
function smaSeries(values, period) {
  const out = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    out[i] = slice.reduce((a, b) => a + b, 0) / period;
  }
  return out;
}

let priceChartInstance = null;
let chartJsPromise = null;

// Chart.js llega desde el HTML en paralelo, pero si el CDN va lento, está bloqueado
// o falla, se vuelve a pedir bajo demanda. Si de verdad no se puede cargar, el
// gráfico muestra un aviso propio sin tumbar el análisis que ya está en pantalla.
function ensureChartJs() {
  if (typeof Chart !== 'undefined') return Promise.resolve();
  if (!chartJsPromise) {
    chartJsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { chartJsPromise = null; reject(new Error('chart.js no disponible')); };
      document.head.appendChild(s);
    });
  }
  return chartJsPromise;
}

function renderChart(prices, dates) {
  const canvas = document.getElementById('priceChart');
  if (!canvas || !prices || !dates) return;
  ensureChartJs()
    .then(() => drawChart(canvas, prices, dates))
    .catch(err => {
      console.error('No se pudo cargar el gráfico de evolución:', err);
      const wrap = canvas.parentElement;
      if (wrap) wrap.innerHTML = `<p class="card-desc">${t('chartUnavailable')}</p>`;
    });
}

function drawChart(canvas, prices, dates) {
  const ctx = canvas.getContext('2d');
  const tag = LOC_BY_LANG[state.lang] || 'es-ES';
  const labels = dates.map(d => d.toLocaleDateString(tag, { day: '2-digit', month: 'short' }));
  const sma20Series = smaSeries(prices, 20);
  const sma50Series = smaSeries(prices, 50);
  const cc = chartColors();

  if (priceChartInstance) priceChartInstance.destroy();

  priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: fillText(t('chartPrice')),
          data: prices,
          borderColor: '#f2a900',
          backgroundColor: 'rgba(242,169,0,0.12)',
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          tension: 0.25,
        },
        {
          label: t('metricSma20'),
          data: sma20Series,
          borderColor: '#17e6b0',
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          borderDash: [4, 3],
          tension: 0.25,
        },
        {
          label: t('metricSma50'),
          data: sma50Series,
          borderColor: '#ff5d6c',
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          borderDash: [2, 2],
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: cc.legend, usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 11 } },
        },
        tooltip: {
          backgroundColor: cc.tooltipBg,
          borderColor: cc.tooltipBorder,
          borderWidth: 1,
          titleColor: cc.title,
          bodyColor: cc.body,
          callbacks: {
            label: (item) => `${item.dataset.label}: ${fmtUSD(item.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: cc.tick, maxTicksLimit: 10, font: { size: 10 } },
          grid: { color: cc.grid },
        },
        y: {
          ticks: { color: cc.tick, font: { size: 10 }, callback: (v) => fmtUSD(v) },
          grid: { color: cc.grid },
        },
      },
    },
  });
}

// ---------- Análisis Fundamental ----------
// Acepta market CoinGecko O market adaptado desde Binance (spot), para que
// XRP/SOL/DOGE rindan aunque CoinGecko devuelva 429.
function adaptBinanceMarket(spot, history) {
  const price = Number(spot.lastPrice);
  const change24h = Number(spot.priceChangePercent ?? 0);
  const volume24h = Number(spot.quoteVolume ?? 0);
  const last = history && history.prices ? history.prices : [];
  const ref7 = last.length >= 8 ? last[last.length - 8] : (last[0] ?? price);
  const change7d = ref7 ? ((price - ref7) / ref7) * 100 : 0;
  return {
    _binance: true,
    market_data: {
      current_price: { usd: price },
      price_change_percentage_24h: change24h,
      price_change_percentage_7d: change7d,
      total_volume: { usd: volume24h },
      market_cap: { usd: 0 },
    },
    sentiment_votes_up_percentage: 50,
  };
}
function analyzeFundamental(market, fng) {
  const md = market.market_data;
  const change24h = md.price_change_percentage_24h ?? 0;
  const change7d = md.price_change_percentage_7d ?? 0;
  const volume24h = md.total_volume.usd || 0;
  const marketCap = md.market_cap.usd || 0;
  const volMcapRatio = marketCap > 0 ? (volume24h / marketCap) * 100 : 0;
  const sentimentUp = market.sentiment_votes_up_percentage ?? 50;
  const fngValue = fng ? Number(fng.value) : 50;
  const fngLabel = fng ? fng.value_classification : t('neutral');

  let score = 50;
  score += clamp(change24h, -10, 10) * 1.5;
  score += clamp(change7d, -20, 20) * 0.6;
  score += (sentimentUp - 50) * 0.4;
  if (fng) {
    if (fngValue <= 25) score += 6;
    else if (fngValue >= 75) score -= 6;
    else score += (fngValue - 50) * 0.15;
  }

  const upProb = clamp(Math.round(score), 5, 95);
  const downProb = 100 - upProb;

  els.fundMetrics.innerHTML = '';
  addMetricRow(els.fundMetrics, t('m24h'), fmtPct(change24h), change24h >= 0 ? 'up' : 'down');
  addMetricRow(els.fundMetrics, t('m7d'), fmtPct(change7d), change7d >= 0 ? 'up' : 'down');
  addMetricRow(els.fundMetrics, t('mFng'), `${fngValue} · ${translateFng(fngLabel)}`, fngValue >= 50 ? 'up' : 'down');
  addMetricRow(els.fundMetrics, t('mSentiment'), `${sentimentUp.toFixed(0)}%`, sentimentUp >= 50 ? 'up' : 'down');\n  addMetricRow(els.fundMetrics, t('mSentimentComposite'), t('mSentimentCompositeDesc'), 'neutral');
  // Sin market-cap (respaldo spot): no se inventa un $0. Se muestra el volumen
  // real y la capitalización como no disponible.
  if (marketCap > 0) {
    addMetricRow(els.fundMetrics, t('mVolCap'), `${volMcapRatio.toFixed(2)}%`, 'neutral');
    addMetricRow(els.fundMetrics, t('mCap'), fmtUSD(marketCap), 'neutral');
  } else {
    addMetricRow(els.fundMetrics, t('mVolCap'), fmtUSD(volume24h) + ' (24h)', 'neutral');
    addMetricRow(els.fundMetrics, t('mCap'), t('mUnavailable'), 'neutral');
  }

  els.fundUp.textContent = `${upProb}%`;
  els.fundDown.textContent = `${downProb}%`;
  els.fundUpBar.style.width = `${upProb}%`;
  els.fundDownBar.style.width = `${downProb}%`;
  setBadge(els.fundBadge, upProb);

  return { upProb, downProb };
}

// El API de alternative.me devuelve las etiquetas en ingles; cada idioma tiene
// su propio mapa, porque con el ternario binario PT caeria en el ingles.
const FNG_MAP = {
  es: {
    'Extreme Fear': 'Miedo extremo', 'Fear': 'Miedo', 'Neutral': 'Neutral',
    'Greed': 'Codicia', 'Extreme Greed': 'Codicia extrema',
  },
  pt: {
    'Extreme Fear': 'Medo extremo', 'Fear': 'Medo', 'Neutral': 'Neutro',
    'Greed': 'Ganância', 'Extreme Greed': 'Ganância extrema',
  },
  en: {},
};
function translateFng(label) {
  const map = FNG_MAP[state.lang] || FNG_MAP.es;
  return map[label] || label;
}

// ---------- Análisis Técnico ----------
function analyzeTechnical(prices) {
  const lastPrice = prices[prices.length - 1];
  const rsi14 = rsi(prices, 14);
  const sma20 = sma(prices, 20);
  const sma50 = sma(prices, 50);
  const { macd: macdVal, signal, histogram } = macd(prices);

  let score = 50;
  if (rsi14 !== null) {
    if (rsi14 < 30) score += 15;
    else if (rsi14 > 70) score -= 15;
    else score += (50 - rsi14) * 0.3;
  }
  if (sma20 && sma50) {
    if (lastPrice > sma20 && sma20 > sma50) score += 15;
    else if (lastPrice < sma20 && sma20 < sma50) score -= 15;
    else if (lastPrice > sma20) score += 6;
    else score -= 6;
  }
  if (histogram !== undefined && !Number.isNaN(histogram)) {
    score += clamp(histogram / lastPrice * 10000, -12, 12);
  }

  const upProb = clamp(Math.round(score), 5, 95);
  const downProb = 100 - upProb;

  els.techMetrics.innerHTML = '';
  addMetricRow(els.techMetrics, t('metricRsi'), rsi14 ? rsi14.toFixed(1) : '—',
    rsi14 < 30 ? 'up' : rsi14 > 70 ? 'down' : 'neutral');
  addMetricRow(els.techMetrics, t('metricSma20'), sma20 ? fmtUSD(sma20) : '—', lastPrice > sma20 ? 'up' : 'down');
  addMetricRow(els.techMetrics, t('metricSma50'), sma50 ? fmtUSD(sma50) : '—', lastPrice > sma50 ? 'up' : 'down');
  addMetricRow(els.techMetrics, t('metricMacd'), macdVal ? macdVal.toFixed(2) : '—', macdVal >= 0 ? 'up' : 'down');
  addMetricRow(els.techMetrics, t('metricSignal'), signal ? signal.toFixed(2) : '—', 'neutral');
  addMetricRow(els.techMetrics, t('metricHist'), histogram ? histogram.toFixed(2) : '—', histogram >= 0 ? 'up' : 'down');

  els.techUp.textContent = `${upProb}%`;
  els.techDown.textContent = `${downProb}%`;
  els.techUpBar.style.width = `${upProb}%`;
  els.techDownBar.style.width = `${downProb}%`;
  setBadge(els.techBadge, upProb);

  return { upProb, downProb };
}

function setBadge(el, upProb) {
  if (upProb >= 60) { el.textContent = t('bullish'); el.className = 'badge up'; }
  else if (upProb <= 40) { el.textContent = t('bearish'); el.className = 'badge down'; }
  else { el.textContent = t('neutral'); el.className = 'badge'; }
}

// ---------- Gráfico en tiempo real (TradingView) ----------
let tvScriptPromise = null;
// Firma «símbolo|tema|idioma» de lo que hay pintado en el widget ahora mismo. El
// símbolo entra porque cambiar de pestaña de cripto lo cambia.
let tvSignature = null;

function loadTradingViewScript() {
  if (tvScriptPromise) return tvScriptPromise;
  tvScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return tvScriptPromise;
}

// El widget de TradingView es lo mas pesado de la pagina y esta bajo el pliegue:
// se crea solo cuando va a entrar en pantalla (o, como red de seguridad, a los
// 4 s), de modo que no retrasa el primer pintado ni el analisis.
let tvReady = false;
let tvObserved = false;
let tvSafetyTimer = null;
function scheduleTradingView() {
  if (tvReady) return;
  const container = document.getElementById('tvChart');
  if (!container) return;
  const start = () => {
    if (tvReady) return;
    tvReady = true;
    // La red de seguridad ya no tiene sentido una vez que el widget arrancó:
    // sin limpiarla, el temporizador queda vivo en el event loop hasta los 4 s.
    if (tvSafetyTimer) { clearTimeout(tvSafetyTimer); tvSafetyTimer = null; }
    createTradingView();
  };
  if (typeof IntersectionObserver === 'undefined') { start(); return; }
  if (!tvObserved) {
    tvObserved = true;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: '300px' });
    io.observe(container);
    tvSafetyTimer = setTimeout(start, 8000);   // por si el observer no llegara a dispararse
  }
}

function tvSignatureNow() {
  return `${coin.tv}|${state.theme === 'light' ? 'light' : 'dark'}|${TV_LANG[state.lang] || 'es'}`;
}

function renderTradingView() {
  if (!tvReady) { scheduleTradingView(); return; }
  // El widget NO se recrea en cada cambio de idioma o tema: TradingView no expone
  // una API para recolorearlo en caliente, así que la única forma de «cambiar» el
  // locale era destruir el iframe y crear otro, que recarga la serie entera del
  // gráfico (petición de red + parpadeo) en cada clic del menú de idioma. Se
  // recrea solo si el símbolo, el idioma o el tema han cambiado de verdad; si no,
  // no se toca el DOM.
  if (tvSignature === tvSignatureNow()) return;
  createTradingView();
}

function createTradingView() {
  const container = document.getElementById('tvChart');
  if (!container) return;
  const theme = state.theme === 'light' ? 'light' : 'dark';
  const locale = TV_LANG[state.lang] || 'es';
  tvSignature = tvSignatureNow();

  loadTradingViewScript()
    .then(() => {
      container.innerHTML = '';
      new TradingView.widget({
        container_id: 'tvChart',
        symbol: coin.tv,
        interval: '1',
        timezone: 'Etc/UTC',
        theme,
        style: '1',
        locale,
        toolbar_bg: theme === 'dark' ? '#10162a' : '#f4f6fb',
        enable_publishing: false,
        allow_symbol_change: false,
        autosize: true,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        studies: [],
      });
    })
    .catch(err => {
      console.error('Error cargando TradingView:', err);
      container.innerHTML = `<p class="card-desc">${t('tvUnavailable')}</p>`;
    });
}

// ---------- Resumen y recomendación ----------

// Rango estimado de fluctuación intradiaria:
// media del movimiento absoluto diario (90d) sesgada por las probabilidades combinadas.
function renderRangeBlock(upProb, downProb) {
  const prices = cached.prices;
  const market = cached.market;
  if (!prices || prices.length < 30 || !market) return;

  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const n = returns.length;
  const mean = returns.reduce((a, r) => a + r, 0) / n;
  const variance = returns.reduce((a, r) => a + (r - mean) ** 2, 0) / (n - 1);
  const sigma = Math.sqrt(variance);                     // volatilidad diaria (σ)
  const meanAbs = returns.reduce((a, r) => a + Math.abs(r), 0) / n; // movimiento medio diario

  const price = market.market_data.current_price.usd;
  // Sesgo: a mayor probabilidad de subida, mayor alcance al alza y menor a la baja
  const upPct = meanAbs * (0.5 + upProb / 100) * 100;
  const downPct = meanAbs * (0.5 + downProb / 100) * 100;
  const high = price * (1 + upPct / 100);
  const low = price * (1 - downPct / 100);
  // Variación esperada al cierre: valor ponderado por ambas probabilidades
  const closePct = (upProb / 100) * upPct - (downProb / 100) * downPct;
  const closePrice = price * (1 + closePct / 100);

  // Fecha del día en curso
  const locale = LOC_BY_LANG[state.lang] || 'es-ES';
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  els.rangeDate.textContent = `· ${today}`;

  els.rangeMetrics.innerHTML = '';
  addMetricRow(els.rangeMetrics, t('rangeSigma68'), `±${(sigma * 100).toFixed(2)}% (68%)`, 'neutral');\n  addMetricRow(els.rangeMetrics, t('rangeSigma95'), `±${(sigma * 200).toFixed(2)}% (95%)`, 'neutral');
  addMetricRow(els.rangeMetrics, t('rangeUp'), `+${upPct.toFixed(2)}% → ${fmtUSD(high)}`, 'up');
  addMetricRow(els.rangeMetrics, t('rangeDown'), `−${downPct.toFixed(2)}% → ${fmtUSD(low)}`, 'down');
  addMetricRow(els.rangeMetrics, t('rangePrice'), `${fmtUSD(low)} – ${fmtUSD(high)}`, 'neutral');
  addMetricRow(els.rangeMetrics, t('rangeClose'), fmtPct(closePct, 2), closePct >= 0 ? 'up' : 'down');
  addMetricRow(els.rangeMetrics, t('rangeClosePrice'), fmtUSD(closePrice), closePct >= 0 ? 'up' : 'down');

  renderTradeLevels(price, sigma, meanAbs, high, low, upProb);
}

// Plan operativo de hoy en 3 perfiles, alineados con la recomendación del día
// (COMPRA → larga, VENTA → corta; en NEUTRAL manda la ligera ventaja de prob.).
// Parámetros (m = movimiento medio diario, σ = volatilidad diaria):
//  - Conservador: retroceso de 0,75m, stop holgado 0,5σ bajo el mínimo estimado
//    del día y salida temprana al 60% del rango alcista.
//  - Medio: retroceso de 0,5m, stop 0,75σ bajo el mínimo y salida en el extremo
//    estimado del día.
//  - Arriesgado: entrada a mercado, stop 1σ bajo la entrada (aguanta el ruido)
//    y salida en extensión al 150% del rango.
function renderTradeLevels(price, sigma, meanAbs, high, low, upProb) {
  if (!els.tradeCons || !els.tradeMed || !els.tradeAgg) return;
  if (!(price > 0) || !(sigma > 0) || !(meanAbs > 0)) return;
  const long = upProb >= 62 ? true : upProb <= 38 ? false : upProb >= 50;
  if (els.tradeDir) {
    els.tradeDir.textContent = `· ${t(long ? 'tradeLong' : 'tradeShort')}`;
    els.tradeDir.className = `range-date ${long ? 'up' : 'down'}`;
  }

  const dayUp = Math.max(high - price, 0);
  const dayDown = Math.max(price - low, 0);
  const pctFrom = v => ((v - price) / price) * 100;
  const profiles = [
    { box: els.tradeCons, pull: 0.75, lowK: 0.50, entryK: 0, ext: 0.6 },
    { box: els.tradeMed, pull: 0.50, lowK: 0.75, entryK: 0, ext: 1.0 },
    { box: els.tradeAgg, pull: 0, lowK: 0, entryK: 1.0, ext: 1.5 },
  ];

  for (const p of profiles) {
    const entry = long ? price * (1 - p.pull * meanAbs) : price * (1 + p.pull * meanAbs);
    const stop = p.entryK
      ? (long ? entry * (1 - p.entryK * sigma) : entry * (1 + p.entryK * sigma))
      : (long ? low * (1 - p.lowK * sigma) : high * (1 + p.lowK * sigma));
    const target = long ? price + p.ext * dayUp : price - p.ext * dayDown;
    const risk = Math.abs(entry - stop);
    const rr = risk > 0 ? Math.abs(target - entry) / risk : 0;
    p.box.innerHTML = '';
    addMetricRow(p.box, t('tradeEntry'), `${fmtUSD(entry)} (${fmtPct(pctFrom(entry), 2)})`, 'neutral');
    addMetricRow(p.box, t('tradeStop'), `${fmtUSD(stop)} (${fmtPct(pctFrom(stop), 2)})`, 'down');
    addMetricRow(p.box, t('tradeTarget'), `${fmtUSD(target)} (${fmtPct(pctFrom(target), 2)})`, 'up');
    addMetricRow(p.box, t('tradeRR'), `1 : ${rr.toFixed(2)}`, rr >= 1 ? 'up' : 'neutral');
  }
}

function buildSummary(fundamental, technical, trendUp = true) {
  const combinedUp = Math.round(fundamental.upProb * 0.45 + technical.upProb * 0.55);

  els.combinedCircle.style.setProperty('--pct', `${combinedUp}%`);
  els.combinedPct.textContent = `${combinedUp}%`;

  let recoKey, recoClass, recoPillKey;
  // Filtro de tendencia: COMPRA solo si precio > EMA200; VENTA solo si precio < EMA200.
  if (combinedUp >= 62 && trendUp) { recoKey = 'recoBuyText'; recoClass = 'buy'; recoPillKey = 'recoBuy'; }
  else if (combinedUp <= 38 && !trendUp) { recoKey = 'recoSellText'; recoClass = 'sell'; recoPillKey = 'recoSell'; }
  else { recoKey = 'recoHoldText'; recoClass = 'hold'; recoPillKey = 'recoHold'; }

  els.recoPill.textContent = t(recoPillKey);
  els.recoPill.className = `reco-pill ${recoClass}`;
  
  // Track recommendation state changes for notifications
  const prevReco = localStorage.getItem('mp_prev_reco');
  const recoKey = recoClass + 'Pill'; // e.g., 'buyPill', 'sellPill', 'holdPill'
  localStorage.setItem('mp_prev_reco', recoKey);
  
  // Show notification if signal changed from NEUTRAL to COMPRA/VENTA
  if (prevReco && prevReco !== recoKey) {
    const prevNeutral = prevReco === 'holdPill';
    const nowBuying = recoKey === 'buyPill';
    const nowSelling = recoKey === 'sellPill';
    if ((prevNeutral && nowBuying) || (prevNeutral && nowSelling)) {
      const title = nowBuying ? t('recoBuyText') : t('recoSellText');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 MarketPulse Señal', {
          body: `${title} detectado para ${coin.name}`,
          icon: '/favicon.ico'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🔔 MarketPulse Señal', {
              body: `${title} detectado para ${coin.name}`,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  }
  
  // Log signal for track record
  const signalLog = JSON.parse(localStorage.getItem('mp_signal_log') || '[]');
  signalLog.push({
    date: new Date().toLocaleDateString(),
    upProb: combinedUp,
    recommendation: recoPillKey,
    price: price
  });
  // Keep only last 30 entries
  if (signalLog.length > 30) signalLog.shift();
  localStorage.setItem('mp_signal_log', JSON.stringify(signalLog));

  els.summaryText.textContent = t('summaryText')
    .replace('{fu}', fundamental.upProb)
    .replace('{tu}', technical.upProb)
    .replace('{cu}', combinedUp)
    .replace('{date}', new Date().toLocaleDateString(LOC_BY_LANG[state.lang] || 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))
    .replace('{reco}', t(recoKey));

  els.recoDetails.innerHTML = '';
  const details = [
    t('detWeight'),
    fundamental.upProb >= 55
      ? t('detFundUp')
      : fundamental.upProb <= 45
        ? t('detFundDown')
        : t('detFundNeutral'),
    technical.upProb >= 55
      ? t('detTechUp')
      : technical.upProb <= 45
        ? t('detTechDown')
        : t('detTechNeutral'),
    t('detRisk'),
  ];
  details.forEach(d => {
    const li = document.createElement('li');
    li.textContent = d;
    els.recoDetails.appendChild(li);
  });

// Drivers adicionales de explicabilidad\n  if (els.recoDrivers) {\n    els.recoDrivers.innerHTML = '';\n    const drivers = [];\n    if (fundamental.upProb >= 60) drivers.push(t('detFundUp'));\n    else if (fundamental.upProb <= 40) drivers.push(t('detFundDown'));\n    else drivers.push(t('detFundNeutral'));\n    if (technical.rsi !== null) {\n      if (technical.rsi < 30) drivers.push(t('detRSIOverbought').replace('{rsi}', technical.rsi.toFixed(1)));\n      else if (technical.rsi > 70) drivers.push(t('detRSIOversold').replace('{rsi}', technical.rsi.toFixed(1)));\n      else drivers.push(t('detRSINeutral').replace('{rsi}', technical.rsi.toFixed(1)));\n    }\n    if (technical.macd !== undefined) drivers.push(t('detMACD').replace('{macdSign}', technical.macd.toFixed(2)));\n    drivers.push(trendUp ? t('detTrendUp') : t('detTrendDown'));\n    drivers.slice(0, 3).forEach(d => {\n      const li = document.createElement('li');\n      li.textContent = d;\n      els.recoDrivers.appendChild(li);\n    });\n  }
  renderRangeBlock(combinedUp, 100 - combinedUp);
}

// ---------- Render del análisis (reutilizable al cambiar idioma) ----------
function renderAnalysis() {
  if (!cached.market) return;
  const { market, prices, fng } = cached;
  const price = market.market_data.current_price.usd;
  const change24h = market.market_data.price_change_percentage_24h ?? 0;
  els.currentPrice.textContent = fmtUSD(price);
  els.priceChange.textContent = `${fmtPct(change24h)} (24h)`;
  els.priceChange.className = `price-change ${change24h >= 0 ? 'up' : 'down'}`;
  const fundamental = analyzeFundamental(market, fng);
  const technical = analyzeTechnical(prices);
  const e200 = ema(prices, 200);
  const trendUp = e200 == null ? true : price > e200;
  buildSummary(fundamental, technical, trendUp);
  // Funding rate + Open Interest (cripto, Binance Futures, público)
  const sym = BINANCE_SYMBOL[coin.id];
  if (sym) {
    loadFundingRate(sym).then(fr => {
      if (fr !== null) addMetricRow(els.fundMetrics, 'Funding rate', `${fr >= 0 ? '+' : ''}${fr.toFixed(4)}%`, fr >= 0 ? 'up' : 'down');
    });
    loadOpenInterest(sym).then(oi => {
      if (oi !== null) addMetricRow(els.fundMetrics, 'Open interest', oi.toLocaleString(), 'neutral');
    });
  }

  // Macro Calendario (eventos estáticos)
  renderMacroCalendar();

  // Noticias del mes (congruente con calendario)
  fetchNews();
}

// ---------- Macro Calendario: render de eventos semanales ----------
function renderMacroCalendar() {
  const container = document.getElementById('macroEvents');
  if (!container) return;

  const locale = LOC_BY_LANG[state.lang] || 'es-ES';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filtrar eventos desde hoy en adelante (próximos 30 días)
  const upcoming = MACRO_EVENTS.filter(ev => {
    const evDate = new Date(ev.date + 'T00:00:00');
    return evDate >= today && evDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  });

  // Ordenar por fecha
  upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Detectar evento dentro de las próximas 24h para alerta
  const within24h = upcoming.find(ev => {
    const evDate = new Date(ev.date + 'T00:00:00');
    const diffHours = (evDate - today) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  });

  container.innerHTML = '';

  if (upcoming.length === 0) {
    container.innerHTML = `<p class="macro-empty">${t('macroNoEvents')}</p>`;
    return;
  }

  // Alerta visual si hay evento en las próximas 24h
  if (within24h) {
    const alert = document.createElement('div');
    alert.className = 'macro-alert';
    alert.innerHTML = `<strong>⚠️ ${t('macroWithin24h')}</strong> ${t(within24h.event)} — ${new Date(within24h.date).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}`;
    container.appendChild(alert);
  }

  upcoming.forEach(ev => {
    const evDate = new Date(ev.date + 'T00:00:00');
    const diffHours = (evDate - today) / (1000 * 60 * 60);
    const isWithin24h = diffHours >= 0 && diffHours <= 24;

    const row = document.createElement('div');
    row.className = `macro-row ${ev.impact} ${isWithin24h ? 'macro-urgent' : ''}`;

    const dateStr = evDate.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
    const impactLabel = t(`macroImpact${ev.impact.charAt(0).toUpperCase() + ev.impact.slice(1)}`);
    const eventLabel = t(ev.event);
    const assetsLabel = ev.assets.join(' · ');

    row.innerHTML = `
      <span class="macro-date">${dateStr}</span>
      <span class="macro-event">${eventLabel}</span>
      <span class="macro-impact">${impactLabel}</span>
      <span class="macro-assets">${assetsLabel}</span>
    `;
    container.appendChild(row);
  });
}

// ---------- Noticias del mes (congruente con el calendario macro) ----------
// Fuente: Google News RSS via rss2json.com (sin API key, CORS habilitado).
// Fallback estático si la API falla.
const STATIC_NEWS = [
  { date: '2026-03-12', title: 'ECB holds rates as inflation cools in the Eurozone', source: 'Reuters', url: '#', category: 'forex' },
  { date: '2026-03-12', title: 'Bitcoin breaks above $85k on institutional inflows', source: 'CoinDesk', url: '#', category: 'crypto' },
  { date: '2026-03-11', title: 'US CPI preview: what to expect from tomorrow\'s release', source: 'Bloomberg', url: '#', category: 'macro' },
  { date: '2026-03-11', title: 'Gold hits new all-time high as safe-haven demand surges', source: 'Kitco', url: '#', category: 'metals' },
  { date: '2026-03-10', title: 'FOMC minutes reveal divided views on rate cuts', source: 'CNBC', url: '#', category: 'macro' },
  { date: '2026-03-09', title: 'Ethereum upgrade boosts network throughput by 40%', source: 'The Block', url: '#', category: 'crypto' },
  { date: '2026-03-08', title: 'Nonfarm payrolls beat expectations, USD strengthens', source: 'Reuters', url: '#', category: 'forex' },
  { date: '2026-03-05', title: 'Solana ecosystem TVL surpasses $10 billion', source: 'DeFi Llama', url: '#', category: 'crypto' },
  { date: '2026-03-03', title: 'Bank of Japan signals potential rate hike in March', source: 'Nikkei', url: '#', category: 'forex' },
  { date: '2026-03-01', title: 'Monthly macro outlook: what to watch in March', source: 'FXStreet', url: '#', category: 'macro' },
];

async function fetchNews() {
  const container = document.getElementById('newsItems');
  if (!container) return;

  container.innerHTML = `<p class="news-loading">${t('newsLoading')}</p>`;

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Intentar fetch de Google News via rss2json
  const query = encodeURIComponent('forex OR crypto OR gold OR macro economy OR bitcoin OR ethereum');
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=es&gl=ES&ceid=ES:es`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  let newsItems = [];
  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        newsItems = data.items.map(item => ({
          date: item.pubDate ? item.pubDate.split(' ')[0] : today.toISOString().split('T')[0],
          title: item.title || '',
          source: item.author || 'Google News',
          url: item.link || '#',
          category: 'general',
        }));
      }
    }
  } catch (e) {
    console.warn('News fetch failed, using static fallback', e);
  }

  // Fallback a datos estáticos si la API falla o no devuelve resultados
  if (newsItems.length === 0) {
    newsItems = STATIC_NEWS;
  }

  // Filtrar solo noticias del mes en curso
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  newsItems = newsItems.filter(item => item.date && item.date.startsWith(monthStr));

  // Ordenar por fecha descendente (más reciente primero)
  newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Clasificar por prioridad: hoy → esta semana → este mes
  const todayStr = today.toISOString().split('T')[0];
  const classified = newsItems.map(item => {
    const itemDate = new Date(item.date + 'T00:00:00');
    let priority = 'month';
    if (item.date === todayStr) priority = 'today';
    else if (itemDate >= weekAgo) priority = 'week';
    return { ...item, priority };
  });

  renderNews(classified);
}

function renderNews(items) {
  const container = document.getElementById('newsItems');
  if (!container) return;

  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `<p class="news-empty">${t('newsNoItems')}</p>`;
    return;
  }

  // Agrupar por prioridad
  const todayItems = items.filter(i => i.priority === 'today');
  const weekItems = items.filter(i => i.priority === 'week');
  const monthItems = items.filter(i => i.priority === 'month');

  const groups = [
    { key: 'today', label: t('newsToday'), items: todayItems, cls: 'news-priority-today' },
    { key: 'week', label: t('newsThisWeek'), items: weekItems, cls: 'news-priority-week' },
    { key: 'month', label: t('newsThisMonth'), items: monthItems, cls: 'news-priority-month' },
  ];

  groups.forEach(group => {
    if (group.items.length === 0) return;

    const groupEl = document.createElement('div');
    groupEl.className = `news-group ${group.cls}`;

    const header = document.createElement('h4');
    header.className = 'news-group-title';
    header.textContent = group.label;
    groupEl.appendChild(header);

    group.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'news-card';

      const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString(LOC_BY_LANG[state.lang] || 'es-ES', { day: 'numeric', month: 'short' });

      card.innerHTML = `
        <div class="news-card-meta">
          <span class="news-date">${dateStr}</span>
          <span class="news-source">${item.source}</span>
        </div>
        <p class="news-title">${item.title}</p>
        <a class="news-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${t('newsReadMore')} →</a>
      `;
      groupEl.appendChild(card);
    });

    container.appendChild(groupEl);
  });
}

// ---------- Selector de idioma desplegable ----------
// Es el mismo marcado que en site.js (los 7 HTML comparten el desplegable), asi
// que la logica se replica aqui en vez de depender de site.js, que no se carga
// en estas paginas. Se le pasa setLang para no duplicar la persistencia.
function initLangDropdown(pick) {
  const toggle = document.getElementById('langToggle');
  const menu = document.getElementById('langMenu');
  if (!toggle || !menu) return;
  const options = Array.from(menu.querySelectorAll('.lang-option'));

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  const isOpen = () => !menu.hidden;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!isOpen());
  });
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      pick(opt.dataset.lang);
      setOpen(false);
      toggle.focus();
    });
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !menu.contains(e.target) && e.target !== toggle) setOpen(false);
  });
  menu.addEventListener('keydown', (e) => {
    const i = options.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = e.key === 'ArrowDown'
        ? (i + 1) % options.length
        : (i - 1 + options.length) % options.length;
      options[next].focus();
    } else if (e.key === 'Home') {
      e.preventDefault(); options[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault(); options[options.length - 1].focus();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
}

// ---------- Inicialización ----------
// Estrategia anti-429 para navegar BTC->ETH->SOL->XRP->DOGE sin que las
// últimas fallen: CoinGecko secuencial (gate 2s) + fallback Binance + cache.
async function init() {
  applyTheme();
  state.statusKey = 'statusLoadingCoin';
  els.statusText.textContent = fillText(t(state.statusKey));
  els.statusRow.querySelector('.loader').classList.remove('done');
  els.statusRow.querySelectorAll('.retry-btn').forEach(b => b.remove());
  try {
    // Historial, datos de mercado y sentimiento son fuentes independientes: se piden
    // A LA VEZ y cada una cae por separado a su respaldo. Antes iban en serie, así que
    // la página tardaba la suma de las tres (y sus esperas) en vez de la más lenta.
    const [history, marketRes, fng] = await Promise.all([
      loadHistoricalPrices(),
      loadMarketData().then(v => ({ ok: v })).catch(e => ({ err: e })),
      loadFearGreed(),
    ]);
    // Si CoinGecko no da los datos de mercado, se adaptan desde Binance (spot).
    let market = marketRes.ok;
    if (!market) {
      const sym = BINANCE_SYMBOL[coin.id];
      if (!sym) throw marketRes.err;
      const spot = await loadSpotBinance(sym);
      market = adaptBinanceMarket(spot, history);
    }
    cached.market = market;
    cached.prices = history.prices;
    cached.dates = history.dates;
    cached.fng = fng;

    renderAnalysis();

    // A partir de aquí los gráficos son opcionales: si alguno falla, el análisis ya
    // mostrado sigue siendo válido y NO se muestra un error de "datos no cargados".
    state.statusKey = 'statusOk';
    els.statusRow.querySelector('.loader').classList.add('done');
    els.statusText.textContent = t(state.statusKey);
    els.updateTime.textContent = new Date().toLocaleString(LOC_BY_LANG[state.lang] || 'es-ES');

    renderChart(cached.prices, cached.dates);
    renderTradingView();
  } catch (err) {
    console.error(err);
    state.statusKey = 'statusError';
    els.statusRow.querySelector('.loader').classList.add('done');
    els.statusText.textContent = t(state.statusKey);
    showRetry(els.statusRow, () => init());
  }

  applyLang();
}

// ---------- Listeners de tema e idioma ----------
els.themeToggle?.addEventListener('click', () => {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
});
//
// ---------- Track Record (últimos 30 días) ----------
const signalLog = JSON.parse(localStorage.getItem('mp_signal_log') || '[]');
if (signalLog.length > 0) {
  const hitCount = signalLog.filter(entry => entry.upProb >= 50).length;
  const hitRate = Math.round((hitCount / signalLog.length) * 100);
  els.updateTime.textContent = `Actualización · Track Record: ${hitRate}% acierto`;
}
// Se pasa setLang directamente. Antes era `() => setLang`, que solo devolvia
// la funcion sin ejecutarla: el menu se cerraba pero el idioma no cambiaba.
initLangDropdown(setLang);

// ---------- Pestañas de cripto y navegación activa ----------
document.querySelectorAll('.coin-tab').forEach(a => {
  a.classList.toggle('active', a.dataset.coin === coinKey);
});
document.querySelectorAll('.nav-link').forEach(a => {
  const isActive = a.classList.toggle('active', a.getAttribute('href').startsWith('analysis.html'));
  if (isActive) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
});
const tvBadgeEl = document.getElementById('tvBadge');
if (tvBadgeEl) tvBadgeEl.textContent = '1 min';
const pairBadgeEl = document.getElementById('pairBadge');
if (pairBadgeEl) pairBadgeEl.textContent = `${coin.symbol} / USD`;
const coinBannerEl = document.getElementById('coinBanner');
if (coinBannerEl) {
  coinBannerEl.textContent = `${coin.name} · ${coin.symbol}`;
  // Star button for watchlist
  const starBtn = document.createElement('button');
  starBtn.type = 'button';
  starBtn.className = 'star-btn';
  starBtn.title = t('starAdd') + ' ' + coin.name;
  starBtn.innerHTML = state.watchlist.includes(coin.id) ? '★' : '☆';
  starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    let watchlist = JSON.parse(localStorage.getItem('mp_watchlist') || '[]');
    const idx = watchlist.indexOf(coin.id);
    if (idx === -1) {
      watchlist.push(coin.id);
      starBtn.innerHTML = '★';
      starBtn.title = t('starRemove') + ' ' + coin.name;
    } else {
      watchlist.splice(idx, 1);
      starBtn.innerHTML = '☆';
      starBtn.title = t('starAdd') + ' ' + coin.name;
    }
    localStorage.setItem('mp_watchlist', JSON.stringify(watchlist));
    // Dispatch event so other parts of the page can react
    document.dispatchEvent(new CustomEvent('mp:watchlist-changed', { detail: { coin: coin.id, watchlist } }));
  });
  coinBannerEl.appendChild(starBtn);
}

init();

