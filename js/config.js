/**
 * Shared config accessors.
 *
 * Everything reads FM_CONFIG through here so a missing or malformed config file
 * fails loudly in one place instead of throwing somewhere deep in a slide.
 */
(function (global) {
  'use strict';

  var config = global.FM_CONFIG;

  if (!config) {
    throw new Error(
      'FM_CONFIG is not defined. config/presentation.config.js must be loaded before this script.'
    );
  }

  /** Pages that auth.js is allowed to redirect to, to prevent open redirects. */
  var ALLOWED_TARGETS = ['index.html', 'presentation-en.html', 'presentation-ar.html'];

  var FM = {
    config: config,

    /** True when running from a USB stick / local file, where no gate applies. */
    isOffline: function () {
      return global.location.protocol === 'file:' || global.FM_OFFLINE === true;
    },

    /**
     * Resolves a redirect target to a known page. Anything unrecognised — an
     * absolute URL, a protocol-relative host, a traversal — collapses to the
     * landing page rather than being followed.
     */
    safeTarget: function (value, fallback) {
      var target = fallback || 'index.html';
      if (typeof value !== 'string' || value === '') return target;

      // Strip any path or query a caller may have appended.
      var bare = value.split('?')[0].split('#')[0];
      bare = bare.substring(bare.lastIndexOf('/') + 1);

      return ALLOWED_TARGETS.indexOf(bare) !== -1 ? bare : target;
    },

    /** Escapes text before it is placed into innerHTML. */
    escapeHtml: function (value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    },

    /** Reads a nested config value with a default, e.g. get('features.requireLogin', true). */
    get: function (path, fallback) {
      var parts = String(path).split('.');
      var node = config;
      for (var i = 0; i < parts.length; i++) {
        if (node == null || typeof node !== 'object' || !(parts[i] in node)) return fallback;
        node = node[parts[i]];
      }
      return node === undefined ? fallback : node;
    },
  };

  global.FM = FM;
})(window);
