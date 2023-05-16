import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * This function is used to delay the execution of a function
 * @param ms - the number of milliseconds to delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * This function is used as a pre-validation hook to check the api key
 *
 * @param request - the request object
 * @param reply - the reply object
 */
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
