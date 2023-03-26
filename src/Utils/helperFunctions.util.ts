import { FastifyRequest, FastifyReply } from 'fastify';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function apiKeyPreValidation(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    reply.code(401).send(new Error('Unauthorized'));
  }
}

export default { delay, apiKeyPreValidation };
