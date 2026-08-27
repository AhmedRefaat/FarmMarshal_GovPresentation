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
