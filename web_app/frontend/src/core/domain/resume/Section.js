export class Section {
  constructor(type, content) {
    this.type = type; // e.g., 'personal', 'experience'
    this.content = content;
  }

  // Pure logic
  validate() {
    if (!this.type) throw new Error("Type is required");
  }
}