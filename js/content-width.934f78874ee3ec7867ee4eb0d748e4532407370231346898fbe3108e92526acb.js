/**
 * 正文宽度：顶栏下拉里的拖动滑条
 *
 * 拖动时实时改写 <html> 上的 --rd-measure，正文列跟着变宽变窄。
 * 窄/标准/宽三档是滑条的吸附点，点一下直接跳过去。
 * 值存 localStorage["hbs:content-width"]（前缀跟主题的 localStorage 封装一致），
 * 首屏由 head 里的内联脚本先套用，避免默认宽度闪一下。
 * 顶栏里没有这个控件时静默退出。
 */
(function () {
  "use strict";

  var KEY = "hbs:content-width";
  var MIN = 28;   // rem，约 25 字/行
  var MAX = 62;   // rem，约 55 字/行；再宽就被外层容器的 1500px 上限截住了
  var DEFAULT = 47;   // 主题里原有的 --rd-measure
  var CHARS_PER_REM = 16 / 18;   // .post-content 是 1.125rem(18px)，根字号 16px

  var range = document.getElementById("contentWidthRange");
  if (!range) return;

  var readout = document.getElementById("contentWidthValue");
  var steps = document.querySelectorAll(".content-width-step");
  var root = document.documentElement;

  function clamp(v) {
    v = parseInt(v, 10);
    if (isNaN(v)) return DEFAULT;
    return Math.min(MAX, Math.max(MIN, v));
  }

  function apply(v) {
    root.style.setProperty("--rd-measure", v + "rem");
    if (readout) {
      readout.textContent = Math.round(v * CHARS_PER_REM) + " 字/行";
    }
    for (var i = 0; i < steps.length; i++) {
      var on = clamp(steps[i].getAttribute("data-width")) === v;
      steps[i].classList.toggle("active", on);
    }
  }

  function save(v) {
    try {
      localStorage.setItem(KEY, String(v));
    } catch (e) {
      // 隐私模式下写不进去就算了，本次会话照样生效
    }
  }

  function set(v, persist) {
    v = clamp(v);
    range.value = String(v);
    apply(v);
    if (persist !== false) save(v);
  }

  // 首屏已经由 head 的内联脚本套用过一次，这里只把控件状态对齐
  var stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {
    stored = null;
  }
  set(stored === null ? DEFAULT : stored, false);

  range.addEventListener("input", function () { set(range.value, false); });
  range.addEventListener("change", function () { set(range.value); });

  for (var i = 0; i < steps.length; i++) {
    steps[i].addEventListener("click", function () {
      set(this.getAttribute("data-width"));
    });
  }
})();
