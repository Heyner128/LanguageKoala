import { CreateTokenSchema, TokenType } from '../Models/tokens.dto.js';
import TokensController from '../Controllers/tokens.controller.js';
import Server from '../server.js';
import HelperFunctions from '../Utils/functions.util.js';
import { ApiHeaders } from '../Utils/types.util.js';

/**
 * Adds the tokens routes, and adds the hooks of pre-validation and validation to fastify
 */
function init() {
  Server.httpServer.post<{
    Body: TokenType;
    Reply: TokenType;
    Headers: ApiHeaders;
  }>(
    '/tokens',
    {
      schema: CreateTokenSchema,
      preValidation: HelperFunctions.apiKeyPreValidation,
    },
    TokensController.createToken
  );
  Server.logger.info('Tokens routes initialized');
}

export default { init };
