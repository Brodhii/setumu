/**
 * js/validation.js
 * Frontend rating — berkomunikasi dengan api/rating.php (PHP + SQLite)
 */

(function () {
  'use strict';

  const API  = 'api/rating.php';
  let selectedStar = 0;

  /* ── Init ──────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initStarPicker();
    initForm();
    initCharCount();
    loadRating();
  });

  /* ── Load data dari server ─────────────────────────────────────────────── */
  function loadRating() {
    if (window.location.protocol === 'file:') {
      document.getElementById('reviewList').innerHTML =
        '<p class="no-review" style="color: #856404; background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; text-align: center;">' +
        '<i class="fas fa-exclamation-triangle"></i> Sistem ulasan tidak dapat dimuat melalui <code>file://</code>.<br>' +
        'Silakan buka lewat server lokal di alamat: <a href="http://localhost/setumu-php/" target="_blank" style="text-decoration: underline; font-weight: bold; color: #1a2238;">http://localhost/setumu-php/</a>' +
        '</p>';
      return;
    }
    fetch(API)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          renderSummary(data.stats);
          renderReviews(data.reviews);
        }
      })
      .catch(function () {
        document.getElementById('reviewList').innerHTML =
          '<p class="no-review"><i class="fas fa-exclamation-circle"></i> Gagal memuat ulasan. Pastikan server PHP aktif.</p>';
      });
  }

  /* ── Render ringkasan statistik ────────────────────────────────────────── */
  function renderSummary(stats) {
    document.getElementById('avgScore').textContent =
      stats.total > 0 ? stats.avg.toFixed(1) : '0.0';
    document.getElementById('avgLabel').textContent =
      stats.total > 0 ? stats.total + ' ulasan' : 'Belum ada ulasan';

    renderStarEl(document.getElementById('avgStars'), stats.avg);

    [1, 2, 3, 4, 5].forEach(function (n) {
      var pct = stats.total > 0 ? (stats.map[n] / stats.total) * 100 : 0;
      document.getElementById('bar' + n).style.width = pct.toFixed(1) + '%';
      document.getElementById('count' + n).textContent = stats.map[n];
    });
  }

  /* ── SVG Star Helpers ─────────────────────────────────────────────────── */
  function getSolidStarSVG(w, h, cls) {
    w = w || 16; h = h || 16; cls = cls || '';
    return '<svg class="star-icon ' + cls + '" viewBox="0 0 24 24" width="' + w + '" height="' + h + '" style="display: inline-block; vertical-align: middle;">' +
      '<path fill="#F5A623" d="M12 17.27 L18.18 21 L16.54 13.97 L22 9.24 L14.81 8.63 L12 2 L9.19 8.63 L2 9.24 L7.46 13.97 L5.82 21 Z"/>' +
      '</svg>';
  }

  function getEmptyStarSVG(w, h, cls) {
    w = w || 16; h = h || 16; cls = cls || '';
    return '<svg class="star-icon star-empty ' + cls + '" viewBox="0 0 24 24" width="' + w + '" height="' + h + '" style="display: inline-block; vertical-align: middle;">' +
      '<path fill="#d4dbe7" d="M12 17.27 L18.18 21 L16.54 13.97 L22 9.24 L14.81 8.63 L12 2 L9.19 8.63 L2 9.24 L7.46 13.97 L5.82 21 Z"/>' +
      '</svg>';
  }

  function getHalfStarSVG(w, h, cls) {
    w = w || 16; h = h || 16; cls = cls || '';
    var gradId = 'halfStarGrad-' + Math.random().toString(36).substr(2, 9);
    return '<svg class="star-icon ' + cls + '" viewBox="0 0 24 24" width="' + w + '" height="' + h + '" style="display: inline-block; vertical-align: middle;">' +
      '<defs>' +
        '<linearGradient id="' + gradId + '">' +
          '<stop offset="50%" stop-color="#F5A623"/>' +
          '<stop offset="50%" stop-color="#d4dbe7"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path fill="url(#' + gradId + ')" d="M12 17.27 L18.18 21 L16.54 13.97 L22 9.24 L14.81 8.63 L12 2 L9.19 8.63 L2 9.24 L7.46 13.97 L5.82 21 Z"/>' +
      '</svg>';
  }

  function renderStarEl(container, value) {
    container.innerHTML = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= Math.floor(value)) {
        container.innerHTML += getSolidStarSVG(18, 18);
      } else if (i - value < 1 && value % 1 >= 0.5) {
        container.innerHTML += getHalfStarSVG(18, 18);
      } else {
        container.innerHTML += getEmptyStarSVG(18, 18);
      }
    }
  }

  /* ── Render daftar ulasan ──────────────────────────────────────────────── */
  function renderReviews(reviews) {
    var list = document.getElementById('reviewList');
    if (!reviews || reviews.length === 0) {
      list.innerHTML = '<p class="no-review">Belum ada ulasan. Jadilah yang pertama!</p>';
      return;
    }
    list.innerHTML = reviews.map(function (r) {
      return '<div class="review-card">' +
        '<div class="review-avatar">' + esc(r.nama).charAt(0).toUpperCase() + '</div>' +
        '<div class="review-body">' +
          '<div class="review-header">' +
            '<strong>' + esc(r.nama) + '</strong>' +
            '<span class="review-date"><i class="far fa-calendar-alt"></i> ' + r.tanggal_formatted + '</span>' +
          '</div>' +
          '<div class="review-stars">' + starsHTML(r.bintang) + ' <span class="star-label">' + labelBintang(r.bintang) + '</span></div>' +
          '<p class="review-text">' + esc(r.komentar) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function starsHTML(val) {
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += i <= val ? getSolidStarSVG(14, 14) : getEmptyStarSVG(14, 14);
    }
    return h;
  }

  function labelBintang(n) {
    return ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][n] || '';
  }

  /* ── Star picker ───────────────────────────────────────────────────────── */
  function initStarPicker() {
    var stars = document.querySelectorAll('#starPicker .star-btn');
    stars.forEach(function (star) {
      star.addEventListener('mouseenter', function () { highlightStars(stars, +this.dataset.val); });
      star.addEventListener('mouseleave', function () { highlightStars(stars, selectedStar); });
      star.addEventListener('click', function () {
        selectedStar = +this.dataset.val;
        highlightStars(stars, selectedStar);
        clearErr('errStar');
        // update label
        document.getElementById('starLabel').textContent = labelBintang(selectedStar);
      });
    });
  }

  function highlightStars(stars, val) {
    stars.forEach(function (s, i) {
      if (i < val) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  /* ── Char count ────────────────────────────────────────────────────────── */
  function initCharCount() {
    var ta = document.getElementById('reviewKomentar');
    var cc = document.getElementById('charCount');
    ta.addEventListener('input', function () {
      var len = ta.value.length;
      cc.textContent = len + ' / 500';
      cc.style.color = len > 450 ? '#e53e3e' : '#9aa5b4';
    });
  }

  /* ── Form submit ───────────────────────────────────────────────────────── */
  function initForm() {
    document.getElementById('ratingForm').addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErr();

      var nama     = document.getElementById('reviewName').value.trim();
      var komentar = document.getElementById('reviewKomentar').value.trim();

      // validasi client-side (cepat, sebelum ke server)
      var ok = true;
      if (!nama) { setErr('errName', 'Nama tidak boleh kosong.'); ok = false; }
      else if (nama.length < 2) { setErr('errName', 'Nama minimal 2 karakter.'); ok = false; }
      else if (nama.length > 60) { setErr('errName', 'Nama maksimal 60 karakter.'); ok = false; }

      if (selectedStar === 0) { setErr('errStar', 'Silakan pilih rating bintang.'); ok = false; }

      if (!komentar) { setErr('errKomentar', 'Komentar tidak boleh kosong.'); ok = false; }
      else if (komentar.length < 10) { setErr('errKomentar', 'Komentar minimal 10 karakter.'); ok = false; }
      else if (komentar.length > 500) { setErr('errKomentar', 'Komentar maksimal 500 karakter.'); ok = false; }

      if (!ok) return;

      // kirim ke API
      var btn = document.getElementById('submitRating');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: nama, bintang: selectedStar, komentar: komentar }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Ulasan';

          if (data.success) {
            resetForm();
            showSuccess();
            loadRating(); // refresh tampilan
          } else if (data.errors) {
            // tampilkan error dari server
            if (data.errors.nama)     setErr('errName',     data.errors.nama);
            if (data.errors.bintang)  setErr('errStar',     data.errors.bintang);
            if (data.errors.komentar) setErr('errKomentar', data.errors.komentar);
          } else {
            alert(data.message || 'Terjadi kesalahan.');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Ulasan';
          alert('Gagal terhubung ke server. Pastikan PHP aktif.');
        });
    });
  }

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  function resetForm() {
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewKomentar').value = '';
    document.getElementById('charCount').textContent = '0 / 500';
    document.getElementById('starLabel').textContent = '';
    selectedStar = 0;
    document.querySelectorAll('#starPicker .star-btn').forEach(function (s) {
      s.classList.remove('active');
    });
    clearAllErr();
  }

  function showSuccess() {
    var el = document.getElementById('submitSuccess');
    el.style.display = 'flex';
    setTimeout(function () { el.style.display = 'none'; }, 5000);
  }

  function setErr(id, msg) { var e = document.getElementById(id); if (e) e.textContent = msg; }
  function clearErr(id)    { var e = document.getElementById(id); if (e) e.textContent = ''; }
  function clearAllErr()   { ['errName','errStar','errKomentar'].forEach(clearErr); }

  function esc(str) {
    return (str || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

})();
