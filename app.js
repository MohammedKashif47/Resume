// Renders the portfolio from resume.json (JSON Resume schema).
(async function () {
  const $ = (id) => document.getElementById(id);

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m] = d.split("-");
    return m ? `${MONTHS[parseInt(m, 10) - 1]} ${y}` : y;
  };
  const range = (start, end) => {
    if (!start && !end) return "";
    return `${fmtDate(start)} – ${end ? fmtDate(end) : "Present"}`;
  };
  const show = (id) => { $(id).hidden = false; };

  let data;
  try {
    const res = await fetch("resume.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    $("hero").innerHTML = `<div class="wrap"><p class="error">Could not load resume.json (${esc(err.message)}). Run the site through a local server, for example <code>python -m http.server 8000</code>.</p></div>`;
    return;
  }

  // Hero
  const b = data.basics || {};
  if (b.name) document.title = `${b.name} | Portfolio`;
  const loc = b.location ? [b.location.city, b.location.countryCode].filter(Boolean).join(", ") : "";
  const links = [];
  if (b.email) links.push(`<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`);
  if (b.phone) links.push(`<a href="tel:${esc(b.phone.replace(/\s/g, ""))}">${esc(b.phone)}</a>`);
  (b.profiles || []).forEach((p) => {
    if (p.url) links.push(`<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.network)}</a>`);
  });
  if (b.url) links.push(`<a href="${esc(b.url)}" target="_blank" rel="noopener">Website</a>`);

  $("hero").innerHTML = `
    <div class="wrap hero-inner">
      ${b.image ? `<img class="avatar" src="${esc(b.image)}" alt="Photo of ${esc(b.name)}">` : ""}
      <h1>${esc(b.name)}</h1>
      ${b.label ? `<p class="label">${esc(b.label)}</p>` : ""}
      ${loc ? `<p class="location">${esc(loc)}</p>` : ""}
      ${links.length ? `<p class="links">${links.join("")}</p>` : ""}
    </div>`;

  // Summary
  if (b.summary) {
    $("summary").textContent = b.summary;
    show("summary-section");
  }

  // Work
  const work = data.work || [];
  if (work.length) {
    $("work-list").innerHTML = work.map((w) => `
      <article class="card timeline-item">
        <div class="card-head">
          <div>
            <h3>${esc(w.position)}</h3>
            <p class="org">${esc(w.name)}${w.location ? ` · ${esc(w.location)}` : ""}</p>
            ${w.description ? `<p class="muted">${esc(w.description)}</p>` : ""}
          </div>
          <span class="date">${esc(range(w.startDate, w.endDate))}</span>
        </div>
        ${w.summary ? `<p>${esc(w.summary)}</p>` : ""}
        ${(w.highlights || []).length ? `<ul>${w.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      </article>`).join("");
    show("experience-section");
  }

  // Projects
  const projects = data.projects || [];
  if (projects.length) {
    $("project-list").innerHTML = projects.map((p) => `
      <article class="card">
        <h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h3>
        ${p.description ? `<p>${esc(p.description)}</p>` : ""}
        ${(p.highlights || []).length ? `<ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      </article>`).join("");
    show("projects-section");
  }

  // Skills
  const skills = data.skills || [];
  if (skills.length) {
    $("skill-list").innerHTML = skills.map((s) => `
      <div class="skill">
        <h3>${esc(s.name)}</h3>
        ${(s.keywords || []).length ? `<div class="tags">${s.keywords.map((k) => `<span class="tag">${esc(k)}</span>`).join("")}</div>` : ""}
      </div>`).join("");
    show("skills-section");
  }

  // Education
  const edu = data.education || [];
  if (edu.length) {
    $("edu-list").innerHTML = edu.map((e) => `
      <article class="card">
        <div class="card-head">
          <div>
            <h3>${esc([e.studyType, e.area].filter(Boolean).join(", "))}</h3>
            <p class="org">${esc(e.institution)}</p>
          </div>
          <span class="date">${esc(range(e.startDate, e.endDate))}</span>
        </div>
      </article>`).join("");
    show("education-section");
  }

  // Certificates
  const certs = data.certificates || [];
  if (certs.length) {
    $("cert-list").innerHTML = certs.map((c) => `
      <div class="cert">
        <h3>${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}</h3>
        <p class="muted">${esc([c.issuer, fmtDate(c.date)].filter(Boolean).join(" · "))}</p>
      </div>`).join("");
    show("certificates-section");
  }

  // Contact
  if (b.email) {
    $("contact-btn").href = `mailto:${b.email}`;
    show("contact-section");
  }
})();
