import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Base } from './base.entity';
import { lowercaseFirstLetter } from '../../utils/common';

@Injectable()
export class BaseService {
  async queryEntity(
    repository: Repository<Base>,
    query: any,
  ): Promise<{ result: Base[]; count: number }> {
    const entityName = lowercaseFirstLetter(repository.metadata.name);

    const qb = repository.createQueryBuilder(entityName);

    const excludedColumns = {
      search: ['id', 'createdAt', 'updatedAt', 'deletedAt'],
      order: [],
      select: ['deletedAt', 'updatedAt'],
    };

    if (entityName === 'user') {
      excludedColumns.order.push('password', 'blockedAt');
      excludedColumns.search.push('password', 'blockedAt');
      excludedColumns.select.push('identifier', 'blockedAt');

      if (query.rolesToInclude?.length || query.rolesToExclude?.length) {
        qb.leftJoin(`user.role`, 'role');
      }
    }

    const columns = repository.metadata.nonVirtualColumns.map(
      (column) => column.propertyName,
    );
    const columnsToSearch = columns.filter(
      (column) => !excludedColumns.search.includes(column),
    );
    const columnsToOrder = columns.filter(
      (column) => !excludedColumns.order.includes(column),
    );

    const columnsToSelect = columns
      .filter((column) => !excludedColumns.select.includes(column))
      .map((column) => `${entityName}.${column}`);

    // add relations and check if user has access
    if (entityName === 'orderProcess') {
      qb.leftJoin(`${entityName}.users`, 'user');

      columnsToSelect.push(
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.lastName',
      );
    }

    qb.where(
      new Brackets((expression) => {
        if (query.startDate || query.endDate) {
          if (query.startDate) {
            expression.andWhere(`${entityName}.createdAt >= :startDate`, {
              startDate: query.startDate,
            });
          }
          if (query.endDate) {
            expression.andWhere(`${entityName}.createdAt <= :endDate`, {
              endDate: query.endDate,
            });
          }
        }
        if (query.search) {
          const searchColumns =
            query.searchBy && columnsToSearch.includes(query.searchBy)
              ? [query.searchBy]
              : columnsToSearch;

          expression.andWhere(
            new Brackets((exp) => {
              searchColumns.forEach((column) => {
                exp.orWhere(`${entityName}.${column} ILIKE :criteria`, {
                  criteria: `%${query.search}%`,
                });
              });
            }),
          );
        }
        if (query.rolesToExclude?.length) {
          expression.andWhere('role.name NOT IN (:...names)', {
            names: query.rolesToExclude,
          });
        }
        if (query.rolesToInclude?.length) {
          expression.andWhere('role.name IN (:...names)', {
            names: query.rolesToInclude,
          });
        }
      }),
    );

    qb.select(columnsToSelect);

    if (query.limit) {
      qb.take(query.limit);
      if (query.offset) {
        qb.skip(query.offset);
      }
    }

    if (
      query.orderBy &&
      query.orderDirection &&
      columnsToOrder.includes(query.orderBy)
    ) {
      qb.orderBy(`${entityName}.${query.orderBy}`, query.orderDirection);
    } else {
      qb.orderBy(`${entityName}.createdAt`, 'ASC');
    }

    // console.log(qb.getSql());

    const [result, count] = await qb.getManyAndCount();
    return { result, count };
  }
}
