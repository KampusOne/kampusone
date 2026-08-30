(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const menuShell = document.querySelector("[data-menu-shell]");
  const menuOpeners = document.querySelectorAll("[data-menu-open]");
  const menuCloser = document.querySelector("[data-menu-close]");
  const menuPanel = menuShell?.querySelector(".mobile-nav-panel");
  let lastFocused = null;

  const focusableMenuItems = () =>
    menuPanel
      ? [...menuPanel.querySelectorAll('a[href], button:not([disabled])')]
      : [];

  function openMenu() {
    if (!menuShell) return;
    lastFocused = document.activeElement;
    menuShell.classList.add("is-open");
    menuShell.setAttribute("aria-hidden", "false");
    menuOpeners.forEach((button) => button.setAttribute("aria-expanded", "true"));
    document.body.classList.add("menu-open");
    window.requestAnimationFrame(() => menuCloser?.focus());
  }

  function closeMenu() {
    if (!menuShell) return;
    menuShell.classList.remove("is-open");
    menuShell.setAttribute("aria-hidden", "true");
    menuOpeners.forEach((button) => button.setAttribute("aria-expanded", "false"));
    document.body.classList.remove("menu-open");
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  menuOpeners.forEach((button) => button.addEventListener("click", openMenu));
  menuCloser?.addEventListener("click", closeMenu);
  menuShell?.addEventListener("click", (event) => {
    if (event.target === menuShell) closeMenu();
  });
  menuPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (!menuShell?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusableMenuItems();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelectorAll("[data-progressive]").forEach((frame) => {
    const image = frame.querySelector("img");
    if (!image) return;
    const loaded = () => frame.classList.add("is-loaded");
    const failed = () => {
      frame.classList.add("is-error");
      frame.querySelector(".progressive-skeleton")?.setAttribute("hidden", "");
    };
    if (image.complete) {
      image.naturalWidth ? loaded() : failed();
    } else {
      image.addEventListener("load", loaded, { once: true });
      image.addEventListener("error", failed, { once: true });
    }
  });

  const revealNodes = document.querySelectorAll(".reveal-section");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  if (!reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const reverse = card.hasAttribute("data-tilt-reverse") ? -1 : 1;
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 8 * reverse;
        const rotateX = (0.5 - y) * 8;
        card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--shine-x", "50%");
        card.style.setProperty("--shine-y", "50%");
      });
    });
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (!contactForm) return;

  const fields = {
    name: contactForm.elements.namedItem("name"),
    email: contactForm.elements.namedItem("email"),
    subject: contactForm.elements.namedItem("subject"),
    message: contactForm.elements.namedItem("message"),
  };
  const submitButton = contactForm.querySelector("[data-submit-button]");
  const statusNode = contactForm.querySelector("[data-form-status]");
  const messageCount = contactForm.querySelector("[data-message-count]");

  function errorFor(name, value) {
    const clean = value.trim();
    if (name === "name" && clean.length < 2) return "Enter your name.";
    if (name === "email" && !/^\S+@\S+\.\S+$/.test(clean)) return "Enter a valid email address.";
    if (name === "subject" && clean.length < 3) return "Tell us what this is about.";
    if (name === "message" && clean.length < 20) return "Add at least 20 characters so we have enough context.";
    return "";
  }

  function showFieldError(name, message) {
    const field = fields[name];
    const node = contactForm.querySelector(`[data-error-for="${name}"]`);
    if (!(field instanceof HTMLElement) || !node) return;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    node.textContent = message;
    node.hidden = !message;
  }

  Object.entries(fields).forEach(([name, field]) => {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    field.addEventListener("blur", () => showFieldError(name, errorFor(name, field.value)));
    field.addEventListener("input", () => {
      showFieldError(name, "");
      if (statusNode) statusNode.textContent = "";
      if (name === "message" && messageCount) messageCount.textContent = String(field.value.length);
    });
  });

  function validateForm() {
    let valid = true;
    Object.entries(fields).forEach(([name, field]) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
      const message = errorFor(name, field.value);
      showFieldError(name, message);
      if (message) valid = false;
    });
    if (!valid) {
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
    }
    return valid;
  }

  function setFormStatus(type, message) {
    if (!statusNode) return;
    statusNode.innerHTML = "";
    if (!message) return;
    const paragraph = document.createElement("p");
    paragraph.className = type === "success" ? "form-success" : "form-failure";
    paragraph.textContent = message;
    statusNode.append(paragraph);
  }

  function setSubmitting(submitting) {
    if (!(submitButton instanceof HTMLButtonElement)) return;
    submitButton.disabled = submitting;
    submitButton.innerHTML = submitting
      ? '<span class="form-spinner" aria-hidden="true"></span>Sending message'
      : "Send message";
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormStatus("", "");
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = Object.fromEntries(
      Object.entries(fields).map(([name, field]) => [name, field.value.trim()]),
    );

    try {
      const endpoint = contactForm.dataset.contactEndpoint?.trim();
      if (!endpoint) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        throw new Error("Message delivery is not connected yet. Your draft is still here — please try again when enquiries open.");
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("We could not send your message. Please try again.");
      contactForm.reset();
      if (messageCount) messageCount.textContent = "0";
      setFormStatus("success", "Your message was sent successfully.");
    } catch (error) {
      setFormStatus("failure", error instanceof Error ? error.message : "We could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });
})();
