document.documentElement.classList.add("js");

(() => {
  "use strict";

  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const menuButton = document.getElementById("menuButton");
  const mobileMenu = document.getElementById("mobileMenu");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = lenis ? lenis.progress : scrollable > 0 ? scrollTop / scrollable : 0;

    header?.classList.toggle("scrolled", scrollTop > 16);

    if (progress) {
      progress.style.width = `${Math.min(Math.max(scrollProgress, 0), 1) * 100}%`;
    }
  };

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    mobileMenu.inert = true;
    mobileMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
    lenis?.start();
  };

  menuButton?.addEventListener("click", () => {
    if (!mobileMenu) return;
    const opening = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opening));
    menuButton.setAttribute("aria-label", opening ? "Close menu" : "Open menu");
    mobileMenu.inert = !opening;
    mobileMenu.classList.toggle("open", opening);
    document.body.classList.toggle("menu-open", opening);

    if (opening) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const revealItems = [...document.querySelectorAll(".reveal")];

  const revealWithoutGSAP = () => {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const delay = Number(entry.target.dataset.delay || 0);
          entry.target.style.setProperty("--delay", `${delay}ms`);
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -56px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    revealWithoutGSAP();
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new window.Lenis({
      lerp: 0.095,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: {
        offset: -72,
        duration: 1.05
      },
      stopInertiaOnNavigate: true
    });

    lenis.on("scroll", () => {
      updateScrollUI();
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  const heroReveals = [...document.querySelectorAll(".hero .reveal")];
  const scrollReveals = revealItems.filter((item) => !item.closest(".hero"));

  heroReveals.forEach((item) => {
    const delay = Number(item.dataset.delay || 0) / 1000;

    gsap.fromTo(
      item,
      { autoAlpha: 0, y: 22 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.78,
        delay,
        ease: "power3.out"
      }
    );
  });

  scrollReveals.forEach((item) => {
    const delay = Number(item.dataset.delay || 0) / 1000;

    gsap.fromTo(
      item,
      { autoAlpha: 0, y: 26 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          once: true
        }
      }
    );
  });

  const motionMedia = gsap.matchMedia();

  motionMedia.add("(min-width: 681px)", () => {
    gsap.to(".phone-hero", {
      "--phone-shift": "-38px",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.1
      }
    });

    [
      [".phone-back", "-12px"],
      [".phone-front", "-34px"],
      [".phone-side", "-20px"]
    ].forEach(([selector, shift]) => {
      gsap.to(selector, {
        "--phone-shift": shift,
        ease: "none",
        scrollTrigger: {
          trigger: ".score-screens",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2
        }
      });
    });

    gsap.utils.toArray(".phone-feature").forEach((phone) => {
      gsap.fromTo(
        phone,
        { "--phone-shift": "34px" },
        {
          "--phone-shift": "-28px",
          ease: "none",
          scrollTrigger: {
            trigger: phone.closest(".feature-panel"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1.15
          }
        }
      );
    });

    gsap.utils.toArray(".phone-card").forEach((phone) => {
      gsap.fromTo(
        phone,
        { "--phone-shift": "26px" },
        {
          "--phone-shift": "-22px",
          ease: "none",
          scrollTrigger: {
            trigger: phone.closest(".feature-card"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1.15
          }
        }
      );
    });

    gsap.to(".phone-report-front", {
      "--phone-shift": "-32px",
      ease: "none",
      scrollTrigger: {
        trigger: ".report-stage",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2
      }
    });

    gsap.to(".phone-report-back", {
      "--phone-shift": "-14px",
      ease: "none",
      scrollTrigger: {
        trigger: ".report-stage",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2
      }
    });
  });

  motionMedia.add("(hover: hover) and (pointer: fine)", () => {
    const cleanups = [...document.querySelectorAll("[data-magnetic]")].map((target) => {
      const moveX = gsap.quickTo(target, "x", { duration: 0.34, ease: "power3.out" });
      const moveY = gsap.quickTo(target, "y", { duration: 0.34, ease: "power3.out" });

      const onPointerMove = (event) => {
        const bounds = target.getBoundingClientRect();
        moveX((event.clientX - bounds.left - bounds.width / 2) * 0.14);
        moveY((event.clientY - bounds.top - bounds.height / 2) * 0.18);
      };

      const onPointerLeave = () => {
        moveX(0);
        moveY(0);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerleave", onPointerLeave);

      return () => {
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerleave", onPointerLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });

  const navLinks = [...document.querySelectorAll(".nav-links a, .mobile-menu a")];

  document.querySelectorAll("main section[id]").forEach((section) => {
    const matchingLinks = navLinks.filter((link) => link.hash === `#${section.id}`);
    if (!matchingLinks.length) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top 44%",
      end: "bottom 44%",
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        navLinks.forEach((link) => link.removeAttribute("aria-current"));
        matchingLinks.forEach((link) => link.setAttribute("aria-current", "location"));
      }
    });
  });

  window.addEventListener(
    "load",
    () => {
      ScrollTrigger.refresh();
      updateScrollUI();
    },
    { once: true }
  );
})();
