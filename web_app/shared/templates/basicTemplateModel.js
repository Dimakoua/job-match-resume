const toArray = (value) => (Array.isArray(value) ? value : []);

const toStringSafe = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const pickSections = (resume) => {
  if (resume && typeof resume === 'object' && resume.sections && typeof resume.sections === 'object') {
    return resume.sections;
  }
  return resume && typeof resume === 'object' ? resume : {};
};

const normalizeExperience = (experience) => toArray(experience).map((item) => {
  const entry = item && typeof item === 'object' ? item : {};
  const startDate = toStringSafe(entry.startDate);
  const endDate = toStringSafe(entry.endDate);
  const fallbackDate = toStringSafe(entry.date);
  const dateLine = [startDate, endDate].filter(Boolean).join(' - ') || fallbackDate;

  return {
    company: toStringSafe(entry.company),
    title: toStringSafe(entry.title),
    startDate,
    endDate,
    date: fallbackDate,
    dateLine,
    location: toStringSafe(entry.location),
    description: toStringSafe(entry.description),
    achievements: toArray(entry.achievements).map(toStringSafe).filter(Boolean)
  };
}).filter((item) => item.company || item.title || item.description || item.achievements.length > 0);

const normalizeEducation = (education) => toArray(education).map((item) => {
  const entry = item && typeof item === 'object' ? item : {};
  const degree = toStringSafe(entry.degree);
  const field = toStringSafe(entry.field);
  const startDate = toStringSafe(entry.startDate);
  const endDate = toStringSafe(entry.endDate);
  const year = toStringSafe(entry.year);

  return {
    school: toStringSafe(entry.school),
    degree,
    field,
    degreeLine: [degree, field].filter(Boolean).join(', '),
    startDate,
    endDate,
    year,
    dateLine: [startDate, endDate].filter(Boolean).join(' - ') || year
  };
}).filter((item) => item.school || item.degree || item.field);

const normalizeProjects = (projects) => toArray(projects).map((item) => {
  const entry = item && typeof item === 'object' ? item : {};
  const link = toStringSafe(entry.link || entry.url);
  return {
    name: toStringSafe(entry.name),
    description: toStringSafe(entry.description),
    url: link,
    link
  };
}).filter((item) => item.name || item.description || item.url);

const normalizeCertifications = (certifications) => toArray(certifications).map((item) => {
  const entry = item && typeof item === 'object' ? item : {};
  const name = toStringSafe(entry.name);
  const issuer = toStringSafe(entry.issuer);
  const date = toStringSafe(entry.date);

  return {
    name,
    issuer,
    date,
    textLine: `${name}${issuer ? ` - ${issuer}` : ''}${date ? ` (${date})` : ''}`.trim()
  };
}).filter((item) => item.name || item.issuer || item.date);

const normalizeSkills = (rawSkills) => {
  if (Array.isArray(rawSkills)) {
    const tags = rawSkills
      .map((skill) => {
        if (typeof skill === 'string') return toStringSafe(skill);
        if (skill && typeof skill === 'object') return toStringSafe(skill.name || skill.value || skill.label);
        return '';
      })
      .filter(Boolean);

    return {
      tags,
      text: tags.join(', ')
    };
  }

  if (rawSkills && typeof rawSkills === 'object') {
    const technical = toArray(rawSkills.technical).map(toStringSafe).filter(Boolean);
    const soft = toArray(rawSkills.soft).map(toStringSafe).filter(Boolean);
    const languages = toArray(rawSkills.languages).map(toStringSafe).filter(Boolean);

    const grouped = [];
    if (technical.length > 0) grouped.push(`Technical: ${technical.join(', ')}`);
    if (soft.length > 0) grouped.push(`Soft: ${soft.join(', ')}`);
    if (languages.length > 0) grouped.push(`Languages: ${languages.join(', ')}`);

    return {
      tags: [...technical, ...soft, ...languages],
      text: grouped.join('; ')
    };
  }

  const text = toStringSafe(rawSkills);
  return {
    tags: text ? [text] : [],
    text
  };
};

const toCustomSections = (customSections) => {
  if (!customSections || typeof customSections !== 'object') return {};

  return Object.entries(customSections).reduce((acc, [id, content]) => {
    const safeId = toStringSafe(id);
    const safeContent = toStringSafe(content);
    if (safeId && safeContent) {
      acc[safeId] = safeContent;
    }
    return acc;
  }, {});
};

export function buildBasicTemplateModel(resume) {
  const sections = pickSections(resume);

  const firstName = toStringSafe(sections.firstName);
  const lastName = toStringSafe(sections.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  const experience = normalizeExperience(sections.experience);
  const education = normalizeEducation(sections.education);
  const projects = normalizeProjects(sections.projects);
  const certifications = normalizeCertifications(sections.certifications);
  const skills = normalizeSkills(sections.skills);
  const customSections = toCustomSections(sections.customSections);

  const contacts = [
    toStringSafe(sections.email),
    toStringSafe(sections.phone),
    toStringSafe(sections.location),
    toStringSafe(sections.linkedin)
  ].filter(Boolean);

  return {
    header: {
      firstName,
      lastName,
      fullName,
      title: toStringSafe(sections.title),
      contacts,
      contactLine: contacts.join(' | ')
    },
    summary: toStringSafe(sections.summary),
    experience,
    education,
    skills,
    projects,
    certifications,
    customSections,
    webResume: {
      firstName,
      lastName,
      fullName,
      title: toStringSafe(sections.title),
      email: toStringSafe(sections.email),
      phone: toStringSafe(sections.phone),
      location: toStringSafe(sections.location),
      linkedin: toStringSafe(sections.linkedin),
      contactLine: contacts.join(' | '),
      summary: toStringSafe(sections.summary),
      experience,
      education,
      skills: skills.tags,
      skillsText: skills.text,
      projects,
      certifications,
      customSections
    }
  };
}
