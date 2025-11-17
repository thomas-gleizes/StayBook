import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { DomainEvent } from '../messaging/messaging.interface';
import { IProjectionHandler, PROJECTION_HANDLER_METADATA } from './projection.decorator';
import { RegistererService } from '../registerer/registerer.service';
import { BaseEvent } from '../interface/base-event.interface';

@Injectable()
export class ProjectionService implements OnModuleInit {
  private readonly logger = new Logger('Projection');

  private readonly projections = new Map<
    string,
    { event: Type<BaseEvent>; handler: IProjectionHandler<any> }
  >();

  constructor(private readonly register: RegistererService) {}

  onModuleInit() {
    this.registerProjections();
  }

  private registerProjections() {
    const results = this.register.findByMetadata<Type<BaseEvent>>(PROJECTION_HANDLER_METADATA);

    for (const [handler, event] of results) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.projections.set(event.name, { event: event, handler: handler.instance });
    }
  }

  async execute(event: DomainEvent) {
    const projection = this.projections.get(event.state.constructor.name);

    if (!projection) return this.logger.warn(`No projection found for ${event.contentType}`);

    console.log('Projection', projection);

    return await Promise.resolve();
  }
}
