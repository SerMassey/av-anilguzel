document.addEventListener("DOMContentLoaded", function() {
    // 1. Navbar'ı yükle
    fetch('/navbar.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        })
        .catch(error => console.error("Navbar yüklenirken hata:", error));

    // 2. Footer'ı yükle
    fetch('/footer.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        })
        .catch(error => console.error("Footer yüklenirken hata:", error));
});

// Menüyü Açma Fonksiyonu (Global)
window.showMenu = function() {
    const nav = document.getElementById("navLinks");
    if (nav) {
        nav.classList.add("active");
    }
};

// Menüyü Kapatma Fonksiyonu (Global)
window.hideMenu = function() {
    const nav = document.getElementById("navLinks");
    if (nav) {
        nav.classList.remove("active");
    }
};

// GitHub Git Trees API kullanarak optimize edilmiş veri ve sayaç yükleyici (Lokal/Statik Uyumlu)
async function loadBlogDataAndCounts() {
    const blogListContainer = document.getElementById("blog-list-container");
    const repoOwner = "SerMassey"; 
    const repoName = "av-anilguzel"; 
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/main?recursive=1`;

    try {
        const response = await fetch(apiUrl + `&t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('GitHub verileri alınamadı.');
        
        const data = await response.json();
        const postFiles = data.tree.filter(item => item.path.startsWith('_posts/') && item.path.endsWith('.md'));

        if (postFiles.length === 0) {
            if (blogListContainer) {
                blogListContainer.innerHTML = '<p style="padding: 20px; color: #666;">Henüz makale yayınlanmadı.</p>';
            }
            return;
        }

        // Yeni etiket listene göre sayaç nesnesi
        let counts = {
            "ceza": 0,
            "gayrimenkul": 0,
            "is": 0,
            "aile": 0,
            "yabancilar": 0,
            "miras": 0,
            "sirketler": 0,
            "ticaret": 0,
            "sozlesmeler": 0,
            "genel": 0
        };

        if (blogListContainer) {
            blogListContainer.innerHTML = '';
        }

        for (let file of postFiles) {
            const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${file.path}?t=${new Date().getTime()}`;
            const fileRes = await fetch(rawUrl);
            const markdownText = await fileRes.text();

            const titleMatch = markdownText.match(/title:\s*"?(.*?)"?$/m);
            const dateMatch = markdownText.match(/date:\s*"?(.*?)"?$/m);
            const tagMatch = markdownText.match(/tag:\s*"?(.*?)"?$/m);
            const descMatch = markdownText.match(/description:\s*"?(.*?)"?$/m);
            
            const title = titleMatch ? titleMatch[1] : 'Başlıksız Makale';
            const rawDate = dateMatch ? dateMatch[1] : '';
            const tag = tagMatch ? tagMatch[1].trim() : '';
            const description = descMatch ? descMatch[1] : 'Bilgilendirme yazımızın detayları için tıklayın.';

            let formattedDate = rawDate;
            if (rawDate) {
                const dateObj = new Date(rawDate);
                if (!isNaN(dateObj)) {
                    formattedDate = dateObj.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                }
            }

            // Yeni etiketlere göre sayaç artırımları
            if (tag.includes("Ceza")) counts.ceza++;
            if (tag.includes("Gayrimenkul ve Kira")) counts.gayrimenkul++;
            if (tag.includes("İş")) counts.is++;
            if (tag.includes("Aile")) counts.aile++;
            if (tag.includes("Yabancılar")) counts.yabancilar++;
            if (tag.includes("Miras")) counts.miras++;
            if (tag.includes("Şirketler")) counts.sirketler++;
            if (tag.includes("Ticaret")) counts.ticaret++;
            if (tag.includes("Sözleşmeler")) counts.sozlesmeler++;
            if (tag.includes("Genel")) counts.genel++;

            if (blogListContainer) {
                let categorySlug = "genel";
                if (tag.includes("Ceza")) categorySlug = "ceza";
                else if (tag.includes("Gayrimenkul ve Kira")) categorySlug = "gayrimenkul";
                else if (tag.includes("İş")) categorySlug = "is";
                else if (tag.includes("Aile")) categorySlug = "aile";
                else if (tag.includes("Yabancılar")) categorySlug = "yabancilar";
                else if (tag.includes("Miras")) categorySlug = "miras";
                else if (tag.includes("Şirketler")) categorySlug = "sirketler";
                else if (tag.includes("Ticaret")) categorySlug = "ticaret";
                else if (tag.includes("Sözleşmeler")) categorySlug = "sozlesmeler";

                // Dosya adını URL uyumlu hale getirme
                const fileNameClean = file.path.replace('_posts/', '').replace('.md', '');
                const articleUrl = `makaleler/${fileNameClean}.html`;

                const article = document.createElement('article');
                article.className = 'blog-card';
                article.setAttribute('data-category', categorySlug);

                article.innerHTML = `
                    <div class="blog-content">
                        <span class="blog-date">${formattedDate}</span>
                        <h2><a href="${articleUrl}">${title}</a></h2>
                        <p>${description}</p>
                        <a href="${articleUrl}" class="read-more">Devamını Oku →</a>
                    </div>
                `;
                blogListContainer.appendChild(article);
            }
        }

        const updateCountEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = `(${val})`;
            }
        };

        // HTML tarafındaki sayaç id'lerinin bu slug'larla eşleştiğinden emin ol (örn: id="count-ceza", id="count-is" vb.)
        updateCountEl("count-ceza", counts.ceza);
        updateCountEl("count-gayrimenkul", counts.gayrimenkul);
        updateCountEl("count-is", counts.is);
        updateCountEl("count-aile", counts.aile);
        updateCountEl("count-yabancilar", counts.yabancilar);
        updateCountEl("count-miras", counts.miras);
        updateCountEl("count-sirketler", counts.sirketler);
        updateCountEl("count-ticaret", counts.ticaret);
        updateCountEl("count-sozlesmeler", counts.sozlesmeler);
        updateCountEl("count-genel", counts.genel);

    } catch (error) {
        console.error('Hata:', error);
        if (blogListContainer) {
            blogListContainer.innerHTML = '<p style="padding: 20px; color: #666;">Makaleler yüklenirken bir hata oluştu.</p>';
        }
    }
}

// Global Kategori Filtreleme Olayları
document.addEventListener('click', function(e) {
    // 1. Kategorilere Tıklandığında
    if (e.target.matches('.category-link') || e.target.closest('.category-link')) {
        e.preventDefault();
        const link = e.target.closest('.category-link');
        const selectedCategory = link.getAttribute('data-filter');
        const categoryName = link.textContent.replace(/\s*\(\d+\)/, '').trim();

        document.querySelectorAll('.category-link').forEach(el => el.classList.remove('active'));
        link.classList.add('active');

        filterCards(selectedCategory);
        showActiveFilterBox(categoryName, selectedCategory);
    }

    // 2. Filtre kutusundaki çarpı (×) butonuna tıklandığında
    if (e.target.matches('#clear-filter-btn') || e.target.closest('#clear-filter-btn')) {
        e.preventDefault();
        document.querySelectorAll('.category-link').forEach(el => el.classList.remove('active'));
        const allLink = document.querySelector('.category-link[data-filter="all"]');
        if (allLink) allLink.classList.add('active');

        filterCards('all');
        hideActiveFilterBox();
    }
});

// Kartları filtreleyen yardımcı fonksiyon
function filterCards(selectedCategory) {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filtre kutusunu gösteren fonksiyon
function showActiveFilterBox(name, slug) {
    const box = document.getElementById('active-filter-box');
    const textSpan = document.getElementById('filter-text');
    if (box && textSpan) {
        if (slug === 'all') {
            box.style.display = 'none';
        } else {
            textSpan.innerHTML = `Filtrelenen: <strong>${name}</strong>`;
            box.style.display = 'flex';
        }
    }
}

// Filtre kutusunu gizleyen fonksiyon
function hideActiveFilterBox() {
    const box = document.getElementById('active-filter-box');
    if (box) {
        box.style.display = 'none';
    }
}

// Anasayfa FAQ bölümündeki akordeon
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const answer = item.querySelector('.faq-answer');
        const isActive = item.classList.contains('active');

        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            item.classList.remove('active');
            answer.style.maxHeight = null;
        }
    });
});

// ANASAYFADAKİ PROSES SEKMESİ
document.addEventListener("DOMContentLoaded", function () {
    const timelineSection = document.querySelector(".process-timeline-section");
    const progressBar = document.getElementById("timelineProgress");
    const stepCards = document.querySelectorAll(".timeline-step-card");

    if (!timelineSection || !progressBar) return;

    window.addEventListener("scroll", function () {
        const rect = timelineSection.getBoundingClientRect();
        const sectionHeight = timelineSection.offsetHeight;
        const windowHeight = window.innerHeight;

        let distanceScrolled = windowHeight - rect.top - 100;
        let percentage = (distanceScrolled / sectionHeight) * 110;

        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;

        progressBar.style.height = percentage + "%";

        stepCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            
            if (cardRect.top < windowHeight * 0.65) {
                card.classList.add("active");
                
                const nextCard = stepCards[index + 1];
                if (nextCard) {
                    const nextRect = nextCard.getBoundingClientRect();
                    if (nextRect.top < windowHeight * 0.35) {
                        card.classList.add("stacked");
                    } else {
                        card.classList.remove("stacked");
                    }
                }
            } else {
                card.classList.remove("active");
                card.classList.remove("stacked");
            }
        });
    });
});

// Dosya Klasör Sekmeleri Mantığı
document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll(".folder-tab");
    const contents = document.querySelectorAll(".folder-content");
    const tabsNav = document.getElementById("tabsNav");

    if (tabsNav) {
        tabsNav.classList.add("row-1-active");
    }

    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                contents.forEach(c => c.classList.remove("active"));

                tab.classList.add("active");
                
                const parentRow = tab.closest(".folder-row");
                if (parentRow && tabsNav) {
                    const rowNumber = parentRow.getAttribute("data-row");
                    
                    tabsNav.classList.remove("row-1-active", "row-2-active");
                    if (rowNumber === "1") {
                        tabsNav.classList.add("row-1-active");
                    } else {
                        tabsNav.classList.add("row-2-active");
                    }
                }

                const targetId = tab.getAttribute("data-target");
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add("active");
                }
            });
        });
    }
});

/* ====================================================================
 * ÇEREZ İZNİ + GOOGLE ANALYTICS 4  (main.js'ye yapıştırın)
 * - GA4, kullanıcı "Kabul Et" demeden HİÇ yüklenmez.
 * - Reddet ve Kabul Et butonları eşit görünürlüktedir.
 * - Footer'daki [data-cookie-settings] linki ile tercih sonradan değiştirilebilir.
 * - Onay 12 ay sonra veya VERSION değişince yeniden istenir.
 * ==================================================================== */
(function () {
  "use strict";

  // ====== AYARLAR ======
  var GA_ID = "G-RF3SR2GJ3C";
  var POLICY_URL = "/cerez-politikasi.html";
  var STORAGE_KEY = "cookieConsent";
  var VERSION = 1;          // politika değişirse artırın, herkese tekrar sorulur
  var MAX_AGE_DAYS = 365;
  // =====================

  var gaLoaded = false;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || c.version !== VERSION) return null;
      if (Date.now() - c.ts > MAX_AGE_DAYS * 86400000) return null;
      return c;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(status) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ status: status, version: VERSION, ts: Date.now() })
      );
    } catch (e) {}
  }

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  function removeTrackingCookies() {
    var host = location.hostname;
    var parts = host.split(".");
    var domains = [host, "." + host];
    if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));
    document.cookie.split(";").forEach(function (c) {
      var name = c.trim().split("=")[0];
      if (/^(_ga|_gid|_gat|_gcl_)/.test(name)) {
        var expire = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = expire;
        domains.forEach(function (d) {
          document.cookie = expire + "; domain=" + d;
        });
      }
    });
  }

  function injectStyles() {
    if (document.getElementById("cc-styles")) return;
    var css =
      "#cc-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:640px;margin:0 auto;" +
      "background:#1a1a1a;color:#fff;padding:20px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.3);" +
      "z-index:9999;font-family:inherit;font-size:.92rem;line-height:1.5}" +
      "#cc-banner p{margin:0 0 14px}" +
      "#cc-banner a{color:#7bbcff;text-decoration:underline}" +
      "#cc-banner .cc-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}" +
      "#cc-banner button{padding:10px 20px;border-radius:4px;border:1px solid #fff;" +
      "background:transparent;color:#fff;cursor:pointer;font-size:.9rem;font-weight:600}" +
      "#cc-banner button:hover{background:#fff;color:#1a1a1a}" +
      "#cc-banner button:focus-visible{outline:3px solid #7bbcff;outline-offset:2px}";
    var style = document.createElement("style");
    style.id = "cc-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function closeBanner() {
    var b = document.getElementById("cc-banner");
    if (b) b.remove();
  }

  function showBanner() {
    if (document.getElementById("cc-banner")) return;
    injectStyles();

    var banner = document.createElement("div");
    banner.id = "cc-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Çerez tercihleri");
    banner.innerHTML =
      "<p>Sitemizde ziyaretçi istatistiklerini ölçmek ve hizmetimizi iyileştirmek amacıyla " +
      "analiz çerezleri kullanılmaktadır. Bu çerezler yalnızca onayınızla etkinleştirilir. " +
      'Ayrıntılar için <a href="' + POLICY_URL + '">Çerez Politikası</a>\'nı inceleyebilirsiniz.</p>' +
      '<div class="cc-actions">' +
      '<button type="button" id="cc-reject">Reddet</button>' +
      '<button type="button" id="cc-accept">Kabul Et</button>' +
      "</div>";
    document.body.appendChild(banner);

    document.getElementById("cc-accept").addEventListener("click", function () {
      saveConsent("accepted");
      closeBanner();
      loadGA();
    });

    document.getElementById("cc-reject").addEventListener("click", function () {
      var wasLoaded = gaLoaded;
      saveConsent("rejected");
      closeBanner();
      removeTrackingCookies();
      // GA bu sayfada zaten yüklendiyse tamamen durdurmanın yolu sayfayı yenilemek
      if (wasLoaded) location.reload();
    });
  }

  // Footer'daki "Çerez Tercihleri" linki için
  window.openCookieSettings = function () {
    showBanner();
  };

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cookie-settings]");
    if (t) {
      e.preventDefault();
      showBanner();
    }
  });

  function init() {
    var consent = readConsent();
    if (!consent) {
      showBanner();
    } else if (consent.status === "accepted") {
      loadGA();
    } else {
      removeTrackingCookies(); // önceki ziyaretten kalan çerez varsa temizle
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// Hukuki rehber sekmeleri
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.guide-tab-btn');
    const guidePanes = document.querySelectorAll('.guide-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif sınıfı butonlardan kaldır
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Tıklanan butona aktif sınıfı ekle
            button.classList.add('active');

            // Hedef paneli bul
            const targetId = button.getAttribute('data-guide');
            
            // Tüm panelleri gizle
            guidePanes.forEach(pane => pane.classList.remove('active'));
            
            // Hedef paneli göster
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
});