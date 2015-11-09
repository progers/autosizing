'use strict';

// Determine if Chrome's text autosizer (aka font boosting) is running.
//
// Returns true if autosizing is running, false otherwise. Must have access to the top window object
// (i.e., not in a cross-origin frame) or a SecurityError will be thrown.
//
// This code closely follows the algorithm used in Chrome:
// https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/layout/TextAutosizer.cpp&l=554
var chromeAutosizingText = function() {
    // Determine if a meta viewport is set at all.
    // If Chrome ships the CSS Device Adaption spec, this will need to be modified to check for the
    // @viewport CSS rule (see: https://www.chromestatus.com/feature/4737164243894272).
    var metaViewportValue = false;
    var metaTags = document.getElementsByTagName("meta");
    for (var m = 0; m < metaTags.length; m++) {
        var metaTag = metaTags[m];
        if (metaTag.getAttribute("name") == "viewport" && metaTag.getAttribute("content")) {
            metaViewportValue = true;
            break;
        }
    }

    var deviceScaleAdjustment;
    if (metaViewportValue) {
        // A meta viewport disables the device scale adjustment.
        deviceScaleAdjustment = 1;
    } else {
        // An additional device scale adjustment is applied based on Android's smallestScreenWidthDp
        // setting [1] which is then mapped through a device scale adjustment formula [2] which
        // linearly interpolates in the range (1.05, 1.3).
        //
        // For now we just use the midpoint because this is not a huge difference: 1.175.
        //
        // TODO(pdr): We may be able to compute smallestScreenWidthDp exactly using
        //            window.devicePixelRatio and window.outerWidth.
        //
        // [1] http://developer.android.com/reference/android/content/res/Configuration.html#smallestScreenWidthDp
        // [2] https://code.google.com/p/chromium/codesearch#chromium/src/chrome/browser/chrome_content_browser_client.cc&l=592
        deviceScaleAdjustment = 1.175;
    }

    // This value is set via the accessibility preferences and cannot be sniffed directly.
    // We assume the default value of 100%.
    var accessibilityFontScaleFactor = 1;

    // We are unable to determine the true screen size from within cross-domain frames and the
    // following will throw a SecurityError if we try.
    var innerWidth = window.top.innerWidth;
    var outerWidth = window.top.outerWidth;

    return deviceScaleAdjustment * accessibilityFontScaleFactor * innerWidth / outerWidth > 1;
}
