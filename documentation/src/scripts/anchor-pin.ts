// Live sandboxes (and other client-only islands) mount after load and grow the
// page, so the browser's initial jump to a #hash lands short and stays there.
// Re-pin the target while the layout is still settling, then hand control back
// to the user on their first deliberate scroll.
export const keepAnchorPinned = () => {
  const id = window.location.hash.slice(1);
  const el = id ? document.getElementById(id) : null;
  if (!el) return;

  let active = true;
  const ro = new ResizeObserver(() => {
    if (active) el.scrollIntoView();
  });
  const release = () => {
    active = false;
    ro.disconnect();
  };

  ro.observe(document.body);
  for (const evt of ["wheel", "touchstart", "keydown", "pointerdown"]) {
    window.addEventListener(evt, release, { once: true, passive: true });
  }
  setTimeout(release, 3000);
};
