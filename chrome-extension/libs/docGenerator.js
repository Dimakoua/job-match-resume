const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Header,
    AlignmentType,
    convertInchesToTwip,
    TabStopType,
} = window.docx;

// Define page size and margins
const PAGE_WIDTH = convertInchesToTwip(8.5);  // Standard A4 width (in twips)
const LEFT_MARGIN = convertInchesToTwip(0.5);  // 0.5 inch left margin
const RIGHT_MARGIN = convertInchesToTwip(0.5); // 0.5 inch right margin

// Calculate usable width for text
const USABLE_WIDTH = PAGE_WIDTH - (LEFT_MARGIN + RIGHT_MARGIN);


function convertPtToHalfPt(pointSize) {
    // This normalizes Pt to this libraries odd concept of Half Points,
    // allowing us to just enter pt for font sizes.
    return pointSize * 2;
}

function pageConfiguration() {
    return {
        margin: {
            top: convertInchesToTwip(0.5),    // 0.5-inch top margin
            right: RIGHT_MARGIN,  // 0.5-inch right margin
            bottom: convertInchesToTwip(0.5), // 0.5-inch bottom margin
            left: LEFT_MARGIN,   // 0.5-inch left margin
        },
    }
}

function createBulletList(items) {
    return items.map(
        (item) =>
            new Paragraph({
                text: `${item}`,
                bullet: { level: 0 },
                font: "Times",
                size: convertPtToHalfPt(12),
            })
    );
}

function createContactInfo(jsonData) {
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: jsonData.personal_info.name,
                    bold: true,
                    size: convertPtToHalfPt(12),
                    font: "Times",
                }),
            ],
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `${jsonData.personal_info.email} | ${jsonData.personal_info.phone} | ${jsonData.personal_info.location}`,
                    size: convertPtToHalfPt(12),
                    font: "Times",
                }),
            ],
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `LinkedIn: ${jsonData.personal_info.linkedin} | GitHub: ${jsonData.personal_info.github}`,
                    size: convertPtToHalfPt(12),
                    font: "Times",
                }),
            ],
            alignment: AlignmentType.CENTER,
        }),
    ]
}

function createObjective(jsonData) {
    return [
        new Paragraph({
            children: [new TextRun({ text: "Objective", bold: true, size: convertPtToHalfPt(12), })],
            heading: "heading2",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
        }),
        new Paragraph({
            children: [new TextRun({ text: jsonData.objective, size: convertPtToHalfPt(12), })],
        }),
    ]
}

function createExperience(jsonData) {
    if(!jsonData.experience || jsonData.experience.length === 0) {
        return [];
    }
    return [
        new Paragraph({
            children: [new TextRun({ text: "Experience", bold: true, size: convertPtToHalfPt(12), })],
            heading: "heading2",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
        }),
        ...createExperienceItem(jsonData.experience)
    ]
}

function createExperienceItem(experience) {
    return [
        ...experience.flatMap((job) => [
            new Paragraph({
                tabStops: [
                    {
                        type: TabStopType.RIGHT,
                        position: USABLE_WIDTH,
                    },
                ],
                children: [
                    new TextRun({
                        text: job.company,
                        bold: true,
                        size: convertPtToHalfPt(12),
                    }),
                    new TextRun({
                        text: `\t${job.duration}`,
                        size: convertPtToHalfPt(12),
                    }),
                ],
                heading: "heading3",
            }),

            new Paragraph({
                tabStops: [
                    {
                        type: TabStopType.RIGHT,
                        position: USABLE_WIDTH,
                    },
                ],
                children: [
                    new TextRun({ text: job.position, italics: true, size: convertPtToHalfPt(12) }),
                    new TextRun({ text: `\t${job.location}`, italics: true, size: convertPtToHalfPt(12) })
                ],
            }),
            ...createBulletList(job.achievements),
        ]),
    ]
}

function createProjects(jsonData) {
    if(!jsonData.projects || jsonData.projects.length === 0) {
        return [];
    }
    return [
        new Paragraph({
            children: [new TextRun({ text: "Projects", bold: true, size: convertPtToHalfPt(12) })],
            heading: "heading2",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
        }),
        ...createProjectItem(jsonData.projects)
    ]
}

function createProjectItem(projects) {
    return [
        ...projects.flatMap((project) => [
            new Paragraph({
                tabStops: [
                    {
                        type: TabStopType.RIGHT,
                        position: USABLE_WIDTH,
                    },
                ],
                children: [
                    new TextRun({
                        text: project.name,
                        bold: true,
                        size: convertPtToHalfPt(12),
                    }),
                    new TextRun({
                        text: `\t${project.date}`,
                        bold: false,
                        size: convertPtToHalfPt(12),
                    }),
                ],
                heading: "heading3",
                spacing: { after: 100 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `GitHub: ${project.link}`, italics: true, size: convertPtToHalfPt(12) }),
                ],
                spacing: { after: 100 },
            }),
            ...createBulletList(project.description),
        ]),
    ]
}

function createEducation(jsonData) {
    if(!jsonData.education || jsonData.education.length === 0) {
        return [];
    }
    return [
        // Education
        new Paragraph({
            children: [new TextRun({ text: "Education", bold: true,  size: convertPtToHalfPt(12) })],
            heading: "heading2",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
        }),
        ...jsonData.education.map(
            (edu) =>
                new Paragraph({
                    tabStops: [
                        {
                            type: TabStopType.RIGHT,
                            position: USABLE_WIDTH,
                        },
                    ],
                    children: [
                        new TextRun({
                            text: `${edu.degree}, ${edu.university}`,
                            size: convertPtToHalfPt(12),
                        }),
                        new TextRun({
                            text: `\t${edu.years}`,
                            size: convertPtToHalfPt(12),
                        }),
                    ],
                })
        ),
    ]
}

function createSkills(jsonData) {
    return [
        new Paragraph({
            children: [new TextRun({ text: "Skills", bold: true, size: convertPtToHalfPt(12) })],
            heading: "heading2",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
        }),
        new Paragraph({
            children: [new TextRun({ text: "Technical Skills:", bold: true, size: convertPtToHalfPt(12) })],
        }),
        new Paragraph({
            children: [new TextRun({ text: jsonData.skills.technical.join(", "), size: convertPtToHalfPt(12) })],
            spacing: { after: 100 },
        }),
        new Paragraph({
            children: [new TextRun({ text: "Non-Technical Skills:", bold: true, size: convertPtToHalfPt(12) })],
        }),
        new Paragraph({
            children: [
                new TextRun({ text: jsonData.skills.non_technical.join(", "), size: convertPtToHalfPt(12) }),
            ],
            spacing: { after: 100 },
        }),
    ]
}

function generateResume(jsonData) {
    return new Document({
        sections: [
            {
                properties: {
                    page: pageConfiguration()
                },
                headers: {
                    default: new Header({
                        children: createContactInfo(jsonData),
                    }),
                },
                children: [
                    // Objective
                    ...createObjective(jsonData),
                    // Experience
                    ...createExperience(jsonData),
                    // Projects
                    ...createProjects(jsonData),
                    // Education
                    ...createEducation(jsonData),
                    // Skills
                    ...createSkills(jsonData),
                ],

            },
        ],
    });
}