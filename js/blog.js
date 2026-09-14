/**
 * Renders the BowtieGOAT blog feed (blog.html) from js/blog-posts.json,
 * which is kept in sync with the Substack RSS feed by the scheduled
 * "Update Blog Feed" GitHub Action. Posts render in batches as the reader
 * scrolls, stopping once every fetched post (up to Substack's 20-post
 * feed limit) has been shown.
 */
const BATCH_SIZE = 6;

let allPosts = [];
let renderedCount = 0;
let observer = null;

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
  const nextPosts = allPosts.slice(renderedCount, renderedCount + BATCH_SIZE);

  list.insertAdjacentHTML('beforeend', nextPosts.map(postHTML).join(''));
  renderedCount += nextPosts.length;

  if (renderedCount >= allPosts.length) {
    document.querySelector('[data-blog-sentinel]').classList.add('hidden');
    document.querySelector('[data-blog-end]').classList.remove('hidden');
    observer?.disconnect();
  }
}

async function init() {
  const loading = document.querySelector('[data-blog-loading]');
  const errorEl = document.querySelector('[data-blog-error]');
  const sentinel = document.querySelector('[data-blog-sentinel]');

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

  renderNextBatch();

  if (renderedCount < allPosts.length) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && renderedCount < allPosts.length) {
        renderNextBatch();
      }
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
  }
}

document.addEventListener('DOMContentLoaded', init);
