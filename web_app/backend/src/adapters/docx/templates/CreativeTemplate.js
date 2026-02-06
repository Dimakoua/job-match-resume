import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableCell, TableRow, WidthType, VerticalAlign, HeightRule } from 'docx';

export class CreativeTemplate {
  /**
   * Generates a DOCX buffer from resume data using the Creative template style
   * Matches Vue component: ResumeTemplateCreative.vue
   * Features: Two-column layout with sidebar, rotated photo, skill bars, timeline
   * @param {Resume} resume - The resume entity to convert to DOCX
   * @returns {Promise<Uint8Array>} - DOCX buffer as Uint8Array
   */
  async generate(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    const sections = resume.sections || {};

    // Extract styles
    const style = resume.style || {};

    const fontFamily = 'Inter';
    const headingFontFamily = 'Inter';
    const fontSize = style.fontSize || 11;

    // Color parsing
    const parseHexColor = (hex) => {
      if (!hex || typeof hex !== 'string') return '2463EB';
      const cleanHex = hex.replace('#', '');
      return cleanHex.length === 6 ? cleanHex.toUpperCase() : '2463EB';
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = '222222';
    const grayColor = '666666';
    const lightGrayColor = 'E5E5E5';

    const docSections = [];

    // Create main table for two-column layout
    const sidebarWidth = 30; // percentage
    const mainWidth = 70; // percentage

    // Sidebar content
    const sidebarChildren = [];

    // Profile section
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: fullName,
            font: headingFontFamily,
            size: 54, // 27pt
            bold: true,
            color: textColor
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    if (resume.title) {
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.title.toUpperCase(),
              font: headingFontFamily,
              size: 26, // 13pt
              bold: true,
              color: accentColor
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Contact section
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'CONTACT',
            font: headingFontFamily,
            size: 20, // 10pt
            bold: true,
            color: textColor
          })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        border: {
          bottom: {
            color: accentColor,
            space: 1,
            size: 1,
            value: BorderStyle.SINGLE
          }
        },
        spacing: { after: 200 }
      })
    );

    const contactItems = [];
    if (resume.email) contactItems.push(`• ${resume.email.toLowerCase()}`);
    if (resume.phone) contactItems.push(`• ${resume.phone}`);
    if (resume.location) contactItems.push(`• ${resume.location}`);

    for (const contact of contactItems) {
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contact,
              font: fontFamily,
              size: 20, // 10pt
              color: grayColor
            })
          ],
          spacing: { after: 100 }
        })
      );
    }

    // Skills section
    sidebarChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'CORE SKILLS',
            font: headingFontFamily,
            size: 20, // 10pt
            bold: true,
            color: textColor
          })
        ],
        spacing: { after: 100, before: 300 }
      }),
      new Paragraph({
        border: {
          bottom: {
            color: accentColor,
            space: 1,
            size: 1,
            value: BorderStyle.SINGLE
          }
        },
        spacing: { after: 200 }
      })
    );

    const skills = sections.skills || [];
    const topSkills = skills.slice(0, 3);

    for (const skill of topSkills) {
      const skillName = skill.name || skill;
      const skillLevel = skill.level || '85%';
      const levelValue = parseInt(skillLevel.replace('%', '')) || 85;

      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: skillName,
              font: fontFamily,
              size: 18, // 9pt
              bold: true,
              color: textColor
            }),
            new TextRun({
              text: ` ${levelValue}%`,
              font: fontFamily,
              size: 18, // 9pt
              bold: true,
              color: accentColor
            })
          ],
          spacing: { after: 50 }
        }),
        // Progress bar (simplified as text)
        new Paragraph({
          children: [
            new TextRun({
              text: '█'.repeat(Math.floor(levelValue / 10)) + '░'.repeat(10 - Math.floor(levelValue / 10)),
              font: 'Courier New',
              size: 16, // 8pt
              color: accentColor
            })
          ],
          spacing: { after: 150 }
        })
      );
    }

    // Additional skills as tags
    const remainingSkills = skills.slice(3);
    if (remainingSkills.length > 0) {
      const skillTags = remainingSkills.map(skill => skill.name || skill).join(' • ');
      sidebarChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: skillTags,
              font: fontFamily,
              size: 18, // 9pt
              bold: true,
              color: 'FFFFFF'
            })
          ],
          shading: {
            fill: accentColor
          },
          spacing: { after: 200 }
        })
      );
    }

    // Main content
    const mainChildren = [];

    // Profile summary
    const summary = sections.summary;
    if (summary) {
      mainChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '●',
              font: fontFamily,
              size: 24, // 12pt
              color: accentColor
            }),
            new TextRun({
              text: ' Profile',
              font: headingFontFamily,
              size: 30, // 15pt
              bold: true,
              color: textColor
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: summary,
              font: 'Times New Roman',
              size: 22, // 11pt
              italics: true,
              color: grayColor
            })
          ],
          spacing: { after: 300 }
        })
      );
    }

    // Experience section
    const experience = sections.experience || [];
    if (experience.length > 0) {
      mainChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '●',
              font: fontFamily,
              size: 24, // 12pt
              color: accentColor
            }),
            new TextRun({
              text: ' Experience',
              font: headingFontFamily,
              size: 30, // 15pt
              bold: true,
              color: textColor
            })
          ],
          spacing: { after: 300 }
        })
      );

      for (const exp of experience) {
        const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
        const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;

        mainChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '●',
                font: fontFamily,
                size: 16, // 8pt
                color: accentColor
              }),
              new TextRun({
                text: ` ${titleLine}`,
                font: fontFamily,
                size: 22, // 11pt
                bold: true,
                color: textColor
              }),
              new TextRun({
                text: ` ${dateRange}`,
                font: fontFamily,
                size: 18, // 9pt
                bold: true,
                color: grayColor
              })
            ],
            indent: { left: 360 }, // 0.25 inch
            spacing: { after: 100 }
          })
        );

        if (exp.description) {
          mainChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  font: fontFamily,
                  size: 20, // 10pt
                  color: grayColor
                })
              ],
              indent: { left: 360 },
              spacing: { after: 200 }
            })
          );
        }
      }
    }

    // Projects section
    const projects = sections.projects || [];
    if (projects.length > 0) {
      mainChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '●',
              font: fontFamily,
              size: 24, // 12pt
              color: accentColor
            }),
            new TextRun({
              text: ' Recent Projects',
              font: headingFontFamily,
              size: 30, // 15pt
              bold: true,
              color: textColor
            })
          ],
          spacing: { after: 300 }
        })
      );

      // Create a table for projects grid
      const projectRows = [];
      for (let i = 0; i < projects.length; i += 2) {
        const rowCells = [];

        for (let j = 0; j < 2 && i + j < projects.length; j++) {
          const project = projects[i + j];
          const projectContent = [
            new Paragraph({
              children: [
                new TextRun({
                  text: project.name || '',
                  font: fontFamily,
                  size: 20, // 10pt
                  bold: true,
                  color: textColor
                })
              ],
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Project',
                  font: 'Times New Roman',
                  size: 18, // 9pt
                  italics: true,
                  color: grayColor
                })
              ],
              spacing: { after: 50 }
            })
          ];

          if (project.description) {
            const descWords = project.description.split(' ').slice(0, 15).join(' ');
            projectContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: descWords + (project.description.split(' ').length > 15 ? '...' : ''),
                    font: fontFamily,
                    size: 18, // 9pt
                    color: grayColor
                  })
                ]
              })
            );
          }

          rowCells.push(
            new TableCell({
              children: projectContent,
              margins: {
                top: 200,
                bottom: 200,
                left: 200,
                right: 200
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: lightGrayColor },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: lightGrayColor },
                left: { style: BorderStyle.SINGLE, size: 1, color: lightGrayColor },
                right: { style: BorderStyle.SINGLE, size: 1, color: lightGrayColor }
              }
            })
          );
        }

        // Fill empty cells if needed
        while (rowCells.length < 2) {
          rowCells.push(
            new TableCell({
              children: [],
              margins: {
                top: 200,
                bottom: 200,
                left: 200,
                right: 200
              }
            })
          );
        }

        projectRows.push(new TableRow({ children: rowCells }));
      }

      mainChildren.push(
        new Table({
          rows: projectRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          borders: {
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          }
        })
      );
    }

    // Education section
    const education = sections.education || [];
    if (education.length > 0) {
      mainChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '●',
              font: fontFamily,
              size: 24, // 12pt
              color: accentColor
            }),
            new TextRun({
              text: ' Education',
              font: headingFontFamily,
              size: 30, // 15pt
              bold: true,
              color: textColor
            })
          ],
          spacing: { after: 300, before: 300 }
        })
      );

      for (const edu of education) {
        const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
        const dateRange = `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' — ' : ''}${edu.endDate || ''}`;

        mainChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: degreeLine,
                font: fontFamily,
                size: 22, // 11pt
                bold: true,
                color: textColor
              }),
              new TextRun({
                text: ` ${dateRange}`,
                font: 'Times New Roman',
                size: 18, // 9pt
                italics: true,
                color: accentColor
              })
            ],
            spacing: { after: 50 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: edu.school || '',
                font: fontFamily,
                size: 20, // 10pt
                color: grayColor
              })
            ],
            spacing: { after: 200 }
          })
        );
      }
    }

    // Create the main table with sidebar and content
    const mainTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: sidebarChildren,
              width: {
                size: sidebarWidth,
                type: WidthType.PERCENTAGE
              },
              margins: {
                top: 400,
                bottom: 400,
                left: 400,
                right: 400
              },
              shading: {
                fill: 'F5F5F5'
              }
            }),
            new TableCell({
              children: mainChildren,
              width: {
                size: mainWidth,
                type: WidthType.PERCENTAGE
              },
              margins: {
                top: 400,
                bottom: 400,
                left: 400,
                right: 400
              }
            })
          ]
        })
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      }
    });

    docSections.push(
      new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { after: 0 }
      }),
      mainTable
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections
      }]
    });

    // Generate and return buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}