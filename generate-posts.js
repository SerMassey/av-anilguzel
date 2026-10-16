const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const postsDirectory = path.join(__dirname, '_posts');
const outputDirectory = path.join(__dirname, 'makaleler');
const templatePath = path.join(__dirname, 'makale-sablonu.html');
const makalelerHtmlPath = path.join(__dirname, 'makaleler.html');

function generatePosts() {
    if (!fs.existsSync(postsDirectory)) {
        console.log('_posts klasörü bulunamadı!');
        return;
    }

    // 1. TEMİZLİK: makaleler klasöründeki eski HTML dosyalarının hepsini temizle
    if (fs.existsSync(outputDirectory)) {
        const oldHtmlFiles = fs.readdirSync(outputDirectory).filter(file => path.extname(file) === '.html');
        oldHtmlFiles.forEach(file => {
            fs.unlinkSync(path.join(outputDirectory, file));
        });
        console.log('Eski makale HTML dosyaları temizlendi.');
    } else {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const files = fs.readdirSync(postsDirectory).filter(file => path.extname(file) === '.md');
    if (files.length === 0) {
        console.log('_posts içinde .md dosyası bulunamadı.');
        // _posts boşsa makaleler.html listesini de boşaltalım
        updateMakalelerPage([]);
        return;
    }

    const template = fs.readFileSync(templatePath, 'utf8');
    let postsData = [];

    // 2. Her bir .md dosyasını oku ve güncel HTML sayfalarını üret
    files.forEach(file => {
        const filePath = path.join(postsDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        const { data, content } = matter(fileContent);
        const htmlContent = marked.parse(content);

        const slug = file.replace(/\.md$/, '');
        const outputFilePath = path.join(outputDirectory, `${slug}.html`);

        const formattedDate = data.date ? new Date(data.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        const tag = data.tag || 'Genel';

        let finalHtml = template
            .replace(/{{TITLE}}/g, data.title || 'Makale')
            .replace(/{{DESCRIPTION}}/g, data.description || '')
            .replace(/{{TAG}}/g, tag)
            .replace(/{{DATE}}/g, formattedDate)
            .replace(/{{CONTENT}}/g, htmlContent);

        fs.writeFileSync(outputFilePath, finalHtml);
        console.log(`Oluşturuldu: makaleler/${slug}.html`);

        postsData.push({
            title: data.title || 'Başlıksız Makale',
            date: formattedDate,
            rawDate: data.date ? new Date(data.date) : new Date(0),
            tag: tag,
            description: data.description || 'Bilgilendirme yazımızın detayları için tıklayın.',
            url: `makaleler/${slug}.html`,
            categorySlug: getCategorySlug(tag)
        });
    });

    // Tarihe göre yeniden eskiye sırala
    postsData.sort((a, b) => b.rawDate - a.rawDate);

    // 3. makaleler.html sayfasını güncelle
    updateMakalelerPage(postsData);
}

function getCategorySlug(tag) {
    if (tag.includes("Ceza Hukuku")) return "ceza";
    if (tag.includes("Gayrimenkul")) return "gayrimenkul";
    if (tag.includes("İş Hukuku")) return "is-hukuku";
    if (tag.includes("Aile Hukuku")) return "aile";
    if (tag.includes("Veraset")) return "veraset";
    if (tag.includes("Şirketler Hukuku")) return "sirketler";
    if (tag.includes("Ticaret Hukuku")) return "ticaret";
    return "genel";
}

function updateMakalelerPage(posts) {
    if (!fs.existsSync(makalelerHtmlPath)) return;

    let htmlContent = fs.readFileSync(makalelerHtmlPath, 'utf8');

    let cardsHtml = '';
    let counts = { "is-hukuku": 0, "gayrimenkul": 0, "ceza": 0, "aile": 0, "veraset": 0, "sirketler": 0, "ticaret": 0, "genel": 0 };

    if (posts.length === 0) {
        cardsHtml = '<p style="padding: 20px; color: #666;">Henüz makale yayınlanmadı.</p>';
    } else {
        posts.forEach(post => {
            if (counts[post.categorySlug] !== undefined) {
                counts[post.categorySlug]++;
            } else {
                counts.genel++;
            }

            cardsHtml += `
                <article class="blog-card" data-category="${post.categorySlug}">
                    <div class="blog-content">
                        <span class="blog-date">${post.date}</span>
                        <h2><a href="${post.url}">${post.title}</a></h2>
                        <p>${post.description}</p>
                        <a href="${post.url}" class="read-more">Devamını Oku →</a>
                    </div>
                </article>
            `;
        });
    }

    const startMarker = '<!-- BLOG-LIST-START -->';
    const endMarker = '<!-- BLOG-LIST-END -->';
    
    const startIndex = htmlContent.indexOf(startMarker);
    const endIndex = htmlContent.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
        const before = htmlContent.substring(0, startIndex + startMarker.length);
        const after = htmlContent.substring(endIndex);
        
        htmlContent = before + '\n' + cardsHtml + '\n    ' + after;
    }

    htmlContent = htmlContent.replace(/<span id="count-is-hukuku">\(\d+\)<\/span>/, `<span id="count-is-hukuku">(${counts["is-hukuku"]})</span>`);
    htmlContent = htmlContent.replace(/<span id="count-gayrimenkul">\(\d+\)<\/span>/, `<span id="count-gayrimenkul">(${counts["gayrimenkul"]})</span>`);
    htmlContent = htmlContent.replace(/<span id="count-ceza">\(\d+\)<\/span>/, `<span id="count-ceza">(${counts["ceza"]})</span>`);
    htmlContent = htmlContent.replace(/<span id="count-aile">\(\d+\)<\/span>/, `<span id="count-aile">(${counts["aile"]})</span>`);
    htmlContent = htmlContent.replace(/<span id="count-veraset">\(\d+\)<\/span>/, `<span id="count-veraset">(${counts["veraset"]})</span>`);
    htmlContent = htmlContent.replace(/<span id="count-sirketler">\(\d+\)<\/span>/, `<span id="count-sirketler">(${counts["sirketler"]})</span>`);
    htmlContent = htmlContent.replace(/<span id="count-ticaret">\(\d+\)<\/span>/, `<span id="count-ticaret">(${counts["ticaret"]})</span>`);

    fs.writeFileSync(makalelerHtmlPath, htmlContent);
    console.log('makaleler.html başarıyla güncellendi.');
}

generatePosts();