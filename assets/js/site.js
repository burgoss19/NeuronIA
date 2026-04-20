const menuToggle = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("[data-main-nav]");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const cookieStorageKey = "neuronia_cookie_preferences";
const defaultCookiePreferences = {
  essential: true,
  analytics: false,
  personalization: false,
  ads: false,
  updatedAt: null,
};

function normalizeCookiePreferences(raw) {
  return {
    essential: true,
    analytics: Boolean(raw && raw.analytics),
    personalization: Boolean(raw && raw.personalization),
    ads: Boolean(raw && raw.ads),
    updatedAt: raw && raw.updatedAt ? raw.updatedAt : null,
  };
}

function readCookiePreferences() {
  try {
    const stored = window.localStorage.getItem(cookieStorageKey);
    if (!stored) {
      return null;
    }

    return normalizeCookiePreferences(JSON.parse(stored));
  } catch (error) {
    return null;
  }
}

function dispatchCookiePreferences(preferences) {
  const detail = normalizeCookiePreferences(preferences || defaultCookiePreferences);
  document.documentElement.dataset.cookieAnalytics = detail.analytics ? "granted" : "denied";
  document.documentElement.dataset.cookiePersonalization = detail.personalization ? "granted" : "denied";
  document.documentElement.dataset.cookieAds = detail.ads ? "granted" : "denied";

  document.dispatchEvent(
    new CustomEvent("neuronia:cookie-preferences", {
      detail,
    }),
  );
}

function saveCookiePreferences(preferences) {
  const nextPreferences = normalizeCookiePreferences({
    ...preferences,
    updatedAt: new Date().toISOString(),
  });

  window.localStorage.setItem(cookieStorageKey, JSON.stringify(nextPreferences));
  dispatchCookiePreferences(nextPreferences);

  return nextPreferences;
}

function buildCookieUi() {
  const currentPreferences = readCookiePreferences();
  dispatchCookiePreferences(currentPreferences || defaultCookiePreferences);

  const consentRoot = document.createElement("div");
  consentRoot.className = "cookie-consent-root";
  consentRoot.innerHTML = `
    <button class="cookie-launcher" type="button" data-cookie-launcher hidden>
      Privacidad y cookies
    </button>
    <div class="cookie-backdrop" data-cookie-backdrop hidden></div>
    <section class="cookie-banner" data-cookie-banner hidden aria-label="Aviso de cookies">
      <div class="cookie-copy">
        <span class="card-kicker">Privacidad y consentimiento</span>
        <h2>Gestiona cómo quieres que funcione la medición y la personalización.</h2>
        <p>
          Usamos almacenamiento local y, cuando corresponda, cookies técnicas para que la web funcione correctamente.
          Las opciones de analítica, personalización y publicidad solo deben activarse si tú lo decides.
        </p>
      </div>
      <div class="button-row cookie-actions">
        <button class="button button-primary" type="button" data-cookie-action="accept">
          Aceptar selección completa
        </button>
        <button class="button button-secondary" type="button" data-cookie-action="reject">
          Rechazar opcionales
        </button>
        <button class="button button-secondary" type="button" data-cookie-action="configure">
          Configurar
        </button>
      </div>
    </section>
    <section
      class="cookie-panel"
      data-cookie-panel
      hidden
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-panel-title"
    >
      <div class="cookie-panel-head">
        <div>
          <span class="card-kicker">Centro de preferencias</span>
          <h2 id="cookie-panel-title">Decide qué categorías quieres permitir.</h2>
        </div>
        <button class="cookie-close" type="button" data-cookie-close aria-label="Cerrar preferencias de cookies">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p class="cookie-panel-intro">
        Puedes cambiar estas preferencias en cualquier momento desde el acceso fijo de privacidad. Las categorías
        técnicas son necesarias para el funcionamiento básico del sitio y siempre permanecen activas.
      </p>
      <div class="cookie-pref-grid">
        <label class="cookie-option cookie-option-locked">
          <span>
            <strong>Necesarias</strong>
            <small>Siempre activas para la navegación básica, seguridad y guardado de tus preferencias.</small>
          </span>
          <input type="checkbox" checked disabled />
        </label>
        <label class="cookie-option">
          <span>
            <strong>Analítica</strong>
            <small>Permite medir uso, contenidos más consultados y mejoras de experiencia.</small>
          </span>
          <input type="checkbox" data-cookie-field="analytics" />
        </label>
        <label class="cookie-option">
          <span>
            <strong>Personalización</strong>
            <small>Guarda ajustes visuales o preferencias no esenciales para adaptar mejor la experiencia.</small>
          </span>
          <input type="checkbox" data-cookie-field="personalization" />
        </label>
        <label class="cookie-option">
          <span>
            <strong>Publicidad</strong>
            <small>Preparado para futuras integraciones publicitarias y medición asociada, solo si lo autorizas.</small>
          </span>
          <input type="checkbox" data-cookie-field="ads" />
        </label>
      </div>
      <div class="button-row cookie-actions">
        <button class="button button-primary" type="button" data-cookie-action="save">
          Guardar preferencias
        </button>
        <button class="button button-secondary" type="button" data-cookie-action="accept">
          Aceptar todo
        </button>
      </div>
    </section>
  `;

  document.body.append(consentRoot);

  const banner = consentRoot.querySelector("[data-cookie-banner]");
  const panel = consentRoot.querySelector("[data-cookie-panel]");
  const backdrop = consentRoot.querySelector("[data-cookie-backdrop]");
  const launcher = consentRoot.querySelector("[data-cookie-launcher]");
  const closeButton = consentRoot.querySelector("[data-cookie-close]");
  const fields = {
    analytics: consentRoot.querySelector('[data-cookie-field="analytics"]'),
    personalization: consentRoot.querySelector('[data-cookie-field="personalization"]'),
    ads: consentRoot.querySelector('[data-cookie-field="ads"]'),
  };

  function syncFields(preferences) {
    fields.analytics.checked = Boolean(preferences.analytics);
    fields.personalization.checked = Boolean(preferences.personalization);
    fields.ads.checked = Boolean(preferences.ads);
  }

  function openPanel() {
    backdrop.hidden = false;
    panel.hidden = false;
    document.body.classList.add("cookie-panel-open");
  }

  function closePanel() {
    backdrop.hidden = true;
    panel.hidden = true;
    document.body.classList.remove("cookie-panel-open");
  }

  function hideBanner() {
    banner.hidden = true;
  }

  function showBanner() {
    banner.hidden = false;
  }

  function updateLauncherVisibility(hasPreferences) {
    launcher.hidden = !hasPreferences;
  }

  function applySavedState(preferences) {
    syncFields(preferences);
    hideBanner();
    closePanel();
    updateLauncherVisibility(true);
  }

  function acceptAll() {
    const preferences = saveCookiePreferences({
      analytics: true,
      personalization: true,
      ads: true,
    });

    applySavedState(preferences);
  }

  function rejectOptional() {
    const preferences = saveCookiePreferences({
      analytics: false,
      personalization: false,
      ads: false,
    });

    applySavedState(preferences);
  }

  function saveFromPanel() {
    const preferences = saveCookiePreferences({
      analytics: fields.analytics.checked,
      personalization: fields.personalization.checked,
      ads: fields.ads.checked,
    });

    applySavedState(preferences);
  }

  consentRoot.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-cookie-action]");
    if (trigger) {
      const { cookieAction } = trigger.dataset;

      if (cookieAction === "accept") {
        acceptAll();
      }

      if (cookieAction === "reject") {
        rejectOptional();
      }

      if (cookieAction === "configure") {
        openPanel();
      }

      if (cookieAction === "save") {
        saveFromPanel();
      }
    }

    if (event.target.matches("[data-cookie-launcher]")) {
      const latestPreferences = readCookiePreferences() || defaultCookiePreferences;
      syncFields(latestPreferences);
      openPanel();
    }
  });

  closeButton.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);

  document.querySelectorAll("[data-open-cookie-preferences]").forEach((button) => {
    button.addEventListener("click", () => {
      const latestPreferences = readCookiePreferences() || defaultCookiePreferences;
      syncFields(latestPreferences);
      openPanel();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });

  if (currentPreferences) {
    syncFields(currentPreferences);
    updateLauncherVisibility(true);
  } else {
    syncFields(defaultCookiePreferences);
    showBanner();
    updateLauncherVisibility(false);
  }
}

if (document.body) {
  buildCookieUi();
}
