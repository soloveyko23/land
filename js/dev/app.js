(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-scrolllock")) {
    bodyUnlock$1(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock$1 = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-menu-open");
    }
  });
}
document.querySelector("[data-menu]") ? window.addEventListener("load", menuInit) : null;
function initDropdownMenu() {
  const dropdown = document.querySelector(".menu__item--dropdown");
  if (!dropdown) return;
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  };
  if (!isTouchDevice()) {
    dropdown.addEventListener("mouseenter", () => {
      dropdown.classList.add("open");
    });
    dropdown.addEventListener("mouseleave", () => {
      dropdown.classList.remove("open");
    });
  } else {
    const link = dropdown.querySelector(".menu__link");
    if (link) {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        const isOpen = dropdown.classList.contains("open");
        document.querySelectorAll(".menu__item--dropdown.open").forEach((el) => {
          if (el !== dropdown) el.classList.remove("open");
        });
        if (!isOpen) {
          dropdown.classList.add("open");
        } else {
          dropdown.classList.remove("open");
        }
      });
      document.addEventListener("click", function(e) {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("open");
        }
      });
    }
  }
}
window.addEventListener("DOMContentLoaded", initDropdownMenu);
function headerScroll() {
  const header = document.querySelector("[data-header-scroll]");
  const headerShow = header.hasAttribute("data-header-scroll-show");
  const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
  const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("scroll", function(e) {
    const scrollTop = window.scrollY;
    clearTimeout(timer);
    if (scrollTop >= startPoint) {
      !header.classList.contains("--header-scroll") ? header.classList.add("--header-scroll") : null;
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
        } else {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("--header-scroll") ? header.classList.remove("--header-scroll") : null;
      if (headerShow) {
        header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
class UniversalFormValidator {
  constructor(popupSelector = ".popup") {
    this.popup = document.querySelector(popupSelector);
    this.videoPopup = document.querySelector("#popupVideo");
    this.forms = document.querySelectorAll("form");
    if (!this.popup) {
      console.error(`Popup with selector "${popupSelector}" not found`);
      return;
    }
    this.init();
  }
  init() {
    this.setupPopup();
    this.setupVideoPopup();
    this.bindFormsEvents();
    this.bindModalEvents();
  }
  setupPopup() {
    this.popup.setAttribute("aria-hidden", "true");
    this.popup.setAttribute("role", "dialog");
    this.popup.setAttribute("aria-modal", "true");
    this.bindPopupEvents();
  }
  setupVideoPopup() {
    if (!this.videoPopup) {
      console.warn("Video popup #popupVideo not found");
      return;
    }
    this.videoPopup.setAttribute("aria-hidden", "true");
    this.videoPopup.setAttribute("role", "dialog");
    this.videoPopup.setAttribute("aria-modal", "true");
    this.bindVideoPopupEvents();
  }
  bindFormsEvents() {
    this.forms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleFormSubmit(e, form));
    });
  }
  bindModalEvents() {
    document.addEventListener("click", (e) => {
      const modalTrigger = e.target.closest("[data-modal]");
      if (modalTrigger) {
        e.preventDefault();
        this.handleModalClick(modalTrigger);
      }
    });
  }
  handleModalClick(trigger) {
    const modalSelector = trigger.dataset.modal;
    const videoId = trigger.dataset.modalIdYt;
    if (modalSelector === "#popupVideo" && videoId) {
      this.openVideoPopup(videoId);
    }
  }
  openVideoPopup(videoId) {
    if (!this.videoPopup) return;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    let videoContainer = this.videoPopup.querySelector(".video-container");
    if (!videoContainer) {
      videoContainer = document.createElement("div");
      videoContainer.className = "video-container";
      let popupContent = this.videoPopup.querySelector(".popup__content");
      if (!popupContent) {
        popupContent = document.createElement("div");
        popupContent.className = "popup__content";
        this.videoPopup.appendChild(popupContent);
      }
      popupContent.appendChild(videoContainer);
    }
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = "YouTube video player";
    videoContainer.innerHTML = "";
    videoContainer.appendChild(iframe);
    this.showVideoPopup();
  }
  showVideoPopup() {
    if (!this.videoPopup) return;
    document.documentElement.classList.add("popup-show");
    this.videoPopup.classList.add("popup_show");
    this.videoPopup.setAttribute("aria-hidden", "false");
    this.focusFirstElementInPopup(this.videoPopup);
    document.body.style.overflow = "hidden";
  }
  closeVideoPopup() {
    if (!this.videoPopup) return;
    this.videoPopup.classList.remove("popup_show");
    document.documentElement.classList.remove("popup-show");
    this.videoPopup.setAttribute("aria-hidden", "true");
    const videoContainer = this.videoPopup.querySelector(".video-container");
    if (videoContainer) {
      videoContainer.innerHTML = "";
    }
    document.body.style.overflow = "";
  }
  bindVideoPopupEvents() {
    if (!this.videoPopup) return;
    const closeBtn = this.videoPopup.querySelector("[data-popup-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeVideoPopup());
    }
    this.videoPopup.addEventListener("click", (e) => {
      if (e.target === this.videoPopup) {
        this.closeVideoPopup();
      }
    });
  }
  bindPopupEvents() {
    const closeBtn = this.popup.querySelector("[data-popup-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closePopup());
    }
    this.popup.addEventListener("click", (e) => {
      if (e.target === this.popup) {
        this.closePopup();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.isVideoPopupOpen()) {
          this.closeVideoPopup();
        } else if (this.isPopupOpen()) {
          this.closePopup();
        }
      }
    });
  }
  handleFormSubmit(e, form) {
    e.preventDefault();
    this.clearFormErrors(form);
    const requiredFields = form.querySelectorAll("[required]");
    const isValid = this.validateRequiredFields(requiredFields);
    if (isValid) {
      this.showPopup();
      form.reset();
    }
  }
  validateRequiredFields(fields) {
    let allValid = true;
    fields.forEach((field) => {
      const value = this.getFieldValue(field);
      if (!value) {
        this.showFieldError(field);
        allValid = false;
      } else {
        this.clearFieldError(field);
      }
    });
    return allValid;
  }
  getFieldValue(field) {
    const type = field.type;
    switch (type) {
      case "checkbox":
      case "radio":
        return field.checked;
      case "select-one":
      case "select-multiple":
        return field.value && field.value !== "";
      default:
        return field.value && field.value.trim() !== "";
    }
  }
  showFieldError(field) {
    field.classList.add("error");
    field.setAttribute("aria-invalid", "true");
  }
  clearFieldError(field) {
    field.classList.remove("error");
    field.removeAttribute("aria-invalid");
  }
  clearFormErrors(form) {
    const errorFields = form.querySelectorAll(".error");
    errorFields.forEach((field) => this.clearFieldError(field));
  }
  showPopup() {
    document.documentElement.classList.add("popup-show");
    this.popup.classList.add("popup_show");
    this.popup.setAttribute("aria-hidden", "false");
    this.focusFirstElementInPopup(this.popup);
    document.body.style.overflow = "hidden";
  }
  closePopup() {
    this.popup.classList.remove("popup_show");
    document.documentElement.classList.remove("popup-show");
    this.popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  isPopupOpen() {
    return this.popup.classList.contains("popup_show");
  }
  isVideoPopupOpen() {
    return this.videoPopup && this.videoPopup.classList.contains("popup_show");
  }
  focusFirstElementInPopup(popup) {
    const focusableElements = popup.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  // Utility method to extract YouTube video ID from various URL formats
  extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }
}
document.addEventListener("DOMContentLoaded", function() {
  new UniversalFormValidator(".popup");
});
class UniversalNavigation {
  constructor(options = {}) {
    this.options = {
      headerSelector: "header.header",
      headerScrollClass: "--header-scroll",
      menuOpenAttribute: "data-menu-open",
      scrollSpeed: 500,
      offsetTop: 0,
      homePage: "/",
      // главная страница где находятся секции
      ...options
    };
    this.init();
  }
  init() {
    this.bindEvents();
    this.handlePageLoad();
  }
  bindEvents() {
    document.addEventListener("click", (e) => this.handleNavigationClick(e));
    document.addEventListener("watcherCallback", (e) => this.handleWatcherCallback(e));
  }
  handleNavigationClick(e) {
    const targetElement = e.target;
    const gotoLink = targetElement.closest("[data-scrollto]");
    if (!gotoLink) return;
    e.preventDefault();
    const selector = this.getSelector(gotoLink);
    const pageUrl = gotoLink.dataset.scrolltoPage || this.options.homePage;
    const noHeader = gotoLink.hasAttribute("data-scrollto-header");
    const speed = parseInt(gotoLink.dataset.scrolltoSpeed) || this.options.scrollSpeed;
    const offsetTop = parseInt(gotoLink.dataset.scrolltoTop) || this.options.offsetTop;
    if (!selector) {
      console.warn("UniversalNavigation: Empty selector provided", gotoLink);
      return;
    }
    this.closeMenu();
    if (this.isCurrentPage(pageUrl)) {
      this.scrollToSection(selector, noHeader, speed, offsetTop);
    } else {
      this.navigateToPageWithSection(pageUrl, selector);
    }
  }
  handleWatcherCallback(e) {
    if (!e.detail) return;
    const entry = e.detail.entry;
    const targetElement = entry.target;
    if (targetElement.dataset.flsWatcher !== "navigator") return;
    let navigatorCurrentItem = null;
    if (targetElement.id) {
      navigatorCurrentItem = document.querySelector(`[data-scrollto="#${targetElement.id}"]`);
    } else if (targetElement.classList.length) {
      for (const className of targetElement.classList) {
        const item = document.querySelector(`[data-scrollto=".${className}"]`);
        if (item) {
          navigatorCurrentItem = item;
          break;
        }
      }
    }
    if (navigatorCurrentItem) {
      if (entry.isIntersecting) {
        navigatorCurrentItem.classList.add("--navigator-active");
      } else {
        navigatorCurrentItem.classList.remove("--navigator-active");
      }
    }
  }
  handlePageLoad() {
    const hash = this.getHash();
    if (hash) {
      setTimeout(() => {
        let selector = null;
        if (document.querySelector(`#${hash}`)) {
          selector = `#${hash}`;
        } else if (document.querySelector(`.${hash}`)) {
          selector = `.${hash}`;
        }
        if (selector) {
          this.scrollToSection(selector, false, this.options.scrollSpeed, this.options.offsetTop);
        }
      }, 100);
    }
  }
  getSelector(gotoLink) {
    var _a;
    return gotoLink.dataset.scrollto || gotoLink.dataset.flsScrollto || ((_a = gotoLink.getAttribute("href")) == null ? void 0 : _a.replace("#", "#")) || "";
  }
  isCurrentPage(pageUrl) {
    const currentPath = window.location.pathname;
    const targetPath = new URL(pageUrl, window.location.origin).pathname;
    return currentPath === targetPath;
  }
  navigateToPageWithSection(pageUrl, selector) {
    const hash = selector.replace(/^[#.]/, "");
    const urlWithHash = `${pageUrl}#${hash}`;
    sessionStorage.setItem("scrollToSection", JSON.stringify({
      selector,
      timestamp: Date.now()
    }));
    window.location.href = urlWithHash;
  }
  scrollToSection(selector, noHeader = false, speed = 500, offsetTop = 0) {
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.warn(`UniversalNavigation: Element with selector "${selector}" not found`);
      return;
    }
    let headerHeight = 0;
    if (noHeader) {
      headerHeight = this.getHeaderHeight();
    }
    let targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    targetPosition = headerHeight ? targetPosition - headerHeight : targetPosition;
    targetPosition = offsetTop ? targetPosition - offsetTop : targetPosition;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
    console.log(`UniversalNavigation: Scrolled to ${selector}`);
  }
  getHeaderHeight() {
    const headerElement = document.querySelector(this.options.headerSelector);
    if (!headerElement) return 0;
    if (headerElement.classList.contains(this.options.headerScrollClass)) {
      return headerElement.offsetHeight;
    }
    headerElement.style.cssText = "transition-duration: 0s;";
    headerElement.classList.add(this.options.headerScrollClass);
    const height = headerElement.offsetHeight;
    headerElement.classList.remove(this.options.headerScrollClass);
    setTimeout(() => {
      headerElement.style.cssText = "";
    }, 0);
    return height;
  }
  closeMenu() {
    if (document.documentElement.hasAttribute(this.options.menuOpenAttribute)) {
      if (typeof bodyUnlock === "function") {
        bodyUnlock();
      }
      document.documentElement.removeAttribute(this.options.menuOpenAttribute);
    }
  }
  getHash() {
    return window.location.hash.replace("#", "");
  }
}
document.addEventListener("DOMContentLoaded", function() {
  window.universalNavigation = new UniversalNavigation({
    homePage: "/",
    // укажите путь к главной странице
    headerSelector: "header.header",
    scrollSpeed: 800,
    offsetTop: 20
  });
});
export {
  slideUp as a,
  bodyLockStatus as b,
  bodyLock as c,
  dataMediaQueries as d,
  bodyUnlock$1 as e,
  slideToggle as s
};
