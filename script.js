// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const panel = document.querySelector('.mobile-panel');
  if (hamburger && panel) {
    hamburger.addEventListener('click', () => {
      panel.classList.toggle('open');
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Count-up stats
  const stats = document.querySelectorAll('.stat .num[data-target]');
  if ('IntersectionObserver' in window && stats.length) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(el => statIO.observe(el));
  } else {
    stats.forEach(el => animateCount(el));
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Product category browser
  const catNavBtns = document.querySelectorAll('.cat-nav button');
  const catTiles = document.querySelectorAll('.cat-tile');
  const searchInput = document.getElementById('cat-search');
  const resultCount = document.getElementById('result-count');
  let activeFilter = 'all';

  function applyFilters() {
    const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    let visible = 0;
    catTiles.forEach(tile => {
      const matchesFilter = activeFilter === 'all' || tile.getAttribute('data-cat') === activeFilter;
      const matchesSearch = !query || tile.getAttribute('data-name').toLowerCase().includes(query);
      const show = matchesFilter && matchesSearch;
      tile.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    if (resultCount) {
      resultCount.textContent = visible + (visible === 1 ? ' Category' : ' Categories');
    }
  }

  if (catNavBtns.length) {
    catNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catNavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        applyFilters();
      });
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Simple form handler
  const form = document.querySelector('.quote-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name').value.trim();
      const company = form.querySelector('#company').value.trim();
      const need = form.querySelector('#need').value.trim();
      const subject = `Quote Request — ${name}${company ? ' / ' + company : ''}`;
      const body = `Name: ${name}\nCompany: ${company}\n\nWhat's needed:\n${need}`;
      window.location.href = `mailto:sales@harrisea.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  // ACCORDION FAQ
  const faqQuestions = document.querySelectorAll('.faq-q');
  if (faqQuestions.length) {
    faqQuestions.forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        document.querySelectorAll('.faq-item').forEach(otherItem => {
          if (otherItem !== item) otherItem.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    });
  }

  // ==========================================
  // INQUIRY CART SYSTEM (LocalStorage & Modal)
  // ==========================================
  let inquiryList = JSON.parse(localStorage.getItem('inquiryList')) || [];
  const navCartCount = document.getElementById('navCartCount');
  
  let currentModalItem = null;
  let currentModalCode = null;
  let currentModalPack = null;
  let currentModalCat = null;

  function updateCartCounter() {
    if (navCartCount) {
      navCartCount.textContent = inquiryList.length;
      if (inquiryList.length > 0) {
        navCartCount.style.display = 'flex';
      } else {
        navCartCount.style.display = 'none';
      }
    }
  }

  // IMAGE MODAL ELEMENTS (Advanced)
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalClose = document.querySelector(".modal-close");
  const modalAddBtn = document.getElementById("modalAddBtn");
  const modalRemoveBtn = document.getElementById("modalRemoveBtn");
  const modalTitle = document.getElementById("modalTitle");
  const modalCode = document.getElementById("modalCode");
  const modalPack = document.getElementById("modalPack");
  const modalCat = document.getElementById("modalCat");
  const qtyInput = document.getElementById("qtyInput");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const modalRelatedGrid = document.getElementById('modalRelatedGrid');
  
  // SIMPLE MODAL ELEMENTS (Basic)
  const simpleModal = document.getElementById("simpleModal");
  const simpleImg = document.getElementById("simpleImg");
  const simpleClose = document.querySelector(".simple-modal-close");

  const productImages = document.querySelectorAll('.cat-tile .ph-image img');

  // Function to open Advanced modal and populate data
  function openProductModal(tile) {
    currentModalItem = tile.getAttribute('data-name');
    currentModalCode = tile.getAttribute('data-code') || 'N/A';
    currentModalPack = tile.getAttribute('data-pack') || 'N/A';
    currentModalCat = tile.getAttribute('data-cat') || 'N/A';
    
    const img = tile.querySelector('img');
    
    modal.style.display = "flex";
    modalImg.src = img.src;
    modalTitle.textContent = currentModalItem;
    modalCode.textContent = currentModalCode;
    modalPack.textContent = currentModalPack;
    modalCat.textContent = currentModalCat;
    qtyInput.value = 1; 
    
    const exists = inquiryList.some(i => i.name === currentModalItem);
    if (exists) {
      modalAddBtn.textContent = 'Update Quantity';
      modalAddBtn.classList.add('added');
      modalRemoveBtn.style.display = 'inline-flex';
    } else {
      modalAddBtn.textContent = 'Add to Inquiry List';
      modalAddBtn.classList.remove('added');
      modalRemoveBtn.style.display = 'none';
    }

    renderFeaturedProducts(tile);
  }

  // Function to render the 4 related items
  function renderFeaturedProducts(currentTile) {
    if (!modalRelatedGrid) return;
    
    modalRelatedGrid.innerHTML = ''; 
    const currentCat = currentTile.getAttribute('data-cat');
    const currentName = currentTile.getAttribute('data-name');
    
    const relatedItems = Array.from(document.querySelectorAll('.cat-tile')).filter(t => {
      return t.getAttribute('data-cat') === currentCat && t.getAttribute('data-name') !== currentName;
    }).slice(0, 4);

    if (relatedItems.length > 0) {
      document.getElementById('modalRelatedWrap').style.display = 'block';
      relatedItems.forEach(item => {
        const itemImg = item.querySelector('img').src;
        const itemName = item.getAttribute('data-name');
        
        const div = document.createElement('div');
        div.className = 'related-item';
        div.innerHTML = `<img src="${itemImg}" alt="${itemName}"><span>${itemName}</span>`;
        
        div.addEventListener('click', () => {
          openProductModal(item);
        });
        
        modalRelatedGrid.appendChild(div);
      });
    } else {
      document.getElementById('modalRelatedWrap').style.display = 'none';
    }
  }

  // Attach click listeners to all product images
  if (productImages.length) {
    productImages.forEach(img => {
      img.style.cursor = 'pointer'; 
      img.addEventListener('click', () => {
        const tile = img.closest('.cat-tile');
        const category = tile.getAttribute('data-cat');

        // ONLY USE ADVANCED MODAL FOR SCRUBBING BRUSHES
        if (category === 'Scrubbing Brushes') {
          openProductModal(tile);
        } else {
          // USE SIMPLE MODAL FOR EVERYTHING ELSE
          simpleModal.style.display = "flex";
          simpleImg.src = img.src;
        }
      });
    });
  }

  // Advanced Modal Listeners
  if (modalClose) {
    modalClose.addEventListener('click', () => { modal.style.display = "none"; });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.style.display = "none"; }
    });
  }

  // Simple Modal Listeners
  if (simpleClose) {
    simpleClose.addEventListener('click', () => { simpleModal.style.display = "none"; });
  }
  if (simpleModal) {
    simpleModal.addEventListener('click', (e) => {
      if (e.target === simpleModal) { simpleModal.style.display = "none"; }
    });
  }

  // Quantity Listeners
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });
  }
  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      qtyInput.value = val + 1;
    });
  }

  // Handle "Add to Inquiry" click
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      if (currentModalItem) {
        const qty = parseInt(qtyInput.value) || 1;
        const itemObj = { name: currentModalItem, code: currentModalCode, pack: currentModalPack, qty: qty };
        
        const existingIndex = inquiryList.findIndex(i => i.name === currentModalItem);
        if (existingIndex > -1) {
          inquiryList[existingIndex].qty = qty; 
          modalAddBtn.textContent = '✓ Quantity Updated!';
        } else {
          inquiryList.push(itemObj);
          modalAddBtn.textContent = '✓ Added to List';
          modalAddBtn.classList.add('added');
        }
        
        modalRemoveBtn.style.display = 'inline-flex'; 
        localStorage.setItem('inquiryList', JSON.stringify(inquiryList));
        updateCartCounter();
      }
    });
  }

  // Handle "Remove from List" click
  if (modalRemoveBtn) {
    modalRemoveBtn.addEventListener('click', () => {
      if (currentModalItem) {
        inquiryList = inquiryList.filter(i => i.name !== currentModalItem);
        localStorage.setItem('inquiryList', JSON.stringify(inquiryList));
        updateCartCounter();
        
        modalAddBtn.textContent = 'Add to Inquiry List';
        modalAddBtn.classList.remove('added');
        modalRemoveBtn.style.display = 'none';
      }
    });
  }

  updateCartCounter();

  const needTextarea = document.getElementById('need');
  if (needTextarea && inquiryList.length > 0) {
    let formText = "I would like to inquire about the following items:\n\n";
    inquiryList.forEach(item => {
      formText += `- ${item.qty} x ${item.name} (Code: ${item.code}, Pack: ${item.pack})\n`;
    });
    formText += "\nPlease provide pricing and availability. Thank you.";
    needTextarea.value = formText;
  }

});