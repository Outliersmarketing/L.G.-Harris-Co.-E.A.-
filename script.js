/* ============================================
   L.G. HARRIS & CO. — script.js
   Advanced Side-by-Side Product Popup for ALL categories
   ============================================ */

(function () {
  'use strict';

  /* ---------- MOBILE MENU ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (hamburger && mobilePanel) {
    hamburger.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- STATS COUNTER ---------- */
  var statsNums = document.querySelectorAll('.stat .num[data-target]');
  if (statsNums.length) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var current = 0;
        var step = Math.max(1, Math.ceil(target / 60));
        var timer = setInterval(function () {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current + suffix;
        }, 25);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    statsNums.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- INQUIRY LIST (CART) STORAGE ---------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('harrisInquiry') || '[]');
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem('harrisInquiry', JSON.stringify(cart));
    updateCartBadges();
  }
  function updateCartBadges() {
    var cart = getCart();
    var n = cart.length;
    var navCount = document.getElementById('navCartCount');
    var inquiryCount = document.getElementById('inquiryCount');
    if (navCount) navCount.textContent = n;
    if (inquiryCount) inquiryCount.textContent = n;
  }
  updateCartBadges();

  function cartIndexOf(name) {
    var cart = getCart();
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name) return i;
    }
    return -1;
  }

  /* ---------- PRODUCT TILES & FILTERING ---------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.cat-tile'));
  var catNavBtns = Array.prototype.slice.call(document.querySelectorAll('.cat-nav button'));
  var searchInput = document.getElementById('searchInput');
  var countNote = document.getElementById('countNote');
  var currentFilter = 'all';
  var currentSearch = '';

  function applyFilters() {
    var visible = 0;
    tiles.forEach(function (tile) {
      var cat = tile.getAttribute('data-cat') || '';
      var name = (tile.getAttribute('data-name') || '').toLowerCase();
      var code = (tile.getAttribute('data-code') || '').toLowerCase();
      var matchCat = (currentFilter === 'all' || cat === currentFilter);
      var matchSearch = (!currentSearch || name.indexOf(currentSearch) !== -1 || code.indexOf(currentSearch) !== -1);
      if (matchCat && matchSearch) {
        tile.classList.remove('hidden');
        visible++;
      } else {
        tile.classList.add('hidden');
      }
    });
    if (countNote) {
      if (currentFilter === 'all' && !currentSearch) {
        countNote.textContent = 'Showing all ' + visible + ' products';
      } else if (currentFilter !== 'all' && !currentSearch) {
        countNote.textContent = visible + ' product' + (visible !== 1 ? 's' : '') + ' in ' + currentFilter;
      } else {
        countNote.textContent = visible + ' product' + (visible !== 1 ? 's' : '') + ' found';
      }
    }
  }

  if (catNavBtns.length) {
    catNavBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        catNavBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentSearch = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  /* ---------- ADVANCED MODAL ---------- */
  var modal = document.getElementById('productModal');
  var modalImg = document.getElementById('modalImg');
  var modalTitle = document.getElementById('modalTitle');
  var modalCode = document.getElementById('modalCode');
  var modalPack = document.getElementById('modalPack');
  var modalCat = document.getElementById('modalCat');
  var qtyInput = document.getElementById('qtyInput');
  var qtyMinus = document.getElementById('qtyMinus');
  var qtyPlus = document.getElementById('qtyPlus');
  var modalAddBtn = document.getElementById('modalAddBtn');
  var modalRemoveBtn = document.getElementById('modalRemoveBtn');
  var modalProceedBtn = document.getElementById('modalProceedBtn');
  var relatedGrid = document.getElementById('relatedGrid');
  var modalRelated = document.getElementById('modalRelated');

  var currentTile = null;

  function openModal(tile) {
    currentTile = tile;
    var img = tile.querySelector('img');
    var name = tile.getAttribute('data-name') || '';
    var code = tile.getAttribute('data-code') || '';
    var pack = tile.getAttribute('data-pack') || '';
    var cat = tile.getAttribute('data-cat') || '';

    if (modalImg && img) {
      modalImg.src = img.src;
      modalImg.alt = name;
    }
    if (modalTitle) modalTitle.textContent = name;
    if (modalCode) modalCode.textContent = code;
    if (modalPack) modalPack.textContent = pack;
    if (modalCat) modalCat.textContent = cat;

    // Reset quantity
    if (qtyInput) qtyInput.value = '1';

    // Toggle Add/Remove based on cart
    updateModalButtons(name);

    // Show related products (same category, excluding current)
    showRelated(cat, name);

    // Show modal
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    currentTile = null;
  }

  function updateModalButtons(name) {
    var idx = cartIndexOf(name);
    if (modalAddBtn && modalRemoveBtn) {
      if (idx !== -1) {
        // Already in cart
        modalAddBtn.style.display = 'none';
        modalRemoveBtn.style.display = 'inline-flex';
        modalProceedBtn.style.display = 'inline-flex';
        if (qtyInput) qtyInput.value = getCart()[idx].qty;
      } else {
        modalAddBtn.style.display = 'inline-flex';
        modalRemoveBtn.style.display = 'none';
        modalProceedBtn.style.display = 'none';
      }
    }
  }

  function showRelated(cat, currentName) {
    if (!relatedGrid || !modalRelated) return;
    relatedGrid.innerHTML = '';
    var related = tiles.filter(function (t) {
      return t.getAttribute('data-cat') === cat && t.getAttribute('data-name') !== currentName;
    });
    // Shuffle and take 4
    related.sort(function () { return Math.random() - 0.5; });
    related = related.slice(0, 4);

    if (related.length === 0) {
      modalRelated.style.display = 'none';
      return;
    }
    modalRelated.style.display = 'block';

    related.forEach(function (t) {
      var img = t.querySelector('img');
      var name = t.getAttribute('data-name') || '';
      var div = document.createElement('div');
      div.className = 'related-item';
      div.innerHTML = '<img src="' + (img ? img.src : '') + '" alt="' + name + '"><span>' + name + '</span>';
      div.addEventListener('click', function () {
        openModal(t);
      });
      relatedGrid.appendChild(div);
    });
  }

  // Close handlers
  if (modal) {
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeModal();
  });

  // Quantity controls
  if (qtyMinus) {
    qtyMinus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = v - 1;
    });
  }
  if (qtyPlus) {
    qtyPlus.addEventListener('click', function () {
      var v = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = v + 1;
    });
  }
  if (qtyInput) {
    qtyInput.addEventListener('change', function () {
      var v = parseInt(qtyInput.value, 10);
      if (isNaN(v) || v < 1) qtyInput.value = '1';
    });
  }

  // Add to inquiry list
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', function () {
      if (!currentTile) return;
      var name = currentTile.getAttribute('data-name') || '';
      var code = currentTile.getAttribute('data-code') || '';
      var pack = currentTile.getAttribute('data-pack') || '';
      var cat = currentTile.getAttribute('data-cat') || '';
      var img = currentTile.querySelector('img');
      var qty = parseInt(qtyInput.value, 10) || 1;

      var cart = getCart();
      cart.push({
        name: name, code: code, pack: pack, cat: cat,
        img: img ? img.src : '', qty: qty
      });
      saveCart(cart);

      // Visual feedback
      modalAddBtn.classList.add('added');
      modalAddBtn.textContent = '✓ Added to Inquiry List';
      setTimeout(function () {
        updateModalButtons(name);
        modalAddBtn.classList.remove('added');
        modalAddBtn.textContent = 'Add to Inquiry List';
      }, 1200);
    });
  }

  // Remove from inquiry list
  if (modalRemoveBtn) {
    modalRemoveBtn.addEventListener('click', function () {
      if (!currentTile) return;
      var name = currentTile.getAttribute('data-name') || '';
      var cart = getCart();
      var idx = cartIndexOf(name);
      if (idx !== -1) {
        cart.splice(idx, 1);
        saveCart(cart);
      }
      updateModalButtons(name);
    });
  }

  // Proceed to contact
  if (modalProceedBtn) {
    modalProceedBtn.addEventListener('click', function () {
      // Update qty in cart before leaving
      if (currentTile) {
        var name = currentTile.getAttribute('data-name') || '';
        var idx = cartIndexOf(name);
        if (idx !== -1) {
          var cart = getCart();
          cart[idx].qty = parseInt(qtyInput.value, 10) || 1;
          saveCart(cart);
        }
      }
      closeModal();
      window.location.href = 'contact-us.html';
    });
  }

  /* ---------- TILE CLICK → OPEN MODAL ---------- */
  tiles.forEach(function (tile) {
    tile.style.cursor = 'pointer';
    tile.addEventListener('click', function () {
      openModal(tile);
    });
  });

  /* ---------- MEGA MENU URL PARAMETER FILTERING ---------- */
  var urlParams = new URLSearchParams(window.location.search);
  var categoryFilter = urlParams.get('category');
  if (categoryFilter && catNavBtns.length) {
    catNavBtns.forEach(function (btn) {
      if (btn.getAttribute('data-filter') === categoryFilter) {
        btn.click();
        // Scroll to product grid
        setTimeout(function () {
          var grid = document.querySelector('.browser-main');
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    });
  }

  /* ---------- CONTACT PAGE: AUTO-FILL INQUIRY LIST ---------- */
  var quoteForm = document.querySelector('.quote-form');
  if (quoteForm && document.body.getAttribute('data-page') === 'contact') {
    fillContactInquiry();
  }
  // Also check by looking for a message textarea
  var msgField = document.getElementById('message') || document.querySelector('textarea[name="message"]');
  if (msgField && getCart().length > 0 && !msgField.value) {
    fillContactInquiry();
  }

  function fillContactInquiry() {
    var cart = getCart();
    if (cart.length === 0) return;
    var textarea = document.querySelector('textarea') || msgField;
    if (!textarea) return;
    var lines = ['I would like to request a quote for the following items:', ''];
    cart.forEach(function (item, i) {
      lines.push((i + 1) + '. ' + item.name + ' (Code: ' + item.code + ', Pack: ' + item.pack + ') — Qty: ' + item.qty);
    });
    lines.push('', 'Please contact me with wholesale pricing. Thank you.');
    textarea.value = lines.join('\n');
  }

  /* ---------- INITIAL FILTER RUN ---------- */
  applyFilters();

})();
