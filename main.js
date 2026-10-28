(function () {
  "use strict";

  var REPO_API = "https://api.github.com/repos/Eslamfoka/nourtubeapk/releases/latest";
  var APK_NAME = "NourTubeV1-Plus-arm64-v8a.apk";
  var root = document.documentElement;
  root.classList.add("js");

  // ---- language: ?lang= beats saved choice beats Arabic default ----
  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar"
      ? "NourTube — كل ما تشاهده في تطبيق واحد"
      : "NourTube — Everything you watch, in one app";
    try { localStorage.setItem("nt-lang", lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem("nt-lang"); } catch (e) {}
  var fromUrl = new URLSearchParams(location.search).get("lang");
  setLang(fromUrl === "en" || fromUrl === "ar" ? fromUrl : (saved || "ar"));
  document.getElementById("langToggle").addEventListener("click", function () {
    setLang(root.lang === "ar" ? "en" : "ar");
  });

  // ---- footer year ----
  document.querySelectorAll(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- live version + size from the release; the static text stays if this fails ----
  fetch(REPO_API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (rel) {
      var asset = (rel.assets || []).filter(function (a) { return a.name === APK_NAME; })[0];
      if (!asset) return;
      var version = String(rel.tag_name || "").replace(/^v?/, "v");
      var mb = Math.round(asset.size / 1048576);
      document.querySelectorAll(".js-version").forEach(function (el) { el.textContent = version; });
      document.querySelectorAll(".js-meta").forEach(function (el) {
        el.innerHTML =
          // <bdi> keeps the Latin version from reordering the Arabic run around it.
          '<span data-l="ar"><bdi>' + version + "</bdi> · <bdi>" + mb + " ميجا</bdi> · مجاني</span>" +
          '<span data-l="en">' + version + " · " + mb + " MB · Free</span>";
      });
    })
    .catch(function () {});

  // ---- share ----
  document.getElementById("shareBtn").addEventListener("click", function () {
    var data = { title: "NourTube", text: root.lang === "ar" ? "حمّل NourTube مجانًا" : "Get NourTube free", url: location.origin + location.pathname };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard) {
      var btn = this;
      navigator.clipboard.writeText(data.url).then(function () {
        var old = btn.innerHTML;
        btn.textContent = root.lang === "ar" ? "تم نسخ الرابط ✓" : "Link copied ✓";
        setTimeout(function () { btn.innerHTML = old; }, 1800);
      });
    }
  });

  // ---- reveal on scroll ----
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach(function (el) { io.observe(el); });
})();
