const fs = require('fs');
const path = require('path');

const filePaths = [
    path.join(__dirname, 'dashboard.html'),
    path.join(__dirname, 'public', 'dashboard.html')
];

// Content blocks
const sidebarBlock = `
        <!-- Item 8: Customer Reviews -->
        <button class="nav-item-btn" data-tab="reviews" type="button" onclick="switchAdminTab('reviews')">
          <div class="nav-left">
            <span class="nav-icon">⭐</span>
            <span>Customer Reviews</span>
          </div>
          <span class="pill-badge pill-badge-blue" id="badge-reviews-count">0</span>
        </button>
`;

const tabContentBlock = `
      <!-- TAB 8: CUSTOMER REVIEWS -->
      <section class="page-tab-content" id="tab-reviews">
        <div class="content-header-row">
          <div class="content-header-title">
            <h2>Customer Reviews &amp; Testimonials</h2>
            <p>Manage ratings, feedback and testimonials displayed on the public website</p>
          </div>
          <div class="header-btn-actions">
            <button class="btn-primary-action" onclick="openAddReviewModal()">
              <span>➕ Add Review</span>
            </button>
          </div>
        </div>

        <div class="table-container" style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">⭐</span> Platform Reviews &amp; Ratings
            </div>
            <div style="font-size: 0.8rem; color: #64748B;">
              Total Reviews: <strong id="reviews-count-badge" style="color: #0f172a;">0</strong>
            </div>
          </div>
          
          <div class="table-responsive" style="overflow-x: auto;">
            <table class="data-table admin-data-table" id="table-reviews" style="width: 100%; border-collapse: collapse; min-width: 800px;">
              <thead>
                <tr>
                  <th style="padding: 14px 18px; text-align: left; font-size: 0.76rem; font-weight: 700; color: #64748B; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; width: 20%;">CUSTOMER DETAILS</th>
                  <th style="padding: 14px 14px; text-align: left; font-size: 0.76rem; font-weight: 700; color: #64748B; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; width: 10%;">RATING</th>
                  <th style="padding: 14px 14px; text-align: left; font-size: 0.76rem; font-weight: 700; color: #64748B; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; width: 45%;">REVIEW TEXT</th>
                  <th style="padding: 14px 14px; text-align: left; font-size: 0.76rem; font-weight: 700; color: #64748B; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; width: 10%;">DATE</th>
                  <th style="padding: 14px 18px; text-align: right; font-size: 0.76rem; font-weight: 700; color: #64748B; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; width: 15%;">ACTIONS</th>
                </tr>
              </thead>
              <tbody id="tbody-reviews">
                <!-- Dynamically populated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>
`;

const modalBlock = `
  <!-- REVIEW EDIT / ADD MODAL -->
  <div class="admin-modal-overlay" id="reviewModal">
    <div class="admin-modal-card" style="max-width: 500px; max-height: 90vh; overflow-y: auto; box-sizing: border-box;">
      <div class="admin-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px;">
        <h3 id="reviewModalTitle" style="margin: 0; color: #0f172a; font-size: 1.15rem; font-weight: 700;">⭐ Add Review</h3>
        <button type="button" class="modal-close-btn" onclick="closeReviewModal()" style="border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
      <form id="form-review" onsubmit="handleReviewSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
        <input type="hidden" id="review-id" />
        
        <div>
          <label for="review-customer" style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">Customer Name *</label>
          <input type="text" id="review-customer" required placeholder="e.g. John Doe" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13.5px; box-sizing: border-box;" />
        </div>
        
        <div>
          <label for="review-rating" style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">Rating (1 to 5) *</label>
          <select id="review-rating" required style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13.5px; box-sizing: border-box; background: #fff;">
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>

        <div>
          <label for="review-text" style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">Review Comments *</label>
          <textarea id="review-text" required rows="4" placeholder="Enter customer feedback..." style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13.5px; box-sizing: border-box; resize: vertical;"></textarea>
        </div>
        
        <div>
          <label for="review-date" style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px;">Date *</label>
          <input type="date" id="review-date" required style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13.5px; box-sizing: border-box;" />
        </div>

        <div style="margin-top: 8px; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" onclick="closeReviewModal()" style="padding: 10px 20px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; color: #475569; font-weight: 600; cursor: pointer; font-size: 13.5px;">Cancel</button>
          <button type="submit" style="padding: 10px 20px; border-radius: 8px; border: none; background: #0f172a; color: #fff; font-weight: 600; cursor: pointer; font-size: 13.5px;">Save Review</button>
        </div>
      </form>
    </div>
  </div>
`;

const jsBlock = `
    // --------------------------------------------------------------------------
    // 8. RENDER REVIEWS MODULE
    // --------------------------------------------------------------------------
    function renderReviewsModule() {
      const tbody = document.getElementById('tbody-reviews');
      if (!tbody) return;
      const items = getStoredData('lb_reviews_data') || [];

      const countBadge = document.getElementById('badge-reviews-count');
      const tableCount = document.getElementById('reviews-count-badge');
      if (countBadge) countBadge.textContent = items.length;
      if (tableCount) tableCount.textContent = items.length;

      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 48px; color: #94A3B8; font-size: 14px;">⭐ No reviews added yet. Click \\'Add Review\\' to add one.</td></tr>';
        return;
      }

      tbody.innerHTML = items.map(item => \`
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 16px 18px; vertical-align: middle;">
            <div style="font-weight: 700; color: #0f172a; font-size: 14px;">\${item.customerName}</div>
          </td>
          <td style="padding: 16px 14px; vertical-align: middle;">
            <div style="color: #fbbf24; font-size: 14px;">\${'★'.repeat(item.rating)}\${'☆'.repeat(5 - item.rating)}</div>
          </td>
          <td style="padding: 16px 14px; vertical-align: middle;">
            <div style="font-size: 13px; color: #475569; max-width: 400px; white-space: normal;">\${item.text}</div>
          </td>
          <td style="padding: 16px 14px; vertical-align: middle;">
            <div style="font-size: 12.5px; color: #64748B;">\${item.date}</div>
          </td>
          <td style="padding: 16px 18px; text-align: right; vertical-align: middle;">
            <button class="btn-table-action rose" style="padding: 5px 12px; font-size: 12.5px; border-radius: 6px; cursor: pointer; white-space: nowrap;" onclick="deleteReview('\${item.id}')">Delete</button>
          </td>
        </tr>
      \`).join('');
    }
    window.renderReviewsModule = renderReviewsModule;

    function openAddReviewModal() {
      const form = document.getElementById('form-review');
      if (form) form.reset();
      document.getElementById('review-id').value = '';
      document.getElementById('review-date').valueAsDate = new Date();
      
      const m = document.getElementById('reviewModal');
      if (m) {
        m.style.removeProperty('display');
        m.style.setProperty('display', 'flex', 'important');
        m.classList.add('open');
      }
    }
    window.openAddReviewModal = openAddReviewModal;

    function closeReviewModal() {
      const m = document.getElementById('reviewModal');
      if (m) {
        m.classList.remove('open');
        m.style.setProperty('display', 'none', 'important');
      }
    }
    window.closeReviewModal = closeReviewModal;

    function handleReviewSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('review-id').value || 'rev-' + Date.now();
      const newReview = {
        id,
        customerName: document.getElementById('review-customer').value,
        rating: parseInt(document.getElementById('review-rating').value, 10),
        text: document.getElementById('review-text').value,
        date: document.getElementById('review-date').value
      };
      
      let reviews = getStoredData('lb_reviews_data') || [];
      const idx = reviews.findIndex(r => r.id === id);
      if (idx > -1) reviews[idx] = newReview;
      else reviews.unshift(newReview);
      
      setStoredData('lb_reviews_data', reviews);
      closeReviewModal();
      renderReviewsModule();
      showAdminToast('⭐ Review saved successfully!');
    }
    window.handleReviewSubmit = handleReviewSubmit;

    function deleteReview(id) {
      if (!confirm('Are you sure you want to delete this review?')) return;
      let reviews = getStoredData('lb_reviews_data') || [];
      reviews = reviews.filter(r => r.id !== id);
      setStoredData('lb_reviews_data', reviews);
      renderReviewsModule();
      showAdminToast('🗑️ Review deleted!');
    }
    window.deleteReview = deleteReview;
`;

for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', filePath);
        continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Sidebar menu
    if (!content.includes('data-tab="reviews"')) {
        const sidebarRegex = /(<button class="nav-item-btn" data-tab="grihapravesh"[\s\S]*?<\/button>)/;
        content = content.replace(sidebarRegex, "$1\n" + sidebarBlock);
    }

    // 2. Tab Content
    if (!content.includes('id="tab-reviews"')) {
        const tabEndRegex = /(<section class="page-tab-content" id="tab-grihapravesh">[\s\S]*?<\/section>)/;
        content = content.replace(tabEndRegex, "$1\n" + tabContentBlock);
    }
    
    // 3. Modal
    if (!content.includes('id="reviewModal"')) {
        const poojaModalRegex = /(<!-- ADD POOJA MODAL -->[\s\S]*?<\/div>\s*<\/div>)/;
        content = content.replace(poojaModalRegex, "$1\n" + modalBlock);
    }

    // 4. JS Logic
    if (!content.includes('function renderReviewsModule()')) {
        const renderGrihaPraveshRegex = /(function renderGrihaPraveshModule\(\) {[\s\S]*?}\s*window.renderGrihaPraveshModule = renderGrihaPraveshModule;\s*)/;
        content = content.replace(renderGrihaPraveshRegex, "$1\n" + jsBlock);
    }

    // 5. switchAdminTab
    if (!content.includes("else if (tabName === 'reviews') renderReviewsModule();")) {
        const switchTabRegex = /(else if \(tabName === 'grihapravesh'\) renderGrihaPraveshModule\(\);)/;
        content = content.replace(switchTabRegex, "$1\n      else if (tabName === 'reviews') renderReviewsModule();");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated', filePath);
}
