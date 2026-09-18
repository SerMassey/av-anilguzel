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

    // 3. Blog verilerini ve sayaçları tek seferde yükle
    loadBlogDataAndCounts();
});

// Menüyü Açma Fonksiyonu (Global)
window.showMenu = function() {
    const nav = document.getElementById("navLinks");
    if (nav) {
        nav.classList.add("aktif");
    }
};

// Menüyü Kapatma Fonksiyonu (Global)
window.hideMenu = function() {
    const nav = document.getElementById("navLinks");
    if (nav) {
        nav.classList.remove("aktif");
    }
};

// GitHub Git Trees API kullanarak optimize edilmiş veri ve sayaç yükleyici
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
                blogListContainer.innerHTML = '<p>Henüz makale yayınlanmadı.</p>';
            }
            return;
        }

        let counts = {
            "is-hukuku": 0,
            "gayrimenkul": 0,
            "ceza": 0,
            "aile": 0,
            "veraset": 0,
            "sirketler": 0,
            "ticaret": 0,
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
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }

            if (tag.includes("Ceza Hukuku")) counts.ceza++;
            if (tag.includes("Gayrimenkul")) counts.gayrimenkul++;
            if (tag.includes("İş Hukuku")) counts["is-hukuku"]++;
            if (tag.includes("Aile Hukuku")) counts.aile++;
            if (tag.includes("Veraset")) counts.veraset++;
            if (tag.includes("Şirketler Hukuku")) counts.sirketler++;
            if (tag.includes("Ticaret Hukuku")) counts.ticaret++;
            if (tag.includes("Genel")) counts.genel++;

            if (blogListContainer) {
                let categorySlug = "genel";
                if (tag.includes("Ceza Hukuku")) categorySlug = "ceza";
                else if (tag.includes("Gayrimenkul")) categorySlug = "gayrimenkul";
                else if (tag.includes("İş Hukuku")) categorySlug = "is-hukuku";
                else if (tag.includes("Aile Hukuku")) categorySlug = "aile";
                else if (tag.includes("Veraset")) categorySlug = "veraset";
                else if (tag.includes("Şirketler Hukuku")) categorySlug = "sirketler";
                else if (tag.includes("Ticaret Hukuku")) categorySlug = "ticaret";

                const article = document.createElement('article');
                article.className = 'blog-card';
                article.setAttribute('data-category', categorySlug);

                article.innerHTML = `
                    <div class="blog-content">
                        <span class="blog-date">${formattedDate}</span>
                        <h2><a href="#" data-file="${file.path}">${title}</a></h2>
                        <p>${description}</p>
                        <a href="#" class="read-more" data-file="${file.path}">Devamını Oku →</a>
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

        updateCountEl("count-is-hukuku", counts["is-hukuku"]);
        updateCountEl("count-gayrimenkul", counts.gayrimenkul);
        updateCountEl("count-ceza", counts.ceza);
        updateCountEl("count-aile", counts.aile);
        updateCountEl("count-veraset", counts.veraset);
        updateCountEl("count-sirketler", counts.sirketler);
        updateCountEl("count-ticaret", counts.ticaret);
        updateCountEl("count-genel", counts.genel);

    } catch (error) {
        console.error('Hata:', error);
        if (blogListContainer) {
            blogListContainer.innerHTML = '<p>Makaleler yüklenirken bir hata oluştu.</p>';
        }
    }
}

// Global Tıklama Olayları (Makale okuma, filtreleme, vb.)
document.addEventListener('click', async function(e) {
    // 1. "Devamını Oku" veya Başlığa Tıklandığında Doğrudan .md dosyasını açma
    const readMoreLink = e.target.closest('.read-more') || e.target.closest('.blog-card h2 a');
    if (readMoreLink && readMoreLink.hasAttribute('data-file')) {
        e.preventDefault();
        const filePath = readMoreLink.getAttribute('data-file');
        await loadSingleMarkdownArticle(filePath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // 2. Kategorilere Tıklandığında
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

    // 3. Filtre kutusundaki çarpı (×) butonuna tıklandığında
    if (e.target.matches('#clear-filter-btn') || e.target.closest('#clear-filter-btn')) {
        e.preventDefault();
        document.querySelectorAll('.category-link').forEach(el => el.classList.remove('active'));
        const allLink = document.querySelector('.category-link[data-filter="all"]');
        if (allLink) allLink.classList.add('active');

        filterCards('all');
        hideActiveFilterBox();
    }
});

// Tekil .md dosyasını çekip aynı sayfada gösteren fonksiyon
async function loadSingleMarkdownArticle(filePath) {
    const blogListContainer = document.getElementById("blog-list-container");
    const repoOwner = "SerMassey"; 
    const repoName = "av-anilguzel"; 
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}?t=${new Date().getTime()}`;

    if (blogListContainer) {
        blogListContainer.innerHTML = '<p style="padding: 20px; font-size: 16px;">Makale yükleniyor...</p>';
    }

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error('Makale içeriği alınamadı.');

        const markdownText = await response.text();

        // Front-matter ve içeriği ayıralım
        const parts = markdownText.split('---');
        let content = markdownText;
        let title = "Makale Detayı";

        if (parts.length >= 3) {
            const frontMatter = parts[1];
            content = parts.slice(2).join('---');

            const titleMatch = frontMatter.match(/title:\s*"?(.*?)"?$/m);
            if (titleMatch) title = titleMatch[1];
        }

        // Markdown'ı HTML'e çevir
        const htmlContent = marked.parse(content);

        if (blogListContainer) {
            blogListContainer.innerHTML = `
                <div class="single-article-view">
                    <button onclick="location.reload()" class="back-to-list-btn" style="background: none; border: none; color: #004080; font-weight: bold; cursor: pointer; margin-bottom: 20px; font-size: 15px;">← Tüm Makalelere Dön</button>
                    <h1 style="margin-bottom: 20px; color: #222; font-size: 28px;">${title}</h1>
                    <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 30px;">
                    <div class="markdown-body" style="line-height: 1.8; color: #444;">
                        ${htmlContent}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Makale yükleme hatası:', error);
        if (blogListContainer) {
            blogListContainer.innerHTML = '<p>Makale yüklenirken bir hata oluştu. <a href="makaleler.html">Geri dön</a></p>';
        }
    }
}

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

// Google Yorumları Entegrasyonu
const apiKey = "AIzaSyAgcGLLN7-1nMlF5lVHeVwqO3d4KRdbEnc";
const placeId = "ChIJcwC0KjuQwxQRl5EGaut4HLM";

const apiUrl = `https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&language=tr&key=${apiKey}`;

fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const resultData = data.result || (data.contents ? JSON.parse(data.contents).result : null);

        if (resultData) {
            const place = resultData;
            
            if (place.rating) {
                const ratingEl = document.getElementById('rating-number');
                if (ratingEl) ratingEl.innerText = place.rating.toFixed(1);
            }
            if (place.user_ratings_total) {
                const totalEl = document.getElementById('total-ratings');
                if (totalEl) totalEl.innerText = `${place.user_ratings_total} Google değerlendirmesi`;
            }

            const reviewsContainer = document.getElementById('reviews-grid');
            if (reviewsContainer) {
                reviewsContainer.innerHTML = '';

                if (place.reviews && place.reviews.length > 0) {
                    place.reviews.forEach(review => {
                        const starsString = '★'.repeat(review.rating);
                        const card = document.createElement('div');
                        card.className = 'review-card';
                        card.innerHTML = `
                            <div class="review-header">
                                <span class="review-author">${review.author_name}</span>
                                <span class="review-stars">${starsString}</span>
                            </div>
                            <p class="review-text">"${review.text}"</p>
                        `;
                        reviewsContainer.appendChild(card);
                    });
                } else {
                    reviewsContainer.innerHTML = `
                        <div class="review-card">
                            <p class="review-text" style="color: #666; font-style: normal;">
                                Müvekkillerimizin Google üzerindeki 5 yıldızlı değerlendirmeleri gizlilik ve şeffaflık ilkemizle listelenmektedir. Siz de deneyiminizi paylaşmak için değerlendirme yapabilirsiniz.
                            </p>
                        </div>
                    `;
                }
            }
        }
    })
    .catch(error => {
        console.error("Google Reviews API Hatası:", error);
        const reviewsContainer = document.getElementById('reviews-grid');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = '<p class="review-text">Yorumlar yüklenirken bir sorun oluştu.</p>';
        }
    });