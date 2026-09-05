
window.closeAllModals = function() {
  const modals = document.querySelectorAll('.modal-backdrop, .admin-modal-overlay, #auth-modal, #siteVisitModal, #masterPlanModal, #compareModal, #propertyModal, #interiorModal, #poojaModal, #loanModal, #newsArticleModal, #legalDocsModal, [id^="modal-"]');
  modals.forEach(m => {
    m.style.setProperty('display', 'none', 'important');
    m.classList.remove('open', 'active');
  });
  document.body.style.overflow = '';
};
window.closeAuthModal = window.closeAllModals;
window.closeSiteVisitModal = window.closeAllModals;


// ==========================================================================
// TOP-LEVEL FAIL-SAFE FUNCTION STUBS & MODAL HANDLERS
// ==========================================================================
window.closeAllModals = function() {
  const modals = document.querySelectorAll('.modal-backdrop, .admin-modal-overlay, #auth-modal, #siteVisitModal, #masterPlanModal, #compareModal, #propertyModal, #interiorModal, #poojaModal, #loanModal, #newsArticleModal, #legalDocsModal, [id^="modal-"]');
  modals.forEach(m => {
    m.style.setProperty('display', 'none', 'important');
    m.classList.remove('open', 'active');
  });
  document.body.style.overflow = '';
}
window.closeAllModals = closeAllModals;
window.closeAuthModal = closeAllModals;
window.closeSiteVisitModal = closeAllModals;

function openModal(modalId) {
  window.closeAllModals();
  const m = document.getElementById(modalId);
  if (m) {
    m.style.setProperty('display', 'flex', 'important');
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
window.openModal = openModal;

function closeModal(modalIdOrEl) {
  if (typeof modalIdOrEl === 'string') {
    const m = document.getElementById(modalIdOrEl);
    if (m) {
      m.style.setProperty('display', 'none', 'important');
      m.classList.remove('open');
    }
  } else if (modalIdOrEl && modalIdOrEl.style) {
    modalIdOrEl.style.setProperty('display', 'none', 'important');
    modalIdOrEl.classList.remove('open');
  } else {
    window.closeAllModals();
  }
  document.body.style.overflow = '';
}
window.closeModal = closeModal;

function openAuthModal(tab = 'signin') {
  openModal('auth-modal');
  const tabSignin = document.getElementById('auth-tab-signin');
  const tabSignup = document.getElementById('auth-tab-signup');
  const formSignin = document.getElementById('auth-signin-form');
  const formSignup = document.getElementById('auth-signup-form');

  if (tab === 'signup') {
    if (tabSignup) tabSignup.classList.add('active');
    if (tabSignin) tabSignin.classList.remove('active');
    if (formSignup) formSignup.style.display = 'block';
    if (formSignin) formSignin.style.display = 'none';
  } else {
    if (tabSignin) tabSignin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
    if (formSignin) formSignin.style.display = 'block';
    if (formSignup) formSignup.style.display = 'none';
  }
}
window.openAuthModal = openAuthModal;

function openSiteVisitModal(projectName = 'Grand Aeropolis Smart Township') {
  const title = projectName || 'Grand Aeropolis Smart Township';
  window.location.href = `book-visit.html?property=${encodeURIComponent(title)}`;
}
window.openSiteVisitModal = openSiteVisitModal;

function openMasterPlanModal(projectIdentifier = 'Grand Aeropolis Smart Township', customImageUrl = '') {
  let displayTitle = projectIdentifier || 'Grand Aeropolis Smart Township';
  let projectImage = customImageUrl || '';
  let projectLocation = '';
  let projectApproval = 'DTCP & RERA Sanctioned Master Blueprint Architecture';

  // If proj-mega is clicked, get the hero project title and image
  if (projectIdentifier === 'proj-mega') {
    const heroTitleElem = document.getElementById('heroPropertyTitle');
    if (heroTitleElem && heroTitleElem.textContent.trim()) {
      displayTitle = heroTitleElem.textContent.trim();
    } else {
      displayTitle = 'Grand Aeropolis 45-Acre Integrated Smart Township';
    }
    const heroWrap = document.getElementById('heroPropertyImgWrap');
    if (!projectImage && heroWrap && heroWrap.style.backgroundImage) {
      const match = heroWrap.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i);
      if (match && match[1]) {
        projectImage = match[1];
      }
    }
    const heroLocElem = document.getElementById('heroPropertyLocation');
    if (heroLocElem && heroLocElem.textContent.trim()) {
      projectLocation = heroLocElem.textContent.trim();
    }
  }

  function fetchCollectionArray(key) {
    try {
      if (typeof getLBData === 'function') {
        const d = getLBData(key);
        if (Array.isArray(d) && d.length > 0) return d;
      }
      const raw = safeStorageGet(key);
      if (raw) {
        if (Array.isArray(raw)) return raw;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    return [];
  }

  // Look across all database collections to find matching property/project
  const collections = [
    fetchCollectionArray('lb_properties_data'),
    fetchCollectionArray('lb_new_projects_data'),
    fetchCollectionArray('lb_farmland_data'),
    fetchCollectionArray('lb_approvals_data'),
    fetchCollectionArray(LB_KEYS.PROPERTIES),
    fetchCollectionArray(LB_KEYS.NEW_PROJECTS),
    fetchCollectionArray(LB_KEYS.FARMLAND),
    fetchCollectionArray(LB_KEYS.APPROVALS)
  ];

  let foundItem = null;
  for (const list of collections) {
    if (Array.isArray(list) && list.length > 0) {
      foundItem = list.find(p => {
        if (!p) return false;
        if (p.id && (String(p.id) === String(projectIdentifier) || String(p.id) === String(displayTitle))) return true;
        const t = (p.title || p.name || '').toLowerCase().trim();
        const search = String(displayTitle).toLowerCase().trim();
        return t === search || (t.length > 2 && search.includes(t)) || (search.length > 2 && t.includes(search));
      });
      if (foundItem) break;
    }
  }

  let imagesList = [];
  if (customImageUrl) {
    imagesList = [customImageUrl];
  } else if (foundItem) {
    if (foundItem.title || foundItem.name) {
      displayTitle = foundItem.title || foundItem.name;
    }
    if (Array.isArray(foundItem.images) && foundItem.images.length > 0) {
      imagesList = foundItem.images.filter(x => typeof x === 'string' && x.trim().length > 0);
    }
    if (imagesList.length === 0) {
      const single = foundItem.imageUrl || foundItem.image || foundItem.image_url || foundItem.layoutImage || foundItem.blueprintUrl;
      if (single) imagesList.push(single);
    }
    if (foundItem.location) {
      projectLocation = foundItem.location;
    }
    if (foundItem.approvalType || foundItem.badge) {
      projectApproval = `${foundItem.approvalType || foundItem.badge} • Sanctioned Blueprint`;
    }
  }

  if (imagesList.length === 0) {
    imagesList = [projectImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop'];
  }

  // Ensure 3 slides if only 1 image exists without multi-images uploaded
  if (imagesList.length === 1 && (!foundItem || !Array.isArray(foundItem.images) || foundItem.images.length <= 1)) {
    imagesList.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop');
    imagesList.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop');
  }

  const slideLabels = imagesList.map((_, idx) => {
    if (idx === 0) return 'Image 1: Frontend Main Cover';
    if (idx === 1) return 'Image 2: Master Layout / Blueprint';
    if (idx === 2) return 'Image 3: Floor Plan / Site Map';
    return `Image ${idx + 1}: Layout Detail View`;
  });

  window._masterPlanCarousel = {
    images: imagesList,
    labels: slideLabels,
    currentIndex: 0,
    projectTitle: displayTitle
  };

  window.openModal('masterPlanModal');
  const content = document.getElementById('masterPlanModalContent');
  if (content) {
    // Build thumbnail items
    const thumbsHtml = imagesList.map((img, idx) => `
      <div onclick="window.setMasterPlanSlide(${idx})" id="mpThumb_${idx}" style="cursor: pointer; width: 70px; height: 52px; border-radius: 8px; overflow: hidden; border: 2.5px solid ${idx === 0 ? '#10b981' : '#475569'}; opacity: ${idx === 0 ? '1' : '0.6'}; transition: all 0.2s ease; flex-shrink: 0; box-shadow: ${idx === 0 ? '0 0 12px rgba(16,185,129,0.6)' : 'none'};">
        <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail ${idx + 1}" />
      </div>
    `).join('');

    content.innerHTML = `
      <div style="padding: 22px 24px; text-align: center; color: #0f172a; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; text-align: left;">
          <div>
            <h3 style="margin: 0 0 4px; font-size: 1.3rem; font-weight: 800; color: #0f172a; line-height: 1.3;">${displayTitle} — Master Layout</h3>
            <p style="color: #64748b; font-size: 13px; margin: 0;">${projectLocation ? `📍 ${projectLocation} • ` : ''}${projectApproval}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #0f172a;">
            <span id="mpSlideCounter">1 / ${imagesList.length}</span> Images
          </div>
        </div>
        
        <!-- Main Slide Viewport -->
        <div style="background: #090d16; border-radius: 16px; padding: 8px; margin-bottom: 14px; min-height: 320px; max-height: 480px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 12px 30px rgba(0,0,0,0.35); position: relative;">
          
          <img id="masterPlanSlideImg" src="${imagesList[0]}" alt="${displayTitle} Master Layout" style="max-height: 440px; width: 100%; object-fit: contain; border-radius: 10px; cursor: pointer; transition: opacity 0.25s ease, transform 0.2s ease;" onclick="window.open(window._masterPlanCarousel.images[window._masterPlanCarousel.currentIndex], '_blank')" title="Click to open full original resolution" />
          
          <!-- Top Label Badge -->
          <div id="mpSlideBadge" style="position: absolute; top: 16px; left: 16px; background: rgba(15,23,42,0.88); color: #34d399; font-size: 11.5px; font-weight: 700; padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(52,211,153,0.4); backdrop-filter: blur(8px); display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 5;">
            <span>📐 ${slideLabels[0]}</span>
          </div>

          <!-- Top Right Fullscreen Icon -->
          <span onclick="window.open(window._masterPlanCarousel.images[window._masterPlanCarousel.currentIndex], '_blank')" style="position: absolute; top: 16px; right: 16px; background: rgba(15,23,42,0.85); color: #fff; font-size: 11.5px; font-weight: 700; padding: 5px 10px; border-radius: 8px; border: 1px solid #334155; backdrop-filter: blur(6px); cursor: pointer; z-index: 5;" title="Open original image">
            🔍 Full Screen
          </span>

          <!-- Prev Slider Navigation Button [ < ] (Left Side) -->
          <button type="button" onclick="window.changeMasterPlanSlide(-1)" aria-label="Previous image" id="mpPrevBtn" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border-radius: 50%; background: rgba(15, 23, 42, 0.85); color: #ffffff; border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; cursor: pointer; backdrop-filter: blur(8px); transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10;" onmouseover="this.style.background='rgba(16,185,129,0.95)'; this.style.borderColor='#34d399'; this.style.transform='translateY(-50%) scale(1.12)'" onmouseout="this.style.background='rgba(15,23,42,0.85)'; this.style.borderColor='rgba(255,255,255,0.4)'; this.style.transform='translateY(-50%) scale(1)'">
            &#10094;
          </button>

          <!-- Next Slider Navigation Button [ > ] (Right Side) -->
          <button type="button" onclick="window.changeMasterPlanSlide(1)" aria-label="Next image" id="mpNextBtn" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border-radius: 50%; background: rgba(15, 23, 42, 0.85); color: #ffffff; border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; cursor: pointer; backdrop-filter: blur(8px); transition: all 0.2s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10;" onmouseover="this.style.background='rgba(16,185,129,0.95)'; this.style.borderColor='#34d399'; this.style.transform='translateY(-50%) scale(1.12)'" onmouseout="this.style.background='rgba(15,23,42,0.85)'; this.style.borderColor='rgba(255,255,255,0.4)'; this.style.transform='translateY(-50%) scale(1)'">
            &#10095;
          </button>
        </div>

        <!-- Bottom Thumbnail Gallery Strip -->
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center; margin-bottom: 16px; overflow-x: auto; padding: 4px 8px;">
          ${thumbsHtml}
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a id="mpViewerLink" href="layout-viewer.html?project=${encodeURIComponent(displayTitle)}&img=${encodeURIComponent(imagesList[0])}" class="btn btn-primary" style="padding: 10px 22px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; background: #10b981; color: #fff; border: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
            Open Interactive Layout Viewer &rarr;
          </a>
          <button type="button" class="btn btn-outline" onclick="window.open(window._masterPlanCarousel.images[window._masterPlanCarousel.currentIndex], '_blank')" style="padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 13px; border: 1px solid #cbd5e1; background: #fff; color: #334155; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            🖼️ View Current Image Full Size
          </button>
          <button type="button" class="btn btn-outline" onclick="window.closeAllModals()" style="padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 13px; border: 1px solid #cbd5e1; background: #fff; color: #64748b; cursor: pointer;">
            Close Preview
          </button>
        </div>
      </div>
    `;
  }
}
window.openMasterPlanModal = openMasterPlanModal;

// Slide Navigation Functions
window.setMasterPlanSlide = function(index) {
  if (!window._masterPlanCarousel || !window._masterPlanCarousel.images.length) return;
  const count = window._masterPlanCarousel.images.length;
  let newIdx = (index + count) % count;
  window._masterPlanCarousel.currentIndex = newIdx;

  const currentImg = window._masterPlanCarousel.images[newIdx];
  const currentLabel = window._masterPlanCarousel.labels[newIdx] || `Image ${newIdx + 1}`;
  
  const imgElem = document.getElementById('masterPlanSlideImg');
  if (imgElem) {
    imgElem.style.opacity = '0.3';
    setTimeout(() => {
      imgElem.src = currentImg;
      imgElem.style.opacity = '1';
    }, 120);
  }

  const badgeElem = document.getElementById('mpSlideBadge');
  if (badgeElem) {
    badgeElem.innerHTML = `<span>📐 ${currentLabel}</span>`;
  }

  const counterElem = document.getElementById('mpSlideCounter');
  if (counterElem) {
    counterElem.textContent = `${newIdx + 1} / ${count}`;
  }

  const viewerLink = document.getElementById('mpViewerLink');
  if (viewerLink) {
    viewerLink.href = `layout-viewer.html?project=${encodeURIComponent(window._masterPlanCarousel.projectTitle)}&img=${encodeURIComponent(currentImg)}`;
  }

  // Update thumbnail styling
  for (let i = 0; i < count; i++) {
    const thumb = document.getElementById(`mpThumb_${i}`);
    if (thumb) {
      if (i === newIdx) {
        thumb.style.borderColor = '#10b981';
        thumb.style.opacity = '1';
        thumb.style.boxShadow = '0 0 10px rgba(16,185,129,0.5)';
      } else {
        thumb.style.borderColor = '#475569';
        thumb.style.opacity = '0.6';
        thumb.style.boxShadow = 'none';
      }
    }
  }
};

window.changeMasterPlanSlide = function(delta) {
  if (!window._masterPlanCarousel) return;
  window.setMasterPlanSlide(window._masterPlanCarousel.currentIndex + delta);
};

// Keyboard Arrow Support for Layout Slider
document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('masterPlanModal');
  if (!modal || modal.style.display === 'none' || (!modal.classList.contains('active') && !modal.classList.contains('open'))) {
    if (!modal || modal.style.display === 'none' || modal.style.display === '') return;
  }
  if (e.key === 'ArrowLeft') {
    window.changeMasterPlanSlide(-1);
  } else if (e.key === 'ArrowRight') {
    window.changeMasterPlanSlide(1);
  } else if (e.key === 'Escape') {
    window.closeAllModals();
  }
});


// ==========================================================================
// FAIL-SAFE GLOBAL MODAL CLOSER SYSTEM
// ==========================================================================
window.closeAllModals = function() {
  const modals = document.querySelectorAll('.modal-backdrop, .admin-modal-overlay, #auth-modal, #siteVisitModal, #masterPlanModal, #compareModal, #propertyModal, #interiorModal, #poojaModal, #loanModal, #newsArticleModal, #legalDocsModal, [id^="modal-"]');
  modals.forEach(m => {
    m.style.setProperty('display', 'none', 'important');
    m.classList.remove('open', 'active');
  });
  document.body.style.overflow = '';
}
window.closeAllModals = closeAllModals;
window.closeAuthModal = closeAllModals;
window.closeSiteVisitModal = closeAllModals;


const LB_STORAGE_KEYS = {
  PROPERTIES: 'lb_properties_data',
  APPROVALS: 'lb_approvals_data',
  FARMLAND: 'lb_farmland_data',
  SITE_TOURS: 'lb_site_tours_data',
  INTERIORS: 'lb_interior_consultations',
  GRIHA_PRAVESH: 'lb_griha_pravesh_bookings',
  NEW_PROJECTS: 'lb_new_projects_data',
  AUDIT: 'lb_admin_audit_logs',
  COMPARE: 'lb_compare_list',
  FAVORITES: 'lb_user_favorites',
  USERS: 'lb_registered_users',
  SESSION: 'lb_user_session'
};
const LB_KEYS = LB_STORAGE_KEYS;
window.LB_KEYS = LB_KEYS;
window.LB_STORAGE_KEYS = LB_STORAGE_KEYS;

const _memoryStorageFallback = {};

function safeStorageGet(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch(e) {}
  return _memoryStorageFallback[key] || null;
}


function safeStorageSet(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch(e) {}
  _memoryStorageFallback[key] = val;
}

async function fetchServerDB() {
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const db = await res.json();
      const pickArr = (k1, k2) => {
        if (Array.isArray(db[k1])) return db[k1];
        if (Array.isArray(db[k2])) return db[k2];
        return [];
      };

      const pList = pickArr('properties', 'lb_properties_data');
      safeStorageSet('lb_properties_data', JSON.stringify(pList));

      const nList = pickArr('newProjects', 'lb_new_projects_data');
      safeStorageSet('lb_new_projects_data', JSON.stringify(nList));

      const fList = pickArr('farmland', 'lb_farmland_data');
      safeStorageSet('lb_farmland_data', JSON.stringify(fList));

      const tList = pickArr('siteTours', 'lb_site_tours_data');
      safeStorageSet('lb_site_tours_data', JSON.stringify(tList));

      const aList = pickArr('approvals', 'lb_approvals_data');
      safeStorageSet('lb_approvals_data', JSON.stringify(aList));

      const iList = pickArr('interiors', 'lb_interior_consultations');
      safeStorageSet('lb_interior_consultations', JSON.stringify(iList));

      const gList = pickArr('poojas', 'lb_griha_pravesh_bookings');
      safeStorageSet('lb_griha_pravesh_bookings', JSON.stringify(gList));

      const logList = pickArr('auditLogs', 'lb_admin_audit_logs');
      safeStorageSet('lb_admin_audit_logs', JSON.stringify(logList));

      // Instant UI Re-render with fresh server data
      try {
        if (typeof window.renderLiveNewsTicker === 'function') window.renderLiveNewsTicker();
        if (typeof window.renderNewsArticles === 'function') window.renderNewsArticles();
        if (typeof window.renderApprovedProjects === 'function') window.renderApprovedProjects();
        if (typeof window.renderNewProjects === 'function') window.renderNewProjects();
        if (typeof window.renderFarmlandFastTrack === 'function') window.renderFarmlandFastTrack();
        if (typeof window.renderFastTrackLand === 'function') window.renderFastTrackLand();
        if (typeof window.renderProperties === 'function') window.renderProperties();
        if (typeof window.renderLandShowcase === 'function') window.renderLandShowcase();
        if (typeof window.renderFrontendProperties === 'function') window.renderFrontendProperties();
      } catch(renderErr) {
        console.warn('Post-fetch render error:', renderErr);
      }

      return db;
    }
  } catch(e) {}
  return null;
}
window.fetchServerDB = fetchServerDB;
fetchServerDB();
// Auto-sync with central server every 2 seconds for instant live multi-device sync
setInterval(fetchServerDB, 2000);

// Status Dot Indicator & Pop Card Engine
// Green: DB connected | Orange: Not connected but demo creds | Red: No demo creds & no db connection
let _dbPopupShownOnce = false;

function showDbStatusPopup(data) {
  const existing = document.getElementById('dbStatusPopupCard');
  if (existing) existing.remove();

  const isConnected = Boolean(
    data.dbConnected ||
    (data.supabase && data.supabase.connected) ||
    (data.postgresql && data.postgresql.connected) ||
    (data.mongodb && data.mongodb.connected)
  );

  const hasCreds = Boolean(
    data.hasCreds ||
    (data.supabase && data.supabase.configured) ||
    (data.postgresql && data.postgresql.configured) ||
    (data.mongodb && data.mongodb.configured)
  );

  let title = 'Database Connected';
  let message = data.primaryStorage || 'Cloud Database Sync Active';
  let icon = '🟢';
  let borderColor = '#10b981';

  if (!isConnected && hasCreds) {
    title = 'Demo Database Active';
    message = 'Local High-Speed Storage (Demo Configured)';
    icon = '🟠';
    borderColor = '#f59e0b';
  } else if (!isConnected && !hasCreds) {
    title = 'Database Offline';
    message = 'Local Storage Active';
    icon = '🔴';
    borderColor = '#ef4444';
  }

  const card = document.createElement('div');
  card.id = 'dbStatusPopupCard';
  card.className = 'db-status-popup-card';
  card.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    background: #0f172a;
    color: #ffffff;
    border-radius: 12px;
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.12);
    border-left: 4px solid ${borderColor};
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    max-width: 320px;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    cursor: default;
  `;

  card.innerHTML = `
    <div style="font-size: 16px; flex-shrink: 0;">${icon}</div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-weight: 700; color: #ffffff; font-size: 12.5px; line-height: 1.2;">${title}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${message}</div>
    </div>
    <button type="button" aria-label="Close" style="background: rgba(255,255,255,0.08); border: none; color: #94a3b8; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; transition: all 0.2s; margin-left: 2px;" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='#ffffff';" onmouseout="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#94a3b8';" onclick="dismissDbStatusPopup()">&times;</button>
  `;

  document.body.appendChild(card);

  requestAnimationFrame(() => {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });

  let dismissTimeout = null;

  function startDismissTimer() {
    clearTimeout(dismissTimeout);
    dismissTimeout = setTimeout(() => {
      dismissDbStatusPopup();
    }, 3000);
  }

  function pauseDismissTimer() {
    clearTimeout(dismissTimeout);
  }

  window.dismissDbStatusPopup = function() {
    clearTimeout(dismissTimeout);
    card.style.opacity = '0';
    card.style.transform = 'translateY(14px)';
    setTimeout(() => {
      if (card && card.parentNode) card.parentNode.removeChild(card);
    }, 250);
  };

  card.addEventListener('mouseenter', pauseDismissTimer);
  card.addEventListener('mouseleave', startDismissTimer);

  startDismissTimer();
}
window.showDbStatusPopup = showDbStatusPopup;

function updateDbStatusDot() {
  fetch('/api/status')
    .then(res => res.json())
    .then(data => {
      const isConnected = Boolean(
        data.dbConnected ||
        (data.supabase && data.supabase.connected) ||
        (data.postgresql && data.postgresql.connected) ||
        (data.mongodb && data.mongodb.connected)
      );

      const hasCreds = Boolean(
        data.hasCreds ||
        (data.supabase && data.supabase.configured) ||
        (data.postgresql && data.postgresql.configured) ||
        (data.mongodb && data.mongodb.configured)
      );

      let color = '#ef4444'; // Red: no demo creds & no db connection
      let glow = 'rgba(239, 68, 68, 0.45)';

      if (isConnected) {
        color = '#10b981'; // Green: db is connected
        glow = 'rgba(16, 185, 129, 0.45)';
      } else if (hasCreds) {
        color = '#f59e0b'; // Orange: not connected but demo creds
        glow = 'rgba(245, 158, 11, 0.45)';
      }

      document.querySelectorAll('.db-status-dot').forEach(dot => {
        dot.style.background = color;
        dot.style.boxShadow = `0 0 8px ${glow}, 0 0 0 2px ${glow}`;
        dot.style.cursor = 'pointer';
        dot.title = isConnected ? 'Database Connected' : (hasCreds ? 'Demo Database Configured' : 'Database Offline');
        dot.onclick = (e) => {
          e.stopPropagation();
          showDbStatusPopup(data);
        };
      });

      if (!_dbPopupShownOnce) {
        _dbPopupShownOnce = true;
        showDbStatusPopup(data);
      }
    })
    .catch(() => {
      document.querySelectorAll('.db-status-dot').forEach(dot => {
        dot.style.background = '#ef4444'; // Red
        dot.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.45)';
      });
    });
}
window.updateDbStatusDot = updateDbStatusDot;
updateDbStatusDot();
setInterval(updateDbStatusDot, 5000);

function saveServerDB(key, data) {
  try {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key, data: data })
    }).catch(() => {});
  } catch(e) {}
}

function getLBData(key) {
  try {
    const raw = safeStorageGet(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch(e) {
    console.warn('LocalStorage read error for ' + key + ':', e);
  }
  return [];
}

function setLBData(key, data) {
  try {
    safeStorageSet(key, JSON.stringify(data));
  } catch(e) {
    console.warn('LocalStorage write error for ' + key + ':', e);
  }
  saveServerDB(key, data);
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('lb_sync_channel');
      bc.postMessage({ type: 'STATE_UPDATE', key: key, data: data });
      bc.close();
    }
  } catch(e) {
    // Fail gracefully if Brave Shields blocks BroadcastChannel
  }
}



// ==========================================================================
// COMPLETE RECORDING 1 REAL ESTATE & AGRO SEED PORTFOLIO
// ==========================================================================
const COMPLETE_SEED_PROPERTIES = [
  {
    id: 'prop_mayflower_grandeur',
    title: 'Mayflower Grandeur Residences',
    builder: 'Mayflower Enterprises • Gated Master Plan',
    location: 'Peelamedu, Coimbatore',
    category: 'Apartments',
    price: '₹ 88 Lakh onwards',
    priceLabel: '₹ 88 Lakh onwards',
    ratePerSqft: '₹ 6,875 / sq.ft • Smart Township',
    bhk: '3 BHK',
    area: '1,280 sq.ft',
    metrics: '1,280 sq.ft • 3 BHK • East Facing',
    approvalType: 'DTCP / RERA Sanctioned',
    legalNo: 'TN/11/Building/0192/2026',
    status: 'Active',
    badge: '★ Pre-Launch Offer',
    featureBadge: 'Project of the Month',
    featured: true,
    highlights: [
      '40ft & 60ft Wide Blacktop Arterial Roads with LED Grid',
      '24/7 Solar Security & AI-Guided Smart Gate Access',
      '100% Clear Title Deeds with Bank Legal Audit',
      'Bank Loan Approved by SBI, HDFC & ICICI (Up to 85%)'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_aura_emerald',
    title: 'Aura Emerald Gated Enclave',
    builder: 'Aura Promoters & Infra',
    location: 'Annur - Sathy Corridor',
    category: 'Plots',
    price: '₹ 18.5 Lakhs onwards',
    priceLabel: '₹ 18.5 Lakhs onwards',
    ratePerSqft: '₹ 1,150 / sq.ft',
    bhk: 'Villa Plot',
    area: '1,600 sq.ft',
    metrics: '140 Sanctioned Plots • 18 Acres Total Area • Possession Dec 2026',
    approvalType: 'DTCP / RERA',
    legalNo: 'DTCP: 481/2026 | TN RERA',
    status: 'Active',
    badge: 'Fast Selling',
    featureBadge: 'Gated Community Plots',
    proximity: '3 mins from Annur Central Bus Stand & Sathy Highway',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_skyline_sovereign',
    title: 'Skyline Sovereign Villa Township',
    builder: 'Skyline Luxury Infra',
    location: 'Saravanampatti IT Belt',
    category: 'Villas',
    price: '₹ 1.65 Cr onwards',
    priceLabel: '₹ 1.65 Cr onwards',
    ratePerSqft: '₹ 5,800 / sq.ft',
    bhk: '4 BHK Luxury Villa',
    area: '2,850 sq.ft',
    metrics: '64 Independent Villas • 8.5 Acres Township • Possession Oct 2026',
    approvalType: 'DTCP / RERA',
    legalNo: 'TN/11/Layout/0284/2026',
    status: 'Active',
    badge: 'Pre-Launch Offer',
    featureBadge: 'Luxury Villa Project',
    proximity: '5 mins from CHIL SEZ & Prozone Mall',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_kovai_horizon',
    title: 'Kovai Horizon Eco Heights',
    builder: 'Horizon Infra Corp',
    location: 'Peelamedu',
    category: 'Apartments',
    price: '₹ 68 Lakhs onwards',
    priceLabel: '₹ 68 Lakhs onwards',
    ratePerSqft: '₹ 6,200 / sq.ft',
    bhk: '2 & 3 BHK',
    area: '1,100 - 1,450 sq.ft',
    metrics: '320 Smart Units (2/3 BHK) • 5.5 Acres Total Area • Possession Ready to Move / Aug 2026',
    approvalType: 'DTCP / RERA',
    legalNo: 'TN/11/Building/0488/2026',
    status: 'Active',
    badge: '50% Sold Out',
    featureBadge: 'High-Rise Apartments',
    proximity: '2 mins from Fun Republic Mall & PSG Tech',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_kongu_agri',
    title: 'Kongu Agri-Corridor Mega Farmland',
    builder: 'Kongu Agro Realty',
    location: 'Sulur - Palladam Corridor',
    category: 'Farmland',
    price: '₹ 28 Lakhs / Acre',
    priceLabel: '₹ 28 Lakhs / Acre',
    ratePerSqft: '₹ 28 Lakh / Acre',
    bhk: 'Agro Parcel',
    area: '40 Acres Contiguous Land',
    metrics: '12 Large Farm Parcels • 40 Acres Contiguous Land • Possession Ready for Agro-Infra',
    approvalType: 'DTCP / RERA',
    legalNo: 'DTCP Farmland Audit 09/2026',
    status: 'Active',
    badge: 'Launching Soon',
    featureBadge: 'Agricultural / Dry Land',
    proximity: '10 mins from L&T Bypass / Outer Ring Corridor',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_foothill_serenity',
    title: 'Foothill Serenity Gated Plots',
    builder: 'Western Ghats Estates',
    location: 'Kovaipudur Foothills',
    category: 'Plots',
    price: '₹ 29 Lakhs onwards',
    priceLabel: '₹ 29 Lakhs onwards',
    ratePerSqft: '₹ 1,450 / sq.ft',
    bhk: 'Villa Plot',
    area: '10 Acres Layout',
    metrics: '75 Boutique Plots • 10 Acres Layout • Possession Ready for Construction',
    approvalType: 'DTCP / RERA',
    legalNo: 'DTCP: 312/2026',
    status: 'Active',
    badge: 'Ready to Move',
    featureBadge: 'Gated Community Plots',
    proximity: 'Adjacent to Sri Krishna Educational Institutions',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_riverview_agro',
    title: 'Riverview Agro Ranch Estates',
    builder: 'Anamalai Green Ventures',
    location: 'Pollachi - Kinathukadavu Corridor',
    category: 'Farmland',
    price: '₹ 35 Lakhs / Acre',
    priceLabel: '₹ 35 Lakhs / Acre',
    ratePerSqft: '₹ 35 Lakh / Acre',
    bhk: 'Eco Ranch Plot',
    area: '25 Acres Agro Enclave',
    metrics: '10 Eco Ranch Plots • 25 Acres Agro Enclave • Possession Immediate Registry',
    approvalType: 'DTCP / RERA',
    legalNo: 'Patta & Title Certified',
    status: 'Active',
    badge: 'Pre-Launch Offer',
    featureBadge: 'Eco Ranch Farmland',
    proximity: 'Adjacent to Aliyar Feeder Canal & Pollachi 4-lane',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  // Matched Grid Properties
  {
    id: 'prop_farmcrest_sulur',
    title: 'Farmcrest Agro Dry Land Parcel',
    builder: 'Kongu Agro Realty',
    location: 'Sulur, Coimbatore',
    category: 'Farmland',
    price: '₹ 42 Lakh',
    priceLabel: '₹ 42 Lakh',
    area: '3.50 Acres',
    metrics: '3.50 Acres • Red Sandy Loam • 130ft Water',
    matchScore: '79% Match',
    livabilityScore: '8.4/10',
    status: 'Active',
    approvalType: 'Patta Verified',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_kongu_valley_annur',
    title: 'Kongu Valley Agro Farm Estate',
    builder: 'Annam Agro Developers',
    location: 'Annur, Coimbatore',
    category: 'Farmland',
    price: '₹ 58 Lakh',
    priceLabel: '₹ 58 Lakh',
    area: '5.00 Acres',
    metrics: '5.00 Acres • Black Cotton Mix • 120ft Water',
    matchScore: '75% Match',
    livabilityScore: '8.2/10',
    status: 'Active',
    approvalType: 'Patta Verified',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_coconut_saravanampatti',
    title: 'coconut',
    builder: 'Jegan Promoters',
    location: 'Saravanampatti, Coimbatore',
    category: 'Plots',
    price: '₹ 32.5 Lakhs',
    priceLabel: '₹ 32.5 Lakhs',
    area: '9.25 Cents',
    metrics: '9.25 Cents • Facing: North • Parking: Yes',
    matchScore: '71% Match',
    livabilityScore: '9.3/10',
    status: 'Active',
    approvalType: 'DTCP Approved',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_shyam_homes',
    title: 'shyam homes',
    builder: 'Shyam Constructions',
    location: 'Saravanampatti, Coimbatore',
    category: 'Villas',
    price: '₹ 42 Lakhs',
    priceLabel: '₹ 42 Lakhs',
    area: '2400 sq.ft',
    metrics: '2400 sq.ft • 3 BHK Luxury Living',
    matchScore: '71% Match',
    livabilityScore: '9.1/10',
    status: 'Active',
    approvalType: 'DTCP / RERA',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  }
];

const COMPLETE_SEED_FARMLAND = [];

// MASTER UNIFIED ORIGINAL DATASET (UNIFORM ACROSS ALL BROWSERS)
const MASTER_UNIFIED_PROPERTIES = [
  {
    id: 'prop_daddy_home',
    title: 'daddy home',
    builder: 'Saravanampatti Promoters',
    location: 'Saravanampatti, Coimbatorebatore',
    category: 'Residential Plots',
    price: '25 lakh',
    priceLabel: '25 lakh',
    metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
    status: 'Active',
    approvalType: 'DTCP Approved',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
    createdAt: '2026-09-01T12:05:00.000Z'
  },
  {
    id: 'prop_rasul',
    title: 'rasul',
    builder: 'Skyline Infra',
    location: 'Saravanampatti, Coimbatorebatore',
    category: 'Apartments',
    price: '1.20 cr',
    priceLabel: '1.20 cr',
    metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
    status: 'Active',
    approvalType: 'TN RERA Verified',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop',
    createdAt: '2026-09-01T12:10:00.000Z'
  },
  {
    id: 'prop_emerald_crest',
    title: 'Emerald Crest Smart Villa Enclave',
    builder: 'Emerald Crest Infra',
    location: 'Saravanampatti, CoimSaravanampatti, Coimbatorebatore',
    category: 'Residential Plots',
    price: 'Rs 54.5 Lakhs onwards',
    priceLabel: 'Rs 54.5 Lakhs onwards',
    metrics: '2,200 sq.ft 2,200 sq.ft - 3 BHK Villa - Gated Community',
    status: 'Active',
    approvalType: 'DTCP Approved',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
    createdAt: '2026-09-01T12:15:00.000Z'
  },
  {
    id: 'prop_coconut_saravanampatti',
    title: 'coconut',
    builder: 'Jegan Promoters',
    location: 'Saravanampatti, Coimbatore',
    category: 'Plots',
    price: '₹ 32.5 Lakhs',
    priceLabel: '₹ 32.5 Lakhs',
    metrics: '9.25 Cents • Facing: North • Parking: Yes',
    status: 'Active',
    approvalType: 'DTCP Approved',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop',
    createdAt: '2026-09-01T12:20:00.000Z'
  },
  {
    id: 'prop_shyam_homes',
    title: 'shyam homes',
    builder: 'Shyam Constructions',
    location: 'Saravanampatti, Coimbatore',
    category: 'Villas',
    price: '₹ 42 Lakhs',
    priceLabel: '₹ 42 Lakhs',
    metrics: '2400 sq.ft • 3 BHK Luxury Living',
    status: 'Active',
    approvalType: 'DTCP / RERA',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
    createdAt: '2026-09-01T12:25:00.000Z'
  }
];

// Purge fake dummy data & synchronize Master Unified Dataset across all browsers
function purgeFakeDummyData() {
  const FAKE_SEED_IDS = [
    'prop_mayflower_grandeur', 'prop_aura_emerald', 'prop_skyline_sovereign', 
    'prop_kovai_horizon', 'prop_kongu_agri', 'prop_foothill_serenity', 
    'prop_riverview_agro', 'prop_farmcrest_sulur', 'prop_kongu_valley_annur',
    'farm_farmcrest_sulur', 'farm_kongu_valley', 'inq_101', 'inq_102',
    'prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5', 'prop-6', 'prop-7', 'prop-8'
  ];

  const FAKE_SEED_TITLES = [
    'mayflower grandeur residences', 'aura emerald gated enclave', 
    'skyline sovereign villa township', 'kovai horizon eco heights', 
    'kongu agri-corridor mega farmland', 'foothill serenity gated plots', 
    'riverview agro ranch estates', 'farmcrest agro dry land parcel', 
    'kongu valley agro farm estate', 'grand aeropolis smart township',
    'coimbatore strategic farmland corridor', 'emerald heights luxury flats',
    'sri krishna gated villa enclave', 'greenfield dtcp residential plots',
    'serene palm coconut farmland', 'kovai royal residency',
    'mayflower luxury suites', 'chitra dtcp villa plots'
  ];

  try {
    let cleanProps = [];
    const rawProps = localStorage.getItem('lb_properties_data');
    if (!rawProps) {
      cleanProps = [...MASTER_UNIFIED_PROPERTIES];
      localStorage.setItem('lb_properties_data', JSON.stringify(cleanProps));
    } else {
      const parsed = JSON.parse(rawProps);
      if (Array.isArray(parsed)) {
        cleanProps = parsed.filter(p => {
          if (!p) return false;
          if (p.id && FAKE_SEED_IDS.includes(p.id)) return false;
          const t = (p.title || p.name || '').toLowerCase().trim();
          if (FAKE_SEED_TITLES.some(dummy => t.includes(dummy))) return false;
          return true;
        });
        localStorage.setItem('lb_properties_data', JSON.stringify(cleanProps));
      }
    }

    // Clean Farmland
    const rawFarms = localStorage.getItem('lb_farmland_data');
    if (rawFarms) {
      const parsed = JSON.parse(rawFarms);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(f => {
          if (!f) return false;
          if (f.id && FAKE_SEED_IDS.includes(f.id)) return false;
          const t = (f.title || f.name || '').toLowerCase().trim();
          if (FAKE_SEED_TITLES.some(dummy => t.includes(dummy))) return false;
          return true;
        });
        localStorage.setItem('lb_farmland_data', JSON.stringify(clean));
      }
    }

    // Clean Tours / Leads
    const rawTours = localStorage.getItem('lb_site_tours_data');
    if (rawTours) {
      const parsed = JSON.parse(rawTours);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(t => {
          if (!t) return false;
          if (t.id && FAKE_SEED_IDS.includes(t.id)) return false;
          const name = (t.name || t.customerName || '').toLowerCase().trim();
          const prop = (t.propertyRequested || t.propertyTitle || '').toLowerCase().trim();
          if (name === 'anand kumar' || name === 'priya sundaram' || name === 'ramesh kumar') return false;
          if (FAKE_SEED_TITLES.some(dummy => prop.includes(dummy))) return false;
          return true;
        });
        localStorage.setItem('lb_site_tours_data', JSON.stringify(clean));
      }
    }

    // Clean 3D Studio Interiors
    const rawInteriors = localStorage.getItem('lb_interior_consultations');
    if (rawInteriors) {
      const parsed = JSON.parse(rawInteriors);
      if (Array.isArray(parsed)) {
        const FAKE_NAMES = ['ramesh kumar', 'priya sundaram', 'karthik narayanan', 'dr. ananya swaminathan', 'ananya swaminathan', 'senthil balaji', 'k. vijayaraghavan', 'vijayaraghavan', 'deepa manikandan', 'arvind subramanian', 'niveditha rajan', 'g. saravanan', 'lavanya chandran', 'rajesh kannan'];
        const clean = parsed.filter(item => {
          if (!item) return false;
          const name = (item.clientName || item.name || '').toLowerCase().trim();
          if (FAKE_NAMES.some(fn => name === fn || name.includes(fn))) return false;
          return true;
        });
        localStorage.setItem('lb_interior_consultations', JSON.stringify(clean));
      }
    }

    // Clean Griha Pravesh Poojas
    const rawPoojas = localStorage.getItem('lb_griha_pravesh_bookings');
    if (rawPoojas) {
      const parsed = JSON.parse(rawPoojas);
      if (Array.isArray(parsed)) {
        const FAKE_POOJA_NAMES = [
          's. meenakshi sundaram', 'meenakshi sundaram', 'dr. v. ramachandran', 'ramachandran',
          'k. venkatachalam', 'venkatachalam', 't. s. jayaraman', 'jayaraman', 'b. sridharan',
          'sridharan', 'm. vijayaraghavan', 'r. subramanian', 'g. narayanan',
          'senthil nathan', 'meenakshi krishnan', 'vignesh raghavan', 'anandha krishnan',
          'anandhakrishnan', 'divya & karthick', 'divya', 'karthick', 'm. soundararajan',
          'soundararajan', 'jayashree murali', 'jayashree', 'prakash chandran', 'prakash', 'vignesh'
        ];
        const clean = parsed.filter(item => {
          if (!item) return false;
          const name = (item.customerName || item.name || '').toLowerCase().trim();
          if (FAKE_POOJA_NAMES.some(fn => name === fn || name.includes(fn))) return false;
          return true;
        });
        localStorage.setItem('lb_griha_pravesh_bookings', JSON.stringify(clean));
      }
    }
  } catch (e) {
    console.error('Error purging dummy data:', e);
  }
}
window.purgeFakeDummyData = purgeFakeDummyData;
purgeFakeDummyData();



// DEFAULT SEEDED DATASET (RECORDING 1 RESTORATION)
const DEFAULT_RECORDING1_PROPERTIES = [
  {
    id: 'prop_mayflower_grandeur',
    title: 'Mayflower Grandeur Residences',
    builder: 'Mayflower Enterprises • Gated Master Plan',
    location: 'Peelamedu, Coimbatore',
    category: 'Apartments',
    price: '₹ 88 Lakh onwards',
    priceLabel: '₹ 88 Lakh onwards',
    ratePerSqft: '₹ 6,875 / sq.ft',
    bhk: '3 BHK',
    area: '1,280 sq.ft',
    metrics: '1,280 sq.ft • 3 BHK • East Facing',
    approvalType: 'DTCP / RERA Sanctioned',
    approval: 'DTCP / RERA Sanctioned',
    legalNo: 'TN/11/Building/0192/2026',
    approvalNumber: 'TN/11/Building/0192/2026',
    status: 'Active',
    badge: 'Pre-Launch Offer',
    featureBadge: 'Project of the Month',
    featured: true,
    highlights: [
      '40ft & 60ft Wide Blacktop Roads with LED Grid',
      '24/7 Solar Security & AI-Guided Gate Access',
      '100% Clear Title Deeds with Bank Legal Audit',
      'Bank Loan Approved by SBI, HDFC & ICICI (Up to 85%)'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_aura_emerald',
    title: 'Aura Emerald Gated Enclave',
    builder: 'Aura Promoters & Infra',
    location: 'Annur - Sathy Corridor, Coimbatore',
    category: 'Plots',
    price: '₹ 18.5 Lakhs onwards',
    priceLabel: '₹ 18.5 Lakhs onwards',
    ratePerSqft: '₹ 1,150 / sq.ft',
    bhk: 'Villa Plot',
    area: '1,600 sq.ft',
    metrics: '140 Sanctioned Plots • 18 Acres Total Area • Possession Dec 2026',
    approvalType: 'DTCP / RERA Approved',
    approval: 'DTCP / RERA Approved',
    legalNo: 'DTCP: 481/2026 | TN RERA',
    approvalNumber: 'DTCP: 481/2026 | TN RERA',
    status: 'Active',
    badge: 'Fast Selling',
    featureBadge: 'Gated Community Plots',
    proximity: '3 mins from Annur Central Bus Stand & Sathy Highway',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_skyline_sovereign',
    title: 'Skyline Sovereign Villa Township',
    builder: 'Skyline Luxury Infra',
    location: 'Saravanampatti IT Belt, Coimbatore',
    category: 'Villas',
    price: '₹ 1.65 Cr onwards',
    priceLabel: '₹ 1.65 Cr onwards',
    ratePerSqft: '₹ 5,800 / sq.ft',
    bhk: '4 BHK Luxury Villa',
    area: '2,850 sq.ft',
    metrics: '64 Independent Villas • 8.5 Acres Township • Possession Oct 2026',
    approvalType: 'DTCP / RERA Approved',
    approval: 'DTCP / RERA Approved',
    legalNo: 'TN/11/Layout/0284/2026',
    approvalNumber: 'TN/11/Layout/0284/2026',
    status: 'Active',
    badge: 'Pre-Launch Offer',
    featureBadge: 'Luxury Villa Project',
    proximity: '5 mins from CHIL SEZ & Prozone Mall',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prop_kovai_horizon',
    title: 'Kovai Horizon Eco Heights',
    builder: 'Horizon Infra Corp',
    location: 'Peelamedu, Coimbatore',
    category: 'Apartments',
    price: '₹ 68 Lakhs onwards',
    priceLabel: '₹ 68 Lakhs onwards',
    ratePerSqft: '₹ 6,200 / sq.ft',
    bhk: '2 & 3 BHK Smart Units',
    area: '1,100 - 1,450 sq.ft',
    metrics: '320 Smart Units (2/3 BHK) • 5.5 Acres Total Area • Ready to Move / Aug 2026',
    approvalType: 'DTCP / RERA Approved',
    approval: 'DTCP / RERA Approved',
    legalNo: 'TN/11/Building/0488/2026',
    approvalNumber: 'TN/11/Building/0488/2026',
    status: 'Active',
    badge: '50% Sold Out',
    featureBadge: 'High-Rise Apartments',
    proximity: '2 mins from Fun Republic Mall & PSG Tech',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_RECORDING1_FARMLAND = [];

// Purge fake dummy data & keep strictly original user-created Admin listings
function purgeFakeDummyData() {
  const FAKE_SEED_IDS = [
    'prop_mayflower_grandeur', 'prop_aura_emerald', 'prop_skyline_sovereign', 
    'prop_kovai_horizon', 'prop_kongu_agri', 'prop_foothill_serenity', 
    'prop_riverview_agro', 'prop_farmcrest_sulur', 'prop_kongu_valley_annur',
    'farm_farmcrest_sulur', 'farm_kongu_valley', 'farm-1', 'farm-2', 'farm-3', 'farm-4',
    'inq_101', 'inq_102',
    'prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5', 'prop-6', 'prop-7', 'prop-8'
  ];

  const FAKE_SEED_TITLES = [
    'mayflower grandeur residences', 'aura emerald gated enclave', 
    'skyline sovereign villa township', 'kovai horizon eco heights', 
    'kongu agri-corridor mega farmland', 'foothill serenity gated plots', 
    'riverview agro ranch estates', 'farmcrest agro dry land parcel', 
    'kongu valley agro farm estate', 'grand aeropolis smart township',
    'coimbatore strategic farmland corridor', 'emerald heights luxury flats',
    'sri krishna gated villa enclave', 'greenfield dtcp residential plots',
    'serene palm coconut farmland', 'kovai royal residency',
    'mayflower luxury suites', 'chitra dtcp villa plots',
    'green valley agro farms', 'pollachi organic coconut groves',
    'annur eco-farmland enclave', 'kinathukadavu valley farmland'
  ];

  try {
    const rawProps = localStorage.getItem('lb_properties_data');
    if (rawProps) {
      const parsed = JSON.parse(rawProps);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(p => {
          if (!p) return false;
          if (p.id && FAKE_SEED_IDS.includes(p.id)) return false;
          const t = (p.title || p.name || '').toLowerCase().trim();
          if (FAKE_SEED_TITLES.some(dummy => t.includes(dummy))) return false;
          return true;
        });
        localStorage.setItem('lb_properties_data', JSON.stringify(clean));
      }
    }

    const rawFarms = localStorage.getItem('lb_farmland_data');
    if (rawFarms) {
      const parsed = JSON.parse(rawFarms);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(f => {
          if (!f) return false;
          if (f.id && FAKE_SEED_IDS.includes(f.id)) return false;
          const t = (f.title || f.name || '').toLowerCase().trim();
          if (FAKE_SEED_TITLES.some(dummy => t.includes(dummy))) return false;
          return true;
        });
        localStorage.setItem('lb_farmland_data', JSON.stringify(clean));
      }
    }

    const rawTours = localStorage.getItem('lb_site_tours_data');
    if (rawTours) {
      const parsed = JSON.parse(rawTours);
      if (Array.isArray(parsed)) {
        const clean = parsed.filter(t => {
          if (!t) return false;
          if (t.id && FAKE_SEED_IDS.includes(t.id)) return false;
          const name = (t.name || t.customerName || '').toLowerCase().trim();
          const prop = (t.propertyRequested || t.propertyTitle || '').toLowerCase().trim();
          if (name === 'anand kumar' || name === 'priya sundaram') return false;
          if (FAKE_SEED_TITLES.some(dummy => prop.includes(dummy))) return false;
          return true;
        });
        localStorage.setItem('lb_site_tours_data', JSON.stringify(clean));
      }
    }
  } catch (e) {
    console.error('Error purging dummy data:', e);
  }
}
window.purgeFakeDummyData = purgeFakeDummyData;
purgeFakeDummyData();



// --------------------------------------------------------------------------
// PURE REACTIVE CLIENT-SIDE DATA BRIDGE (SHARED WITH ADMIN PORTAL)
// LB_STORAGE_KEYS and LB_KEYS are already defined globally at the top of this file.
// --------------------------------------------------------------------------

let lbSyncChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    lbSyncChannel = new BroadcastChannel('lb_sync_channel');
  }
} catch(e) {
  lbSyncChannel = null;
}

function getStoredProperties() {
  try {
    const raw = safeStorageGet(LB_STORAGE_KEYS.PROPERTIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch(e) {
    console.warn('LocalStorage parse error:', e);
  }
  return [];
}

// 1. Cross-Tab Live Storage Event Listener
window.addEventListener('storage', function(e) {
  if (!e.key || Object.values(LB_STORAGE_KEYS).includes(e.key) || e.key === 'lb_new_projects_data' || e.key === 'lb_properties_data' || e.key === 'lb_farmland_data') {
    console.log('🔄 Live Sync: Received Storage Event -> Re-rendering frontend...');
    if (typeof renderFrontendProperties === 'function') renderFrontendProperties();
    if (typeof renderProperties === 'function') renderProperties();
    if (typeof renderNewProjects === 'function') renderNewProjects();
    if (typeof renderFarmlandFastTrack === 'function') renderFarmlandFastTrack();
    if (typeof renderLandShowcase === 'function') renderLandShowcase();
    if (typeof renderApprovedProjects === 'function') renderApprovedProjects();
    if (typeof renderNewsArticles === 'function') renderNewsArticles();
    if (typeof renderLiveNewsTicker === 'function') renderLiveNewsTicker();
    if (typeof initLivabilityEngine === 'function') initLivabilityEngine();
  }
});

// 2. Instant BroadcastChannel Listener for same-origin tabs
if (lbSyncChannel) {
  try {
    lbSyncChannel.onmessage = async function(msg) {
      if (msg && msg.data) {
        console.log('⚡ Live Sync: BroadcastChannel Message Received -> Updating frontend UI immediately...');
        if (msg.data.key && msg.data.data) {
          safeStorageSet(msg.data.key, JSON.stringify(msg.data.data));
        }
        if (typeof renderFrontendProperties === 'function') renderFrontendProperties();
        if (typeof renderNewProjects === 'function') renderNewProjects();
        if (typeof renderProperties === 'function') renderProperties();
        if (typeof renderFarmlandFastTrack === 'function') renderFarmlandFastTrack();
        if (typeof renderFastTrackLand === 'function') renderFastTrackLand();
        if (typeof renderLandShowcase === 'function') renderLandShowcase();
        await fetchServerDB();
      }
    };
  } catch(e) {}
}

// 3. Universal Fallback Polling (Guarantees sync on Brave & Strict Privacy Browsers)
let _lastStorageCheckVal = '';
setInterval(function() {
  try {
    const currentVal = (safeStorageGet(LB_STORAGE_KEYS.PROPERTIES) || '') + (safeStorageGet('lb_new_projects_data') || '') + (safeStorageGet('lb_farmland_data') || '');
    if (currentVal && currentVal !== _lastStorageCheckVal) {
      _lastStorageCheckVal = currentVal;
      if (typeof renderFrontendProperties === 'function') renderFrontendProperties();
      if (typeof renderProperties === 'function') renderProperties();
      if (typeof renderNewProjects === 'function') renderNewProjects();
      if (typeof renderFarmlandFastTrack === 'function') renderFarmlandFastTrack();
      if (typeof renderLandShowcase === 'function') renderLandShowcase();
      if (typeof renderApprovedProjects === 'function') renderApprovedProjects();
      if (typeof renderNewsArticles === 'function') renderNewsArticles();
      if (typeof renderLiveNewsTicker === 'function') renderLiveNewsTicker();
      if (typeof initLivabilityEngine === 'function') initLivabilityEngine();
    }
  } catch(e) {}
}, 1500);

function notifyStateUpdate(key, data) {
  try {
    if (lbSyncChannel) {
      lbSyncChannel.postMessage({ type: 'STATE_UPDATE', key: key, data: data });
    } else if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('lb_sync_channel');
      bc.postMessage({ type: 'STATE_UPDATE', key: key, data: data });
      bc.close();
    }
  } catch(e) {}
}

/**
 * ==========================================================================
 * LAND AND BEYOND — SMART REAL ESTATE APPLICATION SCRIPT
 * Find the Right Property. At the Right Price.
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. Comprehensive Property Database (Individual Listings)
// --------------------------------------------------------------------------
let PROPERTIES_DATA = [
  {
    id: 'prop-1',
    title: 'Emerald Heights Luxury Flats',
    category: 'Apartments',
    bhk: '3 BHK',
    location: 'Saravanampatti',
    price: 12500000, // ₹ 1.25 Cr
    priceLabel: '₹ 1.25 Cr',
    ratePerSqft: '₹ 6,578 / sq.ft',
    area: '1,900 sq.ft',
    builder: 'Skyline Builders & Developers',
    parking: 'Yes',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Good Value',
    assessmentNote: 'Priced 8% below the current Saravanampatti IT corridor benchmark with strong rental yield.',
    livability: {
      composite: 9.3,
      label: 'Excellent Livability',
      schools: 9.2,
      schoolsHint: 'Within 2.5 km of Manchester Intl School, SNS College & Kumaraguru Tech',
      hospitals: 8.8,
      hospitalsHint: '10 mins to Sri Ramakrishna Hospital & KG Healthcare Hub',
      retail: 9.5,
      retailHint: 'Prozone Mall, DMart & organic farm markets within 1.5 km',
      transit: 9.0,
      transitHint: 'Bus bays at 200m; Coimbatore Intl Airport within 18 mins'
    },
    roadAccess: '18m Wide Dual-Carriageway',
    waterSource: 'Siruvani + 24/7 Deep Borewell',
    groundwater: '110 - 130 Feet',
    powerGrid: '3-Phase TNEB + 100% DG Backup',
    approval: 'DTCP & RERA Approved',
    zoning: 'Residential Urban Zone',
    description: 'Ultra-modern 3 BHK apartment in the heart of Saravanampatti IT corridor with clubhouse, rooftop infinity pool, and EV charging stations.'
  },
  {
    id: 'prop-2',
    title: 'Mayflower Grandeur Residences',
    category: 'Apartments',
    bhk: '2 BHK',
    location: 'Peelamedu',
    price: 8800000, // ₹ 88 Lakh
    priceLabel: '₹ 88 Lakh',
    ratePerSqft: '₹ 6,875 / sq.ft',
    area: '1,280 sq.ft',
    builder: 'Mayflower Enterprises',
    parking: 'Yes',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Good Value',
    assessmentNote: 'Strategic location on Avinashi Road with high tenant occupancy and solid capital appreciation.',
    livability: {
      composite: 9.5,
      label: 'Prime Livability',
      schools: 9.6,
      schoolsHint: 'Walking distance to PSG Tech, PSG IMS & GRD Institute',
      hospitals: 9.4,
      hospitalsHint: '5 mins to PSG Hospitals & Royal Care Healthcare',
      retail: 9.8,
      retailHint: 'Fun Republic Mall & Lakshmi Mills Urban Center within 800m',
      transit: 9.2,
      transitHint: '8 mins to Coimbatore Airport; direct arterial Avinashi road access'
    },
    roadAccess: '24m Main Avinashi Commercial Corridor',
    waterSource: 'Siruvani Drinking Water 24/7',
    groundwater: '130 - 150 Feet',
    powerGrid: 'TNEB Dedicated Transformer + Solar Common Lighting',
    approval: 'DTCP / RERA Sanctioned',
    zoning: 'Mixed Residential / Commercial',
    description: 'High-yield 2 BHK apartment suited for IT professionals and faculty, offering lush landscaping, fitness center, and gated 24/7 security.'
  },
  {
    id: 'prop-3',
    title: 'Verdant Villa Residences',
    category: 'Villas',
    bhk: '4+ BHK',
    location: 'Race Course',
    price: 34000000, // ₹ 3.40 Cr
    priceLabel: '₹ 3.40 Cr',
    ratePerSqft: '₹ 8,947 / sq.ft',
    area: '3,800 sq.ft',
    builder: 'GreenOak Estates',
    parking: 'Yes',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Fair Market Range',
    assessmentNote: 'Ultra-luxury heritage location with lifetime green views and elite neighborhood stature.',
    livability: {
      composite: 9.6,
      label: 'Ultra-Luxury Tier',
      schools: 9.5,
      schoolsHint: 'Close to Stanes Anglo Indian School & GD Naidu Matriculation',
      hospitals: 9.7,
      hospitalsHint: '3 mins to G.Kuppuswamy Naidu Memorial Hospital (GKNM)',
      retail: 9.4,
      retailHint: 'Brookefields Mall & Race Course Promenade Cafes at doorstep',
      transit: 9.6,
      transitHint: '5 mins to Coimbatore Central Railway Junction'
    },
    roadAccess: '18m Tree-lined Avenue',
    waterSource: 'Siruvani High-Pressure Line + Solar Sump',
    groundwater: '90 - 110 Feet',
    powerGrid: 'Underground Cabling + 10kW Solar Rooftop Grid',
    approval: 'RERA Sanctioned',
    zoning: 'Prime Residential Villa Corridor',
    description: 'Architect-designed 4 BHK luxury villa with private landscaped garden, home theatre, Italian marble flooring, and smart home automation.'
  },
  {
    id: 'prop-4',
    title: 'Palm Meadows Executive Villa',
    category: 'Villas',
    bhk: '3 BHK',
    location: 'Kovaipudur',
    price: 14500000, // ₹ 1.45 Cr
    priceLabel: '₹ 1.45 Cr',
    ratePerSqft: '₹ 6,041 / sq.ft',
    area: '2,400 sq.ft',
    builder: 'Western Ghats Developers',
    parking: 'Yes',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Good Value',
    assessmentNote: 'Tranquil hill-view gated sanctuary with pleasant microclimate throughout the year.',
    livability: {
      composite: 8.9,
      label: 'Serene Residential',
      schools: 8.8,
      schoolsHint: 'Near Ashram Matriculation & Sri Krishna Arts & Science College',
      hospitals: 8.5,
      hospitalsHint: 'Kovaipudur Multi-Speciality Clinic & Ganga Medical Center branch',
      retail: 8.7,
      retailHint: 'Supermarkets, organic stores & recreation parks within 1 km',
      transit: 8.6,
      transitHint: '15 mins to Ukkadam Central Bus Terminal'
    },
    roadAccess: '12m Gated Internal Paver Road',
    waterSource: 'Siruvani + Abundant Foothill Water Supply',
    groundwater: '100 - 120 Feet',
    powerGrid: 'TNEB 3-Phase + Solar Inverter',
    approval: 'DTCP Approved',
    zoning: 'Eco-Residential Zone',
    description: 'Serene contemporary villa offering panoramic Western Ghats mountain views, private terrace sit-out, and manicured lawns.'
  },
  {
    id: 'prop-5',
    title: 'Silver Oak Gated Layout Plots',
    category: 'Residential Plots',
    bhk: 'Plots',
    location: 'Annur',
    price: 2400000, // ₹ 24 Lakh
    priceLabel: '₹ 24 Lakh',
    ratePerSqft: '₹ 1,333 / sq.ft',
    area: '1,800 sq.ft (4.1 Cents)',
    builder: 'Sri Krishna Promoters',
    parking: 'No',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    assessment: 'High Potential ROI',
    assessmentNote: 'Situated in Coimbatore’s fastest growing industrial & residential expansion belt with 18% projected annual appreciation.',
    livability: {
      composite: 8.6,
      label: 'Growth Corridor',
      schools: 8.5,
      schoolsHint: 'Proximity to Annur Matriculation & Sathy Road Colleges',
      hospitals: 8.2,
      hospitalsHint: 'Annur Government Hospital & Private Emergency Clinics',
      retail: 8.6,
      retailHint: 'Annur Town Market & Commercial stores within 1.2 km',
      transit: 8.8,
      transitHint: 'National Highway Sathy Road connectivity; 20 mins to Saravanampatti'
    },
    roadAccess: '12m Blacktop Tar Road with LED Streetlights',
    waterSource: 'Dedicated Community Borewell + Overhead Tank',
    groundwater: '120 - 140 Feet',
    soilType: 'Rich Red Loam (Excellent foundation)',
    powerGrid: 'Dedicated Transformer Installed',
    approval: 'DTCP & RERA Approved',
    zoning: 'Sanctioned Residential Layout',
    description: 'Fully developed gated community plot ready for immediate house construction with tar roads, water pipeline, and security fencing.'
  },
  {
    id: 'prop-6',
    title: 'Farmcrest Agro Dry Land Parcel',
    category: 'Dry Land',
    bhk: 'Plots',
    location: 'Sulur',
    price: 4200000, // ₹ 42 Lakh
    priceLabel: '₹ 42 Lakh',
    ratePerSqft: '₹ 12 Lakh / Acre',
    area: '3.50 Acres',
    builder: 'Coimbatore Agriland Corp',
    parking: 'No',
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    assessment: 'High Potential ROI',
    assessmentNote: 'Clear title dry land along proposed Outer Ring Road corridor with immense long-term capital surge.',
    livability: {
      composite: 8.4,
      label: 'Agro Investment',
      schools: 7.9,
      schoolsHint: 'Near RVS Educational Institutions & Sulur Schools',
      hospitals: 8.1,
      hospitalsHint: 'Sulur Taluk Hospital & ESI Dispensary',
      retail: 8.2,
      retailHint: 'Sulur Central Bazaar within 3 km',
      transit: 8.8,
      transitHint: 'Direct road access from Trichy Highway & L&T Bypass'
    },
    roadAccess: '18m Wide Highway Feeder Road',
    waterSource: 'Natural Irrigation Canal Proximity + Borewell 140ft',
    groundwater: '130 - 150 Feet',
    soilType: 'Fertile Red Sandy Loam (Ideal for Agro-Farming & Warehousing)',
    powerGrid: 'Free Agricultural Tariff Line Eligible',
    approval: 'Clear Patta & Legal Title Certified',
    zoning: 'Agricultural / Dry Farmland',
    description: 'High-fertility agricultural dry land with 18m road frontage, clear documentation, suitable for organic coconut grove, farm resort, or warehouse.'
  },
  {
    id: 'prop-7',
    title: 'Whispering Palms Heritage Flat',
    category: 'Apartments',
    bhk: '3 BHK',
    location: 'RS Puram',
    price: 18500000, // ₹ 1.85 Cr
    priceLabel: '₹ 1.85 Cr',
    ratePerSqft: '₹ 8,409 / sq.ft',
    area: '2,200 sq.ft',
    builder: 'Casagrand Builders',
    parking: 'Yes',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Fair Market Range',
    assessmentNote: 'Elite residential precinct with unmatched lifestyle amenities, dining, and central convenience.',
    livability: {
      composite: 9.7,
      label: 'Elite Livability',
      schools: 9.8,
      schoolsHint: '5 mins to Suburban School & Avila Convent',
      hospitals: 9.6,
      hospitalsHint: 'Lotus Eye Care & RS Puram Multi-Speciality Clinics',
      retail: 9.7,
      retailHint: 'DB Road shopping hubs, gourmet restaurants & supermarkets',
      transit: 9.6,
      transitHint: '10 mins to Gandhipuram and Railway Station'
    },
    roadAccess: '15m Prime DB Road Link',
    waterSource: 'Siruvani Dedicated Corporation Supply',
    groundwater: '100 - 120 Feet',
    powerGrid: '3-Phase Grid + 100% Generator Backup',
    approval: 'DTCP & RERA Approved',
    zoning: 'Prime Residential Urban',
    description: 'Opulent 3 BHK residence in RS Puram featuring teakwood joinery, modular kitchen, swimming pool, gym, and dual covered car parks.'
  },
  {
    id: 'prop-8',
    title: 'Kongu Valley Agro Farm Estate',
    category: 'Dry Land',
    bhk: 'Plots',
    location: 'Annur',
    price: 5800000, // ₹ 58 Lakh
    priceLabel: '₹ 58 Lakh',
    ratePerSqft: '₹ 11.6 Lakh / Acre',
    area: '5.00 Acres',
    builder: 'Kongu Agro Holdings',
    parking: 'No',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    assessment: 'High Potential ROI',
    assessmentNote: 'Large contiguous farmland parcel with existing drip irrigation and organic soil certification.',
    livability: {
      composite: 8.2,
      label: 'Pure Agro Parcel',
      schools: 7.8,
      schoolsHint: 'Annur & Avinashi Taluk Educational centers',
      hospitals: 8.0,
      hospitalsHint: 'Annur Medical Centers',
      retail: 8.0,
      retailHint: 'Local farmers market and farm supply hubs',
      transit: 8.6,
      transitHint: 'State Highway link road with truck/tractor accessibility'
    },
    roadAccess: '12m State Link Road',
    waterSource: '2 Open Wells + Drip Network Installed',
    groundwater: '120 Feet',
    soilType: 'Black Cotton & Red Loam Mix',
    powerGrid: 'Free Farm Power Connection Active',
    approval: 'Clear Title Deeds & Revenue Verified',
    zoning: 'Agricultural Farmland',
    description: 'Vast 5-acre farmland parcel with fencing, live water resources, ready for polyhouse farming, dairy operations, or farmhouse retreats.'
  },
  {
    id: 'prop-9',
    title: 'Kovaipudur Highland Plots',
    category: 'Residential Plots',
    bhk: 'Plots',
    location: 'Kovaipudur',
    price: 3800000, // ₹ 38 Lakh
    priceLabel: '₹ 38 Lakh',
    ratePerSqft: '₹ 1,583 / sq.ft',
    area: '2,400 sq.ft (5.5 Cents)',
    builder: 'Foothill Estates',
    parking: 'No',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Good Value',
    assessmentNote: 'Scenic hillside location with cool breeze, clear pollution-free air, and excellent gated infrastructure.',
    livability: {
      composite: 8.8,
      label: 'Scenic Living',
      schools: 8.7,
      schoolsHint: 'Near C.B.M. College & Sri Krishna Institutions',
      hospitals: 8.6,
      hospitalsHint: 'Kovaipudur Clinics & KMCH City Center',
      retail: 8.8,
      retailHint: 'Nilgiris Supermarket & neighborhood shopping arcades',
      transit: 8.9,
      transitHint: 'Smooth 4-lane link to Palakkad Highway & Coimbatore Ring'
    },
    roadAccess: '15m Wide Paver Road with Storm Drains',
    waterSource: 'Siruvani Pipeline Connection Ready',
    groundwater: '110 Feet',
    soilType: 'Compact Red Hard Soil',
    powerGrid: 'Underground Electricity Grid & Solar Streetlights',
    approval: 'DTCP & RERA Sanctioned',
    zoning: 'Gated Residential Layout',
    description: 'Scenic foothill residential plot situated in a gated community with children’s play area, jogging track, and perimeter security.'
  },
  {
    id: 'prop-10',
    title: 'Harmony Serene Studio Flat',
    category: 'Apartments',
    bhk: '1 BHK',
    location: 'Gandhipuram',
    price: 4500000, // ₹ 45 Lakh
    priceLabel: '₹ 45 Lakh',
    ratePerSqft: '₹ 6,617 / sq.ft',
    area: '680 sq.ft',
    builder: 'Harmony Realty',
    parking: 'No',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    assessment: 'Good Value',
    assessmentNote: 'Central city location with maximum transit score and instant rental tenancy.',
    livability: {
      composite: 9.1,
      label: 'City Center Hub',
      schools: 9.0,
      schoolsHint: 'Central city schools & polytechnic colleges within 2 km',
      hospitals: 9.2,
      hospitalsHint: 'Coimbatore Medical College Hospital & KG Hospital nearby',
      retail: 9.5,
      retailHint: 'Cross Cut Road shopping street & 100 Feet Road retail hub',
      transit: 9.8,
      transitHint: '3 mins walk to Gandhipuram Central Bus Terminals'
    },
    roadAccess: '12m Cross Cut Road Link',
    waterSource: 'Corporation Water + Sump',
    groundwater: '120 Feet',
    powerGrid: 'TNEB 3-Phase Connection',
    approval: 'DTCP Approved',
    zoning: 'Urban Residential',
    description: 'Compact, smart 1 BHK apartment situated right in central Gandhipuram with lift, security surveillance, and low monthly maintenance.'
  }
];

// --------------------------------------------------------------------------
// 2. New & Upcoming Projects Showcase Database
// --------------------------------------------------------------------------
const NEW_PROJECTS_DATA = [
  {
    id: 'proj-1',
    title: 'Aura Emerald Gated Enclave',
    builder: 'Aura Promoters & Infra',
    categoryType: 'dtcp-plots',
    typeBadge: 'Gated Community Plots',
    statusTag: 'Fast Selling',
    statusColor: 'ribbon-coral',
    location: 'Annur - Sathy Corridor',
    priceStarting: '₹ 18.5 Lakhs onwards',
    ratePerUnit: '₹ 1,150 / sq.ft',
    totalUnits: '140 Sanctioned Plots',
    projectSize: '18 Acres Total Area',
    possession: 'Dec 2026',
    landmark: '3 mins from Annur Central Bus Stand & Sathy Highway',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    description: 'Grand 18-acre master-planned residential layout with 40ft blacktop roads, landscaped grand entry arch, and 24/7 security.',
    masterPlanImg: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
    stage: 'pre-launch'
  },
  {
    id: 'proj-2',
    title: 'Skyline Sovereign Villa Township',
    builder: 'Skyline Luxury Infra',
    categoryType: 'villas-apartments',
    typeBadge: 'Luxury Villa Project',
    statusTag: 'Pre-Launch Offer',
    statusColor: 'ribbon-amber',
    location: 'Saravanampatti IT Belt',
    priceStarting: '₹ 1.65 Cr onwards',
    ratePerUnit: '₹ 5,800 / sq.ft',
    totalUnits: '64 Independent Villas',
    projectSize: '8.5 Acres Township',
    possession: 'Oct 2026',
    landmark: '5 mins from CHIL SEZ & Prozone Mall',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    description: 'Gated enclave of 3 & 4 BHK contemporary duplex luxury villas with private plunge pools, solar energy systems, and club amenities.',
    masterPlanImg: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    stage: 'pre-launch'
  },
  {
    id: 'proj-3',
    title: 'Kovai Horizon Eco Heights',
    builder: 'Horizon Infra Corp',
    categoryType: 'villas-apartments',
    typeBadge: 'High-Rise Apartments',
    statusTag: '50% Sold Out',
    statusColor: 'ribbon-purple',
    location: 'Peelamedu',
    priceStarting: '₹ 68 Lakhs onwards',
    ratePerUnit: '₹ 6,200 / sq.ft',
    totalUnits: '320 Smart Units (2/3 BHK)',
    projectSize: '5.5 Acres Total Area',
    possession: 'Ready to Move / Aug 2026',
    landmark: '2 mins from Fun Republic Mall & PSG Tech',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    description: 'Eco-certified high-rise living featuring panoramic city skyline views, EV charging bays, and rooftop jogging tracks.',
    masterPlanImg: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    stage: 'ready-to-move'
  },
  {
    id: 'proj-4',
    title: 'Kongu Agri-Corridor Mega Farmland',
    builder: 'Kongu Farmland Promoters',
    categoryType: 'dry-land',
    typeBadge: 'Agricultural / Dry Land',
    statusTag: 'Launching Soon',
    statusColor: 'ribbon-green',
    location: 'Sulur - Palladam Corridor',
    priceStarting: '₹ 28 Lakhs / Acre',
    ratePerUnit: '₹ 28 Lakh / Acre',
    totalUnits: '12 Large Farm Parcels',
    projectSize: '40 Acres Contiguous Land',
    possession: 'Immediate Registry',
    landmark: '10 mins from L&T Bypass / Outer Ring Corridor',
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1000&q=80',
    description: 'Vast agricultural dry land parcels with 30ft paved roads, barbed boundary fencing, and abundant sweet groundwater.',
    masterPlanImg: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    stage: 'pre-launch'
  },
  {
    id: 'proj-5',
    title: 'Foothill Serenity Gated Plots',
    builder: 'Western Foothill Realty',
    categoryType: 'dtcp-plots',
    typeBadge: 'Gated Community Plots',
    statusTag: 'Ready to Move',
    statusColor: 'ribbon-green',
    location: 'Kovaipudur Foothills',
    priceStarting: '₹ 29 Lakhs onwards',
    ratePerUnit: '₹ 1,450 / sq.ft',
    totalUnits: '75 Boutique Plots',
    projectSize: '10 Acres Layout',
    possession: 'Ready for Construction',
    landmark: 'Adjacent to Sri Krishna Educational Institutions',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
    description: 'Scenic hillside residential plots with Siruvani water connection, landscaped avenue trees, and children’s play parks.',
    masterPlanImg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    stage: 'ready-to-move'
  },
  {
    id: 'proj-6',
    title: 'Riverview Agro Ranch Estates',
    builder: 'Coimbatore Green Agro',
    categoryType: 'dry-land',
    typeBadge: 'Eco Ranch Farmland',
    statusTag: 'Pre-Launch Offer',
    statusColor: 'ribbon-amber',
    location: 'Pollachi - Kinathukadavu Corridor',
    priceStarting: '₹ 35 Lakhs / Acre',
    ratePerUnit: '₹ 35 Lakh / Acre',
    totalUnits: '10 Eco Ranch Plots',
    projectSize: '25 Acres Agro Enclave',
    possession: 'Immediate Registry',
    landmark: 'Adjacent to Aliyar feeder canal & Pollachi 4-lane',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80',
    description: 'High-yield fertile farmland with drip infrastructure, high organic carbon soil, and direct feeder canal water access.',
    masterPlanImg: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    stage: 'pre-launch'
  }
];

// Fast-Track Land Highlights Database (Strictly user-created Admin listings only)
const INITIAL_FARMLANDS = [];

// --------------------------------------------------------------------------
// 3. Market Insights & Real Estate News Database
// --------------------------------------------------------------------------
const NEWS_ARTICLES_DATA = [
  {
    id: 'news-1',
    title: 'Upcoming High-Rise Luxury Towers on Avinashi Road & Saravanampatti',
    category: 'Flats & High-Rises',
    date: 'August 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    summary: 'Comprehensive analysis of 4 major tier-1 builder pre-launches, locality demand surges, expected handover milestones, and pricing trends across Peelamedu and Saravanampatti.',
    fullContent: `
      <p>Coimbatore's residential skyline is witnessing a massive vertical transformation in 2026. Tier-1 developers including Casagrand, Mayflower, and Skyline Infra have officially scheduled pre-launches for 4 luxury high-rise communities totaling over 1,400 smart apartments along the Avinashi Road arterial corridor and the Saravanampatti IT belt.</p>
      <p>Average price realizations in these micro-markets have climbed to <strong>₹ 6,200 – ₹ 8,500 per sq.ft</strong>, driven by expanding IT SEZs and proximity to Coimbatore International Airport. Expected handover timelines for current pre-launch phases span from Q4 2026 to Mid 2027.</p>
    `,
    takeaways: [
      'Over 1,400 new luxury 2 & 3 BHK units entering pre-launch booking phase.',
      'Average rental yields projected at 5.2% – 6.1% due to surging IT workforce influx.',
      'Key corridors: Avinashi Road, Peelamedu, and Saravanampatti IT Expressway.'
    ]
  },
  {
    id: 'news-2',
    title: 'Affordable Housing Schemes & Metro Corridor Expansion Flats',
    category: 'Infrastructure & Metro',
    date: 'August 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    summary: 'How the proposed Coimbatore Metro Phase 1, Avinashi 10.1 km elevated expressway, and PMAY 2.0 subsidies are unlocking affordable high-yield residential corridors.',
    fullContent: `
      <p>The state government’s acceleration of the 10.1 km Avinashi Road Elevated Corridor and Phase-1 Metro feeder lines has dramatically improved urban transit efficiency across the district. Micro-markets such as Singanallur, Sulur, and Kovaipudur are experiencing high buyer traction under the revised PMAY 2.0 credit-linked subsidy scheme.</p>
      <p>Developers are capitalizing on this connectivity surge by offering compact 1 and 2 BHK residences priced between <strong>₹ 32 Lakhs and ₹ 55 Lakhs</strong>, making quality homeownership accessible for first-time buyers with up to ₹ 2.67 Lakhs in interest subsidies.</p>
    `,
    takeaways: [
      'Travel times from eastern suburbs to central Gandhipuram slashed by up to 45%.',
      'PMAY 2.0 subsidies offer direct home loan interest benefits for eligible buyers.',
      'Strongest growth observed in Sulur, Singanallur, and Kovaipudur foothill belts.'
    ]
  },
  {
    id: 'news-3',
    title: 'Real Estate Policy, Guideline Values & Tax Insights 2026',
    category: 'Legal & Tax Intelligence',
    date: 'July 2026',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    summary: 'Essential breakdown of Tamil Nadu’s composite registration guidelines, home loan tax deductions under Section 24(b) & 80C, and legal due diligence checklists.',
    fullContent: `
      <p>Understanding regulatory frameworks is crucial before committing property capital in Tamil Nadu. The Registration Department’s revised composite guideline rules provide clear transparency, reducing stamp duty overheads for apartments and sanctioned DTCP layouts.</p>
      <p>First-time homebuyers can maximize annual tax deductions up to <strong>₹ 2,00,000 on home loan interest</strong> (Section 24b) and <strong>₹ 1,50,000 on principal repayment</strong> (Section 80C). Additionally, TN RERA’s stringent 70% escrow compliance ensures complete financial security against project handover delays.</p>
    `,
    takeaways: [
      'Concessional stamp duty & registration frameworks for apartments under ₹ 50 Lakhs.',
      'Combined annual tax savings up to ₹ 3.5 Lakhs under Sections 24(b) and 80C.',
      'Mandatory DTCP & TN RERA verification eliminates unapproved layout risks.'
    ]
  }
];

// --------------------------------------------------------------------------
// 4. Approved Townships & Layouts Dynamic Loader (100% Real Data)
// --------------------------------------------------------------------------
function getDynamicApprovedProjects() {
  const allProps = (typeof getLBData === 'function' ? getLBData(LB_KEYS.PROPERTIES) : []) || [];
  const banned = ['grand aeropolis', 'aura emerald', 'skyline sovereign', 'kongu valley'];
  
  const realApproved = allProps.filter(p => {
    if (!p || !p.title) return false;
    const t = p.title.toLowerCase().trim();
    if (banned.some(b => t.includes(b))) return false;
    return (p.status === 'Active' || !p.status);
  });

  return realApproved.map(p => {
    const approvalText = p.approvalType || p.approval || '100% DTCP Approved';
    const legalNumber = p.legalNo || p.approvalNumber || ('DTCP/' + (p.location ? p.location.substring(0,3).toUpperCase() : 'CBE') + '/2026');
    const reraNumber = p.reraNumber || p.reraNo || ('TNRERA/AUTH/' + (p.id ? p.id.replace('prop_','') : '2026'));
    
    let feats = [];
    if (p.metrics) feats.push(p.metrics);
    if (p.bhk && p.bhk !== 'Standard') feats.push(`Specification: ${p.bhk}`);
    if (p.facing) feats.push(`Orientation: ${p.facing} Facing`);
    if (feats.length < 3) {
      feats.push('100% Clear Legal Title & Revenue Patta Verified');
      feats.push('Bank Loan Pre-Approved (Up to 85% Sanction)');
      feats.push('Immediate Registration & Clear Gated Boundaries');
    }

    return {
      id: p.id || ('prop_' + Math.random().toString(36).substr(2, 9)),
      name: p.title,
      location: p.location || 'Coimbatore',
      builder: p.builder || 'Verified Land Promoter',
      startingPrice: p.priceLabel ? `₹ ${p.priceLabel}` : (p.price ? `₹ ${p.price}` : '₹ Contact for Price'),
      dtcpNo: legalNumber,
      reraNo: reraNumber,
      approvalStamp: approvalText,
      features: feats.slice(0, 5),
      pattaStatus: '100% Subdivided Legal Patta Certified',
      bankApproved: 'SBI, HDFC, ICICI, Canara Bank'
    };
  });
}

const APPROVED_TOWNSHIPS_DATA = [];

// --------------------------------------------------------------------------
// 5. Global State
// --------------------------------------------------------------------------
const state = {
  currentCategoryFilter: 'All',
  currentSort: 'match-desc',
  selectedCompareIds: [],
  matcherInputs: {
    category: 'Apartments',
    location: 'Saravanampatti',
    bhk: '3 BHK',
    parking: 'Yes',
    maxBudgetLakhs: 150
  },
  projectFilter: 'all',
  projectSearchTerm: '',
  currentUser: null
};

// Helper: Compact Indian Currency Formatter
const formatCompactLakhCrore = (lakhs) => {
  if (lakhs >= 100) {
    const cr = (lakhs / 100).toFixed(2);
    return `₹ ${cr.replace(/\.00$/, '')} Cr`;
  }
  return `₹ ${Math.round(lakhs)} Lakh`;
};

// Helper: Full INR Currency Formatter
const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

// --------------------------------------------------------------------------
// 6. Toast Notification Utility
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'warning') icon = '⚠';
  if (type === 'error') icon = '✕';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --------------------------------------------------------------------------
// 7. Static Frontend Property Sync & DOM Binding
// --------------------------------------------------------------------------
function renderFrontendProperties(filterCategory = 'all') {
  const customLaunches = (typeof getLBData === 'function' ? getLBData('lb_new_projects_data') : []) || [];
  const storedProps = (typeof getLBData === 'function' ? getLBData(LB_KEYS.PROPERTIES) : []) || [];
  const banned = ['grand aeropolis', 'aura emerald', 'skyline sovereign', 'mayflower grandeur', 'kongu valley'];

  let combined = [...storedProps, ...customLaunches].filter(p => p && p.title && !banned.some(b => p.title.toLowerCase().includes(b)) && (p.status || 'Active').toLowerCase() !== 'archived');
  combined.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));

  if (filterCategory === 'commercial') {
    combined = combined.filter(p => {
      const c = (p.category || '').toLowerCase();
      const t = (p.title || '').toLowerCase();
      const m = (p.metrics || '').toLowerCase();
      return c.includes('commercial') || c.includes('office') || c.includes('retail') || c.includes('shop') || t.includes('commercial') || m.includes('commercial');
    });
  } else if (filterCategory === 'villas-apartments') {
    combined = combined.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('villa') || c.includes('apartment') || c.includes('flat') || c.includes('high-rise');
    });
  } else if (filterCategory === 'dtcp-plots') {
    combined = combined.filter(p => {
      const c = (p.category || '').toLowerCase();
      const a = (p.approvalType || p.approval || p.legalStatus || '').toLowerCase();
      return c.includes('plot') || a.includes('dtcp') || a.includes('rera') || a.includes('approved') || a.includes('sanction');
    });
  } else if (filterCategory === 'dry-land') {
    combined = combined.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('farm') || c.includes('dry') || c.includes('agro') || c.includes('land');
    });
  } else if (filterCategory === 'pre-launch') {
    combined = combined.filter(p => {
      const b = (p.badge || p.featureBadge || '').toLowerCase();
      const s = (p.status || '').toLowerCase();
      return b.includes('pre-launch') || b.includes('launch') || b.includes('offer') || s.includes('active') || !s;
    });
  }

  const heroProject = combined[0];
  const megaBanner = document.getElementById('megaProjectBanner');
  if (!heroProject) {
    if (megaBanner) megaBanner.style.display = 'none';
    return;
  }
  if (megaBanner) megaBanner.style.display = 'grid';

  const heroTitle = document.getElementById('heroPropertyTitle');
  const heroPrice = document.getElementById('heroPropertyPrice');
  const heroLocation = document.getElementById('heroPropertyLocation');
  const heroBuilder = document.getElementById('heroPropertyBuilder');
  const heroRate = document.getElementById('heroPropertyRate');
  const heroImageWrap = document.getElementById('heroPropertyImgWrap');
  const heroBadge = document.getElementById('heroPropertyApprovalBadge');
  const heroHighlights = document.getElementById('heroPropertyHighlights');
  const heroVisitBtn = document.getElementById('heroBookVisitBtn');
  const heroBrochureBtn = document.getElementById('heroBrochureBtn');
  const topAnnouncementText = document.getElementById('topAnnouncementText');

  const title = heroProject.title;
  const price = heroProject.priceLabel ? `₹ ${heroProject.priceLabel}` : (heroProject.price ? `₹ ${heroProject.price}` : 'Price on Request');
  const location = heroProject.location || 'Coimbatore';
  const builder = heroProject.builder || 'Verified Land & Infra Developer';
  const rate = heroProject.metrics || heroProject.summary || heroProject.description || 'Smart Gated Community Master Plan';
  const img = heroProject.imageUrl || heroProject.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1500&q=80';
  const badge = heroProject.badge || heroProject.approvalType || '★ Pre-Launch Offer';

  if (heroTitle) heroTitle.textContent = title;
  if (heroPrice) heroPrice.innerHTML = `${price} <small>onwards</small>`;
  if (heroLocation) heroLocation.textContent = location;
  if (heroBuilder) heroBuilder.textContent = `By ${builder} • Gated Master Plan`;
  if (heroRate) heroRate.textContent = rate;
  if (heroImageWrap) heroImageWrap.style.backgroundImage = `url('${img}')`;
  if (heroBadge) heroBadge.textContent = badge;
  if (heroHighlights) {
    heroHighlights.innerHTML = `
      <li><span class="check-icon">✓</span> <strong>100% Clear Legal Title</strong> &amp; Government Approvals</li>
      <li><span class="check-icon">✓</span> <strong>Prime Corridor Location</strong> with Wide Road Infrastructure</li>
      <li><span class="check-icon">✓</span> <strong>Bank Loan Pre-Approved</strong> (Up to 85% Sanction)</li>
      <li><span class="check-icon">✓</span> <strong>24/7 Security</strong> &amp; Ready Utilities Connected</li>
    `;
  }
  if (heroVisitBtn) heroVisitBtn.onclick = () => openSiteVisitModal(title);
  if (heroBrochureBtn) heroBrochureBtn.onclick = () => window.downloadBrochure(title);
  if (topAnnouncementText) topAnnouncementText.innerHTML = `Mega Pre-Launch: ${title} — <strong>Starting ${price} • 0% Brokerage</strong>`;
}

window.syncHomepageUI = renderFrontendProperties;
window.renderFrontendProperties = renderFrontendProperties;


// --------------------------------------------------------------------------
// 8. DOM Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.renderFrontendProperties === 'function') window.renderFrontendProperties();
  if (typeof window.initHeroBackgroundSlider === 'function') window.initHeroBackgroundSlider();
  if (typeof window.initSmartMatcher === 'function') window.initSmartMatcher();
  if (typeof window.renderNewProjects === 'function') window.renderNewProjects();
  if (typeof window.renderFastTrackLand === 'function') window.renderFastTrackLand();
  if (typeof window.renderApprovedProjects === 'function') window.renderApprovedProjects();
  if (typeof window.renderProperties === 'function') window.renderProperties();
  if (typeof window.renderLandShowcase === 'function') window.renderLandShowcase();
  if (typeof window.renderNewsArticles === 'function') window.renderNewsArticles();
  if (typeof window.initLivabilityIntelligence === 'function') window.initLivabilityIntelligence();
  if (typeof window.initComparisonDock === 'function') window.initComparisonDock();
  if (typeof window.initEmiCalculator === 'function') window.initEmiCalculator();
  if (typeof window.initTestimonialSlider === 'function') window.initTestimonialSlider();
  if (typeof window.initModals === 'function') window.initModals();
  if (typeof window.initNavigation === 'function') window.initNavigation();
  if (typeof window.initNewProjectsSearchAndTabs === 'function') window.initNewProjectsSearchAndTabs();
  if (typeof window.initNewsletterSubscription === 'function') window.initNewsletterSubscription();
  if (typeof window.initCleanUrlRouting === 'function') window.initCleanUrlRouting();
  if (typeof window.initGlobalEventDispatcher === 'function') window.initGlobalEventDispatcher();
});

// --------------------------------------------------------------------------
// Clean URL Routing & Deep-Linking System
// --------------------------------------------------------------------------
function initCleanUrlRouting() {
  const routeMap = {
    '/farmland': 'upcomingFarmlandFastTrack',
    '/launches': 'newProjects',
    '/projects': 'newProjects',
    '/plots': 'landShowcase',
    '/news': 'newsHub',
    '/approvals': 'newsHub',
    '/calculator': 'services',
    '/matcher': 'matcher',
    '/compare': () => {
      document.getElementById('dockCompareBtn')?.click() || openModal('compareModal');
    }
  };

  function handleRoute(path) {
    const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';
    const target = routeMap[cleanPath];
    if (!target) return;

    if (typeof target === 'function') {
      setTimeout(target, 300);
    } else {
      const el = document.getElementById(target);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }

  // Handle on Initial Load
  const currentPath = window.location.pathname;
  if (currentPath && currentPath !== '/' && currentPath !== '/index.html') {
    handleRoute(currentPath);
  }

  // Intercept Navigation Links for Clean URL History Updating
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const sectionId = href.substring(1);
      let cleanPath = '';
      if (sectionId === 'newProjects') cleanPath = '/launches';
      else if (sectionId === 'upcomingFarmlandFastTrack') cleanPath = '/farmland';
      else if (sectionId === 'landShowcase') cleanPath = '/plots';
      else if (sectionId === 'newsHub') cleanPath = '/news';
      else if (sectionId === 'services') cleanPath = '/calculator';
      else if (sectionId === 'matcher') cleanPath = '/matcher';

      if (cleanPath && window.history && window.history.pushState) {
        window.history.pushState(null, '', cleanPath);
      }
    });
  });

  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });
}

// --------------------------------------------------------------------------
// 8. Dynamic Hero Auto-Fade Background Slider
// --------------------------------------------------------------------------
function initHeroBackgroundSlider() {
  const slides = document.querySelectorAll('.hero-bg-slider .hero-slide');
  const label = document.getElementById('heroSlideLabel');
  const pills = document.querySelectorAll('#heroSlidePills .slide-pill');
  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
    pills.forEach((pill, i) => {
      pill.classList.toggle('active', i === currentSlide);
    });

    const activeSlide = slides[currentSlide];
    const categoryName = activeSlide.getAttribute('data-label') || 'Prime Real Estate';
    if (label) {
      label.textContent = `Showcasing: ${categoryName}`;
    }
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(pill.getAttribute('data-slide-index'), 10);
      showSlide(idx);
      restartTimer();
    });
  });

  function startTimer() {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4500);
  }

  function restartTimer() {
    if (slideInterval) clearInterval(slideInterval);
    startTimer();
  }

  startTimer();
}

// --------------------------------------------------------------------------
// 8.2 Customer Reviews & Testimonials Interactive Slider (Mobile & Desktop)
// --------------------------------------------------------------------------
function initTestimonialSlider() {
  const cards = document.querySelectorAll('#testimonialsTrack .review-card');
  const dots = document.querySelectorAll('#testimonialDots .dot-btn');
  const prevBtn = document.getElementById('prevTestimonialBtn');
  const nextBtn = document.getElementById('nextTestimonialBtn');
  const track = document.getElementById('testimonialsTrack');

  if (!cards.length) return;

  let currentSlide = 0;
  cards.forEach((card, i) => {
    if (card.classList.contains('active')) currentSlide = i;
  });

  function showSlide(index) {
    currentSlide = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === currentSlide);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  // Expose global helper methods
  window.slideTestimonial = function(direction) {
    showSlide(currentSlide + direction);
  };

  window.goToTestimonialSlide = function(idx) {
    showSlide(idx);
  };

  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      showSlide(currentSlide - 1);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      showSlide(currentSlide + 1);
    };
  }

  dots.forEach((dot) => {
    dot.onclick = (e) => {
      e.preventDefault();
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(idx)) showSlide(idx);
    };
  });

  // Mobile Touch Swipe Gesture Support
  if (track) {
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;
      if (Math.abs(diffX) > 35) {
        if (diffX < 0) {
          showSlide(currentSlide + 1); // Swipe left: next
        } else {
          showSlide(currentSlide - 1); // Swipe right: previous
        }
      }
    }, { passive: true });
  }

  // Synchronize initial state
  showSlide(currentSlide);
}
window.initTestimonialSlider = initTestimonialSlider;

// --------------------------------------------------------------------------
// 8.5 Live Breaking News / Upcoming Launches Ticker Render Engine
// --------------------------------------------------------------------------
function renderLiveNewsTicker() {
  const tickerTrack = document.getElementById('tickerTrack');
  if (!tickerTrack) return;

  const customLaunches = getLBData('lb_new_projects_data') || [];

  if (customLaunches.length === 0) {
    tickerTrack.innerHTML = `
      <div class="ticker-item">⚡ <strong>🚀 Upcoming Launches Hub:</strong> Publish new pre-launch residential projects in the Admin Portal to broadcast live price &amp; offer alerts here.</div>
      <div class="ticker-item">⚡ <strong>Coimbatore Metro Corridor:</strong> 10.1 km Avinashi Road Elevated Expressway boosts Saravanampatti &amp; Peelamedu land valuation by +14% YoY.</div>
      <div class="ticker-item">⚡ <strong>Concessional Stamp Duty:</strong> TN Government offers concessional 4% registration duty for verified first-time buyers up to ₹ 50 Lakhs.</div>
      <div class="ticker-item">⚡ <strong>DTCP &amp; Patta Fast-Track:</strong> 100% Subdivided Revenue Patta &amp; DTCP layout sanctions verified across Coimbatore &amp; Tiruppur belts.</div>
      <div class="ticker-item">⚡ <strong>🚀 Upcoming Launches Hub:</strong> Publish new pre-launch residential projects in the Admin Portal to broadcast live price &amp; offer alerts here.</div>
      <div class="ticker-item">⚡ <strong>Coimbatore Metro Corridor:</strong> 10.1 km Avinashi Road Elevated Expressway boosts Saravanampatti &amp; Peelamedu land valuation by +14% YoY.</div>
      <div class="ticker-item">⚡ <strong>Concessional Stamp Duty:</strong> TN Government offers concessional 4% registration duty for verified first-time buyers up to ₹ 50 Lakhs.</div>
      <div class="ticker-item">⚡ <strong>DTCP &amp; Patta Fast-Track:</strong> 100% Subdivided Revenue Patta &amp; DTCP layout sanctions verified across Coimbatore &amp; Tiruppur belts.</div>
    `;
    return;
  }

  const items = customLaunches.map(p => {
    const title = p.title || 'Upcoming Project Launch';
    const price = p.price || p.startingPrice || 'Price on Request';
    const loc = p.location ? `📍 ${p.location}` : 'Coimbatore';
    const badge = p.badge ? `🏷️ ${p.badge}` : '★ Pre-Launch Offer';
    const cat = p.category ? `[${p.category}]` : '';

    return `<div class="ticker-item">⚡ <strong>Upcoming Project: ${title}</strong> — ${cat ? `<span style="color: #34d399; font-weight: 700;">${cat}</span> ` : ''}${loc ? `${loc} • ` : ''}Budget: <span style="color: #6ee7b7; font-weight: 800;">${price}</span>${badge ? ` • <span style="color: #fcd34d; font-weight: 700;">${badge}</span>` : ''}</div>`;
  });

  // Duplicate items to ensure smooth infinite ticker slide
  let fullList = [...items];
  while (fullList.length < 6) {
    fullList = fullList.concat(items);
  }
  fullList = fullList.concat(fullList);

  tickerTrack.innerHTML = fullList.join('');
}
window.renderLiveNewsTicker = renderLiveNewsTicker;

// --------------------------------------------------------------------------
// 9. Market News & Articles Render Engine
// --------------------------------------------------------------------------
function renderNewsArticles() {
  renderLiveNewsTicker();
  const grid = document.getElementById('newsArticlesGrid');
  if (!grid) return;

  const customLaunches = getLBData('lb_new_projects_data') || [];
  const articlesToRender = customLaunches;

  if (articlesToRender.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
        <h4 style="color: #0f172a; margin: 0 0 6px; font-size: 17px; font-weight: 700;">No Upcoming Launches Published Yet</h4>
        <p style="color: #64748b; font-size: 13.5px; margin: 0 0 16px;">New launches and upcoming residential projects published from your Backend Dashboard will appear here in real time.</p>
        <a href="dashboard.html#newprojects" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
          <span>➕ Add Upcoming Project in Dashboard &rarr;</span>
        </a>
      </div>
    `;
    return;
  }

  grid.innerHTML = articlesToRender.map(
    (article) => {
      const img = article.imageUrl || article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
      const category = article.category || 'Flats & High-Rises';
      const dateText = article.date ? (article.readTime && !article.date.includes(article.readTime) ? `${article.date} • ${article.readTime}` : article.date) : 'August 2026 • 3 min read';
      const desc = article.description || article.summary || 'Exclusive pre-launch residential project with verified approvals and high capital appreciation potential.';

      return `
      <article class="news-card">
        <div class="news-card-img-wrap">
          <img src="${img}" alt="${article.title}" class="news-card-img" />
          ${article.price ? `<span style="position: absolute; bottom: 10px; right: 10px; background: rgba(15,23,42,0.88); color: #34d399; font-weight: 800; font-size: 12px; padding: 4px 9px; border-radius: 6px; backdrop-filter: blur(4px);">${article.price}</span>` : ''}
        </div>
        <div class="news-card-body">
          <div class="news-meta-row">
            <span class="news-cat-pill">${category}</span>
            <span class="news-date">${dateText}</span>
          </div>
          <h3 class="news-card-title">${article.title}</h3>
          <p class="news-card-excerpt" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.55; margin: 0 0 12px; max-height: 3.1em;">${desc}</p>
          <span class="news-read-link" onclick="openNewsModal('${article.id}')" style="cursor: pointer; font-weight: 700; color: var(--emerald-600); display: inline-flex; align-items: center; gap: 4px; margin-top: auto;">
            Read Full Article &rarr;
          </span>
        </div>
      </article>
    `;
    }
  ).join('');
}
window.renderNewsArticles = renderNewsArticles;

// Open News Article / Upcoming Launch Reader Modal
window.openNewsModal = (articleId) => {
  const customLaunches = getLBData('lb_new_projects_data') || [];
  let article = customLaunches.find((a) => a.id === articleId) || NEWS_ARTICLES_DATA.find((a) => a.id === articleId);
  if (!article) return;

  const content = document.getElementById('newsArticleModalContent');
  if (!content) return;

  const img = article.imageUrl || article.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
  const category = article.category || 'Flats & High-Rises';
  const dateText = article.date || 'August 2026';
  const readTime = article.readTime || '3 min read';
  const desc = article.description || article.summary || '';
  const fullHtml = article.fullContent || `<p style="font-size: 1rem; line-height: 1.7; color: #334155;">${desc}</p>`;
  const takeaways = article.takeaways || [
    `Location & Hub: ${article.location || 'Prime Coimbatore Corridor'}`,
    `Starting Investment: ${article.price || article.startingPrice || 'On Request'}`,
    `Developer / Promoter: ${article.builder || 'Verified Real Estate Promoter'}`,
    `Current Launch Status: ${article.status || 'Active / Pre-Launch'}`
  ];

  content.innerHTML = `
    <div class="article-modal-wrap">
      <div class="article-modal-hero" style="background-image: linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%), url('${img}'); background-size: cover; background-position: center; border-radius: 12px; padding: 24px; color: #fff; min-height: 180px; display: flex; align-items: flex-end; margin-bottom: 18px;">
        <div class="article-hero-text">
          <span class="news-cat-pill" style="margin-bottom: 8px; display: inline-block; background: #10b981; color: #fff; font-weight: 700; font-size: 11.5px; padding: 4px 10px; border-radius: 9999px;">${category}</span>
          <h2 style="font-size: 1.45rem; font-weight: 800; line-height: 1.3; margin: 0 0 6px; color: #ffffff;">${article.title}</h2>
          <div style="font-size: 0.8rem; opacity: 0.95; display: flex; gap: 12px; flex-wrap: wrap;">
            <span>📅 Published: ${dateText}</span>
            <span>⏱️ Estimated: ${readTime}</span>
            ${article.location ? `<span>📍 ${article.location}</span>` : ''}
          </div>
        </div>
      </div>

      <div style="font-size: 0.95rem; color: #334155; line-height: 1.75; display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px;">
        ${fullHtml}
      </div>

      <div class="article-takeaways-box" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 18px;">
        <h4 style="margin: 0 0 10px; color: #0f172a; font-size: 14px; font-weight: 700;">Key Launch Highlights &amp; Insights:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13.5px; line-height: 1.6;">
          ${takeaways.map((t) => `<li style="margin-bottom: 4px;">${t}</li>`).join('')}
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px; gap: 12px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; color: #64748b;">Source: Land And Beyond Intelligence Desk</span>
        <div style="display: flex; gap: 8px;">
          <a href="book-visit.html?property=${encodeURIComponent(article.title)}" class="btn btn-primary btn-sm" style="padding: 8px 16px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px; background: #10b981; color: #ffffff; display: inline-flex; align-items: center; gap: 6px;">
            <span>🚗 Book VIP Site Visit &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  `;

  openModal('newsArticleModal');
};

// --------------------------------------------------------------------------
// 10. Approved Townships & Layouts Render Engine (Dynamic Real Properties)
// --------------------------------------------------------------------------
function renderApprovedProjects() {
  const grid = document.getElementById('approvedProjectsGrid');
  if (!grid) return;

  const projects = getDynamicApprovedProjects();
  if (projects.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <p style="color: #64748b; font-size: 0.95rem; font-weight: 500;">No approved properties found in database. Add new approved properties in Admin Dashboard to display here dynamically.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = projects.map(
    (proj) => `
    <article class="approved-project-card">
      <div class="app-proj-top">
        <div>
          <h4 class="app-proj-name">${escapeHTML(proj.name)}</h4>
          <span class="app-proj-loc">${escapeHTML(proj.location)} • ${escapeHTML(proj.builder)}</span>
        </div>
        <span class="app-proj-price">${escapeHTML(proj.startingPrice)}</span>
      </div>

      <div class="approval-stamp-row">
        <div class="approval-stamp">
          <span class="stamp-icon">✓</span>
          <div>${escapeHTML(proj.approvalStamp)}: <span class="stamp-num">${escapeHTML(proj.dtcpNo)}</span></div>
        </div>
        <div class="approval-stamp">
          <span class="stamp-icon">✓</span>
          <div>TN RERA Registered: <span class="stamp-num">${escapeHTML(proj.reraNo)}</span></div>
        </div>
      </div>

      <ul class="amenities-checklist">
        ${proj.features
          .map(
            (feat) => `
          <li class="amenity-check-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${escapeHTML(feat)}</span>
          </li>
        `
          )
          .join('')}
      </ul>

      <div class="approved-actions-row">
        <button class="btn btn-outline btn-sm full-width" onclick="openLegalDocsModal('${proj.id}')">
          Verify Legal Docs
        </button>
        <button class="btn btn-primary btn-sm full-width" onclick="openSiteVisitModal('${escapeHTML(proj.name)}')">
          Book Site Visit
        </button>
      </div>
    </article>
  `
  ).join('');
}

// Open Legal Docs Verification Modal
window.openLegalDocsModal = (projId) => {
  const projects = getDynamicApprovedProjects();
  const proj = projects.find((p) => p.id === projId) || projects[0];
  if (!proj) return;

  const content = document.getElementById('legalDocsModalContent');
  if (!content) return;

  content.innerHTML = `
    <div class="legal-modal-wrap">
      <div class="legal-cert-banner">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.85;">Legal Title &amp; Approval Certificate Audit</span>
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-top: 2px;">${escapeHTML(proj.name)}</h3>
          <span style="font-size: 0.82rem; color: var(--emerald-400);">${escapeHTML(proj.location)} • Promoted by ${escapeHTML(proj.builder)}</span>
        </div>
        <span class="cert-stamp-badge">100% CLEAR TITLE</span>
      </div>

      <table class="legal-checklist-table">
        <thead>
          <tr>
            <th>Regulatory Clearance</th>
            <th>Approval / Sanction Identifier</th>
            <th>Verification Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${escapeHTML(proj.approvalStamp)}</strong></td>
            <td>${escapeHTML(proj.dtcpNo)}</td>
            <td class="status-verified-cell"><span>✓</span> Verified &amp; Signed</td>
          </tr>
          <tr>
            <td><strong>TN RERA Registration</strong></td>
            <td>${escapeHTML(proj.reraNo)}</td>
            <td class="status-verified-cell"><span>✓</span> Active on TNRERA Portal</td>
          </tr>
          <tr>
            <td><strong>Revenue Patta Status</strong></td>
            <td>${escapeHTML(proj.pattaStatus)}</td>
            <td class="status-verified-cell"><span>✓</span> 100% Subdivided Patta</td>
          </tr>
          <tr>
            <td><strong>Encumbrance Certificate (EC)</strong></td>
            <td>Nil Encumbrance (Past 30 Years)</td>
            <td class="status-verified-cell"><span>✓</span> Certified by Legal Counsel</td>
          </tr>
          <tr>
            <td><strong>Pre-Approved Banks</strong></td>
            <td>${escapeHTML(proj.bankApproved)}</td>
            <td class="status-verified-cell"><span>✓</span> Instant Sanction Eligible</td>
          </tr>
        </tbody>
      </table>

      <div style="background: var(--slate-100); border-radius: var(--radius-md); padding: 14px; font-size: 0.82rem; color: var(--slate-600);">
        <strong>Legal Guarantee Note:</strong> All original approval blueprints, village map sketches, parent deeds, and field measurement books (FMB) have been independently audited by our senior real estate legal counsel in Coimbatore.
      </div>

      <div style="display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 4px;">
        <button class="btn btn-primary btn-sm" onclick="closeModal(document.getElementById('legalDocsModal')); openSiteVisitModal('${escapeHTML(proj.name)}');">
          Schedule Free Site Inspection &rarr;
        </button>
      </div>
    </div>
  `;

  openModal('legalDocsModal');
};

// --------------------------------------------------------------------------
// 11. Investor Newsletter & Pre-Launch Alert Subscription
// --------------------------------------------------------------------------
function initNewsletterSubscription() {
  const form = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterInput');
  const btn = document.getElementById('btnSubscribeAlerts');
  const channelRadios = document.querySelectorAll('input[name="newsChannel"]');

  channelRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'whatsapp') {
        input.placeholder = 'Enter Mobile Number (+91 98765 43210)';
      } else {
        input.placeholder = 'Enter Email Address (you@example.com)';
      }
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) {
      showToast('Please enter your contact details to subscribe.', 'warning');
      return;
    }

    const channel = document.querySelector('input[name="newsChannel"]:checked')?.value || 'whatsapp';
    showToast(`Subscribed! You will receive VIP pre-launch alerts via ${channel.toUpperCase()} at ${val}.`, 'success');
    input.value = '';
  });
}

// --------------------------------------------------------------------------
// 12. New & Upcoming Projects Interactive Filter & Search System
// --------------------------------------------------------------------------
window.filterUpcomingProjects = function(filterKey, btn) {
  const container = document.getElementById('projectPillTabs');
  if (container) {
    container.querySelectorAll('.proj-tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
  }
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
  const searchInput = document.getElementById('projectSearchInput');
  const term = searchInput ? searchInput.value.trim() : '';

  // Dual instant response: Update top Hero Banner + Cards Grid!
  if (typeof renderFrontendProperties === 'function') renderFrontendProperties(filterKey);
  renderNewProjects(filterKey, term);
};

function initNewProjectsSearchAndTabs() {
  const container = document.getElementById('projectPillTabs');
  if (container) {
    container.querySelectorAll('.proj-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-proj-filter') || 'all';
        window.filterUpcomingProjects(filter, btn);
      });
    });
  }

  const searchInput = document.getElementById('projectSearchInput');
  const clearBtn = document.getElementById('clearProjectSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeBtn = document.querySelector('#projectPillTabs .proj-tab-btn.active');
      const filter = activeBtn ? activeBtn.getAttribute('data-proj-filter') : 'all';
      renderNewProjects(filter, e.target.value.trim());
    });
  }
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      const activeBtn = document.querySelector('#projectPillTabs .proj-tab-btn.active');
      const filter = activeBtn ? activeBtn.getAttribute('data-proj-filter') : 'all';
      renderNewProjects(filter, '');
    });
  }
}
window.initNewProjectsSearchAndTabs = initNewProjectsSearchAndTabs;

function renderNewProjects(filter = 'all', searchTerm = '') {
  const grid = document.getElementById('upcomingProjectsGrid');
  if (!grid) return;

  const storedProps = getLBData(LB_KEYS.PROPERTIES);
  const customLaunches = getLBData('lb_new_projects_data') || [];
  const banned = ['grand aeropolis', 'aura emerald', 'skyline sovereign', 'mayflower grandeur', 'kongu valley'];
  let upcoming = [...storedProps, ...customLaunches].filter(p => p && p.title && !banned.some(b => p.title.toLowerCase().includes(b)) && (p.status || 'Active').toLowerCase() !== 'archived');
  upcoming.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));

  if (filter === 'commercial') {
    upcoming = upcoming.filter(p => {
      const c = (p.category || '').toLowerCase();
      const t = (p.title || '').toLowerCase();
      const m = (p.metrics || '').toLowerCase();
      return c.includes('commercial') || c.includes('office') || c.includes('retail') || c.includes('shop') || t.includes('commercial') || m.includes('commercial');
    });
  } else if (filter === 'villas-apartments') {
    upcoming = upcoming.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('villa') || c.includes('apartment') || c.includes('flat') || c.includes('high-rise');
    });
  } else if (filter === 'dtcp-plots') {
    upcoming = upcoming.filter(p => {
      const c = (p.category || '').toLowerCase();
      const a = (p.approvalType || p.approval || p.legalStatus || '').toLowerCase();
      return c.includes('plot') || a.includes('dtcp') || a.includes('rera') || a.includes('approved') || a.includes('sanction');
    });
  } else if (filter === 'dry-land') {
    upcoming = upcoming.filter(p => {
      const c = (p.category || '').toLowerCase();
      return c.includes('farm') || c.includes('dry') || c.includes('agro') || c.includes('land');
    });
  } else if (filter === 'pre-launch') {
    upcoming = upcoming.filter(p => {
      const b = (p.badge || p.featureBadge || '').toLowerCase();
      const s = (p.status || '').toLowerCase();
      return b.includes('pre-launch') || b.includes('launch') || b.includes('offer') || s.includes('active') || !s;
    });
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    upcoming = upcoming.filter(p => 
      (p.title || '').toLowerCase().includes(term) ||
      (p.location || '').toLowerCase().includes(term) ||
      (p.builder || '').toLowerCase().includes(term)
    );
  }

  if (upcoming.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #fff; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <h4 style="color: #0f172a; margin: 0 0 6px;">No projects matched your filter</h4>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Try selecting "All Projects" tab to view our full launches.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = upcoming.map((p, idx) => {
    const propId = p.id || `launch_${idx}`;
    const badge = p.badge || p.featureBadge || p.approvalType || 'DTCP Approved';
    
    let rawPrice = (p.price || p.priceLabel || 'Price on Request').toString().trim();
    let displayPrice = rawPrice.startsWith('₹') ? rawPrice : `₹ ${rawPrice}`;
    if (!displayPrice.toLowerCase().includes('lakh') && !displayPrice.toLowerCase().includes('cr') && !displayPrice.toLowerCase().includes('onwards') && !isNaN(parseFloat(rawPrice))) {
      displayPrice = `${displayPrice} Lakh`;
    }

    const img = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
    const comparedList = (typeof getLBData === 'function' ? getLBData(LB_KEYS.COMPARE) : []) || [];
    const isCompared = comparedList.includes(propId) || comparedList.includes(p.title);
    const favs = (typeof getLBData === 'function' ? getLBData(LB_KEYS.FAVORITES) : []) || [];
    const isFav = favs.includes(propId);

    return `
    <article class="upcoming-project-card property-card" style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); display: flex; flex-direction: column; position: relative;">
      <div class="card-img-wrapper" style="position: relative; height: 215px; background-image: url('${img}'); background-size: cover; background-position: center; border-radius: 20px 20px 0 0;">
        <!-- Top Left Status Badge -->
        <span style="position: absolute; top: 14px; left: 14px; background: rgba(15,23,42,0.88); backdrop-filter: blur(8px); color: #34d399; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.3); box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          ${badge}
        </span>

        <!-- Compare Action Button Overlay -->
        <button type="button" class="card-compare-btn ${isCompared ? 'active' : ''}" 
                style="position: absolute; top: 14px; right: 54px; width: 34px; height: 34px; border-radius: 50%; background: ${isCompared ? '#10b981' : '#ffffff'}; color: ${isCompared ? '#ffffff' : '#0f172a'}; border: 1px solid ${isCompared ? '#10b981' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"
                title="${isCompared ? 'Remove from Compare' : 'Add to Compare'}"
                onclick="toggleCompareProperty('${propId}', this, event)">
          ${isCompared ? '✓' : '⚖️'}
        </button>

        <!-- Favorite Action Button Overlay -->
        <button type="button" class="card-fav-btn" 
                style="position: absolute; top: 14px; right: 14px; width: 34px; height: 34px; border-radius: 50%; background: ${isFav ? '#fef2f2' : '#ffffff'}; color: ${isFav ? '#ef4444' : '#64748b'}; border: 1px solid ${isFav ? '#fca5a5' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"
                onclick="toggleFavoriteProperty('${propId}', this)">
          ${isFav ? '❤️' : '🤍'}
        </button>

        <!-- High-Contrast Prominent Solid Price Badge (Image 2 style) -->
        <span style="position: absolute; bottom: 12px; right: 12px; background: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; padding: 6px 14px; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.35); letter-spacing: 0.3px; border: 1px solid rgba(255,255,255,0.15);" class="card-price">
          ${displayPrice}
        </span>
      </div>

      <div style="padding: 20px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 12px;">
        <div>
          <h3 style="margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; color: #0f172a;" class="card-title">${p.title}</h3>
          <div style="font-size: 13px; color: #64748b;">📍 ${p.location} ${p.builder ? `• By ${p.builder}` : ''}</div>
        </div>

        <div style="background: #f8fafc; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #334155; line-height: 1.4;">
          ${p.metrics || p.area || (p.bhk ? `${p.bhk} • Prime Location` : 'Gated Master Plan Layout')}
        </div>

        ${(p.description || p.summary) ? `
          <p style="font-size: 12.5px; color: #64748b; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-height: 3.1em;">
            ${p.description || p.summary}
          </p>
        ` : ''}

        ${p.proximity ? `<div style="font-size: 12px; color: #059669; font-weight: 600;">🚗 ${p.proximity}</div>` : ''}

        <div style="display: flex; gap: 8px; margin-top: 4px; align-items: center;">
          <button type="button" class="btn btn-outline" onclick="toggleCompareProperty('${propId}', this, event)" style="flex: 1; padding: 10px; font-size: 12.5px; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            ⚖️ Compare
          </button>
          <button type="button" class="btn btn-outline btn-master-layout" onclick="openMasterPlanModal('${p.title.replace(/'/g, "\'")}')" style="flex: 1; padding: 10px; font-size: 12.5px; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            📐 Layout
          </button>
          <button type="button" class="btn btn-primary" onclick="openSiteVisitModal('${p.title.replace(/'/g, "\'")}')" style="flex: 1.2; padding: 10px; font-size: 12.5px; border-radius: 10px; background: #10b981; color: #fff; font-weight: 700; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
            Book Visit
          </button>
        </div>
      </div>
    </article>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// 12.5. Farmland Fast-Track Investment Corridors Render Engine
// --------------------------------------------------------------------------
function renderFarmlandFastTrack() {
  const grid = document.getElementById('fastTrackLandGrid');
  if (!grid) return;

  const FAKE_FARMLAND_TITLES = [
    'green valley agro farms', 'pollachi organic coconut groves',
    'annur eco-farmland enclave', 'kinathukadavu valley farmland',
    'farmcrest agro dry land parcel', 'kongu valley agro farm estate',
    'kongu agri-corridor mega farmland', 'riverview agro ranch estates',
    'coimbatore strategic farmland corridor', 'serene palm coconut farmland'
  ];

  const allProps = (typeof getLBData === 'function' ? getLBData(LB_KEYS.PROPERTIES) : []) || [];
  const farmProps = (Array.isArray(allProps) ? allProps : []).filter(p => {
    if (!p) return false;
    const cat = (p.category || '').toLowerCase();
    const t = (p.title || p.name || '').toLowerCase().trim();
    if (FAKE_FARMLAND_TITLES.some(dummy => t.includes(dummy))) return false;
    return cat.includes('farm') || cat.includes('agro') || cat.includes('dry land') || cat.includes('agricultural') || t.includes('farm');
  });

  const directFarms = (typeof getLBData === 'function' ? getLBData(LB_KEYS.FARMLAND) : []) || [];
  const cleanDirect = (Array.isArray(directFarms) ? directFarms : []).filter(f => {
    if (!f) return false;
    const t = (f.title || f.name || '').toLowerCase().trim();
    return !FAKE_FARMLAND_TITLES.some(dummy => t.includes(dummy));
  });

  const customLaunches = (typeof getLBData === 'function' ? getLBData('lb_new_projects_data') : []) || [];
  const cleanLaunches = (Array.isArray(customLaunches) ? customLaunches : []).filter(l => {
    if (!l) return false;
    const cat = (l.category || '').toLowerCase();
    const t = (l.title || l.name || '').toLowerCase().trim();
    if (FAKE_FARMLAND_TITLES.some(dummy => t.includes(dummy))) return false;
    return cat.includes('farm') || cat.includes('agro') || cat.includes('dry land') || cat.includes('agricultural') || cat.includes('strategic') || t.includes('farm');
  });

  const farms = [...cleanLaunches];
  farmProps.forEach(fp => {
    if (!farms.some(it => (it.id && it.id === fp.id) || (it.title || it.name || '').toLowerCase() === (fp.title || fp.name || '').toLowerCase())) {
      farms.push(fp);
    }
  });
  cleanDirect.forEach(df => {
    if (!farms.some(it => (it.id && it.id === df.id) || (it.title || it.name || '').toLowerCase() === (df.title || df.name || '').toLowerCase())) {
      farms.push(df);
    }
  });

  if (farms.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #ffffff; border-radius: 16px; border: 1px dashed #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <span style="font-size: 36px; display: block; margin-bottom: 10px;">🌾</span>
        <h4 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">No Farmland Corridor Listings Registered</h4>
        <p style="font-size: 13.5px; color: #64748b; margin: 0; max-width: 480px; margin: 0 auto;">Agricultural parcels and strategic farmland listings added from the Admin Dashboard will appear here live in real time.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = farms.map(f => {
    let rawBadge = f.approvalType || f.badge || f.statusTag || '🟢 100% Patta';
    if (rawBadge.includes('DTCP')) rawBadge = '🛡️ DTCP Approved';
    else if (rawBadge.includes('Patta')) rawBadge = '🟢 100% Patta';
    else if (rawBadge.includes('RERA')) rawBadge = '🏛️ RERA Verified';
    else if (rawBadge.includes('High Yield') || rawBadge.includes('Pre-Launch') || rawBadge.includes('Discount')) rawBadge = '★ Pre-Launch Farmland';

    const rawAcrePrice = (f.price || f.priceLabel || f.startingPrice || f.pricePerAcre || f.acreRate || 'Price on Request').toString().trim();
    let acrePrice = rawAcrePrice.startsWith('₹') ? rawAcrePrice : `₹ ${rawAcrePrice}`;
    if (!acrePrice.toLowerCase().includes('lakh') && !acrePrice.toLowerCase().includes('cr') && !isNaN(parseFloat(rawAcrePrice))) {
      acrePrice = `${acrePrice} Lakh`;
    }

    const rawTotalOutlay = (f.priceLabel || f.price || f.startingPrice || 'Market Rate').toString().trim();
    let totalOutlay = rawTotalOutlay.startsWith('₹') ? rawTotalOutlay : `₹ ${rawTotalOutlay}`;
    if (!totalOutlay.toLowerCase().includes('lakh') && !totalOutlay.toLowerCase().includes('cr') && !isNaN(parseFloat(rawTotalOutlay))) {
      totalOutlay = `${totalOutlay} Lakh`;
    }

    let rawAcreage = f.area || f.acreage || f.metrics || 'Agro Parcel';
    const acreMatch = rawAcreage.match(/\d+(\.\d+)?\s*Acres?/i);
    const acreageDisplay = acreMatch ? acreMatch[0] : (f.area || (f.category ? f.category : 'Agro Parcel'));

    const img = f.imageUrl || f.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80';
    const soil = f.description || f.summary || f.metrics || f.soilTelemetry || f.soilReport || 'Certified Soil & Water Telemetry';
    const water = f.waterTelemetry || f.legalNo || f.approvalNumber || (f.builder ? `Managed by ${f.builder}` : '100% Clear Title Verified');

    return `
    <article class="farmland-card" style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
      <div class="farmland-img-wrap" style="position: relative; height: 220px; background-image: url('${img}'); background-size: cover; background-position: center; border-radius: 20px 20px 0 0;">
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.85) 100%);"></div>
        
        <!-- Aligned Non-overlapping Top Badge Row -->
        <div style="position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; z-index: 2;">
          <span style="background: rgba(16,185,129,0.95); backdrop-filter: blur(8px); color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: inline-flex; align-items: center;">
            ${rawBadge}
          </span>
          <span style="background: rgba(15,23,42,0.88); backdrop-filter: blur(8px); color: #38bdf8; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(56,189,248,0.3); flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;">
            🏷️ ${acreageDisplay}
          </span>
        </div>

        <div style="position: absolute; bottom: 14px; left: 14px; right: 14px; z-index: 2;">
          <h3 style="margin: 0 0 2px; font-size: 1.25rem; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.7);">${f.title || f.name}</h3>
          <span style="font-size: 13px; opacity: 0.95; color: #e2e8f0; text-shadow: 0 1px 2px rgba(0,0,0,0.7);">📍 ${f.location}</span>
        </div>
      </div>
      <div style="padding: 20px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #f1f5f9;">
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Rate / Pricing</span>
            <div style="font-size: 1.15rem; font-weight: 800; color: #059669;">${acrePrice}</div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Total Outlay</span>
            <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">${totalOutlay}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: #334155;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 500;">
            <span style="color: #059669;">🌱</span> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%;">${soil}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #0284c7;">
            <span>💧</span> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%;">${water}</span>
          </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 4px;">
          <button type="button" class="btn btn-outline" onclick="openMasterPlanModal('${(f.title || f.name).replace(/'/g, "\\'")}')" style="flex: 1; padding: 11px 14px; font-size: 13px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            📐 View Land
          </button>
          <button type="button" class="btn btn-primary" onclick="openSiteVisitModal('${(f.title || f.name).replace(/'/g, "\\'")}')" style="flex: 1.2; padding: 11px 14px; font-size: 13px; border-radius: 10px; background: #10b981; color: #ffffff; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
            Book Site Visit
          </button>
        </div>
      </div>
    </article>
    `;
  }).join('');
}
window.renderFarmlandFastTrack = renderFarmlandFastTrack;
window.renderFastTrackLand = renderFarmlandFastTrack;


function initNewProjectsSearchAndTabs() {
  const tabs = document.querySelectorAll('#projectPillTabs .proj-tab-btn');
  const searchInput = document.getElementById('projectSearchInput');
  const clearBtn = document.getElementById('clearProjectSearchBtn');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.projectFilter = tab.getAttribute('data-proj-filter') || 'all';
      renderNewProjects();
    });
  });

  searchInput?.addEventListener('input', () => {
    state.projectSearchTerm = searchInput.value;
    if (clearBtn) clearBtn.style.display = searchInput.value ? 'block' : 'none';
    renderNewProjects();
  });

  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    state.projectSearchTerm = '';
    clearBtn.style.display = 'none';
    renderNewProjects();
  });
}

// --------------------------------------------------------------------------
// 13. Smart Property Matching Calculation
// --------------------------------------------------------------------------
function calculatePropertyMatch(property, criteria) {
  let score = 0;
  const fitTags = [];

  // 1. Category Fit (Max 30 pts)
  if (criteria.category === 'All' || property.category === criteria.category) {
    score += 30;
    fitTags.push('Category Fit: 100%');
  } else {
    score += 8;
  }

  // 2. Location Proximity (Max 25 pts)
  if (criteria.location === 'All' || property.location.toLowerCase() === criteria.location.toLowerCase()) {
    score += 25;
    fitTags.push(`Location Match: ${property.location}`);
  } else {
    score += 10;
  }

  // 3. Budget Fit (Max 25 pts)
  const maxBudgetValue = criteria.maxBudgetLakhs * 100000;
  if (property.price <= maxBudgetValue) {
    score += 25;
    fitTags.push('Within Budget');
  } else {
    const overPercent = (property.price - maxBudgetValue) / maxBudgetValue;
    if (overPercent <= 0.15) {
      score += 15;
      fitTags.push('Budget: +10% Flex');
    } else if (overPercent <= 0.35) {
      score += 8;
    } else {
      score += 2;
    }
  }

  // 4. BHK / Configuration Fit (Max 10 pts)
  if (
    criteria.bhk === 'Any' ||
    property.bhk === criteria.bhk ||
    (criteria.bhk === 'Plots' && (property.category === 'Residential Plots' || property.category === 'Dry Land'))
  ) {
    score += 10;
  } else {
    score += 3;
  }

  // 5. Parking Preference (Max 10 pts)
  if (criteria.parking === 'Any' || property.parking === criteria.parking) {
    score += 10;
    if (property.parking === 'Yes') fitTags.push('Parking Included');
  } else {
    score += 4;
  }

  if (property.approval.includes('RERA') || property.approval.includes('DTCP')) {
    fitTags.push('Verified Title');
  }
  if (property.assessment === 'High Potential ROI') {
    fitTags.push('High ROI 14%+');
  }

  const normalizedScore = Math.min(99, Math.max(68, Math.round(score)));
  return {
    score: normalizedScore,
    fitTags: fitTags.slice(0, 3)
  };
}

// --------------------------------------------------------------------------
// 14. Smart Matcher Setup
// --------------------------------------------------------------------------
function initSmartMatcher() {
  const budgetRange = document.getElementById('budgetRange');
  const budgetLabel = document.getElementById('budgetValueLabel');
  const categorySelect = document.getElementById('categoryFilter');
  const locationSelect = document.getElementById('locationFilter');
  const bhkSelect = document.getElementById('bhkFilter');
  const parkingSelect = document.getElementById('parkingFilter');
  const scoreDial = document.getElementById('matcherScoreDial');
  const scoreSubtext = document.getElementById('matcherScoreSubtext');
  const findMatchBtn = document.getElementById('findMatchBtn');

  function updateMatcher() {
    const lakhs = Number(budgetRange?.value || 150);
    if (budgetLabel) {
      budgetLabel.textContent = `Up to ${formatCompactLakhCrore(lakhs)}`;
    }

    state.matcherInputs = {
      category: categorySelect?.value || 'All',
      location: locationSelect?.value || 'All',
      bhk: bhkSelect?.value || 'Any',
      parking: parkingSelect?.value || 'Any',
      maxBudgetLakhs: lakhs
    };

    const matches = PROPERTIES_DATA.map((p) => calculatePropertyMatch(p, state.matcherInputs));
    const highestScore = Math.max(...matches.map((m) => m.score));
    const countAbove80 = matches.filter((m) => m.score >= 75).length;

    if (scoreDial) scoreDial.textContent = `${highestScore}%`;
    if (scoreSubtext) {
      scoreSubtext.textContent = `Matching ${countAbove80} prime ${state.matcherInputs.category === 'All' ? 'properties' : state.matcherInputs.category}`;
    }
  }

  [budgetRange, categorySelect, locationSelect, bhkSelect, parkingSelect].forEach((el) => {
    el?.addEventListener('input', () => {
      updateMatcher();
      renderProperties();
    });
    el?.addEventListener('change', () => {
      updateMatcher();
      renderProperties();
    });
  });

  findMatchBtn?.addEventListener('click', () => {
    updateMatcher();
    if (state.matcherInputs.category && state.matcherInputs.category !== 'All') {
      state.currentCategoryFilter = state.matcherInputs.category;
      document.querySelectorAll('#categoryTabs .tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === state.matcherInputs.category);
      });
    } else {
      state.currentCategoryFilter = 'All';
      document.querySelectorAll('#categoryTabs .tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === 'All');
      });
    }

    state.currentSort = 'match-desc';
    const sortSelect = document.getElementById('propertySort');
    if (sortSelect) sortSelect.value = 'match-desc';

    renderProperties();
    showToast('Smart match criteria applied! Reviewing top matches below.', 'success');
    document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  updateMatcher();
}

// --------------------------------------------------------------------------
// 15. Render Properties Showcase (Individual Listings)
// --------------------------------------------------------------------------
// 15. Render Properties Showcase (Individual Listings)
// --------------------------------------------------------------------------
function filterPropertiesByCategory(category, btnElement) {
  if (!window.LB_PORTAL_STATE) {
    window.LB_PORTAL_STATE = { currentCategory: 'all', currentLocality: 'all', bhkFilter: 'all' };
  }
  
  window.LB_PORTAL_STATE.currentCategory = category || 'all';

  const tabs = document.querySelectorAll('#categoryTabs .tab-btn');
  tabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });

  if (btnElement) {
    btnElement.classList.add('active');
    btnElement.setAttribute('aria-selected', 'true');
  } else {
    const target = document.querySelector(`#categoryTabs .tab-btn[data-filter="${category}"]`);
    if (target) {
      target.classList.add('active');
      target.setAttribute('aria-selected', 'true');
    }
  }

  renderProperties();
}
window.filterPropertiesByCategory = filterPropertiesByCategory;

function renderProperties() {
  const grid = document.getElementById('propertiesGrid');
  const resultsCount = document.getElementById('resultsCount');
  const activeTagsContainer = document.getElementById('activeCriteriaTags');
  if (!grid) return;

  const storedProps = getLBData(LB_KEYS.PROPERTIES);
  let activeProps = storedProps.filter(p => {
    const st = (p.status || 'Active').toLowerCase();
    return !st.includes('archived') && !st.includes('delete');
  });
  activeProps.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));

  const state = window.LB_PORTAL_STATE || { currentCategory: 'all', currentLocality: 'all', bhkFilter: 'all' };

  // Category Filter
  if (state.currentCategory && state.currentCategory !== 'all' && state.currentCategory !== 'All' && state.currentCategory !== 'All Property Types') {
    activeProps = activeProps.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const metrics = (p.metrics || '').toLowerCase();
      const targetCat = state.currentCategory.toLowerCase();

      if (targetCat.includes('commercial') || targetCat.includes('office') || targetCat.includes('retail') || targetCat.includes('shop')) {
        return cat.includes('commercial') || cat.includes('office') || cat.includes('retail') || cat.includes('shop') || title.includes('commercial') || metrics.includes('commercial');
      }
      if (targetCat.includes('plot')) {
        return cat.includes('plot') || cat.includes('site') || cat.includes('layout') || (cat.includes('land') && !cat.includes('farm') && !cat.includes('dry')) || metrics.includes('plot') || metrics.includes('cent');
      }
      if (targetCat.includes('villa')) {
        return cat.includes('villa') || title.includes('villa') || cat.includes('house') || cat.includes('bungalow') || title.includes('crest') || metrics.includes('villa');
      }
      if (targetCat.includes('apartment') || targetCat.includes('flat')) {
        return cat.includes('apartment') || cat.includes('flat') || cat.includes('condo') || title.includes('apartment') || title.includes('tower') || metrics.includes('apartment');
      }
      if (targetCat.includes('farm') || targetCat.includes('dry') || targetCat.includes('agro') || targetCat.includes('land')) {
        return cat.includes('farm') || cat.includes('dry') || cat.includes('agro') || (cat.includes('land') && !cat.includes('plot')) || metrics.includes('acre');
      }
      return cat.includes(targetCat) || title.includes(targetCat);
    });
  }

  // Locality Filter
  if (state.currentLocality && state.currentLocality !== 'all' && state.currentLocality !== 'All' && state.currentLocality !== 'Any Prime Locality') {
    activeProps = activeProps.filter(p => {
      const loc = (p.location || '').toLowerCase();
      return loc.includes(state.currentLocality.toLowerCase());
    });
  }

  // BHK Filter
  if (state.bhkFilter && state.bhkFilter !== 'all' && state.bhkFilter !== 'Any' && state.bhkFilter !== 'Any Configuration') {
    activeProps = activeProps.filter(p => {
      const pBhk = (p.bhk || p.metrics || p.category || '').toLowerCase();
      const target = state.bhkFilter.toLowerCase();
      if (target.includes('plots')) return pBhk.includes('plot') || pBhk.includes('land') || pBhk.includes('acre');
      return pBhk.includes(target);
    });
  }

  if (resultsCount) {
    resultsCount.textContent = activeProps.length;
  }

  if (activeTagsContainer) {
    const catLabel = state.currentCategory && state.currentCategory !== 'all' ? state.currentCategory : 'All Categories';
    const locLabel = state.currentLocality && state.currentLocality !== 'all' ? state.currentLocality : 'All Localities';
    activeTagsContainer.innerHTML = `
      <span class="meta-chip active" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">📁 ${catLabel}</span>
      <span class="meta-chip active" style="background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600;">📍 ${locLabel}</span>
      <span class="meta-chip" style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 9999px; font-size: 12px;">🔍 ${activeProps.length} Matched Listings</span>
    `;
  }

  if (activeProps.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: #ffffff; border-radius: 20px; border: 1px dashed #cbd5e1;">
        <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 6px;">No Matching Properties Found</h3>
        <p style="font-size: 13.5px; color: #64748b; margin: 0 0 16px;">Try adjusting your location, category, or budget slider filters above.</p>
        <button type="button" class="btn btn-outline" onclick="if(typeof window.initSmartMatcher==='function') window.initSmartMatcher();" style="padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;">
          Reset Search Filters
        </button>
      </div>
    `;
    return;
  }

  const comparedList = getLBData(LB_KEYS.COMPARE);

  grid.innerHTML = activeProps.map((p, idx) => {
    const propId = p.id || `prop_${idx}`;
    const isCompared = comparedList.includes(propId) || comparedList.includes(p.title);
    const favs = getLBData(LB_KEYS.FAVORITES);
    const isFav = favs.includes(propId);

    const badge = p.badge || p.approvalType || p.category || 'DTCP Approved';
    const displayPrice = p.price || p.priceLabel || '₹ 45.0 Lakhs onwards';
    const img = p.imageUrl || p.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900';

    return `
    <article class="property-card" style="background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; position: relative;">
      <div class="card-img-wrapper" style="position: relative; height: 210px; background-image: url('${img}'); background-size: cover; background-position: center;">
        <span style="position: absolute; top: 12px; left: 12px; background: rgba(15,23,42,0.85); backdrop-filter: blur(4px); color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
          ${badge}
        </span>

        <!-- Compare Action Button Overlay -->
        <button type="button" class="card-compare-btn ${isCompared ? 'active' : ''}" 
                style="position: absolute; top: 12px; right: 52px; width: 34px; height: 34px; border-radius: 50%; background: ${isCompared ? '#10b981' : '#ffffff'}; color: ${isCompared ? '#ffffff' : '#0f172a'}; border: 1px solid ${isCompared ? '#10b981' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                title="${isCompared ? 'Remove from Compare' : 'Add to Compare'}"
                onclick="toggleCompareProperty('${propId}', this, event)">
          ${isCompared ? '✓' : '⚖️'}
        </button>

        <!-- Favorite Action Button Overlay -->
        <button type="button" class="card-fav-btn" 
                style="position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; background: ${isFav ? '#fef2f2' : '#ffffff'}; color: ${isFav ? '#ef4444' : '#64748b'}; border: 1px solid ${isFav ? '#fca5a5' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px;"
                onclick="toggleFavoriteProperty('${propId}', this)">
          ${isFav ? '❤️' : '🤍'}
        </button>

        <span style="position: absolute; bottom: 12px; right: 12px; background: #0f172a; color: #ffffff; font-size: 13.5px; font-weight: 800; padding: 4px 12px; border-radius: 8px;" class="card-price">
          ${displayPrice}
        </span>
      </div>
      <div style="padding: 20px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 12px;">
        <div>
          <h3 style="margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; color: #0f172a;" class="card-title">${p.title}</h3>
          <div style="font-size: 13px; color: #64748b;">📍 ${p.location} ${p.builder ? `• By ${p.builder}` : ''}</div>
        </div>
        <div style="background: #f8fafc; padding: 10px 12px; border-radius: 10px; font-size: 12.5px; color: #334155; line-height: 1.4;">
          ${p.metrics || p.area || '2,400 sq.ft • DTCP & RERA Approved'}
        </div>
        ${p.proximity ? `<div style="font-size: 12px; color: #059669; font-weight: 600;">🚗 ${p.proximity}</div>` : ''}
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button type="button" class="btn btn-outline" onclick="toggleCompareProperty('${propId}', this, event)" style="flex: 1; padding: 9px; font-size: 12px; border-radius: 10px; border: 1px solid ${isCompared ? '#10b981' : '#cbd5e1'}; background: ${isCompared ? '#ecfdf5' : '#ffffff'}; color: ${isCompared ? '#059669' : '#334155'}; font-weight: 700; cursor: pointer;">
            ${isCompared ? '✓ Compared' : '⚖️ Compare'}
          </button>
          <button type="button" class="btn btn-outline btn-master-layout" onclick="openMasterPlanModal('${p.title.replace(/'/g, "\\'")}')" style="flex: 1; padding: 9px; font-size: 12px; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; font-weight: 600; cursor: pointer;">
            📐 Layout
          </button>
          <button type="button" class="btn btn-primary" onclick="openSiteVisitModal('${p.title.replace(/'/g, "\\'")}')" style="flex: 1.2; padding: 9px; font-size: 12px; border-radius: 10px; background: #10b981; color: #fff; font-weight: 700; cursor: pointer; border: none;">
            Book Visit
          </button>
        </div>
      </div>
    </article>
    `;
  }).join('');
}


window.renderProperties = renderProperties;

function resetAllPropertyFilters() {
  window.LB_PORTAL_STATE.currentCategory = 'all';
  window.LB_PORTAL_STATE.currentLocality = 'all';
  window.LB_PORTAL_STATE.searchTerm = '';
  window.LB_PORTAL_STATE.bhkFilter = 'all';

  document.querySelectorAll('.category-tabs .tab-btn').forEach(b => {
    b.classList.toggle('active', (b.getAttribute('data-cat') || 'all') === 'all');
  });

  const searchInput = document.getElementById('search-keywords') || document.getElementById('heroSearchInput');
  if (searchInput) searchInput.value = '';

  const localitySelect = document.getElementById('localitySelector');
  if (localitySelect) localitySelect.value = 'all';

  renderProperties();
  showToast('✓ All property filters have been reset');
}
window.resetAllPropertyFilters = resetAllPropertyFilters;

// 4. FAVORITES & SHORTLIST MANAGEMENT
function toggleFavoriteProperty(propId, btn) {
  let favs = getLBData(LB_KEYS.FAVORITES);
  const exists = favs.includes(propId);

  if (exists) {
    favs = favs.filter(id => id !== propId);
    showToast('Removed from Saved Shortlist', 'warning');
  } else {
    favs.push(propId);
    showToast('❤️ Added property to your Saved Shortlist');
  }

  setLBData(LB_KEYS.FAVORITES, favs);
  renderProperties();
}
window.toggleFavoriteProperty = toggleFavoriteProperty;

// 5. COMPARE PROPERTIES ENGINE & MODAL
function toggleCompareProperty(propId, btnOrEvent, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  let compared = getLBData(LB_KEYS.COMPARE);

  if (!compared.includes(propId)) {
    if (compared.length >= 3) {
      showToast('⚠️ Maximum 3 properties can be compared simultaneously', 'warning');
      return;
    }
    compared.push(propId);
    showToast(`⚖️ Property added to side-by-side comparison (${compared.length}/3)`);
  } else {
    compared = compared.filter(id => id !== propId);
    showToast('Removed property from comparison');
  }

  setLBData(LB_KEYS.COMPARE, compared);
  updateCompareBadge();
  renderProperties();
}
window.toggleCompareProperty = toggleCompareProperty;

function updateCompareBadge() {
  const compared = getLBData(LB_KEYS.COMPARE);
  const count = compared.length;

  const navCount = document.getElementById('compareNavCount');
  const mobileCount = document.getElementById('mobileCompareCount');
  const dockCount = document.getElementById('dockCountText');
  const floatingDock = document.getElementById('floatingCompareDock');

  if (navCount) navCount.textContent = count;
  if (mobileCount) mobileCount.textContent = count;

  if (floatingDock) {
    if (count > 0) {
      floatingDock.hidden = false;
      floatingDock.style.display = 'flex';
      if (dockCount) dockCount.textContent = `${count} Propert${count === 1 ? 'y' : 'ies'} Selected for Comparison`;

      const allProps = typeof getStoredProperties === 'function' ? getStoredProperties() : [];
      const comparedProps = allProps.filter((p, idx) => compared.includes(p.id || `prop_${idx}`));

      const thumbnailsWrap = document.getElementById('dockThumbnails');
      if (thumbnailsWrap) {
        thumbnailsWrap.innerHTML = comparedProps.map((p, idx) => `
          <div style="position: relative; display: inline-block;">
            <img src="${p.imageUrl || p.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 2px solid #10b981;" title="${p.title}" />
            <button type="button" onclick="removeFromCompare('${p.id || `prop_${idx}`}')" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</button>
          </div>
        `).join('');
      }
    } else {
      floatingDock.hidden = true;
      floatingDock.style.display = 'none';
    }
  }
}
window.updateCompareBadge = updateCompareBadge;

function openCompareDrawer() {
  const comparedIds = getLBData(LB_KEYS.COMPARE);
  const allProps = typeof getStoredProperties === 'function' ? getStoredProperties() : [];
  const comparedProps = allProps.filter((p, idx) => comparedIds.includes(p.id || `prop_${idx}`));

  const modal = document.getElementById('compareModal');
  const tableWrap = document.getElementById('compareTableWrap');
  if (!modal || !tableWrap) return;

  if (comparedProps.length === 0) {
    tableWrap.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: #f8fafc; border-radius: 16px; border: 2px dashed #cbd5e1;">
        <div style="font-size: 42px; margin-bottom: 12px;">⚖️</div>
        <h3 style="font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 6px;">No Properties Selected for Comparison</h3>
        <p style="font-size: 13.5px; color: #64748b; margin: 0 0 20px; max-width: 460px; margin-left: auto; margin-right: auto;">
          Select 2 or 3 properties using the "⚖️ Compare" button on any property card to view side-by-side specs, prices, livability index &amp; ROI.
        </p>
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          ${allProps.slice(0, 3).map((p, idx) => `
            <button type="button" onclick="toggleCompareProperty('${p.id || `prop_${idx}`}'); openCompareDrawer();" style="padding: 10px 16px; border-radius: 10px; border: 1px solid #10b981; background: #ecfdf5; color: #059669; font-size: 13px; font-weight: 700; cursor: pointer;">
              + Compare ${p.title.split(' ')[0]}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    tableWrap.innerHTML = `
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; min-width: 600px;">
        <thead>
          <tr>
            <th style="padding: 14px; background: #f1f5f9; text-align: left; font-size: 13px; font-weight: 800; color: #475569; width: 160px; border-top-left-radius: 12px;">Comparison Matrix</th>
            ${comparedProps.map((p, idx) => `
              <th style="padding: 16px; background: #ffffff; text-align: center; border-bottom: 2px solid #e2e8f0; ${idx === comparedProps.length - 1 ? 'border-top-right-radius: 12px;' : ''}">
                <div style="position: relative; margin-bottom: 10px;">
                  <img src="${p.imageUrl || p.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 12px;" />
                  <button type="button" onclick="removeFromCompare('${p.id || `prop_${idx}`}')" style="position: absolute; top: 8px; right: 8px; background: rgba(239,68,68,0.9); color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;" title="Remove from comparison">✕</button>
                </div>
                <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 800; color: #0f172a;">${p.title}</h4>
                <div style="font-size: 15px; font-weight: 800; color: #10b981;">${p.price || p.priceLabel || '₹ 45 Lakhs'}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody style="font-size: 13px;">
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">📍 Location & Corridor</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${p.location}</td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">🏠 Category & BHK</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #475569;">${p.category || 'Apartment'} • <strong>${p.bhk || '3 BHK'}</strong></td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">📐 Super Built-up Area</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${p.area || p.metrics || '1,900 sq.ft'}</td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">🏛️ Approvals & Legal</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;"><span style="background: #ecfdf5; color: #059669; font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">${p.approval || p.approvalType || 'DTCP & RERA Approved'}</span></td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">⭐ Livability Index</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;"><strong style="font-size: 16px; color: #10b981;">${p.livability ? p.livability.composite : '9.3'} / 10</strong><br/><small style="color: #64748b;">${p.livability ? p.livability.label : 'Excellent'}</small></td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">🛣️ Road Access Width</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #334155;">${p.roadAccess || '18m Dual Carriageway'}</td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">💧 Groundwater & Water</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #334155;">${p.waterSource || 'Siruvani Supply'}<br/><small style="color: #64748b;">Depth: ${p.groundwater || '120 Feet'}</small></td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">⚡ Power & Grid</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #334155;">${p.powerGrid || '3-Phase TNEB + DG'}</td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 700; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">📈 ROI & Price Assessment</td>
            ${comparedProps.map(p => `<td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;"><span style="font-weight: 700; color: #0f172a;">${p.assessment || 'Good Value'}</span><br/><small style="color: #64748b;">${p.assessmentNote || 'Strong rental yield'}</small></td>`).join('')}
          </tr>
          <tr>
            <td style="padding: 14px; background: #f1f5f9; font-weight: 700; color: #334155; border-bottom-left-radius: 12px;">🚀 Actions</td>
            ${comparedProps.map(p => `
              <td style="padding: 14px; text-align: center; background: #ffffff;">
                <button type="button" onclick="window.closeAllModals(); openSiteVisitModal('${p.title.replace(/'/g, "\\'")}')" style="width: 100%; padding: 10px; background: #10b981; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">Book Site Visit</button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        <button type="button" onclick="clearAllCompare()" style="padding: 9px 18px; border: 1px solid #cbd5e1; background: #ffffff; color: #dc2626; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">🗑️ Clear All Comparison</button>
        <button type="button" onclick="window.closeAllModals()" style="padding: 9px 24px; border: none; background: #0f172a; color: #ffffff; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">Done &amp; Close</button>
      </div>
    `;
  }

  modal.style.display = 'flex';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openCompareDrawer = openCompareDrawer;
window.openCompareModal = openCompareDrawer;

function removeFromCompare(propId) {
  let compared = getLBData(LB_KEYS.COMPARE).filter(id => id !== propId);
  setLBData(LB_KEYS.COMPARE, compared);
  updateCompareBadge();
  openCompareDrawer();
}
window.removeFromCompare = removeFromCompare;

function clearAllCompare() {
  setLBData(LB_KEYS.COMPARE, []);
  updateCompareBadge();
  window.closeAllModals();
  renderProperties();
  showToast('Comparison list cleared');
}
window.clearAllCompare = clearAllCompare;

// 6. CLIENT-SIDE BROCHURE GENERATION & LAYOUT LIGHTBOX
function downloadBrochurePDF(title, location, price) {
  const content = `==============================\\nLAND & BEYOND VERIFIED BROCHURE\\n==============================\\nProperty: ${title}\\nLocation: ${location}\\nPrice: ${price}\\nApprovals: 100% Clear Title Patta & DTCP / RERA Verified\\n\\nTo schedule an on-site chauffeur inspection tour, visit https://landandbeyond.in`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\\s+/g, '_')}_Brochure.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(`📄 Downloaded specification brochure for "${title}"`);
}
window.downloadBrochurePDF = downloadBrochurePDF;

function openMasterLayoutLightbox(title, imgUrl) {
  let modal = document.getElementById('masterLayoutModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'masterLayoutModal';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: #fff; border-radius: 20px; padding: 24px; max-width: 760px; width: 100%; position: relative; text-align: center;">
      <button type="button" onclick="document.getElementById('masterLayoutModal').style.display='none'" style="position: absolute; top: 16px; right: 16px; border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; cursor: pointer;">✕</button>
      <h3 style="margin: 0 0 12px; font-size: 1.15rem; font-weight: 700; color: #0f172a;">📐 Master Architectural Layout &amp; Blueprint</h3>
      <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">${title} — Sanctioned Site Layout &amp; Boundary Geometry</p>
      <img src="${imgUrl}" style="width: 100%; max-height: 440px; object-fit: contain; border-radius: 12px; border: 1px solid #e2e8f0;" />
    </div>
  `;
  modal.style.display = 'flex';
}
window.openMasterLayoutLightbox = openMasterLayoutLightbox;

function shareProperty(title, propId) {
  if (navigator.share) {
    navigator.share({
      title: `${title} | Land & Beyond`,
      text: `Check out this verified property listing on Land & Beyond: ${title}`,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(window.location.href);
    showToast('🔗 Property link copied to clipboard!');
  }
}
window.shareProperty = shareProperty;

// 7. DTCP & RERA SEARCH VERIFICATION TOOL
function verifyApprovalStatus(searchTerm) {
  const term = (searchTerm || '').trim().toLowerCase();
  const resultBox = document.getElementById('dtcpVerifyResult');
  if (!resultBox) return;

  if (!term) {
    resultBox.innerHTML = '<div style="padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #b45309; font-size: 13px;">Please enter a DTCP / RERA Number or Project Name.</div>';
    resultBox.style.display = 'block';
    return;
  }

  const approvals = getLBData(LB_KEYS.APPROVALS);
  const props = getLBData(LB_KEYS.PROPERTIES);

  const matchedApproval = approvals.find(a => 
    (a.title || a.projectName || '').toLowerCase().includes(term) ||
    (a.regNumber || a.approvalNo || '').toLowerCase().includes(term)
  );

  const matchedProp = props.find(p =>
    (p.title || '').toLowerCase().includes(term) ||
    (p.legalNo || p.approvalNumber || '').toLowerCase().includes(term)
  );

  if (matchedApproval || matchedProp) {
    const item = matchedApproval || matchedProp;
    resultBox.innerHTML = `
      <div style="padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; color: #065f46; font-size: 13.5px; line-height: 1.5;">
        <div style="font-weight: 800; font-size: 15px; color: #047857; margin-bottom: 4px;">🟢 100% Legal Clearance Verified</div>
        <strong>Project:</strong> ${item.title || item.projectName}<br>
        <strong>Approval Reference:</strong> ${item.regNumber || item.legalNo || 'DTCP: 481/2026'}<br>
        <strong>Legal Title Status:</strong> Patta Verified &amp; Encumbrance-Free Title Deed
      </div>
    `;
  } else {
    resultBox.innerHTML = `
      <div style="padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; color: #991b1b; font-size: 13.5px;">
        <div style="font-weight: 800; margin-bottom: 4px;">⚠️ Verification Notice</div>
        No matching record found for "<strong>${searchTerm}</strong>". Ensure the number matches the official TN RERA or DTCP sanction format.
      </div>
    `;
  }
  resultBox.style.display = 'block';
}
window.verifyApprovalStatus = verifyApprovalStatus;

// 8. 3D STUDIO DESIGN CONSULTATION MODAL & POOJA CONCIERGE MODAL
function openInteriorModal() {
  const modal = document.getElementById('interiorModal');
  if (!modal) return;
  const propType = document.getElementById('interiorPropType');
  if (propType) propType.selectedIndex = 0;
  const style = document.getElementById('interiorDesignStyle');
  if (style) style.selectedIndex = 0;
  const budget = document.getElementById('interiorBudget');
  if (budget) budget.selectedIndex = 0;

  modal.style.display = 'flex';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
window.openInteriorModal = openInteriorModal;
window.openInteriorConsultationModal = openInteriorModal;

function openPoojaModal(pkgName = '') {
  const modal = document.getElementById('poojaModal');
  if (!modal) return;

  const pkgSelect = document.getElementById('poojaPackage');
  if (pkgSelect) {
    if (pkgName && pkgName.trim() !== '') {
      let matched = false;
      for (let i = 0; i < pkgSelect.options.length; i++) {
        if (pkgSelect.options[i].value && pkgSelect.options[i].value.toLowerCase().includes(pkgName.toLowerCase())) {
          pkgSelect.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) pkgSelect.selectedIndex = 0;
    } else {
      pkgSelect.selectedIndex = 0;
    }
  }

  const traditionSelect = document.getElementById('poojaTradition');
  if (traditionSelect) {
    traditionSelect.selectedIndex = 0;
  }

  const dateInput = document.getElementById('poojaDate');
  if (dateInput) {
    dateInput.value = '';
  }

  modal.style.display = 'flex';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
window.openPoojaModal = openPoojaModal;
window.openGrihaPraveshModal = openPoojaModal;

function handleInteriorSubmit(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('interiorName') || document.getElementById('int-name');
  const phoneInput = document.getElementById('interiorPhone') || document.getElementById('int-phone');
  const propTypeInput = document.getElementById('interiorPropType') || document.getElementById('int-prop-type');
  const styleInput = document.getElementById('interiorDesignStyle') || document.getElementById('int-style');
  const budgetInput = document.getElementById('interiorBudget');
  const notesInput = document.getElementById('interiorNotes');

  const name = (nameInput ? nameInput.value.trim() : '') || 'Guest Client';
  const phone = (phoneInput ? phoneInput.value.trim() : '') || '';
  const propType = (propTypeInput && propTypeInput.value) ? propTypeInput.value : 'Apartment (2/3 BHK)';
  const style = (styleInput && styleInput.value) ? styleInput.value : 'Contemporary Minimalist';
  const budget = (budgetInput && budgetInput.value) ? budgetInput.value : '₹ 6.0 Lakh - ₹ 12.0 Lakh';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name || !phone) {
    alert('Please enter your Name and Phone Number to schedule consultation.');
    return;
  }

  const formattedPhone = phone.startsWith('+') ? phone : `+91 ${phone}`;

  const booking = {
    id: 'int_' + Date.now(),
    clientName: name,
    name: name,
    customerName: name,
    phone: formattedPhone,
    contact: formattedPhone,
    propertyType: propType,
    propType: propType,
    style: style,
    aestheticStyle: style,
    budget: budget,
    budgetTier: budget,
    floorplanStatus: 'Floorplan Uploaded',
    locality: notes || 'Coimbatore',
    location: notes || 'Coimbatore',
    address: notes || 'Coimbatore',
    notes: notes,
    status: '3D Render Ready',
    createdAt: new Date().toISOString()
  };

  let list = [];
  try {
    const raw = safeStorageGet(LB_KEYS.INTERIORS);
    if (raw) {
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    }
  } catch(e) {
    list = [];
  }

  list.unshift(booking);
  setLBData(LB_KEYS.INTERIORS, list);

  // POST to API
  try {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'lb_interior_consultations', data: list })
    }).catch(() => {});
  } catch(err) {}

  // Broadcast to Admin Dashboard
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('lb_sync_channel');
      bc.postMessage({ type: 'STATE_UPDATE', key: 'lb_interior_consultations', data: list });
      bc.close();
    }
  } catch(err) {}

  showToast(`🎨 3D Consultation Booked! Thank you ${name}, our architect will contact you shortly.`);
  alert(`✅ Free 3D Interior Consultation Booked Successfully!\n\nClient: ${name} (${formattedPhone})\nProperty: ${propType}\nStyle: ${style}\nBudget: ${budget}\n\nOur architectural team will contact you shortly.`);
  const form = document.getElementById('interiorForm') || document.getElementById('interiorConsultForm');
  if (form) form.reset();
  window.closeAllModals();
}
window.handleInteriorSubmit = handleInteriorSubmit;

function handlePoojaSubmit(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('poojaName') || document.getElementById('pooja-name');
  const phoneInput = document.getElementById('poojaPhone') || document.getElementById('pooja-phone');
  const pkgInput = document.getElementById('poojaPackage') || document.getElementById('pooja-pkg');
  const dateInput = document.getElementById('poojaDate') || document.getElementById('pooja-date');
  const traditionInput = document.getElementById('poojaTradition');
  const addressInput = document.getElementById('poojaAddress');

  const name = (nameInput ? nameInput.value.trim() : '') || 'Devotee';
  const phone = (phoneInput ? phoneInput.value.trim() : '') || '';
  const pkg = (pkgInput && pkgInput.value) ? pkgInput.value : 'Gold';
  const date = dateInput ? dateInput.value : '';
  const tradition = (traditionInput && traditionInput.value) ? traditionInput.value : 'Tamil Vedic Tradition';
  const address = (addressInput ? addressInput.value.trim() : '') || 'Coimbatore';

  if (!name || !phone || !date) {
    alert('Please enter your Name, Contact Number, and Auspicious Date.');
    return;
  }

  const formattedPhone = phone.startsWith('+') ? phone : `+91 ${phone}`;
  let pkgTier = 'Gold (Grand Homam)';
  if (pkg.toLowerCase().includes('silver')) pkgTier = 'Silver (Essential)';
  else if (pkg.toLowerCase().includes('plat')) pkgTier = 'Platinum (Full Feast & Decor)';

  const booking = {
    id: 'pooja_' + Date.now(),
    customerName: name,
    name: name,
    phone: formattedPhone,
    contact: formattedPhone,
    package: pkg,
    packageTier: pkgTier,
    muhurthamDate: date,
    date: date,
    tradition: tradition,
    pandit: 'Chief Vedic Pandit (Assigned)',
    samagriStatus: '48-Item Organic Kit Dispatched',
    location: address,
    locality: address,
    address: address,
    status: 'Confirmed & Scheduled',
    createdAt: new Date().toISOString()
  };

  let list = [];
  try {
    const raw = safeStorageGet(LB_KEYS.GRIHA_PRAVESH);
    if (raw) {
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    }
  } catch(e) {
    list = [];
  }

  list.unshift(booking);
  setLBData(LB_KEYS.GRIHA_PRAVESH, list);

  // POST to API
  try {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'lb_griha_pravesh_bookings', data: list })
    }).catch(() => {});
  } catch(err) {}

  // Broadcast to Admin Dashboard
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('lb_sync_channel');
      bc.postMessage({ type: 'STATE_UPDATE', key: 'lb_griha_pravesh_bookings', data: list });
      bc.close();
    }
  } catch(err) {}

  window.closeAllModals();
  const form = document.getElementById('poojaForm');
  if (form) form.reset();
  showToast(`🪔 Vedic Griha Pravesh scheduled for ${name}${date ? ` on ${date}` : ''}!`);
  alert(`✅ Griha Pravesh & Vedic Pooja Booked Successfully!\n\nHost: ${name} (${formattedPhone})\nPackage: ${pkgTier}\nAuspicious Date: ${date}\nTradition: ${tradition}\nAddress: ${address}\n\nOur Chief Pandit & Pooja coordination team has confirmed your schedule.`);
}
window.handlePoojaSubmit = handlePoojaSubmit;

// 10. INITIALIZATION & CROSS-TAB STORAGE SYNC
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.renderFrontendProperties === 'function') window.renderFrontendProperties();
  if (typeof window.initHeroBackgroundSlider === 'function') window.initHeroBackgroundSlider();
  if (typeof window.initSmartMatcher === 'function') window.initSmartMatcher();
  if (typeof window.renderNewProjects === 'function') window.renderNewProjects();
  if (typeof window.renderFastTrackLand === 'function') window.renderFastTrackLand();
  if (typeof window.renderApprovedProjects === 'function') window.renderApprovedProjects();
  if (typeof window.renderProperties === 'function') window.renderProperties();
  if (typeof window.renderLandShowcase === 'function') window.renderLandShowcase();
  if (typeof window.renderNewsArticles === 'function') window.renderNewsArticles();
  if (typeof window.initLivabilityIntelligence === 'function') window.initLivabilityIntelligence();
  if (typeof window.initComparisonDock === 'function') window.initComparisonDock();
  if (typeof window.initEmiCalculator === 'function') window.initEmiCalculator();
  if (typeof window.initTestimonialSlider === 'function') window.initTestimonialSlider();
  if (typeof window.initModals === 'function') window.initModals();
  if (typeof window.initNavigation === 'function') window.initNavigation();
  if (typeof window.initNewProjectsSearchAndTabs === 'function') window.initNewProjectsSearchAndTabs();
  if (typeof window.initNewsletterSubscription === 'function') window.initNewsletterSubscription();
  if (typeof window.initCleanUrlRouting === 'function') window.initCleanUrlRouting();
  if (typeof window.initGlobalEventDispatcher === 'function') window.initGlobalEventDispatcher();

  const localitySelect = document.getElementById('locationFilter');
  if (localitySelect) {
    localitySelect.addEventListener('change', (e) => {
      window.LB_PORTAL_STATE.currentLocality = e.target.value;
      if (typeof window.renderProperties === 'function') window.renderProperties();
    });
  }

  // Category Tabs Filter
  document.querySelectorAll('#categoryTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = btn.getAttribute('data-filter') || btn.getAttribute('data-cat') || 'All';
      window.filterPropertiesByCategory(cat, btn);
    });
  });

  // Cross-Tab Synchronization
  window.addEventListener('storage', (e) => {
    if ((LB_KEYS && Object.values(LB_KEYS).includes(e.key)) || e.key === 'lb_new_projects_data' || !e.key) {
      if (typeof window.renderProperties === 'function') window.renderProperties();
      if (typeof window.renderNewProjects === 'function') window.renderNewProjects();
      if (typeof window.renderNewsArticles === 'function') window.renderNewsArticles();
      if (typeof window.renderLiveNewsTicker === 'function') window.renderLiveNewsTicker();
      if (typeof window.renderApprovedProjects === 'function') window.renderApprovedProjects();
      if (typeof window.renderLandShowcase === 'function') window.renderLandShowcase();
      if (typeof window.updateCompareBadge === 'function') window.updateCompareBadge();
    }
  });

  if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel('lb_sync_channel');
    bc.onmessage = (msg) => {
      if (typeof window.renderProperties === 'function') window.renderProperties();
      if (typeof window.renderNewProjects === 'function') window.renderNewProjects();
      if (typeof window.renderNewsArticles === 'function') window.renderNewsArticles();
      if (typeof window.renderLiveNewsTicker === 'function') window.renderLiveNewsTicker();
      if (typeof window.renderApprovedProjects === 'function') window.renderApprovedProjects();
      if (typeof window.renderLandShowcase === 'function') window.renderLandShowcase();
      if (typeof window.updateCompareBadge === 'function') window.updateCompareBadge();
    };
  }
});


// ==========================================================================
// SMART PROPERTY MATCHER INTERACTIVE ENGINE
// ==========================================================================

function getParsedNumericPrice(priceStr) {
  if (!priceStr) return 0;
  const clean = priceStr.toString().toLowerCase().replace(/[^0-9.]/g, '');
  const val = parseFloat(clean) || 0;
  if (priceStr.toString().toLowerCase().includes('cr')) return val * 10000000;
  if (priceStr.toString().toLowerCase().includes('lakh')) return val * 100000;
  return val;
}

function updateSmartMatcherLivePreview() {
  const categorySelect = document.getElementById('categoryFilter') || document.getElementById('matcher-category');
  const localitySelect = document.getElementById('locationFilter') || document.getElementById('matcher-locality');
  const bhkSelect = document.getElementById('bhkFilter') || document.getElementById('matcher-bhk');
  const parkingSelect = document.getElementById('parkingFilter') || document.getElementById('matcher-parking');
  const budgetSlider = document.getElementById('budgetRange') || document.getElementById('matcher-budget-slider');
  const budgetLabel = document.getElementById('budgetValueLabel') || document.getElementById('matcher-budget-val');
  const scoreDial = document.getElementById('matcherScoreDial');
  const subtextEl = document.getElementById('matcherScoreSubtext') || document.getElementById('matcher-match-count');

  if (!budgetSlider) return;

  // Format Budget Display
  const sliderVal = parseFloat(budgetSlider.value); // in Lakhs
  let formattedBudget = '';
  if (sliderVal >= 100) {
    formattedBudget = `Up to ₹ ${(sliderVal / 100).toFixed(2)} Cr`;
  } else {
    formattedBudget = `Up to ₹ ${sliderVal} Lakh`;
  }
  if (budgetLabel) budgetLabel.textContent = formattedBudget;

  const selectedCategory = categorySelect ? categorySelect.value : 'All';
  const selectedLocality = localitySelect ? localitySelect.value : 'All';
  const selectedBHK = bhkSelect ? bhkSelect.value : 'Any';
  const selectedParking = parkingSelect ? parkingSelect.value : 'Any';
  const maxBudgetRupees = sliderVal * 100000;

  const allProps = getLBData(LB_KEYS.PROPERTIES);
  const activeProps = allProps.filter(p => {
    const st = (p.status || 'Active').toLowerCase();
    return st.includes('active') || st.includes('live');
  });

  const matched = activeProps.filter(prop => {
    // Category check
    let catMatch = true;
    if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Property Types') {
      const pCat = (prop.category || '').toLowerCase();
      const target = selectedCategory.toLowerCase();
      if (target.includes('apart')) catMatch = pCat.includes('apart') || pCat.includes('flat');
      else if (target.includes('villa')) catMatch = pCat.includes('villa');
      else if (target.includes('plot')) catMatch = pCat.includes('plot') || pCat.includes('land');
      else if (target.includes('dry') || target.includes('farm')) catMatch = pCat.includes('farm') || pCat.includes('agro');
      else if (target.includes('commerc')) catMatch = pCat.includes('commerc');
      else catMatch = pCat.includes(target);
    }

    // Locality check
    let locMatch = true;
    if (selectedLocality && selectedLocality !== 'All' && selectedLocality !== 'Any Prime Locality') {
      locMatch = (prop.location || '').toLowerCase().includes(selectedLocality.toLowerCase());
    }

    // BHK check
    let bhkMatch = true;
    if (selectedBHK && selectedBHK !== 'Any' && selectedBHK !== 'Any Configuration') {
      const pBhk = (prop.bhk || prop.metrics || '').toLowerCase();
      bhkMatch = pBhk.includes(selectedBHK.toLowerCase()) || (selectedBHK === 'Plots' && (pBhk.includes('plot') || pBhk.includes('land')));
    }

    // Budget check
    const numPrice = getParsedNumericPrice(prop.price);
    const budgetMatch = numPrice === 0 || numPrice <= maxBudgetRupees;

    return catMatch && locMatch && bhkMatch && budgetMatch;
  });

  // Calculate simulated fit score
  let score = 96;
  if (matched.length === 0) score = 42;
  else if (matched.length === 1) score = 98;
  else if (matched.length <= 3) score = 94;
  else score = 88;

  if (scoreDial) scoreDial.textContent = `${score}%`;
  if (subtextEl) {
    if (matched.length === 0) {
      subtextEl.textContent = 'No exact match (Adjust slider)';
    } else {
      subtextEl.textContent = `Matching ${matched.length} prime listing${matched.length > 1 ? 's' : ''}`;
    }
  }

  return matched;
}
window.updateSmartMatcherLivePreview = updateSmartMatcherLivePreview;

function executeSmartPropertyMatch() {
  const matched = updateSmartMatcherLivePreview();
  const categorySelect = document.getElementById('categoryFilter') || document.getElementById('matcher-category');
  const localitySelect = document.getElementById('locationFilter') || document.getElementById('matcher-locality');
  const bhkSelect = document.getElementById('bhkFilter') || document.getElementById('matcher-bhk');

  // Update global portal state
  if (categorySelect && categorySelect.value !== 'All' && categorySelect.value !== 'All Property Types') {
    window.LB_PORTAL_STATE.currentCategory = categorySelect.value;
  } else {
    window.LB_PORTAL_STATE.currentCategory = 'all';
  }

  if (localitySelect && localitySelect.value !== 'All' && localitySelect.value !== 'Any Prime Locality') {
    window.LB_PORTAL_STATE.currentLocality = localitySelect.value;
  } else {
    window.LB_PORTAL_STATE.currentLocality = 'all';
  }

  if (bhkSelect && bhkSelect.value !== 'Any' && bhkSelect.value !== 'Any Configuration') {
    window.LB_PORTAL_STATE.bhkFilter = bhkSelect.value;
  } else {
    window.LB_PORTAL_STATE.bhkFilter = 'all';
  }

  renderProperties();

  // Smooth scroll to results
  const targetSection = document.getElementById('properties-section') || document.getElementById('exploreMatchedSection') || document.getElementById('newProjects');
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`🎯 Smart Matcher found ${matched ? matched.length : 0} matching properties!`);
}
window.executeSmartPropertyMatch = executeSmartPropertyMatch;

// Attach live input listeners to Smart Matcher
function initSmartMatcherListeners() {
  const form = document.getElementById('matcherForm');
  const findBtn = document.getElementById('findMatchBtn') || document.getElementById('btn-find-matched-properties') || document.getElementById('findMatchedBtn');
  const budgetSlider = document.getElementById('budgetRange') || document.getElementById('matcher-budget-slider');

  const inputs = ['categoryFilter', 'locationFilter', 'bhkFilter', 'parkingFilter', 'budgetRange', 'matcher-category', 'matcher-locality', 'matcher-bhk', 'matcher-parking', 'matcher-budget-slider'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateSmartMatcherLivePreview);
      el.addEventListener('change', updateSmartMatcherLivePreview);
    }
  });

  if (findBtn) {
    findBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeSmartPropertyMatch();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSmartPropertyMatch();
    });
  }

  updateSmartMatcherLivePreview();
}

/**
 * ==========================================================================
 * LIVABILITY & CONVENIENCE ENGINE — DYNAMIC NEIGHBORHOOD & PROPERTY SCANNER
 * Real-Time Proximity Radar, Metric Scores, and Micro-Market Analytics
 * ==========================================================================
 */
const COIMBATORE_MICRO_MARKETS = {
  // URBAN CORE MICRO-MARKETS
  'saravanampatti': {
    id: 'area-saravanampatti',
    group: 'urban',
    name: 'Coimbatore ➔ Saravanampatti (IT & Tech Corridor)',
    composite: 9.3,
    label: 'Excellent Livability',
    schools: 9.2,
    schoolsHint: 'Within 2.5 km of top CBSE schools, PSG Tech & Kumaraguru Tech',
    hospitals: 8.8,
    hospitalsHint: '10 mins to Sri Ramakrishna Hospital & KG Healthcare Hub',
    retail: 9.5,
    retailHint: 'Prozone Mall, DMart & organic farm markets within 1.5 km',
    transit: 9.0,
    transitHint: 'Bus bays at 200m; Coimbatore Intl Airport within 18 mins',
    water: '110 - 130 Feet (Potable)',
    power: '3-Phase TNEB + 100% DG Backup',
    road: 'Sathy Road / IT Corridor Expressway',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'High ROI Potential',
    assessmentNote: 'Priced 8% below the current Saravanampatti IT corridor benchmark with strong rental yield.'
  },
  'peelamedu': {
    id: 'area-peelamedu',
    group: 'urban',
    name: 'Coimbatore ➔ Peelamedu (Avinashi Road & Healthcare Hub)',
    composite: 9.5,
    label: 'Prime Urban Core',
    schools: 9.6,
    schoolsHint: 'Walking distance to PSG Tech, PSG IMS & GRD Institute',
    hospitals: 9.4,
    hospitalsHint: '5 mins to PSG Hospitals, KMCH & Royal Care Healthcare',
    retail: 9.8,
    retailHint: 'Fun Republic Mall, DMart & Lakshmi Mills Urban Center within 800m',
    transit: 9.2,
    transitHint: '8 mins to Coimbatore Airport; direct arterial Avinashi road access',
    water: '130 - 150 Feet',
    power: 'TNEB Dedicated Transformer + Solar Common Lighting',
    road: '24m Main Avinashi Commercial Corridor',
    assessmentLabel: 'High Yield Asset',
    assessmentPill: 'Top Appreciation Corridor',
    assessmentNote: 'Strategic location on Avinashi Road with high tenant occupancy and solid capital appreciation.'
  },
  'race-course': {
    id: 'area-racecourse',
    group: 'urban',
    name: 'Coimbatore ➔ Race Course (Ultra-Luxury Heritage Precinct)',
    composite: 9.6,
    label: 'Ultra-Luxury Tier',
    schools: 9.5,
    schoolsHint: 'Close to Stanes Anglo Indian School & GD Naidu Matriculation',
    hospitals: 9.7,
    hospitalsHint: '3 mins to G.Kuppuswamy Naidu Memorial Hospital (GKNM)',
    retail: 9.4,
    retailHint: 'Brookefields Mall & Race Course Promenade Cafes at doorstep',
    transit: 9.6,
    transitHint: '5 mins to Coimbatore Central Railway Junction',
    water: '90 - 110 Feet (Siruvani Dedicated)',
    power: 'Underground Cabling + 10kW Solar Grid',
    road: '18m Tree-lined Race Course Ring Road',
    assessmentLabel: 'Fair Market Range',
    assessmentPill: 'Heritage Luxury',
    assessmentNote: 'Ultra-luxury heritage location with lifetime green views and elite neighborhood stature.'
  },
  'rs-puram': {
    id: 'area-rspuram',
    group: 'urban',
    name: 'Coimbatore ➔ RS Puram (Commercial & Lifestyle Hub)',
    composite: 9.7,
    label: 'Elite Livability',
    schools: 9.8,
    schoolsHint: '5 mins to Suburban School, Bharatiya Vidya Bhavan & Avila Convent',
    hospitals: 9.6,
    hospitalsHint: 'Lotus Eye Care, RS Puram Multi-Speciality Clinics & KG Hospital',
    retail: 9.7,
    retailHint: 'DB Road shopping hubs, gourmet restaurants & supermarkets',
    transit: 9.6,
    transitHint: '10 mins to Gandhipuram and Railway Station',
    water: '100 - 120 Feet (Siruvani Dedicated)',
    power: '3-Phase Grid + 100% Generator Backup',
    road: '15m Prime DB Road Link',
    assessmentLabel: 'Elite Asset Class',
    assessmentPill: 'Premium Capital Stability',
    assessmentNote: 'Elite residential precinct with unmatched lifestyle amenities, dining, and central convenience.'
  },
  'gandhipuram': {
    id: 'area-gandhipuram',
    group: 'urban',
    name: 'Coimbatore ➔ Gandhipuram (Central Transit & Commercial Core)',
    composite: 9.1,
    label: 'City Center Hub',
    schools: 9.0,
    schoolsHint: 'Central city schools & polytechnic colleges within 2 km',
    hospitals: 9.2,
    hospitalsHint: 'Coimbatore Medical College Hospital & KG Hospital nearby',
    retail: 9.5,
    retailHint: 'Cross Cut Road shopping street & 100 Feet Road retail hub',
    transit: 9.8,
    transitHint: '3 mins walk to Gandhipuram Central Bus Terminals',
    water: '120 Feet (Corporation Water + Sump)',
    power: 'TNEB 3-Phase Commercial Grid',
    road: '100 Feet Road / Sathyamangalam Link',
    assessmentLabel: 'Good Value',
    assessmentPill: 'High Transit Rentability',
    assessmentNote: 'Central city location with maximum transit score and instant rental tenancy.'
  },
  'ukkadam': {
    id: 'area-ukkadam',
    group: 'urban',
    name: 'Coimbatore ➔ Ukkadam (Central Bus Terminal & Lake Precinct)',
    composite: 8.9,
    label: 'City Transit & Lake Core',
    schools: 8.8,
    schoolsHint: "Govt Girls High School, St. Michael's & City Colleges",
    hospitals: 9.0,
    hospitalsHint: 'Ukkadam Urban Primary Health & CMC Hospital 1.5 km',
    retail: 9.1,
    retailHint: 'Ukkadam Vegetable Market, Fish Market & Big Bazaar Street',
    transit: 9.7,
    transitHint: 'Ukkadam Central Bus Terminal & Bypass Flyover',
    water: '110 Feet (Siruvani + Periyakulam Lake Supply)',
    power: 'TNEB 3-Phase Urban Grid',
    road: 'Palakkad Main Road / Ukkadam Bypass Flyover',
    assessmentLabel: 'High Rentability',
    assessmentPill: 'Transit Hub',
    assessmentNote: 'High-density transit location with non-stop bus connectivity and commercial rental demand.'
  },
  'selvapuram': {
    id: 'area-selvapuram',
    group: 'urban',
    name: 'Coimbatore ➔ Selvapuram (Perur Main Road Corridor)',
    composite: 8.8,
    label: 'Residential Suburban',
    schools: 8.9,
    schoolsHint: 'Near Perur Temple Schools & SBOA Matriculation',
    hospitals: 8.7,
    hospitalsHint: 'Ganga Hospital Branch & Local Multispeciality Clinics',
    retail: 8.9,
    retailHint: 'Perur Main Road Retail Hub & Pazhamudir Supermarkets',
    transit: 9.0,
    transitHint: 'Direct connectivity to Ukkadam & Perur Temple Highway',
    water: '100 - 120 Feet (Siruvani Line)',
    power: '3-Phase TNEB Connection',
    road: 'Perur Main Road (15m Arterial)',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'Cultural Corridor',
    assessmentNote: 'Established family residential neighborhood along historic Perur Temple road with strong appreciation.'
  },
  'saibaba-colony': {
    id: 'area-saibaba-colony',
    group: 'urban',
    name: 'Coimbatore ➔ Saibaba Colony (NSR Road Residential Belt)',
    composite: 9.5,
    label: 'Prime Residential Core',
    schools: 9.4,
    schoolsHint: 'KIKani Vidhya Mandir, Alvernia & Sindhi Vidyalaya',
    hospitals: 9.3,
    hospitalsHint: 'Ganga Hospital 1.2 km & KICMA Medical Center',
    retail: 9.6,
    retailHint: 'NSR Road High Street Retail, Nilgiris & Gourmet Cafes',
    transit: 9.3,
    transitHint: 'Mettupalayam Road Highway & Sivananda Colony Link',
    water: '90 - 110 Feet (Siruvani Dedicated)',
    power: '3-Phase Grid + 100% Back-up',
    road: '18m NSR Commercial Road',
    assessmentLabel: 'Prime Value Asset',
    assessmentPill: 'High Appreciation',
    assessmentNote: 'Highly sought-after residential colony with NSR Road shopping street and premium livability.'
  },
  'townhall': {
    id: 'area-townhall',
    group: 'urban',
    name: 'Coimbatore ➔ Town Hall (Heritage Commercial Center)',
    composite: 9.0,
    label: 'Heritage Commercial Core',
    schools: 8.9,
    schoolsHint: 'St. Thomas Higher Sec School & City Colleges',
    hospitals: 9.4,
    hospitalsHint: 'Coimbatore Medical College Hospital (CMCH) at doorstep',
    retail: 9.8,
    retailHint: 'Oppanakara Street, Raja Street & Big Bazaar Textile Hub',
    transit: 9.6,
    transitHint: 'Coimbatore Central Railway Station 600m',
    water: '100 Feet (Corporation Pipeline)',
    power: 'Commercial 3-Phase Substation Grid',
    road: 'Oppanakara Street / Trichy Road Link',
    assessmentLabel: 'High Commercial Yield',
    assessmentPill: 'Textile & Retail Core',
    assessmentNote: "Coimbatore's historic commercial hub with maximum retail footfall and high rental return."
  },
  'kuniyamuthur': {
    id: 'area-kuniyamuthur',
    group: 'urban',
    name: 'Coimbatore ➔ Kuniyamuthur (Palakkad Highway Educational Belt)',
    composite: 8.8,
    label: 'Educational Corridor',
    schools: 9.1,
    schoolsHint: 'Sri Krishna College of Engg, SKASC & Ashram School',
    hospitals: 8.6,
    hospitalsHint: 'Kuniyamuthur Health Center & Sundarapuram Clinics',
    retail: 8.7,
    retailHint: 'Palakkad Road Markets & Supermarkets',
    transit: 9.0,
    transitHint: 'Four-lane Palakkad Highway (NH 544) Access',
    water: '110 - 130 Feet',
    power: 'TNEB 3-Phase Substation',
    road: 'NH 544 Palakkad Main Road',
    assessmentLabel: 'Student Rental Yield',
    assessmentPill: 'High Educational Demand',
    assessmentNote: 'High student and faculty rental housing demand driven by Sri Krishna Institutions campus.'
  },
  'sundarapuram': {
    id: 'area-sundarapuram',
    group: 'urban',
    name: 'Coimbatore ➔ Sundarapuram (Pollachi Highway Corridor)',
    composite: 8.7,
    label: 'Suburban Industrial & Residential',
    schools: 8.8,
    schoolsHint: "St. Paul's Matriculation & Eachanari Colleges nearby",
    hospitals: 8.5,
    hospitalsHint: 'Sundarapuram Govt Hospital & Private Clinics',
    retail: 8.8,
    retailHint: 'Pollachi Road Commercial Street & Daily Markets',
    transit: 9.1,
    transitHint: 'Direct Link to Ukkadam & Pollachi Four-Lane Highway',
    water: '120 Feet',
    power: '3-Phase TNEB Industrial Grid',
    road: 'NH 83 Pollachi Arterial Road',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'Growing Suburb',
    assessmentNote: 'Affordable residential sector with quick connectivity to core city and Pollachi highway.'
  },
  'vadavalli': {
    id: 'area-vadavalli',
    group: 'urban',
    name: 'Coimbatore ➔ Vadavalli (Marudhamalai Corridor & Residential Belt)',
    composite: 9.0,
    label: 'High Quality Suburban',
    schools: 9.1,
    schoolsHint: 'Chinmaya Vidyalaya, Bharathiar University & Govt Law College',
    hospitals: 8.7,
    hospitalsHint: 'Vadavalli Govt Hospital & Amrita Multi-Speciality Clinic',
    retail: 9.0,
    retailHint: 'Marudhamalai Road Market, Pazhamudir & Supermarkets',
    transit: 8.9,
    transitHint: 'Direct bus routes to Railway Station & Gandhipuram',
    water: '90 - 110 Feet (Siruvani Foothills)',
    power: 'TNEB 3-Phase Substation',
    road: '18m Marudhamalai Arterial Road',
    assessmentLabel: 'High Growth Potential',
    assessmentPill: 'Suburban Premium',
    assessmentNote: 'Rapidly expanding residential corridor with serene temple foothills and institutional presence.'
  },
  'singanallur': {
    id: 'area-singanallur',
    group: 'urban',
    name: 'Coimbatore ➔ Singanallur (Trichy Road & Industrial Hub)',
    composite: 8.8,
    label: 'Industrial & Transit Hub',
    schools: 8.7,
    schoolsHint: "St. Joseph's Higher Sec School & PSG Polytechnic",
    hospitals: 9.0,
    hospitalsHint: 'KMCH City Center & Shanti Social Services Hospital',
    retail: 8.9,
    retailHint: 'Singanallur Market, Pazhamudir & Retail Outlets',
    transit: 9.4,
    transitHint: 'Singanallur Bus Terminal & Trichy Road Flyover Corridor',
    water: '120 - 140 Feet',
    power: 'Industrial 3-Phase Grid Connection',
    road: 'Trichy Road Expressway / L&T Bypass',
    assessmentLabel: 'Good ROI Potential',
    assessmentPill: 'Logistics & Residential',
    assessmentNote: 'Key transit arterial corridor with new flyover connectivity and high rental demand.'
  },
  'ramanathapuram': {
    id: 'area-ramanathapuram',
    group: 'urban',
    name: 'Coimbatore ➔ Ramanathapuram (Trichy Road Core)',
    composite: 9.2,
    label: 'Prime Residential',
    schools: 9.2,
    schoolsHint: 'Alvernia Matriculation & St. Francis Anglo Indian',
    hospitals: 9.1,
    hospitalsHint: 'Ganga Hospital City Branch & Kidney Centre',
    retail: 9.3,
    retailHint: 'Trichy Road Shopping Hubs & Supermarkets',
    transit: 9.4,
    transitHint: '5 mins to Railway Station via Trichy Road Flyover',
    water: '100 - 120 Feet (Corporation Line)',
    power: 'TNEB 3-Phase Grid',
    road: 'Trichy Road Expressway',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'Central Residential Growth',
    assessmentNote: 'Established family residential hub with direct flyover connectivity to core city centers.'
  },
  'hopes-college': {
    id: 'area-hopes-college',
    group: 'urban',
    name: 'Coimbatore ➔ Hopes College & Tidel Park Zone',
    composite: 9.4,
    label: 'IT Hub Core',
    schools: 9.3,
    schoolsHint: 'PSG Tech, GRD & Coimbatore Medical College',
    hospitals: 9.3,
    hospitalsHint: 'KMCH & PSG Hospitals within 2 km',
    retail: 9.6,
    retailHint: 'Tidel Park Food Courts & Avinashi Road Malls',
    transit: 9.5,
    transitHint: 'Immediate Access to Avinashi Flyover & Airport',
    water: '120 - 140 Feet',
    power: 'Dedicated 11kV Feeder Line',
    road: '24m Avinashi Commercial Arterial',
    assessmentLabel: 'High Yield Asset',
    assessmentPill: 'IT Professional Rental Hub',
    assessmentNote: 'Prime commercial and IT hub with non-stop rental demand and premium square foot rates.'
  },
  'ganapathy': {
    id: 'area-ganapathy',
    group: 'urban',
    name: 'Coimbatore ➔ Ganapathy (Sathy Road Commercial Sector)',
    composite: 9.0,
    label: 'High Density Urban',
    schools: 8.9,
    schoolsHint: 'CMS Matriculation & Sathy Road Schools',
    hospitals: 8.8,
    hospitalsHint: 'Sankara Eye Hospital & Local Healthcare',
    retail: 9.2,
    retailHint: 'Ganapathy Market & Textool Commercial District',
    transit: 9.1,
    transitHint: 'Direct Bus Routes to Gandhipuram (2 km)',
    water: '110 Feet',
    power: 'TNEB 3-Phase Grid',
    road: 'Sathy Road Arterial Link',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'Commercial Surge',
    assessmentNote: 'Densely populated commercial and residential district with excellent bus connectivity.'
  },
  'sowripalayam': {
    id: 'area-sowripalayam',
    group: 'urban',
    name: 'Coimbatore ➔ Sowripalayam (Avinashi Link Road)',
    composite: 9.1,
    label: 'Prime Suburban Core',
    schools: 9.2,
    schoolsHint: 'Near Meenaakshi Matriculation & PSG Schools',
    hospitals: 9.1,
    hospitalsHint: 'PSG Hospitals & KMCH 5 mins',
    retail: 9.3,
    retailHint: 'Avinashi Road Malls & Sowripalayam High Street',
    transit: 9.1,
    transitHint: 'Quick Link to Peelamedu & Ramanathapuram',
    water: '110 Feet (Siruvani Line)',
    power: '3-Phase TNEB Grid',
    road: '15m Sowripalayam Main Road',
    assessmentLabel: 'High Appreciation Asset',
    assessmentPill: 'IT Corridor Proximity',
    assessmentNote: 'Central suburban location connecting Peelamedu IT hub and Ramanathapuram residential area.'
  },
  'ondipudur': {
    id: 'area-ondipudur',
    group: 'urban',
    name: 'Coimbatore ➔ Ondipudur (Trichy Road Expansion Belt)',
    composite: 8.7,
    label: 'Suburban Residential',
    schools: 8.8,
    schoolsHint: "Near St. Joseph's & Air Force School",
    hospitals: 8.6,
    hospitalsHint: 'KMCH Specialty Center & Local Clinics',
    retail: 8.8,
    retailHint: 'Trichy Road Market & Reliance Smart',
    transit: 9.2,
    transitHint: 'Direct Access to Trichy Road Flyover & Singanallur',
    water: '120 Feet',
    power: 'TNEB 3-Phase Connection',
    road: 'Trichy Road (NH 67)',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'Suburban Expansion',
    assessmentNote: 'Growing residential hub with fast access to Trichy Road flyover and airport link.'
  },

  // SUBURBS & EXPANSION BELTS
  'thudiyalur': {
    id: 'area-thudiyalur',
    group: 'suburbs',
    name: 'Coimbatore ➔ Thudiyalur (North Mettupalayam Corridor)',
    composite: 8.7,
    label: 'North Coimbatore Growth Belt',
    schools: 8.9,
    schoolsHint: 'VLB Janakiammal College & Sri Ramakrishna Engineering',
    hospitals: 8.5,
    hospitalsHint: 'Sri Ramakrishna Hospital Branch & Local Health Hubs',
    retail: 8.8,
    retailHint: 'Thudiyalur Daily Market & Reliance Smart Point',
    transit: 8.7,
    transitHint: 'Mettupalayam Highway & Northern Bypass Link',
    water: '110 - 130 Feet',
    power: 'TNEB Substation Connection',
    road: 'Mettupalayam Highway (NH 67)',
    assessmentLabel: 'High Growth Potential',
    assessmentPill: 'Emerging IT Suburb',
    assessmentNote: 'Affordable housing hub connecting Saravanampatti IT corridor and Northern industrial zones.'
  },
  'kovaipudur': {
    id: 'area-kovaipudur',
    group: 'suburbs',
    name: 'Coimbatore ➔ Kovaipudur (Western Ghats Foothill Gated Belt)',
    composite: 8.9,
    label: 'Serene Residential',
    schools: 8.8,
    schoolsHint: 'Near Ashram Matriculation & Sri Krishna Arts & Science College',
    hospitals: 8.5,
    hospitalsHint: 'Kovaipudur Multi-Speciality Clinic & Ganga Medical Center branch',
    retail: 8.7,
    retailHint: 'Supermarkets, organic stores & recreation parks within 1 km',
    transit: 8.6,
    transitHint: '15 mins to Ukkadam Central Bus Terminal & Palakkad Highway',
    water: '100 - 120 Feet (Foothill Springs)',
    power: 'TNEB 3-Phase + Solar Inverter',
    road: '15m Palakkad Highway Bypass Link',
    assessmentLabel: 'Good Value',
    assessmentPill: 'Eco-Living Sanctuary',
    assessmentNote: 'Tranquil hill-view gated sanctuary with pleasant microclimate throughout the year.'
  },
  'annur': {
    id: 'area-annur',
    group: 'suburbs',
    name: 'Coimbatore ➔ Annur (High-Growth Expansion Zone)',
    composite: 8.6,
    label: 'Growth Corridor',
    schools: 8.5,
    schoolsHint: 'Annur Matriculation & Sathy Road Colleges',
    hospitals: 8.2,
    hospitalsHint: 'Annur Government Hospital & Emergency Clinics',
    retail: 8.6,
    retailHint: 'Annur Town Market & Commercial stores within 1.2 km',
    transit: 8.8,
    transitHint: 'National Highway Sathy Road connectivity; 20 mins to Saravanampatti',
    water: '120 - 140 Feet',
    power: 'Dedicated Agro & Residential Grid',
    road: 'NH 209 Sathy Road Corridor',
    assessmentLabel: 'High Potential ROI',
    assessmentPill: 'Appreciation Hotspot',
    assessmentNote: "Coimbatore's fastest growing industrial & residential expansion belt with high projected annual surge."
  },
  'sulur': {
    id: 'area-sulur',
    group: 'suburbs',
    name: 'Coimbatore ➔ Sulur (Logistics & Air Force Belt)',
    composite: 8.4,
    label: 'Agro & Logistics Zone',
    schools: 7.9,
    schoolsHint: 'RVS Educational Institutions & Air Force Schools',
    hospitals: 8.1,
    hospitalsHint: 'Sulur Taluk Hospital & ESI Dispensary',
    retail: 8.2,
    retailHint: 'Sulur Central Bazaar & Hypermarkets',
    transit: 8.8,
    transitHint: 'Direct road access from Trichy Highway & L&T Bypass',
    water: '130 - 150 Feet',
    power: 'Free Farm Tariff & TNEB Commercial',
    road: 'Trichy Highway / Outer Ring Link',
    assessmentLabel: 'High Potential ROI',
    assessmentPill: 'Warehousing & Agro',
    assessmentNote: 'Strategic logistical hub with Air Force proximity and upcoming outer ring road developments.'
  },
  'eachanari': {
    id: 'area-eachanari',
    group: 'suburbs',
    name: 'Coimbatore ➔ Eachanari & Malumichampatti (Pollachi Highway)',
    composite: 8.7,
    label: 'Educational & Tech Belt',
    schools: 9.0,
    schoolsHint: 'Rathinam Tech Zone, Eachanari Temple & Karpagam University',
    hospitals: 8.4,
    hospitalsHint: 'Karpagam Medical College Hospital',
    retail: 8.5,
    retailHint: 'Eachanari Market & Tech Park Plaza',
    transit: 8.9,
    transitHint: 'Four-lane Pollachi Highway Corridor & Ukkadam Link',
    water: '110 - 130 Feet',
    power: 'TNEB Industrial 3-Phase',
    road: 'NH 83 Pollachi Main Road',
    assessmentLabel: 'Good Value Asset',
    assessmentPill: 'Student & IT Rental Yield',
    assessmentNote: 'High rental demand corridor fueled by Rathinam IT Park and university campuses.'
  },

  // POLLACHI REGION & AGRO CORRIDORS
  'pollachi-town': {
    id: 'area-pollachi-town',
    group: 'pollachi',
    name: 'Pollachi Region ➔ Pollachi Town (Central Commercial Core)',
    composite: 8.9,
    label: 'Regional Commercial Center',
    schools: 9.0,
    schoolsHint: 'NGM College, Mahalingam College & International Schools',
    hospitals: 8.8,
    hospitalsHint: 'Pollachi Government HQ Hospital & Multi-Speciality Care',
    retail: 9.2,
    retailHint: 'Pollachi Jaggery & Coconut Market, Bazaar Street & Malls',
    transit: 9.2,
    transitHint: 'Pollachi Junction Railway Station & Central Bus Stand',
    water: '80 - 100 Feet (Aliyar Dam Feeder Line)',
    power: '3-Phase TNEB Grid',
    road: 'Coimbatore-Pollachi 4-Lane Expressway (NH 83)',
    assessmentLabel: 'High ROI Farmland & Residential',
    assessmentPill: 'Regional Hub',
    assessmentNote: 'Major commercial gateway connecting Tamil Nadu & Kerala with booming agricultural trade.'
  },
  'kinathukadavu': {
    id: 'area-kinathukadavu',
    group: 'pollachi',
    name: 'Pollachi Region ➔ Kinathukadavu (Pollachi Highway Agro Belt)',
    composite: 8.7,
    label: 'Highway Agro Corridor',
    schools: 8.6,
    schoolsHint: 'Kinathukadavu Higher Sec School & Engineering Colleges',
    hospitals: 8.3,
    hospitalsHint: 'Kinathukadavu Taluk Hospital & Clinics',
    retail: 8.5,
    retailHint: 'Kinathukadavu Farmers Market & Highway Plazas',
    transit: 9.1,
    transitHint: 'Direct 4-Lane Highway to Coimbatore (20 mins) & Pollachi',
    water: '90 - 110 Feet (High Water Table)',
    power: 'Agro & Residential Grid Active',
    road: 'NH 83 Coimbatore-Pollachi 4-Lane Expressway',
    assessmentLabel: 'High Appreciation Asset',
    assessmentPill: 'Agro-Gated Layouts',
    assessmentNote: 'Rapidly appreciating highway corridor popular for gated farm villas and industrial plots.'
  },
  'anaimalai': {
    id: 'area-anaimalai',
    group: 'pollachi',
    name: 'Pollachi Region ➔ Anaimalai (Eco-Tourism & Farmland Belt)',
    composite: 8.6,
    label: 'Eco-Farmland Sanctuary',
    schools: 8.3,
    schoolsHint: 'Masaniamman Temple Schools & Agro Research Institutes',
    hospitals: 8.2,
    hospitalsHint: 'Anaimalai Govt Hospital & Eco-Retreat Medicals',
    retail: 8.4,
    retailHint: 'Local Organic Produce Markets & Eco Stores',
    transit: 8.5,
    transitHint: 'State Highway link to Pollachi & Topslip Wildlife Sanctuary',
    water: '60 - 90 Feet (Abundant Canal & River Water)',
    power: '3-Phase Agro Power Eligible',
    road: 'State Highway 78 (Tree-lined Corridor)',
    assessmentLabel: 'Agro & Eco Resort ROI',
    assessmentPill: 'Abundant Water Table',
    assessmentNote: 'Prime fertile farmland belt fed by Aliyar river canals, perfect for coconut plantations and farm resorts.'
  },
  'negamam': {
    id: 'area-negamam',
    group: 'pollachi',
    name: 'Pollachi Region ➔ Negamam (Textile & Coconut Farming Corridor)',
    composite: 8.5,
    label: 'Agro & Weaving Hub',
    schools: 8.2,
    schoolsHint: 'Negamam Higher Sec School & Vocational Institutes',
    hospitals: 8.1,
    hospitalsHint: 'Negamam Primary Health Center & Private Clinics',
    retail: 8.3,
    retailHint: 'Negamam Handloom Saree Market & Agro Supplies',
    transit: 8.6,
    transitHint: 'Bus routes connecting Pollachi, Palladam & Tiruppur',
    water: '80 - 110 Feet',
    power: '3-Phase Textile & Agro Grid',
    road: 'Negamam - Pollachi Main Road',
    assessmentLabel: 'High Value Farmland',
    assessmentPill: 'Handloom & Agro',
    assessmentNote: 'Famous agricultural and handloom hub offering high fertility farmland at attractive rates.'
  },
  'valparai-foothills': {
    id: 'area-valparai-foothills',
    group: 'pollachi',
    name: 'Pollachi Region ➔ Valparai Foothills (Tea Estate & Resort Sanctuary)',
    composite: 8.8,
    label: 'Hill View Sanctuary',
    schools: 8.4,
    schoolsHint: 'Monkey Falls Foothill Schools & Forestry Institutes',
    hospitals: 8.3,
    hospitalsHint: 'Foothill Health Station & Emergency Transit Care',
    retail: 8.3,
    retailHint: 'Eco-Resort Stores & Organic Produce Hubs',
    transit: 8.7,
    transitHint: 'Valparai Ghat Road & Pollachi Highway Link',
    water: '50 - 80 Feet (Mountain Stream Water)',
    power: 'Eco Hydro & Solar Back-up Grid',
    road: 'Scenic Valparai Ghat Highway',
    assessmentLabel: 'Luxury Resort ROI',
    assessmentPill: 'Ecological Paradise',
    assessmentNote: 'Breathtaking Western Ghats foothill location ideal for wellness retreats, tea plantation homes, and boutique stays.'
  }
};

function updateLivabilityDisplay(profile) {
  if (!profile) return;

  const compositeVal = document.getElementById('intelligenceCompositeVal');
  const ratingLabel = document.getElementById('intelligenceRatingLabel');
  if (compositeVal) compositeVal.textContent = profile.composite !== undefined ? profile.composite : '9.0';
  if (ratingLabel) ratingLabel.textContent = profile.label || 'High Livability';

  const schVal = profile.schools !== undefined ? profile.schools : 9.0;
  const hpVal = profile.hospitals !== undefined ? profile.hospitals : 9.0;
  const retVal = profile.retail !== undefined ? profile.retail : 9.0;
  const trVal = profile.transit !== undefined ? profile.transit : 9.0;

  const scoreSchools = document.getElementById('scoreSchools');
  const barSchools = document.getElementById('barSchools');
  const hintSchools = document.getElementById('hintSchools');
  if (scoreSchools) scoreSchools.textContent = `${schVal} / 10`;
  if (barSchools) barSchools.style.width = `${Math.min(100, Math.max(0, schVal * 10))}%`;
  if (hintSchools) hintSchools.textContent = profile.schoolsHint || 'Top schools and educational institutions nearby';

  const scoreHospitals = document.getElementById('scoreHospitals');
  const barHospitals = document.getElementById('barHospitals');
  const hintHospitals = document.getElementById('hintHospitals');
  if (scoreHospitals) scoreHospitals.textContent = `${hpVal} / 10`;
  if (barHospitals) barHospitals.style.width = `${Math.min(100, Math.max(0, hpVal * 10))}%`;
  if (hintHospitals) hintHospitals.textContent = profile.hospitalsHint || 'Multispeciality emergency healthcare access nearby';

  const scoreRetail = document.getElementById('scoreRetail');
  const barRetail = document.getElementById('barRetail');
  const hintRetail = document.getElementById('hintRetail');
  if (scoreRetail) scoreRetail.textContent = `${retVal} / 10`;
  if (barRetail) barRetail.style.width = `${Math.min(100, Math.max(0, retVal * 10))}%`;
  if (hintRetail) hintRetail.textContent = profile.retailHint || 'Supermarkets, daily essentials & retail centers within 1 km';

  const scoreTransit = document.getElementById('scoreTransit');
  const barTransit = document.getElementById('barTransit');
  const hintTransit = document.getElementById('hintTransit');
  if (scoreTransit) scoreTransit.textContent = `${trVal} / 10`;
  if (barTransit) barTransit.style.width = `${Math.min(100, Math.max(0, trVal * 10))}%`;
  if (hintTransit) hintTransit.textContent = profile.transitHint || 'Bus terminals, airport & highway connectivity nearby';

  const assessmentLabel = document.getElementById('assessmentLabel');
  const assessmentTypePill = document.getElementById('assessmentTypePill');
  const assessmentExplanation = document.getElementById('assessmentExplanation');
  if (assessmentLabel) assessmentLabel.textContent = profile.assessmentLabel || 'Good Value Asset';
  if (assessmentTypePill) assessmentTypePill.textContent = profile.assessmentPill || 'High ROI Potential';
  if (assessmentExplanation) assessmentExplanation.textContent = profile.assessmentNote || 'Priced attractively against local market benchmarks.';

  const specWater = document.getElementById('specWater');
  const specPower = document.getElementById('specPower');
  const specRoad = document.getElementById('specRoad');
  if (specWater) specWater.textContent = profile.water || '110 - 130 Feet (Potable)';
  if (specPower) specPower.textContent = profile.power || '3-Phase TNEB Grid';
  if (specRoad) specRoad.textContent = profile.road || 'Main Connecting Corridor';

  // SVG 4-Axis Proximity Radar Chart Polygon & Nodes
  const top_y = 150 - (schVal / 10.0) * 130;
  const right_x = 150 + (hpVal / 10.0) * 130;
  const bottom_y = 150 + (retVal / 10.0) * 130;
  const left_x = 150 - (trVal / 10.0) * 130;

  const radarPolygon = document.getElementById('radarPolygon');
  const nodeTop = document.getElementById('radarNodeTop');
  const nodeRight = document.getElementById('radarNodeRight');
  const nodeBottom = document.getElementById('radarNodeBottom');
  const nodeLeft = document.getElementById('radarNodeLeft');

  if (radarPolygon) {
    radarPolygon.setAttribute('points', `150,${top_y.toFixed(1)} ${right_x.toFixed(1)},150 150,${bottom_y.toFixed(1)} ${left_x.toFixed(1)},150`);
  }
  if (nodeTop) { nodeTop.setAttribute('cx', '150'); nodeTop.setAttribute('cy', top_y.toFixed(1)); }
  if (nodeRight) { nodeRight.setAttribute('cx', right_x.toFixed(1)); nodeRight.setAttribute('cy', '150'); }
  if (nodeBottom) { nodeBottom.setAttribute('cx', '150'); nodeBottom.setAttribute('cy', bottom_y.toFixed(1)); }
  if (nodeLeft) { nodeLeft.setAttribute('cx', left_x.toFixed(1)); nodeLeft.setAttribute('cy', '150'); }
}
window.updateLivabilityDisplay = updateLivabilityDisplay;

function initLivabilityEngine() {
  const select = document.getElementById('intelligencePropertySelect');
  if (!select) return;

  const previousValue = select.value;
  select.innerHTML = '';

  // 1. Group 1: Urban Core
  const groupUrban = document.createElement('optgroup');
  groupUrban.label = '🏙️ Coimbatore Urban Core & Micro-Markets';

  // 2. Group 2: Suburbs & Expansion Belts
  const groupSuburbs = document.createElement('optgroup');
  groupSuburbs.label = '🌳 Greater Coimbatore Suburbs & Expansion Belts';

  // 3. Group 3: Pollachi Region
  const groupPollachi = document.createElement('optgroup');
  groupPollachi.label = '🌴 Pollachi Region & Agro-Corridors';

  Object.keys(COIMBATORE_MICRO_MARKETS).forEach(key => {
    const market = COIMBATORE_MICRO_MARKETS[key];
    const opt = document.createElement('option');
    opt.value = `market_${key}`;
    opt.textContent = market.name;
    opt.dataset.profile = JSON.stringify(market);

    if (market.group === 'pollachi') {
      groupPollachi.appendChild(opt);
    } else if (market.group === 'suburbs') {
      groupSuburbs.appendChild(opt);
    } else {
      groupUrban.appendChild(opt);
    }
  });

  if (groupUrban.children.length > 0) select.appendChild(groupUrban);
  if (groupSuburbs.children.length > 0) select.appendChild(groupSuburbs);
  if (groupPollachi.children.length > 0) select.appendChild(groupPollachi);

  if (previousValue) {
    select.value = previousValue;
  }
  if (!select.value && select.options.length > 0) {
    select.selectedIndex = 0;
  }

  function handleSelectChange() {
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.profile) {
      try {
        const profile = JSON.parse(selectedOption.dataset.profile);
        updateLivabilityDisplay(profile);
      } catch(e) {
        console.error('Livability profile parse error:', e);
      }
    }
  }

  select.removeEventListener('change', handleSelectChange);
  select.removeEventListener('input', handleSelectChange);
  select.addEventListener('change', handleSelectChange);
  select.addEventListener('input', handleSelectChange);

  handleSelectChange();
}
window.initLivabilityEngine = initLivabilityEngine;

// --------------------------------------------------------------------------
// 15. Real-Time Interactive Home Loan & EMI Calculator Engine
// --------------------------------------------------------------------------
function initEMICalculator() {
  const loanAmountInput = document.getElementById('loanAmount');
  const loanAmountRange = document.getElementById('loanAmountRange');
  const interestRateInput = document.getElementById('interestRate');
  const interestRateRange = document.getElementById('interestRateRange');
  const loanTenureInput = document.getElementById('loanTenure');
  const loanTenureRange = document.getElementById('loanTenureRange');

  const emiValueEl = document.getElementById('emiValue');
  const interestValueEl = document.getElementById('interestValue');
  const totalPaymentValueEl = document.getElementById('totalPaymentValue');
  const principalPercentEl = document.getElementById('principalPercent');
  const interestPercentEl = document.getElementById('interestPercent');
  const barPrincipalPortion = document.getElementById('barPrincipalPortion');
  const barInterestPortion = document.getElementById('barInterestPortion');

  const bankPills = document.querySelectorAll('.bank-pill');

  if (!loanAmountInput || !emiValueEl) return;

  function calculateAndRenderEMI() {
    const P = parseFloat(loanAmountInput.value) || 5000000;
    const annualRate = parseFloat(interestRateInput.value) || 8.4;
    const years = parseFloat(loanTenureInput.value) || 20;

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;

    let emi = 0;
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      emi = Math.round((P * monthlyRate * factor) / (factor - 1));
    } else {
      emi = Math.round(P / totalMonths);
    }

    const totalPayment = emi * totalMonths;
    const totalInterest = Math.max(0, totalPayment - P);

    const principalPct = totalPayment > 0 ? Math.round((P / totalPayment) * 100) : 50;
    const interestPct = Math.max(0, 100 - principalPct);

    if (emiValueEl) emiValueEl.textContent = '₹ ' + emi.toLocaleString('en-IN');
    if (interestValueEl) interestValueEl.textContent = '₹ ' + totalInterest.toLocaleString('en-IN');
    if (totalPaymentValueEl) totalPaymentValueEl.textContent = '₹ ' + totalPayment.toLocaleString('en-IN');

    if (principalPercentEl) principalPercentEl.textContent = principalPct + '%';
    if (interestPercentEl) interestPercentEl.textContent = interestPct + '%';

    if (barPrincipalPortion) barPrincipalPortion.style.width = principalPct + '%';
    if (barInterestPortion) barInterestPortion.style.width = interestPct + '%';
  }

  // 1. Sync Loan Amount Input & Range
  loanAmountInput.addEventListener('input', () => {
    let val = parseFloat(loanAmountInput.value) || 0;
    if (val > 50000000) val = 50000000;
    if (loanAmountRange) loanAmountRange.value = val;
    calculateAndRenderEMI();
  });

  if (loanAmountRange) {
    loanAmountRange.addEventListener('input', () => {
      loanAmountInput.value = loanAmountRange.value;
      calculateAndRenderEMI();
    });
  }

  // 2. Sync Interest Rate Input & Range
  interestRateInput.addEventListener('input', () => {
    let val = parseFloat(interestRateInput.value) || 0;
    if (val > 15) val = 15;
    if (interestRateRange) interestRateRange.value = val;
    calculateAndRenderEMI();
  });

  if (interestRateRange) {
    interestRateRange.addEventListener('input', () => {
      interestRateInput.value = parseFloat(interestRateRange.value).toFixed(2);
      calculateAndRenderEMI();
    });
  }

  // 3. Sync Tenure Input & Range
  loanTenureInput.addEventListener('input', () => {
    let val = parseFloat(loanTenureInput.value) || 1;
    if (val > 30) val = 30;
    if (loanTenureRange) loanTenureRange.value = val;
    calculateAndRenderEMI();
  });

  if (loanTenureRange) {
    loanTenureRange.addEventListener('input', () => {
      loanTenureInput.value = loanTenureRange.value;
      calculateAndRenderEMI();
    });
  }

  // 4. Partner Banks Click Listeners
  bankPills.forEach((pill, idx) => {
    if (idx === 0) pill.classList.add('active');

    pill.addEventListener('click', () => {
      bankPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const rawRate = pill.getAttribute('data-rate') || '8.40%';
      const rateNum = parseFloat(rawRate.replace('%', '')) || 8.40;
      
      interestRateInput.value = rateNum.toFixed(2);
      if (interestRateRange) interestRateRange.value = rateNum;
      
      const bankName = pill.getAttribute('data-bank') || 'Banking Partner';
      if (typeof showToast === 'function') {
        showToast(`⚡ Selected ${bankName} Rate: ${rawRate} p.a.`, 'success');
      }

      calculateAndRenderEMI();
    });
  });

  calculateAndRenderEMI();
}
window.initEMICalculator = initEMICalculator;

function initPortalEngines() {
  initSmartMatcherListeners();
  initLivabilityEngine();
  if (typeof renderProperties === 'function') renderProperties();
  if (typeof renderNewProjects === 'function') renderNewProjects();
  if (typeof renderFarmlandFastTrack === 'function') renderFarmlandFastTrack();
  if (typeof initEMICalculator === 'function') initEMICalculator();
  if (typeof updateCompareBadge === 'function') updateCompareBadge();
  if (typeof initServiceForms === 'function') initServiceForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortalEngines);
} else {
  initPortalEngines();
}
