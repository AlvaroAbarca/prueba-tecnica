import { CriteriaBase } from '@modules/shared/criteria/domain/criteriaBase.interface';

export interface FilterToFindUsers extends CriteriaBase {
  filter: {
    id?: number;
    rut?: string;
    email?: string | string[];
    firstName?: string | string[];
    lastName?: string | string[];
    authProvider?: string;
    enable2fa?: boolean;
    token?: string;
    search?: string;
    enabled?: string;
  };
}
