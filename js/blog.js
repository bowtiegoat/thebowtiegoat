/**
 * Renders the BowtieGOAT blog feed (blog.html) from js/blog-posts.json,
 * which is kept in sync with the Substack RSS feed by the scheduled
 * "Update Blog Feed" GitHub Action. The most recent post renders in full
 * up top; earlier posts render as a condensed, scroll-loaded list below
 * (batches of 6, stopping once everything the feed provides has shown).
 */
const BATCH_SIZE = 6;

let olderPosts = [];
let renderedCount = 0;
let observer = null;

function featuredPostHTML(post) {
  const body = post.content
    ? `
      <div class="prose max-w-none mt-8 prose-p:text-ink-600 prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-ink-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-ink-900 prose-blockquote:border-l-blue-300 prose-blockquote:text-ink-500 prose-img:rounded-lg prose-li:text-ink-600">
        ${post.content}
      </div>
    `
    : `<p class="mt-8 text-ink-600 leading-relaxed">${post.excerpt}</p>`;

  return `
    <article class="mb-16 pb-16 border-b border-ink-200">
      <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">Latest Post</p>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">${post.title}</h1>
      <p class="mt-2 text-sm text-ink-400">${post.date}</p>
      ${body}
      <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="mt-8 inline-block rounded-md bg-blue-600 text-cream-50 font-semibold px-6 py-3 hover:bg-blue-500 transition-colors">
        Continue Reading &amp; Discuss on Substack &rarr;
      </a>
    </article>
  `;
}

function postHTML(post) {
  return `
    <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="group block py-8 border-b border-ink-200 hover:bg-white/70 transition-colors -mx-6 px-6 rounded-lg">
      <p class="text-xs font-semibold uppercase tracking-wide text-ink-400">${post.date}</p>
      <h2 class="mt-2 font-serif text-2xl font-semibold text-ink-900 group-hover:text-blue-600 transition-colors">${post.title}</h2>
      <p class="mt-3 text-ink-500 leading-relaxed">${post.excerpt}</p>
      <p class="mt-3 text-sm font-semibold text-blue-600">Read on Substack &rarr;</p>
    </a>
  `;
}

function renderNextBatch() {
  const list = document.querySelector('[data-blog-list]');
  const nextPosts = olderPosts.slice(renderedCount, renderedCount + BATCH_SIZE);

  list.insertAdjacentHTML('beforeend', nextPosts.map(postHTML).join(''));
  renderedCount += nextPosts.length;

  if (renderedCount >= olderPosts.length) {
    document.querySelector('[data-blog-sentinel]').classList.add('hidden');
    document.querySelector('[data-blog-end]').classList.remove('hidden');
    observer?.disconnect();
  }
}

async function init() {
  const loading = document.querySelector('[data-blog-loading]');
  const errorEl = document.querySelector('[data-blog-error]');
  const sentinel = document.querySelector('[data-blog-sentinel]');
  let allPosts;

  try {
    const res = await fetch('js/blog-posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load posts');
    allPosts = await res.json();
  } catch (err) {
    loading.classList.add('hidden');
    errorEl.classList.remove('hidden');
    return;
  }

  loading.classList.add('hidden');

  if (!Array.isArray(allPosts) || allPosts.length === 0) {
    errorEl.classList.remove('hidden');
    return;
  }

  document.querySelector('[data-featured-post]').innerHTML = featuredPostHTML(allPosts[0]);
  olderPosts = allPosts.slice(1);

  if (olderPosts.length === 0) return;

  document.querySelector('[data-more-posts-heading]').classList.remove('hidden');
  renderNextBatch();

  if (renderedCount < olderPosts.length) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && renderedCount < olderPosts.length) {
        renderNextBatch();
      }
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
  }
}

document.addEventListener('DOMContentLoaded', init);
