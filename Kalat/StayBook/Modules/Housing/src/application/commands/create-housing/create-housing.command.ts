import { ICommand } from '@nestjs/cqrs';

export class CreateHousing implements ICommand {
  constructor(public readonly title: string) {}
}
