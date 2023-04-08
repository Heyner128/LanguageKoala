import { CreateTokenSchema, TokenType } from '../Models/tokens.dto';
import TokensController from '../Controllers/tokens.controller';
import Server from '../server';
import HelperFunctions from '../Utils/functions.util';
import { ApiHeaders } from '../Utils/types.util';

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
