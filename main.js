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

// Tek istekle hem makaleleri listeyen hem de kategori sayaçlarını güncelleyen optimize fonksiyon
async function loadBlogDataAndCounts() {
    const blogListContainer = document.getElementById("blog-list-container");
    const repoOwner = "SerMassey"; 
    const repoName = "av-anilguzel"; 
    
    // GitHub Git Trees API kullanarak _posts klasöründeki dosyaları tek sorguda çekiyoruz (Cache önlemek için timestamp eklenir)
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
            "genel": 0
        };

        if (blogListContainer) {
            blogListContainer.innerHTML = '';
        }

        // Her bir Markdown dosyasının içeriğini çekip işleyelim
        for (let file of postFiles) {
            const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${file.path}?t=${new Date().getTime()}`;
            const fileRes = await fetch(rawUrl);
            const markdownText = await fileRes.text();

            // Frontmatter (YAML) alanlarından bilgileri ayıkla
            const titleMatch = markdownText.match(/title:\s*"?(.*?)"?$/m);
            const dateMatch = markdownText.match(/date:\s*"?(.*?)"?$/m);
            const tagMatch = markdownText.match(/tag:\s*"?(.*?)"?$/m);
            
            const title = titleMatch ? titleMatch[1] : 'Başlıksız Makale';
            const date = dateMatch ? dateMatch[1] : '';
            const tag = tagMatch ? tagMatch[1].trim() : '';

            // Kategori sayaçlarını artır
            if (tag.includes("Ceza Hukuku")) counts.ceza++;
            if (tag.includes("Gayrimenkul")) counts.gayrimenkul++;
            if (tag.includes("İş Hukuku")) counts["is-hukuku"]++;
            if (tag.includes("Aile Hukuku")) counts.aile++;
            if (tag.includes("Veraset")) counts.veraset++;
            if (tag.includes("Şirketler Hukuku")) counts.sirketler++;
            if (tag.includes("Genel")) counts.genel++;

            // Eğer makaleler sayfasındakiysek kartları ekrana bas
            if (blogListContainer) {
                const article = document.createElement('article');
                article.className = 'blog-card';
                article.innerHTML = `
                    <div class="blog-content">
                        <span class="blog-date">${date}</span>
                        <h2><a href="#">${title}</a></h2>
                        <p>Hukuki bilgilendirme yazısının detayları için tıklayın...</p>
                        <a href="#" class="read-more">Devamını Oku →</a>
                    </div>
                `;
                blogListContainer.appendChild(article);
            }
        }

        // Sidebar sayaçlarını güvenli bir şekilde güncelle
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
        updateCountEl("count-genel", counts.genel);

    } catch (error) {
        console.error('Hata:', error);
        if (blogListContainer) {
            blogListContainer.innerHTML = '<p>Makaleler yüklenirken bir hata oluştu.</p>';
        }
    }
}

// anasayfa faq bölümündeki akordeon
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