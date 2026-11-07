(function () {
  'use strict';

  // Script iki kez yüklenirse ikinci kopya hiçbir şey yapmasın
  if (window.__atifLoaded) return;
  window.__atifLoaded = true;

  var css = [
    'sup.atif{line-height:0}',
    'sup.atif a.atif-link{color:#10b981;font-weight:700;text-decoration:none;padding:0 1px;cursor:pointer}',
    'sup.atif a.atif-link:hover{text-decoration:underline}',
    '.atif-pop{position:absolute;z-index:9999;width:max-content;max-width:min(360px,calc(100vw - 16px));',
    'background:#064e3b;color:#ecfdf5;border:1px solid #10b981;border-radius:8px;padding:12px 14px;',
    'font-size:14px;line-height:1.5;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
    '.atif-pop[hidden]{display:none}',
    '.atif-pop-n{font-weight:700;color:#34d399;margin-bottom:4px}',
    '.atif-pop a{color:#6ee7b7;display:inline-block;margin:8px 12px 0 0}',
    '.kaynakca{margin-top:2.5rem;padding-top:1rem;border-top:1px solid rgba(128,128,128,.4)}',
    '.kaynakca ol{padding-left:1.4rem}',
    '.kaynakca li{margin:.5rem 0;scroll-margin-top:90px}',
    '.kaynakca li:target{background:rgba(16,185,129,.15)}',
    '.kaynakca .geri{margin-left:.4rem;text-decoration:none}'
  ].join('');

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function isHttp(u) { return /^https?:\/\//i.test(u); }

  function attrEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\s+/g, ' ').trim();
  }

  function plainText(html) {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
  }

  // [[Kaynak metni | https://bağlantı]]  ->  <sup class="atif" ...>
  function convertInline(root) {
    if (root.innerHTML.indexOf('[[') === -1) return;
    root.innerHTML = root.innerHTML.replace(/\[\[([^\[\]]+?)\]\]/g, function (m, inner) {
      var text = plainText(inner).replace(/\s+/g, ' ').trim();
      var url = '';
      var bar = text.lastIndexOf('|');
      if (bar !== -1 && /^https?:\/\//i.test(text.slice(bar + 1).trim())) {
        url = text.slice(bar + 1).trim();
        text = text.slice(0, bar).trim();
      }
      text = text.replace(/\\([\\*_`])/g, '$1');
      if (!text) return m;
      return '<sup class="atif" data-kaynak="' + attrEsc(text) + '"' +
        (url ? ' data-url="' + attrEsc(url) + '"' : '') + '></sup>';
    });
  }

  ready(function () {
    var root = document.querySelector('.article-body') ||
      document.querySelector('article') || document.querySelector('main');
    if (!root) return;

    convertInline(root);

    var cites = document.querySelectorAll('sup.atif');
    if (!cites.length) return;

    // Önceki kalıntıları temizle
    document.querySelectorAll('.atif-pop').forEach(function (n) { n.remove(); });

    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    // 1) Kaynakları sırayla numaralandır (aynı kaynak aynı numarayı alır)
    var list = [], index = {};
    cites.forEach(function (sup) {
      var text = (sup.getAttribute('data-kaynak') || '').trim();
      var url = (sup.getAttribute('data-url') || '').trim();
      if (!text) return;
      var key = text + '|' + url;
      if (!(key in index)) {
        list.push({ text: text, url: url, refs: [] });
        index[key] = list.length - 1;
      }
      var i = index[key], n = i + 1;
      var refId = 'atif-ref-' + n + '-' + (list[i].refs.length + 1);
      list[i].refs.push(refId);
      sup.id = refId;

      var a = document.createElement('a');
      a.className = 'atif-link';
      a.href = '#kaynak-' + n;
      a.setAttribute('data-n', n);
      a.setAttribute('aria-label', 'Kaynak ' + n);
      a.textContent = n;
      sup.textContent = '';
      sup.appendChild(a);
    });

    // 2) Sayfa altındaki Kaynakça
    var box = document.getElementById('kaynakca');
    if (!box) {
      box = document.createElement('section');
      root.appendChild(box);
    }
    box.classList.add('kaynakca');
    box.textContent = '';
    var h2 = document.createElement('h2');
    h2.textContent = 'Kaynakça';
    box.appendChild(h2);
    var ol = document.createElement('ol');
    list.forEach(function (it, i) {
      var li = document.createElement('li');
      li.id = 'kaynak-' + (i + 1);
      li.appendChild(document.createTextNode(it.text));
      if (isHttp(it.url)) {
        li.appendChild(document.createTextNode(' '));
        var l = document.createElement('a');
        l.href = it.url; l.target = '_blank'; l.rel = 'noopener noreferrer';
        l.textContent = '[bağlantı]';
        li.appendChild(l);
      }
      it.refs.forEach(function (id, k) {
        var b = document.createElement('a');
        b.className = 'geri'; b.href = '#' + id;
        b.setAttribute('aria-label', 'Metne dön');
        b.textContent = k === 0 ? '↑' : '↑' + (k + 1);
        li.appendChild(b);
      });
      ol.appendChild(li);
    });
    box.appendChild(ol);

    // 3) Popup
    var pop = document.createElement('div');
    pop.className = 'atif-pop';
    pop.setAttribute('role', 'dialog');
    pop.hidden = true;
    document.body.appendChild(pop);
    var current = null;

    function hide() { pop.hidden = true; current = null; }

    function show(link) {
      var n = parseInt(link.getAttribute('data-n'), 10);
      var it = list[n - 1];
      pop.textContent = '';
      var t = document.createElement('div');
      t.className = 'atif-pop-n';
      t.textContent = 'Kaynak ' + n;
      pop.appendChild(t);
      var p = document.createElement('div');
      p.textContent = it.text;
      pop.appendChild(p);
      if (isHttp(it.url)) {
        var a = document.createElement('a');
        a.href = it.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = 'Kaynağı aç ↗';
        pop.appendChild(a);
      }
      var g = document.createElement('a');
      g.href = '#kaynak-' + n;
      g.textContent = 'Kaynakçada gör';
      g.addEventListener('click', hide);
      pop.appendChild(g);

      pop.hidden = false;
      var r = link.getBoundingClientRect();
      var sx = window.pageXOffset, sy = window.pageYOffset;
      var w = pop.offsetWidth;
      var left = r.left + sx + r.width / 2 - w / 2;
      left = Math.max(sx + 8, Math.min(left, sx + document.documentElement.clientWidth - w - 8));
      pop.style.left = left + 'px';
      pop.style.top = (r.bottom + sy + 8) + 'px';
      current = link;
    }

    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a.atif-link');
      if (link) {
        e.preventDefault();
        if (current === link && !pop.hidden) hide(); else show(link);
        return;
      }
      if (!pop.contains(e.target)) hide();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('resize', hide);
  });
})();