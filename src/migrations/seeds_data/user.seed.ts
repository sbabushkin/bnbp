import * as crypto from 'crypto';

const date = new Date().toISOString();

export const userSeed = [
  {
    id: '97e1f8ed-e9f0-459d-8c69-719ffa8fe7fb',
    first_name: 'Semyon',
    last_name: 'Babushkin',
    middle_name: '',
    login: 'babushkin.semyon',
    email: 'babushkin.semyon@gmail.com',
    phone: '+79670635441',
    status: 'active',
    created: date,
    updated: date,
    salt: crypto.randomBytes(16).toString('hex'),
  }
];
