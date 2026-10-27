const lenis = new Lenis({
    duration: 1,
    lerp: 0.1,
    direction: "vertical",
    gestureDirection: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
});

let lenisDrivenByGsap = false;

function raf(time) {
    if (!lenisDrivenByGsap) {
        lenis.raf(time);
    }
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
const scrollToTopBtn = document.querySelector(".scroll-to-top");
if (scrollToTopBtn) {
    const updateButtonVisibility = () => {
        const shouldShow = lenis.scroll > 300 || window.scrollY > 300;
        scrollToTopBtn.classList.toggle("visible", shouldShow);
    };

    lenis.on("scroll", updateButtonVisibility);
    updateButtonVisibility();

    scrollToTopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        lenis.scrollTo(0);
    });
}

const resetModalForm = (form) => {
    form.reset();

    const select = form.querySelector(".modal__select");

    if (select ?.choicesInstance) {
        select.choicesInstance.setChoiceByValue("Канада");
    }

    const phone = form.querySelector(".input-phone");

    if (phone) {
        phone.value = "";
    }
};

const formToast = document.getElementById("form-toast");

const showFormToast = () => {
    if (!formToast) {
        return;
    }

    formToast.classList.add("is-visible");
    formToast.setAttribute("aria-hidden", "false");
};

const hideFormToast = () => {
    if (!formToast) {
        return;
    }

    formToast.classList.remove("is-visible");
    formToast.setAttribute("aria-hidden", "true");
};

formToast ?.querySelector(".toast__close") ?.addEventListener("click", hideFormToast);

let clearFormOnClose = false;

const LEAD_ENDPOINT = "/send.php";

const COUNTRIES = [
    "Канада",
    "Казахстан",
    "Германия",
    "Польша",
    "Испания",
    "Франция",
    "Италия",
    "Чехия",
    "Великобритания",
    "США",
    "ОАЭ",
];

const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
const websitePattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

const readLead = (form) => ({
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    country: form.country.value,
    website: form.website.value.trim(),
    consent: form.consent.checked,
});

const validateLead = (form) => {
    const lead = readLead(form);
    const fields = [form.name, form.phone, form.country, form.website, form.consent];

    fields.forEach((field) => field.setCustomValidity(""));

    if (lead.name.length < 2) {
        form.name.setCustomValidity("Укажите ФИО");
    }

    if (!phonePattern.test(lead.phone)) {
        form.phone.setCustomValidity("Введите телефон полностью: +7 (900) 999-99-99");
    }

    if (!COUNTRIES.includes(lead.country)) {
        form.country.setCustomValidity("Выберите страну продвижения");
    }

    if (lead.website && !websitePattern.test(lead.website)) {
        form.website.setCustomValidity("Укажите адрес сайта, например https://yoursite.com");
    }

    if (!lead.consent) {
        form.consent.setCustomValidity("Нужно согласие на обработку персональных данных");
    }

    return form.reportValidity() ? lead : null;
};

const sendLead = async (lead) => {
    const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(lead),
    });

    if (!response.ok) {
        throw new Error("send failed");
    }

    const result = await response.json();

    if (!result.ok) {
        throw new Error(result.message || "send failed");
    }
};

const initLucideIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
    }
};

const initSpotlightCards = () => {
    const cards = document.querySelectorAll(".spotlight-card");

    cards.forEach((card) => {
        const setPosition = (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty("--mx", `${x}%`);
            card.style.setProperty("--my", `${y}%`);
        };

        card.addEventListener("pointerenter", (event) => {
            card.classList.add("is-active");
            setPosition(event);
        });

        card.addEventListener("pointermove", setPosition);

        card.addEventListener("pointerleave", () => {
            card.classList.remove("is-active");
            card.style.setProperty("--mx", "50%");
            card.style.setProperty("--my", "50%");
        });
    });
};

const initScrollReveal = () => {
    const revealEls = document.querySelectorAll("[data-reveal]");

    const clearReveals = () => {
        revealEls.forEach((el) => {
            el.style.opacity = "1";
            el.style.transform = "none";
            el.style.clipPath = "none";
        });
    };

    if (!window.gsap || !window.ScrollTrigger) {
        clearReveals();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (typeof lenis !== "undefined" && lenis) {
        lenisDrivenByGsap = true;
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        clearReveals();
        gsap.set(revealEls, { clearProps: "opacity,transform,clipPath" });
        return;
    }
    const scroller = {
        start: "top 80%",
        end: "top 15%",
        toggleActions: "play none none reverse",
    };
    const fadeUp = (els, trigger, { y = 56, duration = 1.05, stagger = 0.18, start = scroller.start, end = scroller.end } = {}) => {
        const targets = gsap.utils.toArray(els).filter(Boolean);
        const triggerEl = typeof trigger === "string" ? document.querySelector(trigger) : trigger;
        if (!targets.length || !triggerEl) return;

        gsap.fromTo(
            targets,
            { opacity: 0, y },
            {
                opacity: 1,
                y: 0,
                duration,
                ease: "power3.out",
                stagger: targets.length > 1 ? stagger : 0,
                overwrite: "auto",
                scrollTrigger: {
                    trigger: triggerEl,
                    start,
                    end,
                    toggleActions: scroller.toggleActions,
                },
            }
        );
    };
    const heroContent = document.querySelector(".hero__content");
    const heroPreview = document.querySelector(".hero__preview");
    const heroBenefits = document.querySelector(".hero__benefits-list");

    if (heroContent || heroPreview || heroBenefits) {
        const heroBits = [heroContent, heroPreview, heroBenefits].filter(Boolean);
        gsap.set(heroBits, { opacity: 0 });

        const heroTl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });

        if (heroContent) {
            heroTl.to(heroContent, { opacity: 1, duration: 0.85 }, 0.15);
        }

        if (heroPreview) {
            gsap.set(heroPreview, { clipPath: "inset(0 0 100% 0)" });
            heroTl.to(
                heroPreview,
                { clipPath: "inset(0 0 0% 0)", opacity: 1, duration: 1, ease: "power3.inOut" },
                0.35
            );
        }

        if (heroBenefits) {
            heroTl.to(heroBenefits, { opacity: 1, duration: 0.85 }, "-=0.35");
        }
    }
    gsap.utils.toArray(".section-header").forEach((header) => {
        fadeUp(header.querySelectorAll(".h2, .section-header__tag, p"), header, {
            y: 32,
            duration: 0.9,
            stagger: 0.16,
        });
    });
    fadeUp(".problems__list > [data-reveal]", ".problems__list", { y: 64, stagger: 0.2, duration: 1.1 });
    fadeUp(".process__grid > [data-reveal]", ".process__grid", { y: 64, stagger: 0.16, duration: 1.1 });
    fadeUp(".dashboard__grid > [data-reveal]", ".dashboard__grid", { y: 56, stagger: 0.2, duration: 1.1 });
    fadeUp(".cases__header", ".cases__header", { y: 32, duration: 0.9 });
    fadeUp(".cases__grid > [data-reveal]", ".cases__grid", { y: 64, stagger: 0.16, duration: 1.1 });
    [
        { el: ".geo-banner__body", start: "top 85%", duration: 1.15 },
        { el: ".process__benefits", start: "top 85%", duration: 1.15 },
        { el: ".cta-banner__body", start: "top 85%", duration: 1.25 },
        { el: ".footer__body", start: "top 90%", duration: 1.05 },
    ].forEach(({ el, start, duration }) => {
        gsap.utils.toArray(el).forEach((node) => {
            gsap.fromTo(
                node,
                { clipPath: "inset(0 0 100% 0)", opacity: 0 },
                {
                    clipPath: "inset(0 0 0% 0)",
                    opacity: 1,
                    duration,
                    ease: "power3.inOut",
                    overwrite: "auto",
                    scrollTrigger: {
                        trigger: node,
                        start,
                        end: scroller.end,
                        toggleActions: scroller.toggleActions,
                    },
                }
            );
        });
    });
    fadeUp(".faq__intro", ".faq__intro", { y: 32, duration: 0.9 });
    fadeUp(".faq__accordion-item", ".faq__accordion-list", {
        y: 48,
        duration: 1,
        stagger: 0.16,
        start: "top 75%",
    });
    fadeUp(".faq__cta", ".faq__cta", { y: 40, duration: 1 });

    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });
};

document.addEventListener("DOMContentLoaded", function () {
    initLucideIcons();
    initSpotlightCards();
    initScrollReveal();
    const dashboardSwiper = new Swiper('.dashboard__swiper', {
        loop: true,
        speed: 600,
        slidesPerView: 1,
        spaceBetween: 0,
        autoHeight: false,
        watchOverflow: true,

        navigation: {
            nextEl: '.dashboard__nav-btn--next',
            prevEl: '.dashboard__nav-btn--prev',
        },
    });

    MicroModal.init({
        awaitOpenAnimation: true,
        awaitCloseAnimation: true,
        onShow: (modal, trigger) => {
            if (window.lenis) window.lenis.stop();
            else if (typeof lenis !== "undefined") lenis.stop();

            document.documentElement.classList.add("modal-scroll-lock");
            document.documentElement.style.setProperty("overflow", "hidden", "important");
            document.body.style.setProperty("overflow", "hidden", "important");

            const overlay = modal.querySelector(".modal__overlay");
            if (overlay) {
                overlay.setAttribute("data-lenis-prevent", "");
            }

            if (trigger) {
                const titleText = trigger.getAttribute("data-title");
                const btnText = trigger.getAttribute("data-btn");
                const modalTitle = modal.querySelector(".modal__title");
                const modalSubmitBtn = modal.querySelector(".modal__submit");

                if (titleText && modalTitle) modalTitle.textContent = titleText;
                if (btnText && modalSubmitBtn) modalSubmitBtn.textContent = btnText;
            }
            initChoices(modal);
        },
        onClose: (modal) => {
            document.documentElement.classList.remove("modal-scroll-lock");
            document.documentElement.style.removeProperty("overflow");
            document.body.style.removeProperty("overflow");

            const overlay = modal.querySelector(".modal__overlay");
            if (overlay) {
                overlay.removeAttribute("data-lenis-prevent");
            }

            if (window.lenis) window.lenis.start();
            else if (typeof lenis !== "undefined") lenis.start();
            setTimeout(() => {
                document.documentElement.style.removeProperty("overflow");
                document.body.style.removeProperty("overflow");
            }, 100);

            if (clearFormOnClose) {
                clearFormOnClose = false;
                const form = modal.querySelector("#contactForm2");

                if (form) {
                    setTimeout(() => resetModalForm(form), 350);
                }
            }
        },
    });

    const contactForm = document.getElementById("contactForm2");

    if (contactForm) {
        contactForm.addEventListener("input", (event) => {
            event.target.setCustomValidity("");
        });

        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const lead = validateLead(contactForm);

            if (!lead) {
                return;
            }

            const submitButton = contactForm.querySelector(".modal__submit");
            submitButton.disabled = true;

            try {
                await sendLead(lead);
                clearFormOnClose = true;
                MicroModal.close("modal-1");
                showFormToast();
            } catch (error) {
                submitButton.setCustomValidity("Не удалось отправить заявку. Попробуйте ещё раз.");
                submitButton.reportValidity();
                submitButton.setCustomValidity("");
            } finally {
                submitButton.disabled = false;
            }
        });
    }

});
const initChoices = (root = document) => {
    const scope = root instanceof Element ? root : document;

    scope.querySelectorAll(".modal__select").forEach((el) => {
        if (el.dataset.choicesInitialized === "true") {
            return;
        }

        el.dataset.choicesInitialized = "true";
        el.choicesInstance = new Choices(el, {
            searchEnabled: false,
            shouldSort: false,
            itemSelectText: "",
            position: "auto",
        });

        const dropdown = el.closest(".choices") ?.querySelector(".choices__list--dropdown");
        const list = dropdown ?.querySelector(".choices__list");

        if (dropdown && list) {
            dropdown.addEventListener("wheel", (event) => {
                const maxScroll = list.scrollHeight - list.clientHeight;

                if (maxScroll <= 0) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                list.scrollTop = Math.min(maxScroll, Math.max(0, list.scrollTop + event.deltaY));
            }, {
                passive: false
            });
        }
    });
};
$(function () {
    $(".input-phone").mask("+7 (999) 999-99-99");
});