// ---------- User Dashboard (profile.html) ----------
(function() {
  let currentUser=null,userProfile=null,userSub=null;
  function isAdmin(){return userSub?.plans?.name==='Admin'||currentUser?.email==='admin@marketpulse.com';}

  const sections={
    dashboard:()=>{const h=JSON.parse(localStorage.getItem('mp_history')||'[]');return`<h1>Dashboard</h1>
      <div class="dash-cards">
        <div class="dash-card"><div class="dash-card-icon">⭐</div><div class="dash-card-info"><div class="dash-card-label">Plan</div><div class="dash-card-value">${userSub?.plans?.name||'Free'}</div></div></div>
        <div class="dash-card"><div class="dash-card-icon">📅</div><div class="dash-card-info"><div class="dash-card-label">Miembro desde</div><div class="dash-card-value">${new Date(currentUser.created_at).toLocaleDateString('es-ES')}</div></div></div>
        <div class="dash-card"><div class="dash-card-icon">📰</div><div class="dash-card-info"><div class="dash-card-label">Noticias leídas</div><div class="dash-card-value">${h.filter(x=>x.type==='news').length}</div></div></div>
        <div class="dash-card"><div class="dash-card-icon">📈</div><div class="dash-card-info"><div class="dash-card-label">Análisis vistos</div><div class="dash-card-value">${h.filter(x=>x.type==='analysis').length}</div></div></div>
      </div><h2 style="margin:24px 0 12px;">📰 Noticias Relevantes</h2><div id="dashNews"></div>`;},
    profile:()=>`<h1>Mi Perfil</h1><div class="profile-edit-card">
      <div class="profile-photo-section"><div class="profile-photo-large" id="profilePhoto">${(userProfile?.full_name||currentUser.email)[0].toUpperCase()}</div>
      <button class="btn btn-secondary" id="changePhotoBtn">Cambiar foto</button><input type="file" id="photoInput" accept="image/*" style="display:none;"></div>
      <div class="profile-form"><div class="form-group"><label>Nombre</label><input type="text" id="editName" value="${userProfile?.full_name||''}"></div>
      <div class="form-group"><label>Email</label><input type="email" id="editEmail" value="${currentUser.email}" disabled></div>
      <button class="btn btn-primary" id="saveProfileBtn">Guardar cambios</button><div id="profileMsg" class="auth-message"></div></div></div>`,
    settings:()=>`<h1>Configuración</h1>
      <div class="settings-card"><h2>🔔 Notificaciones por Email</h2>
        <div class="setting-row"><div><div class="setting-label">Noticias del mercado</div></div><label class="toggle"><input type="checkbox" id="notifyNews" ${localStorage.getItem('mp_notify_news')!=='0'?'checked':''}><span class="toggle-slider"></span></label></div>
        <div class="setting-row"><div><div class="setting-label">Alertas macro</div></div><label class="toggle"><input type="checkbox" id="notifyMacro" ${localStorage.getItem('mp_notify_macro')==='1'?'checked':''}><span class="toggle-slider"></span></label></div>
        <div class="setting-row"><div><div class="setting-label">Publicidad y ofertas</div></div><label class="toggle"><input type="checkbox" id="notifyAds" ${localStorage.getItem('mp_notify_ads')==='1'?'checked':''}><span class="toggle-slider"></span></label></div></div>
      <div class="settings-card"><h2>🔒 Cambiar Contraseña</h2>
        <div class="form-group"><label>Contraseña actual</label><input type="password" id="currentPass"></div>
        <div class="form-group"><label>Nueva contraseña</label><input type="password" id="newPass" minlength="6"></div>
        <div class="form-group"><label>Confirmar</label><input type="password" id="confirmPass" minlength="6"></div>
        <button class="btn btn-primary" id="changePassBtn">Actualizar contraseña</button><div id="passMessage" class="auth-message"></div></div>`,
    news:()=>`<h1>Noticias del Mercado</h1><div id="userNewsList"></div>`,
    history:()=>{const h=JSON.parse(localStorage.getItem('mp_history')||'[]');return`<h1>Historial de Intereses</h1>
      <p class="section-desc">Tus análisis y noticias consultadas.</p>
      ${h.length?h.slice(-20).reverse().map(i=>`<div class="history-item"><span class="history-type ${i.type}">${i.type==='news'?'📰':'📈'}</span><span class="history-title">${i.title}</span><span class="history-date">${new Date(i.date).toLocaleDateString('es-ES')}</span></div>`).join(''):'<p style="color:var(--text-2);padding:20px;">Sin historial.</p>'}`;},
    support:()=>`<h1>Soporte</h1><div class="support-card"><h2>💬 Contacta con nosotros</h2>
      <div class="form-group"><label>Asunto</label><select id="supportSubject"><option>Problema técnico</option><option>Facturación</option><option>Sugerencia</option><option>Otro</option></select></div>
      <div class="form-group"><label>Mensaje</label><textarea id="supportMessage" rows="5"></textarea></div>
      <button class="btn btn-primary" id="supportSendBtn">Enviar mensaje</button><div id="supportMsg" class="auth-message"></div></div>`,
    faq:()=>`<h1>Preguntas Frecuentes</h1><div class="faq-list">
      <div class="faq-item"><h3>¿Qué es MarketPulse?</h3><p>Plataforma de análisis de mercado en tiempo real.</p></div>
      <div class="faq-item"><h3>¿Datos en tiempo real?</h3><p>Sí, APIs de CoinGecko, Binance y noticias.</p></div>
      <div class="faq-item"><h3>¿Cancelar suscripción?</h3><p>Sí, en cualquier momento.</p></div>
      <div class="faq-item"><h3>¿Asesoría financiera?</h3><p>No, análisis automático estadístico.</p></div></div>`,
    about:()=>`<h1>Sobre MarketPulse</h1><div class="about-content">
      <p>MarketPulse democratiza el acceso a análisis de mercado profesional.</p>
      <h2>Valores</h2><ul><li><strong>Transparencia:</strong> Datos públicos.</li><li><strong>Precisión:</strong> Indicadores de calidad.</li><li><strong>Accesibilidad:</strong> Para todos.</li></ul>
      <p>MarketPulse v3.9.0 — © 2026</p></div>`,
    admin:()=>`<h1>🛡️ Panel de Administración</h1>
      <div class="admin-stats">
        <div class="dash-card"><div class="dash-card-icon">👥</div><div class="dash-card-info"><div class="dash-card-label">Usuarios</div><div class="dash-card-value" id="adminUserCount">—</div></div></div>
        <div class="dash-card"><div class="dash-card-icon">⭐</div><div class="dash-card-info"><div class="dash-card-label">Premium</div><div class="dash-card-value" id="adminPremiumCount">—</div></div></div>
      </div><h2>👥 Usuarios Registrados</h2><div id="adminUsers"></div>`,
  };

  function switchSection(name){
    document.querySelectorAll('.sidebar-link').forEach(l=>l.classList.remove('active'));
    document.querySelector(`.sidebar-link[data-section="${name}"]`)?.classList.add('active');
    const c=document.getElementById('userContent');
    if(c&&sections[name]){c.innerHTML=sections[name]();bindSectionEvents(name);}
  }

  function bindSectionEvents(name){
    if(name==='profile'){
      document.getElementById('changePhotoBtn')?.addEventListener('click',()=>document.getElementById('photoInput').click());
      document.getElementById('photoInput')?.addEventListener('change',(e)=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=(ev)=>{const el=document.getElementById('profilePhoto');if(el){el.textContent='';el.style.backgroundImage=`url(${ev.target.result})`;el.style.backgroundSize='cover';}localStorage.setItem('mp_avatar',ev.target.result);};r.readAsDataURL(f);}});
      document.getElementById('saveProfileBtn')?.addEventListener('click',async()=>{const n=document.getElementById('editName').value;const m=document.getElementById('profileMsg');try{await MarketPulseAuth.initSupabase().from('profiles').update({full_name:n}).eq('id',currentUser.id);userProfile={...userProfile,full_name:n};m.textContent='Perfil actualizado.';m.className='auth-message success';document.getElementById('sidebarName').textContent=n;}catch(e){m.textContent='Error: '+e.message;m.className='auth-message error';}});
    }
    if(name==='settings'){
      ['notifyNews','notifyMacro','notifyAds'].forEach(id=>{document.getElementById(id)?.addEventListener('change',(e)=>{localStorage.setItem('mp_'+id.replace('notify','notify_').toLowerCase(),e.target.checked?'1':'0');});});
      document.getElementById('changePassBtn')?.addEventListener('click',async()=>{const m=document.getElementById('passMessage');const np=document.getElementById('newPass').value;const cp=document.getElementById('confirmPass').value;if(np!==cp){m.textContent='Las contraseñas no coinciden.';m.className='auth-message error';return;}try{await MarketPulseAuth.initSupabase().auth.updateUser({password:np});m.textContent='Contraseña actualizada.';m.className='auth-message success';}catch(e){m.textContent='Error: '+e.message;m.className='auth-message error';}});
    }
    if(name==='support'){document.getElementById('supportSendBtn')?.addEventListener('click',()=>{const m=document.getElementById('supportMsg');m.textContent='Mensaje enviado. Te responderemos pronto.';m.className='auth-message success';});}
    if(name==='admin')loadAdminData();
    if(name==='news'||name==='dashboard')loadNews(name);
  }

  function loadNews(name){
    const c=name==='dashboard'?document.getElementById('dashNews'):document.getElementById('userNewsList');
    if(!c)return;
    const NEWS=[{id:'n1',date:'2026-03-11',title:'CPI de EE.UU. supera expectativas: inflación sube al 3.2%'},{id:'n2',date:'2026-03-12',title:'BCE mantiene tipos de interés sin cambios en 3.75%'},{id:'n3',date:'2026-03-13',title:'Bitcoin supera los $85,000 por entrada institucional récord'}];
    c.innerHTML=NEWS.map(n=>{const ds=new Date(n.date+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'});return`<a class="calendar-news-item" href="news.html?id=${n.id}"><span class="calendar-news-date">${ds}</span><span class="calendar-news-title">${n.title}</span><span class="calendar-news-arrow">→</span></a>`;}).join('');
  }

  async function loadAdminData(){
    try{const sb=MarketPulseAuth.initSupabase();const{data:users}=await sb.from('profiles').select('*');const{data:subs}=await sb.from('subscriptions').select('*, plans(*)');const uc=document.getElementById('adminUserCount');const pc=document.getElementById('adminPremiumCount');if(uc)uc.textContent=users?.length||0;if(pc)pc.textContent=subs?.filter(s=>s.status==='active')?.length||0;const c=document.getElementById('adminUsers');if(c&&users)c.innerHTML=users.map(u=>`<div class="history-item"><span class="history-type analysis">👤</span><span class="history-title">${u.full_name||u.id.substring(0,8)}</span><span class="history-date">${new Date(u.created_at).toLocaleDateString('es-ES')}</span></div>`).join('');}catch(e){console.warn('Admin error:',e);}
  }

  async function initDashboard(){
    const session=await MarketPulseAuth.getSession();
    if(!session){window.location.href='login.html';return;}
    currentUser=session.user;
    userProfile=await MarketPulseAuth.getUserProfile(currentUser.id).catch(()=>null);
    userSub=await MarketPulseAuth.getUserSubscription(currentUser.id).catch(()=>null);
    const name=userProfile?.full_name||currentUser.user_metadata?.full_name||currentUser.email?.split('@')[0]||'Usuario';
    const plan=userSub?.plans?.name||'Free';
    const av=document.getElementById('sidebarAvatar');const saved=localStorage.getItem('mp_avatar');
    if(av){if(saved){av.style.backgroundImage=`url(${saved})`;av.style.backgroundSize='cover';}else av.textContent=name[0].toUpperCase();}
    const sn=document.getElementById('sidebarName');if(sn)sn.textContent=name;
    const sp=document.getElementById('sidebarPlan');if(sp){sp.textContent=plan;sp.className='sidebar-plan'+(plan==='Premium'?' premium':'');}
    if(isAdmin())document.querySelectorAll('.admin-only').forEach(el=>el.style.display='block');
    document.querySelectorAll('.sidebar-link[data-section]').forEach(btn=>btn.addEventListener('click',()=>switchSection(btn.dataset.section)));
    document.getElementById('logoutBtn')?.addEventListener('click',async(e)=>{e.preventDefault();await MarketPulseAuth.signOut();window.location.href='index.html';});
    switchSection('dashboard');
  }
  initDashboard();
})();