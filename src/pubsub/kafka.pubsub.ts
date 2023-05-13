// import * as Kafka from 'node-rdkafka';
// import { PubSubEngine } from 'graphql-subscriptions';
// import Debug from 'debug';
//
// const infoDebug = Debug('pubsub:kafka:info');
// const errorDebug = Debug('pubsub:kafka:error');
//
// export interface IKafkaOptions {
//   topic: string;
//   host: string;
//   port: string;
//   groupId?: any;
//   globalConfig?: object;
// }
//
// export class KafkaPubsub extends PubSubEngine {
//   protected producer: any;
//
//   protected consumer: any;
//
//   protected options: any;
//
//   protected subscriptionMap: { [subId: number]: [string, Function] };
//
//   protected channelSubscriptions: { [channel: string]: number[] };
//
//   constructor(options: IKafkaOptions) {
//     super();
//     this.options = options;
//     this.subscriptionMap = {};
//     this.channelSubscriptions = {};
//     this.consumer = this.createConsumer(this.options.topic);
//   }
//
//   public async publish(channel: string, payload: any): Promise<any> {
//     // only create producer if we actually publish something
//
//     infoDebug(`published to channel ${channel} message ${JSON.stringify(payload)}`);
//
//     const data = Buffer.from(JSON.stringify({ payload, channel }));
//     this.producer = this.producer || this.createProducer(this.options.topic);
//
//     /**
//      * https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
//      * The return value is true if the internal buffer is less than the highWaterMark configured when the stream was created after admitting chunk.
//      * If false is returned, further attempts to write data to the stream should stop until the 'drain' event is emitted.
//
//      * While a stream is not draining, calls to write() will buffer chunk, and return false.
//      * Once all currently buffered chunks are drained (accepted for delivery by the operating system),
//      * the 'drain' event will be emitted.
//      * It is recommended that once write() returns false, no more chunks be written until the 'drain' event is emitted.
//      */
//
//     return new Promise((resolve) => {
//       const success = this.producer.write(data);
//       if (success) {
//         resolve(true);
//       } else {
//         this.producer.once('drain', () => {
//           resolve(true);
//         });
//       }
//     });
//   }
//
//   public subscribe(
//     channel: string,
//     onMessage: Function,
//     options?: Object,
//   ): Promise<number> {
//     const index = Object.keys(this.subscriptionMap).length;
//
//     this.subscriptionMap[index] = [channel, onMessage];
//     this.channelSubscriptions[channel] = [
//       ...(this.channelSubscriptions[channel] || []), index,
//     ];
//
//     infoDebug(`subscribed to channel: ${channel}`);
//     return Promise.resolve(index);
//   }
//
//   public unsubscribe(index: number) {
//     const [channel] = this.subscriptionMap[index];
//     this.channelSubscriptions[channel] = this.channelSubscriptions[channel].filter((subId) => subId !== index);
//   }
//
//   private onMessage(channel: string, message: any) {
//     const subscriptions = this.channelSubscriptions[channel];
//     if (!subscriptions) { return; } // no subscribers, don't publish msg
//     for (const subId of subscriptions) {
//       const [, listener] = this.subscriptionMap[subId];
//       listener(message);
//     }
//   }
//
//   brokerList() {
//     return this.options.port ? `${this.options.host}:${this.options.port}` : this.options.host;
//   }
//
//   private createProducer(topic: string) {
//     const producer = Kafka.createWriteStream(
//       { 'metadata.broker.list': this.brokerList(), ...this.options.globalConfig },
//       {},
//       { topic },
//     );
//     producer.on('error', (err) => {
//       errorDebug(err, 'Error in kafka producer stream');
//     });
//     return producer;
//   }
//
//   private createConsumer(topic: string) {
//     // Create a group for each instance. The consumer will receive all messages from the topic
//     const groupId = this.options.groupId || Math.ceil(Math.random() * 9999);
//     const consumer = Kafka.createReadStream(
//       {
//
//         'group.id': `kafka-group-${groupId}`,
//         'metadata.broker.list': this.brokerList(),
//         ...this.options.globalConfig,
//       },
//       {},
//       { topics: [topic] },
//     );
//     consumer.on('data', (message: any) => {
//       let content;
//       try {
//         content = JSON.parse(message.value.toString());
//       } catch (e) {
//         errorDebug(e, `Kafka consumer: cannot parse payload: ${message.value.toString()}`);
//       }
//
//       // Using channel abstraction
//       if (content.payload && content.channel) {
//         this.onMessage(content.channel, content.payload);
//       }
//     });
//
//     consumer.on('error', (err) => {
//       errorDebug(err, 'Error in our kafka consumer stream');
//     });
//
//     consumer.consumer.on('event.error', (err) => {
//       errorDebug(err, 'Consumer error');
//     });
//
//     return consumer;
//   }
// }
