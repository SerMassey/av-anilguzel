document.addEventListener("DOMContentLoaded", function() {
    // 1. Navbar'ı yükle
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        });

    // 2. Footer'ı yükle
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        });
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



// Blog için sayaç
const loadCategoryCounts = async function() {
    const repoOwner = "SerMassey"; 
    const repoName = "av-anilguzel";   
    const apiUrl = `https://api.github.com/repos/SerMassey/av-anilguzel/contents/_posts`;

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

        document.getElementById("count-is-hukuku").textContent = `(${counts["is-hukuku"]})`;
        document.getElementById("count-kira").textContent = `(${counts.kira})`;
        document.getElementById("count-ceza").textContent = `(${counts.ceza})`;
        document.getElementById("count-ticaret").textContent = `(${counts.ticaret})`;

    } catch (error) {
        console.error("Kategori sayıları yüklenirken hata oluştu:", error);
    }
};

// Sayfa yüklendiğinde çağır
document.addEventListener("DOMContentLoaded", () => {
    // ... diğer fetch kodların ...
    loadCategoryCounts();
});