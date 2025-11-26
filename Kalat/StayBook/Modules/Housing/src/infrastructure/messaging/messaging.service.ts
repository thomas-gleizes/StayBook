import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RawActionMessage } from './messaging.interface';
import { randomUUID } from 'crypto';
import { Serializer } from '@staybook/seralizer';

@Injectable()
export class MessagingService implements OnModuleInit {
  constructor(
    @Inject('MESSAGING_CONNECTION')
    private readonly client: ClientKafka,
    private readonly serializer: Serializer,
  ) {}

  async onModuleInit() {
    this.client.subscribeToResponseOf('Kalat.StayBook.Modules.UserManagement.v1.query.FindUserQuery');
    await this.client.connect();
  }

  private async sendRequest(payload: Buffer) {
    const type = 'Kalat.StayBook.Modules.UserManagement.v1.query.FindUserQuery';

    const message: RawActionMessage = {
      id: randomUUID(),
      contentType: type,
      correlationId: randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: 'TODO',
      metadata: JSON.stringify({ tenantId: randomUUID() }),
      payload: payload,
      replyTo: `${type}.reply`,
    };

    const serializedMessage = await this.serializer.serializeMessage(message);

    return firstValueFrom(
      this.client.send('Kalat.StayBook.Modules.UserManagement.v1.query.FindUserQuery', serializedMessage),
    );
  }

  async findUser(userId: string) {
    const query = await this.serializer.serializeQuery({ userId });

    return this.sendRequest(query);
  }
}
