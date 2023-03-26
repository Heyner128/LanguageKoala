import { CreateTokenSchema, TokenType } from '../Models/tokens.dto';
import TokensController from '../Controllers/tokens.controller';
import Server from '../server';
import HelperFunctions from '../Utils/helperFunctions.util';
import { ApiHeaders } from '../Utils/types.util';

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
