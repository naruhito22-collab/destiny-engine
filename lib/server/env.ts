import 'server-only';

export function requireServerEnv(name:'OPENAI_API_KEY'|'DESTINY_SEED_SALT'){
  const value=process.env[name];
  if(!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}
