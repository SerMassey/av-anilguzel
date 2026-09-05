const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(__dirname, '_posts');
const outputFile = path.join(__dirname, 'posts.json');

function getPosts() {
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory);
    }
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const id = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            return {
                id,
                title: matterResult.data.title || 'Başlıksız Makale',
                date: matterResult.data.date || new Date().toISOString(),
                tag: matterResult.data.tag || 'Genel',
                image: matterResult.data.image || '',
                body: matterResult.content
            };
        });

    // Tarihe göre yeniden eskiye sıralama
    allPostsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    fs.writeFileSync(outputFile, JSON.stringify(allPostsData, null, 2));
    console.log('posts.json başarıyla oluşturuldu!');
}

getPosts();