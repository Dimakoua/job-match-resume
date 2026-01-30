export class User {
  constructor(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  // Pure logic: No API calls here
  validate() {
    if (!this.email) throw new Error("Email is required");
    if (!this.name) throw new Error("Name is required");
  }
}