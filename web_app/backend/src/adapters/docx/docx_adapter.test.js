import { describe, it, expect } from "vitest";
import { DocxAdapter } from "./docx_adapter.js";

describe("DocxAdapter", () => {
  const adapter = new DocxAdapter();

  describe("generateBuffer", () => {
    it("should generate a DOCX buffer for a valid resume with object sections", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Software Engineer Resume",
        sections: {
          layout: { template: "professional" },
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "https://linkedin.com/in/johndoe",
          summary: "Experienced software engineer with 5 years of experience in web development.",
          experience: [
            {
              position: "Senior Developer",
              company: "Tech Corp",
              duration: "2020-01 to 2023-12",
              location: "San Francisco, CA",
              achievements: ["Led development of web applications", "Mentored junior developers"]
            },
            {
              position: "Developer",
              company: "Startup Inc",
              duration: "2019-01 to 2020-12",
              location: "Remote",
              achievements: ["Built REST APIs", "Implemented CI/CD pipelines"]
            }
          ],
          education: [
            {
              degree: "Bachelor of Science in Computer Science",
              university: "University of Technology",
              years: "2015-2019"
            }
          ],
          skills: ["JavaScript", "React", "Node.js", "Python", "AWS"]
        },
        templateId: "professional",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const buffer = await adapter.generateBuffer(resume);

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);

      // DOCX files are ZIP archives, so they start with PK
      const docxHeader = String.fromCharCode(...buffer.slice(0, 2));
      expect(docxHeader).toBe("PK");
    });

    it("should throw error for invalid resume data", async () => {
      await expect(adapter.generateBuffer(null)).rejects.toThrow("Resume data is required");
      await expect(adapter.generateBuffer({})).rejects.toThrow("Resume must have sections object");
      await expect(adapter.generateBuffer({ sections: null })).rejects.toThrow("Resume must have sections object");
    });

    it("should handle minimal resume with only personal info", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Basic Resume",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com"
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);

      const docxHeader = String.fromCharCode(...buffer.slice(0, 2));
      expect(docxHeader).toBe("PK");
    });

    it("should handle resume without optional fields", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Incomplete Resume",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Bob",
          lastName: "Johnson"
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty arrays in sections", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Empty Arrays",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Alice",
          lastName: "Brown",
          experience: [],
          education: [],
          skills: []
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle multiple experience entries", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Multiple Jobs",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Charlie",
          lastName: "Davis",
          experience: [
            {
              position: "Senior Developer",
              company: "Company A",
              duration: "2022-01 to Present",
              achievements: ["Achievement 1", "Achievement 2"]
            },
            {
              position: "Developer",
              company: "Company B",
              duration: "2020-01 to 2022-12",
              achievements: ["Achievement 3"]
            },
            {
              position: "Junior Developer",
              company: "Company C",
              duration: "2019-01 to 2020-12",
              achievements: ["Started learning"]
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle multiple education entries", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Multiple Degrees",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Diana",
          lastName: "Evans",
          education: [
            {
              degree: "Master of Science in Computer Science",
              university: "MIT",
              years: "2021-2023"
            },
            {
              degree: "Bachelor of Science in Computer Science",
              university: "Stanford",
              years: "2017-2021"
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle skills as array", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Skills",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Eve",
          lastName: "Frank",
          skills: ["JavaScript", "TypeScript", "React", "Vue.js", "Python", "Java", "C++"]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle summary section", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Summary",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Frank",
          lastName: "Garcia",
          summary: "Passionate developer with expertise in full-stack development and cloud architecture."
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle new experience structure with title and startDate/endDate", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with New Experience Structure",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Grace",
          lastName: "Hopper",
          experience: [
            {
              title: "Senior Full-Stack Developer",
              company: "Tech Innovations Inc",
              startDate: "06/2023",
              endDate: "Present",
              location: "Toronto, ON",
              description: "Led development of scalable web applications using React and Node.js. Improved performance by 40% and mentored junior developers."
            },
            {
              title: "Full-Stack Developer",
              company: "Startup Co",
              startDate: "04/2022",
              endDate: "06/2023",
              location: "Remote",
              description: "Built RESTful APIs and implemented CI/CD pipelines. Collaborated with cross-functional teams to deliver high-quality software."
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle new education structure with school and startDate/endDate", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with New Education Structure",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Helen",
          lastName: "Keller",
          education: [
            {
              school: "University of Toronto",
              degree: "Master of Science",
              field: "Computer Science",
              startDate: "2021",
              endDate: "2023",
              location: "Toronto, ON"
            },
            {
              school: "McGill University",
              degree: "Bachelor of Science",
              field: "Software Engineering",
              startDate: "2017",
              endDate: "2021",
              location: "Montreal, QC"
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle certifications section", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Certifications",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Ian",
          lastName: "Johnson",
          certifications: [
            {
              name: "AWS Certified Solutions Architect",
              issuer: "Amazon Web Services",
              date: "2023"
            },
            {
              name: "Certified Kubernetes Administrator",
              issuer: "Cloud Native Computing Foundation",
              date: "2022"
            },
            {
              name: "SAFe 5 Agilist",
              issuer: "Scaled Agile",
              date: "2021"
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle projects section", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Projects",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Jack",
          lastName: "Kim",
          projects: [
            {
              name: "E-commerce Platform",
              description: "Built a full-stack e-commerce platform using React, Node.js, and PostgreSQL. Implemented payment processing with Stripe and deployed on AWS.",
              link: "https://github.com/jackkim/ecommerce"
            },
            {
              name: "Task Management App",
              description: "Developed a real-time task management application with WebSocket integration. Used React for frontend and Express.js for backend.",
              link: "https://github.com/jackkim/taskapp"
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle backward compatibility with old experience structure", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Old Structure",
        sections: {
          layout: {
            template: "modern"
          },
          firstName: "Kevin",
          lastName: "Lee",
          experience: [
            {
              position: "Senior Developer",
              company: "Old Company",
              duration: "2020-01 to 2023-12",
              location: "San Francisco, CA",
              achievements: ["Led team", "Improved performance"]
            }
          ],
          education: [
            {
              degree: "Bachelor of Science",
              university: "Old University",
              years: "2015-2019"
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});