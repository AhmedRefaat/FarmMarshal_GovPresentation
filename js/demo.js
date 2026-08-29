/**
 * Demo media behaviour.
 *
 * Two jobs:
 *  1. Make video slides behave predictably in a room — pause everything that is
 *     not on screen, never let audio start unasked, and degrade to a poster
 *     image if a file is missing rather than showing a black rectangle.
 *  2. Render the live verification register from presentation.config.js so an
 *     unresolved claim cannot be silently left in the deck.
 */
(function (global) {
  'use strict';

  var doc = global.document;

  var Demo = {
    init: function () {
      this.guardMedia();
      this.bindSlideMedia();
      this.bindProductTours();
      this.renderVerification();
    },

    /**
     * A missing video is the most likely asset failure (large files, LFS
     * mistakes, partial USB copies). Swap in the poster and a visible caption
     * instead of failing silently mid-presentation.
     */
    guardMedia: function () {
      var videos = doc.querySelectorAll('video[data-fm-video]');
      Array.prototype.forEach.call(videos, function (video) {
        video.addEventListener('error', function () {
          Demo.replaceWithPoster(video);
        });
        // A video whose source 404s fires error on the <source>, not the <video>.
        Array.prototype.forEach.call(video.querySelectorAll('source'), function (source) {
          source.addEventListener('error', function () {
            Demo.replaceWithPoster(video);
          });
        });

        // The listeners above are attached when this script runs, which is
        // after the parser has already begun fetching the video. A missing
        // file — especially over file://, where the failure is immediate —
        // can therefore error BEFORE we are listening, and the deck would
        // then show the browser's own fallback text instead of our poster.
        // Check the element's current state as well as future events.
        Demo.checkAlreadyFailed(video);
      });
    },

    /**
     * NETWORK_NO_SOURCE means the browser tried every <source> and resolved
     * none of them. video.error covers a decode/network failure on a source it
     * did resolve. Either way the video will never play.
     */
    checkAlreadyFailed: function (video) {
      if (video.error || video.networkState === 3 /* NETWORK_NO_SOURCE */) {
        Demo.replaceWithPoster(video);
        return;
      }

      // The element may still be resolving sources at this point. Re-check
      // once loading settles rather than guessing at a delay.
      video.addEventListener('stalled', function () {
        Demo.checkAlreadyFailed(video);
      });
      video.addEventListener('suspend', function () {
        if (video.networkState === 3) Demo.replaceWithPoster(video);
      });
    },

    replaceWithPoster: function (video) {
      if (video.dataset.fmFallbackApplied === 'true') return;
      video.dataset.fmFallbackApplied = 'true';

      var wrapper = doc.createElement('div');
      wrapper.className = 'fm-figure';

      var poster = video.getAttribute('poster');
      if (poster) {
        var img = doc.createElement('img');
        img.src = poster;
        img.alt = video.getAttribute('aria-label') || '';
        wrapper.appendChild(img);
      }

      var caption = doc.createElement('figcaption');
      caption.textContent =
        doc.documentElement.lang === 'ar'
          ? 'ملف الفيديو غير متوفر في هذه النسخة.'
          : 'Video file not present in this build.';
      wrapper.appendChild(caption);

      if (video.parentNode) video.parentNode.replaceChild(wrapper, video);
    },

    /**
     * Play only the video on the current slide. Without this, background videos
     * on other slides keep decoding and the laptop fan becomes part of the
     * presentation.
     */
    bindSlideMedia: function () {
      function updateFor(slide) {
        Array.prototype.forEach.call(doc.querySelectorAll('video[data-fm-video]'), function (video) {
          var onCurrent = slide && slide.contains(video);
          if (onCurrent) {
            if (video.dataset.fmAutoplay === 'true') {
              var attempt = video.play();
              // Autoplay rejection is expected when a browser blocks it; the
              // presenter can click. Swallow it rather than logging noise.
              if (attempt && typeof attempt.catch === 'function') attempt.catch(function () {});
            }
          } else {
            video.pause();
            if (video.dataset.fmRewind !== 'false') video.currentTime = 0;
          }
        });
      }

      global.Reveal.on('slidechanged', function (event) {
        updateFor(event.currentSlide);
      });

      updateFor(global.Reveal.getCurrentSlide());
    },

    bindProductTours: function () {
      var tours = doc.querySelectorAll('[data-fm-tour]');
      if (!tours.length) return;

      function roleLabel(role) {
        var labels = doc.documentElement.lang === 'ar'
          ? { owner: 'مالك المزرعة', moderator: 'مشرف المزرعة', expert: 'الخبير الزراعي', worker: 'العامل الميداني' }
          : { owner: 'Farm owner', moderator: 'Farm moderator', expert: 'Agricultural expert', worker: 'Field worker' };
        return labels[role] || '';
      }

      function update(tour, index) {
        var frames = tour.querySelectorAll('[data-fm-tour-frame]');
        if (!frames.length) return;

        var nextIndex = ((index % frames.length) + frames.length) % frames.length;
        var frame = frames[nextIndex];
        tour.fmTourIndex = nextIndex;

        Array.prototype.forEach.call(frames, function (item, itemIndex) {
          var active = itemIndex === nextIndex;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        Array.prototype.forEach.call(tour.querySelectorAll('[data-fm-tour-index]'), function (dot) {
          var active = Number(dot.getAttribute('data-fm-tour-index')) === nextIndex;
          dot.classList.toggle('is-active', active);
          dot.setAttribute('aria-current', active ? 'true' : 'false');
        });

        var role = tour.querySelector('[data-fm-tour-role]');
        var title = tour.querySelector('[data-fm-tour-title]');
        var detail = tour.querySelector('[data-fm-tour-detail]');
        var count = tour.querySelector('[data-fm-tour-count]');
        if (role) role.textContent = roleLabel(frame.getAttribute('data-role'));
        if (title) title.textContent = frame.getAttribute('data-title') || '';
        if (detail) detail.textContent = frame.getAttribute('data-detail') || '';
        if (count) count.textContent = String(nextIndex + 1) + ' / ' + String(frames.length);
      }

      function stop(tour) {
        if (!tour.fmTourTimer) return;
        global.clearInterval(tour.fmTourTimer);
        tour.fmTourTimer = null;
      }

      function start(tour) {
        stop(tour);
        if (global.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var interval = Number(tour.getAttribute('data-fm-tour-interval')) || 5000;
        tour.fmTourTimer = global.setInterval(function () {
          update(tour, (tour.fmTourIndex || 0) + 1);
        }, interval);
      }

      Array.prototype.forEach.call(tours, function (tour) {
        update(tour, 0);
        Array.prototype.forEach.call(tour.querySelectorAll('[data-fm-tour-index]'), function (dot) {
          dot.addEventListener('click', function () {
            update(tour, Number(dot.getAttribute('data-fm-tour-index')) || 0);
            if (tour.classList.contains('present')) start(tour);
          });
        });
      });

      function sync(slide) {
        Array.prototype.forEach.call(tours, function (tour) {
          if (tour === slide) start(tour);
          else stop(tour);
        });
      }

      global.Reveal.on('slidechanged', function (event) {
        sync(event.currentSlide);
      });
      sync(global.Reveal.getCurrentSlide());
    },

    /**
     * Renders the verification register into [data-fm-verification]. Kept in
     * config rather than hard-coded in both decks so EN and AR cannot disagree
     * about which claims are still unproven.
     */
    renderVerification: function () {
      var hosts = doc.querySelectorAll('[data-fm-verification]');
      if (!hosts.length) return;

      var items = global.FM.get('verification', []);
      var isArabic = doc.documentElement.lang === 'ar';

      var labels = {
        blocking: isArabic ? 'يحجب العرض' : 'Blocking',
        confirm: isArabic ? 'يلزم التأكيد' : 'Confirm',
        resolved: isArabic ? 'تم التحقق' : 'Resolved',
      };

      Array.prototype.forEach.call(hosts, function (host) {
        var table = doc.createElement('table');
        table.className = 'fm-table';

        var head = doc.createElement('thead');
        head.innerHTML =
          '<tr>' +
          '<th scope="col">' + (isArabic ? 'الحالة' : 'Status') + '</th>' +
          '<th scope="col">' + (isArabic ? 'الادعاء' : 'Claim') + '</th>' +
          '</tr>';
        table.appendChild(head);

        var body = doc.createElement('tbody');
        items.forEach(function (item) {
          var row = doc.createElement('tr');
          var status = labels[item.status] || item.status;
          var claim = isArabic ? item.claimAr || item.claimEn : item.claimEn;

          row.innerHTML =
            '<td data-label="' + global.FM.escapeHtml(isArabic ? 'الحالة' : 'Status') + '">' +
            '<span class="fm-badge is-' + global.FM.escapeHtml(item.status) + '">' +
            global.FM.escapeHtml(status) +
            '</span></td>' +
            '<td data-label="' + global.FM.escapeHtml(isArabic ? 'الادعاء' : 'Claim') + '">' +
            global.FM.escapeHtml(claim) +
            '</td>';
          body.appendChild(row);
        });

        table.appendChild(body);
        host.innerHTML = '';
        host.appendChild(table);
      });
    },
  };

  global.FMDemo = Demo;
})(window);
