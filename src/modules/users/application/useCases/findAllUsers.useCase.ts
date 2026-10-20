import { Injectable } from '@nestjs/common';
import { LogProvider } from '@modules/shared/domain/interface/logProvider.interface';
import { PaginatedResponse } from '@modules/shared/infrastructure/dto/paginatedResponse.dto';
import { UserRepository } from '@modules/users/domain/interfaces/userRepository.interface';
import { User } from '@modules/users/domain/models/user';
import { UserValues } from '@modules/users/domain/interfaces/userValues.interface';
import { FilterToFindUsers } from '@modules/users/domain/interfaces/filterToFind.interface';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    private readonly logger: LogProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async start(params: FilterToFindUsers): Promise<PaginatedResponse<UserValues>> {
    try {
      this.logger.debug(`INI | findAllUsers.useCase.ts - params:${JSON.stringify(params)}`, this.constructor.name);
      const users = await this.userRepository.findAll(params);
      const total = await this.userRepository.count();
      const { limit = 10, offset = 0 } = params;
      const page = Math.floor(offset / limit) + 1;
      const pageCount = Math.ceil((total || 0) / limit);

      const meta = {
        page: total ? page : 0,
        limit: total ? limit || 10 : 50,
        total: total || 0,
        pageCount: total ? pageCount : 0,
        hasPreviousPage: page > 1 || false,
        hasNextPage: page < pageCount || false,
      };

      this.logger.debug('END | findAllUsers.useCase.ts', this.constructor.name);
      return {
        data: users.length ? users.map((user: User) => user.getValues()) : [],
        meta: meta,
      };
    } catch (error) {
      this.logger.error(`ERROR | findAllUsers.useCase.ts error=${JSON.stringify(error)}`, this.constructor.name);
      throw error;
    }
  }
}
