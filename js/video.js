/**
 * Renders the homepage "Latest Video" card from js/latest-video.json,
 * which is kept in sync with BowtieGOAT's YouTube channel (Shorts
 * excluded) by the scheduled "Update Content Feeds" GitHub Action.
 */
async function init() {
  const container = document.querySelector('[data-latest-video]');
  if (!container) return;

  let video;
  try {
    const res = await fetch('js/latest-video.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load latest video');
    video = await res.json();
  } catch (err) {
    return; // Fail quietly -- the section just won't render.
  }

  if (!video || !video.url) return;

  const statsLine = [
    video.views ? `${video.views.toLocaleString()} views` : null,
    video.date || null,
  ].filter(Boolean).join(' &middot; ');

  container.innerHTML = `
    <a
      href="${video.url}"
      target="_blank"
      rel="noopener noreferrer"
      class="group grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-ink-200 bg-white overflow-hidden hover:shadow-xl transition-shadow duration-200"
    >
      <div class="relative aspect-video bg-ink-900">
        <img src="${video.thumbnail}" alt="Latest YouTube video thumbnail" class="w-full h-full object-cover" />
        <div class="absolute inset-0 flex items-center justify-center bg-ink-950/20 group-hover:bg-ink-950/30 transition-colors">
          <div class="w-16 h-16 rounded-full bg-cream-50/90 flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6 text-ink-900 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="p-8 sm:p-10 flex flex-col justify-center">
        <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">Latest Video</p>
        <h2 class="font-serif text-2xl sm:text-3xl font-bold text-ink-900 leading-tight group-hover:text-blue-600 transition-colors">
          ${video.title}
        </h2>
        ${statsLine ? `<p class="mt-3 text-sm text-ink-400">${statsLine}</p>` : ''}
        ${video.description ? `<p class="mt-4 text-ink-500 leading-relaxed">${video.description}</p>` : ''}
        <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
          Watch on YouTube
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', init);
