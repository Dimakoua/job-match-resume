export class Resume {
  constructor(id, title, templateId = null, sections = []) {
    this.id = id;
    this.title = title;
    this.templateId = templateId;
    this.sections = sections;
  }

  // Pure logic: No API calls here
  validate() {
    if (!this.title) throw new Error("Title is required");
  }
}