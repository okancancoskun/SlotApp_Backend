import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectId,
  QueryRunner,
  Repository,
  SaveOptions,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class GenericService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  public async create(dto: DeepPartial<T>, options?: SaveOptions): Promise<T> {
    return this.repository.save(dto, options);
  }

  public async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return this.repository.update(criteria, partialEntity);
  }

  public async deleteOne(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectId
      | ObjectId[]
      | FindOptionsWhere<T>,
  ): Promise<DeleteResult> {
    return this.repository.delete(criteria);
  }

  public async findOne(options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOne(options);
  }

  public async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  public async query(query: string, params?: any[]): Promise<any> {
    return this.repository.query(query, params);
  }

  public async createQueryBuilder(
    alias?: string,
    queryRunner?: QueryRunner,
  ): Promise<SelectQueryBuilder<T>> {
    return this.repository.createQueryBuilder(alias, queryRunner);
  }

  public async decrement(
    options: FindOptionsWhere<T>,
    path: string,
    value: number,
  ): Promise<UpdateResult> {
    return this.repository.decrement(options, path, value);
  }

  public async increment(
    options: FindOptionsWhere<T>,
    path: string,
    value: number,
  ): Promise<UpdateResult> {
    return this.repository.increment(options, path, value);
  }
}
