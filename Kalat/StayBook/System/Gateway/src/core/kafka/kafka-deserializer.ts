import { Deserializer } from '@nestjs/microservices';

export class KafkaDeserializer implements Deserializer {
  deserialize(message) {
    console.log('deserialize', message);

    return {
      pattern: message.topic,
      data: JSON.parse(message.value.toString()),
    };
  }
}
