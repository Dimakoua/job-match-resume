// domain/template/template_factory.js
import { newUUID, fakeRandomSentence } from '../../factory.js';
import { Template } from './template.js';

export async function fakeTemplate(repo, opts = {}) {
  const template = new Template(
    opts.id || newUUID(),
    opts.name || fakeRandomSentence(2),
    opts.structure || [
      { type: 'personal', data: { name: '', email: '', phone: '' } },
      { type: 'experience', data: { company: '', position: '', description: '' } },
      { type: 'education', data: { school: '', degree: '' } }
    ]
  );

  if (opts.persisted) {
    await repo.save(template);
  }

  return template;
}