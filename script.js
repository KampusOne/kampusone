(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });

  const progressTrack = document.createElement("div");
  const progressValue = document.createElement("span");
  progressTrack.className = "scroll-progress";
  progressTrack.setAttribute("aria-hidden", "true");
  progressTrack.append(progressValue);
  document.body.prepend(progressTrack);

  const heroCampus = document.querySelector(".hero-campus");
  const heroStudents = document.querySelector(".hero-students");
  const productStage = document.querySelector(".product-stage");
  const launchDevices = document.querySelector(".launch-devices");
  let scrollFrame = 0;

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function updateScrollMotion() {
    scrollFrame = 0;
    const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = clamp(window.scrollY / scrollRange, 0, 1);
    progressTrack.style.setProperty("--scroll-progress", String(progress));

    if (reducedMotion.matches) return;

    if (heroCampus || heroStudents) {
      const heroProgress = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
      heroCampus?.style.setProperty("--campus-shift", `${(heroProgress * 16).toFixed(1)}px`);
      heroStudents?.style.setProperty("--student-shift", `${(heroProgress * -12).toFixed(1)}px`);
    }

    if (productStage) {
      const rect = productStage.getBoundingClientRect();
      const stageProgress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
      productStage.style.setProperty("--depth-y", `${((stageProgress - 0.5) * -16).toFixed(1)}px`);
    }

    if (launchDevices) {
      const rect = launchDevices.getBoundingClientRect();
      const launchProgress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
      launchDevices.style.setProperty("--launch-shift", `${((launchProgress - 0.5) * -20).toFixed(1)}px`);
    }
  }

  function requestScrollMotion() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollMotion);
  }

  updateScrollMotion();
  window.addEventListener("scroll", requestScrollMotion, { passive: true });
  window.addEventListener("resize", requestScrollMotion);

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

  document.querySelectorAll(".site-footer, .article-body section").forEach((node) => {
    node.classList.add("reveal-section");
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

  const motionSceneNodes = document.querySelectorAll(
    ".story-section, .signal-section, .schedule-story, .movement-story, .campus-economy, .department-story, .launch-teaser, .about-origin, .about-direction, .team-editorial, .blog-index",
  );

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    if (!reducedMotion.matches) motionSceneNodes.forEach((node) => node.classList.add("is-motion-active"));
  } else {
    const motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-motion-active", entry.isIntersecting);
        });
      },
      { threshold: 0.16, rootMargin: "-6% 0px -8% 0px" },
    );
    motionSceneNodes.forEach((node) => motionObserver.observe(node));
  }

  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("is-page-hidden", document.hidden);
  });

  const mapDemo = document.querySelector("[data-map-demo]");
  const mapRouteTitle = mapDemo?.querySelector("[data-map-route-title]");
  const mapRouteDetail = mapDemo?.querySelector("[data-map-route-detail]");
  const mapReplay = mapDemo?.querySelector("[data-map-replay]");
  let routeReplayTimer = 0;
  let mapTapTimer = 0;

  function replayMapRoute() {
    if (!mapDemo || reducedMotion.matches) return;
    window.clearTimeout(routeReplayTimer);
    mapDemo.classList.remove("is-route-replaying");
    void mapDemo.offsetWidth;
    mapDemo.classList.add("is-route-replaying");
    routeReplayTimer = window.setTimeout(() => mapDemo.classList.remove("is-route-replaying"), 1100);
  }

  mapDemo?.querySelectorAll("[data-map-stop]").forEach((stop) => {
    stop.addEventListener("click", () => {
      mapDemo.querySelectorAll("[data-map-stop]").forEach((item) => {
        const selected = item === stop;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      if (mapRouteTitle) mapRouteTitle.textContent = stop.dataset.routeTitle || stop.textContent;
      if (mapRouteDetail) mapRouteDetail.textContent = stop.dataset.routeDetail || "Route selected";
      replayMapRoute();
    });
  });

  mapReplay?.addEventListener("click", replayMapRoute);

  mapDemo?.addEventListener("pointerdown", (event) => {
    const rect = mapDemo.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    mapDemo.style.setProperty("--map-tap-x", `${x.toFixed(1)}%`);
    mapDemo.style.setProperty("--map-tap-y", `${y.toFixed(1)}%`);
    window.clearTimeout(mapTapTimer);
    mapDemo.classList.remove("has-map-tap");
    void mapDemo.offsetWidth;
    mapDemo.classList.add("has-map-tap");
    mapTapTimer = window.setTimeout(() => mapDemo.classList.remove("has-map-tap"), 700);
    if (!(event.target instanceof Element) || !event.target.closest("button")) replayMapRoute();
  });

  const tutorPreview = document.querySelector(".tutor-preview");
  const tutorStatus = tutorPreview?.querySelector("[data-tutor-status]");
  let tutorTimer = 0;

  tutorPreview?.querySelectorAll("[data-tutor-subject]").forEach((subjectButton) => {
    subjectButton.addEventListener("click", () => {
      tutorPreview.querySelectorAll("[data-tutor-subject]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === subjectButton));
      });
      if (tutorStatus) tutorStatus.textContent = `Matching help for ${subjectButton.dataset.tutorSubject}`;
      window.clearTimeout(tutorTimer);
      tutorPreview.classList.remove("is-tutor-switching");
      void tutorPreview.offsetWidth;
      tutorPreview.classList.add("is-tutor-switching");
      tutorTimer = window.setTimeout(() => tutorPreview.classList.remove("is-tutor-switching"), 700);
    });
  });

  const launchPhoneTimers = new WeakMap();
  document.querySelectorAll("[data-launch-phone]").forEach((phone) => {
    phone.addEventListener("click", () => {
      const existingTimer = launchPhoneTimers.get(phone);
      if (existingTimer) window.clearTimeout(existingTimer);
      const state = phone.querySelector(".launch-coming-state");
      if (!state) return;
      state.hidden = false;
      phone.classList.remove("is-coming");
      void phone.offsetWidth;
      phone.classList.add("is-coming");
      phone.setAttribute("aria-label", `Coming soon on ${phone.dataset.store || "your app store"}`);
      const timer = window.setTimeout(() => {
        phone.classList.remove("is-coming");
        window.setTimeout(() => {
          state.hidden = true;
          phone.setAttribute("aria-label", `Open the ${phone.dataset.store || "app"} preview`);
        }, 220);
      }, 1900);
      launchPhoneTimers.set(phone, timer);
    });
  });

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

    document.querySelectorAll(".product-stage").forEach((scene) => {
      scene.addEventListener("pointermove", (event) => {
        const rect = scene.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        scene.style.setProperty("--scene-x", `${(x * 12).toFixed(1)}px`);
        scene.style.setProperty("--scene-y", `${(y * 12).toFixed(1)}px`);
        scene.style.setProperty("--scene-x-inverse", `${(x * -8).toFixed(1)}px`);
        scene.style.setProperty("--scene-y-inverse", `${(y * -8).toFixed(1)}px`);
      });
      scene.addEventListener("pointerleave", () => {
        scene.style.setProperty("--scene-x", "0px");
        scene.style.setProperty("--scene-y", "0px");
        scene.style.setProperty("--scene-x-inverse", "0px");
        scene.style.setProperty("--scene-y-inverse", "0px");
      });
    });

    document.querySelectorAll("[data-map-demo]").forEach((map) => {
      map.addEventListener("pointermove", (event) => {
        const rect = map.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        map.style.setProperty("--map-pan-x", `${(x * -8).toFixed(1)}px`);
        map.style.setProperty("--map-pan-y", `${(y * -8).toFixed(1)}px`);
      });
      map.addEventListener("pointerleave", () => {
        map.style.setProperty("--map-pan-x", "0px");
        map.style.setProperty("--map-pan-y", "0px");
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
