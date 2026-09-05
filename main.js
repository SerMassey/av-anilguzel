document.addEventListener("DOMContentLoaded", function() {
    // 1. Navbar'ı yükle
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        })
        .catch(error => console.error("Navbar yüklenirken hata:", error));

    // 2. Footer'ı yükle
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        })
        .catch(error => console.error("Footer yüklenirken hata:", error));

    // 3. Kategori sayaçlarını yükle
    loadCategoryCounts();
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

// Blog kategori sayaçlarını GitHub API üzerinden hesaplayan fonksiyon
const loadCategoryCounts = async function() {
    const repoOwner = "SerMassey"; 
    const repoName = "av-anilguzel";   
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/_posts`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) return;
        const files = await response.json();

        let counts = {
            "is-hukuku": 0,
            "gayrimenkul": 0,
            "ceza": 0,
            "aile": 0,
            "veraset": 0,
            "sirketler": 0,
            "genel": 0
        };

        for (let file of files) {
            if (file.name.endsWith('.md')) {
                const fileRes = await fetch(file.download_url);
                const content = await fileRes.text();
                
                if (content.includes("tag: Ceza Hukuku")) counts.ceza++;
                if (content.includes("tag: Gayrimenkul")) counts.gayrimenkul++;
                if (content.includes("tag: İş Hukuku")) counts["is-hukuku"]++;
                if (content.includes("tag: Aile Hukuku")) counts.aile++;
                if (content.includes("tag: Veraset")) counts.veraset++;
                if (content.includes("tag: Şirketler Hukuku")) counts.sirketler++;
                if (content.includes("tag: Genel")) counts.genel++;
            }
        }

        // Güvenli DOM Güncelleyici (Element sayfada yoksa hata fırlatmaz)
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
        console.error("Kategori sayıları yüklenirken hata oluştu:", error);
    }
};

// anasayfa faq bölümündeki akordeon
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const answer = item.querySelector('.faq-answer');
        const isActive = item.classList.contains('active');

        // İsteğe bağlı: Diğer açık olanları kapatmak istersen bu bloğu açabilirsin
        // document.querySelectorAll('.faq-item').forEach(i => {
        //     i.classList.remove('active');
        //     i.querySelector('.faq-answer').style.maxHeight = null;
        // });

        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            item.classList.remove('active');
            answer.style.maxHeight = null;
        }
    });
});

// makaleleri ekrana basmak

document.addEventListener("DOMContentLoaded", () => {
    const blogListContainer = document.getElementById("blog-list-container");
    if (!blogListContainer) return;

    fetch('posts.json')
        .then(response => {
            if (!response.ok) throw new Error('posts.json dosyasına yazılamadı veya bulunamadı.');
            return response.json();
        })
        .then(posts => {
            blogListContainer.innerHTML = '';
            if (!posts || posts.length === 0) {
                blogListContainer.innerHTML = '<p>Henüz makale yayınlanmadı.</p>';
                return;
            }

            posts.forEach(post => {
                const dateObj = new Date(post.date);
                const formattedDate = isNaN(dateObj) ? post.date : dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                
                const excerpt = post.body ? post.body.replace(/[#*_`]/g, '').substring(0, 120) + '...' : '';

                const article = document.createElement('article');
                article.className = 'blog-card';
                article.innerHTML = `
                    ${post.image ? `<img src="${post.image}" alt="Makale Görseli">` : ''}
                    <div class="blog-content">
                        <span class="blog-date">${formattedDate}</span>
                        <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
                        <p>${excerpt}</p>
                        <a href="post.html?id=${post.id}" class="read-more">Devamını Oku →</a>
                    </div>
                `;
                blogListContainer.appendChild(article);
            });
        })
        .catch(error => {
            console.error('Makaleler yüklenirken hata oluştu:', error);
            blogListContainer.innerHTML = '<p>Makaleler yüklenirken bir hata oluştu.</p>';
        });
});